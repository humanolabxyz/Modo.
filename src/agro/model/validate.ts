// Validación y migración de mundos de Agro. Lógica pura (sin React): se prueba en Node.
// Nunca confía en el archivo: comprueba tipos, rangos, límites, ids únicos y referencias entre puertos y conexiones.
// La lógica de versiones se REUTILIZA de Industria (`migrate` es genérica en sus migraciones y su versión actual).
import {migrate as migrateVersion} from '../../industria/model/validate.ts';
import {validateProgram} from '../plc/program.ts';
import {checkPorts} from './ports.ts';
import {
  CONNECTION_STATUSES, CURRENT_VERSION, EXPERIENCE_MODES, FORMAT, LIFECYCLES, LIMITS, PHYSICAL_STATUSES, PORT_DIRECTIONS, PORT_KINDS, PROVENANCES, SIM_SPEEDS, TERRAIN_EDIT_KINDS,
  type AgroProgram, type Clock, type Connection, type Economy, type LedgerEntry, type Order, type Entity, type Port, type Result, type Scenario, type Terrain, type TerrainEdit, type Vec3, type WorldProject,
} from './types.ts';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const str = (v: unknown, max: number): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const vec3 = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every(num);
const oneOf = <T extends string | number>(list: readonly T[], v: unknown): v is T => (list as readonly unknown[]).includes(v);
/** Claves que nunca se aceptan como id ni nombre de propiedad (evitan contaminar el prototipo de los diccionarios). */
const DANGEROUS = new Set(['__proto__', 'constructor', 'prototype']);
const safeKey = (k: string): boolean => !DANGEROUS.has(k);
const isoDate = (v: unknown): v is string => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));
const unit = (v: Vec3): boolean => Math.abs(Math.hypot(v[0], v[1], v[2]) - 1) < 0.01;

/** Formatos de otros módulos de modo.: se reconocen para dar un mensaje útil y nunca se aceptan. */
export const OTHER_FORMATS: Record<string, string> = {'modo-industria': 'Industria', 'modo-robotica': 'Robótica', 'panellab-laboratory': 'Laboratorio', 'modo-panel': 'Panel de control', 'modo-equipment': 'Equipos', 'modo-cabinet-report': 'Tableros'};

/** Cada entrada `n` convierte un mundo de la versión `n` a la `n + 1`. Hoy solo existe la versión 1: aquí se añadirán las migraciones. */
export const MIGRATIONS: Record<number, (raw: Rec) => Rec> = {};

/** Lleva cualquier archivo conocido a la versión vigente. Rechaza formatos ajenos, versiones futuras o sin ruta de migración. */
export function migrateWorld(raw: unknown): Result<Rec> {
  if (!isRec(raw)) return fail('El archivo no es un mundo de Agro.');
  const format = raw.format;
  if (format !== FORMAT) {
    const owner = typeof format === 'string' && Object.hasOwn(OTHER_FORMATS, format) ? OTHER_FORMATS[format] : undefined;
    return fail(owner ? `Este archivo es de ${owner}; ábrelo en ${owner}.` : 'El archivo no es un mundo de Agro (falta el formato «modo-agro»).');
  }
  return migrateVersion(raw, MIGRATIONS, CURRENT_VERSION);
}

function parsePort(raw: unknown, where: string): Result<Port> {
  if (!isRec(raw)) return fail(`${where}: el puerto no es válido.`);
  if (!str(raw.id, LIMITS.id) || !safeKey(raw.id)) return fail(`${where}: id de puerto inválido.`);
  const at = `${where}, puerto «${raw.id}»`;
  if (!oneOf(PORT_KINDS, raw.kind)) return fail(`${at}: tipo de puerto desconocido.`);
  if (!oneOf(PORT_DIRECTIONS, raw.direction)) return fail(`${at}: dirección inválida.`);
  if (raw.label !== undefined && !str(raw.label, LIMITS.label)) return fail(`${at}: etiqueta inválida.`);
  if (!vec3(raw.local)) return fail(`${at}: posición local inválida.`);
  if (!vec3(raw.normal) || !unit(raw.normal)) return fail(`${at}: la normal debe ser un vector unitario.`);
  const s = raw.spec;
  if (!isRec(s)) return fail(`${at}: faltan las especificaciones.`);
  const base = {id: raw.id, direction: raw.direction, local: [...raw.local] as Vec3, normal: [...raw.normal] as Vec3, ...(raw.label !== undefined ? {label: raw.label as string} : {})};
  switch (raw.kind) {
    case 'hydraulic':
      if (!num(s.diameterMm) || s.diameterMm <= 0 || s.diameterMm > 5000) return fail(`${at}: el diámetro debe estar entre 0 y 5000 mm.`);
      if (s.connector !== undefined && !str(s.connector, LIMITS.label)) return fail(`${at}: conector inválido.`);
      return {ok: true, value: {...base, kind: 'hydraulic', spec: {diameterMm: s.diameterMm, ...(s.connector !== undefined ? {connector: s.connector as string} : {})}}};
    case 'power':
      if (s.current !== 'ac' && s.current !== 'dc') return fail(`${at}: la corriente debe ser «ac» o «dc».`);
      if (s.phases !== 1 && s.phases !== 3) return fail(`${at}: las fases deben ser 1 o 3.`);
      if (!num(s.voltage) || s.voltage <= 0 || s.voltage > 100_000) return fail(`${at}: tensión fuera de rango.`);
      if (s.frequencyHz !== undefined && (!num(s.frequencyHz) || s.frequencyHz <= 0 || s.frequencyHz > 1000)) return fail(`${at}: frecuencia fuera de rango.`);
      return {ok: true, value: {...base, kind: 'power', spec: {current: s.current, phases: s.phases, voltage: s.voltage, ...(s.frequencyHz !== undefined ? {frequencyHz: s.frequencyHz as number} : {})}}};
    case 'signal':
      if (s.signal !== 'digital' && s.signal !== 'analog' && s.signal !== 'data') return fail(`${at}: la señal debe ser «digital», «analog» o «data».`);
      if (s.level !== undefined && !str(s.level, LIMITS.label)) return fail(`${at}: nivel de señal inválido.`);
      return {ok: true, value: {...base, kind: 'signal', spec: {signal: s.signal, ...(s.level !== undefined ? {level: s.level as string} : {})}}};
    default:
      if (!str(s.mount, LIMITS.label)) return fail(`${at}: falta el tipo de montaje.`);
      return {ok: true, value: {...base, kind: 'mechanical', spec: {mount: s.mount}}};
  }
}

function parseDict(raw: unknown, where: string): Result<Record<string, string | number | boolean>> {
  if (!isRec(raw)) return fail(`${where} no es válido.`);
  const keys = Object.keys(raw);
  if (keys.length > LIMITS.params) return fail(`${where} tiene demasiados valores (máximo ${LIMITS.params}).`);
  const out: Record<string, string | number | boolean> = {};
  for (const k of keys) {
    const v = raw[k];
    if (!safeKey(k) || k.length > 40) return fail(`${where}: nombre de propiedad inválido.`);
    if (!(typeof v === 'string' ? v.length <= LIMITS.text : typeof v === 'boolean' || num(v))) return fail(`${where}: valor inválido en «${k}».`);
    out[k] = v as string | number | boolean;
  }
  return {ok: true, value: out};
}

function parseEntity(raw: unknown, index: number): Result<Entity> {
  const at = `Entidad ${index + 1}`;
  if (!isRec(raw)) return fail(`${at}: no es válida.`);
  if (!str(raw.id, LIMITS.id) || !safeKey(raw.id)) return fail(`${at}: id inválido.`);
  const where = `${at} «${raw.id}»`;
  if (!str(raw.type, LIMITS.id)) return fail(`${where}: falta el tipo.`);
  if (!str(raw.label, LIMITS.label)) return fail(`${where}: nombre inválido.`);
  if (!isRec(raw.pose) || !vec3(raw.pose.position) || !vec3(raw.pose.rotation)) return fail(`${where}: pose inválida (posición y rotación son tres números).`);
  const params = parseDict(raw.params, `${where}: parámetros`); if (!params.ok) return params;
  const state = parseDict(raw.state, `${where}: estado`); if (!state.ok) return state;
  if (!Array.isArray(raw.ports) || raw.ports.length > LIMITS.portsPerEntity) return fail(`${where}: lista de puertos inválida (máximo ${LIMITS.portsPerEntity}).`);
  const ports: Port[] = [], seen = new Set<string>();
  for (const p of raw.ports) {
    const r = parsePort(p, where); if (!r.ok) return r;
    if (seen.has(r.value.id)) return fail(`${where}: el puerto «${r.value.id}» está repetido.`);
    seen.add(r.value.id); ports.push(r.value);
  }
  if (!oneOf(LIFECYCLES, raw.lifecycle)) return fail(`${where}: estado de ciclo de vida desconocido.`);
  if (!str(raw.owner, LIMITS.id) || !safeKey(raw.owner)) return fail(`${where}: falta el propietario.`);
  if (raw.provenance !== undefined && !oneOf(PROVENANCES, raw.provenance)) return fail(`${where}: procedencia desconocida.`);
  if (raw.locked !== undefined && typeof raw.locked !== 'boolean') return fail(`${where}: «locked» debe ser verdadero o falso.`);
  return {ok: true, value: {
    id: raw.id, type: raw.type, label: raw.label, pose: {position: [...raw.pose.position] as Vec3, rotation: [...raw.pose.rotation] as Vec3},
    params: params.value, ports, state: state.value, lifecycle: raw.lifecycle, owner: raw.owner,
    ...(raw.provenance !== undefined ? {provenance: raw.provenance as Entity['provenance']} : {}), ...(raw.locked !== undefined ? {locked: raw.locked as boolean} : {}),
  }};
}

function parseConnection(raw: unknown, index: number, byId: Map<string, Entity>): Result<Connection> {
  const at = `Conexión ${index + 1}`;
  if (!isRec(raw)) return fail(`${at}: no es válida.`);
  if (!str(raw.id, LIMITS.id) || !safeKey(raw.id)) return fail(`${at}: id inválido.`);
  const where = `${at} «${raw.id}»`;
  if (!oneOf(PORT_KINDS, raw.kind)) return fail(`${where}: tipo desconocido.`);
  if (!oneOf(CONNECTION_STATUSES, raw.status)) return fail(`${where}: estado desconocido.`);
  const refs: Port[] = [];
  for (const side of ['a', 'b'] as const) {
    const ref = raw[side];
    if (!isRec(ref) || !str(ref.entityId, LIMITS.id) || !str(ref.portId, LIMITS.id)) return fail(`${where}: el extremo «${side}» no es válido.`);
    const entity = byId.get(ref.entityId);
    if (!entity) return fail(`${where}: el componente «${ref.entityId}» no existe.`);
    const port = entity.ports.find(p => p.id === ref.portId);
    if (!port) return fail(`${where}: el puerto «${ref.portId}» no existe en «${ref.entityId}».`);
    if (port.kind !== raw.kind) return fail(`${where}: el puerto «${ref.portId}» no es de tipo ${raw.kind}.`);
    refs.push(port);
  }
  const a = raw.a as Rec, b = raw.b as Rec;
  if (a.entityId === b.entityId && a.portId === b.portId) return fail(`${where}: un puerto no se puede unir consigo mismo.`);
  if (raw.reason !== undefined && !str(raw.reason, LIMITS.text)) return fail(`${where}: motivo inválido.`);
  if (raw.route !== undefined && (!Array.isArray(raw.route) || raw.route.length > LIMITS.route || !raw.route.every(vec3))) return fail(`${where}: ruta inválida.`);
  // Una unión que se declara física no puede ser incompatible: el estado nunca contradice a los puertos.
  if (oneOf(PHYSICAL_STATUSES, raw.status)) {
    const fits = checkPorts(refs[0], refs[1]);
    if (!fits.ok) return fail(`${where}: figura como «${raw.status}» pero los puertos no son compatibles (${fits.error})`);
  }
  return {ok: true, value: {
    id: raw.id, kind: raw.kind, a: {entityId: a.entityId as string, portId: a.portId as string}, b: {entityId: b.entityId as string, portId: b.portId as string}, status: raw.status,
    ...(raw.reason !== undefined ? {reason: raw.reason as string} : {}), ...(raw.route !== undefined ? {route: (raw.route as Vec3[]).map(v => [...v] as Vec3)} : {}),
  }};
}

function parseScenario(raw: unknown): Result<Scenario> {
  if (!isRec(raw)) return fail('Falta el escenario.');
  if (raw.origin !== 'template' && raw.origin !== 'location' && raw.origin !== 'blank') return fail('Origen del escenario desconocido.');
  if (!str(raw.label, LIMITS.label)) return fail('Falta el nombre del escenario.');
  if (!oneOf(PROVENANCES, raw.provenance)) return fail('Procedencia del escenario desconocida.');
  const land = raw.land;
  if (!isRec(land)) return fail('Faltan las superficies del escenario.');
  const keys = ['visibleHa', 'administeredHa', 'authorizedHa', 'cultivatedHa'] as const;
  for (const k of keys) if (!num(land[k]) || (land[k] as number) < 0) return fail(`Superficie «${k}» inválida.`);
  const [v, ad, au, cu] = keys.map(k => land[k] as number);
  // Visible ≥ administrada ≥ cultivada, y autorizada dentro de lo visible: no se confunden las superficies.
  if (ad > v || au > v || cu > ad) return fail('Las superficies no son coherentes: lo cultivado cabe en lo administrado y todo cabe en lo visible.');
  const site = raw.site;
  if (site !== undefined && (!Array.isArray(site) || site.length !== 2 || !site.every(num))) return fail('El emplazamiento es inválido.');
  return {ok: true, value: {origin: raw.origin, label: raw.label, provenance: raw.provenance, ...(site ? {site: [site[0], site[1]] as [number, number]} : {}), land: {visibleHa: v, administeredHa: ad, authorizedHa: au, cultivatedHa: cu}}};
}

function parseTerrain(raw: unknown): Result<Terrain> {
  if (!isRec(raw)) return fail('Falta el terreno.');
  const size = raw.sizeMeters;
  if (!Array.isArray(size) || size.length !== 2 || !size.every(num) || size.some(s => s <= 0 || s > LIMITS.maxSideMeters)) return fail(`El tamaño del terreno debe ser dos números entre 0 y ${LIMITS.maxSideMeters} m.`);
  if (!num(raw.cellMeters) || raw.cellMeters < LIMITS.minCellMeters || raw.cellMeters > Math.min(size[0], size[1])) return fail('El tamaño de celda del terreno es inválido.');
  if (!Number.isInteger(raw.seed) || (raw.seed as number) < 0 || (raw.seed as number) > 0x7fffffff) return fail('La semilla del terreno debe ser un entero de 31 bits.');
  if (!Array.isArray(raw.edits) || raw.edits.length > LIMITS.terrainEdits) return fail(`Demasiadas ediciones de terreno (máximo ${LIMITS.terrainEdits}).`);
  const edits: TerrainEdit[] = [], ids = new Set<string>();
  for (const [i, e] of raw.edits.entries()) {
    if (!isRec(e) || !str(e.id, LIMITS.id) || !safeKey(e.id) || !oneOf(TERRAIN_EDIT_KINDS, e.kind)) return fail(`Edición de terreno ${i + 1} inválida.`);
    if (ids.has(e.id)) return fail(`Edición de terreno repetida: «${e.id}».`);
    if (!Array.isArray(e.center) || e.center.length !== 2 || !e.center.every(num) || !num(e.radius) || e.radius <= 0 || !num(e.amount) || !num(e.at) || e.at < 0) return fail(`Edición de terreno «${e.id}» fuera de rango.`);
    ids.add(e.id); edits.push({id: e.id, kind: e.kind, center: [e.center[0], e.center[1]], radius: e.radius, amount: e.amount, at: e.at});
  }
  return {ok: true, value: {sizeMeters: [size[0], size[1]], cellMeters: raw.cellMeters, seed: raw.seed as number, edits}};
}

function parseClock(raw: unknown): Result<Clock> {
  if (!isRec(raw)) return fail('Falta el reloj de simulación.');
  if (!num(raw.simSeconds) || raw.simSeconds < 0) return fail('El tiempo simulado debe ser un número no negativo.');
  if (!oneOf(SIM_SPEEDS, raw.speed)) return fail(`La velocidad debe ser una de ${SIM_SPEEDS.join(', ')}.`);
  if (!Number.isInteger(raw.seed) || (raw.seed as number) < 0 || (raw.seed as number) > 0x7fffffff) return fail('La semilla de simulación debe ser un entero de 31 bits.');
  if (!isoDate(raw.startDate)) return fail('La fecha de inicio simulada no es válida.');
  return {ok: true, value: {simSeconds: raw.simSeconds, speed: raw.speed, seed: raw.seed as number, startDate: raw.startDate}};
}

/** Valida un mundo ya leído (JSON). Lo migra a la versión vigente y devuelve una copia limpia (sin campos desconocidos). */
export function parseWorld(input: unknown): Result<WorldProject> {
  const migrated = migrateWorld(input); if (!migrated.ok) return migrated;
  const raw = migrated.value;
  if (!str(raw.id, LIMITS.id) || !safeKey(raw.id)) return fail('El mundo no tiene un id válido.');
  if (!str(raw.name, LIMITS.name)) return fail('El nombre del mundo no es válido.');
  if (!isoDate(raw.createdAt) || !isoDate(raw.updatedAt)) return fail('Las fechas del mundo no son válidas.');
  if (!oneOf(EXPERIENCE_MODES, raw.experience)) return fail('La experiencia debe ser «learning», «free» o «real».');
  const scenario = parseScenario(raw.scenario); if (!scenario.ok) return scenario;
  const terrain = parseTerrain(raw.terrain); if (!terrain.ok) return terrain;
  if (scenario.value.site?.some((coordinate, axis) => Math.abs(coordinate) > terrain.value.sizeMeters[axis] / 2)) return fail('El emplazamiento queda fuera del terreno.');
  const clock = parseClock(raw.clock); if (!clock.ok) return clock;
  if (!Array.isArray(raw.entities) || raw.entities.length > LIMITS.entities) return fail(`La lista de componentes es inválida (máximo ${LIMITS.entities}).`);
  if (!Array.isArray(raw.connections) || raw.connections.length > LIMITS.connections) return fail(`La lista de conexiones es inválida (máximo ${LIMITS.connections}).`);
  const entities: Entity[] = [], byId = new Map<string, Entity>();
  for (const [i, e] of raw.entities.entries()) {
    const r = parseEntity(e, i); if (!r.ok) return r;
    if (byId.has(r.value.id)) return fail(`Hay dos componentes con el mismo id «${r.value.id}»: una pieza física no puede existir dos veces.`);
    byId.set(r.value.id, r.value); entities.push(r.value);
  }
  const connections: Connection[] = [], used = new Set<string>(), pairs = new Set<string>();
  for (const [i, c] of raw.connections.entries()) {
    const r = parseConnection(c, i, byId); if (!r.ok) return r;
    if (used.has(r.value.id)) return fail(`Hay dos conexiones con el mismo id «${r.value.id}».`);
    const ka = `${r.value.a.entityId}:${r.value.a.portId}`, kb = `${r.value.b.entityId}:${r.value.b.portId}`, key = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (pairs.has(key)) return fail(`La conexión «${r.value.id}» repite una unión que ya existe.`);
    used.add(r.value.id); pairs.add(key); connections.push(r.value);
  }
  const plc = parsePlc(raw.plc, byId); if (!plc.ok) return plc;
  const economy = parseEconomy(raw.economy); if (!economy.ok) return economy;
  return {ok: true, value: {format: FORMAT, version: CURRENT_VERSION, id: raw.id, name: raw.name, createdAt: raw.createdAt, updatedAt: raw.updatedAt, experience: raw.experience, scenario: scenario.value, terrain: terrain.value, clock: clock.value, entities, connections, ...(plc.value ? {plc: plc.value} : {}), ...(economy.value ? {economy: economy.value} : {})}};
}

/** Economía (Fase 6): opcional; números finitos y listas acotadas. Se copian solo los campos conocidos. */
function parseEconomy(raw: unknown): Result<Economy | undefined> {
  if (raw === undefined) return {ok: true, value: undefined};
  if (!isRec(raw) || !num(raw.money) || !isRec(raw.delivered) || !Array.isArray(raw.orders) || !Array.isArray(raw.ledger)) return fail('La economía del mundo no tiene el formato esperado.');
  if (raw.orders.length > 200 || raw.ledger.length > 200) return fail('La economía del mundo tiene demasiados pedidos o movimientos.');
  const delivered: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw.delivered)) { if (!safeKey(k) || k.length > 40 || !num(v) || !Number.isInteger(v) || v < 0 || v > 100_000) return fail(`Economía: unidades recibidas inválidas en «${k}».`); delivered[k] = v; }
  const orders: Order[] = [];
  for (const o of raw.orders) {
    if (!isRec(o) || !str(o.id, 60) || !str(o.type, 40) || !safeKey(o.type) || !num(o.qty) || !Number.isInteger(o.qty) || o.qty < 1 || o.qty > 1000 || !num(o.cost) || !num(o.orderedAt) || !num(o.deliverAt) || typeof o.delivered !== 'boolean') return fail('Economía: un pedido no es válido.');
    orders.push({id: o.id, type: o.type, qty: o.qty, cost: o.cost, orderedAt: o.orderedAt, deliverAt: o.deliverAt, delivered: o.delivered});
  }
  const ledger: LedgerEntry[] = [];
  for (const l of raw.ledger) { if (!isRec(l) || !num(l.at) || !num(l.amount) || typeof l.text !== 'string' || l.text.length > LIMITS.text) return fail('Economía: un movimiento no es válido.'); ledger.push({at: l.at, text: l.text, amount: l.amount}); }
  return {ok: true, value: {money: raw.money, delivered, orders, ledger}};
}

/** Programas de PLC (Fase 5): opcionales; cada uno pertenece a un tablero que existe. Se copian solo los campos conocidos. */
function parsePlc(raw: unknown, byId: Map<string, Entity>): Result<Record<string, AgroProgram> | undefined> {
  if (raw === undefined) return {ok: true, value: undefined};
  if (!isRec(raw)) return fail('Los programas de PLC no son válidos.');
  const out: Record<string, AgroProgram> = {};
  for (const [id, p] of Object.entries(raw)) {
    if (byId.get(id)?.type !== 'tablero') return fail(`Hay un programa de PLC para «${id}», que no es un tablero del mundo.`);
    if (!isRec(p) || !Array.isArray(p.rungs) || !Array.isArray(p.hmi)) return fail(`El programa de PLC de «${id}» no tiene el formato esperado.`);
    const rungs = p.rungs.map(r => (isRec(r) && isRec(r.coil) && Array.isArray(r.branches) ? {id: String(r.id), ...(typeof r.comment === 'string' ? {comment: r.comment.slice(0, LIMITS.text)} : {}), branches: r.branches.map(b => (Array.isArray(b) ? b.map(c => (isRec(c) ? {tag: String(c.tag), ...(c.nc === true ? {nc: true} : {})} : null)) : null)), coil: {tag: String(r.coil.tag), mode: String(r.coil.mode), ...(typeof r.coil.preset === 'number' ? {preset: r.coil.preset} : {})}} : null));
    const hmi = p.hmi.map(w => (isRec(w) ? {id: String(w.id), kind: String(w.kind), label: String(w.label), ...(typeof w.tag === 'string' ? {tag: w.tag} : {})} : null));
    if (rungs.some(r => r === null || r.branches.some(b => b === null || b.some(c => c === null))) || hmi.some(w => w === null)) return fail(`El programa de PLC de «${id}» tiene elementos mal formados.`);
    const program = {rungs, hmi} as unknown as AgroProgram, bad = validateProgram(program);
    if (bad) return fail(`Programa de PLC de «${byId.get(id)!.label}»: ${bad}`);
    out[id] = program;
  }
  return {ok: true, value: Object.keys(out).length ? out : undefined};
}

/** Valida el texto de un archivo (tamaño, JSON y contenido). */
export function parseWorldText(text: string): Result<WorldProject> {
  if (text.length > LIMITS.importBytes) return fail(`El archivo supera el límite de ${LIMITS.importBytes / 1024 / 1024} MB.`);
  let data: unknown;
  try { data = JSON.parse(text); } catch { return fail('El archivo no es un JSON válido.'); }
  return parseWorld(data);
}

/** Serializa un mundo ya validado. */
export const exportWorld = (w: WorldProject): {filename: string; text: string} => ({
  filename: `${w.name.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'mundo'}.modoagro.json`,
  text: JSON.stringify(w, null, 2),
});
