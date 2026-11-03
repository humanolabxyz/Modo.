// Armado por pasos: convierte la guía fantasma (pieza siguiente) en una lista de pasos explicados. Puro; usa el emparejamiento de `assemblyGuide`.
import {getDefinition} from '../catalog/index.ts';
import {addPart, attach, parentAttachment, type CommandError, type CommandResult} from '../project/commands.ts';
import type {PartInstance, RobotProject} from '../project/types.ts';
import {assemblyGuide} from './assemblyGuide.ts';

type Guide = ReturnType<typeof assemblyGuide>;

/** Qué hace cada pieza en el robot, en una frase (si falta, se usa el resumen del catálogo). */
const ROLE: Record<string, string> = {
  'chassis-2wd': 'La base del robot: todo lo demás se fija sobre el chasis, así que va primero.',
  'dc-motor-tt': 'Convierte la electricidad en giro. Va en una ranura lateral del chasis; el eje queda hacia afuera para poner la rueda.',
  'wheel-65': 'Se encaja en el eje del motor: es lo que toca el suelo y empuja al robot.',
  'caster-ball': 'La rueda loca: una bolita que apoya el robot sin traccionar, para que no se incline.',
  'arduino-uno-r3': 'El cerebro: corre tu programa y manda las señales a los demás módulos.',
  'l298n-module': 'El driver (puente H): recibe las señales débiles del Arduino y entrega la corriente que necesitan los motores.',
  'battery-holder-4aa': 'La energía del robot: cuatro pilas AA que alimentan motores y placa.',
  'sensor-bracket': 'Una escuadra para sostener el sensor mirando hacia adelante.',
  'hc-sr04': 'El sensor de distancia: emite ultrasonido y mide cuánto tarda en volver el eco.',
  'breadboard-400': 'La protoboard reparte la alimentación y permite conectar varias cosas sin soldar.',
  'regulator-5v': 'Baja la tensión de la batería a 5 V estables para la lógica.',
  'power-switch': 'El interruptor general: corta o deja pasar la energía del robot.',
  'tcrt5000-module': 'Sensor de línea: mira el suelo y distingue claro de oscuro con luz infrarroja.',
  'ir-double-bracket': 'Soporte para dos sensores de línea bajo el frente del chasis.',
  'bracket-generic': 'Un bloque para elevar o fijar otras piezas.',
  'track-sprocket': 'La rueda motriz dentada: va en el eje del motor y es la que empuja al robot. La banda de la oruga se apoya sobre ella.',
  'track-belt': 'La banda de la oruga: rodea la rueda motriz. En el simulador desliza sobre el suelo; el robot avanza por la rueda motriz.',
  'servo-sg90': 'El servo del cuello: gira a un ángulo exacto (0° a 180°). Va en la parte delantera del chasis con el cuerno justo en el centro del robot.',
  'robot-head': 'La cabeza: se fija al cuerno del servo y gira con él. Al frente lleva la pantalla (la cara) y arriba el radar.',
  'oled-ssd1306': 'La pantalla de la cara: una OLED de 128 × 64 píxeles por I²C. Va al frente de la cabeza, con los pines hacia arriba.',
  'robot-torso': 'El cuerpo humanoide del robot, con armadura por capas: la electrónica va adentro, protegida por un vidrio ahumado y por una coraza (láminas en el abdomen con ranuras para ver el cableado, placas con ventilas en los costados y en la espalda). Arriba, un pecho en V con pectorales y una barra de hombros con hombreras que cubren los servos, más ancha que las orugas para que los brazos cuelguen por fuera.',
  'robot-arm': 'El brazo: cuelga del cuerno del servo del hombro, a un lado del cuerpo y por fuera de las orugas (con el servo a 90° cuelga recto; con menos de 90° se adelanta). Al final lleva el codo.',
  'robot-forearm': 'El antebrazo: se fija al cuerno del servo del codo y sigue al brazo hacia abajo (con el servo a 90° queda recto; con más de 90° se dobla hacia adelante). En la punta lleva la muñeca con la pinza.',
  'robot-claw': 'La pinza: dos dedos que corren sobre un riel. Va en la muñeca del antebrazo, con los dedos hacia el suelo, y se abre y se cierra con su propio servo.',
};
/** El mismo servo SG90 hace trabajos distintos según dónde va; el proyecto de referencia le pone nombre. */
const SERVO_ROLE: [RegExp, string][] = [
  [/hombro/i, 'El servo del hombro: sube y baja todo el brazo. Va en el costado del cuerpo con el cuerno hacia afuera.'],
  [/codo/i, 'El servo del codo: estira o recoge el antebrazo. Va en el extremo del brazo, con el cuerno hacia adentro.'],
  [/pinza/i, 'El servo de la pinza: junta o separa los dedos. Va encima de la carcasa de la pinza.'],
];
const roleOf = (part: PartInstance): string | undefined => (part.definitionId === 'servo-sg90' ? SERVO_ROLE.find(([re]) => re.test(part.label))?.[1] : undefined) ?? ROLE[part.definitionId];

export type AssemblyStep = {
  index: number;
  part: PartInstance;          // la pieza de referencia (posición ya movida a la del usuario)
  title: string;
  where: string;               // dónde encaja
  why: string;
  done: boolean;
  current: boolean;
  group: string;
};

const groupOf = (part: PartInstance): string => {
  const def = part.definitionId;
  if (['robot-arm', 'robot-forearm', 'robot-claw'].includes(def) || (def === 'servo-sg90' && /hombro|codo|pinza/i.test(part.label))) return 'Brazos y pinzas';
  return def === 'robot-torso' ? 'Cuerpo' : groupByDef(def);
};
const groupByDef = (def: string): string =>
  def === 'chassis-2wd' ? 'Base' : ['dc-motor-tt', 'wheel-65', 'caster-ball', 'track-sprocket', 'track-belt'].includes(def) ? 'Tracción' : ['servo-sg90', 'robot-head', 'oled-ssd1306'].includes(def) ? 'Cuello y cabeza' : ['arduino-uno-r3', 'breadboard-400'].includes(def) ? 'Control'
    : ['l298n-module', 'battery-holder-4aa', 'regulator-5v', 'power-switch'].includes(def) ? 'Potencia' : ['hc-sr04', 'sensor-bracket', 'tcrt5000-module', 'ir-double-bracket'].includes(def) ? 'Sensores' : 'Otras piezas';

export function assemblySteps(project: RobotProject, reference: RobotProject, guide: Guide = assemblyGuide(project, reference)): {steps: AssemblyStep[]; done: number; total: number; current: AssemblyStep | null} {
  const nameOf = (id: string) => reference.parts.find(p => p.instanceId === id)?.label ?? '';
  const steps = guide.targets.map((part, index): AssemblyStep => {
    const def = getDefinition(part.definitionId), att = parentAttachment(reference, part.instanceId);
    const anchor = att && getDefinition(reference.parts.find(p => p.instanceId === att.parent.instanceId)?.definitionId ?? '')?.anchors.find(a => a.id === att.parent.anchorId);
    return {
      index, part, title: `Coloca: ${part.label}`, group: groupOf(part),
      where: att ? `Encaja en ${nameOf(att.parent.instanceId)}${anchor ? ` · ${anchor.label}` : ''}` : 'Es la pieza base: colócala primero.',
      why: roleOf(part) ?? def?.summary ?? 'Pieza del robot.',
      done: guide.matched.has(part.instanceId), current: guide.next?.instanceId === part.instanceId,
    };
  });
  return {steps, done: steps.filter(s => s.done).length, total: steps.length, current: steps.find(s => s.current) ?? null};
}

/** Pone la pieza siguiente ya encajada donde dice la referencia (en vez de dejarla suelta para arrastrar). */
export function placeNextPart(project: RobotProject, reference: RobotProject, guide: Guide = assemblyGuide(project, reference)): (CommandResult & {placedId: string}) | CommandError {
  const target = guide.next;
  if (!target) return {error: 'El armado de referencia ya está completo.'};
  const att = parentAttachment(reference, target.instanceId), parentId = att ? guide.matched.get(att.parent.instanceId) : undefined;
  if (att && !parentId) return {error: 'Falta la pieza donde encaja. Coloca primero los pasos anteriores.'};
  const added = addPart(project, target.definitionId, target.transform.position, target.transform.rotation);
  if ('error' in added) return added;
  const part = added.project.parts.at(-1)!;
  let next: RobotProject = {...added.project, parts: added.project.parts.map(p => (p.instanceId === part.instanceId ? {...p, props: target.props} : p))};
  if (att && parentId) {
    const joined = attach(next, {instanceId: parentId, anchorId: att.parent.anchorId}, {instanceId: part.instanceId, anchorId: att.child.anchorId}, att.kind);
    if ('error' in joined) return joined;
    return {...joined, placedId: part.instanceId};
  }
  return {project: next, notes: [], placedId: part.instanceId};
}
