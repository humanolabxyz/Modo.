// Catálogo de Industria (fase 4): integridad, trazabilidad, terminales, anclajes y búsqueda. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {ITEMS} from '../src/industria/catalog/items.ts';
import {FAMILIES, searchItems, countByFamily, fold} from '../src/industria/catalog/search.ts';
import {shapeOf, listShapes, STATUS_LABEL} from '../src/industria/build/shapes.ts';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity} from '../src/industria/model/commands.ts';
import {findSnapCandidates} from '../src/industria/build/snap.ts';
import {snapMount} from '../src/industria/build/commands.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const pose = (x, y, z) => ({position: [x, y, z], rotation: [0, 0, 0]});

// Ids únicos y datos básicos
assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length); assert.ok(ITEMS.length >= 10);
for (const i of ITEMS) { assert.ok(i.name && i.description !== '' && i.size.every(v => v > 0), i.id); assert.ok(FAMILIES.includes(i.family), `${i.id}: familia fuera de la lista (${i.family})`); }
ok('ids únicos, medidas positivas y familias válidas');

// Trazabilidad: nada verificado sin fuente; nada con fabricante o valores comerciales inventados
for (const i of ITEMS) {
  assert.ok(['generic', 'unverified', 'verified'].includes(i.status), i.id);
  if (i.status === 'verified') { assert.ok(i.source && i.source.ref && i.source.checkedAt, `${i.id}: «verificado» exige fuente y fecha`); }
  assert.ok(!('manufacturer' in i) && !('partNumber' in i) && !('ratings' in i), `${i.id}: sin datos comerciales en el catálogo genérico`);
  assert.ok(STATUS_LABEL[i.status]);
  const text = `${i.name} ${i.description}`;
  assert.ok(!/\b\d+\s?(V|A|kW|W|Hz|kA)\b/.test(text), `${i.id}: el texto no debe incluir magnitudes eléctricas de un producto (${text})`);
}
assert.equal(ITEMS.filter(i => i.status === 'verified').length, 0, 'por ahora todo es genérico: ninguno se presenta como verificado'); ok('sin ítems «verificados» sin fuente y sin magnitudes comerciales en los textos');

// Anclajes: normales unitarias; hijos con anfitrión posible en el catálogo; límites de deslizamiento coherentes
const hostKinds = new Set(ITEMS.flatMap(i => i.anchors.filter(a => a.role === 'host').map(a => a.kind)));
for (const i of ITEMS) for (const a of i.anchors) {
  assert.ok(Math.abs(Math.hypot(...a.normal) - 1) < 1e-9, `${i.id}.${a.id}`);
  if (a.role === 'child') assert.ok(hostKinds.has(a.kind), `${i.id}.${a.id}: ningún anfitrión acepta ${a.kind}`);
  if (a.slide) { assert.equal(a.slide.axes.length, a.slide.limits.length); for (const [lo, hi] of a.slide.limits) assert.ok(lo < hi); }
}
ok('anclajes con normales unitarias y anfitrión disponible para cada tipo de hijo');

// Terminales: ids únicos por ítem, dentro de la caja (con holgura de 1 cm) y con fuente de marcado
for (const i of ITEMS.filter(x => x.terminals)) {
  const ids = i.terminals.map(t => t.id); assert.equal(new Set(ids).size, ids.length, `${i.id}: terminales repetidos`);
  assert.ok(i.terminalSource, `${i.id}: falta la procedencia del marcado de terminales`);
  for (const t of i.terminals) for (let k = 0; k < 3; k++) assert.ok(Math.abs(t.position[k] - i.center[k]) <= i.size[k] / 2 + 0.01, `${i.id}.${t.id} fuera de la caja`);
}
// Terminales separados al menos 8 mm: si no, no se pueden pulsar por separado en el escenario
for (const i of ITEMS.filter(x => x.terminals)) for (let a = 0; a < i.terminals.length; a++) for (let b = a + 1; b < i.terminals.length; b++) assert.ok(Math.hypot(...i.terminals[a].position.map((v, k) => v - i.terminals[b].position[k])) >= 0.008, `${i.id}: ${i.terminals[a].id} y ${i.terminals[b].id} demasiado juntos`);
const c3 = shapeOf('contactor-3p'); assert.deepEqual(c3.terminals.map(t => t.id).sort(), ['1', '13', '14', '2', '3', '4', '5', '6', 'A1', 'A2'].sort());
assert.deepEqual(shapeOf('breaker-3p').terminals.map(t => t.id), ['1', '3', '5', '2', '4', '6']); ok('terminales con marcado convencional, sin repetir y dentro de la pieza');

// Aparamenta de riel: todo aparato con clip se monta sobre un riel de verdad
let p = newIndustryProject('Catálogo');
p = must(addEntity(p, {id: 'placa', definitionId: 'placa', label: 'Placa', pose: pose(0, 0, 0)}));
p = must(addEntity(p, {id: 'riel', definitionId: 'riel', label: 'Riel', pose: pose(0, 0.5, 0.06)}));
p = must(snapMount(p, findSnapCandidates(p, 'riel')[0]));
const railZ = p.poses.riel.position[2];
let x = -0.25, count = 0;
for (const i of ITEMS.filter(i => i.anchors.some(a => a.role === 'child' && a.kind === 'din-rail'))) {
  const id = 'd-' + i.id; p = must(addEntity(p, {id, definitionId: i.id, label: i.name, pose: pose(x, 0.5, railZ + 0.005 + i.size[2] / 2 + 0.02)}));
  const cand = findSnapCandidates(p, id, undefined, {range: 0.2})[0]; assert.ok(cand, `${i.id}: no encuentra el riel`); assert.equal(cand.parent.entityId, 'riel');
  p = must(snapMount(p, cand)); x += i.size[0] + 0.02; count++;
}
assert.ok(count >= 6); assert.equal(p.mounts.length, 1 + count); ok(`los ${count} aparatos de riel se montan sobre el riel`);
// Motor sobre el suelo: base (surface) sobre bloque
p = must(addEntity(p, {id: 'bloque', definitionId: 'generico', label: 'Bloque', pose: pose(2, 0, 0)}));
p = must(addEntity(p, {id: 'motor', definitionId: 'motor-3p', label: 'M1', pose: pose(2.05, 0.43, 0.02)}));
assert.equal(findSnapCandidates(p, 'motor')[0].parent.entityId, 'bloque'); ok('el motor se apoya por su base');

// Búsqueda: sin tildes, por palabras, por terminal y por familia
assert.equal(fold('Automatización'), 'automatizacion');
assert.ok(searchItems('contactor').some(i => i.id === 'contactor-3p'));
assert.deepEqual(searchItems('plc').map(i => i.id), ['plc-generico']);
assert.ok(searchItems('A1').some(i => i.id === 'contactor-3p')); assert.deepEqual(searchItems('zzz'), []);
assert.ok(searchItems('', 'Electricidad industrial').every(i => i.family === 'Electricidad industrial')); assert.equal(searchItems('').length, ITEMS.length);
assert.ok(searchItems('interruptor 3p').every(i => i.id === 'breaker-3p')); ok('búsqueda sin tildes, por palabras, por terminal y por familia');
const counts = countByFamily(); assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), ITEMS.length); assert.equal(counts['Neumática'], 0); assert.ok(counts['Electricidad industrial'] >= 5); ok('conteo por familia (las familias sin piezas quedan en 0, sin inventar contenido)');

// Compatibilidad: ids de la fase 3 y forma desconocida
for (const id of ['generico', 'placa', 'riel', 'aparato-din']) assert.ok(listShapes().some(s => s.id === id), id);
assert.equal(shapeOf('no-existe').status, 'unverified'); ok('ids de la fase 3 conservados; las definiciones desconocidas no fallan');
console.log(`\n${n} bloques OK`);
