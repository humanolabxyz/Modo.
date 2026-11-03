// Robótica · rendimiento de la simulación sin interfaz. Mismo coordinador y mismo Rapier que usa el worker.
// Mide cuánto tarda en CPU cada paso de 2 ms virtuales y lo traduce a «factor de tiempo real» y a un margen frente a una tablet más lenta.
//   Uso: node qa/perf-robotics-sim.mjs            (SLOWDOWN=4 por defecto: cuántas veces más lenta se supone la tablet)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildRobot2wd, wireRobot2wd} from './robotics/robot2wd.mjs';
import {setPartProp} from '../src/robotics/project/commands.ts';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {Coordinator, STEP_US} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
await RAPIER.init();
const SLOWDOWN = Number(process.env.SLOWDOWN || 4), VIRTUAL_S = Number(process.env.VIRTUAL_S || 10), BUDGET_MS = 12, TICK_MS = 16;
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const pct = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];

async function bench(label, sketch, withBox) {
  const built = buildRobot2wd(); let p = setPartProp(await wireRobot2wd(built), built.ids.battery, 'voltage', 9);
  if (withBox) p = {...p, scene: {...p.scene, obstacles: [{id: 'caja', shape: 'box', transform: {position: [0, 0.1, 0.75], rotation: [0, 0, 0, 1]}, size: [0.4, 0.2, 0.1]}]}};
  const phys = RobotPhysics.create(RAPIER, p), c = new Coordinator({project: p, targetId: built.ids.uno, hex: hex(sketch), physics: true}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  for (let i = 0; i < 100; i++) c.advance(STEP_US); // calentamiento (JIT)
  const steps = [], snaps = [], total = VIRTUAL_S * 1e6 / STEP_US;
  for (let i = 0; i < total; i++) { const t = performance.now(); c.advance(STEP_US); steps.push(performance.now() - t); }
  for (let i = 0; i < 200; i++) { const t = performance.now(); c.snapshot(); snaps.push(performance.now() - t); }
  phys.dispose();
  const sorted = [...steps].sort((a, b) => a - b), sum = steps.reduce((a, b) => a + b, 0);
  const msPerVirtualMs = sum / (VIRTUAL_S * 1000);              // CPU real por ms virtual
  const realtime = 1 / msPerVirtualMs;                           // veces más rápido que el tiempo real si se usa el 100 % de un núcleo
  // En el worker: cada tick de 16 ms se dispone de 12 ms de CPU. Con una CPU `SLOWDOWN` veces más lenta, esos 12 ms alcanzan para 12/SLOWDOWN ms de esta CPU.
  const sustained = Math.min(1, (BUDGET_MS / SLOWDOWN) / (TICK_MS * msPerVirtualMs));
  const r = {label, stepMeanMs: +(sum / steps.length).toFixed(4), stepP95Ms: +pct(sorted, .95).toFixed(4), stepP99Ms: +pct(sorted, .99).toFixed(4), stepMaxMs: +sorted.at(-1).toFixed(3),
    snapshotMeanMs: +(snaps.reduce((a, b) => a + b, 0) / snaps.length).toFixed(4), realtimeFactor: +realtime.toFixed(1), tabletRatio: +sustained.toFixed(2)};
  console.log(JSON.stringify(r));
  return r;
}
/** El robot de orugas completo: cuello que gira la cabeza, radar, I²C y pantalla que se redibuja (el caso más pesado). */
async function benchTracked() {
  const p = buildTemplate('robot-oruga-radar'), uno = p.parts.find(x => x.definitionId === 'arduino-uno-r3');
  const phys = RobotPhysics.create(RAPIER, p), c = new Coordinator({project: p, targetId: uno.instanceId, hex: p.firmware[0].artifact.hex, physics: true}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  for (let i = 0; i < 100; i++) c.advance(STEP_US);
  const steps = [], total = VIRTUAL_S * 1e6 / STEP_US;
  for (let i = 0; i < total; i++) { const t = performance.now(); c.advance(STEP_US); steps.push(performance.now() - t); }
  phys.dispose();
  const sorted = [...steps].sort((a, b) => a - b), sum = steps.reduce((a, b) => a + b, 0), msPerVirtualMs = sum / (VIRTUAL_S * 1000);
  const r = {label: 'robot de orugas (cuello, I²C y pantalla)', stepMeanMs: +(sum / steps.length).toFixed(4), stepP95Ms: +pct(sorted, .95).toFixed(4), stepP99Ms: +pct(sorted, .99).toFixed(4), stepMaxMs: +sorted.at(-1).toFixed(3), snapshotMeanMs: 0,
    realtimeFactor: +(1 / msPerVirtualMs).toFixed(1), tabletRatio: +Math.min(1, (BUDGET_MS / SLOWDOWN) / (TICK_MS * msPerVirtualMs)).toFixed(2)};
  console.log(JSON.stringify(r)); return r;
}
const results = [await bench('motores rectos', 'motors_fwd', false), await bench('evitar obstáculo', 'avoid_obstacle', true), await benchTracked()];
// Línea base medida el 30/10/2026 (PC de desarrollo): 3,4× y 2,1× tiempo real. El emulador AVR consume el 77–87 % del paso (~50 M instrucciones/s);
// Rapier y el circuito suman < 0,13 ms. La guardia evita que una pieza nueva (servo, sensores) empeore el paso sin que se note.
const MIN_REALTIME = Number(process.env.MIN_REALTIME || 1.4);
for (const r of results) assert.ok(r.realtimeFactor >= MIN_REALTIME, `${r.label}: solo ${r.realtimeFactor}× el tiempo real (mínimo ${MIN_REALTIME}×)`);
for (const r of results) console.log(`INFO ${r.label}: con una CPU ${SLOWDOWN}× más lenta se sostendría ${(r.tabletRatio * 100).toFixed(0)} % del tiempo real (el worker lo muestra como retraso, no se congela)`);
console.log('PASS perf-robotics-sim');
