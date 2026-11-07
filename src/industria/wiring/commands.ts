// Operaciones de cableado sobre el modelo compartido. Puras y validadas; cada una es un solo paso de historial.
import {connect, disconnect} from '../model/commands.ts';
import type {IndustryProject, Result, TerminalRef} from '../model/types.ts';
import {connectionKindFor, MAX_WIRES_PER_TERMINAL, refKey, sameRef, terminalDef, withStatuses} from './engine.ts';

const fail = (error: string): Result<IndustryProject> => ({ok: false, error});
const labelOf = (p: IndustryProject, r: TerminalRef) => `${p.entities.find(e => e.id === r.entityId)?.label ?? r.entityId}.${r.terminalId}`;

/** Une dos terminales. Los errores estructurales se rechazan; una unión que rompe una regla (p. ej. tierra con fuerza) se crea y queda «invalid» con su motivo. */
export function wire(p: IndustryProject, a: TerminalRef, b: TerminalRef, label?: string): Result<IndustryProject> {
  const da = terminalDef(p, a), db = terminalDef(p, b);
  if (!da) return fail(`El terminal ${labelOf(p, a)} no existe.`);
  if (!db) return fail(`El terminal ${labelOf(p, b)} no existe.`);
  if (sameRef(a, b)) return fail('No se puede unir un terminal consigo mismo.');
  for (const r of [a, b]) if (p.connections.filter(c => refKey(c.a) === refKey(r) || refKey(c.b) === refKey(r)).length >= MAX_WIRES_PER_TERMINAL) return fail(`${labelOf(p, r)} ya tiene ${MAX_WIRES_PER_TERMINAL} cables (límite didáctico).`);
  const made = connect(p, a, b, connectionKindFor(da, db), label);
  return made.ok ? {ok: true, value: withStatuses(made.value)} : made;
}

/** Quita solo ese cable. */
export function unwire(p: IndustryProject, connectionId: string): Result<IndustryProject> {
  const r = disconnect(p, connectionId);
  return r.ok ? {ok: true, value: withStatuses(r.value)} : r;
}
