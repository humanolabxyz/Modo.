// Robótica · guía de cableado paso a paso en la interfaz: elegir guía, ver el paso actual, aviso de cable equivocado, «poner el cable por mí» hasta completar.
// Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-wire-guide-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4330').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildRobot2wd} = await import('./robotics/robot2wd.mjs');
  const {connect, setPartProp} = await import('../src/robotics/project/commands.ts');
  const built = buildRobot2wd(), {ids} = built;
  const fresh = {...built.project, workspace: {mode: 'build', welcomeDismissed: true}};
  // Con un cable equivocado ya puesto: D5 → ENB (en vez de ENA)
  const withWrong = {...setPartProp(setPartProp(fresh, ids.battery, 'voltage', 9), ids.driver, 'jumperENA', false), workspace: fresh.workspace};
  const wrong = connect(withWrong, {instanceId: ids.uno, pinId: 'D5'}, {instanceId: ids.driver, pinId: 'ENB'}, '#e0a52a').project;
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const open = async (project, view = {width: 1280, height: 800}) => {
      const ctx = await browser.newContext({viewport: view});
      await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
      const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
      await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, 11, {timeout: 20000}); await p.waitForTimeout(500);
      return {ctx, p};
    };
    const {ctx, p} = await open(fresh);
    await p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    const panel = p.locator('.rb-wiring-guide'); await panel.waitFor();
    assert.match(await panel.textContent(), /Robot reconocido/);
    await panel.locator('select').selectOption('robot-2-ruedas-evita');
    assert.match(await panel.locator('.rb-guide-progress').textContent(), /0 de 21 pasos/);
    assert.equal(await panel.locator('.rb-wiring-step').getAttribute('data-step'), 'bateria-9v');
    assert.match(await panel.locator('.rb-guide-piece').textContent(), /9 V/);
    pass('elegir «Robot 2 ruedas · evita obstáculos»: 0 de 21 pasos y el primero es subir la batería a 9 V');
    await p.screenshot({path: `${out}/wire-guide-paso1.png`});

    const apply = () => panel.getByRole('button', {name: /por mí/}).click();
    const done = async n => p.waitForFunction(k => new RegExp(`^${k} de 21`).test(document.querySelector('.rb-wiring-guide .rb-guide-progress span')?.textContent ?? ''), n, {timeout: 8000});
    await apply(); await done(1); await apply(); await done(2); await apply(); await done(3);
    assert.equal(await panel.locator('.rb-wiring-step').getAttribute('data-step'), 'bat-mas-driver');
    assert.match(await panel.locator('.rb-wiring-color').textContent(), /cable rojo/);
    pass('«Hacerlo por mí» aplica los 3 ajustes y la guía pasa sola al primer cable (batería + → driver +12V, rojo)');
    await panel.getByRole('button', {name: 'Ver pines en 3D'}).click();
    await p.waitForTimeout(500); await p.screenshot({path: `${out}/wire-guide-cable.png`});
    const ghost = await p.evaluate(() => window.__modoRobotics.ghostWire());
    assert.ok(ghost && ghost.points.length >= 2, 'hay un cable espectro en el 3D'); assert.equal(ghost.color, '#d64545', 'del color del paso (rojo)');
    const len = Math.hypot(...ghost.points[0].map((v, i) => v - ghost.points.at(-1)[i])); assert.ok(len > 0.01 && len < 0.4, `une dos pines reales (${(len * 100).toFixed(1)} cm)`);
    pass(`el paso muestra un cable espectro translúcido en el 3D entre los dos pines (rojo, ${(len * 100).toFixed(1)} cm en línea recta)`);
    await panel.getByRole('button', {name: /por mí/}).click(); await done(4);
    await p.waitForFunction(prev => { const g = window.__modoRobotics.ghostWire(); return g && JSON.stringify(g.points) !== prev; }, JSON.stringify(ghost.points), {timeout: 8000});
    pass('al poner el cable, el espectro salta solo al cable del paso siguiente');

    for (let n = 5; n <= 21; n++) { await apply(); await done(n); }
    await panel.locator('.rb-wiring-done').waitFor();
    assert.match(await panel.locator('.rb-wiring-done').textContent(), /Cableado completo/);
    assert.equal(await p.evaluate(() => window.__modoRobotics.wireCount()), 18, '18 cables dibujados');
    pass('los 21 pasos aplicados en orden: «¡Cableado completo!» y 18 cables dibujados en 3D');
    await panel.getByRole('button', {name: 'Ver todos los pasos'}).click();
    assert.equal(await panel.locator('.rb-wiring-list li[data-state=done]').count(), 21);
    await p.screenshot({path: `${out}/wire-guide-completo.png`});
    pass('la lista de pasos marca los 21 como hechos');
    assert.equal(await p.evaluate(() => window.__modoRobotics.ghostWire()), null, 'completo: no queda espectro');
    // El avance sale del proyecto, no de un contador aparte: sobrevive a recargar
    await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForTimeout(500);
    await p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    await p.locator('.rb-wiring-guide .rb-wiring-done').waitFor({timeout: 8000});
    pass('al recargar, la guía recuerda la elección y sigue completa');
    await ctx.close();

    const w = await open(wrong);
    await w.p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    const wp = w.p.locator('.rb-wiring-guide'); await wp.locator('select').selectOption('robot-2-ruedas-evita');
    const warn = wp.locator('.rb-wiring-wrong'); await warn.waitFor({timeout: 8000});
    assert.equal(await warn.getAttribute('data-wrong'), 'd5-ena');
    const text = await warn.textContent(); assert.match(text, /ENB/); assert.match(text, /ENA/);
    assert.equal(await wp.locator('.rb-wiring-step').getAttribute('data-step'), 'quitar-enb', 'el paso actual sigue siendo el primero pendiente');
    pass('cable equivocado D5→ENB: aviso «Cable por revisar» aunque haya pasos anteriores pendientes; nombra ENB (donde está) y ENA (donde debe ir)');
    await w.p.screenshot({path: `${out}/wire-guide-equivocado.png`});
    await w.ctx.close();

    // Un robot distinto: la guía generada desde la plantilla Rover 4WD (sin cables), con las piezas emparejadas por posición
    const {buildTemplate} = await import('../src/robotics/project/templates.ts');
    const rover = buildTemplate('robot-rover-4wd'); const bare = {...rover, connections: [], parts: rover.parts.map(q => (q.definitionId === 'battery-holder-4aa' || q.definitionId === 'l298n-module' ? {...q, props: {}} : q)), workspace: {mode: 'build', welcomeDismissed: true}};
    const r = await open(bare, {width: 1280, height: 800}); // 11 piezas mínimo: el rover tiene más
    await r.p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    const rp = r.p.locator('.rb-wiring-guide'); await rp.locator('select').selectOption('plantilla:robot-rover-4wd');
    const total = Number(/de (\d+) pasos/.exec(await rp.locator('.rb-guide-progress').textContent())[1]); assert.equal(total, 48, 'Rover 4WD: 48 pasos');
    const start = Number(/(\d+) de/.exec(await rp.locator('.rb-guide-progress').textContent())[1]); assert.equal(start, 1, 'el paso «batería en 6 V» ya viene cumplido de fábrica');
    const rdone = n => r.p.waitForFunction(k => new RegExp(`^${k} de`).test(document.querySelector('.rb-wiring-guide .rb-guide-progress span')?.textContent ?? ''), n, {timeout: 8000});
    for (let n = 1; n <= 12; n++) { await rp.getByRole('button', {name: /por mí/}).click(); await rdone(start + n); }
    assert.ok(await r.p.evaluate(() => window.__modoRobotics.ghostWire()) !== null, 'hay espectro del cable actual');
    assert.ok(Number(/paso (\d+)/.exec(await rp.locator('.rb-wiring-step small').textContent())[1]) >= 13);
    await r.p.screenshot({path: `${out}/wire-guide-rover.png`});
    pass('guía generada del Rover 4WD (48 pasos): 12 pasos aplicados con las piezas emparejadas (2 drivers, 4 motores) y el espectro sigue al cable actual'); await r.ctx.close();

    const m = await open(fresh, {width: 390, height: 844});
    await m.p.getByRole('button', {name: 'Cableado paso a paso', exact: true}).first().click();
    await m.p.locator('.rb-wiring-guide select').selectOption('robot-2-ruedas-evita');
    const box = await m.p.locator('.rb-wiring-guide').boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 390, `el panel cabe en 390 px (${Math.round(box.x)}–${Math.round(box.x + box.width)})`);
    await m.p.screenshot({path: `${out}/wire-guide-telefono.png`});
    pass('en teléfono (390 px) el panel cabe sin desbordar'); await m.ctx.close();
    assert.deepEqual(report.errors, [], 'sin errores de consola: ' + report.errors.join(' | ')); pass('sin errores de consola');
  } finally { await browser.close(); fs.writeFileSync(`${out}/wire-guide-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error(e); process.exit(1); });
