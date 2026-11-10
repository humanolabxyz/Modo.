// modo. Agro — restaurar una copia de seguridad anterior a la migración (hasta que exista una opción visible en la interfaz).
// Cómo usarlo: ver docs/agro/CONSOLIDACION_ETAPA_1.md, sección «Restaurar una copia de seguridad».
//   1) Abre modo. Agro (/agro/) en el MISMO navegador donde están tus mundos y abre la consola de desarrollador (F12 → Consola).
//   2) Pega TODO este archivo y pulsa Enter (define la función `restaurarCopiaAgro`).
//   3) Lista las copias:                         await restaurarCopiaAgro()
//   4) Restaura la copia anterior a la migración: await restaurarCopiaAgro('ID-DEL-MUNDO')
//      (o una copia concreta:                     await restaurarCopiaAgro('ID-DEL-MUNDO', 'CLAVE-DE-LA-COPIA'))
//   5) Recarga la página: el mundo se abre desde el registro restaurado.
// Antes de reemplazar el mundo actual se guarda una copia de su estado actual (motivo «antes-de-restaurar»), en la misma transacción: o se hacen las dos cosas o ninguna.
// No borra ni modifica ninguna copia existente.
async function restaurarCopiaAgro(worldId, key) {
  const ask = req => new Promise((ok, no) => { req.onsuccess = () => ok(req.result); req.onerror = () => no(req.error); });
  const db = await new Promise((ok, no) => { const r = indexedDB.open('modo-agro', 1); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('Almacenamiento en uso por otra pestaña.')); });
  try {
    const backups = (await ask(db.transaction('meta', 'readonly').objectStore('meta').getAll())).filter(b => b && b.kind === 'backup');
    const info = b => ({clave: b.key, mundo: b.worldId, nombre: b.row && b.row.name, versionOriginal: b.fromVersion, guardada: b.savedAt, motivo: b.reason});
    if (!worldId) { const list = backups.map(info); console.table(list); return list; }
    const mine = backups.filter(b => b.worldId === worldId);
    const pick = key ? mine.find(b => b.key === key) : mine.filter(b => b.reason === 'migracion').sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))[0];
    if (!pick) throw new Error('No hay una copia de seguridad de ese mundo' + (key ? ' con esa clave.' : '.'));
    const current = await ask(db.transaction('worlds', 'readonly').objectStore('worlds').get(worldId));
    const tx = db.transaction(['meta', 'worlds'], 'readwrite'), done = new Promise((ok, no) => { tx.oncomplete = ok; tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error || new Error('Transacción cancelada.')); });
    let kept = null;
    if (current !== undefined) {
      const version = current && current.data && Number.isInteger(current.data.version) ? current.data.version : 'desconocida';
      kept = `backup:${worldId}:v${version}:antes-de-restaurar-${Date.now()}`;
      if (await ask(tx.objectStore('meta').get(kept)) !== undefined) throw new Error('Clave de copia ocupada; vuelve a intentarlo.');
      tx.objectStore('meta').add({kind: 'backup', key: kept, worldId, fromVersion: version === 'desconocida' ? null : version, savedAt: new Date().toISOString(), reason: 'antes-de-restaurar', row: current}, kept);   // add: falla si la clave existe, nunca sobrescribe
    }
    tx.objectStore('worlds').put(pick.row, worldId);
    await done;
    const back = await ask(db.transaction('worlds', 'readonly').objectStore('worlds').get(worldId));
    if (JSON.stringify(back) !== JSON.stringify(pick.row)) throw new Error('La restauración no coincide con la copia.');
    const result = {restaurado: worldId, desde: pick.key, estadoAnteriorGuardadoEn: kept};
    console.log('Restaurado. Recarga la página para abrir el mundo.', result); return result;
  } finally { db.close(); }
}
