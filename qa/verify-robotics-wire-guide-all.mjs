// Robótica · guías de cableado de TODOS los robots: se generan desde cada plantilla. Por cada una se quitan todos los cables, se aplican los pasos de la guía
// y el robot resultante debe (a) completar la guía y (b) comportarse igual que la plantilla original en la física (mismo programa, misma trayectoria).
//   Uso: node qa/verify-robotics-wire-guide-all.mjs
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {TEMPLATES, buildTemplate} from '../src/robotics/project/templates.ts';
import {allWiringGuides, getWiringGuide, templateGuide} from '../src/robotics/guide/guides.ts';
import {applyStep, guideProgress, matchReference, stepPins} from '../src/robotics/guide/wireGuide.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
await RAPIER.init();
const pass = s => console.log('PASS', s);

/** El mismo robot armado pero sin un solo cable y con la batería y los puentes de fábrica. */
const unwired = ref => ({...ref, connections: [], parts: ref.parts.map(p => (p.definitionId === 'battery-holder-4aa' || p.definitionId === 'l298n-module' ? {...p, props: {}} : p))});
const run = (project, seconds, mustRun = true) => {
  const uno = project.parts.find(p => p.definitionId === 'arduino-uno-r3'), fw = project.firmware.find(f => f.targetInstanceId === uno.instanceId);
  const phys = RobotPhysics.create(RAPIER, project), c = new Coordinator({project, targetId: uno.instanceId, hex: fw.artifact.hex, physics: true}, phys);
  if (mustRun) assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  for (let t = 0; t < seconds * 1000; t += 20) c.advance(20000);
  const end = phys.frame().main.p; phys.dispose(); return end;
};

const wired = TEMPLATES.filter(t => templateGuide(t.id));
assert.ok(wired.length >= 9, `hay guías generadas para ${wired.length} plantillas`);
assert.ok(!templateGuide('brazo-referencia-e6') && TEMPLATES.some(t => t.id.startsWith('brazo-')), 'los brazos (sin cables) no generan guía');
assert.equal(getWiringGuide('plantilla:no-existe'), undefined);
pass(`${wired.length} robots con guía generada (${wired.map(t => t.name).join(' · ')}); los brazos, sin cables, no la tienen`);

const summary = []; let differs = 0;
for (const t of wired) {
  const guide = templateGuide(t.id), ref = buildTemplate(t.id), bare = unwired(ref);
  assert.equal(guide.steps.filter(s => s.kind === 'wire').length, ref.connections.length, `${t.name}: un paso por cable`);
  assert.equal(guide.steps.every(s => s.why.length > 12 && s.title.length > 5), true, `${t.name}: todos los pasos tienen título y porqué`);
  // Orden: los grupos aparecen en el orden pedagógico y nunca vuelven atrás
  const order = ['Ajustes antes de cablear', 'Alimentación', 'Motores', 'Control del puente H', 'Sensores y accesorios', 'Brazos y pinzas'], idx = guide.steps.map(s => order.indexOf(s.group));
  assert.ok(idx.every(i => i >= 0) && idx.every((v, i) => i === 0 || v >= idx[i - 1]), `${t.name}: grupos en orden`);
  let p = bare; const before = guideProgress(p, guide); assert.equal(before.done < guide.steps.length, true);
  // Las piezas se emparejan con las de la plantilla por su posición
  const matched = matchReference(p, guide); assert.ok(matched && matched.size === ref.parts.length, `${t.name}: ${matched?.size}/${ref.parts.length} piezas emparejadas`);
  for (let i = 0; i < guide.steps.length; i++) {
    const pr = guideProgress(p, guide), cur = pr.current; if (cur < 0) break;
    const r = applyStep(p, guide.steps[cur], matched); assert.ok(!('error' in r), `${t.name} paso ${cur + 1} (${guide.steps[cur].title}): ${r.error}`); p = r.project;
    assert.notEqual(guideProgress(p, guide).states[cur].state, 'todo', `${t.name}: el paso ${cur + 1} no avanzó`);
  }
  const done = guideProgress(p, guide); assert.equal(done.complete, true, `${t.name}: guía completa (${done.done}/${done.total})`);
  assert.deepEqual(diagnose(p).filter(d => d.severity === 'error').map(d => d.message), diagnose(ref).filter(d => d.severity === 'error').map(d => d.message), `${t.name}: mismos errores de circuito que la plantilla`);
  const a = run(ref, 4), b = run(p, 4), d = Math.hypot(a[0] - b[0], a[2] - b[2]), c0 = run(bare, 4, false); if (Math.hypot(a[0] - c0[0], a[2] - c0[2]) > 0.05) differs++;
  assert.ok(d < 0.02, `${t.name}: el robot cableado con la guía termina a ${(d * 1000).toFixed(1)} mm del original (mismo programa)`);
  summary.push(`${t.name}: ${guide.steps.length} pasos, ${(d * 1000).toFixed(1)} mm de diferencia`);
}
for (const s of summary) pass(s);
assert.ok(differs >= 5, `la prueba no es vacía: sin cables el robot se mueve distinto en ${differs} de ${wired.length} plantillas`);
pass(`en todos los robots: guía completa, mismos diagnósticos y el robot cableado con la guía se mueve igual que la plantilla (y sin cables se mueve distinto en ${differs} de ${wired.length})`);

{ // Resaltado de pines para un paso de cada robot y lista unificada
  const all = allWiringGuides(); assert.equal(all.length, 1 + wired.length);
  for (const g of all) { const p = g.reference ? unwired(g.reference) : null; if (!p) continue; const w = g.steps.find(s => s.kind === 'wire'); assert.equal(stepPins(p, w, matchReference(p, g)).length, 2); }
  pass(`lista unificada de ${all.length} guías (1 escrita a mano + ${wired.length} generadas); cada paso de cable resalta 2 pines`);
}
console.log('PASS verify-robotics-wire-guide-all');
