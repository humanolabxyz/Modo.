// Robótica · robot de orugas con radar y cara: armado, cableado, física (orugas, freno, cuello que gira la cabeza y el radar) y cara en la pantalla.
//   Uso: node qa/verify-robotics-tracked.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {TEMPLATES, buildTemplate} from '../src/robotics/project/templates.ts';
import {PICK_HEX, PICK_SKETCH, TRACKED_HEX, TRACKED_SKETCH} from '../src/robotics/project/trackedSketch.ts';
import {findInterferences} from '../src/robotics/build/interference.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {hashSource, firmwareStatus} from '../src/robotics/mcu/compiler/state.ts';
import {qRotate} from '../src/robotics/project/math.ts';
await RAPIER.init();
const pass = s => console.log('PASS', s);
const ID = 'robot-oruga-radar', p = buildTemplate(ID);
const defs = id => p.parts.filter(x => x.definitionId === id), def = id => p.parts.find(x => x.definitionId === id), arms = defs('robot-arm'), uno = def('arduino-uno-r3'), servo = def('servo-sg90'), head = def('robot-head'), oled = def('oled-ssd1306'), sensor = def('hc-sr04');
const yawOf = q => { const f = qRotate(q, [0, 0, 1]); return Math.atan2(f[0], f[2]) * 180 / Math.PI; };
/** Elevación del brazo sobre la horizontal en grados (+ = hacia arriba); en reposo apunta hacia adelante (0°). */
const tiltOf = q => { const d = qRotate(q, [0, -1, 0]); return Math.asin(Math.max(-1, Math.min(1, d[1]))) * 180 / Math.PI; };

{ // 1. Armado, cableado y programa
  assert.ok(TEMPLATES.some(t => t.id === ID), 'está en la lista de plantillas');
  assert.equal(p.parts.length, 31); assert.equal(p.attachments.length, 30); assert.equal(p.connections.length, 65);
  const count = id => defs(id).length; assert.deepEqual([count('servo-sg90'), count('robot-arm'), count('robot-forearm'), count('robot-claw'), count('robot-head'), count('robot-torso'), count('track-belt')], [7, 2, 2, 2, 1, 1, 2]);
  assert.deepEqual(diagnose(p).map(d => d.message), [], 'sin diagnósticos');
  assert.deepEqual(findInterferences(p), [], 'sin interferencias (la banda rodea a la rueda motriz a propósito)');
  const fw = p.firmware[0]; assert.equal(fw.source, TRACKED_SKETCH); assert.equal(firmwareStatus(fw, hashSource(fw.source)), 'fresh');
  assert.equal(TRACKED_SKETCH, fs.readFileSync('qa/fixtures/robotica/sketches/oruga_radar.ino', 'utf8')); assert.equal(TRACKED_HEX, fs.readFileSync('qa/fixtures/robotica/oruga_radar.hex', 'utf8'));
  assert.ok(TRACKED_SKETCH.includes('#include <Servo.h>') && TRACKED_SKETCH.includes('#include <Adafruit_SSD1306.h>'));
  pass('plantilla: 31 piezas (orugas, torso, cuello, cabeza, 2 brazos con hombro, codo y pinza: 7 servos, protoboard y dos reguladores de 5 V), 30 uniones, 65 cables, sin diagnósticos ni interferencias; programa con Servo + Adafruit al día y coincide con qa/');
}

// 2. Simulación completa con física: 14 s virtuales, registrando lo que pasa
const phys = RobotPhysics.create(RAPIER, p), c = new Coordinator({project: p, targetId: uno.instanceId, hex: p.firmware[0].artifact.hex, physics: true}, phys);
assert.equal(c.snapshot().status, 'running', c.snapshot().message);
const log = [], lit = f => { let n = 0; for (const b of f) for (let k = 0; k < 8; k++) n += (b >> k) & 1; return n; };
for (let t = 0; t < 14000; t += 20) {
  c.advance(20000); const s = c.snapshot(), f = s.physics, ch = f.poses[p.parts[0].instanceId], hd = f.poses[head.instanceId], sv = s.servos[servo.instanceId], d = s.displays[oled.instanceId];
  log.push({t, p: f.main.p, yaw: yawOf(ch.q), headYaw: yawOf(hd.q), neck: sv.angle, lit: lit(d.frame), version: d.version, braking: Object.values(s.motors).every(m => m.braking), omega: f.wheels.map(w => w.omega), sensorDist: s.sensors[sensor.instanceId].distance, rayDir: f.sensors[sensor.instanceId]?.dir, armL: tiltOf(f.poses[arms[0].instanceId].q), armR: tiltOf(f.poses[arms[1].instanceId].q)});
}
const first = log[0], moving = log.find(l => l.t > 1000 && l.p[2] > 0.3);

{ // 2a. Avanza por las orugas (las ruedas motrices giran) y frena ante la caja sin tocarla
  assert.ok(moving, 'avanza'); assert.ok(log.some(l => l.omega.every(w => w > 8)), 'las dos ruedas motrices giran');
  const stop = log.find(l => l.braking && l.p[2] > 0.4); assert.ok(stop, 'frena'); const gap = 0.9 - (stop.p[2] + 0.105);
  assert.ok(stop.p[2] < 0.75 && gap > 0.1, `frena con ${(gap * 100).toFixed(0)} cm libres hasta la caja (z=${stop.p[2].toFixed(2)})`);
  pass(`avanza con las orugas (ruedas a ${Math.max(...log.map(l => l.omega[0])).toFixed(0)} rad/s), frena con el motor en corto y se detiene a ${(gap * 100).toFixed(0)} cm de la caja`);
}
{ // 2b. El cuello gira la cabeza y el radar mira donde mira la cabeza
  const left = log.filter(l => l.neck > 159), right = log.filter(l => l.neck < 21);
  assert.ok(left.length > 3 && right.length > 3, 'el cuello llega a ±70°');
  const l = left[0], r = right[0]; assert.ok(Math.abs((l.headYaw - l.yaw) - 70) < 4, `cabeza 70° a la izquierda (${(l.headYaw - l.yaw).toFixed(1)}°)`); assert.ok(Math.abs((r.headYaw - r.yaw) + 70) < 4, `cabeza 70° a la derecha (${(r.headYaw - r.yaw).toFixed(1)}°)`);
  const straight = log.find(x => Math.abs(x.neck - 90) < 1 && x.t > 500); assert.ok(Math.abs(straight.headYaw - straight.yaw) < 2, 'cabeza al frente con el cuello a 90°');
  // El rayo del HC-SR04 sale girado igual que la cabeza (relativo al chasis)
  const ray = l.rayDir, chassisYaw = l.yaw, rayYaw = Math.atan2(ray[0], ray[2]) * 180 / Math.PI; assert.ok(Math.abs(rayYaw - chassisYaw - 70) < 5, `el radar mira a ${(rayYaw - chassisYaw).toFixed(0)}° del frente`);
  pass(`cuello: la cabeza gira +${(l.headYaw - l.yaw).toFixed(0)}° y ${(r.headYaw - r.yaw).toFixed(0)}° respecto del chasis y el rayo del HC-SR04 va ${(rayYaw - chassisYaw).toFixed(0)}° (el radar mide donde mira la cabeza)`);
}
{ // 2b'. Los brazos: cuelgan quietos (−90° respecto de la horizontal), se levantan al sorprenderse y vuelven a colgar, siempre simétricos
  const rest = log.find(l => l.t > 500 && l.t < 1500); assert.ok(Math.abs(rest.armL + 90) < 6 && Math.abs(rest.armR + 90) < 6, `brazos colgando al avanzar (${rest.armL.toFixed(0)}°, ${rest.armR.toFixed(0)}°)`);
  const up = log.filter(l => l.armL > -55); assert.ok(up.length > 5, 'levanta los brazos'); // En pleno movimiento los dos servos reciben sus pulsos con unos milisegundos de diferencia (a 600°/s son unos grados); lo que importa es que lleguen al mismo ángulo.
  assert.ok(up.every(l => Math.abs(l.armL - l.armR) < 15), 'los dos brazos suben a la vez'); assert.ok(Math.abs(Math.max(...up.map(l => l.armL)) - Math.max(...up.map(l => l.armR))) < 2, 'y llegan al mismo ángulo (espejo)');
  assert.ok(log.some(l => l.t > up[0].t && Math.abs(l.armL + 90) < 6 && Math.abs(l.armR + 90) < 6), 'vuelven a colgar');
  assert.ok(Math.max(...up.map(l => l.armL)) < -20, 'sin pasarse de −20° (adelantan el brazo unos 50° desde que cuelga)');
  pass(`brazos: cuelgan al avanzar, suben hasta ${Math.max(...up.map(l => l.armL)).toFixed(0)}° al sorprenderse (los dos igual, en espejo) y vuelven a colgar`);
}
{ // 2c. Decide girar hacia el lado libre (la derecha: la pared está a la izquierda)
  const end = log.at(-1); const turned = log.filter(l => l.t > 3000 && l.t < 7000).map(l => l.yaw); assert.ok(Math.min(...turned) < -30, `giró a la derecha (${Math.min(...turned).toFixed(0)}°)`);
  const avoided = log.find(l => l.t > 5000); assert.ok(avoided.p[0] < -0.1, `se desvió hacia la derecha (x = ${avoided.p[0].toFixed(2)})`);
  assert.ok(log.every(l => !(l.p[2] > 0.75 && Math.abs(l.p[0]) < 0.3)), 'nunca entró en la zona de la caja');
  pass(`elige el lado libre: la izquierda tiene pared, gira ${Math.min(...turned).toFixed(0)}° a la derecha y esquiva la caja`);
}
{ // 2d. La cara reacciona: sorpresa al detenerse y vuelve a la normal
  const normal = log.find(l => l.t >= 1000).lit, surprise = Math.max(...log.map(l => l.lit)), distinct = new Set(log.map(l => l.lit)).size;
  assert.ok(normal > 1200 && normal < 2400, `cara normal (${normal} píxeles)`); assert.ok(surprise > normal + 150, `cara de sorpresa más grande (${surprise} contra ${normal})`);
  assert.ok(distinct >= 3, `al menos tres caras distintas (${distinct})`); assert.ok(log.some(l => l.t > 3000 && Math.abs(l.lit - normal) < 40), 'vuelve a la cara normal');
  pass(`cara: normal ${normal} px → sorpresa ${surprise} px → mirar a un lado → normal otra vez (${distinct} imágenes distintas, ${log.at(-1).version} bytes escritos por I²C)`);
}
phys.dispose();

{ // 3. Si el servo del cuello no tiene energía, la cabeza no gira (y el programa sigue)
  const bare = {...p, connections: p.connections.filter(x => ![x.a, x.b].some(r => r.instanceId === servo.instanceId && r.pinId === 'VCC'))};
  assert.ok(diagnose(bare).some(d => d.code === 'unpowered-device' && /servo/i.test(d.message)));
  const ph = RobotPhysics.create(RAPIER, bare), c2 = new Coordinator({project: bare, targetId: uno.instanceId, hex: bare.firmware[0].artifact.hex, physics: true}, ph);
  let maxTurn = 0; for (let t = 0; t < 6000; t += 20) { c2.advance(20000); const f = c2.snapshot().physics; maxTurn = Math.max(maxTurn, Math.abs(yawOf(f.poses[head.instanceId].q) - yawOf(f.poses[p.parts[0].instanceId].q))); }
  ph.dispose(); assert.ok(maxTurn < 2, `sin energía la cabeza no gira (${maxTurn.toFixed(1)}°)`);
  pass('sin 5 V en el servo el cuello no se mueve: la cabeza queda mirando al frente y el diagnóstico avisa');
}

{ // 4. Variante «recoge cubos»: el programa agarra, levanta y suelta dos cubos físicos, uno con cada mano
  const PID = 'robot-oruga-recoger', q = buildTemplate(PID); assert.ok(TEMPLATES.some(t => t.id === PID), 'está en la lista de plantillas');
  assert.equal(q.parts.length, 31); assert.equal(q.connections.length, 65); assert.deepEqual(diagnose(q).map(d => d.message), []);
  assert.deepEqual(q.scene.obstacles.map(o => [o.id, o.movable]).sort(), [['cubo-derecho', true], ['cubo-izquierdo', true]]);
  const fw = q.firmware[0]; assert.equal(fw.source, PICK_SKETCH); assert.equal(PICK_SKETCH, fs.readFileSync('qa/fixtures/robotica/sketches/oruga_recoger.ino', 'utf8')); assert.equal(PICK_HEX, fs.readFileSync('qa/fixtures/robotica/oruga_recoger.hex', 'utf8'));
  const unoQ = q.parts.find(x => x.definitionId === 'arduino-uno-r3'), ph = RobotPhysics.create(RAPIER, q), cq = new Coordinator({project: q, targetId: unoQ.instanceId, hex: fw.artifact.hex, physics: true}, ph);
  assert.equal(cq.snapshot().status, 'running', cq.snapshot().message);
  const rows = []; for (let t = 0; t < 12000; t += 20) { cq.advance(20000); const o = cq.snapshot().physics.objects; rows.push({t, izq: o['cubo-izquierdo'], der: o['cubo-derecho'], face: lit(cq.snapshot().displays[q.parts.find(x => x.definitionId === 'oled-ssd1306').instanceId].frame)}); }
  ph.dispose();
  for (const side of ['izq', 'der']) {
    const held = rows.filter(r => r[side].heldBy), cube = rows.map(r => r[side]);
    assert.ok(held.length > 40, `${side}: lo agarra (${held.length} muestras)`);
    assert.ok(Math.max(...held.map(r => r[side].p[1])) > 0.06, `${side}: lo levanta al menos 4 cm del suelo (${(Math.max(...held.map(r => r[side].p[1])) * 100).toFixed(1)} cm)`);
    const last = rows.at(-1)[side]; assert.ok(!last.heldBy && last.p[1] > 0.01 && last.p[1] < 0.025, `${side}: termina suelto sobre el suelo (y = ${(last.p[1] * 100).toFixed(1)} cm)`);
    assert.ok(Math.abs(last.p[0]) > 0.12 && Math.abs(last.p[0]) < 0.17 && last.p[2] > 0.04 && last.p[2] < 0.12, `${side}: queda cerca de donde estaba (${last.p.map(v => (v * 100).toFixed(0))} cm)`);
    assert.equal(cube[0].heldBy, null);
  }
  assert.ok(new Set(rows.map(r => r.face)).size >= 2, 'la cara cambia a contenta al agarrar');
  pass(`recoge cubos: los dos cubos se agarran (${rows.filter(r => r.izq.heldBy).length * 20} ms la mano izquierda), se levantan hasta ${(Math.max(...rows.filter(r => r.izq.heldBy).map(r => r.izq.p[1])) * 100).toFixed(0)} cm y se sueltan sobre el suelo; la cara cambia`);
}
console.log('PASS verify-robotics-tracked');
