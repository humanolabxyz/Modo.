import {pathSample} from './geometry.ts';
import type {TerrainEdit} from '../model/types.ts';
import type {Heightfield} from './heightfield.ts';
import {channelAxis, smooth} from './generatorV2.ts';
import {riverInfo, riverX, roadDist, roadPoints} from './landmarks.ts';
import {hash2, valueNoise} from './noise.ts';
import {TERRITORIES} from './presets.ts';

export type Color3 = [number, number, number];
type SurfaceContext = Pick<Heightfield, 'seed' | 'sizeX' | 'sizeZ' | 'generatorVersion' | 'presetId' | 'params' | 'surfaceEdits'>;
const surfaceCache=new WeakMap<SurfaceContext,{edits:TerrainEdit[];tiles:Map<string,TerrainEdit[]>}>();
const EMPTY_EDITS:readonly TerrainEdit[]=[];
/** Índice derivado, nunca persistido. Mantiene exactamente el orden de capas. */
function surfaceEditsAt(hf:SurfaceContext,x:number,z:number):readonly TerrainEdit[] {
  const edits=hf.surfaceEdits;if(!edits?.length)return EMPTY_EDITS;
  let cache=surfaceCache.get(hf);
  if(cache?.edits!==edits) {
    const tiles=new Map<string,TerrainEdit[]>();
    for(const e of edits) {
      const xs=e.points?.map(p=>p[0]),zs=e.points?.map(p=>p[1]),margin=e.points?e.width!/2:e.radius;
      const x0=Math.max(-hf.sizeX/2,(xs?Math.min(...xs):e.center[0])-margin),x1=Math.min(hf.sizeX/2,(xs?Math.max(...xs):e.center[0])+margin);
      const z0=Math.max(-hf.sizeZ/2,(zs?Math.min(...zs):e.center[1])-margin),z1=Math.min(hf.sizeZ/2,(zs?Math.max(...zs):e.center[1])+margin);
      for(let j=Math.floor(z0/128);j<=Math.floor(z1/128);j++)for(let i=Math.floor(x0/128);i<=Math.floor(x1/128);i++) {
        const key=`${i}:${j}`,list=tiles.get(key);if(list)list.push(e);else tiles.set(key,[e]);
      }
    }
    cache={edits,tiles};surfaceCache.set(hf,cache);
  }
  return cache.tiles.get(`${Math.floor(x/128)}:${Math.floor(z/128)}`)??EMPTY_EDITS;
}
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: readonly number[], b: readonly number[], t: number): Color3 =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function decorativeFeatures(hf: SurfaceContext) {
  if (hf.generatorVersion === 1) return {water: true, road: true};
  return TERRITORIES[hf.presetId].landscape;
}

export function waterSection(hf: SurfaceContext, z: number) {
  if (hf.generatorVersion === 1) {
    const x = riverX(hf.seed, z);
    return {x, half: riverInfo(hf.seed, x, z).half};
  }
  return {x: channelAxis(hf.seed, z, hf.sizeX), half: 8 + 5 * valueNoise(hf.seed + 313, z / 170, 1)};
}

/** Máscara visual para arbolado y cubierta. No representa humedad de suelo. */
export function greenCover(hf: SurfaceContext, x: number, z: number, ny: number) {
  const patch = valueNoise(hf.seed + 83, x / 145, z / 145);
  const flat = smooth((ny - 0.83) / 0.15);
  if (hf.presetId === 'oasis-norte') {
    const skew = (valueNoise(hf.seed + 134, z / 105, 7) - 0.5) * 86;
    return (1 - smooth((Math.hypot((x + 18 - skew) / (hf.sizeX * 0.19), (z + 25) / (hf.sizeZ * 0.35)) - 0.43) / 0.6)) * (0.6 + patch * 0.4) * flat;
  }
  if (hf.presetId === 'desierto') return patch * flat * 0.24;
  if (hf.presetId === 'valle-rio') {
    const bank = 1 - smooth((Math.abs(x - waterSection(hf, z).x) - 12) / 68);
    return clamp(patch * 0.64 + bank * 0.56) * flat;
  }
  return clamp((patch - 0.27) * 1.38) * flat;
}

const roads = new Map<string, ReturnType<typeof roadPoints>>();

/** Paleta compartida por la malla jugable, el cinturón escénico y el minimapa. */
export function surfaceColor(hf: SurfaceContext, x: number, z: number, y: number, ny: number): Color3 {
  const {surface} = TERRITORIES[hf.presetId];
  const coarse = valueNoise(hf.seed + 57, x / 46, z / 46);
  const fine = valueNoise(hf.seed + 31, x / 9, z / 9);
  const green = greenCover(hf, x, z, ny);
  let color = mix(surface.open, surface.green, green);
  color = mix(color, surface.dry, smooth((coarse - 0.49) / 0.47) * (1 - green) * 0.73);
  // Un mosaico irregular de praderas y suelo seco en las planicies del valle.
  if (hf.presetId === 'valle-rio' || hf.presetId === 'valley') {
    const u = (x + 0.18 * z + (coarse - 0.5) * 35) / 128, v = (z - 0.12 * x) / 154;
    const edge = Math.min(u - Math.floor(u), 1 - (u - Math.floor(u)), v - Math.floor(v), 1 - (v - Math.floor(v)));
    const patch = hash2(hf.seed + 219, Math.floor(u), Math.floor(v));
    color = mix(color, patch > 0.66 ? surface.dry : surface.green, smooth(edge / 0.13) * smooth((ny - 0.98) / 0.02) * 0.48);
  }
  const rock = clamp((0.976 - ny) * 4 + Math.max(0, y - (hf.params?.baseElevationM ?? 20) - 95) / 350);
  color = mix(color, surface.rock, rock);
  const half = Math.min(hf.sizeX, hf.sizeZ) / 2, features = decorativeFeatures(hf);
  if (features.road && x >= -half && x <= 32 && Math.abs(z) < Math.min(180, half)) {
    const key = `${hf.seed}:${half}`;
    let road = roads.get(key);
    if (!road) { road = roadPoints(hf.seed, half); if (roads.size >= 16) roads.clear(); roads.set(key, road); }
    const distance = roadDist(hf.seed, half, x, z, road);
    color = mix(color, [0.59, 0.48, 0.34], clamp((4.5 - distance) / 2.4) * smooth((x + half) / 30) * smooth((ny - 0.9) / 0.08));
  }
  if (features.water) {
    const water = waterSection(hf, z), d = Math.abs(x - water.x);
    color = mix(color, [0.61, 0.56, 0.40], clamp((water.half + 5 - d) / 5));
    color = mix(color, [0.20, 0.36, 0.40], clamp((water.half - d) / 3));
  }
  if(Math.abs(x)<=hf.sizeX/2&&Math.abs(z)<=hf.sizeZ/2)for(const edit of surfaceEditsAt(hf,x,z)) {
    const d=edit.points ? pathSample([x,z],edit.points).distance/(edit.width!/2) : Math.hypot(x-edit.center[0],z-edit.center[1])/edit.radius;
    if(d>=1)continue;
    const palette={grass:[0.31,0.53,0.22],soil:[0.48,0.32,0.20],gravel:[0.52,0.53,0.49],sand:[0.81,0.69,0.48]};
    color=mix(color,palette[edit.kind==='road'?'gravel':edit.material??'soil'],(1-d*d)**2*(edit.kind==='paint'?edit.amount:1));
  }
  const light = 0.91 + 0.18 * fine;
  return [color[0] * light, color[1] * light, color[2] * light];
}

export function terrainColor(hf: SurfaceContext, x: number, z: number, y: number, ny: number): Color3 {
  const [r, g, b] = surfaceColor(hf, x, z, y, ny);
  return [r * r, g * g, b * b];
}
