import type {TerrainParameters, TerritoryId} from '../model/types.ts';
import {fbm, valueNoise} from './noise.ts';
import {TERRITORIES} from './presets.ts';

export const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };

/** Eje común de cauces V2. La máscara de ribera y el agua visual usan la misma geometría. */
export function channelAxis(seed: number, z: number, width: number): number {
  return Math.max(128, width * 0.22) + (valueNoise(seed + 211, z / 145, 3) - 0.5) * Math.min(105, width * 0.15);
}

/** V2. Conserva una franja de montaje suave en los tres emplazamientos del creador. */
export function baseHeightV2(seed: number, x: number, z: number, sx: number, sz: number, preset: TerritoryId = 'free', params = TERRITORIES[preset].params): number {
  const f = TERRITORIES[preset].shape;
  const {reliefStrength, roughness, baseElevationM, valleyBias}: TerrainParameters = params;
  if (reliefStrength === 0) return baseElevationM;
  const axis = channelAxis(seed, z, sx);
  const offset = preset === 'valle-rio' ? (x - axis) / sx : x / sx + (valueNoise(seed + 12, z / sz * 2, 6) - 0.5) * 0.22;
  const sides = smooth((Math.abs(offset) - (0.09 + valleyBias * 0.1)) / 0.4);
  const broad = fbm(seed, x / f.scale, z / f.scale, 3);
  const detail = fbm(seed + 32, x / 42, z / 48, 3) - 0.5;
  const ridges = 1 - Math.abs(2 * valueNoise(seed + 54, x / 104 + broad * 0.8, z / 162) - 1);
  const drainage = 1 - smooth(Math.abs(x - axis) / (preset === 'valle-rio' ? 24 : 34));
  const fan = (valueNoise(seed + 37, x / 105 + z / 340, z / 240) - 0.5) * f.channel;
  const height = (broad - 0.5) * f.hills + sides * f.shoulders * (0.42 + broad * 0.83) * (0.42 + valleyBias * 0.83)
    + (ridges - 0.35) * f.ridge * (0.18 + 0.82 * sides) + detail * roughness * 13
    + f.incline * (x / sx) - drainage * f.channel + fan;
  const side = Math.max(0, Math.abs(x) - 84);
  const pad = smooth((Math.sqrt(side * side + z * z) - 45) / 95);
  return Math.max(-45, Math.min(470, baseElevationM + height * reliefStrength * pad));
}
