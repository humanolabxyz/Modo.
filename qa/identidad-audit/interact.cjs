// Auditor: color (estilos por defecto / paleta vieja), hover, foco, cursor y toque
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.B || 'http://127.0.0.1:4460';
const ONLY = process.env.ONLY;
const collect = () => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width >= 6 && r.height >= 6 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && !e.closest('[hidden],[aria-hidden=true]'); };
  const lab = e => ((e.getAttribute('aria-label') || e.textContent || e.value || e.placeholder || e.title || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 28));
  const out = [];
  const old = /(62, 128, 107|35, 119, 104|36, 94, 121|31, 143, 196|32, 78, 97|27, 71, 92|36, 119, 104)/;
  for (const e of document.querySelectorAll('button,a[href],summary,select,input:not([type=hidden]),textarea,[role=button],[role=tab],[role=switch]')) {
    if (e.closest('svg') || !vis(e)) continue;
    const cs = getComputedStyle(e), r = e.getBoundingClientRect(), tag = e.tagName.toLowerCase();
    const o = { tag, lab: lab(e), cls: String(e.className || '').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), flags: [], id: out.length, disabled: !!e.disabled };
    if (tag === 'button' && cs.backgroundColor === 'rgb(239, 239, 239)' && cs.borderTopStyle !== 'none') o.flags.push('boton-por-defecto');
    if (tag === 'a' && cs.color === 'rgb(0, 0, 238)') o.flags.push('enlace-azul-por-defecto');
    if ((tag === 'select' || tag === 'input' || tag === 'textarea') && !['checkbox', 'radio', 'range', 'color', 'file'].includes(e.type) && cs.borderTopStyle === 'inset') o.flags.push('campo-por-defecto');
    if (/Times/.test(cs.fontFamily)) o.flags.push('fuente-serif');
    for (const k of ['color', 'backgroundColor', 'borderTopColor']) if (old.test(cs[k])) o.flags.push('paleta-vieja:' + k + '=' + cs[k]);
    if (!e.disabled && ['button', 'a', 'summary'].includes(tag) && !['pointer', 'grab', 'move'].includes(cs.cursor)) o.flags.push('cursor:' + cs.cursor);
    if (innerWidth < 800 && (r.width < 32 || r.height < 32) && !e.disabled) o.flags.push('toque-pequeno:' + o.w + 'x' + o.h);
    e.setAttribute('data-aud', String(out.length)); e.setAttribute('data-sh', cs.boxShadow);
    out.push(o);
  }
  return out;
};
const sig = e => { const cs = getComputedStyle(e); return [cs.backgroundColor, cs.color, cs.borderTopColor, cs.boxShadow, cs.transform, cs.opacity, cs.backgroundImage.slice(0, 40), cs.filter, cs.textDecorationLine].join('|'); };
(async () => {
  const b = await chromium.launch(); const summary = {};
  const pages = [['home', '/', null], ['comunidad', '/comunidad/', null], ['legal', '/legal/', null], ['versiones', '/versiones/', null], ['estudio', '/estudio/', null], ['estudio-ramo', '/estudio/', 'ramo'], ['lab-esquemas', '/laboratorio/', null], ['lab-plc', '/laboratorio/', 'PLC'], ['lab-hmi', '/laboratorio/', 'HMI'], ['lab-procesos', '/laboratorio/', 'Procesos'], ['lab-protoboard', '/laboratorio/', 'Protoboard'], ['lab-soldadura', '/laboratorio/', 'Soldadura'], ['lab-temperatura', '/laboratorio/', 'Temperatura'], ['lab-detectores', '/laboratorio/', 'Detectores'], ['lab-geogebra', '/laboratorio/', 'GeoGebra'], ['panel-banco', '/', 'panel'], ['panel-diagrama', '/', 'diagrama'], ['panel-opciones', '/', 'opciones']];
  for (const [name, w, h] of [['d', 1440, 900], ['m', 390, 844]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', hasTouch: w < 800 });
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|geogebra/i.test(m.text())) errs.push(m.text().slice(0, 120)); });
    for (const [pn, path, action] of pages) {
      if (ONLY && !pn.startsWith(ONLY)) continue;
      if (name === 'm' && pn.startsWith('lab-') && pn !== 'lab-esquemas') continue;
      errs.length = 0;
      await p.goto(base + path, { waitUntil: 'load' }); await p.waitForTimeout(path === '/' ? 6000 : 3500);
      if (action === 'ramo') await p.locator('.campus-course').first().click().catch(() => {});
      else if (action && pn.startsWith('lab-')) await p.getByRole('button', { name: new RegExp('^' + action) }).first().click().catch(() => {});
      else if (['panel', 'diagrama', 'opciones'].includes(action)) {
        const card = p.locator('.home-module').first(); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(600); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(3000);
        if (action !== 'panel') { await p.getByRole('button', { name: /Diagrama|Abrir diagrama/ }).first().click().catch(() => {}); await p.waitForTimeout(1500); }
        if (action === 'opciones') { await p.getByText(/Opciones de práctica/).first().click().catch(() => {}); await p.waitForTimeout(800); }
      }
      await p.waitForTimeout(1500);
      const list = await p.evaluate(collect);
      const hoverBad = [], focusBad = [];
      for (const o of list.slice(0, 70)) {
        if (o.disabled) continue;
        const loc = p.locator('[data-aud="' + o.id + '"]');
        if (name === 'd') {
          const before = await loc.evaluate(sig).catch(() => null);
          await loc.hover({ timeout: 800, force: true }).catch(() => {}); await p.waitForTimeout(450);
          const after = await loc.evaluate(sig).catch(() => null);
          if (before && after && before === after && !['input', 'select', 'textarea'].includes(o.tag)) hoverBad.push(o.lab || o.cls);
        }
      }
      // Foco con teclado real: Tab
      await p.mouse.move(1, 1); await p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.scrollTo(0, 0); });
      for (let i = 0; i < 45; i++) {
        await p.keyboard.press('Tab');
        const f = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (r.width < 6 || r.height < 6) return null; return { lab: ((e.getAttribute('aria-label') || e.textContent || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 28)), out: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, shChanged: cs.boxShadow !== (e.getAttribute('data-sh') || 'none') , tag: e.tagName }; }).catch(() => null);
        if (f && !f.out && !f.shChanged) focusBad.push(f.lab);
      }
      const flagged = list.filter(o => o.flags.length);
      summary[pn + '-' + name] = { total: list.length, hoverSin: [...new Set(hoverBad)].slice(0, 14), focoSin: [...new Set(focusBad)].slice(0, 14), flags: flagged.slice(0, 14).map(o => o.tag + '[' + o.lab + '] ' + o.flags.join(',')), errs: [...errs] };
    }
    await c.close();
  }
  await b.close();
  for (const k in summary) {
    const s = summary[k]; console.log('\n## ' + k + ' · ' + s.total + ' controles');
    if (s.flags.length) console.log(' FLAGS:\n   ' + s.flags.join('\n   '));
    if (s.hoverSin.length) console.log(' sin hover:', s.hoverSin.join(' | '));
    if (s.focoSin.length) console.log(' sin foco visible:', s.focoSin.join(' | '));
    if (s.errs.length) console.log(' ERRORES JS:', s.errs.join(' / '));
  }
})();
