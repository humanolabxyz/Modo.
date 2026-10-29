// Robótica · interfaz: tarjeta de entrada, ventanas (FloatingWindow existente), pizarra 3D, proyecto y responsive.
// Uso: PANELLAB_URL=http://127.0.0.1:4325 node qa/verify-robotics-ui.cjs  (dev o build + preview)
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4325').replace(/\/$/, ''), out = 'qa/robotics';
fs.mkdirSync(out, {recursive: true});
const report = {url: base, checks: [], errors: [], viewports: {}};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const VIEWPORTS = [['escritorio', 1440, 900, false], ['tablet', 1024, 768, true], ['telefono', 390, 844, true]];
const WINDOWS = [['parts', 'Piezas'], ['structure', 'Estructura'], ['properties', 'Propiedades'], ['scene', 'Escenario'], ['code', 'Programación'], ['console', 'Consola']];

async function open(browser, name, w, h, touch, url) {
  const c = await browser.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: w < 600, serviceWorkers: 'block', reducedMotion: 'reduce'});
  await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await c.newPage();
  p.on('pageerror', e => report.errors.push(`[${name}] ${e.message}`));
  p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(`[${name}] ${m.text()}`); });
  await p.goto(url); return {c, p};
}
const ready = async p => { await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.camera, null, {timeout: 20000}).catch(() => {}); };
const cam = p => p.evaluate(() => window.__modoRobotics.camera());
const screenOf = (p, id) => p.evaluate(i => window.__modoRobotics.screenOf(i), id);
const settle = p => p.waitForTimeout(450);
const rectOf = (p, sel) => p.locator(sel).first().boundingBox();
const winSel = id => `.rb-window-${id}`;
async function openWindow(p, label) { await p.locator(`.rb-dock button[aria-label="${label}"]`).click(); }
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);

(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    for (const [name, w, h, touch] of VIEWPORTS) {
      const phone = w < 600, log = report.viewports[name] = [];
      const step = s => { log.push(s); pass(`[${name}] ${s}`); };

      // 1) Entrar desde la quinta tarjeta del inicio
      {
        const {c, p} = await open(browser, name, w, h, touch, base + '/');
        await p.locator('[data-module=panel]:not(:disabled)').waitFor();
        assert.equal(await p.locator('.home-module').count(), 5, 'el inicio tiene 5 tarjetas');
        const card = p.locator('[data-module=robotics]');
        assert.equal(await card.getAttribute('aria-label'), 'Abrir Robótica · Beta');
        assert.equal(await card.locator('img').count(), 0, 'sin ilustración (D-09 pendiente)');
        assert.equal((await card.locator('.home-module-badge').textContent()).trim(), 'Beta');
        // En pantallas angostas la tarjeta queda fuera de vista hasta que se desliza o se elige el punto del carrusel.
        if (w <= 1100) { await p.locator('.home-carousel-dots button[aria-label="Mostrar Robótica"]').click(); assert.ok(!p.url().includes('/robotica')); assert.equal(await p.locator('.home-module.is-selected').getAttribute('data-module'), 'robotics'); await p.waitForTimeout(800); }
        await Promise.all([p.waitForURL('**/robotica/'), card.click()]);
        await ready(p); step('entra a /robotica/ desde la quinta tarjeta');
        await p.screenshot({path: `${out}/${name}-vacio.png`});
        await c.close();
      }

      const {c, p} = await open(browser, name, w, h, touch, base + '/robotica/?debug=1');
      await ready(p);
      assert.equal(await p.locator('.floating-window-header').count(), 0, 'todas las ventanas empiezan cerradas');
      assert.ok(await p.locator('.rb-context-toolbar').count() === 0);
      step('ventanas cerradas al empezar; WebGL activo');
      // Tres piezas reales del catálogo (etapa 2) sirven de objetos para probar selección, menús y zoom.
      await openWindow(p, 'Piezas'); for (const n of ['Arduino UNO R3', 'Driver L298N', 'Portapilas 4×AA']) await p.locator(`button[aria-label="Agregar ${n}"]`).click();
      await p.locator('button[aria-label="Cerrar Piezas"]').click(); await p.keyboard.press('Escape'); await p.locator('.rb-dock button[aria-label="Encuadrar"]').click(); await p.waitForTimeout(900);
      const ids = await p.evaluate(() => window.__modoRobotics.partIds()); assert.equal(ids.length, 3); const [PA, PB, PC] = ids;
      report.viewports[name + '-renderer'] = await p.evaluate(() => window.__modoRobotics.renderer());

      // 2) Cada ventana: abrir, minimizar, restaurar, Esc no la cierra, cerrar
      for (const [id, label] of WINDOWS) {
        await openWindow(p, label);
        const win = p.locator(winSel(id)); await win.waitFor();
        assert.ok(await win.isVisible());
        await p.keyboard.press('Escape'); assert.ok(await win.isVisible(), `Esc no cierra «${label}»`);
        await win.locator(`button[aria-label="Minimizar: ${label}"]`).click();
        assert.ok(!(await win.isVisible()), `«${label}» minimizada`);
        const chip = p.locator(`.rb-chip[aria-label="Restaurar ${label}"]`); assert.equal(await chip.count(), 1);
        await chip.click(); assert.ok(await win.isVisible(), `«${label}» restaurada desde el chip`);
        await win.locator(`button[aria-label="Cerrar ${label}"]`).click(); assert.equal(await p.locator(winSel(id)).count(), 0);
      }
      step('las 6 ventanas: abrir, minimizar con chip, restaurar, Esc no cierra, cerrar');

      // 3) Mover y redimensionar (solo escritorio y tablet) sin mover la cámara
      if (!phone) {
        await openWindow(p, 'Propiedades');
        const win = p.locator(winSel('properties')), before = await win.boundingBox(), camBefore = await cam(p);
        const head = await win.locator('.floating-window-title').boundingBox();
        await p.mouse.move(head.x + 40, head.y + 12); await p.mouse.down(); await p.mouse.move(head.x - 120, head.y + 90, {steps: 6}); await p.mouse.up();
        const moved = await win.boundingBox();
        assert.ok(Math.abs(moved.x - before.x) > 60 || Math.abs(moved.y - before.y) > 40, 'la ventana se movió');
        await settle(p); assert.deepEqual((await cam(p)).position.map(v => +v.toFixed(3)), camBefore.position.map(v => +v.toFixed(3)), 'arrastrar la ventana no mueve la cámara');
        const grip = await win.locator('.floating-window-resize').boundingBox();
        await p.mouse.move(grip.x + 8, grip.y + 8); await p.mouse.down(); await p.mouse.move(grip.x + 90, grip.y + 80, {steps: 5}); await p.mouse.up();
        const resized = await win.boundingBox(); assert.ok(resized.width > moved.width + 40 || resized.height > moved.height + 40, 'la ventana cambió de tamaño');
        assert.equal(await win.evaluate(() => localStorage.getItem('panellab-win-v1:robotica:properties') !== null), true, 'la disposición se guarda con storageId robotica:properties');
        assert.equal(await win.evaluate(() => localStorage.getItem('panellab-win-v1:Propiedades')), null, 'no usa la clave del título');
        step('arrastrar y redimensionar una ventana; la cámara no se mueve; clave robotica:properties');
        // Restablecer disposición
        await p.locator('button[aria-label="Opciones del proyecto"]').click();
        await p.locator('button[aria-label="Restablecer disposición de ventanas"]').click();
        assert.equal(await p.locator('.floating-window-header').count(), 0, 'restablecer cierra las ventanas');
        assert.equal(await p.evaluate(() => localStorage.getItem('panellab-win-v1:robotica:properties')), null, 'restablecer olvida la posición');
        await openWindow(p, 'Propiedades'); const back = await p.locator(winSel('properties')).boundingBox();
        near(back.x, before.x, 30, 'vuelve a su lugar inicial'); near(back.y, before.y, 30, 'vuelve a su lugar inicial');
        await p.locator('button[aria-label="Cerrar Propiedades"]').click();
        step('restablecer disposición devuelve las ventanas a su lugar');
      } else {
        await openWindow(p, 'Piezas'); const b = await rectOf(p, winSel('parts'));
        assert.ok(b.x >= 0 && b.x + b.width <= w + 1, 'en teléfono la ventana ocupa el ancho como lámina'); assert.ok(b.width >= w - 24);
        await p.locator('button[aria-label="Cerrar Piezas"]').click(); step('en teléfono las ventanas se muestran como lámina');
      }

      // 4) Pizarra: zoom hacia el cursor
      await p.keyboard.press('Escape'); // sin selección: la barra contextual no tapa el punto del zoom
      await p.mouse.move(w / 2, h / 2); await settle(p);
      const a0 = await screenOf(p, PB), d0 = (await cam(p)).distance;
      await p.mouse.move(a0.x, a0.y); await p.mouse.wheel(0, -500); await p.waitForTimeout(900);
      const a1 = await screenOf(p, PB), d1 = (await cam(p)).distance;
      assert.ok(d1 < d0 - 0.05, `el zoom acerca la cámara (${d0.toFixed(2)} → ${d1.toFixed(2)})`);
      near(a1.x, a0.x, 40, 'el objeto bajo el cursor se mantiene (x)'); near(a1.y, a0.y, 40, 'el objeto bajo el cursor se mantiene (y)');
      step(`zoom hacia el cursor (distancia ${d0.toFixed(2)}→${d1.toFixed(2)} m, el objeto bajo el cursor se desvía ${Math.hypot(a1.x - a0.x, a1.y - a0.y).toFixed(1)} px)`);
      await p.keyboard.press('Shift+Digit1'); await p.waitForTimeout(500);

      // 5) Selección, barra contextual, múltiple, rectángulo, menú contextual, Esc
      const A = await screenOf(p, PA), B = await screenOf(p, PB), C = await screenOf(p, PC);
      await p.mouse.click(A.x, A.y);
      await p.locator('.rb-context-toolbar').waitFor();
      assert.equal(await p.locator('.rb-context-toolbar').getAttribute('aria-label'), 'Acciones del objeto');
      const tb = await rectOf(p, '.rb-context-toolbar'); assert.ok(tb.y >= 0 && tb.x >= 0 && tb.x + tb.width <= w + 1, 'la barra contextual está dentro de la pantalla');
      step('clic en un objeto: se selecciona y aparece la barra contextual');
      await p.keyboard.down('Shift'); await p.mouse.click(B.x, B.y); await p.keyboard.up('Shift');
      await p.waitForFunction(() => document.querySelector('.rb-context-toolbar')?.getAttribute('aria-label') === 'Acciones para 2 objetos');
      step('Shift + clic: selección múltiple');
      await p.mouse.click(w * .08, h * .75); await p.waitForTimeout(150);
      assert.equal(await p.locator('.rb-context-toolbar').count(), 0, 'clic en vacío deselecciona');
      step('clic en el vacío deselecciona');
      await p.mouse.move(w * .02, 68); await p.mouse.down(); await p.mouse.move(w * .97, h * .8, {steps: 5});
      assert.equal(await p.locator('.rb-canvas').getAttribute('data-gesture-state'), 'marquee'); assert.equal(await p.locator('.rb-marquee').count(), 1);
      await p.mouse.up(); await p.waitForTimeout(200);
      assert.equal(await p.locator('.rb-context-toolbar').getAttribute('aria-label'), 'Acciones para 3 objetos', 'el rectángulo selecciona los 3 objetos');
      await p.mouse.move(w * .02, h * .7); await p.mouse.down(); await p.mouse.move(w * .1, h * .78, {steps: 3}); await p.mouse.up(); await p.waitForTimeout(150);
      assert.equal(await p.locator('.rb-context-toolbar').count(), 0, 'un rectángulo vacío deselecciona');
      step('arrastre en vacío: rectángulo de selección (3 objetos dentro; vacío deselecciona)');
      await p.mouse.click(w * .08, h * .75);
      await p.mouse.click(A.x, A.y, {button: 'right'});
      await p.locator('.rb-context-menu').waitFor(); assert.ok((await p.locator('.rb-context-menu button').allTextContents()).some(t => /Duplicar/.test(t)));
      await p.locator('.rb-context-toolbar').waitFor(); await p.keyboard.press('Escape'); assert.equal(await p.locator('.rb-context-menu').count(), 0, 'Esc cierra el menú'); assert.equal(await p.locator('.rb-context-toolbar').count(), 1, 'Esc cierra solo el menú, la selección sigue');
      await p.keyboard.press('Escape'); assert.equal(await p.locator('.rb-context-toolbar').count(), 0, 'segundo Esc deselecciona');
      step('clic secundario: menú contextual del objeto; Esc cierra menú y luego selección');
      await p.mouse.click(w * .08, h * .75, {button: 'right'});
      const vistas = await p.locator('.rb-context-menu').waitFor().then(() => p.locator('.rb-context-menu button').allTextContents());
      assert.ok(vistas.some(t => /Vista frontal/.test(t)) && vistas.some(t => /Encuadrar todo/.test(t)) && vistas.some(t => /Restablecer cámara/.test(t)));
      await p.locator('.rb-context-menu button', {hasText: 'Vista superior'}).click(); await settle(p);
      const top = await cam(p); const off = top.position.map((v, i) => v - top.target[i]); assert.ok(off[1] > 0.3 && Math.abs(off[0]) < 0.01 && Math.abs(off[2]) < 0.01, `la vista superior mira desde arriba (${off})`);
      step('menú contextual del lienzo: vista superior');
      // Duplicar y borrar desde la barra
      await p.mouse.click(w * .08, h * .75); await p.keyboard.press('Shift+Digit1'); await p.waitForTimeout(600);
      const A2 = await screenOf(p, PA); await p.mouse.click(A2.x, A2.y); await p.locator('.rb-context-toolbar').waitFor();
      await p.locator('.rb-context-toolbar button[aria-label="Duplicar"]').click(); await p.waitForTimeout(200);
      assert.equal(await p.evaluate(() => window.__modoRobotics.objects()) > 0, true);
      await p.locator('.rb-context-toolbar button[aria-label="Borrar"]').click(); await p.waitForTimeout(200);
      step('barra contextual: duplicar y borrar');
      await p.keyboard.press('Escape');

      // 6) Atajos y foco
      await p.keyboard.press('h'); assert.equal(await p.locator('.rb-dock button[aria-label="Mano"]').getAttribute('aria-pressed'), 'true');
      await p.keyboard.press('v'); assert.equal(await p.locator('.rb-dock button[aria-label="Seleccionar"]').getAttribute('aria-pressed'), 'true');
      await p.keyboard.press('h'); await p.keyboard.press('Escape'); assert.equal(await p.locator('.rb-dock button[aria-label="Seleccionar"]').getAttribute('aria-pressed'), 'true', 'Esc cancela la herramienta activa');
      await openWindow(p, 'Propiedades'); await p.locator('button[aria-label="Cerrar Propiedades"]').focus(); await p.keyboard.press('h');
      assert.equal(await p.locator('.rb-dock button[aria-label="Mano"]').getAttribute('aria-pressed'), 'false', 'los atajos se ignoran con foco dentro de una ventana');
      await p.locator('button[aria-label="Cerrar Propiedades"]').click();
      await p.locator('button[aria-label="Opciones del proyecto"]').click();
      await p.locator('input[aria-label="Nombre del proyecto"]').focus(); await p.keyboard.press('h');
      assert.equal(await p.locator('.rb-dock button[aria-label="Mano"]').getAttribute('aria-pressed'), 'false', 'los atajos se ignoran con foco en un campo');
      step('atajos V/H, Esc cancela la herramienta, y se ignoran con foco en un campo');

      // 7) Proyecto: renombrar, recargar, exportar, reimportar
      const input = p.locator('input[aria-label="Nombre del proyecto"]'); await input.fill(`Robot ${name}`);
      await p.waitForFunction(() => /Guardado/.test(document.querySelector('.rb-project-window .rb-save-status')?.textContent || ''), null, {timeout: 5000});
      const [download] = await Promise.all([p.waitForEvent('download'), p.locator('button[aria-label="Exportar proyecto"]').click()]);
      const file = `${out}/${name}.modo.json`; await download.saveAs(file);
      const exported = JSON.parse(fs.readFileSync(file, 'utf8')); assert.equal(exported.format, 'modo-robotica'); assert.equal(exported.name, `Robot ${name}`);
      await p.reload(); await ready(p);
      assert.equal((await p.locator('.rb-name strong').textContent()), `Robot ${name}`, 'recargar conserva el proyecto');
      step('guardado: recargar conserva el proyecto; exportar genera .modo.json válido');
      await p.locator('button[aria-label="Opciones del proyecto"]').click();
      await p.locator('input[aria-label="Importar proyecto"]').setInputFiles(file);
      await p.waitForFunction(() => document.querySelector('.rb-name strong')?.textContent?.includes('Robot'), null, {timeout: 5000});
      await p.locator('button[aria-label="Opciones del proyecto"]').click(); await p.locator('.rb-row', {hasText: 'Mis proyectos'}).click();
      assert.equal(await p.locator('.rb-project-list li').count(), 2, 'la importación se agrega como copia'); await p.screenshot({path: `${out}/${name}-proyectos.png`});
      await p.locator('button[aria-label="Cerrar mis proyectos"]').click();
      // un archivo del Laboratorio da un error claro
      fs.writeFileSync(`${out}/lab.modo.json`, JSON.stringify({format: 'panellab-laboratory', version: 2, id: 'x', name: 'Lab'}));
      await p.locator('button[aria-label="Opciones del proyecto"]').click();
      await p.locator('input[aria-label="Importar proyecto"]').setInputFiles(`${out}/lab.modo.json`);
      await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /Laboratorio/);
      step('importar: se agrega como copia; un archivo del Laboratorio muestra un error claro');

      // 8) Modo Simular honesto
      await p.locator('button[aria-label="Cerrar opciones del proyecto"]').click();
      await p.locator('.rb-mode button[aria-pressed=false]').click();
      assert.match(await p.locator('.rb-sim-note').textContent(), /Escenario/);
      await p.locator('.rb-mode button[aria-pressed=false]').click(); await p.locator('.rb-sim-note').waitFor({state: 'detached'});
      step('Simular muestra el escenario y explica cómo ejecutar');

      // 9) Pulsación larga táctil → menú contextual
      await p.keyboard.press('Escape');
      await p.evaluate(() => { const el = document.querySelector('.rb-canvas canvas'); const r = el.getBoundingClientRect(); const opt = {bubbles: true, cancelable: true, pointerId: 77, pointerType: 'touch', isPrimary: true, clientX: r.left + 60, clientY: r.bottom - 160, button: 0, buttons: 1}; el.dispatchEvent(new PointerEvent('pointerdown', opt)); });
      await p.waitForTimeout(750); await p.locator('.rb-context-menu').waitFor(); await p.keyboard.press('Escape');
      step('pulsación larga táctil abre el menú contextual');

      // 10) Responsive: girar la pantalla no deja ventanas fuera
      await openWindow(p, 'Piezas'); if (!phone) await openWindow(p, 'Consola');
      for (const [vw, vh] of [[h, w], [w, h]]) {
        await p.setViewportSize({width: vw, height: vh}); await p.waitForTimeout(500);
        for (const sel of phone ? ['.rb-window-parts'] : ['.rb-window-parts', '.rb-window-console']) { const b = await rectOf(p, sel); assert.ok(b && b.x >= -1 && b.y >= -1 && b.x + b.width <= vw + 1 && b.y + b.height <= vh + 1, `${sel} dentro de ${vw}×${vh}: ${JSON.stringify(b)}`); }
      }
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sin scroll horizontal');
      await p.screenshot({path: `${out}/${name}-ventanas.png`});
      step('girar la pantalla: ninguna ventana queda fuera; sin scroll horizontal');

      // 11) Volver al inicio
      for (const id of ['parts', 'console']) { const close = p.locator(`${winSel(id)} .floating-window-header button[aria-label^="Cerrar"]`); if (await close.count()) await close.click(); }
      await Promise.all([p.waitForURL(u => !u.pathname.startsWith('/robotica')), p.locator('a[aria-label="Inicio"]').click()]);
      step('volver al inicio');
      await c.close();
    }
    // 12) El WebGL perdido muestra un mensaje con Reintentar
    {
      const {c, p} = await open(browser, 'webgl', 1024, 768, false, base + '/robotica/?debug=1'); await ready(p);
      await p.evaluate(() => { const gl = document.querySelector('.rb-canvas canvas').getContext('webgl2') || document.querySelector('.rb-canvas canvas').getContext('webgl'); gl.getExtension('WEBGL_lose_context').loseContext(); });
      await p.locator('.rb-gl-error').waitFor(); assert.match(await p.locator('.rb-gl-error').textContent(), /WebGL/);
      await p.locator('.rb-gl-error button', {hasText: 'Reintentar'}).click(); await p.locator('.rb-canvas canvas').waitFor();
      pass('pérdida de contexto WebGL: mensaje claro y Reintentar recupera la pizarra'); await c.close();
    }
    assert.deepEqual(report.errors, [], 'sin errores de consola ni de página');
    pass('sin errores de consola ni de página');
  } finally { await browser.close(); fs.writeFileSync(`${out}/ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
