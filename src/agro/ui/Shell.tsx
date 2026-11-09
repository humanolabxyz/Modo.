// Cáscara del workspace (Fase 5b): chips de clima y suelo, barra de modos inferior, dock de piezas, capas, barra contextual y tarjeta de redes.
// Todo lo que se muestra sale de la simulación: no hay viento ni humedad del aire porque el modelo no los simula.
import {useRef} from 'react';
import {Canvas} from '@react-three/fiber';
import {Box, Briefcase, Cpu, Droplet, Layers, RotateCcw, RotateCw, Search, Sun, Trash2, Zap, CloudRain, Thermometer, Waypoints, X} from 'lucide-react';
import {CatalogViews} from '../scene/CatalogPreview.tsx';
import type {Entity} from '../model/types.ts';
import {ITEMS, type Family} from '../catalog/items.ts';
import {dayWeather} from '../sim/climate.ts';
import {timeInfo} from '../sim/clock.ts';
import {soilById, viewOf} from '../sim/soil.ts';
import type {WorldSession} from '../world/session.ts';

const f0 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
const f1 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});

export type WorkMode = 'inspect' | 'build' | 'water' | 'power' | 'auto' | 'manage' | 'layers';
export const WORK_MODES: {id: WorkMode; label: string; Icon: typeof Box}[] = [
  {id: 'build', label: 'Construir', Icon: Box}, {id: 'inspect', label: 'Inspeccionar', Icon: Search}, {id: 'water', label: 'Riego', Icon: Droplet},
  {id: 'power', label: 'Electricidad', Icon: Zap}, {id: 'auto', label: 'Automatizar', Icon: Cpu}, {id: 'manage', label: 'Gestión', Icon: Briefcase}, {id: 'layers', label: 'Capas', Icon: Layers},
];

/** Temperatura estimada a esta hora: onda diaria entre la mínima (≈ 6 h) y la máxima (≈ 15 h) del día. Es una estimación del modelo, no una medición. */
export function tempNow(tMin: number, tMax: number, hour: number): number { return (tMin + tMax) / 2 + ((tMax - tMin) / 2) * Math.cos(((hour - 15) / 24) * 2 * Math.PI); }

/** Chips de arriba a la izquierda: temperatura, ET₀ y lluvia del día, y el suelo de la primera parcela. */
export function WeatherChips({session}: {session: WorldSession}) {
  const clock = session.clock, t = timeInfo(clock), w = dayWeather(clock.seed, t.dayIndex, t.doy);
  const parcel = session.entities.find(e => e.type === 'parcela'), v = parcel ? viewOf(parcel.state) : null;
  return <div className="agro-chips" role="group" aria-label="Clima y suelo" data-testid="agro-chips">
    <div className="agro-hud-chip" title="Temperatura estimada por el modelo para esta hora (clima ficticio)"><Thermometer size={20} aria-hidden="true" /><span><b>{f0.format(tempNow(w.tMinC, w.tMaxC, t.hour))} °C</b><small>{w.rainMm > 0 ? 'Lluvia hoy' : 'Despejado'}</small></span></div>
    <div className="agro-hud-chip" title="Evapotranspiración de referencia del día"><Sun size={20} aria-hidden="true" /><span><b>{f1.format(w.et0Mm)} mm</b><small>ET₀ del día</small></span></div>
    <div className="agro-hud-chip" title="Lluvia prevista para hoy"><CloudRain size={20} aria-hidden="true" /><span><b>{f1.format(w.rainMm)} mm</b><small>Lluvia</small></span></div>
    <div className="agro-hud-chip" title={parcel ? `Primera parcela: ${parcel.label}` : 'Coloca una parcela'}><Waypoints size={20} aria-hidden="true" /><span><b>{v ? `${f0.format(v.theta * 100)} %` : '—'}</b><small>{v ? `Suelo ${v.soil.label.toLowerCase()}` : 'Sin parcelas'}</small></span></div>
  </div>;
}

/** Barra de modos inferior. «Automatizar» abre el panel del PLC; «Capas» abre las capas visibles. */
export function ModeBar({mode, onMode}: {mode: WorkMode | null; onMode(m: WorkMode): void}) {
  return <nav className="agro-modes" role="toolbar" aria-label="Modos de trabajo" data-testid="agro-modes">
    {WORK_MODES.map(({id, label, Icon}) => <button key={id} type="button" className={mode === id ? 'on' : ''} aria-pressed={mode === id} aria-label={label} data-mode={id} onClick={() => onMode(id)}><Icon size={20} aria-hidden="true" /><span>{label}</span></button>)}
  </nav>;
}

const DOCK_GROUPS: {label: string; family: Family}[] = [
  {label: 'Infraestructura', family: 'Infraestructura'}, {label: 'Riego', family: 'Agua'},
  {label: 'Electricidad', family: 'Energía'}, {label: 'Control', family: 'Control'}, {label: 'Cultivo', family: 'Cultivo'},
];

/** Dock inferior: categorías a la izquierda y fichas de piezas a la derecha. Elegir una ficha deja la pieza lista para colocar. */
export function Dock({placing, group, onGroup, onPick, ghost, stock, gridSnap, onSnap, onTurn, onCancel}: {stock(type: string): number; placing: string | null; group: number; onGroup(i: number): void; onPick(id: string): void; ghost: {valid: boolean; reason?: string} | null; gridSnap: boolean; onSnap(value: boolean): void; onTurn(angle: number): void; onCancel(): void}) {
  const g = DOCK_GROUPS[group], items = ITEMS.filter(i => i.family === g.family);
  const repaint = useRef<(() => void) | null>(null);
  const targets = useRef(new Map<string, HTMLSpanElement>());
  return <section className="agro-dock" aria-label="Piezas para colocar" data-testid="agro-dock">
    <div className="agro-dock-cats" role="tablist" aria-label="Categorías">
      {DOCK_GROUPS.map((x, i) => <button key={x.label} type="button" role="tab" aria-selected={g === x} className={g === x ? 'on' : ''} onClick={() => onGroup(i)}>{x.label}</button>)}
    </div>
    <div className="agro-dock-list">
      <div className="agro-dock-items" onScroll={() => repaint.current?.()}>
        {items.map(item => {
          const available = stock(item.id);
          return <button key={item.id} type="button" className={placing === item.id ? 'on' : ''} aria-pressed={placing === item.id} data-dock-item={item.id} title={item.description} onClick={() => onPick(item.id)}>
            <span className="agro-model-preview" aria-hidden="true" ref={element => {
              if (element) targets.current.set(item.id, element);
              else targets.current.delete(item.id);
            }} />
            <b>{item.name}</b>
            {Number.isFinite(available) && <small className={available < 1 ? 'none' : ''} data-testid={`agro-dock-stock-${item.id}`}>{available} disp.</small>}
          </button>;
        })}
      </div>
      <div className="agro-dock-render" aria-hidden="true">
        <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{autoClear: false, alpha: true}} onCreated={({invalidate}) => { repaint.current = invalidate; }}>
          <CatalogViews items={items} targets={targets} />
        </Canvas>
      </div>
    </div>
    <div className="agro-dock-status">
      <p className={`agro-dock-hint${placing && ghost ? (ghost.valid ? ' ok' : ' bad') : ''}`} role="status" data-testid="agro-dock-hint">{placing ? (ghost ? (ghost.valid ? 'Se puede colocar' : ghost.reason) : 'Apunta al terreno') : 'Elige una pieza'}</p>
      {placing && <div className="agro-dock-adjust">
        <label><input type="checkbox" checked={gridSnap} onChange={e => onSnap(e.target.checked)} />Rejilla</label>
        <button type="button" aria-label="Girar pieza a la izquierda" title="Girar −15° (Q)" onClick={() => onTurn(-Math.PI / 12)}><RotateCcw size={16} /></button>
        <button type="button" aria-label="Girar pieza a la derecha" title="Girar +15° (E)" onClick={() => onTurn(Math.PI / 12)}><RotateCw size={16} /></button>
        <button type="button" aria-label="Cancelar colocación" title="Cancelar colocación (Esc)" onClick={onCancel}><X size={16} /></button>
      </div>}
    </div>
  </section>;
}

/** Capas visibles. */
export function LayersPanel({labels, ports, mini, pieces, onLabels, onPorts, onMini, onPieces, onClose}: {labels: boolean; ports: boolean; mini: boolean; pieces: boolean; onLabels(v: boolean): void; onPorts(v: boolean): void; onMini(v: boolean): void; onPieces(v: boolean): void; onClose(): void}) {
  const row = (text: string, v: boolean, f: (v: boolean) => void) => <label key={text}><input type="checkbox" checked={v} onChange={e => f(e.target.checked)} /><span>{text}</span></label>;
  return <section className="agro-layers" role="group" aria-label="Capas visibles" data-testid="agro-layers">
    <header><strong>Capas</strong><button type="button" className="agro-icon" aria-label="Cerrar capas" onClick={onClose}>×</button></header>
    {row('Etiquetas de los equipos', labels, onLabels)}{row('Puertos de conexión', ports, onPorts)}{row('Minimapa', mini, onMini)}{row('Lista de piezas', pieces, onPieces)}
  </section>;
}

/** Acciones rápidas de la pieza seleccionada. */
export function ContextBar({entity, onRotate, onDelete, onAutomate}: {entity: Entity; onRotate(d: number): void; onDelete(): void; onAutomate(): void}) {
  return <div className="agro-ctx" role="toolbar" aria-label={`Acciones de ${entity.label}`} data-testid="agro-ctx">
    <span>{entity.label}</span>
    <button type="button" aria-label="Girar −15°" title="Girar −15° (Q)" onClick={() => onRotate(-Math.PI / 12)}><RotateCcw size={18} aria-hidden="true" /></button>
    <button type="button" aria-label="Girar +15°" title="Girar +15° (E)" onClick={() => onRotate(Math.PI / 12)}><RotateCw size={18} aria-hidden="true" /></button>
    {entity.type === 'tablero' && <button type="button" className="txt" data-testid="agro-ctx-automate" onClick={onAutomate}><Cpu size={18} aria-hidden="true" />Automatizar</button>}
    <button type="button" className="danger" aria-label="Eliminar pieza" title="Eliminar (Supr)" onClick={onDelete}><Trash2 size={18} aria-hidden="true" /></button>
  </div>;
}

/** Tarjeta oscura de redes: hidráulica y eléctrica, con lo que dice el cálculo. */
export function NetworkCard({session, detail}: {session: WorldSession; detail: 'water' | 'power' | null}) {
  const a = session.analyze(), pumps = Object.values(a.elements).filter(r => r.kind === 'bomba'), emitters = Object.values(a.elements).filter(r => r.kind === 'emisor');
  const bar = Math.max(0, ...emitters.map(r => r.pressureBar)), kw = pumps.reduce((sum, pump) => sum + (pump.running ? pump.shaftKw : 0), 0);
  const hasHyd = session.entities.some(e => e.ports.some(p => p.kind === 'hydraulic'));
  const hasPower = session.entities.some(e => e.ports.some(p => p.kind === 'power'));
  if (!detail && !hasHyd && !hasPower) return null;
  return <section className="agro-netcard" data-detail={detail ?? ''} data-testid="agro-netcard" aria-label="Estado de las redes">
    {(detail === 'water' || (!detail && hasHyd)) && <div data-testid="agro-network"><Droplet size={20} aria-hidden="true" /><span><b>Red de riego</b>
      {hasHyd ? <><em>{f1.format(a.balance.emittersLmin)} L/min</em><small>{f1.format(bar)} bar en el aspersor de mayor presión</small></> : <small>Sin piezas hidráulicas. Agrégalas desde Construir.</small>}
      {detail === 'water' && hasHyd && <><small>Balance de caudal {f1.format(a.balance.errorLmin)} L/min</small></>}{hasHyd && (detail ? a.warnings.slice(0, 3) : a.warnings.slice(0, 1)).map((w, i) => <small key={i}>{w}</small>)}
    </span></div>}
    {(detail === 'power' || (!detail && hasPower)) && <div><Zap size={20} aria-hidden="true" /><span><b>Red eléctrica</b>
      {hasPower ? <><em>{f1.format(kw)} kW en el eje de las bombas</em><small>{pumps.some(p => p.running) ? 'Bombeo en marcha' : 'Sin bombeo en marcha'}</small></> : <small>Sin piezas eléctricas. Agrégalas desde Construir.</small>}
    </span></div>}
  </section>;
}
