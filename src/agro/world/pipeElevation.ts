import type {Entity, Port} from '../model/types.ts';
import {sampleHeight, type Heightfield} from '../terrain/heightfield.ts';
import {portWorld} from './placement.ts';

export const PIPE_ELEVATIONS = 'cotasTuberiaTerreno';
export const TERRAIN_ISSUE = 'incidenciaTerreno';

/** Al recolocar una pieza explícitamente vuelve a aplicarse su apoyo normal. */
export function clearTerrainSupport(state: Entity['state']): Entity['state'] {
  if (!(TERRAIN_ISSUE in state) && !(PIPE_ELEVATIONS in state)) return state;
  const {[TERRAIN_ISSUE]: _issue, [PIPE_ELEVATIONS]: _pin, ...rest} = state;
  return rest;
}

/** Conserva la convención hidráulica histórica salvo si el jugador fijó las cotas del tramo. */
export function pipePortElevation(hf: Heightfield, entity: Entity, port: Port): number {
  const pin = entity.state[PIPE_ELEVATIONS], index = port.id === 'a' ? 0 : port.id === 'b' ? 1 : -1;
  if (typeof pin === 'string' && index >= 0) {
    const value = pin.split(',')[index];
    if (value && Number.isFinite(Number(value))) return Number(value);
  }
  const {x, z} = portWorld(entity, port);
  return sampleHeight(hf, x, z) + port.local[1];
}
