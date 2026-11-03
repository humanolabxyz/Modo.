import type {AnchorDefinition, ComponentDefinition, PinDefinition} from './types.ts';
import type {Vec3} from '../project/types.ts';
import {COMBAT_DEFINITIONS} from './combat.ts';

const mm = (v: number) => v / 1000;
const pin = (id: string, label: string, position: Vec3, role: PinDefinition['role'], extra: Partial<PinDefinition> = {}): PinDefinition => ({id, label, position, role, ...extra});
const anchor = (id: string, label: string, position: Vec3, normal: Vec3, tag: string, accepts: string[] = []): AnchorDefinition => ({id, label, position, normal, tag, accepts});
const UP: Vec3 = [0, 1, 0], DOWN: Vec3 = [0, -1, 0];

// ───── Arduino UNO R3: 68,6 × 53,4 mm (ficha oficial). Cabecera digital en el borde +X, cabecera de potencia/analógica en el borde −X.
const PWM_PINS = new Set([3, 5, 6, 9, 10, 11]);
const unoPins: PinDefinition[] = [];
const pitch = mm(2.54), hx = mm(23.5);
// D0–D7 y D8–D13 + GND + AREF (la cabecera real tiene un hueco entre D7 y D8)
const digitalZ = (i: number) => mm(31.5) - i * pitch - (i >= 8 ? mm(4) : 0);
for (let n = 0; n <= 13; n++) unoPins.push(pin(`D${n}`, `D${n}`, [hx, mm(7.5), digitalZ(n)], PWM_PINS.has(n) ? 'pwm' : 'digital', {electrical: {vMax: 5, iMax: 0.02}}));
unoPins.push(pin('GND.3', 'GND', [hx, mm(7.5), digitalZ(14)], 'ground', {internalNet: 'GND'}));
['A0', 'A1', 'A2', 'A3', 'A4', 'A5'].forEach((id, i) => unoPins.push(pin(id, id, [-hx, mm(7.5), mm(10) - i * pitch], 'analog', {electrical: {vMax: 5}})));
unoPins.push(pin('VIN', 'VIN', [-hx, mm(7.5), mm(10) + 1 * pitch], 'power-in', {electrical: {vMax: 12}}));
unoPins.push(pin('GND.1', 'GND', [-hx, mm(7.5), mm(10) + 2 * pitch], 'ground', {internalNet: 'GND'}));
unoPins.push(pin('GND.2', 'GND', [-hx, mm(7.5), mm(10) + 3 * pitch], 'ground', {internalNet: 'GND'}));
unoPins.push(pin('5V', '5V', [-hx, mm(7.5), mm(10) + 4 * pitch], 'power-out', {electrical: {vMax: 5, iMax: 0.5}}));
unoPins.push(pin('3V3', '3,3V', [-hx, mm(7.5), mm(10) + 5 * pitch], 'power-out', {electrical: {vMax: 3.3, iMax: 0.15}}));

const arduino: ComponentDefinition = {
  id: 'arduino-uno-r3', name: 'Arduino UNO R3', category: 'control', dimensions: [mm(53.4), mm(15), mm(68.6)], dimensionsSource: 'datasheet', massKg: 0.025,
  pins: unoPins, anchors: [anchor('base', 'Base', [0, -mm(7.5), 0], DOWN, 'board-mount')],
  props: [{id: 'usb', label: 'Alimentada por USB (virtual, 5 V)', type: 'boolean', default: false}],
  scalable: false, model: 'procedural',
  summary: 'Placa de control con el microcontrolador ATmega328P.', keywords: ['arduino', 'uno', 'placa', 'microcontrolador', 'atmega'],
};

// ───── Módulo L298N (puente H doble). 43 × 43 × 27 mm es la medida habitual del módulo rojo: aproximada, a confirmar con el kit.
const l298n: ComponentDefinition = {
  id: 'l298n-module', name: 'Driver L298N', category: 'driver', dimensions: [mm(43), mm(27), mm(43)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [
    pin('OUT1', 'OUT1', [-mm(21.5), mm(8), mm(8)], 'motor'), pin('OUT2', 'OUT2', [-mm(21.5), mm(8), mm(2)], 'motor'),
    pin('OUT3', 'OUT3', [mm(21.5), mm(8), mm(8)], 'motor'), pin('OUT4', 'OUT4', [mm(21.5), mm(8), mm(2)], 'motor'),
    pin('+12V', '+12V', [-mm(5), mm(8), -mm(21.5)], 'power-in', {electrical: {vMax: 35, iMax: 2}}), pin('GND', 'GND', [0, mm(8), -mm(21.5)], 'ground'),
    pin('+5V', '+5V', [mm(5), mm(8), -mm(21.5)], 'power-out', {electrical: {vMax: 5, iMax: 0.5}}),
    pin('ENA', 'ENA', [-mm(10), mm(8), mm(21.5)], 'pwm'), pin('IN1', 'IN1', [-mm(6), mm(8), mm(21.5)], 'digital'), pin('IN2', 'IN2', [-mm(2), mm(8), mm(21.5)], 'digital'),
    pin('IN3', 'IN3', [mm(2), mm(8), mm(21.5)], 'digital'), pin('IN4', 'IN4', [mm(6), mm(8), mm(21.5)], 'digital'), pin('ENB', 'ENB', [mm(10), mm(8), mm(21.5)], 'pwm'),
  ],
  anchors: [anchor('base', 'Base', [0, -mm(13.5), 0], DOWN, 'driver-mount')],
  props: [
    {id: 'jumperENA', label: 'Puente ENA (canal A siempre activo)', type: 'boolean', default: true},
    {id: 'jumperENB', label: 'Puente ENB (canal B siempre activo)', type: 'boolean', default: true},
    {id: 'jumper5V', label: 'Puente regulador 5 V', type: 'boolean', default: true},
  ],
  scalable: false, model: 'procedural', summary: 'Puente H para dos motores DC; los puentes de ENA/ENB y 5 V son ajustables.', keywords: ['l298n', 'driver', 'puente h', 'motor', 'controlador'],
};

// ───── Sensor ultrasónico HC-SR04: 45 × 20 × 15 mm (ficha).
const hcsr04: ComponentDefinition = {
  id: 'hc-sr04', name: 'Sensor HC-SR04', category: 'sensor', dimensions: [mm(45), mm(20), mm(15)], dimensionsSource: 'datasheet', massKg: 0.009,
  pins: [pin('VCC', 'VCC', [-mm(3.8), -mm(7), -mm(7.5)], 'power-in', {electrical: {vMax: 5.5}}), pin('TRIG', 'TRIG', [-mm(1.3), -mm(7), -mm(7.5)], 'digital'), pin('ECHO', 'ECHO', [mm(1.3), -mm(7), -mm(7.5)], 'digital'), pin('GND', 'GND', [mm(3.8), -mm(7), -mm(7.5)], 'ground')],
  anchors: [anchor('base', 'Base', [0, -mm(10), 0], DOWN, 'sensor-mount')],
  // Banco de pruebas controlado (etapa 4): la física con obstáculos llega en la etapa 5.
  props: [{id: 'testDistance', label: 'Distancia de prueba (m) — banco controlado', type: 'number', min: 0.02, max: 4, default: 0.3}],
  scalable: false, model: 'procedural', summary: 'Mide distancia con ultrasonido (2–400 cm).', keywords: ['hc-sr04', 'ultrasonico', 'ultrasonido', 'distancia', 'sensor', 'trig', 'echo'],
};

// ───── Motor DC con reductora tipo TT: ≈ 70 × 22 × 18 mm, eje doble (aproximado).
const motor: ComponentDefinition = {
  id: 'dc-motor-tt', name: 'Motor DC TT', category: 'actuator', dimensions: [mm(70), mm(22), mm(18)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [pin('M+', 'M+', [-mm(30), mm(4), -mm(9)], 'motor'), pin('M-', 'M−', [-mm(30), -mm(4), -mm(9)], 'motor')],
  anchors: [
    anchor('base', 'Base', [0, mm(11), 0], UP, 'motor-mount'),
    anchor('axle-r', 'Eje derecho', [mm(42), 0, 0], [1, 0, 0], 'axle', ['wheel-hub']),
    anchor('axle-l', 'Eje izquierdo', [-mm(42), 0, 0], [-1, 0, 0], 'axle', ['wheel-hub']),
    anchor('track-r', 'Oruga derecha', [mm(42), 0, 0], [1, 0, 0], 'slot-track-r', ['track-mount']),
    anchor('track-l', 'Oruga izquierda', [-mm(42), 0, 0], [-1, 0, 0], 'slot-track-l', ['track-mount']),
  ],
  scalable: false, model: 'procedural', summary: 'Motor con reductora y doble eje para las ruedas.', keywords: ['motor', 'dc', 'tt', 'reductora', 'eje'],
};

const wheel: ComponentDefinition = {
  id: 'wheel-65', name: 'Rueda 65 mm', category: 'structure', dimensions: [mm(26), mm(65), mm(65)], dimensionsSource: 'approximate', massKg: 0.03,
  pins: [], anchors: [anchor('hub', 'Cubo', [0, 0, 0], [1, 0, 0], 'wheel-hub')],
  scalable: false, model: 'procedural', summary: 'Rueda de goma de 65 mm para el eje del motor.', keywords: ['rueda', 'llanta', 'goma'],
};

const caster: ComponentDefinition = {
  id: 'caster-ball', name: 'Rueda loca', category: 'structure', dimensions: [mm(25), mm(43), mm(25)], dimensionsSource: 'approximate', massKg: 0.01,
  pins: [], anchors: [anchor('base', 'Base', [0, mm(21.5), 0], UP, 'caster-mount')],
  scalable: false, model: 'procedural', summary: 'Esfera de apoyo libre, sin motor (con separador: su base toca el suelo con las ruedas de 65 mm).', keywords: ['rueda loca', 'caster', 'bola', 'apoyo'],
};

// ───── Chasis acrílico 2WD (aprox. 140 × 210 mm, 4 mm).
const chassis: ComponentDefinition = {
  id: 'chassis-2wd', name: 'Chasis 2WD', category: 'structure', dimensions: [mm(140), mm(4), mm(210)], dimensionsSource: 'approximate', massKg: 0.12,
  pins: [],
  props: [{id: 'color', label: 'Acabado: placa acrílica azul o base blanca de oruga', type: 'enum', options: ['azul', 'oruga'], default: 'azul'}],
  anchors: [
    anchor('combat-front', 'Pala, cuña o defensa frontal', [0, 0, mm(105)], [0, 0, 1], 'slot-combat', ['combat-mount']),
    anchor('combat-sensor', 'Sensor elevado para sumo', [0, mm(30), mm(45)], UP, 'slot-combat-sensor', ['bracket-mount']),
    anchor('combat-ir', 'Sensores de borde para pala 4WD', [0, -mm(2), mm(95)], DOWN, 'slot-combat-ir', ['line-support']),
    anchor('motor-l', 'Motor izquierdo', [-mm(62), -mm(2), -mm(20)], DOWN, 'slot-motor', ['motor-mount']), anchor('motor-r', 'Motor derecho', [mm(62), -mm(2), -mm(20)], DOWN, 'slot-motor', ['motor-mount']),
    anchor('caster', 'Rueda loca', [0, -mm(2), mm(85)], DOWN, 'slot-caster', ['caster-mount']),
    anchor('board-left', 'Arduino lateral', [mm(-33), mm(2), mm(15)], UP, 'slot-board-left', ['board-mount']),
    anchor('breadboard', 'Protoboard', [mm(32), mm(2), mm(10)], UP, 'slot-breadboard', ['board-mount']),
    anchor('driver-rear', 'Driver posterior', [mm(-10), mm(2), mm(-70)], UP, 'slot-driver-rear', ['driver-mount']),
    anchor('regulator', 'Regulador', [mm(44), mm(2), mm(-70)], UP, 'slot-regulator', ['regulator-mount']),
    anchor('switch', 'Interruptor', [mm(-48), mm(2), mm(-75)], UP, 'slot-switch', ['switch-mount']),
    anchor('line-sensors', 'Soporte infrarrojos', [0, -mm(2), mm(80)], DOWN, 'slot-line-support', ['line-support']),
    anchor('neck', 'Cuello (servo)', [-mm(5.6), mm(2), mm(95)], UP, 'slot-neck', ['sensor-mount']), // el cuerno del servo queda justo en el eje central del robot
    anchor('torso', 'Armazón superior (torso)', [0, mm(2), -mm(5)], UP, 'slot-torso', ['torso-mount']),
    // Alternative mechanical layouts reuse the same parts; original anchors stay available.
    anchor('4wd-motor-rl', 'Motor trasero izquierdo', [mm(-62), mm(-2), mm(-65)], DOWN, 'slot-4wd-motor-rl', ['motor-mount']),
    anchor('4wd-motor-rr', 'Motor trasero derecho', [mm(62), mm(-2), mm(-65)], DOWN, 'slot-4wd-motor-rr', ['motor-mount']),
    anchor('4wd-motor-fl', 'Motor delantero izquierdo', [mm(-62), mm(-2), mm(65)], DOWN, 'slot-4wd-motor-fl', ['motor-mount']),
    anchor('4wd-motor-fr', 'Motor delantero derecho', [mm(62), mm(-2), mm(65)], DOWN, 'slot-4wd-motor-fr', ['motor-mount']),
    anchor('4wd-driver-a', 'Driver posterior izquierdo', [mm(-30), mm(2), mm(-75)], UP, 'slot-4wd-driver-a', ['driver-mount']),
    anchor('4wd-driver-b', 'Driver posterior derecho', [mm(30), mm(2), mm(-75)], UP, 'slot-4wd-driver-b', ['driver-mount']),
    anchor('4wd-regulator', 'Regulador delantero', [mm(44), mm(2), mm(75)], UP, 'slot-4wd-regulator', ['regulator-mount']),
    anchor('4wd-switch', 'Interruptor delantero', [mm(-48), mm(2), mm(75)], UP, 'slot-4wd-switch', ['switch-mount']),
    anchor('4wd-battery', 'Bateria central inferior', [0, mm(-2), 0], DOWN, 'slot-4wd-battery', ['battery-mount']),
    anchor('tower-post-fl', 'Columna delantera izquierda', [mm(-45), mm(2), mm(75)], UP, 'slot-tower-post-fl', ['bracket-mount']),
    anchor('tower-post-fr', 'Columna delantera derecha', [mm(45), mm(2), mm(75)], UP, 'slot-tower-post-fr', ['bracket-mount']),
    anchor('tower-post-rl', 'Columna trasera izquierda', [mm(-45), mm(2), mm(-75)], UP, 'slot-tower-post-rl', ['bracket-mount']),
    anchor('tower-post-rr', 'Columna trasera derecha', [mm(45), mm(2), mm(-75)], UP, 'slot-tower-post-rr', ['bracket-mount']),
    anchor('tower-driver', 'Driver del piso inferior', [0, mm(2), mm(-55)], UP, 'slot-tower-driver', ['driver-mount']),
    anchor('tower-regulator', 'Regulador del piso inferior', [mm(45), mm(2), mm(-50)], UP, 'slot-tower-regulator', ['regulator-mount']),
    anchor('tower-switch', 'Interruptor del piso inferior', [mm(-48), mm(2), mm(-45)], UP, 'slot-tower-switch', ['switch-mount']),
    anchor('tower-board', 'Protoboard transversal', [0, mm(2), mm(10)], UP, 'slot-tower-board', ['board-mount']),
    anchor('sumo-motor-l', 'Traccion delantera izquierda', [mm(-64), mm(-2), mm(45)], DOWN, 'slot-sumo-motor-l', ['motor-mount']),
    anchor('sumo-motor-r', 'Traccion delantera derecha', [mm(64), mm(-2), mm(45)], DOWN, 'slot-sumo-motor-r', ['motor-mount']),
    anchor('sumo-caster', 'Apoyo trasero', [0, mm(-2), mm(-85)], DOWN, 'slot-sumo-caster', ['caster-mount']),
    anchor('sumo-battery', 'Bateria trasera inferior', [0, mm(-2), mm(-40)], DOWN, 'slot-sumo-battery', ['battery-mount']),
    anchor('sumo-uno', 'Placa transversal trasera', [0, mm(2), mm(-75)], UP, 'slot-sumo-uno', ['board-mount']),
    anchor('sumo-board', 'Protoboard transversal central', [0, mm(2), mm(-10)], UP, 'slot-sumo-board', ['board-mount']),
    anchor('sumo-driver', 'Driver lateral delantero', [mm(-38), mm(2), mm(55)], UP, 'slot-sumo-driver', ['driver-mount']),
    anchor('sumo-regulator', 'Regulador lateral', [mm(45), mm(2), mm(45)], UP, 'slot-sumo-regulator', ['regulator-mount']),
    anchor('sumo-switch', 'Interruptor lateral', [mm(45), mm(2), mm(75)], UP, 'slot-sumo-switch', ['switch-mount']),
    anchor('sumo-ir', 'Sensores adelantados', [0, mm(-2), mm(55)], DOWN, 'slot-sumo-ir', ['line-support']),
    anchor('sumo-post-l', 'Defensa izquierda', [mm(-40), mm(-2), mm(90)], DOWN, 'slot-sumo-post-l', ['bracket-mount']),
    anchor('sumo-post-c', 'Defensa central', [0, mm(-2), mm(90)], DOWN, 'slot-sumo-post-c', ['bracket-mount']),
    anchor('sumo-post-r', 'Defensa derecha', [mm(40), mm(-2), mm(90)], DOWN, 'slot-sumo-post-r', ['bracket-mount']),
    anchor('stack-corner', 'Apoyo de esquina para segundo piso', [-mm(45), -mm(2), -mm(75)], DOWN, 'plate-mount'),
    anchor('board', 'Placa', [0, mm(2), mm(40)], UP, 'slot-board', ['board-mount']), anchor('driver', 'Driver', [0, mm(2), -mm(45)], UP, 'slot-driver', ['driver-mount']),
    anchor('battery', 'Portapilas', [0, -mm(2), mm(30)], DOWN, 'slot-battery', ['battery-mount']), anchor('front', 'Soporte frontal', [0, mm(2), mm(100)], UP, 'slot-front', ['bracket-mount']),
  ],
  scalable: false, model: 'procedural', summary: 'Base de acrílico con anclajes para motores, placa, driver, portapilas y soporte.', keywords: ['chasis', 'base', 'acrilico', '2wd', 'robot'],
};

// El portapilas es solo una pieza mecánica (volumen, masa, anclaje): sus pines eléctricos esperan la decisión D-11.
const battery: ComponentDefinition = {
  id: 'battery-holder-4aa', name: 'Portapilas 4×AA', category: 'power', dimensions: [mm(63), mm(16), mm(58)], dimensionsSource: 'approximate', massKg: 0.08,
  // D-11 (resuelta con un supuesto): el voltaje es una propiedad editable. 4 pilas AA alcalinas ≈ 6 V; se corrige con el kit real.
  pins: [pin('B+', 'Positivo (+)', [mm(-26), mm(8.5), mm(-27)], 'power-out', {electrical: {vMax: 24, iMax: 2}}), pin('B-', 'Negativo (−)', [mm(26), mm(8.5), mm(-27)], 'ground')],
  props: [{id: 'voltage', label: 'Voltaje (V) — supuesto de 4×AA; verifícalo con el kit', type: 'number', min: 1.5, max: 24, default: 6}],
  anchors: [anchor('base', 'Base', [0, mm(8), 0], UP, 'battery-mount')],
  scalable: false, model: 'procedural', summary: 'Portapilas con terminales + y −. Voltaje editable (por defecto 6 V, 4×AA: supuesto a verificar con el kit).', keywords: ['portapilas', 'bateria', 'pilas', 'aa', 'alimentacion', 'voltaje'],
};

const sensorBracket: ComponentDefinition = {
  id: 'sensor-bracket', name: 'Soporte del sensor', category: 'structure', dimensions: [mm(50), mm(30), mm(12)], dimensionsSource: 'approximate', massKg: 0.01,
  pins: [], anchors: [anchor('base', 'Base', [0, -mm(15), 0], DOWN, 'bracket-mount'), anchor('sensor', 'Sensor', [0, 0, mm(6)], [0, 0, 1], 'slot-sensor', ['sensor-mount'])],
  scalable: false, model: 'procedural', summary: 'Escuadra para fijar el HC-SR04 al frente del chasis.', keywords: ['soporte', 'escuadra', 'sensor', 'bracket'],
};

const genericBracket: ComponentDefinition = {
  id: 'bracket-generic', name: 'Soporte genérico', category: 'structure', dimensions: [mm(40), mm(20), mm(20)], dimensionsSource: 'approximate', massKg: 0.008,
  pins: [], anchors: [anchor('base', 'Base', [0, -mm(10), 0], DOWN, 'bracket-mount'), anchor('top', 'Superior', [0, mm(10), 0], UP, 'slot-generic', ['board-mount', 'driver-mount', 'battery-mount', 'sensor-mount', 'bracket-mount', 'plate-mount']), anchor('front-low', 'Extension baja frontal', [0, mm(10), -mm(10)], UP, 'slot-low-bumper', ['bracket-mount'])],
  scalable: false, model: 'procedural', summary: 'Bloque para elevar o fijar cualquier placa o módulo.', keywords: ['soporte', 'separador', 'bloque', 'generico'],
};

// ───── Piezas sueltas para probar el programa (etapa 4): se cablean, no se unen mecánicamente.
const led: ComponentDefinition = {
  id: 'led-5mm', name: 'LED 5 mm', category: 'actuator', dimensions: [mm(5.8), mm(9), mm(5.8)], dimensionsSource: 'approximate', massKg: 0.0005,
  pins: [pin('A', 'Ánodo (+)', [-mm(1.27), -mm(4.5), 0], 'signal'), pin('K', 'Cátodo (−)', [mm(1.27), -mm(4.5), 0], 'signal')],
  props: [{id: 'color', label: 'Color', type: 'enum', options: ['rojo', 'verde', 'amarillo', 'azul'], default: 'rojo'}],
  anchors: [anchor('base', 'Patas', [0, -mm(4.5), 0], DOWN, 'led-mount')], scalable: false, model: 'procedural', summary: 'Diodo emisor de luz. Sin resistencia en serie se puede quemar.', keywords: ['led', 'diodo', 'luz', 'indicador'],
};
const resistor: ComponentDefinition = {
  id: 'resistor', name: 'Resistencia', category: 'passive', dimensions: [mm(6.3), mm(2.4), mm(2.4)], dimensionsSource: 'approximate', massKg: 0.0002,
  pins: [pin('P1', 'Pata 1', [-mm(4.5), 0, 0], 'signal'), pin('P2', 'Pata 2', [mm(4.5), 0, 0], 'signal')],
  props: [{id: 'ohms', label: 'Resistencia (Ω)', type: 'number', min: 1, max: 1000000, default: 220}],
  anchors: [anchor('base', 'Apoyo', [0, -mm(1.2), 0], DOWN, 'resistor-mount')], scalable: false, model: 'procedural', summary: 'Resistencia de 1/4 W; por defecto 220 Ω, la de un LED con 5 V.', keywords: ['resistencia', 'resistor', 'ohm', 'pasivo'],
};

// Half-size solderless breadboard: 30 rows of two isolated five-hole strips,
// plus four continuous 25-hole buses. +/- are markings, never voltage sources.
const breadboardPins: PinDefinition[] = [];
const breadboardColumns = [-13.97, -11.43, -8.89, -6.35, -3.81, 3.81, 6.35, 8.89, 11.43, 13.97];
for (let row = 1; row <= 30; row++) {
  for (let col = 0; col < 10; col++) {
    const id = `${'ABCDEFGHIJ'[col]}${row}`;
    breadboardPins.push(pin(id, id, [mm(breadboardColumns[col]), mm(4.65), mm((row - 15.5) * 2.54)], 'signal', {internalNet: `${col < 5 ? 'left' : 'right'}-${row}`}));
  }
}
for (const [side, sign, x] of [['L', '+', -22.86], ['L', '-', -20.32], ['R', '+', 20.32], ['R', '-', 22.86]] as const) {
  for (let n = 1; n <= 25; n++) {
    const id = `${side}${sign}${n}`;
    // Five groups of five holes, separated visually but electrically continuous.
    const z = -35.56 + (n - 1 + Math.floor((n - 1) / 5)) * 2.54;
    breadboardPins.push(pin(id, `${side === 'L' ? 'Izq.' : 'Der.'} ${sign} ${n}`, [mm(x), mm(4.65), mm(z)], 'signal', {internalNet: `rail-${side}-${sign}`}));
  }
}
const breadboard: ComponentDefinition = {
  id: 'breadboard-400', name: 'Protoboard 400 puntos', category: 'passive',
  dimensions: [mm(55), mm(9.3), mm(82.6)], dimensionsSource: 'approximate', massKg: 0.038,
  pins: breadboardPins, anchors: [anchor('base', 'Base adhesiva', [0, -mm(4.65), 0], DOWN, 'board-mount'), anchor('indicator', 'LED filas 20–21', [-mm(13.97), mm(4.65), mm(12.7)], UP, 'slot-led', ['led-mount']), anchor('resistor', 'Resistencia filas 21–25', [-mm(8.89), mm(4.65), mm(19.05)], UP, 'slot-resistor', ['resistor-mount'])],
  scalable: false, model: 'procedural',
  summary: '400 puntos: A–E y F–J unidos por fila, separados por el canal central. Cuatro rieles continuos de 25 puntos, aislados entre sí; +/− no alimentan por sí solos.',
  keywords: ['protoboard', 'breadboard', 'placa de pruebas', '400', 'riel', 'orificios', 'sin soldadura'],
};

const irSensor: ComponentDefinition = {
  id: 'tcrt5000-module', name: 'Sensor de línea TCRT5000', category: 'sensor', dimensions: [mm(12), mm(8), mm(32)], dimensionsSource: 'approximate', massKg: 0.004,
  pins: [pin('VCC', 'VCC', [-mm(2.54), mm(4), -mm(13)], 'power-in', {electrical: {vMax: 5.5}}), pin('GND', 'GND', [0, mm(4), -mm(13)], 'ground'), pin('DO', 'DO', [mm(2.54), mm(4), -mm(13)], 'digital')],
  anchors: [anchor('base', 'Fijación superior', [0, mm(4), 0], UP, 'ir-mount')],
  props: [{id: 'activeLow', label: 'Salida baja sobre negro (invertir polaridad)', type: 'boolean', default: false}, {id: 'testBlack', label: 'Negro en banco de pruebas (sin física)', type: 'boolean', default: false}],
  scalable: false, model: 'procedural', summary: 'Sensor reflectivo digital mirando al suelo. Requiere 5 V y GND; DO cambia sobre la pista. Negro = HIGH por defecto; polaridad invertible.', keywords: ['infrarrojo', 'ir', 'linea', 'tcrt5000', 'reflectancia', 'seguidor'],
};
// ───── Micro servo SG90: 22,5 × 12 × 22,7 mm de cuerpo y 32,5 mm con las orejas (ficha habitual). Cable de 3 hilos: señal, 5 V y GND.
const servoSg90: ComponentDefinition = {
  id: 'servo-sg90', name: 'Servo SG90', category: 'actuator', dimensions: [mm(32.5), mm(22.7), mm(12)], dimensionsSource: 'approximate', massKg: 0.009,
  pins: [pin('SIG', 'Señal', [-mm(18), -mm(4), -mm(2.54)], 'pwm'), pin('VCC', 'VCC', [-mm(18), -mm(4), 0], 'power-in', {electrical: {vMax: 6}}), pin('GND', 'GND', [-mm(18), -mm(4), mm(2.54)], 'ground')],
  anchors: [anchor('base', 'Base', [0, -mm(11.35), 0], DOWN, 'sensor-mount'), anchor('horn', 'Cuerno (gira lo que le pongas encima)', [mm(5.6), mm(16.6), 0], UP, 'slot-servo-horn', ['neck-mount'])],
  props: [{id: 'color', label: 'Carcasa: azul de fábrica o blanca con armadura (robot humanoide)', type: 'enum', options: ['azul', 'armadura'], default: 'azul'}],
  scalable: false, model: 'procedural',
  summary: 'Gira a un ángulo de 0° a 180° según el ancho del pulso de la señal (0,54–2,4 ms cada 20 ms). Necesita 5 V y GND; usa la biblioteca Servo.',
  keywords: ['servo', 'sg90', 'servomotor', 'angulo', 'brazo', 'garra', 'pwm', 'actuador'],
};
// ───── Pantalla OLED 2,42" SSD1306 de 128 × 64 por I²C: módulo de ~66 × 41 mm con cuatro pines (GND, VCC, SCL, SDA). Es la versión grande del mismo controlador: se programa igual que la de 0,96".
const oled: ComponentDefinition = {
  id: 'oled-ssd1306', name: 'Pantalla OLED 2,42" I²C', category: 'actuator', dimensions: [mm(66), mm(4.5), mm(41)], dimensionsSource: 'approximate', massKg: 0.012,
  pins: [pin('GND', 'GND', [-mm(3.81), mm(2.5), -mm(17.5)], 'ground'), pin('VCC', 'VCC', [-mm(1.27), mm(2.5), -mm(17.5)], 'power-in', {electrical: {vMax: 5.5}}),
    pin('SCL', 'SCL', [mm(1.27), mm(2.5), -mm(17.5)], 'digital'), pin('SDA', 'SDA', [mm(3.81), mm(2.5), -mm(17.5)], 'digital')],
  anchors: [anchor('base', 'Base', [0, -mm(2.25), 0], DOWN, 'sensor-mount')],
  props: [{id: 'address', label: 'Dirección I²C (60 = 0x3C, 61 = 0x3D)', type: 'number', min: 60, max: 61, default: 60}],
  scalable: false, model: 'procedural',
  summary: 'Pantalla de 128 × 64 píxeles y 2,42 pulgadas (la versión grande del SSD1306: sirve para una cara con ojos y boca). En el Arduino UNO el I²C usa A4 (SDA) y A5 (SCL). Se programa con Adafruit_SSD1306 y Adafruit_GFX: lo que dibujas se ve en la pantalla.',
  keywords: ['pantalla', 'oled', 'display', 'ssd1306', 'i2c', 'cara', 'ojos', 'boca', 'adafruit', 'wire', '2.42'],
};
// ───── Pulsador táctil 6 × 6 mm (cuatro patas, dos contactos): al pulsar une P1 y P2. Se usa con INPUT_PULLUP contra GND.
const pushButton: ComponentDefinition = {
  id: 'push-button-6mm', name: 'Pulsador', category: 'sensor', dimensions: [mm(12), mm(8), mm(12)], dimensionsSource: 'approximate', massKg: 0.003,
  pins: [pin('P1', 'Terminal 1', [-mm(3.5), mm(2), -mm(5.5)], 'digital'), pin('P2', 'Terminal 2', [mm(3.5), mm(2), -mm(5.5)], 'digital')],
  anchors: [anchor('base', 'Base', [0, -mm(4), 0], DOWN, 'sensor-mount')],
  props: [{id: 'pressed', label: 'Pulsado al iniciar la simulación', type: 'boolean', default: false}],
  scalable: false, model: 'procedural',
  summary: 'Al pulsarlo (botón «Pulsar» del panel Estado o la tecla Espacio) une sus dos terminales. Conéctalo entre un pin y GND y usa pinMode(pin, INPUT_PULLUP): pulsado = LOW.',
  keywords: ['pulsador', 'boton', 'button', 'interruptor', 'entrada', 'digital', 'pullup'],
};
// ───── Potenciómetro de 10 kΩ (divisor de tensión): VCC y GND en los extremos, OUT es el cursor.
const potentiometer: ComponentDefinition = {
  id: 'potentiometer-10k', name: 'Potenciómetro 10 kΩ', category: 'sensor', dimensions: [mm(18), mm(16), mm(18)], dimensionsSource: 'approximate', massKg: 0.006,
  pins: [pin('VCC', 'Extremo 1 (VCC)', [-mm(5), -mm(5), -mm(8)], 'power-in', {electrical: {vMax: 5.5}}), pin('OUT', 'Cursor (OUT)', [0, -mm(5), -mm(8)], 'analog'), pin('GND', 'Extremo 2 (GND)', [mm(5), -mm(5), -mm(8)], 'ground')],
  anchors: [anchor('base', 'Base', [0, -mm(8), 0], DOWN, 'sensor-mount')],
  props: [{id: 'position', label: 'Posición inicial del cursor (0–1)', type: 'number', min: 0, max: 1, default: 0.5}],
  scalable: false, model: 'procedural',
  summary: 'Divisor de tensión ajustable con el deslizador del panel Estado. Extremos a 5 V y GND, cursor a una entrada analógica (A0–A5): analogRead da 0–1023.',
  keywords: ['potenciometro', 'pot', 'perilla', 'analogico', 'analogread', 'divisor', 'tension', 'resistencia variable'],
};
// ───── Cabeza del robot de orugas: carcasa de 86 × 64 × 70 mm que se fija al cuerno del servo del cuello. Delante lleva la pantalla (la cara); arriba, el sensor de distancia.
const robotHead: ComponentDefinition = {
  id: 'robot-head', name: 'Cabeza del robot', category: 'structure', dimensions: [mm(104), mm(78), mm(78)], dimensionsSource: 'approximate', massKg: 0.08,
  pins: [], anchors: [
    anchor('base', 'Cuello (al cuerno del servo)', [0, -mm(39), 0], DOWN, 'neck-mount'),
    anchor('screen', 'Pantalla (cara)', [0, mm(2), mm(39)], [0, 0, 1], 'slot-head-screen', ['sensor-mount']),
    anchor('visor', 'Visor del radar', [0, mm(39), mm(12)], UP, 'slot-head-visor', ['sensor-mount']),
  ],
  scalable: false, model: 'procedural',
  summary: 'Carcasa redondeada de 104 × 78 × 78 mm con el marco de la pantalla al frente y un soporte arriba para el HC-SR04. Gira con el servo del cuello: la cara y el radar miran hacia donde gira.',
  keywords: ['cabeza', 'cara', 'cuello', 'robot', 'radar', 'carcasa', 'oruga'],
};
// ───── Oruga: rueda motriz dentada (gira con el motor, es la que empuja) y banda decorativa que la envuelve y desliza sobre el suelo.
const trackSprocket: ComponentDefinition = {
  id: 'track-sprocket', name: 'Rueda motriz de oruga', category: 'structure', dimensions: [mm(22), mm(65), mm(65)], dimensionsSource: 'approximate', massKg: 0.035,
  pins: [], anchors: [anchor('hub', 'Cubo', [0, 0, 0], [1, 0, 0], 'wheel-hub')],
  scalable: false, model: 'procedural', summary: 'Rueda dentada de 65 mm que va en el eje del motor. Empuja al robot; la banda de la oruga se apoya sobre ella.', keywords: ['oruga', 'rueda motriz', 'sprocket', 'dentada', 'tanque'],
};
const trackBelt: ComponentDefinition = {
  id: 'track-belt', name: 'Banda de oruga', category: 'structure', dimensions: [mm(26), mm(65), mm(160)], dimensionsSource: 'approximate', massKg: 0.045,
  pins: [], anchors: [anchor('base', 'Fijación al motor', [0, 0, 0], [1, 0, 0], 'track-mount')],
  scalable: false, model: 'procedural', summary: 'Banda de 160 mm con dientes que rodea la rueda motriz. En la simulación desliza sobre el suelo y el robot avanza por la rueda motriz: se comporta como un robot de dos ruedas con patines largos.', keywords: ['oruga', 'banda', 'cadena', 'tanque', 'patin'],
};
// ───── Armazón superior (torso abierto): placa superior y cuatro columnas sobre el chasis. Lleva el cuello arriba y un hombro (servo) a cada lado.
const robotTorso: ComponentDefinition = {
  id: 'robot-torso', name: 'Cuerpo humanoide del robot', category: 'structure', dimensions: [mm(224), mm(162), mm(150)], dimensionsSource: 'approximate', massKg: 0.1,
  pins: [], anchors: [
    anchor('base', 'Base (al chasis)', [0, -mm(81), 0], DOWN, 'torso-mount'),
    anchor('neck', 'Cuello (servo) arriba', [-mm(5.6), mm(81), mm(10)], UP, 'slot-neck-top', ['sensor-mount']),
    anchor('shoulder-l', 'Hombro izquierdo (servo)', [mm(118), mm(59), mm(8)], [1, 0, 0], 'slot-shoulder-l', ['sensor-mount']),
    anchor('shoulder-r', 'Hombro derecho (servo)', [-mm(118), mm(59), mm(8)], [-1, 0, 0], 'slot-shoulder-r', ['sensor-mount']),
  ],
  scalable: false, model: 'procedural',
  summary: 'Cuerpo humanoide de 162 mm con armadura por capas: la electrónica del chasis queda adentro, tras un vidrio ahumado y una coraza de láminas con ranuras, costados ventilados y placa dorsal; arriba, pecho en V, hombreras y cuello. Arriba lleva la cabeza y, en los extremos de la barra de hombros, los servos de los hombros: así los brazos cuelgan por fuera de las orugas.',
  keywords: ['torso', 'cuerpo', 'carcasa', 'armazon', 'estructura', 'robot', 'hombro', 'vidrio'],
};
// ───── Brazo completo: hombro (servo) → brazo → codo (servo) → antebrazo → pinza (servo). El brazo cuelga del cuerno del servo del hombro y en reposo apunta hacia adelante.
const robotArm: ComponentDefinition = {
  id: 'robot-arm', name: 'Brazo del robot', category: 'structure', dimensions: [mm(32), mm(84), mm(36)], dimensionsSource: 'approximate', massKg: 0.05,
  pins: [], anchors: [
    anchor('base', 'Hombro (al cuerno del servo)', [0, mm(42), 0], UP, 'neck-mount'),
    anchor('elbow-l', 'Codo (servo) del brazo izquierdo', [mm(28), -mm(38), 0], [1, 0, 0], 'slot-elbow-l', ['sensor-mount']),
    anchor('elbow-r', 'Codo (servo) del brazo derecho', [-mm(28), -mm(38), 0], [-1, 0, 0], 'slot-elbow-r', ['sensor-mount']),
  ],
  scalable: false, model: 'procedural',
  summary: 'Brazo de 84 mm con hombro azul. Cuelga del cuerno del servo del hombro (a 90° queda recto) y lleva en su extremo el servo del codo, que mueve el antebrazo.',
  keywords: ['brazo', 'hombro', 'robot', 'codo', 'saludar'],
};
const robotForearm: ComponentDefinition = {
  id: 'robot-forearm', name: 'Antebrazo del robot', category: 'structure', dimensions: [mm(28), mm(86), mm(24)], dimensionsSource: 'approximate', massKg: 0.04,
  pins: [], anchors: [
    anchor('base', 'Codo (al cuerno del servo)', [0, mm(43), 0], UP, 'neck-mount'),
    anchor('wrist', 'Muñeca (pinza)', [0, -mm(43), 0], DOWN, 'slot-wrist', ['claw-mount']),
  ],
  scalable: false, model: 'procedural',
  summary: 'Antebrazo de 86 mm, proporcionado al brazo: cuelga del cuerno del servo del codo y lleva la pinza en la muñeca.',
  keywords: ['antebrazo', 'codo', 'brazo', 'robot', 'muñeca'],
};
const robotClaw: ComponentDefinition = {
  id: 'robot-claw', name: 'Pinza del robot', category: 'actuator', dimensions: [mm(34), mm(36), mm(40)], dimensionsSource: 'approximate', massKg: 0.04,
  pins: [], anchors: [
    anchor('base', 'Muñeca (al antebrazo)', [0, mm(18), 0], UP, 'claw-mount'),
    anchor('servo', 'Servo de la pinza (al frente)', [0, mm(18), mm(26)], UP, 'slot-claw-servo', ['sensor-mount']),
  ],
  props: [],
  scalable: false, model: 'procedural',
  summary: 'Pinza de dos dedos paralelos. Su servo la abre y la cierra: a 0° está muy abierta (64 mm) y a 90° casi cerrada (19 mm). Un objeto movible que quede entre los dedos con la separación justa se agarra y se lleva.',
  keywords: ['pinza', 'garra', 'mano', 'agarrar', 'recoger', 'dedos', 'robot'],
};
const lineSupport: ComponentDefinition = {
  id: 'ir-double-bracket', name: 'Soporte doble infrarrojo', category: 'structure', dimensions: [mm(56), mm(34), mm(34)], dimensionsSource: 'approximate', massKg: 0.012,
  pins: [], anchors: [anchor('base', 'Fijación al chasis', [0, mm(17), 0], UP, 'line-support'), anchor('left', 'Sensor izquierdo', [-mm(18), -mm(17), 0], DOWN, 'slot-ir-left', ['ir-mount']), anchor('right', 'Sensor derecho', [mm(18), -mm(17), 0], DOWN, 'slot-ir-right', ['ir-mount'])],
  scalable: false, model: 'procedural', summary: 'Separadores y travesaño para dos sensores de línea bajo el frente del chasis.', keywords: ['soporte', 'infra', 'separador', 'linea'],
};
const powerSwitch: ComponentDefinition = {
  id: 'power-switch', name: 'Interruptor general', category: 'power', dimensions: [mm(14), mm(16), mm(24)], dimensionsSource: 'approximate', massKg: 0.006,
  pins: [pin('IN', 'Entrada', [0, -mm(7), -mm(8)], 'signal'), pin('OUT', 'Salida', [0, -mm(7), mm(8)], 'signal')],
  anchors: [anchor('base', 'Fijación', [0, -mm(8), 0], DOWN, 'switch-mount')], props: [{id: 'closed', label: 'Encendido', type: 'boolean', default: true}],
  scalable: false, model: 'procedural', summary: 'Contacto SPST: encendido une IN y OUT; apagado corta la alimentación. Cámbialo en Propiedades con la simulación detenida.', keywords: ['interruptor', 'encendido', 'apagado', 'switch'],
};
const regulator: ComponentDefinition = {
  id: 'regulator-5v', name: 'Regulador 5 V buck-boost', category: 'power', dimensions: [mm(20), mm(12), mm(28)], dimensionsSource: 'approximate', massKg: 0.005,
  pins: [pin('VIN', 'VIN', [-mm(7), mm(5), -mm(9)], 'power-in', {electrical: {vMax: 11.8}}), pin('GND', 'GND', [-mm(7), mm(5), mm(9)], 'ground'), pin('5V', '5V', [mm(7), mm(5), -mm(9)], 'power-out', {electrical: {vMax: 5, iMax: 0.5}}), pin('GND.OUT', 'GND salida', [mm(7), mm(5), mm(9)], 'ground', {internalNet: 'GND'})],
  anchors: [anchor('base', 'Base', [0, -mm(6), 0], DOWN, 'regulator-mount')], scalable: false, model: 'procedural',
  summary: 'Modelo didáctico buck-boost: entrada 2,7–11,8 V, salida regulada de 5 V. Alimenta la lógica; los motores van al driver.', keywords: ['regulador', '5v', 'buck', 'boost', 'alimentacion'],
};
regulator.pins.find(p => p.id === 'GND')!.internalNet = 'GND';

const arm: ComponentDefinition = {
  id: 'educational-arm-e6', name: 'Brazo educativo · referencia E6', category: 'actuator',
  dimensions: [.162, .103, .12], dimensionsSource: 'approximate', massKg: 7.2,
  pins: [], anchors: [], scalable: false, model: 'procedural',
  summary: 'Modelo mecánico oficial E6: seis articulaciones, Jog, MovJ/MovL, enseñanza de puntos y pinza de práctica. Simulación local sin equipo conectado.',
  keywords: ['brazo', 'robot', 'dobot', 'e6', 'pinza', 'articulacion'],
};
const practiceBlock: ComponentDefinition = {
  id: 'arm-practice-block', name: 'Pieza de práctica · 50 g', category: 'structure',
  dimensions: [.035, .035, .035], dimensionsSource: 'approximate', massKg: .05,
  pins: [], anchors: [], scalable: false, model: 'procedural',
  props: [{id: 'massKg', label: 'Masa de la pieza (kg)', type: 'number', min: .001, max: 2, default: .05}, ...['R','G','B'].map((channel,i)=>({id:`surface${channel}`,label:`Superficie · canal ${channel} (0–255)`,type:'number' as const,min:0,max:255,default:[220,150,55][i]}))],
  summary: 'Cubo manipulable con la pinza del brazo educativo.', keywords: ['pieza', 'cubo', 'brazo', 'carga'],
};
const dropZone: ComponentDefinition = {
  id: 'arm-drop-zone', name: 'Zona de entrega', category: 'structure',
  dimensions: [.12, .004, .12], dimensionsSource: 'approximate', massKg: .01,
  pins: [], anchors: [], scalable: false, model: 'procedural',
  summary: 'Objetivo azul para depositar la pieza de práctica.', keywords: ['zona', 'entrega', 'brazo'],
};
import {conveyorDefinition} from '../conveyor/catalog.ts';
export const CATALOG: readonly ComponentDefinition[] = [chassis, motor, wheel, caster, arduino, l298n, hcsr04, battery, sensorBracket, genericBracket, led, resistor, breadboard, irSensor, servoSg90, oled, robotHead, trackSprocket, trackBelt, robotTorso, robotArm, robotForearm, robotClaw, pushButton, potentiometer, lineSupport, powerSwitch, regulator, arm, practiceBlock, dropZone, ...COMBAT_DEFINITIONS, conveyorDefinition];
const byId = new Map(CATALOG.map(d => [d.id, d]));
export const getDefinition = (id: string): ComponentDefinition | undefined => byId.get(id);
export const definitionIds: ReadonlySet<string> = new Set(CATALOG.map(d => d.id));
export const CATEGORY_LABELS: Record<ComponentDefinition['category'], string> = {control: 'Control', driver: 'Drivers', sensor: 'Sensores', actuator: 'Actuadores', power: 'Energía', structure: 'Estructura', passive: 'Pasivos'};

/** Forma mínima del catálogo para el validador: qué pines y anclajes tiene cada definición. */
export const catalogShape: ReadonlyMap<string, {pins: ReadonlySet<string>; anchors: ReadonlySet<string>}> = new Map(CATALOG.map(d => [d.id, {pins: new Set(d.pins.map(p => p.id)), anchors: new Set(d.anchors.map(a => a.id))}]));

/** Filtra el catálogo por texto (nombre, resumen y palabras clave, sin tildes) y categoría. */
export function searchCatalog(query: string, category: ComponentDefinition['category'] | 'all' = 'all'): ComponentDefinition[] {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const words = norm(query).split(/\s+/).filter(Boolean);
  return CATALOG.filter(d => (category === 'all' || d.category === category) && words.every(w => norm([d.name, d.summary, ...d.keywords].join(' ')).includes(w)));
}
