import {useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react';
import {Boxes, Cable, Check, Code2, Copy, Eye, Focus, Footprints, Gauge, Group, Hammer, Hand, Home, Link, Link2Off, ListTree, Lock, LockOpen, Magnet, MousePointer2, MoreHorizontal, Move3d, Pause, Play, Redo2, Volume2, VolumeX, Rotate3d, SlidersHorizontal, Square, Terminal, Trash2, Undo2, Ungroup, X, Box, Bot} from 'lucide-react';
import {BuildCanvas, type CameraState, type CanvasHandle, type Ghost, type GhostWireView, type GizmoState, type PinMarker, type RoomView, type WireView} from './build/BuildCanvas';
import {createDeckWireRouter} from './build/wireRouting.ts';
import {findInterferences, findJoinCandidates, placementCheck} from './build/interference.ts';
import {assemblyGuide, canMoveAssembly, snapAssembly} from './build/assemblyGuide.ts';
import {assemblySteps, placeNextPart} from './build/assemblySteps.ts';
import {WiringGuide} from './guide/WiringGuide';
import {ProgramGuide} from './guide/ProgramGuide';
import {applyProgramStep, precompiledHex} from './guide/programCheck.ts';
import {programGuideForTemplate} from './guide/programGuides.ts';
import type {ProgramStep} from './guide/programTypes.ts';
import {applyStep, type Matched} from './guide/wireGuide.ts';
import type {GuideStep} from './guide/types.ts';
import {HoldToRelease} from './build/HoldToRelease';
import {ContextToolbar, type ContextAction} from './interaction/ContextToolbar';
import {ContextMenu, type MenuItem} from './interaction/ContextMenu';
import {escapeAction, type ToolId} from './interaction/tools.ts';
import {describeTarget, resolveShortcut, type ShortcutCommand} from './interaction/shortcuts.ts';
import {getDefinition} from './catalog/index.ts';
import {connectionLabel, connectionWarning, diagnose} from './circuit/diagnostics.ts';
import {measure, solve} from './circuit/solve.ts';
import {RemoteCompiler} from './mcu/compiler/remote.ts';
import {advice, artifactStatus, canRun, hashSource} from './mcu/compiler/state.ts';
import {readHexFile} from './mcu/compiler/hexImport.ts';
import type {CompileResult} from './mcu/types.ts';
import {useRobotSim} from './sim/useRobotSim.ts';
import {setLineTrack} from './sim/lineTrack.ts';
import {SPEEDS} from './sim/protocol.ts';
import {applyPoses} from './sim/poses.ts';
import {SKETCH_TEMPLATE, addObstacle, removeObstacle, setFriction, updateObstacle, firmwareOf, setFirmwareArtifact, setFirmwareSource, ensureFirmware, addPart, attach, centroid, connect, detach, disconnect, duplicateParts, expandGroups, moveParts, parentAttachment, pinWorld, removeParts, renamePart, setConnectionColor, setConnectionRoute, setGroup, setLocked, setPartProp, setPartTransform, type CommandError, type CommandResult} from './project/commands.ts';
import {DEG} from './project/math.ts';
import type {PinRef, RobotProject, Transform, Vec3} from './project/types.ts';
import {useRoboticsProjects} from './project/useRoboticsProjects';
import {buildTemplate, TEMPLATES, TEMPLATE_READY_ROBOT} from './project/templates.ts';
import {liveServos, movedObstacles} from './build/liveView.ts';
import {useRobotSound} from './audio/useRobotSound.ts';
import {useRoboticsWindows, WINDOW_IDS, type RoboticsWindowId} from './windows/useRoboticsWindows';
import {ProjectOptionsWindow, ProjectsWindow, RoboticsToolWindows, WINDOW_LABELS} from './windows/RoboticsWindows';
import {WIRE_COLORS, type BuildContext} from './windows/BuildWindows';
import '../styles/robotics.css';
import {ARM_ID} from './arm/model.ts';
import {useArmController} from './arm/useArmController';

const DOCK_ICONS: Record<RoboticsWindowId, typeof Boxes> = {arm: Bot, parts: Boxes, structure: ListTree, properties: SlidersHorizontal, scene: Box, code: Code2, console: Terminal};
const fmtM = (v: number) => v.toFixed(2).replace('.', ',');
const IDENTITY: Transform = {position: [0, 0, 0], rotation: [0, 0, 0, 1]};

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
function prefersReducedMotion() {
  const root = document.documentElement.classList;
  return !root.contains('modo-motion-full') && (matchMedia('(prefers-reduced-motion: reduce)').matches || root.contains('modo-reduced'));
}
/** Primer hueco libre alrededor del origen, en el suelo, para «Agregar» sin arrastrar. */
function freeSpot(p: RobotProject, definitionId: string): Vec3 {
  const h = (getDefinition(definitionId)?.dimensions[1] ?? 0.02) / 2;
  for (let r = 0; r < 12; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
    const pos: Vec3 = [dx * 0.12, h, dz * 0.12];
    if (placementCheck(p, definitionId, pos).overlaps.length === 0) return pos;
  }
  return [0, h, 0];
}

export default function RoboticsApp() {
  const projects = useRoboticsProjects();
  const windows = useRoboticsWindows();
  const debug = useMemo(() => new URLSearchParams(location.search).get('debug') === '1', []);
  const [tool, setTool] = useState<ToolId>('select');
  const [selection, setSelection] = useState<string[]>([]);
  const [preview, setPreview] = useState<RobotProject | null>(null);
  const [sceneSel, setSceneSel] = useState<string | null>(null);
  const [follow, setFollow] = useState(true);
  const [snapOn, setSnapOn] = useState(false);
  const [snapMm, setSnapMm] = useState(5);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [ghostNote, setGhostNote] = useState<{x: number; y: number; text: string; bad: boolean} | null>(null);
  const [gizmoKey, setGizmoKey] = useState(0);
  const [wireSel, setWireSel] = useState<string | null>(null);
  const [wireColor, setWireColor] = useState(WIRE_COLORS[0].value);
  const [pendingPin, setPendingPin] = useState<PinRef | null>(null);
  const [probe, setProbe] = useState<{a: PinRef | null; b: PinRef | null}>({a: null, b: null});
  const [highlight, setHighlight] = useState<ReadonlySet<string>>(new Set());
  const [flying, setFlying] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [wiringOpen, setWiringOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  /** Código del paso que se escribe con ayuda: se ve en gris en el editor de Programación. */
  const [codeGhost, setGhostSource] = useState('');
  const [stepsOpen, setStepsOpen] = useState(false);
  const [ghostCable, setGhostCable] = useState<{from: PinRef; to: PinRef; color: string} | null>(null);
  const [inspectIds, setInspectIds] = useState<string[]>([]);
  const [autoJoin, setAutoJoin] = useState(true);
  const [joinChoices, setJoinChoices] = useState(false);
  const sim = useRobotSim();
  const compiler = useMemo(() => new RemoteCompiler(), []);
  const [compilerAvailable, setCompilerAvailable] = useState<boolean | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{target: string; text: string} | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pinTip, setPinTip] = useState<{text: string; x: number; y: number} | null>(null);
  const [anchor, setAnchor] = useState<{x: number; y: number} | null>(null);
  const [menu, setMenu] = useState<{at: {x: number; y: number}; targetId: string | null} | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [glKey, setGlKey] = useState(0);
  const [notice, setNotice] = useState('');
  const handle = useRef<CanvasHandle>(null);
  const supported = useMemo(webglAvailable, [glKey]);
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const lowQuality = useMemo(() => (navigator.hardwareConcurrency || 4) <= 2 || ((navigator as Navigator & {deviceMemory?: number}).deviceMemory ?? 4) <= 2, []);
  const proj = projects.project;
  const hasArm = proj.parts.some(p => p.definitionId === ARM_ID);
  const armController = useArmController(proj, projects.update);
  useEffect(()=>{
    if(projects.ready&&hasArm)windows.open('arm');else windows.close('arm');
  },[proj.id,hasArm,projects.ready,windows.open,windows.close]);
  const boards = proj.parts.filter(p => p.definitionId === 'arduino-uno-r3').map(p => ({id: p.instanceId, label: p.label}));
  const fwTarget = targetId && boards.some(b => b.id === targetId) ? targetId : boards[0]?.id ?? null;
  const persistedSource = fwTarget ? firmwareOf(proj, fwTarget)?.source ?? SKETCH_TEMPLATE : '';
  const source = draft && draft.target === fwTarget ? draft.text : persistedSource;
  const firmware = fwTarget ? firmwareOf(proj, fwTarget) : undefined;
  const robotSound = useRobotSound(proj, sim.snapshot, sim.status);
  const framePhysics = sim.snapshot?.physics;
  const shown = useMemo(() => preview ?? (hasArm ? armController.project : framePhysics ? applyPoses(proj, framePhysics.poses) : proj), [preview, proj, framePhysics, hasArm, armController.project]);
  const mode = proj.workspace.mode ?? 'build';
  const reference = useMemo(() => proj.workspace.assemblyTemplate ? buildTemplate(proj.workspace.assemblyTemplate) : null, [proj.workspace.assemblyTemplate]);
  const guide = useMemo(() => reference ? assemblyGuide(preview ?? proj, reference) : null, [preview, proj.parts, proj.attachments, reference]);
  const aSteps = useMemo(() => reference && guide ? assemblySteps(preview ?? proj, reference, guide) : null, [guide, reference]);
  const selected = proj.parts.filter(x => selection.includes(x.instanceId));
  // Las interferencias son del montaje (no de las poses que va dando la física): calcularlas 30 veces por segundo sería trabajo perdido.
  const editing = preview ?? proj;
  const interfering = useMemo(() => (sim.status === 'stopped' ? new Set(findInterferences(editing).flat()) : new Set<string>()), [editing, sim.status === 'stopped']);
  const candidates = useMemo(() => (selection.length ? findJoinCandidates(proj, selection) : []), [proj.parts, proj.attachments, selection]);
  const solution = useMemo(() => solve(proj), [proj.parts, proj.connections]);
  const diagnostics = useMemo(() => diagnose(proj, solution), [proj.parts, proj.connections, solution]);
  const wiring = tool === 'wire' || tool === 'measure';
  const pinList = useMemo<PinMarker[]>(() => (wiring || highlight.size ? shown.parts.flatMap(part => (getDefinition(part.definitionId)?.pins ?? []).map(pin => ({ref: {instanceId: part.instanceId, pinId: pin.id}, pos: pinWorld(shown, {instanceId: part.instanceId, pinId: pin.id})!, role: pin.role, label: `${part.label} · ${pin.label ?? pin.id}`, connected: shown.connections.some(c => (c.a.instanceId === part.instanceId && c.a.pinId === pin.id) || (c.b.instanceId === part.instanceId && c.b.pinId === pin.id))}))) : []), [shown.parts, shown.connections, wiring, highlight]);
  const ghostWire = useMemo<GhostWireView | null>(() => {
    if (!ghostCable || !wiringOpen) return null;
    const a = pinWorld(shown, ghostCable.from), b = pinWorld(shown, ghostCable.to);
    if (!a || !b) return null;
    const route = createDeckWireRouter(shown.parts)?.(a, b) ?? [];
    return {points: [a, ...route, b], color: ghostCable.color};
  }, [ghostCable, wiringOpen, shown.parts]);
  const wireViews = useMemo<WireView[]>(() => {
    const deckRoute = createDeckWireRouter(shown.parts);
    const definitions = new Map(shown.parts.map(p => [p.instanceId, p.definitionId]));
    const header = (ref: PinRef) => {
      const id = definitions.get(ref.instanceId);
      return ['arduino-uno-r3', 'hc-sr04', 'breadboard-400', 'tcrt5000-module', 'servo-sg90', 'oled-ssd1306', 'regulator-5v'].includes(id ?? '') || (id === 'l298n-module' && /^(ENA|ENB|IN[1-4])$/.test(ref.pinId));
    };
    return shown.connections.flatMap(c => {
      const a = pinWorld(shown, c.a), b = pinWorld(shown, c.b);
      const route = c.route?.length ? c.route : a && b ? deckRoute?.(a, b) ?? [] : [];
      return a && b ? [{id: c.id, color: c.color, connectorEnds: [header(c.a), header(c.b)] as [boolean, boolean], points: [a, ...route, b], selected: c.id === wireSel}] : [];
    });
  }, [shown.parts, shown.connections, wireSel]);
  const posOf = (r: PinRef | null) => (r ? pinWorld(shown, r) ?? null : null);
  const live = useRef({tool, selection, menu, proj, snapOn, snapMm, candidates, pendingPin, probe, wireColor, wireSel, solution, flying, reference, autoJoin});
  live.current = {tool, selection, menu, proj, snapOn, snapMm, candidates, pendingPin, probe, wireColor, wireSel, solution, flying, reference, autoJoin};

  // La selección nunca apunta a piezas que ya no existen (deshacer, borrar, importar).
  useEffect(() => { setSelection(s => (s.every(id => proj.parts.some(x => x.instanceId === id)) ? s : s.filter(id => proj.parts.some(x => x.instanceId === id)))); }, [proj.parts]);
  useEffect(() => { setGizmoKey(k => k + 1); setPreview(null); }, [proj.parts, selection.join('|')]);
  useEffect(() => { setInspectIds([]); setSelection([]); setGuideOpen(false); setJoinChoices(false); }, [proj.id]);
  useEffect(() => { setJoinChoices(false); }, [selection.join('|')]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (projects.ready && !proj.workspace.welcomeDismissed && (proj.parts.length > 0 || windows.state.parts.open)) {
      projects.update(p => ({...p, workspace: {...p.workspace, welcomeDismissed: true}}), {history: false, touch: false});
    }
  }, [projects.ready, proj.id, proj.parts.length, proj.workspace.welcomeDismissed, windows.state.parts.open]);
  useEffect(() => { setPendingPin(null); setProbe({a: null, b: null}); setPinTip(null); }, [tool]);
  useEffect(() => { setWireSel(s => (s && proj.connections.some(c => c.id === s) ? s : null)); }, [proj.connections]);
  useEffect(() => { if (selection.length) setWireSel(null); }, [selection.join('|')]);
  // Precalienta (en reposo) lo que la primera ejecución necesitaría: se arranca un worker de prueba y se descarta, y se carga el editor. Así, tras una
  // visita, ambos ya están en la caché del service worker y un proyecto compilado se puede ejecutar sin conexión.
  useEffect(() => {
    const t = setTimeout(() => {
      try { const w = new Worker(new URL('./sim/sim.worker.ts', import.meta.url), {type: 'module'}); w.onmessage = e => { if (e.data?.t === 'ready') w.postMessage({t: 'warm'}); else w.terminate(); }; w.onerror = () => w.terminate(); setTimeout(() => w.terminate(), 12000); } catch { /* sin worker: no hay nada que precalentar */ }
      void import('./windows/CodeEditor').catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  // ¿Hay servicio de compilación? (solo en el servidor de desarrollo local; en el sitio publicado no, y se ofrece importar un .hex)
  // El servicio de compilación solo existe en el servidor de desarrollo (o en un build con PUBLIC_ROBOTICA_COMPILER=1, cuando se apruebe alojarlo):
  // en el sitio publicado ni se consulta, para no generar peticiones 404 en cada visita.
  const compilerEnabled = import.meta.env.DEV || import.meta.env.PUBLIC_ROBOTICA_COMPILER === '1';
  useEffect(() => {
    if (!compilerEnabled) { setCompilerAvailable(false); return; }
    let alive = true;
    const check = () => { void compiler.available().then(v => { if (alive) setCompilerAvailable(v); }); };
    check(); const timer = setInterval(check, 20000); addEventListener('online', check); addEventListener('offline', check);
    return () => { alive = false; clearInterval(timer); removeEventListener('online', check); removeEventListener('offline', check); };
  }, [compiler, compilerEnabled]);
  // La placa de destino tiene siempre un programa (plantilla) en cuanto se abre la ventana Programación
  useEffect(() => { if (fwTarget && windows.state.code.open && !firmwareOf(proj, fwTarget)) projects.update(p => ensureFirmware(p, fwTarget), {history: false, touch: false}); }, [fwTarget, windows.state.code.open, proj.firmware]);
  // Cambiar las piezas o los cables mientras corre el programa invalida lo simulado: se detiene con aviso
  useEffect(() => { if (sim.status !== 'stopped') sim.stop('El proyecto cambió: la simulación se detuvo. Pulsa ▶ para ejecutarla de nuevo.'); }, [proj.parts, proj.connections, proj.scene]);
  useEffect(() => { if (sim.message) setNotice(sim.message); }, [sim.message]);

  const setSource = (text: string) => {
    if (!fwTarget) return;
    setDraft({target: fwTarget, text}); clearTimeout(saveTimer.current);
    const t = fwTarget;
    // Un código copiado de la guía ya tiene su programa compilado: se usa al instante, sin pedir recompilar ni depender del servicio de compilación.
    saveTimer.current = setTimeout(() => projects.update(p => { const next = setFirmwareSource(p, t, text), hex = precompiledHex(text); return hex ? setFirmwareArtifact(next, t, {hex, origin: 'remote-compiler', sourceHash: hashSource(text), compiledAt: new Date().toISOString()}) : next; }, {history: false}), 250); // el programa no genera un paso de historial por tecla
  };
  const compile = async (text: string): Promise<CompileResult> => {
    if (!fwTarget) return {ok: false, errors: [{line: 0, message: 'No hay una placa para el programa.'}]};
    const t = fwTarget, r = await compiler.compile(text, 'arduino-uno-r3');
    if (r.ok) projects.update(p => setFirmwareArtifact(setFirmwareSource(p, t, text), t, {hex: r.hex, origin: 'remote-compiler', sourceHash: hashSource(text), compiledAt: new Date().toISOString()}), {history: false});
    else if (r.offline) setCompilerAvailable(false);
    return r;
  };
  const importHex = async (file: File): Promise<{ok: boolean; error?: string}> => {
    if (!fwTarget) return {ok: false, error: 'No hay una placa para el programa.'};
    const r = await readHexFile(file); if (!r.ok) return {ok: false, error: r.error};
    const t = fwTarget, text = source;
    projects.update(p => setFirmwareArtifact(setFirmwareSource(p, t, text), t, {hex: r.hex, origin: 'hex-import', sourceHash: hashSource(text), compiledAt: new Date().toISOString()}), {history: false});
    return {ok: true};
  };
  const run = () => {
    if (hasArm) { if (armController.running) armController.pause(); else if (armController.line.belt) void armController.classify(); else if(proj.armProgram?.points.length) void armController.playback(); else void armController.startPractice(); return; }
    if (sim.status === 'paused') { sim.resume(); return; }
    if (!fwTarget) { setNotice('Agrega un Arduino UNO R3 para ejecutar un programa.'); windows.open('parts'); return; }
    const status = artifactStatus(firmware?.artifact, hashSource(source));
    if (!canRun(status) || !firmware?.artifact) { setNotice(advice(status, compilerAvailable === true).message); windows.open('code'); return; }
    if (mode !== 'simulate') projects.update(p => ({...p, workspace: {...p.workspace, mode: 'simulate'}}), {history: false, touch: false});
    sim.start({project: structuredClone(proj), targetId: fwTarget, hex: firmware.artifact.hex, physics: true});
  };
  const liveView = useMemo(() => (sim.snapshot ? {leds: Object.fromEntries(Object.entries(sim.snapshot.leds).map(([k, v]) => [k, v.brightness])), servos: liveServos(proj, sim.snapshot.servos ?? {}), controls: sim.snapshot.controls ?? {}, displays: Object.fromEntries(Object.entries(sim.snapshot.displays ?? {}).map(([k, v]) => [k, {frame: v.frame, on: v.on}]))} : undefined), [sim.snapshot]);
  // Al iniciar la simulación se encuadra el robot; mientras corre, la cámara lo sigue (se puede apagar con «Seguir»).
  const startedRef = useRef(false);
  useEffect(() => {
    if (sim.status === 'stopped') { startedRef.current = false; return; }
    if (!framePhysics) return;
    const main = framePhysics.main?.p; if (!main) return;
    if (!startedRef.current) { startedRef.current = true; handle.current?.frameRobot([main, [main[0], main[1] + 0.1, main[2] + 0.12]]); }
    else if (follow && sim.status === 'running') handle.current?.follow(main);
  }, [framePhysics, sim.status, follow]);
  const roomView = useMemo<RoomView | undefined>(() => (mode === 'simulate' ? {lineTrack: proj.scene.lineTrack, obstacles: movedObstacles(proj.scene.obstacles, framePhysics?.objects), beams: framePhysics ? Object.values(framePhysics.sensors) : [], selected: sceneSel} : undefined), [mode, proj.scene.obstacles, proj.scene.lineTrack, framePhysics, sceneSel]);
  const apply = (r: CommandResult | CommandError): boolean => {
    if ('error' in r) { setNotice(r.error); return false; }
    projects.update(() => r.project);
    if (r.notes.length) setNotice(r.notes.join(' '));
    return true;
  };
  const selectIds = (ids: string[]) => setSelection(expandGroups(live.current.proj, ids));
  const addAt = (definitionId: string, position?: Vec3) => {
    const p = live.current.proj, r = addPart(p, definitionId, position ?? freeSpot(p, definitionId));
    if (apply(r) && !('error' in r)) setSelection([r.project.parts.at(-1)!.instanceId]);
  };

  // Arrastrar una pieza desde la ventana Piezas hasta la pizarra, con fantasma sobre el plano.
  const startDrag = (definitionId: string, e: ReactPointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    const start = {x: e.clientX, y: e.clientY};
    let moving = false, dropAt: Vec3 | null = null, dropOk = false, why = '';
    const place = (cx: number, cy: number) => {
      const over = document.elementFromPoint(cx, cy);
      const g = over?.closest('[role="dialog"],.rb-dock,.rb-bar') ? null : handle.current?.groundPoint(cx, cy);
      if (!g) { dropAt = null; setGhost(null); setGhostNote({x: cx, y: cy, text: 'Suéltala sobre la pizarra', bad: true}); return; }
      const step = live.current.snapOn ? live.current.snapMm / 1000 : 0, h = (getDefinition(definitionId)?.dimensions[1] ?? 0.02) / 2;
      const snap = (v: number) => (step ? Math.round(v / step) * step : v);
      dropAt = [snap(g[0]), h, snap(g[2])];
      const check = placementCheck(live.current.proj, definitionId, dropAt);
      dropOk = check.ok; why = check.reason ?? '';
      setGhost({definitionId, position: dropAt, valid: check.ok});
      setGhostNote({x: cx, y: cy, text: check.ok ? (check.overlaps.length ? 'Se superpone con otra pieza: se agrega igual, con aviso' : 'Suelta para agregar') : check.reason ?? 'No se puede colocar aquí', bad: !check.ok});
    };
    const move = (ev: PointerEvent) => {
      if (!moving && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return;
      moving = true; document.body.classList.add('rb-dragging'); place(ev.clientX, ev.clientY);
    };
    const end = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel); removeEventListener('keydown', key, true); document.body.classList.remove('rb-dragging'); setGhost(null); setGhostNote(null); };
    const up = () => { const ok = moving && dropAt && dropOk, at = dropAt, reason = why; end(); if (ok && at) addAt(definitionId, at); else if (moving && at && reason) setNotice(reason); };
    const cancel = () => end();
    const key = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); end(); } };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel); addEventListener('keydown', key, true);
  };

  const pinLabel = (r: PinRef) => { const part = live.current.proj.parts.find(x => x.instanceId === r.instanceId), pin = part && getDefinition(part.definitionId)?.pins.find(x => x.id === r.pinId); return part && pin ? `${part.label} · ${pin.label}` : r.pinId; };
  const onPinClick = (ref: PinRef) => {
    const cur = live.current;
    if (cur.tool === 'wire') {
      const from = cur.pendingPin;
      if (!from) { setPendingPin(ref); return; }
      if (from.instanceId === ref.instanceId && from.pinId === ref.pinId) { setNotice('Elige otro pin para terminar el cable (Esc cancela).'); return; }
      const warn = connectionWarning(cur.proj, from, ref), r = connect(cur.proj, from, ref, cur.wireColor);
      if ('error' in r) { setNotice(r.error); setPendingPin(null); return; }
      projects.update(() => r.project); setWireSel(r.project.connections.at(-1)!.id); setSelection([]); setPendingPin(null);
      setNotice(warn ?? '');
    } else if (cur.tool === 'measure') setProbe(p => (!p.a || (p.a && p.b) ? {a: ref, b: null} : {a: p.a, b: ref}));
  };
  const onPinHover = (ref: PinRef | null, at: {x: number; y: number}) => setPinTip(ref ? {text: `${pinLabel(ref)}`, x: at.x, y: at.y} : null);
  const act = (action: ContextAction | 'frame-all' | 'reset-camera' | 'view-front' | 'view-side' | 'view-top' | 'view-iso' | 'group' | 'ungroup' | 'detach-parent') => {
    const {selection: sel, proj: p, candidates: cands, tool: t} = live.current;
    if (action === 'move') setTool(t === 'move' ? 'select' : 'move');
    else if (action === 'rotate') setTool(t === 'rotate' ? 'select' : 'rotate');
    else if (action === 'join') { const c = cands[0]; if (!c) setNotice('No hay un anclaje compatible a menos de 15 mm.'); else if (cands.length > 1) setJoinChoices(true); else apply(attach(p, c.parent, c.child)); }
    else if (action === 'duplicate') { const r = duplicateParts(p, sel); if (apply(r) && !('error' in r)) setSelection(r.project.parts.slice(p.parts.length).map(x => x.instanceId)); }
    else if (action === 'lock') { const all = p.parts.filter(x => sel.includes(x.instanceId)).every(x => x.locked); projects.update(q => setLocked(q, sel, !all)); }
    else if (action === 'delete') { if (live.current.wireSel && !sel.length) { projects.update(q => disconnect(q, live.current.wireSel!)); setWireSel(null); } else if (sel.length) { apply(removeParts(p, sel)); setSelection([]); } }
    else if (action === 'group') projects.update(q => setGroup(q, sel, true));
    else if (action === 'ungroup') projects.update(q => setGroup(q, sel, false));
    else if (action === 'detach-parent') { const a = sel.map(id => parentAttachment(p, id)).find(Boolean); if (a) projects.update(q => detach(q, a.id)); }
    else if (action === 'frame') handle.current?.frameSelection();
    else if (action === 'frame-all') handle.current?.frameAll();
    else if (action === 'reset-camera') handle.current?.resetCamera();
    else if (action.startsWith('view-')) handle.current?.setView(action.slice(5) as 'front' | 'side' | 'top' | 'iso');
  };

  useEffect(() => {
    const command = (c: ShortcutCommand) => {
      if (c === 'toggle-fly') setFlying(f => !f);
      else if (c === 'tool-select') setTool('select');
      else if (c === 'tool-hand') setTool('hand');
      else if (c === 'tool-wire') setTool(live.current.tool === 'wire' ? 'select' : 'wire');
      else if (c === 'tool-measure') setTool(live.current.tool === 'measure' ? 'select' : 'measure');
      else if (c === 'tool-move') { if (live.current.selection.length) act('move'); else setTool('move'); }
      else if (c === 'tool-rotate') { if (live.current.selection.length) act('rotate'); else setTool('rotate'); }
      else if (c === 'frame-selection') act('frame');
      else if (c === 'frame-all') act('frame-all');
      else if (c === 'undo') projects.undo();
      else if (c === 'redo') projects.redo();
      else if (c === 'delete') act('delete');
      else if (c === 'duplicate') act('duplicate');
      else if (c === 'join') act('join');
      else if (c === 'group') act('group');
      else if (c === 'ungroup') act('ungroup');
      else act(c as 'view-front' | 'view-side' | 'view-top' | 'view-iso');
    };
    const onKey = (e: KeyboardEvent) => {
      const cur = live.current;
      if (e.key === 'Escape') {
        if (document.querySelector('dialog[open]')) return;
        const todo = escapeAction({gesture: handle.current?.gesture() ?? 'idle', tool: cur.tool, selection: cur.selection.length + (cur.wireSel ? 1 : 0), menuOpen: !!cur.menu, pending: !!cur.pendingPin || !!cur.probe.a, flying: cur.flying});
        if (todo === 'none') return;
        e.preventDefault();
        if (todo === 'cancel-gesture') handle.current?.cancelGesture();
        else if (todo === 'close-menu') setMenu(null);
        else if (todo === 'cancel-pending') { setPendingPin(null); setProbe({a: null, b: null}); }
        else if (todo === 'reset-tool') setTool('select');
        else if (todo === 'exit-fly') setFlying(false);
        else { setSelection([]); setWireSel(null); }
        return;
      }
      const c = resolveShortcut({key: e.key, code: e.code, ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey, flying: cur.flying, target: describeTarget(e.target as Element)});
      if (!c) return;
      if (['undo', 'redo', 'duplicate', 'delete', 'group', 'ungroup', 'tool-wire', 'tool-measure'].includes(c)) e.preventDefault();
      command(c);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [projects.undo, projects.redo]);

  const setMode = (next: 'build' | 'simulate') => {
    if (next === 'build' && hasArm && armController.running) armController.stop();
    if (next === 'build' && sim.status !== 'stopped') sim.stop();
    projects.update(p => ({...p, workspace: {...p.workspace, mode: next}}), {history: false, touch: false});
  };
  const onCameraRest = (camera: CameraState) => projects.update(p => ({...p, workspace: {...p.workspace, camera}}), {history: false, touch: false});

  const movable = selection.filter(id => !proj.parts.find(x => x.instanceId === id)?.locked && canMoveAssembly(proj, selection));
  const gizmo: GizmoState | null = (tool === 'move' || tool === 'rotate') && movable.length > 0
    ? {pivot: centroid(proj, movable)!, mode: tool === 'move' ? 'translate' : 'rotate', snapM: snapOn ? snapMm / 1000 : null, snapRad: snapOn ? 15 * DEG : null, key: gizmoKey} : null;
  const finishMove = (p: RobotProject, ids: string[]) => {
    const cur = live.current;
    const result = cur.autoJoin ? snapAssembly(p, ids, cur.reference) : {project: p};
    projects.update(() => result.project);
    if (result.label) setNotice(`${result.label}: encajada. Mantén «Soltar» para separarla; Ctrl+Z deshace.`);
    else if (cur.autoJoin && findJoinCandidates(p, ids).length > 1) setJoinChoices(true);
  };
  const onGizmoDrag = (m: Transform) => { const cur = live.current; if (canMoveAssembly(cur.proj, cur.selection)) setPreview(Math.hypot(...m.position) < 1e-9 && Math.abs(m.rotation[3]) > 1 - 1e-9 ? null : moveParts(cur.proj, cur.selection, m).project); };
  const onGizmoCommit = (m: Transform) => { setPreview(null); const cur = live.current; if (canMoveAssembly(cur.proj, cur.selection)) finishMove(moveParts(cur.proj, cur.selection, m).project, cur.selection); };
  const chooseProgramGuide = (id: string) => projects.update(p => ({...p, workspace: {...p.workspace, programGuide: id || undefined, welcomeDismissed: true}}), {history: false, touch: false});
  const putProgramStep = (step: ProgramStep) => { const r = applyProgramStep(live.current.proj, step); if ('error' in r) setNotice(r.error); else { clearTimeout(saveTimer.current); setDraft(null); projects.update(() => r); setNotice('Código puesto en tu programa. Ábrelo en «Programación» o pruébalo aquí.'); } };
  const chooseWiringGuide = (id: string) => projects.update(p => ({...p, workspace: {...p.workspace, wiringGuide: id || undefined, welcomeDismissed: true}}), {history: false, touch: false});
  const applyWiringStep = (step: GuideStep, matched?: Matched) => { apply(applyStep(live.current.proj, step, matched)); };
  const showWiringPins = (refs: PinRef[]) => { setTool('wire'); setHighlight(new Set(refs.map(r => `${r.instanceId}:${r.pinId}`))); const pts = refs.map(r => pinWorld(live.current.proj, r)).filter(Boolean) as Vec3[]; if (pts.length) handle.current?.framePoints(pts); };
  const chooseGuide = (id: string) => {
    projects.update(p => ({...p, workspace: {...p.workspace, assemblyTemplate: id || undefined, welcomeDismissed: true}}), {history: false, touch: false});
    const model = id ? buildTemplate(id) : null;
    if (model) handle.current?.framePoints(assemblyGuide(proj, model).targets.map(p => p.transform.position));
  };
  const placeGuidePart = () => {
    if (!reference) return;
    const r = placeNextPart(live.current.proj, reference);
    if ('error' in r) { setNotice(r.error); return; }
    projects.update(() => r.project); setSelection([r.placedId]);
    if (r.notes.length) setNotice(r.notes.join(' '));
    const placed = r.project.parts.find(p => p.instanceId === r.placedId); if (placed) handle.current?.framePoints([placed.transform.position]);
  };
  const takeGuidePart = () => {
    if (!guide?.next || !reference) return;
    const target = guide.next;
    const used = new Set(guide.matched.values());
    const existing = proj.parts.find(p => p.definitionId === target.definitionId && !used.has(p.instanceId) && !p.locked && !parentAttachment(proj, p.instanceId));
    if (existing) { setSelection([existing.instanceId]); setTool('move'); handle.current?.framePoints([existing.transform.position, target.transform.position]); return; }
    const isBase = target.instanceId === reference.parts[0].instanceId;
    const position: Vec3 = [target.transform.position[0] + (isBase ? 0 : 0.09), target.transform.position[1], target.transform.position[2]];
    const result = addPart(proj, target.definitionId, position, target.transform.rotation);
    if ('error' in result) { setNotice(result.error); return; }
    const part = result.project.parts.at(-1)!;
    const withProps = {...result.project, parts: result.project.parts.map(p => p.instanceId === part.instanceId ? {...p, props: target.props} : p)};
    projects.update(() => withProps); setSelection([part.instanceId]); setTool('move');
    handle.current?.framePoints([...guide.targets.map(p => p.transform.position), position]);
  };
  const releasePart = (id: string) => {
    const p = live.current.proj, part = p.parts.find(p => p.instanceId === id), attachment = parentAttachment(p, id);
    if (!part || !attachment || part.locked || sim.status !== 'stopped') return;
    projects.update(p => detach(p, attachment.id)); setSelection([id]); setInspectIds([]); setTool('move');
    setNotice(`${part.label}: suelta. Puedes moverla; sus piezas hijas la acompañan. Los cables se conservan.`);
  };

  const ctx: BuildContext = {
    project: proj, selection, interfering, select: selectIds, add: id => addAt(id), startDrag,
    rename: (id, label) => projects.update(p => renamePart(p, id, label)),
    setLocked: (ids, locked) => projects.update(p => setLocked(p, ids, locked)),
    setTransform: (id, t) => { const p = live.current.proj; if (!canMoveAssembly(p, [id])) { setNotice('Esta pieza está encajada. Mantén «Soltar» antes de moverla.'); return; } apply(setPartTransform(p, id, t)); },
    setProp: (id, key, value) => projects.update(p => setPartProp(p, id, key, value)),
    detach: id => projects.update(p => detach(p, id)),
    setGroup: (ids, grouped) => projects.update(p => setGroup(p, ids, grouped)),
    remove: ids => { apply(removeParts(live.current.proj, ids)); setSelection([]); },
    snap: {on: snapOn, stepMm: snapMm, setOn: setSnapOn, setStepMm: setSnapMm},
    diagnostics,
    wires: proj.connections.map(c => ({id: c.id, label: connectionLabel(proj, c.a, c.b), color: c.color, a: c.a, b: c.b, route: c.route ?? []})),
    selectedWire: wireSel,
    selectWire: id => { setWireSel(id); if (id) { setSelection([]); windows.open('properties'); } },
    deleteWire: id => { projects.update(p => disconnect(p, id)); setWireSel(null); },
    setWireColor: (id, color) => projects.update(p => setConnectionColor(p, id, color)),
    setWireRoute: (id, route) => projects.update(p => setConnectionRoute(p, id, route)),
    showPins: refs => { setHighlight(new Set(refs.map(r => `${r.instanceId}:${r.pinId}`))); const pts = refs.map(r => pinWorld(live.current.proj, r)).filter(Boolean) as Vec3[]; if (pts.length) handle.current?.framePoints(pts); },
    clearHighlight: () => setHighlight(new Set()),
    highlighted: highlight.size > 0,
    reading: probe.a && probe.b ? {labelA: pinLabel(probe.a), labelB: pinLabel(probe.b), reading: measure(solution, probe.a, probe.b)} : null,
    clearProbe: () => setProbe({a: null, b: null}),
    tool,
    code: {boards, target: fwTarget, setTarget: id => { setTargetId(id); setDraft(null); }, source, setSource, artifact: firmware?.artifact, compilerAvailable, compile, importHex, ghost: codeGhost, stopGhost: () => setGhostSource('')},
    scene: {
      lineTrack: proj.scene.lineTrack, setTrack: preset => { projects.update(p => setLineTrack(p, preset)); if (mode !== 'simulate') setMode('simulate'); }, obstacles: proj.scene.obstacles, friction: proj.scene.physics.friction, selected: sceneSel, editable: sim.status === 'stopped', select: setSceneSel,
      add: shape => { const r = addObstacle(live.current.proj, shape); if (apply(r) && !('error' in r)) setSceneSel(r.project.scene.obstacles.at(-1)!.id); if (mode !== 'simulate') setMode('simulate'); },
      update: (id, patch) => projects.update(p => updateObstacle(p, id, patch)),
      remove: id => { projects.update(p => removeObstacle(p, id)); setSceneSel(null); },
      setFriction: v => projects.update(p => setFriction(p, v)),
    },
    sim: {status: sim.status, snapshot: sim.snapshot, serial: sim.serial, message: sim.message, ratio: sim.ratio, lag: sim.lag, clearSerial: sim.clearSerial, setControl: sim.setControl, kindOf: id => proj.parts.find(x => x.instanceId === id)?.definitionId, labelOf: id => proj.parts.find(x => x.instanceId === id)?.label ?? id},
  };

  const target = menu?.targetId ? proj.parts.find(x => x.instanceId === menu.targetId) : undefined;
  const allLocked = selected.length > 0 && selected.every(o => o.locked);
  const menuItems: MenuItem[] = menu?.targetId
    ? [
      {id: 'move', label: 'Mover', hint: 'G', icon: <Move3d size={15} />}, {id: 'rotate', label: 'Rotar', hint: 'R', icon: <Rotate3d size={15} />},
      ...(candidates.length ? [{id: 'join', label: 'Unir a la pieza cercana', hint: 'U', icon: <Link size={15} />}] : []),
      ...(target && parentAttachment(proj, target.instanceId) ? [{id: 'detach-parent', label: 'Separar de su padre', icon: <Link2Off size={15} />}] : []),
      ...(selected.length > 1 ? [{id: 'group', label: 'Agrupar', hint: 'Ctrl+G', icon: <Group size={15} />}] : []),
      ...(selected.some(x => x.groupId) ? [{id: 'ungroup', label: 'Desagrupar', hint: 'Ctrl+Mayús+G', icon: <Ungroup size={15} />}] : []),
      {id: 'duplicate', label: 'Duplicar', hint: 'Ctrl+D', icon: <Copy size={15} />, separatorBefore: true}, {id: 'lock', label: allLocked ? 'Desbloquear' : 'Bloquear', icon: allLocked ? <LockOpen size={15} /> : <Lock size={15} />},
      {id: 'frame', label: 'Encuadrar', hint: 'F', icon: <Focus size={15} />}, {id: 'delete', label: 'Borrar', hint: 'Supr', icon: <Trash2 size={15} />, danger: true, separatorBefore: true},
    ]
    : [{id: 'frame-all', label: 'Encuadrar todo', hint: 'Shift+1'}, {id: 'view-front', label: 'Vista frontal', hint: '1', separatorBefore: true}, {id: 'view-side', label: 'Vista lateral', hint: '3'}, {id: 'view-top', label: 'Vista superior', hint: '7'}, {id: 'view-iso', label: 'Vista isométrica', hint: '0'}, {id: 'reset-camera', label: 'Restablecer cámara', separatorBefore: true}];
  const minimized = WINDOW_IDS.filter(id => windows.state[id].open && !windows.state[id].visible);
  const empty = proj.parts.length === 0 && !windows.state.parts.open;
  const joinPoints = candidates.map(c => c.point);
  const enterArena = () => { sim.stop(); armController.stop(); location.assign('/arena/'); };

  return <div className="rb-app" data-mode={mode} data-ready={projects.ready} data-tool={tool}>
    <header className="compact-bar rb-bar" aria-label="Robótica">
      <a href="/" aria-label="Inicio" title="Volver al inicio"><Home size={20} /></a>
      <button type="button" className="rb-name" title="Opciones del proyecto" onClick={() => setOptionsOpen(true)}>
        <strong>{proj.name}</strong>
        <small role="status">{!projects.ready ? 'Abriendo…' : projects.storageBlocked ? 'Guardado desactivado' : projects.saved ? <><Check size={11} /> Guardado</> : 'Guardando…'}</small>
      </button>
      <span className="rb-beta" aria-label="Versión Beta">Beta</span>
      {minimized.map(id => <button key={id} type="button" className="rb-chip" aria-label={`Restaurar ${WINDOW_LABELS[id].title}`} onClick={() => windows.open(id)}>{WINDOW_LABELS[id].title}</button>)}
      <span className="rb-spacer" />
      {hasArm&&<button type="button" className="rb-arm-emergency-shortcut" aria-label="Parada de emergencia del brazo" title="Detener brazo y cinta, incluso con la ventana cerrada" onClick={armController.emergency}><Square size={17}/><span>Emergencia</span></button>}
      <div className="rb-sim" role="group" aria-label="Simulación">
        <button type="button" className="rb-run" aria-label={hasArm ? armController.running ? armController.paused ? 'Reanudar' : 'Pausar' : 'Ejecutar' : sim.status === 'running' ? 'Pausar' : sim.status === 'paused' ? 'Reanudar' : 'Ejecutar'} title={hasArm ? armController.line.belt ? 'Ejecutar o pausar la clasificación de la célula' : 'Reproducir o pausar los puntos enseñados' : 'Ejecutar el programa de la placa'} disabled={hasArm && (!armController.enabled || armController.eStop)} onClick={hasArm ? run : sim.status === 'running' ? sim.pause : run}>{(hasArm ? armController.running && !armController.paused : sim.status === 'running') ? <Pause size={17} /> : <Play size={17} />}</button>
        <button type="button" aria-label="Detener" title="Detener en la posición actual" disabled={hasArm ? !armController.running : sim.status === 'stopped'} onClick={() => hasArm ? armController.stop() : sim.stop()}><Square size={15} /></button>
        <button type="button" ref={robotSound.button} className="rb-sound" aria-label={robotSound.enabled ? 'Silenciar los sonidos del robot' : 'Activar los sonidos del robot'} title={robotSound.enabled ? 'Sonidos del robot: activados (motores, servos, orugas y pinzas)' : 'Sonidos del robot: silenciados'} aria-pressed={robotSound.enabled} disabled={hasArm} onClick={robotSound.toggle}>{robotSound.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
        <select aria-label="Velocidad de simulación" disabled={hasArm} value={sim.speed} onChange={e => sim.setSpeed(Number(e.target.value))}>{SPEEDS.map(s => <option key={s} value={s}>×{String(s).replace('.', ',')}</option>)}</select>
        <span className="rb-sim-chip" role="status" data-sim={sim.status} data-lag={sim.lag || undefined}>{hasArm ? armController.status : sim.status === 'stopped' ? 'DETENIDO' : sim.status === 'paused' ? 'PAUSA' : !sim.snapshot ? 'CARGANDO' : sim.lag ? 'LENTA' : 'EN MARCHA'}</span>
      </div>
      <button type="button" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!projects.canUndo} onClick={projects.undo}><Undo2 size={18} /></button>
      <button type="button" aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" disabled={!projects.canRedo} onClick={projects.redo}><Redo2 size={18} /></button>
      <div className="rb-mode" role="group" aria-label="Modo">
        <button type="button" aria-pressed={mode === 'build'} onClick={() => setMode('build')}><Hammer size={15} /><span>Construir</span></button>
        <button type="button" aria-pressed={mode === 'simulate'} onClick={() => setMode('simulate')}><Eye size={15} /><span>Simular</span></button>
      </div>
      <button type="button" className="rb-arena-launch" aria-label="Abrir arena de robots" title="Arena de sumo" disabled={!supported} onClick={enterArena}><Bot size={20} /></button>
      <button type="button" aria-label="Opciones del proyecto" aria-haspopup="dialog" onClick={() => setOptionsOpen(true)}><MoreHorizontal size={21} /></button>
    </header>

    <main className="rb-stage" aria-label="Pizarra 3D">
      {supported
        ? <BuildCanvas key={`${proj.id}-${glKey}`} handleRef={handle} tool={tool} parts={shown.parts} selection={selection} interfering={interfering} joinPoints={joinPoints} ghost={ghost} gizmo={sim.status === 'stopped' && !flying && !armController.running && !armController.dropping ? gizmo : null} onGizmoDrag={onGizmoDrag} onGizmoCommit={onGizmoCommit}
            assemblyGhosts={mode === 'build' && !flying ? guide?.remaining : undefined} assemblyNext={guide?.next?.instanceId} onInspectParts={ids => { if (sim.status === 'stopped' && !flying && !armController.running) { setInspectIds(ids); setSelection([ids[0]]); } }}
            wires={wireViews} ghostWire={ghostWire} pins={pinList} highlight={highlight} pending={posOf(pendingPin)} probes={{a: posOf(probe.a), b: posOf(probe.b)}} onPinClick={onPinClick} onPinHover={onPinHover} onSelectWire={id => { setWireSel(id); setSelection([]); }}
            flying={flying} live={liveView} room={roomView} debug={debug} reducedMotion={reducedMotion} lowQuality={lowQuality} initialCamera={proj.workspace.camera} onCameraRest={onCameraRest} onAnchor={setAnchor} onContextLost={() => setGlKey(k => k + 1)}
            onSelect={selectIds} onMenu={(at, targetId) => { if (targetId && !live.current.selection.includes(targetId)) selectIds([targetId]); setMenu({at, targetId}); }} />
        : !supported ? <div className="rb-gl-error" role="alert"><strong>Este dispositivo no puede mostrar gráficos 3D</strong><p>Robótica necesita WebGL. Prueba con otro navegador o activa la aceleración por hardware.</p><button type="button" onClick={() => setGlKey(k => k + 1)}>Reintentar</button></div> : null}
      <div className="rb-workspace-controls rb-canvas-overlay">
        <div className="rb-camera-pill" role="group" aria-label="Modos de cámara">
          <button type="button" aria-label="Cámara orbital" aria-pressed={!flying} title="Órbita: gira alrededor del robot" onClick={() => setFlying(false)}><Rotate3d size={16} /><span>Órbita</span></button>
          <button type="button" aria-label="Primera persona" aria-pressed={flying} title="Primera persona (C)" onClick={() => setFlying(true)}><Footprints size={16} /><span>1.ª persona</span></button>
        </div>
        {mode === 'build' && !flying && <button type="button" className="rb-guide-toggle" aria-label="Guía de armado" aria-expanded={guideOpen} aria-pressed={!!reference} onClick={() => { setGuideOpen(v => !v); setWiringOpen(false); setProgramOpen(false); }}><Bot size={17} /><span>Guía</span></button>}
        {mode === 'build' && !flying && <button type="button" className="rb-guide-toggle" aria-label="Cableado paso a paso" aria-expanded={wiringOpen} aria-pressed={wiringOpen} onClick={() => { setWiringOpen(v => !v); setGuideOpen(false); setProgramOpen(false); }}><Cable size={17} /><span>Cableado</span></button>}
        {mode === 'build' && !flying && <button type="button" className="rb-guide-toggle" aria-label="Programar paso a paso" aria-expanded={programOpen} aria-pressed={programOpen} onClick={() => { setProgramOpen(v => !v); setGuideOpen(false); setWiringOpen(false); }}><Code2 size={17} /><span>Programar</span></button>}
      </div>
      {joinChoices && candidates.length > 0 && mode === 'build' && !flying && <section className="rb-part-inspector rb-canvas-overlay" aria-label="Elegir anclaje">
        <div className="rb-guide-heading"><strong>¿Dónde quieres encajar?</strong><button type="button" aria-label="Cerrar anclajes" onClick={() => setJoinChoices(false)}><X size={15} /></button></div>
        <p>Hay varios anclajes cercanos. Elige la pieza y el punto de unión.</p>
        <div className="rb-overlap-list">{candidates.map((c, i) => <button type="button" key={i} onClick={() => { apply(attach(live.current.proj, c.parent, c.child)); setJoinChoices(false); }}>{proj.parts.find(p => p.instanceId === c.child.instanceId)?.label} → {proj.parts.find(p => p.instanceId === c.parent.instanceId)?.label} · {c.parent.anchorId} ({(c.distance * 1000).toFixed(1)} mm)</button>)}</div>
      </section>}
      {programOpen && mode === 'build' && !flying && <ProgramGuide project={proj} guideId={proj.workspace.programGuide} suggestedId={programGuideForTemplate(proj.workspace.assemblyTemplate ?? (proj.workspace.wiringGuide?.startsWith('plantilla:') ? proj.workspace.wiringGuide.slice(10) : undefined))?.id} onChoose={chooseProgramGuide} onPut={putProgramStep} onGhost={step => { setGhostSource(step ? step.source : ''); if (step) { windows.open('code'); if (!source.trim() || source.trim() === SKETCH_TEMPLATE.trim()) setSource(''); } }} onClose={() => { setProgramOpen(false); setGhostSource(''); }} />}
      {wiringOpen && mode === 'build' && !flying && <WiringGuide project={proj} guideId={proj.workspace.wiringGuide} onChoose={chooseWiringGuide} onApply={applyWiringStep} onGhost={setGhostCable} onShow={showWiringPins} onClear={() => setHighlight(new Set())} onClose={() => setWiringOpen(false)} />}
      {guideOpen && mode === 'build' && !flying && <section className="rb-assembly-guide rb-canvas-overlay" aria-label="Ayuda de armado">
        <div className="rb-guide-heading"><strong>Aprender a armar</strong><button type="button" aria-label="Cerrar guía de armado" onClick={() => setGuideOpen(false)}><X size={16} /></button></div>
        <label>Referencia de armado<select aria-label="Referencia de armado" value={proj.workspace.assemblyTemplate ?? ''} onChange={e => chooseGuide(e.target.value)}><option value="">Construcción libre · sin referencia</option>{TEMPLATES.filter(t => !t.id.startsWith('brazo-')).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        {guide && reference ? <>
          <div className="rb-guide-progress"><span>{guide.matched.size} de {guide.targets.length} piezas colocadas</span><progress aria-label="Avance de armado" value={guide.matched.size} max={guide.targets.length} /></div>
          {guide.next ? <>{aSteps?.current && <small className="rb-assembly-kicker" data-assembly-step={aSteps.current.index + 1}>{aSteps.current.group} · paso {aSteps.current.index + 1} de {aSteps.total}</small>}<strong className="rb-guide-piece">{guide.next.label}</strong>{aSteps?.current && <><p className="rb-assembly-where">{aSteps.current.where}</p><p>{aSteps.current.why}</p></>}<div className="rb-guide-actions"><button type="button" onClick={takeGuidePart}>{guide.matched.size ? 'Tomar pieza' : 'Colocar base'}</button><button type="button" onClick={placeGuidePart}>Encajarla por mí</button><button type="button" onClick={() => handle.current?.framePoints(guide.targets.map(p => p.transform.position))}>Ver referencia</button></div><p>La figura azul indica dónde va. Toma la pieza y mueve las flechas hasta acercarla a su figura; suelta para encajar.</p></> : <p role="status"><b>Armado de referencia completo.</b> Ahora revisa el cableado y el programa antes de simular.</p>}
          <p className="rb-guide-caption">Azul tenue: piezas pendientes. La guía es opcional; puedes crear otros diseños.</p>
          {aSteps && <><button type="button" className="rb-structure-link" aria-expanded={stepsOpen} onClick={() => setStepsOpen(v => !v)}>{stepsOpen ? 'Ocultar la lista de pasos' : 'Ver todos los pasos de armado'}</button>
            {stepsOpen && <ol className="rb-wiring-list rb-assembly-list" aria-label="Pasos de armado">{aSteps.steps.map(st => <li key={st.part.instanceId} data-state={st.done ? 'done' : 'todo'} aria-current={st.current ? 'step' : undefined}><span aria-hidden="true">{st.done ? '✓' : st.index + 1}</span> {st.part.label} <small>· {st.group}</small></li>)}</ol>}</>}
        </> : <p>Tu laboratorio es libre. Elige una referencia si quieres ver las figuras de las piezas antes de colocarlas.</p>}
        <label className="rb-auto-join"><input type="checkbox" checked={autoJoin} onChange={e => setAutoJoin(e.target.checked)} />Encajar al soltar cerca de un anclaje</label>
      </section>}
      {mode === 'build' && !flying && sim.status === 'stopped' && (inspectIds.length > 0 || (selected.length === 1 && parentAttachment(proj, selected[0].instanceId))) && <section className="rb-part-inspector rb-canvas-overlay" aria-label="Separar pieza del armado">
        <div className="rb-guide-heading"><strong>{inspectIds.length > 1 ? 'Elige la pieza exacta' : 'Pieza del armado'}</strong><button type="button" aria-label="Cerrar selección de piezas" onClick={() => { setInspectIds([]); setSelection([]); }}><X size={15} /></button></div>
        {inspectIds.length > 1 && <><p>Selecciona un nombre para resaltarlo antes de soltar.</p><div className="rb-overlap-list">{inspectIds.map(id => { const part = proj.parts.find(p => p.instanceId === id); return part && <button type="button" key={id} aria-pressed={selection.length === 1 && selection[0] === id} onClick={() => setSelection([id])}>{part.label}</button>; })}</div></>}
        {selected.length === 1 && <><b>{selected[0].label}</b>{parentAttachment(proj, selected[0].instanceId) ? <><span>Unida a {proj.parts.find(p => p.instanceId === parentAttachment(proj, selected[0].instanceId)?.parent.instanceId)?.label}</span>{!selected[0].locked && <HoldToRelease key={selected[0].instanceId} label={selected[0].label} onRelease={() => releasePart(selected[0].instanceId)} />}</> : <span>Pieza suelta · puedes moverla</span>}</>}
        <button type="button" className="rb-structure-link" onClick={() => windows.open('structure')}>Buscar otra pieza en Estructura</button>
      </section>}
      {anchor && selection.length > 0 && !preview && <ContextToolbar at={anchor} count={selection.length} locked={allLocked} tool={tool} canJoin={candidates.length > 0} onAction={act} />}
      {empty && supported && !reference && !guideOpen && !proj.workspace.welcomeDismissed && <section className="rb-empty rb-canvas-overlay" aria-label="Empezar en Robótica">
        <div className="rb-empty-symbol" aria-hidden="true"><Bot size={25} /></div>
        <span className="rb-empty-eyebrow">LABORATORIO DE ROBÓTICA</span>
        <strong>Tu robot empieza aquí</strong>
        <p>Crea desde cero o aprende a armar con una referencia visual.</p>
        <div className="rb-start-options">
          <button type="button" className="rb-start-primary" aria-label="Abrir Piezas" onClick={() => { chooseGuide(''); windows.open('parts'); }}><Boxes size={21} /><span><b>Crear libremente</b><small>Elige piezas y construye tu idea</small></span><span aria-hidden="true">→</span></button>
          <button type="button" aria-label="Armar con guía visual" onClick={() => { setGuideOpen(true); chooseGuide(TEMPLATE_READY_ROBOT); }}><Bot size={21} /><span><b>Armar con guía visual</b><small>Sigue las figuras, pieza por pieza</small></span><span aria-hidden="true">→</span></button>
        </div>
        <div className="rb-start-secondary">
          <button type="button" className="rb-template-btn" aria-label="Robot de ejemplo listo para usar" onClick={() => projects.createFromTemplate(TEMPLATE_READY_ROBOT)}>Probar un robot armado</button>
          <button type="button" className="rb-more-robots" aria-label="Más robots y proyectos" onClick={() => setProjectsOpen(true)}>Ver proyectos</button>
          <button type="button" className="rb-more-robots" aria-label="Probar arena de sumo" onClick={enterArena}>Arena de sumo</button>
        </div>
      </section>}
      {mode === 'simulate' && !hasArm && <div className="rb-sim-note rb-canvas-overlay" role="status" aria-label="Estado de la simulación">{framePhysics
        ? <><button type="button" className="rb-follow" aria-pressed={follow} onClick={() => setFollow(f => !f)}>Seguir</button><strong>{fmtM(framePhysics.main?.speed ?? 0)} m/s</strong>{Object.keys(framePhysics.sensors).map(id => { const d = framePhysics.sensors[id].distance; return <span key={id}>{ctx.sim.labelOf(id)}: {d === null ? 'sin obstáculo (≥ 4 m)' : `${fmtM(d)} m`}</span>; })}</>
        : <><strong>Escenario</strong>: cuarto blanco de 4 × 4 m. Agrega obstáculos en <b>Escenario</b> y pulsa ▶: el robot se mueve solo por lo que armaste, cableaste y programaste.</>}</div>}
      {flying && <div className="rb-fly-bar rb-canvas-overlay" role="status"><b>Primera persona</b><span>W A S D mover · Q bajar · E subir · Mayús correr · clic derecho mirar · rueda avanzar</span><button type="button" onClick={() => setFlying(false)}>Salir (C)</button></div>}
      {tool === 'wire' && <div className="rb-tool-bar rb-canvas-overlay" role="group" aria-label="Cable"><span>{pendingPin ? `Desde ${pinLabel(pendingPin)}: elige el pin de destino` : 'Pulsa un pin para empezar el cable'}</span>
        <span className="rb-swatches-inline" role="group" aria-label="Color del cable nuevo">{WIRE_COLORS.map(c => <button type="button" key={c.value} className="rb-swatch" style={{background: c.value}} aria-label={`Nuevo cable ${c.name}`} aria-pressed={wireColor === c.value} onClick={() => setWireColor(c.value)} />)}</span></div>}
      {tool === 'measure' && <div className="rb-tool-bar rb-canvas-overlay" role="status">{ctx.reading ? <><b>{ctx.reading.reading.volts === null ? '— V' : `${ctx.reading.reading.volts.toFixed(2).replace('.', ',')} V`}</b><span>{ctx.reading.reading.continuity ? 'continuidad ✔' : 'sin continuidad'} · {ctx.reading.labelA} ↔ {ctx.reading.labelB}</span></> : <span>{probe.a ? `Punta roja en ${pinLabel(probe.a)}: elige el segundo pin` : 'Pulsa un pin para la punta roja y otro para la negra'}</span>}</div>}
      {pinTip && wiring && <div className="rb-pin-tip" style={{left: pinTip.x + 14, top: pinTip.y + 16}} role="tooltip">{pinTip.text}</div>}
      {debug && <div className="rb-debug-tag rb-canvas-overlay" aria-hidden="true">depuración</div>}
    </main>

    <nav className="tool-dock rb-dock" aria-label="Herramientas">
      <button type="button" aria-label="Seleccionar" title="Seleccionar (V)" aria-pressed={tool === 'select'} onClick={() => setTool('select')}><MousePointer2 size={20} /></button>
      <button type="button" aria-label="Mover" title="Mover: gizmo de la selección (G)" aria-pressed={tool === 'move'} onClick={() => setTool(tool === 'move' ? 'select' : 'move')}><Move3d size={20} /></button>
      <button type="button" aria-label="Rotar" title="Rotar: gizmo de la selección (R)" aria-pressed={tool === 'rotate'} onClick={() => setTool(tool === 'rotate' ? 'select' : 'rotate')}><Rotate3d size={20} /></button>
      <button type="button" aria-label="Cable" title="Cable: une dos pines (W)" aria-pressed={tool === 'wire'} onClick={() => setTool(tool === 'wire' ? 'select' : 'wire')}><Cable size={20} /></button>
      <button type="button" aria-label="Medir" title="Medir: tensión y continuidad entre dos pines (M)" aria-pressed={tool === 'measure'} onClick={() => setTool(tool === 'measure' ? 'select' : 'measure')}><Gauge size={20} /></button>
      <button type="button" aria-label="Mano" title="Mano: desplazar (H)" aria-pressed={tool === 'hand'} onClick={() => setTool('hand')}><Hand size={20} /></button>
      <button type="button" aria-label="Encuadrar" title="Encuadrar selección o todo (F)" onClick={() => (selection.length ? act('frame') : act('frame-all'))}><Focus size={20} /></button>
      <button type="button" aria-label="Imán" title={`Imán: pasos de ${snapMm} mm y 15° (se cambia en Propiedades)`} aria-pressed={snapOn} onClick={() => setSnapOn(v => !v)}><Magnet size={20} /></button>
      <i aria-hidden="true" />
      {WINDOW_IDS.filter(id=>id!=='arm'||hasArm).map(id => {
        const Icon = DOCK_ICONS[id], w = windows.state[id], label = WINDOW_LABELS[id].title;
        const issues = id === 'console' ? diagnostics.filter(d => d.severity !== 'info').length : 0;
        return <button key={id} type="button" aria-label={w.open && !w.visible ? `Restaurar ${label}` : label} title={label} aria-pressed={w.open && w.visible} data-minimized={w.open && !w.visible} data-badge={issues || undefined} onClick={() => windows.toggle(id)}><Icon size={20} /><span>{label}</span></button>;
      })}
    </nav>

    <RoboticsToolWindows windows={windows} ctx={ctx} armController={armController} armVisible={!flying} />
    {optionsOpen && <ProjectOptionsWindow projects={projects} windows={windows} onClose={() => setOptionsOpen(false)} onOpenProjects={() => setProjectsOpen(true)} onArena={supported ? enterArena : undefined} />}
    {projectsOpen && <ProjectsWindow projects={projects} onClose={() => setProjectsOpen(false)} />}
    {menu && <ContextMenu at={menu.at} title={menu.targetId ? 'Acciones de la pieza' : 'Acciones del lienzo'} items={menuItems} onClose={() => setMenu(null)} onChoose={id => { setMenu(null); act(id as ContextAction); }} />}
    {ghostNote && <div className={`rb-ghost-note${ghostNote.bad ? ' is-bad' : ''}`} role="status" style={{left: ghostNote.x + 14, top: ghostNote.y + 14}}>{ghostNote.text}</div>}
    {(projects.message || notice) && <div className="rb-toast" role="status"><span>{projects.message || notice}</span><button type="button" aria-label="Cerrar aviso" onClick={() => { projects.setMessage(''); setNotice(''); }}><X size={14} /></button></div>}
  </div>;
}
