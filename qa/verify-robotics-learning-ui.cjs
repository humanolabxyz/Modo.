const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.env.PANELLAB_URL || 'http://127.0.0.1:4326';
const out = 'qa/robotics-learning'; fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const saved = async p => { await p.waitForTimeout(700); return p.evaluate(() => { const lib = JSON.parse(localStorage.getItem('modo-robotica-v1')); return lib.projects.find(p => p.id === lib.active); }); };
const dock = (p, name) => p.locator(`.rb-dock button[aria-label="${name}"]`);
(async () => {
  const {buildTemplate, TEMPLATE_READY_ROBOT} = await import('../src/robotics/project/templates.ts');
  const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  try {
    for (const [name, width, height, touch] of [['desktop', 1440, 900, false], ['tablet', 1024, 768, true], ['mobile', 390, 844, true]]) {
      if (process.env.ROBOTICS_VIEWPORT && process.env.ROBOTICS_VIEWPORT !== name) continue;
      const ctx = await browser.newContext({viewport: {width, height}, hasTouch: touch, isMobile: width < 600, reducedMotion: 'reduce', serviceWorkers: 'block'});
      const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(`${name}: ${e.message}`));
      await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
      await p.waitForFunction(() => window.__modoRobotics?.partIds);
      assert.equal(await p.locator('.rb-dock button[aria-label="Primera persona"]').count(), 0);
      await p.getByRole('button', {name: 'Armar con guía visual', exact: true}).click();
      await p.waitForTimeout(900);
      assert.match(await p.locator('.rb-guide-progress').textContent(), /0 de 14/);
      await p.screenshot({path: `${out}/${name}-guide.png`});
      const bounds = await p.locator('.rb-assembly-guide').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
      if (width < 600) assert.ok(bounds.y > height / 2, 'ayuda inferior deja visible el robot');
      await p.getByRole('button', {name: 'Colocar base', exact: true}).click();
      await p.getByRole('button', {name: 'Tomar pieza', exact: true}).click();
      let pr = await saved(p); assert.equal(pr.parts.length, 2); assert.equal(pr.attachments.length, 0);
      assert.equal(pr.connections.length, 0); assert.equal(pr.firmware.length, 0);
      pass(`${name}: referencia opcional, progreso y piezas reales sin cablear ni programar`);
      await p.getByRole('button', {name: 'Cerrar guía de armado'}).click();
      if (!touch) {
        await p.waitForTimeout(250);
        const handle = await p.evaluate(() => {
          const api = window.__modoRobotics, t = api.gizmoRaw(), v = t.object.position.clone(), dest = v.clone(); dest.x -= .09;
          const a = v.project(t.camera), b = dest.project(t.camera);
          return {at: api.findGizmoPoint('X'), dx: (b.x-a.x) * innerWidth / 2, dy: -(b.y-a.y) * innerHeight / 2};
        });
        assert.ok(handle.at);
        await p.mouse.move(handle.at.x, handle.at.y); await p.mouse.down();
        await p.mouse.move(handle.at.x + handle.dx, handle.at.y + handle.dy, {steps: 12}); await p.mouse.up();
        pr = await saved(p); assert.equal(pr.attachments.length, 1, 'encaje real al soltar gizmo');
        pass('desktop: arrastre de pieza con gizmo encaja en el anclaje de referencia');
        await p.screenshot({path: `${out}/desktop-snapped.png`});
      }
      // Reload with a complete assembly to test named release among adjacent parts.
      const robot = buildTemplate(TEMPLATE_READY_ROBOT); robot.workspace.assemblyTemplate = TEMPLATE_READY_ROBOT;
      await p.addInitScript(robot => localStorage.setItem('modo-robotica-v1', JSON.stringify({projects: [robot], active: robot.id})), robot);
      await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds);
      await dock(p, 'Estructura').click();
      const motor = robot.parts[1];
      await p.locator('.rb-tree-name').filter({hasText: motor.label}).first().click();
      await p.getByRole('button', {name: 'Cerrar Estructura', exact: true}).click();
      const release = p.getByRole('button', {name: `Mantener para soltar ${motor.label}`, exact: true});
      await release.waitFor();
      const before = await saved(p), r = await release.boundingBox();
      const cdp = touch ? await ctx.newCDPSession(p) : null;
      const point = {x: r.x + r.width/2, y: r.y + r.height/2};
      const press = async ms => { if (cdp) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [point]}); await p.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); } else { await p.mouse.move(point.x, point.y); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up(); } };
      if (cdp) {
        await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [point]});
        await p.waitForTimeout(180);
        await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: point.x, y: r.y - 16}]});
        await p.waitForTimeout(800); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
        assert.equal((await saved(p)).attachments.length, before.attachments.length, 'sacar el dedo del botón cancela');
        pass(`${name}: mover el dedo fuera del botón cancela la separación`);
      }
      await press(180);
      assert.equal((await saved(p)).attachments.length, before.attachments.length, 'toque corto no separa');
      await release.focus(); await p.keyboard.down('Space'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(600); await p.keyboard.up('Space');
      assert.equal((await saved(p)).attachments.length, before.attachments.length, 'Escape cancela');
      if (touch) await press(800);
      else { await release.focus(); await p.keyboard.down('Space'); await p.waitForTimeout(800); await p.keyboard.up('Space'); }
      pr = await saved(p); assert.equal(pr.attachments.length, before.attachments.length - 1);
      assert.deepEqual(pr.parts, before.parts, 'soltar conserva posiciones y piezas vecinas');
      assert.deepEqual(pr.connections, before.connections, 'cables conservados');
      await p.getByRole('button', {name: 'Deshacer', exact: true}).click();
      assert.equal((await saved(p)).attachments.length, before.attachments.length);
      pass(`${name}: pieza por nombre, toque corto y Escape cancelan, mantener suelta solo esa unión y Deshacer restaura`);
      await p.getByRole('button', {name: 'Primera persona', exact: true}).click();
      assert.equal(await p.getByRole('button', {name: 'Primera persona', exact: true}).getAttribute('aria-pressed'), 'true');
      await p.getByRole('button', {name: 'Cámara orbital', exact: true}).click();
      assert.equal(await p.getByRole('button', {name: 'Cámara orbital', exact: true}).getAttribute('aria-pressed'), 'true');
      await p.getByRole('button', {name: 'Guía de armado', exact: true}).click();
      assert.match(await p.locator('.rb-assembly-guide').textContent(), /Armado de referencia completo/);
      await p.getByLabel('Referencia de armado', {exact: true}).selectOption('');
      assert.equal((await saved(p)).workspace.assemblyTemplate, undefined);
      await p.screenshot({path: `${out}/${name}-free.png`});
      pass(`${name}: píldora de cámara, progreso tras recarga y regreso a construcción libre`);
      await ctx.close();
    }
    // A real long touch over overlapping geometry must expose names, not guess a target.
    const crowded = buildTemplate(TEMPLATE_READY_ROBOT);
    crowded.parts = crowded.parts.filter(p => p.definitionId === 'dc-motor-tt');
    crowded.parts.forEach(p => { p.transform = {position: [0, .06, 0], rotation: [0, 0, 0, 1]}; });
    crowded.attachments = []; crowded.connections = []; crowded.firmware = [];
    const ctx = await browser.newContext({viewport: {width: 1024, height: 768}, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block'});
    await ctx.addInitScript(robot => localStorage.setItem('modo-robotica-v1', JSON.stringify({projects: [robot], active: robot.id})), crowded);
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message));
    await p.goto(base + '/robotica/?debug=1'); await p.waitForFunction(() => window.__modoRobotics?.partIds);
    await dock(p, 'Encuadrar').click(); await p.waitForTimeout(400);
    const point = await p.evaluate(id => window.__modoRobotics.screenOf(id), crowded.parts[0].instanceId);
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [point]});
    await p.waitForTimeout(650); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await p.locator('.rb-overlap-list').waitFor();
    assert.equal(await p.locator('.rb-overlap-list button').count(), 2);
    await p.locator('.rb-overlap-list button').filter({hasText: crowded.parts[1].label}).click();
    assert.equal(await p.locator('.rb-part-inspector>b').textContent(), crowded.parts[1].label);
    await p.screenshot({path: `${out}/tablet-overlap-picker.png`});
    pass('tablet: mantener sobre dos figuras superpuestas muestra dos nombres y permite resaltar la pieza exacta');
    await ctx.close();
    assert.deepEqual(report.errors, []); fs.writeFileSync(`${out}/verification${process.env.ROBOTICS_VIEWPORT ? '-' + process.env.ROBOTICS_VIEWPORT : ''}.json`, JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
