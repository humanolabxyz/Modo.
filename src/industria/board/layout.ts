// Alzado del tablero (fase 8): cada placa de montaje con lo montado sobre ella, a escala, en el sistema de la propia placa. Puro: se prueba en Node.
// Las medidas son las de ejemplo del catálogo genérico (no son de un producto real). Gira la placa en 3D y el alzado no cambia.
import {qRotate, tInv, tMul, tPoint} from '../../robotics/project/math.ts';
import {shapeOf} from '../build/shapes.ts';
import {descendantsOf, toTransform} from '../build/snap.ts';
import type {IndustryProject} from '../model/types.ts';

export type BoardTerminal = {id: string; label: string; x: number; y: number; wires: number};
export type BoardDevice = {id: string; label: string; name: string; definitionId: string; kind: 'rail' | 'device'; x: number; y: number; w: number; h: number; depth: number; terminals: BoardTerminal[]};
/** Medidas en milímetros, con el origen arriba a la izquierda de la placa. */
export type Board = {plateId: string; label: string; w: number; h: number; devices: BoardDevice[]};
export type Boards = {boards: Board[]; offBoard: {id: string; label: string; name: string}[]};

export const PLATE_DEFINITION = 'placa';
const mm = (m: number) => Math.round(m * 10000) / 10; // metros → milímetros con una décima

export function buildBoards(p: IndustryProject): Boards {
  const boards: Board[] = [], onBoard = new Set<string>();
  const wires = new Map<string, number>();
  for (const c of p.connections) for (const r of [c.a, c.b]) wires.set(`${r.entityId}:${r.terminalId}`, (wires.get(`${r.entityId}:${r.terminalId}`) ?? 0) + 1);

  for (const plate of p.entities.filter(e => e.definitionId === PLATE_DEFINITION)) {
    const ps = shapeOf(plate.definitionId), pose = p.poses[plate.id]; if (!pose) continue;
    const inv = tInv(toTransform(pose)), minX = ps.center[0] - ps.size[0] / 2, maxY = ps.center[1] + ps.size[1] / 2;
    const devices: BoardDevice[] = [];
    for (const id of descendantsOf(p, plate.id)) {
      const e = p.entities.find(x => x.id === id), dp = p.poses[id]; if (!e || !dp) continue;
      onBoard.add(id);
      const s = shapeOf(e.definitionId), rel = tMul(inv, toTransform(dp)), q = rel.rotation;
      const c = tPoint(rel, s.center), ax = [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])];
      const half = (k: 0 | 1 | 2) => (Math.abs(ax[0][k]) * s.size[0] + Math.abs(ax[1][k]) * s.size[1] + Math.abs(ax[2][k]) * s.size[2]) / 2;
      const hx = half(0), hy = half(1), hz = half(2);
      const top = (lx: number, ly: number) => ({x: mm(lx - minX), y: mm(maxY - ly)});
      devices.push({
        id, label: e.label, name: s.name, definitionId: e.definitionId, kind: e.definitionId === 'riel' ? 'rail' : 'device',
        ...top(c[0] - hx, c[1] + hy), w: mm(2 * hx), h: mm(2 * hy), depth: mm(2 * hz),
        terminals: (s.terminals ?? []).map(t => { const tp = tPoint(rel, t.position); return {id: t.id, label: t.label, ...top(tp[0], tp[1]), wires: wires.get(`${id}:${t.id}`) ?? 0}; }),
      });
    }
    devices.sort((a, b) => (a.kind === b.kind ? a.y - b.y || a.x - b.x : a.kind === 'rail' ? -1 : 1));
    boards.push({plateId: plate.id, label: plate.label, w: mm(ps.size[0]), h: mm(ps.size[1]), devices});
  }
  const offBoard = p.entities.filter(e => (shapeOf(e.definitionId).terminals?.length ?? 0) > 0 && !onBoard.has(e.id)).map(e => ({id: e.id, label: e.label, name: shapeOf(e.definitionId).name}));
  return {boards, offBoard};
}
