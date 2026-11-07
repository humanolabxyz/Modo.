// Industria, fase 5: cableado con ratón real sobre terminales 3D y desde el panel Conexiones (Playwright; servidor en INDUSTRIA_URL).
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const lib = execFileSync(process.execPath, ['qa/industria-wiring-fixture.mjs'], {encoding: 'utf8'});
const pid = JSON.parse(lib).active;
const CAM = {pos: [0, 0.5, 1.0], target: [0, 0.5, 0], fov: 45};
const uiState = JSON.stringify({version: 1, view: 'plant', operation: 'build', camera: {position: CAM.pos, target: CAM.target}, savedCameras: [], panels: {library: false, inspector: false, cameras: false, structure: false, connections: true, console: false}, selection: [], path: ['Planta'], magnet: true});

// Proyección de un punto del mundo con la cámara frontal de la prueba.
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => { const n = Math.hypot(...a); return a.map(v => v / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function project(point, box) {
  const f = norm(sub(CAM.target, CAM.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), d = sub(point, CAM.pos);
  const t = Math.tan((CAM.fov * Math.PI) / 360), aspect = box.width / box.height, z = dot(d, f);
  return {x: box.x + ((dot(d, r) / (z * t * aspect) + 1) / 2) * box.width, y: box.y + ((1 - dot(d, u) / (z * t)) / 2) * box.height};
}
// Terminales (posición del catálogo) en el mundo: pieza en (x, 0.5, 0), caja de 60 mm de fondo (fuente) o 85 mm (contactor).
const WORLD = {'fuente:L+': [-0.1 - 0.00875, 0.5 - 0.037, 0.03], 'km1:A1': [0.1 + 0.0115, 0.5 + 0.0225, 0.0425], 'km1:A2': [0.1 + 0.0115, 0.5 - 0.0225, 0.0425]};

(async () => {
  const b = await chromium.launch();
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
    await c.addInitScript(([key, library, uiKey, ui]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, library); localStorage.setItem(uiKey, ui); localStorage.setItem('__seeded', '1'); } }, [LIB, lib, `modo:industria:ui:${pid}:v1`, uiState]);
    const p = await c.newPage();
    p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
    p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
    await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(1000);
    const stored = () => p.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0], LIB);
    const settle = () => p.waitForTimeout(700);
    const wires = p.locator('.ind-wires > li'), canvas = p.locator('canvas').first();
    const click = async key => { const box = await canvas.boundingBox(), pt = project(WORLD[key], box); await p.mouse.move(pt.x, pt.y); await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(150); };

    // 1) Cablear en el 3D: toca dos terminales
    await p.getByRole('button', {name: 'Cablear', exact: true}).click();
    assert.match(await p.locator('.ind-wire-note').innerText(), /origen/);
    await click('fuente:L+'); assert.match(await p.locator('.ind-wire-note').innerText(), /Desde Fuente · L\+/);
    await p.screenshot({path: out + '/cableado-1-origen.png'});
    await click('km1:A1'); await settle();
    let pr = await stored(); assert.equal(pr.connections.length, 1); const w = pr.connections[0];
    assert.deepEqual([w.a.entityId + ':' + w.a.terminalId, w.b.entityId + ':' + w.b.terminalId, w.kind, w.status], ['fuente:L+', 'km1:A1', 'control', 'unverified']);
    assert.equal(await wires.count(), 1); assert.match(await wires.first().innerText(), /Sin verificar/);
    await p.screenshot({path: out + '/cableado-2-cable.png'});
    pass('Tocar dos terminales en el escenario crea el cable: tipo «control», estado «Sin verificar»');

    // 2) Esc cancela el origen pendiente y sale del modo
    await click('km1:A2'); assert.match(await p.locator('.ind-wire-note').innerText(), /Desde KM1 · A2/);
    await p.keyboard.press('Escape'); assert.match(await p.locator('.ind-wire-note').innerText(), /origen/);
    await p.keyboard.press('Escape'); assert.equal(await p.locator('.ind-wire-note').count(), 0);
    assert.equal((await stored()).connections.length, 1);
    pass('Esc cancela el origen pendiente y luego sale del modo Cablear sin crear nada');

    // 3) Panel: cortocircuito L–N detectado y explicado
    const form = p.getByRole('group', {name: 'Nueva conexión'});
    const wire = async (a, bb) => { await form.getByLabel('Desde').selectOption(a); await form.getByLabel('Hasta').selectOption(bb); await form.getByRole('button', {name: 'Conectar'}).click(); await p.waitForTimeout(250); };
    await wire('fuente:L', 'km1:1'); await wire('km1:1', 'fuente:N'); await settle();
    const alert = p.getByRole('alert');
    assert.match(await alert.innerText(), /Cortocircuito entre línea y neutro/);
    assert.equal(await p.locator('.ind-wires > li[data-status=invalid]').count(), 2);
    await p.screenshot({path: out + '/cableado-3-cortocircuito.png'});
    pass('Unir L y N de la fuente por el contactor se marca como cortocircuito, con el motivo y los dos cables en «Inválido»');

    // 4) Desconectar solo quita ese cable y el aviso desaparece
    await p.getByRole('button', {name: /Desconectar KM1 · 1 → Fuente · N/}).click(); await settle();
    assert.equal(await p.getByRole('alert').count(), 0); assert.equal((await stored()).connections.length, 2);
    assert.ok((await stored()).connections.every(x => x.status !== 'invalid'));
    pass('Desconectar quita solo ese cable; el aviso desaparece y el estado guardado se actualiza');

    // 5) Redes y tierra
    assert.ok(await p.getByRole('list', {name: 'Redes'}).locator('li').count() >= 2);
    await wire('motor:PE', 'km1:3'); await settle();
    assert.match(await p.getByRole('alert').innerText(), /tierra/i);
    pass('Unir PE con un terminal de fuerza se marca como error de tierra');

    // 6) Límite de cables por terminal: avisa y no crea
    await wire('km1:1', 'km1:3'); await settle();
    const before = (await stored()).connections.length;
    await wire('km1:1', 'km1:5'); await settle();
    assert.match(await p.locator('.rb-toast').innerText(), /ya tiene 2 cables/); assert.equal((await stored()).connections.length, before);
    await p.locator('.rb-toast button').click();
    pass('El límite didáctico de 2 cables por terminal rechaza el tercero con un mensaje');

    // 7) Deshacer / rehacer y persistencia
    await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(); assert.equal((await stored()).connections.length, before - 1);
    await p.getByRole('button', {name: 'Rehacer'}).click(); await settle(); assert.equal((await stored()).connections.length, before);
    const saved = await stored(); await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await settle();
    assert.deepEqual((await stored()).connections, saved.connections); assert.equal(await wires.count(), saved.connections.length);
    pass('Deshacer, rehacer y recargar conservan los cables');

    // 8) Simular protege el cableado
    await p.getByRole('button', {name: 'Simular'}).click();
    assert.ok(await form.getByRole('button', {name: 'Conectar', exact: true}).isDisabled()); assert.ok(await p.getByRole('button', {name: /Desconectar/}).first().isDisabled());
    await p.getByRole('button', {name: 'Cablear', exact: true}).click();
    assert.equal(await p.locator('.ind-wire-note').count(), 0, 'no entra al modo Cablear en Simulación');
    await p.getByRole('button', {name: 'Construir'}).click();
    pass('En Simular no se cablea ni se desconecta');

    // 9) Montar y cablear son independientes: soltar/mover no toca los cables; los cables no montan
    assert.equal((await stored()).mounts.length, 0);
    pass('Cablear no crea montajes');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
    await c.close();
  } finally {
    await b.close();
    fs.writeFileSync(out + '/cableado-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
