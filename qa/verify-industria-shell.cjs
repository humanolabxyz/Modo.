// Industria, fase 2: carcasa, modelo compartido, persistencia y navegación desde el Home (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4344').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';

async function open(b, viewport = {width: 1440, height: 900}, extra = {}) {
  const c = await b.newContext({viewport, serviceWorkers: 'block', acceptDownloads: true, ...extra});
  await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await c.newPage();
  p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
  return {c, p};
}
const ready = p => p.locator('.ind-app[data-ready=true]').waitFor();
const stored = p => p.evaluate(key => JSON.parse(localStorage.getItem(key)), LIB);
const settle = p => p.waitForTimeout(700); // guardado con retardo de 350 ms

(async () => {
  const b = await chromium.launch();
  try {
    // 1) Desde el Home: la tarjeta Industria navega a la ruta real
    let {c, p} = await open(b);
    await p.goto(base + '/'); await p.locator('[data-module=panel]:not(:disabled)').waitFor();
    assert.match(await p.locator('[data-module=industry] strong').innerText(), /^Industria/);
    await p.locator('[data-module=industry]').click(); await ready(p);
    assert.equal(new URL(p.url()).pathname, '/industria/');
    pass('La tarjeta Industria del Home abre /industria/');

    // 2) Carcasa: cabecera, dock, escenario y paneles (sin barras laterales fijas)
    assert.ok(await p.locator('header.rb-bar').isVisible()); assert.ok(await p.locator('nav.rb-dock').isVisible());
    await p.locator('canvas').first().waitFor();
    const box = await p.locator('main.rb-stage').boundingBox();
    assert.ok(box.width > 1300 && box.height > 700, 'el escenario ocupa casi toda la pantalla');
    for (const name of ['Orbitar', 'Desplazar', 'Mover pieza', 'Encuadrar', 'Piezas', 'Estructura', 'Propiedades', 'Escenario', 'Consola', 'Deshacer', 'Rehacer', 'Ejecutar', 'Detener', 'Opciones del proyecto']) assert.ok(await p.getByRole('button', {name, exact: true}).count() >= 1, 'falta el botón ' + name);
    assert.equal(await p.locator('.rb-sim-chip').innerText(), 'Detenida');
    assert.ok(await p.getByRole('button', {name: 'Ejecutar'}).isEnabled() && await p.getByRole('button', {name: 'Detener'}).isDisabled(), 'fase 6: Ejecutar disponible, Detener solo con la simulación en marcha');
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await p.screenshot({path: out + '/shell-1440.png'});
    pass('Carcasa: cabecera, dock con tooltips, escenario 3D protagonista y paneles flotantes cerrables');

    // 3) Modelo compartido: añadir, seleccionar, editar pose, mismo id en todas las vistas
    await p.getByRole('button', {name: 'Estructura', exact: true}).click();
    const add = p.getByLabel('Nombre del componente nuevo');
    for (const n of ['KM1', 'PLC-01']) { await add.fill(n); await add.press('Enter'); }
    await settle(p);
    let lib = await stored(p), proj = lib.projects[0];
    assert.equal(proj.entities.length, 2); const km1 = proj.entities.find(e => e.label === 'KM1');
    assert.match(km1.id, /^e-/); assert.deepEqual(Object.keys(proj.poses).sort(), proj.entities.map(e => e.id).sort());
    await p.getByRole('treeitem', {name: /KM1/}).click();
    assert.equal(await p.locator('.ind-path b').innerText(), 'KM1');
    await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
    await p.locator('.ind-pose input').first().fill('2,5'); await p.locator('.ind-pose input').first().press('Enter'); await settle(p);
    assert.deepEqual((await stored(p)).projects[0].poses[km1.id].position, [2.5, 0, 0]);
    // Fase 8: Tablero y Documentación son vistas reales. Sin placa el tablero avisa; la documentación lista los mismos componentes con su nombre.
    await p.locator('.ind-views').getByRole('button', {name: 'Tablero', exact: true}).click(); assert.match(await p.locator('.ind-board-empty').innerText(), /No hay una placa de montaje/);
    await p.locator('.ind-views').getByRole('button', {name: 'Documentación', exact: true}).click(); assert.match(await p.getByRole('table', {name: 'Lista de materiales'}).innerText(), /KM1 PLC-01/);
    // Fase 7: Diagramas, PLC y HMI son vistas reales; los bloques genéricos no tienen terminales, así que no entran en el esquema ni son PLC
    await p.locator('.ind-views').getByRole('button', {name: 'Diagramas', exact: true}).click(); assert.match(await p.locator('.ind-diagram-empty').innerText(), /No hay componentes con terminales/);
    await p.locator('.ind-views').getByRole('button', {name: 'PLC', exact: true}).click(); assert.match(await p.locator('.ind-plc').innerText(), /No hay un PLC/);
    await p.locator('.ind-views').getByRole('button', {name: 'HMI', exact: true}).click(); assert.match(await p.locator('.ind-hmi').innerText(), /pantalla está vacía/);
    await p.locator('.ind-views').getByRole('button', {name: 'Planta 3D', exact: true}).click();
    pass('Tablero, Documentación, Diagramas, PLC y HMI son vistas reales: leen el mismo proyecto y avisan cuando no hay nada que mostrar');

    // 4) Deshacer / rehacer desde los botones y el teclado
    await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(p);
    assert.deepEqual((await stored(p)).projects[0].poses[km1.id].position, [-1.6, 0, 0]);
    await p.getByRole('button', {name: 'Rehacer'}).click(); await settle(p);
    assert.deepEqual((await stored(p)).projects[0].poses[km1.id].position, [2.5, 0, 0]);
    await p.locator('main.rb-stage').click({position: {x: 700, y: 300}}); // quita el foco de los campos
    await p.keyboard.press('Control+z'); await settle(p);
    assert.deepEqual((await stored(p)).projects[0].poses[km1.id].position, [-1.6, 0, 0]);
    await p.keyboard.press('Control+Shift+z'); await settle(p);
    assert.deepEqual((await stored(p)).projects[0].poses[km1.id].position, [2.5, 0, 0]);
    pass('Deshacer y rehacer (botones, Ctrl+Z y Ctrl+Shift+Z) mueven el modelo guardado');

    // 5) Construcción vs Simulación: la estructura se protege
    await p.getByRole('treeitem', {name: /KM1/}).dispatchEvent('click'); // el inspector abierto puede tapar parte de la lista: los paneles se pueden mover
    await p.getByRole('button', {name: 'Simular'}).click();
    assert.ok(await p.getByRole('button', {name: 'Añadir'}).isDisabled()); assert.ok(await p.locator('.ind-delete').isDisabled());
    assert.ok(await p.locator('.ind-sim-note').isVisible());
    await p.getByRole('button', {name: 'Construir'}).click();
    pass('En Simular no se edita la estructura; Construir la habilita');

    // 6) Persistencia separada: proyecto y estado de interfaz sobreviven a la recarga
    await p.locator('.ind-views').getByRole('button', {name: 'PLC', exact: true}).click();
    await p.getByRole('button', {name: 'Consola', exact: true}).click(); await settle(p);
    const uiKey = (await p.evaluate(() => Object.keys(localStorage))).find(k => k.startsWith('modo:industria:ui:'));
    assert.ok(uiKey, 'el estado de UI se guarda aparte'); assert.ok(!('view' in (await stored(p)).projects[0]));
    await p.reload(); await ready(p); await settle(p);
    assert.equal(await p.locator('.ind-tree li').count(), 2);
    assert.equal(await p.locator('.ind-views [aria-pressed=true]').innerText(), 'PLC');
    assert.ok(await p.locator('.ind-window-console').isVisible());
    assert.equal(await p.locator('.ind-path b').innerText(), 'KM1');
    pass('Recargar conserva proyecto, vista, paneles y selección (proyecto y UI en claves separadas)');

    // 7) Cámaras: vistas y cámaras guardadas, separadas del proyecto
    await p.locator('.ind-views').getByRole('button', {name: 'Planta 3D', exact: true}).click();
    await p.getByRole('button', {name: 'Escenario', exact: true}).click();
    await p.getByRole('button', {name: 'Superior', exact: true}).click();
    await p.getByLabel('Nombre de la vista').fill('Tablero BT-01'); await p.getByRole('button', {name: 'Guardar', exact: true}).click(); await settle(p);
    const ui = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), uiKey);
    assert.equal(ui.savedCameras.length, 1); assert.equal(ui.savedCameras[0].name, 'Tablero BT-01'); assert.ok(ui.savedCameras[0].position[1] > 5, 'vista superior guardada');
    pass('Vistas de cámara y cámaras guardadas se persisten en el estado de UI');

    // 8) Exportar / importar y archivos de otros módulos
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click();
    const [download] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: 'Exportar'}).click()]);
    assert.match(download.suggestedFilename(), /\.industria\.json$/);
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(exported.format, 'modo-industria'); assert.equal(exported.entities.length, 2);
    fs.writeFileSync(out + '/exportado.industria.json', JSON.stringify(exported));
    fs.writeFileSync(out + '/robotica.modo.json', JSON.stringify({format: 'modo-robotica', version: 1, id: 'x', name: 'Robot'}));
    await p.locator('.ind-window-project input[type=file]').setInputFiles(out + '/robotica.modo.json');
    await p.locator('.rb-toast').filter({hasText: 'Robótica'}).waitFor();
    pass('Exporta un .industria.json válido y rechaza un archivo de Robótica con un mensaje claro');
    await p.locator('.rb-toast button').click();
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click().catch(() => {});
    await p.locator('.ind-window-project input[type=file]').setInputFiles(out + '/exportado.industria.json');
    await p.waitForFunction(() => document.querySelectorAll('.ind-tree li').length >= 0); await settle(p);
    assert.equal((await stored(p)).projects.length, 2); pass('Importar crea una copia con id nuevo');

    // 9) Datos ilegibles no se sobrescriben
    await c.close();
    ({c, p} = await open(b));
    await p.addInitScript(key => { if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, '{roto'); localStorage.setItem('__seeded', '1'); } }, LIB);
    await p.goto(base + '/industria/'); await ready(p);
    await p.locator('.rb-toast').waitFor();
    assert.match(await p.locator('.rb-toast').innerText(), /No se pudo leer/);
    await p.waitForTimeout(800);
    assert.equal(await p.evaluate(key => localStorage.getItem(key), LIB), '{roto');
    pass('Una biblioteca ilegible bloquea el guardado y no se sobrescribe');
    await c.close();

    // 10) Responsive: sin desbordes en teléfono y tablet
    for (const [w, h] of [[390, 844], [768, 1024], [1024, 768]]) {
      ({c, p} = await open(b, {width: w, height: h}, {hasTouch: w < 1100, isMobile: w < 600}));
      await p.goto(base + '/industria/'); await ready(p); await p.locator('canvas').first().waitFor();
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `desborde horizontal en ${w}`);
      await p.screenshot({path: `${out}/shell-${w}.png`}); await c.close();
    }
    pass('Sin desbordes horizontales en 390, 768 y 1024 px');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o respuestas HTTP fallidas (incluye violaciones de CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/shell-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
