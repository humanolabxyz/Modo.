// Modelo editable del terreno: malla + lista de ediciones + deshacer/rehacer por trazo + versión por chunk. Puro.
// La fuente de verdad guardada es `terrain.edits` (deltas sobre la base de la semilla); la malla de alturas se deriva de ellas.
import {LIMITS, type Terrain, type TerrainEdit, type TerrainEditKind} from '../model/types.ts';
import {applyEdit, checksum, createHeightfield, editCellBounds, rebuild, type Heightfield} from './heightfield.ts';

export const CHUNK_CELLS = 50;
export const MIN_RADIUS = 2, MAX_RADIUS = 120;

export type StampResult = {ok: true; edit: TerrainEdit} | {ok: false; error: string};

export class TerrainModel {
  readonly hf: Heightfield;
  readonly chunksX: number;
  readonly chunksZ: number;
  /** Versión de cada chunk: sube cuando cambia su geometría (o la de un vecino que afecta a sus normales). */
  readonly versions: Uint32Array;
  private edits_: TerrainEdit[] = [];
  private undo_: number[] = [];
  private redo_: TerrainEdit[][] = [];
  private stroke_: number | null = null;
  private nextId = 1;
  private listeners = new Set<() => void>();

  private constructor(hf: Heightfield) {
    this.hf = hf;
    this.chunksX = Math.ceil((hf.nx - 1) / CHUNK_CELLS);
    this.chunksZ = Math.ceil((hf.nz - 1) / CHUNK_CELLS);
    this.versions = new Uint32Array(this.chunksX * this.chunksZ).fill(1);
  }

  /** Crea el modelo desde el terreno guardado en el mundo: regenera la base y reaplica las ediciones. */
  static fromTerrain(terrain: Terrain): TerrainModel {
    const model = new TerrainModel(createHeightfield(terrain));
    model.edits_ = terrain.edits.map(e => ({...e, center: [e.center[0], e.center[1]] as [number, number]}));
    rebuild(model.hf, model.edits_);
    const used = new Set(model.edits_.map(e => e.id));
    while (used.has(`e${model.nextId}`)) model.nextId++;
    return model;
  }

  get edits(): readonly TerrainEdit[] { return this.edits_; }
  get canUndo(): boolean { return this.undo_.length > 0 && this.stroke_ === null; }
  get canRedo(): boolean { return this.redo_.length > 0 && this.stroke_ === null; }
  get painting(): boolean { return this.stroke_ !== null; }
  checksum(): string { return checksum(this.hf); }
  chunkIndex(cx: number, cz: number): number { return cz * this.chunksX + cx; }

  subscribe(fn: () => void): () => void { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit(): void { for (const fn of this.listeners) fn(); }

  /** Terreno serializable (la semilla y el tamaño no cambian; las ediciones son las vigentes). */
  toTerrain(): Terrain {
    return {sizeMeters: [this.hf.sizeX, this.hf.sizeZ], cellMeters: this.hf.cell, seed: this.hf.seed, edits: this.edits_.map(e => ({...e, center: [e.center[0], e.center[1]] as [number, number]}))};
  }

  private touch(e: Pick<TerrainEdit, 'center' | 'radius'>): void {
    const b = editCellBounds(this.hf, e);
    for (let cz = Math.floor(b.j0 / CHUNK_CELLS); cz <= Math.min(this.chunksZ - 1, Math.floor(b.j1 / CHUNK_CELLS)); cz++)
      for (let cx = Math.floor(b.i0 / CHUNK_CELLS); cx <= Math.min(this.chunksX - 1, Math.floor(b.i1 / CHUNK_CELLS)); cx++) this.versions[this.chunkIndex(cx, cz)]++;
  }

  /** Abre un trazo: todas las marcas hasta `endStroke` se deshacen juntas. */
  beginStroke(): void { if (this.stroke_ === null) this.stroke_ = 0; }

  stamp(kind: TerrainEditKind, x: number, z: number, radius: number, amount: number, at = 0): StampResult {
    if (this.stroke_ === null) return {ok: false, error: 'No hay un trazo abierto.'};
    if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(amount)) return {ok: false, error: 'La edición tiene valores no válidos.'};
    if (radius < MIN_RADIUS || radius > MAX_RADIUS) return {ok: false, error: `El radio debe estar entre ${MIN_RADIUS} y ${MAX_RADIUS} m.`};
    if (this.edits_.length >= LIMITS.terrainEdits) return {ok: false, error: `Se alcanzó el límite de ${LIMITS.terrainEdits} ediciones de terreno.`};
    const edit: TerrainEdit = {id: `e${this.nextId++}`, kind, center: [x, z], radius, amount, at};
    applyEdit(this.hf, edit);
    this.edits_.push(edit); this.stroke_++;
    this.touch(edit); this.emit();
    return {ok: true, edit};
  }

  endStroke(): void {
    if (this.stroke_ === null) return;
    if (this.stroke_ > 0) { this.undo_.push(this.stroke_); this.redo_ = []; }
    this.stroke_ = null; this.emit();
  }

  undo(): boolean {
    if (!this.canUndo) return false;
    const n = this.undo_.pop()!, removed = this.edits_.splice(this.edits_.length - n, n);
    rebuild(this.hf, this.edits_);
    this.redo_.push(removed);
    for (const e of removed) this.touch(e);
    this.emit(); return true;
  }

  redo(): boolean {
    if (!this.canRedo) return false;
    const stroke = this.redo_.pop()!;
    for (const e of stroke) { applyEdit(this.hf, e); this.edits_.push(e); this.touch(e); }
    this.undo_.push(stroke.length);
    this.emit(); return true;
  }
}
