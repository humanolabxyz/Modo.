// Compila cada paso de las guías de programación (src/robotics/guide/programGuides.ts) con el servicio local de arduino-cli y escribe
// src/robotics/guide/programHex.generated.ts: sha256(código) → .hex. Se versiona para que las guías funcionen sin servicio de compilación.
// Uso: node qa/fixtures/robotica/build-guide-programs.mjs   (necesita .cache/arduino-cli con la biblioteca Servo solo si algún paso la usa)
import fs from 'node:fs/promises';
import {compile} from '../../../scripts/robotica-compile-service.mjs';
import {PROGRAM_GUIDES} from '../../../src/robotics/guide/programGuides.ts';
import {hashSource} from '../../../src/robotics/mcu/compiler/state.ts';

const out = {};
for (const guide of PROGRAM_GUIDES) for (const step of guide.steps) {
  const key = hashSource(step.source);
  if (out[key]) continue;
  const r = await compile(step.source);
  if (r.status !== 200) throw new Error(`${guide.id}/${step.id}: ${JSON.stringify(r.body)}`);
  out[key] = r.body.hex; console.log(guide.id, step.id, r.body.sizeBytes, 'B', r.ms, 'ms');
}
const body = `// GENERADO por qa/fixtures/robotica/build-guide-programs.mjs (arduino-cli, arduino:avr:uno). No editar a mano.\n// sha256 del código de cada paso → .hex compilado. La prueba verify-robotics-program-guide.mjs comprueba que sigan coincidiendo.\nexport const PROGRAM_HEX: Readonly<Record<string, string>> = ${JSON.stringify(out, null, 1)};\n`;
await fs.writeFile(new URL('../../../src/robotics/guide/programHex.generated.ts', import.meta.url), body);
console.log('escrito', Object.keys(out).length, 'programas');
