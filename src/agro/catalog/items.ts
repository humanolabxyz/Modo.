// Catálogo piloto de Agro (Fase 2): 8 piezas con medidas en metros, puertos tipados y límites de colocación. Puro.
// REGLA: son piezas didácticas genéricas, sin marca ni valores de un producto real; las medidas son de ejemplo hasta que el catálogo se verifique con fichas técnicas.
// El modelo visual (primitivas 3D) vive en `scene/EntityMesh.tsx`; aquí solo está lo que la simulación y la colocación necesitan.
import type {Port, PropValue, Vec3} from '../model/types.ts';
import {RUNTIME_STATE} from '../plc/program.ts';
import {PARCEL_STATE} from '../sim/soil.ts';

export type ParamDef = {key: string; label: string; unit: string; min: number; max: number; step: number; default: number};
export type Family = 'Agua' | 'Energía' | 'Control' | 'Cultivo' | 'Infraestructura';

export type ItemDef = {
  id: string; name: string; family: Family; description: string;
  /** Huella y altura base [ancho x, alto y, fondo z] (m) con los parámetros por defecto. */
  size: Vec3;
  /** Pendiente máxima del suelo bajo la huella (grados). */
  maxSlopeDeg: number;
  /** ¿Choca con otras piezas? Las parcelas son zonas del suelo y no chocan. */
  solid: boolean;
  params: ParamDef[];
  /** Parámetros fijos de catálogo (no editables). */
  fixed: Record<string, PropValue>;
  state: Record<string, PropValue>;
};

const hyd = (id: string, label: string, direction: 'in' | 'out' | 'bidirectional', diameterMm: number, local: Vec3, normal: Vec3): Port => ({id, label, kind: 'hydraulic', direction, local, normal, spec: {diameterMm}});

export const ITEMS: readonly ItemDef[] = [
  {id: 'estanque', name: 'Estanque', family: 'Agua', description: 'Depósito cilíndrico de agua.', size: [2.6, 2.4, 2.6], maxSlopeDeg: 6, solid: true, params: [], fixed: {volumenMaxL: 10000}, state: {nivelL: 6000}},
  {id: 'bomba', name: 'Bomba centrífuga', family: 'Agua', description: 'Bomba de agua trifásica.', size: [0.7, 0.5, 0.4], maxSlopeDeg: 8, solid: true, params: [], fixed: {potenciaNominalKw: 2.2, alturaCierreM: 30, kCurva: 320000}, state: {}},
  {id: 'tuberia', name: 'Tubería', family: 'Agua', description: 'Tramo recto de tubería.', size: [6, 0.15, 0.15], maxSlopeDeg: 30, solid: true,
    params: [{key: 'largoM', label: 'Largo', unit: 'm', min: 1, max: 50, step: 0.5, default: 6}, {key: 'diametroMm', label: 'Diámetro', unit: 'mm', min: 20, max: 110, step: 1, default: 50}], fixed: {}, state: {}},
  {id: 'valvula', name: 'Válvula', family: 'Agua', description: 'Válvula de paso.', size: [0.4, 0.35, 0.3], maxSlopeDeg: 15, solid: true, params: [], fixed: {diametroMm: 50}, state: {abierta: true}},
  {id: 'sensor-humedad', name: 'Sensor de humedad', family: 'Control', description: 'Sonda de humedad del suelo: mide la parcela donde está clavada.', size: [0.15, 0.6, 0.15], maxSlopeDeg: 25, solid: true, params: [], fixed: {}, state: {}},
  {id: 'tablero', name: 'Tablero de control', family: 'Control', description: 'Gabinete de mando con interruptor general, PLC genérico y pantalla HMI.', size: [0.9, 1.3, 0.35], maxSlopeDeg: 8, solid: true,
    params: [{key: 'secoPct', label: 'Umbral «seco» (agua útil)', unit: '%', min: 0, max: 100, step: 1, default: 50}, {key: 'humedoPct', label: 'Umbral «húmedo» (agua útil)', unit: '%', min: 0, max: 100, step: 1, default: 85}, {key: 'horaIniH', label: 'Franja de riego: desde', unit: 'h', min: 0, max: 24, step: 1, default: 0}, {key: 'horaFinH', label: 'Franja de riego: hasta', unit: 'h', min: 0, max: 24, step: 1, default: 24}],
    fixed: {}, state: {interruptor: false, modo: 'manual', ...RUNTIME_STATE}},
  {id: 'panel-solar', name: 'Panel solar', family: 'Energía', description: 'Panel fotovoltaico con soporte.', size: [1.7, 1, 1], maxSlopeDeg: 12, solid: true, params: [], fixed: {}, state: {}},
  {id: 'parcela', name: 'Parcela', family: 'Cultivo', description: 'Zona de cultivo delimitada sobre el suelo.', size: [20, 0.2, 30], maxSlopeDeg: 12, solid: false,
    params: [{key: 'anchoM', label: 'Ancho', unit: 'm', min: 5, max: 200, step: 1, default: 20}, {key: 'largoM', label: 'Largo', unit: 'm', min: 5, max: 200, step: 1, default: 30}], fixed: {}, state: {...PARCEL_STATE}},
  {id: 'te', name: 'Derivación en T', family: 'Agua', description: 'Une tres tuberías de 50 mm.', size: [0.6, 0.3, 0.4], maxSlopeDeg: 30, solid: true, params: [], fixed: {diametroMm: 50}, state: {}},
  {id: 'emisor', name: 'Aspersor', family: 'Agua', description: 'Descarga el agua a la atmósfera: es el final de la red.', size: [0.4, 0.6, 0.4], maxSlopeDeg: 25, solid: true,
    params: [{key: 'caudalNominalLmin', label: 'Caudal a 10 m', unit: 'L/min', min: 5, max: 200, step: 1, default: 40}, {key: 'radioM', label: 'Radio de riego', unit: 'm', min: 2, max: 30, step: 0.5, default: 8}], fixed: {}, state: {}},
  {id: 'granero', name: 'Granero', family: 'Infraestructura', description: 'Bodega y taller de la finca. Hoy es solo una construcción: el inventario y las obras llegan en la Fase 6.', size: [9, 6.6, 6], maxSlopeDeg: 6, solid: true, params: [], fixed: {}, state: {}},
  {id: 'invernadero', name: 'Invernadero', family: 'Infraestructura', description: 'Túnel de cultivo protegido. Hoy es solo una construcción: el cultivo bajo cubierta llega más adelante.', size: [8, 4, 20], maxSlopeDeg: 5, solid: true,
    params: [{key: 'anchoM', label: 'Ancho', unit: 'm', min: 4, max: 16, step: 1, default: 8}, {key: 'largoM', label: 'Largo', unit: 'm', min: 6, max: 60, step: 1, default: 20}], fixed: {}, state: {}},
  {id: 'molino', name: 'Molino de viento', family: 'Infraestructura', description: 'Molino de aspas clásico. Hoy es solo una construcción (no bombea ni genera).', size: [3, 12, 3], maxSlopeDeg: 8, solid: true, params: [], fixed: {}, state: {}},
  {id: 'cerca', name: 'Cerca', family: 'Infraestructura', description: 'Tramo recto de cerca de postes y travesaños.', size: [10, 1.1, 0.2], maxSlopeDeg: 20, solid: true,
    params: [{key: 'largoM', label: 'Largo', unit: 'm', min: 2, max: 50, step: 0.5, default: 10}], fixed: {}, state: {}},
  {id: 'acometida', name: 'Acometida eléctrica', family: 'Energía', description: 'Punto de conexión a la red trifásica de 400 V.', size: [0.5, 1.4, 0.5], maxSlopeDeg: 10, solid: true, params: [], fixed: {tensionV: 400}, state: {}},
];

const byId = new Map(ITEMS.map(i => [i.id, i]));
export const itemById = (id: string): ItemDef | undefined => byId.get(id);

/** Parámetros editables con sus valores por defecto + los fijos de catálogo. */
export function defaultParams(def: ItemDef): Record<string, PropValue> {
  const out: Record<string, PropValue> = {...def.fixed};
  for (const p of def.params) out[p.key] = p.default;
  return out;
}

const num = (v: PropValue | undefined, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Medidas reales de una instancia (la tubería y la parcela cambian con sus parámetros). */
export function sizeOf(def: ItemDef, params: Record<string, PropValue>): Vec3 {
  if (def.id === 'tuberia') return [num(params.largoM, 6), Math.max(0.1, num(params.diametroMm, 50) / 1000 + 0.05), Math.max(0.1, num(params.diametroMm, 50) / 1000 + 0.05)];
  if (def.id === 'parcela') return [num(params.anchoM, 20), 0.2, num(params.largoM, 30)];
  if (def.id === 'invernadero') return [num(params.anchoM, 8), 4, num(params.largoM, 20)];
  if (def.id === 'cerca') return [num(params.largoM, 10), 1.1, 0.2];
  return def.size;
}

/** Puertos de una instancia: posiciones locales estables (origen en el centro de la huella, sobre el suelo). */
export function portsFor(def: ItemDef, params: Record<string, PropValue>): Port[] {
  switch (def.id) {
    case 'estanque': return [hyd('salida', 'Salida', 'out', 50, [1.3, 0.35, 0], [1, 0, 0]), hyd('entrada', 'Entrada', 'in', 50, [-1.3, 2, 0], [-1, 0, 0])];
    case 'bomba': return [hyd('succion', 'Succión', 'in', 50, [-0.35, 0.25, 0], [-1, 0, 0]), hyd('descarga', 'Descarga', 'out', 50, [0.35, 0.3, 0], [1, 0, 0]),
      {id: 'alim', label: 'Alimentación', kind: 'power', direction: 'in', local: [0, 0.5, 0.1], normal: [0, 1, 0], spec: {current: 'ac', phases: 3, voltage: 400, frequencyHz: 50}}];
    case 'tuberia': { const half = num(params.largoM, 6) / 2, d = num(params.diametroMm, 50); return [hyd('a', 'Extremo A', 'bidirectional', d, [-half, 0.1, 0], [-1, 0, 0]), hyd('b', 'Extremo B', 'bidirectional', d, [half, 0.1, 0], [1, 0, 0])]; }
    case 'valvula': return [hyd('a', 'Entrada', 'bidirectional', 50, [-0.2, 0.18, 0], [-1, 0, 0]), hyd('b', 'Salida', 'bidirectional', 50, [0.2, 0.18, 0], [1, 0, 0])];
    case 'sensor-humedad': return [{id: 'senal', label: 'Señal', kind: 'signal', direction: 'out', local: [0, 0.62, 0], normal: [0, 1, 0], spec: {signal: 'analog', level: '4-20mA'}}];
    case 'tablero': return [
      {id: 'red', label: 'Red de entrada', kind: 'power', direction: 'in', local: [0, 1.32, 0], normal: [0, 1, 0], spec: {current: 'ac', phases: 3, voltage: 400, frequencyHz: 50}},
      {id: 'salida-bomba', label: 'Salida a bomba', kind: 'power', direction: 'out', local: [0.46, 0.6, 0], normal: [1, 0, 0], spec: {current: 'ac', phases: 3, voltage: 400, frequencyHz: 50}},
      {id: 'entrada-senal', label: 'Entrada de sensor', kind: 'signal', direction: 'in', local: [-0.46, 0.6, 0], normal: [-1, 0, 0], spec: {signal: 'analog', level: '4-20mA'}}];
    case 'panel-solar': return [{id: 'salida', label: 'Salida DC', kind: 'power', direction: 'out', local: [0, 0.5, -0.5], normal: [0, 0, -1], spec: {current: 'dc', phases: 1, voltage: 48}}];
    case 'te': return [hyd('a', 'Extremo A', 'bidirectional', 50, [-0.3, 0.15, 0], [-1, 0, 0]), hyd('b', 'Extremo B', 'bidirectional', 50, [0.3, 0.15, 0], [1, 0, 0]), hyd('c', 'Derivación', 'bidirectional', 50, [0, 0.15, 0.2], [0, 0, 1])];
    case 'emisor': return [hyd('entrada', 'Entrada', 'in', 50, [-0.2, 0.3, 0], [-1, 0, 0])];
    case 'acometida': return [{id: 'red', label: 'Salida de red', kind: 'power', direction: 'out', local: [0, 1.25, 0], normal: [0, 1, 0], spec: {current: 'ac', phases: 3, voltage: 400, frequencyHz: 50}}];
    default: return [];
  }
}

/** Valida un valor de parámetro contra su definición. */
export function checkParam(def: ItemDef, key: string, value: unknown): {ok: true; value: number} | {ok: false; error: string} {
  const p = def.params.find(x => x.key === key);
  if (!p) return {ok: false, error: `«${key}» no es un parámetro editable de ${def.name}.`};
  if (typeof value !== 'number' || !Number.isFinite(value)) return {ok: false, error: `${p.label} debe ser un número.`};
  if (value < p.min || value > p.max) return {ok: false, error: `${p.label} debe estar entre ${p.min} y ${p.max} ${p.unit}.`};
  return {ok: true, value: Math.round(value / p.step) * p.step};
}
