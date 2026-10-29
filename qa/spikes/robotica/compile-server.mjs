// SPIKE E2 · Prototipo LOCAL de POST /api/compile con arduino-cli. No se despliega ni se importa desde src/.
// Uso: node qa/spikes/robotica/compile-server.mjs [puerto]   (por defecto 4777, solo 127.0.0.1)
import http from 'node:http';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const tool = path.join(root, '.cache/arduino-cli');
export const LIMITS = {
  sourceBytes: 64 * 1024,        // mismo tope que Firmware.source del contrato
  timeoutMs: Number(process.env.COMPILE_TIMEOUT_MS || 30000),
  parallel: 2,                    // compilaciones simultáneas; el resto recibe 429
  perMinutePerIp: 20,
  allowedIncludes: ['Arduino.h', 'Servo.h', 'Wire.h', 'SoftwareSerial.h', 'EEPROM.h', 'math.h', 'stdlib.h', 'string.h', 'stdint.h', 'avr/pgmspace.h'],
};

/** Valida el código ANTES de dárselo al compilador. Devuelve un mensaje o null. */
export function checkSource(source) {
  if (typeof source !== 'string' || !source.trim()) return 'El código está vacío.';
  if (Buffer.byteLength(source) > LIMITS.sourceBytes) return `El código supera ${LIMITS.sourceBytes / 1024} KB.`;
  // Lectura de archivos del servidor: solo se admiten #include <...> de una lista cerrada; cualquier otra forma se rechaza.
  for (const [i, line] of source.split('\n').entries()) {
    if (/^\s*#\s*(include|include_next|import)\b/.test(line)) {
      const m = /^\s*#\s*include\s*<([A-Za-z0-9_./]+)>\s*(\/\/.*)?$/.exec(line);
      if (!m || !LIMITS.allowedIncludes.includes(m[1])) return `Línea ${i + 1}: solo se permiten estos #include: ${LIMITS.allowedIncludes.map(n => `<${n}>`).join(', ')}.`;
    }
  }
  if (/__has_include|\bincbin\b|\.incbin|\basm\b|__asm__?\b/.test(source)) return 'No se permite ensamblador en línea ni incrustar archivos.';
  if (/^\s*#\s*pragma\b/m.test(source)) return 'No se permite #pragma.';
  return null;
}

/** Extrae errores de gcc con número de línea del sketch. */
export function parseErrors(text, sketchName) {
  const errors = [], warnings = [];
  for (const m of text.matchAll(/^(.*?[\\/])?([^\\/\n:]+\.ino):(\d+):(?:(\d+):)?\s*(fatal error|error|warning):\s*(.*)$/gm)) {
    if (m[2] !== sketchName + '.ino') continue;
    const item = {line: Number(m[3]), column: m[4] ? Number(m[4]) : undefined, message: m[6].trim()};
    (m[5] === 'warning' ? warnings : errors).push(item);
  }
  return {errors, warnings};
}

function killTree(child) {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {stdio: 'ignore'});
  else try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
}

export async function compile(source, {extraFlags = ''} = {}) {
  const bad = checkSource(source);
  if (bad) return {status: 400, body: {ok: false, errors: [{line: 0, message: bad}]}};
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'modo-compile-'));
  const name = 'sketch', sketchDir = path.join(dir, name), out = path.join(dir, 'out');
  await fs.mkdir(sketchDir); await fs.writeFile(path.join(sketchDir, `${name}.ino`), source);
  const args = ['compile', '--fqbn', 'arduino:avr:uno', '--output-dir', out, '--build-cache-path', path.join(dir, 'cache'), '--warnings', 'default', '--jobs', '1', sketchDir];
  if (extraFlags) args.splice(1, 0, '--build-property', `build.extra_flags=${extraFlags}`);
  const started = performance.now();
  const env = {...process.env, ARDUINO_DIRECTORIES_DATA: path.join(tool, 'data'), ARDUINO_DIRECTORIES_USER: path.join(tool, 'user'), ARDUINO_DIRECTORIES_DOWNLOADS: path.join(tool, 'dl-pkg'), ARDUINO_UPDATER_ENABLE_NOTIFICATION: 'false'};
  const child = spawn(path.join(tool, 'bin/arduino-cli.exe'), args, {env, detached: process.platform !== 'win32', windowsHide: true});
  let log = '', timedOut = false;
  child.stdout.on('data', d => { log += d; }); child.stderr.on('data', d => { log += d; });
  const timer = setTimeout(() => { timedOut = true; killTree(child); }, LIMITS.timeoutMs);
  const code = await new Promise(resolve => { child.on('close', resolve); child.on('error', () => resolve(-1)); });
  clearTimeout(timer);
  const ms = Math.round(performance.now() - started);
  try {
    if (timedOut) return {status: 504, body: {ok: false, errors: [{line: 0, message: `La compilación superó ${LIMITS.timeoutMs / 1000} s y se canceló.`}]}, ms};
    const {errors, warnings} = parseErrors(log, name);
    if (code !== 0) return {status: 422, body: {ok: false, errors: errors.length ? errors : [{line: 0, message: log.split('\n').filter(Boolean).slice(-3).join(' ')}]}, ms};
    const hex = await fs.readFile(path.join(out, `${name}.ino.hex`), 'utf8');
    const size = /(?:Sketch uses|El Sketch usa|usa) (\d+) bytes/i.exec(log);
    return {status: 200, body: {ok: true, hex, sizeBytes: size ? Number(size[1]) : hex.length, warnings: warnings.map(w => `${w.line}: ${w.message}`)}, ms};
  } finally { await fs.rm(dir, {recursive: true, force: true}).catch(() => {}); }
}

export function createServer() {
  let running = 0; const hits = new Map();
  return http.createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, {'content-type': 'application/json'}); res.end(JSON.stringify(body)); };
    if (req.method !== 'POST' || req.url !== '/api/compile') return send(404, {ok: false, errors: [{line: 0, message: 'No existe.'}]});
    const ip = req.socket.remoteAddress ?? '?', now = Date.now(), list = (hits.get(ip) ?? []).filter(t => now - t < 60000);
    if (list.length >= LIMITS.perMinutePerIp) return send(429, {ok: false, errors: [{line: 0, message: 'Demasiadas compilaciones. Espera un minuto.'}]});
    hits.set(ip, [...list, now]);
    let body = '', big = false;
    for await (const chunk of req) { body += chunk; if (body.length > LIMITS.sourceBytes * 2 + 1024) { big = true; break; } }
    if (big) return send(413, {ok: false, errors: [{line: 0, message: 'La petición es demasiado grande.'}]});
    let data; try { data = JSON.parse(body); } catch { return send(400, {ok: false, errors: [{line: 0, message: 'JSON inválido.'}]}); }
    if (data?.board !== 'arduino-uno-r3') return send(400, {ok: false, errors: [{line: 0, message: 'Placa no soportada.'}]});
    if (running >= LIMITS.parallel) return send(429, {ok: false, errors: [{line: 0, message: 'El compilador está ocupado. Reintenta en unos segundos.'}]});
    running++;
    try { const r = await compile(data.source); send(r.status, r.body); } catch (e) { send(500, {ok: false, errors: [{line: 0, message: 'Error interno del compilador.'}]}); } finally { running--; }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] || 4777);
  createServer().listen(port, '127.0.0.1', () => console.log(`compile-server (spike) en http://127.0.0.1:${port}/api/compile`));
}
