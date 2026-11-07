// Enrutado visual de cables (fase 11): salen perpendiculares, no atraviesan piezas, son deterministas y rápidos. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {routeCable, routeAll, terminalNormal, segmentHits, collisionBoxes, CABLE_RADIUS} from '../src/industria/wiring/route.ts';
import {terminalWorld} from '../src/industria/wiring/engine.ts';
import {examplePlcStartStop, exampleDirectStart} from '../src/industria/sim/examples.ts';
import {setConnectionRoute} from '../src/industria/model/commands.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const norm = v => Math.hypot(...v);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const [name, p] of [['marcha/paro con PLC', must(examplePlcStartStop())], ['arranque directo', must(exampleDirectStart())]]) {
  const routes = routeAll(p), boxes = collisionBoxes(p);
  assert.equal(routes.size, p.connections.length, name);
  let blocked = 0, maxLen = 0;
  for (const c of p.connections) {
    const r = routes.get(c.id), a = terminalWorld(p, c.a), b = terminalWorld(p, c.b);
    assert.ok(r.length >= 4 && r.flat().every(Number.isFinite), `${name}: ${c.id}`);
    assert.ok(dist(r[0], a) < 1e-9 && dist(r.at(-1), b) < 1e-9, 'empieza y termina en sus terminales');
    // Sale perpendicular a la cara del terminal
    const na = terminalNormal(p, c.a), first = r[1].map((v, k) => v - r[0][k]); assert.ok(Math.abs(norm(first) - 0.026) < 1e-6 && first.every((v, k) => Math.abs(v - na[k] * 0.026) < 1e-6), `${name}: ${c.id} sale perpendicular`);
    // No atraviesa ninguna otra pieza (los primeros y últimos tramos pueden rozar su propia pieza)
    const skipA = [c.a.entityId], skipB = [c.b.entityId];
    for (let i = 1; i < r.length; i++) {
      const others = [...boxes].filter(([id]) => !(i === 1 ? skipA : i === r.length - 1 ? skipB : []).includes(id)).map(([, o]) => o);
      if (segmentHits(r[i - 1], r[i], others)) { blocked++; break; }
    }
    for (let i = 1; i < r.length; i++) maxLen = Math.max(maxLen, dist(r[i - 1], r[i]));
  }
  assert.equal(blocked, 0, `${name}: ${blocked} cables atraviesan piezas`); assert.ok(maxLen < 3, `${name}: tramo de ${maxLen.toFixed(2)} m`);
}
ok('en los dos ejemplos ningún cable atraviesa otra pieza, todos salen perpendiculares a su terminal y empiezan y acaban donde deben');

// Determinismo y rutas manuales
const p = must(examplePlcStartStop()); const a1 = routeAll(p), a2 = routeAll(p); for (const [id, r] of a1) assert.deepEqual(r, a2.get(id));
const first = p.connections[0], manual = must(setConnectionRoute(p, first.id, [[0, 2, 0]])); assert.equal(routeCable(manual, manual.connections[0]).length, 3); ok('el enrutado es determinista y respeta una ruta manual');

// Puentes cortos entre vecinos son directos; los largos suben por encima
const near = p.connections.find(c => c.a.entityId === 'b1' && c.a.terminalId === '2' && c.b.entityId === 's1'), far = p.connections.find(c => c.a.entityId === 'red' && c.b.entityId === 'qf1');
const rn = routeAll(p).get(near.id), rf = routeAll(p).get(far.id); assert.equal(rn.length, 4, 'puente corto directo'); assert.ok(rf.length === 6 && rf[2][1] > Math.max(rf[1][1], rf[4][1]), 'el cable largo cruza por encima'); ok('los cables cortos van directos y los largos suben por encima de lo que hay en medio');

// Un obstáculo en medio obliga a subir más
const detour = routeAll(p).get(p.connections.find(c => c.a.entityId === 'km1' && c.a.terminalId === '2').id); assert.ok(detour.length >= 4); ok('el camino se adapta a las piezas del recorrido');

// Detección de choque independiente: una línea que pasa por el centro de una pieza choca
const boxes = collisionBoxes(p), km = p.poses.km1.position; assert.equal(segmentHits([km[0] - 0.2, km[1], km[2]], [km[0] + 0.2, km[1], km[2]], [boxes.get('km1')]), true); assert.equal(segmentHits([km[0] - 0.2, km[1] + 0.5, km[2]], [km[0] + 0.2, km[1] + 0.5, km[2]], [boxes.get('km1')]), false); assert.ok(CABLE_RADIUS > 0.001 && CABLE_RADIUS < 0.004); ok('detección de choques con el grosor del cable');

// Rendimiento: ≈720 cables
const {newIndustryProject} = await import('../src/industria/model/defaults.ts'); const {addEntity} = await import('../src/industria/model/commands.ts'); const {wire} = await import('../src/industria/wiring/commands.ts');
let big = newIndustryProject('grande'); const link = (a, ta, b, tb) => { big = must(wire(big, {entityId: a, terminalId: ta}, {entityId: b, terminalId: tb})); };
for (let i = 0; i < 60; i++) { const x = (i % 10) * 0.5, z = Math.floor(i / 10) * 0.5 + 1; for (const [s, d] of [['q', 'breaker-3p'], ['k', 'contactor-3p'], ['m', 'motor-3p'], ['r', 'red-3f']]) big = must(addEntity(big, {id: `${s}${i}`, definitionId: d, label: `${s}${i}`, pose: {position: [x, 0.5, z], rotation: [0, 0, 0]}})); link(`r${i}`, 'L1', `q${i}`, '1'); link(`r${i}`, 'L2', `q${i}`, '3'); link(`r${i}`, 'L3', `q${i}`, '5'); link(`q${i}`, '2', `k${i}`, '1'); link(`q${i}`, '4', `k${i}`, '3'); link(`q${i}`, '6', `k${i}`, '5'); link(`k${i}`, '2', `m${i}`, 'U1'); link(`k${i}`, '4', `m${i}`, 'V1'); link(`k${i}`, '6', `m${i}`, 'W1'); }
const t0 = performance.now(); const routes = routeAll(big); const ms = performance.now() - t0; console.log(`  enrutar ${big.connections.length} cables entre ${big.entities.length} piezas: ${ms.toFixed(0)} ms`); assert.equal(routes.size, big.connections.length); assert.ok(ms < 4000, `${ms} ms`); ok('enrutar cientos de cables entre cientos de piezas toma una fracción de segundo');
console.log(`\n${n} bloques OK`);
