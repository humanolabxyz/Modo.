// Compila qa/fixtures/robotica/sketches/oruga_radar.ino (servicio local de arduino-cli: necesita Servo, Adafruit SSD1306, Adafruit GFX y Adafruit BusIO en .cache/arduino-cli)
// y regenera el .hex y src/robotics/project/trackedSketch.ts del robot de orugas. Uso: node qa/fixtures/robotica/build-tracked.mjs
import fs from 'node:fs/promises';
import {compile} from '../../../scripts/robotica-compile-service.mjs';

const here = new URL('./', import.meta.url);
const built = {};
for (const name of ['oruga_radar', 'oruga_recoger']) {
  const source = await fs.readFile(new URL(`sketches/${name}.ino`, here), 'utf8'), r = await compile(source);
  if (r.status !== 200) throw new Error(`${name}: ${JSON.stringify(r.body)}`);
  await fs.writeFile(new URL(`${name}.hex`, here), r.body.hex); built[name] = {source, hex: r.body.hex}; console.log(name, r.body.sizeBytes, 'B', r.ms, 'ms');
}
const ts = `// GENERADO por qa/fixtures/robotica/build-tracked.mjs desde sketches/oruga_radar.ino y sketches/oruga_recoger.ino y sus .hex (arduino-cli, arduino:avr:uno, bibliotecas Servo, Adafruit SSD1306 y GFX). No editar a mano:
// la prueba verify-robotics-tracked.mjs comprueba que sigan coincidiendo con los archivos de qa/.
export const TRACKED_SKETCH = ${JSON.stringify(built.oruga_radar.source)};
export const TRACKED_HEX = ${JSON.stringify(built.oruga_radar.hex)};
export const PICK_SKETCH = ${JSON.stringify(built.oruga_recoger.source)};
export const PICK_HEX = ${JSON.stringify(built.oruga_recoger.hex)};
`;
await fs.writeFile(new URL('../../../src/robotics/project/trackedSketch.ts', here), ts);
