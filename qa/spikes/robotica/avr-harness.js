// SPIKE E1 · Banco de avr8js. Mismo código en Node y dentro de un Web Worker (sin DOM).
import {CPU, avrInstruction, AVRTimer, timer0Config, timer1Config, timer2Config, AVRIOPort, portBConfig, portCConfig, portDConfig, AVRUSART, usart0Config, AVRADC, adcConfig} from 'avr8js';

export const HZ = 16_000_000, CYCLES_PER_US = 16;

/** Intel HEX → palabras de 16 bits (flash del ATmega328P: 32 KB). */
export function parseHex(hex) {
  const bytes = new Uint8Array(0x8000);
  for (const line of hex.split(/\r?\n/)) {
    if (!line.startsWith(':')) continue;
    const len = parseInt(line.slice(1, 3), 16), addr = parseInt(line.slice(3, 7), 16), type = parseInt(line.slice(7, 9), 16);
    if (type === 1) break;
    if (type !== 0) continue;
    for (let i = 0; i < len; i++) bytes[addr + i] = parseInt(line.slice(9 + i * 2, 11 + i * 2), 16);
  }
  return new Uint16Array(bytes.buffer);
}

export function createMcu(hex) {
  const cpu = new CPU(parseHex(hex));
  const timers = [new AVRTimer(cpu, timer0Config), new AVRTimer(cpu, timer1Config), new AVRTimer(cpu, timer2Config)];
  const B = new AVRIOPort(cpu, portBConfig), C = new AVRIOPort(cpu, portCConfig), D = new AVRIOPort(cpu, portDConfig);
  const usart = new AVRUSART(cpu, usart0Config, HZ);
  const adc = new AVRADC(cpu, adcConfig);
  const serial = {text: '', lines: []};
  usart.onByteTransmit = byte => { const c = String.fromCharCode(byte); serial.text += c; if (c === '\n') { serial.lines.push(serial.text.trimEnd()); serial.text = ''; } };
  return {cpu, timers, B, C, D, usart, adc, serial};
}

/** Avanza el MCU hasta `cycles` ciclos de reloj absolutos. */
export function runTo(m, cycles) {
  const cpu = m.cpu;
  while (cpu.cycles < cycles) { avrInstruction(cpu); cpu.tick(); }
}

/** Pin de Arduino UNO → [puerto, bit]. */
const PINS = {D5: ['D', 5], D6: ['D', 6], D7: ['D', 7], D9: ['B', 1], D10: ['B', 2], D13: ['B', 5]};
export const portOf = (m, pin) => [m[PINS[pin][0]], PINS[pin][1]];

/** Registra los flancos de un pin: [[ciclo, nivel], …]. */
export function probe(m, pin) {
  const [port, bit] = portOf(m, pin), edges = [];
  let last = port.pinState(bit) === 1 /* High */;
  port.addListener(() => { const high = port.pinState(bit) === 1; if (high !== last) { last = high; edges.push([m.cpu.cycles, high ? 1 : 0]); } });
  return edges;
}

/** Ciclo útil medido sobre una ventana [from, to) de ciclos, a partir de los flancos. */
export function duty(edges, from, to) {
  let level = 0, t = from, high = 0;
  const before = edges.filter(e => e[0] <= from); if (before.length) level = before.at(-1)[1];
  for (const [c, v] of edges) { if (c <= from) continue; if (c >= to) break; if (level) high += c - t; t = c; level = v; }
  if (level) high += to - t;
  return high / (to - from);
}

// ───────────────────────── Escenarios ─────────────────────────
export function scenarioBlink(hex) {
  const m = createMcu(hex), edges = probe(m, 'D13');
  const wall = performance.now(); runTo(m, 5 * HZ + 100); const wallMs = performance.now() - wall;
  const t = edges.map(([c]) => c / CYCLES_PER_US / 1000), gaps = t.slice(1).map((v, i) => v - t[i]);
  return {toggles: edges.length, firstMs: +t[0].toFixed(3), gapsMs: gaps.map(g => +g.toFixed(3)), maxDeviationMs: +Math.max(...gaps.map(g => Math.abs(g - 1000))).toFixed(3), virtualS: 5, wallMs: +wallMs.toFixed(1), speed: +(5000 / wallMs).toFixed(1)};
}

export function scenarioPwm(hexByValue) {
  const out = {};
  for (const [value, hex] of Object.entries(hexByValue)) {
    const m = createMcu(hex), probes = Object.fromEntries(['D5', 'D6', 'D9', 'D10'].map(p => [p, probe(m, p)]));
    runTo(m, 0.1 * HZ);
    const from = 0.05 * HZ, to = 0.1 * HZ;
    out[value] = Object.fromEntries(Object.entries(probes).map(([p, e]) => [p, +(duty(e, from, to) * 100).toFixed(2)]));
    out[value].expected = +((Number(value) / 255) * 100).toFixed(2);
    // Frecuencia: flancos de subida por segundo
    out[value].freqHz = Object.fromEntries(Object.entries(probes).map(([p, e]) => [p, Math.round(e.filter(x => x[0] > from && x[0] < to && x[1] === 1).length / ((to - from) / HZ))]));
  }
  return out;
}

export function scenarioPulse(hex, pulseUs = 1749) {
  const m = createMcu(hex);
  runTo(m, 0.02 * HZ); // el sketch ya arrancó y espera en pulseIn
  const start = m.cpu.cycles;
  m.cpu.addClockEvent(() => m.D.setPin(7, true), 0.003 * HZ);
  m.cpu.addClockEvent(() => m.D.setPin(7, false), 0.003 * HZ + pulseUs * CYCLES_PER_US);
  runTo(m, start + 0.12 * HZ);
  const lines = m.serial.lines.filter(l => l.startsWith('pulse='));
  const parsed = lines.map(l => ({pulse: Number(/pulse=(\d+)/.exec(l)[1]), dt: Number(/dt=(\d+)/.exec(l)[1])}));
  const hit = parsed.find(p => p.pulse > 0);
  return {injectedUs: pulseUs, readUs: hit?.pulse ?? null, errorPct: hit ? +(((hit.pulse - pulseUs) / pulseUs) * 100).toFixed(2) : null, micros1000: parsed.map(p => p.dt).slice(0, 4), lines: lines.slice(0, 3)};
}

export function scenarioSerialAdc(hex) {
  const m = createMcu(hex), reads = {};
  runTo(m, 0.02 * HZ); const greeting = m.serial.lines[0] ?? null;
  for (const [volts, expected] of [[0, 0], [1.25, 256], [2.5, 512], [5, 1023]]) {
    m.adc.channelValues[0] = volts; m.serial.lines.length = 0; runTo(m, m.cpu.cycles + 0.12 * HZ);
    const v = m.serial.lines.filter(l => l.startsWith('a0=')).at(-1);
    reads[volts + ' V'] = {leido: v ? Number(v.slice(3)) : null, esperado: expected};
  }
  return {greeting, reads};
}

/** Robot completo: HC-SR04 simulado (TRIG→ECHO), L298N por PWM D5/D6 y el sketch parecido al de la etapa 5. */
export function scenarioRobot(hex) {
  const m = createMcu(hex);
  let distanceM = 1.0, trigRise = 0;
  const [trigPort, trigBit] = portOf(m, 'D9'), [echoPort, echoBit] = portOf(m, 'D10');
  trigPort.addListener(() => {
    const high = trigPort.pinState(trigBit) === 1;
    if (high) trigRise = m.cpu.cycles;
    else if (trigRise && (m.cpu.cycles - trigRise) / CYCLES_PER_US >= 10) { // ≥ 10 µs de pulso TRIG
      trigRise = 0; const echoUs = (2 * distanceM / 343) * 1e6;
      m.cpu.addClockEvent(() => echoPort.setPin(echoBit, true), 450 * CYCLES_PER_US); // el HC-SR04 tarda ~450 µs en emitir
      m.cpu.addClockEvent(() => echoPort.setPin(echoBit, false), (450 + echoUs) * CYCLES_PER_US);
    }
  });
  const ena = probe(m, 'D5'), enb = probe(m, 'D6');
  const phase = (label, d, ms) => { distanceM = d; const t0 = m.cpu.cycles; m.serial.lines.length = 0; runTo(m, t0 + (ms / 1000) * HZ);
    const from = t0 + 0.7 * (ms / 1000) * HZ, to = t0 + (ms / 1000) * HZ; return {label, distanceM: d, dutyENA: +(duty(ena, from, to) * 100).toFixed(1), dutyENB: +(duty(enb, from, to) * 100).toFixed(1), serialCm: m.serial.lines.at(-1)}; };
  const wall = performance.now();
  const result = [phase('libre a 1,00 m', 1.0, 700), phase('obstáculo a 0,10 m', 0.1, 700), phase('libre a 0,60 m', 0.6, 700)];
  return {phases: result, expectedDutyAvanzar: +((180 / 255) * 100).toFixed(1), wallMs: +(performance.now() - wall).toFixed(1), speed: +(2100 / (performance.now() - wall)).toFixed(1)};
}

export function runAll(hex) {
  return {
    blink: scenarioBlink(hex.blink), pwm: scenarioPwm({64: hex.pwm_64, 128: hex.pwm_128, 192: hex.pwm_192}),
    pulse: scenarioPulse(hex.pulse), serialAdc: scenarioSerialAdc(hex.serial_adc), robot: scenarioRobot(hex.robot_like),
  };
}
