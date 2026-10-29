# Rendimiento de instrumentos y seguimiento del panel

Cambios locales sobre el estado actual 2.4.1, incluyendo las lecciones y los controles del 27 de octubre. Sin publicación.

## Cambios

- `src/lab/MeterInstrument.tsx`: se sustituye la interpolación numérica de 1,1 segundos y sus actualizaciones React en cada fotograma por la lectura muestreada real. Se conserva una transición visual breve de los dígitos, de 100 ms, en `src/styles/laboratory-canvas.css`, respetando movimiento reducido. Las cuerdas dejan de simular oscilaciones residuales después de 1,8 segundos sin mover sus extremos y despiertan al cambiar la geometría.
- `src/components/PanelMultimeter.tsx`: el muestreo deja de renovar estado cuando no cambió la muestra; el indicador de proximidad de las puntas evita actualizaciones idénticas. La búsqueda de cable de la pinza descarta primero conductores alejados y utiliza búsqueda gruesa con refinamiento. Se conserva el muestreo de 200 ms y la captura conjunta del valor y sus condiciones.
- `src/components/PanelClampInstrument.tsx`: el arrastre utiliza una traslación visual transitoria y guarda la posición al terminar; mover el instrumento no vuelve a resolver el circuito. Los cálculos se memorizan y se omiten con el instrumento oculto, apagado o sin conductor. Una pinza anclada sigue los cambios de `viewBox` antes de pintar, sin esperar al estado React al finalizar el gesto.
- `src/components/PanelMeterLesson.tsx` y `PanelMultimeter.tsx`: el atajo de fase distingue los ramales de alimentación. Cuando existen dos conductores en una fase, selecciona uno con corriente calculada; con el banco desconectado utiliza la entrada del conjunto principal de la lección. La pantalla sigue midiendo exclusivamente el conductor seleccionado.

No se alteran ecuaciones eléctricas, protección térmica ni la frecuencia del motor de simulación. Se mantienen HOLD, captura, registros y exportaciones.

## Medición comparativa

`qa/perf-meter-tablet.cjs`: Chromium, CPU limitada a 4 veces, escala de dispositivo 2, tacto emulado, 35 cables, ventanas aproximadas de dos segundos. Resultados en `qa/meter-performance/before.json` y `after.json`.

| Tablet 820 × 1180 | Antes | Después |
| --- | ---: | ---: |
| Tiempo de tareas, instrumento abierto en reposo | 1.015 ms | 590 ms |
| JavaScript al arrastrar la punta | 490 ms | 186 ms |
| Tiempo de tareas al arrastrar la pinza | 1.850 ms | 397 ms |
| JavaScript al arrastrar la pinza | 1.378 ms | 49 ms |
| Intervalo entre cuadros P95 al arrastrar la pinza | 33,3 ms | 16,7 ms |

En 390 px, el tiempo de tareas al arrastrar la pinza pasó de 1.823 a 418 ms. Son muestras locales de diagnóstico, no un estudio estadístico ni una garantía de FPS en dispositivos físicos. No se usó una tablet física.

## Verificación

- `npm install --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm run build`: correctos. Las dependencias declaradas resuelven; no se añadió ninguna biblioteca.
- `qa/verify-meter-gesture-anchor.cjs`: Chromium y WebKit a 820 px; 12 cambios sucesivos de posición y escala del `viewBox`, sin esperar una confirmación React. Separación máxima mordaza/cable inferior a 0,02 px. Evidencia en `qa/meter-performance/anchors.json` y capturas `anchor-*.png`.
- `PANEL_QA_QUICK=1 node qa/verify-tablet-meter-dynamic.cjs`: Chromium 768 × 1024, desplazamiento táctil nativo emulado, captura de arranque, conservación de la muestra, reprogramación del temporizador, transición a triángulo, respuesta a carga, desaceleración y acciones con altura reducida. Se corrigió la comparación de carga del test para comparar dos cargas en triángulo, en lugar de comparar un arranque en estrella con otro ramal en triángulo.
- `qa/verify-measurement-teaching.cjs`: recorrido desde el multímetro, continuidad, preguntas y reapertura de la lección en Chromium escritorio y WebKit móvil; inserción en serie y reposición desconectada; pinza en tablet emulada, lectura dinámica, HOLD, tamaño, selección de cable por mordaza, registros y CSV.

La prueba histórica `qa/verify-meter-parity-2.2.8.cjs` llega a las interacciones iniciales, pero luego espera «Anotar medida» sin desplegar las opciones actuales del instrumento y termina por timeout. No se utiliza como evidencia de recorrido completo; el recorrido actual se comprueba con la prueba de enseñanza anterior.

Capturas comparativas y resultados: `qa/meter-performance/`. La fluidez en marcha con grandes cantidades de cables y el comportamiento de una tablet física requieren medición adicional; esta entrega no afirma que toda la aplicación haya quedado libre de retrasos.
