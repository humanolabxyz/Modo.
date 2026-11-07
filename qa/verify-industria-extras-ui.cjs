// Industria, fase 11: formas 3D reales, cables con grosor, temporizadores del PLC, relé térmico, sonido, hojas del esquema y editor de actividades.
// (Playwright; servidor en INDUSTRIA_URL.)
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const plcLib = execFileSync(process.execPath, ['qa/industria-example-fixture.mjs'], {encoding: 'utf8'});
const wiringLib = execFileSync(process.execPath, ['qa/industria-wiring-fixture.mjs'], {encoding: 'utf8'});

async function open(b, library, opts = {}) {
  const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block', acceptDownloads: true, ...opts});
  await c.addInitScript(([key, lib]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (lib && !localStorage.getItem('__seeded')) { localStorage.setItem(key, lib); localStorage.setItem('__seeded', '1'); } }, [LIB, library]);
  const p = await c.newPage();
  p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
  await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(900);
  const stored = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
  return {c, p, stored};
}
const meshes = p => p.locator('canvas').first().getAttribute('data-meshes').then(Number);
const view = (p, name) => p.locator('.ind-views').getByRole('button', {name, exact: true}).click();
const panel = (p, name) => p.getByRole('button', {name, exact: true}).click();
const op = (p, name) => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});

(async () => {
  const b = await chromium.launch();
  try {
    // 1) Formas 3D y cables con grosor
    let {c, p, stored} = await open(b, wiringLib);
    const m0 = await meshes(p); assert.ok(m0 > 3 * 40 / 4, `formas detalladas: ${m0} mallas para 3 piezas`); assert.ok(m0 >= 60, `3 piezas con forma real deberían tener decenas de mallas (${m0})`);
    await panel(p, 'Piezas'); await panel(p, 'Conexiones');
    const form = p.getByRole('group', {name: 'Nueva conexión'});
    await form.getByLabel('Desde').selectOption('fuente:L+'); await form.getByLabel('Hasta').selectOption('km1:A1'); await form.getByRole('button', {name: 'Conectar', exact: true}).click(); await p.waitForTimeout(800);
    const m1 = await meshes(p); assert.equal(m1, m0 + 5, 'un cable es un tubo con dos punteras (manguito y punta) en cada extremo');
    await panel(p, 'Conexiones'); await p.screenshot({path: out + '/extras-1-formas.png'});
    pass(`Las 3 piezas se dibujan con su forma (${m0} mallas: carcasa, frente, tornillos, LED…) y cada cable es un tubo con grosor`);
    await c.close();

    // 2) Temporizador del PLC con reloj de simulación
    ({c, p, stored} = await open(b, plcLib)); await panel(p, 'Piezas');
    await view(p, 'PLC');
    await p.getByLabel('Nueva variable interna').fill('RETARDO'); await p.getByRole('button', {name: 'Añadir', exact: true}).click(); await p.waitForTimeout(500);
    await p.getByLabel('Variable de la bobina nueva').selectOption('RETARDO'); await p.getByRole('button', {name: 'Añadir línea'}).click(); await p.waitForTimeout(500);
    await p.getByLabel('Tipo de bobina de la línea 2').selectOption('ton'); await p.waitForTimeout(500);
    const preset = p.getByLabel('Tiempo en ms de la línea 2'); assert.equal(await preset.inputValue(), '3000'); await preset.fill('1200'); await preset.press('Enter'); await p.waitForTimeout(500);
    await p.getByLabel('Añadir contacto a la línea 2, rama 1').selectOption('MOTOR'); await p.waitForTimeout(500);
    let pr = await stored(); const rung = pr.plc.plc.rungs[1]; assert.deepEqual([rung.coil.mode, rung.coil.preset, rung.coil.tag], ['ton', 1200, 'RETARDO']);
    // El motor arranca con un toque de S1 y se mantiene por el sello: el temporizador (que cuenta mientras MOTOR está activo) corre solo
    await p.getByRole('button', {name: 'Ejecutar'}).click(); await panel(p, 'Instrumentos'); await op(p, 'QF1').click(); await op(p, 'QF2').click();
    const s1 = await op(p, 'S1').boundingBox(); await p.mouse.move(s1.x + s1.width / 2, s1.y + s1.height / 2); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up();
    await p.getByRole('button', {name: 'Cerrar Instrumentos'}).click(); await p.waitForTimeout(150);
    const acc = async () => Number((await p.getByLabel('Avance de la línea 2').innerText()).split('/')[0]);
    const acc0 = await acc(); await p.waitForTimeout(500); const acc1 = await acc();
    assert.ok(acc1 > acc0 && acc1 < 1200, `el temporizador avanza con el reloj de la simulación (${acc0} → ${acc1} ms)`);
    await p.waitForTimeout(1500); assert.equal(await acc(), 1200, 'se detiene en el valor programado'); assert.match(await p.locator('.ind-io li', {hasText: 'RETARDO'}).innerText(), /1/);
    await view(p, 'HMI'); const paro = await p.getByRole('button', {name: 'PARO', exact: true}).boundingBox(); await p.mouse.move(paro.x + paro.width / 2, paro.y + paro.height / 2); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up();
    await view(p, 'PLC'); await p.waitForTimeout(300); assert.equal(await acc(), 0, 'al parar el motor el temporizador se reinicia');
    await p.screenshot({path: out + '/extras-2-temporizador.png'});
    pass('Un temporizador TON de 1,2 s se programa desde la escalera, avanza con el reloj de la simulación, llega a su valor y se reinicia al parar el motor');

    // 3) Sonido
    const root = p.locator('.ind-app'); assert.equal(await root.getAttribute('data-sound'), 'off');
    await p.getByRole('button', {name: 'Sonido', exact: true}).click(); assert.equal(await root.getAttribute('data-sound'), 'on'); assert.equal(await p.getByRole('button', {name: 'Sonido', exact: true}).getAttribute('aria-pressed'), 'true');
    await view(p, 'Planta 3D'); await p.getByRole('button', {name: 'Detener'}).click(); await p.getByRole('button', {name: 'Ejecutar'}).click();
    const ins = p.locator('nav.rb-dock').getByRole('button', {name: 'Instrumentos', exact: true}); if ((await ins.getAttribute('aria-pressed')) !== 'true') await ins.click();
    await p.getByRole('list', {name: 'Mandos'}).waitFor(); const ev0 = Number(await root.getAttribute('data-sound-events'));
    await op(p, 'QF1').click(); await p.waitForTimeout(300); await op(p, 'QF2').click(); await p.waitForTimeout(300);
    const s1b = await op(p, 'S1').boundingBox(); await p.mouse.move(s1b.x + s1b.width / 2, s1b.y + s1b.height / 2); await p.mouse.down(); await p.waitForTimeout(500); await p.mouse.up(); await p.waitForTimeout(300);
    const ev1 = Number(await root.getAttribute('data-sound-events')); assert.ok(ev1 - ev0 >= 4, `se pidieron ${ev1 - ev0} sonidos (2 interruptores, el pulsador y el contactor)`);
    await p.getByRole('button', {name: 'Sonido', exact: true}).click(); assert.equal(await root.getAttribute('data-sound'), 'off');
    pass('El botón Sonido se activa y apaga; con sonido activo cada interruptor, pulsador y contactor pide su sonido');
    await c.close();

    // 4) Relé térmico desde la biblioteca
    ({c, p, stored} = await open(b, wiringLib));
    await p.getByLabel('Buscar en la biblioteca').fill('térmico'); await p.locator('.ind-shapes > li', {hasText: 'Relé térmico'}).first().locator(':scope > button').click(); await p.waitForTimeout(600);
    assert.ok((await stored()).entities.some(e => e.definitionId === 'rele-termico'));
    await p.getByRole('button', {name: 'Ejecutar'}).click(); await panel(p, 'Instrumentos'); assert.match(await p.getByRole('list', {name: 'Mandos'}).innerText(), /Relé térmico[\s\S]*En servicio|En servicio[\s\S]*Relé térmico/);
    await op(p, 'Relé').click(); assert.match(await op(p, 'Relé').innerText(), /Disparado/); await op(p, 'Relé').click(); assert.match(await op(p, 'Relé').innerText(), /En servicio/);
    pass('El relé térmico se coloca desde la biblioteca y se dispara y rearma desde los mandos');
    await c.close();

    // 5) Hojas del esquema
    ({c, p, stored} = await open(b, plcLib)); await panel(p, 'Piezas'); await view(p, 'Diagramas');
    assert.equal(await p.getByRole('tab').count(), 2); assert.ok(await p.locator('svg g[data-entity="km1"]').count() === 1);
    await p.locator('svg g[data-entity="km1"] rect').click();
    const moveSel = p.getByLabel('Hoja de KM1'); await moveSel.selectOption({label: 'Hoja 3 (nueva)'}); await p.waitForTimeout(700);
    assert.equal(await p.getByRole('tab').count(), 3); assert.equal(await p.getByRole('tab', {selected: true}).innerText(), 'Hoja 3'); assert.equal(await p.locator('svg g[data-entity]').count(), 1);
    assert.ok((await p.locator('svg g[data-ref]').count()) >= 6, 'KM1 sola en su hoja referencia a sus vecinos'); assert.equal((await stored()).symbols.km1[0].page, 3);
    await p.getByRole('button', {name: 'Deshacer'}).click(); await p.waitForTimeout(600); assert.equal(await p.getByRole('tab').count(), 2);
    await p.screenshot({path: out + '/extras-3-hojas.png'});
    pass('Un símbolo se pasa a una hoja nueva (sus cables se vuelven referencias «→ hoja n») y Deshacer vuelve a dos hojas');

    // 6) Editor de actividades
    await view(p, 'Planta 3D'); await panel(p, 'Actividad'); await p.locator('.ind-editor > summary').click();
    await p.locator('.ind-editor label.ind-field').filter({has: p.locator('span', {hasText: /^Título$/})}).locator('input').fill('Marcha del motor'); await p.locator('.ind-editor textarea').fill('Haz que el motor gire al pulsar S1.');
    const ng = p.getByRole('group', {name: 'Nueva comprobación'});
    const fld = name => p.locator('.ind-editor label.ind-field').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('select, input, textarea');
    await fld('Tipo de comprobación').selectOption('noErrors'); await ng.getByRole('button', {name: /Añadir comprobación/}).click();
    await fld('Tipo de comprobación').selectOption('energized'); await fld('Equipo').selectOption({label: 'M1 (Motor trifásico)'}); await ng.locator('.ind-step').first().getByLabel('QF1').check(); await ng.locator('.ind-step').first().getByLabel('QF2').check(); await ng.locator('.ind-step').first().getByLabel('S1').check();
    await fld('Pista para Aprendizaje').fill('Cierra QF1 y QF2 y mantén S1'); await ng.getByRole('button', {name: /Añadir comprobación/}).click();
    const list = p.getByRole('list', {name: 'Comprobaciones de la actividad propia'}); assert.equal(await list.locator('li').count(), 2); assert.match(await list.innerText(), /Con QF1 y QF2 y S1, M1 está activo/); assert.equal(await list.locator('li[data-state=ok]').count(), 2, 'tu solución cumple las dos');
    await p.getByRole('button', {name: 'Guardar actividad'}).click(); await p.waitForTimeout(700);
    pr = await stored(); assert.equal(pr.lesson.activityId, 'custom'); assert.equal(pr.lesson.def.checks.length, 2); assert.equal(pr.lesson.def.title, 'Marcha del motor');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: /Exportar copia para alumnos/}).click()]); assert.match(dl.suggestedFilename(), /\.alumnos\.industria\.json$/);
    const copy = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); assert.equal(copy.connections.length, 0, 'sin cables'); assert.equal(copy.mode, 'learning'); assert.equal(copy.lesson.def.checks.length, 2); assert.ok(copy.plc.plc, 'el programa se conserva si no se marca quitarlo');
    fs.writeFileSync(out + '/actividad-alumnos.industria.json', JSON.stringify(copy));
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click(); await p.locator('.ind-window-project input[type=file]').setInputFiles(out + '/actividad-alumnos.industria.json'); await p.waitForTimeout(900);
    await panel(p, 'Actividad'); assert.match(await p.getByRole('status', {name: 'Progreso'}).innerText(), /^1 de 2 pasos/); assert.equal((await stored()).lesson.activityId, 'custom');
    pass('El editor arma una actividad con dos comprobaciones (cumplidas por la solución), la guarda, exporta una copia sin cables y, al abrirla, marca 1 de 2 pasos');
    await c.close();

    assert.deepEqual(report.errors.filter(e => !/AudioContext|autoplay/i.test(e)), [], 'errores de consola o de JavaScript');
    pass('Cero errores de consola y de JavaScript');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/extras-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
