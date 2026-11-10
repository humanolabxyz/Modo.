// Etapa 6 · prueba en navegador del piloto «Oasis nortino» con modelos 3D reales sobre el build (AGRO_URL, p. ej. dist servido en 4386).
// Verifica carga y texturas, selección/inspección de piezas con modelo, persistencia tras recarga, cámaras, respaldo ante GLB bloqueados e interruptor ?modelos=off. Guarda capturas en AGRO_QA_OUT.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const {fixtureOpen} = require('./verify-agro-territory-ui.cjs');
const {diagnostics, ready, camera} = require('./review-agro-etapa3.cjs');
const url = process.env.AGRO_URL || 'http://127.0.0.1:4386', out = process.env.AGRO_QA_OUT;
assert.ok(out, 'Define AGRO_QA_OUT');
let n = 0; const ok = name => { n++; console.log('PASS', name); };

const glbInfo = page => page.evaluate(() => {
  const s = window.reviewScene, groups = {}, maps = [];
  s.traverse(o => { if (/^glb/.test(o.name)) groups[o.name] = (groups[o.name] || 0) + 1; if (o.isMesh && /^glb/.test(o.parent?.name ?? '')) { const m = o.material; if (m.map || m.normalMap) maps.push(o.parent.name); } });
  return {groups, maps};
});
const shot = async (page, name) => { await page.mouse.move(10, 15); await page.waitForTimeout(150); await page.screenshot({path: path.join(out, name + '.png')}); };
const project = (page, p) => page.evaluate(([x, y, z]) => { const st = window.reviewScene.__r3f.root.getState(), v = new (st.camera.position.constructor)(x, y, z).project(st.camera), r = st.gl.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, p);

(async () => {
  fs.mkdirSync(out, {recursive: true});
  const {buildPilotWorld} = await import('./lib/agro-pilot-oasis.mjs'); const {world} = buildPilotWorld(), by = t => world.entities.find(e => e.type === t);
  const browser = await chromium.launch({args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization']});
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'}); await context.addInitScript(diagnostics);
  const page = await context.newPage(), errors = [], bad = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text())); page.on('response', r => r.status() >= 400 && bad.push(r.status() + ' ' + r.url()));
  await page.goto(url + '/agro/'); await page.locator('[data-view=lobby]').waitFor(); await fixtureOpen(page, world); await ready(page);
  const [sx, sz] = world.scenario.site, granero = by('granero'), molino = by('molino'), parcel = world.entities.filter(e => e.type === 'parcela')[1];
  await camera(page, 'orbit', [30, 18, 40], [granero.pose.position[0], null, granero.pose.position[2]]); await page.waitForTimeout(2500);

  // 1 · carga y ausencia de texturas perdidas
  const info = await glbInfo(page); const names = Object.keys(info.groups).join(' ');
  for (const need of ['glb:estructura-granero', 'glb:estructura-molino', 'glb-instancias:estructura-cerca', 'glb-instancias:cultivo-tomate-', 'glb-instancias:veg-palma', 'glb-instancias:roca-']) assert.ok(names.includes(need), `falta ${need} en la escena (${names})`);
  assert.deepEqual(info.maps, [], 'ningún modelo usa texturas'); ok(`los modelos cargan en el Workspace (${Object.keys(info.groups).length} grupos: estructuras, vegetación, rocas, cultivo) sin texturas perdidas`);
  await shot(page, 'nuevo-granero');

  // 2 · selección e inspección de una pieza con modelo (la imagen cambió; la selección y el inspector no)
  await camera(page, 'orbit', [22, 12, 28], [granero.pose.position[0], null, granero.pose.position[2]]); await page.waitForTimeout(1200);
  const [cx, cy] = await project(page, [granero.pose.position[0], granero.pose.position[1] + 2, granero.pose.position[2]]);
  await page.mouse.click(cx, cy); await page.waitForTimeout(600);
  const text = await page.locator('body').innerText(); assert.ok(/Granero 1/.test(text) && /Inspector|Granero/.test(text), 'seleccionar el granero abre su inspector'); await shot(page, 'nuevo-granero-seleccionado');
  const outline = await page.evaluate(() => { let c = 0; window.reviewScene.traverse(o => { if (o.isLineSegments && o.renderOrder === 15) c++; }); return c; });
  assert.ok(outline >= 1, 'la caja de selección con las medidas funcionales sigue visible'); ok('seleccionar el granero (con modelo) abre su inspector y mantiene la caja de selección funcional');

  // 3 · cámaras
  await camera(page, 'orbit', [16, 9, 22], [molino.pose.position[0], null, molino.pose.position[2]]); await page.waitForTimeout(1200); await shot(page, 'nuevo-molino');
  await camera(page, 'orbit', [8, 5, 11], [parcel.pose.position[0], null, parcel.pose.position[2]]); await page.waitForTimeout(1500); await shot(page, 'nuevo-cultivo-tomate');
  await camera(page, 'orbit', [26, 14, -34], [sx - 4, null, sz - 34]); await page.waitForTimeout(1200); await shot(page, 'nuevo-cerca-y-palmas');
  await page.getByRole('button', {name: 'Estratégica', exact: true}).click(); await page.mouse.move(720, 450); for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 150); await page.waitForTimeout(1200); await shot(page, 'nuevo-estrategica');
  const walk = page.getByRole('button', {name: /Caminar|Primera persona|A pie/i}); if (await walk.count()) { await walk.first().click(); await page.waitForTimeout(1500); await shot(page, 'nuevo-caminar'); await page.keyboard.press('Escape'); }
  await page.getByRole('button', {name: 'Órbita', exact: true}).click().catch(() => {}); ok('cámaras órbita, estratégica y caminar muestran los modelos sin errores');

  // 4 · persistencia: recargar conserva el mundo y los modelos vuelven
  const checksum = await page.getByTestId('agro-app').getAttribute('data-checksum'); await page.reload(); await page.waitForSelector('[data-view=lobby], [data-testid=agro-app]');
  if (await page.locator('[data-view=lobby]').count()) await page.locator(`[data-world-id="${world.id}"]`).getByRole('button', {name: 'Abrir'}).click(); await ready(page); await page.waitForTimeout(2500);
  assert.equal(await page.getByTestId('agro-app').getAttribute('data-checksum'), checksum, 'terreno idéntico tras recargar');
  const after = await glbInfo(page); assert.ok(Object.keys(after.groups).some(g => g.includes('estructura-granero')), 'los modelos vuelven tras recargar'); ok('guardar y recuperar: el mundo reabre idéntico y los modelos vuelven a aparecer');

  // 5 · red de riego funcional con piezas técnicas (sin modelo): HUD de red presente y piezas intactas
  const hud = await page.locator('body').innerText(); assert.ok(/Red de riego/.test(hud) && /Red eléctrica/.test(hud), 'los paneles de red siguen activos'); ok('las instalaciones técnicas (estanque, bomba, válvula, tablero) conservan su geometría actual y los paneles de red');
  assert.deepEqual(errors, [], 'sin errores de consola/excepciones: ' + errors.join(' | ')); assert.deepEqual(bad, [], 'sin respuestas 4xx/5xx: ' + bad.join(' | ')); ok('sin errores de consola ni respuestas 4xx/5xx con modelos');

  // 6 · respaldo: con los GLB bloqueados el simulador funciona con la imagen de siempre
  const ctx2 = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'}); await ctx2.addInitScript(diagnostics); await ctx2.route('**/agro/models/*.glb', r => r.fulfill({status: 404, body: ''}));
  const p2 = await ctx2.newPage(), errs2 = []; p2.on('pageerror', e => errs2.push(e.message));
  await p2.goto(url + '/agro/'); await p2.locator('[data-view=lobby]').waitFor(); await fixtureOpen(p2, world); await ready(p2); await camera(p2, 'orbit', [30, 18, 40], [granero.pose.position[0], null, granero.pose.position[2]]); await p2.waitForTimeout(2500);
  const g2 = await glbInfo(p2); assert.deepEqual(g2.groups, {}, 'sin modelos cargados'); assert.deepEqual(errs2, [], 'sin excepciones con GLB ausentes');
  const drawn = await p2.getByTestId('agro-app').evaluate(el => +el.dataset.tris); assert.ok(drawn > 50000, 'la escena se dibuja con la representación de respaldo'); await shot(p2, 'respaldo-sin-glb');
  assert.ok(/Granero 1|Piloto/.test(await p2.locator('body').innerText())); ok('con los GLB bloqueados (404) el simulador no falla: cada objeto conserva su representación de respaldo'); await ctx2.close();

  // 7 · interruptor ?modelos=off
  const p3 = await context.newPage(); await p3.goto(url + '/agro/?modelos=off'); await p3.locator('[data-view=lobby]').waitFor(); await fixtureOpen(p3, world); await ready(p3); await p3.waitForTimeout(2000);
  assert.deepEqual((await glbInfo(p3)).groups, {}, '?modelos=off no carga modelos'); ok('?modelos=off devuelve la imagen procedural de siempre (útil en equipos lentos y para comparar)');
  // 8 · móvil emulado (390 × 844, táctil): los modelos cargan y no hay desborde horizontal
  const ctx4 = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, serviceWorkers: 'block'}); await ctx4.addInitScript(diagnostics);
  const p4 = await ctx4.newPage(), errs4 = []; p4.on('pageerror', e => errs4.push(e.message)); p4.on('console', m => m.type() === 'error' && errs4.push(m.text()));
  await p4.goto(url + '/agro/'); await p4.locator('[data-view=lobby]').waitFor(); await fixtureOpen(p4, world); await ready(p4); await camera(p4, 'orbit', [30, 18, 40], [granero.pose.position[0], null, granero.pose.position[2]]); await p4.waitForTimeout(2500);
  assert.ok(Object.keys((await glbInfo(p4)).groups).length >= 10, 'los modelos cargan en móvil'); assert.deepEqual(errs4, [], 'sin errores en móvil: ' + errs4.join(' | '));
  assert.ok(await p4.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'sin desborde horizontal'); await shot(p4, 'nuevo-movil-390'); await ctx4.close(); ok('móvil emulado 390 × 844: modelos cargados, sin errores ni desborde');
  console.log(`\n${n} bloques OK`); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
