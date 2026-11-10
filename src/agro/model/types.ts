// Contratos de modo. Agro (Fase 0). Puro: sin React ni three, para probarlo en Node.
//
// Principios (docs/agro/FASE_0_CONTRATOS.md):
//   · Una entidad física = un `Entity` con id estable. Sus facetas (hidráulica, eléctrica, economía…) se cuelgan de ese id; nunca se duplica el equipo.
//   · El modelo visual (malla) es una presentación de la entidad; la fuente de verdad es este documento.
//   · Unidades: longitud en metros, tiempo en segundos simulados, ángulos en radianes, presión en bar, caudal en L/min, potencia en kW, tensión en V.
//   · Un solo documento versionado por mundo: formato `modo-agro`. Mismo patrón que `modo-industria` (src/industria/model/types.ts).

import type {Rung as IndRung} from '../../industria/model/types.ts';

export type Vec3 = [number, number, number];
export type Result<T> = {ok: true; value: T} | {ok: false; error: string};

export const FORMAT = 'modo-agro' as const;
/** Versión 2 (consolidación 3D, Etapa 1): el terreno declara su `generatorVersion` y su territorio (`presetId`), y el escenario su `territory`. Los mundos v1 se migran al abrirse (ver `MIGRATIONS` en validate.ts). */
export const CURRENT_VERSION = 2;

export const UNITS = {length: 'm', time: 's', angle: 'rad', pressure: 'bar', flow: 'L/min', power: 'kW', voltage: 'V', area: 'ha'} as const;

export type Pose = {position: Vec3; rotation: Vec3};
export type PropValue = string | number | boolean;

/** Procedencia de un dato: nunca se presenta como medido lo que es estimado o inventado. */
export type Provenance = 'measured' | 'estimated' | 'user' | 'fictional';
export const PROVENANCES: readonly Provenance[] = ['measured', 'estimated', 'user', 'fictional'];

/** Tres reglas sobre el mismo motor: cambian permisos, costes y ayudas, no la geometría ni la física. */
export type ExperienceMode = 'learning' | 'free' | 'real';
export const EXPERIENCE_MODES: readonly ExperienceMode[] = ['learning', 'free', 'real'];

// ── Puertos ────────────────────────────────────────────────────────────────
export type PortKind = 'hydraulic' | 'power' | 'signal' | 'mechanical';
export const PORT_KINDS: readonly PortKind[] = ['hydraulic', 'power', 'signal', 'mechanical'];

/** `bidirectional`: acepta flujo en ambos sentidos (tubería, tierra, barra). */
export type PortDirection = 'in' | 'out' | 'bidirectional';
export const PORT_DIRECTIONS: readonly PortDirection[] = ['in', 'out', 'bidirectional'];

export type HydraulicSpec = {diameterMm: number; /** p. ej. «rosca», «unión», «campana». Solo informativo en la Fase 0. */ connector?: string};
export type PowerSpec = {current: 'ac' | 'dc'; phases: 1 | 3; voltage: number; frequencyHz?: number};
export type SignalSpec = {signal: 'digital' | 'analog' | 'data'; /** p. ej. «24V», «4-20mA», «modbus». */ level?: string};
export type MechanicalSpec = {mount: string};

type PortBase = {
  /** Único dentro de su entidad. */
  id: string;
  label?: string;
  direction: PortDirection;
  /** Posición en el marco local de la entidad (m). Estable: no se coloca al renderizar. */
  local: Vec3;
  /** Normal de salida del puerto en el marco local (unitaria). */
  normal: Vec3;
};
export type Port =
  | (PortBase & {kind: 'hydraulic'; spec: HydraulicSpec})
  | (PortBase & {kind: 'power'; spec: PowerSpec})
  | (PortBase & {kind: 'signal'; spec: SignalSpec})
  | (PortBase & {kind: 'mechanical'; spec: MechanicalSpec});

export type PortRef = {entityId: string; portId: string};

// ── Entidades ──────────────────────────────────────────────────────────────
/** Ciclo de vida de una pieza (docs: flujo B). No todos los estados aplican a todo tipo; se acota por tipo en fases posteriores. */
export type Lifecycle =
  | 'catalog' | 'quoted' | 'ordered' | 'in_transit' | 'received' | 'stock' | 'reserved' | 'in_assembly'
  | 'installed' | 'connected' | 'commissioned' | 'operating' | 'stopped' | 'faulted' | 'maintenance' | 'retired' | 'salvaged';
export const LIFECYCLES: readonly Lifecycle[] = [
  'catalog', 'quoted', 'ordered', 'in_transit', 'received', 'stock', 'reserved', 'in_assembly',
  'installed', 'connected', 'commissioned', 'operating', 'stopped', 'faulted', 'maintenance', 'retired', 'salvaged',
];

export type Entity = {
  id: string;
  /** Id de definición del catálogo (se define en fases posteriores; hoy es una cadena libre, p. ej. «bomba-centrifuga»). */
  type: string;
  label: string;
  pose: Pose;
  /** Parámetros de catálogo y de ajuste (diámetro, potencia nominal…). */
  params: Record<string, PropValue>;
  ports: Port[];
  /** Estado técnico mutable (encendida, abierta…). Lo escribe la simulación; el render solo lo lee. */
  state: Record<string, PropValue>;
  lifecycle: Lifecycle;
  /** Propietario patrimonial («player», id de cliente…). Separa las cuentas de una asesoría. */
  owner: string;
  provenance?: Provenance;
  locked?: boolean;
};

// ── Conexiones ─────────────────────────────────────────────────────────────
export type ConnectionStatus = 'draft' | 'compatible' | 'incompatible' | 'reserved' | 'connected' | 'energized_pressurized' | 'isolated' | 'damaged' | 'disconnected';
export const CONNECTION_STATUSES: readonly ConnectionStatus[] = ['draft', 'compatible', 'incompatible', 'reserved', 'connected', 'energized_pressurized', 'isolated', 'damaged', 'disconnected'];
/** Estados que afirman que la unión existe físicamente: exigen puertos compatibles. */
export const PHYSICAL_STATUSES: readonly ConnectionStatus[] = ['connected', 'energized_pressurized', 'isolated', 'damaged'];

export type Connection = {
  id: string;
  kind: PortKind;
  a: PortRef;
  b: PortRef;
  status: ConnectionStatus;
  /** Motivo legible cuando la unión es inválida o está dañada. */
  reason?: string;
  /** Puntos intermedios de la ruta (solo presentación: no cambia la topología). */
  route?: Vec3[];
};

// ── Mundo ──────────────────────────────────────────────────────────────────
/** Superficies distintas: lo visible no es lo propio ni lo autorizado ni lo cultivado. */
export type LandTenure = {visibleHa: number; administeredHa: number; authorizedHa: number; cultivatedHa: number};

/** Territorios generables. Todos usan el mismo motor de terreno; cambian parámetros, no código (V2 §2). Hoy existen dos; el resto llega en la Etapa 3. */
export type TerritoryId = 'free' | 'valley';
export const TERRITORY_IDS: readonly TerritoryId[] = ['free', 'valley'];

export type Scenario = {
  /** Centro inicial de la finca en metros (x, z), cuando se elige en el asistente. */
  site?: [number, number];
  origin: 'template' | 'location' | 'blank';
  /** Nombre legible, p. ej. «Oasis árido inspirado en Pica». */
  label: string;
  provenance: Provenance;
  land: LandTenure;
  /** Territorio con el que se generó el mundo (igual a `terrain.presetId`). */
  territory: TerritoryId;
};

export type TerrainEditKind = 'raise' | 'lower' | 'level';
export const TERRAIN_EDIT_KINDS: readonly TerrainEditKind[] = ['raise', 'lower', 'level'];
/** Edición de relieve como delta sobre la base procedural (la base se regenera desde `seed`). */
export type TerrainEdit = {id: string; kind: TerrainEditKind; center: [number, number]; radius: number; amount: number; /** segundo simulado en que ocurrió */ at: number};

export type Terrain = {
  /** Lado del mapa en metros [este-oeste, norte-sur]. 1000×1000 = 100 ha. */
  sizeMeters: [number, number];
  /** Tamaño de celda de la malla base (m). */
  cellMeters: number;
  seed: number;
  /** Versión del generador de relieve base (terrain/generators.ts). `seed` + `generatorVersion` + tamaño reproducen la base; `edits` son deltas encima. */
  generatorVersion: number;
  /** Territorio elegido al crear el mundo. */
  presetId: TerritoryId;
  edits: TerrainEdit[];
};

/** Segundos simulados por segundo real. 0 = pausa. 3600 = «1 hora por segundo»; 86400 = «1 día por segundo» (Fase 4: un cultivo dura meses). */
export const SIM_SPEEDS = [0, 1, 5, 20, 100, 3600, 86400] as const;
export type SimSpeed = (typeof SIM_SPEEDS)[number];

/** Un solo reloj de simulación. El tiempo de render no lo sustituye. */
export type Clock = {
  simSeconds: number;
  speed: SimSpeed;
  /** Semilla del generador pseudoaleatorio de la simulación. Reproducibilidad: mismo navegador y misma versión. */
  seed: number;
  /** Fecha y hora simuladas en el instante 0 (ISO 8601). */
  startDate: string;
};

/** Pantalla HMI del tablero (Fase 5): piloto, interruptor de una marca interna o texto. */
export type AgroWidget = {id: string; kind: 'lamp' | 'switch' | 'label'; label: string; tag?: string};
/** Programa de PLC de un tablero (Fase 5): escalera de Industria (`PlcProgram.rungs`) sobre direcciones fijas estilo Delta, más su pantalla HMI. */
export type AgroProgram = {rungs: IndRung[]; hmi: AgroWidget[]};

/** Pedido de compra (Fase 6). Los instantes son segundos simulados. */
export type Order = {id: string; type: string; qty: number; cost: number; orderedAt: number; deliverAt: number; delivered: boolean};
export type LedgerEntry = {at: number; text: string; amount: number};
/** Dinero, pedidos y lo recibido en la experiencia «real». Lo disponible para colocar es `delivered − piezas colocadas`: no se guarda aparte. */
export type Economy = {money: number; delivered: Record<string, number>; orders: Order[]; ledger: LedgerEntry[]};

export type WorldProject = {
  format: typeof FORMAT;
  version: number;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  experience: ExperienceMode;
  scenario: Scenario;
  terrain: Terrain;
  clock: Clock;
  entities: Entity[];
  connections: Connection[];
  /** Programas de PLC por id de tablero (Fase 5). Se omite si no hay ninguno: un archivo sin PLC es idéntico al de la Fase 4. */
  plc?: Record<string, AgroProgram>;
  /** Economía de la experiencia «real» (Fase 6); se omite en mundos libres. */
  economy?: Economy;
};

export const LIMITS = {
  rungs: 12,
  widgets: 12,
  entities: 20_000,
  connections: 40_000,
  portsPerEntity: 32,
  params: 60,
  terrainEdits: 5_000,
  route: 20,
  name: 80,
  label: 80,
  id: 80,
  text: 200,
  maxSideMeters: 5_000,
  minCellMeters: 0.25,
  importBytes: 64 * 1024 * 1024,
} as const;
