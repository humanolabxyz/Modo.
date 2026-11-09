// Energía booleana de Agro (Fase 3): ¿llega tensión al puerto de alimentación de cada consumidor?
// Es la misma idea de `src/industria/sim/engine.ts` (redes por unión + propagación desde las fuentes + contactos que abren o cierran), adaptada a las
// entidades de Agro: aquel motor está atado al modelo `IndustryProject` y a sus piezas, así que se reutiliza el ALGORITMO, no el módulo.
// No hay corrientes ni protecciones: eso llega con la Fase 5. Un interruptor cerrado deja pasar tensión; abierto, no.
import type {Connection, Entity} from '../model/types.ts';
import {bitOn} from '../plc/program.ts';

export type PowerResult = {
  /** Puertos con tensión, como `entityId:portId`. */
  live: Set<string>;
  /** Por entidad consumidora (bomba): ¿recibe tensión en su puerto de alimentación? */
  energized: Record<string, boolean>;
  /** Por entidad consumidora: por qué no (cuando no está energizada). */
  reasons: Record<string, string>;
};

const key = (entityId: string, portId: string): string => `${entityId}:${portId}`;

class Union {
  parent = new Map<string, string>();
  find(a: string): string { if (!this.parent.has(a)) this.parent.set(a, a); let r = a; while (this.parent.get(r) !== r) r = this.parent.get(r)!; this.parent.set(a, r); return r; }
  join(a: string, b: string) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(ra, rb); }
}

/** Qué puertos de cada pieza quedan unidos por dentro: el tablero une su entrada con su salida solo con el interruptor cerrado. */
/** Fase 5: en modo automático el interruptor general no basta; además el PLC debe tener activa su salida Y0 (contactor de la bomba). */
export const boardClosed = (e: Entity): boolean => e.state.interruptor === true && (e.state.modo !== 'auto' || bitOn(e.state, 'Y0'));
const throughPorts = (e: Entity, closeSwitches: boolean): [string, string][] => (e.type === 'tablero' && (closeSwitches || boardClosed(e)) ? [[key(e.id, 'red'), key(e.id, 'salida-bomba')]] : []);

function nets(entities: readonly Entity[], connections: readonly Connection[], closeSwitches: boolean): {u: Union; sources: string[]} {
  const u = new Union(), sources: string[] = [];
  for (const c of connections) if (c.kind === 'power' && c.status === 'connected') u.join(key(c.a.entityId, c.a.portId), key(c.b.entityId, c.b.portId));
  for (const e of entities) {
    for (const [a, b] of throughPorts(e, closeSwitches)) u.join(a, b);
    if (e.type === 'acometida') sources.push(key(e.id, 'red'));
  }
  return {u, sources};
}

export function analyzePower(entities: readonly Entity[], connections: readonly Connection[]): PowerResult {
  const actual = nets(entities, connections, false), ideal = nets(entities, connections, true);
  const liveRoots = new Set(actual.sources.map(s => actual.u.find(s))), idealRoots = new Set(ideal.sources.map(s => ideal.u.find(s)));
  const live = new Set<string>();
  for (const e of entities) for (const p of e.ports) if (p.kind === 'power' && liveRoots.has(actual.u.find(key(e.id, p.id)))) live.add(key(e.id, p.id));
  const energized: Record<string, boolean> = {}, reasons: Record<string, string> = {};
  for (const e of entities) {
    if (e.type !== 'bomba') continue;
    const k = key(e.id, 'alim');
    energized[e.id] = live.has(k);
    if (energized[e.id]) continue;
    const cabled = connections.some(c => c.kind === 'power' && c.status === 'connected' && ((c.a.entityId === e.id && c.a.portId === 'alim') || (c.b.entityId === e.id && c.b.portId === 'alim')));
    if (!cabled) reasons[e.id] = 'Falta conectar el cable de alimentación.';
    else if (idealRoots.has(ideal.u.find(k))) {
      const sameNet = (t: Entity) => t.type === 'tablero' && ideal.u.find(key(t.id, 'red')) === ideal.u.find(k);
      const off = entities.find(t => sameNet(t) && t.state.interruptor !== true), held = entities.find(t => sameNet(t) && !boardClosed(t));
      reasons[e.id] = off ? `El interruptor de «${off.label}» está apagado.` : held ? `El PLC de «${held.label}» (modo automático) mantiene la bomba detenida: su salida Y0 está apagada.` : 'No llega energía a la bomba.';
    } else reasons[e.id] = 'No hay una acometida conectada a esta bomba.';
  }
  return {live, energized, reasons};
}
