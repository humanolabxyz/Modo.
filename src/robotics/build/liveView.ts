// Datos en vivo para el 3D: ángulos de servos (la pinza toma el de su servo) y objetos movibles en la posición que da la física.
import {CLAW_ID} from '../catalog/claw.ts';
import type {Obstacle, RobotProject} from '../project/types.ts';

/** Ángulo de cada servo y, para cada pinza, el ángulo del servo que la abre y la cierra. */
export function liveServos(project: RobotProject, servos: Record<string, {angle: number}>): Record<string, number> {
  const out = Object.fromEntries(Object.entries(servos).map(([id, s]) => [id, s.angle]));
  for (const claw of project.parts) {
    if (claw.definitionId !== CLAW_ID) continue;
    const grip = project.attachments.find(a => a.parent.instanceId === claw.instanceId && a.parent.anchorId === 'servo')?.child.instanceId;
    if (grip && servos[grip]) out[claw.instanceId] = servos[grip].angle;
  }
  return out;
}

type Pose = {p: [number, number, number]; q: [number, number, number, number]};
/** Los obstáculos movibles se dibujan donde los dejó la física; los fijos, donde están en el proyecto. */
export function movedObstacles(obstacles: Obstacle[], objects?: Record<string, Pose>): Obstacle[] {
  if (!objects) return obstacles;
  return obstacles.map(o => { const pose = o.movable ? objects[o.id] : undefined; return pose ? {...o, transform: {position: pose.p, rotation: pose.q}} : o; });
}
