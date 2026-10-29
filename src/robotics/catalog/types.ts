// Catálogo de piezas (contrato de docs/robotica/02, §4). Unidades: metros. Y arriba; el origen de cada pieza es el centro de su caja.
import type {Vec3} from '../project/types.ts';

export type PinDefinition = {
  id: string;
  label: string;
  position: Vec3;
  role: 'power-in' | 'power-out' | 'ground' | 'digital' | 'analog' | 'pwm' | 'motor' | 'signal';
  electrical?: {vMax?: number; iMax?: number};
  /** Pines unidos internamente (p. ej. los GND del UNO). */
  internalNet?: string;
};

/**
 * Punto de unión mecánica.
 * `tag` es lo que el anclaje ES (p. ej. `motor-mount`); `accepts` lista los `tag` que puede recibir.
 * Si A.accepts contiene B.tag, A es el anclaje anfitrión (padre) y B el hijo. (`tag` es un campo añadido al contrato.)
 */
export type AnchorDefinition = {id: string; label: string; position: Vec3; normal: Vec3; tag: string; accepts: string[]};

export type ComponentDefinition = {
  id: string;
  name: string;
  category: 'control' | 'driver' | 'sensor' | 'actuator' | 'power' | 'structure' | 'passive';
  /** Caja envolvente [x, y, z] en metros. */
  dimensions: Vec3;
  dimensionsSource: 'datasheet' | 'measured' | 'approximate';
  massKg: number;
  pins: PinDefinition[];
  anchors: AnchorDefinition[];
  props?: {id: string; label: string; type: 'number' | 'boolean' | 'enum'; min?: number; max?: number; options?: string[]; default: unknown}[];
  scalable: false;
  model: 'procedural';
  /** Texto breve para la ventana Piezas. */
  summary: string;
  /** Palabras extra para la búsqueda. */
  keywords: string[];
};
