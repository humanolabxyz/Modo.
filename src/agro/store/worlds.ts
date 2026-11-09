// Biblioteca de mundos guardados. Lógica pura sobre un `Backend`.
// Reglas (mismas que `readLibrary` de Industria): nunca se sobrescribe ni se borra lo que no se pudo leer, y un guardado fallido nunca se presenta como exitoso.
import {newId} from '../model/defaults.ts';
import {parseWorld} from '../model/validate.ts';
import type {Result, WorldProject} from '../model/types.ts';
import type {Backend} from './backend.ts';

export const MAX_WORLDS = 50;
export type Summary = {id: string; name: string; createdAt: string; updatedAt: string; experience: string; entities: number; edits: number; readable: boolean; error?: string};
type Record_ = {id: string; name: string; createdAt: string; updatedAt: string; experience: string; entities: number; edits: number; data: unknown};

const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e));
const isRecord = (v: unknown): v is Record_ => typeof v === 'object' && v !== null && typeof (v as Record_).id === 'string';
const ACTIVE = 'active';

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
    if (!(await this.exists(world.id)) && ((await this.count()) ?? 0) >= MAX_WORLDS) return fail(`Hay ${MAX_WORLDS} mundos guardados: elimina alguno para crear otro.`);
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
    try { await this.backend.del('worlds', id); if ((await this.backend.get('meta', ACTIVE)) === id) await this.backend.del('meta', ACTIVE); } catch (e) { return fail(`No se pudo eliminar: ${msg(e)}`); }
    return {ok: true, value: true};
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
