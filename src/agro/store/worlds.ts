// Biblioteca de mundos guardados. Lógica pura sobre un `Backend`.
// Reglas (mismas que `readLibrary` de Industria): nunca se sobrescribe ni se borra lo que no se pudo leer, y un guardado fallido nunca se presenta como exitoso.
import {newId} from '../model/defaults.ts';
import {parseWorld} from '../model/validate.ts';
import {CURRENT_VERSION, type Result, type WorldProject} from '../model/types.ts';
import type {Backend} from './backend.ts';

export const MAX_WORLDS = 50;
export type Summary = {id: string; name: string; createdAt: string; updatedAt: string; experience: string; entities: number; edits: number; readable: boolean; error?: string};
type Record_ = {id: string; name: string; createdAt: string; updatedAt: string; experience: string; entities: number; edits: number; data: unknown};

const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const isRecord = (v: unknown): v is Record_ => typeof v === 'object' && v !== null && typeof (v as Record_).id === 'string';
const ACTIVE = 'active';

/** Copia de seguridad de un registro de mundo tal como estaba guardado (se escribe en el almacén `meta`, nunca se sobrescribe ni se lista como mundo). */
export type BackupReason = 'migracion' | 'antes-de-restaurar';
type BackupRecord = {kind: 'backup'; key: string; worldId: string; fromVersion: number | null; savedAt: string; reason: BackupReason; row: unknown};
export type BackupInfo = {key: string; worldId: string; name: string; fromVersion: number | null; savedAt: string; reason: BackupReason};
const isBackup = (v: unknown): v is BackupRecord => typeof v === 'object' && v !== null && (v as BackupRecord).kind === 'backup' && typeof (v as BackupRecord).key === 'string' && typeof (v as BackupRecord).worldId === 'string';
/** Versión del esquema con que se guardó el registro (null si no se puede leer). */
const rowVersion = (row: unknown): number | null => {
  const data = isRecord(row) ? (row as Record_).data : null;
  return typeof data === 'object' && data !== null && Number.isInteger((data as {version?: unknown}).version) ? (data as {version: number}).version : null;
};

export class WorldStore {
  private backend: Backend;
  constructor(backend: Backend) { this.backend = backend; }

  /** Mundos guardados, el más reciente primero. Los ilegibles se listan marcados (no se ocultan ni se borran). */
  async list(): Promise<Result<Summary[]>> {
    let rows: unknown[];
    try { rows = await this.backend.getAll('worlds'); } catch (e) { return fail(`No se pudieron leer los mundos guardados: ${msg(e)}`); }
    const out: Summary[] = [];
    for (const row of rows) {
      if (!isRecord(row)) continue;
      const parsed = parseWorld(row.data);
      out.push({id: row.id, name: String(row.name ?? 'Sin nombre'), createdAt: String(row.createdAt ?? ''), updatedAt: String(row.updatedAt ?? ''), experience: String(row.experience ?? 'free'),
        entities: Number(row.entities) || 0, edits: Number(row.edits) || 0, readable: parsed.ok, ...(parsed.ok ? {} : {error: parsed.error})});
    }
    out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
    return {ok: true, value: out};
  }

  async load(id: string): Promise<Result<WorldProject>> {
    let row: unknown;
    try { row = await this.backend.get('worlds', id); } catch (e) { return fail(`No se pudo leer el mundo: ${msg(e)}`); }
    if (!isRecord(row)) return fail('Ese mundo ya no existe.');
    const parsed = parseWorld(row.data);
    return parsed.ok ? parsed : fail(`El mundo guardado no se puede leer (${parsed.error}). No se modificó.`);
  }

  /** Guarda el mundo (solo si es válido). Devuelve error si el navegador no pudo escribir. */
  async save(world: WorldProject): Promise<Result<true>> {
    const checked = parseWorld(world);
    if (!checked.ok) return fail(`El mundo no se guardó porque no es válido: ${checked.error}`);
    let existing: unknown;
    try { existing = await this.backend.get('worlds', world.id); } catch (e) { return fail(`No se pudo comprobar el mundo guardado, así que no se escribió nada: ${msg(e)}`); }
    if (existing === undefined && ((await this.count()) ?? 0) >= MAX_WORLDS) return fail(`Hay ${MAX_WORLDS} mundos guardados: elimina alguno para crear otro.`);
    // Antes de escribir sobre un registro de un esquema anterior (o ilegible) se guarda y VERIFICA una copia exacta. Si la copia falla, no se escribe nada.
    if (existing !== undefined && (rowVersion(existing) ?? 0) < CURRENT_VERSION) {
      const backup = await this.ensureBackup(existing, 'migracion');
      if (!backup.ok) return fail(`No se guardó: no se pudo crear la copia de seguridad previa a la migración, y el mundo original sigue intacto. ${backup.error}`);
    }
    const w = checked.value, record: Record_ = {id: w.id, name: w.name, createdAt: w.createdAt, updatedAt: w.updatedAt, experience: w.experience, entities: w.entities.length, edits: w.terrain.edits.length, data: w};
    try { await this.backend.put('worlds', w.id, record); } catch (e) { return fail(`No se pudo guardar: ${msg(e)}`); }
    return {ok: true, value: true};
  }

  /** Guarda un mundo que viene de un archivo: si su id ya existe, se guarda como copia con id nuevo (no pisa el que tienes). */
  async importWorld(world: WorldProject): Promise<Result<WorldProject>> {
    const taken = await this.exists(world.id);
    const next: WorldProject = taken ? {...world, id: newId('w'), name: `${world.name} (importado)`.slice(0, 80)} : world;
    const saved = await this.save(next);
    return saved.ok ? {ok: true, value: next} : saved;
  }

  async duplicate(id: string): Promise<Result<WorldProject>> {
    const loaded = await this.load(id); if (!loaded.ok) return loaded;
    const now = new Date().toISOString(), copy: WorldProject = {...loaded.value, id: newId('w'), name: `${loaded.value.name} (copia)`.slice(0, 80), createdAt: now, updatedAt: now};
    const saved = await this.save(copy);
    return saved.ok ? {ok: true, value: copy} : saved;
  }

  async remove(id: string): Promise<Result<true>> {
    try {
      await this.backend.del('worlds', id); if ((await this.backend.get('meta', ACTIVE)) === id) await this.backend.del('meta', ACTIVE);
      for (const b of await this.backupRecords()) if (b.worldId === id) await this.backend.del('meta', b.key);   // eliminar un mundo elimina también sus copias de seguridad
    } catch (e) { return fail(`No se pudo eliminar: ${msg(e)}`); }
    return {ok: true, value: true};
  }

  // ── Copias de seguridad de la migración ─────────────────────────────────
  private async backupRecords(): Promise<BackupRecord[]> { return (await this.backend.getAll('meta')).filter(isBackup); }

  private async ensureBackup(row: unknown, reason: BackupReason): Promise<Result<true>> {
    if (!isRecord(row)) return fail('El registro guardado no tiene un formato reconocible.');
    try {
      const mine = (await this.backupRecords()).filter(b => b.worldId === row.id), text = JSON.stringify(row);
      if (mine.some(b => JSON.stringify(b.row) === text)) return {ok: true, value: true};   // ya existe una copia idéntica
      // Una copia existente NUNCA se sobrescribe: si la clave ya está ocupada (aunque sea por una copia distinta) se usa la siguiente libre.
      const version = rowVersion(row), base = `backup:${row.id}:v${version ?? 'desconocida'}`; let key = base;
      for (let i = 1; mine.some(b => b.key === key) || (await this.backend.get('meta', key)) !== undefined; i++) { key = `${base}:${i}`; if (i > 10_000) return fail('Hay demasiadas copias de seguridad de este mundo.'); }
      const record: BackupRecord = {kind: 'backup', key, worldId: row.id, fromVersion: version, savedAt: new Date().toISOString(), reason, row};
      await this.backend.put('meta', key, record);
      const back = await this.backend.get('meta', key);
      if (!isBackup(back) || JSON.stringify(back.row) !== text) return fail('La copia escrita no coincide con el original.');
      return {ok: true, value: true};
    } catch (e) { return fail(msg(e)); }
  }

  /** Copias de seguridad guardadas (la más reciente primero). */
  async listBackups(): Promise<Result<BackupInfo[]>> {
    try {
      const out = (await this.backupRecords()).map(b => ({key: b.key, worldId: b.worldId, name: String((isRecord(b.row) ? (b.row as Record_).name : '') ?? 'Sin nombre'), fromVersion: b.fromVersion, savedAt: b.savedAt, reason: b.reason}));
      out.sort((a, b) => (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0));
      return {ok: true, value: out};
    } catch (e) { return fail(`No se pudieron leer las copias de seguridad: ${msg(e)}`); }
  }

  /** Devuelve el mundo a como estaba antes de la migración (la copia indicada o, por defecto, la anterior a la migración más reciente). Antes de reemplazarlo se conserva una copia del estado actual. */
  async restoreBackup(worldId: string, key?: string): Promise<Result<WorldProject>> {
    let records: BackupRecord[];
    try { records = (await this.backupRecords()).filter(b => b.worldId === worldId); } catch (e) { return fail(`No se pudieron leer las copias de seguridad: ${msg(e)}`); }
    const pick = key ? records.find(b => b.key === key) : records.filter(b => b.reason === 'migracion').sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))[0];
    if (!pick) return fail('No hay una copia de seguridad de ese mundo.');
    const parsed = parseWorld(isRecord(pick.row) ? (pick.row as Record_).data : undefined);
    if (!parsed.ok) return fail(`La copia de seguridad no se puede leer (${parsed.error}). No se restauró nada.`);
    try {
      const current = await this.backend.get('worlds', worldId);
      if (current !== undefined) { const kept = await this.ensureBackup(current, 'antes-de-restaurar'); if (!kept.ok) return fail(`No se restauró: no se pudo conservar el estado actual. ${kept.error}`); }
      await this.backend.put('worlds', worldId, pick.row);
      const back = await this.backend.get('worlds', worldId);
      if (JSON.stringify(back) !== JSON.stringify(pick.row)) return fail('La restauración no coincide con la copia.');
    } catch (e) { return fail(`No se pudo restaurar: ${msg(e)}`); }
    return parsed;
  }

  async getActive(): Promise<string | null> { try { const v = await this.backend.get('meta', ACTIVE); return typeof v === 'string' ? v : null; } catch { return null; } }
  async setActive(id: string): Promise<void> { try { await this.backend.put('meta', ACTIVE, id); } catch { /* el mundo activo es una comodidad: si falla no se avisa */ } }

  /** Texto crudo del registro (para exportar una copia de un mundo ilegible sin perderlo). */
  async rawText(id: string): Promise<string | null> {
    try { const row = await this.backend.get('worlds', id); return isRecord(row) ? JSON.stringify(row.data, null, 2) : null; } catch { return null; }
  }

  private async exists(id: string): Promise<boolean> { try { return (await this.backend.get('worlds', id)) !== undefined; } catch { return false; } }
  private async count(): Promise<number | null> { try { return (await this.backend.getAll('worlds')).length; } catch { return null; } }
}
