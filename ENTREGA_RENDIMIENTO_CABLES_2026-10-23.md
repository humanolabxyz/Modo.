# Rendimiento de cables y correcciones del simulador

Trabajo local del 23 de octubre de 2026. Se mantuvieron los cambios previos y el diseño del panel. No se publicó.

## Cambios

- La vista previa de una conexión escribe únicamente su trazo, agrupado por fotograma. Ya no actualiza el tablero completo en cada movimiento del puntero. Escape y salir del lienzo limpian la vista previa y cancelan trabajo pendiente.
- Se ordenan e indexan los extremos una vez por conjunto de cables. Se conservan exactamente las posiciones de apilamiento, capas, offsets y terminales de los montajes anteriores.
- Se reutilizan las geometrías, cuerdas y dibujos de cables que no cambiaron; seleccionar un cable no reconstruye el resto ni reinicia su curva.
- Los conectores SVG comparten su dibujo y degradado por color mediante `use`. Con un solo color y 35 cables se pasa de definir el conector repetidamente a una definición compartida y 70 instancias; conserva los dos conectores visibles de cada cable.
- El bucle de física conserva referencias directas a los trazos. No busca el grupo y sus trazos en el DOM en cada fotograma. Se eliminan referencias de cables retirados.
- Las cuerdas conservan su descanso habitual y ahora tienen un límite de cinco segundos desde el último cambio de geometría para frenar oscilaciones residuales. Esto corrige el caso detectado en WebKit que no se asentaba. No cambia los anclajes ni el cableado eléctrico.
- Durante pan/zoom se omiten temporalmente los brillos y sombras de los cables; cuerpo, contorno y conectores permanecen visibles. Al terminar vuelve el acabado completo.
- Los cambios de vista se agrupan por fotograma y se sincronizan al soltar. Se evitan escrituras repetidas de estados de gesto y se conserva la posición del cursor al acumular zoom antes del siguiente fotograma.
- El controlador de simulación y las referencias de cables visibles permanecen estables mientras solo cambia la cámara. Esto evita repetir cálculos eléctricos y dibujos de componentes por navegación.
- La animación de tensión deja de programar su reloj mientras la pestaña está oculta. Se conserva la actualización directa de los trazos: el experimento de animar el atributo heredado del grupo empeoraba WebKit/Chromium y fue descartado.

## Otros fallos corregidos

1. **Cambiar el retardo durante la cuenta:** antes quedaba activo el timeout anterior. Ahora se reinicia la cuenta con el nuevo valor y se reinicia su barra visual. Los temporizadores se limpian al reiniciar, desenchufar o dispararse una protección.
2. **Cortocircuito entre fases:** antes se diagnosticaba en el motor, pero FUERZA permanecía activada. Ahora se dispara la protección virtual, se abre FUERZA, cae el mando y se muestra la causa. Corregir el cableado y restablecer es necesario para continuar.
3. **Indicador de cables:** decía “con corriente” aunque solo representaba pertenencia a nodos con tensión. Ahora dice “cables con tensión”; la corriente se obtiene del amperímetro y su modelo didáctico.

## Medición antes/después

Chromium automatizado local, viewport 820×1180, escala de píxel 2 y CPU ralentizada 4×. Mismos montajes de 54 y 160 cables, mismos recorridos de pan y vista previa. Los 160 cables son una prueba de estrés con conexiones repetidas, no una práctica docente real. Cada fase se ejecutó sola; los recorridos con gestos tienen duración variable porque la automatización espera al navegador. Los números describen trabajo acumulado para esa secuencia y no son una promesa de FPS ni de velocidad en un dispositivo físico.

| Escenario | Trabajo navegador antes → después | JavaScript antes → después |
| --- | ---: | ---: |
| 54 cables, pan | 2813 → 2367 ms (−16%) | 423 → 112 ms (−74%) |
| 54 cables, vista previa de conexión | 2611 → 1719 ms (−34%) | 1090 → 63 ms (−94%) |
| 54 cables, pan con simulación | 3128 → 2432 ms (−22%) | 376 → 101 ms (−73%) |
| 160 cables, pan | 5741 → 4017 ms (−30%) | 879 → 109 ms (−88%) |
| 160 cables, vista previa | 3924 → 2929 ms (−25%) | 1146 → 65 ms (−94%) |
| 160 cables, pan con simulación | 6017 → 4216 ms (−30%) | 917 → 108 ms (−88%) |

En reposo no hay escrituras de trazos. El coste con simulación sin interacción cambia poco: 1791 → 1762 ms para 54 cables, y 1573 → 1399 ms para 160. El P95 de fotogramas de la vista previa mejora de 50 → 33,4 ms con 54 cables y de 66,7 → 50,1 ms con 160. El P95 del pan con 160 cables empeoró en esta ejecución (83,4 → 116,6 ms; con simulación 83,4 → 133,4 ms), aunque el trabajo total disminuyó. No se afirma una mejora universal de fluidez: el repintado de escenas SVG grandes sigue siendo el límite pendiente, y falta comprobar sensación en tablet/teléfono físico.

Datos completos: `qa/cable-performance/before/results.json`, `after/results.json` y `comparison.json`. Las fuentes iniciales de los archivos principales se conservaron en `qa/cable-performance/before-source/`. La corrección del límite de asentamiento se añadió después de la medición comparativa y fue validada funcionalmente en ambos navegadores; no se ha medido aparte su efecto en FPS.

## Validación

- `npm run check`, `npm run build`: correctos.
- `verify:simulation`, `verify:motor`, `verify:wiring`, `node qa/verify-star-lessons.mjs`: correctos.
- `node qa/verify-cable-performance-model.mjs`: paridad exacta de geometría con 160 cables, offsets/capas repetidas, movimiento de extremos, conectividad y anclajes de cuerdas.
- `node qa/verify-cable-performance-ui.cjs`: Chromium y WebKit; conectores compartidos, movimiento de módulo sin cambiar el documento, cuerda que vuelve a reposo, vista previa/Escape, retardo de 6 a 2 segundos durante la cuenta, selección que conserva la curva y disparo por cortocircuito entre fases. Sin errores JavaScript.
- `node qa/verify-panel-fixes-ui.cjs`: cuatro recorridos completos, Chromium/WebKit a 1440 y 390 px; tensión, corriente en serie, libreta, ajuste de valores, sobrecarga y continuidad.
- `PANELLAB_URL=http://127.0.0.1:4335/ node qa/perf-mobile.cjs`: correcto; pan con 1 render de App y 30 pasos de zoom con 2 renders, filtros pausados/restaurados y cámara sincronizada.
- `PANELLAB_URL=http://127.0.0.1:4335/ node qa/verify-meter-parity-2.2.8.cjs`: seis escenarios correctos, Chromium/WebKit a 393/820/1440 px; arrastre, puntas fijas, continuidad, zoom, libreta, reducción y tamaño.

## Archivos de implementación

`src/components/WireLayer.tsx`, `BananaCable.tsx`, `Board.tsx`, `App.tsx`, `SimulationControls.tsx`, `PowerStatus.tsx`; `src/data/wiring.ts`, `simulation.ts`; `src/hooks/useSvgNavigation.ts`, `useSimulation.ts`; `src/styles/board-layout.css`.

## Capturas comparables

Antes, montaje de estrés de 54 cables:

![Antes](qa/cable-performance/before/54-cables.png)

Después, el mismo montaje y cámara al terminar el recorrido:

![Después](qa/cable-performance/after/54-cables.png)

[Abrir simulador local](http://127.0.0.1:4335/?view=simulator).
