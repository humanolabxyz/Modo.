import {migrateRobotProject} from './migrate.ts';
import {LIMITS, ROBOTICS_FORMAT, ROBOTICS_VERSION, type Attachment, type Connection, type Firmware, type Obstacle, type PartInstance, type PinRef, type Quat, type RobotProject, type Transform, type Vec3} from './types.ts';

export type ParseResult = {ok: true; project: RobotProject} | {ok: false; error: string};
export type ParseOptions = {
  /** Definiciones del catálogo que existen. Si se omite (etapa 1: catálogo vacío) no se comprueba la existencia. */
  knownDefinitions?: ReadonlySet<string>;
  /** Forma del catálogo: si se da, también se comprueba que los pines y anclajes existan en la definición de ESA instancia. */
  catalog?: ReadonlyMap<string, {pins: ReadonlySet<string>; anchors: ReadonlySet<string>}>;
};

class Invalid extends Error {}
const fail = (message: string): never => { throw new Invalid(message); };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown, what: string, max: number, required = true): string => {
  if (typeof v !== 'string') return required ? fail(`${what}: debe ser texto.`) : '';
  if (required && !v.trim()) fail(`${what}: no puede estar vacío.`);
  if (v.length > max) fail(`${what}: supera el máximo de ${max} caracteres.`);
  return v;
};
const num = (v: unknown, what: string, limit = 1e6): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fail(`${what}: debe ser un número finito.`);
  if (Math.abs(v) > limit) fail(`${what}: fuera de rango.`);
  return v;
};
const list = (v: unknown, what: string, max: number): unknown[] => {
  if (!Array.isArray(v)) return fail(`${what}: debe ser una lista.`);
  if (v.length > max) fail(`${what}: máximo ${max} elementos.`);
  return v;
};
const vec3 = (v: unknown, what: string): Vec3 => {
  const a = list(v, what, 3);
  if (a.length !== 3) fail(`${what}: debe tener 3 valores.`);
  return [num(a[0], what), num(a[1], what), num(a[2], what)];
};
const quat = (v: unknown, what: string): Quat => {
  const a = list(v, what, 4);
  if (a.length !== 4) fail(`${what}: debe tener 4 valores.`);
  const q: Quat = [num(a[0], what, 2), num(a[1], what, 2), num(a[2], what, 2), num(a[3], what, 2)];
  if (Math.abs(Math.hypot(...q) - 1) > 1e-3) fail(`${what}: el cuaternión debe estar normalizado.`);
  return q;
};
const transform = (v: unknown, what: string): Transform => {
  if (!isObject(v)) return fail(`${what}: falta la transformación.`);
  const t: Transform = {position: vec3(v.position, `${what}.posición`), rotation: quat(v.rotation, `${what}.rotación`)};
  if (v.scale !== undefined) t.scale = vec3(v.scale, `${what}.escala`);
  return t;
};
const unique = (ids: string[], what: string) => {
  if (new Set(ids).size !== ids.length) fail(`${what}: hay identificadores repetidos.`);
};
const pinRef = (v: unknown, what: string): PinRef => {
  if (!isObject(v)) return fail(`${what}: falta el pin.`);
  return {instanceId: text(v.instanceId, `${what}.instanceId`, 80), pinId: text(v.pinId, `${what}.pinId`, 40)};
};

function build(data: Record<string, unknown>, options: ParseOptions): RobotProject {
  const parts = list(data.parts, 'Piezas', LIMITS.parts).map((raw, i): PartInstance => {
    if (!isObject(raw)) return fail(`Pieza ${i + 1}: formato inválido.`);
    const definitionId = text(raw.definitionId, `Pieza ${i + 1}.definitionId`, 80);
    if (options.knownDefinitions && !options.knownDefinitions.has(definitionId)) fail(`Pieza ${i + 1}: la definición «${definitionId}» no existe en el catálogo.`);
    const part: PartInstance = {instanceId: text(raw.instanceId, `Pieza ${i + 1}.instanceId`, 80), definitionId, label: text(raw.label, `Pieza ${i + 1}.label`, LIMITS.label), transform: transform(raw.transform, `Pieza ${i + 1}`)};
    if (raw.locked !== undefined) part.locked = raw.locked === true;
    if (raw.groupId !== undefined) part.groupId = text(raw.groupId, `Pieza ${i + 1}.groupId`, 80);
    if (raw.props !== undefined) {
      if (!isObject(raw.props)) fail(`Pieza ${i + 1}.props: formato inválido.`);
      const props: Record<string, number | string | boolean> = {};
      for (const [k, v] of Object.entries(raw.props as Record<string, unknown>)) {
        if (typeof v === 'number') props[k] = num(v, `Pieza ${i + 1}.props.${k}`);
        else if (typeof v === 'string' && v.length <= 200) props[k] = v;
        else if (typeof v === 'boolean') props[k] = v;
        else fail(`Pieza ${i + 1}.props.${k}: valor no permitido.`);
      }
      part.props = props;
    }
    if (definitionId === 'educational-conveyor') {
      for (const key of ['jammed', 'sensorFault']) if (part.props?.[key] !== undefined && typeof part.props[key] !== 'boolean') fail(`Cinta: ${key} debe ser booleano.`);
      const speed = part.props?.speedMps;
      if (speed !== undefined && (typeof speed !== 'number' || speed < .02 || speed > .12)) fail('Cinta: velocidad fuera de 0,02–0,12 m/s.');
    }
    return part;
  });
  unique(parts.map(p => p.instanceId), 'Piezas');
  const ids = new Set(parts.map(p => p.instanceId));
  let armProgram: RobotProject['armProgram'];
  if (data.armProgram !== undefined) {
    if (!isObject(data.armProgram)) fail('Programa de brazo inválido.');
    const program = data.armProgram as Record<string, unknown>;
    const armId = text(program.armId, 'Brazo del programa', 80);
    if (!parts.some(p => p.instanceId === armId && p.definitionId === 'educational-arm-e6')) fail('El programa no corresponde a un brazo del proyecto.');
    const points = list(program.points, 'Puntos del brazo', 40).map(raw => {
      if (!isObject(raw) || (raw.kind !== 'MovJ' && raw.kind !== 'MovL') || typeof raw.gripperOpen !== 'boolean') return fail('Punto del brazo inválido.');
      const angles = list(raw.angles, 'Ángulos del punto', 6).map(v => num(v, 'Ángulo', 360));
      if (angles.length !== 6) fail('El punto necesita seis ángulos.');
      const expectedHeld = raw.expectedHeld === undefined ? undefined : text(raw.expectedHeld, 'Pieza prevista', 80);
      if (expectedHeld && !parts.some(p => p.instanceId === expectedHeld && p.definitionId === 'arm-practice-block')) fail('El punto hace referencia a una pieza inexistente.');
      return {name: text(raw.name, 'Nombre del punto', 60), angles, gripperOpen: raw.gripperOpen, kind: raw.kind as 'MovJ' | 'MovL', ...(expectedHeld ? {expectedHeld} : {})};
    });
    armProgram = {armId, points};
  }
  const mustExist = (id: string, what: string) => { if (!ids.has(id)) fail(`${what}: la pieza «${id}» no existe en el proyecto.`); };
  const defOf = new Map(parts.map(x => [x.instanceId, x.definitionId]));
  const checkAnchor = (r: {instanceId: string; anchorId: string}, what: string) => { const d = options.catalog?.get(defOf.get(r.instanceId) ?? ''); if (d && !d.anchors.has(r.anchorId)) fail(`${what}: el anclaje «${r.anchorId}» no existe en esa pieza.`); };
  const checkPin = (r: PinRef, what: string) => { const d = options.catalog?.get(defOf.get(r.instanceId) ?? ''); if (d && !d.pins.has(r.pinId)) fail(`${what}: el pin «${r.pinId}» no existe en esa pieza.`); };

  const attachments = list(data.attachments, 'Uniones', LIMITS.attachments).map((raw, i): Attachment => {
    if (!isObject(raw) || !isObject(raw.parent) || !isObject(raw.child)) return fail(`Unión ${i + 1}: formato inválido.`);
    if (raw.kind !== 'rigid' && raw.kind !== 'wheel-hinge') fail(`Unión ${i + 1}: tipo desconocido.`);
    const a: Attachment = {
      id: text(raw.id, `Unión ${i + 1}.id`, 80), kind: raw.kind as Attachment['kind'],
      parent: {instanceId: text(raw.parent.instanceId, `Unión ${i + 1}.padre`, 80), anchorId: text(raw.parent.anchorId, `Unión ${i + 1}.ancla`, 40)},
      child: {instanceId: text(raw.child.instanceId, `Unión ${i + 1}.hijo`, 80), anchorId: text(raw.child.anchorId, `Unión ${i + 1}.ancla`, 40)},
    };
    if (raw.axis !== undefined) a.axis = vec3(raw.axis, `Unión ${i + 1}.eje`);
    mustExist(a.parent.instanceId, `Unión ${i + 1}`); mustExist(a.child.instanceId, `Unión ${i + 1}`); checkAnchor(a.parent, `Unión ${i + 1}`); checkAnchor(a.child, `Unión ${i + 1}`);
    if (a.parent.instanceId === a.child.instanceId) fail(`Unión ${i + 1}: una pieza no se une a sí misma.`);
    return a;
  });
  unique(attachments.map(a => a.id), 'Uniones');
  unique(attachments.map(a => a.child.instanceId), 'Uniones (una pieza solo puede tener un padre)');
  for (const a of attachments) { // sin ciclos: subiendo por los padres nunca se vuelve a la pieza
    let cur = a.parent.instanceId; const seen = new Set([a.child.instanceId]);
    while (cur) { if (seen.has(cur)) fail('Uniones: hay una unión en círculo.'); seen.add(cur); cur = attachments.find(x => x.child.instanceId === cur)?.parent.instanceId ?? ''; }
  }

  const seen = new Set<string>();
  const connections = list(data.connections, 'Conexiones', LIMITS.connections).map((raw, i): Connection => {
    if (!isObject(raw)) return fail(`Conexión ${i + 1}: formato inválido.`);
    const c: Connection = {id: text(raw.id, `Conexión ${i + 1}.id`, 80), a: pinRef(raw.a, `Conexión ${i + 1}.a`), b: pinRef(raw.b, `Conexión ${i + 1}.b`), color: text(raw.color, `Conexión ${i + 1}.color`, 30)};
    if (raw.route !== undefined) c.route = list(raw.route, `Conexión ${i + 1}.ruta`, 200).map(p => vec3(p, `Conexión ${i + 1}.ruta`));
    mustExist(c.a.instanceId, `Conexión ${i + 1}`); mustExist(c.b.instanceId, `Conexión ${i + 1}`); checkPin(c.a, `Conexión ${i + 1}`); checkPin(c.b, `Conexión ${i + 1}`);
    const ka = `${c.a.instanceId}:${c.a.pinId}`, kb = `${c.b.instanceId}:${c.b.pinId}`;
    if (ka === kb) fail(`Conexión ${i + 1}: un pin no se conecta consigo mismo.`);
    const pair = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
    if (seen.has(pair)) fail(`Conexión ${i + 1}: está duplicada.`);
    seen.add(pair);
    return c;
  });
  unique(connections.map(c => c.id), 'Conexiones');

  const firmware = list(data.firmware, 'Firmware', LIMITS.firmware).map((raw, i): Firmware => {
    if (!isObject(raw)) return fail(`Firmware ${i + 1}: formato inválido.`);
    if (raw.board !== 'arduino-uno-r3') fail(`Firmware ${i + 1}: placa no soportada.`);
    const source = text(raw.source, `Firmware ${i + 1}.código`, LIMITS.sketchBytes, false);
    const f: Firmware = {id: text(raw.id, `Firmware ${i + 1}.id`, 80), targetInstanceId: text(raw.targetInstanceId, `Firmware ${i + 1}.destino`, 80), board: 'arduino-uno-r3', source, updatedAt: text(raw.updatedAt, `Firmware ${i + 1}.updatedAt`, 40)};
    mustExist(f.targetInstanceId, `Firmware ${i + 1}`);
    if (raw.artifact !== undefined) {
      const a = raw.artifact;
      if (!isObject(a) || (a.origin !== 'remote-compiler' && a.origin !== 'hex-import')) return fail(`Firmware ${i + 1}.artefacto: formato inválido.`);
      f.artifact = {hex: text(a.hex, `Firmware ${i + 1}.hex`, LIMITS.hexBytes), origin: a.origin, sourceHash: text(a.sourceHash, `Firmware ${i + 1}.hash`, 100), compiledAt: text(a.compiledAt, `Firmware ${i + 1}.compiledAt`, 40)};
    }
    return f;
  });
  unique(firmware.map(f => f.id), 'Firmware');

  const scene = data.scene;
  if (!isObject(scene) || !isObject(scene.physics)) return fail('Escena: formato inválido.');
  const obstacles = list(scene.obstacles, 'Obstáculos', LIMITS.obstacles).map((raw, i): Obstacle => {
    if (!isObject(raw)) return fail(`Obstáculo ${i + 1}: formato inválido.`);
    if (raw.shape !== 'box' && raw.shape !== 'cylinder') fail(`Obstáculo ${i + 1}: forma desconocida.`);
    const size = vec3(raw.size, `Obstáculo ${i + 1}.tamaño`);
    if (size.some(s => s <= 0)) fail(`Obstáculo ${i + 1}: el tamaño debe ser positivo.`);
    return {id: text(raw.id, `Obstáculo ${i + 1}.id`, 80), shape: raw.shape as Obstacle['shape'], transform: transform(raw.transform, `Obstáculo ${i + 1}`), size, ...(raw.movable === true ? {movable: true, massKg: typeof raw.massKg === 'number' && raw.massKg > 0 && raw.massKg <= 5 ? raw.massKg : 0.05} : {})};
  });
  unique(obstacles.map(o => o.id), 'Obstáculos');
  const workspace = isObject(data.workspace) ? data.workspace : {};
  const out: RobotProject = {
    format: ROBOTICS_FORMAT, version: ROBOTICS_VERSION,
    id: text(data.id, 'Id del proyecto', 80), name: text(data.name, 'Nombre', LIMITS.name),
    createdAt: text(data.createdAt, 'Fecha de creación', 40), updatedAt: text(data.updatedAt, 'Fecha de edición', 40),
    parts, attachments, connections, firmware,
    scene: {obstacles, robotStart: transform(scene.robotStart, 'Inicio del robot'), physics: {gravity: num(scene.physics.gravity, 'Gravedad', 100), friction: num(scene.physics.friction, 'Fricción', 10)}},
    workspace: {},
  };
  if (scene.lineTrack !== undefined) {
    const track = scene.lineTrack;
    if (!isObject(track) || typeof track.closed !== 'boolean') return fail('Pista: formato inválido.');
    const points = list(track.points, 'Pista.puntos', 120).map((v, i) => vec3(v, `Pista.punto ${i + 1}`));
    const width = num(track.width, 'Pista.ancho', 0.15);
    if (points.length < 2 || width < 0.01 || points.some(v => Math.abs(v[0]) > 1.9 || Math.abs(v[2]) > 1.9 || Math.abs(v[1]) > 0.001)) fail('Pista: puntos fuera del suelo o ancho inválido.');
    out.scene.lineTrack = {name: text(track.name, 'Pista.nombre', 80), points, width, closed: track.closed};
  }
  if (workspace.mode === 'build' || workspace.mode === 'simulate') out.workspace.mode = workspace.mode;
  if (typeof workspace.assemblyTemplate === 'string') out.workspace.assemblyTemplate = text(workspace.assemblyTemplate, 'Guía de armado', 80);
  if (typeof workspace.wiringGuide === 'string') out.workspace.wiringGuide = text(workspace.wiringGuide, 'Guía de cableado', 80);
  if (typeof workspace.programGuide === 'string') out.workspace.programGuide = text(workspace.programGuide, 'Guía de programación', 80);
  if (typeof workspace.welcomeDismissed === 'boolean') out.workspace.welcomeDismissed = workspace.welcomeDismissed;
  if (isObject(workspace.camera)) out.workspace.camera = {position: vec3(workspace.camera.position, 'Cámara.posición'), target: vec3(workspace.camera.target, 'Cámara.objetivo')};
  if (armProgram) out.armProgram = armProgram;
  return out;
}

/** Valida y migra un valor desconocido. Nunca lanza: devuelve el motivo en español. */
export function parseRobotProject(raw: unknown, options: ParseOptions = {}): ParseResult {
  const migrated = migrateRobotProject(raw);
  if (!migrated.ok) return migrated;
  try { return {ok: true, project: build(migrated.value, options)}; }
  catch (error) { return {ok: false, error: error instanceof Invalid ? error.message : 'El proyecto está dañado.'}; }
}

export function parseRobotProjectText(source: string, options: ParseOptions = {}): ParseResult {
  if (source.length > LIMITS.importBytes) return {ok: false, error: 'El archivo supera el límite de 2 MB.'};
  let raw: unknown;
  try { raw = JSON.parse(source); } catch { return {ok: false, error: 'El archivo no es un JSON válido.'}; }
  return parseRobotProject(raw, options);
}
