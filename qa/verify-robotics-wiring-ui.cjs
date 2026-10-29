// Robótica · etapa 3 (interfaz): cablear UNO D5→ENA, etiqueta del cable, mover el UNO y comprobar que el cable sigue al pin,
// borrar y deshacer; diagnósticos, resaltado de pines y multímetro.  Uso: PANELLAB_URL=http://127.0.0.1:4330 node qa/verify-robotics-wiring-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4325').replace(/\/$/, ''), out = 'qa/robotics';
fs.mkdirSync(out, {recursive: true});
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const VIEWPORTS = [['escritorio', 1440, 900, false], ['tablet', 1024, 768, true], ['telefono', 390, 844, true]];
let PHONE = false;
const win = id => `.rb-window-${id}`;
const dock = (p, label) => p.locator(`.rb-dock button[aria-label="${label}"]`);
const TITLES = {parts: 'Piezas', structure: 'Estructura', properties: 'Propiedades', console: 'Consola'};
async function openWin(p, id) {
  if (PHONE) for (const [other, title] of Object.entries(TITLES)) if (other !== id && (await p.locator(win(other)).count())) await p.locator(`${win(other)} button[aria-label="Cerrar ${title}"]`).dispatchEvent('click');
  if (!(await p.locator(win(id)).count())) await dock(p, TITLES[id]).click(); await p.locator(win(id)).waitFor();
}
async function closeWin(p, id) { if (await p.locator(win(id)).count()) await p.locator(`${win(id)} button[aria-label="Cerrar ${TITLES[id]}"]`).dispatchEvent('click'); }
const saved = async p => { await p.waitForTimeout(200); await p.waitForFunction(() => /Guardado/.test(document.querySelector('.rb-name small')?.textContent || '') && localStorage.getItem('modo-robotica-v1') !== null, null, {timeout: 15000}); await p.waitForTimeout(150); return p.evaluate(() => { const lib = JSON.parse(localStorage.getItem('modo-robotica-v1')); return lib.projects.find(x => x.id === lib.active); }); };
const byLabel = (pr, label) => pr.parts.find(x => x.label === label);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const pinAt = (p, label, pinId) => p.evaluate(({l, pin}) => { const lib = JSON.parse(localStorage.getItem('modo-robotica-v1')); const pr = lib.projects.find(x => x.id === lib.active), part = pr.parts.find(x => x.label === l); return window.__modoRobotics.pinScreen(part.instanceId, pin); }, {l: label, pin: pinId});
const setField = async (p, name, value) => { const f = p.locator(`${win('properties')} input[aria-label="${name}"]`); await f.fill(String(value)); await f.press('Enter'); };

(async () => {
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const {buildRobot2wd, wireRobot2wd} = await import('./robotics/robot2wd.mjs');
  const wiredRobot = await wireRobot2wd(buildRobot2wd());
  const newContext = async (w, h, touch, lib) => {
    const ctx = await browser.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: w < 600, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await ctx.addInitScript(l => { if (l && !localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, lib ?? null);
    const p = await ctx.newPage(); const tag = `${w}x${h}`;
    p.on('pageerror', e => report.errors.push(`[${tag}] ${e.message}`));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(`[${tag}] ${m.text()}`); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds, null, {timeout: 20000});
    return {ctx, p};
  };
  try {
    for (const [name, w, h, touch] of VIEWPORTS) {
      const phone = w < 600, step = s => pass(`[${name}] ${s}`); PHONE = phone;
      const {ctx, p} = await newContext(w, h, touch);

      // 1) Dos piezas y la herramienta Cable
      await openWin(p, 'parts'); await p.locator('button[aria-label="Agregar Arduino UNO R3"]').click(); await p.locator('button[aria-label="Agregar Driver L298N"]').click(); await closeWin(p, 'parts');
      await p.keyboard.press('Escape'); await dock(p, 'Encuadrar').click(); await p.waitForTimeout(900);
      await p.keyboard.press('w'); assert.equal(await dock(p, 'Cable').getAttribute('aria-pressed'), 'true', 'la tecla W activa Cable');
      assert.match(await p.locator('.rb-tool-bar').textContent(), /Pulsa un pin/);
      const o = phone ? 0 : 2; // en teléfono las cabeceras quedan a pocos píxeles: se apunta al centro
      const d5 = await pinAt(p, 'Arduino UNO R3 1', 'D5'), ena = await pinAt(p, 'Driver L298N 1', 'ENA'); assert.ok(d5 && ena, 'con la herramienta Cable los pines existen y se proyectan');
      // 2) Hover con etiqueta; clic cerca del pin (en cabeceras densas gana el pin más cercano); previsualización
      await p.mouse.move(ena.x, ena.y); await p.locator('.rb-pin-tip').waitFor(); assert.match(await p.locator('.rb-pin-tip').textContent(), /Driver L298N 1 · ENA/);
      await p.mouse.click(d5.x + o, d5.y - o); assert.match(await p.locator('.rb-tool-bar').textContent(), /Desde Arduino UNO R3 1 · D5/);
      await p.mouse.move((d5.x + ena.x) / 2, (d5.y + ena.y) / 2, {steps: 5}); await p.waitForTimeout(150);
      assert.equal(await p.evaluate(() => window.__modoRobotics.wireCount()), 0, 'todavía no hay cable: solo la previsualización');
      // 3) Esc cancela el cable a medias; un segundo Esc suelta la herramienta
      await p.keyboard.press('Escape'); assert.match(await p.locator('.rb-tool-bar').textContent(), /Pulsa un pin/); assert.equal(await dock(p, 'Cable').getAttribute('aria-pressed'), 'true');
      await p.keyboard.press('Escape'); assert.equal(await dock(p, 'Seleccionar').getAttribute('aria-pressed'), 'true'); assert.equal((await saved(p)).connections.length, 0);
      step('herramienta Cable (W): pines visibles con etiqueta al pasar, previsualización, Esc cancela el cable y luego la herramienta');
      // 4) Cable D5 → ENA
      await dock(p, 'Cable').click(); await p.mouse.click(d5.x + o, d5.y - o); await p.mouse.click(ena.x - o, ena.y + o);
      await p.waitForFunction(() => window.__modoRobotics.wireCount() === 1); const wired = await saved(p);
      assert.equal(wired.connections.length, 1); const c = wired.connections[0], uno = byLabel(wired, 'Arduino UNO R3 1'), drv = byLabel(wired, 'Driver L298N 1');
      assert.deepEqual([c.a.instanceId, c.a.pinId, c.b.instanceId, c.b.pinId], [uno.instanceId, 'D5', drv.instanceId, 'ENA']);
      await openWin(p, 'properties'); await p.locator(`${win('properties')} [data-testid="wire-label"]`).waitFor(); assert.equal((await p.locator(`${win('properties')} [data-testid="wire-label"] span`).textContent()), 'Arduino UNO R3 1 · D5 → Driver L298N 1 · ENA');
      step('cablear D5 → ENA: el cable existe y su etiqueta es «Arduino UNO R3 1 · D5 → Driver L298N 1 · ENA»');

      // 5) Mover el UNO: el cable sigue al pin
      const before = (await p.evaluate(() => window.__modoRobotics.wires()))[0].points; await dock(p, 'Seleccionar').dispatchEvent('click');
      await openWin(p, 'structure'); await p.locator('.rb-tree-name', {hasText: 'Arduino UNO R3 1'}).click(); await openWin(p, 'properties');
      await setField(p, 'X (mm)', uno.transform.position[0] * 1000 + 50);
      const after = (await p.evaluate(() => window.__modoRobotics.wires()))[0].points;
      near(after[0][0] - before[0][0], 0.05, 1e-6, 'el extremo del UNO se movió 50 mm'); near(after.at(-1)[0] - before.at(-1)[0], 0, 1e-9, 'el otro extremo no se movió'); assert.equal((await saved(p)).connections[0].id, c.id, 'misma conexión lógica');
      step('mover el UNO 50 mm: el extremo del cable en D5 se movió exactamente 50 mm y el de ENA no');

      // 6) Cable en color: cambiar color y ruta; borrar y deshacer
      await openWin(p, 'console'); await p.locator('.rb-wire-pick', {hasText: 'D5'}).click(); await openWin(p, 'properties');
      await p.locator(`${win('properties')} button[aria-label="Color Azul"]`).click(); assert.equal((await saved(p)).connections[0].color, '#2a67a3');
      await p.locator(`${win('properties')} .rb-add-point`).click(); assert.equal((await saved(p)).connections[0].route.length, 1);
      await p.locator(`${win('properties')} button[aria-label="Quitar punto 1"]`).click(); assert.equal((await saved(p)).connections[0].route, undefined);
      await p.locator(`${win('properties')} button`, {hasText: 'Borrar cable'}).click(); assert.equal((await saved(p)).connections.length, 0); assert.equal(await p.evaluate(() => window.__modoRobotics.wireCount()), 0);
      await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); const restored = await saved(p); assert.equal(restored.connections.length, 1); assert.equal(restored.connections[0].id, c.id, 'deshacer devuelve el mismo cable');
      step('color y puntos de control del cable; borrar el cable y deshacerlo lo devuelve con el mismo id');

      // 7) Borrar una pieza elimina sus cables (con aviso) y deshacer los restaura
      await openWin(p, 'structure'); await p.locator('.rb-tree-name', {hasText: 'Driver L298N 1'}).click();
      await p.locator('.rb-context-toolbar button[aria-label="Borrar"]').dispatchEvent('click'); await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /cable/);
      assert.equal((await saved(p)).connections.length, 0); await p.locator('.rb-bar button[aria-label="Deshacer"]').dispatchEvent('click'); assert.equal((await saved(p)).connections.length, 1);
      step('borrar el driver elimina sus cables con aviso; deshacer los devuelve');

      // 8) Aviso (no bloqueo) al unir GND con una alimentación
      await closeWin(p, 'structure'); await closeWin(p, 'properties'); await closeWin(p, 'console'); await p.keyboard.press('Escape'); await dock(p, 'Encuadrar').click(); await p.waitForTimeout(700); await p.keyboard.press('w');
      const gnd = await pinAt(p, 'Arduino UNO R3 1', 'GND.1'), v12 = await pinAt(p, 'Driver L298N 1', '+12V');
      await p.mouse.click(gnd.x, gnd.y); await p.mouse.click(v12.x, v12.y); await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /GND con una alimentación/);
      assert.equal((await saved(p)).connections.length, 2, 'el error de cableado se permite: es didáctico');
      step('unir GND con +12V muestra un aviso pero crea el cable (errores didácticos permitidos)');
      await p.screenshot({path: `${out}/e3-${name}.png`});

      // 9) Recargar: los cables son idénticos
      const beforeReload = await saved(p); await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.wireCount?.() === 2, null, {timeout: 20000});
      assert.deepEqual((await saved(p)).connections, beforeReload.connections); step('recargar conserva los cables (deep equal) y los vuelve a dibujar');
      await ctx.close();
    }

    // 10) Robot cableado: diagnóstico, resaltado, voltaje editable y multímetro
    {
      PHONE = false;
      const {ctx, p} = await newContext(1440, 900, false, {projects: [wiredRobot], active: wiredRobot.id});
      await p.waitForFunction(() => window.__modoRobotics.wireCount() === 18, null, {timeout: 20000}); // el robot cableado se reabre con sus 18 cables
      assert.equal(await dock(p, 'Consola').getAttribute('data-badge'), '3', 'el dock avisa cuántos problemas hay');
      await openWin(p, 'console'); const items = p.locator('.rb-diag'); assert.equal(await items.count(), 3, 'con 6 V: UNO, driver y sensor sin alimentación');
      assert.ok((await items.allTextContents()).some(t => /Arduino UNO R3 1 no tiene alimentación: VIN recibe solo 6\.0 V/.test(t)), 'explica que 6 V no bastan para VIN');
      await items.first().click(); assert.equal(await p.locator('.rb-clear-highlight').count(), 1, 'resalta los pines del diagnóstico'); await p.keyboard.press('Escape');
      await dock(p, 'Cable').click(); assert.ok(await pinAt(p, 'Arduino UNO R3 1', 'VIN'), 'los pines implicados quedan visibles'); await dock(p, 'Seleccionar').click();
      // Voltaje de la batería editable (D-11): con 9 V todo arranca
      await openWin(p, 'structure'); await p.locator('.rb-tree-name', {hasText: 'Portapilas 4×AA 1'}).click(); await openWin(p, 'properties');
      assert.match(await p.locator(`${win('properties')} .rb-prop-number small`).textContent(), /Supuesto: 4×AA/); await setField(p, 'Voltaje (V)', 9);
      await openWin(p, 'console'); await p.locator('.rb-diag-ok').waitFor(); assert.equal(await dock(p, 'Consola').getAttribute('data-badge'), null);
      assert.match(await p.locator('.rb-diag-ok').textContent(), /Sin errores ni avisos/);
      pass('[escritorio] robot cableado: 3 avisos con 6 V (VIN necesita ≥ 7 V), se resaltan sus pines, y con 9 V editado en Propiedades el diagnóstico queda limpio');
      // Multímetro
      await closeWin(p, 'console'); await closeWin(p, 'properties'); await closeWin(p, 'structure'); await p.keyboard.press('Escape'); await dock(p, 'Encuadrar').click(); await p.waitForTimeout(900);
      await p.keyboard.press('m'); assert.equal(await dock(p, 'Medir').getAttribute('aria-pressed'), 'true');
      const bp = await pinAt(p, 'Portapilas 4×AA 1', 'B+'), bn = await pinAt(p, 'Portapilas 4×AA 1', 'B-'), v12 = await pinAt(p, 'Driver L298N 1', '+12V'), gnd = await pinAt(p, 'Arduino UNO R3 1', 'GND.1');
      await p.mouse.click(bp.x + 11, bp.y - 10); await p.mouse.click(bn.x - 10, bn.y + 11); await p.locator('.rb-tool-bar b').waitFor(); // pines aislados: se aciertan a ~15 px del centro (blanco de ≥ 30 px) assert.match(await p.locator('.rb-tool-bar').textContent(), /9,00 V/);
      await p.mouse.click(bp.x, bp.y); await p.mouse.click(v12.x, v12.y); assert.match(await p.locator('.rb-tool-bar').textContent(), /0,00 V.*continuidad ✔/);
      await p.mouse.click(v12.x, v12.y); await p.mouse.click(gnd.x, gnd.y); assert.match(await p.locator('.rb-tool-bar').textContent(), /9,00 V.*sin continuidad/);
      await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); assert.equal(await dock(p, 'Seleccionar').getAttribute('aria-pressed'), 'true');
      pass('[escritorio] multímetro: batería 9,00 V, continuidad B+↔+12V (0,00 V ✔) y +12V↔GND = 9,00 V sin continuidad; Esc suelta la herramienta');
      await p.screenshot({path: `${out}/e3-robot-cableado.png`});
      await ctx.close();
    }
    assert.deepEqual(report.errors, [], 'sin errores de consola ni de página'); pass('sin errores de consola ni de página');
  } finally { await browser.close(); fs.writeFileSync(`${out}/wiring-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
