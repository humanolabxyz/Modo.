// Espectro del editor de código: el programa que se debe escribir se ve en gris detrás de lo escrito. Sin dependencias para no cargar el editor al mostrar el estado.
export type GhostState = {state: 'off' | 'typing' | 'diverged' | 'done'; line: number; rest: string};
/** Cuánto del código objetivo ya está escrito: coincide como prefijo (typing), se aparta en cierta línea (diverged) o está completo (done). */
export function ghostProgress(doc: string, target: string): GhostState {
  const t = target.replace(/\r\n?/g, '\n'), d = doc.replace(/\r\n?/g, '\n');
  if (!t) return {state: 'off', line: 0, rest: ''};
  let k = 0; const n = Math.min(d.length, t.length); while (k < n && d[k] === t[k]) k++;
  if (k < d.length) return {state: 'diverged', line: d.slice(0, k).split('\n').length, rest: ''};
  const rest = t.slice(k);
  return {state: rest.trim() ? 'typing' : 'done', line: d.split('\n').length, rest};
}
