import {Component, useEffect, useImperativeHandle, useRef, useState, type MutableRefObject, type ReactNode, type Ref} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {CameraControls, Grid, TransformControls} from '@react-three/drei';
import {Box3, Matrix4, Plane, Quaternion, Raycaster, Sphere, Vector2, Vector3, type Group, type Object3D, type PerspectiveCamera} from 'three';
import type CameraControlsImpl from 'camera-controls';
import {classifyRelease, LONG_PRESS_MS, MOVE_THRESHOLD_PX, nextSelection, rectFromPoints, rectsIntersect, startGesture, type Gesture, type Rect2, type ToolId} from '../interaction/tools.ts';
import {getDefinition} from '../catalog/index.ts';
import type {PartInstance, Transform, Vec3} from '../project/types.ts';
import {PartMesh, GhostMesh} from './PartMesh';
import {ViewCube} from './ViewCube';

export type ViewName = 'front' | 'back' | 'side' | 'left' | 'top' | 'bottom' | 'iso';
export type CameraState = {position: Vec3; target: Vec3};
export type GizmoState = {pivot: Vec3; mode: 'translate' | 'rotate'; snapM: number | null; snapRad: number | null; key: number};
export type Ghost = {definitionId: string; position: Vec3; valid: boolean};
export type CanvasHandle = {
  frameSelection(): void;
  frameAll(): void;
  setView(view: ViewName): void;
  resetCamera(): void;
  cancelGesture(): void;
  gesture(): Gesture;
  /** Punto del plano del suelo (y = 0) bajo una posición de pantalla, o null si el rayo no lo toca. */
  groundPoint(clientX: number, clientY: number): Vec3 | null;
};

const DEFAULT_CAMERA: CameraState = {position: [0.9, 0.75, 0.9], target: [0, 0.05, 0]};
const VIEW_DIRECTIONS: Record<ViewName, Vec3> = {front: [0, 0.0001, 1], back: [0, 0.0001, -1], side: [1, 0.0001, 0], left: [-1, 0.0001, 0], top: [0.00001, 1, 0.00001], bottom: [0.00001, -1, 0.00001], iso: [0.62, 0.5, 0.62]};

type SceneApi = {
  pick(x: number, y: number): string | null;
  boxSelect(rect: Rect2): string[];
  gizmoHot(x: number, y: number): boolean;
  configure(gesture: Gesture, button: number, pointerType: string): void;
  cancel(): void;
  ground(clientX: number, clientY: number): Vec3 | null;
};

type Props = {
  tool: ToolId;
  parts: PartInstance[];
  selection: string[];
  interfering: ReadonlySet<string>;
  joinPoints: Vec3[];
  ghost: Ghost | null;
  gizmo: GizmoState | null;
  onGizmoDrag(m: Transform): void;
  onGizmoCommit(m: Transform): void;
  onSelect(ids: string[]): void;
  onMenu(at: {x: number; y: number}, targetId: string | null): void;
  onAnchor(point: {x: number; y: number} | null): void;
  onContextLost(): void;
  onCameraRest(camera: CameraState): void;
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
  const latest = useRef({tool, selection, onSelect, onMenu});
  latest.current = {tool, selection, onSelect, onMenu};
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
    } else if (release === 'click' && start.button === 0 && g !== 'panning') cur.onSelect(nextSelection(cur.selection, start.id, start.shift));
  };
  const move = (e: PointerEvent) => {
    const start = press.current;
    if (!start || e.pointerId !== start.pointer) return;
    const box = wrap.current!.getBoundingClientRect();
    const x = e.clientX - box.left, y = e.clientY - box.top;
    if (longPress.current && Math.hypot(x - start.x, y - start.y) > 8) { clearTimeout(longPress.current); longPress.current = null; }
    if (gesture.current === 'marquee' && Math.hypot(x - start.x, y - start.y) > MOVE_THRESHOLD_PX) setMarquee(rectFromPoints(start.x, start.y, x, y));
  };
  useEffect(() => {
    addEventListener('pointerup', finish); addEventListener('pointercancel', cancelGesture); addEventListener('pointermove', move);
    return () => { removeEventListener('pointerup', finish); removeEventListener('pointercancel', cancelGesture); removeEventListener('pointermove', move); };
  }, []);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    const api = scene.current, el = wrap.current;
    if (!api || !el || (e.target as Element).closest('.rb-canvas-overlay')) return;
    const box = el.getBoundingClientRect(), x = e.clientX - box.left, y = e.clientY - box.top;
    if (e.button === 0 && api.gizmoHot(x, y)) return; // el gizmo se queda con el gesto: la cámara y la selección no intervienen
    const id = api.pick(x, y);
    const pointerType = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
    const next = startGesture(gesture.current, {button: Math.min(e.button, 2) as 0 | 1 | 2, target: id ? 'object' : 'empty', shift: e.shiftKey, alt: e.altKey, space: space.current, tool: latest.current.tool, pointerType});
    if (next === gesture.current) return;
    gesture.current = next;
    press.current = {x, y, id, button: e.button, shift: e.shiftKey, pointer: e.pointerId, pointerType};
    api.configure(next, e.button, pointerType);
    if (pointerType === 'touch' && e.isPrimary) {
      longPress.current = setTimeout(() => {
        longPress.current = null;
        const start = press.current;
        cancelGesture();
        latest.current.onMenu({x: e.clientX, y: e.clientY}, start?.id ?? id);
      }, LONG_PRESS_MS);
    }
  };

  if (failure) return <div className="rb-gl-error" role="alert"><strong>No se pudo mostrar la pizarra 3D</strong><p>{failure}</p><button type="button" onClick={() => { setFailure(''); onContextLost(); }}>Reintentar</button></div>;
  return <div ref={wrap} className={`rb-canvas${tool === 'hand' ? ' is-hand' : ''}`} data-gesture-state="idle" onPointerDownCapture={down} onContextMenu={e => e.preventDefault()}>
    <Boundary onError={setFailure}>
      <Canvas
        dpr={lowQuality ? 1 : [1, 1.75]}
        camera={{fov: 45, near: 0.01, far: 200, position: initialCamera?.position ?? DEFAULT_CAMERA.position}}
        gl={{antialias: !lowQuality, powerPreference: 'high-performance', alpha: false}}
        onCreated={({gl}) => { gl.domElement.addEventListener('webglcontextlost', ev => { ev.preventDefault(); setFailure('El navegador perdió el contexto gráfico (WebGL). Pasa a veces con poca memoria de video.'); }); }}
        onError={() => setFailure('Falló el motor gráfico.')}>
        <color attach="background" args={['#eef1f4']} />
        <Scene {...{parts, selection, sceneRef: scene, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap, interfering: props.interfering, joinPoints: props.joinPoints, ghost: props.ghost, gizmo: props.gizmo, onGizmoDrag: props.onGizmoDrag, onGizmoCommit: props.onGizmoCommit}} />
      </Canvas>
    </Boundary>
    {marquee && <div className="rb-marquee" style={{left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h}} />}
    <ViewCube cubeRef={cube} onView={viewTo} />
  </div>;
}

type TransformControlsLike = {object?: Object3D; axis: string | null; dragging: boolean; pointerHover(p: {x: number; y: number; button: number}): void};

function Scene({parts, selection, sceneRef, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap, interfering, joinPoints, ghost, gizmo, onGizmoDrag, onGizmoCommit}: {
  parts: PartInstance[]; selection: string[]; sceneRef: MutableRefObject<SceneApi | null>; controlsRef: MutableRefObject<CameraControlsImpl | null>; cube: MutableRefObject<HTMLDivElement | null>;
  onAnchor(p: {x: number; y: number} | null): void; onCameraRest(c: CameraState): void; initialCamera?: CameraState; debug: boolean; wrap: MutableRefObject<HTMLDivElement | null>;
  interfering: ReadonlySet<string>; joinPoints: Vec3[]; ghost: Ghost | null; gizmo: GizmoState | null; onGizmoDrag(m: Transform): void; onGizmoCommit(m: Transform): void;
}) {
  const {camera, gl, scene} = useThree();
  const group = useRef<Group>(null);
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
    const rest = () => { const p = new Vector3(), t = new Vector3(); controls.getPosition(p); controls.getTarget(t); const r = (v: Vector3): Vec3 => [Math.round(v.x * 1000) / 1000, Math.round(v.y * 1000) / 1000, Math.round(v.z * 1000) / 1000]; onCameraRest({position: r(p), target: r(t)}); };
    controls.addEventListener('sleep', rest);
    return () => controls.removeEventListener('sleep', rest);
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const ndc = (x: number, y: number) => { const r = dom.getBoundingClientRect(); return new Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1); };
    const idOf = (o: Object3D | null): string | null => { for (let n = o; n; n = n.parent) if (n.userData.partId) return n.userData.partId as string; return null; };
    const floor = new Plane(new Vector3(0, 1, 0), 0);
    sceneRef.current = {
      pick: (x, y) => {
        if (!group.current) return null;
        raycaster.current.setFromCamera(ndc(x, y), camera);
        const hit = raycaster.current.intersectObjects(group.current.children, true)[0];
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
    <CameraControls ref={controlsRef as never} makeDefault />
    <group ref={group}>
      {parts.map(p => <PartMesh key={p.instanceId} part={p} selected={selection.includes(p.instanceId)} interfering={interfering.has(p.instanceId)} />)}
    </group>
    {ghost && <GhostMesh definitionId={ghost.definitionId} position={ghost.position} valid={ghost.valid} />}
    {joinPoints.map((p, i) => <mesh key={i} position={p} raycast={() => null}><sphereGeometry args={[0.006, 16, 12]} /><meshBasicMaterial color="#27ae60" transparent opacity={0.85} depthTest={false} /></mesh>)}
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
