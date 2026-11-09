// Reloj de simulación (Fase 4). Puro. Un solo reloj por mundo: el tiempo de render no lo sustituye.
// La fecha de inicio (`startDate`) se lee como HORA LOCAL del mundo (se usan sus campos UTC como reloj de pared): no hay husos horarios ni horario de verano.
import type {Clock} from '../model/types.ts';
import {hash2} from '../terrain/noise.ts';

export const DAY = 86400;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Aleatorio determinista en [0, 1) que depende solo de (semilla, canal, contador). No guarda estado: el mismo día da el mismo resultado sin importar cómo se avanzó el reloj ni si se guardó y reabrió el mundo. */
export function rand(seed: number, channel: number, counter: number): number {
  return hash2((seed ^ Math.imul(channel | 0, 0x45d9f3b)) | 0, counter | 0, (channel | 0) + 7919);
}

export type TimeInfo = {
  /** Día simulado (0 = el día de inicio). Es el contador que alimenta el clima. */
  dayIndex: number;
  /** Hora local del día, en horas decimales [0, 24). */
  hour: number;
  /** Día del año 1–366 (calendario real). */
  doy: number;
  year: number; month: number; day: number;
  /** «21 sep 2026». */
  dateLabel: string;
  /** «08:00». */
  timeLabel: string;
};

const startOfDay = (d: Date): number => d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();

export function timeInfo(clock: Pick<Clock, 'simSeconds' | 'startDate'>): TimeInfo {
  const start = new Date(clock.startDate), t0 = startOfDay(start), total = t0 + clock.simSeconds;
  const dayIndex = Math.floor(total / DAY), sec = total - dayIndex * DAY;
  const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + dayIndex));
  const year = date.getUTCFullYear(), month = date.getUTCMonth(), day = date.getUTCDate();
  const doy = Math.round((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / (DAY * 1000)) + 1;
  const hour = sec / 3600, hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60);
  return {dayIndex, hour, doy, year, month: month + 1, day, dateLabel: `${day} ${MONTHS[month]} ${year}`, timeLabel: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`};
}

/** Segundos que faltan para la medianoche local siguiente. */
export function secondsToMidnight(clock: Pick<Clock, 'simSeconds' | 'startDate'>): number {
  const total = startOfDay(new Date(clock.startDate)) + clock.simSeconds;
  return DAY - (total - Math.floor(total / DAY) * DAY);
}

export const SPEED_LABELS: Record<number, string> = {0: 'Pausa', 1: '1×', 5: '5×', 20: '20×', 100: '100×', 3600: '1 h/s', 86400: '1 día/s'};
