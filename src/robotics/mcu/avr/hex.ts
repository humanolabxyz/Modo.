// Intel HEX → memoria flash del ATmega328P (32 KB), con validación de sumas de control y de tamaño.
export const FLASH_BYTES = 0x8000;
export type HexResult = {ok: true; words: Uint16Array; bytesUsed: number} | {ok: false; error: string};

export function parseHex(hex: string): HexResult {
  const bytes = new Uint8Array(FLASH_BYTES);
  let used = 0, ended = false, upper = 0, lines = 0;
  for (const raw of hex.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    lines++;
    if (!line.startsWith(':')) return {ok: false, error: `Línea ${lines}: no es un archivo Intel HEX (debe empezar con «:»).`};
    if (!/^:[0-9A-Fa-f]+$/.test(line) || line.length % 2 === 0 || line.length < 11) return {ok: false, error: `Línea ${lines}: formato HEX dañado.`};
    const data = line.slice(1).match(/../g)!.map(h => parseInt(h, 16)), len = data[0], addr = (data[1] << 8) | data[2], type = data[3];
    if (data.length !== len + 5) return {ok: false, error: `Línea ${lines}: el largo no coincide.`};
    if (data.reduce((a, b) => (a + b) & 0xff, 0) !== 0) return {ok: false, error: `Línea ${lines}: suma de control incorrecta (archivo dañado).`};
    if (ended) return {ok: false, error: 'Hay datos después del fin del archivo.'};
    if (type === 1) { ended = true; continue; }
    if (type === 4) { upper = ((data[4] << 8) | data[5]) << 16; continue; }
    if (type !== 0) continue;
    for (let i = 0; i < len; i++) {
      const at = upper + addr + i;
      if (at >= FLASH_BYTES) return {ok: false, error: `El programa no cabe: usa más de ${FLASH_BYTES / 1024} KB de flash (límite del ATmega328P).`};
      bytes[at] = data[4 + i]; used = Math.max(used, at + 1);
    }
  }
  if (!ended) return {ok: false, error: 'El archivo HEX está incompleto (falta la línea final).'};
  if (used === 0) return {ok: false, error: 'El archivo HEX no contiene programa.'};
  return {ok: true, words: new Uint16Array(bytes.buffer), bytesUsed: used};
}
