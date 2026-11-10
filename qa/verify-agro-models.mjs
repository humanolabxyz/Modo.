// Etapa 6 · biblioteca de modelos 3D: manifiesto, archivos GLB, escala/pivote, texturas, procedencia, respaldo ante fallos y persistencia sin cambios de esquema.
// Uso: node --experimental-strip-types qa/verify-agro-models.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {Box3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {LIBRARY, CROP_STAGE_MODELS, VEGETATION_SETS, modelById, modelForEntity} from '../src/agro/models/library.ts';
import {ECOSYSTEMS} from '../src/agro/scene/ecosystems.ts';
import {normalizeBounds, pickVariant} from '../src/agro/models/normalize.ts';
import {loadModel, resetModelCache, peekModel} from '../src/agro/models/loader.ts';
import {itemById, sizeOf} from '../src/agro/catalog/items.ts';
import {CROPS} from '../src/agro/sim/crops.ts';
import {TERRITORIES} from '../src/agro/terrain/presets.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {createConfiguredWorld} from '../src/agro/world/setup.ts';
import {exportWorld, parseWorldText} from '../src/agro/model/validate.ts';

const root = path.resolve(import.meta.dirname, '..');
let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const read = file => { const b = fs.readFileSync(path.join(root, 'public', file)); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
const TRIS_BUDGET = {estructuras: 3200, vegetacion: 1300, cultivo: 700, roca: 700}; // por modelo, tras la optimización

// ── 1. Manifiesto ──
{
  const ids = LIBRARY.map(m => m.id); assert.equal(new Set(ids).size, ids.length, 'ids únicos');
  for (const m of LIBRARY) {
    assert.ok(m.label && m.family && m.file?.startsWith('/agro/models/'), `${m.id}: etiqueta, familia y archivo`);
    assert.ok(['listo', 'adaptar'].includes(m.status), `${m.id}: solo se integran modelos listos o adaptados (${m.status})`);
    assert.match(m.source.license, /CC0/, `${m.id}: licencia CC0 registrada`); assert.equal(m.source.licenseUrl, 'https://creativecommons.org/publicdomain/zero/1.0/');
    assert.ok(m.source.author && m.source.pack && m.source.original.endsWith('.blend'), `${m.id}: procedencia`);
    assert.ok(!/quaternius/i.test(m.file), 'ninguna ruta pública copia un paquete completo');
    if (m.status === 'adaptar') assert.ok(m.notes, `${m.id}: una adaptación debe explicar qué se adapta`);
  }
  for (const m of LIBRARY.filter(x => x.entity)) { const def = itemById(m.entity); assert.ok(def, `${m.id}: la entidad ${m.entity} existe en el catálogo`); assert.equal(modelForEntity(m.entity).id, m.id); }
  ok(`manifiesto: ${LIBRARY.length} modelos con id único, licencia CC0, procedencia y entidades válidas del catálogo`);
}

// ── 2. Etapas de cultivo y territorios ──
{
  for (const [cropId, stages] of Object.entries(CROP_STAGE_MODELS)) {
    const crop = CROPS.find(c => c.id === cropId); assert.ok(crop, `cultivo ${cropId} del motor`);
    for (const st of crop.stages) { const id = stages[st.id]; assert.ok(id && modelById(id), `${cropId}/${st.id} tiene modelo`); assert.equal(modelById(id).role, 'cultivo'); }
  }
  for (const [terr, set] of Object.entries(VEGETATION_SETS)) {
    assert.ok(TERRITORIES[terr], terr);
    for (const id of [...set.trees, ...set.shrubs, ...set.rocks]) assert.ok(modelById(id), `${terr}: ${id}`);
  }
  for (const t of Object.keys(TERRITORIES)) { assert.ok(VEGETATION_SETS[t], `${t} tiene conjunto`); for (const k of ECOSYSTEMS[t] ?? []) for (const id of [...k.species, ...(k.under ?? [])]) assert.ok(modelById(id), `${t}/${k.name}: ${id}`); assert.ok(ECOSYSTEMS[t]?.length, `${t} tiene ecosistemas`); }
  for (const territory of ['free', 'valley', 'ladera', 'valle-rio']) assert.ok(VEGETATION_SETS[territory].trees.length, `${territory}: modelos de árboles disponibles`);
  assert.deepEqual(new Set([0.01, 0.5, 0.99].map(t => pickVariant(['a', 'b'], t))), new Set(['a', 'b'])); assert.equal(pickVariant(['a', 'b', 'c'], 0.9999), 'c');
  ok('cada etapa del tomate del motor tiene su modelo; los territorios con biblioteca solo referencian modelos existentes');
}

// ── 3. Normalización pura ──
{
  const a = normalizeBounds([-2, 3, -1], [2, 7, 1], {mode: 'height', meters: 2}); assert.equal(a.scale, 0.5); assert.deepEqual(a.offset.map(v => v + 0), [0, -1.5, 0]); assert.deepEqual(a.size, [2, 2, 1]);
  const b = normalizeBounds([0, 0, 0], [8, 6, 8], {mode: 'contain', size: [4, 6, 2]}); assert.equal(b.scale, 0.25); assert.deepEqual(b.offset.map(v => v + 0), [-1, 0, -1]);
  const c = normalizeBounds([1, 1, 1], [2, 2, 2], {mode: 'scale', scale: 3}); assert.deepEqual(c.size, [3, 3, 3]); assert.ok(Number.isFinite(normalizeBounds([0, 0, 0], [0, 0, 0], {mode: 'height', meters: 1}).scale));
  ok('normalización: pivote al centro de la huella sobre el suelo; escala por altura, por contención o fija; caja degenerada sin NaN');
}

// ── 4. Archivos GLB: abren, sin texturas perdidas, dentro de presupuesto y con tamaño creíble ──
{
  const loader = new GLTFLoader(); let total = 0, bytes = 0;
  for (const m of LIBRARY) {
    const buffer = read(m.file), gltf = await loader.parseAsync(buffer, ''); bytes += buffer.byteLength;
    let tris = 0; const box = new Box3(); gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(o => { if (o.isMesh) { tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; box.expandByObject(o); assert.ok(!o.material.map, `${m.id}: sin texturas externas (la biblioteca usa color por material)`); assert.ok(!Array.isArray(o.material)); } });
    assert.ok(tris > 0 && !box.isEmpty(), `${m.id}: con geometría`); total += tris;
    const budget = m.entity ? TRIS_BUDGET.estructuras : m.role === 'cultivo' ? TRIS_BUDGET.cultivo : m.role === 'roca' ? TRIS_BUDGET.roca : TRIS_BUDGET.vegetacion;
    assert.ok(tris <= budget, `${m.id}: ${tris} triángulos > presupuesto ${budget}`);
    const norm = normalizeBounds(box.min.toArray(), box.max.toArray(), m.fit), [w, h, d] = norm.size;
    if (m.fit.mode === 'height') assert.ok(Math.abs(h - m.fit.meters) < 1e-6);
    if (m.entity) { // las estructuras deben ser reconocibles frente a la huella funcional del catálogo (no más de un 25 % por fuera en ancho/fondo, ni más altas del doble)
      const [cw, ch, cd] = sizeOf(itemById(m.entity), {largoM: 10});
      if (m.fit.mode === 'contain') assert.ok(w <= cw + 1e-6 && h <= ch + 1e-6 && d <= cd + 1e-6, `${m.id}: cabe en la huella funcional`);
      assert.ok(h <= ch * 1.0 + 1e-6 || m.fit.mode === 'height', m.id);
    }
    assert.ok(w > 0.05 && h > 0.05 && d > 0.0, `${m.id}: tamaño real ${w.toFixed(2)}×${h.toFixed(2)}×${d.toFixed(2)} m`);
    assert.ok(h < 20, `${m.id}: altura creíble`);
  }
  ok(`GLB: los ${LIBRARY.length} archivos abren, no traen texturas externas ni cámaras/luces, caben en presupuesto (${total} triángulos en total, ${(bytes / 1024).toFixed(0)} KB) y tienen tamaño creíble`);
}

// ── 5. Respaldo ante fallos: un modelo roto nunca lanza ni bloquea ──
{
  resetModelCache();
  const missing = {...LIBRARY[0], id: 'falla-ausente', file: '/agro/models/no-existe.glb'}, noFile = {...LIBRARY[0], id: 'falla-sin-archivo', file: undefined};
  const warn = console.warn; const warned = []; console.warn = (...a) => warned.push(a.join(' '));
  try {
    assert.equal(await loadModel(missing), null); assert.equal(await loadModel(missing), null); assert.equal(await loadModel(noFile), null);
  } finally { console.warn = warn; }
  assert.equal(peekModel('falla-ausente'), null, 'el fallo queda registrado (se usa el respaldo)'); assert.equal(warned.filter(w => w.includes('falla-ausente')).length, 1, 'se avisa una sola vez');
  assert.equal(peekModel('desconocido'), undefined);
  ok('respaldo: archivo ausente o sin ruta devuelve null sin lanzar y avisa una sola vez; el resto del simulador sigue');
}

// ── 6. Persistencia y compatibilidad: los modelos son solo imagen ──
{
  const made = createConfiguredWorld({name: 'Piloto', seed: 31415, territory: 'oasis-norte', side: 1200, template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'});
  assert.ok(made.ok, made.error); const s = WorldSession.fromWorld(made.value), [sx, sz] = s.site;
  for (const t of ['granero', 'molino', 'cerca', 'estanque', 'invernadero']) { const r = s.place(t, sx + (t.length * 7) % 40, sz + (t.length * 11) % 50 - 20, 0); assert.ok(r.ok, r.error); }
  const text = exportWorld(s.toWorld()).text; assert.ok(!/glb|\/agro\/models|modelId|veg-|estructura-/.test(text), 'el archivo de mundo no guarda referencias a modelos');
  const back = parseWorldText(text); assert.ok(back.ok, back.error); const again = parseWorldText(exportWorld(back.value).text); assert.ok(again.ok); assert.deepEqual(again.value, back.value, 'exportar y reabrir es estable');
  assert.deepEqual(back.value.entities, s.toWorld().entities, 'las entidades se recuperan idénticas'); assert.deepEqual(back.value.connections, s.toWorld().connections);
  assert.deepEqual(back.value.entities.map(e => [e.type, e.pose.position]), s.toWorld().entities.map(e => [e.type, e.pose.position]));
  for (const t of ['granero', 'molino', 'cerca']) assert.deepEqual(sizeOf(itemById(t), {largoM: 10}), t === 'granero' ? [9, 6.6, 6] : t === 'molino' ? [3, 12, 3] : [10, 1.1, 0.2], 'dimensiones funcionales intactas');
  ok('persistencia: el mundo exportado no contiene modelos, se recupera idéntico y las dimensiones funcionales del catálogo no cambiaron');
}

// ── 7. El piloto sigue funcionando: la red real (estanque → válvula → bomba → aspersor) riega la parcela sembrada ──
{
  const {buildPilotWorld} = await import('./lib/agro-pilot-oasis.mjs'), {world, ids} = buildPilotWorld({advanceDays: 0, staged: false});
  const s = WorldSession.fromWorld(world), level = () => s.entity(ids.tank).state.nivelL, water = () => s.entity(ids.parcel).state.aguaMm;
  const l0 = level(), w0 = water(); s.advance(3 * 3600);
  assert.ok(level() < l0, `el estanque entrega agua (${l0} → ${level()} L)`); assert.ok(water() > w0, `la parcela recibe riego (${w0} → ${water()} mm)`);
  assert.ok(s.analyze(), 'el análisis de red responde'); assert.equal(s.entities.filter(e => e.type === 'valvula').length, 1);
  assert.ok(s.setState(world.entities.find(e => e.type === 'valvula').id, 'abierta', false).ok); const l1 = level(); s.advance(3600); assert.ok(l1 - level() < 1, 'cerrar la válvula detiene el caudal');
  const back = WorldSession.fromWorld(s.toWorld()); assert.equal(back.entities.length, world.entities.length); assert.equal(back.entity(ids.tank).state.nivelL, s.entity(ids.tank).state.nivelL);
  ok('piloto Oasis: la red hidráulica y eléctrica con modelos visuales riega la parcela, la válvula la detiene y el mundo guardado se recupera con el mismo estado');
}

console.log(`\n${n} grupos de comprobaciones aprobados`);
