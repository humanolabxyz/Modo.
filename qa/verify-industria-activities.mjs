// Actividades guiadas de Industria (fase 9): la solución correcta pasa, el punto de partida y las soluciones parciales fallan. Node 24 ejecuta .ts directamente.
import assert from 'node:assert/strict';
import {ACTIVITIES, activityOf, evaluateActivity, startActivity, setAnswer, submit, reopen, reportMarkdown, runSeq} from '../src/industria/activities/activities.ts';
import {snapMount, moveEntity} from '../src/industria/build/commands.ts';
import {findSnapCandidates} from '../src/industria/build/snap.ts';
import {wire, unwire} from '../src/industria/wiring/commands.ts';
import {exampleDirectStart, examplePlcStartStop} from '../src/industria/sim/examples.ts';
import {addBranch, addContact, addMemory, addRung, setTerminalTag} from '../src/industria/plc/program.ts';
import {parseIndustryProject} from '../src/industria/model/validate.ts';
import {importProject, exportProject, emptyLibrary} from '../src/industria/model/library.ts';
import {MODE_POLICY, policyOf} from '../src/industria/model/modes.ts';

let n = 0;
const ok = name => { n++; console.log('PASS', name); };
const must = r => { assert.ok(r.ok, r.error); return r.value; };
const results = p => Object.fromEntries(evaluateActivity(p).map(r => [r.id, r.ok]));
const passed = p => evaluateActivity(p).filter(r => r.ok).length;
const total = p => evaluateActivity(p).length;

assert.deepEqual(ACTIVITIES.map(a => a.id), ['tablero', 'arranque', 'falla', 'plc']); assert.ok(ACTIVITIES.every(a => a.checks.length >= 2 && a.checks.every(c => c.hint && c.text)));
assert.deepEqual(evaluateActivity(newProjectWithoutLesson()), []); function newProjectWithoutLesson() { return must(startActivity('tablero', 'free').ok ? {ok: true, value: {...must(startActivity('tablero')), lesson: {activityId: null, answers: {}, submitted: null}}} : {ok: false}); }
ok('cuatro actividades con comprobaciones y pistas; sin actividad no hay comprobaciones');

// Todas las actividades parten sin resolver, son válidas y se pueden exportar/importar
for (const a of ACTIVITIES) {
  const p = must(startActivity(a.id)); assert.equal(p.lesson.activityId, a.id); assert.equal(p.mode, 'learning'); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(p))).ok);
  assert.ok(passed(p) < total(p), `${a.id}: el punto de partida ya está resuelto (${passed(p)}/${total(p)})`);
  const back = importProject(emptyLibrary(), exportProject(p).text).library.projects.find(x => x.lesson.activityId === a.id); assert.ok(back);
}
assert.ok(!startActivity('nada').ok); assert.equal(must(startActivity('tablero', 'test')).mode, 'test'); ok('cada actividad parte sin resolver, es un proyecto válido y sobrevive a exportar e importar');

// 1) Tablero
let b = must(startActivity('tablero')); const b0 = results(b); assert.equal(b0.riel, false); assert.equal(b0.qf1, false);
const snapTo = (p, id, parent) => must(snapMount(p, findSnapCandidates(p, id, undefined, {range: 2}).find(c => c.parent.entityId === parent)));
b = snapTo(b, 'riel', 'placa'); assert.equal(results(b).riel, true); assert.equal(passed(b) < total(b), true);
// Los dos aparatos en el mismo tramo se atraviesan: la comprobación lo detecta
let clash = snapTo(snapTo(b, 'qf1', 'riel'), 'km1', 'riel'); assert.equal(results(clash)['sin-choques'], false); assert.equal(results(clash).qf1, true);
const railX = b.poses.riel.position[0], railZ = b.poses.riel.position[2];
b = must(moveEntity(b, 'qf1', {position: [railX - 0.12, 0.5, railZ + 0.1], rotation: [0, 0, 0]})); b = must(moveEntity(b, 'km1', {position: [railX + 0.12, 0.5, railZ + 0.1], rotation: [0, 0, 0]}));
b = snapTo(b, 'qf1', 'riel'); b = snapTo(b, 'km1', 'riel'); const rb = results(b); assert.ok(Object.values(rb).every(Boolean), JSON.stringify(rb)); ok('tablero: montar riel y aparatos pasa las 5 comprobaciones; parcial no');

// 2) Arranque directo
let d = must(startActivity('arranque')); assert.equal(d.connections.length, 0); const d0 = results(d); assert.equal(d0.gira, false); assert.equal(d0.tierra, false); assert.equal(d0.topologia, false);
const full = must(exampleDirectStart());
let partial = d; for (const c of full.connections.filter(c => c.a.entityId === 'red' && c.a.terminalId !== 'PE' || ['qf1', 'km1'].includes(c.a.entityId) || c.a.entityId === 'red')) { const r = wire(partial, c.a, c.b); if (r.ok) partial = r.value; }
assert.equal(results(partial).gira, false, 'solo la fuerza no basta: falta el mando'); assert.ok(passed(partial) < total(partial));
for (const c of full.connections) { const r = wire(d, c.a, c.b); if (r.ok) d = r.value; } assert.deepEqual(Object.values(results(d)).filter(x => !x), [], JSON.stringify(results(d))); ok('arranque directo: la fuerza sola no basta; el cableado completo pasa las 5 comprobaciones');
// Otro cableado correcto también pasa: el piloto desde otro punto de la fuente
let alt = d; const pilotWire = alt.connections.find(c => c.a.entityId === 'km1' && c.a.terminalId === '14'); alt = must(unwire(alt, pilotWire.id)); alt = must(wire(alt, {entityId: 'km1', terminalId: '14'}, {entityId: 'h1', terminalId: 'X1'}));
assert.equal(results(alt).piloto, true, 'se comprueba el comportamiento, no una solución única');
// Un error de cableado se detecta
let wrong = d; wrong = must(wire(wrong, {entityId: 'fuente', terminalId: 'L'}, {entityId: 'fuente', terminalId: 'N'})); assert.equal(results(wrong).topologia, false); ok('se evalúa el comportamiento (otro cableado válido pasa) y un cortocircuito falla la topología');
// Sin tierra
const noPe = must(unwire(d, d.connections.find(c => c.a.entityId === 'red' && c.a.terminalId === 'PE').id)); assert.equal(results(noPe).tierra, false); assert.equal(results(noPe).gira, true);

// 3) Falla
let f = must(startActivity('falla')); assert.equal(f.faults.length, 1); assert.equal(f.faults[0].hidden, true); assert.deepEqual([passed(f), total(f)], [0, 2]);
const culprit = `connection:${f.faults[0].connectionId}`;
assert.ok(activityOf('falla').answers[0].options(f).some(o => o.value === culprit)); assert.ok(!setAnswer(f, 'culprit', 'connection:inventado').ok); assert.ok(!setAnswer(f, 'otra', 'x').ok);
let fa = must(setAnswer(f, 'culprit', 'entity:km1')); assert.equal(results(fa).culprit, false); fa = must(setAnswer(fa, 'culprit', culprit)); assert.equal(results(fa).culprit, true); assert.equal(results(fa).kind, false);
fa = must(setAnswer(fa, 'kind', 'contact-open')); assert.equal(results(fa).kind, false); fa = must(setAnswer(fa, 'kind', 'wire-open')); assert.equal(passed(fa), 2); assert.equal(must(setAnswer(fa, 'kind', '')).lesson.answers.kind, undefined);
const sim = runSeq(f, [{qf1: true, qf2: true, s1: true}])[0]; assert.equal(sim.energized.motor, false, 'la falla impide el arranque'); ok('falla: la respuesta correcta pasa, las equivocadas no; las opciones incluyen el cable real y la falla impide el arranque');

// 4) PLC
let g = must(startActivity('plc')); assert.equal(g.plc.plc, undefined); assert.equal(g.bindings.filter(x => x.kind === 'plc-tag').length, 0); const g0 = results(g); assert.equal(g0.alimentado, true, 'el cableado ya está hecho'); assert.equal(g0.arranca, false); assert.equal(g0['sin-errores'], false);
g = must(setTerminalTag(g, 'plc', 'DI0', 'START')); g = must(setTerminalTag(g, 'plc', 'DI1', 'STOP')); g = must(setTerminalTag(g, 'plc', 'DO0', 'MOTOR'));
let simple = must(addRung(g, 'plc', {tag: 'MOTOR'}, [{tag: 'START'}])); const rs = results(simple); assert.equal(rs.arranca, true); assert.equal(rs.sello, false); assert.equal(rs.paro, false);
const prog = must(addRung(g, 'plc', {tag: 'MOTOR'}, [{tag: 'START'}, {tag: 'STOP', nc: true}])); const rid = prog.plc.plc.rungs[0].id;
let sealed = must(addBranch(prog, 'plc', rid)); sealed = must(addContact(sealed, 'plc', rid, 1, {tag: 'MOTOR'})); assert.equal(results(sealed).sello, true); assert.equal(results(sealed).paro, false, 'el contacto de sello sin /STOP no se puede parar');
sealed = must(addContact(sealed, 'plc', rid, 1, {tag: 'STOP', nc: true})); assert.ok(Object.values(results(sealed)).every(Boolean), JSON.stringify(results(sealed)));
const bad = must(addRung(sealed, 'plc', {tag: 'MOTOR'}, [{tag: 'FANTASMA'}])); assert.equal(results(bad)['sin-errores'], false); ok('PLC: asociar variables, arrancar, sellar y parar pasan por separado; un programa sin /STOP o con variables sin definir falla');
// Otro programa correcto (con una marca interna) también pasa
let alt2 = must(addMemory(g, 'plc', 'RUN')); alt2 = must(addRung(alt2, 'plc', {tag: 'RUN'}, [{tag: 'START'}])); const r2 = alt2.plc.plc.rungs[0].id; alt2 = must(addBranch(alt2, 'plc', r2)); alt2 = must(addContact(alt2, 'plc', r2, 1, {tag: 'RUN'}));
for (const br of [0, 1]) alt2 = must(addContact(alt2, 'plc', r2, br, {tag: 'STOP', nc: true})); alt2 = must(addRung(alt2, 'plc', {tag: 'MOTOR'}, [{tag: 'RUN'}])); assert.ok(Object.values(results(alt2)).every(Boolean), JSON.stringify(results(alt2))); ok('otro programa correcto (con variable interna) también pasa');

// Entrega, informe y reapertura
let s = sealed; assert.equal(s.lesson.submitted, null); s = must(submit(s, '2026-11-07T12:00:00Z')); assert.deepEqual([s.lesson.submitted.score, s.lesson.submitted.total], [5, 5]); assert.ok(!submit(s, 'x').ok); assert.ok(!setAnswer(must(startActivity('falla')).lesson.submitted ? s : must(submit(must(startActivity('falla')), 'y')), 'kind', 'wire-open').ok);
const rep = reportMarkdown(s); assert.match(rep, /Resultado: \*\*5 de 5\*\*/); assert.equal((rep.match(/- \[x\]/g) ?? []).length, 5); assert.equal(reportMarkdown(sealed), '');
const half = must(submit(simple, '2026-11-07T12:00:00Z')); assert.deepEqual([half.lesson.submitted.score, half.lesson.submitted.total], [3, 5]); assert.match(reportMarkdown(half), /- \[ \]/);
assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(half))).ok); assert.equal(must(reopen(half)).lesson.submitted, null); assert.ok(!reopen(sealed).ok); assert.ok(!submit(must(startActivity('tablero', 'free')) && {...sealed, lesson: {activityId: null, answers: {}, submitted: null}}, 'x').ok); ok('entrega congela el resultado, genera el informe, valida al guardar y se puede reabrir');
// Estado inválido se rechaza
const corrupt = JSON.parse(JSON.stringify(half)); corrupt.lesson.submitted.score = 1.5; assert.ok(!parseIndustryProject(corrupt).ok); const corrupt2 = JSON.parse(JSON.stringify(half)); corrupt2.lesson.answers = {a: 5}; assert.ok(!parseIndustryProject(corrupt2).ok); ok('una entrega o respuesta corrupta se rechaza al cargar');
// Política de modos: cada modo cambia algo concreto y Prueba es la más restrictiva
assert.deepEqual(Object.keys(MODE_POLICY), ['free', 'learning', 'test']);
const [fr, le, te] = ['free', 'learning', 'test'].map(policyOf);
assert.ok(le.liveChecks && le.hints && le.blockInvalidWiring && !fr.liveChecks && !fr.hints && !fr.blockInvalidWiring && !te.liveChecks && !te.hints && !te.blockInvalidWiring);
assert.ok(fr.manualCheck && !le.manualCheck && !te.manualCheck); assert.ok(fr.showIssues && le.showIssues && !te.showIssues); assert.ok(fr.autoDiagnosis && le.autoDiagnosis && !te.autoDiagnosis);
assert.ok(te.allowSubmit && !fr.allowSubmit && !le.allowSubmit && te.hideHiddenFaults && !fr.hideHiddenFaults); assert.ok(Object.values(MODE_POLICY).every(m => m.label && m.description.length > 40)); ok('política de modos: Aprendizaje guía, Libre no, Prueba evalúa sin ayudas');
// — Actividades propias (editor) —
{
  const A = await import('../src/industria/activities/activities.ts'); const sol = must(examplePlcStartStop());
  const base = {qf1: true, qf2: true};
  const def = {title: 'Marcha/paro con sello', summary: 'Programa el PLC', checks: [
    {id: 'c1', kind: 'mounted', parent: 'riel1', child: 'km1', text: 'KM1 está montado en el riel superior', hint: 'Acércalo al riel'},
    {id: 'c2', kind: 'energized', entity: 'motor', steps: [base, {...base, s1: true}, base], expect: true, text: 'El motor sigue girando al soltar S1', hint: 'Usa un sello'},
    {id: 'c3', kind: 'energized', entity: 'motor', steps: [base, {...base, s1: true}, base, {...base, s2: true}], expect: false, text: 'S2 lo detiene', hint: 'Contacto /STOP'},
    {id: 'c4', kind: 'plcTag', plc: 'plc', tag: 'START', steps: [{...base, s1: true}], expect: true, text: 'El PLC ve a S1', hint: 'Asocia DI0'},
    {id: 'c5', kind: 'sameNet', a: {entityId: 'red', terminalId: 'PE'}, b: {entityId: 'motor', terminalId: 'PE'}, steps: [], expect: true, text: 'Motor a tierra', hint: 'PE con PE'},
    {id: 'c6', kind: 'noErrors', text: 'Sin errores de topología', hint: 'Mira Conexiones'}]};
  const mine = must(A.setCustomActivity(sol, def)); assert.equal(mine.lesson.activityId, 'custom'); assert.ok(parseIndustryProject(JSON.parse(JSON.stringify(mine))).ok);
  assert.deepEqual(A.evaluateActivity(mine).map(r => r.ok), [true, true, true, true, true, true], 'la solución del docente pasa todas'); assert.equal(A.activityFor(mine).title, 'Marcha/paro con sello');
  // Para alumnos: sin cables, sin programa o sin montajes
  const o = {noWires: false, noProgram: true, noMounts: false, mode: 'learning'}; const noProg = A.prepareForStudents(mine, o); assert.equal(noProg.mode, 'learning'); assert.equal(noProg.plc.plc, undefined); assert.equal(noProg.lesson.activityId, 'custom'); assert.equal(noProg.lesson.def.checks.length, 6); assert.equal(noProg.lesson.submitted, null);
  assert.deepEqual(A.evaluateActivity(noProg).map(r => r.ok), [true, false, true, false, true, true], 'sin programa fallan las positivas de comportamiento; las de montaje, tierra y topología pasan, y una negativa («S2 lo detiene») también pasa si no se hace nada: hay que combinarlas con una positiva');
  const noWires = A.prepareForStudents(mine, {noWires: true, noProgram: false, noMounts: false, mode: 'test'}); assert.equal(noWires.connections.length, 0); assert.equal(noWires.mode, 'test'); assert.equal(A.evaluateActivity(noWires)[1].ok, false); assert.equal(A.evaluateActivity(noWires)[4].ok, false, 'sin cables la tierra no está unida');
  const noMounts = A.prepareForStudents(mine, {noWires: false, noProgram: false, noMounts: true, mode: 'learning'}); assert.equal(A.evaluateActivity(noMounts)[0].ok, false); assert.equal(mine.mounts.length > 0, true, 'el original no se modifica');
  // Entrega e informe de una actividad propia
  const sent = must(A.submit(noProg, '2026-11-07T12:00:00Z')); assert.deepEqual([sent.lesson.submitted.score, sent.lesson.submitted.total], [4, 6]); assert.match(A.reportMarkdown(sent), /Informe de actividad · Marcha\/paro con sello[\s\S]*4 de 6/);
  // Textos automáticos
  const t = def.checks.map(c => A.describeCheck(sol, c)); assert.equal(t[0], 'KM1 está montado en Riel'); assert.match(t[1], /^Con QF1 y QF2, luego QF1 y QF2 y S1, luego QF1 y QF2, M1 está activo$/); assert.match(t[3], /la variable START está activa/); assert.match(t[4], /Red 3F\.PE está unido a M1\.PE/); assert.match(t[5], /No hay errores/);
  assert.match(A.describeCheck(sol, {id: 'x', kind: 'energized', entity: 'motor', steps: [], expect: false, text: 't', hint: ''}), /sin accionar ningún mando/);
  // Una comprobación sobre algo que ya no existe falla (no lanza)
  const ghost = must(A.setCustomActivity(sol, {title: 'x', summary: '', checks: [{id: 'g', kind: 'energized', entity: 'nadie', steps: [base], expect: false, text: 'fantasma', hint: ''}, {id: 'h', kind: 'plcTag', plc: 'nadie', tag: 'X', steps: [], expect: false, text: 'fantasma 2', hint: ''}]})); assert.deepEqual(A.evaluateActivity(ghost).map(r => r.ok), [false, false]);
  // Validación al crear y al cargar
  assert.ok(!A.setCustomActivity(sol, {...def, title: ''}).ok); assert.ok(!A.setCustomActivity(sol, {...def, checks: []}).ok); assert.ok(!A.setCustomActivity(sol, {...def, checks: [def.checks[0], def.checks[0]]}).ok); assert.ok(!A.setCustomActivity(sol, {...def, checks: Array.from({length: 21}, (_, i) => ({...def.checks[0], id: 'k' + i}))}).ok);
  const raw = JSON.parse(JSON.stringify(mine)); for (const mutate of [r => { r.lesson.def.checks[1].steps = [{qf1: 'sí'}]; }, r => { r.lesson.def.checks[0].kind = 'otra'; }, r => { r.lesson.def.checks[2].expect = 'no'; }, r => { r.lesson.def.checks[4].a = {entityId: 5}; }, r => { r.lesson.def.checks[5].text = ''; }, r => { r.lesson.def.checks[1].steps = Array.from({length: 9}, () => ({})); }, r => { r.lesson.def.checks.push({...r.lesson.def.checks[0]}); }, r => { r.lesson.def.checks[3].tag = '9x'; }, r => { r.lesson.def.checks[1].steps = [JSON.parse('{"__proto__": true}')]; }]) { const bad = JSON.parse(JSON.stringify(raw)); mutate(bad); assert.ok(!parseIndustryProject(bad).ok, 'se rechaza una definición dañada'); }
  assert.equal(A.clearCustomActivity(mine).value.lesson.activityId, null); const back = importProject(emptyLibrary(), exportProject(noProg).text).library.projects.find(x => x.lesson.activityId === 'custom'); assert.equal(back.lesson.def.checks.length, 6);
  ok('actividad propia: comprobaciones como datos, la solución del docente las pasa, la copia para alumnos quita lo que deben hacer y falla donde corresponde, entrega con informe y validación estricta');
}
console.log(`\n${n} bloques OK`);
