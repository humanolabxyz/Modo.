# Opciones circulares al costado de los instrumentos

La captura anotada del usuario es la referencia de composición. Se eliminó la barra adicional de instrumentos y se colocaron cinco opciones circulares junto al multímetro: Pinza, Aprender a medir, Anotar, Libreta y Ajustes. El primer círculo lleva la etiqueta permanente «Pinza»; las otras opciones tienen iconos, nombres accesibles y ayudas al enfocarlas.

Las opciones acompañan al instrumento cuando se arrastra y se mantienen dentro de su espacio disponible. El multímetro conserva cuerpo, selector, pantalla, puntas y controles de tamaño. Se retiraron los botones largos de Anotar/Libreta y Conexión del panel; las acciones correspondientes quedan junto al instrumento. Otros multímetros del laboratorio conservan sus controles anteriores.

La pinza usa la misma disposición lateral, con regreso al tester, ayuda, registro, libreta y ajustes. Al cambiar entre tester y pinza se conserva el montaje. No se modificó el cálculo eléctrico ni la secuencia de la guía.

## Archivos

`src/components/InstrumentOptions.tsx`, `PanelMultimeter.tsx`, `PanelClampInstrument.tsx`, `ToolDock.tsx`, `App.tsx`, `FloatingWindow.tsx`, `src/lab/MeterInstrument.tsx`, `src/styles/panel-meter.css` y `panel-meter-lesson.css`.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- `qa/verify-visible-instruments.cjs`: Chromium 320/820/1440 y WebKit 390; cinco botones circulares al costado, alcanzables en pantalla, desplazamiento con el instrumento, cambio de tester/pinza, acceso a lección, libreta y ajustes; ausencia de la fila adicional.
- `qa/verify-measurement-teaching.cjs`: continuidad, medición en serie, pinza sobre cable real, HOLD y CSV.
- `qa/verify-machines-guide-ui.cjs`: recorrido de la guía y sus registros.

Capturas: `qa/visible-instruments/circulos-tester-390.png` y otras resoluciones, además de `circulos-pinza-*`. Las pruebas de dispositivos móviles son emuladas.

Publicado en https://modo-lab.vercel.app, despliegue `dpl_8zebekjzfbNcxfhHVKw4Qg2ajosS`, READY. La comprobación pública pasó en las cuatro resoluciones: los cinco círculos están al costado, acompañan al instrumento y permiten cambiar entre tester/pinza, abrir la lección, libreta y ajustes. Sin errores de página. El recorrido completo de 34 pasos y la práctica de instrumentos también pasaron localmente.
