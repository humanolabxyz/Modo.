import {useCallback, useEffect, useRef, useState} from 'react';
import {activeProject, createProject, deleteProject, duplicateProject, emptyHistory, emptyLibrary, exportProject, importProject, pushHistory, readLibrary, redo as redoStep, renameProject, selectProject, STORAGE_KEY, undo as undoStep, updateActive, type History} from './model/library.ts';
import {LIMITS, type IndustryLibrary, type IndustryProject, type Result} from './model/types.ts';

/** Biblioteca de proyectos de Industria (patrón de useRoboticsProjects): guardado con retardo, bloqueo si lo guardado es ilegible e historial de 50 pasos. */
export function useIndustriaProject() {
  const [library, setLibrary] = useState<IndustryLibrary>(emptyLibrary);
  const [history, setHistory] = useState<History>(emptyHistory);
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const libraryRef = useRef(library);
  const persisted = useRef<IndustryLibrary | null>(null);
  const commit = useCallback((next: IndustryLibrary) => { libraryRef.current = next; setLibrary(next); }, []);

  useEffect(() => {
    try {
      const read = readLibrary(localStorage.getItem(STORAGE_KEY));
      if (read.status === 'ok') { commit(read.library); persisted.current = read.library; }
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
        if (persisted.current !== current) { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); persisted.current = current; }
        setSaved(true);
      } catch { setSaved(false); setMessage('El navegador no pudo guardar. Exporta tu proyecto para no perderlo.'); }
    };
    const timer = setTimeout(persist, 350);
    const flush = () => { clearTimeout(timer); persist(); };
    addEventListener('pagehide', flush); addEventListener('beforeunload', flush);
    return () => { clearTimeout(timer); removeEventListener('pagehide', flush); removeEventListener('beforeunload', flush); };
  }, [library, ready, storageBlocked]);

  const project = activeProject(library);

  /** Aplica una operación del modelo. Si falla, avisa y no cambia nada; si pasa, registra un paso de historial. */
  const run = useCallback(<R extends Result<IndustryProject>>(change: (p: IndustryProject) => R): R => {
    const current = libraryRef.current, before = activeProject(current), result = change(before);
    if (!result.ok) { setMessage(result.error); return result; }
    if (result.value === before) return result;
    setHistory(h => pushHistory(h, before));
    commit(updateActive(current, () => result.value));
    return result;
  }, [commit]);

  const replace = (next: IndustryLibrary) => { commit(next); setHistory(emptyHistory()); };
  const notify = (result: {library: IndustryLibrary} | {error: string}) => {
    if ('error' in result) { setMessage(result.error); return false; }
    replace(result.library); return true;
  };
  const apply = (step: {history: History; project: IndustryProject} | null) => {
    if (!step) return;
    setHistory(step.history);
    const current = libraryRef.current;
    commit({...current, projects: current.projects.map(p => (p.id === step.project.id ? step.project : p))});
  };
  const download = (p: IndustryProject) => {
    const {filename, text} = exportProject(p);
    const url = URL.createObjectURL(new Blob([text], {type: 'application/json'}));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return {
    library, project, projects: library.projects, ready, saved, storageBlocked, message, setMessage, run,
    rename: (name: string) => { setHistory(h => pushHistory(h, project)); commit(renameProject(libraryRef.current, name)); },
    create: () => notify(createProject(libraryRef.current)),
    duplicate: () => notify(duplicateProject(libraryRef.current)),
    remove: (id: string) => replace(deleteProject(libraryRef.current, id)),
    select: (id: string) => replace(selectProject(libraryRef.current, id)),
    importFile: async (file: File) => {
      if (file.size > LIMITS.importBytes) { setMessage('El archivo supera el límite de 2 MB.'); return false; }
      return notify(importProject(libraryRef.current, await file.text()));
    },
    exportActive: () => download(activeProject(libraryRef.current)),
    undo: () => apply(undoStep(history, project)),
    redo: () => apply(redoStep(history, project)),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
export type IndustriaProjectApi = ReturnType<typeof useIndustriaProject>;
