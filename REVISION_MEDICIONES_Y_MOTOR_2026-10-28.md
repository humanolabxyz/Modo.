# Revisión de Aprender a medir — 28 de octubre de 2026

## Cambios

- Al comenzar o continuar la práctica de dos contactores se prepara el montaje completo de 37 cables, incluido el motor y sus seis bornes U1/V1/W1/U2/V2/W2. Antes se preparaba solo mando y se añadía fuerza en el paso 11.
- El banco arranca sin alimentación. Las primeras comprobaciones de mando mantienen FUERZA abierta.
- El paso 11 explica el motor y la fuerza e incluye acceso a placa/protección. Antes de registrar esa comprobación se exige completar placa y protección. Se conserva la recuperación del circuito de fuerza para montajes incompletos.
- Se conserva la corrección del paso 5: explicación de voltios, condiciones del mando y mensaje preciso cuando falta preparar el banco.

## Verificación local

- npm install: correcto, sin vulnerabilidades reportadas.
- npm run check y npm run build: correctos.
- Modelo de dos contactores: 37 cables, 34 pasos y 15 mediciones de tablas, PASS.
- Recorrido completo en Chromium: 34/34 pasos en 1440 × 1000 y 390 × 1000, sin errores de página.
- Se verificaron captura y registro, rechazo de transcripción distinta, S1 de marcha/S2 de paro, transición temporizada estrella–triángulo, TEST/RESET, relaciones calculadas, parada, desmontaje y exportaciones CSV/JSON/HTML.
- Se comprobaron las seis conexiones del motor desde el inicio.
- Chromium 820 y WebKit 390 con tacto emulado: captura de corriente en estrella conservada tras pasar a triángulo, instrumento de pinza y práctica de falla de retención correctos.

## Evidencia

- qa/two-contactor-measurements/recorrido-resultados.json
- qa/two-contactor-measurements/full-390/recorrido-resultados.json
- qa/two-contactor-measurements/touch-results.json
- qa/two-contactor-measurements/montaje-completo-inicial.png
- qa/two-contactor-measurements/full-390/montaje-completo-inicial.png
- qa/step5-before.png (captura anterior: práctica con solo 20 cables de mando)

## Alcance

Verificado con la compilación local en http://127.0.0.1:4330. Las pruebas móviles y tablet son emuladas. No se probaron dispositivos físicos ni se publicó el cambio.

Fuentes editadas: src/components/PanelMeterLesson.tsx y qa/verify-two-contactor-measurements-ui.cjs.
