# Aprender a medir y pinza en la pizarra

## Flujo de la lección

«Multímetro del panel» → «Aprender a medir» → «Comenzar guía del profesor» prepara explícitamente solo el mando y comienza por continuidad, sin desviar al cuestionario de placa. La explicación, la siguiente acción y una pregunta de comprensión están dentro de cada medición.

La preparación de placa/protección se comprueba antes de añadir fuerza. Reabrir «Aprender a medir» regresa a la lección. El progreso guardado identifica el paso al que se continuará. En móvil, «Ver estos bornes» deja una tarjeta compacta con las instrucciones y vuelve a ampliar la medición al conectar ambas puntas.

La lectura mostrada en la lección coincide con la pantalla del multímetro; la captura espera su actualización. Se conservan las comprobaciones de secuencia y los registros con sus condiciones.

## Instrumentos sobre la pizarra

La nueva pinza es un instrumento amarillo movible en la misma superficie del multímetro existente. Tiene mordaza, pantalla, selector OFF/A~, HOLD, selección guiada R/S/T, registro y CSV. Su mordaza se arrastra sobre los cables SVG reales del montaje; las flechas recorren los conductores de entrada. Se mantiene anclada al cable al desplazar o acercar la pizarra.

La corriente de cada conductor se calcula mediante un corte de su conexión ideal y KCL. No se asigna simplemente la corriente total de una fase a cualquier rama. Si hay un camino ideal paralelo que impide determinar el reparto, se muestra «SIN DATO». Al abrazar varios cables se suman sus fasores. La lección captura la misma muestra que muestra la pinza.

El tutorial de serie dibuja el cable antes y después de intercalar el tester. Permite seleccionar un cable de mando, retirarlo con el banco desconectado, señalar sus extremos, colocar las puntas y reponerlo sin alimentación. La selección A~ del tester abre este tutorial. La medición de línea de la guía se realiza con pinza.

Las explicaciones de inserción en serie contrastan la secuencia con el [manual de Fluke 3000 FC](https://assets.fluke.com/manuals/3000fc__umeng0000.pdf). Los parámetros del panel siguen siendo didácticos y no representan una calibración física.

## Archivos principales

- `src/components/PanelMeterLesson.tsx`, `PanelMeasurementCoach.tsx`: enseñanza y entrada a la práctica.
- `src/components/PanelMultimeter.tsx`, `PanelCurrentTutorial.tsx`, `PanelClampInstrument.tsx`: instrumentos, guía de serie y pinza en la pizarra.
- `src/components/App.tsx`: apertura/reposición de rama con el banco desconectado e historial.
- `src/data/panelElectrical.ts`: corriente por conductor real.
- `src/styles/panel-meter-lesson.css`: tarjetas de ayuda e instrumento.

## Comprobaciones

- `npm install`, `npm run check`, `npm run build`.
- `qa/verify-measurement-teaching.cjs`: entrada real desde el multímetro; continuidad y preguntas; reabrir lección; rama abierta, corriente en serie y reposición desconectada; Chromium 1440 px y WebKit 390 px; pinza sobre el cable real en tablet emulada, lectura dinámica, HOLD, OFF/A~, registro, CSV y regreso al paso.
- `qa/verify-clamp-conductors.mjs`: RMS de las tres entradas en Y/Δ, cancelación vectorial, fuerza abierta y camino ideal paralelo.
- `qa/verify-machines-guide-ui.cjs`: los 34 pasos, 15 mediciones de tablas, secuencias, preparación y exportaciones.
- `qa/verify-panel-dynamic.mjs`, `qa/verify-machines-guide-complete.mjs`: regresión eléctrica y de montaje.

Evidencias en `qa/measurement-teaching/` y `qa/machines-guide-complete/`. Las pruebas de móvil/tablet usan emulación; no se afirma una prueba física.

Publicado en https://modo-lab.vercel.app; despliegue `dpl_7wLU9eZWUUmSYngwxUs8Vp5s1Xk5`, READY.

La verificación pública en navegadores nuevos pasó el flujo desde el multímetro en Chromium 1440 px y WebKit 390 px, así como la inserción en serie y la reposición desconectada. En Chromium 820 px se verificó arrastre mediante eventos táctiles CDP de la mordaza hasta el cable S de la pizarra, lectura dinámica, HOLD, OFF/A~ y exportación CSV. La última pasada pública completó los 34 pasos, las 15 mediciones de tablas, las comprobaciones y las exportaciones de la guía. Sin errores de página en estas pruebas.
