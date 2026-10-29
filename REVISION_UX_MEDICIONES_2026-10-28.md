# Ajuste de uso — Aprender a medir — 28 de octubre de 2026

La revisión visual confirmó duplicación de instrucciones, teoría y diagramas antes de la tarea, pestañas con nombres partidos, y acciones de captura y registro con poco contraste entre sí.

Cambios:
- Una indicación «Ahora» con el siguiente movimiento. Se retiró el indicador de tres etapas que repetía las secciones numeradas.
- Teoría y pregunta dentro de «Entender esta medición»; diagramas y condiciones del mando se despliegan a petición.
- Pestañas sin partir palabras, anchos y espacios equilibrados y cabecera más breve.
- Se mantienen a la vista los bornes, la función del multímetro y los controles necesarios del banco.
- La información técnica de protección se despliega. Los avisos de protección siguen visibles.
- La confirmación del número aparece después de capturar. La muestra conservada se distingue de la lectura en vivo.
- Capturar destaca primero; después destaca Registrar y seguir. Se mantiene la validación y la posibilidad de repetir la captura.

Verificación: check y build correctos; 34/34 pasos completos en Chromium 1440 y 390, sin errores de página, incluidas las exportaciones y el desmontaje. Paso 5 comprobado con ayudas cerradas, sin desborde horizontal y con contraste del botón principal después de la transición visual. Revisión visual de capturas en escritorio y móvil emulado; sin prueba en dispositivo físico. Cambios locales, sin publicación.

Archivos: src/components/PanelMeterLesson.tsx, src/components/PanelMeasurementCoach.tsx, src/styles/measurement-focus.css. Pruebas ajustadas: qa/verify-two-contactor-measurements-ui.cjs y qa/verify-measurement-step5.cjs.

Capturas anteriores: qa/measurement-ux/antes-escritorio.png y antes-movil.png.
Capturas nuevas: qa/two-contactor-measurements/montaje-completo-inicial.png, qa/two-contactor-measurements/full-390/montaje-completo-inicial.png, qa/measurement-ux/paso5-390.png y captura-390.png.

## Ampliación a todo el menú

El ajuste se aplicó a todo Aprender a medir:
- Inicio: presentación breve y tres acciones; contexto del montaje desplegable.
- Lecciones de continuidad, resistencia y tensión: misma jerarquía de tarea, conexión y captura.
- Pinza: una instrucción y elección de fase; ayuda visual opcional y lectura centralizada en el área de captura.
- Banco: controles necesarios visibles, opciones técnicas agrupadas; avisos de protección visibles.
- Resultados: avance sobre 15 mediciones y tablas desplegables por grupo, con descargas accesibles.
- Referencia: temas desplegables, títulos breves y acceso a la preparación debajo de la navegación.
- Fallas: selección de casos, caso activo, cambio de caso, controles desplegables, pista y una acción principal de comprobación. Se corrigió además una mención de S3 en el caso de retención para que diga S1.
- Preparación: alineación de sus tres pestañas y espaciado uniforme de campos.

Verificación final: check/build correctos; recorrido de 34 pasos completo en escritorio 1440 y móvil emulado 390, con exportaciones. Pruebas de captura, pinza y fallo de retención correctas en Chromium 820 y WebKit 390. Navegación de siete vistas en ambas anchuras sin errores ni desborde horizontal. Tablas y temas de ayuda abiertos con teclado; elección/cambio de caso comprobados.

Capturas comparativas de las siete vistas: qa/measurement-menu/before y qa/measurement-menu/after. Script de revisión: qa/verify-measurement-menu.cjs.

Los cambios siguen siendo locales; no están publicados ni se probaron en dispositivos físicos.
