// Industria, fase 7: Diagramas, PLC en escalera y HMI con ratón real, sobre el ejemplo marcha/paro (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(700);
    const stored = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    const view = name => p.locator('.ind-views').getByRole('button', {name, exact: true}).click();
    const settle = () => p.waitForTimeout(700);
    const sym = id => p.locator(`svg g[data-entity="${id}"]`);

    // 1) Ejemplo con PLC y HMI
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click();
    await p.getByRole('button', {name: /Ejemplo: marcha\/paro con PLC/}).click(); await p.waitForTimeout(900);
    let pr = await stored(); assert.equal(pr.version, 4); assert.equal(pr.plc.plc.rungs.length, 1); assert.equal(pr.hmi.widgets.length, 4);
    await p.getByRole('button', {name: 'Piezas', exact: true}).click(); // cierra la biblioteca
    pass('El ejemplo marcha/paro crea un proyecto v2 con programa de PLC y 4 widgets de HMI');

    // 2) Diagrama: mismos ids, un símbolo por componente eléctrico y un cable por conexión
    await view('Diagramas');
    const tab = name => p.getByRole('tab', {name}).click();
    assert.equal(await p.getByRole('tab').count(), 2); assert.equal(await p.locator('svg g[data-entity]').count(), 4, 'hoja 1 (fuerza): red, QF1, KM1 y motor'); assert.ok(await p.locator('svg g[data-ref]').count() >= 2, 'referencias a la hoja 2');
    const onP1 = await p.locator('svg g[data-connection]').count(); await tab(/Hoja 2/); assert.equal(await p.locator('svg g[data-entity]').count(), 6, 'hoja 2 (mando)'); assert.ok(await p.locator('svg g[data-ref]').count() >= 2); const onP2 = await p.locator('svg g[data-connection]').count();
    const refs = await p.locator('svg g[data-ref]').count(); assert.equal(onP1 + onP2 + refs, pr.connections.length, 'cada cable está en una hoja o es una referencia (una por cable entre hojas en cada hoja)'); await tab(/Hoja 1/);
    assert.equal(await p.locator('svg g[data-entity="placa"]').count(), 0);
    await sym('km1').locator('rect').click();
    assert.equal(await sym('km1').getAttribute('aria-pressed'), 'true'); assert.equal(await p.locator('.ind-path b').innerText(), 'KM1');
    await p.screenshot({path: out + '/vistas-1-diagrama.png'});
    pass('El diagrama se reparte en dos hojas (fuerza y mando) con referencias entre ellas; seleccionar KM1 lo selecciona en todo el proyecto');

    // 3) Mover un símbolo: se guarda, no mueve la pieza 3D, deshacer lo revierte, Ordenar lo recoloca
    const poses0 = JSON.stringify(pr.poses), r0 = await sym('km1').locator('rect').boundingBox();
    await p.mouse.move(r0.x + r0.width / 2, r0.y + r0.height / 2); await p.mouse.down(); await p.mouse.move(r0.x + r0.width / 2 + 160, r0.y + r0.height / 2 + 40, {steps: 8}); await p.mouse.up(); await settle();
    pr = await stored(); assert.ok(pr.symbols.km1 && pr.symbols.km1[0].page === 1); assert.equal(JSON.stringify(pr.poses), poses0, 'el diagrama no mueve la pieza 3D');
    const r1 = await sym('km1').locator('rect').boundingBox(); assert.ok(Math.abs(r1.x - r0.x) > 100, 'el símbolo se movió');
    await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(); assert.equal((await stored()).symbols.km1, undefined);
    await p.getByRole('button', {name: 'Rehacer'}).click(); await settle(); assert.ok((await stored()).symbols.km1);
    await p.getByRole('button', {name: 'Ordenar'}).click(); await settle(); pr = await stored(); assert.equal(Object.keys(pr.symbols).length, 10);
    pass('Mover un símbolo se guarda sin tocar la pose 3D, entra en Deshacer/Rehacer y «Ordenar» recoloca todo');

    // 4) PLC: variables y programa editables
    await view('PLC');
    assert.equal(await p.getByLabel('Variable de DI0').inputValue(), 'START'); assert.equal(await p.locator('.ind-rung').count(), 1); assert.equal(await p.locator('.ind-branch').count(), 3);
    await p.getByLabel('Nueva variable interna').fill('AUX'); await p.getByRole('button', {name: 'Añadir', exact: true}).click(); await settle();
    assert.ok((await stored()).plc.plc.memory.includes('AUX'));
    await p.getByLabel('Nueva variable interna').fill('9mala'); await p.getByLabel('Nueva variable interna').press('Enter');
    await p.locator('.rb-toast').filter({hasText: /debe empezar con letra/}).waitFor(); await p.locator('.rb-toast button').click();
    await p.getByLabel('Variable de la bobina nueva').selectOption('AUX'); await p.getByRole('button', {name: 'Añadir línea'}).click(); await settle();
    assert.equal((await stored()).plc.plc.rungs.length, 2);
    await p.getByLabel('Añadir contacto a la línea 2, rama 1').selectOption('START'); await settle();
    await p.getByRole('button', {name: 'START', exact: true}).last().click(); await settle(); // alterna a NC
    assert.equal((await stored()).plc.plc.rungs[1].branches[0][0].nc, true);
    await p.getByRole('button', {name: 'Eliminar la línea 2'}).click(); await settle(); assert.equal((await stored()).plc.plc.rungs.length, 1);
    await p.getByLabel('Variable de DI1').fill('PARO_FISICO'); await p.getByLabel('Variable de DI1').press('Enter'); await settle();
    const renamed = await stored(); assert.ok(renamed.bindings.some(x => x.target === 'PARO_FISICO')); assert.ok(renamed.plc.plc.rungs[0].branches[0].some(cn => cn.tag === 'PARO_FISICO'), 'el programa sigue a la variable renombrada');
    await p.getByLabel('Variable de DI1').fill('STOP'); await p.getByLabel('Variable de DI1').press('Enter'); await settle();
    await p.screenshot({path: out + '/vistas-2-plc.png'});
    pass('PLC: variables de E/S, variables internas con validación, líneas y contactos editables; renombrar arrastra el programa');

    // 5) HMI: añadir widget
    await view('HMI');
    assert.equal(await p.locator('.ind-widget').count(), 4);
    const form = p.getByRole('group', {name: 'Nuevo widget'}), fld = name => form.locator('label.ind-field').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('select, input');
    await fld('Tipo').selectOption('lamp'); await fld('Texto').fill('AUX'); await fld('Variable').selectOption('AUX'); await form.getByRole('button', {name: 'Añadir widget'}).click(); await settle();
    assert.equal((await stored()).hmi.widgets.length, 5);
    await fld('Tipo').selectOption('button'); assert.equal(await fld('Variable').locator('option', {hasText: 'MOTOR'}).count(), 0, 'un botón solo ofrece variables internas');
    await p.getByRole('button', {name: 'Quitar el widget AUX'}).click(); await settle(); assert.equal((await stored()).hmi.widgets.length, 4);
    pass('HMI: se añaden y quitan widgets; los botones solo ofrecen variables internas');

    // 6) Simulación con PLC: interruptores desde el diagrama, S1 físico, sello, HMI
    await p.getByRole('button', {name: 'Ejecutar'}).click();
    await view('Diagramas'); await p.getByRole('tab', {name: /Hoja 1/}).click(); await sym('qf1').locator('rect').click(); await p.getByRole('tab', {name: /Hoja 2/}).click(); await sym('qf2').locator('rect').click(); await p.waitForTimeout(300);
    assert.ok(await p.locator('svg g[data-connection][data-live=true]').count() > 5, 'hay cables con tensión');
    await view('PLC'); assert.equal(await p.locator('.ind-chipstate').first().innerText(), 'Alimentado');
    const s1 = (await (async () => { await view('Diagramas'); await p.getByRole('tab', {name: /Hoja 2/}).click(); return sym('s1').locator('rect').boundingBox(); })());
    await p.mouse.move(s1.x + s1.width / 2, s1.y + s1.height / 2); await p.mouse.down(); await p.waitForTimeout(250);
    await view('PLC'); // cambiar de vista suelta el ratón en el navegador, pero el valor ya se leyó pulsado
    await p.mouse.up(); await p.waitForTimeout(300);
    assert.equal(await p.getByLabel('Valor de DO0').innerText(), '1', 'el sello mantiene la salida tras soltar S1'); assert.equal(await p.locator('.ind-rung[data-on=true]').count(), 1);
    await p.screenshot({path: out + '/vistas-3-plc-marcha.png'});
    await view('HMI'); assert.equal(await p.locator('.ind-lamp[data-on=true]').count(), 1);
    const paro = p.getByRole('button', {name: 'PARO', exact: true}), pb = await paro.boundingBox();
    await p.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up(); await p.waitForTimeout(250);
    assert.equal(await p.locator('.ind-lamp[data-on=true]').count(), 0, 'PARO desde la HMI apaga el motor');
    const marcha = p.getByRole('button', {name: 'MARCHA', exact: true}), mb = await marcha.boundingBox();
    await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up(); await p.waitForTimeout(250);
    assert.equal(await p.locator('.ind-lamp[data-on=true]').count(), 1, 'MARCHA desde la HMI arranca y el sello mantiene');
    await p.screenshot({path: out + '/vistas-4-hmi.png'});
    pass('Con la simulación en marcha: S1 físico arranca, el sello mantiene la salida, la HMI para y arranca el motor, y el programa se ilumina');

    // 7) En simulación el programa y la HMI quedan protegidos; el proyecto guardado no cambia al operar
    await view('PLC'); assert.ok(await p.getByLabel('Variable de DI0').isDisabled()); assert.ok(await p.getByLabel('Nueva variable interna').isDisabled());
    const saved = JSON.stringify(await stored()); await p.waitForTimeout(500); assert.equal(JSON.stringify(await stored()), saved);
    await p.getByRole('button', {name: 'Construir'}).click(); assert.ok(!(await p.getByLabel('Variable de DI0').isDisabled()));
    pass('En Simulación el programa está protegido y operar no cambia el proyecto guardado');

    // 8) Persistencia y tablet
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await settle();
    const after = await stored(); assert.equal(after.plc.plc.rungs.length, 1); assert.equal(after.hmi.widgets.length, 4);
    await p.setViewportSize({width: 820, height: 1000}); await view('PLC'); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await p.screenshot({path: out + '/vistas-5-tablet.png'});
    pass('Recargar conserva programa y HMI; sin desbordes en tablet');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/vistas-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
