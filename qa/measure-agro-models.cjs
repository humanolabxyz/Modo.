// Etapa 6: mide y fotografía el mundo piloto (Oasis nortino) con el mismo encuadre antes y después de integrar modelos.
// Uso: AGRO_URL=http://127.0.0.1:4325 AGRO_QA_OUT=<carpeta> AGRO_LABEL=antes node qa/measure-agro-models.cjs
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const {fixtureOpen} = require('./verify-agro-territory-ui.cjs');
const {diagnostics, ready, camera, profile} = require('./review-agro-etapa3.cjs');
const url = process.env.AGRO_URL || 'http://127.0.0.1:4325', out = process.env.AGRO_QA_OUT, label = process.env.AGRO_LABEL || 'medicion';
assert.ok(out, 'Define AGRO_QA_OUT');
// Carga máxima: 150 piezas y 10 parcelas sembradas con tomate en etapas distintas, en el Oasis nortino (donde hay modelos).
async function stress(buildPilotWorld) {
  const {createConfiguredWorld} = await import('../src/agro/world/setup.ts'), {WorldSession} = await import('../src/agro/world/session.ts');
  const made = createConfiguredWorld({name: 'Carga · 150 piezas Oasis', seed: 31415, territory: 'oasis-norte', side: 1200, template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'});
  assert.ok(made.ok, made.error); const s = WorldSession.fromWorld(made.value), parcels = [];
  const add = (type, x, z, params) => { const r = s.place(type, x, z, 0, {params}); assert.ok(r.ok, r.error); return r.value; };
  for (let i = 0; i < 10; i++) parcels.push(add('parcela', (i % 5 - 2) * 24, i < 5 ? -19 : 19, {anchoM: 18, largoM: 25}));
  const types = ['bomba', 'tuberia', 'estanque', 'tablero', 'emisor', 'panel-solar'];
  for (let i = 0; i < 140; i++) add(types[i % types.length], (i % 20 - 9.5) * 8, (Math.floor(i / 20) - 3) * 9);
  parcels.forEach((p, i) => { assert.ok(s.plant(p.id, 'tomate').ok); assert.ok(s.setState(p.id, 'gdd', 100 + i * 110).ok); });
  return {world: s.toWorld(), ids: {}};
}
(async () => {
  fs.mkdirSync(out, {recursive: true});
  const {buildPilotWorld} = await import('./lib/agro-pilot-oasis.mjs'); const {world, ids} = process.env.AGRO_WORLD === 'stress' ? await stress(buildPilotWorld) : buildPilotWorld();
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--enable-precise-memory-info']});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'}); await context.addInitScript(diagnostics); if (process.env.AGRO_MODELS === 'off') await context.addInitScript(() => localStorage.setItem('modo-agro-modelos', 'off'));
  const page = await context.newPage(), errors = [], bad = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push('console: ' + m.text())); page.on('response', r => r.status() >= 400 && bad.push(r.status() + ' ' + r.url()));
  await page.goto(url + '/agro/'); await page.locator('[data-view=lobby]').waitFor();
  await fixtureOpen(page, world); await ready(page);
  const [sx, sz] = world.scenario.site, res = {label, views: {}}, shots = {
    general: {mode: 'orbit', offset: [48, 26, 62], target: [sx, null, sz]},
    instalacion: {mode: 'orbit', offset: [14, 8, 20], target: [sx - 8, null, sz + 4]},
    parcela: {mode: 'orbit', offset: [10, 6, 12], target: [sx - 10, null, sz + 24]},
    lejos: {mode: 'orbit', offset: [150, 70, 190], target: [sx, null, sz]},
  };
  for (const [name, v] of Object.entries(shots)) {
    await camera(page, v.mode, v.offset, v.target); await page.waitForTimeout(1500);
    res.views[name] = await profile(page, world);
    await page.mouse.move(10, 15); await page.screenshot({path: path.join(out, `${label}-${name}.png`)});
  }
  res.entities = world.entities.length; res.errors = errors; res.http4xx = bad;
  fs.writeFileSync(path.join(out, `${label}.json`), JSON.stringify(res, null, 1));
  for (const [n, v] of Object.entries(res.views)) console.log(label, n, 'llamadas', v.total.calls, 'triángulos', v.total.triangles, 'heapMB', v.heapMB);
  console.log('errores:', errors.length, errors.slice(0, 3), 'http>=400:', bad.slice(0, 3)); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
