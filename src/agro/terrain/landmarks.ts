// Accidentes decorativos del paisaje (Fase 5d, arte 3D): un río y un camino de tierra que llega a la finca. Puro y determinista (depende solo de la semilla).
// Son solo imagen: el relieve no se excava ni el río lleva agua simulada; no entran en el archivo del mundo ni en la suma de comprobación del terreno.
import {hash2} from './noise.ts';

export type Pt = {x: number; z: number};
const RIVER_STEP = 10;

/** Posición x del eje del río en la altura z: serpentea hacia el este de la finca, lejos de la zona de trabajo (|x| < 110). */
export function riverX(seed: number, z: number): number {
  const a = 18 + hash2(seed + 11, 1, 1) * 10, ph = hash2(seed + 12, 2, 2) * 6.28;
  return 190 + 46 * Math.sin(z / 120 + ph) + 20 * Math.sin(z / 47 + ph * 1.7) + a * Math.sin(z / 260);
}
/** Ancho del río (m) en z. */
export const riverWidth = (seed: number, z: number): number => 7 + 3 * Math.sin(z / 90 + seed);

/** Distancia horizontal aproximada al eje del río y su ancho. */
export function riverInfo(seed: number, x: number, z: number): {dist: number; half: number} {
  return {dist: Math.abs(x - riverX(seed, z)) * 0.9, half: riverWidth(seed, z) / 2};
}

/** Puntos del eje del río para dibujar la cinta de agua. */
export function riverPoints(seed: number, zMin: number, zMax: number): Pt[] {
  const out: Pt[] = []; for (let z = zMin; z <= zMax; z += RIVER_STEP) out.push({x: riverX(seed, z), z}); return out;
}

/** Eje del camino de tierra: nace en el borde oeste, serpentea y llega a la finca por el sur-oeste, sin cruzar el río. */
export function roadPoints(seed: number, half: number): Pt[] {
  const out: Pt[] = [], ph = hash2(seed + 21, 3, 3) * 6.28, endX = 24, endZ = 30;
  for (let i = 0; i <= 40; i++) { const t = i / 40, x = -half + (endX + half) * t, z = endZ + (1 - t) * (60 * Math.sin(t * 5 + ph) + 90 * (1 - t)) + 14 * (1 - t) * Math.sin(t * 17 + ph); out.push({x, z}); }
  return out;
}

/** Distancia (m) de un punto al camino. */
export function roadDist(seed: number, half: number, x: number, z: number, road = roadPoints(seed, half)): number {
  let best = Infinity;
  for (let i = 0; i < road.length - 1; i++) {
    const a = road[i], b = road[i + 1], dx = b.x - a.x, dz = b.z - a.z, len2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / len2));
    best = Math.min(best, Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t)));
  }
  return best;
}
