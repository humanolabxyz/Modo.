// Robótica · I²C y pantalla SSD1306 en el emulador AVR: un programa con Wire inicializa la pantalla y dibuja; la memoria de la pantalla debe quedar exactamente como la escribió.
//   Uso: node qa/verify-robotics-i2c.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {AvrRuntime} from '../src/robotics/mcu/avr/runtime.ts';
import {Ssd1306, OLED_WIDTH, OLED_HEIGHT} from '../src/robotics/mcu/i2c/ssd1306.ts';
const pass = s => console.log('PASS', s);
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const bus = {writeDigital() {}, setPinMode() {}, serial() {}};
const run = (name, devices, ms) => { const r = new AvrRuntime(); assert.deepEqual(r.load(hex(name)), {ok: true}); for (const [a, d] of devices) r.attachI2c(a, d); const res = r.runUntil(ms * 1000, bus); assert.equal(res, 'running'); return r; };

{ // 1. El programa inicializa la pantalla y llena la memoria con el patrón exacto
  const oled = new Ssd1306(); run('oled_wire', [[0x3c, oled]], 400);
  assert.equal(oled.on, true, 'la pantalla quedó encendida (0xAF)'); assert.equal(oled.addressing, 'horizontal'); assert.equal(oled.contrast, 0xcf); assert.equal(oled.flipX, true); assert.equal(oled.flipY, true);
  assert.equal(oled.dataBytes, 1024, 'llegaron los 1024 bytes de datos'); assert.equal(oled.commandBytes, 31, 'los 31 comandos de inicialización y ventana');
  for (let b = 0; b < 64; b++) for (let j = 0; j < 16; j++) assert.equal(oled.ram[b * 16 + j], b % 2 ? 0xf0 : 0x0f, `byte ${b * 16 + j}`);
  pass(`la memoria de la pantalla coincide byte a byte con lo que escribió el programa (${oled.dataBytes} datos, ${oled.commandBytes} comandos)`);
  // Con A1/C8 (los ajustes de Adafruit) la imagen sale derecha: el píxel (0,0) es el bit 0 de la primera columna de la página 0
  assert.equal(oled.pixel(0, 0), (oled.ram[0] & 1) === 1); assert.equal(oled.pixel(127, 63), ((oled.ram[7 * OLED_WIDTH + 127] >> 7) & 1) === 1);
  const lit = oled.litPixels(); assert.equal(lit, OLED_WIDTH * OLED_HEIGHT / 2, `la mitad de los píxeles encendidos (${lit})`);
  assert.equal(oled.image().reduce((a, b) => a + b, 0), lit);
  pass(`imagen: ${lit} de ${OLED_WIDTH * OLED_HEIGHT} píxeles encendidos, con A1/C8 (imagen derecha)`);
}
{ // 2. Sin pantalla conectada, el bus da NACK y el programa sigue (como un módulo mal cableado)
  const oled = new Ssd1306(); const r = run('oled_wire', [], 400); // sin attach
  assert.equal(oled.dataBytes, 0); assert.equal(r.nowUs > 0, true);
  pass('sin dispositivo en 0x3C no llega nada y el programa no se cuelga (NACK)');
}
{ // 3. Otra dirección: solo responde la que corresponde
  const oled = new Ssd1306(); run('oled_wire', [[0x3d, oled]], 400); assert.equal(oled.dataBytes, 0);
  pass('una pantalla en 0x3D no recibe lo dirigido a 0x3C');
}
{ // 4. Reinicio del chip: la pantalla sigue conectada
  const oled = new Ssd1306(), r = new AvrRuntime(); r.load(hex('oled_wire')); r.attachI2c(0x3c, oled); r.runUntil(400000, bus); const first = oled.dataBytes; r.reset(); r.runUntil(400000, bus);
  assert.equal(oled.dataBytes, first * 2); pass('tras reiniciar el chip la pantalla sigue en el bus');
}
{ // 5. El programa REAL con Adafruit_SSD1306 + Adafruit_GFX dibuja una cara: ojos con pupila y boca
  const oled = new Ssd1306(); run('oled_eyes', [[0x3c, oled]], 1500);
  assert.equal(oled.on, true, 'Adafruit encendió la pantalla'); assert.ok(oled.dataBytes >= 1024, `llegó al menos un cuadro completo (${oled.dataBytes} bytes)`);
  const at = (x, y) => oled.pixel(x, y);
  assert.equal(at(38, 14), true, 'borde del ojo izquierdo encendido'); assert.equal(at(38, 24), false, 'pupila izquierda apagada');
  assert.equal(at(90, 14), true, 'borde del ojo derecho encendido'); assert.equal(at(90, 24), false, 'pupila derecha apagada');
  assert.equal(at(64, 53), true, 'boca encendida'); assert.equal(at(64, 40), false, 'entre ojos y boca, apagado'); assert.equal(at(2, 2), false, 'esquina apagada');
  let mirrored = 0; for (let y = 0; y < OLED_HEIGHT; y++) for (let x = 0; x < OLED_WIDTH; x++) if (at(x, y) === at(128 - x, y)) mirrored++;
  const lit = oled.litPixels(); assert.ok(lit > 1200 && lit < 2600, `píxeles encendidos plausibles (${lit})`);
  pass(`Adafruit_SSD1306 + GFX dibujan la cara: ojos con pupila y boca (${lit} píxeles, ${oled.dataBytes} bytes enviados por I²C)`);
  const none = new Ssd1306(); run('oled_eyes', [], 1500); assert.equal(none.dataBytes, 0);
  pass('sin pantalla en el bus, el programa con Adafruit no se cuelga');
}
console.log('PASS verify-robotics-i2c');
