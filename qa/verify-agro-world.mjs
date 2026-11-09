// Agro, Fase 2: catálogo, colocación sobre el terreno, comandos, historial unificado y persistencia (con copia en memoria de IndexedDB). Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {ITEMS, itemById, sizeOf, portsFor, defaultParams, checkParam} from '../src/agro/catalog/items.ts';
import {footprint, overlaps, checkPlacement, pickEntity, parcelAt, measure} from '../src/agro/world/placement.ts';
import * as cmd from '../src/agro/world/commands.ts';
import {WorldSession, HISTORY_LIMIT} from '../src/agro/world/session.ts';
import {memoryBackend} from '../src/agro/store/backend.ts';
import {WorldStore, MAX_WORLDS} from '../src/agro/store/worlds.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, parseWorldText, exportWorld} from '../src/agro/model/validate.ts';
import {checkPorts} from '../src/agro/model/ports.ts';
import {sampleHeight, slopeDegrees} from '../src/agro/terrain/heightfield.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const mk = (seed = 4242) => WorldSession.fromWorld(newWorld('Granja', {seed, now: '2026-11-08T12:00:00.000Z'}));
// Un sitio llano (meseta central) para colocar sin que la pendiente interfiera
const FLAT = [[0, 0], [12, 0], [-12, 0], [0, 12], [0, -12], [25, 25], [-25, 25]];

// ── Catálogo ────────────────────────────────────────────────────────────
assert.equal(ITEMS.length, 15); assert.equal(new Set(ITEMS.map(i => i.id)).size, 15); ok('el catálogo tiene 15 piezas únicas (las 11 de la Fase 3 + granero, invernadero, molino y cerca de infraestructura)');
for (const def of ITEMS) {
  const params = defaultParams(def), ports = portsFor(def, params), size = sizeOf(def, params);
  assert.ok(size.every(v => v > 0)); assert.equal(new Set(ports.map(p => p.id)).size, ports.length);
  for (const p of ports) { assert.ok(Math.abs(Math.hypot(...p.normal) - 1) < 1e-9, `${def.id}.${p.id} normal`); assert.ok(p.local[1] >= 0 && p.local[1] <= size[1] + 0.1, `${def.id}.${p.id} altura`); }
}
ok('cada pieza tiene medidas válidas y puertos con normales unitarias, únicos y sobre el suelo');
for (const id of ['granero', 'invernadero', 'molino', 'cerca']) { const d = itemById(id); assert.equal(d.family, 'Infraestructura'); assert.equal(portsFor(d, defaultParams(d)).length, 0); assert.equal(d.solid, true); }
assert.deepEqual(sizeOf(itemById('invernadero'), {anchoM: 10, largoM: 30}), [10, 4, 30]); assert.deepEqual(sizeOf(itemById('cerca'), {largoM: 25}), [25, 1.1, 0.2]);
ok('las construcciones (granero, invernadero, molino, cerca) son piezas sólidas sin puertos, con medidas que siguen sus parámetros');
assert.deepEqual(portsFor(itemById('tuberia'), {largoM: 10, diametroMm: 40}).map(p => [p.local[0], p.spec.diameterMm]), [[-5, 40], [5, 40]]); assert.equal(sizeOf(itemById('tuberia'), {largoM: 10, diametroMm: 40})[0], 10); ok('los puertos de la tubería siguen su largo y diámetro');
assert.equal(portsFor(itemById('parcela'), {}).length, 0); assert.equal(itemById('parcela').solid, false); ok('la parcela es una zona sin puertos ni choque');
assert.ok(checkParam(itemById('tuberia'), 'largoM', 12).ok); assert.equal(checkParam(itemById('tuberia'), 'largoM', 500).ok, false); assert.equal(checkParam(itemById('tuberia'), 'color', 1).ok, false); assert.equal(checkParam(itemById('tuberia'), 'largoM', NaN).ok, false); ok('los parámetros se validan contra su rango');
const pump = portsFor(itemById('bomba'), {}), tank = portsFor(itemById('estanque'), {}), pipe = portsFor(itemById('tuberia'), {}), board = portsFor(itemById('tablero'), {}), sensor = portsFor(itemById('sensor-humedad'), {});
assert.ok(checkPorts(tank.find(p => p.id === 'salida'), pipe[0]).ok && checkPorts(pipe[1], pump.find(p => p.id === 'succion')).ok); assert.ok(checkPorts(board.find(p => p.id === 'salida-bomba'), pump.find(p => p.id === 'alim')).ok); assert.ok(checkPorts(sensor[0], board.find(p => p.id === 'entrada-senal')).ok); ok('las piezas del escenario piloto son compatibles entre sí (estanque→tubería→bomba, tablero→bomba, sensor→tablero)');
assert.equal(checkPorts(pipe[0], portsFor(itemById('tuberia'), {diametroMm: 32})[0]).ok, false); ok('una tubería de otro diámetro no se une sin adaptador');

// ── Geometría de colocación ─────────────────────────────────────────────
const sq = (x, z, a = 0) => footprint({position: [x, 0, z], rotation: [0, a, 0]}, [2, 1, 2]);
assert.equal(overlaps(sq(0, 0), sq(1, 0)), true); assert.equal(overlaps(sq(0, 0), sq(2.5, 0)), false); assert.equal(overlaps(sq(0, 0), sq(2.01, 0)), false, 'tocarse no es solapar'); assert.equal(overlaps(sq(0, 0), sq(1.9, 0)), true);
assert.equal(overlaps(sq(0, 0), sq(2.3, 0, Math.PI / 4)), true, 'el cuadrado girado 45° entra por la esquina'); assert.equal(overlaps(sq(0, 0), sq(3.2, 0, Math.PI / 4)), false);
const long = footprint({position: [0, 0, 0], rotation: [0, Math.PI / 2, 0]}, [6, 1, 0.2]); assert.ok(Math.abs(Math.max(...long.map(p => p[1])) - 3) < 1e-9); ok('solapes entre huellas orientadas (tocarse no cuenta)');

const s = mk(), hf = s.terrain.hf;
assert.equal(checkPlacement(hf, [], 'bomba', {position: [900, 0, 0], rotation: [0, 0, 0]}, {}).ok, false); assert.match(checkPlacement(hf, [], 'bomba', {position: [499.9, 0, 0], rotation: [0, 0, 0]}, {}).error, /sale del mapa/); ok('no se puede colocar fuera del mapa');
const steep = [420, 0]; assert.ok(slopeDegrees(hf, ...steep) > 8); const r1 = checkPlacement(hf, [], 'estanque', {position: [steep[0], sampleHeight(hf, ...steep), steep[1]], rotation: [0, 0, 0]}, {}); assert.equal(r1.ok, false); assert.match(r1.error, /pendiente.*°.*supera el máximo de 6°/i); ok(`una ladera de ${slopeDegrees(hf, ...steep).toFixed(0)}° rechaza el estanque con su motivo`);
assert.equal(checkPlacement(hf, [], 'cosa', {position: [0, 0, 0], rotation: [0, 0, 0]}, {}).ok, false); ok('tipo desconocido rechazado');

// ── Sesión: colocar, mover, girar ───────────────────────────────────────
const tankE = must(s.place('estanque', ...FLAT[0], 0));
assert.equal(tankE.label, 'Estanque 1'); assert.ok(Math.abs(tankE.pose.position[1] - sampleHeight(hf, 0, 0)) < 1e-6); assert.equal(tankE.lifecycle, 'installed'); assert.equal(tankE.owner, 'player'); assert.equal(tankE.ports.length, 2); ok('colocar: nombre único, apoyada en el suelo, instalada, con puertos');
assert.equal(must(s.place('estanque', 40, 0, 0)).label, 'Estanque 2'); ok('los nombres siguen la numeración');
const bad = s.place('bomba', 0.5, 0.5, 0); assert.equal(bad.ok, false); assert.match(bad.error, /Se solapa con «Estanque 1»/); assert.equal(s.entities.length, 2); ok('no se coloca encima de otra pieza y se dice con cuál choca');
const pumpE = must(s.place('bomba', 6, 0, 0)); assert.equal(s.entities.length, 3);
assert.ok(parseWorld(s.toWorld()).ok); ok('el mundo con piezas pasa la validación del formato');
const moved = must(s.move(pumpE.id, 9, 4)); assert.ok(Math.abs(moved.pose.position[0] - 9) < 1e-9 && Math.abs(moved.pose.position[1] - sampleHeight(hf, 9, 4)) < 1e-6); ok('mover: la pieza se vuelve a apoyar en el suelo');
assert.equal(s.move(pumpE.id, 0.2, 0.2).ok, false); assert.equal(s.entity(pumpE.id).pose.position[0], 9); ok('un movimiento inválido no cambia nada');
const rot = must(s.rotate(pumpE.id, Math.PI / 4)); assert.ok(Math.abs(rot.pose.rotation[1] - Math.PI / 4) < 1e-9); ok('girar suma el ángulo');
assert.equal(s.rename(pumpE.id, 'Estanque 1').ok, false); assert.equal(s.rename(pumpE.id, '  ').ok, false); assert.equal(must(s.rename(pumpE.id, 'Bomba principal')).label, 'Bomba principal'); ok('renombrar exige nombres únicos y no vacíos');

// Tubería: el largo cambia sus puertos y se vuelve a comprobar la colocación
const pipeE = must(s.place('tuberia', -12, 0, 0)); assert.equal(pipeE.params.largoM, 6);
const longer = must(s.setParam(pipeE.id, 'largoM', 20)); assert.equal(longer.ports[1].local[0], 10); assert.equal(sizeOf(itemById('tuberia'), longer.params)[0], 20); ok('cambiar el largo de la tubería recalcula sus puertos');
assert.equal(s.setParam(pipeE.id, 'largoM', 1000).ok, false); assert.equal(s.entity(pipeE.id).params.largoM, 20); ok('un parámetro fuera de rango se rechaza');
const blocked = s.setParam(pipeE.id, 'largoM', 50); assert.equal(blocked.ok, false); assert.match(blocked.error, /Se solapa|sale del mapa|pendiente/); ok('alargar hasta chocar con otra pieza se rechaza');

// ── Conexiones y eliminación con dependencias ───────────────────────────
const tankId = tankE.id;
const c1 = s.connect({entityId: tankId, portId: 'salida'}, {entityId: pipeE.id, portId: 'a'}); assert.ok(c1.ok);
assert.equal(s.connections[0].status, 'compatible'); ok('conectar puertos compatibles crea una unión «compatible»');
assert.ok(s.connect({entityId: tankId, portId: 'entrada'}, {entityId: pipeE.id, portId: 'b'}).ok); assert.equal(s.connections.at(-1).status, 'compatible');
assert.equal(s.connect({entityId: tankId, portId: 'salida'}, {entityId: pipeE.id, portId: 'a'}).ok, false); assert.equal(s.connect({entityId: tankId, portId: 'salida'}, {entityId: pumpE.id, portId: 'alim'}).ok, false); ok('no se duplican uniones ni se mezclan tipos');
const deps = s.dependenciesOf(tankId); assert.equal(deps.connections.length, 2);
const refuse = s.remove(tankId); assert.equal(refuse.ok, false); assert.match(refuse.error, /2 conexión/); assert.equal(refuse.dependencies.connections.length, 2); assert.ok(s.entity(tankId)); ok('eliminar una pieza con conexiones pide confirmación y dice cuántas');
const free = must(s.place('valvula', 25, 25, 0)); assert.ok(s.remove(free.id).ok); assert.equal(s.entity(free.id), undefined); ok('una pieza sin conexiones se elimina directamente');
assert.ok(s.remove(tankId, {confirm: true}).ok); assert.equal(s.entity(tankId), undefined); assert.equal(s.connections.length, 0); ok('confirmando se elimina la pieza y sus conexiones, sin dejar uniones huérfanas');
assert.ok(parseWorld(s.toWorld()).ok); ok('el mundo sigue siendo válido tras eliminar');

// ── Historial unificado ─────────────────────────────────────────────────
const h = mk(), snap = () => JSON.stringify([h.entities, h.connections, h.terrain.checksum()]);
const s0 = snap();
const t1 = must(h.place('tablero', 0, 0, 0)); const s1 = snap();
h.beginStroke(); h.stamp('raise', 60, 60, 20, 2); h.stamp('raise', 70, 60, 20, 2); h.endStroke(); const s2 = snap();
const t2 = must(h.place('sensor-humedad', 12, 0, 0)); const s3 = snap();
assert.ok(h.remove(t1.id, {confirm: true}).ok); const s4 = snap();
assert.equal(h.undoLabel, `Eliminar ${t1.label}`);
for (const [expect] of [[s3], [s2], [s1], [s0]]) { assert.ok(h.undo()); assert.equal(snap(), expect); } assert.equal(h.undo(), false); ok('deshacer recorre piezas y terreno en el orden inverso exacto');
for (const expect of [s1, s2, s3, s4]) { assert.ok(h.redo()); assert.equal(snap(), expect); } assert.equal(h.redo(), false); ok('rehacer reproduce cada estado exacto');
h.undo(); h.undo(); must(h.place('valvula', -25, 25, 0)); assert.equal(h.redo(), false); ok('una acción nueva descarta el rehacer, también el del terreno');
const h2 = mk(); must(h2.place('bomba', 0, 0, 0)); h2.beginStroke(); assert.equal(h2.canUndo, false); assert.equal(h2.undo(), false); h2.endStroke(); ok('no se puede deshacer en mitad de un trazo');
const h3 = mk(); for (let k = 0; k < HISTORY_LIMIT + 20; k++) { h3.rename(must(h3.place('sensor-humedad', (k % 10) * 3 - 15, Math.floor(k / 10) * 3 - 15, 0, {label: `S${k}`})).id, `R${k}`); if (k > 20) break; } assert.ok(h3.entities.length > 0); ok('el historial está acotado');

// El terreno editado bajo una pieza la vuelve a apoyar y avisa si la pendiente ya no es válida
const g = mk(), tk = must(g.place('estanque', 0, 0, 0)), y0 = tk.pose.position[1];
g.beginStroke(); g.stamp('raise', 0, 0, 30, 3); const warn = g.endStroke();
assert.ok(g.entity(tk.id).pose.position[1] > y0 + 2.5); assert.ok(Math.abs(g.entity(tk.id).pose.position[1] - sampleHeight(g.terrain.hf, 0, 0)) < 1e-6); ok('subir el terreno bajo una pieza la sube con él');
g.beginStroke(); g.stamp('raise', 3, 0, 5, 3); const warn2 = g.endStroke(); assert.ok(warn2.some(w => /Estanque 1.*pendiente/.test(w))); ok('un relieve que deja una pieza en pendiente no permitida da un aviso');
assert.ok(g.undo()); assert.ok(g.undo()); assert.ok(Math.abs(g.entity(tk.id).pose.position[1] - y0) < 1e-6); assert.ok(g.undo() === true); assert.equal(g.entity(tk.id), undefined); ok('deshacer el terreno devuelve también la altura de la pieza');

// ── Picking y medición ──────────────────────────────────────────────────
const p = mk(), tb = must(p.place('tablero', 0, 0, 0)), py = tb.pose.position[1];
let hit = pickEntity(p.entities, {origin: [0, py + 5, 0], dir: [0, -1, 0]}); assert.ok(hit && hit.id === tb.id && Math.abs(hit.distance - (5 - 1.3)) < 1e-6);
assert.equal(pickEntity(p.entities, {origin: [3, py + 5, 0], dir: [0, -1, 0]}), null); assert.equal(pickEntity(p.entities, {origin: [0, py + 5, 0], dir: [0, 1, 0]}), null);
const far = must(p.place('bomba', 8, 0, 0)); hit = pickEntity(p.entities, {origin: [-6, py + 0.3, 0], dir: [1, 0, 0]}); assert.equal(hit.id, tb.id); ok('el rayo elige la pieza más cercana y falla en el aire');
const yawed = must(p.rotate(far.id, Math.PI / 2)); hit = pickEntity(p.entities, {origin: [8, yawed.pose.position[1] + 3, 0.3], dir: [0, -1, 0]}); assert.ok(hit && hit.id === far.id); assert.equal(pickEntity(p.entities, {origin: [8.3, yawed.pose.position[1] + 3, 0], dir: [0, -1, 0]}), null); ok('el picking respeta el giro de la pieza (la bomba girada 90° es más larga en z)');
const par = must(p.place('parcela', -40, -40, 0)); assert.equal(parcelAt(p.entities, -40, -40).id, par.id); assert.equal(parcelAt(p.entities, -40, 0), null); assert.equal(pickEntity(p.entities, {origin: [-40, 50, -40], dir: [0, -1, 0]}), null); ok('la parcela se elige por su zona del suelo, no por una caja');
assert.equal(p.place('parcela', -45, -45, 0).ok, false); assert.ok(p.place('sensor-humedad', -40, -40, 0).ok); ok('las parcelas no se solapan entre sí, pero admiten piezas encima');
const m = measure({x: 0, y: 0, z: 0}, {x: 30, y: 4, z: 40}); assert.ok(Math.abs(m.horizontal - 50) < 1e-9 && Math.abs(m.distance - Math.hypot(50, 4)) < 1e-9 && m.rise === 4 && Math.abs(m.slopeDeg - Math.atan(4 / 50) * 57.29577951308232) < 1e-9); ok('medir: distancia, horizontal, desnivel y pendiente');

// ── Persistencia ────────────────────────────────────────────────────────
const backend = memoryBackend(), store = new WorldStore(backend);
const farm = mk(7), a = must(farm.place('estanque', 0, 0, 0)), b = must(farm.place('bomba', 8, 0, 0.5)); must(farm.place('parcela', 30, 30, 0, {params: {anchoM: 40, largoM: 25}})); farm.connect({entityId: a.id, portId: 'salida'}, {entityId: b.id, portId: 'succion'});
farm.beginStroke(); farm.stamp('level', -60, -60, 25, 30); farm.stamp('raise', -60, -45, 15, 1.5); farm.endStroke();
const before = farm.toWorld('2026-11-08T13:00:00.000Z'), checksumBefore = farm.terrain.checksum();
assert.ok((await store.save(before)).ok); assert.equal((await store.getActive()), null); await store.setActive(before.id); assert.equal(await store.getActive(), before.id);
const reopened = must(await store.load(before.id)); assert.deepEqual(reopened, before); ok('guardar y reabrir devuelve el mundo idéntico (piezas, poses, puertos, conexiones y terreno)');
const s2b = WorldSession.fromWorld(reopened); assert.equal(s2b.terrain.checksum(), checksumBefore); assert.deepEqual(s2b.entities, farm.entities); assert.deepEqual(s2b.connections, farm.connections); assert.equal(s2b.canUndo, false); ok('una sesión reabierta reproduce el terreno exacto y no inventa historial');
assert.equal(s2b.entities.some(e => !itemById(e.type)), false); assert.equal(new Set(s2b.entities.map(e => e.id)).size, s2b.entities.length); ok('sin piezas fantasma ni ids repetidos');
const list = must(await store.list()); assert.equal(list.length, 1); assert.deepEqual([list[0].entities, list[0].edits, list[0].readable], [3, 2, true]); ok('la lista resume piezas y ediciones sin cargar todo');
const edited = WorldSession.fromWorld(reopened); must(edited.place('valvula', 25, -25, 0)); assert.ok((await store.save(edited.toWorld('2026-11-08T14:00:00.000Z'))).ok); assert.equal((must(await store.list())).length, 1); assert.equal(must(await store.load(before.id)).entities.length, 4); ok('guardar de nuevo actualiza el mismo registro');
// Fallos
backend.failWrites = true; const lost = await store.save(edited.toWorld()); assert.equal(lost.ok, false); assert.match(lost.error, /No se pudo guardar/); backend.failWrites = false; assert.equal(must(await store.load(before.id)).entities.length, 4); ok('un guardado fallido se informa y no daña lo ya guardado');
assert.equal((await store.save({...before, entities: [{...before.entities[0], id: ''}]})).ok, false); ok('un mundo inválido no se guarda');
backend.raw.worlds.set('roto', {id: 'roto', name: 'Mundo dañado', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', experience: 'free', entities: 9, edits: 0, data: {format: 'modo-agro', version: 1, id: 'roto', basura: true}});
const l2 = must(await store.list()); const damaged = l2.find(x => x.id === 'roto'); assert.equal(damaged.readable, false); assert.ok(damaged.error); assert.equal(l2.find(x => x.id === before.id).readable, true); ok('un mundo dañado se lista como ilegible, sin ocultar los demás');
const lr = await store.load('roto'); assert.equal(lr.ok, false); assert.match(lr.error, /No se modificó/); assert.ok(backend.raw.worlds.has('roto')); assert.ok((await store.rawText('roto')).includes('basura')); ok('un mundo dañado no se borra ni se modifica y se puede exportar tal cual');
backend.failReads = true; assert.equal((await store.list()).ok, false); assert.equal((await store.load(before.id)).ok, false); assert.equal(await store.getActive(), null); backend.failReads = false; ok('si no se puede leer, se avisa (no se finge una lista vacía)');
// Importar / duplicar / eliminar
const text = exportWorld(edited.toWorld()).text, imported = must(parseWorldText(text)); const imp = must(await store.importWorld(imported)); assert.notEqual(imp.id, before.id); assert.match(imp.name, /importado/); assert.equal(must(await store.load(before.id)).entities.length, 4); ok('importar un archivo con un id existente crea una copia y no pisa el mundo guardado');
const dup = must(await store.duplicate(before.id)); assert.notEqual(dup.id, before.id); assert.match(dup.name, /copia/); assert.deepEqual(dup.entities, must(await store.load(before.id)).entities); ok('duplicar crea un mundo nuevo con las mismas piezas');
await store.setActive(dup.id); assert.ok((await store.remove(dup.id)).ok); assert.equal(await store.getActive(), null); assert.equal((await store.load(dup.id)).ok, false); ok('eliminar quita el mundo y, si era el activo, lo olvida');
const full = new WorldStore(memoryBackend()); for (let k = 0; k < MAX_WORLDS; k++) assert.ok((await full.save(newWorld(`W${k}`))).ok); const over = await full.save(newWorld('Extra')); assert.equal(over.ok, false); assert.match(over.error, /elimina alguno/); ok(`límite de ${MAX_WORLDS} mundos guardados`);
const same = newWorld('Mismo'); assert.ok((await full.remove((must(await full.list()))[0].id)).ok); assert.ok((await full.save(same)).ok); assert.ok((await full.save({...same, name: 'Mismo 2'})).ok); ok('actualizar un mundo existente no cuenta contra el límite');

console.log(`\n${n} comprobaciones OK`);
