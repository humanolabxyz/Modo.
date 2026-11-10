// Capturas comparables y medición en Chromium. AGRO_BASELINE=1 captura el build anterior con el mismo mundo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('./lib/playwright.cjs');
const url = process.env.AGRO_URL || 'http://127.0.0.1:4386';
const out = process.env.AGRO_QA_OUT || path.join(require('node:os').tmpdir(), 'agro-etapa3');
const baseline = process.env.AGRO_BASELINE === '1';
const fixture = require('./fixtures/v1/v1-02-valle-granja.modoagro.json');
const site = '[data-testid=agro-app]';
const settle = page => page.waitForTimeout(700);
const rendered = page => page.waitForFunction(sel => +document.querySelector(sel)?.dataset.tris > 0, site, {timeout: 60000});
const screenshot = (page, label) => page.screenshot({path: path.join(out, label + '.png')});
const caps = page => page.locator(site).evaluate(el => ({triangles: +el.dataset.tris, calls: +el.dataset.calls, heapMB: Math.round(performance.memory.usedJSHeapSize / 1048576)}));

async function fixtureOpen(page, world = fixture) {
  await page.evaluate(world => new Promise((resolve, reject) => {
    const db = indexedDB.open('modo-agro', 1);
    db.onerror = () => reject(db.error);
    db.onsuccess = () => {
      const tx = db.result.transaction('worlds', 'readwrite');
      tx.objectStore('worlds').put({id: world.id, name: world.name, createdAt: world.createdAt, updatedAt: world.updatedAt,
        experience: world.experience, entities: world.entities.length, edits: world.terrain.edits.length, data: world}, world.id);
      tx.oncomplete = () => { db.result.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  }), world);
  await page.reload();
  await page.locator(`[data-world-id="${world.id}"]`).getByRole('button', {name: 'Abrir'}).click();
}

async function capture(page, label) {
  await rendered(page); await settle(page);
  await screenshot(page, label + '-orbita');
  const orbit = await caps(page);
  await page.getByRole('button', {name: 'Estratégica', exact: true}).click();
  await page.mouse.move(720, 490);
  for (let i = 0; i < 22; i++) await page.mouse.wheel(0, 120);
  await settle(page);
  await screenshot(page, label + '-cenital');
  return {orbit, strategic: await caps(page)};
}

async function create(page, id, side) {
  await page.getByRole('button', {name: /Mis mundos/}).click();
  await page.getByTestId('agro-new').click();
  await page.getByLabel('Nombre del mundo').fill('Territorio ' + id);
  await page.getByTestId('agro-wizard-next').click();
  const select = page.getByLabel('Origen del terreno');
  assert.equal(await select.locator('option').count(), 6);
  await select.selectOption(id);
  if (id === 'valley') await page.getByLabel('Usar el relieve clásico del Valle central').uncheck();
  await page.getByLabel('Semilla').fill('31415');
  if (id === 'oasis-norte') {
    await page.getByText('Personalizar relieve y cobertura', {exact: true}).click();
    await page.getByRole('slider', {name: 'Elevación base'}).fill('62');
    await screenshot(page, 'oasis-asistente');
  }
  await page.getByTestId('agro-wizard-next').click();
  await page.getByRole('slider').fill(String(side));
  for (let i = 0; i < 4; i++) await page.getByTestId('agro-wizard-next').click();
  const start = Date.now();
  await page.getByTestId('agro-create').click();
  await rendered(page);
  return Date.now() - start;
}

async function frames(page, move) {
  const before = await page.evaluate(() => ({t: performance.now(), n: window.drawnFrames, i: window.frameTimes.length}));
  await move();
  return page.evaluate(({t, n, i}) => {
    const seconds = (performance.now() - t) / 1000;
    const times = window.frameTimes.slice(i).sort((a, b) => a - b);
    return {seconds: +seconds.toFixed(2), fps: +((window.drawnFrames - n) / seconds).toFixed(1),
      p95GapMs: +((times[Math.floor(times.length * 0.95)] ?? 0).toFixed(1))};
  }, before);
}

async function stressWorld() {
  const [{createConfiguredWorld}, {WorldSession}] = await Promise.all([
    import('../src/agro/world/setup.ts'), import('../src/agro/world/session.ts'),
  ]);
  const created = createConfiguredWorld({name: 'Carga · 150 piezas', seed: 31415, territory: 'valle-rio', side: 1200,
    template: 'blank', site: 'center', relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21'});
  assert.ok(created.ok, created.error);
  const s = WorldSession.fromWorld(created.value);
  const add = (type, x, z, params) => {
    const r = s.place(type, x, z, 0, {params}); assert.ok(r.ok, r.error);
  };
  for (let i = 0; i < 10; i++) add('parcela', (i % 5 - 2) * 24, i < 5 ? -19 : 19, {anchoM: 18, largoM: 25});
  const types = ['bomba', 'tuberia', 'estanque', 'tablero', 'emisor', 'panel-solar'];
  for (let i = 0; i < 140; i++) add(types[i % types.length], (i % 20 - 9.5) * 8, (Math.floor(i / 20) - 3) * 9);
  return s.toWorld();
}

async function verifyTerritories(page, result) {
  const sums = new Set(), scene = page.locator(site);
  result.territories = {};
  for (const id of ['free', 'valley', 'oasis-norte', 'desierto', 'ladera', 'valle-rio']) {
    const side = ['oasis-norte', 'ladera', 'valle-rio'].includes(id) ? 1200 : 800;
    const firstFrameMs = await create(page, id, side);
    sums.add(await scene.getAttribute('data-checksum'));
    // Encuadre orbital amplio para mostrar el cinturón, con el mismo gesto en todos los territorios.
    await page.mouse.move(720, 490);
    for (let i = 0; i < 31; i++) await page.mouse.wheel(0, 110);
    await page.mouse.move(650, 440); await page.mouse.down(); await page.mouse.move(820, 444, {steps: 8}); await page.mouse.up();
    result.territories[id] = {side, firstFrameMs, ...await capture(page, id)};
    console.log('PASS', id, side, result.territories[id]);
    if (id === 'oasis-norte') {
      const checksum = await scene.getAttribute('data-checksum');
      await page.reload(); await rendered(page);
      assert.equal(await scene.getAttribute('data-checksum'), checksum);
      const row = await page.evaluate(id => new Promise(resolve => {
        const db = indexedDB.open('modo-agro', 1);
        db.onsuccess = () => { const r = db.result.transaction('worlds').objectStore('worlds').get(id); r.onsuccess = () => resolve(r.result); };
      }), await scene.getAttribute('data-world'));
      assert.equal(row.data.terrain.seed, 31415);
      assert.equal(row.data.terrain.params.baseElevationM, 62);
      assert.equal(row.data.terrain.presetId, 'oasis-norte');
    }
  }
  assert.equal(sums.size, 6);
  const previous = await scene.getAttribute('data-checksum');
  await page.getByRole('button', {name: 'Subir terreno'}).click();
  await page.mouse.move(170, 480);
  await page.waitForFunction(sel => document.querySelector(sel).dataset.hoverX === '', site);
  await page.mouse.click(170, 480);
  assert.equal(await scene.getAttribute('data-checksum'), previous);
  assert.equal(await scene.getAttribute('data-edits'), '0');
  await page.getByRole('button', {name: 'Seleccionar', exact: true}).click();
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(850, 490); await page.mouse.down({button: 'right'});
    await page.mouse.move(350, 490, {steps: 6}); await page.mouse.up({button: 'right'});
  }
  await settle(page);
  assert.ok(Math.abs(Number(await scene.getAttribute('data-cam-x'))) <= 605);
  await screenshot(page, 'valle-rio-limite-navegacion');
  await page.getByRole('button', {name: /Mis mundos/}).click();
  await fixtureOpen(page, await stressWorld());
  await rendered(page);
  assert.equal(await scene.getAttribute('data-entities'), '150');
  await settle(page);
  result.stress = {entities: 150, parcels: 10, side: 1200, orbit: await caps(page)};
  result.orbitMotion = await frames(page, async () => {
    await page.mouse.move(720, 490); await page.mouse.down();
    const start = Date.now(); let n = 0;
    while (Date.now() - start < 3000) {
      await page.mouse.move(720 + 105 * Math.sin(n / 9), 490 + 45 * Math.sin(n++ / 12));
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
  });
  await page.getByRole('button', {name: 'Caminar', exact: true}).click();
  await settle(page);
  result.walk = await frames(page, async () => {
    await page.keyboard.down('w'); await page.waitForTimeout(3000); await page.keyboard.up('w');
  });
  result.walk.render = await caps(page);
  await screenshot(page, 'valle-rio-primera-persona');
  await page.setViewportSize({width: 390, height: 844});
  await page.getByRole('button', {name: 'Órbita', exact: true}).tap();
  await page.getByRole('button', {name: 'Estratégica', exact: true}).tap();
  await settle(page);
  assert.equal(await scene.getAttribute('data-mode'), 'strategic');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await screenshot(page, 'valle-rio-movil');
  console.log('PASS reapertura, pincel fuera del límite, caminata y controles por toque emulado');
}

module.exports = {fixtureOpen, stressWorld, create, frames};

if (require.main === module) (async () => {
  fs.mkdirSync(out, {recursive: true});
  const gpu = process.env.AGRO_SOFTWARE !== '1';
  const browser = await chromium.launch({args: [...(gpu ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']), '--enable-precise-memory-info']});
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', hasTouch: true});
    await context.addInitScript(() => {
      localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1');
      window.drawnFrames = 0;
      window.frameTimes = [];
      for (const C of [WebGL2RenderingContext, WebGLRenderingContext]) {
        const draw = C.prototype.drawElements;
        C.prototype.drawElements = function (...args) { window.drew = true; return draw.apply(this, args); };
      }
      let previous = 0;
      const frame = time => {
        if (window.drew) {
          window.drawnFrames++;
          if (previous) window.frameTimes.push(time - previous);
          previous = time;
        }
        window.drew = false; requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(url + '/agro/');
    await page.locator('[data-view=lobby]').waitFor();
    const renderer = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'sin información';
    });
    await fixtureOpen(page);
    const result = {renderer, valley: await capture(page, baseline ? 'antes-valle' : 'despues-valle-v1')};
    if (!baseline) await verifyTerritories(page, result);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, baseline ? 'antes.json' : 'rendimiento.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
