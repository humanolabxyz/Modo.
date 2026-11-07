// PLC en escalera y HMI de Industria (fase 7): programa, escaneo, variables, HMI, migración v1→v2 y simulación integrada. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {newIndustryProject} from '../src/industria/model/defaults.ts';
import {addEntity, removeEntity, dependenciesOf} from '../src/industria/model/commands.ts';
import {parseIndustryProject, migrate} from '../src/industria/model/validate.ts';
import {importProject, exportProject, emptyLibrary, readLibrary} from '../src/industria/model/library.ts';
import * as P from '../src/industria/plc/program.ts';
import {simulate} from '../src/industria/sim/engine.ts';
import {examplePlcStartStop} from '../src/industria/sim/examples.ts';
import {evaluate} from '../src/industria/wiring/engine.ts';
import {mountProblems, overlapsOf} from '../src/industria/build/snap.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };

// — Escaneo de escalera —
const prog = {memory: [], rungs: [{id: 'r1', branches: [[{tag: 'A'}, {tag: 'B', nc: true}], [{tag: 'C'}]], coil: {tag: 'Y', mode: 'out'}}, {id: 'r2', branches: [[{tag: 'S'}]], coil: {tag: 'M', mode: 'set'}}, {id: 'r3', branches: [[{tag: 'R'}]], coil: {tag: 'M', mode: 'reset'}}]};
assert.equal(P.scan(prog, {A: true}).Y, true); assert.equal(P.scan(prog, {A: true, B: true}).Y, false); assert.equal(P.scan(prog, {C: true, B: true}).Y, true); assert.equal(P.scan(prog, {}).Y, false);
let v = P.scan(prog, {S: true}); assert.equal(v.M, true); v = P.scan(prog, {M: true}); assert.equal(v.M, true, 'set mantiene'); v = P.scan(prog, {M: true, R: true}); assert.equal(v.M, false); v = P.scan(prog, {S: true, R: true}); assert.equal(v.M, false, 'reset gana por ir después');
assert.deepEqual(P.rungFlow(prog.rungs[0], {A: true, B: true, C: false}), {branches: [[true, false], [false]], on: false}); ok('escaneo: serie, paralelo, NC, bobina, set y reset en orden');

// — Edición del programa —
let p = newIndustryProject('PLC'); p = must(addEntity(p, {id: 'plc', definitionId: 'plc-generico', label: 'PLC'})); p = must(addEntity(p, {id: 'km1', definitionId: 'contactor-3p', label: 'KM1'}));
assert.ok(!P.addMemory(p, 'km1', 'X').ok); assert.match(P.addMemory(p, 'km1', 'X').error, /no es un PLC/);
p = must(P.setTerminalTag(p, 'plc', 'DI0', 'START')); p = must(P.setTerminalTag(p, 'plc', 'DO0', 'MOTOR')); p = must(P.addMemory(p, 'plc', 'AUX'));
assert.deepEqual(P.tagsOf(p, 'plc').map(t => [t.name, t.kind]), [['START', 'input'], ['MOTOR', 'output'], ['AUX', 'memory']]); assert.equal(p.bindings.length, 2);
assert.ok(!P.setTerminalTag(p, 'plc', 'DI1', 'START').ok); assert.match(P.setTerminalTag(p, 'plc', 'DI1', 'START').error, /Ya existe/);
assert.ok(!P.setTerminalTag(p, 'plc', 'DI1', '1mal').ok); assert.ok(!P.setTerminalTag(p, 'plc', 'L+', 'X').ok); assert.ok(!P.addMemory(p, 'plc', 'MOTOR').ok);
p = must(P.addRung(p, 'plc', {tag: 'MOTOR'}, [{tag: 'START'}])); const rid = p.plc.plc.rungs[0].id;
p = must(P.addBranch(p, 'plc', rid)); p = must(P.addContact(p, 'plc', rid, 1, {tag: 'MOTOR'})); p = must(P.toggleContact(p, 'plc', rid, 0, 0)); assert.equal(p.plc.plc.rungs[0].branches[0][0].nc, true); p = must(P.toggleContact(p, 'plc', rid, 0, 0)); assert.equal(p.plc.plc.rungs[0].branches[0][0].nc, undefined);
assert.ok(!P.removeBranch(p, 'plc', rid, 5).ok); assert.ok(P.removeBranch(p, 'plc', rid, 1).ok); assert.match(P.removeBranch(must(P.removeBranch(p, 'plc', rid, 1)), 'plc', rid, 0).error, /al menos una rama/);
assert.ok(!P.addContact(p, 'plc', rid, 9, {tag: 'START'}).ok); assert.ok(!P.addContact(p, 'plc', rid, 0, {tag: '9'}).ok); assert.ok(!P.setCoil(p, 'plc', 'no', {tag: 'X', mode: 'out'}).ok);
// renombrar una variable asociada actualiza el programa
p = must(P.setTerminalTag(p, 'plc', 'DI0', 'MARCHA')); assert.equal(p.plc.plc.rungs[0].branches[0][0].tag, 'MARCHA'); assert.ok(p.bindings.some(b => b.target === 'MARCHA') && !p.bindings.some(b => b.target === 'START'));
// quitar una variable en uso se rechaza; una libre se quita
assert.match(P.setTerminalTag(p, 'plc', 'DI0', null).error, /se usa en el programa/); assert.match(P.removeMemory(must(P.addRung(p, 'plc', {tag: 'AUX'})), 'plc', 'AUX').error, /se usa/); ok('variables y líneas: altas, validación, renombrado que arrastra el programa y rechazos');

// — Comprobación del programa —
let c = must(P.addRung(p, 'plc', {tag: 'MARCHA'}, [{tag: 'FANTASMA'}])); const issues = P.checkProgram(c, 'plc');
assert.ok(issues.some(i => /FANTASMA/.test(i.message) && i.severity === 'error')); assert.ok(issues.some(i => /MARCHA/.test(i.message) && /entrada/.test(i.message)));
assert.ok(P.checkProgram(must(P.addRung(p, 'plc', {tag: 'MOTOR'}, [])), 'plc').some(i => i.severity === 'warning' && /siempre activa/.test(i.message))); assert.deepEqual(P.checkProgram(p, 'plc'), []); ok('comprobación: variable sin definir, escribir en una entrada, línea sin contactos');

// — HMI —
let h = must(P.addWidget(p, {kind: 'lamp', label: 'MOTOR', plcId: 'plc', tag: 'MOTOR'})); h = must(P.addWidget(h, {kind: 'button', label: 'AUX', plcId: 'plc', tag: 'AUX'})); h = must(P.addWidget(h, {kind: 'label', label: 'Título'}));
assert.equal(h.hmi.widgets.length, 3); assert.match(P.addWidget(p, {kind: 'button', label: 'X', plcId: 'plc', tag: 'MOTOR'}).error, /variable interna/); assert.ok(!P.addWidget(p, {kind: 'lamp', label: 'X', plcId: 'plc', tag: 'NO'}).ok); assert.ok(!P.addWidget(p, {kind: 'lamp', label: 'X'}).ok);
assert.match(P.removeMemory(h, 'plc', 'AUX').error, /widget/); const up = must(P.updateWidget(h, h.hmi.widgets[0].id, {label: 'Marcha'})); assert.equal(up.hmi.widgets[0].label, 'Marcha'); assert.ok(!P.updateWidget(h, h.hmi.widgets[1].id, {tag: 'MOTOR'}).ok);
assert.equal(must(P.removeWidget(h, h.hmi.widgets[0].id)).hmi.widgets.length, 2); ok('HMI: widgets validados, botones solo sobre variables internas');
// Eliminar el PLC pide confirmación por su programa y widgets y se los lleva
const dep = dependenciesOf(h, 'plc'); assert.ok(dep.program >= 3); const refuse = removeEntity(h, 'plc'); assert.ok(!refuse.ok); assert.match(refuse.error, /línea\(s\) de programa, widget\(s\) de HMI o falla\(s\)/);
const gone = must(removeEntity(h, 'plc', {confirm: true})); assert.equal(gone.plc.plc, undefined); assert.ok(gone.hmi.widgets.every(w => w.plcId !== 'plc')); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(gone))).ok); ok('eliminar un PLC con programa pide confirmación y limpia solo lo suyo');

// — Persistencia, validación y migración v1→v2 —
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(h))).ok); assert.deepEqual(parseIndustryProject(JSON.parse(JSON.stringify(h))).value.plc, h.plc);
const bad = JSON.parse(JSON.stringify(h)); bad.plc.plc.rungs[0].coil.tag = '9x'; assert.ok(!parseIndustryProject(bad).ok); const bad2 = JSON.parse(JSON.stringify(h)); bad2.hmi.widgets[0].plcId = 'nadie'; assert.ok(!parseIndustryProject(bad2).ok);
const v1 = JSON.parse(JSON.stringify(newIndustryProject('Antiguo'))); delete v1.plc; delete v1.hmi; v1.version = 1;
const mig = parseIndustryProject(v1); assert.ok(mig.ok, mig.error); assert.equal(mig.value.version, 4); assert.deepEqual(mig.value.lesson, {activityId: null, answers: {}, submitted: null}); assert.deepEqual(mig.value.faults, []); assert.deepEqual(mig.value.plc, {}); assert.deepEqual(mig.value.hmi, {widgets: []});
const lib = JSON.stringify({projects: [v1], active: v1.id}); assert.equal(readLibrary(lib).status, 'ok'); assert.equal(readLibrary(lib).library.projects[0].version, 4);
assert.ok(importProject(emptyLibrary(), JSON.stringify(v1)).library); assert.match(migrate({version: 9}).error, /más nueva/);
const ex = exportProject(h); assert.ok(importProject(emptyLibrary(), ex.text).library.projects.some(x => x.plc.plc?.rungs.length === 1)); ok('un proyecto v1 se migra a v2 (también desde la biblioteca guardada) y el PLC/HMI sobreviven a exportar e importar');

// — Ejemplo marcha/paro con PLC —
const ejemplo = must(examplePlcStartStop());
assert.equal(ejemplo.plc.plc.rungs.length, 1); assert.equal(ejemplo.plc.plc.rungs[0].branches.length, 3); assert.equal(ejemplo.hmi.widgets.length, 4); assert.deepEqual(mountProblems(ejemplo), []);
assert.deepEqual(evaluate(ejemplo).issues, []); assert.deepEqual(P.checkProgram(ejemplo, 'plc'), []); assert.deepEqual(['plc', 'b1', 's1', 's2', 'qf1', 'qf2', 'fuente', 'km1'].flatMap(id => overlapsOf(ejemplo, id)), []); ok('el ejemplo se construye sin errores de topología, de programa ni interferencias');

const W = Object.fromEntries(ejemplo.hmi.widgets.map(w => [w.label, w.id]));
const base = {qf1: true, qf2: true};
let st = simulate(ejemplo, {}); assert.equal(st.plc.plc.powered, false); assert.equal(st.energized.motor, false); ok('sin tensión el PLC no está alimentado');
st = simulate(ejemplo, base); assert.equal(st.plc.plc.powered, true); assert.equal(st.plc.plc.tags.MOTOR, false); assert.equal(st.energized.motor, false); ok('con QF1 y QF2 el PLC se alimenta y espera');
// Marcha por el pulsador físico S1 (entrada DI0) → salida DO0 → bobina → motor; sello en el programa
st = simulate(ejemplo, {...base, s1: true}, st.energized, st.plc);
assert.equal(st.plc.plc.tags.START, true); assert.equal(st.plc.plc.tags.MOTOR, true); assert.equal(st.energized.km1, true); assert.equal(st.energized.motor, true); assert.deepEqual(st.warnings, []);
st = simulate(ejemplo, base, st.energized, st.plc); assert.equal(st.plc.plc.tags.START, false); assert.equal(st.plc.plc.tags.MOTOR, true, 'el sello del programa mantiene la salida'); assert.equal(st.energized.motor, true);
st = simulate(ejemplo, {...base, s2: true}, st.energized, st.plc); assert.equal(st.plc.plc.tags.MOTOR, false); assert.equal(st.energized.motor, false);
st = simulate(ejemplo, base, st.energized, st.plc); assert.equal(st.energized.motor, false, 'el paro apagó y no rearranca solo'); ok('marcha/paro: S1 arranca, el sello mantiene, S2 para; sin rearranque solo');
// Desde la HMI
st = simulate(ejemplo, {...base, ['hmi:' + W.MARCHA]: true}, st.energized, st.plc); assert.equal(st.plc.plc.tags.HMI_START, true); assert.equal(st.energized.motor, true);
st = simulate(ejemplo, base, st.energized, st.plc); assert.equal(st.energized.motor, true, 'sello tras soltar MARCHA de la HMI');
st = simulate(ejemplo, {...base, ['hmi:' + W.PARO]: true}, st.energized, st.plc); assert.equal(st.energized.motor, false); ok('la HMI arranca y para el motor por variables internas del PLC');
// El PLC apagado pierde su estado (se corta la alimentación)
st = simulate(ejemplo, {...base, s1: true}, {}, {}); st = simulate(ejemplo, {qf2: true}, st.energized, st.plc); assert.equal(st.plc.plc.powered, true); st = simulate(ejemplo, {}, st.energized, st.plc); assert.deepEqual(st.plc.plc.tags, {}); ok('sin alimentación el PLC pierde sus variables');
// Programa que escribe una salida inexistente o cambia: no rompe la simulación
const noProg = {...ejemplo, plc: {}}; st = simulate(noProg, {...base, s1: true}); assert.equal(st.energized.motor, false); ok('sin programa la salida nunca se activa');
// — Temporizadores y contadores (fase 11) —
{
  const prog = (mode, preset) => ({memory: [], rungs: [{id: 'r1', branches: [[{tag: 'IN'}]], coil: {tag: 'Q', mode, ...(preset ? {preset} : {})}}, {id: 'r2', branches: [[{tag: 'RST'}]], coil: {tag: 'Q', mode: 'ctr'}}]});
  // TON: acumula solo mientras la línea conduce y se pone a cero al soltar
  const ton = {memory: [], rungs: [{id: 't', branches: [[{tag: 'IN'}]], coil: {tag: 'Q', mode: 'ton', preset: 1000}}]};
  let st = P.emptyScanState(), r = P.scanStep(ton, {IN: true}, st, 400); assert.equal(r.values.Q, false); assert.equal(r.state.timers.t, 400);
  r = P.scanStep(ton, {IN: true}, r.state, 400); assert.equal(r.values.Q, false); r = P.scanStep(ton, {IN: true}, r.state, 400); assert.equal(r.values.Q, true); assert.equal(r.state.timers.t, 1200);
  r = P.scanStep(ton, {IN: true}, r.state, 0); assert.equal(r.values.Q, true, 'sin avanzar el tiempo se mantiene'); r = P.scanStep(ton, {IN: false}, r.state, 100); assert.equal(r.values.Q, false); assert.equal(r.state.timers.t, 0, 'al soltar se reinicia');
  assert.equal(P.scan(ton, {IN: true}).Q, false, 'scan() sin tiempo nunca cumple un temporizador');
  // CTU: cuenta flancos, no niveles; CTR pone a cero
  const ctu = prog('ctu', 3); let c = P.scanStep(ctu, {IN: true}, P.emptyScanState()); assert.equal(c.state.counters.Q.n, 1);
  c = P.scanStep(ctu, {IN: true}, c.state); assert.equal(c.state.counters.Q.n, 1, 'mantener la entrada no cuenta'); for (const v of [false, true, false, true]) c = P.scanStep(ctu, {IN: v}, c.state); assert.equal(c.state.counters.Q.n, 3); assert.equal(c.values.Q, true);
  c = P.scanStep(ctu, {IN: false, RST: true}, c.state); assert.equal(c.state.counters.Q.n, 0); assert.equal(c.values.Q, false); ok('TON y CTU: el temporizador acumula y se reinicia, el contador cuenta flancos y se pone a cero');
  // Edición y validación
  let q = newIndustryProject('T'); q = must(addEntity(q, {id: 'plc', definitionId: 'plc-generico', label: 'PLC'})); q = must(P.setTerminalTag(q, 'plc', 'DI0', 'IN')); q = must(P.addMemory(q, 'plc', 'T1'));
  assert.ok(!P.addRung(q, 'plc', {tag: 'T1', mode: 'ton', preset: 0}).ok); assert.ok(!P.addRung(q, 'plc', {tag: 'T1', mode: 'ton', preset: 1.5}).ok); assert.ok(!P.addRung(q, 'plc', {tag: 'T1', mode: 'ctu', preset: 200000}).ok);
  q = must(P.addRung(q, 'plc', {tag: 'T1', mode: 'ton'}, [{tag: 'IN'}])); assert.equal(q.plc.plc.rungs[0].coil.preset, 3000, 'valor por defecto'); const rid2 = q.plc.plc.rungs[0].id;
  q = must(P.setCoil(q, 'plc', rid2, {tag: 'T1', mode: 'ton', preset: 500})); assert.equal(q.plc.plc.rungs[0].coil.preset, 500); assert.ok(!P.setCoil(q, 'plc', rid2, {tag: 'T1', mode: 'ton', preset: -4}).ok);
  q = must(P.setCoil(q, 'plc', rid2, {tag: 'T1', mode: 'set'})); assert.equal(q.plc.plc.rungs[0].coil.preset, undefined, 'un modo sin valor lo descarta');
  q = must(P.setCoil(q, 'plc', rid2, {tag: 'T1', mode: 'ctu', preset: 4})); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(q))).ok);
  const bad1 = JSON.parse(JSON.stringify(q)); bad1.plc.plc.rungs[0].coil.preset = 0; assert.ok(!parseIndustryProject(bad1).ok); const bad2 = JSON.parse(JSON.stringify(q)); bad2.plc.plc.rungs[0].coil.mode = 'out'; assert.ok(!parseIndustryProject(bad2).ok, 'un preset en un modo sin valor se rechaza');
  const bad3 = JSON.parse(JSON.stringify(q)); delete bad3.plc.plc.rungs[0].coil.preset; assert.ok(!parseIndustryProject(bad3).ok, 'ctu sin valor se rechaza'); ok('edición y validación de temporizadores y contadores (valores por defecto, límites, guardado y carga)');
  // Integrado en la simulación: S1 mantenido 2 s arranca el motor; al soltar se detiene y reinicia
  const {startActivity} = await import('../src/industria/activities/activities.ts'); const {toMarkdown, buildDocumentation} = await import('../src/industria/docs/generate.ts');
  let g = must(startActivity('plc')); g = must(P.setTerminalTag(g, 'plc', 'DI0', 'START')); g = must(P.setTerminalTag(g, 'plc', 'DI1', 'STOP')); g = must(P.setTerminalTag(g, 'plc', 'DO0', 'MOTOR')); g = must(P.addMemory(g, 'plc', 'T1'));
  g = must(P.addRung(g, 'plc', {tag: 'T1', mode: 'ton', preset: 2000}, [{tag: 'START'}, {tag: 'STOP', nc: true}])); g = must(P.addRung(g, 'plc', {tag: 'MOTOR'}, [{tag: 'T1'}]));
  const base = {qf1: true, qf2: true}, hold = {...base, s1: true}; let s = simulate(g, base, {}, {}, 0);
  s = simulate(g, hold, s.energized, s.plc, 0); assert.equal(s.energized.motor, false, 'sin tiempo todavía no arranca');
  for (let i = 0; i < 4; i++) { s = simulate(g, hold, s.energized, s.plc, 400); assert.equal(s.energized.motor, false, `a los ${(i + 1) * 400} ms aún no`); }
  s = simulate(g, hold, s.energized, s.plc, 400); assert.equal(s.plc.plc.tags.T1, true); assert.equal(s.energized.motor, true, 'a los 2000 ms arranca'); assert.ok(s.plc.plc.state.timers[g.plc.plc.rungs[0].id] >= 2000);
  s = simulate(g, base, s.energized, s.plc, 100); assert.equal(s.energized.motor, false, 'al soltar S1 se detiene'); assert.equal(s.plc.plc.state.timers[g.plc.plc.rungs[0].id], 0);
  // Sin alimentación el temporizador se reinicia
  const t2 = simulate(g, hold, {}, {}, 1500); const cut = simulate(g, {}, t2.energized, t2.plc, 100); assert.deepEqual(cut.plc.plc.state, P.emptyScanState());
  assert.match(toMarkdown(buildDocumentation(g, 'x')), /\[TON 2000 ms\] T1/); ok('en la simulación el motor arranca 2 s después de pulsar S1, se detiene al soltar y el temporizador se reinicia sin alimentación; la documentación lo lista');
}
console.log(`\n${n} bloques OK`);
