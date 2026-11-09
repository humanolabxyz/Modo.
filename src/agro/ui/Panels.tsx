import {useEffect, useState} from 'react';
import {X} from 'lucide-react';
import {itemById, sizeOf} from '../catalog/items.ts';
import type {Entity, Port, PropValue} from '../model/types.ts';
import {PORT_COLORS} from '../scene/EntityMesh.tsx';
import {sampleHeight} from '../terrain/heightfield.ts';
import type {WorldSession} from '../world/session.ts';

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
