// Normalización de escala y pivote (pura). Entrada: caja del modelo tal como sale del GLB. Salida: escala uniforme y desplazamiento
// para que el modelo quede con el origen en el centro de la huella y la base sobre el suelo (y = 0).
import type {ModelFit} from './types.ts';

type V3 = readonly [number, number, number];
export type Normalization = {scale: number; offset: V3; size: V3};

export function normalizeBounds(min: V3, max: V3, fit: ModelFit): Normalization {
  const raw: V3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const tiny = 1e-6;
  const scale = fit.mode === 'scale' ? fit.scale
    : fit.mode === 'height' ? fit.meters / Math.max(raw[1], tiny)
    : Math.min(fit.size[0] / Math.max(raw[0], tiny), fit.size[1] / Math.max(raw[1], tiny), fit.size[2] / Math.max(raw[2], tiny));
  const cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2;
  return {scale, offset: [-cx * scale, -min[1] * scale, -cz * scale], size: [raw[0] * scale, raw[1] * scale, raw[2] * scale]};
}

/** Elige una variante de forma determinista (mismo mundo → mismos modelos). `t` en [0, 1). */
export function pickVariant<T>(items: readonly T[], t: number): T { return items[Math.min(items.length - 1, Math.floor(t * items.length))]; }
