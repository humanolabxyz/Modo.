# Cables, rendimiento y variantes de estrella-triángulo

Actualización posterior: el archivo de dos contactores fue recibido e incorporado; el borrado completo pasó al desplegable de la goma según la indicación del usuario. Véase `LECCION_DOS_CONTACTORES_2026-10-27.md` para el estado final.

Cambios locales del 27 de octubre de 2026. No se publicaron.

## Borrado de cables

- Botón visible «Borrar cables» sobre el banco, separado de la barra inferior para que quepa en móvil y tablet.
- Retira todos los cables en una sola operación del historial. Deshacer recupera el montaje completo; Rehacer vuelve a retirarlo.
- Cancela el cable pendiente y limpia selección, inspector y avisos de comprobación. Conserva los módulos, el diagrama y los pasos de la lección.
- Está deshabilitado cuando no hay cables. La práctica vacía persiste al recargar.
- Archivos: `src/components/App.tsx`, `src/components/ToolDock.tsx`, `src/styles/global.css`.

## Rendimiento

El ciclo de simulación recalculaba el circuito cada 40 ms y publicaba estado aproximadamente cada 100 ms incluso con el banco desenchufado, frío y detenido. Ahora reutiliza el resultado en ese reposo, invalidándolo al cambiar cableado, entrada, perfil, alimentación efectiva o puente del amperímetro. El reloj interno sigue avanzando. No se omite el cálculo mientras haya giro, temperatura residual, temporizadores o maniobras de contactos pendientes.

La hélice deja de mantener un bucle de animación cuando el motor está detenido, la práctica está suspendida o se solicita movimiento reducido.

Con 35 cables y viewport de tablet 820 × 1180, el contador de renderizados de App pasó de 17 a 0 durante una ventana de dos segundos en reposo. El resultado posterior fue 0 también en Chromium y WebKit, con vistas de 390, 820 y 1440 px. Esta medición describe actualizaciones de React en reposo, no FPS, consumo de batería ni garantía de rendimiento en una tablet física. No se afirma que el renderizado con muchos cables y motor en marcha esté completamente resuelto.

Archivos: `src/hooks/useSimulation.ts`, `src/components/Board.tsx`.

## Lecciones y fuente

Se revisaron visualmente las páginas 5 y 6 de `public/activities/actividad-2-unidad-2.pdf`: la figura 1 muestra mando manual con KM1, KM2 y KM3; la figura 2 muestra KM1 de línea, KM2 de triángulo y KM3 de estrella. Esa copia de la Actividad 2 no documenta una partida temporizada de dos contactores.

Las lecciones existentes se identifican expresamente con «3 contactores» en su título, conservando sus IDs y conexiones. La lección manual sigue correspondiendo a la guía y la temporizada conserva su circuito original.

Existe un ejemplo virtual de dos contactores más conjunto temporizado (`SIMULATION_EXAMPLES.starDelta`). Ese conjunto tiene polos de potencia en el modelo y no equivale a afirmar que bastan dos contactores y un temporizador independiente sin polos. No se convierte en una lección atribuida al usuario sin contrastar su archivo.

Pendiente: recibir el archivo anunciado de dos contactores; contrastar mando, fuerza, retención, contactos temporizados, enclavamientos y secuencia; añadir una lección independiente con esquema y pasos verificables, conservando la de tres contactores.

## Verificación

- `npm install --ignore-scripts --no-audit --no-fund`: correcto, dependencias al día.
- `npm run check` y `npm run build`: correctos.
- `qa/verify-cable-reset-tablet.cjs`: borrado con cable pendiente, deshacer/rehacer, persistencia y reposo en Chromium/WebKit a 390, 820 y 1440 px.
- `qa/verify-cable-performance-ui.cjs`: correcto en Chromium y WebKit; movimiento de módulos conserva cables, reposo de cuerdas, cancelación, temporización 6 → 2 s y protección entre fases.
- `qa/verify-star-lessons.mjs`: correctos los 46 pares manuales y los 42 temporizados, secuencias y conservación de fuentes.
- `qa/verify-panel-dynamic.mjs` y `qa/verify-panel-automatic.mjs`: correctos los modelos eléctricos, dinámica, temporización, transición y memoria térmica.
- `qa/verify-panel-automatic-ui.cjs`: correctos suspensión/reanudación, disparo por carga sostenida, bloqueo de RESET caliente y fallo de fase en vistas móvil/escritorio.
- Capturas antes/después y mediciones: `qa/cable-reset-tablet/`; esquemas revisados: `qa/guia2-mando-review.png` y `qa/guia2-fuerza-review.png`.

Las capturas finales de móvil y tablet se inspeccionaron visualmente. No se ensayó un dispositivo físico.
