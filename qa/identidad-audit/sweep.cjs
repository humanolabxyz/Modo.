// Barrido de menús, diálogos y pantallas internas: capturas + contraste + estilos por defecto
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const check = require('./check.cjs');
const base = process.env.B || 'http://127.0.0.1:4460';
const scanDefault = () => {
  const out = [];
  for (const e of document.querySelectorAll('button,a[href],select,input:not([type=hidden]),textarea,summary')) {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    if (r.width < 6 || r.height < 6 || cs.visibility === 'hidden' || cs.display === 'none' || e.closest('svg')) continue;
    const tag = e.tagName.toLowerCase();
    const f = [];
    if (tag === 'button' && cs.backgroundColor === 'rgb(239, 239, 239)' && cs.borderTopStyle !== 'none') f.push('boton-por-defecto');
    if (tag === 'a' && cs.color === 'rgb(0, 0, 238)' && e.textContent.trim()) f.push('enlace-azul');
    if (['select', 'input', 'textarea'].includes(tag) && !['checkbox', 'radio', 'range', 'color', 'file'].includes(e.type) && cs.borderTopStyle === 'inset') f.push('campo-por-defecto');
    if (/Times/.test(cs.fontFamily)) f.push('serif');
    if (f.length) out.push(tag + '[' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24) + '] ' + f.join(','));
  }
  return out;
};
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await c.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 140)));
  const rep = async (name) => {
    await p.waitForTimeout(700);
    await p.screenshot({ path: 'qa/identidad-audit/sw-' + name + '.png' });
    const con = (await p.evaluate(check)).filter(i => !i.unknown && !/SVGAnimated/.test(i.cls));
    const def = await p.evaluate(scanDefault);
    console.log('\n## ' + name + ' | contraste:' + con.length + ' | por-defecto:' + def.length);
    const seen = new Set();
    con.forEach(i => { const k = i.cls + i.color; if (!seen.has(k) && seen.size < 6) { seen.add(k); console.log('   C ' + i.ratio + ' "' + i.txt + '" .' + i.cls + ' fg=' + i.color + ' bg=' + i.bg); } });
    def.slice(0, 6).forEach(x => console.log('   D ' + x));
  };
  const step = async (label, fn) => { try { await fn(); } catch (e) { console.log('(!) ' + label + ': ' + e.message.split('\n')[0].slice(0, 90)); } };

  // ---- Home
  await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(5000);
  await step('versiones', async () => { await p.locator('.home-version>summary').click(); await rep('home-versiones'); await p.keyboard.press('Escape'); });
  // ---- Panel
  const card = p.locator('.home-module').first(); await card.click({ force: true }); await p.waitForTimeout(600); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(3000);
  const click = async (name, sel, shot, closeKey = true) => step(name, async () => { await p.locator(sel).first().click({ timeout: 2500 }); await rep(shot); if (closeKey) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); } });
  await click('ayuda', 'button[aria-label="Cómo usar el panel"], .help-btn', 'panel-ayuda');
  await click('procedimientos', '.procedure-trigger', 'panel-procedimientos');
  await click('cables', 'button:has-text("Cables")', 'panel-cables');
  await click('añadir', '.add-panel-toggle', 'panel-anadir');
  await click('simulacion', '.simulation-menu>summary', 'panel-simulacion');
  await click('multimetro', 'button[aria-label="Multímetro del panel"]', 'panel-multimetro');
  await step('color', async () => { await p.locator('button[aria-label="Color para nuevos cables"]').first().click({ timeout: 2500, force: true }); await rep('panel-color'); await p.keyboard.press('Escape'); });
  await click('guia', 'button[aria-label="Guía paso a paso"]', 'panel-guia', false);
  await step('cerrar guia', async () => { await p.keyboard.press('Escape'); });
  await click('opciones', 'text=Opciones de práctica', 'panel-opciones');
  // ---- Laboratorio
  await p.goto(base + '/laboratorio/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
  await click('proyecto', '.lab-project-menu>summary', 'lab-proyecto-menu');
  await step('componentes', async () => { await p.getByRole('button', { name: /^Componentes/ }).first().click({ timeout: 2000 }); await rep('lab-componentes'); await p.keyboard.press('Escape'); });
  await step('plc', async () => { await p.getByRole('button', { name: /^PLC/ }).first().click(); await p.waitForTimeout(1200); await rep('lab-plc'); });
  await step('geogebra lecciones', async () => { await p.getByRole('button', { name: /^GeoGebra/ }).first().click(); await p.waitForTimeout(1500); await p.getByRole('button', { name: /Lecciones/ }).first().click({ timeout: 2000 }); await rep('lab-geogebra-lecciones'); });
  await step('temperatura libreta', async () => { await p.getByRole('button', { name: /^Temperatura/ }).first().click(); await p.waitForTimeout(1500); await p.locator('button[aria-label*="libreta" i], button:has-text("Libreta")').first().click({ timeout: 2500, force: true }); await rep('lab-temperatura-libreta'); });
  // ---- Estudio
  await p.goto(base + '/estudio/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
  await step('videos', async () => { await p.locator('.tutorial-trigger').first().click({ timeout: 2000 }); await rep('estudio-videos'); await p.keyboard.press('Escape'); });
  await step('ramo', async () => { await p.locator('.campus-course').first().click(); await p.waitForTimeout(1500); await p.locator('.course-unit>summary').first().click(); await p.waitForTimeout(500); });
  await step('leccion', async () => { await p.locator('text=Estudiar').first().click(); await p.waitForTimeout(2500); await rep('estudio-leccion-1'); });
  for (const [label, re] of [['ver-ejemplo', /Ver un ejemplo|Ver ejemplo/], ['practicar', /^Practicar/], ['repasar', /Repasar errores/], ['usar-clase', /Usar en clase/], ['desafio', /Desafío del ramo/]]) {
    await step(label, async () => { await p.getByRole('button', { name: re }).first().click({ timeout: 2000 }); await rep('estudio-' + label); });
  }
  console.log('\nERRORES JS:', errs.length ? errs.join(' / ') : 'ninguno');
  await b.close();
})();
