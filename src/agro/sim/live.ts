// Estado «vivo» de las piezas (Fase 4): lo que escribe la simulación con el paso del tiempo. No entra en el historial de deshacer.
// Deshacer revierte la estructura (piezas, conexiones, relieve); el agua del estanque y del suelo y el cultivo son tiempo ya transcurrido y se conservan.
import type {Entity, PropValue} from '../model/types.ts';
import {RUNTIME_KEYS} from '../plc/program.ts';
import {PARCEL_STATE} from './soil.ts';

export const LIVE_KEYS: Record<string, readonly string[]> = {
  estanque: ['nivelL'],
  parcela: Object.keys(PARCEL_STATE),
  tablero: RUNTIME_KEYS,   // variables, temporizadores y contadores del PLC (Fase 5)
};

/** Claves vivas de cualquier pieza: el montaje en obra (Fase 6) avanza con el tiempo y no se deshace. */
export const GENERIC_LIVE = ['obraDesde', 'obraHasta'] as const;
export const isLiveKey = (type: string, key: string): boolean => (GENERIC_LIVE as readonly string[]).includes(key) || (LIVE_KEYS[type]?.includes(key) ?? false);

/** Copia el estado vivo de las piezas de `from` a las piezas homónimas de `to` (tras un deshacer o rehacer). Devuelve el mismo arreglo si nada cambia. */
export function carryLive(from: readonly Entity[], to: readonly Entity[]): Entity[] {
  const byId = new Map(from.map(e => [e.id, e]));
  let changed = false;
  const out = to.map(e => {
    const keys = [...GENERIC_LIVE, ...(LIVE_KEYS[e.type] ?? [])], src = byId.get(e.id); if (!src) return e;
    let patch: Record<string, PropValue> | null = null;
    for (const k of keys) if (k in src.state && src.state[k] !== e.state[k]) (patch ??= {})[k] = src.state[k];
    if (!patch) return e;
    changed = true; return {...e, state: {...e.state, ...patch}};
  });
  return changed ? out : (to as Entity[]);
}
