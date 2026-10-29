# Tensión variable durante el funcionamiento

> Actualización posterior: la perturbación se deja desactivada por defecto, incluso en perfiles antiguos sin activación explícita; muestreo del panel a 250 ms. Véase `CORRECCION_REALISMO_Y_DIAGNOSTICO_PROTOBOARD_2026-10-27.md` para el estado final.

Cambio local solicitado para que la lectura de tensión tenga variaciones durante la marcha del motor. Sin publicación ni ensayo en un equipo físico.

Las fotos parecen mostrar R–S y R–T: en una alimentación equilibrada sus magnitudes coinciden. El cambio solicitado se interpretó, tras la aclaración del usuario, como variación durante el funcionamiento.

- Se conserva la caída de tensión por la impedancia de alimentación y la corriente calculada del motor: arranque, recuperación y respuesta a carga.
- Se añade una variación lenta y acotada a la fuente trifásica común. El perfil de ejemplo utiliza ±0,12 %. Es un parámetro didáctico, sin mediciones de la red del laboratorio.
- Dos componentes lentas, con periodos de 7,3 y 2,1 segundos y pesos 0,65 y 0,35, producen una envolvente RMS determinista. No representan la onda instantánea de 50 Hz. Los tres fasores reciben el mismo factor; no se introduce un desequilibrio ficticio.
- Todo el circuito recibe esa fuente: motor, tensión, corriente y protección. La pantalla muestra la solución muestreada; no se añaden números aleatorios a la lectura.
- El parámetro se ajusta en Banco → Perfil del banco → «Variación lenta de red didáctica (± %)», entre 0 y 1 %. Con 0 queda una fuente estable, conservando la caída por carga.
- Se utiliza el reloj existente de simulación, sin otro intervalo ni animación React por fotograma. HOLD y la suspensión conservan su funcionamiento. El mando aislado de 24 V conserva su fuente ideal independiente.
- Los perfiles anteriores siguen siendo compatibles. Importación, validación y exportación incluyen el parámetro.

Archivos: `src/data/panelElectrical.ts`, `src/data/panelCalibration.ts`, `src/components/PanelBenchOptions.tsx`.

Verificación: `npm install --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm run build`; `qa/verify-voltage-variation.mjs`, `qa/verify-panel-dynamic.mjs` y `qa/verify-panel-automatic.mjs`. Prueba de pantalla y HOLD en Chromium 820 px y WebKit 390 px mediante `qa/verify-voltage-variation-ui.cjs`.

Resultados y capturas en `qa/voltage-photo-check/`. Las comprobaciones de navegadores utilizan dispositivos emulados; no certifican realismo cuantitativo de una instalación física.
