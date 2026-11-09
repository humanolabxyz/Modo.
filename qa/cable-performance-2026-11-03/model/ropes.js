// src/data/ropes.ts
var ROPE_NODES = 18;
var ROPE_PHYSICS = { gravity: 0.7, damping: 0.956, iterations: 14, settle: 0.02, calmFrames: 24, follow: 0.14 };
var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function curvePoint(a, b, shape, t) {
  const bottom = Math.max(a.y, b.y) + shape.sag, c1 = { x: a.x + (shape.from?.x ?? 12), y: bottom + (shape.from?.y ?? 0) }, c2 = { x: b.x + (shape.to?.x ?? -12), y: bottom + (shape.to?.y ?? 0) };
  const u = 1 - t, w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
  return { x: w0 * a.x + w1 * c1.x + w2 * c2.x + w3 * b.x, y: w0 * a.y + w1 * c1.y + w2 * c2.y + w3 * b.y };
}
function curveLength(a, b, shape, samples = 28) {
  let length = 0, prev = curvePoint(a, b, shape, 0);
  for (let i = 1; i <= samples; i++) {
    const p = curvePoint(a, b, shape, i / samples);
    length += dist(prev, p);
    prev = p;
  }
  return length;
}
function createRope(a, b, shape, count = ROPE_NODES) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const p = curvePoint(a, b, shape, i / (count - 1));
    nodes.push({ x: p.x, y: p.y, px: p.x, py: p.y });
  }
  return { nodes, rest: curveLength(a, b, shape), a: { ...a }, b: { ...b }, calm: ROPE_PHYSICS.calmFrames, awake: false };
}
function retarget(rope, a, b, shape, animate = true) {
  const moved = dist(rope.a, a) > 0.25 || dist(rope.b, b) > 0.25, target = curveLength(a, b, shape), stretched = Math.abs(target - rope.rest) > 1.5;
  if (!moved && !stretched) return false;
  rope.a = { ...a };
  rope.b = { ...b };
  if (!animate) {
    const fresh = createRope(a, b, shape, rope.nodes.length);
    rope.nodes = fresh.nodes;
    rope.rest = fresh.rest;
    rope.awake = false;
    rope.calm = ROPE_PHYSICS.calmFrames;
    return true;
  }
  rope.target = target;
  rope.awake = true;
  rope.calm = 0;
  return true;
}
function stepRope(rope) {
  const { gravity, damping, iterations, settle, calmFrames, follow } = ROPE_PHYSICS, n = rope.nodes, last = n.length - 1;
  const target = rope.target;
  if (target !== void 0) rope.rest += (target - rope.rest) * follow;
  const seg = rope.rest / last;
  let energy = 0;
  for (let i = 1; i < last; i++) {
    const q = n[i], vx = (q.x - q.px) * damping, vy = (q.y - q.py) * damping;
    q.px = q.x;
    q.py = q.y;
    q.x += vx;
    q.y += vy + gravity;
    energy = Math.max(energy, Math.abs(vx) + Math.abs(vy));
  }
  n[0] = { x: rope.a.x, y: rope.a.y, px: rope.a.x, py: rope.a.y };
  n[last] = { x: rope.b.x, y: rope.b.y, px: rope.b.x, py: rope.b.y };
  for (let k = 0; k < iterations; k++) {
    for (let i = 0; i < last; i++) {
      const p = n[i], q = n[i + 1], dx = q.x - p.x, dy = q.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1e-6, diff = (d - seg) / d, wp = i === 0 ? 0 : 1, wq = i + 1 === last ? 0 : 1, w = wp + wq;
      if (!w) continue;
      p.x += dx * diff * wp / w;
      p.y += dy * diff * wp / w;
      q.x -= dx * diff * wq / w;
      q.y -= dy * diff * wq / w;
    }
  }
  const restingRest = target === void 0 || Math.abs(target - rope.rest) < 0.5;
  if (energy < settle && restingRest) rope.calm++;
  else rope.calm = 0;
  if (rope.calm >= calmFrames) {
    rope.awake = false;
    rope.target = void 0;
    for (const q of n) {
      q.px = q.x;
      q.py = q.y;
    }
  }
  return rope.awake;
}
function ropePath(rope) {
  const p = rope.nodes, f = (v) => v.toFixed(1);
  let d = `M${f(p[0].x)} ${f(p[0].y)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const m = { x: (p[i].x + p[i + 1].x) / 2, y: (p[i].y + p[i + 1].y) / 2 };
    d += `Q${f(p[i].x)} ${f(p[i].y)} ${f(m.x)} ${f(m.y)}`;
  }
  const e = p[p.length - 1];
  return d + `L${f(e.x)} ${f(e.y)}`;
}
export {
  ROPE_NODES,
  ROPE_PHYSICS,
  createRope,
  curveLength,
  curvePoint,
  retarget,
  ropePath,
  stepRope
};
