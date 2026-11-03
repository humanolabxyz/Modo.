import assert from 'node:assert/strict';
import {assemblyGuide, snapAssembly, canMoveAssembly} from '../src/robotics/build/assemblyGuide.ts';
import {buildTemplate, TEMPLATES} from '../src/robotics/project/templates.ts';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
import {addPart, parentAttachment, translateParts, detach, setLocked, anchorWorld} from '../src/robotics/project/commands.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';

for (const template of TEMPLATES.filter(t => !t.id.startsWith('brazo-'))) {
  const ref = buildTemplate(template.id);
  let p = newRobotProject('Aprendiz');
  p.workspace.assemblyTemplate = template.id;
  for (let i = 0; i < ref.parts.length; i++) {
    const before = assemblyGuide(p, ref), target = before.next;
    assert.ok(target, `paso ${i}`);
    const r = addPart(p, target.definitionId, target.transform.position.map((v, axis) => v + (axis === 0 && i ? .012 : 0)), target.transform.rotation);
    assert.ok(!('error' in r));
    const id = r.project.parts.at(-1).instanceId;
    const result = snapAssembly(r.project, [id], ref);
    p = result.project;
    assert.equal(assemblyGuide(p, ref).matched.size, i + 1, `${template.id} paso ${i + 1}`);
    if (i) assert.ok(result.label);
  }
  assert.equal(assemblyGuide(p, ref).remaining.length, 0);
  const moved = translateParts(p, [p.parts[0].instanceId], [.5, .1, .2]).project;
  assert.equal(assemblyGuide(moved, ref).remaining.length, 0, 'la referencia sigue al conjunto');
  const child = p.parts.find(x => parentAttachment(p, x.instanceId));
  assert.equal(canMoveAssembly(p, [child.instanceId]), false, 'hijo fijo');
  assert.equal(canMoveAssembly(p, [p.parts[0].instanceId]), true, 'conjunto móvil');
  const loose = detach(p, parentAttachment(p, child.instanceId).id);
  assert.equal(canMoveAssembly(loose, [child.instanceId]), true);
  assert.ok(assemblyGuide(loose, ref).remaining.length > 0, 'separar reabre el paso');
  const locked = setLocked(loose, [child.instanceId], true);
  assert.equal(snapAssembly(locked, [child.instanceId], ref).project, locked);
  const parsed = parseRobotProject(JSON.parse(JSON.stringify(p)));
  assert.ok(parsed.ok);
  assert.equal(parsed.project.workspace.assemblyTemplate, template.id, 'persiste al exportar e importar');
  assert.equal(p.connections.length, 0, 'guía no conecta ni programa automáticamente');
  assert.equal(p.firmware.length, 0);
  console.log(`PASS ${template.name}: ${ref.parts.length} pasos, encaje, separación, bloqueo, movimiento y persistencia`);
}
// Far parts, multiple selection and mismatched types never teleport to a guide.
const ref = buildTemplate(TEMPLATES[0].id);
let p = newRobotProject('Libre');
p = addPart(p, 'chassis-2wd', ref.parts[0].transform.position).project;
p = addPart(p, 'dc-motor-tt', [1, 1, 1]).project;
assert.equal(snapAssembly(p, [p.parts[1].instanceId], ref).project, p);
assert.equal(snapAssembly(p, p.parts.map(x => x.instanceId), ref).project, p);
console.log('PASS piezas lejanas y selección múltiple conservan posición');
let crowded = newRobotProject('Dos anfitriones');
crowded = addPart(crowded, 'chassis-2wd', [0, .0455, 0]).project;
crowded = addPart(crowded, 'chassis-2wd', [0, .0455, 0]).project;
const at = anchorWorld(crowded.parts[0], 'motor-l').position;
crowded = addPart(crowded, 'dc-motor-tt', [at[0], at[1] - .011, at[2]]).project;
assert.equal(snapAssembly(crowded, [crowded.parts.at(-1).instanceId]).project, crowded, 'destinos indistinguibles requieren elección manual');
console.log('PASS anclajes superpuestos no eligen un destino automáticamente');
