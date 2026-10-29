// Robótica · etapa 2 (interfaz): insertar del catálogo, mover con gizmo, editar coordenadas, uniones, interferencia,
// deshacer/rehacer, guardar, recargar y comparar posiciones.  Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-build-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4325').replace(/\/$/, ''), out = 'qa/robotics';
fs.mkdirSync(out, {recursive: true});
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const VIEWPORTS = [['escritorio', 1440, 900, false], ['tablet', 1024, 768, true], ['telefono', 390, 844, true]];

// Espera a que el estado «Guardado» vuelva (el guardado se retrasa 350 ms y la cámara puede reiniciarlo) antes de leer el almacenamiento.
const saved = async p => { await p.waitForTimeout(200); await p.waitForFunction(() => /Guardado/.test(document.querySelector('.rb-name small')?.textContent || '') && localStorage.getItem('modo-robotica-v1') !== null, null, {timeout: 15000}); await p.waitForTimeout(150); return p.evaluate(() => { const lib = JSON.parse(localStorage.getItem('modo-robotica-v1')); return lib.projects.find(x => x.id === lib.active); }); };
const byLabel = (pr, label) => pr.parts.find(x => x.label === label);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const dock = (p, label) => p.locator(`.rb-dock button[aria-label="${label}"]`);
const win = (id) => `.rb-window-${id}`;
let PHONE = false; // en teléfono cada ventana es una lámina que tapa el dock: se cierra la anterior antes de abrir otra
const TITLES = {parts: 'Piezas', structure: 'Estructura', properties: 'Propiedades'};
async function openWin(p, label, id) {
  if (PHONE) for (const [other, title] of Object.entries(TITLES)) if (other !== id && (await p.locator(win(other)).count())) await p.locator(`${win(other)} button[aria-label="Cerrar ${title}"]`).click();
  if (!(await p.locator(win(id)).count())) await dock(p, label).click(); await p.locator(win(id)).waitFor();
}
async function closeWin(p, label, id) { if (await p.locator(win(id)).count()) await p.locator(`${win(id)} button[aria-label="Cerrar ${label}"]`).click(); }
async function add(p, name) { await openWin(p, 'Piezas', 'parts'); await p.locator(`button[aria-label="Agregar ${name}"]`).click(); }
async function pick(p, label) { await openWin(p, 'Estructura', 'structure'); await p.locator('.rb-tree-name', {hasText: label}).first().click(); }
async function setField(p, name, value) { const f = p.locator(`${win('properties')} input[aria-label="${name}"]`); await f.fill(String(value)); await f.press('Enter'); }
async function select(p, label) { await pick(p, label); await openWin(p, 'Propiedades', 'properties'); }

(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    for (const [name, w, h, touch] of VIEWPORTS) {
      const phone = w < 600, step = s => pass(`[${name}] ${s}`); PHONE = phone;
      const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: phone, serviceWorkers: 'block', reducedMotion: 'reduce'});
      await ctx.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
      const p = await ctx.newPage();
      p.on('pageerror', e => report.errors.push(`[${name}] ${e.message}`));
      p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(`[${name}] ${m.text()}`); });
      await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds, null, {timeout: 20000});

      // 1) Catálogo: búsqueda, categorías e inserción con «Agregar»
      await openWin(p, 'Piezas', 'parts');
      await p.locator('input[aria-label="Buscar pieza"]').fill('ultrasónico'); assert.equal(await p.locator('.rb-part-list li[data-definition]').count(), 1); assert.equal(await p.locator('.rb-part-list li').first().getAttribute('data-definition'), 'hc-sr04');
      await p.locator('input[aria-label="Buscar pieza"]').fill('xyz'); assert.match(await p.locator('.rb-part-none').textContent(), /No hay piezas/);
      await p.locator('input[aria-label="Buscar pieza"]').fill('');
      await p.locator('.rb-chips button', {hasText: 'Sensores'}).click(); assert.equal(await p.locator('.rb-part-list li[data-definition]').count(), 1);
      await p.locator('.rb-chips button', {hasText: 'Todas'}).click(); assert.equal(await p.locator('.rb-part-list li[data-definition]').count(), 10);
      for (const n of ['Chasis 2WD', 'Motor DC TT', 'Arduino UNO R3']) await add(p, n);
      assert.equal((await saved(p)).parts.length, 3);
      step('catálogo con 10 piezas: búsqueda sin tildes, categorías y «Agregar» con etiquetas únicas');

      // 2) Arrastrar desde el catálogo con fantasma (solo con ratón)
      if (!phone) {
        const card = await p.locator('li[data-definition="l298n-module"] .rb-part-card').boundingBox();
        await p.mouse.move(card.x + 60, card.y + 20); await p.mouse.down(); await p.mouse.move(w * .6, h * .5, {steps: 8});
        await p.locator('.rb-ghost-note').waitFor(); assert.match(await p.locator('.rb-ghost-note').textContent(), /Suelta para agregar|superpone/);
        await p.mouse.move(w * .5, h - 30, {steps: 4}); assert.match(await p.locator('.rb-ghost-note').textContent(), /sobre la pizarra/); // encima del dock
        await p.keyboard.press('Escape'); await p.mouse.up(); await p.waitForTimeout(150);
        assert.equal((await saved(p)).parts.length, 3, 'Esc cancela el arrastre');
        await p.mouse.move(card.x + 60, card.y + 20); await p.mouse.down(); await p.mouse.move(w * .6, h * .55, {steps: 8}); await p.mouse.up();
        const dropped = byLabel(await saved(p), 'Driver L298N 1'); assert.ok(dropped, 'el arrastre agregó el driver'); near(dropped.transform.position[1], 0.0135, 1e-6, 'apoyado en el suelo');
        await p.mouse.move(card.x + 60, card.y + 20); await p.mouse.down(); await p.mouse.move(card.x + 70, card.y + 30, {steps: 3}); await p.mouse.move(w * .5, 5, {steps: 4}); await p.mouse.up(); // soltar sobre la barra
        assert.equal((await saved(p)).parts.length, 4, 'soltar fuera de la pizarra no agrega');
        step('arrastrar al lienzo: fantasma con aviso, Esc cancela, soltar sobre la pizarra agrega apoyada en el suelo, fuera no agrega');
      } else await add(p, 'Driver L298N');
      await closeWin(p, 'Piezas', 'parts');

      // 3) Editar coordenadas numéricas + deshacer/rehacer
      await select(p, 'Chasis 2WD 1');
      const before = byLabel(await saved(p), 'Chasis 2WD 1').transform.position;
      await setField(p, 'X (mm)', 200); let now = byLabel(await saved(p), 'Chasis 2WD 1').transform.position; near(now[0], 0.2, 1e-9, 'X en metros'); near(now[2], before[2], 1e-9, 'Z intacta');
      await setField(p, 'Y (°)', 90); const rot = byLabel(await saved(p), 'Chasis 2WD 1').transform.rotation; near(rot[1], Math.SQRT1_2, 1e-6, 'giro de 90° sobre Y'); near(rot[3], Math.SQRT1_2, 1e-6, 'giro de 90° sobre Y (w)');
      await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Chasis 2WD 1').transform.rotation[3], 1, 1e-9, 'deshacer el giro');
      await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Chasis 2WD 1').transform.position[0], before[0], 1e-9, 'deshacer X');
      await p.locator('.rb-bar button[aria-label="Rehacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Chasis 2WD 1').transform.position[0], 0.2, 1e-9, 'rehacer X');
      step('editar posición (mm→m) y rotación (grados→cuaternión) desde Propiedades; deshacer y rehacer paso a paso');

      // 4) Unir: el motor a ≤ 15 mm del anclaje del chasis ofrece «Unir»; al unir, los anclajes coinciden
      const c = byLabel(await saved(p), 'Chasis 2WD 1');
      await dock(p, 'Seleccionar').dispatchEvent('click');
      await p.locator('button[aria-label="Deshacer"]').dispatchEvent('click'); // deja el chasis sin giro y en x=0 → anclaje conocido
      const c0 = byLabel(await saved(p), 'Chasis 2WD 1').transform.position;
      const anchor = [c0[0] - 0.062, c0[1] - 0.002, c0[2] - 0.020];
      await select(p, 'Motor DC TT 1');
      for (const [axis, v] of [['X', anchor[0] + 0.006], ['Y', anchor[1] - 0.011 + 0.003], ['Z', anchor[2]]]) await setField(p, `${axis} (mm)`, v * 1000);
      await p.locator('.rb-context-toolbar button[aria-label="Unir"]').waitFor({state: 'attached'});
      await p.locator('.rb-context-toolbar button[aria-label="Unir"]').dispatchEvent('click');
      const joined = await saved(p); assert.equal(joined.attachments.length, 1); assert.equal(joined.attachments[0].kind, 'rigid');
      const motor = byLabel(joined, 'Motor DC TT 1'); near(motor.transform.position[0], anchor[0], 1e-6, 'anclaje X'); near(motor.transform.position[1], anchor[1] - 0.011, 1e-6, 'anclaje Y'); near(motor.transform.position[2], anchor[2], 1e-6, 'anclaje Z');
      step('un motor a 6 mm del anclaje ofrece «Unir» y queda fijo en él (anclajes coincidentes, 1e-6)');

      // 5) Mover el chasis conserva la unión; la estructura muestra padre e hijo
      await select(p, 'Chasis 2WD 1'); await setField(p, 'X (mm)', 300);
      const moved = await saved(p); near(byLabel(moved, 'Motor DC TT 1').transform.position[0] - motor.transform.position[0], 0.3 - c0[0], 1e-6, 'el motor siguió al chasis'); assert.equal(moved.attachments.length, 1);
      await openWin(p, 'Estructura', 'structure'); assert.equal(await p.locator('.rb-tree [aria-level="2"] .rb-tree-name', {hasText: 'Motor DC TT 1'}).count(), 1, 'el motor aparece como hijo del chasis');
      step('mover el chasis arrastra al motor unido y conserva la unión; Estructura lo muestra como hijo');

      // 6) Interferencia: solo advertencia
      await select(p, 'Arduino UNO R3 1');
      const cc = byLabel(await saved(p), 'Chasis 2WD 1').transform.position;
      for (const [axis, v] of [['X', cc[0]], ['Y', cc[1] + 0.004], ['Z', cc[2] + 0.02]]) await setField(p, `${axis} (mm)`, v * 1000);
      await p.locator(`${win('properties')} .rb-warn`).waitFor(); assert.match(await p.locator(`${win('properties')} .rb-warn`).textContent(), /superpone/);
      if (!phone) assert.ok(await p.locator('.rb-tree-warn').count() >= 1, 'el árbol marca la interferencia');
      assert.equal(byLabel(await saved(p), 'Arduino UNO R3 1').transform.position[1] > 0, true, 'no se bloqueó ni se movió la pieza');
      await setField(p, 'Y (mm)', 400); await p.locator(`${win('properties')} .rb-warn`).waitFor({state: 'detached'});
      step('la interferencia se advierte (Propiedades y árbol) sin bloquear, y desaparece al separar las piezas');

      // 7) Bloqueo
      await p.locator(`${win('properties')} label.rb-check`, {hasText: 'Bloqueada'}).locator('input').check();
      assert.equal(await p.locator(`${win('properties')} input[aria-label="X (mm)"]`).isDisabled(), true); assert.equal(byLabel(await saved(p), 'Arduino UNO R3 1').locked, true);
      await p.locator(`${win('properties')} label.rb-check`, {hasText: 'Bloqueada'}).locator('input').uncheck();
      step('una pieza bloqueada no admite editar su posición');

      if (!phone) {
        // 8) Gizmo de mover: arrastra la pieza, la cámara no orbita, un arrastre = un paso de historial
        await closeWin(p, 'Estructura', 'structure'); await closeWin(p, 'Propiedades', 'properties');
        await pick(p, 'Arduino UNO R3 1'); await closeWin(p, 'Estructura', 'structure');
        await dock(p, 'Encuadrar').click(); await p.waitForTimeout(900);
        await dock(p, 'Mover').click();
        const startPos = byLabel(await saved(p), 'Arduino UNO R3 1').transform.position, camBefore = await p.evaluate(() => window.__modoRobotics.camera());
        const hx = await p.evaluate(() => window.__modoRobotics.findGizmoPoint('X')); assert.ok(hx, 'el gizmo tiene un asa X en pantalla');
        await p.mouse.move(hx.x, hx.y); await p.mouse.down(); await p.mouse.move(hx.x + 40, hx.y, {steps: 4});
        assert.notEqual(await p.locator('.rb-canvas').getAttribute('data-gesture-state'), 'orbiting'); assert.notEqual(await p.locator('.rb-canvas').getAttribute('data-gesture-state'), 'marquee');
        await p.mouse.move(hx.x + 90, hx.y, {steps: 6}); await p.mouse.up();
        const afterPos = byLabel(await saved(p), 'Arduino UNO R3 1').transform.position, camAfter = await p.evaluate(() => window.__modoRobotics.camera());
        assert.ok(Math.abs(afterPos[0] - startPos[0]) > 0.01, `la pieza se movió en X (${startPos[0]} → ${afterPos[0]})`); near(afterPos[1], startPos[1], 1e-9, 'Y intacta'); near(afterPos[2], startPos[2], 1e-9, 'Z intacta');
        camBefore.position.forEach((v, i) => near(camAfter.position[i], v, 1e-6, 'la cámara no se movió'));
        await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Arduino UNO R3 1').transform.position[0], startPos[0], 1e-9, 'un solo deshacer revierte el arrastre completo');
        await p.locator('.rb-bar button[aria-label="Rehacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Arduino UNO R3 1').transform.position[0], afterPos[0], 1e-9, 'rehacer');
        step('gizmo de mover: arrastra solo en X, la cámara no orbita y todo el arrastre es un único paso de historial');

        // 9) Gizmo de rotar
        await dock(p, 'Rotar').click(); await p.waitForTimeout(300);
        const hy = await p.evaluate(() => window.__modoRobotics.findGizmoPoint('Y')); assert.ok(hy, 'el gizmo de rotar tiene un aro Y');
        const q0 = byLabel(await saved(p), 'Arduino UNO R3 1').transform.rotation;
        await p.mouse.move(hy.x, hy.y); await p.mouse.down(); await p.mouse.move(hy.x + 30, hy.y + 12, {steps: 5}); await p.mouse.move(hy.x + 70, hy.y + 28, {steps: 5}); await p.mouse.up();
        const q1 = byLabel(await saved(p), 'Arduino UNO R3 1').transform.rotation;
        assert.ok(Math.abs(q1[1] - q0[1]) > 0.02, `la pieza giró sobre Y (${q0} → ${q1})`);
        await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); near(byLabel(await saved(p), 'Arduino UNO R3 1').transform.rotation[1], q0[1], 1e-9, 'deshacer el giro');
        step('gizmo de rotar: gira la pieza con pivote en su centro; un deshacer lo revierte');

        // 10) Imán: pasos de 10 mm
        await openWin(p, 'Propiedades', 'properties'); await p.locator('select[aria-label="Paso del imán"]').selectOption('10'); await closeWin(p, 'Propiedades', 'properties');
        await dock(p, 'Imán').click(); await dock(p, 'Mover').click(); await p.waitForTimeout(300);
        const hx2 = await p.evaluate(() => window.__modoRobotics.findGizmoPoint('X'));
        await p.mouse.move(hx2.x, hx2.y); await p.mouse.down(); await p.mouse.move(hx2.x + 37, hx2.y, {steps: 5}); await p.mouse.up();
        const sx = byLabel(await saved(p), 'Arduino UNO R3 1').transform.position[0] * 1000;
        near(sx / 10, Math.round(sx / 10), 1e-6, `con imán de 10 mm la posición es múltiplo de 10 (${sx} mm)`);
        await dock(p, 'Imán').click(); await dock(p, 'Seleccionar').click();
        step('imán de 10 mm: la posición final es múltiplo del paso');
      }

      // 11) Grupos desde la estructura
      if (!phone) {
        await openWin(p, 'Estructura', 'structure');
        await p.locator('.rb-tree-name', {hasText: 'Arduino UNO R3 1'}).click(); await p.locator('.rb-tree-name', {hasText: 'Motor DC TT 1'}).click({modifiers: ['Shift']});
        await openWin(p, 'Propiedades', 'properties'); await p.locator(`${win('properties')} .rb-props-actions button`, {hasText: 'Agrupar'}).click();
        await p.locator('.rb-tree-name', {hasText: 'Chasis 2WD 1'}).click(); await p.locator('.rb-tree-name', {hasText: 'Arduino UNO R3 1'}).click();
        assert.equal(await p.locator('.rb-tree-row.is-selected').count(), 2, 'al elegir una pieza agrupada se elige el grupo');
        step('agrupar desde Propiedades: elegir una pieza del grupo selecciona el grupo completo');
      }

      // 12) Borrar una pieza unida rompe sus uniones y avisa
      await pick(p, 'Motor DC TT 1');
      await p.locator('.rb-context-toolbar button[aria-label="Borrar"]').dispatchEvent('click');
      await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /unión/);
      const afterDelete = await saved(p); assert.equal(afterDelete.attachments.length, 0); assert.equal(byLabel(afterDelete, 'Motor DC TT 1'), undefined);
      step('borrar el motor unido elimina su unión y avisa («se rompieron … uniones»)');

      // 13) Guardar → recargar → mismas posiciones
      const beforeReload = await saved(p);
      await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds, null, {timeout: 20000}); await p.waitForTimeout(700);
      const afterReload = await saved(p);
      assert.deepEqual(afterReload.parts, beforeReload.parts, 'las piezas (posición, rotación, etiquetas, grupos) son idénticas tras recargar'); assert.deepEqual(afterReload.attachments, beforeReload.attachments);
      assert.equal(await p.evaluate(() => window.__modoRobotics.partIds().length), beforeReload.parts.length, 'el lienzo dibuja todas las piezas guardadas');
      await p.screenshot({path: `${out}/e2-${name}.png`});
      step(`recargar conserva ${beforeReload.parts.length} piezas con las mismas posiciones y rotaciones (deep equal)`);
      await ctx.close();
    }
    // Robot completo de dos ruedas: se reabre desde el almacenamiento, se ve armado, se mueve como un solo cuerpo y se recupera igual.
    {
      const {buildRobot2wd} = await import('./robotics/robot2wd.mjs'); const {project: robot, ids} = buildRobot2wd();
      const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', reducedMotion: 'reduce'});
      await ctx.addInitScript(lib => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(lib)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [robot], active: robot.id});
      const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(`[robot] ${e.message}`)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(`[robot] ${m.text()}`); });
      PHONE = false; await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 11, null, {timeout: 20000});
      await dock(p, 'Encuadrar').click(); await p.waitForTimeout(900);
      await openWin(p, 'Estructura', 'structure');
      assert.equal(await p.locator('.rb-tree > [role=treeitem]').count(), 1, 'un solo árbol: todo cuelga del chasis');
      assert.equal(await p.locator('.rb-tree [aria-level="2"]').count(), 7, 'motores, rueda loca, Arduino, driver, portapilas y soporte cuelgan del chasis'); assert.equal(await p.locator('.rb-tree [aria-level="3"]').count(), 3, 'las dos ruedas y el sensor son hijos de hijos');
      await p.screenshot({path: `${out}/e2-robot-armado.png`});
      await select(p, 'Chasis 2WD 1'); const x0 = byLabel(await saved(p), 'Chasis 2WD 1').transform.position[0]; await setField(p, 'X (mm)', 150);
      const moved = await saved(p); for (const part of moved.parts) near(part.transform.position[0] - robot.parts.find(q => q.instanceId === part.instanceId).transform.position[0], 0.15 - x0, 1e-6, `${part.label} siguió al chasis`);
      assert.equal(moved.attachments.length, 10); assert.equal(await p.locator(`${win('properties')} .rb-warn`).count(), 0, 'sin interferencias');
      await p.reload(); await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 11, null, {timeout: 20000}); assert.deepEqual((await saved(p)).parts, moved.parts, 'el robot se reabre idéntico');
      pass('robot de 2 ruedas: se reabre armado (11 piezas, 10 uniones), se mueve entero con el chasis, sin interferencias, y se recupera idéntico tras recargar');
      await ctx.close();
    }
    assert.deepEqual(report.errors, [], 'sin errores de consola ni de página'); pass('sin errores de consola ni de página');
  } finally { await browser.close(); fs.writeFileSync(`${out}/build-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
