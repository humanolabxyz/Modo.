import {lazy, Suspense, useState} from 'react';
import {Box, ChevronDown, Plus, Search} from 'lucide-react';
import type {ShapeDef} from '../build/shapes.ts';
import {GENERIC_NOTE, STATUS_LABEL} from '../build/shapes.ts';
import {countByFamily, FAMILIES, searchItems} from '../catalog/search.ts';
import {ErrorBoundary} from '../ErrorBoundary';

const PartPreview = lazy(() => import('../scene/PartPreview'));
const counts = countByFamily();

function PartCard({part, disabled, supported, onAdd}: {part: ShapeDef; disabled: boolean; supported: boolean; onAdd(id: string): void}) {
  const [preview, setPreview] = useState(false);

  return <li data-item={part.id}>
    <button type="button" disabled={disabled} onClick={() => onAdd(part.id)} title={`Colocar «${part.name}»`}>
      <img className="ind-part-image" src={`/industria/components/${part.id}.webp`} alt="" width={320} height={240} loading="lazy" decoding="async" />
      <span className="ind-part-name"><strong>{part.name}</strong><small>{STATUS_LABEL[part.status]}</small></span>
      <span className="ind-part-add" aria-hidden="true"><Plus size={16} /></span>
    </button>
    <details className="ind-item-info" name="ind-part-details" onToggle={event => { if (!event.currentTarget.open) setPreview(false); }}>
      <summary aria-label={`${supported ? 'Ficha y vista 3D' : 'Ficha'} de ${part.name}`}>{supported ? 'Ficha y vista 3D' : 'Ficha'} <ChevronDown size={14} aria-hidden="true" /></summary>
      <div className="ind-part-details">
        {supported && <button type="button" className="ind-preview-toggle" aria-expanded={preview} onClick={() => setPreview(!preview)}><Box size={15} aria-hidden="true" />{preview ? 'Cerrar vista 3D' : 'Girar en 3D'}</button>}
        {preview && <ErrorBoundary label="Vista de la pieza"><Suspense fallback={<p className="ind-note" role="status">Abriendo el modelo…</p>}>
          <PartPreview definitionId={part.id} name={part.name} />
        </Suspense></ErrorBoundary>}
        <p className="ind-note">{part.description}</p>
        <p className="ind-note">Medidas de ejemplo: {part.size.map(v => Math.round(v * 1000)).join(' × ')} mm. {part.status === 'verified' && part.source ? `Fuente: ${part.source.ref}.` : 'Sin fuente de fabricante.'}</p>
        {part.terminals && <p className="ind-note"><b>Terminales:</b> {part.terminals.map(t => t.label).join(' · ')}<br />{part.terminalSource}</p>}
      </div>
    </details>
  </li>;
}

export default function PartsLibrary({query, family, disabled, supported, onQuery, onFamily, onAdd}: {
  query: string; family: string | null; disabled: boolean; supported: boolean;
  onQuery(value: string): void; onFamily(value: string | null): void; onAdd(id: string): void;
}) {
  const results = searchItems(query, family);
  return <div className="ind-panel ind-library">
    <div className="ind-library-filters">
      <label className="ind-search-wrap">
        <Search size={17} aria-hidden="true" />
        <input type="search" className="ind-search" placeholder="Nombre, familia o terminal" aria-label="Buscar en la biblioteca" value={query} onChange={event => onQuery(event.target.value)} />
      </label>
      <label className="ind-field">
        <span>Familia</span>
        <select value={family ?? ''} onChange={event => onFamily(event.target.value || null)}>
          <option value="">Todas las familias</option>
          {FAMILIES.map(name => <option key={name} value={name} disabled={counts[name] === 0}>{name} ({counts[name]})</option>)}
        </select>
      </label>
    </div>
    <p className="ind-results" role="status">{results.length === 0 ? `Ninguna pieza coincide con «${query}»${family ? ` en ${family}` : ''}.` : `${results.length} ${results.length === 1 ? 'pieza' : 'piezas'}`}</p>
    <ul className="ind-shapes" aria-label="Resultados">
      {results.map(part => <PartCard key={part.id} part={part} disabled={disabled} supported={supported} onAdd={onAdd} />)}
    </ul>
    <p className="ind-note">{GENERIC_NOTE} Usa «Mover pieza» para llevarla a un anclaje (punto verde).</p>
  </div>;
}
