# Ventanas de la prueba y composición del estudio

Cambio local sobre PanelLab INACAP, 16 de octubre de 2026.

## Resultado

El selector de lecciones presenta cada circuito en una tarjeta, con las opciones **Aprender** y **Armar y explicar** juntas. El menú **Mi prueba** contiene únicamente el progreso y accesos a sus ventanas.

Cada tarea tiene una ventana propia: objetivo, pregunta del cable, listado de respuestas, explicación final, entrega, resultados, revisión del montaje y revisión de una respuesta. En escritorio pueden permanecer abiertas, moverse y cerrarse por separado. En móvil se muestra una tarea a la vez para conservar espacio; el acceso **Menú de la prueba** permite cambiar de tarea.

La pregunta distingue visualmente los dos bornes, la consigna y la respuesta. **Guardar respuesta** y **Seguir cableando** permanecen fuera del área de desplazamiento. Los borradores se conservan al cerrar, cambiar de ventana y recargar. La entrega sigue evitando que un borrador sin guardar se pierda.

**Comprender este paso** abre otra ventana independiente de la guía de montaje. Sus cuatro apartados muestran una idea por vez: componentes, motivo de la conexión, funcionamiento y consecuencia de omitirla. Cerrar la guía no cierra esta explicación. Leer el siguiente paso sigue permitiendo estudiar sin instalar cables.

Se conservaron el contenido técnico, la comparación por redes, los criterios de revisión, el formato JSON, el historial y la exportación de respuestas. El simulador permanece en el proyecto existente.

## Archivos de implementación

- `src/components/AssessmentWindows.tsx`: ventanas de la prueba y navegación.
- `src/components/AssessmentDraft.tsx`: escritura, borradores y guardado explícito.
- `src/components/LessonConnectionCard.tsx`: extremos de cada conexión.
- `src/components/LessonUnderstanding.tsx`: estudio por apartados.
- `src/components/StudyGuide.tsx`, `ToolDock.tsx`, `App.tsx`, `LessonAssessment.tsx`: integración y acceso a las ventanas.
- `src/components/FloatingWindow.tsx`: acciones fijas y activación de ventanas ya abiertas, conservando arrastre, cierre y foco.
- `src/styles/lesson-understanding.css`: jerarquía, tarjetas y adaptación móvil.

## Verificación

Todas las comprobaciones siguientes pasaron:

- `npm install`, `npm run check`, `npm run build`.
- `node qa/verify-assessment-windows.cjs`: 320×740, 390×844, 844×390 y 1440×900. Ventanas independientes, cierre, movimiento, lectura sin cablear, borradores, entrega, revisión, TXT e importación/exportación JSON. Sin errores de navegador ni desborde horizontal.
- `node qa/verify-assessment-window-inputs.cjs`: arrastre táctil emulado, movimiento por teclado, Escape y retorno del foco al acceso de origen en escritorio.
- `node qa/verify-lesson-understanding.mjs`: contenido de los 65 pasos, redes equivalentes e incompatibles, respuestas asociadas al cable y formato JSON/historial.
- `node qa/lesson-understanding/verify-inversion.cjs`: objetivo y esquema ampliable de inversión, pregunta de enclavamiento y guardado.
- `npm run verify:float`, `node qa/verify-scaled-window.mjs`: límites, movimiento y escala de ventanas.
- `$env:PANELLAB_URL="http://127.0.0.1:4325/"; npm run verify:modulos-extra-ui`: módulos, posiciones, cableado, lecciones, avance automático, ejemplos de simulación y multímetro.

Resultados: [prueba de ventanas](qa/assessment-windows/results.json), [modelo de lecciones](qa/lesson-understanding/model-results.json), [regresión del simulador](qa/modulos-extra/ui-verification.json).

La comprobación móvil usa Chromium emulado; queda pendiente usarlo en un teléfono físico y la valoración visual del usuario. No se ha desplegado.

## Comparativa

| Composición anterior | Pregunta separada actual |
|---|---|
| ![Antes: objetivo, listado y pregunta mezclados](qa/assessment-windows/before/question-390.png) | ![Ahora: conexión, pregunta y respuesta](qa/assessment-windows/question-390.png) |

Otras capturas: [selector de lecciones móvil](qa/assessment-windows/picker-390.png), [menú de prueba móvil](qa/assessment-windows/menu-390.png), [estudio móvil](qa/assessment-windows/study-390.png), [estudio con guía en escritorio](qa/assessment-windows/study-why-1440.png), [revisión de una respuesta](qa/assessment-windows/review-390.png).

Respaldo de los componentes anteriores: `qa/assessment-windows/before/`.
