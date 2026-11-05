import {lazy, Suspense, useRef, useState} from 'react';
import {FileUp, Hammer} from 'lucide-react';
import {MCU_SUPPORT, type CompileError} from '../mcu/types.ts';
import {advice, artifactStatus, hashSource} from '../mcu/compiler/state.ts';
import type {EditorHandle, EditorMark} from './CodeEditor';
import {ghostProgress} from './ghost';
import type {BuildContext} from './BuildWindows';

const CodeEditor = lazy(() => import('./CodeEditor'));
const STATUS_LABEL = {none: 'Sin compilar', fresh: 'Compilado', stale: 'Hay que recompilar', imported: 'Programa importado (.hex)'} as const;

/** Ventana Programación (4.1): editor, placa de destino, compilar o importar .hex, errores con línea y qué soporta el emulador. */
export function CodePanel({ctx}: {ctx: BuildContext}) {
  const code = ctx.code, [busy, setBusy] = useState(false), [errors, setErrors] = useState<CompileError[]>([]), [info, setInfo] = useState('');
  const editor = useRef<EditorHandle | null>(null);
  if (!code.boards.length) return <div className="rb-window-empty"><strong>Falta una placa</strong><p>Agrega un <b>Arduino UNO R3</b> desde Piezas para poder escribir su programa.</p></div>;
  const status = artifactStatus(code.artifact, hashSource(code.source)), tip = advice(status, code.compilerAvailable === true);
  const marks: EditorMark[] = errors.filter(e => e.line > 0).map(e => ({line: e.line, message: e.message}));
  const compile = async () => {
    setBusy(true); setInfo(''); setErrors([]);
    const r = await code.compile(code.source);
    setBusy(false);
    if (r.ok) setInfo(`Compilado: ${r.sizeBytes} bytes de ${(32256).toLocaleString('es-CL')} disponibles.${r.warnings.length ? ` ${r.warnings.length} aviso(s).` : ''}`);
    else setErrors(r.errors);
  };
  return <div className="rb-code">
    <div className="rb-code-top">
      <label>Placa de destino<select aria-label="Placa de destino" value={code.target ?? ''} onChange={e => { setErrors([]); setInfo(''); code.setTarget(e.target.value); }}>{code.boards.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select></label>
      <span className={`rb-code-status is-${status}`} role="status" data-status={status}>{STATUS_LABEL[status]}</span>
    </div>
    <div className="rb-code-editor"><Suspense fallback={<p className="rb-hint-line">Abriendo el editor…</p>}><CodeEditor key={`${ctx.project.id}:${code.target ?? 'x'}`} value={code.source} onChange={code.setSource} marks={marks} handleRef={editor} ghost={code.ghost} /></Suspense></div>
    {code.ghost && (() => { const g = ghostProgress(code.source, code.ghost); return <div className="rb-code-ghost" data-ghost={g.state}>
      <p role="status">{g.state === 'typing' ? 'Escribe sobre el código en gris. Cada letra correcta lo va reemplazando.' : g.state === 'done' ? 'Coincide con el paso. Ya puedes probarlo en la guía.' : `Lo que escribiste se aparta del paso en la línea ${g.line}. Corrígelo para ver de nuevo el espectro.`}</p>
      <div>{g.state === 'typing' && <button data-inline-action="" type="button" onClick={() => editor.current?.acceptGhostLine()}>Escribir la siguiente línea (Tab)</button>}{g.state === 'diverged' && <button data-inline-action="" type="button" onClick={() => code.setSource('')}>Empezar de cero (vacía el editor)</button>}<button data-inline-action="" type="button" onClick={code.stopGhost}>Quitar el espectro</button></div>
    </div>; })()}
    <div className="rb-code-actions">
      <button data-inline-action="" type="button" className="rb-primary" aria-label="Compilar" disabled={busy || code.compilerAvailable !== true} title={code.compilerAvailable === true ? 'Compila el programa con avr-gcc' : 'No hay servicio de compilación en este sitio'} onClick={() => void compile()}><Hammer size={15} /> {busy ? 'Compilando…' : 'Compilar'}</button>
      <label className="rb-file-button"><FileUp size={15} /> Importar .hex<input type="file" aria-label="Importar .hex" accept=".hex,.ihx,text/plain" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; const r = await code.importHex(f); setErrors([]); setInfo(r.ok ? 'Programa importado. Se ejecuta tal cual; el texto del editor no se usa.' : r.error ?? ''); }} /></label>
    </div>
    <p className={`rb-code-advice is-${tip.run}`}>{tip.message}</p>
    {info && <p className="rb-code-info" role="status">{info}</p>}
    {errors.length > 0 && <ul className="rb-code-errors" aria-label="Errores del compilador">{errors.map((e, i) => <li key={i}><button data-inline-action="" type="button" disabled={e.line <= 0} onClick={() => editor.current?.goto(e.line)}>{e.line > 0 && <b>Línea {e.line}</b>}<span>{e.message}</span></button></li>)}</ul>}
    <details className="rb-support"><summary>Qué soporta el emulador</summary>
      <ul>{MCU_SUPPORT.map(s => <li key={s.feature} data-status={s.status}><b>{s.feature}</b> — {s.status}. <small>{s.note}</small></li>)}</ul></details>
  </div>;
}
