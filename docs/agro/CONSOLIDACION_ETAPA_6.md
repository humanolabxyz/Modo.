# modo. Agro · Etapa 6: biblioteca de modelos 3D e integración visual

10 de noviembre de 2026. Implementación local, pendiente de revisión. **Sin commit, push ni despliegue.** Las Etapas 7 y 8 no se han iniciado.

## Resultado

Hay 18 modelos reales (glTF/GLB, 781 KB) funcionando dentro del Workspace, con una biblioteca preparada para ampliarse, un sistema de carga con respaldo y una galería de revisión de los 185 candidatos del kit. El piloto «Oasis nortino» muestra palmas datileras, cítricos, cactus, arbustos, rocas, tomate en cuatro etapas, granero, molino y cerca. Los equipos técnicos (estanque, bomba, tuberías, válvula, tablero, sensor, panel, acometida) y el invernadero **conservan su geometría actual**: el kit no trae ninguno.

Qué es y qué no es: es una mejora **visual**. Los modelos no cambian catálogo, puertos, simulación ni archivo del mundo (la prueba lo comprueba). No hay maquinaria, trabajadores ni robots en el kit, así que no se integró nada de eso.

## 0. Revisión previa y recuperación

- Rama `agro-consolidacion`, HEAD `397848e5` (Etapas 0–1 con commit; Etapas 2–5 sin commit, 73 entradas pendientes al empezar). `npm run check` verde antes de tocar nada; la base de 327 comprobaciones sigue íntegra.
- **Respaldo previo a la etapa:** `../_backup-etapa6-pre-2026-11-10/` (parche completo, tar de modificados y nuevos, HEAD). Restaurar = aplicar el parche o descomprimir el tar sobre el HEAD.
- **Hallazgo:** la carpeta no está en la raíz del proyecto con el nombre que indicaste. Se encontró en `proyectos2026/portafolionuevo/agro 3d kits` (fuera de `paneldecontrol`) y se leyó de ahí, sin modificarla. Si debía estar dentro del proyecto, hay que moverla o copiarla; los scripts aceptan `AGRO_KIT=<ruta>`.

## 1. Auditoría del kit

Detalle completo en [`biblioteca-3d/INVENTARIO.md`](biblioteca-3d/INVENTARIO.md) (275 líneas, por familia) y `inventario.json` / `decisiones.json` / `glb-medidas.json`. Resumen:

- 4 paquetes Quaternius CC0 (cultivos 102 modelos, granja 13, Platformer 63, animales 7), más 5 `.glb` sueltos y un material de suelo sin licencia.
- 185 modelos únicos, triplicados en BLEND/FBX/OBJ: 0 duplicados exactos; 6 homónimos con geometría distinta (Flower_1/2, PalmTree_1–4).
- **Texturas perdidas** en el Platformer (rocas, arbustos, hierbas, palmeras, pinos, árboles «Normal»): los .blend y los MTL no las enlazan y salen blancos. Los glTF con textura existen solo para Birch, Maple, DeadTree, Bush, Flower y Grass, con mapas normales de hasta 22 MB.
- Convertidos 185/185 con Blender 4.4 (sobre copias).
- **Sin modelos** en: herramientas, maquinaria, riego, electricidad y automatización, personajes, robótica.

## 2. Selección

| Estado | Cantidad | Qué incluye |
|---|---:|---|
| Listo | 83 | Cultivos por especie y etapa (flat-shaded, colores apagados), palma/cítrico/cactus, vallas, pozo, torre de agua |
| Adaptar | 41 | Rocas y arbustos del Platformer (textura pintada → paleta lisa), graneros/silos/molino (paleta americana → atenuada), plantas con más de 2.400 triángulos (decimar) |
| Pendiente | 31 | Animales (6 clips, sin entidad de ganadería), coníferas y árboles secos para Etapa 7, bambú, arroz, gallinero |
| Descartar | 30 | Árboles Birch/Maple/Normal del Platformer (2–8 mil triángulos, texturas pintadas, flora boreal), palmeras duplicadas del Platformer, hongos, coco, TowerWindmill (7.827 t), Pug y Zebra |

Integrados (18): `estructura-granero`, `estructura-molino`, `estructura-cerca`, `veg-palma-a/b`, `veg-citrico-a/b`, `veg-cactus-a/b`, `veg-arbusto-a/b`, `roca-a/b/c`, `cultivo-tomate-1…4`. Fuera, y no copiados: `Ground037_2K-JPG` y los 5 `model (n).glb` (licencia desconocida). Ver [`LICENCIAS_Y_PROCEDENCIA.md`](biblioteca-3d/LICENCIAS_Y_PROCEDENCIA.md).

**Criterio de estilo, que es una decisión tuya:** el kit es *low-poly estilizado con sombreado plano y colores apagados*, no semirrealista fotográfico. Lo consideré coherente con el mundo actual (que ya es de caras planas y paleta natural) y descarté lo que rompe esa línea: texturas pintadas «de videojuego», rojos saturados (atenuados) y árboles pesados. Si tu idea de «semirrealista» exige más realismo que esto, el kit llega hasta aquí y habría que cambiar de fuente.

## 3. Sistema de modelos

Documentado en [`biblioteca-3d/README.md`](biblioteca-3d/README.md): manifiesto tipado (`library.ts`), normalización de escala y pivote probada en Node, cargador con caché, armonización de materiales, fusión por material y componentes `GlbObject` / `GlbInstances`. Si un GLB falta o está dañado, devuelve `null`, avisa una vez y el objeto usa su representación de respaldo. `?modelos=off` apaga todo.

Normalización aplicada y verificada: unidades en metros, pivote al centro de la huella sobre el suelo, escala por altura / contención / fija, sin texturas, presupuesto de triángulos por tipo. Reservados en el esquema pero **sin implementar**: puntos de anclaje, partes móviles y LOD por modelo (hoy el LOD es por distancia entre modelo y representación procedural).

## 4. Integración sin reemplazar motores

| Se conserva (comprobado) | Cómo |
|---|---|
| Construcción, selección, inspector, caja de selección con medidas funcionales | Prueba de UI: clic sobre el granero abre «Granero 1» con 9,0 × 6,6 × 6,0 m |
| Conexiones hidráulicas y eléctricas, estados, ids | Sin tocar; el piloto riega la parcela y la válvula cerrada detiene el caudal (Node) |
| Guardado y mundos anteriores | El archivo no contiene ninguna referencia a modelos; exportar/reabrir estable; los fixtures V1 de la Etapa 0 siguen pasando en `verify:agro` |
| Tres experiencias, editor de terreno, cámaras | Regresiones `verify-agro-experience-ui`, `editor-ui 4F`, `territory-ui` (6 territorios) y cámaras órbita/estratégica/caminar |

Los modelos se ajustan a la lógica, no al revés: el granero queda **menor** que su huella funcional (proporciones más cuadradas que 9 × 6) y el molino sobresale en ancho por el rotor; la colisión y la selección usan siempre el catálogo.

## 5. Vegetación, cultivos y territorios

- **Oasis nortino:** palmas y cítricos como árboles; cactus y arbustos como matorral; rocas ocres. **Desierto:** cactus, arbusto y rocas (sin árboles). Los otros cuatro territorios **no cambian**: conservan la vegetación procedural.
- Dentro de 170 m del sitio se usan los modelos; más lejos y mientras carga o si falla, la vegetación de antes.
- **Tomate:** una variante por etapa del motor (`CROP_STAGE_MODELS`): establecimiento→1, vegetativo→2, floración→3, llenado de frutos→4, madurez→4. Tamaño dentro de la etapa según avance y color según el estrés hídrico existente. Un cultivo nuevo solo añade su fila. **No se modificó ningún parámetro científico ni `sim/crops.ts`.**
- Quedan preparados en la galería (no integrados porque el motor solo tiene tomate): maíz, trigo, lechuga, zanahoria, betarraga, zapallo, sandía, arroz, manzano, naranjo y más, con 4 etapas cada uno. Tala y cosecha avanzada: Etapa 7.

## 6. Maquinaria, robótica y personajes

- **Maquinaria y herramientas:** ningún tractor ni implemento en el kit. Nada integrado. Distinción documentada: *modelo disponible* ≠ *entidad funcional existente* ≠ *futura máquina interactiva*.
- **Equipos técnicos:** se mantienen los propios (bomba, válvula, tablero, PLC, sensor). El kit no tiene equivalentes.
- **Robótica agroindustrial:** el kit no tiene robots, drones, estaciones ni brazos (solo una escena `robot-workshop-hangar` sin licencia, descartada). Revisé el módulo Robótica: tiene su propio catálogo de piezas educativas (chasis 2WD, motor TT, sensores, brazo E6 en STL con su propia licencia) hecho con mallas paramétricas, sin pipeline glTF. Es un candidato razonable para un futuro robot agrícola pequeño reutilizando `src/robotics/catalog` y el cargador nuevo, sin duplicar código. **No se implementó nada** (ni navegación, ni plagas, ni control). Esta familia queda fuera de los 64 tipos aprobados, como ampliación.
- **Personajes:** no hay trabajadores. Los 7 animales comparten esqueleto y traen Idle/Walk/Run; sirven de referencia para compatibilidad de esqueleto en la Etapa 8, pero **no se integraron**.

## 7. Rendimiento

Misma máquina y GPU (Chromium headless, d3d11), mismos encuadres, `?modelos=off` frente a modelos activos en el mismo build. Con modelos apagados la medición reproduce exactamente la línea base anterior (188.343 triángulos / 192 llamadas), lo que descarta regresión por el código nuevo.

**Piloto Oasis nortino (18 piezas, 2 parcelas sembradas):**

| Vista | Llamadas de dibujo | Triángulos | Memoria JS |
|---|---|---|---|
| General | 192 → 210 | 188.343 → 428.391 | 90 → 116 MB |
| Instalación | 109 → 130 | 183.250 → 422.268 | 94 → 106 MB |
| Parcela | 95 → 118 | 185.226 → 424.910 | 103 → 115 MB |
| Lejana | 211 → 230 | 186.195 → 263.571 | 100 → 103 MB |

**Carga máxima (150 piezas, 10 parcelas sembradas, Oasis nortino):**

| Vista | Llamadas | Triángulos |
|---|---|---|
| General | 1.357 → 1.374 | 512.577 → 654.537 |
| Instalación | 672 → 688 | 464.326 → 582.586 |
| Lejana | 1.588 → 1.610 | 527.027 → 598.087 |

Lectura honesta: los modelos **suben los triángulos** (el tomate real tiene ~500–700 t por planta frente a ~70 del follaje procedural) y **no bajan las llamadas de dibujo** de forma neta. Lo que sí se controló: fusión por material (el granero pasa de 14 mallas a 4), instancias por modelo, simplificación de los 6 modelos más pesados (tomate 3 y 4, palma, cítrico, cactus, entre 45 y 75 % de triángulos), un presupuesto de 700 plantas con modelo repartido entre parcelas, y LOD por distancia. La referencia histórica de la Etapa 3 (1.118 llamadas, 267.136 triángulos, otro mundo) se mantiene como referencia, no como resultado actual.

**No mejorado todavía:** en la carga máxima, ~1.200 de 1.374 llamadas vienen de cinco equipos técnicos repetidos (estanque 332, bomba 294, tablero 285, panel solar 144, aspersor 141), que no tienen modelo en el kit y siguen compuestos de muchas piezas. Reducirlas pide modelos propios fusionados o instancias de sus piezas, conservando puertos y animaciones: es la próxima optimización real. **No se midieron FPS** (la GPU de pruebas es la de esta máquina) ni se probó un teléfono físico.

## 8. Escenario piloto

`qa/lib/agro-pilot-oasis.mjs` construye el mundo con la API pública (colocación y conexiones reales): estanque → tubería → válvula → tubería → bomba → tubería → aspersor, acometida y tablero energizado, 2 parcelas con tomate (floración y llenado de frutos), invernadero, granero, molino, 2 paneles solares, sensor y cerca, sobre el territorio Oasis nortino. Capturas en `../_entrega-etapa6/`.

## 9. Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` (tsc) | Sin errores |
| `npm run build` | Correcto (aviso de chunks > 500 kB, sin tocar el umbral) |
| `npm run verify:agro` | **334 comprobaciones aprobadas** (327 anteriores + 7 de modelos) |
| Nueva `verify-agro-models.mjs` | 7 grupos: manifiesto y licencias, etapas y territorios, normalización, apertura de los 18 GLB sin texturas y dentro de presupuesto, respaldo ante fallos, persistencia, piloto que riega |
| Nueva `verify-agro-models-ui.cjs` | 9 bloques en navegador: carga y sin texturas, selección e inspector, cámaras, recarga, red activa, sin errores de consola ni 4xx/5xx, **GLB bloqueados con 404** (respaldo), `?modelos=off`, móvil emulado 390 × 844 |
| `verify-agro-ui.cjs` | 54 bloques, sin errores de consola |
| `verify-agro-experience-ui.cjs` | Aprobada |
| `verify-agro-editor-ui.cjs 4F` | Aprobada |
| `verify-agro-migration-ui.cjs` | 13 bloques aprobados |
| `verify-agro-territory-ui.cjs` | 6 territorios aprobados |

Problemas encontrados y resueltos en el camino: roca-b/roca-c sin nota de adaptación (la prueba lo detectó); la hoja comparativa de la galería quedaba mal encuadrada y una versión provocaba un error de DOM al cambiar de modo (corregido; la captura final no tiene errores).

## 10. Archivos

**Nuevos:** `src/agro/models/{types,normalize,loader,library}.ts`, `src/agro/scene/GlbModels.tsx`, `src/agro/gallery/{Gallery.tsx,gallery.css}`, `src/pages/agro-galeria-3d.astro`, `tools/agro-assets/{inventory.mjs,convert.py,convert-batch.py,analyze.mjs,build-library.mjs,report.mjs}`, `public/agro/models/*.glb` + `CREDITOS.txt`, `qa/verify-agro-models.mjs`, `qa/verify-agro-models-ui.cjs`, `qa/measure-agro-models.cjs`, `qa/capture-agro-gallery.cjs`, `qa/lib/agro-pilot-oasis.mjs`, `docs/agro/biblioteca-3d/*`, este informe.
**Modificados por esta etapa:** `src/agro/scene/EntityMesh.tsx` (granero, molino y cerca con respaldo), `Vegetation.tsx`, `Landscape.tsx` (modelos cercanos + procedural), `Crops.tsx` (modelo por etapa con LOD), `package.json` (scripts), `.gitignore` y `.vercelignore` (galería local fuera del repositorio y del despliegue). **No modificados:** `catalog/items.ts`, `sim/*`, `world/*`, `model/*`, `economy/*`, `plc/*`, `terrain/*`.
**Local, no versionado:** `public/agro/_galeria/` (13 MB, 185 GLB).
Estado de Git: rama `agro-consolidacion`, HEAD `397848e5`, 90 entradas sin commit (73 previas + los archivos de esta etapa), índice vacío. Evidencia: `../_entrega-etapa6/` (capturas, mediciones, `git-final.txt`).

## 11. Limitaciones y pendientes (sin ocultar)

1. **Ubicación del kit** fuera del proyecto (ver §0).
2. **Licencias:** declaradas CC0 dentro de cada paquete, **no contrastadas con la página de Quaternius**. Ground037 y los 5 GLB sueltos: licencia desconocida, excluidos. Si quieres confirmar antes, no despliegues; el respaldo mantiene todo funcionando.
3. **Solo tomate** tiene etapas visibles; el resto de especies está en la galería, no en el motor.
4. **Equipos técnicos e invernadero sin modelo**: el kit no los tiene; el invernadero, el estanque, la bomba, la válvula, el tablero, el PLC, el sensor, el panel y la acometida siguen con su geometría propia. Pendientes de modelos propios.
5. **Proporciones:** el granero visible es menor que su caja de selección; el molino sobresale en ancho; la cerca repite tramos de 5,9 m que se estiran o comprimen solo a lo largo (entre 0,6 y 1,5×; por debajo de 3,5 m se usa la cerca de siempre).
6. **Triángulos:** +240.000 en vistas cercanas del piloto, sobre todo por las plantas de tomate. Los umbrales de LOD (170 m vegetación, 100 m cultivo) son fijos y el cambio entre modelo y procedural se nota («pop»); no hay transición suave.
7. **Cultivo:** el salto de la etapa 1 (0,18 m) a la 2 (0,79 m) es brusco; el fruto maduro sale oscuro; todas las plantas de una parcela cambian de variante a la vez.
8. **No implementado y reservado:** anclajes, partes móviles (aspas del molino estáticas, como antes), LOD por modelo.
9. **Offline:** los modelos no entran en el precaché del service worker (Agro tampoco está precacheado); sin conexión y sin visita previa se usa el respaldo.
10. **Galería:** la ruta `/agro-galeria-3d/` se compila en el build; en producción muestra un aviso porque no hay candidatos. Conviene excluirla del despliegue o protegerla antes de publicar.
11. **Rendimiento:** sin FPS medidos, sin teléfono físico, una sola GPU.
12. **Pendiente de la Etapa 3 conservado:** `AbortError: Transition was skipped` no apareció en ninguna de estas ejecuciones; no se ocultó ni filtró. Colisión al caminar contra construcciones: sin cambios.

## 12. Próximos pasos sugeridos (a decidir juntos)

1. Revisar la dirección de estilo con las capturas y la galería; decidir si el kit basta.
2. Confirmar licencias (y la ubicación del kit) antes de publicar; excluir la galería del despliegue.
3. Modelos propios para estanque, bomba, válvula, tablero, sensor, panel e invernadero, con una pasada de instancias/fusión para bajar llamadas de dibujo (el mayor costo medido).
4. Ampliar por categorías: el siguiente paso natural es la Etapa 7 (más especies con los modelos ya preparados, tala y cosecha).
5. No empezar las Etapas 7 y 8 hasta revisar esta integración.
