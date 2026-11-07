// Motor de cableado de Industria (fase 5): redes, validación topológica, estados, historial y persistencia. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity, removeEntity, release} from '../src/industria/model/commands.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {pushHistory, undo, redo, emptyHistory} from '../src/industria/model/library.ts';
import {evaluate, buildNets, terminalWorld, allTerminals, cableRoute, connectionKindFor, terminalDef, MAX_WIRES_PER_TERMINAL} from '../src/industria/wiring/engine.ts';
import {wire, unwire} from '../src/industria/wiring/commands.ts';
import {moveEntity} from '../src/industria/build/commands.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const pose = (x, y, z) => ({position: [x, y, z], rotation: [0, 0, 0]});
const T = (entityId, terminalId) => ({entityId, terminalId});

let p = newIndustryProject('Cableado');
for (const [id, def, x] of [['fuente', 'fuente-cc', -0.3], ['km1', 'contactor-3p', 0], ['plc', 'plc-generico', 0.3], ['borne', 'borne-paso', 0.6], ['motor', 'motor-3p', 1]]) p = must(addEntity(p, {id, definitionId: def, label: id.toUpperCase(), pose: pose(x, 0.5, 0)}));

// Terminales en el mundo: siguen a la pieza
const t0 = terminalWorld(p, T('km1', '1')); assert.ok(t0); assert.equal(terminalWorld(p, T('km1', 'zz')), null);
const moved = must(moveEntity(p, 'km1', pose(0.5, 0.5, 0.2)));
const t1 = terminalWorld(moved, T('km1', '1')); assert.ok(Math.abs(t1[0] - t0[0] - 0.5) < 1e-9 && Math.abs(t1[2] - t0[2] - 0.2) < 1e-9);
assert.equal(allTerminals(p).length, 4 + 10 + 10 + 2 + 4); ok('terminales en el mundo, siguiendo a su pieza (el cable también se mueve)');

// Tipo de conexión según los terminales
assert.equal(connectionKindFor(terminalDef(p, T('fuente', 'L+')), terminalDef(p, T('km1', 'A1'))), 'control');
assert.equal(connectionKindFor(terminalDef(p, T('plc', 'DO0')), terminalDef(p, T('km1', 'A1'))), 'signal');
assert.equal(connectionKindFor(terminalDef(p, T('motor', 'PE')), terminalDef(p, T('motor', 'PE'))), 'earth'); ok('tipo de conexión derivado de los terminales');

// Un cable: queda «sin verificar» (piezas genéricas), nunca «valid»
p = must(wire(p, T('fuente', 'L+'), T('km1', 'A1')));
let ev = evaluate(p); const c1 = p.connections[0];
assert.equal(c1.kind, 'control'); assert.equal(c1.status, 'unverified'); assert.equal(ev.status[c1.id], 'unverified'); assert.deepEqual(ev.issues, []); ok('un cable correcto entre piezas genéricas queda «sin verificar», no «válido»');

// Redes: el cable crea una red; un borne de paso une sus dos lados internamente
p = must(wire(p, T('km1', 'A2'), T('fuente', 'M')));
p = must(wire(p, T('km1', '2'), T('borne', '1'))); p = must(wire(p, T('borne', '2'), T('motor', 'U1')));
const nets = buildNets(p); const viaBorne = nets.find(x => x.terminals.some(t => t.entityId === 'motor'));
assert.ok(viaBorne.terminals.some(t => t.entityId === 'km1' && t.terminalId === '2')); assert.equal(viaBorne.terminals.length, 4); assert.equal(nets.length, 3); ok('redes: el puente interno del borne une los dos cables en una sola red');

// Sin errores hasta aquí
ev = evaluate(p); assert.deepEqual(ev.issues, []); assert.ok(Object.values(ev.status).every(s => s === 'unverified'));

// Cortocircuito L—N de la fuente: se crea pero queda inválido en todos los cables de la red, con motivo
let s = must(wire(p, T('fuente', 'L'), T('km1', '1'))); s = must(wire(s, T('km1', '1'), T('fuente', 'N')));
const evs = evaluate(s); const short = evs.issues.find(i => i.code === 'short-circuit');
assert.ok(short); assert.match(short.message, /línea y neutro/); assert.ok(short.connectionIds.length >= 2);
for (const id of short.connectionIds) { assert.equal(evs.status[id], 'invalid'); assert.ok(evs.reasons[id].length); }
assert.equal(s.connections.find(c => c.id === short.connectionIds[0]).status, 'invalid', 'el estado guardado se actualiza');
const fixed = must(unwire(s, s.connections.at(-1).id)); assert.deepEqual(evaluate(fixed).issues, []); assert.ok(fixed.connections.every(c => c.status !== 'invalid')); ok('cortocircuito L–N detectado por red, con motivo; quitar el cable lo corrige');
// Positivo con negativo (también a través del PLC)
let q = must(wire(p, T('fuente', 'L+'), T('plc', 'L+'))); q = must(wire(q, T('plc', 'L+'), T('fuente', 'M')));
assert.ok(evaluate(q).issues.some(i => i.code === 'short-circuit' && /positivo y negativo/.test(i.message))); ok('cortocircuito positivo–negativo');

// Tierra: solo con tierra
const earthBad = must(wire(p, T('motor', 'PE'), T('km1', '3'))); const eb = evaluate(earthBad);
assert.ok(eb.issues.some(i => i.code === 'earth-mix')); assert.equal(eb.status[earthBad.connections.at(-1).id], 'invalid');
const earthBadNet = must(wire(p, T('motor', 'PE'), T('borne', '2')));
assert.ok(evaluate(earthBadNet).issues.some(i => i.code === 'earth-mix')); ok('la tierra no se mezcla con fuerza');
// PE con PE es correcto
let e2 = must(addEntity(p, {id: 'motor2', definitionId: 'motor-3p', label: 'M2', pose: pose(2, 0, 0)}));
e2 = must(wire(e2, T('motor', 'PE'), T('motor2', 'PE'))); assert.equal(e2.connections.at(-1).kind, 'earth'); assert.deepEqual(evaluate(e2).issues, []); ok('tierra con tierra es válido (sin errores)');

// Límite didáctico de cables por terminal: se rechaza al cablear
let l = p; l = must(wire(l, T('km1', '3'), T('plc', 'DI0'))); l = must(wire(l, T('km1', '3'), T('plc', 'DI1')));
const over = wire(l, T('km1', '3'), T('plc', 'DI2')); assert.ok(!over.ok); assert.match(over.error, new RegExp(`${MAX_WIRES_PER_TERMINAL} cables`)); ok('límite de cables por terminal');

// Rechazos estructurales
assert.ok(!wire(p, T('km1', '1'), T('km1', '1')).ok); assert.ok(!wire(p, T('km1', 'xx'), T('plc', 'DI0')).ok); assert.ok(!wire(p, T('nadie', '1'), T('plc', 'DI0')).ok);
assert.ok(!wire(p, T('fuente', 'L+'), T('km1', 'A1')).ok, 'duplicado'); ok('rechazos: mismo terminal, terminal inexistente, entidad inexistente, duplicado');

// Un cable a un terminal que ya no existe (definición cambiada) se marca, no rompe
const ghost = {...p, connections: [...p.connections, {id: 'c-x', kind: 'power', status: 'unverified', a: T('km1', '1'), b: T('km1', 'fantasma')}]};
assert.ok(evaluate(ghost).issues.some(i => i.code === 'unknown-terminal')); assert.equal(evaluate(ghost).status['c-x'], 'invalid'); ok('un terminal desconocido se marca como error sin fallar');

// Desconectar solo quita el cable; eliminar una pieza con cables pide confirmación y se llevan solo sus cables
const one = must(unwire(p, p.connections[0].id)); assert.equal(one.connections.length, p.connections.length - 1); assert.equal(one.entities.length, p.entities.length);
const refuse = removeEntity(p, 'km1'); assert.ok(!refuse.ok); assert.ok(refuse.dependencies.connections.length >= 3);
const del = must(removeEntity(p, 'km1', {confirm: true})); assert.ok(del.connections.every(c => c.a.entityId !== 'km1' && c.b.entityId !== 'km1')); assert.deepEqual(evaluate(del).issues, []); ok('desconectar quita solo el cable; borrar una pieza pide confirmación y limpia solo sus cables');

// Conexión ≠ montaje: cablear no monta; soltar no desconecta
assert.equal(p.mounts.length, 0); assert.ok(p.connections.length >= 4); ok('el cableado no crea montajes');

// Ruta visual: empieza y termina en los terminales y sube sobre ellos
const route = cableRoute(p, p.connections[0]); assert.deepEqual(route[0], terminalWorld(p, p.connections[0].a)); assert.deepEqual(route.at(-1), terminalWorld(p, p.connections[0].b)); assert.ok(route[2][1] > route[0][1]);
const manual = must((await import('../src/industria/model/commands.ts')).setConnectionRoute(p, p.connections[0].id, [[0, 2, 0]])); assert.equal(cableRoute(manual, manual.connections[0]).length, 3); ok('ruta del cable con elevación y rutas manuales');

// Historial: cada cable es un paso
let h = emptyHistory(), cur = p; const next = must(wire(cur, T('km1', '5'), T('plc', 'DI3'))); h = pushHistory(h, cur);
const u = undo(h, next); assert.equal(u.project.connections.length, p.connections.length); const r = redo(u.history, u.project); assert.equal(r.project.connections.length, next.connections.length); ok('deshacer y rehacer cables');

// Persistencia: el proyecto con cables se serializa, valida y conserva estados
const back = parseIndustryProject(JSON.parse(JSON.stringify(s))); assert.ok(back.ok); assert.equal(back.value.connections.length, s.connections.length); assert.equal(evaluate(back.value).issues.length, evaluate(s).issues.length); ok('serializar y volver a evaluar da lo mismo');

// Verificado solo con fuente: un ítem «verified» hace válida la conexión (se simula sin tocar el catálogo real)
import('../src/industria/catalog/items.ts').then(({ITEMS}) => {
  const a = ITEMS.find(i => i.id === 'fuente-cc'), b = ITEMS.find(i => i.id === 'contactor-3p'), prev = [a.status, b.status];
  a.status = 'verified'; b.status = 'verified';
  assert.equal(evaluate(p).status[p.connections[0].id], 'valid'); [a.status, b.status] = prev;
  assert.equal(evaluate(p).status[p.connections[0].id], 'unverified'); ok('«valid» solo si las dos piezas están verificadas');
  console.log(`\n${n} bloques OK`);
});
void release;
