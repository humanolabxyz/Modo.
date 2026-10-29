# Estaño accesible y fundido visible — 2.2.11

- Agarrador Tomar estaño de 138 × 44 px separado de la punta. Tocar y luego tocar la unión presenta el hilo sin exigir arrastre preciso. Se conserva arrastrar el extremo, ahora con zona de 64 px y encaje de 48 px de pantalla.
- El toque de aporte se captura antes de los cables y copas, solo mientras se ha tomado el estaño y cerca de la unión sujeta del conductor activo. Se consume el clic posterior para no extraer ni cambiar de copa el cable.
- El proceso físico sigue exigiendo cobre preparado, contacto, punta limpia y estañada y temperatura de fusión de la aleación. Se ve un indicador de calentamiento y del requisito pendiente.
- La animación estaba antes de herramientas en el SVG y duraba 1,2 s. Ahora está al final, por delante, dura tres segundos y conserva escala legible en pantalla: anillo de calor, charco de soldadura, aporte, vapor y confirmación. Movimiento reducido conserva la señal estática.

Validación: npm install sin vulnerabilidades; check y build correctos. verify-solder-tap-2.2.11.cjs prueba aporte por toque sobre el cable ya sujeto, bobina fija, espera en frío, calentamiento y mojado, animación al final del SVG visible después de 1,4 s, bloqueo de extracción en frío y posterior desoldado. verify-solder-feed-2.2.10.cjs conserva el arrastre táctil del extremo. verify-solder-2.2.5.mjs: nueve grupos del modelo térmico. Chromium con gestos táctiles CDP, dispositivo emulado.

Captura de fundido: qa/solder-2.2.11/fundido-real.png.

Publicación: https://modo-lab.vercel.app/ — dpl_E6kaNYGRJbHr3Rw989DLDBieEUtk, READY. Flujo por toque probado en 393 y 820 px; repetido en producción a 393 px.
