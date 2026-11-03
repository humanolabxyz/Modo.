// Banco de pruebas de Robótica: robot de 2 ruedas + pulsador entre D2 y GND + LED de D13 + potenciómetro (5 V, A0, GND) + servo en D11 (5 V, GND).
import {buildRobot2wd, wireRobot2wd} from './robot2wd.mjs';
import {addPart, attach, connect, setPartProp} from '../../src/robotics/project/commands.ts';
const ok = r => { if ('error' in r) throw new Error(r.error); return r.project; };

export async function bench({pot = true} = {}) {
  const built = buildRobot2wd(); let p = setPartProp(await wireRobot2wd(built), built.ids.battery, 'voltage', 9);
  const uno = built.ids.uno, put = (def, pos = [0, 0.5, 0]) => { p = ok(addPart(p, def, pos)); return p.parts.at(-1).instanceId; };
  // Servo, potenciómetro y pulsador van sobre tres columnas del chasis (trasera izquierda, trasera derecha y delantera izquierda).
  const mount = (def, anchorId) => { const post = put('bracket-generic'), id = put(def); p = ok(attach(p, {instanceId: built.ids.chassis, anchorId}, {instanceId: post, anchorId: 'base'})); p = ok(attach(p, {instanceId: post, anchorId: 'top'}, {instanceId: id, anchorId: 'base'})); return id; };
  const servo = mount('servo-sg90', 'tower-post-rl'), potId = mount('potentiometer-10k', 'tower-post-rr'), button = mount('push-button-6mm', 'tower-post-fl');
  const led = put('led-5mm', [0.2, 0.0045, 0.2]), res = put('resistor', [0.25, 0.0012, 0.2]);
  p = {...p, parts: p.parts.map(x => (x.instanceId === led ? {...x, props: {color: 'rojo'}} : x.instanceId === res ? {...x, props: {ohms: 220}} : x))};
  const wire = (a, ap, b, bp) => { p = ok(connect(p, {instanceId: a, pinId: ap}, {instanceId: b, pinId: bp}, '#2a67a3')); };
  wire(button, 'P1', uno, 'D2'); wire(button, 'P2', uno, 'GND.3');
  wire(uno, 'D13', res, 'P1'); wire(res, 'P2', led, 'A'); wire(led, 'K', uno, 'GND.3');
  wire(servo, 'SIG', uno, 'D11'); wire(servo, 'VCC', uno, '5V'); wire(servo, 'GND', uno, 'GND.3');
  if (pot) { wire(potId, 'VCC', uno, '5V'); wire(potId, 'GND', uno, 'GND.2'); wire(potId, 'OUT', uno, 'A0'); }
  return {p, ids: {uno, button, pot: potId, servo, led}};
}
