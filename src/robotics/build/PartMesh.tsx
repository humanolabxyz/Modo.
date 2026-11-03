import {lazy, memo, Suspense, useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {Edges, RoundedBox} from '@react-three/drei';
import {CanvasTexture, DoubleSide, LinearFilter, NearestFilter, Matrix4, MeshBasicMaterial, Path, Shape, SRGBColorSpace, Vector2, type Group, type Mesh, type InstancedMesh} from 'three';
import {getDefinition} from '../catalog/index.ts';
import type {PinDefinition} from '../catalog/types.ts';
import type {PartInstance} from '../project/types.ts';
const ArmMesh = lazy(()=>import('../arm/ArmMesh').then(m=>({default:m.ArmMesh})));
import {CombatMesh} from './CombatMesh';
import {ARM_ID, BLOCK_ID, ZONE_ID} from '../arm/model.ts';
import {clawGap} from '../catalog/claw.ts';
import {CONVEYOR_ID} from '../conveyor/constants.ts';
import {ConveyorMesh} from '../conveyor/ConveyorMesh';
import {pieceSurface} from '../conveyor/color.ts';

type V3 = [number, number, number];
const mm = (v: number) => v / 1000;
const M = (v: V3): V3 => v.map(mm) as V3;
const TIRE_PROFILE = [[21, -12], [28, -12], [31.1, -10], [31.1, 10], [28, 12], [21, 12], [21, -12]].map(([r, y]) => new Vector2(mm(r), mm(y)));
const SILVER = '#b6bfc5', GOLD = '#c8a450', BLACK = '#20252b';
type Box = {at: V3; size: V3; color: string; metal?: number; rough?: number};
/** Detail helpers use millimetres; project transforms and catalog stay in metres. */
const B = ({at, size, color, metal = 0, rough = 0.6}: Box) => <mesh position={M(at)}><boxGeometry args={M(size)} /><meshStandardMaterial color={color} metalness={metal} roughness={rough} /></mesh>;
const C = ({at, r, h, color, axis = 'y', metal = 0, rough = 0.5}: {at: V3; r: number; h: number; color: string; axis?: 'x' | 'y' | 'z'; metal?: number; rough?: number}) => <mesh position={M(at)} rotation={axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}><cylinderGeometry args={[mm(r), mm(r), mm(h), 32]} /><meshStandardMaterial color={color} metalness={metal} roughness={rough} /></mesh>;
const Ring = ({at, r, tube, color = SILVER, axis = 'y'}: {at: V3; r: number; tube: number; color?: string; axis?: 'x' | 'y' | 'z'}) => <mesh position={M(at)} rotation={axis === 'y' ? [Math.PI / 2, 0, 0] : axis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0]}><torusGeometry args={[mm(r), mm(tube), 8, 32]} /><meshStandardMaterial color={color} metalness={0.55} roughness={0.38} /></mesh>;

/** True through holes, including the chassis slots; memoized instead of CSG per frame. */
function Plate({w, d, t, at = [0, 0, 0], color, holes = [], radius = 2, metal = 0}: {w: number; d: number; t: number; at?: V3; color: string; holes?: [number, number, number][]; radius?: number; metal?: number}) {
  const key = JSON.stringify(holes);
  const shape = useMemo(() => {
    const s = new Shape(), x = mm(w / 2), y = mm(d / 2), r = mm(radius);
    s.moveTo(-x + r, -y); s.lineTo(x - r, -y); s.quadraticCurveTo(x, -y, x, -y + r);
    s.lineTo(x, y - r); s.quadraticCurveTo(x, y, x - r, y); s.lineTo(-x + r, y);
    s.quadraticCurveTo(-x, y, -x, y - r); s.lineTo(-x, -y + r); s.quadraticCurveTo(-x, -y, -x + r, -y);
    for (const [hx, hz, hr] of JSON.parse(key) as [number, number, number][]) { const p = new Path(); p.absarc(mm(hx), -mm(hz), mm(hr), 0, Math.PI * 2, true); s.holes.push(p); }
    return s;
  }, [w, d, radius, key]);
  const options = useMemo(() => ({depth: mm(t), bevelEnabled: false, curveSegments: 12}), [t]);
  return <mesh position={M([at[0], at[1] - t / 2, at[2]])} rotation={[-Math.PI / 2, 0, 0]}><extrudeGeometry args={[shape, options]} /><meshStandardMaterial color={color} metalness={metal} roughness={metal ? 0.32 : 0.48} /></mesh>;
}

/** Coraza en V: tronco más ancho arriba que abajo (trapecio extruido con bordes redondeados). Medidas en mm: ancho medio abajo/arriba, de y0 a y1, profundidad sin el borde. */
function TaperedShell({bottom, top, y0, y1, depth, bevel, color}: {bottom: number; top: number; y0: number; y1: number; depth: number; bevel: number; color: string}) {
  const shape = useMemo(() => { const s = new Shape(); s.moveTo(-mm(bottom), mm(y0)); s.lineTo(mm(bottom), mm(y0)); s.lineTo(mm(top), mm(y1)); s.lineTo(-mm(top), mm(y1)); s.closePath(); return s; }, [bottom, top, y0, y1]);
  const options = useMemo(() => ({depth: mm(depth), bevelEnabled: true, bevelSize: mm(bevel), bevelThickness: mm(bevel), bevelSegments: 5, curveSegments: 8}), [depth, bevel]);
  return <mesh position={M([0, 0, -depth / 2])}><extrudeGeometry args={[shape, options]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>;
}

/** Local canvas labels: no downloaded fonts or network required. Decals never intercept picking. */
function Mark({text, at, width, height = 2, front = false, color = '#e4ece7'}: {text: string; at: V3; width: number; height?: number; front?: boolean; color?: string}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = color; ctx.font = '600 60px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 48, 500);
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; return map;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={M(at)} rotation={front ? [0, 0, 0] : [-Math.PI / 2, 0, 0]} raycast={() => null}><planeGeometry args={[mm(width), mm(height)]} /><meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} toneMapped={false} /></mesh>;
}
function Screw({at}: {at: V3}) {
  return <><C at={at} r={1.45} h={0.65} color={SILVER} metal={0.7} /><B at={[at[0], at[1] + 0.34, at[2]]} size={[1.9, 0.06, 0.3]} color="#4b5359" /></>;
}
function Capacitor({at, r = 2.5, h = 7}: {at: V3; r?: number; h?: number}) {
  return <><C at={at} r={r} h={h} color={BLACK} /><C at={[at[0], at[1] + h / 2, at[2]]} r={r * 0.9} h={0.25} color={SILVER} metal={0.7} /><B at={[at[0], at[1] + h / 2 + 0.14, at[2]]} size={[r * 1.4, 0.05, 0.18]} color="#596168" /></>;
}
function Chip({at, length, rows = 14}: {at: V3; length: number; rows?: number}) {
  return <><B at={at} size={[7, 2.6, length]} color={BLACK} />{Array.from({length: rows}, (_, i) => [-1, 1].map(side => <B key={`${i}:${side}`} at={[at[0] + side * 4.3, at[1] - 0.4, at[2] - length / 2 + 1.3 + i * (length - 2.6) / (rows - 1)]} size={[2, 0.5, 0.65]} color={SILVER} metal={0.65} />))}<C at={[at[0], at[1] + 1.32, at[2] - length / 2 + 1.5]} r={0.7} h={0.1} color="#626970" /></>;
}

const PIN_COLORS: Record<PinDefinition['role'], string> = {'power-in': '#d94b4b', 'power-out': '#e08a3c', ground: '#3b3f45', digital: '#d8b64a', pwm: '#4aa3d8', analog: '#4abf8a', motor: '#a56bd8', signal: '#d8b64a'};
/** Physical connectors end exactly at existing electrical coordinates. Colored marks are optional. */
function Connectors({id, showPins}: {id: string; showPins: boolean}) {
  const def = getDefinition(id)!;
  if (id === 'led-5mm' || id === 'resistor' || id === 'breadboard-400') return null;
  return <>{def.pins.map(p => {
    const at = p.position.map(v => v * 1000) as V3;
    if (id === 'arduino-uno-r3') return <group key={p.id}>
      <B at={[at[0], 4.15, at[2]]} size={[2.54, 6.5, 2.54]} color={BLACK} />
      <B at={[at[0], 7.43, at[2]]} size={[1.35, 0.12, 1.35]} color={GOLD} metal={0.65} />
      <B at={[at[0], 7.51, at[2]]} size={[0.85, 0.08, 0.85]} color="#080d12" />
      <Mark text={p.label} at={[at[0] + (at[0] > 0 ? -4 : 4.5), 0.87, at[2]]} width={p.label.length > 2 ? 4.8 : 3.3} height={1.6} />
      {showPins && <Ring at={[at[0], 7.58, at[2]]} r={0.86} tube={0.16} color={PIN_COLORS[p.role]} />}
    </group>;
    if (id === 'l298n-module') {
      const terminal = p.role === 'motor' || p.role === 'ground' || p.id === '+12V' || p.id === '+5V';
      return <group key={p.id}>{terminal ? <>
        <B at={[at[0], 1.3, at[2]]} size={[Math.abs(at[0]) > 20 ? 5.2 : 4.8, 11.4, 5.8]} color="#2076aa" />
        <C at={[at[0], 7.05, at[2]]} r={1.65} h={0.45} color={SILVER} metal={0.7} />
        <B at={[at[0], 7.3, at[2]]} size={[2.2, 0.08, 0.35]} color="#48545b" />
        <B at={[at[0], 7.7, at[2]]} size={[0.65, 0.6, 0.65]} color={GOLD} metal={0.7} />
        <Mark text={p.label} at={[at[0] > 20 ? 14.5 : at[0] < -20 ? -14.5 : at[0], -7.1, at[2] < 0 ? at[2] + 5.8 : at[2]]} width={4.5} height={1.8} />
      </> : <>
        <B at={[at[0], -3.5, at[2]]} size={[2.5, 2.5, 2.5]} color={BLACK} />
        <B at={[at[0], 2.4, at[2]]} size={[0.65, 11.2, 0.65]} color={GOLD} metal={0.65} />
        <Mark text={p.label} at={[at[0], -7.1, at[2] - 4]} width={3.6} height={1.5} />
      </>}{showPins && <Ring at={[at[0], at[1] + 0.15, at[2]]} r={0.95} tube={0.18} color={PIN_COLORS[p.role]} />}</group>;
    }
    if (id === 'hc-sr04') return <group key={p.id}>
      <B at={[at[0], at[1], -5.9]} size={[2.4, 2.4, 2.5]} color={BLACK} />
      <B at={[at[0], at[1], -6.4]} size={[0.6, 0.6, 2.2]} color={showPins ? PIN_COLORS[p.role] : GOLD} metal={0.6} />
      <Mark text={p.label} at={[at[0] * 3.6, -8.1, -3.63]} width={7} height={1.35} front />
    </group>;
    return <group key={p.id}>
      <B at={[at[0], at[1], at[2]]} size={id === 'dc-motor-tt' ? [3.2, 2, 0.5] : [3.2, 0.5, 3]} color={showPins ? PIN_COLORS[p.role] : GOLD} metal={0.7} />
      {id === 'battery-holder-4aa' && <Mark text={p.id === 'B+' ? '+' : '-'} at={[at[0], 8.25, at[2] + 5]} width={3} height={3} />}
    </group>;
  })}</>;
}

/** Repeated sockets share geometry: 400 holes cost two draw calls. */
function BreadboardBody() {
  const sockets = useRef<InstancedMesh>(null), clips = useRef<InstancedMesh>(null);
  const pins = getDefinition('breadboard-400')!.pins;
  useLayoutEffect(() => {
    if (!sockets.current || !clips.current) return;
    const matrix = new Matrix4();
    pins.forEach((pin, i) => {
      sockets.current!.setMatrixAt(i, matrix.makeTranslation(pin.position[0], mm(4.655), pin.position[2]));
      clips.current!.setMatrixAt(i, matrix.makeTranslation(pin.position[0], mm(4.68), pin.position[2]));
    });
    for (const mesh of [sockets.current, clips.current]) { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); }
  }, [pins]);
  return <>
    <Plate w={55} d={82.6} t={8.5} at={[0, -0.4, 0]} color="#dfdfd6" radius={1.5} />
    <B at={[0, 4, 0]} size={[2.5, 0.4, 79]} color="#c1c3bb" />
    {[-9, 9].map(x => <B key={x} at={[x, 4.25, 0]} size={[15.8, 0.8, 80.5]} color="#f2f0e7" />)}
    {[-21.7, 21.7].map(x => <B key={x} at={[x, 4.25, 0]} size={[8.5, 0.8, 80.5]} color="#f2f0e7" />)}
    <instancedMesh ref={sockets} args={[undefined, undefined, pins.length]}><boxGeometry args={[mm(1.35), mm(0.04), mm(1.35)]} /><meshStandardMaterial color="#464c4c" roughness={0.9} /></instancedMesh>
    <instancedMesh ref={clips} args={[undefined, undefined, pins.length]}><boxGeometry args={[mm(0.32), mm(0.015), mm(0.8)]} /><meshStandardMaterial color="#92968c" metalness={0.35} roughness={0.6} /></instancedMesh>
    {[-1, 1].flatMap(side => [0, 1].map(i => <group key={`${side}:${i}`}>
      <B at={[side * (i ? 18.4 : 25), 4.67, 0]} size={[0.35, 0.025, 73]} color={i === (side < 0 ? 1 : 0) ? '#3078b9' : '#cf4841'} />
      <Mark text={i === (side < 0 ? 1 : 0) ? '-' : '+'} at={[side * (i ? 18.4 : 25), 4.7, -38]} width={1.7} height={1.7} color={i === (side < 0 ? 1 : 0) ? '#3078b9' : '#cf4841'} />
    </group>))}
    {[1, 5, 10, 15, 20, 25, 30].flatMap(row => [-1, 1].map(side => <Mark key={`${row}:${side}`} text={String(row)} at={[side * 16.6, 4.72, (row - 15.5) * 2.54]} width={2.3} height={1.5} color="#747972" />))}
    {'ABCDEFGHIJ'.split('').map((letter, i) => <Mark key={letter} text={letter} at={[pins[i].position[0] * 1000, 4.72, -39.4]} width={1.7} height={1.5} color="#747972" />)}
    {[-26.6, 26.6].map(x => <B key={x} at={[x, 0, 20]} size={[1.2, 3.5, 6]} color="#e7e6dc" />)}
  </>;
}

const GRAPHITE = '#2b333b', GRAPHITE_LIGHT = '#3b4650', TEAL = '#27a4f2', SHELL = '#eef2f5';
/** Base de oruga (acabado «oruga» del chasis): placa blanca con franjas azules verde azulado, defensas sobre las bandas, parachoques con luces, luces traseras y collar para el cuello. Solo cambia el aspecto: las dimensiones y los anclajes son los del chasis. */
function TrackedFrame() {
  const R = ({at, size, r = 2, color, rough = 0.45, metal = 0}: {at: V3; size: V3; r?: number; color: string; rough?: number; metal?: number}) => <RoundedBox args={M(size)} radius={mm(Math.max(0.2, Math.min(r, Math.min(...size) / 2 - 0.1)))} smoothness={3} position={M(at)}><meshStandardMaterial color={color} roughness={rough} metalness={metal} /></RoundedBox>;
  const Led = ({at, color, glow = 1.4}: {at: V3; color: string; glow?: number}) => <mesh position={M(at)}><sphereGeometry args={[mm(3), 14, 10]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.3} /></mesh>;
  return <>
    <Plate w={140} d={210} t={4} radius={22} color={SHELL} holes={[[-62, -20, 2], [62, -20, 2], [0, 85, 2], [-18, -45, 2], [18, -45, 2], [-18, 40, 2], [18, 40, 2], [-24, -4, 6], [24, -4, 6]]} />
    {[-1, 1].map(s => <B key={`stripe${s}`} at={[s * 64, 2.25, -6]} size={[3, 0.5, 170]} color={TEAL} />)}
    <B at={[0, 2.25, -92]} size={[70, 0.5, 2]} color={TEAL} />
    <Mark text="ORUGA" at={[0, 2.3, -83]} width={22} height={6} color={TEAL} />
    {/* parachoques delantero con faros */}
    <R at={[0, 5, 104]} size={[124, 10, 9]} r={4} color={GRAPHITE_LIGHT} />
    <R at={[0, 5.2, 108.6]} size={[40, 4, 1.4]} r={0.6} color={TEAL} />
    {[-1, 1].map(s => <Led key={`faro${s}`} at={[s * 48, 5, 109]} color="#bff3ff" glow={1.8} />)}
    {/* parte trasera con luces */}
    <R at={[0, 4.4, -104]} size={[124, 8, 8]} r={3.5} color={GRAPHITE_LIGHT} />
    {[-1, 1].map(s => <Led key={`cola${s}`} at={[s * 52, 4.4, -108.4]} color="#ff4d4d" glow={1.2} />)}
    {Array.from({length: 5}, (_, i) => <B key={`vent${i}`} at={[-12 + i * 6, 2.3, -96]} size={[3, 0.5, 9]} color="#161b20" />)}
  </>;
}

export type DisplayView = {frame: Uint8Array; on: boolean};
/** El vidrio de la pantalla OLED: textura de 128 × 64 píxeles con lo que dibujó el programa (se actualiza solo cuando cambia la imagen). */
function OledScreen({display, at, size}: {display?: DisplayView; at: V3; size: [number, number]}) {
  const mesh = useRef<Mesh>(null);
  const {canvas, texture} = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64;
    const t = new CanvasTexture(c); t.magFilter = NearestFilter; t.minFilter = LinearFilter; t.colorSpace = SRGBColorSpace; return {canvas: c, texture: t};
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useLayoutEffect(() => {
    const g = canvas.getContext('2d')!, img = g.createImageData(128, 64);
    let lit = 0;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 128; x++) {
      const on = display?.on && display.frame && ((display.frame[y * 16 + (x >> 3)] >> (7 - (x & 7))) & 1) === 1, i = (y * 128 + x) * 4;
      if (on) lit++;
      img.data[i] = on ? 168 : 4; img.data[i + 1] = on ? 236 : 8; img.data[i + 2] = on ? 255 : 12; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0); texture.needsUpdate = true;
    if (mesh.current) mesh.current.userData.oledLit = lit;
  }, [display, canvas, texture]);
  return <mesh ref={mesh} position={M(at)} rotation={[-Math.PI / 2, 0, 0]} userData={{oledScreen: true, oledLit: 0}} raycast={() => null}><planeGeometry args={[mm(size[0]), mm(size[1])]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}

const LED_COLORS: Record<string, string> = {rojo: '#e53935', verde: '#2fbf5a', amarillo: '#f2c230', azul: '#2f7de1'};
function Body({id, color, glow = 0, ohms = 220, closed = true, angle = 90, control = 0, display}: {id: string; color?: unknown; glow?: number; ohms?: number; closed?: boolean; angle?: number; control?: number; display?: DisplayView}) {
  switch (id) {
    case 'robot-torso': return <>
      {/* Cuerpo humanoide de 162 mm: vientre de vidrio ahumado (la electrónica se ve dentro), cadera con protecciones, cintura marcada, pecho alto que se abre hacia unos hombros anchos, cuello y espalda. */}
      <RoundedBox args={[mm(132), mm(62), mm(146)]} radius={mm(20)} smoothness={4} position={M([0, -50, 0])} raycast={() => null} renderOrder={5}><meshPhysicalMaterial color="#cde8f8" transparent opacity={0.2} roughness={0.12} depthWrite={false} side={DoubleSide} /></RoundedBox>
      <Plate w={136} d={150} t={6} radius={22} at={[0, -78, 0]} color="#f4f7f9" />
      <Plate w={139} d={153} t={2.6} radius={23} at={[0, -75, 0]} color="#27a4f2" />
      {[-1, 1].flatMap(sx => [-1, 1].map(sz => <C key={`post${sx}${sz}`} at={[sx * 64, -50, sz * 69]} r={5} h={62} color="#3b4650" />))}
      {/* caderas: protecciones laterales sobre las orugas */}
      {[-1, 1].map(sx => <group key={`cadera${sx}`}><RoundedBox args={[mm(16), mm(16), mm(124)]} radius={mm(7)} smoothness={4} position={M([sx * 66, -67, 0])}><meshStandardMaterial color="#f4f7f9" roughness={0.32} /></RoundedBox><B at={[sx * 74.4, -67, 0]} size={[0.8, 5, 70]} color="#27a4f2" /></group>)}
      {/* cintura: cinturón azul y base del pecho, más angostos que los hombros */}
      <Plate w={132} d={146} t={5} radius={20} at={[0, -17, 0]} color="#27a4f2" />
      {/* ARMADURA, de adentro hacia afuera: 1) armazón oscuro (columnas, rieles y chasis con la electrónica), 2) vidrio ahumado que la protege, 3) placas de armadura. Las placas del vientre dejan ranuras para ver el cableado y no estorban al clic (la electrónica sigue seleccionable). */}
      {/* abdomen: láminas horizontales como una coraza, más angostas hacia la cintura */}
      {[[-30, 118], [-42, 123], [-54, 128], [-66, 132]].map(([y, w]) => <group key={`lamina${y}`}><RoundedBox args={[mm(w), mm(9.5), mm(7)]} radius={mm(3.2)} smoothness={3} position={M([0, y, 75])} raycast={() => null}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox><mesh position={M([0, y - 5, 75.4])} raycast={() => null}><boxGeometry args={M([w - 14, 0.8, 6.2])} /><meshStandardMaterial color="#27a4f2" roughness={0.4} /></mesh></group>)}
      {/* costados: placas con ventilas */}
      {[-1, 1].map(sx => <group key={`flanco${sx}`}><RoundedBox args={[mm(6), mm(34), mm(104)]} radius={mm(2.6)} smoothness={3} position={M([sx * 71.5, -36, 0])} raycast={() => null}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox>{[-30, -10, 10, 30].map(z => <mesh key={z} position={M([sx * 74.6, -36, z])} raycast={() => null}><boxGeometry args={M([0.8, 22, 4])} /><meshStandardMaterial color="#1b2127" roughness={0.6} /></mesh>)}</group>)}
      {/* espalda: placa dorsal con columna y ventilación */}
      <RoundedBox args={[mm(126), mm(58), mm(6)]} radius={mm(3)} smoothness={3} position={M([0, -50, -76.5])} raycast={() => null}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox>
      <mesh position={M([0, -50, -80.2])} raycast={() => null}><boxGeometry args={M([7, 50, 1.6])} /><meshStandardMaterial color="#27a4f2" roughness={0.4} /></mesh>
      {[-1, 1].flatMap(sx => [-24, -36, -48, -60, -72].map(y => <mesh key={`ventila${sx}${y}`} position={M([sx * 30, y + 0, -79.7])} raycast={() => null}><boxGeometry args={M([34, 2.4, 1])} /><meshStandardMaterial color="#1b2127" roughness={0.6} /></mesh>))}
      {/* pecho: coraza en V (ancha arriba, angosta en la cintura) con pectorales, esternón y corazón luminoso */}
      <TaperedShell bottom={50} top={64} y0={-16} y1={38} depth={72} bevel={9} color="#f4f7f9" />
      {[-1, 1].map(sx => <RoundedBox key={`pecho${sx}`} args={[mm(44), mm(28), mm(10)]} radius={mm(6)} smoothness={3} position={M([sx * 31, 28, 50])} rotation={[0, 0, sx * 0.1]}><meshStandardMaterial color="#e3e9ed" roughness={0.28} /></RoundedBox>)}
      <B at={[0, 28, 54]} size={[3, 28, 2]} color="#27a4f2" />
      <RoundedBox args={[mm(40), mm(14), mm(8)]} radius={mm(4)} smoothness={3} position={M([0, -6, 50])}><meshStandardMaterial color="#e3e9ed" roughness={0.28} /></RoundedBox>
      <mesh position={M([0, 9, 53.5])}><sphereGeometry args={[mm(6.5), 18, 14]} /><meshStandardMaterial color="#27a4f2" emissive="#27a4f2" emissiveIntensity={0.9} roughness={0.3} /></mesh>
      <C at={[0, 9, 52.2]} r={9} h={2} color="#14181c" axis="z" />
      {/* barra de hombros: ancha, para que los brazos cuelguen por fuera de las orugas; remata en hombros esféricos con tapa donde va cada servo */}
      <RoundedBox args={[mm(224), mm(38), mm(76)]} radius={mm(17)} smoothness={4} position={M([0, 60, 0])}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox>
      <B at={[0, 60, 38.4]} size={[150, 3, 1]} color="#27a4f2" />
      {[-1, 1].map(sx => <group key={`hombro${sx}`}><mesh position={M([sx * 108, 60, 8])} scale={[1, 1.1, 1.1]}><sphereGeometry args={[mm(22), 28, 20]} /><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></mesh><C at={[sx * 117, 59, 8]} r={17} h={3} color="#14181c" axis="x" /><C at={[sx * 118.4, 59, 8]} r={6} h={1.4} color="#27a4f2" axis="x" />
        <mesh position={M([sx * 52, 79, 8])} scale={[1, 0.55, 1.5]}><sphereGeometry args={[mm(17), 20, 14]} /><meshStandardMaterial color="#f4f7f9" roughness={0.32} /></mesh>
        {/* hombreras: dos láminas superpuestas que cubren el servo del hombro */}
        <mesh position={M([sx * 116, 75, 6])} scale={[1.02, 0.6, 1.12]}><sphereGeometry args={[mm(31), 28, 18]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
        <mesh position={M([sx * 124, 63, 6])} scale={[0.9, 0.5, 1.1]}><sphereGeometry args={[mm(27), 28, 18]} /><meshStandardMaterial color="#e3e9ed" roughness={0.3} /></mesh>
        <mesh position={M([sx * 116, 68, 6])} scale={[1.04, 0.16, 1.14]}><sphereGeometry args={[mm(31.4), 28, 12]} /><meshStandardMaterial color="#27a4f2" roughness={0.35} /></mesh></group>)}
      {/* cuello y espalda */}
      <C at={[0, 82.5, 10]} r={27} h={3} color="#1b2127" />
      <C at={[0, 78, 10]} r={22} h={5} color="#3b4650" />
      <B at={[0, 24, -45.4]} size={[56, 44, 1.2]} color="#1b2127" />
      {[-15, -7.5, 0, 7.5, 15].map(z => <B key={`rejilla${z}`} at={[0, 24 + z, -46.2]} size={[44, 1, 0.8]} color="#6b7a85" />)}
    </>;
    case 'robot-arm': return <>
      {/* hombro: articulación oscura y delgada bajo la hombrera */}
      <C at={[0, 28, 0]} r={10.5} h={30} color="#3b4650" axis="x" />
      {[-1, 1].map(sx => <group key={`bolt${sx}`}><C at={[sx * 15.6, 28, 0]} r={5.4} h={1.4} color="#14181c" axis="x" /><C at={[sx * 16.5, 28, 0]} r={2.2} h={1.2} color="#c8d0d6" axis="x" metal={0.5} /></group>)}
      {/* brazo esbelto como el de una persona: deltoides arriba, bíceps, y se afina hacia el codo */}
      <mesh position={M([0, 22, 0])} scale={[1, 1.15, 1]}><sphereGeometry args={[mm(12.4), 24, 18]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
      <mesh position={M([0, -1, 0])}><cylinderGeometry args={[mm(10.4), mm(7.8), mm(58), 28]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
      <mesh position={M([0, 7, 0])} scale={[1, 1.6, 1.05]}><sphereGeometry args={[mm(10.2), 24, 18]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
      <mesh position={M([0, 12, 0])}><cylinderGeometry args={[mm(11.2), mm(10.6), mm(3.4), 28]} /><meshStandardMaterial color="#27a4f2" roughness={0.35} /></mesh>
      <mesh position={M([0, -17, 0])}><cylinderGeometry args={[mm(8.6), mm(8.2), mm(3), 28]} /><meshStandardMaterial color="#3b4650" roughness={0.4} /></mesh>
      {/* codo: articulación esférica oscura sobre el eje del servo */}
      <mesh position={M([0, -33, 0])}><sphereGeometry args={[mm(8.8), 22, 16]} /><meshStandardMaterial color="#3b4650" roughness={0.4} /></mesh>
      <C at={[0, -33, 0]} r={6.2} h={26} color="#1b2127" axis="x" />
    </>;
    case 'robot-forearm': return <>
      <C at={[0, 34, 0]} r={6.2} h={26} color="#1b2127" axis="x" />
      {[-1, 1].map(sx => <group key={`codo${sx}`}><C at={[sx * 15.8, 34, 0]} r={4.6} h={1.4} color="#3b4650" axis="x" /><C at={[sx * 16.7, 34, 0]} r={1.9} h={1.2} color="#c8d0d6" axis="x" metal={0.5} /></group>)}
      {/* antebrazo: más grueso junto al codo y fino en la muñeca */}
      <mesh position={M([0, 20, 0])} scale={[1, 1.5, 1.05]}><sphereGeometry args={[mm(9.8), 24, 18]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
      <mesh position={M([0, 2, 0])}><cylinderGeometry args={[mm(9), mm(6), mm(64), 28]} /><meshStandardMaterial color="#f4f7f9" roughness={0.28} /></mesh>
      <mesh position={M([0, 14, 0])}><cylinderGeometry args={[mm(9.4), mm(8.6), mm(8), 28]} /><meshStandardMaterial color="#27a4f2" roughness={0.35} /></mesh>
      <mesh position={M([0, -27, 0])}><cylinderGeometry args={[mm(6.8), mm(7.2), mm(9), 24]} /><meshStandardMaterial color="#3b4650" roughness={0.4} /></mesh>
      <mesh position={M([0, -36, 0])}><sphereGeometry args={[mm(7), 20, 14]} /><meshStandardMaterial color="#1b2127" roughness={0.4} /></mesh>
    </>;
    case 'robot-claw': return <>
      {/* mano: palma redondeada, nudillos y dos dedos con yemas que se abren y cierran con el servo */}
      <RoundedBox args={[mm(28), mm(14), mm(30)]} radius={mm(6.5)} smoothness={5} position={M([0, 9, 0])}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox>
      <B at={[0, 16.4, 0]} size={[18, 0.7, 22]} color="#27a4f2" />
      {[-1, 1].map(side => { const x = side * (clawGap(angle) * 1000 / 2 + 3.2); return <group key={`dedo${side}`}>
        <mesh position={M([x, 1, 0])} scale={[1, 1, 2.4]}><sphereGeometry args={[mm(3.6), 16, 12]} /><meshStandardMaterial color="#3b4650" roughness={0.4} /></mesh>
        <mesh position={M([x, -14, 0])} scale={[1, 1, 2.4]}><cylinderGeometry args={[mm(3.6), mm(2.9), mm(30), 18]} /><meshStandardMaterial color="#3b4650" roughness={0.4} /></mesh>
        <mesh position={M([x, -29, 0])} scale={[1, 1, 2.4]}><sphereGeometry args={[mm(2.9), 16, 12]} /><meshStandardMaterial color="#1b2127" roughness={0.45} /></mesh>
        <B at={[x - side * 3.5, -18, 0]} size={[0.8, 18, 14]} color="#aab3b9" />
      </group>; })}
    </>;
    case 'robot-head': return <>
      <RoundedBox args={[mm(104), mm(78), mm(78)]} radius={mm(20)} smoothness={5}><meshStandardMaterial color="#f4f7f9" roughness={0.32} /></RoundedBox>
      <RoundedBox args={[mm(94), mm(60), mm(5)]} radius={mm(2.4)} smoothness={3} position={M([0, 2, 38.8])}><meshStandardMaterial color="#0b0f13" roughness={0.18} metalness={0.2} /></RoundedBox>
      {[-1, 1].map(side => <group key={side}><C at={[side * 52.5, 2, 0]} r={13} h={8} color="#f4f7f9" axis="x" /><C at={[side * 56.7, 2, 0]} r={9} h={1.2} color="#27a4f2" axis="x" /></group>)}
      <C at={[0, -38.5, 0]} r={26} h={3} color="#1b2127" />
      <C at={[-30, 45, -26]} r={2.2} h={13} color="#c8d0d6" />
      <mesh position={M([-30, 53, -26])}><sphereGeometry args={[mm(4.8), 16, 12]} /><meshStandardMaterial color="#27a4f2" emissive="#27a4f2" emissiveIntensity={0.9} roughness={0.3} /></mesh>
      <B at={[0, 36.6, 20]} size={[34, 1.2, 0.8]} color="#27a4f2" />
    </>;
    case 'track-sprocket': return <>
      <C at={[0, 0, 0]} r={26} h={16} color="#3a4046" axis="x" />
      <C at={[0, 0, 0]} r={29} h={4} color="#2b3036" axis="x" />
      <C at={[0, 0, 0]} r={8} h={22} color="#aeb7bd" metal={0.6} axis="x" />
      <C at={[9, 0, 0]} r={6.2} h={2.6} color="#27a4f2" axis="x" metal={0.3} />
      <C at={[10.4, 0, 0]} r={2.6} h={1.6} color="#d8dde0" metal={0.5} axis="x" />
      {Array.from({length: 12}, (_, i) => <group key={i} rotation={[i * Math.PI / 6, 0, 0]}><B at={[0, 30.6, 0]} size={[16, 3.8, 4.4]} color="#4b535b" /></group>)}
    </>;
    case 'track-belt': return <>
      {[-1, 1].map(side => <B key={`run${side}`} at={[0, side * 31, 0]} size={[22, 3, 97]} color="#1c1f23" rough={0.8} />)}
      {[-1, 1].map(end => <C key={`end${end}`} at={[0, 0, end * 48.5]} r={31.5} h={22} color="#1c1f23" axis="x" rough={0.8} />)}
      {[-1, 1].flatMap(side => Array.from({length: 12}, (_, i) => <B key={`rib${side}${i}`} at={[0, side * 32.2, -44 + i * 8]} size={[22, 1.6, 3.4]} color="#303840" />))}
      {[-1, 1].flatMap(end => Array.from({length: 7}, (_, i) => { const a = (-90 + i * 30) * Math.PI / 180, r = 32.3; return <group key={`cap${end}${i}`} position={M([0, Math.sin(a) * r * (end > 0 ? 1 : 1), end * 48.5 + Math.cos(a) * r * end])} rotation={[end > 0 ? a + Math.PI / 2 : -(a + Math.PI / 2) , 0, 0]}><B at={[0, 0, 0]} size={[22, 1.6, 3.4]} color="#303840" /></group>; }))}
      {[-1, 1].map(side => <B key={`plate${side}`} at={[side * 12.2, 0, 0]} size={[1.6, 6, 150]} color="#3a4046" />)}
    </>;
    case 'oled-ssd1306': return <>
      <B at={[0, -1.5, 0]} size={[66, 1.4, 41]} color="#0d1217" rough={0.5} />
      <B at={[0, 0.1, 2.5]} size={[62, 2, 31]} color="#05070a" rough={0.25} />
      <OledScreen display={display} at={[0, 1.15, 3]} size={[55, 27.5]} />
      {[[-30, -18.5], [30, -18.5], [-30, 18.5], [30, 18.5]].map(([x, z]) => <C key={`${x}${z}`} at={[x, -0.6, z]} r={1.5} h={1.6} color="#c8a450" metal={0.6} />)}
      {[-3.81, -1.27, 1.27, 3.81].map((x, i) => <group key={x}><B at={[x, 0, -17.5]} size={[2.3, 2.4, 2.3]} color={BLACK} /><B at={[x, 1.9, -17.5]} size={[0.65, 2.2, 0.65]} color={GOLD} metal={0.6} /></group>)}
      {['GND', 'VCC', 'SCL', 'SDA'].map((t, i) => <Mark key={t} text={t} at={[-3.81 + i * 2.54, -0.78, -14.6]} width={2.3} height={1.4} />)}
    </>;
    case 'push-button-6mm': return <>
      <B at={[0, -1.5, 0]} size={[12, 5, 12]} color="#2a2f35" />
      <B at={[0, 1.2, 0]} size={[8, 1, 8]} color="#9aa3a8" metal={0.6} />
      <C at={[0, 2 - (control >= 0.5 ? 0.9 : 0), 0]} r={2.8} h={3.2} color="#c23b32" />
      {[[-3.5, -5.5], [3.5, -5.5], [-3.5, 5.5], [3.5, 5.5]].map(([x, z]) => <B key={`${x}${z}`} at={[x, 1.2, z]} size={[1, 0.6, 2]} color={GOLD} metal={0.6} />)}
      <Mark text="S" at={[0, -3.9, 5.9]} width={2} height={2} />
    </>;
    case 'potentiometer-10k': return <>
      <B at={[0, 0, 0]} size={[18, 10, 18]} color="#2e66b5" rough={0.5} />
      <C at={[0, 7, 0]} r={5.2} h={4} color="#d8dde0" metal={0.5} />
      <group position={M([0, 9.2, 0])} rotation={[0, (0.5 - control) * 270 * Math.PI / 180, 0]} userData={{potKnob: true}}>
        <C at={[0, 0, 0]} r={4.2} h={2.4} color="#1f2328" />
        <B at={[0, 1.3, -2.1]} size={[0.9, 0.5, 4.2]} color="#f1f3f2" />
      </group>
      {[-5, 0, 5].map((x, i) => <B key={x} at={[x, -5, -8]} size={[1, 6, 1]} color={GOLD} metal={0.6} />)}
      <Mark text="10K" at={[0, 5.05, 6.5]} width={6} height={2} />
    </>;
    case 'servo-sg90': return <>
      {String(color) === 'armadura' ? <>
        <RoundedBox args={[mm(24), mm(23.4), mm(13.6)]} radius={mm(4.4)} smoothness={4} position={M([0, 0, 0])}><meshStandardMaterial color="#f4f7f9" roughness={0.3} /></RoundedBox>
        <RoundedBox args={[mm(33), mm(2.6), mm(13.6)]} radius={mm(1.2)} smoothness={3} position={M([0, 6.5, 0])}><meshStandardMaterial color="#e3e9ed" roughness={0.3} /></RoundedBox>
        <B at={[0, -3, 6.9]} size={[14, 1.2, 0.5]} color="#27a4f2" />
      </> : <>
        <B at={[0, 0, 0]} size={[22.5, 22.7, 12]} color="#2f6db3" rough={0.5} />
        <B at={[0, 6.5, 0]} size={[32.5, 2, 12]} color="#2f6db3" rough={0.5} />
      </>}
      {[-14.6, 14.6].map(x => <C key={x} at={[x, 6.5, 0]} r={2.5} h={2.3} color="#1c2630" />)}
      <C at={[5.6, 12.2, 0]} r={5.6} h={3.4} color="#2f6db3" rough={0.5} />
      <C at={[-2.5, 12.2, 0]} r={2.6} h={3.4} color="#2f6db3" rough={0.5} />
      <C at={[5.6, 14.4, 0]} r={2.4} h={2.6} color="#d8dde0" metal={0.3} />
      <group position={M([5.6, 16.6, 0])} rotation={[0, (angle - 90) * Math.PI / 180, 0]} userData={{servoHorn: true}}>
        <B at={[8, 0, 0]} size={[20, 1.6, 4.2]} color="#f1f3f2" />
        <C at={[0, 0, 0]} r={3.6} h={1.6} color="#f1f3f2" />
        <Screw at={[0, 1.1, 0]} />
      </group>
      {[['#e0861a', -2.54], ['#c2362f', 0], ['#4a3022', 2.54]].map(([c, z]) => <B key={String(c)} at={[-19, -4, Number(z)]} size={[10, 1.2, 1.2]} color={String(c)} />)}
      <B at={[-24.5, -4, 0]} size={[3, 2, 7.6]} color={BLACK} />
    </>;
    case 'sumo-wedge': case 'sumo-scoop': case 'sumo-bumper': return <CombatMesh id={id} />;
    case 'tcrt5000-module': return <>
      <Plate w={12} d={32} t={1.6} color="#243b45" radius={1} holes={[[0, 6, 1.3]]} />
      <B at={[0, 1.8, -1]} size={[5, 2, 7]} color={BLACK} />
      <B at={[0, 2.5, -8]} size={[5, 3, 4]} color="#2d68a0" /><Screw at={[0, 4.05, -8]} />
      <B at={[0, -2.2, 9]} size={[9, 3, 7]} color={BLACK} />
      <C at={[-2.4, -3.2, 10]} r={1.7} h={1.5} color="#274b78" /><C at={[2.4, -3.2, 10]} r={1.7} h={1.5} color="#171c22" />
      {[-2.54, 0, 2.54].map((x, i) => <group key={x}><B at={[x, 2.8, -13]} size={[2.4, 2.4, 2.4]} color={BLACK} /><B at={[x, 4, -13]} size={[0.65, 1.4, 0.65]} color={GOLD} metal={0.6} /><Mark text={['+','-','DO'][i]} at={[x, 0.88, -9.5]} width={2} height={1.3} /></group>)}
      <Mark text="TCRT5000" at={[0, 0.88, 0]} width={9} height={2} />
    </>;
    case 'ir-double-bracket': return <>
      <B at={[0, -16, -15]} size={[56, 2, 4]} color="#28343b" />
      {[-18, 18].map(x => <Plate key={x} w={12} d={30} t={2} at={[x, -16, 0]} color="#28343b" holes={[[0, 0, 1.5]]} />)}
      {[-24, 24].map(x => <group key={x}><C at={[x, 0, -14]} r={2.7} h={32} color={GOLD} metal={0.5} /><Screw at={[x, 16.5, -14]} /></group>)}
    </>;
    case 'power-switch': return <>
      <B at={[0, 0, 0]} size={[14, 12, 24]} color={BLACK} />
      <group position={M([0, 6, 0])} rotation={[closed ? -0.15 : 0.15, 0, 0]}><B at={[0, 0, 0]} size={[11, 3, 19]} color={closed ? '#a63d37' : '#4b5156'} /><Mark text="I   O" at={[0, 1.55, 0]} width={7} height={4} /></group>
      {[-8, 8].map(z => <B key={z} at={[0, -7, z]} size={[3, 2, 0.6]} color={SILVER} metal={0.65} />)}
    </>;
    case 'regulator-5v': return <>
      <Plate w={20} d={28} t={1.6} color="#254f90" holes={[[-7, -10, 1], [7, 10, 1]]} />
      <B at={[0, 3.1, 0]} size={[8, 5, 8]} color="#3d4346" /><Mark text="220" at={[0, 5.65, 0]} width={6} height={2} />
      <B at={[0, 1.5, -8]} size={[5, 1.3, 4]} color={BLACK} />
      <B at={[-6, 1.3, 1]} size={[2, 1, 4]} color="#b7a775" /><B at={[6, 1.3, 1]} size={[2, 1, 4]} color="#b7a775" />
      <Mark text="5V" at={[0, 0.88, 10]} width={7} height={3} />
      {[[-7, -9, 'VIN'], [-7, 9, 'GND'], [7, -9, '5V'], [7, 9, 'GND']].map(([x, z, name]) => <group key={String(name)+x}><B at={[Number(x), 2.6, Number(z)]} size={[2.4, 3.5, 2.4]} color={BLACK} /><B at={[Number(x), 4.5, Number(z)]} size={[0.65, 1, 0.65]} color={GOLD} metal={0.7} /><Mark text={String(name)} at={[Number(x) * 0.55, 0.88, Number(z)]} width={4} height={1.5} /></group>)}
    </>;
    case 'breadboard-400': return <BreadboardBody />;
    case 'chassis-2wd': if (String(color) === 'oruga') return <TrackedFrame />; return <>
      <Plate w={140} d={210} t={4} radius={18} color="#5c95ce" holes={[-45, 45].flatMap(x => [-80, 40, 90].map(z => [x, z, 2.5] as [number, number, number])).concat([[-62, -20, 2], [62, -20, 2], [0, 85, 2], [-18, -45, 2], [18, -45, 2], [-18, 40, 2], [18, 40, 2], [-24, -4, 6], [24, -4, 6]])} />
      <Mark text="2WD" at={[0, 2.05, -82]} width={22} height={7} color="#193d70" />
    </>;
    case 'dc-motor-tt': return <>
      <B at={[1, 0, 0]} size={[44, 22, 18]} color="#efc62e" />
      <B at={[1, 0, 0]} size={[44.2, 0.55, 18.2]} color="#b99623" />
      <C at={[-27, 0, 0]} r={8.8} h={16} color={SILVER} axis="x" metal={0.55} rough={0.32} />
      <B at={[-34.5, 0, 0]} size={[1, 16, 15]} color="#30383c" />
      <C at={[29, 0, 0]} r={7.5} h={12} color="#efc62e" axis="x" />
      {[-1, 1].map(s => <group key={s}><C at={[s * 37.5, 0, 0]} r={2.8} h={9} color="#e8e3cc" axis="x" /><B at={[s * 38, 2.5, 0]} size={[8, 0.6, 3.3]} color="#c7bfa3" /></group>)}
      {[-10, 10].map(x => <group key={x}><C at={[x, 0, 9]} r={1.5} h={0.4} color={SILVER} axis="z" metal={0.65} /></group>)}
      <Mark text="TT" at={[3, 11.03, 0]} width={10} height={5} color="#9b7917" />
    </>;
    case 'wheel-65': return <>
      <mesh rotation={[0, 0, Math.PI / 2]}><latheGeometry args={[TIRE_PROFILE, 48]} /><meshStandardMaterial color="#24282c" roughness={0.95} /></mesh>
      {[-11.5, 11.5].map(x => <group key={x}><Ring at={[x, 0, 0]} r={28.5} tube={1.5} color="#33383c" axis="x" /><Ring at={[x, 0, 0]} r={20.2} tube={2.2} color="#d8b028" axis="x" /></group>)}
      {Array.from({length: 28}, (_, i) => [-8, 0, 8].map((x, j) => {const a = (i + (j % 2) * 0.35) * Math.PI * 2 / 28; return <group key={`${i}:${j}`} position={M([x, Math.cos(a) * 31, Math.sin(a) * 31])} rotation={[a, 0, 0]}><B at={[0, 0, 0]} size={[7.2, 2.2, 4]} color="#303439" rough={0.95} /></group>; }))}
      <C at={[0, 0, 0]} r={8} h={25.5} color="#e9be30" axis="x" />
      {[-1, 1].flatMap(side => Array.from({length: 5}, (_, i) => {const a = i * Math.PI * 2 / 5; return <group key={`${side}:${i}`} position={M([side * 10.5, 0, 0])} rotation={[a, 0, 0]}><B at={[0, 12, 0]} size={[3, 18, 8]} color="#e9be30" /></group>; }))}
      <C at={[0, 0, 0]} r={2.8} h={26} color="#4d5356" axis="x" />
    </>;
    case 'caster-ball': return <>
      <mesh position={M([0, -9, 0])}><sphereGeometry args={[mm(12.5), 32, 20]} /><meshStandardMaterial color={SILVER} metalness={0.72} roughness={0.23} /></mesh>
      <Ring at={[0, -3, 0]} r={10.2} tube={1.8} />
      <C at={[0, 6, 0]} r={7} h={17} color={SILVER} metal={0.6} />
      <Plate w={25} d={25} t={2} at={[0, 20.5, 0]} color={SILVER} metal={0.6} holes={[[-8, -8, 1.7], [8, 8, 1.7], [-8, 8, 1.7], [8, -8, 1.7]]} />
    </>;
    case 'arduino-uno-r3': return <>
      <Plate w={53.4} d={68.6} t={1.6} color="#1764a3" radius={2} holes={[[-19, -29, 1.6], [18, -29, 1.6], [-19, 28, 1.6], [18, 28, 1.6]]} />
      {[-19, 18].flatMap(x => [-29, 28].map(z => <Ring key={`${x}:${z}`} at={[x, 0.85, z]} r={2.1} tube={0.35} color={GOLD} />))}
      <B at={[-13, 5, -26]} size={[12, 10, 16]} color={SILVER} metal={0.6} rough={0.3} />
      <B at={[-13, 5, -34.05]} size={[9, 6.7, 0.25]} color="#343b40" />
      <B at={[-13, 3.7, -34.2]} size={[6.5, 2.6, 0.15]} color="#c9cbd0" />
      <B at={[13, 5, -27]} size={[9, 10, 14]} color={BLACK} />
      <C at={[13, 5, -33.9]} r={3.2} h={0.5} color="#090e13" axis="z" />
      <C at={[13, 5, -34.2]} r={0.85} h={0.5} color={SILVER} metal={0.6} axis="z" />
      <B at={[-1, 1.5, 9]} size={[11, 1.5, 37]} color="#303940" />
      <Chip at={[-1, 3.4, 9]} length={34} />
      <Mark text="ATMEGA328P" at={[-1, 4.75, 9]} width={6} height={1.8} />
      <Chip at={[-9, 2.1, -12]} length={7} rows={4} />
      <B at={[-13, 2.3, 17]} size={[3.7, 2.8, 9]} color={SILVER} metal={0.6} />
      <B at={[-14, 1.6, -17]} size={[5, 1.5, 5]} color={BLACK} /><C at={[-14, 2.65, -17]} r={1.6} h={0.7} color="#bdc5c6" />
      <Capacitor at={[7, 4.7, -17]} /><Capacitor at={[14, 4.7, -17]} />
      {[-6, 0, 6].map(z => <group key={z}><B at={[13, 1.4, z]} size={[2, 1.2, 1.1]} color="#c2ad71" /><B at={[16, 1.2, z]} size={[2.4, 0.8, 1]} color="#3a4548" /></group>)}
      <Mark text="UNO R3" at={[-13, 0.9, 3]} width={10} height={4} />
      <Mark text="DIGITAL" at={[18.7, 0.9, -10]} width={6} height={1.8} />
    </>;
    case 'l298n-module': return <>
      <Plate w={43} d={43} t={1.6} at={[0, -8, 0]} color="#b03030" holes={[[-17, -16, 1.6], [17, -16, 1.6], [-17, 16, 1.6], [17, 16, 1.6]]} />
      <B at={[0, -1, -1]} size={[22, 12, 10]} color="#22282d" metal={0.3} />
      {[-9, -6, -3, 0, 3, 6, 9].map(x => <B key={x} at={[x, 8.3, -1]} size={[1.2, 10.4, 12]} color="#30383e" metal={0.4} rough={0.32} />)}
      <Screw at={[0, 5.4, 5.4]} />
      <Capacitor at={[-12, -1.5, -10]} r={2.6} h={10} /><Capacitor at={[12, -1.5, -10]} r={2.6} h={10} />
      {[-12, 12].flatMap(x => [-2, 3, 8].map(z => <B key={`${x}:${z}`} at={[x, -5.9, z]} size={[2, 2, 3.5]} color={BLACK} />))}
      <Mark text="L298N" at={[0, -7.05, 12]} width={13} height={3} />
    </>;
    case 'hc-sr04': return <>
      <group rotation={[Math.PI / 2, 0, 0]}><Plate w={45} d={20} t={1.6} at={[0, -4.5, 0]} color="#225f9b" radius={1.2} holes={[[-20, -7, 1], [20, -7, 1], [-20, 7, 1], [20, 7, 1]]} /></group>
      {[-11.5, 11.5].map(x => <group key={x}>
        <C at={[x, 0, 1.5]} r={8.1} h={11.5} color={SILVER} axis="z" metal={0.65} rough={0.3} />
        <C at={[x, 0, 7.28]} r={6.8} h={0.1} color="#343e47" axis="z" />
        <Ring at={[x, 0, 7.05]} r={7.35} tube={0.45} axis="z" />
        {[-4, -2, 0, 2, 4].map(y => <B key={y} at={[x, y, 7.38]} size={[2 * Math.sqrt(6.1 ** 2 - y ** 2), 0.22, 0.12]} color="#8b979f" metal={0.55} />)}
        <C at={[x, 0, 7.41]} r={2} h={0.1} color="#202b34" axis="z" />
      </group>)}
      <Mark text="HC-SR04" at={[0, 7.8, -3.62]} width={13} height={2} front />
      <B at={[0, 0, -5.9]} size={[6, 4, 1.3]} color={BLACK} />
    </>;
    case 'battery-holder-4aa': return <>
      <B at={[0, -6.8, 0]} size={[63, 2.4, 58]} color={BLACK} />
      {[-30.5, 30.5].map(x => <B key={x} at={[x, 0, 0]} size={[2, 16, 58]} color={BLACK} />)}
      {[-28, 28].map(z => <B key={z} at={[0, 0, z]} size={[63, 16, 2]} color={BLACK} />)}
      {[-15, 0, 15].map(x => <B key={x} at={[x, -1, 0]} size={[1.2, 12, 54]} color={BLACK} />)}
      {[-22.5, -7.5, 7.5, 22.5].map((x, i) => <group key={x}>
        <C at={[x, 0.6, 0]} r={6.8} h={49} color={i % 2 ? '#547e86' : '#bdb9a9'} axis="z" rough={0.42} metal={0.25} />
        {[-24.5, 24.5].map(z => <C key={z} at={[x, 0.6, z]} r={6.1} h={0.7} color={SILVER} axis="z" metal={0.7} />)}
        <C at={[x, 0.6, i % 2 ? -25.3 : 25.3]} r={2.4} h={1} color={SILVER} axis="z" metal={0.65} />
        <Mark text="AA" at={[x, 7.45, 0]} width={8} height={5} />
      </group>)}
    </>;
    case 'sensor-bracket': return <>
      <Plate w={50} d={12} t={4} at={[0, -13, 0]} color="#e7e5d8" holes={[[-18, 0, 1.8], [18, 0, 1.8]]} />
      <group position={M([0, 0, 4])} rotation={[Math.PI / 2, 0, 0]}><Plate w={50} d={30} t={4} color="#e7e5d8" holes={[[-11.5, 0, 8.7], [11.5, 0, 8.7], [-21, 10, 1.3], [21, 10, 1.3]]} /></group>
    </>;
    case 'bracket-generic': return <>
      <Plate w={40} d={20} t={3} at={[0, -8.5, 0]} color={SILVER} metal={0.6} holes={[[-13, 0, 2], [13, 0, 2]]} />
      <Plate w={40} d={20} t={3} at={[0, 8.5, 0]} color={SILVER} metal={0.6} holes={[[-13, 0, 2], [13, 0, 2]]} />
      <B at={[-18.5, 0, 0]} size={[3, 14, 20]} color={SILVER} metal={0.6} /><B at={[18.5, 0, 0]} size={[3, 14, 20]} color={SILVER} metal={0.6} />
    </>;
    case 'led-5mm': {const base = LED_COLORS[String(color)] ?? LED_COLORS.rojo; return <>
      <C at={[0, -1.2, 0]} r={2.5} h={5.4} color={base} rough={0.2} />
      <C at={[0, -3.55, 0]} r={2.9} h={0.65} color={base} rough={0.2} />
      <mesh position={M([0, 1.5, 0])} userData={{glowMesh: true}}><sphereGeometry args={[mm(2.5), 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={base} emissive={base} emissiveIntensity={glow * 2.2} transparent opacity={0.88} roughness={0.18} /></mesh>
      {[-1.27, 1.27].map(x => <B key={x} at={[x, -4.1, 0]} size={[0.45, 0.8, 0.45]} color={SILVER} metal={0.65} />)}
      {glow > 0.02 && <pointLight position={M([0, 2, 0])} color={base} intensity={glow * 0.05} distance={0.15} />}
    </>; }
    case 'resistor': {
      const colors = ['#17191c', '#75442c', '#d34233', '#e58a32', '#eadc4e', '#4f9561', '#427db7', '#8c64a2', '#92989e', '#eee9df'];
      const value = Math.max(1, ohms), exp = Math.floor(Math.log10(value)) - 1, digits = Math.round(value / 10 ** exp);
      const bands = [colors[Math.min(9, Math.floor(digits / 10))], colors[digits % 10], exp === -1 ? '#c6a44b' : exp === -2 ? SILVER : colors[Math.max(0, Math.min(9, exp))], '#c6a44b'];
      return <><C at={[0, 0, 0]} r={1.2} h={6.3} color="#d8c496" axis="x" rough={0.65} /><C at={[0, 0, 0]} r={0.22} h={9} color={SILVER} axis="x" metal={0.65} />{[-2.1, -0.8, 0.5, 2.1].map((x, i) => <C key={x} at={[x, 0, 0]} r={1.22} h={0.5} color={bands[i]} axis="x" />)}</>;
    }
    default: return null;
  }
}

// Static detail meshes do not need to rerender when only the parent transform moves.
const DetailedBody = memo(Body);
const PhysicalConnectors = memo(Connectors);

/** Appearance only: preserve catalog IDs, electrical endpoints, transforms and selection. */
export function PartMesh({part, selected, interfering, glow, servoAngle, control, display, showPins = true}: {part: PartInstance; selected: boolean; interfering: boolean; glow?: number; servoAngle?: number; control?: number; display?: DisplayView; showPins?: boolean}) {
  const def = getDefinition(part.definitionId);
  if (!def) return null;
  return <group userData={{partId: part.instanceId}} position={part.transform.position} quaternion={part.transform.rotation}>
    {def.id === ARM_ID ? <Suspense fallback={null}><ArmMesh part={part} /></Suspense> : def.id === CONVEYOR_ID ? <ConveyorMesh part={part}/> : def.id === BLOCK_ID || def.id === ZONE_ID ? <mesh castShadow receiveShadow><boxGeometry args={def.dimensions} /><meshStandardMaterial color={pieceSurface(part,def.id === BLOCK_ID ? '#e99a40' : '#4085c9')} roughness={.55} /></mesh> : <DetailedBody id={def.id} color={part.props?.color} glow={glow} ohms={Number(part.props?.ohms ?? 220)} closed={Boolean(part.props?.closed ?? true)} angle={servoAngle} display={display} control={control ?? (part.definitionId === 'potentiometer-10k' ? Number(part.props?.position ?? 0.5) : part.props?.pressed ? 1 : 0)} />}
    <PhysicalConnectors id={def.id} showPins={showPins} />
    {(selected || interfering) && <mesh raycast={() => null}><boxGeometry args={def.dimensions} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /><Edges color={interfering ? '#d64545' : '#2563eb'} threshold={15} /></mesh>}
  </group>;
}
export function GhostMesh({definitionId, position, valid}: {definitionId: string; position: V3; valid: boolean}) {
  const def = getDefinition(definitionId);
  if (!def) return null;
  return <mesh position={position} raycast={() => null}><boxGeometry args={def.dimensions} /><meshBasicMaterial color={valid ? '#3b82c4' : '#d64545'} transparent opacity={0.35} depthWrite={false} /><Edges color={valid ? '#2a67a3' : '#b83232'} /></mesh>;
}

/** Same component geometry as the real part, with a non-interactive ghost material. */
export function AssemblyGhost({part, active}: {part: PartInstance; active: boolean}) {
  const group = useRef<Group>(null);
  useLayoutEffect(() => {
    const material = new MeshBasicMaterial({color: active ? '#2563eb' : '#70a1dd', transparent: true, opacity: active ? 0.38 : 0.12, depthWrite: false});
    const originals: {mesh: Mesh; material: Mesh['material']}[] = [];
    group.current?.traverse(o => { const mesh = o as Mesh; if (mesh.isMesh) { originals.push({mesh, material: mesh.material}); mesh.material = material; } });
    return () => { for (const item of originals) item.mesh.material = item.material; material.dispose(); };
  }, [part.definitionId, active]);
  return <group ref={group}><PartMesh part={part} selected={false} interfering={false} showPins={false} /></group>;
}
