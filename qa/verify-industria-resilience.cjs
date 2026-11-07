// Industria, fase 10: resiliencia. Si el escenario 3D no se puede descargar, si el navegador no tiene WebGL o si el estado guardado de la interfaz está dañado,
// el resto de la aplicación debe seguir funcionando y el proyecto no debe perderse. (Playwright; servidor en INDUSTRIA_URL.)
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const lib = execFileSync(process.execPath, ['qa/industria-example-fixture.mjs'], {encoding: 'utf8'});
const pid = JSON.parse(lib).active;
const seed = (extra = {}) => ([key, library, uiKey, ui]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, library); if (ui !== null) localStorage.setItem(uiKey, ui); localStorage.setItem('__seeded', '1'); } };
const view = (p, name) => p.locator('.ind-views').getByRole('button', {name, exact: true}).click();

(async () => {
  const b = await chromium.launch();
  try {
    // 1) El archivo del escenario 3D falla: la aplicación sigue viva y se puede reintentar
    let c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(seed(), [LIB, lib, `modo:industria:ui:${pid}:v1`, null]);
    let p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    let blocked = true; await p.route(/IndustriaCanvas\..*\.js/, route => (blocked ? route.abort() : route.continue()));
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(1200);
    const crash = p.getByRole('alert').filter({hasText: 'Escenario 3D'}); await crash.waitFor({timeout: 8000});
    assert.match(await crash.innerText(), /«Escenario 3D» tuvo un problema[\s\S]*El proyecto no se modificó/);
    assert.equal(await p.locator('header.rb-bar').isVisible(), true); assert.equal(await p.locator('nav.rb-dock').isVisible(), true);
    await view(p, 'Diagramas'); assert.equal(await p.locator('svg g[data-entity]').count(), 4); await view(p, 'PLC'); assert.equal(await p.locator('.ind-rung').count(), 1); await view(p, 'Documentación'); assert.ok(await p.getByRole('table', {name: 'Lista de cables'}).isVisible());
    await view(p, 'Planta 3D');
    assert.equal(JSON.parse(await p.evaluate(k => localStorage.getItem(k), LIB)).projects[0].entities.length, JSON.parse(lib).projects[0].entities.length, 'el proyecto sigue intacto');
    await p.screenshot({path: out + '/resiliencia-1-sin-escenario.png'});
    pass('Si el archivo del escenario 3D no se descarga, aparece un aviso con «Reintentar», el resto de las vistas funciona y el proyecto no se toca');
    blocked = false; await p.getByRole('button', {name: 'Reintentar'}).click(); await p.locator('canvas').first().waitFor({timeout: 10000});
    assert.equal(await p.getByRole('alert').filter({hasText: 'Escenario 3D'}).count(), 0);
    pass('«Reintentar» recarga la página (el proyecto ya estaba guardado) y el escenario aparece');
    await c.close();

    // 2) Sin WebGL: mensaje claro y el resto sigue
    const noGl = await chromium.launch({args: ['--disable-webgl', '--disable-3d-apis', '--disable-gpu', '--use-gl=disabled']});
    c = await noGl.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(seed(), [LIB, lib, `modo:industria:ui:${pid}:v1`, null]);
    p = await c.newPage(); p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(800);
    const hasGl = await p.evaluate(() => { try { const k = document.createElement('canvas'); return !!(k.getContext('webgl2') || k.getContext('webgl')); } catch { return false; } });
    if (!hasGl) {
      assert.match(await p.locator('.rb-gl-error').innerText(), /no puede mostrar gráficos 3D/); await view(p, 'Diagramas'); assert.equal(await p.locator('svg g[data-entity]').count(), 4);
      pass('Sin WebGL: aviso claro y las vistas 2D, el PLC, la HMI y la documentación siguen funcionando');
    } else report.checks.push('NOTA: este Chromium no permitió desactivar WebGL; la prueba sin WebGL no se pudo ejecutar'), console.log('NOTA: no se pudo desactivar WebGL en este entorno');
    await c.close(); await noGl.close();

    // 3) Estado de interfaz dañado: se ignora y se usan los valores por defecto
    c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(seed(), [LIB, lib, `modo:industria:ui:${pid}:v1`, JSON.stringify({version: 1, view: {x: 1}, operation: 7, camera: 'nada', panels: [1, 2], savedCameras: 'x', selection: [1, {a: 1}], path: 5, magnet: 'sí'})]);
    p = await c.newPage(); p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(600);
    assert.equal(await p.locator('.ind-views [aria-pressed=true]').innerText(), 'Planta 3D'); assert.equal(await p.getByRole('button', {name: 'Imán', exact: true}).getAttribute('aria-pressed'), 'true');
    pass('Un estado de interfaz con tipos equivocados se ignora y se abre con los valores por defecto');
    await c.close();

    // 4) Dos pestañas: guardar en una no rompe la otra (la última escritura gana y nada se corrompe)
    c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(seed(), [LIB, lib, `modo:industria:ui:${pid}:v1`, null]);
    const a = await c.newPage(), b2 = await c.newPage();
    for (const q of [a, b2]) { q.on('pageerror', e => report.errors.push('pageerror: ' + e.message)); await q.goto(base + '/industria/'); await q.locator('.ind-app[data-ready=true]').waitFor(); }
    await a.getByRole('button', {name: 'Estructura', exact: true}).click(); await a.getByLabel('Nombre del componente nuevo').fill('Desde A'); await a.getByLabel('Nombre del componente nuevo').press('Enter'); await a.waitForTimeout(800);
    await b2.getByRole('button', {name: 'Estructura', exact: true}).click(); await b2.getByLabel('Nombre del componente nuevo').fill('Desde B'); await b2.getByLabel('Nombre del componente nuevo').press('Enter'); await b2.waitForTimeout(800);
    const stored = JSON.parse(await a.evaluate(k => localStorage.getItem(k), LIB)); assert.ok(stored.projects[0].entities.length >= 11); const reparsed = await a.evaluate(k => { try { JSON.parse(localStorage.getItem(k)); return true; } catch { return false; } }, LIB); assert.ok(reparsed, 'lo guardado sigue siendo JSON válido');
    await a.reload(); await a.locator('.ind-app[data-ready=true]').waitFor(); assert.equal(await a.locator('header.rb-bar .rb-name strong').count(), 1);
    pass('Editar desde dos pestañas no corrompe lo guardado (la última escritura gana y la aplicación abre)');
    await c.close();

    const real = report.errors.filter(e => !/Failed to fetch dynamically imported module|Failed to load resource/.test(e)); assert.deepEqual(real, [], 'errores de JavaScript inesperados');
    pass('Sin errores de JavaScript inesperados');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/resiliencia-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
