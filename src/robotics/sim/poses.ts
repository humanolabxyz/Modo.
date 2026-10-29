// Aplica las poses que calculó la física a una copia del proyecto, para dibujar piezas, pines y cables moviéndose juntos.
import type {RobotProject} from '../project/types.ts';
import type {BodyPose} from './physics.ts';

export function applyPoses(project: RobotProject, poses: Record<string, BodyPose>): RobotProject {
  return {
    ...project,
    parts: project.parts.map(p => { const w = poses[p.instanceId]; return w ? {...p, transform: {...p.transform, position: w.p, rotation: w.q}} : p; }),
    // los puntos de paso de un cable están fijados en el mundo: mientras el robot se mueve el cable va directo entre sus pines
    connections: project.connections.map(c => (c.route?.length ? {...c, route: undefined} : c)),
  };
}
