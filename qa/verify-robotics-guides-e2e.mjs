// Robótica · de cero a robot funcionando SOLO con las guías: armar por pasos («Encajarla por mí») → cablear por pasos → programar por pasos (paso final),
// desde un proyecto vacío. El robot resultante debe parecerse a la plantilla y comportarse como ella en la física.
//   Uso: node qa/verify-robotics-guides-e2e.mjs
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
import {TEMPLATES, buildTemplate} from '../src/robotics/project/templates.ts';
import {assemblyGuide} from '../src/robotics/build/assemblyGuide.ts';
import {assemblySteps, placeNextPart} from '../src/robotics/build/assemblySteps.ts';
import {templateGuide} from '../src/robotics/guide/guides.ts';
import {applyStep, guideProgress, matchReference} from '../src/robotics/guide/wireGuide.ts';
import {programGuideForTemplate} from '../src/robotics/guide/programGuides.ts';
import {applyProgramStep, hexForCheck, runStepChecks} from '../src/robotics/guide/programCheck.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
await RAPIER.init();
const pass = s => console.log('PASS', s);

const run = (project, seconds) => {
  const uno = project.parts.find(p => p.definitionId === 'arduino-uno-r3'), fw = project.firmware.find(f => f.targetInstanceId === uno.instanceId);
  const phys = RobotPhysics.create(RAPIER, project), c = new Coordinator({project, targetId: uno.instanceId, hex: fw.artifact.hex, physics: true}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  for (let t = 0; t < seconds * 1000; t += 20) c.advance(20000);
  const end = phys.frame().main.p; phys.dispose(); return end;
};

const robots = TEMPLATES.filter(t => templateGuide(t.id) && programGuideForTemplate(t.id));
assert.equal(robots.length, 10);
for (const t of robots) {
  const ref = buildTemplate(t.id);
  // 1) ARMAR: pieza por pieza con «Encajarla por mí»
  let p = {...newRobotProject('Mi robot'), scene: ref.scene}, placed = 0;
  for (let guard = 0; guard < 80; guard++) {
    const r = placeNextPart(p, ref); if ('error' in r) { assert.match(r.error, /completo/, `${t.name}: ${r.error}`); break; }
    const s = assemblySteps(p, ref).current; assert.ok(s && s.why.length > 10 && s.where.length > 5, `${t.name}: el paso tiene dónde y por qué`);
    p = r.project; placed++;
  }
  const steps = assemblySteps(p, ref);
  assert.equal(placed, ref.parts.length, `${t.name}: ${placed}/${ref.parts.length} piezas colocadas`); assert.equal(steps.done, steps.total, `${t.name}: armado completo`);
  assert.equal(p.attachments.length, ref.attachments.length, `${t.name}: mismas uniones`);
  assert.equal(assemblyGuide(p, ref).remaining.length, 0);

  // 2) CABLEAR: la guía generada, paso a paso con las piezas del usuario
  const wguide = templateGuide(t.id), matched = matchReference(p, wguide);
  for (let i = 0; i < wguide.steps.length; i++) { const cur = guideProgress(p, wguide).current; if (cur < 0) break; const r = applyStep(p, wguide.steps[cur], matched); assert.ok(!('error' in r), `${t.name}: ${r.error}`); p = r.project; }
  assert.equal(guideProgress(p, wguide).complete, true, `${t.name}: cableado completo`);

  // 3) PROGRAMAR: paso por paso; cada uno pasa sus comprobaciones antes de seguir
  const pguide = programGuideForTemplate(t.id);
  for (const step of pguide.steps) {
    const applied = applyProgramStep(p, step); assert.ok(!('error' in applied)); p = applied;
    const h = hexForCheck(p, step); assert.ok('hex' in h); const r = runStepChecks(p, step, h.hex);
    assert.ok(r.ok, `${t.name} · ${step.id}: ${r.reports.filter(x => !x.ok).map(x => x.message ?? x.lines.filter(l => !l.ok).map(l => l.text).join('; ')).join(' | ')}`);
  }
  // 4) El robot hecho con las guías se parece y se comporta como la plantilla
  assert.deepEqual(diagnose(p).filter(d => d.severity === 'error').map(d => d.message), diagnose(ref).filter(d => d.severity === 'error').map(d => d.message), `${t.name}: mismos errores de circuito`);
  const a = run(ref, 4), b = run(p, 4), d = Math.hypot(a[0] - b[0], a[2] - b[2]);
  assert.ok(d < 0.08, `${t.name}: el robot hecho con las guías termina a ${(d * 100).toFixed(1)} cm del original`);
  pass(`${t.name}: ${placed} piezas armadas + ${wguide.steps.length} pasos de cableado + ${pguide.steps.length} de programación → termina a ${(d * 100).toFixed(1)} cm de la plantilla`);
}
pass(`${robots.length} robots construidos de cero solo con las guías (armar, cablear y programar)`);
console.log('PASS verify-robotics-guides-e2e');
