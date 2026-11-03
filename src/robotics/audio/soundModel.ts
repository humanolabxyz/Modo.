// Qué debe sonar en cada instante del robot, calculado solo a partir de la simulación (sin Web Audio, para poder probarlo en Node):
// los motores suenan según su velocidad, las orugas según lo que avanza el robot, cada servo según lo rápido que gira y las pinzas al agarrar o soltar.
import type {RobotProject} from '../project/types.ts';
import type {Snapshot} from '../sim/coordinator.ts';

export type SoundTargets = {
  powered: boolean;
  /** Motores: nivel 0–1 (velocidad relativa), lado para el paneo (−1 izquierda … 1 derecha) y si están frenados en corto. */
  motors: {id: string; pan: number; level: number; braking: boolean}[];
  /** Estruendo de las orugas, 0–1, según la velocidad del robot; 0 si no tiene orugas. */
  tracks: number;
  /** Servos con energía: velocidad de giro en grados por segundo. */
  servos: {id: string; pan: number; rate: number}[];
  /** Objetos que sostiene alguna pinza. */
  held: string[];
};
export type SoundEvent = {kind: 'power-on' | 'brake' | 'grasp' | 'release' | 'servo-start' | 'servo-stop'; id?: string};

/** Un metro por segundo sería muy rápido para estos robots: con 0,25 m/s las orugas ya suenan a pleno. */
export const FULL_TRACK_SPEED = 0.25, MIN_TRACK_SPEED = 0.03; // por debajo de 3 cm/s es solo el temblor de los brazos
const SERVO_MOVING = 8, SERVO_STILL = 3, SERVO_JITTER_DEG = 0.6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Paneo según la posición en el robot: la izquierda del robot es +x, así que el sonido de ese lado va a la izquierda. */
const panOf = (project: RobotProject, id: string) => clamp(-(project.parts.find(p => p.instanceId === id)?.transform.position[0] ?? 0) / 0.12, -1, 1) * 0.7;

export function soundTargets(project: RobotProject, snap: Snapshot | null, prev: Snapshot | null = null): SoundTargets {
  const silent: SoundTargets = {powered: false, motors: [], tracks: 0, servos: [], held: []};
  if (!snap || snap.status !== 'running') return silent;
  const dt = prev ? (snap.simTimeUs - prev.simTimeUs) / 1e6 : 0;
  const motors = Object.entries(snap.motors).map(([id, m]) => ({id, pan: panOf(project, id), level: m.braking ? 0 : Math.abs(m.speed), braking: m.braking}));
  const hasTracks = project.parts.some(p => p.definitionId === 'track-belt');
  const tracks = hasTracks && snap.physics?.main ? clamp((snap.physics.main.speed - MIN_TRACK_SPEED) / (FULL_TRACK_SPEED - MIN_TRACK_SPEED), 0, 1) : 0;
  const servos = Object.entries(snap.servos ?? {}).filter(([, s]) => s.powered && s.linked).map(([id, s]) => {
    const before = prev?.servos?.[id]?.angle, delta = before !== undefined ? Math.abs(s.angle - before) : 0;
    // Un servo que solo mantiene su posición no suena: el pulso medido por el emulador salta unas décimas de grado (1471 → 1476 µs) y eso no es movimiento.
    const rate = dt > 0 && delta >= SERVO_JITTER_DEG ? delta / dt : 0;
    return {id, pan: panOf(project, id), rate};
  });
  const held = Object.entries(snap.physics?.objects ?? {}).filter(([, o]) => o.heldBy).map(([id]) => id).sort();
  return {powered: snap.uno.powered, motors, tracks, servos, held};
}

/** Los golpes y chasquidos puntuales que aparecen al pasar de un instante al siguiente. */
export function soundEvents(prev: SoundTargets | null, next: SoundTargets): SoundEvent[] {
  const out: SoundEvent[] = [];
  if (next.powered && !prev?.powered) out.push({kind: 'power-on'});
  const wasFast = Math.max(0, ...(prev?.motors ?? []).map(m => m.level)) > 0.35;
  if (wasFast && next.motors.some(m => m.braking) && !prev?.motors.some(m => m.braking)) out.push({kind: 'brake'});
  for (const id of next.held) if (!prev?.held.includes(id)) out.push({kind: 'grasp', id});
  for (const id of prev?.held ?? []) if (!next.held.includes(id)) out.push({kind: 'release', id});
  for (const s of next.servos) {
    const before = prev?.servos.find(x => x.id === s.id)?.rate ?? 0;
    if (before < SERVO_MOVING && s.rate >= SERVO_MOVING) out.push({kind: 'servo-start', id: s.id});
    else if (before >= SERVO_MOVING && s.rate < SERVO_STILL) out.push({kind: 'servo-stop', id: s.id});
  }
  return out;
}
