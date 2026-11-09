// Inventario, compras y obras (Fase 6). Puro: se prueba en Node.
//
// Solo rige en la experiencia «real» (modo de la finca). En «libre» y «aprendizaje» todo se coloca sin costo, sin inventario y sin tiempo de obra, como en las fases anteriores.
// Los precios y plazos son ILUSTRATIVOS del escenario: no son cotizaciones de mercado ni de un proveedor.
//
// Diseño: el inventario NO se guarda como un contador que haya que mantener: lo disponible es «unidades recibidas − piezas del mundo de ese tipo». Así colocar, eliminar, deshacer y rehacer
// siempre cuadran solos. Lo que sí se guarda (y no entra en el historial, igual que el tiempo) es el dinero, los pedidos, lo recibido y el libro de movimientos.
import type {Economy, Entity, Order, Result} from '../model/types.ts';

/** Precio (CLP), plazo de entrega (días) y tiempo de montaje (horas) por tipo de pieza. La parcela es una zona del suelo: no se compra. */
export const ECON: Record<string, {priceClp: number; leadDays: number; buildHours: number}> = {
  estanque: {priceClp: 850_000, leadDays: 5, buildHours: 6},
  bomba: {priceClp: 430_000, leadDays: 3, buildHours: 4},
  tuberia: {priceClp: 65_000, leadDays: 2, buildHours: 1},
  valvula: {priceClp: 38_000, leadDays: 2, buildHours: 1},
  te: {priceClp: 14_000, leadDays: 2, buildHours: 0.5},
  emisor: {priceClp: 22_000, leadDays: 2, buildHours: 0.5},
  'sensor-humedad': {priceClp: 45_000, leadDays: 4, buildHours: 1},
  tablero: {priceClp: 380_000, leadDays: 6, buildHours: 6},
  'panel-solar': {priceClp: 210_000, leadDays: 5, buildHours: 3},
  acometida: {priceClp: 520_000, leadDays: 7, buildHours: 8},
  granero: {priceClp: 6_500_000, leadDays: 14, buildHours: 72},
  invernadero: {priceClp: 4_800_000, leadDays: 12, buildHours: 48},
  molino: {priceClp: 1_900_000, leadDays: 10, buildHours: 24},
  cerca: {priceClp: 90_000, leadDays: 2, buildHours: 2},
};
export const LABOR_CLP_PER_HOUR = 8_000;
export const START_MONEY = 5_000_000;
export const MAX_ORDER_QTY = 50, MAX_ORDERS = 200, MAX_LEDGER = 200;
export const DAY_S = 86_400;

export const isTracked = (type: string): boolean => type in ECON;
export const priceOf = (type: string): number => ECON[type]?.priceClp ?? 0;
export const laborCost = (type: string): number => Math.round((ECON[type]?.buildHours ?? 0) * LABOR_CLP_PER_HOUR);
export const buildSeconds = (type: string): number => Math.round((ECON[type]?.buildHours ?? 0) * 3600);
const ok = <T>(value: T): Result<T> => ({ok: true, value}), fail = (error: string): Result<never> => ({ok: false, error});

/** Una pieza en obra todavía no existe para la red (ni agua ni energía) ni se puede operar. */
export const inConstruction = (e: Pick<Entity, 'state'>): boolean => typeof e.state.obraHasta === 'number' && e.state.obraHasta > 0;
export const obraProgress = (e: Pick<Entity, 'state'>, now: number): number => { const a = Number(e.state.obraDesde ?? 0), b = Number(e.state.obraHasta ?? 0); return b > a ? Math.min(1, Math.max(0, (now - a) / (b - a))) : 1; };

/** Economía de un mundo que pasa a «real»: lo que ya está construido se considera recibido (nada deja de funcionar) y se parte con el capital inicial. */
export function initEconomy(entities: readonly Entity[], now: number): Economy {
  const delivered: Record<string, number> = {};
  for (const e of entities) if (isTracked(e.type)) delivered[e.type] = (delivered[e.type] ?? 0) + 1;
  return {money: START_MONEY, delivered, orders: [], ledger: [{at: now, text: 'Capital inicial de la finca (ilustrativo)', amount: START_MONEY}]};
}

export const placedCount = (entities: readonly Entity[], type: string): number => entities.reduce((n, e) => n + (e.type === type ? 1 : 0), 0);
/** Unidades de `type` que se pueden colocar ahora. */
export const available = (eco: Economy, entities: readonly Entity[], type: string): number => (isTracked(type) ? Math.max(0, (eco.delivered[type] ?? 0) - placedCount(entities, type)) : Infinity);
export const pendingQty = (eco: Economy, type: string): number => eco.orders.filter(o => !o.delivered && o.type === type).reduce((n, o) => n + o.qty, 0);

const note = (eco: Economy, at: number, text: string, amount: number): Economy => ({...eco, money: eco.money + amount, ledger: [...eco.ledger, {at, text, amount}].slice(-MAX_LEDGER)});

/** Compra `qty` unidades: se paga al pedir y llegan tras el plazo del proveedor. */
export function placeOrder(eco: Economy, type: string, qty: number, now: number, name = type): Result<Economy> {
  if (!isTracked(type)) return fail(`«${name}» no se compra.`);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ORDER_QTY) return fail(`La cantidad debe ser un entero entre 1 y ${MAX_ORDER_QTY}.`);
  if (eco.orders.filter(o => !o.delivered).length >= MAX_ORDERS) return fail('Hay demasiados pedidos pendientes.');
  const cost = priceOf(type) * qty;
  if (cost > eco.money) return fail(`No alcanza el dinero: el pedido cuesta ${clp(cost)} y hay ${clp(eco.money)}.`);
  const order: Order = {id: `p${eco.orders.length + 1}-${Math.floor(now)}`, type, qty, cost, orderedAt: now, deliverAt: now + ECON[type].leadDays * DAY_S, delivered: false};
  return ok(note({...eco, orders: [...eco.orders, order].slice(-MAX_ORDERS)}, now, `Pedido: ${qty} × ${name}`, -cost));
}

/** Entrega los pedidos cuyo plazo ya venció. Devuelve la economía nueva y los textos de lo recibido (con su instante). */
export function deliverDue(eco: Economy, now: number, nameOf: (type: string) => string = t => t): {economy: Economy; received: {at: number; text: string}[]} {
  const due = eco.orders.filter(o => !o.delivered && o.deliverAt <= now);
  if (!due.length) return {economy: eco, received: []};
  const delivered = {...eco.delivered};
  for (const o of due) delivered[o.type] = (delivered[o.type] ?? 0) + o.qty;
  return {economy: {...eco, delivered, orders: eco.orders.map(o => (due.includes(o) ? {...o, delivered: true} : o))}, received: due.map(o => ({at: o.deliverAt, text: `Llegó el pedido: ${o.qty} × ${nameOf(o.type)}.`}))};
}

/** Cobra la mano de obra de montar una pieza. */
export const chargeLabor = (eco: Economy, type: string, now: number, name = type): Economy => { const c = laborCost(type); return c > 0 ? note(eco, now, `Mano de obra: montaje de ${name}`, -c) : eco; };

export const clp = (v: number): string => `CLP $${Math.round(v).toLocaleString('es-CL')}`;
