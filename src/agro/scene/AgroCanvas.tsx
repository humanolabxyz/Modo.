import {useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Line, OrbitControls} from '@react-three/drei';
import {SkyDome} from './SkyDome.tsx';
import {BufferAttribute, BufferGeometry, Color, Group, LineBasicMaterial, LineLoop, Mesh, MOUSE, PerspectiveCamera, Raycaster, TOUCH, Vector3, type Intersection} from 'three';
import {itemById} from '../catalog/items.ts';
import type {Entity, PortRef, PropValue} from '../model/types.ts';
import {inBounds, sampleHeight} from '../terrain/heightfield.ts';
import {raycastHeightfield} from '../terrain/raycast.ts';
import type {WorldSession} from '../world/session.ts';
import {parcelAt, pickEntity, pickPort} from '../world/placement.ts';
import {EntityLayer, type Overlay} from './EntityLayer.tsx';
import {Clouds, Vegetation} from './Vegetation.tsx';
import {Landscape} from './Landscape.tsx';
import {TerrainMesh} from './TerrainMesh.tsx';
import {terrainReviewScene, TerrainReviewLayer, type ReviewFocus, type ReviewTarget} from './TerrainReview.tsx';
import type {ImpactReport} from '../world/impact.ts';
import {ExteriorTerrain} from './ExteriorTerrain.tsx';
import {sceneryHeight} from '../terrain/exterior.ts';
import {cameraDistances, playablePoint} from '../terrain/navigation.ts';
import {TERRITORIES} from '../terrain/presets.ts';
import {groundTexture} from './groundTexture.ts';

export type CameraMode = 'orbit' | 'strategic' | 'walk';
export type Tool = 'select' | 'measure' | 'connect' | 'raise' | 'lower' | 'level' | 'place' | 'edit';
export type Point = {x: number; y: number; z: number};
export type CameraReport = {x: number; z: number; yaw: number};
export type Metrics = {triangles: number; calls: number};
export type GhostInfo = {valid: boolean; reason?: string} | null;

export type AgroCanvasProps = {
  session: WorldSession; mode: CameraMode; tool: Tool; placing: string | null; placingParams: Record<string, PropValue>; yaw: number; gridSnap: boolean; showPorts: boolean; labels?: boolean;
  radius: number; strength: number; selectedPoint: Point | null; selectedId: string | null; measurePoints: Point[];
  goto: {x: number; z: number; nonce: number} | null;
  onEditPoint?(p: Point):void;
  editorPoints?: Point[]; editorClosed?: boolean;
  review: ImpactReport | null;
  reviewFocus: ReviewFocus | null;
  connectFrom: PortRef | null; onPortClick(ref: PortRef | null): void; onPortHover(ref: PortRef | null): void;
  onHover(p: Point | null): void; onSelectPoint(p: Point | null): void; onSelectEntity(id: string | null): void; onMeasure(p: Point): void; onPlaced(e: Entity): void; onGhost(info: GhostInfo): void;
  onCamera(c: CameraReport): void; onMetrics(m: Metrics): void; onNotice(message: string): void;
};

const EYE = 1.7;
const NONE = -1 as unknown as MOUSE;
const NONE_TOUCH = -1 as unknown as TOUCH;
const isBrush = (t: Tool): t is 'raise' | 'lower' | 'level' => t === 'raise' || t === 'lower' || t === 'level';
type WalkState = {x: number; z: number; yaw: number; pitch: number; keys: Set<string>};
type Saved = {position: Vector3; target: Vector3};

/** Cámaras: órbita (construir e inspeccionar), estratégica (vista territorial) y caminata (primera persona). Cada modo recuerda su posición. */
function CameraRig({session, mode, tool, goto, walk, onCamera, onMetrics, reviewing}: Pick<AgroCanvasProps, 'session' | 'mode' | 'tool' | 'goto' | 'onCamera' | 'onMetrics'> & {walk: MutableRefObject<WalkState>; reviewing: boolean}) {
  const {camera, gl, scene, controls: ctl, invalidate, size} = useThree();
  const controls = ctl as unknown as {target: Vector3; update(): void; enabled: boolean} | null;
  const saved = useRef<Partial<Record<CameraMode, Saved>>>({});
  const prevMode = useRef<CameraMode>('orbit');
  const accum = useRef({report: 0});
  const hf = session.terrain.hf;
  const brush = isBrush(tool);
  const distances = cameraDistances(hf, size.width / Math.max(1, size.height));
  const started = useRef(false);
  const floorProbe = useMemo(() => new Raycaster(new Vector3(), new Vector3(0, -1, 0)), []);
  const floorHits = useRef<Intersection[]>([]);

  useEffect(() => { // encuadre inicial: la finca (meseta central) desde un costado
    if (!controls || started.current) return;
    started.current = true;
    const [x, z] = session.site, g = sampleHeight(hf, x, z);
    controls.target.set(x, g, z); camera.position.set(x + 26, g + 26, z + 52); controls.update(); invalidate();
  }, [controls, camera, hf, invalidate, session]);

  useEffect(() => {
    if (!controls) return;
    const prev = prevMode.current;
    if (prev !== mode) {
      if (prev !== 'walk') saved.current[prev] = {position: camera.position.clone(), target: controls.target.clone()};
      const here = prev === 'walk' ? new Vector3(walk.current.x, sampleHeight(hf, walk.current.x, walk.current.z), walk.current.z) : controls.target.clone();
      if (mode === 'walk') {
        const dir = camera.getWorldDirection(new Vector3());
        [walk.current.x, walk.current.z] = playablePoint(hf, here.x, here.z, 2);
        walk.current.yaw = Math.atan2(-dir.x, -dir.z); walk.current.pitch = 0;
      } else {
        const s = saved.current[mode];
        if (s && prev !== 'walk') { camera.position.copy(s.position); controls.target.copy(s.target); }
        else if (mode === 'strategic') {
          const overview = cameraDistances(hf, size.width / Math.max(1, size.height)).overview, g = sampleHeight(hf, 0, 0);
          controls.target.set(0, g, 0); camera.position.set(0, g + overview * 0.96, overview * 0.28);
        }
        else { const g = sampleHeight(hf, here.x, here.z); controls.target.set(here.x, g, here.z); camera.position.set(here.x + 26, g + 26, here.z + 52); }
        controls.update();
      }
      prevMode.current = mode;
    }
    invalidate();
  }, [mode, controls, camera, hf, invalidate, walk, size.width, size.height]);

  useEffect(() => {
    if (!goto || !controls) return;
    const y = sampleHeight(hf, goto.x, goto.z);
    if (mode === 'walk') { [walk.current.x, walk.current.z] = playablePoint(hf, goto.x, goto.z, 2); }
    else { const d = new Vector3(goto.x - controls.target.x, y - controls.target.y, goto.z - controls.target.z); camera.position.add(d); controls.target.add(d); controls.update(); }
    invalidate();
  }, [goto?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  // Caminata: teclado y mirada con el ratón (arrastrar).
  useEffect(() => {
    if (mode !== 'walk') return;
    const el = gl.domElement, w = walk.current;
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const down = (e: KeyboardEvent) => { if (typing(e)) return; const k = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) { w.keys.add(k); e.preventDefault(); invalidate(); } };
    const up = (e: KeyboardEvent) => { w.keys.delete(e.key.toLowerCase()); };
    let drag: {x: number; y: number} | null = null;
    const pd = (e: PointerEvent) => { if (e.button === 0 || e.pointerType === 'touch') { drag = {x: e.clientX, y: e.clientY}; el.setPointerCapture(e.pointerId); } };
    const pm = (e: PointerEvent) => { if (!drag) return; w.yaw -= (e.clientX - drag.x) * 0.004; w.pitch = Math.max(-1.2, Math.min(1.2, w.pitch - (e.clientY - drag.y) * 0.004)); drag = {x: e.clientX, y: e.clientY}; invalidate(); };
    const pu = () => { drag = null; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); el.addEventListener('pointerdown', pd); el.addEventListener('pointermove', pm); el.addEventListener('pointerup', pu); el.addEventListener('pointercancel', pu);
    return () => { w.keys.clear(); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); el.removeEventListener('pointerdown', pd); el.removeEventListener('pointermove', pm); el.removeEventListener('pointerup', pu); el.removeEventListener('pointercancel', pu); };
  }, [mode, gl, walk, invalidate]);

  useFrame((state, dt) => {
    const w = walk.current;
    if (mode === 'walk') {
      const k = w.keys, speed = (k.has('shift') ? 14 : 6) * Math.min(dt, 0.1);
      const fwd = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0), side = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      if (fwd || side) {
        const sin = Math.sin(w.yaw), cos = Math.cos(w.yaw), nx = w.x + (-sin * fwd + cos * side) * speed, nz = w.z + (-cos * fwd - sin * side) * speed;
        [w.x, w.z] = playablePoint(hf, nx, nz, 2);
      }
      camera.rotation.order = 'YXZ'; camera.rotation.set(w.pitch, w.yaw, 0);
      camera.position.set(w.x, sampleHeight(hf, w.x, w.z) + EYE, w.z);
      if (k.size) state.invalidate();
    } else {
      if (controls && !reviewing) {
        const t = controls.target, [x, z] = playablePoint(hf, t.x, t.z);
        const dx = x - t.x, dz = z - t.z;
        const ground = sampleHeight(hf, x, z), lift = Math.min(90, Math.max(16, Math.min(hf.sizeX, hf.sizeZ) * 0.09));
        const dy = Math.max(ground - 20, Math.min(ground + lift, t.y)) - t.y;
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 1e-4) {
          camera.position.x += dx; camera.position.y += dy; camera.position.z += dz;
          t.set(x, t.y + dy, z); controls.update();
        }
      }
      let floor = sceneryHeight(hf, camera.position.x, camera.position.z) + 2;
      if (!inBounds(hf, camera.position.x, camera.position.z)) {
        // A distancia la malla interpola entre anillos: puede quedar por encima
        // del generador analítico. La cámara debe respetar la superficie dibujada.
        // Se evita modificar el raycast vacío que excluye el exterior del picking.
        const exterior = scene.getObjectByName('cinturón y horizonte escénicos');
        if (exterior instanceof Mesh) {
          floorProbe.ray.origin.set(camera.position.x, Math.max(10000, floor + 1000), camera.position.z);
          const hits = floorHits.current; hits.length = 0;
          Mesh.prototype.raycast.call(exterior, floorProbe, hits);
          for (const hit of hits) floor = Math.max(floor, hit.point.y + 2);
        }
      }
      if (camera.position.y < floor) {
        camera.position.y = floor;
        if (controls) controls.update();
        invalidate();
      }
    }
    const a = accum.current; a.report += dt;
    if (a.report > 0.12) {
      a.report = 0; const dir = camera.getWorldDirection(new Vector3());
      onCamera(mode === 'walk' ? {x: w.x, z: w.z, yaw: Math.atan2(dir.x, dir.z)} : {x: camera.position.x, z: camera.position.z, yaw: Math.atan2(dir.x, dir.z)});
    }
  });

  useEffect(() => { // el último dibujo conserva sus contadores hasta el siguiente: se leen cada medio segundo
    const t = setInterval(() => { if (gl.info.render.calls > 0) onMetrics({triangles: gl.info.render.triangles, calls: gl.info.render.calls}); }, 500);
    return () => clearInterval(t);
  }, [gl, onMetrics]);

  const strategic = mode === 'strategic';
  return <OrbitControls makeDefault enabled={mode !== 'walk'} enableDamping={false}
    minDistance={strategic && !reviewing ? Math.min(240, distances.overview * 0.32) : 6} maxDistance={strategic ? distances.overview : distances.orbit} maxPolarAngle={strategic ? 0.88 : 1.47} minPolarAngle={strategic ? 0.02 : 0.05}
    mouseButtons={brush ? {LEFT: NONE, MIDDLE: MOUSE.PAN, RIGHT: MOUSE.ROTATE} : {LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN}}
    touches={brush ? {ONE: NONE_TOUCH, TWO: TOUCH.DOLLY_ROTATE} : {ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN}} />;
}

const snap = (v: number, on: boolean): number => (on ? Math.round(v * 2) / 2 : v);

/** Puntero: pincel, selección de piezas y del suelo, arrastrar para mover, fantasma de colocación y medición. Todo con el picking analítico. */
function Interaction(props: Pick<AgroCanvasProps, 'session' | 'mode' | 'tool' | 'placing' | 'placingParams' | 'yaw' | 'gridSnap' | 'radius' | 'strength' | 'onHover' | 'onSelectPoint' | 'onSelectEntity' | 'onMeasure' | 'onPlaced' | 'onGhost' | 'onNotice' | 'onPortClick' | 'onPortHover' | 'onEditPoint'> & {ring: LineLoop; setOverlay: (f: (o: Overlay) => Overlay) => void}) {
  const {gl, camera, raycaster, invalidate, controls} = useThree();
  const {session, ring, setOverlay} = props, hf = session.terrain.hf;
  const live = useRef(props); live.current = props;
  const lastPoint = useRef<Point | null>(null);
  const ghostKey = useRef('');

  const place = (p: Point | null) => {
    const attr = ring.geometry.getAttribute('position') as BufferAttribute, {tool, mode, radius} = live.current;
    ring.visible = !!p && isBrush(tool) && mode !== 'walk';
    if (p && ring.visible) {
      for (let k = 0; k < attr.count; k++) { const a = (k / attr.count) * Math.PI * 2, x = p.x + Math.cos(a) * radius, z = p.z + Math.sin(a) * radius; attr.setXYZ(k, x, sampleHeight(hf, x, z) + 0.35, z); }
      attr.needsUpdate = true; ring.geometry.computeBoundingSphere();
    }
    invalidate();
  };

  const updateGhost = (p: Point | null) => {
    const {tool, placing, placingParams, yaw, gridSnap, onGhost} = live.current;
    if (tool !== 'place' || !placing || !p) { setOverlay(o => (o.ghost ? {...o, ghost: null} : o)); if (ghostKey.current) { ghostKey.current = ''; onGhost(null); } return; }
    const {pose, check} = session.previewPlacement(placing, snap(p.x, gridSnap), snap(p.z, gridSnap), yaw, placingParams);
    const merged: Record<string, PropValue> = {...Object.fromEntries((itemById(placing)?.params ?? []).map(q => [q.key, q.default])), ...placingParams};
    setOverlay(o => ({...o, ghost: {type: placing, pose, params: merged, valid: check.ok}}));
    const key = check.ok ? 'ok' : check.error; if (key !== ghostKey.current) { ghostKey.current = key; onGhost(check.ok ? {valid: true} : {valid: false, reason: check.error}); }
  };

  useEffect(() => { updateGhost(lastPoint.current); }, [props.tool, props.placing, props.yaw, props.gridSnap, props.placingParams]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { ring.visible = false; if (props.tool !== 'select') setOverlay(o => (o.hoverId ? {...o, hoverId: null} : o)); if (props.tool !== 'connect') setOverlay(o => (o.hoverPort ? {...o, hoverPort: null} : o)); invalidate(); }, [props.tool, props.mode, ring, invalidate, setOverlay]);

  useEffect(() => {
    const el = gl.domElement;
    const ray = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      raycaster.setFromCamera({x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1} as never, camera);
      return {origin: [raycaster.ray.origin.x, raycaster.ray.origin.y, raycaster.ray.origin.z] as const, dir: [raycaster.ray.direction.x, raycaster.ray.direction.y, raycaster.ray.direction.z] as const};
    };
    const cast = (e: PointerEvent): {point: Point | null; distance: number; entity: {id: string; distance: number} | null} => {
      const rr = ray(e), hit = raycastHeightfield(hf, rr.origin, rr.dir), ent = pickEntity(session.entities, rr);
      return {point: hit ? {x: hit.x, y: hit.y, z: hit.z} : null, distance: hit ? hit.distance : Infinity, entity: ent && ent.distance <= (hit ? hit.distance : Infinity) + 0.05 ? ent : null};
    };
    let painting: {pointerId: number; last: Point; target: number; kind: 'raise' | 'lower' | 'level'} | null = null;
    let down: {x: number; y: number; t: number; entityId: string | null} | null = null;
    let drag: {id: string; yaw: number; moved: boolean; last: {x: number; z: number} | null} | null = null;
    const ctl = controls as unknown as {enabled: boolean} | null;

    const stamp = (p: Point) => {
      if (!painting) return;
      const {radius, strength, onNotice} = live.current;
      const res = session.stamp(painting.kind, p.x, p.z, radius, painting.kind === 'level' ? painting.target : strength);
      if (!res.ok) onNotice(res.error);
    };

    const onDown = (e: PointerEvent) => {
      const {tool, mode} = live.current;
      if (!e.isPrimary || session.terrain.painting || mode === 'walk' || (e.button !== 0 && e.pointerType === 'mouse')) return;
      down = {x: e.clientX, y: e.clientY, t: performance.now(), entityId: null};
      const c = cast(e);
      if (isBrush(tool)) {
        if (!c.point) return;
        session.beginStroke(); painting = {pointerId: e.pointerId, last: c.point, target: c.point.y, kind: tool};
        el.setPointerCapture(e.pointerId); stamp(c.point); place(c.point); return;
      }
      if (tool === 'select' && c.entity) {
        down.entityId = c.entity.id; live.current.onSelectEntity(c.entity.id);
        const ent = session.entity(c.entity.id);
        if (ent && !ent.locked) { drag = {id: ent.id, yaw: ent.pose.rotation[1], moved: false, last: null}; if (ctl) ctl.enabled = false; el.setPointerCapture(e.pointerId); }
      }
    };

    const onMove = (e: PointerEvent) => {
      const {tool, mode} = live.current;
      if (!e.isPrimary || session.terrainImpact) return;
      if (painting && (!session.terrain.painting || tool !== painting.kind || mode === 'walk')) cancel(e);
      if (mode === 'walk') return;
      const c = cast(e); lastPoint.current = c.point; live.current.onHover(c.point); place(c.point);
      if (painting && c.point) { const dx = c.point.x - painting.last.x, dz = c.point.z - painting.last.z; if (Math.sqrt(dx * dx + dz * dz) >= live.current.radius * 0.4) { painting.last = c.point; stamp(c.point); } return; }
      if (drag && down && c.point) {
        if (!drag.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4) return;
        drag.moved = true; const ent = session.entity(drag.id); if (!ent) return;
        const x = snap(c.point.x, live.current.gridSnap), z = snap(c.point.z, live.current.gridSnap); drag.last = {x, z};
        const {pose, check} = session.previewPlacement(ent.type, x, z, drag.yaw, ent.params, ent.id);
        setOverlay(o => ({...o, drag: {id: ent.id, pose, valid: check.ok}})); return;
      }
      if (tool === 'connect') { const rr = ray(e), pp = pickPort(session.entities, rr), ref = pp ? {entityId: pp.entityId, portId: pp.portId} : null; setOverlay(o => (o.hoverPort?.entityId === ref?.entityId && o.hoverPort?.portId === ref?.portId ? o : {...o, hoverPort: ref})); live.current.onPortHover(ref); return; }
      if (tool === 'place') { updateGhost(c.point); return; }
      if (tool === 'select') { const id = c.entity?.id ?? null; setOverlay(o => (o.hoverId === id ? o : {...o, hoverId: id})); }
    };

    const onUp = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      const {tool, mode} = live.current, d = down; down = null;
      if (painting?.pointerId === e.pointerId) {
        const valid = tool === painting.kind && mode !== 'walk';
        painting = null;
        if (valid) session.endStroke(); else session.abortStroke();
        return;
      }
      if (ctl && mode !== 'walk') ctl.enabled = true;
      if (drag) {
        const g = drag; drag = null; setOverlay(o => ({...o, drag: null}));
        if (g.moved && g.last) { const res = session.move(g.id, g.last.x, g.last.z, g.yaw); if (!res.ok) live.current.onNotice(res.error); return; }
        if (g.moved) return;
      }
      if (!d || mode === 'walk' || Math.hypot(e.clientX - d.x, e.clientY - d.y) >= 5 || performance.now() - d.t >= 600) return;
      if (d.entityId) return; // ya se seleccionó al pulsar
      const c = cast(e);
      if (tool === 'edit') { if(c.point)live.current.onEditPoint?.(c.point); return; }
      if (tool === 'select') {
        const parcel = c.point ? parcelAt(session.entities, c.point.x, c.point.z) : null;
        if (parcel) live.current.onSelectEntity(parcel.id); else { live.current.onSelectEntity(null); live.current.onSelectPoint(c.point); }
      } else if (tool === 'measure') { if (c.point) live.current.onMeasure(c.point); }
      else if (tool === 'connect') { const pp = pickPort(session.entities, ray(e)); live.current.onPortClick(pp ? {entityId: pp.entityId, portId: pp.portId} : null); }
      else if (tool === 'place' && live.current.placing && c.point) {
        const {placing, placingParams, yaw, gridSnap, onPlaced, onNotice} = live.current;
        const res = session.place(placing, snap(c.point.x, gridSnap), snap(c.point.z, gridSnap), yaw, {params: placingParams});
        if (res.ok) onPlaced(res.value); else onNotice(res.error);
        updateGhost(c.point);
      }
    };
    const cancel = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      if (painting?.pointerId === e.pointerId) { painting = null; session.abortStroke(); }
      down = null;
      if (drag) { drag = null; setOverlay(o => ({...o, drag: null})); }
      if (ctl) ctl.enabled = live.current.mode !== 'walk';
    };
    const onLeave = () => { lastPoint.current = null; live.current.onHover(null); place(null); setOverlay(o => ({...o, ghost: null, hoverId: null})); if (ghostKey.current) { ghostKey.current = ''; live.current.onGhost(null); } };
    el.addEventListener('pointerdown', onDown, true); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', cancel); el.addEventListener('lostpointercapture', cancel); el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerdown', onDown, true); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp); el.removeEventListener('pointercancel', cancel); el.removeEventListener('lostpointercapture', cancel); el.removeEventListener('pointerleave', onLeave);
      if (painting) session.abortStroke(); if (ctl) ctl.enabled = live.current.mode !== 'walk';
    };
  }, [gl, camera, raycaster, hf, session, controls]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Pin({session, point}: {session: WorldSession; point: Point | null}) {
  const group = useRef<Group>(null);
  const {camera, invalidate} = useThree();
  useEffect(() => session.subscribe(invalidate), [session, invalidate]);
  useFrame(() => {
    const g = group.current; if (!g) return;
    g.visible = !!point; if (!point) return;
    const y = sampleHeight(session.terrain.hf, point.x, point.z), d = Math.max(4, camera.position.distanceTo(new Vector3(point.x, y, point.z)));
    g.position.set(point.x, y, point.z); g.scale.setScalar(Math.min(14, d * 0.018));
  });
  return <group ref={group} visible={false}>
    <mesh position={[0, 3, 0]} raycast={() => null}><cylinderGeometry args={[0.12, 0.12, 6, 8]} /><meshBasicMaterial color="#14502c" /></mesh>
    <mesh position={[0, 6.4, 0]} raycast={() => null}><sphereGeometry args={[0.7, 16, 12]} /><meshBasicMaterial color="#2fb35a" /></mesh>
  </group>;
}

/** La revisión encuadra el punto en la zona que deja libre el diálogo y devuelve la cámara al cerrar. */
function ReviewCamera({target, onCamera}: {target?: ReviewTarget; onCamera(c: CameraReport): void}) {
  const {camera, controls, size, invalidate} = useThree();
  const orbit = controls as unknown as {target: Vector3; update(): void} | null;
  const mobile = size.width < 760;
  const reportPosition = useCallback(() => {
    const dir = camera.getWorldDirection(new Vector3());
    onCamera({x: camera.position.x, z: camera.position.z, yaw: Math.atan2(dir.x, dir.z)});
  }, [camera, onCamera]);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const sheetHeight = Math.min(innerHeight * 0.68, innerHeight - 64);
    const sideWidth = Math.min(450, size.width * 0.46);
    camera.setViewOffset(size.width, size.height, mobile ? 0 : sideWidth / 2 + 6, mobile ? sheetHeight / 2 + 3 : 0, size.width, size.height);
    invalidate();
    return () => { camera.clearViewOffset(); invalidate(); };
  }, [camera, size.width, size.height, mobile, invalidate]);
  useEffect(() => {
    if (!orbit) return;
    const originalPosition = camera.position.clone(), originalTarget = orbit.target.clone();
    return () => {
      camera.position.copy(originalPosition); orbit.target.copy(originalTarget); orbit.update(); reportPosition(); invalidate();
    };
  }, [camera, orbit, invalidate, reportPosition]);
  useEffect(() => {
    if (!target || !orbit) return;
    const direction = camera.position.clone().sub(orbit.target).normalize();
    orbit.target.set(...target.point);
    camera.position.copy(orbit.target).addScaledVector(direction, target.distance * (mobile ? 1.4 : 1));
    orbit.update(); reportPosition(); invalidate();
  }, [camera, orbit, target, mobile, invalidate, reportPosition]);
  return null;
}

function Scene(props: AgroCanvasProps) {
  const {session, mode, tool} = props;
  const atmosphere = TERRITORIES[session.terrain.presetId].landscape;
  const grain = useMemo(groundTexture, []);
  useEffect(() => () => grain.dispose(), [grain]);
  const review = useMemo(() => props.review && terrainReviewScene(session, props.review), [session, props.review]);
  const focus = props.reviewFocus;
  const target = focus && (focus.kind === 'entity' ? review?.installations : review?.links)?.find(row => row.id === focus.id)?.target;
  const walk = useRef<WalkState>({x: 0, z: 0, yaw: 0, pitch: 0, keys: new Set()});
  const [overlay, setOverlayState] = useState<Overlay>({});
  const setOverlay = useCallback((f: (o: Overlay) => Overlay) => setOverlayState(f), []);
  const ring = useMemo(() => {
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(97 * 3), 3));
    const l = new LineLoop(g, new LineBasicMaterial({color: new Color('#9af0b0'), depthTest: false, transparent: true, opacity: 0.95}));
    l.renderOrder = 10; l.visible = false; l.frustumCulled = false; l.raycast = () => {}; return l;
  }, []);
  const sun = useMemo(() => new Vector3(0.5, 0.62, 0.35).normalize().multiplyScalar(1000), []);
  return <>
    <color attach="background" args={[atmosphere.haze]} />
    <fog attach="fog" args={[atmosphere.haze, atmosphere.dust ? 430 : 780, atmosphere.dust ? 4700 : 6100]} />
    <SkyDome haze={atmosphere.haze} dust={atmosphere.dust} sun={sun} />
    <hemisphereLight args={['#d6ebff', atmosphere.dust ? '#986c48' : '#6f8a46', 1.1]} />
    <directionalLight position={sun.toArray()} intensity={2.45} color={atmosphere.dust ? '#ffd7a5' : '#fff1d6'} />
    {!!props.editorPoints?.length && <group name="trazado del editor">
      {props.editorPoints.map((p,i)=><mesh key={i} position={[p.x,sampleHeight(session.terrain.hf,p.x,p.z)+0.6,p.z]} raycast={()=>null}><sphereGeometry args={[0.6,10,8]} /><meshBasicMaterial color="#e7ff64" depthTest={false} /></mesh>)}
      {props.editorPoints.length>1 && <Line points={[...props.editorPoints,...(props.editorClosed?[props.editorPoints[0]]:[])].map(p=>[p.x,sampleHeight(session.terrain.hf,p.x,p.z)+0.6,p.z])} color="#e7ff64" lineWidth={2} depthTest={false} />}
    </group>}
    <TerrainMesh model={session.terrain} grain={grain} />
    <ExteriorTerrain model={session.terrain} grain={grain} />
    <Vegetation session={session} />
    <Landscape session={session} />
    <Clouds seed={session.terrain.hf.seed} cover={atmosphere.clouds} />
    <EntityLayer session={session} selectedId={props.selectedId} overlay={overlay} measurePoints={props.measurePoints} showPorts={props.showPorts} labels={!review && (props.labels ?? false)} connect={{active: tool === 'connect', from: props.connectFrom}} />
    {review && <><TerrainReviewLayer scene={review} focus={focus} /><ReviewCamera target={target ?? undefined} onCamera={props.onCamera} /></>}
    <primitive object={ring} />
    <Pin session={session} point={props.selectedPoint} />
    <CameraRig session={session} mode={mode} tool={tool} goto={props.goto} walk={walk} onCamera={props.onCamera} onMetrics={props.onMetrics} reviewing={!!review} />
    <Interaction onEditPoint={props.onEditPoint} session={session} mode={mode} tool={tool} placing={props.placing} placingParams={props.placingParams} yaw={props.yaw} gridSnap={props.gridSnap} radius={props.radius} strength={props.strength}
      onHover={props.onHover} onSelectPoint={props.onSelectPoint} onSelectEntity={props.onSelectEntity} onMeasure={props.onMeasure} onPlaced={props.onPlaced} onGhost={props.onGhost} onNotice={props.onNotice} onPortClick={props.onPortClick} onPortHover={props.onPortHover} ring={ring} setOverlay={setOverlay} />
  </>;
}

export default function AgroCanvas(props: AgroCanvasProps) {
  return <Canvas className="agro-canvas" frameloop={props.mode === 'walk' ? 'always' : 'demand'} dpr={[1, 1.75]} camera={{position: [26, 46, 52], fov: 50, near: 0.5, far: 15500}} gl={{antialias: true, alpha: false}} data-testid="agro-canvas"
    onCreated={({camera}) => { camera.lookAt(0, 20, 0); }}>
    <Scene {...props} />
  </Canvas>;
}
