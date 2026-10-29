// Perfil de rendimiento: carga + fluidez bajo CPU 4x. Opcional: PERF_NOID=1 quita la capa modo-identity para comparar.
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.B || 'http://127.0.0.1:4460';
const NOID = process.env.PERF_NOID === '1';
const NOFIX = process.env.PERF_NOFIX === '1';
const ONLY = process.env.ONLY;
const THROTTLE = +(process.env.CPU || 4);
const frames = `(() => { window.__f = []; let last = performance.now(); const loop = t => { window.__f.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); }; window.__raf = requestAnimationFrame(loop); })()`;
const stopFrames = () => { cancelAnimationFrame(window.__raf); const f = window.__f.slice(2); window.__f = []; f.sort((a, b) => a - b); const n = f.length || 1; const avg = f.reduce((s, x) => s + x, 0) / n; return { n: f.length, fps: +(1000 / avg).toFixed(1), p95: +(f[Math.floor(n * .95)] || 0).toFixed(1), worst: +(f[n - 1] || 0).toFixed(0), jank: f.filter(x => x > 50).length }; };
const metrics = async (cdp) => { const { metrics: m } = await cdp.send('Performance.getMetrics'); const g = k => m.find(x => x.name === k)?.value || 0; return { script: g('ScriptDuration'), layout: g('LayoutDuration'), style: g('RecalcStyleDuration'), task: g('TaskDuration'), layouts: g('LayoutCount'), recalcs: g('RecalcStyleCount'), heap: g('JSHeapUsedSize') }; };
const diff = (a, b) => ({ script: Math.round((b.script - a.script) * 1000), layout: Math.round((b.layout - a.layout) * 1000), style: Math.round((b.style - a.style) * 1000), task: Math.round((b.task - a.task) * 1000), layouts: b.layouts - a.layouts, recalcs: b.recalcs - a.recalcs });
(async () => {
  const b = await chromium.launch();
  const rows = [];
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const scenarios = [
    ['home', '/', async p => { await p.waitForTimeout(3500); }],
    ['estudio-scroll', '/estudio/', async p => { await p.waitForTimeout(1500); for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, 260); await p.waitForTimeout(60); } for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, -260); await p.waitForTimeout(60); } }],
    ['estudio-hover', '/estudio/', async p => { await p.waitForTimeout(1200); const cards = await p.locator('.campus-course').all(); for (const c of cards.slice(0, 6)) { await c.hover({ force: true }).catch(() => {}); await p.waitForTimeout(120); } }],
    ['estudio-leccion', '/estudio/', async p => { await p.waitForTimeout(1200); await p.locator('.campus-course').first().click(); await p.waitForTimeout(800); await p.locator('.course-unit>summary').first().click(); await p.waitForTimeout(400); await p.locator('text=Estudiar').first().click(); await p.waitForTimeout(1800); for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(60); } }],
    ['panel-pan-zoom', '/', async p => { const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(600); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(2500); await p.mouse.move(800, 450); for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(50); } await p.mouse.down(); for (let i = 0; i < 40; i++) await p.mouse.move(800 + i * 6, 450 + i * 3); await p.mouse.up(); for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(50); } }],
    ['panel-ventana', '/', async p => { const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(600); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(2500); await p.getByText(/Opciones de práctica/).first().click().catch(() => {}); await p.waitForTimeout(700); const h = await p.locator('.floating-window-header').last().boundingBox(); if (h) { await p.mouse.move(h.x + 60, h.y + 20); await p.mouse.down(); for (let i = 0; i < 40; i++) await p.mouse.move(h.x + 60 + i * 8, h.y + 20 + i * 4); await p.mouse.up(); } }],
    ['lab-esquemas', '/laboratorio/', async p => { await p.waitForTimeout(2500); await p.mouse.move(700, 450); for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(50); } await p.mouse.down(); for (let i = 0; i < 40; i++) await p.mouse.move(700 + i * 5, 450 + i * 2); await p.mouse.up(); }],
    ['lab-protoboard', '/laboratorio/', async p => { await p.waitForTimeout(2200); await p.getByRole('button', { name: /^Protoboard/ }).first().click(); await p.waitForTimeout(1800); await p.mouse.move(700, 560); for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(50); } await p.mouse.down(); for (let i = 0; i < 40; i++) await p.mouse.move(700 + i * 5, 560 + i * 2); await p.mouse.up(); }],
    ['lab-plc', '/laboratorio/', async p => { await p.waitForTimeout(2200); await p.getByRole('button', { name: /^PLC/ }).first().click(); await p.waitForTimeout(1500); await p.getByRole('button', { name: /Simular proyecto/ }).click().catch(() => {}); await p.waitForTimeout(2500); }],
  ];
  for (const [name, path, run] of scenarios) {
    if (ONLY && !name.startsWith(ONLY)) continue;
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    await page.addInitScript(() => { window.__lt = 0; window.__ltn = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__lt += Math.max(0, e.duration - 50); window.__ltn++; } }).observe({ type: 'longtask', buffered: true }); } catch {} window.__lcp = 0; try { new PerformanceObserver(l => { const e = l.getEntries().at(-1); window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {} });
    const t0 = Date.now();
    await page.goto(base + path, { waitUntil: 'load' });
    const loadMs = Date.now() - t0;
    const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const fcp = performance.getEntriesByName('first-contentful-paint')[0]; const res = performance.getEntriesByType('resource'); const bytes = res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0); return { dcl: Math.round(n.domContentLoadedEventEnd), loadEv: Math.round(n.loadEventEnd), fcp: Math.round(fcp?.startTime || 0), reqs: res.length, kb: Math.round(bytes / 1024) }; });
    if (NOID) await page.evaluate(() => document.body.classList.remove('modo-identity'));
    if (NOFIX) await page.addStyleTag({ content: 'body.modo-identity{background-attachment:scroll!important}' });
    if (process.env.PERF_CSS) await page.addStyleTag({ content: process.env.PERF_CSS });
    await page.waitForTimeout(1000);
    const m0 = await metrics(cdp);
    await page.evaluate(() => { window.__f = []; let last = performance.now(); const loop = t => { window.__f.push(t - last); last = t; window.__raf = requestAnimationFrame(loop); }; window.__raf = requestAnimationFrame(loop); });
    await run(page);
    const fr = await page.evaluate(() => { cancelAnimationFrame(window.__raf); const f = (window.__f || []).slice(2); f.sort((a, b) => a - b); const n = f.length || 1; const avg = f.reduce((s, x) => s + x, 0) / n; return { n: f.length, fps: +(1000 / avg).toFixed(1), p95: +(f[Math.floor(n * .95)] || 0).toFixed(1), worst: +(f[n - 1] || 0).toFixed(0), jank: f.filter(x => x > 50).length }; });
    const m1 = await metrics(cdp);
    const lt = await page.evaluate(() => ({ tbt: Math.round(window.__lt), n: window.__ltn, lcp: Math.round(window.__lcp) }));
    const d = diff(m0, m1);
    rows.push({ name, ...nav, lcp: lt.lcp, tbt: lt.tbt, longtasks: lt.n, fps: fr.fps, p95: fr.p95, worst: fr.worst, jank: fr.jank, script: d.script, style: d.style, layout: d.layout, recalcs: d.recalcs, layouts: d.layouts, heapMB: Math.round(m1.heap / 1048576) });
    await page.close();
  }
  await b.close();
  const cols = ['name', 'fcp', 'lcp', 'loadEv', 'reqs', 'kb', 'tbt', 'fps', 'p95', 'worst', 'jank', 'script', 'style', 'layout', 'recalcs', 'layouts', 'heapMB'];
  console.log('CPU x' + THROTTLE + (NOID ? ' · SIN modo-identity' : '') + (NOFIX ? ' · fondo scroll' : '') + '  (tiempos en ms; script/style/layout = trabajo durante la interacción)');
  console.log(cols.join('\t'));
  rows.forEach(r => console.log(cols.map(c => r[c]).join('\t')));
})();
