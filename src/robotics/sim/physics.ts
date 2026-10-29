// Física del robot (etapa 5, docs/robotica/02 §5). Compila el MISMO proyecto que se construyó, cableó y programó en cuerpos rígidos de Rapier:
//   · las piezas unidas con `rigid` forman un solo cuerpo (una caja por pieza, con su masa);
//   · cada `wheel-hinge` es un cuerpo aparte (cilindro) unido al motor por una articulación de un eje;
//   · el motor aplica par = k_t·(V − k_e·ω)/R a su rueda (y el opuesto al chasis), con V = la tensión que dejó el circuito;
//   · el HC-SR04 lanza un haz de rayos desde su pose real: lo que lee es la distancia al obstáculo más cercano.
// Sin animaciones predefinidas: todo el movimiento sale de lo que hizo el programa con los pines.
// El mundo avanza en pasos fijos de 2 ms (el mismo paso que el circuito), así la misma entrada produce siempre la misma trayectoria.
import type {Obstacle, PartInstance, Quat, RobotProject, Transform, Vec3} from '../project/types.ts';
import {getDefinition} from '../catalog/index.ts';
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
export type PhysicsFrame = {
  /** Pose mundial de cada pieza que forma parte de un cuerpo. */
  poses: Record<string, BodyPose>;
  wheels: WheelInfo[];
  sensors: Record<string, SensorRay>;
  /** Posición del chasis (centro del cuerpo principal) y su velocidad horizontal, para mostrarlas. */
  main: {p: Vec3; speed: number} | null;
};

type Body = {id: string; body: RBody; frame: Transform; parts: {id: string; local: Transform}[]};
type Hinge = {motorId: string; wheelId: string; wheel: Body; chassis: Body; axisLocal: Vec3};

const DIM = (def: string) => getDefinition(def);

/** Piezas que pueden estar en el mundo físico y notas legibles de lo que falta. */
export function describePhysics(project: RobotProject): {wheels: number; notes: string[]} {
  const notes: string[] = [];
  const hinges = project.attachments.filter(a => a.kind === 'wheel-hinge');
  const hinged = new Set(hinges.map(a => a.child.instanceId));
  for (const w of project.parts.filter(p => p.definitionId === 'wheel-65' && !hinged.has(p.instanceId))) notes.push(`${w.label} no está unida a un motor: no empuja al robot.`);
  for (const m of project.parts.filter(p => p.definitionId === 'dc-motor-tt')) if (!hinges.some(h => h.parent.instanceId === m.instanceId)) notes.push(`${m.label} no tiene rueda en su eje.`);
  return {wheels: hinges.length, notes};
}

export class RobotPhysics {
  private bodies: Body[] = [];
  private hinges: Hinge[] = [];
  private sensorParts: {part: PartInstance; body: Body; local: Transform}[] = [];
  private lastRays = new Map<string, SensorRay>();
  private lastTorque = new Map<string, number>();
  readonly notes: string[];
  private readonly R: Rapier;
  private readonly world: RWorld;
  readonly project: RobotProject;

  private constructor(R: Rapier, world: RWorld, project: RobotProject) {
    this.R = R; this.world = world; this.project = project;
    this.notes = describePhysics(project).notes;
  }

  static create(R: Rapier, project: RobotProject): RobotPhysics {
    const scene = project.scene;
    const world = new R.World({x: 0, y: -Math.max(0, scene.physics.gravity), z: 0});
    world.timestep = PHYS_STEP_S;
    const phys = new RobotPhysics(R, world, project);
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
    fixed(ROOM_HALF + 1, 0.1, ROOM_HALF + 1, [0, -0.1, 0]);
    const t = 0.1, h = WALL_H / 2;
    fixed(ROOM_HALF + t, h, t / 2, [0, h, ROOM_HALF + t / 2], undefined, G_OBST); fixed(ROOM_HALF + t, h, t / 2, [0, h, -ROOM_HALF - t / 2], undefined, G_OBST);
    fixed(t / 2, h, ROOM_HALF + t, [ROOM_HALF + t / 2, h, 0], undefined, G_OBST); fixed(t / 2, h, ROOM_HALF + t, [-ROOM_HALF - t / 2, h, 0], undefined, G_OBST);
    for (const o of obstacles) {
      const [sx, sy, sz] = o.size, rot = o.transform.rotation, p = o.transform.position;
      const desc = o.shape === 'cylinder' ? R.ColliderDesc.cylinder(sy / 2, sx / 2) : R.ColliderDesc.cuboid(sx / 2, sy / 2, sz / 2);
      desc.setTranslation(p[0], p[1], p[2]).setRotation({x: rot[0], y: rot[1], z: rot[2], w: rot[3]}).setFriction(friction).setRestitution(0).setCollisionGroups(groups(G_GROUND | G_OBST, 0xffff));
      world.createCollider(desc);
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
      const cyl = R.ColliderDesc.cylinder(lw / 2, dia / 2).setMass(def.massKg).setFriction(friction * 1.5).setRestitution(0).setCollisionGroups(groups(G_WHEEL, G_GROUND));
      cyl.setRotation(rotToQuat(qMul(relQ, [0, 0, -Math.SQRT1_2, Math.SQRT1_2] as Quat))); // el cilindro de Rapier es vertical: se acuesta sobre el eje X
      world.createCollider(cyl, wheelBody);
      // Eje: +X del motor (los dos ejes de un motor TT giran en el mismo sentido), expresado en el cuerpo del chasis.
      const axisWorld = qRotate(qMul(start.rotation, motor.transform.rotation), [1, 0, 0]), axisLocal = qRotate(qInv(q), axisWorld);
      const anchorChassis = tPoint(tInv(chassis.frame), wPos);
      world.createImpulseJoint(R.JointData.revolute({x: anchorChassis[0], y: anchorChassis[1], z: anchorChassis[2]}, {x: 0, y: 0, z: 0}, {x: axisLocal[0], y: axisLocal[1], z: axisLocal[2]}), chassis.body, wheelBody, true);
      this.bodies.push(wb);
      this.hinges.push({motorId: motor.instanceId, wheelId: wheel.instanceId, wheel: wb, chassis, axisLocal});
    }
  }

  private addPartColliders(body: RBody, part: PartInstance, local: Transform) {
    const {R, world} = this, def = DIM(part.definitionId)!, [dx, dy, dz] = def.dimensions, rot = {x: local.rotation[0], y: local.rotation[1], z: local.rotation[2], w: local.rotation[3]};
    const place = (d: ReturnType<Rapier['ColliderDesc']['cuboid']>, at: Vec3, mass: number, mu: number) => {
      const p = tPoint(local, at); d.setTranslation(p[0], p[1], p[2]).setRotation(rot).setMass(mass).setFriction(mu).setRestitution(0).setCollisionGroups(groups(G_ROBOT, G_GROUND)); world.createCollider(d, body);
    };
    if (part.definitionId === 'caster-ball') { // esfera de apoyo casi sin rozamiento + separador
      const r = 0.0125;
      place(R.ColliderDesc.ball(r), [0, -0.009, 0], def.massKg * 0.6, 0.02);
      place(R.ColliderDesc.cuboid(0.009, 0.0115, 0.009), [0, 0.010, 0], def.massKg * 0.4, 0.3);
      return;
    }
    place(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), [0, 0, 0], Math.max(def.massKg, 1e-4), 0.3);
  }

  private refreshQueries() { (this.world as unknown as {updateSceneQueries?: () => void}).updateSceneQueries?.(); }

  /** Avanza un paso de 2 ms con las tensiones de motor que dejó el circuito (V entre M+ y M−). */
  step(motorVolts: ReadonlyMap<string, number>): void {
    for (const b of this.bodies) { b.body.resetTorques(false); }
    for (const h of this.hinges) {
      const v = motorVolts.get(h.motorId) ?? 0, q = h.chassis.body.rotation(), ax = qRotate([q.x, q.y, q.z, q.w], h.axisLocal);
      const w = h.wheel.body.angvel(), c = h.chassis.body.angvel(), omega = (w.x - c.x) * ax[0] + (w.y - c.y) * ax[1] + (w.z - c.z) * ax[2];
      const tau = Math.abs(v) < MOTOR.coastBelowV ? 0 : MOTOR.kt * (v - MOTOR.ke * omega) / MOTOR.ohms;
      this.lastTorque.set(h.wheelId, tau);
      if (tau) { h.wheel.body.addTorque({x: ax[0] * tau, y: ax[1] * tau, z: ax[2] * tau}, true); h.chassis.body.addTorque({x: -ax[0] * tau, y: -ax[1] * tau, z: -ax[2] * tau}, true); }
    }
    this.world.step();
  }

  /** HC-SR04: haz de rayos desde la cara del sensor; la distancia es la del obstáculo más cercano dentro del cono. Se mide solo cuando se pide
   *  (el programa dispara el sensor unas pocas veces por segundo; lanzar rayos en cada paso de 2 ms sería trabajo perdido). */
  private measure(s: {part: PartInstance; body: Body; local: Transform}): number | null {
    const {R, world} = this, bp = s.body.body.translation(), bq = s.body.body.rotation();
    const bodyT: Transform = {position: [bp.x, bp.y, bp.z], rotation: [bq.x, bq.y, bq.z, bq.w]}, t = tMul(bodyT, s.local);
    const origin = tPoint(t, [0, 0, BEAM.faceOffset]);
    let best: number | null = null, centerDir: Vec3 = qRotate(t.rotation, [0, 0, 1]);
    for (let i = 0; i < BEAM.rays; i++) {
      const yaw = (-BEAM.halfAngleDeg + (2 * BEAM.halfAngleDeg * i) / (BEAM.rays - 1)) * DEG, dir = qRotate(qMul(t.rotation, qFromAxisAngle([0, 1, 0], yaw)), [0, 0, 1]);
      if (i === (BEAM.rays - 1) / 2) centerDir = dir;
      const hit = world.castRay(new R.Ray({x: origin[0], y: origin[1], z: origin[2]}, {x: dir[0], y: dir[1], z: dir[2]}), BEAM.maxM, true, undefined, groups(0xffff, G_OBST));
      const toi = hit ? ((hit as unknown as {timeOfImpact?: number; toi?: number}).timeOfImpact ?? (hit as unknown as {toi?: number}).toi) : undefined;
      if (toi !== undefined && (best === null || toi < best)) best = toi;
    }
    const d = best === null ? null : Math.max(BEAM.minM, best);
    this.lastRays.set(s.part.instanceId, {origin, dir: centerDir, distance: d});
    return d;
  }

  /** Distancia medida por un HC-SR04 que está sobre el robot; `undefined` si ese sensor no forma parte de un cuerpo; `null` fuera de alcance. */
  distance(sensorId: string): number | null | undefined { const s = this.sensorParts.find(x => x.part.instanceId === sensorId); return s ? this.measure(s) : undefined; }

  frame(): PhysicsFrame {
    for (const s of this.sensorParts) this.measure(s);
    const poses: Record<string, BodyPose> = {}, main = this.bodies[0];
    for (const b of this.bodies) {
      const p = b.body.translation(), q = b.body.rotation(), t: Transform = {position: [p.x, p.y, p.z], rotation: [q.x, q.y, q.z, q.w]};
      for (const part of b.parts) { const w = tMul(t, part.local); poses[part.id] = {p: w.position, q: w.rotation}; }
    }
    const wheels = this.hinges.map(h => {
      const q = h.chassis.body.rotation(), ax = qRotate([q.x, q.y, q.z, q.w], h.axisLocal), w = h.wheel.body.angvel(), c = h.chassis.body.angvel();
      return {motorId: h.motorId, wheelId: h.wheelId, omega: (w.x - c.x) * ax[0] + (w.y - c.y) * ax[1] + (w.z - c.z) * ax[2], torque: this.lastTorque.get(h.wheelId) ?? 0};
    });
    let mainInfo: PhysicsFrame['main'] = null;
    if (main) { const p = main.body.translation(), v = main.body.linvel(); mainInfo = {p: [p.x, p.y, p.z], speed: Math.hypot(v.x, v.z)}; }
    return {poses, wheels, sensors: Object.fromEntries(this.lastRays), main: mainInfo};
  }

  dispose() { this.world.free(); }
}

const rotToQuat = (q: Quat) => ({x: q[0], y: q[1], z: q[2], w: q[3]});

export type {Rapier as RapierModule};
