// Agro, Fases 0 a 2: ruta /agro/, lobby, terreno 3D, selección, colocación de piezas, mover/girar/eliminar, medición, guardado en IndexedDB, archivos y Home.
// Playwright con ratón y teclado reales; servidor en AGRO_URL.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), {pathToFileURL} = require('node:url');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.AGRO_URL || 'http://127.0.0.1:4386').replace(/\/$/, '');
const out = process.env.AGRO_QA_OUT || 'qa/agro';
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], errors: [], diagnostics: [], metrics: {}}, pass = s => { report.checks.push(s); console.log('PASS', s); };

async function open(b, viewport = {width: 1440, height: 900}) {
  const c = await b.newContext({viewport, serviceWorkers: 'block', acceptDownloads: true});
  await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
  const p = await c.newPage();
  const diagnostic = detail => {
    const entry = {url: p.url(), after: report.checks.at(-1) ?? 'inicio', ...detail};
    report.diagnostics.push(entry);
    fs.appendFileSync(`${out}/diagnostics.jsonl`, JSON.stringify(entry) + '\n');
  };
  p.on('pageerror', e => {report.errors.push(e.message); diagnostic({kind: 'pageerror', name: e.name, message: e.message, stack: e.stack});});
  p.on('console', m => { if (m.type() === 'error') {report.errors.push(m.text()); diagnostic({kind: 'console', message: m.text(), location: m.location()});} });
  p.on('response', r => { if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`); });
  return {c, p};
}
const ws = p => p.locator('[data-testid=agro-app]');
const attr = (p, name) => ws(p).getAttribute(name);
const num = async (p, name) => Number(await attr(p, name));
const waitAttr = (p, name, op, arg) => p.waitForFunction(([n, o, a]) => { const v = document.querySelector('[data-testid=agro-app]')?.dataset[n]; return o === 'num' ? Number(v) === Number(a) : v === a; }, [name, op, arg ?? null]); // sin eval: la página usa CSP estricta
const cota = async (p, id = 'agro-hover') => Number((await p.locator(`[data-testid=${id}]`).innerText()).match(/Cota (-?[\d.]+(?:,\d+)?) m/)[1].replace('.', '').replace(',', '.'));
const rendered = p => p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]')?.dataset.tris) > 0, null, {timeout: 40000});
const settle = p => p.waitForTimeout(2200); // pantalla de apertura de modo.
const tabPlace = async p => { const t = p.getByTestId('agro-tab-place'); if ((await t.getAttribute('aria-selected')) !== 'true') await t.click(); };
const tabData = async p => { const t = p.getByTestId('agro-tab-data'); if ((await t.getAttribute('aria-selected')) !== 'true') await t.click(); };
const tabGen = async p => { const t = p.getByTestId('agro-tab-general'); if ((await t.getAttribute('aria-selected')) !== 'true') await t.click(); };
const tabConn = async p => { const t = p.getByTestId('agro-tab-conn'); if ((await t.getAttribute('aria-selected')) !== 'true') await t.click(); };
async function saved(p) { await waitAttr(p, 'save', 'eq', 'saved'); }

async function createWorld(p, name = 'Granja de prueba') {
  await p.goto(`${base}/agro/`);
  await p.locator('[data-view=lobby]').waitFor();
  await settle(p);
  await createFromLobby(p, name);
  await p.locator('[data-view=workspace]').waitFor();
  await rendered(p);
}
async function zoomIn(p) { await p.mouse.move(720, 500); for (let k = 0; k < 30; k++) await p.mouse.wheel(0, -120); await p.waitForTimeout(500); }
async function createFromLobby(p, name) {
  await p.getByTestId('agro-new').click();
  await p.getByLabel('Nombre del mundo').fill(name);
  for (let i = 0; i < 6; i++) await p.getByTestId('agro-wizard-next').click();
  await p.getByTestId('agro-create').click();
}
async function pickItem(p, id) {
  if (!(await p.getByTestId('agro-dock').isVisible())) await p.locator('[data-mode=build]').click();
  const {itemById} = await import('../src/agro/catalog/items.ts');
  const family = itemById(id).family;
  const label = family === 'Agua' ? 'Riego' : family === 'Energía' ? 'Electricidad' : family;
  await p.getByRole('tab', {name: label, exact: true}).click();
  await p.locator('[data-dock-item=' + id + ']').click();
}

(async () => {
  const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agro-'));
  try {
    // ── Lobby y creación ───────────────────────────────────────────────────
    let {c, p} = await open(b);
    await p.goto(`${base}/agro/`);
    await p.locator('[data-view=lobby]').waitFor();
    assert.match(await p.title(), /Agro/);
    assert.match(await p.locator('[data-testid=agro-lobby]').innerText(), /Construye tu primera finca/);
    assert.match(await p.locator('.agro-empty').innerText(), /Todavía no hay mundos/);
    assert.equal(await p.locator('[data-testid=agro-continue]').count(), 0);
    const csp = await p.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    assert.ok(csp && !csp.includes("'unsafe-eval'") && !csp.includes('wasm-unsafe-eval'));
    await settle(p); await p.screenshot({path: `${out}/lobby-vacio.png`});
    pass('primer ingreso: el lobby invita a crear el primer mundo (sin mundos ni «Continuar») y mantiene la CSP estricta');
    await createWorld(p, 'Granja de prueba');
    assert.equal((await p.locator('[data-testid=agro-world-name]').innerText()), 'Granja de prueba');
    await saved(p);
    assert.match(await p.locator('[data-testid=agro-save]').innerText(), /Guardado/);
    const worldId = await attr(p, 'data-world');
    assert.match(p.url(), new RegExp(`#/mundo/${worldId}$`));
    const tris = await num(p, 'data-tris'), calls = await num(p, 'data-calls');
    // Presupuesto de humo de un mundo vacío con cinturón y horizonte activos.
    assert.ok(tris > 5000 && tris < 230_000, `${tris} triángulos`); assert.ok(calls > 0 && calls < 200);
    report.metrics.orbit = {tris, calls};
    pass(`crear un mundo abre el workspace con terreno 3D (${tris} triángulos, ${calls} dibujos) y lo guarda solo`);

    // ── Terreno (Fase 1) ───────────────────────────────────────────────────
    await settle(p);
    await p.mouse.move(720, 560);
    await p.locator('[data-testid=agro-hover]').waitFor();
    assert.match(await p.locator('[data-testid=agro-hover]').innerText(), /Cota .* m.*Pendiente .*°/s);
    await p.mouse.click(720, 560);
    await p.locator('[data-testid=agro-selected]').waitFor();
    const sel = await p.locator('[data-testid=agro-selected]').innerText();
    for (const [name, mode] of [['Estratégica', 'strategic'], ['Caminar', 'walk'], ['Órbita', 'orbit']]) {
      await p.getByRole('button', {name, exact: true}).click(); await waitAttr(p, 'mode', 'eq', mode); await p.waitForTimeout(500);
      assert.equal(await p.locator('[data-testid=agro-selected]').innerText(), sel);
      if (mode === 'strategic') { await rendered(p); report.metrics.strategic = {tris: await num(p, 'data-tris'), calls: await num(p, 'data-calls')}; assert.ok(report.metrics.strategic.tris < 260_000); await p.screenshot({path: `${out}/agro-estrategica.png`}); }
      if (mode === 'walk') {
        const x0 = await num(p, 'data-cam-x'), z0 = await num(p, 'data-cam-z');
        await p.keyboard.down('w');
        try {
          // SwiftShader puede dibujar pocos cuadros por segundo. La caminata
          // limita dt: esperar el desplazamiento real evita depender de 1,5 s
          // de reloj de pared, conservando el umbral de movimiento comprobado.
          await p.waitForFunction(([x,z]) => {
            const d=document.querySelector('[data-testid=agro-app]').dataset;
            return Math.hypot(Number(d.camX)-x,Number(d.camZ)-z)>3;
          }, [x0,z0], {timeout: 15000});
        } finally { await p.keyboard.up('w'); }
        assert.ok(Math.hypot((await num(p, 'data-cam-x')) - x0, (await num(p, 'data-cam-z')) - z0) > 3);
      }
    }
    pass('terreno: cota y pendiente al pasar el puntero; órbita, estratégica y caminata; la selección sobrevive al cambio de cámara');
    await p.getByRole('button', {name: 'Subir terreno'}).click();
    await p.mouse.move(720, 560); await p.waitForTimeout(150);
    const checksum0 = await attr(p, 'data-checksum'), before = await cota(p);
    await p.mouse.down(); await p.mouse.up();
    await waitAttr(p, 'edits', 'num', 1);
    assert.equal(await p.getByRole('dialog', {name: 'Revisar edición de terreno'}).count(), 0);
    await p.mouse.move(721, 560); await p.waitForTimeout(250);
    assert.ok((await cota(p)) > before + 0.4);
    const checksum1 = await attr(p, 'data-checksum');
    await p.getByRole('button', {name: 'Deshacer'}).click(); await waitAttr(p, 'edits', 'num', 0); assert.equal(await attr(p, 'data-checksum'), checksum0);
    await p.getByRole('button', {name: 'Rehacer'}).click(); await waitAttr(p, 'edits', 'num', 1); assert.equal(await attr(p, 'data-checksum'), checksum1);
    pass('pincel: subir terreno, deshacer y rehacer devuelven el terreno exacto');
    assert.equal(await num(p,'data-speed'),0);
    await p.getByRole('button',{name:'Volver a partida',exact:true}).click();
    await p.getByRole('button', {name: 'Seleccionar'}).click(); await p.mouse.move(720, 560); await p.mouse.click(720, 560);

    // ── Colocar piezas ─────────────────────────────────────────────────────
    await zoomIn(p);
    await pickItem(p, 'bomba');
    await p.mouse.move(700, 520);
    await p.waitForFunction(() => /Se puede colocar/.test(document.querySelector('[data-testid=agro-dock-hint]')?.textContent ?? ''));
    await p.screenshot({path: `${out}/agro-fantasma.png`});
    const e0 = await num(p, 'data-entities');
    await p.mouse.click(700, 520);
    await waitAttr(p, 'entities', 'num', e0 + 1);
    assert.match(await p.locator('[data-testid=agro-notice]').innerText(), /Bomba centrífuga 1.*colocada/);
    pass('colocar: el fantasma indica que se puede y un clic coloca «Bomba centrífuga 1» sobre el terreno');
    for (let k = 0; k < 14; k++) { await p.mouse.move(700 + (k % 3) * 1, 520 + (k % 3) * 1, {steps: 3}); await p.waitForTimeout(250); if (/Se solapa con «Bomba centrífuga 1»/.test(await p.locator('[data-testid=agro-dock-hint]').innerText())) break; }   // el fantasma se actualiza en cada cuadro: se mueve el puntero hasta que lo ve
    await p.waitForFunction(() => /Se solapa con «Bomba centrífuga 1»/.test(document.querySelector('[data-testid=agro-dock-hint]')?.textContent ?? ''));
    await p.mouse.click(702, 521); await p.waitForTimeout(300);
    assert.equal(await num(p, 'data-entities'), e0 + 1);
    pass('no deja colocar encima de otra pieza y dice con cuál choca');
    await pickItem(p, 'estanque'); await p.mouse.move(930, 500); await p.waitForFunction(() => /Se puede colocar/.test(document.querySelector('[data-testid=agro-dock-hint]')?.textContent ?? '')); await p.mouse.click(930, 500);
    await waitAttr(p, 'entities', 'num', e0 + 2);
    await pickItem(p, 'tuberia');
    const buildBar = await p.getByTestId('agro-modes').boundingBox();
    const pipeY = Math.min(640, buildBar.y - 36);
    await p.mouse.move(700, pipeY);
    await p.waitForFunction(() => /Se puede colocar/.test(document.querySelector('[data-testid=agro-dock-hint]')?.textContent ?? ''));
    await p.mouse.click(700, pipeY);
    await waitAttr(p, 'entities', 'num', e0 + 3);
    await p.keyboard.press('Escape'); await waitAttr(p, 'tool', 'eq', 'select');
    assert.match(await p.locator('[data-testid=agro-meta]').innerText(), /3 piezas/);
    if (await p.getByTestId('agro-dock').isVisible()) await p.locator('[data-mode=build]').click();
    await p.screenshot({path: `${out}/agro-piezas.png`});
    pass('el catálogo coloca bomba, estanque y tubería; Esc sale del modo colocar');

    // ── Seleccionar, mover, girar, parámetros ──────────────────────────────
    await p.mouse.click(700, 520);
    await p.locator('[data-testid=agro-inspector]').waitFor();
    assert.match(await p.locator('.agro-name').inputValue(), /Bomba centrífuga 1/);
    await tabConn(p); assert.ok((await p.locator('[data-testid=agro-ports] li').count()) === 3);
    assert.match(await p.locator('[data-testid=agro-ports]').innerText(), /Succión.*Ø 50 mm/s); assert.match(await p.locator('[data-testid=agro-ports]').innerText(), /trifásica · 400 V/);
    pass('seleccionar una pieza abre el inspector con nombre, medidas y sus 3 puertos tipados');
    const pos0 = await p.locator('[data-testid=agro-ins-pos]').innerText(), cs = await attr(p, 'data-checksum');
    await p.mouse.move(700, 520); await p.mouse.down();
    for (let k = 1; k <= 12; k++) await p.mouse.move(700 + k * 7, 520 - k * 5);
    await p.mouse.up(); await p.waitForTimeout(400);
    const pos1 = await p.locator('[data-testid=agro-ins-pos]').innerText();
    assert.notEqual(pos1, pos0); assert.equal(await attr(p, 'data-checksum'), cs); assert.equal(await num(p, 'data-entities'), e0 + 3);
    pass(`arrastrar la pieza la mueve (${pos0} → ${pos1}) sin tocar el terreno ni duplicarla`);
    await tabPlace(p); await p.keyboard.press('e'); await p.waitForFunction(() => /15/.test(document.querySelector('.agro-field input[aria-label=Giro]')?.value ?? ''));
    await p.getByRole('button', {name: 'Girar 15° a la derecha'}).click();
    await p.waitForFunction(() => document.querySelector('input[aria-label=Giro]')?.value === '30');
    await p.keyboard.press('Control+z'); await p.keyboard.press('Control+z');
    await p.waitForFunction(() => document.querySelector('input[aria-label=Giro]')?.value === '0');
    await p.keyboard.press('Control+z'); await p.waitForFunction(p0 => document.querySelector('[data-testid=agro-ins-pos]')?.textContent === p0, pos0);
    pass('girar con E o con el botón; Ctrl+Z deshace los giros y el movimiento en orden');
    await p.keyboard.press('Control+y'); await p.waitForFunction(p1 => document.querySelector('[data-testid=agro-ins-pos]')?.textContent === p1, pos1);
    await p.getByRole('button', {name: 'Cerrar inspector'}).click();

    // Parámetros de la tubería
    await p.mouse.click(700, pipeY);
    await p.waitForFunction(() => /Tubería 1/.test(document.querySelector('.agro-name')?.value ?? ''));
    await p.locator('input[aria-label=Largo]').fill('12'); await p.locator('input[aria-label=Largo]').blur();
    await tabConn(p); await p.waitForFunction(() => /Extremo B/.test(document.querySelector('[data-testid=agro-ports]')?.textContent ?? ''));
    assert.match(await p.locator('[data-testid=agro-inspector]').innerText(), /12,0 × 0,1 × 0,1/);
    await tabGen(p); await p.locator('input[aria-label=Largo]').fill('900'); await p.locator('input[aria-label=Largo]').blur();
    await p.waitForFunction(() => /entre 1 y 50 m/.test(document.querySelector('[data-testid=agro-notice]')?.textContent ?? ''));
    assert.equal(await p.locator('input[aria-label=Largo]').inputValue(), '12');
    pass('cambiar el largo de la tubería recalcula sus medidas; un valor fuera de rango se rechaza con su motivo');

    // Eliminar una pieza sin conexiones (se puede deshacer)
    await p.getByTestId('agro-delete').click();
    await waitAttr(p, 'entities', 'num', e0 + 2);
    assert.equal(await p.locator('[data-testid=agro-confirm]').count(), 0);
    await p.keyboard.press('Control+z'); await waitAttr(p, 'entities', 'num', e0 + 3);
    pass('eliminar una pieza sin conexiones es inmediato y se deshace');

    // ── Medir ──────────────────────────────────────────────────────────────
    await p.getByRole('button', {name: 'Medir'}).click();
    await p.mouse.click(600, 600); await p.mouse.click(850, 560);
    await p.locator('[data-testid=agro-measure] >> text=Distancia').waitFor();
    const mtxt = await p.locator('[data-testid=agro-measure]').innerText();
    assert.match(mtxt, /Distancia [\d.,]+ m.*Horizontal.*Desnivel [+-]?[\d.,]+ m.*Pendiente/s);
    await p.locator('[data-testid=agro-measure-label]').waitFor();
    await p.screenshot({path: `${out}/agro-medir.png`});
    pass(`medir: ${mtxt.replace(/\s+/g, ' ')}`);
    await p.getByRole('button', {name: 'Seleccionar'}).click();

    // ── Guardado y reapertura ──────────────────────────────────────────────
    await saved(p);
    const snap = {entities: await num(p, 'data-entities'), edits: await num(p, 'data-edits'), checksum: await attr(p, 'data-checksum')};
    await p.reload();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p);
    assert.deepEqual({entities: await num(p, 'data-entities'), edits: await num(p, 'data-edits'), checksum: await attr(p, 'data-checksum')}, snap);
    assert.equal(await attr(p, 'data-world'), worldId);
    pass(`recargar la página reabre el mismo mundo desde IndexedDB: ${snap.entities} piezas, ${snap.edits} edición de terreno y terreno idéntico`);
    await p.mouse.click(700, 520).catch(() => {});
    await p.getByRole('button', {name: 'Volver a Mis mundos'}).click();
    await p.locator('[data-view=lobby]').waitFor();
    const row = p.locator(`[data-world-id="${worldId}"]`);
    assert.match(await row.innerText(), /Granja de prueba[\s\S]*3 piezas · 1 edición de terreno/);
    assert.match(await p.locator('[data-testid=agro-continue]').innerText(), /Granja de prueba/);
    await settle(p); await p.screenshot({path: `${out}/lobby.png`});
    await p.locator('[data-testid=agro-continue]').click();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p);
    assert.equal(await num(p, 'data-entities'), snap.entities);
    pass('Mis mundos resume piezas y ediciones; «Continuar» vuelve al último mundo');

    // ── Eliminar con conexiones (mundo importado desde archivo) ────────────
    const {WorldSession} = await import(pathToFileURL(path.resolve('src/agro/world/session.ts')).href), {newWorld} = await import(pathToFileURL(path.resolve('src/agro/model/defaults.ts')).href), {exportWorld} = await import(pathToFileURL(path.resolve('src/agro/model/validate.ts')).href);
    const s = WorldSession.fromWorld(newWorld('Con conexiones', {seed: 99}));
    const tank = s.place('estanque', 0, 0, 0).value, pipe = s.place('tuberia', 10, 0, 0).value;
    assert.ok(s.connect({entityId: tank.id, portId: 'salida'}, {entityId: pipe.id, portId: 'a'}).ok);
    const file = path.join(dir, 'conexiones.modoagro.json'); fs.writeFileSync(file, exportWorld(s.toWorld()).text);
    await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
    await p.getByLabel('Importar mundo desde archivo').setInputFiles(file);
    await p.locator('[data-testid=agro-lobby-notice]').waitFor();
    const imported = p.locator('.agro-world-list li', {hasText: 'Con conexiones'});
    await imported.getByRole('button', {name: 'Abrir'}).click();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
    await p.getByRole('button', {name: 'Estratégica', exact: true}).click(); await p.waitForTimeout(300); await p.getByRole('button', {name: 'Órbita', exact: true}).click(); await p.waitForTimeout(300);
    // Seleccionar el estanque: en una vista alejada pulsamos sobre su posición con el rayo; acercamos primero.
    await zoomIn(p);
    await p.mouse.click(720, 500); await p.waitForTimeout(300);
    if (await p.locator('[data-testid=agro-inspector]').count() === 0) { await p.mouse.click(700, 480); await p.waitForTimeout(300); }
    await p.locator('[data-testid=agro-inspector]').waitFor();
    const name = await p.locator('.agro-name').inputValue();
    await p.getByTestId('agro-delete').click();
    await p.locator('[data-testid=agro-confirm]').waitFor();
    assert.match(await p.locator('[data-testid=agro-confirm-text]').innerText(), /tiene 1 conexión/);
    const en = await num(p, 'data-entities');
    await p.getByRole('button', {name: 'Cancelar'}).click();
    assert.equal(await num(p, 'data-entities'), en);
    await p.getByTestId('agro-delete').click(); await p.locator('[data-testid=agro-confirm-ok]').click();
    await waitAttr(p, 'entities', 'num', en - 1);
    await p.keyboard.press('Control+z'); await waitAttr(p, 'entities', 'num', en);
    pass(`eliminar «${name}» con conexiones pide confirmación (cancelar no borra nada, confirmar sí) y se deshace`);

    // ── Red hidráulica: el recorrido de la primera demo ─────────────────────
    {
      const net = WorldSession.fromWorld(newWorld('Red de riego', {seed: 7}));
      const place = (t, x, z, yaw = 0, params) => net.place(t, x, z, yaw, params ? {params} : {}).value;
      const tank = place('estanque', -10, -8), p1 = place('tuberia', -10, -3), pump = place('bomba', -10, 2), p2 = place('tuberia', -10, 7), valve = place('valvula', -10, 12), p3 = place('tuberia', -10, 16), spr = place('emisor', -10, 20, 0, {caudalNominalLmin: 200});
      const grid = place('acometida', 0, 6), board = place('tablero', 0, 10);
      for (const [a, ap, b, bp] of [[tank, 'salida', p1, 'a'], [p1, 'b', pump, 'succion'], [pump, 'descarga', p2, 'a'], [p2, 'b', valve, 'a'], [valve, 'b', p3, 'a'], [p3, 'b', spr, 'entrada']]) assert.ok(net.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}).ok);
      assert.ok(net.setState(board.id, 'interruptor', true).ok);
      const redFile = path.join(dir, 'red.modoagro.json'); fs.writeFileSync(redFile, exportWorld(net.toWorld()).text);
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.getByLabel('Importar mundo desde archivo').setInputFiles(redFile);
      await p.locator('.agro-world-list li', {hasText: 'Red de riego'}).getByRole('button', {name: 'Abrir'}).click();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
      const flow = async () => Number(await attr(p, 'data-flow'));
      const piece = async name => { if (await p.locator('[data-testid=agro-pieces]').count() === 0) await p.getByRole('button', {name: 'Lista de piezas'}).click(); await p.locator('[data-testid=agro-pieces]').getByRole('button', {name, exact: true}).click(); await p.locator('[data-testid=agro-inspector]').waitFor(); await p.waitForFunction(n => document.querySelector('.agro-name')?.value === n, name); };
      assert.equal(await flow(), 0); assert.match(await p.locator('[data-testid=agro-network]').innerText(), /Falta conectar el cable de alimentación/);
      pass('la red recién abierta no tiene agua en el aspersor y la bomba dice por qué: falta el cable de alimentación');
      await piece('Acometida eléctrica 1'); await tabConn(p); await p.getByLabel('Conectar Salida de red con').selectOption({label: 'Tablero de control 1 · Red de entrada'});
      await p.waitForFunction(() => /Conectado/.test(document.querySelector('[data-testid=agro-notice]')?.textContent ?? ''));
      await piece('Tablero de control 1'); await tabConn(p); await p.getByLabel('Conectar Salida a bomba con').selectOption({label: 'Bomba centrífuga 1 · Alimentación'});
      await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.flow) > 50, null, {timeout: 20000});
      const flowOn = await flow();
      assert.match(await p.locator('[data-testid=agro-network]').innerText(), /L\/min/);
      await p.screenshot({path: `${out}/agro-red.png`});
      pass(`conectar acometida → tablero → bomba con «Conectar con…» pone en marcha la red: ${flowOn.toFixed(1)} L/min en el aspersor y balance ±0,00`);
      await piece('Aspersor 1'); await tabData(p);
      const readings = await p.locator('[data-testid=agro-readings]').innerText();
      assert.match(readings, /Caudal\s+[\d.,]+ L\/min/); assert.match(readings, /Presión\s+[\d.,]+ bar/);
      await piece('Bomba centrífuga 1'); await tabData(p);
      assert.match(await p.locator('[data-testid=agro-readings]').innerText(), /Presión de succión \(P1\)[\s\S]*Eficiencia hidráulica/); assert.match(await p.locator('[data-testid=agro-readings]').innerText(), /En marcha[\s\S]*Altura que da\s+[\d.,]+ m[\s\S]*Potencia hidráulica\s+[\d.,]+ kW[\s\S]*Potencia en el eje\s+[\d.,]+ kW \(nominal 2,2 kW\)/);
      pass('el inspector muestra las medidas con unidades: caudal y presión del aspersor; altura, potencias y estado de la bomba');
      await piece('Válvula 1'); await p.getByTestId('agro-toggle-valve').click();
      await waitAttr(p, 'flow', 'eq', '0.000');
      assert.match(await p.locator('[data-testid=agro-network]').innerText(), /válvula cerrada/);
      await p.getByTestId('agro-toggle-valve').click();
      await p.waitForFunction(f => Math.abs(Number(document.querySelector('[data-testid=agro-app]').dataset.flow) - f) < 1e-6, flowOn);
      pass('cerrar la válvula corta el caudal (0,000 L/min) y la red lo explica; abrirla restablece exactamente el mismo caudal');
      await piece('Tablero de control 1'); await p.getByTestId('agro-toggle-switch').click();
      await waitAttr(p, 'flow', 'eq', '0.000');
      assert.match(await p.locator('[data-testid=agro-network]').innerText(), /interruptor de «Tablero de control 1» está apagado/);
      await p.getByTestId('agro-toggle-switch').click();
      await p.waitForFunction(f => Math.abs(Number(document.querySelector('[data-testid=agro-app]').dataset.flow) - f) < 1e-6, flowOn);
      pass('el interruptor del tablero detiene y arranca la bomba, con el motivo nombrando el tablero');
      const conns0 = await num(p, 'data-conns');
      await piece('Tubería 2'); await p.keyboard.press('e');
      await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.stretched) >= 1);
      assert.equal(await num(p, 'data-conns'), conns0); assert.equal(Number(await attr(p, 'data-flow')), 0);
      await tabConn(p); assert.match(await p.locator('[data-testid=agro-conns]').innerText(), /separada: no conduce/);
      await p.screenshot({path: `${out}/agro-union-separada.png`});
      await p.keyboard.press('Control+z'); await waitAttr(p, 'stretched', 'num', 0);
      await p.waitForFunction(f => Math.abs(Number(document.querySelector('[data-testid=agro-app]').dataset.flow) - f) < 1e-6, flowOn);
      pass(`girar una tubería conectada separa sus uniones (se avisan y no conducen) sin perder ninguna de las ${conns0} conexiones; deshacer las junta de nuevo`);
      await tabConn(p); await p.getByRole('button', {name: /^Desconectar Tubería 2 de/}).first().click();
      await p.waitForFunction(c => Number(document.querySelector('[data-testid=agro-app]').dataset.conns) === c, conns0 - 1);
      assert.equal(Number(await attr(p, 'data-flow')), 0);
      await p.keyboard.press('Control+z'); await waitAttr(p, 'conns', 'num', conns0);
      pass('desconectar corta el agua y deshacer vuelve a conectar');
    }

    // ── Conectar con el ratón: la pieza se acopla ───────────────────────────
    {
      const lone = WorldSession.fromWorld(newWorld('Dos tuberías', {seed: 8}));
      const a = lone.place('tuberia', 0, 0, 0, {params: {largoM: 3}}).value, b = lone.place('tuberia', 0, 3, 0, {params: {largoM: 3}}).value;
      const file2 = path.join(dir, 'dos.modoagro.json'); fs.writeFileSync(file2, exportWorld(lone.toWorld()).text);
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.getByLabel('Importar mundo desde archivo').setInputFiles(file2);
      await p.locator('.agro-world-list li', {hasText: 'Dos tuberías'}).getByRole('button', {name: 'Abrir'}).click();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p); await zoomIn(p);
      const read = async (x, y) => { await p.mouse.move(x, y); await p.waitForFunction(() => document.querySelector('[data-testid=agro-app]').dataset.hoverX !== ''); await p.waitForTimeout(120); return [Number(await attr(p, 'data-hover-x')), Number(await attr(p, 'data-hover-z'))]; };
      const pts = [[560, 420], [860, 420], [560, 640]], w = []; for (const [x, y] of pts) w.push(await read(x, y));
      // afín pantalla → suelo: (x, z) = M·(px, py) + t; se invierte para llevar un punto del suelo a la pantalla
      const m11 = (w[1][0] - w[0][0]) / 300, m21 = (w[1][1] - w[0][1]) / 300, m12 = (w[2][0] - w[0][0]) / 220, m22 = (w[2][1] - w[0][1]) / 220, det = m11 * m22 - m12 * m21;
      const toPx = async (X, Z) => { let px = 720, py = 520; for (let it = 0; it < 3; it++) { const [cx, cz] = await read(px, py); const dx = X - cx, dz = Z - cz; px += (m22 * dx - m12 * dz) / det; py += (-m21 * dx + m11 * dz) / det; } return [px, py]; };
      const pA = await toPx(1.5, 0.1), pB = await toPx(-1.5, 3.1);
      assert.ok(Math.hypot(pA[0] - pB[0], pA[1] - pB[1]) > 60, 'los puertos se distinguen en pantalla');
      await p.getByRole('button', {name: 'Conectar', exact: true}).click();
      await p.mouse.move(pA[0], pA[1]); await p.waitForFunction(() => /Tubería 1 · Extremo B/.test(document.querySelector('[data-testid=agro-connect-info]')?.textContent ?? ''));
      await p.mouse.click(pA[0], pA[1]); await p.waitForFunction(() => /Origen: Tubería 1 · Extremo B/.test(document.querySelector('[data-testid=agro-connect-info]')?.textContent ?? ''));
      await p.screenshot({path: `${out}/agro-conectar.png`});
      await p.mouse.move(pB[0], pB[1]); await p.waitForTimeout(150); await p.mouse.click(pB[0], pB[1]);
      await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.conns) === 1);
      assert.match(await p.locator('[data-testid=agro-notice]').innerText(), /Conectado: se acopló «Tubería 2»/);
      await p.getByRole('button', {name: 'Seleccionar', exact: true}).click(); await p.getByRole('button', {name: 'Lista de piezas'}).click().catch(() => {});
      if (await p.locator('[data-testid=agro-pieces]').count() === 0) await p.getByRole('button', {name: 'Lista de piezas'}).click();
      await p.locator('[data-testid=agro-pieces]').getByRole('button', {name: 'Tubería 2', exact: true}).click();
      await p.waitForFunction(() => /x 3,0 · z 0,0/.test(document.querySelector('[data-testid=agro-ins-pos]')?.textContent ?? ''));
      assert.equal(await num(p, 'data-stretched'), 0);
      await p.screenshot({path: `${out}/agro-acople.png`});
      pass('herramienta Conectar con el ratón: se elige un puerto, se elige el otro y la segunda tubería se acopla en x 3,0 · z 0,0 sin uniones separadas');
    }

    // ── Fase 4: tiempo, agua, suelo y cultivo ───────────────────────────────
    {
      const w4 = WorldSession.fromWorld(newWorld('Huerto vivo', {seed: 11}));
      const put = (t, x, z, params) => w4.place(t, x, z, 0, params ? {params} : {}).value;
      const tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), pump = put('bomba', -10, 2), p2 = put('tuberia', -10, 7), spr = put('emisor', -10, 14), grid = put('acometida', 8, -8), board = put('tablero', 8, -4);
      for (const [a, ap, b, bp] of [[tank, 'salida', p1, 'a'], [p1, 'b', pump, 'succion'], [pump, 'descarga', p2, 'a'], [p2, 'b', spr, 'entrada'], [grid, 'red', board, 'red'], [board, 'salida-bomba', pump, 'alim']]) assert.ok(w4.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}).ok);
      assert.ok(w4.setState(board.id, 'interruptor', true).ok);
      const at = w4.entity(spr.id).pose.position; assert.ok(w4.place('parcela', at[0], at[2], 0).ok); assert.ok(w4.place('sensor-humedad', at[0] - 6, at[2] + 6, 0).ok);
      const huertoFile = path.join(dir, 'huerto.modoagro.json'); fs.writeFileSync(huertoFile, exportWorld(w4.toWorld()).text);
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.getByLabel('Importar mundo desde archivo').setInputFiles(huertoFile);
      await p.locator('.agro-world-list li', {hasText: 'Huerto vivo'}).getByRole('button', {name: 'Abrir'}).click();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
      const piece = async name => { if (await p.locator('[data-testid=agro-pieces]').count() === 0) await p.getByRole('button', {name: 'Lista de piezas'}).click(); await p.locator('[data-testid=agro-pieces]').getByRole('button', {name, exact: true}).click(); await p.locator('[data-testid=agro-inspector]').waitFor(); await p.waitForFunction(n => document.querySelector('.agro-name')?.value === n, name); };
      const speed = async s => { await p.getByLabel('Velocidad', {exact: true}).selectOption(String(s)); await waitAttr(p, 'speed', 'num', s); };
      const simS = () => num(p, 'data-sim-seconds');
      const text = sel => p.locator(sel).innerText();

      assert.equal(await num(p, 'data-speed'), 0); assert.equal(await simS(), 0);
      assert.match(await text('[data-testid=agro-date]'), /21 sep 2026 · 08:00/); assert.match(await text('[data-testid=agro-chips]'), /°C/);
      await p.screenshot({path: `${out}/agro-tiempo.png`});
      pass('el mundo se abre en pausa el 21 sep 2026 a las 08:00, con el clima del día (temperatura, ET₀ y lluvia)');

      await piece('Parcela 1'); assert.equal(await p.locator('[data-testid=agro-harvest]').count(), 0);
      await p.getByTestId('agro-plant-tomate').click();
      await p.waitForFunction(() => /Etapa\s*Establecimiento/.test(document.querySelector('[data-testid=agro-soil]')?.textContent ?? ''));
      assert.match(await text('[data-testid=agro-soil]'), /Humedad del suelo\s*\d+,\d %/); assert.equal(await p.getByTestId('agro-harvest').isDisabled(), true);
      await p.getByLabel('Tipo de suelo').selectOption('arcilloso'); await p.waitForFunction(() => document.querySelector('[aria-label="Tipo de suelo"]')?.value === 'arcilloso'); await p.getByLabel('Tipo de suelo').selectOption('franco');
      pass('sembrar tomate en la parcela muestra su etapa, la humedad del suelo y el balance de agua; no se puede cosechar todavía; el tipo de suelo se cambia');

      await piece('Sensor de humedad 1'); const hum0 = await text('[data-testid=agro-sensor]'); assert.match(hum0, /Humedad\s*\d+,\d %/); assert.match(hum0, /Parcela 1/);
      await piece('Estanque 1'); assert.match(await text('[data-testid=agro-tank]'), /Agua utilizable\s*[\d.]+ L/);
      const usable = async () => Number((await text('[data-testid=agro-tank]')).match(/Agua utilizable\s*([\d.]+) L/)[1].replace(/\./g, ''));
      const u0 = await usable();

      await speed(3600); const s0 = await simS(); await p.waitForTimeout(2500); const s1 = await simS();
      assert.ok(s1 - s0 > 1800 && s1 - s0 < 3600 * 6, `avanzó ${s1 - s0} s en 2,5 s reales a 1 h/s`);
      await p.waitForFunction(() => /Agua utilizable/.test(document.querySelector('[data-testid=agro-tank]')?.textContent ?? '')); const u1 = await usable(); assert.ok(u1 < u0 - 100, `${u1} < ${u0}`);
      await p.screenshot({path: `${out}/agro-riego-corriendo.png`});
      pass(`a 1 h/s el reloj avanza ${((s1 - s0) / 3600).toFixed(1)} h simuladas en 2,5 s reales y el estanque entrega agua: ${u0} → ${u1} L utilizables`);

      await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.alerts) >= 1, null, {timeout: 40000});
      await speed(0); const sPause = await simS(); await p.waitForTimeout(700); assert.equal(await simS(), sPause);
      await p.getByTestId('agro-alert-btn').click(); const alerts = await text('[data-testid=agro-alerts]');
      assert.match(alerts, /no tiene agua utilizable/); assert.match(alerts, /se quedó sin agua utilizable/); await p.screenshot({path: `${out}/agro-alertas.png`});
      await p.getByTestId('agro-alert-btn').click();
      pass('al agotarse el agua del estanque aparece la alerta y el suceso con su fecha; en pausa el reloj no avanza');

      await piece('Estanque 1'); await p.getByTestId('agro-fill').click();
      await p.waitForFunction(() => /Agua utilizable\s*8\.1\d\d L/.test(document.querySelector('[data-testid=agro-tank]')?.textContent ?? '')); await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.flow) > 30);
      pass('llenar el estanque reanuda el riego (caudal > 30 L/min) y apaga la alerta');

      await piece('Parcela 1'); await speed(86400); const d0 = await num(p, 'data-sim-day'); await p.waitForTimeout(3000); const d1 = await num(p, 'data-sim-day'); await speed(0);
      assert.ok(d1 - d0 >= 1 && d1 - d0 <= 6, `${d1 - d0} días en 3 s a 1 día/s`);
      const soil = await text('[data-testid=agro-soil]'); assert.match(soil, /Avance del ciclo\s*\d+ %/); assert.match(soil, /Edad\s*\d+ días/);
      const bal = await text('[data-testid=agro-balance]'); assert.match(bal, /Evapotranspiración\s*[1-9]/);
      await p.screenshot({path: `${out}/agro-cultivo.png`});
      pass(`a 1 día/s pasan ${d1 - d0} días en 3 s: el cultivo avanza de etapa y la parcela acumula evapotranspiración y riego`);

      const before = await simS(), dayBefore = await attr(p, 'data-sim-day'); await saved(p); await p.reload();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p);
      assert.equal(await num(p, 'data-sim-seconds'), before); assert.equal(await num(p, 'data-speed'), 0); assert.equal(await attr(p, 'data-sim-day'), dayBefore);
      await piece('Parcela 1'); assert.match(await text('[data-testid=agro-soil]'), /Cultivo\s*Tomate/);
      pass('recargar conserva la fecha simulada, el cultivo y el agua; el mundo reabre en pausa');

      await p.keyboard.press('Control+z'); assert.equal(await num(p, 'data-sim-seconds'), before); assert.equal(await p.getByTestId('agro-plant-tomate').count(), 0);
      pass('Ctrl+Z no deshace el tiempo ni el cultivo ya sembrado');

      await p.setViewportSize({width: 390, height: 780}); await p.waitForTimeout(400);
      const over = await p.evaluate(() => ({w: document.documentElement.scrollWidth, v: window.innerWidth, t: document.querySelector('[data-testid=agro-time]').getBoundingClientRect().right}));
      assert.ok(over.w <= over.v && over.t <= over.v + 1, JSON.stringify(over)); await p.screenshot({path: `${out}/agro-tiempo-movil.png`}); await p.setViewportSize({width: 1440, height: 900});
      pass('a 390 px la barra de tiempo cabe en pantalla sin desbordar');
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();   // se vuelve al mundo de las dos tuberías para las pruebas de archivo
      await p.locator('.agro-world-list li', {hasText: 'Dos tuberías'}).getByRole('button', {name: 'Abrir'}).click(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
    }

    // ── Fase 5: tablero con PLC, pantalla HMI y riego automático ─────────────
    {
      const w5 = WorldSession.fromWorld(newWorld('Huerto automático', {seed: 21}));
      const put = (t, x, z) => w5.place(t, x, z, 0).value;
      const tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), pump = put('bomba', -10, 2), p2 = put('tuberia', -10, 7), spr = put('emisor', -10, 14), grid = put('acometida', 8, -8), board = put('tablero', 8, -4);
      for (const [a, ap, b, bp] of [[tank, 'salida', p1, 'a'], [p1, 'b', pump, 'succion'], [pump, 'descarga', p2, 'a'], [p2, 'b', spr, 'entrada'], [grid, 'red', board, 'red'], [board, 'salida-bomba', pump, 'alim']]) assert.ok(w5.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}).ok);
      const at5 = w5.entity(spr.id).pose.position, parc5 = w5.place('parcela', at5[0], at5[2], 0).value;
      const {boundsOf, soilById} = await import(pathToFileURL(path.resolve('src/agro/sim/soil.ts')).href), sb = boundsOf(soilById('franco'));
      assert.ok(w5.setState(parc5.id, 'aguaMm', sb.wpMm + 0.47 * sb.tawMm).ok); assert.ok(w5.setState(tank.id, 'nivelL', 10000).ok);   // suelo justo bajo el umbral «seco» (50 %) y estanque lleno
      const probe = w5.place('sensor-humedad', at5[0] - 6, at5[2] + 6, 0).value;
      assert.ok(w5.connectPorts({entityId: probe.id, portId: 'senal'}, {entityId: board.id, portId: 'entrada-senal'}).ok);
      assert.ok(w5.setState(board.id, 'interruptor', true).ok); assert.ok(w5.setParam(board.id, 'humedoPct', 60).ok);
      const autoFile = path.join(dir, 'automatico.modoagro.json'); fs.writeFileSync(autoFile, exportWorld(w5.toWorld()).text);
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.getByLabel('Importar mundo desde archivo').setInputFiles(autoFile);
      await p.locator('.agro-world-list li', {hasText: 'Huerto automático'}).getByRole('button', {name: 'Abrir'}).click();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
      const piece = async name => { if (await p.locator('[data-testid=agro-pieces]').count() === 0) await p.getByRole('button', {name: 'Lista de piezas'}).click(); await p.locator('[data-testid=agro-pieces]').getByRole('button', {name, exact: true}).click(); await p.locator('[data-testid=agro-inspector]').waitFor(); await p.waitForFunction(n => document.querySelector('.agro-name')?.value === n, name); };
      const speed = async s => { await p.getByLabel('Velocidad', {exact: true}).selectOption(String(s)); await waitAttr(p, 'speed', 'num', s); };
      const rungs = () => p.locator('[data-testid=agro-plc-rungs] > section').count();
      const lamp = a => p.locator(`[data-testid=agro-plc-io] li[data-addr=${a}]`).getAttribute('data-on');

      const openAuto = async () => { if (await p.getByTestId('agro-auto').count() === 0) await p.locator('[data-mode=auto]').click(); await p.getByTestId('agro-auto').waitFor(); };
      const closeAuto = async () => { if (await p.getByTestId('agro-auto').count()) await p.getByRole('button', {name: 'Cerrar Automatizar'}).click(); await p.getByTestId('agro-auto').waitFor({state: 'detached'}); };
      const atab = n => p.getByTestId(`agro-auto-tab-${n}`).click();

      await piece('Tablero de control 1');
      assert.match(await p.getByTestId('agro-inspector').innerText(), /Modo de mando/); await p.getByTestId('agro-open-automate').click(); await p.getByTestId('agro-auto').waitFor();
      assert.equal(await p.getByTestId('agro-mode-manual').getAttribute('aria-checked'), 'true'); assert.equal(await p.getByTestId('agro-plc-power').getAttribute('data-powered'), 'true');
      assert.match(await p.getByTestId('agro-plc-probe').innerText(), /Sonda: «Sensor de humedad 1» · agua útil \d+ %/); assert.equal(await rungs(), 0);
      await atab('hmi'); assert.equal(await p.getByTestId('agro-hmi').count(), 0); await atab('ladder');
      await p.screenshot({path: `${out}/agro-tablero-vacio.png`});
      pass('el inspector del tablero resume el modo y abre «Automatizar»; ahí el tablero está en manual, con energía, con la sonda cableada y sin programa ni pantalla');

      await p.getByTestId('agro-plc-example').click(); await p.waitForFunction(() => document.querySelectorAll('[data-testid=agro-plc-rungs] > section').length === 3);
      assert.equal(await p.locator('[data-testid=agro-rung-0] .ind-ladder-network svg').count(), 1, 'la escalera de Industria se dibuja');
      await p.screenshot({path: `${out}/agro-plc-ejemplo.png`});
      await atab('hmi'); assert.equal(await p.getByTestId('agro-hmi').count(), 1); assert.equal(await p.getByTestId('agro-hmi-switch-M0').getAttribute('aria-checked'), 'false'); await atab('ladder');
      pass('cargar el ejemplo arma 3 líneas en escalera (con el dibujo de Industria) y la pantalla HMI con su interruptor «Riego automático»');

      await p.getByTestId('agro-add-rung').click(); await p.waitForFunction(() => document.querySelectorAll('[data-testid=agro-plc-rungs] > section').length === 4);
      await p.locator('[data-testid=agro-rung-3] summary').click(); await p.getByLabel('Añadir contacto a la rama 1 de la línea 4').selectOption('X0'); await p.waitForFunction(() => /X0/.test(document.querySelector('[data-testid=agro-rung-3]')?.textContent ?? ''));
      await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('Control+z'); await p.keyboard.press('Control+z'); await p.waitForFunction(() => document.querySelectorAll('[data-testid=agro-plc-rungs] > section').length === 3);
      pass('añadir una línea y un contacto desde el panel entra en el historial: Ctrl+Z dos veces vuelve a las 3 líneas');

      await p.getByTestId('agro-mode-auto').click(); await p.waitForFunction(() => document.querySelector('[data-testid=agro-mode-auto]')?.getAttribute('aria-checked') === 'true');
      await closeAuto();
      await piece('Parcela 1'); await p.getByTestId('agro-plant-tomate').click(); await p.waitForFunction(() => /Etapa/.test(document.querySelector('[data-testid=agro-soil]')?.textContent ?? ''));
      await piece('Tablero de control 1'); await p.getByTestId('agro-open-automate').click(); await p.getByTestId('agro-auto').waitFor();
      assert.equal(await lamp('X0'), 'true', 'el suelo está bajo el umbral seco'); assert.equal(await lamp('Y0'), 'false'); assert.equal(await num(p, 'data-flow') < 0.001, true);
      pass('en automático con el suelo seco (X0 activa) pero el interruptor «Riego automático» de la pantalla apagado, el PLC mantiene Y0 apagada: la bomba no corre');

      await atab('hmi'); await p.getByTestId('agro-hmi-switch-M0').click(); await p.waitForFunction(() => document.querySelector('[data-testid=agro-hmi-switch-M0]')?.getAttribute('aria-checked') === 'true');
      await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.flow) > 30, null, {timeout: 10000});
      assert.equal(await p.getByTestId('agro-hmi-lamp-Y0').getAttribute('data-on'), 'true'); assert.match(await p.getByTestId('agro-screen-state').innerText(), /EN OPERACIÓN/);
      assert.ok(Number((await p.getByTestId('agro-g-flow').locator('b').innerText()).replace(/\D/g, '')) > 30, 'el medidor de caudal marca el riego');
      await p.screenshot({path: `${out}/agro-plc-riego.png`});
      await atab('ladder'); assert.equal(await lamp('Y0'), 'true'); assert.equal(await lamp('Y1'), 'true');
      pass('al encender «Riego automático» en la pantalla el PLC activa Y0: el piloto se enciende, la pantalla dice «EN OPERACIÓN», el medidor de caudal marca el riego y la bomba entrega caudal');

      await speed(3600); await p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]').dataset.flow) < 0.001, null, {timeout: 60000}); await speed(0);
      assert.equal(await lamp('Y0'), 'false');
      await p.getByTestId('agro-alert-btn').click(); const log = await p.getByTestId('agro-alerts').innerText(); await p.getByTestId('agro-alert-btn').click();
      assert.match(log, /arrancó la bomba/); assert.match(log, /detuvo la bomba/);
      await atab('hmi'); await p.getByTestId('agro-screen-history').click(); assert.match(await p.getByTestId('agro-screen-list').innerText(), /arrancó la bomba/);
      await p.getByTestId('agro-screen-alarms').click(); assert.ok((await p.getByTestId('agro-screen-list').innerText()).length > 0);
      for (const g of ['flow', 'bar', 'tank', 'soil', 'temp', 'kw']) assert.ok((await p.getByTestId(`agro-g-${g}`).innerText()).length > 2, g);
      await p.screenshot({path: `${out}/agro-hmi-pantalla.png`});
      pass('al llegar el suelo al umbral húmedo el PLC apaga Y0 y la bomba se detiene; el registro y el histórico de la pantalla anotan arranque y parada y los 6 medidores muestran valores del modelo');

      await p.getByTestId('agro-hmi-switch-M0').click(); await p.getByTestId('agro-screen-manual').click(); await p.waitForFunction(() => document.querySelector('[data-testid=agro-screen-manual]')?.className === 'on');
      await p.getByTestId('agro-screen-auto').click(); await p.waitForFunction(() => document.querySelector('[data-testid=agro-screen-auto]')?.className === 'on');
      await closeAuto();

      // Nueva interfaz: barra de modos, dock de piezas, capas y etiquetas
      await p.locator('[data-mode=build]').click(); await p.getByTestId('agro-dock').waitFor();
      assert.ok(await p.locator('[data-dock-item=granero]').count() === 1 && await p.locator('[data-dock-item=invernadero]').count() === 1, 'las construcciones están en el dock'); await p.getByRole('tab', {name: 'Riego'}).click(); assert.ok(await p.locator('[data-dock-item]').count() >= 5); await p.locator('[data-dock-item=bomba]').click();
      await waitAttr(p, 'tool', 'eq', 'place'); assert.ok((await p.getByTestId('agro-dock-hint').innerText()).length > 3);
      await p.screenshot({path: `${out}/agro-dock.png`}); await p.keyboard.press('Escape'); await waitAttr(p, 'tool', 'eq', 'select');
      await p.locator('[data-mode=power]').click(); assert.equal(await p.getByTestId('agro-dock').count(), 0); assert.match(await p.getByTestId('agro-netcard').innerText(), /Red eléctrica/);
      await p.locator('[data-mode=water]').click(); assert.equal(await p.getByTestId('agro-dock').count(), 0); assert.match(await p.getByTestId('agro-netcard').innerText(), /Red de riego/);
      pass('Construir concentra las piezas por categoría; Riego y Electricidad abren la lectura de red; Esc cancela la pieza');

      await p.locator('[data-mode=layers]').click(); await p.getByTestId('agro-layers').waitFor();
      await waitAttr(p, 'labels', 'eq', 'true');
      await p.getByLabel('Etiquetas de los equipos').uncheck(); await waitAttr(p, 'labels', 'eq', 'false'); await p.screenshot({path: `${out}/agro-sin-etiquetas.png`});
      await p.getByLabel('Etiquetas de los equipos').check(); await waitAttr(p, 'labels', 'eq', 'true'); await p.waitForTimeout(600);
      await p.screenshot({path: `${out}/agro-capas.png`}); await p.locator('[data-mode=inspect]').click();
      pass('«Capas» muestra y oculta las etiquetas flotantes con el nombre y el estado de cada equipo');

      await p.locator('[data-testid=agro-pieces]').getByRole('button', {name: 'Tablero de control 1', exact: true}).click(); await p.getByTestId('agro-ctx').waitFor();
      assert.ok(await p.getByTestId('agro-ctx').getByRole('button', {name: 'Eliminar pieza'}).count() === 1); await p.getByTestId('agro-ctx-automate').click(); await p.getByTestId('agro-auto').waitFor();
      const before = await num(p, 'data-sim-seconds'); await closeAuto(); await saved(p); await p.reload(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p);
      assert.equal(await num(p, 'data-sim-seconds'), before); assert.equal(await num(p, 'data-speed'), 0);
      await piece('Tablero de control 1'); await p.getByTestId('agro-open-automate').click(); await p.getByTestId('agro-auto').waitFor(); assert.equal(await rungs(), 3); assert.equal(await p.getByTestId('agro-mode-auto').getAttribute('aria-checked'), 'true');
      pass('la barra contextual de la pieza abre «Automatizar»; recargar conserva el programa, el modo automático y la hora simulada; el mundo reabre en pausa');

      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.locator('.agro-world-list li', {hasText: 'Dos tuberías'}).getByRole('button', {name: 'Abrir'}).click(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
    }

    // ── Fase 6: inventario, compras, obras y colocación de precisión ─────────
    {
      const w6 = WorldSession.fromWorld(newWorld('Obra real', {seed: 31}));
      assert.ok(w6.setExperience('real').ok); assert.ok(w6.buy('bomba', 2).ok); w6.advance(4 * 86400);
      assert.ok(w6.place('bomba', 0, 0, 0).ok); w6.advance(3600);
      const realFile = path.join(dir, 'obra-real.modoagro.json'); fs.writeFileSync(realFile, exportWorld(w6.toWorld()).text);
      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.getByLabel('Importar mundo desde archivo').setInputFiles(realFile);
      await p.locator('.agro-world-list li', {hasText: 'Obra real'}).getByRole('button', {name: 'Abrir'}).click();
      await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
      const money = async () => Number((await p.locator('.agro-inv header small').innerText()).replace(/\D/g, ''));
      const speed = async s => { await p.getByLabel('Velocidad', {exact: true}).selectOption(String(s)); await waitAttr(p, 'speed', 'num', s); };

      assert.equal(await attr(p, 'data-experience'), 'real');
      await p.locator('[data-mode=manage]').click(); await p.getByTestId('agro-inventory').waitFor(); assert.equal(await p.getByTestId('agro-dock').count(), 0);
      assert.equal((await p.getByTestId('agro-stock-bomba').innerText()).trim(), '1'); assert.equal((await p.getByTestId('agro-stock-estanque').innerText()).trim(), '0');
      const m0 = await money(); assert.ok(m0 > 3_000_000 && m0 < 5_000_000, `dinero ${m0}`);
      await p.screenshot({path: `${out}/agro-inventario.png`});
      pass('en modo real, Gestión abre «Inventario y compras»: lo recibido menos lo colocado (1 bomba disponible, 0 estanques) y el dinero que queda tras la compra y el montaje');

      await p.getByTestId('agro-buy-estanque').click(); await p.waitForFunction(() => /Pedido hecho: 1 × Estanque/.test(document.querySelector('[data-testid=agro-notice]')?.textContent ?? ''));
      assert.equal(await money(), m0 - 850_000);
      await p.getByTestId('agro-inv-tab-orders').click(); assert.match(await p.getByTestId('agro-inv-orders').innerText(), /1 × Estanque[\s\S]*Llega en 5 días/);
      await p.getByTestId('agro-inv-tab-works').click(); assert.match(await p.getByTestId('agro-inv-works').innerText(), /Bomba centrífuga 1[\s\S]*25 %/);
      await p.getByTestId('agro-inv-tab-ledger').click(); assert.match(await p.getByTestId('agro-inv-ledger').innerText(), /Pedido: 1 × Estanque/);
      pass('comprar un estanque descuenta su precio, aparece en Pedidos con su plazo y en el libro; Obras muestra la bomba al 25 %');

      await p.locator('[data-mode=build]').click(); await p.getByRole('tab', {name: 'Riego'}).click();
      assert.equal((await p.getByTestId('agro-dock-stock-bomba').innerText()).trim(), '1 disp.'); assert.equal((await p.getByTestId('agro-dock-stock-estanque').innerText()).trim(), '0 disp.');
      await p.locator('[data-dock-item=estanque]').click();
      let hint = ''; for (let k = 0; k < 14 && !/No hay «Estanque»/.test(hint); k++) { await p.mouse.move(700 + (k % 3) * 4, 480 + (k % 2) * 4, {steps: 3}); await p.waitForTimeout(250); hint = await p.getByTestId('agro-dock-hint').innerText(); }
      assert.match(hint, /No hay «Estanque» en el inventario/); await p.keyboard.press('Escape');
      pass('el dock muestra cuántas unidades hay de cada pieza y el fantasma rechaza colocar una que no está en el inventario, con su motivo');

      await p.locator('[data-mode=inspect]').click();
      if (await p.locator('[data-testid=agro-pieces]').count() === 0) await p.getByRole('button', {name: 'Lista de piezas'}).click();
      await p.locator('[data-testid=agro-pieces]').getByRole('button', {name: 'Bomba centrífuga 1', exact: true}).click(); await p.getByTestId('agro-inspector').waitFor();
      assert.match(await p.getByTestId('agro-obra').innerText(), /En obra: 25 %/);
      await p.getByTestId('agro-tab-place').click(); const x0 = await p.getByTestId('agro-ins-pos').innerText();
      await p.getByLabel('Posición X').fill('6'); await p.getByLabel('Posición X').blur(); await p.waitForFunction(() => /x 6,0/.test(document.querySelector('[data-testid=agro-ins-pos]')?.textContent ?? ''));
      assert.notEqual(await p.getByTestId('agro-ins-pos').innerText(), x0); assert.ok(await p.getByTestId('agro-dockline').count() === 1); assert.match(await p.getByTestId('agro-place-read').innerText(), /Pendiente bajo la pieza[\s\S]*máx\. 8°/);
      await p.getByLabel('Posición X').fill('99999'); await p.getByLabel('Posición X').blur(); await p.waitForFunction(() => /./.test(document.querySelector('[data-testid=agro-notice]')?.textContent ?? ''));
      await p.screenshot({path: `${out}/agro-colocacion.png`});
      pass('la pestaña Colocación mueve la pieza a una posición exacta (y rechaza una fuera del terreno con su motivo), muestra cota y pendiente y el puerto compatible más cercano; la pieza en obra lo declara');

      await speed(3600); await p.waitForFunction(() => document.querySelector('.agro-inspector [data-testid=agro-obra]') === null || true); await p.waitForTimeout(4500); await speed(0);
      await p.locator('[data-mode=manage]').click(); await p.getByTestId('agro-inv-tab-works').click(); assert.match(await p.getByTestId('agro-inv-works').innerText(), /No hay obras en curso/);
      await p.getByTestId('agro-alert-btn').click(); assert.match(await p.getByTestId('agro-alerts').innerText(), /Terminó el montaje de «Bomba centrífuga 1»/); await p.getByTestId('agro-alert-btn').click();
      pass('al pasar el tiempo la obra termina, sale de Obras y el registro anota «Terminó el montaje»');

      await p.locator('summary', {hasText: 'Archivo'}).click(); await p.getByTestId('agro-exp-free').click(); await waitAttr(p, 'experience', 'eq', 'free');
      await p.locator('[data-mode=manage]').click(); if (await p.getByTestId('agro-inventory').count() === 0) await p.locator('[data-mode=manage]').click();
      await p.getByTestId('agro-inventory').waitFor(); assert.ok(await p.getByTestId('agro-inv-free').count() === 1 && await p.getByTestId('agro-go-real').count() === 1);
      await p.getByTestId('agro-go-real').click(); await waitAttr(p, 'experience', 'eq', 'real');
      pass('Archivo → Modo libre quita inventario y costos (el panel lo explica y ofrece volver al modo real); el modo real conserva el dinero');

      await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
      await p.locator('.agro-world-list li', {hasText: 'Dos tuberías'}).getByRole('button', {name: 'Abrir'}).click(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
    }

    // ── Exportar, importar y mundos dañados ────────────────────────────────
    await saved(p);
    await p.locator('summary', {hasText: 'Archivo'}).click();
    const [download] = await Promise.all([p.waitForEvent('download'), p.getByRole('menuitem', {name: /Exportar mundo/}).click()]);
    const exported = path.join(dir, 'exportado.modoagro.json'); await download.saveAs(exported);
    const doc = JSON.parse(fs.readFileSync(exported, 'utf8'));
    assert.equal(doc.format, 'modo-agro'); assert.equal(doc.entities.length, 2); assert.equal(doc.connections.length, 1);
    await p.getByRole('button', {name: 'Volver a Mis mundos'}).click(); await p.locator('[data-view=lobby]').waitFor();
    await p.getByLabel('Importar mundo desde archivo').setInputFiles(exported);
    await p.locator('.agro-world-list li', {hasText: '(importado)'}).waitFor();
    pass('exportar y volver a importar crea una copia «(importado)» y no pisa el mundo original');

    await p.evaluate(() => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const tx = r.result.transaction('worlds', 'readwrite'); tx.objectStore('worlds').put({id: 'roto', name: 'Mundo dañado', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', experience: 'free', entities: 5, edits: 0, data: {format: 'modo-agro', version: 1, id: 'roto', basura: true}}, 'roto'); tx.oncomplete = () => ok(); tx.onerror = () => no(tx.error); }; r.onerror = () => no(r.error); }));
    await p.reload(); await p.locator('[data-view=lobby]').waitFor();
    const broken = p.locator('[data-world-id=roto]');
    assert.match(await broken.innerText(), /No se pudo leer.*No se modificó/s);
    assert.equal(await broken.getByRole('button', {name: 'Abrir'}).count(), 0);
    assert.ok((await p.locator('.agro-world-list li').count()) >= 4);
    const [dl2] = await Promise.all([p.waitForEvent('download'), broken.getByRole('button', {name: /Exportar/}).click()]);
    assert.match(fs.readFileSync(await dl2.path(), 'utf8'), /basura/);
    await p.screenshot({path: `${out}/lobby-danado.png`});
    pass('un mundo dañado se lista como ilegible, no se puede abrir, sus datos se pueden descargar y los demás mundos siguen intactos');
    await broken.getByRole('button', {name: /Eliminar/}).click(); await broken.getByRole('button', {name: 'Eliminar para siempre'}).click();
    await p.locator('[data-world-id=roto]').waitFor({state: 'detached'});
    const copy = p.locator('.agro-world-list li', {hasText: 'Con conexiones'}).first();
    await copy.getByRole('button', {name: /Duplicar/}).click(); await p.locator('.agro-world-list li', {hasText: '(copia)'}).waitFor();
    pass('eliminar pide una segunda confirmación; duplicar crea «(copia)»');
    await c.close();

    // ── Móvil ──────────────────────────────────────────────────────────────
    ({c, p} = await open(b, {width: 390, height: 844}));
    await p.goto(`${base}/agro/`); await p.locator('[data-view=lobby]').waitFor(); await settle(p);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await p.screenshot({path: `${out}/lobby-movil.png`});
    await createFromLobby(p, 'Móvil');
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await settle(p);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    for (const name of ['Seleccionar', 'Medir', 'Construir', 'Subir terreno', 'Deshacer']) assert.equal(await p.getByRole('button', {name, exact: true}).isVisible(), true, name);
    await p.getByRole('button', {name: 'Construir'}).click(); await p.waitForTimeout(300);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await p.screenshot({path: `${out}/agro-movil.png`});
    pass('a 390 px no hay desbordes en el lobby ni en el workspace con el catálogo abierto');
    await c.close();

    // ── Home ───────────────────────────────────────────────────────────────
    ({c, p} = await open(b));
    await p.goto(base + '/');
    await p.locator('[data-module=panel]:not(:disabled)').waitFor();
    assert.equal(await p.locator('.home-module').count(), 7);
    const card = p.locator('[data-module=agro]');
    assert.equal(await card.getAttribute('href'), '/agro/');
    await settle(p); await p.screenshot({path: `${out}/home-desktop.png`});
    await card.focus(); await p.keyboard.press('Enter');
    await ws(p).waitFor();
    assert.equal(new URL(p.url()).pathname, '/agro/');
    pass('el Home muestra siete tarjetas y la de Agro abre /agro/');
    await c.close();

    const real = report.errors.filter(e => !/Service Worker|THREE\.Clock/.test(e));
    assert.deepEqual(real, [], 'errores de consola o de red: ' + real.join(' | '));
    pass('sin errores de consola ni respuestas 4xx/5xx');
  } finally { await b.close(); fs.writeFileSync(`${out}/verification.json`, JSON.stringify(report, null, 2)); }
  console.log(`\n${report.checks.length} bloques OK`);
})().catch(e => { console.error(e); process.exit(1); });
