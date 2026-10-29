# Precisión del recorrido de Máquinas · 27 octubre 2026

Se conserva la guía manual de 34 pasos y sus 15 mediciones en las tablas 1, 3, 4, 5 y 6. Se conserva la variante automática opcional de Matías y el inicio explícito del montaje.

## Cambios

- Las ocho comprobaciones de marcha, cambio de conexión, TEST y RESET exigen una transición realizada durante el paso actual. Coincidir con el estado final no basta. Se comprueban alimentación, etapa mando/fuerza y pulsadores liberados.
- TEST desde reposo no acredita la prueba desde triángulo; un disparo automático no sustituye el botón TEST. RESET exige bobinas desactivadas y no debe dar marcha.
- El temporizador registra su transición real estrella → triángulo. Las acciones de un paso anterior no acreditan el siguiente.
- Se comprueba el estado completo de los cuatro pilotos y se mantienen mando/fuerza alimentados al comprobar TEST/RESET.
- Cada lectura requiere pulsar «Tomar lectura actual». Se conserva la pantalla capturada y se exige transcribir sus dígitos exactos, admitiendo coma/punto y ceros finales. Se respeta la escala de unidad mostrada y OL.
- La muestra guarda fecha, instante de simulación, rpm, carga, modelo, red configurada, frecuencia, Ir, perfil y conexión. La pantalla y sus condiciones se muestrean juntas; no se captura una lectura rezagada de otra configuración eléctrica.
- Un cambio posterior de velocidad o conexión no reemplaza la muestra. Cambiar puntas, función, conductor de pinza, cableado o perfil invalida la captura.
- JSON conserva condiciones y pruebas de maniobra; CSV incorpora condiciones por medición; HTML imprimible incorpora condiciones y transiciones. Los registros antiguos se mantienen y no reciben trazas inventadas.

## Archivos principales

`src/data/activityTrace.ts`, `src/hooks/useSimulation.ts`, `src/data/meterActivity.ts`, `src/components/PanelMultimeter.tsx`, `src/components/PanelMeterLesson.tsx`, `src/data/machineReport.ts`.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- `qa/verify-activity-precision.mjs`: ambos perfiles y etapas; estados finales sin acción, orden incorrecto, falta de alimentación, pulsadores sostenidos, TEST/RESET inválidos, transcripción, escalas y persistencia.
- `qa/verify-machines-guide-ui.cjs`: recorrido completo y pruebas negativas; ocho maniobras con traza y 21 capturas (15 de tablas más seis comprobaciones de preparación/mando/fuerza), descarga de informes, escritorio y móvil.
- `qa/verify-activity-timer-trace.cjs`: transición real del temporizador persistida en tablet vertical.
- `qa/verify-tablet-meter-dynamic.cjs` con `PANEL_QA_QUICK=1`: tacto nativo Chromium 768 × 1024; desplazamiento, corriente variable, captura conservada después del cambio Y–Δ, carga e inercia.
- `qa/verify-machines-touch.cjs`: Chromium 820 px y WebKit 390 px, pinza, preparación y fallas.
- `qa/verify-panel-probe-navigation.cjs`: teclado rápido y captura invalidada al mover puntas.
- `qa/verify-panel-automatic-ui.cjs`, `qa/verify-panel-automatic.mjs`, `qa/verify-panel-dynamic.mjs`, `qa/verify-machines-guide-complete.mjs`: regresión de suspensión, dinámica, protección y montaje.

Las pruebas móviles son emuladas. La precisión incorporada corresponde a la secuencia y al registro del modelo didáctico. No se dispone de placa ni datos del relé físico para afirmar calibración del banco real; la revisión docente y las comprobaciones físicas se mantienen separadas.

## Publicación

Publicado en https://modo-lab.vercel.app, despliegue `dpl_B5JRQ1ywkj3mopfQEfdYPAE3M3ZJ`, estado READY.

La prueba pública en un navegador nuevo sin sesión de Vercel completó los 34 pasos, las ocho maniobras con traza, las 21 capturas y las descargas CSV/JSON/HTML. Pasaron los intentos negativos de registrar sin muestra, transcribir un valor cercano y TEST desde reposo. También pasaron en producción la transición real del temporizador y la prueba de tablet vertical con tacto nativo emulado y captura conservada tras el cambio estrella → triángulo. No se registraron errores de página.

Evidencia: `qa/machines-guide-complete/recorrido-resultados.json`, `qa/activity-precision/timer-ui.json`, `qa/tablet-meter-fix/ui-results-timer.json`; capturas de escritorio y móvil en los mismos directorios de QA.
