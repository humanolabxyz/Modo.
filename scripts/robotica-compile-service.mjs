// Servicio de compilación de Robótica para DESARROLLO LOCAL: `GET /api/compile` (¿hay compilador?) y `POST /api/compile` (sketch → .hex).
// Solo lo monta el servidor de desarrollo de Astro (astro.config.mjs, comando `dev`) y solo atiende a 127.0.0.1. NO forma parte del build ni se despliega:
// dónde alojar el compilador en producción sigue pendiente de aprobación (docs/robotica/03, D-04). Usa un arduino-cli instalado en `.cache/arduino-cli`
// (o en la ruta de ARDUINO_CLI_DIR), con las mismas barreras que el prototipo del spike E2.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tool = process.env.ARDUINO_CLI_DIR ? path.resolve(process.env.ARDUINO_CLI_DIR) : path.join(root, '.cache/arduino-cli');
const cliExe = path.join(tool, 'bin', process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');

export const LIMITS = {
  sourceBytes: 64 * 1024,
  timeoutMs: Number(process.env.COMPILE_TIMEOUT_MS || 30000),
  parallel: 2,
  perMinutePerIp: 30,
  allowedIncludes: ['Arduino.h', 'Servo.h', 'Wire.h', 'SoftwareSerial.h', 'EEPROM.h', 'math.h', 'stdlib.h', 'string.h', 'stdint.h', 'avr/pgmspace.h'],
};
export const available = () => existsSync(cliExe);

/** Valida el código ANTES de dárselo al compilador. Devuelve el motivo (en español) o null. */
export function checkSource(source) {
  if (typeof source !== 'string' || !source.trim()) return 'El código está vacío.';
  if (Buffer.byteLength(source) > LIMITS.sourceBytes) return `El código supera ${LIMITS.sourceBytes / 1024} KB.`;
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

export function parseErrors(text, sketchName) {
  const errors = [], warnings = [];
  for (const m of text.matchAll(/^(.*?[\\/])?([^\\/\n:]+\.ino):(\d+):(?:(\d+):)?\s*(fatal error|error|warning):\s*(.*)$/gm)) {
    if (m[2] !== sketchName + '.ino') continue;
    const item = {line: Number(m[3]), column: m[4] ? Number(m[4]) : undefined, message: m[6].trim()};
    (m[5] === 'warning' ? warnings : errors).push(item);
  }
  // Errores del enlazador (sin línea): «undefined reference to `loop'»
  for (const m of text.matchAll(/undefined reference to [`'][^'`\n]+['`]?/g)) errors.push({line: 0, message: m[0]});
  return {errors, warnings};
}

function killTree(child) {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {stdio: 'ignore'});
  else try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
}

export async function compile(source) {
  const bad = checkSource(source);
  if (bad) return {status: 400, body: {ok: false, errors: [{line: 0, message: bad}]}};
  if (!available()) return {status: 503, body: {ok: false, errors: [{line: 0, message: 'El compilador (arduino-cli) no está instalado en este equipo.'}]}};
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'modo-compile-'));
  const name = 'sketch', sketchDir = path.join(dir, name), out = path.join(dir, 'out');
  await fs.mkdir(sketchDir); await fs.writeFile(path.join(sketchDir, `${name}.ino`), source);
  // Una caché de núcleo por petición: dos compilaciones a la vez con la caché compartida se pisan (medido en el spike E2: 3,2 s vs 1,2 s).
  const args = ['compile', '--fqbn', 'arduino:avr:uno', '--output-dir', out, '--build-cache-path', path.join(dir, 'cache'), '--warnings', 'default', '--jobs', '1', sketchDir];
  const env = {...process.env, ARDUINO_DIRECTORIES_DATA: path.join(tool, 'data'), ARDUINO_DIRECTORIES_USER: path.join(tool, 'user'), ARDUINO_DIRECTORIES_DOWNLOADS: path.join(tool, 'dl-pkg'), ARDUINO_UPDATER_ENABLE_NOTIFICATION: 'false'};
  const started = performance.now();
  const child = spawn(cliExe, args, {env, detached: process.platform !== 'win32', windowsHide: true});
  let log = '', timedOut = false;
  child.stdout.on('data', d => { log += d; }); child.stderr.on('data', d => { log += d; });
  const timer = setTimeout(() => { timedOut = true; killTree(child); }, LIMITS.timeoutMs);
  const code = await new Promise(resolve => { child.on('close', resolve); child.on('error', () => resolve(-1)); });
  clearTimeout(timer);
  const ms = Math.round(performance.now() - started);
  try {
    if (timedOut) return {status: 504, ms, body: {ok: false, errors: [{line: 0, message: `La compilación superó ${LIMITS.timeoutMs / 1000} s y se canceló.`}]}};
    const {errors, warnings} = parseErrors(log, name);
    if (code !== 0) return {status: 422, ms, body: {ok: false, errors: errors.length ? errors : [{line: 0, message: log.split('\n').filter(Boolean).slice(-3).join(' ')}]}};
    const hex = await fs.readFile(path.join(out, `${name}.ino.hex`), 'utf8');
    const size = /(?:Sketch uses|El Sketch usa|usa) (\d+) bytes/i.exec(log);
    return {status: 200, ms, body: {ok: true, hex, sizeBytes: size ? Number(size[1]) : hex.length, warnings: warnings.map(w => `${w.line}: ${w.message}`)}};
  } finally { await fs.rm(dir, {recursive: true, force: true}).catch(() => {}); }
}

/** Manejador `(req, res, next)` para un servidor de desarrollo (Vite/Connect) o `http.createServer`. */
export function createHandler() {
  let running = 0; const hits = new Map();
  return async (req, res, next) => {
    const url = (req.url ?? '').split('?')[0];
    if (url !== '/api/compile' && url !== '/api/compile/') return next ? next() : (res.writeHead(404).end());
    const send = (status, body) => { res.writeHead(status, {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}); res.end(JSON.stringify(body)); };
    // Solo el propio sitio local: sin cabecera propia (que obliga a un preflight) y con otro origen no se atiende.
    const host = req.headers.host ?? '', origin = req.headers.origin;
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host) || (origin && new URL(origin).host !== host) || req.headers['x-modo-compile'] !== '1') return send(403, {ok: false, errors: [{line: 0, message: 'Petición no permitida.'}]});
    if (req.method === 'GET') return send(200, {available: available()});
    if (req.method !== 'POST') return send(405, {ok: false, errors: [{line: 0, message: 'Método no permitido.'}]});
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
    try { const r = await compile(data.source); send(r.status, r.body); } catch { send(500, {ok: false, errors: [{line: 0, message: 'Error interno del compilador.'}]}); } finally { running--; }
  };
}

/** Integración de Astro: monta el servicio SOLO en `astro dev`. */
export const roboticaCompiler = () => ({
  name: 'modo-robotica-compiler',
  hooks: {'astro:server:setup': ({server}) => { server.middlewares.use(createHandler()); }},
});
