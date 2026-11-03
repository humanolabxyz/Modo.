// Robótica · paneles «Programar paso a paso» y «Armar por pasos» en la interfaz.
// Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-guides-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const {newRobotProject} = await import('../src/robotics/project/defaults.ts');
  const robot = buildTemplate('robot-2-ruedas-listo');
  const toProgram = {...robot, firmware: [], workspace: {mode: 'build', welcomeDismissed: true, assemblyTemplate: 'robot-2-ruedas-listo'}};
  const empty = {...newRobotProject('Mi robot'), workspace: {mode: 'build', welcomeDismissed: true, assemblyTemplate: 'robot-2-ruedas-listo'}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const open = async (project, minParts, view = {width: 1280, height: 800}) => {
      const ctx = await browser.newContext({viewport: view});
      await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
      const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
      await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
      if (minParts) await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, minParts, {timeout: 20000});
      await p.waitForTimeout(500); return {ctx, p};
    };

    // ───── Programar paso a paso
    {
      const {ctx, p} = await open(toProgram, robot.parts.length);
      await p.getByRole('button', {name: 'Programar paso a paso', exact: true}).first().click();
      const panel = p.locator('.rb-program-guide'); await panel.waitFor();
      assert.match(await panel.locator('select').locator('option:checked').textContent(), /Evitar obstáculos · para tu robot/, 'sugiere la guía del robot elegido');
      assert.match(await panel.locator('.rb-guide-progress').textContent(), /0 de 4 pasos superados/);
      // Probar sin código: explica qué hacer
      await panel.getByRole('button', {name: 'Probar este paso'}).click();
      assert.match(await panel.locator('[role=status]').first().textContent(), /Todavía no hay programa/);
      pass('la guía sugerida para el robot es «Evitar obstáculos»; probar sin código explica que falta ponerlo');
      const put = () => panel.getByRole('button', {name: /Poner este código|Código puesto/}).click();
      const test = () => panel.getByRole('button', {name: 'Probar este paso'}).click();
      const passed = n => p.waitForFunction(k => new RegExp(`^${k} de 4 pasos`).test(document.querySelector('.rb-program-guide .rb-guide-progress span')?.textContent ?? ''), n, {timeout: 8000});
      await put(); await p.waitForTimeout(300);
      assert.equal(await panel.getByRole('button', {name: 'Código puesto ✓'}).count(), 1, 'el editor tiene el código del paso');
      assert.ok(await panel.locator('.rb-program-code span.is-new').count() > 5, 'resalta las líneas nuevas');
      await test(); await panel.locator('.rb-program-report[data-ok=true]').waitFor(); await passed(1);
      assert.match(await panel.locator('.rb-program-report').textContent(), /¡Paso superado!/);
      pass('paso 1: «Poner este código» → «Probar este paso» → «¡Paso superado!» (D4, D7, D8, D12 y D9 son salidas)');
      await p.screenshot({path: `${out}/program-guide-paso1.png`});
      await panel.getByRole('button', {name: 'Siguiente paso'}).click();
      assert.match(await panel.locator('.rb-guide-piece').textContent(), /Paso 2/);
      // Probar el paso 2 con el código del paso 1 todavía puesto: falla y explica por qué
      await test(); await panel.locator('.rb-program-report[data-ok=false]').waitFor();
      const fail = await panel.locator('.rb-program-report').textContent(); assert.match(fail, /Todavía no/); assert.match(fail, /✗/);
      pass(`probar el paso 2 con el código del paso 1: «Todavía no» y explica qué falla (${(fail.match(/✗ [^✓✗]*/)?.[0] ?? '').trim().slice(0, 90)})`);
      await p.screenshot({path: `${out}/program-guide-fallo.png`});
      await put(); await test(); await panel.locator('.rb-program-report[data-ok=true]').waitFor(); await passed(2);
      for (const n of [3, 4]) { await panel.getByRole('button', {name: 'Siguiente paso'}).click(); await put(); await test(); await panel.locator('.rb-program-report[data-ok=true]').waitFor(); await passed(n); }
      assert.match(await panel.locator('.rb-program-report').textContent(), /Programa completo/);
      pass('pasos 2, 3 y 4 (motores, medir con el HC-SR04, decidir) superados en el simulador: «Programa completo»');
      await p.screenshot({path: `${out}/program-guide-completo.png`});
      // El código quedó como programa del robot y corre en Simular
      await p.locator('.rb-mode button', {hasText: 'Simular'}).click(); await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
      await p.waitForFunction(() => document.querySelector('.rb-sim-chip')?.textContent === 'EN MARCHA', null, {timeout: 25000});
      pass('el programa puesto por la guía corre en Simular (EN MARCHA)');
      await ctx.close();
    }

    // ───── Armar por pasos
    {
      const {ctx, p} = await open(empty, 0);
      await p.getByRole('button', {name: 'Guía de armado', exact: true}).first().click();
      const panel = p.locator('.rb-assembly-guide[aria-label="Ayuda de armado"]'); await panel.waitFor();
      assert.match(await panel.locator('.rb-assembly-kicker').textContent(), /Base · paso 1 de 14/);
      assert.match(await panel.locator('.rb-guide-piece').textContent(), /Chasis/);
      assert.match(await panel.locator('.rb-assembly-where').textContent(), /pieza base/);
      pass('armar: «Base · paso 1 de 14», con qué pieza, dónde encaja y por qué');
      await p.screenshot({path: `${out}/assembly-steps-1.png`});
      await panel.getByRole('button', {name: 'Encajarla por mí'}).click();
      await p.waitForFunction(() => /1 de 14 piezas/.test(document.querySelector('.rb-assembly-guide .rb-guide-progress span')?.textContent ?? ''), null, {timeout: 8000});
      assert.match(await panel.locator('.rb-assembly-kicker').textContent(), /Tracción · paso 2 de 14/);
      assert.match(await panel.locator('.rb-assembly-where').textContent(), /Encaja en Chasis/);
      pass('«Encajarla por mí» coloca el chasis y la guía pasa a «Tracción · paso 2 de 14» (el motor encaja en el chasis)');
      for (let n = 2; n <= 14; n++) { await panel.getByRole('button', {name: 'Encajarla por mí'}).click(); await p.waitForFunction(k => new RegExp(`^${k} de 14 piezas`).test(document.querySelector('.rb-assembly-guide .rb-guide-progress span')?.textContent ?? ''), n, {timeout: 8000}); }
      await panel.getByText('Armado de referencia completo').waitFor();
      assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), 14);
      await panel.getByRole('button', {name: 'Ver todos los pasos de armado'}).click();
      assert.equal(await panel.locator('.rb-assembly-list li[data-state=done]').count(), 14);
      await p.screenshot({path: `${out}/assembly-steps-completo.png`});
      pass('14 pasos con «Encajarla por mí»: 14 piezas en el 3D, «Armado de referencia completo» y la lista marca los 14');
      await ctx.close();
    }

    // ───── Teléfono: los paneles caben
    {
      const {ctx, p} = await open(toProgram, robot.parts.length, {width: 390, height: 844});
      await p.getByRole('button', {name: 'Programar paso a paso', exact: true}).first().click();
      const box = await p.locator('.rb-program-guide').boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 390, `el panel cabe en 390 px (${Math.round(box.x)}–${Math.round(box.x + box.width)})`);
      await p.screenshot({path: `${out}/program-guide-telefono.png`}); pass('en teléfono (390 px) el panel de programación cabe sin desbordar'); await ctx.close();
    }
    assert.deepEqual(report.errors, [], 'sin errores de consola: ' + report.errors.join(' | ')); pass('sin errores de consola');
  } finally { await browser.close(); fs.writeFileSync(`${out}/guides-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error(e); process.exit(1); });
