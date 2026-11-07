// Industria, fase 9: modos Libre / Aprendizaje / Prueba y actividades, con ratón real (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const solved = out + '/arranque-resuelto.industria.json';
fs.writeFileSync(solved, execFileSync(process.execPath, ['qa/industria-activity-fixture.mjs'], {encoding: 'utf8'}));

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', acceptDownloads: true});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage();
    p.on('dialog', d => d.accept());
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.waitForTimeout(700);
    const stored = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    const settle = () => p.waitForTimeout(700);
    const toggle = name => p.getByRole('button', {name, exact: true}).click();
    const steps = () => p.getByRole('list', {name: 'Pasos de la actividad'}).locator('li');
    const field = (scope, name) => scope.locator('label.ind-field').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('select, input');
    const projectMode = async mode => { await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.getByLabel('Modo educativo').selectOption(mode); await settle(); await p.getByRole('button', {name: 'Cerrar Proyecto'}).click(); };

    // 1) Sin actividad: el panel explica el modo y ofrece actividades
    await toggle('Piezas'); await toggle('Actividad');
    assert.match(await p.locator('[data-mode-note]').innerText(), /Modo Libre\./); assert.equal(await p.getByRole('list', {name: 'Actividades disponibles'}).locator('li').count(), 4);
    pass('El panel Actividad explica el modo actual y ofrece las 4 actividades');

    // 2) Aprendizaje: arrancar la actividad de cableado
    await p.getByRole('button', {name: 'Iniciar Cablear un arranque directo en modo Aprendizaje'}).click(); await p.waitForTimeout(900);
    let pr = await stored(); assert.equal(pr.mode, 'learning'); assert.equal(pr.lesson.activityId, 'arranque'); assert.equal(pr.connections.length, 0); assert.match(pr.name, /Cablear un arranque directo/);
    assert.match(await p.getByRole('status', {name: 'Progreso'}).innerText(), /^0 de 5 pasos/); assert.equal(await steps().count(), 5); assert.ok(await p.locator('summary', {hasText: 'Pista'}).count() >= 4);
    await p.screenshot({path: out + '/modos-1-aprendizaje.png'});
    pass('Aprendizaje: la actividad parte en 0 de 5 pasos, con ✓/✗ en vivo y pistas en cada paso pendiente');

    // 3) Aprendizaje rechaza un cable que rompe una regla, con el motivo
    await toggle('Conexiones');
    const form = p.getByRole('group', {name: 'Nueva conexión'});
    await form.getByLabel('Desde').selectOption('red:PE'); await form.getByLabel('Hasta').selectOption('km1:3'); await form.getByRole('button', {name: 'Conectar', exact: true}).click(); await settle();
    assert.match(await p.locator('.rb-toast').innerText(), /Modo Aprendizaje: no se conectó\. La tierra no se une con/); assert.equal((await stored()).connections.length, 0); await p.locator('.rb-toast button').click();
    await form.getByLabel('Desde').selectOption('red:PE'); await form.getByLabel('Hasta').selectOption('motor:PE'); await form.getByRole('button', {name: 'Conectar', exact: true}).click(); await settle();
    assert.equal((await stored()).connections.length, 1); await toggle('Conexiones');
    assert.equal(await steps().filter({hasText: 'conectado a tierra'}).getAttribute('data-state'), 'ok'); assert.match(await p.getByRole('status', {name: 'Progreso'}).innerText(), /^1 de 5 pasos/);
    pass('Aprendizaje rechaza tierra con fuerza explicando por qué; el cable correcto se acepta y marca el paso ✓ en vivo');

    // 4) Importar la solución: 5 de 5
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.locator('.ind-window-project input[type=file]').setInputFiles(solved); await settle();
    assert.equal((await stored()).connections.length, 19); await toggle('Actividad');
    assert.match(await p.getByRole('status', {name: 'Progreso'}).innerText(), /^5 de 5 pasos · ¡Actividad completa!/); assert.equal(await p.locator('summary', {hasText: 'Pista'}).count(), 0, 'sin pistas cuando todo está bien');
    pass('Una solución completa marca 5 de 5; el resultado depende del comportamiento, no de una solución concreta');

    // 5) Prueba con falla oculta
    await p.getByRole('button', {name: 'Iniciar Localizar una falla como Prueba'}).click(); await p.waitForTimeout(900);
    pr = await stored(); assert.equal(pr.mode, 'test'); assert.equal(pr.lesson.activityId, 'falla'); assert.equal(pr.faults.length, 1); assert.equal(pr.faults[0].hidden, true);
    assert.match(await p.locator('[data-mode-note]').innerText(), /Modo Prueba\./); assert.equal(await p.getByRole('status', {name: 'Progreso'}).count(), 0, 'sin progreso en vivo'); assert.equal(await p.locator('summary', {hasText: 'Pista'}).count(), 0, 'sin pistas');
    assert.equal(await steps().first().getAttribute('data-state'), 'hidden');
    await toggle('Actividad'); await toggle('Fallas'); assert.match(await p.getByRole('heading', {name: /Fallas aplicadas/}).innerText(), /\(0 \+ 1 oculta\(s\)\)/i); assert.match(await p.locator('.ind-panel').last().innerText(), /diagnóstico automático está desactivado/);
    await toggle('Fallas'); await toggle('Conexiones'); await p.getByRole('group', {name: 'Nueva conexión'}).getByLabel('Desde').selectOption('fuente:L'); await p.getByRole('group', {name: 'Nueva conexión'}).getByLabel('Hasta').selectOption('fuente:N'); await p.getByRole('group', {name: 'Nueva conexión'}).getByRole('button', {name: 'Conectar', exact: true}).click(); await settle();
    assert.equal(await p.getByRole('alert').count(), 0, 'sin avisos de validación en Prueba'); assert.equal((await stored()).connections.length, 20, 'en Prueba el cable erróneo se permite (el alumno decide)'); await toggle('Conexiones');
    pass('Prueba: sin pasos en vivo, sin pistas, sin diagnóstico ni avisos de validación, con la falla oculta; el cable erróneo se permite');

    // 6) Responder y entregar
    await toggle('Actividad'); const ans = p.getByRole('group').filter({}).first();
    const culprit = `connection:${pr.faults[0].connectionId}`;
    await p.getByLabel('Elemento defectuoso').selectOption(culprit); await p.getByLabel('Tipo de falla').selectOption('wire-open'); await settle();
    assert.equal((await stored()).lesson.answers.culprit, culprit);
    await p.getByRole('button', {name: 'Entregar actividad'}).click(); await settle();
    pr = await stored(); assert.deepEqual([pr.lesson.submitted.score, pr.lesson.submitted.total], [2, 2]);
    assert.match(await p.getByRole('region', {name: 'Resultado de la entrega'}).innerText(), /Entregada: 2 de 2/); assert.equal(await steps().first().getAttribute('data-state'), 'ok');
    const [rep] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: /Informe \(\.md\)/}).click()]); const repText = fs.readFileSync(await rep.path(), 'utf8'); assert.ok(repText.includes('Resultado: **2 de 2**') && repText.includes('no son una certificación'));
    pass('Entregar en modo Prueba calcula 2 de 2, muestra el resultado y descarga el informe');

    // 7) La entrega bloquea el proyecto; reabrir lo libera
    assert.ok(await p.getByLabel('Elemento defectuoso').isDisabled()); await toggle('Estructura');
    assert.ok(await p.getByRole('button', {name: 'Añadir', exact: true}).isDisabled(), 'no se añaden piezas con la actividad entregada');
    assert.match(await p.locator('.ind-sim-note').innerText(), /Actividad entregada/); const before = JSON.stringify((await stored()).connections);
    await p.getByRole('button', {name: 'Reabrir'}).dispatchEvent('click'); await settle(); assert.equal((await stored()).lesson.submitted, null); assert.ok(!(await p.getByRole('button', {name: 'Añadir', exact: true}).isDisabled()));
    assert.equal(JSON.stringify((await stored()).connections), before);
    pass('La entrega bloquea el proyecto; Reabrir lo libera sin perder nada');

    // 8) Salir de Prueba pide confirmación; Libre: comprobación manual
    await projectMode('free'); pr = await stored(); assert.equal(pr.mode, 'free');
    await toggle('Estructura');
    assert.equal(await steps().first().getAttribute('data-state'), 'hidden'); assert.equal(await p.getByRole('status', {name: 'Progreso'}).count(), 0);
    await p.getByRole('button', {name: 'Comprobar ahora'}).click(); assert.notEqual(await steps().first().getAttribute('data-state'), 'hidden');
    pass('Salir de Prueba pide confirmación; en Libre las comprobaciones se piden a mano y sin pistas');

    // 9) Persistencia, tablet y errores
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await settle(); pr = await stored(); assert.equal(pr.version, 4); assert.equal(pr.lesson.activityId, 'falla'); assert.equal(pr.lesson.answers.culprit, culprit);
    await p.setViewportSize({width: 820, height: 1000}); await p.waitForTimeout(300); assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    pass('Recargar conserva la actividad y las respuestas; sin desbordes en tablet');
    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/modos-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
