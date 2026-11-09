import {useMemo, useRef, useState} from 'react';
import {Download, Printer} from 'lucide-react';
import {bomCsv, buildDocumentation, toMarkdown, wiresCsv} from '../docs/generate.ts';
import type {ViewId} from '../model/ui';
import type {IndustryProject} from '../model/types.ts';

const save = (name: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'industria';

/** Documentación técnica generada del proyecto: materiales, cables, E/S del PLC, programa, redes y avisos. */
export default function DocsView({project, showIssues = true, onLocate, onView}: {project: IndustryProject; showIssues?: boolean; onLocate(id: string, view: ViewId): void; onView(view: ViewId): void}) {
  const date = new Date().toLocaleDateString('es-CL');
  const doc = useMemo(() => buildDocumentation(project, date), [project, date]);
  const base = slug(project.name);
  const body = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const needle = slug(query.trim());
  const matches = query.trim() ? project.entities.filter(e => slug(e.label).includes(needle)).slice(0, 10) : [];
  const jump = (section: string) => {
    const target = body.current?.querySelector<HTMLElement>('[data-doc-section="' + section + '"]');
    if (target) { target.scrollIntoView({block: 'start'}); target.focus({preventScroll: true}); }
  };
  return <section className="ind-docs rb-canvas-overlay" aria-label="Documentación técnica">
    <div className="ind-plc-head"><strong>Documentación</strong><span className="ind-note">Ficha de operación y anexos del proyecto</span>
      <button type="button" onClick={() => save(`${base}.documentacion.md`, toMarkdown(showIssues ? doc : {...doc, issues: []}), 'text/markdown')}><Download size={14} /> Documento (.md)</button>
      <button type="button" onClick={() => save(`${base}.materiales.csv`, bomCsv(doc), 'text/csv')}><Download size={14} /> Materiales (.csv)</button>
      <button type="button" onClick={() => save(`${base}.cables.csv`, wiresCsv(doc), 'text/csv')}><Download size={14} /> Cables (.csv)</button>
      <button type="button" onClick={() => window.print()}><Printer size={14} /> Imprimir</button></div>
    <div className="ind-chips ind-doc-index" role="group" aria-label="Secciones de documentación">
      {[['resumen', 'Resumen'], ['materiales', 'Materiales'], ['cables', 'Cables'], ['io', 'E/S'], ['programa', 'Programa'], ['redes', 'Redes'], ['pruebas', 'Pruebas y avisos']].map(([id, title]) => <button type="button" key={id} onClick={() => jump(id)}>{title}</button>)}
      <button type="button" onClick={() => onView('diagram')}>Abrir plano</button>
    </div>
    <div className="ind-docs-body" ref={body}>
      <section className="ind-doc-summary" data-doc-section="resumen" tabIndex={-1}>
        <h3>{doc.name}</h3>
        <p>{doc.purpose}</p>
        <div className="ind-doc-counts"><span><b>{project.entities.length}</b> componentes</span><span><b>{doc.wires.length}</b> conexiones</span><span><b>{doc.program.length}</b> PLC</span></div>
        <h4>Secuencia de revisión</h4>
        <ol>{doc.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <p className="ind-note">{doc.disclaimer}</p>
      </section>
      <div className="ind-related ind-doc-search">
        <label className="ind-field"><span>Buscar por referencia de componente</span><input value={query} placeholder="Ejemplo: KM1" onChange={e => setQuery(e.target.value)} /></label>
        {query.trim() && !matches.length && <p className="ind-note" role="status">No hay componentes con esa referencia.</p>}
        {matches.map(e => {
          const wires = project.connections.flatMap((c, i) => c.a.entityId === e.id || c.b.entityId === e.id ? [doc.wires[i]] : []);
          return <div className="ind-doc-result" key={e.id}>
            <div className="ind-chips"><strong>{e.label}</strong><button type="button" onClick={() => onLocate(e.id, 'plant')}>Ver en planta</button><button type="button" onClick={() => onLocate(e.id, 'diagram')}>Ver en diagrama</button></div>
            <ul>{wires.map(w => <li key={w.n}><b>{w.n}</b> {w.from} → {w.to}</li>)}</ul>
          </div>;
        })}
      </div>
      <h4 data-doc-section="materiales" tabIndex={-1}>1. Lista de materiales ({doc.bom.reduce((s, r) => s + r.quantity, 0)})</h4>
      {doc.bom.length === 0 ? <p className="ind-note">Sin componentes.</p> : <table aria-label="Lista de materiales"><thead><tr><th>Cant.</th><th>Pieza</th><th>Familia</th><th>Estado</th><th>Referencias</th></tr></thead>
        <tbody>{doc.bom.map(r => <tr key={r.definitionId}><td>{r.quantity}</td><td>{r.name}</td><td>{r.family}</td><td>{r.status}</td><td>{r.labels.join(' ')}</td></tr>)}</tbody></table>}
      <h4 data-doc-section="cables" tabIndex={-1}>2. Lista de cables ({doc.wires.length})</h4>
      {doc.wires.length === 0 ? <p className="ind-note">Sin cables.</p> : <table aria-label="Lista de cables"><thead><tr><th>N.º</th><th>Desde</th><th>Hasta</th><th>Tipo</th><th>Estado</th><th>Red</th></tr></thead>
        <tbody>{doc.wires.map(w => <tr key={w.n} data-status={w.status}><td>{w.n}</td><td>{w.from}</td><td>{w.to}</td><td>{w.kind}</td><td>{w.status}{w.notes ? ` · ${w.notes}` : ''}</td><td>{w.net}</td></tr>)}</tbody></table>}
      <h4 data-doc-section="io" tabIndex={-1}>3. Entradas y salidas del PLC</h4>
      {doc.io.length === 0 ? <p className="ind-note">No hay PLC en el proyecto.</p> : <table aria-label="Entradas y salidas"><thead><tr><th>PLC</th><th>Terminal</th><th>Tipo</th><th>Variable</th><th>Conectado a</th></tr></thead>
        <tbody>{doc.io.map(r => <tr key={`${r.plc}${r.terminal}`}><td>{r.plc}</td><td>{r.terminal}</td><td>{r.direction}</td><td>{r.tag || '—'}</td><td>{r.connectedTo || '—'}</td></tr>)}</tbody></table>}
      <h4 data-doc-section="programa" tabIndex={-1}>4. Programa del PLC</h4>
      {doc.program.length === 0 ? <p className="ind-note">No hay PLC en el proyecto.</p> : doc.program.map(x => <div key={x.plc}><b>{x.plc}</b><pre aria-label={`Programa de ${x.plc}`}>{x.lines.length ? x.lines.join('\n') : 'Sin líneas.'}</pre></div>)}
      <h4 data-doc-section="redes" tabIndex={-1}>5. Redes ({doc.nets.length})</h4>
      {doc.nets.length === 0 ? <p className="ind-note">Las redes aparecen al conectar terminales.</p> : <ul className="ind-nets" aria-label="Redes del documento">{doc.nets.map(n => <li key={n.id}><b>{n.id}</b> {n.terminals.join(' · ')}</li>)}</ul>}
      <h4 data-doc-section="pruebas" tabIndex={-1}>6. Pruebas y avisos ({doc.issues.length})</h4>
      <p className="ind-note">Las comprobaciones son del modelo didáctico. Usa PLC e Instrumentos para observar la respuesta durante la simulación.</p>
      {!showIssues ? <p className="ind-note">Los avisos de validación no se muestran en modo Prueba.</p> : doc.issues.length === 0 ? <p className="ind-note">Sin avisos de topología ni de programa.</p> : <ul className="ind-issues-list" role="list" aria-label="Avisos del documento">{doc.issues.map((i, k) => <li key={k}>{i}</li>)}</ul>}
      <p className="ind-note">{doc.genericCount} pieza(s) genéricas o sin verificar.</p>
    </div>
  </section>;
}
