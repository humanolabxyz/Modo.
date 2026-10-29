import {Edges} from '@react-three/drei';
import {getDefinition} from '../catalog/index.ts';
import type {PinDefinition} from '../catalog/types.ts';
import type {PartInstance} from '../project/types.ts';

const mm = (v: number) => v / 1000;
type Box = {at: [number, number, number]; size: [number, number, number]; color: string; metal?: number; rough?: number; opacity?: number};
const B = ({at, size, color, metal = 0, rough = 0.6, opacity}: Box) => <mesh position={at}><boxGeometry args={size} /><meshStandardMaterial color={color} metalness={metal} roughness={rough} transparent={opacity !== undefined} opacity={opacity ?? 1} /></mesh>;
const Cyl = ({at, r, h, color, axis = 'y', metal = 0, rough = 0.6}: {at: [number, number, number]; r: number; h: number; color: string; axis?: 'x' | 'y' | 'z'; metal?: number; rough?: number}) => (
  <mesh position={at} rotation={axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}><cylinderGeometry args={[r, r, h, 28]} /><meshStandardMaterial color={color} metalness={metal} roughness={rough} /></mesh>
);

const PIN_COLORS: Record<PinDefinition['role'], string> = {'power-in': '#d94b4b', 'power-out': '#e08a3c', ground: '#3b3f45', digital: '#d8b64a', pwm: '#4aa3d8', analog: '#4abf8a', motor: '#a56bd8', signal: '#d8b64a'};

/** Pines como marcas pequeñas para que se vean (y no queden tapados por el contorno de selección). */
function Pins({pins}: {pins: PinDefinition[]}) {
  return <>{pins.map(p => <mesh key={p.id} position={p.position}><boxGeometry args={[0.0018, 0.0018, 0.0018]} /><meshStandardMaterial color={PIN_COLORS[p.role]} metalness={0.4} roughness={0.4} /></mesh>)}</>;
}

/** Geometría procedural de cada pieza (D-07). Las medidas vienen del catálogo; los detalles son solo visuales. */
const LED_COLORS: Record<string, string> = {rojo: '#e53935', verde: '#2fbf5a', amarillo: '#f2c230', azul: '#2f7de1'};
function LedBody({color, glow}: {color: string; glow?: number}) {
  const base = LED_COLORS[color] ?? LED_COLORS.rojo, on = glow ?? 0;
  return <>
    <Cyl at={[0, mm(-1.2), 0]} r={mm(2.9)} h={mm(5.4)} color={base} rough={0.25} />
    <mesh position={[0, mm(1.5), 0]} userData={{glowMesh: true}}><sphereGeometry args={[mm(2.9), 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={base} emissive={base} emissiveIntensity={on * 2.2} transparent opacity={0.88} roughness={0.2} /></mesh>
    <B at={[mm(-1.27), mm(-3.6), 0]} size={[mm(0.5), mm(2.2), mm(0.5)]} color="#b9c0c6" metal={0.8} /><B at={[mm(1.27), mm(-3.4), 0]} size={[mm(0.5), mm(1.8), mm(0.5)]} color="#b9c0c6" metal={0.8} />
    {on > 0.02 && <pointLight position={[0, mm(2), 0]} color={base} intensity={on * 0.05} distance={0.15} />}
  </>;
}
function Body({id, color, glow}: {id: string; color?: unknown; glow?: number}) {
  switch (id) {
    case 'chassis-2wd': return <>
      <B at={[0, 0, 0]} size={[mm(140), mm(4), mm(210)]} color="#b9c6d0" opacity={0.78} rough={0.2} />
      {[-0.045, 0.045].flatMap(x => [-0.08, 0.04, 0.09].map(z => <Cyl key={`${x}${z}`} at={[x, 0, z]} r={mm(5)} h={mm(4.2)} color="#8794a0" />))}
    </>;
    case 'dc-motor-tt': return <>
      <B at={[mm(-8), 0, 0]} size={[mm(54), mm(22), mm(18)]} color="#e8c53a" rough={0.45} />
      <B at={[mm(29), 0, 0]} size={[mm(12), mm(18), mm(18)]} color="#d9b02a" rough={0.5} />
      <Cyl at={[mm(35), 0, 0]} r={mm(3)} h={mm(14)} color="#c9ced3" axis="x" metal={0.9} rough={0.25} />
      <Cyl at={[mm(-35), 0, 0]} r={mm(3)} h={mm(14)} color="#c9ced3" axis="x" metal={0.9} rough={0.25} />
    </>;
    case 'wheel-65': return <>
      <Cyl at={[0, 0, 0]} r={mm(32.5)} h={mm(26)} color="#202326" axis="x" rough={0.9} />
      <Cyl at={[0, 0, 0]} r={mm(20)} h={mm(27)} color="#e8e4da" axis="x" rough={0.5} />
      <Cyl at={[0, 0, 0]} r={mm(4)} h={mm(28)} color="#9aa3ab" axis="x" metal={0.7} />
    </>;
    case 'caster-ball': return <><mesh position={[0, -mm(9), 0]}><sphereGeometry args={[mm(12.5), 24, 16]} /><meshStandardMaterial color="#c9ced3" metalness={0.85} roughness={0.25} /></mesh><B at={[0, mm(10), 0]} size={[mm(18), mm(23), mm(18)]} color="#8794a0" /></>;
    case 'arduino-uno-r3': return <>
      <B at={[0, 0, 0]} size={[mm(53.4), mm(1.6), mm(68.6)]} color="#13787a" rough={0.5} />
      <B at={[mm(-14), mm(-1), mm(-30)]} size={[mm(12), mm(11), mm(16)]} color="#c9ced3" metal={0.8} rough={0.3} />
      <B at={[mm(14), mm(-0.5), mm(-31)]} size={[mm(9), mm(13), mm(14)]} color="#202326" />
      <B at={[mm(0), mm(2.3), mm(8)]} size={[mm(10), mm(3), mm(35)]} color="#1b1d20" />
      <B at={[mm(23.5), mm(3.2), mm(2.5)]} size={[mm(2.6), mm(8.5), mm(60)]} color="#1b1d20" />
      <B at={[mm(-23.5), mm(3.2), mm(13)]} size={[mm(2.6), mm(8.5), mm(36)]} color="#1b1d20" />
    </>;
    case 'l298n-module': return <>
      <B at={[0, mm(-8), 0]} size={[mm(43), mm(1.6), mm(43)]} color="#b3322f" rough={0.5} />
      <B at={[0, mm(1), mm(-2)]} size={[mm(20), mm(18), mm(10)]} color="#1b1d20" rough={0.7} />
      {[-7, -3.5, 0, 3.5, 7].map(x => <B key={x} at={[mm(x), mm(11), mm(-2)]} size={[mm(1.2), mm(6), mm(10)]} color="#22262a" />)}
      <B at={[mm(-17), mm(-4), mm(-14)]} size={[mm(9), mm(9), mm(8)]} color="#1f6fb2" />
      <B at={[mm(17), mm(-4), mm(-14)]} size={[mm(9), mm(9), mm(8)]} color="#1f6fb2" />
    </>;
    case 'hc-sr04': return <>
      <B at={[0, 0, mm(-4.5)]} size={[mm(45), mm(20), mm(1.6)]} color="#1f5fa8" rough={0.5} />
      {[-11.5, 11.5].map(x => <Cyl key={x} at={[mm(x), 0, mm(2)]} r={mm(8.2)} h={mm(12)} color="#c9ced3" axis="z" metal={0.85} rough={0.3} />)}
      <B at={[0, mm(-7), mm(-6)]} size={[mm(10), mm(2.5), mm(2.5)]} color="#1b1d20" />
    </>;
    case 'battery-holder-4aa': return <>
      <B at={[0, 0, 0]} size={[mm(63), mm(16), mm(58)]} color="#23272b" rough={0.8} />
      {[-18, -6, 6, 18].map(x => <B key={x} at={[mm(x), mm(8.2), 0]} size={[mm(2), mm(1), mm(48)]} color="#3a3f45" />)}
    </>;
    case 'sensor-bracket': return <><B at={[0, mm(-13), 0]} size={[mm(50), mm(4), mm(12)]} color="#e8e4da" rough={0.7} /><B at={[0, 0, mm(4)]} size={[mm(50), mm(30), mm(4)]} color="#e8e4da" rough={0.7} /></>;
    case 'led-5mm': return <LedBody color={String(color)} glow={glow} />;
    case 'resistor': return <>
      <B at={[0, 0, 0]} size={[mm(6.3), mm(2.4), mm(2.4)]} color="#d9c9a0" rough={0.8} />
      {[-2, -0.6, 0.8].map((x, i) => <B key={x} at={[mm(x), 0, 0]} size={[mm(0.7), mm(2.5), mm(2.5)]} color={['#b8332b', '#b8332b', '#7a4a1d'][i]} />)}
      <B at={[0, 0, 0]} size={[mm(9), mm(0.5), mm(0.5)]} color="#b9c0c6" metal={0.8} />
    </>;
    case 'bracket-generic': return <B at={[0, 0, 0]} size={[mm(40), mm(20), mm(20)]} color="#9aa7b2" rough={0.7} />;
    default: return null;
  }
}

/** Una pieza del proyecto. `tone` marca el estado (seleccionada, interferencia) con un contorno que no tapa los pines. */
export function PartMesh({part, selected, interfering, glow, showPins = true}: {part: PartInstance; selected: boolean; interfering: boolean; glow?: number; showPins?: boolean}) {
  const def = getDefinition(part.definitionId);
  if (!def) return null;
  return <group userData={{partId: part.instanceId}} position={part.transform.position} quaternion={part.transform.rotation}>
    <Body id={def.id} color={part.props?.color} glow={glow} />
    {showPins && <Pins pins={def.pins} />}
    {(selected || interfering) && <mesh raycast={() => null}><boxGeometry args={def.dimensions} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /><Edges color={interfering ? '#d64545' : '#3E806B'} threshold={15} /></mesh>}
  </group>;
}

/** Fantasma de inserción: contorno translúcido de la caja de la pieza (azul si se puede colocar, rojo si no). */
export function GhostMesh({definitionId, position, valid}: {definitionId: string; position: [number, number, number]; valid: boolean}) {
  const def = getDefinition(definitionId);
  if (!def) return null;
  return <mesh position={position} raycast={() => null}><boxGeometry args={def.dimensions} /><meshBasicMaterial color={valid ? '#3b82c4' : '#d64545'} transparent opacity={0.35} depthWrite={false} /><Edges color={valid ? '#2a67a3' : '#b83232'} /></mesh>;
}
