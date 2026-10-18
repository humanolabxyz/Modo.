# Panel de diagrama, tipografía y referencias de la prueba

Actualización local del 14 de octubre de 2026, sobre la misma aplicación Astro/React. Se conserva el banco aprobado, sus siete módulos y 108 bornes. Respaldo anterior: `qa/diagrama-layout/antes-ajuste.zip`.

## Correcciones de interfaz

- Cabecera y pestañas separadas del contenido; ampliar, cerrar y volver al banco permanecen accesibles.
- Una sola zona de desplazamiento dentro del panel. Las herramientas, la guía, las correspondencias y el examen crecen dentro de esa zona.
- Se eliminó la geometría fija de cada tarjeta interna y una regla antigua `display: block !important` que anulaba la distribución al ampliar.
- El menú flotante de cables se oculta al ampliar el diagrama, para dejar libres sus botones de cabecera. Sigue disponible en Banco.
- Distribución adaptable para escritorio, tablet, móvil vertical y horizontal. El banco conserva selección, cables, zoom y desplazamiento al abrir/cerrar/ampliar.
- Source Sans 3 local, con archivos regular, semibold y bold y licencia incluida en `public/fonts/`. Controles de 13–14 px, espaciado y pesos legibles; las etiquetas físicas de bornes conservan su dibujo original.

## Material del profesor

En **Abrir diagrama → Guía interactiva → Materia del profesor · Unidad 2** se encuentra la guía de 17 páginas aportada por el usuario, con acceso al PDF original y sus cuatro figuras de fuerza, mando, estrella y triángulo. Incluye una explicación de la secuencia y los objetivos de estudio derivados del documento.

La actividad corresponde a partida manual estrella–triángulo con KM1, KM2 y KM3. Se usa como referencia de estudio; no se ejecutan las instrucciones de entrega del documento ni se implementa simulación de energización.

El PDF se conservó byte por byte en `public/materiales/actividad-1-u2.pdf`. Sus figuras se extrajeron de las imágenes originales embebidas, sin redibujar bornes.

## Captura de la prueba y conectores

En la misma Guía interactiva aparece **Prueba · partida directa · conectores**, con la captura original, las siete redes de mando visibles, una tabla de bornes y accesos al banco. El circuito de esta captura utiliza un solo KM1.

El usuario confirmó expresamente:

| Referencia | Módulo / borne físico |
|---|---|
| KM1 | Contactor + relé térmico |
| KM2 | Contactor trifásico sin térmico |
| KM1:11 | CONTACTOR_TERMICO:71 |
| KM1:12 | CONTACTOR_TERMICO:72 |
| KM1:A1 / A2 | CONTACTOR_TERMICO:A1 / A2; etiquetas coincidentes |
| KM1:13 / 14 | CONTACTOR_TERMICO:13 / 14; etiquetas coincidentes |
| F:95 / 96 | CONTACTOR_TERMICO:95 / 96; protección del mando |
| F:97 / 98 | CONTACTOR_TERMICO:97 / 98; señalización del térmico |

95 y 96 tienen accesos visibles al comienzo de la ficha, junto a 71 y 72. Identificarlos no instala un puente. El conductor entra por 95 y sale por 96, respetando el contacto que los separa. Tampoco se unen automáticamente 71–72 ni A1–A2.

Las identidades KM1/KM2 son la base visible del banco y de la búsqueda. Se conserva la posibilidad de editar y guardar etiquetas personales. La nueva traducción 11→71 / 12→72 se reutiliza en las correspondencias de PERFECTO y en la guía sin cambiar los IDs físicos.

## Diferencias entre referencias y pendientes

La captura de la prueba rotula H1 rojo/detenido, H2 verde/funcionando y H3 amarillo/falla. PERFECTO usa H3/H1/H2 respectivamente. Además, en la captura las derivaciones hacia F:97 y KM1:11 nacen de la salida del disyuntor de mando; PERFECTO las conecta a otros nodos. La ficha registra esas diferencias; el archivo original de 47 líneas se conserva y no se presenta como una copia exacta del esquema de la prueba.

El PDF estrella–triángulo es otra actividad. No se intercambian automáticamente los nombres de pilotos ni los circuitos entre las tres fuentes.

Quedan pendientes el pulsador verde usado como SB2, la traducción de los contactos de pulsadores y polos de fuerza, el retorno físico de pilotos y la identificación de alimentación/protecciones que no estén verificadas. KM3 del PDF también requiere identificar su módulo. PERFECTO dispone ahora de 16 correspondencias y conserva 35 pendientes; los datos desconocidos no se califican arbitrariamente.

## Pruebas y evidencia

- TypeScript y build estático.
- Integridad del modelo: siete módulos, 108 IDs originales y 47 líneas.
- Guía: ayudas, ghost alineado con zoom/pan, redes equivalentes, errores corregibles, examen, guardado y exportación.
- Prácticas existentes: cables compartidos, curvas, deshacer/rehacer, imágenes propias, importación/exportación y reconocimiento.
- Lectura: ejercicios originales y navegación del banco.
- Distribución con herramientas y todas las correspondencias abiertas: 1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×800 y 844×390. Cabecera accesible, contenido delimitado, sin colisión con herramientas ni desbordamiento horizontal.
- Fuente local efectivamente cargada y PDF servido idéntico al aportado.

El recorrido específico está en `qa/verify-diagram-layout.cjs` (`npm run verify:diagram-layout`). Resultado y capturas: `qa/diagrama-layout/verification.json`, `antes-desktop.png`, `despues-desktop.png`, `antes-ampliado.png`, `despues-ampliado.png` y `conectores-prueba-mobile.png`.

## Archivos principales

`DiagramPane.tsx`, `DiagramReader.tsx`, `TeacherMaterial.tsx`, `ExamReference.tsx`, `diagram-layout.css`, `learning.css`, `global.css`, `panelCorrespondence.ts`, `examReference.ts`, `learning.ts`, `wiring.ts`, identificación en `App.tsx`/`Board.tsx`/`SimulatorInspector.tsx`, material local y tipografía. No se añadieron dependencias de aplicación ni se desplegó.
