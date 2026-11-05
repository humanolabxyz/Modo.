import assert from 'node:assert/strict';
import Rapier from '@dimforge/rapier3d-compat';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {parseRobotProjectText} from '../src/robotics/project/validate.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {readRobotCues, woodPushEvents} from '../src/robotics/audio/soundModel.ts';

await Rapier.init();
const forest = buildTemplate('robot-oruga-radar');
const saved = parseRobotProjectText(JSON.stringify(forest));
assert.ok(saved.ok, saved.error);
assert.equal(saved.project.scene.theme, 'forest');
assert.equal(saved.project.scene.obstacles.filter(o => o.kind === 'tree').length, 6);
assert.equal(saved.project.scene.obstacles.find(o => o.id === 'tronco-suelto').movable, true);
const lowBarrier = {
  ...forest, scene: {...forest.scene, obstacles: [{
    id: 'barrera-baja', shape: 'box', size: [.8, .14, .14],
    transform: {position: [0, .07, .53], rotation: [0, 0, 0, 1]},
  }]},
};

function explore(project, seconds) {
  const physics = RobotPhysics.create(Rapier, project), fw = project.firmware[0];
  const controller = new Coordinator({project, targetId: fw.targetInstanceId, hex: fw.artifact.hex, physics: true}, physics);
  const events = [], samples = [], reported = new Set();
  let tail = '';
  try {
    for (let t = 0; t < seconds * 1000; t += 40) {
      controller.advance(40_000);
      const snap = controller.snapshot();
      assert.equal(snap.status, 'running', snap.message);
      const read = readRobotCues(snap.serial, tail);
      tail = read.tail;
      events.push(...[...read.events, ...woodPushEvents(project, snap, reported)].map(e => ({...e, t})));
      samples.push({t, p: snap.physics.main.p});
    }
  } finally { physics.dispose(); }
  return {events, samples};
}
const normal = explore(forest, 9);
assert.ok(normal.events.some(e => e.kind === 'surprise'));
assert.ok(normal.events.some(e => e.kind === 'turn-right'));
assert.equal(normal.events.filter(e => e.kind === 'push-wood' && e.id === 'rama-sendero').length, 1, 'desplaza la rama del sendero y avisa una sola vez');
const blocked = explore(lowBarrier, 13);
const recover = blocked.events.find(e => e.kind === 'recover');
assert.ok(recover, 'detecta que la lectura no cambia pese a ordenar avance');
const atRecovery = blocked.samples.find(s => s.t === recover.t).p;
assert.ok(atRecovery[2] > .16 && atRecovery[2] < .46, 'el cuerpo quedó retenido delante de la barrera baja');
assert.ok(blocked.samples.some(s => s.t > recover.t && s.t < recover.t + 1000 && s.p[2] < atRecovery[2] - .045), 'retrocede antes del giro');
assert.ok(blocked.samples.some(s => s.t > recover.t + 2000 && Math.abs(s.p[0]) > .42), 'sale por un lateral');
const split = readRobotCues('@robot:sur', '');
assert.deepEqual(readRobotCues('prise\r\n@robot:left\r\n', split.tail).events, [{kind: 'surprise'}, {kind: 'turn-left'}]);
console.log('PASS bosque persistente, sorpresa, giro a la derecha y recuperación de barrera baja', JSON.stringify({recover, atRecovery}));
