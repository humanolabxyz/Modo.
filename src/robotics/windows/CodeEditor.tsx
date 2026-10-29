// Editor CodeMirror 6 (D-05): C++, números de línea, marcas de error. Se carga bajo demanda (React.lazy) para que el resto de la pizarra no cargue el editor.
import {useEffect, useRef} from 'react';
import {EditorView, basicSetup} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {cpp} from '@codemirror/lang-cpp';
import {lintGutter, setDiagnostics, type Diagnostic} from '@codemirror/lint';

export type EditorMark = {line: number; message: string};
export type EditorHandle = {goto(line: number): void};

const theme = EditorView.theme({
  '&': {height: '100%', fontSize: '13px', border: '1px solid #dde3e8', borderRadius: '10px', backgroundColor: '#fff'},
  '.cm-scroller': {fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', lineHeight: '1.5', overscrollBehavior: 'contain'},
  '.cm-gutters': {backgroundColor: '#f6f8fa', color: '#8a9ba6', border: 'none', borderRadius: '10px 0 0 10px'},
  '&.cm-focused': {outline: '2px solid #3E806B'},
});

export default function CodeEditor({value, onChange, marks, readOnly, handleRef}: {value: string; onChange(text: string): void; marks: EditorMark[]; readOnly?: boolean; handleRef?: {current: EditorHandle | null}}) {
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null), change = useRef(onChange);
  change.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({doc: value, extensions: [basicSetup, cpp(), lintGutter(), theme, EditorView.contentAttributes.of({'aria-label': 'Código del programa', spellcheck: 'false'}), EditorView.updateListener.of(u => { if (u.docChanged) change.current(u.state.doc.toString()); })]}),
    });
    view.current = v;
    if (handleRef) handleRef.current = {goto: line => { const l = v.state.doc.line(Math.min(Math.max(1, line), v.state.doc.lines)); v.dispatch({selection: {anchor: l.from}, scrollIntoView: true}); v.focus(); }};
    return () => { v.destroy(); view.current = null; if (handleRef) handleRef.current = null; };
  }, []);

  // Cambios que vienen de fuera (otra placa, otro proyecto): se reemplaza el texto sin perder el que se está escribiendo.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({changes: {from: 0, to: v.state.doc.length, insert: value}});
  }, [value]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const list: Diagnostic[] = marks.filter(m => m.line > 0 && m.line <= v.state.doc.lines).map(m => { const l = v.state.doc.line(m.line); return {from: l.from, to: Math.max(l.from, l.to), severity: 'error', message: m.message}; });
    v.dispatch(setDiagnostics(v.state, list));
  }, [marks, value]);

  return <div className="rb-code-host" ref={host} data-readonly={readOnly ? 'true' : undefined} />;
}
