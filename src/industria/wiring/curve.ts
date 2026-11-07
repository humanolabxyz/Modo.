// Curvado visual de cables (fase 12). Puro: se prueba en Node. Convierte la ruta con esquinas rectas (route.ts) en un cable flexible:
// esquinas redondeadas con un radio de curvatura mínimo (un cable real no dobla en ángulo vivo) y una pequeña caída por gravedad en los tramos largos y libres.
// Solo presentación: no cambia la topología ni el modelo.
import type {Vec3} from '../model/types.ts';

export const BEND_RADIUS = 0.035; // m: radio de curvatura de las esquinas (de ejemplo)
export const SAG_MAX = 0.03; // m: caída máxima del centro de un tramo largo
const SAG_MIN_SPAN = 0.22; // m: por debajo de esta longitud el cable no cuelga

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Redondea las esquinas de una poligonal con curvas de Bézier cuadráticas (el vértice es el punto de control). Mantiene los extremos. */
export function roundCorners(points: readonly Vec3[], radius = BEND_RADIUS, samples = 6): Vec3[] {
  if (points.length < 3) return points.map(p => [...p] as Vec3);
  const out: Vec3[] = [[...points[0]] as Vec3];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1], cur = points[i], next = points[i + 1];
    const dIn = sub(cur, prev), dOut = sub(next, cur), lIn = len(dIn), lOut = len(dOut);
    if (lIn < 1e-6 || lOut < 1e-6) continue; // punto repetido
    const r = Math.min(radius, lIn / 2, lOut / 2);
    const entry = lerp(cur, prev, r / lIn), exit = lerp(cur, next, r / lOut);
    for (let k = 0; k <= samples; k++) {
      const t = k / samples, a = lerp(entry, cur, t), b = lerp(cur, exit, t);
      out.push(lerp(a, b, t));
    }
  }
  out.push([...points[points.length - 1]] as Vec3);
  return out;
}

/** Longitud de la poligonal. */
export function pathLength(points: readonly Vec3[]): number { let l = 0; for (let i = 1; i < points.length; i++) l += len(sub(points[i], points[i - 1])); return l; }

/** Añade caída por gravedad a los tramos largos: el centro baja como una parábola. `blocked(a, b)` impide la caída si el cable tocaría una pieza. */
export function addSag(points: readonly Vec3[], sag = SAG_MAX, blocked?: (a: Vec3, b: Vec3) => boolean): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < points.length; i++) {
    out.push([...points[i]] as Vec3);
    if (i === points.length - 1) break;
    const a = points[i], b = points[i + 1], d = len(sub(b, a));
    if (d < SAG_MIN_SPAN) continue;
    const horizontal = Math.hypot(b[0] - a[0], b[2] - a[2]) / d; // 1 = tramo horizontal, 0 = vertical
    const drop = Math.min(sag, d * 0.06) * horizontal;
    if (drop < 0.002) continue;
    const n = Math.min(8, Math.max(3, Math.round(d / 0.06))), seg: Vec3[] = [];
    for (let k = 1; k < n; k++) { const t = k / n, p = lerp(a, b, t); seg.push([p[0], p[1] - drop * 4 * t * (1 - t), p[2]]); }
    const chain = [a, ...seg, b];
    if (blocked && chain.some((q, j) => j > 0 && blocked(chain[j - 1], q))) continue; // tocaría una pieza: queda recto
    out.push(...seg);
  }
  return out;
}

/** Cable flexible completo: caída en los tramos largos y esquinas redondeadas. */
export function flexCable(points: readonly Vec3[], opts: {radius?: number; sag?: number; blocked?: (a: Vec3, b: Vec3) => boolean} = {}): Vec3[] {
  return roundCorners(addSag(points, opts.sag ?? SAG_MAX, opts.blocked), opts.radius ?? BEND_RADIUS);
}

/** Radio de curvatura mínimo de la poligonal (circunradio de tres puntos consecutivos). Sirve para comprobar que ninguna esquina es un ángulo vivo. */
export function minBendRadius(points: readonly Vec3[]): number {
  let min = Infinity;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1], ab = len(sub(b, a)), bc = len(sub(c, b)), ac = len(sub(c, a));
    if (ab < 1e-6 || bc < 1e-6 || ac < 1e-6) continue;
    const u = sub(b, a), v = sub(c, a), cross: Vec3 = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], area2 = len(cross);
    if (area2 < 1e-12) continue; // colineales: radio infinito
    min = Math.min(min, (ab * bc * ac) / (2 * area2));
  }
  return min;
}

/** Puntos de paso editables de un cable: la ruta sin sus dos extremos (los terminales). */
export const interiorOf = (route: readonly Vec3[]): Vec3[] => route.slice(1, -1).map(p => [...p] as Vec3);
/** Punto medio de cada tramo de la ruta (para insertar un punto de paso nuevo). */
export const midpointsOf = (route: readonly Vec3[]): Vec3[] => route.slice(1).map((p, i) => lerp(route[i], p, 0.5));
/** Inserta un punto de paso en el tramo `segment` (0 = entre el terminal A y el primer punto). Devuelve los puntos interiores nuevos. */
export function insertWaypoint(interior: readonly Vec3[], segment: number, at: Vec3): Vec3[] {
  const next = interior.map(p => [...p] as Vec3);
  next.splice(Math.max(0, Math.min(next.length, segment)), 0, [...at] as Vec3);
  return next;
}
/** Mueve un punto de paso. */
export function moveWaypoint(interior: readonly Vec3[], index: number, to: Vec3): Vec3[] {
  return interior.map((p, i) => (i === index ? ([...to] as Vec3) : ([...p] as Vec3)));
}
/** Quita un punto de paso. */
export function removeWaypoint(interior: readonly Vec3[], index: number): Vec3[] { return interior.filter((_, i) => i !== index).map(p => [...p] as Vec3); }
