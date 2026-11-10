import {newWorld} from '../model/defaults.ts';
import type {Entity, ExperienceMode, Result, TerrainEdit, TerrainParameters, TerritoryId, WorldProject} from '../model/types.ts';
import {baseHeight} from '../terrain/heightfield.ts';
import {VALLEY_SEED} from '../terrain/generators.ts';
import {TERRITORIES} from '../terrain/presets.ts';
import {WorldSession} from './session.ts';

export const TEMPLATES = {blank: 'Mundo en blanco', farm: 'Granja productiva', greenhouse: 'Cultivo protegido'} as const;
export const SITES = {center: 'Centro', west: 'Oeste', east: 'Este'} as const;
export const RESOURCES = {parcel: 'Parcela', greenhouse: 'Invernadero', irrigation: 'Riego conectado', solar: 'Panel solar'} as const;
export type Resource = keyof typeof RESOURCES;
export type WorldSetup = {
  name: string; seed: number; template: keyof typeof TEMPLATES; territory: TerritoryId; terrainParams?: TerrainParameters;
  side: number; site: keyof typeof SITES; relief: 'natural' | 'level'; radius: number;
  resources: Resource[]; water: number; experience: ExperienceMode; start: string;
};

export function siteX(site: WorldSetup['site']) {
  return site === 'west' ? -60 : site === 'east' ? 60 : 0;
}

export function setupTerrain(setup: WorldSetup, cellMeters = 2): WorldProject['terrain'] {
  const {side, relief, radius} = setup, x = siteX(setup.site);
  const legacy = !setup.terrainParams && (setup.territory === 'free' || setup.territory === 'valley');
  const seed = legacy && setup.territory === 'valley' ? VALLEY_SEED : setup.seed, generatorVersion = legacy ? 1 : 2;
  const params = legacy ? undefined : {...(setup.terrainParams ?? TERRITORIES[setup.territory].params)};
  const edits: TerrainEdit[] = relief === 'level'
    ? [{id: 'emplazamiento', kind: 'level', center: [x, 0], radius, amount: baseHeight(seed, x, 0, side, side, generatorVersion, setup.territory, params), at: 0}]
    : [];
  return {sizeMeters: [side, side], cellMeters, seed, generatorVersion, presetId: setup.territory, ...(params && {params}), edits};
}

export function createConfiguredWorld(setup: WorldSetup): Result<WorldProject> {
  const terrain = setupTerrain(setup), world = newWorld(setup.name, {seed: terrain.seed});
  const visibleHa = setup.side ** 2 / 10_000;
  world.terrain = terrain;
  world.scenario = {
    origin: setup.template === 'blank' ? 'blank' : 'template',
    label: TEMPLATES[setup.template],
    provenance: 'fictional',
    territory: setup.territory,
    site: [siteX(setup.site), 0],
    land: {visibleHa, administeredHa: setup.resources.length ? 1 : 0, authorizedHa: 0, cultivatedHa: 0},
  };
  world.clock.startDate = setup.start + 'T08:00:00.000Z';

  const session = WorldSession.fromWorld(world), x = siteX(setup.site);
  const place = (id: string, dx: number, z: number) => {
    const r = session.place(id, x + dx, z, 0);
    if (!r.ok) throw new Error(r.error);
    return r.value;
  };
  const link = (a: Entity, ap: string, b: Entity, bp: string) => {
    const r = session.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp});
    if (!r.ok) throw new Error(r.error);
  };
  try {
    if (setup.resources.includes('parcel') || setup.resources.includes('irrigation')) place('parcela', 0, 16);
    if (setup.resources.includes('greenhouse')) place('invernadero', 20, 10);
    if (setup.resources.includes('solar')) place('panel-solar', 21, -7);
    if (setup.resources.includes('irrigation')) {
      const tank = place('estanque', -10, -8), intake = place('tuberia', -10, -3);
      const pump = place('bomba', -10, 2), outlet = place('tuberia', -10, 7), sprinkler = place('emisor', -10, 14);
      const grid = place('acometida', 8, -8), board = place('tablero', 8, -4);
      link(tank, 'salida', intake, 'a'); link(intake, 'b', pump, 'succion');
      link(pump, 'descarga', outlet, 'a'); link(outlet, 'b', sprinkler, 'entrada');
      link(grid, 'red', board, 'red'); link(board, 'salida-bomba', pump, 'alim');
      session.setState(tank.id, 'nivelL', setup.water * 100);
    }
    const experience = session.setExperience(setup.experience);
    if (!experience.ok) return experience;
    return {ok: true, value: session.toWorld()};
  } catch (error) {
    return {ok: false, error: 'No se pudo montar el conjunto inicial. Prueba nivelar el emplazamiento o cambiar el terreno. ' + (error instanceof Error ? error.message : '')};
  }
}
