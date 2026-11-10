// Etapa 1 (consolidación 3D): migración de esquema v1 → v2, generador de terreno V1 congelado, copia de seguridad previa, validación estricta y protección del autoguardado.
// Usa los 5 mundos de referencia de la Etapa 0 (qa/fixtures/v1) y los valores del generador ORIGINAL medidos sobre el tag `agro-fase6-base`. Node 24 ejecuta los .ts directamente.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {CURRENT_VERSION} from '../src/agro/model/types.ts';
import {exportWorld, migrateWorld, parseWorld, parseWorldText, MIGRATIONS} from '../src/agro/model/validate.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {GENERATORS, GENERATOR_VERSIONS, DEFAULT_GENERATOR_VERSION, VALLEY_SEED, baseHeightV1, generatorFor} from '../src/agro/terrain/generators.ts';
import {baseHeight, checksum, createHeightfield} from '../src/agro/terrain/heightfield.ts';
import {TerrainModel} from '../src/agro/terrain/model.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {memoryBackend} from '../src/agro/store/backend.ts';
import {WorldStore} from '../src/agro/store/worlds.ts';
import {autosaveDecision} from '../src/agro/store/autosave.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const bad = (r, re) => { assert.equal(r.ok, false, 'debía rechazarse'); assert.match(r.error, re); };
const clone = v => JSON.parse(JSON.stringify(v));
const sha = text => createHash('sha256').update(text).digest('hex');
const dir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'v1');
const manifest = JSON.parse(readFileSync(join(dir, 'MANIFEST.json'), 'utf8'));
const fixtureText = file => readFileSync(join(dir, file), 'utf8');

// ── Generador V1 congelado ───────────────────────────────────────────────
// Valores medidos con el código ORIGINAL de la Fase 6 (tag agro-fase6-base, commit 77058b30) ANTES de mover el generador a generators.ts.
const GOLDEN_CHECKSUMS = [[400, 31, 2, '2c057905'], [1000, 31, 2, '07a6dc42'], [1200, 31, 2, 'e6fb60b6'], [400, 12345, 2, 'a483d6f8'], [1000, 777, 2, '253af23b'], [1200, 987654321, 2, '0569f3d4'], [800, 1, 4, '4f56a57a'], [1000, 2147483647, 2, '3dd17375']];
for (const [side, seed, cell, expected] of GOLDEN_CHECKSUMS) assert.equal(checksum(createHeightfield({sizeMeters: [side, side], cellMeters: cell, seed})), expected, `terreno ${side} m, semilla ${seed}`);
ok(`generador V1: ${GOLDEN_CHECKSUMS.length} terrenos (400–1200 m, semillas 1…2147483647, celdas 2 y 4 m) dan EXACTAMENTE la suma de verificación del código original`);
const GOLDEN_HEIGHTS = [[[31, 0, 0, 1000, 1000], 20.056409164228423], [[31, 123.5, -456.25, 1000, 1000], 16.902525550306997], [[12345, -300, 200, 1000, 1000], 6.645902166890303], [[777, 499, -499, 1200, 1200], 91.1511452408462], [[987654321, 0.5, 0.5, 400, 400], 19.95489335621021]];
for (const [args, h] of GOLDEN_HEIGHTS) { assert.equal(baseHeightV1(...args), h); assert.equal(baseHeight(...args), h); assert.equal(baseHeight(...args, 1), h); }
ok('generador V1: la altura en 5 puntos coincide bit a bit (===) con el valor original, por baseHeightV1, baseHeight y baseHeight(…, 1)');
assert.deepEqual([...GENERATOR_VERSIONS], [1]); assert.equal(DEFAULT_GENERATOR_VERSION, 1); assert.equal(GENERATORS[1], baseHeightV1); assert.ok(Object.isFrozen(GENERATORS));
for (const v of [0, 2, -1, 1.5, NaN, '1', '__proto__', 'constructor']) assert.throws(() => generatorFor(v), /desconocido/);
assert.throws(() => createHeightfield({sizeMeters: [400, 400], cellMeters: 2, seed: 1, generatorVersion: 2}), /desconocido/);
assert.equal(createHeightfield({sizeMeters: [400, 400], cellMeters: 2, seed: 5}).generatorVersion, 1); assert.equal(createHeightfield({sizeMeters: [400, 400], cellMeters: 2, seed: 5, generatorVersion: 1}).checksum, undefined);
assert.equal(checksum(createHeightfield({sizeMeters: [400, 400], cellMeters: 2, seed: 5})), checksum(createHeightfield({sizeMeters: [400, 400], cellMeters: 2, seed: 5, generatorVersion: 1})));
ok('el registro de generadores es de solo lectura, solo conoce la versión 1 y rechaza versiones inexistentes o nombres peligrosos; sin versión se usa la 1');

// ── Los cinco mundos de referencia V1 ────────────────────────────────────
assert.equal(CURRENT_VERSION, 2); assert.equal(typeof MIGRATIONS[1], 'function');
const files = readdirSync(dir).filter(f => f.endsWith('.modoagro.json')).sort(); assert.equal(files.length, 5); assert.equal(manifest.mundos.length, 5);
const opened = {};
for (const info of manifest.mundos) {
  const text = fixtureText(info.archivo);
  assert.equal(sha(text), info.archivo_sha256, `${info.archivo}: SHA-256 del archivo (¿conversión de saltos de línea?)`);
  const raw = JSON.parse(text), before = JSON.stringify(raw);
  assert.equal(raw.version, 1); assert.equal('generatorVersion' in raw.terrain, false); assert.equal('territory' in raw.scenario, false);
  const world = must(parseWorld(raw)); opened[info.archivo] = world;
  assert.equal(JSON.stringify(raw), before, `${info.archivo}: parseWorld modificó el objeto de entrada`);
  assert.equal(world.version, 2); assert.equal(world.terrain.generatorVersion, 1);
  assert.equal(world.terrain.presetId, raw.terrain.seed === VALLEY_SEED ? 'valley' : 'free'); assert.equal(world.scenario.territory, world.terrain.presetId);
  assert.equal(TerrainModel.fromTerrain(world.terrain).checksum(), info.terreno_checksum_fnv1a, `${info.archivo}: checksum del terreno`);
  assert.equal(world.entities.length, info.entidades); assert.equal(world.connections.length, info.conexiones); assert.equal(world.terrain.edits.length, info.ediciones_terreno);
  assert.equal(!!world.plc, info.tiene_plc); assert.equal(!!world.economy, info.tiene_economia); assert.equal(world.economy?.money ?? null, info.dinero); assert.equal(world.clock.simSeconds, info.segundos_simulados);
  // Nada se perdió ni cambió: cada parte del original es idéntica en el mundo migrado
  for (const k of ['id', 'name', 'createdAt', 'updatedAt', 'experience', 'clock', 'entities', 'connections']) assert.deepEqual(world[k], raw[k], `${info.archivo}: ${k}`);
  if (raw.plc) assert.deepEqual(world.plc, raw.plc); if (raw.economy) assert.deepEqual(world.economy, raw.economy);
  assert.deepEqual(world.terrain.edits, raw.terrain.edits); assert.deepEqual(world.terrain.sizeMeters, raw.terrain.sizeMeters); assert.equal(world.terrain.seed, raw.terrain.seed); assert.equal(world.terrain.cellMeters, raw.terrain.cellMeters);
  const {territory, ...scenarioRest} = world.scenario; assert.deepEqual(scenarioRest, raw.scenario);
}
ok('los 5 mundos V1 de referencia (libre vacío, valle con granja, modo real con economía, 30 ediciones + red conectada, PLC en automático) se abren como v2: mismo checksum de terreno, mismos recuentos, y entidades, conexiones, PLC, economía, reloj y ediciones idénticos al original');
assert.equal(opened['v1-02-valle-granja.modoagro.json'].terrain.presetId, 'valley'); assert.equal(opened['v1-01-libre-vacio.modoagro.json'].terrain.presetId, 'free');
ok('el territorio inferido de la semilla 31 es «valley» y el resto «free» (solo una etiqueta: el terreno no cambia)');

for (const [file, world] of Object.entries(opened)) {
  const out1 = exportWorld(world).text, again = must(parseWorldText(out1)), out2 = exportWorld(again).text;
  assert.equal(out1, out2, `${file}: guardar → reabrir → guardar no es estable`); assert.deepEqual(again, world);
  assert.equal(JSON.parse(out1).version, 2); assert.equal(JSON.parse(out1).terrain.generatorVersion, 1);
  assert.equal(must(migrateWorld(JSON.parse(out1))).version, 2);   // migrar un v2 no cambia nada
}
ok('apertura → guardado → reapertura → guardado es estable byte a byte (idempotente) y el archivo guardado declara version 2 y generatorVersion 1');

for (const [file, world] of Object.entries(opened)) {
  const s = WorldSession.fromWorld(world), back = s.toWorld('2026-11-10T00:00:00.000Z');
  assert.equal(TerrainModel.fromTerrain(back.terrain).checksum(), manifest.mundos.find(m => m.archivo === file).terreno_checksum_fnv1a);
  assert.equal(back.terrain.generatorVersion, 1); assert.equal(back.terrain.presetId, world.terrain.presetId); assert.equal(back.scenario.territory, world.scenario.territory); assert.equal(back.entities.length, world.entities.length);
  must(parseWorld(back));
}
ok('abrir cada mundo en una sesión y volver a extraerlo conserva generador, territorio, terreno y piezas (el documento resultante es válido)');

// Mundos nuevos (asistente): nacen en v2 con generador 1 y su territorio
{
  const base = {name: 'Nuevo', seed: 4242, template: 'blank', territory: 'free', side: 1000, site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'};
  const free = must(createConfiguredWorld(base)), valley = must(createConfiguredWorld({...base, territory: 'valley', seed: 999}));
  assert.equal(free.version, 2); assert.equal(free.terrain.generatorVersion, 1); assert.equal(free.terrain.presetId, 'free'); assert.equal(free.scenario.territory, 'free');
  assert.equal(valley.terrain.presetId, 'valley'); assert.equal(valley.terrain.seed, VALLEY_SEED); assert.equal(valley.scenario.territory, 'valley');
  assert.equal(TerrainModel.fromTerrain(valley.terrain).checksum(), '07a6dc42');   // el Valle central de la Fase 6, idéntico
  assert.equal(newWorld('x').terrain.generatorVersion, 1); assert.equal(newWorld('x').scenario.territory, 'free'); must(parseWorld(newWorld('x')));
  const levelled = must(createConfiguredWorld({...base, territory: 'valley', relief: 'level'}));
  assert.equal(levelled.terrain.edits[0].amount, baseHeight(VALLEY_SEED, 0, 0, 1000, 1000)); must(parseWorld(levelled));
}
ok('los mundos nuevos nacen en v2 con generatorVersion 1 y su territorio; el Valle central nuevo tiene el mismo terreno que en la Fase 6 (07a6dc42) y la nivelación usa la misma altura base');

// ── Validación estricta de campos y versiones ────────────────────────────
const v2 = clone(opened['v1-04-terreno-editado-conectado.modoagro.json']);
const mut = f => { const d = clone(v2); f(d); return parseWorld(d); };
must(parseWorld(clone(v2)));
bad(mut(d => { d.extra = 1; }), /Mundo: campo desconocido «extra»/);
bad(mut(d => { d.terrain.relleno = 1; }), /Terreno: campo desconocido «relleno»/);
bad(mut(d => { d.scenario.otro = 1; }), /Escenario: campo desconocido «otro»/);
bad(mut(d => { d.scenario.land.x = 1; }), /Superficies del escenario: campo desconocido «x»/);
bad(mut(d => { d.clock.x = 1; }), /Reloj de simulación: campo desconocido «x»/);
bad(mut(d => { d.terrain.edits[0].fuerza = 1; }), /Edición de terreno .*campo desconocido «fuerza»/);
bad(mut(d => { d.entities[0].oculto = true; }), /campo desconocido «oculto»/);
bad(mut(d => { d.entities[0].pose.y = 1; }), /pose: campo desconocido «y»/);
bad(mut(d => { d.entities.find(e => e.ports.length).ports[0].extra = 1; }), /puerto .*campo desconocido «extra»/);
bad(mut(d => { d.entities.find(e => e.ports.length).ports[0].spec.extra = 1; }), /especificaciones: campo desconocido «extra»/);
bad(mut(d => { d.connections[0].extra = 1; }), /Conexión .*campo desconocido «extra»/);
bad(mut(d => { d.connections[0].a.extra = 1; }), /extremo «a»: campo desconocido «extra»/);
ok('validación estricta: un campo desconocido en el mundo, terreno, escenario, superficies, reloj, ediciones, piezas, poses, puertos, conexiones o extremos se RECHAZA nombrando el campo (nada se descarta en silencio)');
bad(mut(d => { d.version = 3; }), /versión más nueva/); bad(mut(d => { d.version = 99; }), /versión más nueva/);
for (const v of [0, -1, 1.5, '2', null, undefined, NaN]) bad(mut(d => { d.version = v; }), /versión válida/);
bad(mut(d => { delete d.version; }), /versión válida/);
bad(mut(d => { d.format = 'modo-industria'; }), /Industria/); bad(mut(d => { d.format = 'otra'; }), /no es un mundo de Agro/);
ok('versiones: la futura (3, 99) se rechaza con «versión más nueva»; ausente, 0, negativa, decimal, texto, null o NaN no son versiones válidas; formatos ajenos se rechazan');
bad(mut(d => { d.terrain.generatorVersion = 2; }), /generador de relieve «2».*no conoce/); bad(mut(d => { d.terrain.generatorVersion = '1'; }), /generador de relieve/); bad(mut(d => { d.terrain.generatorVersion = 1.5; }), /generador de relieve/);
bad(mut(d => { delete d.terrain.generatorVersion; }), /generador de relieve/); bad(mut(d => { d.terrain.generatorVersion = 0; }), /generador de relieve/); bad(mut(d => { d.terrain.generatorVersion = null; }), /generador de relieve/);
bad(mut(d => { d.terrain.presetId = 'marte'; }), /territorio del terreno es desconocido/); bad(mut(d => { delete d.terrain.presetId; }), /territorio del terreno/);
bad(mut(d => { d.scenario.territory = 'marte'; }), /territorio del escenario es desconocido/); bad(mut(d => { delete d.scenario.territory; }), /territorio del escenario/);
bad(mut(d => { d.scenario.territory = d.terrain.presetId === 'free' ? 'valley' : 'free'; }), /no coincide/);
ok('un terreno con un generador desconocido (2, «1», 1.5, 0, null o ausente) o con un territorio inexistente/incoherente se rechaza con un mensaje claro: nunca se abre con otro algoritmo');
// Un v1 «falso» que ya trae campos v2 no se acepta (no se pisan en silencio)
{
  const raw = JSON.parse(fixtureText('v1-02-valle-granja.modoagro.json'));
  const withPreset = clone(raw); withPreset.terrain.presetId = 'free'; bad(parseWorld(withPreset), /versión 1 pero el terreno ya trae «presetId»/);
  const withGen = clone(raw); withGen.terrain.generatorVersion = 1; bad(parseWorld(withGen), /ya trae «generatorVersion»/);
  const withTer = clone(raw); withTer.scenario.territory = 'free'; bad(parseWorld(withTer), /escenario ya trae «territory»/);
  const unk = clone(raw); unk.hackeo = 1; bad(parseWorld(unk), /campo desconocido «hackeo»/);
  const badSeed = clone(raw); badSeed.terrain.seed = -1; bad(parseWorld(badSeed), /semilla/);
  bad(parseWorld({format: 'modo-agro', version: 1, terrain: 5, scenario: 7}), /terreno|escenario|Mundo|id/i);
}
ok('un archivo que dice ser v1 pero ya trae campos v2 (o campos desconocidos) se rechaza; un v1 con datos rotos da el mensaje concreto y no lanza excepciones');
bad(parseWorldText('{no json'), /JSON válido/); bad(parseWorldText('[]'), /no es un mundo/); bad(parseWorldText('null'), /no es un mundo/);
ok('texto que no es JSON, arreglos y null se rechazan con mensaje');

// ── Almacén: apertura no escribe, copia de seguridad previa, restauración ──
const rowOf = (text) => { const data = JSON.parse(text); return {id: data.id, name: data.name, createdAt: data.createdAt, updatedAt: data.updatedAt, experience: data.experience, entities: data.entities.length, edits: data.terrain.edits.length, data}; };
const counting = (inner, opts = {}) => { const calls = {put: [], del: []}; return {calls, getAll: s => inner.getAll(s), get: async (s, k) => { if (opts.failGet?.(s, k)) throw new Error('lectura bloqueada'); return inner.get(s, k); }, put: async (s, k, v) => { if (opts.failPut?.(s, k)) throw new Error('QuotaExceededError'); calls.put.push([s, k]); return inner.put(s, k, v); }, del: async (s, k) => { calls.del.push([s, k]); return inner.del(s, k); }}; };
const F4 = 'v1-04-terreno-editado-conectado.modoagro.json', F3 = 'v1-03-real-economia.modoagro.json', F2 = 'v1-02-valle-granja.modoagro.json';
{
  const inner = memoryBackend(), backend = counting(inner), store = new WorldStore(backend), original = rowOf(fixtureText(F4));
  inner.raw.worlds.set(original.id, structuredClone(original)); inner.raw.worlds.set('otro-mundo', structuredClone(rowOf(fixtureText(F3))));
  const untouched = JSON.stringify(inner.raw.worlds.get(original.id));

  const list = must(await store.list()); assert.equal(list.length, 2); assert.ok(list.every(w => w.readable));
  const loaded = must(await store.load(original.id)); assert.equal(loaded.version, 2); assert.equal(loaded.terrain.generatorVersion, 1);
  assert.equal(backend.calls.put.length, 0); assert.equal(JSON.stringify(inner.raw.worlds.get(original.id)), untouched); assert.equal([...inner.raw.meta.keys()].length, 0);
  ok('listar y abrir un mundo v1 NO escribe nada: el registro original queda intacto y no se crea ninguna copia hasta que el jugador cambie algo');

  const session = WorldSession.fromWorld(loaded); must(session.place('valvula', -25, 25, 0));
  const saved = await store.save(session.toWorld());
  assert.ok(saved.ok, saved.error);
  const now = inner.raw.worlds.get(original.id); assert.equal(now.data.version, 2); assert.equal(now.data.terrain.generatorVersion, 1); assert.equal(now.data.entities.length, original.data.entities.length + 1);
  const backups = must(await store.listBackups()); assert.equal(backups.length, 1); assert.equal(backups[0].worldId, original.id); assert.equal(backups[0].fromVersion, 1); assert.equal(backups[0].reason, 'migracion');
  const rec = inner.raw.meta.get(backups[0].key); assert.equal(JSON.stringify(rec.row), untouched); assert.equal(backups[0].key, `backup:${original.id}:v1`);
  assert.equal(JSON.stringify(inner.raw.worlds.get('otro-mundo')), JSON.stringify(rowOf(fixtureText(F3))));   // el otro mundo ni se tocó
  ok('el primer guardado migra a v2 y ANTES guarda una copia exacta y verificada del registro v1 original (byte a byte); otros mundos no se tocan');

  must(session.place('valvula', -35, 25, 0)); assert.ok((await store.save(session.toWorld())).ok);
  assert.equal(must(await store.listBackups()).length, 1); assert.equal(JSON.stringify(inner.raw.meta.get(`backup:${original.id}:v1`).row), untouched);
  ok('los guardados siguientes no crean ni modifican copias: la copia anterior a la migración se conserva intacta');

  const restored = must(await store.restoreBackup(original.id));
  assert.equal(JSON.stringify(inner.raw.worlds.get(original.id)), untouched); assert.equal(restored.version, 2);
  assert.equal(TerrainModel.fromTerrain(restored.terrain).checksum(), manifest.mundos.find(m => m.archivo === F4).terreno_checksum_fnv1a);
  const after = must(await store.listBackups()); assert.equal(after.length, 2); assert.ok(after.some(b => b.reason === 'antes-de-restaurar' && b.fromVersion === 2));
  assert.equal(must(await store.load(original.id)).entities.length, original.data.entities.length);
  ok('restaurar devuelve el registro v1 EXACTO (byte a byte), conserva antes una copia del estado v2 que se reemplaza, y el mundo restaurado se abre con el mismo terreno');
  assert.ok((await WorldStore.prototype.save.call(store, must(await store.load(original.id)))).ok); assert.equal(must(await store.listBackups()).length, 2);
  ok('volver a guardar tras restaurar no duplica la copia (ya existe una idéntica)');

  assert.ok((await store.remove(original.id)).ok); assert.equal(must(await store.listBackups()).length, 0); assert.ok(inner.raw.worlds.has('otro-mundo'));
  ok('eliminar un mundo elimina sus copias de seguridad y solo las suyas');
}
{
  const inner = memoryBackend(), original = rowOf(fixtureText(F2)), untouched = JSON.stringify(original);
  inner.raw.worlds.set(original.id, structuredClone(original));
  const store = new WorldStore(counting(inner, {failPut: (s, k) => s === 'meta' && String(k).startsWith('backup:')})), world = must(await store.load(original.id));
  const r = await store.save(world); assert.equal(r.ok, false); assert.match(r.error, /copia de seguridad/); assert.match(r.error, /intacto/);
  assert.equal(JSON.stringify(inner.raw.worlds.get(original.id)), untouched); assert.equal(inner.raw.meta.size, 0);
  ok('si la copia de seguridad no se puede escribir (cuota llena), NO se guarda nada: el mundo v1 sigue intacto y se avisa');
  const storeRead = new WorldStore(counting(inner, {failGet: (s, k) => s === 'worlds'})), r2 = await storeRead.save(world); assert.equal(r2.ok, false); assert.match(r2.error, /no se escribió nada/); assert.equal(JSON.stringify(inner.raw.worlds.get(original.id)), untouched);
  ok('si no se puede leer el registro actual, tampoco se escribe');
  const fake = new WorldStore({getAll: s => inner.getAll(s), get: (s, k) => inner.get(s, k), put: async (s, k, v) => { inner.put(s, k, s === 'meta' && String(k).startsWith('backup:') ? {...v, row: {...v.row, name: 'corrupta'}} : v); }, del: (s, k) => inner.del(s, k)});
  const r3 = await fake.save(world); assert.equal(r3.ok, false); assert.match(r3.error, /no coincide/); assert.equal(JSON.stringify(inner.raw.worlds.get(original.id)), untouched);
  ok('una copia que no coincide con el original al releerla se considera fallida: no se escribe el mundo nuevo');
}
{
  // Registro ilegible: se conserva tal cual en una copia antes de ser reemplazado, y abrirlo no lo daña
  const inner = memoryBackend(), good = rowOf(fixtureText(F2)), broken = {...good, data: {...good.data, version: 1, terrain: {...good.data.terrain, sizeMeters: 'roto'}}}, untouched = JSON.stringify(broken);
  inner.raw.worlds.set(good.id, structuredClone(broken)); const store = new WorldStore(inner);
  const l = must(await store.list()); assert.equal(l[0].readable, false); const o = await store.load(good.id); assert.equal(o.ok, false); assert.match(o.error, /No se modificó/); assert.equal(JSON.stringify(inner.raw.worlds.get(good.id)), untouched);
  assert.ok((await store.save(must(parseWorld(good.data)))).ok);
  const b = must(await store.listBackups()); assert.equal(b.length, 1); assert.equal(JSON.stringify(inner.raw.meta.get(b[0].key).row), untouched);
  const rr = await store.restoreBackup(good.id); assert.equal(rr.ok, false); assert.match(rr.error, /no se puede leer/); assert.equal(inner.raw.worlds.get(good.id).data.version, 2);
  ok('un registro ilegible no se daña al listarlo ni abrirlo; si se sobrescribe con un mundo válido, el original ilegible queda en una copia exacta; restaurar una copia ilegible se rechaza sin tocar nada');
  // Un registro que ya es v2 no genera copias
  const inner2 = memoryBackend(), s2 = new WorldStore(inner2), w = newWorld('v2', {seed: 5}); assert.ok((await s2.save(w)).ok); assert.ok((await s2.save({...w, updatedAt: '2030-01-01T00:00:00.000Z'})).ok); assert.equal(inner2.raw.meta.size, 0);
  ok('guardar un mundo que ya es v2 no crea copias');
  // Importación
  const s3 = new WorldStore(memoryBackend()); const imp = must(await s3.importWorld(must(parseWorldText(fixtureText(F2))))); assert.equal(imp.version, 2);
  const dup = JSON.parse(fixtureText(F2)); dup.campoNuevo = 1; bad(parseWorldText(JSON.stringify(dup)), /campo desconocido «campoNuevo»/); assert.equal(must(await s3.list()).length, 1);
  ok('importar un archivo v1 lo migra a v2; un archivo con campos desconocidos se rechaza y el almacén queda como estaba');
}

// ── Las copias de seguridad nunca se sobrescriben (ni siquiera la única copia válida de un mundo anterior) ──
{
  const inner = memoryBackend(), violations = [];
  const guarded = {getAll: s => inner.getAll(s), get: (s, k) => inner.get(s, k), del: (s, k) => inner.del(s, k), put: async (s, k, v) => { if (s === 'meta' && String(k).startsWith('backup:') && inner.raw.meta.has(k)) violations.push(k); return inner.put(s, k, v); }};
  const store = new WorldStore(guarded), a = rowOf(fixtureText(F2)), b = rowOf(fixtureText(F4));
  inner.raw.worlds.set(a.id, structuredClone(a)); inner.raw.worlds.set(b.id, structuredClone(b));
  // 1) Una copia previa y DISTINTA ya ocupa la clave habitual: la nueva usa otra clave y la antigua queda intacta
  const old = {kind: 'backup', key: `backup:${a.id}:v1`, worldId: a.id, fromVersion: 1, savedAt: '2026-01-01T00:00:00.000Z', reason: 'migracion', row: {...a, name: 'versión antigua del respaldo'}};
  inner.raw.meta.set(old.key, structuredClone(old));
  const wa = must(await store.load(a.id)); assert.ok((await store.save({...wa, name: 'cambiado'})).ok);
  assert.equal(JSON.stringify(inner.raw.meta.get(old.key)), JSON.stringify(old), 'la copia anterior se modificó');
  const mine = [...inner.raw.meta.values()].filter(v => v?.kind === 'backup' && v.worldId === a.id); assert.equal(mine.length, 2); assert.ok(mine.some(v => v.key === `backup:${a.id}:v1:1` && JSON.stringify(v.row) === JSON.stringify(a)));
  ok('si la clave habitual ya está ocupada por otra copia, la nueva usa la siguiente clave libre y la copia anterior queda intacta byte a byte');
  // 2) Recorrido completo (migrar dos mundos, guardar, restaurar, volver a migrar, borrar): ninguna escritura pisa una copia existente
  const wb = must(await store.load(b.id)); assert.ok((await store.save(wb)).ok); assert.ok((await store.save({...wb, name: 'otro'})).ok);
  assert.ok((await store.restoreBackup(b.id)).ok); assert.ok((await store.save(must(await store.load(b.id)))).ok); assert.ok((await store.restoreBackup(b.id)).ok); assert.ok((await store.save({...must(await store.load(b.id)), name: 'x'})).ok);
  assert.deepEqual(violations, []);
  const backupsOfB = [...inner.raw.meta.values()].filter(v => v?.kind === 'backup' && v.worldId === b.id), v1 = backupsOfB.filter(v => v.fromVersion === 1);
  assert.equal(v1.length, 1); assert.equal(JSON.stringify(v1[0].row), JSON.stringify(b));   // la única copia v1 de B sigue siendo la original exacta
  ok('en un recorrido completo (migrar, guardar, restaurar, volver a migrar, restaurar y guardar) ninguna escritura pisa una copia existente y la copia v1 original de cada mundo sigue exacta');
  // 3) Las copias de un mundo no afectan a las de otro y eliminar un mundo no toca las del otro
  assert.ok((await store.remove(a.id)).ok); assert.ok([...inner.raw.meta.values()].some(v => v?.kind === 'backup' && v.worldId === b.id)); assert.ok(![...inner.raw.meta.values()].some(v => v?.kind === 'backup' && v.worldId === a.id));
  ok('las copias son por mundo: eliminar un mundo solo elimina las suyas');
}

// ── Protección del autoguardado ──────────────────────────────────────────
{
  const w = must(createConfiguredWorld({name: 'A', seed: 321, template: 'farm', territory: 'free', side: 1000, site: 'center', relief: 'natural', radius: 60, resources: ['parcel', 'irrigation'], water: 80, experience: 'free', start: '2026-09-21'}));
  const s = WorldSession.fromWorld(w), saved = s.version;
  assert.deepEqual(autosaveDecision(s, saved), {save: false, reason: 'sin-cambios'});
  s.beginStroke(); assert.ok(s.stamp('raise', 300, 300, 20, 2).ok);
  assert.ok(s.terrain.painting); assert.notEqual(s.version, saved);
  assert.deepEqual(autosaveDecision(s, saved), {save: false, reason: 'trazo-en-curso'});
  assert.deepEqual(autosaveDecision(s, saved, true), {save: true});
  s.endStroke(); assert.ok(!s.terrain.painting);
  assert.deepEqual(autosaveDecision(s, saved), {save: true}); assert.deepEqual(autosaveDecision(s, s.version), {save: false, reason: 'sin-cambios'});
  must(parseWorld(s.toWorld()));
}
ok('autoguardado: con un trazo de terreno abierto se espera (no se guarda un trazo a medias); al cerrarlo se guarda; la salida de la página fuerza el guardado; sin cambios no guarda');
// Ninguna ruta de serialización (autoguardado normal, guardado forzado al salir de la página o cerrar el mundo, exportar) incluye un trazo de terreno abierto
{
  const w = must(createConfiguredWorld({name: 'T', seed: 2468, template: 'farm', territory: 'free', side: 1000, site: 'center', relief: 'natural', radius: 60, resources: ['parcel', 'irrigation'], water: 80, experience: 'free', start: '2026-09-21'}));
  const s = WorldSession.fromWorld(w); s.beginStroke(); assert.ok(s.stamp('raise', 250, 250, 20, 2).ok); s.endStroke();   // un trazo ya cerrado: sí se guarda
  const closed = s.toWorld(), closedSum = TerrainModel.fromTerrain(closed.terrain).checksum(), closedEdits = closed.terrain.edits.length;
  const store = new WorldStore(memoryBackend());
  s.beginStroke(); for (const [x, z] of [[300, 300], [320, 305], [340, 310]]) assert.ok(s.stamp('raise', x, z, 25, 3).ok);
  assert.ok(s.terrain.painting); assert.equal(s.terrain.edits.length, closedEdits + 3);   // en memoria el trazo está a medias
  for (const [name, doc] of [['toWorld (autoguardado y guardado forzado)', s.toWorld()], ['exportar', must(parseWorldText(exportWorld(s.toWorld()).text))]]) {
    assert.equal(doc.terrain.edits.length, closedEdits, `${name}: serializó marcas de un trazo abierto`);
    assert.equal(TerrainModel.fromTerrain(doc.terrain).checksum(), closedSum, `${name}: el terreno guardado no es el último confirmado`);
    must(parseWorld(doc));
  }
  assert.ok((await store.save(s.toWorld())).ok); assert.equal(must(await store.load(w.id)).terrain.edits.length, closedEdits);
  s.endStroke(); const done = s.toWorld(); assert.equal(done.terrain.edits.length, closedEdits + 3); assert.notEqual(TerrainModel.fromTerrain(done.terrain).checksum(), closedSum);
  ok('NINGUNA ruta de guardado serializa un trazo abierto: autoguardado, guardado forzado (salir de la página o cerrar el mundo) y exportar guardan el último terreno confirmado; al cerrar el trazo, el siguiente guardado lo incluye completo');
}
console.log(`${n} bloques de verificación de la migración v1 → v2 (Etapa 1) en verde.`);
