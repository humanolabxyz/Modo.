// Diagrama esquemático generado desde el modelo compartido (fases 7 y 11). Puro: se prueba en Node.
//
// Cada componente con terminales tiene UN símbolo genérico de bloque con sus terminales como patillas; los cables son las mismas conexiones del
// modelo (mismo id), dibujadas en ángulo recto. Hay varias hojas (Fuerza y Mando por defecto, y las que se creen): un cable entre hojas se dibuja como
// una referencia («→ hoja 2 · KM1.A1») en cada extremo. La disposición automática ordena cada fila para reducir cruces.
// La simbología normalizada (IEC 60617) NO está incluida: es un esquema funcional, no un plano de ingeniería.
// La posición y la hoja de cada símbolo se guardan en `symbols` (independientes de la pose 3D).
import {shapeOf, type TerminalDef} from '../build/shapes.ts';
import type {Connection, IndustryProject, TerminalRef} from '../model/types.ts';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Pin = {id: string; label: string; side: Side; x: number; y: number; kind: TerminalDef['kind']};
export type SymbolGeom = {w: number; h: number; pins: Pin[]};
export type XY = {x: number; y: number};
export type Placement = XY & {page: number};

export const PIN_GAP = 34;
const SIDE_GROUP: Record<string, Side> = {inferior: 'bottom', bobina: 'right', auxiliar: 'left', 'alimentación': 'left'};
const sideOf = (t: TerminalDef): Side => SIDE_GROUP[t.group ?? ''] ?? 'top';

/** Geometría del símbolo de una definición: caja con las patillas repartidas por lados según el grupo del terminal. */
export function symbolGeom(definitionId: string): SymbolGeom {
  const terminals = shapeOf(definitionId).terminals ?? [];
  const bySide: Record<Side, TerminalDef[]> = {top: [], bottom: [], left: [], right: []};
  for (const t of terminals) bySide[sideOf(t)].push(t);
  for (const s of ['top', 'bottom'] as const) bySide[s].sort((a, b) => a.position[0] - b.position[0]);
  for (const s of ['left', 'right'] as const) bySide[s].sort((a, b) => b.position[1] - a.position[1]);
  const w = Math.max(96, Math.max(bySide.top.length, bySide.bottom.length) * PIN_GAP + 28);
  const h = Math.max(64, Math.max(bySide.left.length, bySide.right.length) * 24 + 40);
  const pins: Pin[] = [];
  const row = (list: TerminalDef[], side: Side) => list.forEach((t, i) => {
    const horizontal = side === 'top' || side === 'bottom', n = list.length;
    const along = horizontal ? w / 2 + (i - (n - 1) / 2) * PIN_GAP : h / 2 + (i - (n - 1) / 2) * 24;
    pins.push({id: t.id, label: t.label, side, kind: t.kind, x: horizontal ? along : side === 'left' ? 0 : w, y: horizontal ? (side === 'top' ? 0 : h) : along});
  });
  for (const s of ['top', 'bottom', 'left', 'right'] as const) row(bySide[s], s);
  return {w, h, pins};
}

/** Los componentes sin terminales (placa, riel, bloque) no son parte del esquema eléctrico. */
export const electricalEntities = (p: Pick<IndustryProject, 'entities'>) => p.entities.filter(e => (shapeOf(e.definitionId).terminals?.length ?? 0) > 0);

/** Fila (flujo: red → protección → maniobra → motor) y hoja por defecto de cada tipo de aparato. */
const ROW: Record<string, number> = {'red-3f': 0, 'breaker-3p': 1, 'rele-termico': 2, 'contactor-3p': 3, 'motor-3p': 4, 'breaker-1p': 0, 'fuente-cc': 1, 'borne-paso': 2, 'plc-generico': 2, 'pulsador-na': 3, 'pulsador-nc': 3, 'piloto': 3};
const PAGE: Record<string, number> = {'red-3f': 1, 'breaker-3p': 1, 'rele-termico': 1, 'contactor-3p': 1, 'motor-3p': 1};
export const PAGE_TITLES = ['Fuerza', 'Mando'];
const ROW_H = 140, GAP = 56, MARGIN = 40;
const defaultPage = (definitionId: string) => PAGE[definitionId] ?? 2;

/** Colocación automática por hojas y filas; dentro de cada fila el orden sigue al de los vecinos de la fila anterior para reducir cruces. */
export function autoLayout(p: IndustryProject, order = true): Record<string, Placement> {
  const defOf = new Map(p.entities.map(e => [e.id, e.definitionId]));
  const out: Record<string, Placement> = {};
  const byPage = new Map<number, Map<number, string[]>>();
  for (const e of electricalEntities(p)) {
    const page = defaultPage(e.definitionId), row = ROW[e.definitionId] ?? 5, rows = byPage.get(page) ?? new Map<number, string[]>();
    rows.set(row, [...(rows.get(row) ?? []), e.id]); byPage.set(page, rows);
  }
  for (const [page, rows] of byPage) {
    let rowIndex = 0;
    for (const r of [...rows.keys()].sort((a, b) => a - b)) {
      let ids = rows.get(r)!;
      if (order && rowIndex > 0) {
        // Baricentro: posición media de los vecinos ya colocados (cables entre esta fila y las anteriores de la misma hoja)
        const bary = (id: string) => {
          const xs: number[] = [];
          for (const c of p.connections) {
            const there = c.a.entityId === id ? c.b : c.b.entityId === id ? c.a : null; const pl = there && out[there.entityId];
            if (pl && there && pl.page === page) { const pin = symbolGeom(defOf.get(there.entityId)!).pins.find(q => q.id === there.terminalId); xs.push(pl.x + (pin?.x ?? symbolGeom(defOf.get(there.entityId)!).w / 2)); }
          }
          return xs.length ? xs.reduce((sum, v) => sum + v, 0) / xs.length : Infinity;
        };
        ids = [...ids].sort((a, b) => bary(a) - bary(b));
      }
      let x = MARGIN;
      for (const id of ids) { out[id] = {page, x, y: MARGIN + rowIndex * ROW_H}; x += symbolGeom(defOf.get(id)!).w + GAP; }
      rowIndex++;
    }
  }
  return out;
}

/** Posición y hoja guardadas o, si aún no se movió, las automáticas. */
export function placementOf(p: IndustryProject, id: string, auto = autoLayout(p)): Placement {
  const saved = p.symbols[id]?.[0];
  return saved ? {page: saved.page, x: saved.x, y: saved.y} : auto[id] ?? {page: 1, x: MARGIN, y: MARGIN};
}
export const symbolPos = (p: IndustryProject, id: string, auto = autoLayout(p)): XY => { const {x, y} = placementOf(p, id, auto); return {x, y}; };
export const pageOf = (p: IndustryProject, id: string, auto = autoLayout(p)): number => placementOf(p, id, auto).page;

/** Hojas en uso (siempre al menos la 1). */
export function pagesOf(p: IndustryProject, auto = autoLayout(p)): number[] {
  const used = new Set<number>([1]); for (const e of electricalEntities(p)) used.add(pageOf(p, e.id, auto));
  const max = Math.max(...used); return Array.from({length: max}, (_, i) => i + 1);
}

export function pinPos(p: IndustryProject, ref: TerminalRef, auto = autoLayout(p)): (XY & {side: Side; page: number}) | null {
  const e = p.entities.find(x => x.id === ref.entityId); if (!e) return null;
  const pin = symbolGeom(e.definitionId).pins.find(q => q.id === ref.terminalId); if (!pin) return null;
  const at = placementOf(p, e.id, auto);
  return {x: at.x + pin.x, y: at.y + pin.y, side: pin.side, page: at.page};
}

const OUT: Record<Side, XY> = {top: {x: 0, y: -1}, bottom: {x: 0, y: 1}, left: {x: -1, y: 0}, right: {x: 1, y: 0}};
/** Cable en ángulo recto entre dos patillas de la MISMA hoja; sale perpendicular al lado de cada una. Con patillas en hojas distintas devuelve null. */
export function wirePoints(p: IndustryProject, c: Connection, auto = autoLayout(p), lane = 0): XY[] | null {
  const a = pinPos(p, c.a, auto), b = pinPos(p, c.b, auto); if (!a || !b || a.page !== b.page) return null;
  const da = OUT[a.side], db = OUT[b.side], STUB = 16;
  const a1 = {x: a.x + da.x * STUB, y: a.y + da.y * STUB}, b1 = {x: b.x + db.x * STUB, y: b.y + db.y * STUB};
  const pts: XY[] = [{x: a.x, y: a.y}, a1];
  if (da.y !== 0 && db.y !== 0) { const my = (a1.y + b1.y) / 2 + lane * 6; pts.push({x: a1.x, y: my}, {x: b1.x, y: my}); }
  else if (da.x !== 0 && db.x !== 0) { const mx = (a1.x + b1.x) / 2 + lane * 6; pts.push({x: mx, y: a1.y}, {x: mx, y: b1.y}); }
  else if (da.y !== 0) pts.push({x: a1.x, y: b1.y}); else pts.push({x: b1.x, y: a1.y});
  pts.push(b1, {x: b.x, y: b.y});
  return pts.filter((q, i) => i === 0 || q.x !== pts[i - 1].x || q.y !== pts[i - 1].y);
}
export const pathOf = (pts: XY[]): string => pts.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join(' ');

export type Stub = {connectionId: string; pts: XY[]; /** texto de la referencia a la otra hoja */ label: string; at: XY; side: Side};
/** Referencias de los cables que salen de esta hoja hacia otra (un tramo corto desde la patilla y el destino). */
export function crossPageStubs(p: IndustryProject, page: number, auto = autoLayout(p)): Stub[] {
  const labelOf = (id: string) => p.entities.find(e => e.id === id)?.label ?? id;
  const out: Stub[] = [];
  for (const c of p.connections) {
    const a = pinPos(p, c.a, auto), b = pinPos(p, c.b, auto); if (!a || !b || a.page === b.page) continue;
    for (const [here, there, ref] of [[a, b, c.b], [b, a, c.a]] as const) {
      if (here.page !== page) continue;
      const d = OUT[here.side], end = {x: here.x + d.x * 26, y: here.y + d.y * 26};
      out.push({connectionId: c.id, pts: [{x: here.x, y: here.y}, end], label: `→ hoja ${there.page} · ${labelOf(ref.entityId)}.${ref.terminalId}`, at: {x: end.x + d.x * 4, y: end.y + d.y * 4}, side: here.side});
    }
  }
  return out;
}

/** Tamaño del lienzo de una hoja. */
export function bounds(p: IndustryProject, page = 1, auto = autoLayout(p)): {w: number; h: number} {
  let w = 420, h = 300;
  for (const e of electricalEntities(p)) { const pl = placementOf(p, e.id, auto); if (pl.page !== page) continue; const g = symbolGeom(e.definitionId); w = Math.max(w, pl.x + g.w + MARGIN + 160); h = Math.max(h, pl.y + g.h + MARGIN + 30); }
  return {w, h};
}

/** Cruces entre cables de una hoja (pares de tramos que se cortan en su interior). Sirve para comparar disposiciones. */
export function countCrossings(p: IndustryProject, page = 1, auto = autoLayout(p)): number {
  const segs: {c: string; a: XY; b: XY}[] = [];
  p.connections.forEach((c, i) => { const pts = wirePoints(p, c, auto, (i % 3) - 1); if (pts) for (let k = 1; k < pts.length; k++) { if (pinPos(p, c.a, auto)?.page === page) segs.push({c: c.id, a: pts[k - 1], b: pts[k]}); } });
  const cross = (s: typeof segs[number], t: typeof segs[number]) => {
    const [h, v] = s.a.y === s.b.y && t.a.x === t.b.x ? [s, t] : s.a.x === s.b.x && t.a.y === t.b.y ? [t, s] : [null, null]; if (!h || !v) return false;
    const x = v.a.x, y = h.a.y; return x > Math.min(h.a.x, h.b.x) && x < Math.max(h.a.x, h.b.x) && y > Math.min(v.a.y, v.b.y) && y < Math.max(v.a.y, v.b.y);
  };
  let n = 0; for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) if (segs[i].c !== segs[j].c && cross(segs[i], segs[j])) n++;
  return n;
}
