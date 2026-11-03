// Robótica · espectro del código: el paso de la guía se ve en gris en el editor para escribirlo encima.
// Uso: PANELLAB_URL=http://localhost:4326 node qa/verify-robotics-ghost.cjs
const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, '');
const errors = [], pass = s => console.log('PASS', s);
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const {ghostProgress} = await import('../src/robotics/windows/ghost.ts');
  assert.equal(ghostProgress('', '').state, 'off');
  assert.equal(ghostProgress('ab', 'abc\nd').state, 'typing');
  assert.equal(ghostProgress('ab', 'abc\nd').rest, 'c\nd');
  assert.equal(ghostProgress('abX', 'abc').state, 'diverged');
  assert.equal(ghostProgress('abc\r\nd', 'abc\nd').state, 'done');
  pass('ghostProgress: typing, diverged, done, CRLF');
  const robot = buildTemplate('robot-2-ruedas-listo');
  const project = {...robot, firmware: [], workspace: {mode: 'build', welcomeDismissed: true, assemblyTemplate: 'robot-2-ruedas-listo'}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
    await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 20000});
    await p.getByRole('button', {name: 'Programar paso a paso', exact: true}).first().click();
    const panel = p.locator('.rb-program-guide'); await panel.waitFor();
    assert.equal(await p.locator('.cm-ghost').count(), 0, 'sin espectro al abrir');
    await panel.getByRole('button', {name: 'Escribirlo yo, con espectro'}).click();
    await p.locator('.cm-content').waitFor(); await p.locator('.cm-ghost').first().waitFor({timeout: 8000});
    const target = (await panel.locator('.rb-program-code').innerText()).replace(/\s+/g, ' ').trim();
    const ghostText = () => p.locator('.cm-ghost').first().innerText();
    assert.ok((await ghostText()).replace(/\s+/g, ' ').trim().startsWith(target.slice(0, 20)), 'el espectro muestra el código del paso');
    pass('«Escribirlo yo, con espectro» abre Programación y muestra el código del paso en gris');
    // Escribir lo primero: el espectro retrocede.
    const first = (await ghostText()).split('\n')[0];
    const editor = p.locator('.cm-content'); await editor.click(); await p.keyboard.press('Control+A'); await p.keyboard.press('Delete');
    await p.keyboard.type(first.slice(0, 12)); await p.waitForTimeout(300);
    const after = await ghostText();
    assert.ok(!after.startsWith(first.slice(0, 12)) && after.length > 0, 'lo escrito sale del espectro');
    assert.match(await p.locator('.rb-code-ghost p').textContent(), /Escribe sobre el código en gris/);
    pass('al escribir las primeras letras correctas, el espectro retrocede');
    // Tab / botón: escribe la siguiente línea.
    await p.getByRole('button', {name: /Escribir la siguiente línea/}).click(); await p.waitForTimeout(300);
    assert.ok((await editor.innerText()).includes(first.trimEnd().slice(0, 12)), 'la línea quedó escrita');
    pass('«Escribir la siguiente línea» completa la línea con el texto del paso');
    // Un error aparta del espectro y avisa la línea.
    await editor.click(); await p.keyboard.press('Control+End'); await p.keyboard.type('@@'); await p.waitForTimeout(300);
    assert.equal(await p.locator('.cm-ghost').count(), 0, 'al apartarse no hay espectro');
    assert.match(await p.locator('.rb-code-ghost p').textContent(), /se aparta del paso en la línea \d+/);
    pass('si lo escrito se aparta del paso, el aviso nombra la línea');
    await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); await p.waitForTimeout(300);
    // Completo: coincide y compila (código de la guía).
    await panel.getByRole('button', {name: /Quitar el espectro del editor/}).click(); await p.waitForTimeout(300);
    assert.equal(await p.locator('.cm-ghost').count(), 0); assert.equal(await p.locator('.rb-code-ghost').count(), 0);
    pass('«Quitar el espectro» limpia el editor y el aviso');
    assert.deepEqual(errors, [], 'sin errores de consola'); pass('sin errores de consola');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
