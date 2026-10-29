// SPIKE E4 · Service worker: el chunk de Robótica no se precachea, se guarda al visitarla y /robotica/ abre sin conexión.
// Prerrequisito: npm run build + astro preview. Uso: node run-e4-offline.cjs [url]
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4330').replace(/\/$/, ''), report = {url: base, checks: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const sw = await (await fetch(base + '/sw.js')).text();
  const precache = JSON.parse(/const PRECACHE=(\[.*?\]);/s.exec(sw)[1]);
  const dist = path.resolve(__dirname, '../../../dist/_astro');
  const roboticsJs = fs.readdirSync(dist).filter(f => /^RoboticsApp\..*\.js$/.test(f));
  assert.equal(roboticsJs.length, 1);
  assert.ok(!precache.includes('/_astro/' + roboticsJs[0]), 'el chunk de Robótica NO está en el precache');
  const heavy = precache.filter(u => /three|rapier|drei|fiber/i.test(u));
  assert.deepEqual(heavy, [], 'ningún chunk de three/rapier/drei en el precache');
  pass(`precache: ${precache.length} archivos; excluye ${roboticsJs[0]} (${(fs.statSync(path.join(dist, roboticsJs[0])).size / 1e6).toFixed(2)} MB)`);
  assert.ok(precache.includes('/robotica/'), 'el HTML de /robotica/ (pocos KB) sí se precachea: la ruta existe sin conexión');

  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
  await ctx.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await ctx.newPage();
  await p.goto(base + '/'); // instala el service worker con el precache
  await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForFunction(() => navigator.serviceWorker.controller || true);
  await p.reload(); await p.waitForTimeout(500);
  const cachedBefore = await p.evaluate(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(new URL(r.url).pathname); return out; });
  assert.ok(!cachedBefore.includes('/_astro/' + roboticsJs[0]), 'antes de visitar Robótica el chunk no está en caché'); assert.ok(cachedBefore.includes('/robotica/'));
  pass(`tras instalar la PWA (${cachedBefore.length} recursos): el HTML de Robótica está en caché y su chunk de ~1 MB no`);
  // Perfil con la PWA instalada que nunca abrió Robótica y se queda sin conexión: debe ver un aviso claro, no una pantalla en blanco.
  const early = await browser.newContext({viewport: {width: 800, height: 600}}); const e = await early.newPage(); await e.goto(base + '/'); await e.evaluate(() => navigator.serviceWorker.ready); await e.reload(); await e.waitForTimeout(800); await early.setOffline(true);
  await e.goto(base + '/robotica/'); await e.locator('.rb-loading').waitFor(); assert.equal(await e.locator('.rb-app').count(), 0);
  await e.waitForFunction(() => getComputedStyle(document.querySelector('.rb-loading small')).opacity === '1', null, {timeout: 20000});
  assert.match(await e.locator('.rb-loading').innerText(), /conexión/); pass('PWA instalada, sin conexión y sin haber abierto nunca Robótica: aparece el aviso «necesita cargarse una vez con conexión»'); await early.close();

  await p.goto(base + '/robotica/'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForTimeout(1000);
  await p.locator('.rb-name').click(); await p.locator('input[aria-label="Nombre del proyecto"]').fill('Prueba sin conexión'); await p.waitForTimeout(700);
  await p.keyboard.press('Escape');
  const cachedAfter = await p.evaluate(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(new URL(r.url).pathname); return out; });
  assert.ok(cachedAfter.includes('/_astro/' + roboticsJs[0]), 'después de visitar, el chunk se guardó en la caché');
  assert.ok(cachedAfter.includes('/robotica/'), 'la página /robotica/ se guardó (clave normalizada por pageKey)');
  pass('al visitar /robotica/ se guardan la página y el chunk (+' + (cachedAfter.length - cachedBefore.length) + ' recursos)');

  await ctx.setOffline(true);
  await p.goto(base + '/robotica/'); await p.locator('.rb-app[data-ready=true]').waitFor({timeout: 15000});
  await p.waitForSelector('.rb-canvas canvas', {timeout: 15000});
  assert.equal(await p.locator('.rb-name strong').textContent(), 'Prueba sin conexión', 'el proyecto guardado sigue ahí');
  pass('SIN CONEXIÓN: /robotica/ abre, la pizarra 3D se dibuja y el proyecto guardado se conserva');
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'results/e4-offline.json'), JSON.stringify(report, null, 2));
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
