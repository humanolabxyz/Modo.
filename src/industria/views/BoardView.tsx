import {useMemo, useState} from 'react';
import {containerOf} from '../model/inspection';
import type {ViewId} from '../model/ui';
import {buildBoards} from '../board/layout.ts';
import type {IndustryProject} from '../model/types.ts';
import type {SimResult} from '../sim/engine.ts';

export type BoardViewProps = {project: IndustryProject; selection: readonly string[]; sim: SimResult | null; onSelect(ids: string[]): void; onLocate(id: string, view: ViewId): void; pickedConn: string | null; onPick(id: string | null): void};

/** Alzado a escala de cada placa de montaje: riel y aparatos montados, con sus terminales (rellenos si tienen cable). Medidas de ejemplo del catálogo genérico. */
export default function BoardView({project, selection, sim, onSelect, onLocate, pickedConn, onPick}: BoardViewProps) {
  const {boards, offBoard: external} = useMemo(() => buildBoards(project), [project]);
  const doors = useMemo(() => buildBoards(project, 'puerta').boards, [project]);
  const [pick, setPick] = useState('');
  const [face, setFace] = useState<'placa' | 'puerta' | 'cableado'>();
  const [zoom, setZoom] = useState(1);
  const [terminal, setTerminal] = useState<{device: string; id: string}>();
  const selectedId = selection.length === 1 ? selection[0] : '';
  const selectedDoor = doors.find(d => d.devices.some(e => e.id === selectedId));
  const activeFace = face ?? (selectedDoor || (!boards.length && doors.length) ? 'puerta' : 'placa');
  const selectedCabinet = doors.find(d => d.plateId === selectedId || d.plateId === selectedDoor?.plateId)
    ?? doors.find(d => d.plateId === containerOf(project, selectedId, 'gabinete')?.id);
  const plate = boards.find(b => b.plateId === pick)
    ?? boards.find(b => b.plateId === selectedId || b.devices.some(e => e.id === selectedId))
    ?? boards.find(b => selectedCabinet && containerOf(project, b.plateId, 'gabinete')?.id === selectedCabinet.plateId)
    ?? boards[0];
  const cabinet = selectedCabinet ?? doors.find(d => plate && d.plateId === containerOf(project, plate.plateId, 'gabinete')?.id) ?? doors[0];
  const board = activeFace === 'puerta' ? cabinet : plate;
  const boardIds = new Set([...(plate?.devices ?? []), ...(cabinet?.devices ?? [])].map(d => d.id));
  const names = new Map(project.entities.map(e => [e.id, e.label]));
  const device = [...(plate?.devices ?? []), ...(cabinet?.devices ?? [])].find(d => d.id === selectedId);
  const connections = project.connections.filter(c => [c.a, c.b].some(end =>
    (selectedId && device ? end.entityId === selectedId : boardIds.has(end.entityId))
    && (terminal?.device !== selectedId || end.terminalId === terminal.id)));
  const choose = (id: string) => { onSelect([id]); setTerminal(undefined); };
  const offBoard = external.filter(d => !doors.some(door => door.devices.some(e => e.id === d.id)));
  const pad = 60; // mm de margen alrededor de la placa

  return <section className="ind-board rb-canvas-overlay" aria-label="Tablero">
    <div className="ind-plc-head"><strong>Tablero</strong>
      {boards.length > 1 && <label className="ind-field"><span>Placa</span><select value={plate?.plateId} onChange={e => { setPick(e.target.value); setFace('placa'); setTerminal(undefined); onSelect([]); }}>{boards.map(b => <option key={b.plateId} value={b.plateId}>{b.label}</option>)}</select></label>}
      <span className="ind-note">Alzado del gabinete y sus conexiones. Medidas didácticas.</span></div>
    <div className="ind-chips ind-work-switch" role="group" aria-label="Capas del tablero">
      <button type="button" aria-pressed={activeFace === 'puerta'} disabled={!cabinet} onClick={() => { setFace('puerta'); setTerminal(undefined); }}>Puerta</button>
      <button type="button" aria-pressed={activeFace === 'placa'} onClick={() => { setFace('placa'); setTerminal(undefined); }}>Placa</button>
      <button type="button" aria-pressed={activeFace === 'cableado'} onClick={() => setFace('cableado')}>Cableado</button>
      <button type="button" aria-label="Alejar tablero" disabled={zoom <= 1} onClick={() => setZoom(z => z - 0.5)}>−</button>
      <button type="button" aria-label="Acercar tablero" disabled={zoom >= 3} onClick={() => setZoom(z => z + 0.5)}>+</button>
    </div>
    {device && <div className="ind-related">
      <strong>{device.label} · {device.name}</strong>
      <div className="ind-chips"><button type="button" onClick={() => onLocate(device.id, 'plant')}>Ver en planta</button><button type="button" onClick={() => onLocate(device.id, 'diagram')}>Ver en diagrama</button></div>
      <div className="ind-chips" aria-label="Bornes del componente">{device.terminals.map(t => <button key={t.id} type="button" aria-pressed={terminal?.device === device.id && terminal.id === t.id} onClick={() => { setTerminal({device: device.id, id: t.id}); setFace('cableado'); }}>{t.label} · {t.wires}</button>)}</div>
    </div>}
    {activeFace === 'cableado' ? <div className="ind-related ind-cable-list">
      {device && <button type="button" onClick={() => { onSelect([]); setTerminal(undefined); }}>Mostrar todos los cables del tablero</button>}
      {!connections.length && <p className="ind-note">Sin conexiones en esta selección.</p>}
      {connections.map(c => <button key={c.id} type="button" aria-pressed={pickedConn === c.id} onClick={() => onPick(pickedConn === c.id ? null : c.id)}>
        <span>{names.get(c.a.entityId)}.{c.a.terminalId}</span><span aria-hidden="true"> → </span><span>{names.get(c.b.entityId)}.{c.b.terminalId}</span>
      </button>)}
      {pickedConn && connections.some(c => c.id === pickedConn) && <div className="ind-chips">
        {(() => { const c = connections.find(c => c.id === pickedConn)!; const id = device?.id ?? (boardIds.has(c.a.entityId) ? c.a.entityId : c.b.entityId); return <><button type="button" onClick={() => onLocate(id, 'diagram')}>Seguir en diagrama</button><button type="button" onClick={() => onLocate(id, 'plant')}>Seguir en planta</button></>; })()}
      </div>}
    </div> : !board ? <p className="ind-note ind-board-empty">No hay una placa de montaje. Coloca «Placa de montaje» desde Piezas y monta sobre ella rieles y aparatos.</p>
      : <div className="ind-board-scroll"><svg style={zoom > 1 ? {width: zoom * 100 + '%', height: zoom * 100 + '%', flexShrink: 0} : undefined} viewBox={`${-pad} ${-pad} ${board.w + pad * 2} ${board.h + pad * 2}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label={`Alzado de ${board.label}`} onPointerDown={() => onSelect([])}>
        <rect x={0} y={0} width={board.w} height={board.h} fill={activeFace === 'puerta' ? '#d8e1ea' : '#f1e2cc'} stroke="#b98b55" strokeWidth={3} rx={6} />
        <text x={board.w / 2} y={-12} textAnchor="middle" className="ind-sym-label">{board.label} · {Math.round(board.w)} × {Math.round(board.h)} mm</text>
        {board.devices.map(d => {
          const selected = selection.includes(d.id), lit = !!sim?.energized[d.id], closed = !!sim?.closed[d.id];
          return <g key={d.id} data-device={d.id} role="button" tabIndex={0} aria-label={`${d.label} (${d.name})`} aria-pressed={selected} onPointerDown={e => { e.stopPropagation(); choose(d.id); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect([d.id]); } }} style={{cursor: 'pointer'}}>
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
