# Fuente física sobre la pizarra — 2.2.12

La ventana de configuración se reemplaza por un dispositivo SVG en el mismo lienzo que la protoboard. Tiene carcasa móvil, pantalla de tensión y corriente del solver, perilla arrastrable/teclado, botones +/− y ajuste grueso (1 V) o fino (0,1 V). Se conservan los límites eléctricos existentes: 0,1–30 V.

Los bornes rojo y negro originan cables visibles con puntas que se arrastran a orificios libres. Captura de puntero y conservación del punto de agarre. La fuente permanece en pantalla mientras se arrastran; no hay ventana que se oculte ni un cable que nazca del botón de estado. Resaltado del orificio próximo y tolerancia táctil en píxeles de pantalla. Los ocupados se rechazan por el modelo.

Se mantiene enchufe virtual y OUTPUT. El cambio de tensión ahora usa setBoardVoltage, que sí se permite durante la simulación; update general bloqueaba la configuración anterior. Para cablear se apaga OUTPUT; funciona incluso con Simular activo. Al apagar salida o desenchufar, el solver pasa a cero voltios. La corriente de pantalla incluye todas las ramas del circuito, no solo el motor.

Ajustar encuadra fuente y protoboard; Ampliar vista facilita operar el dispositivo en móvil. No se modifican los modelos del motor, puente H ni las correspondencias del panel de control.

## Verificación

- npm install: cero vulnerabilidades. npm run check y npm run build.
- verify-physical-source-2.2.12.cjs: Chromium y WebKit, 393/820/1440 px. Fuente visible sin diálogo; enchufe, ajuste fino/grueso, perilla y límites; cables desde bornes a rieles con OUTPUT OFF y simulación activa; motor y lectura de corriente, tensión en vivo, corte al apagar, carcasa móvil, zoom propio.
- Chromium usa gestos táctiles CDP; WebKit usa emulación móvil y arrastre con mouse. Sin prueba sobre hardware físico.
- verify-proto-2.2.7.cjs: cuatro combinaciones, sin regresión en pulsadores/motor, multímetro y etiquetas.
- verify-laboratory.mjs: 38/38 comprobaciones del modelo.
- Las pruebas antiguas que buscan un diálogo Fuente DC describen el flujo retirado; usar verify:physical-source para esta interfaz.

Archivos: BreadboardSupply.tsx, BreadboardView.tsx, useLaboratory.ts y laboratory-canvas.css. Capturas: qa/source-2.2.12/.

Durante la regresión se detectó un clic táctil tardío al cerrar el selector: podía colocar una pieza debajo del menú. CanvasControls consume solo ese clic en las coordenadas originales; un nuevo pointerdown o teclado conserva su acción. verify-proto-placement-2.2.5.cjs comprueba de nuevo una colocación por toque en seis combinaciones.

## Publicación

https://modo-lab.vercel.app/ — dpl_CTjdTiH775bFLw55TwCJzRJLeT9Q, READY. Verificación de la fuente repetida sobre el alias público.
