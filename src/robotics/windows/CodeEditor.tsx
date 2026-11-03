// Editor CodeMirror 6 (D-05): C++, números de línea, marcas de error. Se carga bajo demanda (React.lazy) para que el resto de la pizarra no cargue el editor.
import {useEffect, useRef} from 'react';
import {EditorView, basicSetup} from 'codemirror';
import {EditorState, Prec, StateEffect, StateField} from '@codemirror/state';
import {Decoration, WidgetType, keymap, type DecorationSet} from '@codemirror/view';
import {cpp} from '@codemirror/lang-cpp';
import {HighlightStyle, syntaxHighlighting} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {lintGutter, setDiagnostics, type Diagnostic} from '@codemirror/lint';
import {ghostProgress} from './ghost';

export type EditorMark = {line: number; message: string};
export type EditorHandle = {goto(line: number): void; /** Escribe la siguiente línea del espectro (si lo hay). */ acceptGhostLine(): void};

const setGhost = StateEffect.define<string>();
class GhostWidget extends WidgetType {
  constructor(readonly text: string) { super(); }
  eq(o: GhostWidget) { return o.text === this.text; }
  toDOM() { const e = document.createElement('span'); e.className = 'cm-ghost'; e.setAttribute('aria-hidden', 'true'); e.textContent = this.text; return e; }
  ignoreEvent() { return true; }
}
const ghostField = StateField.define<{target: string; deco: DecorationSet}>({
  create: () => ({target: '', deco: Decoration.none}),
  update(v, tr) {
    let target = v.target, changed = tr.docChanged;
    for (const e of tr.effects) if (e.is(setGhost)) { target = e.value; changed = true; }
    if (!changed) return v;
    const doc = tr.state.doc.toString(), g = ghostProgress(doc, target);
    return {target, deco: g.state === 'typing' ? Decoration.set([Decoration.widget({widget: new GhostWidget(g.rest), side: 1}).range(tr.state.doc.length)]) : Decoration.none};
  },
  provide: f => EditorView.decorations.from(f, v => v.deco),
});

const theme = EditorView.theme({
  '&': {height: '100%', fontSize: '13px', color: '#e6edf7', border: '1px solid #293347', borderRadius: '12px', backgroundColor: '#0d1117', colorScheme: 'dark', overflow: 'hidden'},
  '.cm-content': {padding: '14px 0', caretColor: '#79b8ff'},
  '.cm-scroller': {fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', lineHeight: '1.7', overscrollBehavior: 'contain'},
  '.cm-gutters': {backgroundColor: '#101722', color: '#8293aa', borderRight: '1px solid #253044', paddingRight: '5px'},
  '.cm-activeLine, .cm-activeLineGutter': {backgroundColor: '#172338'},
  '.cm-cursor, .cm-dropCursor': {borderLeftColor: '#79b8ff'},
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {backgroundColor: '#244c7c'},
  '.cm-matchingBracket': {backgroundColor: '#294264', color: '#fff'},
  '.cm-selectionMatch': {backgroundColor: '#234268'},
  '.cm-panels, .cm-tooltip': {backgroundColor: '#161f2d', color: '#e6edf7', border: '1px solid #34435b'},
  '.cm-searchMatch': {backgroundColor: '#70531f'},
  '.cm-ghost': {color: '#79b8ff', opacity: '0.42', whiteSpace: 'pre-wrap', pointerEvents: 'none', userSelect: 'none'},
  '&.cm-focused': {outline: '2px solid #2563eb', outlineOffset: '2px'},
}, {dark: true});
const highlighting = HighlightStyle.define([
  {tag: tags.comment, color: '#8e9fb5'},
  {tag: [tags.keyword, tags.modifier], color: '#c4a0ff'},
  {tag: [tags.typeName, tags.className], color: '#79c0ff'},
  {tag: tags.function(tags.variableName), color: '#82baff'},
  {tag: [tags.string, tags.character], color: '#a8d5a2'},
  {tag: [tags.number, tags.bool, tags.atom], color: '#ffcb8b'},
  {tag: [tags.operator, tags.punctuation], color: '#c4d2e5'},
  {tag: [tags.variableName, tags.propertyName], color: '#e6edf7'},
  {tag: tags.meta, color: '#80d4dc'},
  {tag: tags.invalid, color: '#ff8893'},
]);

/** Tab: escribe la siguiente línea del espectro. Sin espectro no hace nada (Tab sigue moviendo el foco). */
function acceptLine(view: EditorView): boolean {
  const g = ghostProgress(view.state.doc.toString(), view.state.field(ghostField).target);
  if (g.state !== 'typing') return false;
  const nl = g.rest.indexOf('\n'), chunk = nl < 0 ? g.rest : g.rest.slice(0, nl + 1);
  view.dispatch({changes: {from: view.state.doc.length, insert: chunk}, selection: {anchor: view.state.doc.length + chunk.length}, scrollIntoView: true}); view.focus();
  return true;
}

export default function CodeEditor({value, onChange, marks, readOnly, handleRef, ghost = ''}: {value: string; onChange(text: string): void; marks: EditorMark[]; readOnly?: boolean; handleRef?: {current: EditorHandle | null}; /** Código que se debe escribir: se muestra en gris detrás de lo escrito. */ ghost?: string}) {
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null), change = useRef(onChange);
  change.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({doc: value, extensions: [basicSetup, EditorView.lineWrapping, ghostField, Prec.highest(keymap.of([{key: 'Tab', run: view => acceptLine(view)}])), cpp(), lintGutter(), theme, syntaxHighlighting(highlighting), EditorView.contentAttributes.of({'aria-label': 'Código del programa', spellcheck: 'false'}), EditorView.updateListener.of(u => { if (u.docChanged) change.current(u.state.doc.toString()); })]}),
    });
    view.current = v;
    if (handleRef) handleRef.current = {acceptGhostLine: () => { acceptLine(v); }, goto: line => { const l = v.state.doc.line(Math.min(Math.max(1, line), v.state.doc.lines)); v.dispatch({selection: {anchor: l.from}, scrollIntoView: true}); v.focus(); }};
    return () => { v.destroy(); view.current = null; if (handleRef) handleRef.current = null; };
  }, []);

  // Cambios que vienen de fuera (otra placa, otro proyecto): se reemplaza el texto sin perder el que se está escribiendo.
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({changes: {from: 0, to: v.state.doc.length, insert: value}});
  }, [value]);

  useEffect(() => { view.current?.dispatch({effects: setGhost.of(ghost)}); }, [ghost]);

  useEffect(() => {
    const v = view.current;
    if (!v) return;
    const list: Diagnostic[] = marks.filter(m => m.line > 0 && m.line <= v.state.doc.lines).map(m => { const l = v.state.doc.line(m.line); return {from: l.from, to: Math.max(l.from, l.to), severity: 'error', message: m.message}; });
    v.dispatch(setDiagnostics(v.state, list));
  }, [marks, value]);

  return <div className="rb-code-host" ref={host} data-readonly={readOnly ? 'true' : undefined} />;
}
