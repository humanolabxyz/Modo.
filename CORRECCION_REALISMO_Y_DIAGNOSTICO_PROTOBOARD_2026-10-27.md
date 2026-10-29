# Lecturas causales y diagnóstico concreto del protoboard

Estado local final: sin publicación y sin pruebas en dispositivos físicos.

## Mediciones eléctricas

- La perturbación periódica de fuente queda desactivada por defecto. También se desactiva al abrir perfiles anteriores que guardaban la amplitud de 0,12 % sin una activación explícita. Una amplitud guardada por sí sola no activa oscilaciones.
- La fuente variable queda como escenario didáctico opcional, con una casilla explícita y amplitud configurable; no se presenta como medida de la red real.
- Las variaciones normales dependen del circuito equivalente de inducción, impedancia de alimentación, aceleración, carga, conmutación y protecciones. Una lectura estable en régimen es válida.
- Se conserva el muestreo conjunto de lectura y condiciones; los dígitos del multímetro del panel se actualizan cada 250 ms (4/s). HOLD y registros conservan la muestra mostrada.
- Prueba del motor en tablet: 14,122 A al capturar el arranque, 1,702 A en estrella estabilizada, 5,267 A en el conductor seleccionado bajo carga en triángulo. Estos valores corresponden al modelo y a sus parámetros de ejemplo, no al motor físico.

Archivos: `src/data/panelElectrical.ts`, `src/data/panelCalibration.ts`, `src/components/PanelBenchOptions.tsx`, `src/components/PanelMultimeter.tsx`.

## Aviso de la fotografía

El aviso genérico provenía de grupos eléctricos sin referencia en el cálculo DC. En el puente H de ejemplo, con ambos pulsadores sueltos, se identifican ocho grupos que incluyen salidas y mandos abiertos. Activar un sentido proporciona referencia a los bornes del motor. Eso no permite concluir que falte un cable simplemente por ver el aviso.

El diagnóstico ahora muestra:

- Grupo afectado y orificios ocupados reales; componentes, patas E/B/C, terminales del motor o pines del integrado, según corresponda.
- Motivo del estado y qué comprobar. Distingue transistores en corte o pulsadores abiertos de un componente aislado sin un mando abierto adyacente. Describe posibilidades, sin diagnosticar un puente H arbitrario como físicamente correcto.
- «Ver estos puntos en la placa»: cierra la ventana, encuadra y marca en ámbar los puntos relacionados. Las marcas se pueden quitar y se retiran si el grupo adquiere referencia.
- Una salida flotante no se muestra como 0 V. Los daños y el bloqueo del cálculo conservan sus diagnósticos separados.

Archivos: `src/lab/breadboardFloatingDiagnostics.ts`, `src/lab/BreadboardDiagnostics.tsx`, `src/lab/BreadboardView.tsx`, `src/styles/laboratory-canvas.css`.

## Evidencia

- Dependencias instaladas, TypeScript y compilación correctos.
- `qa/verify-floating-diagnostics.mjs`: redes y patas verificadas; rama del motor adquiere referencia; resistencia aislada y reparación mediante alimentación/retorno.
- `qa/verify-floating-diagnostics-ui.cjs`: Chromium y WebKit a 390/820 px; lista de ocho grupos, explicación y posiciones, desplazamiento táctil emulado en Chromium y rueda en WebKit, localización, quitar marcas, eliminación al conducir y al detener; sin errores de página.
- `qa/verify-voltage-variation.mjs`: oscilación solo con activación explícita; compatibilidad de perfiles; fuente equilibrada y caída por carga.
- `qa/verify-voltage-variation-ui.cjs --physical`: perfil antiguo con amplitud guardada y sin activación; 24 muestras estables de 379,7 V por navegador, HOLD y casilla desactivada en Chromium 820/WebKit 390 px.
- `qa/verify-voltage-variation-ui.cjs`: escenario opcional activado explícitamente, variación coherente de la fuente y HOLD.
- `qa/verify-panel-dynamic.mjs` y `qa/verify-panel-automatic.mjs`: respuesta eléctrica/mecánica, caída adicional al cargar, conmutación, temporización, reloj, protección y continuidad.
- `PANEL_QA_QUICK=1 node qa/verify-tablet-meter-dynamic.cjs`: tablet Chromium 768 px, lecturas y captura, temporizador, carga, parada con inercia y desplazamiento. La prueba espera que se estabilice el arranque antes de comparar su corriente con régimen.

Capturas y resultados del aviso: `qa/floating-diagnostics/`. Tensión y perfiles: `qa/voltage-photo-check/`.

Los modelos siguen siendo didácticos: no están identificados ni calibrados con ensayos del banco físico. El motor DC del protoboard conserva su equivalente resistivo; esta corrección no incorpora un modelo electromecánico DC transitorio ni certifica tiempos de daño o protección reales.
