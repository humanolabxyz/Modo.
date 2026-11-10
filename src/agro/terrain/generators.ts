// Generadores de relieve base de Agro, VERSIONADOS. Puro (sin three ni React).
// REGLA DE ORO: una versión publicada de un generador NUNCA se modifica. Un mundo guardado se regenera desde `seed` + `generatorVersion` y sobre esa base se reaplican
// sus ediciones (deltas, algunas con cota absoluta): si el algoritmo cambiara, los mundos existentes cambiarían. Todo cambio de algoritmo es una versión nueva.
// La versión 1 es el generador original de la Fase 6 (Valle central y Mundo libre), movido aquí sin tocar una sola operación (Etapa 1 de la consolidación 3D).
import {fbm} from './noise.ts';
import {baseHeightV2} from './generatorV2.ts';
import type {TerrainParameters, TerritoryId} from '../model/types.ts';

/** Semilla fija del territorio «Valle central» (escenario didáctico reproducible de la Fase 6). */
export const VALLEY_SEED = 31;

export type BaseHeightFn = (seed: number, x: number, z: number, sx: number, sz: number, preset?: TerritoryId, params?: TerrainParameters) => number;

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
const smooth01 = (t: number): number => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };

/** Relieve base en un punto: colinas, una ladera que sube hacia el este, cordón montañoso y una meseta llana en el centro (la zona de la finca). */
function rawHeight(seed: number, x: number, z: number, sx: number, sz: number): number {
  const u = x / sx;
  const hills = (fbm(seed, x / 280 + 3.1, z / 280 - 7.7, 5) - 0.5) * 46;
  const rise = smooth01((u - 0.05) / 0.45);
  const mountains = rise * rise * (40 + 90 * fbm(seed + 13, x / 330, z / 330, 4));
  const tilt = 10 * (u + 0.5);
  return hills + mountains + tilt;
}

/** GENERADOR V1 — CONGELADO. No editar. */
export function baseHeightV1(seed: number, x: number, z: number, sx: number, sz: number): number {
  const h = rawHeight(seed, x, z, sx, sz), h0 = rawHeight(seed, 0, 0, sx, sz);
  const d = Math.sqrt(x * x + z * z);
  const w = 0.95 * (1 - smooth01((d - 100) / 170));
  const detail = (fbm(seed + 7, x / 18, z / 18, 3) - 0.5) * 1.2;
  return h * (1 - w) + h0 * w - h0 + 20 + detail * (1 - 0.7 * w);
}

/** Registro de generadores por versión. Una versión que no está aquí no se puede abrir. */
export const GENERATORS: Readonly<Record<number, BaseHeightFn>> = Object.freeze({1: baseHeightV1, 2: baseHeightV2});
/** Versiones que esta aplicación sabe generar. */
export const GENERATOR_VERSIONS: readonly number[] = Object.freeze(Object.keys(GENERATORS).map(Number).sort((a, b) => a - b));
/** Generador con el que se crean los mundos nuevos mientras no haya otro aprobado. */
export const DEFAULT_GENERATOR_VERSION = 1;

export function generatorFor(version: number): BaseHeightFn {
  const fn = typeof version === 'number' && Number.isInteger(version) && Object.hasOwn(GENERATORS, version) ? GENERATORS[version] : undefined;   // «1» (texto) no es la versión 1
  if (!fn) throw new Error(`Generador de terreno desconocido (versión ${version}). Esta aplicación conoce: ${GENERATOR_VERSIONS.join(', ')}.`);
  return fn;
}
