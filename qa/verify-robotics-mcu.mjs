// Etapa 4 · MCU + coordinador + circuito con tiempo (sin navegador y sin compilador: usa los .hex versionados de qa/fixtures/robotica/).
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {connect, setPartProp, removeParts} from '../src/robotics/project/commands.ts';
import {sha256} from '../src/robotics/mcu/sha256.ts';
import {validateHexText} from '../src/robotics/mcu/compiler/hexImport.ts';
import {firmwareStatus, canRun, advice, hashSource} from '../src/robotics/mcu/compiler/state.ts';
import {translateMessage, translateErrors} from '../src/robotics/mcu/compiler/translate.ts';
import {RemoteCompiler} from '../src/robotics/mcu/compiler/remote.ts';
import {parseHex} from '../src/robotics/mcu/avr/hex.ts';
import {MCU_SUPPORT} from '../src/robotics/mcu/types.ts';
import {buildRobot2wd, wireRobot2wd} from './robotics/robot2wd.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), fx = name => fs.readFileSync(path.join(here, 'fixtures/robotica', name), 'utf8');
let n = 0; const ok = s => { n++; console.log('PASS', s); };
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);
const P = (id, pin) => ({instanceId: id, pinId: pin});

// ───── Robot de prueba: cableado completo a 9 V + LED con resistencia en D13
const built = buildRobot2wd(), wired = await wireRobot2wd(built), ids = built.ids;
function addPart(p, def, pos, props = {}) { const part = {instanceId: `t-${def}-${p.parts.length}`, definitionId: def, label: def, transform: {position: pos, rotation: [0, 0, 0, 1]}, props}; return [{...p, parts: [...p.parts, part]}, part.instanceId]; }
const wire = (p, a, b) => { const r = connect(p, a, b, '#000'); assert.ok(!('error' in r), r.error); return r.project; };
let base = setPartProp(wired, ids.battery, 'voltage', 9), led, res;
[base, led] = addPart(base, 'led-5mm', [0.2, 0.05, 0.2], {color: 'rojo'}); [base, res] = addPart(base, 'resistor', [0.25, 0.05, 0.2], {ohms: 220});
base = wire(base, P(ids.uno, 'D13'), P(res, 'P1')); base = wire(base, P(res, 'P2'), P(led, 'A')); base = wire(base, P(led, 'K'), P(ids.uno, 'GND.3'));
const model = (project, hexName) => ({project, targetId: ids.uno, hex: fx(hexName)});
const sim = (project, hexName) => new Coordinator(model(project, hexName));

// ───── Blink: D13 cada 1 000 ms virtuales (±1 ms); delay(200) cambia el periodo
function edges(c, seconds, pin = 'D13') { const out = []; c.trace = (p, l, at) => { if (p === pin) out.push([at / 1000, l]); }; c.advance(seconds * 1e6); return out; }
{ const e = edges(sim(base, 'blink_1000.hex'), 6); const gaps = e.slice(1).map((v, i) => v[0] - e[i][0]);
  assert.ok(gaps.length >= 5, `flancos: ${e.length}`); gaps.forEach(g => near(g, 1000, 1, 'intervalo de 1 000 ms'));
  const e2 = edges(sim(base, 'blink_200.hex'), 3); const g2 = e2.slice(1).map((v, i) => v[0] - e2[i][0]); assert.ok(g2.length >= 12); g2.forEach(g => near(g, 200, 1, 'intervalo de 200 ms')); }
ok('Blink: D13 conmuta cada 1 000 ms virtuales (±1 ms); con delay(200) el periodo es de 200 ms (±1 ms)');

// ───── El LED reacciona al programa: solo se enciende cuando D13 manda y el circuito lo permite
{ const c = sim(base, 'blink_1000.hex'), pattern = [];
  for (let i = 0; i < 40; i++) { c.advance(100000); const s = c.snapshot(); pattern.push({t: s.simTimeUs / 1e6, on: s.leds[led].on, b: s.leds[led].brightness, d13: s.pins.D13?.level}); }
  const lit = pattern.filter(p => p.on), dark = pattern.filter(p => !p.on);
  assert.ok(lit.length >= 15 && dark.length >= 15, `el LED parpadea (${lit.length} encendidos, ${dark.length} apagados de 40)`);
  lit.forEach(p => { assert.ok(p.d13 > 0.99, 'solo con D13 en alto'); near(p.b, 0.83, 0.03, 'brillo con 5 V, 25 Ω de pin, 220 Ω y 5 Ω del LED'); });
  dark.forEach(p => assert.ok(p.d13 < 0.01 && p.b === 0)); }
{ const cut = {...base, connections: base.connections.filter(c => !(c.a.instanceId === led && c.a.pinId === 'K' || c.b.instanceId === led && c.b.pinId === 'K'))};
  const c = sim(cut, 'blink_1000.hex'); let any = false; for (let i = 0; i < 40; i++) { c.advance(100000); any ||= c.snapshot().leds[led].on; } assert.equal(any, false, 'sin el cable del cátodo el LED nunca se enciende, aunque el programa lo mande'); }
{ const noRes = {...base, connections: base.connections.filter(c => c.a.instanceId !== res && c.b.instanceId !== res)}; let q = wire(noRes, P(ids.uno, 'D13'), P(led, 'A'));
  const c = sim(q, 'blink_1000.hex'); let max = 0, burn = false; for (let i = 0; i < 40; i++) { c.advance(100000); const l = c.snapshot().leds[led]; max = Math.max(max, l.amps); burn ||= l.overcurrent; } assert.ok(max > 0.03 && burn, `sin resistencia pasan ${(max * 1000).toFixed(0)} mA y se avisa de sobrecorriente`); }
ok('el LED parpadea con el programa (brillo ≈ 0,83); sin el cable del cátodo no se enciende; sin resistencia hay sobrecorriente');

// ───── Sin alimentación: falla observable
{ const noBattery = {...base, connections: base.connections.filter(c => ![c.a, c.b].some(r => r.instanceId === ids.battery))};
  const c = sim(noBattery, 'blink_1000.hex'); c.advance(3e6); const s = c.snapshot(); assert.equal(s.status, 'unpowered'); assert.equal(s.uno.powered, false); assert.equal(s.leds[led].on, false); assert.match(s.message, /no tiene alimentación/);
  const usb = sim(setPartProp(noBattery, ids.uno, 'usb', true), 'blink_1000.hex'); let seen = false; for (let i = 0; i < 25; i++) { usb.advance(100000); seen ||= usb.snapshot().leds[led].on; } assert.equal(usb.snapshot().uno.via, 'usb'); assert.ok(seen, 'por USB virtual el programa corre y el LED enciende'); }
{ const low = setPartProp(base, ids.battery, 'voltage', 6); const c = sim(low, 'blink_1000.hex'); c.advance(2e6); assert.equal(c.snapshot().status, 'unpowered', 'con 6 V el UNO no arranca por VIN (necesita ≥ 7 V)'); }
ok('sin batería o con 6 V el UNO no corre y el LED no se enciende; por USB virtual sí corre');

// ───── PWM: analogWrite(9, 128) → 0,5 ±0,01 y se refleja en la salida del pin
{ const c = sim(base, 'pwm9_128.hex'); c.advance(200000); const s = c.snapshot(); near(s.pins.D9.level, 0.5, 0.01, 'ciclo útil de D9 con analogWrite(9,128)'); assert.equal(s.pins.D9.mode, 'out');
  const d = Array.from({length: 8}, () => { c.advance(20000); return c.snapshot().pins.D9.level; }); d.forEach(v => near(v, 0.5, 0.03, 'el ciclo útil se mantiene')); }
ok('analogWrite(9,128) → ciclo útil 0,50 ±0,01 medido con los flancos reales del Timer1');

// ───── Puente H: dirección, PWM y alimentación
const motor = (hex, project = base) => { const c = sim(project, hex); c.advance(300000); return {s: c.snapshot(), c}; };
{ const f = motor('motors_fwd.hex').s, r = motor('motors_rev.hex').s, lo = motor('motors_pwm64.hex').s, off = motor('motors_off.hex').s;
  const mL = f.motors[ids.motorL], mR = f.motors[ids.motorR]; assert.ok(mL.volts > 3.5 && mL.speed > 0.5, `adelante: ${mL.volts.toFixed(2)} V`); assert.ok(mR.volts > 3.5);
  assert.ok(r.motors[ids.motorL].volts < -3.5 && r.motors[ids.motorL].speed < -0.5, 'invertir IN1/IN2 invierte la tensión del motor');
  assert.ok(lo.motors[ids.motorL].volts > 0 && lo.motors[ids.motorL].volts < mL.volts * 0.6, `PWM 64/255 da menos tensión (${lo.motors[ids.motorL].volts.toFixed(2)} V < ${mL.volts.toFixed(2)} V)`);
  near(off.motors[ids.motorL].volts, 0, 0.05, 'ENA=0: el motor no recibe nada');
  const nb = {...base, connections: base.connections.filter(c => ![c.a, c.b].some(x => x.instanceId === ids.battery && x.pinId === 'B+' ) )}; // sin positivo: todo apagado
  assert.equal(motor('motors_fwd.hex', nb).s.status, 'unpowered');
  const noMotorWire = {...base, connections: base.connections.filter(c => !(c.b.instanceId === ids.motorL && c.b.pinId === 'M+'))}; near(motor('motors_fwd.hex', noMotorWire).s.motors[ids.motorL].volts, 0, 0.01, 'cable del motor retirado → 0 V');
  assert.equal(f.bridges[ids.driver].channelA.direction, 1); assert.equal(r.bridges[ids.driver].channelA.direction, -1); }
ok('L298N: la dirección sigue a IN1/IN2, el PWM de ENA/ENB baja la tensión, ENA=0 corta y retirar un cable del motor deja 0 V');

// ───── HC-SR04 en banco controlado: TRIG ≥ 10 µs → ECHO de 2·d/343 s medido por pulseIn
const readUs = (project, ms = 700) => { const c = sim(project, 'hcsr04_read.hex'); c.advance(ms * 1000); return {c, vals: [...c.snapshot().serial.matchAll(/us=(\d+)/g)].map(m => Number(m[1]))}; };
{ const {c, vals} = readUs(base); assert.ok(vals.length >= 6, `lecturas: ${vals.length}`); vals.forEach(v => near(v, 1749, 40, '0,30 m → ≈ 1 749 µs')); assert.ok(c.snapshot().sensors[ids.sensor].echoes >= 6);
  const far = readUs(setPartProp(base, ids.sensor, 'testDistance', 1.0)).vals; far.forEach(v => near(v, 5831, 90, '1,00 m → ≈ 5 831 µs')); const near10 = readUs(setPartProp(base, ids.sensor, 'testDistance', 0.1)).vals; near10.forEach(v => near(v, 583, 25, '0,10 m → ≈ 583 µs'));
  const out = readUs(setPartProp(base, ids.sensor, 'testDistance', 4.2)).vals; out.forEach(v => assert.equal(v, 0, 'fuera de alcance: pulseIn agota su tiempo (0)'));
  const noVcc = readUs({...base, connections: base.connections.filter(c => !(c.a.instanceId === ids.sensor && c.a.pinId === 'VCC'))}); noVcc.vals.forEach(v => assert.equal(v, 0, 'sin 5 V el sensor no responde')); assert.equal(noVcc.c.snapshot().sensors[ids.sensor].powered, false); assert.match(noVcc.c.snapshot().sensors[ids.sensor].reason, /VCC/);
  const noTrig = readUs({...base, connections: base.connections.filter(c => !(c.a.instanceId === ids.sensor && c.a.pinId === 'TRIG'))}); noTrig.vals.forEach(v => assert.equal(v, 0)); assert.equal(noTrig.c.snapshot().sensors[ids.sensor].linked, false);
  const noGnd = readUs({...base, connections: base.connections.filter(c => !(c.a.instanceId === ids.sensor && c.a.pinId === 'GND'))}); noGnd.vals.forEach(v => assert.equal(v, 0, 'sin masa común no hay señal')); }
ok('HC-SR04: 0,30 m → ≈ 1 749 µs; 0,10 m → ≈ 583 µs; 1,00 m → ≈ 5 831 µs; > 4 m, sin VCC, sin TRIG o sin GND común → 0 (el tiempo sale del reloj virtual, no de una constante)');

// ───── Sketch bloqueante: no cuelga la simulación
{ const c = sim(base, 'stuck_while1.hex'), t = performance.now(); c.advance(10e6); const real = performance.now() - t; const s = c.snapshot();
  assert.ok(real < 20000, `10 s virtuales con while(1) tardaron ${real.toFixed(0)} ms reales`); assert.equal(s.simTimeUs, 10e6); assert.equal(s.leds[led].on, true, 'setup() dejó D13 en alto: el LED sigue encendido mientras el programa gira en while(1)'); }
ok('while(1){} no congela: 10 s virtuales se simulan por completo (el worker nunca bloquea la interfaz)');

// ───── Serie y analógico
{ const c = sim(base, 'serial_count.hex'); c.advance(1e6); const t = c.snapshot().serial; assert.match(t, /^hola modo\r\n0\r\n1\r\n2\r\n/); assert.equal(c.snapshot().serial, '', 'el texto ya entregado no se repite'); }
{ const ask = (p, ms = 300) => { const c = sim(p, 'analog_a0.hex'); c.advance(ms * 1000); return [...c.snapshot().serial.matchAll(/(\d+)\r\n/g)].map(m => Number(m[1])).at(-1); };
  const to5v = wire(base, P(ids.uno, 'A0'), P(ids.uno, '5V')); assert.equal(ask(to5v), 1023); const toGnd = wire(base, P(ids.uno, 'A0'), P(ids.uno, 'GND.2')); assert.equal(ask(toGnd), 0); assert.equal(ask(base), 0, 'A0 sin conectar lee 0 (flotante)');
}
ok('Serial.println entrega el texto una vez; analogRead(A0) lee 1023 desde 5 V, 0 desde GND y 0 sin conectar');

// ───── Hash, artefacto y modo sin conexión
assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
for (const s of ['x'.repeat(55), 'x'.repeat(56), 'x'.repeat(64), 'ñandú 😀 '.repeat(40)]) assert.equal(sha256(s), crypto.createHash('sha256').update(s).digest('hex'));
{ const src = 'void setup(){}\nvoid loop(){}\n', h = hashSource(src), fw = (origin, hash) => ({id: 'f', targetInstanceId: 'u', board: 'arduino-uno-r3', source: src, updatedAt: '', artifact: {hex: ':00000001FF', origin, sourceHash: hash, compiledAt: ''}});
  assert.equal(firmwareStatus(undefined, h), 'none'); assert.equal(firmwareStatus(fw('remote-compiler', h), h), 'fresh'); assert.equal(firmwareStatus(fw('remote-compiler', h), hashSource(src + ' ')), 'stale'); assert.equal(firmwareStatus(fw('hex-import', 'otro'), h), 'imported');
  assert.ok(canRun('fresh') && canRun('imported') && !canRun('stale') && !canRun('none'));
  assert.match(advice('fresh', false).message, /Sin conexión.*ya compilado/); assert.equal(advice('fresh', false).run, 'run');
  assert.match(advice('stale', false).message, /recompilar.*importa un \.hex/); assert.match(advice('none', true).message, /Todavía no hay/); assert.match(advice('imported', true).message, /importado/); assert.equal(advice('stale', true).run, 'recompile'); }
ok('SHA-256 (vectores y comparación con node:crypto) y estado del artefacto: fresco / hay que recompilar / importado; sin conexión se ofrece el compilado o importar un .hex');

// ───── HexImport
{ const good = fx('blink_1000.hex'); const r = validateHexText(good); assert.ok(r.ok && r.bytesUsed > 800 && r.bytesUsed < 1000);
  const broken = good.replace(/^(:10000000)(..)/m, (m, a, b) => a + (b === '0C' ? '0D' : '0C')); assert.match(validateHexText(broken).error, /suma de control/);
  assert.match(validateHexText('hola').error, /Intel HEX/); assert.match(validateHexText('').error, /incompleto/);
  assert.match(validateHexText(good.split('\n').slice(0, 5).join('\n')).error, /incompleto/);
  // Un registro de datos que se sale de los 32 KB, con su suma de control bien calculada
  const record = bytes => { const sum = (256 - (bytes.reduce((a, c) => a + c, 0) % 256)) % 256; return ':' + [...bytes, sum].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase(); };
  assert.match(validateHexText(record([4, 0xff, 0xf0, 0, 1, 2, 3, 4]) + '\n:00000001FF').error, /no cabe/); assert.ok(!parseHex(':00000001FF').ok); }
ok('HexImport: acepta un .hex real, rechaza sumas de control rotas, texto que no es HEX, archivos cortados y programas fuera de los 32 KB');

// ───── Errores de compilación → español con línea
{ const bad = JSON.parse(fx('bad_syntax.errors.json')), tr = translateErrors(bad.errors); assert.deepEqual(tr.map(e => e.line), [3, 5]); assert.match(tr[0].message, /Falta una «,» o un «;» antes de «pinMode»/); assert.match(tr[1].message, /Falta un «;» antes de «\}»/); assert.match(tr[0].raw, /expected ','/);
  assert.match(translateMessage("'ledPin' was not declared in this scope; did you mean 'LED_BUILTIN'?"), /«ledPin» no está declarado.*«LED_BUILTIN»/); assert.match(translateMessage("expected '}' at end of input"), /Falta cerrar una llave/); assert.match(translateMessage("'Servo' does not name a type"), /no es un tipo conocido/);
  assert.match(translateMessage("undefined reference to `loop'"), /Falta la función «loop\(\)»/); assert.match(translateMessage('cosa rara'), /^Error del compilador: cosa rara$/); }
ok('los errores reales de avr-gcc se traducen a español y conservan la línea (3 y 5 del sketch con fallos)');

// ───── RemoteCompiler (con un fetch simulado)
{ const json = (status, body, type = 'application/json') => async () => new Response(JSON.stringify(body), {status, headers: {'content-type': type}});
  assert.equal(await new RemoteCompiler(json(200, {available: true})).available(), true); assert.equal(await new RemoteCompiler(json(200, {available: false})).available(), false);
  assert.equal(await new RemoteCompiler(async () => new Response('<html>', {status: 200, headers: {'content-type': 'text/html'}})).available(), false, 'un sitio sin servicio devuelve HTML');
  assert.equal(await new RemoteCompiler(json(404, {})).available(), false); assert.equal(await new RemoteCompiler(async () => { throw new TypeError('network'); }).available(), false);
  const okc = await new RemoteCompiler(json(200, {ok: true, hex: ':00000001FF', sizeBytes: 10, warnings: []})).compile('x', 'arduino-uno-r3'); assert.ok(okc.ok && okc.sizeBytes === 10);
  const bad = await new RemoteCompiler(json(422, JSON.parse(fx('bad_syntax.errors.json')))).compile('x', 'arduino-uno-r3'); assert.ok(!bad.ok && bad.errors[0].line === 3 && /Falta/.test(bad.errors[0].message));
  const lim = await new RemoteCompiler(json(400, {ok: false, errors: [{line: 0, message: 'Línea 1: solo se permiten estos #include'}]})).compile('x', 'arduino-uno-r3'); assert.match(lim.errors[0].message, /solo se permiten/);
  const off = await new RemoteCompiler(async () => { throw new TypeError('x'); }).compile('x', 'arduino-uno-r3'); assert.ok(!off.ok && off.offline && /importar un \.hex/.test(off.errors[0].message));
  const nf = await new RemoteCompiler(async () => new Response('no', {status: 404})).compile('x', 'arduino-uno-r3'); assert.ok(nf.offline && /no tiene servicio/.test(nf.errors[0].message)); }
ok('RemoteCompiler: disponible / no disponible (HTML, 404, red), compila, traduce errores, conserva los avisos del servicio y declara «sin conexión»');

// ───── Soporte declarado
assert.ok(MCU_SUPPORT.some(x => x.status === 'no soportado' && /Serial\.read/.test(x.feature)) && MCU_SUPPORT.every(x => x.note.length > 5));
// ───── Quitar una pieza durante el diseño invalida el destino
{ const gone = removeParts(base, [ids.uno]).project; const c = new Coordinator({project: gone, targetId: ids.uno, hex: fx('blink_1000.hex')}); assert.equal(c.snapshot().status, 'error'); assert.match(c.snapshot().message, /no existe/); const bad = new Coordinator({project: base, targetId: ids.uno, hex: ':nope'}); assert.equal(bad.snapshot().status, 'error'); }
ok('sin placa de destino o con un .hex inválido el coordinador informa el error en lugar de simular');
console.log(`\n${n} bloques OK`);
