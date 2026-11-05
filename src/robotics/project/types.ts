// Contrato del proyecto de Robótica (docs/robotica/02_ARQUITECTURA_Y_CONTRATOS.md §4).
// Unidades: metros, radianes, voltios, amperios, segundos. Ejes: Y arriba (three.js).
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Transform = {position: Vec3; rotation: Quat; scale?: Vec3};

export type PartInstance = {
  instanceId: string;
  definitionId: string;
  label: string;
  transform: Transform;
  locked?: boolean;
  groupId?: string;
  props?: Record<string, number | string | boolean>;
};

export type Attachment = {
  id: string;
  kind: 'rigid' | 'wheel-hinge';
  parent: {instanceId: string; anchorId: string};
  child: {instanceId: string; anchorId: string};
  axis?: Vec3;
};

export type PinRef = {instanceId: string; pinId: string};
export type Connection = {id: string; a: PinRef; b: PinRef; color: string; route?: Vec3[]};

export type Firmware = {
  id: string;
  targetInstanceId: string;
  board: 'arduino-uno-r3';
  source: string;
  artifact?: {hex: string; origin: 'remote-compiler' | 'hex-import'; sourceHash: string; compiledAt: string};
  updatedAt: string;
};

/** `movable`: un objeto que se puede empujar y recoger con una pinza (cuerpo dinámico con masa `massKg`); si no, es fijo. */
export type ObstacleKind = 'tree' | 'rock' | 'log' | 'branch' | 'post';
export type Obstacle = {id: string; kind?: ObstacleKind; shape: 'box' | 'cylinder'; transform: Transform; size: Vec3; movable?: boolean; massKg?: number};
export type LineTrack = {name: string; points: Vec3[]; width: number; closed: boolean};
export type Scene = {theme?: 'forest' | 'factory'; sizeM?: 4 | 8 | 12 | 16; lineTrack?: LineTrack; obstacles: Obstacle[]; robotStart: Transform; physics: {gravity: number; friction: number}};
export type Workspace = {camera?: {position: Vec3; target: Vec3}; mode?: 'build' | 'simulate'; assemblyTemplate?: string; /** Guía de cableado paso a paso elegida (id de `guide/guides.ts`). */ wiringGuide?: string; /** Guía de programación paso a paso elegida (id de `guide/programGuides.ts`). */ programGuide?: string; welcomeDismissed?: boolean};

export const ROBOTICS_FORMAT = 'modo-robotica' as const;
export const ROBOTICS_VERSION = 1 as const;

export type RobotProject = {
  armProgram?: {armId: string; points: {name: string; angles: number[]; gripperOpen: boolean; kind: 'MovJ' | 'MovL'; expectedHeld?: string}[]};
  format: typeof ROBOTICS_FORMAT;
  version: typeof ROBOTICS_VERSION;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parts: PartInstance[];
  attachments: Attachment[];
  connections: Connection[];
  firmware: Firmware[];
  scene: Scene;
  workspace: Workspace;
};

export type RobotLibrary = {projects: RobotProject[]; active: string};

export const LIMITS = {
  projects: 30,
  parts: 200,
  attachments: 400,
  connections: 1000,
  firmware: 8,
  obstacles: 100,
  sketchBytes: 64 * 1024,
  hexBytes: 256 * 1024,
  name: 100,
  label: 60,
  importBytes: 2 * 1024 * 1024,
  history: 50,
} as const;
