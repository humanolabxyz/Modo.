// Robótica · guía de programación paso a paso: cada paso se compila, se pone en el robot y pasa sus comprobaciones en el simulador; el paso anterior NO pasa las del siguiente.
//   Uso: node qa/verify-robotics-program-guide.mjs
import assert from 'node:assert/strict';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {PROGRAM_GUIDES, getProgramGuide, programGuideForTemplate} from '../src/robotics/guide/programGuides.ts';
import {PROGRAM_HEX} from '../src/robotics/guide/programHex.generated.ts';
import {applyProgramStep, hexForCheck, reachedStep, runStepChecks, stepHex} from '../src/robotics/guide/programCheck.ts';
import {artifactStatus, hashSource} from '../src/robotics/mcu/compiler/state.ts';
const pass = s => console.log('PASS', s);
const uno = p => p.parts.find(x => x.definitionId === 'arduino-uno-r3');
const fresh = p => { const fw = p.firmware.find(f => f.targetInstanceId === uno(p).instanceId); return artifactStatus(fw?.artifact, hashSource(fw.source)); };
/** El robot de la plantilla pero con un programa vacío: así el estudiante parte de cero. */
const blank = ref => ({...ref, firmware: []});

{ // 1. Todos los pasos tienen programa compilado, con el código exacto que se muestra
  const steps = PROGRAM_GUIDES.flatMap(g => g.steps);
  assert.equal(steps.length, 21); for (const s of steps) { assert.ok(stepHex(s)?.startsWith(':'), `${s.id} tiene .hex`); assert.ok(s.why.length > 20 && s.learn.length >= 2 && s.see.length > 10 && s.checks.length >= 1, `${s.id} está completo`); }
  assert.equal(Object.keys(PROGRAM_HEX).length, new Set(steps.map(s => hashSource(s.source))).size, 'sin .hex sobrantes');
  assert.equal(getProgramGuide('evitar-obstaculos').steps.length, 4); assert.equal(getProgramGuide('nope'), undefined);
  pass(`${PROGRAM_GUIDES.length} guías, ${steps.length} programas (3 guías de 4 pasos + la del robot de orugas con 6 + la de recoger cubos con 3), cada uno con su .hex del código exacto, explicación, ideas nuevas y comprobaciones`);
}
{ // 2. Cada guía se sugiere para los robots que le sirven
  assert.equal(programGuideForTemplate('robot-seguidor-linea').id, 'seguidor-linea'); assert.equal(programGuideForTemplate('robot-sumo-pala-4wd').id, 'minisumo-borde');
  assert.equal(programGuideForTemplate('robot-rover-4wd').id, 'evitar-obstaculos'); assert.equal(programGuideForTemplate('robot-oruga-radar').id, 'oruga-radar'); assert.equal(programGuideForTemplate('brazo-referencia-e6'), undefined);
  pass('robot → guía sugerida: 2 ruedas, explorador y rover → evitar obstáculos; seguidor → línea; minisumo y combate → minisumo');
}
let total = 0;
for (const guide of PROGRAM_GUIDES) for (const templateId of guide.templates) { // 3. Cada paso, en cada robot al que sirve, pasa sus comprobaciones
  const robot = blank(buildTemplate(templateId));
  for (const [i, step] of guide.steps.entries()) {
    const applied = applyProgramStep(robot, step); assert.ok(!('error' in applied), 'error' in applied ? applied.error : '');
    assert.equal(fresh(applied), 'fresh', 'el código puesto queda «compilado y al día»'); assert.equal(reachedStep(applied, guide), i, 'el editor reconoce en qué paso está');
    const h = hexForCheck(applied, step); assert.ok('hex' in h, 'reason' in h ? h.reason : '');
    const r = runStepChecks(applied, step, h.hex);
    assert.ok(r.ok, `${templateId} · ${guide.id}/${step.id}: ${r.reports.filter(x => !x.ok).map(x => `${x.scenario}: ${x.message ?? x.lines.filter(l => !l.ok).map(l => l.text).join('; ')}`).join(' | ')}`);
    total++;
  }
}
pass(`${total} combinaciones robot × paso pasan sus comprobaciones en el simulador (${PROGRAM_GUIDES.reduce((n, g) => n + g.templates.length, 0)} robots)`);

{ // 4. Las comprobaciones no son vacías: el programa del paso anterior NO pasa las del siguiente
  let negatives = 0;
  for (const guide of PROGRAM_GUIDES) {
    const robot = blank(buildTemplate(guide.templates[0]));
    for (let i = 1; i < guide.steps.length; i++) {
      const r = runStepChecks(robot, guide.steps[i], stepHex(guide.steps[i - 1])); assert.equal(r.ok, false, `${guide.id}: el paso ${i} no debería pasar con el código del paso ${i - 1}`);
      assert.ok(r.reports.some(x => !x.ok && (x.message || x.lines.some(l => !l.ok))), 'explica por qué falla'); negatives++;
    }
  }
  pass(`${negatives} comprobaciones fallan con el programa del paso anterior (y explican por qué)`);
}
{ // 5. Mensajes al estudiante: sin cableado la placa no tiene energía; un programa sin compilar no se prueba
  const ready = buildTemplate('robot-2-ruedas-listo'), bare = {...ready, firmware: [], connections: []}, guide = getProgramGuide('evitar-obstaculos');
  const r = runStepChecks(bare, guide.steps[1], stepHex(guide.steps[1])); assert.equal(r.ok, false); assert.match(r.reports[0].message, /no tiene alimentación/);
  const noFw = hexForCheck(blank(ready), guide.steps[0]); assert.ok('reason' in noFw && /Todavía no hay programa/.test(noFw.reason));
  const edited = applyProgramStep(blank(ready), guide.steps[0]); const fw = edited.firmware[0]; const stale = {...edited, firmware: [{...fw, source: fw.source + '// cambié algo\n'}]};
  const sh = hexForCheck(stale, guide.steps[0]); assert.ok('reason' in sh && /cambió/.test(sh.reason)); assert.equal(reachedStep(stale, guide), -1);
  pass('sin cableado: «la placa no tiene alimentación»; sin programa o con código modificado sin compilar: avisa qué hacer');
}
{ // 6. Con un cable del sensor quitado, el paso de medir lo detecta
  const ready = blank(buildTemplate('robot-2-ruedas-listo')), guide = getProgramGuide('evitar-obstaculos');
  const sensor = ready.parts.find(p => p.definitionId === 'hc-sr04'), trig = ready.connections.filter(c => [c.a, c.b].some(r => r.instanceId === sensor.instanceId && r.pinId === 'TRIG')).map(c => c.id);
  const broken = {...ready, connections: ready.connections.filter(c => !trig.includes(c.id))};
  const step = guide.steps[2], r = runStepChecks(broken, step, stepHex(step));
  assert.equal(r.ok, false); const msg = r.reports.flatMap(x => x.lines.filter(l => !l.ok).map(l => l.text)).join(' | '); assert.ok(msg.length > 5);
  pass(`con el cable TRIG del sensor quitado, el paso «medir» falla y dice: «${msg.slice(0, 120)}»`);
}
console.log('PASS verify-robotics-program-guide');
