import {ROBOTICS_FORMAT, ROBOTICS_VERSION, type RobotProject, type Transform} from './types.ts';

export const IDENTITY: Transform = {position: [0, 0, 0], rotation: [0, 0, 0, 1]};
export const newId = (): string => globalThis.crypto.randomUUID();

/** Proyecto vacío: sin piezas, cables ni firmware. */
export function newRobotProject(name = 'Robot sin nombre', now = new Date().toISOString()): RobotProject {
  return {
    format: ROBOTICS_FORMAT,
    version: ROBOTICS_VERSION,
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    parts: [],
    attachments: [],
    connections: [],
    firmware: [],
    scene: {obstacles: [], robotStart: {...IDENTITY, position: [0, 0, 0]}, physics: {gravity: 9.81, friction: 0.7}},
    workspace: {mode: 'build'},
  };
}
