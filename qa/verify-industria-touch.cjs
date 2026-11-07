// Industria, fase 10: gestos táctiles con eventos de toque reales del navegador (Chromium, protocolo CDP): tocar, mantener un botón de HMI, mantener un pulsador
// y arrastrar una pieza en 3D con el dedo. Es la emulación más fiel disponible sin un dispositivo; NO sustituye una prueba en un teléfono o tablet reales.
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const plcLib = execFileSync(process.execPath, ['qa/industria-example-fixture.mjs'], {encoding: 'utf8'});
const buildLib = execFileSync(process.execPath, ['qa/industria-build-fixture.mjs'], {encoding: 'utf8'});

const CAM = {pos: [6, 5, 7], target: [0, 0.8, 0], fov: 45};
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => { const n = Math.hypot(...a); return a.map(v => v / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function project(point, box) {
  const f = norm(sub(CAM.target, CAM.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), d = sub(point, CAM.pos);
  const t = Math.tan((CAM.fov * Math.PI) / 360), aspect = box.width / box.height, z = dot(d, f);
  return {x: box.x + ((dot(d, r) / (z * t * aspect) + 1) / 2) * box.width, y: box.y + ((1 - dot(d, u) / (z * t)) / 2) * box.height};
}

async function open(b, library) {
  const c = await b.newContext({viewport: {width: 1180, height: 820}, serviceWorkers: 'block', hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  await c.addInitScript(([key, lib]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, lib); localStorage.setItem('__seeded', '1'); } }, [LIB, library]);
  const p = await c.newPage();
  p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
  await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor(); await p.waitForTimeout(900);
  return {c, p, cdp: await c.newCDPSession(p)};
}
const touch = async (cdp, type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
const center = async loc => { const r = await loc.boundingBox(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; };
const hold = async (cdp, loc, ms = 300, during) => { const {x, y} = await center(loc); await touch(cdp, 'touchStart', x, y); await new Promise(r => setTimeout(r, ms)); if (during) await during(); await touch(cdp, 'touchEnd'); await new Promise(r => setTimeout(r, 250)); };

(async () => {
  const b = await chromium.launch();
  try {
    // 1) Simulación con el dedo: tocar interruptores, mantener un pulsador y mantener un botón de HMI
    let {c, p, cdp} = await open(b, plcLib);
    const lib = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    await p.getByRole('button', {name: 'Ejecutar'}).tap(); await p.getByRole('button', {name: 'Piezas', exact: true}).tap(); await p.getByRole('button', {name: 'Instrumentos', exact: true}).tap(); await p.waitForTimeout(400);
    const op = name => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});
    await op('QF1').tap(); await op('QF2').tap();
    assert.equal(await op('QF1').getAttribute('aria-pressed'), 'true'); assert.equal(await op('QF2').getAttribute('aria-pressed'), 'true');
    const states = p.getByRole('list', {name: 'Estado de los equipos'}), st = name => states.locator('li').filter({has: p.locator('span', {hasText: new RegExp('^' + name + '$')})}).locator('b');
    assert.equal(await st('PLC').innerText(), 'Alimentado');
    pass('Con toques reales se cierran QF1 y QF2 y el PLC se alimenta');
    await hold(cdp, op('S1'), 350, async () => { assert.equal(await op('S1').getAttribute('aria-pressed'), 'true', 'S1 queda pulsado mientras el dedo está apoyado'); assert.equal(await st('KM1').innerText(), 'Excitado'); });
    assert.equal(await op('S1').getAttribute('aria-pressed'), 'false'); assert.equal(await st('M1').innerText(), 'Alimentado', 'el sello del programa mantiene el motor al levantar el dedo');
    pass('Mantener S1 con el dedo arranca el motor y soltarlo no lo detiene (sello del PLC)');
    await p.getByRole('button', {name: 'Cerrar Instrumentos'}).tap(); await p.locator('.ind-views').getByRole('button', {name: 'HMI', exact: true}).tap(); await p.waitForTimeout(300);
    await hold(cdp, p.getByRole('button', {name: 'PARO', exact: true}));
    assert.equal(await p.locator('.ind-lamp[data-on=true]').count(), 0, 'PARO con el dedo apaga el motor');
    await hold(cdp, p.getByRole('button', {name: 'MARCHA', exact: true}));
    assert.equal(await p.locator('.ind-lamp[data-on=true]').count(), 1, 'MARCHA con el dedo arranca');
    await p.screenshot({path: out + '/tactil-1-hmi.png'});
    pass('Los botones de la HMI se mantienen con el dedo: PARO apaga y MARCHA arranca con sello');
    await c.close();

    // 2) Construir con el dedo: arrastrar una pieza suelta en 3D
    ({c, p, cdp} = await open(b, buildLib));
    const saved = () => p.evaluate(k => { const l = JSON.parse(localStorage.getItem(k)); return l.projects.find(x => x.id === l.active); }, LIB);
    await p.getByRole('button', {name: 'Piezas', exact: true}).tap(); await p.waitForTimeout(300);
    const before = (await saved()).poses.bloqueB.position, box = await p.locator('canvas').first().boundingBox();
    const a = project([before[0], 0.2, before[2]], box), z = project([before[0] + 0.8, 0.2, before[2] - 0.7], box);
    await touch(cdp, 'touchStart', a.x, a.y); for (let i = 1; i <= 12; i++) { await touch(cdp, 'touchMove', a.x + (z.x - a.x) * i / 12, a.y + (z.y - a.y) * i / 12); await new Promise(r => setTimeout(r, 30)); } await touch(cdp, 'touchEnd'); await p.waitForTimeout(800);
    const after = (await saved()).poses.bloqueB.position;
    assert.ok(Math.hypot(after[0] - before[0], after[2] - before[2]) > 0.4, `la pieza se movió (${before} → ${after})`);
    for (const v of [after[0], after[2]]) assert.ok(Math.abs(v / 0.05 - Math.round(v / 0.05)) < 1e-3, 'ajustada a la rejilla del imán');
    await p.screenshot({path: out + '/tactil-2-arrastre.png'});
    pass('Arrastrar una pieza en el escenario con el dedo la mueve y la ajusta al imán, sin orbitar la cámara');
    // La cámara no se movió con ese arrastre
    const ui = await p.evaluate(() => { const k = Object.keys(localStorage).find(x => x.startsWith('modo:industria:ui:')); return k ? JSON.parse(localStorage.getItem(k)).camera : null; });
    if (ui) assert.deepEqual(ui.position, [6, 5, 7], 'la cámara sigue donde estaba');
    pass('El arrastre de una pieza no mueve la cámara');
    await c.close();
    assert.deepEqual(report.errors, [], 'errores de consola o de página');
    pass('Cero errores de consola y de JavaScript');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/tactil-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
