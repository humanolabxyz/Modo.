// Mensajes de avr-gcc → español claro, con la línea para marcarla en el editor. El texto original se conserva en `raw`.
import type {CompileError} from '../types.ts';

const RULES: [RegExp, (m: RegExpExecArray) => string][] = [
  [/'([^']+)' was not declared in this scope(?:; did you mean '([^']+)'\?)?/, m => `«${m[1]}» no está declarado: revisa que esté bien escrito o declarado antes de usarlo${m[2] ? ` (¿quisiste decir «${m[2]}»?)` : ''}.`],
  [/expected ',' or ';' before '([^']*)'/, m => `Falta una «,» o un «;» antes de «${m[1]}».`],
  [/expected ';' before '([^']*)'/, m => `Falta un «;» antes de «${m[1]}».`],
  [/expected ';' at end of (?:input|declaration)/, () => 'Falta un «;» al final.'],
  [/expected '\}' at end of input/, () => 'Falta cerrar una llave «}» (hay más «{» que «}»).'],
  [/expected '\)' before '([^']*)'/, m => `Falta cerrar un paréntesis «)» antes de «${m[1]}».`],
  [/expected '\(' before '([^']*)'/, m => `Falta abrir un paréntesis «(» antes de «${m[1]}».`],
  [/expected primary-expression before '([^']*)'/, m => `Se esperaba un valor o una expresión antes de «${m[1]}».`],
  [/expected unqualified-id before '([^']*)'/, m => `Algo está fuera de lugar antes de «${m[1]}» (¿llave de más o función sin cerrar?).`],
  [/'([^']+)' does not name a type/, m => `«${m[1]}» no es un tipo conocido (¿está bien escrito o falta una librería?).`],
  [/no matching function for call to '([^'(]+)[^']*'/, m => `La función «${m[1]}» no se puede llamar con esos argumentos.`],
  [/too many arguments to function '([^']+)'/, m => `Demasiados argumentos para la función «${m[1]}».`],
  [/too few arguments to function '([^']+)'/, m => `Faltan argumentos para la función «${m[1]}».`],
  [/invalid conversion from '([^']+)' to '([^']+)'/, m => `No se puede convertir «${m[1]}» a «${m[2]}».`],
  [/redefinition of '([^']+)'/, m => `«${m[1]}» está definido dos veces.`],
  [/'([^']+)' redeclared as different kind of symbol/, m => `«${m[1]}» ya existe con otro significado.`],
  [/undefined reference to `?'?(setup|loop)(?:\(\))?'?/, m => `Falta la función «${m[1]}()»: todo sketch necesita setup() y loop().`],
  [/undefined reference to `?'?([^'`(]+)/, m => `«${m[1]}» se usa pero no está definido (¿falta escribir la función?).`],
  [/stray '(.)' in program/, m => `Hay un carácter extraño «${m[1]}» en el programa (¿comillas o símbolos copiados de otro sitio?).`],
  [/unterminated comment/, () => 'Hay un comentario «/*» sin cerrar.'],
  [/missing terminating " character/, () => 'Falta cerrar unas comillas «"».'],
  [/ISO C\+\+ forbids declaration of '([^']+)' with no type/, m => `«${m[1]}» necesita un tipo (por ejemplo int).`],
  [/void value not ignored as it ought to be/, () => 'Una función que no devuelve nada («void») se usó como si devolviera un valor.'],
  [/assignment of read-only variable '([^']+)'/, m => `«${m[1]}» es una constante: no se le puede asignar otro valor.`],
  [/section `\.text' will not fit in region `text'/, () => 'El programa no cabe en la memoria del Arduino UNO (32 KB).'],
];

export function translateMessage(raw: string): string {
  const text = raw.replace(/^(?:fatal error|error|warning):\s*/i, '').trim();
  for (const [re, fn] of RULES) { const m = re.exec(text); if (m) return fn(m); }
  return `Error del compilador: ${text}`;
}
export const translateErrors = (errors: CompileError[]): CompileError[] => errors.map(e => ({...e, raw: e.raw ?? e.message, message: translateMessage(e.message)}));
