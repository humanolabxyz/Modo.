// Robótica · las guías de cableado y programación son ventanas flotantes (se mueven y se ajustan) y «Poner este código» rellena el editor sin pedir recompilar.
// Uso: PANELLAB_URL=http://localhost:4326 node qa/verify-robotics-guide-windows.cjs
const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, '');
const errors = [], pass = s => console.log('PASS', s);
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const robot = buildTemplate('robot-2-ruedas-listo');
  const project = {...robot, firmware: [], workspace: {mode: 'build', welcomeDismissed: true, assemblyTemplate: 'robot-2-ruedas-listo'}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
    await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 20000});
    // 1) Programación abierta y con texto propio escrito: el borrador no debe ganarle al código que pone la guía.
    await p.getByRole('button', {name: /Programación/}).first().click();
    const editor = p.locator('.cm-content'); await editor.waitFor();
    await editor.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('// mi codigo propio\nvoid setup() {}\nvoid loop() {}');
    await p.waitForTimeout(500);
    assert.match(await p.locator('.rb-code-status').textContent(), /Sin compilar|Hay que recompilar/, 'código propio sin compilar');
    // 2) La guía es una ventana flotante: se mueve y tiene bordes para ajustar el tamaño.
    await p.getByRole('button', {name: 'Programar paso a paso', exact: true}).first().click();
    const win = p.locator('.rb-guide-window', {has: p.locator('.rb-program-guide')}); await win.waitFor();
    assert.ok(await win.locator('.floating-window-resize, [class*=resize]').count() > 0, 'tiene tiradores para ajustar el tamaño');
    const before = await win.boundingBox(), head = await win.locator('.floating-window-header').boundingBox();
    await p.mouse.move(head.x + 60, head.y + head.height / 2); await p.mouse.down(); await p.mouse.move(head.x + 260, head.y + 120, {steps: 8}); await p.mouse.up();
    const after = await win.boundingBox();
    assert.ok(Math.abs(after.x - before.x) > 40 || Math.abs(after.y - before.y) > 40, 'la ventana de programación se mueve');
    pass('«Programar paso a paso» es una ventana flotante: se mueve y tiene tiradores de tamaño');
    // 3) Poner el código del paso rellena el editor y queda compilado.
    const panel = p.locator('.rb-program-guide');
    const stepSource = await panel.locator('.rb-program-code').innerText();
    await panel.getByRole('button', {name: /Poner este código/}).click(); await p.waitForTimeout(600);
    const shown = await p.locator('.cm-content').innerText();
    assert.ok(!/mi codigo propio/.test(shown), 'el editor ya no muestra el texto anterior');
    assert.equal(shown.replace(/\s+/g, ''), stepSource.replace(/\s+/g, ''), 'el editor muestra el código del paso');
    assert.match(await p.locator('.rb-code-status').textContent(), /Compilado/, 'queda «Compilado», sin pedir recompilar');
    assert.doesNotMatch(await p.locator('.rb-code-advice').textContent(), /recompilar/i);
    pass('«Poner este código en mi programa» rellena el editor con el paso y queda «Compilado», sin pedir recompilar');
    // 4) Pegar código de la guía a mano también queda compilado.
    await editor.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete'); await p.waitForTimeout(400);
    await p.evaluate(t => { const c = document.querySelector('.cm-content'); c.focus(); const dt = new DataTransfer(); dt.setData('text/plain', t); c.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true})); }, stepSource);
    await p.waitForTimeout(2500);
    const afterPaste = await p.locator('.cm-content').innerText();
    require('node:fs').writeFileSync('qa/_dump.json', JSON.stringify({stepSource, afterPaste}));
    assert.ok(afterPaste.replace(/\s+/g, '') === stepSource.replace(/\s+/g, ''), 'el pegado llegó al editor: ' + JSON.stringify(afterPaste.slice(0, 80)));
    assert.match(await p.locator('.rb-code-status').textContent(), /Compilado/, 'el código de la guía pegado queda compilado');
    pass('código de la guía pegado en el editor: «Compilado» al instante');
    // 5) Cableado: también ventana flotante.
    await p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    const wire = p.locator('.rb-guide-window', {has: p.locator('.rb-wiring-guide')}); await wire.waitFor();
    assert.ok(await wire.locator('.floating-window-resize, [class*=resize]').count() > 0);
    pass('«Cableado paso a paso» es una ventana flotante con tiradores de tamaño');
    assert.deepEqual(errors, [], 'sin errores de consola');
    pass('sin errores de consola');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
