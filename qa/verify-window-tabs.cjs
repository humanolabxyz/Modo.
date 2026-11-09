const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4386';
const out = process.env.WINDOWS_OUT;
if (out) fs.mkdirSync(out, {recursive: true});

async function drag(page, context, touch, x, y, dx, dy) {
  if (!touch) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, {steps: 10});
    await page.mouse.up();
    return;
  }
  const cdp = await context.newCDPSession(page);
  const send = (type, points) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: points});
  await send('touchStart', [{x, y}]);
  for (let i = 1; i <= 10; i++) await send('touchMove', [{x: x + dx * i / 10, y: y + dy * i / 10}]);
  await send('touchEnd', []);
  await cdp.detach();
}

(async () => {
  const browser = await chromium.launch();
  try {
    for (const [width, height, touch] of [[1440, 900, false], [390, 844, true]]) {
      const context = await browser.newContext({viewport: {width, height}, hasTouch: touch, isMobile: touch, serviceWorkers: 'block', reducedMotion: 'reduce'});
      await context.addInitScript(() => {
        localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen');
        sessionStorage.setItem('modo-opened-v2', '1');
      });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const press = locator => touch ? locator.tap() : locator.click();
      await page.goto(base + '/industria/');
      await page.locator('.ind-app[data-ready=true]').waitFor();
      const dock = page.locator('.ind-dock');
      const launcher = dock.getByRole('button', {name: 'Piezas', exact: true});
      if (await launcher.getAttribute('aria-pressed') !== 'true') await press(launcher);
      const win = page.getByRole('dialog', {name: 'Piezas', exact: true});
      const input = win.getByLabel('Buscar en la biblioteca');
      await input.fill('contactor');
      await input.blur();
      const before = await win.boundingBox();
      const handle = await win.getByRole('button', {name: 'Cambiar tamaño: Piezas'}).boundingBox();
      await drag(page, context, touch, handle.x + handle.width / 2, handle.y + handle.height / 2, touch ? -60 : 65, -85);
      const smaller = await win.boundingBox();
      assert.ok(smaller.height < before.height - 45, 'redimensiona la altura');
      assert.ok(Math.abs(smaller.width - before.width) > 35, 'redimensiona el ancho');
      const title = await win.getByLabel('Mover ventana: Piezas').boundingBox();
      await drag(page, context, touch, title.x + 23, title.y + title.height / 2, 35, 30);
      const moved = await win.boundingBox();
      assert.ok(moved.x > smaller.x + 20, 'se puede mover por la cabecera');
      const minimize = () => press(win.getByRole('button', {name: 'Minimizar: Piezas', exact: true}));
      await minimize();
      await win.waitFor({state: 'hidden'});
      const strip = page.getByRole('navigation', {name: 'Ventanas minimizadas'});
      if (!touch) {
        await press(dock.getByRole('button', {name: 'Estructura', exact: true}));
        const second = page.getByRole('dialog', {name: 'Estructura', exact: true});
        await press(second.getByRole('button', {name: 'Minimizar: Estructura', exact: true}));
        assert.equal(await strip.locator('.fw-window-tab').count(), 2);
      }
      if (out) await page.screenshot({path: out + '/pestanas-' + width + '.png'});
      await press(strip.getByRole('button', {name: 'Restaurar ventana: Piezas'}));
      await win.waitFor();
      assert.equal(await input.inputValue(), 'contactor', 'restaurar conserva el contenido');
      if (!touch) {
        await press(strip.getByRole('button', {name: 'Cerrar ventana minimizada: Estructura'}));
        assert.equal(await dock.getByRole('button', {name: 'Estructura', exact: true}).getAttribute('aria-pressed'), 'false');
      }
      await strip.waitFor({state: 'hidden'});
      const afterRestore = await win.boundingBox();
      for (const dimension of ['x', 'y', 'width', 'height']) assert.ok(Math.abs(afterRestore[dimension] - moved[dimension]) < 3, 'restaurar conserva ' + dimension);
      const max = win.getByRole('button', {name: 'Maximizar o restaurar: Piezas'});
      await press(max);
      assert.equal(await win.getAttribute('data-maximized'), 'true');
      assert.ok((await win.boundingBox()).width > moved.width + 20);
      await press(max);
      assert.equal(await win.getAttribute('data-maximized'), 'false');
      assert.ok(Math.abs((await win.boundingBox()).width - moved.width) < 3);
      if (out) await page.screenshot({path: out + '/ventana-' + width + '.png'});
      await minimize();
      await press(launcher);
      await win.waitFor();
      await press(win.getByRole('button', {name: 'Cerrar Piezas', exact: true}));
      await win.waitFor({state: 'detached'});
      assert.equal(await strip.count(), 0);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('PASS Industria: geometría, estado y controles de ventana (' + width + ' px)');
    }

    const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await context.addInitScript(() => localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'));
    const page = await context.newPage();
    await page.goto(base + '/?view=simulator');
    await page.getByRole('button', {name: 'Abrir diagrama', exact: true}).click();
    const diagram = page.getByRole('complementary', {name: 'Diagrama y material de estudio', exact: true});
    await diagram.getByRole('button', {name: 'Ampliar diagrama', exact: true}).click();
    await diagram.getByRole('button', {name: 'Minimizar: Diagrama', exact: true}).click();
    await diagram.waitFor({state: 'hidden'});
    const strip = page.getByRole('navigation', {name: 'Ventanas minimizadas'});
    await strip.getByRole('button', {name: 'Restaurar ventana: Diagrama'}).click();
    await diagram.getByRole('button', {name: 'Volver al banco', exact: true}).waitFor();
    await diagram.getByRole('button', {name: 'Cerrar diagrama', exact: true}).click();
    await diagram.waitFor({state: 'hidden'});
    assert.equal(await strip.count(), 0);
    console.log('PASS Banco: el diagrama se minimiza y restaura en su modo ampliado');
    await context.close();

    const phone = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await phone.addInitScript(() => localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'));
    const phonePage = await phone.newPage();
    await phonePage.goto(base + '/?view=simulator');
    await phonePage.getByRole('button', {name: 'Abrir diagrama', exact: true}).tap();
    const phoneDiagram = phonePage.locator('.diagram-window').filter({has: phonePage.getByRole('complementary', {name: 'Diagrama y material de estudio', exact: true})});
    await phoneDiagram.waitFor();
    const initialDiagram = await phoneDiagram.boundingBox();
    const corner = await phoneDiagram.locator('.float-handle-se').boundingBox();
    await drag(phonePage, phone, true, corner.x + corner.width / 2, corner.y + corner.height / 2, -45, -160);
    const adjustedDiagram = await phoneDiagram.boundingBox();
    assert.ok(adjustedDiagram.height < initialDiagram.height - 100, 'el diagrama se ajusta con un gesto táctil');
    await phoneDiagram.getByRole('button', {name: 'Minimizar: Diagrama', exact: true}).tap();
    await phoneDiagram.waitFor({state: 'hidden', timeout: 5000});
    await phonePage.getByRole('button', {name: 'Restaurar ventana: Diagrama', exact: true}).tap();
    assert.equal((await phoneDiagram.boundingBox()).height, adjustedDiagram.height);
    console.log('PASS Banco móvil: ajuste táctil del diagrama y recuperación del tamaño');
    await phone.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
