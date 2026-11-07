// Nave industrial (fase 14): tamaño según la planta, primitivas válidas dentro de la nave, elementos de una empresa real y activación solo con piso. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {hallBounds, hallParts, hasHall, HALL_HEIGHT} from '../src/industria/scene/hall.ts';
import {exampleMiniFactory} from '../src/industria/sim/examples.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };

const empty = hallBounds([]); assert.ok(empty.w >= 24 && empty.d >= 16 && empty.h === HALL_HEIGHT); ok('sin piezas la nave tiene un tamaño mínimo amplio');
const f = exampleMiniFactory().value, pos = Object.values(f.poses).map(p => p.position), b = hallBounds(pos);
const xs = pos.map(p => p[0]), zs = pos.map(p => p[2]);
assert.ok(b.cx - b.w / 2 < Math.min(...xs) - 3 && b.cx + b.w / 2 > Math.max(...xs) + 3 && b.cz - b.d / 2 < Math.min(...zs) - 3 && b.cz + b.d / 2 > Math.max(...zs) + 3, 'la nave rodea la planta con paso suficiente');
assert.ok(b.w >= 24 && b.d >= 16); ok(`la nave de la mini fábrica mide ${b.w.toFixed(1)} × ${b.d.toFixed(1)} m y rodea toda la planta con pasillo`);
const big = hallBounds([[0, 0, 0], [200, 0, 200]]); assert.ok(big.w <= 80 && big.d <= 60); ok('el tamaño de la nave tiene tope');

const parts = hallParts(b);
assert.ok(parts.length > 120 && parts.length < 900, `${parts.length} primitivas`);
for (const p of parts) { assert.ok([...p.pos, ...p.size].every(Number.isFinite), p.kind); assert.ok(p.size[0] > 0 && (p.shape === 'cyl' ? p.size[1] > 0 : p.size[1] > 0 && p.size[2] > 0)); assert.match(p.color, /^#[0-9a-f]{6}$/i); }
const x0 = b.cx - b.w / 2, x1 = b.cx + b.w / 2, z0 = b.cz - b.d / 2, z1 = b.cz + b.d / 2;
for (const p of parts) { assert.ok(p.pos[0] >= x0 - 0.2 && p.pos[0] <= x1 + 0.2 && p.pos[2] >= z0 - 0.2 && p.pos[2] <= z1 + 0.2, `${p.kind} fuera de la nave`); assert.ok(p.pos[1] >= -0.1 && p.pos[1] <= HALL_HEIGHT + 0.1); }
ok(`${parts.length} primitivas válidas, todas dentro de la nave`);

const kinds = new Set(parts.map(p => p.kind)); for (const k of ['floor', 'mark', 'wall', 'glass', 'door', 'steel', 'lamp', 'prop', 'sign']) assert.ok(kinds.has(k), `falta ${k}`);
assert.ok(parts.filter(p => p.kind === 'lamp').length >= 8 && parts.filter(p => p.kind === 'glass').length >= 6, 'lámparas y ventanas');
ok('hay suelo con marcas, paredes, ventanas, portón, columnas, lámparas, estanterías y señalética');

// El decorado no se mete en la planta: nada de la nave ocupa la zona de trabajo (piso de planta) por encima del suelo
const floor = f.poses.piso.position, fx0 = floor[0] - 7, fx1 = floor[0] + 7, fz0 = floor[2] - 4, fz1 = floor[2] + 4;
for (const p of parts) if (['prop', 'steel'].includes(p.kind) && p.pos[1] < 3) assert.ok(!(p.pos[0] > fx0 && p.pos[0] < fx1 && p.pos[2] > fz0 && p.pos[2] < fz1), `${p.kind} dentro de la zona de trabajo`);
ok('estanterías, palets y columnas quedan fuera de la zona de trabajo');

assert.equal(hasHall(['piso-planta', 'motor-3p']), true); assert.equal(hasHall(['motor-3p']), false); ok('la nave solo aparece cuando el proyecto tiene un piso de planta');
console.log(`\n${n} comprobaciones de la nave OK`);
