// Simulación lógica de Industria (fase 6). Puro: se prueba en Node.
//
// QUÉ ES: propaga presencia de potencial desde las fuentes por los cables y los contactos cerrados, y deduce estados (contactor excitado,
// piloto encendido, motor alimentado). QUÉ NO ES: un cálculo eléctrico. No hay corrientes, caídas de tensión, arranques ni protecciones.
// Las piezas del catálogo son genéricas, así que se asumen reglas didácticas (se listan en SIM_ASSUMPTIONS). Los valores de tensión que muestra
// el multímetro son los que quien simula configuró en la fuente; no son de un equipo real.
import {shapeOf} from '../build/shapes.ts';
import type {IndustryProject, TerminalRef} from '../model/types.ts';
import {allTerminals, refKey} from '../wiring/engine.ts';
import {emptyScanState, programOf, scanStep, tagsOf, PLC_DEFINITION, type ScanState} from '../plc/program.ts';

export const SIM_ASSUMPTIONS = [
  'Un contactor se excita con cualquier tensión aplicada entre A1 y A2 (pieza genérica sin tensión de bobina).',
  'La fuente CC genera su salida si recibe tensión entre L y N; la red trifásica siempre está presente al ejecutar.',
  'El motor gira si sus tres bornes U1, V1 y W1 reciben tres fases distintas de la misma red; no se modela el sentido ni el arranque.',
  'No hay protecciones: un cortocircuito se avisa pero no dispara ningún interruptor.',
] as const;

/** Mandos del usuario: interruptores cerrados y pulsadores mantenidos, por id de entidad. */
export type SimInputs = Record<string, boolean>;
/** `trip`: relé térmico (se dispara a mano para practicar; no se modela la sobrecarga). */
export type Operable = {kind: 'breaker' | 'pushbutton' | 'trip'; label: string};

export const operableKind = (definitionId: string): Operable['kind'] | null =>
  definitionId === 'breaker-1p' || definitionId === 'breaker-3p' ? 'breaker' : definitionId === 'pulsador-na' || definitionId === 'pulsador-nc' ? 'pushbutton' : definitionId === 'rele-termico' ? 'trip' : null;

export const CLOSED_PAIRS: Record<string, [string, string][]> = {
  'breaker-1p': [['1', '2']], 'breaker-3p': [['1', '2'], ['3', '4'], ['5', '6']],
  'contactor-3p': [['1', '2'], ['3', '4'], ['5', '6'], ['13', '14']], 'pulsador-na': [['3', '4']], 'pulsador-nc': [['1', '2']],
  'rele-termico': [['1', '2'], ['3', '4'], ['5', '6'], ['95', '96']],
};
const PHASES = ['L1', 'L2', 'L3'];

export type Reading = {kind: 'continuity' | 'voltage'; ok: boolean; text: string; value?: number; unit?: string};
export type SimResult = {
  /** Terminales con potencial de una fuente activa en su red. */
  live: Set<string>;
  /** Cables cuya red tiene potencial. */
  liveConnections: Set<string>;
  /** Contactores excitados, pilotos encendidos, motores alimentados, aparatos con contactos cerrados. */
  energized: Record<string, boolean>;
  /** Por PLC: si está alimentado y el valor de cada variable tras el último escaneo. */
  plc: Record<string, {powered: boolean; tags: Record<string, boolean>; state: ScanState}>;
  closed: Record<string, boolean>;
  warnings: string[];
  converged: boolean;
  measure(a: TerminalRef, b: TerminalRef, mode: 'continuity' | 'voltage'): Reading;
  sameNet(a: TerminalRef, b: TerminalRef): boolean;
  /** ¿Hay diferencia de potencial de una fuente activa entre los dos terminales? */
  hasPotential(a: TerminalRef, b: TerminalRef): boolean;
};

/** `previous` = estados de la evaluación anterior (contactores excitados y fuentes activas): permite que un contacto de sello mantenga la bobina, como en un circuito real. */
export function simulate(p: IndustryProject, inputs: SimInputs, previous: Record<string, boolean> = {}, previousPlc: Record<string, {tags: Record<string, boolean>; state?: ScanState}> = {}, dt = 0): SimResult {
  const terms = allTerminals(p), keys = terms.map(refKey);
  const defOf = new Map(p.entities.map(e => [e.id, e.definitionId]));
  const openWire = new Set(p.faults.filter(f => f.kind === 'wire-open').map(f => f.connectionId));
  const hasFault = (kind: string, id: string) => p.faults.some(f => f.kind === kind && f.entityId === id);
  const labelOf = (id: string) => p.entities.find(e => e.id === id)?.label ?? id;
  let coil: Record<string, boolean> = Object.fromEntries(p.entities.filter(e => e.definitionId === 'contactor-3p' && previous[e.id]).map(e => [e.id, true])), dc = new Set<string>(p.entities.filter(e => e.definitionId === 'fuente-cc' && previous[e.id]).map(e => e.id));
  let parent = new Map<string, string>(), tags = new Map<string, string[]>();
  const find = (k: string): string => { let r = k; while (parent.get(r) !== r) r = parent.get(r)!; parent.set(k, r); return r; };
  let closed: Record<string, boolean> = {};
  let converged = false;
  let plcVals: Record<string, Record<string, boolean>> = Object.fromEntries(p.entities.filter(e => e.definitionId === PLC_DEFINITION).map(e => [e.id, {...(previousPlc[e.id]?.tags ?? {})}]));
  // Un PLC alimentado en la evaluación anterior conserva sus variables (si no, `previousPlc` lo deja vacío).
  let plcState: Record<string, ScanState> = Object.fromEntries(p.entities.filter(e => e.definitionId === PLC_DEFINITION).map(e => [e.id, previousPlc[e.id]?.state ?? emptyScanState()]));
  let plcPowered: Record<string, boolean> = Object.fromEntries(Object.entries(plcVals).map(([id, v]) => [id, Object.keys(v).length > 0]));

  const livePair = (ra: string, rb: string): {entity: string; a: string; b: string} | null => {
    for (const ta of tags.get(ra) ?? []) for (const tb of tags.get(rb) ?? []) {
      const [ea, xa] = [ta.slice(0, ta.indexOf(':')), ta.slice(ta.indexOf(':') + 1)], [eb, xb] = [tb.slice(0, tb.indexOf(':')), tb.slice(tb.indexOf(':') + 1)];
      if (ea === eb && xa !== xb) return {entity: ea, a: xa, b: xb};
    }
    return null;
  };

  for (let iter = 0; iter < 20; iter++) {
    // 1) contactos cerrados según los mandos y las bobinas
    closed = {};
    const pairs: [string, string][] = [];
    for (const e of p.entities) {
      const kind = operableKind(e.definitionId), isClosed = e.definitionId === 'contactor-3p' ? !!coil[e.id] : e.definitionId === 'pulsador-nc' || e.definitionId === 'rele-termico' ? !inputs[e.id] : kind ? !!inputs[e.id] : false;
      if (isClosed) { closed[e.id] = true; if (!hasFault('contact-open', e.id)) for (const [x, y] of CLOSED_PAIRS[e.definitionId] ?? []) pairs.push([`${e.id}:${x}`, `${e.id}:${y}`]); }
    }
    // 2) redes: cables + puentes + contactos cerrados
    parent = new Map(keys.map(k => [k, k]));
    const union = (a: string, b: string) => { if (parent.has(a) && parent.has(b)) { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); } };
    for (const c of p.connections) if (!openWire.has(c.id)) union(refKey(c.a), refKey(c.b));
    for (const e of p.entities) for (const [x, y] of shapeOf(e.definitionId).bridges ?? []) union(`${e.id}:${x}`, `${e.id}:${y}`);
    for (const e of p.entities) if (e.definitionId === PLC_DEFINITION && plcPowered[e.id]) for (const t of tagsOf(p, e.id)) if (t.kind === 'output' && t.terminalId && plcVals[e.id][t.name]) pairs.push([`${e.id}:${t.terminalId}`, `${e.id}:L+`]); // salida activa = DO unido a L+ (asunción: salida tipo fuente)
    for (const [a, b] of pairs) union(a, b);
    // 3) potenciales emitidos
    tags = new Map();
    const emit = (k: string) => { if (parent.has(k)) { const r = find(k); tags.set(r, [...(tags.get(r) ?? []), k]); } };
    for (const e of p.entities) {
      if (e.definitionId === 'red-3f') for (const t of [...PHASES, 'N']) emit(`${e.id}:${t}`);
      if (e.definitionId === 'fuente-cc' && dc.has(e.id)) { emit(`${e.id}:L+`); emit(`${e.id}:M`); }
    }
    // 4) estados que dependen de los potenciales
    const nextDc = new Set<string>(), nextCoil: Record<string, boolean> = {};
    for (const e of p.entities) {
      if (e.definitionId === 'fuente-cc' && livePair(find(`${e.id}:L`), find(`${e.id}:N`)) && !tags.get(find(`${e.id}:L`))?.some(t => t.startsWith(`${e.id}:`))) nextDc.add(e.id);
      if (e.definitionId === 'contactor-3p' && !hasFault('coil-open', e.id) && livePair(find(`${e.id}:A1`), find(`${e.id}:A2`))) nextCoil[e.id] = true;
    }
    const nextPlc: Record<string, Record<string, boolean>> = {}, nextPowered: Record<string, boolean> = {}, nextState: Record<string, ScanState> = {};
    for (const e of p.entities) {
      if (e.definitionId !== PLC_DEFINITION) continue;
      const powered = !!livePair(find(`${e.id}:L+`), find(`${e.id}:M`));
      nextPowered[e.id] = powered;
      if (!powered) { nextPlc[e.id] = {}; nextState[e.id] = emptyScanState(); continue; }
      let v = {...plcVals[e.id]};
      for (const t of tagsOf(p, e.id)) if (t.kind === 'input' && t.terminalId) v[t.name] = !!livePair(find(`${e.id}:${t.terminalId}`), find(`${e.id}:M`));
      for (const w of p.hmi.widgets) if (w.plcId === e.id && w.tag && (w.kind === 'button' || w.kind === 'switch')) v[w.tag] = !!inputs[`hmi:${w.id}`];
      const scanned = scanStep(programOf(p, e.id), v, plcState[e.id], iter === 0 ? dt : 0); // el tiempo avanza una sola vez por evaluación
      v = scanned.values; nextState[e.id] = scanned.state;
      nextPlc[e.id] = v;
    }
    const plcSame = JSON.stringify(nextPlc) === JSON.stringify(plcVals) && JSON.stringify(nextPowered) === JSON.stringify(plcPowered) && JSON.stringify(nextState) === JSON.stringify(plcState);
    plcVals = nextPlc; plcPowered = nextPowered; plcState = nextState;
    const same = plcSame && nextDc.size === dc.size && [...nextDc].every(x => dc.has(x)) && Object.keys(nextCoil).length === Object.keys(coil).length && Object.keys(nextCoil).every(k => coil[k]);
    dc = nextDc; coil = nextCoil;
    if (same) { converged = true; break; }
  }

  const energized: Record<string, boolean> = {};
  for (const e of p.entities) {
    if (e.definitionId === 'contactor-3p') energized[e.id] = !!coil[e.id];
    if (e.definitionId === 'piloto') energized[e.id] = !hasFault('lamp-open', e.id) && !!livePair(find(`${e.id}:X1`), find(`${e.id}:X2`));
    if (e.definitionId === 'fuente-cc') energized[e.id] = dc.has(e.id);
    if (e.definitionId === PLC_DEFINITION) energized[e.id] = !!plcPowered[e.id];
    if (e.definitionId === 'motor-3p') {
      const seen = new Set<string>();
      for (const t of ['U1', 'V1', 'W1']) for (const tag of tags.get(find(`${e.id}:${t}`)) ?? []) { const [src, term] = [tag.slice(0, tag.indexOf(':')), tag.slice(tag.indexOf(':') + 1)]; if (defOf.get(src) === 'red-3f' && PHASES.includes(term)) seen.add(`${src}:${term}`); }
      const srcs = new Set([...seen].map(s => s.split(':')[0]));
      energized[e.id] = !hasFault('winding-open', e.id) && seen.size === 3 && srcs.size === 1 && ['U1', 'V1', 'W1'].every(t => (tags.get(find(`${e.id}:${t}`)) ?? []).some(x => defOf.get(x.slice(0, x.indexOf(':'))) === 'red-3f' && PHASES.includes(x.slice(x.indexOf(':') + 1))));
    }
  }

  const warnings: string[] = [];
  if (!converged) warnings.push('La simulación no se estabilizó (un contactor se auto-conmuta): revisa el circuito de mando.');
  for (const [root, list] of tags) {
    const bySource = new Map<string, string[]>();
    for (const t of list) { const i = t.indexOf(':'); bySource.set(t.slice(0, i), [...(bySource.get(t.slice(0, i)) ?? []), t.slice(i + 1)]); }
    for (const [src, outs] of bySource) if (outs.length > 1) warnings.push(`Cortocircuito en la simulación: ${outs.map(o => `${labelOf(src)}.${o}`).join(' y ')} quedan en la misma red (${root.replace(':', '·')}). Las protecciones no están modeladas.`);
  }

  const live = new Set(keys.filter(k => tags.has(find(k))));
  const liveConnections = new Set(p.connections.filter(c => !openWire.has(c.id) && tags.has(find(refKey(c.a)))).map(c => c.id));
  const hasPotential = (a: TerminalRef, b: TerminalRef) => parent.has(refKey(a)) && parent.has(refKey(b)) && !!livePair(find(refKey(a)), find(refKey(b)));
  const sameNet = (a: TerminalRef, b: TerminalRef) => parent.has(refKey(a)) && parent.has(refKey(b)) && find(refKey(a)) === find(refKey(b));

  const measure = (a: TerminalRef, b: TerminalRef, mode: 'continuity' | 'voltage'): Reading => {
    const ka = refKey(a), kb = refKey(b);
    if (!parent.has(ka) || !parent.has(kb)) return {kind: mode, ok: false, text: 'Elige dos terminales que existan.'};
    const ra = find(ka), rb = find(kb);
    if (mode === 'continuity') return ra === rb ? {kind: 'continuity', ok: true, text: 'Continuidad: sí (están en la misma red)'} : {kind: 'continuity', ok: true, text: 'Continuidad: no'};
    if (ra === rb) return {kind: 'voltage', ok: true, text: '0 V (misma red)', value: 0, unit: 'V'};
    const pair = livePair(ra, rb);
    if (!pair) return {kind: 'voltage', ok: true, text: tags.has(ra) || tags.has(rb) ? 'Sin lectura: no comparten una fuente de referencia' : 'Sin lectura: circuito abierto o sin alimentar'};
    const src = p.entities.find(e => e.id === pair.entity), configured = Number(src?.props.voltage);
    const isDc = defOf.get(pair.entity) === 'fuente-cc', ac = defOf.get(pair.entity) === 'red-3f';
    const phaseNeutral = ac && ((PHASES.includes(pair.a) && pair.b === 'N') || (pair.a === 'N' && PHASES.includes(pair.b)));
    if (!(isDc || phaseNeutral)) return {kind: 'voltage', ok: true, text: 'Tensión presente entre fases (valor no calculado)'};
    if (!Number.isFinite(configured) || configured <= 0) return {kind: 'voltage', ok: true, text: `Tensión presente (la tensión de «${src?.label}» no está configurada)`};
    const sign = isDc ? (pair.a === 'L+' ? 1 : -1) : 1;
    return {kind: 'voltage', ok: true, value: sign * configured, unit: isDc ? 'V CC' : 'V CA', text: `${sign * configured} ${isDc ? 'V CC' : 'V CA'} (valor configurado en «${src?.label}», no medido en un equipo real)`};
  };

  const plc = Object.fromEntries(Object.keys(plcVals).map(id => [id, {powered: !!plcPowered[id], tags: plcVals[id], state: plcState[id] ?? emptyScanState()}]));
  return {live, liveConnections, energized, plc, closed, warnings, converged, measure, sameNet, hasPotential};
}
