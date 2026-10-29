# Opciones plegables y revisión del recorrido

El tester y la pinza conservan sus opciones circulares junto al instrumento. La flecha lleva un rótulo visible «Opciones» al estar plegada y «Plegar» al desplegarse. Escape recoge las opciones y restaura el foco. Los controles ocultos quedan fuera de la navegación y de las pulsaciones. El cambio de instrumento permanece visible.

Se corrigieron dos indicaciones del recorrido:

- El tutorial de inserción en serie solo confirma la preparación cuando la rama está abierta, la roja está en A, el selector está en A~ y ambas puntas ocupan el corte. Cambiar a V~ elimina la confirmación; el botón del tutorial vuelve a preparar A~ con el banco desconectado.
- La indicación «Ahora» de la lección reconoce primero una muestra capturada, identifica la retención de pantalla, muestra el estado pendiente del circuito y distingue entre preparación y captura. La pinza deja de pedir que se coloque la mordaza cuando ya se tomó la muestra.

Archivos de aplicación: `src/components/InstrumentOptions.tsx`, `PanelCurrentTutorial.tsx`, `PanelMultimeter.tsx`, `PanelMeasurementCoach.tsx` y `PanelMeterLesson.tsx`.

Verificación local terminada:

- `npm install`, `npm run check`, `npm run build`: correctos.
- `qa/verify-visible-instruments.cjs`: plegado y opciones en tester/pinza, cinco círculos laterales, desplazamiento con el instrumento, acceso a lección, libreta y ajustes; Chromium 320/820/1440 y WebKit 390.
- `qa/verify-measurement-teaching.cjs`: continuidad, interpretación de OL, captura y registro, reapertura en el mismo paso, apertura de rama, rechazo de confirmación al seleccionar V~, corriente en serie y reposición desconectada; Chromium escritorio, WebKit móvil y pinza en tablet con arrastre táctil, HOLD y CSV.
- `qa/verify-machines-guide-ui.cjs`: recorrido de 34 pasos, 15 mediciones tabuladas, 21 capturas con condiciones, ocho comprobaciones de acciones, esquema SVG, comparación y exportaciones CSV/JSON/HTML. Rechazo de captura ausente, transcripción distinta y TEST desde un estado que no corresponde. Sin errores de página.

Capturas de opciones plegadas y abiertas: `qa/visible-instruments/plegado-tester-390.png` y `detalle-tester-390.png`; capturas del recorrido: `qa/measurement-teaching/` y `qa/machines-guide-complete/`.

Publicado en https://modo-lab.vercel.app, despliegue `dpl_BAFBmJKTGMVRBgYcTr2ffyz7f4sR`, READY. Verificación pública de instrumentos y tutorial terminada: plegado y acceso a acciones en 320/390/820/1440; enseñanza en Chromium escritorio y WebKit móvil; pinza, HOLD, arrastre táctil y CSV en tablet. Sin errores de página.

Las pruebas móviles y de tablet son emuladas. Los valores y circuitos corresponden al modelo didáctico, sin calibración de equipo físico ni validación de toda configuración libre de cableado.
