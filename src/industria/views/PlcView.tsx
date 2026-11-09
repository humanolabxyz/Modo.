import {useEffect, useState} from 'react';
import {Plus, Trash2, X} from 'lucide-react';
import {COIL_MODES, type CoilMode, type IndustryProject, type Result} from '../model/types.ts';
import {addBranch, addContact, addMemory, addRung, checkProgram, defaultPreset, isPlc, programOf, removeBranch, removeContact, removeMemory, removeRung, rungFlow, setCoil, setTerminalTag, tagsOf, terminalDirection, toggleContact, PLC_DEFINITION} from '../plc/program.ts';
import type {SimResult} from '../sim/engine.ts';
import type {ViewId} from '../model/ui';
import LadderNetwork from './LadderNetwork';
import {shapeOf} from '../build/shapes.ts';

const MODE_TEXT: Record<CoilMode, string> = {out: 'Salida ( )', set: 'Activar (S)', reset: 'Desactivar (R)', ton: 'Temporizador TON', ctu: 'Contador CTU', ctr: 'Reset de contador'};
type Change = (f: (p: IndustryProject) => Result<IndustryProject>) => Result<IndustryProject>;
export type PlcViewProps = {project: IndustryProject; selection: readonly string[]; sim: SimResult | null; editable: boolean; onSimulate(): void; onLocate(id: string, view: ViewId): void; onChange: Change; showIssues?: boolean};

function TagInput({value, disabled, label, onCommit}: {value: string; disabled: boolean; label: string; onCommit(v: string): void}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  const commit = () => { const v = text.trim(); if (v !== value) onCommit(v); };
  return <input value={text} aria-label={label} disabled={disabled} maxLength={30} placeholder="sin variable" onChange={e => setText(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />;
}

/** Editor y monitor de las mismas redes Ladder del simulador. */
export default function PlcView({project, selection, sim, editable: canEdit, onChange, onSimulate, onLocate, showIssues = true}: PlcViewProps) {
  const plcs = project.entities.filter(e => e.definitionId === PLC_DEFINITION);
  const [mode, setMode] = useState<'edit' | 'monitor'>('edit');
  const [validated, setValidated] = useState<{project: IndustryProject; plcId: string}>();
  const monitoring = mode === 'monitor' || !!sim;
  const editable = canEdit && !monitoring;
  const [pick, setPick] = useState('');
  const [mem, setMem] = useState('');
  const [newCoil, setNewCoil] = useState('');
  const plcId = plcs.find(e => e.id === pick)?.id ?? plcs.find(e => selection.includes(e.id))?.id ?? plcs[0]?.id ?? '';
  if (!plcId || !isPlc(project, plcId)) return <section className="ind-plc rb-canvas-overlay" aria-label="Programa del PLC"><strong>PLC</strong><p className="ind-note">No hay un PLC en el proyecto. Coloca «PLC compacto» desde Piezas para asociar variables y programarlo.</p></section>;

  const plc = project.entities.find(e => e.id === plcId)!, program = programOf(project, plcId), tags = tagsOf(project, plcId), live = sim?.plc[plcId], vals = live?.tags ?? {};
  const issues = checkProgram(project, plcId), terminals = (shapeOf(plc.definitionId).terminals ?? []).filter(t => terminalDirection(t.id));
  const names = tags.map(t => t.name);
  const run = (f: (p: IndustryProject) => Result<IndustryProject>) => { if (editable) onChange(f); };

  return <section className="ind-plc rb-canvas-overlay" aria-label="Programa del PLC">
    <div className="ind-plc-head">
      <strong>PLC</strong>
      {plcs.length > 1 ? <label className="ind-field"><span>Controlador</span><select value={plcId} onChange={e => setPick(e.target.value)}>{plcs.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label> : <span>{plc.label}</span>}
      <span className="ind-chipstate" data-on={!!live?.powered}>{!sim ? 'Sin simular' : live?.powered ? 'Alimentado' : 'Sin alimentar'}</span>
      <span className="ind-note">Controlador didáctico · contactos, bobinas, TON y CTU</span>
      <div className="ind-chips ind-work-switch" role="group" aria-label="Modo del PLC">
        <button type="button" aria-pressed={!monitoring} disabled={!canEdit} onClick={() => setMode('edit')}>Editar Ladder</button>
        <button type="button" aria-pressed={monitoring} onClick={() => setMode('monitor')}>Monitorizar</button>
        {showIssues && <button type="button" onClick={() => setValidated({project, plcId})}>Validar programa</button>}
        {!sim && <button type="button" onClick={onSimulate}>Simular PLC</button>}
      </div>
    </div>
    {showIssues && validated?.project === project && validated.plcId === plcId && <p className="ind-related" role="status">{issues.length ? 'Validación: ' + issues.length + ' aviso(s). Revisa la lista del programa.' : 'Validación del modelo: sin avisos.'}</p>}
    <div className="ind-plc-body" data-monitor={monitoring}>
      <div className="ind-plc-vars">
        <div className="ind-related"><strong>Proyecto PLC</strong><span>{plc.label}</span><button type="button" onClick={() => onLocate(plcId, 'plant')}>Localizar controlador</button></div>
        <h4>Variables de E/S</h4>
        <ul className="ind-io" aria-label="Entradas y salidas">{terminals.map(t => { const tag = tags.find(x => x.terminalId === t.id);
          const peers = project.connections.flatMap(c => c.a.entityId === plcId && c.a.terminalId === t.id ? [c.b] : c.b.entityId === plcId && c.b.terminalId === t.id ? [c.a] : []);
          return <li key={t.id} data-on={!!(tag && vals[tag.name])}>
          <code>{t.label}</code><TagInput value={tag?.name ?? ''} label={`Variable de ${t.label}`} disabled={!editable} onCommit={v => run(p => setTerminalTag(p, plcId, t.id, v || null))} />
          <b aria-label={`Valor de ${t.label}`}>{sim && tag ? (vals[tag.name] ? '1' : '0') : '–'}</b>{peers.length > 0 && <small className="ind-plc-peer">{peers.map((ref, index) => <button key={index} type="button" onClick={() => onLocate(ref.entityId, 'plant')}>{project.entities.find(e => e.id === ref.entityId)?.label}.{ref.terminalId}</button>)}</small>}</li>; })}</ul>
        <h4>Variables internas</h4>
        <ul className="ind-io" aria-label="Variables internas">{program.memory.map(m => <li key={m} data-on={!!vals[m]}><code>M</code><span>{m}</span><b>{sim ? (vals[m] ? '1' : '0') : '–'}</b>
          <button type="button" aria-label={`Quitar ${m}`} disabled={!editable} onClick={() => run(p => removeMemory(p, plcId, m))}><X size={13} /></button></li>)}</ul>
        <div className="ind-add"><input value={mem} aria-label="Nueva variable interna" placeholder="Nueva variable interna" maxLength={30} disabled={!editable} onChange={e => setMem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && mem.trim()) { if (onChange(p => addMemory(p, plcId, mem.trim())).ok) setMem(''); } }} />
          <button type="button" disabled={!editable || !mem.trim()} onClick={() => { if (onChange(p => addMemory(p, plcId, mem.trim())).ok) setMem(''); }}><Plus size={14} /> Añadir</button></div>
      </div>
      <div className="ind-ladder">
        <h4>Programa ({program.rungs.length} línea{program.rungs.length === 1 ? '' : 's'})</h4>
        {program.rungs.length === 0 && <p className="ind-note">Sin líneas. Asocia variables a las entradas y salidas, y añade una línea con su bobina.</p>}
        {program.rungs.map((r, i) => { const flow = rungFlow(r, vals); return <div className="ind-rung" key={r.id} data-on={!!sim && flow.on} data-rung={i + 1}>
          <div className="ind-rung-head"><b>Línea {i + 1}</b>{r.comment && <span className="ind-note">{r.comment}</span>}
            <button type="button" aria-label={`Eliminar la línea ${i + 1}`} disabled={!editable} onClick={() => run(p => removeRung(p, plcId, r.id))}><Trash2 size={13} /></button></div>
          <LadderNetwork rung={r} number={i + 1} flow={flow} live={!!sim} />
          <div className="ind-rung-body">
            <div className="ind-branches">{r.branches.map((b, bi) => <div className="ind-branch" key={bi} role="group" aria-label={`Línea ${i + 1}, rama ${bi + 1}`}>
              {b.map((c, ci) => <span className="ind-contact" key={ci} data-on={!!sim && flow.branches[bi][ci]}>
                <button type="button" className="ind-contact-main" disabled={!editable} title="Alternar normalmente abierto / cerrado" onClick={() => run(p => toggleContact(p, plcId, r.id, bi, ci))}>{c.nc ? `/${c.tag}` : c.tag}</button>
                <button type="button" aria-label={`Quitar ${c.tag} de la línea ${i + 1}`} disabled={!editable} onClick={() => run(p => removeContact(p, plcId, r.id, bi, ci))}><X size={11} /></button></span>)}
              <select aria-label={`Añadir contacto a la línea ${i + 1}, rama ${bi + 1}`} disabled={!editable} value="" onChange={e => { if (e.target.value) run(p => addContact(p, plcId, r.id, bi, {tag: e.target.value})); }}><option value="">+ contacto</option>{names.map(n => <option key={n} value={n}>{n}</option>)}</select>
              {r.branches.length > 1 && <button type="button" aria-label={`Quitar la rama ${bi + 1} de la línea ${i + 1}`} disabled={!editable} onClick={() => run(p => removeBranch(p, plcId, r.id, bi))}><X size={12} /></button>}
            </div>)}
            <button type="button" className="ind-add-branch" disabled={!editable} onClick={() => run(p => addBranch(p, plcId, r.id))}><Plus size={12} /> Rama en paralelo</button></div>
            <div className="ind-coil" data-on={!!sim && !!vals[r.coil.tag]}>
              <select aria-label={`Tipo de bobina de la línea ${i + 1}`} disabled={!editable} value={r.coil.mode} onChange={e => run(p => setCoil(p, plcId, r.id, {tag: r.coil.tag, mode: e.target.value as CoilMode, preset: defaultPreset(e.target.value as CoilMode)}))}>{COIL_MODES.map(m => <option key={m} value={m}>{MODE_TEXT[m]}</option>)}</select>
              {(r.coil.mode === 'ton' || r.coil.mode === 'ctu') && <label className="ind-preset"><span>{r.coil.mode === 'ton' ? 'Tiempo (ms)' : 'Cuenta'}</span><input type="number" min={1} defaultValue={r.coil.preset} key={`${r.id}${r.coil.mode}${r.coil.preset}`} aria-label={`${r.coil.mode === 'ton' ? 'Tiempo en ms' : 'Valor de cuenta'} de la línea ${i + 1}`} disabled={!editable} onBlur={e => { const v = Number(e.target.value); if (Number.isInteger(v) && v !== r.coil.preset) run(p => setCoil(p, plcId, r.id, {tag: r.coil.tag, mode: r.coil.mode, preset: v})); }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>}
              {sim && (r.coil.mode === 'ton' || r.coil.mode === 'ctu') && <small className="ind-progress-small" aria-label={`Avance de la línea ${i + 1}`}>{r.coil.mode === 'ton' ? `${Math.min(live?.state.timers[r.id] ?? 0, r.coil.preset ?? 0)} / ${r.coil.preset} ms` : `${live?.state.counters[r.coil.tag]?.n ?? 0} / ${r.coil.preset}`}</small>}
              <select aria-label={`Variable de la bobina de la línea ${i + 1}`} disabled={!editable} value={r.coil.tag} onChange={e => run(p => setCoil(p, plcId, r.id, {tag: e.target.value, mode: r.coil.mode}))}>{!names.includes(r.coil.tag) && <option value={r.coil.tag}>{r.coil.tag} (sin definir)</option>}{names.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          </div></div>; })}
        <div className="ind-add"><select aria-label="Variable de la bobina nueva" value={newCoil} disabled={!editable} onChange={e => setNewCoil(e.target.value)}><option value="">Elige la variable de salida</option>{tags.filter(t => t.kind !== 'input').map(t => <option key={t.name} value={t.name}>{t.name}</option>)}</select>
          <button type="button" disabled={!editable || !newCoil} onClick={() => { if (onChange(p => addRung(p, plcId, {tag: newCoil})).ok) setNewCoil(''); }}><Plus size={14} /> Añadir línea</button></div>
        {showIssues && issues.length > 0 && <div className="ind-issues" role="alert"><h4>Avisos del programa ({issues.length})</h4><ul>{issues.map((it, k) => <li key={k} data-severity={it.severity}>{it.message}</li>)}</ul></div>}
      </div>
    </div>
  </section>;
}
