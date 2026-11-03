// Robótica · pantalla OLED como pieza del robot: el programa con Adafruit_SSD1306 dibuja una cara SOLO si la pantalla está alimentada y cableada a A4 (SDA) y A5 (SCL).
//   Uso: node qa/verify-robotics-display.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {addPart, connect, disconnect, setPartProp} from '../src/robotics/project/commands.ts';
import {Coordinator, STEP_US} from '../src/robotics/sim/coordinator.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {solve} from '../src/robotics/circuit/solve.ts';
const pass = s => console.log('PASS', s);
const ok = r => { if ('error' in r) throw new Error(r.error); return r.project; };
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const advance = (c, ms) => { for (let t = 0; t < ms; t += 2) c.advance(STEP_US); };

/** Robot 2 ruedas con una pantalla OLED cableada (SDA→A4, SCL→A5, VCC→5V, GND→GND) y sin programa propio. */
function robotWithDisplay({sda = 'A4', scl = 'A5', power = true} = {}) {
  let p = {...buildTemplate('robot-2-ruedas-listo'), firmware: []};
  p = ok(addPart(p, 'oled-ssd1306', [0, 0.3, 0])); const oled = p.parts.at(-1).instanceId, uno = p.parts.find(x => x.definitionId === 'arduino-uno-r3').instanceId;
  const wire = (a, ap, b, bp) => { p = ok(connect(p, {instanceId: a, pinId: ap}, {instanceId: b, pinId: bp}, '#2a67a3')); };
  wire(oled, 'SDA', uno, sda); wire(oled, 'SCL', uno, scl);
  if (power) { wire(oled, 'VCC', uno, '5V'); wire(oled, 'GND', uno, 'GND.3'); }
  return {p, oled, uno};
}
const frameLit = f => { let n = 0; for (const b of f) for (let k = 0; k < 8; k++) n += (b >> k) & 1; return n; };
const px = (f, x, y) => (f[y * 16 + (x >> 3)] >> (7 - (x & 7))) & 1;

{ // 1. Bien cableada: aparece la cara
  const {p, oled, uno} = robotWithDisplay(), c = new Coordinator({project: p, targetId: uno, hex: hex('oled_eyes')});
  assert.equal(c.snapshot().status, 'running', c.snapshot().message); advance(c, 1500);
  const d = c.snapshot().displays[oled]; assert.ok(d.powered && d.linked && !d.reason, 'alimentada y en el bus'); assert.equal(d.on, true); assert.equal(d.address, 0x3c);
  assert.equal(px(d.frame, 38, 14), 1, 'borde del ojo'); assert.equal(px(d.frame, 38, 24), 0, 'pupila'); assert.equal(px(d.frame, 64, 53), 1, 'boca'); assert.equal(px(d.frame, 2, 2), 0);
  const lit = frameLit(d.frame); assert.ok(lit > 1200 && lit < 2600, `píxeles (${lit})`);
  const again = c.snapshot().displays[oled]; assert.equal(again.frame, d.frame, 'misma referencia si no cambió: no se recalcula');
  pass(`pantalla bien cableada (SDA→A4, SCL→A5): el programa Adafruit dibuja la cara (${lit} píxeles, versión ${d.version})`);
  assert.deepEqual(diagnose(p, solve(p)).filter(x => /pantalla|I²C|SDA|SCL/.test(x.message)), [], 'sin avisos de la pantalla');
}
{ // 2. SDA y SCL cruzados (A5 y A4): no responde, y el diagnóstico dice qué corregir
  const {p, oled, uno} = robotWithDisplay({sda: 'A5', scl: 'A4'}), c = new Coordinator({project: p, targetId: uno, hex: hex('oled_eyes')});
  advance(c, 1500); const d = c.snapshot().displays[oled];
  assert.equal(d.linked, false); assert.match(d.reason, /A4/); assert.equal(d.dataBytes, 0); assert.equal(frameLit(d.frame), 0, 'pantalla en negro');
  const msgs = diagnose(p, solve(p)).filter(x => x.code === 'i2c-wrong-pin'); assert.equal(msgs.length, 2); assert.match(msgs[0].message, /A4|A5/);
  pass(`SDA y SCL cruzados: la pantalla queda en negro («${d.reason}») y se avisa en los dos pines`);
}
{ // 3. Sin alimentación: no responde (un módulo sin energía no contesta en el bus)
  const {p, oled, uno} = robotWithDisplay({power: false}), c = new Coordinator({project: p, targetId: uno, hex: hex('oled_eyes')});
  advance(c, 1500); const d = c.snapshot().displays[oled]; assert.equal(d.powered, false); assert.equal(d.linked, false); assert.equal(frameLit(d.frame), 0);
  assert.ok(diagnose(p, solve(p)).some(x => x.code === 'unpowered-device' && /pantalla/.test(x.message)));
  pass('sin VCC/GND la pantalla no responde y el diagnóstico lo dice');
}
{ // 4. SDA sin cable: aviso de pin sin conectar
  let {p, oled, uno} = robotWithDisplay(); const sda = p.connections.find(c => [c.a, c.b].some(r => r.instanceId === oled && r.pinId === 'SDA'));
  p = disconnect(p, sda.id); assert.ok(diagnose(p, solve(p)).some(x => x.code === 'sensor-pin-unconnected' && /SDA/.test(x.message)));
  pass('SDA sin cable: aviso «sin conectar»');
}
{ // 5. Dirección 0x3D: solo responde si el programa la usa
  let {p, oled, uno} = robotWithDisplay(); p = setPartProp(p, oled, 'address', 61);
  const c = new Coordinator({project: p, targetId: uno, hex: hex('oled_eyes')}); advance(c, 1500);
  const d = c.snapshot().displays[oled]; assert.equal(d.address, 0x3d); assert.equal(d.dataBytes, 0, 'el programa le habla a 0x3C: la pantalla en 0x3D no responde');
  pass('pantalla en 0x3D: no responde a un programa que usa 0x3C (como en un robot real)');
}
console.log('PASS verify-robotics-display');
