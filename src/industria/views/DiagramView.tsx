import {useMemo, useRef, useState} from 'react';
import {Download, Minus, Plus, Printer, Wand2} from 'lucide-react';
import {shapeOf} from '../build/shapes.ts';
import {autoLayout, bounds, crossPageStubs, electricalEntities, pageOf, pagesOf, pathOf, PAGE_TITLES, PIN_GAP, placementOf, symbolGeom, wirePoints, type XY} from '../diagram/layout.ts';
import type {ViewId} from '../model/ui';
import type {IndustryProject} from '../model/types.ts';
import {operableKind, type SimResult} from '../sim/engine.ts';
import type {Evaluation} from '../wiring/engine.ts';

const KIND_COLOR: Record<string, string> = {power: '#c0392b', control: '#2d6ff4', signal: '#8e5bd6', earth: '#b8a100', pipe: '#555f6d'};

export type DiagramViewProps = {
  project: IndustryProject; selection: readonly string[]; sim: SimResult | null; simRunning: boolean; evaluation: Evaluation; pickedConn: string | null; editable: boolean;
  onSelect(ids: string[]): void; onLocate(id: string, view: ViewId): void; onPick(id: string | null): void; onMove(id: string, at: XY): void; onMovePage(id: string, page: number): void; onArrange(): void; onOperate(id: string, down: boolean): void;
};

const pageName = (page: number) => `Hoja ${page}${PAGE_TITLES[page - 1] ? ` · ${PAGE_TITLES[page - 1]}` : ''}`;

/** Esquema funcional generado del modelo, por hojas: mismos ids que el 3D. Los símbolos son bloques genéricos (no IEC 60617). */
export default function DiagramView({project, selection, sim, simRunning, evaluation, pickedConn, editable, onSelect, onLocate, onPick, onMove, onMovePage, onArrange, onOperate}: DiagramViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pageChoice, setPageChoice] = useState(() => selection[0] ? pageOf(project, selection[0], autoLayout(project)) : 1);
  const [drag, setDrag] = useState<{id: string; x: number; y: number} | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const auto = useMemo(() => autoLayout(project), [project]);
  const pages = useMemo(() => pagesOf(project, auto), [project, auto]);
  const page = Math.min(pageChoice, pages.length);
  const view = useMemo(() => (drag ? {...project, symbols: {...project.symbols, [drag.id]: [{page: pageOf(project, drag.id, auto), x: drag.x, y: drag.y}]}} : project), [project, drag, auto]);
  const {w, h} = bounds(view, page, auto), entities = electricalEntities(project), here = entities.filter(e => pageOf(view, e.id, auto) === page);
  const stubs = useMemo(() => crossPageStubs(view, page, auto), [view, page, auto]);
  const selected = project.entities.find(e => selection.length === 1 && e.id === selection[0] && entities.some(x => x.id === e.id));

  const picked = project.connections.find(c => c.id === pickedConn);
  const trace = evaluation.nets.find(n => n.connections.includes(pickedConn ?? ''));
  const endLabel = (id: string, terminal: string) => (project.entities.find(e => e.id === id)?.label ?? id) + '.' + terminal;
  const focusId = selected?.id ?? picked?.a.entityId;
  const start = (id: string, e: React.PointerEvent) => {
    e.stopPropagation(); onSelect([id]);
    const def = project.entities.find(x => x.id === id)?.definitionId ?? '';
    if (simRunning && operableKind(def)) { onOperate(id, true); const up = () => { removeEventListener('pointerup', up); onOperate(id, false); }; addEventListener('pointerup', up); return; }
    if (!editable) return;
    const at = placementOf(project, id, auto), box = svg.current!.getBoundingClientRect();
    const off = {x: (e.clientX - box.left) / zoom - at.x, y: (e.clientY - box.top) / zoom - at.y};
    let moved = false, last: XY = at;
    const move = (ev: PointerEvent) => {
      const nx = Math.max(0, (ev.clientX - box.left) / zoom - off.x), ny = Math.max(0, (ev.clientY - box.top) / zoom - off.y);
      if (!moved && Math.hypot(nx - at.x, ny - at.y) < 4) return;
      moved = true; last = {x: nx, y: ny}; setDrag({id, ...last});
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); setDrag(null); if (moved) onMove(id, last); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  };

  const exportSvg = () => {
    const el = svg.current; if (!el) return;
    const clone = el.cloneNode(true) as SVGSVGElement, ns = 'http://www.w3.org/2000/svg';
    clone.setAttribute('xmlns', ns); clone.setAttribute('width', String(w)); clone.setAttribute('height', String(h));
    const style = document.createElementNS(ns, 'style'); style.textContent = '.ind-sym-label{font:700 14px sans-serif;fill:#14181f}.ind-sym-sub{font:11px sans-serif;fill:#667487}.ind-pin-label{font:700 10px sans-serif;fill:#44536a}.ind-ref-label{font:600 11px sans-serif;fill:#44536a}';
    const bg = document.createElementNS(ns, 'rect'); bg.setAttribute('width', String(w)); bg.setAttribute('height', String(h)); bg.setAttribute('fill', '#ffffff');
    clone.insertBefore(bg, clone.firstChild); clone.insertBefore(style, clone.firstChild);
    clone.querySelectorAll('[data-connection] path[stroke="transparent"]').forEach(n => n.remove());
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], {type: 'image/svg+xml'}));
    const a = document.createElement('a'); a.href = url; a.download = `${project.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'industria'}.esquema-hoja${page}.svg`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="ind-diagram rb-canvas-overlay" aria-label="Diagrama esquemático">
    <div className="ind-diagram-bar">
      <strong>Diagrama</strong>
      <span className="ind-note">Esquema funcional del proyecto; los símbolos son bloques genéricos (sin simbología IEC 60617).</span>
      <button type="button" onClick={onArrange} disabled={!editable || entities.length === 0} title="Recoloca los símbolos en hojas y filas, ordenados para reducir cruces"><Wand2 size={15} /> Ordenar</button>
      <button type="button" onClick={exportSvg} disabled={entities.length === 0} title="Descarga esta hoja como imagen vectorial"><Download size={15} /> Esquema (.svg)</button>
      <button type="button" onClick={() => window.print()} disabled={entities.length === 0}><Printer size={15} /> Imprimir</button>
      <button type="button" aria-label="Alejar" onClick={() => setZoom(z => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}><Minus size={15} /></button>
      <span className="ind-zoom" aria-live="polite">{Math.round(zoom * 100)}%</span>
      <button type="button" aria-label="Acercar" onClick={() => setZoom(z => Math.min(2, Math.round((z + 0.25) * 100) / 100))}><Plus size={15} /></button>
    </div>
    <div className="ind-pages" role="tablist" aria-label="Hojas del esquema">
      {pages.map(n => <button type="button" role="tab" key={n} aria-selected={n === page} onClick={() => setPageChoice(n)}>{pageName(n)}</button>)}
      {selected && <label className="ind-page-move"><span>Mover «{selected.label}» a</span>
        <select aria-label={`Hoja de ${selected.label}`} value={pageOf(project, selected.id, auto)} disabled={!editable} onChange={e => { const n = Number(e.target.value); onMovePage(selected.id, n); setPageChoice(n); }}>
          {[...pages, pages.length + 1].map(n => <option key={n} value={n}>{n > pages.length ? `Hoja ${n} (nueva)` : pageName(n)}</option>)}</select></label>}
    </div>
    {(focusId || picked) && <div className="ind-related ind-trace">
      {picked && <strong>{endLabel(picked.a.entityId, picked.a.terminalId)} → {endLabel(picked.b.entityId, picked.b.terminalId)}</strong>}
      <div className="ind-chips">
        {focusId && <><button type="button" onClick={() => onLocate(focusId, 'board')}>Ver en tablero</button><button type="button" onClick={() => onLocate(focusId, 'plant')}>Ver en planta</button></>}
        {picked && pageOf(project, picked.a.entityId, auto) !== pageOf(project, picked.b.entityId, auto)
          && <button type="button" onClick={() => setPageChoice(pageOf(project, page === pageOf(project, picked.a.entityId, auto) ? picked.b.entityId : picked.a.entityId, auto))}>Ir a la otra hoja</button>}
      </div>
    </div>}
    {entities.length === 0 ? <p className="ind-note ind-diagram-empty">No hay componentes con terminales. Coloca piezas desde Piezas y aparecerán aquí con el mismo id.</p>
      : <div className="ind-diagram-scroll"><svg ref={svg} width={w * zoom} height={h * zoom} viewBox={`0 0 ${w} ${h}`} role="group" aria-label={`Esquema, ${pageName(page)}`} data-page={page} onPointerDown={() => { onSelect([]); onPick(null); }}>
        {project.connections.map((c, i) => {
          if (pageOf(view, c.a.entityId, auto) !== page) return null; // los cables de otra hoja no se dibujan aquí
          const pts = wirePoints(view, c, auto, (i % 3) - 1); if (!pts) return null;
          const st = evaluation.status[c.id] ?? c.status, live = !!sim?.liveConnections.has(c.id), picked = pickedConn === c.id;
          const color = live ? '#ff9800' : st === 'invalid' ? '#d9302c' : sim ? '#9aa7b8' : KIND_COLOR[c.kind] ?? '#555f6d';
          return <g key={c.id} data-connection={c.id} data-live={live} data-status={st}>
            <path d={pathOf(pts)} fill="none" stroke="transparent" strokeWidth={12} style={{cursor: 'pointer'}} onPointerDown={e => { e.stopPropagation(); onPick(picked ? null : c.id); }}><title>{`${endLabel(c.a.entityId, c.a.terminalId)} → ${endLabel(c.b.entityId, c.b.terminalId)}`}</title></path>
            <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={picked || trace?.connections.includes(c.id) ? 4 : live ? 3.2 : 2} strokeDasharray={!sim && st === 'unverified' ? '6 3' : undefined} strokeLinejoin="round" pointerEvents="none" />
          </g>;
        })}
        {stubs.map((s, i) => {
          const c = project.connections.find(x => x.id === s.connectionId)!, live = !!sim?.liveConnections.has(c.id), color = live ? '#ff9800' : (evaluation.status[c.id] ?? c.status) === 'invalid' ? '#d9302c' : sim ? '#9aa7b8' : KIND_COLOR[c.kind] ?? '#555f6d';
          return <g key={`${s.connectionId}${i}`} data-ref={s.connectionId} role="button" tabIndex={0} aria-label={s.label} onPointerDown={event => { event.stopPropagation(); onPick(c.id); setPageChoice(pageOf(project, page === pageOf(project, c.a.entityId, auto) ? c.b.entityId : c.a.entityId, auto)); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPick(c.id); setPageChoice(pageOf(project, page === pageOf(project, c.a.entityId, auto) ? c.b.entityId : c.a.entityId, auto)); } }}>
            <path d={pathOf(s.pts)} fill="none" stroke={color} strokeWidth={live ? 3.2 : 2} />
            <text x={s.at.x} y={s.at.y + (s.side === 'top' ? -2 : s.side === 'bottom' ? 10 : 4)} textAnchor={s.side === 'left' ? 'end' : s.side === 'right' ? 'start' : 'middle'} className="ind-ref-label">{s.label}</text>
          </g>;
        })}
        {here.map(e => {
          const g = symbolGeom(e.definitionId), at = placementOf(view, e.id, auto), s = shapeOf(e.definitionId);
          const lit = !!sim?.energized[e.id], closed = !!sim?.closed[e.id], isSel = selection.includes(e.id);
          return <g key={e.id} data-entity={e.id} transform={`translate(${at.x} ${at.y})`} role="button" tabIndex={0} aria-label={`${e.label} (${s.name})`} aria-pressed={isSel} style={{cursor: editable ? 'grab' : simRunning && operableKind(e.definitionId) ? 'pointer' : 'default'}}
            onPointerDown={ev => start(e.id, ev)} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onSelect([e.id]); } }}>
            <rect width={g.w} height={g.h} rx={10} fill={lit ? '#fff3e0' : closed ? '#e6f6ec' : '#ffffff'} stroke={isSel ? '#2d6ff4' : lit ? '#ff9800' : '#8a97a8'} strokeWidth={isSel ? 3 : 1.6} />
            <text x={g.w / 2} y={g.h / 2 - 2} textAnchor="middle" className="ind-sym-label">{e.label}</text>
            {s.name.length * 5.4 <= g.w - 10 && <text x={g.w / 2} y={g.h / 2 + 13} textAnchor="middle" className="ind-sym-sub">{s.name}</text>}
            {g.pins.map(q => <g key={q.id}>
              <circle cx={q.x} cy={q.y} r={4.2} fill={KIND_COLOR[q.kind] ?? '#555'} stroke="#fff" strokeWidth={1} />
              <text x={q.x + (q.side === 'left' ? 9 : q.side === 'right' ? -9 : 0)} y={q.y + (q.side === 'top' ? 15 : q.side === 'bottom' ? -8 : 4)} textAnchor={q.side === 'left' ? 'start' : q.side === 'right' ? 'end' : 'middle'} className="ind-pin-label">{q.label}</text>
            </g>)}
          </g>;
        })}
      </svg></div>}
    <p className="ind-note ind-diagram-foot">Arrastra un símbolo para moverlo (no cambia su posición en 3D). Pulsa un cable para resaltarlo. Los cables a otra hoja se indican con «→ hoja n · destino». Separación mínima entre patillas: {PIN_GAP} px.</p>
  </section>;
}
