// Picking analítico contra la malla de alturas: no usa raycast de mallas (mucho más barato con 100 ha).
import {sampleHeight, type Heightfield} from './heightfield.ts';

export type Hit = {x: number; y: number; z: number; distance: number};

/** Rayo (origen y dirección unitaria) contra el terreno. Marcha con paso adaptativo y afina el cruce por bisección. `null` si no lo toca. */
export function raycastHeightfield(hf: Heightfield, origin: readonly [number, number, number], dir: readonly [number, number, number], maxDistance = 6000): Hit | null {
  const above = (t: number): number => origin[1] + dir[1] * t - sampleHeight(hf, origin[0] + dir[0] * t, origin[2] + dir[2] * t);
  let tPrev = 0;
  if (above(0) < 0) return null; // el origen está bajo el suelo
  for (let t = hf.cell * 0.5; t <= maxDistance; t += Math.min(hf.cell, Math.max(hf.cell * 0.5, t * 0.005))) {
    if (above(t) < 0) {
      let lo = tPrev, hi = t;
      for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (above(mid) < 0) hi = mid; else lo = mid; }
      const d = (lo + hi) / 2, x = origin[0] + dir[0] * d, z = origin[2] + dir[2] * d;
      if (x < hf.originX || x > hf.originX + hf.sizeX || z < hf.originZ || z > hf.originZ + hf.sizeZ) return null; // cruza fuera del mapa
      return {x, y: sampleHeight(hf, x, z), z, distance: d};
    }
    tPrev = t;
  }
  return null;
}
