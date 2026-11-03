import {useEffect, useState} from 'react';
import {addProject, emptyLibrary, readLibrary, selectProject, STORAGE_KEY} from '../project/library.ts';
import {buildTemplate} from '../project/templates.ts';
import type {RobotLibrary} from '../project/types.ts';
import ArenaPanel from './ArenaPanel';

/** Standalone entry: no editor, build canvas, inspector or arm controller is mounted here. */
export default function ArenaApp() {
  const [library, setLibrary] = useState<RobotLibrary | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    try {
      const stored = readLibrary(localStorage.getItem(STORAGE_KEY));
      if (stored.status === 'unreadable') {setMessage('No se pudo leer tu biblioteca. Tus datos siguen guardados; puedes probar los ejemplos.');setLibrary(emptyLibrary());}
      else setLibrary(stored.status === 'ok' ? stored.library : emptyLibrary());
    } catch {setLibrary(emptyLibrary());setMessage('El navegador no permite acceder a tus construcciones guardadas.');}
  }, []);
  function edit(id: string, template: boolean) {
    try {
      const read = readLibrary(localStorage.getItem(STORAGE_KEY));
      if (read.status === 'unreadable') {setMessage('La biblioteca no se puede leer. Abre el taller y exporta tus datos antes de crear otra construcción.');return;}
      const current = read.status === 'ok' ? read.library : emptyLibrary();
      let next: RobotLibrary;
      if (template) {
        const project = buildTemplate(id); if (!project) return;
        const result = addProject(current, project);
        if ('error' in result) {setMessage(result.error);return;} next = result.library;
      } else next = selectProject(current, id);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      location.assign('/robotica/');
    } catch {setMessage('No se pudo guardar la construcción. Revisa el almacenamiento del navegador antes de continuar.');}
  }
  if (!library) return <div className="arena-loading">Preparando la arena…</div>;
  return <>{message && <div className="rb-arena-notice" role="status">{message}<button type="button" aria-label="Cerrar aviso de arena" onClick={()=>setMessage('')}>×</button></div>}<ArenaPanel projects={library.projects} onClose={()=>location.assign('/robotica/')} onEdit={edit}/></>;
}
