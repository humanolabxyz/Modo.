import {insidePolygon,polygonDistance,pathSample} from './geometry.ts';
// Malla de alturas del terreno de Agro. Puro (sin three ni React): se prueba en Node.
// El mapa NO se guarda entero: se regenera desde la semilla y se le reaplican las ediciones (deltas) en orden.
// Coordenadas del mundo: metros, centradas en el origen; x este, z sur, y arriba.
import type {TerrainEdit, TerrainParameters, TerritoryId} from '../model/types.ts';
import {DEFAULT_GENERATOR_VERSION, generatorFor} from './generators.ts';

/** `generatorVersion` omitido = 1 (el generador original de la Fase 6). */
export type TerrainSpec = {sizeMeters: [number, number]; cellMeters: number; seed: number; generatorVersion?: number; presetId?: TerritoryId; params?: TerrainParameters};

export type Heightfield = {
  sizeX: number; sizeZ: number; cell: number;
  /** Puntos de la malla por lado (celdas + 1). */
  nx: number; nz: number;
  originX: number; originZ: number;
  seed: number;
  /** Versión del generador que produjo `base` (ver generators.ts). */
  generatorVersion: number;
  presetId: TerritoryId;
  params?: TerrainParameters;
  /** Alturas actuales (m), índice `j * nx + i`. */
  data: Float32Array;
  surfaceEdits?: TerrainEdit[];
  /** Red derivada del escenario; no modifica el archivo del mundo. */
  baseRoads?: TerrainEdit[];
  /** Alturas de la base procedural, sin ediciones. */
  base: Float32Array;
  /** Valores confirmados bajo la vista previa de un trazo. */
  originals?: ReadonlyMap<number, number>;
};

export const MIN_HEIGHT = -50, MAX_HEIGHT = 500;

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
/** Relieve base de la semilla con el generador de la versión dada (por defecto la 1). La implementación vive en generators.ts y está congelada por versión. */
export function baseHeight(seed: number, x: number, z: number, sx: number, sz: number, generatorVersion: number = DEFAULT_GENERATOR_VERSION, presetId?: TerritoryId, params?: TerrainParameters): number {
  return generatorFor(generatorVersion)(seed, x, z, sx, sz, presetId, params);
}

export function createHeightfield(spec: TerrainSpec): Heightfield {
  const [sizeX, sizeZ] = spec.sizeMeters, cell = spec.cellMeters;
  const nx = Math.round(sizeX / cell) + 1, nz = Math.round(sizeZ / cell) + 1;
  const originX = -sizeX / 2, originZ = -sizeZ / 2;
  const generatorVersion = spec.generatorVersion ?? DEFAULT_GENERATOR_VERSION, generate = generatorFor(generatorVersion), base = new Float32Array(nx * nz);
  const presetId = spec.presetId ?? 'free', params = spec.params && {...spec.params};
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) base[j * nx + i] = generate(spec.seed, originX + i * cell, originZ + j * cell, sizeX, sizeZ, presetId, params);
  return {sizeX, sizeZ, cell, nx, nz, originX, originZ, seed: spec.seed, generatorVersion, presetId, ...(params && {params}), data: new Float32Array(base), base};
}

/** Región de celdas (índices de la malla) que toca una edición, ampliada en 1 para las normales. */
export function editCellBounds(hf: Heightfield, e: Pick<TerrainEdit, 'center' | 'radius'>): {i0: number; i1: number; j0: number; j1: number} {
  return {
    i0: Math.max(0, Math.floor((e.center[0] - e.radius - hf.originX) / hf.cell) - 1), i1: Math.min(hf.nx - 1, Math.ceil((e.center[0] + e.radius - hf.originX) / hf.cell) + 1),
    j0: Math.max(0, Math.floor((e.center[1] - e.radius - hf.originZ) / hf.cell) - 1), j1: Math.min(hf.nz - 1, Math.ceil((e.center[1] + e.radius - hf.originZ) / hf.cell) + 1),
  };
}

/**
 * Aplica una edición. Atenuación suave (1 − t²)² con t = distancia / radio.
 *  · raise / lower: `amount` = metros en el centro.   · level: `amount` = cota objetivo (m); el borde se funde con el terreno.
 */
export function applyEdit(hf: Heightfield, e: Pick<TerrainEdit, 'kind' | 'center' | 'radius' | 'amount'> & Partial<TerrainEdit>, originals?: Map<number, number>): void {
  if(e.kind === 'paint') return;
  const {i0, i1, j0, j1} = editCellBounds(hf, e), r2 = e.radius * e.radius;
  // Jacobi: todas las muestras leen el mismo estado anterior, nunca vecinos ya
  // modificados por el orden del bucle. Algoritmo smooth V1 congelado.
  const source = e.kind === 'smooth' ? hf.data.slice() : null;
  for (let j = j0; j <= j1; j++) {
    const dz = hf.originZ + j * hf.cell - e.center[1];
    for (let i = i0; i <= i1; i++) {
      const dx = hf.originX + i * hf.cell - e.center[0], d2 = dx * dx + dz * dz;
      if (d2 >= r2) continue;
      const t2 = d2 / r2; let k = (1 - t2) * (1 - t2); const idx = j * hf.nx + i, h = hf.data[idx];
      let target = e.kind === 'restore' ? hf.base[idx] : e.amount;
      if(e.kind==='ditch'||e.kind==='road') {
        const q=pathSample([hf.originX+i*hf.cell,hf.originZ+j*hf.cell],e.points!);
        const d=q.distance/(e.width!/2);if(d>=1)continue;k=(1-d*d)**2*(e.kind==='road'?e.amount:1);
        target=e.kind==='ditch'?h-e.amount:e.heights![q.segment]+(e.heights![q.segment+1]-e.heights![q.segment])*q.t;
      }
      if(e.kind==='slope'||e.kind==='terrace') {
        const x=hf.originX+i*hf.cell,z=hf.originZ+j*hf.cell,poly=e.points!;
        if(!insidePolygon([x,z],poly))continue;
        const edge=Math.min(1,polygonDistance([x,z],poly)/e.width!);k=edge*edge*(3-2*edge);
        if(e.kind==='terrace')target=e.amount+Math.round((h-e.amount)/e.stepHeight!)*e.stepHeight!;
        else {const [a,b]=poly,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);target=e.amount+((x-a[0])*dx+(z-a[1])*dz)/length*e.grade!/100;}
      }
      if (source) {
        let sum = 0, count = 0;
        for (let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++) {
          const u=i+di,v=j+dj;if(u>=0&&v>=0&&u<hf.nx&&v<hf.nz){sum+=source[v*hf.nx+u];count++;}
        }
        target = h + (sum/count-h)*clamp(e.amount,0,1);
      }
      const next = e.kind === 'raise' ? h + e.amount * k : e.kind === 'lower' ? h - e.amount * k : h + (target - h) * k;
      const height = Math.fround(clamp(next, MIN_HEIGHT, MAX_HEIGHT));
      if (originals && height !== h && !originals.has(idx)) originals.set(idx, h);
      hf.data[idx] = height;
    }
  }
}

/** Vuelve a la base y reaplica las ediciones en orden (reproducible). */
export function rebuild(hf: Heightfield, edits: readonly TerrainEdit[]): void {
  hf.data.set(hf.base);
  for (const e of edits) applyEdit(hf, e);
}

/** Cota (m) con interpolación bilineal. Fuera del mapa se toma el borde. */
export function sampleHeight(hf: Heightfield, x: number, z: number): number {
  const fi = clamp((x - hf.originX) / hf.cell, 0, hf.nx - 1), fj = clamp((z - hf.originZ) / hf.cell, 0, hf.nz - 1);
  const i = Math.min(Math.floor(fi), hf.nx - 2), j = Math.min(Math.floor(fj), hf.nz - 2), u = fi - i, v = fj - j;
  const lo = j * hf.nx + i, hi = lo + hf.nx, before = hf.originals;
  const a = before?.get(lo) ?? hf.data[lo], b = before?.get(lo + 1) ?? hf.data[lo + 1];
  const c = before?.get(hi) ?? hf.data[hi], d = before?.get(hi + 1) ?? hf.data[hi + 1];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Pendiente (grados) por diferencias centrales. */
export function slopeDegrees(hf: Heightfield, x: number, z: number): number {
  const d = hf.cell;
  const gx = (sampleHeight(hf, x + d, z) - sampleHeight(hf, x - d, z)) / (2 * d), gz = (sampleHeight(hf, x, z + d) - sampleHeight(hf, x, z - d)) / (2 * d);
  return (Math.atan(Math.sqrt(gx * gx + gz * gz)) * 180) / Math.PI;
}

/** Normal unitaria [x, y, z] con paso `step` (m). */
export function normalAt(hf: Heightfield, x: number, z: number, step = hf.cell): [number, number, number] {
  const gx = (sampleHeight(hf, x + step, z) - sampleHeight(hf, x - step, z)) / (2 * step), gz = (sampleHeight(hf, x, z + step) - sampleHeight(hf, x, z - step)) / (2 * step);
  const n = Math.sqrt(gx * gx + 1 + gz * gz);
  return [-gx / n, 1 / n, -gz / n];
}

export const inBounds = (hf: Heightfield, x: number, z: number): boolean => x >= hf.originX && x <= hf.originX + hf.sizeX && z >= hf.originZ && z <= hf.originZ + hf.sizeZ;

/** Suma de verificación (FNV-1a sobre los bits de las alturas): sirve para comprobar que dos terrenos son idénticos. */
export function checksum(hf: Heightfield): string {
  const words = new Uint32Array(hf.data.buffer, hf.data.byteOffset, hf.data.length);
  let h = 0x811c9dc5;
  for (let i = 0; i < words.length; i++) { h ^= words[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export function heightRange(hf: Heightfield): {min: number; max: number} {
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < hf.data.length; i++) { const h = hf.data[i]; if (h < min) min = h; if (h > max) max = h; }
  return {min, max};
}
