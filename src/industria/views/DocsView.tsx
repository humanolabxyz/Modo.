import {useMemo} from 'react';
import {Download, Printer} from 'lucide-react';
import {bomCsv, buildDocumentation, toMarkdown, wiresCsv} from '../docs/generate.ts';
import type {IndustryProject} from '../model/types.ts';

const save = (name: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob(['﻿' + text], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'industria';

/** Documentación técnica generada del proyecto: materiales, cables, E/S del PLC, programa, redes y avisos. */
export default function DocsView({project, showIssues = true}: {project: IndustryProject; showIssues?: boolean}) {
  const date = new Date().toLocaleDateString('es-CL');
  const doc = useMemo(() => buildDocumentation(project, date), [project, date]);
  const base = slug(project.name);
  return <section className="ind-docs rb-canvas-overlay" aria-label="Documentación técnica">
    <div className="ind-plc-head"><strong>Documentación</strong><span className="ind-note">Se genera sola desde el proyecto: cambia el proyecto y cambia el documento.</span>
      <button type="button" onClick={() => save(`${base}.documentacion.md`, toMarkdown(doc), 'text/markdown')}><Download size={14} /> Documento (.md)</button>
      <button type="button" onClick={() => save(`${base}.materiales.csv`, bomCsv(doc), 'text/csv')}><Download size={14} /> Materiales (.csv)</button>
      <button type="button" onClick={() => save(`${base}.cables.csv`, wiresCsv(doc), 'text/csv')}><Download size={14} /> Cables (.csv)</button>
      <button type="button" onClick={() => window.print()}><Printer size={14} /> Imprimir</button></div>
    <div className="ind-docs-body">
      <h3>{doc.name}</h3>
      <p className="ind-note">{doc.disclaimer}</p>
      <h4>1. Lista de materiales ({doc.bom.reduce((s, r) => s + r.quantity, 0)})</h4>
      {doc.bom.length === 0 ? <p className="ind-note">Sin componentes.</p> : <table aria-label="Lista de materiales"><thead><tr><th>Cant.</th><th>Pieza</th><th>Familia</th><th>Estado</th><th>Referencias</th></tr></thead>
        <tbody>{doc.bom.map(r => <tr key={r.definitionId}><td>{r.quantity}</td><td>{r.name}</td><td>{r.family}</td><td>{r.status}</td><td>{r.labels.join(' ')}</td></tr>)}</tbody></table>}
      <h4>2. Lista de cables ({doc.wires.length})</h4>
      {doc.wires.length === 0 ? <p className="ind-note">Sin cables.</p> : <table aria-label="Lista de cables"><thead><tr><th>N.º</th><th>Desde</th><th>Hasta</th><th>Tipo</th><th>Estado</th><th>Red</th></tr></thead>
        <tbody>{doc.wires.map(w => <tr key={w.n} data-status={w.status}><td>{w.n}</td><td>{w.from}</td><td>{w.to}</td><td>{w.kind}</td><td>{w.status}{w.notes ? ` · ${w.notes}` : ''}</td><td>{w.net}</td></tr>)}</tbody></table>}
      <h4>3. Entradas y salidas del PLC</h4>
      {doc.io.length === 0 ? <p className="ind-note">No hay PLC en el proyecto.</p> : <table aria-label="Entradas y salidas"><thead><tr><th>PLC</th><th>Terminal</th><th>Tipo</th><th>Variable</th><th>Conectado a</th></tr></thead>
        <tbody>{doc.io.map(r => <tr key={`${r.plc}${r.terminal}`}><td>{r.plc}</td><td>{r.terminal}</td><td>{r.direction}</td><td>{r.tag || '—'}</td><td>{r.connectedTo || '—'}</td></tr>)}</tbody></table>}
      <h4>4. Programa del PLC</h4>
      {doc.program.length === 0 ? <p className="ind-note">No hay PLC en el proyecto.</p> : doc.program.map(x => <div key={x.plc}><b>{x.plc}</b><pre aria-label={`Programa de ${x.plc}`}>{x.lines.length ? x.lines.join('\n') : 'Sin líneas.'}</pre></div>)}
      <h4>5. Redes ({doc.nets.length})</h4>
      {doc.nets.length === 0 ? <p className="ind-note">Las redes aparecen al conectar terminales.</p> : <ul className="ind-nets" aria-label="Redes del documento">{doc.nets.map(n => <li key={n.id}><b>{n.id}</b> {n.terminals.join(' · ')}</li>)}</ul>}
      <h4>6. Avisos ({doc.issues.length})</h4>
      {!showIssues ? <p className="ind-note">Los avisos de validación no se muestran en modo Prueba.</p> : doc.issues.length === 0 ? <p className="ind-note">Sin avisos de topología ni de programa.</p> : <ul className="ind-issues-list" role="list" aria-label="Avisos del documento">{doc.issues.map((i, k) => <li key={k}>{i}</li>)}</ul>}
      <p className="ind-note">{doc.genericCount} pieza(s) genéricas o sin verificar.</p>
    </div>
  </section>;
}
