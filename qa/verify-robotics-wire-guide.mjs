// Robótica · guía de cableado paso a paso: evalúa cada paso contra el proyecto real y, seguida completa, deja un robot que funciona.
//   Uso: node qa/verify-robotics-wire-guide.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildRobot2wd} from './robotics/robot2wd.mjs';
import {connect, disconnect} from '../src/robotics/project/commands.ts';
import {ROBOT_2_RUEDAS, getWiringGuide} from '../src/robotics/guide/guides.ts';
import {applyStep, evaluateStep, guideProgress, stepPins} from '../src/robotics/guide/wireGuide.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
await RAPIER.init();
const pass = s => console.log('PASS', s);
const G = ROBOT_2_RUEDAS, step = id => G.steps.find(s => s.id === id);
const pin = (p, def, n, pinId) => ({instanceId: p.parts.filter(x => x.definitionId === def)[n].instanceId, pinId});

{ // 1. Robot recién armado, sin cables: nada hecho, el paso actual es el primero
  const {project} = buildRobot2wd(), pr = guideProgress(project, G);
  assert.equal(pr.total, 21); assert.equal(pr.done, 0); assert.equal(pr.current, 0); assert.equal(pr.complete, false);
  assert.ok(pr.states.every(s => s.state === 'todo'));
  assert.equal(getWiringGuide('robot-2-ruedas-evita'), G); assert.equal(getWiringGuide('no-existe'), undefined);
  pass('robot sin cablear: 0 de 21 pasos, el primero es «Sube la batería a 9 V»');
}
{ // 2. Cada paso se puede aplicar («Hazlo por mí») y al final el cableado queda completo
  let {project} = buildRobot2wd();
  for (let i = 0; i < G.steps.length; i++) {
    const before = guideProgress(project, G); assert.equal(before.current, i, `paso ${i + 1} es el actual`);
    const r = applyStep(project, G.steps[i]); assert.ok(!('error' in r), 'error' in r ? r.error : ''); project = r.project;
    assert.equal(evaluateStep(project, G.steps[i]).state, 'done', `paso ${G.steps[i].id} hecho`);
  }
  const pr = guideProgress(project, G); assert.equal(pr.done, 21); assert.equal(pr.complete, true); assert.equal(pr.current, -1);
  assert.equal(project.connections.length, 18, '18 cables en total');
  globalThis.completed = project; pass('aplicar los 21 pasos en orden: cada uno pasa a «hecho» justo al aplicarse y el cableado queda completo (18 cables)');
}
{ // 3. Seguir la guía deja un robot que funciona: sin errores de diagnóstico y avanza por la física
  const project = {...globalThis.completed};
  assert.deepEqual(diagnose(project).filter(d => d.severity === 'error'), [], 'sin errores de circuito');
  const uno = project.parts.find(p => p.definitionId === 'arduino-uno-r3').instanceId, phys = RobotPhysics.create(RAPIER, project);
  const c = new Coordinator({project, targetId: uno, hex: fs.readFileSync('qa/fixtures/robotica/motors_fwd.hex', 'utf8'), physics: true}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  const z0 = phys.frame().main.p[2]; for (let t = 0; t < 3000; t += 20) c.advance(20000); const dz = phys.frame().main.p[2] - z0; phys.dispose();
  assert.ok(dz > 0.5, `avanzó ${dz.toFixed(2)} m`);
  pass(`el robot cableado solo con la guía avanza ${dz.toFixed(2)} m con el programa de prueba (motores, driver, batería y masa comunes bien puestos)`);
}
{ // 4. Cable al pin equivocado de la misma pieza → «equivocado», con la explicación exacta
  let {project} = buildRobot2wd(); project = applyStep(project, step('quitar-ena')).project;
  const r = connect(project, pin(project, 'arduino-uno-r3', 0, 'D5'), pin(project, 'l298n-module', 0, 'ENB'), '#e0a52a'); assert.ok(!('error' in r)); project = r.project;
  const s = evaluateStep(project, step('d5-ena')); assert.equal(s.state, 'wrong'); assert.match(s.hint, /D5/); assert.match(s.hint, /ENB/); assert.match(s.hint, /ENA/);
  const s2 = evaluateStep(project, step('d6-enb')); assert.equal(s2.state, 'wrong', 'ENB ya está ocupado por D5: D6→ENB también avisa'); assert.match(s2.hint, /ENB/); assert.match(s2.hint, /D5/);
  pass(`D5 conectado a ENB: «${s.hint}»`);
}
{ // 5. Equivalencia eléctrica: la masa común vale aunque el cable vaya a otro GND de la placa o directo desde la batería
  let {project} = buildRobot2wd();
  project = applyStep(project, step('bat-menos-driver')).project;
  const r = connect(project, pin(project, 'battery-holder-4aa', 0, 'B-'), pin(project, 'arduino-uno-r3', 0, 'GND.3'), '#222222'); project = r.project;
  assert.equal(evaluateStep(project, step('gnd-comun')).state, 'done', 'GND por otro pin / directo desde la batería también cuenta');
  pass('masa común: un cable de la batería a otro GND de la placa también cumple el paso (misma red eléctrica)');
}
{ // 6. Falta una pieza → «bloqueado»; sin sensor, solo los cuatro pasos del sensor
  let {project, ids} = buildRobot2wd(); project = {...project, parts: project.parts.filter(p => p.instanceId !== ids.sensor)};
  const blocked = guideProgress(project, G).states.filter(s => s.state === 'blocked'); assert.equal(blocked.length, 4); assert.match(blocked[0].hint, /HC-SR04/);
  assert.deepEqual(stepPins(project, step('sensor-trig')), [], 'sin pieza no hay pines que resaltar');
  pass(`sin el sensor: 4 pasos «bloqueados» («${blocked[0].hint}»)`);
}
{ // 7. Pines a resaltar y quitar un cable devuelve el paso a «pendiente»
  const {project} = buildRobot2wd(), pins = stepPins(project, step('d5-ena')); assert.deepEqual(pins.map(p => p.pinId), ['D5', 'ENA']);
  let p2 = applyStep(project, step('d5-ena')).project; assert.equal(evaluateStep(p2, step('d5-ena')).state, 'done');
  p2 = disconnect(p2, p2.connections[0].id); assert.equal(evaluateStep(p2, step('d5-ena')).state, 'todo');
  pass('resalta los dos pines del paso; quitar el cable lo devuelve a «pendiente»');
}
console.log('PASS verify-robotics-wire-guide');
