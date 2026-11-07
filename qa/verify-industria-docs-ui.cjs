// Industria, fase 8: Tablero, Documentación y Fallas/diagnóstico con ratón real (Playwright; servidor en INDUSTRIA_URL).
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
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', acceptDownloads: true});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(700);
    const stored = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    const view = name => p.locator('.ind-views').getByRole('button', {name, exact: true}).click();
    const settle = () => p.waitForTimeout(700);
    const panel = async name => p.getByRole('button', {name, exact: true}).click();
    const field = (scope, name) => scope.locator('label.ind-field').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('select, input');

    await p.getByRole('button', {name: 'Opciones del proyecto'}).click();
    await p.getByRole('button', {name: /Ejemplo: marcha\/paro con PLC/}).click(); await p.waitForTimeout(900);
    await panel('Piezas'); // cierra la biblioteca
    const pr = await stored();

    // 1) Tablero
    await view('Tablero');
    assert.equal(await p.locator('svg g[data-device]').count(), 10);
    assert.match(await p.locator('.ind-board').innerText(), /Fuera del tablero: .*M1.*Red 3F|Fuera del tablero: .*Red 3F.*M1/);
    assert.match(await p.locator('.ind-board svg text.ind-sym-label').first().textContent(), /Placa · 800 × 1000 mm/);
    await p.locator('svg g[data-device="km1"] rect').click(); assert.equal(await p.locator('svg g[data-device="km1"]').getAttribute('aria-pressed'), 'true'); assert.equal(await p.locator('.ind-path b').innerText(), 'KM1');
    const filled = await p.locator('svg g[data-device="plc"] circle').evaluateAll(cs => cs.filter(x => x.getAttribute('fill') === '#14181f').length); assert.equal(filled, 5, 'L+, M, DI0, DI1 y DO0 tienen cable');
    await p.screenshot({path: out + '/docs-1-tablero.png'});
    pass('Tablero: alzado de la placa con 10 elementos (2 rieles y 8 aparatos), terminales con cable rellenos, y selección compartida');

    // 2) Documentación
    await view('Documentación');
    const bom = p.getByRole('table', {name: 'Lista de materiales'}); assert.ok(await bom.locator('tr', {hasText: 'Pulsador NA'}).locator('td').first().innerText() === '2');
    assert.ok((await bom.innerText()).includes('Genérico · no verificado'));
    assert.equal(await p.getByRole('table', {name: 'Lista de cables'}).locator('tbody tr').count(), pr.connections.length);
    assert.match(await p.getByLabel('Programa de PLC').innerText(), /START Y \/STOP Y \/HMI_STOP[\s\S]*→\s+\( \) MOTOR/);
    assert.equal(await p.getByRole('table', {name: 'Entradas y salidas'}).locator('tbody tr').count(), 8);
    const [md] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: /Documento \(\.md\)/}).click()]);
    assert.match(md.suggestedFilename(), /\.documentacion\.md$/); const mdText = fs.readFileSync(await md.path(), 'utf8'); assert.ok(mdText.includes('## 2. Lista de cables') && mdText.includes('| W001 | Red 3F.L1 | QF1.1 |') && mdText.includes('no están verificadas'));
    const [csv] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: /Cables \(\.csv\)/}).click()]); const csvText = fs.readFileSync(await csv.path(), 'utf8').replace(/^\uFEFF/, ''); assert.ok(csvText.startsWith('N.º,Desde,Hasta,Tipo,Estado,Red,Etiqueta,Notas')); assert.equal(csvText.trim().split('\r\n').length, pr.connections.length + 1);
    await p.screenshot({path: out + '/docs-2-documentacion.png'});
    pass('Documentación: materiales (todo genérico), cables, E/S, programa y redes; descarga .md y .csv completos');

    // 3) Inyectar una falla
    await view('Planta 3D'); await panel('Fallas');
    const form = p.getByRole('group', {name: 'Nueva falla'});
    await field(form, 'Falla').selectOption('wire-open');
    await field(form, 'Cable').selectOption({label: 'PLC · DO0 → KM1 · A1'}); await form.getByRole('button', {name: 'Inyectar falla'}).click(); await settle();
    let st = await stored(); assert.equal(st.faults.length, 1); assert.equal(st.faults[0].kind, 'wire-open');
    assert.match(await p.getByRole('list', {name: 'Fallas aplicadas'}).innerText(), /Cable abierto: PLC\.DO0 → KM1\.A1/);
    await field(form, 'Falla').selectOption('coil-open'); assert.equal(await field(form, 'Componente').locator('option').count(), 2, 'la bobina solo se ofrece para contactores (+ la opción vacía)');
    await field(form, 'Falla').selectOption('lamp-open'); assert.equal(await field(form, 'Componente').locator('option').count(), 1, 'no hay pilotos en este proyecto');
    pass('Inyectar una falla de cable la guarda en el proyecto y las fallas solo se ofrecen a piezas compatibles');

    // 4) Simular con la falla y diagnosticar
    await p.getByRole('button', {name: 'Ejecutar'}).click(); await panel('Instrumentos');
    const op = name => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});
    await op('QF1').click(); await op('QF2').click();
    const s1 = await op('S1').boundingBox(); await p.mouse.move(s1.x + s1.width / 2, s1.y + s1.height / 2); await p.mouse.down(); await p.waitForTimeout(250);
    const states = p.getByRole('list', {name: 'Estado de los equipos'});
    assert.equal(await states.locator('li', {hasText: 'KM1'}).locator('b').innerText(), 'Sin excitar'); assert.equal(await states.locator('li').filter({has: p.locator('span', {hasText: /^M1$/})}).locator('b').innerText(), 'Sin alimentar');
    await p.mouse.up(); await panel('Instrumentos');
    await p.getByRole('button', {name: 'Diagnosticar'}).click();
    const region = p.getByRole('region', {name: 'Resultado del diagnóstico'});
    const txt = await region.innerText(); assert.match(txt, /KM1: el diseño sano se excita y con las fallas no se excita/); assert.match(txt, /PLC\.DO0 → KM1\.A1/); assert.match(txt, /Hay tensión en un extremo del cable y no en el otro/);
    await p.screenshot({path: out + '/docs-3-diagnostico.png'});
    assert.ok(!(await region.innerText()).includes('injected'), 'la interfaz no revela cuál es la falla inyectada');
    pass('Con la falla, el PLC activa DO0 pero KM1 no se excita; el diagnóstico señala el cable DO0 → A1 sin revelar la lista de fallas');

    // 5) Modo Prueba: sin diagnóstico automático y con fallas ocultas
    await field(form, 'Falla').selectOption('contact-open'); await field(form, 'Componente').selectOption({label: 'S1'}); await form.getByLabel(/Oculta al alumno/).check(); await form.getByRole('button', {name: 'Inyectar falla'}).click(); await settle();
    assert.equal((await stored()).faults.filter(f => f.hidden).length, 1);
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.getByLabel('Modo educativo').selectOption('test'); await settle(); await p.getByRole('button', {name: 'Cerrar Proyecto'}).click();
    assert.match(await p.getByRole('heading', {name: /Fallas aplicadas/}).innerText(), /Fallas aplicadas \(1 \+ 1 oculta\(s\)\)/i); assert.match(await p.locator('.ind-panel').filter({hasText: 'Diagnóstico'}).last().innerText(), /diagnóstico automático está desactivado/);
    assert.equal(await p.getByRole('region', {name: 'Resultado del diagnóstico'}).count(), 0);
    assert.ok(!(await p.getByRole('list', {name: 'Fallas aplicadas'}).innerText()).includes('S1'), 'la falla oculta no se lista');
    pass('En modo Prueba el diagnóstico automático se desactiva y las fallas ocultas no se listan');
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.getByLabel('Modo educativo').selectOption('free'); await settle(); await p.getByRole('button', {name: 'Cerrar Proyecto'}).click();

    // 6) Quitar fallas, deshacer y persistencia
    await p.getByRole('button', {name: /Quitar todas/}).click(); await settle(); assert.equal((await stored()).faults.length, 0);
    await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(); assert.equal((await stored()).faults.length, 2);
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await settle(); assert.equal((await stored()).faults.length, 2); assert.equal((await stored()).version, 4);
    pass('Quitar fallas, deshacer y recargar conservan las fallas en el proyecto');

    // 7) Tablet
    await p.setViewportSize({width: 820, height: 1000}); await view('Tablero'); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await view('Documentación'); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    pass('Sin desbordes en tablet (Tablero y Documentación)');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/docs-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
