// Industria, fase 20: las puertas abren desde Propiedades, se animan y se guardan (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const errors = [], pass = s => console.log('PASS', s);
const LIB = 'modo:industria:library:v1';
const lib = execFileSync(process.execPath, ['qa/industria-factory-fixture.mjs'], {encoding: 'utf8'});

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(([k, l]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(k, l); localStorage.setItem('__seeded', '1'); } }, [LIB, lib]);
    const p = await c.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(900);
    const stored = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    const doors = async () => JSON.parse((await p.locator('canvas').first().getAttribute('data-doors')) || '{}');
    assert.deepEqual(await doors(), {}, 'con las puertas cerradas no hay avance');
    const choose = async (name, option) => {
      await p.getByRole('button', {name: 'Estructura', exact: true}).click();
      await p.getByRole('treeitem', {name: new RegExp(name)}).dispatchEvent('click');
      await p.getByRole('button', {name: 'Cerrar Estructura', exact: true}).click();
      await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
      await p.locator('label.ind-field', {hasText: 'Puerta'}).locator('select').selectOption(option);
    };
    await choose('Gabinete de tablero', 'abierta');
    await p.waitForFunction(() => JSON.parse(document.querySelector('canvas').getAttribute('data-doors') || '{}').gab === 1, null, {timeout: 6000});
    assert.equal((await stored()).entities.find(e => e.id === 'gab').props.puerta, 'abierta');
    pass('el gabinete abre su puerta con animación y la propiedad se guarda');
    await p.locator('label.ind-field', {hasText: 'Puerta'}).locator('select').selectOption('cerrada');
    await p.waitForFunction(() => (JSON.parse(document.querySelector('canvas').getAttribute('data-doors') || '{}').gab ?? 0) === 0, null, {timeout: 6000});
    pass('y la vuelve a cerrar');
    await p.getByRole('button', {name: 'Cerrar Propiedades', exact: true}).click();
    await choose('Sala eléctrica', 'abierta');
    await p.waitForFunction(() => JSON.parse(document.querySelector('canvas').getAttribute('data-doors') || '{}').sala === 1, null, {timeout: 6000});
    pass('la sala eléctrica abre su puerta hacia fuera');
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor();
    await p.waitForFunction(() => JSON.parse(document.querySelector('canvas').getAttribute('data-doors') || '{}').sala === 1, null, {timeout: 6000});
    pass('la puerta abierta se conserva al recargar');
    assert.deepEqual(errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    await c.close();
  } finally { await b.close(); }
  console.log('\n4 comprobaciones de las puertas (interfaz) OK');
})().catch(e => { console.error(e); process.exit(1); });
