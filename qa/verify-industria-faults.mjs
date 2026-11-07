// Fallas y diagnóstico de Industria (fase 8): inyección, efecto en la simulación, localización y limpieza al editar. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {addFault, removeFault, clearFaults, describeFault, FAULT_TARGETS, withoutFaults} from '../src/industria/faults/faults.ts';
import {diagnose} from '../src/industria/faults/diagnose.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {exampleDirectStart, examplePlcStartStop} from '../src/industria/sim/examples.ts';
import {unwire} from '../src/industria/wiring/commands.ts';
import {removeEntity} from '../src/industria/model/commands.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {importProject, exportProject, emptyLibrary} from '../src/industria/model/library.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const d = must(exampleDirectStart());
const run = {qf1: true, qf2: true, s1: true};
const wireId = (p, a, ta, b, tb) => p.connections.find(c => c.a.entityId === a && c.a.terminalId === ta && c.b.entityId === b && c.b.terminalId === tb).id;
const withFault = (p, f) => must(addFault(p, f));

// Sano: sin síntomas
let dg = diagnose(d, run); assert.deepEqual(dg.symptoms, []); assert.deepEqual(dg.candidates, []); assert.match(dg.summary, /igual que el diseño sano/); assert.equal(simulate(d, run).energized.motor, true); ok('sin fallas no hay síntomas y el motor gira');

// Cable abierto entre KM1 y el motor
let f = withFault(d, {kind: 'wire-open', connectionId: wireId(d, 'km1', '2', 'motor', 'U1')});
assert.equal(simulate(f, run).energized.motor, false); assert.equal(simulate(f, run).energized.km1, true, 'la bobina sigue excitada');
dg = diagnose(f, run); assert.deepEqual(dg.symptoms.map(s => s.entityId), ['motor']); assert.deepEqual(dg.candidates.map(c => [c.kind, c.id, c.injected]), [['connection', wireId(d, 'km1', '2', 'motor', 'U1'), true]]); assert.match(dg.candidates[0].label, /KM1\.2 → M1\.U1/); ok('cable abierto: el motor no gira y el diagnóstico señala justo ese cable');

// Contactos del contactor que no cierran
f = withFault(d, {kind: 'contact-open', entityId: 'km1'}); dg = diagnose(f, run);
assert.equal(simulate(f, run).energized.motor, false); assert.ok(dg.candidates.some(c => c.kind === 'device' && c.id === 'km1' && c.injected && /no conducen/.test(c.reason))); assert.ok(dg.candidates.every(c => c.id === 'km1')); ok('contactos que no cierran: se señala el contactor (no los cables)');
// Bobina abierta: síntomas en cadena (contactor, piloto y motor) y la causa en la bobina
f = withFault(d, {kind: 'coil-open', entityId: 'km1'}); dg = diagnose(f, run);
assert.deepEqual(dg.symptoms.map(s => s.entityId).sort(), ['h1', 'km1', 'motor']); assert.deepEqual(dg.candidates.map(c => [c.id, c.injected]), [['km1', true]]); assert.match(dg.candidates[0].reason, /bobina/); ok('bobina abierta: tres síntomas, una causa');
// Piloto fundido
f = withFault(d, {kind: 'lamp-open', entityId: 'h1'}); dg = diagnose(f, run); assert.equal(simulate(f, run).energized.motor, true, 'el motor sigue girando'); assert.deepEqual(dg.symptoms.map(s => s.entityId), ['h1']); assert.deepEqual(dg.candidates.map(c => c.id), ['h1']); assert.match(dg.candidates[0].reason, /lámpara/); ok('piloto fundido: solo falla el piloto');
// Bobinado del motor
f = withFault(d, {kind: 'winding-open', entityId: 'motor'}); dg = diagnose(f, run); assert.deepEqual(dg.candidates.map(c => [c.id, c.injected]), [['motor', true]]); assert.match(dg.candidates[0].reason, /bobinado/); ok('bobinado abierto: se señala el motor');
// Pulsador y disyuntor
f = withFault(d, {kind: 'contact-open', entityId: 's1'}); dg = diagnose(f, run); assert.deepEqual(dg.candidates.map(c => c.id), ['s1']); ok('pulsador que no conduce: aguas arriba hay tensión y aguas abajo no');
f = withFault(d, {kind: 'contact-open', entityId: 'qf1'}); dg = diagnose(f, run); assert.ok(dg.candidates.some(c => c.id === 'qf1' && c.injected)); assert.ok(dg.symptoms.some(s => s.entityId === 'motor')); ok('disyuntor QF1 que no cierra: la fuerza no llega');
// Varias fallas: ambas aparecen
f = withFault(withFault(d, {kind: 'lamp-open', entityId: 'h1'}), {kind: 'winding-open', entityId: 'motor'}); dg = diagnose(f, run); assert.deepEqual(dg.candidates.map(c => c.id).sort(), ['h1', 'motor']); assert.equal(dg.faultCount, 2); ok('varias fallas: se localizan todas');
// Una falla que no afecta a la operación actual no produce síntomas
f = withFault(d, {kind: 'winding-open', entityId: 'motor'}); dg = diagnose(f, {qf1: true, qf2: true}); assert.deepEqual(dg.symptoms, []); ok('con el motor sin orden de marcha, la falla del bobinado no se manifiesta');

// Marcha/paro con PLC: cable de la salida abierto
const plc = must(examplePlcStartStop());
f = withFault(plc, {kind: 'wire-open', connectionId: wireId(plc, 'plc', 'DO0', 'km1', 'A1')});
const st = simulate(plc, {qf1: true, qf2: true, s1: true}), st2 = simulate(f, {qf1: true, qf2: true, s1: true});
assert.equal(st.energized.motor, true); assert.equal(st2.plc.plc.tags.MOTOR, true, 'el PLC sí activa la salida'); assert.equal(st2.energized.motor, false);
dg = diagnose(f, {qf1: true, qf2: true, s1: true}); assert.ok(dg.candidates.some(c => c.injected && /PLC\.DO0/.test(c.label))); ok('con PLC: la salida DO0 se activa pero el cable abierto impide que llegue a la bobina');
// Entrada del PLC con cable abierto: el PLC no ve el pulsador
f = withFault(plc, {kind: 'wire-open', connectionId: wireId(plc, 's1', '4', 'plc', 'DI0')}); assert.equal(simulate(f, {qf1: true, qf2: true, s1: true}).plc.plc.tags.START, false); dg = diagnose(f, {qf1: true, qf2: true, s1: true}); assert.ok(dg.candidates.some(c => c.injected)); ok('con PLC: cable de entrada abierto, el PLC no ve S1');

// Validación de fallas
assert.match(addFault(d, {kind: 'coil-open', entityId: 'motor'}).error, /no se aplica/); assert.ok(!addFault(d, {kind: 'wire-open', connectionId: 'no'}).ok); assert.ok(!addFault(d, {kind: 'lamp-open'}).ok);
const once = withFault(d, {kind: 'lamp-open', entityId: 'h1'}); assert.match(addFault(once, {kind: 'lamp-open', entityId: 'h1'}).error, /ya tiene/);
assert.equal(Object.keys(FAULT_TARGETS).length, 5); assert.match(describeFault(once, once.faults[0]), /Piloto fundido: H1/); assert.match(describeFault(f, f.faults[0]), /Cable abierto: S1\.4 → PLC\.DI0/);
assert.equal(must(removeFault(once, once.faults[0].id)).faults.length, 0); assert.ok(!removeFault(once, 'x').ok); assert.equal(must(clearFaults(once)).faults.length, 0); assert.equal(withoutFaults(once).faults.length, 0); ok('validación: tipo aplicable, objetivo existente y sin duplicados');
// Editar el diseño limpia las fallas que ya no tienen objetivo
const w = wireId(d, 'km1', '2', 'motor', 'U1'); let g = withFault(d, {kind: 'wire-open', connectionId: w}); g = must(addFault(g, {kind: 'winding-open', entityId: 'motor'}));
assert.equal(must(unwire(g, w)).faults.length, 1, 'al quitar el cable se va su falla'); const refuse = removeEntity(g, 'motor'); assert.ok(!refuse.ok); assert.match(refuse.error, /falla/);
const gone = must(removeEntity(g, 'motor', {confirm: true})); assert.equal(gone.faults.length, 0); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(gone))).ok); ok('quitar un cable o un componente se lleva sus fallas (con confirmación)');
// Persistencia y validación
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(g))).ok); const bad = JSON.parse(JSON.stringify(g)); bad.faults[0].connectionId = 'nadie'; assert.ok(!parseIndustryProject(bad).ok); const bad2 = JSON.parse(JSON.stringify(g)); bad2.faults[1].kind = 'otra'; assert.ok(!parseIndustryProject(bad2).ok);
const hidden = must(addFault(d, {kind: 'lamp-open', entityId: 'h1', hidden: true})); assert.equal(hidden.faults[0].hidden, true); const back = importProject(emptyLibrary(), exportProject(hidden).text).library.projects.find(x => x.faults.length); assert.equal(back.faults[0].hidden, true);
const v2 = JSON.parse(JSON.stringify(d)); delete v2.faults; v2.version = 2; assert.deepEqual(parseIndustryProject(v2).value.faults, []); ok('las fallas se serializan, se validan (con la marca «oculta») y un proyecto v2 las recibe vacías');
console.log(`\n${n} bloques OK`);
