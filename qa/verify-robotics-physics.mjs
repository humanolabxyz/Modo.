// Robótica · etapa 5: física del robot sin interfaz. Mismo coordinador y mismo Rapier que usa el worker.
//   Uso: node qa/verify-robotics-physics.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildRobot2wd, wireRobot2wd} from './robotics/robot2wd.mjs';
import {setPartProp, removeParts} from '../src/robotics/project/commands.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {qFromAxisAngle, qRotate} from '../src/robotics/project/math.ts';
await RAPIER.init();
const hex = n => fs.readFileSync(`qa/fixtures/robotica/${n}.hex`, 'utf8');
const pass = s => console.log('PASS', s);
const base = async () => { const built = buildRobot2wd(); let p = await wireRobot2wd(built); p = setPartProp(p, built.ids.battery, 'voltage', 9); return {p, ids: built.ids}; };
const withBox = (p, z = 0.75) => ({...p, scene: {...p.scene, obstacles: [{id: 'caja', shape: 'box', transform: {position: [0, 0.1, z], rotation: [0, 0, 0, 1]}, size: [0.4, 0.2, 0.1]}]}});
const yawOf = q => { const f = qRotate(q, [0, 0, 1]); return Math.atan2(f[0], f[2]) * 180 / Math.PI; };
/** Giro acumulado (con signo) de una trayectoria, sin saltos de ±180°. */
/** Hueco mínimo entre el frente del robot y la cara de la caja (z = 0,70 m, ancho ±0,2 m) mientras está frente a ella. */
const gapToBox = path => Math.min(...path.filter(s => Math.abs(s.p[0]) < 0.35).map(s => 0.70 - (s.p[2] + 0.1215)));
const totalTurn = path => { let sum = 0; for (let i = 1; i < path.length; i++) { let d = path[i].yaw - path[i - 1].yaw; if (d > 180) d -= 360; if (d < -180) d += 360; sum += d; } return sum; };

/** Corre `seconds` virtuales y devuelve la trayectoria muestreada cada 20 ms. */
function run(project, ids, sketch, seconds) {
  const phys = RobotPhysics.create(RAPIER, project), c = new Coordinator({project, targetId: ids.uno, hex: hex(sketch)}, phys);
  assert.equal(c.snapshot().status, 'running', c.snapshot().message);
  const path = [], start = phys.frame();
  for (let t = 0; t < seconds * 1000; t += 20) { c.advance(20000); const f = phys.frame(); path.push({p: [...f.main.p], d: phys.distance(ids.sensor), yaw: yawOf(f.poses[ids.chassis].q), speed: f.main.speed}); }
  const end = phys.frame(); phys.dispose();
  return {path, start, end, last: path.at(-1), minD: Math.min(...path.map(s => s.d ?? 99)), c};
}

{ // 1. Recto: ambos motores al mismo nivel
  const {p, ids} = await base(), r = run(p, ids, 'motors_fwd', 3);
  const dz = r.last.p[2] - r.path[0].p[2], dx = Math.abs(r.last.p[0]);
  assert.ok(dz > 0.7, `avanza (${dz.toFixed(2)} m)`); assert.ok(dx / dz < 0.05, `desvío ${(100 * dx / dz).toFixed(1)} %`); assert.ok(r.last.p[1] > 0.04 && r.last.p[1] < 0.05, 'no se hunde ni vuela');
  pass(`ambos motores al mismo nivel: avanza ${dz.toFixed(2)} m en línea recta (desvío ${(100 * dx / dz).toFixed(1)} %), a ${r.last.speed.toFixed(2)} m/s`);
}
{ // 2. Motor izquierdo con los cables invertidos → gira
  const {p, ids} = await base();
  const swap = ref => (ref.instanceId === ids.motorL ? {...ref, pinId: ref.pinId === 'M+' ? 'M-' : 'M+'} : ref);
  const q = {...p, connections: p.connections.map(c => ({...c, a: swap(c.a), b: swap(c.b)}))};
  const r = run(q, ids, 'motors_fwd', 3), turned = Math.abs(totalTurn(r.path)), moved = Math.hypot(r.last.p[0], r.last.p[2]);
  assert.ok(turned > 40, `gira ${turned.toFixed(0)}°`); assert.ok(moved < 0.5, `queda cerca (${moved.toFixed(2)} m)`);
  pass(`motor izquierdo con M+/M− invertidos: gira ${turned.toFixed(0)}° y casi no avanza (${moved.toFixed(2)} m)`);
}
{ // 3. Sin GND común entre el driver y la placa → no se mueve
  const {p, ids} = await base();
  const q = {...p, connections: p.connections.filter(c => !((c.a.instanceId === ids.driver && c.a.pinId === 'GND' && c.b.pinId === 'GND.1') || (c.b.instanceId === ids.driver && c.b.pinId === 'GND' && c.a.pinId === 'GND.1')))};
  assert.equal(q.connections.length, p.connections.length - 1);
  const r = run(setPartProp(q, ids.uno, 'usb', true), ids, 'motors_fwd', 2), moved = Math.hypot(r.last.p[0] - r.path[0].p[0], r.last.p[2] - r.path[0].p[2]);
  assert.ok(moved < 0.02, `no se mueve (${moved.toFixed(3)} m)`);
  pass(`sin GND común (la placa corre por USB): el robot no se mueve (${(moved * 1000).toFixed(1)} mm)`);
}
{ // 4. Evitar obstáculos: caja a 0,75 m
  const {p, ids} = await base(), r = run(withBox(p), ids, 'avoid_obstacle', 6);
  const closest = r.minD, turned = Math.abs(totalTurn(r.path));
  assert.ok(closest > 0.1 && closest < 0.5, `mínima distancia medida ${closest.toFixed(2)} m`); assert.ok(turned > 30, `giró ${turned.toFixed(0)}°`);
  const gap = gapToBox(r.path); assert.ok(gap > 0.05, `el robot no toca la caja (hueco mínimo ${gap.toFixed(2)} m)`);
  pass(`evitar obstáculos: se acerca hasta ${closest.toFixed(2)} m de la caja, gira ${turned.toFixed(0)}° y nunca la toca (hueco mínimo ${gap.toFixed(2)} m)`);
}
{ // 5. Girar el sensor 90° → no ve la caja
  const {p, ids} = await base();
  const q0 = withBox(p), q = {...q0, parts: q0.parts.map(x => x.instanceId === ids.sensor ? {...x, transform: {...x.transform, rotation: qFromAxisAngle([0, 1, 0], Math.PI / 2)}} : x)};
  const r = run(q, ids, 'avoid_obstacle', 6);
  const nearBox = Math.min(...r.path.filter(s => Math.abs(s.p[0]) < 0.35 && s.p[2] < 0.5 && Math.abs(s.yaw) < 20).map(s => s.d ?? 99));
  assert.ok(nearBox > 1, `el sensor girado no mide la caja (mínimo frente a ella ${nearBox.toFixed(2)} m)`);
  const gap = gapToBox(r.path); assert.ok(gap < 0.02, `el robot choca con la caja (hueco mínimo ${gap.toFixed(3)} m)`);
  pass(`sensor girado 90°: no detecta la caja (mide ${nearBox.toFixed(2)} m o más mientras está frente a ella) y el robot choca con ella`);
}
{ // 6. Sin una rueda el comportamiento cambia
  const {p, ids} = await base(), full = run(p, ids, 'motors_fwd', 3);
  const q = removeParts(p, [ids.wheelR]), r = run(q.project ?? q, ids, 'motors_fwd', 3);
  const turned = Math.abs(totalTurn(r.path)), dzFull = full.last.p[2];
  assert.ok(turned > 10 || r.last.p[2] < dzFull * 0.7, `cambia: giro ${turned.toFixed(0)}°, avance ${r.last.p[2].toFixed(2)} vs ${dzFull.toFixed(2)} m`);
  pass(`quitar la rueda derecha cambia el resultado: giro ${turned.toFixed(0)}°, avance ${r.last.p[2].toFixed(2)} m (con rueda: ${dzFull.toFixed(2)} m)`);
}
{ // 7. Reproducible: mismo proyecto → misma trayectoria exacta
  const {p, ids} = await base(), a = run(withBox(p), ids, 'avoid_obstacle', 4), b = run(withBox(p), ids, 'avoid_obstacle', 4);
  assert.deepEqual(a.path.map(s => s.p), b.path.map(s => s.p)); assert.deepEqual(a.path.map(s => s.d), b.path.map(s => s.d));
  pass('mismo proyecto, misma trayectoria exacta (200 muestras idénticas)');
}
{ // 8. Rendimiento del paso: emulador + circuito + física
  const {p, ids} = await base(), t0 = performance.now(), r = run(withBox(p), ids, 'avoid_obstacle', 5), ms = performance.now() - t0;
  console.log(`INFO ${(ms / (5000 / 2)).toFixed(3)} ms por paso de 2 ms virtuales (${(5000 / ms).toFixed(1)}× tiempo real)`);
  assert.ok(5000 / ms > 1, 'más rápido que el tiempo real');
  pass('rendimiento: la simulación completa corre más rápido que el tiempo real');
}
