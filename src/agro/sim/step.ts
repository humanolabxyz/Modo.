// Avance del mundo en el tiempo (Fase 4). Puro: recibe las piezas y devuelve las piezas nuevas; no toca el historial ni el reloj.
//
// Cada paso: (1) se toma la red hidráulica del instante (`analyze`), (2) el estanque entrega agua y baja de nivel, (3) esa agua llega a las parcelas
// por los aspersores, (4) cada parcela hace su balance con la lluvia y la evapotranspiración del día, (5) crece el cultivo.
// El paso dura hasta 5 minutos simulados con agua en movimiento y hasta 30 minutos sin ella, y nunca cruza la medianoche. Si un estanque se vaciaría
// en mitad del paso, el agua entregada se reparte en proporción a lo que había: el balance de masa se cierra siempre.
import type {Clock, Connection, Entity, PropValue} from '../model/types.ts';
import type {Heightfield} from '../terrain/heightfield.ts';
import {analyze, type Analysis} from './network.ts';
import {secondsToMidnight, timeInfo} from './clock.ts';
import {dayWeather, etFractionBy, rainFractionBy, RAIN_END_H, RAIN_START_H} from './climate.ts';
import {cropById, gddOfDay} from './crops.ts';
import {irrigationByParcel} from './irrigation.ts';
import {TANK_RADIUS} from './network.ts';
import {stepParcel, viewOf} from './soil.ts';
import {bitOn} from '../plc/program.ts';
import {runPlcs, type Programs} from './plc.ts';

export const STEP_ACTIVE_S = 300;
export const STEP_IDLE_S = 1800;
/** Con un PLC en automático y con energía el paso en reposo es más corto: así la sonda se vigila al menos cada 10 minutos. */
export const STEP_WATCH_S = 600;
const LOW_TANK = 0.15;

export type SimEvent = {at: number; level: 'info' | 'warn' | 'bad'; text: string; entityId?: string};
export type StepResult = {entities: Entity[]; /** segundos simulados realmente avanzados */ advanced: number; events: SimEvent[]};

/** Agua que queda bajo la salida del estanque y no se puede extraer (L). */
export function deadVolumeL(tank: Entity): number { const out = tank.ports.find(p => p.id === 'salida'); return out ? out.local[1] * Math.PI * TANK_RADIUS * TANK_RADIUS * 1000 : 0; }
const num = (v: PropValue | undefined, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const fmt = (v: number, d = 1): string => v.toFixed(d).replace('.', ',');

/** Avanza `seconds` segundos simulados desde `clock.simSeconds`. Con `budgetMs` se detiene al agotarse el tiempo (devuelve lo avanzado). */
export function stepWorld(entities: readonly Entity[], connections: readonly Connection[], hf: Heightfield, clock: Pick<Clock, 'simSeconds' | 'startDate' | 'seed'>, seconds: number, options: {budgetMs?: number; now?: () => number; plc?: Programs} = {}): StepResult {
  const now = options.now ?? (() => Date.now()), t0 = now();
  let ents = entities as Entity[], t = clock.simSeconds, remaining = Math.max(0, seconds), analysis: Analysis | null = null, lastDtMs = 0;
  const events: SimEvent[] = [];
  while (remaining > 1e-9) {
    if (options.budgetMs !== undefined && now() - t0 > options.budgetMs) break;
    const info = timeInfo({simSeconds: t, startDate: clock.startDate});
    // Obras (Fase 6): las piezas cuyo montaje ya terminó pasan a existir para la red.
    const finished = ents.filter(e => typeof e.state.obraHasta === 'number' && e.state.obraHasta > 0 && e.state.obraHasta <= t + 1e-6);
    if (finished.length) {
      ents = ents.map(e => (finished.includes(e) ? {...e, state: {...e.state, obraHasta: 0}} : e)); analysis = null;
      for (const e of finished) events.push({at: Number(e.state.obraHasta), level: 'info', entityId: e.id, text: `Terminó el montaje de «${e.label}»: ya está instalada.`});
    }
    // PLC (Fase 5): un escaneo por paso, con las entradas del instante (sonda, reloj); su salida Y0 cambia qué bomba recibe energía.
    const run = runPlcs(ents, connections, options.plc, info.hour, lastDtMs);
    if (run.entities !== ents) {
      for (const e of run.entities) { const was = ents.find(x => x.id === e.id); if (e.type === 'tablero' && was && bitOn(was.state, 'Y0') !== bitOn(e.state, 'Y0')) events.push({at: t, level: 'info', entityId: e.id, text: `El PLC de «${e.label}» ${bitOn(e.state, 'Y0') ? 'arrancó' : 'detuvo'} la bomba (salida Y0).`}); }
      if (run.outputChanged) analysis = null;
      ents = run.entities;
    }
    analysis ??= analyze(ents, connections, hf);
    const flowing = analysis.balance.sourcesLmin > 1e-9 || analysis.balance.emittersLmin > 1e-9 || Object.values(analysis.elements).some(r => r.kind === 'estanque' && Math.abs(r.netOutLmin) > 1e-9);
    let dt = Math.min(remaining, flowing ? STEP_ACTIVE_S : run.watching ? STEP_WATCH_S : STEP_IDLE_S, secondsToMidnight({simSeconds: t, startDate: clock.startDate}));
    for (const e of ents) { const end = e.state.obraHasta; if (typeof end === 'number' && end > t + 1e-6) dt = Math.min(dt, end - t); }   // el paso termina justo cuando acaba una obra
    if (dt < 1e-6) dt = Math.min(remaining, 1);   // en la medianoche exacta
    const weather = dayWeather(clock.seed, info.dayIndex, info.doy), h0 = info.hour, h1 = Math.min(24, h0 + dt / 3600);
    const et0Mm = weather.et0Mm * (etFractionBy(h1) - etFractionBy(h0)), rainMm = weather.rainMm * (rainFractionBy(h1) - rainFractionBy(h0));
    const rainRateMmH = weather.rainMm > 0 ? weather.rainMm / (RAIN_END_H - RAIN_START_H) : 0;

    // Estanques: cuánta agua entregan en este paso y qué fracción de lo pedido alcanza.
    let phi = 1;
    for (const e of ents) {
      if (e.type !== 'estanque') continue;
      const r = analysis.elements[e.id]; if (!r || r.kind !== 'estanque' || r.netOutLmin <= 0) continue;
      const need = (r.netOutLmin * dt) / 60, have = Math.max(0, num(e.state.nivelL, 0) - deadVolumeL(e));
      if (need > have) phi = Math.min(phi, Math.max(0, have / need));
    }
    const flows: Record<string, number> = {};
    for (const [id, r] of Object.entries(analysis.elements)) if (r.kind === 'emisor') flows[id] = r.flowLmin * phi;
    const irrigation = irrigationByParcel(ents, flows);

    let tankChanged = false;
    const next = ents.map(e => {
      if (e.type === 'estanque') {
        const r = analysis!.elements[e.id]; if (!r || r.kind !== 'estanque' || Math.abs(r.netOutLmin) < 1e-12) return e;
        const cap = num(e.params.volumenMaxL, 10000), dead = deadVolumeL(e), before = num(e.state.nivelL, 0);
        let after = Math.min(cap, Math.max(0, before - (r.netOutLmin * dt * phi) / 60));
        if (r.netOutLmin > 0 && after - dead < 1e-6) after = Math.min(after, Math.max(0, dead - 0.01));   // salida al aire: la red lo ve seco
        if (after === before) return e;
        tankChanged = true;
        const usable = (v: number) => Math.max(0, v - dead) / Math.max(1, cap - dead);
        if (before >= dead && after < dead) events.push({at: t + dt, level: 'bad', entityId: e.id, text: `«${e.label}» se quedó sin agua utilizable: el nivel bajó de la salida.`});
        else if (usable(before) >= LOW_TANK && usable(after) < LOW_TANK) events.push({at: t + dt, level: 'warn', entityId: e.id, text: `«${e.label}» tiene menos del ${Math.round(LOW_TANK * 100)} % de su agua utilizable.`});
        return {...e, state: {...e.state, nivelL: after}};
      }
      if (e.type === 'parcela') {
        const irr = irrigation[e.id], area = Math.max(1, num(e.params.anchoM, 20) * num(e.params.largoM, 30));
        const irrigMm = irr ? (irr.lmin * dt) / 60 / area : 0, crop = cropById(e.state.cultivo);
        const before = viewOf(e.state);
        const state = stepParcel(e.state, {dtS: dt, et0Mm, rainMm, rainRateMmH: rainMm > 0 ? rainRateMmH : 0, irrigMm, irrRunoffMm: irr ? irrigMm * irr.runoffFraction : 0, gddDay: crop ? gddOfDay(crop, weather.tMeanC) : 0});
        const after = viewOf(state);
        if (before.crop && after.crop) {
          if (before.alive && !after.alive) events.push({at: t + dt, level: 'bad', entityId: e.id, text: `El cultivo de «${e.label}» murió por falta de agua.`});
          else if (before.stage && after.stage && before.stage.id !== after.stage.id) events.push({at: t + dt, level: after.stage.id === 'madurez' ? 'info' : 'info', entityId: e.id, text: after.stage.id === 'madurez' ? `El ${after.crop.name.toLowerCase()} de «${e.label}» está listo para cosechar (rendimiento esperado ${Math.round(after.expectedYield * 100)} %).` : `«${e.label}»: comienza la etapa «${after.stage.label.toLowerCase()}».`});
          else if (before.alive && before.ks >= 0.7 && after.ks < 0.7) events.push({at: t + dt, level: 'warn', entityId: e.id, text: `«${e.label}» entra en estrés hídrico (${fmt(after.ks * 100, 0)} % del agua que necesita). Riega pronto.`});
          else if (before.alive && before.ks < 0.7 && after.ks >= 0.7) events.push({at: t + dt, level: 'info', entityId: e.id, text: `«${e.label}» salió del estrés hídrico.`});
        }
        return {...e, state};
      }
      return e;
    });
    ents = next; t += dt; remaining -= dt; lastDtMs = dt * 1000;
    // La red cambia solo si cambió el nivel de algún estanque: si no, se reutiliza el análisis (clave para avanzar días enteros sin gasto).
    if (tankChanged) analysis = null;
  }
  return {entities: ents, advanced: t - clock.simSeconds, events};
}
