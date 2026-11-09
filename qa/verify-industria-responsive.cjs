// Industria, fase 10: diseño adaptable. En teléfono, tablet y escritorio (emulación): sin desborde horizontal, vistas y paneles dentro de la pantalla,
// dock completo y accesible, y ventanas que no tapan el dock. No sustituye una prueba en dispositivos reales.
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: [], notes: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const lib = execFileSync(process.execPath, ['qa/industria-example-fixture.mjs'], {encoding: 'utf8'});
const SIZES = [[390, 844, 'telefono'], [768, 1024, 'tablet'], [1024, 768, 'tablet-horizontal'], [1440, 900, 'escritorio']];
const VIEWS = ['Planta 3D', 'Tablero', 'Diagramas', 'PLC', 'HMI', 'Documentación'];
const PANELS = ['Piezas', 'Propiedades', 'Escenario', 'Estructura', 'Conexiones', 'Instrumentos', 'Fallas', 'Actividad', 'Consola'];

(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, h, name] of SIZES) {
      const touch = w < 1100;
      const c = await b.newContext({viewport: {width: w, height: h}, serviceWorkers: 'block', hasTouch: touch, isMobile: w < 600});
      await c.addInitScript(([key, library]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, library); localStorage.setItem('__seeded', '1'); } }, [LIB, lib]);
      const p = await c.newPage();
      p.on('pageerror', e => report.errors.push(`${name}: pageerror ${e.message}`));
      p.on('console', m => { if (m.type() === 'error') report.errors.push(`${name}: console ${m.text()}`); });
      await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(900);
      const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const inside = async (sel, label) => { const r = await p.locator(sel).first().boundingBox(); if (!r) return; assert.ok(r.x >= -1 && r.y >= -1 && r.x + r.width <= w + 1 && r.y + r.height <= h + 1, `${name}: ${label} fuera de la pantalla (${JSON.stringify(r)})`); };

      const topbar = await p.locator('.ind-topbar').boundingBox();
      for (const control of await p.locator('.ind-topbar button, .ind-topbar a').all()) {
        const rect = await control.boundingBox();
        assert.ok(rect.x >= -1 && rect.y >= topbar.y - 1 && rect.x + rect.width <= w + 1 && rect.y + rect.height <= topbar.y + topbar.height + 1,
          name + ': control fuera de la barra superior ' + JSON.stringify(rect));
      }
      const viewTabs = await p.locator('.ind-views').boundingBox();
      assert.ok(viewTabs.y >= topbar.y + topbar.height, name + ': las vistas se solapan con la barra superior');

      // Dock: completo, dentro de la pantalla y con todos los botones alcanzables (visibles o con desplazamiento propio)
      const dock = await p.locator('nav.rb-dock').boundingBox();
      assert.ok(dock.x >= -1 && dock.x + dock.width <= w + 1, `${name}: el dock se sale (${Math.round(dock.x)}–${Math.round(dock.x + dock.width)} de ${w})`);
      for (const label of ['Orbitar', 'Desplazar', 'Mover pieza', 'Cablear', 'Encuadrar', ...PANELS]) { const btn = p.locator('nav.rb-dock').getByRole('button', {name: label, exact: true}); assert.equal(await btn.count(), 1, `${name}: falta el botón ${label}`); }
      assert.ok((await overflow()) <= 1, `${name}: desborde horizontal en la planta`);

      // Vistas
      for (const v of VIEWS) {
        await p.locator('.ind-views').getByRole('button', {name: v, exact: true}).click(); await p.waitForTimeout(250);
        assert.ok((await overflow()) <= 1, `${name}: desborde horizontal en ${v}`);
        if (v !== 'Planta 3D') await inside('.rb-canvas-overlay.ind-diagram, .ind-plc, .ind-hmi, .ind-board, .ind-docs', `la vista ${v}`);
      }
      await p.locator('.ind-views').getByRole('button', {name: 'Planta 3D', exact: true}).click();
      await p.screenshot({path: `${out}/responsive-${name}.png`});

      // Paneles, uno a uno: dentro de la pantalla, sin cubrir el dock
      for (const label of PANELS) {
        const btn = p.locator('nav.rb-dock').getByRole('button', {name: label, exact: true});
        const open = (await btn.getAttribute('aria-pressed')) === 'true'; if (!open) await btn.click();
        await p.waitForTimeout(250);
        const win = p.locator('.ind-window').first(); const wb = await win.boundingBox();
        if (wb) {
          const dk = await p.locator('nav.rb-dock').boundingBox();
          assert.ok(wb.x >= -2 && wb.x + wb.width <= w + 2, `${name}: panel ${label} se sale a los lados (${Math.round(wb.x)}–${Math.round(wb.x + wb.width)})`);
          assert.ok(wb.y + wb.height <= h + 2, `${name}: panel ${label} se sale por abajo`);
          if (w >= 600) assert.ok(wb.y + wb.height <= dk.y + 2, `${name}: panel ${label} tapa el dock (fondo ${Math.round(wb.y + wb.height)} > dock ${Math.round(dk.y)})`);
        }
        assert.ok((await overflow()) <= 1, `${name}: desborde horizontal con el panel ${label}`);
        // En teléfono la ventana es una hoja a pantalla completa que cubre el dock: se cierra con su propio botón (siempre visible)
        const close = p.locator('.ind-window').first().getByRole('button', {name: /^Cerrar /}); assert.ok(await close.isVisible(), `${name}: el panel ${label} no tiene botón Cerrar visible`); await close.click(); await p.waitForTimeout(100);
      }
      pass(`${name} (${w}×${h}): sin desborde en las 6 vistas y los 9 paneles, dock completo y paneles dentro de la pantalla`);
      await c.close();
    }
    assert.deepEqual(report.errors, [], 'errores de consola o de página');
    pass('Cero errores de consola y de JavaScript en los cuatro tamaños');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/responsive-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
