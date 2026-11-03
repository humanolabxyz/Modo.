// Pantalla OLED SSD1306 de 128 × 64 por I²C (la que casi todo el mundo usa con la biblioteca Adafruit_SSD1306). Se emula lo que esa biblioteca y los programas
// propios usan de verdad: el flujo de comandos (control 0x00) y de datos (control 0x40), los modos de direccionamiento y la memoria de dibujo (GDDRAM).
// El contenido que se ve sale de lo que el programa escribió, no de una animación.
import type {I2cDevice} from './bus.ts';

export const OLED_WIDTH = 128, OLED_HEIGHT = 64, OLED_PAGES = OLED_HEIGHT / 8;

export class Ssd1306 implements I2cDevice {
  /** GDDRAM: 8 páginas × 128 columnas; cada byte son 8 píxeles verticales (bit 0 = el de arriba). */
  readonly ram = new Uint8Array(OLED_WIDTH * OLED_PAGES);
  /** `flipX` = comando A1 puesto; `flipY` = comando C8 puesto (los dos juntos dejan la imagen derecha). */
  on = false; inverted = false; contrast = 0x7f; allOn = false; flipX = false; flipY = false;
  addressing: 'horizontal' | 'vertical' | 'page' = 'page';
  colStart = 0; colEnd = OLED_WIDTH - 1; pageStart = 0; pageEnd = OLED_PAGES - 1;
  col = 0; page = 0;
  /** Cuántos bytes de datos y de comandos recibió: sirve para diagnóstico y pruebas. */
  dataBytes = 0; commandBytes = 0;
  /** Se incrementa en cada cambio de la memoria o de las opciones de imagen (para saber cuándo volver a dibujar). */
  version = 0;

  /** Estado del byte de control: el primero de cada transacción dice si lo que sigue son comandos (0x00) o datos (0x40); el bit 7 (Co) pide un control antes de cada byte. */
  private expectControl = true;
  private co = false;
  private dc: 'command' | 'data' = 'command';
  private pending: number | null = null; // comando que espera argumentos
  private need = 0;
  private args: number[] = [];

  /** Cada transacción empieza con un byte de control. Un comando que espera argumentos los recibe aunque lleguen en otra transacción (así lo hace Adafruit_SSD1306). */
  begin() { this.expectControl = true; }
  write(byte: number) {
    if (this.expectControl) {
      this.dc = byte & 0x40 ? 'data' : 'command'; this.co = !!(byte & 0x80);
      this.expectControl = false;
      return;
    }
    if (this.co) this.expectControl = true; // Co = 1: cada byte lleva su propio byte de control
    if (this.dc === 'data') this.data(byte); else this.command(byte);
  }

  private data(b: number) {
    this.dataBytes++;
    this.ram[this.page * OLED_WIDTH + this.col] = b; this.version++;
    if (this.addressing === 'page') { this.col = (this.col + 1) % OLED_WIDTH; return; }
    if (this.addressing === 'horizontal') {
      if (this.col >= this.colEnd) { this.col = this.colStart; this.page = this.page >= this.pageEnd ? this.pageStart : this.page + 1; } else this.col++;
    } else if (this.page >= this.pageEnd) { this.page = this.pageStart; this.col = this.col >= this.colEnd ? this.colStart : this.col + 1; } else this.page++;
  }

  private command(c: number) {
    this.commandBytes++;
    if (this.pending !== null) {
      this.args.push(c);
      if (this.args.length >= this.need) { const p = this.pending, a = this.args; this.pending = null; this.args = []; this.withArgs(p, a); }
      return;
    }
    const arg = (n: number) => { this.pending = c; this.need = n; this.args = []; };
    if (c === 0xae) { this.on = false; this.version++; } else if (c === 0xaf) { this.on = true; this.version++; }
    else if (c === 0xa6) { this.inverted = false; this.version++; } else if (c === 0xa7) { this.inverted = true; this.version++; }
    else if (c === 0xa4) { this.allOn = false; this.version++; } else if (c === 0xa5) { this.allOn = true; this.version++; }
    else if (c === 0xa0) { this.flipX = false; this.version++; } else if (c === 0xa1) { this.flipX = true; this.version++; }
    else if (c === 0xc0) { this.flipY = false; this.version++; } else if (c === 0xc8) { this.flipY = true; this.version++; }
    else if ([0x20, 0x21, 0x22, 0x81, 0x8d, 0xa8, 0xd3, 0xd5, 0xd9, 0xda, 0xdb].includes(c)) arg(c === 0x21 || c === 0x22 ? 2 : 1);
    else if (c <= 0x0f) this.col = (this.col & 0xf0) | c;                                  // columna baja (modo página)
    else if (c >= 0x10 && c <= 0x1f) this.col = (this.col & 0x0f) | ((c & 0x0f) << 4);    // columna alta (modo página)
    else if (c >= 0xb0 && c <= 0xb7) this.page = c & 0x07;                                 // página (modo página)
    // 0x40–0x7f (línea de inicio), 0x2e/0x2f (scroll) y el resto no cambian lo que el programa ve en esta emulación.
  }
  private withArgs(c: number, a: number[]) {
    if (c === 0x20) this.addressing = (['horizontal', 'vertical', 'page'] as const)[a[0] & 3] ?? 'page';
    else if (c === 0x21) { this.colStart = a[0] & 0x7f; this.colEnd = a[1] & 0x7f; this.col = this.colStart; }
    else if (c === 0x22) { this.pageStart = a[0] & 0x07; this.pageEnd = a[1] & 0x07; this.page = this.pageStart; }
    else if (c === 0x81) { this.contrast = a[0]; this.version++; }
  }

  /** ¿El píxel (x, y) está encendido tal como se vería en la pantalla (con inversión y «todo encendido»)? */
  pixel(x: number, y: number): boolean {
    if (!this.on) return false;
    if (this.allOn) return true;
    // Con A1 (remapeo de segmentos) y C8 (barrido de filas invertido), que es lo que configura Adafruit_SSD1306, la imagen sale derecha: columna 0 a la izquierda y página 0 arriba.
    // Con los valores de arranque (A0 y C0) el módulo muestra la imagen girada 180°.
    const sx = this.flipX ? x : OLED_WIDTH - 1 - x, sy = this.flipY ? y : OLED_HEIGHT - 1 - y;
    const lit = ((this.ram[(sy >> 3) * OLED_WIDTH + sx] >> (sy & 7)) & 1) === 1;
    return lit !== this.inverted;
  }
  /** Imagen completa: 128 × 64 valores 0/1 (fila por fila), lista para dibujar. */
  image(): Uint8Array { const out = new Uint8Array(OLED_WIDTH * OLED_HEIGHT); for (let y = 0; y < OLED_HEIGHT; y++) for (let x = 0; x < OLED_WIDTH; x++) out[y * OLED_WIDTH + x] = this.pixel(x, y) ? 1 : 0; return out; }
  private cache: {version: number; frame: Uint8Array} | null = null;
  /** Imagen final ya compuesta (con giro, inversión y «todo encendido»): 64 filas × 16 bytes, el bit 7 es el píxel de más a la izquierda. Se recalcula solo si cambió algo. */
  frame(): Uint8Array {
    if (this.cache && this.cache.version === this.version) return this.cache.frame;
    const frame = new Uint8Array(OLED_HEIGHT * (OLED_WIDTH / 8));
    for (let y = 0; y < OLED_HEIGHT; y++) for (let x = 0; x < OLED_WIDTH; x++) if (this.pixel(x, y)) frame[y * 16 + (x >> 3)] |= 0x80 >> (x & 7);
    this.cache = {version: this.version, frame}; return frame;
  }
  litPixels(): number { let n = 0; for (let y = 0; y < OLED_HEIGHT; y++) for (let x = 0; x < OLED_WIDTH; x++) if (this.pixel(x, y)) n++; return n; }
}
