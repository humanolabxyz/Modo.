// Inventario de solo lectura de «agro 3d kits». No modifica el kit. Uso: node tools/agro-assets/inventory.mjs "<ruta al kit>" <salida.json>
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const kit = process.argv[2], out = process.argv[3];
const PACKS = {
  'drive-download-20261110T194644Z-1-001': {id: 'quat-cultivos', name: 'Quaternius · cultivos (LowPoly Models)', license: 'CC0 1.0 (License.txt del paquete)', author: 'Quaternius'},
  'drive-download-20261110T194737Z-1-001': {id: 'quat-granja', name: 'Quaternius · estructuras de granja (LowPoly Models)', license: 'CC0 1.0 (License.txt del paquete)', author: 'Quaternius'},
  'drive-download-20261110T194800Z-1-001': {id: 'quat-plataforma', name: 'Quaternius · Ultimate Platformer Pack', license: 'CC0 1.0 (License.txt del paquete)', author: 'Quaternius'},
  'drive-download-20261110T194858Z-1-001': {id: 'quat-animales', name: 'Quaternius · Farm Animals Pack', license: 'CC0 1.0 (License.txt del paquete)', author: 'Quaternius'},
};
const FAMILY = [
  [/^(Rock)/i, 'terrenos-rocas'], [/^(Birch|Maple|Normal|Pine|Palm|Dead)Tree|^Bamboo|^Apple_[1-4]$|^Orange_[1-4]$/i, 'arboles-vegetacion'],
  [/^(Bush|Grass|Flower|Petals|Plant|Cactus|Mushroom)/i, 'arboles-vegetacion'],
  [/^(Beet|Carrot|Corn|Lettuce|Pumpkin|Rice|Tomato|Watermelon|Wheat|Apple|Orange|Coconut|Flowers|PalmTree)/i, 'cultivos'],
  [/^(Barn|BigBarn|OpenBarn|SmallBarn|ChickenCoop|Fence|Silo|Well|WaterTower|Windmill|TowerWindmill)/i, 'estructuras-agricolas'],
  [/^(Cow|Horse|Llama|Pig|Pug|Sheep|Zebra)$/i, 'animales'],
];
const familyOf = n => (FAMILY.find(([r]) => r.test(n)) || [0, 'sin-clasificar'])[1];
const sha = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
function objStats(f) {
  const t = fs.readFileSync(f, 'utf8').split('\n'); let v = 0, tris = 0; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; const mats = new Set(); let mtl = null;
  for (const l of t) {
    if (l.startsWith('v ')) { v++; const p = l.trim().split(/\s+/).slice(1).map(Number); for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p[i]); mx[i] = Math.max(mx[i], p[i]); } }
    else if (l.startsWith('f ')) tris += Math.max(1, l.trim().split(/\s+/).length - 3); else if (l.startsWith('usemtl ')) mats.add(l.slice(7).trim()); else if (l.startsWith('mtllib ')) mtl = l.slice(7).trim();
  }
  return {verts: v, tris, size: mx.map((x, i) => +(x - mn[i]).toFixed(3)), materials: [...mats], mtl};
}
function mtlTextures(f) { if (!fs.existsSync(f)) return null; return fs.readFileSync(f, 'utf8').split('\n').filter(l => /^\s*map_/.test(l)).map(l => l.trim().split(/\s+/).pop()); }
const models = []; const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(kit);
const byName = new Map();
for (const f of files) {
  const rel = path.relative(kit, f).split(path.sep).join('/'), top = rel.split('/')[0], ext = path.extname(f).slice(1).toLowerCase(), base = path.basename(f, path.extname(f));
  const pack = PACKS[top]; if (!pack || !['fbx', 'obj', 'gltf', 'blend'].includes(ext)) continue;
  if (rel.includes('/Blends/') && false) continue;
  const k = pack.id + '/' + base; if (!byName.has(k)) byName.set(k, {name: base, pack: pack.id, family: familyOf(base), formats: {}});
  const m = byName.get(k); m.formats[ext] = rel; m.bytes = {...(m.bytes || {}), [ext]: fs.statSync(f).size};
  if (ext === 'obj') { const s = objStats(f); Object.assign(m, s); const tex = mtlTextures(path.join(path.dirname(f), s.mtl || base + '.mtl')); m.mtlFound = tex !== null; m.textures = tex || []; m.missingTextures = (tex || []).filter(t => !files.some(x => path.basename(x) === path.basename(t))); m.hash = sha(f); }
  if (ext === 'gltf') { const j = JSON.parse(fs.readFileSync(f, 'utf8')); m.gltf = {images: (j.images || []).map(i => i.uri), anims: (j.animations || []).length, skins: (j.skins || []).length, materials: (j.materials || []).length}; m.missingTextures = (j.images || []).filter(i => i.uri && !fs.existsSync(path.join(path.dirname(f), decodeURIComponent(i.uri)))).map(i => i.uri); }
}
for (const m of byName.values()) models.push(m);
// duplicados exactos (mismo OBJ) y homónimos entre paquetes
const hashes = new Map(); for (const m of models) if (m.hash) (hashes.get(m.hash) || hashes.set(m.hash, []).get(m.hash)).push(m.pack + '/' + m.name);
const dupExact = [...hashes.values()].filter(a => a.length > 1);
const names = new Map(); for (const m of models) (names.get(m.name) || names.set(m.name, []).get(m.name)).push(m.pack);
const dupName = [...names].filter(([, a]) => a.length > 1).map(([n, a]) => ({name: n, packs: a}));
const rp = f => path.relative(kit, f).split(path.sep).join('/');
const extra = files.filter(f => !Object.keys(PACKS).includes(rp(f).split('/')[0])).map(f => ({file: rp(f), bytes: fs.statSync(f).size}));
fs.writeFileSync(out, JSON.stringify({packs: PACKS, models, dupExact, dupName, extra, totalFiles: files.length}, null, 1));
const fam = {}; for (const m of models) fam[m.family] = (fam[m.family] || 0) + 1;
console.log('modelos únicos por paquete/nombre:', models.length, fam, '\nduplicados exactos:', dupExact.length, '\nhomónimos entre paquetes:', dupName.map(d => d.name + '[' + d.packs.join('|') + ']').join(', '), '\nsin MTL:', models.filter(m => m.formats.obj && !m.mtlFound).length, 'texturas perdidas:', models.filter(m => m.missingTextures?.length).map(m => m.name + ':' + m.missingTextures).join(' ') || 'ninguna');
