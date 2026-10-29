import {useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react';
import {CircleAlert, CircleCheck, Info, Link2Off, Lock, LockOpen, Pencil, Plus, Search, Trash2, TriangleAlert} from 'lucide-react';
import {CATALOG, CATEGORY_LABELS, getDefinition, searchCatalog} from '../catalog/index.ts';
import type {ComponentDefinition} from '../catalog/types.ts';
import {DEG, qFromEuler, qToEuler} from '../project/math.ts';
import {childAttachments, parentAttachment} from '../project/commands.ts';
import type {Obstacle, PartInstance, PinRef, RobotProject, Transform, Vec3} from '../project/types.ts';
import type {Diagnostic} from '../circuit/diagnostics.ts';
import type {Reading} from '../circuit/solve.ts';
import type {CompileResult} from '../mcu/types.ts';
import type {Snapshot} from '../sim/coordinator.ts';
import type {SimStatus} from '../sim/useRobotSim.ts';

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
  // ───── etapa 3: cables, diagnóstico y medición
  diagnostics: Diagnostic[];
  wires: {id: string; label: string; color: string; a: PinRef; b: PinRef; route: Vec3[]}[];
  selectedWire: string | null;
  selectWire(id: string | null): void;
  deleteWire(id: string): void;
  setWireColor(id: string, color: string): void;
  setWireRoute(id: string, route: Vec3[]): void;
  /** Resalta en el lienzo los pines de un diagnóstico y encuadra. */
  showPins(refs: PinRef[]): void;
  clearHighlight(): void;
  highlighted: boolean;
  reading: {labelA: string; labelB: string; reading: Reading} | null;
  clearProbe(): void;
  tool: string;
  // ───── etapa 4: programa y simulación
  code: {
    boards: {id: string; label: string}[];
    target: string | null;
    setTarget(id: string): void;
    /** Texto actual del editor (el que se ve, aunque aún no se haya guardado en el proyecto). */
    source: string;
    setSource(text: string): void;
    artifact: NonNullable<RobotProject['firmware'][number]['artifact']> | undefined;
    /** null mientras se comprueba; false sin servicio (sin conexión o sitio sin compilador). */
    compilerAvailable: boolean | null;
    compile(text: string): Promise<CompileResult>;
    importHex(file: File): Promise<{ok: boolean; error?: string}>;
  };
  // ───── etapa 5: escenario de la simulación
  scene: {
    obstacles: Obstacle[]; friction: number; selected: string | null;
    /** Solo se edita con la simulación detenida. */
    editable: boolean;
    select(id: string | null): void;
    add(shape: 'box' | 'cylinder'): void;
    update(id: string, patch: {size?: Vec3; x?: number; z?: number; yawDeg?: number}): void;
    remove(id: string): void;
    setFriction(value: number): void;
  };
  sim: {status: SimStatus; snapshot: Snapshot | null; serial: string; message: string; ratio: number; lag: boolean; clearSerial(): void; labelOf(id: string): string};
};
export const WIRE_COLORS: {name: string; value: string}[] = [{name: 'Rojo', value: '#d64545'}, {name: 'Negro', value: '#222222'}, {name: 'Azul', value: '#2a67a3'}, {name: 'Amarillo', value: '#e0a52a'}, {name: 'Verde', value: '#2a8f4f'}, {name: 'Blanco', value: '#e8e8e8'}];

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
  const wire = ctx.selectedWire ? ctx.wires.find(w => w.id === ctx.selectedWire) : undefined;
  if (wire) return <WirePanel ctx={ctx} wire={wire} />;
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
    {def?.props?.map(prop => prop.type === 'number' && <div key={prop.id} className="rb-prop-number"><NumberField label={prop.id === 'voltage' ? 'Voltaje' : prop.id === 'ohms' ? 'Resistencia' : prop.id === 'testDistance' ? 'Distancia de prueba' : prop.label} unit={prop.id === 'voltage' ? 'V' : prop.id === 'ohms' ? 'Ω' : prop.id === 'testDistance' ? 'm' : ''} step={0.5} value={Number(part.props?.[prop.id] ?? prop.default)} onCommit={v => ctx.setProp(part.instanceId, prop.id, Math.min(prop.max ?? v, Math.max(prop.min ?? v, v)))} />{prop.id === 'voltage' && <small>Supuesto: 4×AA ≈ 6 V. Compruébalo con el kit del aula (D-11). El Arduino por VIN necesita ≥ 7 V.</small>}</div>)}
    {def?.props?.map(prop => prop.type === 'enum' && <label className="rb-field" key={prop.id}><span>{prop.label}</span><select aria-label={prop.label} value={String(part.props?.[prop.id] ?? prop.default)} onChange={e => ctx.setProp(part.instanceId, prop.id, e.target.value)}>{prop.options?.map(o => <option key={o} value={o}>{o}</option>)}</select></label>)}
    {def?.props?.map(prop => prop.type === 'boolean' && <label className="rb-check" key={prop.id}><input type="checkbox" checked={Boolean(part.props?.[prop.id] ?? prop.default)} onChange={e => ctx.setProp(part.instanceId, prop.id, e.target.checked)} /> {prop.label}</label>)}
    {parent && parentPart && <p className="rb-attached">Unida a <b>{parentPart.label}</b> ({parent.kind === 'wheel-hinge' ? 'eje de rueda' : 'rígida'}). <button data-inline-action="" type="button" onClick={() => ctx.detach(parent.id)}>Separar</button></p>}
    {ctx.interfering.has(part.instanceId) && <p className="rb-warn"><TriangleAlert size={14} /> Se superpone con otra pieza. Es solo un aviso: puedes dejarla así.</p>}
    {snap}
  </div>;
}

// ───────────── Cable seleccionado ─────────────
function WirePanel({ctx, wire}: {ctx: BuildContext; wire: BuildContext['wires'][number]}) {
  const set = (i: number, axis: 0 | 1 | 2, millimetres: number) => { const next = wire.route.map(q => [...q] as Vec3); next[i][axis] = millimetres / 1000; ctx.setWireRoute(wire.id, next); };
  return <div className="rb-props-panel">
    <p className="rb-wire-label" data-testid="wire-label"><b>Cable</b><span>{wire.label}</span></p>
    <fieldset className="rb-swatches"><legend>Color (solo estético: no cambia el circuito)</legend>
      {WIRE_COLORS.map(c => <button data-inline-action="" type="button" key={c.value} className="rb-swatch" style={{background: c.value}} aria-label={`Color ${c.name}`} aria-pressed={wire.color === c.value} title={c.name} onClick={() => ctx.setWireColor(wire.id, c.value)} />)}</fieldset>
    <fieldset className="rb-xyz"><legend>Puntos de control (mm, mundo)</legend>
      {wire.route.length === 0 && <small className="rb-hint-line">Sin puntos: el cable hace una curva suave entre sus pines.</small>}
      {wire.route.map((q, i) => <div className="rb-route-row" key={i}>{([0, 1, 2] as const).map(a => <NumberField key={a} label={['X', 'Y', 'Z'][a]} unit={`mm p${i + 1}`} step={1} value={mm(q[a])} onCommit={v => set(i, a, v)} />)}
        <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`Quitar punto ${i + 1}`} onClick={() => ctx.setWireRoute(wire.id, wire.route.filter((_, k) => k !== i))}><Trash2 size={14} /></button></div>)}
      <button data-inline-action="" type="button" className="rb-add-point" onClick={() => ctx.setWireRoute(wire.id, [...wire.route, wire.route.at(-1) ?? [0, 0.05, 0]])}><Plus size={14} /> Agregar punto</button>
    </fieldset>
    <div className="rb-props-actions"><button type="button" className="is-danger" onClick={() => ctx.deleteWire(wire.id)}>Borrar cable</button><button type="button" onClick={() => ctx.selectWire(null)}>Listo</button></div>
  </div>;
}

// ───────────── Consola: diagnóstico, cables y medición ─────────────
const SEVERITY = {error: {icon: CircleAlert, label: 'Error'}, warning: {icon: TriangleAlert, label: 'Aviso'}, info: {icon: Info, label: 'Info'}} as const;
export function ConsolePanel({ctx}: {ctx: BuildContext}) {
  const [tab, setTab] = useState<'diag' | 'serial'>('diag');
  const errors = ctx.diagnostics.filter(d => d.severity === 'error').length, warnings = ctx.diagnostics.filter(d => d.severity === 'warning').length;
  return <div className="rb-console">
    <div className="rb-tabs" role="tablist" aria-label="Consola">
      <button data-inline-action="" type="button" role="tab" aria-selected={tab === 'diag'} onClick={() => setTab('diag')}>Diagnóstico{errors + warnings > 0 && <i>{errors + warnings}</i>}</button>
      <button data-inline-action="" type="button" role="tab" aria-selected={tab === 'serial'} onClick={() => setTab('serial')}>Serie y estado</button>
    </div>
    {tab === 'serial' ? <SerialPanel ctx={ctx} /> : <>
      {ctx.reading && <div className="rb-reading-card" role="status" aria-label="Medición"><b>Medición</b><span>{ctx.reading.labelA} <em>(rojo)</em></span><span>{ctx.reading.labelB} <em>(negro)</em></span>
        <strong>{ctx.reading.reading.volts === null ? '— V' : `${ctx.reading.reading.volts.toFixed(2).replace('.', ',')} V`}<small>{ctx.reading.reading.continuity ? ' · continuidad ✔' : ' · sin continuidad'}</small></strong><small>{ctx.reading.reading.note}</small>
        <button data-inline-action="" type="button" onClick={ctx.clearProbe}>Nueva medición</button></div>}
      {ctx.project.parts.length === 0 ? <div className="rb-window-empty"><strong>Nada que revisar</strong><p>Agrega piezas y únelas con cables (herramienta Cable, tecla W).</p></div>
        : ctx.diagnostics.length === 0 ? <p className="rb-diag-ok"><CircleCheck size={16} /> Sin errores ni avisos en el circuito{ctx.wires.length === 0 ? ' (todavía no hay cables)' : ''}.</p>
        : <>
          <p className="rb-hint-line">{errors} error(es) · {warnings} aviso(s). Pulsa uno para ver los pines implicados.</p>
          <ul className="rb-diag-list" aria-label="Diagnósticos">{ctx.diagnostics.map((d, i) => { const Icon = SEVERITY[d.severity].icon; return <li key={i}><button data-inline-action="" type="button" className={`rb-diag is-${d.severity}`} data-code={d.code} onClick={() => ctx.showPins(d.refs)}><Icon size={16} aria-label={SEVERITY[d.severity].label} /><span>{d.message}</span></button></li>; })}</ul>
          {ctx.highlighted && <button data-inline-action="" type="button" className="rb-clear-highlight" onClick={ctx.clearHighlight}>Quitar resaltado</button>}</>}
      {ctx.wires.length > 0 && <><h4 className="rb-subhead">Cables ({ctx.wires.length})</h4>
        <ul className="rb-wire-list" aria-label="Cables">{ctx.wires.map(w => <li key={w.id} className={w.id === ctx.selectedWire ? 'is-selected' : undefined}>
          <button data-inline-action="" type="button" className="rb-wire-pick" onClick={() => ctx.selectWire(w.id)}><i style={{background: w.color}} aria-hidden="true" /><span>{w.label}</span></button>
          <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`Borrar cable ${w.label}`} onClick={() => ctx.deleteWire(w.id)}><Trash2 size={14} /></button></li>)}</ul></>}
    </>}
  </div>;
}

const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d).replace('.', ',') : '∞');

// ───────────── Escenario: obstáculos y fricción ─────────────
const yawOf = (o: Obstacle) => { const [, y, , w] = o.transform.rotation; return Math.round(2 * Math.atan2(y, w) * 180 / Math.PI * 10) / 10; };
export function ScenePanel({ctx}: {ctx: BuildContext}) {
  const sc = ctx.scene, sel = sc.obstacles.find(o => o.id === sc.selected) ?? null, cm = (m: number) => Math.round(m * 1000) / 10;
  return <div className="rb-scene">
    <p className="rb-hint-line">Cuarto blanco de 4 × 4 m. El robot sale de donde lo armaste{sc.editable ? '.' : '; detén la simulación (■) para cambiar el escenario.'}</p>
    <div className="rb-scene-add">
      <button data-inline-action="" type="button" disabled={!sc.editable} onClick={() => sc.add('box')}><Plus size={14} /> Caja</button>
      <button data-inline-action="" type="button" disabled={!sc.editable} onClick={() => sc.add('cylinder')}><Plus size={14} /> Cilindro</button>
    </div>
    {sc.obstacles.length === 0 ? <div className="rb-window-empty"><strong>Sin obstáculos</strong><p>Agrega una caja delante del robot para probar un programa que la evite.</p></div>
      : <ul className="rb-wire-list" aria-label="Obstáculos">{sc.obstacles.map((o, i) => <li key={o.id} className={o.id === sc.selected ? 'is-selected' : undefined}>
        <button data-inline-action="" type="button" className="rb-wire-pick" onClick={() => sc.select(o.id === sc.selected ? null : o.id)}><span>{o.shape === 'box' ? 'Caja' : 'Cilindro'} {i + 1}</span></button>
        <button data-inline-action="" type="button" className="rb-tree-btn" aria-label={`Borrar obstáculo ${i + 1}`} disabled={!sc.editable} onClick={() => sc.remove(o.id)}><Trash2 size={14} /></button></li>)}</ul>}
    {sel && <fieldset className="rb-fields" disabled={!sc.editable}><legend>Posición y tamaño</legend>
      <NumberField label="X" unit="cm" step={1} value={cm(sel.transform.position[0])} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {x: v / 100})} />
      <NumberField label="Z" unit="cm" step={1} value={cm(sel.transform.position[2])} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {z: v / 100})} />
      <NumberField label={sel.shape === 'box' ? 'Ancho' : 'Diámetro'} unit="cm" step={1} value={cm(sel.size[0])} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {size: sel.shape === 'box' ? [v / 100, sel.size[1], sel.size[2]] : [v / 100, sel.size[1], v / 100]})} />
      {sel.shape === 'box' && <NumberField label="Fondo" unit="cm" step={1} value={cm(sel.size[2])} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {size: [sel.size[0], sel.size[1], v / 100]})} />}
      <NumberField label="Alto" unit="cm" step={1} value={cm(sel.size[1])} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {size: [sel.size[0], v / 100, sel.size[2]]})} />
      {sel.shape === 'box' && <NumberField label="Giro" unit="°" step={5} value={yawOf(sel)} disabled={!sc.editable} onCommit={v => sc.update(sel.id, {yawDeg: v})} />}
    </fieldset>}
    <fieldset className="rb-fields" disabled={!sc.editable}><legend>Suelo</legend>
      <NumberField label="Fricción" unit="" step={0.05} value={Math.round(sc.friction * 100) / 100} disabled={!sc.editable} onCommit={sc.setFriction} />
    </fieldset>
    <p className="rb-hint-line">La física es aproximada (motores TT, 4 pilas): sirve para entender causas y efectos, no para predecir un robot real al milímetro.</p>
  </div>;
}
/** Monitor serie mínimo (4.3) y estado del circuito simulado: todo sale del modelo, no de animaciones. */
function SerialPanel({ctx}: {ctx: BuildContext}) {
  const {sim} = ctx, snap = sim.snapshot, off = sim.status === 'stopped';
  const pins = snap ? Object.entries(snap.pins).filter(([, p]) => p.mode === 'out').sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)) || a[0].localeCompare(b[0])) : [];
  return <div className="rb-serial">
    <p className="rb-sim-state" role="status" data-sim={sim.status}>{off ? 'Detenida. Pulsa ▶ en la barra para ejecutar el programa.' : sim.status === 'paused' ? 'En pausa.' : `En marcha · tiempo virtual ${snap ? fmt(snap.simTimeUs / 1e6, 1) : '0,0'} s${sim.lag ? ` · va lenta (×${fmt(sim.ratio)} del tiempo real)` : ''}`}</p>
    {sim.message && <p className="rb-warn"><TriangleAlert size={14} /> {sim.message}</p>}
    <h4 className="rb-subhead">Monitor serie</h4>
    <pre className="rb-serial-out" aria-label="Salida serie" tabIndex={0}>{sim.serial || (off ? '' : '(sin salida todavía)')}</pre>
    <button data-inline-action="" type="button" className="rb-clear-highlight" onClick={sim.clearSerial}>Limpiar</button>
    {snap && <><h4 className="rb-subhead">Estado</h4>
      <ul className="rb-state-list">
        <li>Placa: {snap.uno.powered ? `alimentada (${snap.uno.via === 'vin' ? 'por VIN' : snap.uno.via === 'usb' ? 'por USB virtual' : 'por el pin 5V'})` : 'SIN alimentación'}</li>
        {pins.map(([id, p]) => <li key={id}>{id}: {p.level > 0.99 ? 'ALTO' : p.level < 0.01 ? 'BAJO' : `PWM ${fmt(p.level * 100, 0)} %`}</li>)}
        {Object.entries(snap.leds).map(([id, l]) => <li key={id}>{sim.labelOf(id)}: {l.on ? `encendido (${fmt(l.amps * 1000, 1)} mA)` : 'apagado'}{l.overcurrent ? ' · ¡sobrecorriente!' : ''}</li>)}
        {snap.physics?.wheels.map(w => <li key={w.wheelId}>{sim.labelOf(w.wheelId)}: {fmt(w.omega, 1)} rad/s · par {fmt(w.torque * 1000, 0)} mN·m</li>)}
        {Object.entries(snap.motors).map(([id, m]) => <li key={id}>{sim.labelOf(id)}: {fmt(m.volts)} V {Math.abs(m.volts) < 0.05 ? '(parado)' : m.volts > 0 ? '(adelante)' : '(atrás)'}</li>)}
        {Object.entries(snap.sensors).map(([id, s]) => <li key={id}>{sim.labelOf(id)}: {s.linked && s.powered ? `distancia ${snap.physics?.sensors[id] ? 'medida' : 'de prueba'} ${Number.isFinite(s.distance) ? `${fmt(s.distance)} m` : '(sin obstáculo a la vista)'} · ecos ${s.echoes}${s.lastEchoUs ? ` · último ${Math.round(s.lastEchoUs)} µs` : ''}` : `no responde — ${s.reason ?? 'sin conexión'}`}</li>)}
      </ul></>}
  </div>;
}
