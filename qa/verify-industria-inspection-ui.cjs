const assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await context.addInitScript(() => {
      localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen');
      sessionStorage.setItem('modo-opened-v2', '1');
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/industria/');
    await page.locator('.ind-app[data-ready=true]').waitFor();
    await page.getByRole('button', {name: 'Opciones del proyecto'}).click();
    await page.getByRole('button', {name: 'Ejemplo: mini fábrica'}).click();
    const inspection = page.getByRole('group', {name: 'Inspección de planta'});
    await inspection.waitFor();
    await page.locator('canvas').first().waitFor();
    const library = page.locator('.ind-panel-strip').getByRole('button', {name: 'Piezas', exact: true});
    if (await library.getAttribute('aria-pressed') === 'true') await library.click();
    const project = () => page.evaluate(() => {
      const lib = JSON.parse(localStorage.getItem('modo:industria:library:v1'));
      return lib?.projects.find(p => p.id === lib.active);
    });
    const view = name => page.getByRole('group', {name: 'Vistas del proyecto'}).getByRole('button', {name, exact: true}).click();
    const original = await project();
    assert.ok(original.mounts.some(m => m.parent.entityId === 'gab' && m.child.entityId === 'placa'));
    await inspection.getByRole('button', {name: 'Sala eléctrica', exact: true}).click();
    await inspection.getByRole('button', {name: 'Interior del gabinete'}).click();
    assert.equal(await inspection.getByRole('button', {name: 'Interior del gabinete'}).getAttribute('aria-pressed'), 'true');
    await inspection.getByRole('button', {name: 'Corte automático'}).click();
    assert.equal(await inspection.getByRole('button', {name: 'Corte automático'}).getAttribute('aria-pressed'), 'false');
    assert.deepEqual(await project(), original);
    console.log('PASS La inspección del gabinete y el corte conservan el proyecto guardado');

    await view('Tablero');
    const board = page.getByRole('region', {name: 'Tablero', exact: true});
    await board.getByRole('button', {name: 'Puerta', exact: true}).click();
    assert.equal(await board.locator('[data-device=s1]').count(), 1);
    assert.equal(await board.locator('[data-device=h1]').count(), 1);
    await board.getByRole('button', {name: 'Placa', exact: true}).click();
    await board.locator('[data-device=km1]').press('Enter');
    await board.getByRole('button', {name: /^A1 ·/}).click();
    await board.getByRole('button', {name: /PLC.DO0.*KM1.A1/}).click();
    await board.getByRole('button', {name: 'Seguir en diagrama'}).click();
    const diagram = page.getByRole('region', {name: 'Diagrama esquemático'});
    assert.match(await diagram.locator('.ind-trace').innerText(), /PLC.DO0.*KM1.A1/);
    await diagram.getByRole('button', {name: 'Ver en planta'}).click();
    assert.equal(await inspection.getByRole('button', {name: 'Interior del gabinete'}).getAttribute('aria-pressed'), 'true');
    console.log('PASS Los mandos de puerta y los bornes de placa se pueden seguir entre las tres vistas');

    await view('PLC');
    const plc = page.getByRole('region', {name: 'Programa del PLC'});
    assert.ok(await plc.getByRole('img', {name: /Red Ladder 1: MOTOR/}).isVisible());
    await plc.getByRole('button', {name: 'Validar programa'}).click();
    assert.match(await plc.getByRole('status').innerText(), /Validación/);
    await plc.getByRole('button', {name: 'Monitorizar'}).click();
    assert.ok(await plc.getByLabel('Variable de DI0').isDisabled());

    await view('HMI');
    const form = page.getByRole('group', {name: 'Nuevo widget'});
    await form.getByLabel('Objeto').selectOption({label: 'MARCHA'});
    await form.getByLabel('Posición en cuadrícula').selectOption('8');
    await form.getByRole('button', {name: 'Guardar objeto'}).click();
    const id = original.hmi.widgets.find(w => w.label === 'MARCHA').id;
    await page.waitForFunction(widgetId => {
      const lib = JSON.parse(localStorage.getItem('modo:industria:library:v1'));
      return lib.projects.find(p => p.id === lib.active).hmi.widgets.find(w => w.id === widgetId).slot === 8;
    }, id);
    await page.reload();
    await page.locator('.ind-app[data-ready=true]').waitFor();
    assert.equal((await project()).hmi.widgets.find(w => w.id === id).slot, 8);
    await page.getByRole('button', {name: 'Operación', exact: true}).click();
    assert.equal(await form.count(), 0);
    console.log('PASS Ladder y monitor reutilizan el programa y la posición HMI persiste al recargar');

    await view('Documentación');
    await page.getByLabel('Buscar por referencia de componente').fill('KM1');
    const result = page.locator('.ind-doc-search').getByRole('button', {name: 'Ver en planta'});
    await result.click();
    assert.match(await page.locator('.ind-path').innerText(), /KM1/);
    assert.deepEqual(errors, []);
    console.log('PASS La ficha de operación permite localizar un componente por referencia');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
