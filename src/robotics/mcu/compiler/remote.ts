// Compilador remoto (D-04): `POST /api/compile` en el MISMO origen (connect-src 'self' sigue valiendo). Hoy ese servicio solo existe en el servidor
// de desarrollo local (scripts/robotica-compile-service.mjs); el sitio publicado no lo tiene hasta que se apruebe dónde alojarlo, y entonces
// `available()` da false y la interfaz ofrece importar un .hex o usar el artefacto guardado.
import type {CompileError, CompileResult, Compiler} from '../types.ts';
import {translateErrors} from './translate.ts';

export const COMPILE_URL = '/api/compile';
export const REQUEST_HEADERS = {'content-type': 'application/json', 'x-modo-compile': '1'};

export class RemoteCompiler implements Compiler {
  private readonly fetcher: typeof fetch;
  private readonly url: string;
  constructor(fetcher: typeof fetch = (...a) => fetch(...a), url = COMPILE_URL) { this.fetcher = fetcher; this.url = url; }

  async available(): Promise<boolean> {
    try {
      const r = await this.fetcher(this.url, {method: 'GET', headers: {'x-modo-compile': '1'}, signal: AbortSignal.timeout(2500)});
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return false;
      return (await r.json())?.available === true;
    } catch { return false; }
  }

  async compile(source: string, board: 'arduino-uno-r3'): Promise<CompileResult> {
    let response: Response;
    try { response = await this.fetcher(this.url, {method: 'POST', headers: REQUEST_HEADERS, body: JSON.stringify({source, board}), signal: AbortSignal.timeout(45000)}); }
    catch { return {ok: false, offline: true, errors: [{line: 0, message: 'No hay conexión con el compilador. Puedes importar un .hex del Arduino IDE o usar el programa ya compilado.'}]}; }
    let body: {ok?: boolean; hex?: string; sizeBytes?: number; warnings?: string[]; errors?: CompileError[]} | null = null;
    try { body = await response.json(); } catch { /* respuesta que no es JSON */ }
    if (!body) return {ok: false, offline: response.status === 404, errors: [{line: 0, message: response.status === 404 ? 'Este sitio no tiene servicio de compilación. Importa un .hex del Arduino IDE.' : `El compilador respondió con un error (${response.status}).`}]};
    if (response.ok && body.ok && typeof body.hex === 'string') return {ok: true, hex: body.hex, sizeBytes: body.sizeBytes ?? 0, warnings: body.warnings ?? []};
    const errors = body.errors?.length ? body.errors : [{line: 0, message: `El compilador respondió con un error (${response.status}).`}];
    // Los mensajes propios del servicio (límites, includes) ya vienen en español; los de gcc se traducen.
    return {ok: false, errors: translateErrors(errors.filter(e => e.line > 0)).concat(errors.filter(e => e.line <= 0).map(e => ({...e, raw: e.message})))};
  }
}
