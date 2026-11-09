// Almacenamiento de mundos de Agro. `Backend` abstrae el motor: IndexedDB en el navegador y memoria en las pruebas de Node.
export type StoreName = 'worlds' | 'meta';

export interface Backend {
  getAll(store: StoreName): Promise<unknown[]>;
  get(store: StoreName, key: string): Promise<unknown | undefined>;
  put(store: StoreName, key: string, value: unknown): Promise<void>;
  del(store: StoreName, key: string): Promise<void>;
}

/** Copia en memoria con las mismas garantías que IndexedDB: guarda copias estructuradas, no referencias. `failWrites` simula cuota llena o bloqueo. */
export function memoryBackend(): Backend & {failWrites: boolean; failReads: boolean; raw: Record<StoreName, Map<string, unknown>>} {
  const raw: Record<StoreName, Map<string, unknown>> = {worlds: new Map(), meta: new Map()};
  const copy = <T>(v: T): T => structuredClone(v);
  const api = {
    failWrites: false, failReads: false, raw,
    async getAll(store: StoreName) { if (api.failReads) throw new Error('lectura bloqueada'); return [...raw[store].values()].map(copy); },
    async get(store: StoreName, key: string) { if (api.failReads) throw new Error('lectura bloqueada'); const v = raw[store].get(key); return v === undefined ? undefined : copy(v); },
    async put(store: StoreName, key: string, value: unknown) { if (api.failWrites) throw new Error('QuotaExceededError'); raw[store].set(key, copy(value)); },
    async del(store: StoreName, key: string) { if (api.failWrites) throw new Error('escritura bloqueada'); raw[store].delete(key); },
  };
  return api;
}

/** IndexedDB real. Una sola base («modo-agro») con dos almacenes: `worlds` (un registro por mundo) y `meta` (mundo activo…). */
export function openIndexedDb(name = 'modo-agro'): Promise<Backend> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Este navegador no permite guardar mundos.')); return; }
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains('worlds')) db.createObjectStore('worlds'); if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta'); };
    req.onerror = () => reject(req.error ?? new Error('No se pudo abrir el almacenamiento.'));
    req.onblocked = () => reject(new Error('El almacenamiento está en uso por otra pestaña.'));
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      const run = <T,>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => new Promise((ok, no) => {
        let result: T;
        try {
          const tx = db.transaction(store, mode), r = fn(tx.objectStore(store));
          r.onsuccess = () => { result = r.result; };
          tx.oncomplete = () => ok(result);
          tx.onerror = () => no(tx.error ?? r.error ?? new Error('Falló la transacción.'));
          tx.onabort = () => no(tx.error ?? new Error('La transacción se canceló (¿sin espacio?).'));
        } catch (e) { no(e); }
      });
      resolve({
        getAll: store => run(store, 'readonly', s => s.getAll()),
        get: (store, key) => run(store, 'readonly', s => s.get(key)),
        put: async (store, key, value) => { await run(store, 'readwrite', s => s.put(value, key)); },
        del: async (store, key) => { await run(store, 'readwrite', s => s.delete(key)); },
      });
    };
  });
}
