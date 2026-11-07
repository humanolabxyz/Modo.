// Operaciones sobre el proyecto: puras, inmutables y validadas. Devuelven un proyecto nuevo o un error legible.
// Ninguna borra dependencias en silencio: removeEntity pide confirmación explícita y devuelve lo que depende.
import {IDENTITY_POSE, newId} from './defaults.ts';
import {hasMountCycle} from './validate.ts';
import {
  LIMITS, type AnchorRef, type Binding, type BindingKind, type Connection, type ConnectionKind, type Dependencies, type EducationMode, type Entity,
  type IndustryProject, type Mount, type MountKind, type Pose, type PropValue, type Result, type SymbolPlacement, type TerminalRef, type Vec3,
} from './types.ts';

const ok = (value: IndustryProject): Result<IndustryProject> => ({ok: true, value});
const fail = (error: string): Result<IndustryProject> => ({ok: false, error});
const entity = (p: IndustryProject, id: string): Entity | undefined => p.entities.find(e => e.id === id);
const samePin = (a: TerminalRef, b: TerminalRef): boolean => a.entityId === b.entityId && a.terminalId === b.terminalId;

export function addEntity(p: IndustryProject, input: {definitionId: string; label: string; pose?: Pose; props?: Record<string, PropValue>; id?: string}): Result<IndustryProject> {
  if (p.entities.length >= LIMITS.entities) return fail(`El proyecto admite hasta ${LIMITS.entities} componentes.`);
  const label = input.label.trim();
  if (!label || label.length > LIMITS.label) return fail('El nombre del componente no es válido.');
  if (!input.definitionId) return fail('Falta el tipo de componente.');
  const id = input.id ?? newId('e');
  if (entity(p, id)) return fail(`Ya existe un componente con el id «${id}».`);
  const pose = input.pose ?? IDENTITY_POSE;
  return ok({...p, entities: [...p.entities, {id, definitionId: input.definitionId, label, props: {...(input.props ?? {})}}], poses: {...p.poses, [id]: {position: [...pose.position], rotation: [...pose.rotation]}}});
}

export function renameEntity(p: IndustryProject, id: string, label: string): Result<IndustryProject> {
  const target = entity(p, id);
  if (!target) return fail('El componente no existe.');
  const clean = label.trim();
  if (!clean || clean.length > LIMITS.label) return fail('El nombre del componente no es válido.');
  return ok({...p, entities: p.entities.map(e => (e.id === id ? {...e, label: clean} : e))});
}

export function setEntityProp(p: IndustryProject, id: string, key: string, value: PropValue | null): Result<IndustryProject> {
  const target = entity(p, id);
  if (!target) return fail('El componente no existe.');
  if (!key || key.length > 40) return fail('El nombre de la propiedad no es válido.');
  const props = {...target.props};
  if (value === null) delete props[key]; else props[key] = value;
  return ok({...p, entities: p.entities.map(e => (e.id === id ? {...e, props} : e))});
}

export function setPose(p: IndustryProject, id: string, pose: Pose): Result<IndustryProject> {
  if (!entity(p, id)) return fail('El componente no existe.');
  return ok({...p, poses: {...p.poses, [id]: {position: [...pose.position] as Vec3, rotation: [...pose.rotation] as Vec3}}});
}

export function setSymbols(p: IndustryProject, id: string, symbols: SymbolPlacement[]): Result<IndustryProject> {
  if (!entity(p, id)) return fail('El componente no existe.');
  if (symbols.length > LIMITS.symbolsPerEntity) return fail('Hay demasiados símbolos para un componente.');
  return ok({...p, symbols: {...p.symbols, [id]: symbols.map(s => ({...s}))}});
}

/** Montaje físico. No crea conexiones ni asociaciones. */
export function mount(p: IndustryProject, parent: AnchorRef, child: AnchorRef, kind: MountKind): Result<IndustryProject> {
  if (p.mounts.length >= LIMITS.mounts) return fail(`El proyecto admite hasta ${LIMITS.mounts} montajes.`);
  if (!entity(p, parent.entityId) || !entity(p, child.entityId)) return fail('El componente no existe.');
  if (parent.entityId === child.entityId) return fail('Un componente no puede montarse sobre sí mismo.');
  if (entity(p, child.entityId)?.locked) return fail('El componente está bloqueado.');
  if (p.mounts.some(m => m.child.entityId === child.entityId)) return fail('El componente ya está montado; libéralo antes de volver a montarlo.');
  if (p.mounts.some(m => m.parent.entityId === parent.entityId && m.parent.anchorId === parent.anchorId && m.kind !== 'din-rail' && m.kind !== 'surface')) return fail('Ese anclaje ya está ocupado.');
  const next: Mount = {id: newId('m'), kind, parent: {...parent}, child: {...child}};
  if (hasMountCycle([...p.mounts, next])) return fail('Ese montaje crearía un ciclo.');
  return ok({...p, mounts: [...p.mounts, next]});
}

/** Libera: elimina únicamente la relación de montaje. Conexiones, asociaciones, pose e identidad se conservan. */
export function release(p: IndustryProject, mountId: string): Result<IndustryProject> {
  if (!p.mounts.some(m => m.id === mountId)) return fail('El montaje no existe.');
  return ok({...p, mounts: p.mounts.filter(m => m.id !== mountId)});
}

/** Conexión eléctrica o de proceso. No implica montaje. Queda «sin verificar» hasta que haya datos para validarla. */
export function connect(p: IndustryProject, a: TerminalRef, b: TerminalRef, kind: ConnectionKind, label?: string): Result<IndustryProject> {
  if (p.connections.length >= LIMITS.connections) return fail(`El proyecto admite hasta ${LIMITS.connections} conexiones.`);
  if (!entity(p, a.entityId) || !entity(p, b.entityId)) return fail('El componente no existe.');
  if (samePin(a, b)) return fail('No se puede unir un terminal consigo mismo.');
  if (p.connections.some(c => c.kind === kind && ((samePin(c.a, a) && samePin(c.b, b)) || (samePin(c.a, b) && samePin(c.b, a))))) return fail('Esa conexión ya existe.');
  const clean = label?.trim();
  if (clean !== undefined && (clean.length === 0 || clean.length > LIMITS.label)) return fail('La etiqueta de la conexión no es válida.');
  const next: Connection = {id: newId('c'), kind, a: {...a}, b: {...b}, status: 'unverified', ...(clean ? {label: clean} : {})};
  return ok({...p, connections: [...p.connections, next]});
}

/** Desconecta: elimina solo ese enlace. */
export function disconnect(p: IndustryProject, connectionId: string): Result<IndustryProject> {
  if (!p.connections.some(c => c.id === connectionId)) return fail('La conexión no existe.');
  return ok({...p, connections: p.connections.filter(c => c.id !== connectionId), faults: p.faults.filter(f => f.connectionId !== connectionId)});
}

export function setConnectionRoute(p: IndustryProject, connectionId: string, route: Vec3[]): Result<IndustryProject> {
  const target = p.connections.find(c => c.id === connectionId);
  if (!target) return fail('La conexión no existe.');
  if (route.length > LIMITS.route) return fail(`Una ruta admite hasta ${LIMITS.route} puntos.`);
  return ok({...p, connections: p.connections.map(c => (c.id === connectionId ? {...c, route: route.map(v => [...v] as Vec3)} : c))});
}

/** Asociación lógica (variable de PLC, widget de HMI, símbolo de diagrama). No implica montaje ni conexión. */
export function bind(p: IndustryProject, input: {kind: BindingKind; entityId: string; terminalId?: string; target: string}): Result<IndustryProject> {
  if (p.bindings.length >= LIMITS.bindings) return fail(`El proyecto admite hasta ${LIMITS.bindings} asociaciones.`);
  if (!entity(p, input.entityId)) return fail('El componente no existe.');
  const target = input.target.trim();
  if (!target || target.length > 120) return fail('El destino de la asociación no es válido.');
  if (p.bindings.some(b => b.kind === input.kind && b.entityId === input.entityId && b.terminalId === input.terminalId && b.target === target)) return fail('Esa asociación ya existe.');
  const next: Binding = {id: newId('b'), kind: input.kind, entityId: input.entityId, target, ...(input.terminalId !== undefined ? {terminalId: input.terminalId} : {})};
  return ok({...p, bindings: [...p.bindings, next]});
}

export function unbind(p: IndustryProject, bindingId: string): Result<IndustryProject> {
  if (!p.bindings.some(b => b.id === bindingId)) return fail('La asociación no existe.');
  return ok({...p, bindings: p.bindings.filter(b => b.id !== bindingId)});
}

/** Todo lo que se vería afectado si se elimina la entidad. */
export function dependenciesOf(p: IndustryProject, id: string): Dependencies {
  return {
    mounts: p.mounts.filter(m => m.parent.entityId === id || m.child.entityId === id),
    connections: p.connections.filter(c => c.a.entityId === id || c.b.entityId === id),
    bindings: p.bindings.filter(b => b.entityId === id),
    symbols: p.symbols[id]?.length ?? 0,
    program: (p.plc[id]?.rungs.length ?? 0) + p.hmi.widgets.filter(w => w.plcId === id).length + p.faults.filter(f => f.entityId === id).length,
  };
}

export const hasDependencies = (d: Dependencies): boolean => d.mounts.length + d.connections.length + d.bindings.length + d.symbols + d.program > 0;

/** Elimina un componente. Con dependencias exige `confirm: true`; el error incluye cuántas son. Nunca borra referencias a escondidas. */
export function removeEntity(p: IndustryProject, id: string, options: {confirm?: boolean} = {}): Result<IndustryProject> & {dependencies?: Dependencies} {
  const target = entity(p, id);
  if (!target) return fail('El componente no existe.');
  if (target.locked) return fail('El componente está bloqueado.');
  const dependencies = dependenciesOf(p, id);
  if (hasDependencies(dependencies) && !options.confirm) {
    const parts = [
      dependencies.mounts.length ? `${dependencies.mounts.length} montaje(s)` : '',
      dependencies.connections.length ? `${dependencies.connections.length} conexión(es)` : '',
      dependencies.bindings.length ? `${dependencies.bindings.length} asociación(es)` : '',
      dependencies.symbols ? `${dependencies.symbols} símbolo(s) de diagrama` : '',
      dependencies.program ? `${dependencies.program} línea(s) de programa, widget(s) de HMI o falla(s)` : '',
    ].filter(Boolean).join(', ');
    return {ok: false, error: `«${target.label}» tiene ${parts}. Revísalos y confirma para eliminarlo.`, dependencies};
  }
  const {[id]: _pose, ...poses} = p.poses;
  const {[id]: _symbols, ...symbols} = p.symbols;
  const {[id]: _program, ...plc} = p.plc;
  return {...ok({
    ...p,
    entities: p.entities.filter(e => e.id !== id),
    mounts: p.mounts.filter(m => !dependencies.mounts.includes(m)),
    connections: p.connections.filter(c => !dependencies.connections.includes(c)),
    bindings: p.bindings.filter(b => !dependencies.bindings.includes(b)),
    poses, symbols, plc, hmi: {widgets: p.hmi.widgets.filter(w => w.plcId !== id)},
    faults: p.faults.filter(f => f.entityId !== id && !dependencies.connections.some(c => c.id === f.connectionId)),
  }), dependencies};
}

export function setMode(p: IndustryProject, mode: EducationMode): Result<IndustryProject> {
  return p.mode === mode ? ok(p) : ok({...p, mode});
}
