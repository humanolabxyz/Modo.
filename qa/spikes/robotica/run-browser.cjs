// SPIKE E1+E3+E4 · Ejecuta los workers de avr8js y Rapier DENTRO de la página compilada (CSP real) y mide.
// Prerrequisitos: npm run build + astro preview, run-e2.mjs (genera .hex) y bundle-worker.mjs. Uso: node run-browser.cjs [url]
const fs = require('node:fs'), path = require('node:path');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.argv[2] || 'http://127.0.0.1:4330').replace(/\/$/, '');
const root = path.resolve(__dirname, '../../..'), cache = path.join(root, '.cache/spikes-robotica');
const code = fs.readFileSync(path.join(cache, 'worker.js'), 'utf8');
const hex = Object.fromEntries(['blink', 'pwm_64', 'pwm_128', 'pwm_192', 'pulse', 'serial_adc', 'robot_like'].map(n => [n, fs.readFileSync(path.join(cache, 'hex', n + '.hex'), 'utf8')]));
const report = {url: base, date: new Date().toISOString(), runs: []};

// Se ejecuta dentro de la página: crea el worker desde un Blob (worker-src 'self' blob:) y le pide el trabajo.
const inPage = async ({code, hex, throttleLabel}) => {
  const out = {csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content.match(/script-src[^;]*/)?.[0]};
  const t0 = performance.now();
  const worker = new Worker(URL.createObjectURL(new Blob([code], {type: 'text/javascript'})));
  const ask = (msg, timeout = 240000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('tiempo agotado')), timeout);
    worker.onmessage = e => { if (e.data.cmd === 'ready') return; clearTimeout(timer); e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.result); };
    worker.onerror = e => { clearTimeout(timer); reject(new Error('error del worker: ' + e.message)); };
    worker.postMessage(msg);
  });
  try { out.e1 = await ask({cmd: 'e1', hex}); out.workerStartAndE1Ms = Math.round(performance.now() - t0); } catch (e) { out.e1Error = e.message; }
  try { const t1 = performance.now(); out.e3 = await ask({cmd: 'e3', seconds: 60}); out.e3TotalMs = Math.round(performance.now() - t1); } catch (e) { out.e3Error = e.message; }
  worker.terminate(); out.throttleLabel = throttleLabel; return out;
};

(async () => {
  const browser = await chromium.launch();
  for (const [label, page, cpu] of [['robotica · escritorio', '/robotica/', 1], ['robotica · tablet (CPU ×4, proxy)', '/robotica/', 4], ['laboratorio · control negativo (sin wasm-unsafe-eval)', '/laboratorio/', 1]]) {
    const ctx = await browser.newContext({serviceWorkers: 'block'}), p = await ctx.newPage(), cdp = await ctx.newCDPSession(p), problems = [];
    p.on('console', m => { if (/Content Security|CSP|WebAssembly|wasm|Refused/i.test(m.text())) problems.push(m.text().slice(0, 220)); });
    await p.goto(base + page); await p.waitForLoadState('load'); await p.waitForTimeout(1500);
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', {rate: cpu});
    const result = await p.evaluate(inPage, {code, hex, throttleLabel: label}).catch(e => ({fatal: e.message}));
    report.runs.push({label, page, cpuThrottle: cpu, ...result, cspConsole: problems.slice(0, 3)});
    const e1 = result.e1, e3 = result.e3;
    console.log(`\n== ${label}\n  CSP: ${result.csp}`);
    console.log('  E1 avr8js:', e1 ? `blink ±${e1.blink.maxDeviationMs} ms · velocidad ${e1.blink.speed}× · robot ${e1.robot.speed}× · pulso ${e1.pulse.errorPct}%` : 'ERROR ' + result.e1Error);
    console.log('  E3 Rapier:', e3 ? `init ${e3.initMs} ms · paso p95 ${e3.run1.stepMs.p95} ms (warm max ${e3.run1.stepMs.warmMax}) · ${e3.run1.realtimeFactor}× tiempo real · determinista ${e3.deterministic}` : 'BLOQUEADO → ' + String(result.e3Error).split('\n')[0].slice(0, 200));
    if (problems.length) console.log('  consola CSP:', problems[0]);
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'results/e1-e3-e4-navegador.json'), JSON.stringify(report, null, 2));
})();
