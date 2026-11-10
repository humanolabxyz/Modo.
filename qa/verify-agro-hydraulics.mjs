// Agro, Fase 3: solver hidráulico (casos analíticos, conservación, redes con mallas), energía, acople de puertos y el escenario completo estanque → bomba → válvula → aspersor.
// Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {solveNetwork, hwHeadLoss, hwResistance, BAR_PER_M, HW_EXPONENT} from '../src/agro/sim/hydraulics.ts';
import {portWorld, pickPort} from '../src/agro/world/placement.ts';
import {connectionGap, DOCK_TOLERANCE, compatibleTargets} from '../src/agro/world/connections.ts';
import {WorldSession} from '../src/agro/world/session.ts';
import {newWorld} from '../src/agro/model/defaults.ts';
import {parseWorld, parseWorldText, exportWorld} from '../src/agro/model/validate.ts';
import {memoryBackend} from '../src/agro/store/backend.ts';
import {WorldStore} from '../src/agro/store/worlds.ts';
import {mulberry32} from '../src/agro/terrain/noise.ts';
import {sampleHeight} from '../src/agro/terrain/heightfield.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const near = (a, b, rel = 1e-6, abs = 1e-12) => Math.abs(a - b) <= Math.max(abs, rel * Math.max(Math.abs(a), Math.abs(b)));
const bisect = (f, lo, hi) => { for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; } return (lo + hi) / 2; };
const pipeSpec = (L, D = 0.05) => ({lengthM: L, diameterM: D, c: 140});

// ── Solver: fórmulas ────────────────────────────────────────────────────
const loss = hwHeadLoss(0.002, pipeSpec(100));
assert.ok(loss > 2.2 && loss < 2.8, `pérdida de 2 L/s en 100 m de Ø50 = ${loss.toFixed(2)} m`); assert.ok(near(hwHeadLoss(0.004, pipeSpec(100)) / loss, Math.pow(2, HW_EXPONENT), 1e-9)); assert.ok(near(hwHeadLoss(0.002, pipeSpec(200)) / loss, 2, 1e-9));
ok(`Hazen-Williams: 2 L/s en 100 m de Ø50 pierden ${loss.toFixed(1)} m (valor de tabla ≈ 2,5 m); doble caudal ×${Math.pow(2, HW_EXPONENT).toFixed(2)}; doble largo ×2`);
assert.ok(near(BAR_PER_M, 0.0980665, 1e-9)); ok('1 m de columna de agua = 0,0981 bar');

// ── Solver: casos con solución independiente ────────────────────────────
{ // estanque → tubería → aspersor: gravedad pura
  const H0 = 30, L = 200, Ke = 4e-4, R = hwResistance(L, 0.05, 140);
  const Q = bisect(q => H0 - R * Math.pow(q, HW_EXPONENT) - Math.pow(q / Ke, 2), 0, 0.05);
  const r = solveNetwork({nodes: [{id: 'T', fixedHead: H0}, {id: 'E'}], links: [{kind: 'pipe', id: 'p', a: 'T', b: 'E', ...pipeSpec(L)}, {kind: 'emitter', id: 'e', a: 'E', elevation: 0, ke: Ke}]});
  assert.ok(r.converged); assert.ok(near(r.flows.e, Q, 1e-7), `${r.flows.e} vs ${Q}`); assert.ok(near(r.flows.p, r.flows.e, 1e-9)); ok(`gravedad: caudal ${(Q * 60000).toFixed(2)} L/min coincide con la solución independiente (bisección)`);
}
{ // estanque → bomba → tubería → aspersor elevado: punto de operación bomba–red
  const k = 320000, H0p = 30, L = 100, Ke = 3e-4, zE = 10, R = hwResistance(L, 0.05, 140);
  const Q = bisect(q => 5 + H0p - k * q * q - R * Math.pow(q, HW_EXPONENT) - zE - Math.pow(q / Ke, 2), 0, 0.05);
  const r = solveNetwork({nodes: [{id: 'T', fixedHead: 5}, {id: 'N'}, {id: 'S'}, {id: 'E'}], links: [{kind: 'pump', id: 'b', a: 'T', b: 'N', on: true, shutoffM: H0p, k}, {kind: 'pipe', id: 'p', a: 'N', b: 'E', ...pipeSpec(L)}, {kind: 'emitter', id: 'e', a: 'E', elevation: zE, ke: Ke}]});
  assert.ok(r.converged); assert.ok(near(r.flows.b, Q, 1e-7), `${r.flows.b} vs ${Q}`); assert.ok(near(r.heads.N - r.heads.T, H0p - k * Q * Q, 1e-7)); ok(`bomba: punto de operación ${(Q * 60000).toFixed(1)} L/min y altura ${(H0p - k * Q * Q).toFixed(2)} m coinciden con la solución independiente`);
  const hydraulicKw = 9.80665 * 1000 * Q * (H0p - k * Q * Q) / 1000; assert.ok(hydraulicKw > 0 && hydraulicKw < 2.2); ok(`potencia hidráulica ${hydraulicKw.toFixed(2)} kW, coherente con una bomba de 2,2 kW (caudal × altura × ρ·g)`);
}
{ // monotonía: más largo o más alto → menos caudal
  const Qs = [50, 100, 200, 400].map(L => solveNetwork({nodes: [{id: 'T', fixedHead: 40}, {id: 'E'}], links: [{kind: 'pipe', id: 'p', a: 'T', b: 'E', ...pipeSpec(L)}, {kind: 'emitter', id: 'e', a: 'E', elevation: 0, ke: 1e-3}]}).flows.e);
  for (let i = 1; i < Qs.length; i++) assert.ok(Qs[i] < Qs[i - 1]); ok(`más tubería, menos caudal: ${Qs.map(q => (q * 60000).toFixed(0)).join(' > ')} L/min para 50, 100, 200 y 400 m`);
  const Zs = [0, 10, 20, 30].map(z => solveNetwork({nodes: [{id: 'T', fixedHead: 40}, {id: 'E'}], links: [{kind: 'pipe', id: 'p', a: 'T', b: 'E', ...pipeSpec(50)}, {kind: 'emitter', id: 'e', a: 'E', elevation: z, ke: 1e-3}]}).flows.e);
  for (let i = 1; i < Zs.length; i++) assert.ok(Zs[i] < Zs[i - 1]); assert.equal(solveNetwork({nodes: [{id: 'T', fixedHead: 40}, {id: 'E'}], links: [{kind: 'pipe', id: 'p', a: 'T', b: 'E', ...pipeSpec(50)}, {kind: 'emitter', id: 'e', a: 'E', elevation: 45, ke: 1e-3}]}).flows.e, 0); ok('más desnivel, menos caudal; un aspersor por encima del nivel del agua no recibe nada');
}
{ // derivación en T con dos aspersores: conservación y efecto de cerrar una rama
  const net = (twoBranches) => ({nodes: [{id: 'T', fixedHead: 5}, {id: 'J'}, {id: 'E1'}, {id: 'E2'}, {id: 'N'}], links: [
    {kind: 'pump', id: 'b', a: 'T', b: 'N', on: true, shutoffM: 30, k: 320000}, {kind: 'pipe', id: 'p0', a: 'N', b: 'J', ...pipeSpec(20)},
    {kind: 'pipe', id: 'p1', a: 'J', b: 'E1', ...pipeSpec(30)}, {kind: 'emitter', id: 'e1', a: 'E1', elevation: 2, ke: 5e-4},
    ...(twoBranches ? [{kind: 'pipe', id: 'p2', a: 'J', b: 'E2', ...pipeSpec(60)}, {kind: 'emitter', id: 'e2', a: 'E2', elevation: 4, ke: 5e-4}] : [])]});
  const both = solveNetwork(net(true)), one = solveNetwork(net(false));
  assert.ok(both.converged && one.converged);
  assert.ok(near(both.flows.b, both.flows.e1 + both.flows.e2, 1e-9), 'conservación: lo que sale de la bomba = suma de los aspersores'); assert.ok(near(both.flows.p0, both.flows.p1 + both.flows.p2, 1e-9));
  assert.ok(one.flows.e1 > both.flows.e1, 'al cerrar la otra rama, esta recibe más'); assert.ok(one.flows.b < both.flows.b, 'y el total baja');
  ok(`derivación: conservación exacta (${(both.flows.b * 60000).toFixed(1)} = ${(both.flows.e1 * 60000).toFixed(1)} + ${(both.flows.e2 * 60000).toFixed(1)} L/min); cerrar una rama sube la otra de ${(both.flows.e1 * 60000).toFixed(1)} a ${(one.flows.e1 * 60000).toFixed(1)} L/min`);
}
{ // sin agua, bomba apagada, bomba que no alcanza
  const dry = solveNetwork({nodes: [{id: 'A'}, {id: 'B'}], links: [{kind: 'pipe', id: 'p', a: 'A', b: 'B', ...pipeSpec(10)}, {kind: 'emitter', id: 'e', a: 'B', elevation: 0, ke: 1e-3}]});
  assert.equal(dry.flows.p, 0); assert.equal(dry.flows.e, 0); assert.equal(dry.wet.size, 0); ok('una tubería sin conexión a un estanque no mueve agua ni tiene presión');
  const off = solveNetwork({nodes: [{id: 'T', fixedHead: 5}, {id: 'N'}], links: [{kind: 'pump', id: 'b', a: 'T', b: 'N', on: false, shutoffM: 30, k: 320000}, {kind: 'emitter', id: 'e', a: 'N', elevation: 0, ke: 1e-3}]});
  assert.equal(off.flows.b, 0); assert.equal(off.flows.e, 0); assert.ok(!off.wet.has('N')); ok('bomba apagada: no pasa agua (la bomba actúa como válvula de retención)');
  const high = solveNetwork({nodes: [{id: 'T', fixedHead: 5}, {id: 'N'}], links: [{kind: 'pump', id: 'b', a: 'T', b: 'N', on: true, shutoffM: 30, k: 320000}, {kind: 'emitter', id: 'e', a: 'N', elevation: 100, ke: 1e-3}]});
  assert.ok(high.converged); assert.equal(high.flows.b, 0); assert.equal(high.flows.e, 0); ok('un aspersor a 100 m de altura es inalcanzable para una bomba de cierre a 30 m: caudal cero y el cálculo converge');
}
{ // malla: dos tuberías en paralelo
  const r = solveNetwork({nodes: [{id: 'T', fixedHead: 30}, {id: 'N'}], links: [{kind: 'pipe', id: 'a', a: 'T', b: 'N', ...pipeSpec(100, 0.05)}, {kind: 'pipe', id: 'b', a: 'T', b: 'N', ...pipeSpec(100, 0.08)}, {kind: 'emitter', id: 'e', a: 'N', elevation: 0, ke: 1e-3}]});
  assert.ok(r.converged); const dA = hwHeadLoss(r.flows.a, pipeSpec(100, 0.05)), dB = hwHeadLoss(r.flows.b, pipeSpec(100, 0.08));
  assert.ok(near(dA, dB, 1e-7), 'en una malla las dos ramas pierden la misma altura'); assert.ok(near(r.flows.a + r.flows.b, r.flows.e, 1e-9)); assert.ok(r.flows.b > r.flows.a); ok('mallas: las ramas en paralelo pierden la misma altura, el caudal se reparte (más por la de mayor diámetro) y se conserva');
}
{ // redes aleatorias: conservación en cada nodo
  const rand = mulberry32(2026); let worst = 0, counted = 0;
  for (let trial = 0; trial < 40; trial++) {
    const nodes = [{id: 'T', fixedHead: 20 + rand() * 20}], links = []; const count = 3 + Math.floor(rand() * 6);
    for (let i = 0; i < count; i++) { nodes.push({id: 'n' + i}); const parent = i === 0 ? 'T' : (rand() < 0.25 ? 'T' : 'n' + Math.floor(rand() * i)); links.push({kind: 'pipe', id: 'p' + i, a: parent, b: 'n' + i, ...pipeSpec(10 + rand() * 150, 0.04 + rand() * 0.06)});
      if (rand() < 0.6) links.push({kind: 'emitter', id: 'e' + i, a: 'n' + i, elevation: rand() * 15, ke: 1e-4 + rand() * 6e-4}); }
    if (rand() < 0.5) links.push({kind: 'pump', id: 'pp', a: 'T', b: 'n0', on: true, shutoffM: 25, k: 200000 + rand() * 300000});
    const r = solveNetwork({nodes, links}); assert.ok(r.converged, `trial ${trial} no convergió (res ${r.residual})`);
    for (const nd of nodes) { if (nd.fixedHead !== undefined || !r.wet.has(nd.id)) continue; let net = 0; for (const l of links) { const f = r.flows[l.id]; if (l.a === nd.id) net -= f; if (l.kind !== 'emitter' && l.b === nd.id) net += f; } worst = Math.max(worst, Math.abs(net)); }
    counted++;
  }
  assert.ok(worst < 1e-9, `desbalance máximo ${worst}`); ok(`${counted} redes aleatorias convergen y conservan el caudal en cada nodo (desbalance máximo ${worst.toExponential(1)} m³/s)`);
}

// ── Sesiones con piezas reales ──────────────────────────────────────────
const mk = (seed = 31) => WorldSession.fromWorld(newWorld('Hidráulica', {seed, now: '2026-11-08T12:00:00.000Z'}));
function build(options = {}) {
  const s = mk();
  const tank = must(s.place('estanque', -50, 20, 0.7)), p1 = must(s.place('tuberia', -50, 32, 1.1)), pump = must(s.place('bomba', -50, 42, 2)), p2 = must(s.place('tuberia', -50, 52, -1)),
    valve = must(s.place('valvula', -50, 62, 0.2)), p3 = must(s.place('tuberia', -50, 70, 2.5, {params: {largoM: options.p3 ?? 6}})), sprinkler = must(s.place('emisor', -50, 80, 0, {params: {caudalNominalLmin: options.nominal ?? 200}}));
  const grid = must(s.place('acometida', -20, -40, 0)), board = must(s.place('tablero', -20, -50, 0));
  const link = (a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));
  const docks = [link(tank, 'salida', p1, 'a'), link(p1, 'b', pump, 'succion'), link(pump, 'descarga', p2, 'a'), link(p2, 'b', valve, 'a'), link(valve, 'b', p3, 'a'), link(p3, 'b', sprinkler, 'entrada')];
  if (options.power !== false) { link(grid, 'red', board, 'red'); link(board, 'salida-bomba', pump, 'alim'); if (options.switchOn !== false) must(s.setState(board.id, 'interruptor', true)); }
  return {s, tank, p1, pump, p2, valve, p3, sprinkler, grid, board, docks};
}
const entity = (s, e) => s.entity(e.id);
const reading = (s, e) => s.analyze().elements[e.id];

// Acople
{
  const {s, tank, p1, pump, sprinkler, docks} = build();
  assert.ok(docks.every(d => d.docked)); assert.equal(s.connections.length, 8);
  for (const c of s.connections.filter(c => c.kind === 'hydraulic')) {
    const a = entity(s, {id: c.a.entityId}), b = entity(s, {id: c.b.entityId}), wa = portWorld(a, a.ports.find(p => p.id === c.a.portId)), wb = portWorld(b, b.ports.find(p => p.id === c.b.portId));
    assert.ok(Math.hypot(wa.x - wb.x, wa.z - wb.z) < 1e-6, `puertos coinciden (${a.label}.${c.a.portId} ↔ ${b.label}.${c.b.portId})`); assert.ok(Math.hypot(wa.nx + wb.nx, wa.nz + wb.nz) < 1e-6, 'y se miran de frente'); assert.equal(c.status, 'connected'); assert.equal(connectionGap(s.entities, c) < DOCK_TOLERANCE, true);
  }
  ok('conectar acopla la pieza: los puertos coinciden y se miran de frente (6 uniones hidráulicas)');
  assert.ok(parseWorld(s.toWorld()).ok); ok('un mundo con la red completa pasa la validación del formato');
  assert.ok(Math.abs(entity(s, p1).pose.position[1] - sampleHeight(s.terrain.hf, entity(s, p1).pose.position[0], entity(s, p1).pose.position[2])) < 1e-9); ok('la pieza acoplada vuelve a apoyarse en el suelo');
  // Rechazos con motivo
  const t2 = must(s.place('estanque', 30, 30, 0)), pp = must(s.place('tuberia', 30, 40, 0, {params: {diametroMm: 32}}));
  let r = s.connectPorts({entityId: t2.id, portId: 'salida'}, {entityId: pp.id, portId: 'a'}); assert.equal(r.ok, false); assert.match(r.error, /diámetros no coinciden \(50 mm y 32 mm\).*adaptador/); ok('un diámetro distinto se rechaza con su motivo (falta un adaptador)');
  r = s.connectPorts({entityId: tank.id, portId: 'salida'}, {entityId: t2.id, portId: 'salida'}); assert.equal(r.ok, false); r = s.connectPorts({entityId: tank.id, portId: 'salida'}, {entityId: sprinkler.id, portId: 'entrada'}); assert.equal(r.ok, false); assert.match(r.error, /ya está conectado/); ok('dos salidas no se unen y un puerto ocupado no admite otra conexión');
  r = s.connectPorts({entityId: t2.id, portId: 'entrada'}, {entityId: t2.id, portId: 'salida'}); assert.equal(r.ok, false); assert.match(r.error, /consigo misma/); ok('una pieza no se une consigo misma');
  const before = s.connections.length; r = s.connectPorts({entityId: pump.id, portId: 'alim'}, {entityId: pp.id, portId: 'b'}); assert.equal(r.ok, false); assert.equal(s.connections.length, before); ok('un puerto de potencia no se une con uno hidráulico');
  // candidatos para la interfaz
  const targets = compatibleTargets(s.parts, {entityId: t2.id, portId: 'salida'}); assert.ok(targets.every(x => x.entityId !== t2.id)); assert.ok(!targets.some(x => x.entityId === p1.id)); assert.ok(targets.length > 0); ok('«Conectar con…» ofrece solo puertos libres y compatibles');
  // enlaces ya conectados a ambos lados: no se acopla
  const t3 = must(s.place('estanque', 70, 30, 0)), far1 = must(s.place('tuberia', 60, -30, 0)), far2 = must(s.place('tuberia', 60, -45, 0));
  must(s.connectPorts({entityId: t2.id, portId: 'salida'}, {entityId: far1.id, portId: 'a'})); must(s.connectPorts({entityId: t3.id, portId: 'salida'}, {entityId: far2.id, portId: 'a'}));
  r = s.connectPorts({entityId: far1.id, portId: 'b'}, {entityId: far2.id, portId: 'b'}); assert.equal(r.ok, false); assert.match(r.error, /ya están conectadas a otras piezas/); ok('si ninguna de las dos piezas puede moverse, no se acopla y se explica por qué');
}

// Picking de puertos
{
  const {s, pump} = build(), e = entity(s, pump), w = portWorld(e, e.ports.find(p => p.id === 'descarga'));
  let hit = pickPort(s.entities, {origin: [w.x, w.y + 3, w.z], dir: [0, -1, 0]}); assert.ok(hit); assert.ok(['bomba', 'tuberia'].includes(entity(s, {id: hit.entityId}).type));
  assert.equal(pickPort(s.entities, {origin: [w.x + 5, w.y + 3, w.z + 5], dir: [0, -1, 0]}), null); ok('el rayo elige el puerto más cercano y falla lejos de cualquiera');
}

// Escenario completo
{
  const {s, tank, p1, pump, p2, valve, p3, sprinkler, board} = build();
  const a = s.analyze(), em = reading(s, sprinkler), pm = reading(s, pump);
  assert.ok(a.solver.converged); assert.ok(a.power.energized[pump.id]); assert.equal(pm.running, true); assert.equal(pm.reason, null);
  assert.ok(em.flowLmin > 50 && em.flowLmin < 500, `${em.flowLmin} L/min`); assert.ok(em.pressureBar > 0.5 && em.pressureBar < 6); ok(`escenario completo: el aspersor recibe ${em.flowLmin.toFixed(1)} L/min a ${em.pressureBar.toFixed(2).replace('.', ',')} bar`);
  assert.ok(near(reading(s, p1).flowLmin, em.flowLmin, 1e-6) && near(reading(s, p2).flowLmin, em.flowLmin, 1e-6) && near(reading(s, p3).flowLmin, em.flowLmin, 1e-6) && near(reading(s, valve).flowLmin, em.flowLmin, 1e-6) && near(pm.flowLmin, em.flowLmin, 1e-6));
  assert.ok(near(reading(s, tank).netOutLmin, em.flowLmin, 1e-6)); assert.ok(a.balance.errorLmin < 1e-6); ok(`conservación: el mismo caudal pasa por tubería, bomba, válvula y aspersor; balance fuentes − emisores = ${a.balance.errorLmin.toExponential(1)} L/min`);
  const pIn = a.ports[`${pump.id}:succion`], pOut = a.ports[`${pump.id}:descarga`], pEnd = a.ports[`${sprinkler.id}:entrada`];
  assert.ok(pOut.pressureBar > pIn.pressureBar + 1); assert.ok(pOut.pressureBar > pEnd.pressureBar); assert.ok(near(pOut.head - pIn.head, pm.headGainM, 1e-9)); ok(`presión: ${pIn.pressureBar.toFixed(2)} bar en la succión → ${pOut.pressureBar.toFixed(2)} bar en la descarga → ${pEnd.pressureBar.toFixed(2)} bar en el aspersor`);
  assert.ok(pm.hydraulicKw > 0 && pm.shaftKw > pm.hydraulicKw && pm.nominalKw === 2.2); ok(`potencias: ${pm.hydraulicKw.toFixed(2)} kW hidráulicos, ${pm.shaftKw.toFixed(2)} kW en el eje (nominal 2,2 kW)`);
  assert.ok(near(pm.headGainM, 30 - 320000 * Math.pow(pm.flowLmin / 60000, 2), 1e-9)); ok('la altura de la bomba sigue su curva H = 30 − k·Q²');

  // Válvula
  const flow0 = em.flowLmin; must(s.setState(valve.id, 'abierta', false));
  assert.equal(reading(s, sprinkler).flowLmin, 0); assert.equal(reading(s, valve).open, false); assert.equal(reading(s, p3).wet, false); assert.equal(s.analyze().ports[`${sprinkler.id}:entrada`], undefined); assert.match(reading(s, pump).reason, /válvula cerrada|más altura/); ok('cerrar la válvula corta el caudal de su rama, deja sin presión la tubería de aguas abajo y la bomba lo explica');
  assert.ok(s.analyze().ports[`${pump.id}:descarga`].pressureBar > pOut.pressureBar); ok('con la válvula cerrada la bomba trabaja a cierre: la presión aguas arriba sube');
  s.undo(); assert.ok(near(reading(s, sprinkler).flowLmin, flow0, 1e-9)); ok('deshacer la válvula devuelve exactamente el caudal anterior');

  // Energía
  must(s.setState(board.id, 'interruptor', false));
  assert.equal(reading(s, sprinkler).flowLmin, 0); assert.equal(reading(s, pump).running, false); assert.match(reading(s, pump).reason, /interruptor de «Tablero de control 1» está apagado/); ok('con el interruptor apagado la bomba no arranca y el motivo nombra el tablero');
  s.undo();
  const {s: s2, pump: pump2} = build({power: false}); assert.equal(reading(s2, pump2).running, false); assert.match(reading(s2, pump2).reason, /Falta conectar el cable/); ok('sin cable de alimentación la bomba lo dice');
  const {s: s3, pump: pump3, board: b3} = build({switchOn: false}); assert.match(reading(s3, pump3).reason, /apagado/); s3.setState(b3.id, 'interruptor', true); assert.ok(reading(s3, pump3).running); ok('el interruptor del tablero enciende y apaga el flujo');

  // Tubería más larga → menos caudal y menos presión
  const {s: sa, sprinkler: sa1} = build({p3: 6}), {s: sb, sprinkler: sb1} = build({p3: 40});
  const ra = reading(sa, sa1), rb = reading(sb, sb1); assert.ok(rb.flowLmin < ra.flowLmin); assert.ok(rb.pressureBar < ra.pressureBar); ok(`una tubería final de 40 m en vez de 6 m baja el caudal de ${ra.flowLmin.toFixed(0)} a ${rb.flowLmin.toFixed(0)} L/min y la presión de ${ra.pressureBar.toFixed(2)} a ${rb.pressureBar.toFixed(2)} bar`);
  const grow = s.setParam(p3.id, 'largoM', 30); assert.equal(grow.ok, false); assert.match(grow.error, /Se solapa/); ok('alargar una tubería conectada por ambos extremos contra otras piezas se rechaza con su motivo');
  const lone = must(s.place('tuberia', 40, -60, 0)), tankB = must(s.place('estanque', 40, -80, 0)); must(s.connectPorts({entityId: tankB.id, portId: 'salida'}, {entityId: lone.id, portId: 'a'}));
  const aBefore = portWorld(s.entity(lone.id), s.entity(lone.id).ports[0]); must(s.setParam(lone.id, 'largoM', 30)); const aAfter = portWorld(s.entity(lone.id), s.entity(lone.id).ports[0]);
  assert.ok(Math.hypot(aBefore.x - aAfter.x, aBefore.z - aAfter.z) < 1e-6); assert.equal(s.analyze().stretched.length, 0); ok('alargar una tubería conectada la extiende desde su unión: el puerto conectado no se mueve');

  // Desnivel: subir el terreno bajo el aspersor
  const {s: sc, sprinkler: sc1} = build(), f1 = reading(sc, sc1).flowLmin, at = sc.entity(sc1.id).pose.position;
  sc.beginStroke(); for (let k = 0; k < 3; k++) sc.stamp('raise', at[0], at[2], 12, 3); assert.ok(sc.endStroke()); must(sc.commitStroke('reseat'));
  assert.ok(sc.entity(sc1.id).pose.position[1] > at[1] + 5); assert.ok(reading(sc, sc1).flowLmin < f1); ok(`el desnivel cuenta: elevar el terreno bajo el aspersor ${(sc.entity(sc1.id).pose.position[1] - at[1]).toFixed(1)} m baja el caudal de ${f1.toFixed(0)} a ${reading(sc, sc1).flowLmin.toFixed(0)} L/min`);
}

// Mover una pieza conectada no pierde ni duplica conexiones
{
  const {s, p2, sprinkler} = build(), count = s.connections.length, ids = s.connections.map(c => c.id).join(), flow0 = reading(s, sprinkler).flowLmin, before = s.entity(p2.id).pose.position.slice(), n0 = s.entities.length;
  const moved = must(s.move(p2.id, before[0] + 15, before[2] - 10)); assert.ok(moved);
  assert.equal(s.connections.length, count); assert.equal(s.connections.map(c => c.id).join(), ids); assert.equal(s.entities.length, n0);
  const a = s.analyze(); assert.ok(a.stretched.length >= 1); assert.ok(a.warnings.some(w => /está separada .* m: no conduce agua/.test(w))); assert.equal(reading(s, sprinkler).flowLmin, 0); ok(`mover una tubería conectada 18 m: las ${count} conexiones siguen registradas, las uniones separadas se avisan y no conducen`);
  assert.ok(parseWorld(s.toWorld()).ok);
  must(s.move(p2.id, before[0], before[2])); assert.equal(s.analyze().stretched.length, 0); assert.ok(near(reading(s, sprinkler).flowLmin, flow0, 1e-9)); ok('al devolverla a su sitio las uniones vuelven a conducir y el caudal es idéntico');
  assert.ok(s.disconnect(s.connections.find(c => c.kind === 'hydraulic').id).ok); assert.equal(s.connections.length, count - 1); assert.equal(reading(s, sprinkler).flowLmin, 0); s.undo(); assert.equal(s.connections.length, count); assert.ok(near(reading(s, sprinkler).flowLmin, flow0, 1e-9)); ok('desconectar corta el agua y deshacer la restablece');
}

// Dos aspersores con T: cerrar una rama sube la otra
{
  const s = mk(), tank = must(s.place('estanque', -50, 20, 0)), pump = must(s.place('bomba', -50, 30, 0)), tee = must(s.place('te', -50, 40, 0)), v1 = must(s.place('valvula', -50, 50, 0)), v2 = must(s.place('valvula', -50, 60, 0)), e1 = must(s.place('emisor', -50, 70, 0)), e2 = must(s.place('emisor', -50, 80, 0)), grid = must(s.place('acometida', -20, -40, 0)), board = must(s.place('tablero', -20, -50, 0));
  const c = (a, ap, b, bp) => must(s.connectPorts({entityId: a.id, portId: ap}, {entityId: b.id, portId: bp}));
  c(tank, 'salida', pump, 'succion'); c(pump, 'descarga', tee, 'a'); c(tee, 'b', v1, 'a'); c(v1, 'b', e1, 'entrada'); c(tee, 'c', v2, 'a'); c(v2, 'b', e2, 'entrada'); c(grid, 'red', board, 'red'); c(board, 'salida-bomba', pump, 'alim'); must(s.setState(board.id, 'interruptor', true));
  const both = s.analyze(), q1 = reading(s, e1).flowLmin, q2 = reading(s, e2).flowLmin; assert.ok(q1 > 0 && q2 > 0); assert.ok(near(reading(s, pump).flowLmin, q1 + q2, 1e-6)); assert.ok(both.balance.errorLmin < 1e-6);
  must(s.setState(v2.id, 'abierta', false)); const q1b = reading(s, e1).flowLmin; assert.equal(reading(s, e2).flowLmin, 0); assert.ok(q1b > q1); assert.ok(near(reading(s, pump).flowLmin, q1b, 1e-6)); ok(`derivación en T: conserva el caudal (${q1.toFixed(1)} + ${q2.toFixed(1)} = ${(q1 + q2).toFixed(1)} L/min); cerrar una válvula lleva la otra rama de ${q1.toFixed(1)} a ${q1b.toFixed(1)} L/min`);
}

// Guardar, reabrir y repetir: el análisis es determinista
{
  const {s} = build(), analysis = JSON.stringify(s.analyze()), store = new WorldStore(memoryBackend()); assert.ok((await store.save(s.toWorld())).ok);
  const again = WorldSession.fromWorld(must(await store.load(s.id))); assert.equal(JSON.stringify(again.analyze()), analysis); assert.deepEqual(again.entities, s.entities); assert.deepEqual(again.connections, s.connections);
  const viaFile = WorldSession.fromWorld(must(parseWorldText(exportWorld(s.toWorld()).text))); assert.equal(JSON.stringify(viaFile.analyze()), analysis); ok('guardar, reabrir e importar el mundo reproducen el mismo análisis, bit a bit (mismo navegador y versión)');
}

// Mundos de la Fase 2 (puerto del estanque «hacia arriba»): se actualizan al abrir sin perder conexiones
{
  const s = mk(), t = must(s.place('estanque', 0, 0, 0)), world = s.toWorld(); world.entities = world.entities.map(e => ({...e, ports: e.ports.map(p => (p.id === 'entrada' ? {...p, local: [0, 2.4, 0], normal: [0, 1, 0]} : p))}));
  assert.ok(parseWorld(world).ok); const reopened = WorldSession.fromWorld(world); const entrada = reopened.entity(t.id).ports.find(p => p.id === 'entrada'); assert.deepEqual(entrada.normal, [-1, 0, 0]); ok('al abrir un mundo viejo, los puertos de cada pieza se actualizan a la definición vigente del catálogo');
}

console.log(`\n${n} comprobaciones OK`);
