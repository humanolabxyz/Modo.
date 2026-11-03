// Física del robot (etapa 5, docs/robotica/02 §5). Compila el MISMO proyecto que se construyó, cableó y programó en cuerpos rígidos de Rapier:
//   · las piezas unidas con `rigid` forman un solo cuerpo (una caja por pieza, con su masa);
//   · cada `wheel-hinge` es un cuerpo aparte (cilindro) unido al motor por una articulación de un eje;
//   · el motor aplica par = k_t·(V − k_e·ω)/R a su rueda (y el opuesto al chasis), con V = la tensión que dejó el circuito;
//   · el HC-SR04 lanza un haz de rayos desde su pose real: lo que lee es la distancia al obstáculo más cercano.
// Sin animaciones predefinidas: todo el movimiento sale de lo que hizo el programa con los pines.
// El mundo avanza en pasos fijos de 2 ms (el mismo paso que el circuito), así la misma entrada produce siempre la misma trayectoria.
import type {Obstacle, PartInstance, Quat, RobotProject, Transform, Vec3} from '../project/types.ts';
import {distanceToTrack} from './lineTrack.ts';
import {getDefinition} from '../catalog/index.ts';
import {combatHulls} from '../catalog/combat.ts';
import {closure} from '../project/commands.ts';
import {TORSO_BOXES, TORSO_ID} from '../catalog/torso.ts';
import {CLAW_ID, FINGER, GRASP_ZONE, clawGap} from '../catalog/claw.ts';
import {DEG, qFromAxisAngle, qInv, qMul, qNorm, qRotate, tInv, tMul, tPoint} from '../project/math.ts';

type Rapier = typeof import('@dimforge/rapier3d-compat').default;
type RWorld = InstanceType<Rapier['World']>;
type RBody = ReturnType<RWorld['createRigidBody']>;

export const PHYS_STEP_S = 0.002;
export const ROOM_HALF = 2;              // el cubo blanco mide 4 × 4 m
export const WALL_H = 0.6;
/** Motor TT (aprox.): par de arranque ≈ 0,08 N·m y 200 rpm en vacío a 6 V con 8 Ω → k_t = 0,104 N·m/A, k_e = 0,286 V·s/rad. */
export const MOTOR = {kt: 0.104, ke: 0.286, ohms: 8, coastBelowV: 0.05};
export const BEAM = {halfAngleDeg: 15, rays: 7, faceOffset: 0.009, minM: 0.02, maxM: 4};

const G_GROUND = 0x0001, G_ROBOT = 0x0002, G_WHEEL = 0x0004, G_OBST = 0x0008;
const groups = (member: number, filter: number) => ((member << 16) | filter) >>> 0;

export type BodyPose = {p: Vec3; q: Quat};
export type WheelInfo = {motorId: string; wheelId: string; omega: number; torque: number};
export type SensorRay = {origin: Vec3; dir: Vec3; distance: number | null};
export type ArenaImpact = {sequence: number; at: number; position: Vec3};
export type PhysicsFrame = {
  impacts?: ArenaImpact[];
  /** Pose mundial de cada pieza que forma parte de un cuerpo. */
  poses: Record<string, BodyPose>;
  /** Objetos movibles del escenario (por ejemplo cubos que se recogen) y qué pinza los sostiene. */
  objects?: Record<string, BodyPose & {heldBy: string | null}>;
  wheels: WheelInfo[];
  sensors: Record<string, SensorRay>;
  /** Posición del chasis (centro del cuerpo principal) y su velocidad horizontal, para mostrarlas. */
  main: {p: Vec3; speed: number} | null;
};
/** Arena-only collision layers keep each robot's wheels clear of its own chassis. */
export type PhysicsOptions = {arenaRadius?: number; teams?: Record<string, 0 | 1>};

type Body = {id: string; body: RBody; frame: Transform; parts: {id: string; local: Transform}[]};
type Hinge = {motorId: string; wheelId: string; wheel: Body; chassis: Body; axisLocal: Vec3};

const DIM = (def: string) => getDefinition(def);

/** Piezas que pueden estar en el mundo físico y notas legibles de lo que falta. */
export function describePhysics(project: RobotProject): {wheels: number; notes: string[]} {
  const notes: string[] = [];
  const hinges = project.attachments.filter(a => a.kind === 'wheel-hinge');
  const hinged = new Set(hinges.map(a => a.child.instanceId));
  for (const w of project.parts.filter(p => (p.definitionId === 'wheel-65' || p.definitionId === 'track-sprocket') && !hinged.has(p.instanceId))) notes.push(`${w.label} no está unida a un motor: no empuja al robot.`);
  for (const m of project.parts.filter(p => p.definitionId === 'dc-motor-tt')) if (!hinges.some(h => h.parent.instanceId === m.instanceId)) notes.push(`${m.label} no tiene rueda en su eje.`);
  return {wheels: hinges.length, notes};
}

export class RobotPhysics {
  private bodies: Body[] = [];
  private hinges: Hinge[] = [];
  private sensorParts: {part: PartInstance; body: Body; local: Transform}[] = [];
  private lineParts: {part: PartInstance; body: Body; local: Transform}[] = [];
  /** Cuellos: un servo con una pieza (la cabeza) en su cuerno. La cabeza y todo lo que lleva giran con el servo: su pose y los rayos del radar. */
  private necks: {servoId: string; body: Body; pivot: Vec3; axis: Vec3; members: Set<string>}[] = [];
  private chains = new Map<string, {servoId: string; body: Body; pivot: Vec3; axis: Vec3; members: Set<string>}[]>();
  /** Pinzas: cuerpo cinemático con dos dedos; el servo de la pinza (hijo en su ancla `servo`) fija la separación. */
  private claws: {part: PartInstance; body: Body; local: Transform; kin: RBody; fingers: [ReturnType<RWorld['createCollider']>, ReturnType<RWorld['createCollider']>]; servoId?: string; held: string | null}[] = [];
  /** Objetos movibles: cuerpos dinámicos; mientras una pinza los sostiene pasan a cinemáticos y la siguen. */
  private movables: {id: string; body: RBody; size: Vec3; held: {claw: number; rel: Transform} | null}[] = [];
  private neckAngles = new Map<string, number>();
  private lastRays = new Map<string, SensorRay>();
  private lastTorque = new Map<string, number>();
  readonly notes: string[];
  private readonly R: Rapier;
  private readonly world: RWorld;
  readonly project: RobotProject;
  private options: PhysicsOptions;
  private events: InstanceType<Rapier['EventQueue']> | undefined;
  private colliderTeams = new Map<number, 0 | 1>();
  private impacts: ArenaImpact[] = [];
  private physicsTime = 0;
  private impactSequence = 0;
  private lastImpact = -1;

  private constructor(R: Rapier, world: RWorld, project: RobotProject, options: PhysicsOptions = {}) {
    this.options = options;
    this.R = R; this.world = world; this.project = project;
    if (options.teams) this.events = new R.EventQueue(true);
    this.notes = describePhysics(project).notes;
  }

  static create(R: Rapier, project: RobotProject, options: PhysicsOptions = {}): RobotPhysics {
    const scene = project.scene;
    const world = new R.World({x: 0, y: -Math.max(0, scene.physics.gravity), z: 0});
    world.timestep = PHYS_STEP_S;
    const phys = new RobotPhysics(R, world, project, options);
    phys.buildScene(scene.physics.friction, scene.obstacles);
    phys.buildRobot(scene.robotStart, scene.physics.friction);
    phys.refreshQueries();
    return phys;
  }

  private buildScene(friction: number, obstacles: Obstacle[]) {
    const {R, world} = this, fixed = (hx: number, hy: number, hz: number, at: Vec3, rot?: Quat, extra = 0) => {
      const d = R.ColliderDesc.cuboid(hx, hy, hz).setTranslation(at[0], at[1], at[2]).setFriction(friction).setRestitution(0).setCollisionGroups(groups(G_GROUND | extra, 0xffff));
      if (rot) d.setRotation({x: rot[0], y: rot[1], z: rot[2], w: rot[3]});
      world.createCollider(d);
    };
    fixed(ROOM_HALF + 1, 0.1, ROOM_HALF + 1, [0, this.options.arenaRadius ? -0.4 : -0.1, 0]);
    if (this.options.arenaRadius) world.createCollider(R.ColliderDesc.cylinder(0.025, this.options.arenaRadius).setTranslation(0, -0.025, 0).setFriction(friction).setRestitution(0).setCollisionGroups(groups(G_GROUND, 0xffff)));
    const t = 0.1, h = WALL_H / 2;
    fixed(ROOM_HALF + t, h, t / 2, [0, h, ROOM_HALF + t / 2], undefined, G_OBST); fixed(ROOM_HALF + t, h, t / 2, [0, h, -ROOM_HALF - t / 2], undefined, G_OBST);
    fixed(t / 2, h, ROOM_HALF + t, [ROOM_HALF + t / 2, h, 0], undefined, G_OBST); fixed(t / 2, h, ROOM_HALF + t, [-ROOM_HALF - t / 2, h, 0], undefined, G_OBST);
    for (const o of obstacles) {
      const [sx, sy, sz] = o.size, rot = o.transform.rotation, p = o.transform.position;
      const desc = o.shape === 'cylinder' ? R.ColliderDesc.cylinder(sy / 2, sx / 2) : R.ColliderDesc.cuboid(sx / 2, sy / 2, sz / 2);
      desc.setTranslation(p[0], p[1], p[2]).setRotation({x: rot[0], y: rot[1], z: rot[2], w: rot[3]}).setFriction(o.movable ? Math.max(friction, 1.2) : friction).setRestitution(0).setCollisionGroups(groups(G_GROUND | G_OBST, 0xffff));
      if (o.movable) { // objeto que se puede empujar y recoger: cuerpo dinámico con su masa
        const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(p[0], p[1], p[2]).setRotation({x: rot[0], y: rot[1], z: rot[2], w: rot[3]}).setCanSleep(false).setLinearDamping(0.1).setAngularDamping(0.5));
        desc.setTranslation(0, 0, 0).setRotation({x: 0, y: 0, z: 0, w: 1}).setMass(o.massKg ?? 0.05);
        world.createCollider(desc, body); this.movables.push({id: o.id, body, size: o.size, held: null});
      } else world.createCollider(desc);
    }
  }

  /** Une las piezas por `rigid`, crea un cuerpo por grupo y una rueda por cada `wheel-hinge`. */
  private buildRobot(start: Transform, friction: number) {
    const {R, world, project} = this;
    const parent = new Map<string, string>(), find = (x: string): string => { let r = x; while (parent.get(r) && parent.get(r) !== r) r = parent.get(r)!; return r; };
    const touched = new Set<string>();
    for (const part of project.parts) parent.set(part.instanceId, part.instanceId);
    const wheelIds = new Set(project.attachments.filter(a => a.kind === 'wheel-hinge').map(a => a.child.instanceId));
    for (const a of project.attachments) {
      touched.add(a.parent.instanceId); touched.add(a.child.instanceId);
      if (a.kind === 'rigid') parent.set(find(a.child.instanceId), find(a.parent.instanceId));
    }
    const groupsByRoot = new Map<string, PartInstance[]>();
    for (const part of project.parts) {
      if (!touched.has(part.instanceId) || wheelIds.has(part.instanceId) || !DIM(part.definitionId)) continue;
      const r = find(part.instanceId);
      groupsByRoot.set(r, [...(groupsByRoot.get(r) ?? []), part]);
    }
    const byPart = new Map<string, Body>();
    for (const members of groupsByRoot.values()) {
      const root = members.find(p => p.definitionId === 'chassis-2wd') ?? members[0];
      const frame = tMul(start, root.transform);
      const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(frame.position[0], frame.position[1], frame.position[2]).setRotation({x: frame.rotation[0], y: frame.rotation[1], z: frame.rotation[2], w: frame.rotation[3]}).setCanSleep(false).setLinearDamping(0.02).setAngularDamping(0.05));
      const b: Body = {id: root.instanceId, body, frame, parts: []};
      for (const part of members) {
        const local = tMul(tInv(root.transform), part.transform);
        b.parts.push({id: part.instanceId, local}); byPart.set(part.instanceId, b);
        this.addPartColliders(body, part, local);
        if (part.definitionId === 'hc-sr04') this.sensorParts.push({part, body: b, local});
        if (part.definitionId === 'tcrt5000-module') this.lineParts.push({part, body: b, local});
      }
      this.bodies.push(b);
    }
    for (const a of project.attachments.filter(x => x.kind === 'wheel-hinge')) {
      const motor = project.parts.find(p => p.instanceId === a.parent.instanceId), wheel = project.parts.find(p => p.instanceId === a.child.instanceId), chassis = byPart.get(a.parent.instanceId);
      if (!motor || !wheel || !chassis) continue;
      // El cuerpo de la rueda comparte la orientación del chasis, así el eje se expresa igual en ambos cuerpos.
      const wPos = tPoint(start, wheel.transform.position), q = chassis.frame.rotation;
      const wheelBody = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(wPos[0], wPos[1], wPos[2]).setRotation({x: q[0], y: q[1], z: q[2], w: q[3]}).setCanSleep(false).setAngularDamping(0.25));
      const relQ = qNorm(qMul(qInv(q), qMul(start.rotation, wheel.transform.rotation)));
      const wb: Body = {id: wheel.instanceId, body: wheelBody, frame: {position: wPos, rotation: q}, parts: [{id: wheel.instanceId, local: {position: [0, 0, 0], rotation: relQ}}]};
      const def = DIM(wheel.definitionId)!, [lw, dia] = def.dimensions;
      const cyl = R.ColliderDesc.cylinder(lw / 2, dia / 2).setMass(def.massKg).setFriction(friction * 1.5).setRestitution(0).setCollisionGroups(this.partGroups(wheel.instanceId, G_WHEEL));
      cyl.setRotation(rotToQuat(qMul(relQ, [0, 0, -Math.SQRT1_2, Math.SQRT1_2] as Quat))); // el cilindro de Rapier es vertical: se acuesta sobre el eje X
      this.trackCollider(cyl, wheelBody, wheel.instanceId);
      // Eje: +X del motor (los dos ejes de un motor TT giran en el mismo sentido), expresado en el cuerpo del chasis.
      const axisWorld = qRotate(qMul(start.rotation, motor.transform.rotation), [1, 0, 0]), axisLocal = qRotate(qInv(q), axisWorld);
      const anchorChassis = tPoint(tInv(chassis.frame), wPos);
      world.createImpulseJoint(R.JointData.revolute({x: anchorChassis[0], y: anchorChassis[1], z: anchorChassis[2]}, {x: 0, y: 0, z: 0}, {x: axisLocal[0], y: axisLocal[1], z: axisLocal[2]}), chassis.body, wheelBody, true);
      this.bodies.push(wb);
      this.hinges.push({motorId: motor.instanceId, wheelId: wheel.instanceId, wheel: wb, chassis, axisLocal});
    }
    this.buildNecks(byPart); this.buildClaws(byPart);
  }

  /** Busca los servos con algo en el cuerno: sus piezas giran con el servo. */
  private buildNecks(byPart: Map<string, Body>) {
    for (const servo of this.project.parts.filter(p => p.definitionId === 'servo-sg90')) {
      const body = byPart.get(servo.instanceId), att = this.project.attachments.find(a => a.kind === 'rigid' && a.parent.instanceId === servo.instanceId && a.parent.anchorId === 'horn');
      const horn = DIM(servo.definitionId)?.anchors.find(a => a.id === 'horn'), local = body?.parts.find(x => x.id === servo.instanceId)?.local;
      if (!body || !att || !horn || !local) continue;
      this.necks.push({servoId: servo.instanceId, body, pivot: tPoint(local, horn.position), axis: qRotate(local.rotation, [0, 1, 0]), members: closure(this.project, [att.child.instanceId])});
    }
  }

  /** Pinzas: cada una es un cuerpo cinemático con dos dedos (cajas). Su pose y la separación de los dedos se actualizan en cada paso. */
  private buildClaws(byPart: Map<string, Body>) {
    const {R, world} = this;
    for (const part of this.project.parts.filter(p => p.definitionId === CLAW_ID)) {
      const body = byPart.get(part.instanceId), local = body?.parts.find(x => x.id === part.instanceId)?.local; if (!body || !local) continue;
      const bp = body.body.translation(), bq = body.body.rotation(), base = tMul({position: [bp.x, bp.y, bp.z], rotation: [bq.x, bq.y, bq.z, bq.w]}, local);
      const kin = world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(base.position[0], base.position[1], base.position[2]).setRotation({x: base.rotation[0], y: base.rotation[1], z: base.rotation[2], w: base.rotation[3]}));
      const finger = (side: number) => world.createCollider(R.ColliderDesc.cuboid(FINGER.thickness / 2, FINGER.length / 2, FINGER.width / 2).setTranslation(side * (clawGap(90) / 2 + FINGER.thickness / 2), FINGER.centerY, 0).setFriction(1.4).setRestitution(0).setCollisionGroups(groups(G_ROBOT, G_GROUND)), kin);
      const servo = this.project.attachments.find(a => a.parent.instanceId === part.instanceId && a.parent.anchorId === 'servo')?.child.instanceId;
      this.claws.push({part, body, local, kin, fingers: [finger(-1), finger(1)], servoId: servo, held: null});
    }
  }

  /** Mueve los dedos con el servo de la pinza y, si un objeto movible queda entre ellos con la pinza cerrada, lo agarra; si la abre, lo suelta. */
  private updateClaws() {
    if (!this.claws.length) return;
    const {R} = this;
    this.claws.forEach((c, index) => {
      const bp = c.body.body.translation(), bq = c.body.body.rotation(), t = this.swung(tMul({position: [bp.x, bp.y, bp.z], rotation: [bq.x, bq.y, bq.z, bq.w]}, c.local), c.part.instanceId);
      const angle = c.servoId ? this.neckAngles.get(c.servoId) : undefined, gap = clawGap(angle ?? 90);
      c.kin.setNextKinematicTranslation({x: t.position[0], y: t.position[1], z: t.position[2]}); c.kin.setNextKinematicRotation({x: t.rotation[0], y: t.rotation[1], z: t.rotation[2], w: t.rotation[3]});
      c.fingers[0].setTranslationWrtParent({x: -(gap / 2 + FINGER.thickness / 2), y: FINGER.centerY, z: 0}); c.fingers[1].setTranslationWrtParent({x: gap / 2 + FINGER.thickness / 2, y: FINGER.centerY, z: 0});
      for (const m of this.movables) {
        const cp = m.body.translation(), cq = m.body.rotation(), obj: Transform = {position: [cp.x, cp.y, cp.z], rotation: [cq.x, cq.y, cq.z, cq.w]};
        if (m.held && m.held.claw === index) {
          if (gap > m.size[0] + 0.008) { // la pinza se abrió: lo suelta
            m.body.setBodyType(R.RigidBodyType.Dynamic, true); m.body.setLinvel({x: 0, y: 0, z: 0}, true); m.body.setAngvel({x: 0, y: 0, z: 0}, true); m.body.collider(0).setCollisionGroups(groups(G_GROUND | G_OBST, 0xffff)); m.held = null; c.held = null;
          } else { const w = tMul(t, m.held.rel); m.body.setNextKinematicTranslation({x: w.position[0], y: w.position[1], z: w.position[2]}); m.body.setNextKinematicRotation({x: w.rotation[0], y: w.rotation[1], z: w.rotation[2], w: w.rotation[3]}); }
        } else if (!m.held && gap <= m.size[0] + 0.004) {
          const rel = tMul(tInv(t), obj), [x, y, z] = rel.position;
          if (Math.abs(x) <= GRASP_ZONE.halfX && y >= GRASP_ZONE.y[0] && y <= GRASP_ZONE.y[1] && Math.abs(z) <= GRASP_ZONE.halfZ) { // entre los dedos y cerrada: agarrado
            m.body.setBodyType(R.RigidBodyType.KinematicPositionBased, true); m.body.collider(0).setCollisionGroups(groups(G_OBST, G_GROUND)); // sostenido: sigue a la pinza y no empuja al robot
            m.held = {claw: index, rel}; c.held = m.id;
          }
        }
      }
    });
  }

  private addPartColliders(body: RBody, part: PartInstance, local: Transform) {
    const {R, world} = this, def = DIM(part.definitionId)!, [dx, dy, dz] = def.dimensions, rot = {x: local.rotation[0], y: local.rotation[1], z: local.rotation[2], w: local.rotation[3]};
    const place = (d: ReturnType<Rapier['ColliderDesc']['cuboid']>, at: Vec3, mass: number, mu: number) => {
      const p = tPoint(local, at); d.setTranslation(p[0], p[1], p[2]).setRotation(rot).setMass(mass).setFriction(mu).setRestitution(0).setCollisionGroups(this.partGroups(part.instanceId, G_ROBOT)); this.trackCollider(d, body, part.instanceId);
    };
    const hulls = combatHulls(part.definitionId);
    if (hulls) {
      for (const hull of hulls) {
        const shape = R.ColliderDesc.convexHull(new Float32Array(hull.vertices));
        if (!shape) throw new Error(`Geometría convexa inválida: ${part.definitionId}`);
        place(shape, [0, 0, 0], def.massKg * hull.massFraction, 0.35);
      }
      return;
    }
    if (part.definitionId === 'robot-arm' || part.definitionId === 'robot-forearm' || part.definitionId === CLAW_ID) return; // los eslabones se dibujan girados; solo los dedos de la pinza (cuerpo cinemático) tocan objetos
    if (part.definitionId === TORSO_ID) { for (const b of TORSO_BOXES) place(R.ColliderDesc.cuboid(b.half[0], b.half[1], b.half[2]), b.center, Math.max(def.massKg / TORSO_BOXES.length, 1e-4), 0.3); return; }
    if (part.definitionId === 'track-belt') { // la banda desliza: solo su parte baja toca el suelo, con muy poco rozamiento (empuja la rueda motriz, no la banda)
      // Rapier promedia el rozamiento de dos superficies: con la regla «mínimo» manda el de la banda (muy bajo) y desliza de verdad.
      // El patín queda 2,5 mm más arriba que el fondo de la rueda motriz: el robot descansa sobre las ruedas (que son las que traccionan) y el patín solo toca si se inclina al frenar o acelerar.
      place(R.ColliderDesc.cuboid(dx / 2, 0.003, dz / 2).setFrictionCombineRule(R.CoefficientCombineRule.Min), [0, -dy / 2 + 0.003 + 0.0025, 0], Math.max(def.massKg, 1e-4), 0.04);
      return;
    }
    if (part.definitionId === 'caster-ball') { // esfera de apoyo casi sin rozamiento + separador
      const r = 0.0125;
      place(R.ColliderDesc.ball(r), [0, -0.009, 0], def.massKg * 0.6, 0.02);
      place(R.ColliderDesc.cuboid(0.009, 0.0115, 0.009), [0, 0.010, 0], def.massKg * 0.4, 0.3);
      return;
    }
    place(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), [0, 0, 0], Math.max(def.massKg, 1e-4), 0.3);
  }

  private refreshQueries() { (this.world as unknown as {updateSceneQueries?: () => void}).updateSceneQueries?.(); }

  private partGroups(id: string, fallback: number) {
    const team = this.options.teams?.[id];
    return team === undefined ? groups(fallback, G_GROUND) : groups(team === 0 ? 0x10 : 0x20, G_GROUND | G_OBST | (team === 0 ? 0x20 : 0x10));
  }

  private trackCollider(desc: ReturnType<Rapier['ColliderDesc']['cuboid']>, body: RBody, id: string) {
    const team = this.options.teams?.[id];
    if (team !== undefined) desc.setActiveEvents(this.R.ActiveEvents.COLLISION_EVENTS);
    const collider = this.world.createCollider(desc, body);
    if (team !== undefined) this.colliderTeams.set(collider.handle, team);
  }

  /** Ángulo (0–180°) de cada servo del robot, tal como lo dejó el circuito: 90° es la cabeza mirando al frente. */
  setServos(angles: ReadonlyMap<string, number>): void { this.neckAngles = angles as Map<string, number>; }

  /** Aplica a la pose de una pieza el giro de TODOS los servos de los que cuelga (hombro, codo…). Se compone de adentro hacia afuera: primero el servo más profundo
   *  (el codo) y luego el hombro, cada uno alrededor de su eje tal como está en la pose de armado (producto de exponenciales). Si no cuelga de ninguno, la deja igual. */
  private swung(t: Transform, partId: string): Transform {
    let chain = this.chains.get(partId); if (!chain) { chain = this.necks.filter(n => n.members.has(partId)).sort((x, y) => x.members.size - y.members.size); this.chains.set(partId, chain); } // los servos de los que cuelga una pieza no cambian: se calcula una vez
    let out = t;
    for (const neck of chain) {
      const angle = this.neckAngles.get(neck.servoId); if (angle === undefined) continue;
      const bp = neck.body.body.translation(), bq = neck.body.body.rotation(), bodyT: Transform = {position: [bp.x, bp.y, bp.z], rotation: [bq.x, bq.y, bq.z, bq.w]};
      const pivot = tPoint(bodyT, neck.pivot), axis = qRotate(bodyT.rotation, neck.axis), q = qFromAxisAngle(axis, (angle - 90) * DEG);
      const d = qRotate(q, [out.position[0] - pivot[0], out.position[1] - pivot[1], out.position[2] - pivot[2]]);
      out = {position: [pivot[0] + d[0], pivot[1] + d[1], pivot[2] + d[2]], rotation: qNorm(qMul(q, out.rotation))};
    }
    return out;
  }

  /** Avanza un paso de 2 ms con las tensiones de motor que dejó el circuito (V entre M+ y M−). */
  step(motorVolts: ReadonlyMap<string, number>, brakes?: ReadonlySet<string>): void {
    for (const b of this.bodies) { b.body.resetTorques(false); }
    for (const h of this.hinges) {
      const v = motorVolts.get(h.motorId) ?? 0, q = h.chassis.body.rotation(), ax = qRotate([q.x, q.y, q.z, q.w], h.axisLocal);
      const w = h.wheel.body.angvel(), c = h.chassis.body.angvel(), omega = (w.x - c.x) * ax[0] + (w.y - c.y) * ax[1] + (w.z - c.z) * ax[2];
      // Libre (salidas flotantes): sin par. Frenado (salidas del puente H unidas a masa): la fuerza contraelectromotriz se opone al giro aunque haya 0 V.
      const tau = Math.abs(v) < MOTOR.coastBelowV && !brakes?.has(h.motorId) ? 0 : MOTOR.kt * (v - MOTOR.ke * omega) / MOTOR.ohms;
      this.lastTorque.set(h.wheelId, tau);
      if (tau) { h.wheel.body.addTorque({x: ax[0] * tau, y: ax[1] * tau, z: ax[2] * tau}, true); h.chassis.body.addTorque({x: -ax[0] * tau, y: -ax[1] * tau, z: -ax[2] * tau}, true); }
    }
    this.updateClaws();
    this.world.step(this.events);
    this.physicsTime += PHYS_STEP_S;
    this.events?.drainCollisionEvents((a, b, started) => {
      const ta = this.colliderTeams.get(a), tb = this.colliderTeams.get(b);
      if (!started || ta === undefined || tb === undefined || ta === tb || this.physicsTime - this.lastImpact < 0.18) return;
      const ca = this.world.getCollider(a), cb = this.world.getCollider(b);
      if (!ca || !cb) return;
      let position: Vec3 | undefined;
      this.world.contactPair(ca, cb, manifold => {
        const point = manifold.numSolverContacts() ? manifold.solverContactPoint(0) : null;
        if (point) position = [point.x, point.y, point.z];
      });
      if (!position) return;
      this.lastImpact = this.physicsTime;
      this.impacts = [...this.impacts.slice(-7), {sequence: ++this.impactSequence, at: this.physicsTime, position}];
    });
  }

  /** HC-SR04: haz de rayos desde la cara del sensor; la distancia es la del obstáculo más cercano dentro del cono. Se mide solo cuando se pide
   *  (el programa dispara el sensor unas pocas veces por segundo; lanzar rayos en cada paso de 2 ms sería trabajo perdido). */
  private measure(s: {part: PartInstance; body: Body; local: Transform}): number | null {
    const {R, world} = this, bp = s.body.body.translation(), bq = s.body.body.rotation();
    const bodyT: Transform = {position: [bp.x, bp.y, bp.z], rotation: [bq.x, bq.y, bq.z, bq.w]}, t = this.swung(tMul(bodyT, s.local), s.part.instanceId);
    const origin = tPoint(t, [0, 0, BEAM.faceOffset]);
    let best: number | null = null, centerDir: Vec3 = qRotate(t.rotation, [0, 0, 1]);
    for (let i = 0; i < BEAM.rays; i++) {
      const yaw = (-BEAM.halfAngleDeg + (2 * BEAM.halfAngleDeg * i) / (BEAM.rays - 1)) * DEG, dir = qRotate(qMul(t.rotation, qFromAxisAngle([0, 1, 0], yaw)), [0, 0, 1]);
      if (i === (BEAM.rays - 1) / 2) centerDir = dir;
      const team = this.options.teams?.[s.part.instanceId];
      const hit = world.castRay(new R.Ray({x: origin[0], y: origin[1], z: origin[2]}, {x: dir[0], y: dir[1], z: dir[2]}), BEAM.maxM, true, undefined, groups(0xffff, G_OBST | (team === undefined ? 0 : team === 0 ? 0x20 : 0x10)));
      const toi = hit ? ((hit as unknown as {timeOfImpact?: number; toi?: number}).timeOfImpact ?? (hit as unknown as {toi?: number}).toi) : undefined;
      if (toi !== undefined && (best === null || toi < best)) best = toi;
    }
    const d = best === null ? null : Math.max(BEAM.minM, best);
    this.lastRays.set(s.part.instanceId, {origin, dir: centerDir, distance: d});
    return d;
  }

  /** Distancia medida por un HC-SR04 que está sobre el robot; `undefined` si ese sensor no forma parte de un cuerpo; `null` fuera de alcance. */
  distance(sensorId: string): number | null | undefined { const s = this.sensorParts.find(x => x.part.instanceId === sensorId); return s ? this.measure(s) : undefined; }

  /** Ground reflectance is sampled under the sensor's real, moving pose. */
  reflectance(sensorId: string): {black: boolean; origin: Vec3; height: number} | undefined {
    const s = this.lineParts.find(x => x.part.instanceId === sensorId);
    if (!s) return undefined;
    const p = s.body.body.translation(), q = s.body.body.rotation();
    const world = tMul({position: [p.x, p.y, p.z], rotation: [q.x, q.y, q.z, q.w]}, s.local);
    const origin = tPoint(world, [0, -0.004, 0.01]), down = qRotate(world.rotation, [0, -1, 0]);
    const track = this.project.scene.lineTrack, height = origin[1];
    const black = !!track && down[1] < -0.8 && height >= -0.002 && height <= 0.015 && distanceToTrack(track, origin) <= track.width / 2;
    return {black, origin, height};
  }

  frame(measureSensors = true): PhysicsFrame {
    if (measureSensors) for (const s of this.sensorParts) this.measure(s);
    const poses: Record<string, BodyPose> = {}, main = this.bodies[0];
    for (const b of this.bodies) {
      const p = b.body.translation(), q = b.body.rotation(), t: Transform = {position: [p.x, p.y, p.z], rotation: [q.x, q.y, q.z, q.w]};
      for (const part of b.parts) { const w = this.swung(tMul(t, part.local), part.id); poses[part.id] = {p: w.position, q: w.rotation}; }
    }
    const wheels = this.hinges.map(h => {
      const q = h.chassis.body.rotation(), ax = qRotate([q.x, q.y, q.z, q.w], h.axisLocal), w = h.wheel.body.angvel(), c = h.chassis.body.angvel();
      return {motorId: h.motorId, wheelId: h.wheelId, omega: (w.x - c.x) * ax[0] + (w.y - c.y) * ax[1] + (w.z - c.z) * ax[2], torque: this.lastTorque.get(h.wheelId) ?? 0};
    });
    let mainInfo: PhysicsFrame['main'] = null;
    if (main) { const p = main.body.translation(), v = main.body.linvel(); mainInfo = {p: [p.x, p.y, p.z], speed: Math.hypot(v.x, v.z)}; }
    const objects: Record<string, BodyPose & {heldBy: string | null}> = {};
    for (const m of this.movables) { const p = m.body.translation(), q = m.body.rotation(); objects[m.id] = {p: [p.x, p.y, p.z], q: [q.x, q.y, q.z, q.w], heldBy: m.held ? this.claws[m.held.claw].part.instanceId : null}; }
    return {poses, wheels, sensors: Object.fromEntries(this.lastRays), main: mainInfo, ...(this.movables.length ? {objects} : {}), ...(this.events ? {impacts: this.impacts} : {})};
  }

  dispose() { this.events?.free(); this.world.free(); }
}

const rotToQuat = (q: Quat) => ({x: q[0], y: q[1], z: q[2], w: q[3]});

export type {Rapier as RapierModule};
