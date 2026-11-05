import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {addRobotCopy, robotGroup} from '../src/robotics/project/fleet.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {createFleet} from '../src/robotics/sim/fleet.ts';
import {duplicateParts} from '../src/robotics/project/commands.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';

await RAPIER.init();
const robot = buildTemplate('robot-oruga-radar');
const first = robot.firmware[0];
const one = addRobotCopy(robot, first.targetInstanceId);
assert.ok('project' in one, one.error);
const two = addRobotCopy(one.project, first.targetInstanceId);
assert.ok('project' in two, two.error);
const project = two.project;
assert.equal(project.firmware.length, 3);
assert.equal(new Set(project.parts.map(p => p.instanceId)).size, 93);
assert.ok('error' in addRobotCopy(project, first.targetInstanceId));
const restored = parseRobotProject(JSON.parse(JSON.stringify(project)));
assert.ok(restored.ok, restored.error);
assert.equal(restored.project.scene.sizeM, 8);

const sim = createFleet({project, targetId: first.targetInstanceId, hex: first.artifact.hex,
  programs: project.firmware.slice(1).map(f => ({targetId: f.targetInstanceId, hex: f.artifact.hex}))}, RAPIER);
try {
  const bodies = project.parts.filter(p => p.definitionId === 'chassis-2wd');
  const before = sim.snapshot();
  sim.advance(1_050_000);
  const after = sim.snapshot();
  assert.equal(after.status, 'running');
  assert.equal(after.simTimeUs, 1_050_000);
  assert.equal(Object.keys(after.displays).length, 3);
  assert.equal(Object.keys(after.motors).length, 6);
  for (const body of bodies) {
    const a = before.physics.poses[body.instanceId].p, b = after.physics.poses[body.instanceId].p;
    assert.ok(Math.hypot(b[0] - a[0], b[2] - a[2]) > .12, body.instanceId);
  }
} finally { sim.dispose(); }

const ahead = duplicateParts(robot, [...robotGroup(robot, first.targetInstanceId)], [0, 0, 1.4], true).project;
ahead.scene = {...ahead.scene, obstacles: []};
const map = new Map();
for (const [i, f] of ahead.firmware.entries()) for (const id of robotGroup(ahead, f.targetInstanceId)) map.set(id, 1 << (i + 4));
const physics = RobotPhysics.create(RAPIER, ahead, {fleet: map, fleetMask: 0x30});
try {
  const sensor = robot.parts.find(p => p.definitionId === 'hc-sr04');
  physics.step(new Map());
  const distance = physics.distance(sensor.instanceId);
  assert.ok(distance > .8 && distance < 1.4, 'el radar detecta al otro robot en el mundo compartido: ' + distance);
} finally { physics.dispose(); }
const factory = buildTemplate('brazo-e6-cinta-clasificadora');
assert.equal(factory.scene.theme, 'factory');
assert.equal(factory.scene.sizeM, 8);
const distanceToWall = sizeM => {
  const room = RobotPhysics.create(RAPIER, {...robot, scene: {...robot.scene, sizeM, obstacles: []}});
  try {
    room.step(new Map());
    return room.distance(robot.parts.find(p => p.definitionId === 'hc-sr04').instanceId);
  } finally { room.dispose(); }
};
assert.ok(Math.abs(distanceToWall(8) - distanceToWall(4) - 2) < .03, 'los límites físicos se amplían con el escenario');
console.log('PASS tres robots se mueven con programas independientes, radar entre robots, paredes ampliables y nave industrial persistente');
