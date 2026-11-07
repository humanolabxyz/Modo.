// Mini fábrica (fase 13): el escenario se arma, valida, sobrevive a guardar/abrir, simula y todas sus piezas tienen forma propia. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {exampleMiniFactory} from '../src/industria/sim/examples.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {routeAll} from '../src/industria/wiring/route.ts';
import {shapeOf} from '../src/industria/build/shapes.ts';
import {mountProblems} from '../src/industria/build/snap.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const r = exampleMiniFactory(); assert.ok(r.ok, r.error); const p = r.value;

const kinds = new Set(p.entities.map(e => e.definitionId));
for (const id of ['piso-planta', 'cinta-transportadora', 'caja-producto', 'brazo-robot', 'compresor', 'valvula-5-2', 'cilindro-neumatico', 'tanque', 'sensor-inductivo', 'sensor-fotoelectrico', 'torre-luminosa', 'paro-emergencia', 'mesa-trabajo', 'valla-seguridad', 'motor-3p', 'plc-generico']) assert.ok(kinds.has(id), `falta ${id}`);
assert.ok(p.entities.length >= 55, `${p.entities.length} piezas`);
ok(`la mini fábrica reúne ${p.entities.length} piezas de ${kinds.size} tipos (tablero, cinta, robot, neumática, sensores, vallas…)`);

assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(p))).ok, 'guardar y abrir');
assert.deepEqual(mountProblems(p), [], 'los montajes coinciden con la geometría');
const mountedOn = (child, parent) => p.mounts.some(m => m.child.entityId === child && m.parent.entityId === parent);
for (const [c, parent] of [['prod1', 'cinta'], ['prod2', 'cinta'], ['prod3', 'cinta'], ['foto', 'cinta'], ['ind', 'mesa'], ['valvula', 'mesa'], ['cil', 'mesa'], ['paro', 'mesa']]) assert.ok(mountedOn(c, parent), `${c} montado sobre ${parent}`);
ok('cajas, sensores, válvula, cilindro y paro quedan montados sobre su soporte');

const routes = routeAll(p); assert.equal(routes.size, p.connections.length);
assert.equal(p.connections.filter(c => c.kind === 'pipe').length, 3, 'tres conductos de aire');
const ev = evaluate(p); assert.ok(ev.nets.length > 10);
ok(`${p.connections.length} cables enrutados (3 de aire) y ${ev.nets.length} redes`);

const off = simulate(p, {}), on = simulate(p, {qf1: true, qf2: true, s1: true});
assert.ok(!off.energized.motor && !off.energized.km1, 'en reposo no hay nada energizado');
assert.ok(on.energized.motor && on.energized.km1, 'con QF1, QF2 y marcha el motor de la cinta se alimenta');
ok('la simulación del tablero arranca el motor de la cinta con la planta en escena');

for (const id of kinds) { const s = shapeOf(id); assert.ok(s.size.every(v => v > 0), id); }
const fl = shapeOf('piso-planta').size, floors = ['piso', 'piso2', 'piso3', 'piso4'].map(id => p.poses[id].position);
for (const e of p.entities) { if (e.id.startsWith('piso')) continue; const q = p.poses[e.id].position; assert.ok(floors.some(f => Math.abs(q[0] - f[0]) <= fl[0] / 2 + 1e-6 && Math.abs(q[2] - f[2]) <= fl[2] / 2 + 1e-6), `${e.id} dentro de un piso`); }
ok('todas las piezas están dentro del piso de planta');
console.log(`\n${n} comprobaciones de la mini fábrica OK`);
