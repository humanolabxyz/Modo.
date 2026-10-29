# Instrumentos visibles y menú de medición

La pizarra muestra siempre tres accesos con texto: **Multímetro**, **Pinza** y **Aprender a medir**. La pinza abre directamente como instrumento sobre la pizarra, sin abrir el tester ni un tutorial. Ambos instrumentos pueden estar abiertos a la vez y ocultarse por separado.

Se retiraron los accesos duplicados que rodeaban el multímetro. Allí queda «Ajustes del banco»; la enseñanza está en el acceso general «Aprender a medir» y la ayuda contextual de la pinza. Seleccionar A~ en el tester mantiene el tutorial de inserción en serie.

El acceso directo cierra el selector de lecciones anterior. En la lección de medición, la preparación de fuerza aparece desde el paso correspondiente y en Referencia, dejando despejado el comienzo por continuidad. Las ventanas respetan el espacio de la barra de instrumentos.

## Archivos

- `src/components/ToolDock.tsx`: barra con nombres visibles y cierre del menú anterior.
- `src/components/App.tsx`, `PanelMultimeter.tsx`: apertura independiente de los instrumentos.
- `src/components/PanelMeterLesson.tsx`: preparación en contexto.
- `src/components/FloatingWindow.tsx`, `src/styles/panel-meter-lesson.css`: espacio reservado para los accesos y estado activo.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- `qa/verify-visible-instruments.cjs`: Chromium 320/820/1440 px y WebKit 390 px; los tres accesos visibles y pulsables, sin estar tapados; pinza independiente, tester ocultable, cierre del menú previo y conservación de la lección; también alturas reducidas de 600 px.
- `qa/verify-measurement-teaching.cjs`: continuidad, lectura en serie, reposición sin alimentación y pinza física sobre un cable de la pizarra, con HOLD, registro y CSV.
- `qa/verify-machines-guide-ui.cjs`: recorrido de 34 pasos y exportaciones.

Capturas antes de abrir instrumentos y con la pinza independiente: `qa/visible-instruments/inicio-390.png`, `qa/visible-instruments/pinza-directa-1440.png` y sus otras resoluciones. Las pruebas móviles son emuladas.

Publicado en https://modo-lab.vercel.app, despliegue `dpl_5hymEviSgNTPLd8nKpKrTUzRNXh6`, READY. La comprobación pública de los tres accesos, la pinza independiente, los menús y los límites de ventanas pasó en las cuatro resoluciones indicadas, sin errores de página.
