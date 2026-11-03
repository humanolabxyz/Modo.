// Guía de programación paso a paso. Cada paso trae el programa COMPLETO hasta ese punto (crece de paso en paso), por qué se escribe así y una comprobación
// que se ejecuta en el simulador con el circuito, los pines y los sensores reales del robot del estudiante.

/** Algo que se debe cumplir tras ejecutar el programa un rato. Los motores se nombran por su orden en el proyecto (motor 1 = primero). */
export type Expectation =
  | {kind: 'pin-mode'; pin: string; mode: 'out' | 'in'}
  | {kind: 'pin-level'; pin: string; level: 'high' | 'low'}
  /** Tensión del motor `motor` (0 = primero): `above` o `below` el umbral en voltios; `relative` la compara con otro motor. */
  | {kind: 'motor'; motor: number; above?: number; below?: number}
  | {kind: 'motor-less-than'; motor: number; other: number; margin: number}
  | {kind: 'motor-close'; motor: number; other: number; tolerance: number}
  | {kind: 'serial'; match: string; /** Texto que se muestra si falla. */ hint: string}
  | {kind: 'sensor-echoes'; min: number}
  /** El servo `servo` (0 = el primero) está cerca de `angle` (°), dentro de `tolerance`. */
  | {kind: 'servo-angle'; servo: number; angle: number; tolerance: number}
  /** La pantalla OLED dibuja una imagen con entre `min` y `max` píxeles encendidos (0 = apagada o en negro). */
  | {kind: 'display-lit'; min: number; max: number; hint: string};

/** Un escenario de prueba: se cambian propiedades de banco de pruebas (distancia del obstáculo, suelo negro) y se ejecuta `ms` de tiempo virtual. */
export type CheckScenario = {
  /** Ej.: `{def: 'hc-sr04', n: 0, prop: 'testDistance', value: 0.1}` = obstáculo a 10 cm del primer sensor. */
  set?: {def: string; n?: number; prop: string; value: number | boolean}[];
  /** Qué se está probando, en palabras del estudiante («con un obstáculo a 10 cm»). */
  label: string;
  ms: number;
  expect: Expectation[];
};

export type ProgramStep = {
  id: string;
  title: string;
  /** Por qué se escribe así, en una o dos frases. */
  why: string;
  /** Ideas nuevas de este paso (viñetas cortas). */
  learn: string[];
  /** Programa completo hasta este paso. */
  source: string;
  /** Qué debes ver al probarlo. */
  see: string;
  checks: CheckScenario[];
};

export type ProgramGuideDef = {
  id: string;
  name: string;
  summary: string;
  /** Plantillas (robots) a las que sirve esta guía: se sugiere sola cuando eliges una. */
  templates: string[];
  steps: ProgramStep[];
};

export type CheckLine = {ok: boolean; text: string};
export type CheckReport = {ok: boolean; scenario: string; lines: CheckLine[]; message?: string};
