import {CURRENT_VERSION, FORMAT, type IndustryProject, type Pose} from './types.ts';

export const IDENTITY_POSE: Pose = {position: [0, 0, 0], rotation: [0, 0, 0]};

export const newId = (prefix = ''): string => {
  const raw = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${raw.slice(0, 8)}` : raw;
};

/** Proyecto vacío: sin entidades ni relaciones. */
export function newIndustryProject(name = 'Instalación sin nombre', now = new Date().toISOString()): IndustryProject {
  return {
    format: FORMAT,
    version: CURRENT_VERSION,
    id: newId(),
    name,
    createdAt: now,
    updatedAt: now,
    mode: 'free',
    entities: [],
    mounts: [],
    connections: [],
    bindings: [],
    poses: {},
    symbols: {},
    plc: {},
    hmi: {widgets: []},
    faults: [],
    lesson: {activityId: null, answers: {}, submitted: null},
  };
}
