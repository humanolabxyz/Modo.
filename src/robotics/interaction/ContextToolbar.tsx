import {Copy, Focus, Link, Lock, LockOpen, Move3d, Rotate3d, Trash2} from 'lucide-react';

export type ContextAction = 'duplicate' | 'lock' | 'frame' | 'delete' | 'move' | 'rotate' | 'join';

/** Barra contextual junto a la selección (como la de Figma): mover, rotar, unir, duplicar, bloquear, encuadrar y borrar. */
export function ContextToolbar({at, count, locked, tool, canJoin, onAction}: {at: {x: number; y: number}; count: number; locked: boolean; tool: string; canJoin: boolean; onAction(action: ContextAction): void}) {
  return <div className="rb-context-toolbar rb-canvas-overlay" role="toolbar" aria-label={count > 1 ? `Acciones para ${count} objetos` : 'Acciones del objeto'} style={{left: at.x, top: at.y}} onKeyDown={e => e.stopPropagation()}>
    <button type="button" aria-label="Mover" aria-pressed={tool === 'move'} title="Mover (G)" onClick={() => onAction('move')}><Move3d size={16} /></button>
    <button type="button" aria-label="Rotar" aria-pressed={tool === 'rotate'} title="Rotar (R)" onClick={() => onAction('rotate')}><Rotate3d size={16} /></button>
    {canJoin && <button type="button" className="is-join" aria-label="Unir" title="Unir a la pieza cercana (U)" onClick={() => onAction('join')}><Link size={16} /><span>Unir</span></button>}
    <span aria-hidden="true" />
    <button type="button" aria-label="Duplicar" title="Duplicar (Ctrl+D)" onClick={() => onAction('duplicate')}><Copy size={16} /></button>
    <button type="button" aria-label={locked ? 'Desbloquear' : 'Bloquear'} aria-pressed={locked} title={locked ? 'Desbloquear' : 'Bloquear'} onClick={() => onAction('lock')}>{locked ? <Lock size={16} /> : <LockOpen size={16} />}</button>
    <button type="button" aria-label="Encuadrar selección" title="Encuadrar (F)" onClick={() => onAction('frame')}><Focus size={16} /></button>
    <span aria-hidden="true" />
    <button type="button" aria-label="Borrar" title="Borrar (Supr)" className="is-danger" onClick={() => onAction('delete')}><Trash2 size={16} /></button>
  </div>;
}
