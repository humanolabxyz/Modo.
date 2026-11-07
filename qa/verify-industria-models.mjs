// Formas 3D de las piezas (fase 11): cada tipo de aparato tiene su forma, cabe en la caja del catálogo, lleva un tornillo por terminal y se distingue de las demás.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {modelParts, partBounds, shade} from '../src/industria/scene/models.ts';
import {listShapes, shapeOf} from '../src/industria/build/shapes.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const ROLES = new Set(['body', 'front', 'trim', 'metal', 'screw', 'lens', 'led', 'dark', 'label']);
const signature = parts => parts.map(p => `${p.shape}:${p.role}:${p.color}:${p.size.map(v => v.toFixed(4)).join(',')}`).join('|');

// Color
assert.equal(shade('#808080', 0), '#808080'); assert.equal(shade('#000000', 1), '#ffffff'); assert.equal(shade('#ffffff', -1), '#000000'); assert.match(shade('#5b7fb5', 0.2), /^#[0-9a-f]{6}$/); ok('utilidad de color: aclarar y oscurecer');

const sigs = new Map();
for (const s of listShapes()) {
  const hi = modelParts(s.id, 'high'), lo = modelParts(s.id, 'low');
  assert.ok(hi.length >= 3, `${s.id}: forma demasiado simple (${hi.length} piezas)`); assert.ok(lo.length >= 1 && lo.length <= hi.length, `${s.id}: detalle bajo`);
  assert.ok(lo.length <= 12, `${s.id}: el detalle bajo tiene ${lo.length} piezas (debe ser ligero)`);
  for (const p of hi) {
    assert.ok(ROLES.has(p.role), `${s.id}: rol ${p.role}`); assert.match(p.color, /^#[0-9a-f]{6}$/i, `${s.id}: color ${p.color}`); assert.ok([...p.pos, ...p.size].every(Number.isFinite), `${s.id}: números no finitos`);
    assert.ok(p.size[0] > 0, `${s.id}: tamaño nulo`); if (p.shape === 'box') assert.ok(p.size[1] > 0 && p.size[2] > 0); if (p.shape === 'cyl') { assert.ok(p.size[1] > 0 && ['x', 'y', 'z'].includes(p.axis)); }
  }
  // Cabe en la caja del catálogo (los salientes, como cabezales, palancas y tornillos, hasta 2 cm; el cuerpo, al milímetro)
  const half = s.size.map(v => v / 2);
  for (const p of hi) {
    const b = partBounds(p), tol = ['body', 'front', 'label'].includes(p.role) ? 0.0035 : p.role === 'dark' || p.role === 'led' ? 0.008 : 0.02;
    for (let k = 0; k < 3; k++) { const lo2 = s.center[k] - half[k] - tol, hi2 = s.center[k] + half[k] + tol; assert.ok(b.min[k] >= lo2 - 1e-9 && b.max[k] <= hi2 + 1e-9, `${s.id}: ${p.role} ${p.shape} se sale de la caja en el eje ${'xyz'[k]} (${b.min[k].toFixed(4)}..${b.max[k].toFixed(4)} vs ${lo2.toFixed(4)}..${hi2.toFixed(4)})`); }
  }
  // El cuerpo ocupa casi toda la caja (la forma no es un adorno suelto)
  const body = hi.filter(p => p.role === 'body' || p.role === 'front'); const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const p of body) { const b = partBounds(p); for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], b.min[k]); mx[k] = Math.max(mx[k], b.max[k]); } }
  for (let k = 0; k < 3; k++) assert.ok((mx[k] - mn[k]) >= s.size[k] * 0.55, `${s.id}: el cuerpo ocupa poco de la caja en ${'xyz'[k]}`);
  // Un tornillo por terminal
  const screws = hi.filter(p => p.role === 'screw'); if (s.terminals?.length && s.id !== 'plc-generico' || s.id === 'plc-generico') assert.equal(screws.length, s.terminals?.length ?? 0, `${s.id}: tornillos ≠ terminales`);
  // Cada tornillo está sobre su terminal
  for (const t of s.terminals ?? []) assert.ok(screws.some(p => Math.hypot(p.pos[0] - (t.position[0] - s.center[0] + s.center[0]), p.pos[1] - t.position[1], p.pos[2] - t.position[2]) < 0.006), `${s.id}.${t.id}: sin tornillo encima`);
  const sig = signature(hi); assert.ok(!sigs.has(sig), `${s.id} tiene la misma forma que ${sigs.get(sig)}`); sigs.set(sig, s.id);
}
ok(`las ${listShapes().length} piezas del catálogo tienen forma propia, caben en su caja, el cuerpo la ocupa y cada terminal lleva su tornillo`);

// Rasgos que identifican a cada aparato
const has = (id, pred) => modelParts(id).some(pred);
assert.ok(has('breaker-3p', p => p.role === 'trim' && p.shape === 'box') && modelParts('breaker-3p').filter(p => p.role === 'trim').length >= 4, 'interruptor 3P: tres palancas y su barra');
assert.equal(modelParts('breaker-1p').filter(p => p.role === 'trim').length, 1, 'interruptor 1P: una palanca');
assert.ok(has('pulsador-na', p => p.shape === 'cyl' && p.role === 'trim' && p.color === '#2f9e5b') && has('pulsador-nc', p => p.shape === 'cyl' && p.role === 'trim' && p.color === '#c0392b'), 'pulsadores: cabezal redondo verde (NA) y rojo (NC)');
assert.ok(has('piloto', p => p.shape === 'sphere' && p.role === 'lens'), 'piloto: lente esférica');
assert.ok(has('motor-3p', p => p.shape === 'cyl' && p.axis === 'x' && p.role === 'body') && modelParts('motor-3p').filter(p => p.shape === 'cyl' && p.axis === 'x' && p.role === 'body').length >= 6, 'motor: carcasa cilíndrica con aletas');
assert.ok(has('motor-3p', p => p.role === 'metal' && p.shape === 'cyl' && p.axis === 'x'), 'motor: eje');
assert.ok(modelParts('plc-generico').filter(p => p.role === 'led').length === 8, 'PLC: un LED por entrada y salida');
assert.ok(modelParts('fuente-cc').filter(p => p.role === 'dark' && p.size[1] < 0.004).length >= 4, 'fuente: ranuras de ventilación');
assert.ok(has('contactor-3p', p => p.role === 'trim') && modelParts('contactor-3p').filter(p => p.role === 'screw').length === 10, 'contactor: botón de prueba y 10 tornillos');
assert.ok(modelParts('placa').filter(p => p.shape === 'cyl' && p.role === 'dark').length === 6, 'placa: 6 agujeros de fijación');
const rail = modelParts('riel'); assert.ok(rail.length >= 8 && rail.some(p => p.role === 'dark'), 'riel: perfil omega con ranuras'); ok('cada aparato tiene los rasgos que lo identifican (palancas, cabezales, lente, aletas, LED, ranuras, agujeros)');

// Detalle bajo y desconocidos
for (const id of ['plc-generico', 'motor-3p', 'breaker-3p']) assert.ok(modelParts(id, 'low').length < modelParts(id, 'high').length / 1.5, `${id}: el detalle bajo debe ser bastante más ligero`);
const unknown = modelParts('no-existe'); assert.equal(unknown.length, 1); assert.equal(unknown[0].shape, 'box'); ok('con muchas piezas se usa un detalle ligero; una definición desconocida se dibuja como caja');
// Anclajes: la cara de montaje de un aparato de riel queda libre de adornos (el dorso no sobresale)
for (const s of listShapes().filter(x => x.anchors.some(a => a.kind === 'din-rail' && a.role === 'child'))) { const back = s.center[2] - s.size[2] / 2; for (const p of modelParts(s.id)) assert.ok(partBounds(p).min[2] >= back - 0.0035, `${s.id}: ${p.role} sobresale por el dorso`); }
ok('los aparatos de riel no sobresalen por el dorso, que es donde se acoplan');
console.log(`\n${n} bloques OK`);
