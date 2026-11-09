const assert = require('node:assert/strict');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');

(async () => {
  const {exampleMiniFactory} = await import('../src/industria/sim/examples.ts');
  const {inspectionCamera} = await import('../src/industria/model/inspection.ts');
  const {doorAngle, DOORS} = await import('../src/industria/scene/doors.ts');
  const {add, cross, dot, qFromAxisAngle, qRotate, scale, sub} = await import('../src/robotics/project/math.ts');
  const model = exampleMiniFactory().value;
  const unit = v => scale(v, 1 / Math.hypot(...v));
  const point = (camera, rect, world) => {
    const forward = unit(sub(camera.target, camera.position));
    const right = unit(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const delta = sub(world, camera.position);
    const height = Math.tan(Math.PI / 8) * dot(delta, forward);
    return {
      x: rect.x + rect.width / 2 + dot(delta, right) / height * rect.height / 2,
      y: rect.y + rect.height / 2 - dot(delta, up) / height * rect.height / 2,
    };
  };
  const browser = await chromium.launch();
  try {
    for (const [width, height, touch] of [[1440, 900, false], [390, 844, true]]) {
      const context = await browser.newContext({viewport: {width, height}, hasTouch: touch, isMobile: touch, serviceWorkers: 'block'});
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
      const inspect = page.getByRole('group', {name: 'Inspección de planta'});
      await inspect.waitFor();
      const library = page.locator('.ind-panel-strip').getByRole('button', {name: 'Piezas', exact: true});
      if (await library.getAttribute('aria-pressed') === 'true') await library.click();
      const canvas = page.locator('canvas').first();
      await canvas.waitFor();
      await inspect.getByRole('button', {name: 'Sala eléctrica', exact: true}).click();
      await page.waitForTimeout(550);
      const room = model.entities.find(e => e.id === 'sala');
      const cabinet = model.entities.find(e => e.id === 'gab');
      const cabPose = model.poses.gab.position;
      const rect = await canvas.boundingBox();
      const closedDoor = point(inspectionCamera(model, room, false, width / height), rect, add(cabPose, [0.1, 0.65, 0.177]));
      const click = touch ? (x, y) => page.touchscreen.tap(x, y) : (x, y) => page.mouse.click(x, y);
      if (!touch) {
        await page.mouse.move(closedDoor.x, closedDoor.y);
        await page.mouse.down();
        await page.mouse.move(closedDoor.x + 8, closedDoor.y, {steps: 4});
        await page.mouse.up();
        assert.equal(await inspect.getByRole('button', {name: 'Interior del gabinete'}).getAttribute('aria-pressed'), 'false', 'orbitar sobre la puerta no la abre');
        await inspect.getByRole('button', {name: 'Sala eléctrica', exact: true}).click();
        await page.waitForTimeout(350);
      }
      await click(closedDoor.x, closedDoor.y);
      await page.waitForFunction(() => JSON.parse(document.querySelector('canvas').dataset.doors ?? '{}').gab === 1);
      assert.equal(await inspect.getByRole('button', {name: 'Interior del gabinete'}).getAttribute('aria-pressed'), 'true');
      const covers = inspect.getByRole('button', {name: 'Ver cables en canaletas'});
      await covers.click();
      assert.equal(await covers.getAttribute('aria-pressed'), 'true');
      await covers.click();
      if (!touch) {
        const hinge = DOORS.gabinete.pivot;
        const rotated = add(hinge, qRotate(qFromAxisAngle([0, 1, 0], doorAngle('gabinete', 1)), sub([-0.12, 0.65, 0.177], hinge)));
        const openDoor = point(inspectionCamera(model, cabinet, true, width / height), rect, add(cabPose, rotated));
        await click(openDoor.x, openDoor.y);
        await page.waitForFunction(() => JSON.parse(document.querySelector('canvas').dataset.doors ?? '{}').gab === 0);
      }
      assert.deepEqual(errors, []);
      console.log('PASS La hoja se abre desde el escenario con ' + (touch ? 'un toque' : 'un clic y se cierra al volver a pulsarla'));
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
