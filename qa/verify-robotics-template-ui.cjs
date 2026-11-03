// Robótica · robot de ejemplo en la interfaz: desde el estado vacío y desde «Mis proyectos» se crea el robot armado; sin tocar nada más,
// ▶ lo hace avanzar y esquivar la caja. Uso: PANELLAB_URL=http://127.0.0.1:4326 node qa/verify-robotics-template-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4326').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForTimeout(1000);
    assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), 0);
    await p.locator('.rb-empty .rb-template-btn').click();
    await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 14, null, {timeout: 20000}); await p.waitForTimeout(800);
    assert.match(await p.locator('.rb-name strong').textContent(), /listo para usar/);
    assert.equal(await p.evaluate(() => window.__modoRobotics.wireCount()), 28);
    pass('el estado vacío ofrece el robot de ejemplo: aparece armado (14 piezas) y cableado (28 cables)');

    await p.waitForFunction(() => !!window.__modoRobotics?.partWorld, null, {timeout: 10000});
    const chassis = await p.evaluate(() => { const ids = window.__modoRobotics.partIds(); return ids; });
    assert.equal(chassis.length, 14);
    const posOf = id => p.evaluate(i => window.__modoRobotics.partWorld(i), id);
    const first = chassis[0], start = await posOf(first);
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    const zs = [], xs = [], t0 = Date.now();
    while (Date.now() - t0 < 9000) { await p.waitForFunction(() => !!window.__modoRobotics?.partWorld); const q = await posOf(first); zs.push(q[2]); xs.push(q[0]); await p.waitForTimeout(150); }
    await p.screenshot({path: `${out}/template-ui-running.png`});
    const frontAtBox = Math.max(...zs.filter((_, i) => Math.abs(xs[i]) < 0.35)) + 0.1215;
    assert.ok(Math.max(...zs) - start[2] > 0.25, 'avanzó'); assert.ok(frontAtBox < 0.68, `no tocó la caja (frente en ${frontAtBox.toFixed(2)} m)`); assert.ok(Math.max(...xs.map(Math.abs)) > 0.03, 'giró');
    pass(`▶ sin tocar nada más: el robot avanza, gira y esquiva la caja (frente a ${(0.70 - frontAtBox).toFixed(2)} m de ella)`);
    await p.locator('.rb-sim button[aria-label="Detener"]').click();

    // desde «Mis proyectos»: segunda copia
    await p.locator('button[aria-label="Opciones del proyecto"]').first().click();
    await p.locator('button[aria-label^="Nuevo desde plantilla"]').first().click(); await p.waitForTimeout(800);
    await p.locator('.rb-name').click(); await p.locator('button', {hasText: 'Mis proyectos'}).first().click();
    assert.ok(await p.locator('.rb-project-list li').count() >= 3, 'hay varios proyectos');
    assert.ok(await p.locator('.rb-templates button').count() === 13, '«Mis proyectos» ofrece las trece plantillas');
    pass('la plantilla también se crea desde «Mi proyecto» y se ofrece en «Mis proyectos»');
    assert.deepEqual(report.errors, [], 'sin errores de consola'); pass('sin errores de consola ni de página');
    await ctx.close();
  } finally { await browser.close(); fs.writeFileSync(`${out}/template-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
