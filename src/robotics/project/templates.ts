// Proyectos de ejemplo. «Robot 2 ruedas · listo para usar» se arma SOLO con los comandos del proyecto (addPart, attach, connect), igual que lo haría
// una persona: así cumple las mismas reglas de uniones, pines y cables que cualquier robot construido a mano.
import {addPart, attach, connect, ensureFirmware, setFirmwareArtifact, setPartProp} from './commands.ts';
import {newRobotProject} from './defaults.ts';
import {hashSource} from '../mcu/compiler/state.ts';
import {AVOID_HEX, AVOID_SKETCH} from './avoidSketch.ts';
import type {RobotProject, Vec3} from './types.ts';

export const TEMPLATE_READY_ROBOT = 'robot-2-ruedas-listo';
export const TEMPLATES = [{id: TEMPLATE_READY_ROBOT, name: 'Robot 2 ruedas · listo para usar', summary: 'Chasis, motores, ruedas, Arduino UNO, driver L298N, sensor HC-SR04 y portapilas ya armados y cableados, con el programa «evitar obstáculos» compilado y una caja delante.'}] as const;

const fail = (msg: string): never => { throw new Error(`Plantilla inválida: ${msg}`); };

/** Robot de 2 ruedas completo, cableado y programado, con una caja de obstáculo a 0,75 m. Pulsar ▶ lo hace avanzar y esquivar la caja. */
export function buildReadyRobot(now = new Date().toISOString()): RobotProject {
  let p = newRobotProject('Robot 2 ruedas · listo para usar', now);
  const put = (def: string, pos: Vec3 = [0, 0.5, 0]) => { const r = addPart(p, def, pos); if ('error' in r) fail(r.error); else p = r.project; return p.parts.at(-1)!.instanceId; };
  const join = (parent: string, anchor: string, child: string, childAnchor: string) => { const r = attach(p, {instanceId: parent, anchorId: anchor}, {instanceId: child, anchorId: childAnchor}); if ('error' in r) fail(r.error); else p = r.project; };
  const chassis = put('chassis-2wd', [0, 0.0455, 0]);
  const motorL = put('dc-motor-tt', [-1, 0.5, 0]), motorR = put('dc-motor-tt', [1, 0.5, 0]);
  join(chassis, 'motor-l', motorL, 'base'); join(chassis, 'motor-r', motorR, 'base');
  const wheelL = put('wheel-65', [-1, 0.5, 1]), wheelR = put('wheel-65', [1, 0.5, 1]);
  join(motorL, 'axle-l', wheelL, 'hub'); join(motorR, 'axle-r', wheelR, 'hub');
  const caster = put('caster-ball', [0, 0.5, -1]); join(chassis, 'caster', caster, 'base');
  const uno = put('arduino-uno-r3'); join(chassis, 'board', uno, 'base');
  const driver = put('l298n-module'); join(chassis, 'driver', driver, 'base');
  const battery = put('battery-holder-4aa'); join(chassis, 'battery', battery, 'base');
  const bracket = put('sensor-bracket'); join(chassis, 'front', bracket, 'base');
  const sensor = put('hc-sr04'); join(bracket, 'sensor', sensor, 'base');
  // La placa se alimenta por VIN y necesita ≥ 7 V: el portapilas de este ejemplo es de 9 V (D-11: el voltaje real del kit sigue por confirmar).
  p = setPartProp(p, battery, 'voltage', 9);
  // Sin los puentes ENA/ENB: la velocidad la da el PWM de D5 y D6.
  p = setPartProp(setPartProp(p, driver, 'jumperENA', false), driver, 'jumperENB', false);
  const pin = (instanceId: string, pinId: string) => ({instanceId, pinId});
  const wire = (a: ReturnType<typeof pin>, b: ReturnType<typeof pin>, color: string) => { const r = connect(p, a, b, color); if ('error' in r) fail(r.error); else p = r.project; };
  const RED = '#d64545', BLACK = '#222222', BLUE = '#2a67a3', YELLOW = '#e0a52a', GREEN = '#2a8f4f';
  wire(pin(battery, 'B+'), pin(driver, '+12V'), RED); wire(pin(battery, 'B+'), pin(uno, 'VIN'), RED);
  wire(pin(battery, 'B-'), pin(driver, 'GND'), BLACK); wire(pin(driver, 'GND'), pin(uno, 'GND.1'), BLACK);
  for (const [d, i] of [['D4', 'IN1'], ['D7', 'IN2'], ['D8', 'IN3'], ['D12', 'IN4']]) wire(pin(uno, d), pin(driver, i), BLUE);
  wire(pin(uno, 'D5'), pin(driver, 'ENA'), YELLOW); wire(pin(uno, 'D6'), pin(driver, 'ENB'), YELLOW);
  wire(pin(driver, 'OUT1'), pin(motorL, 'M+'), RED); wire(pin(driver, 'OUT2'), pin(motorL, 'M-'), BLACK);
  wire(pin(driver, 'OUT3'), pin(motorR, 'M+'), RED); wire(pin(driver, 'OUT4'), pin(motorR, 'M-'), BLACK);
  wire(pin(sensor, 'VCC'), pin(uno, '5V'), RED); wire(pin(sensor, 'GND'), pin(uno, 'GND.2'), BLACK);
  wire(pin(sensor, 'TRIG'), pin(uno, 'D9'), GREEN); wire(pin(sensor, 'ECHO'), pin(uno, 'D10'), GREEN);
  p = ensureFirmware(p, uno);
  p = {...p, firmware: p.firmware.map(f => (f.targetInstanceId === uno ? {...f, source: AVOID_SKETCH, updatedAt: now} : f))};
  p = setFirmwareArtifact(p, uno, {hex: AVOID_HEX, origin: 'remote-compiler', sourceHash: hashSource(AVOID_SKETCH), compiledAt: now});
  p = {...p, scene: {...p.scene, obstacles: [{id: 'caja-ejemplo', shape: 'box', transform: {position: [0, 0.1, 0.75], rotation: [0, 0, 0, 1]}, size: [0.4, 0.2, 0.1]}]}, workspace: {mode: 'build'}};
  return p;
}

export const buildTemplate = (id: string, now?: string): RobotProject | null => (id === TEMPLATE_READY_ROBOT ? buildReadyRobot(now) : null);
