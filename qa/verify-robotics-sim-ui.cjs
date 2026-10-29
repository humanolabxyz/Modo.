// Robótica · etapa 5: flujo completo en el navegador. Proyecto guardado (robot cableado + programa «evitar obstáculos» + caja) → ▶ el robot se mueve,
// gira antes de la caja → Detener lo devuelve → Construir, quitar una rueda → ▶ el resultado cambia → recargar y repetir.
// Uso: PANELLAB_URL=http://127.0.0.1:4326 node qa/verify-robotics-sim-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4326').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildRobot2wd, wireRobot2wd} = await import('./robotics/robot2wd.mjs');
  const {setPartProp} = await import('../src/robotics/project/commands.ts');
  const built = buildRobot2wd(); let project = setPartProp(await wireRobot2wd(built), built.ids.battery, 'voltage', 9);
  const hex = fs.readFileSync('qa/fixtures/robotica/avoid_obstacle.hex', 'utf8');
  project = {...project, workspace: {mode: 'simulate'}, scene: {...project.scene, obstacles: [{id: 'caja', shape: 'box', transform: {position: [0, 0.1, 0.75], rotation: [0, 0, 0, 1]}, size: [0.4, 0.2, 0.1]}]},
    firmware: [{id: 'fw-1', targetInstanceId: built.ids.uno, board: 'arduino-uno-r3', source: '// evitar obstáculos (hex importado)\n', updatedAt: '2026-10-29T00:00:00.000Z', artifact: {hex, origin: 'hex-import', sourceHash: 'importado', compiledAt: '2026-10-29T00:00:00.000Z'}}]};
  const ids = built.ids;
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    const open = async (min = 11) => { await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, min, {timeout: 20000}); await p.waitForTimeout(1200); };
    const pos = id => p.evaluate(i => window.__modoRobotics.partWorld(i), id);
    const watch = async ms => { const track = [], t0 = Date.now(); while (Date.now() - t0 < ms) { track.push(await pos(ids.chassis)); await p.waitForTimeout(150); } return track; };
    await open();
    assert.equal(await p.locator('.rb-app').getAttribute('data-mode'), 'simulate');
    const start = await pos(ids.chassis); assert.ok(Math.abs(start[2]) < 1e-3, 'el robot parte del origen');
    assert.equal(await p.locator('.rb-sim-chip').textContent(), 'DETENIDO');
    await p.screenshot({path: `${out}/sim-ui-start.png`});
    pass('el proyecto guardado abre en Simular, con el robot en su lugar y la simulación detenida');

    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    const track = await watch(9000), zs = track.map(t => t[2]), xs = track.map(t => t[0]);
    assert.ok(Math.max(...zs) > 0.25, `avanzó (z máx ${Math.max(...zs).toFixed(2)})`);
    const frontAtBox = Math.max(...track.filter(t => Math.abs(t[0]) < 0.35).map(t => t[2])) + 0.1215;
    assert.ok(frontAtBox < 0.68, `no tocó la caja (frente en ${frontAtBox.toFixed(2)} m, la cara está en 0,70 m)`);
    assert.ok(Math.max(...xs.map(Math.abs)) > 0.03, 'giró (se desvió de la línea recta)');
    await p.screenshot({path: `${out}/sim-ui-running.png`});
    assert.match(await p.locator('.rb-sim-note').textContent(), /m\/s/);
    pass(`▶ el robot se mueve por la física: z máx ${Math.max(...zs).toFixed(2)} m, x ${Math.min(...xs).toFixed(2)}…${Math.max(...xs).toFixed(2)} m, y no toca la caja`);

    await p.locator('.rb-dock button[aria-label="Consola"]').click(); await p.locator('[role=tab]', {hasText: 'Serie y estado'}).click();
    const state = await p.locator('.rb-state-list').textContent(); assert.match(state, /rad\/s/); assert.match(state, /distancia medida/);
    pass('la Consola muestra la velocidad de las ruedas y la distancia medida por el sensor');

    await p.locator('.rb-sim button[aria-label="Detener"]').click(); await p.waitForTimeout(500);
    const back = await pos(ids.chassis); assert.ok(Math.hypot(back[0] - start[0], back[2] - start[2]) < 1e-3, 'vuelve al lugar de partida');
    pass('Detener devuelve el robot al lugar donde lo armaste');

    await p.locator('.rb-dock button[aria-label="Escenario"]').click();
    await p.locator('.rb-scene-add button', {hasText: 'Cilindro'}).click(); assert.equal(await p.locator('.rb-scene ul[aria-label="Obstáculos"] li').count(), 2);
    await p.locator('.rb-scene ul[aria-label="Obstáculos"] li').nth(1).locator('button[aria-label^="Borrar"]').click(); assert.equal(await p.locator('.rb-scene ul[aria-label="Obstáculos"] li').count(), 1);
    pass('Escenario: agregar y quitar un obstáculo con la simulación detenida');

    await p.locator('.rb-mode button', {hasText: 'Construir'}).click();
    const sc = await p.evaluate(id => window.__modoRobotics.screenOf(id), ids.wheelR); assert.ok(sc, 'la rueda derecha es visible');
    await p.mouse.click(sc.x, sc.y); await p.keyboard.press('Delete'); await p.waitForTimeout(400);
    assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), 10);
    await p.locator('.rb-mode button', {hasText: 'Simular'}).click();
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    const noWheel = (await watch(6000)).at(-1);
    assert.ok(Math.abs(noWheel[0]) > 0.1 || noWheel[2] < 0.3, `sin una rueda no se comporta igual (x ${noWheel[0].toFixed(2)}, z ${noWheel[2].toFixed(2)})`);
    pass(`sin la rueda derecha el resultado cambia (x ${noWheel[0].toFixed(2)}, z ${noWheel[2].toFixed(2)}; con rueda z máx ${Math.max(...zs).toFixed(2)})`);
    await p.locator('.rb-sim button[aria-label="Detener"]').click();

    await open(10); assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), 10, 'la rueda sigue quitada tras recargar');
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click();
    const again = (await watch(6000)).at(-1);
    assert.ok(Math.hypot(again[0] - noWheel[0], again[2] - noWheel[2]) < 0.35, `tras recargar se repite el resultado (${again[0].toFixed(2)}, ${again[2].toFixed(2)} vs ${noWheel[0].toFixed(2)}, ${noWheel[2].toFixed(2)})`);
    pass('recargar y repetir: el proyecto guardado reproduce el mismo comportamiento');
    assert.deepEqual(report.errors, [], 'sin errores de consola'); pass('sin errores de consola ni de página');
    await ctx.close();
  } finally { await browser.close(); fs.writeFileSync(`${out}/sim-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
