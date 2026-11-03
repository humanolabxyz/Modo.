import type {PartInstance, RobotProject, Transform, Vec3, Quat} from '../project/types.ts';
import {qFromAxisAngle, tIdentity, tInv, tPoint} from '../project/math.ts';
import {newRobotProject, newId} from '../project/defaults.ts';
import {readPieceColor} from '../conveyor/color.ts';

export const ARM_ID = 'educational-arm-e6';
export const BLOCK_ID = 'arm-practice-block';
export const ZONE_ID = 'arm-drop-zone';
export const ARM_TEMPLATE = 'brazo-educativo-e6';
export const ARM_TRANSFER_TEMPLATE = 'brazo-e6-transferencia';
import {HOME, JOINTS, armFrames, inverseArm, armCollision} from './kinematics.ts';
export {HOME, JOINTS, armAngles, armFrames} from './kinematics.ts';
export type ArmResult = {project: RobotProject; message: string; ok: boolean};
const distance = (a: Vec3, b: Vec3) => Math.hypot(...a.map((v, i) => v - b[i]));
export const heldId = (arm: PartInstance) => arm.definitionId === ARM_ID && typeof arm.props?.held === 'string' ? arm.props.held : '';
export function moveArm(p: RobotProject, id: string, angles: number[]): ArmResult {
  const arm = p.parts.find(x => x.instanceId === id && x.definitionId === ARM_ID);
  if (!arm || angles.length !== 6 || !angles.every(Number.isFinite)) return {project: p, ok: false, message: 'Movimiento inválido.'};
  const props = {...arm.props};
  JOINTS.forEach((j, i) => { props[`j${i + 1}`] = Math.max(j.min, Math.min(j.max, angles[i])); });
  const next = {...arm, props}, frames = armFrames(next);
  const collision = armCollision(p, next);
  if (collision) return {project: p, ok: false, message: collision};
  return {ok: true, message: 'Posición actualizada.', project: {...p, parts: p.parts.map(x => x.instanceId === id ? next : x.instanceId === heldId(arm) && x.definitionId === BLOCK_ID ? {...x, transform: frames.tcp} : x)}};
}
/** Solve a target; the controller must traverse and validate intermediate poses. */
export function approachArm(p: RobotProject, id: string, world: Vec3): ArmResult {
  const arm = p.parts.find(x => x.instanceId === id && x.definitionId === ARM_ID);
  if (!arm) return {project: p, ok: false, message: 'No hay un brazo seleccionado.'};
  const angles = inverseArm(arm, {position: world, rotation: qFromAxisAngle([1,0,0], Math.PI/2)});
  if (!angles) return {project: p, ok: false, message: 'Objetivo fuera de alcance o incompatible con la orientación de la pinza.'};
  return moveArm(p, id, angles);
}
export function gripArm(p: RobotProject, id: string, open: boolean): ArmResult {
  const arm = p.parts.find(x => x.instanceId === id && x.definitionId === ARM_ID);
  if (!arm) return {project: p, ok: false, message: 'No hay un brazo seleccionado.'};
  const tcp = armFrames(arm).tcp, held = p.parts.find(x => x.instanceId === heldId(arm) && x.definitionId === BLOCK_ID);
  const block = !open && !held ? p.parts.filter(x => x.definitionId === BLOCK_ID && !x.locked && !p.parts.some(a => a.instanceId !== id && heldId(a) === x.instanceId)).sort((a, b) => distance(a.transform.position, tcp.position) - distance(b.transform.position, tcp.position))[0] : undefined;
  const found = block && distance(block.transform.position, tcp.position) <= .025 ? block : undefined;
  if (found && (!Number.isFinite(Number(found.props?.massKg ?? .05)) || Number(found.props?.massKg ?? .05) <= 0)) return {project: p, ok: false, message: 'La masa de la pieza debe ser positiva.'};
  if (found && Number(found.props?.massKg ?? .05) + .08 > .75) return {project: p, ok: false, message: 'Pieza y herramienta superan la carga de referencia de 750 g.'};
  const holding = open ? '' : held?.instanceId ?? found?.instanceId ?? '';
  const project = {...p, parts: p.parts.map(x => x.instanceId === id ? {...x, props: {...x.props, gripperOpen: open, held: holding}} : open && held?.instanceId === x.instanceId ? {...x, locked: false, props: {...x.props, depositedBy: id}, transform: tcp} : found?.instanceId === x.instanceId ? {...x, locked: true, props: {...x.props, depositedBy: ''}, transform: tcp} : x)};
  return {project, ok: true, message: open ? held ? 'Pieza depositada.' : 'Pinza abierta.' : holding ? 'Pieza sujeta. Ahora levanta el brazo.' : 'Pinza cerrada sin pieza: acerca la herramienta a menos de 25 mm y vuelve a abrir y cerrar.'};
}
export function armTaskProgress(p: RobotProject) {
  const blocks = p.parts.filter(x => x.definitionId === BLOCK_ID);
  const done = blocks.filter(x => {
    const zone = p.parts.find(z => z.definitionId === ZONE_ID && (!x.props?.targetZone || z.instanceId === x.props.targetZone));
    return zone && (!zone.props?.acceptColor||readPieceColor(x).color===zone.props.acceptColor) && p.parts.some(a => a.definitionId === ARM_ID && a.instanceId === x.props?.depositedBy) && !p.parts.some(a => heldId(a) === x.instanceId) && Math.abs(x.transform.position[1] - .0175) < .005 && (() => {
    const v = tPoint(tInv(zone.transform), x.transform.position);
    return Math.abs(v[0]) <= .0425 && Math.abs(v[2]) <= .0425;
    })();
  }).length;
  return {done, total: blocks.length, complete: blocks.length > 0 && done === blocks.length};
}
export const delivered = (p: RobotProject) => armTaskProgress(p).complete;
export function resetArmPractice(p: RobotProject, id: string): ArmResult {
  const arm = p.parts.find(x => x.instanceId === id && x.definitionId === ARM_ID);
  if (!arm) return {project: p, ok: false, message: 'No hay un brazo seleccionado.'};
  const blocks = p.parts.filter(x => x.definitionId === BLOCK_ID && !p.parts.some(a => a.instanceId !== id && heldId(a) === x.instanceId));
  const reset = {...p, parts: p.parts.map(x => x.instanceId === id ? {...x, props: {...x.props, gripperOpen: true, held: ''}} : blocks.includes(x) ? {...x, locked: false, props: {...x.props, depositedBy: ''}, transform: {position: tPoint(arm.transform, [Number(x.props?.startX ?? .28), Number(x.props?.startY ?? -.034), Number(x.props?.startZ ?? .10)]), rotation: [0, 0, 0, 1] as Quat}} : x)};
  const result = moveArm(reset, id, HOME);
  return result.ok ? {...result, message: 'Práctica reiniciada. Puedes deshacer este cambio.'} : {project: p, ok: false, message: result.message};
}

/** A second application of the same E6 mechanics, not a different product profile. */
export function buildArmTransfer(now = new Date().toISOString()): RobotProject {
  const p = buildArmPractice(now), arm = p.parts[0];
  const positions = [[.25, .10, -.14], [.38, .10, -.14], [.25, .23, -.27]];
  return {...p, name: 'E6 · transferencia de tres piezas', parts: [arm, ...positions.flatMap(([x, z, targetZ], i): PartInstance[] => {
    const zoneId = newId();
    return [
      {instanceId: newId(), definitionId: BLOCK_ID, label: `Pieza ${i + 1} · 50 g`, transform: {...tIdentity(), position: [x, .0175, z]}, props: {massKg: .05, startX: x, startZ: z, targetZone: zoneId}},
      {instanceId: zoneId, definitionId: ZONE_ID, label: `Destino ${i + 1}`, transform: {...tIdentity(), position: [x, .002, targetZ]}, locked: true},
    ];
  })]};
}
export function buildArmPractice(now = new Date().toISOString()): RobotProject {
  const p = newRobotProject('Brazo educativo · práctica de pinza', now);
  const arm: PartInstance = {instanceId: newId(), definitionId: ARM_ID, label: 'Brazo educativo · referencia E6', transform: {...tIdentity(), position: [0, .0515, 0]}, locked: true, props: {...Object.fromEntries(HOME.map((v, i) => [`j${i + 1}`, v])), gripperOpen: true, held: '', modelRevision: 'e6-urdf-v1'}};
  return {...p, parts: [arm,
    {instanceId: newId(), definitionId: BLOCK_ID, label: 'Pieza de práctica · 50 g', transform: {...tIdentity(), position: [.28, .0175, .10]}, props: {massKg: .05}},
    {instanceId: newId(), definitionId: ZONE_ID, label: 'Zona de entrega', transform: {...tIdentity(), position: [.28, .002, -.14]}, locked: true},
  ], workspace: {mode: 'simulate', welcomeDismissed: true, camera: {position: [1, .8, 1.1], target: [.15, .12, 0]}}};
}
