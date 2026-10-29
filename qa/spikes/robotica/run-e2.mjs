// SPIKE E2 · Mide la compilación local con arduino-cli y comprueba los límites de seguridad del prototipo.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compile, createServer, LIMITS, checkSource} from './compile-server.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../../..');
const hexDir = path.join(root, '.cache/spikes-robotica/hex'), results = path.join(here, 'results');
await fs.mkdir(hexDir, {recursive: true}); await fs.mkdir(results, {recursive: true});
const sketch = async name => fs.readFile(path.join(here, 'sketches', name, `${name}.ino`), 'utf8');
const report = {date: new Date().toISOString(), cli: 'arduino-cli 1.5.1 · arduino:avr 1.8.8', compiles: [], errors: null, security: [], http: {}, toolchain: {}};
const log = (...a) => console.log(...a);

// 1) Compilaciones: la primera es en frío (construye el núcleo), el resto reutiliza la caché.
const plan = [['blink', ''], ['pwm', '-DV=64'], ['pwm', '-DV=128'], ['pwm', '-DV=192'], ['pulse', ''], ['serial_adc', ''], ['robot_like', ''], ['blink', '']];
for (const [name, flags] of plan) {
  const r = await compile(await sketch(name), {extraFlags: flags});
  assert.equal(r.status, 200, `${name} ${flags}: ${JSON.stringify(r.body)}`);
  const file = `${name}${flags ? flags.replace('-DV=', '_') : ''}.hex`;
  await fs.writeFile(path.join(hexDir, file), r.body.hex);
  report.compiles.push({sketch: file, ms: r.ms, flashBytes: r.body.sizeBytes, hexBytes: r.body.hex.length, warnings: r.body.warnings.length});
  log(`compilar ${file}: ${r.ms} ms · ${r.body.sizeBytes} B de flash`);
}

// 2) Errores con número de línea
const bad = await compile(await sketch('bad_syntax'));
assert.equal(bad.status, 422); assert.ok(bad.body.errors.length >= 2, JSON.stringify(bad.body));
const lines = bad.body.errors.map(e => e.line); assert.ok(lines.includes(3) && lines.some(l => l >= 5), `líneas ${lines}`);
report.errors = {ms: bad.ms, errors: bad.body.errors}; log('errores con línea:', JSON.stringify(bad.body.errors));

// 3) Límites de seguridad
const cases = [
  ['include de ruta del sistema', '#include </etc/passwd>\nvoid setup(){}void loop(){}', /solo se permiten/],
  ['include con comillas y ..', '#include "../../secreto.h"\nvoid setup(){}void loop(){}', /solo se permiten/],
  ['include de librería fuera de la lista', '#include <SD.h>\nvoid setup(){}void loop(){}', /solo se permiten/],
  ['include por macro', '#define H <stdio.h>\n#include H\nvoid setup(){}void loop(){}', /solo se permiten/],
  ['ensamblador en línea', 'void setup(){asm volatile(".incbin \\"/etc/passwd\\"");}void loop(){}', /ensamblador/],
  ['código demasiado grande', 'void setup(){}void loop(){}\n// ' + 'x'.repeat(LIMITS.sourceBytes), /supera/],
  ['código vacío', '   ', /vacío/],
];
for (const [name, src, expect] of cases) {
  const r = await compile(src); assert.equal(r.status, 400, name); assert.match(r.body.errors[0].message, expect, name);
  report.security.push({case: name, result: 'rechazado', http: 400}); log('rechazado:', name);
}
assert.equal(checkSource('#include <Servo.h>\nvoid setup(){}void loop(){}'), null);
{ const saved = LIMITS.timeoutMs; LIMITS.timeoutMs = 400; const r = await compile(await sketch('robot_like'), {extraFlags: '-DT=1'}); LIMITS.timeoutMs = saved;
  assert.equal(r.status, 504); report.security.push({case: 'tiempo máximo (400 ms de prueba)', result: 'cancelado', http: 504, ms: r.ms}); log('timeout: cancelado en', r.ms, 'ms'); }

// 4) HTTP: valida la forma de la API, la concurrencia y la tasa
const server = createServer(); await new Promise(r => server.listen(0, '127.0.0.1', r)); const url = `http://127.0.0.1:${server.address().port}/api/compile`;
const post = (body, raw) => fetch(url, {method: 'POST', headers: {'content-type': 'application/json'}, body: raw ?? JSON.stringify(body)});
{ const t = performance.now(); const r = await post({source: await sketch('blink'), board: 'arduino-uno-r3'}); const j = await r.json(); assert.equal(r.status, 200); assert.ok(j.ok && j.hex.startsWith(':'));
  report.http.single = {ms: Math.round(performance.now() - t), status: 200}; log('HTTP 1 petición:', report.http.single.ms, 'ms'); }
assert.equal((await post({source: 'x', board: 'mega'})).status, 400); assert.equal((await post(null, '{no json')).status, 400);
assert.equal((await post({source: 'x'.repeat(LIMITS.sourceBytes * 3), board: 'arduino-uno-r3'})).status, 413);
{ const src = await sketch('robot_like'), t = performance.now();
  const rs = await Promise.all([0, 1, 2].map(i => post({source: src + `\n// ${i}`, board: 'arduino-uno-r3'}))); const codes = rs.map(r => r.status).sort();
  report.http.parallel3 = {codes, ms: Math.round(performance.now() - t)}; log('HTTP 3 en paralelo:', codes.join(','), report.http.parallel3.ms, 'ms');
  assert.ok(codes.includes(429), 'la tercera petición simultánea recibe 429'); }
{ let last = 0; for (let i = 0; i < LIMITS.perMinutePerIp + 2; i++) last = (await post({source: '', board: 'arduino-uno-r3'})).status; assert.equal(last, 429); report.http.rateLimit = 'tras ' + LIMITS.perMinutePerIp + ' peticiones/min → 429'; log('límite de tasa:', report.http.rateLimit); }
server.close();

// 5) Tamaño de la cadena de herramientas instalada
async function size(dir) { let n = 0; for (const e of await fs.readdir(dir, {withFileTypes: true}).catch(() => [])) { const p = path.join(dir, e.name); n += e.isDirectory() ? await size(p) : (await fs.stat(p)).size; } return n; }
const data = path.join(root, '.cache/arduino-cli/data');
report.toolchain = {'arduino-cli.exe (MB)': +((await fs.stat(path.join(root, '.cache/arduino-cli/bin/arduino-cli.exe'))).size / 1e6).toFixed(1), 'packages instalados (MB)': +((await size(path.join(data, 'packages'))) / 1e6).toFixed(0), 'datos totales con índices (MB)': +((await size(data)) / 1e6).toFixed(0)};
for (const d of ['arduino/tools/avr-gcc', 'arduino/tools/avrdude', 'arduino/hardware/avr']) report.toolchain[d + ' (MB)'] = +((await size(path.join(data, 'packages', d))) / 1e6).toFixed(0);
log('cadena de herramientas:', JSON.stringify(report.toolchain));
await fs.writeFile(path.join(results, 'e2-compilacion.json'), JSON.stringify(report, null, 2));
log('E2 OK');
