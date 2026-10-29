import {useState} from 'react';
import {Bot, Copy, Download, FilePlus2, LayoutGrid, Trash2, Upload} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import type {RoboticsProjects} from '../project/useRoboticsProjects';
import {TEMPLATES} from '../project/templates.ts';
import {CodePanel} from './CodePanel';
import {ConsolePanel, PartsPanel, PropertiesPanel, ScenePanel, StructurePanel, type BuildContext} from './BuildWindows';
import {storageIdOf, WINDOW_IDS, type RoboticsWindowId, type RoboticsWindows} from './useRoboticsWindows';

export const WINDOW_LABELS: Record<RoboticsWindowId, {title: string; eyebrow: string}> = {
  parts: {title: 'Piezas', eyebrow: 'Catálogo'},
  structure: {title: 'Estructura', eyebrow: 'Proyecto'},
  properties: {title: 'Propiedades', eyebrow: 'Selección'},
  scene: {title: 'Escenario', eyebrow: 'Obstáculos'},
  code: {title: 'Programación', eyebrow: 'Sketch'},
  console: {title: 'Consola', eyebrow: 'Diagnóstico'},
};

const EMPTY: Record<RoboticsWindowId, {headline: string; body: string; stage: string}> = {
  parts: {headline: '', body: '', stage: ''},
  structure: {headline: '', body: '', stage: ''},
  properties: {headline: '', body: '', stage: ''},
  scene: {headline: '', body: '', stage: ''},
  code: {headline: 'El editor llega en la etapa 4', body: 'Aquí vas a escribir el sketch de Arduino y ejecutarlo en el ATmega328P emulado.', stage: 'Etapa 4'},
  console: {headline: 'Sin salida todavía', body: 'Aquí verás lo que tu programa escriba por Serial y los avisos del circuito.', stage: 'Etapa 4'},
};

type Props = {windows: RoboticsWindows; ctx: BuildContext};

/** Las cinco ventanas de herramientas. Piezas, Estructura y Propiedades son reales (etapa 2); Programación y Consola siguen siendo marcadores honestos hasta la etapa 4. */
export function RoboticsToolWindows({windows, ctx}: Props) {
  return <>
    {WINDOW_IDS.map(id => {
      const w = windows.state[id];
      if (!w.open) return null;
      const label = WINDOW_LABELS[id], empty = EMPTY[id];
      return <FloatingWindow key={`${id}-${windows.epoch}`} passive storageId={storageIdOf(id)} title={label.title} eyebrow={label.eyebrow} width={id === 'code' ? 480 : id === 'parts' ? 340 : 320} side={id === 'parts' || id === 'structure' ? 'left' : 'right'} top={id === 'console' ? 120 : 0} visible={w.visible} activation={w.activation} onClose={() => windows.close(id)} onMinimize={() => windows.minimize(id)} closeLabel={`Cerrar ${label.title}`} className={`rb-window rb-window-${id}`}>
        {id === 'parts' ? <PartsPanel ctx={ctx} /> : id === 'structure' ? <StructurePanel ctx={ctx} /> : id === 'properties' ? <PropertiesPanel ctx={ctx} /> : id === 'scene' ? <ScenePanel ctx={ctx} /> : id === 'console' ? <ConsolePanel ctx={ctx} /> : id === 'code' ? <CodePanel ctx={ctx} />
          : <div className="rb-window-empty"><strong>{empty.headline}</strong><p>{empty.body}</p><span className="rb-window-stage">Disponible en la {empty.stage.toLowerCase()}</span></div>}
      </FloatingWindow>;
    })}
  </>;
}

type ProjectsProps = {projects: RoboticsProjects; windows: RoboticsWindows; onClose(): void; onOpenProjects(): void};

/** Menú del proyecto: nombre, nuevo/duplicar, exportar/importar y restablecer la disposición de ventanas. */
export function ProjectOptionsWindow({projects, windows, onClose, onOpenProjects}: ProjectsProps) {
  const done = <T,>(ok: T) => { onClose(); return ok; };
  return <FloatingWindow storageId={storageIdOf('options')} title="Mi proyecto" eyebrow="Robótica" width={380} side="right" className="rb-window rb-project-window" closeLabel="Cerrar opciones del proyecto" onClose={onClose}>
    <div className="rb-project-menu">
      <label>Nombre del proyecto<input aria-label="Nombre del proyecto" value={projects.project.name} maxLength={100} disabled={!projects.ready} onChange={e => projects.rename(e.target.value)} /></label>
      <p className="rb-save-status" role="status">{!projects.ready ? 'Abriendo biblioteca…' : projects.storageBlocked ? 'Guardado desactivado' : projects.saved ? 'Guardado en este navegador' : 'Guardando…'}</p>
      <button type="button" className="rb-row" onClick={() => { onClose(); onOpenProjects(); }}><LayoutGrid size={18} /><span><strong>Mis proyectos</strong><small>{projects.projects.length} en este navegador</small></span></button>
      <button type="button" className="rb-row" aria-label="Nuevo proyecto vacío" disabled={!projects.ready} onClick={() => { if (projects.create()) onClose(); }}><FilePlus2 size={18} /><span><strong>Nuevo proyecto vacío</strong><small>Empieza desde cero</small></span></button>
      {TEMPLATES.map(t => <button key={t.id} type="button" className="rb-row" aria-label={`Nuevo desde plantilla: ${t.name}`} disabled={!projects.ready} onClick={() => { if (projects.createFromTemplate(t.id)) onClose(); }}><Bot size={18} /><span><strong>{t.name}</strong><small>Plantilla armada, cableada y programada</small></span></button>)}
      <button type="button" className="rb-row" aria-label="Duplicar proyecto" disabled={!projects.ready} onClick={() => { if (projects.duplicate()) onClose(); }}><Copy size={18} /><span><strong>Duplicar proyecto</strong></span></button>
      <button type="button" className="rb-row" aria-label="Exportar proyecto" onClick={projects.exportActive}><Download size={18} /><span><strong>Exportar proyecto</strong><small>Archivo .modo.json</small></span></button>
      <label className="rb-row rb-import"><Upload size={18} /><span><strong>Importar proyecto</strong><small>Se agrega como copia</small></span><input aria-label="Importar proyecto" type="file" accept=".json,.modo.json,application/json" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void projects.importFile(f).then(ok => ok && done(ok)); }} /></label>
      <button type="button" className="rb-row" aria-label="Restablecer disposición de ventanas" onClick={() => { windows.resetLayout(); onClose(); }}><LayoutGrid size={18} /><span><strong>Restablecer disposición</strong><small>Cierra las ventanas y las devuelve a su lugar</small></span></button>
    </div>
  </FloatingWindow>;
}

/** Biblioteca de proyectos guardados. */
export function ProjectsWindow({projects, onClose}: {projects: RoboticsProjects; onClose(): void}) {
  const [confirm, setConfirm] = useState<string | null>(null);
  return <FloatingWindow storageId={storageIdOf('projects')} title="Mis proyectos" eyebrow="Robótica" width={420} side="center" className="rb-window rb-projects-window" closeLabel="Cerrar mis proyectos" onClose={onClose}>
    <div className="rb-templates" aria-label="Plantillas">{TEMPLATES.map(t => <button key={t.id} type="button" className="rb-row" aria-label={`Nuevo desde plantilla: ${t.name}`} onClick={() => { if (projects.createFromTemplate(t.id)) onClose(); }}><Bot size={18} /><span><strong>{t.name}</strong><small>{t.summary}</small></span></button>)}</div>
    <ul className="rb-project-list" aria-label="Proyectos guardados">
      {projects.projects.map(p => <li key={p.id} className={p.id === projects.project.id ? 'is-active' : undefined}>
        <button type="button" className="rb-project-open" aria-current={p.id === projects.project.id ? 'true' : undefined} onClick={() => { projects.select(p.id); onClose(); }}><strong>{p.name || 'Sin nombre'}</strong><small>{p.parts.length} piezas · {new Date(p.updatedAt).toLocaleDateString('es-CL')}</small></button>
        <button type="button" aria-label={`Exportar ${p.name}`} title="Exportar" onClick={() => projects.exportOne(p.id)}><Download size={16} /></button>
        {confirm === p.id
          ? <button type="button" className="is-danger" aria-label={`Confirmar borrar ${p.name}`} onClick={() => { projects.remove(p.id); setConfirm(null); }}>¿Borrar?</button>
          : <button type="button" aria-label={`Borrar ${p.name}`} title="Borrar" onClick={() => setConfirm(p.id)}><Trash2 size={16} /></button>}
      </li>)}
    </ul>
  </FloatingWindow>;
}
