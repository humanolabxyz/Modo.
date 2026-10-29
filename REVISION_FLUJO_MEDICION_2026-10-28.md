# Flujo de medición y bornes — 28 de octubre de 2026

Aplicado a todos los pasos de medición de Aprender a medir: continuidad, resistencia, voltaje y pinza.

- Una acción principal por etapa: Tomar lectura actual, luego Registrar y seguir. Registrar no aparece antes de capturar.
- El registro usa directamente la lectura capturada y sus condiciones; se retiró la transcripción/confirmación redundante del número.
- Paso, tarjetas de bornes, lectura y acción permanecen visibles. Solo los ajustes desplazables usan scroll.
- Se muestran la referencia y el módulo: 95/96, S2 · 1 / S2 · 2, 63/64, F/N y los extremos U/V/W del motor, según el paso.
- Cada tarjeta localiza su borne. Mostrar bornes resalta ambos con halo verde y pulsación breve; con movimiento reducido el halo queda estático. En móvil se minimiza la guía para descubrir los puntos.
- La pinza identifica el conductor de entrada de la fase solicitada y permite localizarlo.
- Revisar conexiones mantiene disponibles el selector, los bornes, la ayuda y los controles. Cambiar conexiones/función invalida la captura anterior como antes.
- Ventana más compacta en medición; se conserva la opción de minimizar y ampliar.

Verificación local: npm install sin vulnerabilidades reportadas; check y build correctos. Recorrido de 34 pasos completo en Chromium escritorio y móvil emulado, incluidos exportaciones, comparación, TEST/RESET y desmontaje. Se comprueban las tarjetas en cada paso de multímetro y el conductor en cada paso de pinza. Captura conservada al cambiar de estrella a triángulo y práctica de retención en Chromium 820 y WebKit 390 correctas.

Prueba enfocada: 320 × 568, 390 × 844 y 1440 × 1000; paso/lectura/acción dentro de ventana, número sin transcripción, localización individual y conjunta con halo y registro exacto. No hay validación en dispositivos físicos ni publicación.

Archivos: src/components/PanelMeterLesson.tsx, src/components/Board.tsx y src/styles/measurement-focus.css. Pruebas: qa/verify-two-contactor-measurements-ui.cjs, qa/verify-two-contactor-measurements-touch.cjs y qa/verify-measurement-step5.cjs.

Evidencia visual: qa/measurement-flow; qa/two-contactor-measurements/full-390/medicion-01-thermal.png, medicion-02-stop.png, medicion-04-contact-ohms.png, medicion-17-star-U.png y medicion-25-delta-V.png. Antes: qa/measurement-ux/antes-movil.png y qa/measurement-ux/midiendo-en-vivo-390.png.

Ajuste final de visibilidad: los bornes quedan en una franja fija independiente del scroll de ajustes, también durante captura. Las etiquetas de botonera usan S2 · 1 / S2 · 2. Los avisos de tensión se muestran una sola vez, con detalle desplegable que no empuja la acción fuera de vista; se conservan avisos distintos de fusible. La prueba comprueba referencias y visibilidad en cada paso del multímetro y verifica también que el botón principal permanezca dentro de la ventana.
