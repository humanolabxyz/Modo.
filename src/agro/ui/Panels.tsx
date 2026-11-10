import {useEffect, useRef, useState} from 'react';
import {MapPin, X} from 'lucide-react';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity, Port, PropValue} from '../model/types.ts';
import {PORT_COLORS} from '../scene/EntityMesh.tsx';
import {sampleHeight} from '../terrain/heightfield.ts';
import type {WorldSession} from '../world/session.ts';
import type {ImpactReport} from '../world/impact.ts';
import type {Result} from '../model/types.ts';
import type {ReviewFocus} from '../scene/TerrainReview.tsx';

const num1 = new Intl.NumberFormat('es-CL', {maximumFractionDigits: 1, minimumFractionDigits: 1});
const KIND = {hydraulic: 'Hidráulico', power: 'Potencia', signal: 'Señal', mechanical: 'Mecánico'} as const;
const DIR = {in: 'entrada', out: 'salida', bidirectional: 'bidireccional'} as const;

function specText(p: Port): string {
  switch (p.kind) {
    case 'hydraulic': return `Ø ${p.spec.diameterMm} mm`;
    case 'power': return `${p.spec.current === 'ac' ? 'CA' : 'CC'} · ${p.spec.phases === 3 ? 'trifásica' : 'monofásica'} · ${p.spec.voltage} V`;
    case 'signal': return `${p.spec.signal === 'analog' ? 'analógica' : p.spec.signal === 'digital' ? 'digital' : 'datos'}${p.spec.level ? ` · ${p.spec.level}` : ''}`;
    default: return p.spec.mount;
  }
}

export function NumberField({label, unit, value, min, max, step, onCommit}: {label: string; unit: string; value: number; min: number; max: number; step: number; onCommit(v: number): void}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => { const v = Number(text.replace(',', '.')); if (Number.isFinite(v) && v !== value) onCommit(v); setText(String(value)); /* si se aceptó, el valor nuevo llega por `value`; si se rechazó, vuelve el anterior */ };
  return <label className="agro-field">{label}<span><input type="number" inputMode="decimal" value={text} min={min} max={max} step={step} aria-label={label} onChange={e => setText(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />{unit}</span></label>;
}

export function ConfirmDialog({title, children, confirmLabel, onConfirm, onCancel}: {title: string; children: React.ReactNode; confirmLabel: string; onConfirm(): void; onCancel(): void}) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onCancel]);
  return <div className="agro-modal" role="presentation" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="agro-dlg-title" data-testid="agro-confirm"><h3 id="agro-dlg-title">{title}</h3>{children}
      <div className="agro-dialog-actions"><button type="button" className="agro-ghost" onClick={onCancel} autoFocus>Cancelar</button><button type="button" className="agro-danger" onClick={onConfirm} data-testid="agro-confirm-ok">{confirmLabel}</button></div></div>
  </div>;
}

export function TerrainImpactDialog({report, focus, onLocate, onApply, onCancel}: {
  report: ImpactReport; focus: ReviewFocus | null; onLocate?: (focus: ReviewFocus) => void;
  onApply(option: 'reseat' | 'keep'): Result<true>; onCancel(): void;
}) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    cancel.current?.focus();
    return () => el.close();
  }, []);
  const apply = (option: 'reseat' | 'keep') => {
    const result = onApply(option);
    if (!result.ok) setError(result.error);
  };
  const blocked = report.entities.filter(e => e.blocker).length;
  const moving = report.entities.filter(e => !e.blocker && e.deltaY !== 0).length;
  const connections = report.connections.length;
  const row = (kind: ReviewFocus['kind'], id: string, label: string, detail: string, status?: string) => {
    const selected = focus?.kind === kind && focus.id === id;
    const body = <><strong>{label}</strong><small>{detail}</small>{status && <span className="agro-impact-flag">{status}</span>}</>;
    return <li key={id} data-impact-kind={kind}>
      {onLocate ? <button type="button" className="agro-impact-row" aria-pressed={selected} aria-label={`Localizar ${label}`} onClick={() => onLocate({kind, id})}>
        <span>{body}</span><MapPin size={16} aria-hidden="true" />
      </button> : <div className="agro-impact-row"><span>{body}</span></div>}
    </li>;
  };
  return <dialog ref={dialog} className="agro-impact" aria-labelledby="agro-impact-title" aria-describedby="agro-impact-intro"
    onCancel={e => { e.preventDefault(); onCancel(); }}>
    <header>
      <h3 id="agro-impact-title">Revisar edición de terreno</h3>
      <p id="agro-impact-intro">{onLocate ? 'Selecciona un elemento para ubicarlo en la escena.' : 'El trazo sigue en vista previa.'}</p>
      <p className="agro-impact-count"><strong>{report.entities.length}</strong> {report.entities.length === 1 ? 'instalación' : 'instalaciones'} · <strong>{connections}</strong> {connections === 1 ? 'conexión' : 'conexiones'}</p>
    </header>
    <div className="agro-impact-list" tabIndex={0} role="region" aria-label="Detalle de instalaciones y conexiones afectadas">
      {report.entities.length > 0 && <section>
        <h4>Instalaciones afectadas ({report.entities.length})</h4>
        <ul>{report.entities.map(e => row('entity', e.id, e.label, e.blocker ??
          (e.deltaY === 0 ? 'Conserva su cota al reasentar.' : Math.abs(e.deltaY) < 0.01 ? 'Se mueve menos de 1 cm al reasentar.' :
            `Al reasentar, ${e.deltaY > 0 ? 'sube' : 'baja'} ${Math.abs(e.deltaY).toLocaleString('es-CL', {maximumFractionDigits: 2})} m.`),
          e.blocker ? 'Queda pendiente incluso al reasentar' : undefined))}</ul>
      </section>}
      {connections > 0 && <section>
        <h4>Conexiones por revalidar ({connections})</h4>
        <ul>{report.connections.map(c => row('connection', c.id, c.label, c.warning ?? 'Se conserva y queda por revalidar con ambas opciones.'))}</ul>
      </section>}
    </div>
    <footer>
      {error && <p role="alert">{error}</p>}
      <div className="agro-impact-options">
        <div>
          <button type="button" className="agro-ghost" aria-describedby="agro-impact-keep" onClick={() => apply('keep')}>Aplicar y señalar</button>
          <small id="agro-impact-keep"><strong>0 se mueven.</strong> {report.entities.length} por revisar.</small>
        </div>
        <div>
          <button type="button" className="agro-primary" aria-describedby="agro-impact-reseat" disabled={blocked === report.entities.length} onClick={() => apply('reseat')}>Aplicar y reasentar</button>
          <small id="agro-impact-reseat"><strong>{moving} {moving === 1 ? 'se mueve' : 'se mueven'}.</strong> {blocked} por revisar.</small>
        </div>
      </div>
      {connections > 0 && <p className="agro-impact-network">{connections} {connections === 1 ? 'conexión por revalidar' : 'conexiones por revalidar'} con ambas opciones.</p>}
      <button ref={cancel} type="button" className="agro-ghost agro-impact-cancel" onClick={onCancel}>Cancelar</button>
    </footer>
  </dialog>;
}
