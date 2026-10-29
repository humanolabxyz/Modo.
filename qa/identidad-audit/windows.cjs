// Prueba de ventanas: abrir, mover, ajustar por bordes, maximizar, recordar tamaño y contenido que se adapta
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.B || 'http://127.0.0.1:4460';
const info = p => p.evaluate(() => {
  const ws = [...document.querySelectorAll('.mobile-floating-window:not(.floating-window-hidden)')];
  const e = ws[ws.length - 1]; if (!e) return null;
  const r = e.getBoundingClientRect(), c = e.querySelector('.floating-window-content'), b = e.querySelector('.floating-window-body');
  return { title: e.querySelector('h3')?.textContent, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), max: e.dataset.maximized, edges: e.querySelectorAll('.fw-edge').length, overflowX: c ? c.scrollWidth - b.clientWidth : null, viewport: [innerWidth, innerHeight] };
});
const drag = async (p, from, to) => { await p.mouse.move(from[0], from[1]); await p.mouse.down(); await p.mouse.move(to[0], to[1], { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(250); };
const edgeBox = (p, dir) => p.locator('.mobile-floating-window:not(.floating-window-hidden) .fw-edge-' + dir).last().boundingBox();
const center = b => [b.x + b.width / 2, b.y + b.height / 2];
(async () => {
  const b = await chromium.launch();
  const fails = [];
  const ok = (cond, msg) => { console.log((cond ? 'OK   ' : 'FALLA') + ' ' + msg); if (!cond) fails.push(msg); };
  for (const [name, w, h] of [['PC', 1440, 900], ['móvil', 390, 844]]) {
    console.log('\n===== ' + name + ' =====');
    const c = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block', hasTouch: w < 800 });
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 140)));
    // ---- Panel: Opciones de práctica
    await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(5500);
    const card = p.locator('.home-module').first(); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(600); await card.click({ force: true }).catch(() => {}); await p.waitForTimeout(3000);
    await p.getByText(/Opciones de práctica/).first().click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(900);
    let i0 = await info(p);
    ok(!!i0, 'Panel · "Opciones de práctica" se abre como ventana'); if (!i0) { await c.close(); continue; }
    ok(i0.edges === 8, 'tiene 8 bordes/esquinas para ajustar (' + i0.edges + ')');
    ok(i0.x >= 0 && i0.y >= 0 && i0.x + i0.w <= w + 1 && i0.y + i0.h <= h + 1, 'cabe dentro de la pantalla ' + JSON.stringify([i0.x, i0.y, i0.w, i0.h]));
    ok(i0.overflowX <= 2, 'el contenido no desborda horizontalmente (' + i0.overflowX + ')');
    // mover
    const hd = await p.locator('.mobile-floating-window:not(.floating-window-hidden) .floating-window-header').last().boundingBox();
    await drag(p, [hd.x + 40, hd.y + hd.height / 2], [hd.x + 40 + (w > 800 ? 160 : 10), hd.y + hd.height / 2 + 50]);
    let i1 = await info(p); ok(i1.x !== i0.x || i1.y !== i0.y, 'se mueve por la cabecera ' + JSON.stringify([i0.x, i0.y]) + '→' + JSON.stringify([i1.x, i1.y]));
    // ajustar por borde derecho, inferior y esquina noroeste
    let eE = await edgeBox(p, 'e'); await drag(p, center(eE), [center(eE)[0] + (w > 800 ? 160 : -40), center(eE)[1]]);
    let i2 = await info(p); ok(i2.w !== i1.w, 'ajusta el ANCHO por el borde derecho ' + i1.w + '→' + i2.w);
    let eS = await edgeBox(p, 's'); await drag(p, center(eS), [center(eS)[0], center(eS)[1] + 80]);
    let i3 = await info(p); ok(i3.h !== i2.h, 'ajusta el ALTO por el borde inferior ' + i2.h + '→' + i3.h);
    let eNW = await edgeBox(p, 'nw'); await drag(p, center(eNW), [center(eNW)[0] + 30, center(eNW)[1] + 30]);
    let i4 = await info(p); ok(i4.w !== i3.w || i4.h !== i3.h, 'ajusta desde la esquina superior izquierda ' + i3.w + '×' + i3.h + '→' + i4.w + '×' + i4.h);
    // contenido se adapta: estrecha y ancha
    for (const target of [280, 700]) {
      const cur = await info(p); const e2 = await edgeBox(p, 'e'); const room = Math.max(0, w - 16 - cur.x - cur.w);
      const dx = target - cur.w; await drag(p, center(e2), [center(e2)[0] + Math.max(-cur.w + 260, Math.min(dx, room)), center(e2)[1]]);
      const ii = await info(p); ok(ii.overflowX <= 2, 'ancho ' + ii.w + 'px: el contenido se reacomoda sin desbordar (' + ii.overflowX + ')');
      await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-' + target + '.png' });
    }
    // maximizar y restaurar
    const before = await info(p);
    if (w > 520) {
      await p.locator('.mobile-floating-window:not(.floating-window-hidden) .floating-window-max').last().click(); await p.waitForTimeout(300);
      const m = await info(p); ok(m.max === 'true' && m.w > before.w - 1 && m.w >= w - 40, 'maximiza ' + m.w + '×' + m.h);
      await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-max.png' });
      await p.locator('.mobile-floating-window:not(.floating-window-hidden) .floating-window-max').last().click(); await p.waitForTimeout(300);
      const r = await info(p); ok(r.max === 'false' && Math.abs(r.w - before.w) < 3, 'restaura al tamaño anterior ' + r.w + '×' + r.h);
    }
    // recordar: cerrar, abrir de nuevo
    const saved = await info(p);
    await p.locator('.mobile-floating-window:not(.floating-window-hidden) button[aria-label^="Cerrar"]').last().click(); await p.waitForTimeout(400);
    ok((await info(p)) === null, 'se cierra');
    await p.getByText(/Opciones de práctica/).first().click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(900);
    const again = await info(p);
    if (w >= 700) ok(again && Math.abs(again.w - saved.w) < 3 && Math.abs(again.x - saved.x) < 3, 'recuerda posición y tamaño al reabrir ' + JSON.stringify([saved.x, saved.y, saved.w, saved.h]) + '→' + JSON.stringify(again && [again.x, again.y, again.w, again.h]));
    // restablecer
    await p.locator('.mobile-floating-window:not(.floating-window-hidden) button[aria-label^="Restablecer"]').last().click(); await p.waitForTimeout(400);
    const rs = await info(p); ok(rs && rs.max === 'false', 'restablecer vuelve al tamaño inicial ' + (rs && rs.w + '×' + rs.h));
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);

    // ---- Panel: otros menús que ya eran ventana
    for (const [label, sel] of [['Simulación', '.simulation-menu>summary'], ['Añadir módulo', '.add-panel-toggle'], ['Procedimientos', '.procedure-trigger']]) {
      await p.locator(sel).first().click({ timeout: 2500, force: true }).catch(() => {}); await p.waitForTimeout(700);
      const ii = await info(p); ok(!!ii && ii.edges === 8, 'Panel · ' + label + ' → ventana con 8 bordes' + (ii ? ' (' + ii.w + '×' + ii.h + ', desborde ' + ii.overflowX + ')' : ''));
      await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    }

    // ---- Laboratorio: Proyecto (antes un desplegable) y componentes
    await p.goto(base + '/laboratorio/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
    if (w > 800) {
      await p.locator('.lab-project-menu>summary').first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700);
      const lp = await info(p); ok(!!lp && lp.title === 'Proyecto' && lp.edges === 8, 'Laboratorio · "Proyecto" ahora es ventana ' + (lp ? lp.w + '×' + lp.h : ''));
      await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-proyecto.png' });
      await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await p.getByRole('button', { name: /^Componentes/ }).first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700);
      const cp = await info(p); ok(!!cp && cp.edges === 8, 'Laboratorio · selector de componentes → ventana ' + (cp ? cp.title + ' ' + cp.w + '×' + cp.h : ''));
      await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-componentes.png' });
      // elegir un componente: se cierra y se agrega
      await p.locator('.lab-dock-menu [role=menuitem]:not(:disabled)').nth(1).click({ timeout: 2500 }).catch(() => {}); await p.waitForTimeout(500);
      ok((await info(p)) === null, 'al elegir un componente la ventana se cierra');
      // editor de valores como ventana: seleccionar el componente recién puesto en el lienzo no es trivial → protoboard
      await p.getByRole('button', { name: /^Protoboard/ }).first().click().catch(() => {}); await p.waitForTimeout(1800);
      await p.getByRole('button', { name: /^Detectores/ }).first().click().catch(() => {}); await p.waitForTimeout(1800);
      const comp = p.locator('[aria-label*="Editar"], [aria-label*="editar"], g[role=button][aria-label*="uente"], g[role=button][aria-label*="detector"]').first();
      if (await comp.count()) { await comp.click({ force: true, timeout: 2000 }).catch(() => {}); await p.waitForTimeout(700); const ed = await info(p); console.log('     editor:', ed ? ed.title + ' ' + ed.w + '×' + ed.h + ' bordes ' + ed.edges : 'no se abrió (selector)'); await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-editor.png' }); await p.keyboard.press('Escape'); }
    }
    // ---- Estudio: ventana de tutoriales
    await p.goto(base + '/estudio/', { waitUntil: 'load' }); await p.waitForTimeout(3500);
    await p.locator('.tutorial-trigger').first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(900);
    const tw = await info(p); ok(!!tw && tw.edges === 8, 'Estudio · videos tutoriales ahora es ventana ' + (tw ? tw.w + '×' + tw.h + ' desborde ' + tw.overflowX : ''));
    await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-tutoriales.png' });
    if (w > 800 && tw) { const e3 = await edgeBox(p, 'e'); await drag(p, center(e3), [center(e3)[0] - 350, center(e3)[1]]); const t2 = await info(p); ok(t2.overflowX <= 2, 'tutoriales estrecha ' + t2.w + 'px sin desbordar'); await p.screenshot({ path: 'qa/identidad-audit/win-' + name + '-tutoriales-estrecha.png' }); }
    console.log('Errores JS:', errs.length ? errs.join(' / ') : 'ninguno');
    await c.close();
  }
  await b.close();
  console.log('\nRESUMEN: ' + (fails.length ? fails.length + ' falla(s): ' + fails.join(' | ') : 'todo correcto'));
})();
