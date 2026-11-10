// Etapa 1: migración v1 → v2 con IndexedDB REAL en el navegador (perfil desechable de Playwright; nunca toca los mundos del usuario).
// Abrir un mundo v1 no escribe; el primer cambio lo migra a v2 con copia exacta previa; un trazo de terreno abierto no se autoguarda a medias; recargar conserva todo.
// Uso: AGRO_URL=http://127.0.0.1:4386 node qa/verify-agro-migration-ui.cjs   (servidor de vista previa sobre el build)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('./lib/playwright.cjs');
const base = (process.env.AGRO_URL || 'http://127.0.0.1:4386').replace(/\/$/, '');
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

(async () => {
  const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  try {
    const c = await b.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
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
    await p.mouse.down(); for (let i = 0; i < 6; i++) { await p.mouse.move(720 + i * 18, 520 + i * 6); await p.waitForTimeout(80); }
    await p.waitForTimeout(1800);   // más que el retardo del autoguardado (700 ms) con el botón pulsado
    const during = await idb.get(p, 'worlds', original.a.id);
    assert.equal(during.data.terrain.edits.length, editsBefore, 'se guardó un trazo a medias');
    await p.evaluate(() => { window.dispatchEvent(new Event('pagehide')); }); await p.waitForTimeout(1200);   // salida de la página con el trazo abierto: guardado forzado
    assert.equal((await idb.get(p, 'worlds', original.a.id)).data.terrain.edits.length, editsBefore, 'la salida de la página guardó un trazo a medias');
    await p.mouse.up(); await p.waitForTimeout(400); await saved(p);
    const finished = await idb.get(p, 'worlds', original.a.id); assert.ok(finished.data.terrain.edits.length > editsBefore); assert.equal(finished.data.version, 2);
    assert.equal((await idb.keys(p, 'meta')).filter(k => String(k).startsWith('backup:')).length, 1);
    pass(`con un trazo de terreno abierto durante 1,8 s, y también al disparar la salida de la página (guardado forzado), no se guarda nada a medias (${editsBefore} ediciones en disco); al soltar se guarda el trazo completo (${finished.data.terrain.edits.length}) sin crear copias nuevas`);

    // Recargar y volver a abrir: mismo mundo
    await p.reload(); await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await p.waitForTimeout(1500);   // la app reabre el último mundo activo
    assert.equal(await p.locator('[data-testid=agro-world-name]').innerText(), original.a.name);
        const reopened = await idb.get(p, 'worlds', original.a.id); assert.equal(JSON.stringify(reopened), JSON.stringify(finished));
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

    // Mundo nuevo desde el asistente: nace v2
    await p.getByRole('button', {name: /Mis mundos/}).click(); await p.locator('[data-view=lobby]').waitFor();
    await p.getByTestId('agro-new').click(); await p.getByLabel('Nombre del mundo').fill('Nuevo v2');
    for (let i = 0; i < 6; i++) await p.getByTestId('agro-wizard-next').click(); await p.getByTestId('agro-create').click();
    await p.locator('[data-view=workspace]').waitFor(); await rendered(p); await saved(p);
    const rows = await p.evaluate(() => new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => { const q = r.result.transaction('worlds', 'readonly').objectStore('worlds').getAll(); q.onsuccess = () => { r.result.close(); ok(q.result); }; }; r.onerror = () => no(r.error); }));
    const created = rows.find(r => r.name === 'Nuevo v2'); assert.ok(created); assert.equal(created.data.version, 2); assert.equal(created.data.terrain.generatorVersion, 1); assert.equal(created.data.terrain.presetId, 'free'); assert.equal(created.data.scenario.territory, 'free');
    assert.equal((await idb.keys(p, 'meta')).filter(k => String(k).startsWith('backup:') && !String(k).includes('antes-de-restaurar')).length, 1); assert.equal(JSON.stringify(await idb.get(p, 'worlds', original.b.id)), untouchedB);
    pass('un mundo creado con el asistente se guarda como v2 con generatorVersion 1 y territorio, sin copias nuevas; el mundo v1 que no se abrió sigue idéntico');
    assert.deepEqual(errors, [], 'errores de página: ' + errors.join(' | '));
    pass('sin errores de consola ni excepciones durante toda la prueba');
    await c.close();
  } finally { await b.close(); }
  console.log(`${n} bloques de verificación de la migración v1 → v2 en el navegador (Etapa 1) en verde.`);
})().catch(e => { console.error(e); process.exit(1); });
