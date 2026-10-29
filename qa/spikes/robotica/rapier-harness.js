// SPIKE E3 · Banco de Rapier: robot 2WD esquemático a 240 Hz. Mismo código en Node y dentro de un Web Worker.
import RAPIER from '@dimforge/rapier3d-compat';

const DT = 1 / 240, WHEEL_R = 0.0325, SPEED = 0.2; // m/s objetivo
const Q0 = {x: 0, y: 0, z: 0, w: 1};
const rot = (q, v) => { // v rotado por el cuaternión q
  const {x, y, z, w} = q, [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
};

function buildWorld() {
  const world = new RAPIER.World({x: 0, y: -9.81, z: 0});
  world.timestep = DT;
  const bodies = {}, add = (name, pos, shape, opts = {}) => {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(pos[0], pos[1], pos[2]).setCanSleep(false));
    world.createCollider(shape.setDensity(opts.density ?? 600).setFriction(opts.friction ?? 0.7).setRestitution(0), body);
    bodies[name] = body; return body;
  };
  // Suelo y 5 obstáculos fijos (uno por delante, los otros al costado del recorrido)
  world.createCollider(RAPIER.ColliderDesc.cuboid(30, 0.05, 30).setTranslation(0, -0.05, 0).setFriction(0.9));
  const obstacles = [[0.8, 0.1, 2], [-0.8, 0.1, 4], [0.9, 0.1, 6], [-0.9, 0.1, 8], [0, 0.1, 20]];
  for (const [x, y, z] of obstacles) world.createCollider(RAPIER.ColliderDesc.cuboid(0.15, 0.1, 0.15).setTranslation(x, y, z));
  // 10 cuerpos: chasis, 2 ruedas, rodillo, batería, Arduino, driver, 2 motores y sensor
  const y0 = WHEEL_R;
  const chassis = add('chassis', [0, y0, 0], RAPIER.ColliderDesc.cuboid(0.06, 0.012, 0.1), {density: 400});
  const fixed = (name, local, half) => {
    const b = add(name, [local[0], y0 + local[1], local[2]], RAPIER.ColliderDesc.cuboid(...half), {density: 500});
    world.createImpulseJoint(RAPIER.JointData.fixed({x: local[0], y: local[1], z: local[2]}, Q0, {x: 0, y: 0, z: 0}, Q0), chassis, b, true);
    // Los accesorios no chocan con el suelo ni con las ruedas: solo aportan masa e inercia.
    b.collider(0).setCollisionGroups(0x00020000); return b;
  };
  fixed('battery', [0, 0.03, -0.04], [0.03, 0.015, 0.02]);
  fixed('arduino', [0, 0.03, 0.03], [0.034, 0.008, 0.027]);
  fixed('driver', [0, 0.05, -0.02], [0.02, 0.01, 0.02]);
  fixed('motorL', [-0.045, 0, 0], [0.012, 0.011, 0.033]);
  fixed('motorR', [0.045, 0, 0], [0.012, 0.011, 0.033]);
  fixed('sensor', [0, 0.02, 0.1], [0.022, 0.01, 0.006]);
  // Rodillo trasero sin fricción (esfera)
  const caster = add('caster', [0, 0.0125, -0.085], RAPIER.ColliderDesc.ball(0.0125), {friction: 0, density: 300});
  world.createImpulseJoint(RAPIER.JointData.fixed({x: 0, y: 0.0125 - y0, z: -0.085}, Q0, {x: 0, y: 0, z: 0}, Q0), chassis, caster, true);
  // Ruedas con motor (articulación de un eje)
  const side = x => {
    const wheel = add(x < 0 ? 'wheelL' : 'wheelR', [x, y0, 0], RAPIER.ColliderDesc.cylinder(0.01, WHEEL_R).setRotation({x: 0, y: 0, z: Math.SQRT1_2, w: -Math.SQRT1_2}), {density: 700, friction: 1.2});
    const joint = world.createImpulseJoint(RAPIER.JointData.revolute({x, y: 0, z: 0}, {x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}), chassis, wheel, true);
    return {wheel, joint};
  };
  const L = side(-0.075), R = side(0.075);
  return {world, bodies, wheels: [L, R], chassis, sensorAt: [0, 0.02, 0.1]};
}

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];

function drive(seconds, {sample = true} = {}) {
  const sim = buildWorld(), {world, wheels, chassis} = sim;
  const omega = SPEED / WHEEL_R;
  for (const {joint} of wheels) joint.configureMotorVelocity(omega, 50);
  const steps = Math.round(seconds / DT), stepMs = new Float64Array(steps), trace = [], hits = {rays: 0, hit: 0};
  let minWheelY = Infinity, maxSpeed = 0, bad = null;
  const dirs = [-30, -15, 0, 15, 30].map(d => [Math.sin(d * Math.PI / 180), 0, Math.cos(d * Math.PI / 180)]);
  for (let i = 0; i < steps; i++) {
    const t0 = performance.now();
    world.step();
    // 5 rayos del sensor desde el frente del chasis (alcance 4 m)
    const q = chassis.rotation(), p = chassis.translation(), o = rot(q, [0, 0.02, 0.13]);
    for (const d of dirs) { const v = rot(q, d); const hit = world.castRay(new RAPIER.Ray({x: p.x + o[0], y: p.y + o[1], z: p.z + o[2]}, {x: v[0], y: v[1], z: v[2]}), 4, true, undefined, undefined, undefined, chassis); hits.rays++; if (hit) hits.hit++; }
    stepMs[i] = performance.now() - t0;
    if (i % 240 === 239) {
      const pc = chassis.translation(), vl = chassis.linvel();
      const wy = Math.min(...wheels.map(({wheel}) => wheel.translation().y - WHEEL_R));
      minWheelY = Math.min(minWheelY, wy); maxSpeed = Math.max(maxSpeed, Math.hypot(vl.x, vl.y, vl.z));
      if (![pc.x, pc.y, pc.z].every(Number.isFinite) && !bad) bad = `NaN en t=${(i + 1) * DT}s`;
      trace.push([+pc.x.toPrecision(15), +pc.y.toPrecision(15), +pc.z.toPrecision(15), +chassis.rotation().y.toPrecision(15)]);
    }
  }
  const sorted = Array.from(stepMs).sort(), end = chassis.translation(), q = chassis.rotation();
  const yaw = Math.atan2(2 * (q.w * q.y + q.x * q.z), 1 - 2 * (q.y * q.y + q.x * q.x));
  const total = stepMs.reduce((a, b) => a + b, 0);
  const warm = Array.from(stepMs.subarray(240)).sort();  // sin el primer segundo (JIT/WASM en frío)
  world.free();
  return {
    steps, bad, trace,
    stepMs: {mean: +(total / steps).toFixed(4), p50: +percentile(sorted, .5).toFixed(4), p95: +percentile(sorted, .95).toFixed(4), p99: +percentile(sorted, .99).toFixed(4), max: +sorted.at(-1).toFixed(4), warmP95: +percentile(warm, .95).toFixed(4), warmMax: +warm.at(-1).toFixed(4), maxAtStep: stepMs.indexOf(sorted.at(-1))},
    realtimeFactor: +(seconds / (total / 1000)).toFixed(1),
    final: {x: +end.x.toFixed(4), y: +end.y.toFixed(4), z: +end.z.toFixed(4), yawDeg: +(yaw * 180 / Math.PI).toFixed(3), travelledM: +end.z.toFixed(3), meanSpeed: +(end.z / seconds).toFixed(4)},
    minWheelBottomY: +minWheelY.toFixed(5), maxSpeed: +maxSpeed.toFixed(3), rays: hits,
  };
}

export async function scenarioRapier({seconds = 60} = {}) {
  const t0 = performance.now();
  await RAPIER.init();
  const initMs = performance.now() - t0;
  const t1 = performance.now(); const probe = buildWorld(); const buildMs = performance.now() - t1; probe.world.free();
  const a = drive(seconds), b = drive(seconds);
  const deterministic = JSON.stringify(a.trace) === JSON.stringify(b.trace);
  const {trace, ...A} = a; delete b.trace;
  return {version: RAPIER.version(), initMs: +initMs.toFixed(1), buildWorldMs: +buildMs.toFixed(2), bodies: 10, joints: 9, obstacles: 5, raysPerStep: 5, hz: 240, seconds, run1: A, deterministic, run2Final: b.final, traceSeconds: trace.length};
}
