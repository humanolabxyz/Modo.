// Operaciones del diagrama sobre el modelo: la posición y la hoja de un símbolo son independientes de la pose 3D (no la cambian) y entran en el historial.
import {setSymbols} from '../model/commands.ts';
import type {IndustryProject, Result} from '../model/types.ts';
import {autoLayout, placementOf, type XY} from './layout.ts';

const place = (p: IndustryProject, id: string, at: XY, page: number): IndustryProject => ({...p, symbols: {...p.symbols, [id]: [{page, x: Math.round(at.x), y: Math.round(at.y)}, ...(p.symbols[id] ?? []).slice(1)]}});

/** Mueve el símbolo de un componente dentro de su hoja. */
export function moveSymbol(p: IndustryProject, id: string, at: XY): Result<IndustryProject> {
  if (!p.entities.some(e => e.id === id)) return {ok: false, error: 'El componente no existe.'};
  if (![at.x, at.y].every(Number.isFinite) || Math.abs(at.x) > 20000 || Math.abs(at.y) > 20000) return {ok: false, error: 'La posición no es válida.'};
  const next = place(p, id, at, placementOf(p, id).page);
  return setSymbols(next, id, next.symbols[id]);
}

/** Pasa el símbolo a otra hoja (la nueva hoja es la siguiente a la última en uso). Conserva su posición. */
export function moveToPage(p: IndustryProject, id: string, page: number): Result<IndustryProject> {
  if (!p.entities.some(e => e.id === id)) return {ok: false, error: 'El componente no existe.'};
  if (!Number.isInteger(page) || page < 1 || page > 20) return {ok: false, error: 'La hoja no es válida (de 1 a 20).'};
  const cur = placementOf(p, id), next = place(p, id, cur, page);
  return setSymbols(next, id, next.symbols[id]);
}

/** Recoloca todos los símbolos (hojas y filas automáticas) en un solo paso de historial. */
export function arrangeAll(p: IndustryProject): Result<IndustryProject> {
  let next = p;
  for (const [id, pl] of Object.entries(autoLayout(p))) next = place(next, id, pl, pl.page);
  return {ok: true, value: next};
}
