// Industria, fase 10: accesibilidad automática en cada vista y panel — nombre accesible de todo control, etiquetas de formularios, ids únicos, idioma,
// contraste de texto (WCAG 2.1 AA, 4,5:1), foco visible y recorrido con teclado. Es una auditoría automática: NO sustituye una prueba con lector de pantalla.
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: [], violations: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const lib = execFileSync(process.execPath, ['qa/industria-example-fixture.mjs'], {encoding: 'utf8'});
const VIEWS = ['Planta 3D', 'Tablero', 'Diagramas', 'PLC', 'HMI', 'Documentación'];
const PANELS = ['Piezas', 'Propiedades', 'Escenario', 'Estructura', 'Conexiones', 'Instrumentos', 'Fallas', 'Actividad', 'Consola'];

/** Se ejecuta en la página: devuelve la lista de problemas del DOM actual. */
const audit = () => {
  const problems = [];
  const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const text = el => (el.textContent || '').replace(/\s+/g, ' ').trim();
  const labelledBy = el => (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map(id => document.getElementById(id)).filter(Boolean).map(text).join(' ').trim();
  const nameOf = el => {
    const aria = el.getAttribute('aria-label')?.trim(); if (aria) return aria;
    const lb = labelledBy(el); if (lb) return lb;
    if (el.labels && el.labels.length) { const t = [...el.labels].map(text).join(' '); if (t) return t; }
    const title = el.getAttribute('title')?.trim(); if (title && !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return title;
    if (el.tagName === 'IMG') return el.getAttribute('alt') || '';
    if (/^(BUTTON|A|SUMMARY)$/.test(el.tagName) || ['button', 'switch', 'treeitem', 'tab', 'link'].includes(el.getAttribute('role'))) return text(el) || [...el.querySelectorAll('[aria-label]')].map(x => x.getAttribute('aria-label')).join(' ');
    return '';
  };
  const where = el => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : ''} «${text(el).slice(0, 30)}»`;
  // 1) Nombre accesible de todo control
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=switch], [role=treeitem]')) {
    if (!visible(el) && !el.matches('input[type=file]')) continue;
    if (!nameOf(el)) problems.push(`sin nombre accesible: ${where(el)}`);
  }
  // 2) Escenario 3D
  for (const c of document.querySelectorAll('canvas')) if (visible(c) && !(c.getAttribute('aria-label') || c.closest('[aria-label]'))) problems.push('canvas sin descripción');
  // 3) ids únicos
  const seen = new Map(); for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) || 0) + 1);
  for (const [id, n] of seen) if (n > 1) problems.push(`id repetido: ${id} (${n})`);
  // 4) aria-labelledby/for apuntan a algo que existe
  for (const el of document.querySelectorAll('[aria-labelledby]')) for (const id of el.getAttribute('aria-labelledby').split(/\s+/)) if (id && !document.getElementById(id)) problems.push(`aria-labelledby roto: ${id}`);
  // 5) Contraste del texto visible (4,5:1; 3:1 para texto grande)
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const bgOf = el => { let layers = []; for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } } let base = [255, 255, 255]; for (const c of layers.reverse()) base = base.map((v, i) => c[i] * c[3] + v * (1 - c[3])); return base; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const checked = new Set(); let tooLow = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement; if (!el || checked.has(el) || !n.nodeValue.trim() || !visible(el) || el.closest('svg, canvas, [aria-hidden=true], .ind-term-label')) continue;
    checked.add(el); const s = getComputedStyle(el); if (el.closest('button:disabled, input:disabled, select:disabled, [disabled]')) continue;
    const fg = parse(s.color); if (!fg) continue; const bg = bgOf(el), a = fg[3], mixed = [0, 1, 2].map(i => fg[i] * a + bg[i] * (1 - a));
    const l1 = lum(mixed), l2 = lum(bg), ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05), px = parseFloat(s.fontSize), large = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) { tooLow++; if (tooLow <= 6) problems.push(`contraste ${ratio.toFixed(2)}:1 en ${where(el)} (${s.color} sobre rgb(${bg.map(Math.round)}))`); }
  }
  return problems;
};

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(([key, library]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, library); localStorage.setItem('__seeded', '1'); } }, [LIB, lib]);
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(900);

    assert.equal(await p.evaluate(() => document.documentElement.lang), 'es'); assert.match(await p.title(), /Industria/);
    pass('El documento declara idioma español y un título propio');

    const all = [];
    const run = async label => { const found = await p.evaluate(audit); for (const f of found) all.push(`[${label}] ${f}`); };
    for (const v of VIEWS) { await p.locator('.ind-views').getByRole('button', {name: v, exact: true}).click(); await p.waitForTimeout(250); await run(`vista ${v}`); }
    await p.locator('.ind-views').getByRole('button', {name: 'Planta 3D', exact: true}).click();
    await p.getByRole('button', {name: 'Estructura', exact: true}).click(); await p.getByRole('treeitem', {name: /KM1/}).dispatchEvent('click');
    for (const label of PANELS) {
      const btn = p.locator('nav.rb-dock').getByRole('button', {name: label, exact: true});
      if ((await btn.getAttribute('aria-pressed')) !== 'true') await btn.click(); await p.waitForTimeout(250); await run(`panel ${label}`);
    }
    fs.writeFileSync(out + '/a11y-report.json', JSON.stringify({violations: all, errors: report.errors}, null, 2));
    assert.deepEqual(all, [], 'problemas de accesibilidad:\n' + all.join('\n'));
    pass('Todas las vistas y paneles: todo control tiene nombre accesible, ids únicos, referencias ARIA válidas y contraste AA en el texto');

    // Recorrido con teclado: Tab llega a los controles principales con foco visible
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(900); // el recorrido con Tab empieza desde el principio de la página
    const stops = new Set(); let withoutFocusRing = 0;
    for (let i = 0; i < 140; i++) {
      await p.keyboard.press('Tab');
      const info = await p.evaluate(() => { const el = document.activeElement; if (!el || el === document.body) return null; const s = getComputedStyle(el), r = el.getBoundingClientRect(); return {name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30), ring: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none', visible: r.width > 0 && r.height > 0}; });
      if (info) { stops.add(info.name); if (!info.ring) withoutFocusRing++; }
    }
    assert.ok(stops.size >= 15, `Tab llegó a pocos controles (${stops.size})`);
    for (const must of ['Inicio', 'Ejecutar', 'Construir', 'Cablear', 'Instrumentos']) assert.ok([...stops].some(s => s.includes(must)), `Tab no llega a «${must}»`);
    assert.ok(withoutFocusRing <= Math.ceil(stops.size * 0.1), `${withoutFocusRing} de ${stops.size} controles enfocados sin indicador de foco`);
    pass(`Con Tab se recorren ${stops.size} controles (inicio, ejecutar, modos, dock…) y ${stops.size - withoutFocusRing} muestran indicador de foco`);

    assert.deepEqual(report.errors, [], 'errores de consola o de página');
    pass('Cero errores de consola y de JavaScript');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/a11y-checks.json', JSON.stringify(report.checks, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
