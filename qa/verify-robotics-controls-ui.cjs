// Robótica · servo, potenciómetro y pulsador en la interfaz: programa servo_pot.hex → ▶ → deslizador del potenciómetro mueve el servo,
// el pulsador se mantiene con el puntero y con el teclado, y la escena 3D muestra el eje girado.
// Uso: PANELLAB_URL=http://127.0.0.1:4326 node qa/verify-robotics-controls-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4326').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {bench} = await import('./robotics/bench.mjs');
  const {p, ids} = await bench();
  const hex = fs.readFileSync('qa/fixtures/robotica/servo_pot.hex', 'utf8');
  const project = {...p, workspace: {mode: 'simulate'}, firmware: [{id: 'fw-1', targetInstanceId: ids.uno, board: 'arduino-uno-r3', source: '// servo + potenciómetro (hex importado)\n', updatedAt: '2026-10-30T00:00:00.000Z', artifact: {hex, origin: 'hex-import', sourceHash: 'importado', compiledAt: '2026-10-30T00:00:00.000Z'}}]};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const page = await ctx.newPage(); page.on('pageerror', e => report.errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await page.goto(base + '/robotica/?debug=1'); await page.locator('.rb-app[data-ready=true]').waitFor();
    await page.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, 14, {timeout: 20000}); await page.waitForTimeout(800);
    assert.equal(await page.locator('.rb-app').getAttribute('data-mode'), 'simulate');
    await page.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    await page.locator('.rb-dock button[aria-label="Consola"]').click(); await page.locator('[role=tab]', {hasText: 'Serie y estado'}).click();
    await page.locator('.rb-controls').waitFor({timeout: 15000});
    const servoLine = () => page.locator('[data-servo]').first().textContent();
    const angleOf = async () => Number(/(\d+)°/.exec(await servoLine())[1]);
    const settle = async deg => { for (let i = 0; i < 40; i++) { if (Math.abs(await angleOf() - deg) <= 3) return; await page.waitForTimeout(150); } assert.fail(`el servo no llegó a ${deg}° (${await servoLine()})`); };
    assert.equal(await page.locator('.rb-controls li').count(), 2, 'un deslizador y un pulsador');
    pass('Consola → Serie y estado muestra «Controles del banco» con el potenciómetro y el pulsador');

    const slider = page.locator('.rb-controls input[type=range]');
    await slider.fill('0'); await settle(0); await page.screenshot({path: `${out}/controls-servo-0.png`});
    await slider.fill('100'); await settle(180); await page.screenshot({path: `${out}/controls-servo-180.png`});
    await slider.fill('50'); await settle(90);
    assert.match(await page.locator('.rb-controls output').first().textContent(), /50 %/);
    pass(`deslizador del potenciómetro → servo: 0°, 180° y 90° (${await servoLine()})`);

    const horn = () => page.evaluate(id => window.__modoRobotics.servoHorn(id), ids.servo), knob = () => page.evaluate(id => window.__modoRobotics.potKnob(id), ids.pot);
    for (const [pct, deg] of [[0, 0], [100, 180], [25, 45]]) {
      await slider.fill(String(pct)); await settle(deg); await page.waitForTimeout(300);
      const h = await horn(), k = await knob();
      assert.ok(h !== null && Math.abs(h - deg) <= 3, `eje 3D en ${h}° (esperado ${deg}°)`);
      assert.ok(k !== null && Math.abs(k - pct / 100) < 0.02, `perilla 3D en ${k} (esperado ${pct / 100})`);
    }
    pass('la escena 3D sigue al modelo: el eje del servo dibujado marca 0°, 180° y 45° y la perilla del potenciómetro gira con el deslizador');

    const hold = page.locator('.rb-hold');
    assert.equal(await hold.getAttribute('aria-pressed'), 'false');
    await hold.evaluate(el => el.scrollIntoView({block: 'center'})); await page.waitForTimeout(400); const box = await hold.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    try { await page.waitForFunction(() => document.querySelector('.rb-hold')?.getAttribute('aria-pressed') === 'true', null, {timeout: 10000}); }
    catch (e) { console.error('DIAG', JSON.stringify({box, active: await page.evaluate(() => document.activeElement?.outerHTML?.slice(0, 160)), hold: await page.evaluate(() => document.querySelector('.rb-hold')?.outerHTML), under: await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.outerHTML?.slice(0, 200), [box.x + box.width / 2, box.y + box.height / 2]), state: await page.locator('.rb-sim-state').first().textContent()})); throw e; }
    await page.mouse.up();
    await page.waitForFunction(() => document.querySelector('.rb-hold')?.getAttribute('aria-pressed') === 'false', null, {timeout: 10000});
    pass('pulsador: se mantiene mientras el puntero está abajo y se suelta al levantarlo');
    await hold.focus(); await page.keyboard.down('Space');
    await page.waitForFunction(() => document.querySelector('.rb-hold')?.getAttribute('aria-pressed') === 'true', null, {timeout: 10000});
    await page.keyboard.up('Space');
    await page.waitForFunction(() => document.querySelector('.rb-hold')?.getAttribute('aria-pressed') === 'false', null, {timeout: 10000});
    pass('pulsador accesible por teclado: Espacio mantiene y soltar libera');

    await page.locator('.rb-sim button[aria-label="Detener"]').click(); await page.waitForTimeout(400);
    assert.equal(await page.locator('.rb-controls').count(), 0, 'sin simulación no hay controles');
    await page.locator('.rb-mode button', {hasText: 'Construir'}).click();
    await page.locator('.rb-dock button[aria-label="Piezas"]').click();
    const names = await page.locator('body').innerText();
    for (const n of ['Servo SG90', 'Pulsador', 'Potenciómetro 10 kΩ']) assert.ok(names.includes(n), `${n} en la ventana Piezas`);
    pass('Detener quita los controles; el catálogo de Piezas incluye servo, pulsador y potenciómetro');
    assert.deepEqual(report.errors, [], 'sin errores en consola: ' + report.errors.join(' | '));
    pass('sin errores de consola');
  } finally { await browser.close(); fs.writeFileSync(`${out}/controls-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error(e); process.exit(1); });
