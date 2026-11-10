# Inventario del kit «agro 3d kits» (Etapa 6)

Generado con `tools/agro-assets/inventory.mjs`, `analyze.mjs` y `build-library.mjs` (lectura del kit; nada en el kit se modificó). El kit está en `portafolionuevo/agro 3d kits` (fuera de `paneldecontrol`, 578 MB, 879 archivos); se tomó de ahí como biblioteca fuente.

## 1. Paquetes presentes

| Carpeta | Contenido | Autor y licencia declarada | Formatos | Modelos únicos |
|---|---|---|---|---|
| `drive-download-20261110T194644Z-1-001` | Quaternius · cultivos (LowPoly Models) | Quaternius · CC0 1.0 (License.txt del paquete) | BLEND, FBX, OBJ | 102 |
| `drive-download-20261110T194737Z-1-001` | Quaternius · estructuras de granja (LowPoly Models) | Quaternius · CC0 1.0 (License.txt del paquete) | BLEND, FBX, OBJ | 13 |
| `drive-download-20261110T194800Z-1-001` | Quaternius · Ultimate Platformer Pack | Quaternius · CC0 1.0 (License.txt del paquete) | BLEND, FBX, GLTF, OBJ (glTF solo para 36 de 63 modelos; carpeta Textures aparte) | 63 |
| `drive-download-20261110T194858Z-1-001` | Quaternius · Farm Animals Pack | Quaternius · CC0 1.0 (License.txt del paquete) | BLEND, FBX, OBJ | 7 |
| `Ground037_2K-JPG` | Material PBR de suelo 2K (color, normal DX/GL, rugosidad, AO, desplazamiento; .blend, .usdc, .mtlx, .tres) | **Sin archivo de licencia ni fuente.** El nombre coincide con los materiales de ambientCG (normalmente CC0), pero no está verificado | JPG, PNG, BLEND, USDC | — (36 MB) |
| `model (2..6).glb` (5 archivos sueltos) | Escenas completas: invernadero en túnel, taller-hangar de robots, granja, cosecha de trigo, granja en día de cosecha (1.800–37.000 triángulos) | **Sin licencia ni autor.** Cabecera `generator: 3dassets.dev ingest`; nombres de nodo generados automáticamente | GLB | 5 escenas (no son modelos sueltos) |

Todos los paquetes de Quaternius traen el mismo `License.txt` (CC0 1.0, con enlace a Patreon). Las vistas previas (`Preview.png/.jpg/.gif`) no son modelos.

## 2. Resumen por estado

| Familia | Total | Listo | Adaptar | Pendiente | Descartar |
|---|---|---|---|---|---|
| Terrenos y rocas | 5 | 0 | 5 | 0 | 0 |
| Árboles y vegetación | 105 | 36 | 23 | 20 | 26 |
| Cultivos | 55 | 43 | 6 | 5 | 1 |
| Estructuras agrícolas | 13 | 4 | 7 | 1 | 1 |
| Animales | 7 | 0 | 0 | 5 | 2 |
| **Total** | **185** | **83** | **41** | **31** | **30** |

Familias de la Biblioteca 3D Oficial **sin ningún modelo en el kit**: herramientas, maquinaria, riego, electricidad y automatización, personajes y robótica agroindustrial. No hay bombas, válvulas, tableros, PLC, sensores, tractores, implementos, trabajadores, drones ni robots. Esas piezas siguen con la geometría propia del simulador y quedan como pendientes (sección 6).

## 3. Calidad del kit: lo que se encontró

- **Duplicados exactos:** ninguno (mismo contenido byte a byte). Cada modelo viene triplicado en formatos (BLEND, FBX, OBJ+MTL; además glTF en parte del Platformer): es redundancia de formato, no de contenido.
- **Homónimos entre paquetes:** Flower_1, Flower_2, PalmTree_1, PalmTree_2, PalmTree_3, PalmTree_4 existen en el paquete de cultivos y en el Platformer, con **geometría distinta**. Para palmeras se usa la del paquete de cultivos (colores planos, coherente); la del Platformer se descarta.
- **Texturas perdidas:** los OBJ/MTL no referencian texturas (`map_*` ausente) y los .blend del Platformer no las empaquetan: al convertir, Rocas, Arbustos, Hierbas, Palmeras, Pinos, «NormalTree» y similares quedan **blancos**. Hay glTF con texturas solo para Birch, Maple, DeadTree, Bush, Flower y Grass; Rock, Palm, Pine, Normal, Petals y Plant no tienen glTF. La carpeta `Textures` incluye mapas normales de hasta 22 MB. Las texturas pintadas son de estilo «videojuego» y no se incorporan: las rocas y arbustos usados llevan paleta lisa (ver `library.ts`).
- **El paquete de cultivos y el de estructuras** usan colores planos por material (apagados, naturales): no tienen texturas que perder.
- **Convertidos desde .blend con Blender 4.4** (sin errores: 185 de 185): escala en metros (1 unidad = 1 m), eje Y arriba, origen en el pivote original (se normaliza al cargar).
- **Mayor tamaño en triángulos:** TowerWindmill 7.827; NormalTree_1 8.520; BirchTree_2 7.660. Los árboles del Platformer van de 2.000 a 8.500 triángulos: inadecuados para miles de instancias.
- **Animaciones:** solo los 7 animales (esqueleto único, 6 clips: Death, Idle, Jump, Run, Walk, WalkSlow). Ningún otro modelo se anima; el molino y los cultivos están estáticos.

## 4. Inventario por familia

Triángulos y medidas (alto en metros) son del GLB convertido, antes de la normalización. «Integrado» indica el id en la biblioteca del simulador.

### Terrenos y rocas (5)

| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |
|---|---|---:|---|---|---|---|
| Rock_1 | Ultimate Platformer Pack | 228 | 0.71×1.08×0.89 | Adaptar | roca-a | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Rock_2 | Ultimate Platformer Pack | 202 | 1.05×1.13×1.08 | Adaptar | roca-b | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Rock_3 | Ultimate Platformer Pack | 712 | 0.84×1.31×0.90 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Rock_4 | Ultimate Platformer Pack | 456 | 0.86×2.15×0.81 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Rock_5 | Ultimate Platformer Pack | 632 | 1.29×1.70×1.32 | Adaptar | roca-c | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |

### Árboles y vegetación (105)

| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |
|---|---|---:|---|---|---|---|
| Apple_1 | cultivos (LowPoly Models) | 80 | 0.24×0.25×0.11 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Apple_2 | cultivos (LowPoly Models) | 252 | 0.52×0.94×0.44 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Apple_3 | cultivos (LowPoly Models) | 446 | 1.17×2.09×0.97 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Apple_4 | cultivos (LowPoly Models) | 1584 | 1.86×2.76×1.58 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Bamboo_1 | cultivos (LowPoly Models) | 82 | 0.38×0.51×0.07 | Pendiente |  | Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones. |
| Bamboo_2 | cultivos (LowPoly Models) | 300 | 0.20×0.73×0.15 | Pendiente |  | Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones. |
| Bamboo_3 | cultivos (LowPoly Models) | 492 | 0.34×1.55×0.36 | Pendiente |  | Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones. |
| Bamboo_4 | cultivos (LowPoly Models) | 644 | 0.53×2.73×0.56 | Pendiente |  | Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones. |
| Bamboo_Crop | cultivos (LowPoly Models) | 108 | 0.10×0.33×0.10 | Pendiente |  | Sin territorio ni cultivo que lo use todavía; queda en el catálogo para ampliaciones. |
| BushBerries_1 | cultivos (LowPoly Models) | 88 | 0.26×0.35×0.05 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BushBerries_2 | cultivos (LowPoly Models) | 140 | 0.59×0.51×0.52 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BushBerries_3 | cultivos (LowPoly Models) | 164 | 1.27×0.74×1.11 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BushBerries_4 | cultivos (LowPoly Models) | 892 | 1.72×1.28×1.39 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BushBerries_Crop | cultivos (LowPoly Models) | 48 | 0.17×0.13×0.17 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BushBerries_Harvested | cultivos (LowPoly Models) | 364 | 1.72×1.25×1.32 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_1 | cultivos (LowPoly Models) | 112 | 0.09×0.17×0.09 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_2 | cultivos (LowPoly Models) | 220 | 0.30×0.38×0.30 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_3 | cultivos (LowPoly Models) | 320 | 0.39×0.72×0.38 | Listo | veg-cactus-a | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_4 | cultivos (LowPoly Models) | 1814 | 1.30×1.43×0.56 | Listo | veg-cactus-b | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_Crop | cultivos (LowPoly Models) | 256 | 0.36×0.24×0.37 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Cactus_Harvested | cultivos (LowPoly Models) | 1302 | 1.09×1.26×0.56 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flowers_Crop | cultivos (LowPoly Models) | 134 | 0.29×0.12×0.29 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flowers_Harvested | cultivos (LowPoly Models) | 100 | 0.19×0.71×0.07 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flower_1 | cultivos (LowPoly Models) | 80 | 0.13×0.11×0.02 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flower_2 | cultivos (LowPoly Models) | 42 | 0.08×0.41×0.05 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flower_3 | cultivos (LowPoly Models) | 152 | 0.19×0.51×0.20 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Flower_4 | cultivos (LowPoly Models) | 230 | 0.29×0.82×0.29 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Grass_1 | cultivos (LowPoly Models) | 64 | 0.25×0.25×0.27 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Grass_2 | cultivos (LowPoly Models) | 64 | 0.25×0.52×0.27 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Grass_3 | cultivos (LowPoly Models) | 112 | 0.37×0.80×0.28 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Grass_4 | cultivos (LowPoly Models) | 192 | 0.37×1.01×0.33 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Mushroom_1 | cultivos (LowPoly Models) | 160 | 0.11×0.12×0.11 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Mushroom_2 | cultivos (LowPoly Models) | 604 | 0.14×0.22×0.14 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Mushroom_3 | cultivos (LowPoly Models) | 920 | 0.24×0.29×0.24 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Mushroom_4 | cultivos (LowPoly Models) | 1760 | 0.45×0.40×0.45 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Mushroom_Crop | cultivos (LowPoly Models) | 1280 | 0.44×0.12×0.44 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Mushroom_Harvested | cultivos (LowPoly Models) | 526 | 0.19×0.29×0.19 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Orange_1 | cultivos (LowPoly Models) | 80 | 0.24×0.25×0.11 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Orange_2 | cultivos (LowPoly Models) | 252 | 0.44×0.94×0.52 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Orange_3 | cultivos (LowPoly Models) | 336 | 0.92×2.12×1.11 | Listo | veg-citrico-a | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Orange_4 | cultivos (LowPoly Models) | 1244 | 1.86×2.76×1.58 | Listo | veg-citrico-b | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_1 | cultivos (LowPoly Models) | 176 | 0.35×0.35×0.42 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_2 | cultivos (LowPoly Models) | 776 | 1.09×1.52×1.44 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_3 | cultivos (LowPoly Models) | 1220 | 1.31×2.23×1.63 | Listo | veg-palma-a | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_4 | cultivos (LowPoly Models) | 2100 | 1.81×3.25×2.04 | Listo | veg-palma-b | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_Crop | cultivos (LowPoly Models) | 82 | 0.22×0.22×0.23 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| PalmTree_Harvested | cultivos (LowPoly Models) | 1772 | 1.81×3.25×2.04 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| BirchTree_1 | Ultimate Platformer Pack | 4596 | 2.71×5.45×1.94 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| BirchTree_2 | Ultimate Platformer Pack | 7660 | 3.35×7.57×2.81 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| BirchTree_3 | Ultimate Platformer Pack | 6818 | 3.43×5.75×2.27 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| BirchTree_4 | Ultimate Platformer Pack | 3562 | 2.78×4.21×1.84 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| BirchTree_5 | Ultimate Platformer Pack | 4520 | 3.58×5.52×3.52 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| Bush | Ultimate Platformer Pack | 400 | 1.86×1.47×1.77 | Adaptar | veg-arbusto-a | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Bush_Flowers | Ultimate Platformer Pack | 478 | 1.86×1.47×1.77 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Bush_Large | Ultimate Platformer Pack | 276 | 2.64×2.44×2.44 | Adaptar | veg-arbusto-b | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Bush_Large_Flowers | Ultimate Platformer Pack | 402 | 2.64×2.50×2.44 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Bush_Small | Ultimate Platformer Pack | 190 | 2.37×2.02×2.15 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Bush_Small_Flowers | Ultimate Platformer Pack | 274 | 2.37×2.07×2.15 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| DeadTree_1 | Ultimate Platformer Pack | 4792 | 3.09×6.20×1.29 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_10 | Ultimate Platformer Pack | 3208 | 5.46×7.13×3.25 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_2 | Ultimate Platformer Pack | 5344 | 3.42×6.20×1.45 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_3 | Ultimate Platformer Pack | 4928 | 4.22×4.96×1.70 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_4 | Ultimate Platformer Pack | 3528 | 4.85×4.61×1.67 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_5 | Ultimate Platformer Pack | 1360 | 1.44×2.60×1.53 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_6 | Ultimate Platformer Pack | 2984 | 5.41×6.41×3.30 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_7 | Ultimate Platformer Pack | 3504 | 6.14×6.31×5.03 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_8 | Ultimate Platformer Pack | 4944 | 8.17×6.28×4.80 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| DeadTree_9 | Ultimate Platformer Pack | 824 | 2.06×3.30×0.72 | Pendiente |  | Árbol seco útil para desierto y montaña (Etapa 7) con paleta lisa. |
| Flower_1 | Ultimate Platformer Pack | 162 | 0.27×0.49×0.20 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_1_Clump | Ultimate Platformer Pack | 620 | 0.47×0.67×0.43 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_2 | Ultimate Platformer Pack | 34 | 0.24×0.36×0.25 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_2_Clump | Ultimate Platformer Pack | 136 | 0.43×0.45×0.37 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_3_Clump | Ultimate Platformer Pack | 136 | 0.43×0.45×0.37 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_4_Clump | Ultimate Platformer Pack | 136 | 0.57×0.60×0.50 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Flower_5_Clump | Ultimate Platformer Pack | 136 | 0.43×0.45×0.37 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Grass_Large | Ultimate Platformer Pack | 108 | 0.71×0.48×0.50 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Grass_Large_Extruded | Ultimate Platformer Pack | 516 | 0.74×0.51×0.50 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Grass_Small | Ultimate Platformer Pack | 58 | 0.47×0.39×0.28 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| MapleTree_1 | Ultimate Platformer Pack | 3848 | 6.23×6.64×4.90 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| MapleTree_2 | Ultimate Platformer Pack | 4800 | 6.70×6.71×6.24 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| MapleTree_3 | Ultimate Platformer Pack | 6678 | 8.98×6.99×6.61 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| MapleTree_4 | Ultimate Platformer Pack | 1256 | 2.77×3.59×2.44 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| MapleTree_5 | Ultimate Platformer Pack | 4504 | 7.01×7.28×5.08 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| NormalTree_1 | Ultimate Platformer Pack | 8520 | 4.05×6.87×2.74 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| NormalTree_2 | Ultimate Platformer Pack | 8084 | 4.55×6.55×2.79 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| NormalTree_3 | Ultimate Platformer Pack | 7096 | 5.04×5.28×2.88 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| NormalTree_4 | Ultimate Platformer Pack | 6338 | 5.67×5.10×2.40 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| NormalTree_5 | Ultimate Platformer Pack | 2182 | 3.10×2.98×2.57 | Descartar |  | Árbol del paquete Platformer: textura pintada de estilo videojuego, 2–8 mil triángulos y mapas normales de hasta 22 MB. No encaja con el estilo semirrealista optimizado ni con la flora chilena. |
| PalmTree_1 | Ultimate Platformer Pack | 472 | 5.09×5.10×4.95 | Descartar |  | Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor). |
| PalmTree_2 | Ultimate Platformer Pack | 368 | 5.58×5.28×4.77 | Descartar |  | Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor). |
| PalmTree_3 | Ultimate Platformer Pack | 344 | 4.47×4.67×4.22 | Descartar |  | Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor). |
| PalmTree_4 | Ultimate Platformer Pack | 472 | 4.75×3.65×4.95 | Descartar |  | Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor). |
| PalmTree_5 | Ultimate Platformer Pack | 264 | 3.49×1.80×3.62 | Descartar |  | Duplicado de la palmera del paquete de cultivos (esa tiene colores planos y encaja mejor). |
| Petals_1 | Ultimate Platformer Pack | 90 | 1.09×0.97×0.90 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Petals_2 | Ultimate Platformer Pack | 12 | 0.85×0.66×0.87 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Petals_3 | Ultimate Platformer Pack | 6 | 0.59×0.54×0.57 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Petals_4 | Ultimate Platformer Pack | 6 | 0.41×0.22×0.38 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| PineTree_1 | Ultimate Platformer Pack | 2128 | 2.98×4.50×3.03 | Pendiente |  | Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos. |
| PineTree_2 | Ultimate Platformer Pack | 2716 | 3.28×6.91×2.98 | Pendiente |  | Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos. |
| PineTree_3 | Ultimate Platformer Pack | 1998 | 1.76×2.35×1.75 | Pendiente | veg-pino-b | Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos. |
| PineTree_4 | Ultimate Platformer Pack | 2686 | 4.84×4.49×3.25 | Pendiente |  | Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos. |
| PineTree_5 | Ultimate Platformer Pack | 838 | 3.31×4.30×3.29 | Pendiente | veg-pino-a | Conífera pintada: posible para Laderas y montaña en la Etapa 7, pero necesita paleta lisa y reducir triángulos. |
| Plant_1 | Ultimate Platformer Pack | 420 | 1.59×0.88×1.64 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Plant_2 | Ultimate Platformer Pack | 160 | 1.40×0.66×1.53 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |
| Plant_Flowers | Ultimate Platformer Pack | 330 | 1.49×1.49×1.80 | Adaptar |  | Textura pintada de estilo videojuego (no se incorpora); la geometría sirve con una paleta lisa. |

### Cultivos (55)

| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |
|---|---|---:|---|---|---|---|
| Apple_Crop | cultivos (LowPoly Models) | 440 | 0.16×0.17×0.16 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Apple_Harvested | cultivos (LowPoly Models) | 984 | 1.80×2.76×1.58 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Beet_1 | cultivos (LowPoly Models) | 121 | 0.33×0.65×0.10 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Beet_2 | cultivos (LowPoly Models) | 217 | 0.21×0.86×0.14 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Beet_3 | cultivos (LowPoly Models) | 323 | 0.51×0.87×0.23 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Beet_4 | cultivos (LowPoly Models) | 480 | 0.75×1.10×0.39 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Beet_Crop | cultivos (LowPoly Models) | 165 | 0.32×0.52×0.32 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Carrot_1 | cultivos (LowPoly Models) | 88 | 0.35×0.35×0.07 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Carrot_2 | cultivos (LowPoly Models) | 262 | 0.16×0.31×0.07 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Carrot_3 | cultivos (LowPoly Models) | 408 | 0.33×0.52×0.26 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Carrot_4 | cultivos (LowPoly Models) | 514 | 0.68×1.28×0.50 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Carrot_Crop | cultivos (LowPoly Models) | 186 | 0.24×0.88×0.24 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Coconut_Half | cultivos (LowPoly Models) | 132 | 0.78×0.78×0.41 | Descartar |  | Fuera del alcance agrícola actual y con exceso de triángulos para su tamaño (hongos de ~1.300 t). |
| Corn_1 | cultivos (LowPoly Models) | 88 | 0.17×0.39×0.03 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Corn_2 | cultivos (LowPoly Models) | 140 | 0.28×0.66×0.30 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Corn_3 | cultivos (LowPoly Models) | 348 | 0.68×1.25×0.57 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Corn_4 | cultivos (LowPoly Models) | 958 | 0.89×1.97×0.65 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Corn_Crop | cultivos (LowPoly Models) | 80 | 0.35×0.15×0.15 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Corn_Harvested | cultivos (LowPoly Models) | 638 | 0.89×1.97×0.65 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_1 | cultivos (LowPoly Models) | 88 | 0.28×0.29×0.11 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_2 | cultivos (LowPoly Models) | 400 | 0.37×0.35×0.37 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_3 | cultivos (LowPoly Models) | 612 | 0.62×0.38×0.68 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_4 | cultivos (LowPoly Models) | 1392 | 1.04×0.47×1.04 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_Crop | cultivos (LowPoly Models) | 112 | 0.36×0.40×0.36 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Lettuce_Harvested | cultivos (LowPoly Models) | 1280 | 1.04×0.47×1.04 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Orange_Crop | cultivos (LowPoly Models) | 208 | 0.15×0.15×0.15 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Orange_Harvested | cultivos (LowPoly Models) | 744 | 1.80×2.76×1.58 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Pumpkin_1 | cultivos (LowPoly Models) | 132 | 0.22×0.39×0.09 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Pumpkin_2 | cultivos (LowPoly Models) | 862 | 0.47×0.25×0.44 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Pumpkin_3 | cultivos (LowPoly Models) | 1752 | 0.88×0.39×0.75 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Pumpkin_4 | cultivos (LowPoly Models) | 2896 | 1.29×0.59×1.07 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Pumpkin_Crop | cultivos (LowPoly Models) | 396 | 0.59×0.55×0.58 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Pumpkin_Harvested | cultivos (LowPoly Models) | 2540 | 1.29×0.59×1.07 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Rice_1 | cultivos (LowPoly Models) | 88 | 0.16×0.37×0.03 | Pendiente |  | Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones. |
| Rice_2 | cultivos (LowPoly Models) | 294 | 0.26×0.56×0.13 | Pendiente |  | Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones. |
| Rice_3 | cultivos (LowPoly Models) | 628 | 0.62×0.77×0.24 | Pendiente |  | Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones. |
| Rice_4 | cultivos (LowPoly Models) | 1940 | 0.78×0.95×0.88 | Pendiente |  | Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones. |
| Rice_Crop | cultivos (LowPoly Models) | 370 | 0.91×0.05×0.39 | Pendiente |  | Especie sin parámetros en el motor (solo hay tomate) y sin uso en el norte de Chile: preparada para ampliaciones. |
| Tomato_1 | cultivos (LowPoly Models) | 60 | 0.10×0.18×0.07 | Listo | cultivo-tomate-1 | Etapas 1–4 relacionadas con las etapas del motor del tomate (CROP_STAGE_MODELS). |
| Tomato_2 | cultivos (LowPoly Models) | 266 | 0.38×0.79×0.19 | Listo | cultivo-tomate-2 | Etapas 1–4 relacionadas con las etapas del motor del tomate (CROP_STAGE_MODELS). |
| Tomato_3 | cultivos (LowPoly Models) | 1194 | 0.64×1.43×0.59 | Listo | cultivo-tomate-3 | Etapas 1–4 relacionadas con las etapas del motor del tomate (CROP_STAGE_MODELS). |
| Tomato_4 | cultivos (LowPoly Models) | 1518 | 0.79×1.72×0.81 | Listo | cultivo-tomate-4 | Etapas 1–4 relacionadas con las etapas del motor del tomate (CROP_STAGE_MODELS). |
| Tomato_Crop | cultivos (LowPoly Models) | 344 | 0.18×0.15×0.18 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Tomato_Harvested | cultivos (LowPoly Models) | 1358 | 0.79×1.72×0.81 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Watermelon_1 | cultivos (LowPoly Models) | 132 | 0.22×0.39×0.09 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Watermelon_2 | cultivos (LowPoly Models) | 862 | 0.47×0.25×0.44 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Watermelon_3 | cultivos (LowPoly Models) | 1752 | 0.88×0.39×0.75 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Watermelon_4 | cultivos (LowPoly Models) | 2600 | 1.29×0.59×1.07 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Watermelon_Crop | cultivos (LowPoly Models) | 220 | 0.44×0.35×0.37 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Watermelon_Harvested | cultivos (LowPoly Models) | 2380 | 1.29×0.59×1.07 | Adaptar |  | Más de 2.400 triángulos por planta: hay que decimar antes de usarlo en una parcela completa. |
| Wheat_1 | cultivos (LowPoly Models) | 40 | 0.12×0.22×0.03 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Wheat_2 | cultivos (LowPoly Models) | 118 | 0.07×0.54×0.12 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Wheat_3 | cultivos (LowPoly Models) | 246 | 0.17×0.69×0.24 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Wheat_4 | cultivos (LowPoly Models) | 102 | 0.10×0.95×0.06 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |
| Wheat_Crop | cultivos (LowPoly Models) | 612 | 0.59×0.10×0.76 | Listo |  | Colores planos y apagados, de bajo polígono y escala en metros creíble. Utilizable como variante por especie y etapa cuando exista el cultivo en el motor. |

### Estructuras agrícolas (13)

| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |
|---|---|---:|---|---|---|---|
| Barn | estructuras de granja (LowPoly Models) | 2910 | 7.73×6.01×8.22 | Adaptar | estructura-granero | Paleta de granja americana (rojo y blanco); se atenúa la saturación y se ajusta a la huella funcional. |
| BigBarn | estructuras de granja (LowPoly Models) | 4224 | 7.73×7.89×8.22 | Adaptar |  | Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo. |
| ChickenCoop | estructuras de granja (LowPoly Models) | 948 | 2.41×1.85×2.15 | Pendiente |  | Corresponde a ganadería (no existe en el motor). |
| Fence | estructuras de granja (LowPoly Models) | 188 | 5.89×1.10×0.17 | Listo | estructura-cerca | Estructura ambiental de bajo polígono; puede usarse como decoración (no es una pieza funcional). |
| Fence2 | estructuras de granja (LowPoly Models) | 324 | 5.89×1.17×0.17 | Listo |  | Estructura ambiental de bajo polígono; puede usarse como decoración (no es una pieza funcional). |
| OpenBarn | estructuras de granja (LowPoly Models) | 1612 | 5.74×4.74×6.18 | Adaptar |  | Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo. |
| Silo | estructuras de granja (LowPoly Models) | 1592 | 3.67×9.07×3.51 | Adaptar |  | Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo. |
| Silo_House | estructuras de granja (LowPoly Models) | 2880 | 5.34×9.07×3.51 | Adaptar |  | Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo. |
| SmallBarn | estructuras de granja (LowPoly Models) | 2176 | 6.08×4.96×6.27 | Adaptar |  | Paleta de granja americana (rojo y blanco): conviene un tinte de tierra para el norte de Chile antes de usarlo. |
| TowerWindmill | estructuras de granja (LowPoly Models) | 7827 | 7.92×11.41×4.99 | Descartar |  | 7.800 triángulos y 7 materiales: desproporcionado para una estructura decorativa. |
| WaterTower | estructuras de granja (LowPoly Models) | 2507 | 2.53×8.43×2.49 | Listo |  | Estructura ambiental de bajo polígono; puede usarse como decoración (no es una pieza funcional). |
| Well | estructuras de granja (LowPoly Models) | 2880 | 1.28×2.15×1.49 | Listo |  | Estructura ambiental de bajo polígono; puede usarse como decoración (no es una pieza funcional). |
| Windmill | estructuras de granja (LowPoly Models) | 1440 | 6.51×11.20×1.90 | Adaptar | estructura-molino | Paleta de granja americana (rojo y blanco); se atenúa la saturación y se ajusta a la huella funcional. |

### Animales (7)

| Modelo | Paquete | Triáng. | Medidas (m) | Estado | Integrado | Motivo |
|---|---|---:|---|---|---|---|
| Cow | Farm Animals Pack | 796 | 2.25×5.15×9.17 | Pendiente |  | Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado. |
| Horse | Farm Animals Pack | 690 | 2.57×6.91×9.23 | Pendiente |  | Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado. |
| Llama | Farm Animals Pack | 662 | 1.58×5.85×4.91 | Pendiente |  | Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado. |
| Pig | Farm Animals Pack | 562 | 3.31×4.59×9.78 | Pendiente |  | Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado. |
| Pug | Farm Animals Pack | 644 | 0.57×1.05×1.39 | Descartar |  | No es un animal de granja pertinente para los territorios chilenos del juego. |
| Sheep | Farm Animals Pack | 612 | 2.22×4.36×5.92 | Pendiente |  | Con esqueleto y 6 animaciones (Death, Idle, Jump, Run, Walk, WalkSlow). No hay entidad de ganadería en el motor: queda preparado. |
| Zebra | Farm Animals Pack | 1354 | 2.57×7.07×9.23 | Descartar |  | No es un animal de granja pertinente para los territorios chilenos del juego. |

### Familias sin modelos en el kit

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
| `model (2).glb` … `model (6).glb` | Licencia y autor desconocidos; escenas compuestas, no piezas reutilizables. Descartados hasta conocer su procedencia. |
| `Ground037_2K-JPG/*` | Sin licencia verificable; texturas de 2K y 36 MB con aspecto fotográfico, que rompería la coherencia semirrealista optimizada y el presupuesto de texturas. El suelo del simulador es procedural. |

## 6. Pendientes de esta biblioteca

Ver `docs/agro/CONSOLIDACION_ETAPA_6.md` (sección de limitaciones) para el detalle de lo que no se resolvió.
