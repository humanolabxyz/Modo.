# Recursos visuales de estudio · V2

Los cuatro recursos fotográficos se prepararon con la herramienta integrada `imagegen`, usando como entrada imágenes extraídas de la PPT del profesor. Se inspeccionaron visualmente y se conservaron como imágenes **ilustrativas derivadas**; no se atribuyen a ellas especificaciones técnicas de equipos reales. La interfaz permite consultar la foto original.

## Archivos finales del proyecto

| Recurso | Archivo consumido por la web | Referencia original | Tamaño aproximado |
|---|---|---|---|
| Termomagnético | `public/estudio/assets/termomagnetico-v2.webp` | `public/estudio/fotos/04_interruptor_termomagnetico.jpg`, lámina 8 | 101 kB |
| Fusibles | `public/estudio/assets/fusibles-v2.webp` | `public/estudio/fotos/05_fusibles.jpg`, lámina 10 | 223 kB |
| SPD y diferencial | `public/estudio/assets/spd-diferencial-v2.webp` | `public/estudio/fotos/06_spd_y_diferencial.jpg`, lámina 14 | 134 kB |
| Motor trifásico | `public/estudio/assets/motor-v2.webp` | `public/estudio/fotos/07_motor_trifasico.jpg`, lámina 15 | 327 kB |

Los PNG maestros seleccionados están en `qa/estudio-v2/assets-master/`. La codificación WebP preserva el canal alfa; no se recortó ni se modificó el contenido al optimizar el formato. La web solo consume los WebP; no depende de archivos de la caché de Codex ni de imágenes remotas.

También se renderizaron las láminas originales 4, 6, 8, 10, 12, 13, 14 y 15 del PDF, sin redibujarlas, en `public/estudio/assets/lamina-XX.png`. El diálogo de coordinación, conductores y guardamotor muestra la lámina correspondiente; los demás muestran la foto original.

Los esquemas de coordinación, capas del conductor y ajuste térmico son SVG editables dentro de `src/study/LessonMedia.tsx`. Se basan en la explicación de la PPT, no representan una instalación lista para ejecutar y cambian con los datos del ejercicio cuando corresponde. El guardamotor se identifica como esquema con rango y ajuste ficticios: la lámina 13 no trae una fotografía de ese aparato.

## Prompts utilizados

Modo: herramienta integrada `imagegen`, edición con imagen local de referencia y `transparent_background: true`. No se utilizó el modo CLI/API.

### Termomagnético

```text
Use case: background-extraction. Asset type: component image for PanelLab electrical study lesson. Input image: edit target, photograph from the teacher's PowerPoint. Extract ONLY the same white three-pole circuit breaker with linked black levers from this photo, on a truly transparent background. Keep its perspective, exact three upper and three lower screw terminals, white case geometry, black linked lever and small green windows. Improve edge definition and neutral studio lighting, without redesigning the device. Center the entire uncut component with generous transparent padding on all sides. Remove workbench, tools and room. No invented markings, lettering, logo, numbers, cables or technical specifications. This is a faithful isolated illustrative asset, not a new circuit-breaker design.
```

### Fusibles

```text
Use case: background-extraction. Asset type: clean photographic teaching asset for PanelLab based on the instructor PowerPoint. Input image is the edit target. Extract the same arranged group of five glass fuse cartridges, five ceramic cartridges and the large ceramic fuse in its holder. Preserve their count, relative arrangement, metallic end caps, white ceramic, transparent glass, top-down perspective and original shapes. Center the complete group; do not crop the holder. Use truly transparent background, clear edges, neutral studio lighting and generous transparent padding. Faithful extraction; do not redesign, add cables, technical labels, specifications, values, brands, words or objects. The result must stay recognizably the same equipment from the teacher photograph.
```

### SPD y diferencial

```text
Use case: background-extraction. Asset type: clean photographic teaching asset for PanelLab based on the instructor PowerPoint. Input image is the edit target. Extract the same two modular devices: left four-module SPD with green status windows and right white differential with grey T test button and black lever. Preserve their exact order, relative size, screw terminals, original visible L1 L2 L3 N marks, shapes and perspective. Keep both devices separate and fully in frame. Use truly transparent background, clear edges, neutral studio lighting and generous transparent padding. Faithful extraction; do not redesign, add cables, technical labels, specifications, values, brands, words or objects. The result must stay recognizably the same equipment from the teacher photograph.
```

### Motor

```text
Use case: background-extraction. Asset type: clean photographic teaching asset for PanelLab based on the instructor PowerPoint. Input image is the edit target. Extract the same blue three-phase electric motor, yellow perforated coupling safety guard and its metal base. Preserve the blue ribbed housing, terminal box, mounting feet, yellow guard, perspective and connection with the coupled equipment at right. Remove the room, wall and electrical cabinet behind it; keep the motor and mechanical base entirely in frame. Use truly transparent background, clear edges, neutral studio lighting and generous transparent padding. Faithful extraction; do not redesign, add cables, technical labels, specifications, values, brands, words or objects. The result must stay recognizably the same equipment from the teacher photograph.
```

## Revisión

Se comprobaron la semejanza con las imágenes del material, la ausencia de valores técnicos nuevos, la carga local, el canal alfa, el peso de cada WebP y la presentación en escritorio/móvil. Las imágenes generadas son apoyo visual; el PDF, los datos del ejercicio y las fichas técnicas mantienen la autoridad para las afirmaciones técnicas.
