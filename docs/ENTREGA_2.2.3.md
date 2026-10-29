# PanelLab 2.2.3

Actualización del banco existente. Publicación: https://modo-lab.vercel.app/

## Cambios
- Soldadura permite pan sobre la mesa libre en modo de manipulación; Mover captura el gesto también sobre piezas. Las herramientas mantienen su arrastre independiente.
- Tocar el centro del dial del multímetro compartido abre una ventana con botones de al menos 64 px, nombres y símbolos de las funciones disponibles. Se conservan giro, radios y teclado.
- El multímetro integrado deja de leer geometría del DOM en cada actualización. El instrumento independiente informa posición solo cuando cambia o se redimensiona.
- La estación térmica conserva la misma referencia de estado en equilibrio (tolerancia de 0,005 °C, inferior a la resolución mostrada). No repinta todo el taller continuamente en reposo.
- En dispositivos táctiles temperatura calcula a 100 ms y publica la presentación cada ~300 ms; fija el equilibrio exacto. Se pausa el avance térmico de las pestañas ocultas. El seguimiento del editor contextual ya no consulta geometría a 60 Hz.
- Los cables del multímetro de protoboard reducen su ciclo a 4 Hz al quedar quietos y se reactivan durante el movimiento. Se conserva el seguimiento del viewBox.
- Se conservan el selector de herramientas, colores por hilo, cables sobre el DB9, puntas táctiles y libretas en primer plano de 2.2.2.

## Verificación
- npm install: cero vulnerabilidades; npm run check y npm run build correctos.
- Modelo temperatura: 38/38; soldadura y panel: 4/4.
- verify-mobile-2.2.3: selección de cuatro funciones, botones grandes, pan sin edición accidental y sin desborde, Chromium y WebKit a 393 y 820 px.
- verify-mobile-lab-2.2.2: selector por toque/arrastre, mesa libre y Mover, capa de cables, ambas puntas en temperatura/panel y libreta delante.
- verify-solder-panel-ui: tres soldaduras y aislamientos, seis medidas, orden RTU, panel 95–96, rechazo de resistencia energizada y lectura virtual de 24 V.
- verify-realism-ui: referencia y registro no lineales, efectos de resistencia de hilos, fabricación DB9, timeout/CRC/lectura/paro RTU, prácticas de protoboard y temperatura.
- perf-mobile: 60 movimientos y 30 gestos de zoom sin renderizar App (0 renders). Los fotogramas largos observados en CPU emulada permanecen documentados; no se afirma fluidez perfecta.

## Medición de rendimiento
qa/perf-before-2.2.3.json y qa/perf-after-2.2.3.json: Chromium, CPU x4, móvil 393 px y tablet 820 px, intervalo de 3 s; anterior producción pública frente a nueva compilación local de producción. Son mediciones de laboratorio con variación, no de teléfonos físicos. Soldadura en reposo pasó de ~50/71 ms de tarea a ~1,4/1,9 ms; temperatura activa de ~91/117 ms a ~47/73 ms en estas muestras. No representan porcentajes garantizados en todos los dispositivos.

## Archivos principales
src/lab/MeterInstrument.tsx, PanStage.tsx, CableBench.tsx, TemperatureView.tsx, temperature/BenchScene.tsx, soldering/model.ts; releases.ts y versiones de package. Pruebas y capturas bajo qa/mobile-2.2.3 y qa/mobile-lab-2.2.2.

## Límites
Comprobaciones táctiles y WebKit emulados; pendiente confirmación del usuario en su iPhone/tablet físico. Los modelos educativos y las correspondencias documentales no confirmadas mantienen sus límites previos. No se alteró la captura académica histórica ni se afirma que su hash antiguo pase.
