// Proceso de planta (fase 15). Puro: se prueba en Node. Es la parte MECÁNICA de la simulación: lo que se mueve cuando los equipos reciben alimentación.
//   · cinta transportadora: se mueve mientras el motor trifásico junto a su cabezal está alimentado, y arrastra las cajas montadas sobre ella (al llegar al final
//     vuelven al principio, como un alimentador continuo);
//   · sensor fotoeléctrico: detecta una caja delante de su lente; sensor inductivo: detecta el vástago del cilindro cuando está en su posición;
//   · electroválvula + cilindro: con la bobina alimentada y aire del compresor, el vástago sale; sin bobina, vuelve (muelle de retorno);
//   · brazo robótico: mientras está alimentado, gira el hombro y mueve la pinza (movimiento ilustrativo, sin cinemática real).
// Los sensores devuelven `inputs[id]` al motor lógico (src/sim/engine.ts), que los cablea al PLC: el circuito CIERRA EL LAZO con el proceso.
// Velocidades, carreras y distancias de detección son de ejemplo, no de equipos reales.
import {add, qInv, qRotate, scale} from '../../robotics/project/math.ts';
import {toTransform} from '../build/snap.ts';
import {shapeOf} from '../build/shapes.ts';
import type {IndustryProject, Vec3} from '../model/types.ts';
import type {SimResult} from './engine.ts';

export const BELT_SPEED = 0.25; // m/s
export const ROD_STROKE = 0.1; // m
export const ROD_SPEED = 1.5; // carreras por segundo
export const ROBOT_SPEED = 2.2; // rad/s del ciclo de trabajo
export const FOTO_RADIUS = 0.2; // m (en el plano horizontal)
export const INDUCTIVE_RADIUS = 0.05;
const END_MARGIN = 0.08, DRIVE_REACH = 0.7;

export type ProcessState = {t: number; /** recorrido acumulado de cada banda (para animarla), m */ belts: Record<string, number>; /** desplazamiento de cada caja sobre su cinta, m */ products: Record<string, number>; /** extensión del vástago 0..1 */ rods: Record<string, number>; /** fase del ciclo del robot, rad */ swing: Record<string, number>};
export const emptyProcess = (): ProcessState => ({t: 0, belts: {}, products: {}, rods: {}, swing: {}});

const PROCESS_DEFS = ['caja-producto', 'cilindro-neumatico', 'brazo-robot', 'sensor-inductivo', 'sensor-fotoelectrico', 'cinta-transportadora'];
/** ¿Tiene el proyecto algo que se mueva o detecte? (activa el reloj del proceso al simular). */
export const hasProcess = (p: IndustryProject): boolean => p.entities.some(e => PROCESS_DEFS.includes(e.definitionId));

const axisOf = (p: IndustryProject, id: string): Vec3 => qRotate(toTransform(p.poses[id]).rotation, [1, 0, 0]);
const xz = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[2] - b[2]);

/** Cinta sobre la que está montada una caja. */
export const conveyorOf = (p: IndustryProject, productId: string): string | null => p.mounts.find(m => m.child.entityId === productId && p.entities.find(e => e.id === m.parent.entityId)?.definitionId === 'cinta-transportadora')?.parent.entityId ?? null;

/** Motor trifásico que mueve la cinta: el más cercano a su rectángulo (junto al cabezal). */
export function driveOf(p: IndustryProject, conveyorId: string): string | null {
  const pose = p.poses[conveyorId]; if (!pose) return null;
  const rot = toTransform(pose).rotation, size = shapeOf('cinta-transportadora').size;
  let best: string | null = null, bestD = DRIVE_REACH;
  for (const e of p.entities) {
    if (e.definitionId !== 'motor-3p') continue;
    const m = p.poses[e.id]; if (!m) continue;
    const d = qRotate(qInv(rot), [m.position[0] - pose.position[0], 0, m.position[2] - pose.position[2]]);
    const dx = Math.max(0, Math.abs(d[0]) - size[0] / 2), dz = Math.max(0, Math.abs(d[2]) - size[2] / 2), dist = Math.hypot(dx, dz);
    if (dist < bestD) { bestD = dist; best = e.id; }
  }
  return best;
}

/** Posición en el mundo de una caja con su desplazamiento sobre la cinta. */
export const productPosition = (p: IndustryProject, st: ProcessState, id: string): Vec3 => { const base = p.poses[id].position, c = conveyorOf(p, id); return c ? add(base, scale(axisOf(p, c), st.products[id] ?? 0)) : base; };
/** Desplazamiento (vector del mundo) que se suma a la pose de una caja. */
export const productOffset = (p: IndustryProject, st: ProcessState, id: string): Vec3 => { const c = conveyorOf(p, id); return c ? scale(axisOf(p, c), st.products[id] ?? 0) : [0, 0, 0]; };
/** Punta del vástago de un cilindro en el mundo. */
export const rodTip = (p: IndustryProject, st: ProcessState, id: string): Vec3 => { const pose = p.poses[id], half = shapeOf('cilindro-neumatico').size[0] / 2; return add(pose.position, scale(axisOf(p, id), half + ROD_STROKE * (st.rods[id] ?? 0))); };
/** Ángulo del hombro del robot (rad) en su ciclo de trabajo. */
export const robotAngle = (st: ProcessState, id: string): number => Math.sin(st.swing[id] ?? 0) * 0.55;

/** ¿La electroválvula tiene aire? (su puerto P está en la misma red de conductos que el de un compresor) */
function hasAir(p: IndustryProject, sim: SimResult, valveId: string): boolean {
  const comps = p.entities.filter(e => e.definitionId === 'compresor');
  return comps.some(c => sim.sameNet({entityId: valveId, terminalId: 'P'}, {entityId: c.id, terminalId: 'P'}));
}
/** Electroválvula que gobierna a un cilindro: la que comparte red en el puerto A o B. */
export function valveOf(p: IndustryProject, sim: SimResult, cylinderId: string): string | null {
  for (const v of p.entities) if (v.definitionId === 'valvula-5-2' && (['A', 'B'] as const).some(port => sim.sameNet({entityId: cylinderId, terminalId: port}, {entityId: v.id, terminalId: port}))) return v.id;
  return null;
}

/** Avanza el proceso `dt` segundos con el estado eléctrico `sim`. */
export function stepProcess(p: IndustryProject, sim: SimResult | null, st: ProcessState, dt: number): ProcessState {
  const next: ProcessState = {t: st.t + dt, belts: {...st.belts}, products: {...st.products}, rods: {...st.rods}, swing: {...st.swing}};
  for (const e of p.entities) if (e.definitionId === 'cinta-transportadora') { const drive = driveOf(p, e.id); next.belts[e.id] = (st.belts[e.id] ?? 0) + (drive && sim?.energized[drive] ? BELT_SPEED * dt : 0); }
  // Cintas y cajas
  for (const e of p.entities) {
    if (e.definitionId !== 'caja-producto') continue;
    const c = conveyorOf(p, e.id); if (!c) continue;
    const drive = driveOf(p, c), running = !!(drive && sim?.energized[drive]);
    const half = shapeOf('cinta-transportadora').size[0] / 2 - END_MARGIN, u0 = (p.poses[e.id].position[0] - p.poses[c].position[0]) * axisOf(p, c)[0] + (p.poses[e.id].position[2] - p.poses[c].position[2]) * axisOf(p, c)[2];
    let x = (st.products[e.id] ?? 0) + (running ? BELT_SPEED * dt : 0); const u = u0 + x;
    if (u > half) x -= half * 2; // vuelve al principio
    next.products[e.id] = x;
  }
  // Cilindros
  for (const e of p.entities) {
    if (e.definitionId !== 'cilindro-neumatico') continue;
    const valve = sim ? valveOf(p, sim, e.id) : null, push = !!(valve && sim?.energized[valve] && hasAir(p, sim, valve)), cur = st.rods[e.id] ?? 0;
    next.rods[e.id] = Math.max(0, Math.min(1, cur + (push ? 1 : -1) * ROD_SPEED * dt));
  }
  // Robots
  for (const e of p.entities) if (e.definitionId === 'brazo-robot') next.swing[e.id] = (st.swing[e.id] ?? 0) + (sim?.energized[e.id] ? ROBOT_SPEED * dt : 0);
  return next;
}

/** Estado de cada sensor según el proceso: `true` = detecta. Se pasa al motor lógico como entradas. */
export function sensorStates(p: IndustryProject, st: ProcessState): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const e of p.entities) {
    const pose = p.poses[e.id]; if (!pose) continue;
    if (e.definitionId === 'sensor-fotoelectrico') out[e.id] = p.entities.some(o => o.definitionId === 'caja-producto' && p.poses[o.id] && xz(productPosition(p, st, o.id), pose.position) <= FOTO_RADIUS);
    if (e.definitionId === 'sensor-inductivo') out[e.id] = p.entities.some(o => o.definitionId === 'cilindro-neumatico' && p.poses[o.id] && xz(rodTip(p, st, o.id), pose.position) <= INDUCTIVE_RADIUS);
  }
  return out;
}
