// Biblioteca de proyectos: lógica pura (sin React) para poder probarla en Node.
import {newId, newRobotProject} from './defaults.ts';
import {parseRobotProject, parseRobotProjectText} from './validate.ts';
import {catalogShape} from '../catalog/index.ts';
import {LIMITS, type RobotLibrary, type RobotProject} from './types.ts';

export const STORAGE_KEY = 'modo-robotica-v1';

export type StoredRead =
  | {status: 'empty'}
  | {status: 'ok'; library: RobotLibrary}
  /** Hay datos pero no se pueden leer: NO se sobrescriben. */
  | {status: 'unreadable'; reason: string};

/** Lee el valor crudo del almacenamiento. Una biblioteca parcialmente dañada se considera ilegible entera: así no se pierden proyectos por sobrescribir. */
export function readLibrary(raw: string | null): StoredRead {
  if (raw === null || raw === '') return {status: 'empty'};
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return {status: 'unreadable', reason: 'El almacenamiento no es un JSON válido.'}; }
  if (typeof data !== 'object' || data === null || !Array.isArray((data as RobotLibrary).projects) || typeof (data as RobotLibrary).active !== 'string') return {status: 'unreadable', reason: 'La biblioteca guardada tiene un formato desconocido.'};
  const stored = data as {projects: unknown[]; active: string};
  if (stored.projects.length === 0 || stored.projects.length > LIMITS.projects) return {status: 'unreadable', reason: 'La biblioteca guardada tiene un número de proyectos inválido.'};
  const projects: RobotProject[] = [];
  for (const item of stored.projects) {
    const result = parseRobotProject(item, {catalog: catalogShape});
    if (!result.ok) return {status: 'unreadable', reason: result.error};
    projects.push(result.project);
  }
  const ids = new Set(projects.map(p => p.id));
  if (ids.size !== projects.length) return {status: 'unreadable', reason: 'La biblioteca tiene proyectos con el mismo id.'};
  return {status: 'ok', library: {projects, active: ids.has(stored.active) ? stored.active : projects[0].id}};
}

export const emptyLibrary = (): RobotLibrary => {
  const project = newRobotProject();
  return {projects: [project], active: project.id};
};

export const activeProject = (library: RobotLibrary): RobotProject => library.projects.find(p => p.id === library.active) ?? library.projects[0];

const touch = (project: RobotProject, now = new Date().toISOString()): RobotProject => ({...project, updatedAt: now});

/** Aplica un cambio al proyecto activo. */
export function updateActive(library: RobotLibrary, change: (project: RobotProject) => RobotProject): RobotLibrary {
  const current = activeProject(library);
  const next = touch(change(current));
  return {...library, projects: library.projects.map(p => (p.id === current.id ? next : p))};
}

export function createProject(library: RobotLibrary, name = 'Robot sin nombre'): {library: RobotLibrary} | {error: string} {
  if (library.projects.length >= LIMITS.projects) return {error: `La biblioteca admite hasta ${LIMITS.projects} proyectos.`};
  const project = newRobotProject(name);
  return {library: {projects: [...library.projects, project], active: project.id}};
}

export function duplicateProject(library: RobotLibrary): {library: RobotLibrary} | {error: string} {
  if (library.projects.length >= LIMITS.projects) return {error: `La biblioteca admite hasta ${LIMITS.projects} proyectos.`};
  const source = activeProject(library), now = new Date().toISOString();
  const copy: RobotProject = {...structuredClone(source), id: newId(), name: `${source.name} (copia)`.slice(0, LIMITS.name), createdAt: now, updatedAt: now};
  return {library: {projects: [...library.projects, copy], active: copy.id}};
}

export function renameProject(library: RobotLibrary, name: string): RobotLibrary {
  return updateActive(library, p => ({...p, name: name.slice(0, LIMITS.name)}));
}

/** Borra un proyecto. La biblioteca nunca queda vacía: si era el último, se crea uno vacío. */
export function deleteProject(library: RobotLibrary, id: string): RobotLibrary {
  const rest = library.projects.filter(p => p.id !== id);
  if (rest.length === 0) return emptyLibrary();
  return {projects: rest, active: library.active === id ? rest[0].id : library.active};
}

export function selectProject(library: RobotLibrary, id: string): RobotLibrary {
  return library.projects.some(p => p.id === id) ? {...library, active: id} : library;
}

/** Importa como copia con id nuevo. */
export function importProject(library: RobotLibrary, source: string): {library: RobotLibrary} | {error: string} {
  if (library.projects.length >= LIMITS.projects) return {error: `La biblioteca admite hasta ${LIMITS.projects} proyectos.`};
  const result = parseRobotProjectText(source, {catalog: catalogShape});
  if (!result.ok) return {error: result.error};
  const now = new Date().toISOString();
  const project: RobotProject = {...result.project, id: newId(), updatedAt: now};
  return {library: {projects: [...library.projects, project], active: project.id}};
}

export const exportProject = (project: RobotProject): {filename: string; text: string} => ({
  filename: `${project.name.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '') || 'robot'}.modo.json`,
  text: JSON.stringify(project, null, 2),
});

/** Historial deshacer/rehacer por instantáneas del proyecto activo (50 pasos). */
export type History = {past: RobotProject[]; future: RobotProject[]};
export const emptyHistory = (): History => ({past: [], future: []});
export function pushHistory(history: History, before: RobotProject): History {
  return {past: [...history.past, before].slice(-LIMITS.history), future: []};
}
export function undo(history: History, current: RobotProject): {history: History; project: RobotProject} | null {
  const previous = history.past.at(-1);
  if (!previous) return null;
  return {project: previous, history: {past: history.past.slice(0, -1), future: [current, ...history.future].slice(0, LIMITS.history)}};
}
export function redo(history: History, current: RobotProject): {history: History; project: RobotProject} | null {
  const next = history.future[0];
  if (!next) return null;
  return {project: next, history: {past: [...history.past, current].slice(-LIMITS.history), future: history.future.slice(1)}};
}
