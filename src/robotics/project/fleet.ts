import {duplicateParts, type CommandResult, type CommandError} from './commands.ts';
import type {RobotProject, Vec3} from './types.ts';

export const MAX_RUNNING_ROBOTS = 3;

/** A mobile robot is an independent assembly and circuit. Cables between robots merge their groups. */
export function robotGroup(project: RobotProject, root: string): Set<string> {
  const graph = new Map<string, string[]>();
  const link = (a: string, b: string) => {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a)!.push(b); graph.get(b)!.push(a);
  };
  for (const a of project.attachments) link(a.parent.instanceId, a.child.instanceId);
  for (const c of project.connections) link(c.a.instanceId, c.b.instanceId);
  const ids = new Set([root]);
  for (const id of ids) for (const other of graph.get(id) ?? []) ids.add(other);
  return ids;
}

export function addRobotCopy(project: RobotProject, board: string): CommandResult | CommandError {
  const ids = robotGroup(project, board), parts = project.parts.filter(p => ids.has(p.instanceId));
  const chassis = parts.find(p => p.definitionId === 'chassis-2wd');
  if (!chassis || parts.filter(p => p.definitionId === 'arduino-uno-r3').length !== 1) return {error: 'Selecciona la placa de un robot móvil independiente.'};
  if (!project.firmware.some(f => f.targetInstanceId === board && f.artifact)) return {error: 'Compila el programa del robot antes de copiarlo.'};
  if (project.firmware.filter(f => f.artifact).length >= MAX_RUNNING_ROBOTS) return {error: 'Este escenario admite hasta 3 robots programados.'};
  const half = (project.scene.sizeM ?? 4) / 2;
  const [startX, , startZ] = chassis.transform.position;
  const offsets: Vec3[] = [[-1.15, 0, 0], [1.15, 0, 0], [0, 0, -1.15], [0, 0, 1.15], [-2.3, 0, 0], [2.3, 0, 0]];
  for (const offset of offsets) {
    const x = startX + offset[0], z = startZ + offset[2];
    if (Math.abs(x) > half - .45 || Math.abs(z) > half - .45) continue;
    if (project.parts.some(p => Math.hypot(x - p.transform.position[0], z - p.transform.position[2]) < .52)) continue;
    if (project.scene.obstacles.some(o => Math.hypot(x - o.transform.position[0], z - o.transform.position[2]) < .4 + Math.hypot(o.size[0], o.size[2]) / 2)) continue;
    return duplicateParts(project, [...ids], offset, true);
  }
  return {error: 'No hay espacio junto al robot. Amplía el área o mueve los obstáculos.'};
}
