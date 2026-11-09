// Modelos 3D de las piezas del catálogo, hechos de primitivas con la escala real en metros (origen: centro de la huella, sobre el suelo).
// Prioridad del estilo «realismo estilizado técnico»: silueta reconocible, medidas y puertos estables y detalles visibles en geometría ligera.
import {useMemo} from 'react';
import {BoxGeometry} from 'three';
import {itemById, sizeOf} from '../catalog/items.ts';
import {BarnMesh, FenceMesh, GreenhouseMesh, WindmillMesh} from './InfrastructureMesh.tsx';
import {Boards, Instances, Mat, type ModelInstance} from './ModelParts.tsx';
import {bitOn} from '../plc/program.ts';
import type {Entity, Port, PropValue} from '../model/types.ts';

export const PORT_COLORS = {hydraulic: '#2f7de1', power: '#f2a900', signal: '#2fb35a', mechanical: '#8a8f99'} as const;
type Tint = string | null;

const num = (v: PropValue | undefined, fallback: number): number => (typeof v === 'number' ? v : fallback);

const SIDEWAYS: [number, number, number] = [0, 0, Math.PI / 2];
const FACE_X: [number, number, number] = [0, Math.PI / 2, 0];
const PUMP_FINS: ModelInstance[] = [0.018, 0.07, 0.122, 0.174, 0.226, 0.278, 0.33].map(x => ({
  at: [x, 0.262, 0], rotation: SIDEWAYS, size: [0.187, 0.013, 0.187],
}));
const SOLAR_CELLS: ModelInstance[] = Array.from({length: 60}, (_, i) => ({
  at: [((i % 10) - 4.5) * 0.158, 0.036, (Math.floor(i / 10) - 2.5) * 0.147],
  size: [0.151, 0.007, 0.141],
  color: ['#224474', '#294b82', '#1b3c70'][i % 3],
}));

function Coupling({at, radius, tint, axis = 'x'}: {at: [number, number, number]; radius: number; tint: Tint; axis?: 'x' | 'z'}) {
  return <mesh position={at} rotation={axis === 'x' ? FACE_X : undefined}>
    <torusGeometry args={[radius, radius * 0.24, 5, 14]} />
    <Mat c="#9aa5ac" tint={tint} metal={0.52} rough={0.47} />
  </mesh>;
}

/** Cuerpo de la pieza (sin puertos). `tint` pinta el fantasma de colocación (verde válido, rojo inválido). */
export type Live = {running?: boolean; flowing?: boolean; wet?: boolean};
export function EntityBody({type, params, state, tint = null, live = {}}: {type: string; params: Record<string, PropValue>; state: Record<string, PropValue>; tint?: Tint; live?: Live}) {
  switch (type) {
    case 'estanque': { const frac = Math.min(1, Math.max(0, num(state.nivelL, 0) / 10000)); return <group>
      <Boards parts={[-0.9, 0.9].flatMap(x => [-0.9, 0.9].flatMap(z => [
        {at: [x, 0.18, z], size: [0.14, 0.36, 0.14]}, {at: [x, 0.03, z], size: [0.3, 0.06, 0.3], color: '#858580'},
      ]))} c="#677278" tint={tint} metal={0.42} />
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[1.3, 1.3, 0.08, 32]} /><Mat c="#5f6a75" tint={tint} metal={0.5} /></mesh>
      <mesh position={[0, 1.4, 0]} castShadow><cylinderGeometry args={[1.3, 1.3, 2.0, 32]} /><Mat c="#cfdbe6" tint={tint} metal={0.45} rough={0.35} /></mesh>
      {[0.8, 1.4, 2.0].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[1.325, 1.325, 0.05, 32]} /><Mat c="#8fa1b3" tint={tint} metal={0.5} /></mesh>)}
      <mesh position={[0, 2.62, 0]}><coneGeometry args={[1.34, 0.42, 32]} /><Mat c="#9fb2c4" tint={tint} metal={0.5} rough={0.4} /></mesh>
      <mesh position={[0, 2.88, 0]}><cylinderGeometry args={[0.1, 0.1, 0.14, 12]} /><Mat c="#6d7782" tint={tint} metal={0.5} /></mesh>
      <Boards parts={[
        ...[-0.16, 0.16].map((x): ModelInstance => ({at: [x, 1.35, -1.24], size: [0.038, 2.55, 0.04]})),
        ...[0.3, 0.57, 0.84, 1.11, 1.38, 1.65, 1.92, 2.19, 2.46].map((y): ModelInstance => ({at: [0, y, -1.24], size: [0.33, 0.026, 0.035]})),
      ]} c="#707c83" tint={tint} metal={0.53} />
      <mesh position={[0, 1.4, 1.33]}><boxGeometry args={[0.16, 1.9, 0.04]} /><meshBasicMaterial color="#e8edf3" /></mesh>
      <mesh position={[0, 0.45 + (frac * 1.9) / 2, 1.36]}><boxGeometry args={[0.1, Math.max(0.01, frac * 1.9), 0.03]} /><meshBasicMaterial color="#2d9bff" /></mesh>
      <mesh position={[1.22, 0.35, 0]} rotation={SIDEWAYS}><cylinderGeometry args={[0.09, 0.09, 0.16, 14]} /><Mat c="#2d6fd6" tint={tint} metal={0.3} /></mesh>
      <Coupling at={[1.3, 0.35, 0]} radius={0.078} tint={tint} />
      <Coupling at={[-1.3, 2, 0]} radius={0.078} tint={tint} />
    </group>; }
    case 'bomba': return <group>
      <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.72, 0.08, 0.42]} /><Mat c="#3d434b" tint={tint} metal={0.3} /></mesh>
      <mesh position={[0.17, 0.26, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.17, 0.17, 0.4, 24]} /><Mat c="#1e5fc4" tint={tint} metal={0.35} rough={0.4} /></mesh>
      <Instances parts={PUMP_FINS} geometry={<cylinderGeometry args={[1, 1, 1, 16]} />} c="#1e5489" tint={tint} metal={0.32} />
      <Boards parts={[-0.24, 0.24].flatMap(x => [-0.15, 0.15].map((z): ModelInstance => ({at: [x, 0.086, z], size: [0.042, 0.022, 0.042]})))} c="#9ca5a7" tint={tint} metal={0.55} />
      <mesh position={[-0.14, 0.27, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.21, 0.21, 0.2, 24]} /><Mat c="#2d8bd6" tint={tint} metal={0.35} rough={0.4} /></mesh>
      <mesh position={[-0.14, 0.27, 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.14, 14]} /><Mat c="#9aa3ad" tint={tint} metal={0.6} /></mesh>
      <mesh position={[-0.327, 0.25, 0]} rotation={SIDEWAYS}><cylinderGeometry args={[0.055, 0.068, 0.048, 14]} /><Mat c="#497ea5" tint={tint} metal={0.5} /></mesh>
      <mesh position={[0.326, 0.3, 0]} rotation={SIDEWAYS}><cylinderGeometry args={[0.065, 0.05, 0.05, 14]} /><Mat c="#497ea5" tint={tint} metal={0.5} /></mesh>
      <Coupling at={[-0.35, 0.25, 0]} radius={0.051} tint={tint} />
      <Coupling at={[0.35, 0.3, 0]} radius={0.048} tint={tint} />
      <mesh position={[0.22, 0.47, 0.1]}><boxGeometry args={[0.14, 0.1, 0.1]} /><Mat c="#2b2f35" tint={tint} /></mesh>
      <mesh position={[-0.14, 0.52, 0]}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color={live.running ? '#3dff8a' : '#7a2020'} /></mesh>
    </group>;
    case 'tuberia': {
      const length = num(params.largoM, 6), radius = num(params.diametroMm, 50) / 2000;
      return <group>
        <mesh position={[0, 0.1, 0]} rotation={SIDEWAYS}><cylinderGeometry args={[radius, radius, length, 12, 1, true]} /><Mat c={live.wet ? '#286bac' : '#48799c'} tint={tint} rough={0.49} /></mesh>
        <Coupling at={[-length / 2, 0.1, 0]} radius={radius} tint={tint} />
        <Coupling at={[length / 2, 0.1, 0]} radius={radius} tint={tint} />
      </group>;
    }
    case 'valvula': { const open = state.abierta !== false; return <group>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.4, 16]} /><Mat c="#9aa3ad" tint={tint} metal={0.5} /></mesh>
      <Coupling at={[-0.2, 0.18, 0]} radius={0.06} tint={tint} />
      <Coupling at={[0.2, 0.18, 0]} radius={0.06} tint={tint} />
      {[-0.17, 0.17].map(x => <mesh key={x} position={[x, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.03, 16]} /><Mat c="#6d7782" tint={tint} metal={0.6} /></mesh>)}
      <mesh position={[0, 0.18, 0]}><sphereGeometry args={[0.13, 20, 14]} /><Mat c="#b8860b" tint={tint} metal={0.5} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.03, 0.03, 0.12, 10]} /><Mat c="#6d7782" tint={tint} metal={0.6} /></mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, open ? 0 : Math.PI / 2, 0]}><boxGeometry args={[0.3, 0.035, 0.06]} /><Mat c={open ? '#d33' : '#a21616'} tint={tint} /></mesh>
    </group>; }
    case 'sensor-humedad': return <group>
      <Instances parts={[-0.025, 0.025].map(x => ({at: [x, 0.145, 0], size: [0.016, 0.28, 0.016]}))} geometry={<cylinderGeometry args={[1, 0.35, 1, 8]} />} c="#a5adb1" tint={tint} metal={0.56} />
      <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.025, 0.025, 0.28, 10]} /><Mat c="#6b7480" tint={tint} metal={0.5} /></mesh>
      <mesh position={[0, 0.555, 0]}><boxGeometry args={[0.15, 0.09, 0.14]} /><Mat c="#2b6350" tint={tint} /></mesh>
      <mesh position={[0, 0.553, 0.073]}><boxGeometry args={[0.086, 0.043, 0.005]} /><Mat c="#bfd1bf" tint={tint} /></mesh>
      <mesh position={[0, 0.614, 0]}><cylinderGeometry args={[0.019, 0.023, 0.038, 8]} /><Mat c="#333" tint={tint} /></mesh>
    </group>;
    case 'tablero': return <group>
      {[-0.35, 0.35].map(x => <mesh key={x} position={[x, 0.05, 0]}><boxGeometry args={[0.08, 0.1, 0.3]} /><Mat c="#4a4f57" tint={tint} /></mesh>)}
      <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.9, 1.2, 0.35]} /><Mat c="#cfd4da" tint={tint} metal={0.2} /></mesh>
      <mesh position={[0, 1.34, 0]}><boxGeometry args={[0.96, 0.06, 0.4]} /><Mat c="#aeb6bf" tint={tint} metal={0.3} /></mesh>
      <mesh position={[0, 0.72, 0.176]}><boxGeometry args={[0.8, 1.1, 0.01]} /><Mat c="#b9c0c8" tint={tint} metal={0.2} /></mesh>
      <mesh position={[0.34, 0.78, 0.19]}><boxGeometry args={[0.04, 0.16, 0.03]} /><Mat c="#555" tint={tint} /></mesh>
      <mesh position={[-0.05, 0.98, 0.186]}><boxGeometry args={[0.5, 0.26, 0.012]} /><meshBasicMaterial color={state.interruptor === true ? '#16384a' : '#0d1a22'} /></mesh>
      <mesh position={[-0.2, 0.55, 0.19]}><boxGeometry args={[0.2, 0.17, 0.012]} /><meshBasicMaterial color="#f2c230" /></mesh>
      <mesh position={[0.3, state.interruptor === true ? 0.52 : 0.46, 0.21]}><boxGeometry args={[0.05, 0.08, 0.03]} /><meshBasicMaterial color={state.interruptor === true ? '#3dff8a' : '#d33'} /></mesh>
      <Boards parts={[0.29, 0.33, 0.37].map(y => ({at: [0.25, y, 0.181], size: [0.16, 0.012, 0.013]}))} c="#59656b" tint={tint} metal={0.31} />
      <mesh position={[-0.2, 0.56, 0.19]}><circleGeometry args={[0.061, 3]} /><Mat c="#694613" tint={tint} rough={0.65} /></mesh>
      <mesh position={[-0.25, 0.4, 0.19]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color={state.modo === 'auto' ? '#ffb020' : '#5b626b'} /></mesh>
      <mesh position={[-0.12, 0.4, 0.19]}><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color={state.modo === 'auto' && state.interruptor === true && bitOn(state, 'Y0') ? '#3dff8a' : '#5b626b'} /></mesh>
    </group>;
    case 'panel-solar': return <group>
      {[-0.6, 0.6].map(x => <mesh key={x} position={[x, 0.3, 0]}><cylinderGeometry args={[0.03, 0.03, 0.6, 8]} /><Mat c="#8a929b" tint={tint} metal={0.5} /></mesh>)}
      <mesh position={[0, 0.2, -0.05]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 1.3, 8]} /><Mat c="#8a929b" tint={tint} metal={0.5} /></mesh>
      <group position={[0, 0.62, 0]} rotation={[-0.6, 0, 0]}>
        <mesh><boxGeometry args={[1.74, 0.05, 1.04]} /><Mat c="#cfd5db" tint={tint} metal={0.6} rough={0.4} /></mesh>
        <mesh position={[0, 0.03, 0]}><boxGeometry args={[1.66, 0.01, 0.96]} /><Mat c="#1b3f78" tint={tint} metal={0.25} rough={0.25} /></mesh>
        <Boards parts={SOLAR_CELLS} c="#2b4e82" tint={tint} metal={0.25} rough={0.31} />
        <Boards parts={[-0.49, 0.49].map(z => ({at: [0, 0.042, z], size: [1.68, 0.015, 0.035]}))} c="#aeb9c0" tint={tint} metal={0.46} />
      </group>
    </group>;
    case 'te': return <group>
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 0.6, 16]} /><Mat c="#2d6fd6" tint={tint} rough={0.45} /></mesh>
      <mesh position={[0, 0.15, 0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.2, 16]} /><Mat c="#2d6fd6" tint={tint} rough={0.45} /></mesh>
      <Coupling at={[-0.3, 0.15, 0]} radius={0.062} tint={tint} />
      <Coupling at={[0.3, 0.15, 0]} radius={0.062} tint={tint} />
      <Coupling at={[0, 0.15, 0.2]} radius={0.062} tint={tint} axis="z" />
    </group>;
    case 'emisor': return <group>
      <mesh position={[-0.1, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.2, 14]} /><Mat c="#2d6fd6" tint={tint} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.04, 0.04, 0.5, 12]} /><Mat c="#4a4f57" tint={tint} metal={0.4} /></mesh>
      <mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.07, 0.087, 0.09, 10]} /><Mat c="#475257" tint={tint} metal={0.3} /></mesh>
      <mesh position={[0, 0.555, 0]}><cylinderGeometry args={[0.075, 0.048, 0.069, 14]} /><Mat c="#889694" tint={tint} metal={0.45} /></mesh>
      <mesh position={[0.051, 0.578, 0]} rotation={SIDEWAYS}><cylinderGeometry args={[0.026, 0.036, 0.105, 12]} /><Mat c="#b68b51" tint={tint} metal={0.52} /></mesh>
      {live.flowing && !tint && [0, 1, 2, 3, 4, 5].map(i => <mesh key={i} position={[Math.cos(i * 1.05) * 0.55, 0.9 - (i % 3) * 0.12, Math.sin(i * 1.05) * 0.55]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#8fd3ff" transparent opacity={0.65} /></mesh>)}
    </group>;
    case 'acometida': return <group>
      <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.09, 0.13, 1.6, 12]} /><Mat c="#8a6a45" tint={tint} rough={0.95} /></mesh>
      <mesh position={[0, 1.38, 0]}><boxGeometry args={[0.7, 0.06, 0.07]} /><Mat c="#5a4630" tint={tint} /></mesh>
      <Instances parts={[-0.27, 0, 0.27].flatMap(x => [1.42, 1.45, 1.48].map(y => ({at: [x, y, 0] as [number, number, number], size: [0.036, 0.024, 0.036] as [number, number, number]})))} geometry={<cylinderGeometry args={[1, 0.73, 1, 10]} />} c="#d9d9c9" tint={tint} rough={0.38} />
      <mesh position={[0.13, 0.58, 0.095]}><cylinderGeometry args={[0.021, 0.021, 0.7, 8]} /><Mat c="#737b79" tint={tint} metal={0.42} /></mesh>
      <mesh position={[0, 0.95, 0.13]}><boxGeometry args={[0.28, 0.36, 0.14]} /><Mat c="#c9ced6" tint={tint} metal={0.3} /></mesh>
      <mesh position={[0, 0.98, 0.205]}><cylinderGeometry args={[0.07, 0.07, 0.02, 14]} /><meshBasicMaterial color="#2a3a4a" /></mesh>
    </group>;
    case 'granero': return <BarnMesh tint={tint} />;
    case 'invernadero': return <GreenhouseMesh width={num(params.anchoM, 8)} length={num(params.largoM, 20)} tint={tint} />;
    case 'molino': return <WindmillMesh tint={tint} />;
    case 'cerca': return <FenceMesh length={num(params.largoM, 10)} tint={tint} />;
    default: return null;
  }
}

/** Marcadores de los puertos: posición, color por tipo y una marca hacia donde apunta su normal. */
export type PortMark = 'from' | 'ok' | 'bad' | 'hover' | 'busy';
const MARK_COLORS: Record<PortMark, string> = {from: '#ffffff', ok: '#3dff8a', bad: '#8a8f99', hover: '#ffe14d', busy: '#8a8f99'};
export function PortMarkers({ports, scale = 1, marks}: {ports: readonly Port[]; scale?: number; marks?: Record<string, PortMark>}) {
  return <group>{ports.map(p => { const mk = marks?.[p.id]; const k = mk ? (mk === 'from' || mk === 'hover' ? 1.9 : mk === 'ok' ? 1.5 : 0.8) : 1; return <group key={p.id} position={p.local}>
    <mesh renderOrder={20} raycast={() => null}><sphereGeometry args={[0.07 * scale * k, 12, 10]} /><meshBasicMaterial color={mk ? MARK_COLORS[mk] : PORT_COLORS[p.kind]} depthTest={false} transparent opacity={mk === 'bad' || mk === 'busy' ? 0.45 : 0.95} /></mesh>
    <mesh renderOrder={20} position={[p.normal[0] * 0.12 * scale, p.normal[1] * 0.12 * scale, p.normal[2] * 0.12 * scale]} raycast={() => null}><sphereGeometry args={[0.03 * scale, 8, 6]} /><meshBasicMaterial color={PORT_COLORS[p.kind]} depthTest={false} /></mesh>
  </group>; })}</group>;
}

/** Caja de selección o de resalte, con las medidas reales de la pieza. */
export function Outline({entity, color}: {entity: Pick<Entity, 'type' | 'params'>; color: string}) {
  const def = itemById(entity.type)!, [w, h, d] = sizeOf(def, entity.params);
  const geometry = useMemo(() => new BoxGeometry(w + 0.06, h + 0.06, d + 0.06), [w, h, d]);
  return <lineSegments position={[0, h / 2, 0]} renderOrder={15} raycast={() => null}><edgesGeometry args={[geometry]} /><lineBasicMaterial color={color} depthTest={false} transparent opacity={0.95} /></lineSegments>;
}
