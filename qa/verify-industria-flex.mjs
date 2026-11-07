// Cables flexibles y organizables (fase 12): esquinas redondeadas, caída en tramos largos, puntos de paso y comandos con historial. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {BEND_RADIUS, addSag, flexCable, insertWaypoint, interiorOf, midpointsOf, minBendRadius, moveWaypoint, pathLength, removeWaypoint, roundCorners} from '../src/industria/wiring/curve.ts';
import {routeAll, collisionBoxes, segmentHits} from '../src/industria/wiring/route.ts';
import {routeWire, tidyWires} from '../src/industria/wiring/commands.ts';
import {examplePlcStartStop} from '../src/industria/sim/examples.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// 1. Las esquinas dejan de ser ángulos vivos y los extremos no se mueven
const corner = [[0, 0, 0], [0, 0.2, 0], [0.2, 0.2, 0]];
const rounded = roundCorners(corner);
assert.deepEqual(rounded[0], corner[0]); assert.deepEqual(rounded.at(-1), corner.at(-1));
assert.ok(rounded.length > corner.length);
assert.ok(minBendRadius(corner) === Infinity || minBendRadius(corner) > 0); // 3 puntos: el circunradio del triángulo existe
assert.ok(minBendRadius(rounded) >= BEND_RADIUS * 0.4, `radio mínimo ${minBendRadius(rounded)}`);
ok('las esquinas se redondean con un radio mínimo y respetan los extremos');

// 2. Un tramo corto no se pasa de curva (el radio se limita a la mitad del tramo)
const tiny = roundCorners([[0, 0, 0], [0, 0.02, 0], [0.02, 0.02, 0]]);
assert.ok(tiny.every(p => p.every(Number.isFinite)));
for (const p of tiny) assert.ok(p[0] >= -1e-9 && p[0] <= 0.02 + 1e-9 && p[1] >= -1e-9 && p[1] <= 0.02 + 1e-9, 'queda dentro del recuadro de la esquina');
ok('un tramo corto no se sale de su esquina');

// 3. Caída: tramo largo y horizontal baja en el centro; corto o vertical no
const long = addSag([[0, 0.3, 0], [0.5, 0.3, 0]]);
assert.ok(long.length > 2); const mid = long[Math.floor(long.length / 2)]; assert.ok(mid[1] < 0.3 - 0.01 && mid[1] > 0.3 - 0.04, `caída ${0.3 - mid[1]}`);
assert.equal(addSag([[0, 0.3, 0], [0.1, 0.3, 0]]).length, 2); assert.equal(addSag([[0, 0, 0], [0, 0.5, 0]]).length, 2);
assert.equal(addSag([[0, 0.3, 0], [0.5, 0.3, 0]], 0.03, () => true).length, 2, 'si tocaría una pieza no cuelga');
assert.ok(dist(long[0], [0, 0.3, 0]) < 1e-12 && dist(long.at(-1), [0.5, 0.3, 0]) < 1e-12);
ok('los tramos largos y horizontales cuelgan; los cortos, verticales o bloqueados no');

// 4. Los cables de los ejemplos siguen sin atravesar piezas después de curvarlos y siguen empezando/terminando en su terminal
const p = must(examplePlcStartStop()), routes = routeAll(p), boxes = [...collisionBoxes(p).values()];
let tested = 0;
for (const [id, r] of routes) {
  const flex = flexCable(r, {blocked: (a, b) => segmentHits(a, b, boxes)});
  assert.ok(flex.flat().every(Number.isFinite), id);
  assert.ok(dist(flex[0], r[0]) < 1e-9 && dist(flex.at(-1), r.at(-1)) < 1e-9, `${id}: extremos`);
  assert.ok(pathLength(flex) <= pathLength(r) * 1.25 + 0.2, `${id}: longitud razonable`);
  tested++;
}
assert.ok(tested > 10); ok(`${tested} cables del ejemplo con PLC curvados: extremos fijos y longitud razonable`);

// 5. Puntos de paso: insertar, mover, quitar
const r0 = [...routes.values()][0], inner = interiorOf(r0);
assert.equal(inner.length, r0.length - 2); assert.equal(midpointsOf(r0).length, r0.length - 1);
const ins = insertWaypoint(inner, 1, [9, 9, 9]); assert.equal(ins.length, inner.length + 1); assert.deepEqual(ins[1], [9, 9, 9]);
const mv = moveWaypoint(ins, 1, [1, 2, 3]); assert.deepEqual(mv[1], [1, 2, 3]); assert.deepEqual(ins[1], [9, 9, 9], 'no modifica el original');
assert.equal(removeWaypoint(mv, 1).length, inner.length);
ok('insertar, mover y quitar puntos de paso no alteran la lista original');

// 6. Comandos: ruta manual con un paso de historial, validación, volver a automática y ordenar
const c0 = p.connections[0], mine = [[0.1, 0.5, 0.1], [0.2, 0.5, 0.2]];
const withRoute = must(routeWire(p, c0.id, mine));
assert.deepEqual(withRoute.connections[0].route, mine); assert.equal(p.connections[0].route, undefined, 'el proyecto original no cambia');
assert.ok(routeAll(withRoute).get(c0.id).length === mine.length + 2, 'el enrutado respeta la ruta manual');
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(withRoute))).ok, 'la ruta manual sobrevive a guardar y abrir');
assert.equal(must(routeWire(withRoute, c0.id, [])).connections[0].route, undefined, 'lista vacía = ruta automática');
assert.equal(routeWire(p, 'no-existe', mine).ok, false);
assert.equal(routeWire(p, c0.id, Array.from({length: 99}, () => [0, 0, 0])).ok, false, 'respeta el límite de puntos');
assert.equal(tidyWires(p).ok, false, 'sin rutas manuales no hay nada que ordenar');
const two = must(routeWire(withRoute, p.connections[1].id, mine)), tidy = must(tidyWires(two));
assert.ok(tidy.connections.every(c => c.route === undefined));
ok('rutas manuales: se guardan, se validan, vuelven a automático y «Ordenar» las borra todas');

console.log(`\n${n} comprobaciones de cables flexibles OK`);
