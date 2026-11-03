// Robótica · sonidos y recogida en la interfaz: el robot que recoge cubos se abre armado, ▶ y se comprueba que el sonido sigue a la simulación
// (motores, servos, pinzas con cubo), que el botón silencia y recuerda la elección, y se guardan capturas del robot con los cubos en las manos.
// Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-sound-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const robot = buildTemplate('robot-oruga-recoger'), project = {...robot, workspace: {...robot.workspace, mode: 'simulate'}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 25000}); await p.waitForTimeout(800);
    const btn = p.locator('.rb-sim button.rb-sound'); await btn.waitFor();
    assert.equal(await btn.getAttribute('aria-pressed'), 'true'); pass('el botón de sonido está en la barra de simulación y viene activado');
    await p.screenshot({path: `${out}/pick-ui-start.png`});
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    await p.waitForFunction(() => document.querySelector('.rb-sim-chip')?.textContent === 'EN MARCHA', null, {timeout: 40000});
    const read = () => btn.evaluate(el => ({...el.dataset}));
    let max = {servo: 0, held: 0, events: 0}, shotHeld = false; const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      const d = await read(); max = {servo: Math.max(max.servo, +d.soundServo), held: Math.max(max.held, +d.soundHeld), events: +d.soundEvents, ctx: d.soundCtx};
      if (!shotHeld && +d.soundHeld >= 2) { shotHeld = true; await p.waitForTimeout(500); await p.screenshot({path: `${out}/pick-ui-agarrando.png`}); }
      if (max.held >= 2 && max.events >= 8 && shotHeld) break; await p.waitForTimeout(100);
    }
    assert.equal(max.ctx, 'running', 'el audio del navegador está activo'); pass('el audio del navegador arrancó al pulsar ▶');
    assert.ok(max.servo > 80, `los servos suenan al girar (${max.servo} °/s)`); assert.ok(max.held >= 2, 'las dos pinzas sostienen un cubo'); assert.ok(max.events >= 8, `eventos de sonido (${max.events})`);
    pass(`el sonido sigue a la simulación: servos hasta ${max.servo} °/s, ${max.held} cubos sostenidos, ${max.events} golpes y clics`);
    await btn.click(); assert.equal(await btn.getAttribute('aria-pressed'), 'false'); assert.equal((await read()).sound, 'off');
    assert.equal(await p.evaluate(() => localStorage.getItem('panellab.robotica.sonido')), '0'); pass('el botón silencia y recuerda la elección');
    await p.screenshot({path: `${out}/pick-ui-silencio.png`});
    await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); assert.equal(await p.locator('.rb-sim button.rb-sound').getAttribute('aria-pressed'), 'false'); pass('tras recargar sigue silenciado');
    await p.evaluate(() => localStorage.removeItem('panellab.robotica.sonido'));
    assert.deepEqual(report.errors, [], 'sin errores de consola: ' + report.errors.join(' | ')); pass('sin errores de consola');
  } finally { await browser.close(); fs.writeFileSync(`${out}/pick-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error(e); process.exit(1); });
