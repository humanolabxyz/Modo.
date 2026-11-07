// Biblioteca de proyectos de Industria: lógica pura. Mismo patrón que Robótica, con clave propia `modo:industria:*`.
import {newId, newIndustryProject} from './defaults.ts';
import {parseIndustryProject, parseIndustryProjectText} from './validate.ts';
import {LIMITS, type IndustryLibrary, type IndustryProject} from './types.ts';

export const STORAGE_KEY = 'modo:industria:library:v1';

export type StoredRead =
  | {status: 'empty'}
  | {status: 'ok'; library: IndustryLibrary}
  /** Hay datos pero no se pueden leer: NO se sobrescriben. */
  | {status: 'unreadable'; reason: string};

export function readLibrary(raw: string | null): StoredRead {
  if (raw === null || raw === '') return {status: 'empty'};
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return {status: 'unreadable', reason: 'El almacenamiento no es un JSON válido.'}; }
  if (typeof data !== 'object' || data === null || !Array.isArray((data as IndustryLibrary).projects) || typeof (data as IndustryLibrary).active !== 'string') return {status: 'unreadable', reason: 'La biblioteca guardada tiene un formato desconocido.'};
  const stored = data as {projects: unknown[]; active: string};
  if (stored.projects.length === 0 || stored.projects.length > LIMITS.projects) return {status: 'unreadable', reason: 'La biblioteca guardada tiene un número de proyectos inválido.'};
  const projects: IndustryProject[] = [];
  for (const item of stored.projects) {
    const result = parseIndustryProject(item);
    if (!result.ok) return {status: 'unreadable', reason: result.error};
    projects.push(result.value);
  }
  const ids = new Set(projects.map(p => p.id));
  if (ids.size !== projects.length) return {status: 'unreadable', reason: 'La biblioteca tiene proyectos con el mismo id.'};
  return {status: 'ok', library: {projects, active: ids.has(stored.active) ? stored.active : projects[0].id}};
}

export const emptyLibrary = (): IndustryLibrary => {
  const project = newIndustryProject();
  return {projects: [project], active: project.id};
};

export const activeProject = (library: IndustryLibrary): IndustryProject => library.projects.find(p => p.id === library.active) ?? library.projects[0];

const touch = (project: IndustryProject, now = new Date().toISOString()): IndustryProject => ({...project, updatedAt: now});

export function updateActive(library: IndustryLibrary, change: (project: IndustryProject) => IndustryProject): IndustryLibrary {
  const current = activeProject(library);
  const next = touch(change(current));
  return {...library, projects: library.projects.map(p => (p.id === current.id ? next : p))};
}

type Outcome = {library: IndustryLibrary} | {error: string};
const full = (library: IndustryLibrary): Outcome | null => (library.projects.length >= LIMITS.projects ? {error: `La biblioteca admite hasta ${LIMITS.projects} proyectos.`} : null);

export function createProject(library: IndustryLibrary, name = 'Instalación sin nombre'): Outcome {
  const limit = full(library); if (limit) return limit;
  const project = newIndustryProject(name);
  return {library: {projects: [...library.projects, project], active: project.id}};
}

export function duplicateProject(library: IndustryLibrary): Outcome {
  const limit = full(library); if (limit) return limit;
  const source = activeProject(library), now = new Date().toISOString();
  const copy: IndustryProject = {...structuredClone(source), id: newId(), name: `${source.name} (copia)`.slice(0, LIMITS.name), createdAt: now, updatedAt: now};
  return {library: {projects: [...library.projects, copy], active: copy.id}};
}

export const renameProject = (library: IndustryLibrary, name: string): IndustryLibrary => updateActive(library, p => ({...p, name: name.trim().slice(0, LIMITS.name) || p.name}));

/** Borra un proyecto. La biblioteca nunca queda vacía. */
export function deleteProject(library: IndustryLibrary, id: string): IndustryLibrary {
  const rest = library.projects.filter(p => p.id !== id);
  if (rest.length === 0) return emptyLibrary();
  return {projects: rest, active: library.active === id ? rest[0].id : library.active};
}

export const selectProject = (library: IndustryLibrary, id: string): IndustryLibrary => (library.projects.some(p => p.id === id) ? {...library, active: id} : library);

/** Importa como copia con id nuevo. Rechaza archivos de otros módulos con un mensaje claro. */
export function importProject(library: IndustryLibrary, source: string): Outcome {
  const limit = full(library); if (limit) return limit;
  const result = parseIndustryProjectText(source);
  if (!result.ok) return {error: result.error};
  const project: IndustryProject = {...result.value, id: newId(), updatedAt: new Date().toISOString()};
  return {library: {projects: [...library.projects, project], active: project.id}};
}

export const exportProject = (project: IndustryProject): {filename: string; text: string} => ({
  filename: `${project.name.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '') || 'industria'}.industria.json`,
  text: JSON.stringify(project, null, 2),
});

/** Historial deshacer/rehacer por instantáneas del proyecto activo (50 pasos). */
export type History = {past: IndustryProject[]; future: IndustryProject[]};
export const emptyHistory = (): History => ({past: [], future: []});
export const pushHistory = (history: History, before: IndustryProject): History => ({past: [...history.past, before].slice(-LIMITS.history), future: []});
export function undo(history: History, current: IndustryProject): {history: History; project: IndustryProject} | null {
  const previous = history.past.at(-1);
  if (!previous) return null;
  return {project: previous, history: {past: history.past.slice(0, -1), future: [current, ...history.future].slice(0, LIMITS.history)}};
}
export function redo(history: History, current: IndustryProject): {history: History; project: IndustryProject} | null {
  const next = history.future[0];
  if (!next) return null;
  return {project: next, history: {past: [...history.past, current].slice(-LIMITS.history), future: history.future.slice(1)}};
}
