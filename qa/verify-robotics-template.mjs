// Robótica · plantilla «Robot 2 ruedas · listo para usar»: proyecto válido, sin errores de circuito, programa compilado vigente
// y que al ejecutarlo por física avanza y esquiva la caja sin tocar nada más.   Uso: node qa/verify-robotics-template.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildReadyRobot, buildTemplate, TEMPLATES, TEMPLATE_READY_ROBOT} from '../src/robotics/project/templates.ts';
import {AVOID_HEX, AVOID_SKETCH} from '../src/robotics/project/avoidSketch.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {catalogShape, definitionIds} from '../src/robotics/catalog/index.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {solve} from '../src/robotics/circuit/solve.ts';
import {artifactStatus, canRun, hashSource} from '../src/robotics/mcu/compiler/state.ts';
import {firmwareOf} from '../src/robotics/project/commands.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {qRotate} from '../src/robotics/project/math.ts';
const pass = s => console.log('PASS', s);
await RAPIER.init();

const p = buildReadyRobot();
assert.equal(TEMPLATES[0].id, TEMPLATE_READY_ROBOT); assert.equal(buildTemplate('no-existe'), null);
assert.equal(p.parts.length, 11); assert.equal(p.attachments.filter(a => a.kind === 'rigid').length, 8); assert.equal(p.attachments.filter(a => a.kind === 'wheel-hinge').length, 2);
assert.equal(p.connections.length, 18); assert.equal(p.scene.obstacles.length, 1);
const parsed = parseRobotProject(JSON.parse(JSON.stringify(p)), {knownDefinitions: definitionIds, catalog: catalogShape});
assert.ok(parsed.ok, parsed.error);
pass('la plantilla es un proyecto válido (11 piezas, 8 uniones rígidas, 2 de rueda, 18 cables, 1 obstáculo) y pasa parseRobotProject con el catálogo');

const diags = diagnose(p, solve(p)), errors = diags.filter(d => d.severity === 'error');
assert.deepEqual(errors, [], `sin errores de circuito: ${errors.map(d => d.message).join(' | ')}`);
pass(`sin diagnósticos de error en el circuito (${diags.length} aviso(s) o información)`);

const uno = p.parts.find(x => x.definitionId === 'arduino-uno-r3'), fw = firmwareOf(p, uno.instanceId);
assert.equal(fw.source, AVOID_SKETCH); assert.equal(fw.artifact.sourceHash, hashSource(AVOID_SKETCH)); assert.ok(canRun(artifactStatus(fw.artifact, hashSource(fw.source))));
const lf = t => t.split(String.fromCharCode(13)).join('');
assert.equal(lf(AVOID_SKETCH), lf(fs.readFileSync('qa/fixtures/robotica/sketches/avoid_obstacle.ino', 'utf8'))); assert.equal(lf(AVOID_HEX), lf(fs.readFileSync('qa/fixtures/robotica/avoid_obstacle.hex', 'utf8')));
assert.equal(artifactStatus(fw.artifact, hashSource(fw.source + ' ')), 'stale', 'si se edita el código, pide recompilar');
pass('el programa y su .hex coinciden con los archivos de pruebas, el hash es el del código y el estado es «vigente»');

// Por física: avanza, esquiva la caja (cara en z = 0,70 m) y no la toca
const phys = RobotPhysics.create(RAPIER, p), c = new Coordinator({project: p, targetId: uno.instanceId, hex: fw.artifact.hex}, phys);
assert.equal(c.snapshot().status, 'running', c.snapshot().message);
const chassis = p.parts.find(x => x.definitionId === 'chassis-2wd').instanceId, sensor = p.parts.find(x => x.definitionId === 'hc-sr04').instanceId;
let maxZ = 0, closest = 99, turn = 0, prev = null;
for (let t = 0; t < 6000; t += 20) {
  c.advance(20000); const f = phys.frame(), pose = f.poses[chassis], d = phys.distance(sensor);
  closest = Math.min(closest, d ?? 99); const fwd = qRotate(pose.q, [0, 0, 1]), yaw = Math.atan2(fwd[0], fwd[2]) * 180 / Math.PI;
  if (prev !== null) { let dy = yaw - prev; if (dy > 180) dy -= 360; if (dy < -180) dy += 360; turn += dy; } prev = yaw;
  if (Math.abs(pose.p[0]) < 0.35) maxZ = Math.max(maxZ, pose.p[2]);
}
assert.ok(maxZ > 0.25, `avanza (z ${maxZ.toFixed(2)})`); assert.ok(maxZ + 0.1215 < 0.68, `no toca la caja (frente a ${(maxZ + 0.1215).toFixed(2)} m)`); assert.ok(Math.abs(turn) > 30, `gira ${turn.toFixed(0)}°`);
pass(`▶ por física: avanza hasta z ${maxZ.toFixed(2)} m, mide hasta ${closest.toFixed(2)} m de la caja, gira ${Math.abs(turn).toFixed(0)}° y no la toca`);
phys.dispose();
