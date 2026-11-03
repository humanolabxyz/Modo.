import type {RobotProject, Vec3} from '../project/types.ts';
import {ARM_ID, BLOCK_ID, ZONE_ID, approachArm, gripArm, heldId, armAngles, HOME} from './model.ts';
import {planArmMotion} from './motion.ts';

export type ArmPoint = NonNullable<RobotProject['armProgram']>['points'][number];
type ProgramResult = {ok: true; program: NonNullable<RobotProject['armProgram']>; duration: number} | {ok: false; message: string};

/** Generate from scene positions, with full path preflight and simulated grasps.
 * The returned program changes no live pose; playback uses the regular controller.
 */
export function prepareArmTask(project: RobotProject, id: string, speed = 50, pieceIds?: string[]): ProgramResult {
  let p = project;
  const arm = p.parts.find(x => x.instanceId === id && x.definitionId === ARM_ID);
  if (!arm) return {ok: false, message: 'Falta el brazo de la práctica.'};
  if (heldId(arm)) return {ok: false, message: 'Suelta la pieza o reinicia la práctica antes de preparar el ciclo.'};
  const blocks = p.parts.filter(x => x.definitionId === BLOCK_ID && (!pieceIds || pieceIds.includes(x.instanceId)));
  if (!blocks.length || blocks.length > 4) return {ok: false, message: 'El ciclo admite de una a cuatro piezas (máximo 40 puntos).'};
  const points: ArmPoint[] = [];
  let duration = 0;
  const append = (name: string, position: Vec3 | null, open: boolean, kind: ArmPoint['kind'], expectedHeld = ''): string | null => {
    const target = position ? approachArm(p, id, position) : null;
    if (target && !target.ok) return `${name}: ${target.message}`;
    const angles = target ? armAngles(target.project.parts.find(x => x.instanceId === id)!) : armAngles(p.parts.find(x => x.instanceId === id)!);
    const plan = planArmMotion(p, id, angles, kind, speed);
    if (!plan.ok) return `${name}: ${plan.message}`;
    p = target?.project ?? p;
    const grasp = gripArm(p, id, open);
    if (!grasp.ok) return `${name}: ${grasp.message}`;
    p = grasp.project;
    if (expectedHeld && heldId(p.parts.find(x => x.instanceId === id)!) !== expectedHeld) return `${name}: no se puede sujetar la pieza prevista.`;
    points.push({name, angles, kind, gripperOpen: open, ...(expectedHeld ? {expectedHeld} : {})});
    duration += plan.duration;
    return null;
  };
  for (const [i, block] of blocks.entries()) {
    const zone = p.parts.find(x => x.definitionId === ZONE_ID && (!block.props?.targetZone || x.instanceId === block.props.targetZone));
    if (!zone || block.locked) return {ok: false, message: `Pieza ${i + 1}: falta su destino o está bloqueada. Reinicia la práctica.`};
    const [x, y, z] = block.transform.position, [dx, , dz] = zone.transform.position;
    const steps: [string, Vec3 | null, boolean, ArmPoint['kind'], string?][] = [
      ['Sobre pieza', [x, Math.max(.20, y + .12), z], true, 'MovJ'],
      ['Descender', [x, y + .0075, z], true, 'MovL'],
      ['Sujetar', null, false, 'MovJ', block.instanceId],
      ['Levantar', [x, .20, z], false, 'MovL', block.instanceId],
      ['Sobre destino', [dx, .20, dz], false, 'MovJ', block.instanceId],
      ['Depositar', [dx, .025, dz], false, 'MovL', block.instanceId],
      ['Soltar', null, true, 'MovJ'],
      ['Retirar', [dx, .20, dz], true, 'MovL'],
    ];
    for (const [name, position, open, kind, expected] of steps) {
      const error = append(`${i + 1} · ${name}`, position, open, kind, expected);
      if (error) return {ok: false, message: error};
    }
  }
  const home = planArmMotion(p, id, HOME, 'MovJ', speed);
  if (!home.ok) return home;
  points.push({name: 'Volver a inicio', angles: [...HOME], gripperOpen: true, kind: 'MovJ'});
  return {ok: true, program: {armId: id, points}, duration: duration + home.duration};
}
