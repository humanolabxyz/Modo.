import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react';
import {Link2Off, Lock, LockOpen, Pencil, Plus, Search, TriangleAlert} from 'lucide-react';
import {CATALOG, CATEGORY_LABELS, getDefinition, searchCatalog} from '../catalog/index.ts';
import type {ComponentDefinition} from '../catalog/types.ts';
import {DEG, qFromEuler, qToEuler} from '../project/math.ts';
import {childAttachments, parentAttachment} from '../project/commands.ts';
import type {PartInstance, RobotProject, Transform, Vec3} from '../project/types.ts';

/** Todo lo que las ventanas de construcción necesitan del shell (RoboticsApp); así no conocen el estado del lienzo. */
export type BuildContext = {
  project: RobotProject;
  selection: string[];
  interfering: ReadonlySet<string>;
  select(ids: string[]): void;
  add(definitionId: string): void;
  startDrag(definitionId: string, event: ReactPointerEvent): void;
  rename(id: string, label: string): void;
  setLocked(ids: string[], locked: boolean): void;
  setTransform(id: string, transform: Transform): void;
  setProp(id: string, key: string, value: number | string | boolean): void;
  detach(attachmentId: string): void;
  setGroup(ids: string[], grouped: boolean): void;
  remove(ids: string[]): void;
  snap: {on: boolean; stepMm: number; setOn(on: boolean): void; setStepMm(mm: number): void};
};

const SOURCE_LABEL = {datasheet: 'ficha técnica', measured: 'medida del kit', approximate: 'aproximadas'} as const;
const mm = (m: number) => Math.round(m * 10000) / 10; // metros → mm con 0,1 mm de resolución

// ───────────── Piezas ─────────────
export function PartsPanel({ctx}: {ctx: BuildContext}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ComponentDefinition['category'] | 'all'>('all');
  const found = searchCatalog(query, category);
  const full = ctx.project.parts.length >= 200;
  return <div className="rb-parts">
    <label className="rb-search"><Search size={15} aria-hidden="true" /><input type="search" aria-label="Buscar pieza" placeholder="Buscar: motor, sensor, rueda…" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <div className="rb-chips" role="group" aria-label="Categorías">
      {(['all', ...Array.from(new Set(CATALOG.map(d => d.category)))] as const).map(c => <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c === 'all' ? 'Todas' : CATEGORY_LABELS[c]}</button>)}
    </div>
    <p className="rb-hint-line">Arrastra una pieza a la pizarra, o pulsa <b>Agregar</b>.</p>
    <ul className="rb-part-list" aria-label="Catálogo de piezas">
      {found.map(d => <li key={d.id} data-definition={d.id}>
        <div className="rb-part-card" onPointerDown={e => ctx.startDrag(d.id, e)}>
          <span className="rb-part-swatch" data-category={d.category} aria-hidden="true" />
          <span className="rb-part-text"><strong>{d.name}</strong><small>{d.summary}</small><small className="rb-part-dim">{d.dimensions.map(v => Math.round(v * 1000)).join(' × ')} mm · medidas {SOURCE_LABEL[d.dimensionsSource]}</small></span>
          <button data-inline-action="" type="button" className="rb-part-add" aria-label={`Agregar ${d.name}`} disabled={full} title={full ? 'Ya hay 200 piezas, el máximo del proyecto.' : 'Agregar a la pizarra'} onPointerDown={e => e.stopPropagation()} onClick={() => ctx.add(d.id)}><Plus size={17} /><span>Agregar</span></button>
        </div>
      </li>)}
      {!found.length && <li className="rb-part-none">No hay piezas que coincidan con «{query}».</li>}
    </ul>
  </div>;
}

// ───────────── Estructura ─────────────
function Row({part, depth, ctx}: {part: PartInstance; depth: number; ctx: BuildContext}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(part.label);
  useEffect(() => setDraft(part.label), [part.label]);
  const def = getDefinition(part.definitionId);
  const parent = parentAttachment(ctx.project, part.instanceId);
  const kids = childAttachments(ctx.project, part.instanceId);
  const selected = ctx.selection.includes(part.instanceId);
  const commit = () => { setEditing(false); if (draft.trim() && draft !== part.label) ctx.rename(part.instanceId, draft.trim()); else setDraft(part.label); };
  return <li role="treeitem" aria-selected={selected} aria-level={depth + 1} data-part={part.instanceId}>
    <div className={`rb-tree-row${selected ? ' is-selected' : ''}`} style={{paddingLeft: 8 + depth * 16}}>
      {editing
        ? <input autoFocus aria-label="Nombre de la pieza" value={draft} maxLength={60} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(part.label); setEditing(false); } }} />
        : <button data-inline-action="" type="button" className="rb-tree-name" onClick={e => ctx.select(e.shiftKey ? Array.from(new Set([...ctx.selection, part.instanceId])) : [part.instanceId])} onDoubleClick={() => setEditing(true)} title={def?.name}>{part.label}{part.groupId && <i className="rb-tree-group" title="Agrupada">grupo</i>}</button>}
      {ctx.interfering.has(part.instanceId) && <span className="rb-tree-warn" role="img" aria-label="Se superpone con otra pieza" title="Se superpone con otra pieza"><TriangleAlert size={14} /></span>}
      {parent && <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`Separar ${part.label} de su padre`} title="Separar de su padre" onClick={() => ctx.detach(parent.id)}><Link2Off size={14} /></button>}
      <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`Renombrar ${part.label}`} title="Renombrar" onClick={() => setEditing(true)}><Pencil size={14} /></button>
      <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`${part.locked ? 'Desbloquear' : 'Bloquear'} ${part.label}`} aria-pressed={!!part.locked} title={part.locked ? 'Desbloquear' : 'Bloquear'} onClick={() => ctx.setLocked([part.instanceId], !part.locked)}>{part.locked ? <Lock size={14} /> : <LockOpen size={14} />}</button>
    </div>
    {kids.length > 0 && <ul role="group">{kids.map(k => { const child = ctx.project.parts.find(x => x.instanceId === k.child.instanceId); return child ? <Row key={child.instanceId} part={child} depth={depth + 1} ctx={ctx} /> : null; })}</ul>}
  </li>;
}
export function StructurePanel({ctx}: {ctx: BuildContext}) {
  const roots = ctx.project.parts.filter(x => !parentAttachment(ctx.project, x.instanceId));
  if (!ctx.project.parts.length) return <div className="rb-window-empty"><strong>Todavía no hay piezas</strong><p>Agrega piezas desde <b>Piezas</b> y aquí verás qué cuelga de qué.</p></div>;
  return <>
    <ul role="tree" className="rb-tree" aria-label="Estructura del robot">{roots.map(r => <Row key={r.instanceId} part={r} depth={0} ctx={ctx} />)}</ul>
    <p className="rb-hint-line">Doble clic para renombrar. Mover una pieza con padre la separa; mover el padre arrastra a sus hijos.</p>
  </>;
}

// ───────────── Propiedades ─────────────
function NumberField({label, value, step, unit, disabled, onCommit}: {label: string; value: number; step: number; unit: string; disabled?: boolean; onCommit(v: number): void}) {
  const [draft, setDraft] = useState(String(value));
  const cancelled = useRef(false);
  useEffect(() => setDraft(String(value)), [value]);
  // Enter solo suelta el foco: el cambio se confirma una única vez, al perderlo (un paso de historial por edición).
  const commit = () => { if (cancelled.current) { cancelled.current = false; setDraft(String(value)); return; } const n = Number(draft); if (draft.trim() !== '' && Number.isFinite(n) && n !== value) onCommit(n); else setDraft(String(value)); };
  return <label className="rb-num"><span>{label}</span><input type="number" inputMode="decimal" step={step} value={draft} disabled={disabled} aria-label={`${label} (${unit})`} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { cancelled.current = true; (e.target as HTMLInputElement).blur(); } }} /><em>{unit}</em></label>;
}

export function PropertiesPanel({ctx}: {ctx: BuildContext}) {
  const chosen = ctx.project.parts.filter(x => ctx.selection.includes(x.instanceId));
  const snap = <fieldset className="rb-snap"><legend>Imán (snapping)</legend>
    <label><input type="checkbox" checked={ctx.snap.on} onChange={e => ctx.snap.setOn(e.target.checked)} /> Activado</label>
    <label>Paso <select aria-label="Paso del imán" value={ctx.snap.stepMm} onChange={e => ctx.snap.setStepMm(Number(e.target.value))}>{[1, 5, 10].map(v => <option key={v} value={v}>{v} mm</option>)}</select></label>
    <small>Al girar, el imán usa pasos de 15°.</small></fieldset>;
  if (!chosen.length) return <div className="rb-window-empty"><strong>Sin selección</strong><p>Selecciona una pieza de la pizarra para ver y cambiar sus propiedades.</p>{snap}</div>;
  if (chosen.length > 1) {
    const allLocked = chosen.every(x => x.locked), grouped = chosen.every(x => x.groupId && x.groupId === chosen[0].groupId);
    return <div className="rb-props-panel"><dl className="rb-props"><dt>Selección</dt><dd>{chosen.length} piezas</dd></dl>
      <div className="rb-props-actions"><button data-inline-action="" type="button" onClick={() => ctx.setLocked(ctx.selection, !allLocked)}>{allLocked ? 'Desbloquear' : 'Bloquear'}</button><button data-inline-action="" type="button" onClick={() => ctx.setGroup(ctx.selection, !grouped)}>{grouped ? 'Desagrupar' : 'Agrupar'}</button><button data-inline-action="" type="button" className="is-danger" onClick={() => ctx.remove(ctx.selection)}>Borrar</button></div>{snap}</div>;
  }
  const part = chosen[0], def = getDefinition(part.definitionId), t = part.transform, euler = qToEuler(t.rotation);
  const setPos = (axis: 0 | 1 | 2, millimetres: number) => { const p = [...t.position] as Vec3; p[axis] = millimetres / 1000; ctx.setTransform(part.instanceId, {position: p, rotation: t.rotation}); };
  const setRot = (axis: 0 | 1 | 2, degrees: number) => { const e = [...euler] as Vec3; e[axis] = degrees * DEG; ctx.setTransform(part.instanceId, {position: t.position, rotation: qFromEuler(e)}); };
  const parent = parentAttachment(ctx.project, part.instanceId);
  const parentPart = parent && ctx.project.parts.find(x => x.instanceId === parent.parent.instanceId);
  return <div className="rb-props-panel">
    <label className="rb-field"><span>Etiqueta</span><input aria-label="Etiqueta" defaultValue={part.label} key={part.instanceId + part.label} maxLength={60} onBlur={e => e.target.value.trim() && e.target.value !== part.label ? ctx.rename(part.instanceId, e.target.value.trim()) : (e.target.value = part.label)} onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} /></label>
    <p className="rb-def">{def?.name} · {def?.dimensions.map(v => Math.round(v * 1000)).join(' × ')} mm (medidas {def ? SOURCE_LABEL[def.dimensionsSource] : '—'}) · {def ? Math.round(def.massKg * 1000) : 0} g</p>
    <fieldset className="rb-xyz"><legend>Posición (mm)</legend>
      {(['X', 'Y', 'Z'] as const).map((a, i) => <NumberField key={a} label={a} unit="mm" step={ctx.snap.on ? ctx.snap.stepMm : 1} value={mm(t.position[i])} disabled={!!part.locked} onCommit={v => setPos(i as 0 | 1 | 2, v)} />)}</fieldset>
    <fieldset className="rb-xyz"><legend>Rotación (grados)</legend>
      {(['X', 'Y', 'Z'] as const).map((a, i) => <NumberField key={a} label={a} unit="°" step={ctx.snap.on ? 15 : 1} value={Math.round((euler[i] / DEG) * 100) / 100} disabled={!!part.locked} onCommit={v => setRot(i as 0 | 1 | 2, v)} />)}</fieldset>
    <label className="rb-check"><input type="checkbox" checked={!!part.locked} onChange={e => ctx.setLocked([part.instanceId], e.target.checked)} /> Bloqueada (no se mueve ni se borra)</label>
    {def?.props?.map(prop => prop.type === 'boolean' && <label className="rb-check" key={prop.id}><input type="checkbox" checked={Boolean(part.props?.[prop.id] ?? prop.default)} onChange={e => ctx.setProp(part.instanceId, prop.id, e.target.checked)} /> {prop.label}</label>)}
    {parent && parentPart && <p className="rb-attached">Unida a <b>{parentPart.label}</b> ({parent.kind === 'wheel-hinge' ? 'eje de rueda' : 'rígida'}). <button data-inline-action="" type="button" onClick={() => ctx.detach(parent.id)}>Separar</button></p>}
    {ctx.interfering.has(part.instanceId) && <p className="rb-warn"><TriangleAlert size={14} /> Se superpone con otra pieza. Es solo un aviso: puedes dejarla así.</p>}
    {snap}
  </div>;
}
