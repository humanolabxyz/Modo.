# Práctica de medición con Fluke 87 V y libreta G03

La práctica ahora exige montar el circuito, elegir la función sobre el instrumento, esperar la estabilización, leer y transcribir la medición. Se conservó la app existente y el multímetro sigue siendo un solo componente compartido por protoboard, temperatura, detectores y soldadura.

## Referencias contrastadas

- Guía docente original: `public/estudio/instrumentacion/guia-temperatura-g03.docx`. Leída con la skill de documentos. Experiencia 2: curva TC y RTD a ambiente, 50, 75 y 100 °C. Experiencia 3: salida TC y transmisor a los mismos puntos. La guía propone salida 0–10 V y no impone un rango de entrada del transmisor.
- Fotos adjuntas del usuario: apariencia del Fluke 87 V, pozo seco, sonda y conexiones. No se dedujo de las fotos la calibración ni la resistencia de los cables.
- [Manual oficial Fluke 80 Series V, revisión 3](https://media.fluke.com/72b063d9-22bd-44a7-a91b-b2c100f399c5_original%20file.pdf): entradas (página impresa 2), posiciones del selector (3), botones (4–6) y resolución normal DC/Ω (42).

## Cambios

- Se retiraron los paneles laterales «Multímetro», sus selectores de bornes y la lista de colocación automática de puntas de protoboard. La medición se opera sobre el equipo.
- Cuerpo amarillo y frente oscuro con marca/modelo Fluke 87 V, pantalla, cuatro tomas A / mA μA / COM / V Ω y selector giratorio que admite arrastre, clic y flechas de teclado.
- Puntas arrastrables y conexiones por teclado: al enfocar una punta, las flechas recorren bornes; Supr desconecta. Se conservan los modos R/N más toque del borne.
- HOLD, lectura relativa, mínimo/máximo y luz se manejan sobre la cara del instrumento. «Anotar lectura» y «Libreta» son controles del simulador debajo del equipo, no botones atribuidos al Fluke real.
- La libreta G03 muestra los cuatro puntos con columnas TC / Pt100 o TC / transmisor según la experiencia. El banco libre muestra los tres. Elegir una casilla no configura ni conecta automáticamente el banco.
- Se valida la transcripción contra la lectura visible y su resolución. No se guardan valores inventados, medidas sin conexión válida, sondas fuera del pozo ni registros durante calentamiento. HOLD/REL/MIN/MAX deben soltarse antes de registrar una lectura directa.
- Se registra temperatura efectiva de la sonda, consigna, temperatura del pozo, señal, unidad y origen. CSV incluye los nuevos campos. La comparación con referencias queda después de medir.
- «Anotar lectura» también permite registrar otras consignas en banco libre. Las casillas de la guía conservan sus cuatro puntos requeridos.
- En detectores, «Anotar lectura» también pide transcribir la pantalla antes de guardar. Fuente, cables y posición del objeto deben estar físicamente configurados en el banco.
- El guardado local de temperatura y detectores se vacía al almacenamiento al salir de la página, además del guardado automático habitual; se conservan guardados anteriores compatibles.
- Los textos prácticos de la guía integrada ahora indican acciones sobre sondas, horno, instrumento y libreta; el DOCX docente se conserva.

## Qué representan las lecturas

El solver conserva las leyes de termocupla K/J y Pt100 verificadas contra NIST e IEC 60751. La visualización añade resolución normal de 6000 cuentas: 0,1 mV, 0,1 Ω en el rango de 600 Ω y autorango DC de 6,000 / 60,00 V para esta práctica. No se agrega ruido aleatorio ni se ajustan valores para hacerlos coincidir con una fotografía.

Ejemplo del recorrido probado con referencia ambiente a 22 °C, TC K y transmisor configurado 0–100 °C → 0–10 V:

| Temperatura | TC K | Pt100 | Transmisor |
| --- | --- | --- | --- |
| 22 °C | 0,0 mV | 108,6 Ω | 2,200 V |
| 50 °C | 1,1 mV | 119,4 Ω | 5,000 V |
| 75 °C | 2,2 mV | 129,0 Ω | 7,50 V |
| 100 °C | 3,2 mV | 138,5 Ω | 10,00 V |

Son lecturas simuladas, no mediciones obtenidas de un equipo físico. Las lecturas de clase siguen separadas en «En clase». La reproducción visual no emula todas las funciones/errores del Fluke: no se simulan AC, Hz, capacitancia, rangos manuales, exactitud/calibración individual ni resistencia de las puntas. Las tomas del instrumento conservan el encaminamiento existente de puntas para cada función.

## Archivos y evidencia

`MeterInstrument.tsx`, `ManualBench.tsx`, `TemperatureView.tsx`, `DetectorsView.tsx`, las dos `BenchScene.tsx`, `temperature/{instrument.ts,state.ts,TemperatureNotebook.tsx}`, `learning/temperatureLessons.ts`, `styles/manual-bench.css` y pruebas QA.

- `npm run check`, `npm run build`, `npm run verify:temperature` (38), `npm run verify:lab` (38) y `npm run verify:detectors` (44).
- `node qa/verify-fluke-practice.cjs`: doce lecturas por interacción UI, transcripción, errores, estabilización, giro del selector, recarga, CSV, detector y reutilización en protoboard/soldadura. Resultados en `qa/fluke-practica/results.json`.
- Capturas de escritorio, tablet y móvil en `qa/fluke-practica/`. Son revisión de navegador emulado, no validación en dispositivo físico.

Comparación visual: [antes](qa/laboratorio-manual/temperatura-medicion.png), [Fluke y libreta ahora](qa/fluke-practica/libreta-12-lecturas.png).

Se trabajó solo en local, sin desplegar. Queda la revisión visual del usuario y la comparación con mediciones efectivas del laboratorio real.
