// Diagrama esquemático de Industria (fase 7): símbolos, patillas, rutas, posiciones independientes de la pose 3D. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {symbolGeom, autoLayout, symbolPos, pinPos, wirePoints, pathOf, electricalEntities, bounds, pagesOf, pageOf, crossPageStubs, countCrossings, PAGE_TITLES} from '../src/industria/diagram/layout.ts';
import {moveSymbol, moveToPage, arrangeAll} from '../src/industria/diagram/commands.ts';
import {examplePlcStartStop, exampleDirectStart} from '../src/industria/sim/examples.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {moveEntity} from '../src/industria/build/commands.ts';
import {shapeOf} from '../src/industria/build/shapes.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const p = must(examplePlcStartStop());

// Cada terminal del catálogo tiene su patilla, sin repetirse, dentro del contorno
for (const id of ['red-3f', 'breaker-3p', 'breaker-1p', 'contactor-3p', 'fuente-cc', 'plc-generico', 'pulsador-na', 'piloto', 'borne-paso', 'motor-3p']) {
  const g = symbolGeom(id), t = shapeOf(id).terminals;
  assert.equal(g.pins.length, t.length, id); assert.equal(new Set(g.pins.map(q => q.id)).size, t.length);
  for (const q of g.pins) { assert.ok(q.x >= 0 && q.x <= g.w && q.y >= 0 && q.y <= g.h, `${id}.${q.id} fuera del símbolo`); }
  for (let i = 0; i < g.pins.length; i++) for (let j = i + 1; j < g.pins.length; j++) assert.ok(Math.hypot(g.pins[i].x - g.pins[j].x, g.pins[i].y - g.pins[j].y) >= 20, `${id}: patillas ${g.pins[i].id} y ${g.pins[j].id} demasiado juntas`);
}
const k = symbolGeom('contactor-3p'); assert.deepEqual(k.pins.filter(q => q.side === 'top').map(q => q.id), ['1', '3', '5']); assert.deepEqual(k.pins.filter(q => q.side === 'bottom').map(q => q.id), ['2', '4', '6']);
assert.deepEqual(k.pins.filter(q => q.side === 'right').map(q => q.id), ['A1', 'A2']); assert.deepEqual(k.pins.filter(q => q.side === 'left').map(q => q.id), ['13', '14']); ok('símbolo por componente: una patilla por terminal, dentro del contorno y bien separadas');

// Solo lo eléctrico entra en el esquema
const ids = electricalEntities(p).map(e => e.id); assert.ok(!ids.includes('placa') && !ids.includes('riel1')); assert.ok(ids.includes('plc') && ids.includes('motor')); assert.equal(ids.length, 10); ok('la placa y los rieles no aparecen en el esquema eléctrico');

// Disposición automática: una posición y una hoja por símbolo, sin solaparse dentro de la hoja
const auto = autoLayout(p); assert.deepEqual(Object.keys(auto).sort(), [...ids].sort());
const boxes = ids.map(id => ({id, ...auto[id], w: symbolGeom(p.entities.find(e => e.id === id).definitionId).w, h: symbolGeom(p.entities.find(e => e.id === id).definitionId).h}));
for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], b = boxes[j]; if (a.page !== b.page) continue; assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y, `${a.id} y ${b.id} se solapan`); }
assert.ok(auto.red.y < auto.qf1.y && auto.qf1.y < auto.km1.y && auto.km1.y < auto.motor.y, 'la red arriba y el motor abajo'); assert.ok([auto.red, auto.qf1, auto.km1, auto.motor].every(x => x.page === 1), 'la fuerza va en la hoja 1');
assert.ok([auto.fuente, auto.plc, auto.s1, auto.s2, auto.qf2, auto.b1].every(x => x.page === 2), 'el mando va en la hoja 2'); assert.deepEqual(pagesOf(p), [1, 2]); assert.deepEqual(PAGE_TITLES, ['Fuerza', 'Mando']);
ok('disposición automática en dos hojas (fuerza y mando), por filas y sin solapes');

// Cables de la misma hoja: salen perpendiculares, en ángulo recto, empiezan y terminan en sus patillas. Los de otra hoja se dibujan como referencias.
let drawn = 0, cross = 0;
for (const c of p.connections) {
  const pts = wirePoints(p, c, auto), a = pinPos(p, c.a, auto), b = pinPos(p, c.b, auto);
  if (a.page !== b.page) { assert.equal(pts, null); cross++; continue; }
  assert.ok(pts && pts.length >= 3, c.id); drawn++;
  assert.deepEqual([pts[0].x, pts[0].y], [a.x, a.y]); assert.deepEqual([pts.at(-1).x, pts.at(-1).y], [b.x, b.y]);
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].x === pts[i - 1].x || pts[i].y === pts[i - 1].y, `${c.id}: tramo oblicuo`);
}
assert.equal(drawn + cross, p.connections.length); assert.ok(cross >= 3 && drawn >= 10, `${drawn} en hoja, ${cross} entre hojas`);
const stubs = [1, 2].flatMap(pg => crossPageStubs(p, pg, auto)); assert.equal(stubs.length, cross * 2, 'una referencia por extremo y por cable entre hojas'); assert.ok(stubs.every(st => /^→ hoja [12] · .+\..+$/.test(st.label)));
const s1stub = crossPageStubs(p, 2, auto).find(st => /KM1\.A1/.test(st.label)); assert.ok(s1stub, 'PLC.DO0 apunta a KM1.A1 en la hoja 1'); assert.match(crossPageStubs(p, 1, auto).find(st => /PLC\.DO0/.test(st.label)).label, /^→ hoja 2 · PLC\.DO0$/);
assert.match(pathOf(wirePoints(p, p.connections.find(c => c.a.entityId === 'red' && c.b.entityId === 'qf1'), auto)), /^M[\d.\- ]+L/); ok('los cables de una hoja van en ángulo recto entre sus patillas y los de otra hoja se dibujan como referencias «→ hoja n · destino»');

// Menos cruces: ordenar por vecinos nunca es peor que el orden de creación, y en los ejemplos mejora o iguala
const naive = autoLayout(p, false), orderedX = [1, 2].map(pg => countCrossings(p, pg, auto)), naiveX = [1, 2].map(pg => countCrossings(p, pg, naive));
console.log(`  cruces con orden de creación ${naiveX} → ordenados ${orderedX}`); assert.ok(orderedX[0] <= naiveX[0] && orderedX[1] <= naiveX[1], 'no empeora');
const dd = must(exampleDirectStart()), dn = [1, 2].map(pg => countCrossings(dd, pg, autoLayout(dd, false))), dord = [1, 2].map(pg => countCrossings(dd, pg)); assert.ok(dord[0] <= dn[0] && dord[1] <= dn[1]);
// Un caso donde el orden importa: dos aparatos en la fila de abajo cableados de forma cruzada
{
  const {newIndustryProject} = await import('../src/industria/model/defaults.ts'); const {addEntity} = await import('../src/industria/model/commands.ts'); const {wire} = await import('../src/industria/wiring/commands.ts');
  let q = newIndustryProject('cruces');
  for (const [id, def] of [['red', 'red-3f'], ['q1', 'breaker-3p'], ['q2', 'breaker-3p']]) q = must(addEntity(q, {id, definitionId: def, label: id.toUpperCase()}));
  // q2 se creó después pero está cableado a las fases de la izquierda, q1 a las de la derecha
  for (const [i, t] of [['L1', '1'], ['L2', '3']]) q = must(wire(q, {entityId: 'red', terminalId: i}, {entityId: 'q2', terminalId: t})); q = must(wire(q, {entityId: 'red', terminalId: 'L3'}, {entityId: 'q1', terminalId: '1'})); q = must(wire(q, {entityId: 'red', terminalId: 'N'}, {entityId: 'q1', terminalId: '3'}));
  const bad = countCrossings(q, 1, autoLayout(q, false)), good = countCrossings(q, 1); assert.ok(bad > good, `ordenar reduce los cruces (${bad} → ${good})`); const lay = autoLayout(q); assert.ok(lay.q2.x < lay.q1.x, 'q2 queda a la izquierda, bajo sus vecinos');
}
ok('ordenar cada fila por los vecinos de la fila anterior reduce los cruces (y nunca los aumenta en los ejemplos)');

// Posición y hoja del símbolo: se guardan en `symbols`, son independientes de la pose 3D y entran como un paso
const before3d = JSON.stringify(p.poses); const moved = must(moveSymbol(p, 'km1', {x: 700.4, y: 300.6}));
assert.deepEqual(moved.symbols.km1, [{page: 1, x: 700, y: 301}]); assert.equal(JSON.stringify(moved.poses), before3d, 'el diagrama no mueve la pieza en 3D');
assert.deepEqual(symbolPos(moved, 'km1'), {x: 700, y: 301}); assert.notDeepEqual(symbolPos(moved, 'motor'), {x: 700, y: 301});
const moved3d = must(moveEntity(moved, 'motor', {position: [2, 0, 1], rotation: [0, 0, 0]})); assert.deepEqual(moved3d.symbols, moved.symbols, 'mover en 3D no cambia el diagrama');
assert.ok(!moveSymbol(p, 'nadie', {x: 0, y: 0}).ok); assert.ok(!moveSymbol(p, 'km1', {x: NaN, y: 0}).ok); ok('mover un símbolo no toca la pose 3D y viceversa');
const w0 = wirePoints(p, p.connections.find(c => c.a.entityId === 'red' && c.b.entityId === 'qf1')), w1 = wirePoints(must(moveSymbol(p, 'qf1', {x: 600, y: 300})), p.connections.find(c => c.a.entityId === 'red' && c.b.entityId === 'qf1')); assert.notDeepEqual(w0, w1); ok('los cables siguen al símbolo');
// Cambiar de hoja
const to3 = must(moveToPage(p, 'km1', 3)); assert.deepEqual(pagesOf(to3), [1, 2, 3]); assert.equal(pageOf(to3, 'km1'), 3); assert.deepEqual(to3.symbols.km1[0].page, 3); assert.equal(to3.symbols.km1[0].x, auto.km1.x, 'conserva su posición');
assert.ok(!moveToPage(p, 'km1', 0).ok && !moveToPage(p, 'km1', 1.5).ok && !moveToPage(p, 'km1', 99).ok && !moveToPage(p, 'nadie', 1).ok);
assert.ok(crossPageStubs(to3, 3, autoLayout(to3)).length >= 6, 'el contactor en su propia hoja referencia a sus vecinos'); assert.equal(wirePoints(to3, to3.connections.find(c => c.a.entityId === 'qf1' && c.b.entityId === 'km1')), null);
const back = must(moveToPage(to3, 'km1', 1)); assert.deepEqual(pagesOf(back), [1, 2]); ok('un símbolo cambia de hoja conservando su posición; sus cables pasan a ser referencias y vuelven al regresar');
// Ordenar: un solo cambio con todas las posiciones y hojas
const arranged = must(arrangeAll(to3)); assert.equal(Object.keys(arranged.symbols).length, ids.length); assert.deepEqual(arranged.symbols.km1, [{page: 1, x: auto.km1.x, y: auto.km1.y}]); assert.deepEqual(arranged.symbols.fuente[0].page, 2);
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(arranged))).ok); const bnd = bounds(arranged, 1); assert.ok(bnd.w > 400 && bnd.h > 300); assert.ok(bounds(arranged, 2).w > 400); ok('«Ordenar» recoloca todo (hojas y filas) en un paso y el proyecto sigue siendo válido');
// Otro proyecto
assert.equal(electricalEntities(dd).length, 8); for (const c of dd.connections) { const a = pinPos(dd, c.a), b = pinPos(dd, c.b); if (a.page === b.page) assert.ok(wirePoints(dd, c)); } ok('el ejemplo de arranque directo también se reparte en hojas y se dibuja completo');

console.log(`\n${n} bloques OK`);
