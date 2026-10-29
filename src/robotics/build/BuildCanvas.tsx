import {Component, useEffect, useImperativeHandle, useRef, useState, type MutableRefObject, type ReactNode, type Ref} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {CameraControls, Edges, Grid} from '@react-three/drei';
import {Box3, Matrix4, Raycaster, Vector2, Vector3, type Group, type Object3D} from 'three';
import type CameraControlsImpl from 'camera-controls';
import {classifyRelease, LONG_PRESS_MS, MOVE_THRESHOLD_PX, nextSelection, rectFromPoints, rectsIntersect, startGesture, type Gesture, type Rect2, type ToolId} from '../interaction/tools.ts';
import {ViewCube} from './ViewCube';

export type ViewName = 'front' | 'back' | 'side' | 'left' | 'top' | 'bottom' | 'iso';
/** Objeto de prueba (solo con `?debug=1`). No es una pieza del catálogo ni se guarda en el proyecto. */
export type DebugObject = {id: string; label: string; position: [number, number, number]; size: [number, number, number]; color: string; locked: boolean};
export type CameraState = {position: [number, number, number]; target: [number, number, number]};
export type CanvasHandle = {
  frameSelection(): void;
  frameAll(): void;
  setView(view: ViewName): void;
  resetCamera(): void;
  cancelGesture(): void;
  gesture(): Gesture;
};

const DEFAULT_CAMERA: CameraState = {position: [0.9, 0.75, 0.9], target: [0, 0.05, 0]};
const VIEW_DIRECTIONS: Record<ViewName, [number, number, number]> = {front: [0, 0.0001, 1], back: [0, 0.0001, -1], side: [1, 0.0001, 0], left: [-1, 0.0001, 0], top: [0.00001, 1, 0.00001], bottom: [0.00001, -1, 0.00001], iso: [0.62, 0.5, 0.62]};

type SceneApi = {
  pick(x: number, y: number): string | null;
  boxSelect(rect: Rect2): string[];
  configure(gesture: Gesture, button: number, pointerType: string): void;
  cancel(): void;
};

type Props = {
  tool: ToolId;
  objects: DebugObject[];
  selection: string[];
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

export function BuildCanvas(props: Props) {
  const {tool, objects, selection, onSelect, onMenu, onAnchor, onContextLost, onCameraRest, initialCamera, reducedMotion, lowQuality, debug, handleRef} = props;
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
  const objectsRef = useRef(objects);
  objectsRef.current = objects;

  const framing = (box: Box3 | null) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (!box || box.isEmpty()) { void controls.setLookAt(...DEFAULT_CAMERA.position, ...DEFAULT_CAMERA.target, !reducedMotion); return; }
    void controls.fitToBox(box, !reducedMotion, {paddingTop: 0.06, paddingBottom: 0.06, paddingLeft: 0.06, paddingRight: 0.06});
  };
  const boxOf = (ids: string[]) => {
    const box = new Box3();
    for (const o of objectsRef.current) if (ids.includes(o.id)) box.union(new Box3().setFromCenterAndSize(new Vector3(...o.position), new Vector3(...o.size)));
    return box;
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
    frameAll: () => framing(objectsRef.current.length ? boxOf(objectsRef.current.map(o => o.id)) : null),
    setView: viewTo,
    resetCamera: () => framing(null),
    cancelGesture,
    gesture: () => gesture.current,
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
    const id = api.pick(x, y);
    const pointerType = e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
    const next = startGesture(gesture.current, {button: Math.min(e.button, 2) as 0 | 1 | 2, target: id ? 'object' : 'empty', shift: e.shiftKey, alt: e.altKey, space: space.current, tool: latest.current.tool, pointerType});
    if (next === gesture.current) return; // ya hay un gesto activo: el nuevo puntero no lo interrumpe
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
        onCreated={({gl}) => {
          gl.domElement.addEventListener('webglcontextlost', ev => { ev.preventDefault(); setFailure('El navegador perdió el contexto gráfico (WebGL). Pasa a veces con poca memoria de video.'); });
        }}
        onError={() => setFailure('Falló el motor gráfico.')}>
        <color attach="background" args={['#eef1f4']} />
        <Scene {...{objects, selection, sceneRef: scene, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap}} />
      </Canvas>
    </Boundary>
    {marquee && <div className="rb-marquee" style={{left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h}} />}
    <ViewCube cubeRef={cube} onView={viewTo} />
  </div>;
}

function Scene({objects, selection, sceneRef, controlsRef, cube, onAnchor, onCameraRest, initialCamera, debug, wrap}: {objects: DebugObject[]; selection: string[]; sceneRef: MutableRefObject<SceneApi | null>; controlsRef: MutableRefObject<CameraControlsImpl | null>; cube: MutableRefObject<HTMLDivElement | null>; onAnchor(p: {x: number; y: number} | null): void; onCameraRest(c: CameraState): void; initialCamera?: CameraState; debug: boolean; wrap: MutableRefObject<HTMLDivElement | null>}) {
  const {camera, gl, scene} = useThree();
  const group = useRef<Group>(null);
  const last = useRef<{x: number; y: number} | null>(null);
  const raycaster = useRef(new Raycaster());
  const selectionRef = useRef(selection); selectionRef.current = selection;

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
    if (initialCamera) void controls.setLookAt(...initialCamera.position, ...initialCamera.target, false);
    else void controls.setLookAt(...DEFAULT_CAMERA.position, ...DEFAULT_CAMERA.target, false);
    const rest = () => { const p = new Vector3(), t = new Vector3(); controls.getPosition(p); controls.getTarget(t); const r = (v: Vector3): [number, number, number] => [Math.round(v.x * 1000) / 1000, Math.round(v.y * 1000) / 1000, Math.round(v.z * 1000) / 1000]; onCameraRest({position: r(p), target: r(t)}); };
    controls.addEventListener('sleep', rest);
    return () => controls.removeEventListener('sleep', rest);
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const ndc = (x: number, y: number) => { const r = dom.getBoundingClientRect(); return new Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1); };
    const idOf = (o: Object3D | null): string | null => { for (let n = o; n; n = n.parent) if (n.userData.partId) return n.userData.partId as string; return null; };
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
        if (controls) { controls.enabled = false; controls.enabled = true; }
        wrap.current?.setAttribute('data-gesture-state', 'idle');
      },
    };
    return () => { sceneRef.current = null; };
  }, [camera, gl]);

  // Posición en pantalla de la selección (para la barra contextual) y orientación del cubo de vistas.
  const tmp = useRef({box: new Box3(), v: new Vector3(), m: new Matrix4()});
  useFrame(() => {
    if (cube.current) {
      const e = camera.matrixWorldInverse.elements;
      cube.current.style.transform = `matrix3d(${e[0]},${-e[1]},${e[2]},0,${-e[4]},${e[5]},${-e[6]},0,${e[8]},${-e[9]},${e[10]},0,0,0,0,1)`;
    }
    const ids = selectionRef.current;
    if (!ids.length || !group.current) { if (last.current) { last.current = null; onAnchor(null); } return; }
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
    };
    return () => { delete (window as unknown as {__modoRobotics?: unknown}).__modoRobotics; };
  }, [debug, camera, gl, scene]);

  return <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[2, 4, 3]} intensity={1.4} />
    <directionalLight position={[-2, 2, -1]} intensity={0.35} />
    <Grid position={[0, 0, 0]} args={[10, 10]} cellSize={0.1} cellThickness={0.6} cellColor="#c9d1d8" sectionSize={0.5} sectionThickness={1} sectionColor="#9fb0bc" fadeDistance={6} fadeStrength={1.5} infiniteGrid />
    <CameraControls ref={controlsRef as never} makeDefault />
    <group ref={group}>
      {objects.map(o => <mesh key={o.id} userData={{partId: o.id}} position={o.position} castShadow>
        <boxGeometry args={o.size} />
        <meshStandardMaterial color={o.color} roughness={0.55} />
        {selection.includes(o.id) && <Edges color="#3E806B" threshold={15} />}
      </mesh>)}
    </group>
  </>;
}
