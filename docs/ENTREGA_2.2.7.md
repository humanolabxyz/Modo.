# Entrega 2.2.7

- Multímetro compartido: punta rígida independiente de la física del cable. Evita que el agarre se desplace durante la toma. Área táctil de 44 px y asa de arrastre con teclado en protoboard.
- Panel: el navegador de lienzo ignora instrumentos y puntas; asa y cierre accesibles bajo la barra superior. Resaltado y nombre del borne de destino durante el arrastre.
- Protoboard: etiquetas calculadas con su escala real, ancladas mediante líneas y sin interceptar controles durante Simular. Se omiten etiquetas opcionales si no hay espacio próximo; los valores siguen en el editor. Transistores conservan su nombre sobre la carcasa.
- Colocación y movimiento rechazan superposiciones de cuerpos, además de orificios ocupados. Los archivos guardados no se reescriben automáticamente; una advertencia permite corregir sus montajes.
- Motor: rotor visible y sentido derivado del signo de la corriente del solver. Movimiento reducido conserva indicador estático. No se inventan RPM ni un modelo mecánico de carga.
- Pulsadores: prioridad de interacción durante Simular y liberación al perder captura. Acceso directo a la fuente cuando la simulación no tiene alimentación.
- Móvil horizontal: las puntas sin conectar se guardan cuando el instrumento está reducido; no capturan toques durante colocación, retirada o movimiento de vista.

## Verificación

- npm install: 0 vulnerabilidades. npm run check y npm run build: correctos.
- verify-laboratory.mjs: 38/38 pruebas del modelo, incluyendo redes, puente H, mediciones y etiquetas.
- verify-proto-2.2.7.cjs: geometría de cuerpos y plantillas; Chromium y WebKit en 393 y 820 px. Arrastre del instrumento, ambas puntas sobre resistencia, lectura 1,000 kΩ, pulsadores y ambos sentidos del motor; etiquetas sin intersección.
- Chromium usa gestos táctiles CDP mantenidos; WebKit combina emulación móvil y arrastres de mouse. No constituye prueba en dispositivos físicos.
- verify-proto-placement-2.2.5.cjs: 6 combinaciones de motor de navegador y dimensiones, incluida horizontal 852 × 393.
- verify-panel-drag-2.2.4.cjs: 4 combinaciones, carcasa libre y puntas conectadas fijas.
- verify-mobile-lab-2.2.2.cjs: soldadura y desplazamiento, puntas táctiles de temperatura y panel, medición y libreta.

Capturas comparables en qa/proto-2.2.7/ y qa/panel-drag-2.2.4/. Sin cambios en los inventarios ni correspondencias eléctricas del panel.

## Publicación

- https://modo-lab.vercel.app/
- READY: dpl_4PmnET9MSnA1NoZoMMSF8KUaVotj.
- Se repiten las pruebas de instrumentos y motor sobre el alias público.
