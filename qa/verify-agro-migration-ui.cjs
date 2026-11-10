// Etapa 1: migración v1 → v2 con IndexedDB REAL en el navegador (perfil desechable de Playwright; nunca toca los mundos del usuario).
// Abrir un mundo v1 no escribe; el primer cambio lo migra a v2 con copia exacta previa; un trazo de terreno abierto no se autoguarda a medias; recargar conserva todo.
// Uso: AGRO_URL=http://127.0.0.1:4386 node qa/verify-agro-migration-ui.cjs   (servidor de vista previa sobre el build)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.AGRO_URL || 'http://127.0.0.1:4386').replace(/\/$/, '');
const out = process.env.AGRO_QA_OUT;
const dir = path.join(__dirname, 'fixtures', 'v1');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'MANIFEST.json'), 'utf8'));
let n = 0; const pass = name => { n++; console.log('PASS', name); };
const rowOf = file => { const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); return {id: data.id, name: data.name, createdAt: data.createdAt, updatedAt: data.updatedAt, experience: data.experience, entities: data.entities.length, edits: data.terrain.edits.length, data}; };
const F4 = 'v1-04-terreno-editado-conectado.modoagro.json', F3 = 'v1-03-real-economia.modoagro.json';
const original = {a: rowOf(F4), b: rowOf(F3)};

const idb = {
  put: (p, store, key, value) => p.evaluate(([s, k, v]) => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const tx = r.result.transaction(s, 'readwrite'); tx.objectStore(s).put(v, k); tx.oncomplete = () => { r.result.close(); ok(); }; tx.onerror = () => no(tx.error); }; r.onerror = () => no(r.error); }), [store, key, value]),
  get: (p, store, key) => p.evaluate(([s, k]) => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const q = r.result.transaction(s, 'readonly').objectStore(s).get(k); q.onsuccess = () => { r.result.close(); ok(q.result ?? null); }; q.onerror = () => no(q.error); }; r.onerror = () => no(r.error); }), [store, key]),
  keys: (p, store) => p.evaluate(s => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const q = r.result.transaction(s, 'readonly').objectStore(s).getAllKeys(); q.onsuccess = () => { r.result.close(); ok(q.result); }; q.onerror = () => no(q.error); }; r.onerror = () => no(r.error); }), store),
};
const saved = p => p.waitForFunction(() => document.querySelector('[data-testid=agro-app]')?.dataset.save === 'saved', null, {timeout: 20000});
const rendered = p => p.waitForFunction(() => Number(document.querySelector('[data-testid=agro-app]')?.dataset.tris) > 0, null, {timeout: 40000});
async function reviewLayout(impact) {
  return impact.evaluate(dialog => {
    const list = dialog.querySelector('.agro-impact-list');
    const rect = dialog.getBoundingClientRect(), footer = dialog.querySelector('footer').getBoundingClientRect();
    return {top: footer.top, bottom: footer.bottom, fits: rect.top >= 0 && rect.bottom <= innerHeight &&
      rect.left >= 0 && rect.right <= innerWidth && footer.bottom <= rect.bottom,
      scrolls: list.scrollHeight > list.clientHeight, scrollTop: list.scrollTop};
  });
}
const cameraPosition = p => p.getByTestId('agro-app').evaluate(el => [el.dataset.camX, el.dataset.camZ]);
const cameraMoved = (p, position) => p.waitForFunction(([x, z]) => {
  const {camX, camZ} = document.querySelector('[data-testid=agro-app]').dataset;
  return camX !== x || camZ !== z;
}, position);
async function swipeReviewList(context, page, impact) {
  const region = impact.getByRole('region', {name: 'Detalle de instalaciones y conexiones afectadas'});
  await region.evaluate(el => { el.scrollTop = 0; });
  const area = await region.boundingBox();
  const touch = await context.newCDPSession(page);
  const finger = (type, y) => touch.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x: area.x + area.width / 2, y}]});
  const startY = area.y + area.height - 24;
  await finger('touchStart', startY);
  for (let step = 1; step <= 6; step++) await finger('touchMove', startY - step * 20);
  await finger('touchEnd');
  await touch.detach();
  assert.ok((await reviewLayout(impact)).scrollTop > 0);
}

(async () => {
  const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, hasTouch: true, serviceWorkers: 'block'});
    await c.addInitScript(() => { localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); });
    const p = await c.newPage(); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto(`${base}/agro/`); await p.locator('[data-view=lobby]').waitFor(); await p.waitForTimeout(1500);
    await idb.put(p, 'worlds', original.a.id, original.a); await idb.put(p, 'worlds', original.b.id, original.b);
    const untouchedA = JSON.stringify(await idb.get(p, 'worlds', original.a.id)), untouchedB = JSON.stringify(await idb.get(p, 'worlds', original.b.id));
    assert.equal(untouchedA, JSON.stringify(original.a));
    await p.reload(); await p.locator('[data-view=lobby]').waitFor();
    const list = p.locator('.agro-world-list li'); assert.equal(await list.count(), 2);
    assert.match(await p.locator(`[data-world-id=${original.a.id}]`).innerText(), /30 ediciones de terreno/);
    pass('dos mundos v1 de referencia, sembrados en IndexedDB, aparecen legibles en «Mis mundos» (el lobby los lee sin migrarlos)');

    await p.locator(`[data-world-id=${original.a.id}]`).getByRole('button', {name: 'Abrir'}).click();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await p.waitForTimeout(3500);
    assert.equal(await p.locator('[data-testid=agro-world-name]').innerText(), original.a.name);
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.a.id)), untouchedA); assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.b.id)), untouchedB);
    const metaKeys = await idb.keys(p, 'meta'); assert.ok(!metaKeys.some(k => String(k).startsWith('backup:')), 'no debe haber copias todavía: ' + metaKeys);
    pass('abrir el mundo v1 y dejarlo 3,5 s NO escribe: el registro v1 sigue idéntico byte a byte, el otro mundo no se tocó y todavía no hay copias de seguridad');

    // Un cambio real (arrancar el reloj) dispara el autoguardado: migra a v2 con copia previa exacta
    await p.getByRole('button', {name: 'Reanudar'}).click(); await p.waitForTimeout(600); await saved(p);
    const after = await idb.get(p, 'worlds', original.a.id);
    assert.equal(after.data.version, 2); assert.equal(after.data.terrain.generatorVersion, 1); assert.equal(after.data.terrain.presetId, 'free'); assert.equal(after.data.scenario.territory, 'free');
    assert.deepEqual(after.data.terrain.edits, original.a.data.terrain.edits); assert.deepEqual(after.data.entities.map(e => e.id), original.a.data.entities.map(e => e.id)); assert.equal(after.data.terrain.seed, original.a.data.terrain.seed);
    const key = `backup:${original.a.id}:v1`, backup = await idb.get(p, 'meta', key);
    assert.ok(backup, 'falta la copia ' + key); assert.equal(backup.fromVersion, 1); assert.equal(backup.reason, 'migracion'); assert.equal(JSON.stringify(backup.row), untouchedA);
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.b.id)), untouchedB); assert.equal((await idb.keys(p, 'meta')).filter(k => String(k).startsWith('backup:')).length, 1);
    pass('el primer cambio migra el mundo a v2 (generatorVersion 1, territorio, mismas ediciones y piezas) y deja ANTES una copia idéntica byte a byte del v1 original; el otro mundo sigue intacto');

    // Trazo de terreno abierto: no se autoguarda a medias
    const editsBefore = after.data.terrain.edits.length;
    await p.getByRole('button', {name: 'Subir terreno'}).click(); await p.mouse.move(720, 520);
    const stage = p.getByTestId('agro-app'), checksumBefore = await stage.getAttribute('data-checksum');
    const impact = p.getByRole('dialog', {name: 'Revisar edición de terreno'});
    if (out) { fs.mkdirSync(out, {recursive: true}); await p.screenshot({path: path.join(out, 'terreno-antes.png')}); }
    await p.mouse.click(720, 520); await impact.waitFor();
    assert.match(await impact.innerText(), /Instalaciones afectadas/);
    assert.match(await impact.innerText(), /Conexiones por revalidar/);
    assert.equal(await impact.getByRole('button', {name: 'Cancelar'}).evaluate(el => el === document.activeElement), true);
    await p.keyboard.press('Escape'); await impact.waitFor({state: 'hidden'});
    assert.equal(await stage.getAttribute('data-checksum'), checksumBefore);
    assert.equal((await idb.get(p, 'worlds', original.a.id)).data.terrain.edits.length, editsBefore);
    pass('un trazo sobre una finca conectada lista instalaciones y conexiones; Escape cancela y restaura el relieve');

    // Entrar en Editar mapa pausa la simulación de forma explícita.
    assert.equal(await stage.getAttribute('data-speed'),'0'); await saved(p);
    await p.mouse.click(720, 520); await impact.waitFor();
    const expectedMoving = Number((await impact.locator('#agro-impact-reseat').innerText()).match(/^(\d+)/)[1]);
    await impact.getByRole('button', {name: 'Aplicar y reasentar'}).click();
    await impact.waitFor({state: 'hidden'}); await saved(p);
    const reseated = (await idb.get(p, 'worlds', original.a.id)).data;
    assert.ok(expectedMoving > 0);
    assert.equal(reseated.entities.filter((e, i) => e.pose.position[1] !== after.data.entities[i].pose.position[1]).length, expectedMoving);
    assert.deepEqual(reseated.connections.map(c => c.id), after.data.connections.map(c => c.id));
    await p.getByRole('button', {name: 'Deshacer', exact: true}).click(); await saved(p);
    assert.equal(await stage.getAttribute('data-checksum'), checksumBefore);
    const reverted = (await idb.get(p, 'worlds', original.a.id)).data;
    assert.deepEqual(reverted.entities.map(e => e.pose), after.data.entities.map(e => e.pose));
    assert.deepEqual(reverted.connections, after.data.connections);
    pass('aplicar y reasentar cambia cotas tras confirmar; un Deshacer restituye terreno, poses y conexiones en IndexedDB');

    await p.mouse.move(720, 520); await p.mouse.down();
    for (let i = 0; i < 6; i++) { await p.mouse.move(720 + i * 18, 520 + i * 6); await p.waitForTimeout(80); }
    await p.waitForTimeout(1800);   // más que el retardo del autoguardado (700 ms) con el botón pulsado
    const during = await idb.get(p, 'worlds', original.a.id);
    assert.equal(during.data.terrain.edits.length, editsBefore, 'se guardó un trazo a medias');
    await p.evaluate(() => { window.dispatchEvent(new Event('pagehide')); }); await p.waitForTimeout(1200);   // salida de la página con el trazo abierto: guardado forzado
    assert.equal((await idb.get(p, 'worlds', original.a.id)).data.terrain.edits.length, editsBefore, 'la salida de la página guardó un trazo a medias');
    await p.mouse.up(); await impact.waitFor();
    await p.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await p.waitForTimeout(1000);
    assert.equal((await idb.get(p, 'worlds', original.a.id)).data.terrain.edits.length, editsBefore, 'se guardó un trazo aún pendiente de confirmación');
    const installations = impact.locator('[data-impact-kind=entity] button'), links = impact.locator('[data-impact-kind=connection] button');
    const installationCount = await installations.count(), linkCount = await links.count();
    assert.ok(installationCount > 5 && linkCount > 3);
    assert.match(await impact.locator('#agro-impact-keep').innerText(), new RegExp(`0 se mueven\\. ${installationCount} por revisar`));
    const desktop = await reviewLayout(impact);
    assert.ok(desktop.fits && desktop.scrolls);
    const pump = installations.filter({hasText: 'Bomba centrífuga'}).first();
    const desktopCamera = await cameraPosition(p);
    await pump.focus(); await p.keyboard.press('Enter');
    assert.equal(await pump.getAttribute('aria-pressed'), 'true');
    await cameraMoved(p, desktopCamera);
    if (out) await p.screenshot({path: path.join(out, 'terreno-impacto-escritorio.png')});
    await links.last().focus(); await p.keyboard.press('Enter');
    assert.equal(await links.last().getAttribute('aria-pressed'), 'true');
    assert.ok((await reviewLayout(impact)).scrollTop > desktop.scrollTop);
    assert.equal((await reviewLayout(impact)).top, desktop.top);
    pass('en escritorio, la lista larga llega a la última conexión con teclado, conserva las acciones y localiza la instalación en la escena');

    await p.setViewportSize({width: 390, height: 844});
    const mobile = await impact.boundingBox();
    assert.ok(mobile.x >= 0 && mobile.y >= 0 && mobile.x + mobile.width <= 391 && mobile.y + mobile.height <= 845);
    const mobileBefore = await reviewLayout(impact);
    assert.ok(mobileBefore.fits && mobileBefore.scrolls);
    await installations.first().tap();
    await installations.first().and(impact.locator('[aria-pressed=true]')).waitFor();
    const mobileCamera = await cameraPosition(p);
    await links.last().tap();
    await links.last().and(impact.locator('[aria-pressed=true]')).waitFor();
    await cameraMoved(p, mobileCamera);
    const mobileAfter = await reviewLayout(impact);
    assert.ok(mobileAfter.scrollTop > 0 && mobileAfter.fits);
    assert.equal(mobileAfter.top, mobileBefore.top);
    if (out) await p.screenshot({path: path.join(out, 'terreno-impacto-movil.png')});
    await p.setViewportSize({width: 320, height: 568});
    assert.ok((await reviewLayout(impact)).fits && (await reviewLayout(impact)).scrolls);
    if (out) await p.screenshot({path: path.join(out, 'terreno-impacto-movil-compacto.png')});
    pass('por toque se puede localizar la última conexión y las acciones caben incluso a 320 × 568');
    await p.setViewportSize({width: 390, height: 844});
    await impact.getByRole('button', {name: 'Aplicar y señalar'}).tap();
    await impact.waitFor({state: 'hidden'});
    await p.setViewportSize({width: 1440, height: 900});
    await saved(p);
    const finished = await idb.get(p, 'worlds', original.a.id); assert.ok(finished.data.terrain.edits.length > editsBefore); assert.equal(finished.data.version, 2);
    assert.deepEqual(finished.data.entities.map(e => e.pose), after.data.entities.map(e => e.pose));
    assert.deepEqual(finished.data.connections.map(c => c.id), after.data.connections.map(c => c.id));
    assert.ok(finished.data.entities.some(e => e.state.incidenciaTerreno));
    assert.ok(finished.data.connections.some(c => /Revalidación pendiente/.test(c.reason ?? '')));
    assert.equal((await idb.keys(p, 'meta')).filter(k => String(k).startsWith('backup:')).length, 1);
    pass('IndexedDB mantiene el relieve confirmado mientras se pinta y mientras se decide; aplicar por toque conserva poses y conexiones y guarda las incidencias');

    // Recargar y volver a abrir: mismo mundo
    await p.reload(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await p.waitForTimeout(1500);   // la app reabre el último mundo activo
    assert.equal(await p.locator('[data-testid=agro-world-name]').innerText(), original.a.name);
    const reopened = await idb.get(p, 'worlds', original.a.id); assert.equal(JSON.stringify(reopened), JSON.stringify(finished));
    const flagged = reopened.data.entities.find(e => e.state.incidenciaTerreno);
    await p.getByRole('button', {name: 'Lista de piezas'}).click();
    await p.getByTestId('agro-pieces').getByRole('button', {name: flagged.label, exact: true}).click();
    assert.match(await p.getByTestId('agro-inspector').innerText(), /Incidencia de terreno/);
    await p.getByTestId('agro-alert-btn').click();
    assert.match(await p.getByTestId('agro-alerts').innerText(), /Revalidación pendiente por edición del terreno/);
    pass('recargar la página reabre el último mundo (ya migrado) sin escribir nada y conserva el documento tal cual');

    // Restaurar con el procedimiento documentado (docs/agro/restaurar-copia.js), tal como lo pegaría el usuario en la consola
    const snippet = fs.readFileSync(path.join(__dirname, '..', 'docs', 'agro', 'restaurar-copia.js'), 'utf8');
    const listed = await p.evaluate(`${snippet}
;restaurarCopiaAgro()`); assert.equal(listed.length, 1); assert.equal(listed[0].mundo, original.a.id); assert.equal(listed[0].versionOriginal, 1); assert.equal(listed[0].motivo, 'migracion');
    const failed = await p.evaluate(`${snippet}
;restaurarCopiaAgro('no-existe').then(() => 'ok', e => e.message)`); assert.match(failed, /No hay una copia/);
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.a.id)), JSON.stringify(finished));   // un intento fallido no cambia nada
    const restored = await p.evaluate(`${snippet}
;restaurarCopiaAgro(${JSON.stringify(original.a.id)})`);
    assert.equal(restored.desde, `backup:${original.a.id}:v1`); assert.match(restored.estadoAnteriorGuardadoEn, /^backup:.*:v2:antes-de-restaurar-/);
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.a.id)), untouchedA);                       // el registro v1 original, byte a byte
    const keptBack = await idb.get(p, 'meta', restored.estadoAnteriorGuardadoEn); assert.equal(keptBack.reason, 'antes-de-restaurar'); assert.equal(JSON.stringify(keptBack.row), JSON.stringify(finished));
    assert.equal(JSON.stringify((await idb.get(p, 'meta', `backup:${original.a.id}:v1`)).row), untouchedA);    // la copia original sigue intacta
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.b.id)), untouchedB);
    await p.reload(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await p.waitForTimeout(2500);
    assert.equal(await p.locator('[data-testid=agro-world-name]').innerText(), original.a.name); assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.a.id)), untouchedA);
    pass('el procedimiento documentado de restauración (docs/agro/restaurar-copia.js pegado en la consola) lista las copias, rechaza un mundo sin copia sin cambiar nada, devuelve el registro v1 EXACTO conservando antes el estado v2 y la copia original, y el mundo restaurado se abre sin escribir');

    await p.getByRole('button', {name: 'Estratégica', exact: true}).click();
    const pumpV1 = original.a.data.entities.find(e => e.type === 'bomba');
    const [px, , pz] = pumpV1.pose.position;
    await p.getByRole('button', {name: 'Subir terreno'}).click();
    const canvas = await p.getByTestId('agro-canvas').boundingBox();
    await p.mouse.click(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
    await impact.getByRole('button', {name: `Localizar ${pumpV1.label}`, exact: true}).click();
    await p.waitForFunction(([x, z]) => {
      const {camX, camZ} = document.querySelector('[data-testid=agro-app]').dataset;
      return Math.hypot(Number(camX) - x, Number(camZ) - z) < 30;
    }, [px, pz]);
    await p.setViewportSize({width: 390, height: 844});
    const beforeSwipe = await reviewLayout(impact);
    await swipeReviewList(c, p, impact);
    assert.equal((await reviewLayout(impact)).top, beforeSwipe.top);
    await p.setViewportSize({width: 1440, height: 900});
    await p.keyboard.press('Escape'); await impact.waitFor({state: 'hidden'});
    assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.a.id)), untouchedA);
    pass('la vista estratégica acerca la bomba; el gesto táctil desplaza solo la lista y Escape cancela sin guardar');

    // Mundo nuevo desde el asistente: nace v2
    await p.getByRole('button', {name: /Mis mundos/}).click(); await p.locator('[data-view=lobby]').waitFor();
    await p.getByTestId('agro-new').click(); await p.getByLabel('Nombre del mundo').fill('Nuevo v2');
    for (let i = 0; i < 6; i++) await p.getByTestId('agro-wizard-next').click(); await p.getByTestId('agro-create').click();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await saved(p);
    const rows = await p.evaluate(() => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const q = r.result.transaction('worlds', 'readonly').objectStore('worlds').getAll(); q.onsuccess = () => { r.result.close(); ok(q.result); }; }; r.onerror = () => no(r.error); }));
    const created = rows.find(r => r.name === 'Nuevo v2'); assert.ok(created); assert.equal(created.data.version, 2); assert.equal(created.data.terrain.generatorVersion, 2); assert.equal(created.data.terrain.presetId, 'free'); assert.equal(created.data.scenario.territory, 'free');
    assert.equal((await idb.keys(p, 'meta')).filter(k => String(k).startsWith('backup:') && !String(k).includes('antes-de-restaurar')).length, 1); assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.b.id)), untouchedB);
    pass('un mundo creado con el asistente se guarda como v2 con generatorVersion 2 y territorio, sin copias nuevas; el mundo v1 que no se abrió sigue idéntico');
    assert.deepEqual(errors, [], 'errores de página: ' + errors.join(' | '));
    pass('sin errores de consola ni excepciones durante toda la prueba');
    await c.close();
  } finally { await b.close(); }
    console.log(`${n} bloques de migración y edición de terreno verificados en navegador.`);
})().catch(e => { console.error(e); process.exit(1); });
