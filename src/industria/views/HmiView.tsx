import {useState} from 'react';
import {Plus, X} from 'lucide-react';
import {HMI_WIDGET_KINDS, type HmiWidget, type HmiWidgetKind, type IndustryProject, type Result} from '../model/types.ts';
import {addWidget, removeWidget, tagsOf, widgetKindLabel, PLC_DEFINITION} from '../plc/program.ts';
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
  const chosenPlc = plcId || plcs[0]?.id || '';
  const candidates = chosenPlc ? tagsOf(project, chosenPlc).filter(t => (kind === 'button' || kind === 'switch' ? t.kind === 'memory' : true)) : [];
  const value = (w: HmiWidget) => !!(w.plcId && w.tag && sim?.plc[w.plcId]?.tags[w.tag]);
  const add = () => { if (onChange(p => addWidget(p, {kind, label: label.trim() || widgetKindLabel[kind], ...(kind === 'label' ? {} : {plcId: chosenPlc, tag}) })).ok) { setLabel(''); setTag(''); } };

  return <section className="ind-hmi rb-canvas-overlay" aria-label="Pantalla de HMI">
    <div className="ind-plc-head"><strong>HMI</strong><span className="ind-chipstate" data-on={simRunning}>{simRunning ? 'En marcha' : sim ? 'En pausa' : 'Detenida'}</span>
      <span className="ind-note">Los botones e interruptores escriben variables internas del PLC; los pilotos las leen.</span></div>
    {project.hmi.widgets.length === 0 ? <p className="ind-note">La pantalla está vacía. Añade widgets abajo (hace falta un PLC con variables).</p>
      : <div className="ind-hmi-screen" role="group" aria-label="Widgets">{project.hmi.widgets.map(w => {
        const on = value(w), pressed = !!inputs[`hmi:${w.id}`];
        return <div className="ind-widget" key={w.id} data-kind={w.kind} data-on={on}>
          {w.kind === 'label' && <h3>{w.label}</h3>}
          {w.kind === 'lamp' && <><span className="ind-lamp" data-on={on} aria-label={`${w.label}: ${on ? 'encendido' : 'apagado'}`} role="img" /><span>{w.label}</span></>}
          {w.kind === 'button' && <button type="button" aria-pressed={pressed} disabled={!simRunning} title={`Mantén pulsado para escribir ${w.tag}`}
            onPointerDown={() => onWrite(w.id, 'button', true)} onPointerUp={() => onWrite(w.id, 'button', false)} onPointerLeave={() => pressed && onWrite(w.id, 'button', false)}
            onKeyDown={e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); onWrite(w.id, 'button', true); } }} onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') onWrite(w.id, 'button', false); }}>{w.label}</button>}
          {w.kind === 'switch' && <button type="button" role="switch" aria-checked={pressed} disabled={!simRunning} onClick={() => onWrite(w.id, 'switch', true)}>{w.label}: {pressed ? 'ON' : 'OFF'}</button>}
          {w.tag && <small>{w.tag}</small>}
          {editable && <button type="button" className="ind-widget-x" aria-label={`Quitar el widget ${w.label}`} onClick={() => onChange(p => removeWidget(p, w.id))}><X size={12} /></button>}
        </div>; })}</div>}
    <div className="ind-hmi-edit" role="group" aria-label="Nuevo widget">
      <label className="ind-field"><span>Tipo</span><select value={kind} disabled={!editable} onChange={e => { setKind(e.target.value as HmiWidgetKind); setTag(''); }}>{HMI_WIDGET_KINDS.map(k => <option key={k} value={k}>{widgetKindLabel[k]}</option>)}</select></label>
      <label className="ind-field"><span>Texto</span><input value={label} maxLength={60} disabled={!editable} onChange={e => setLabel(e.target.value)} /></label>
      {kind !== 'label' && <><label className="ind-field"><span>PLC</span><select value={chosenPlc} disabled={!editable} onChange={e => { setPlcId(e.target.value); setTag(''); }}>{plcs.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label>
        <label className="ind-field"><span>Variable</span><select value={tag} disabled={!editable} onChange={e => setTag(e.target.value)}><option value="">Elige una variable</option>{candidates.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}</select></label></>}
      <button type="button" className="ind-primary" disabled={!editable || (kind !== 'label' && !tag)} onClick={add}><Plus size={14} /> Añadir widget</button>
    </div>
  </section>;
}
