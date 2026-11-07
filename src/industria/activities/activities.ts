// Actividades guiadas de Industria (fase 9). Puro: se prueba en Node.
//
// Una actividad es un proyecto de partida + comprobaciones. Las comprobaciones miran el RESULTADO (montajes, redes, comportamiento simulado),
// no una solución única: cualquier cableado o programa correcto pasa. El proyecto solo guarda qué actividad es, las respuestas y la entrega.
import {addEntity, mount} from '../model/commands.ts';
import {newIndustryProject} from '../model/defaults.ts';
import type {CheckSpec, CustomActivity, IndustryProject, Result, Submission, TerminalRef} from '../model/types.ts';
import {LIMITS} from '../model/types.ts';
import {findSnapCandidates, mountProblems, overlapsOf} from '../build/snap.ts';
import {shapeOf} from '../build/shapes.ts';
import {addFault, FAULT_LABEL} from '../faults/faults.ts';
import {checkProgram} from '../plc/program.ts';
import {simulate, type SimInputs, type SimResult} from '../sim/engine.ts';
import {exampleDirectStart, examplePlcStartStop} from '../sim/examples.ts';
import {evaluate} from '../wiring/engine.ts';
import {electricalEntities} from '../diagram/layout.ts';

export type Check = {id: string; text: string; hint: string; test(p: IndustryProject): boolean};
export type AnswerField = {id: string; label: string; options(p: IndustryProject): {value: string; label: string}[]};
export type Activity = {id: string; title: string; summary: string; skills: string[]; build(): Result<IndustryProject>; checks: Check[]; answers?: AnswerField[]};

/** Ejecuta una secuencia de mandos encadenando el estado (así un sello o un PLC «recuerdan» entre pasos). */
export function runSeq(p: IndustryProject, steps: SimInputs[]): SimResult[] {
  const out: SimResult[] = []; let prev: {energized: Record<string, boolean>; plc: SimResult['plc']} = {energized: {}, plc: {}};
  for (const inputs of steps) { const r = simulate(p, inputs, prev.energized, prev.plc); out.push(r); prev = {energized: r.energized, plc: r.plc}; }
  return out;
}
const ON = {qf1: true, qf2: true};
const mounted = (p: IndustryProject, parent: string, child: string) => p.mounts.some(m => m.parent.entityId === parent && m.child.entityId === child);
const fail = (error: string): Result<IndustryProject> => ({ok: false, error});

const label = (p: IndustryProject, id: string) => p.entities.find(e => e.id === id)?.label ?? id;
const culpritOptions = (p: IndustryProject) => [
  ...p.connections.map(c => ({value: `connection:${c.id}`, label: `Cable ${label(p, c.a.entityId)}.${c.a.terminalId} → ${label(p, c.b.entityId)}.${c.b.terminalId}`})),
  ...electricalEntities(p).map(e => ({value: `entity:${e.id}`, label: `${e.label} (${shapeOf(e.definitionId).name})`})),
];

// — 1. Montar un tablero (montaje y anclajes) —
function buildBoard(): Result<IndustryProject> {
  let p = newIndustryProject('Actividad · Montar un tablero');
  for (const [id, def, label, at] of [['placa', 'placa', 'Placa', [0, 0, 0]], ['riel', 'riel', 'Riel', [1.2, 0.5, 0.6]], ['qf1', 'breaker-3p', 'QF1', [-1.2, 0.5, 0.6]], ['km1', 'contactor-3p', 'KM1', [-1.2, 0.5, 1.2]]] as const) {
    const r = addEntity(p, {id, definitionId: def, label, pose: {position: [...at], rotation: [0, 0, 0]}}); if (!r.ok) return r; p = r.value;
  }
  return {ok: true, value: p};
}
const BOARD: Activity = {
  id: 'tablero', title: 'Montar un tablero', summary: 'Monta el riel sobre la placa y los aparatos sobre el riel, sin interferencias.', skills: ['Montaje', 'Anclajes'],
  build: buildBoard,
  checks: [
    {id: 'riel', text: 'El riel está montado sobre la placa', hint: 'Arrastra el riel hasta la cara frontal de la placa: aparece una vista previa cuando el anclaje es compatible.', test: p => mounted(p, 'placa', 'riel')},
    {id: 'qf1', text: 'QF1 está montado en el riel', hint: 'Los aparatos de riel se acoplan por su dorso. Acércalo al riel por delante.', test: p => mounted(p, 'riel', 'qf1')},
    {id: 'km1', text: 'KM1 está montado en el riel', hint: 'Igual que QF1: el contactor también va en el riel.', test: p => mounted(p, 'riel', 'km1')},
    {id: 'sin-choques', text: 'QF1 y KM1 no se atraviesan entre sí', hint: 'Sepáralos a lo largo del riel: cada aparato ocupa su propio tramo.', test: p => ['qf1', 'km1', 'riel'].every(id => !overlapsOf(p, id).some(o => ['qf1', 'km1'].includes(o)))},
    {id: 'coherente', text: 'Todos los montajes coinciden con la geometría', hint: 'Si moviste un soporte a mano, vuelve a acoplar las piezas.', test: p => mountProblems(p).length === 0 && p.mounts.length >= 3},
  ],
};

// — 2. Arranque directo: cablear —
function buildDirect(): Result<IndustryProject> {
  const full = exampleDirectStart(); if (!full.ok) return full;
  return {ok: true, value: {...full.value, name: 'Actividad · Cablear un arranque directo', connections: [], faults: []}};
}
const energizedAfter = (p: IndustryProject, steps: SimInputs[]) => runSeq(p, steps).at(-1)!;
const DIRECT: Activity = {
  id: 'arranque', title: 'Cablear un arranque directo', summary: 'Los equipos ya están montados. Cablea fuerza, tierra y mando para que el motor gire al pulsar S1.', skills: ['Cableado', 'Fuerza y mando', 'Instrumentos'],
  build: buildDirect,
  checks: [
    {id: 'gira', text: 'Con QF1, QF2 y S1 cerrados el motor gira', hint: 'Fuerza: Red → QF1 → KM1 (contactos) → motor. Mando: Red → QF2 → Fuente → S1 → bobina A1/A2 de KM1.', test: p => energizedAfter(p, [{...ON, s1: true}]).energized.motor === true},
    {id: 'reposo', text: 'Sin pulsar S1 el motor no gira', hint: 'La bobina solo debe recibir tensión a través del pulsador.', test: p => energizedAfter(p, [ON]).energized.motor === false && energizedAfter(p, [{...ON, s1: true}]).energized.motor === true},
    {id: 'piloto', text: 'El piloto H1 enciende cuando KM1 está cerrado', hint: 'Usa el contacto auxiliar 13–14 de KM1 para alimentar el piloto entre X1 y X2.', test: p => energizedAfter(p, [{...ON, s1: true}]).energized.h1 === true},
    {id: 'tierra', text: 'El motor está conectado a tierra (PE de la red al PE del motor)', hint: 'Une Red 3F · PE con M1 · PE; la tierra solo se une con tierra.', test: p => simulate(p, {}).sameNet({entityId: 'red', terminalId: 'PE'}, {entityId: 'motor', terminalId: 'PE'})},
    {id: 'topologia', text: 'El circuito funciona sin cortocircuitos ni errores de topología', hint: 'Revisa el panel Conexiones: línea con neutro, positivo con negativo o tierra mezclada.', test: p => !evaluate(p).issues.some(i => i.severity === 'error') && energizedAfter(p, [{...ON, s1: true}]).energized.motor === true && simulate(p, {...ON, s1: true}).warnings.length === 0},
  ],
};

// — 3. Localizar una falla —
function buildDiagnosis(): Result<IndustryProject> {
  const full = exampleDirectStart(); if (!full.ok) return full;
  const wire = full.value.connections.find(c => c.a.entityId === 'km1' && c.a.terminalId === '4' && c.b.entityId === 'motor' && c.b.terminalId === 'V1');
  if (!wire) return fail('No se pudo preparar la falla.');
  const faulty = addFault({...full.value, name: 'Actividad · Localizar una falla'}, {kind: 'wire-open', connectionId: wire.id, hidden: true});
  return faulty;
}
const DIAGNOSIS: Activity = {
  id: 'falla', title: 'Localizar una falla', summary: 'El motor del arranque directo no gira bien. Mide con el multímetro, localiza la falla y respóndela.', skills: ['Diagnóstico', 'Multímetro'],
  build: buildDiagnosis,
  answers: [
    {id: 'culprit', label: 'Elemento defectuoso', options: culpritOptions},
    {id: 'kind', label: 'Tipo de falla', options: () => (['wire-open', 'contact-open', 'coil-open', 'lamp-open', 'winding-open'] as const).map(k => ({value: k, label: FAULT_LABEL[k]}))},
  ],
  checks: [
    {id: 'culprit', text: 'Identificaste el elemento defectuoso', hint: 'Cierra QF1 y QF2, mantén S1 y mide en cada tramo: la falla está donde hay tensión antes y no después.', test: p => p.faults.some(f => (f.connectionId && p.lesson.answers.culprit === `connection:${f.connectionId}`) || (f.entityId && p.lesson.answers.culprit === `entity:${f.entityId}`))},
    {id: 'kind', text: 'Identificaste el tipo de falla', hint: 'Si hay tensión en un extremo del cable y no en el otro, el cable (o su borne) no conduce.', test: p => p.faults.length > 0 && p.lesson.answers.kind === p.faults[0].kind},
  ],
};

// — 4. Marcha/paro con PLC: programar —
function buildPlc(): Result<IndustryProject> {
  const full = examplePlcStartStop(); if (!full.ok) return full;
  const v = full.value;
  return {ok: true, value: {...v, name: 'Actividad · Programar marcha/paro', plc: {}, bindings: v.bindings.filter(b => b.kind !== 'plc-tag'), hmi: {widgets: []}}};
}
const PLC: Activity = {
  id: 'plc', title: 'Programar marcha/paro con PLC', summary: 'El tablero está montado y cableado. Asocia las variables y programa el PLC: S1 marcha con sello, S2 paro.', skills: ['PLC', 'Escalera', 'Variables'],
  build: buildPlc,
  checks: [
    {id: 'alimentado', text: 'El PLC se alimenta al cerrar QF1 y QF2', hint: 'Ya está cableado: cierra QF1 y QF2 en Instrumentos tras pulsar Ejecutar.', test: p => runSeq(p, [ON])[0].plc.plc?.powered === true},
    {id: 'arranca', text: 'Pulsar S1 arranca el motor', hint: 'Asocia DI0 a una variable (START), DO0 a otra (MOTOR) y escribe una línea que active MOTOR con START.', test: p => runSeq(p, [ON, {...ON, s1: true}])[1].energized.motor === true},
    {id: 'sello', text: 'El motor sigue girando al soltar S1 (sello)', hint: 'Añade una rama en paralelo con el contacto MOTOR: la salida se mantiene a sí misma.', test: p => runSeq(p, [ON, {...ON, s1: true}, ON])[2].energized.motor === true},
    {id: 'paro', text: 'Pulsar S2 detiene el motor y no rearranca solo', hint: 'Asocia DI1 a STOP y añade un contacto normalmente cerrado (/STOP) en todas las ramas.', test: p => { const r = runSeq(p, [ON, {...ON, s1: true}, ON, {...ON, s2: true}, ON]); return r[2].energized.motor === true && r[3].energized.motor === false && r[4].energized.motor === false; }},
    {id: 'sin-errores', text: 'El programa no tiene variables sin definir', hint: 'Mira los avisos del programa: toda variable debe estar asociada a un terminal o creada como interna.', test: p => (p.plc.plc?.rungs.length ?? 0) > 0 && checkProgram(p, 'plc').every(i => i.severity !== 'error')},
  ],
};

export const ACTIVITIES: readonly Activity[] = [BOARD, DIRECT, DIAGNOSIS, PLC];
export const activityOf = (id: string | null | undefined): Activity | undefined => ACTIVITIES.find(a => a.id === id);

// — Actividades propias (editor): las comprobaciones son datos y se interpretan aquí —
export const CUSTOM_ID = 'custom';
const stepsOf = (steps: Record<string, boolean>[]) => (steps.length ? steps : [{}]);
export function checkFromSpec(spec: CheckSpec): Check {
  const test = (p: IndustryProject): boolean => {
    switch (spec.kind) {
      case 'mounted': return mounted(p, spec.parent, spec.child);
      case 'energized': return !!runSeq(p, stepsOf(spec.steps)).at(-1)!.energized[spec.entity] === spec.expect && p.entities.some(e => e.id === spec.entity);
      case 'plcTag': return !!runSeq(p, stepsOf(spec.steps)).at(-1)!.plc[spec.plc]?.tags[spec.tag] === spec.expect && p.entities.some(e => e.id === spec.plc);
      case 'sameNet': return simulate(p, spec.steps.at(-1) ?? {}).sameNet(spec.a, spec.b) === spec.expect;
      case 'noErrors': return !evaluate(p).issues.some(i => i.severity === 'error');
    }
  };
  return {id: spec.id, text: spec.text, hint: spec.hint, test};
}
export const customActivity = (def: CustomActivity): Activity => ({id: CUSTOM_ID, title: def.title, summary: def.summary, skills: ['Actividad propia'], build: () => ({ok: false, error: 'Una actividad propia se abre desde su archivo.'}), checks: def.checks.map(checkFromSpec)});
/** La actividad del proyecto: una del catálogo o la propia que lleva dentro. */
export const activityFor = (p: IndustryProject): Activity | undefined => (p.lesson.activityId === CUSTOM_ID && p.lesson.def ? customActivity(p.lesson.def) : activityOf(p.lesson.activityId));

const termLabel = (p: IndustryProject, r: TerminalRef) => `${label(p, r.entityId)}.${r.terminalId}`;
const inputsText = (p: IndustryProject, steps: Record<string, boolean>[]) => {
  const on = (st: Record<string, boolean>) => Object.entries(st).filter(([, v]) => v).map(([id]) => label(p, id));
  if (!steps.length || steps.every(st => on(st).length === 0)) return 'sin accionar ningún mando';
  return steps.map(st => on(st).join(' y ') || 'ningún mando').join(', luego ');
};
/** Texto automático de una comprobación (se puede editar). */
export function describeCheck(p: IndustryProject, spec: CheckSpec): string {
  switch (spec.kind) {
    case 'mounted': return `${label(p, spec.child)} está montado en ${label(p, spec.parent)}`;
    case 'energized': return `Con ${inputsText(p, spec.steps)}, ${label(p, spec.entity)} ${spec.expect ? 'está activo' : 'no está activo'}`;
    case 'plcTag': return `Con ${inputsText(p, spec.steps)}, la variable ${spec.tag} ${spec.expect ? 'está activa' : 'está inactiva'}`;
    case 'sameNet': return `${termLabel(p, spec.a)} ${spec.expect ? 'está unido a' : 'no está unido a'} ${termLabel(p, spec.b)}${spec.steps.length ? ` (con ${inputsText(p, spec.steps)})` : ''}`;
    case 'noErrors': return 'No hay errores de topología (cortocircuitos, tierra mezclada…)';
  }
}

/** Guarda la definición en el proyecto (lo convierte en una actividad propia). */
export function setCustomActivity(p: IndustryProject, def: CustomActivity): Result<IndustryProject> {
  if (!def.title.trim() || def.title.length > LIMITS.name) return fail('El título de la actividad no es válido.');
  if (def.checks.length === 0) return fail('Añade al menos una comprobación.');
  if (def.checks.length > LIMITS.checks) return fail(`Una actividad admite hasta ${LIMITS.checks} comprobaciones.`);
  if (new Set(def.checks.map(c => c.id)).size !== def.checks.length) return fail('Hay comprobaciones con el mismo id.');
  const next: IndustryProject = {...p, lesson: {activityId: CUSTOM_ID, answers: {}, submitted: null, def: {title: def.title.trim(), summary: def.summary.trim().slice(0, 400), checks: def.checks}}};
  return {ok: true, value: next};
}
export const clearCustomActivity = (p: IndustryProject): Result<IndustryProject> => ({ok: true, value: {...p, lesson: {activityId: null, answers: {}, submitted: null}}});

export type StudentOptions = {noWires: boolean; noProgram: boolean; noMounts: boolean; mode: IndustryProject['mode']};
/** Copia del proyecto para entregar a los alumnos: quita lo que deben hacer ellos y conserva la actividad (sin respuestas ni entrega). */
export function prepareForStudents(p: IndustryProject, o: StudentOptions): IndustryProject {
  const q: IndustryProject = JSON.parse(JSON.stringify(p));
  if (o.noWires) { q.connections = []; q.faults = q.faults.filter(f => f.kind !== 'wire-open'); }
  if (o.noProgram) { q.plc = {}; q.bindings = q.bindings.filter(b => b.kind !== 'plc-tag'); q.hmi = {widgets: []}; }
  if (o.noMounts) q.mounts = [];
  q.mode = o.mode; q.lesson = {activityId: p.lesson.activityId, answers: {}, submitted: null, ...(p.lesson.def ? {def: p.lesson.def} : {})};
  return q;
}

export type CheckResult = {id: string; text: string; hint: string; ok: boolean};
export function evaluateActivity(p: IndustryProject): CheckResult[] {
  const a = activityFor(p); if (!a) return [];
  return a.checks.map(c => { let ok = false; try { ok = c.test(p); } catch { ok = false; } return {id: c.id, text: c.text, hint: c.hint, ok}; });
}

/** Proyecto de partida de una actividad, con su estado de actividad asociado. */
export function startActivity(id: string, mode: IndustryProject['mode'] = 'learning'): Result<IndustryProject> {
  const a = activityOf(id); if (!a) return fail('La actividad no existe.');
  const r = a.build(); if (!r.ok) return r;
  return {ok: true, value: {...r.value, mode, lesson: {activityId: id, answers: {}, submitted: null}}};
}

export function setAnswer(p: IndustryProject, key: string, value: string): Result<IndustryProject> {
  const a = activityFor(p); if (!a?.answers?.some(f => f.id === key)) return fail('Esa respuesta no existe en la actividad.');
  if (p.lesson.submitted) return fail('La actividad ya se entregó: reábrela para cambiar respuestas.');
  if (value && !a.answers.find(f => f.id === key)!.options(p).some(o => o.value === value)) return fail('La respuesta no es una de las opciones.');
  const answers = {...p.lesson.answers}; if (value) answers[key] = value; else delete answers[key];
  return {ok: true, value: {...p, lesson: {...p.lesson, answers}}};
}

/** Entrega: congela el resultado (no se muestra el detalle hasta entregar en modo Prueba). */
export function submit(p: IndustryProject, at: string): Result<IndustryProject> {
  if (!activityFor(p)) return fail('No hay una actividad en este proyecto.');
  if (p.lesson.submitted) return fail('La actividad ya se entregó.');
  const results = evaluateActivity(p).map(r => ({id: r.id, ok: r.ok})), submission: Submission = {at, score: results.filter(r => r.ok).length, total: results.length, results};
  return {ok: true, value: {...p, lesson: {...p.lesson, submitted: submission}}};
}
export function reopen(p: IndustryProject): Result<IndustryProject> {
  return p.lesson.submitted ? {ok: true, value: {...p, lesson: {...p.lesson, submitted: null}}} : fail('La actividad no está entregada.');
}

export function reportMarkdown(p: IndustryProject): string {
  const a = activityFor(p), s = p.lesson.submitted;
  if (!a || !s) return '';
  return [`# Informe de actividad · ${a.title}`, '', `Proyecto: ${p.name}`, `Entregado: ${s.at}`, `Resultado: **${s.score} de ${s.total}**`, '',
    ...a.checks.map(c => `- [${s.results.find(r => r.id === c.id)?.ok ? 'x' : ' '}] ${c.text}`), '',
    '> Las comprobaciones evalúan el comportamiento simulado y el montaje del proyecto con piezas genéricas; no son una certificación.', ''].join('\n');
}
