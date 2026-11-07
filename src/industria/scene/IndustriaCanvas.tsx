import {useEffect, useMemo, useRef, useState, type MutableRefObject, type ElementRef, type ReactNode} from 'react';
import {Canvas, useFrame, useThree, type ThreeEvent} from '@react-three/fiber';
import {Grid, Html, Line, OrbitControls} from '@react-three/drei';
import {CurvePath, LineCurve3, Plane, TubeGeometry, Vector2, Vector3} from 'three';
import type {IndustryProject, Pose, TerminalRef, Vec3} from '../model/types.ts';
import type {CameraState} from '../model/ui.ts';
import {shapeOf, type AnchorDef, type TerminalDef} from '../build/shapes.ts';
import {refKey, type Evaluation} from '../wiring/engine.ts';
import {CABLE_RADIUS, routeAll} from '../wiring/route.ts';
import {operableKind, type SimResult} from '../sim/engine.ts';
import {modelParts, type Detail} from './models.ts';
import {findSnapCandidates, movedPoses, overlapsOf, parentMountOf, snapToGrid, type SnapCandidate} from '../build/snap.ts';

/** Escenario de la fase 3: rejilla, cámara orbital, piezas con su forma, anclajes visibles, arrastre con vista previa translúcida alineada.
 *  No decide nada del modelo: calcula con funciones puras (build/snap.ts) y entrega el resultado a la aplicación con onDrop. */
export type IndustriaCanvasProps = {
  project: IndustryProject;
  selection: readonly string[];
  camera: CameraState;
  /** Cambia cuando se pide mover la cámara (vistas predefinidas, cámaras guardadas, encuadrar). */
  cameraNonce: number;
  /** En Simulación la estructura está protegida: no se arrastra. */
  editable: boolean;
  magnet: boolean;
  /** Modo Cablear: las piezas no se arrastran y sus terminales se pueden pulsar. */
  wiring: boolean;
  pending: TerminalRef | null;
  evaluation: Evaluation;
  /** Conexiones que se resaltan (las de la pieza seleccionada o la elegida en el panel). */
  highlight: readonly string[];
  onTerminal(ref: TerminalRef): void;
  /** Resultado de la simulación (null si está detenida) y si se puede operar con el ratón. */
  sim: SimResult | null;
  simRunning: boolean;
  onOperate(id: string, down: boolean): void;
  /** El usuario intentó arrastrar una pieza montada: la interfaz explica cómo moverla. */
  onBlockedDrag(id: string): void;
  onSelect(ids: string[]): void;
  onDrop(id: string, pose: Pose, candidate: SnapCandidate | null): void;
  onCameraRest(camera: CameraState): void;
  onContextLost(): void;
};

type Controls = ElementRef<typeof OrbitControls>;
type Preview = {id: string; pose: Pose; shown: Pose; candidate: SnapCandidate | null; overlaps: string[]};
type Drag = {id: string; plane: Plane; offset: Vector3; startPose: Pose; startClient: [number, number]; active: boolean; vertical: boolean};
const DRAG_THRESHOLD = 5; // px antes de considerar que es un arrastre y no un clic

function CameraRig({camera, nonce, onRest, controls}: {camera: CameraState; nonce: number; onRest(c: CameraState): void; controls: MutableRefObject<Controls | null>}) {
  const {camera: cam, invalidate} = useThree();
  useEffect(() => {
    cam.position.set(...camera.position);
    controls.current?.target.set(...camera.target);
    controls.current?.update();
    invalidate();
    // Solo cuando se pide explícitamente: no queremos pelear con el usuario al arrastrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);
  return <OrbitControls ref={controls} makeDefault enableDamping={false} maxPolarAngle={Math.PI * 0.499} minDistance={0.5} maxDistance={200}
    onEnd={() => { const c = controls.current; if (c) onRest({position: [cam.position.x, cam.position.y, cam.position.z], target: [c.target.x, c.target.y, c.target.z]}); }} />;
}

function AnchorDots({definitionId, only}: {definitionId: string; only?: AnchorDef['role']}) {
  return <>{shapeOf(definitionId).anchors.filter(a => !only || a.role === only).map(a =>
    <mesh key={a.id} position={a.position} renderOrder={5}><sphereGeometry args={[0.014, 12, 8]} /><meshBasicMaterial color={a.role === 'host' ? '#1f9d55' : '#2d6ff4'} depthTest={false} transparent opacity={0.95} /></mesh>)}</>;
}

const CABLE_COLOR: Record<string, string> = {power: '#c0392b', control: '#2d6ff4', signal: '#8e5bd6', earth: '#b8a100', pipe: '#555f6d'};

function Terminals({entityId, terminals, dot, pending, hover, onTerminal, onHover}: {entityId: string; terminals: readonly TerminalDef[]; dot: number; pending: TerminalRef | null; hover: string | null; onTerminal(ref: TerminalRef): void; onHover(key: string | null): void}) {
  return <>{terminals.map(t => {
    const ref = {entityId, terminalId: t.id}, key = refKey(ref), active = pending ? refKey(pending) === key : false, hot = hover === key;
    return <group key={t.id} position={t.position}>
      <mesh renderOrder={6} onPointerDown={e => { e.stopPropagation(); onTerminal(ref); }} onPointerOver={e => { e.stopPropagation(); onHover(key); }} onPointerOut={() => onHover(null)}>
        <sphereGeometry args={[active || hot ? dot * 1.5 : dot, 12, 8]} /><meshBasicMaterial color={active ? '#e08a00' : hot ? '#2d6ff4' : '#14181f'} depthTest={false} transparent opacity={0.95} />
      </mesh>
      {(active || hot) && <Html center distanceFactor={undefined} style={{pointerEvents: 'none'}} position={[0, dot * 3, 0]}><span className="ind-term-label">{t.label}</span></Html>}
    </group>;
  })}</>;
}

/** Cable con grosor: tubo que sigue la ruta (sale perpendicular al terminal y rodea las piezas). */
function CableTube({points, color, radius, emissive}: {points: Vec3[]; color: string; radius: number; emissive?: string}) {
  const geom = useMemo(() => {
    const path = new CurvePath<Vector3>(); let length = 0;
    for (let i = 1; i < points.length; i++) { const a = new Vector3(...points[i - 1]), b = new Vector3(...points[i]); if (a.distanceToSquared(b) > 1e-10) { path.add(new LineCurve3(a, b)); length += a.distanceTo(b); } }
    return path.curves.length ? new TubeGeometry(path, Math.min(400, Math.max(8, Math.round(length / 0.008))), radius, 8, false) : null;
  }, [points, radius]);
  useEffect(() => () => geom?.dispose(), [geom]);
  return geom ? <mesh geometry={geom} raycast={() => null} renderOrder={4}><meshStandardMaterial color={color} roughness={0.55} metalness={0.05} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.6 : 0} /></mesh> : null;
}

function Cables({project, evaluation, highlight, sim}: {project: IndustryProject; evaluation: Evaluation; highlight: readonly string[]; sim: SimResult | null}) {
  const routes = useMemo(() => routeAll(project), [project.entities, project.poses, project.connections]);
  return <>{project.connections.map(c => {
    const route = routes.get(c.id); if (!route) return null;
    const status = evaluation.status[c.id] ?? c.status, strong = highlight.includes(c.id), live = !!sim?.liveConnections.has(c.id);
    const color = live ? '#ff9800' : status === 'invalid' ? '#d9302c' : sim ? '#8d98a8' : CABLE_COLOR[c.kind] ?? '#555f6d';
    return <CableTube key={c.id} points={route} color={color} radius={CABLE_RADIUS * (strong ? 1.8 : live ? 1.25 : 1)} emissive={live ? '#ff9800' : status === 'invalid' ? '#d9302c' : undefined} />;
  })}</>;
}

/** Marcador sobre el motor que gira mientras está alimentado (con «reducir movimiento» queda quieto). */
function SpinMarker({y}: {y: number}) {
  const ref = useRef<import('three').Mesh | null>(null);
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((state, dt) => { if (still || !ref.current) return; ref.current.rotation.y += dt * 9; state.invalidate(); });
  return <mesh ref={ref} position={[0, y, 0]}><boxGeometry args={[0.13, 0.012, 0.022]} /><meshBasicMaterial color="#ff9800" /></mesh>;
}

/** Forma real de la pieza (cuerpo, frente, palancas, tornillos, LED…). La caja del catálogo queda debajo, invisible, solo para seleccionar y arrastrar. */
function ModelMesh({definitionId, detail, selected, overlapping, glow}: {definitionId: string; detail: Detail; selected: boolean; overlapping?: boolean; glow?: string}) {
  const parts = useMemo(() => modelParts(definitionId, detail), [definitionId, detail]);
  return <>{parts.map((p, i) => {
    const bodyLike = p.role === 'body' || p.role === 'front';
    const glowing = glow !== undefined && (definitionId === 'piloto' ? p.role === 'lens' : p.role === 'body' || p.role === 'front');
    const emissive = p.emissive ?? (glowing ? glow : selected && bodyLike ? '#1b4fc4' : '#000000');
    const intensity = p.emissive ? 0.9 : glowing ? 0.75 : selected && bodyLike ? 0.4 : 0;
    const color = overlapping && bodyLike ? '#d9534f' : p.color;
    const rotation: [number, number, number] = p.shape === 'cyl' ? (p.axis === 'x' ? [0, 0, Math.PI / 2] : p.axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]) : [0, 0, 0];
    return <mesh key={i} position={p.pos} rotation={rotation} raycast={() => null}>
      {p.shape === 'box' ? <boxGeometry args={p.size} /> : p.shape === 'cyl' ? <cylinderGeometry args={[p.size[0], p.size[0], p.size[1], 20]} /> : <sphereGeometry args={[p.size[0], 16, 12]} />}
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} roughness={p.role === 'metal' || p.role === 'screw' ? 0.35 : 0.7} metalness={p.role === 'metal' || p.role === 'screw' ? 0.7 : 0.05} transparent={p.role === 'lens'} opacity={p.role === 'lens' ? 0.92 : 1} />
    </mesh>;
  })}</>;
}

function Piece({id, definitionId, pose, selected, ghost, showAnchors, overlapping, draggable, onDown, xray, terminals, glow, extra, detail}: {
  id: string; definitionId: string; pose: Pose; selected: boolean; ghost?: boolean; showAnchors: boolean; overlapping?: boolean; draggable: boolean; onDown?(e: ThreeEvent<PointerEvent>): void; xray?: boolean; terminals?: ReactNode; glow?: string; extra?: ReactNode; detail?: Detail;
}) {
  const shape = shapeOf(definitionId);
  const color = ghost ? '#2d6ff4' : overlapping ? '#d9534f' : selected ? '#2d6ff4' : shape.color;
  return <group position={pose.position} rotation={pose.rotation} name={ghost ? undefined : id} userData={{entityId: id}}>
    {!ghost && <ModelMesh definitionId={definitionId} detail={detail ?? 'high'} selected={selected} overlapping={overlapping} glow={glow} />}
    <mesh position={shape.center} onPointerDown={ghost ? undefined : onDown} raycast={ghost || xray ? () => null : undefined}>
      <boxGeometry args={shape.size} />
      {!ghost ? <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /> : <meshStandardMaterial color={color} transparent={ghost} opacity={ghost ? 0.4 : 1} depthWrite={!ghost} emissive={glow ?? (selected && !ghost ? '#1b4fc4' : '#000000')} emissiveIntensity={glow ? 0.75 : selected && !ghost ? 0.35 : 0} />}
    </mesh>
    {showAnchors && !ghost && <AnchorDots definitionId={definitionId} />}
    {terminals}
    {extra}
  </group>;
}

function Scene({project, selection, camera, cameraNonce, editable, magnet, wiring, pending, evaluation, highlight, onTerminal, sim, simRunning, onOperate, onBlockedDrag, onSelect, onDrop, onCameraRest, justDragged}: IndustriaCanvasProps & {justDragged: MutableRefObject<boolean>}) {
  const {gl, camera: cam, raycaster, invalidate, scene} = useThree();
  const controls = useRef<Controls | null>(null);
  const drag = useRef<Drag | null>(null);
  const latest = useRef({project, magnet, onDrop});
  latest.current = {project, magnet, onDrop};
  const [preview, setPreview] = useState<Preview | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const dist = cam.position.distanceTo(controls.current?.target ?? new Vector3(0, 0.8, 0));
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches; // dedo: puntos de terminal más grandes
  const dot = Math.min(coarse ? 0.0085 : 0.009, Math.max(coarse ? 0.0085 : 0.005, dist * 0.0035));
  const spinning = sim ? project.entities.filter(e => e.definitionId === 'motor-3p' && sim.energized[e.id]).length : 0;
  useEffect(() => { gl.domElement.dataset.spinning = String(spinning); invalidate(); }, [spinning, gl, invalidate]);
  useEffect(() => { let n = 0; scene.traverse(o => { if ((o as {isMesh?: boolean}).isMesh) n++; }); gl.domElement.dataset.meshes = String(n); });

  const poses = useMemo(() => (preview ? movedPoses(project, preview.id, preview.shown) : project.poses), [project, preview]);
  useEffect(() => { invalidate(); }, [poses, invalidate]);

  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);

  const ndc = (clientX: number, clientY: number) => { const r = gl.domElement.getBoundingClientRect(); return new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); };

  const begin = (id: string, e: ThreeEvent<PointerEvent>) => {
    const { project: proj } = latest.current;
    const ent = proj.entities.find(x => x.id === id), start = proj.poses[id];
    if (!editable || wiring || !ent || !start || ent.locked || parentMountOf(proj, id)) return;
    const plane = new Plane(new Vector3(0, 1, 0), -start.position[1]);
    const hit = e.ray.intersectPlane(plane, new Vector3());
    if (!hit) return;
    drag.current = {id, plane, offset: new Vector3(start.position[0] - hit.x, 0, start.position[2] - hit.z), startPose: start, startClient: [e.nativeEvent.clientX, e.nativeEvent.clientY], active: false, vertical: false};
    if (controls.current) controls.current.enabled = false;

    const move = (ev: PointerEvent) => {
      const d = drag.current; if (!d) return;
      if (!d.active && Math.hypot(ev.clientX - d.startClient[0], ev.clientY - d.startClient[1]) < DRAG_THRESHOLD) return;
      d.active = true; gl.domElement.style.cursor = 'grabbing';
      let position: Vec3 = [...d.startPose.position];
      if (ev.shiftKey) { // Mayús: subir o bajar la pieza
        const scale = (cam.position.distanceTo(controls.current?.target ?? new Vector3())) * 0.004;
        position = [d.startPose.position[0], Math.max(0, d.startPose.position[1] + (d.startClient[1] - ev.clientY) * scale), d.startPose.position[2]];
      } else {
        raycaster.setFromCamera(ndc(ev.clientX, ev.clientY), cam);
        const p = raycaster.ray.intersectPlane(d.plane, new Vector3());
        if (p) position = [p.x + d.offset.x, d.startPose.position[1], p.z + d.offset.z];
      }
      const raw: Pose = {position, rotation: d.startPose.rotation};
      const candidates = findSnapCandidates(latest.current.project, d.id, raw);
      const candidate = candidates[0] ?? null;
      const shown: Pose = candidate ? candidate.pose : latest.current.magnet ? {position: snapToGrid(raw.position), rotation: raw.rotation} : raw;
      gl.domElement.dataset.snap = candidate ? `${candidate.child.entityId}:${candidate.child.anchorId}>${candidate.parent.entityId}:${candidate.parent.anchorId}` : '';
      setPreview({id: d.id, pose: raw, shown, candidate, overlaps: overlapsOf(latest.current.project, d.id, shown)});
    };
    const finish = (ev: PointerEvent, cancelled: boolean) => {
      const d = drag.current; drag.current = null; cleanup.current();
      gl.domElement.style.cursor = ''; delete gl.domElement.dataset.snap;
      if (controls.current) controls.current.enabled = true;
      if (!d || !d.active) { setPreview(null); return; }
      justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 0);
      setPreview(current => {
        if (!cancelled && current) latest.current.onDrop(d.id, current.pose, current.candidate);
        return null;
      });
      void ev;
    };
    const up = (ev: PointerEvent) => finish(ev, false), cancel = (ev: PointerEvent) => finish(ev, true);
    const key = (ev: KeyboardEvent) => { if (ev.key === 'Escape') { drag.current = null; cleanup.current(); gl.domElement.style.cursor = ''; delete gl.domElement.dataset.snap; if (controls.current) controls.current.enabled = true; setPreview(null); } };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel); addEventListener('keydown', key);
    cleanup.current = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel); removeEventListener('keydown', key); };
  };

  const dragging = preview !== null;
  const ghostEntity = preview?.candidate ? project.entities.find(x => x.id === preview.id) : undefined;
  return <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[6, 10, 4]} intensity={1.1} />
    <Grid args={[40, 40]} cellSize={0.5} cellThickness={0.6} cellColor="#d5dae1" sectionSize={5} sectionThickness={1} sectionColor="#bcc4cf" fadeDistance={40} fadeStrength={1} infiniteGrid />
    {project.entities.map(e => {
      const pose = poses[e.id]; if (!pose) return null;
      return <Piece key={e.id} id={e.id} definitionId={e.definitionId} pose={pose} selected={selection.includes(e.id)} showAnchors={dragging || selection.includes(e.id)}
        overlapping={!!preview && (preview.overlaps.includes(e.id) || (preview.id === e.id && preview.overlaps.length > 0))} draggable={editable && !wiring && !e.locked && !parentMountOf(project, e.id)} xray={wiring}
        terminals={(wiring || selection.includes(e.id)) && shapeOf(e.definitionId).terminals ? <Terminals entityId={e.id} terminals={shapeOf(e.definitionId).terminals!} dot={dot} pending={pending} hover={hover} onTerminal={wiring ? onTerminal : () => {}} onHover={wiring ? setHover : () => {}} /> : null}
        detail={project.entities.length > 80 ? 'low' : 'high'}
        extra={e.definitionId === 'motor-3p' && sim?.energized[e.id] ? <SpinMarker y={shapeOf(e.definitionId).size[1] + 0.012} /> : null}
        glow={sim ? (sim.energized[e.id] ? (e.definitionId === 'piloto' ? '#ffd54f' : '#ff9800') : sim.closed[e.id] ? '#1f9d55' : undefined) : undefined}
        onDown={ev => { ev.stopPropagation(); onSelect([e.id]); if (simRunning && operableKind(e.definitionId)) { onOperate(e.id, true); const release = () => { removeEventListener('pointerup', release); removeEventListener('pointercancel', release); onOperate(e.id, false); }; addEventListener('pointerup', release); addEventListener('pointercancel', release); return; }
          if (editable && !wiring && parentMountOf(project, e.id)) { const sx = ev.nativeEvent.clientX, sy = ev.nativeEvent.clientY; const stop = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', stop); removeEventListener('pointercancel', stop); }; const mv = (m: PointerEvent) => { if (Math.hypot(m.clientX - sx, m.clientY - sy) > 8) { stop(); onBlockedDrag(e.id); } }; addEventListener('pointermove', mv); addEventListener('pointerup', stop); addEventListener('pointercancel', stop); }
          begin(e.id, ev); }} />;
    })}
    {preview?.candidate && ghostEntity && <>
      <Piece id={ghostEntity.id} definitionId={ghostEntity.definitionId} pose={preview.candidate.pose} selected={false} ghost showAnchors={false} draggable={false} />
      <Line points={[preview.pose.position, preview.candidate.point]} color="#2d6ff4" lineWidth={1.5} dashed dashSize={0.04} gapSize={0.03} />
      <mesh position={preview.candidate.point}><sphereGeometry args={[0.022, 14, 10]} /><meshBasicMaterial color="#1f9d55" depthTest={false} transparent opacity={0.95} /></mesh>
    </>}
    <Cables project={project} evaluation={evaluation} highlight={highlight} sim={sim} />
    <CameraRig camera={camera} nonce={cameraNonce} onRest={onCameraRest} controls={controls} />
  </>;
}

export default function IndustriaCanvas(props: IndustriaCanvasProps) {
  const justDragged = useRef(false);
  return <Canvas className="rb-canvas ind-canvas" frameloop="demand" dpr={[1, 1.75]} camera={{position: props.camera.position, fov: 45, near: 0.05, far: 500}} gl={{alpha: true, antialias: true}}
    onCreated={({gl}) => { gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); props.onContextLost(); }); }}
    onPointerMissed={() => { if (!justDragged.current) props.onSelect([]); }} data-testid="industria-canvas">
    <Scene {...props} justDragged={justDragged} />
  </Canvas>;
}

