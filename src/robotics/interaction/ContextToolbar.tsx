import {Copy, Focus, Lock, LockOpen, Trash2} from 'lucide-react';

export type ContextAction = 'duplicate' | 'lock' | 'frame' | 'delete';

/** Barra contextual junto al objeto seleccionado (como la de Figma). En la etapa 2 se suman mover y rotar. */
export function ContextToolbar({at, count, locked, onAction}: {at: {x: number; y: number}; count: number; locked: boolean; onAction(action: ContextAction): void}) {
  return <div className="rb-context-toolbar rb-canvas-overlay" role="toolbar" aria-label={count > 1 ? `Acciones para ${count} objetos` : 'Acciones del objeto'} style={{left: at.x, top: at.y}} onKeyDown={e => e.stopPropagation()}>
    <button type="button" aria-label="Duplicar" title="Duplicar (Ctrl+D)" onClick={() => onAction('duplicate')}><Copy size={16} /></button>
    <button type="button" aria-label={locked ? 'Desbloquear' : 'Bloquear'} aria-pressed={locked} title={locked ? 'Desbloquear' : 'Bloquear'} onClick={() => onAction('lock')}>{locked ? <Lock size={16} /> : <LockOpen size={16} />}</button>
    <button type="button" aria-label="Encuadrar selección" title="Encuadrar (F)" onClick={() => onAction('frame')}><Focus size={16} /></button>
    <span aria-hidden="true" />
    <button type="button" aria-label="Borrar" title="Borrar (Supr)" className="is-danger" onClick={() => onAction('delete')}><Trash2 size={16} /></button>
  </div>;
}
