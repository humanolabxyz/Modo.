# Corrección de los fallos reportados del panel — 23 de octubre de 2026

Implementado y probado en el proyecto local. No se publicó ni se modificaron repositorios remotos. Se conservaron los cambios que ya existían en la carpeta de trabajo.

## Fallos y correcciones

| Reporte | Causa encontrada | Resultado |
| --- | --- | --- |
| El tester muestra `SIN REFERENCIA` entre fases | El adaptador anterior rechazaba explícitamente cualquier nodo de R/S/T y solo asignaba potenciales de mando | V~ calcula magnitudes RMS de mando y fuerza, incluyendo devanados y contactos. Pruebas: F/N = 24 V, R/S = 380 V, bobina de motor en estrella = 219,39 V y en triángulo = 380 V con los valores iniciales del modelo |
| Falta medir corriente | El selector del panel no ofrecía A y convertía internamente ese modo en V | Se agregó A~, elección manual de toma roja A o V Ω, negro fijo en COM, cálculo de corriente de la rama y protección virtual de 10 A |
| La medición de corriente debe abrir el circuito | Las puntas anteriores solo observaban la red | En A~ y toma A las puntas completan el corte de una rama. El circuito reacciona: puede encender un piloto o activar una bobina. El puente es transitorio y no se añade al documento de cables, historial ni exportación |
| Estrella-triángulo exige un contactor adicional | Los polos L1/T1, L2/T2 y L3/T3 del conjunto neumático estaban dibujados pero nunca cerraban | Ahora actúan al energizar su bobina. El ejemplo automático usa KT1 como conjunto contactor-temporizador de línea, KM2 para estrella y KM1 para triángulo. No añade KM3 |

El ejemplo anterior de tres contactores y temporizador separado sigue disponible con un botón propio. Las lecciones originales y sus diagramas se conservan: representan esa otra variante. No se sustituyeron sus conexiones por un circuito distinto del que muestran sus fuentes.

## Cómo probarlo

1. Abrir [el simulador local](http://127.0.0.1:4335/?view=simulator).
2. En **Opciones de simulación → Probar con un ejemplo virtual**, elegir **Cargar arranque estrella-triángulo automático**. Reemplaza los cables actuales; Deshacer recupera el montaje previo.
3. Enchufar virtualmente y cerrar FUERZA y ambos CONTROL. Pulsar el verde derecho. KT1 queda retenido, KM2 inicia estrella y, al terminar el retardo, KM2 cae y KM1 activa triángulo. Paro o térmico detienen el circuito; liberar el paro o rearmar no lo reinicia.
4. Abrir el multímetro, seleccionar V~ y colocar las puntas entre R y S. Su lectura inicial es 380,0 V del modelo.
5. Para practicar corriente: desenchufar virtualmente, retirar un cable de la rama, poner las puntas en los dos bornes que ese cable unía, conectar rojo a A y seleccionar A~. Volver a alimentar. El piloto de ejemplo consume 0,050 A con su equivalente inicial; al retirar el tester la rama vuelve a quedar abierta.
6. **Conexión y valores del modelo** explica la conexión y permite ajustar tensión entre fases y equivalentes de bobinas, pilotos y devanados. Son ajustes de la sesión; no modifican el formato de las prácticas guardadas.

Si la ventana **Estado de energía** tapa el instrumento en móvil, su X la oculta y el botón Estado permite recuperarla. El multímetro conserva movimiento, tamaño ajustable y reducción.

## Alcance de los valores

La tensión de fuerza de 380 V y las resistencias de 240 Ω por bobina, 480 Ω por piloto y 100 Ω por devanado son parámetros didácticos visibles y editables. No son lecturas ni características confirmadas del banco real. El cálculo usa dos sistemas nodales para las componentes real e imaginaria de una fuente trifásica equilibrada con cargas resistivas equivalentes. No modela el consumo de arranque, desfase, par ni parámetros reales de un motor de inducción.

N de mando, fuerza y TP no se unen automáticamente. Se sigue mostrando `SIN REFERENCIA` cuando se mide un punto flotante, TP o entre fuentes aisladas. Ω/continuidad mantienen el bloqueo con el enchufe conectado y `SIN DATOS` si el camino atraviesa cargas cuya resistencia física no está documentada.

Las capturas recibidas no contienen el JSON del montaje. Se reprodujeron y probaron las clases de fallo descritas y el nuevo circuito de ejemplo; no se afirma haber reconstruido cada cable de aquel montaje de 54 cables ni haber validado el equipo físico. La comprobación móvil es emulada en navegadores.

Referencias de funcionamiento: [medición de corriente en serie y tomas A/COM, HIOKI](https://www.hioki.com/us-en/learning/methods/current-measurement-methods.html) y [contactos principales instantáneos al añadir un bloque temporizado, Schneider Electric](https://www.se.com/ca/en/faqs/FA107844/). Estas referencias apoyan el comportamiento didáctico, sin identificar el modelo físico exacto del banco.

## Archivos intervenidos en esta corrección

- `src/data/panelElectrical.ts`: nuevo cálculo eléctrico del tester y puente de entrada A.
- `src/data/panelMeter.ts`: V~ de mando/fuerza, A~, comprobación de tomas y mensajes de conexión.
- `src/data/simulation.ts`: polos de potencia del conjunto temporizado y las dos variantes del ejemplo automático.
- `src/hooks/useSimulation.ts`: inserción transitoria del amperímetro y parámetros de medición.
- `src/components/PanelMultimeter.tsx`: selector, tomas, ayuda y ajustes.
- `src/components/App.tsx`: explicación del ejemplo actualizado.
- `src/components/SimulationControls.tsx`: acceso a ambas variantes y descripción del modelo.
- `src/lab/MeterInstrument.tsx`: pie opcional de ayuda y rótulo del panel; los instrumentos del laboratorio conservan sus opciones anteriores.
- `src/styles/panel-meter.css`: controles de ayuda y ajuste.
- `qa/verify-panel-fixes.mjs` y `qa/verify-panel-fixes-ui.cjs`: regresiones reproducibles.
- `qa/verify-star-lessons.mjs`: actualizada una expectativa antigua que exigía lecciones sin trazado. Ahora verifica el diagrama de referencia intacto, correspondencias válidas y trazado sobre conductores existentes; conserva las comprobaciones de fuentes, cables, enseñanza, evaluación, historial y funcionamiento.

## Validación realizada

- `npm install --ignore-scripts`: correcto; auditoría npm sin vulnerabilidades.
- `npm run check` y `npm run build`: correctos.
- `npm run verify:simulation`, `npm run verify:motor`, `npm run verify:data`, `npm run verify:wiring`: correctos. Inventario actual verificado: 6 módulos base / 94 bornes activos y 16 bornes retirados preservados explícitamente, sin cambiarlo en esta tarea.
- `node qa/verify-panel-fixes.mjs`: 8 grupos correctos; mando/fuerza, contactos abiertos, referencias, A/COM, apertura de rama, sobrecarga, bobina con retención, corriente de línea, estrella/triángulo, parada, térmico y variante anterior.
- `node qa/verify-star-lessons.mjs`: correcto en las dos lecciones originales; 46 y 42 cables exactos, hashes de las fuentes, diagrama de referencia intacto, trazado válido, evaluación, importación/exportación, retención, conmutación y parada.
- `node qa/verify-meter-precision.mjs`: 20 comprobaciones de resolución, rangos y unidades correctas.
- `node qa/verify-panel-fixes-ui.cjs`: Chromium y WebKit a 1440 y 390 px, 4 recorridos completos correctos; sin errores JavaScript ni desbordamiento horizontal. Incluye retirar el cable desde la interfaz, insertar el tester y observar la reacción del piloto.
- `PANELLAB_URL=http://127.0.0.1:4335/ node qa/verify-meter-parity-2.2.8.cjs`: 6 escenarios correctos en Chromium/WebKit a 393, 820 y 1440 px; conserva arrastre táctil, puntas, zoom independiente, continuidad, libreta, reducción y tamaño equivalente al instrumento del laboratorio.

Resultados estructurados y capturas: `qa/panel-fixes/model-results.json`, `qa/panel-fixes/ui-results.json` y `qa/panel-fixes/*.png`.

## Comparación visual

Reporte original, conservado sin modificar:

![Reporte original](qa/panel-fixes/referencias/tester-sin-referencia.png)

Después, lectura entre fases y estrella-triángulo sin KM3:

![Fuerza y circuito corregidos](qa/panel-fixes/chromium-1440-force-delta.png)

Después, rama abierta completada por el tester en A/COM:

![Medición de corriente en serie](qa/panel-fixes/chromium-1440-series-current.png)

Después, interfaz móvil comprobada en WebKit:

![Multímetro móvil](qa/panel-fixes/webkit-390-force-delta.png)
