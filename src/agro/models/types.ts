// Biblioteca 3D de Agro (Etapa 6): tipos del manifiesto. Puro: sin three ni React, para poder probarlo en Node.
export type ModelFamily = 'terrenos-rocas' | 'arboles-vegetacion' | 'cultivos' | 'estructuras-agricolas' | 'herramientas' | 'maquinaria' | 'riego' | 'electricidad-automatizacion' | 'personajes' | 'animales' | 'robotica-agroindustrial';
/** listo = cargable, con escala y estilo coherentes · adaptar = geometría útil pero materiales/proporciones por corregir · descartar = no encaja · pendiente = sin modelo adecuado o para una etapa futura */
export type ModelStatus = 'listo' | 'adaptar' | 'descartar' | 'pendiente';

export type ModelSource = {
  pack: string; author: string; license: string; licenseUrl: string;
  /** Archivo original dentro de `agro 3d kits` (el kit no se modifica; el GLB es una copia convertida). */
  original: string;
};

/** Cómo se ajusta el modelo al espacio funcional. El pivote siempre queda en el centro de la huella, sobre el suelo. */
export type ModelFit =
  | {mode: 'scale'; scale: number}
  | {mode: 'height'; meters: number}
  | {mode: 'contain'; size: readonly [number, number, number]};

export type ModelEntry = {
  id: string; label: string; family: ModelFamily; status: ModelStatus;
  /** URL pública del GLB optimizado. Ausente si el modelo aún no se integra. */
  file?: string;
  /** Tipo funcional del catálogo al que representa, si lo hay (el motor de la pieza no cambia). */
  entity?: string;
  /** Papel decorativo (árbol, arbusto, roca, planta de cultivo…) cuando no es una pieza del catálogo. */
  role?: string;
  source: ModelSource;
  fit: ModelFit;
  /** Giro (rad) para que el frente del modelo apunte a +Z como las piezas del catálogo. */
  yaw?: number;
  /** Armonización de color respecto al paquete original: saturación y luminosidad relativas. */
  tone?: {sat: number; light: number};
  /** Color por nombre de material cuando el paquete trae texturas que no se incorporan. */
  palette?: Record<string, string>;
  shadows?: {cast: boolean; receive: boolean};
  /** Medidas del GLB convertido (informativas; las verifica `qa/verify-agro-models.mjs`). */
  metrics?: {tris: number; bytes: number; sizeM: readonly [number, number, number]};
  /** Puntos de conexión sobre el modelo (metros, relativos al pivote ya normalizado). Reservado: los puertos funcionales siguen en el catálogo. */
  anchors?: Record<string, readonly [number, number, number]>;
  /** Nombres de partes que podrán animarse (aspas, puertas). Reservado. */
  movable?: string[];
  /** Fracción de triángulos que se conserva al generar el GLB optimizado (1 = sin simplificar). Aplicada por tools/agro-assets/build-library.mjs. */
  simplify?: number;
  placeholder?: boolean; replaceWith?: string; notes?: string;
};
