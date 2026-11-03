import {Component, useEffect, useImperativeHandle, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type Ref} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {CameraControls, Grid, Html, Line, TransformControls} from '@react-three/drei';
import {Box3, CanvasTexture, MeshBasicMaterial, CatmullRomCurve3, Float32BufferAttribute, Matrix4, Plane, Quaternion, Raycaster, Sphere, Vector2, Vector3, type BufferGeometry, type Mesh, type Group, type Object3D, type PerspectiveCamera} from 'three';
import type CameraControlsImpl from 'camera-controls';
import {describeTarget, shortcutsDisabled} from '../interaction/shortcuts.ts';
import {classifyRelease, LONG_PRESS_MS, MOVE_THRESHOLD_PX, nextSelection, rectFromPoints, rectsIntersect, startGesture, type Gesture, type Rect2, type ToolId} from '../interaction/tools.ts';
import {createWheelRouter, NAV_LABEL, nextNavMode, ORBIT_PER_HEIGHT, parseNavMode, zoomFactor, type NavMode} from '../interaction/navigation.ts';
import {getDefinition} from '../catalog/index.ts';
import type {Obstacle, PartInstance, PinRef, Transform, Vec3, LineTrack} from '../project/types.ts';
import {ROOM_HALF, WALL_H} from '../sim/physics.ts';
import {PartMesh, GhostMesh, AssemblyGhost} from './PartMesh';
import {renderThumbnail} from './renderThumbnail';
import {LineTrackMesh} from './LineTrackMesh';
import {ViewCube} from './ViewCube';

export type ViewName = 'front' | 'back' | 'side' | 'left' | 'top' | 'bottom' | 'iso';
export type CameraState = {position: Vec3; target: Vec3};
export type GizmoState = {pivot: Vec3; mode: 'translate' | 'rotate'; snapM: number | null; snapRad: number | null; key: number};
export type Ghost = {definitionId: string; position: Vec3; valid: boolean};
/** Un pin dibujable/seleccionable: posición en el mundo, función y si ya tiene cable. */
export type GhostWireView = {points: Vec3[]; color: string};
export type PinMarker = {ref: PinRef; pos: Vec3; role: string; label?: string; connected: boolean};
/** El cubo blanco de la simulación: obstáculos del proyecto y el haz del sensor de distancia. */
export type RoomView = {lineTrack?: LineTrack; obstacles: Obstacle[]; beams: {origin: Vec3; dir: Vec3; distance: number | null}[]; selected: string | null};
export type WireView = {connectorEnds?: [boolean, boolean]; id: string; color: string; points: Vec3[]; selected: boolean};
export const pinColor = (role: string) => ({'power-in': '#d94b4b', 'power-out': '#e08a3c', ground: '#3b3f45', digital: '#c9a83a', pwm: '#2f8fd0', analog: '#2fb07f', motor: '#9b5fd0', signal: '#c9a83a'} as Record<string, string>)[role] ?? '#888888';
export type CanvasHandle = {
  frameSelection(): void;
  frameAll(): void;
  setView(view: ViewName): void;
  resetCamera(): void;
  cancelGesture(): void;
  gesture(): Gesture;
  /** Punto del plano del suelo (y = 0) bajo una posición de pantalla, o null si el rayo no lo toca. */
  groundPoint(clientX: number, clientY: number): Vec3 | null;
  /** Encuadra un conjunto de puntos del mundo (p. ej. los pines de un diagnóstico). */
  framePoints(points: Vec3[]): void;
  /** Cámara de seguimiento: desplaza la vista (sin cambiar el ángulo ni la distancia) para que el punto quede al centro. */
  follow(point: Vec3): void;
  /** Encuadra el robot y un poco del cuarto, mirando desde atrás y arriba (al iniciar la simulación). */
  frameRobot(points: Vec3[]): void;
};

const DEFAULT_CAMERA: CameraState = {position: [0.9, 0.75, 0.9], target: [0, 0.05, 0]};
const VIEW_DIRECTIONS: Record<ViewName, Vec3> = {front: [0, 0.0001, 1], back: [0, 0.0001, -1], side: [1, 0.0001, 0], left: [-1, 0.0001, 0], top: [0.00001, 1, 0.00001], bottom: [0.00001, -1, 0.00001], iso: [0.62, 0.5, 0.62]};

type SceneApi = {
  pick(x: number, y: number): string | null;
  pickParts(x: number, y: number): string[];
  boxSelect(rect: Rect2): string[];
  gizmoHot(x: number, y: number): boolean;
  configure(gesture: Gesture, button: number, pointerType: string): void;
  cancel(): void;
  ground(clientX: number, clientY: number): Vec3 | null;
  pickPin(x: number, y: number): PinRef | null;
  cursorOn(clientX: number, clientY: number, through: Vec3): Vec3 | null;
};

type Props = {
  assemblyGhosts?: PartInstance[];
  assemblyNext?: string;
  onInspectParts?(ids: string[]): void;
  tool: ToolId;
  parts: PartInstance[];
  selection: string[];
  interfering: ReadonlySet<string>;
  joinPoints: Vec3[];
  ghost: Ghost | null;
  gizmo: GizmoState | null;
  onGizmoDrag(m: Transform): void;
  onGizmoCommit(m: Transform): void;
  /** Cables y pines: los pines solo se dibujan con la herramienta Cable/Medir (o si hay diagnósticos resaltados). */
  wires: WireView[];
  /** Cable «espectro» del paso actual de la guía de cableado: translúcido, entre los dos pines que hay que unir. */
  ghostWire?: GhostWireView | null;
  pins: PinMarker[];
  highlight: ReadonlySet<string>;
  pending: Vec3 | null;
  probes: {a: Vec3 | null; b: Vec3 | null};
  onPinClick(ref: PinRef): void;
  onPinHover(ref: PinRef | null, at: {x: number; y: number}): void;
  onSelectWire(id: string): void;
  onSelect(ids: string[]): void;
  onMenu(at: {x: number; y: number}, targetId: string | null): void;
  onAnchor(point: {x: number; y: number} | null): void;
  onContextLost(): void;
  onCameraRest(camera: CameraState): void;
  /** Cámara en primera persona: WASD mueve, Q/E baja/sube y el botón derecho (o un dedo) mira. */
  flying: boolean;
  /** Estado vivo de la simulación (brillo de los LED, 0–1). */
  live?: {leds: Record<string, number>; /** Ángulo (°) de cada servo simulado. */ servos?: Record<string, number>; /** Valor vivo de potenciómetros (0–1) y pulsadores (0/1). */ controls?: Record<string, number>; displays?: Record<string, {frame: Uint8Array; on: boolean}>};
  /** Escenario de la simulación (se dibuja en el modo Simular). */
  room?: RoomView;
  initialCamera?: CameraState;
  reducedMotion: boolean;
  lowQuality: boolean;
  debug: boolean;
  handleRef: Ref<CanvasHandle>;
};

class Boundary extends Component<{children: ReactNode; onError(message: string): void}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  componentDidCatch(error: Error) { this.props.onError(error.message); }
  render() { return this.state.failed ? null : this.props.children; }
}

const ZERO: Vec3 = [0, 0, 0];
const NAV_KEY = 'modo.robotics.navMode';

export function BuildCanvas(props: Props) {
  const {tool, parts, selection, onSelect, onMenu, onAnchor, onContextLost, onCameraRest, initialCamera, reducedMotion, lowQuality, debug, handleRef} = props;
  const wrap = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLDivElement>(null);
  const scene = useRef<SceneApi | null>(null);
  const controlsRef = useRef<CameraControlsImpl | null>(null);
  const gesture = useRef<Gesture>('idle');
  const space = useRef(false);
  const press = useRef<{x: number; y: number; id: string | null; button: number; shift: boolean; pointer: number; pointerType: string} | null>(null);
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [marquee, setMarquee] = useState<Rect2 | null>(null);
  const [failure, setFailure] = useState('');
  const [cursor, setCursor] = useState<Vec3 | null>(null);
  const flyInput = useRef(new Set<string>());
  const invalidateRef = useRef<(() => void) | null>(null);

  const latest = useRef({tool, selection, onSelect, onMenu, props});
  latest.current = {tool, selection, onSelect, onMenu, props};
  const partsRef = useRef(parts);
  partsRef.current = parts;

  const boxOf = (ids: readonly string[]) => {
    const box = new Box3();
    for (const o of partsRef.current) {
      const def = getDefinition(o.definitionId);
      if (!def || !ids.includes(o.instanceId)) continue;
      const m = new Matrix4().compose(new Vector3(...o.transform.position), new Quaternion(...o.transform.rotation), new Vector3(1, 1, 1));
      const half = new Vector3(...def.dimensions).multiplyScalar(0.5);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) box.expandByPoint(new Vector3(half.x * sx, half.y * sy, half.z * sz).applyMatrix4(m));
    }
    return box;
  };
  const framing = (box: Box3 | null) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (!box || box.isEmpty()) { void controls.setLookAt(...DEFAULT_CAMERA.position, ...DEFAULT_CAMERA.target, !reducedMotion); return; }
    // Encuadra sin cambiar el ángulo de vista: se acerca o aleja a lo largo de la dirección actual de la cámara.
    const pos = new Vector3(), tgt = new Vector3();
    controls.getPosition(pos); controls.getTarget(tgt);
    const dir = pos.sub(tgt); if (dir.lengthSq() < 1e-8) dir.set(0.62, 0.5, 0.62);
    dir.normalize();
    const sphere = box.getBoundingSphere(new Sphere()), cam = controls.camera as PerspectiveCamera;
    const half = Math.min(cam.fov * Math.PI / 360, Math.atan(Math.tan(cam.fov * Math.PI / 360) * (cam.aspect || 1)));
    const distance = Math.max(0.22, (sphere.radius / Math.sin(half)) * 1.25);
    const to = sphere.center.clone().addScaledVector(dir, distance);
    void controls.setLookAt(to.x, to.y, to.z, sphere.center.x, sphere.center.y, sphere.center.z, !reducedMotion);
  };
  const cancelGesture = () => {
    if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; }
    press.current = null; gesture.current = 'idle'; setMarquee(null); scene.current?.cancel();
  };
  const viewTo = (view: ViewName) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = new Vector3(); controls.getTarget(target);
    const distance = Math.max(0.4, controls.distance);
    const [dx, dy, dz] = new Vector3(...VIEW_DIRECTIONS[view]).normalize().multiplyScalar(distance).toArray();
    void controls.setLookAt(target.x + dx, target.y + dy, target.z + dz, target.x, target.y, target.z, !reducedMotion);
  };
  useImperativeHandle(handleRef, () => ({
    frameSelection: () => framing(latest.current.selection.length ? boxOf(latest.current.selection) : null),
    frameAll: () => framing(partsRef.current.length ? boxOf(partsRef.current.map(o => o.instanceId)) : null),
    setView: viewTo,
    resetCamera: () => framing(null),
    cancelGesture,
    gesture: () => gesture.current,
    groundPoint: (cx, cy) => scene.current?.ground(cx, cy) ?? null,
    follow: point => {
      const c = controlsRef.current; if (!c) return;
      const p = new Vector3(), t = new Vector3(); c.getPosition(p); c.getTarget(t);
      const d = new Vector3(...point).sub(t).multiplyScalar(0.35); // suaviza: la cámara alcanza al robot en unos pocos cuadros
      void c.setLookAt(p.x + d.x, p.y + d.y, p.z + d.z, t.x + d.x, t.y + d.y, t.z + d.z, false);
    },
    frameRobot: points => {
      const c = controlsRef.current; if (!c || !points.length) return;
      const box = new Box3(); for (const q of points) box.expandByPoint(new Vector3(...q)); const ctr = box.getCenter(new Vector3()), r = Math.max(0.2, box.getSize(new Vector3()).length() / 2);
      const viewport = wrap.current?.getBoundingClientRect();
      const aspect = viewport && viewport.height > 0 ? viewport.width / viewport.height : 1;
      const portraitScale = Math.max(1, 0.8 / Math.max(0.2, aspect));
      const back = new Vector3(0.35, 0.55, -1).normalize().multiplyScalar(r * 3.4 * portraitScale);
      void c.setLookAt(ctr.x + back.x, ctr.y + back.y, ctr.z + back.z, ctr.x, ctr.y, ctr.z, !reducedMotion);
    },
    framePoints: points => { const box = new Box3(); for (const q of points) box.expandByPoint(new Vector3(...q)); box.expandByScalar(0.03); framing(box); },
  }), [reducedMotion]);

  // Espacio mantenido = desplazar (como Figma). Solo fuera de campos y ventanas.
  useEffect(() => {
    const editable = (t: EventTarget | null) => { const el = t as HTMLElement | null; return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) || !!el.closest?.('[role="dialog"],.cm-editor')); };
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && !editable(e.target)) { space.current = true; wrap.current?.classList.add('is-space'); e.preventDefault(); } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { space.current = false; wrap.current?.classList.remove('is-space'); } };
    const blur = () => { space.current = false; wrap.current?.classList.remove('is-space'); };
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); };
  }, []);

  // Trackpad: dos dedos orbitan (Shift: desplazan) y el pellizco hace zoom. El ratón sigue con la rueda = zoom (camera-controls).
  const [navMode, setNavMode] = useState<NavMode>(() => { try { return parseNavMode(localStorage.getItem(NAV_KEY)); } catch { return 'auto'; } });
  const navModeRef = useRef(navMode); navModeRef.current = navMode;
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const route = createWheelRouter(() => navModeRef.current);
    const wheel = (e: WheelEvent) => {
      const controls = controlsRef.current;
      if ((e.target as Element).closest?.('.rb-canvas-overlay') || !controls || !controls.enabled) return;
      const action = route(e, performance.now());
      if (action === 'native') return;
      e.preventDefault(); e.stopPropagation();
      const height = Math.max(1, el.clientHeight);
      if (action === 'zoom') {
        const distance = controls.distance, to = Math.min(controls.maxDistance, Math.max(controls.minDistance, distance * zoomFactor(e)));
        void controls.dolly(distance - to, false);
      } else if (action === 'orbit') {
        void controls.rotate(ORBIT_PER_HEIGHT * e.deltaX / height, ORBIT_PER_HEIGHT * e.deltaY / height, false);
      } else if (!latest.current.props.flying) {
        const cam = controls.camera as PerspectiveCamera, k = controls.distance * Math.tan(cam.fov * Math.PI / 360) * 2 / height;
        void controls.truck(e.deltaX * k, e.deltaY * k, false);
      }
      invalidateRef.current?.(); // la escena se dibuja solo cuando cambia algo: avisa del movimiento de cámara
    };
    el.addEventListener('wheel', wheel, {capture: true, passive: false});
    return () => el.removeEventListener('wheel', wheel, {capture: true});
  }, []);
  const cycleNav = () => setNavMode(m => { const n = nextNavMode(m); try { localStorage.setItem(NAV_KEY, n); } catch { /* sin almacenamiento: queda solo en esta sesión */ } return n; });

  const finish = (e: PointerEvent) => {
    const start = press.current, api = scene.current;
    if (!start || e.pointerId !== start.pointer || !api) return;
    const box = wrap.current!.getBoundingClientRect();
    const x = e.clientX - box.left, y = e.clientY - box.top, moved = Math.hypot(x - start.x, y - start.y);
    const g = gesture.current, cur = latest.current;
    cancelGesture();
    const release = classifyRelease(start.button, moved);
    if (start.button === 2 && release === 'context-menu') { cur.onMenu({x: e.clientX, y: e.clientY}, start.id); return; }
    if (g === 'marquee' && release === 'drag') {
      const ids = api.boxSelect(rectFromPoints(start.x, start.y, x, y));
      cur.onSelect(start.shift ? Array.from(new Set([...cur.selection, ...ids])) : ids);
    } else if (release === 'click' && start.button === 0 && g !== 'panning') {
      if (start.id?.startsWith('wire:')) cur.props.onSelectWire(start.id.slice(5));
      else cur.onSelect(nextSelection(cur.selection, start.id, start.shift));
    }
  };
  const move = (e: PointerEvent) => {
    const start = press.current;
    if (!start || e.pointerId !== start.pointer) return;
    const box = wrap.current!.getBoundingClientRect();
    const x = e.clientX - box.left, y = e.clientY - box.top;
    if (longPress.current && Math.hypot(x - start.x, y - start.y) > 8) { clearTimeout(longPress.current); longPress.current = null; }
    if (gesture.current === 'marquee' && Math.hypot(x - start.x, y - start.y) > MOVE_THRESHOLD_PX) setMarquee(rectFromPoints(start.x, start.y, x, y));
  };
  // Con la herramienta Cable/Medir: pin bajo el puntero (etiqueta) y extremo suelto del cable a medio hacer.
  const hover = useRef({frame: 0, x: 0, y: 0});
  const onWrapMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const t = latest.current.tool, api = scene.current, el = wrap.current;
    if (!api || !el || (t !== 'wire' && t !== 'measure')) return;
    hover.current.x = e.clientX; hover.current.y = e.clientY;
    if (hover.current.frame) return;
    hover.current.frame = requestAnimationFrame(() => {
      hover.current.frame = 0;
      const box = el.getBoundingClientRect(), {x, y} = hover.current, pin = api.pickPin(x - box.left, y - box.top);
      latest.current.props.onPinHover(pin, {x, y});
      const pend = latest.current.props.pending;
      setCursor(pend && !pin ? api.cursorOn(x, y, pend) : pend && pin ? (latest.current.props.pins.find(m => m.ref.instanceId === pin.instanceId && m.ref.pinId === pin.pinId)?.pos ?? null) : null);
    });
  };
  useEffect(() => {
    addEventListener('pointerup', finish); addEventListener('pointercancel', cancelGesture); addEventListener('pointermove', move);
    return () => { removeEventListener('pointerup', finish); removeEventListener('pointercancel', cancelGesture); removeEventListener('pointermove', move); };
  }, []);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    const api = scene.current, el = wrap.current;
    if (!api || !el || (e.target as Element).closest('.rb-canvas-overlay')) return;
    if (!e.isPrimary) { if (longPress.current) { clearTimeout(longPress.current); longPress.current = null; } return; }
    const box = el.getBoundingClientRect(), x = e.clientX - box.left, y = e.clientY - box.top;
    if (e.button === 0 && (latest.current.tool === 'wire' || latest.current.tool === 'measure')) { const pin = api.pickPin(x, y); if (pin) { latest.current.props.onPinClick(pin); return; } }
    if (e.button === 0 && api.gizmoHot(x, y)) return; // el gizmo se queda con el gesto: la cámara y la selección no intervienen
    const id = api.pick(x, y);
    const pointerType = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
    const next = startGesture(gesture.current, {button: Math.min(e.button, 2) as 0 | 1 | 2, target: id ? 'object' : 'empty', shift: e.shiftKey, alt: e.altKey, space: space.current, tool: latest.current.tool, pointerType});
    if (next === gesture.current) return;
    gesture.current = next;
    press.current = {x, y, id, button: e.button, shift: e.shiftKey, pointer: e.pointerId, pointerType};
    api.configure(next, e.button, pointerType);
    if (!latest.current.props.flying && (pointerType === 'touch' || (id && e.button === 0 && !space.current && (latest.current.tool === 'select' || latest.current.tool === 'move'))) && e.isPrimary) {
      longPress.current = setTimeout(() => {
        longPress.current = null;
        const start = press.current;
        const hits = api.pickParts(x, y);
        cancelGesture();
        if (hits.length && latest.current.props.onInspectParts) { latest.current.props.onInspectParts(hits); return; }
        latest.current.onMenu({x: e.clientX, y: e.clientY}, start?.id ?? id);
      }, LONG_PRESS_MS);
    }
  };

  // Con la escena quieta (armando, sin simulación) no se dibuja en cada cuadro: R3F repinta solo cuando cambia algo (piezas, selección, cámara).
  // Siguen en continuo la simulación (LED, servos, escenario), la primera persona y los fantasmas con pulso.
  const animated = !!(props.flying || props.live || props.room || props.ghostWire || props.assemblyGhosts?.length);
  if (failure) return <div className="rb-gl-error" role="alert"><strong>No se pudo mostrar la pizarra 3D</strong><p>{failure}</p><button type="button" onClick={() => { setFailure(''); onContextLost(); }}>Reintentar</button></div>;
  return <div ref={wrap} className={`rb-canvas${tool === 'hand' ? ' is-hand' : ''}`} data-gesture-state="idle" onPointerDownCapture={down} onPointerMove={onWrapMove} onPointerLeave={() => props.onPinHover(null, {x: 0, y: 0})} onContextMenu={e => e.preventDefault()}>
    <Boundary onError={setFailure}>
      <Canvas
        frameloop={animated ? 'always' : 'demand'}
        dpr={lowQuality ? 1 : [1, 1.75]}
        camera={{fov: 45, near: 0.01, far: 200, position: initialCamera?.position ?? DEFAULT_CAMERA.position}}
        gl={{antialias: !lowQuality, powerPreference: 'high-performance', alpha: false}}
        onCreated={({gl}) => { gl.domElement.addEventListener('webglcontextlost', ev => { ev.preventDefault(); setFailure('El navegador perdió el contexto gráfico (WebGL). Pasa a veces con poca memoria de video.'); }); }}
        onError={() => setFailure('Falló el motor gráfico.')}>
        <color attach="background" args={['#eef1f4']} />
        <Scene {...{invalidateRef, parts, selection, sceneRef: scene, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap, interfering: props.interfering, joinPoints: props.joinPoints, ghost: props.ghost, gizmo: props.gizmo, onGizmoDrag: props.onGizmoDrag, onGizmoCommit: props.onGizmoCommit, wires: props.wires, ghostWire: props.ghostWire, pins: props.pins, highlight: props.highlight, pending: props.pending, probes: props.probes, cursor, tool, flying: props.flying, flyInput, live: props.live, room: props.room, assemblyGhosts: props.assemblyGhosts, assemblyNext: props.assemblyNext}} />
      </Canvas>
    </Boundary>
    {marquee && <div className="rb-marquee" style={{left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h}} />}
    <ViewCube cubeRef={cube} onView={viewTo} />
    <button type="button" className="rb-nav-mode rb-canvas-overlay" data-nav-mode={navMode} onClick={cycleNav} title="Control de cámara. Auto reconoce el trackpad: dos dedos orbitan, Shift + dos dedos desplaza, pellizcar acerca. Clic para cambiar." aria-label={`Control de cámara: ${NAV_LABEL[navMode]}. Cambiar`}>{NAV_LABEL[navMode]}</button>

  </div>;
}

type TransformControlsLike = {object?: Object3D; axis: string | null; dragging: boolean; pointerHover(p: {x: number; y: number; button: number}): void};

function Scene({invalidateRef, parts, selection, sceneRef, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap, interfering, joinPoints, ghost, gizmo, onGizmoDrag, onGizmoCommit, wires, ghostWire, pins, highlight, pending, probes, cursor, tool, flying, flyInput, live, room, assemblyGhosts, assemblyNext}: {
  invalidateRef: MutableRefObject<(() => void) | null>;
  assemblyGhosts?: PartInstance[]; assemblyNext?: string;
  parts: PartInstance[]; selection: string[]; sceneRef: MutableRefObject<SceneApi | null>; controlsRef: MutableRefObject<CameraControlsImpl | null>; cube: MutableRefObject<HTMLDivElement | null>;
  onAnchor(p: {x: number; y: number} | null): void; onCameraRest(c: CameraState): void; initialCamera?: CameraState; debug: boolean; wrap: MutableRefObject<HTMLDivElement | null>;
  interfering: ReadonlySet<string>; joinPoints: Vec3[]; ghost: Ghost | null; gizmo: GizmoState | null; onGizmoDrag(m: Transform): void; onGizmoCommit(m: Transform): void;
  wires: WireView[]; ghostWire?: GhostWireView | null; pins: PinMarker[]; highlight: ReadonlySet<string>; pending: Vec3 | null; probes: {a: Vec3 | null; b: Vec3 | null}; cursor: Vec3 | null; tool: ToolId; flying: boolean; flyInput: MutableRefObject<Set<string>>; live?: {leds: Record<string, number>; servos?: Record<string, number>; controls?: Record<string, number>; displays?: Record<string, {frame: Uint8Array; on: boolean}>}; room?: RoomView;
}) {
  const flyingRef = useRef(flying); flyingRef.current = flying;
  const eye = useRef(new Vector3());
  const {camera, gl, scene, invalidate} = useThree();
  invalidateRef.current = invalidate;
  const group = useRef<Group>(null);
  const wiresGroup = useRef<Group>(null);
  const pinsRef = useRef(pins); pinsRef.current = pins;
  const pivot = useRef<Group>(null);
  const tc = useRef<TransformControlsLike | null>(null);
  const last = useRef<{x: number; y: number} | null>(null);
  const raycaster = useRef(new Raycaster());
  const selectionRef = useRef(selection); selectionRef.current = selection;
  const drag = useRef<{p: Vector3; q: Quaternion; motion: Transform | null} | null>(null);
  const latest = useRef({gizmo, onGizmoDrag, onGizmoCommit}); latest.current = {gizmo, onGizmoDrag, onGizmoCommit};

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.dollyToCursor = true;
    controls.minDistance = 0.12; controls.maxDistance = 40;
    controls.smoothTime = 0.1; controls.draggingSmoothTime = 0.05;
    const A = (controls.constructor as typeof CameraControlsImpl).ACTION;
    // El botón izquierdo y el toque de un dedo los reparte la máquina de estados (BuildCanvas): aquí quedan en reposo.
    controls.mouseButtons.left = A.NONE; controls.mouseButtons.middle = A.TRUCK; controls.mouseButtons.right = A.ROTATE; controls.mouseButtons.wheel = A.DOLLY;
    controls.touches.one = A.NONE; controls.touches.two = A.TOUCH_DOLLY_TRUCK; controls.touches.three = A.NONE;
    const start = initialCamera ?? DEFAULT_CAMERA;
    void controls.setLookAt(...start.position, ...start.target, false);
    const rest = () => { const p = new Vector3(), t = new Vector3(); controls.getPosition(p); controls.getTarget(t); const r = (v: Vector3): Vec3 => [Math.round(v.x * 1000) / 1000, Math.round(v.y * 1000) / 1000, Math.round(v.z * 1000) / 1000]; if (!flyingRef.current) onCameraRest({position: r(p), target: r(t)}); }; // en primera persona el objetivo está a 5 cm: no se guarda
    controls.addEventListener('sleep', rest);
    return () => controls.removeEventListener('sleep', rest);
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const ndc = (x: number, y: number) => { const r = dom.getBoundingClientRect(); return new Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1); };
    const idOf = (o: Object3D | null): string | null => { for (let n = o; n; n = n.parent) { if (n.userData.partId) return n.userData.partId as string; if (n.userData.wireId) return `wire:${n.userData.wireId as string}`; } return null; };
    const floor = new Plane(new Vector3(0, 1, 0), 0);
    sceneRef.current = {
      pickParts: (x, y) => {
        raycaster.current.setFromCamera(ndc(x, y), camera);
        return [...new Set(raycaster.current.intersectObjects(group.current?.children ?? [], true).map(h => idOf(h.object)).filter((id): id is string => !!id))];
      },
      pick: (x, y) => {
        if (!group.current) return null;
        raycaster.current.setFromCamera(ndc(x, y), camera);
        const hit = raycaster.current.intersectObjects([...group.current.children, ...(wiresGroup.current?.children ?? [])], true)[0];
        return hit ? idOf(hit.object) : null;
      },
      boxSelect: rect => {
        const r = dom.getBoundingClientRect(), found: string[] = [];
        for (const child of group.current?.children ?? []) {
          const box = new Box3().setFromObject(child), corners: Vector3[] = [];
          for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new Vector3(x, y, z).project(camera));
          if (corners.some(c => c.z > 1)) continue;
          const xs = corners.map(c => ((c.x + 1) / 2) * r.width), ys = corners.map(c => ((1 - c.y) / 2) * r.height);
          if (rectsIntersect(rect, {x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys)})) { const id = idOf(child); if (id) found.push(id); }
        }
        return found;
      },
      // Las asas del gizmo viven en su propio objeto: se consulta con su propio rayo para no confundirlas con el vacío.
      gizmoHot: (x, y) => {
        const t = tc.current;
        if (!t?.object || t.dragging) return !!t?.dragging;
        const p = ndc(x, y);
        t.pointerHover({x: p.x, y: p.y, button: -1});
        return t.axis !== null;
      },
      configure: (g, button, pointerType) => {
        const controls = controlsRef.current;
        if (!controls) return;
        const A = (controls.constructor as typeof CameraControlsImpl).ACTION;
        controls.enabled = true;
        if (pointerType === 'touch') controls.touches.one = g === 'orbiting' ? A.TOUCH_ROTATE : g === 'panning' ? A.TOUCH_TRUCK : A.NONE;
        else if (button === 0) controls.mouseButtons.left = g === 'panning' ? A.TRUCK : g === 'orbiting' ? A.ROTATE : A.NONE;
        wrap.current?.setAttribute('data-gesture-state', g);
      },
      cancel: () => {
        const controls = controlsRef.current;
        if (controls && !tc.current?.dragging) { controls.enabled = false; controls.enabled = true; }
        wrap.current?.setAttribute('data-gesture-state', 'idle');
      },
      // Pin más cercano al puntero en pantalla (radio 15 px → blanco de ≥ 30 px, por encima de los 24 px pedidos).
      pickPin: (x, y) => {
        const r = dom.getBoundingClientRect(); let best: PinRef | null = null, bestD = 15;
        const v = new Vector3();
        for (const m of pinsRef.current) {
          v.set(...m.pos).project(camera);
          if (v.z > 1) continue;
          const d = Math.hypot(((v.x + 1) / 2) * r.width - x, ((1 - v.y) / 2) * r.height - y);
          if (d < bestD) { bestD = d; best = m.ref; }
        }
        return best;
      },
      // Punto del espacio bajo el puntero, en el plano que mira a la cámara y pasa por `through` (extremo suelto del cable).
      cursorOn: (cx, cy, through) => {
        const r = dom.getBoundingClientRect();
        raycaster.current.setFromCamera(new Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
        const normal = camera.getWorldDirection(new Vector3()), plane = new Plane().setFromNormalAndCoplanarPoint(normal, new Vector3(...through)), out = new Vector3();
        return raycaster.current.ray.intersectPlane(plane, out) ? [out.x, out.y, out.z] : null;
      },
      ground: (cx, cy) => {
        const r = dom.getBoundingClientRect();
        if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return null;
        raycaster.current.setFromCamera(new Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
        const out = new Vector3();
        return raycaster.current.ray.intersectPlane(floor, out) ? [out.x, 0, out.z] : null;
      },
    };
    return () => { sceneRef.current = null; };
  }, [camera, gl]);

  // Posición en pantalla de la selección (barra contextual) y orientación del cubo de vistas.
  const tmp = useRef({box: new Box3(), v: new Vector3()});
  useFrame(() => {
    if (cube.current) {
      const e = camera.matrixWorldInverse.elements;
      cube.current.style.transform = `matrix3d(${e[0]},${-e[1]},${e[2]},0,${-e[4]},${e[5]},${-e[6]},0,${e[8]},${-e[9]},${e[10]},0,0,0,0,1)`;
    }
    const ids = selectionRef.current;
    if (!ids.length || !group.current || drag.current) { if (!ids.length && last.current) { last.current = null; onAnchor(null); } return; }
    const t = tmp.current; t.box.makeEmpty();
    for (const child of group.current.children) if (ids.includes(child.userData.partId)) t.box.union(new Box3().setFromObject(child));
    if (t.box.isEmpty()) return;
    t.box.getCenter(t.v); t.v.y = t.box.max.y; t.v.project(camera);
    const r = gl.domElement.getBoundingClientRect();
    const p = {x: ((t.v.x + 1) / 2) * r.width, y: ((1 - t.v.y) / 2) * r.height};
    if (t.v.z > 1) { if (last.current) { last.current = null; onAnchor(null); } return; }
    if (!last.current || Math.abs(last.current.x - p.x) > 1 || Math.abs(last.current.y - p.y) > 1) { last.current = p; onAnchor(p); }
  });

  useEffect(() => {
    if (!debug) return;
    (window as unknown as {__modoRobotics?: unknown}).__modoRobotics = {
      camera: () => { const c = controlsRef.current!, p = new Vector3(), t = new Vector3(); c.getPosition(p); c.getTarget(t); return {position: p.toArray(), target: t.toArray(), distance: c.distance}; },
      screenOf: (id: string) => { const o = group.current?.children.find(c => c.userData.partId === id); if (!o) return null; const v = new Vector3(); new Box3().setFromObject(o).getCenter(v); v.project(camera); const r = gl.domElement.getBoundingClientRect(); return {x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height}; },
      renderer: () => { const g = gl.getContext(); const ext = g.getExtension('WEBGL_debug_renderer_info'); return ext ? String(g.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'desconocido'; },
      objects: () => scene.children.length,
      gizmoRaw: () => tc.current,
      gizmoState: () => { const t = tc.current; return t ? {dragging: t.dragging, axis: t.axis, hasObject: !!t.object, pivot: pivot.current?.position.toArray(), drag: !!drag.current, camEnabled: controlsRef.current?.enabled} : null; },
      partIds: () => (group.current?.children ?? []).map(c => c.userData.partId as string),
      thumbnail: (id: string) => { const object = group.current?.children.find(c => c.userData.partId === id); return object ? renderThumbnail(gl, object) : null; },
      /** Posición mundial real de la pieza dibujada (para comprobar que el 3D sigue a la física). */
      partWorld: (id: string) => { const o = group.current?.children.find(c => c.userData.partId === id); return o ? o.getWorldPosition(new Vector3()).toArray() : null; },
      pinScreen: (instanceId: string, pinId: string) => { const m = pinsRef.current.find(q => q.ref.instanceId === instanceId && q.ref.pinId === pinId); if (!m) return null; const v = new Vector3(...m.pos).project(camera), r = gl.domElement.getBoundingClientRect(); return {x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height}; },
      /** Cable fantasma de la guía de cableado (null si no hay): puntos y color. */
      ghostWire: () => { let v: {points: number[][]; color: string} | null = null; scene.traverse(o => { if (o.userData.ghostWire) v = {points: o.userData.points as number[][], color: o.userData.color as string}; }); return v; },
      /** Píxeles encendidos en la textura de la pantalla OLED dibujada (null si no hay). */
      oledLit: (id: string) => { const g = group.current?.children.find(c => c.userData.partId === id); let v: number | null = null; g?.traverse(o => { if (o.userData.oledScreen) v = o.userData.oledLit as number; }); return v; },
      /** Giro horizontal (°) de la pieza dibujada, medido desde su eje +z: sirve para comprobar que la cabeza gira con el cuello. */
      partYaw: (id: string) => { const o = group.current?.children.find(c => c.userData.partId === id); if (!o) return null; const f = new Vector3(0, 0, 1).applyQuaternion(o.getWorldQuaternion(new Quaternion())); return Math.atan2(f.x, f.z) * 180 / Math.PI; },
      wireCount: () => wiresGroup.current?.children.length ?? 0,
      /** Intensidad emisiva real del LED dibujado (para comprobar que el 3D refleja el modelo). */
      ledGlow: (id: string) => { const g = group.current?.children.find(c => c.userData.partId === id); let v: number | null = null; g?.traverse(o => { if (o.userData.glowMesh) v = ((o as unknown as {material: {emissiveIntensity: number}}).material.emissiveIntensity); }); return v; },
      /** Ángulo (°) del eje del servo tal como está dibujado (para comprobar que el 3D sigue al modelo). */
      servoHorn: (id: string) => { const g = group.current?.children.find(c => c.userData.partId === id); let v: number | null = null; g?.traverse(o => { if (o.userData.servoHorn) v = o.rotation.y * 180 / Math.PI + 90; }); return v; },
      /** Posición del cursor (0–1) del potenciómetro tal como está dibujado. */
      potKnob: (id: string) => { const g = group.current?.children.find(c => c.userData.partId === id); let v: number | null = null; g?.traverse(o => { if (o.userData.potKnob) v = 0.5 - o.rotation.y * 180 / Math.PI / 270; }); return v; },
      wires: () => (wiresGroup.current?.children ?? []).map(c => ({id: c.userData.wireId as string, points: c.userData.points as number[][]})),
      /** Busca en pantalla un punto sobre un asa del gizmo (X, Y, Z, XY…), para poder arrastrarla en las pruebas. */
      findGizmoPoint: (axis: string) => {
        const t = tc.current, o = pivot.current;
        if (!t?.object || !o) return null;
        const c = o.position.clone().project(camera), r = gl.domElement.getBoundingClientRect(), cx = ((c.x + 1) / 2) * r.width, cy = ((1 - c.y) / 2) * r.height;
        let best: {x: number; y: number; d: number} | null = null;
        for (let dy = -170; dy <= 170; dy += 4) for (let dx = -170; dx <= 170; dx += 4) {
          t.pointerHover({x: ((cx + dx) / r.width) * 2 - 1, y: -((cy + dy) / r.height) * 2 + 1, button: -1});
          if (t.axis === axis) { const d = Math.hypot(dx, dy); if (!best || d > best.d) best = {x: r.left + cx + dx, y: r.top + cy + dy, d}; }
        }
        t.pointerHover({x: 5, y: 5, button: -1});
        return best;
      },
    };
    return () => { delete (window as unknown as {__modoRobotics?: unknown}).__modoRobotics; };
  }, [debug, camera, gl, scene]);

  // ───── Cámara en primera persona ─────
  // Truco: el «objetivo» de camera-controls se coloca a 5 cm delante de la cámara; así girar con el botón derecho es mirar alrededor
  // y la rueda avanza/retrocede por donde miras. Al salir, el objetivo vuelve a un punto de la escena para que órbita y zoom funcionen igual.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !flying) return;
    const pos = new Vector3(), tgt = new Vector3();
    controls.getPosition(pos); controls.getTarget(tgt);
    const dir = tgt.clone().sub(pos).normalize();
    eye.current.copy(pos); controls.minDistance = 0.02; controls.dollyToCursor = false;
    void controls.setLookAt(pos.x, pos.y, pos.z, pos.x + dir.x * 0.05, pos.y + dir.y * 0.05, pos.z + dir.z * 0.05, false);
    const keys = flyInput.current;
    const map: Record<string, string> = {KeyW: 'f', KeyS: 'b', KeyA: 'l', KeyD: 'r', KeyE: 'u', KeyQ: 'd'};
    const key = (down: boolean) => (e: KeyboardEvent) => {
      if (e.shiftKey) keys.add('fast'); else keys.delete('fast');
      const k = map[e.code];
      if (!k || e.ctrlKey || e.metaKey || e.altKey || shortcutsDisabled(describeTarget(e.target as Element))) return;
      e.preventDefault(); if (down) keys.add(k); else keys.delete(k);
    };
    const kd = key(true), ku = key(false), clear = () => keys.clear();
    addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('blur', clear);
    return () => {
      removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('blur', clear); keys.clear();
      const p = new Vector3(), t = new Vector3(); controls.getPosition(p); controls.getTarget(t);
      const d = t.clone().sub(p).normalize(); let far = 0.6;
      if (d.y < -0.05) far = Math.min(3, Math.max(0.3, (0.02 - p.y) / d.y)); // si miras al suelo, el objetivo cae en el suelo
      controls.minDistance = 0.12; controls.dollyToCursor = true;
      void controls.setLookAt(p.x, p.y, p.z, p.x + d.x * far, p.y + d.y * far, p.z + d.z * far, false);
    };
  }, [flying]);
  useFrame((_, delta) => {
    const controls = controlsRef.current, keys = flyInput.current;
    if (!flyingRef.current || !controls) return;
    const pos = new Vector3(), tgt = new Vector3(); controls.getPosition(pos); controls.getTarget(tgt);
    // Mirar = girar sobre el sitio: camera-controls orbita alrededor del objetivo (a 5 cm), así que se vuelve a poner la cámara en su sitio
    // con la nueva dirección. Si la distancia cambió es la rueda (avanzar): esa posición pasa a ser la nueva.
    const dir = tgt.clone().sub(pos), d = dir.length();
    if (d > 1e-9) {
      dir.divideScalar(d);
      if (Math.abs(d - 0.05) > 1e-4) { eye.current.copy(pos); void controls.setLookAt(pos.x, pos.y, pos.z, pos.x + dir.x * 0.05, pos.y + dir.y * 0.05, pos.z + dir.z * 0.05, false); }
      else if (pos.distanceTo(eye.current) > 1e-5) { const e = eye.current; void controls.setLookAt(e.x, e.y, e.z, e.x + dir.x * 0.05, e.y + dir.y * 0.05, e.z + dir.z * 0.05, false); pos.copy(e); tgt.set(e.x + dir.x * 0.05, e.y + dir.y * 0.05, e.z + dir.z * 0.05); }
    }
    if (!keys.size) return;
    const forward = new Vector3(tgt.x - pos.x, 0, tgt.z - pos.z);
    if (forward.lengthSq() < 1e-10) return;
    forward.normalize();
    const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize(), move = new Vector3();
    if (keys.has('f')) move.add(forward); if (keys.has('b')) move.sub(forward); if (keys.has('r')) move.add(right); if (keys.has('l')) move.sub(right);
    if (keys.has('u')) move.y += 1; if (keys.has('d')) move.y -= 1;
    if (!move.lengthSq()) return;
    move.normalize().multiplyScalar((keys.has('fast') ? 1.2 : 0.35) * Math.min(delta, 0.05)); // m/s: el robot mide ~0,2 m
    if (pos.y + move.y < 0.02) move.y = 0.02 - pos.y; // no se atraviesa el suelo
    pos.add(move); tgt.add(move); eye.current.copy(pos);
    void controls.setLookAt(pos.x, pos.y, pos.z, tgt.x, tgt.y, tgt.z, false);
  });

  // Movimiento del gizmo: se calcula a partir del pivote y se entrega al proyecto (vista previa al arrastrar, confirmación al soltar).
  const motionOf = (): Transform | null => {
    const d = drag.current, o = pivot.current, g = latest.current.gizmo;
    if (!d || !o || !g) return null;
    if (g.mode === 'translate') return {position: [o.position.x - d.p.x, o.position.y - d.p.y, o.position.z - d.p.z], rotation: [0, 0, 0, 1]};
    const q = o.quaternion.clone().multiply(d.q.clone().invert());
    const c = d.p;
    const rc = c.clone().applyQuaternion(q);
    return {position: [c.x - rc.x, c.y - rc.y, c.z - rc.z], rotation: [q.x, q.y, q.z, q.w]};
  };

  return <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[2, 4, 3]} intensity={1.4} />
    <directionalLight position={[-2, 2, -1]} intensity={0.35} />
    <Grid position={[0, 0, 0]} args={[10, 10]} cellSize={0.1} cellThickness={0.6} cellColor="#c9d1d8" sectionSize={0.5} sectionThickness={1} sectionColor="#9fb0bc" fadeDistance={6} fadeStrength={1.5} infiniteGrid />
    {room && <RoomLayer room={room} />}
    {room?.lineTrack && <LineTrackMesh track={room.lineTrack} />}
    <CameraControls ref={controlsRef as never} makeDefault />
    <group ref={group}>
      {parts.map(p => <PartMesh key={p.instanceId} part={p} selected={selection.includes(p.instanceId)} interfering={interfering.has(p.instanceId)} glow={live?.leds[p.instanceId]} servoAngle={live?.servos?.[p.instanceId]} control={live?.controls?.[p.instanceId]} display={live?.displays?.[p.instanceId]} showPins={tool === 'wire' || tool === 'measure'} />)}
    </group>
    {assemblyGhosts?.map(p => <AssemblyGhost key={p.instanceId} part={p} active={p.instanceId === assemblyNext} />)}
    <group ref={wiresGroup}>{wires.map(w => <WireTube key={w.id} wire={w} />)}</group>
    {ghostWire && <GhostWire wire={ghostWire} />}
    {(tool === 'wire' || tool === 'measure' || highlight.size > 0) && <PinPoints pins={tool === 'wire' || tool === 'measure' ? pins : pins.filter(m => highlight.has(`${m.ref.instanceId}:${m.ref.pinId}`))} highlight={highlight} pending={pending} probes={probes} />}
    {pending && cursor && <Line points={[pending, cursor]} color="#2563eb" lineWidth={2} dashed dashSize={0.008} gapSize={0.005} depthTest={false} />}
    {ghost && <GhostMesh definitionId={ghost.definitionId} position={ghost.position} valid={ghost.valid} />}
    {joinPoints.map((p, i) => <mesh key={i} position={p} raycast={() => null}><sphereGeometry args={[0.006, 16, 12]} /><meshBasicMaterial color="#2563eb" transparent opacity={0.85} depthTest={false} /></mesh>)}
    {gizmo && <>
      <group ref={pivot} key={`pv${gizmo.key}`} position={gizmo.pivot} />
      <TransformControls key={`tc${gizmo.key}-${gizmo.mode}`} ref={tc as never} object={pivot as never} mode={gizmo.mode} space="world" size={0.8}
        translationSnap={gizmo.snapM ?? undefined} rotationSnap={gizmo.snapRad ?? undefined}
        onMouseDown={() => { const o = pivot.current; if (o) drag.current = {p: o.position.clone(), q: o.quaternion.clone(), motion: null}; }}
        onObjectChange={() => { const m = motionOf(); if (m && drag.current) { drag.current.motion = m; latest.current.onGizmoDrag(m); } }}
        onMouseUp={() => { const m = drag.current?.motion ?? null; drag.current = null; if (m && (Math.hypot(...m.position) > 1e-9 || Math.abs(m.rotation[3]) < 1 - 1e-9)) latest.current.onGizmoCommit(m); else latest.current.onGizmoDrag({position: ZERO, rotation: [0, 0, 0, 1]}); }} />
    </>}
  </>;
}

/** Cubo blanco: suelo claro, paredes translúcidas, obstáculos y el haz del HC-SR04 (todo sale del proyecto y de la física, nada decorativo). */
function RoomLayer({room}: {room: RoomView}) {
  const wall = (key: string, at: Vec3, size: Vec3) => <mesh key={key} position={at} raycast={() => null}><boxGeometry args={size} /><meshStandardMaterial color="#ffffff" transparent opacity={0.28} roughness={0.9} depthWrite={false} /></mesh>;
  const h = ROOM_HALF, t = 0.1, w = WALL_H;
  return <>
    <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}><planeGeometry args={[h * 2, h * 2]} /><meshStandardMaterial color="#ffffff" roughness={0.95} /></mesh>
    {wall('n', [0, w / 2, h + t / 2], [h * 2 + t * 2, w, t])}{wall('s', [0, w / 2, -h - t / 2], [h * 2 + t * 2, w, t])}{wall('e', [h + t / 2, w / 2, 0], [t, w, h * 2])}{wall('w', [-h - t / 2, w / 2, 0], [t, w, h * 2])}
    {room.obstacles.map(o => <mesh key={o.id} position={o.transform.position} quaternion={o.transform.rotation} raycast={() => null}>
      {o.shape === 'cylinder' ? <cylinderGeometry args={[o.size[0] / 2, o.size[0] / 2, o.size[1], 32]} /> : <boxGeometry args={o.size} />}
      <meshStandardMaterial color={o.id === room.selected ? '#2f8fd0' : '#e6a23c'} roughness={0.7} /></mesh>)}
    {room.beams.map((b, i) => { const d = b.distance ?? 4, end: Vec3 = [b.origin[0] + b.dir[0] * d, b.origin[1] + b.dir[1] * d, b.origin[2] + b.dir[2] * d];
      return <Line key={i} points={[b.origin, end]} color={b.distance === null ? '#9aa4ad' : '#e0453a'} lineWidth={1.5} transparent opacity={0.7} depthTest={false} />; })}
  </>;
}

/** Misma curva para el cable real y para su espectro: pasa por los pines y, si solo hay dos puntos, se arquea hacia arriba. */
function wireCurve(points: Vec3[]) {
  const pts = points.map(q => new Vector3(...q));
  if (pts.length === 2 && pts[0].distanceTo(pts[1]) > 0.003) { const mid = pts[0].clone().add(pts[1]).multiplyScalar(0.5); mid.y += 0.02 + 0.18 * pts[0].distanceTo(pts[1]); pts.splice(1, 0, mid); }
  return new CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
}

/** Cable fantasma de la guía: tubo translúcido del color que hay que usar, con un pulso suave y un anillo en cada pin (como las piezas fantasma del armado). */
function GhostWire({wire}: {wire: GhostWireView}) {
  const key = JSON.stringify(wire.points), curve = useMemo(() => wireCurve(wire.points), [key]);
  const tube = useRef<Mesh>(null), halo = useRef<Mesh>(null);
  useFrame(({clock}) => {
    const k = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3.2);
    const a = tube.current?.material as MeshBasicMaterial | undefined, b = halo.current?.material as MeshBasicMaterial | undefined;
    if (a) a.opacity = 0.35 + 0.3 * k; if (b) b.opacity = 0.08 + 0.12 * k;
  });
  if (wire.points.length < 2 || new Vector3(...wire.points[0]).distanceToSquared(new Vector3(...wire.points[wire.points.length - 1])) < 1e-10) return null;
  const ends = [wire.points[0], wire.points[wire.points.length - 1]];
  return <group userData={{ghostWire: true, points: wire.points, color: wire.color}} raycast={() => null}>
    <mesh ref={tube} raycast={() => null} renderOrder={15}><tubeGeometry args={[curve, 32, 0.0016, 8, false]} /><meshBasicMaterial color={wire.color} transparent opacity={0.5} depthWrite={false} depthTest={false} /></mesh>
    <mesh ref={halo} raycast={() => null} renderOrder={14}><tubeGeometry args={[curve, 24, 0.0042, 8, false]} /><meshBasicMaterial color="#2563eb" transparent opacity={0.15} depthWrite={false} depthTest={false} /></mesh>
    {ends.map((at, i) => <mesh key={i} position={at} raycast={() => null} renderOrder={16}><sphereGeometry args={[0.0042, 16, 12]} /><meshBasicMaterial color="#2563eb" transparent opacity={0.55} depthWrite={false} depthTest={false} /></mesh>)}
  </group>;
}

/** Cable: tubo que pasa por las posiciones mundiales de sus pines y por los puntos de control; sin puntos, hace una curva suave hacia arriba. */
function WireTube({wire}: {wire: WireView}) {
  const key = JSON.stringify(wire.points), curve = useMemo(() => wireCurve(wire.points), [key]);
  if (wire.points.length === 2 && new Vector3(...wire.points[0]).distanceToSquared(new Vector3(...wire.points[1])) < 1e-10) return <group userData={{wireId: wire.id, points: wire.points}} />;
  // Dupont sleeves only on header connections, never over the screw terminals.
  const plugs = [0, 1].flatMap(end => {
    if (wire.points.length === 2 && new Vector3(...wire.points[0]).distanceToSquared(new Vector3(...wire.points[1])) < 0.000009) return [];
    const pos = wire.points[end === 0 ? 0 : wire.points.length - 1];
    if (!pos) return [];
    if (!wire.connectorEnds?.[end]) return [];
    const dir = curve.getTangent(end).multiplyScalar(end === 0 ? 1 : -1);
    if (dir.lengthSq() < 1e-12) return [];
    const rotation = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    return [<group key={end} position={pos} quaternion={rotation}>
      <mesh position={[0, 0.003, 0]}><boxGeometry args={[0.0022, 0.006, 0.0022]} /><meshStandardMaterial color="#24282c" roughness={0.65} /></mesh>
      <mesh position={[0, 0.0012, 0.00111]}><boxGeometry args={[0.0007, 0.0015, 0.00012]} /><meshStandardMaterial color="#b29a62" metalness={0.55} roughness={0.4} /></mesh>
    </group>];
  });
  return <group userData={{wireId: wire.id, points: wire.points}}>
    {plugs}
    <mesh><tubeGeometry args={[curve, 32, wire.selected ? 0.0017 : 0.0011, 8, false]} /><meshStandardMaterial color={wire.color} roughness={0.5} emissive={wire.selected ? wire.color : '#000000'} emissiveIntensity={wire.selected ? 0.5 : 0} /></mesh>
    <mesh><tubeGeometry args={[curve, 24, 0.004, 5, false]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
  </group>;
}

let dotTexture: CanvasTexture | null = null;
const dot = () => {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!;
  g.beginPath(); g.arc(32, 32, 28, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#1f3b4c'; g.stroke();
  dotTexture = new CanvasTexture(c); return dotTexture;
};
function Points2({positions, colors, size}: {positions: number[]; colors: number[]; size: number}) {
  const geo = useRef<BufferGeometry>(null);
  useEffect(() => { const g = geo.current; if (!g) return; g.setAttribute('position', new Float32BufferAttribute(positions, 3)); g.setAttribute('color', new Float32BufferAttribute(colors, 3)); g.computeBoundingSphere(); }, [positions, colors]);
  return <points frustumCulled={false} renderOrder={20} raycast={() => null}><bufferGeometry ref={geo} /><pointsMaterial size={size} sizeAttenuation={false} vertexColors map={dot()} alphaTest={0.4} transparent depthTest={false} /></points>;
}
const rgb = (hex: string): [number, number, number] => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

/** Small markers on dense boards; the 15 px picking radius stays the same for touch. */
function PinPoints({pins, highlight, pending, probes}: {pins: PinMarker[]; highlight: ReadonlySet<string>; pending: Vec3 | null; probes: {a: Vec3 | null; b: Vec3 | null}}) {
  const isHi = (m: PinMarker) => highlight.has(`${m.ref.instanceId}:${m.ref.pinId}`);
  const denseInstances = useMemo(() => { const counts = new Map<string, number>(); for (const p of pins) counts.set(p.ref.instanceId, (counts.get(p.ref.instanceId) ?? 0) + 1); return new Set([...counts].filter(([, n]) => n > 100).map(([id]) => id)); }, [pins]);
  const dense = useMemo(() => { const list = pins.filter(m => denseInstances.has(m.ref.instanceId) && !m.connected && !isHi(m)); return {pos: list.flatMap(m => m.pos), col: list.flatMap(m => rgb(pinColor(m.role)))}; }, [pins, highlight, denseInstances]);
  const plain = useMemo(() => { const list = pins.filter(m => !denseInstances.has(m.ref.instanceId) && !m.connected && !isHi(m)); return {pos: list.flatMap(m => m.pos), col: list.flatMap(m => rgb(pinColor(m.role)))}; }, [pins, highlight, denseInstances]);
  const linked = useMemo(() => { const list = pins.filter(m => m.connected && !isHi(m)); return {pos: list.flatMap(m => m.pos), col: list.flatMap(m => rgb(pinColor(m.role)))}; }, [pins, highlight]);
  const hi = useMemo(() => { const list = pins.filter(isHi); return {pos: list.flatMap(m => m.pos), col: list.flatMap(() => rgb('#ff8a00'))}; }, [pins, highlight]);
  const special = useMemo(() => { const items: {p: Vec3; c: string}[] = []; if (pending) items.push({p: pending, c: '#2563eb'}); if (probes.a) items.push({p: probes.a, c: '#d64545'}); if (probes.b) items.push({p: probes.b, c: '#111111'}); return {pos: items.flatMap(i => i.p), col: items.flatMap(i => rgb(i.c))}; }, [pending, probes]);
  return <>
    {dense.pos.length > 0 && <Points2 positions={dense.pos} colors={dense.col} size={4} />}
    {plain.pos.length > 0 && <Points2 positions={plain.pos} colors={plain.col} size={11} />}
    {linked.pos.length > 0 && <Points2 positions={linked.pos} colors={linked.col} size={14} />}
    {pins.filter(isHi).map((m,i)=><Html key={`${m.ref.instanceId}:${m.ref.pinId}`} position={m.pos} center style={{pointerEvents:'none'}} zIndexRange={[35,30]}><span className={`rb-guide-pin-label rb-guide-pin-${i}`}>{i+1}. {m.label??m.ref.pinId}</span></Html>)}
    {hi.pos.length > 0 && <Points2 positions={hi.pos} colors={hi.col} size={20} />}
    {special.pos.length > 0 && <Points2 positions={special.pos} colors={special.col} size={22} />}
  </>;
}
