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
