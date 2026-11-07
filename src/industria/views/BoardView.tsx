import {useMemo, useState} from 'react';
import {buildBoards} from '../board/layout.ts';
import type {IndustryProject} from '../model/types.ts';
import type {SimResult} from '../sim/engine.ts';

export type BoardViewProps = {project: IndustryProject; selection: readonly string[]; sim: SimResult | null; onSelect(ids: string[]): void};

/** Alzado a escala de cada placa de montaje: riel y aparatos montados, con sus terminales (rellenos si tienen cable). Medidas de ejemplo del catálogo genérico. */
export default function BoardView({project, selection, sim, onSelect}: BoardViewProps) {
  const {boards, offBoard} = useMemo(() => buildBoards(project), [project]);
  const [pick, setPick] = useState('');
  const board = boards.find(b => b.plateId === pick) ?? boards[0];
  const pad = 60; // mm de margen alrededor de la placa

  return <section className="ind-board rb-canvas-overlay" aria-label="Tablero">
    <div className="ind-plc-head"><strong>Tablero</strong>
      {boards.length > 1 && <label className="ind-field"><span>Placa</span><select value={board?.plateId} onChange={e => setPick(e.target.value)}>{boards.map(b => <option key={b.plateId} value={b.plateId}>{b.label}</option>)}</select></label>}
      <span className="ind-note">Alzado a escala de lo montado sobre la placa. Medidas de ejemplo (catálogo genérico), no de un producto real.</span></div>
    {!board ? <p className="ind-note ind-board-empty">No hay una placa de montaje. Coloca «Placa de montaje» desde Piezas y monta sobre ella rieles y aparatos.</p>
      : <div className="ind-board-scroll"><svg viewBox={`${-pad} ${-pad} ${board.w + pad * 2} ${board.h + pad * 2}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label={`Alzado de ${board.label}`} onPointerDown={() => onSelect([])}>
        <rect x={0} y={0} width={board.w} height={board.h} fill="#f1e2cc" stroke="#b98b55" strokeWidth={3} rx={6} />
        <text x={board.w / 2} y={-12} textAnchor="middle" className="ind-sym-label">{board.label} · {Math.round(board.w)} × {Math.round(board.h)} mm</text>
        {board.devices.map(d => {
          const selected = selection.includes(d.id), lit = !!sim?.energized[d.id], closed = !!sim?.closed[d.id];
          return <g key={d.id} data-device={d.id} role="button" tabIndex={0} aria-label={`${d.label} (${d.name})`} aria-pressed={selected} onPointerDown={e => { e.stopPropagation(); onSelect([d.id]); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect([d.id]); } }} style={{cursor: 'pointer'}}>
            <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={d.kind === 'rail' ? 2 : 6} fill={d.kind === 'rail' ? '#c5ccd6' : lit ? '#fff3e0' : closed ? '#e6f6ec' : '#ffffff'} stroke={selected ? '#2d6ff4' : lit ? '#ff9800' : '#7a8798'} strokeWidth={selected ? 3 : 1.4} />
            {d.kind === 'device' && (d.w < 30
              ? <text transform={`translate(${d.x + d.w / 2 + 3} ${d.y + d.h / 2}) rotate(-90)`} textAnchor="middle" className="ind-board-label" style={{fontSize: 11}}>{d.label}</text>
              : <text x={d.x + d.w / 2} y={d.y + d.h / 2 + 4} textAnchor="middle" className="ind-board-label" style={{fontSize: Math.max(9, Math.min(15, d.w / 3.2))}}>{d.label}</text>)}
            {d.kind === 'rail' && <text x={d.x + 4} y={d.y + d.h - 6} className="ind-pin-label">{d.label}</text>}
            {d.kind === 'device' && d.terminals.map(t => <circle key={t.id} cx={t.x} cy={t.y} r={3.6} fill={t.wires > 0 ? '#14181f' : '#ffffff'} stroke="#14181f" strokeWidth={1}><title>{`${d.label}.${t.label}${t.wires ? ` · ${t.wires} cable(s)` : ' · libre'}`}</title></circle>)}
          </g>;
        })}
      </svg></div>}
    {offBoard.length > 0 && <p className="ind-note">Fuera del tablero: {offBoard.map(o => `${o.label} (${o.name})`).join(', ')}.</p>}
    <p className="ind-note">Terminal relleno = con cable; vacío = libre. Los aparatos se ven de frente; el fondo de cada pieza no se dibuja.</p>
  </section>;
}
