// Puertas que abren (fase 20): la hoja gira en su bisagra, los mandos de la puerta y sus cables la siguen, y el barrido avisa si choca. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {DOORS, doorAngle, doorPoses, hasDoor, stepDoor, wantsOpen} from '../src/industria/scene/doors.ts';
import {modelParts} from '../src/industria/scene/models.ts';
import {exampleMiniFactory} from '../src/industria/sim/examples.ts';
import {doorSwing} from '../src/industria/build/clearance.ts';
import {addEntity, setConnectionRoute} from '../src/industria/model/commands.ts';
import {routeAll} from '../src/industria/wiring/route.ts';
import {terminalWorld} from '../src/industria/wiring/engine.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const p = exampleMiniFactory().value, gab = p.poses.gab.position;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

assert.ok(hasDoor('gabinete') && hasDoor('sala-electrica') && !hasDoor('motor-3p')); assert.ok(wantsOpen({puerta: 'abierta'}) && !wantsOpen({puerta: 'cerrada'}) && !wantsOpen({}));
assert.equal(doorAngle('gabinete', 0), 0); assert.ok(Math.abs(doorAngle('gabinete', 1) + (100 * Math.PI) / 180) < 1e-9); assert.ok(Math.abs(doorAngle('sala-electrica', 1) + Math.PI / 2) < 1e-9);
let v = 0; for (let i = 0; i < 100 && v < 1; i++) v = stepDoor(v, 1, 0.05); assert.equal(v, 1); assert.ok(stepDoor(1, 0, 0.1) < 1 && stepDoor(0.5, 0.5, 0.1) === 0.5);
ok('cada puerta tiene su ángulo de apertura (100° el gabinete, 90° la sala) y el avance es suave');

// Con la puerta cerrada nada se mueve; abierta, los mandos giran en torno a la bisagra sin cambiar su distancia a ella
assert.equal(doorPoses(p, {}), p.poses); assert.equal(doorPoses(p, {gab: 0}), p.poses);
const hinge = [gab[0] + DOORS.gabinete.pivot[0], gab[1], gab[2] + DOORS.gabinete.pivot[2]];
const open = doorPoses(p, {gab: 1});
for (const id of ['s1', 's2', 'h1']) {
  const a = p.poses[id].position, b = open[id].position, flat = q => Math.hypot(q[0] - hinge[0], q[2] - hinge[2]);
  assert.ok(Math.abs(flat(a) - flat(b)) < 1e-9, `${id}: misma distancia a la bisagra`); assert.ok(Math.abs(a[1] - b[1]) < 1e-9, `${id}: misma altura`);
  assert.ok(b[2] > a[2] + 0.1, `${id}: con la puerta abierta queda delante del gabinete`); assert.ok(dist(a, b) > 0.3, `${id}: se movió`);
}
assert.equal(open.plc, p.poses.plc, 'lo que está dentro no se mueve');
ok('los mandos de la puerta giran con ella en torno a la bisagra (misma distancia y altura) y lo de dentro queda quieto');

// Los cables de los mandos siguen a la puerta
const proj = {...p, poses: open}, c = p.connections.find(x => x.a.entityId === 's1' || x.b.entityId === 's1'), r0 = routeAll(p).get(c.id), r1 = routeAll(proj, {gab: 1}).get(c.id);
const t0 = terminalWorld(p, c.a.entityId === 's1' ? c.a : c.b), t1 = terminalWorld(proj, c.a.entityId === 's1' ? c.a : c.b);
assert.ok(dist(t0, t1) > 0.3 && dist(r0[0], r1[0]) + dist(r0.at(-1), r1.at(-1)) > 0.3, 'el cable cambia de recorrido cuando la puerta se abre');
ok('el cable del pulsador sale de su terminal con la puerta abierta');

const routes = routeAll(p);
const internal = p.connections.find(c => c.a.entityId === 'qf1' && c.b.entityId === 'km1');
const field = p.connections.find(c => c.a.entityId === 'km1' && c.b.entityId === 'motor');
const trunk = p.poses.cv1.position;
assert.ok(routes.get(internal.id).filter(point => Math.abs(point[0] - trunk[0]) < 0.009 && Math.abs(point[2] - trunk[2]) < 0.001).length >= 2);
const gland = routes.get(field.id).find(point => Math.abs(point[1] - (gab[1] + 0.006)) < 1e-6 && Math.abs(point[2] - (gab[2] + 0.02)) < 1e-6);
assert.ok(gland && Math.abs(gland[0] - (gab[0] - 0.32)) < 0.01, 'fuerza sale por el prensaestopas de la base');
assert.ok(r1.some(point => dist(point, [hinge[0], gab[1] + 0.855, hinge[2]]) < 0.09), 'el mazo pasa cerca de la bisagra');
assert.deepEqual(routeAll(p).get(internal.id), routeAll(proj, {gab: 1}).get(internal.id), 'abrir no mueve el cableado fijo de la placa');
const manual = setConnectionRoute(p, internal.id, [[1, 2, 3]]).value;
assert.deepEqual(routeAll(manual).get(internal.id).slice(1, -1), [[1, 2, 3]]);
ok('los cables internos usan la canaleta vertical, los de campo salen por la base y se conservan las rutas manuales');

// Formas: panel y herrajes de la puerta del gabinete; hoja, barra y manija de la sala
const g = modelParts('gabinete', 'high'); assert.ok(g.filter(x => x.tag === 'door').length === 1 && g.filter(x => x.tag === 'doorfit').length >= 8, 'panel y herrajes etiquetados');
assert.ok(!g.some(x => x.tag && x.shape === 'cyl' && x.axis === 'y'), 'las bisagras y los prensaestopas no giran');
const sa = modelParts('sala-electrica', 'high'); assert.equal(sa.filter(x => x.tag === 'doorfit').length, 3, 'hoja, barra y manija de la sala');
ok('el gabinete gira su panel y herrajes y la sala su hoja, barra y manija; las bisagras no');

// Barrido de la puerta: despejado en el ejemplo; una mesa delante lo ocupa
assert.deepEqual(doorSwing(p, 'gab').blockers, [], 'barrido despejado');
const hit = addEntity(p, {id: 'mesa-x', definitionId: 'mesa-trabajo', label: 'Mesa', pose: {position: [gab[0] - 0.2, 0, gab[2] + 0.175 + 0.5], rotation: [0, 0, 0]}}).value;
assert.deepEqual(doorSwing(hit, 'gab').blockers, ['mesa-x']);
ok('el barrido de la puerta avisa si hay algo delante que la haría chocar');
console.log(`\n${n} comprobaciones de las puertas OK`);
