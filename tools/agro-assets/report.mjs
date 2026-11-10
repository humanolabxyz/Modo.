// Genera docs/agro/biblioteca-3d/INVENTARIO.md y public/agro/models/CREDITOS.txt a partir de inventario.json, decisiones.json y la biblioteca integrada.
// Uso: node --experimental-strip-types tools/agro-assets/report.mjs
import fs from 'node:fs'; import path from 'node:path';
import {LIBRARY} from '../../src/agro/models/library.ts';

const root = path.resolve(import.meta.dirname, '../..'), docs = path.join(root, 'docs/agro/biblioteca-3d');
const inv = JSON.parse(fs.readFileSync(path.join(docs, 'inventario.json'), 'utf8')), dec = JSON.parse(fs.readFileSync(path.join(docs, 'decisiones.json'), 'utf8'));
const FAM = {'terrenos-rocas': 'Terrenos y rocas', 'arboles-vegetacion': 'Árboles y vegetación', cultivos: 'Cultivos', 'estructuras-agricolas': 'Estructuras agrícolas', animales: 'Animales'};
const ST = {listo: 'Listo', adaptar: 'Adaptar', descartar: 'Descartar', pendiente: 'Pendiente'};
const mb = b => (b / 1048576).toFixed(1) + ' MB';
const kit = Object.entries(inv.packs);
const count = (f, s) => dec.filter(m => (!f || m.family === f) && (!s || m.status === s)).length;
let md = `# Inventario del kit «agro 3d kits» (Etapa 6)

Generado con \`tools/agro-assets/inventory.mjs\`, \`analyze.mjs\` y \`build-library.mjs\` (lectura del kit; nada en el kit se modificó). El kit está en \`portafolionuevo/agro 3d kits\` (fuera de \`paneldecontrol\`, 578 MB, 879 archivos); se tomó de ahí como biblioteca fuente.

## 1. Paquetes presentes

| Carpeta | Contenido | Autor y licencia declarada | Formatos | Modelos únicos |
|---|---|---|---|---|
`;
for (const [folder, p] of kit) {
  const list = inv.models.filter(m => m.pack === p.id), fm = new Set(); list.forEach(m => Object.keys(m.formats).forEach(f => fm.add(f)));
  md += `| \`${folder}\` | ${p.name} | ${p.author} · ${p.license} | ${[...fm].map(f => f.toUpperCase()).join(', ')}${p.id === 'quat-plataforma' ? ' (glTF solo para 36 de 63 modelos; carpeta Textures aparte)' : ''} | ${list.filter(m => m.name !== 'AllModels').length} |\n`;
}
md += `| \`Ground037_2K-JPG\` | Material PBR de suelo 2K (color, normal DX/GL, rugosidad, AO, desplazamiento; .blend, .usdc, .mtlx, .tres) | **Sin archivo de licencia ni fuente.** El nombre coincide con los materiales de ambientCG (normalmente CC0), pero no está verificado | JPG, PNG, BLEND, USDC | — (36 MB) |
| \`model (2..6).glb\` (5 archivos sueltos) | Escenas completas: invernadero en túnel, taller-hangar de robots, granja, cosecha de trigo, granja en día de cosecha (1.800–37.000 triángulos) | **Sin licencia ni autor.** Cabecera \`generator: 3dassets.dev ingest\`; nombres de nodo generados automáticamente | GLB | 5 escenas (no son modelos sueltos) |

Todos los paquetes de Quaternius traen el mismo \`License.txt\` (CC0 1.0, con enlace a Patreon). Las vistas previas (\`Preview.png/.jpg/.gif\`) no son modelos.

## 2. Resumen por estado

| Familia | Total | Listo | Adaptar | Pendiente | Descartar |
|---|---|---|---|---|---|
`;
for (const f of Object.keys(FAM)) md += `| ${FAM[f]} | ${count(f)} | ${count(f, 'listo')} | ${count(f, 'adaptar')} | ${count(f, 'pendiente')} | ${count(f, 'descartar')} |\n`;
md += `| **Total** | **${dec.length}** | **${count(null, 'listo')}** | **${count(null, 'adaptar')}** | **${count(null, 'pendiente')}** | **${count(null, 'descartar')}** |

Familias de la Biblioteca 3D Oficial **sin ningún modelo en el kit**: herramientas, maquinaria, riego, electricidad y automatización, personajes y robótica agroindustrial. No hay bombas, válvulas, tableros, PLC, sensores, tractores, implementos, trabajadores, drones ni robots. Esas piezas siguen con la geometría propia del simulador y quedan como pendientes (sección 6).

## 3. Calidad del kit: lo que se encontró

- **Duplicados exactos:** ninguno (mismo contenido byte a byte). Cada modelo viene triplicado en formatos (BLEND, FBX, OBJ+MTL; además glTF en parte del Platformer): es redundancia de formato, no de contenido.
- **Homónimos entre paquetes:** ${inv.dupName.map(d => d.name).join(', ')} existen en el paquete de cultivos y en el Platformer, con **geometría distinta**. Para palmeras se usa la del paquete de cultivos (colores planos, coherente); la del Platformer se descarta.
- **Texturas perdidas:** los OBJ/MTL no referencian texturas (\`map_*\` ausente) y los .blend del Platformer no las empaquetan: al convertir, Rocas, Arbustos, Hierbas, Palmeras, Pinos, «NormalTree» y similares quedan **blancos**. Hay glTF con texturas solo para Birch, Maple, DeadTree, Bush, Flower y Grass; Rock, Palm, Pine, Normal, Petals y Plant no tienen glTF. La carpeta \`Textures\` incluye mapas normales de hasta 22 MB. Las texturas pintadas son de estilo «videojuego» y no se incorporan: las rocas y arbustos usados llevan paleta lisa (ver \`library.ts\`).
- **El paquete de cultivos y el de estructuras** usan colores planos por material (apagados, naturales): no tienen texturas que perder.
- **Convertidos desde .blend con Blender 4.4** (sin errores: 185 de 185): escala en metros (1 unidad = 1 m), eje Y arriba, origen en el pivote original (se normaliza al cargar).
- **Mayor tamaño en triángulos:** TowerWindmill 7.827; NormalTree_1 8.520; BirchTree_2 7.660. Los árboles del Platformer van de 2.000 a 8.500 triángulos: inadecuados para miles de instancias.
- **Animaciones:** solo los 7 animales (esqueleto único, 6 clips: Death, Idle, Jump, Run, Walk, WalkSlow). Ningún otro modelo se anima; el molino y los cultivos están estáticos.

## 4. Inventario por familia

Triángulos y medidas (alto en metros) son del GLB convertido, antes de la normalización. «Integrado» indica el id en la biblioteca del simulador.

`;
for (const f of Object.keys(FAM)) {
  const list = dec.filter(m => m.family === f); md += `### ${FAM[f]} (${list.length})\n\n| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |\n|---|---|---:|---|---|---|---|\n`;
  for (const m of list) md += `| ${m.name} | ${m.packName.replace('Quaternius · ', '')} | ${m.tris} | ${m.sizeM?.map(v => v.toFixed(2)).join('×')} | ${ST[m.status]} | ${m.integratedAs ?? ''} | ${m.why} |\n`;
  md += '\n';
}
md += `### Familias sin modelos en el kit

| Familia | Modelos del kit | Qué se usa hoy |
|---|---|---|
| Herramientas | 0 | Nada (no hay entidad de herramienta) |
| Maquinaria | 0 | Nada (los tractores/implementos son Etapa futura) |
| Riego | 0 | Geometría propia: estanque, bomba, tubería, válvula, T, aspersor |
| Electricidad y automatización | 0 | Geometría propia: tablero, acometida, panel solar, sensor |
| Personajes y animaciones | 0 (solo 7 animales con esqueleto) | Nada (trabajadores: Etapa 8) |
| Robótica agroindustrial | 0 (la escena «robot-workshop-hangar» no tiene licencia) | Nada; ver módulo Robótica en el informe |

## 5. Archivos fuera de paquete (descartados por ahora)

| Archivo | Motivo |
|---|---|
| \`model (2).glb\` … \`model (6).glb\` | Licencia y autor desconocidos; escenas compuestas, no piezas reutilizables. Descartados hasta conocer su procedencia. |
| \`Ground037_2K-JPG/*\` | Sin licencia verificable; texturas de 2K y 36 MB con aspecto fotográfico, que rompería la coherencia semirrealista optimizada y el presupuesto de texturas. El suelo del simulador es procedural. |

## 6. Pendientes de esta biblioteca

Ver \`docs/agro/CONSOLIDACION_ETAPA_6.md\` (sección de limitaciones) para el detalle de lo que no se resolvió.
`;
fs.writeFileSync(path.join(docs, 'INVENTARIO.md'), md);

const credits = `Modelos 3D de la biblioteca de modo. Agro — créditos y licencia

Todos los modelos de esta carpeta son copias convertidas (Blender 4.4 → GLB) y, en algunos casos, simplificadas u opcionalmente recoloreadas, de obras de Quaternius
publicadas bajo CC0 1.0 Universal (dedicación al dominio público): https://creativecommons.org/publicdomain/zero/1.0/
La licencia no exige atribución; se acredita de todos modos: https://www.patreon.com/quaternius

Paquetes de origen:
${kit.map(([, p]) => `- ${p.name}`).join('\n')}

Modelos incluidos:
${LIBRARY.map(m => `- ${m.id}.glb ← ${m.source.pack} · ${m.source.original.split('/').pop()}${m.simplify && m.simplify < 1 ? ` (simplificado a ${Math.round(m.simplify * 100)} % de triángulos)` : ''}${m.palette ? ' (paleta de color propia)' : ''}`).join('\n')}

Procedencia detallada y decisiones: docs/agro/biblioteca-3d/
`;
fs.writeFileSync(path.join(root, 'public/agro/models/CREDITOS.txt'), credits);
console.log('INVENTARIO.md y CREDITOS.txt generados');
