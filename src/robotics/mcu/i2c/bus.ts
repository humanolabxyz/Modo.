// Bus I²C del ATmega328P (pines A4 = SDA, A5 = SCL) para dispositivos esclavos simulados. avr8js ya emula el controlador TWI (registros, estados, temporización);
// aquí solo se conectan los dispositivos: cada uno responde a su dirección de 7 bits y recibe/entrega bytes. Sin dispositivo en la dirección, el bus da NACK,
// igual que un módulo mal cableado: `Wire.endTransmission()` devuelve error y las bibliotecas (Adafruit_SSD1306) lo detectan.
import type {AVRTWI, TWIEventHandler} from 'avr8js';

export interface I2cDevice {
  /** Un byte escrito por el maestro. */
  write(byte: number): void;
  /** Un byte leído por el maestro (por defecto 0xFF si el dispositivo no lo implementa). */
  read?(): number;
  /** Empieza una transacción hacia este dispositivo (condición START o reinicio). */
  begin?(): void;
}

export class I2cBus implements TWIEventHandler {
  private devices = new Map<number, I2cDevice>();
  private active: I2cDevice | null = null;
  private twi: AVRTWI;
  constructor(twi: AVRTWI) { this.twi = twi; twi.eventHandler = this; }
  attach(address: number, device: I2cDevice) { this.devices.set(address & 0x7f, device); }
  detach(address: number) { this.devices.delete(address & 0x7f); }
  has(address: number) { return this.devices.has(address & 0x7f); }

  start() { this.twi.completeStart(); }
  stop() { this.active = null; this.twi.completeStop(); }
  connectToSlave(address: number) {
    const device = this.devices.get(address);
    this.active = device ?? null;
    if (device) device.begin?.();
    this.twi.completeConnect(!!device);
  }
  writeByte(value: number) {
    if (!this.active) { this.twi.completeWrite(false); return; }
    this.active.write(value & 0xff); this.twi.completeWrite(true);
  }
  readByte() { this.twi.completeRead(this.active?.read?.() ?? 0xff); }
}
