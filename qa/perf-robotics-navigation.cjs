const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const project = buildTemplate('robot-oruga-radar');
  project.workspace.mode = 'simulate';
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const result = {errors: []};
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, deviceScaleFactor: 2});
    await ctx.addInitScript(project => {
      localStorage.setItem('modo-robotica-v1', JSON.stringify({projects: [project], active: project.id}));
      localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen');
      sessionStorage.setItem('modo-opened-v2', '1');
    }, project);
    const p = await ctx.newPage(); p.on('pageerror', e => result.errors.push(e.message));
    await p.goto((process.env.PANELLAB_URL || 'http://127.0.0.1:4326') + '/robotica/?debug=1');
    await p.waitForFunction(() => window.__modoRobotics?.renderStats);
    await p.waitForTimeout(2500);
    const stats = () => p.evaluate(() => window.__modoRobotics.renderStats());
    result.idle = await stats();
    await p.waitForTimeout(1200);
    result.idleFrames = (await stats()).frame - result.idle.frame;
    fs.mkdirSync('qa/robotics-performance', {recursive: true});
    const label = process.env.PERF_LABEL || 'after';
    await p.screenshot({path: `qa/robotics-performance/${label}-desktop.png`});
    await p.locator('button[aria-label="Ejecutar"]').click();
    await p.waitForFunction(() => document.querySelector('.rb-sim-chip')?.textContent !== 'CARGANDO');
    await p.waitForTimeout(2000);
    result.running = await stats();
    await p.locator('.rb-follow').click();
    assert.equal(await p.locator('.rb-follow').getAttribute('aria-pressed'), 'true');
    const canvas = await p.locator('.rb-canvas').boundingBox();
    await p.mouse.move(canvas.x + canvas.width * .6, canvas.y + canvas.height * .6);
    await p.mouse.wheel(45, 20);
    await p.waitForTimeout(500);
    result.followAfterNavigation = await p.locator('.rb-follow').getAttribute('aria-pressed');
    await p.locator('button[aria-label="Primera persona"]').click();
    const cam = () => p.evaluate(() => window.__modoRobotics.camera());
    const before = await cam();
    await p.keyboard.down('w'); await p.waitForTimeout(800); await p.keyboard.up('w');
    result.flyDistance = Math.hypot(...(await cam()).position.map((n, i) => n - before.position[i]));
    result.frames = await p.evaluate(() => new Promise(resolve => {
      const intervals = []; let last = performance.now(); const start = last;
      const frame = now => { intervals.push(now - last); last = now; if (now - start < 3000) requestAnimationFrame(frame); else { intervals.sort((a,b) => a-b); resolve({count: intervals.length, p95: intervals[Math.floor(intervals.length * .95)], max: intervals.at(-1)}); } };
      requestAnimationFrame(frame);
    }));
    await p.locator('button[aria-label="Detener"]').click();
    await p.locator('button[aria-label="Cámara orbital"]').click();
    await p.locator('button[aria-label="Vista Atrás"]').dispatchEvent('click');
    await p.locator('button[aria-label="Encuadrar"]').click();
    await p.waitForTimeout(1000);
    await p.screenshot({path: `qa/robotics-performance/${label}-desktop-framed.png`});
    await p.setViewportSize({width: 390, height: 844}); await p.waitForTimeout(1000);
    await p.locator('button[aria-label="Encuadrar"]').click(); await p.waitForTimeout(1000);
    await p.screenshot({path: `qa/robotics-performance/${label}-mobile.png`});
    if (label !== 'before') {
      assert.ok(result.idleFrames <= 2, 'la escena detenida descansa');
      assert.equal(result.followAfterNavigation, 'false', 'navegar suelta el seguimiento');
      assert.ok(result.flyDistance > .05, 'primera persona se mueve con la simulación en marcha');
      assert.deepEqual(result.errors, []);
    }
    fs.writeFileSync(`qa/robotics-performance/${label}.json`, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
