// Agro, Fase 1: terreno determinista, edición con deshacer, picking, chunks con LOD y minimapa. Puro (Node 24 ejecuta .ts).
import assert from 'node:assert/strict';
import {createHeightfield, sampleHeight, slopeDegrees, normalAt, checksum, heightRange, applyEdit, inBounds} from '../src/agro/terrain/heightfield.ts';
import {TerrainModel, CHUNK_CELLS} from '../src/agro/terrain/model.ts';
import {raycastHeightfield} from '../src/agro/terrain/raycast.ts';
import {buildChunk, chunkRect, lodForDistance, LOD_STRIDES} from '../src/agro/terrain/chunks.ts';
import {renderMinimap} from '../src/agro/terrain/minimap.ts';
import {valueNoise, fbm, hash2, mulberry32} from '../src/agro/terrain/noise.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, exportWorld, parseWorldText} from '../src/agro/model/validate.ts';
import {LIMITS} from '../src/agro/model/types.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const spec = (seed = 1234) => ({sizeMeters: [1000, 1000], cellMeters: 2, seed});

// Ruido y semilla
assert.equal(hash2(5, 3, 4), hash2(5, 3, 4)); assert.notEqual(hash2(5, 3, 4), hash2(6, 3, 4));
const a = mulberry32(42), b = mulberry32(42); for (let i = 0; i < 20; i++) assert.equal(a(), b());
for (let i = 0; i < 200; i++) { const v = fbm(9, i * 0.37, i * 0.11); assert.ok(v >= 0 && v < 1); assert.ok(valueNoise(3, i * 0.5, -i * 0.3) >= 0); }
ok('ruido determinista y acotado a [0, 1)');

// Terreno base: tamaño, determinismo y relieve
const t0 = performance.now();
const hf = createHeightfield(spec());
const genMs = performance.now() - t0;
assert.equal(hf.nx, 501); assert.equal(hf.nz, 501); assert.equal(hf.data.length, 501 * 501);
assert.equal(checksum(createHeightfield(spec())), checksum(hf)); ok('misma semilla → mismo terreno (suma de verificación idéntica)');
assert.notEqual(checksum(createHeightfield(spec(99))), checksum(hf)); ok('otra semilla → otro terreno');
const {min, max} = heightRange(hf);
assert.ok(max - min > 60 && max - min < 400, `relieve ${min}..${max}`); assert.ok(min > -50 && max < 500); ok(`relieve creíble (${min.toFixed(0)} a ${max.toFixed(0)} m)`);
assert.ok(genMs < 1500, `generación ${genMs.toFixed(0)} ms`); ok(`100 ha se generan en ${genMs.toFixed(0)} ms`);

// La zona de la finca (meseta central) es llana; las laderas no
let worstFarm = 0, worstEast = 0;
for (let x = -90; x <= 90; x += 15) for (let z = -90; z <= 90; z += 15) worstFarm = Math.max(worstFarm, slopeDegrees(hf, x, z));
for (let z = -300; z <= 300; z += 30) worstEast = Math.max(worstEast, slopeDegrees(hf, 420, z));
assert.ok(worstFarm < 4, `pendiente máxima en la finca ${worstFarm.toFixed(1)}°`); assert.ok(worstEast > 12, `pendiente en la ladera ${worstEast.toFixed(1)}°`);
assert.ok(Math.abs(sampleHeight(hf, 0, 0) - 20) < 1.5); ok(`meseta central llana (${worstFarm.toFixed(1)}° máx.) y laderas marcadas (${worstEast.toFixed(0)}°)`);

// Muestreo
const i = 120, j = 310, x = hf.originX + i * 2, z = hf.originZ + j * 2;
assert.equal(sampleHeight(hf, x, z), hf.data[j * hf.nx + i]); ok('la cota en un nodo es exactamente la de la malla');
const mid = sampleHeight(hf, x + 1, z), lo = Math.min(hf.data[j * hf.nx + i], hf.data[j * hf.nx + i + 1]), hi = Math.max(hf.data[j * hf.nx + i], hf.data[j * hf.nx + i + 1]);
assert.ok(mid >= lo - 1e-4 && mid <= hi + 1e-4); ok('interpolación bilineal entre nodos');
assert.equal(sampleHeight(hf, -5000, 0), sampleHeight(hf, hf.originX, 0)); assert.ok(!inBounds(hf, 600, 0) && inBounds(hf, 499, -499)); ok('fuera del mapa se toma el borde');
const nrm = normalAt(hf, 0, 0); assert.ok(Math.abs(Math.hypot(...nrm) - 1) < 1e-6 && nrm[1] > 0.99); ok('normales unitarias y verticales en terreno llano');

// Ediciones
const flat = createHeightfield(spec(7)); const h0 = sampleHeight(flat, 0, 0);
applyEdit(flat, {kind: 'raise', center: [0, 0], radius: 20, amount: 3});
assert.ok(Math.abs(sampleHeight(flat, 0, 0) - (h0 + 3)) < 0.06, 'sube ≈3 m en el centro'); assert.ok(sampleHeight(flat, 0, 0) > sampleHeight(flat, 10, 0)); ok('subir: +3 m en el centro con atenuación suave');
const edge = createHeightfield(spec(7)); applyEdit(edge, {kind: 'raise', center: [0, 0], radius: 20, amount: 3});
assert.equal(sampleHeight(edge, 30, 0), createHeightfield(spec(7)).data[(250) * 501 + 265]); ok('fuera del radio no cambia nada');
applyEdit(flat, {kind: 'lower', center: [0, 0], radius: 20, amount: 3}); assert.ok(Math.abs(sampleHeight(flat, 0, 0) - h0) < 0.07); ok('bajar compensa a subir');
const slope = createHeightfield(spec(7)); applyEdit(slope, {kind: 'level', center: [400, 0], radius: 40, amount: 55});
assert.ok(Math.abs(sampleHeight(slope, 400, 0) - 55) < 0.06); ok('nivelar: el centro queda en la cota objetivo');
const big = createHeightfield(spec(7)); applyEdit(big, {kind: 'raise', center: [0, 0], radius: 50, amount: 9999}); assert.ok(heightRange(big).max <= 500); ok('las alturas se acotan');

// Modelo: trazos, deshacer, rehacer, reproducibilidad
const model = TerrainModel.fromTerrain(newWorld('t', {seed: 555}).terrain);
const base = model.checksum(); assert.equal(model.edits.length, 0); assert.ok(!model.canUndo);
model.beginStroke(); for (let k = 0; k < 5; k++) assert.ok(model.stamp('raise', k * 10, 0, 15, 1).ok); model.endStroke();
const afterA = model.checksum(); assert.notEqual(afterA, base); assert.equal(model.edits.length, 5);
model.beginStroke(); model.stamp('level', 100, 100, 25, 30); model.stamp('lower', 120, 100, 25, 2); model.endStroke();
const afterB = model.checksum(); assert.equal(model.edits.length, 7);
assert.ok(model.undo()); assert.equal(model.checksum(), afterA); assert.equal(model.edits.length, 5);
assert.ok(model.undo()); assert.equal(model.checksum(), base); assert.equal(model.edits.length, 0); assert.ok(!model.undo()); ok('deshacer devuelve el terreno exacto, trazo por trazo');
assert.ok(model.redo()); assert.equal(model.checksum(), afterA); assert.ok(model.redo()); assert.equal(model.checksum(), afterB); assert.ok(!model.redo()); ok('rehacer reproduce el terreno exacto');
model.undo(); model.beginStroke(); model.stamp('raise', 0, 0, 10, 1); model.endStroke(); assert.ok(!model.canRedo); ok('un trazo nuevo descarta el rehacer');
assert.ok(!model.stamp('raise', 0, 0, 10, 1).ok); ok('no se puede marcar sin abrir un trazo');
model.beginStroke(); assert.equal(model.stamp('raise', 0, 0, 1, 1).ok, false); assert.equal(model.stamp('raise', 0, 0, 500, 1).ok, false); assert.equal(model.stamp('raise', NaN, 0, 10, 1).ok, false); model.endStroke(); ok('rechaza radios y valores no válidos');
assert.ok(!model.canUndo === false); // el trazo vacío no se registra
const before = model.edits.length; model.beginStroke(); model.endStroke(); assert.equal(model.edits.length, before); ok('un trazo vacío no deja rastro');

// Reproducibilidad: guardar → reabrir
const saved = model.toTerrain(), reopened = TerrainModel.fromTerrain(JSON.parse(JSON.stringify(saved)));
assert.equal(reopened.checksum(), model.checksum()); assert.equal(reopened.edits.length, model.edits.length); ok('un terreno guardado con sus ediciones se reabre idéntico');
const w = newWorld('mundo', {seed: 555}); w.terrain = saved;
const parsed = parseWorld(w); assert.ok(parsed.ok, parsed.error);
const back = parseWorldText(exportWorld(parsed.value).text); assert.ok(back.ok); assert.equal(TerrainModel.fromTerrain(back.value.terrain).checksum(), model.checksum()); ok('exportar e importar el mundo conserva el terreno editado');
const reopenedModel = TerrainModel.fromTerrain(saved); reopenedModel.beginStroke(); const nid = reopenedModel.stamp('raise', 1, 1, 10, 1); reopenedModel.endStroke();
assert.ok(nid.ok && !saved.edits.some(e => e.id === nid.edit.id)); ok('los ids de ediciones nuevas no chocan con los guardados');
const full = TerrainModel.fromTerrain(newWorld('lleno', {seed: 1}).terrain); full.beginStroke();
let refused = false; for (let k = 0; k <= LIMITS.terrainEdits; k++) { const r = full.stamp('raise', 0, 0, 3, 0.001); if (!r.ok) { refused = true; assert.match(r.error, /límite/); break; } } full.endStroke(); assert.ok(refused); ok(`límite de ${LIMITS.terrainEdits} ediciones`);

// Versiones por chunk: solo cambian los afectados
const vm = TerrainModel.fromTerrain(newWorld('v', {seed: 3}).terrain); const v0 = Array.from(vm.versions);
vm.beginStroke(); vm.stamp('raise', 0, 0, 10, 1); vm.endStroke();
const changed = Array.from(vm.versions).map((v, k) => (v !== v0[k] ? k : -1)).filter(k => k >= 0);
assert.ok(changed.length >= 1 && changed.length <= 4, `chunks afectados: ${changed.length}`); ok(`una edición central solo invalida ${changed.length} de ${vm.versions.length} chunks`);

// Picking
const ground = sampleHeight(hf, 0, 0), top = [0, ground + 200, 0];
let hit = raycastHeightfield(hf, top, [0, -1, 0]); assert.ok(hit && Math.abs(hit.x) < 1e-6 && Math.abs(hit.y - ground) < 0.01 && Math.abs(hit.distance - 200) < 0.05); ok('rayo vertical: da la cota exacta del suelo');
const dir = (() => { const d = [0.6, -0.5, 0.62], l = Math.hypot(...d); return d.map(v => v / l); })();
hit = raycastHeightfield(hf, [-80, sampleHeight(hf, -80, -150) + 120, -150], dir);
assert.ok(hit && Math.abs(hit.y - sampleHeight(hf, hit.x, hit.z)) < 0.01); ok('rayo oblicuo: el punto de impacto está sobre la superficie');
assert.equal(raycastHeightfield(hf, [0, 900, 0], [0, 1, 0]), null); assert.equal(raycastHeightfield(hf, [0, 900, 0], [1, 0.0001, 0].map(v => v / Math.hypot(1, 0.0001, 0))), null); ok('rayo al cielo o al horizonte: sin impacto');
assert.equal(raycastHeightfield(hf, [0, ground - 5, 0], [0, -1, 0]), null); ok('origen bajo el suelo: sin impacto');
let pick = 0; const p0 = performance.now(); for (let k = 0; k < 200; k++) { const o = [-300 + k, 400, 500], d = [0.2, -0.45, -0.87], l = Math.hypot(...d); if (raycastHeightfield(hf, o, d.map(v => v / l))) pick++; } const pickMs = (performance.now() - p0) / 200;
assert.ok(pickMs < 2, `${pickMs.toFixed(2)} ms por rayo`); ok(`picking: ${pickMs.toFixed(2)} ms por rayo (${pick}/200 impactos)`);

// Chunks y LOD
assert.equal(CHUNK_CELLS, 50);
const counts = LOD_STRIDES.map((_, lod) => buildChunk(hf, 4, 5, lod));
assert.ok(counts[0].triangles > counts[1].triangles && counts[1].triangles > counts[2].triangles); ok(`LOD reduce triángulos: ${counts.map(c => c.triangles).join(' → ')}`);
for (const c of counts) { assert.equal(c.positions.length, c.vertices * 3); assert.ok(c.indices.length % 3 === 0); let maxIdx = 0; for (const v of c.indices) maxIdx = Math.max(maxIdx, v); assert.ok(maxIdx < c.vertices); assert.ok(c.positions.every(Number.isFinite) && c.normals.every(Number.isFinite) && c.colors.every(v => v >= 0 && v <= 1.01)); }
ok('geometría válida: índices en rango y valores finitos');
const r = chunkRect(hf, 4, 5); const c0 = counts[0];
for (let k = 0; k < c0.vertices; k++) { const px = c0.positions[k * 3], pz = c0.positions[k * 3 + 2]; assert.ok(px >= r.centerX - 50.001 && px <= r.centerX + 50.001 && pz >= r.centerZ - 50.001 && pz <= r.centerZ + 50.001); } ok('los vértices quedan dentro del chunk (100 m)');
// Bordes compartidos: la altura en el borde coincide entre chunks vecinos en el mismo LOD
const A = buildChunk(hf, 3, 3, 0), B = buildChunk(hf, 4, 3, 0), edgeX = hf.originX + 200 * 2;
const ys = pts => new Map(pts.filter(([px]) => Math.abs(px - edgeX) < 1e-3).map(([, py, pz]) => [pz.toFixed(2), py]));
const pts = d => Array.from({length: d.vertices}, (_, k) => [d.positions[k * 3], d.positions[k * 3 + 1], d.positions[k * 3 + 2]]);
const ea = ys(pts(A).slice(0, 51 * 51)), eb = ys(pts(B).slice(0, 51 * 51)); let shared = 0; for (const [zk, y] of ea) if (eb.has(zk)) { assert.ok(Math.abs(eb.get(zk) - y) < 1e-4); shared++; } assert.ok(shared >= 40); ok('los bordes de chunks vecinos coinciden (sin grietas en el mismo LOD)');
assert.deepEqual([lodForDistance(50), lodForDistance(300), lodForDistance(2000)], [0, 1, 2]); ok('el LOD se elige por distancia');
let totalTris = 0, worst = 0; const t1 = performance.now(); for (let cz = 0; cz < 10; cz++) for (let cx = 0; cx < 10; cx++) { const d = buildChunk(hf, cx, cz, 2); totalTris += d.triangles; worst = Math.max(worst, d.triangles); } const buildMs = performance.now() - t1;
assert.ok(totalTris < 40_000); ok(`las 100 ha completas en LOD lejano: ${totalTris} triángulos (${buildMs.toFixed(0)} ms)`);
const near = buildChunk(hf, 5, 5, 0), t2 = performance.now(); buildChunk(hf, 5, 5, 0); const oneMs = performance.now() - t2; assert.ok(oneMs < 60, `${oneMs} ms`); ok(`un chunk de máximo detalle se construye en ${oneMs.toFixed(1)} ms (${near.triangles} triángulos)`);

// Minimapa
const mm = renderMinimap(hf, 64); assert.equal(mm.length, 64 * 64 * 4); assert.ok(mm.every((v, k) => k % 4 !== 3 || v === 255)); const distinct = new Set(Array.from({length: 64 * 64}, (_, k) => mm[k * 4])).size; assert.ok(distinct > 20); ok('el minimapa es una imagen opaca con relieve visible');

// Río y camino decorativos (Fase 5d)
{
  const {riverX, riverInfo, riverPoints, roadPoints, roadDist} = await import('../src/agro/terrain/landmarks.ts');
  for (const seed of [1, 7, 21, 999]) {
    for (let z = -450; z <= 450; z += 15) { const x = riverX(seed, z); assert.ok(x > 110 && x < 330, `el río de la semilla ${seed} queda fuera de la zona de trabajo (x=${x.toFixed(0)})`); }
    assert.equal(riverX(seed, 33.3), riverX(seed, 33.3)); assert.ok(riverInfo(seed, riverX(seed, 80), 80).dist < 1e-9);
    const road = roadPoints(seed, 500); assert.equal(road.length, 41); assert.ok(Math.hypot(road.at(-1).x - 24, road.at(-1).z - 30) < 1e-6, 'el camino llega a la finca');
    assert.ok(roadDist(seed, 500, road[10].x, road[10].z, road) < 1e-9 && roadDist(seed, 500, road[10].x + 300, road[10].z + 300, road) > 50);
    for (const p of road) assert.ok(Math.abs(p.x - riverX(seed, p.z)) > 30, 'el camino no cruza el río');
  }
  assert.notEqual(riverX(1, 100), riverX(2, 100)); assert.equal(riverPoints(5, -100, 100).length, 21);
  ok('río y camino: fuera de la zona de trabajo y lejos entre sí, deterministas por semilla');
}

console.log(`\n${n} comprobaciones OK`);
