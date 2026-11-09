// PLC genérico del tablero de Agro (Fase 5). Puro: se prueba en Node.
//
// Reutiliza de Industria el programa en escalera (`Rung`, `Contact`) y el motor de escaneo (`scanStep`: contactos NA/NC en serie y en paralelo,
// bobinas out/set/reset, temporizador ton y contador ctu/ctr). Lo que cambia es el DIRECCIONAMIENTO: direcciones fijas «estilo Delta»
// (X entradas, Y salidas, M marcas, T temporizadores, C contadores). Es una convención de nombres para enseñar; NO emula ningún PLC real
// ni sus rangos, tiempos de escaneo o instrucciones.
import {defaultPreset, rungFlow, scanStep, type ScanState} from '../../industria/plc/program.ts';
import {COIL_MODES, MAX_PRESET, type CoilMode, type Contact, type Rung} from '../../industria/model/types.ts';
import {newId} from '../model/defaults.ts';
import {LIMITS, type AgroProgram, type AgroWidget, type PropValue, type Result} from '../model/types.ts';

export {rungFlow, scanStep};
export const EMPTY_PROGRAM: AgroProgram = {rungs: [], hmi: []};

/** Direcciones disponibles, en el orden de los bits del estado guardado. */
const GROUPS = [['X', 4], ['Y', 4], ['M', 16], ['T', 8], ['C', 4]] as const;
export const ADDRESSES: readonly string[] = GROUPS.flatMap(([p, n]) => Array.from({length: n}, (_, i) => `${p}${i}`));
const BIT = new Map(ADDRESSES.map((a, i) => [a, i]));
export const isAddress = (tag: string): boolean => BIT.has(tag);
export const addressKind = (tag: string): 'input' | 'output' | 'memory' | 'timer' | 'counter' | null => { const k = tag[0]; return !BIT.has(tag) ? null : k === 'X' ? 'input' : k === 'Y' ? 'output' : k === 'M' ? 'memory' : k === 'T' ? 'timer' : 'counter'; };

/** Qué significa cada entrada y salida de este tablero (las entradas las calcula el mundo, no se escriben). */
export const IO_LABELS: Record<string, string> = {
  X0: 'Suelo seco (la sonda marca menos agua útil que el umbral «seco»)',
  X1: 'Suelo húmedo (la sonda marca más agua útil que el umbral «húmedo»)',
  X2: 'Dentro de la franja horaria de riego',
  X3: 'Reservada (siempre apagada)',
  Y0: 'Contactor de la bomba (en modo automático da paso a la energía)',
  Y1: 'Piloto de riego',
  Y2: 'Reservada', Y3: 'Reservada',
};
export const addressLabel = (tag: string): string => IO_LABELS[tag] ?? (tag[0] === 'M' ? 'Marca interna' : tag[0] === 'T' ? 'Temporizador (bit de cumplido)' : tag[0] === 'C' ? 'Contador (bit de cumplido)' : tag);

// ── Estado en ejecución (vive en el estado de la pieza, fuera del historial) ───
export type Runtime = {values: Record<string, boolean>; scan: ScanState};
export const RUNTIME_KEYS = ['plcBits', 'plcAcc', 'plcCnt'] as const;
export const RUNTIME_STATE = {plcBits: 0, plcAcc: '', plcCnt: ''} as const;

const num = (v: PropValue | undefined): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** ¿Está activa la dirección `tag` en el estado guardado de un tablero? */
export const bitOn = (state: Record<string, PropValue>, tag: string): boolean => { const i = BIT.get(tag); return i !== undefined && Math.floor(Math.max(0, num(state.plcBits)) / 2 ** i) % 2 === 1; };

/** Estado en ejecución tras cambiar el programa: salidas, temporizadores y contadores parten de cero (un PLC real también se detiene al recargar); las marcas M (p. ej. el interruptor «Riego automático» de la pantalla) se conservan si hay programa. */
export function resetRuntime(state: Record<string, PropValue>, keepMemory: boolean): Record<(typeof RUNTIME_KEYS)[number], PropValue> {
  let bits = 0; if (keepMemory) for (const a of ADDRESSES) if (a[0] === 'M' && bitOn(state, a)) bits += 2 ** BIT.get(a)!;
  return {plcBits: bits, plcAcc: '', plcCnt: ''};
}

/** Lee las variables y el estado de temporizadores y contadores guardados en la pieza. */
export function readRuntime(state: Record<string, PropValue>, program: AgroProgram): Runtime {
  const bits = Math.max(0, Math.floor(num(state.plcBits))), values: Record<string, boolean> = {};
  ADDRESSES.forEach((a, i) => { if (Math.floor(bits / 2 ** i) % 2 === 1) values[a] = true; });
  const timers: Record<string, number> = {}, counters: Record<string, {n: number; prev: boolean}> = {};
  if (typeof state.plcAcc === 'string' && state.plcAcc) for (const part of state.plcAcc.split(';')) { const [i, ms] = part.split(':'), r = program.rungs[Number(i)]; if (r && Number.isFinite(Number(ms))) timers[r.id] = Number(ms); }
  if (typeof state.plcCnt === 'string' && state.plcCnt) for (const part of state.plcCnt.split(';')) { const [tag, n, prev] = part.split(':'); if (isAddress(tag) && Number.isFinite(Number(n))) counters[tag] = {n: Number(n), prev: prev === '1'}; }
  return {values, scan: {timers, counters}};
}

/** Empaqueta variables y estado de escaneo en las tres claves del estado de la pieza. */
export function writeRuntime(program: AgroProgram, rt: Runtime): Record<(typeof RUNTIME_KEYS)[number], PropValue> {
  let bits = 0; for (const [a, v] of Object.entries(rt.values)) if (v) { const i = BIT.get(a); if (i !== undefined) bits += 2 ** i; }
  const acc = program.rungs.flatMap((r, i) => (rt.scan.timers[r.id] ? [`${i}:${Math.round(rt.scan.timers[r.id])}`] : [])).join(';');
  const cnt = Object.entries(rt.scan.counters).filter(([, c]) => c.n > 0 || c.prev).map(([tag, c]) => `${tag}:${c.n}:${c.prev ? 1 : 0}`).join(';');
  return {plcBits: bits, plcAcc: acc, plcCnt: cnt};
}

// ── Edición (cada operación devuelve un programa nuevo o el motivo del rechazo) ──
const ok = (value: AgroProgram): Result<AgroProgram> => ({ok: true, value});
const fail = (error: string): Result<AgroProgram> => ({ok: false, error});
const BAD_TAG = (tag: string): string => `«${tag}» no es una dirección válida. Usa X0–X3, Y0–Y3, M0–M15, T0–T7 o C0–C3.`;

export function validateRung(r: Rung): string | null {
  if (!r || typeof r.id !== 'string' || !r.coil || !Array.isArray(r.branches)) return 'La línea no tiene el formato esperado.';
  if (!isAddress(r.coil.tag)) return BAD_TAG(r.coil.tag);
  if (addressKind(r.coil.tag) === 'input') return `La bobina escribe «${r.coil.tag}», que es una entrada: la calcula el mundo.`;
  if (!COIL_MODES.includes(r.coil.mode)) return `Modo de bobina desconocido: «${r.coil.mode}».`;
  if (r.branches.length < 1 || r.branches.length > 4) return 'Una línea admite de 1 a 4 ramas en paralelo.';
  for (const b of r.branches) {
    if (!Array.isArray(b) || b.length > 6) return 'Una rama admite hasta 6 contactos.';
    for (const c of b) if (!c || !isAddress(c.tag)) return BAD_TAG(String(c?.tag));
  }
  const needs = r.coil.mode === 'ton' || r.coil.mode === 'ctu';
  if (needs) {
    const max = MAX_PRESET[r.coil.mode as 'ton' | 'ctu'];
    if (!(Number.isInteger(r.coil.preset) && (r.coil.preset as number) >= 1 && (r.coil.preset as number) <= max)) return r.coil.mode === 'ton' ? `El tiempo debe ser un número entero de milisegundos entre 1 y ${max}.` : `La cuenta debe ser un entero entre 1 y ${max}.`;
    if (r.coil.mode === 'ton' && addressKind(r.coil.tag) !== 'timer' && addressKind(r.coil.tag) !== 'memory') return 'Un temporizador escribe una dirección T o M.';
    if (r.coil.mode === 'ctu' && addressKind(r.coil.tag) !== 'counter' && addressKind(r.coil.tag) !== 'memory') return 'Un contador escribe una dirección C o M.';
  }
  return null;
}

export function validateProgram(p: AgroProgram): string | null {
  if (!p || !Array.isArray(p.rungs) || !Array.isArray(p.hmi)) return 'El programa no tiene el formato esperado.';
  if (p.rungs.length > LIMITS.rungs) return `Un programa admite hasta ${LIMITS.rungs} líneas.`;
  if (p.hmi.length > LIMITS.widgets) return `La pantalla admite hasta ${LIMITS.widgets} widgets.`;
  const ids = new Set<string>();
  for (const [i, r] of p.rungs.entries()) { const bad = validateRung(r); if (bad) return `Línea ${i + 1}: ${bad}`; if (ids.has(r.id)) return `Línea ${i + 1}: id repetido.`; ids.add(r.id); }
  for (const w of p.hmi) {
    if (!w || typeof w.id !== 'string' || !['lamp', 'switch', 'label'].includes(w.kind) || typeof w.label !== 'string' || w.label.length > LIMITS.label) return 'Un widget de la pantalla no es válido.';
    if (w.kind !== 'label') { if (!w.tag || !isAddress(w.tag)) return `El widget «${w.label}» necesita una dirección válida.`; if (w.kind === 'switch' && addressKind(w.tag) !== 'memory') return `El interruptor «${w.label}» escribe una marca M, no «${w.tag}».`; }
  }
  return null;
}

const upd = (p: AgroProgram, rungs: Rung[]): Result<AgroProgram> => { const next = {...p, rungs}; const bad = validateProgram(next); return bad ? fail(bad) : ok(next); };
const mapRung = (p: AgroProgram, rungId: string, f: (r: Rung) => Rung): Result<AgroProgram> => (p.rungs.some(r => r.id === rungId) ? upd(p, p.rungs.map(r => (r.id === rungId ? f(r) : r))) : fail('La línea no existe.'));

export function addRung(p: AgroProgram, coil: {tag: string; mode?: CoilMode; preset?: number}, contacts: Contact[] = [], comment?: string): Result<AgroProgram> {
  if (p.rungs.length >= LIMITS.rungs) return fail(`Un programa admite hasta ${LIMITS.rungs} líneas.`);
  const mode = coil.mode ?? 'out', needs = mode === 'ton' || mode === 'ctu';
  const rung: Rung = {id: newId('r'), branches: [contacts.map(c => ({...c}))], coil: {tag: coil.tag, mode, ...(needs ? {preset: coil.preset ?? defaultPreset(mode)} : {})}, ...(comment ? {comment} : {})};
  const bad = validateRung(rung); if (bad) return fail(bad);
  return upd(p, [...p.rungs, rung]);
}
export const removeRung = (p: AgroProgram, rungId: string): Result<AgroProgram> => (p.rungs.some(r => r.id === rungId) ? upd(p, p.rungs.filter(r => r.id !== rungId)) : fail('La línea no existe.'));
export const setCoil = (p: AgroProgram, rungId: string, coil: {tag: string; mode: CoilMode; preset?: number}): Result<AgroProgram> => {
  const needs = coil.mode === 'ton' || coil.mode === 'ctu';
  return mapRung(p, rungId, r => ({...r, coil: {tag: coil.tag, mode: coil.mode, ...(needs ? {preset: coil.preset ?? defaultPreset(coil.mode)} : {})}}));
};
export const addBranch = (p: AgroProgram, rungId: string) => mapRung(p, rungId, r => ({...r, branches: [...r.branches, []]}));
export const removeBranch = (p: AgroProgram, rungId: string, branch: number) => mapRung(p, rungId, r => ({...r, branches: r.branches.length <= 1 ? r.branches : r.branches.filter((_, i) => i !== branch)}));
export const addContact = (p: AgroProgram, rungId: string, branch: number, contact: Contact) => mapRung(p, rungId, r => ({...r, branches: r.branches.map((b, i) => (i === branch ? [...b, {...contact}] : b))}));
export const removeContact = (p: AgroProgram, rungId: string, branch: number, index: number) => mapRung(p, rungId, r => ({...r, branches: r.branches.map((b, i) => (i === branch ? b.filter((_, k) => k !== index) : b))}));
export const toggleContact = (p: AgroProgram, rungId: string, branch: number, index: number) => mapRung(p, rungId, r => ({...r, branches: r.branches.map((b, i) => (i === branch ? b.map((c, k) => (k === index ? (c.nc ? {tag: c.tag} : {...c, nc: true}) : c)) : b)) }));

export function addWidget(p: AgroProgram, w: Omit<AgroWidget, 'id'>): Result<AgroProgram> { const next = {...p, hmi: [...p.hmi, {id: newId('w'), ...w}]}; const bad = validateProgram(next); return bad ? fail(bad) : ok(next); }
export const removeWidget = (p: AgroProgram, id: string): Result<AgroProgram> => (p.hmi.some(w => w.id === id) ? ok({...p, hmi: p.hmi.filter(w => w.id !== id)}) : fail('El widget no existe.'));

export type ProgramIssue = {severity: 'error' | 'warning'; message: string; rungId?: string};
/** Avisos para mostrar al estudiante (la validación dura es `validateProgram`). */
export function checkProgram(p: AgroProgram): ProgramIssue[] {
  const issues: ProgramIssue[] = [];
  p.rungs.forEach((r, i) => {
    const where = `Línea ${i + 1}`;
    if (r.branches.every(b => b.length === 0)) issues.push({severity: 'warning', rungId: r.id, message: `${where}: no tiene contactos, así que la bobina queda siempre activa.`});
    if (r.coil.tag === 'X3') issues.push({severity: 'warning', rungId: r.id, message: `${where}: X3 está reservada y siempre apagada.`});
  });
  if (p.rungs.length > 0 && !p.rungs.some(r => r.coil.tag === 'Y0')) issues.push({severity: 'warning', message: 'Ninguna línea escribe Y0: en modo automático la bomba nunca recibirá energía.'});
  return issues;
}

/** Programa de ejemplo: riego por humedad con histéresis y franja horaria. */
export function exampleProgram(): AgroProgram {
  const mk = (branches: Contact[][], coil: Rung['coil'], comment: string): Rung => ({id: newId('r'), branches, coil, comment});
  return {
    rungs: [
      mk([[{tag: 'X0'}, {tag: 'X2'}, {tag: 'M0'}]], {tag: 'Y0', mode: 'set'}, 'Arranca la bomba si el suelo está seco, es la hora de riego y el automático está habilitado.'),
      mk([[{tag: 'X1'}], [{tag: 'X2', nc: true}], [{tag: 'M0', nc: true}]], {tag: 'Y0', mode: 'reset'}, 'La detiene al llegar a suelo húmedo, al terminar la franja horaria o al deshabilitar el automático.'),
      mk([[{tag: 'Y0'}]], {tag: 'Y1', mode: 'out'}, 'Piloto de riego.'),
    ],
    hmi: [
      {id: newId('w'), kind: 'switch', label: 'Riego automático', tag: 'M0'},
      {id: newId('w'), kind: 'lamp', label: 'Suelo seco', tag: 'X0'},
      {id: newId('w'), kind: 'lamp', label: 'Suelo húmedo', tag: 'X1'},
      {id: newId('w'), kind: 'lamp', label: 'Bomba (Y0)', tag: 'Y0'},
    ],
  };
}
