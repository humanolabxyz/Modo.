// Operaciones de cableado sobre el modelo compartido. Puras y validadas; cada una es un solo paso de historial.
import {connect, disconnect} from '../model/commands.ts';
import {LIMITS, type IndustryProject, type Result, type TerminalRef, type Vec3} from '../model/types.ts';
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

/** Guarda los puntos de paso de un cable (los extremos son los terminales). Con lista vacía vuelve al enrutado automático. Un paso de historial. */
export function routeWire(p: IndustryProject, connectionId: string, interior: Vec3[]): Result<IndustryProject> {
  if (!p.connections.some(c => c.id === connectionId)) return fail('Ese cable no existe.');
  if (interior.length > LIMITS.route) return fail(`Un cable admite hasta ${LIMITS.route} puntos de paso.`);
  return {ok: true, value: {...p, connections: p.connections.map(c => { if (c.id !== connectionId) return c; const {route: _old, ...rest} = c; void _old; return interior.length ? {...rest, route: interior.map(v => [...v] as Vec3)} : rest; })}};
}

/** «Ordenar»: borra todas las rutas manuales y deja que el enrutado automático separe los cables en carriles. Un paso de historial. */
export function tidyWires(p: IndustryProject): Result<IndustryProject> {
  if (!p.connections.some(c => c.route?.length)) return fail('No hay cables con ruta manual que ordenar.');
  return {ok: true, value: {...p, connections: p.connections.map(c => { const {route: _old, ...rest} = c; void _old; return rest; })}};
}
