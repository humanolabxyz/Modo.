import {getDefinition} from '../catalog/index.ts';
import {canRun, artifactStatus, hashSource} from '../mcu/compiler/state.ts';
import {qFromAxisAngle, tInv, tMul} from '../project/math.ts';
import type {RobotProject, Transform, Vec3} from '../project/types.ts';
import {Coordinator, STEP_US, type PhysicsPort} from '../sim/coordinator.ts';
import {RobotPhysics, type PhysicsFrame, type RapierModule} from '../sim/physics.ts';

export const ARENA_RADIUS = 0.75;
export const COUNTDOWN_S = 3;
export type ArenaResult = {winner: 0 | 1 | null; reason: 'salida' | 'salida simultánea' | 'tiempo agotado'};
export type ArenaFrame = {physics: PhysicsFrame; elapsed: number; countdown: number; result: ArenaResult | null; roots: [string, string]};

/** These are practice criteria, not a certification for a real minisumo class. */
export function arenaEligibility(p: RobotProject): {error?: string; root: string; target: string; hex: string; mass: number} {
  const roots = p.parts.filter(x => x.definitionId === 'chassis-2wd');
  const unos = p.parts.filter(x => x.definitionId === 'arduino-uno-r3');
  const root = roots[0]?.instanceId ?? '', target = unos[0]?.instanceId ?? '';
  const fw = p.firmware.find(x => x.targetInstanceId === target);
  const mass = p.parts.reduce((sum, x) => sum + (getDefinition(x.definitionId)?.massKg ?? 0), 0);
  const base = {root, target, hex: fw?.artifact?.hex ?? '', mass};
  if (!root || unos.length !== 1) return {...base, error: 'Necesita un chasis móvil y una sola placa Arduino UNO.'};
  if (p.parts.length > 100) return {...base, error: 'La arena admite hasta 100 piezas por robot.'};
  if (p.parts.some(x => x.definitionId === 'educational-arm-e6')) return {...base, error: 'El brazo se utiliza en su propia práctica.'};
  const connected = new Set([root]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of p.attachments) if (connected.has(a.parent.instanceId) !== connected.has(a.child.instanceId)) {
      connected.add(a.parent.instanceId); connected.add(a.child.instanceId); changed = true;
    }
  }
  if (p.parts.some(x => !connected.has(x.instanceId))) return {...base, error: 'Hay piezas sueltas: une todo el robot antes de entrar.'};
  if (p.attachments.filter(x => x.kind === 'wheel-hinge').length < 2) return {...base, error: 'Necesita al menos dos ruedas unidas a motores.'};
  if (!fw || !canRun(artifactStatus(fw.artifact, hashSource(fw.source)))) return {...base, error: 'Compila el programa actual o importa su .hex antes de competir.'};
  return base;
}

/** Copies with separate IDs; never writes match poses or scores into the learner's projects. */
export function prepareArena(a: RobotProject, b: RobotProject) {
  const roots: string[] = [], targets: string[] = [], teams: Record<string, 0 | 1> = {};
  const robots = [a, b].map((p, i) => {
    const info = arenaEligibility(p);
    if (info.error) throw new Error(`${i === 0 ? 'Azul' : 'Naranja'}: ${info.error}`);
    const root = p.parts.find(x => x.instanceId === info.root)!;
    const origin: Transform = {position: [root.transform.position[0], 0, root.transform.position[2]], rotation: root.transform.rotation};
    const start: Transform = {position: [0, 0, i === 0 ? -0.36 : 0.36], rotation: qFromAxisAngle([0, 1, 0], i === 0 ? 0 : Math.PI)};
    const shift = tMul(start, tInv(origin)), id = (s: string) => `${i}/${s}`;
    const ref = <T extends {instanceId: string}>(r: T): T => ({...r, instanceId: id(r.instanceId)});
    roots.push(id(info.root)); targets.push(id(info.target));
    return {...p, parts: p.parts.map(x => {
      teams[id(x.instanceId)] = i as 0 | 1;
      return {...x, instanceId: id(x.instanceId), transform: tMul(shift, x.transform)};
    }), attachments: p.attachments.map(x => ({...x, id: id(x.id), parent: ref(x.parent), child: ref(x.child)})),
    connections: p.connections.map(x => ({...x, id: id(x.id), a: ref(x.a), b: ref(x.b), route: undefined})),
    firmware: p.firmware.map(x => ({...x, id: id(x.id), targetInstanceId: id(x.targetInstanceId)}))};
  });
  const project: RobotProject = {...robots[0], armProgram: undefined, name: 'Arena de sumo',
    parts: robots.flatMap(x => x.parts), attachments: robots.flatMap(x => x.attachments), connections: robots.flatMap(x => x.connections), firmware: robots.flatMap(x => x.firmware),
    scene: {obstacles: [], robotStart: {position: [0, 0, 0], rotation: [0, 0, 0, 1]}, physics: {gravity: 9.81, friction: 0.7},
      lineTrack: {name: 'Arena didáctica', width: 0.06, closed: true, points: Array.from({length: 128}, (_, j): Vec3 => [0.72 * Math.cos(j * Math.PI / 64), 0, 0.72 * Math.sin(j * Math.PI / 64)])}}};
  return {project, robots, roots: roots as [string, string], targets, teams};
}

export function judgeArena(positions: [Vec3, Vec3], outside: [number, number], dt: number, elapsed: number, duration: number): {outside: [number, number]; result: ArenaResult | null} {
  const next = positions.map((p, i) => Math.hypot(p[0], p[2]) > ARENA_RADIUS || p[1] < -0.06 ? outside[i] + dt : 0) as [number, number];
  const lost = next.map(x => x >= 0.15);
  const result: ArenaResult | null = lost[0] && lost[1] ? {winner: null, reason: 'salida simultánea'} : lost[0] || lost[1] ? {winner: lost[0] ? 1 : 0, reason: 'salida'} : elapsed >= duration ? {winner: null, reason: 'tiempo agotado'} : null;
  return {outside: next, result};
}

/** Both MCU/circuit loops advance before one shared physics step, avoiding a double-speed world. */
export class ArenaMatch {
  readonly prepared: ReturnType<typeof prepareArena>;
  private physics: RobotPhysics;
  private controllers: Coordinator[];
  private volts = new Map<string, number>();
  private clock = -COUNTDOWN_S;
  private outside: [number, number] = [0, 0];
  private result: ArenaResult | null = null;
  private poses: PhysicsFrame;
  readonly duration: number;
  constructor(R: RapierModule, a: RobotProject, b: RobotProject, duration = 60) {
    this.duration = duration;
    this.prepared = prepareArena(a, b);
    this.physics = RobotPhysics.create(R, this.prepared.project, {arenaRadius: ARENA_RADIUS, teams: this.prepared.teams});
    this.poses = this.physics.frame(false);
    const port: PhysicsPort = {
      step: v => { for (const [id, value] of v) this.volts.set(id, value); },
      distance: id => this.physics.distance(id), reflectance: id => this.physics.reflectance(id), frame: () => this.poses,
    };
    try {
      this.controllers = this.prepared.robots.map((project, i) => new Coordinator({project: {...project, scene: this.prepared.project.scene}, targetId: this.prepared.targets[i], hex: arenaEligibility(i === 0 ? a : b).hex}, port));
      for (const [i, c] of this.controllers.entries()) {
        const snap = c.snapshot();
        if (snap.status !== 'running') throw new Error(`${i === 0 ? 'Azul' : 'Naranja'}: ${snap.message ?? 'sin alimentación'}`);
      }
      this.volts.clear();
    } catch (e) { this.physics.dispose(); throw e; }
  }
  step() {
    if (this.result) return;
    const dt = STEP_US / 1e6;
    this.volts.clear();
    if (this.clock >= -1e-8) for (const c of this.controllers) {
      c.advance(STEP_US);
      // Runtime errors are match errors, never silent losses for the other player.
      const snap = c.snapshot();
      if (snap.status !== 'running') throw new Error(snap.message ?? 'Un programa se detuvo.');
    }
    this.physics.step(this.volts); this.clock += dt;
    // Full sensor rays are sampled only for UI frames; poses are required for the referee.
    this.poses = this.physics.frame(false);
    if (this.clock >= 0) {
      const positions = this.prepared.roots.map(id => this.poses.poses[id].p) as [Vec3, Vec3];
      const judged = judgeArena(positions, this.outside, dt, this.clock, this.duration);
      this.outside = judged.outside; this.result = judged.result;
    }
  }
  frame(): ArenaFrame { return {physics: this.poses, elapsed: Math.max(0, this.clock), countdown: Math.max(0, Math.ceil(-this.clock)), result: this.result, roots: this.prepared.roots}; }
  dispose() { this.physics.dispose(); }
}
