// Operaciones puras sobre las entidades y conexiones de un mundo: inmutables, validadas y con motivo legible al fallar.
// Mismo patrón que `src/industria/model/commands.ts` (ninguna borra dependencias a escondidas: `removeEntity` pide confirmación).
import {checkParam, defaultParams, itemById, portsFor} from '../catalog/items.ts';
import {checkPorts} from '../model/ports.ts';
import {newId} from '../model/defaults.ts';
import {RUNTIME_KEYS, resetRuntime, validateProgram} from '../plc/program.ts';
import {LIMITS, type AgroProgram, type Connection, type Entity, type Pose, type PortRef, type PropValue, type Result} from '../model/types.ts';

export type Parts = {entities: Entity[]; connections: Connection[]; /** programas de PLC por id de tablero (Fase 5); se omite si no hay ninguno */ plc?: Record<string, AgroProgram>};
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const ok = <T>(value: T): {ok: true; value: T} => ({ok: true, value});

/** Etiqueta única y legible: «Bomba centrífuga 2». */
export function nextLabel(entities: readonly Entity[], typeId: string): string {
  const def = itemById(typeId)!, used = new Set(entities.map(e => e.label));
  for (let n = 1; ; n++) { const label = `${def.name} ${n}`; if (!used.has(label)) return label; }
}

export function buildEntity(typeId: string, pose: Pose, entities: readonly Entity[], options: {id?: string; label?: string; params?: Record<string, PropValue>} = {}): Result<Entity> {
  const def = itemById(typeId); if (!def) return fail(`Tipo de pieza desconocido: «${typeId}».`);
  const params = {...defaultParams(def), ...(options.params ?? {})};
  for (const p of def.params) { const c = checkParam(def, p.key, params[p.key]); if (!c.ok) return c; params[p.key] = c.value; }
  const label = (options.label ?? nextLabel(entities, typeId)).trim();
  if (!label || label.length > LIMITS.label) return fail('El nombre de la pieza no es válido.');
  const id = options.id ?? newId('e');
  if (entities.some(e => e.id === id)) return fail(`Ya existe una pieza con el id «${id}».`);
  return ok({id, type: typeId, label, pose: {position: [...pose.position], rotation: [...pose.rotation]}, params, ports: portsFor(def, params), state: {...def.state}, lifecycle: 'installed', owner: 'player'});
}

export function addEntity(parts: Parts, entity: Entity): Result<Parts> {
  if (parts.entities.length >= LIMITS.entities) return fail(`El mundo admite hasta ${LIMITS.entities} piezas.`);
  return ok({...parts, entities: [...parts.entities, entity]});
}

export function setPose(parts: Parts, id: string, pose: Pose): Result<Parts> {
  const e = parts.entities.find(x => x.id === id); if (!e) return fail('La pieza no existe.');
  if (e.locked) return fail(`«${e.label}» está bloqueada.`);
  return ok({...parts, entities: parts.entities.map(x => (x.id === id ? {...x, pose: {position: [...pose.position], rotation: [...pose.rotation]}} : x))});
}

export function rename(parts: Parts, id: string, label: string): Result<Parts> {
  if (!parts.entities.some(x => x.id === id)) return fail('La pieza no existe.');
  const clean = label.trim();
  if (!clean || clean.length > LIMITS.label) return fail('El nombre de la pieza no es válido.');
  if (parts.entities.some(x => x.id !== id && x.label === clean)) return fail(`Ya hay una pieza llamada «${clean}».`);
  return ok({...parts, entities: parts.entities.map(x => (x.id === id ? {...x, label: clean} : x))});
}

/** Cambia un parámetro editable y recalcula los puertos (los ids de puerto se conservan, así las conexiones siguen válidas). */
export function setParam(parts: Parts, id: string, key: string, value: number): Result<Parts> {
  const e = parts.entities.find(x => x.id === id); if (!e) return fail('La pieza no existe.');
  const def = itemById(e.type)!, c = checkParam(def, key, value); if (!c.ok) return c;
  const params = {...e.params, [key]: c.value};
  return ok({...parts, entities: parts.entities.map(x => (x.id === id ? {...x, params, ports: portsFor(def, params)} : x))});
}

export type Dependencies = {connections: Connection[]};
export const dependenciesOf = (parts: Parts, id: string): Dependencies => ({connections: parts.connections.filter(c => c.a.entityId === id || c.b.entityId === id)});
export const hasDependencies = (d: Dependencies): boolean => d.connections.length > 0;

/** Elimina una pieza. Con conexiones exige `confirm: true`; el error lista cuántas son. Nunca borra referencias a escondidas. */
export function removeEntity(parts: Parts, id: string, options: {confirm?: boolean} = {}): Result<Parts> & {dependencies?: Dependencies} {
  const e = parts.entities.find(x => x.id === id); if (!e) return fail('La pieza no existe.');
  if (e.locked) return fail(`«${e.label}» está bloqueada.`);
  const dependencies = dependenciesOf(parts, id);
  if (hasDependencies(dependencies) && !options.confirm) return {...fail(`«${e.label}» tiene ${dependencies.connections.length} conexión(es). Revísalas y confirma para eliminarla.`), dependencies};
  const plc = parts.plc && id in parts.plc ? Object.fromEntries(Object.entries(parts.plc).filter(([k]) => k !== id)) : parts.plc;   // el programa vive y muere con su tablero
  return {...ok({entities: parts.entities.filter(x => x.id !== id), connections: parts.connections.filter(c => !dependencies.connections.includes(c)), ...(plc && Object.keys(plc).length ? {plc} : {})}), dependencies};
}

/** Instala (o quita, con `null`) el programa de PLC de un tablero. Las salidas, temporizadores y contadores del PLC se reinician (las marcas M se conservan si queda programa). */
export function setProgram(parts: Parts, boardId: string, program: AgroProgram | null): Result<Parts> {
  const e = parts.entities.find(x => x.id === boardId); if (!e) return fail('La pieza no existe.');
  if (e.type !== 'tablero') return fail('Solo un tablero lleva PLC.');
  if (program !== null) { const bad = validateProgram(program); if (bad) return fail(bad); }
  const plc = {...(parts.plc ?? {})}; if (program === null) delete plc[boardId]; else plc[boardId] = program;
  const { plc: _old, ...rest } = parts;
  return ok({...rest, entities: parts.entities.map(x => (x.id === boardId ? {...x, state: {...x.state, ...resetRuntime(x.state, program !== null)}} : x)), ...(Object.keys(plc).length ? {plc} : {})});
}

/** Une dos puertos como conexión lógica (`compatible` o `incompatible` con su motivo). La unión física y su simulación llegan en la Fase 3. */
export function connect(parts: Parts, a: PortRef, b: PortRef): Result<Parts> {
  if (parts.connections.length >= LIMITS.connections) return fail(`El mundo admite hasta ${LIMITS.connections} conexiones.`);
  const ea = parts.entities.find(e => e.id === a.entityId), eb = parts.entities.find(e => e.id === b.entityId);
  const pa = ea?.ports.find(p => p.id === a.portId), pb = eb?.ports.find(p => p.id === b.portId);
  if (!ea || !eb || !pa || !pb) return fail('El puerto no existe.');
  if (a.entityId === b.entityId && a.portId === b.portId) return fail('Un puerto no se puede unir consigo mismo.');
  if (pa.kind !== pb.kind) return fail('No se pueden unir puertos de tipos distintos.');
  if (parts.connections.some(c => (sameRef(c.a, a) && sameRef(c.b, b)) || (sameRef(c.a, b) && sameRef(c.b, a)))) return fail('Esa conexión ya existe.');
  const fit = checkPorts(pa, pb);
  const connection: Connection = {id: newId('c'), kind: pa.kind, a: {...a}, b: {...b}, status: fit.ok ? 'compatible' : 'incompatible', ...(fit.ok ? {} : {reason: fit.error})};
  return ok({...parts, connections: [...parts.connections, connection]});
}
const sameRef = (x: PortRef, y: PortRef): boolean => x.entityId === y.entityId && x.portId === y.portId;

export function disconnect(parts: Parts, connectionId: string): Result<Parts> {
  if (!parts.connections.some(c => c.id === connectionId)) return fail('La conexión no existe.');
  return ok({...parts, connections: parts.connections.filter(c => c.id !== connectionId)});
}

/** Cambia un estado de la pieza (válvula abierta, interruptor, nivel del estanque…). Solo claves que el catálogo declara, con su mismo tipo y rango. */
export function setState(parts: Parts, id: string, key: string, value: PropValue): Result<Parts> {
  const e = parts.entities.find(x => x.id === id); if (!e) return fail('La pieza no existe.');
  const def = itemById(e.type)!;
  if (!(key in def.state)) return fail(`«${key}» no es un estado de ${def.name}.`);
  if (typeof value !== typeof def.state[key]) return fail(`El valor de «${key}» no es del tipo correcto.`);
  if (e.type === 'tablero' && (RUNTIME_KEYS as readonly string[]).includes(key)) return fail('El estado interno del PLC lo escribe la simulación, no el jugador.');
  if (key === 'modo' && value !== 'manual' && value !== 'auto') return fail('El modo debe ser «manual» o «auto».');
  if (typeof value === 'number') {
    const max = key === 'nivelL' ? Number(def.fixed.volumenMaxL ?? 0) : Infinity;
    if (!Number.isFinite(value) || value < 0 || value > max) return fail(`«${key}» debe estar entre 0 y ${Number.isFinite(max) ? max : '∞'}.`);
  }
  return ok({...parts, entities: parts.entities.map(x => (x.id === id ? {...x, state: {...x.state, [key]: value}} : x))});
}
