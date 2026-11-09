// Agro, Fase 6: inventario, compras y obras (experiencia «real»). Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {ECON, LABOR_CLP_PER_HOUR, MAX_ORDER_QTY, START_MONEY, available, buildSeconds, deliverDue, initEconomy, inConstruction, isTracked, laborCost, obraProgress, placeOrder, priceOf} from '../src/agro/economy/economy.ts';
import {ITEMS} from '../src/agro/catalog/items.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, exportWorld} from '../src/agro/model/validate.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const bad = (r, re) => { assert.ok(!r.ok, 'debía fallar'); if (re) assert.match(r.error, re); };
const DAY = 86400, H = 3600;
const link = (s, a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));

// ── Tabla de precios ───────────────────────────────────────────────────
{
  for (const d of ITEMS) { if (d.id === 'parcela') { assert.ok(!isTracked('parcela')); continue; } assert.ok(isTracked(d.id), `${d.id} tiene precio`); const e = ECON[d.id]; assert.ok(e.priceClp > 0 && e.leadDays >= 1 && e.buildHours > 0, d.id); }
  assert.equal(Object.keys(ECON).length, ITEMS.length - 1); assert.equal(laborCost('bomba'), 4 * LABOR_CLP_PER_HOUR); assert.equal(buildSeconds('te'), 1800); assert.equal(priceOf('parcela'), 0);
  ok('todas las piezas del catálogo (salvo la parcela, que es una zona del suelo) tienen precio, plazo y tiempo de montaje');
}

// ── Modo libre: nada cambia ────────────────────────────────────────────
{
  const s = WorldSession.fromWorld(newWorld('Libre', {seed: 3}));
  assert.equal(s.experience, 'free'); assert.equal(s.economy, null); assert.equal(s.stockOf('bomba'), Infinity);
  const pump = must(s.place('bomba', 0, 0, 0)); assert.equal(inConstruction(pump), false); assert.equal('economy' in s.toWorld(), false);
  bad(s.buy('bomba', 1), /modo real/);
  ok('en modo libre se coloca sin inventario ni obra, no hay economía y un mundo libre se guarda como antes');
}

// ── Compras: reglas ────────────────────────────────────────────────────
{
  let eco = initEconomy([], 0); assert.equal(eco.money, START_MONEY);
  bad(placeOrder(eco, 'parcela', 1, 0), /no se compra/); bad(placeOrder(eco, 'bomba', 0, 0), /entero/); bad(placeOrder(eco, 'bomba', 1.5, 0), /entero/); bad(placeOrder(eco, 'bomba', MAX_ORDER_QTY + 1, 0), /entre 1 y/);
  bad(placeOrder(eco, 'granero', 1, 0), /No alcanza/);   // 6,5 millones > capital inicial
  eco = must(placeOrder(eco, 'bomba', 2, 100)); assert.equal(eco.money, START_MONEY - 2 * priceOf('bomba')); assert.equal(eco.orders[0].deliverAt, 100 + 3 * DAY);
  bad(placeOrder(eco, 'invernadero', 1, 0), /No alcanza/); bad(placeOrder({...eco, money: 10}, 'bomba', 1, 0), /No alcanza/);
  let r = deliverDue(eco, 100 + 3 * DAY - 1); assert.equal(r.received.length, 0); assert.equal(r.economy.delivered.bomba ?? 0, 0);
  r = deliverDue(eco, 100 + 3 * DAY); assert.equal(r.economy.delivered.bomba, 2); assert.equal(r.received.length, 1); assert.ok(r.economy.orders[0].delivered);
  assert.equal(deliverDue(r.economy, 1e9).received.length, 0, 'un pedido entregado no se entrega dos veces');
  assert.equal(eco.ledger.at(-1).amount, -2 * priceOf('bomba'));
  ok('compras: valida pieza, cantidad y fondos; se paga al pedir; llega justo al vencer el plazo y una sola vez; todo queda en el libro de movimientos');
}

// ── Flujo completo en modo real ────────────────────────────────────────
{
  const s = WorldSession.fromWorld(newWorld('Real', {seed: 9}));
  must(s.setExperience('real')); assert.equal(s.economy.money, START_MONEY); assert.equal(s.stockOf('bomba'), 0);
  bad(s.place('bomba', 0, 0, 0), /inventario/);
  must(s.buy('estanque', 1)); must(s.buy('tuberia', 2)); must(s.buy('bomba', 1)); must(s.buy('emisor', 1)); must(s.buy('acometida', 1)); must(s.buy('tablero', 1));
  const spent = 850_000 + 2 * 65_000 + 430_000 + 22_000 + 520_000 + 380_000; assert.equal(s.economy.money, START_MONEY - spent);
  bad(s.place('estanque', -10, -8, 0), /inventario/);
  s.advance(6 * DAY); bad(s.place('acometida', 8, -8, 0), /inventario/);   // la acometida tarda 7 días
  s.advance(1 * DAY); assert.equal(s.stockOf('estanque'), 1); assert.equal(s.stockOf('acometida'), 1);
  assert.ok(s.events.filter(e => /Llegó el pedido/.test(e.text)).length >= 6);
  const put = (t, x, z) => must(s.place(t, x, z, 0));
  const money0 = s.economy.money, tank = put('estanque', -10, -8), p1 = put('tuberia', -10, -3), pump = put('bomba', -10, 2), p2 = put('tuberia', -10, 7), spr = put('emisor', -10, 14), grid = put('acometida', 8, -8), board = put('tablero', 8, -4);
  assert.equal(s.stockOf('estanque'), 0); assert.ok(inConstruction(s.entity(tank.id)));
  assert.equal(s.economy.money, money0 - [tank, p1, pump, p2, spr, grid, board].reduce((a, e) => a + laborCost(e.type), 0));
  assert.ok(s.economy.ledger.some(l => /Mano de obra: montaje de Bomba/.test(l.text)));
  link(s, tank, 'salida', p1, 'a'); link(s, p1, 'b', pump, 'succion'); link(s, pump, 'descarga', p2, 'a'); link(s, p2, 'b', spr, 'entrada'); link(s, grid, 'red', board, 'red'); link(s, board, 'salida-bomba', pump, 'alim');
  must(s.setState(board.id, 'interruptor', true)); must(s.setState(tank.id, 'nivelL', 8000));
  assert.equal(s.analyze().balance.emittersLmin, 0, 'en obra la red no existe: no sale agua');
  assert.equal(s.analyze().elements[pump.id], undefined);
  // avanza 5 horas: el estanque (6 h) y el tablero (6 h) siguen en obra, la bomba (4 h) ya terminó
  s.advance(5 * H); assert.equal(inConstruction(s.entity(pump.id)), false); assert.ok(inConstruction(s.entity(tank.id)));
  assert.ok(Math.abs(obraProgress(s.entity(tank.id), s.clock.simSeconds) - 5 / 6) < 1e-9);
  assert.equal(s.analyze().balance.emittersLmin, 0);
  s.advance(3 * H); assert.ok(inConstruction(s.entity(grid.id)), 'la acometida (8 h) sigue en obra');
  s.advance(1 * H); for (const e of [tank, p1, pump, p2, spr, grid, board]) assert.equal(inConstruction(s.entity(e.id)), false, e.label);
  assert.ok(s.events.filter(e => /Terminó el montaje/.test(e.text)).length === 7);
  assert.ok(s.analyze().balance.emittersLmin > 30, `ya riega: ${s.analyze().balance.emittersLmin}`);
  ok('flujo real completo: comprar → esperar el plazo → colocar (consume inventario y cobra mano de obra) → en obra la red no existe → cada pieza termina a su hora y recién entonces hay riego');
  // deshacer / eliminar devuelven la unidad al inventario; el tiempo y el dinero no se deshacen
  const sim = s.clock.simSeconds, m = s.economy.money;
  must(s.remove(spr.id, {confirm: true})); assert.equal(s.stockOf('emisor'), 1); assert.equal(s.clock.simSeconds, sim);
  assert.ok(s.undo()); assert.equal(s.stockOf('emisor'), 0); assert.equal(inConstruction(s.entity(spr.id)), false, 'deshacer no devuelve una pieza ya montada a «en obra»');
  assert.equal(s.economy.money, m);
  ok('eliminar devuelve la pieza al inventario; deshacer la restituye ya montada; el tiempo y el dinero no se deshacen');
  // archivo
  const doc = s.toWorld(), back = must(parseWorld(JSON.parse(exportWorld(doc).text)));
  assert.deepEqual(back.economy, doc.economy); assert.equal(back.experience, 'real');
  const s2 = WorldSession.fromWorld(back); assert.equal(s2.economy.money, s.economy.money); assert.equal(s2.stockOf('bomba'), s.stockOf('bomba'));
  const a = s, b = s2; a.advance(5 * DAY); b.advance(5 * DAY); assert.deepEqual(a.entity(tank.id).state, b.entity(tank.id).state);
  ok('guardar y reabrir conserva el modo, el dinero, los pedidos y el libro; ambos mundos evolucionan igual');
  // volver a libre
  must(s.setExperience('free')); assert.equal(s.stockOf('bomba'), Infinity); must(s.place('bomba', 30, 0, 0)); assert.ok(s.economy, 'la economía se conserva');
  must(s.setExperience('real')); assert.equal(s.economy.money, m); assert.equal(s.stockOf('bomba'), 0, 'lo colocado en modo libre ya no deja unidades disponibles');
  ok('volver a modo libre deja colocar sin límite y conserva la economía; al volver a real sigue el mismo dinero');
}

// ── Obra interrumpida al volver a libre ────────────────────────────────
{
  const s = WorldSession.fromWorld(newWorld('Obra', {seed: 4})); must(s.setExperience('real')); must(s.buy('molino', 1)); s.advance(10 * DAY);
  const mill = must(s.place('molino', 0, 0, 0)); assert.ok(inConstruction(s.entity(mill.id))); s.advance(12 * H); assert.ok(Math.abs(obraProgress(s.entity(mill.id), s.clock.simSeconds) - 0.5) < 1e-9);
  must(s.setExperience('free')); assert.equal(inConstruction(s.entity(mill.id)), false);
  ok('al pasar a modo libre las obras en curso se terminan (todo existe de inmediato)');
}

// ── Archivos dañados ───────────────────────────────────────────────────
{
  const s = WorldSession.fromWorld(newWorld('Real', {seed: 5})); must(s.setExperience('real')); must(s.buy('bomba', 2));
  const good = JSON.parse(exportWorld(s.toWorld()).text), mut = f => { const d = JSON.parse(JSON.stringify(good)); f(d); return parseWorld(d); };
  bad(mut(d => { d.economy.money = 'mucho'; }), /economía/i); bad(mut(d => { d.economy.delivered = {bomba: -1}; }), /recibidas/); bad(mut(d => { d.economy.delivered = {bomba: 1.5}; }), /recibidas/);
  bad(mut(d => { d.economy.orders[0].qty = 0; }), /pedido/); bad(mut(d => { d.economy.orders[0].delivered = 'si'; }), /pedido/); bad(mut(d => { d.economy.orders = new Array(201).fill(d.economy.orders[0]); }), /demasiados/);
  bad(mut(d => { d.economy.ledger[0].text = 'x'.repeat(500); }), /movimiento/); bad(mut(d => { d.economy = [1]; }), /formato/);
  const clean = must(mut(d => { d.economy.extra = 1; d.economy.orders[0].evil = '<b>'; })); assert.equal('extra' in clean.economy, false); assert.equal('evil' in clean.economy.orders[0], false);
  ok('archivo dañado: dinero no numérico, unidades negativas o con decimales, pedidos mal formados, demasiados pedidos y textos largos se rechazan; los campos desconocidos se descartan');
}

// ── Rendimiento ────────────────────────────────────────────────────────
{
  const s = WorldSession.fromWorld(newWorld('Perf', {seed: 6})); must(s.setExperience('real')); for (let i = 0; i < 10; i++) must(s.buy('cerca', 5));
  s.advance(3 * DAY); let placed = 0; for (let i = 0; i < 40; i++) if (s.place('cerca', -100 + i * 12, 40, 0).ok) placed++; assert.ok(placed >= 10, `${placed} obras`);
  const t0 = performance.now(); s.advance(60 * DAY); const dt = performance.now() - t0; assert.ok(dt < 3000, `${dt}`);
  ok(`rendimiento: 60 días con ${placed} obras y 10 pedidos en ${dt.toFixed(0)} ms`);
}

console.log(`\n${n} bloques de verificación de Agro (inventario, compras y obras) en verde.`);
