import {LearningPanel} from './LearningPanel.tsx';
import {EXPERIENCE_POLICIES} from '../world/experience.ts';
import {TerrainEditor} from './TerrainEditor.tsx';
import {snapToRoad} from '../terrain/roads.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import {Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';
import {ArrowLeft, ChevronsDown, ChevronsUp, Download, Cable, Equal, Eye, Footprints, List, Map as MapIcon, MousePointer2, Orbit, Redo2, Ruler, Satellite, Undo2} from 'lucide-react';
import {exportWorld} from '../model/validate.ts';
import {STROKE_RETRY_MS, autosaveDecision} from '../store/autosave.ts';
import type {Entity, PortRef, PropValue} from '../model/types.ts';
import type {CameraMode, CameraReport, GhostInfo, Metrics, Point, Tool} from '../scene/AgroCanvas.tsx';
import type {ReviewFocus} from '../scene/TerrainReview.tsx';
import type {ImpactReport} from '../world/impact.ts';
import {slopeDegrees} from '../terrain/heightfield.ts';
import {decorativeFeatures} from '../terrain/surface.ts';
import {TERRITORIES} from '../terrain/presets.ts';
import {MAX_RADIUS, MIN_RADIUS} from '../terrain/model.ts';
import type {WorldStore} from '../store/worlds.ts';
import {measure} from '../world/placement.ts';
import type {WorldSession} from '../world/session.ts';
import {Minimap} from './Minimap.tsx';
import {ConfirmDialog, TerrainImpactDialog} from './Panels.tsx';
import {Inspector} from './Inspector.tsx';
import {SimulationAlerts, TimeBar} from './SimPanels.tsx';
import {AutomationPanel} from './AutomationPanel.tsx';
import {InventoryPanel} from './ManagePanel.tsx';
import {ContextBar, Dock, LayersPanel, ModeBar, NetworkCard, WeatherChips, type WorkMode} from './Shell.tsx';
import {timeInfo} from '../sim/clock.ts';

const AgroCanvas = lazy(() => import('../scene/AgroCanvas.tsx'));

const MODES: {id: CameraMode; label: string; hint: string; Icon: typeof Orbit}[] = [
  {id: 'orbit', label: 'Órbita', hint: 'Arrastra para orbitar · rueda para acercar · clic derecho para desplazar', Icon: Orbit},
  {id: 'strategic', label: 'Estratégica', hint: 'Vista territorial · rueda para acercar · clic derecho para desplazar', Icon: Satellite},
  {id: 'walk', label: 'Caminar', hint: 'W A S D para moverte (Shift corre) · arrastra para mirar', Icon: Footprints},
];
const TOOLS: {id: Tool; label: string; Icon: typeof Orbit}[] = [
  {id: 'select', label: 'Seleccionar', Icon: MousePointer2}, {id: 'measure', label: 'Medir', Icon: Ruler}, {id: 'connect', label: 'Conectar', Icon: Cable},
  {id: 'raise', label: 'Subir terreno', Icon: ChevronsUp}, {id: 'lower', label: 'Bajar terreno', Icon: ChevronsDown}, {id: 'level', label: 'Nivelar terreno', Icon: Equal},
];
const num = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});
const int = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
const hhmm = new Intl.DateTimeFormat('es-CL', {hour: '2-digit', minute: '2-digit'});

class Boundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null};
  static getDerivedStateFromError(error: Error) { return {error}; }
  componentDidCatch(error: Error) { console.error('[Agro] el escenario 3D falló:', error); }
  render() {
    return this.state.error ? <div className="agro-gl-error" role="alert"><strong>El escenario 3D tuvo un problema</strong><p>Tu mundo está guardado: puedes volver a Mis mundos o exportarlo desde Archivo.</p><button type="button" onClick={() => location.reload()}>Reintentar</button></div> : this.props.children;
  }
}
const hasWebGL = (): boolean => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

type SaveState = 'saved' | 'pending' | 'saving' | 'error';
export type WorkspaceProps = {session: WorldSession; store: WorldStore; persistent: boolean; onExit(): Promise<void> | void; onBeforeExit?: never};

/** Autoguardado: guarda a más tardar 700 ms después del primer cambio pendiente (así también guarda con el reloj corriendo), el mundo entero y nunca anuncia «guardado» si el navegador falló. */
function useAutosave(session: WorldSession, store: WorldStore, persistent: boolean) {
  const [state, setState] = useState<SaveState>('saved');
  const [error, setError] = useState('');
  const [at, setAt] = useState<Date | null>(null);
  const savedVersion = useRef(session.saveVersion), running = useRef<Promise<void> | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (force = false): Promise<void> => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (running.current) await running.current;
    const decision = autosaveDecision(session, savedVersion.current, force);
    if (!decision.save) {
      if (decision.reason === 'sin-cambios') setState(s => (s === 'pending' ? 'saved' : s));
      else { setState(s => (s === 'saving' ? s : 'pending')); timer.current = setTimeout(() => void flush(), STROKE_RETRY_MS); }   // trazo de terreno abierto: se espera a que se cierre
      return;
    }
    const job = (async () => {
      const version = session.saveVersion; setState('saving');
      const r = await store.save(session.toWorld());
      if (r.ok) { savedVersion.current = version; setError(''); setAt(new Date()); setState(session.saveVersion === version ? 'saved' : 'pending'); await store.setActive(session.id); }
      else { setError(r.error); setState('error'); }
    })();
    running.current = job; await job; running.current = null;
  }, [session, store]);

  useEffect(() => {
    if (!persistent) return;
    const off = session.subscribe(() => { if (session.saveVersion === savedVersion.current) return; setState(s => (s === 'saving' ? s : 'pending')); if (!timer.current) timer.current = setTimeout(() => void flush(), 700); });
    const hidden = () => { if (document.visibilityState === 'hidden') void flush(true); };
    const leave = () => { void flush(true); };
    document.addEventListener('visibilitychange', hidden); window.addEventListener('pagehide', leave);
    return () => { off(); document.removeEventListener('visibilitychange', hidden); window.removeEventListener('pagehide', leave); if (timer.current) clearTimeout(timer.current); void flush(true); };
  }, [session, persistent, flush]);
  return {state, error, at, flush};
}

/** Workspace de Agro: terreno 3D, piezas, medición, catálogo, inspector y guardado automático. */
export function Workspace({session, store, persistent, onExit}: WorkspaceProps) {
  const version = useSyncExternalStore(session.subscribe.bind(session), () => session.version);
  const save = useAutosave(session, store, persistent);
  const [mode, setMode] = useState<CameraMode>('orbit');
  const [guideOpen,setGuideOpen]=useState(true);
  const [editor,setEditor]=useState(false);
  const [roadBuilding,setRoadBuilding]=useState(false);
  const [editorPointMode,setEditorPointMode]=useState<'center'|'polygon'|'path'>('center');
  const [editorPoints,setEditorPoints]=useState<Point[]>([]);
  const [tool, setTool] = useState<Tool>('select');
  const [placing, setPlacing] = useState<string | null>(null);
  const [yaw, setYaw] = useState(0);
  const [gridSnap, setGridSnap] = useState(true);
  const [showPorts, setShowPorts] = useState(false);
  const [radius, setRadius] = useState(20);
  const [strength, setStrength] = useState(1);
  const [hover, setHover] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [measurePoints, setMeasurePoints] = useState<Point[]>([]);
  const [ghost, setGhost] = useState<GhostInfo>(null);
  const [connectFrom, setConnectFrom] = useState<PortRef | null>(null);
  const [portHover, setPortHover] = useState<PortRef | null>(null);
  const [pieces, setPieces] = useState(false);
  const [camera, setCamera] = useState<CameraReport | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({triangles: 0, calls: 0});
  const [goto, setGoto] = useState<{x: number; z: number; nonce: number} | null>(null);
  const [notice, setNotice] = useState('');
  const [mini, setMini] = useState(true);
  const [wmode, setWmode] = useState<WorkMode>('inspect');
  const [dockGroup, setDockGroup] = useState(0);
  const [labels, setLabels] = useState(true);
  const [autoBoard, setAutoBoard] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{id: string; text: string} | null>(null);
  const [reviewSelection, setReviewSelection] = useState<{report: ImpactReport; focus: ReviewFocus} | null>(null);
  const [webgl] = useState(hasWebGL);
  const [leaving, setLeaving] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const hf = session.terrain.hf;
  const territory = TERRITORIES[hf.presetId], features = decorativeFeatures(hf);
  const decoration = [features.water && 'Río', features.road && 'camino'].filter(Boolean).join(' y ');
  const selected: Entity | undefined = selectedId ? session.entity(selectedId) : undefined;
  const review = session.terrainImpact;
  const reviewFocus = review && reviewSelection?.report === review ? reviewSelection.focus : null;

  const speed = session.clock.speed;
  const [lag, setLag] = useState(false);
  useEffect(() => { // el reloj de la simulación: cada 100 ms real avanza speed×dt segundos simulados, con un presupuesto de 12 ms para no congelar la pantalla
    if (!speed) { setLag(false); return; }
    let last = performance.now(), slow = 0;
    const id = setInterval(() => {
      const now = performance.now(), dt = Math.min(0.5, (now - last) / 1000); last = now;
      const want = dt * speed, got = session.advance(want, 12);
      slow = got < want * 0.9 ? Math.min(slow + 1, 10) : Math.max(slow - 1, 0); setLag(slow >= 5);
    }, 100);
    return () => clearInterval(id);
  }, [session, speed]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { if (selectedId && !session.entity(selectedId)) setSelectedId(null); }, [version, selectedId, session]);

  const onHover = useCallback((p: Point | null) => setHover(p), []);
  const onSelectPoint = useCallback((p: Point | null) => { setSelectedPoint(p); if (p) setSelectedId(null); }, []);
  const onSelectEntity = useCallback((id: string | null) => { setSelectedId(id); if (id) setSelectedPoint(null); }, []);
  const onMeasure = useCallback((p: Point) => setMeasurePoints(pts => (pts.length >= 2 ? [p] : [...pts, p])), []);
  const onPlaced = useCallback((e: Entity) => { setSelectedId(null); setNotice(`«${e.label}» colocada.`); }, []);
  const onCamera = useCallback((c: CameraReport) => setCamera(prev => (prev && Math.abs(prev.x - c.x) < 0.5 && Math.abs(prev.z - c.z) < 0.5 && Math.abs(prev.yaw - c.yaw) < 0.01 ? prev : c)), []);
  const onMetrics = useCallback((m: Metrics) => setMetrics(prev => (prev.triangles === m.triangles && prev.calls === m.calls ? prev : m)), []);
  const onNotice = useCallback((m: string) => setNotice(m), []);
  const goTo = useCallback((x: number, z: number) => setGoto(g => ({x, z, nonce: (g?.nonce ?? 0) + 1})), []);
  const describePort = useCallback((r: PortRef): string => { const e = session.entity(r.entityId), p = e?.ports.find(q => q.id === r.portId); return e && p ? `${e.label} · ${p.label ?? p.id}` : r.portId; }, [session]);
  const onPortClick = useCallback((ref: PortRef | null) => {
    if (!ref) { setConnectFrom(null); return; }
    setConnectFrom(from => {
      if (!from) {
        const used = session.connections.some(c => (c.a.entityId === ref.entityId && c.a.portId === ref.portId) || (c.b.entityId === ref.entityId && c.b.portId === ref.portId));
        if (used) { setNotice(`${describePort(ref)} ya está conectado.`); return null; }
        return ref;
      }
      if (from.entityId === ref.entityId && from.portId === ref.portId) return null;
      const r = session.connectPorts(from, ref);
      setNotice(r.ok ? (r.value.docked ? `Conectado: se acopló «${r.value.docked}».` : 'Conectado.') : `No se pudo conectar: ${r.error}`);
      return null;
    });
  }, [session, describePort]);
  const placingParams = useMemo<Record<string, PropValue>>(() => ({}), []);

  const pickTool = (t: Tool) => { if(t==='edit'){setSelectedId(null);setWmode('inspect');setAutoBoard(null);} if(session.operationPreview||session.parcelPreview){setNotice('Aplica o cancela la vista previa antes de cambiar de herramienta.');return;} if(t!=='edit')setRoadBuilding(false); if(['raise','lower','level'].includes(t)&&!editor){setEditor(true);session.setEditorActive(true);}  setTool(t); setConnectFrom(null); setPortHover(null); if (t !== 'place') { setPlacing(null); setGhost(null); } if (t !== 'measure') setMeasurePoints([]); if (t !== 'select') { setSelectedPoint(null); } };
  const pickItem = (id: string) => { setPlacing(id); setTool('place'); setMeasurePoints([]); setSelectedId(null); setSelectedPoint(null); };
  const openAutomate = (preferred?: string) => {
    const boards = session.entities.filter(e => e.type === 'tablero'), id = preferred ?? (selected?.type === 'tablero' ? selected.id : boards[0]?.id);
    if (!id) { setNotice('Coloca un tablero en Construir → Control para automatizar.'); return; }
    pickTool('select');
    setAutoBoard(id);
    setWmode('auto');
  };
  const onMode = (m: WorkMode) => {
    if (m === 'auto' && !autoBoard) { openAutomate(); return; }
    setAutoBoard(null);
    pickTool('select');
    setWmode(wmode === m ? 'inspect' : m);
  };

  const requestDelete = useCallback((id: string) => {
    const r = session.remove(id);
    if (r.ok) { setSelectedId(null); setNotice('Pieza eliminada. Puedes deshacerlo con Ctrl+Z.'); return; }
    if (r.dependencies) setPendingDelete({id, text: r.error}); else setNotice(r.error);
  }, [session]);
  const confirmDelete = () => { if (!pendingDelete) return; const r = session.remove(pendingDelete.id, {confirm: true}); setPendingDelete(null); if (r.ok) { setSelectedId(null); setNotice('Pieza y conexiones eliminadas. Puedes deshacerlo con Ctrl+Z.'); } else setNotice(r.error); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if(session.parcelPreview){if(e.key==='Escape'){e.preventDefault();session.abortStroke();}return;}
      if (session.terrainImpact) return;
      if (session.terrain.painting) {
        if (e.key === 'Escape') { e.preventDefault(); session.abortStroke(); }
        return;
      }
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.key !== 'Escape') return;
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) session.redo(); else session.undo(); }
      else if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); session.redo(); }
      else if (mode === 'walk' && ['q', 'e'].includes(k)) return;
      else if ((k === 'q' || k === 'e') && !e.ctrlKey && !e.metaKey) { const d = (k === 'e' ? 1 : -1) * (Math.PI / 12); if (tool === 'place' && placing) setYaw(y => y + d); else if (selectedId) { const r = session.rotate(selectedId, d); if (!r.ok) setNotice(r.error); } }
      else if ((k === 'delete' || k === 'backspace') && selectedId && !pendingDelete) { e.preventDefault(); requestDelete(selectedId); }
      else if (k === 'escape') { if (pendingDelete) return; if (autoBoard) { setAutoBoard(null); setWmode('inspect'); return; } if (tool === 'place') pickTool('select'); else if (wmode === 'build') onMode('inspect'); else if (connectFrom) setConnectFrom(null); else if (measurePoints.length) setMeasurePoints([]); else { setSelectedId(null); setSelectedPoint(null); } }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const download = () => {
    menu.current?.removeAttribute('open');
    const world = session.toWorld(), {filename, text} = exportWorld(world);
    const url = URL.createObjectURL(new Blob([text], {type: 'application/json'})), a = document.createElement('a');
    a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Mundo exportado: ${world.entities.length} piezas y ${world.terrain.edits.length} ediciones de terreno.`);
  };
  const rename = () => { menu.current?.removeAttribute('open'); const n = prompt('Nombre del mundo', session.name); if (n !== null) { const r = session.setName(n); if (!r.ok) setNotice(r.error); } };
  const exit = async () => { setLeaving(true); await save.flush(true); await onExit(); };

  const readout = (label: string, p: Point | null, id: string) => p ? <p className="agro-read" data-testid={id}><b>{label}</b><span>Cota {num.format(p.y)} m</span><span>Pendiente {num.format(slopeDegrees(hf, p.x, p.z))}° · {num.format(Math.tan(slopeDegrees(hf,p.x,p.z)*Math.PI/180)*100)} %</span><span>x {int.format(p.x)} · z {int.format(p.z)}</span></p> : null;
  const analysis = session.analyze();
  const showDock = wmode === 'build' && mode !== 'walk';
  const alertCount = session.alerts().length;
  const m = measurePoints.length === 2 ? measure(measurePoints[0], measurePoints[1]) : null;
  const current = MODES.find(x => x.id === mode)!;
  const brush = tool === 'raise' || tool === 'lower' || tool === 'level';
  const terrainRev = session.terrain.edits.length;
  const checksum = useMemo(() => session.terrain.checksum(), [session, terrainRev]); // eslint-disable-line react-hooks/exhaustive-deps
  const chip = save.state === 'error' ? 'No se pudo guardar' : !persistent ? 'Sin guardado en este navegador' : save.state === 'saving' ? 'Guardando…' : save.state === 'pending' ? 'Cambios sin guardar' : `Guardado${save.at ? ` · ${hhmm.format(save.at)}` : ''}`;

  return <div className="agro-ws" data-lift={showDock ? 'dock' : ''} data-experience={session.experience} data-wmode={wmode} data-labels={labels} data-testid="agro-app" data-view="workspace" data-ready="true" data-mode={mode} data-tool={tool} data-edits={session.terrain.edits.length} data-entities={session.entities.length} data-selected={selectedId ?? ''} data-save={persistent ? save.state : 'memory'} data-flow={analysis.balance.emittersLmin.toFixed(3)} data-warnings={analysis.warnings.length} data-stretched={analysis.stretched.length} data-conns={session.connections.length} data-speed={speed} data-sim-seconds={Math.floor(session.clock.simSeconds)} data-sim-day={timeInfo(session.clock).dayIndex} data-alerts={alertCount}
    data-tris={metrics.triangles} data-calls={metrics.calls} data-seed={hf.seed} data-cam-x={camera ? Math.round(camera.x) : ''} data-cam-z={camera ? Math.round(camera.z) : ''} data-checksum={checksum} data-world={session.id} data-hover-x={hover ? hover.x.toFixed(2) : ''} data-hover-z={hover ? hover.z.toFixed(2) : ''}>
    <header className="agro-bar">
      <h1 className="agro-work-brand"><span className="agro-modo-logo" aria-label="modo." role="img" /><span>Agro</span></h1>
      <button type="button" className="agro-back" onClick={() => void exit()} disabled={leaving} aria-label="Volver a Mis mundos"><ArrowLeft size={16} aria-hidden="true" /><span>Mis mundos</span></button>
      <p className="agro-crumb"><button type="button" className="agro-name-btn" onClick={rename} title="Cambiar nombre" data-testid="agro-world-name">{session.name}</button><span>{session.policy.label}</span></p>
      <button type="button" className={`agro-chip ${save.state}`} data-testid="agro-save" title={save.error || 'Los mundos se guardan solos en este navegador.'} onClick={() => void save.flush()}>{chip}</button>
      <SimulationAlerts session={session} />
      <details ref={menu} className="agro-menu"><summary>Archivo</summary>
        <div role="menu">
          <button type="button" role="menuitem" onClick={download}><Download size={15} aria-hidden="true" />Exportar mundo</button>

          {Object.values(EXPERIENCE_POLICIES).map(policy=><button key={policy.id} type="button" role="menuitemradio" data-testid={`agro-exp-${policy.id}`} aria-checked={session.experience===policy.id} onClick={()=>{
            menu.current?.removeAttribute('open');const r=session.setExperience(policy.id);
            if(!r.ok){setNotice(r.error);return;}if(policy.guidedChecks)setGuideOpen(true);setNotice(policy.label+': '+policy.description);
          }}>{session.experience===policy.id?'● ':'○ '}{policy.label}</button>)}
          {session.policy.guidedChecks&&<button type="button" role="menuitem" data-testid="agro-guide-toggle" onClick={()=>{menu.current?.removeAttribute('open');setGuideOpen(v=>!v);}}>{guideOpen?'Ocultar':'Mostrar'} guía de aprendizaje</button>}
        </div>
      </details>
    </header>

    <main className="agro-stage" data-reviewing={!!review}>
      {webgl ? <Boundary><Suspense fallback={<div className="agro-loading-scene" role="status">Generando el terreno…</div>}>
        <AgroCanvas editorPoints={editor||roadBuilding?editorPoints:[]} editorClosed={editorPointMode==='polygon'} onEditPoint={p=>{if(!session.terrain.painting&&!session.parcelPreview){if(roadBuilding){const hf=session.terrain.hf,[x,z]=snapToRoad([...(hf.baseRoads??[]),...(hf.surfaceEdits??[])],[p.x,p.z]);p={x,z,y:sampleHeight(hf,x,z)};}setEditorPoints(pts=>editorPointMode==='center'?[p]:[...pts,p].slice(0,64));}}} session={session} mode={mode} tool={tool} placing={placing} placingParams={placingParams} yaw={yaw} gridSnap={gridSnap} showPorts={showPorts || tool === 'connect'} labels={labels && mode !== 'strategic'} radius={radius} strength={strength}
          selectedPoint={selectedPoint} selectedId={selectedId} measurePoints={measurePoints} goto={goto} review={review} reviewFocus={reviewFocus} onHover={onHover} onSelectPoint={onSelectPoint} onSelectEntity={onSelectEntity} onMeasure={onMeasure}
          onPlaced={onPlaced} onGhost={setGhost} connectFrom={connectFrom} onPortClick={onPortClick} onPortHover={setPortHover} onCamera={onCamera} onMetrics={onMetrics} onNotice={onNotice} />
      </Suspense></Boundary> : <div className="agro-gl-error" role="alert"><strong>Este dispositivo no puede mostrar gráficos 3D</strong><p>Agro necesita WebGL. Prueba con otro navegador o activa la aceleración por hardware.</p></div>}

      <div className="agro-hudrow">
        <WeatherChips session={session} />
        <div className="agro-cams" role="group" aria-label="Cámara">
          {MODES.map(({id, label, Icon}) => <button key={id} type="button" className={mode === id ? 'on' : ''} aria-pressed={mode === id} aria-label={label} title={label} disabled={editor&&id==='walk'} onClick={() => { if (id === 'walk') pickTool('select'); setMode(id); }}><Icon size={18} aria-hidden="true" /><span>{label}</span></button>)}
        </div>
        <div inert={editor}><TimeBar session={session} lag={lag} /></div>
      </div>
      <p className="agro-hint" role="note">{mode === 'strategic' ? 'El minimapa marca el área jugable · El paisaje exterior es escénico' : current.hint}</p>

      <button type="button" className="agro-editor-toggle" aria-pressed={editor} onClick={()=>{if(session.operationPreview||session.parcelPreview){setNotice('Aplica o cancela la vista previa antes de cambiar de herramienta.');return;}const active=!editor;setRoadBuilding(false);session.setEditorActive(active);setEditor(active);setSelectedId(null);setPieces(false);setWmode('inspect');setAutoBoard(null);if(active&&mode==='walk')setMode('orbit');setEditorPointMode('center');setEditorPoints([]);pickTool(active?'edit':'select');}}>{editor?'Volver a partida':'Editar mapa'}</button>
      {!editor && <button type="button" className="agro-road-toggle" aria-pressed={roadBuilding} onClick={()=>{if(session.operationPreview){setNotice('Aplica o cancela el camino antes de cerrar la herramienta.');return;}const active=!roadBuilding;setRoadBuilding(active);setEditorPoints([]);setEditorPointMode('path');if(active&&mode==='walk')setMode('orbit');pickTool(active?'edit':'select');}}>{roadBuilding?'Cerrar caminos':'Construir caminos'}</button>}
      {session.policy.guidedChecks&&guideOpen&&!editor&&!selected&&!autoBoard&&(wmode==='inspect'||wmode==='build')&&<LearningPanel session={session} onClose={()=>setGuideOpen(false)} onLocate={id=>{setSelectedId(id);const e=session.entity(id);if(e)goTo(e.pose.position[0],e.pose.position[2]);}} />}
      {editor && tool==='edit' && <TerrainEditor onPointMode={setEditorPointMode} onRemoveLast={()=>setEditorPoints(pts=>pts.slice(0,-1))} session={session} points={editorPoints} onClear={()=>setEditorPoints([])} onNotice={onNotice} />}
      {roadBuilding && tool==='edit' && <TerrainEditor roadOnly onPointMode={setEditorPointMode} onRemoveLast={()=>setEditorPoints(pts=>pts.slice(0,-1))} session={session} points={editorPoints} onClear={()=>setEditorPoints([])} onNotice={onNotice} />}
      {editor && tool!=='edit' && <button type="button" className="agro-editor-return" onClick={()=>pickTool('edit')}>Herramientas del mapa</button>}
      <div className="agro-tools" role="toolbar" aria-label="Herramientas" aria-orientation="vertical">
        {TOOLS.slice(0, 3).map(({id, label, Icon}) => <button key={id} type="button" className={tool === id ? 'on' : ''} aria-pressed={tool === id} aria-label={label} title={label} disabled={mode === 'walk' && id !== 'select'} onClick={() => pickTool(id)}><Icon size={20} aria-hidden="true" /></button>)}
        <hr />
        {TOOLS.slice(3).map(({id, label, Icon}) => <button key={id} type="button" className={tool === id ? 'on' : ''} aria-pressed={tool === id} aria-label={label} title={label} disabled={mode === 'walk'} onClick={() => pickTool(id)}><Icon size={20} aria-hidden="true" /></button>)}
        <hr />
        <button type="button" aria-label="Deshacer" title={session.undoLabel ? `Deshacer: ${session.undoLabel} (Ctrl+Z)` : 'Deshacer (Ctrl+Z)'} disabled={!session.canUndo} onClick={() => session.undo()}><Undo2 size={20} aria-hidden="true" /></button>
        <button type="button" aria-label="Rehacer" title="Rehacer (Ctrl+Y)" disabled={!session.canRedo} onClick={() => session.redo()}><Redo2 size={20} aria-hidden="true" /></button>
      </div>

      {brush && mode !== 'walk' && <div className="agro-brush" role="group" aria-label="Pincel">
        <label>Radio <output>{radius} m</output><input type="range" min={MIN_RADIUS} max={MAX_RADIUS} step={1} value={radius} onChange={e => setRadius(Number(e.target.value))} aria-label="Radio del pincel" /></label>
        {tool !== 'level' && <label>Intensidad <output>{num.format(strength)} m</output><input type="range" min={0.25} max={3} step={0.25} value={strength} onChange={e => setStrength(Number(e.target.value))} aria-label="Intensidad del pincel" /></label>}
        <span className="agro-count" data-testid="agro-edits">{session.terrain.edits.length} {session.terrain.edits.length === 1 ? 'edición' : 'ediciones'}</span>
      </div>}

      {selected && (wmode === 'inspect' || wmode === 'build') && <Inspector session={session} entity={selected} onClose={() => setSelectedId(null)} onDelete={requestDelete} onNotice={onNotice} onAutomate={() => openAutomate(selected.id)} gridSnap={gridSnap} onSnap={setGridSnap} />}
      {selected && wmode === 'inspect' && mode !== 'walk' && <ContextBar entity={selected} onRotate={d => { const r = session.rotate(selected.id, d); if (!r.ok) setNotice(r.error); }} onDelete={() => requestDelete(selected.id)} onAutomate={() => openAutomate(selected.id)} />}
      {autoBoard && <AutomationPanel session={session} boardId={autoBoard} onBoard={setAutoBoard} onClose={() => { setAutoBoard(null); setWmode('inspect'); }} report={r => { if (!r.ok && r.error) setNotice(r.error); }} />}
      {wmode === 'layers' && <LayersPanel labels={labels} ports={showPorts} mini={mini} pieces={pieces} onLabels={setLabels} onPorts={setShowPorts} onMini={setMini} onPieces={setPieces} onClose={() => setWmode('inspect')} />}
      {wmode === 'manage' && !autoBoard && <InventoryPanel session={session} onClose={() => setWmode('inspect')} onNotice={onNotice} />}
      <div className="agro-workbar">
        <ModeBar mode={wmode} onMode={onMode} />
        {showDock && <Dock stock={t => session.stockOf(t)} placing={placing} group={dockGroup} onGroup={setDockGroup} onPick={pickItem} ghost={ghost} gridSnap={gridSnap} onSnap={setGridSnap} onTurn={angle => setYaw(y => y + angle)} onCancel={() => pickTool('select')} />}
      </div>
      <NetworkCard session={session} detail={wmode === 'water' || wmode === 'power' ? wmode : null} />

      <div className="agro-info" aria-live="polite">
        {tool === 'connect' && <p className="agro-read" data-testid="agro-connect-info"><b>Conectar</b><span>{connectFrom ? `Origen: ${describePort(connectFrom)} · elige el puerto de destino` : portHover ? describePort(portHover) : 'Pulsa el primer puerto'}</span></p>}
        {tool === 'measure' && <p className="agro-read" data-testid="agro-measure"><b>Medir</b>{m ? <><span>Distancia {num.format(m.distance)} m</span><span>Horizontal {num.format(m.horizontal)} m</span><span>Desnivel {m.rise >= 0 ? '+' : ''}{num.format(m.rise)} m</span><span>Pendiente {num.format(m.slopeDeg)}°</span></> : <span>{measurePoints.length === 0 ? 'Pulsa el punto de partida' : 'Pulsa el punto final'}</span>}</p>}
        {readout('Seleccionado', selectedPoint, 'agro-selected')}{readout('Puntero', hover, 'agro-hover')}
        {!hover && !selectedPoint && tool === 'select' && !selected && <p className="agro-read agro-muted"><Eye size={14} aria-hidden="true" /><span>Mueve el puntero sobre el terreno para ver cota y pendiente</span></p>}
        <p className="agro-meta" data-testid="agro-meta">{int.format(hf.sizeX * hf.sizeZ / 10_000)} ha · {session.entities.length} {session.entities.length === 1 ? 'pieza' : 'piezas'}</p>
        <p className="agro-meta agro-territory-caption">{territory.name}{decoration && ` · ${decoration} ${features.water && features.road ? 'decorativos' : 'decorativo'}`}</p>
      </div>

      <div className="agro-mini" hidden={!mini}>{mini && <Minimap hf={hf} revision={terrainRev} camera={camera} entities={session.entities} connections={session.connections} onGoto={goTo} />}</div>
      <button type="button" className="agro-pieces-toggle" aria-pressed={pieces} aria-label="Lista de piezas" title="Lista de piezas" onClick={() => setPieces(v => !v)}><List size={18} aria-hidden="true" /></button>
      {pieces && <div className="agro-pieces" role="region" aria-label="Piezas del mundo" data-testid="agro-pieces">
        {session.entities.length === 0 ? <p className="agro-muted">Todavía no hay piezas. Abre «Construir» para colocar una.</p> : <ul>{session.entities.map(e => <li key={e.id}><button type="button" className={e.id === selectedId ? 'on' : ''} onClick={() => { setSelectedId(e.id); setSelectedPoint(null); setWmode('inspect'); setAutoBoard(null); pickTool('select'); goTo(e.pose.position[0], e.pose.position[2]); }}>{e.label}</button></li>)}</ul>}
      </div>}
      <button type="button" className="agro-mini-toggle" aria-pressed={mini} aria-label={mini ? 'Ocultar minimapa' : 'Mostrar minimapa'} title="Minimapa" onClick={() => setMini(v => !v)}><MapIcon size={18} aria-hidden="true" /></button>

      {notice && <p className="agro-toast" role="status" data-testid="agro-notice">{notice}</p>}
      {pendingDelete && <ConfirmDialog title="Eliminar con conexiones" confirmLabel="Eliminar pieza y conexiones" onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)}><p data-testid="agro-confirm-text">{pendingDelete.text}</p><p>Se quitarán también esas conexiones. Puedes deshacerlo con Ctrl+Z.</p></ConfirmDialog>}
      {review && <TerrainImpactDialog report={review} focus={reviewFocus} onLocate={webgl ? focus => setReviewSelection({report: review, focus}) : undefined}
        onCancel={() => { setReviewSelection(null); session.abortStroke(); }}
        onApply={option => { const result = session.commitStroke(option); if (result.ok) setReviewSelection(null); return result; }} />}
    </main>
  </div>;
}
