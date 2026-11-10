# modo. Agro · Territorios y entorno 3D

Revisión posterior del 10 de noviembre: [capturas comparativas, correcciones visuales, cámaras y desglose de rendimiento](CONSOLIDACION_ETAPA_3_REVISION_VISUAL.md). Los números de la medición original que siguen se conservan como antecedente; el informe de revisión contiene el resultado actualizado. Cierre pendiente de revisión visual del usuario.

## Territorios y compatibilidad

El creador ofrece Mundo libre, Valle central, Oasis nortino, Desierto árido, Laderas y montaña y Valle fluvial. El nuevo relieve usa un solo generador V2 con perfiles de altura, laderas y cauces. La semilla y los seis controles quedan en el archivo del mundo, en el esquema v2. El creador abre el Valle central con el relieve clásico V1 y semilla 31. Al desmarcar el relieve clásico se habilita la configuración V2. Los mundos existentes siguen leyendo su versión original del generador y sus ediciones.

| Control | Rango |
|---|---|
| Lado del mundo en el creador | 400–1.200 m |
| Semilla | 0–2.147.483.647 |
| Intensidad del relieve | 0–1,8× |
| Rugosidad y forma del valle | 0–1 |
| Elevación base | −20 a 160 m |
| Densidad ambiental de vegetación y roca | 0–1 |

Mundos y Mapas V2 fija el rango de tamaños y las reglas de forma, y deja los valores numéricos de autoría para calibración. Estos rangos son los elegidos para esta etapa. La vista previa del creador usa celdas de 4 m y el mundo abierto usa celdas de 2 m. Los emplazamientos de centro, oeste y este tienen una zona de montaje suave en V2. La construcción sigue comprobando la pendiente y las huellas con el relieve final.

## Paisaje y navegación

El terreno jugable conserva su malla editable y sus coordenadas. El cinturón toma sus vértices, normales, colores y textura de la misma orilla en todos los niveles de detalle. Prolonga el relieve local y lo mezcla con colinas y cordones de menor resolución a distancia. La cámara estratégica centra el terreno y calcula su alcance por tamaño y proporción de pantalla. La órbita limita el punto de enfoque, y caminar se mantiene dentro del área jugable.

El valle fluvial toma de la referencia la planicie de ribera y el cauce sinuoso. El oasis concentra la cubierta verde en una depresión rodeada de quebradas y roca ocre. Una textura procedural compartida aporta grano a escala métrica. La bruma, la luz y la nubosidad cambian entre territorios. Las nubes son sprites suaves altos y la vegetación, los arbustos y las rocas usan instancias. Las instalaciones y el emplazamiento quedan despejados.

El minimapa delimita la zona jugable. El cinturón y el horizonte son mallas de escena que quedan fuera del picking, el pincel, la colocación y el estado persistente. El río y el camino se rotulan como decoración. El historial de impacto de la Etapa 2 sigue operando sobre el terreno jugable.

## Archivos de esta etapa

| Área | Archivos |
|---|---|
| Contrato y creación | `src/agro/model/{types,validate}.ts`, `src/agro/world/setup.ts`, `src/agro/ui/WorldWizard.tsx` |
| Generación y materiales | `src/agro/terrain/{generators,generatorV2,presets,heightfield,model,surface,chunks,minimap}.ts` |
| Exterior y cámaras | `src/agro/terrain/{exterior,navigation}.ts`, `src/agro/scene/{ExteriorTerrain,TerrainMesh,AgroCanvas,Landscape,Vegetation}.tsx`, `src/agro/scene/groundTexture.ts` |
| Interfaz del mapa | `src/agro/ui/Workspace.tsx`, `src/styles/agro-workflow.css` |
| Verificación | `package.json`, `qa/verify-agro-{territories,migration}.mjs`, `qa/verify-agro-{territory-ui,migration-ui,ui}.cjs` |

## Pruebas y medición

- Resultados finales de la regresión. TypeScript y compilación aprobados, 310 comprobaciones de modelo, 54 bloques de interfaz general y 13 de migración y revisión del terreno.
- `verify:agro` comprueba los mundos V1, los motores existentes y la integridad de edición. Las pruebas nuevas cubren reproducibilidad, 360 combinaciones de territorio/tamaño/semilla, las plantillas, los parámetros, la continuidad de vértices y color en el perímetro, las ediciones de borde y el rechazo de herramientas en el exterior.
- `verify:agro-territory-ui` crea los seis territorios, reabre un oasis con semilla y elevación personalizadas, verifica el pincel fuera del límite y recorre órbita, cenital, primera persona y los controles con toque emulado. Genera capturas y datos en el directorio que indica `AGRO_QA_OUT` o en `agro-etapa3` dentro de la carpeta temporal.
- La referencia del antes es el mismo valle V1 abierto con el build de la Etapa 2. La vista estratégica de después se tomó con el alejamiento máximo adaptado al tamaño. Los encuadres estratégicos comparativos tienen distinta proyección.

Medición en Chromium a 1.440 × 900 con ANGLE/D3D11 y NVIDIA GTX 1660 SUPER. El FPS cuenta cuadros con llamadas de dibujo durante unos 3 s de movimiento. El percentil 95 mide el intervalo entre esos cuadros. La memoria indicada es el heap de JavaScript, sin incluir la VRAM.

| Escenario | Primer cuadro desde Crear | Triángulos | Llamadas de dibujo |
|---|---:|---:|---:|
| Valle V1, órbita inicial antes | — | 169.833 | 130 |
| Valle V1, órbita inicial después | — | 216.875 | 128 |
| Valle V1, vista estratégica antes / después | — | 123.905 / 211.705 | 191 / 188 |
| Oasis nortino, 1.200 m, estratégica | 942 ms | 162.904 | 152 |
| Laderas y montaña, 1.200 m, estratégica | 926 ms | 172.542 | 155 |
| Valle fluvial, 1.200 m, estratégica | 910 ms | 211.988 | 157 |
| Valle fluvial con 150 entidades, incluidas 10 parcelas, órbita inicial | — | 280.920 | 1.118 |

En el mundo de carga se registraron **55,3 FPS en órbita** (percentil 95 de 33,3 ms) y **60,1 FPS caminando** (16,7 ms). El heap medido fue de 54 MB en órbita inicial y 70 MB al caminar. En los seis mundos nuevos, el primer cuadro tardó entre 793 y 942 ms en esta pasada.

## Límites observados

El detalle de la malla se reduce con la distancia y se puede distinguir al examinar la transición desde arriba. Los modelos ambientales son provisionales. El caso con muchas piezas tiene un costo considerable de llamadas de dibujo y solo se midió en esta GPU. El toque se probó en un navegador emulado a 390 × 844. Queda pendiente la validación en hardware móvil y la colisión de primera persona contra construcciones.
