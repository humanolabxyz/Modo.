# Ayudas de pantalla — 2.2.16

Se elimina la franja de ayuda permanente que cubría la fuente en tablet. ContextHint comparte instrucciones opcionales de protoboard y panel: tarjeta de hasta 340 px, adaptable al ancho, junto a la barra inferior; botón de cierre de 44 px; no reaparece por hover o cambio del punto mientras siga activa la misma herramienta. Cambiar de herramienta puede mostrar su nueva instrucción. Las ayudas no capturan el movimiento del banco; solo sus botones reciben eventos.

Archivos: src/components/ContextHint.tsx, src/components/App.tsx, src/lab/BreadboardView.tsx, src/styles/modo-soft-ui.css; versión en package.json, package-lock.json y src/data/releases.ts.

TypeScript y build pasan. qa/verify-hints-2.2.16.cjs pasa en Chromium/WebKit a 393x852, 1180x820, 1440x1000 y 852x393: no hay franja inicial, tarjeta dentro de pantalla, cierre por toque, no reaparece al pasar sobre orificios y mismo cierre en el panel. Capturas en qa/hints-2.2.16. Son pruebas emuladas, sin certificación en hardware físico.
