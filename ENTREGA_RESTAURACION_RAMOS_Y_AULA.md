# Inicio de ramos restaurado y organización interior del aula

Se recuperó el acceso directo a las seis tarjetas ilustradas de Mis ramos. Se retiró el planificador que las había desplazado y el desplegable que las escondía. Conserva búsqueda, filtros, ilustraciones y acceso a cada ramo.

Dentro de cada materia se muestra el índice del curso y sus unidades desplegables. Funciones y Matrices conserva los módulos y recursos agrupados según la captura del aula: actividades en filas, grupos de actividades formativas y originales. Las prácticas complementarias permanecen disponibles bajo Apoyo para estudiar esta unidad. Los otros ramos conservan su contenido sin inventar módulos.

En teléfono el índice se despliega desde un botón y se repliega al elegir un módulo. Abrir una actividad y volver mantiene unidad y módulo; volver a Mis ramos limpia ese contexto para no trasladarlo a otra materia.

## Archivos de implementación

- `src/study/StudyHub.tsx`: tarjetas visibles, encabezado y limpieza del contexto de navegación.
- `src/study/CourseOutline.tsx`: integración del aula y enlaces con contexto; mantiene los lectores y cuadernos existentes.
- `src/study/CourseClassroom.tsx`: índice, unidades, módulos, recursos, despliegue y navegación a la ubicación solicitada.
- `src/styles/course-classroom.css`: composición interior y adaptación a teléfono; estilos limitados a esta vista.
- `qa/verify-unit-modules.cjs`, `qa/verify-study-navigation.cjs`: regresión actualizada a la organización solicitada.

## Validación local

`npm install`, `npm run check`, `npm run build`, `npm run verify:unit-modules` y `PANELLAB_URL=http://127.0.0.1:4345 npm run verify:study-navigation` completados. Sin errores de página registrados en esas pruebas.

Se verificaron tarjetas, búsqueda, acceso a clases, regreso al módulo, enlaces directos a matrices, colapsar/expandir, teclado, índice móvil y ausencia de desbordamiento horizontal a 390, 820 y 1440 px. GeoGebra: guía, comandos y resultados a 390×844, 820×1180, 1180×820 y 844×390, conservando dimensiones y applet vivo. Comprobación visual de capturas en escritorio y móvil. Son tamaños emulados en Chromium, no pruebas con dispositivos físicos.

## Comparación

- [Interior anterior con selectores](qa/aula-reference/course-before-1440.png)
- [Interior con unidades y módulos](qa/aula-reference/course-after-1440.png)
- [Inicio de ramos restaurado](qa/aula-reference/home-after-1440.png)
- [Interior en teléfono](qa/unit-modules/reference-course-390.png)
- Resultados: `qa/unit-modules/verification.json`, `qa/study-navigation/verification.json`.

## Pendientes

Los módulos de trigonometría, el Proyecto ABPro y la evaluación mantienen sus avisos de material pendiente. La nueva organización no agrega documentos que no se hayan recibido. Trabajo local, sin publicación.

## Ajuste de interacción: inicio replegado

`CourseClassroom.tsx` inicia las unidades y módulos cerrados tanto en el contenido como en el índice. El control muestra Expandir todo y se sincroniza al desplegar o replegar secciones manualmente. Los enlaces con unidad/módulo y el regreso desde una actividad abren únicamente el recorrido necesario. El panel Mis ramos no cambia.

Validación repetida: instalación, TypeScript, build y `verify:unit-modules` correctos. La regresión comprueba el inicio completamente cerrado, despliegue global, regreso con una sola unidad y un solo módulo abiertos, navegación del índice móvil y ausencia de desbordamiento a 390, 820 y 1440 px. Captura del estado actual: [aula replegada](qa/unit-modules/reference-course-1440.png). La captura anterior de `qa/aula-reference/course-after-1440.png` conserva la versión desplegada para comparación.
