# Lecciones para comprender y «Armar y explicar»

Implementación local sobre PanelLab, 16 de octubre de 2026.

## Cómo usarlo

Abre el sombrero de la barra de herramientas y elige una lección:

1. **Marcha y paro con retención** o **Inversión de giro con enclavamiento** abre el recorrido guiado habitual.
2. Dentro de cada paso, **Comprender este paso** explica los componentes implicados, por qué se conecta el cable, qué cambia en el circuito y qué ocurriría si faltara esa unión. Incluye una pregunta para pensar antes de seguir.
3. Con ese repaso abierto, conectar el cable no hace saltar automáticamente al siguiente paso. **Leer siguiente paso** permite estudiar el recorrido sin instalar cables. Al cerrar el repaso se conserva el avance automático del modo de montaje.
4. **Armar y explicar**, debajo de cada lección en el selector, empieza la prueba con el banco vacío. Deshacer recupera el montaje anterior.

## Prueba

- Presenta un objetivo funcional y permite consultar el esquema sin instrucciones de montaje, funciones emergentes de componentes, cables fantasma ni bornes objetivo resaltados.
- Cada cable abre una pregunta de desarrollo vinculada a sus extremos. Los cables que no coinciden con una conexión específica de la referencia reciben una pregunta neutral: no se inventa una función correcta para ellos.
- Permite minimizar la ventana, seguir cableando y volver a otras conexiones. Se conserva el borrador al minimizar y recargar. **Guardar respuesta** incorpora el texto a la evaluación, al historial y a la exportación del panel.
- Incluye una explicación final del circuito. Antes de entregar, informa de respuestas pendientes y bloquea la confirmación mientras haya borradores sin guardar.
- La revisión del montaje aparece al entregar. Compara redes de cables, acepta otro orden de instalación y puentes equivalentes, y detecta uniones entre redes incompatibles. No une internamente bobinas, contactos ni N/TP.
- Las respuestas de desarrollo quedan **pendientes de revisión docente o autoevaluación**. Después de entregar pueden contrastarse con los criterios y explicaciones disponibles. No se genera una nota automática por palabras clave.
- Permite descargar las respuestas en texto y exportar/importar el panel JSON con evaluación, montaje e historial. Los paneles v2 anteriores siguen siendo válidos.
- Cambiar la conectividad después de entregar devuelve la prueba a edición; cambiar solo color, recorrido u orden visual no invalida la entrega. El alumno puede volver a editar y entregar nuevamente.

La comparación es contra el circuito de referencia del proyecto; no certifica una instalación o un equipo físico. El contenido usa las funciones representadas en las lecciones y en su modelo virtual, sin agregar componentes ni ratings nuevos.

## Cambios principales

- `src/data/lessonTeaching.ts`: contenido de comprensión y criterios para los 24 y 41 pasos.
- `src/components/LessonUnderstanding.tsx`, `StudyGuide.tsx`: repaso, navegación de lectura y pausa del avance.
- `src/data/assessmentState.ts`, `lessonAssessment.ts`: respuestas, validación de archivos y comparación por redes.
- `src/components/LessonAssessment.tsx`, `LessonReference.tsx`: preguntas, borradores, entrega, revisión y esquema sin pistas.
- `src/components/ToolDock.tsx`, `App.tsx`, `DiagramPane.tsx`: entradas desde las lecciones e integración con el banco y sus ventanas.
- `src/data/practice.ts`, `wiring.ts`, `changes.ts`, `session.ts`, `src/hooks/usePractice.ts`: persistencia opcional compatible con paneles existentes, historial e importación/exportación.
- `src/components/FloatingWindow.tsx`, `src/styles/lesson-understanding.css`: ventana adaptable con mayor área de escritura en móvil.
- `src/hooks/useSvgNavigation.ts`: limita la interpolación desde cero para evitar dimensiones SVG negativas durante transiciones.
- `src/components/ProcedureTools.tsx`: nombre legible de la evaluación en el historial.

## Verificación

- `npm run check`, `npm run build`.
- `node qa/verify-lesson-understanding.mjs`: contenido en los 65 pasos, redes equivalentes, montajes incompatibles, respuestas asociadas a extremos, validación y exportación/importación con historial.
- `node qa/verify-lesson-understanding-ui.cjs`: recorrido completo en 320×740, 390×844, 844×390 y 1440×900; lectura sin cablear, pausa y avance, referencia sin pistas, respuestas por cable, borradores, entrega, recarga y exportación/importación. Sin errores de navegador.
- `npm run verify:panel-history`, `npm run verify:wiring`, `npm run verify:simulation`, `npm run verify:data`.
- `npm run verify:modulos-extra-ui`: recorrido anterior de módulos, lecciones, avance automático, ejemplos y multímetro preservado.
- `node qa/lesson-understanding/verify-inversion.cjs`: prueba de inversión, referencia ampliable y pregunta de enclavamiento.
- Pruebas de barra móvil, ventana de diagrama en ambas orientaciones y giro de pantalla.

Resultados: `qa/lesson-understanding/model-results.json`, `qa/lesson-understanding/ui-results.json`. Las pruebas táctiles usan Chromium emulado; falta comprobación en teléfono físico y revisión pedagógica docente del nuevo contenido.

## Capturas

- [Repaso de la lección en móvil](qa/lesson-understanding/study-390.png).
- [Pregunta de desarrollo en móvil](qa/lesson-understanding/question-390.png).
- [Pregunta de desarrollo en escritorio](qa/lesson-understanding/question-1440.png).
- [Revisión del montaje después de entregar](qa/lesson-understanding/result-390.png).

Los cambios permanecen en el proyecto local; no se han publicado.
