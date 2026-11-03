// Robot de orugas con cabeza de radar y cara: dos orugas, un cuello con servo que gira una cabeza con pantalla OLED (la cara) y el sensor HC-SR04 (el radar).
// Se arma con los mismos comandos que cualquier robot (addPart + attach + connect).
// Orientación: el frente del robot es +z y su IZQUIERDA es +x (derecha = −x). El motor 1 (IN1/IN2, ENA) es el de la izquierda; con el cuello a más de 90° la cabeza mira a la izquierda.
import {addPart, attach, connect, ensureFirmware, renamePart, setFirmwareArtifact, setPartProp} from './commands.ts';
import {newRobotProject} from './defaults.ts';
import {hashSource} from '../mcu/compiler/state.ts';
import {PICK_HEX, PICK_SKETCH, TRACKED_HEX, TRACKED_SKETCH} from './trackedSketch.ts';
import type {Quat, RobotProject, Vec3} from './types.ts';

export const TEMPLATE_TRACKED = 'robot-oruga-radar';
export const TRACKED_TEMPLATE_INFO = {
  id: TEMPLATE_TRACKED, name: 'Robot de orugas con radar y cara', layout: '2 orugas · cuerpo · cuello con servo · cabeza con pantalla y radar · 2 brazos con pinza',
  summary: 'Un robot de pie, difícil y simpático: base de orugas, cuerpo con carcasa de vidrio, cabeza con pantalla (ojos y boca) y radar sobre un cuello con servo, y dos brazos completos (hombro, codo y pinza) que recogen objetos. Se arma, se cablea (44 cables) y se programa.',
} as const;

export const TEMPLATE_PICK = 'robot-oruga-recoger';
export const PICK_TEMPLATE_INFO = {
  id: TEMPLATE_PICK, name: 'Robot de orugas recoge cubos', layout: 'El mismo robot de orugas · 2 cubos sobre el suelo · programa que los agarra, levanta y suelta',
  summary: 'El robot de orugas con radar y cara, parado frente a dos cubos de 30 mm. Sus dos brazos estiran el antebrazo, cierran la pinza, levantan los cubos y los sueltan. Los cubos son objetos físicos: se empujan, se agarran y caen.',
} as const;

const fail = (message: string): never => { throw new Error(`Robot de orugas: ${message}`); };

export function buildTrackedRobot(now = new Date().toISOString(), pick = false): RobotProject {
  const info = pick ? PICK_TEMPLATE_INFO : TRACKED_TEMPLATE_INFO, sketch = pick ? PICK_SKETCH : TRACKED_SKETCH, hex = pick ? PICK_HEX : TRACKED_HEX;
  let p = newRobotProject(info.name, now);
  const put = (def: string, pos: Vec3 = [0, 0.5, 0], rot?: Quat) => { const r = addPart(p, def, pos, rot); if ('error' in r) fail(r.error); else p = r.project; return p.parts.at(-1)!.instanceId; };
  const join = (parent: string, anchor: string, child: string, childAnchor = 'base') => { const r = attach(p, {instanceId: parent, anchorId: anchor}, {instanceId: child, anchorId: childAnchor}); if ('error' in r) fail(r.error); else p = r.project; };
  const pin = (instanceId: string, pinId: string) => ({instanceId, pinId});
  const RED = '#d64545', BLACK = '#222222', BLUE = '#2a67a3', YELLOW = '#e0a52a', GREEN = '#2a8f4f', WHITE = '#e8e8e8';
  const wire = (a: ReturnType<typeof pin>, b: ReturnType<typeof pin>, color: string) => { const r = connect(p, a, b, color); if ('error' in r) fail(r.error); else p = r.project; };

  // Tracción: el motor 1 va a la izquierda (+x) y el motor 2 a la derecha (−x); cada uno lleva su rueda motriz y su banda.
  const chassis = put('chassis-2wd', [0, 0.0455, 0]); p = renamePart(setPartProp(p, chassis, 'color', 'oruga'), chassis, 'Base de oruga'); // acabado blanco de oruga: la base propia del robot
  const motorLeft = put('dc-motor-tt'), motorRight = put('dc-motor-tt'); join(chassis, 'motor-r', motorLeft); join(chassis, 'motor-l', motorRight);
  const sprocketLeft = put('track-sprocket'), sprocketRight = put('track-sprocket'); join(motorLeft, 'axle-r', sprocketLeft, 'hub'); join(motorRight, 'axle-l', sprocketRight, 'hub');
  const beltLeft = put('track-belt'), beltRight = put('track-belt'); join(motorLeft, 'track-r', beltLeft); join(motorRight, 'track-l', beltRight);
  // Electrónica y energía
  // La electrónica va como en los demás robots: Arduino, protoboard y driver sobre el chasis, y dos reguladores de 5 V (uno para la lógica y otro solo para los servos).
  const uno = put('arduino-uno-r3'); join(chassis, 'board-left', uno);
  const board = put('breadboard-400'); join(chassis, 'breadboard', board);
  const driver = put('l298n-module'); join(chassis, 'driver-rear', driver);
  const regulator = put('regulator-5v'); join(chassis, 'regulator', regulator);
  const servoRegulator = put('regulator-5v'); join(chassis, '4wd-regulator', servoRegulator);
  const battery = put('battery-holder-4aa'); join(chassis, 'battery', battery);
  const power = put('power-switch'); join(chassis, 'switch', power);
  // Armazón superior (torso abierto) sobre el chasis; arriba el cuello con la cabeza y a los lados los hombros con los brazos.
  const torso = put('robot-torso'); join(chassis, 'torso', torso);
  const servo = put('servo-sg90'); join(torso, 'neck', servo);                      // cuello
  const head = put('robot-head'); join(servo, 'horn', head);                        // cabeza en el cuerno del cuello
  const display = put('oled-ssd1306', [0, 0.5, 0], [Math.SQRT1_2, 0, 0, Math.SQRT1_2]); join(head, 'screen', display);
  const sensor = put('hc-sr04'); join(head, 'visor', sensor);
  // Dos brazos completos (hombro → brazo → codo → antebrazo → pinza), cada uno con tres servos. `side` = +1 izquierdo (+x), −1 derecho (−x).
  const arm = (side: 1 | -1) => {
    const name = side > 0 ? 'izquierdo' : 'derecho', up = Math.SQRT1_2;
    const shoulderRot: Quat = side > 0 ? [0, 0, -up, up] : [-up, up, 0, 0];          // eje del servo hacia el lado; el cuerno apunta hacia afuera
    const elbowRot: Quat = side > 0 ? [-up, up, 0, 0] : [0, 0, -up, up];             // el codo va al revés: el cuerno apunta hacia adentro y el cuerpo queda afuera del brazo
    const shoulder = put('servo-sg90', [0, 0.5, 0], shoulderRot); join(torso, side > 0 ? 'shoulder-l' : 'shoulder-r', shoulder);
    const upper = put('robot-arm'); join(shoulder, 'horn', upper);                                       // el brazo cuelga a lo largo del cuerpo (90° = colgando; menos de 90° lo adelanta)
    const elbow = put('servo-sg90', [0, 0.5, 0], elbowRot); join(upper, side > 0 ? 'elbow-l' : 'elbow-r', elbow);
    const forearm = put('robot-forearm'); join(elbow, 'horn', forearm);                                 // el antebrazo sigue al brazo hacia abajo (90° = recto; más de 90° lo dobla hacia adelante)
    const claw = put('robot-claw'); join(forearm, 'wrist', claw);
    const grip = put('servo-sg90'); join(claw, 'servo', grip);                                           // servo de la pinza encima de la carcasa
    for (const [id, label] of [[shoulder, `Servo hombro ${name}`], [upper, `Brazo ${name}`], [elbow, `Servo codo ${name}`], [forearm, `Antebrazo ${name}`], [claw, `Pinza ${name}`], [grip, `Servo pinza ${name}`]] as const) p = renamePart(p, id, label);
    return {shoulder, elbow, grip};
  };
  const left = arm(1), right = arm(-1);
  for (const id of [servo, left.shoulder, left.elbow, left.grip, right.shoulder, right.elbow, right.grip]) p = setPartProp(p, id, 'color', 'armadura'); // servos con carcasa blanca, como parte de la armadura
  p = renamePart(p, servo, 'Servo del cuello'); p = renamePart(p, regulator, 'Regulador 5 V · lógica'); p = renamePart(p, servoRegulator, 'Regulador 5 V · servos');

  p = setPartProp(p, battery, 'voltage', 9);
  p = setPartProp(setPartProp(setPartProp(p, driver, 'jumperENA', false), driver, 'jumperENB', false), driver, 'jumper5V', false);
  const METAL = '#aab3b9';
  // Alimentación: batería → interruptor → driver y los dos reguladores (los motores van directo al driver, nunca por la protoboard); masa común en la batería.
  wire(pin(battery, 'B+'), pin(power, 'IN'), RED); wire(pin(power, 'OUT'), pin(driver, '+12V'), RED);
  wire(pin(power, 'OUT'), pin(regulator, 'VIN'), RED); wire(pin(power, 'OUT'), pin(servoRegulator, 'VIN'), RED);
  wire(pin(battery, 'B-'), pin(driver, 'GND'), BLACK); wire(pin(battery, 'B-'), pin(regulator, 'GND'), BLACK); wire(pin(battery, 'B-'), pin(servoRegulator, 'GND'), BLACK);
  // Protoboard: rieles izquierdos = 5 V de la lógica (Arduino, driver, radar y pantalla); rieles derechos = 5 V solo para los servos. Las masas de los dos rieles se unen con un cable.
  wire(pin(regulator, '5V'), pin(board, 'L+1'), RED); wire(pin(regulator, 'GND.OUT'), pin(board, 'L-1'), BLACK);
  wire(pin(servoRegulator, '5V'), pin(board, 'R+1'), RED); wire(pin(servoRegulator, 'GND.OUT'), pin(board, 'R-1'), BLACK);
  wire(pin(board, 'R-25'), pin(board, 'L-25'), BLACK);
  wire(pin(board, 'L+10'), pin(uno, '5V'), RED); wire(pin(board, 'L-10'), pin(uno, 'GND.1'), BLACK);
  wire(pin(board, 'L+3'), pin(driver, '+5V'), RED);
  // Motores
  wire(pin(driver, 'OUT1'), pin(motorLeft, 'M+'), RED); wire(pin(driver, 'OUT2'), pin(motorLeft, 'M-'), BLACK);
  wire(pin(driver, 'OUT3'), pin(motorRight, 'M+'), RED); wire(pin(driver, 'OUT4'), pin(motorRight, 'M-'), BLACK);
  // Control del puente H
  for (const [d, i] of [['D4', 'IN1'], ['D7', 'IN2'], ['D8', 'IN3'], ['D12', 'IN4']]) wire(pin(uno, d), pin(driver, i), BLUE);
  wire(pin(uno, 'D5'), pin(driver, 'ENA'), YELLOW); wire(pin(uno, 'D6'), pin(driver, 'ENB'), YELLOW);
  // Radar (HC-SR04: TRIG D9, ECHO D10): alimentación por el riel y señales por las filas 5 y 7 de la protoboard
  wire(pin(sensor, 'VCC'), pin(board, 'L+5'), RED); wire(pin(sensor, 'GND'), pin(board, 'L-5'), BLACK);
  wire(pin(uno, 'D9'), pin(board, 'A5'), GREEN); wire(pin(board, 'E5'), pin(sensor, 'TRIG'), GREEN);
  wire(pin(uno, 'D10'), pin(board, 'A7'), GREEN); wire(pin(board, 'E7'), pin(sensor, 'ECHO'), GREEN);
  // Servos (alimentados por el regulador de servos): cuello D3; brazo izquierdo D11 D13 A1; brazo derecho D2 A0 A2. Cada señal pasa por una fila de la protoboard (J = servo, F = Arduino).
  const servoSignals = [[servo, 'D3', 10], [left.shoulder, 'D11', 12], [left.elbow, 'D13', 14], [left.grip, 'A1', 16], [right.shoulder, 'D2', 18], [right.elbow, 'A0', 20], [right.grip, 'A2', 22]] as const;
  servoSignals.forEach(([servoId, sig, row], i) => {
    wire(pin(servoId, 'VCC'), pin(board, `R+${3 + i}`), RED); wire(pin(servoId, 'GND'), pin(board, `R-${3 + i}`), BLACK);
    wire(pin(servoId, 'SIG'), pin(board, `J${row}`), YELLOW); wire(pin(board, `F${row}`), pin(uno, sig), YELLOW);
  });
  // Cara: pantalla OLED por I²C (SDA = A4 por la fila 24, SCL = A5 por la fila 26), alimentada por el riel de la lógica
  wire(pin(display, 'VCC'), pin(board, 'L+8'), RED); wire(pin(display, 'GND'), pin(board, 'L-8'), BLACK);
  wire(pin(display, 'SDA'), pin(board, 'J24'), WHITE); wire(pin(board, 'F24'), pin(uno, 'A4'), WHITE);
  wire(pin(display, 'SCL'), pin(board, 'J26'), GREEN); wire(pin(board, 'F26'), pin(uno, 'A5'), GREEN);

  p = ensureFirmware(p, uno); p = {...p, firmware: p.firmware.map(f => (f.targetInstanceId === uno ? {...f, source: sketch, updatedAt: now} : f))};
  p = setFirmwareArtifact(p, uno, {hex, origin: 'remote-compiler', sourceHash: hashSource(sketch), compiledAt: now});
  // Escenario: una caja al frente y una pared a la izquierda, así el robot tiene que elegir girar a la derecha. Son de 40 cm de alto: el radar va en la cabeza, a ~25 cm del suelo, y pasaría por encima de una caja más baja.
  const cubes = (): RobotProject['scene']['obstacles'] => [-1, 1].map(side => ({id: side > 0 ? 'cubo-izquierdo' : 'cubo-derecho', shape: 'box' as const, transform: {position: [0.146 * side, 0.015, 0.078] as Vec3, rotation: [0, 0, 0, 1] as Quat}, size: [0.03, 0.03, 0.03] as Vec3, movable: true, massKg: 0.04})); // quedan justo entre los dedos con hombro y codo a 28°
  p = {...p, scene: {...p.scene, obstacles: pick ? cubes() : [
    {id: 'caja-frente', shape: 'box', transform: {position: [0, 0.2, 0.95], rotation: [0, 0, 0, 1]}, size: [0.5, 0.4, 0.1]},
    {id: 'pared-izquierda', shape: 'box', transform: {position: [0.32, 0.2, 0.75], rotation: [0, 0, 0, 1]}, size: [0.08, 0.4, 0.7]},
  ]}};
  return {...p, name: info.name, workspace: {mode: 'build', camera: {position: [0.62, 0.42, 0.72], target: [0, 0.07, 0.04]}}};
}
