// Robot de 2 ruedas completo, armado SOLO con los comandos del proyecto (addPart + attach). Sirve de dato de prueba
// para las pruebas de ensamblaje y de interfaz. No es una plantilla del producto.
import {newRobotProject} from '../../src/robotics/project/defaults.ts';
import {addPart, attach} from '../../src/robotics/project/commands.ts';

export function buildRobot2wd(name = 'Robot 2 ruedas (prueba)') {
  let p = newRobotProject(name);
  const put = (def, pos = [0, 0.5, 0]) => { const r = addPart(p, def, pos); if ('error' in r) throw new Error(r.error); p = r.project; return p.parts.at(-1).instanceId; };
  const join = (parent, anchor, child, childAnchor) => { const r = attach(p, {instanceId: parent, anchorId: anchor}, {instanceId: child, anchorId: childAnchor}); if ('error' in r) throw new Error(r.error); p = r.project; };
  const chassis = put('chassis-2wd', [0, 0.0455, 0]); // las ruedas (radio 32,5 mm) quedan apoyadas en el suelo
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
  return {project: p, ids: {chassis, motorL, motorR, wheelL, wheelR, caster, uno, driver, battery, bracket, sensor}};
}

/** Cablea el robot de `buildRobot2wd` como lo haría un estudiante: potencia, señales del puente H y del sensor. Devuelve un proyecto nuevo. */
export async function wireRobot2wd({project, ids}, {jumpers = false} = {}) {
  const {connect, setPartProp} = await import('../../src/robotics/project/commands.ts');
  let p = project;
  const pin = (id, pinId) => ({instanceId: id, pinId});
  const wire = (a, b, color) => { const r = connect(p, a, b, color); if ('error' in r) throw new Error(r.error); p = r.project; };
  if (!jumpers) { p = setPartProp(p, ids.driver, 'jumperENA', false); p = setPartProp(p, ids.driver, 'jumperENB', false); }
  const {uno, driver, battery, sensor, motorL, motorR} = ids;
  wire(pin(battery, 'B+'), pin(driver, '+12V'), '#d64545'); wire(pin(battery, 'B+'), pin(uno, 'VIN'), '#d64545');
  wire(pin(battery, 'B-'), pin(driver, 'GND'), '#222222'); wire(pin(driver, 'GND'), pin(uno, 'GND.1'), '#222222');
  for (const [d, i] of [['D4', 'IN1'], ['D7', 'IN2'], ['D8', 'IN3'], ['D12', 'IN4']]) wire(pin(uno, d), pin(driver, i), '#2a67a3');
  wire(pin(uno, 'D5'), pin(driver, 'ENA'), '#e0a52a'); wire(pin(uno, 'D6'), pin(driver, 'ENB'), '#e0a52a');
  wire(pin(driver, 'OUT1'), pin(motorL, 'M+'), '#d64545'); wire(pin(driver, 'OUT2'), pin(motorL, 'M-'), '#222222');
  wire(pin(driver, 'OUT3'), pin(motorR, 'M+'), '#d64545'); wire(pin(driver, 'OUT4'), pin(motorR, 'M-'), '#222222');
  wire(pin(sensor, 'VCC'), pin(uno, '5V'), '#d64545'); wire(pin(sensor, 'GND'), pin(uno, 'GND.2'), '#222222');
  wire(pin(sensor, 'TRIG'), pin(uno, 'D9'), '#2a8f4f'); wire(pin(sensor, 'ECHO'), pin(uno, 'D10'), '#2a8f4f');
  return p;
}

/** Añade un LED rojo con su resistencia de 220 Ω entre D13 y GND del UNO y sube la batería a 9 V (el UNO por VIN necesita ≥ 7 V). */
export async function withLedAnd9V({project, ids}) {
  const {connect, setPartProp} = await import('../../src/robotics/project/commands.ts');
  let p = setPartProp(project, ids.battery, 'voltage', 9);
  const mk = (def, pos, props) => { const part = {instanceId: `t-${def}`, definitionId: def, label: def === 'led-5mm' ? 'LED 5 mm 1' : 'Resistencia 1', transform: {position: pos, rotation: [0, 0, 0, 1]}, props}; p = {...p, parts: [...p.parts, part]}; return part.instanceId; };
  const led = mk('led-5mm', [0.2, 0.0045, 0.2], {color: 'rojo'}), res = mk('resistor', [0.25, 0.0012, 0.2], {ohms: 220});
  const wire = (a, b) => { const r = connect(p, a, b, '#2a67a3'); if ('error' in r) throw new Error(r.error); p = r.project; };
  wire({instanceId: ids.uno, pinId: 'D13'}, {instanceId: res, pinId: 'P1'}); wire({instanceId: res, pinId: 'P2'}, {instanceId: led, pinId: 'A'}); wire({instanceId: led, pinId: 'K'}, {instanceId: ids.uno, pinId: 'GND.3'});
  return {project: p, led, res};
}
