// Emulación real del ATmega328P con avr8js (D-04). Corre dentro del worker: el sketch compilado (.hex) se ejecuta instrucción a instrucción
// a 16 MHz; los timers, el USART y el ADC son los de avr8js. Probado en la etapa 1 (spike E1): Blink ±0,014 ms, PWM ±0,3 puntos,
// pulseIn −1,1 %, analogRead exacto, ≈ 1,7–1,9× el tiempo real en el worker.
import {CPU, avrInstruction, AVRTimer, timer0Config, timer1Config, timer2Config, AVRIOPort, portBConfig, portCConfig, portDConfig, AVRUSART, usart0Config, AVRADC, adcConfig, PinState} from 'avr8js';
import type {McuRuntime, PinBus, PinMode} from '../types.ts';
import {parseHex} from './hex.ts';
import {PIN_BY_PORT_BIT, UNO_PINS, type AvrPort} from './pins.ts';

export const CPU_HZ = 16_000_000, CYCLES_PER_US = 16;

type Machine = {cpu: CPU; ports: Record<AvrPort, AVRIOPort>; adc: AVRADC};

export class AvrRuntime implements McuRuntime {
  private words: Uint16Array | null = null;
  private machine: Machine | null = null;
  private bus: PinBus | null = null;
  private level = new Map<string, 0 | 1>();
  private mode = new Map<string, PinMode>();

  load(hex: string): {ok: true} | {ok: false; error: string} {
    const parsed = parseHex(hex);
    if (!parsed.ok) return parsed;
    this.words = parsed.words; this.build();
    return {ok: true};
  }

  private build() {
    const cpu = new CPU(new Uint16Array(this.words!));
    new AVRTimer(cpu, timer0Config); new AVRTimer(cpu, timer1Config); new AVRTimer(cpu, timer2Config);
    const ports = {B: new AVRIOPort(cpu, portBConfig), C: new AVRIOPort(cpu, portCConfig), D: new AVRIOPort(cpu, portDConfig)};
    const usart = new AVRUSART(cpu, usart0Config, CPU_HZ), adc = new AVRADC(cpu, adcConfig);
    this.level.clear(); this.mode.clear();
    for (const pin of Object.keys(UNO_PINS)) { this.level.set(pin, 0); this.mode.set(pin, 'in'); } // al arrancar todos los pines son entradas en bajo
    usart.onByteTransmit = byte => this.bus?.serial(byte, cpu.cycles / CYCLES_PER_US);
    for (const name of ['B', 'C', 'D'] as const) ports[name].addListener(() => this.sync(name, ports[name], cpu));
    this.machine = {cpu, ports, adc};
  }

  /** Traduce los cambios de un puerto a eventos por pin (modo y flancos), con el instante virtual exacto. */
  private sync(name: AvrPort, port: AVRIOPort, cpu: CPU) {
    const at = cpu.cycles / CYCLES_PER_US;
    for (let bit = 0; bit < 8; bit++) {
      const pin = PIN_BY_PORT_BIT(name, bit);
      if (!pin) continue;
      const state = port.pinState(bit), mode: PinMode = state === PinState.Low || state === PinState.High ? 'out' : state === PinState.InputPullUp ? 'pullup' : 'in';
      if (this.mode.get(pin) !== mode) { this.mode.set(pin, mode); this.bus?.setPinMode(pin, mode, at); }
      if (mode === 'out') { const lv = state === PinState.High ? 1 : 0; if (this.level.get(pin) !== lv) { this.level.set(pin, lv); this.bus?.writeDigital(pin, lv, at); } }
    }
  }

  runUntil(us: number, bus: PinBus): 'running' | {error: string} {
    if (!this.machine) return {error: 'No hay programa cargado.'};
    this.bus = bus;
    const {cpu} = this.machine, target = us * CYCLES_PER_US;
    try { while (cpu.cycles < target) { avrInstruction(cpu); cpu.tick(); } }
    catch (e) { return {error: e instanceof Error ? e.message : String(e)}; }
    return 'running';
  }

  setInput(pin: string, level: 0 | 1): void {
    const map = UNO_PINS[pin];
    if (!map || !this.machine || this.mode.get(pin) === 'out') return;
    this.machine.ports[map.port].setPin(map.bit, level === 1);
  }
  setAnalog(pin: string, volts: number): void {
    if (!this.machine || !/^A[0-5]$/.test(pin)) return;
    this.machine.adc.channelValues[Number(pin.slice(1))] = Math.min(5, Math.max(0, volts));
  }
  schedule(atUs: number, fn: () => void): void {
    if (!this.machine) return;
    this.machine.cpu.addClockEvent(fn, Math.max(1, Math.round(atUs * CYCLES_PER_US - this.machine.cpu.cycles)));
  }
  pinMode(pin: string): PinMode { return this.mode.get(pin) ?? 'in'; }
  reset(): void { if (this.words) this.build(); }
  get nowUs(): number { return this.machine ? this.machine.cpu.cycles / CYCLES_PER_US : 0; }
}
