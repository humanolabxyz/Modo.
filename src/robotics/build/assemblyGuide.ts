import {attach, parentAttachment, setPartTransform} from '../project/commands.ts';
import {dist, tInv, tMul} from '../project/math.ts';
import type {RobotProject} from '../project/types.ts';
import {findJoinCandidates} from './interference.ts';

/** Reference follows the first chassis, so moving an assembly also moves its guide. */
export function assemblyGuide(project: RobotProject, reference: RobotProject) {
  const root = reference.parts[0];
  const base = project.parts.find(p => p.definitionId === root.definitionId);
  const offset = base ? tMul(base.transform, tInv(root.transform)) : null;
  const targets = reference.parts.map(p => ({...p, transform: offset ? tMul(offset, p.transform) : p.transform}));
  const matched = new Map<string, string>(), used = new Set<string>();
  for (const target of targets) {
    const expected = parentAttachment(reference, target.instanceId);
    const found = project.parts.find(p => {
      if (used.has(p.instanceId) || p.definitionId !== target.definitionId || dist(p.transform.position, target.transform.position) > 0.004) return false;
      if (Math.abs(p.transform.rotation.reduce((sum, v, i) => sum + v * target.transform.rotation[i], 0)) < 0.995) return false;
      if (!expected) return true;
      const actual = parentAttachment(project, p.instanceId);
      return actual?.parent.instanceId === matched.get(expected.parent.instanceId) && actual?.parent.anchorId === expected.parent.anchorId && actual?.child.anchorId === expected.child.anchorId;
    });
    if (found) { matched.set(target.instanceId, found.instanceId); used.add(found.instanceId); }
  }
  return {targets, matched, next: targets.find(p => !matched.has(p.instanceId)), remaining: targets.filter(p => !matched.has(p.instanceId))};
}

/** Snap only one free child; ambiguous nearby anchors are left for explicit choice. */
export function snapAssembly(project: RobotProject, ids: string[], reference?: RobotProject | null): {project: RobotProject; label?: string} {
  if (ids.length !== 1) return {project};
  const part = project.parts.find(p => p.instanceId === ids[0]);
  if (!part || part.locked || parentAttachment(project, part.instanceId)) return {project};
  if (reference) {
    const guide = assemblyGuide(project, reference), target = guide.next;
    if (target?.definitionId === part.definitionId && dist(target.transform.position, part.transform.position) < 0.025) {
      const expected = parentAttachment(reference, target.instanceId);
      const parent = expected && guide.matched.get(expected.parent.instanceId);
      if (expected && !parent) return {project};
      const aligned = setPartTransform(project, part.instanceId, target.transform).project;
      const result = expected && parent ? attach(aligned, {...expected.parent, instanceId: parent}, {...expected.child, instanceId: part.instanceId}, expected.kind) : {project: aligned};
      if (!('error' in result)) return {project: result.project, label: part.label};
    }
  }
  const candidates = findJoinCandidates(project, ids).filter(c => c.child.instanceId === part.instanceId && !project.parts.find(p => p.instanceId === c.parent.instanceId)?.locked);
  const candidate = candidates[0];
  if (!candidate || (candidates[1] && candidates[1].distance - candidate.distance < 0.003)) return {project};
  const result = attach(project, candidate.parent, candidate.child);
  return 'error' in result ? {project} : {project: result.project, label: part.label};
}

export const canMoveAssembly = (p: RobotProject, ids: string[]) => ids.every(id => {
  const parent = parentAttachment(p, id);
  return !parent || ids.includes(parent.parent.instanceId);
});
