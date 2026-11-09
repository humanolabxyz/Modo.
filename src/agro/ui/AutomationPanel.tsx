// Panel grande «Automatizar» (Fase 5b): escalera + entradas y salidas, y pantalla HMI con medidores. Todos los valores salen de la simulación.
import {useState} from 'react';
import {Undo2, X} from 'lucide-react';
import type {Entity} from '../model/types.ts';
import {timeInfo} from '../sim/clock.ts';
import {dayWeather} from '../sim/climate.ts';
import {viewOf} from '../sim/soil.ts';
import {deadVolumeL} from '../sim/step.ts';
import type {WorldSession} from '../world/session.ts';
import {HmiWidgets, IoList, ModeSwitch, ProgramEditor, boardView, type Report} from './BoardPanel.tsx';
import {tempNow} from './Shell.tsx';

const f0 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
const f1 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});

/** Panel flotante de automatización de un tablero. */
export function AutomationPanel({session, boardId, onBoard, onClose, report}: {session: WorldSession; boardId: string; onBoard(id: string): void; onClose(): void; report: Report}) {
  const [tab, setTab] = useState<'ladder' | 'hmi'>('ladder'), [sub, setSub] = useState<'alarms' | 'history' | null>(null);
  const boards = session.entities.filter(e => e.type === 'tablero'), entity = session.entity(boardId);
  if (!entity) return null;
  const {powered, auto} = boardView(entity, session);
  return <section className="agro-auto" role="dialog" aria-label={`Automatizar ${entity.label}`} data-testid="agro-auto" data-tab={tab}>
    <header>
      <div><h2>Automatizar</h2>{boards.length > 1 ? <select aria-label="Tablero" value={boardId} onChange={e => onBoard(e.target.value)}>{boards.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}</select> : <small>{entity.label}</small>}</div>
      <span className={`agro-live${powered ? ' on' : ''}`} data-testid="agro-auto-live">{powered ? 'Monitor en línea' : 'Sin energía'}</span>
      <button type="button" className="agro-ghost" disabled={!session.canUndo} onClick={() => session.undo()}><Undo2 size={16} aria-hidden="true" />Deshacer</button>
      <button type="button" className="agro-icon" aria-label="Cerrar Automatizar" onClick={onClose}><X size={18} aria-hidden="true" /></button>
    </header>
    <div className="agro-auto-tabs" role="tablist" aria-label="Vistas de automatización">
      <button type="button" role="tab" aria-selected={tab === 'ladder'} className={tab === 'ladder' ? 'on' : ''} data-testid="agro-auto-tab-ladder" onClick={() => setTab('ladder')}>Escalera</button>
      <button type="button" role="tab" aria-selected={tab === 'hmi'} className={tab === 'hmi' ? 'on' : ''} data-testid="agro-auto-tab-hmi" onClick={() => setTab('hmi')}>Pantalla HMI</button>
    </div>
    {tab === 'ladder' ? <div className="agro-auto-body">
      <div className="agro-auto-main"><ProgramEditor entity={entity} session={session} report={report} /></div>
      <aside className="agro-auto-side"><h3>Entradas y salidas</h3><ModeSwitch entity={entity} session={session} report={report} /><IoList entity={entity} session={session} />
        <p className="agro-muted agro-tiny">PLC genérico con direcciones al estilo Delta (X, Y, M, T, C): una convención para aprender, no la emulación de un PLC real. Se escanea en cada paso de la simulación (hasta 5 min con agua en movimiento, 10 min en reposo).</p></aside>
    </div> : <div className="agro-auto-body">
      <div className="agro-auto-main"><Screen entity={entity} session={session} report={report} sub={sub} onSub={setSub} /></div>
      <aside className="agro-auto-side"><h3>Comunicación</h3><Link entity={entity} session={session} /></aside>
    </div>}
    <p className="agro-demo">Los valores son los del modelo de simulación didáctico (clima ficticio): no son lecturas reales.</p>
  </section>;
}

function Gauge({value, unit, label, testid}: {value: string; unit: string; label: string; testid: string}) {
  return <div className="agro-gauge" data-testid={testid}><b>{value}</b><small>{label} · {unit}</small></div>;
}

/** La pantalla oscura del HMI: medidores y botones de modo. */
function Screen({entity, session, report, sub, onSub}: {entity: Entity; session: WorldSession; report: Report; sub: 'alarms' | 'history' | null; onSub(s: 'alarms' | 'history' | null): void}) {
  const a = session.analyze(), t = timeInfo(session.clock), w = dayWeather(session.clock.seed, t.dayIndex, t.doy), {powered, auto, inputs} = boardView(entity, session);
  const tank = session.entities.find(e => e.type === 'estanque'), emitters = Object.values(a.elements).filter(r => r.kind === 'emisor'), pumps = Object.values(a.elements).filter(r => r.kind === 'bomba');
  const cap = tank ? Number(tank.params.volumenMaxL ?? 10000) : 0, level = tank ? Number(tank.state.nivelL ?? 0) : 0, dead = tank ? deadVolumeL(tank) : 0;
  const bar = emitters.length ? Math.max(...emitters.map(r => (r.kind === 'emisor' ? r.pressureBar : 0))) : 0, kw = pumps.reduce((s, r) => s + (r.kind === 'bomba' && r.running ? r.shaftKw : 0), 0);
  const alerts = session.alerts(), running = a.balance.emittersLmin > 0.1;
  const state = !powered ? 'SIN ENERGÍA' : running ? 'EN OPERACIÓN' : 'EN ESPERA';
  const parcel = session.entities.find(e => e.type === 'parcela');
  return <div className="agro-screen" data-testid="agro-screen">
    <div className="agro-screen-head"><h3>AGRO / RIEGO {auto ? 'AUTOMÁTICO' : 'MANUAL'}</h3><span className={running && powered ? 'on' : ''} data-testid="agro-screen-state"><i aria-hidden="true" />{state}</span></div>
    <div className="agro-gauges">
      <Gauge testid="agro-g-flow" value={f0.format(a.balance.emittersLmin)} unit="L/min" label="Caudal" />
      <Gauge testid="agro-g-bar" value={f1.format(bar)} unit="bar" label="Presión" />
      <Gauge testid="agro-g-tank" value={tank ? `${f0.format(Math.max(0, level - dead) / Math.max(1, cap - dead) * 100)}%` : '—'} unit="agua útil" label="Nivel estanque" />
      <Gauge testid="agro-g-soil" value={inputs.availablePct === null ? (parcel ? `${f0.format(viewOf(parcel.state).available * 100)}%` : '—') : `${f0.format(inputs.availablePct)}%`} unit="agua útil" label="Humedad suelo" />
      <Gauge testid="agro-g-temp" value={`${f1.format(tempNow(w.tMinC, w.tMaxC, t.hour))}°`} unit="°C estimada" label="Temperatura" />
      <Gauge testid="agro-g-kw" value={f1.format(kw)} unit="kW" label="Potencia" />
    </div>
    <div className="agro-screen-btns">
      <button type="button" className={auto ? 'on' : ''} data-testid="agro-screen-auto" onClick={() => report(session.setState(entity.id, 'modo', 'auto'))}>Automático</button>
      <button type="button" className={!auto ? 'on' : ''} data-testid="agro-screen-manual" onClick={() => report(session.setState(entity.id, 'modo', 'manual'))}>Manual</button>
      <button type="button" className={sub === 'alarms' ? 'on' : ''} data-testid="agro-screen-alarms" onClick={() => onSub(sub === 'alarms' ? null : 'alarms')}>Alarmas ({alerts.length})</button>
      <button type="button" className={sub === 'history' ? 'on' : ''} data-testid="agro-screen-history" onClick={() => onSub(sub === 'history' ? null : 'history')}>Histórico</button>
    </div>
    {sub === 'alarms' && <ul className="agro-screen-list" data-testid="agro-screen-list">{alerts.length === 0 ? <li>Sin alarmas.</li> : alerts.map((x, i) => <li key={i} className={x.level}>{x.text}</li>)}</ul>}
    {sub === 'history' && <ul className="agro-screen-list" data-testid="agro-screen-list">{session.events.length === 0 ? <li>Todavía no hay sucesos.</li> : session.events.slice(-10).reverse().map((e, i) => { const x = timeInfo({simSeconds: e.at, startDate: session.clock.startDate}); return <li key={i} className={e.level}><small>{x.dateLabel} {x.timeLabel}</small> {e.text}</li>; })}</ul>}
    <HmiWidgets entity={entity} session={session} report={report} />
  </div>;
}

/** Datos de «comunicación» del PLC simulado. */
function Link({entity, session}: {entity: Entity; session: WorldSession}) {
  const {powered, auto, inputs} = boardView(entity, session), t = timeInfo(session.clock);
  const rows: [string, string][] = [['PLC', 'Genérico (direcciones tipo Delta)'], ['Origen del dato', 'Simulado'], ['Última lectura', t.timeLabel], ['Modo', auto ? 'Automático' : 'Manual'], ['Sonda', inputs.sensor ? inputs.sensor.label : 'Sin cablear'], ['Usuario', 'Operador']];
  return <><dl className="agro-readings">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <p className={`agro-why${powered ? ' ready' : ''}`} role="status">{powered ? 'Comunicación activa: los valores reflejan el estado del modelo de simulación.' : 'Sin energía: el PLC no corre.'}</p></>;
}
