// Validación y migración de proyectos Industria. Lógica pura (sin React) para probarla en Node.
import {
  BINDING_KINDS, CHECK_KINDS, COIL_MODES, MAX_PRESET, FAULT_KINDS, CONNECTION_KINDS, HMI_WIDGET_KINDS, TAG_PATTERN, CONNECTION_STATUSES, CURRENT_VERSION, EDUCATION_MODES, FORMAT, LIMITS, MOUNT_KINDS,
  type Binding, type Connection, type Contact, type Entity, type Fault, type CheckSpec, type CustomActivity, type Lesson, type HmiWidget, type PlcProgram, type Rung, type IndustryProject, type Mount, type Pose, type PropValue, type Result, type SymbolPlacement, type Vec3,
} from './types.ts';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const str = (v: unknown, max: number): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const vec3 = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every(num);
/** Claves que nunca se aceptan como id o nombre de propiedad (evitan contaminar el prototipo de los diccionarios del proyecto). */
const DANGEROUS = new Set(['__proto__', 'constructor', 'prototype']);
const safeKey = (k: string): boolean => !DANGEROUS.has(k);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === 'string' && (list as readonly string[]).includes(v);

/** Formatos de otros módulos de modo.: se reconocen para dar un mensaje útil, nunca se aceptan. */
const OTHER_FORMATS: Record<string, string> = {'modo-robotica': 'Robótica', 'panellab-laboratory': 'Laboratorio', 'modo-panel': 'Panel de control'};

export type Migrations = Record<number, (raw: Rec) => Rec>;
/** Cada entrada `n` convierte un proyecto de la versión `n` a la `n + 1`. La 1→2 añade PLC y HMI vacíos; la 2→3, las fallas; la 3→4, la actividad guiada. */
export const MIGRATIONS: Migrations = {
  // v1 → v2: se añaden los programas de PLC y la pantalla de HMI, vacíos.
  1: raw => ({...raw, plc: {}, hmi: {widgets: []}}),
  // v2 → v3: se añade la lista de fallas, vacía.
  2: raw => ({...raw, faults: []}),
  // v3 → v4: se añade el estado de la actividad guiada, vacío.
  3: raw => ({...raw, lesson: {activityId: null, answers: {}, submitted: null}}),
};

/** Sube un proyecto antiguo a la versión actual. Rechaza versiones futuras o sin ruta de migración. */
export function migrate(raw: Rec, migrations: Migrations = MIGRATIONS, current = CURRENT_VERSION): Result<Rec> {
  let version = raw.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return fail('El proyecto no indica una versión válida.');
  if (version > current) return fail(`El proyecto es de una versión más nueva (${version}) que la que entiende esta aplicación (${current}). Actualiza modo.`);
  let data = raw;
  while (version < current) {
    const step = migrations[version];
    if (!step) return fail(`No hay migración de la versión ${version} a la ${version + 1}.`);
    data = step(data);
    version += 1;
    data = {...data, version};
  }
  return {ok: true, value: data};
}

function parsePose(v: unknown): Pose | null {
  return isRec(v) && vec3(v.position) && vec3(v.rotation) ? {position: [...v.position], rotation: [...v.rotation]} : null;
}

function parseProps(v: unknown): Record<string, PropValue> | null {
  if (!isRec(v)) return null;
  const out: Record<string, PropValue> = {};
  for (const [key, value] of Object.entries(v)) {
    if (key.length === 0 || key.length > 40 || !safeKey(key)) return null;
    if (typeof value === 'string' ? value.length > 200 : !(typeof value === 'boolean' || num(value))) return null;
    out[key] = value as PropValue;
  }
  return out;
}

/** Valida estructura e integridad referencial. Devuelve un proyecto normalizado o el primer error en español. */
export function parseIndustryProject(input: unknown, migrations: Migrations = MIGRATIONS): Result<IndustryProject> {
  if (!isRec(input)) return fail('El archivo no contiene un proyecto.');
  if (input.format !== FORMAT) {
    const other = typeof input.format === 'string' ? OTHER_FORMATS[input.format] : undefined;
    return fail(other ? `Este archivo es de ${other}, no de Industria.` : 'El archivo no es un proyecto de Industria.');
  }
  const migrated = migrate(input, migrations);
  if (!migrated.ok) return migrated;
  const p = migrated.value;
  if (!str(p.id, 80)) return fail('El proyecto no tiene un id válido.');
  if (!str(p.name, LIMITS.name)) return fail('El nombre del proyecto no es válido.');
  if (!str(p.createdAt, 40) || !str(p.updatedAt, 40)) return fail('Las fechas del proyecto no son válidas.');
  if (!oneOf(EDUCATION_MODES, p.mode)) return fail('El modo educativo del proyecto no es válido.');
  for (const [key, max] of [['entities', LIMITS.entities], ['mounts', LIMITS.mounts], ['connections', LIMITS.connections], ['bindings', LIMITS.bindings]] as const) {
    if (!Array.isArray(p[key])) return fail(`Falta la lista «${key}».`);
    if ((p[key] as unknown[]).length > max) return fail(`El proyecto supera el límite de ${max} elementos en «${key}».`);
  }
  if (!isRec(p.poses) || !isRec(p.symbols)) return fail('Faltan las poses o los símbolos del proyecto.');
  if (!isRec(p.lesson)) return fail('Falta el estado de la actividad del proyecto.');
  if (!Array.isArray(p.faults) || p.faults.length > LIMITS.faults) return fail('La lista de fallas del proyecto no es válida.');
  if (!isRec(p.plc) || !isRec(p.hmi) || !Array.isArray(p.hmi.widgets)) return fail('Faltan los programas de PLC o la pantalla de HMI del proyecto.');

  const ids = new Set<string>();
  const unique = (id: string): boolean => (!safeKey(id) || ids.has(id) ? false : (ids.add(id), true));

  const entities: Entity[] = [];
  for (const raw of p.entities as unknown[]) {
    if (!isRec(raw) || !str(raw.id, 80) || !str(raw.definitionId, 80) || !str(raw.label, LIMITS.label)) return fail('Hay una entidad con datos inválidos.');
    if (!unique(raw.id)) return fail(`El id «${raw.id}» está repetido.`);
    const props = parseProps(raw.props);
    if (!props) return fail(`Las propiedades de «${raw.label}» no son válidas.`);
    entities.push({id: raw.id, definitionId: raw.definitionId, label: raw.label, props, ...(raw.locked === true ? {locked: true} : {})});
  }
  const entityIds = new Set(entities.map(e => e.id));

  const mounts: Mount[] = [];
  const children = new Set<string>();
  for (const raw of p.mounts as unknown[]) {
    if (!isRec(raw) || !str(raw.id, 80) || !oneOf(MOUNT_KINDS, raw.kind) || !isRec(raw.parent) || !isRec(raw.child)) return fail('Hay un montaje con datos inválidos.');
    const {parent, child} = raw;
    if (!str(parent.entityId, 80) || !str(parent.anchorId, 80) || !str(child.entityId, 80) || !str(child.anchorId, 80)) return fail('Hay un montaje con anclajes inválidos.');
    if (!unique(raw.id)) return fail(`El id «${raw.id}» está repetido.`);
    if (!entityIds.has(parent.entityId) || !entityIds.has(child.entityId)) return fail('Un montaje apunta a una entidad que no existe.');
    if (parent.entityId === child.entityId) return fail('Una entidad no puede montarse sobre sí misma.');
    if (children.has(child.entityId)) return fail('Una entidad tiene más de un montaje como hija.');
    children.add(child.entityId);
    mounts.push({id: raw.id, kind: raw.kind, parent: {entityId: parent.entityId, anchorId: parent.anchorId}, child: {entityId: child.entityId, anchorId: child.anchorId}});
  }
  if (hasMountCycle(mounts)) return fail('Los montajes forman un ciclo.');

  const connections: Connection[] = [];
  for (const raw of p.connections as unknown[]) {
    if (!isRec(raw) || !str(raw.id, 80) || !oneOf(CONNECTION_KINDS, raw.kind) || !oneOf(CONNECTION_STATUSES, raw.status) || !isRec(raw.a) || !isRec(raw.b)) return fail('Hay una conexión con datos inválidos.');
    const {a, b} = raw;
    if (!str(a.entityId, 80) || !str(a.terminalId, 80) || !str(b.entityId, 80) || !str(b.terminalId, 80)) return fail('Hay una conexión con terminales inválidos.');
    if (!unique(raw.id)) return fail(`El id «${raw.id}» está repetido.`);
    if (!entityIds.has(a.entityId) || !entityIds.has(b.entityId)) return fail('Una conexión apunta a una entidad que no existe.');
    if (a.entityId === b.entityId && a.terminalId === b.terminalId) return fail('Una conexión no puede unir un terminal consigo mismo.');
    if (raw.label !== undefined && !str(raw.label, LIMITS.label)) return fail('La etiqueta de una conexión no es válida.');
    if (raw.route !== undefined && (!Array.isArray(raw.route) || raw.route.length > LIMITS.route || !raw.route.every(vec3))) return fail('La ruta de una conexión no es válida.');
    connections.push({
      id: raw.id, kind: raw.kind, status: raw.status,
      a: {entityId: a.entityId, terminalId: a.terminalId}, b: {entityId: b.entityId, terminalId: b.terminalId},
      ...(raw.label !== undefined ? {label: raw.label as string} : {}),
      ...(raw.route !== undefined ? {route: (raw.route as Vec3[]).map(v => [...v] as Vec3)} : {}),
    });
  }

  const bindings: Binding[] = [];
  for (const raw of p.bindings as unknown[]) {
    if (!isRec(raw) || !str(raw.id, 80) || !oneOf(BINDING_KINDS, raw.kind) || !str(raw.entityId, 80) || !str(raw.target, 120)) return fail('Hay una asociación con datos inválidos.');
    if (raw.terminalId !== undefined && !str(raw.terminalId, 80)) return fail('Una asociación tiene un terminal inválido.');
    if (!unique(raw.id)) return fail(`El id «${raw.id}» está repetido.`);
    if (!entityIds.has(raw.entityId)) return fail('Una asociación apunta a una entidad que no existe.');
    bindings.push({id: raw.id, kind: raw.kind, entityId: raw.entityId, target: raw.target, ...(raw.terminalId !== undefined ? {terminalId: raw.terminalId as string} : {})});
  }

  const poses: Record<string, Pose> = {};
  for (const [id, raw] of Object.entries(p.poses)) {
    const pose = parsePose(raw);
    if (!entityIds.has(id) || !pose) return fail('Hay una pose inválida o de una entidad que no existe.');
    poses[id] = pose;
  }
  const symbols: Record<string, SymbolPlacement[]> = {};
  for (const [id, raw] of Object.entries(p.symbols)) {
    if (!entityIds.has(id) || !Array.isArray(raw) || raw.length > LIMITS.symbolsPerEntity) return fail('Hay símbolos inválidos o de una entidad que no existe.');
    const list: SymbolPlacement[] = [];
    for (const s of raw) {
      if (!isRec(s) || !Number.isInteger(s.page) || (s.page as number) < 1 || !num(s.x) || !num(s.y) || (s.part !== undefined && !str(s.part, 40))) return fail('Hay un símbolo de diagrama inválido.');
      list.push({page: s.page as number, x: s.x, y: s.y, ...(s.part !== undefined ? {part: s.part as string} : {})});
    }
    symbols[id] = list;
  }

  const plc: Record<string, PlcProgram> = {};
  const tag = (v: unknown): v is string => typeof v === 'string' && TAG_PATTERN.test(v);
  for (const [id, raw] of Object.entries(p.plc)) {
    if (!entityIds.has(id) || !isRec(raw) || !Array.isArray(raw.rungs) || !Array.isArray(raw.memory)) return fail('Hay un programa de PLC inválido o de una entidad que no existe.');
    if (raw.rungs.length > LIMITS.rungs || raw.memory.length > LIMITS.memory || !raw.memory.every(tag)) return fail('Un programa de PLC supera los límites o tiene variables inválidas.');
    const rungs: Rung[] = [];
    for (const r of raw.rungs) {
      if (!isRec(r) || !str(r.id, 80) || !Array.isArray(r.branches) || !isRec(r.coil) || !tag(r.coil.tag) || !oneOf(COIL_MODES, r.coil.mode)) return fail('Hay una línea de programa inválida.');
      if (r.branches.length === 0 || r.branches.length > LIMITS.branches || (r.comment !== undefined && !str(r.comment, 120))) return fail('Una línea de programa tiene ramas o comentario inválidos.');
      if (!unique(r.id)) return fail(`El id «${r.id}» está repetido.`);
      const branches: Contact[][] = [];
      for (const br of r.branches) {
        if (!Array.isArray(br) || br.length > LIMITS.contacts) return fail('Una rama de programa es inválida.');
        const contacts: Contact[] = [];
        for (const c of br) { if (!isRec(c) || !tag(c.tag) || (c.nc !== undefined && typeof c.nc !== 'boolean')) return fail('Hay un contacto de programa inválido.'); contacts.push({tag: c.tag, ...(c.nc ? {nc: true} : {})}); }
        branches.push(contacts);
      }
      const preset = r.coil.preset;
      if ((r.coil.mode === 'ton' || r.coil.mode === 'ctu') ? !(Number.isInteger(preset) && (preset as number) >= 1 && (preset as number) <= MAX_PRESET[r.coil.mode]) : preset !== undefined) return fail('Una bobina de temporizador o contador tiene un valor inválido.');
      rungs.push({id: r.id, branches, coil: {tag: r.coil.tag, mode: r.coil.mode, ...(preset !== undefined ? {preset: preset as number} : {})}, ...(r.comment !== undefined ? {comment: r.comment as string} : {})});
    }
    plc[id] = {rungs, memory: [...raw.memory]};
  }
  const widgets: HmiWidget[] = [];
  if (p.hmi.widgets.length > LIMITS.widgets) return fail('La pantalla de HMI supera el límite de widgets.');
  for (const w of p.hmi.widgets as unknown[]) {
    if (!isRec(w) || !str(w.id, 80) || !oneOf(HMI_WIDGET_KINDS, w.kind) || typeof w.label !== 'string' || w.label.length > LIMITS.label) return fail('Hay un widget de HMI inválido.');
    if ((w.plcId !== undefined && (!str(w.plcId, 80) || !entityIds.has(w.plcId))) || (w.tag !== undefined && !tag(w.tag))) return fail('Un widget de HMI apunta a un PLC o variable inválidos.');
    if (!unique(w.id)) return fail(`El id «${w.id}» está repetido.`);
    widgets.push({id: w.id, kind: w.kind, label: w.label, ...(w.plcId !== undefined ? {plcId: w.plcId as string} : {}), ...(w.tag !== undefined ? {tag: w.tag as string} : {})});
  }

  const faults: Fault[] = [];
  const connectionIds = new Set(connections.map(c => c.id));
  for (const f of p.faults as unknown[]) {
    if (!isRec(f) || !str(f.id, 80) || !oneOf(FAULT_KINDS, f.kind) || (f.hidden !== undefined && typeof f.hidden !== 'boolean')) return fail('Hay una falla con datos inválidos.');
    if (f.kind === 'wire-open' ? !(str(f.connectionId, 80) && connectionIds.has(f.connectionId)) : !(str(f.entityId, 80) && entityIds.has(f.entityId))) return fail('Una falla apunta a un componente o a una conexión que no existe.');
    if (!unique(f.id)) return fail(`El id «${f.id}» está repetido.`);
    faults.push({id: f.id, kind: f.kind, ...(f.entityId !== undefined ? {entityId: f.entityId as string} : {}), ...(f.connectionId !== undefined ? {connectionId: f.connectionId as string} : {}), ...(f.hidden ? {hidden: true} : {})});
  }

  const rawLesson = p.lesson as Rec;
  if (!(rawLesson.activityId === null || str(rawLesson.activityId, 80)) || !isRec(rawLesson.answers)) return fail('La actividad del proyecto no es válida.');
  const answers: Record<string, string> = {};
  const answerEntries = Object.entries(rawLesson.answers);
  if (answerEntries.length > LIMITS.answers) return fail('La actividad tiene demasiadas respuestas.');
  for (const [k, v] of answerEntries) { if (!str(k, 40) || !safeKey(k) || typeof v !== 'string' || v.length > LIMITS.answer) return fail('Hay una respuesta de actividad inválida.'); answers[k] = v; }
  let submitted: Lesson['submitted'] = null;
  if (rawLesson.submitted !== null && rawLesson.submitted !== undefined) {
    const s = rawLesson.submitted;
    if (!isRec(s) || !str(s.at, 40) || !Number.isInteger(s.score) || !Number.isInteger(s.total) || !Array.isArray(s.results) || s.results.length > LIMITS.checks || !s.results.every(r => isRec(r) && str(r.id, 40) && typeof r.ok === 'boolean')) return fail('La entrega de la actividad no es válida.');
    submitted = {at: s.at, score: s.score as number, total: s.total as number, results: (s.results as {id: string; ok: boolean}[]).map(r => ({id: r.id, ok: r.ok}))};
  }
  let def: CustomActivity | undefined;
  if (rawLesson.def !== undefined) {
    const d = rawLesson.def;
    if (!isRec(d) || !str(d.title, LIMITS.name) || typeof d.summary !== 'string' || d.summary.length > 400 || !Array.isArray(d.checks) || d.checks.length > LIMITS.checks) return fail('La definición de la actividad no es válida.');
    const checks: CheckSpec[] = [], seenIds = new Set<string>();
    const steps = (v: unknown): Record<string, boolean>[] | null => {
      if (!Array.isArray(v) || v.length > LIMITS.steps) return null; const out: Record<string, boolean>[] = [];
      for (const st of v) { if (!isRec(st) || Object.keys(st).length > LIMITS.stepInputs) return null; const rec: Record<string, boolean> = {}; for (const [k, x] of Object.entries(st)) { if (!str(k, 80) || !safeKey(k) || typeof x !== 'boolean') return null; rec[k] = x; } out.push(rec); }
      return out;
    };
    const ref = (v: unknown) => isRec(v) && str(v.entityId, 80) && str(v.terminalId, 80) ? {entityId: v.entityId as string, terminalId: v.terminalId as string} : null;
    for (const c of d.checks as unknown[]) {
      if (!isRec(c) || !str(c.id, 40) || !safeKey(c.id) || seenIds.has(c.id) || typeof c.text !== 'string' || c.text.length === 0 || c.text.length > 200 || typeof c.hint !== 'string' || c.hint.length > 300 || !oneOf(CHECK_KINDS, c.kind)) return fail('Hay una comprobación de actividad inválida.');
      seenIds.add(c.id); const base = {id: c.id, text: c.text, hint: c.hint};
      if (c.kind === 'mounted') { if (!str(c.parent, 80) || !str(c.child, 80)) return fail('Una comprobación de montaje es inválida.'); checks.push({...base, kind: 'mounted', parent: c.parent, child: c.child}); }
      else if (c.kind === 'energized') { const st = steps(c.steps); if (!str(c.entity, 80) || !st || typeof c.expect !== 'boolean') return fail('Una comprobación de estado es inválida.'); checks.push({...base, kind: 'energized', entity: c.entity, steps: st, expect: c.expect}); }
      else if (c.kind === 'plcTag') { const st = steps(c.steps); if (!str(c.plc, 80) || !tag(c.tag) || !st || typeof c.expect !== 'boolean') return fail('Una comprobación de variable es inválida.'); checks.push({...base, kind: 'plcTag', plc: c.plc, tag: c.tag, steps: st, expect: c.expect}); }
      else if (c.kind === 'sameNet') { const a = ref(c.a), b = ref(c.b), st = steps(c.steps); if (!a || !b || !st || typeof c.expect !== 'boolean') return fail('Una comprobación de red es inválida.'); checks.push({...base, kind: 'sameNet', a, b, steps: st, expect: c.expect}); }
      else checks.push({...base, kind: 'noErrors'});
    }
    def = {title: d.title, summary: d.summary, checks};
  }
  const lesson: Lesson = {activityId: rawLesson.activityId as string | null, answers, submitted, ...(def ? {def} : {})};

  return {ok: true, value: {
    format: FORMAT, version: CURRENT_VERSION, id: p.id, name: p.name, createdAt: p.createdAt as string, updatedAt: p.updatedAt as string,
    mode: p.mode, entities, mounts, connections, bindings, poses, symbols, plc, hmi: {widgets}, faults, lesson,
  }};
}

export function parseIndustryProjectText(text: string): Result<IndustryProject> {
  if (text.length > LIMITS.importBytes) return fail('El archivo supera el límite de 2 MB.');
  let data: unknown;
  try { data = JSON.parse(text); } catch { return fail('El archivo no es un JSON válido.'); }
  return parseIndustryProject(data);
}

export function hasMountCycle(mounts: readonly Mount[]): boolean {
  const parentOf = new Map(mounts.map(m => [m.child.entityId, m.parent.entityId]));
  for (const start of parentOf.keys()) {
    const seen = new Set<string>([start]);
    for (let at = parentOf.get(start); at !== undefined; at = parentOf.get(at)) {
      if (seen.has(at)) return true;
      seen.add(at);
    }
  }
  return false;
}
