// Ruido determinista para el terreno base. Solo usa +, −, ×, Math.floor y Math.imul (operaciones exactas en IEEE-754):
// la misma semilla produce el mismo relieve en cualquier navegador. Sin Math.random, sin sin/cos/exp.

/** Hash entero de una celda del retículo → [0, 1). */
export function hash2(seed: number, ix: number, iz: number): number {
  let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iz | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Generador pseudoaleatorio con semilla (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

/** Ruido de valor 2D suave → [0, 1). */
export function valueNoise(seed: number, x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const a = hash2(seed, ix, iz), b = hash2(seed, ix + 1, iz), c = hash2(seed, ix, iz + 1), d = hash2(seed, ix + 1, iz + 1);
  const u = smooth(fx), v = smooth(fz);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Ruido fractal: suma de octavas con lacunaridad 2 y ganancia 0,5, normalizado a [0, 1). */
export function fbm(seed: number, x: number, z: number, octaves = 5): number {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(seed + i * 101, x * f + i * 17.31, z * f - i * 9.7);
    norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
}
