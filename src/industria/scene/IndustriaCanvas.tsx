import {useEffect, useMemo, useRef, useState, type MutableRefObject, type ElementRef, type ReactNode} from 'react';
import {Canvas, useFrame, useThree, type ThreeEvent} from '@react-three/fiber';
import {Grid, Html, Line, OrbitControls} from '@react-three/drei';
import {CanvasTexture, CatmullRomCurve3, DirectionalLight, DoubleSide, MOUSE, Plane, Quaternion, SRGBColorSpace, TOUCH, TubeGeometry, Vector2, Vector3, type Group} from 'three';
import type {IndustryProject, Pose, TerminalRef, Vec3} from '../model/types.ts';
import type {CameraState} from '../model/ui.ts';
import {shapeOf, type AnchorDef, type TerminalDef} from '../build/shapes.ts';
import {refKey, type Evaluation} from '../wiring/engine.ts';
import {CABLE_RADIUS, collisionBoxes, routeAll, segmentHits} from '../wiring/route.ts';
import {wireLook, wireName} from '../wiring/colors.ts';
import {hallBounds, hallParts, hasHall, type HallBounds, type HallPart} from './hall.ts';
import {flexCable, insertWaypoint, interiorOf, midpointsOf, moveWaypoint, removeWaypoint} from '../wiring/curve.ts';
import {operableKind, type SimResult} from '../sim/engine.ts';
import {productOffset, robotAngle, ROD_STROKE, type ProcessState} from '../sim/process.ts';
import type {Detail, Variant} from './models.ts';
import ModelMesh from './ModelMesh';
import {containerOf} from '../model/inspection.ts';
import {doorPoses, hasDoor, stepDoor, wantsOpen} from './doors.ts';
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
  moveParts: boolean;
  cutaway: boolean;
  interior: string | null;
  closedCabinet: string | null;
  uncoverDucts: boolean;
  onCabinetDoor(id: string): void;
  panCamera: boolean;
  operateParts: boolean;
  /** Modo Cablear: las piezas no se arrastran y sus terminales se pueden pulsar. */
  wiring: boolean;
  pending: TerminalRef | null;
  evaluation: Evaluation;
  /** Conexiones que se resaltan (las de la pieza seleccionada o la elegida en el panel). */
  highlight: readonly string[];
  /** Cable elegido en el panel: muestra sus puntos de paso (arrastrar para moverlo, punto claro para añadir, doble clic para quitar). */
  editCable: string | null;
  onRoute(connectionId: string, interior: Vec3[]): void;
  onTerminal(ref: TerminalRef): void;
  /** Resultado de la simulación (null si está detenida) y si se puede operar con el ratón. */
  sim: SimResult | null;
  /** Estado mecánico del proceso (cajas sobre la cinta, vástagos, robot); null si la simulación está detenida. */
  proc: ProcessState | null;
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
type Drag = {id: string; plane: Plane; offset: Vector3; startPose: Pose; startClient: [number, number]; active: boolean};
const DRAG_THRESHOLD = 5; // px antes de considerar que es un arrastre y no un clic

const PAN_MOUSE = {LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};
const ORBIT_MOUSE = {...PAN_MOUSE, LEFT: MOUSE.ROTATE};
const PAN_TOUCH = {ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN};
const ORBIT_TOUCH = {...PAN_TOUCH, ONE: TOUCH.ROTATE};

function CameraRig({camera, nonce, pan, onRest, controls}: {camera: CameraState; nonce: number; pan: boolean; onRest(c: CameraState): void; controls: MutableRefObject<Controls | null>}) {
  const {camera: cam, invalidate} = useThree();
  useEffect(() => {
    cam.position.set(...camera.position);
    controls.current?.target.set(...camera.target);
    controls.current?.update();
    invalidate();
    // Solo cuando se pide explícitamente: no queremos pelear con el usuario al arrastrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);
  return <OrbitControls ref={controls} makeDefault mouseButtons={pan ? PAN_MOUSE : ORBIT_MOUSE} touches={pan ? PAN_TOUCH : ORBIT_TOUCH} enableDamping={false} maxPolarAngle={Math.PI * 0.499} minDistance={0.5} maxDistance={200}
    onEnd={() => { const c = controls.current; if (c) onRest({position: [cam.position.x, cam.position.y, cam.position.z], target: [c.target.x, c.target.y, c.target.z]}); }} />;
}

function AnchorDots({definitionId, only}: {definitionId: string; only?: AnchorDef['role']}) {
  return <>{shapeOf(definitionId).anchors.filter(a => !only || a.role === only).map(a =>
    <mesh key={a.id} position={a.position} renderOrder={5}><sphereGeometry args={[0.014, 12, 8]} /><meshBasicMaterial color={a.role === 'host' ? '#1f9d55' : '#2d6ff4'} depthTest={false} transparent opacity={0.95} /></mesh>)}</>;
}


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

/** Cable flexible con grosor: curva suave por la ruta (esquinas redondeadas y caída en los tramos largos). */
function CableTube({points, color, radius, emissive}: {points: Vec3[]; color: string; radius: number; emissive?: string}) {
  const geom = useMemo(() => {
    const pts: Vector3[] = []; let length = 0;
    for (const p of points) { const v = new Vector3(...p); if (!pts.length || pts[pts.length - 1].distanceToSquared(v) > 1e-8) { if (pts.length) length += pts[pts.length - 1].distanceTo(v); pts.push(v); } }
    return pts.length > 1 ? new TubeGeometry(new CatmullRomCurve3(pts, false, 'centripetal'), Math.min(600, Math.max(12, Math.round(length / 0.006))), radius, 10, false) : null;
  }, [points, radius]);
  useEffect(() => () => geom?.dispose(), [geom]);
  return geom ? <mesh geometry={geom} raycast={() => null} renderOrder={4}><meshStandardMaterial color={color} roughness={0.42} metalness={0.08} emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.6 : 0} /></mesh> : null;
}

/** Etiqueta de cable (W1, W2…) dibujada como sprite con su propio lienzo: sin DOM ni fuentes externas, funciona sin conexión. */
function WireTag({at, text}: {at: Vec3; text: string}) {
  const tex = useMemo(() => {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 48; const g = cv.getContext('2d');
    if (g) { g.fillStyle = '#fffbe6'; g.strokeStyle = '#9a7b00'; g.lineWidth = 4; g.beginPath(); g.roundRect(3, 3, 122, 42, 10); g.fill(); g.stroke(); g.fillStyle = '#1b1f27'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 26); }
    const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; return t;
  }, [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return <sprite position={at} scale={[0.075, 0.028, 1]} renderOrder={8} raycast={() => null}><spriteMaterial map={tex} depthTest={false} transparent /></sprite>;
}

/** Puntera del cable: manguito de plástico con el color de su sección y punta metálica, orientado hacia dentro del cable. */
function Ferrule({at, toward, radius, color}: {at: Vec3; toward: Vec3; radius: number; color: string}) {
  const q = useMemo(() => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(toward[0] - at[0], toward[1] - at[1], toward[2] - at[2]).normalize()), [at, toward]);
  return <group position={at} quaternion={q}>
    <mesh position={[0, 0.0105, 0]} raycast={() => null} renderOrder={4}><cylinderGeometry args={[radius * 1.6, radius * 1.6, 0.013, 14]} /><meshStandardMaterial color={color} roughness={0.5} /></mesh>
    <mesh position={[0, 0.0015, 0]} raycast={() => null} renderOrder={4}><cylinderGeometry args={[radius * 1.1, radius * 1.1, 0.005, 12]} /><meshStandardMaterial color="#c9ced6" metalness={0.85} roughness={0.3} /></mesh>
  </group>;
}

function Cables({project, doors, cabinetParts, evaluation, highlight, sim, live: liveRoute}: {project: IndustryProject; doors: Readonly<Record<string, number>>; cabinetParts: ReadonlyMap<string, string>; evaluation: Evaluation; highlight: readonly string[]; sim: SimResult | null; live: {id: string; interior: Vec3[]} | null}) {
  const routes = useMemo(() => routeAll(project, doors), [project.entities, project.poses, project.connections, doors]);
  const boxes = useMemo(() => [...collisionBoxes(project).values()], [project.entities, project.poses]);
  const flexed = useMemo(() => { const m = new Map<string, Vec3[]>(); for (const c of project.connections) { const r = routes.get(c.id); if (!r) continue; const guided = !c.route?.length && (cabinetParts.has(c.a.entityId) || cabinetParts.has(c.b.entityId)); m.set(c.id, flexCable(r, guided ? {radius: 0.013, sag: 0} : {blocked: (a, b) => segmentHits(a, b, boxes)})); } return m; }, [routes, boxes, project.connections, cabinetParts]);
  const liveFlex = useMemo(() => { if (!liveRoute) return null; const r = routes.get(liveRoute.id); return r ? flexCable([r[0], ...liveRoute.interior, r[r.length - 1]]) : null; }, [liveRoute, routes]);
  return <>{project.connections.map(c => {
    const route = liveRoute?.id === c.id && liveFlex ? liveFlex : flexed.get(c.id); if (!route) return null;
    const status = evaluation.status[c.id] ?? c.status, strong = highlight.includes(c.id), live = !!sim?.liveConnections.has(c.id);
    const look = wireLook(project, c), color = live ? '#ff9800' : status === 'invalid' ? '#d9302c' : sim ? '#8d98a8' : look.color;
    const r = CABLE_RADIUS * (strong ? 1.8 : live ? 1.25 : 1), tube = look.role === 'PIPE' ? r * 1.7 : r;
    return <group key={c.id}>
      <CableTube points={route} color={color} radius={tube} emissive={live ? '#ff9800' : status === 'invalid' ? '#d9302c' : undefined} />
      {look.role !== 'PIPE' && <><Ferrule at={route[0]} toward={route[1]} radius={r} color={look.ferrule.color} /><Ferrule at={route[route.length - 1]} toward={route[route.length - 2]} radius={r} color={look.ferrule.color} /></>}
      {strong && <>{[route[0], route[route.length - 1]].map((q, k) => <WireTag key={k} at={[q[0], q[1] + 0.035, q[2]]} text={wireName(project, c)} />)}</>}
    </group>;
  })}</>;
}

/** Puntos de paso del cable elegido: se arrastran en 3D (plano de la pantalla); el punto claro entre dos tramos añade uno nuevo; doble clic quita. */
function CableHandles({project, doors, id, dot, controls, onLive, onCommit}: {project: IndustryProject; doors: Readonly<Record<string, number>>; id: string; dot: number; controls: MutableRefObject<Controls | null>; onLive(l: {id: string; interior: Vec3[]} | null): void; onCommit(interior: Vec3[]): void}) {
  const {gl, camera: cam, raycaster, invalidate} = useThree();
  const route = useMemo(() => routeAll(project, doors).get(id) ?? null, [project.entities, project.poses, project.connections, id, doors]);
  const state = useRef<{interior: Vec3[]; index: number; plane: Plane} | null>(null);
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);
  if (!route) return null;
  const interior = interiorOf(route), mids = midpointsOf(route);
  const ndc = (x: number, y: number) => { const r = gl.domElement.getBoundingClientRect(); return new Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); };
  const start = (e: ThreeEvent<PointerEvent>, base: Vec3[], index: number) => {
    if (e.button !== 0 || !e.isPrimary || e.ctrlKey || e.metaKey) return;
    e.stopPropagation();
    const at = new Vector3(...base[index]), normal = cam.getWorldDirection(new Vector3()).negate();
    state.current = {interior: base, index, plane: new Plane().setFromNormalAndCoplanarPoint(normal, at)};
    if (controls.current) controls.current.enabled = false;
    onLive({id, interior: base});
    const move = (ev: PointerEvent) => {
      const st = state.current; if (!st) return;
      raycaster.setFromCamera(ndc(ev.clientX, ev.clientY), cam);
      const hit = raycaster.ray.intersectPlane(st.plane, new Vector3()); if (!hit) return;
      const to: Vec3 = [hit.x, Math.max(0.005, hit.y), hit.z];
      st.interior = moveWaypoint(st.interior, st.index, to); onLive({id, interior: st.interior}); invalidate();
    };
    const end = () => { const st = state.current; state.current = null; cleanup.current(); if (controls.current) controls.current.enabled = true; onLive(null); if (st) onCommit(st.interior); };
    addEventListener('pointermove', move); addEventListener('pointerup', end); addEventListener('pointercancel', end);
    cleanup.current = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end); };
  };
  return <>
    {interior.map((p, i) => <mesh key={'w' + i} position={p} renderOrder={7} name="cable-waypoint" onPointerDown={e => start(e, interior, i)} onDoubleClick={e => { e.stopPropagation(); onCommit(removeWaypoint(interior, i)); }}>
      <sphereGeometry args={[dot * 1.25, 14, 10]} /><meshBasicMaterial color="#2d6ff4" depthTest={false} transparent opacity={0.95} /></mesh>)}
    {mids.map((p, i) => <mesh key={'m' + i} position={p} renderOrder={7} name="cable-midpoint" onPointerDown={e => start(e, insertWaypoint(interior, i, p), i)}>
      <sphereGeometry args={[dot * 0.8, 12, 8]} /><meshBasicMaterial color="#ffffff" depthTest={false} transparent opacity={0.9} /></mesh>)}
  </>;
}

/** Marcador sobre el motor que gira mientras está alimentado (con «reducir movimiento» queda quieto). */
function SpinMarker({y}: {y: number}) {
  const ref = useRef<import('three').Mesh | null>(null);
  const still = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame((state, dt) => { if (still || !ref.current) return; ref.current.rotation.y += dt * 9; state.invalidate(); });
  return <mesh ref={ref} position={[0, y, 0]}><boxGeometry args={[0.13, 0.012, 0.022]} /><meshBasicMaterial color="#ff9800" /></mesh>;
}

/** Forma real de la pieza (cuerpo, frente, palancas, tornillos, LED…). La caja del catálogo queda debajo, invisible, solo para seleccionar y arrastrar. */
function ProcessExtra({definitionId, id, proc, sim}: {definitionId: string; id: string; proc: ProcessState | null; sim: SimResult | null}) {
  if (definitionId === 'cilindro-neumatico' && proc) { const ext = (proc.rods[id] ?? 0) * ROD_STROKE; return ext > 0.0005 ? <mesh position={[0.2 + ext / 2, 0.035, 0]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}><cylinderGeometry args={[0.008, 0.008, ext, 16]} /><meshStandardMaterial color="#c4cad2" metalness={0.85} roughness={0.25} /></mesh> : null; }
  if ((definitionId === 'cinta-transportadora' || definitionId === 'cinta-larga') && proc) { const phase = proc.belts[id] ?? 0, L = shapeOf(definitionId).size[0] - 0.16, n = Math.round(L / 0.18), out = []; for (let i = 0; i < n; i++) { const u = ((i * 0.18 + phase) % L) - L / 2; out.push(<mesh key={i} position={[u, 0.8 - 0.0006, 0]} raycast={() => null}><boxGeometry args={[0.014, 0.002, 0.34]} /><meshStandardMaterial color="#6b7480" roughness={0.8} /></mesh>); } return <>{out}</>; }
  if (definitionId === 'torre-luminosa' && sim) return <>{(['R', 'Y', 'G'] as const).map((c, i) => sim.energized[`${id}:${c}`] ? <mesh key={c} position={[0, [0.22, 0.16, 0.1][i], 0]} raycast={() => null}><cylinderGeometry args={[0.0325, 0.0325, 0.062, 20]} /><meshStandardMaterial color={['#ff4d4d', '#ffc233', '#3dff8a'][i]} emissive={['#ff2a2a', '#ffb000', '#1fff6a'][i]} emissiveIntensity={1.4} transparent opacity={0.9} /></mesh> : null)}</>;
  return null;
}

/** Recintos huecos: solo se pueden seleccionar por esta zona (zócalo o base del muro), para no taparle el clic a lo que hay dentro. */
const HIT_BOX: Record<string, {position: Vec3; size: Vec3}> = {gabinete: {position: [0, 0.05, 0], size: [1, 0.1, 0.35]}, 'sala-electrica': {position: [2.425, 0.15, 0], size: [0.15, 0.3, 3.1]}};

function Piece({id, definitionId, pose, selected, ghost, showAnchors, overlapping, onDown, onClick, xray, terminals, glow, extra, detail, swing, variant, doorMode, door, cutRoom, onDoorClick, uncoverDuct, cabinetPlate}: {
  swing?: number; variant?: Variant; doorMode?: string; door?: number; cutRoom?: boolean; onDoorClick?(event: ThreeEvent<MouseEvent>): void; uncoverDuct?: boolean; cabinetPlate?: boolean; id: string; definitionId: string; pose: Pose; selected: boolean; ghost?: boolean; showAnchors: boolean; overlapping?: boolean; onDown?(e: ThreeEvent<PointerEvent>): void; onClick?(e: ThreeEvent<MouseEvent>): void; xray?: boolean; terminals?: ReactNode; glow?: string; extra?: ReactNode; detail?: Detail;
}) {
  const shape = shapeOf(definitionId);
  const color = ghost ? '#2d6ff4' : overlapping ? '#d9534f' : selected ? '#2d6ff4' : shape.color;
  return <group position={pose.position} rotation={pose.rotation} name={ghost ? undefined : id} userData={{entityId: id}}>
    {!ghost && swing === undefined && <ModelMesh definitionId={definitionId} detail={detail ?? 'high'} selected={selected} overlapping={overlapping} glow={glow} variant={variant} doorMode={doorMode} door={door} cutRoom={cutRoom} onDoorClick={onDoorClick} uncoverDuct={uncoverDuct} cabinetPlate={cabinetPlate} />}
    {!ghost && swing !== undefined && <>
      <ModelMesh definitionId={definitionId} detail={detail ?? 'high'} selected={selected} overlapping={overlapping} glow={glow} only={y => y < 0.12} />
      <group position={[-0.12, 0, 0]} rotation={[0, swing, 0]}><group position={[0.12, 0, 0]}><ModelMesh definitionId={definitionId} detail={detail ?? 'high'} selected={selected} overlapping={overlapping} glow={glow} only={y => y >= 0.12} /></group></group>
    </>}
    <mesh position={HIT_BOX[definitionId]?.position ?? shape.center} onPointerDown={onDown} onClick={onClick} raycast={ghost || xray ? () => null : undefined}>
      <boxGeometry args={HIT_BOX[definitionId]?.size ?? shape.size} />
      {!ghost ? <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /> : <meshStandardMaterial color={color} transparent={ghost} opacity={ghost ? 0.4 : 1} depthWrite={!ghost} emissive={glow ?? (selected && !ghost ? '#1b4fc4' : '#000000')} emissiveIntensity={glow ? 0.75 : selected && !ghost ? 0.35 : 0} />}
    </mesh>
    {showAnchors && !ghost && <AnchorDots definitionId={definitionId} />}
    {terminals}
    {extra}
  </group>;
}

/** Nave industrial alrededor de la planta (decorado). Las paredes que quedan entre la cámara y la planta se ocultan para ver el interior desde fuera. */
type Side = 'n' | 's' | 'e' | 'w' | 'all';
function Hall({bounds, cutaway}: {bounds: HallBounds; cutaway: boolean}) {
  const groups = useMemo(() => {
    const {cx, cz, w, d} = bounds, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, g: Record<Side, HallPart[]> = {n: [], s: [], e: [], w: [], all: []};
    for (const p of hallParts(bounds)) {
      const near: [Side, number][] = [['n', Math.abs(p.pos[2] - z0)], ['s', Math.abs(p.pos[2] - z1)], ['e', Math.abs(p.pos[0] - x1)], ['w', Math.abs(p.pos[0] - x0)]];
      const [side, dist] = near.reduce((a, b) => (b[1] < a[1] ? b : a));
      const onWall = p.kind === 'wall' || p.kind === 'glass' || p.kind === 'door' || (p.kind === 'sign' && dist < 0.3);
      g[onWall && dist < 0.4 ? side : 'all'].push(p);
    }
    return g;
  }, [bounds]);
  const refs = useRef<Partial<Record<Side, Group | null>>>({});
  useFrame(({camera}) => {
    const {cx, cz, w, d} = bounds, x = camera.position.x, z = camera.position.z, r = refs.current;
    if (r.n) r.n.visible = !cutaway || z > cz - d / 2 - 0.1; if (r.s) r.s.visible = !cutaway || z < cz + d / 2 + 0.1; if (r.w) r.w.visible = !cutaway || x > cx - w / 2 - 0.1; if (r.e) r.e.visible = !cutaway || x < cx + w / 2 + 0.1;
  });
  return <group>{(Object.keys(groups) as Side[]).map(side => <group key={side} ref={g => { refs.current[side] = g; }}>
    {groups[side].map((p, i) => <mesh key={i} position={p.pos} rotation={p.shape === 'cyl' ? (p.axis === 'x' ? [0, 0, Math.PI / 2] : p.axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]) : [0, 0, 0]} raycast={() => null} receiveShadow={p.kind === 'floor'}>
      {p.shape === 'box' ? <boxGeometry args={p.size} /> : <cylinderGeometry args={[p.size[0], p.size[0], p.size[1], 14]} />}
      <meshStandardMaterial color={p.color} emissive={p.emissive ?? '#000000'} emissiveIntensity={p.emissive ? (p.kind === 'lamp' ? 1.1 : 0.35) : 0} roughness={p.kind === 'floor' ? 0.9 : p.kind === 'glass' ? 0.1 : 0.7} metalness={p.kind === 'steel' ? 0.35 : 0.02} transparent={p.opacity !== undefined} opacity={p.opacity ?? 1} side={p.kind === 'glass' ? DoubleSide : undefined} />
    </mesh>)}
  </group>)}</group>;
}

/** Luz principal con sombras: encuadra la escena (centro y tamaño) y mira al centro. */
function KeyLight({c, r, shadow}: {c: Vec3; r: number; shadow: boolean}) {
  const light = useMemo(() => new DirectionalLight('#ffffff', 1.25), []);
  useEffect(() => {
    light.position.set(c[0] + r * 0.9, r * 1.8 + 0.5, c[2] + r * 1.1); light.target.position.set(c[0], 0, c[2]); light.target.updateMatrixWorld();
    light.castShadow = shadow; light.shadow.mapSize.set(2048, 2048); light.shadow.bias = -0.0004; light.shadow.normalBias = 0.003;
    const cam = light.shadow.camera; cam.left = -r * 1.4; cam.right = r * 1.4; cam.top = r * 1.4; cam.bottom = -r * 1.4; cam.near = 0.1; cam.far = r * 8 + 4; cam.updateProjectionMatrix();
  }, [light, c, r, shadow]);
  return <><primitive object={light} /><primitive object={light.target} /></>;
}

function Scene({project, selection, camera, cameraNonce, editable, magnet, cutaway, interior, closedCabinet, onCabinetDoor, uncoverDucts, moveParts, panCamera, operateParts, wiring, pending, evaluation, highlight, editCable, onRoute, onTerminal, sim, proc, simRunning, onOperate, onBlockedDrag, onSelect, onDrop, onCameraRest, justDragged}: IndustriaCanvasProps & {justDragged: MutableRefObject<boolean>}) {
  const {gl, camera: cam, raycaster, invalidate, scene} = useThree();
  const controls = useRef<Controls | null>(null);
  const drag = useRef<Drag | null>(null);
  const latest = useRef({project, magnet, onDrop});
  latest.current = {project, magnet, onDrop};
  const [preview, setPreview] = useState<Preview | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  // Puertas: avance animado 0..1 hacia el destino (propiedad `puerta`); los mandos de la puerta y sus cables la siguen
  const doorTargets = useMemo(() => Object.fromEntries(project.entities.filter(e => hasDoor(e.definitionId)).map(e => [e.id, (interior === e.id || (closedCabinet !== e.id && wantsOpen(e.props))) ? 1 : 0])), [project.entities, interior, closedCabinet]);
  const [doors, setDoors] = useState<Record<string, number>>({});
  const doorsRef = useRef<Record<string, number>>({});
  const invalidateRef = useRef(invalidate); invalidateRef.current = invalidate;
  useEffect(() => {
    let raf = 0, last = performance.now();
    const animate = (now: number) => {
      const dt = Math.max(0, Math.min(0.3, (now - last) / 1000)); last = now; // tiempo real: en equipos lentos la puerta sigue tardando ~0,7 s
      const cur = doorsRef.current, next = {...cur}; let changed = false, pending = false;
      for (const [id, t] of Object.entries(doorTargets)) { const v = stepDoor(cur[id] ?? 0, t, dt); if (v !== (cur[id] ?? 0)) { next[id] = v; changed = true; } if (v !== t) pending = true; }
      if (changed) { doorsRef.current = next; setDoors(next); invalidateRef.current(); }
      if (pending) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate); return () => cancelAnimationFrame(raf);
  }, [doorTargets]);
  useEffect(() => { gl.domElement.dataset.doors = JSON.stringify(Object.fromEntries(Object.entries(doors).map(([k, v]) => [k, Math.round(v * 100) / 100]))); }, [doors, gl]);
  const cabinetParts = useMemo(() => {
    const owners = new Map<string, string>();
    if (project.entities.some(e => e.definitionId === 'gabinete')) for (const e of project.entities) { const owner = containerOf(project, e.id, 'gabinete'); if (owner) owners.set(e.id, owner.id); }
    return owners;
  }, [project]);
  const doorKids = useMemo(() => new Set(project.mounts.filter(m => m.child.anchorId === 'agujero').map(m => m.child.entityId)), [project.mounts]);
  const hallOn = useMemo(() => hasHall(project.entities.map(e => e.definitionId)), [project.entities]);
  const hallB = useMemo(() => hallBounds(Object.values(project.poses).map(p => p.position)), [project.poses]);
  const [liveCable, setLiveCable] = useState<{id: string; interior: Vec3[]} | null>(null);
  const dist = cam.position.distanceTo(controls.current?.target ?? new Vector3(0, 0.8, 0));
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches; // dedo: puntos de terminal más grandes
  const dot = Math.min(coarse ? 0.0085 : 0.009, Math.max(coarse ? 0.0085 : 0.005, dist * 0.0035));
  const spinning = sim ? project.entities.filter(e => e.definitionId === 'motor-3p' && sim.energized[e.id]).length : 0;
  useEffect(() => { gl.domElement.dataset.spinning = String(spinning); invalidate(); }, [spinning, gl, invalidate]);
  useEffect(() => { let n = 0; scene.traverse(o => { if ((o as {isMesh?: boolean}).isMesh) n++; }); gl.domElement.dataset.meshes = String(n); });

  const basePoses = useMemo(() => (preview ? movedPoses(project, preview.id, preview.shown) : project.poses), [project, preview]);
  const poses = useMemo(() => doorPoses({...project, poses: basePoses}, doors), [project, basePoses, doors]);
  const cableProject = useMemo(() => (poses === project.poses ? project : {...project, poses}), [project, poses]);
  const focus = useMemo(() => { const ps = Object.values(project.poses); if (!ps.length) return {c: [0, 0, 0] as Vec3, r: 1.2}; const xs = ps.map(p => p.position[0]), zs = ps.map(p => p.position[2]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2; return {c: [cx, 0, cz] as Vec3, r: Math.min(12, Math.max(1.2, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) / 2 + 0.8))}; }, [project.poses]);
  useEffect(() => { invalidate(); }, [poses, invalidate]);

  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);

  const ndc = (clientX: number, clientY: number) => { const r = gl.domElement.getBoundingClientRect(); return new Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1); };

  const begin = (id: string, e: ThreeEvent<PointerEvent>) => {
    const { project: proj } = latest.current;
    const ent = proj.entities.find(x => x.id === id), start = proj.poses[id];
    if (!moveParts || !ent || !start || ent.locked || parentMountOf(proj, id)) return;
    const plane = new Plane(new Vector3(0, 1, 0), -start.position[1]);
    const hit = e.ray.intersectPlane(plane, new Vector3());
    if (!hit) return;
    const pointerId = e.pointerId;
    let nextPreview: Preview | null = null;
    drag.current = {id, plane, offset: new Vector3(start.position[0] - hit.x, 0, start.position[2] - hit.z), startPose: start, startClient: [e.nativeEvent.clientX, e.nativeEvent.clientY], active: false};
    if (controls.current) controls.current.enabled = false;

    const move = (ev: PointerEvent) => {
      const d = drag.current; if (!d || ev.pointerId !== pointerId) return;
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
      nextPreview = {id: d.id, pose: raw, shown, candidate, overlaps: overlapsOf(latest.current.project, d.id, shown)};
      setPreview(nextPreview);
    };
    const finish = (cancelled: boolean) => {
      const d = drag.current; drag.current = null; cleanup.current();
      gl.domElement.style.cursor = ''; delete gl.domElement.dataset.snap;
      if (controls.current) controls.current.enabled = true;
      if (!d || !d.active) { setPreview(null); return; }
      justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 0);
      setPreview(null);
      if (!cancelled && nextPreview) latest.current.onDrop(d.id, nextPreview.pose, nextPreview.candidate);
    };
    const up = (ev: PointerEvent) => { if (ev.pointerId === pointerId) finish(false); };
    const cancel = (ev: PointerEvent) => { if (ev.pointerId === pointerId) finish(true); };
    const secondTouch = (ev: PointerEvent) => { if (ev.pointerType === 'touch' && ev.pointerId !== pointerId) finish(true); };
    const key = (ev: KeyboardEvent) => { if (ev.key === 'Escape') finish(true); };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', cancel); addEventListener('pointerdown', secondTouch, true); addEventListener('keydown', key);
    cleanup.current = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel); removeEventListener('pointerdown', secondTouch, true); removeEventListener('keydown', key); };
  };

  const dragging = preview !== null;
  const ghostEntity = preview?.candidate ? project.entities.find(x => x.id === preview.id) : undefined;
  return <>
    <hemisphereLight args={['#ffffff', '#b9c3d1', 0.75]} />
    <ambientLight intensity={0.25} />
    <KeyLight c={focus.c} r={focus.r} shadow={project.entities.length <= 80} />
    <directionalLight position={[-focus.r * 1.2, focus.r * 0.8 + 0.3, -focus.r * 0.6]} intensity={0.4} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow raycast={() => null}><planeGeometry args={[80, 80]} /><shadowMaterial opacity={0.2} /></mesh>
    {hallOn ? <Hall bounds={hallB} cutaway={cutaway} /> : null}
    {!hallOn && <Grid args={[40, 40]} cellSize={0.5} cellThickness={0.6} cellColor="#d5dae1" sectionSize={5} sectionThickness={1} sectionColor="#bcc4cf" fadeDistance={40} fadeStrength={1} infiniteGrid />}
    {project.entities.map(e => {
      const base = poses[e.id]; if (!base) return null;
      const off = proc && e.definitionId === 'caja-producto' ? productOffset(project, proc, e.id) : null, pose: Pose = off ? {...base, position: [base.position[0] + off[0], base.position[1] + off[1], base.position[2] + off[2]]} : base;
      return <Piece key={e.id} cabinetPlate={e.definitionId === 'placa' && cabinetParts.has(e.id)} uncoverDuct={uncoverDucts && !!interior && cabinetParts.get(e.id) === interior} cutRoom={cutaway} onDoorClick={e.definitionId === 'gabinete' && !moveParts && !wiring ? event => { event.stopPropagation(); if (event.delta < DRAG_THRESHOLD) onCabinetDoor(e.id); } : undefined} variant={doorKids.has(e.id) ? 'door' : 'din'} doorMode={closedCabinet === e.id ? 'cerrada' : String(e.props.puerta ?? 'cerrada')} door={doors[e.id] ?? 0} swing={proc && e.definitionId === 'brazo-robot' ? robotAngle(proc, e.id) : undefined} id={e.id} definitionId={e.definitionId} pose={pose} selected={selection.includes(e.id) && interior !== e.id} showAnchors={dragging || (moveParts && selection.includes(e.id))}
        overlapping={!!preview && (preview.overlaps.includes(e.id) || (preview.id === e.id && preview.overlaps.length > 0))} xray={wiring}
        terminals={(wiring || selection.includes(e.id)) && shapeOf(e.definitionId).terminals ? <Terminals entityId={e.id} terminals={shapeOf(e.definitionId).terminals!} dot={dot} pending={pending} hover={hover} onTerminal={wiring ? onTerminal : () => {}} onHover={wiring ? setHover : () => {}} /> : null}
        detail={project.entities.length > 80 ? 'low' : 'high'}
        extra={e.definitionId === 'motor-3p' && sim?.energized[e.id] ? <SpinMarker y={shapeOf(e.definitionId).size[1] + 0.012} /> : <ProcessExtra definitionId={e.definitionId} id={e.id} proc={proc} sim={sim} />}
        glow={sim ? (sim.energized[e.id] ? (e.definitionId === 'piloto' ? '#ffd54f' : '#ff9800') : sim.closed[e.id] ? '#1f9d55' : undefined) : undefined}
        onClick={ev => { ev.stopPropagation(); if (ev.delta < DRAG_THRESHOLD) onSelect([e.id]); }}
        onDown={ev => {
          if (ev.button !== 0 || !ev.isPrimary || ev.ctrlKey || ev.metaKey) return;
          ev.stopPropagation();
          if (operateParts && simRunning && operableKind(e.definitionId)) { onOperate(e.id, true); const release = () => { removeEventListener('pointerup', release); removeEventListener('pointercancel', release); onOperate(e.id, false); }; addEventListener('pointerup', release); addEventListener('pointercancel', release); return; }
          if (!moveParts) return;
          onSelect([e.id]);
          if (parentMountOf(project, e.id)) { const sx = ev.nativeEvent.clientX, sy = ev.nativeEvent.clientY; const stop = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', stop); removeEventListener('pointercancel', stop); }; const mv = (m: PointerEvent) => { if (Math.hypot(m.clientX - sx, m.clientY - sy) > 8) { stop(); onBlockedDrag(e.id); } }; addEventListener('pointermove', mv); addEventListener('pointerup', stop); addEventListener('pointercancel', stop); }
          begin(e.id, ev); }} />;
    })}
    {preview?.candidate && ghostEntity && <>
      <Piece id={ghostEntity.id} definitionId={ghostEntity.definitionId} pose={preview.candidate.pose} selected={false} ghost showAnchors={false} />
      <Line points={[preview.pose.position, preview.candidate.point]} color="#2d6ff4" lineWidth={1.5} dashed dashSize={0.04} gapSize={0.03} />
      <mesh position={preview.candidate.point}><sphereGeometry args={[0.022, 14, 10]} /><meshBasicMaterial color="#1f9d55" depthTest={false} transparent opacity={0.95} /></mesh>
    </>}
    <Cables project={cableProject} doors={doors} cabinetParts={cabinetParts} evaluation={evaluation} highlight={highlight} sim={sim} live={liveCable} />
    {editable && !wiring && editCable && project.connections.some(c => c.id === editCable) && <CableHandles project={cableProject} doors={doors} id={editCable} dot={dot} controls={controls} onLive={setLiveCable} onCommit={interior => onRoute(editCable, interior)} />}
    <CameraRig camera={camera} nonce={cameraNonce} pan={panCamera} onRest={onCameraRest} controls={controls} />
  </>;
}

export default function IndustriaCanvas(props: IndustriaCanvasProps) {
  const justDragged = useRef(false);
  return <Canvas className="rb-canvas ind-canvas" frameloop="demand" shadows="soft" dpr={[1, 1.75]} camera={{position: props.camera.position, fov: 45, near: 0.05, far: 500}} gl={{alpha: true, antialias: true}}
    onCreated={({gl}) => { gl.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); props.onContextLost(); }); }}
    onPointerMissed={() => { if (!justDragged.current) props.onSelect([]); }} data-testid="industria-canvas">
    <Scene {...props} justDragged={justDragged} />
  </Canvas>;
}

