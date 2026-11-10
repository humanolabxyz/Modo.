// Etapa 0: medición de rendimiento real de Agro (solo lectura, perfil de navegador aislado).
const {chromium} = require(process.env.BASE + '/qa/lib/playwright.cjs');
const fs = require('fs');
const base = process.env.AGRO_URL || 'http://127.0.0.1:4386', out = process.env.OUT, gpu = process.env.GPU !== '0';
const args = gpu ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-frame-rate-limit', '--disable-gpu-vsync'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const num = (p, a) => p.locator('[data-testid=agro-app]').getAttribute(a).then(Number);
const FPS = `new Promise(res => { let ticks = 0, drawn = 0, t0 = performance.now(), last = t0, lastDraw = t0, worst = 0, calls0 = window.__draws; window.__drewFlag = false; const f = t => { ticks++; if (window.__drewFlag) { drawn++; worst = Math.max(worst, t - lastDraw); lastDraw = t; window.__drewFlag = false; } if (t - t0 < 6000) requestAnimationFrame(f); else res({seconds: +((t - t0) / 1000).toFixed(2), rafTicks: ticks, renderedFrames: drawn, renderedFps: +(drawn / ((t - t0) / 1000)).toFixed(1), worstGapBetweenRenderedFramesMs: +worst.toFixed(1)}); }; requestAnimationFrame(f); })`;

async function run(side, label) {
  const b = await chromium.launch({headless: true, args});
  const ctx = await b.newContext({viewport: {width: 1440, height: 900}}); await ctx.addInitScript(() => { window.__draws = 0; window.__drewFlag = false; for (const K of [WebGL2RenderingContext, WebGLRenderingContext]) for (const m of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) { const o = K.prototype[m]; if (!o) continue; K.prototype[m] = function (...a) { window.__draws++; window.__drewFlag = true; return o.apply(this, a); }; } }); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(String(e))); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const res = {label, side, gpuRequested: gpu};
  await p.goto(`${base}/agro/`); await p.locator('[data-view=lobby]').waitFor(); await p.waitForTimeout(2200);
  res.renderer = await p.evaluate(() => { const c = document.createElement('canvas'), gl = c.getContext('webgl2'), e = gl && gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'desconocido'; });
  await p.getByTestId('agro-new').click(); await p.getByLabel('Nombre del mundo').fill('Medición ' + label);
  await p.getByRole('button', {name: /Granja productiva/}).click(); await p.getByTestId('agro-wizard-next').click(); await p.getByTestId('agro-wizard-next').click();
  await p.locator('input[type=range]').first().fill(String(side)); for (let i = 0; i < 4; i++) await p.getByTestId('agro-wizard-next').click();
  const t0 = Date.now(); await p.getByTestId('agro-create').click();
  await p.locator('[data-view=workspace]').waitFor(); await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]')?.dataset.tris) > 0, null, {timeout: 60000});
  res.createToFirstFrameMs = Date.now() - t0; await p.waitForTimeout(2500);
  res.orbit = {tris: await num(p, 'data-tris'), calls: await num(p, 'data-calls')};
  res.heapMBAfterLoad = await p.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1048576));
  await p.screenshot({path: `${out}/${label}-orbita.png`});
  // FPS en órbita: movimiento continuo de cámara con el ratón (arrastre circular) mientras se cuentan los cuadros
  const orbitJob = p.evaluate(FPS); await p.mouse.move(720, 450); await p.mouse.down();
  for (let i = 0; i < 120; i++) { await p.mouse.move(720 + 200 * Math.cos(i / 8), 450 + 80 * Math.sin(i / 8)); await p.waitForTimeout(48); }
  await p.mouse.up(); res.fpsOrbitDrag = await orbitJob;
  await p.getByRole('button', {name: 'Estratégica', exact: true}).click(); await p.waitForTimeout(2500);
  res.strategic = {tris: await num(p, 'data-tris'), calls: await num(p, 'data-calls')}; await p.screenshot({path: `${out}/${label}-estrategica.png`});
  res.fpsStrategicIdle = await p.evaluate(FPS);
  await p.getByRole('button', {name: 'Órbita', exact: true}).click(); await p.waitForTimeout(800);
  await p.getByRole('button', {name: 'Caminar', exact: true}).click(); await p.waitForTimeout(1200);
  const walkJob = p.evaluate(FPS); await p.keyboard.down('w'); await p.waitForTimeout(6200); await p.keyboard.up('w'); res.fpsWalk = await walkJob;
  res.walk = {tris: await num(p, 'data-tris'), calls: await num(p, 'data-calls')}; await p.screenshot({path: `${out}/${label}-caminar.png`});
  res.heapMBEnd = await p.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1048576)); res.errors = errors.slice(0, 5);
  await b.close(); return res;
}
(async () => { const r = []; for (const [side, label] of [[1000, 'mundo1000'], [1200, 'mundo1200']]) r.push(await run(side, label + (gpu ? '-gpu' : '-sw'))); fs.writeFileSync(`${out}/rendimiento-${gpu ? 'gpu' : 'sw'}.json`, JSON.stringify(r, null, 2)); console.log(JSON.stringify(r, null, 2)); })().catch(e => { console.error('ERROR', e); process.exit(1); });
