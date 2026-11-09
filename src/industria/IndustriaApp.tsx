import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {Factory, Boxes, Cable, Camera, CircuitBoard, FileText, Monitor, Network, PanelTop, ClipboardCheck, Gauge, Volume2, VolumeX, Wrench, ChevronRight, Check, Copy, Download, Eye, Focus, Hammer, Hand, Home, ListTree, Lock, Move, Orbit, MousePointer2, Pause, Play, Plus, Redo2, RotateCw, SlidersHorizontal, Square, Terminal, Trash2, Undo2, Unlink, Upload, X} from 'lucide-react';
import {containerOf, inspectionCamera, overviewCamera} from './model/inspection';
import {restoreWindowTab} from '../components/WindowTabs';
import {FloatingWindow} from '../components/FloatingWindow';
import {useIndustriaProject} from './useIndustriaProject';
import {addEntity, dependenciesOf, release, removeEntity, renameEntity, setEntityProp, setMode} from './model/commands.ts';
import {moveEntity, rotateEntity, snapMount} from './build/commands.ts';
import {shapeOf, STATUS_LABEL} from './build/shapes.ts';
import PartsLibrary from './views/PartsLibrary';
import {allTerminals, evaluate, MAX_WIRES_PER_TERMINAL, refKey, terminalDef} from './wiring/engine.ts';
import {routeWire, tidyWires, unwire, wire} from './wiring/commands.ts';
import {CLEAR_DEPTH, CLEAR_HEIGHT, CLEAR_MIN_WIDTH, doorSwing, frontClearance} from './build/clearance.ts';
import {WIRE_COLORS, WIRE_COLOR_NOTE, wireLook, wireName} from './wiring/colors.ts';
import {withStatuses} from './wiring/engine.ts';
import {operableKind, simulate as runSimulation, SIM_ASSUMPTIONS, type SimInputs, type SimResult} from './sim/engine.ts';
import {emptyProcess, hasProcess, sensorStates, stepProcess, type ProcessState} from './sim/process.ts';
import {exampleDirectStart, exampleMiniFactory, examplePlcStartStop} from './sim/examples.ts';
import {moveSymbol, moveToPage, arrangeAll} from './diagram/commands.ts';
import {ErrorBoundary} from './ErrorBoundary';
import {IndustriaSound} from './sound/sound.ts';
import {soundEvents, type Snapshot} from './sound/plan.ts';
import {rotationDegrees} from './build/commands.ts';
import DiagramView from './views/DiagramView';
import PlcView from './views/PlcView';
import HmiView from './views/HmiView';
import BoardView from './views/BoardView';
import DocsView from './views/DocsView';
import ActivityEditor from './views/ActivityEditor';
import {addFault, removeFault, clearFaults, describeFault, FAULT_HELP, FAULT_LABEL, FAULT_TARGETS} from './faults/faults.ts';
import {diagnose} from './faults/diagnose.ts';
import {FAULT_KINDS, type FaultKind} from './model/types.ts';
import {policyOf} from './model/modes.ts';
import {ACTIVITIES, activityFor, activityOf, evaluateActivity, reopen, reportMarkdown, setAnswer, startActivity, submit} from './activities/activities.ts';
import type {HmiWidgetKind} from './model/types.ts';
import {exportProject} from './model/library.ts';
import {descendantsOf, overlapsOf, parentMountOf, type SnapCandidate} from './build/snap.ts';
import {EDUCATION_MODES, type ConnectionStatus, type Entity, type EducationMode, type Pose, type TerminalRef, type Vec3} from './model/types.ts';
import {defaultUi, PANEL_IDS, parseUi, uiKey, VIEWS, type CameraState, type IndustriaUi, type PanelId, type ViewId} from './model/ui.ts';
import '../styles/robotics.css';
import '../styles/industria.css';


/** El escenario 3D es un archivo aparte: si no se puede descargar (sin red), el resto de la aplicación sigue viva. */
const IndustriaCanvas = lazy(() => import('./scene/IndustriaCanvas'));

const MODE_LABEL: Record<EducationMode, string> = {free: 'Libre', learning: 'Aprendizaje', test: 'Prueba'};
const VIEW_ICONS = {plant: Factory, board: PanelTop, diagram: Network, plc: CircuitBoard, hmi: Monitor, docs: FileText};
const VIEW_HINT: Record<ViewId, string> = {plant: 'Planta 3D: construye y observa la instalación', board: 'Tablero: alzado de la placa con sus aparatos y terminales', diagram: 'Diagramas: esquema eléctrico generado del proyecto', plc: 'PLC: programa en escalera', hmi: 'HMI: pantalla de operación', docs: 'Documentación: materiales, cables y entradas/salidas'};
type PlantTool = 'orbit' | 'pan' | 'move' | 'wire' | 'operate';
const PANEL_ORDER: readonly PanelId[] = ['library', 'structure', 'inspector', 'connections', 'instruments', 'faults', 'cameras', 'activity', 'console'];
const PANEL_LABEL: Record<PanelId, {title: string; eyebrow: string; Icon: typeof Boxes}> = {
  library: {title: 'Piezas', eyebrow: 'Busca y agrega equipos', Icon: Boxes},
  structure: {title: 'Estructura', eyebrow: 'Componentes y montajes', Icon: ListTree},
  connections: {title: 'Conexiones', eyebrow: 'Conecta terminales y revisa redes', Icon: Network},
  instruments: {title: 'Instrumentos', eyebrow: 'Acciona mandos y toma medidas', Icon: Gauge},
  faults: {title: 'Fallas', eyebrow: 'Inyecta y diagnostica fallas', Icon: Wrench},
  activity: {title: 'Actividad', eyebrow: 'Ejercicios guiados y evaluación', Icon: ClipboardCheck},
  inspector: {title: 'Propiedades', eyebrow: 'Edita posición y montaje', Icon: SlidersHorizontal},
  cameras: {title: 'Escenario', eyebrow: 'Cambia o guarda la cámara', Icon: Camera},
  console: {title: 'Consola', eyebrow: 'Eventos de esta sesión', Icon: Terminal},
};
const TARGET: Vec3 = [0, 0.8, 0];
const PRESETS: {name: string; position: Vec3}[] = [
  {name: 'Frente', position: [0, 2.2, 9]}, {name: 'Lateral', position: [9, 2.2, 0]}, {name: 'Superior', position: [0.01, 11, 0.01]}, {name: 'ISO', position: [6, 5, 7]},
];
const fmt = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', ',');

function PoseField({label, value, disabled, onCommit}: {label: string; value: number; disabled: boolean; onCommit(v: number): void}) {
  const [text, setText] = useState(fmt(value));
  useEffect(() => setText(fmt(value)), [value]);
  const commit = () => { const n = Number(text.replace(',', '.')); if (Number.isFinite(n) && n !== value) onCommit(n); else setText(fmt(value)); };
  return <label className="ind-field"><span>{label}</span><input inputMode="decimal" value={text} disabled={disabled} onChange={e => setText(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>;
}

export default function IndustriaApp() {
  const api = useIndustriaProject();
  const {project} = api;
  const [ui, setUi] = useState<IndustriaUi>(defaultUi);
  const [uiFor, setUiFor] = useState('');
  const [cameraNonce, setCameraNonce] = useState(0);
  const [glKey, setGlKey] = useState(0);
  const [supported, setSupported] = useState(true);
  const [projectOpen, setProjectOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [query, setQuery] = useState('');
  const [uncoverDucts, setUncoverDucts] = useState(false);
  const [closedCabinet, setClosedCabinet] = useState<string | null>(null);
  const [tool, setTool] = useState<PlantTool>('orbit');
  const wiring = tool === 'wire';
  const coarsePointer = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const [faultKind, setFaultKind] = useState<FaultKind>('wire-open');
  const [faultTarget, setFaultTarget] = useState('');
  const [faultHidden, setFaultHidden] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [manual, setManual] = useState(false);
  /** Al iniciar una actividad, el proyecto nuevo abre su panel Actividad. */
  const openActivity = useRef(false);
  const [simStatus, setSimStatus] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [inputs, setInputs] = useState<SimInputs>({});
  const [meterMode, setMeterMode] = useState<'continuity' | 'voltage'>('voltage');
  const [probeA, setProbeA] = useState('');
  const [probeB, setProbeB] = useState('');
  const prevSim = useRef<{energized: Record<string, boolean>; plc: SimResult['plc']}>({energized: {}, plc: {}});
  const [pending, setPending] = useState<TerminalRef | null>(null);
  const [pickedConn, setPickedConn] = useState<string | null>(null);
  const [endA, setEndA] = useState('');
  const [endB, setEndB] = useState('');
  const [family, setFamily] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const submitted = !!project.lesson.submitted;
  const policy = policyOf(project.mode);
  /** En simulación o con la actividad entregada la estructura está protegida. */
  const simulate = ui.operation === 'simulate' || submitted;

  const log = useCallback((text: string) => setEvents(list => [`${new Date().toLocaleTimeString('es-CL')} · ${text}`, ...list].slice(0, 50)), []);

  // WebGL disponible
  useEffect(() => {
    try { const c = document.createElement('canvas'); setSupported(!!(c.getContext('webgl2') || c.getContext('webgl'))); } catch { setSupported(false); }
  }, []);

  // Estado de interfaz: se guarda aparte del proyecto, por proyecto
  useEffect(() => {
    if (!api.ready) return;
    let next = defaultUi(), raw: string | null = null;
    try { raw = localStorage.getItem(uiKey(project.id)); next = parseUi(raw); } catch { /* sin almacenamiento: valores por defecto */ }
    // En teléfono y tablet vertical la Biblioteca tapa el escenario: arranca cerrada si no hay una disposición guardada.
    if (raw === null && matchMedia('(max-width:900px)').matches) next = {...next, panels: {...next.panels, library: false}};
    if (raw === null && project.entities.some(e => e.definitionId === 'sala-electrica')) next = {...next, camera: overviewCamera(project)};
    if (openActivity.current) { openActivity.current = false; next = {...next, panels: {...next.panels, library: false, activity: true}}; }
    setTool('orbit'); setPending(null); setClosedCabinet(null); setUncoverDucts(false);
    setUi(next); setUiFor(project.id); setCameraNonce(n => n + 1);
  }, [api.ready, project.id]);
  useEffect(() => {
    if (!api.ready || uiFor !== project.id) return;
    const timer = setTimeout(() => { try { localStorage.setItem(uiKey(project.id), JSON.stringify(ui)); } catch { /* opcional */ } }, 300);
    return () => clearTimeout(timer);
  }, [ui, uiFor, project.id, api.ready]);

  const patchUi = useCallback((change: Partial<IndustriaUi> | ((u: IndustriaUi) => Partial<IndustriaUi>)) => setUi(u => ({...u, ...(typeof change === 'function' ? change(u) : change)})), []);
  const selected = useMemo(() => project.entities.filter(e => ui.selection.includes(e.id)), [project.entities, ui.selection]);
  const one: Entity | undefined = selected.length === 1 ? selected[0] : undefined;
  const select = useCallback((ids: string[]) => {
    const first = project.entities.find(e => e.id === ids[0]);
    const path = ['Planta'];
    if (ids.length === 1 && first) {
      const cabinet = first.definitionId === 'gabinete' ? first : containerOf(project, first.id, 'gabinete');
      const room = first.definitionId === 'sala-electrica' ? first : containerOf(project, cabinet?.id ?? first.id, 'sala-electrica');
      for (const entity of [room, cabinet]) if (entity && entity.id !== first.id) path.push(entity.label);
      path.push(first.label);
    }
    patchUi({selection: ids, path});
  }, [project, patchUi]);
  const setCamera = (camera: CameraState) => { patchUi({camera}); setCameraNonce(n => n + 1); };
  const togglePanel = (id: PanelId) => {
    if (!restoreWindowTab('industria:' + id)) patchUi(u => ({panels: {...u.panels, [id]: !u.panels[id]}}));
  };

  // Teclado: deshacer/rehacer, Escape, F
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const mod = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
      if (mod && key === 'z') { e.preventDefault(); (e.shiftKey ? api.redo : api.undo)(); }
      else if (mod && key === 'y') { e.preventDefault(); api.redo(); }
      else if (!mod && key === 'escape') { if (pending) setPending(null); else if (wiring) setTool('orbit'); else select([]); }
      else if (!mod && key === 'r') rotateSelected();
      else if (!mod && key === 'f') setCamera({position: PRESETS[3].position, target: TARGET});
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const guardEdit = (): boolean => {
    if (!simulate) return true;
    api.setMessage(submitted ? 'La actividad está entregada y el proyecto bloqueado. Reábrela desde el panel Actividad para seguir editando.' : 'En Simulación la estructura no se edita. Vuelve a Construir para añadir, mover o quitar componentes.');
    return false;
  };

  const addShape = (definitionId: string, name?: string) => {
    if (!guardEdit()) return;
    const shape = shapeOf(definitionId), label = (name ?? '').trim() || (definitionId === 'generico' ? `Componente ${project.entities.length + 1}` : `${shape.name} ${project.entities.filter(e => e.definitionId === definitionId).length + 1}`);
    const n = project.entities.length, lift = definitionId === 'riel' || shape.anchors.some(a => a.role === 'child' && a.kind === 'din-rail') ? 0.5 : 0;
    const r = api.run(p => addEntity(p, {definitionId, label, pose: {position: [(n % 5) * 0.8 - 1.6, lift, Math.floor(n / 5) * 0.8], rotation: [0, 0, 0]}}));
    if (r.ok) { if (definitionId === 'generico') setNewName(''); select([r.value.entities[r.value.entities.length - 1].id]); log(`Añadido «${label}»`); }
  };
  const addGeneric = () => addShape('generico', newName);
  const onDrop = (id: string, pose: Pose, candidate: SnapCandidate | null) => {
    if (!guardEdit()) return;
    const label = project.entities.find(e => e.id === id)?.label ?? id;
    const r = candidate ? api.run(p => snapMount(p, candidate)) : api.run(p => moveEntity(p, id, pose, {grid: ui.magnet}));
    if (!r.ok) return;
    if (candidate) { const host = project.entities.find(e => e.id === candidate.parent.entityId)?.label ?? ''; log(`«${label}» montado en «${host}» (${candidate.parent.anchorId})`); }
    else { log(`«${label}» movido`); const hit = overlapsOf(r.value, id); if (hit.length) api.setMessage(`Aviso: «${label}» se superpone con ${hit.map(h => r.value.entities.find(e => e.id === h)?.label ?? h).join(', ')}.`); }
  };
  const highlightIds = useMemo(() => pickedConn ? [pickedConn] : one ? project.connections.filter(c => c.a.entityId === one.id || c.b.entityId === one.id).map(c => c.id) : [], [pickedConn, one, project.connections]);
  const rotateSelected = () => { if (!one || !guardEdit()) return; const r = api.run(p => rotateEntity(p, one.id, 90)); if (r.ok) log(`«${one.label}» girado 90°`); };
  const releaseMount = (mountId: string, label: string) => { if (!guardEdit()) return; const r = api.run(p => release(p, mountId)); if (r.ok) log(`«${label}» liberado (conserva su posición y sus conexiones)`); };
  const evaluation = useMemo(() => evaluate(project), [project]);
  // Reloj de la simulación: cada 100 ms real avanza 100 ms simulados si el PLC tiene temporizadores. Las demás evaluaciones no avanzan el tiempo.
  const [clock, setClock] = useState(0);
  const handledClock = useRef(0);
  // Sonido: apagado por defecto. Se activa con el botón (hace falta un gesto del usuario) y suena lo que decide sound/plan.ts.
  const soundRef = useRef<IndustriaSound | null>(null);
  const prevSnap = useRef<Snapshot>({energized: {}, inputs: {}});
  const [soundCount, setSoundCount] = useState(0);
  const toggleSound = async () => {
    if (ui.sound) { soundRef.current?.disable(); soundRef.current = null; patchUi({sound: false}); return; }
    soundRef.current ??= new IndustriaSound(); const okAudio = await soundRef.current.enable(); patchUi({sound: true});
    if (!okAudio) api.setMessage('Este navegador no permite reproducir sonido; el botón queda activo pero no se oirá nada.');
  };
  useEffect(() => { // con el sonido guardado como activo, se enciende en el primer gesto de la página
    if (!ui.sound || soundRef.current?.active) return;
    soundRef.current ??= new IndustriaSound(); const s = soundRef.current;
    const wake = () => { void s.enable(); removeEventListener('pointerdown', wake); removeEventListener('keydown', wake); };
    addEventListener('pointerdown', wake); addEventListener('keydown', wake);
    return () => { removeEventListener('pointerdown', wake); removeEventListener('keydown', wake); };
  }, [ui.sound]);
  const hasTimers = useMemo(() => Object.values(project.plc).some(pr => pr.rungs.some(r => r.coil.mode === 'ton')), [project.plc]);
  // Proceso de planta: cinta, cajas, sensores, cilindro y robot avanzan con el mismo reloj de 100 ms y devuelven los sensores al circuito
  const hasProc = useMemo(() => hasProcess(project), [project.entities]);
  const [proc, setProc] = useState<ProcessState>(emptyProcess);
  const sensors = useMemo(() => (simStatus === 'stopped' || !hasProc ? {} : sensorStates(project, proc)), [project, proc, simStatus, hasProc]);
  const sensorsKey = JSON.stringify(sensors);
  useEffect(() => { if (simStatus !== 'running' || !(hasTimers || hasProc)) return; const t = setInterval(() => setClock(c => c + 1), 100); return () => clearInterval(t); }, [simStatus, hasTimers, hasProc]);
  const sim = useMemo(() => (simStatus === 'stopped' ? null : runSimulation(project, {...inputs, ...sensors}, prevSim.current.energized, prevSim.current.plc, clock !== handledClock.current ? 100 : 0)), [project, inputs, sensorsKey, simStatus, clock]);
  const simRef = useRef<SimResult | null>(null); simRef.current = sim;
  useEffect(() => { if (simStatus === 'running' && hasProc && clock > 0) setProc(st => stepProcess(project, simRef.current, st, 0.1)); }, [clock]);
  useEffect(() => { handledClock.current = clock; }, [clock, sim]);
  useEffect(() => {
    const next: Snapshot = {energized: sim?.energized ?? {}, inputs: simStatus === 'stopped' ? {} : inputs};
    const {events, motors} = soundEvents(prevSnap.current, next, new Map(project.entities.map(e => [e.id, e.definitionId])));
    prevSnap.current = next;
    if (!ui.sound || !soundRef.current) return;
    for (const ev of events) soundRef.current.play(ev);
    soundRef.current.setMotors(simStatus === 'running' ? motors : 0);
    if (events.length) setSoundCount(c => c + events.length);
  }, [sim, inputs, simStatus, ui.sound, project.entities]);
  useEffect(() => { prevSim.current = sim ? {energized: sim.energized, plc: sim.plc} : {energized: {}, plc: {}}; }, [sim]);
  const runSim = () => { if (simStatus === 'stopped') { setProc(emptyProcess()); setInputs({}); prevSim.current = {energized: {}, plc: {}}; setTool('operate'); setPending(null); patchUi({operation: 'simulate'}); log('Simulación en marcha'); } else log('Simulación reanudada'); setSimStatus('running'); };
  const pauseSim = () => { if (simStatus === 'running') { setSimStatus('paused'); log('Simulación en pausa'); } };
  const stopSim = () => { if (simStatus !== 'stopped') log('Simulación detenida'); setSimStatus('stopped'); setTool(current => current === 'operate' ? 'orbit' : current); setProc(emptyProcess()); setInputs({}); prevSim.current = {energized: {}, plc: {}}; };
  const operate = (id: string, down: boolean) => {
    if (simStatus !== 'running') return;
    const kind = operableKind(project.entities.find(e => e.id === id)?.definitionId ?? '');
    if (kind === 'breaker' || kind === 'trip') { if (down) setInputs(i => ({...i, [id]: !i[id]})); } else if (kind === 'pushbutton') setInputs(i => ({...i, [id]: down}));
  };
  const writeHmi = (id: string, kind: HmiWidgetKind, down: boolean) => {
    if (simStatus !== 'running') return;
    if (kind === 'switch') { if (down) setInputs(i => ({...i, [`hmi:${id}`]: !i[`hmi:${id}`]})); } else setInputs(i => ({...i, [`hmi:${id}`]: down}));
  };
  const loadExample = async (which: 'direct' | 'plc' | 'factory' = 'direct') => { const r = which === 'plc' ? examplePlcStartStop() : which === 'factory' ? exampleMiniFactory() : exampleDirectStart(); if (!r.ok) { api.setMessage(r.error); return; } const {filename, text} = exportProject(r.value); if (await api.importFile(new File([text], filename))) { setProjectOpen(false); stopSim(); log(`Ejemplo cargado: ${which === 'plc' ? 'marcha/paro con PLC' : which === 'factory' ? 'mini fábrica' : 'arranque directo'}`); } };
  const termLabel = (r: TerminalRef) => `${project.entities.find(e => e.id === r.entityId)?.label ?? r.entityId} · ${r.terminalId}`;
  const connect2 = (a: TerminalRef, b: TerminalRef) => {
    if (!guardEdit()) return false;
    const r = api.run(p => {
      const w = wire(p, a, b);
      if (!w.ok || !policy.blockInvalidWiring) return w;
      const made = w.value.connections[w.value.connections.length - 1], why = evaluate(w.value).reasons[made.id];
      return why?.length ? {ok: false as const, error: `Modo Aprendizaje: no se conectó. ${why.join(' ')}`} : w;
    });
    if (r.ok) { const made = r.value.connections[r.value.connections.length - 1]; log(`Cable ${termLabel(a)} → ${termLabel(b)} (${evaluate(r.value).status[made.id] === 'invalid' ? 'inválido' : 'sin verificar'})`); }
    return r.ok;
  };
  const onTerminal = (ref: TerminalRef) => {
    if (!pending) { setPending(ref); return; }
    if (refKey(pending) === refKey(ref)) { setPending(null); return; }
    connect2(pending, ref); setPending(null);
  };
  const chooseTool = (next: PlantTool) => {
    if ((next === 'move' || next === 'wire') && !guardEdit()) return;
    setTool(next);
    setPending(null);
    if (ui.view !== 'plant') patchUi({view: 'plant'});
  };
  const removeSelected = (id: string, confirm: boolean) => {
    if (!guardEdit()) return;
    const label = project.entities.find(e => e.id === id)?.label ?? id;
    const probe = removeEntity(project, id, {confirm});
    if (!probe.ok && probe.dependencies) { setPendingDelete(id); return; }
    const r = api.run(p => { const x = removeEntity(p, id, {confirm}); return x.ok ? {...x, value: withStatuses(x.value)} : x; });
    if (r.ok) { setPendingDelete(null); select([]); log(`Eliminado «${label}»${confirm ? ' con sus dependencias' : ''}`); }
  };

  const renderEntityRow = (e: Entity) => {
    const d = dependenciesOf(project, e.id), count = d.mounts.length + d.connections.length + d.bindings.length;
    return <li key={e.id}><button type="button" role="treeitem" aria-selected={ui.selection.includes(e.id)} onClick={() => select([e.id])}>
      <strong>{e.label}</strong><code>{e.id}</code>{count > 0 && <small title="Montajes, conexiones y asociaciones">{count} relación(es)</small>}</button></li>;
  };

  const panelBody = (id: PanelId): ReactNode => {
    if (id === 'library') return <PartsLibrary query={query} family={family} disabled={simulate} supported={supported} onQuery={setQuery} onFamily={setFamily} onAdd={addShape} />;
    if (id === 'structure') return <div className="ind-panel">
      <div className="ind-add"><input value={newName} placeholder="Nombre del componente" aria-label="Nombre del componente nuevo" onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addGeneric(); }} />
        <button type="button" onClick={addGeneric} disabled={simulate} title="Añade un componente genérico de prueba al modelo"><Plus size={15} /> Añadir</button></div>
      {project.entities.length === 0 ? <p className="ind-note">Aún no hay componentes. Abre Piezas para agregar equipos o añade aquí un bloque genérico.</p>
        : <ul className="ind-tree" role="tree" aria-label="Componentes">{project.entities.map(renderEntityRow)}</ul>}
    </div>;
    if (id === 'activity') {
      const act = activityFor(project), results = act ? evaluateActivity(project) : [], done = results.filter(r => r.ok).length, sub = project.lesson.submitted;
      const start = async (activityId: string, mode: EducationMode) => { const r = startActivity(activityId, mode); if (!r.ok) { api.setMessage(r.error); return; } const {filename, text} = exportProject(r.value); openActivity.current = true; if (await api.importFile(new File([text], filename))) { stopSim(); setManual(false); log(`Actividad iniciada: ${activityOf(activityId)?.title} (${MODE_LABEL[mode]})`); } };
      const download = () => { const url = URL.createObjectURL(new Blob(['\uFEFF' + reportMarkdown(project)], {type: 'text/markdown'})); const a = document.createElement('a'); a.href = url; a.download = 'informe-actividad.md'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
      return <div className="ind-panel">
        <p className="ind-note" data-mode-note={project.mode}><b>Modo {policy.label}.</b> {policy.description}</p>
        {act && <>
          <h4>{act.title}</h4><p className="ind-note">{act.summary}</p>
          {act.answers?.map(f => <label className="ind-field" key={f.id}><span>{f.label}</span><select value={project.lesson.answers[f.id] ?? ''} disabled={submitted} onChange={e => api.run(p => setAnswer(p, f.id, e.target.value))}><option value="">Elige una respuesta</option>{f.options(project).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>)}
          {policy.liveChecks && <p className="ind-progress" role="status" aria-label="Progreso">{done} de {results.length} pasos{done === results.length ? ' · ¡Actividad completa!' : ''}</p>}
          <ul className="ind-steps" aria-label="Pasos de la actividad">{results.map(r => {
            const show = policy.liveChecks || (policy.manualCheck && manual) || !!sub;
            const okNow = sub ? sub.results.find(x => x.id === r.id)?.ok : r.ok;
            return <li key={r.id} data-state={show ? (okNow ? 'ok' : 'todo') : 'hidden'}><span aria-hidden="true">{show ? (okNow ? '✓' : '✗') : '·'}</span><div><span>{r.text}</span>{policy.hints && !okNow && <details className="ind-item-info"><summary>Pista</summary><p className="ind-note">{r.hint}</p></details>}</div></li>; })}</ul>
          {policy.manualCheck && <button type="button" className="ind-primary" onClick={() => setManual(true)}>Comprobar ahora</button>}
          {policy.allowSubmit && !sub && <button type="button" className="ind-primary" onClick={() => { if (confirm('Al entregar se calcula el resultado y el proyecto queda bloqueado. ¿Entregar la actividad?')) { api.run(p => submit(p, new Date().toISOString())); log('Actividad entregada'); } }}>Entregar actividad</button>}
          {sub && <div className="ind-diag" role="region" aria-label="Resultado de la entrega"><p><b>Entregada: {sub.score} de {sub.total}</b></p>
            <div className="ind-actions"><button type="button" onClick={download}><Download size={14} /> Informe (.md)</button><button type="button" onClick={() => { api.run(reopen); log('Actividad reabierta'); }}>Reabrir</button></div></div>}
          <p className="ind-note">Las comprobaciones evalúan el montaje y el comportamiento simulado con piezas genéricas; no certifican nada.</p>
        </>}
        {project.mode !== 'test' && <ActivityEditor key={project.id} project={project} editable={!simulate} onChange={f => (guardEdit() ? api.run(f) : {ok: false, error: 'El proyecto está protegido.'})} onLog={log} />}
        <h4>{act ? 'Otras actividades' : 'Actividades'}</h4>
        <ul className="ind-activities" aria-label="Actividades disponibles">{ACTIVITIES.map(a => <li key={a.id}><div><strong>{a.title}</strong><small>{a.summary}</small><small>{a.skills.join(' · ')}</small></div>
          <div className="ind-actions"><button type="button" onClick={() => start(a.id, 'learning')} aria-label={`Iniciar ${a.title} en modo Aprendizaje`}>Aprender</button><button type="button" onClick={() => start(a.id, 'test')} aria-label={`Iniciar ${a.title} como Prueba`}>Prueba</button></div></li>)}</ul>
      </div>;
    }
    if (id === 'faults') {
      const test = !policy.autoDiagnosis, visible = project.faults.filter(f => !(policy.hideHiddenFaults && f.hidden)), hiddenCount = project.faults.length - visible.length;
      const targets = faultKind === 'wire-open' ? project.connections.map(c => ({id: c.id, text: `${termLabel(c.a)} → ${termLabel(c.b)}`}))
        : project.entities.filter(e => FAULT_TARGETS[faultKind]?.includes(e.definitionId)).map(e => ({id: e.id, text: e.label}));
      const diag = showDiag && sim && !test ? diagnose(project, inputs, prevSim.current) : null;
      const addIt = () => { const r = api.run(p => addFault(p, faultKind === 'wire-open' ? {kind: faultKind, connectionId: faultTarget, hidden: faultHidden} : {kind: faultKind, entityId: faultTarget, hidden: faultHidden})); if (r.ok) { setFaultTarget(''); log(`Falla inyectada${faultHidden ? ' (oculta)' : ''}`); } };
      return <div className="ind-panel">
        <p className="ind-note">Las fallas no cambian el diseño: la simulación las aplica y el diagnóstico las localiza. Se pueden inyectar también con la simulación en marcha.</p>
        <div className="ind-wire-form" role="group" aria-label="Nueva falla">
          <label className="ind-field"><span>Falla</span><select value={faultKind} onChange={e => { setFaultKind(e.target.value as FaultKind); setFaultTarget(''); }}>{FAULT_KINDS.map(k => <option key={k} value={k}>{FAULT_LABEL[k]}</option>)}</select></label>
          <p className="ind-note">{FAULT_HELP[faultKind]}</p>
          <label className="ind-field"><span>{faultKind === 'wire-open' ? 'Cable' : 'Componente'}</span><select value={faultTarget} onChange={e => setFaultTarget(e.target.value)}><option value="">Elige uno</option>{targets.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}</select></label>
          <label className="ind-check"><input type="checkbox" checked={faultHidden} onChange={e => setFaultHidden(e.target.checked)} /> Oculta al alumno (modo Prueba)</label>
          <button type="button" className="ind-primary" disabled={!faultTarget} onClick={addIt}><Wrench size={15} /> Inyectar falla</button>
        </div>
        <h4>Fallas aplicadas ({visible.length}{hiddenCount ? ` + ${hiddenCount} oculta(s)` : ''})</h4>
        {visible.length === 0 ? <p className="ind-note">{hiddenCount ? 'Hay fallas ocultas: descúbrelas midiendo.' : 'Sin fallas: el circuito se comporta como el diseño.'}</p>
          : <ul className="ind-wires" aria-label="Fallas aplicadas">{visible.map(f => <li key={f.id}><div className="ind-wire-main"><strong>{describeFault(project, f)}</strong>{f.hidden && <small>Oculta al alumno</small>}</div>
            <button type="button" aria-label={`Quitar la falla: ${describeFault(project, f)}`} onClick={() => { api.run(p => removeFault(p, f.id)); log('Falla quitada'); }}><Trash2 size={14} /></button></li>)}</ul>}
        {project.faults.length > 0 && <button type="button" className="ind-delete" onClick={() => { api.run(clearFaults); log('Fallas quitadas'); }}><Trash2 size={15} /> Quitar todas</button>}
        <h4>Diagnóstico</h4>
        {test ? <p className="ind-note">En modo Prueba el diagnóstico automático está desactivado: localiza la falla midiendo con el multímetro.</p>
          : <><button type="button" className="ind-primary" disabled={simStatus === 'stopped'} onClick={() => setShowDiag(v => !v)}>{showDiag ? 'Ocultar diagnóstico' : 'Diagnosticar'}</button>
            {simStatus === 'stopped' && <p className="ind-note">Ejecuta la simulación y opera el circuito: el diagnóstico compara lo que ocurre con lo que haría el diseño sano.</p>}</>}
        {diag && <div className="ind-diag" role="region" aria-label="Resultado del diagnóstico"><p><b>{diag.summary}</b></p>
          {diag.symptoms.length > 0 && <><h4>Síntomas</h4><ul>{diag.symptoms.map(s => <li key={s.entityId}>{s.text}</li>)}</ul></>}
          {diag.candidates.length > 0 && <><h4>Puntos sospechosos</h4><ul className="ind-wires">{diag.candidates.map(c => <li key={c.kind + c.id}><button type="button" className="ind-wire-main" onClick={() => c.kind === 'connection' ? setPickedConn(c.id) : select([c.id])}><strong>{c.label}</strong><small>{c.reason}</small></button></li>)}</ul></>}
          <p className="ind-note">Límite: solo localiza lo que el modelo simula (cables, contactos, bobina, piloto y bobinado). No diagnostica aislamiento, sobrecarga ni valores eléctricos.</p></div>}
      </div>;
    }
    if (id === 'instruments') {
      const operables = project.entities.filter(e => operableKind(e.definitionId));
      const states = project.entities.filter(e => ['contactor-3p', 'piloto', 'motor-3p', 'fuente-cc', 'plc-generico'].includes(e.definitionId));
      const terms = allTerminals(project), toRef = (v: string): TerminalRef | null => { const i = v.indexOf(':'); return i > 0 ? {entityId: v.slice(0, i), terminalId: v.slice(i + 1)} : null; };
      const ra = toRef(probeA), rb = toRef(probeB), reading = sim && ra && rb ? sim.measure(ra, rb, meterMode) : null;
      const opts = <>{terms.map(t => <option key={refKey(t)} value={refKey(t)}>{termLabel(t)}</option>)}</>;
      const STATE_TEXT: Record<string, [string, string]> = {'contactor-3p': ['Excitado', 'Sin excitar'], 'piloto': ['Encendido', 'Apagado'], 'motor-3p': ['Alimentado', 'Sin alimentar'], 'fuente-cc': ['Con salida', 'Sin salida'], 'plc-generico': ['Alimentado', 'Sin alimentar']};
      return <div className="ind-panel">
        <p className="ind-note" role="status" data-sim-state={simStatus}>{simStatus === 'stopped' ? 'Simulación detenida. Pulsa Ejecutar para energizar el circuito.' : simStatus === 'paused' ? 'Simulación en pausa: los mandos están congelados.' : 'Simulación en marcha. Opera los mandos aquí o pulsándolos en el escenario.'}</p>
        <h4>Mandos</h4>
        {operables.length === 0 ? <p className="ind-note">No hay interruptores ni pulsadores en el proyecto.</p> : <ul className="ind-ops" aria-label="Mandos">{operables.map(e => { const kind = operableKind(e.definitionId), on = !!inputs[e.id]; return <li key={e.id}>
          <button type="button" aria-pressed={on} disabled={simStatus !== 'running'}
            onClick={kind === 'breaker' || kind === 'trip' ? () => operate(e.id, true) : undefined}
            onPointerDown={kind === 'pushbutton' ? () => operate(e.id, true) : undefined} onPointerUp={kind === 'pushbutton' ? () => operate(e.id, false) : undefined} onPointerLeave={kind === 'pushbutton' && on ? () => operate(e.id, false) : undefined}
            onKeyDown={kind === 'pushbutton' ? ev => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) { ev.preventDefault(); operate(e.id, true); } } : undefined}
            onKeyUp={kind === 'pushbutton' ? ev => { if (ev.key === ' ' || ev.key === 'Enter') operate(e.id, false); } : undefined}>
            <strong>{e.label}</strong><small>{kind === 'breaker' ? (on ? 'Cerrado' : 'Abierto') : kind === 'trip' ? (on ? 'Disparado' : 'En servicio') : (on ? 'Pulsado' : 'Suelto')} · {shapeOf(e.definitionId).name}</small></button></li>; })}</ul>}
        <h4>Estado</h4>
        {states.length === 0 ? <p className="ind-note">Sin contactores, pilotos, motores ni fuentes.</p> : <ul className="ind-states" aria-label="Estado de los equipos">{states.map(e => { const t = STATE_TEXT[e.definitionId]; const on = !!sim?.energized[e.id]; return <li key={e.id} data-on={on}><span>{e.label}</span><b>{sim ? t[on ? 0 : 1] : '—'}</b></li>; })}</ul>}
        {policy.showIssues && sim && sim.warnings.length > 0 && <div className="ind-issues" role="alert"><h4>Avisos de la simulación</h4><ul>{sim.warnings.map((w, k) => <li key={k}>{w}</li>)}</ul></div>}
        <h4>Multímetro</h4>
        <div className="ind-wire-form" role="group" aria-label="Multímetro">
          <label className="ind-field"><span>Función</span><select value={meterMode} onChange={e => setMeterMode(e.target.value as 'continuity' | 'voltage')}><option value="voltage">Tensión</option><option value="continuity">Continuidad</option></select></label>
          <label className="ind-field"><span>Sonda roja</span><select value={probeA} onChange={e => setProbeA(e.target.value)}><option value="">Elige un terminal</option>{opts}</select></label>
          <label className="ind-field"><span>Sonda negra</span><select value={probeB} onChange={e => setProbeB(e.target.value)}><option value="">Elige un terminal</option>{opts}</select></label>
          <output className="ind-reading" aria-live="polite" aria-label="Lectura del multímetro">{!sim ? 'Ejecuta la simulación para medir.' : !ra || !rb ? 'Elige las dos sondas.' : reading?.text}</output>
        </div>
        <details className="ind-item-info"><summary>Qué simula y qué no</summary><ul className="ind-assume">{SIM_ASSUMPTIONS.map(a => <li key={a}>{a}</li>)}<li>Las tensiones que se muestran son las que configuras en la fuente; no son de un equipo real y no se calculan corrientes ni caídas de tensión.</li></ul></details>
      </div>;
    }
    if (id === 'connections') {
      const terms = allTerminals(project), name = (r: TerminalRef) => `${project.entities.find(e => e.id === r.entityId)?.label ?? r.entityId} · ${terminalDef(project, r)?.label ?? r.terminalId}`;
      const parse = (v: string): TerminalRef | null => { const i = v.indexOf(':'); return i > 0 ? {entityId: v.slice(0, i), terminalId: v.slice(i + 1)} : null; };
      const a = parse(endA), b = parse(endB);
      const CHIP: Record<ConnectionStatus, string> = {valid: 'Válido', invalid: 'Inválido', unverified: 'Sin verificar'};
      const options = <>{terms.map(t => <option key={refKey(t)} value={refKey(t)}>{name(t)}</option>)}</>;
      return <div className="ind-panel">
        <div className="ind-wire-form" role="group" aria-label="Nueva conexión">
          <label className="ind-field"><span>Desde</span><select value={endA} onChange={e => setEndA(e.target.value)}><option value="">Elige un terminal</option>{options}</select></label>
          <label className="ind-field"><span>Hasta</span><select value={endB} onChange={e => setEndB(e.target.value)}><option value="">Elige un terminal</option>{options}</select></label>
          <button type="button" className="ind-primary" disabled={simulate || !a || !b} onClick={() => { if (a && b && connect2(a, b)) { setEndA(''); setEndB(''); } }}><Cable size={15} /> Conectar</button>
        </div>
        {terms.length === 0 && <p className="ind-note">Coloca piezas con terminales (contactor, PLC, fuente…) para poder cablearlas.</p>}
        <p className="ind-note">También puedes pulsar «Cablear» en el dock y tocar dos terminales en el escenario. Límite didáctico: {MAX_WIRES_PER_TERMINAL} cables por terminal.</p>
        <details className="ind-item-info"><summary>Colores de cable y punteras</summary>
          <ul className="ind-legend" aria-label="Colores de cable">{Object.values(WIRE_COLORS).map(w => <li key={w.name}><i className="ind-swatch" style={{background: w.color}} aria-hidden="true" /> {w.name}</li>)}</ul>
          <p className="ind-note">Punteras de ejemplo: 2,5 mm² azul (fuerza), 0,75 mm² gris (mando y 24 V), 0,5 mm² blanco (señal). {WIRE_COLOR_NOTE}</p></details>
        <h4>Conexiones ({project.connections.length})</h4>
        {project.connections.length > 0 && <div className="ind-wire-tools" role="group" aria-label="Organizar cables">
          <button type="button" disabled={simulate || !project.connections.some(c => c.route?.length)} onClick={() => { if (guardEdit()) { api.run(p => tidyWires(p)); log('Cables ordenados: rutas manuales borradas'); } }} title="Borra las rutas manuales y reparte los cables en carriles">Ordenar todos</button>
          <button type="button" disabled={simulate || !pickedConn || !project.connections.find(c => c.id === pickedConn)?.route?.length} onClick={() => { if (pickedConn && guardEdit()) { api.run(p => routeWire(p, pickedConn, [])); log('Cable con ruta automática'); } }} title="Devuelve el cable elegido a la ruta automática">Ruta automática</button>
        </div>}
        {pickedConn && !simulate && <p className="ind-note">Cable elegido. Activa «Mover pieza» para arrastrar los puntos azules, añadir uno desde un punto claro o quitar uno con doble clic.</p>}
        {project.connections.length === 0 ? <p className="ind-note">Aún no hay cables.</p>
          : <ul className="ind-wires" aria-label="Conexiones">{project.connections.map(c => { const st = evaluation.status[c.id] ?? c.status, why = evaluation.reasons[c.id];
            return <li key={c.id} data-status={st} data-picked={pickedConn === c.id}><button type="button" className="ind-wire-main" onClick={() => setPickedConn(pickedConn === c.id ? null : c.id)} title="Resaltar en el escenario"><strong><i className="ind-swatch" style={{background: wireLook(project, c).color}} title={`${wireName(project, c)} · ${wireLook(project, c).name}`} aria-hidden="true" />{name(c.a)} → {name(c.b)}</strong><small><span className="ind-status" data-status={st}>{CHIP[st]}</span> {c.kind}{why && policy.showIssues ? ` · ${why.join(' ')}` : ''}</small></button>
              <button type="button" aria-label={`Desconectar ${name(c.a)} → ${name(c.b)}`} disabled={simulate} onClick={() => { if (guardEdit()) { api.run(p => unwire(p, c.id)); log(`Cable ${name(c.a)} → ${name(c.b)} desconectado`); } }}><Unlink size={14} /></button></li>; })}</ul>}
        {policy.showIssues && evaluation.issues.length > 0 && <div className="ind-issues" role="alert"><h4>Avisos ({evaluation.issues.length})</h4><ul>{evaluation.issues.map((i, k) => <li key={k} data-severity={i.severity}>{i.message}</li>)}</ul></div>}
        <h4>Redes ({evaluation.nets.length})</h4>
        {evaluation.nets.length === 0 ? <p className="ind-note">Las redes aparecen al conectar terminales.</p> : <ul className="ind-nets" aria-label="Redes">{evaluation.nets.map(n => <li key={n.id}><b>{n.id}</b> {n.terminals.map(name).join(' · ')}</li>)}</ul>}
        <p className="ind-note">Esta fase solo comprueba la topología (tierra, cortocircuitos entre polos, terminales que existen). No calcula tensiones ni corrientes y una conexión entre piezas genéricas queda «sin verificar».</p>
      </div>;
    }
    if (id === 'inspector') {
      if (!one) return <div className="ind-panel"><p className="ind-note">{selected.length > 1 ? `${selected.length} componentes seleccionados.` : 'Selecciona un componente para ver sus propiedades.'}</p></div>;
      const pose = project.poses[one.id] ?? {position: [0, 0, 0] as Vec3, rotation: [0, 0, 0] as Vec3};
      const d = dependenciesOf(project, one.id);
      const mountOf = parentMountOf(project, one.id), parentLabel = mountOf ? project.entities.find(e => e.id === mountOf.parent.entityId)?.label ?? '' : '';
      const kids = descendantsOf(project, one.id).length;
      const hasVoltage = one.definitionId === 'fuente-cc' || one.definitionId === 'red-3f';
      const axis = (i: 0 | 1 | 2) => (v: number) => { if (guardEdit()) api.run(p => moveEntity(p, one.id, {...pose, position: pose.position.map((x, k) => (k === i ? v : x)) as Vec3})); };
      return <div className="ind-panel">
        <label className="ind-field"><span>Nombre</span><input defaultValue={one.label} key={one.id + one.label} disabled={simulate} onBlur={e => { const v = e.target.value.trim(); if (v && v !== one.label && guardEdit()) api.run(p => renameEntity(p, one.id, v)); }} /></label>
        <div className="ind-part-identity"><img src={`/industria/components/${shapeOf(one.definitionId).id === 'desconocido' ? 'generico' : one.definitionId}.webp`} alt="" width={320} height={240} decoding="async" /><p className="ind-note" aria-label="Identidad del componente">{shapeOf(one.definitionId).name} · {STATUS_LABEL[shapeOf(one.definitionId).status]} · id estable <code>{one.id}</code></p></div>
        {shapeOf(one.definitionId).terminals && <details className="ind-item-info" data-terminals><summary>Terminales ({shapeOf(one.definitionId).terminals?.length})</summary><p className="ind-note">{shapeOf(one.definitionId).terminals?.map(t => t.label).join(' · ')}<br />{shapeOf(one.definitionId).terminalSource}</p></details>}
        <label className="ind-check"><input type="checkbox" checked={ui.magnet} disabled={simulate} onChange={e => patchUi({magnet: e.target.checked})} /> Ajustar piezas a la rejilla (5 cm)</label>
        <fieldset className="ind-pose" disabled={simulate || !!mountOf}><legend>Posición en la planta (m)</legend>
          <PoseField label="X" value={pose.position[0]} disabled={simulate} onCommit={axis(0)} /><PoseField label="Y" value={pose.position[1]} disabled={simulate} onCommit={axis(1)} /><PoseField label="Z" value={pose.position[2]} disabled={simulate || !!mountOf} onCommit={axis(2)} /></fieldset>
        <fieldset className="ind-pose" disabled={simulate || !!mountOf} aria-label="Giro"><legend>Giro (°)</legend>
          {(['X', 'Y', 'Z'] as const).map((name, i) => <PoseField key={name} label={`Giro ${name}`} value={rotationDegrees(pose.rotation)[i]} disabled={simulate || !!mountOf} onCommit={v => { if (guardEdit()) api.run(p => moveEntity(p, one.id, {...pose, rotation: pose.rotation.map((r, k) => (k === i ? (v * Math.PI) / 180 : r)) as Vec3})); }} />)}</fieldset>
        {one.definitionId === 'gabinete' && <label className="ind-field"><span>Puerta</span><select value={String(one.props.puerta ?? 'cerrada')} disabled={simulate} onChange={e => { if (guardEdit()) { setClosedCabinet(null); patchUi({interior: null}); api.run(p => setEntityProp(p, one.id, 'puerta', e.target.value)); } }}><option value="transparente">Transparente (ver el interior)</option><option value="cerrada">Cerrada</option><option value="abierta">Abierta (gira en su bisagra)</option></select></label>}
        {one.definitionId === 'sala-electrica' && <label className="ind-field"><span>Puerta</span><select value={String(one.props.puerta ?? 'cerrada')} disabled={simulate} onChange={e => { if (guardEdit()) api.run(p => setEntityProp(p, one.id, 'puerta', e.target.value)); }}><option value="cerrada">Cerrada</option><option value="abierta">Abierta (hacia fuera)</option></select></label>}
        {one.definitionId === 'gabinete' && (() => { const sw = doorSwing(project, one.id); if (!sw || !sw.blockers.length) return null; return <p className="ind-note" data-door-swing="choca" role="alert">La puerta chocaría al abrir con: {sw.blockers.map(b => project.entities.find(e => e.id === b)?.label ?? b).join(', ')}. Deja libre el barrido de la hoja.</p>; })()}
        {one.definitionId === 'gabinete' && (() => { const cl = frontClearance(project, one.id); if (!cl) return null; const names = cl.blockers.map(b => project.entities.find(e => e.id === b)?.label ?? b); return <p className="ind-note" data-clearance={cl.blockers.length ? 'ocupado' : 'libre'} role="status">{cl.blockers.length ? `Espacio libre frente al tablero ocupado por: ${names.join(', ')}.` : 'Espacio libre frente al tablero: despejado.'} Referencia de ejemplo: {String(CLEAR_DEPTH).replace('.', ',')} m de fondo, {String(CLEAR_MIN_WIDTH).replace('.', ',')} m de ancho y {String(CLEAR_HEIGHT).replace('.', ',')} m de altura (valores de otras normas, no contrastados con la norma chilena).</p>; })()}
        {hasVoltage && <PoseField label={one.definitionId === 'red-3f' ? 'Tensión fase–neutro configurada (V)' : 'Tensión de salida configurada (V)'} value={typeof one.props.voltage === 'number' ? one.props.voltage : 0} disabled={simulate} onCommit={v => { if (guardEdit()) api.run(p => setEntityProp(p, one.id, 'voltage', v > 0 ? v : null)); }} />}
        {mountOf ? <div className="ind-mount" data-mounted="true"><p className="ind-note">Montado en <b>{parentLabel}</b> ({mountOf.parent.anchorId} ← {mountOf.child.anchorId}, {mountOf.kind}). Soltar solo quita el montaje.</p>
          <button type="button" className="ind-delete" disabled={simulate} onClick={() => releaseMount(mountOf.id, one.label)}><Unlink size={15} /> Soltar</button></div>
          : <div className="ind-actions"><button type="button" onClick={rotateSelected} disabled={simulate} title="Gira la pieza 90° (tecla R)"><RotateCw size={15} /> Girar 90°</button>
            <span className="ind-note">Suelto{kids ? ` · ${kids} pieza(s) montada(s) encima` : ''}</span></div>}
        <p className="ind-note" aria-label="Relaciones del componente">Montajes {d.mounts.length} · Conexiones {d.connections.length} · Asociaciones {d.bindings.length} · Símbolos {d.symbols}</p>
        {one.locked && <p className="ind-note"><Lock size={13} /> Bloqueado</p>}
        {pendingDelete === one.id
          ? <div className="ind-confirm" role="alertdialog" aria-label="Confirmar eliminación"><p>«{one.label}» tiene {d.mounts.length} montaje(s), {d.connections.length} conexión(es), {d.bindings.length} asociación(es) y {d.symbols} símbolo(s). Al eliminarlo desaparecerán esos enlaces.</p>
            <div><button type="button" className="is-danger" onClick={() => removeSelected(one.id, true)}>Eliminar con sus dependencias</button><button type="button" onClick={() => setPendingDelete(null)}>Cancelar</button></div></div>
          : <button type="button" className="ind-delete" disabled={simulate} onClick={() => removeSelected(one.id, false)}><Trash2 size={15} /> Eliminar</button>}
      </div>;
    }
    if (id === 'cameras') return <div className="ind-panel">
      <h4>Vistas de cámara</h4>
      <div className="ind-chips">{PRESETS.map(p => <button type="button" key={p.name} onClick={() => setCamera({position: p.position, target: TARGET})}>{p.name}</button>)}</div>
      <h4>Vistas guardadas</h4>
      <div className="ind-add"><input value={cameraName} placeholder="Nombre de la vista" aria-label="Nombre de la vista" onChange={e => setCameraName(e.target.value)} />
        <button type="button" onClick={() => { const name = cameraName.trim() || `Vista ${ui.savedCameras.length + 1}`; patchUi(u => ({savedCameras: [...u.savedCameras.filter(c => c.name !== name), {name, ...u.camera}].slice(-20)})); setCameraName(''); log(`Vista «${name}» guardada`); }}>Guardar</button></div>
      {ui.savedCameras.length === 0 ? <p className="ind-note">Aún no hay vistas guardadas.</p>
        : <ul className="ind-saved">{ui.savedCameras.map(c => <li key={c.name}><button type="button" onClick={() => setCamera({position: c.position, target: c.target})}>{c.name}</button>
          <button type="button" aria-label={`Borrar la vista ${c.name}`} onClick={() => patchUi(u => ({savedCameras: u.savedCameras.filter(x => x.name !== c.name)}))}><X size={14} /></button></li>)}</ul>}
    </div>;
    return <div className="ind-panel">{events.length === 0 ? <p className="ind-note">Aquí aparecerán los cambios del proyecto y los eventos de simulación.</p> : <ol className="ind-events">{events.map((t, i) => <li key={i}>{t}</li>)}</ol>}</div>;
  };

  const locate = (id: string, view: ViewId) => {
    const entity = project.entities.find(e => e.id === id);
    if (!entity) return;
    select([id]);
    patchUi({view});
    if (view === 'plant') {
      const cabinet = entity.definitionId === 'gabinete' ? entity : containerOf(project, id, 'gabinete');
      const canOpen = cabinet && (cabinet.props.puerta === 'abierta' || !doorSwing(project, cabinet.id)?.blockers.length);
      if (cabinet && !canOpen) api.setMessage('La puerta no tiene espacio para abrir. Mueve el obstáculo antes de inspeccionar el gabinete.');
      setClosedCabinet(null);
      patchUi({cutaway: true, interior: canOpen ? cabinet.id : null});
      setCamera(inspectionCamera(project, cabinet ?? entity, true, innerWidth / innerHeight));
      setTool('orbit');
      setPending(null);
    }
  };

  const toggleCabinetDoor = (id: string) => {
    const physicalDoorOpen = project.entities.find(e => e.id === id)?.props.puerta === 'abierta';
    if (ui.interior === id || (physicalDoorOpen && closedCabinet !== id)) {
      setClosedCabinet(id);
      patchUi({interior: null});
      return;
    }
    locate(id, 'plant');
  };

  const viewBody = (view: ViewId): ReactNode => {
    if (view === 'board') return <BoardView project={project} selection={ui.selection} sim={sim} onSelect={select} onLocate={locate} pickedConn={pickedConn} onPick={setPickedConn} />;
    if (view === 'docs') return <DocsView project={project} showIssues={policy.showIssues} onLocate={locate} onView={view => patchUi({view})} />;
    if (view === 'diagram') return <DiagramView project={project} selection={ui.selection} sim={sim} simRunning={simStatus === 'running'} evaluation={evaluation} pickedConn={pickedConn} editable={!simulate}
      onSelect={select} onLocate={locate} onPick={setPickedConn} onMove={(id, at) => { if (guardEdit()) api.run(p => moveSymbol(p, id, at)); }} onMovePage={(id, page) => { if (guardEdit() && api.run(p => moveToPage(p, id, page)).ok) log(`Símbolo movido a la hoja ${page}`); }} onArrange={() => { if (guardEdit() && api.run(arrangeAll).ok) log('Símbolos ordenados'); }} onOperate={operate} />;
    if (view === 'plc') return <PlcView project={project} selection={ui.selection} sim={sim} editable={!simulate} showIssues={policy.showIssues} onSimulate={runSim} onLocate={locate} onChange={f => (guardEdit() ? api.run(f) : {ok: false, error: 'La estructura está protegida.'})} />;
    if (view === 'hmi') return <HmiView key={project.id} project={project} sim={sim} simRunning={simStatus === 'running'} inputs={inputs} editable={!simulate} onChange={f => (guardEdit() ? api.run(f) : {ok: false, error: 'La estructura está protegida.'})} onWrite={writeHmi} />;
    return null;
  };
  /** Cada panel de la derecha conserva el escalón que se le dio al abrirlo (el primero libre), para que no salten al abrir o cerrar otros. */
  const panelSlots = useRef<Record<string, number>>({});
  const panelSlot = (id: string): number => {
    const open = PANEL_IDS.filter(x => x !== 'library' && ui.panels[x]);
    for (const k of Object.keys(panelSlots.current)) if (!open.includes(k as PanelId)) delete panelSlots.current[k];
    for (const x of open) if (panelSlots.current[x] === undefined) { const used = new Set(Object.values(panelSlots.current)); let n = 0; while (used.has(n)) n++; panelSlots.current[x] = n; }
    return panelSlots.current[id] ?? 0;
  };

  const rooms = project.entities.filter(e => e.definitionId === 'sala-electrica');
  const cabinets = project.entities.filter(e => e.definitionId === 'gabinete');
  const cabinet = cabinets.find(e => e.id === one?.id)
    ?? (one && containerOf(project, one.id, 'gabinete'))
    ?? (one?.definitionId === 'sala-electrica' ? cabinets.find(e => containerOf(project, e.id, 'sala-electrica')?.id === one.id) : undefined)
    ?? cabinets.find(e => e.id === ui.interior)
    ?? cabinets[0];
  const room = rooms.find(e => e.id === one?.id) ?? (cabinet && containerOf(project, cabinet.id, 'sala-electrica')) ?? rooms[0];
  const crumbs = ui.path;
  return <div className="rb-app ind-app" data-mode={ui.operation} data-ready={api.ready} data-view={ui.view} data-sound={ui.sound ? 'on' : 'off'} data-sound-events={soundCount} data-left-panels={ui.panels.library} data-tool={tool} data-testid="industria-app">
    <header className="compact-bar rb-bar ind-topbar" aria-label="Industria">
      <div className="ind-project-bar">
        <a href="/" aria-label="Inicio" title="Volver al inicio"><Home size={19} /></a>
        <button type="button" className="rb-name" aria-label="Opciones del proyecto" aria-haspopup="dialog" title={project.name} onClick={() => { if (!restoreWindowTab('industria:project')) setProjectOpen(true); }}>
          <span>
            <strong>{project.name}</strong>
            <small role="status">{!api.ready ? 'Abriendo…' : api.storageBlocked ? 'Guardado desactivado' : api.saved ? <><Check size={11} /> Guardado</> : 'Guardando…'}</small>
          </span>
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
      <div className="ind-session-bar">
        <div className="rb-mode" role="group" aria-label="Modo de trabajo">
          <button type="button" aria-pressed={!simulate} onClick={() => { stopSim(); setTool('orbit'); setPending(null); patchUi({operation: 'build'}); }}><Hammer size={15} /><span>Construir</span></button>
          <button type="button" aria-pressed={simulate} onClick={() => { setTool(simStatus === 'running' ? 'operate' : 'orbit'); setPending(null); patchUi({operation: 'simulate'}); }}><Eye size={15} /><span>Simular</span></button>
        </div>
        <div className="rb-sim" role="group" aria-label="Controles de simulación">
          <button type="button" className="rb-run" aria-label="Ejecutar" title="Ejecutar la simulación lógica" disabled={simStatus === 'running'} onClick={runSim}><Play size={16} /><span>{simStatus === 'paused' ? 'Reanudar' : 'Ejecutar'}</span></button>
          <button type="button" aria-label="Pausar" title="Pausar" disabled={simStatus !== 'running'} onClick={pauseSim}><Pause size={15} /></button>
          <button type="button" aria-label="Detener" title="Detener" disabled={simStatus === 'stopped'} onClick={stopSim}><Square size={14} /></button>
          <span className="rb-sim-chip" role="status" data-sim={simStatus}>{simStatus === 'running' ? 'En marcha' : simStatus === 'paused' ? 'En pausa' : 'Detenida'}</span>
        </div>
      </div>
      <div className="ind-history-bar" role="group" aria-label="Edición y audio">
        <button type="button" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!api.canUndo} onClick={api.undo}><Undo2 size={17} /></button>
        <button type="button" aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" disabled={!api.canRedo} onClick={api.redo}><Redo2 size={17} /></button>
        <button type="button" aria-label="Sonido" aria-pressed={ui.sound} title={ui.sound ? 'Apagar el sonido' : 'Activar el sonido'} onClick={toggleSound}>{ui.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
      </div>
    </header>

    <main className="rb-stage" aria-label="Escenario industrial">
      {ui.view === 'plant' && (supported
        ? <ErrorBoundary label="Escenario 3D" resetKey={project.id} onRetry={() => location.reload()}><Suspense fallback={<div className="ind-loading" role="status">Abriendo el escenario…</div>}>
          <IndustriaCanvas key={glKey} project={project} selection={ui.selection} camera={ui.camera} cameraNonce={cameraNonce} proc={simStatus === 'stopped' ? null : proc} editable={!simulate} cutaway={ui.cutaway} interior={ui.interior} closedCabinet={closedCabinet} uncoverDucts={uncoverDucts} onCabinetDoor={toggleCabinetDoor} magnet={ui.magnet} moveParts={!simulate && tool === 'move'} panCamera={tool === 'pan'} operateParts={tool === 'operate'} wiring={wiring} pending={pending} evaluation={evaluation} sim={sim} simRunning={simStatus === 'running'} onOperate={operate} onBlockedDrag={id => api.setMessage(`«${project.entities.find(e => e.id === id)?.label ?? id}» está montada y no se arrastra: suéltala en Propiedades (botón Soltar) o mueve el soporte al que está unida.`)} highlight={highlightIds} editCable={tool === 'move' ? pickedConn : null} onRoute={(id, interior) => { if (guardEdit()) { api.run(p => routeWire(p, id, interior)); log(interior.length ? 'Cable reubicado' : 'Cable con ruta automática'); } }} onTerminal={onTerminal} onSelect={select} onDrop={onDrop} onCameraRest={camera => patchUi({camera})} onContextLost={() => setGlKey(k => k + 1)} />
        </Suspense></ErrorBoundary>
        : <div className="rb-gl-error" role="alert"><strong>Este dispositivo no puede mostrar gráficos 3D</strong><p>Industria necesita WebGL. Prueba con otro navegador o activa la aceleración por hardware.</p><button type="button" onClick={() => setGlKey(k => k + 1)}>Reintentar</button></div>)}
      {ui.view !== 'plant' && <ErrorBoundary label={VIEWS.find(v => v.id === ui.view)?.label ?? 'Vista'} resetKey={project.id + ui.view}>{viewBody(ui.view)}</ErrorBoundary>}
      <div className="rb-workspace-controls rb-canvas-overlay">
        <div className="rb-camera-pill ind-views" role="group" aria-label="Vistas del proyecto">
          {VIEWS.map(v => { const Icon = VIEW_ICONS[v.id]; return <button type="button" key={v.id} aria-pressed={ui.view === v.id} title={VIEW_HINT[v.id]} onClick={() => patchUi({view: v.id})}><Icon size={16} aria-hidden="true" /><span>{v.label}</span></button>; })}
        </div>
        <nav className="ind-path" data-depth={crumbs.length} aria-label="Ruta de navegación">{crumbs.map((c, i) => <span key={i}>{i > 0 && <ChevronRight size={14} aria-hidden="true" />}{i === 0 ? <button type="button" onClick={() => select([])}>{c}</button> : <b aria-current="location">{c}</b>}</span>)}</nav>
      </div>
      {ui.view === 'plant' && (rooms.length > 0 || cabinets.length > 0) && <div className="ind-inspection rb-canvas-overlay" role="group" aria-label="Inspección de planta">
        <button type="button" onClick={() => { select([]); patchUi({interior: null}); setCamera(overviewCamera(project)); }}>Nave</button>
        {room && <button type="button" onClick={() => { select([room.id]); patchUi({cutaway: true, interior: null}); setCamera(inspectionCamera(project, room, false, innerWidth / innerHeight)); }}>Sala eléctrica</button>}
        {cabinets.length > 1 && <select aria-label="Gabinete a inspeccionar" value={cabinet?.id ?? ''} onChange={event => locate(event.target.value, 'plant')}>{cabinets.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}</select>}
        {cabinet && <button type="button" aria-pressed={ui.interior === cabinet.id} onClick={() => ui.interior === cabinet.id ? toggleCabinetDoor(cabinet.id) : locate(cabinet.id, 'plant')}>Interior del gabinete</button>}
        {ui.interior && <button type="button" aria-pressed={uncoverDucts} onClick={() => setUncoverDucts(v => !v)}>Ver cables en canaletas</button>}
        <button type="button" aria-pressed={ui.cutaway} onClick={() => patchUi(u => ({cutaway: !u.cutaway, interior: u.cutaway ? null : u.interior}))}>Corte automático</button>
      </div>}
      {wiring && <div className="ind-sim-note ind-wire-note rb-canvas-overlay" role="status">{pending ? `Desde ${termLabel(pending)}: toca el terminal de destino (Esc cancela)` : 'Cablear: toca un terminal de origen'}{coarsePointer ? ' · Con el dedo, acerca la cámara o usa el panel Conexiones' : ''}</div>}
      {simulate && <div className="ind-sim-note rb-canvas-overlay" role="status">{submitted ? 'Actividad entregada: el proyecto está bloqueado. Reábrela desde Actividad para editar.' : simStatus === 'running' ? 'Simulación en marcha. Usa «Operar» para pulsar los mandos.' : 'Simulación: la estructura está protegida. Vuelve a Construir para editar.'}</div>}
      {ui.view === 'plant' && project.entities.length === 0 && api.ready && <section className="rb-empty rb-canvas-overlay" aria-label="Empezar en Industria">
        <div className="rb-empty-symbol" aria-hidden="true"><Boxes size={25} /></div>
        <span className="rb-empty-eyebrow">MODO · INDUSTRIA</span>
        <strong>Tu instalación empieza aquí</strong>
        <p>Agrega un equipo desde Piezas. Activa «Mover pieza» para arrastrarlo hasta un anclaje. Todas son genéricas y sin datos de fabricante.</p>
        <ol className="ind-steps ind-start-steps" aria-label="Pasos"><li><b>1</b> Agrega piezas</li><li><b>2</b> Móntalas en su riel o losa</li><li><b>3</b> Cablea los terminales</li><li><b>4</b> Ejecuta y opera</li></ol>
        <div className="rb-start-options"><button type="button" onClick={() => patchUi(u => ({panels: {...u.panels, structure: true}}))}><ListTree size={21} /><span><b>Abrir Estructura</b><small>Revisa y organiza tus componentes</small></span><span aria-hidden="true">→</span></button>
          <button type="button" className="rb-start-primary" onClick={() => loadExample('factory')}><Factory size={21} /><span><b>Ver una línea de producción</b><small>Carga el ejemplo ya montado y cableado</small></span><span aria-hidden="true">→</span></button></div>
      </section>}
    </main>

    <nav className="tool-dock rb-dock ind-dock" aria-label="Herramientas">
      <div className="ind-tool-strip" role="group" aria-label="Herramientas de la planta 3D">
        <span className="ind-strip-label" aria-hidden="true">Planta 3D</span>
        <button type="button" aria-pressed={tool === 'orbit' && ui.view === 'plant'} title="Gira la vista alrededor de la planta" onClick={() => chooseTool('orbit')}><Orbit size={18} /><span>Orbitar</span></button>
        <button type="button" aria-pressed={tool === 'pan' && ui.view === 'plant'} title="Desplaza la cámara de lado o en altura" onClick={() => chooseTool('pan')}><Hand size={18} /><span>Desplazar</span></button>
        {simulate
          ? <button type="button" aria-pressed={tool === 'operate' && ui.view === 'plant'} disabled={simStatus !== 'running'} title="Acciona interruptores y pulsadores en la planta" onClick={() => chooseTool('operate')}><MousePointer2 size={18} /><span>Operar</span></button>
          : <><button type="button" aria-pressed={tool === 'move' && ui.view === 'plant'} title="Arrastra una pieza; con Mayús puedes subirla o bajarla" onClick={() => chooseTool('move')}><Move size={18} /><span>Mover pieza</span></button>
            <button type="button" aria-pressed={wiring && ui.view === 'plant'} title="Une dos terminales en la planta" onClick={() => chooseTool(wiring ? 'orbit' : 'wire')}><Cable size={18} /><span>Cablear</span></button></>}
        <button type="button" title="Vuelve a la vista isométrica (F)" onClick={() => { patchUi({view: 'plant'}); setCamera({position: PRESETS[3].position, target: TARGET}); }}><Focus size={18} /><span>Encuadrar</span></button>
      </div>
      <div className="ind-panel-strip" role="group" aria-label="Ventanas de trabajo" tabIndex={0}>
        <span className="ind-strip-label" aria-hidden="true">Ventanas</span>
        {PANEL_ORDER.map(id => { const {title, Icon, eyebrow} = PANEL_LABEL[id]; return <button key={id} type="button" aria-label={title} title={eyebrow} aria-pressed={ui.panels[id]} onClick={() => togglePanel(id)}><Icon size={17} /><span>{title}</span></button>; })}
      </div>
      {ui.view === 'plant' && <p className="ind-tool-help" aria-live="polite">{
        tool === 'move' ? 'Arrastra la pieza. Con Mayús puedes subirla o bajarla.'
          : tool === 'wire' ? 'Pulsa Esc para volver a orbitar.'
          : tool === 'operate' ? 'Pulsa los mandos de la planta.'
          : cabinet && tool === 'orbit' ? 'Pulsa la puerta del gabinete para abrirla o cerrarla.'
          : `${tool === 'pan' ? 'Arrastra para desplazar la vista.' : 'Arrastra para girar alrededor de la planta.'} ${coarsePointer ? 'Pellizca para acercar.' : 'Rueda para acercar.'}`
      }</p>}
    </nav>

    {PANEL_IDS.map(id => { const slot = id === 'library' ? 0 : panelSlot(id);
      // Los paneles de la derecha se escalonan para que cada título quede visible y ninguno tape por completo a otro.
      return ui.panels[id] && <FloatingWindow key={id} passive scope=".rb-app" storageId={`industria:${id}`} title={PANEL_LABEL[id].title} eyebrow={PANEL_LABEL[id].eyebrow} width={id === 'console' ? 420 : id === 'library' ? 354 : 340}
        side={id === 'library' ? 'left' : 'right'} cascade={46 * slot} onClose={() => patchUi(u => ({panels: {...u.panels, [id]: false}}))} closeLabel={`Cerrar ${PANEL_LABEL[id].title}`} className={`rb-window ind-window ind-window-${id} ind-slot-${Math.min(slot, 6)}`}><ErrorBoundary label={PANEL_LABEL[id].title} resetKey={project.id}>{panelBody(id)}</ErrorBoundary></FloatingWindow>; })}

    {projectOpen && <FloatingWindow passive scope=".rb-app" storageId="industria:project" title="Proyecto" eyebrow="Archivos y ejemplos" width={400} side="center" onClose={() => setProjectOpen(false)} closeLabel="Cerrar Proyecto" className="rb-window ind-window ind-window-project">
      <div className="ind-panel">
        <label className="ind-field"><span>Nombre</span><input defaultValue={project.name} key={project.id} maxLength={80} onBlur={e => { const v = e.target.value.trim(); if (v && v !== project.name) api.rename(v); }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>
        <label className="ind-field"><span>Modo educativo</span><select value={project.mode} onChange={e => { const next = e.target.value as EducationMode; if (project.mode === 'test' && next !== 'test' && !confirm('Salir del modo Prueba muestra los avisos, las pistas y las fallas ocultas. ¿Continuar?')) return; api.run(p => setMode(p, next)); log(`Modo: ${MODE_LABEL[next]}`); }}>{EDUCATION_MODES.map(m => <option key={m} value={m}>{MODE_LABEL[m]}</option>)}</select></label>
        <div className="ind-actions">
          <button type="button" onClick={() => { if (api.create()) setProjectOpen(false); }}><Plus size={15} /> Nuevo</button>
          <button type="button" onClick={() => { if (api.duplicate()) setProjectOpen(false); }}><Copy size={15} /> Duplicar</button>
          <button type="button" onClick={api.exportActive}><Download size={15} /> Exportar</button>
          <button type="button" onClick={() => fileInput.current?.click()}><Upload size={15} /> Importar</button>
        </div>
        <h4>Ejemplos</h4>
        <div className="ind-examples">
          <button type="button" onClick={() => loadExample('direct')} title="Crea un proyecto nuevo con un arranque directo ya montado y cableado">Ejemplo: arranque directo</button>
          <button type="button" onClick={() => loadExample('plc')} title="Crea un proyecto nuevo con PLC, programa en escalera y pantalla de HMI">Ejemplo: marcha/paro con PLC</button>
          <button type="button" onClick={() => loadExample('factory')} title="Crea un proyecto nuevo con una planta: tablero con PLC, cinta con motor, robot, neumática, sensores, vallas y más">Ejemplo: mini fábrica</button>

          <input ref={fileInput} type="file" aria-label="Archivo de proyecto" accept=".json,application/json" hidden onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (f && await api.importFile(f)) setProjectOpen(false); }} />
        </div>
        <h4>Proyectos ({api.projects.length})</h4>
        <ul className="ind-projects">{api.projects.map(p => <li key={p.id}><button type="button" aria-pressed={p.id === project.id} onClick={() => { api.select(p.id); setProjectOpen(false); }}><strong>{p.name}</strong><small>{p.entities.length} componente(s)</small></button>
          <button type="button" aria-label={`Eliminar ${p.name}`} onClick={() => { if (confirm(`¿Eliminar «${p.name}»? Esta acción no se puede deshacer.`)) api.remove(p.id); }}><Trash2 size={14} /></button></li>)}</ul>
      </div>
    </FloatingWindow>}

    {api.message && <div className="rb-toast" role="status"><span>{api.message}</span><button type="button" aria-label="Cerrar aviso" onClick={() => api.setMessage('')}><X size={14} /></button></div>}
  </div>;
}
