// Matemática mínima de transformaciones (sin three) para que las operaciones del proyecto sean puras y se puedan probar en Node.
import type {Quat, Transform, Vec3} from './types.ts';

export const Q_IDENTITY: Quat = [0, 0, 0, 1];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const dist = (a: Vec3, b: Vec3): number => len(sub(a, b));
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const qMul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
export const qInv = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]]; // para cuaterniones unitarios
export const qNorm = (q: Quat): Quat => { const n = Math.hypot(...q) || 1; return [q[0] / n, q[1] / n, q[2] / n, q[3] / n]; };
export const qRotate = (q: Quat, v: Vec3): Vec3 => {
  const [x, y, z, w] = q, [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
};
export const qFromAxisAngle = (axis: Vec3, angle: number): Quat => {
  const n = len(axis) || 1, s = Math.sin(angle / 2) / n;
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};
/** Euler XYZ (radianes, como three.js) → cuaternión. */
export const qFromEuler = ([x, y, z]: Vec3): Quat => {
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  return qNorm([s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3]);
};
/** Cuaternión → Euler XYZ (radianes, como three.js). */
export const qToEuler = (q: Quat): Vec3 => {
  const [x, y, z, w] = q;
  const m11 = 1 - 2 * (y * y + z * z), m12 = 2 * (x * y - z * w), m13 = 2 * (x * z + y * w), m22 = 1 - 2 * (x * x + z * z), m23 = 2 * (y * z - x * w), m32 = 2 * (y * z + x * w), m33 = 1 - 2 * (x * x + y * y);
  const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
  return Math.abs(m13) < 0.9999999 ? [Math.atan2(-m23, m33), ey, Math.atan2(-m12, m11)] : [Math.atan2(m32, m22), ey, 0];
};

export const tIdentity = (): Transform => ({position: [0, 0, 0], rotation: Q_IDENTITY});
/** Composición: aplica `b` dentro del sistema de `a` (a · b). */
export const tMul = (a: Transform, b: Transform): Transform => ({position: add(a.position, qRotate(a.rotation, b.position)), rotation: qNorm(qMul(a.rotation, b.rotation))});
export const tInv = (t: Transform): Transform => { const r = qInv(t.rotation); return {position: scale(qRotate(r, t.position), -1), rotation: r}; };
export const tPoint = (t: Transform, p: Vec3): Vec3 => add(t.position, qRotate(t.rotation, p));

/** Giro `q` alrededor del punto `center` (mundo) seguido de un desplazamiento `dp`. Devuelve la transformación rígida del movimiento. */
export const motion = (dp: Vec3, q: Quat = Q_IDENTITY, center: Vec3 = [0, 0, 0]): Transform => ({position: add(sub(center, qRotate(q, center)), dp), rotation: q});

export const DEG = Math.PI / 180;
export const nearly = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
