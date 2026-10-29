// Sirve el banco para medir en una tablet real por la red local. Uso: node qa/spikes/robotica/serve-bench-lan.mjs [puerto]
// Requiere haber corrido run-e2.mjs y bundle-worker.mjs. Solo para pruebas en tu red; no se despliega.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), cache = path.resolve(here, '../../../.cache/spikes-robotica'), port = Number(process.argv[2] || 4780);
const hex = Object.fromEntries(['blink', 'pwm_64', 'pwm_128', 'pwm_192', 'pulse', 'serial_adc', 'robot_like'].map(n => [n, fs.readFileSync(path.join(cache, 'hex', n + '.hex'), 'utf8')]));
http.createServer((req, res) => {
  const send = (type, body) => { res.writeHead(200, {'content-type': type}); res.end(body); };
  if (req.url === '/' || req.url === '/index.html') return send('text/html; charset=utf-8', fs.readFileSync(path.join(here, 'bench-lan.html')));
  if (req.url === '/worker.js') return send('text/javascript', fs.readFileSync(path.join(cache, 'worker.js')));
  if (req.url === '/hex.json') return send('application/json', JSON.stringify(hex));
  res.writeHead(404).end();
}).listen(port, '0.0.0.0', () => { console.log(`Banco en http://localhost:${port}/`); for (const list of Object.values(os.networkInterfaces())) for (const i of list ?? []) if (i.family === 'IPv4' && !i.internal) console.log(`Desde la tablet (misma Wi‑Fi): http://${i.address}:${port}/`); });
