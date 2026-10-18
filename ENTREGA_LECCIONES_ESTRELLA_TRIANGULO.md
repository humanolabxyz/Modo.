# Lecciones estrella-triángulo aportadas

Implementadas localmente el 16 de octubre de 2026.

**Corrección solicitada:** se retiraron los dos diagramas nuevos y se volvió a usar el diagrama de estrella-triángulo existente, con sus símbolos, líneas, marco y composición originales. Las dos lecciones, sus cables y explicaciones se conservan.

## Correspondencia y uso

Según las imágenes entregadas:

| Archivo | Lección | Conexiones | Estrella | Triángulo | Cambio |
|---|---|---:|---|---|---|
| `modo-panel-con-historial (2).json` | Estrella-triángulo sin temporizador | 46 | KM3 | KM2 | S3 |
| `modo-panel-con-historial (3).json` | Estrella-triángulo con temporizador | 42 | KM2 | KM3 | KT1 |

En ambas versiones, S1 da la marcha inicial, KM1 es el contactor principal y S2 es el paro. En la versión temporizada se utiliza el modelo virtual de retardo a la conexión ya existente: 55–56 abre al terminar el tiempo y 67–68 cierra. Esto describe el modelo de la app; no acredita el modo de un temporizador físico concreto.

Abre el sombrero **Guía paso a paso**. Ahora hay cuatro lecciones. Las nuevas opciones aparecen como **03** y **04**, con **Aprender** y **Armar y explicar**. Al iniciar cualquiera se añade KM3 automáticamente si falta; se conserva el comportamiento habitual de banco vacío y Deshacer.

Cada una incorpora:

- Un paso por cable del archivo recibido, conservando sus extremos.
- Diagrama original de estrella-triángulo como referencia, sin modificar su presentación. El cable del paso sigue marcado en el banco.
- Ventana de comprensión con componentes, motivo, funcionamiento y consecuencia de omitir la unión.
- Prueba sin pistas, preguntas por cable, borradores, explicación final, entrega y revisión en ventanas separadas.
- Persistencia, importación/exportación JSON e historial compatibles con las lecciones anteriores.

## Fidelidad a los archivos

Los originales se conservaron sin modificar en `referencias/lecciones-estrella-triangulo/`. `src/data/starDeltaSources.json` contiene los extremos de los cables, su procedencia y el SHA-256 de cada original. Las imágenes del chat se usaron para identificar cuál corresponde a cada modalidad; no se trataron como instrucciones para la aplicación.

El historial de ambos archivos está marcado como recortado y conserva 200 acciones. La lección se deriva del montaje final y sigue el orden del arreglo de cables recibido; no se afirma recuperar toda la cronología de construcción.

El archivo (3) no tiene cables TP. El archivo (2) tiene dos redes TP separadas en su grafo de cables; no contiene un puente entre los TP izquierdo y derecho de KM2. Se conservaron ambas características y no se añadieron cables ni uniones internas por suposición. La revisión de la prueba compara con esa referencia recibida, sin certificar una instalación física.

El diagrama original representa el cambio manual. La variante temporizada mantiene su contenido y cableado en los pasos; no se presenta el dibujo original como un esquema de KT1 ni se inventan correspondencias gráficas.

La simulación anterior **Arranque estrella-triángulo con temporizador** permanece como ejemplo independiente: sus pulsadores y los papeles KM2/KM3 no se sustituyeron por los nuevos archivos.

## Implementación

- `src/data/lessonIds.ts`, `lessons.ts`, `starDeltaSources.json`, `starDeltaTeaching.ts`, `lessonTeaching.ts`: dos recorridos nuevos y contenido contextual para los 88 cables añadidos.
- `src/data/cade.ts`: ambas lecciones reutilizan `ESTRELLA_CADE`; el selector conserva los diagramas anteriores. `cadeEstrellaTriangulo.json` no se modificó.
- `src/data/assessmentState.ts`: admite las dos evaluaciones nuevas y conserva las anteriores.
- `src/components/App.tsx`: prepara KM3 antes de iniciar lección o prueba.
- `src/components/ToolDock.tsx`: numeración, nombres y accesos para las cuatro lecciones.
- `src/components/AssessmentWindows.tsx`, `LessonUnderstanding.tsx`, `DiagramPane.tsx`: objetivos, explicación y referencia sin pistas adecuados a cada modalidad.
- `src/components/LessonSchematic.tsx`, `LessonReference.tsx`: muestran el dibujo original con su marco y señalan su uso como referencia del cambio manual.
- `public/diagrams/leccion-estrella-manual.png`, `leccion-estrella-temporizador.png`: copias del diagrama original para mantener los enlaces de los paneles guardados.

Copias de compatibilidad reproducibles: `node scripts/render-star-lesson-maps.mjs`. Los diagramas nuevos retirados quedaron respaldados en `qa/star-lessons/replaced-diagrams/`.

## Verificación

Todas pasaron:

- `npm install`, `npm run check`, `npm run build`.
- `node qa/verify-star-lessons.mjs`: correspondencia exacta de los 46/42 cables, SHA-256, bornes, contenido, identidad del diagrama original y ausencia de correspondencias gráficas inventadas. También evaluación, equivalencias y JSON/historial.
- El mismo test verifica ambos montajes con el modelo virtual: arranque en estrella, retención al soltar S1, cambio manual/temporizado a triángulo y parada con S2, con los papeles KM2/KM3 correspondientes.
- `node qa/verify-star-lessons-ui.cjs`: última revisión de ambas lecciones con el diagrama restaurado en 390×844 y 1440×900 (`STAR_VIEWPORTS=390,1440`). Selector, incorporación de KM3, lectura, avance automático, pregunta específica de cambio, referencia sin pistas, guardado, recarga, entrega e importación de ambos JSON originales. Sin errores del navegador ni desborde horizontal.
- `node qa/verify-lesson-understanding.mjs`: contenido y evaluación de las cuatro lecciones, con 153 pasos en total.
- `node qa/verify-assessment-windows.cjs`: regresión de las ventanas anteriores en los cuatro tamaños; borradores, entrega, revisión y exportación/importación.
- `npm run verify:estrella`: las 29 redes, 26 símbolos y 82 conductores del diagrama original siguen intactos.
- `npm run verify:data`, `npm run verify:wiring`, `npm run verify:simulation`, `npm run verify:panel-history`.

Resultados: [modelo y secuencias](qa/star-lessons/model-results.json), [interfaz de ambas lecciones](qa/star-lessons/ui-results.json), [regresión de ventanas](qa/assessment-windows/results.json).

Comprobación móvil en Chromium emulado. Pendientes: uso en un teléfono físico y revisión docente del contenido. Los cambios permanecen locales, sin despliegue.

## Capturas comparativas

| Antes: dos lecciones | Ahora: cuatro lecciones |
|---|---|
| ![Selector anterior](qa/star-lessons/before/selector-1440.png) | ![Selector con estrella-triángulo](qa/star-lessons/selector-estrellaTimer-1440.png) |

- [Pregunta del cambio manual en móvil](qa/star-lessons/question-estrellaManual-390.png).
- [Estudio del contacto temporizado en móvil](qa/star-lessons/change-estrellaTimer-320.png).
- [Objetivo de la versión temporizada](qa/star-lessons/objective-estrellaTimer-390.png).
- [Diagrama original restaurado en escritorio](qa/star-lessons/original-diagram-estrellaManual-1440.png).
- [Diagrama original restaurado en móvil](qa/star-lessons/original-diagram-estrellaTimer-390.png).

Respaldo de los archivos anteriores: `qa/star-lessons/before/`.
