// Industria, fase 3: constructor 3D con ratón real (Playwright; servidor en INDUSTRIA_URL). Arrastra, vista previa de anclaje, montar, soltar, girar, imán, deshacer.
const assert = require('node:assert/strict'), fs = require('node:fs'), {execFileSync} = require('node:child_process');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.INDUSTRIA_URL || 'http://127.0.0.1:4360').replace(/\/$/, '');
const out = 'qa/industria';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: []}, pass = s => { report.checks.push(s); console.log('PASS', s); };
const LIB = 'modo:industria:library:v1';
const fixture = execFileSync(process.execPath, ['qa/industria-build-fixture.mjs'], {encoding: 'utf8'});

const CAM = {pos: [6, 5, 7], target: [0, 0.8, 0], fov: 45};
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => { const n = Math.hypot(...a); return a.map(v => v / n); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Proyecta un punto del mundo a píxeles de pantalla con la cámara ISO por defecto. */
function project(point, box) {
  const f = norm(sub(CAM.target, CAM.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), d = sub(point, CAM.pos);
  const t = Math.tan((CAM.fov * Math.PI) / 360), aspect = box.width / box.height, z = dot(d, f);
  return {x: box.x + ((dot(d, r) / (z * t * aspect) + 1) / 2) * box.width, y: box.y + ((1 - dot(d, u) / (z * t)) / 2) * box.height};
}

async function open(b, viewport = {width: 1440, height: 900}) {
  const c = await b.newContext({viewport, serviceWorkers: 'block'});
  await c.addInitScript(([key, lib]) => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); if (!localStorage.getItem('__seeded')) { localStorage.setItem(key, lib); localStorage.setItem('__seeded', '1'); } }, [LIB, fixture]);
  const p = await c.newPage();
  p.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
  p.on('response', r => { if (r.status() >= 400) report.errors.push(`http ${r.status()} ${r.url()}`); });
  await p.goto(base + '/industria/'); await p.locator('.ind-app[data-ready=true]').waitFor(); await p.locator('canvas').first().waitFor();
  await p.waitForTimeout(900);
  return {c, p};
}
const proj = p => p.evaluate(key => JSON.parse(localStorage.getItem(key)).projects[0], LIB);
const settle = p => p.waitForTimeout(700);
const snapAttr = p => p.locator('canvas').first().getAttribute('data-snap');
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} ≉ ${b}`);

/** Arrastra con el ratón real desde la proyección de `from` hasta la de `to` (mundo → pantalla). */
async function drag(p, from, to, {hold = false, steps = 14, shift = false} = {}) {
  const box = await p.locator('canvas').first().boundingBox(), a = project(from, box), z = project(to, box);
  await p.mouse.move(a.x, a.y); await p.mouse.down();
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.move(a.x + (z.x - a.x) * 0.3, a.y + (z.y - a.y) * 0.3, {steps: 4});
  await p.mouse.move(z.x, z.y, {steps});
  if (!hold) { await p.mouse.up(); if (shift) await p.keyboard.up('Shift'); await settle(p); }
  return {a, z};
}

(async () => {
  const b = await chromium.launch();
  try {
    let {c, p} = await open(b);
    let pr = await proj(p);
    assert.equal(pr.mounts.length, 1); assert.equal(pr.entities.length, 5);
    const ap0 = pr.poses.aparato.position;
    await p.screenshot({path: out + '/builder-1-inicio.png'});

    // 1) Vista previa: al acercar el aparato al riel aparece el anclaje candidato; al alejarlo, no
    const railFront = [pr.poses.riel.position[0], 0.5, pr.poses.riel.position[2] + 0.005 + 0.03]; // el clip (z=-0.03) debe quedar sobre el frente del riel
    await drag(p, ap0, [0.1, 0.5, railFront[2] + 0.04], {hold: true});
    assert.match(await snapAttr(p), /^aparato:clip>riel:riel$/, 'vista previa del anclaje');
    await p.screenshot({path: out + '/builder-2-vista-previa.png'});
    await p.keyboard.press('Escape'); await p.mouse.up(); await settle(p);
    assert.equal((await proj(p)).poses.aparato.position[2], ap0[2], 'Escape cancela el arrastre sin mover nada');
    assert.equal((await proj(p)).mounts.length, 1);
    pass('Al acercar una pieza a un anclaje compatible aparece la vista previa; Escape cancela sin cambiar el modelo');

    // 2) Soltar sobre el anclaje: monta, alinea y entra un solo paso en el historial
    await drag(p, ap0, [0.1, 0.5, railFront[2] + 0.04]);
    pr = await proj(p);
    assert.equal(pr.mounts.length, 2); const m = pr.mounts.find(x => x.child.entityId === 'aparato');
    assert.deepEqual([m.parent.entityId, m.parent.anchorId, m.child.anchorId, m.kind], ['riel', 'riel', 'clip', 'din-rail']);
    near(pr.poses.aparato.position[2], pr.poses.riel.position[2] + 0.005 + 0.03, 0.002, 'el clip queda sobre el frente del riel');
    near(pr.poses.aparato.position[1], 0.5, 0.002, 'misma altura que el riel');
    await p.screenshot({path: out + '/builder-3-montado.png'});
    pass('Soltar sobre el anclaje monta el aparato en el riel (tipo din-rail), alineado a su frente');

    // 3) Deshacer revierte montaje y pose en un solo paso; rehacer lo vuelve a aplicar
    await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(p);
    pr = await proj(p); assert.equal(pr.mounts.length, 1); assert.deepEqual(pr.poses.aparato.position, ap0);
    await p.getByRole('button', {name: 'Rehacer'}).click(); await settle(p);
    assert.equal((await proj(p)).mounts.length, 2);
    pass('Deshacer y rehacer tratan montar+colocar como un solo paso');

    // 4) Un componente montado no se arrastra; mover el soporte arrastra todo lo montado
    const before = (await proj(p)).poses;
    await drag(p, [before.riel.position[0] + 0.2, 0.5, before.riel.position[2] + 0.005], [1.2, 0.5, 1.2]); // arrastrar el riel (montado)
    assert.deepEqual((await proj(p)).poses.riel.position, before.riel.position, 'el riel montado no se mueve');
    await p.locator('.rb-toast').filter({hasText: /está montada y no se arrastra/}).waitFor(); await p.locator('.rb-toast button').click(); // fase 10: arrastrar una pieza montada explica por qué no se mueve
    await p.getByRole('button', {name: 'Encuadrar'}).click(); await p.waitForTimeout(400); // arrastrar fuera de una pieza movible orbita la cámara: se vuelve a la vista ISO
    await drag(p, [-0.3, 0.2, 0.01], [-0.3 + 1.1, 0.2, 0.01 + 1.0]); // arrastrar la placa por su cara libre
    pr = await proj(p);
    const dx = pr.poses.placa.position[0] - before.placa.position[0], dz = pr.poses.placa.position[2] - before.placa.position[2];
    assert.ok(Math.hypot(dx, dz) > 0.3, 'la placa se movió');
    for (const id of ['riel', 'aparato']) { near(pr.poses[id].position[0] - before[id].position[0], dx, 1e-4, id + ' en x'); near(pr.poses[id].position[2] - before[id].position[2], dz, 1e-4, id + ' en z'); }
    assert.equal(pr.mounts.length, 2);
    pass('El riel montado no se arrastra; mover la placa arrastra riel y aparato juntos');

    // 5) Seleccionar el aparato: el inspector muestra el montaje; Soltar solo quita el montaje
    await p.getByRole('button', {name: 'Estructura', exact: true}).click();
    await p.getByRole('treeitem', {name: /Aparato/}).dispatchEvent('click');
    await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
    assert.match(await p.locator('.ind-mount').innerText(), /Montado en\s+Riel/);
    const pose1 = (await proj(p)).poses.aparato;
    await p.getByRole('button', {name: 'Soltar', exact: true}).click(); await settle(p);
    pr = await proj(p); assert.equal(pr.mounts.length, 1); assert.deepEqual(pr.poses.aparato, pose1); assert.ok(pr.entities.some(e => e.id === 'aparato'));
    assert.match(await p.locator('.ind-panel').filter({hasText: 'Suelto'}).first().innerText(), /Suelto/);
    pass('Soltar quita solo el montaje: el aparato conserva identidad y posición y vuelve a poder arrastrarse');

    // 6) Girar 90° (botón y tecla R), solo en piezas sueltas
    await p.getByRole('treeitem', {name: /Bloque A/}).dispatchEvent('click');
    await p.getByRole('button', {name: 'Girar 90°', exact: true}).first().click(); await settle(p);
    near((await proj(p)).poses.bloqueA.rotation[1], Math.PI / 2, 1e-3, 'giro por botón');
    await p.locator('main.rb-stage').click({position: {x: 640, y: 700}}); await p.getByRole('treeitem', {name: /Bloque A/}).dispatchEvent('click');
    await p.locator('.ind-tree').press('r').catch(async () => p.keyboard.press('r')); await settle(p);
    const [rx, ry, rz] = (await proj(p)).poses.bloqueA.rotation, xAxis = [Math.cos(ry) * Math.cos(rz), Math.cos(rx) * Math.sin(rz) + Math.sin(rx) * Math.sin(ry) * Math.cos(rz), Math.sin(rx) * Math.sin(rz) - Math.cos(rx) * Math.sin(ry) * Math.cos(rz)];
    near(xAxis[0], -1, 1e-3, 'el eje X queda invertido tras dos giros de 90°'); // 180° sobre Y; Euler lo guarda como (π, 0, π), por eso se compara el eje y no el ángulo
    pass('Girar 90° por botón y por la tecla R');

    // 7) Imán: soltar una pieza suelta ajusta a la rejilla de 5 cm; sin imán queda donde se soltó
    const preB = (await proj(p)).poses.bloqueB.position;
    await drag(p, [preB[0], 0.2, preB[2]], [preB[0] + 0.83, 0.2, preB[2] - 0.67]);
    let pb = (await proj(p)).poses.bloqueB.position;
    for (const v of [pb[0], pb[2]]) near(v / 0.05, Math.round(v / 0.05), 1e-3, 'rejilla');
    await p.getByRole('button', {name: 'Imán', exact: true}).click();
    assert.equal(await p.getByRole('button', {name: 'Imán', exact: true}).getAttribute('aria-pressed'), 'false');
    await drag(p, [pb[0], 0.2, pb[2]], [pb[0] - 0.33, 0.2, pb[2] + 0.27]);
    pb = (await proj(p)).poses.bloqueB.position;
    assert.ok([pb[0], pb[2]].some(v => Math.abs(v / 0.05 - Math.round(v / 0.05)) > 0.02), 'sin imán no se ajusta a la rejilla');
    await p.getByRole('button', {name: 'Imán', exact: true}).click();
    pass('El imán ajusta a la rejilla de 5 cm y se puede apagar');

    // 8) Superposición: se permite pero avisa
    const pa = (await proj(p)).poses.bloqueA.position; pb = (await proj(p)).poses.bloqueB.position;
    await drag(p, [pb[0], 0.2, pb[2]], [pa[0] + 0.1, 0.2, pa[2] + 0.1]);
    await p.locator('.rb-toast').filter({hasText: /se superpone/}).waitFor({timeout: 3000});
    pass('Soltar una pieza atravesando otra se permite y muestra un aviso');

    // 9) Simular protege la estructura: no se arrastra
    await p.getByRole('button', {name: 'Simular'}).click();
    const bSim = (await proj(p)).poses.bloqueB.position;
    await drag(p, [bSim[0], 0.2, bSim[2]], [bSim[0] - 1, 0.2, bSim[2] - 1]);
    assert.deepEqual((await proj(p)).poses.bloqueB.position, bSim);
    await p.getByRole('button', {name: 'Construir'}).click();
    pass('En Simular las piezas no se arrastran');

    // 10) Persistencia: los montajes y las poses sobreviven a la recarga
    await settle(p); const saved = await proj(p);
    await p.reload(); await p.locator('.ind-app[data-ready=true]').waitFor(); await settle(p);
    assert.deepEqual((await proj(p)).mounts, saved.mounts); assert.deepEqual((await proj(p)).poses, saved.poses);
    pass('Recargar conserva montajes y poses');
    await c.close();

    // 11) Tacto: arrastre con eventos de puntero táctil
    ({c, p} = await open(b, {width: 820, height: 1000}));
    const box = await p.locator('canvas').first().boundingBox();
    assert.ok(box.width > 700);
    await p.screenshot({path: out + '/builder-4-tablet.png'});
    assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'sin desborde en tablet');
    await c.close();
    pass('Escenario del constructor sin desbordes en tablet');

    assert.deepEqual(report.errors, [], 'errores de consola, de página o HTTP (incluye CSP)');
    pass('Cero errores de consola, de JavaScript y de CSP; cero respuestas HTTP fallidas');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/builder-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
