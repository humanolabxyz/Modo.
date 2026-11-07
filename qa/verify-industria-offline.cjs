// Industria, fase 10: uso SIN conexión. Se visita /industria/ una vez con red (el service worker guarda la página y sus archivos), se corta la red y se recarga:
// la aplicación debe abrir, mostrar el escenario 3D, cargar un ejemplo, simular y conservar el proyecto. (Playwright; servidor en INDUSTRIA_URL.)
const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: [], failedRequests: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'allow'});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });

    // 1) Con red: el service worker toma el control y se visita lo que se usará sin conexión
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor();
    await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(1500);
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(1500);
    const sw = await p.evaluate(async () => ({controlled: !!navigator.serviceWorker.controller, caches: await caches.keys()}));
    assert.ok(sw.controlled, 'el service worker controla la página'); assert.ok(sw.caches.some(k => k.startsWith('panellab-')), 'hay una caché de la aplicación');
    // Recorrer las vistas y paneles con red para que se carguen todos los archivos que hagan falta
    for (const v of ['Tablero', 'Diagramas', 'PLC', 'HMI', 'Documentación', 'Planta 3D']) await p.locator('.ind-views').getByRole('button', {name: v, exact: true}).click();
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.getByRole('button', {name: 'Cerrar Proyecto'}).click();
    const cached = await p.evaluate(async () => { const out = []; for (const k of await caches.keys()) { const cache = await caches.open(k); out.push(...(await cache.keys()).map(r => new URL(r.url).pathname)); } return out; });
    assert.ok(cached.some(u => u === '/industria/' || u === '/industria/index.html'), 'la página /industria/ está en caché'); assert.ok(cached.filter(u => u.startsWith('/_astro/')).length > 3, 'los archivos con hash están en caché');
    pass(`Con red: el service worker controla la página y guarda /industria/ y ${cached.filter(u => u.startsWith('/_astro/')).length} archivos`);

    // 2) Sin red: recargar y trabajar
    await c.setOffline(true);
    p.on('requestfailed', r => report.failedRequests.push(r.url()));
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor({timeout: 15000}); await p.locator('canvas').first().waitFor({timeout: 15000}); await p.waitForTimeout(800);
    assert.equal(await p.evaluate(() => navigator.onLine), false);
    pass('Sin conexión: /industria/ abre, muestra el escenario 3D y el modelo');

    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.getByRole('button', {name: /Ejemplo: marcha\/paro con PLC/}).click(); await p.waitForTimeout(900);
    await p.getByRole('button', {name: 'Piezas', exact: true}).click(); await p.getByRole('button', {name: 'Ejecutar'}).click(); await p.getByRole('button', {name: 'Instrumentos', exact: true}).click();
    const op = name => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});
    await op('QF1').click(); await op('QF2').click(); const s1 = await op('S1').boundingBox(); await p.mouse.move(s1.x + s1.width / 2, s1.y + s1.height / 2); await p.mouse.down(); await p.waitForTimeout(300);
    assert.equal(await p.getByRole('list', {name: 'Estado de los equipos'}).locator('li').filter({has: p.locator('span', {hasText: /^M1$/})}).locator('b').innerText(), 'Alimentado'); await p.mouse.up();
    for (const v of ['Tablero', 'Diagramas', 'PLC', 'HMI', 'Documentación']) { await p.locator('.ind-views').getByRole('button', {name: v, exact: true}).click(); await p.waitForTimeout(200); }
    pass('Sin conexión: se carga un ejemplo, se simula (PLC, sello, motor) y se recorren todas las vistas');

    // 3) Guardar, exportar y recargar sin red
    await p.waitForTimeout(700); const before = await p.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.length, LIB);
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor({timeout: 15000}); await p.waitForTimeout(600);
    assert.equal(await p.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.length, LIB), before); assert.match(await p.locator('header.rb-bar .rb-name strong').innerText(), /marcha\/paro con PLC/);
    pass('Sin conexión: el proyecto se guarda y vuelve al recargar');

    const unexpected = report.failedRequests.filter(u => !/favicon|manifest|sw\.js|analytics|fonts\.g/.test(u)); assert.deepEqual(unexpected, [], 'peticiones fallidas sin conexión: ' + unexpected.join(', '));
    assert.deepEqual(report.errors.filter(e => !/Failed to load resource|net::ERR_INTERNET_DISCONNECTED/.test(e)), [], 'errores de consola');
    pass('Sin conexión no fallan peticiones de la aplicación ni hay errores de JavaScript');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/offline-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
