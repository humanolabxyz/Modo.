import {useCallback, useEffect, useRef, useState} from 'react';
import {buildTemplate} from './templates.ts';
import {activeProject, addProject, createProject, deleteProject, duplicateProject, emptyHistory, emptyLibrary, exportProject, importProject, pushHistory, readLibrary, redo as redoStep, renameProject, selectProject, STORAGE_KEY, undo as undoStep, updateActive, type History} from './library.ts';
import {LIMITS, type RobotLibrary, type RobotProject} from './types.ts';

export type UpdateOptions = {
  /** Registrar un paso de historial (por defecto sí). */
  history?: boolean;
  /** Cambiar la fecha de edición (por defecto sí). */
  touch?: boolean;
};

/** Biblioteca de proyectos de Robótica, con el patrón de useLaboratory: guardado con retardo, bloqueo si los datos guardados son ilegibles e historial de 50 pasos. */
export function useRoboticsProjects() {
  const [library, setLibrary] = useState<RobotLibrary>(emptyLibrary);
  const [history, setHistory] = useState<History>(emptyHistory);
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const libraryRef = useRef(library);
  const persisted = useRef<RobotLibrary | null>(null);
  const commit = useCallback((next: RobotLibrary) => {
    libraryRef.current = next;
    setLibrary(next);
  }, []);

  useEffect(() => {
    try {
      const read = readLibrary(localStorage.getItem(STORAGE_KEY));
      if (read.status === 'ok') commit(read.library);
      else if (read.status === 'unreadable') {
        setStorageBlocked(true);
        setMessage(`No se pudo leer la biblioteca guardada (${read.reason}). Se desactivó el guardado para no borrarla; exporta tu trabajo desde el menú del proyecto.`);
      }
    } catch {
      setStorageBlocked(true);
      setMessage('Este navegador no permite guardar. Exporta tu proyecto para conservarlo.');
    }
    setReady(true);
  }, [commit]);

  useEffect(() => {
    if (!ready || storageBlocked) return;
    setSaved(false);
    const persist = () => {
      const current = libraryRef.current;
      try {
        if (persisted.current !== current) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          persisted.current = current;
        }
        setSaved(true);
      } catch {
        setSaved(false);
        setMessage('El navegador no pudo guardar. Exporta tu proyecto para no perderlo.');
      }
    };
    const timer = setTimeout(persist, 350);
    const flush = () => { clearTimeout(timer); persist(); };
    addEventListener('pagehide', flush); addEventListener('beforeunload', flush);
    return () => { clearTimeout(timer); removeEventListener('pagehide', flush); removeEventListener('beforeunload', flush); };
  }, [library, ready, storageBlocked]);

  const project = activeProject(library);

  const update = useCallback((change: (p: RobotProject) => RobotProject, options: UpdateOptions = {}) => {
    const {history: record = true, touch = true} = options;
    const current = libraryRef.current;
    const before = activeProject(current);
    const next = change(before);
    if (next === before) return;
    if (record) setHistory(h => pushHistory(h, before));
    commit(touch ? updateActive(current, () => next) :
      {...current, projects: current.projects.map(p => p.id === before.id ? next : p)});
  }, [commit]);

  const replace = (next: RobotLibrary) => { commit(next); setHistory(emptyHistory()); };
  const notify = (result: {library: RobotLibrary} | {error: string}) => {
    if ('error' in result) { setMessage(result.error); return false; }
    replace(result.library); return true;
  };

  const apply = (step: {history: History; project: RobotProject} | null) => {
    if (!step) return;
    setHistory(step.history);
    const current = libraryRef.current;
    commit({...current, projects: current.projects.map(p => p.id === step.project.id ? step.project : p)});
  };

  const download = (p: RobotProject) => {
    const {filename, text} = exportProject(p);
    const url = URL.createObjectURL(new Blob([text], {type: 'application/json'}));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return {
    library, project, projects: library.projects, ready, saved, storageBlocked, message, setMessage,
    update,
    rename: (name: string) => { setHistory(h => pushHistory(h, project)); commit(renameProject(libraryRef.current, name)); },
    create: () => notify(createProject(libraryRef.current)),
    /** Crea un proyecto desde una plantilla (p. ej. el robot armado y programado). */
    createFromTemplate: (id: string) => { const t = buildTemplate(id); return t ? notify(addProject(libraryRef.current, t)) : false; },
    duplicate: () => notify(duplicateProject(libraryRef.current)),
    remove: (id: string) => replace(deleteProject(libraryRef.current, id)),
    select: (id: string) => replace(selectProject(libraryRef.current, id)),
    importFile: async (file: File) => {
      if (file.size > LIMITS.importBytes) { setMessage('El archivo supera el límite de 2 MB.'); return false; }
      const text = await file.text();
      return notify(importProject(libraryRef.current, text));
    },
    exportActive: () => download(activeProject(libraryRef.current)),
    exportOne: (id: string) => { const p = libraryRef.current.projects.find(x => x.id === id); if (p) download(p); },
    undo: () => apply(undoStep(history, project)),
    redo: () => apply(redoStep(history, project)),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
export type RoboticsProjects = ReturnType<typeof useRoboticsProjects>;
