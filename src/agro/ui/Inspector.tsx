import {useEffect, useState} from 'react';
import {RotateCcw, RotateCw, Trash2, X} from 'lucide-react';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity, Port} from '../model/types.ts';
import {PORT_COLORS} from '../scene/EntityMesh.tsx';
import {sampleHeight, slopeDegrees} from '../terrain/heightfield.ts';
import {compatibleTargets} from '../world/connections.ts';
import {portWorld} from '../world/placement.ts';
import {TERRAIN_ISSUE} from '../world/pipeElevation.ts';
import {inConstruction, obraProgress} from '../economy/economy.ts';
import {timeInfo} from '../sim/clock.ts';
import type {WorldSession} from '../world/session.ts';
import {BoardSummary} from './BoardPanel.tsx';
import {NumberField} from './Panels.tsx';
import {EmitterExtras, ParcelPanel, SensorExtras, TankExtras} from './SimPanels.tsx';

const num1 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});
const bar = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 2, minimumFractionDigits: 2});
const KIND = {hydraulic: 'Hidráulico', power: 'Potencia', signal: 'Señal', mechanical: 'Mecánico'} as const;
const DIR = {in: 'entrada', out: 'salida', bidirectional: 'bidireccional'} as const;

function specText(p: Port): string {
  switch (p.kind) {
    case 'hydraulic': return `Ø ${p.spec.diameterMm} mm`;
    case 'power': return `${p.spec.current === 'ac' ? 'CA' : 'CC'} · ${p.spec.phases === 3 ? 'trifásica' : 'monofásica'} · ${p.spec.voltage} V`;
    case 'signal': return `${p.spec.signal === 'analog' ? 'analógica' : p.spec.signal === 'digital' ? 'digital' : 'datos'}${p.spec.level ? ` · ${p.spec.level}` : ''}`;
    default: return p.spec.mount;
  }
}

/** Lecturas calculadas por la simulación para la pieza seleccionada, con sus unidades. */
function Readings({entity, session}: {entity: Entity; session: WorldSession}) {
  const r = session.analyze().elements[entity.id]; if (!r) return null;
  const rows: [string, string][] = [];
  if (r.kind === 'tuberia') rows.push(['Estado', r.wet ? 'Con agua' : 'Sin agua'], ['Caudal', `${num1.format(r.flowLmin)} L/min`], ['Velocidad', `${bar.format(r.velocity)} m/s`], ['Pérdida de altura', `${bar.format(r.headLossM)} m`]);
  else if (r.kind === 'valvula') rows.push(['Estado', r.open ? 'Abierta' : 'Cerrada'], ['Caudal', `${num1.format(r.flowLmin)} L/min`]);
  else if (r.kind === 'bomba') {
    rows.push(['Estado', r.running ? (r.flowLmin > 0 ? 'En marcha' : 'Energizada, sin caudal') : 'Detenida'], ['Caudal', `${num1.format(r.flowLmin)} L/min`], ['Altura que da', `${num1.format(r.headGainM)} m`], ['Potencia hidráulica', `${bar.format(r.hydraulicKw)} kW`], ['Potencia en el eje', `${bar.format(r.shaftKw)} kW (nominal ${num1.format(r.nominalKw)} kW)`]);
    const p1 = session.analyze().ports[`${entity.id}:succion`]?.pressureBar, p2 = session.analyze().ports[`${entity.id}:descarga`]?.pressureBar;
    if (p1 !== undefined && p2 !== undefined) rows.push(['Presión de succión (P1)', `${bar.format(p1)} bar`], ['Presión de descarga (P2)', `${bar.format(p2)} bar`], ['Presión diferencial (ΔP)', `${bar.format(p2 - p1)} bar`]);
    rows.push(['Altura manométrica (H)', `${num1.format(r.headGainM)} m`], ['Eficiencia hidráulica', r.shaftKw > 1e-9 ? `${num1.format((r.hydraulicKw / r.shaftKw) * 100)} %` : '—']);
  }
  else if (r.kind === 'emisor') rows.push(['Caudal', `${num1.format(r.flowLmin)} L/min`], ['Presión', `${bar.format(r.pressureBar)} bar`]);
  else if (r.kind === 'estanque') rows.push(['Nivel', `${bar.format(r.levelM)} m`], ['Entrega a la red', `${num1.format(Math.abs(r.netOutLmin) < 0.05 ? 0 : r.netOutLmin)} L/min`]);
  const note = r.kind === 'bomba' || r.kind === 'emisor' ? r.reason : null;
  return <>
    <h4>Medidas calculadas</h4>
    <dl className="agro-readings" data-testid="agro-readings">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    {note && <p className="agro-why" role="status" data-testid="agro-why">{note}</p>}
    <p className="agro-muted agro-tiny">Cálculo estacionario didáctico (Hazen-Williams, curva de bomba cuadrática, orificio). No es una medición real.</p>
  </>;
}

/** Mandos de la pieza: válvula, interruptor del tablero y nivel del estanque. */
function Controls({entity, session, report, onAutomate}: {entity: Entity; session: WorldSession; report(r: {ok: boolean; error?: string}): void; onAutomate(): void}) {
  if (entity.type === 'valvula') {
    const open = entity.state.abierta !== false;
    return <button type="button" className="agro-toggle" aria-pressed={open} data-testid="agro-toggle-valve" onClick={() => report(session.setState(entity.id, 'abierta', !open))}>Válvula: {open ? 'abierta' : 'cerrada'}<span>{open ? 'Cerrar' : 'Abrir'}</span></button>;
  }
  if (entity.type === 'tablero') {
    const on = entity.state.interruptor === true;
    return <><button type="button" className="agro-toggle" aria-pressed={on} data-testid="agro-toggle-switch" onClick={() => report(session.setState(entity.id, 'interruptor', !on))}>Interruptor general: {on ? 'encendido' : 'apagado'}<span>{on ? 'Apagar' : 'Encender'}</span></button><BoardSummary entity={entity} session={session} report={report} onOpen={onAutomate} /></>;
  }
  if (entity.type === 'estanque') return <><NumberField label="Nivel de agua" unit="L" value={Math.round(Number(entity.state.nivelL ?? 0))} min={0} max={Number(entity.params.volumenMaxL ?? 10000)} step={100} onCommit={v => report(session.setState(entity.id, 'nivelL', v))} /><TankExtras entity={entity} session={session} report={report} /></>;
  if (entity.type === 'parcela') return <ParcelPanel entity={entity} session={session} report={report} />;
  if (entity.type === 'sensor-humedad') return <SensorExtras entity={entity} session={session} />;
  if (entity.type === 'emisor') return <EmitterExtras entity={entity} session={session} />;
  return null;
}

/** Puerto libre de esta pieza y puerto libre compatible de otra pieza que están más cerca (en planta). */
function nearestDock(session: WorldSession, entity: Entity) {
  const busy = new Set(session.connections.flatMap(c => [`${c.a.entityId}:${c.a.portId}`, `${c.b.entityId}:${c.b.portId}`]));
  let best: {d: number; from: Port; to: {entityId: string; portId: string; label: string}} | null = null;
  for (const p of entity.ports) {
    if (busy.has(`${entity.id}:${p.id}`)) continue;
    const a = portWorld(entity, p);
    for (const t of compatibleTargets(session.parts, {entityId: entity.id, portId: p.id})) {
      const te = session.entity(t.entityId), tp = te?.ports.find(q => q.id === t.portId); if (!te || !tp) continue;
      const b = portWorld(te, tp), d = Math.hypot(a.x - b.x, a.z - b.z);
      if (!best || d < best.d) best = {d, from: p, to: t};
    }
  }
  return best;
}

/** Pestaña «Colocación»: posición y giro exactos, ajuste a rejilla y alineación al puerto compatible más cercano. */
function PlacementTab({entity, session, report, gridSnap, onSnap, onNotice}: {entity: Entity; session: WorldSession; report(r: {ok: boolean; error?: string}): void; gridSnap: boolean; onSnap(v: boolean): void; onNotice(m: string): void}) {
  const def = itemById(entity.type)!, [x, , z] = entity.pose.position, hf = session.terrain.hf, yawDeg = Math.round(((entity.pose.rotation[1] * 180) / Math.PI) * 10) / 10, slope = slopeDegrees(hf, x, z), dock = nearestDock(session, entity);
  const move = (nx: number, nz: number, yaw?: number) => report(session.move(entity.id, nx, nz, yaw));
  return <div data-testid="agro-place">
    <h4>Transformación</h4>
    <div className="agro-grid2">
      <NumberField label="Posición X" unit="m" value={Math.round(x * 100) / 100} min={hf.originX} max={hf.originX + hf.sizeX} step={0.5} onCommit={v => move(v, z)} />
      <NumberField label="Posición Z" unit="m" value={Math.round(z * 100) / 100} min={hf.originZ} max={hf.originZ + hf.sizeZ} step={0.5} onCommit={v => move(x, v)} />
    </div>
    <div className="agro-row">
      <NumberField label="Giro" unit="°" value={yawDeg} min={-360} max={360} step={15} onCommit={v => move(x, z, (v * Math.PI) / 180)} />
      <button type="button" className="agro-icon" aria-label="Girar 15° a la izquierda" title="Girar −15° (Q)" onClick={() => report(session.rotate(entity.id, -Math.PI / 12))}><RotateCcw size={16} aria-hidden="true" /></button>
      <button type="button" className="agro-icon" aria-label="Girar 15° a la derecha" title="Girar +15° (E)" onClick={() => report(session.rotate(entity.id, Math.PI / 12))}><RotateCw size={16} aria-hidden="true" /></button>
    </div>
    <dl className="agro-readings" data-testid="agro-place-read">
      <div><dt>Cota (altura del suelo)</dt><dd>{num1.format(sampleHeight(hf, x, z))} m</dd></div>
      <div><dt>Pendiente bajo la pieza</dt><dd>{num1.format(slope)}° (máx. {def.maxSlopeDeg}°)</dd></div>
      <div><dt>Giro en X y Z</dt><dd>0° · 0° (la pieza se apoya en el suelo)</dd></div>
      <div><dt>Escala</dt><dd>1,00 · bloqueada (el tamaño se cambia en Propiedades)</dd></div>
    </dl>
    <h4>Colocación y ajuste</h4>
    <label className="agro-check"><input type="checkbox" checked={gridSnap} onChange={e => onSnap(e.target.checked)} />Imán a rejilla (0,5 m) al colocar</label>
    {dock ? <div className="agro-dockline" data-testid="agro-dockline"><span>Puerto más cercano: <b>{dock.from.label ?? dock.from.id}</b> → {dock.to.label} <small>({num1.format(dock.d)} m)</small></span>
      <button type="button" className="agro-ghost agro-mini-btn" data-testid="agro-align" onClick={() => { const r = session.connectPorts({entityId: entity.id, portId: dock.from.id}, {entityId: dock.to.entityId, portId: dock.to.portId}); onNotice(r.ok ? (r.value.docked ? `Alineado y conectado: se acopló «${r.value.docked}».` : 'Conectado.') : `No se pudo alinear: ${r.error}`); }}>Alinear y conectar</button></div>
      : <p className="agro-muted agro-tiny" data-testid="agro-dockline">No hay un puerto libre compatible cerca de esta pieza.</p>}
    <p className="agro-muted agro-tiny">Las reglas de colocación (choques, pendiente y límites del terreno) son las del fantasma: si un valor no cabe, se rechaza con su motivo.</p>
  </div>;
}

/** Panel derecho contextual: nombre, posición, giro, parámetros, mandos, medidas, puertos y conexiones de la pieza seleccionada. */
export function Inspector({session, entity, onClose, onDelete, onNotice, onAutomate, gridSnap, onSnap}: {session: WorldSession; entity: Entity; onClose(): void; onDelete(id: string): void; onNotice(m: string): void; onAutomate(): void; gridSnap: boolean; onSnap(v: boolean): void}) {
  const def = itemById(entity.type)!, [w, h, d] = sizeOf(def, entity.params), hf = session.terrain.hf;
  const [name, setName] = useState(entity.label);
  useEffect(() => setName(entity.label), [entity.label, entity.id]);
  const [tab, setTab] = useState<'place' | 'general' | 'conn' | 'data'>('general');
  useEffect(() => setTab('general'), [entity.id]);
  const yawDeg = Math.round(((entity.pose.rotation[1] * 180) / Math.PI) * 10) / 10;
  const report = (r: {ok: boolean; error?: string}) => { if (!r.ok && r.error) onNotice(r.error); };
  const conns = session.connections.filter(c => c.a.entityId === entity.id || c.b.entityId === entity.id);
  const label = (id: string) => session.entity(id)?.label ?? id;
  const analysis = session.analyze(), stretched = new Set(analysis.stretched.map(x => x.connectionId));
  const busy = new Set(session.connections.flatMap(c => [`${c.a.entityId}:${c.a.portId}`, `${c.b.entityId}:${c.b.portId}`]));
  const terrainIssue = entity.state[TERRAIN_ISSUE];
  return <aside className="agro-inspector" aria-label={`Inspector de ${entity.label}`} data-testid="agro-inspector" data-entity={entity.id}>
    <header><div><small>{def.family} · {def.name}</small>
      <input className="agro-name" value={name} maxLength={80} aria-label="Nombre de la pieza" onChange={e => setName(e.target.value)} onBlur={() => { if (name.trim() !== entity.label) { const r = session.rename(entity.id, name); report(r); if (!r.ok) setName(entity.label); } }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></div>
      <button type="button" className="agro-icon" aria-label="Cerrar inspector" onClick={onClose}><X size={16} aria-hidden="true" /></button></header>
    {typeof terrainIssue === 'string' && <p className="agro-terrain-issue"><strong>Incidencia de terreno.</strong> {terrainIssue}</p>}
    <dl>
      <dt>Posición</dt><dd data-testid="agro-ins-pos">x {num1.format(entity.pose.position[0])} · z {num1.format(entity.pose.position[2])}</dd>
      <dt>Cota</dt><dd>{num1.format(sampleHeight(hf, entity.pose.position[0], entity.pose.position[2]))} m</dd>
      <dt>Medidas</dt><dd>{num1.format(w)} × {num1.format(d)} × {num1.format(h)} m</dd>
      <dt>Ciclo de vida</dt><dd>{inConstruction(entity) ? 'En obra' : entity.lifecycle === 'installed' ? 'Instalada' : entity.lifecycle}</dd>
    </dl>
    <div className="agro-tabs" role="tablist" aria-label="Secciones de la pieza">
      {([['place', 'Colocación'], ['general', 'Propiedades'], ['conn', 'Conexiones'], ['data', 'Datos']] as const).map(([id, text]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} data-testid={`agro-tab-${id}`} onClick={() => setTab(id)}>{text}</button>)}
    </div>
    {tab === 'place' && <PlacementTab entity={entity} session={session} report={report} gridSnap={gridSnap} onSnap={onSnap} onNotice={onNotice} />}
    {tab === 'general' && <>
    {inConstruction(entity) && <p className="agro-why" role="status" data-testid="agro-obra">En obra: {Math.round(obraProgress(entity, session.clock.simSeconds) * 100)} % · termina el {timeInfo({simSeconds: Number(entity.state.obraHasta), startDate: session.clock.startDate}).dateLabel} a las {timeInfo({simSeconds: Number(entity.state.obraHasta), startDate: session.clock.startDate}).timeLabel}. Hasta entonces no existe para el agua ni la energía.</p>}
    <Controls entity={entity} session={session} report={report} onAutomate={onAutomate} />
    {def.params.filter(p=>!entity.parcelPolygon||!['anchoM','largoM'].includes(p.key)).map(p => <NumberField key={p.key} label={p.label} unit={p.unit} value={Number(entity.params[p.key] ?? p.default)} min={p.min} max={p.max} step={p.step} onCommit={v => report(session.setParam(entity.id, p.key, v))} />)}
    </>}
    {tab === 'data' && <Readings entity={entity} session={session} />}
    {tab === 'conn' && <>
    <h4>Puertos ({entity.ports.length})</h4>
    {entity.ports.length === 0 ? <p className="agro-muted">Esta pieza no tiene puertos.</p> : <ul className="agro-ports" data-testid="agro-ports">{entity.ports.map(p => {
      const reading = analysis.ports[`${entity.id}:${p.id}`], free = !busy.has(`${entity.id}:${p.id}`), targets = free ? compatibleTargets(session.parts, {entityId: entity.id, portId: p.id}) : [];
      return <li key={p.id}><i style={{background: PORT_COLORS[p.kind]}} aria-hidden="true" /><span><b>{p.label ?? p.id}</b> {KIND[p.kind]} · {DIR[p.direction]}<br /><small>{specText(p)}{reading ? ` · ${bar.format(reading.pressureBar)} bar` : ''}{!free ? ' · conectado' : ''}</small>
        {free && targets.length > 0 && <select className="agro-connect" aria-label={`Conectar ${p.label ?? p.id} con`} value="" onChange={e => {
          const [id, port] = e.target.value.split('|');
          if (id) { const r = session.connectPorts({entityId: entity.id, portId: p.id}, {entityId: id, portId: port}); onNotice(r.ok ? (r.value.docked ? `Conectado: se acopló «${r.value.docked}».` : 'Conectado.') : `No se pudo conectar: ${r.error}`); }
        }}><option value="">Conectar con…</option>{targets.map(t => <option key={`${t.entityId}|${t.portId}`} value={`${t.entityId}|${t.portId}`}>{t.label}</option>)}</select>}
      </span></li>; })}</ul>}
    <h4>Conexiones ({conns.length})</h4>
    {conns.length === 0 ? <p className="agro-muted">Sin conexiones. Usa «Conectar con…» o la herramienta Conectar.</p> : <ul className="agro-ports" data-testid="agro-conns">{conns.map(c => <li key={c.id}><span>{label(c.a.entityId)}.{c.a.portId} ↔ {label(c.b.entityId)}.{c.b.portId}<br /><small>{stretched.has(c.id) ? 'separada: no conduce' : c.status}{c.reason ? ` · ${c.reason}` : ''}</small></span>
      <button type="button" className="agro-ghost agro-mini-btn" aria-label={`Desconectar ${label(c.a.entityId)} de ${label(c.b.entityId)}`} onClick={() => report(session.disconnect(c.id))}>Desconectar</button></li>)}</ul>}
    </>}
    <button type="button" className="agro-danger agro-wide" data-testid="agro-delete" onClick={() => onDelete(entity.id)}><Trash2 size={16} aria-hidden="true" />Eliminar pieza</button>
  </aside>;
}
