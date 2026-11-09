# Rendimiento y navegación de robótica — 3 de noviembre de 2026

Corrección local del flujo Simular → ejecutar programa → mover cámara libremente → detener. No publicada y sin prueba física en un Mac A1707.

## Problemas encontrados

- El seguimiento se activaba por defecto y escribía sobre la cámara en cada snapshot, incluso durante la primera persona.
- La presencia del escenario mantenía el render continuo con la simulación detenida o pausada.
- Cada detalle estático generaba su propia llamada de dibujo. En el robot de orugas se midieron 1.200 llamadas por cuadro en marcha.
- Los cables se reconstruían en coordenadas mundiales al trasladar o girar el robot, y su volumen invisible de selección también se dibujaba.
- Cada mensaje del worker solicitaba nuevas actualizaciones de React, aunque el navegador aún estuviera procesando el cuadro anterior.

## Cambios

- Seguimiento opcional, desactivado inicialmente; se suelta al navegar con puntero, trackpad, encuadre o cubo. La primera persona no recibe ajustes del seguimiento ni del encuadre inicial.
- Render bajo demanda para escenarios y snapshots. Se mantiene el ciclo continuo para primera persona y las guías con pulso.
- Resolución 3D de 1 píxel por píxel CSS, también en pantallas Retina. Reduce el trabajo de fragmentos respecto del límite anterior de DPR 1,75; el HTML mantiene su resolución normal.
- `StaticMeshes.tsx` combina detalles opacos con el mismo material en coordenadas de la pieza. Conserva las etiquetas, transparencias y piezas animadas; libera los buffers combinados al desmontar. Se conservan las superficies excluidas del picking.
- Los cables reutilizan curvas en coordenadas locales frente a traslación y giro horizontal; los cambios reales de forma siguen reconstruyéndolos. El volumen de selección permanece disponible para raycasting sin dibujarse.
- `useRobotSim.ts` conserva el último snapshot por cuadro y concatena el texto serie hasta su límite existente. Las actualizaciones visuales usan una transición de React y se cancelan al detener, reiniciar o desmontar; el worker mantiene su paso de simulación.
- Estadísticas del renderer disponibles exclusivamente en el modo de depuración y prueba repetible en `qa/perf-robotics-navigation.cjs`.

## Evidencia y límites

Chromium local, 1280 × 800 CSS, escala de dispositivo 2, ANGLE/SwiftShader (gráficos por software), robot de orugas con radar, pantalla y brazos. `qa/robotics-performance/before.json` conserva la línea base y `after.json` la medición final. No son cifras de FPS de un Mac ni una garantía de 60 FPS.

En la primera comparación tras optimizar: 1.200 → 734 llamadas por cuadro en marcha (39 % menos); 1.241 → 732 detenido; DPR 1,75 → 1; repintados en reposo durante 1,2 s: 5 → 0. Las posiciones y el ángulo de cámara cambian durante las pruebas, por lo que el número exacto de llamadas puede variar ligeramente. No se afirma una reducción estable de memoria a partir de una sola muestra de geometrías.

Capturas en `qa/robotics-performance/`: `before-desktop.png`, `after-desktop.png`, `after-desktop-framed.png`, `before-mobile.png` y `after-mobile.png`. Las capturas iniciales muestran el encuadre de la plantilla, parcialmente tapado por su obstáculo; la captura final encuadrada permite revisar el robot desde atrás.

## Validación

- `npm install`: correcto; npm informó cuatro vulnerabilidades de severidad alta en dependencias. No se aplicaron actualizaciones mayores ajenas a esta corrección.
- `npm run check`: correcto.
- `npm run build`: correcto, con advertencia de chunks superiores a 500 kB.
- Navegación y reposo: prueba en desktop con escala Retina y captura móvil; seguimiento liberado por trackpad, desplazamiento en primera persona durante la ejecución y ausencia de errores de página.
- `verify-robotics-tracked-ui.cjs`: correcto; 31 piezas, avance, giro de cabeza, cambios de cara OLED y consola.
- `verify-robotics-fly-ui.cjs`: correcto; WASD, Q/E, mirada, rueda, campos de texto, entrada/salida y recarga.
- `verify-robotics-controls-ui.cjs`: correcto; servo, potenciómetro, pulsador con mouse/teclado y detención.
- `verify-robotics-sim-ui.cjs`: correcto al ejecutarse solo; movimiento, evasión del obstáculo, detención, edición y persistencia tras recarga. Una ejecución simultánea con otro navegador y el build falló por no observar el giro dentro de su ventana fija de nueve segundos. La repetición aislada pasó sin modificar el modelo ni relajar sus aserciones.

Pendiente: comprobar Safari/Chrome y fluidez sostenida en el Mac A1707 del usuario. Esta sesión no establece rendimiento térmico, autonomía ni validación de hardware robótico real.
