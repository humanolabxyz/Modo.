import {newId} from '../../industria/model/defaults.ts'; // reutilizado: mismo generador de ids estables que Industria
import {DEFAULT_GENERATOR_VERSION} from '../terrain/generators.ts';
import {CURRENT_VERSION, FORMAT, type Pose, type WorldProject} from './types.ts';

export {newId};
export const IDENTITY_POSE: Pose = {position: [0, 0, 0], rotation: [0, 0, 0]};

/** Semilla de 31 bits (entera y positiva) para el terreno y para la simulación. */
export const newSeed = (): number => {
  const c = globalThis.crypto;
  if (c?.getRandomValues) return c.getRandomValues(new Uint32Array(1))[0] >>> 1;
  return Math.floor(Math.random() * 0x7fffffff);
};

/** Mundo vacío: 100 ha visibles, ninguna cultivada, sin entidades. Es un contenedor válido, no un escenario jugable (eso llega en fases posteriores). */
export function newWorld(name = 'Mundo sin nombre', options: {seed?: number; now?: string} = {}): WorldProject {
  const now = options.now ?? new Date().toISOString();
  const seed = options.seed ?? newSeed();
  return {
    format: FORMAT,
    version: CURRENT_VERSION,
    id: newId('w'),
    name,
    createdAt: now,
    updatedAt: now,
    experience: 'free',
    scenario: {origin: 'blank', label: 'Mundo en blanco', provenance: 'user', land: {visibleHa: 100, administeredHa: 0, authorizedHa: 0, cultivatedHa: 0}, territory: 'free'},
    terrain: {sizeMeters: [1000, 1000], cellMeters: 2, seed, generatorVersion: DEFAULT_GENERATOR_VERSION, presetId: 'free', edits: []},
    clock: {simSeconds: 0, speed: 0, seed, startDate: '2026-09-21T08:00:00.000Z'},
    entities: [],
    connections: [],
  };
}
