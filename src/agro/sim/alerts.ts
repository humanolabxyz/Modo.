// Alertas y lecturas de sensores (Fase 4). Puro. Las alertas se DERIVAN del estado actual: no se guardan, y por eso un mundo reabierto muestra las mismas.
import type {AgroProgram, Connection, Entity} from '../model/types.ts';
import {plcInputs} from './plc.ts';
import type {Analysis} from './network.ts';
import {parcelAt} from '../world/placement.ts';
import {deadVolumeL} from './step.ts';
import {viewOf} from './soil.ts';
import {needsTerrainReview} from '../world/impact.ts';
import {TERRAIN_ISSUE} from '../world/pipeElevation.ts';

export type Alert = {level: 'info' | 'warn' | 'bad'; text: string; entityId: string};
const RANK = {bad: 0, warn: 1, info: 2} as const;
const pct = (v: number): string => `${Math.round(v * 100)} %`;

/** `ctx` (Fase 5) permite avisar de tableros en automático mal armados; sin él solo se evalúan estanques y parcelas. */
export function alertsOf(entities: readonly Entity[], analysis: Analysis, ctx?: {connections: readonly Connection[]; plc?: Record<string, AgroProgram>; hour?: number}): Alert[] {
  const out: Alert[] = [];
  const pending = ctx?.connections.filter(needsTerrainReview) ?? [];
  if (pending.length) {
    const byId = new Map(entities.map(e => [e.id, e.label]));
    for (const c of pending) out.push({level: 'warn', entityId: c.a.entityId, text: `«${byId.get(c.a.entityId)}» ↔ «${byId.get(c.b.entityId)}»: ${c.reason}`});
  }
  for (const e of entities) {
    if (typeof e.state[TERRAIN_ISSUE] === 'string') out.push({level: 'warn', entityId: e.id, text: `«${e.label}»: ${e.state[TERRAIN_ISSUE]}`});
    if (e.type === 'tablero' && ctx && e.state.modo === 'auto') {
      const program = ctx.plc?.[e.id];
      if (!program || program.rungs.length === 0) out.push({level: 'warn', entityId: e.id, text: `«${e.label}» está en modo automático pero no tiene programa: la bomba no recibirá energía.`});
      else {
        if (e.state.interruptor !== true) out.push({level: 'warn', entityId: e.id, text: `«${e.label}» está en modo automático, pero su interruptor general está apagado: el PLC no tiene energía.`});
        const i = plcInputs(entities, ctx.connections, e, ctx.hour ?? 12);
        if (!i.sensor) out.push({level: 'warn', entityId: e.id, text: `«${e.label}» está en modo automático y no recibe señal de ninguna sonda de humedad (conecta una a «Entrada de sensor»).`});
        else if (i.availablePct === null) out.push({level: 'warn', entityId: e.id, text: `La sonda de «${e.label}» está fuera de toda parcela: no mide nada.`});
      }
    }
    if (e.type === 'estanque') {
      const r = analysis.elements[e.id], cap = Number(e.params.volumenMaxL ?? e.state.volumenMaxL ?? 10000), dead = deadVolumeL(e), level = Number(e.state.nivelL ?? 0);
      if (r?.kind === 'estanque' && r.dryOutlet) out.push({level: 'bad', entityId: e.id, text: `«${e.label}» no tiene agua utilizable: el nivel está bajo la salida.`});
      else if ((level - dead) / Math.max(1, cap - dead) < 0.15) out.push({level: 'warn', entityId: e.id, text: `«${e.label}» tiene menos del 15 % de su agua utilizable.`});
    } else if (e.type === 'parcela') {
      const v = viewOf(e.state); if (!v.crop) continue;
      if (!v.alive) out.push({level: 'bad', entityId: e.id, text: `El cultivo de «${e.label}» murió. Retíralo para sembrar de nuevo.`});
      else if (v.ready) out.push({level: 'info', entityId: e.id, text: `«${e.label}»: ${v.crop.name.toLowerCase()} listo para cosechar (rendimiento esperado ${pct(v.expectedYield)}).`});
      else if (v.ks < 0.3) out.push({level: 'bad', entityId: e.id, text: `«${e.label}» sufre estrés hídrico severo: recibe ${pct(v.ks)} del agua que necesita.`});
      else if (v.ks < 0.7) out.push({level: 'warn', entityId: e.id, text: `«${e.label}» está entrando en estrés hídrico (${pct(v.ks)} del agua que necesita).`});
    }
  }
  return out.sort((a, b) => RANK[a.level] - RANK[b.level]);
}

export type SensorReading = {parcelId: string; parcelLabel: string; moisturePct: number; availablePct: number; stressed: boolean} | null;

/** Lo que mide una sonda de humedad: la parcela donde está clavada. Fuera de toda parcela no mide nada. */
export function sensorReading(entities: readonly Entity[], sensor: Entity): SensorReading {
  const p = parcelAt(entities, sensor.pose.position[0], sensor.pose.position[2]); if (!p) return null;
  const v = viewOf(p.state);
  return {parcelId: p.id, parcelLabel: p.label, moisturePct: v.theta * 100, availablePct: v.available * 100, stressed: v.ks < 0.7};
}
