// Biblioteca 3D integrada de Agro (Etapa 6): SOLO los modelos que ya se usan en el simulador, con su procedencia y cómo se ajustan.
// El resto de los candidatos del kit vive en la galería (`/agro/galeria-3d/`) y en docs/agro/biblioteca-3d/. Un modelo aquí no cambia ningún motor:
// representa una pieza del catálogo (`entity`), un papel decorativo (`role`) o una etapa de un cultivo.
import type {TerritoryId} from '../model/types.ts';
import type {ModelEntry, ModelFamily, ModelSource, ModelStatus} from './types.ts';

const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
const PACKS = {
  cultivos: {folder: 'drive-download-20261110T194644Z-1-001', pack: 'Quaternius · LowPoly Models (cultivos)'},
  granja: {folder: 'drive-download-20261110T194737Z-1-001', pack: 'Quaternius · LowPoly Models (estructuras de granja)'},
  plataforma: {folder: 'drive-download-20261110T194800Z-1-001', pack: 'Quaternius · Ultimate Platformer Pack'},
} as const;
const source = (p: keyof typeof PACKS, name: string): ModelSource =>
  ({pack: PACKS[p].pack, author: 'Quaternius', license: 'CC0 1.0 Universal (License.txt incluido en el paquete)', licenseUrl: CC0, original: `${PACKS[p].folder}/Blends/${name}.blend`});
const file = (id: string) => `/agro/models/${id}.glb`;

type Base = {id: string; label: string; family: ModelFamily; from: keyof typeof PACKS; name: string; fit: ModelEntry['fit']} & Partial<ModelEntry>;
const make = ({from, name, id, ...rest}: Base): ModelEntry => ({status: 'listo' as ModelStatus, file: file(id), id, source: source(from, name), ...rest} as ModelEntry);

// Tintes de armonización: los colores del paquete son suaves y naturales; solo se baja un poco la saturación de las estructuras.
const FARM_TONE = {sat: 0.62, light: 1.08};
const PINE_PALETTE = {PineTree_Leaves: '#34553b', PineTree_Bark: '#5b4534'};
const ROCK_NOTE = 'Textura pintada sustituida por un color arena-ocre liso.';
const ROCK_PALETTE = {Rock: '#8c7a64'}, BUSH_PALETTE_A = {Bush_Leaves: '#5b6a3a'}, BUSH_PALETTE_B = {Bush_Leaves: '#6c7640'};

export const LIBRARY: readonly ModelEntry[] = [
  // ── Estructuras que representan piezas del catálogo (el motor y las dimensiones funcionales no cambian) ──
  make({id: 'estructura-granero', label: 'Granero', family: 'estructuras-agricolas', from: 'granja', name: 'Barn', entity: 'granero', status: 'adaptar', fit: {mode: 'contain', size: [9, 6.6, 6]}, tone: FARM_TONE,
    notes: 'Proporciones más cuadradas que la huella del catálogo (9 × 6): se escala para caber y queda algo menor. Paleta granja americana atenuada.'}),
  make({id: 'estructura-molino', label: 'Molino de viento', family: 'estructuras-agricolas', from: 'granja', name: 'Windmill', entity: 'molino', status: 'adaptar', fit: {mode: 'height', meters: 9.5}, tone: FARM_TONE, movable: ['rotor'],
    notes: 'El rotor sobresale de la huella de 3 × 3 m (solo visual; la colisión y la selección usan la huella del catálogo). Es una imagen: no bombea ni genera.'}),
  make({id: 'estructura-cerca', label: 'Tramo de cerca', family: 'estructuras-agricolas', from: 'granja', name: 'Fence', entity: 'cerca', fit: {mode: 'scale', scale: 1}, tone: {sat: 0.8, light: 1}, notes: 'Se repite a lo largo del largo de la pieza (tramos de 5,9 m ligeramente estirados).'}),

  // ── Vegetación decorativa del Oasis nortino y el desierto ──
  make({id: 'veg-palma-a', label: 'Palma datilera joven', family: 'arboles-vegetacion', from: 'cultivos', name: 'PalmTree_3', role: 'arbol', fit: {mode: 'height', meters: 6.2}, simplify: 0.75}),
  make({id: 'veg-palma-b', label: 'Palma datilera adulta', family: 'arboles-vegetacion', from: 'cultivos', name: 'PalmTree_4', role: 'arbol', fit: {mode: 'height', meters: 8.2}, simplify: 0.55}),
  make({id: 'veg-citrico-a', label: 'Cítrico joven', family: 'arboles-vegetacion', from: 'cultivos', name: 'Orange_3', role: 'arbol', fit: {mode: 'height', meters: 3.4}}),
  make({id: 'veg-citrico-b', label: 'Cítrico adulto', family: 'arboles-vegetacion', from: 'cultivos', name: 'Orange_4', role: 'arbol', fit: {mode: 'height', meters: 4.4}, simplify: 0.6}),
  make({id: 'veg-cactus-a', label: 'Cactus columnar joven', family: 'arboles-vegetacion', from: 'cultivos', name: 'Cactus_3', role: 'arbusto', fit: {mode: 'height', meters: 1.9}}),
  make({id: 'veg-cactus-b', label: 'Cactus con brazos', family: 'arboles-vegetacion', from: 'cultivos', name: 'Cactus_4', role: 'arbusto', fit: {mode: 'height', meters: 2.3}, simplify: 0.5}),
  make({id: 'veg-arbusto-a', label: 'Arbusto redondo', family: 'arboles-vegetacion', from: 'plataforma', name: 'Bush', role: 'arbusto', status: 'adaptar', fit: {mode: 'height', meters: 1.2}, palette: BUSH_PALETTE_A,
    notes: 'El paquete usa una textura pintada con acabado de videojuego; se descarta y se asigna un verde apagado liso.'}),
  make({id: 'veg-arbusto-b', label: 'Arbusto ancho', family: 'arboles-vegetacion', from: 'plataforma', name: 'Bush_Large', role: 'arbusto', status: 'adaptar', fit: {mode: 'height', meters: 1.3}, palette: BUSH_PALETTE_B,
    notes: 'Igual que el arbusto redondo: geometría útil, textura sustituida por color.'}),
  make({id: 'veg-pino-a', label: 'Pino joven', family: 'arboles-vegetacion', from: 'plataforma', name: 'PineTree_5', role: 'arbol', status: 'adaptar', fit: {mode: 'height', meters: 7}, palette: PINE_PALETTE,
    notes: 'Conífera del Platformer: textura pintada sustituida por verde oscuro y corteza lisos.'}),
  make({id: 'veg-pino-b', label: 'Pino adulto', family: 'arboles-vegetacion', from: 'plataforma', name: 'PineTree_3', role: 'arbol', status: 'adaptar', fit: {mode: 'height', meters: 9}, palette: PINE_PALETTE, simplify: 0.5,
    notes: 'Igual que el pino joven; simplificado al 50 % de triángulos.'}),
  make({id: 'roca-a', label: 'Roca angulosa A', family: 'terrenos-rocas', from: 'plataforma', name: 'Rock_1', role: 'roca', status: 'adaptar', fit: {mode: 'height', meters: 1}, palette: ROCK_PALETTE,
    notes: 'Textura pintada sustituida por un color arena-ocre liso.'}),
  make({id: 'roca-b', label: 'Roca angulosa B', family: 'terrenos-rocas', from: 'plataforma', name: 'Rock_2', role: 'roca', status: 'adaptar', fit: {mode: 'height', meters: 1}, palette: ROCK_PALETTE, notes: ROCK_NOTE}),
  make({id: 'roca-c', label: 'Roca angulosa C', family: 'terrenos-rocas', from: 'plataforma', name: 'Rock_5', role: 'roca', status: 'adaptar', fit: {mode: 'height', meters: 1}, palette: ROCK_PALETTE, notes: ROCK_NOTE}),

  // ── Tomate: una variante por etapa de crecimiento (se relacionan con las etapas del motor en CROP_STAGE_MODELS) ──
  ...[1, 2, 3, 4].map(n => make({id: `cultivo-tomate-${n}`, label: `Tomate · etapa ${n}`, family: 'cultivos', from: 'cultivos', name: `Tomato_${n}`, role: 'cultivo', fit: {mode: 'scale', scale: 1}, ...(n >= 3 && {simplify: 0.45})})),
];

const byId = new Map(LIBRARY.map(m => [m.id, m]));
export const modelById = (id: string): ModelEntry | undefined => byId.get(id);
/** Solo para la galería de revisión: permite ver candidatos que todavía no forman parte de la biblioteca integrada. */
export const registerModel = (entry: ModelEntry): void => { if (!byId.has(entry.id)) byId.set(entry.id, entry); };
export const modelForEntity =(type: string): ModelEntry | undefined => LIBRARY.find(m => m.entity === type);

/** Etapa fenológica del motor → modelo visual. Un cultivo nuevo solo añade su fila (los parámetros científicos viven en sim/crops.ts). */
export const CROP_STAGE_MODELS: Record<string, Record<string, string>> = {
  tomate: {establecimiento: 'cultivo-tomate-1', vegetativo: 'cultivo-tomate-2', floracion: 'cultivo-tomate-3', fructificacion: 'cultivo-tomate-4', madurez: 'cultivo-tomate-4'},
};

/** Vegetación decorativa disponible para cada territorio. */
export type VegetationSet = {trees: readonly string[]; shrubs: readonly string[]; rocks: readonly string[]};
const ROCKS = ['roca-a', 'roca-b', 'roca-c'];
export const VEGETATION_SETS: Partial<Record<TerritoryId, VegetationSet>> = {
  'oasis-norte': {trees: ['veg-palma-a', 'veg-palma-b', 'veg-citrico-a', 'veg-citrico-b'], shrubs: ['veg-arbusto-a', 'veg-arbusto-b', 'veg-cactus-a', 'veg-cactus-b'], rocks: ROCKS},
  desierto: {trees: [], shrubs: ['veg-cactus-a', 'veg-cactus-b', 'veg-arbusto-b'], rocks: ROCKS},
  free: {trees: ['veg-citrico-a', 'veg-citrico-b', 'veg-pino-a', 'veg-pino-b'], shrubs: ['veg-arbusto-a', 'veg-arbusto-b'], rocks: ROCKS},
  valley: {trees: ['veg-citrico-a', 'veg-citrico-b', 'veg-pino-a', 'veg-pino-b'], shrubs: ['veg-arbusto-a', 'veg-arbusto-b'], rocks: ROCKS},
  ladera: {trees: ['veg-pino-a', 'veg-pino-b'], shrubs: ['veg-arbusto-a', 'veg-arbusto-b'], rocks: ROCKS},
  'valle-rio': {trees: ['veg-citrico-a', 'veg-citrico-b', 'veg-pino-a', 'veg-pino-b'], shrubs: ['veg-arbusto-a', 'veg-arbusto-b'], rocks: ROCKS},
};
