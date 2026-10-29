// Regenera los .hex de prueba a partir de sketches/*.ino con el servicio de compilación local (necesita .cache/arduino-cli).
// Los .hex se versionan para que las pruebas NO dependan del compilador. Uso: node qa/fixtures/robotica/build-fixtures.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compile} from '../../../scripts/robotica-compile-service.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), dir = path.join(here, 'sketches');
const manifest = {generatedWith: 'arduino-cli 1.5.1 · arduino:avr 1.8.8 (arduino:avr:uno)', note: 'Compilados con scripts/robotica-compile-service.mjs. Contienen el núcleo de Arduino (LGPL-2.1); solo se usan como datos de prueba.', files: {}};
for (const file of (await fs.readdir(dir)).filter(f => f.endsWith('.ino')).sort()) {
  const name = file.replace(/\.ino$/, ''), source = await fs.readFile(path.join(dir, file), 'utf8');
  const r = await compile(source);
  if (name === 'bad_syntax') {
    if (r.status !== 422) throw new Error('bad_syntax debía fallar');
    await fs.writeFile(path.join(here, 'bad_syntax.errors.json'), JSON.stringify(r.body, null, 2)); manifest.files[name] = {errors: r.body.errors.length}; console.log(name, 'errores', r.body.errors.length); continue;
  }
  if (r.status !== 200) throw new Error(`${name}: ${JSON.stringify(r.body)}`);
  await fs.writeFile(path.join(here, `${name}.hex`), r.body.hex); manifest.files[name] = {flashBytes: r.body.sizeBytes, ms: r.ms}; console.log(name, r.body.sizeBytes, 'B', r.ms, 'ms');
}
await fs.writeFile(path.join(here, 'manifest.json'), JSON.stringify(manifest, null, 2));
