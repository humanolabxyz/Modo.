// Robótica · sonidos del robot: qué debe sonar sale de la simulación (motores, orugas, servos, freno, pinzas, encendido).
//   Uso: node qa/verify-robotics-sound.mjs
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {readRobotCues, soundEvents, soundTargets} from '../src/robotics/audio/soundModel.ts';
await RAPIER.init();
const pass = s => console.log('PASS', s);

/** Corre un robot y devuelve, en cada paso, lo que debe sonar y los eventos nuevos. */
function listen(id, seconds, step = 20) {
  const p = buildTemplate(id), uno = p.parts.find(x => x.definitionId === 'arduino-uno-r3'), phys = RobotPhysics.create(RAPIER, p), c = new Coordinator({project: p, targetId: uno.instanceId, hex: p.firmware[0].artifact.hex, physics: true}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  const rows = []; let prevSnap = null, prevT = null, tail = '';
  for (let t = 0; t < seconds * 1000; t += step) {
    c.advance(step * 1000); const snap = c.snapshot(), targets = soundTargets(p, snap, prevSnap), events = soundEvents(prevT, targets);
    const cues = readRobotCues(snap.serial, tail); tail = cues.tail;
    events.push(...cues.events);
    rows.push({t, targets, events}); prevSnap = snap; prevT = targets;
  }
  phys.dispose(); return {p, rows};
}

{ // 1. Robot de orugas: motores y orugas suenan al avanzar, el freno golpea, el cuello y los brazos zumban
  const {p, rows} = listen('robot-oruga-radar', 10);
  const kinds = k => rows.flatMap(r => r.events.filter(e => e.kind === k));
  const cruising = rows.filter(r => r.t > 600 && r.t < 1300);
  assert.ok(cruising.every(r => r.targets.motors.length === 2 && r.targets.motors.every(m => m.level > 0.43)), 'los dos motores suenan al avanzar, incluida la aproximación lenta');
  assert.ok(Math.max(...cruising.map(r => r.targets.tracks)) > 0.25, `las orugas suenan al avanzar (${Math.max(...cruising.map(r => r.targets.tracks)).toFixed(2)})`);
  const quiet = rows.filter(r => r.targets.motors.every(m => m.braking)); assert.ok(quiet.length > 20 && quiet.every(r => r.targets.motors.every(m => m.level === 0)), 'frenado en corto: el motor no zumba');
  assert.equal(kinds('power-on').length, 1, 'un solo pitido de encendido'); assert.ok(rows[0].events.some(e => e.kind === 'power-on'), 'suena al encender');
  assert.ok(kinds('surprise').length >= 1 && kinds('turn-right').length >= 1, 'la sorpresa y el giro emiten sonidos distintos');
  assert.ok(kinds('brake').length >= 1, 'el freno hace un golpe seco');
  const neck = p.parts.filter(x => x.definitionId === 'servo-sg90')[0], neckRates = rows.map(r => r.targets.servos.find(s => s.id === neck.instanceId)?.rate ?? 0);
  assert.ok(Math.max(...neckRates) > 100, `el servo del cuello zumba al girar (${Math.max(...neckRates).toFixed(0)} °/s)`);
  assert.ok(kinds('servo-start').length >= 2 && kinds('servo-stop').length >= 2, 'los servos hacen clic al arrancar y al parar');
  assert.ok(rows.some(r => r.targets.servos.filter(s => s.rate > 50).length >= 2), 'varios servos pueden sonar a la vez (hombros izquierdo y derecho)');
  const idle = rows.filter(r => r.t > 600 && r.t < 1000).flatMap(r => r.targets.servos.map(s => s.rate)); assert.ok(Math.max(...idle) < 8, 'servos quietos: en silencio');
  const mot = rows[200].targets.motors; assert.ok(mot.some(m => m.pan > 0.1) && mot.some(m => m.pan < -0.1), 'cada motor suena por su lado (estéreo)');
  pass(`orugas: motores ${Math.max(...cruising.map(r => r.targets.motors[0].level)).toFixed(2)}, orugas ${Math.max(...cruising.map(r => r.targets.tracks)).toFixed(2)}, ${kinds('brake').length} frenazo(s), cuello ${Math.max(...neckRates).toFixed(0)} °/s, ${kinds('servo-start').length} arranques de servo`);
}

{ // 2. Recoger cubos: la pinza hace clic al agarrar y al soltar
  const {rows} = listen('robot-oruga-recoger', 12);
  const grasp = rows.flatMap(r => r.events.filter(e => e.kind === 'grasp')), release = rows.flatMap(r => r.events.filter(e => e.kind === 'release'));
  assert.equal(grasp.length, 2, 'un clic por cada cubo agarrado'); assert.equal(release.length, 2, 'un golpe por cada cubo soltado');
  assert.deepEqual(grasp.map(e => e.id).sort(), ['cubo-derecho', 'cubo-izquierdo']);
  assert.ok(rows.at(-1).targets.motors.every(m => m.level === 0), 'sin avanzar, los motores callan'); assert.equal(Math.max(...rows.map(r => r.targets.tracks)), 0, 'y las orugas también');
  pass('pinzas: clic al agarrar cada cubo y golpe al soltarlo; con el robot quieto solo suenan los servos');
}

{ // 3. Sin energía o detenido no suena nada
  const p = buildTemplate('robot-oruga-radar');
  assert.deepEqual(soundTargets(p, null), {powered: false, motors: [], tracks: 0, servos: [], held: []});
  const bare = {...p, connections: p.connections.filter(x => ![x.a, x.b].some(r => p.parts.find(q => q.instanceId === r.instanceId)?.definitionId === 'battery-holder-4aa'))};
  const uno = bare.parts.find(x => x.definitionId === 'arduino-uno-r3'), phys = RobotPhysics.create(RAPIER, bare), c = new Coordinator({project: bare, targetId: uno.instanceId, hex: p.firmware[0].artifact.hex, physics: true}, phys);
  c.advance(500000); const t = soundTargets(bare, c.snapshot(), null); assert.ok(t.motors.every(m => m.level === 0) && t.tracks === 0 && t.servos.every(s => s.rate === 0), 'sin batería no hay motores ni servos en marcha');
  phys.dispose();
  pass('detenido o sin energía no suena nada');
}
console.log('PASS verify-robotics-sound');
