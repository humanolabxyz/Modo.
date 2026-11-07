import {useMemo, useState} from 'react';
import {Download, Plus, Trash2} from 'lucide-react';
import {allTerminals, refKey} from '../wiring/engine.ts';
import {checkFromSpec, clearCustomActivity, describeCheck, prepareForStudents, setCustomActivity} from '../activities/activities.ts';
import {exportProject} from '../model/library.ts';
import {operableKind} from '../sim/engine.ts';
import {shapeOf} from '../build/shapes.ts';
import {PLC_DEFINITION, tagsOf} from '../plc/program.ts';
import {LIMITS, type CheckSpec, type EducationMode, type IndustryProject, type Result, type TerminalRef} from '../model/types.ts';

type Kind = CheckSpec['kind'];
const KIND_TEXT: Record<Kind, string> = {mounted: 'Pieza montada en otra', energized: 'Estado de un equipo tras accionar mandos', plcTag: 'Variable del PLC tras accionar mandos', sameNet: 'Dos terminales unidos (o no)', noErrors: 'Sin errores de topología'};
const ENERGY = ['contactor-3p', 'piloto', 'motor-3p', 'fuente-cc', PLC_DEFINITION];

export type ActivityEditorProps = {project: IndustryProject; editable: boolean; onChange(f: (p: IndustryProject) => Result<IndustryProject>): Result<IndustryProject>; onLog(text: string): void};

/** Editor de actividades: el docente arma la solución en el escenario, define comprobaciones (datos, no código) y exporta una copia para los alumnos. */
export default function ActivityEditor({project, editable, onChange, onLog}: ActivityEditorProps) {
  const saved = project.lesson.def;
  const [title, setTitle] = useState(saved?.title ?? '');
  const [summary, setSummary] = useState(saved?.summary ?? '');
  const [checks, setChecks] = useState<CheckSpec[]>(saved?.checks ?? []);
  const [kind, setKind] = useState<Kind>('energized');
  const [parent, setParent] = useState(''); const [child, setChild] = useState('');
  const [entity, setEntity] = useState(''); const [plc, setPlc] = useState(''); const [tag, setTag] = useState('');
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const [steps, setSteps] = useState<Record<string, boolean>[]>([{}]);
  const [expect, setExpect] = useState(true);
  const [text, setText] = useState(''); const [hint, setHint] = useState('');
  const [noWires, setNoWires] = useState(true); const [noProgram, setNoProgram] = useState(false); const [noMounts, setNoMounts] = useState(false); const [mode, setMode] = useState<EducationMode>('learning');
  const [error, setError] = useState('');

  const label = (id: string) => project.entities.find(e => e.id === id)?.label ?? id;
  const operables = project.entities.filter(e => operableKind(e.definitionId));
  const plcs = project.entities.filter(e => e.definitionId === PLC_DEFINITION);
  const terms = useMemo(() => allTerminals(project), [project]);
  const parseRef = (v: string): TerminalRef | null => { const i = v.indexOf(':'); return i > 0 ? {entityId: v.slice(0, i), terminalId: v.slice(i + 1)} : null; };
  const termText = (r: TerminalRef) => `${label(r.entityId)} · ${r.terminalId}`;

  const draft = (): CheckSpec | string => {
    const base = {id: `c${Date.now().toString(36)}${checks.length}`, text: '', hint};
    let spec: CheckSpec;
    if (kind === 'mounted') { if (!parent || !child || parent === child) return 'Elige la pieza soporte y la pieza montada (distintas).'; spec = {...base, kind, parent, child}; }
    else if (kind === 'energized') { if (!entity) return 'Elige el equipo.'; spec = {...base, kind, entity, steps, expect}; }
    else if (kind === 'plcTag') { if (!plc || !tag) return 'Elige el PLC y su variable.'; spec = {...base, kind, plc, tag, steps, expect}; }
    else if (kind === 'sameNet') { const ra = parseRef(a), rb = parseRef(b); if (!ra || !rb) return 'Elige los dos terminales.'; spec = {...base, kind, a: ra, b: rb, steps: steps.slice(-1), expect}; }
    else spec = {...base, kind: 'noErrors'};
    return {...spec, text: text.trim() || describeCheck(project, spec)};
  };
  const add = () => {
    if (checks.length >= LIMITS.checks) { setError(`Una actividad admite hasta ${LIMITS.checks} comprobaciones.`); return; }
    const d = draft(); if (typeof d === 'string') { setError(d); return; }
    setChecks(list => [...list, d]); setText(''); setHint(''); setError('');
  };
  const stepToggle = (i: number, id: string) => setSteps(list => list.map((st, k) => (k === i ? {...st, [id]: !st[id]} : st)));
  const save = () => {
    const r = onChange(p => setCustomActivity(p, {title, summary, checks}));
    if (!r.ok) setError(r.error); else { setError(''); onLog(`Actividad propia guardada: ${title}`); }
  };
  const download = () => {
    const copy = prepareForStudents({...project, lesson: {...project.lesson, def: {title, summary, checks}, activityId: 'custom'}}, {noWires, noProgram, noMounts, mode});
    const {text: body, filename} = exportProject(copy);
    const url = URL.createObjectURL(new Blob([body], {type: 'application/json'})); const el = document.createElement('a'); el.href = url; el.download = filename.replace('.industria.json', '.alumnos.industria.json'); el.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    onLog('Copia para alumnos exportada');
  };
  const live = (c: CheckSpec) => { try { return checkFromSpec(c).test(project); } catch { return false; } };

  return <details className="ind-editor"><summary>Crear una actividad con este proyecto</summary>
    <p className="ind-note">Arma la <b>solución</b> en el escenario, define qué debe cumplirse y exporta una copia para los alumnos sin cables, sin programa o sin montajes. Las comprobaciones miran el resultado, así que cualquier solución correcta pasa.</p>
    <label className="ind-field"><span>Título</span><input value={title} maxLength={LIMITS.name} disabled={!editable} onChange={e => setTitle(e.target.value)} /></label>
    <label className="ind-field"><span>Enunciado</span><textarea value={summary} maxLength={400} rows={3} disabled={!editable} onChange={e => setSummary(e.target.value)} /></label>
    <div className="ind-wire-form" role="group" aria-label="Nueva comprobación">
      <label className="ind-field"><span>Tipo de comprobación</span><select value={kind} onChange={e => { setKind(e.target.value as Kind); setError(''); }}>{(Object.keys(KIND_TEXT) as Kind[]).map(k => <option key={k} value={k}>{KIND_TEXT[k]}</option>)}</select></label>
      {kind === 'mounted' && <><label className="ind-field"><span>Soporte</span><select value={parent} onChange={e => setParent(e.target.value)}><option value="">Elige</option>{project.entities.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
        <label className="ind-field"><span>Pieza montada</span><select value={child} onChange={e => setChild(e.target.value)}><option value="">Elige</option>{project.entities.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label></>}
      {kind === 'energized' && <label className="ind-field"><span>Equipo</span><select value={entity} onChange={e => setEntity(e.target.value)}><option value="">Elige</option>{project.entities.filter(e => ENERGY.includes(e.definitionId)).map(e => <option key={e.id} value={e.id}>{e.label} ({shapeOf(e.definitionId).name})</option>)}</select></label>}
      {kind === 'plcTag' && <><label className="ind-field"><span>PLC</span><select value={plc} onChange={e => { setPlc(e.target.value); setTag(''); }}><option value="">Elige</option>{plcs.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
        <label className="ind-field"><span>Variable</span><select value={tag} onChange={e => setTag(e.target.value)}><option value="">Elige</option>{(plc ? tagsOf(project, plc) : []).map(t => <option key={t.name} value={t.name}>{t.name}</option>)}</select></label></>}
      {kind === 'sameNet' && <><label className="ind-field"><span>Terminal A</span><select value={a} onChange={e => setA(e.target.value)}><option value="">Elige</option>{terms.map(t => <option key={refKey(t)} value={refKey(t)}>{termText(t)}</option>)}</select></label>
        <label className="ind-field"><span>Terminal B</span><select value={b} onChange={e => setB(e.target.value)}><option value="">Elige</option>{terms.map(t => <option key={refKey(t)} value={refKey(t)}>{termText(t)}</option>)}</select></label></>}
      {(kind === 'energized' || kind === 'plcTag' || kind === 'sameNet') && <>
        <fieldset className="ind-steps-edit"><legend>{kind === 'sameNet' ? 'Mandos accionados' : 'Secuencia de mandos'}</legend>
          {(kind === 'sameNet' ? steps.slice(-1) : steps).map((st, i) => <div key={i} className="ind-step"><b>{kind === 'sameNet' ? 'Con' : `Paso ${i + 1}`}</b>
            {operables.length === 0 ? <small>No hay interruptores ni pulsadores.</small> : operables.map(o => <label key={o.id} className="ind-check"><input type="checkbox" checked={!!st[o.id]} onChange={() => stepToggle(kind === 'sameNet' ? steps.length - 1 : i, o.id)} /> {o.label}</label>)}</div>)}
          {kind !== 'sameNet' && <div className="ind-actions"><button type="button" onClick={() => setSteps(l => (l.length < LIMITS.steps ? [...l, {}] : l))}>+ Paso</button><button type="button" disabled={steps.length <= 1} onClick={() => setSteps(l => l.slice(0, -1))}>− Paso</button></div>}
          <small>Cada paso parte del estado del anterior (así un sello o un temporizador «recuerdan»). Marcado = cerrado, pulsado o disparado.</small></fieldset>
        <label className="ind-field"><span>Resultado esperado</span><select value={expect ? 'si' : 'no'} onChange={e => setExpect(e.target.value === 'si')}><option value="si">{kind === 'sameNet' ? 'Están unidos' : 'Sí'}</option><option value="no">{kind === 'sameNet' ? 'No están unidos' : 'No'}</option></select></label></>}
      <label className="ind-field"><span>Texto (vacío = automático)</span><input value={text} maxLength={200} onChange={e => setText(e.target.value)} /></label>
      <label className="ind-field"><span>Pista para Aprendizaje</span><input value={hint} maxLength={300} onChange={e => setHint(e.target.value)} /></label>
      <button type="button" className="ind-primary" disabled={!editable} onClick={add}><Plus size={14} /> Añadir comprobación</button>
    </div>
    {error && <p className="ind-note ind-error" role="alert">{error}</p>}
    <h4>Comprobaciones ({checks.length})</h4>
    {checks.length === 0 ? <p className="ind-note">Aún no hay comprobaciones.</p> : <ul className="ind-steps" aria-label="Comprobaciones de la actividad propia">{checks.map(c => <li key={c.id} data-state={live(c) ? 'ok' : 'todo'}><span aria-hidden="true">{live(c) ? '✓' : '✗'}</span><div><span>{c.text}</span></div>
      <button type="button" aria-label={`Quitar la comprobación: ${c.text}`} onClick={() => setChecks(l => l.filter(x => x.id !== c.id))}><Trash2 size={13} /></button></li>)}</ul>}
    <p className="ind-note">✓/✗ muestra si <b>este</b> proyecto (tu solución) cumple cada una: deberían ir todas en ✓. Ojo: una comprobación negativa («no está activo») también se cumple si el alumno no hace nada; combínala con una positiva.</p>
    <div className="ind-actions"><button type="button" className="ind-primary" disabled={!editable || !title.trim() || checks.length === 0} onClick={save}>Guardar actividad</button>
      {saved && <button type="button" disabled={!editable} onClick={() => { onChange(clearCustomActivity); setChecks([]); setTitle(''); setSummary(''); onLog('Actividad propia quitada'); }}>Quitar actividad</button>}</div>
    <h4>Copia para los alumnos</h4>
    <label className="ind-check"><input type="checkbox" checked={noWires} onChange={e => setNoWires(e.target.checked)} /> Sin cables</label>
    <label className="ind-check"><input type="checkbox" checked={noProgram} onChange={e => setNoProgram(e.target.checked)} /> Sin programa de PLC ni variables</label>
    <label className="ind-check"><input type="checkbox" checked={noMounts} onChange={e => setNoMounts(e.target.checked)} /> Sin montajes (piezas sueltas)</label>
    <label className="ind-field"><span>Modo con el que se abre</span><select value={mode} onChange={e => setMode(e.target.value as EducationMode)}><option value="learning">Aprendizaje</option><option value="test">Prueba</option><option value="free">Libre</option></select></label>
    <button type="button" className="ind-primary" disabled={checks.length === 0 || !title.trim()} onClick={download}><Download size={14} /> Exportar copia para alumnos</button>
  </details>;
}
