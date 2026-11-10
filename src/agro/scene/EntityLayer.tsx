import {polygonParcelGeometry} from './ParcelGeometry.ts';
import {useEffect, useMemo, useRef, useSyncExternalStore} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {Html, Line} from '@react-three/drei';
import {BufferAttribute, BufferGeometry, CanvasTexture, DoubleSide, SRGBColorSpace, type Group} from 'three';
import {itemById, portsFor, sizeOf} from '../catalog/items.ts';
import type {Entity, Pose, PortRef, PropValue} from '../model/types.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import {cablePoints, compatibleTargets} from '../world/connections.ts';
import {pipePortElevation} from '../world/pipeElevation.ts';
import type {WorldSession} from '../world/session.ts';
import {measure, portWorld} from '../world/placement.ts';
import {EntityBody, Outline, PortMarkers, type PortMark} from './EntityMesh.tsx';
import type {Point} from './AgroCanvas.tsx';
import {viewOf} from '../sim/soil.ts';
import {CropRows} from './Crops.tsx';
import {inConstruction, obraProgress} from '../economy/economy.ts';

export type Overlay = {
  ghost?: {type: string; pose: Pose; params: Record<string, PropValue>; valid: boolean} | null;
  drag?: {id: string; pose: Pose; valid: boolean} | null;
  hoverId?: string | null;
  hoverPort?: PortRef | null;
};
const OK = '#2fb35a', BAD = '#e04b4b';
const fmt = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});
type Vec = [number, number, number];

/** Parcela: cubierta rectangular o poligonal traslúcida que sigue el relieve (es una zona del suelo, no una caja). */
function ParcelMesh({entity, session, selected, hover, tint}: {entity: Entity; session: WorldSession; selected: boolean; hover: boolean; tint: string | null}) {
  const {invalidate} = useThree();
  const [w, , d] = sizeOf(itemById('parcela')!, entity.params), yaw = entity.pose.rotation[1], [px, , pz] = entity.pose.position;
  const {fill, border} = useMemo(() => {
    if(entity.parcelPolygon)return polygonParcelGeometry(entity,session.terrain.hf);
    const hf = session.terrain.hf, step = 2, nu = Math.max(1, Math.round(w / step)), nv = Math.max(1, Math.round(d / step)), c = Math.cos(yaw), s = Math.sin(yaw);
    const at = (u: number, v: number): Vec => { const lx = (u / nu - 0.5) * w, lz = (v / nv - 0.5) * d, x = px + lx * c + lz * s, z = pz - lx * s + lz * c; return [x, sampleHeight(hf, x, z) + 0.22, z]; };
    const pos = new Float32Array((nu + 1) * (nv + 1) * 3), idx: number[] = [];
    for (let v = 0; v <= nv; v++) for (let u = 0; u <= nu; u++) pos.set(at(u, v), (v * (nu + 1) + u) * 3);
    for (let v = 0; v < nv; v++) for (let u = 0; u < nu; u++) { const a = v * (nu + 1) + u; idx.push(a, a + nu + 1, a + 1, a + 1, a + nu + 1, a + nu + 2); }
    const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(pos, 3)); g.setIndex(idx);
    const ring: Vec[] = [];
    for (let u = 0; u <= nu; u++) ring.push(at(u, 0)); for (let v = 1; v <= nv; v++) ring.push(at(nu, v)); for (let u = nu - 1; u >= 0; u--) ring.push(at(u, nv)); for (let v = nv - 1; v >= 0; v--) ring.push(at(0, v));
    return {fill: g, border: ring.map(p => [p[0], p[1] + 0.05, p[2]] as Vec)};
  }, [session.terrain.edits.length, w, d, yaw, px, pz, entity.parcelPolygon]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { invalidate();return ()=>fill.dispose(); }, [fill, invalidate]);
  const v = viewOf(entity.state), mix = (a: string, b: string, t: number): string => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((x, i) => Math.round(x + (pb[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
  const color = tint ?? (selected ? '#43c76d' : mix('#c9a45a', '#4d9a3a', v.available));   // seco → ocre, húmedo → verde
  const cycle = v.crop ? Math.min(1, v.gdd / v.crop.stages[v.crop.stages.length - 1].from) : 0;
  const canopy = !v.crop ? null : !v.alive ? '#6b4f2a' : v.ready ? '#d9533a' : mix('#d3b92f', '#2f9e44', Math.min(1, Math.max(0, (v.ks - 0.2) / 0.8)));
  return <group>
    <mesh geometry={fill} raycast={() => null} renderOrder={2}><meshBasicMaterial color={color} transparent opacity={selected || hover ? 0.42 : 0.28} side={DoubleSide} depthWrite={false} polygonOffset polygonOffsetFactor={-2} /></mesh>
    <Line points={border} color={selected ? '#2fb35a' : hover ? '#7be495' : '#3f7d2a'} lineWidth={selected ? 3 : 2} depthTest={false} renderOrder={3} />
  </group>;
}

/** Cables, uniones estiradas y agua en movimiento. */
function Wires({session}: {session: WorldSession}) {
  const analysis = session.analyze(), {entities, connections} = session, group = useRef<Group>(null), {invalidate} = useThree();
  const find = (r: PortRef) => { const e = entities.find(x => x.id === r.entityId), p = e?.ports.find(q => q.id === r.portId); return e && p ? {e, p, w: portWorld(e, p)} : null; };
  const wires = connections.flatMap(c => {
    const a = find(c.a), b = find(c.b); if (!a || !b || c.kind === 'hydraulic') return [];
    const live = analysis.power.live.has(`${c.a.entityId}:${c.a.portId}`) && analysis.power.live.has(`${c.b.entityId}:${c.b.portId}`) || c.kind === 'signal';
    return [{id: c.id, kind: c.kind, live, points: cablePoints(a.w, b.w)}];
  });
  const stretched = analysis.stretched.map(s => { const c = connections.find(x => x.id === s.connectionId)!, a = find(c.a), b = find(c.b); return a && b ? {id: s.connectionId, points: [[a.w.x, a.w.y + 0.1, a.w.z], [b.w.x, b.w.y + 0.1, b.w.z]] as Vec[]} : null; }).filter(Boolean) as {id: string; points: Vec[]}[];
  const flows = entities.flatMap(e => {
    const r = analysis.elements[e.id]; if (e.type !== 'tuberia' || !r || r.kind !== 'tuberia' || Math.abs(r.flowLmin) < 1e-6) return [];
    const hf = session.terrain.committedHeightfield;
    const points = e.ports.slice(0, 2).map(p => {
      const {x, z} = portWorld(e, p);
      return [x, pipePortElevation(hf, e, p) - p.local[1] + 0.2, z] as Vec;
    });
    return [{id: e.id, dir: Math.sign(r.flowLmin), speed: Math.min(4, Math.max(0.4, r.velocity)), points}];
  });
  const speeds = useRef<Record<string, number>>({}); speeds.current = Object.fromEntries(flows.map(f => [f.id, f.dir * f.speed]));
  useFrame((_, dt) => {
    if (!flows.length) return;
    group.current?.children.forEach(ch => { const sp = speeds.current[ch.name]; const m = (ch as unknown as {material?: {dashOffset: number}}).material; if (sp !== undefined && m) m.dashOffset -= sp * dt * 1.2; });
    invalidate();
  });
  return <group>
    {wires.map(w => <Line key={w.id} points={w.points} color={w.kind === 'power' ? (w.live ? '#ffc400' : '#9a8a55') : '#2fb35a'} lineWidth={w.live ? 3 : 2} depthTest={false} renderOrder={12} />)}
    {stretched.map(s => <Line key={s.id} points={s.points} color="#e04b4b" lineWidth={3} dashed dashSize={0.5} gapSize={0.3} depthTest={false} renderOrder={13} />)}
    <group ref={group}>{flows.map(f => <Line key={f.id} name={f.id} points={f.points} color="#aee4ff" lineWidth={4} dashed dashSize={0.45} gapSize={0.35} depthTest={false} renderOrder={11} />)}</group>
  </group>;
}

/** Todas las piezas del mundo, la pieza que se arrastra, el fantasma de colocación, las conexiones y la medición. */
export function EntityLayer({session, selectedId, overlay, measurePoints, showPorts, labels, connect}: {session: WorldSession; selectedId: string | null; overlay: Overlay; measurePoints: Point[]; showPorts: boolean; labels: boolean; connect: {active: boolean; from: PortRef | null}}) {
  const {invalidate} = useThree();
  useSyncExternalStore(session.subscribe.bind(session), () => session.version);
  useEffect(() => { invalidate(); });
  const hover = overlay.hoverId ?? null, analysis = session.analyze();
  // Marcas de los puertos en la herramienta Conectar: el de origen, los compatibles y libres, y los que no sirven.
  const marks = useMemo(() => {
    const out: Record<string, Record<string, PortMark>> = {};
    if (!connect.active) return out;
    const targets = connect.from ? new Set(compatibleTargets(session.parts, connect.from).map(t => `${t.entityId}:${t.portId}`)) : null;
    const used = new Set(session.connections.flatMap(c => [`${c.a.entityId}:${c.a.portId}`, `${c.b.entityId}:${c.b.portId}`]));
    for (const e of session.entities) for (const p of e.ports) {
      const k = `${e.id}:${p.id}`, mk: PortMark | undefined = connect.from && connect.from.entityId === e.id && connect.from.portId === p.id ? 'from' : used.has(k) ? 'busy' : targets ? (targets.has(k) ? 'ok' : 'bad') : undefined;
      const h = overlay.hoverPort && overlay.hoverPort.entityId === e.id && overlay.hoverPort.portId === p.id;
      const final = h && mk !== 'busy' && mk !== 'bad' ? 'hover' : mk; if (final) (out[e.id] ??= {})[p.id] = final;
    }
    return out;
  }, [connect.active, connect.from, overlay.hoverPort, session.version]); // eslint-disable-line react-hooks/exhaustive-deps
  return <group name="piezas">
    {session.parcelPreview && <ParcelMesh entity={session.parcelPreview} session={session} selected={false} hover={false} tint="#50c765" />}
    {session.entities.map(e => {
      const dragging = overlay.drag?.id === e.id, pose = dragging ? overlay.drag!.pose : e.pose, tint = dragging ? (overlay.drag!.valid ? OK : BAD) : inConstruction(e) ? '#f0b24a' : null, sel = e.id === selectedId;
      if (e.type === 'parcela') return <group key={e.id}><ParcelMesh entity={{...e, pose}} session={session} selected={sel} hover={hover === e.id} tint={tint} />{!tint && <CropRows entity={{...e, pose}} session={session} />}</group>;
      const r = analysis.elements[e.id], live = {running: r?.kind === 'bomba' ? r.running && r.flowLmin > 0 : false, flowing: r?.kind === 'emisor' ? r.flowLmin > 0 : false, wet: r?.kind === 'tuberia' || r?.kind === 'valvula' ? r.wet : false};
      return <group key={e.id} position={pose.position} rotation={pose.rotation}>
        {!tint && <Shadow type={e.type} params={e.params} />}
        <EntityBody type={e.type} params={e.params} state={e.state} tint={tint} live={live} />
        {sel && <Outline entity={e} color="#2fb35a" />}
        {!sel && hover === e.id && <Outline entity={e} color="#9af0b0" />}
        {(sel || showPorts || connect.active) && <PortMarkers ports={e.ports} marks={marks[e.id]} />}
        {labels && !dragging && <Tag entity={e} analysis={analysis} now={session.clock.simSeconds} />}
      </group>;
    })}
    <Wires session={session} />
    {overlay.ghost && (() => {
      const g = overlay.ghost!, def = itemById(g.type)!;
      if (g.type === 'parcela') return <ParcelMesh entity={{id: 'ghost', type: 'parcela', label: '', pose: g.pose, params: g.params, ports: [], state: {}, lifecycle: 'installed', owner: 'player'}} session={session} selected={false} hover={false} tint={g.valid ? OK : BAD} />;
      const proxy = {type: g.type, params: g.params}, portsOf = portsFor(def, g.params);
      return <group position={g.pose.position} rotation={g.pose.rotation}><EntityBody type={g.type} params={g.params} state={{}} tint={g.valid ? OK : BAD} /><Outline entity={proxy} color={g.valid ? OK : BAD} /><PortMarkers ports={portsOf} scale={0.9} /></group>;
    })()}
    {measurePoints.length > 0 && <Measure points={measurePoints} />}
  </group>;
}

/** Sombra de contacto: una mancha suave bajo la pieza que la asienta en el suelo (no es una sombra proyectada). */
function Shadow({type, params}: {type: string; params: Record<string, PropValue>}) {
  const def = itemById(type)!, [w, , d] = sizeOf(def, params);
  if (type === 'tuberia' || type === 'te') return null;
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} scale={[w * 0.62, d * 0.62, 1]} raycast={() => null} renderOrder={1}><circleGeometry args={[1, 20]} /><meshBasicMaterial color="#10200a" transparent opacity={0.28} depthWrite={false} polygonOffset polygonOffsetFactor={-3} /></mesh>;
}

const int = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 0});
const TONES = {ok: '#2fb35a', idle: '#9aa0aa', bad: '#e04b4b'} as const;
/** Textura de una etiqueta (nombre + estado) dibujada en un canvas 2D: nada de DOM dentro de la escena, así no depende de limpiar nodos al cerrar el mundo. */
function tagTexture(name: string, status: string, tone: keyof typeof TONES): {texture: CanvasTexture; aspect: number} {
  const k = 2, padX = 16 * k, h = 54 * k, font1 = `700 ${15 * k}px system-ui, sans-serif`, font2 = `${13 * k}px system-ui, sans-serif`;
  const probe = document.createElement('canvas').getContext('2d')!; probe.font = font1; const w1 = probe.measureText(name).width; probe.font = font2; const w2 = probe.measureText(status).width;
  const w = Math.ceil(Math.max(w1, w2) + padX * 2 + 6 * k), c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!; g.fillStyle = '#fffffff2'; g.beginPath(); g.roundRect(0, 0, w, h, 14 * k); g.fill();
  g.fillStyle = TONES[tone]; g.beginPath(); g.roundRect(0, 0, 8 * k, h, [14 * k, 0, 0, 14 * k]); g.fill();
  g.fillStyle = '#111115'; g.font = font1; g.textBaseline = 'alphabetic'; g.fillText(name, padX, 23 * k);
  g.fillStyle = '#4a5260'; g.font = font2; g.fillText(status, padX, 42 * k);
  const texture = new CanvasTexture(c); texture.colorSpace = SRGBColorSpace; texture.anisotropy = 4;
  return {texture, aspect: w / h};
}

/** Etiqueta flotante de un equipo: nombre y estado. Solo los equipos principales; tuberías, uniones y válvulas no llevan. Es un sprite de tamaño fijo en pantalla (no recibe clics). */
function Tag({entity: e, analysis, now}: {entity: Entity; analysis: ReturnType<WorldSession['analyze']>; now: number}) {
  const r = analysis.elements[e.id], num = (v: PropValue | undefined, d: number) => (typeof v === 'number' ? v : d);
  let status: string | null = null, tone: keyof typeof TONES = 'ok';
  if (e.type === 'estanque') { const cap = num(e.params.volumenMaxL, 10000), lv = num(e.state.nivelL, 0); status = `${int.format(lv)} L (${int.format((lv / cap) * 100)} %)`; if (r?.kind === 'estanque' && r.dryOutlet) tone = 'bad'; }
  else if (e.type === 'bomba') { const on = r?.kind === 'bomba' && r.running && r.flowLmin > 0; status = `${fmt.format(num(e.params.potenciaNominalKw, num(e.state.potenciaNominalKw, 2.2)))} kW · ${on ? 'en marcha' : 'detenida'}`; tone = on ? 'ok' : 'idle'; }
  else if (e.type === 'tablero') status = `${e.state.modo === 'auto' ? 'Automático' : 'Manual'} · ${e.state.interruptor === true ? 'con energía' : 'apagado'}`;
  else if (e.type === 'emisor') { const q = r?.kind === 'emisor' ? r.flowLmin : 0; status = q > 0 ? `${fmt.format(q)} L/min` : 'sin caudal'; tone = q > 0 ? 'ok' : 'idle'; }
  else if (e.type === 'sensor-humedad') status = 'sonda de humedad';
  else if (e.type === 'acometida') status = 'red 400 V';
  if (inConstruction(e)) { status = `En obra · ${Math.round(obraProgress(e, now) * 100)} %`; tone = 'idle'; }
  const name = e.label, tex = useMemo(() => (status === null ? null : tagTexture(name, status, tone)), [name, status, tone]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { tex?.texture.dispose(); }, [tex]);
  if (!tex) return null;
  const def = itemById(e.type)!, scaleY = 0.052;
  return <sprite position={[0, def.size[1] + 1.1, 0]} scale={[scaleY * tex.aspect, scaleY, 1]} renderOrder={30} raycast={() => null} userData={{tag: true}}><spriteMaterial map={tex.texture} sizeAttenuation={false} depthTest={false} transparent /></sprite>;
}

function Measure({points}: {points: Point[]}) {
  const [a, b] = points, m = b ? measure(a, b) : null;
  return <group>
    {points.map((p, i) => <mesh key={i} position={[p.x, p.y + 0.4, p.z]} renderOrder={20} raycast={() => null}><sphereGeometry args={[0.45, 12, 10]} /><meshBasicMaterial color="#ffb703" depthTest={false} /></mesh>)}
    {b && m && <>
      <Line points={[[a.x, a.y + 0.4, a.z], [b.x, b.y + 0.4, b.z]]} color="#ffb703" lineWidth={3} depthTest={false} renderOrder={19} />
      <Html position={[(a.x + b.x) / 2, Math.max(a.y, b.y) + 3, (a.z + b.z) / 2]} center style={{pointerEvents: 'none'}}><div className="agro-measure-label" data-testid="agro-measure-label">{fmt.format(m.distance)} m</div></Html>
    </>}
  </group>;
}
