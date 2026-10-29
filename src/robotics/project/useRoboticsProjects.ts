import {useCallback, useEffect, useRef, useState} from 'react';
import {activeProject, createProject, deleteProject, duplicateProject, emptyHistory, emptyLibrary, exportProject, importProject, pushHistory, readLibrary, redo as redoStep, renameProject, selectProject, STORAGE_KEY, undo as undoStep, updateActive, type History} from './library.ts';
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
  libraryRef.current = library;

  useEffect(() => {
    try {
      const read = readLibrary(localStorage.getItem(STORAGE_KEY));
      if (read.status === 'ok') setLibrary(read.library);
      else if (read.status === 'unreadable') {
        setStorageBlocked(true);
        setMessage(`No se pudo leer la biblioteca guardada (${read.reason}). Se desactivó el guardado para no borrarla; exporta tu trabajo desde el menú del proyecto.`);
      }
    } catch {
      setStorageBlocked(true);
      setMessage('Este navegador no permite guardar. Exporta tu proyecto para conservarlo.');
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || storageBlocked) return;
    setSaved(false);
    const persist = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(libraryRef.current)); setSaved(true); }
      catch { setMessage('El navegador no pudo guardar. Exporta tu proyecto para no perderlo.'); }
    };
    const timer = setTimeout(persist, 350);
    const flush = () => { clearTimeout(timer); persist(); };
    addEventListener('pagehide', flush); addEventListener('beforeunload', flush);
    return () => { clearTimeout(timer); removeEventListener('pagehide', flush); removeEventListener('beforeunload', flush); };
  }, [library, ready, storageBlocked]);

  const project = activeProject(library);

  const update = useCallback((change: (p: RobotProject) => RobotProject, options: UpdateOptions = {}) => {
    const {history: record = true, touch = true} = options;
    const before = activeProject(libraryRef.current);
    if (record) setHistory(h => pushHistory(h, before));
    setLibrary(l => {
      if (touch) return updateActive(l, change);
      const current = activeProject(l);
      const next = change(current);
      return {...l, projects: l.projects.map(p => (p.id === current.id ? next : p))};
    });
  }, []);

  const replace = (next: RobotLibrary) => { setLibrary(next); setHistory(emptyHistory()); };
  const notify = (result: {library: RobotLibrary} | {error: string}) => {
    if ('error' in result) { setMessage(result.error); return false; }
    replace(result.library); return true;
  };

  const apply = (step: {history: History; project: RobotProject} | null) => {
    if (!step) return;
    setHistory(step.history);
    setLibrary(l => ({...l, projects: l.projects.map(p => (p.id === step.project.id ? step.project : p))}));
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
    rename: (name: string) => { setHistory(h => pushHistory(h, project)); setLibrary(l => renameProject(l, name)); },
    create: () => notify(createProject(library)),
    duplicate: () => notify(duplicateProject(library)),
    remove: (id: string) => replace(deleteProject(library, id)),
    select: (id: string) => replace(selectProject(library, id)),
    importFile: async (file: File) => {
      if (file.size > LIMITS.importBytes) { setMessage('El archivo supera el límite de 2 MB.'); return false; }
      return notify(importProject(library, await file.text()));
    },
    exportActive: () => download(project),
    exportOne: (id: string) => { const p = library.projects.find(x => x.id === id); if (p) download(p); },
    undo: () => apply(undoStep(history, project)),
    redo: () => apply(redoStep(history, project)),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
export type RoboticsProjects = ReturnType<typeof useRoboticsProjects>;
