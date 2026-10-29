// Perfil de CPU (JS) de una acción: qué funciones consumen el tiempo (CPU 4x)
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.B || 'http://127.0.0.1:4460';
const which = process.env.WHICH || 'soldadura';
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await c.newPage(); const cdp = await c.newCDPSession(p);
  const lab = /soldadura|temperatura|detectores/.test(which);
  await p.goto(base + (lab ? '/laboratorio/' : '/'), { waitUntil: 'load' });
  await p.waitForTimeout(lab ? 3000 : 5500);
  if (process.env.PERF_CSS) await p.addStyleTag({ content: process.env.PERF_CSS });
  if (process.env.NOID) await p.evaluate(() => document.body.classList.remove('modo-identity'));
  let action;
  if (which === 'soldadura') action = () => p.getByRole('button', { name: /^Soldadura/ }).first().click();
  else if (which === 'temperatura') action = () => p.getByRole('button', { name: /^Temperatura/ }).first().click();
  else if (which === 'detectores') action = () => p.getByRole('button', { name: /^Detectores/ }).first().click();
  else if (which === 'entrar') { const card = p.locator('.home-module').first(); action = () => card.click({ force: true }); }
  else if (which === 'diagrama') { const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(3500); action = () => p.getByRole('button', { name: /Abrir diagrama/ }).first().click(); }
  else if (which === 'rayo') { const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(3500); action = () => p.locator('.simulation-toggle').click(); }
  else if (which === 'ventana') { const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(3500); await p.getByText(/Opciones de práctica/).first().click(); await p.waitForTimeout(900); const h = await p.locator('.floating-window-header').last().boundingBox(); action = async () => { await p.mouse.move(h.x + 60, h.y + 20); await p.mouse.down(); for (let i = 0; i < 40; i++) await p.mouse.move(h.x + 60 + i * 8, h.y + 20 + i * 4); await p.mouse.up(); }; }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start');
  await cdp.send('Performance.enable'); const m0 = (await cdp.send('Performance.getMetrics')).metrics;
  await action(); await p.waitForTimeout(1800);
  const m1 = (await cdp.send('Performance.getMetrics')).metrics;
  const { profile } = await cdp.send('Profiler.stop');
  const g = (m, k) => m.find(x => x.name === k).value;
  console.log('== ' + which + ': script ' + Math.round((g(m1, 'ScriptDuration') - g(m0, 'ScriptDuration')) * 1000) + ' ms · estilo ' + Math.round((g(m1, 'RecalcStyleDuration') - g(m0, 'RecalcStyleDuration')) * 1000) + ' ms · layout ' + Math.round((g(m1, 'LayoutDuration') - g(m0, 'LayoutDuration')) * 1000) + ' ms (CPU 4x)');
  const self = new Map(); const nodes = new Map(profile.nodes.map(n => [n.id, n]));
  const dts = profile.timeDeltas; let total = 0;
  profile.samples.forEach((id, i) => { const n = nodes.get(id); const d = dts[i] / 1000; total += d; const f = n.callFrame; if (f.functionName === '(idle)' || f.functionName === '(program)' && false) return; const key = (f.functionName || '(anónima)') + ' · ' + (f.url || '').split('/').pop().slice(0, 34) + ':' + f.lineNumber; self.set(key, (self.get(key) || 0) + d); });
  // quién llama a las funciones que fuerzan layout
  const parent = new Map(); profile.nodes.forEach(n => (n.children || []).forEach(ch => parent.set(ch, n.id)));
  const callers = new Map();
  profile.samples.forEach((id, i) => { const n = nodes.get(id); if (!/getBoundingClientRect|getClientRects|offsetWidth|offsetHeight|getComputedStyle|getScreenCTM/.test(n.callFrame.functionName)) return; const chain = []; let cur = parent.get(id); for (let k = 0; k < 4 && cur; k++) { const f = nodes.get(cur).callFrame; if (f.url) chain.push((f.functionName || '(anón)') + '@' + (f.url || '').split('/').pop().slice(0, 28) + ':' + f.lineNumber + ':' + f.columnNumber); cur = parent.get(cur); } const key = n.callFrame.functionName + ' ← ' + chain.join(' ← '); callers.set(key, (callers.get(key) || 0) + dts[i] / 1000); });
  console.log('  -- llamadores de lecturas de layout:');
  [...callers].sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([k, v]) => console.log('  ' + String(Math.round(v)).padStart(5) + ' ms  ' + k.slice(0, 260)));
  const top = [...self].filter(([k]) => !k.startsWith('(idle)')).sort((a, b) => b[1] - a[1]).slice(0, 14);
  top.forEach(([k, v]) => console.log('  ' + String(Math.round(v)).padStart(5) + ' ms  ' + k));
  await b.close();
})();
