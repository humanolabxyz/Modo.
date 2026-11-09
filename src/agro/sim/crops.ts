// Cultivos de Agro (Fase 4). Puro. Un solo cultivo por ahora: tomate de mesa.
// Etapas por tiempo térmico (grados-día sobre la temperatura base), coeficiente de cultivo Kc (estilo FAO-56) y sensibilidad al estrés hídrico Ky (estilo FAO-33).
// Los números son DIDÁCTICOS y de orden de magnitud correcto; no representan una variedad ni un manejo real (provenance: fictional).

export type StageId = 'establecimiento' | 'vegetativo' | 'floracion' | 'fructificacion' | 'madurez';
export type Stage = {id: StageId; label: string; /** grados-día acumulados en que empieza */ from: number; to: number; /** sensibilidad del rendimiento al déficit de agua en esta etapa */ ky: number};

export type Crop = {
  id: string; name: string;
  tBaseC: number; tCapC: number;
  stages: readonly Stage[];
  /** Kc en función de los grados-día acumulados (interpolación lineal). */
  kc: readonly (readonly [number, number])[];
  /** Fracción del agua útil que se puede gastar sin estrés. */
  depletion: number;
  /** Rendimiento potencial (t/ha de fruto fresco). */
  yieldPotentialTha: number;
};

export const TOMATE: Crop = {
  id: 'tomate', name: 'Tomate', tBaseC: 10, tCapC: 30,
  stages: [
    {id: 'establecimiento', label: 'Establecimiento', from: 0, to: 180, ky: 0.2},
    {id: 'vegetativo', label: 'Desarrollo vegetativo', from: 180, to: 480, ky: 0.4},
    {id: 'floracion', label: 'Floración', from: 480, to: 760, ky: 1.1},
    {id: 'fructificacion', label: 'Llenado de frutos', from: 760, to: 1100, ky: 0.8},
    {id: 'madurez', label: 'Lista para cosechar', from: 1100, to: Infinity, ky: 0},
  ],
  kc: [[0, 0.5], [180, 0.6], [480, 1.15], [900, 1.15], [1100, 0.8]],
  depletion: 0.4,
  yieldPotentialTha: 80,
};

export const CROPS: readonly Crop[] = [TOMATE];
export const cropById = (id: unknown): Crop | undefined => CROPS.find(c => c.id === id);

export function stageAt(crop: Crop, gdd: number): Stage {
  for (const s of crop.stages) if (gdd < s.to) return s;
  return crop.stages[crop.stages.length - 1];
}

export function kcAt(crop: Crop, gdd: number): number {
  const k = crop.kc;
  if (gdd <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (gdd <= k[i][0]) { const [x0, y0] = k[i - 1], [x1, y1] = k[i], t = (gdd - x0) / (x1 - x0); return y0 + (y1 - y0) * t; }
  return k[k.length - 1][1];
}

/** Grados-día de un día con temperatura media `tMean` (método simple: media acotada entre la base y el tope). */
export const gddOfDay = (crop: Crop, tMean: number): number => Math.max(0, Math.min(tMean, crop.tCapC) - crop.tBaseC);
