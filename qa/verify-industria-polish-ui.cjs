// Industria, fase 10: pendientes de interfaz de las fases 3 a 8 — aviso al arrastrar una pieza montada, giro en grados, paneles escalonados, panel Piezas más ancho,
// esquema descargable, motor que gira, alzado que cabe en pantalla y pulsador NC. (Playwright; servidor en INDUSTRIA_URL.)
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

(async () => {
  const b = await chromium.launch();
  try {
    // — Escenario de construcción —
    let {c, p, stored} = await open(b, buildLib);
    const settle = () => p.waitForTimeout(700);

    // 1) Arrastrar una pieza montada explica por qué no se mueve
    const pr = await stored(), rail = pr.poses.riel.position, box = await p.locator('canvas').first().boundingBox();
    const a = project([rail[0] + 0.2, 0.5, rail[2] + 0.005], box), z = project([1.2, 0.5, 1.2], box);
    await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(z.x, z.y, {steps: 10}); await p.mouse.up();
    await p.locator('.rb-toast').filter({hasText: /está montada y no se arrastra/}).waitFor({timeout: 4000});
    assert.deepEqual((await stored()).poses.riel.position, rail); await p.locator('.rb-toast button').click();
    pass('Arrastrar una pieza montada muestra un aviso que explica cómo moverla y no cambia nada');

    // 2) Giro en grados desde Propiedades
    await p.getByRole('button', {name: 'Estructura', exact: true}).click(); await p.getByRole('treeitem', {name: /Bloque A/}).dispatchEvent('click');
    await p.getByRole('button', {name: 'Propiedades', exact: true}).click();
    const giroY = p.getByLabel('Giro Y'); assert.equal(await giroY.inputValue(), '0'); await giroY.fill('90'); await giroY.press('Enter'); await settle();
    const rot = (await stored()).poses.bloqueA.rotation; assert.ok(Math.abs(rot[1] - Math.PI / 2) < 1e-3, `giro Y = ${rot}`);
    assert.equal(await giroY.inputValue(), '90'); await p.getByRole('button', {name: 'Deshacer'}).click(); await settle(); assert.ok(Math.abs((await stored()).poses.bloqueA.rotation[1]) < 1e-6);
    await p.getByRole('treeitem', {name: /Riel/}).dispatchEvent('click'); assert.ok(await p.getByLabel('Giro Y').isDisabled(), 'una pieza montada no se gira a mano');
    pass('El inspector gira la pieza en grados (X, Y, Z), entra en Deshacer y se bloquea en piezas montadas');

    // 3) Paneles de la derecha escalonados: todos los títulos quedan a la vista
    await p.getByRole('button', {name: 'Instrumentos', exact: true}).click(); await p.getByRole('button', {name: 'Conexiones', exact: true}).click(); await p.waitForTimeout(300);
    const heads = await p.locator('.ind-window:not(.ind-window-library)').evaluateAll(ws => ws.map(w => { const r = w.getBoundingClientRect(), h = w.querySelector('header, [class*=title]') ?? w; const hr = h.getBoundingClientRect(); const top = document.elementFromPoint(hr.x + 30, hr.y + 8); return {y: Math.round(r.y), title: w.getAttribute('aria-labelledby') ? document.getElementById(w.getAttribute('aria-labelledby'))?.textContent : '', topIsOwn: !!top && w.contains(top)}; }));
    assert.equal(heads.length, 4); const ys = heads.map(h => h.y); assert.deepEqual([...ys].sort((x, y) => x - y), ys, 'se apilan de arriba hacia abajo'); assert.ok(new Set(ys).size === 4 && ys.every((y, i) => i === 0 || y - ys[i - 1] >= 40), `escalonados: ${ys}`); assert.ok(heads.every(h => h.topIsOwn), 'cada título está a la vista');
    const dockTop = (await p.locator('nav.rb-dock').boundingBox()).y; for (const wb of await p.locator('.ind-window').evaluateAll(ws => ws.map(w => { const r = w.getBoundingClientRect(); return r.y + r.height; }))) assert.ok(wb <= dockTop + 2, 'ninguna ventana tapa el dock');
    await p.screenshot({path: out + '/pulido-1-paneles.png'});
    pass('Cuatro paneles abiertos a la vez: se escalonan, cada título queda a la vista y ninguno tapa el dock');
    for (const name of ['Instrumentos', 'Conexiones', 'Propiedades', 'Estructura']) await p.getByRole('button', {name, exact: true}).click();

    // 4) Panel Piezas más ancho
    const lw = (await p.locator('.ind-window-library').boundingBox()).width; assert.ok(lw >= 290, `ancho del panel Piezas ${lw}`);
    pass(`El panel Piezas tiene ${Math.round(lw)} px de ancho (antes ≈210)`);

    // 5) Pulsador NC colocable y operable
    await p.getByLabel('Buscar en la biblioteca').fill('pulsador nc'); await p.locator('.ind-shapes > li').first().locator(':scope > button').click(); await settle();
    assert.ok((await stored()).entities.some(e => e.definitionId === 'pulsador-nc'));
    await p.getByRole('button', {name: 'Ejecutar'}).click(); await p.getByRole('button', {name: 'Instrumentos', exact: true}).click();
    assert.match(await p.getByRole('list', {name: 'Mandos'}).innerText(), /Pulsador NC/);
    pass('El pulsador NC se coloca desde la biblioteca y aparece entre los mandos');
    await c.close();

    // — Escenario con PLC —
    ({c, p, stored} = await open(b, plcLib));
    await p.getByRole('button', {name: 'Piezas', exact: true}).click();
    // 6) Esquema descargable
    await p.locator('.ind-views').getByRole('button', {name: 'Diagramas', exact: true}).click();
    const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', {name: /Esquema \(\.svg\)/}).click()]);
    assert.match(dl.suggestedFilename(), /\.esquema-hoja1\.svg$/); const svg = fs.readFileSync(await dl.path(), 'utf8');
    assert.ok(svg.startsWith('<svg') && svg.includes('xmlns="http://www.w3.org/2000/svg"') && svg.endsWith('</svg>')); for (const t of ['KM1', 'QF1', 'Red 3F', 'U1']) assert.ok(svg.includes('>' + t + '<'), t); assert.ok(svg.includes('→ hoja 2 ·'), 'las referencias a la otra hoja van en el archivo');
    assert.ok(!svg.includes('stroke="transparent"'), 'sin las zonas de pulsación invisibles'); assert.ok(svg.includes('<style>') && svg.includes('<rect width='));
    fs.writeFileSync(out + '/esquema-exportado.svg', svg);
    pass('La hoja del esquema se descarga como SVG autónomo (con estilos, fondo, símbolos y referencias a otras hojas)');

    // 6b) Impresión: con medios de impresión solo se ve la documentación (o el esquema) y el navegador genera un PDF real
    await p.locator('.ind-views').getByRole('button', {name: 'Diagramas', exact: true}).click(); await p.emulateMedia({media: 'print'});
    const vis2 = await p.evaluate(() => ({diagram: getComputedStyle(document.querySelector('.ind-diagram')).visibility, bar: getComputedStyle(document.querySelector('.ind-diagram-bar button')).display, header: getComputedStyle(document.querySelector('header.rb-bar')).visibility})); assert.deepEqual(vis2, {diagram: 'visible', bar: 'none', header: 'hidden'});
    await p.emulateMedia({media: 'screen'}); await p.locator('.ind-views').getByRole('button', {name: 'Documentación', exact: true}).click(); await p.emulateMedia({media: 'print'});
    const vis = await p.evaluate(() => ({header: getComputedStyle(document.querySelector('header.rb-bar')).visibility, docs: getComputedStyle(document.querySelector('.ind-docs')).visibility, dock: getComputedStyle(document.querySelector('nav.rb-dock')).visibility, button: getComputedStyle(document.querySelector('.ind-docs .ind-plc-head button')).display}));
    assert.deepEqual(vis, {header: 'hidden', docs: 'visible', dock: 'hidden', button: 'none'}); const pdf = await p.pdf({format: 'A4'}); assert.ok(pdf.length > 5000 && pdf.slice(0, 4).toString() === '%PDF', `PDF de ${pdf.length} bytes`); fs.writeFileSync(out + '/documentacion.pdf', pdf);
    await p.emulateMedia({media: 'screen'});
    pass('Al imprimir solo se ve la documentación o el esquema (sin barra, dock ni botones) y el navegador genera un PDF real');

    // 7) Alzado del tablero: cabe sin desplazar y los aparatos angostos llevan el rótulo girado
    await p.locator('.ind-views').getByRole('button', {name: 'Tablero', exact: true}).click(); await p.waitForTimeout(300);
    const fit = await p.evaluate(() => { const s = document.querySelector('.ind-board-scroll'), v = s.querySelector('svg').getBoundingClientRect(), r = s.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), sh: s.scrollHeight, ch: s.clientHeight, inside: v.x >= r.x - 1 && v.y >= r.y - 1 && v.x + v.width <= r.x + r.width + 1 && v.y + v.height <= r.y + r.height + 1}; });
    assert.ok(fit.inside && fit.sh <= fit.ch + 2, `el alzado cabe sin desplazar ${JSON.stringify(fit)}`);
    assert.equal(await p.locator('svg g[data-device="qf2"] text[transform*="rotate(-90)"]').count(), 1, 'rótulo girado en el aparato de 17,5 mm'); assert.equal(await p.locator('svg g[data-device="km1"] text:not([transform])').count(), 1);
    await p.screenshot({path: out + '/pulido-2-tablero.png'});
    pass('El alzado del tablero se ajusta a la pantalla sin desplazarse y los aparatos angostos muestran su rótulo girado');

    // 8) El motor gira mientras está alimentado
    await p.locator('.ind-views').getByRole('button', {name: 'Planta 3D', exact: true}).click(); await p.getByRole('button', {name: 'Ejecutar'}).click(); await p.getByRole('button', {name: 'Instrumentos', exact: true}).click();
    const canvas = p.locator('canvas').first(), op = name => p.getByRole('list', {name: 'Mandos'}).getByRole('button', {name: new RegExp('^' + name)});
    assert.equal(await canvas.getAttribute('data-spinning'), '0'); await op('QF1').click(); await op('QF2').click();
    const s1 = await op('S1').boundingBox(); await p.mouse.move(s1.x + s1.width / 2, s1.y + s1.height / 2); await p.mouse.down(); await p.waitForTimeout(300); assert.equal(await canvas.getAttribute('data-spinning'), '1'); await p.mouse.up(); await p.waitForTimeout(300);
    assert.equal(await canvas.getAttribute('data-spinning'), '1', 'sigue girando por el sello'); await p.getByRole('button', {name: 'Detener'}).click(); await p.waitForTimeout(300); assert.equal(await canvas.getAttribute('data-spinning'), '0');
    pass('El motor alimentado gira (marcador animado), sigue girando con el sello y se detiene con Detener');
    await c.close();

    // 9) Con dedo: la nota de cableado avisa que conviene acercar la cámara o usar el panel
    ({c, p} = await open(b, plcLib, {viewport: {width: 820, height: 1100}, hasTouch: true, isMobile: true}));
    await p.getByRole('button', {name: 'Cablear', exact: true}).tap(); assert.match(await p.locator('.ind-wire-note').innerText(), /Con el dedo, acerca la cámara o usa el panel Conexiones/);
    pass('Con pantalla táctil, el modo Cablear sugiere acercar la cámara o usar el panel');
    await c.close();

    assert.deepEqual(report.errors, [], 'errores de consola o de página');
    pass('Cero errores de consola y de JavaScript');
  } finally {
    await b.close();
    fs.writeFileSync(out + '/pulido-report.json', JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
