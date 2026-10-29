// Contratos del microcontrolador y del compilador (docs/robotica/02 §5). Cambios respecto del documento, por cómo funciona avr8js:
//  · El runtime NO consulta las entradas (digitalRead/analogRead): el coordinador se las ENTREGA con setInput/setAnalog en el instante exacto.
//  · PinBus recibe solo lo que el programa HACE: flancos de los pines (writeDigital, con su instante), cambios de modo y los bytes del puerto serie.
//  · El ciclo útil (PWM) no lo informa el runtime: el coordinador lo mide a partir de los flancos reales.
export type PinMode = 'out' | 'in' | 'pullup';
export interface PinBus {
  /** Un pin cambió de nivel en el instante `atUs` (µs virtuales desde el arranque). Sirve para salidas digitales y para los flancos del PWM. */
  writeDigital(pin: string, level: 0 | 1, atUs: number): void;
  /** El programa cambió el modo de un pin (pinMode / DDR). */
  setPinMode(pin: string, mode: PinMode, atUs: number): void;
  /** Un byte salió por el puerto serie (USART). */
  serial(byte: number, atUs: number): void;
}
export interface McuRuntime {
  load(hex: string): {ok: true} | {ok: false; error: string};
  /** Ejecuta hasta el instante virtual `us`. */
  runUntil(us: number, bus: PinBus): 'running' | {error: string};
  /** Nivel que llega desde fuera a un pin configurado como entrada. */
  setInput(pin: string, level: 0 | 1): void;
  /** Tensión (0–5 V) en un pin analógico A0–A5 para el ADC. */
  setAnalog(pin: string, volts: number): void;
  /** Ejecuta `fn` exactamente en el instante virtual `atUs` (por ejemplo, el flanco de ECHO del HC-SR04). */
  schedule(atUs: number, fn: () => void): void;
  reset(): void;
  readonly nowUs: number;
}

export type CompileError = {line: number; column?: number; message: string; raw?: string};
export type CompileResult = {ok: true; hex: string; sizeBytes: number; warnings: string[]} | {ok: false; errors: CompileError[]; offline?: boolean};
export interface Compiler {
  /** `false` sin conexión o sin servicio: la interfaz ofrece importar un .hex o usar el artefacto guardado. */
  available(): Promise<boolean>;
  compile(source: string, board: 'arduino-uno-r3'): Promise<CompileResult>;
}

/** Lo que el emulador soporta, declarado en la interfaz (resultado de los spikes de la etapa 1 y de las pruebas de la etapa 4). */
export const MCU_SUPPORT: {feature: string; status: 'soportado' | 'parcial' | 'no soportado'; note: string}[] = [
  {feature: 'digitalWrite / pinMode / delay / millis / micros', status: 'soportado', note: 'Temporización exacta a 16 MHz.'},
  {feature: 'analogWrite (PWM) en D3, D5, D6, D9, D10, D11', status: 'soportado', note: 'Timer0/1/2; se mide el ciclo útil promedio.'},
  {feature: 'analogRead A0–A5', status: 'soportado', note: 'Tensión de la red del pin (0–5 V) → 0–1023.'},
  {feature: 'Serial.print / println (salida)', status: 'soportado', note: 'USART a 9 600 baudios u otra velocidad.'},
  {feature: 'pulseIn con HC-SR04', status: 'soportado', note: 'ECHO = 2·d/343 s medido con el reloj virtual.'},
  {feature: 'Serial.read / available (entrada)', status: 'no soportado', note: 'Todavía no hay forma de escribir en el monitor.'},
  {feature: 'attachInterrupt, Servo, tone, I²C, SPI, EEPROM', status: 'no soportado', note: 'avr8js los incluye pero no están verificados ni conectados a dispositivos.'},
];
