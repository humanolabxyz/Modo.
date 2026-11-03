// Robótica · pulsador y potenciómetro: su efecto sale del circuito (resistencias en el solver), no de un valor pegado al programa.
//   Uso: node qa/verify-robotics-controls.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {bench} from './robotics/bench.mjs';
import {connect} from '../src/robotics/project/commands.ts';
import {Coordinator, STEP_US} from '../src/robotics/sim/coordinator.ts';
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const pass = s => console.log('PASS', s);
const ok = r => { if ('error' in r) throw new Error(r.error); return r.project; };
const advance = (c, ms) => { for (let t = 0; t < ms; t += 2) c.advance(STEP_US); };

const run = (p, uno, sketch) => { const c = new Coordinator({project: p, targetId: uno, hex: hex(sketch)}); assert.equal(c.snapshot().status, 'running', c.snapshot().message); return c; };

{ // 1. Pulsador con INPUT_PULLUP: suelto = HIGH (LED apagado); pulsado = LOW (LED encendido); al soltar se apaga
  const {p, ids} = await bench(), c = run(p, ids.uno, 'button_led');
  advance(c, 100); let s = c.snapshot();
  assert.equal(s.leds[ids.led].on, false, 'suelto: LED apagado'); assert.equal(s.controls[ids.button], 0);
  c.setControl(ids.button, 1); advance(c, 100); s = c.snapshot();
  assert.equal(s.leds[ids.led].on, true, 'pulsado: LED encendido'); assert.equal(s.controls[ids.button], 1);
  c.setControl(ids.button, 0); advance(c, 100); s = c.snapshot();
  assert.equal(s.leds[ids.led].on, false, 'soltado: LED apagado');
  pass('pulsador: suelto = HIGH, pulsado = LOW por el circuito real (pull-up 20 kΩ contra 0,1 Ω); el LED sigue al botón');
}
{ // 2. Potenciómetro: analogRead sigue la posición del cursor
  const {p, ids} = await bench(), c = run(p, ids.uno, 'analog_a0'), read = () => { const lines = c.snapshot().serial.trim().split(/\r?\n/).filter(Boolean); return Number(lines.at(-1)); };
  advance(c, 300); c.snapshot(); advance(c, 200); const mid = read();
  assert.ok(Math.abs(mid - 512) < 12, `centro ≈ 512 (${mid})`);
  const reads = [];
  for (const pos of [0, 0.25, 0.75, 1]) { c.setControl(ids.pot, pos); advance(c, 300); c.snapshot(); advance(c, 200); reads.push([pos, read()]); }
  for (const [pos, v] of reads) assert.ok(Math.abs(v - pos * 1023) < 14, `posición ${pos} → ${v} (esperado ≈ ${Math.round(pos * 1023)})`);
  pass(`potenciómetro: analogRead = ${reads.map(([pos, v]) => `${pos}→${v}`).join(', ')} (centro ${mid})`);
}
{ // 3. Potenciómetro sin alimentar: el cursor queda en 0 V
  const {p, ids} = await bench({pot: false});
  const wired = ok(connect(p, {instanceId: ids.pot, pinId: 'OUT'}, {instanceId: ids.uno, pinId: 'A0'}, '#2a67a3')), c = run(wired, ids.uno, 'analog_a0');
  advance(c, 500); const lines = c.snapshot().serial.trim().split(/\r?\n/).filter(Boolean);
  assert.ok(Number(lines.at(-1)) < 5, `sin VCC/GND no hay tensión en el cursor (${lines.at(-1)})`);
  pass('potenciómetro con OUT en A0 pero sin 5 V ni GND: analogRead ≈ 0');
}
{ // 4. Servo gobernado por el potenciómetro: todo el camino pot → ADC → programa → pulso → eje
  const {p, ids} = await bench(), c = run(p, ids.uno, 'servo_pot');
  for (const [pos, deg] of [[0, 0], [0.5, 90], [1, 180], [0.25, 45]]) {
    c.setControl(ids.pot, pos); advance(c, 700); const s = c.snapshot().servos[ids.servo];
    assert.ok(Math.abs(s.angle - deg) < 3, `pot ${pos} → servo ${s.angle.toFixed(1)}° (esperado ${deg}°)`);
  }
  pass('potenciómetro → analogRead → map() → Servo.write → pulso → eje: 0, 90, 180 y 45° (±3°)');
}
{ // 5. Ids que no son controles se ignoran
  const {p, ids} = await bench(), c = run(p, ids.uno, 'button_led'); c.setControl('no-existe', 1); c.setControl(ids.uno, 1);
  assert.deepEqual(Object.keys(c.snapshot().controls).sort(), [ids.button, ids.pot].sort());
  pass('setControl ignora piezas que no son controles');
}
console.log('PASS verify-robotics-controls');
