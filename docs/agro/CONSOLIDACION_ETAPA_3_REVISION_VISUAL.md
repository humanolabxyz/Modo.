# modo. Agro · Revisión visual y de rendimiento de la Etapa 3

Fecha: 10 de noviembre de 2026. Estado: revisión técnica realizada; cierre de etapa pendiente de revisión visual del usuario. Sin commit, push ni despliegue.

## Evidencia entregada

La evidencia se guarda fuera del repositorio, en:

`C:/Users/HUMANO LAB/.codex/visualizations/2026/11/10/01a1c66a-f292-72a0-a7db-720b23b3c7b2/agro-etapa3-revision/`

- `galeria.html`: doce capturas finales, con botones para alternar el antes y después al mismo encuadre y enlaces a los PNG originales.
- `contacto-estrategica.jpg` y `contacto-orbital.jpg`: hojas de contacto de los seis territorios.
- `comparacion-lod.jpg`, `comparacion-horizonte.jpg`, `comparacion-camara.jpg`: comparaciones ampliadas.
- `antes/mediciones.json` y `despues/mediciones.json`: contadores reales por componente, cámaras, consumo de heap y tres pasadas de movimiento.
- `camaras-antes/camaras.json` y `camaras-despues/camaras.json`: regresión de seis puntos problemáticos y 48 barridos de cámara por versión.
- `git-inicial.txt`, `git-final.txt` y `git-resumen.txt`: estado del checkout y separación de archivos que ya estaban cambiados al empezar.

Se capturaron mapas vacíos de 1.200 m para exponer el paisaje sin ocultarlo con equipos. Mundo libre, Oasis nortino, Desierto árido, Laderas y montaña y Valle fluvial usan V2 y semilla 31415. Valle central conserva el V1 clásico con semilla 31. Las mediciones de carga usan exactamente el mismo documento de 150 entidades y 10 parcelas en ambos builds. Las comparaciones amplias de cámara usan Laderas V2.

## Hallazgos y correcciones

### Uniones entre niveles de detalle

Había diferencias de normales y cubierta según el salto de muestreo, y las faldas verticales ocultaban grietas sin hacer coincidir la superficie de los bloques vecinos. Al mirar laderas desde arriba podían leerse dientes y cambios rectangulares de detalle.

La malla de la escena ahora conserva su interior simplificado, pero une ese interior a una hilera de perímetro común entre todos los niveles. Esas uniones comparten altura, normal y color. No cambia ninguna altura del heightfield ni una edición persistida. Las pruebas comprueban bordes contiguos con distinto LOD, área exacta sin huecos ni solapes, orientación de los triángulos y chunks parciales de esquina.

Esta corrección elimina la discontinuidad geométrica del borde; no añade interpolación temporal entre LOD. Al acercar y alejar la cámara todavía se puede percibir el cambio de densidad. En pendientes fuertes se sigue distinguiendo la triangulación y la interpolación del color al ampliar la imagen. No se declara acabado visual definitivo.

### Montañas y cinturón exterior

El muestreo lejano tenía anillos muy separados que producían siluetas angulosas y bandas de triángulos radiales grandes. Se refinó gradualmente el espaciado radial y lateral. La malla exterior sigue dibujándose en una llamada y sigue excluida de pincel, selección, construcción y guardado.

No se sustituyeron el ruido, la semilla ni los generadores V1/V2. En las vistas revisadas no se observó una serie de montañas idénticas clonadas. La apariencia sigue siendo procedural: hay frecuencias y formas de cerro similares, vegetación provisional repetida y detalle más liso a distancia. El refinamiento evita parte del aspecto repetitivo debido al muestreo grueso; no constituye una auditoría de todas las semillas posibles.

### Cámara bajo el paisaje y vacío visible

Se reprodujeron seis posiciones válidas de órbita en Laderas donde el suelo de seguridad usaba la altura analítica, pero la superficie interpolada de la malla quedaba más arriba. La cámara terminaba entre **23,16 y 33,53 m bajo la malla**, dejando ver el vacío blanco o la cara interior del paisaje.

La cámara ahora contrasta su altura con la malla exterior efectivamente dibujada y conserva al menos 2 m sobre ella. La comprobación invoca el raycast geométrico sin reactivar el picking del cinturón para las herramientas. Los seis puntos, repetidos en las mismas coordenadas, terminaron entre **2,00 y 2,35 m sobre la superficie**, sin rayos inferiores que escapasen al vacío. Cerca de una ladera una parte grande del encuadre puede mostrar suelo: es oclusión por la montaña, no transparencia ni desaparición de la malla.

También se revisaron cuatro esquinas por territorio y **48 encuadres estratégicos extremos**: seis territorios × escritorio/vertical móvil × cuatro orientaciones, con distancia y ángulo estratégicos máximos. Ningún barrido final dejó escapar los rayos inferiores de comprobación por un hueco. Esto cubre esos encuadres y tamaños; no demuestra todas las trayectorias posibles ni todas las semillas.

## Medición comparable de carga

Chromium con ANGLE/D3D11, NVIDIA GeForce GTX 1660 SUPER, viewport 1.440 × 900, DPR 1. Ambos builds se midieron secuencialmente con el mismo escenario, pausa, cámara inicial, iluminación y controles. El desglose se obtiene de las llamadas realmente renderizadas por objeto, incluidas las pasadas adicionales de materiales. La suma de categorías se comprueba contra `renderer.info.render.calls`.

| Medición | Antes | Después |
|---|---:|---:|
| Entidades / parcelas | 150 / 10 | 150 / 10 |
| Llamadas de dibujo | 1.118 | 1.118 |
| Triángulos totales, órbita inicial | 280.920 | 267.136 |
| Triángulos de terreno jugable | 100.870 | 72.130 |
| Triángulos de cinturón exterior | 19.992 | 34.948 |
| FPS, tres pasadas de unos 3 s | 56,9 / 56,8 / 56,9 | 55,2 / 55,1 / 55,4 |
| Mediana de FPS | 56,9 | 55,2 |
| Percentil 95 del intervalo entre cuadros | 33,2–33,3 ms | 33,3 ms |
| Heap JavaScript en la muestra inicial | 60 MB | 65 MB |

El total de triángulos baja **4,9 %**, aun refinando el horizonte, porque la unión por tiras evita densificar bloques completos y retira las faldas de la malla de escena. No se redujeron las llamadas ni se demostró una mejora de FPS: la mediana fue aproximadamente 3 % menor. Las pasadas son cortas, incluyen eventos reales del ratón y están cerca del límite de refresco. El heap es una muestra sujeta a recolección de basura y no incluye VRAM. No se presenta como validación de rendimiento móvil.

## De dónde salen las 1.118 llamadas

Los números corresponden a objetos visibles desde la cámara inicial de carga, no al costo de cada tipo con todas sus copias visibles.

| Categoría | Llamadas |
|---|---:|
| Estanques, incluidos sus auxiliares visibles | 264 |
| Tableros, incluidos sus auxiliares visibles | 240 |
| Bombas, incluidos sus auxiliares visibles | 238 |
| Paneles solares | 128 |
| Emisores | 112 |
| Tuberías | 49 |
| Parcelas | 30 |
| **Subtotal entidades** | **1.061 (94,9 %)** |
| Terreno jugable | 45 |
| Vegetación | 6 |
| Decoración de paisaje | 4 |
| Cinturón exterior | 1 |
| Cielo | 1 |
| **Total** | **1.118** |

Los modelos técnicos usan varias primitivas y materiales por entidad. El instancing actual de detalles agrupa piezas dentro de un equipo, pero no agrupa todas las copias de ese equipo en el mundo. Cada copia conserva sus llamadas. Los triángulos por sí solos no explican el costo de dibujar cientos de objetos pequeños.

Se hicieron ablaciones temporales exclusivamente en el navegador de prueba, sin guardar cambios:

| Configuración del mismo encuadre | Llamadas |
|---|---:|
| Completo | 1.118 |
| Sin etiquetas | 1.053 (−65) |
| Sin sombras de contacto | 1.036 (−82) |
| Sin ambos | 971 (−147; −13,1 %) |

Había 93 etiquetas y 116 sombras en el grafo, pero solo 65 y 82 aportaban llamadas visibles en este encuadre. No se han desactivado estas funciones en el producto.

## Optimizaciones convenientes antes de la biblioteca definitiva

1. **Preparar modelos por material y función.** Unir geometría estática del mismo material dentro de bomba/estanque/tablero; mantener separados interruptores, nivel de agua, indicadores y otras partes que cambian. Un único archivo glTF con decenas de submallas no reduce las llamadas automáticamente.
2. **Instancing entre entidades repetidas**, agrupado por modelo, material y estado visible. Empezar por equipos estáticos, tuberías y herrajes repetidos. Conservar IDs, puertos y picking analítico independientes del render. Es la oportunidad principal por el subtotal de 1.061 llamadas; el ahorro exacto requiere un piloto medido.
3. **LOD para detalles técnicos a distancia.** Tornillos, aletas, escaleras, celdas y conectores no necesitan la misma representación cuando ocupan pocos píxeles. Reservar el detalle y los puertos resaltados para cercanía y selección.
4. **Etiquetas y sombras.** Evaluar atlas y agrupación/instancing, además de visibilidad por distancia y selección, conservando información operativa accesible. La ablación mide un techo de 147 llamadas ahorrables en este encuadre; no es el ahorro garantizado de una implementación.
5. **Repetir el piloto con los assets definitivos** y medir llamadas, materiales, triángulos, carga, memoria y FPS. El terreno puede agruparse más adelante, pero sus 45 llamadas y la llamada única del cinturón no son la prioridad frente a los equipos.

Estas recomendaciones no se implementaron en esta revisión: no se reestructuró el catálogo, no se añadieron assets ni se adelantaron otras etapas.

## Alcance de los cambios de esta revisión

- Producto: `src/agro/terrain/chunks.ts`, `src/agro/terrain/exterior.ts`, `src/agro/scene/AgroCanvas.tsx`.
- Pruebas: `qa/verify-agro-territories.mjs`, exportación reutilizable de helpers en `qa/verify-agro-territory-ui.cjs`, y nuevos `qa/review-agro-etapa3.cjs` y `qa/review-agro-camera-limits.cjs`.
- La prueba de caminata de `qa/verify-agro-ui.cjs` ahora espera el desplazamiento real superior a 3 m, con timeout y liberación de tecla garantizada. El primer intento en SwiftShader no alcanzó ese umbral con la espera fija de 1,5 s; se conserva la comprobación de movimiento y su umbral.
- Documentación: este informe y referencia desde `CONSOLIDACION_ETAPA_3.md`.

V1, el algoritmo V2, las migraciones, los archivos de mundo y los motores hidráulico/PLC/economía no se modificaron en esta revisión. La prueba utiliza perfiles desechables, sin acceder a los mundos del navegador del usuario.

## Validación y límites

Se ejecutaron instalación, TypeScript y compilación, aprobados. La suite de modelo completó **312 comprobaciones PASS**, conservando migración v1→v2, copia previa, restauración, autoguardado, impactos, cancelar/aplicar/deshacer y los 360 casos de territorios. La prueba de migración e impactos en navegador completó sus **13 bloques**, incluido toque emulado a 320 × 568. Capturas/perfilado comparables y pruebas finales de cámara terminaron sin excepciones.

La suite general de interfaz, ejecutada con SwiftShader, completó **53 bloques funcionales PASS**, incluidos cableado, hidráulica, cultivo, PLC, economía, exportación/importación, escritorio y móvil. Su comprobación final de consola **no quedó aprobada**: registró `Transition was skipped` durante la navegación. Se conserva el fallo en `verificacion-agro-ui.log`; no se filtró ni se declaró verde. No se modificó el sistema general de transiciones para esta revisión de la Etapa 3. Queda pendiente aislar ese mensaje de navegación, además de la aprobación visual del usuario.

**Seguimiento posterior:** el [informe de transiciones y entrega](CONSOLIDACION_ETAPA_3_TRANSICIONES_Y_ENTREGA.md) documenta la reproducción del mismo aviso en un build anterior a la Etapa 3 y una nueva ejecución actual con **54 bloques aprobados y sin errores de consola**. No se modificó ni se filtró el sistema de transiciones. El análisis de las 1.118 llamadas de dibujo de este documento se conserva como referencia para la Etapa 6.

Los resultados finales de las suites UI y el resumen completo de Git quedan registrados en los archivos de evidencia de la entrega. No se ha probado en teléfono físico, Safari o una segunda GPU. Persisten los modelos ambientales provisionales, el cambio perceptible de densidad al variar LOD y la ausencia de colisión de caminata contra construcciones. No se considera cerrada la etapa sin revisión visual del usuario.

## Git al finalizar

Rama `agro-consolidacion`, HEAD `397848e` (Etapa 1: migración v1→v2), sin nuevos commits ni cambios en el índice. Al comenzar había 31 archivos modificados y 15 sin seguimiento; al terminar hay 31 modificados y 18 sin seguimiento. Los tres archivos nuevos respecto de la lista inicial son este informe y los dos scripts de revisión. Las correcciones también afectan archivos que ya figuraban cambiados al iniciar; por eso el recuento de archivos modificados no aumenta.

No se descartaron los cambios previos de las etapas 2 y 3. No se ejecutaron commit, push, fetch, merge ni despliegue. `git-final.txt` contiene la lista completa; no se interpreta un checkout limpio como requisito ni se limpia el trabajo existente.
