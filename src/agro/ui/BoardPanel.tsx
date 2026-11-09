// Piezas del tablero con PLC (Fase 5): modo de mando, entradas y salidas, widgets de la pantalla y editor del programa en escalera.
// Reutiliza de Industria el dibujo de la escalera (`LadderNetwork`) y el motor de escaneo. El panel grande «Automatizar» las compone; el inspector solo muestra un resumen.
import {useState} from 'react';
import {Cpu, Plus, X} from 'lucide-react';
import LadderNetwork from '../../industria/views/LadderNetwork.tsx';
import type {CoilMode} from '../../industria/model/types.ts';
import type {Entity} from '../model/types.ts';
import {ADDRESSES, IO_LABELS, addBranch, addContact, addRung, addWidget, addressKind, addressLabel, checkProgram, readRuntime, removeBranch, removeContact, removeRung, removeWidget, rungFlow, setCoil, toggleContact} from '../plc/program.ts';
import {boardPowered, plcInputs} from '../sim/plc.ts';
import {timeInfo} from '../sim/clock.ts';
import type {WorldSession} from '../world/session.ts';

export type Report = (r: {ok: boolean; error?: string}) => void;
const pct = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
const MODE_LABEL: Record<CoilMode, string> = {out: 'Salida', set: 'Enclavar (set)', reset: 'Soltar (reset)', ton: 'Temporizador (ms)', ctu: 'Contador', ctr: 'Reiniciar contador'};
const COIL_TAGS = ADDRESSES.filter(a => addressKind(a) !== 'input');

/** Lo que el panel necesita saber de un tablero en este instante. */
export function boardView(entity: Entity, session: WorldSession) {
  const program = session.program(entity.id), rt = readRuntime(entity.state, program), powered = boardPowered(session.entities, session.connections, entity);
  return {program, rt, powered, auto: entity.state.modo === 'auto', inputs: plcInputs(session.entities, session.connections, entity, timeInfo(session.clock).hour)};
}

/** Manual o automático. */
export function ModeSwitch({entity, session, report, prefix = 'agro-mode'}: {entity: Entity; session: WorldSession; report: Report; prefix?: string}) {
  const auto = entity.state.modo === 'auto';
  return <>
    <div className="agro-seg" role="radiogroup" aria-label="Modo de mando del tablero">
      {(['manual', 'auto'] as const).map(m => <button key={m} type="button" role="radio" aria-checked={(m === 'auto') === auto} className={(m === 'auto') === auto ? 'on' : ''} data-testid={`${prefix}-${m}`} onClick={() => report(session.setState(entity.id, 'modo', m))}>{m === 'auto' ? 'Automático (PLC)' : 'Manual'}</button>)}
    </div>
    <p className="agro-muted agro-tiny">{auto ? 'Automático: además del interruptor general, la bomba solo recibe energía cuando el PLC activa la salida Y0.' : 'Manual: el interruptor general energiza la bomba directamente; el PLC no la controla.'}</p>
  </>;
}

/** Entradas y salidas con su valor en vivo. */
export function IoList({entity, session}: {entity: Entity; session: WorldSession}) {
  const {rt, powered, inputs} = boardView(entity, session);
  return <>
    <p className="agro-plc-state" data-testid="agro-plc-power" data-powered={powered}>{powered ? 'PLC con energía' : entity.state.interruptor === true ? 'PLC sin energía: conecta la acometida a «Red de entrada»' : 'PLC sin energía: el interruptor general está apagado'}</p>
    <p className="agro-muted agro-tiny" data-testid="agro-plc-probe">{inputs.sensor ? `Sonda: «${inputs.sensor.label}»${inputs.availablePct === null ? ' (fuera de toda parcela)' : ` · agua útil ${pct.format(inputs.availablePct)} %`}` : 'Sin sonda cableada a «Entrada de sensor» (conéctala en la pestaña Conexiones).'}</p>
    <ul className="agro-io" data-testid="agro-plc-io" aria-label="Entradas y salidas del PLC">{['X0', 'X1', 'X2', 'X3', 'Y0', 'Y1'].map(a => { const on = powered && !!rt.values[a]; return <li key={a} data-addr={a} data-on={on}><i className={on ? 'on' : ''} aria-hidden="true" /><b>{a}</b><span>{IO_LABELS[a]}</span><em>{on ? '1' : '0'}</em></li>; })}</ul>
  </>;
}

/** Pilotos, interruptores y textos de la pantalla del tablero. */
export function HmiWidgets({entity, session, report}: {entity: Entity; session: WorldSession; report: Report}) {
  const {program, rt, powered} = boardView(entity, session);
  if (program.hmi.length === 0) return <p className="agro-muted agro-tiny">Sin widgets. Carga el ejemplo o agrégalos desde la pestaña Escalera.</p>;
  return <div className="agro-hmi" data-testid="agro-hmi" role="group" aria-label="Pantalla HMI del tablero">
    {program.hmi.map(w => {
      const on = !!w.tag && powered && !!rt.values[w.tag];
      if (w.kind === 'label') return <p key={w.id} className="agro-hmi-label">{w.label}</p>;
      if (w.kind === 'lamp') return <div key={w.id} className={`agro-hmi-lamp${on ? ' on' : ''}`} data-testid={`agro-hmi-lamp-${w.tag}`} data-on={on} role="img" aria-label={`${w.label}: ${on ? 'encendido' : 'apagado'}`}><i aria-hidden="true" />{w.label}</div>;
      return <button key={w.id} type="button" role="switch" aria-checked={on} disabled={!powered} title={powered ? undefined : 'Sin energía'} className={`agro-hmi-switch${on ? ' on' : ''}`} data-testid={`agro-hmi-switch-${w.tag}`} onClick={() => report(session.setTag(entity.id, w.tag!, !on))}>{w.label}<span>{on ? 'Sí' : 'No'}</span></button>;
    })}
  </div>;
}

/** Resumen del tablero en el inspector: el trabajo grande se hace en «Automatizar». */
export function BoardSummary({entity, session, report, onOpen}: {entity: Entity; session: WorldSession; report: Report; onOpen(): void}) {
  const {program, powered, auto} = boardView(entity, session);
  return <>
    <h4>Modo de mando</h4>
    <ModeSwitch entity={entity} session={session} report={report} prefix="agro-ins-mode" />
    <p className="agro-plc-state" data-powered={powered}>{powered ? 'PLC con energía' : 'PLC sin energía'} · {program.rungs.length} {program.rungs.length === 1 ? 'línea' : 'líneas'} · {auto ? 'mando automático' : 'mando manual'}</p>
    <button type="button" className="agro-primary agro-wide" data-testid="agro-open-automate" onClick={onOpen}><Cpu size={18} aria-hidden="true" />Abrir Automatizar (escalera y pantalla)</button>
  </>;
}

/** Editor del programa: carga de ejemplo, líneas con su escalera dibujada, edición y pantalla. */
export function ProgramEditor({entity, session, report}: {entity: Entity; session: WorldSession; report: Report}) {
  const {program, rt, powered} = boardView(entity, session);
  const issues = checkProgram(program), edit = (f: Parameters<WorldSession['editProgram']>[1]) => report(session.editProgram(entity.id, f));
  const [newCoil, setNewCoil] = useState('M5');   // no M0/M1, que usan los interruptores de la pantalla de ejemplo
  return <>
    <div className="agro-actions">
      <button type="button" className="agro-primary" data-testid="agro-plc-example" onClick={() => report(session.loadExample(entity.id))}>Cargar ejemplo: riego por humedad</button>
      {program.rungs.length > 0 && <button type="button" className="agro-ghost" data-testid="agro-plc-clear" onClick={() => report(session.clearProgram(entity.id))}>Quitar programa</button>}
    </div>
    {issues.length > 0 && <ul className="agro-plain agro-plc-issues" data-testid="agro-plc-issues" role="status">{issues.map((i, k) => <li key={k} className={i.severity}>{i.message}</li>)}</ul>}
    {program.rungs.length === 0 && <p className="agro-muted agro-tiny">Sin programa. Carga el ejemplo o arma tus líneas abajo.</p>}
    <div data-testid="agro-plc-rungs">
      {program.rungs.map((r, i) => {
        const flow = rungFlow(r, rt.values);
        return <section key={r.id} className="agro-rung" aria-label={`Línea ${i + 1}`} data-testid={`agro-rung-${i}`} data-on={powered && flow.on}>
          <header><b>Línea {i + 1}</b><button type="button" className="agro-icon agro-mini-icon" aria-label={`Eliminar la línea ${i + 1}`} onClick={() => edit(p => removeRung(p, r.id))}><X size={14} aria-hidden="true" /></button></header>
          {r.comment && <p className="agro-muted agro-tiny">{r.comment}</p>}
          <LadderNetwork rung={r} number={i + 1} flow={flow} live={powered} />
          <details>
            <summary>Editar la línea {i + 1}</summary>
            {r.branches.map((b, bi) => <div key={bi} className="agro-branch">
              <small>Rama {bi + 1}{bi > 0 ? ' (en paralelo)' : ''}</small>
              <div className="agro-contacts">
                {b.map((c, ci) => <span key={ci} className="agro-contact"><b>{c.nc ? '/' : ''}{c.tag}</b>
                  <button type="button" aria-label={`Cambiar ${c.tag} a ${c.nc ? 'normalmente abierto' : 'normalmente cerrado'}`} title={c.nc ? 'Normalmente cerrado: pasa si la variable está apagada' : 'Normalmente abierto: pasa si la variable está activa'} onClick={() => edit(p => toggleContact(p, r.id, bi, ci))}>{c.nc ? 'NC' : 'NA'}</button>
                  <button type="button" aria-label={`Quitar el contacto ${c.tag}`} onClick={() => edit(p => removeContact(p, r.id, bi, ci))}><X size={12} aria-hidden="true" /></button></span>)}
                <select aria-label={`Añadir contacto a la rama ${bi + 1} de la línea ${i + 1}`} value="" onChange={e => { if (e.target.value) edit(p => addContact(p, r.id, bi, {tag: e.target.value})); }}>
                  <option value="">+ contacto…</option>{ADDRESSES.map(a => <option key={a} value={a}>{a}</option>)}</select>
                {r.branches.length > 1 && <button type="button" className="agro-ghost agro-mini-btn" aria-label={`Quitar la rama ${bi + 1} de la línea ${i + 1}`} onClick={() => edit(p => removeBranch(p, r.id, bi))}>Quitar rama</button>}
              </div>
            </div>)}
            <button type="button" className="agro-ghost agro-mini-btn" onClick={() => edit(p => addBranch(p, r.id))}>Añadir rama en paralelo</button>
            <div className="agro-coil">
              <label>Bobina<select aria-label={`Variable de la bobina de la línea ${i + 1}`} value={r.coil.tag} onChange={e => edit(p => setCoil(p, r.id, {tag: e.target.value, mode: r.coil.mode, preset: r.coil.preset}))}>{COIL_TAGS.map(a => <option key={a} value={a}>{a}</option>)}</select></label>
              <label>Tipo<select aria-label={`Tipo de bobina de la línea ${i + 1}`} value={r.coil.mode} onChange={e => edit(p => setCoil(p, r.id, {tag: r.coil.tag, mode: e.target.value as CoilMode}))}>{(Object.keys(MODE_LABEL) as CoilMode[]).map(m => <option key={m} value={m}>{MODE_LABEL[m]}</option>)}</select></label>
              {(r.coil.mode === 'ton' || r.coil.mode === 'ctu') && <PresetField key={`${r.id}-${r.coil.preset}`} rung={r.id} index={i} mode={r.coil.mode} value={r.coil.preset ?? 0} onCommit={v => edit(p => setCoil(p, r.id, {tag: r.coil.tag, mode: r.coil.mode, preset: v}))} />}
            </div>
          </details>
        </section>;
      })}
    </div>
    {program.rungs.length < 12 && <div className="agro-row agro-newrung">
      <label className="agro-field"><span>Nueva línea: bobina</span><select aria-label="Variable de la nueva línea" value={newCoil} onChange={e => setNewCoil(e.target.value)} data-testid="agro-new-coil">{COIL_TAGS.map(a => <option key={a} value={a}>{a} · {addressLabel(a)}</option>)}</select></label>
      <button type="button" className="agro-ghost" data-testid="agro-add-rung" onClick={() => edit(p => addRung(p, {tag: newCoil}, []))}><Plus size={14} aria-hidden="true" />Añadir línea</button>
    </div>}
    <h4>Pantalla: widgets</h4>
    <div className="agro-row agro-newrung">
      <button type="button" className="agro-ghost agro-mini-btn" onClick={() => edit(p => addWidget(p, {kind: 'switch', label: 'Interruptor', tag: 'M1'}))}>+ Interruptor (M1)</button>
      <button type="button" className="agro-ghost agro-mini-btn" onClick={() => edit(p => addWidget(p, {kind: 'lamp', label: 'Piloto', tag: 'Y1'}))}>+ Piloto (Y1)</button>
      {program.hmi.length > 0 && <button type="button" className="agro-ghost agro-mini-btn" aria-label="Quitar el último widget de la pantalla" onClick={() => edit(p => removeWidget(p, p.hmi[p.hmi.length - 1].id))}>Quitar último</button>}
    </div>
  </>;
}

function PresetField({rung, index, mode, value, onCommit}: {rung: string; index: number; mode: CoilMode; value: number; onCommit(v: number): void}) {
  const [text, setText] = useState(String(value));
  return <label>{mode === 'ton' ? 'Tiempo (ms)' : 'Cuenta'}<input type="number" inputMode="numeric" min={1} step={1} aria-label={`${mode === 'ton' ? 'Tiempo en milisegundos' : 'Valor de cuenta'} de la línea ${index + 1}`} key={rung} value={text} onChange={e => setText(e.target.value)} onBlur={() => { const v = Math.round(Number(text)); if (Number.isFinite(v) && v !== value) onCommit(v); else setText(String(value)); }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>;
}
