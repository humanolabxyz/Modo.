# Laboratorio: manipulación manual y multímetro compartido

Cambios locales del 20 de octubre de 2026 sobre el proyecto existente.

## Qué cambió

- Temperatura y detectores reutilizan `MeterDevice` de protoboard: misma carcasa, selector, HOLD, REC y tabla. Se retiraron los dos dibujos independientes. Un adaptador conserva los cálculos propios de cada banco; temperatura incorpora la posición mV del selector.
- Puntas roja y negra arrastrables a los bornes, con ajuste al terminal y desconexión al soltarlas fuera. Se conservan las herramientas por toque y la alternativa de teclado.
- Temperatura: insertar/retirar Pt100 y termocupla con el control de la sonda (clic, teclado o arrastre vertical), cambiar consigna con los botones del horno, operar la fuente y conectar/retirar el par de hilos de la termocupla sobre el transmisor.
- Detectores: arrastrar entre dos bornes para poner/quitar cables, mover el objeto por arrastre o flechas, cambiar material sobre el banco y operar la fuente.
- Protoboard: botón «Soldadura y conectividad». Preparar extremos, unir, apoyar el cautín, aportar estaño, retirar calor, enfriar, aislar y comprobar con el mismo multímetro. El banco original queda oculto e inerte mientras se abre el taller.
- Se rechaza aportar estaño sin calentar: el estado de unión fría exige rehacer la práctica. Una unión mecánica también conduce; medir continuidad no certifica calidad de soldadura.

## Archivos

`src/lab/MeterInstrument.tsx`, `ManualBench.tsx`, `CableBench.tsx`, `BreadboardView.tsx`, `TemperatureView.tsx`, `DetectorsView.tsx`, `temperature/BenchScene.tsx`, `detectors/BenchScene.tsx`, `src/styles/manual-bench.css` y `qa/verify-manual-bench.cjs`.

No se alteró el inventario ni el solver de protoboard, temperatura o detectores. Los cambios anteriores del checkout se conservaron.

## Verificación

- `npm install`: dependencias al día, sin vulnerabilidades reportadas.
- `npm run check` y `npm run build`.
- `npm run verify:temperature`: 37/37.
- `npm run verify:detectors`: 44/44.
- `npm run verify:lab`: 38/38, incluye protoboard, multímetro y cables.
- `npm run verify:data`: pasa con el inventario actual del proyecto (6 módulos, 94 IDs activos y 16 IDs de temporizadores retirados explícitamente antes de este trabajo).
- `node qa/verify-manual-bench.cjs`: interacción en Chromium, lectura de Pt100 por arrastre, conservación al recargar, cableado y detección con lectura de 24 V, soldadura fría y secuencia completa correcta, regreso a protoboard; capturas de 1600×1000, 1024×768 y 390×844. Sin errores de página y sin desborde horizontal del documento. Resultados en `qa/laboratorio-manual/results.json`.

## Comparación visual

Las capturas anteriores son evidencia histórica; sus montajes y tamaños pueden diferir. No son una comparación de píxeles en iguales condiciones.

| Banco | Antes | Ahora |
| --- | --- | --- |
| Temperatura | [Captura anterior](qa/temperatura/banco-inicial-desktop.png) | [Instrumento compartido y medición](qa/laboratorio-manual/temperatura-medicion.png) |
| Detectores | [Captura anterior](qa/detectores/banco-inicial-desktop.png) | [Banco manual](qa/laboratorio-manual/sensores-desktop.png) |
| Soldadura | No existía | [Unión completa](qa/laboratorio-manual/soldadura-completa.png) |

Capturas móviles y tablet en la misma carpeta. En teléfono, el banco de soldadura se recorre horizontalmente para alcanzar el multímetro; la página mantiene su ancho.

## Alcance y límites

El taller de soldadura es cualitativo, con calor y tiempo acelerados y resistencias ilustrativas. No simula metalurgia ni garantiza una soldadura real. Su estado es temporal: al salir se reinicia; no modifica automáticamente los cables del proyecto de protoboard.

Los ajustes de modelo, tipo de sonda y fichas siguen en el inspector. La conexión del transmisor térmico opera el par completo; aún no existe cableado individual de cada hilo de entrada o alimentación. Las fotos aportadas orientan pozo seco, sondas, multímetro y pinzas; no se dedujo de ellas una identidad de sonda, pinout o correspondencia interna.

Las comprobaciones móviles son emulación de navegador y revisión de capturas; queda la aceptación del usuario y el ensayo en dispositivo físico. Todo quedó local, sin publicación.
