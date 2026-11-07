// Programa de PLC en escalera: variables, escaneo, comprobación y edición. Puro (sin React): se prueba en Node.
//
// Alcance: lógica booleana de escalera (contactos NA/NC en serie y en paralelo, bobinas de salida, set y reset). No hay temporizadores,
// contadores, números ni otros lenguajes (IEC 61131-3): están fuera de esta fase y no se simulan.
import {bind, unbind} from '../model/commands.ts';
import {newId} from '../model/defaults.ts';
import {LIMITS, MAX_PRESET, TAG_PATTERN, type CoilMode, type Contact, type HmiWidget, type HmiWidgetKind, type IndustryProject, type PlcProgram, type Result, type Rung} from '../model/types.ts';

export const PLC_DEFINITION = 'plc-generico';
export type TagKind = 'input' | 'output' | 'memory';
export type TagInfo = {name: string; kind: TagKind; terminalId?: string};

const ok = (value: IndustryProject): Result<IndustryProject> => ({ok: true, value});
const fail = (error: string): Result<IndustryProject> => ({ok: false, error});
const EMPTY: PlcProgram = {rungs: [], memory: []};
export const programOf = (p: Pick<IndustryProject, 'plc'>, plcId: string): PlcProgram => p.plc[plcId] ?? EMPTY;
export const isPlc = (p: Pick<IndustryProject, 'entities'>, id: string): boolean => p.entities.find(e => e.id === id)?.definitionId === PLC_DEFINITION;
/** DI… son entradas y DO… son salidas (marcado del catálogo genérico). */
export const terminalDirection = (terminalId: string): 'input' | 'output' | null => (/^DI\d+$/.test(terminalId) ? 'input' : /^DO\d+$/.test(terminalId) ? 'output' : null);

/** Variables del PLC: entradas y salidas asociadas a terminales (por `plc-tag`) y marcas internas. */
export function tagsOf(p: IndustryProject, plcId: string): TagInfo[] {
  const bound = p.bindings.filter(b => b.kind === 'plc-tag' && b.entityId === plcId && b.terminalId).map((b): TagInfo => ({name: b.target, kind: terminalDirection(b.terminalId!) === 'output' ? 'output' : 'input', terminalId: b.terminalId}));
  return [...bound, ...programOf(p, plcId).memory.map((name): TagInfo => ({name, kind: 'memory'}))];
}

const usedTags = (program: PlcProgram): Set<string> => new Set(program.rungs.flatMap(r => [r.coil.tag, ...r.branches.flat().map(c => c.tag)]));
const withProgram = (p: IndustryProject, plcId: string, program: PlcProgram): IndustryProject => ({...p, plc: {...p.plc, [plcId]: program}});
const requirePlc = (p: IndustryProject, plcId: string): string | null => (isPlc(p, plcId) ? null : 'El componente no es un PLC.');

/** Asocia un terminal DI/DO a una variable (o la quita con `null`). Los nombres son únicos dentro del PLC. */
export function setTerminalTag(p: IndustryProject, plcId: string, terminalId: string, name: string | null): Result<IndustryProject> {
  const bad = requirePlc(p, plcId); if (bad) return fail(bad);
  if (!terminalDirection(terminalId)) return fail('Solo las entradas DI y las salidas DO se asocian a variables.');
  const current = p.bindings.find(b => b.kind === 'plc-tag' && b.entityId === plcId && b.terminalId === terminalId);
  let next = p;
  if (current) { const u = unbind(next, current.id); if (!u.ok) return u; next = u.value; }
  if (name === null || name === '') {
    if (current && usedTags(programOf(p, plcId)).has(current.target)) return fail(`«${current.target}» se usa en el programa: quítala de las líneas primero.`);
    return ok(next);
  }
  if (!TAG_PATTERN.test(name)) return fail('El nombre de la variable debe empezar con letra o «_» y tener hasta 30 letras, números o «_».');
  if (tagsOf(next, plcId).some(t => t.name === name)) return fail(`Ya existe una variable llamada «${name}» en este PLC.`);
  const b = bind(next, {kind: 'plc-tag', entityId: plcId, terminalId, target: name}); if (!b.ok) return b;
  // Renombrar: el programa y los widgets siguen a la variable.
  const old = current?.target;
  return ok(old && old !== name ? renameTag(b.value, plcId, old, name) : b.value);
}

function renameTag(p: IndustryProject, plcId: string, from: string, to: string): IndustryProject {
  const prog = programOf(p, plcId), swap = (t: string) => (t === from ? to : t);
  return {...p,
    plc: {...p.plc, [plcId]: {memory: prog.memory.map(swap), rungs: prog.rungs.map(r => ({...r, coil: {...r.coil, tag: swap(r.coil.tag)}, branches: r.branches.map(b => b.map(c => ({...c, tag: swap(c.tag)})))}))}},
    hmi: {widgets: p.hmi.widgets.map(w => (w.plcId === plcId && w.tag === from ? {...w, tag: to} : w))}};
}

export function addMemory(p: IndustryProject, plcId: string, name: string): Result<IndustryProject> {
  const bad = requirePlc(p, plcId); if (bad) return fail(bad);
  if (!TAG_PATTERN.test(name)) return fail('El nombre de la variable debe empezar con letra o «_» y tener hasta 30 letras, números o «_».');
  if (tagsOf(p, plcId).some(t => t.name === name)) return fail(`Ya existe una variable llamada «${name}» en este PLC.`);
  const prog = programOf(p, plcId);
  if (prog.memory.length >= LIMITS.memory) return fail(`Un PLC admite hasta ${LIMITS.memory} variables internas.`);
  return ok(withProgram(p, plcId, {...prog, memory: [...prog.memory, name]}));
}

export function removeMemory(p: IndustryProject, plcId: string, name: string): Result<IndustryProject> {
  const prog = programOf(p, plcId);
  if (!prog.memory.includes(name)) return fail('La variable no existe.');
  if (usedTags(prog).has(name)) return fail(`«${name}» se usa en el programa: quítala de las líneas primero.`);
  if (p.hmi.widgets.some(w => w.plcId === plcId && w.tag === name)) return fail(`«${name}» está asociada a un widget de HMI.`);
  return ok(withProgram(p, plcId, {...prog, memory: prog.memory.filter(m => m !== name)}));
}

const rungIn = (prog: PlcProgram, id: string) => prog.rungs.find(r => r.id === id);
const mapRung = (p: IndustryProject, plcId: string, rungId: string, f: (r: Rung) => Rung | string): Result<IndustryProject> => {
  const bad = requirePlc(p, plcId); if (bad) return fail(bad);
  const prog = programOf(p, plcId), r = rungIn(prog, rungId); if (!r) return fail('La línea no existe.');
  const out = f(r); if (typeof out === 'string') return fail(out);
  return ok(withProgram(p, plcId, {...prog, rungs: prog.rungs.map(x => (x.id === rungId ? out : x))}));
};

export function addRung(p: IndustryProject, plcId: string, coil: {tag: string; mode?: CoilMode; preset?: number}, contacts: Contact[] = [], comment?: string): Result<IndustryProject> {
  const bad = requirePlc(p, plcId); if (bad) return fail(bad);
  const prog = programOf(p, plcId);
  if (prog.rungs.length >= LIMITS.rungs) return fail(`Un programa admite hasta ${LIMITS.rungs} líneas.`);
  if (!TAG_PATTERN.test(coil.tag)) return fail('La variable de la bobina no es válida.');
  if (contacts.length > LIMITS.contacts) return fail(`Una rama admite hasta ${LIMITS.contacts} contactos.`);
  const mode = coil.mode ?? 'out', needs = mode === 'ton' || mode === 'ctu', preset = needs ? (coil.preset ?? defaultPreset(mode)) : undefined;
  if (needs && !(Number.isInteger(preset) && (preset as number) >= 1 && (preset as number) <= MAX_PRESET[mode as 'ton' | 'ctu'])) return fail('El valor del temporizador o contador no es válido.');
  const rung: Rung = {id: newId('r'), branches: [contacts.map(c => ({...c}))], coil: {tag: coil.tag, mode, ...(preset !== undefined ? {preset} : {})}, ...(comment ? {comment} : {})};
  return ok(withProgram(p, plcId, {...prog, rungs: [...prog.rungs, rung]}));
}
export function removeRung(p: IndustryProject, plcId: string, rungId: string): Result<IndustryProject> {
  const prog = programOf(p, plcId); if (!rungIn(prog, rungId)) return fail('La línea no existe.');
  return ok(withProgram(p, plcId, {...prog, rungs: prog.rungs.filter(r => r.id !== rungId)}));
}
export const defaultPreset = (mode: CoilMode): number | undefined => (mode === 'ton' ? 3000 : mode === 'ctu' ? 5 : undefined);
export const setCoil = (p: IndustryProject, plcId: string, rungId: string, coil: {tag: string; mode: CoilMode; preset?: number}) => {
  if (!TAG_PATTERN.test(coil.tag)) return fail('La variable de la bobina no es válida.');
  const needs = coil.mode === 'ton' || coil.mode === 'ctu', preset = needs ? (coil.preset ?? defaultPreset(coil.mode)) : undefined;
  if (needs && !(Number.isInteger(preset) && (preset as number) >= 1 && (preset as number) <= MAX_PRESET[coil.mode as 'ton' | 'ctu'])) return fail(coil.mode === 'ton' ? `El tiempo debe ser un número entero de milisegundos entre 1 y ${MAX_PRESET.ton}.` : `El valor de cuenta debe ser un entero entre 1 y ${MAX_PRESET.ctu}.`);
  return mapRung(p, plcId, rungId, r => ({...r, coil: {tag: coil.tag, mode: coil.mode, ...(preset !== undefined ? {preset} : {})}}));
};
export const addBranch = (p: IndustryProject, plcId: string, rungId: string) =>
  mapRung(p, plcId, rungId, r => (r.branches.length >= LIMITS.branches ? `Una línea admite hasta ${LIMITS.branches} ramas en paralelo.` : {...r, branches: [...r.branches, []]}));
export const removeBranch = (p: IndustryProject, plcId: string, rungId: string, branch: number) =>
  mapRung(p, plcId, rungId, r => (r.branches.length <= 1 ? 'Una línea necesita al menos una rama.' : branch < 0 || branch >= r.branches.length ? 'La rama no existe.' : {...r, branches: r.branches.filter((_, i) => i !== branch)}));
export const addContact = (p: IndustryProject, plcId: string, rungId: string, branch: number, contact: Contact) =>
  !TAG_PATTERN.test(contact.tag) ? fail('La variable del contacto no es válida.')
    : mapRung(p, plcId, rungId, r => (branch < 0 || branch >= r.branches.length ? 'La rama no existe.' : r.branches[branch].length >= LIMITS.contacts ? `Una rama admite hasta ${LIMITS.contacts} contactos.` : {...r, branches: r.branches.map((b, i) => (i === branch ? [...b, {...contact}] : b))}));
export const removeContact = (p: IndustryProject, plcId: string, rungId: string, branch: number, index: number) =>
  mapRung(p, plcId, rungId, r => (!r.branches[branch]?.[index] ? 'El contacto no existe.' : {...r, branches: r.branches.map((b, i) => (i === branch ? b.filter((_, k) => k !== index) : b))}));
export const toggleContact = (p: IndustryProject, plcId: string, rungId: string, branch: number, index: number) =>
  mapRung(p, plcId, rungId, r => (!r.branches[branch]?.[index] ? 'El contacto no existe.' : {...r, branches: r.branches.map((b, i) => (i === branch ? b.map((c, k) => (k === index ? (c.nc ? {tag: c.tag} : {...c, nc: true}) : c)) : b))}));

export type ProgramIssue = {severity: 'error' | 'warning'; message: string; rungId?: string};
/** Comprueba el programa: variables sin definir y bobinas que escriben en una entrada. */
export function checkProgram(p: IndustryProject, plcId: string): ProgramIssue[] {
  const tags = new Map(tagsOf(p, plcId).map(t => [t.name, t])), issues: ProgramIssue[] = [];
  programOf(p, plcId).rungs.forEach((r, i) => {
    const where = `Línea ${i + 1}`;
    for (const c of r.branches.flat()) if (!tags.has(c.tag)) issues.push({severity: 'error', rungId: r.id, message: `${where}: la variable «${c.tag}» no está definida (asóciala a un terminal o créala como interna).`});
    const t = tags.get(r.coil.tag);
    if (!t) issues.push({severity: 'error', rungId: r.id, message: `${where}: la bobina escribe «${r.coil.tag}», que no está definida.`});
    else if (t.kind === 'input') issues.push({severity: 'error', rungId: r.id, message: `${where}: la bobina escribe «${r.coil.tag}», que es una entrada.`});
    if (r.branches.every(b => b.length === 0)) issues.push({severity: 'warning', rungId: r.id, message: `${where}: no tiene contactos, así que la bobina queda siempre activa.`});
  });
  for (const w of p.hmi.widgets) if (w.plcId === plcId && (w.kind === 'button' || w.kind === 'switch') && w.tag && tags.get(w.tag)?.kind !== 'memory') issues.push({severity: 'error', message: `El widget «${w.label}» escribe «${w.tag}», que debe ser una variable interna.`});
  return issues;
}

/** Estado que el PLC conserva entre escaneos: acumulado de cada temporizador (ms, por línea) y cuenta de cada contador (por variable, con el estado anterior de su entrada para detectar el flanco). */
export type ScanState = {timers: Record<string, number>; counters: Record<string, {n: number; prev: boolean}>};
export const emptyScanState = (): ScanState => ({timers: {}, counters: {}});

/** Un ciclo de escaneo con temporizadores y contadores. `dt` son los ms transcurridos desde el escaneo anterior (0 = solo se resuelve la lógica, sin avanzar el tiempo). */
export function scanStep(program: PlcProgram, values: Record<string, boolean>, state: ScanState = emptyScanState(), dt = 0): {values: Record<string, boolean>; state: ScanState} {
  const v = {...values}, timers = {...state.timers}, counters = Object.fromEntries(Object.entries(state.counters).map(([k, c]) => [k, {...c}]));
  for (const r of program.rungs) {
    const on = r.branches.some(b => b.every(c => (c.nc ? !v[c.tag] : !!v[c.tag])));
    switch (r.coil.mode) {
      case 'out': v[r.coil.tag] = on; break;
      case 'set': case 'reset': if (on) v[r.coil.tag] = r.coil.mode === 'set'; break;
      case 'ton': { const acc = on ? (timers[r.id] ?? 0) + dt : 0; timers[r.id] = acc; v[r.coil.tag] = on && acc >= (r.coil.preset ?? Infinity); break; }
      case 'ctu': { const c = counters[r.coil.tag] ?? {n: 0, prev: false}; if (on && !c.prev) c.n += 1; c.prev = on; counters[r.coil.tag] = c; v[r.coil.tag] = c.n >= (r.coil.preset ?? Infinity); break; }
      case 'ctr': if (on) { counters[r.coil.tag] = {n: 0, prev: counters[r.coil.tag]?.prev ?? false}; v[r.coil.tag] = false; } break;
    }
  }
  return {values: v, state: {timers, counters}};
}
/** Escaneo sin tiempo (compatibilidad): los temporizadores nunca llegan a cumplirse. */
export function scan(program: PlcProgram, values: Record<string, boolean>): Record<string, boolean> { return scanStep(program, values).values; }
/** Conducción de cada rama y de la línea con los valores actuales (para resaltar en pantalla). */
export const rungFlow = (r: Rung, v: Record<string, boolean>): {branches: boolean[][]; on: boolean} => {
  const branches = r.branches.map(b => b.map(c => (c.nc ? !v[c.tag] : !!v[c.tag])));
  return {branches, on: branches.some(b => b.every(Boolean))};
};

// — HMI —
const widgetOk = (p: IndustryProject, w: Omit<HmiWidget, 'id'>): string | null => {
  if (w.label.length > LIMITS.label) return 'El texto del widget es demasiado largo.';
  if (w.kind !== 'label') {
    if (!w.plcId || !isPlc(p, w.plcId)) return 'Elige el PLC al que se asocia el widget.';
    if (!w.tag || !TAG_PATTERN.test(w.tag)) return 'Elige una variable para el widget.';
    const info = tagsOf(p, w.plcId).find(t => t.name === w.tag);
    if (!info) return `La variable «${w.tag}» no existe en ese PLC.`;
    if ((w.kind === 'button' || w.kind === 'switch') && info.kind !== 'memory') return 'Un botón o interruptor de HMI escribe una variable interna (no una entrada ni una salida física).';
  }
  return null;
};
export function addWidget(p: IndustryProject, w: Omit<HmiWidget, 'id'>): Result<IndustryProject> {
  if (p.hmi.widgets.length >= LIMITS.widgets) return fail(`La pantalla admite hasta ${LIMITS.widgets} widgets.`);
  const bad = widgetOk(p, w); if (bad) return fail(bad);
  return ok({...p, hmi: {widgets: [...p.hmi.widgets, {id: newId('w'), ...w}]}});
}
export function updateWidget(p: IndustryProject, id: string, patch: Partial<Omit<HmiWidget, 'id'>>): Result<IndustryProject> {
  const cur = p.hmi.widgets.find(w => w.id === id); if (!cur) return fail('El widget no existe.');
  const next = {...cur, ...patch}, {id: _id, ...rest} = next; const bad = widgetOk(p, rest); if (bad) return fail(bad);
  return ok({...p, hmi: {widgets: p.hmi.widgets.map(w => (w.id === id ? next : w))}});
}
export function removeWidget(p: IndustryProject, id: string): Result<IndustryProject> {
  return p.hmi.widgets.some(w => w.id === id) ? ok({...p, hmi: {widgets: p.hmi.widgets.filter(w => w.id !== id)}}) : fail('El widget no existe.');
}
export const widgetKindLabel: Record<HmiWidgetKind, string> = {lamp: 'Piloto', button: 'Pulsador', switch: 'Interruptor', label: 'Texto'};
