// Modelo compartido de modo. Industria.
// Una entidad = un componente con ID estable. Tres relaciones distintas y nunca mezcladas:
//   · Mount      → montaje físico (riel DIN, superficie, soporte…). No crea alimentación, señales ni programa.
//   · Connection → conexión eléctrica o de proceso entre terminales (netlist). No implica montaje.
//   · Binding    → asociación lógica (terminal ↔ variable de PLC, variable ↔ widget HMI, símbolo ↔ entidad).
// La pose 3D y la posición de los símbolos en los diagramas son propiedades independientes.
// El estado de interfaz (cámara, paneles, selección) NO vive aquí: ver ui.ts.

export type Vec3 = [number, number, number];

export const FORMAT = 'modo-industria' as const;
export const CURRENT_VERSION = 4;

export type Pose = {position: Vec3; rotation: Vec3};

export type PropValue = string | number | boolean;

export type Entity = {
  id: string;
  /** Id de definición del catálogo (fase 4). Hasta entonces es una cadena libre. */
  definitionId: string;
  label: string;
  props: Record<string, PropValue>;
  locked?: boolean;
};

export type MountKind = 'din-rail' | 'surface' | 'structural' | 'mechanical' | 'pipe' | 'modular' | 'panel';
export const MOUNT_KINDS: readonly MountKind[] = ['din-rail', 'surface', 'structural', 'mechanical', 'pipe', 'modular', 'panel'];

export type AnchorRef = {entityId: string; anchorId: string};
export type TerminalRef = {entityId: string; terminalId: string};

export type Mount = {id: string; kind: MountKind; parent: AnchorRef; child: AnchorRef};

export type ConnectionKind = 'power' | 'control' | 'signal' | 'earth' | 'pipe';
export const CONNECTION_KINDS: readonly ConnectionKind[] = ['power', 'control', 'signal', 'earth', 'pipe'];

/** `unverified` = no hay datos para decidir; nunca se presenta como válido. */
export type ConnectionStatus = 'valid' | 'invalid' | 'unverified';
export const CONNECTION_STATUSES: readonly ConnectionStatus[] = ['valid', 'invalid', 'unverified'];

export type Connection = {
  id: string;
  kind: ConnectionKind;
  a: TerminalRef;
  b: TerminalRef;
  label?: string;
  /** Puntos intermedios de la ruta (solo presentación: no cambia la topología). */
  route?: Vec3[];
  status: ConnectionStatus;
};

export type BindingKind = 'plc-tag' | 'hmi-widget' | 'diagram-symbol';
export const BINDING_KINDS: readonly BindingKind[] = ['plc-tag', 'hmi-widget', 'diagram-symbol'];

export type Binding = {id: string; kind: BindingKind; entityId: string; terminalId?: string; target: string};

/** Un componente puede tener varios símbolos (p. ej. bobina y contactos de un contactor en páginas distintas). */
export type SymbolPlacement = {page: number; x: number; y: number; part?: string};

/** Programa de PLC en escalera. Los nombres de variable se asocian a terminales con asociaciones `plc-tag` (entityId = PLC, terminalId, target = nombre). */
export type Contact = {tag: string; /** Normalmente cerrado: conduce cuando la variable es falsa. */ nc?: boolean};
/** `ton`: temporizador a la conexión (la variable es el bit «listo»); `ctu`: contador ascendente por flanco (la variable es «llegó al valor»); `ctr`: pone a cero el contador de esa variable. */
export type CoilMode = 'out' | 'set' | 'reset' | 'ton' | 'ctu' | 'ctr';
/** Una línea: el resultado es la O de las ramas; cada rama es la Y de sus contactos. */
export type Rung = {id: string; comment?: string; branches: Contact[][]; coil: {tag: string; mode: CoilMode; /** ms para `ton`; cuentas para `ctu` */ preset?: number}};
export type PlcProgram = {rungs: Rung[]; /** Variables internas (marcas), además de las entradas y salidas asociadas a terminales. */ memory: string[]};
export const COIL_MODES: readonly CoilMode[] = ['out', 'set', 'reset', 'ton', 'ctu', 'ctr'];
export const MAX_PRESET = {ton: 3_600_000, ctu: 100_000} as const;

/** Pantalla de HMI: widgets que leen o escriben variables de un PLC. Un botón o interruptor escribe una variable interna del PLC. */
export type HmiWidgetKind = 'lamp' | 'button' | 'switch' | 'label';
export const HMI_WIDGET_KINDS: readonly HmiWidgetKind[] = ['lamp', 'button', 'switch', 'label'];
export type HmiWidget = {id: string; kind: HmiWidgetKind; label: string; plcId?: string; tag?: string; slot?: number};
export type HmiScreen = {widgets: HmiWidget[]};

export const TAG_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,29}$/;

/** Fallas inyectadas para practicar el diagnóstico. Una falla no cambia el diseño: la simulación la aplica y el diagnóstico la localiza. */
export type FaultKind = 'wire-open' | 'contact-open' | 'coil-open' | 'lamp-open' | 'winding-open';
export const FAULT_KINDS: readonly FaultKind[] = ['wire-open', 'contact-open', 'coil-open', 'lamp-open', 'winding-open'];
/** `hidden`: el alumno no la ve en el listado (modo Prueba). */
export type Fault = {id: string; kind: FaultKind; entityId?: string; connectionId?: string; hidden?: boolean};

/** Estado de la actividad guiada del proyecto. Las comprobaciones salen del proyecto; aquí solo se guarda qué actividad es, las respuestas y la entrega. */
export type LessonResult = {id: string; ok: boolean};
export type Submission = {at: string; score: number; total: number; results: LessonResult[]};
/** Comprobación de una actividad propia, como datos: se evalúa mirando el resultado (montaje, redes, comportamiento simulado), no una solución única.
 *  `steps` es una secuencia de mandos (cada paso: id de interruptor, pulsador o relé → true si está cerrado/pulsado/disparado); el estado se encadena entre pasos. */
export type CheckSpec = {id: string; text: string; hint: string} & (
  | {kind: 'mounted'; parent: string; child: string}
  | {kind: 'energized'; entity: string; steps: Record<string, boolean>[]; expect: boolean}
  | {kind: 'plcTag'; plc: string; tag: string; steps: Record<string, boolean>[]; expect: boolean}
  | {kind: 'sameNet'; a: TerminalRef; b: TerminalRef; steps: Record<string, boolean>[]; expect: boolean}
  | {kind: 'noErrors'});
export const CHECK_KINDS = ['mounted', 'energized', 'plcTag', 'sameNet', 'noErrors'] as const;
export type CustomActivity = {title: string; summary: string; checks: CheckSpec[]};
export type Lesson = {activityId: string | null; answers: Record<string, string>; submitted: Submission | null; /** Definición de una actividad propia (activityId = 'custom'). */ def?: CustomActivity};

export type EducationMode = 'free' | 'learning' | 'test';
export const EDUCATION_MODES: readonly EducationMode[] = ['free', 'learning', 'test'];

export type IndustryProject = {
  format: typeof FORMAT;
  version: number;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** Política pedagógica; distinta de Construcción/Simulación, que es estado de interfaz. */
  mode: EducationMode;
  entities: Entity[];
  mounts: Mount[];
  connections: Connection[];
  bindings: Binding[];
  /** Pose 3D por entidad. */
  poses: Record<string, Pose>;
  /** Símbolos de diagrama por entidad (independientes de la pose 3D). */
  symbols: Record<string, SymbolPlacement[]>;
  /** Programa de cada PLC, por id de entidad. */
  plc: Record<string, PlcProgram>;
  hmi: HmiScreen;
  faults: Fault[];
  lesson: Lesson;
};

export type IndustryLibrary = {projects: IndustryProject[]; active: string};

export const LIMITS = {
  projects: 30,
  entities: 500,
  mounts: 600,
  connections: 2000,
  bindings: 2000,
  symbolsPerEntity: 40,
  rungs: 100,
  branches: 6,
  contacts: 8,
  memory: 60,
  widgets: 40,
  faults: 20,
  answers: 10,
  answer: 200,
  checks: 20,
  steps: 8,
  stepInputs: 20,
  route: 20,
  name: 80,
  label: 60,
  history: 50,
  importBytes: 2 * 1024 * 1024,
} as const;

export type Result<T> = {ok: true; value: T} | {ok: false; error: string};

/** Lo que depende de una entidad; se muestra antes de eliminarla. */
export type Dependencies = {mounts: Mount[]; connections: Connection[]; bindings: Binding[]; symbols: number; /** Líneas de programa y widgets de HMI que dependen del PLC. */ program: number};
