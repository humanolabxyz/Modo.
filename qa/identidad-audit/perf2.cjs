// Latencia de acciones concretas: cuánto se bloquea la página al pulsar (CPU 4x)
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.B || 'http://127.0.0.1:4460';
const rate = +(process.env.CPU || 4);
(async () => {
  const b = await chromium.launch();
  const rows = [];
  const mk = async (path) => {
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); window.__tasks = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__tasks.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch {} });
    const p = await c.newPage(); const cdp = await c.newCDPSession(p);
    await p.goto(base + path, { waitUntil: 'load' });
    await p.waitForTimeout(path === '/' ? 5500 : 3000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    return { c, p };
  };
  // act: mide desde el clic hasta que la página vuelve a pintar dos cuadros seguidos y lista las tareas largas
  const act = async (p, name, fn) => {
    await p.evaluate(() => { window.__tasks.length = 0; window.__t0 = performance.now(); });
    const t = Date.now();
    try { await fn(); } catch (e) { console.log('(!) ' + name + ': ' + String(e.message).slice(0, 80)); }
    const painted = await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(performance.now() - window.__t0)))));
    await p.waitForTimeout(350);
    const tasks = await p.evaluate(() => window.__tasks.slice());
    const longest = tasks.reduce((m, x) => Math.max(m, x[1]), 0);
    const block = tasks.reduce((s, x) => s + x[1], 0);
    const row = { accion: name, hastaPintar: Math.round(painted), tareaMasLarga: Math.round(longest), bloqueoTotal: Math.round(block), tareas: tasks.length }; rows.push(row); console.log([row.accion, row.hastaPintar, row.tareaMasLarga, row.bloqueoTotal, row.tareas].join('	'));
  };
  // ---- Panel
  { const { c, p } = await mk('/');
    const card = p.locator('.home-module').first();
    await act(p, 'Home → seleccionar Panel (1er toque)', async () => { await card.click({ force: true }); });
    await act(p, 'Home → entrar al Panel', async () => { await card.click({ force: true }).catch(() => {}); await p.waitForSelector('.board-svg', { timeout: 8000 }).catch(() => {}); });
    await p.waitForTimeout(1500);
    await act(p, 'Panel → activar rayo (simular)', async () => { await p.locator('.simulation-toggle').click(); });
    await act(p, 'Panel → abrir menú Simulación', async () => { await p.locator('.simulation-menu>summary').click(); });
    await act(p, 'Panel → Enchufe (menú)', async () => { await p.locator('.simulation-plug-action').click({ force: true }).catch(() => {}); });
    await p.keyboard.press('Escape');
    await act(p, 'Panel → abrir Opciones de práctica', async () => { await p.getByText(/Opciones de práctica/).first().click(); });
    await p.keyboard.press('Escape');
    await act(p, 'Panel → Abrir diagrama', async () => { await p.getByRole('button', { name: /Abrir diagrama/ }).first().click(); await p.waitForSelector('.diagram-window:not([hidden]) .cade-reader', { timeout: 8000 }).catch(() => {}); });
    await act(p, 'Panel → Cerrar diagrama', async () => { await p.getByRole('button', { name: /Cerrar diagrama/ }).first().click().catch(() => {}); });
    // conectar un cable: dos clics sobre bornes
    await act(p, 'Panel → herramienta Conectar cables', async () => { await p.locator('button[aria-label="Conectar cables"]').click({ force: true }).catch(() => {}); });
    const terms = p.locator('.terminal');
    const n = await terms.count();
    await act(p, 'Panel → hover sobre 20 bornes', async () => { for (let i = 0; i < 20 && i < n; i++) await terms.nth(i * 3 % n).hover({ force: true }).catch(() => {}); });
    await act(p, 'Panel → borne origen', async () => { await terms.nth(5).click({ force: true }).catch(() => {}); });
    await act(p, 'Panel → borne destino (crea cable)', async () => { await terms.nth(40).click({ force: true }).catch(() => {}); });
    await c.close(); }
  // ---- Laboratorio
  { const { c, p } = await mk('/laboratorio/');
    for (const t of ['PLC', 'HMI', 'Procesos', 'Protoboard', 'Soldadura', 'Temperatura', 'Detectores']) {
      await act(p, 'Laboratorio → pestaña ' + t, async () => { await p.getByRole('button', { name: new RegExp('^' + t) }).first().click(); await p.waitForTimeout(250); });
    }
    await act(p, 'Laboratorio → Simular proyecto', async () => { await p.getByRole('button', { name: /Simular proyecto/ }).click().catch(() => {}); });
    await p.waitForTimeout(1500);
    await act(p, 'Laboratorio → Detener', async () => { await p.getByRole('button', { name: /Detener/ }).first().click().catch(() => {}); });
    await act(p, 'Laboratorio → menú Proyecto', async () => { await p.locator('.lab-project-menu>summary').click().catch(() => {}); });
    await c.close(); }
  // ---- Estudio
  { const { c, p } = await mk('/estudio/');
    await act(p, 'Estudio → abrir un ramo', async () => { await p.locator('.campus-course').first().click(); await p.waitForSelector('.course-unit', { timeout: 6000 }).catch(() => {}); });
    await act(p, 'Estudio → abrir una unidad', async () => { await p.locator('.course-unit>summary').first().click(); });
    await act(p, 'Estudio → abrir una lección', async () => { await p.locator('text=Estudiar').first().click(); await p.waitForSelector('.study-lesson-rail, .academic-lesson', { timeout: 8000 }).catch(() => {}); });
    for (const t of [/Ver un ejemplo/, /^Practicar/, /Repasar errores/, /Usar en clase/, /Desafío del ramo/]) await act(p, 'Estudio → ' + String(t).slice(1, 18), async () => { await p.getByRole('button', { name: t }).first().click().catch(() => {}); });
    await c.close(); }
  await b.close();
  const cols = ['accion', 'hastaPintar', 'tareaMasLarga', 'bloqueoTotal', 'tareas'];
  console.log('CPU x' + rate + ' · ms');
  console.log(cols.join('\t'));
  rows.forEach(r => console.log(cols.map(c => r[c]).join('\t')));
})();
