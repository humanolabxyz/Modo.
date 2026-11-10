// Mide los GLB convertidos (triángulos, caja en metros, materiales, texturas, animaciones). Uso: node analyze.mjs <carpeta glb> <salida.json>
import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2], out = process.argv[3], res = [];
(function walk(d) { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.glb')) res.push(analyze(p)); } })(root);
function analyze(f) {
  const b = fs.readFileSync(f), len = b.readUInt32LE(12), j = JSON.parse(b.slice(20, 20 + len).toString());
  let tris = 0, prims = 0; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  // caja con la jerarquía de nodos aplicada (solo traslación/escala simples; los modelos exportados traen 1 nodo por malla)
  const world = (ni, M) => { const n = j.nodes[ni]; let m = M; if (n.matrix) m = mul(M, n.matrix); else { const t = n.translation || [0, 0, 0], s = n.scale || [1, 1, 1], q = n.rotation || [0, 0, 0, 1]; m = mul(M, trs(t, q, s)); }
    if (n.mesh !== undefined) for (const p of j.meshes[n.mesh].primitives) { prims++; const a = j.accessors[p.attributes.POSITION]; tris += (p.indices !== undefined ? j.accessors[p.indices].count : a.count) / 3;
      for (const x of [a.min[0], a.max[0]]) for (const y of [a.min[1], a.max[1]]) for (const z of [a.min[2], a.max[2]]) { const v = [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]]; for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], v[i]); mx[i] = Math.max(mx[i], v[i]); } } }
    for (const c of n.children || []) world(c, m); };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const roots = j.scenes[j.scene || 0].nodes; roots.forEach(r => world(r, I));
  const mats = (j.materials || []).map(m => ({n: m.name, c: (m.pbrMetallicRoughness?.baseColorFactor || [1, 1, 1, 1]).slice(0, 3).map(v => +v.toFixed(3)), tex: m.pbrMetallicRoughness?.baseColorTexture !== undefined, mode: m.alphaMode || 'OPAQUE'}));
  return {file: path.relative(root, f).split(path.sep).join('/'), bytes: b.length, tris, prims, min: mn.map(v => +v.toFixed(3)), size: mx.map((v, i) => +(v - mn[i]).toFixed(3)), materials: mats, images: (j.images || []).length, anims: (j.animations || []).map(a => ({n: a.name, ch: a.channels.length})), skins: (j.skins || []).length};
}
function trs(t, q, s) { const [x, y, z, w] = q; return [(1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0, (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0, (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0, t[0], t[1], t[2], 1]; }
function mul(a, b) { const r = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return r; }
fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(res.length, 'GLB analizados');
