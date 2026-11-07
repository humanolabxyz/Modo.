// Operaciones del constructor 3D sobre el modelo compartido: mover, girar y montar con un solo paso de historial. Puras y validadas.
import {mount} from '../model/commands.ts';
import type {IndustryProject, MountKind, Pose, Result, Vec3} from '../model/types.ts';
import {anchorOf} from './shapes.ts';
import {movedPoses, parentMountOf, snapToGrid, toPose, toTransform, type SnapCandidate} from './snap.ts';
import {qFromAxisAngle, qMul, qNorm} from '../../robotics/project/math.ts';

const ok = (value: IndustryProject): Result<IndustryProject> => ({ok: true, value});
const fail = (error: string): Result<IndustryProject> => ({ok: false, error});

/** Mueve una pieza (con todo lo que cuelga de ella). Una pieza montada no se arrastra: se libera primero o se mueve su soporte. */
export function moveEntity(p: IndustryProject, id: string, pose: Pose, options: {grid?: boolean} = {}): Result<IndustryProject> {
  const e = p.entities.find(x => x.id === id);
  if (!e || !p.poses[id]) return fail('El componente no existe.');
  if (e.locked) return fail('El componente está bloqueado.');
  if (parentMountOf(p, id)) return fail('El componente está montado. Libéralo primero o mueve el soporte al que está unido.');
  if (pose.position.some(v => !Number.isFinite(v)) || pose.rotation.some(v => !Number.isFinite(v))) return fail('La posición no es válida.');
  if (pose.position.some(v => Math.abs(v) > 500)) return fail('La posición queda fuera del área de trabajo (±500 m).');
  const target: Pose = options.grid ? {position: snapToGrid(pose.position), rotation: pose.rotation} : pose;
  return ok({...p, poses: movedPoses(p, id, target)});
}

/** Gira la pieza (y lo que cuelga de ella) `degrees` alrededor del eje vertical del mundo. */
export function rotateEntity(p: IndustryProject, id: string, degrees: number): Result<IndustryProject> {
  const pose = p.poses[id];
  if (!pose) return fail('El componente no existe.');
  const t = toTransform(pose), q = qNorm(qMul(qFromAxisAngle([0, 1, 0], (degrees * Math.PI) / 180), t.rotation));
  return moveEntity(p, id, toPose({position: t.position, rotation: q}));
}

/** Acopla la pieza al candidato elegido: coloca la pose alineada y crea el montaje en un único paso. */
export function snapMount(p: IndustryProject, candidate: SnapCandidate): Result<IndustryProject> {
  const childShape = p.entities.find(e => e.id === candidate.child.entityId), parentShape = p.entities.find(e => e.id === candidate.parent.entityId);
  if (!childShape || !parentShape) return fail('El componente no existe.');
  const ca = anchorOf(childShape.definitionId, candidate.child.anchorId), pa = anchorOf(parentShape.definitionId, candidate.parent.anchorId);
  if (!ca || !pa) return fail('El anclaje no existe en esa pieza.');
  if (ca.role !== 'child' || pa.role !== 'host' || ca.kind !== pa.kind) return fail('Esos anclajes no son compatibles.');
  const moved = moveEntity(p, candidate.child.entityId, candidate.pose);
  if (!moved.ok) return moved;
  return mount(moved.value, candidate.parent, candidate.child, candidate.kind as MountKind);
}

export const rotationDegrees = (rotation: Vec3): Vec3 => rotation.map(v => Math.round(((v * 180) / Math.PI) * 100) / 100) as Vec3;
