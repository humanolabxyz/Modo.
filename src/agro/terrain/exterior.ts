import {smooth} from './generatorV2.ts';
import {normalAt, sampleHeight, type Heightfield} from './heightfield.ts';
import {generatorFor} from './generators.ts';
import {fbm, valueNoise} from './noise.ts';
import {TERRITORIES} from './presets.ts';
import {terrainColor} from './surface.ts';

export function edgeStride(hf: Heightfield): number {
  return Math.max(1, Math.ceil(Math.max(hf.nx - 1, hf.nz - 1) / 650));
}

/** Eje compartido de los chunks exteriores y la primera hilera del paisaje. */
export function edgeAxis(start: number, length: number, stride: number): number[] {
  const out = [];
  for (let k = 0; k < length; k += stride) out.push(start + k);
  out.push(start + length);
  return out;
}

function extent(hf: Heightfield) {
  return {halfX: (hf.nx - 1) * hf.cell / 2, halfZ: (hf.nz - 1) * hf.cell / 2,
    cx: hf.originX + (hf.nx - 1) * hf.cell / 2, cz: hf.originZ + (hf.nz - 1) * hf.cell / 2};
}

/** Solo se usa para render y altura de cámara. Jamás entra en el heightfield editable. */
export function sceneryHeight(hf: Heightfield, x: number, z: number): number {
  const {cx, cz, halfX, halfZ} = extent(hf), dx = x - cx, dz = z - cz;
  const ratio = Math.max(Math.abs(dx) / halfX, Math.abs(dz) / halfZ);
  if (ratio <= 1) return sampleHeight(hf, x, z);
  const bx = cx + dx / ratio, bz = cz + dz / ratio, d = Math.hypot(x - bx, z - bz);
  const p = TERRITORIES[hf.presetId].landscape;
  const broad = valueNoise(hf.seed + 559, x / 1250, z / 1620);
  const weight = smooth((d - 115 + (broad - 0.5) * 130) / 690);
  let near = 0;
  if (weight < 1) {
    const generate = generatorFor(hf.generatorVersion);
    const base = (px: number, pz: number) => generate(hf.seed, px, pz, hf.sizeX, hf.sizeZ, hf.presetId, hf.params);
    const delta = sampleHeight(hf, bx, bz) - base(bx, bz);
    near = base(x, z) + delta * (1 - smooth(d / 105));
    if (weight === 0) return near;
  }
  const hills = fbm(hf.seed + 711, x / 390, z / 460, 4);
  const ridge = fbm(hf.seed + 221, x / 620 + hills * 0.4, z / 780, 4);
  const peaks = smooth((ridge + broad * 0.36 - 0.42) / 0.48);
  const far = (hf.params?.baseElevationM ?? 20) + (hills - 0.36) * p.hills
    + peaks * p.horizon * smooth((d - 230) / 1150) * (0.42 + 0.58 * broad);
  return near * (1 - weight) + far * weight;
}

function sceneryNormal(hf: Heightfield, x: number, z: number, atSeam: boolean): [number, number, number] {
  if (atSeam) return normalAt(hf, x, z);
  const d = hf.cell;
  const gx = (sceneryHeight(hf, x + d, z) - sceneryHeight(hf, x - d, z)) / (2 * d);
  const gz = (sceneryHeight(hf, x, z + d) - sceneryHeight(hf, x, z - d)) / (2 * d);
  const n = Math.hypot(1, gx, gz);
  return [-gx / n, 1 / n, -gz / n];
}

const NEAR_RINGS = [
  [0, 1], [9, 1], [21, 2], [39, 3], [63, 4], [96, 5], [140, 6], [190, 7],
  [245, 8], [305, 9], [370, 10], [450, 12], [550, 13], [675, 14], [820, 15],
];

/** El espaciamiento crece gradualmente con la distancia; evita los grandes
 * triángulos radiales que recortaban las siluetas de las montañas lejanas. */
function exteriorRings(hf: Heightfield): number[][] {
  const rings = [...NEAR_RINGS];
  const half = Math.min(hf.sizeX, hf.sizeZ) / 2;
  let d = 820;
  while (d < 10500) {
    d = Math.min(10500, d + Math.max(65, d * 0.065));
    const spacing = Math.max(28, d * 0.05);
    rings.push([d, Math.max(1, Math.floor(spacing / (hf.cell * (1 + d / half))))]);
  }
  return rings;
}

/** Cinturón y horizonte de una sola malla con densidad decreciente. La hilera cero coincide con los chunks. */
export function buildExterior(hf: Heightfield, chunkCells: number) {
  const {cx, cz} = extent(hf);
  const xs = [], zs = [];
  for (let i = 0; i < hf.nx - 1; i += chunkCells) xs.push(...edgeAxis(i, Math.min(chunkCells, hf.nx - 1 - i), edgeStride(hf)).slice(0, -1));
  for (let j = 0; j < hf.nz - 1; j += chunkCells) zs.push(...edgeAxis(j, Math.min(chunkCells, hf.nz - 1 - j), edgeStride(hf)).slice(0, -1));
  xs.push(hf.nx - 1); zs.push(hf.nz - 1);
  const maxX = hf.nx - 1, maxZ = hf.nz - 1;
  const sides = [xs.map(i => [i, 0]), zs.map(j => [maxX, j]), xs.slice().reverse().map(i => [i, maxZ]), zs.slice().reverse().map(j => [0, j])];
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], indices: number[] = [];
  const rings = exteriorRings(hf);
  for (const side of sides) {
    let previous: {k: number; index: number}[] = [];
    rings.forEach(([d, step], row) => {
      const current: typeof previous = [];
      for (const k of edgeAxis(0, side.length - 1, step)) {
        const [i, j] = side[k], bx = hf.originX + i * hf.cell, bz = hf.originZ + j * hf.cell;
        const length = Math.hypot(bx - cx, bz - cz), factor = d / length;
        const x = bx + (bx - cx) * factor, z = bz + (bz - cz) * factor;
        const y = d ? sceneryHeight(hf, x, z) : hf.data[j * hf.nx + i];
        const normal = sceneryNormal(hf, x, z, d === 0);
        current.push({k, index: positions.length / 3}); positions.push(x, y, z);
        normals.push(...normal); colors.push(...terrainColor(hf, x, z, y, normal[1]));
      }
      if (row) {
        let a = 0, b = 0;
        while (a < previous.length - 1 || b < current.length - 1) {
          if ((previous[a + 1]?.k ?? Infinity) <= (current[b + 1]?.k ?? Infinity)) {
            indices.push(previous[a].index, previous[a + 1].index, current[b].index); a++;
          } else {
            indices.push(previous[a].index, current[b + 1].index, current[b].index); b++;
          }
        }
      }
      previous = current;
    });
  }
  return {positions: Float32Array.from(positions), normals: Float32Array.from(normals), colors: Float32Array.from(colors), indices: Uint32Array.from(indices)};
}
