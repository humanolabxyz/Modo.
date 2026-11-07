// Motor de conexiones de Industria (fase 5): terminales en el mundo, redes (netlist) y validación topológica. Puro: se prueba en Node.
//
// Alcance honesto: aquí NO hay cálculo eléctrico (tensiones, corrientes, calibres). Solo se comprueba lo que se puede decidir sin datos de un
// fabricante: que los terminales existan, que la tierra no se mezcle con otros terminales, que no se unan línea con neutro ni positivo con
// negativo, y un límite didáctico de cables por terminal. Una conexión solo es «valid» si las dos piezas están verificadas con fuente;
// con piezas genéricas queda «unverified» aunque no tenga errores.
import {tPoint} from '../../robotics/project/math.ts';
import {shapeOf, type TerminalDef} from '../build/shapes.ts';
import {toTransform} from '../build/snap.ts';
import type {Connection, ConnectionKind, ConnectionStatus, IndustryProject, TerminalRef, Vec3} from '../model/types.ts';

/** Límite didáctico (no es una especificación de bornes reales). */
export const MAX_WIRES_PER_TERMINAL = 2;

export const refKey = (r: TerminalRef): string => `${r.entityId}:${r.terminalId}`;
export const sameRef = (a: TerminalRef, b: TerminalRef): boolean => a.entityId === b.entityId && a.terminalId === b.terminalId;

export function terminalDef(p: Pick<IndustryProject, 'entities'>, ref: TerminalRef): TerminalDef | undefined {
  const e = p.entities.find(x => x.id === ref.entityId);
  return e ? shapeOf(e.definitionId).terminals?.find(t => t.id === ref.terminalId) : undefined;
}

/** Posición del terminal en el mundo (sigue a la pieza cuando se mueve o se gira). */
export function terminalWorld(p: Pick<IndustryProject, 'entities' | 'poses'>, ref: TerminalRef): Vec3 | null {
  const def = terminalDef(p, ref), pose = p.poses[ref.entityId];
  return def && pose ? tPoint(toTransform(pose), def.position) : null;
}

export function allTerminals(p: Pick<IndustryProject, 'entities'>): TerminalRef[] {
  return p.entities.flatMap(e => (shapeOf(e.definitionId).terminals ?? []).map(t => ({entityId: e.id, terminalId: t.id})));
}

/** Tipo de conexión que resulta de unir dos terminales (regla didáctica): tierra con tierra; si alguno es de señal, señal; si alguno es de mando, mando; si no, fuerza. */
export function connectionKindFor(a: TerminalDef, b: TerminalDef): ConnectionKind {
  if (a.kind === 'earth' && b.kind === 'earth') return 'earth';
  if (a.kind === 'signal' || b.kind === 'signal') return 'signal';
  if (a.kind === 'control' || b.kind === 'control') return 'control';
  if (a.kind === 'pipe' && b.kind === 'pipe') return 'pipe';
  return 'power';
}

export type Net = {id: string; terminals: TerminalRef[]; connections: string[]};
export type Issue = {severity: 'error' | 'warning'; code: 'unknown-terminal' | 'earth-mix' | 'short-circuit' | 'wire-limit' | 'pipe-mix'; message: string; connectionIds: string[]; entityIds: string[]};
export type Evaluation = {nets: Net[]; issues: Issue[]; status: Record<string, ConnectionStatus>; reasons: Record<string, string[]>};

const label = (p: IndustryProject, ref: TerminalRef): string => `${p.entities.find(e => e.id === ref.entityId)?.label ?? ref.entityId}.${ref.terminalId}`;

/** Redes: terminales unidos por cables o por puentes internos de una pieza. Una red por cada grupo con al menos una conexión. */
export function buildNets(p: IndustryProject): Net[] {
  const parent = new Map<string, string>();
  const find = (k: string): string => { let r = k; while ((parent.get(r) ?? r) !== r) r = parent.get(r)!; parent.set(k, r); return r; };
  const union = (a: string, b: string) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  const refs = new Map<string, TerminalRef>();
  const add = (r: TerminalRef) => { refs.set(refKey(r), r); if (!parent.has(refKey(r))) parent.set(refKey(r), refKey(r)); };
  for (const c of p.connections) { add(c.a); add(c.b); union(refKey(c.a), refKey(c.b)); }
  for (const e of p.entities) for (const [x, y] of shapeOf(e.definitionId).bridges ?? []) {
    const a = {entityId: e.id, terminalId: x}, b = {entityId: e.id, terminalId: y};
    if (refs.has(refKey(a)) || refs.has(refKey(b))) { add(a); add(b); union(refKey(a), refKey(b)); }
  }
  const groups = new Map<string, Net>();
  for (const [k, r] of refs) { const root = find(k); const g = groups.get(root) ?? {id: '', terminals: [], connections: []}; g.terminals.push(r); groups.set(root, g); }
  for (const c of p.connections) groups.get(find(refKey(c.a)))?.connections.push(c.id);
  return [...groups.values()].map((n, i) => ({...n, id: `N${i + 1}`, terminals: n.terminals.sort((a, b) => refKey(a).localeCompare(refKey(b)))}));
}

/** Evalúa todas las conexiones: errores, redes y estado de cada cable. El estado se deriva siempre del proyecto, nunca se arrastra. */
export function evaluate(p: IndustryProject): Evaluation {
  const nets = buildNets(p), issues: Issue[] = [], reasons: Record<string, string[]> = {};
  const flag = (issue: Issue) => { issues.push(issue); for (const id of issue.connectionIds) (reasons[id] ??= []).push(issue.message); };
  const count = new Map<string, number>();
  for (const c of p.connections) for (const r of [c.a, c.b]) count.set(refKey(r), (count.get(refKey(r)) ?? 0) + 1);

  for (const c of p.connections) {
    const da = terminalDef(p, c.a), db = terminalDef(p, c.b);
    for (const [r, d] of [[c.a, da], [c.b, db]] as const) if (!d) flag({severity: 'error', code: 'unknown-terminal', message: `El terminal ${label(p, r)} no existe en esa pieza.`, connectionIds: [c.id], entityIds: [r.entityId]});
    if (da && db) {
      if ((da.kind === 'earth') !== (db.kind === 'earth')) flag({severity: 'error', code: 'earth-mix', message: `La tierra no se une con ${da.kind === 'earth' ? label(p, c.b) : label(p, c.a)}: solo con otra tierra.`, connectionIds: [c.id], entityIds: [c.a.entityId, c.b.entityId]});
      if ((da.kind === 'pipe') !== (db.kind === 'pipe')) flag({severity: 'error', code: 'pipe-mix', message: 'Una conexión de proceso (tubería) no se une con un terminal eléctrico.', connectionIds: [c.id], entityIds: [c.a.entityId, c.b.entityId]});
    }
    for (const r of [c.a, c.b]) if ((count.get(refKey(r)) ?? 0) > MAX_WIRES_PER_TERMINAL) flag({severity: 'warning', code: 'wire-limit', message: `${label(p, r)} tiene más de ${MAX_WIRES_PER_TERMINAL} cables (límite didáctico).`, connectionIds: [c.id], entityIds: [r.entityId]});
  }

  // Uniones imposibles dentro de una misma red (sin importar por cuántos cables o puentes pasen).
  for (const net of nets) {
    const roles = new Map<string, TerminalRef>();
    for (const r of net.terminals) { const role = terminalDef(p, r)?.role; if (role && !roles.has(role)) roles.set(role, r); }
    const pair = (x: string, y: string, what: string) => { const a = roles.get(x), b = roles.get(y); if (a && b) flag({severity: 'error', code: 'short-circuit', message: `${what}: ${label(p, a)} y ${label(p, b)} quedan en la misma red (${net.id}).`, connectionIds: net.connections, entityIds: [a.entityId, b.entityId]}); };
    pair('line', 'neutral', 'Cortocircuito entre línea y neutro'); pair('positive', 'negative', 'Cortocircuito entre positivo y negativo');
    const ground = roles.get('ground');
    if (ground) for (const other of ['line', 'neutral', 'positive', 'negative']) { const o = roles.get(other); if (o) flag({severity: 'error', code: 'earth-mix', message: `La tierra ${label(p, ground)} quedó unida con ${label(p, o)} (${net.id}).`, connectionIds: net.connections, entityIds: [ground.entityId, o.entityId]}); }
  }

  const verified = (r: TerminalRef) => { const e = p.entities.find(x => x.id === r.entityId); return !!e && shapeOf(e.definitionId).status === 'verified'; };
  const status: Record<string, ConnectionStatus> = {};
  for (const c of p.connections) status[c.id] = reasons[c.id]?.length ? 'invalid' : verified(c.a) && verified(c.b) ? 'valid' : 'unverified';
  for (const id of Object.keys(reasons)) reasons[id] = [...new Set(reasons[id])];
  return {nets, issues, status, reasons};
}

/** Copia del proyecto con el estado guardado de cada conexión al día. */
export function withStatuses(p: IndustryProject): IndustryProject {
  const {status} = evaluate(p);
  return p.connections.every(c => c.status === status[c.id]) ? p : {...p, connections: p.connections.map((c): Connection => ({...c, status: status[c.id]}))};
}

/** Ruta visual del cable: sale hacia arriba de cada terminal y cruza en alto. Solo presentación. */
export function cableRoute(p: IndustryProject, c: Connection): Vec3[] | null {
  const a = terminalWorld(p, c.a), b = terminalWorld(p, c.b);
  if (!a || !b) return null;
  if (c.route?.length) return [a, ...c.route, b];
  const lift = 0.04 + Math.min(0.15, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 0.15);
  return [a, [a[0], a[1] + 0.03, a[2]], [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2], [b[0], b[1] + 0.03, b[2]], b];
}
