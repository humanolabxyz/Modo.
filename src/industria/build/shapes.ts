// Formas, anclajes y terminales. Puro (sin React ni three) para probarlo en Node. Los datos viven en catalog/items.ts (fase 4).
// IMPORTANTE: mientras un ítem no tenga estado «verified» con fuente, sus medidas son de ejemplo y no sirven como especificación.
import type {ConnectionKind, MountKind, Vec3} from '../model/types.ts';
import {ITEMS} from '../catalog/items.ts';

export type AnchorRole = 'host' | 'child';

export type AnchorDef = {
  id: string;
  label: string;
  /** `host` recibe a otros; `child` se monta sobre un `host` del mismo `kind`. */
  role: AnchorRole;
  kind: MountKind;
  /** Posición en el sistema local de la pieza (m). */
  position: Vec3;
  /** Normal saliente en el sistema local. Un hijo se acopla con su normal opuesta a la del anfitrión. */
  normal: Vec3;
  /** Referencia de giro alrededor de la normal (local). Si falta se usa un eje por defecto. */
  up?: Vec3;
  /** Un anfitrión `multi` admite varios hijos a la vez (riel, cara de placa). */
  multi?: boolean;
  /** Deslizamiento permitido del hijo sobre el anfitrión: ejes locales y límites [mín, máx] en metros. */
  slide?: {axes: Vec3[]; limits: [number, number][]};
};

export type ShapeDef = {
  id: string;
  name: string;
  family: string;
  /** Caja envolvente (m) para dibujar y detectar interferencias. */
  size: Vec3;
  /** Centro de la caja respecto al origen de la pose. */
  center: Vec3;
  color: string;
  anchors: AnchorDef[];
  /** Terminales (cableado: fase 5). Posición local; el marcado sigue la convención indicada en `terminalSource`. */
  terminals?: TerminalDef[];
  terminalSource?: string;
  /** Pares de terminales unidos internamente (p. ej. un borne de paso). Los contactos que conmutan NO son puentes. */
  bridges?: [string, string][];
  subfamily?: string;
  description?: string;
  status: ItemStatus;
  /** Obligatoria si `status` es `verified`: de dónde salen las medidas y los datos. */
  source?: Provenance;
};

/** Función eléctrica convencional del terminal. Solo sirve para detectar uniones imposibles (línea con neutro, positivo con negativo), no para calcular nada. */
export type TerminalRole = 'line' | 'neutral' | 'positive' | 'negative' | 'ground';
export type TerminalDef = {id: string; label: string; position: Vec3; kind: ConnectionKind; group?: string; role?: TerminalRole};
/** `generic` = pieza didáctica sin datos de fabricante; `unverified` = con datos aún sin contrastar; `verified` = contrastado con la fuente indicada. */
export type ItemStatus = 'generic' | 'unverified' | 'verified';
export type Provenance = {kind: 'datasheet' | 'norma' | 'catalogo' | 'medicion' | 'proyecto'; ref: string; url?: string; checkedAt?: string};

export const STATUS_LABEL: Record<ItemStatus, string> = {generic: 'Genérico · no verificado', unverified: 'No verificado', verified: 'Verificado'};
export const GENERIC_NOTE = 'Familia genérica de prueba: las medidas no son de un producto real.';

const BY_ID = new Map(ITEMS.map(s => [s.id, s]));
/** Forma desconocida (p. ej. de una definición futura): se dibuja como bloque sin anclajes en vez de fallar. */
const FALLBACK: ShapeDef = {id: 'desconocido', name: 'Componente', family: 'Sin clasificar', size: [0.4, 0.4, 0.4], center: [0, 0.2, 0], color: '#9aa7b8', anchors: [], status: 'unverified'};

export const SHAPES: readonly ShapeDef[] = ITEMS;
export const listShapes = (): readonly ShapeDef[] => ITEMS;
export const shapeOf = (definitionId: string): ShapeDef => BY_ID.get(definitionId) ?? FALLBACK;
export const anchorOf = (definitionId: string, anchorId: string): AnchorDef | undefined => shapeOf(definitionId).anchors.find(a => a.id === anchorId);
