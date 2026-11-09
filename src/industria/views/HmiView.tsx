import {useState} from 'react';
import {Plus, X} from 'lucide-react';
import {HMI_WIDGET_KINDS, LIMITS, type HmiWidget, type HmiWidgetKind, type IndustryProject, type Result} from '../model/types.ts';
import {addWidget, removeWidget, tagsOf, updateWidget, widgetKindLabel, PLC_DEFINITION} from '../plc/program.ts';
import type {SimInputs, SimResult} from '../sim/engine.ts';

export type HmiViewProps = {
  project: IndustryProject; sim: SimResult | null; simRunning: boolean; inputs: SimInputs; editable: boolean;
  onChange(f: (p: IndustryProject) => Result<IndustryProject>): Result<IndustryProject>; onWrite(widgetId: string, kind: HmiWidgetKind, down: boolean): void;
};

/** Pantalla de operador: pilotos que leen variables y botones/interruptores que escriben variables internas del PLC. */
export default function HmiView({project, sim, simRunning, inputs, editable, onChange, onWrite}: HmiViewProps) {
  const plcs = project.entities.filter(e => e.definitionId === PLC_DEFINITION);
  const [kind, setKind] = useState<HmiWidgetKind>('lamp');
  const [label, setLabel] = useState('');
  const [plcId, setPlcId] = useState('');
  const [tag, setTag] = useState('');
  const [mode, setMode] = useState<'design' | 'operate'>('design');
  const [edited, setEdited] = useState('');
  const [slot, setSlot] = useState<number>();
  const designing = editable && mode === 'design';
  const reserved = new Set(project.hmi.widgets.flatMap(w => w.slot === undefined ? [] : [w.slot]));
  let next = 0;
  const widgets = project.hmi.widgets.map(w => {
    if (w.slot !== undefined) return {widget: w, position: w.slot};
    while (reserved.has(next)) next++;
    return {widget: w, position: next++};
  }).sort((a, b) => a.position - b.position);
  const edit = (w?: HmiWidget) => {
    setEdited(w?.id ?? '');
    setKind(w?.kind ?? 'lamp');
    setLabel(w?.label ?? '');
    setPlcId(w?.plcId ?? '');
    setTag(w?.tag ?? '');
    setSlot(w?.slot);
  };
  const chosenPlc = plcId || plcs[0]?.id || '';
  const candidates = chosenPlc ? tagsOf(project, chosenPlc).filter(t => (kind === 'button' || kind === 'switch' ? t.kind === 'memory' : true)) : [];
  const value = (w: HmiWidget) => !!(w.plcId && w.tag && sim?.plc[w.plcId]?.tags[w.tag]);
  const save = () => {
    const values = {kind, label: label.trim() || widgetKindLabel[kind], plcId: kind === 'label' ? undefined : chosenPlc, tag: kind === 'label' ? undefined : tag, slot};
    if (onChange(p => edited ? updateWidget(p, edited, values) : addWidget(p, values)).ok) edit();
  };

  return <section className="ind-hmi rb-canvas-overlay" aria-label="Pantalla de HMI">
    <div className="ind-plc-head"><strong>HMI</strong><span className="ind-chipstate" data-on={simRunning}>{simRunning ? 'En marcha' : sim ? 'En pausa' : 'Detenida'}</span>
      <span className="ind-note">Pantalla de operador vinculada al PLC simulado</span>
      <div className="ind-chips ind-work-switch" role="group" aria-label="Modo de HMI">
        <button type="button" aria-pressed={designing} disabled={!editable} onClick={() => setMode('design')}>Diseño</button>
        <button type="button" aria-pressed={!designing} onClick={() => setMode('operate')}>Operación</button>
      </div>
    </div>
    {project.hmi.widgets.length === 0 ? <p className="ind-note">La pantalla está vacía. Añade widgets abajo (hace falta un PLC con variables).</p>
      : <div className="ind-hmi-screen" role="group" aria-label="Widgets">{widgets.map(({widget: w, position}) => {
        const on = value(w), pressed = !!inputs[`hmi:${w.id}`];
        return <div className="ind-widget" key={w.id} data-kind={w.kind} data-on={on} data-selected={edited === w.id && designing} style={{gridColumn: position % 4 + 1, gridRow: Math.floor(position / 4) + 1}}>
          {w.kind === 'label' && <h3>{w.label}</h3>}
          {w.kind === 'lamp' && <><span className="ind-lamp" data-on={on} aria-label={`${w.label}: ${on ? 'encendido' : 'apagado'}`} role="img" /><span>{w.label}</span></>}
          {w.kind === 'button' && <button type="button" aria-pressed={pressed} disabled={!simRunning} title={`Mantén pulsado para escribir ${w.tag}`}
            onPointerDown={() => onWrite(w.id, 'button', true)} onPointerUp={() => onWrite(w.id, 'button', false)} onPointerCancel={() => onWrite(w.id, 'button', false)} onPointerLeave={() => pressed && onWrite(w.id, 'button', false)}
            onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); onWrite(w.id, 'button', true); } }} onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') onWrite(w.id, 'button', false); }}>{w.label}</button>}
          {w.kind === 'switch' && <button type="button" role="switch" aria-checked={pressed} disabled={!simRunning} onClick={() => onWrite(w.id, 'switch', true)}>{w.label}: {pressed ? 'ON' : 'OFF'}</button>}
          {w.tag && <small>{w.tag}</small>}
          {designing && <button type="button" className="ind-widget-x" aria-label={`Quitar el widget ${w.label}`} onClick={() => { if (onChange(p => removeWidget(p, w.id)).ok && edited === w.id) edit(); }}><X size={12} /></button>}
        </div>; })}</div>}
    {designing && <div className="ind-hmi-edit" role="group" aria-label="Nuevo widget">
      <label className="ind-field"><span>Objeto</span><select value={edited} onChange={e => edit(project.hmi.widgets.find(w => w.id === e.target.value))}>
        <option value="">Nuevo objeto</option>{project.hmi.widgets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
      </select></label>
      <label className="ind-field"><span>Posición en cuadrícula</span><select value={slot ?? ''} onChange={e => setSlot(e.target.value === '' ? undefined : Number(e.target.value))}>
        <option value="">Automática</option>{Array.from({length: LIMITS.widgets}, (_, i) => <option key={i} value={i} disabled={reserved.has(i) && i !== project.hmi.widgets.find(w => w.id === edited)?.slot}>Fila {Math.floor(i / 4) + 1} · columna {i % 4 + 1}</option>)}
      </select></label>
      <label className="ind-field"><span>Tipo</span><select value={kind} disabled={!editable} onChange={e => { setKind(e.target.value as HmiWidgetKind); setTag(''); }}>{HMI_WIDGET_KINDS.map(k => <option key={k} value={k}>{widgetKindLabel[k]}</option>)}</select></label>
      <label className="ind-field"><span>Texto</span><input value={label} maxLength={60} disabled={!editable} onChange={e => setLabel(e.target.value)} /></label>
      {kind !== 'label' && <><label className="ind-field"><span>PLC</span><select value={chosenPlc} disabled={!editable} onChange={e => { setPlcId(e.target.value); setTag(''); }}>{plcs.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
        <label className="ind-field"><span>Variable</span><select value={tag} disabled={!editable} onChange={e => setTag(e.target.value)}><option value="">Elige una variable</option>{candidates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}</select></label></>}
      <button type="button" className="ind-primary" disabled={!editable || (kind !== 'label' && !tag)} onClick={save}><Plus size={14} /> {edited ? 'Guardar objeto' : 'Añadir widget'}</button>
    </div>}
  </section>;
}
