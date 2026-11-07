// Industria, fase 6: simulación lógica con ratón real — ejemplo de arranque directo, mandos, estados, multímetro y estados 3D (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const CAM = {pos: [6, 5, 7], target: [0, 0.8, 0], fov: 45};
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => { const n = Math.hypot(...a); return a.map(v => v / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function project(point, box) {
  const f = norm(sub(CAM.target, CAM.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), d = sub(point, CAM.pos);
  const t = Math.tan((CAM.fov * Math.PI) / 360), aspect = box.width / box.height, z = dot(d, f);
  return {x: box.x + ((dot(d, r) / (z * t * aspect) + 1) / 2) * box.width, y: box.y + ((1 - dot(d, u) / (z * t)) / 2) * box.height};
}

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
    const chip = () => p.locator('.rb-sim-chip').innerText();
    const state = name => p.getByRole('list', {name: 'Estado de los equipos'}).locator('li').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('b').innerText();
    const op = name => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});

    // 1) Cargar el ejemplo
    await p.getByRole('button', {name: 'Opciones del proyecto'}).click();
    await p.getByRole('button', {name: /Ejemplo: arranque directo/}).click(); await p.waitForTimeout(900);
    let pr = await stored(); assert.equal(pr.entities.length, 10); assert.equal(pr.mounts.length, 7); assert.equal(pr.connections.length, 19);
    assert.match(pr.name, /arranque directo/);
    await p.getByRole('button', {name: 'Piezas', exact: true}).click(); // cierra la biblioteca
    await p.getByRole('button', {name: 'Instrumentos', exact: true}).click();
    assert.equal(await chip(), 'DETENIDO'); assert.match(await p.locator('[data-sim-state]').innerText(), /detenida/);
    assert.ok(await op('QF1').isDisabled());
    await p.screenshot({path: out + '/sim-1-ejemplo.png'});
    pass('El ejemplo de arranque directo crea un proyecto nuevo con 10 piezas, 7 montajes y 19 cables; los mandos están bloqueados con la simulación detenida');

    // 2) Ejecutar y operar
    await p.getByRole('button', {name: 'Ejecutar'}).click();
    assert.equal(await chip(), 'EJECUTANDO'); assert.equal(await state('M1'), 'Sin alimentar'); assert.equal(await state('Fuente'), 'Sin salida');
    await op('QF1').click(); await op('QF2').click();
    assert.equal(await op('QF1').getAttribute('aria-pressed'), 'true'); assert.equal(await state('Fuente'), 'Con salida'); assert.equal(await state('M1'), 'Sin alimentar'); assert.equal(await state('KM1'), 'Sin excitar');
    const s1 = op('S1'), sb = await s1.boundingBox();
    await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.down();
    assert.equal(await state('KM1'), 'Excitado'); assert.equal(await state('M1'), 'Alimentado'); assert.equal(await state('H1'), 'Encendido');
    await p.screenshot({path: out + '/sim-2-motor.png'});
    await p.mouse.up();
    assert.equal(await state('KM1'), 'Sin excitar'); assert.equal(await state('M1'), 'Sin alimentar'); assert.equal(await state('H1'), 'Apagado');
    pass('Cerrar QF1 y QF2 energiza la fuente; mantener S1 excita KM1, alimenta el motor y enciende H1; soltarlo lo apaga (sin sello)');

    // 3) Multímetro
    const meter = p.getByRole('group', {name: 'Multímetro'}), reading = () => p.getByLabel('Lectura del multímetro').innerText();
    await meter.getByLabel('Función').selectOption('voltage');
    await meter.getByLabel('Sonda roja').selectOption('red:L1'); await meter.getByLabel('Sonda negra').selectOption('red:N');
    assert.match(await reading(), /^230 V CA \(valor configurado en «Red 3F», no medido en un equipo real\)/);
    await meter.getByLabel('Sonda roja').selectOption('s1:3'); await meter.getByLabel('Sonda negra').selectOption('fuente:M');
    assert.match(await reading(), /^24 V CC/);
    await meter.getByLabel('Sonda roja').selectOption('km1:2'); await meter.getByLabel('Sonda negra').selectOption('red:N');
    assert.match(await reading(), /^Sin lectura/);
    await meter.getByLabel('Función').selectOption('continuity');
    await meter.getByLabel('Sonda roja').selectOption('qf1:1'); await meter.getByLabel('Sonda negra').selectOption('qf1:2');
    assert.match(await reading(), /Continuidad: sí/);
    await op('QF1').click(); assert.match(await reading(), /Continuidad: no$/);
    await op('QF1').click();
    pass('El multímetro mide tensión con los valores configurados, dice «sin lectura» sin referencia y distingue interruptor cerrado de abierto');

    // 4) Operar desde el escenario 3D (clic sobre el interruptor QF1)
    await op('QF2').click(); // abre QF2 para tener un estado conocido
    pr = await stored(); const qf1 = pr.poses[pr.entities.find(e => e.label === 'QF1').id].position;
    await p.getByRole('button', {name: 'Cerrar Instrumentos'}).click(); await p.getByRole('button', {name: 'Instrumentos', exact: true}).click();
    const box = await p.locator('canvas').first().boundingBox(), pt = project(qf1, box);
    const before = await op('QF1').getAttribute('aria-pressed');
    await p.mouse.move(pt.x, pt.y); await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(250);
    assert.notEqual(await op('QF1').getAttribute('aria-pressed'), before, 'el clic en el 3D alterna el interruptor');
    await p.screenshot({path: out + '/sim-3-escenario.png'});
    pass('Pulsar un interruptor en el escenario 3D lo abre o lo cierra');

    // 5) Pausa congela los mandos; Detener limpia
    await p.getByRole('button', {name: 'Pausar'}).click(); assert.equal(await chip(), 'PAUSADO'); assert.ok(await op('QF2').isDisabled());
    await p.getByRole('button', {name: 'Ejecutar'}).click(); assert.equal(await chip(), 'EJECUTANDO'); assert.ok(!(await op('QF2').isDisabled()));
    await p.getByRole('button', {name: 'Detener'}).click(); assert.equal(await chip(), 'DETENIDO');
    assert.equal(await state('M1'), '—'); assert.equal(await op('QF1').getAttribute('aria-pressed'), 'false');
    pass('Pausar congela los mandos, Ejecutar reanuda y Detener apaga todo y suelta los mandos');

    // 6) La simulación no modifica el proyecto; Construir la detiene; la estructura sigue protegida
    const saved = JSON.stringify(await stored());
    await p.getByRole('button', {name: 'Ejecutar'}).click(); await op('QF1').click(); await p.waitForTimeout(700);
    assert.equal(JSON.stringify(await stored()), saved, 'operar mandos no cambia el proyecto guardado');
    assert.ok(await p.getByRole('button', {name: 'Cablear', exact: true}).isEnabled());
    await p.getByRole('button', {name: 'Cablear', exact: true}).click(); assert.equal(await p.locator('.ind-wire-note').count(), 0, 'no se cablea en Simulación');
    await p.getByRole('button', {name: 'Construir'}).click(); assert.equal(await chip(), 'DETENIDO');
    pass('Operar mandos no cambia el proyecto; en Simulación no se cablea; Construir detiene la simulación');

    // 7) Tensión configurable en el inspector (solo construcción)
    await p.getByRole('button', {name: 'Estructura', exact: true}).click(); await p.getByRole('treeitem', {name: /Red 3F/}).dispatchEvent('click');
    await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
    const volt = p.getByLabel(/Tensión fase–neutro configurada/); assert.equal(await volt.inputValue(), '230');
    await volt.fill('127'); await volt.press('Enter'); await p.waitForTimeout(700);
    assert.equal((await stored()).entities.find(e => e.label === 'Red 3F').props.voltage, 127);
    pass('La tensión de la red es un dato configurable del proyecto (no del catálogo)');

    // 8) Tablet sin desbordes y sin errores
    await p.setViewportSize({width: 820, height: 1000}); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); pass('Sin desbordes en tablet');
    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/sim-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
