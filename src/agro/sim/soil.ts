// Suelo y cultivo de una parcela (Fase 4). Puro. Balance hídrico de un solo estrato de 0,5 m ("balance de cubeta", estilo FAO-56):
//   Δ agua = riego + lluvia − escorrentía − evapotranspiración real − drenaje profundo      (todo en mm = L/m²)
// El estado vive en `entity.state` de la parcela, con las claves de `PARCEL_STATE`. Todas las cantidades acumuladas están en mm.
//
// Simplificaciones declaradas (la interfaz las repite): una sola capa de profundidad fija; reparto uniforme del agua en la parcela;
// sin sales, nutrientes, plagas ni heladas; el estrés hídrico es la única causa de pérdida de rendimiento.
import type {PropValue} from '../model/types.ts';
import {DAY} from './clock.ts';
import {cropById, kcAt, stageAt, type Crop} from './crops.ts';

export const ROOT_DEPTH_MM = 500;
export const KC_BARE = 0.3;          // suelo desnudo: solo evaporación
export const DEPLETION_BARE = 0.5;
export const AIR_DRY = 0.5;          // el suelo no baja de la mitad del punto de marchitez permanente
export const DEATH_DAYS = 4;         // días seguidos con estrés casi total hasta que el cultivo muere

export type SoilId = 'arenoso' | 'franco' | 'arcilloso';
export type SoilDef = {id: SoilId; label: string; /** capacidad de campo (m³/m³) */ fc: number; /** punto de marchitez */ wp: number; /** saturación */ sat: number; /** constante de drenaje (días) */ tauDays: number; /** infiltración máxima (mm/h) */ infMmH: number};
export const SOILS: readonly SoilDef[] = [
  {id: 'arenoso', label: 'Arenoso', fc: 0.12, wp: 0.05, sat: 0.4, tauDays: 0.25, infMmH: 50},
  {id: 'franco', label: 'Franco', fc: 0.28, wp: 0.12, sat: 0.46, tauDays: 1, infMmH: 20},
  {id: 'arcilloso', label: 'Arcilloso', fc: 0.38, wp: 0.22, sat: 0.5, tauDays: 3, infMmH: 6},
];
export const soilById = (id: unknown): SoilDef => SOILS.find(s => s.id === id) ?? SOILS[1];

export type SoilBounds = {fcMm: number; wpMm: number; satMm: number; tawMm: number; airDryMm: number};
export function boundsOf(soil: SoilDef): SoilBounds {
  const fcMm = soil.fc * ROOT_DEPTH_MM, wpMm = soil.wp * ROOT_DEPTH_MM;
  return {fcMm, wpMm, satMm: soil.sat * ROOT_DEPTH_MM, tawMm: fcMm - wpMm, airDryMm: wpMm * AIR_DRY};
}

/** Claves de estado de una parcela y su valor inicial. `aguaMm: -1` significa «sin inicializar»: se llena al primer paso según el suelo. */
export const PARCEL_STATE: Record<string, PropValue> = {
  suelo: 'franco', cultivo: '', aguaMm: -1,
  gdd: 0, dano: 0, ks: 1, vivo: true, marchitezDias: 0, siembraDia: -1,
  riegoMm: 0, lluviaMm: 0, etMm: 0, drenajeMm: 0, escorrentiaMm: 0,
  cosechaKg: 0, cosechaTha: 0, cosechas: 0,
};

const n = (v: PropValue | undefined, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Humedad inicial de una parcela nueva: 60 % del agua útil. */
export const initialWaterMm = (soil: SoilDef): number => { const b = boundsOf(soil); return b.wpMm + 0.6 * b.tawMm; };

/** Coeficiente de estrés Ks (1 = sin estrés, 0 = marchitez total). */
export function ksOf(waterMm: number, b: SoilBounds, depletion: number): number {
  const available = waterMm - b.wpMm, easy = b.tawMm * (1 - depletion);
  return available >= easy ? 1 : Math.max(0, available / easy);
}

export type ParcelView = {
  soil: SoilDef; bounds: SoilBounds; crop: Crop | null; alive: boolean; waterMm: number;
  /** Humedad volumétrica (m³/m³). */
  theta: number; /** Agua útil restante, 0–1. */ available: number;
  gdd: number; stage: ReturnType<typeof stageAt> | null; ks: number; damage: number;
  /** Rendimiento esperado respecto del potencial, 0–1. */ expectedYield: number;
  ready: boolean;
};

export function viewOf(state: Record<string, PropValue>): ParcelView {
  const soil = soilById(state.suelo), bounds = boundsOf(soil), crop = cropById(state.cultivo) ?? null, alive = state.vivo !== false;
  const raw = n(state.aguaMm, -1), waterMm = raw < 0 ? initialWaterMm(soil) : Math.min(raw, bounds.satMm);
  const gdd = n(state.gdd, 0), damage = Math.min(1, Math.max(0, n(state.dano, 0))), stage = crop ? stageAt(crop, gdd) : null;
  return {soil, bounds, crop, alive, waterMm, theta: waterMm / ROOT_DEPTH_MM, available: Math.min(1, Math.max(0, (waterMm - bounds.wpMm) / bounds.tawMm)),
    gdd, stage, ks: crop && alive ? ksOf(waterMm, bounds, crop.depletion) : ksOf(waterMm, bounds, DEPLETION_BARE), damage, expectedYield: alive ? 1 - damage : 0, ready: !!crop && alive && stage?.id === 'madurez'};
}

export type ParcelStepInput = {
  dtS: number;
  /** Evapotranspiración de referencia de este paso (mm). */
  et0Mm: number;
  rainMm: number; rainRateMmH: number;
  /** Riego que llega a la parcela en este paso (mm) y la parte que se pierde por escorrentía al superar la infiltración local. */
  irrigMm: number; irrRunoffMm: number;
  /** Grados-día de TODO el día; se reparten según `dtS`. */
  gddDay: number;
};

/** Avanza una parcela `dtS` segundos. Devuelve el estado nuevo (las claves de `PARCEL_STATE`). No muta el original. */
export function stepParcel(state: Record<string, PropValue>, inp: ParcelStepInput): Record<string, PropValue> {
  const v = viewOf(state), b = v.bounds, soil = v.soil, dtDays = inp.dtS / DAY;
  let water = v.waterMm;

  // 1. Entradas: riego y lluvia, con escorrentía si la intensidad supera la infiltración.
  const rainRunoff = inp.rainMm > 0 && inp.rainRateMmH > soil.infMmH ? inp.rainMm * (1 - soil.infMmH / inp.rainRateMmH) : 0;
  water += inp.irrigMm - inp.irrRunoffMm + inp.rainMm - rainRunoff;
  // 2. Saturación: lo que no cabe escurre.
  const satRunoff = Math.max(0, water - b.satMm); water -= satRunoff;
  // 3. Evapotranspiración real.
  const crop = v.alive ? v.crop : null, kc = crop ? kcAt(crop, v.gdd) : KC_BARE, ks = ksOf(water, b, crop ? crop.depletion : DEPLETION_BARE);
  const eta = Math.min(ks * kc * inp.et0Mm, Math.max(0, water - b.airDryMm)); water -= eta;
  // 4. Drenaje profundo sobre la capacidad de campo (exponencial, exacto para cualquier paso).
  const drain = water > b.fcMm ? (water - b.fcMm) * (1 - Math.exp(-dtDays / soil.tauDays)) : 0; water -= drain;

  const out: Record<string, PropValue> = {
    ...state, aguaMm: water, ks,
    riegoMm: n(state.riegoMm, 0) + inp.irrigMm, lluviaMm: n(state.lluviaMm, 0) + inp.rainMm, etMm: n(state.etMm, 0) + eta,
    drenajeMm: n(state.drenajeMm, 0) + drain, escorrentiaMm: n(state.escorrentiaMm, 0) + rainRunoff + inp.irrRunoffMm + satRunoff,
  };

  // 5. Cultivo: tiempo térmico, daño por estrés y marchitez.
  if (crop) {
    const stage = stageAt(crop, v.gdd), dGdd = Math.min(inp.gddDay * dtDays, Math.max(0, crop.stages[crop.stages.length - 1].from - v.gdd));
    out.gdd = v.gdd + dGdd;
    if (stage.id !== 'madurez') out.dano = Math.min(1, v.damage + (stage.ky * (1 - ks) * dGdd) / (stage.to - stage.from));
    const wilt = ks < 0.1 ? n(state.marchitezDias, 0) + dtDays : Math.max(0, n(state.marchitezDias, 0) - dtDays);
    out.marchitezDias = wilt;
    if (wilt >= DEATH_DAYS) out.vivo = false;
  }
  return out;
}

/** Siembra. Falla con un motivo legible si la parcela ya tiene un cultivo vivo o el cultivo no existe. */
export function plant(state: Record<string, PropValue>, cropId: string, dayIndex: number): {ok: true; state: Record<string, PropValue>} | {ok: false; error: string} {
  const crop = cropById(cropId); if (!crop) return {ok: false, error: `No existe el cultivo «${cropId}».`};
  if (cropById(state.cultivo) && state.vivo !== false) return {ok: false, error: 'Esta parcela ya tiene un cultivo. Cosecha o retira el actual antes de sembrar.'};
  const w = n(state.aguaMm, -1);
  return {ok: true, state: {...state, cultivo: crop.id, gdd: 0, dano: 0, vivo: true, marchitezDias: 0, siembraDia: dayIndex, ks: 1, aguaMm: w < 0 ? initialWaterMm(soilById(state.suelo)) : w}};
}

/** Retira el cultivo (vivo o muerto) sin cosechar. */
export function clearCrop(state: Record<string, PropValue>): Record<string, PropValue> {
  return {...state, cultivo: '', gdd: 0, dano: 0, vivo: true, marchitezDias: 0, siembraDia: -1, ks: 1};
}

/** Cosecha: solo con el cultivo vivo y maduro. Rinde potencial × (1 − daño por estrés) × superficie. */
export function harvest(state: Record<string, PropValue>, areaM2: number): {ok: true; state: Record<string, PropValue>; kg: number; tha: number} | {ok: false; error: string} {
  const v = viewOf(state);
  if (!v.crop) return {ok: false, error: 'No hay cultivo que cosechar.'};
  if (!v.alive) return {ok: false, error: 'El cultivo murió: no hay nada que cosechar. Retíralo para sembrar de nuevo.'};
  if (!v.ready) return {ok: false, error: `Todavía no está listo: ${v.stage?.label.toLowerCase() ?? 'sin etapa'}, ${Math.round(Math.min(1, v.gdd / v.crop.stages[v.crop.stages.length - 1].from) * 100)} % del ciclo.`};
  const tha = v.crop.yieldPotentialTha * (1 - v.damage), kg = tha * (areaM2 / 10000) * 1000;
  return {ok: true, kg, tha, state: {...clearCrop(state), cosechaKg: kg, cosechaTha: tha, cosechas: n(state.cosechas, 0) + 1}};
}
