# Lección del montaje recibido

Actualización: publicada en producción por petición expresa del usuario en https://modo-lab.vercel.app. Despliegue `dpl_5Y4Djgv2cKNqtQvvokzQko39jLBG`, estado READY; verificaciones públicas en `qa/deploy-2026-10-27/`.

Acceso local: `http://127.0.0.1:4327/?view=simulator`, Guía paso a paso → Estrella-triángulo · 2 contactores → Aprender.

## Fuente y recorrido

Se conserva íntegro `referencias/lecciones-estrella-triangulo/modo-panel-dos-contactores-original.json`, copia del archivo recibido `modo-panel-con-historial (2).json`, SHA-256 `aec6c2de15663dd8273f6785b9303cd01e46881fcf3732399f92b61ec84b4676`. Su historial no se convierte en instrucciones ni en pasos de montaje.

El estado actual tiene 37 cables. Conserva además 42 pasos de una lección anterior que no describen esos cables. La nueva lección utiliza exactamente los 37 pares actuales y su orden, con títulos, explicación, funcionamiento, efecto de retirar la conexión, pregunta y criterios propios. El historial completo de 6,6 MB queda fuera del código que carga la aplicación: se incorpora una extracción pequeña de los pares y su procedencia.

La lección comienza sin cables y con simulación detenida. KM1 es el contactor con relé térmico y realiza triángulo; KM2 realiza estrella. KT1 es el conjunto temporizado presente en el archivo. S3 inicia la marcha, S2 detiene y S1 no interviene. No se añade KM3. Se mantienen las lecciones anteriores y se incluye la nueva variante en «Armar y explicar», importación/exportación y persistencia.

## Referencia visual conservada

Por indicación expresa del usuario se conserva el diagrama original referenciado en su JSON, incluyendo símbolos, textos, coordenadas, marco y distribución. Se retiró la redibujación que se había preparado.

La guía resalta en naranja el tramo de referencia relacionado con cada paso, y en verde los tramos de pasos ya conectados. El lector grande recibe el mismo resaltado. Los 37 pasos tienen un recorrido existente sobre líneas originales; no se añaden conductores al dibujo. Las anclas de referencia son metadatos invisibles separados de los IDs de bornes del banco.

Esta referencia conserva rótulos y topología anteriores del archivo. El resaltado relaciona funciones con los pasos; no afirma que el dibujo original sea una reproducción literal de las 37 conexiones. Por ejemplo, la alimentación de triángulo en el dibujo original se toma antes del contactor de línea. La comprobación del montaje y su evaluación usan los pares reales del JSON, no esas equivalencias visuales. La vista se rotula «Diagrama original · tramo relacionado».

## Borrado y confirmación

El borrado completo se encuentra en el desplegable de la goma de borrar de la barra del banco: icono de basurero y «Borrar todo». Se eliminó el botón flotante separado. Se conserva Deshacer/Rehacer y la cancelación del cable pendiente.

La confirmación de un cable se muestra como mensaje flotante en la pantalla, fuera de la ventana de la guía. El tick se dibuja en 280 ms después de una demora de 100 ms y el mensaje se retira al avanzar a los 850 ms. La guía hace una transición breve al siguiente paso. No hay tarjeta grande, barra de progreso ni botón Continuar dentro de esa animación. El controlador permanece activo con la guía minimizada y respeta movimiento reducido.

## Archivos principales

- Datos y explicación: `src/data/twoContactorSource.json`, `src/data/twoContactorTeaching.ts`, `src/data/lessons.ts`, `src/data/lessonIds.ts`.
- Referencia y resaltado: `src/data/twoContactorReference.ts`, `src/data/cade.ts`, `src/data/lessonSchematics.ts`, `src/components/LessonSchematic.tsx`, `src/components/DiagramPane.tsx`.
- Evaluación: `src/components/AssessmentWindows.tsx`.
- Borrado: `src/components/ToolDock.tsx`, `src/styles/global.css`.
- Confirmación: `src/components/LessonConfirmation.tsx`, `src/components/StudyGuide.tsx`, `src/components/App.tsx`, `src/styles/guide-confirmation.css`.

## Verificación

`qa/verify-two-contactor-lesson.mjs` verifica hash, 37 pares exactos, ausencia de KM3, conservación del dibujo original salvo anclas invisibles, trazado sobre líneas originales para los 37 pasos, enseñanza, evaluación, exportación y secuencias S3/retención/estrella/triángulo/S2/TEST.

`qa/verify-two-contactor-lesson-ui.cjs` comprueba la interfaz en escritorio, tablet y móvil, referencia original, conexión y persistencia de pasos, evaluación y funcionamiento del montaje recibido. Las capturas están en `qa/two-contactor-lesson/`.

`qa/verify-cable-reset-tablet.cjs` comprueba el desplegable de la goma, borrado completo con cable pendiente, deshacer/rehacer, persistencia y reposo en Chromium y WebKit a 390, 820 y 1440 px. Capturas en `qa/cable-reset-tablet/`.

Se ejecutan además `npm run check`, `npm run build` y la regresión del modelo de las lecciones anteriores. La verificación de navegador utiliza tamaños y tacto emulados; no se ha probado una tablet física.
