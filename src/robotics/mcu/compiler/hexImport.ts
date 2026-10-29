// Importar un .hex del Arduino IDE (Programa → «Exportar binario compilado»): funciona sin conexión.
import {LIMITS} from '../../project/types.ts';
import {parseHex} from '../avr/hex.ts';

export type HexImport = {ok: true; hex: string; bytesUsed: number} | {ok: false; error: string};

/** Valida el texto de un .hex: formato Intel HEX, sumas de control y que quepa en los 32 KB del ATmega328P. */
export function validateHexText(text: string): HexImport {
  if (text.length > LIMITS.hexBytes) return {ok: false, error: `El archivo es demasiado grande (máximo ${LIMITS.hexBytes / 1024} KB de texto HEX).`};
  const parsed = parseHex(text);
  return parsed.ok ? {ok: true, hex: text.replace(/\r\n/g, '\n'), bytesUsed: parsed.bytesUsed} : parsed;
}

export async function readHexFile(file: File): Promise<HexImport> {
  if (file.size > LIMITS.hexBytes) return {ok: false, error: `El archivo es demasiado grande (máximo ${LIMITS.hexBytes / 1024} KB).`};
  if (!/\.(hex|ihx)$/i.test(file.name) && file.type !== '' && !file.type.includes('text')) return {ok: false, error: 'Elige un archivo .hex (en el Arduino IDE: Programa → Exportar binario compilado).'};
  return validateHexText(await file.text());
}
