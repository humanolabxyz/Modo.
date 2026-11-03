// Robótica · servo SG90: el ángulo sale del ancho REAL del pulso que genera la biblioteca Servo dentro del emulador AVR, no de una animación.
//   Uso: node qa/verify-robotics-servo.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildRobot2wd, wireRobot2wd} from './robotics/robot2wd.mjs';
import {addPart, attach, connect, disconnect, setPartProp} from '../src/robotics/project/commands.ts';
import {Coordinator, STEP_US, SERVO_REST_DEG} from '../src/robotics/sim/coordinator.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {solve} from '../src/robotics/circuit/solve.ts';
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const pass = s => console.log('PASS', s);
const ok = r => { if ('error' in r) throw new Error(r.error); return r.project; };

/** Robot de 2 ruedas + servo en una columna trasera del chasis, cableado a D11, 5 V y GND. */
async function robotWithServo({wireSignal = true, wirePower = true} = {}) {
  const built = buildRobot2wd(); let p = setPartProp(await wireRobot2wd(built), built.ids.battery, 'voltage', 9);
  const put = (def, pos = [0, 0.5, 0]) => { p = ok(addPart(p, def, pos)); return p.parts.at(-1).instanceId; };
  const join = (a, an, b, bn) => { p = ok(attach(p, {instanceId: a, anchorId: an}, {instanceId: b, anchorId: bn})); };
  const post = put('bracket-generic'), servo = put('servo-sg90');
  join(built.ids.chassis, 'tower-post-rl', post, 'base'); join(post, 'top', servo, 'base');
  const wire = (a, b, c) => { p = ok(connect(p, a, b, c)); };
  const uno = built.ids.uno;
  if (wireSignal) wire({instanceId: servo, pinId: 'SIG'}, {instanceId: uno, pinId: 'D11'}, '#e0a52a');
  if (wirePower) { wire({instanceId: servo, pinId: 'VCC'}, {instanceId: uno, pinId: '5V'}, '#d64545'); wire({instanceId: servo, pinId: 'GND'}, {instanceId: uno, pinId: 'GND.3'}, '#222222'); }
  return {p, servo, uno};
}
const coordinator = (p, uno, sketch) => new Coordinator({project: p, targetId: uno, hex: hex(sketch)});
const advance = (c, ms) => { for (let t = 0; t < ms; t += 2) c.advance(STEP_US); };
const state = (c, id) => c.snapshot().servos[id];
const near = (a, b, tol = 3) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b} (±${tol} µs)`);

{ // 1. Recorre 0° → 90° → 180° con los anchos de pulso reales de la biblioteca Servo
  const {p, servo, uno} = await robotWithServo(), c = coordinator(p, uno, 'servo_angles');
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  assert.equal(state(c, servo).angle, SERVO_REST_DEG, 'antes de cualquier pulso descansa en 90°');
  assert.equal(state(c, servo).target, null);
  advance(c, 900);
  let s = state(c, servo);
  assert.ok(s.powered && s.linked && !s.reason, 'alimentado y conectado');
  near(s.pulseUs, 544); assert.ok(Math.abs(s.angle) < 0.5, `0° (${s.angle.toFixed(1)}°)`);
  pass(`write(0): pulso de ${s.pulseUs} µs → eje en ${s.angle.toFixed(1)}°`);
  advance(c, 150); s = state(c, servo); // t = 1050 ms: el programa pidió 90° a los 1000 ms
  assert.ok(s.angle > 5 && s.angle < 60, `en tránsito, no salta (${s.angle.toFixed(1)}°)`);
  pass(`el eje no salta: 50 ms después del cambio va por ${s.angle.toFixed(1)}° (≈ 600°/s)`);
  advance(c, 850); s = state(c, servo); // t = 2050 ms
  near(s.pulseUs, 1472); assert.ok(Math.abs(s.angle - 90) < 0.5, `90° (${s.angle.toFixed(1)}°)`);
  advance(c, 1000); s = state(c, servo); // t = 3050 ms
  near(s.pulseUs, 2400); assert.ok(Math.abs(s.angle - 180) < 0.5, `180° (${s.angle.toFixed(1)}°)`);
  assert.ok(s.pulses > 140, `unos 50 pulsos por segundo (${s.pulses})`);
  pass(`write(90) → ${1472} µs → 90°; write(180) → ${2400} µs → 180° (${s.pulses} pulsos en 3 s)`);
}
{ // 2. Sin 5 V el servo no se mueve, y el diagnóstico lo explica
  const {p, servo, uno} = await robotWithServo({wirePower: false}), c = coordinator(p, uno, 'servo_angles');
  advance(c, 2500); const s = state(c, servo);
  assert.equal(s.powered, false); assert.equal(s.angle, SERVO_REST_DEG, 'sin alimentación se queda quieto'); assert.ok(s.pulses > 0, 'el programa sí genera pulsos'); assert.match(s.reason, /VCC/);
  const d = diagnose(p, solve(p)).filter(x => x.code === 'unpowered-device' && /servo/i.test(x.message));
  assert.equal(d.length, 1, 'avisa de la falta de alimentación');
  pass(`sin alimentación: ${s.pulses} pulsos pero el eje sigue en ${s.angle}°; diagnóstico: «${d[0].message}»`);
}
{ // 3. Con la señal sin conectar no hay movimiento y se avisa
  const {p, servo, uno} = await robotWithServo({wireSignal: false}), c = coordinator(p, uno, 'servo_angles');
  advance(c, 2500); const s = state(c, servo);
  assert.equal(s.linked, false); assert.equal(s.pulses, 0); assert.equal(s.angle, SERVO_REST_DEG);
  assert.ok(diagnose(p, solve(p)).some(x => x.code === 'sensor-pin-unconnected' && /SIG/.test(x.message)));
  pass('señal sin conectar: el servo no recibe pulsos, no se mueve y el diagnóstico lo indica');
}
{ // 4. GND del servo sin unir al de la placa: sin referencia común no se mueve
  const {p, servo, uno} = await robotWithServo(); const gnd = p.connections.find(c => [c.a, c.b].some(r => r.instanceId === servo && r.pinId === 'GND'));
  const c = coordinator(disconnect(p, gnd.id), uno, 'servo_angles'); advance(c, 2000); const s = state(c, servo);
  assert.equal(s.angle, SERVO_REST_DEG); assert.equal(s.powered, false);
  pass('sin GND común el servo no se mueve');
}
{ // 5. El coste de añadir el servo al paso de simulación es pequeño
  const {p, servo, uno} = await robotWithServo(), c = coordinator(p, uno, 'servo_angles');
  advance(c, 100); const t0 = performance.now(); advance(c, 4000); const perStep = (performance.now() - t0) / 2000;
  assert.ok(state(c, servo).pulses > 0); assert.ok(perStep < 2, `${perStep.toFixed(3)} ms por paso de 2 ms`);
  pass(`paso de simulación con servo: ${perStep.toFixed(3)} ms (sin física)`);
}
console.log('PASS verify-robotics-servo');
