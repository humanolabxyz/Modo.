// Operaciones PURAS e inmutables sobre el proyecto (docs/robotica/02 §6). Cada una devuelve un proyecto nuevo.
import {getDefinition} from '../catalog/index.ts';
import type {AnchorDefinition} from '../catalog/types.ts';
import {forestObstacle} from './forest.ts';
import {newId} from './defaults.ts';
import {len, motion, qFromEuler, qNorm, sub, tInv, tMul, tPoint, qRotate, scale} from './math.ts';
import {LIMITS, type Attachment, type PartInstance, type Quat, type RobotProject, type Transform, type Vec3} from './types.ts';

export type CommandResult = {project: RobotProject; /** Avisos para mostrar al usuario (p. ej. uniones rotas). */ notes: string[]};
export type CommandError = {error: string};

const part = (p: RobotProject, id: string) => p.parts.find(x => x.instanceId === id);
const replaceParts = (p: RobotProject, parts: PartInstance[]): RobotProject => ({...p, parts});

/** Piezas que cuelgan (directa o indirectamente) de las dadas, incluidas ellas mismas. */
export function closure(p: RobotProject, ids: readonly string[]): Set<string> {
  const out = new Set(ids);
  let grew = true;
  while (grew) {
    grew = false;
    for (const a of p.attachments) if (out.has(a.parent.instanceId) && !out.has(a.child.instanceId)) { out.add(a.child.instanceId); grew = true; }
  }
  return out;
}
export const parentAttachment = (p: RobotProject, id: string): Attachment | undefined => p.attachments.find(a => a.child.instanceId === id);
export const childAttachments = (p: RobotProject, id: string): Attachment[] => p.attachments.filter(a => a.parent.instanceId === id);

/** Etiqueta única «Motor DC TT 2». */
function nextLabel(p: RobotProject, definitionName: string): string {
  const taken = new Set(p.parts.map(x => x.label));
  for (let n = 1; ; n++) { const label = `${definitionName} ${n}`; if (!taken.has(label)) return label; }
}

export function addPart(p: RobotProject, definitionId: string, position: Vec3 = [0, 0, 0], rotation: Quat = [0, 0, 0, 1]): CommandResult | CommandError {
  const def = getDefinition(definitionId);
  if (!def) return {error: `La pieza «${definitionId}» no existe en el catálogo.`};
  if (p.parts.length >= LIMITS.parts) return {error: `Un proyecto admite hasta ${LIMITS.parts} piezas.`};
  const props = def.props ? Object.fromEntries(def.props.map(x => [x.id, x.default as number | string | boolean])) : undefined;
  const instance: PartInstance = {instanceId: newId(), definitionId, label: nextLabel(p, def.name), transform: {position, rotation: qNorm(rotation)}, ...(props ? {props} : {})};
  return {project: replaceParts(p, [...p.parts, instance]), notes: []};
}

/** Quita piezas y todo lo que dependía de ellas. Las piezas unidas a las quitadas quedan sueltas (con aviso). */
export function removeParts(p: RobotProject, ids: readonly string[]): CommandResult {
  const gone = new Set(ids.filter(id => part(p, id) && !part(p, id)!.locked));
  const notes: string[] = [];
  if (ids.length > gone.size) notes.push('Las piezas bloqueadas no se borran. Desbloquéalas primero.');
  const lostAttachments = p.attachments.filter(a => gone.has(a.parent.instanceId) || gone.has(a.child.instanceId));
  const lostConnections = p.connections.filter(c => gone.has(c.a.instanceId) || gone.has(c.b.instanceId));
  const lostFirmware = p.firmware.filter(f => gone.has(f.targetInstanceId));
  if (lostAttachments.length) notes.push(`Se rompieron ${lostAttachments.length} unión(es) mecánica(s).`);
  if (lostConnections.length) notes.push(`Se quitaron ${lostConnections.length} cable(s).`);
  if (lostFirmware.length) notes.push('Se quitó el programa de la placa borrada.');
  const lostArmProgram = p.armProgram && (gone.has(p.armProgram.armId) || p.armProgram.points.some(point => point.expectedHeld && gone.has(point.expectedHeld)));
  if (lostArmProgram) notes.push('Se quitó el programa del brazo porque se borró una pieza requerida. Puedes preparar un ciclo nuevo.');
  return {
    project: {...p, ...(lostArmProgram ? {armProgram: undefined} : {}), parts: p.parts.filter(x => !gone.has(x.instanceId)).map(x => typeof x.props?.held === 'string' && gone.has(x.props.held) ? {...x, props: {...x.props, held: '', gripperOpen: true}} : x), attachments: p.attachments.filter(a => !lostAttachments.includes(a)), connections: p.connections.filter(c => !lostConnections.includes(c)), firmware: p.firmware.filter(f => !lostFirmware.includes(f))},
    notes,
  };
}

/**
 * Aplica un movimiento rígido (en coordenadas del mundo) a las piezas indicadas y a todo lo que cuelga de ellas.
 * Una pieza unida a un padre que NO se mueve se separa de él (con aviso): una unión no admite que el hijo se desplace por su cuenta.
 */
export function moveParts(p: RobotProject, ids: readonly string[], m: Transform): CommandResult {
  const notes: string[] = [];
  const movable = ids.filter(id => part(p, id) && !part(p, id)!.locked);
  if (movable.length < ids.length) notes.push('Las piezas bloqueadas no se mueven.');
  const moving = closure(p, movable);
  const broken = p.attachments.filter(a => moving.has(a.child.instanceId) && !moving.has(a.parent.instanceId));
  for (const a of broken) notes.push(`${part(p, a.child.instanceId)?.label} se separó de ${part(p, a.parent.instanceId)?.label}.`);
  return {
    project: {...replaceParts(p, p.parts.map(x => (moving.has(x.instanceId) ? {...x, transform: tMul(m, x.transform)} : x))), attachments: p.attachments.filter(a => !broken.includes(a))},
    notes,
  };
}

/** Fija la transformación absoluta de una pieza (ventana Propiedades). Arrastra a sus hijos. */
export function setPartTransform(p: RobotProject, id: string, next: Transform): CommandResult {
  const current = part(p, id);
  if (!current) return {project: p, notes: []};
  return moveParts(p, [id], tMul(next, tInv(current.transform)));
}

export const translateParts = (p: RobotProject, ids: readonly string[], delta: Vec3) => moveParts(p, ids, motion(delta));
export const rotatePartsAround = (p: RobotProject, ids: readonly string[], q: Quat, center: Vec3) => moveParts(p, ids, motion([0, 0, 0], q, center));
export const eulerToQuat = (deg: Vec3): Quat => qFromEuler([deg[0] * Math.PI / 180, deg[1] * Math.PI / 180, deg[2] * Math.PI / 180]);

export const renamePart = (p: RobotProject, id: string, label: string): RobotProject => replaceParts(p, p.parts.map(x => (x.instanceId === id ? {...x, label: label.slice(0, LIMITS.label) || x.label} : x)));
export const setLocked = (p: RobotProject, ids: readonly string[], locked: boolean): RobotProject => replaceParts(p, p.parts.map(x => (ids.includes(x.instanceId) ? {...x, locked: locked || undefined} : x)));
export const setPartProp = (p: RobotProject, id: string, key: string, value: number | string | boolean): RobotProject => replaceParts(p, p.parts.map(x => (x.instanceId === id ? {...x, props: {...x.props, [key]: value}} : x)));

/** Duplica las piezas (con lo que cuelga de ellas), conserva las uniones y cables internos y las desplaza un poco. */
export function duplicateParts(p: RobotProject, ids: readonly string[], offset: Vec3 = [0.03, 0, 0.03], copyProgram = false): CommandResult | CommandError {
  const set = closure(p, ids.filter(id => part(p, id)));
  if (!set.size) return {project: p, notes: []};
  if (p.parts.length + set.size > LIMITS.parts) return {error: `Un proyecto admite hasta ${LIMITS.parts} piezas.`};
  const map = new Map<string, string>();
  let draft = p;
  const copies: PartInstance[] = [];
  for (const orig of p.parts.filter(x => set.has(x.instanceId))) {
    const def = getDefinition(orig.definitionId);
    const id = newId(); map.set(orig.instanceId, id);
    copies.push({...structuredClone(orig), instanceId: id, label: nextLabel({...draft, parts: [...draft.parts, ...copies]}, def?.name ?? orig.label), locked: undefined, groupId: undefined, transform: {...orig.transform, position: [orig.transform.position[0] + offset[0], orig.transform.position[1] + offset[1], orig.transform.position[2] + offset[2]]}});
  }
  draft = {...p, parts: [...p.parts, ...copies]};
  const attachments = p.attachments.filter(a => set.has(a.parent.instanceId) && set.has(a.child.instanceId)).map(a => ({...structuredClone(a), id: newId(), parent: {...a.parent, instanceId: map.get(a.parent.instanceId)!}, child: {...a.child, instanceId: map.get(a.child.instanceId)!}}));
  const connections = p.connections.filter(c => set.has(c.a.instanceId) && set.has(c.b.instanceId)).map(c => ({...structuredClone(c), id: newId(), a: {...c.a, instanceId: map.get(c.a.instanceId)!}, b: {...c.b, instanceId: map.get(c.b.instanceId)!}, route: undefined}));
  const programs = copyProgram ? p.firmware.filter(f => map.has(f.targetInstanceId)) : [];
  if (p.firmware.length + programs.length > LIMITS.firmware) return {error: 'Se alcanzó el máximo de placas programadas.'};
  const firmware = [...p.firmware, ...programs.map(f => ({...f, id: newId(), targetInstanceId: map.get(f.targetInstanceId)!}))];
  return {project: {...draft, firmware, attachments: [...draft.attachments, ...attachments], connections: [...draft.connections, ...connections]}, notes: []};
}

// ───── Uniones ─────
export const anchorOf = (instance: PartInstance, anchorId: string): AnchorDefinition | undefined => getDefinition(instance.definitionId)?.anchors.find(a => a.id === anchorId);
export function anchorWorld(instance: PartInstance, anchorId: string): {position: Vec3; normal: Vec3} | undefined {
  const a = anchorOf(instance, anchorId);
  return a ? {position: tPoint(instance.transform, a.position), normal: qRotate(instance.transform.rotation, a.normal)} : undefined;
}
/** Un anclaje es el anfitrión del otro si lista su etiqueta entre las que acepta. */
export const hosts = (host: AnchorDefinition, guest: AnchorDefinition): boolean => host.accepts.includes(guest.tag);

export type Ref = {instanceId: string; anchorId: string};

/** Une `child` a `parent`: coloca al hijo (y lo que cuelga de él) de modo que los dos anclajes coincidan. */
export function attach(p: RobotProject, parent: Ref, child: Ref, kind?: Attachment['kind']): CommandResult | CommandError {
  const pp = part(p, parent.instanceId), cc = part(p, child.instanceId);
  if (!pp || !cc) return {error: 'La pieza ya no existe.'};
  if (pp.instanceId === cc.instanceId) return {error: 'Una pieza no se une a sí misma.'};
  const pa = anchorOf(pp, parent.anchorId), ca = anchorOf(cc, child.anchorId);
  if (!pa || !ca) return {error: 'Ese anclaje no existe.'};
  if (!hosts(pa, ca)) return {error: `«${ca.label}» de ${cc.label} no encaja en «${pa.label}» de ${pp.label}.`};
  if (parentAttachment(p, cc.instanceId)) return {error: `${cc.label} ya está unida a otra pieza. Sepárala primero.`};
  if (p.attachments.some(a => a.parent.instanceId === pp.instanceId && a.parent.anchorId === parent.anchorId)) return {error: `«${pa.label}» de ${pp.label} ya está ocupado.`};
  if (closure(p, [cc.instanceId]).has(pp.instanceId)) return {error: 'No se pueden unir en círculo.'};
  if (p.attachments.length >= LIMITS.attachments) return {error: `Un proyecto admite hasta ${LIMITS.attachments} uniones.`};
  if (cc.locked) return {error: `${cc.label} está bloqueada.`};
  const wanted = anchorWorld(pp, parent.anchorId)!.position, have = anchorWorld(cc, child.anchorId)!.position;
  const moved = moveParts(p, [cc.instanceId], motion(sub(wanted, have)));
  const isWheel = getDefinition(cc.definitionId)?.anchors.find(a => a.id === child.anchorId)?.tag === 'wheel-hub';
  const attachment: Attachment = {id: newId(), kind: kind ?? (isWheel ? 'wheel-hinge' : 'rigid'), parent, child, ...((kind ?? (isWheel ? 'wheel-hinge' : 'rigid')) === 'wheel-hinge' ? {axis: pa.normal} : {})};
  return {project: {...moved.project, attachments: [...moved.project.attachments, attachment]}, notes: moved.notes};
}
export const detach = (p: RobotProject, attachmentId: string): RobotProject => ({...p, attachments: p.attachments.filter(a => a.id !== attachmentId)});

export function setGroup(p: RobotProject, ids: readonly string[], grouped: boolean): RobotProject {
  const groupId = grouped ? newId() : undefined;
  return replaceParts(p, p.parts.map(x => (ids.includes(x.instanceId) ? {...x, groupId} : x)));
}
/** Expande una selección a todo su grupo (clic en una pieza agrupada selecciona el grupo). */
export function expandGroups(p: RobotProject, ids: readonly string[]): string[] {
  const groups = new Set(p.parts.filter(x => ids.includes(x.instanceId) && x.groupId).map(x => x.groupId));
  return Array.from(new Set([...ids, ...p.parts.filter(x => x.groupId && groups.has(x.groupId)).map(x => x.instanceId)]));
}

/** Centro de la selección (promedio de posiciones) para colocar el gizmo. */
export function centroid(p: RobotProject, ids: readonly string[]): Vec3 | null {
  const list = p.parts.filter(x => ids.includes(x.instanceId));
  if (!list.length) return null;
  const sum = list.reduce<Vec3>((s, x) => [s[0] + x.transform.position[0], s[1] + x.transform.position[1], s[2] + x.transform.position[2]], [0, 0, 0]);
  return scale(sum, 1 / list.length);
}
export const distance = (a: Vec3, b: Vec3) => len(sub(a, b));

// ───── Cables (conexiones lógicas entre pines) ─────
export const pinWorld = (p: RobotProject, ref: {instanceId: string; pinId: string}): Vec3 | undefined => {
  const part = part_(p, ref.instanceId), pin = part && getDefinition(part.definitionId)?.pins.find(x => x.id === ref.pinId);
  return part && pin ? tPoint(part.transform, pin.position) : undefined;
};
function part_(p: RobotProject, id: string) { return p.parts.find(x => x.instanceId === id); }
const pairKey = (a: {instanceId: string; pinId: string}, b: {instanceId: string; pinId: string}) => [`${a.instanceId}:${a.pinId}`, `${b.instanceId}:${b.pinId}`].sort().join('|');

/** Crea un cable entre dos pines. Solo se rechaza lo imposible (pin inexistente, consigo mismo, repetido, tope); los errores de cableado se permiten y se diagnostican. */
export function connect(p: RobotProject, a: {instanceId: string; pinId: string}, b: {instanceId: string; pinId: string}, color = '#d64545'): CommandResult | CommandError {
  const pa = part_(p, a.instanceId), pb = part_(p, b.instanceId);
  if (!pa || !pb) return {error: 'La pieza ya no existe.'};
  if (!getDefinition(pa.definitionId)?.pins.some(x => x.id === a.pinId) || !getDefinition(pb.definitionId)?.pins.some(x => x.id === b.pinId)) return {error: 'Ese pin no existe.'};
  if (a.instanceId === b.instanceId && a.pinId === b.pinId) return {error: 'Un cable no puede empezar y terminar en el mismo pin.'};
  if (p.connections.some(c => pairKey(c.a, c.b) === pairKey(a, b))) return {error: 'Esos dos pines ya están unidos por un cable.'};
  if (p.connections.length >= LIMITS.connections) return {error: `Un proyecto admite hasta ${LIMITS.connections} cables.`};
  return {project: {...p, connections: [...p.connections, {id: newId(), a: {instanceId: a.instanceId, pinId: a.pinId}, b: {instanceId: b.instanceId, pinId: b.pinId}, color}]}, notes: []};
}
export const disconnect = (p: RobotProject, connectionId: string): RobotProject => ({...p, connections: p.connections.filter(c => c.id !== connectionId)});
export const setConnectionColor = (p: RobotProject, connectionId: string, color: string): RobotProject => ({...p, connections: p.connections.map(c => (c.id === connectionId ? {...c, color: color.slice(0, 30)} : c))});
/** Puntos de control del cable (coordenadas del mundo, solo presentación). */
export const setConnectionRoute = (p: RobotProject, connectionId: string, route: Vec3[]): RobotProject => ({...p, connections: p.connections.map(c => (c.id === connectionId ? {...c, route: route.length ? route.slice(0, 20) : undefined} : c))});

// ───── Programa (firmware) de cada placa ─────
export const SKETCH_TEMPLATE = `// Programa para el Arduino UNO.
void setup() {
  // Se ejecuta una sola vez al encender.
}

void loop() {
  // Se repite sin parar.
}
`;
export const firmwareOf = (p: RobotProject, targetId: string) => p.firmware.find(f => f.targetInstanceId === targetId);

/** Crea el programa de una placa con la plantilla si todavía no tiene. */
export function ensureFirmware(p: RobotProject, targetId: string): RobotProject {
  if (!part_(p, targetId) || firmwareOf(p, targetId) || p.firmware.length >= LIMITS.firmware) return p;
  return {...p, firmware: [...p.firmware, {id: newId(), targetInstanceId: targetId, board: 'arduino-uno-r3', source: SKETCH_TEMPLATE, updatedAt: new Date().toISOString()}]};
}
/** Guarda el texto del sketch. No toca el artefacto: si el hash ya no coincide, la interfaz pide recompilar. */
export function setFirmwareSource(p: RobotProject, targetId: string, source: string): RobotProject {
  const base = ensureFirmware(p, targetId);
  return {...base, firmware: base.firmware.map(f => (f.targetInstanceId === targetId ? {...f, source: source.slice(0, LIMITS.sketchBytes), updatedAt: new Date().toISOString()} : f))};
}
export function setFirmwareArtifact(p: RobotProject, targetId: string, artifact: NonNullable<RobotProject['firmware'][number]['artifact']> | undefined): RobotProject {
  const base = ensureFirmware(p, targetId);
  return {...base, firmware: base.firmware.map(f => (f.targetInstanceId === targetId ? {...f, artifact} : f))};
}

// ───── Etapa 5: escenario (obstáculos y fricción). El robot y los obstáculos se editan con el proyecto detenido.
export const OBSTACLE_LIMITS = {size: {min: 0.02, max: 2}, room: 2} as const;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));

/** Agrega una caja o un cilindro a 0,75 m por delante del inicio del robot (si ya hay otro ahí, lo corre a un lado). */
export function addObstacle(p: RobotProject, shape: 'box' | 'cylinder' | 'branch' | 'post'): CommandResult | CommandError {
  if (p.scene.obstacles.length >= LIMITS.obstacles) return {error: `Una escena admite hasta ${LIMITS.obstacles} obstáculos.`};
  if (shape === 'branch' || shape === 'post') {
    const position = Array.from({length: 81}, (_, i) => [((i % 9) - 4) * .4, (Math.floor(i / 9) - 4) * .4])
      .find(([x, z]) => Math.hypot(x, z) > .4 && p.scene.obstacles.every(o => Math.hypot(x - o.transform.position[0], z - o.transform.position[2]) > .32));
    if (!position) return {error: 'No queda espacio libre. Mueve o retira un obstáculo.'};
    const obstacle = forestObstacle(newId(), shape, position[0], position[1], shape === 'branch' ? [.24, .1, .075] : [.16, .48, .16], shape === 'branch');
    return {project: {...p, scene: {...p.scene, obstacles: [...p.scene.obstacles, obstacle]}}, notes: []};
  }
  const size: Vec3 = shape === 'box' ? [0.3, 0.2, 0.1] : [0.2, 0.2, 0.2], n = p.scene.obstacles.length;
  const o = {id: newId(), shape, transform: {position: [((n % 5) - 2) * 0.35, size[1] / 2, 0.75 + Math.floor(n / 5) * 0.4] as Vec3, rotation: [0, 0, 0, 1] as Quat}, size};
  return {project: {...p, scene: {...p.scene, obstacles: [...p.scene.obstacles, o]}}, notes: []};
}
/** Cambia medidas, posición (x, z en metros, dentro del cuarto de 4 × 4 m) o giro (grados sobre el eje vertical). El obstáculo siempre apoya en el suelo. */
export function updateObstacle(p: RobotProject, id: string, patch: {size?: Vec3; x?: number; z?: number; yawDeg?: number}): RobotProject {
  const lim = OBSTACLE_LIMITS, room = (p.scene.sizeM ?? 4) / 2;
  return {...p, scene: {...p.scene, obstacles: p.scene.obstacles.map(o => {
    if (o.id !== id) return o;
    const size = (patch.size ?? o.size).map(v => clamp(v, lim.size.min, lim.size.max)) as Vec3, pos = o.transform.position;
    const yaw = patch.yawDeg === undefined ? o.transform.rotation : qFromEuler([0, patch.yawDeg * Math.PI / 180, 0]);
    return {...o, size, transform: {...o.transform, position: [clamp(patch.x ?? pos[0], -room, room), size[1] / 2, clamp(patch.z ?? pos[2], -room, room)] as Vec3, rotation: yaw}};
  })}};
}
export const removeObstacle = (p: RobotProject, id: string): RobotProject => ({...p, scene: {...p.scene, obstacles: p.scene.obstacles.filter(o => o.id !== id)}});
/** Fricción del suelo, las paredes y los obstáculos (0,1–1,5); las ruedas agarran 1,5 veces más. */
export const setFriction = (p: RobotProject, friction: number): RobotProject => ({...p, scene: {...p.scene, physics: {...p.scene.physics, friction: clamp(friction, 0.1, 1.5)}}});
