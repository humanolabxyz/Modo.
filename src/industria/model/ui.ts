// Estado de interfaz de Industria (cámara, vista, paneles, selección, ruta). Se guarda APARTE del proyecto:
// restaurar el proyecto no debe mover la cámara ni reabrir paneles, y viceversa.
import type {Vec3} from './types.ts';

export type ViewId = 'plant' | 'board' | 'diagram' | 'plc' | 'hmi' | 'docs';
export const VIEWS: readonly {id: ViewId; label: string}[] = [
  {id: 'plant', label: 'Planta 3D'}, {id: 'board', label: 'Tablero'}, {id: 'diagram', label: 'Diagramas'},
  {id: 'plc', label: 'PLC'}, {id: 'hmi', label: 'HMI'}, {id: 'docs', label: 'Documentación'},
];

export type PanelId = 'library' | 'inspector' | 'cameras' | 'structure' | 'connections' | 'instruments' | 'faults' | 'activity' | 'console';
export const PANEL_IDS: readonly PanelId[] = ['library', 'inspector', 'cameras', 'structure', 'connections', 'instruments', 'faults', 'activity', 'console'];

export type Operation = 'build' | 'simulate';
export type CameraState = {position: Vec3; target: Vec3};
export type SavedCamera = CameraState & {name: string};

export type IndustriaUi = {
  version: 1;
  view: ViewId;
  operation: Operation;
  camera: CameraState;
  savedCameras: SavedCamera[];
  panels: Record<PanelId, boolean>;
  selection: string[];
  /** Planta › Estación › Gabinete › Componente › Terminal (ids o nombres de nivel). */
  path: string[];
  /** «Imán»: al soltar una pieza suelta se ajusta a la rejilla de 5 cm. Los anclajes funcionan siempre. */
  magnet: boolean;
  /** Sonido (contactores, interruptores, motor). Apagado por defecto. */
  sound: boolean;
};

export const uiKey = (projectId: string): string => `modo:industria:ui:${projectId}:v1`;

export const defaultUi = (): IndustriaUi => ({
  version: 1,
  view: 'plant',
  operation: 'build',
  camera: {position: [6, 5, 7], target: [0, 0.8, 0]},
  savedCameras: [],
  panels: {library: true, inspector: false, cameras: false, structure: false, connections: false, instruments: false, faults: false, activity: false, console: false},
  selection: [],
  path: ['Planta'],
  magnet: true,
  sound: false,
});

const isVec3 = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every(n => typeof n === 'number' && Number.isFinite(n));

/** Lee el estado guardado; cualquier dato dudoso se descarta y se usa el valor por defecto (la UI nunca bloquea el proyecto). */
export function parseUi(raw: string | null): IndustriaUi {
  const base = defaultUi();
  if (!raw) return base;
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return base; }
  if (typeof data !== 'object' || data === null) return base;
  const d = data as Record<string, unknown>;
  if (d.version !== 1) return base;
  const camera = d.camera as Record<string, unknown> | undefined;
  const panels = {...base.panels};
  if (typeof d.panels === 'object' && d.panels !== null) for (const id of PANEL_IDS) { const v = (d.panels as Record<string, unknown>)[id]; if (typeof v === 'boolean') panels[id] = v; }
  return {
    version: 1,
    view: VIEWS.some(v => v.id === d.view) ? (d.view as ViewId) : base.view,
    operation: d.operation === 'simulate' ? 'simulate' : 'build',
    camera: camera && isVec3(camera.position) && isVec3(camera.target) ? {position: camera.position, target: camera.target} : base.camera,
    savedCameras: Array.isArray(d.savedCameras) ? d.savedCameras.filter((c): c is SavedCamera => typeof c === 'object' && c !== null && typeof (c as SavedCamera).name === 'string' && isVec3((c as SavedCamera).position) && isVec3((c as SavedCamera).target)).slice(0, 20) : [],
    panels,
    selection: Array.isArray(d.selection) ? d.selection.filter((s): s is string => typeof s === 'string').slice(0, 200) : [],
    path: Array.isArray(d.path) && d.path.length > 0 ? d.path.filter((s): s is string => typeof s === 'string').slice(0, 5) : base.path,
    magnet: typeof d.magnet === 'boolean' ? d.magnet : base.magnet,
    sound: typeof d.sound === 'boolean' ? d.sound : base.sound,
  };
}
