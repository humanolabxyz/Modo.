import type {Heightfield} from './heightfield.ts';

export function playablePoint(hf: Heightfield, x: number, z: number, margin = 0): [number, number] {
  const dx = Math.min(margin, hf.sizeX / 2), dz = Math.min(margin, hf.sizeZ / 2);
  return [Math.max(hf.originX + dx, Math.min(hf.originX + hf.sizeX - dx, x)),
    Math.max(hf.originZ + dz, Math.min(hf.originZ + hf.sizeZ - dz, z))];
}

/** Distancia que deja sitio para todo el mapa en la vista estratégica, también en vertical. */
export function cameraDistances(hf: Heightfield, aspect: number) {
  const tan = Math.tan(25 * Math.PI / 180);
  const overview = Math.max(hf.sizeX / (2 * tan * Math.max(0.18, aspect)), hf.sizeZ / (2 * tan)) * 1.22 + 65;
  return {overview, orbit: Math.max(310, Math.hypot(hf.sizeX, hf.sizeZ) * 0.65)};
}
