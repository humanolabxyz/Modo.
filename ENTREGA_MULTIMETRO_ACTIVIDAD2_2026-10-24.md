# Lección del multímetro · Actividad 2 Unidad 2

Implementación local, 24-10-2026. Acceso: botón «Medir» junto a Banco y Diagrama. También está al inicio de «Guía paso a paso → Aprender a medir».

## Referencia principal

La guía del profesor Juan Carlos Toro Cornejo, ARCM02, Unidad 2, Otoño 2025, es la autoridad del recorrido. Se revisaron sus 13 páginas, incluidos los diagramas de mando y fuerza y las tablas de las páginas 8–10. La lección muestra la página y el punto correspondientes en cada paso.

El circuito manual es la opción principal: KM1 principal, KM3 estrella y KM2 triángulo. SB1 del profesor corresponde a S2 del banco; SB2 a S1; SB3 a S3. El modelo de mando del banco utiliza 24 V~, diferencia indicada respecto de la alimentación monofásica de la guía.

Matías queda en un apartado opcional. Su archivo contiene exactamente 45 cables y un historial con cero pasos anteriores. No contiene puntas de multímetro ni mediciones guardadas. Es un arranque automático: KT1 principal, KM1 estrella y KM2 triángulo. Sus cables, IDs, colores y recorridos se conservan; no se presenta como el esquema manual del profesor.

Los originales suministrados se conservan sin cambios. Sus copias locales en `public/activities/` tienen SHA-256 idéntico; ver `qa/multimeter-activity/source-manifest.json`.

## Recorrido de 33 pasos

Se descomponen las mediciones en pasos individuales y se incluyen dos ejercicios adicionales de preparación claramente identificados.

| Referencia de la guía | Lección |
|---|---|
| Pág. 4, punto 4 | Continuidad en térmico y paro; reconocimiento de un NA libre. |
| Preparación adicional | Ω de un contacto cerrado; no es una tabla exigida por el profesor. |
| Pág. 5, punto 5 | Voltaje AC del mando F–N, equivalente virtual de 24 V. |
| Págs. 6–7, puntos 6–10 | Mando sin fuerza: piloto rojo, estrella, triángulo, TEST y RESET. Se comprueban bobinas y señales. |
| Pág. 8, punto 11 | Desconexión, apertura de interruptores y continuidad del cable de fuerza. |
| Pág. 8, punto 12 | R–S, R–T y S–T; Tabla 1. |
| Pág. 8, punto 13 | Habilitar mando después de fuerza y comprobar reposo. |
| Págs. 8–9, puntos 14–16 | Arranque en estrella, U1–U2/V1–V2/W1–W2 y corrientes de entrada R/S/T; Tablas 3 y 4. |
| Págs. 9–10, puntos 17–19 | Cambio manual a triángulo, mismos devanados y fases; Tablas 5 y 6. |
| Págs. 10–11, punto 20 | Comparación escrita usando las tablas y las relaciones matemáticas del equivalente equilibrado. |
| Págs. 11–12, puntos 21–25 | Nueva prueba TEST, RESET y cierre del banco virtual. |

La pinza virtual mide una sola fase de entrada antes de las bifurcaciones. Suma corrientes complejas de sus ramas antes de calcular la magnitud RMS. No se sustituye la pinza por un multímetro conectado entre fases en A.

## Forma de aprender

- Una tarea a la vez: explicación, estado del banco, colocación de puntas y anotación de la lectura.
- «Dónde poner las puntas» identifica roja/negra con módulo y número y enfoca ambos bornes. No coloca las puntas automáticamente.
- Se utilizan el instrumento, selector, jacks y cables existentes. Se pueden arrastrar las puntas o moverlas con flechas.
- Antes de registrar se comprueban el montaje, los puntos elegidos, la función, el jack, el estado eléctrico y la ausencia de HOLD/REL/MIN/MAX. V~ y Ω aceptan los extremos intercambiados.
- Se rechazan anotaciones distintas de la lectura y la pinza sobre una fase equivocada. OL se registra como circuito abierto.
- Las cinco tablas contienen quince mediciones que el alumno registra; no se rellenan por adelantado.
- Se guarda el progreso y la comparación en el navegador. Se pueden descargar informe JSON y tablas CSV. La explicación escrita queda para revisión; no se califica semánticamente de forma automática.
- Ocultar y reabrir la guía conserva el paso y las puntas. En móvil la ventana es más corta y el enfoque reserva espacio para el multímetro.
- Preparar la actividad es reversible con Deshacer: se verificó recuperar el cableado anterior.

## Límites de las lecturas

Los valores de corriente proceden de equivalentes resistivos ajustables; no son corriente real de arranque ni datos de placa de un motor. Por defecto se usan 380 V entre fases y 100 Ω por devanado, dando aproximadamente 219,4 V por bobina en estrella y 380 V en triángulo. Estos valores se presentan como modelo virtual.

Ω no inventa resistencias de bobinas o pilotos que las fuentes no documentan: conserva la respuesta «SIN DATOS». La práctica adicional mide un contacto con resistencias didácticas de puntas/cables/contacto ya existentes en el multímetro.

La lección no certifica la compatibilidad de la placa de un motor ni la puesta en servicio de un equipo físico. Las pruebas móviles son emuladas; no se afirma aceptación en un teléfono físico.

## Archivos

- `src/data/meterActivity.ts`: pasos, relación con la guía, montajes, comprobación y progreso.
- `src/data/activity2Matias.json`: cables del proyecto aportado, sin alteraciones.
- `src/data/panelElectrical.ts`: corriente de entrada de las tres fases para la pinza virtual.
- `src/components/PanelMeterLesson.tsx` y `src/styles/panel-meter-lesson.css`: lección, tablas y descarga.
- `src/components/PanelMultimeter.tsx`: conexión con el instrumento existente y reapertura del paso.
- `src/components/App.tsx`: preparación reversible, KM3 y enfoque de bornes fuera de las ventanas móviles.
- `src/components/ToolDock.tsx`: acceso desde el menú de lecciones.
- `public/activities/actividad-2-unidad-2.pdf` y `public/activities/proyecto-matias.json`: copias íntegras de las fuentes.

## Verificación de la implementación inicial

Correctos:

- `npm install --no-audit --no-fund`
- `npm run check`
- `npm run build`
- `node qa/verify-meter-activity.mjs`
- `node qa/verify-meter-activity-ui.cjs`
- `node qa/verify-meter-activity-drag.cjs`
- `node qa/verify-meter-activity-export.cjs`
- `node qa/verify-panel-fixes.mjs`

La prueba de modelo recorre los 33 pasos en ambos montajes, verifica que todas las puntas existen, conserva los 45 cables de Matías, comprueba fases/estados/modos/jacks, evita lecturas de resistencia energizadas y mantiene «SIN DATOS» en bobinas. Conserva las mediciones previas si el recorrido añade comprobaciones pendientes del profesor.

La prueba de interfaz completa 33 pasos en Chromium desktop para la guía y la variante opcional y 33 en móvil emulado para la guía. WebKit móvil emulado completa los primeros 12 pasos, incluidos los estados del mando. Se comprueban registro, tablas, descarga JSON, persistencia y Deshacer. Sin errores de página.

La prueba de arrastre coloca ambas puntas en 95–96 con mouse en Chromium desktop y WebKit móvil, y mediante eventos táctiles emulados en Chromium móvil. Se obtiene 0,4 Ω y se conserva el paso al reabrir la guía.

La prueba de exportación usa un fixture claramente separado: verifica cabecera y quince filas de las cinco tablas en CSV, y que JSON no declare completada una práctica incompleta. PDF y JSON fuente responden 200 en local.

Resultados y capturas: `qa/multimeter-activity/`. Destacan `model-results.json`, `ui-results.json`, `drag-results.json`, `export-results.json`, `*-manual-probes.png`, `*-manual-star-clamp.png`, `*-manual-delta-clamp.png`, `*-complete.png` y `*-drag-*.png`.

No se desplegó ni se modificaron los archivos originales de Descargas.

## Ajuste de interfaz y ventana móvil — 24-10-2026

- Acceso directo Medir y entrada destacada en Guía paso a paso.
- Lección, Resultados y Referencia en pestañas; una tarea visible con selector, bornes rojo/negro y registro de lectura.
- La lección reutiliza FloatingWindow: arrastre por cabecera, ajuste por bordes y esquina, maximizar/restaurar, restablecer y cerrar. Conserva posición y tamaño con el mecanismo existente. Incluye minimizar/ampliar sin perder el paso.
- Se retira la tarjeta anclada de la propuesta intermedia; se conserva el comportamiento de los demás menús. No se modifica FloatingWindow ni el modelo eléctrico en este ajuste.
- Mientras la lección está abierta, el instrumento conserva sus controles físicos y oculta la libreta y acciones duplicadas.

Verificación de esta revisión: `npm run check`, `npm run build` y recorrido de interfaz en el navegador integrado. Arrastre confirmado de x≈8 a x≈128; ajuste de ancho de 360 a 472 px; maximizar/restaurar y minimizar/ampliar comprobados. El minimizado móvil recupera el cuerpo del paso al ampliar. Se revisaron las pestañas, el primer paso, selector y localización de bornes en vista estrecha y de escritorio. No se repitió el recorrido de 33 pasos de la implementación inicial con estos selectores nuevos. Las pruebas anteriores de interfaz necesitan actualizar sus selectores para reutilizarse. No se probó un dispositivo físico.

Capturas actuales: `qa/meter-lesson-interface/desktop-movable.png` y `qa/meter-lesson-interface/mobile-movable.png`. La carpeta `before/` conserva las capturas y fuentes anteriores a la reorganización.
