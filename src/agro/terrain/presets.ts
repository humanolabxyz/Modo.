import type {TerrainParameters, TerritoryId} from '../model/types.ts';

type RGB = readonly [number, number, number];
type Preset = {
  name: string; description: string; params: TerrainParameters;
  /** Amplitudes y escalas del perfil V2. Estos valores forman parte de esa versión. */
  shape: {hills: number; scale: number; shoulders: number; channel: number; incline: number; ridge: number};
  surface: {open: RGB; green: RGB; dry: RGB; rock: RGB};
  landscape: {water: boolean; road: boolean; hills: number; horizon: number; haze: string; clouds: number; dust: boolean};
};

export const TERRITORIES: Record<TerritoryId, Preset> = {
  free: {
    name: 'Mundo libre', description: 'Praderas abiertas y lomajes bajos. Puedes elegir un terreno plano y despejado.',
    params: {reliefStrength: 0.7, roughness: 0.3, baseElevationM: 20, valleyBias: 0.15, vegetation: 0.45, rocks: 0.35},
    shape: {hills: 30, scale: 250, shoulders: 22, channel: 0, incline: 0, ridge: 4},
    surface: {open: [0.46,0.58,0.31], green: [0.32,0.49,0.25], dry: [0.64,0.59,0.36], rock: [0.48,0.46,0.40]},
    landscape: {water: false, road: false, hills: 48, horizon: 180, haze: '#bfced0', clouds: 0.55, dust: false},
  },
  valley: {
    name: 'Valle central', description: 'Planicies agrícolas, arbolado moderado y cordones de cerros.',
    params: {reliefStrength: 1, roughness: 0.35, baseElevationM: 20, valleyBias: 0.7, vegetation: 0.65, rocks: 0.45},
    shape: {hills: 48, scale: 250, shoulders: 93, channel: 0, incline: 12, ridge: 14},
    surface: {open: [0.46,0.58,0.28], green: [0.29,0.47,0.22], dry: [0.64,0.57,0.31], rock: [0.47,0.45,0.39]},
    landscape: {water: false, road: true, hills: 135, horizon: 380, haze: '#bdcdcf', clouds: 0.65, dust: false},
  },
  'oasis-norte': {
    name: 'Oasis nortino', description: 'Inspirado en Pica. Una depresión verde entre laderas ocres y quebradas secas.',
    params: {reliefStrength: 1.05, roughness: 0.52, baseElevationM: 55, valleyBias: 0.88, vegetation: 0.62, rocks: 0.62},
    shape: {hills: 46, scale: 185, shoulders: 128, channel: 14, incline: 9, ridge: 33},
    surface: {open: [0.75,0.58,0.38], green: [0.33,0.49,0.24], dry: [0.83,0.67,0.45], rock: [0.58,0.40,0.27]},
    landscape: {water: false, road: true, hills: 172, horizon: 385, haze: '#d4c4ad', clouds: 0.26, dust: true},
  },
  desierto: {
    name: 'Desierto árido', description: 'Planicies de arena y grava, abanicos de sedimento y cauces secos.',
    params: {reliefStrength: 0.85, roughness: 0.48, baseElevationM: 45, valleyBias: 0.36, vegetation: 0.07, rocks: 0.8},
    shape: {hills: 38, scale: 305, shoulders: 67, channel: 18, incline: 22, ridge: 22},
    surface: {open: [0.77,0.64,0.47], green: [0.56,0.54,0.37], dry: [0.86,0.74,0.55], rock: [0.59,0.46,0.33]},
    landscape: {water: false, road: false, hills: 93, horizon: 305, haze: '#dbc9af', clouds: 0.18, dust: true},
  },
  ladera: {
    name: 'Laderas y montaña', description: 'Cordones escarpados, roca expuesta y pequeñas mesetas para construir.',
    params: {reliefStrength: 1.35, roughness: 0.72, baseElevationM: 75, valleyBias: 0.52, vegetation: 0.55, rocks: 0.86},
    shape: {hills: 77, scale: 165, shoulders: 115, channel: 7, incline: 64, ridge: 64},
    surface: {open: [0.47,0.55,0.33], green: [0.29,0.43,0.26], dry: [0.64,0.57,0.43], rock: [0.49,0.47,0.44]},
    landscape: {water: false, road: true, hills: 240, horizon: 520, haze: '#b9c6ce', clouds: 0.7, dust: false},
  },
  'valle-rio': {
    name: 'Valle fluvial', description: 'Planicie de ribera, un cauce sinuoso decorativo y laderas arboladas.',
    params: {reliefStrength: 0.95, roughness: 0.32, baseElevationM: 26, valleyBias: 0.92, vegetation: 0.79, rocks: 0.32},
    shape: {hills: 42, scale: 255, shoulders: 86, channel: 8, incline: 3, ridge: 13},
    surface: {open: [0.48,0.60,0.30], green: [0.27,0.45,0.23], dry: [0.65,0.59,0.34], rock: [0.46,0.44,0.38]},
    landscape: {water: true, road: true, hills: 155, horizon: 360, haze: '#bbcdd0', clouds: 0.68, dust: false},
  },
};

/** Rangos de autoría para las reglas cualitativas de Mundos y Mapas V2. */
export const TERRAIN_CONTROLS = {
  reliefStrength: {label: 'Intensidad del relieve', min: 0, max: 1.8, step: 0.05, unit: '×'},
  roughness: {label: 'Rugosidad', min: 0, max: 1, step: 0.01, unit: ''},
  baseElevationM: {label: 'Elevación base', min: -20, max: 160, step: 1, unit: ' m'},
  valleyBias: {label: 'Forma del valle', min: 0, max: 1, step: 0.01, unit: ''},
  vegetation: {label: 'Vegetación ambiental', min: 0, max: 1, step: 0.01, unit: ''},
  rocks: {label: 'Rocas ambientales', min: 0, max: 1, step: 0.01, unit: ''},
} satisfies Record<keyof TerrainParameters, {label: string; min: number; max: number; step: number; unit: string}>;
