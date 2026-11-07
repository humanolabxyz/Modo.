// Simulación lógica de Industria (fase 6): energización, contactos, mandos, instrumentos y límites honestos. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {simulate, SIM_ASSUMPTIONS, operableKind} from '../src/industria/sim/engine.ts';
import {exampleDirectStart} from '../src/industria/sim/examples.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';
import {mountProblems, overlapsOf} from '../src/industria/build/snap.ts';
import {wire, unwire} from '../src/industria/wiring/commands.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const T = (entityId, terminalId) => ({entityId, terminalId});

const p = must(exampleDirectStart());
ok('el ejemplo de arranque directo se construye con montaje y cableado reales');
assert.equal(p.mounts.length, 7); assert.equal(p.connections.length, 19); assert.deepEqual(mountProblems(p), []);
assert.deepEqual(evaluate(p).issues, [], 'el ejemplo no tiene errores de topología'); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(p))).ok);
assert.deepEqual(['qf1', 'qf2', 'fuente', 'km1', 's1', 'h1'].flatMap(id => overlapsOf(p, id)), [], 'sin piezas atravesadas'); ok('sin errores de topología, montajes coherentes y sin interferencias');

// Sin mandos: todo detenido; la red sí tiene potencial
let r = simulate(p, {});
assert.ok(r.converged); assert.equal(r.energized.km1, false); assert.equal(r.energized.motor, false); assert.equal(r.energized.h1, false); assert.equal(r.energized.fuente, false);
assert.ok(r.live.has('red:L1')); assert.ok(!r.live.has('km1:2')); assert.deepEqual(r.warnings, []); ok('apagado: la red tiene potencial, pero el circuito de mando y el motor no');

// Interruptores cerrados: fuerza llega a KM1 (arriba) y la fuente de mando se energiza; el motor aún no
r = simulate(p, {qf1: true, qf2: true});
assert.ok(r.live.has('km1:1') && r.live.has('km1:5')); assert.ok(!r.live.has('km1:2')); assert.equal(r.energized.fuente, true); assert.ok(r.live.has('s1:3')); assert.ok(!r.live.has('km1:A1'));
assert.equal(r.energized.km1, false); assert.equal(r.energized.motor, false); ok('QF1 y QF2 cerrados: la fuerza llega a KM1, la fuente CC se energiza, el motor sigue parado');

// Pulsador: excita la bobina, cierra los contactos principales, enciende el piloto y alimenta el motor
r = simulate(p, {qf1: true, qf2: true, s1: true});
assert.equal(r.energized.km1, true); assert.equal(r.closed.km1, true); assert.equal(r.energized.motor, true); assert.equal(r.energized.h1, true); assert.ok(r.live.has('motor:U1') && r.live.has('motor:W1')); assert.deepEqual(r.warnings, []);
ok('al pulsar S1: KM1 se excita, cierra sus contactos, el piloto se enciende y el motor queda alimentado');

// Sin enclavamiento: soltar el pulsador desexcita (el ejemplo no tiene realimentación)
r = simulate(p, {qf1: true, qf2: true}); assert.equal(r.energized.km1, false); assert.equal(r.energized.motor, false); ok('sin enclavamiento, al soltar el pulsador el contactor cae');
// Si QF1 está abierto no hay fuerza al motor aunque el contactor cierre
r = simulate(p, {qf2: true, s1: true}); assert.equal(r.energized.km1, true); assert.equal(r.energized.motor, false); ok('contactor cerrado sin fuerza (QF1 abierto): el motor no se alimenta');
// Cortar un cable abre el circuito
const cut = must(unwire(p, p.connections.find(c => c.a.entityId === 's1' && c.b.entityId === 'km1').id));
r = simulate(cut, {qf1: true, qf2: true, s1: true}); assert.equal(r.energized.km1, false); ok('quitar el cable del pulsador abre el circuito de mando');

// Enclavamiento (sello): el contacto 13–14 en paralelo con el pulsador mantiene la bobina. Necesita el estado anterior.
let seal = must(unwire(p, p.connections.find(c => c.a.entityId === 'km1' && c.a.terminalId === '14').id));
seal = must(wire(seal, T('km1', '14'), T('km1', 'A1')));
const on = {qf1: true, qf2: true, s1: true}, held = {qf1: true, qf2: true};
let st = simulate(seal, held); assert.equal(st.energized.km1, false, 'sin pulsar nunca arranca');
st = simulate(seal, on, st.energized); assert.equal(st.energized.km1, true);
st = simulate(seal, held, st.energized); assert.equal(st.energized.km1, true, 'soltar el pulsador: el sello mantiene la bobina'); assert.equal(st.energized.motor, true); assert.ok(st.converged);
st = simulate(seal, {qf1: true}, st.energized); assert.equal(st.energized.km1, false, 'abrir QF2 corta el mando y el sello cae');
assert.equal(simulate(p, held, {km1: true}).energized.km1, false, 'sin sello el estado previo no se mantiene'); ok('con contacto de sello el contactor se mantiene al soltar el pulsador y cae al cortar el mando');

// Multímetro: continuidad
const open = simulate(p, {}), closedQ = simulate(p, {qf1: true});
assert.match(open.measure(T('qf1', '1'), T('red', 'L1'), 'continuity').text, /sí/); assert.match(open.measure(T('qf1', '1'), T('qf1', '2'), 'continuity').text, /no$/);
assert.match(closedQ.measure(T('qf1', '1'), T('qf1', '2'), 'continuity').text, /sí/, 'un interruptor cerrado conduce'); assert.match(closedQ.measure(T('qf1', '2'), T('km1', '1'), 'continuity').text, /sí/);
assert.match(closedQ.measure(T('qf1', '1'), T('km1', '2'), 'continuity').text, /no$/, 'el contactor abierto no conduce'); ok('continuidad: cable sí, interruptor abierto no, cerrado sí, contactor abierto no');

// Multímetro: tensión con valores configurados por el usuario; honesto cuando falta la referencia o el dato
r = simulate(p, {qf1: true, qf2: true});
const vAc = r.measure(T('km1', '1'), T('red', 'N'), 'voltage'); assert.equal(vAc.value, 230); assert.equal(vAc.unit, 'V CA'); assert.match(vAc.text, /configurado/);
const vDc = r.measure(T('s1', '3'), T('fuente', 'M'), 'voltage'); assert.equal(vDc.value, 24); assert.equal(r.measure(T('fuente', 'M'), T('s1', '3'), 'voltage').value, -24);
assert.match(r.measure(T('red', 'L1'), T('red', 'L2'), 'voltage').text, /entre fases \(valor no calculado\)/);
assert.match(r.measure(T('km1', '2'), T('red', 'N'), 'voltage').text, /Sin lectura/); assert.equal(r.measure(T('red', 'L1'), T('qf1', '1'), 'voltage').value, 0);
assert.match(r.measure(T('km1', 'A1'), T('km1', 'A2'), 'voltage').text, /Sin lectura: no comparten|Sin lectura/);
const noCfg = must((await import('../src/industria/model/commands.ts')).setEntityProp(p, 'red', 'voltage', null)); assert.match(simulate(noCfg, {}).measure(T('red', 'L1'), T('red', 'N'), 'voltage').text, /no está configurada/);
assert.match(r.measure(T('km1', 'zz'), T('red', 'N'), 'voltage').text, /existan/); ok('tensión: valor configurado, signo, fases sin valor, sin referencia, sin configurar y terminal inexistente');

// Cortocircuito: se avisa y no dispara nada
let short = must(unwire(p, p.connections.find(c => c.a.entityId === 'fuente' && c.a.terminalId === 'L+' && c.b.entityId === 'km1' && c.b.terminalId === '13').id));
short = must(wire(short, T('fuente', 'L+'), T('km1', 'A2'))); // A2 ya está unido a M: L+ y M quedan en una red
r = simulate(short, {qf1: true, qf2: true}); assert.ok(r.warnings.some(w => /Cortocircuito en la simulación/.test(w) && /no están modeladas/.test(w))); assert.ok(r.converged); ok('cortocircuito: se avisa; las protecciones no están modeladas');

// Un motor con solo dos fases o fases de dos redes distintas no se considera alimentado
const two = must(unwire(p, p.connections.find(c => c.b.entityId === 'motor' && c.b.terminalId === 'W1').id));
assert.equal(simulate(two, {qf1: true, qf2: true, s1: true}).energized.motor, false); ok('motor con una fase desconectada: no se alimenta');

// Honestidad: supuestos explícitos, mandos reconocidos, nada de números sin fuente
assert.ok(SIM_ASSUMPTIONS.length >= 4 && SIM_ASSUMPTIONS.some(a => /bobina/.test(a)) && SIM_ASSUMPTIONS.some(a => /protecciones/.test(a)));
assert.equal(operableKind('breaker-3p'), 'breaker'); assert.equal(operableKind('pulsador-na'), 'pushbutton'); assert.equal(operableKind('contactor-3p'), null);
assert.ok(simulate(p, {qf1: true, qf2: true, s1: true}).liveConnections.size > 10); ok('supuestos explícitos, mandos reconocidos y cables energizados identificables');

// Determinismo y sin efectos sobre el modelo
const before = JSON.stringify(p); simulate(p, {qf1: true, qf2: true, s1: true}); assert.equal(JSON.stringify(p), before);
assert.deepEqual([...simulate(p, {qf1: true}).live].sort(), [...simulate(p, {qf1: true}).live].sort()); ok('la simulación no modifica el proyecto y es determinista');
// Pulsador NC: conduce en reposo y abre al pulsar (con piloto y con la falla de contactos)
{
  const {newIndustryProject} = await import('../src/industria/model/defaults.ts'); const {addEntity: add, setEntityProp} = await import('../src/industria/model/commands.ts');
  const {diagnose} = await import('../src/industria/faults/diagnose.ts'); const {addFault} = await import('../src/industria/faults/faults.ts');
  let q = newIndustryProject('NC');
  for (const [id, def] of [['red', 'red-3f'], ['pnc', 'pulsador-nc'], ['h', 'piloto']]) q = must(add(q, {id, definitionId: def, label: id.toUpperCase()}));
  for (const [a, b] of [[['red', 'L1'], ['pnc', '1']], [['pnc', '2'], ['h', 'X1']], [['h', 'X2'], ['red', 'N']]]) q = must(wire(q, {entityId: a[0], terminalId: a[1]}, {entityId: b[0], terminalId: b[1]}));
  assert.equal(operableKind('pulsador-nc'), 'pushbutton');
  assert.equal(simulate(q, {}).energized.h, true, 'en reposo el NC conduce y el piloto enciende'); assert.equal(simulate(q, {pnc: true}).energized.h, false, 'al pulsar abre'); assert.equal(simulate(q, {pnc: true}).closed.pnc, undefined);
  assert.match(simulate(q, {}).measure({entityId: 'pnc', terminalId: '1'}, {entityId: 'pnc', terminalId: '2'}, 'continuity').text, /sí/); assert.match(simulate(q, {pnc: true}).measure({entityId: 'pnc', terminalId: '1'}, {entityId: 'pnc', terminalId: '2'}, 'continuity').text, /no$/);
  const bad = must(addFault(q, {kind: 'contact-open', entityId: 'pnc'})); assert.equal(simulate(bad, {}).energized.h, false); assert.deepEqual(diagnose(bad, {}).candidates.map(c => c.id), ['pnc']);
  ok('pulsador NC: conduce en reposo, abre al pulsar, y su falla de contactos se localiza');
}
// Relé térmico: en servicio conduce (fuerza y auxiliar NC 95–96); disparado abre todo. No modela la sobrecarga (se dispara a mano)
{
  const {newIndustryProject} = await import('../src/industria/model/defaults.ts'); const {addEntity: add} = await import('../src/industria/model/commands.ts');
  const {diagnose} = await import('../src/industria/faults/diagnose.ts'); const {addFault, FAULT_TARGETS} = await import('../src/industria/faults/faults.ts'); const {shapeOf} = await import('../src/industria/build/shapes.ts');
  assert.equal(operableKind('rele-termico'), 'trip'); assert.deepEqual(shapeOf('rele-termico').terminals.map(t => t.id).sort(), ['1', '2', '3', '4', '5', '6', '95', '96'].sort()); assert.match(shapeOf('rele-termico').description, /no se modela la sobrecarga/); assert.ok(FAULT_TARGETS['contact-open'].includes('rele-termico'));
  let q = newIndustryProject('RT');
  for (const [id, def] of [['red', 'red-3f'], ['rt', 'rele-termico'], ['m', 'motor-3p'], ['h', 'piloto']]) q = must(add(q, {id, definitionId: def, label: id.toUpperCase()}));
  for (const [a, b] of [[['red', 'L1'], ['rt', '1']], [['red', 'L2'], ['rt', '3']], [['red', 'L3'], ['rt', '5']], [['rt', '2'], ['m', 'U1']], [['rt', '4'], ['m', 'V1']], [['rt', '6'], ['m', 'W1']], [['red', 'L1'], ['rt', '95']], [['rt', '96'], ['h', 'X1']], [['h', 'X2'], ['red', 'N']]]) q = must(wire(q, {entityId: a[0], terminalId: a[1]}, {entityId: b[0], terminalId: b[1]}));
  const ok1 = simulate(q, {}); assert.equal(ok1.energized.m, true, 'en servicio alimenta el motor'); assert.equal(ok1.energized.h, true, 'el auxiliar NC alimenta el piloto de «sin disparo»');
  const tr = simulate(q, {rt: true}); assert.equal(tr.energized.m, false, 'disparado corta la fuerza'); assert.equal(tr.energized.h, false, 'y abre el auxiliar NC'); assert.match(tr.measure({entityId: 'rt', terminalId: '95'}, {entityId: 'rt', terminalId: '96'}, 'continuity').text, /no$/);
  assert.match(ok1.measure({entityId: 'rt', terminalId: '95'}, {entityId: 'rt', terminalId: '96'}, 'continuity').text, /sí/);
  const dg = diagnose(must(addFault(q, {kind: 'contact-open', entityId: 'rt'})), {}); assert.ok(dg.candidates.some(c => c.id === 'rt' && c.injected)); ok('relé térmico: en servicio conduce fuerza y auxiliar NC, disparado los abre, y su falla de contactos se localiza');
}
console.log(`\n${n} bloques OK`);
