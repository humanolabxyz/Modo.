// Qué debe sonar (fase 11). Puro: compara dos instantáneas de la simulación y devuelve los eventos y cuántos motores giran. El sintetizador (sound.ts) solo reproduce.
import {operableKind} from '../sim/engine.ts';

export type SoundEvent = {kind: 'contactor' | 'switch' | 'button' | 'trip'; id: string; on: boolean};
export type Snapshot = {energized: Record<string, boolean>; inputs: Record<string, boolean>};

export function soundEvents(prev: Snapshot, next: Snapshot, defs: ReadonlyMap<string, string>): {events: SoundEvent[]; motors: number} {
  const events: SoundEvent[] = [];
  for (const [id, def] of defs) {
    if (def === 'contactor-3p' && !!prev.energized[id] !== !!next.energized[id]) events.push({kind: 'contactor', id, on: !!next.energized[id]});
    const kind = operableKind(def);
    if (kind && !!prev.inputs[id] !== !!next.inputs[id]) events.push({kind: kind === 'trip' ? (next.inputs[id] ? 'trip' : 'switch') : kind === 'pushbutton' ? 'button' : 'switch', id, on: !!next.inputs[id]});
  }
  let motors = 0; for (const [id, def] of defs) if (def === 'motor-3p' && next.energized[id]) motors++;
  return {events, motors};
}
