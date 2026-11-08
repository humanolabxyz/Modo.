// Puertas que abren (fase 20). Puro: se prueba en Node. El gabinete de tablero y la sala eléctrica tienen una puerta con bisagra vertical que gira hasta su ángulo de apertura.
// Los mandos montados en la puerta del gabinete (pulsadores y piloto) y sus cables SIGUEN a la puerta: aquí se calcula su pose con la puerta abierta.
import {add, qFromAxisAngle, qFromEuler, qMul, qRotate, qToEuler, sub} from '../../robotics/project/math.ts';
import {toTransform} from '../build/snap.ts';
import type {IndustryProject, Pose, Vec3} from '../model/types.ts';

/** Bisagra (vertical, en el sistema local de la pieza) y ángulo de apertura (rad). El signo negativo abre hacia delante, hacia afuera. */
export const DOORS: Record<string, {pivot: Vec3; open: number}> = {
  gabinete: {pivot: [-0.494, 0, 0.171], open: (-100 * Math.PI) / 180},
  'sala-electrica': {pivot: [2.38, 0, 1.55], open: (-90 * Math.PI) / 180},
};
export const hasDoor = (definitionId: string): boolean => definitionId in DOORS;
/** ¿Está pedida la puerta abierta? (propiedad `puerta` de la pieza) */
export const wantsOpen = (props: Record<string, unknown>): boolean => props.puerta === 'abierta';
/** Ángulo de la puerta (rad) para un avance 0..1. */
export const doorAngle = (definitionId: string, progress: number): number => ((DOORS[definitionId]?.open ?? 0) * Math.max(0, Math.min(1, progress))) || 0;
/** Avance suave (0..1) hacia el destino: la puerta tarda unos 0,7 s en abrir. */
export const stepDoor = (progress: number, target: number, dt: number, speed = 1.45): number => (target > progress ? Math.min(target, progress + speed * dt) : Math.max(target, progress - speed * dt));

/** Poses de los mandos de la puerta de cada gabinete con su avance (gira cada mando en torno a la bisagra). Devuelve las mismas poses si ninguna puerta está abierta. */
export function doorPoses(project: IndustryProject, progress: Readonly<Record<string, number>>): Record<string, Pose> {
  let out: Record<string, Pose> | null = null;
  for (const m of project.mounts) {
    if (m.child.anchorId !== 'agujero') continue;
    const parent = project.entities.find(e => e.id === m.parent.entityId), pp = project.poses[m.parent.entityId], cp = project.poses[m.child.entityId];
    const pr = progress[m.parent.entityId] ?? 0;
    if (!parent || !pp || !cp || pr <= 0 || !DOORS[parent.definitionId]) continue;
    const tf = toTransform(pp), pivot = add(pp.position, qRotate(tf.rotation, DOORS[parent.definitionId].pivot)), axis = qRotate(tf.rotation, [0, 1, 0]), q = qFromAxisAngle(axis, doorAngle(parent.definitionId, pr));
    out ??= {...project.poses};
    out[m.child.entityId] = {position: add(pivot, qRotate(q, sub(cp.position, pivot))), rotation: qToEuler(qMul(q, qFromEuler(cp.rotation)))};
  }
  return out ?? project.poses;
}
