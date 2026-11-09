// Solver hidráulico estacionario de Agro (Fase 3). Puro: sin entidades, sin three. Trabaja con un grafo genérico de nodos y enlaces.
//
// QUÉ ES: reparte caudales y presiones en una red de tuberías con estanques (cota de agua fija), bombas (curva altura–caudal) y emisores que
// descargan a la atmósfera. Resuelve la conservación de caudal en cada nodo por Newton con búsqueda lineal (método nodal: las incógnitas son las cotas piezométricas).
// QUÉ NO ES: un modelo transitorio (no hay golpe de ariete ni vaciado en el tiempo), ni cavitación, ni pérdidas singulares: es un modelo DIDÁCTICO
// físicamente coherente (Hazen-Williams, curva cuadrática de bomba, orificio) que se declara como tal en la interfaz.
// Unidades internas: m, m³/s. La interfaz convierte a bar y L/min.

export const G = 9.80665, RHO = 1000;
/** bar por metro de columna de agua. */
export const BAR_PER_M = (RHO * G) / 1e5;
export const HW_EXPONENT = 1.852;

export type PipeLink = {kind: 'pipe'; id: string; a: string; b: string; lengthM: number; diameterM: number; c: number};
export type PumpLink = {kind: 'pump'; id: string; a: string; b: string; on: boolean; shutoffM: number; k: number};
export type EmitterLink = {kind: 'emitter'; id: string; a: string; elevation: number; ke: number};
export type Link = PipeLink | PumpLink | EmitterLink;
export type SolverNode = {id: string; fixedHead?: number};
export type SolveInput = {nodes: SolverNode[]; links: Link[]};
export type SolveResult = {
  converged: boolean; iterations: number; residual: number;
  /** Cota piezométrica (m) de cada nodo con agua. Los nodos sin conexión a una fuente no aparecen. */
  heads: Record<string, number>;
  /** Caudal (m³/s) de cada enlace: de `a` hacia `b`; en un emisor, hacia la atmósfera. 0 en los enlaces sin agua. */
  flows: Record<string, number>;
  wet: Set<string>;
};

/** Resistencia de Hazen-Williams: ΔH = R·Q^1,852 (Q en m³/s, ΔH en m). */
export const hwResistance = (lengthM: number, diameterM: number, c: number): number => (10.67 * lengthM) / (Math.pow(c, HW_EXPONENT) * Math.pow(diameterM, 4.871));
export const hwHeadLoss = (flow: number, link: Pick<PipeLink, 'lengthM' | 'diameterM' | 'c'>): number => hwResistance(link.lengthM, link.diameterM, link.c) * Math.pow(Math.abs(flow), HW_EXPONENT);

const LINEAR_HEAD = 1e-5, SMOOTH_ARG = 1e-12, SMOOTH_HEAD = 1e-6, ZERO_FLOW = 1e-9;

type Eval = {q: number; da: number; db: number};
function evalLink(l: Link, H: (n: string) => number): Eval {
  if (l.kind === 'pipe') {
    const R = hwResistance(l.lengthM, l.diameterM, l.c), d = H(l.a) - H(l.b), ad = Math.abs(d);
    if (ad < LINEAR_HEAD) { const slope = Math.pow(LINEAR_HEAD / R, 1 / HW_EXPONENT) / LINEAR_HEAD; return {q: d * slope, da: slope, db: -slope}; } // tramo lineal cerca de cero (como EPANET): evita la pendiente infinita
    const q = Math.sign(d) * Math.pow(ad / R, 1 / HW_EXPONENT), slope = (1 / HW_EXPONENT) * Math.pow(ad / R, 1 / HW_EXPONENT) / ad;
    return {q, da: slope, db: -slope};
  }
  if (l.kind === 'pump') {
    if (!l.on) return {q: 0, da: 0, db: 0};
    // q² = (H0 − ΔH)/k, con una rampa suave en el cierre (si no, la raíz cuadrada rompe Newton justo donde la bomba deja de dar agua).
    const arg = (l.shutoffM - (H(l.b) - H(l.a))) / l.k, root = Math.sqrt(arg * arg + SMOOTH_ARG * SMOOTH_ARG), smooth = 0.5 * (arg + root), q = Math.sqrt(smooth);
    const dq = (0.5 / Math.max(q, 1e-15)) * 0.5 * (1 + arg / root) / l.k;
    return {q, da: dq, db: -dq};
  }
  const hp = H(l.a) - l.elevation, root = Math.sqrt(hp * hp + SMOOTH_HEAD * SMOOTH_HEAD), smooth = 0.5 * (hp + root), q = l.ke * Math.sqrt(smooth);
  return {q, da: (l.ke * 0.5 / Math.max(Math.sqrt(smooth), 1e-15)) * 0.5 * (1 + hp / root), db: 0};
}

/** Elimina las filas/columnas que no aportan y resuelve J·x = r por eliminación gaussiana con pivoteo parcial. */
function gauss(A: number[][], r: number[]): number[] | null {
  const n = r.length;
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k;
    if (Math.abs(A[p][i]) < 1e-300) return null;
    if (p !== i) { [A[i], A[p]] = [A[p], A[i]]; [r[i], r[p]] = [r[p], r[i]]; }
    for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; if (f === 0) continue; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; r[k] -= f * r[i]; }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = r[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}

export function solveNetwork(input: SolveInput): SolveResult {
  const fixed = new Map<string, number>(); for (const n of input.nodes) if (n.fixedHead !== undefined) fixed.set(n.id, n.fixedHead);
  // 1. Qué nodos pueden tener agua: se propaga desde las fuentes por tuberías (en ambos sentidos) y por bombas encendidas (solo de la succión a la descarga).
  const wet = new Set<string>(fixed.keys());
  for (let changed = true; changed;) {
    changed = false;
    for (const l of input.links) {
      if (l.kind === 'pipe') { if (wet.has(l.a) !== wet.has(l.b)) { wet.add(l.a); wet.add(l.b); changed = true; } }
      else if (l.kind === 'pump') { if (l.on && wet.has(l.a) && !wet.has(l.b)) { wet.add(l.b); changed = true; } }
    }
  }
  const links = input.links.filter(l => (l.kind === 'emitter' ? wet.has(l.a) : wet.has(l.a) && wet.has(l.b)));
  const unknown = [...wet].filter(n => !fixed.has(n)), index = new Map(unknown.map((n, i) => [n, i]));
  const start = fixed.size ? Math.max(...fixed.values()) : 0, heads = new Map<string, number>(); for (const n of wet) heads.set(n, fixed.get(n) ?? start);
  const H = (n: string) => heads.get(n)!;
  const residual = (): {f: number[]; flows: Map<string, Eval>} => {
    const f = new Array<number>(unknown.length).fill(0), ev = new Map<string, Eval>();
    for (const l of links) {
      const e = evalLink(l, H); ev.set(l.id, e);
      const ia = index.get(l.a), ib = l.kind === 'emitter' ? undefined : index.get((l as PipeLink | PumpLink).b);
      if (ia !== undefined) f[ia] -= e.q; if (ib !== undefined) f[ib] += e.q;
    }
    return {f, flows: ev};
  };
  const norm = (f: number[]) => f.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

  let iterations = 0, state = residual(), res = norm(state.f);
  while (unknown.length && res > 1e-13 && iterations < 150) {
    iterations++;
    const J = unknown.map(() => new Array<number>(unknown.length).fill(0));
    for (const l of links) {
      const e = state.flows.get(l.id)!, ia = index.get(l.a), ib = l.kind === 'emitter' ? undefined : index.get((l as PipeLink | PumpLink).b);
      // f_a −= q ; f_b += q  ⇒  ∂f_a/∂Ha = −da, ∂f_a/∂Hb = −db, ∂f_b/∂Ha = +da, ∂f_b/∂Hb = +db
      if (ia !== undefined) { J[ia][ia] -= e.da; if (ib !== undefined) J[ia][ib] -= e.db; }
      if (ib !== undefined) { J[ib][ib] += e.db; if (ia !== undefined) J[ib][ia] += e.da; }
    }
    for (let i = 0; i < unknown.length; i++) J[i][i] -= 1e-12;
    const dx = gauss(J, state.f.map(v => -v)); if (!dx) break;
    let step = 1, accepted = false;
    for (let k = 0; k < 30; k++) {
      const old = unknown.map(n => H(n)); unknown.forEach((n, i) => heads.set(n, old[i] + step * dx[i]));
      const next = residual(), r2 = norm(next.f);
      if (r2 < res || r2 < 1e-14) { state = next; res = r2; accepted = true; break; }
      unknown.forEach((n, i) => heads.set(n, old[i])); step *= 0.5;
    }
    if (!accepted) break;
  }
  const flows: Record<string, number> = {}; for (const l of input.links) { const q = state.flows.get(l.id)?.q ?? 0; flows[l.id] = Math.abs(q) < ZERO_FLOW ? 0 : q; } // por debajo de 6·10⁻⁵ L/min es ruido numérico de las rampas suaves
  const headObj: Record<string, number> = {}; for (const n of wet) headObj[n] = H(n);
  return {converged: res <= 1e-9, iterations, residual: res, heads: headObj, flows, wet};
}
