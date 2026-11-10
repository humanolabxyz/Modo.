// Etapa 6: (1) copia a public/agro/models solo los GLB de la biblioteca integrada, (2) genera los datos de la galería con la decisión por modelo.
// Uso: node --experimental-strip-types tools/agro-assets/build-library.mjs   (requiere inventario.json y glb-medidas.json ya generados)
import fs from 'node:fs'; import path from 'node:path'; import {execFileSync} from 'node:child_process';
import {LIBRARY} from '../../src/agro/models/library.ts';

const root = path.resolve(import.meta.dirname, '../..'), docs = path.join(root, 'docs/agro/biblioteca-3d'), gal = path.join(root, 'public/agro/_galeria'), dest = path.join(root, 'public/agro/models');
const inv = JSON.parse(fs.readFileSync(path.join(docs, 'inventario.json'), 'utf8')), med = JSON.parse(fs.readFileSync(path.join(docs, 'glb-medidas.json'), 'utf8'));
const medOf = new Map(med.map(m => [m.file, m]));
const PACKFOLDER = Object.fromEntries(Object.entries(inv.packs).map(([f, p]) => [f, p.id]));

// ── 1. Biblioteca integrada ──
fs.rmSync(dest, {recursive: true, force: true}); fs.mkdirSync(dest, {recursive: true});
const integrated = new Map(), simplifyJobs = [], kit = path.resolve(root, process.env.AGRO_KIT || '../../portafolionuevo/agro 3d kits');
for (const m of LIBRARY) {
  const [folder, , file] = m.source.original.split('/'), packId = PACKFOLDER[folder], name = path.basename(file, '.blend'), from = path.join(gal, packId, name + '.glb');
  if (!fs.existsSync(from)) throw new Error(`Falta el GLB convertido de ${m.id}: ${from}`);
  fs.copyFileSync(from, path.join(dest, m.id + '.glb')); integrated.set(`${packId}/${name}`, m.id);
  if (m.simplify && m.simplify < 1) simplifyJobs.push({src: path.join(kit, m.source.original), dst: path.join(dest, m.id + '.glb'), decimate: m.simplify});
}

// Simplificación (Blender headless, sobre copias; el kit no se toca).
if (simplifyJobs.length) {
  const blender = process.env.BLENDER || 'C:/Program Files/Blender Foundation/Blender 4.4/blender.exe', jobs = path.join(root, '.cache/e6-simplify.json');
  fs.mkdirSync(path.dirname(jobs), {recursive: true}); fs.writeFileSync(jobs, JSON.stringify(simplifyJobs));
  console.log(execFileSync(blender, ['-b', '-P', path.join(root, 'tools/agro-assets/convert-batch.py'), '--', jobs], {encoding: 'utf8', maxBuffer: 1 << 26}).split(/\r?\n/).filter(l => /RESUMEN|FALLO/.test(l)).join(' | '));
}

// ── 2. Decisión por modelo del kit ──
const NOTE = {
  heavyTree: 'Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena.',
  painted: 'Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa.',
  animal: 'Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado.',
};
const decide = m => {
  const n = m.name, p = m.pack;
  if (p === 'quat-cultivos') {
    if (/^Mushroom|^Coconut/.test(n)) return ['descartar', 'Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t).'];
    if (/^Bamboo/.test(n)) return ['pendiente', 'Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones.'];
    if (/^(Pumpkin|Watermelon)_[34]|^(Pumpkin|Watermelon)_Harvested/.test(n) || (m.tris > 2400)) return ['adaptar', 'Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa.'];
    if (/^(Rice)/.test(n)) return ['pendiente', 'Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones.'];
    if (/^(Tomato)/.test(n) && /_[1-4]$/.test(n)) return ['listo', 'Etapas 1–4 relacionadas con las etapas del motor del tomate (CROP_STAGE_MODELS).'];
    return ['listo', 'Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor.'];
  }
  if (p === 'quat-granja') {
    if (/^TowerWindmill/.test(n)) return ['descartar', '7.800 triángulos y 7 materiales: desproporcionado para una estructura decorativa.'];
    if (/^ChickenCoop/.test(n)) return ['pendiente', 'Corresponde a ganadería (no existe en el motor).'];
    if (/^(Barn|Windmill)$/.test(n)) return ['adaptar', 'Paleta de granja americana (rojo y blanco); se atenúa la saturación y se ajusta a la huella funcional.'];
    if (/Barn|Silo/.test(n)) return ['adaptar', 'Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo.'];
    return ['listo', 'Estructura ambiental de bajo polígono; puede usarse como decoración (no es una pieza funcional).'];
  }
  if (p === 'quat-animales') return /Pug|Zebra/.test(n) ? ['descartar', 'No es un animal de granja pertinente para los territorios chilenos del juego.'] : ['pendiente', NOTE.animal];
  if (p === 'quat-plataforma') {
    if (/^Rock|^Bush|^Grass|^Flower|^Petals|^Plant/.test(n)) return ['adaptar', NOTE.painted];
    if (/^(Pine)/.test(n)) return ['pendiente', 'Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos.'];
    if (/^DeadTree/.test(n)) return ['pendiente', 'Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa.'];
    if (/^PalmTree/.test(n)) return ['descartar', 'Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor).'];
    return ['descartar', NOTE.heavyTree];
  }
  return ['pendiente', ''];
};
const FAMILIES = {'terrenos-rocas': 'terrenos-rocas', 'arboles-vegetacion': 'arboles-vegetacion', cultivos: 'cultivos', 'estructuras-agricolas': 'estructuras-agricolas', animales: 'animales'};
const out = inv.models.filter(m => m.formats.blend && m.name !== 'AllModels').map(m => {
  const g = medOf.get(`${m.pack}/${m.name}.glb`) || {}, [status, why] = decide({...m, tris: g.tris ?? m.tris}), key = `${m.pack}/${m.name}`;
  return {id: key, name: m.name, pack: m.pack, packName: inv.packs[Object.keys(inv.packs).find(f => inv.packs[f].id === m.pack)].name, family: FAMILIES[m.family] ?? m.family, status, why, file: `/agro/_galeria/${key}.glb`,
    tris: Math.round(g.tris ?? 0), sizeM: g.size, bytes: g.bytes, materials: g.materials?.map(x => x.n) ?? [], anims: g.anims?.map(a => a.n) ?? [], skinned: !!g.skins, integratedAs: integrated.get(key) ?? null,
    palette: g.materials?.every(x => x.c.every(v => v > 0.99)) ? 'sin color (textura no incorporada)' : 'colores planos', original: m.formats.blend};
});
fs.writeFileSync(path.join(gal, 'candidates.json'), JSON.stringify({generated: new Date().toISOString().slice(0, 10), packs: inv.packs, models: out}));
fs.writeFileSync(path.join(docs, 'decisiones.json'), JSON.stringify(out, null, 1));
const c = {}; for (const m of out) c[m.status] = (c[m.status] || 0) + 1;
console.log('integrados:', integrated.size, '| decisiones:', c, '| total', out.length);
