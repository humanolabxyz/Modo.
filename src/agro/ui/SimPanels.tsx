import {parcelArea,parcelPerimeter} from '../world/parcelGeometry.ts';
// Paneles de tiempo, alertas, parcela y cultivo (Fase 4).
import {useRef, useState} from 'react';
import {Bell, CalendarDays, Gauge, Pause, Play} from 'lucide-react';
import type {Entity, SimSpeed} from '../model/types.ts';
import {SIM_SPEEDS} from '../model/types.ts';
import {sensorReading} from '../sim/alerts.ts';
import {SPEED_LABELS, timeInfo} from '../sim/clock.ts';
import {CROPS} from '../sim/crops.ts';
import {coverageShare, irrigationByParcel} from '../sim/irrigation.ts';
import {deadVolumeL} from '../sim/step.ts';
import {SOILS, viewOf} from '../sim/soil.ts';
import type {WorldSession} from '../world/session.ts';

const f1 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});
const f0 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
type Report = (r: {ok: boolean; error?: string}) => void;
const SPEED_NAMES: Record<number, string> = {0: 'Pausa', 1: 'Tiempo real', 5: '5 veces', 20: '20 veces', 100: '100 veces', 3600: '1 hora por segundo', 86400: '1 día por segundo'};

/** Controles de fecha y reproducción del reloj simulado. */
export function TimeBar({session, lag}: {session: WorldSession; lag: boolean}) {
  const clock = session.clock, t = timeInfo(clock), paused = clock.speed === 0;
  const resumeSpeed = useRef<SimSpeed>(1);
  const changeSpeed = (value: SimSpeed) => {
    if (value) resumeSpeed.current = value;
    session.setSpeed(value);
  };
  return <div className="agro-time" role="group" aria-label="Tiempo de la simulación" data-testid="agro-time">
    <div className="agro-clock"><CalendarDays size={18} aria-hidden="true" /><div><b data-testid="agro-day">Día {t.dayIndex + 1}</b><span data-testid="agro-date">{t.dateLabel} · {t.timeLabel}</span></div></div>
    <div className="agro-playback">
      <button type="button" data-testid="agro-pause" className={paused ? 'on' : ''} aria-label={paused ? 'Reanudar' : 'Pausar'} onClick={() => {
        if (!paused) resumeSpeed.current = clock.speed;
        session.setSpeed(paused ? resumeSpeed.current : 0);
      }}>{paused ? <Play size={16} /> : <Pause size={16} />}<span>{paused ? 'Reanudar' : 'Pausa'}</span></button>
      <label><Gauge size={16} aria-hidden="true" /><select aria-label="Velocidad" value={clock.speed} onChange={e => changeSpeed(Number(e.target.value) as SimSpeed)}>
        {SIM_SPEEDS.map(s => <option key={s} value={s} title={SPEED_NAMES[s]}>{SPEED_LABELS[s]}</option>)}
      </select></label>
    </div>
    {lag && <p className="agro-lag" role="status" data-testid="agro-lag">Este equipo no alcanza la velocidad pedida: el tiempo avanza más lento.</p>}
  </div>;
}

export function SimulationAlerts({session}: {session: WorldSession}) {
  const [open, setOpen] = useState(false);
  const alerts = session.alerts(), recent = session.events.slice(-8).reverse();
  return <div className="agro-alert-wrap">
    <button type="button" className={`agro-alert-btn${alerts.some(a => a.level === 'bad') ? ' bad' : alerts.length ? ' warn' : ''}`} aria-expanded={open} aria-label={`Alertas: ${alerts.length}`} data-testid="agro-alert-btn" onClick={() => setOpen(v => !v)}><Bell size={16} aria-hidden="true" /><span>{alerts.length}</span></button>
    {open && <div className="agro-alerts" role="region" aria-label="Alertas y sucesos" data-testid="agro-alerts">
      <h4>Alertas activas</h4>
      {alerts.length === 0 ? <p className="agro-muted">Nada que atender.</p> : <ul>{alerts.map((a, i) => <li key={i} className={a.level}>{a.text}</li>)}</ul>}
      <h4>Últimos sucesos</h4>
      {recent.length === 0 ? <p className="agro-muted">Todavía no ha pasado nada.</p> : <ul>{recent.map((e, i) => { const x = timeInfo({simSeconds: e.at, startDate: session.clock.startDate}); return <li key={i} className={e.level}><small>{x.dateLabel} {x.timeLabel}</small> {e.text}</li>; })}</ul>}
    </div>}
  </div>;
}

/** Suelo, cultivo, humedad, balance de agua y acciones de siembra y cosecha de una parcela. */
export function ParcelPanel({entity, session, report}: {entity: Entity; session: WorldSession; report: Report}) {
  const v = viewOf(entity.state), s = entity.state, area = parcelArea(entity);
  const t = timeInfo(session.clock), age = typeof s.siembraDia === 'number' && s.siembraDia >= 0 ? t.dayIndex - s.siembraDia : null;
  const cycle = v.crop ? Math.min(1, v.gdd / v.crop.stages[v.crop.stages.length - 1].from) : 0;
  const num = (k: string) => Number(s[k] ?? 0);
  const rows: [string, string][] = [
    ['Humedad del suelo', `${f1.format(v.theta * 100)} % (${f0.format(v.waterMm)} mm)`],
    ['Agua útil', `${f0.format(v.available * 100)} %`],
    ['Estrés hídrico', v.crop && v.alive ? (v.ks >= 0.99 ? 'Sin estrés' : `${f0.format((1 - v.ks) * 100)} % de déficit`) : '—'],
  ];
  if (v.crop) rows.push(['Cultivo', `${v.crop.name}${v.alive ? '' : ' (muerto)'}`], ['Etapa', v.alive ? v.stage!.label : 'Muerto'], ['Avance del ciclo', `${f0.format(cycle * 100)} % (${f0.format(v.gdd)} °C·día)`], ['Edad', age === null ? '—' : `${age} días`], ['Rendimiento esperado', `${f0.format(v.expectedYield * 100)} % del potencial (${f1.format(v.crop.yieldPotentialTha * v.expectedYield)} t/ha)`]);
  if (num('cosechas') > 0) rows.push(['Última cosecha', `${f0.format(num('cosechaKg'))} kg (${f1.format(num('cosechaTha'))} t/ha)`]);
  return <>
    <h4>Suelo y cultivo</h4><p>{entity.parcelPolygon?'Poligonal':'Rectangular'} · {area.toLocaleString('es-CL')} m² · perímetro {parcelPerimeter(entity).toFixed(1)} m</p>
    <label className="agro-field"><span>Tipo de suelo</span><select aria-label="Tipo de suelo" value={v.soil.id} onChange={e => report(session.setState(entity.id, 'suelo', e.target.value))}>{SOILS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
    <div className="agro-meter" role="img" aria-label={`Agua útil ${f0.format(v.available * 100)} %`} data-testid="agro-meter"><i style={{width: `${v.available * 100}%`}} /></div>
    <dl className="agro-readings" data-testid="agro-soil">{rows.map(([k, x]) => <div key={k}><dt>{k}</dt><dd>{x}</dd></div>)}</dl>
    {v.crop && !v.alive && <p className="agro-why" role="status">El cultivo murió por falta de agua. Retíralo para sembrar de nuevo.</p>}
    {v.ready && <p className="agro-why ready" role="status">Listo para cosechar.</p>}
    <div className="agro-row agro-actions">
      {!v.crop && CROPS.map(c => <button key={c.id} type="button" className="agro-primary" data-testid={`agro-plant-${c.id}`} onClick={() => report(session.plant(entity.id, c.id))}>Sembrar {c.name.toLowerCase()}</button>)}
      {v.crop && <button type="button" className="agro-primary" data-testid="agro-harvest" disabled={!v.ready} onClick={() => { const r = session.harvest(entity.id); report(r.ok ? {ok: true} : r); }}>Cosechar</button>}
      {v.crop && <button type="button" className="agro-ghost" data-testid="agro-clear-crop" onClick={() => report(session.clearCrop(entity.id))}>Retirar cultivo</button>}
    </div>
    <h4>Balance de agua acumulado</h4>
    <dl className="agro-readings" data-testid="agro-balance">
      {([['Riego', 'riegoMm'], ['Lluvia', 'lluviaMm'], ['Evapotranspiración', 'etMm'], ['Drenaje profundo', 'drenajeMm'], ['Escorrentía', 'escorrentiaMm']] as const).map(([k, key]) => <div key={key}><dt>{k}</dt><dd>{f1.format(num(key))} mm</dd></div>)}
      <div><dt>Riego en litros</dt><dd>{f0.format(num('riegoMm') * area)} L</dd></div>
    </dl>
    <p className="agro-muted agro-tiny">Modelo didáctico de una capa de 0,5 m con reparto uniforme del agua. Solo el estrés hídrico reduce el rendimiento: no hay plagas, sales, nutrientes ni heladas. Clima ficticio.</p>
  </>;
}

/** Datos del estanque: agua utilizable y volumen que queda bajo la salida. */
export function TankExtras({entity, session, report}: {entity: Entity; session: WorldSession; report: Report}) {
  const cap = Number(entity.params.volumenMaxL ?? 10000), dead = deadVolumeL(entity), level = Number(entity.state.nivelL ?? 0), usable = Math.max(0, level - dead);
  return <>
    <dl className="agro-readings" data-testid="agro-tank"><div><dt>Agua utilizable</dt><dd>{f0.format(usable)} L</dd></div><div><dt>Bajo la salida (no sale)</dt><dd>{f0.format(Math.min(level, dead))} L</dd></div><div><dt>Capacidad</dt><dd>{f0.format(cap)} L</dd></div></dl>
    <button type="button" className="agro-ghost agro-wide" data-testid="agro-fill" onClick={() => report(session.setState(entity.id, 'nivelL', cap))}>Llenar el estanque</button>
    <p className="agro-muted agro-tiny">Llenar es una acción del mundo y no se deshace. Hasta que existan compras y fuentes de agua (Fase 6) el relleno es manual.</p>
  </>;
}

/** Qué parcela(s) riega el aspersor y a qué intensidad. */
export function EmitterExtras({entity, session}: {entity: Entity; session: WorldSession}) {
  const flow = (session.analyze().elements[entity.id] as {flowLmin?: number} | undefined)?.flowLmin ?? 0;
  const parcels = session.entities.filter(p => p.type === 'parcela' && coverageShare(entity, p) > 0);
  const nominal = flow > 0 ? flow : Number(entity.params.caudalNominalLmin ?? 40);
  const ir = irrigationByParcel(session.entities, {[entity.id]: nominal});
  return <>
    <h4>Riego</h4>
    {parcels.length === 0 ? <p className="agro-muted" data-testid="agro-emitter-parcels">Su círculo de riego no toca ninguna parcela.</p> : <ul className="agro-plain" data-testid="agro-emitter-parcels">{parcels.map(p => { const i = ir[p.id]; return <li key={p.id}>{p.label}: {f0.format(coverageShare(entity, p) * 100)} % del círculo{i ? ` · ${f1.format(i.rateMmH)} mm/h` : ''}{i && i.runoffFraction > 0.01 ? ` · escurre ${f0.format(i.runoffFraction * 100)} %` : ''}</li>; })}</ul>}
  </>;
}

/** Lo que mide la sonda: la parcela donde está clavada. */
export function SensorExtras({entity, session}: {entity: Entity; session: WorldSession}) {
  const r = sensorReading(session.entities, entity);
  return <>
    <h4>Lectura de la sonda</h4>
    {!r ? <p className="agro-muted" data-testid="agro-sensor">Está fuera de toda parcela: no mide nada.</p> : <dl className="agro-readings" data-testid="agro-sensor"><div><dt>Parcela</dt><dd>{r.parcelLabel}</dd></div><div><dt>Humedad</dt><dd>{f1.format(r.moisturePct)} %</dd></div><div><dt>Agua útil</dt><dd>{f0.format(r.availablePct)} %</dd></div>{r.stressed && <div><dt>Aviso</dt><dd>Suelo seco</dd></div>}</dl>}
    <p className="agro-muted agro-tiny">Lectura simulada de la capa de 0,5 m. No es una medición real.</p>
  </>;
}
