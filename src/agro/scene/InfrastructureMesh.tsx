import {useMemo} from 'react';
import {DoubleSide, Shape} from 'three';
import {Boards, Instances, Mat, type ModelInstance} from './ModelParts.tsx';

type Vec = [number, number, number];
type Section = [number, number];
const BARN_PROFILE: Section[] = [[-4.4, 0.2], [-4.4, 3.85], [-3.15, 5.68], [0, 6.55], [3.15, 5.68], [4.4, 3.85], [4.4, 0.2]];
const red = '#a04432', trim = '#eee2c6', roof = '#414947';

function sectionShape(points: readonly Section[]) {
  const shape = new Shape();
  shape.moveTo(...points[0]);
  for (const point of points.slice(1)) shape.lineTo(...point);
  shape.closePath();
  return shape;
}

function wallBeam(from: Section, to: Section, z: number, thickness: number, color = trim): ModelInstance {
  return {
    at: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, z],
    size: [Math.hypot(to[0] - from[0], to[1] - from[1]), thickness, 0.08],
    rotation: [0, 0, Math.atan2(to[1] - from[1], to[0] - from[0])],
    color,
  };
}

const BARN_WOOD: ModelInstance[] = [
  {at: [0, 0.12, 0], size: [9, 0.24, 6], color: '#85847a'},
  ...[-1, 1].flatMap(side => [
    ...Array.from({length: 27}, (_, i): ModelInstance => {
      const x = (i - 13) * 0.323, distance = Math.abs(x);
      const top = distance <= 3.15 ? 6.48 - distance * 0.276 : 5.61 - (distance - 3.15) * 1.46;
      return {at: [x, (top + 0.27) / 2, side * 2.9], size: [0.035, top - 0.27, 0.045], color: i % 3 ? '#713321' : '#c05943'};
    }),
    ...Array.from({length: 17}, (_, i): ModelInstance => ({
      at: [side * 4.42, 2.05, (i - 8) * 0.33], size: [0.04, 3.53, 0.035], color: i % 3 ? '#743625' : '#bd533d',
    })),
    ...[-4.34, 4.34].map((x): ModelInstance => ({at: [x, 2.05, side * 2.91], size: [0.16, 3.66, 0.12], color: trim})),
    ...BARN_PROFILE.slice(1, 5).map((a, i) => wallBeam(a, BARN_PROFILE[i + 2], side * 2.96, 0.13)),
  ]),
  ...[-0.91, 0.91].flatMap(x => {
    const l = x - 0.77, r = x + 0.77;
    return [
      {at: [x, 1.56, 2.94], size: [1.73, 2.64, 0.08], color: '#733223'} satisfies ModelInstance,
      ...[[[l, 0.33], [r, 2.78]], [[r, 0.33], [l, 2.78]], [[l, 0.33], [l, 2.78]], [[r, 0.33], [r, 2.78]]]
        .map(([a, b]) => wallBeam(a as Section, b as Section, 2.985, 0.11)),
      ...[0.33, 2.78].map((y): ModelInstance => ({at: [x, y, 2.99], size: [1.63, 0.13, 0.08], color: trim})),
    ];
  }),
  {at: [0, 4.38, 2.94], size: [1.36, 1.32, 0.07], color: trim},
  {at: [0, 4.38, 2.985], size: [1.08, 1.03, 0.02], color: '#382d24'},
  ...[4.08, 4.28, 4.48, 4.68].map((y): ModelInstance => ({at: [0, y, 2.997], size: [1.04, 0.065, 0.02], color: '#7b5a43'})),
  ...[-2.84, 2.84].flatMap(x => [
    {at: [x, 2.4, 2.94], size: [1.08, 1.08, 0.07], color: trim} satisfies ModelInstance,
    {at: [x, 2.4, 2.98], size: [0.83, 0.83, 0.024], color: '#45595a'} satisfies ModelInstance,
    {at: [x, 2.4, 2.997], size: [0.065, 0.83, 0.02], color: trim} satisfies ModelInstance,
    {at: [x, 2.4, 2.997], size: [0.83, 0.065, 0.02], color: trim} satisfies ModelInstance,
  ]),
  ...BARN_PROFILE.slice(1, 5).flatMap((a, i) => {
    const b = BARN_PROFILE[i + 2];
    const pitch = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [{at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.04, 0],
      size: [Math.hypot(b[0] - a[0], b[1] - a[1]) + 0.06, 0.105, 6], rotation: [0, 0, pitch], color: roof} satisfies ModelInstance,
      ...Array.from({length: 13}, (_, j): ModelInstance => ({
        at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 0.105, (j - 6) * 0.47],
        size: [Math.hypot(b[0] - a[0], b[1] - a[1]), 0.035, 0.035], rotation: [0, 0, pitch], color: '#59615e',
      })),
    ];
  }),
];

const BARN_SHAPE = sectionShape(BARN_PROFILE);
const BARN_EXTRUDE = {depth: 5.76, bevelEnabled: false};

export function BarnMesh({tint}: {tint: string | null}) {
  return <group>
    <mesh position={[0, 0, -2.88]}><extrudeGeometry args={[BARN_SHAPE, BARN_EXTRUDE]} /><Mat c={red} tint={tint} rough={0.88} /></mesh>
    <Boards parts={BARN_WOOD} c={red} tint={tint} rough={0.84} />
  </group>;
}

export function GreenhouseMesh({width, length, tint}: {width: number; length: number; tint: string | null}) {
  const {cover, end, ribs, frame} = useMemo(() => {
    const arch: Section[] = Array.from({length: 21}, (_, i) => {
      const angle = Math.PI * i / 20;
      return [(width / 2) * Math.cos(angle), 1.8 + 2.12 * Math.sin(angle)];
    });
    const frame: ModelInstance[] = [];
    const ribs: ModelInstance[] = [];
    const divisions = Math.max(2, Math.ceil(length / 3));
    for (let i = 0; i <= divisions; i++) {
      const z = -length / 2 + length * i / divisions;
      ribs.push({at: [0, 1.8, z], size: [width / 2, 2.12, 1]});
      for (const side of [-1, 1]) frame.push({at: [side * width / 2, 0.9, z], size: [0.08, 1.8, 0.07]});
    }
    for (const point of arch.filter((_, i) => i % 5 === 0)) {
      frame.push({at: [point[0], point[1], 0], size: [0.065, 0.065, length]});
    }
    for (const side of [-1, 1]) {
      frame.push({at: [side * width / 2, 0.09, 0], size: [0.12, 0.15, length]});
      frame.push({at: [side * width * 0.22, 0.06, 0], size: [width * 0.29, 0.12, length - 0.5], color: '#675340'});
      for (const x of [-0.65, 0.65]) frame.push({at: [x, 1.12, side * length / 2], size: [0.075, 2.23, 0.085]});
      for (const y of [0.12, 1.14, 2.25]) frame.push({at: [0, y, side * length / 2], size: [1.35, 0.075, 0.085]});
    }
    frame.push({at: [0, 0.035, 0], size: [width * 0.21, 0.07, length - 0.1], color: '#a49b85'});
    const shell = sectionShape([...arch, [-(width / 2), 0.08], [width / 2, 0.08]]);
    const roofOnly = sectionShape([...arch, ...arch.slice().reverse().map(([x, y]): Section => [x * 0.988, y - 0.025])]);
    return {cover: roofOnly, end: shell, ribs, frame};
  }, [width, length]);
  return <group>
    <mesh position={[0, 0, -length / 2]}>
      <extrudeGeometry args={[cover, {depth: length, bevelEnabled: false}]} />
      <meshStandardMaterial color={tint ?? '#c6e7e4'} transparent opacity={tint ? 0.47 : 0.23} roughness={0.24} side={DoubleSide} depthWrite={false} />
    </mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[0, 0, side * length / 2]}><shapeGeometry args={[end]} /><meshStandardMaterial color={tint ?? '#d1eae8'} transparent opacity={tint ? 0.42 : 0.24} roughness={0.27} side={DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[side * width / 2, 0.91, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[length, 1.8]} /><meshStandardMaterial color={tint ?? '#d0e9e6'} transparent opacity={tint ? 0.42 : 0.2} roughness={0.29} side={DoubleSide} depthWrite={false} /></mesh>
    </group>)}
    <Instances parts={ribs} geometry={<torusGeometry args={[1, 0.018, 5, 20, Math.PI]} />} c="#83999b" tint={tint} metal={0.48} />
    <Boards parts={frame} c="#869b9b" tint={tint} metal={0.25} rough={0.59} />
  </group>;
}

function beamBetween(a: Vec, b: Vec, width: number, color: string): ModelInstance {
  const [dx, dy, dz] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const horizontal = Math.hypot(dx, dz);
  return {
    at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
    size: [width, Math.hypot(dx, dy, dz), width],
    rotation: [Math.atan2(horizontal, dy), Math.atan2(dx, dz), 0],
    color,
  };
}

const MILL_TOWER: ModelInstance[] = [];
const steel = '#9b9f96';
const corners = [[1.25, 1.25], [-1.25, 1.25], [-1.25, -1.25], [1.25, -1.25]];
const towerPoint = (index: number, y: number): Vec => {
  const [x, z] = corners[index % 4], ratio = 1 - 0.77 * (y / 9.1);
  return [x * ratio, y, z * ratio];
};
for (let i = 0; i < 4; i++) {
  MILL_TOWER.push(beamBetween(towerPoint(i, 0.13), towerPoint(i, 9.1), 0.13, steel));
  MILL_TOWER.push({at: [corners[i][0], 0.12, corners[i][1]], size: [0.45, 0.24, 0.45], color: '#a39d8e'});
  for (let y = 0.35; y < 8; y += 2.05) {
    MILL_TOWER.push(beamBetween(towerPoint(i, y), towerPoint(i + 1, y), 0.065, steel));
    MILL_TOWER.push(beamBetween(towerPoint(i, y), towerPoint(i + 1, y + 2.05), 0.055, '#737b78'));
  }
}
const BLADES: ModelInstance[] = Array.from({length: 12}, (_, i) => {
  const a = i * Math.PI / 6;
  return {at: [-Math.sin(a) * 1.12, Math.cos(a) * 1.12, 0.04], size: [0.38, 0.66, 0.055], rotation: [0, 0, a + 0.22], color: i % 3 ? '#c2c3b4' : '#a9b0a7'};
});

export function WindmillMesh({tint}: {tint: string | null}) {
  return <group>
    <Boards parts={MILL_TOWER} c={steel} tint={tint} metal={0.43} />
    <mesh position={[0, 9.26, 0]}><boxGeometry args={[0.56, 0.36, 0.92]} /><Mat c="#65736d" tint={tint} metal={0.5} /></mesh>
    <mesh position={[0, 9.25, -0.61]}><boxGeometry args={[0.08, 0.08, 1.12]} /><Mat c={steel} tint={tint} metal={0.5} /></mesh>
    <mesh position={[0, 9.51, -1.05]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.46, 0.46, 0.05, 3]} /><Mat c="#ac5037" tint={tint} metal={0.45} /></mesh>
    <group position={[0, 9.33, 0.58]}>
      <mesh><torusGeometry args={[1.36, 0.032, 6, 30]} /><Mat c="#85928b" tint={tint} metal={0.5} /></mesh>
      <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.25, 0.25, 0.2, 14]} /><Mat c="#854935" tint={tint} metal={0.4} /></mesh>
      <Boards parts={BLADES} c={steel} tint={tint} metal={0.4} />
    </group>
  </group>;
}

export function FenceMesh({length, tint}: {length: number; tint: string | null}) {
  const parts = useMemo(() => {
    const spans = Math.max(1, Math.ceil(length / 2.45)), gap = (length - 0.16) / spans;
    const boards: ModelInstance[] = [];
    for (let i = 0; i <= spans; i++) {
      const x = -(length - 0.16) / 2 + gap * i;
      boards.push({at: [x, 0.5, 0], size: [0.16, 1, 0.18], color: i % 2 ? '#856449' : '#9e7c57'});
      boards.push({at: [x, 1.015, 0], size: [0.18, 0.035, 0.2], color: '#b09270'});
      if (i === spans) continue;
      for (const y of [0.36, 0.73]) boards.push({
        at: [x + gap / 2, y + (i % 2) * 0.015, 0.015],
        size: [gap + 0.04, 0.105, 0.075],
        rotation: [0, 0, (i % 3 - 1) * 0.014],
        color: (i + (y > 0.5 ? 1 : 0)) % 2 ? '#a1815e' : '#937451',
      });
    }
    return boards;
  }, [length]);
  return <Boards parts={parts} c="#9e7c57" tint={tint} rough={0.91} />;
}
