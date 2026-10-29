# Entrega 2.2.8 — Multímetro compartido

El panel usaba el dibujo de MeterDevice, pero lo alojaba en el SVG del banco con su propio arrastre y ManualLeads. Eso producía un comportamiento distinto de la protoboard al mover, acercar y manipular las puntas.

Ahora PanelMultimeter adapta las lecturas eléctricas del panel a los mismos MeterDevice y MeterLeads que usa BreadboardView. El instrumento flota en coordenadas de pantalla, con la misma escala guardada, tamaños por dispositivo, asa/carcasa, selector, HOLD, libreta, controles de tamaño y vista reducida. Los extremos se proyectan desde los bornes reales visibles del SVG, siguiendo zoom, desplazamiento y movimiento de módulos. Los cables usan la misma cadena física y las puntas rígidas con zona táctil de 44 px.

El selector conserva V~ de mando, Ω y continuidad del panel. No se agregan funciones sin respaldo del modelo. Los 7 módulos y 108 bornes de referencia se mantienen.

Se limita touch-action en la capa de instrumentos para evitar cancelaciones del arrastre táctil. La capa vacía deja pasar los gestos hacia el banco. Se eliminan el asa, escala y cables propios del panel; ToolDock permite cerrar y abrir el multímetro.

## Verificación

- npm install: cero vulnerabilidades; npm run check y npm run build correctos.
- npm run verify:meter-parity: Chromium y WebKit, 393/820/1440 px. Tamaño del panel comparado directamente con protoboard; arrastre de carcasa y asa, ambas puntas a 95–96, 0,4 Ω, puntas fijas al mover el instrumento, independencia del zoom, libreta, reducción y tamaño.
- Chromium: gestos táctiles CDP reales en la emulación. WebKit: pantalla táctil emulada y arrastre con mouse; no se presenta como validación en hardware físico.
- verify-proto-2.2.7.cjs: cuatro combinaciones de navegador/dimensiones, ambas puntas y resistencia, pulsadores y sentidos del motor sin regresiones.
- Las pruebas antiguas que buscan ManualLeads/SVG nativo dentro de PanelMultimeter describen la implementación reemplazada. La verificación del panel actual es verify:meter-parity.

Archivos principales: PanelMultimeter.tsx, MeterInstrument.tsx, App.tsx, panel-meter.css, laboratory-canvas.css. Capturas en qa/meter-2.2.8/.

## Publicación

https://modo-lab.vercel.app/ — dpl_CtPWowcD6hcJznmwSuUgkRJr4YVo, READY. Verificación de paridad repetida sobre el alias público.
