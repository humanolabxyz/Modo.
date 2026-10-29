# Lección flotante sobre GeoGebra

Implementación local, 19 de octubre de 2026. Sin despliegue.

Los cuatro problemas del profesor abren GeoGebra con el cuaderno en una ventana superpuesta. Comparte el componente de ventanas de Diagramas: se mueve por la cabecera, se cambia de tamaño desde la esquina y se repliega con la X. «Mostrar lección» permite recuperarla. «Cuaderno» y «Pasos de GeoGebra» comparten el mismo espacio; preparar un comando repliega la ventana y deja la entrada lista para ejecutar.

El texto se reorganiza al cambiar el tamaño, manteniendo letras legibles. La gráfica conserva todo el espacio disponible al replegar la lección. Girar la pantalla conserva el applet, la construcción y las respuestas. Una comprobación correcta muestra una confirmación breve y avanza al siguiente paso. Los enlaces de regreso conservan el contexto del repaso de Unidad 2.

## Archivos de implementación

- `src/study/ProblemGeoWorkspace.tsx`: integra cuaderno, guía y GeoGebra en el espacio flotante.
- `src/study/ToolLessonStudy.tsx`: abre el espacio para los problemas del profesor.
- `src/study/FunctionProblemNotebook.tsx`: acciones de práctica integradas y aviso visible de errores de almacenamiento.
- `src/lab/GeoGebraView.tsx`: permite alojar la guía en la ventana compartida, conserva comprobación real y avance automático.
- `src/components/FloatingWindow.tsx`: visibilidad sin desmontar, altura configurable y opción de reorganizar texto; conserva el escalado predeterminado de Diagramas.
- `src/styles/floating-window.css`, `src/styles/problem-geo-workspace.css`: presentación y adaptación de la ventana.
- QA: `qa/verify-problem-overlay.cjs`, selectores actualizados en pruebas de cuadernos, repaso y módulos.

## Validación

- `npm install`, `npm run check`, `npm run build`: correctos.
- `npm run verify:float`: geometría compartida correcta.
- `npm run verify:geogebra`: 17 preguntas, 28 comprobaciones reales de GeoGebra y navegación/responsividad existentes correctas.
- `node qa/verify-problem-lessons.cjs`, `node qa/verify-lesson-focus.cjs`: lecciones e introducciones correctas.
- `npm run verify:unit-modules`: portada, acordeones, módulos y regreso al ramo correctos.
- `node qa/verify-unit2-exam-review.cjs`: cuatro actividades, práctica real, regreso y progreso correctos.
- `node qa/verify-problem-overlay.cjs`: movimiento y ajuste mediante teclado y entrada táctil de Chromium, plegado, conservación del iframe y respuestas, cambio de orientación y compatibilidad con otras ventanas correctos.

Verificación en navegador emulado: 390×844, 844×390, 820×1180, 1180×820 y 1440×960. No equivale a una prueba en dispositivos físicos. Sin pendientes funcionales detectados en estas comprobaciones.

## Comparación visual

- Antes: [cuaderno separado](qa/problem-overlay/before-notebook.png).
- Después: [PC](qa/problem-overlay/fresh-guide-1440x960.png), [móvil vertical](qa/problem-overlay/fresh-guide-390x844.png), [móvil horizontal](qa/problem-overlay/fresh-guide-844x390.png), [tablet vertical](qa/problem-overlay/fresh-guide-820x1180.png), [tablet horizontal](qa/problem-overlay/fresh-guide-1180x820.png).
- Resultados reproducibles: `qa/problem-overlay/verification.json`.
