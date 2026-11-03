// Evalúa los pasos de una guía de cableado contra el proyecto real. Puro: no toca la interfaz ni el simulador.
// «Hecho» significa que los dos pines quedaron en la MISMA red eléctrica (no importa si el cable fue directo o por la protoboard ni qué GND se usó),
// igual que lo vería un multímetro. Si el cable existe pero va a otro pin de la misma pieza, el paso queda «equivocado» y se explica cuál.
import {getDefinition} from '../catalog/index.ts';
import {connect, setPartProp, type CommandError, type CommandResult} from '../project/commands.ts';
import type {PartInstance, PinRef, RobotProject} from '../project/types.ts';
import {buildGraph, netOfPin, pinKey, type CircuitGraph} from '../circuit/graph.ts';
import {assemblyGuide} from '../build/assemblyGuide.ts';
import type {GuideStep, PartRef, PinSpec, PropStep, StepState, WireStep, WiringGuideDef} from './types.ts';

/** Emparejamiento pieza de la plantilla → pieza del usuario (solo guías con `reference`). Lo que no se empareja por posición se busca por tipo y orden. */
export type Matched = ReadonlyMap<string, string>;
export const matchReference = (project: RobotProject, guide: WiringGuideDef): Matched | undefined => {
 if(!guide.reference)return undefined;
 const matched=new Map(assemblyGuide(project,guide.reference).matched),used=new Set(matched.values());
 // Una identidad conservada o una pieza reubicada no pierde su función ni puede reutilizar otra instancia ya asignada.
 for(const ref of guide.reference.parts){if(matched.has(ref.instanceId))continue;const exact=project.parts.find(p=>p.instanceId===ref.instanceId&&p.definitionId===ref.definitionId&&!used.has(p.instanceId));if(exact){matched.set(ref.instanceId,exact.instanceId);used.add(exact.instanceId);}}
 for(const ref of guide.reference.parts){if(matched.has(ref.instanceId))continue;const found=project.parts.find(p=>p.definitionId===ref.definitionId&&p.label===ref.label&&!used.has(p.instanceId));if(found){matched.set(ref.instanceId,found.instanceId);used.add(found.instanceId);}}
 for(const ref of guide.reference.parts){if(matched.has(ref.instanceId))continue;const found=project.parts.find(p=>p.definitionId===ref.definitionId&&!used.has(p.instanceId));if(found){matched.set(ref.instanceId,found.instanceId);used.add(found.instanceId);}}
 return matched;
};
export const resolvePart = (project: RobotProject, ref: PartRef, matched?: Matched): PartInstance | undefined => {
  const byRef = ref.ref && matched?.get(ref.ref);
  if(ref.ref&&matched)return byRef?project.parts.find(p=>p.instanceId===byRef):undefined;
  return (byRef ? project.parts.find(p => p.instanceId === byRef) : undefined) ?? project.parts.filter(p => p.definitionId === ref.def)[ref.n ?? 0];
};
const partName = (def: string) => getDefinition(def)?.name ?? def;
const pinLabel = (part: PartInstance, pin: string) => `${getDefinition(part.definitionId)?.pins.find(p => p.id === pin)?.label ?? pin} de ${part.label}`;

export type ResolvedWire = {from: PinRef; to: PinRef; fromPart: PartInstance; toPart: PartInstance};
export function resolveWire(project: RobotProject, step: WireStep, matched?: Matched): ResolvedWire | {missing: string} {
  const resolve = (spec: PinSpec) => resolvePart(project, spec.part, matched);
  const fromPart = resolve(step.from), toPart = resolve(step.to);
  if (!fromPart || !toPart) return {missing: `Falta ${partName(!fromPart ? step.from.part.def : step.to.part.def)}: arma primero esa pieza.`};
  if(!getDefinition(fromPart.definitionId)?.pins.some(p=>p.id===step.from.pin)||!getDefinition(toPart.definitionId)?.pins.some(p=>p.id===step.to.pin))return {missing:'La pieza encontrada no tiene los pines de este paso. Elige la guía que corresponde al armado.'};
  return {from: {instanceId: fromPart.instanceId, pinId: step.from.pin}, to: {instanceId: toPart.instanceId, pinId: step.to.pin}, fromPart, toPart};
}

const direct = (project: RobotProject, ref: PinRef) => project.connections.filter(c => pinKey(c.a) === pinKey(ref) || pinKey(c.b) === pinKey(ref)).map(c => (pinKey(c.a) === pinKey(ref) ? c.b : c.a));

export function evaluateStep(project: RobotProject, step: GuideStep, graph: CircuitGraph = buildGraph(project), matched?: Matched): StepState {
  if (step.kind === 'prop') {
    const part = resolvePart(project, step.part, matched);
    if (!part) return {state: 'blocked', hint: `Falta ${partName(step.part.def)}: arma primero esa pieza.`};
    const current = part.props?.[step.prop] ?? getDefinition(part.definitionId)?.props?.find(p => p.id === step.prop)?.default;
    const ok = step.atLeast && typeof step.value === 'number' ? Number(current) >= step.value : current === step.value;
    return ok ? {state: 'done'} : {state: 'todo'};
  }
  const r = resolveWire(project, step, matched);
  if ('missing' in r) return {state: 'blocked', hint: r.missing};
  const a = netOfPin(graph, r.from.instanceId, r.from.pinId), b = netOfPin(graph, r.to.instanceId, r.to.pinId);
  if (a && b && a === b) return {state: 'done'};
  // ¿Hay un cable que sale de uno de los dos pines hacia OTRO pin de la pieza de destino (o de origen)?
  const stray = direct(project, r.from).find(x => x.instanceId === r.to.instanceId && x.pinId !== r.to.pinId);
  if (stray) return {state: 'wrong', hint: `${pinLabel(r.fromPart, r.from.pinId)} está conectado a ${pinLabel(r.toPart, stray.pinId)}, pero este paso pide ${pinLabel(r.toPart, r.to.pinId)}. Cambia el extremo del cable.`};
  const stray2 = direct(project, r.to).find(x => x.instanceId === r.from.instanceId && x.pinId !== r.from.pinId);
  if (stray2) return {state: 'wrong', hint: `${pinLabel(r.toPart, r.to.pinId)} está conectado a ${pinLabel(r.fromPart, stray2.pinId)}, pero este paso pide ${pinLabel(r.fromPart, r.from.pinId)}. Cambia el extremo del cable.`};
  return {state: 'todo'};
}

export type GuideProgress = {states: StepState[]; done: number; total: number; current: number; complete: boolean};
export function guideProgress(project: RobotProject, guide: WiringGuideDef): GuideProgress {
  const graph = buildGraph(project), matched = matchReference(project, guide), states = guide.steps.map(s => evaluateStep(project, s, graph, matched));
  const done = states.filter(s => s.state === 'done').length;
  const current = states.findIndex(s => s.state !== 'done');
  return {states, done, total: guide.steps.length, current, complete: done === guide.steps.length};
}

/** Aplica el paso por el usuario («Hazlo por mí»): crea el cable o ajusta la propiedad. Devuelve el proyecto nuevo o el motivo por el que no se pudo. */
export function applyStep(project: RobotProject, step: GuideStep, matched?: Matched): CommandResult | CommandError {
  if (step.kind === 'prop') {
    const part = resolvePart(project, (step as PropStep).part, matched);
    return part ? {project: setPartProp(project, part.instanceId, step.prop, step.value), notes: []} : {error: 'Falta la pieza de este paso.'};
  }
  const r = resolveWire(project, step, matched);
  if ('missing' in r) return {error: r.missing};
  return connect(project, r.from, r.to, step.color);
}

/** Pines que se resaltan en el 3D para un paso (vacío si es un ajuste de propiedad o falta una pieza). */
export function stepPins(project: RobotProject, step: GuideStep, matched?: Matched): PinRef[] {
  if (step.kind !== 'wire') return [];
  const r = resolveWire(project, step, matched);
  return 'missing' in r ? [] : [r.from, r.to];
}
