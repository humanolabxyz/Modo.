// Geometría del terreno por chunks con niveles de detalle (LOD). Puro: devuelve arreglos tipados, la escena los convierte en mallas.
// Cada chunk cubre 50×50 celdas (100 m con celdas de 2 m). La escena usa un
// perímetro compartido entre LOD; el formato sin continuidad conserva sus faldas.
import {terrainColor} from './surface.ts';
import {normalAt, sampleHeight, type Heightfield} from './heightfield.ts';
import {CHUNK_CELLS} from './model.ts';
import {edgeAxis, edgeStride} from './exterior.ts';

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

export function buildChunk(hf: Heightfield, cx: number, cz: number, lod: number, continuousEdge = false): ChunkData {
  const rect = chunkRect(hf, cx, cz), stride = LOD_STRIDES[Math.min(lod, LOD_STRIDES.length - 1)];
  if (continuousEdge && rect.w >= 2 && rect.h >= 2) return stitchedChunk(hf, rect, stride);
  const borderX = continuousEdge && (cx === 0 || rect.c0i + rect.w === hf.nx - 1);
  const borderZ = continuousEdge && (cz === 0 || rect.c0j + rect.h === hf.nz - 1);
  const is = edgeAxis(rect.c0i, rect.w, borderZ ? edgeStride(hf) : stride), js = edgeAxis(rect.c0j, rect.h, borderX ? edgeStride(hf) : stride), gw = is.length, gh = js.length;
  const grid = gw * gh, skirt = 2 * (gw + gh) - 4, total = grid + skirt;
  const positions = new Float32Array(total * 3), normals = new Float32Array(total * 3), colors = new Float32Array(total * 3);
  const depth = 3 + 2 * stride, step = hf.cell * stride;
  let minY = Infinity, maxY = -Infinity;
  for (let b = 0; b < gh; b++) for (let a = 0; a < gw; a++) {
    const x = hf.originX + is[a] * hf.cell, z = hf.originZ + js[b] * hf.cell, y = hf.data[js[b] * hf.nx + is[a]], v = (b * gw + a) * 3;
    const atEdge = continuousEdge && (is[a] === 0 || is[a] === hf.nx - 1 || js[b] === 0 || js[b] === hf.nz - 1);
    // Luz y cubierta usan la misma derivada en todos los LOD: el salto de malla
    // no debe cambiar la paleta ni producir rectángulos de sombreado.
    const n = normalAt(hf, x, z, continuousEdge || atEdge ? hf.cell : step), col = terrainColor(hf, x, z, y, n[1]);
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

/** Una sola hilera densa compartida por todos los chunks. El interior conserva
 * su LOD; las tiras de transición unen sus nodos con el perímetro sin grietas,
 * sin faldas visibles y sin forzar el chunk completo a máxima resolución. */
function stitchedChunk(hf: Heightfield, rect: ChunkRect, requestedStride: number): ChunkData {
  const stride = Math.min(requestedStride, Math.max(1, Math.floor(Math.min(rect.w, rect.h) / 2)));
  const xs = edgeAxis(rect.c0i, rect.w, stride).slice(1, -1), zs = edgeAxis(rect.c0j, rect.h, stride).slice(1, -1);
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], indices: number[] = [];
  let minY = Infinity, maxY = -Infinity;
  const vertex = (i: number, j: number) => {
    const x = hf.originX + i * hf.cell, z = hf.originZ + j * hf.cell, y = hf.data[j * hf.nx + i];
    const n = normalAt(hf, x, z), index = positions.length / 3;
    positions.push(x, y, z); normals.push(...n); colors.push(...terrainColor(hf, x, z, y, n[1]));
    minY = Math.min(minY, y); maxY = Math.max(maxY, y); return index;
  };
  const grid = zs.map(j => xs.map(i => vertex(i, j)));
  for (let b = 0; b < zs.length - 1; b++) for (let a = 0; a < xs.length - 1; a++) {
    indices.push(grid[b][a], grid[b + 1][a], grid[b][a + 1], grid[b][a + 1], grid[b + 1][a], grid[b + 1][a + 1]);
  }
  const x1 = rect.c0i + rect.w, z1 = rect.c0j + rect.h, lastX = xs.length - 1, lastZ = zs.length - 1;
  const edgeX = edgeAxis(rect.c0i, rect.w, edgeStride(hf)), edgeZ = edgeAxis(rect.c0j, rect.h, edgeStride(hf));
  type Knot = {k: number; index: number};
  const inner: Knot[][] = [
    xs.map((i, a) => ({k: i - rect.c0i, index: grid[0][a]})),
    zs.map((j, b) => ({k: j - rect.c0j, index: grid[b][lastX]})),
    xs.map((i, a) => ({k: x1 - i, index: grid[lastZ][a]})).reverse(),
    zs.map((j, b) => ({k: z1 - j, index: grid[b][0]})).reverse(),
  ];
  const outer: Knot[][] = [
    edgeX.map(i => ({k: i - rect.c0i, index: vertex(i, rect.c0j)})),
    edgeZ.map(j => ({k: j - rect.c0j, index: vertex(x1, j)})),
    edgeX.slice().reverse().map(i => ({k: x1 - i, index: vertex(i, z1)})),
    edgeZ.slice().reverse().map(j => ({k: z1 - j, index: vertex(rect.c0i, j)})),
  ];
  for (let side = 0; side < 4; side++) {
    const inside = inner[side], outside = outer[side]; let a = 0, b = 0;
    while (a < inside.length - 1 || b < outside.length - 1) {
      if ((inside[a + 1]?.k ?? Infinity) <= (outside[b + 1]?.k ?? Infinity)) {
        indices.push(inside[a].index, inside[a + 1].index, outside[b].index); a++;
      } else {
        indices.push(inside[a].index, outside[b + 1].index, outside[b].index); b++;
      }
    }
  }
  const cy = (minY + maxY) / 2, hy = (maxY - minY) / 2;
  const IndexArray = positions.length / 3 > 65535 ? Uint32Array : Uint16Array;
  return {positions: Float32Array.from(positions), normals: Float32Array.from(normals), colors: Float32Array.from(colors), indices: IndexArray.from(indices),
    triangles: indices.length / 3, vertices: positions.length / 3, center: [rect.centerX, cy, rect.centerZ],
    radius: Math.hypot(rect.w * hf.cell / 2, rect.h * hf.cell / 2, hy)};
}

/** Altura sobre el suelo de un punto (m). */
export const groundClearance = (hf: Heightfield, x: number, y: number, z: number): number => y - sampleHeight(hf, x, z);
