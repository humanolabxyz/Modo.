# Aprender a medir · panel de dos contactores

Cambio local. No publicado.

«Aprender a medir» utiliza ahora exclusivamente el montaje recibido de dos contactores: 37 conexiones de `TWO_CONTACTOR_LESSON`, con 20 de mando al comenzar y las 17 de fuerza añadidas después de las comprobaciones de placa y protección.

| Recorrido anterior | Recorrido actual |
| --- | --- |
| Montaje manual de tres contactores | 37 cables del montaje recibido de dos contactores |
| S1 inicia y S3 cambia manualmente | S3 inicia, S2 para; S1 no interviene |
| KM1 principal, KM3 estrella y KM2 triángulo | KT1 de línea temporizado, KM2 estrella y KM1 triángulo |
| Piloto rojo P2 en reposo | P2 sin cablear; reposo con pilotos apagados |
| TEST con rojo y amarillo | TEST con solamente P3 amarillo |

Se mantienen 34 pasos y 15 mediciones de tablas. Las preguntas, instrucciones, estados exigidos, continuidad R–KT1:L1, evidencia de maniobras, temporizador, pinza, diagnóstico y exportaciones corresponden al montaje actual. El temporizador se prepara en 60 segundos para estudiar estrella y permite ajustar el retardo.

El tutorial de corriente en serie y la pestaña Fallas preparan el mismo circuito; no vuelven a cargar el manual de tres contactores. La preparación final guarda y comprueba las conexiones y la explicación de KT1/KM1/KM2. Los informes del nuevo recorrido no insertan el esquema SVG del montaje manual anterior. La guía del profesor se conserva como apoyo teórico, sin atribuirle literalmente el montaje recibido.

El progreso nuevo utiliza `modo-meter-two-contactors-v1`; la preparación tiene su propia clave. El contenido anterior de `modo-meter-activity2-v1`, la preparación anterior, los módulos y las lecciones anteriores se conservan. Si había contactores adicionales guardados, quedan fuera de esta vista de medición mientras no estén conectados; no se eliminan del banco almacenado. Deshacer conserva el montaje anterior.

## Archivos

- `src/data/measurementProfiles.ts`: roles, pulsador de marcha y pilotos por montaje.
- `src/data/meterActivity.ts`, `activityTrace.ts`: referencia exacta, pasos y validación de estados/transiciones.
- `src/components/PanelMeterLesson.tsx`, `PanelMachinePreparation.tsx`: entrada, explicaciones, preparación, progreso y resultados.
- `src/components/PanelCurrentTutorial.tsx`, `PanelGuideFaults.tsx`, `PanelMultimeter.tsx`: tutorial, fallas e instrumentos con el mismo perfil.
- `src/components/App.tsx`, `Board.tsx`: preparación sin añadir KM3 y exclusión visual reversible de contactores adicionales sin conexiones.
- `src/data/machineReport.ts`: informes contextualizados al montaje de dos contactores.

## Comprobaciones

- `npm install --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm run build`: correctos.
- `qa/verify-two-contactor-measurements.mjs`: 37 pares exactos, 20 de mando, 34 pasos, 15 mediciones de tablas, S3/retención/temporización/TEST/RESET, pilotos y persistencia.
- `qa/verify-two-contactor-measurements-ui.cjs`: recorrido completo real en Chromium escritorio, preparación, esquema guardado, rechazo de muestras sin captura, transcripción exacta, prueba de TEST desde triángulo, cierre y CSV/JSON/HTML. Verifica conservación de progreso anterior y del KM3 guardado. Incluye entrada inicial en móvil.
- `qa/verify-two-contactor-measurements-touch.cjs`: Chromium 820 px y WebKit 390 px; retomar la medición, 37 cables sin KM3, S3 marcha, pinza con corriente, cambio automático, conservación de una captura de estrella y diagnóstico de retención de KT1 sobre el mismo montaje.
- `qa/verify-two-contactor-lesson.mjs`: referencia original, hash, 37 pares y lección existente conservados.
- `qa/verify-machines-guide-complete.mjs`: modelo y documentos del recorrido manual anterior conservados.

Resultados y capturas en `qa/two-contactor-measurements/`: `maquinas-movil.png`, `esquema-escritorio.png`, `maquinas-resultados.png`, `chromium-820-sample.png`, `webkit-390-sample.png` y los informes JSON. La comparación histórica del recorrido anterior se conserva en `qa/machines-guide-complete/`.

Las comprobaciones móviles/tablet son emuladas. Se mantiene el carácter didáctico del modelo; no se afirma una calibración física.
