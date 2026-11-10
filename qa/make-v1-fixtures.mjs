// Etapa 0 (consolidación 3D): genera mundos de referencia V1 de Agro y registra sus sumas de verificación.
// SOLO LECTURA sobre el código del producto: importa `src/agro` y escribe únicamente en la carpeta de salida indicada.
// Uso: node qa/make-v1-fixtures.mjs <carpeta-de-salida>      Node 24 ejecuta los .ts directamente.
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {TerrainModel} from '../src/agro/terrain/model.ts';
import {exportWorld, parseWorld, parseWorldText} from '../src/agro/model/validate.ts';
import {CURRENT_VERSION} from '../src/agro/model/types.ts';

const out = process.argv[2]; if (!out) { console.error('Falta la carpeta de salida.'); process.exit(2); }
mkdirSync(out, {recursive: true});
const FIXED = '2026-11-01T08:00:00.000Z';
const must = (r, what) => { if (!r.ok) throw new Error(`${what}: ${r.error}`); return r.value; };
const base = {side: 1000, site: 'center', relief: 'natural', radius: 60, water: 80, experience: 'free', start: '2026-09-21'};
const pin = (w, id, name) => ({...w, id, name, createdAt: FIXED, updatedAt: FIXED});

// Generador pseudoaleatorio simple y propio (no depende del producto) para ediciones reproducibles.
let st = 20261101; const rnd = () => ((st = (Math.imul(st, 1664525) + 1013904223) >>> 0) / 4294967296);

const SPECS = [
  {key: 'v1-01-libre-vacio', name: 'Ref V1 · libre vacío', make: () => pin(must(createConfiguredWorld({...base, name: 'x', seed: 12345, template: 'blank', territory: 'free', resources: []}), 'crear'), 'ref-v1-01', 'Ref V1 · libre vacío')},
  {key: 'v1-02-valle-granja', name: 'Ref V1 · valle con granja', make: () => {
    const w = pin(must(createConfiguredWorld({...base, name: 'x', seed: 777, template: 'farm', territory: 'valley', resources: ['parcel', 'irrigation', 'solar']}), 'crear'), 'ref-v1-02', 'Ref V1 · valle con granja');
    const s = WorldSession.fromWorld(w); const parcel = s.entities.find(e => e.type === 'parcela');
    must(s.plant(parcel.id, 'tomate'), 'sembrar'); return s.toWorld(FIXED);
  }},
  {key: 'v1-03-real-economia', name: 'Ref V1 · modo real con economía', make: () => {
    const w = pin(must(createConfiguredWorld({...base, name: 'x', seed: 4242, template: 'farm', territory: 'free', experience: 'real', resources: ['parcel', 'irrigation']}), 'crear'), 'ref-v1-03', 'Ref V1 · modo real con economía');
    const s = WorldSession.fromWorld(w); must(s.buy('estanque', 2), 'comprar'); must(s.buy('bomba', 1), 'comprar'); s.advance(3 * 86400); return s.toWorld(FIXED);
  }},
  {key: 'v1-04-terreno-editado-conectado', name: 'Ref V1 · 30 ediciones de terreno y red conectada', make: () => {
    const w = pin(must(createConfiguredWorld({...base, name: 'x', seed: 9001, template: 'farm', territory: 'free', resources: ['parcel', 'irrigation', 'greenhouse']}), 'crear'), 'ref-v1-04', 'Ref V1 · 30 ediciones de terreno y red conectada');
    const s = WorldSession.fromWorld(w); const kinds = ['raise', 'lower', 'level'];
    for (let i = 0; i < 30; i++) { // lejos de la finca (|x|,|z| > 150) para no mover piezas: las ediciones cerca de piezas se prueban en la Etapa 2
      const x = (rnd() < 0.5 ? -1 : 1) * (150 + rnd() * 250), z = (rnd() * 2 - 1) * 400; s.beginStroke();
      const k = kinds[i % 3], r = 15 + rnd() * 45; const res = s.stamp(k, x, z, r, k === 'level' ? 20 + rnd() * 10 : 1 + rnd() * 4); if (!res.ok) throw new Error(res.error); s.endStroke();
    }
    const board = s.entities.find(e => e.type === 'tablero'); must(s.setState(board.id, 'interruptor', true), 'interruptor'); s.advance(2 * 86400); return s.toWorld(FIXED);
  }},
  {key: 'v1-05-plc-automatico', name: 'Ref V1 · PLC en automático con cultivo', make: () => {
    const w = pin(must(createConfiguredWorld({...base, name: 'x', seed: 31415, template: 'farm', territory: 'free', resources: ['parcel', 'irrigation']}), 'crear'), 'ref-v1-05', 'Ref V1 · PLC en automático con cultivo');
    const s = WorldSession.fromWorld(w); const board = s.entities.find(e => e.type === 'tablero'), parcel = s.entities.find(e => e.type === 'parcela');
    must(s.loadExample(board.id), 'programa'); must(s.setState(board.id, 'interruptor', true), 'interruptor'); must(s.setState(board.id, 'modo', 'auto'), 'modo'); must(s.plant(parcel.id, 'tomate'), 'sembrar'); s.advance(10 * 86400); return s.toWorld(FIXED);
  }},
];

const manifest = {generado: 'Etapa 0 · línea base', formato: 'modo-agro', versionEsquema: CURRENT_VERSION, nodo: process.version, mundos: []};
for (const spec of SPECS) {
  const world = must(parseWorld(spec.make()), `validar ${spec.key}`), {filename, text} = exportWorld(world), file = `${spec.key}.modoagro.json`;
  writeFileSync(join(out, file), text);
  const reread = must(parseWorldText(text), `releer ${spec.key}`), again = exportWorld(reread).text;
  const terrain = TerrainModel.fromTerrain(world.terrain);
  const s = WorldSession.fromWorld(world); const a1 = s.alerts().length;
  manifest.mundos.push({
    archivo: file, nombre: world.name, id: world.id, experiencia: world.experience, semilla: world.terrain.seed, lado_m: world.terrain.sizeMeters[0], celda_m: world.terrain.cellMeters,
    ediciones_terreno: world.terrain.edits.length, entidades: world.entities.length, conexiones: world.connections.length, tiene_plc: !!world.plc, tiene_economia: !!world.economy, dinero: world.economy?.money ?? null,
    segundos_simulados: world.clock.simSeconds, alertas: a1,
    terreno_checksum_fnv1a: terrain.checksum(), archivo_sha256: createHash('sha256').update(text).digest('hex'), ida_y_vuelta_identica: again === text, nombre_exportacion: filename,
  });
  console.log('OK', file, terrain.checksum(), world.entities.length, 'piezas', world.connections.length, 'conexiones', again === text ? 'ida y vuelta idéntica' : 'IDA Y VUELTA DISTINTA');
}
writeFileSync(join(out, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));
console.log('MANIFEST.json escrito:', manifest.mundos.length, 'mundos');
