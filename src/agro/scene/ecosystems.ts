// Ecosistemas decorativos (Etapa 6): en vez de árboles sueltos al azar, agrupaciones con intención según la humedad y la pendiente del terreno.
// Oasis nortino: palmares y huertos cítricos donde hay verdor, con matorral bajo las copas; cactales en las laderas secas. Desierto: cactales y matorral ralo.
// Determinista (semilla del terreno) y solo imagen: no entra en el mundo guardado ni en la simulación. Puro: sin three ni React.
import {hash2} from '../terrain/noise.ts';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import {greenCover, decorativeFeatures, waterSection} from '../terrain/surface.ts';
import {roadDist, roadPoints} from '../terrain/landmarks.ts';
import type {WorldSession} from '../world/session.ts';
import type {TerritoryId} from '../model/types.ts';
import type {GlbItem} from './GlbModels.tsx';

type Kind = {name: string; species: readonly string[]; under?: readonly string[]; wet: [number, number]; maxSlope: number; centers: number; radius: [number, number]; count: [number, number]; spacing: number; scale: [number, number]};
const OASIS: readonly Kind[] = [
  {name: 'palmar', species: ['veg-palma-a', 'veg-palma-b'], under: ['veg-arbusto-a', 'veg-arbusto-b'], wet: [0.42, 1], maxSlope: 12, centers: 9, radius: [10, 18], count: [5, 9], spacing: 4.5, scale: [0.85, 1.25]},
  {name: 'huerto cítrico', species: ['veg-citrico-a', 'veg-citrico-b'], wet: [0.5, 1], maxSlope: 8, centers: 6, radius: [9, 14], count: [5, 8], spacing: 6.2, scale: [0.9, 1.15]},
  {name: 'matorral ribereño', species: ['veg-arbusto-a', 'veg-arbusto-b'], wet: [0.3, 0.8], maxSlope: 16, centers: 9, radius: [8, 15], count: [6, 11], spacing: 2.6, scale: [0.8, 1.3]},
  {name: 'cactal de ladera', species: ['veg-cactus-a', 'veg-cactus-b'], under: ['veg-arbusto-b'], wet: [0, 0.3], maxSlope: 30, centers: 11, radius: [10, 20], count: [5, 9], spacing: 4, scale: [0.8, 1.35]},
];
const DESERT: readonly Kind[] = [
  {name: 'cactal', species: ['veg-cactus-a', 'veg-cactus-b'], under: ['veg-arbusto-b'], wet: [0, 0.6], maxSlope: 22, centers: 12, radius: [12, 24], count: [4, 9], spacing: 6, scale: [0.8, 1.4]},
  {name: 'matorral ralo', species: ['veg-arbusto-a', 'veg-arbusto-b'], wet: [0, 0.7], maxSlope: 20, centers: 8, radius: [10, 20], count: [4, 8], spacing: 5, scale: [0.75, 1.15]},
];
const CITRUS: Kind = {name: 'huerto cítrico', species: ['veg-citrico-a', 'veg-citrico-b'], wet: [0.45, 1], maxSlope: 8, centers: 6, radius: [9, 15], count: [5, 8], spacing: 6.2, scale: [0.9, 1.15]};
const THICKET: Kind = {name: 'matorral', species: ['veg-arbusto-a', 'veg-arbusto-b'], wet: [0.25, 1], maxSlope: 18, centers: 10, radius: [8, 16], count: [6, 11], spacing: 2.6, scale: [0.8, 1.3]};
const PINAR: Kind = {name: 'pinar', species: ['veg-pino-a', 'veg-pino-b'], under: ['veg-arbusto-a'], wet: [0.2, 1], maxSlope: 28, centers: 9, radius: [14, 26], count: [7, 12], spacing: 5, scale: [0.85, 1.3]};
const QUISCAL: Kind = {name: 'quiscal de ladera seca', species: ['veg-cactus-a', 'veg-cactus-b'], under: ['veg-arbusto-b'], wet: [0, 0.3], maxSlope: 32, centers: 10, radius: [10, 18], count: [5, 10], spacing: 4.5, scale: [0.8, 1.3]};
export const ECOSYSTEMS: Partial<Record<TerritoryId, readonly Kind[]>> = {
  'oasis-norte': OASIS, desierto: DESERT,
  free: [THICKET, {...CITRUS, centers: 5}],
  valley: [CITRUS, {...THICKET, name: 'matorral de acequia'}, {...PINAR, name: 'bosquete de pinos', centers: 5, wet: [0.3, 1], maxSlope: 14}],
  ladera: [PINAR, THICKET, QUISCAL],
  'valle-rio': [{...THICKET, name: 'matorral ribereño', centers: 18}, CITRUS, {...PINAR, name: 'pinar de ribera', centers: 6, maxSlope: 16}],
};

/** Modelos que necesita un territorio (para precargarlos). */
export const ecosystemModelIds = (territory: TerritoryId): string[] => [...new Set((ECOSYSTEMS[territory] ?? []).flatMap(k => [...k.species, ...(k.under ?? [])]))];

export type Placed = Record<string, GlbItem[]>;

export function ecosystemPlacements(session: WorldSession, ready: ReadonlySet<string>, keep: readonly {x: number; z: number; r: number}[]): Placed {
  const hf = session.terrain.hf, kinds = ECOSYSTEMS[hf.presetId], out: Placed = {};
  if (!kinds) return out;
  const seed = hf.seed, [sx, sz] = session.site, half = Math.min(hf.sizeX, hf.sizeZ) / 2 - 14, features = decorativeFeatures(hf), road = roadPoints(seed, half);
  const free = (x: number, z: number, slope: number, maxSlope: number) => {
    if (slope > maxSlope || Math.hypot(x - sx, z - sz) < 22 || keep.some(p => Math.hypot(p.x - x, p.z - z) < p.r)) return false;
    if (features.road && roadDist(seed, half, x, z, road) < 6) return false;
    if (features.water) { const river = waterSection(hf, z); if (Math.abs(x - river.x) < river.half + 3) return false; }
    return true;
  };
  const add = (id: string, x: number, z: number, scale: number, k: number) => {
    if (!ready.has(id)) return;
    (out[id] ??= []).push({x, y: sampleHeight(hf, x, z), z, yaw: hash2(seed + 910, k, 1) * Math.PI * 2, s: scale});
  };
  kinds.forEach((kind, ki) => {
    const base = 1000 * (ki + 1);
    let placed = 0;
    for (let t = 0; t < 700 && placed < kind.centers; t++) {
      // Los centros se reparten en torno al sitio y por todo el mapa jugable, con preferencia por la zona húmeda o seca que le corresponde.
      const wide = t % 3 === 0, reach = wide ? half : Math.min(half, 260);
      const cx = Math.max(-half, Math.min(half, sx + (hash2(seed + 920 + ki, t, 1) * 2 - 1) * reach)), cz = Math.max(-half, Math.min(half, sz + (hash2(seed + 930 + ki, t, 2) * 2 - 1) * reach));
      const slope = slopeDegrees(hf, cx, cz), wet = greenCover(hf, cx, cz, Math.cos(slope * Math.PI / 180));
      if (wet < kind.wet[0] || wet > kind.wet[1] || !free(cx, cz, slope, kind.maxSlope)) continue;
      placed++;
      const radius = kind.radius[0] + hash2(seed + 940 + ki, t, 3) * (kind.radius[1] - kind.radius[0]);
      const n = Math.round(kind.count[0] + hash2(seed + 950 + ki, t, 4) * (kind.count[1] - kind.count[0])), spots: [number, number][] = [];
      for (let i = 0; i < n * 3 && spots.length < n; i++) {
        // Más densidad en el centro; la separación mínima evita copas encimadas.
        const a = hash2(seed + 960 + ki, base + t * 40 + i, 5) * Math.PI * 2, d = radius * Math.pow(hash2(seed + 970 + ki, base + t * 40 + i, 6), 0.7);
        const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
        if (spots.some(([px, pz]) => Math.hypot(px - x, pz - z) < kind.spacing)) continue;
        const sl = slopeDegrees(hf, x, z);
        if (!free(x, z, sl, kind.maxSlope + 4)) continue;
        spots.push([x, z]);
        const pick = hash2(seed + 980 + ki, base + t * 40 + i, 7), sc = kind.scale[0] + hash2(seed + 990 + ki, base + t * 40 + i, 8) * (kind.scale[1] - kind.scale[0]);
        add(kind.species[Math.floor(pick * kind.species.length) % kind.species.length], x, z, sc, base + t * 40 + i);
        // Sotobosque: matorral bajo y entre las plantas grandes.
        if (kind.under && hash2(seed + 995 + ki, base + t * 40 + i, 9) < 0.55) {
          const ux = x + (hash2(seed + 996, base + t * 40 + i, 10) - 0.5) * 5, uz = z + (hash2(seed + 997, base + t * 40 + i, 11) - 0.5) * 5;
          if (free(ux, uz, slopeDegrees(hf, ux, uz), kind.maxSlope + 6)) add(kind.under[Math.floor(hash2(seed + 998, base + t * 40 + i, 12) * kind.under.length) % kind.under.length], ux, uz, 0.8 + hash2(seed + 999, base + t * 40 + i, 13) * 0.5, base + t * 40 + i + 7);
        }
      }
    }
  });
  return out;
}
