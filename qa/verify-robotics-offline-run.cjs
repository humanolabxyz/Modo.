// Robótica · etapa 4: SIN CONEXIÓN. Tras una visita, un proyecto con programa ya compilado se abre, se ejecuta (worker + emulador) y se puede
// editar el código, sin red; no hay servicio de compilación y se ofrece importar un .hex.  Necesita el BUILD servido (npm run build + astro preview).
// Uso: PANELLAB_URL=http://127.0.0.1:4344 node qa/verify-robotics-offline-run.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4344').replace(/\/$/, ''), out = 'qa/robotics';
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
(async () => {
  const {buildRobot2wd, wireRobot2wd, withLedAnd9V} = await import('./robotics/robot2wd.mjs');
  const built = buildRobot2wd(), {project, led} = await withLedAnd9V({project: await wireRobot2wd(built), ids: built.ids});
  const hex = fs.readFileSync('qa/fixtures/robotica/blink_200.hex', 'utf8');
  const withProgram = {...project, firmware: [{id: 'fw-1', targetInstanceId: built.ids.uno, board: 'arduino-uno-r3', source: '// programa importado\n', updatedAt: '2026-10-29T00:00:00.000Z', artifact: {hex, origin: 'hex-import', sourceHash: 'importado', compiledAt: '2026-10-29T00:00:00.000Z'}}]};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [withProgram], active: withProgram.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/'); await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(800);       // instala la PWA
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForTimeout(3500);   // visita: guarda la página y los chunks (y precalienta worker y editor)
    const cached = await p.evaluate(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(new URL(r.url).pathname); return out; });
    assert.ok(cached.some(u => /sim\.worker/.test(u)), 'el worker de la simulación quedó en la caché tras la visita'); assert.ok(cached.some(u => /CodeEditor/.test(u)), 'el editor quedó en la caché');
    pass('tras una visita, el worker de la simulación y el editor quedan en la caché del navegador');

    await ctx.setOffline(true); await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor({timeout: 20000}); await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 13, null, {timeout: 20000});
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); assert.equal(await p.locator('.rb-sim-chip').textContent(), 'EN MARCHA');
    const r = await p.evaluate(async id => { const v = []; const end = performance.now() + 3000; while (performance.now() < end) { v.push(window.__modoRobotics.ledGlow(id)); await new Promise(r => setTimeout(r, 25)); } let t = 0; for (let i = 1; i < v.length; i++) if ((v[i] > 0.3) !== (v[i - 1] > 0.3)) t++; return {t, max: Math.max(...v), min: Math.min(...v)}; }, led);
    assert.ok(r.max > 0.5 && r.min < 0.05 && r.t >= 6, `sin conexión el programa importado hace parpadear el LED (${r.t} cambios en 3 s)`);
    pass(`SIN CONEXIÓN: el proyecto se abre y el programa importado se ejecuta: el LED parpadea (${r.t} cambios en 3 s)`);

    await p.locator('.rb-sim button[aria-label="Detener"]').click(); await p.locator('.rb-dock button[aria-label="Programación"]').click(); await p.locator('.cm-editor').waitFor({timeout: 15000});
    assert.equal(await p.locator('button[aria-label="Compilar"]').isDisabled(), true); assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'imported');
    assert.match(await p.locator('.rb-code-advice').textContent(), /importado/);
    pass('sin conexión el editor abre, «Compilar» queda desactivado y el programa importado sigue disponible');
    await p.locator('.cm-content').click(); await p.keyboard.press('Control+a'); await p.keyboard.insertText('void setup() {}\nvoid loop() {}\n'); await p.waitForTimeout(500);
    assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'imported', 'editar el texto no invalida un .hex importado');
    assert.deepEqual(report.errors, [], 'sin errores de consola'); pass('sin errores de consola ni de página');
    await ctx.close();
  } finally { await browser.close(); fs.writeFileSync(`${out}/offline-run-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
