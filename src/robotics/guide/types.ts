// Guía de cableado paso a paso. Cada robot define su lista de pasos como DATOS; la lógica de `wireGuide.ts` los evalúa contra el proyecto real.

/** Una pieza del proyecto por su definición y su orden de creación (n = 0 es la primera de ese tipo, «… 1» en la lista de piezas). */
export type PartRef = {def: string; n?: number; /** Id de la pieza en el proyecto de referencia (guías generadas desde una plantilla): se empareja con la del usuario por su posición. */ ref?: string};
export type PinSpec = {part: PartRef; pin: string};

export type WireStep = {kind: 'wire'; id: string; group: string; title: string; why: string; from: PinSpec; to: PinSpec; color: string; colorName: string};
/** Ajuste de una propiedad de una pieza (voltaje de la batería, puentes del L298N…). `atLeast`: basta con alcanzar el valor. */
export type PropStep = {kind: 'prop'; id: string; group: string; title: string; why: string; part: PartRef; prop: string; value: number | boolean; atLeast?: boolean};
export type GuideStep = WireStep | PropStep;

export type WiringGuideDef = {id: string; name: string; summary: string; steps: GuideStep[]; /** Proyecto de referencia (plantilla) con el que se emparejan las piezas del usuario. */ reference?: import('../project/types.ts').RobotProject};

export type StepState =
  | {state: 'done'}
  | {state: 'todo'}
  /** Falta una pieza que el paso necesita: se arma primero. */
  | {state: 'blocked'; hint: string}
  /** El cable existe pero va a otro pin de la misma pieza. */
  | {state: 'wrong'; hint: string};
