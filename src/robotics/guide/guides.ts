// Guías de cableado por robot. Cada paso es un dato: el porqué, los dos pines y el color del cable.
import {buildTemplate, TEMPLATES} from '../project/templates.ts';
import {guideFromProject} from './fromTemplate.ts';
import type {GuideStep, PartRef, WireStep, WiringGuideDef} from './types.ts';

const RED = {color: '#d64545', colorName: 'rojo'}, BLACK = {color: '#222222', colorName: 'negro'}, BLUE = {color: '#2a67a3', colorName: 'azul'}, YELLOW = {color: '#e0a52a', colorName: 'amarillo'}, GREEN = {color: '#2a8f4f', colorName: 'verde'};
const UNO: PartRef = {def: 'arduino-uno-r3'}, DRIVER: PartRef = {def: 'l298n-module'}, BATTERY: PartRef = {def: 'battery-holder-4aa'}, SENSOR: PartRef = {def: 'hc-sr04'};
const MOTOR_1: PartRef = {def: 'dc-motor-tt', n: 0}, MOTOR_2: PartRef = {def: 'dc-motor-tt', n: 1};

type WireSpec = Omit<WireStep, 'kind' | 'group'>;
const wire = (group: string, s: WireSpec): WireStep => ({kind: 'wire', group, ...s});

const G_AJUSTES = 'Ajustes antes de cablear', G_POTENCIA = 'Alimentación', G_MOTORES = 'Motores', G_CONTROL = 'Control del puente H', G_SENSOR = 'Sensor de distancia';

/** Robot de 2 ruedas que evita obstáculos (docs/robotica/GUIA_PRIMERA_PRACTICA.md): sin protoboard, cada módulo directo a la placa. */
export const ROBOT_2_RUEDAS: WiringGuideDef = {
  id: 'robot-2-ruedas-evita',
  name: 'Robot 2 ruedas · evita obstáculos',
  summary: '21 pasos: 3 ajustes y 18 cables (alimentación, motores, control del puente H y sensor HC-SR04).',
  steps: [
    {kind: 'prop', id: 'bateria-9v', group: G_AJUSTES, title: 'Sube la batería a 9 V', why: 'La placa Arduino se alimenta por VIN y necesita al menos 7 V. Con 4 pilas nuevas (6 V) no arrancaría. Cámbialo en Propiedades de la batería.', part: BATTERY, prop: 'voltage', value: 9, atLeast: true},
    {kind: 'prop', id: 'quitar-ena', group: G_AJUSTES, title: 'Quita el puente ENA del L298N', why: 'Con el puente puesto, el motor A siempre va a toda velocidad. Sin él, el pin ENA recibe PWM y podrás controlar la velocidad con analogWrite.', part: DRIVER, prop: 'jumperENA', value: false},
    {kind: 'prop', id: 'quitar-enb', group: G_AJUSTES, title: 'Quita el puente ENB del L298N', why: 'Igual que ENA, pero para el motor B.', part: DRIVER, prop: 'jumperENB', value: false},

    wire(G_POTENCIA, {id: 'bat-mas-driver', title: 'Batería + → driver +12V', why: 'Los motores se alimentan directamente de la batería a través del driver: es la corriente grande del robot.', from: {part: BATTERY, pin: 'B+'}, to: {part: DRIVER, pin: '+12V'}, ...RED}),
    wire(G_POTENCIA, {id: 'bat-mas-vin', title: 'Batería + → Arduino VIN', why: 'La placa también toma energía de la batería por VIN (entrada de 7 a 12 V) y la regula a 5 V para ella misma.', from: {part: BATTERY, pin: 'B+'}, to: {part: UNO, pin: 'VIN'}, ...RED}),
    wire(G_POTENCIA, {id: 'bat-menos-driver', title: 'Batería − → driver GND', why: 'Cerrar el circuito de los motores: el retorno de la corriente va al polo negativo.', from: {part: BATTERY, pin: 'B-'}, to: {part: DRIVER, pin: 'GND'}, ...BLACK}),
    wire(G_POTENCIA, {id: 'gnd-comun', title: 'Driver GND → Arduino GND', why: 'Masa común: sin ella las señales de la placa no tienen referencia y el driver no entiende los niveles ALTO/BAJO.', from: {part: DRIVER, pin: 'GND'}, to: {part: UNO, pin: 'GND.1'}, ...BLACK}),

    wire(G_MOTORES, {id: 'out1', title: 'OUT1 del driver → motor 1 (M+)', why: 'Cada motor va a un par de salidas del puente H. Si luego gira al revés, basta con invertir estos dos cables.', from: {part: DRIVER, pin: 'OUT1'}, to: {part: MOTOR_1, pin: 'M+'}, ...RED}),
    wire(G_MOTORES, {id: 'out2', title: 'OUT2 del driver → motor 1 (M−)', why: 'Segundo cable del motor 1.', from: {part: DRIVER, pin: 'OUT2'}, to: {part: MOTOR_1, pin: 'M-'}, ...BLACK}),
    wire(G_MOTORES, {id: 'out3', title: 'OUT3 del driver → motor 2 (M+)', why: 'El canal B del driver mueve el segundo motor.', from: {part: DRIVER, pin: 'OUT3'}, to: {part: MOTOR_2, pin: 'M+'}, ...RED}),
    wire(G_MOTORES, {id: 'out4', title: 'OUT4 del driver → motor 2 (M−)', why: 'Segundo cable del motor 2.', from: {part: DRIVER, pin: 'OUT4'}, to: {part: MOTOR_2, pin: 'M-'}, ...BLACK}),

    wire(G_CONTROL, {id: 'd4-in1', title: 'Arduino D4 → driver IN1', why: 'IN1 e IN2 deciden el sentido del motor A: uno en ALTO y el otro en BAJO = adelante; al revés = atrás.', from: {part: UNO, pin: 'D4'}, to: {part: DRIVER, pin: 'IN1'}, ...BLUE}),
    wire(G_CONTROL, {id: 'd7-in2', title: 'Arduino D7 → driver IN2', why: 'Pareja de IN1 para el motor A.', from: {part: UNO, pin: 'D7'}, to: {part: DRIVER, pin: 'IN2'}, ...BLUE}),
    wire(G_CONTROL, {id: 'd8-in3', title: 'Arduino D8 → driver IN3', why: 'IN3 e IN4 deciden el sentido del motor B.', from: {part: UNO, pin: 'D8'}, to: {part: DRIVER, pin: 'IN3'}, ...BLUE}),
    wire(G_CONTROL, {id: 'd12-in4', title: 'Arduino D12 → driver IN4', why: 'Pareja de IN3 para el motor B.', from: {part: UNO, pin: 'D12'}, to: {part: DRIVER, pin: 'IN4'}, ...BLUE}),
    wire(G_CONTROL, {id: 'd5-ena', title: 'Arduino D5 → driver ENA', why: 'ENA habilita el canal A y, con PWM (analogWrite), fija su velocidad. D5 es un pin PWM.', from: {part: UNO, pin: 'D5'}, to: {part: DRIVER, pin: 'ENA'}, ...YELLOW}),
    wire(G_CONTROL, {id: 'd6-enb', title: 'Arduino D6 → driver ENB', why: 'ENB hace lo mismo para el canal B. D6 también es PWM.', from: {part: UNO, pin: 'D6'}, to: {part: DRIVER, pin: 'ENB'}, ...YELLOW}),

    wire(G_SENSOR, {id: 'sensor-vcc', title: 'HC-SR04 VCC → Arduino 5V', why: 'El sensor necesita 5 V para emitir el ultrasonido.', from: {part: SENSOR, pin: 'VCC'}, to: {part: UNO, pin: '5V'}, ...RED}),
    wire(G_SENSOR, {id: 'sensor-gnd', title: 'HC-SR04 GND → Arduino GND', why: 'Masa común también para el sensor.', from: {part: SENSOR, pin: 'GND'}, to: {part: UNO, pin: 'GND.2'}, ...BLACK}),
    wire(G_SENSOR, {id: 'sensor-trig', title: 'HC-SR04 TRIG → Arduino D9', why: 'TRIG es la orden de medir: el programa lo pone en ALTO 10 µs para lanzar el pulso.', from: {part: SENSOR, pin: 'TRIG'}, to: {part: UNO, pin: 'D9'}, ...GREEN}),
    wire(G_SENSOR, {id: 'sensor-echo', title: 'HC-SR04 ECHO → Arduino D10', why: 'ECHO se pone en ALTO mientras el sonido viaja y vuelve: el programa mide ese tiempo con pulseIn para calcular la distancia.', from: {part: SENSOR, pin: 'ECHO'}, to: {part: UNO, pin: 'D10'}, ...GREEN}),
  ] satisfies GuideStep[],
};

/** Guías a mano (con textos propios). El resto de los robots se generan desde su plantilla. */
export const CURATED_GUIDES: readonly WiringGuideDef[] = [ROBOT_2_RUEDAS];

const generated = new Map<string, WiringGuideDef | null>();
/** Guía de cableado generada desde la plantilla `templateId` (o null si no tiene cables). */
export function templateGuide(templateId: string): WiringGuideDef | null {
  if (!generated.has(templateId)) {
    const template = TEMPLATES.find(t => t.id === templateId), reference = template && buildTemplate(templateId);
    generated.set(templateId, template && reference ? guideFromProject(`plantilla:${templateId}`, template.name, reference) : null);
  }
  return generated.get(templateId) ?? null;
}
/** Todas las guías disponibles: las escritas a mano y una por cada plantilla con cableado. */
export function allWiringGuides(): WiringGuideDef[] {
  return [...CURATED_GUIDES, ...TEMPLATES.map(t => templateGuide(t.id)).filter((g): g is WiringGuideDef => !!g)];
}
export const getWiringGuide = (id: string | undefined): WiringGuideDef | undefined => {
  if (!id) return undefined;
  if (id.startsWith('plantilla:')) return templateGuide(id.slice('plantilla:'.length)) ?? undefined;
  return CURATED_GUIDES.find(g => g.id === id);
};

/** Detecta la referencia por el armado elegido o por su inventario, nunca por el número de ruedas solamente. */
export function detectWiringGuide(project: import('../project/types.ts').RobotProject): WiringGuideDef | undefined {
 const inventory=(parts:import('../project/types.ts').PartInstance[])=>{const counts=new Map<string,number>();for(const p of parts)counts.set(p.definitionId,(counts.get(p.definitionId)??0)+1);return counts;};
 const actual=inventory(project.parts);
 if(!actual.size)return undefined;
 const candidates=allWiringGuides().filter(g=>g.reference).map(guide=>{const counts=inventory(guide.reference!.parts),keys=new Set([...actual.keys(),...counts.keys()]);let common=0,total=0,missing=0;
 for(const k of keys){const a=actual.get(k)??0,b=counts.get(k)??0;common+=Math.min(a,b);total+=Math.max(a,b);missing+=Math.max(0,b-a);}
 return {guide,score:common/total,missing};}).sort((a,b)=>b.score-a.score||a.missing-b.missing);
 const chosen=project.workspace.assemblyTemplate&&candidates.find(c=>c.guide.id===`plantilla:${project.workspace.assemblyTemplate}`);
 if(chosen&&project.parts.some(p=>p.definitionId===chosen.guide.reference?.parts[0]?.definitionId))return chosen.guide;
 if(actual.has('arduino-uno-r3')&&actual.has('l298n-module')&&actual.has('hc-sr04')&&!actual.has('breadboard-400')&&(actual.get('dc-motor-tt')??0)===2)return ROBOT_2_RUEDAS;
 const best=candidates[0],second=candidates[1];
 if(best&&best.score>=.75&&(!second||best.score-second.score>=.025))return best.guide;
 // La guía sencilla sin protoboard sigue siendo válida para ese montaje concreto.

 return undefined;
}
