import {insidePolygon} from '../terrain/geometry.ts';
import {parcelWorldPolygon} from '../world/parcelGeometry.ts';
import {parcelArea} from '../world/parcelGeometry.ts';
// Del aspersor a la parcela (Fase 4). Puro. Cada aspersor moja un círculo de radio `radioM`; el agua que cae dentro de una parcela se le suma.
// Modelo agregado: dentro de la parcela el agua se reparte de forma uniforme. Pero la INTENSIDAD LOCAL (caudal / área del círculo) sí se compara con lo que el suelo
// puede infiltrar: un aspersor potente sobre arcilla escurre aunque la parcela entera reciba poco.
import type {Entity} from '../model/types.ts';
import {itemById, sizeOf} from '../catalog/items.ts';
import {soilById} from './soil.ts';

export const DEFAULT_RADIUS_M = 8;
const SAMPLES = 160;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const cache = new Map<string, number>();
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Fracción (0–1) del círculo de riego de `emitter` que cae dentro del rectángulo de `parcel`. Muestreo en espiral de girasol: determinista. */
export function coverageShare(emitter: Entity, parcel: Entity): number {
  const R = num(emitter.params.radioM, DEFAULT_RADIUS_M), [ex, , ez] = emitter.pose.position, [px, , pz] = parcel.pose.position, yaw = num(parcel.pose.rotation[1], 0);
  const [w, , d] = sizeOf(itemById('parcela')!, parcel.params), key = `${ex.toFixed(2)},${ez.toFixed(2)},${R}|${px.toFixed(2)},${pz.toFixed(2)},${yaw.toFixed(4)},${w},${d}|${JSON.stringify(parcel.parcelPolygon??null)}`;
  const hit = cache.get(key); if (hit !== undefined) return hit;
  // Descarte rápido: el círculo no alcanza ni el círculo que circunscribe al rectángulo.
  let share: number;
  if (Math.hypot(ex - px, ez - pz) > R + Math.hypot(w, d) / 2) share = 0;
  else {
    const c = Math.cos(yaw), s = Math.sin(yaw), polygon=parcel.parcelPolygon?parcelWorldPolygon(parcel):null; let inside = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const r = R * Math.sqrt((i + 0.5) / SAMPLES), a = i * GOLDEN, x = ex + r * Math.cos(a), z = ez + r * Math.sin(a), dx = x - px, dz = z - pz, lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (polygon?insidePolygon([x,z],polygon):Math.abs(lx) <= w / 2 && Math.abs(lz) <= d / 2) inside++;
    }
    share = inside / SAMPLES;
  }
  if (cache.size > 4000) cache.clear();
  cache.set(key, share); return share;
}

export type ParcelIrrigation = {
  /** L/min que llegan a la parcela. */
  lmin: number;
  /** mm/h promedio sobre la parcela. */
  rateMmH: number;
  /** Fracción del riego que escurre por superar la infiltración del suelo, 0–1. */
  runoffFraction: number;
};

/** Riego que recibe cada parcela, dado el caudal de cada aspersor (L/min por id de aspersor). */
export function irrigationByParcel(entities: readonly Entity[], emitterFlowsLmin: Readonly<Record<string, number>>): Record<string, ParcelIrrigation> {
  const out: Record<string, ParcelIrrigation> = {};
  const emitters = entities.filter(e => e.type === 'emisor' && (emitterFlowsLmin[e.id] ?? 0) > 1e-9);
  if (!emitters.length) return out;
  for (const p of entities) {
    if (p.type !== 'parcela') continue;
    const area = Math.max(1, parcelArea(p)), cap = soilById(p.state.suelo).infMmH;
    let lmin = 0, lost = 0;
    for (const e of emitters) {
      const q = emitterFlowsLmin[e.id], share = coverageShare(e, p); if (share <= 0) continue;
      const R = num(e.params.radioM, DEFAULT_RADIUS_M), local = (q * 60) / (Math.PI * R * R);   // L/min · 60 / m² = mm/h
      lmin += q * share; lost += q * share * Math.max(0, 1 - cap / local);
    }
    if (lmin > 0) out[p.id] = {lmin, rateMmH: (lmin * 60) / area, runoffFraction: lost / lmin};
  }
  return out;
}
