// Robótica · etapa 4 (interfaz): escribir un sketch, compilarlo (servicio local de desarrollo), ejecutarlo y ver el LED en 3D;
// cambiar el programa cambia la señal; sin cable o sin batería falla de forma observable; guardar/recargar conserva el programa.
// Necesita el servidor de DESARROLLO (npm run dev) con arduino-cli en .cache/arduino-cli.  Uso: PANELLAB_URL=http://127.0.0.1:4326 node qa/verify-robotics-code-ui.cjs
const fs = require('node:fs'), assert = require('node:assert/strict');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://127.0.0.1:4326').replace(/\/$/, ''), out = 'qa/robotics';
fs.mkdirSync(out, {recursive: true});
const report = {url: base, checks: [], errors: []};
const pass = s => { report.checks.push(s); console.log('PASS', s); };
const dock = (p, label) => p.locator(`.rb-dock button[aria-label="${label}"]`);
const win = id => `.rb-window-${id}`;
const TITLES = {parts: 'Piezas', structure: 'Estructura', properties: 'Propiedades', code: 'Programación', console: 'Consola'};
async function openWin(p, id) { if (!(await p.locator(win(id)).count())) await dock(p, TITLES[id]).click(); await p.locator(win(id)).waitFor(); }
const closeWin = async (p, id) => { if (await p.locator(win(id)).count()) await p.locator(`${win(id)} button[aria-label="Cerrar ${TITLES[id]}"]`).dispatchEvent('click'); };
const saved = async p => { await p.waitForTimeout(250); await p.waitForFunction(() => /Guardado/.test(document.querySelector('.rb-name small')?.textContent || '') && localStorage.getItem('modo-robotica-v1') !== null, null, {timeout: 15000}); await p.waitForTimeout(150); return p.evaluate(() => { const lib = JSON.parse(localStorage.getItem('modo-robotica-v1')); return lib.projects.find(x => x.id === lib.active); }); };
const chip = p => p.locator('.rb-sim-chip');
const SKETCH = ms => `void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n  Serial.println("hola desde el programa");\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(${ms});\n  digitalWrite(13, LOW);\n  delay(${ms});\n}\n`;
async function setCode(p, text) { await openWin(p, 'code'); await p.locator('.cm-content').click(); await p.keyboard.press('Control+a'); await p.keyboard.insertText(text); }
/** Muestrea el brillo REAL del LED dibujado (material de la malla 3D) durante `ms` y cuenta los cambios de apagado↔encendido. */
async function sampleLed(p, led, ms) { return p.evaluate(async ({led, ms}) => { const v = []; const end = performance.now() + ms; while (performance.now() < end) { v.push(window.__modoRobotics.ledGlow(led)); await new Promise(r => setTimeout(r, 25)); } let toggles = 0; for (let i = 1; i < v.length; i++) if ((v[i] > 0.3) !== (v[i - 1] > 0.3)) toggles++; return {toggles, max: Math.max(...v), min: Math.min(...v), samples: v.length}; }, {led, ms}); }

(async () => {
  const {buildRobot2wd, wireRobot2wd, withLedAnd9V} = await import('./robotics/robot2wd.mjs');
  const built = buildRobot2wd(), {project, led} = await withLedAnd9V({project: await wireRobot2wd(built), ids: built.ids});
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  try {
    const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', reducedMotion: 'reduce'});
    await ctx.addInitScript(l => { if (!localStorage.getItem('modo-robotica-v1')) localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
    const p = await ctx.newPage(); p.on('pageerror', e => report.errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) report.errors.push(m.text()); });
    await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor(); await p.waitForFunction(() => window.__modoRobotics?.partIds?.().length === 13, null, {timeout: 20000});
    await dock(p, 'Encuadrar').click(); await p.waitForTimeout(700);
    assert.equal(await chip(p).textContent(), 'DETENIDO'); assert.equal(await p.locator('.rb-sim button[aria-label="Detener"]').isDisabled(), true);

    // 1) Ventana Programación: placa de destino, plantilla y estado «sin compilar»
    await openWin(p, 'code'); await p.locator('.cm-editor').waitFor();
    assert.match(await p.locator('select[aria-label="Placa de destino"] option:checked').textContent(), /Arduino UNO R3 1/);
    assert.match(await p.locator('.cm-content').textContent(), /void setup/); assert.match(await p.locator('.cm-gutters').textContent(), /1/);
    assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'none');
    await p.waitForFunction(() => document.querySelector('button[aria-label="Compilar"]') && !document.querySelector('button[aria-label="Compilar"]').disabled, null, {timeout: 15000});
    pass('la ventana Programación muestra la placa de destino, la plantilla setup()/loop() con números de línea y «Sin compilar»; el compilador local está disponible');

    // 2) Aislamiento: Ctrl+Z del editor no deshace el proyecto y la rueda no toca la cámara
    await p.locator('.cm-content').click(); await p.keyboard.press('Control+a'); await p.keyboard.insertText('// prueba\n'); await p.keyboard.press('Control+z');
    assert.doesNotMatch(await p.locator('.cm-content').textContent(), /prueba/, 'Ctrl+Z deshizo el texto del editor'); assert.equal(await p.locator('.rb-bar button[aria-label="Deshacer"]').isDisabled(), true, 'el historial del proyecto sigue intacto');
    const camBefore = await p.evaluate(() => window.__modoRobotics.camera()); const box = await p.locator('.rb-code-editor').boundingBox(); await p.mouse.move(box.x + 80, box.y + 80); await p.mouse.wheel(0, 400); await p.waitForTimeout(300);
    assert.equal((await p.evaluate(() => window.__modoRobotics.camera())).distance, camBefore.distance, 'la rueda sobre el editor no hace zoom en el lienzo');
    pass('Ctrl+Z dentro del editor deshace el texto, no el proyecto; la rueda sobre el código no mueve la cámara');

    // 3) Sin compilar no se ejecuta: aviso claro
    await setCode(p, SKETCH(1000)); await p.waitForTimeout(300);
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /Todavía no hay un programa compilado/); assert.equal(await chip(p).textContent(), 'DETENIDO');
    pass('con el programa sin compilar, ▶ no ejecuta y explica qué falta');

    // 4) Compilar, errores en español con línea, y compilar de verdad
    await setCode(p, 'void setup() {\n  int x = 5\n  pinMode(13, OUTPUT);\n}\nvoid loop() { digitalWrite(13, HIGH) }\n'); await p.locator('button[aria-label="Compilar"]').click();
    await p.locator('.rb-code-errors').waitFor({timeout: 30000}); const errs = await p.locator('.rb-code-errors li').allTextContents(); assert.ok(errs.some(t => /Línea 3.*Falta/.test(t)) && errs.some(t => /Línea 5.*Falta un «;»/.test(t)), errs.join(' | '));
    await p.waitForSelector('.cm-lintRange-error, .cm-lint-marker-error', {timeout: 5000}); await p.locator('.rb-code-errors button').first().click();
    await setCode(p, SKETCH(1000)); await p.locator('button[aria-label="Compilar"]').click(); await p.waitForFunction(() => document.querySelector('.rb-code-status')?.dataset.status === 'fresh', null, {timeout: 45000});
    assert.match(await p.locator('.rb-code-info').textContent(), /Compilado: \d+ bytes/); assert.equal(await p.locator('.rb-code-errors').count(), 0);
    pass('un error de sintaxis se traduce a español y marca la línea (3 y 5, con marcas en el editor); el sketch correcto se compila (estado «Compilado»)');

    // 5) Ejecutar: el LED parpadea en 3D con el programa; Serie muestra el texto
    await closeWin(p, 'code'); await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); assert.equal(await chip(p).textContent(), 'EN MARCHA');
    const slow = await sampleLed(p, led, 3600); assert.ok(slow.max > 0.5 && slow.min < 0.05, `el LED se enciende y se apaga en el 3D (${slow.min}…${slow.max})`); assert.ok(slow.toggles >= 2 && slow.toggles <= 5, `delay(1000): ${slow.toggles} cambios en 3,6 s`);
    await openWin(p, 'console'); await p.locator('button[role=tab]', {hasText: 'Serie y estado'}).click(); await p.locator('.rb-serial-out').waitFor(); assert.match(await p.locator('.rb-serial-out').textContent(), /hola desde el programa/);
    assert.match(await p.locator('.rb-state-list').textContent(), /LED 5 mm 1: (encendido|apagado)/); assert.match(await p.locator('.rb-state-list').textContent(), /Placa: alimentada \(por VIN\)/);
    await p.screenshot({path: `${out}/e4-led.png`});
    pass('al ejecutar, el LED del lienzo 3D se enciende y apaga siguiendo D13 (brillo real del material); el monitor serie muestra «hola desde el programa»');

    // 6) Cambiar el programa cambia la señal (delay 200 → ~5× más cambios)
    await p.locator('.rb-sim button[aria-label="Detener"]').click(); assert.equal(await chip(p).textContent(), 'DETENIDO'); assert.equal(await p.evaluate(id => window.__modoRobotics.ledGlow(id), led), 0, 'al detener el LED se apaga');
    await closeWin(p, 'console'); await setCode(p, SKETCH(200)); await p.waitForTimeout(300); assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'stale'); assert.match(await p.locator('.rb-code-advice').textContent(), /hay que recompilar/);
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); assert.match(await p.locator('.rb-toast').textContent(), /recompilar/); assert.equal(await chip(p).textContent(), 'DETENIDO', 'no se ejecuta un programa que no es el que se ve');
    await p.locator('button[aria-label="Compilar"]').click(); await p.waitForFunction(() => document.querySelector('.rb-code-status')?.dataset.status === 'fresh', null, {timeout: 45000}); await closeWin(p, 'code');
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); const fast = await sampleLed(p, led, 3600); assert.ok(fast.toggles >= 2 * slow.toggles && fast.toggles >= 8, `delay(200): ${fast.toggles} cambios (antes ${slow.toggles})`);
    pass(`cambiar delay(1000) por delay(200) cambia la señal (${slow.toggles} → ${fast.toggles} cambios en 3,6 s); con código distinto del compilado ▶ pide recompilar`);

    // 7) Pausa, velocidad y detener
    await p.locator('.rb-sim button[aria-label="Pausar"]').click(); assert.equal(await chip(p).textContent(), 'PAUSA'); await p.waitForTimeout(300); /* deja llegar el último cuadro en vuelo */ const frozen = await sampleLed(p, led, 900); assert.equal(frozen.toggles, 0, 'en pausa el LED no cambia');
    await p.locator('.rb-sim button[aria-label="Reanudar"]').click(); assert.equal(await chip(p).textContent(), 'EN MARCHA');
    // El tiempo virtual (monitor de estado) avanza al ritmo pedido: ×1 ≈ 1 s por segundo real; ×4 bastante más rápido (el LED parpadea más deprisa de lo que se repinta, por eso se mide el reloj)
    await openWin(p, 'console'); await p.locator('button[role=tab]', {hasText: 'Serie y estado'}).click();
    const vt = async () => Number((await p.locator('.rb-sim-state').textContent()).match(/tiempo virtual ([\d,]+) s/)[1].replace(',', '.'));
    const t0 = await vt(); await p.waitForTimeout(2000); const d1 = (await vt()) - t0;
    await p.locator('select[aria-label="Velocidad de simulación"]').selectOption('4'); await p.waitForTimeout(400); const t1 = await vt(); await p.waitForTimeout(2000); const d4 = (await vt()) - t1;
    assert.ok(d1 > 1.4 && d1 < 2.6, `a ×1 el reloj avanza ~2 s en 2 s reales (${d1.toFixed(1)})`); const lagging = (await chip(p).textContent()) === 'LENTA'; assert.ok(d4 > d1 * 1.5 || (lagging && d4 > d1 * 0.9), `a ×4 avanza más rápido (${d4.toFixed(1)} s vs ${d1.toFixed(1)} s) o, si el equipo no alcanza, lo dice con «LENTA» (${lagging})`); report.speed = {x1: +d1.toFixed(2), x4: +d4.toFixed(2), lenta: lagging};
    await p.locator('select[aria-label="Velocidad de simulación"]').selectOption('1'); await closeWin(p, 'console');
    pass(`pausa congela el LED, reanudar sigue y la velocidad ×4 acelera el reloj virtual (${d4.toFixed(1)} s frente a ${d1.toFixed(1)} s en 2 s reales)`);

    // 8) Sin cable → no enciende; el cambio de proyecto detiene la simulación
    await openWin(p, 'console'); await p.locator('button[role=tab]', {hasText: 'Diagnóstico'}).click(); await p.locator('.rb-wire-pick', {hasText: 'Cátodo'}).click();
    assert.equal(await chip(p).textContent(), 'EN MARCHA', 'seleccionar un cable no detiene la simulación');
    await openWin(p, 'properties'); await p.locator(`${win('properties')} button`, {hasText: 'Borrar cable'}).click();
    await p.waitForFunction(() => document.querySelector('.rb-sim-chip')?.textContent === 'DETENIDO'); await p.locator('.rb-toast').waitFor(); assert.match(await p.locator('.rb-toast').textContent(), /proyecto cambió/);
    await closeWin(p, 'properties'); await closeWin(p, 'console');
    await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); const dark = await sampleLed(p, led, 2200); assert.ok(dark.max < 0.02 && dark.toggles === 0, `sin el cable del cátodo el LED no se enciende (máx ${dark.max})`);
    pass('al cambiar el proyecto la simulación se detiene con aviso; sin el cable del cátodo el programa corre pero el LED no enciende');

    // 9) Sin alimentación: el UNO no corre y se explica
    await p.locator('.rb-sim button[aria-label="Detener"]').click(); await openWin(p, 'console'); await p.locator('button[role=tab]', {hasText: 'Diagnóstico'}).click();
    for (const pin of ['VIN', '12V']) { const items = p.locator('.rb-wire-pick', {hasText: pin === 'VIN' ? 'VIN' : '+12V'}); while (await items.count()) { await items.first().click(); await openWin(p, 'properties'); await p.locator(`${win('properties')} button`, {hasText: 'Borrar cable'}).click(); await openWin(p, 'console'); } }
    await closeWin(p, 'properties'); await closeWin(p, 'console'); await p.locator('.rb-sim button[aria-label="Ejecutar"]').click(); await openWin(p, 'console'); await p.locator('button[role=tab]', {hasText: 'Serie y estado'}).click(); await p.waitForTimeout(600);
    assert.match(await p.locator('.rb-serial').textContent(), /SIN alimentación|no tiene alimentación/); assert.equal(await p.locator('.rb-serial-out').textContent(), '(sin salida todavía)', 'sin alimentación no sale nada por el puerto serie'); await p.locator('.rb-sim button[aria-label="Detener"]').click();
    pass('sin alimentación (VIN y +12 V desconectados) el UNO no corre: sin salida serie y el estado dice «SIN alimentación»');

    // 10) Guardar y recargar: el sketch y el programa compilado se conservan
    await closeWin(p, 'console'); const before = await saved(p), fw = before.firmware[0];
    assert.ok(fw.source.includes('delay(200)') && fw.artifact?.hex?.startsWith(':') && fw.artifact.origin === 'remote-compiler' && /^[0-9a-f]{64}$/.test(fw.artifact.sourceHash));
    await p.reload(); await p.locator('.rb-app[data-ready=true]').waitFor(); await openWin(p, 'code'); await p.locator('.cm-editor').waitFor(); assert.match(await p.locator('.cm-content').textContent(), /delay\(200\)/); assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'fresh');
    assert.deepEqual((await saved(p)).firmware, before.firmware, 'el programa y su artefacto son idénticos tras recargar');
    pass('recargar conserva el sketch y el programa compilado (sourceHash SHA-256 coincide: «Compilado», sin recompilar)');

    // 11) Importar un .hex (sin compilador): estado «importado» y se ejecuta
    await p.locator('input[aria-label="Importar .hex"]').setInputFiles('qa/fixtures/robotica/blink_200.hex'); await p.waitForFunction(() => document.querySelector('.rb-code-status')?.dataset.status === 'imported'); assert.equal((await saved(p)).firmware[0].artifact.origin, 'hex-import');
    await p.locator('input[aria-label="Importar .hex"]').setInputFiles({name: 'malo.hex', mimeType: 'text/plain', buffer: Buffer.from(':1000000000000000000000000000000000000000AA\n:00000001FF\n')}); await p.locator('.rb-code-info').waitFor(); assert.match(await p.locator('.rb-code-info').textContent(), /suma de control/);
    assert.equal(await p.locator('.rb-code-status').getAttribute('data-status'), 'imported', 'un .hex dañado no pisa el programa anterior');
    pass('importar un .hex lo deja como «Programa importado»; un .hex dañado se rechaza (suma de control) sin pisar el anterior');

    assert.deepEqual(report.errors, [], 'sin errores de consola ni de página'); pass('sin errores de consola ni de página');
    await ctx.close();
  } finally { await browser.close(); fs.writeFileSync(`${out}/code-ui-verification.json`, JSON.stringify(report, null, 2)); }
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
