// Modelo editable del terreno: malla + lista de ediciones + deshacer/rehacer por trazo + versión por chunk. Puro.
// La fuente de verdad guardada es `terrain.edits` y `terrain.surfaceEdits` (operaciones y capa visual); la malla de alturas se deriva de ellas.
import {LIMITS, type Terrain, type TerrainEdit, type TerrainEditKind, type TerritoryId} from '../model/types.ts';
import {applyEdit, checksum, createHeightfield, editCellBounds, inBounds, rebuild, type Heightfield} from './heightfield.ts';

export const CHUNK_CELLS = 50;
export const MIN_RADIUS = 2, MAX_RADIUS = 120;

export type StampResult = {ok: true; edit: TerrainEdit} | {ok: false; error: string};

export class TerrainModel {
  readonly hf: Heightfield;
  readonly chunksX: number;
  readonly chunksZ: number;
  /** Versión de cada chunk: sube cuando cambia su geometría (o la de un vecino que afecta a sus normales). */
  readonly versions: Uint32Array;
  /** Revisión del perímetro escénico y las muestras de sus normales. */
  edgeVersion = 0;
  private edits_: TerrainEdit[] = [];
  private undo_: number[] = [];
  private redo_: TerrainEdit[][] = [];
  private stroke_: {start: number; originals: Map<number, number>} | null = null;
  private nextId = 1;
  private usedIds = new Set<string>();
  private listeners = new Set<() => void>();

  /** Territorio del mundo (se conserva tal cual al guardar). */
  readonly presetId: TerritoryId;

  private constructor(hf: Heightfield, presetId: TerritoryId) {
    this.hf = hf; this.presetId = presetId;
    this.chunksX = Math.ceil((hf.nx - 1) / CHUNK_CELLS);
    this.chunksZ = Math.ceil((hf.nz - 1) / CHUNK_CELLS);
    this.versions = new Uint32Array(this.chunksX * this.chunksZ).fill(1);
  }

  /** Crea el modelo desde el terreno guardado en el mundo: regenera la base y reaplica las ediciones. */
  static fromTerrain(terrain: Terrain): TerrainModel {
    const model = new TerrainModel(createHeightfield(terrain), terrain.presetId);
    model.edits_ = [...terrain.edits,...(terrain.surfaceEdits??[])].map(e => ({...e, center: [e.center[0], e.center[1]] as [number, number]}));
    rebuild(model.hf, model.edits_);
    model.hf.surfaceEdits=[...model.edits_.filter(e=>e.kind==='road'||e.kind==='ditch'),...model.edits_.filter(e=>e.kind==='paint')];
    model.usedIds = new Set(model.edits_.map(e => e.id));
    return model;
  }

  get edits(): readonly TerrainEdit[] { return this.edits_; }
  get canUndo(): boolean { return this.undo_.length > 0 && this.stroke_ === null; }
  get canRedo(): boolean { return this.redo_.length > 0 && this.stroke_ === null; }
  get painting(): boolean { return this.stroke_ !== null; }
  get strokeSize(): number { return this.stroke_ ? this.edits_.length - this.stroke_.start : 0; }
  get committedHeightfield(): Heightfield {
    return this.stroke_ ? {...this.hf, originals: this.stroke_.originals} : this.hf;
  }
  checksum(): string { return checksum(this.hf); }
  chunkIndex(cx: number, cz: number): number { return cz * this.chunksX + cx; }

  subscribe(fn: () => void): () => void { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit(): void { for (const fn of this.listeners) fn(); }

  /**
   * Terreno serializable (la semilla y el tamaño no cambian). Solo incluye las ediciones CONFIRMADAS: las marcas de un trazo todavía abierto (que aún no entró al historial)
   * nunca se serializan, ni siquiera en un guardado forzado al salir de la página o al cerrar el mundo.
   */
  toTerrain(): Terrain {
    const confirmed = this.edits_.slice(0, this.stroke_?.start ?? this.edits_.length);
    return {sizeMeters: [this.hf.sizeX, this.hf.sizeZ], cellMeters: this.hf.cell, seed: this.hf.seed, generatorVersion: this.hf.generatorVersion, presetId: this.presetId,
      ...(this.hf.params && {params: {...this.hf.params}}), edits: structuredClone(confirmed.filter(e=>e.kind!=='paint')), ...(confirmed.some(e=>e.kind==='paint') ? {surfaceEdits:structuredClone(confirmed.filter(e=>e.kind==='paint'))} : {})};
  }

  private touch(e: Pick<TerrainEdit, 'center' | 'radius'>): void {
    this.hf.surfaceEdits=[...this.edits_.filter(edit=>edit.kind==='road'||edit.kind==='ditch'),...this.edits_.filter(edit=>edit.kind==='paint')];
    const b = editCellBounds(this.hf, e);
    if (b.i0 === 0 || b.j0 === 0 || b.i1 === this.hf.nx - 1 || b.j1 === this.hf.nz - 1) this.edgeVersion++;
    for (let cz = Math.floor(b.j0 / CHUNK_CELLS); cz <= Math.min(this.chunksZ - 1, Math.floor(b.j1 / CHUNK_CELLS)); cz++)
      for (let cx = Math.floor(b.i0 / CHUNK_CELLS); cx <= Math.min(this.chunksX - 1, Math.floor(b.i1 / CHUNK_CELLS)); cx++) this.versions[this.chunkIndex(cx, cz)]++;
  }

  /** Abre un trazo: todas las marcas hasta `endStroke` se deshacen juntas. */
  beginStroke(): void {
    this.stroke_ ??= {start: this.edits_.length, originals: new Map()};
  }

  stamp(kind: TerrainEditKind, x: number, z: number, radius: number, amount: number, at = 0): StampResult {
    if (this.stroke_ === null) return {ok: false, error: 'No hay un trazo abierto.'};
    if(!['raise','lower','level'].includes(kind))return {ok:false,error:'Usa una operación versionada del editor para esta herramienta.'};
    if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(amount)) return {ok: false, error: 'La edición tiene valores no válidos.'};
    if (!inBounds(this.hf, x, z)) return {ok: false, error: 'El centro del pincel está fuera del mapa.'};
    if (!Number.isFinite(radius) || radius < MIN_RADIUS || radius > MAX_RADIUS) return {ok: false, error: `El radio debe estar entre ${MIN_RADIUS} y ${MAX_RADIUS} m.`};
    if (this.edits_.length >= LIMITS.terrainEdits) return {ok: false, error: `Se alcanzó el límite de ${LIMITS.terrainEdits} ediciones de terreno.`};
    while (this.usedIds.has(`e${this.nextId}`)) this.nextId++;
    const edit: TerrainEdit = {id: `e${this.nextId++}`, kind, center: [x, z], radius, amount, at};
    applyEdit(this.hf, edit, this.stroke_.originals);
    this.edits_.push(edit);
    this.touch(edit); this.emit();
    return {ok: true, edit};
  }

  /** Añade una operación ya validada a una transacción en vista previa. */
  applyOperation(edit: TerrainEdit): StampResult {
    if (!this.stroke_) return {ok:false,error:'No hay una operación abierta.'};
    if (this.edits_.length >= LIMITS.terrainEdits) return {ok:false,error:'Se alcanzó el límite de ediciones.'};
    while(this.usedIds.has(`e${this.nextId}`))this.nextId++;
    const copy=structuredClone({...edit,id:`e${this.nextId++}`});this.usedIds.add(copy.id);
    applyEdit(this.hf,copy,this.stroke_.originals);this.edits_.push(copy);this.touch(copy);this.emit();
    return {ok:true,edit:copy};
  }

  endStroke(): void {
    if (this.stroke_ === null) return;
    if (this.strokeSize > 0) { this.undo_.push(this.strokeSize); this.redo_ = []; }
    this.stroke_ = null; this.emit();
  }

  abortStroke(): void {
    const stroke = this.stroke_; if (!stroke) return;
    for (const [idx, height] of stroke.originals) this.hf.data[idx] = height;
    for (const edit of this.edits_.splice(stroke.start)) this.touch(edit);
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
