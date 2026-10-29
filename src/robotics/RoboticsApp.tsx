import {useEffect, useMemo, useRef, useState} from 'react';
import {Boxes, Check, Code2, Copy, Eye, Focus, Hammer, Hand, Home, ListTree, Lock, LockOpen, MousePointer2, MoreHorizontal, Redo2, SlidersHorizontal, Terminal, Trash2, Undo2, X} from 'lucide-react';
import {BuildCanvas, type CameraState, type CanvasHandle, type DebugObject} from './build/BuildCanvas';
import {ContextToolbar, type ContextAction} from './interaction/ContextToolbar';
import {ContextMenu, type MenuItem} from './interaction/ContextMenu';
import {escapeAction, type ToolId} from './interaction/tools.ts';
import {describeTarget, resolveShortcut, type ShortcutCommand} from './interaction/shortcuts.ts';
import {useRoboticsProjects} from './project/useRoboticsProjects';
import {useRoboticsWindows, WINDOW_IDS, type RoboticsWindowId} from './windows/useRoboticsWindows';
import {ProjectOptionsWindow, ProjectsWindow, RoboticsToolWindows, WINDOW_LABELS} from './windows/RoboticsWindows';
import '../styles/robotics.css';

const DOCK_ICONS: Record<RoboticsWindowId, typeof Boxes> = {parts: Boxes, structure: ListTree, properties: SlidersHorizontal, code: Code2, console: Terminal};
const DEBUG_OBJECTS = (): DebugObject[] => [
  {id: 'dbg-a', label: 'Cubo A', position: [-0.18, 0.06, 0], size: [0.12, 0.12, 0.12], color: '#3E806B', locked: false},
  {id: 'dbg-b', label: 'Cubo B', position: [0.05, 0.05, 0.08], size: [0.1, 0.1, 0.1], color: '#4a7fb0', locked: false},
  {id: 'dbg-c', label: 'Cubo C', position: [0.2, 0.04, -0.1], size: [0.08, 0.08, 0.08], color: '#c98a3d', locked: false},
];

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
function prefersReducedMotion() {
  const root = document.documentElement.classList;
  return !root.contains('modo-motion-full') && (matchMedia('(prefers-reduced-motion: reduce)').matches || root.contains('modo-reduced'));
}

export default function RoboticsApp() {
  const projects = useRoboticsProjects();
  const windows = useRoboticsWindows();
  const debug = useMemo(() => new URLSearchParams(location.search).get('debug') === '1', []);
  const [tool, setTool] = useState<ToolId>('select');
  const [objects, setObjects] = useState<DebugObject[]>(() => (debug ? DEBUG_OBJECTS() : []));
  const [selection, setSelection] = useState<string[]>([]);
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
  const mode = projects.project.workspace.mode ?? 'build';
  const selected = objects.filter(o => selection.includes(o.id));
  const live = useRef({tool, selection, menu, objects});
  live.current = {tool, selection, menu, objects};

  const act = (action: ContextAction | 'frame-all' | 'reset-camera' | 'view-front' | 'view-side' | 'view-top' | 'view-iso') => {
    const { selection: sel } = live.current;
    if (action === 'duplicate') {
      setObjects(list => {
        const copies = list.filter(o => sel.includes(o.id)).map(o => ({...o, id: `dbg-${crypto.randomUUID().slice(0, 8)}`, label: `${o.label} copia`, position: [o.position[0] + 0.05, o.position[1], o.position[2] + 0.05] as DebugObject['position'], locked: false}));
        queueMicrotask(() => setSelection(copies.map(c => c.id)));
        return [...list, ...copies];
      });
    } else if (action === 'lock') setObjects(list => { const lock = !list.filter(o => sel.includes(o.id)).every(o => o.locked); return list.map(o => (sel.includes(o.id) ? {...o, locked: lock} : o)); });
    else if (action === 'delete') {
      const locked = live.current.objects.filter(o => sel.includes(o.id) && o.locked).map(o => o.id);
      setObjects(list => list.filter(o => !(sel.includes(o.id) && !o.locked)));
      setSelection(locked);
      if (locked.length) setNotice('Los objetos bloqueados no se borran. Desbloquéalos primero.');
    } else if (action === 'frame') handle.current?.frameSelection();
    else if (action === 'frame-all') handle.current?.frameAll();
    else if (action === 'reset-camera') handle.current?.resetCamera();
    else if (action.startsWith('view-')) handle.current?.setView(action.slice(5) as 'front' | 'side' | 'top' | 'iso');
  };

  useEffect(() => {
    const command = (c: ShortcutCommand) => {
      if (c === 'tool-select') setTool('select');
      else if (c === 'tool-hand') setTool('hand');
      else if (c === 'frame-selection') act('frame');
      else if (c === 'frame-all') act('frame-all');
      else if (c === 'undo') projects.undo();
      else if (c === 'redo') projects.redo();
      else if (c === 'delete') act('delete');
      else if (c === 'duplicate') act('duplicate');
      else act(c as 'view-front' | 'view-side' | 'view-top' | 'view-iso');
    };
    const onKey = (e: KeyboardEvent) => {
      const cur = live.current;
      if (e.key === 'Escape') {
        if (document.querySelector('dialog[open]')) return;
        const todo = escapeAction({gesture: handle.current?.gesture() ?? 'idle', tool: cur.tool, selection: cur.selection.length, menuOpen: !!cur.menu});
        if (todo === 'none') return;
        e.preventDefault();
        if (todo === 'cancel-gesture') handle.current?.cancelGesture();
        else if (todo === 'close-menu') setMenu(null);
        else if (todo === 'reset-tool') setTool('select');
        else setSelection([]);
        return;
      }
      const c = resolveShortcut({key: e.key, code: e.code, ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey, alt: e.altKey, target: describeTarget(e.target as Element)});
      if (!c) return;
      if (c === 'undo' || c === 'redo' || c === 'duplicate' || c === 'delete') e.preventDefault();
      command(c);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [projects.undo, projects.redo]);

  const setMode = (next: 'build' | 'simulate') => projects.update(p => ({...p, workspace: {...p.workspace, mode: next}}), {history: false, touch: false});
  const onCameraRest = (camera: CameraState) => projects.update(p => ({...p, workspace: {...p.workspace, camera}}), {history: false, touch: false});

  const menuItems: MenuItem[] = menu?.targetId
    ? [{id: 'duplicate', label: 'Duplicar', hint: 'Ctrl+D', icon: <Copy size={15} />}, {id: 'lock', label: selected.every(o => o.locked) ? 'Desbloquear' : 'Bloquear', icon: selected.every(o => o.locked) ? <LockOpen size={15} /> : <Lock size={15} />}, {id: 'frame', label: 'Encuadrar', hint: 'F', icon: <Focus size={15} />}, {id: 'delete', label: 'Borrar', hint: 'Supr', icon: <Trash2 size={15} />, danger: true, separatorBefore: true}]
    : [{id: 'frame-all', label: 'Encuadrar todo', hint: 'Shift+1'}, {id: 'view-front', label: 'Vista frontal', hint: '1', separatorBefore: true}, {id: 'view-side', label: 'Vista lateral', hint: '3'}, {id: 'view-top', label: 'Vista superior', hint: '7'}, {id: 'view-iso', label: 'Vista isométrica', hint: '0'}, {id: 'reset-camera', label: 'Restablecer cámara', separatorBefore: true}];
  const minimized = WINDOW_IDS.filter(id => windows.state[id].open && !windows.state[id].visible);
  const empty = projects.project.parts.length === 0 && objects.length === 0 && !windows.state.parts.open;

  return <div className="rb-app" data-mode={mode} data-ready={projects.ready}>
    <header className="compact-bar rb-bar" aria-label="Robótica">
      <a href="/" aria-label="Inicio" title="Volver al inicio"><Home size={20} /></a>
      <button type="button" className="rb-name" title="Opciones del proyecto" onClick={() => setOptionsOpen(true)}>
        <strong>{projects.project.name}</strong>
        <small role="status">{!projects.ready ? 'Abriendo…' : projects.storageBlocked ? 'Guardado desactivado' : projects.saved ? <><Check size={11} /> Guardado</> : 'Guardando…'}</small>
      </button>
      <span className="rb-beta" aria-label="Versión Beta">Beta</span>
      {minimized.map(id => <button key={id} type="button" className="rb-chip" aria-label={`Restaurar ${WINDOW_LABELS[id].title}`} onClick={() => windows.open(id)}>{WINDOW_LABELS[id].title}</button>)}
      <span className="rb-spacer" />
      <button type="button" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!projects.canUndo} onClick={projects.undo}><Undo2 size={18} /></button>
      <button type="button" aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" disabled={!projects.canRedo} onClick={projects.redo}><Redo2 size={18} /></button>
      <div className="rb-mode" role="group" aria-label="Modo">
        <button type="button" aria-pressed={mode === 'build'} onClick={() => setMode('build')}><Hammer size={15} /><span>Construir</span></button>
        <button type="button" aria-pressed={mode === 'simulate'} onClick={() => setMode('simulate')}><Eye size={15} /><span>Simular</span></button>
      </div>
      <button type="button" aria-label="Opciones del proyecto" aria-haspopup="dialog" onClick={() => setOptionsOpen(true)}><MoreHorizontal size={21} /></button>
    </header>

    <main className="rb-stage" aria-label="Pizarra 3D">
      {supported
        ? <BuildCanvas key={`${projects.project.id}-${glKey}`} handleRef={handle} tool={tool} objects={objects} selection={selection} debug={debug} reducedMotion={reducedMotion} lowQuality={lowQuality} initialCamera={projects.project.workspace.camera} onCameraRest={onCameraRest} onAnchor={setAnchor} onContextLost={() => setGlKey(k => k + 1)}
            onSelect={setSelection} onMenu={(at, targetId) => { if (targetId && !live.current.selection.includes(targetId)) setSelection([targetId]); setMenu({at, targetId}); }} />
        : <div className="rb-gl-error" role="alert"><strong>Este dispositivo no puede mostrar gráficos 3D</strong><p>Robótica necesita WebGL. Prueba con otro navegador o activa la aceleración por hardware.</p><button type="button" onClick={() => setGlKey(k => k + 1)}>Reintentar</button></div>}
      {anchor && selection.length > 0 && <ContextToolbar at={anchor} count={selection.length} locked={selected.length > 0 && selected.every(o => o.locked)} onAction={act} />}
      {empty && supported && <div className="rb-empty rb-canvas-overlay"><strong>Tu robot empieza aquí</strong><p>Abre <b>Piezas</b> para empezar.</p><button type="button" onClick={() => windows.open('parts')}><Boxes size={16} /> Abrir Piezas</button></div>}
      {mode === 'simulate' && <div className="rb-sim-note rb-canvas-overlay" role="status"><strong>Simulación</strong> disponible en una próxima etapa. Por ahora puedes seguir construyendo.</div>}
      {debug && <div className="rb-debug-tag rb-canvas-overlay" aria-hidden="true">depuración</div>}
    </main>

    <nav className="tool-dock rb-dock" aria-label="Herramientas">
      <button type="button" aria-label="Seleccionar" title="Seleccionar (V)" aria-pressed={tool === 'select'} onClick={() => setTool('select')}><MousePointer2 size={20} /></button>
      <button type="button" aria-label="Mano" title="Mano: desplazar (H)" aria-pressed={tool === 'hand'} onClick={() => setTool('hand')}><Hand size={20} /></button>
      <button type="button" aria-label="Encuadrar" title="Encuadrar selección o todo (F)" onClick={() => (selection.length ? act('frame') : act('frame-all'))}><Focus size={20} /></button>
      <i aria-hidden="true" />
      {WINDOW_IDS.map(id => {
        const Icon = DOCK_ICONS[id], w = windows.state[id], label = WINDOW_LABELS[id].title;
        return <button key={id} type="button" aria-label={w.open && !w.visible ? `Restaurar ${label}` : label} title={label} aria-pressed={w.open && w.visible} data-minimized={w.open && !w.visible} onClick={() => windows.toggle(id)}><Icon size={20} /><span>{label}</span></button>;
      })}
    </nav>

    <RoboticsToolWindows windows={windows} selected={selected} objectCount={objects.length} />
    {optionsOpen && <ProjectOptionsWindow projects={projects} windows={windows} onClose={() => setOptionsOpen(false)} onOpenProjects={() => setProjectsOpen(true)} />}
    {projectsOpen && <ProjectsWindow projects={projects} onClose={() => setProjectsOpen(false)} />}
    {menu && <ContextMenu at={menu.at} title={menu.targetId ? 'Acciones del objeto' : 'Acciones del lienzo'} items={menuItems} onClose={() => setMenu(null)} onChoose={id => { setMenu(null); act(id as ContextAction); }} />}
    {(projects.message || notice) && <div className="rb-toast" role="status"><span>{projects.message || notice}</span><button type="button" aria-label="Cerrar aviso" onClick={() => { projects.setMessage(''); setNotice(''); }}><X size={14} /></button></div>}
  </div>;
}
