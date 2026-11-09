// Clima diario didáctico (Fase 4). Puro y determinista: depende solo de (semilla, día).
// NO son datos de una estación real: es un clima árido genérico del hemisferio sur (verano en enero) con variación aleatoria reproducible.
// Procedencia: `fictional` (docs/agro/FASE_4_TIEMPO_SUELO_Y_CULTIVO.md). Cuando haya datos reales se declararán como `measured` o `estimated`.
import {rand} from './clock.ts';

export type Weather = {
  tMeanC: number; tMinC: number; tMaxC: number;
  /** Evapotranspiración de referencia del día (mm). */
  et0Mm: number;
  /** Lluvia del día (mm); cae entre las 14:00 y las 17:00. */
  rainMm: number;
};

export const RAIN_START_H = 14, RAIN_END_H = 17, SUNRISE_H = 6, SUNSET_H = 18;
const CH_TEMP = 1, CH_ET = 2, CH_RAIN = 3, CH_AMOUNT = 4;

export function dayWeather(seed: number, dayIndex: number, doy: number): Weather {
  const season = Math.cos((2 * Math.PI * (doy - 15)) / 365);     // +1 a mediados de enero, −1 a mediados de julio
  const tMean = 16 + 8 * season + (rand(seed, CH_TEMP, dayIndex) - 0.5) * 5;
  const wet = rand(seed, CH_RAIN, dayIndex) < 0.012 + 0.045 * (1 - season) / 2;
  const rainMm = wet ? 1 + 11 * Math.pow(rand(seed, CH_AMOUNT, dayIndex), 2) : 0;
  const et0 = (4.4 + 2.2 * season) * (0.85 + 0.3 * rand(seed, CH_ET, dayIndex)) * (wet ? 0.6 : 1);
  return {tMeanC: tMean, tMinC: tMean - 8, tMaxC: tMean + 8, et0Mm: et0, rainMm};
}

/** Fracción acumulada de la evapotranspiración del día a la hora `h` (0–24): media onda de seno entre la salida y la puesta del sol. */
export function etFractionBy(h: number): number {
  if (h <= SUNRISE_H) return 0;
  if (h >= SUNSET_H) return 1;
  return (1 - Math.cos((Math.PI * (h - SUNRISE_H)) / (SUNSET_H - SUNRISE_H))) / 2;
}

/** Fracción acumulada de la lluvia del día a la hora `h`: intensidad constante entre las 14:00 y las 17:00. */
export function rainFractionBy(h: number): number {
  if (h <= RAIN_START_H) return 0;
  if (h >= RAIN_END_H) return 1;
  return (h - RAIN_START_H) / (RAIN_END_H - RAIN_START_H);
}
