// Geometría del terreno por chunks con niveles de detalle (LOD). Puro: devuelve arreglos tipados, la escena los convierte en mallas.
// Cada chunk cubre 50×50 celdas (100 m con celdas de 2 m). Los bordes llevan una «falda» vertical que tapa las grietas entre LOD distintos.
import {valueNoise} from './noise.ts';
import {riverInfo, roadDist, roadPoints} from './landmarks.ts';
import {normalAt, sampleHeight, type Heightfield} from './heightfield.ts';
import {CHUNK_CELLS} from './model.ts';

/** Saltos de malla por LOD (en celdas): 0 = máximo detalle. */
export const LOD_STRIDES = [1, 2, 5] as const;
/** Distancia (m) hasta la que se usa cada LOD; más allá, el siguiente. */
export const LOD_DISTANCES = [170, 460] as const;

export const lodForDistance = (d: number): number => (d < LOD_DISTANCES[0] ? 0 : d < LOD_DISTANCES[1] ? 1 : 2);

export type ChunkData = {
  positions: Float32Array; normals: Float32Array; colors: Float32Array; indices: Uint16Array | Uint32Array;
  triangles: number; vertices: number;
  /** Esfera envolvente (centro y radio) para el recorte por cámara. */
  center: [number, number, number]; radius: number;
};

export type ChunkRect = {c0i: number; c0j: number; w: number; h: number; centerX: number; centerZ: number};

export function chunkRect(hf: Heightfield, cx: number, cz: number): ChunkRect {
  const c0i = cx * CHUNK_CELLS, c0j = cz * CHUNK_CELLS, w = Math.min(CHUNK_CELLS, hf.nx - 1 - c0i), h = Math.min(CHUNK_CELLS, hf.nz - 1 - c0j);
  return {c0i, c0j, w, h, centerX: hf.originX + (c0i + w / 2) * hf.cell, centerZ: hf.originZ + (c0j + h / 2) * hf.cell};
}

const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const roadCache = new Map<number, ReturnType<typeof roadPoints>>();
/** Color lineal del suelo, estilizado: pradera verde con parches de pasto seco y tierra, bosque bajo oscuro, roca en pendientes y nieve en las cumbres (sRGB aproximado → lineal). */
export function terrainColor(hf: Heightfield, x: number, z: number, y: number, ny: number): [number, number, number] {
  const n1 = valueNoise(hf.seed + 31, x / 9, z / 9), n2 = valueNoise(hf.seed + 57, x / 43, z / 43), n3 = valueNoise(hf.seed + 83, x / 150, z / 150);
  const grass: [number, number, number] = [0.36, 0.62, 0.22], lush: [number, number, number] = [0.25, 0.52, 0.18], dry: [number, number, number] = [0.66, 0.64, 0.30], soil: [number, number, number] = [0.52, 0.38, 0.24], forest: [number, number, number] = [0.15, 0.36, 0.16];
  const rock: [number, number, number] = [0.50, 0.48, 0.46], scree: [number, number, number] = [0.66, 0.64, 0.62], snow: [number, number, number] = [0.95, 0.97, 1.0];
  const lerp = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
  let c = lerp(grass, lush, clamp01(n2 * 1.3 - 0.25));
  c = lerp(c, dry, clamp01((n3 - 0.5) * 3) * 0.55);                       // manchas de pasto seco
  c = lerp(c, soil, clamp01((n1 - 0.68) * 4) * clamp01((ny - 0.98) * 50) * 0.7);   // claros de tierra en los llanos
  c = lerp(c, forest, clamp01((n3 - 0.52) * -4 + 0.2) * clamp01((y - 10) / 40) * 0.65);   // bosque bajo en las laderas medias
  const steep = clamp01((0.955 - ny) / 0.09), high = clamp01((y - 85) / 70), snowAmt = clamp01((y - 120) / 25) * clamp01((ny - 0.78) * 6);
  const rk = lerp(rock, scree, high), rockAmt = Math.max(steep, high * 0.7);
  c = lerp(c, rk, rockAmt); c = lerp(c, snow, snowAmt);
  // Camino de tierra y río (decorativos): el camino se pinta marrón claro con borde de pasto pisado; el río, azul con orilla de arena.
  const half = Math.min(hf.sizeX, hf.sizeZ) / 2, roads = roadCache.get(hf.seed) ?? (roadCache.set(hf.seed, roadPoints(hf.seed, half)), roadCache.get(hf.seed)!);
  const rd = roadDist(hf.seed, half, x, z, roads), road: [number, number, number] = [0.66, 0.52, 0.34];
  c = lerp(c, road, clamp01((4.2 - rd) / 1.6) * 0.95 * clamp01((ny - 0.9) * 12)); c = lerp(c, [0.45, 0.5, 0.25], clamp01((6.5 - rd) / 2.5) * clamp01((rd - 3) / 2) * 0.35);
  const ri = riverInfo(hf.seed, x, z), sand: [number, number, number] = [0.8, 0.72, 0.5], water: [number, number, number] = [0.16, 0.42, 0.66];
  c = lerp(c, sand, clamp01((ri.half + 3.5 - ri.dist) / 2.5) * 0.9); c = lerp(c, water, clamp01((ri.half - ri.dist) / 1.5));
  const v = 0.93 + 0.14 * n1;
  const out = [Math.min(1, c[0] * v), Math.min(1, c[1] * v), Math.min(1, c[2] * v)];
  return [out[0] * out[0], out[1] * out[1], out[2] * out[2]];
}

export function buildChunk(hf: Heightfield, cx: number, cz: number, lod: number): ChunkData {
  const rect = chunkRect(hf, cx, cz), stride = LOD_STRIDES[Math.min(lod, LOD_STRIDES.length - 1)];
  const axis = (c0: number, len: number): number[] => { const out: number[] = []; for (let k = 0; k < len; k += stride) out.push(c0 + k); out.push(c0 + len); return out; };
  const is = axis(rect.c0i, rect.w), js = axis(rect.c0j, rect.h), gw = is.length, gh = js.length;
  const grid = gw * gh, skirt = 2 * (gw + gh) - 4, total = grid + skirt;
  const positions = new Float32Array(total * 3), normals = new Float32Array(total * 3), colors = new Float32Array(total * 3);
  const depth = 3 + 2 * stride, step = hf.cell * stride;
  let minY = Infinity, maxY = -Infinity;
  for (let b = 0; b < gh; b++) for (let a = 0; a < gw; a++) {
    const x = hf.originX + is[a] * hf.cell, z = hf.originZ + js[b] * hf.cell, y = hf.data[js[b] * hf.nx + is[a]], v = (b * gw + a) * 3;
    const n = normalAt(hf, x, z, step), col = terrainColor(hf, x, z, y, n[1]);
    positions[v] = x; positions[v + 1] = y; positions[v + 2] = z; normals[v] = n[0]; normals[v + 1] = n[1]; normals[v + 2] = n[2]; colors[v] = col[0]; colors[v + 1] = col[1]; colors[v + 2] = col[2];
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const indices: number[] = [];
  for (let b = 0; b < gh - 1; b++) for (let a = 0; a < gw - 1; a++) {
    const i0 = b * gw + a, i1 = i0 + 1, i2 = i0 + gw, i3 = i2 + 1;
    indices.push(i0, i2, i1, i1, i2, i3); // sentido antihorario visto desde arriba (+y)
  }
  // Falda: copia de cada vértice del borde, más baja, unida a él.
  const ring: number[] = [];
  for (let a = 0; a < gw; a++) ring.push(a);                       // norte (z mínimo)
  for (let b = 1; b < gh; b++) ring.push(b * gw + gw - 1);         // este
  for (let a = gw - 2; a >= 0; a--) ring.push((gh - 1) * gw + a);  // sur
  for (let b = gh - 2; b >= 1; b--) ring.push(b * gw);             // oeste
  const skirtStart = grid;
  ring.forEach((src, k) => {
    const d = (skirtStart + k) * 3, s = src * 3;
    positions[d] = positions[s]; positions[d + 1] = positions[s + 1] - depth; positions[d + 2] = positions[s + 2];
    normals[d] = normals[s]; normals[d + 1] = normals[s + 1]; normals[d + 2] = normals[s + 2]; colors[d] = colors[s]; colors[d + 1] = colors[s + 1]; colors[d + 2] = colors[s + 2];
  });
  for (let k = 0; k < ring.length; k++) {
    const k2 = (k + 1) % ring.length, a = ring[k], b = ring[k2], a2 = skirtStart + k, b2 = skirtStart + k2;
    indices.push(a, b, a2, b, b2, a2, a, a2, b, b, a2, b2); // doble cara: la falda se ve desde fuera y desde dentro
  }
  minY -= depth;
  const hx = (rect.w * hf.cell) / 2, hz = (rect.h * hf.cell) / 2, cy = (minY + maxY) / 2, hy = (maxY - minY) / 2;
  const IndexArray = total > 65535 ? Uint32Array : Uint16Array;
  const idx = IndexArray.from(indices);
  return {positions, normals, colors, indices: idx, triangles: idx.length / 3, vertices: total, center: [rect.centerX, cy, rect.centerZ], radius: Math.sqrt(hx * hx + hz * hz + hy * hy)};
}

/** Altura sobre el suelo de un punto (m). */
export const groundClearance = (hf: Heightfield, x: number, y: number, z: number): number => y - sampleHeight(hf, x, z);
