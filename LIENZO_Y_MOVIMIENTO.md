# PanelLab · lienzo y movimiento

Actualización local del 14 de octubre de 2026.

## Abrir la pantalla de trabajo

http://127.0.0.1:4322/?view=simulator&revision=lienzo

La práctica ocupa toda la ventana. **Banco**, **Leer diagrama** y **Comparar** son vistas del mismo espacio. El inspector, la búsqueda, los ajustes, las ayudas y la barra flotan por encima; abrir una ficha no reduce el área del banco ni cambia sus coordenadas.

En Inicio se conserva el acceso a comenzar, continuar e importar la práctica. No se cambió el guardado ni se borraron conexiones.

## Navegación

| Gesto o control | Resultado |
|---|---|
| Rueda / desplazamiento de trackpad | Mover el lienzo |
| Ctrl o Cmd + rueda | Zoom alrededor del punto bajo el cursor |
| Espacio + arrastrar | Mover desde cualquier parte del dibujo |
| Botón central + arrastrar | Mover sin cambiar de herramienta |
| Mano / arrastrar el fondo | Desplazamiento directo |
| Dos dedos en pantalla táctil | Ampliar o reducir, conservando el centro del gesto |
| +, − y ajustar | Cambiar de escala o recuperar el encuadre inicial |
| Flechas e Inicio sobre el banco / CADe | Desplazar y ajustar mediante teclado |

El banco, PERFECTO y la imagen propia comparten el movimiento. La guía básica también admite rueda, Espacio, botón central, pinza y controles de zoom. Las pulsaciones sobre bornes o líneas conservan su función de selección: desplazarse no crea cables.

## Movimiento y microinteracciones

- Zoom, enfoque de módulo y cambios de encuadre interpolados durante aproximadamente 210 ms, sin rebote.
- El arrastre responde directamente al puntero; se puede interrumpir una transición y comenzar a mover desde la posición visible.
- Fichas, menús, avisos y respuestas aparecen con transiciones breves.
- Herramienta activa, presión de botones, foco, selección de bornes y aparición de cables tienen respuestas visuales.
- El cable provisional sigue el cursor mientras eliges el destino.
- Los retos básicos acercan el elemento correspondiente; en móvil también se centra el tramo de PERFECTO para evitar que quede debajo de la consigna.
- Se respeta **reducir movimiento**: se desactivan las animaciones, conservando los controles.

La animación de la cámara escribe el viewBox del SVG sin volver a renderizar el inventario en cada fotograma. Las caras, rótulos, bornes y cables del banco se reutilizan mientras cambia la cámara. No se establece una cifra de FPS: no se hizo una medición de rendimiento en el dispositivo final.

## Paneles flotantes

En escritorio, las fichas se abren al lado derecho y se cierran con ×. Los controles de PERFECTO se pueden plegar. **Comparar** abre una referencia flotante sobre el banco sin encogerlo.

En móvil se compactan Inicio y Opciones, y las fichas tienen altura limitada con desplazamiento interno. Los retos fotográficos no abren automáticamente una ficha que tape los bornes. Para comprobar un paso propio después de comparar su imagen, vuelve a **Banco**.

## Pruebas

Pasaron TypeScript, build y las comprobaciones del modelo: **7 módulos / 108 bornes**. También pasaron la regresión de los 108 bornes por clic, los nueve retos fotográficos, la práctica completa, el trazado de imágenes, los diez retos básicos y las 47 líneas / doce preguntas de PERFECTO.

La prueba nueva comprueba:

- Banco y diagrama ocupan exactamente el viewport, sin scroll de página.
- Abrir y cerrar el inspector conserva el tamaño del SVG.
- El zoom tiene un estado intermedio y final estable.
- Ctrl + rueda conserva el punto bajo el cursor.
- Rueda, Espacio y botón central desplazan sin conectar.
- Conectar, retirar y deshacer siguen funcionando.
- 1920, 1440, 768, 390 y 360 px sin desbordamiento, con los controles principales dentro de pantalla.
- Pinza táctil emulada sin conexiones accidentales.
- Preferencia de movimiento reducido.

Evidencia nueva: `qa/lienzo/verification.json`. Regresiones: `qa/verification.json`, `qa/fase2/ui-verification.json`, `qa/cade/verification.json` y `qa/herramientas/verification.json`. El tacto se probó con Chromium emulado; falta comprobación en un teléfono físico.

## Resultado visual

- `qa/lienzo/banco-desktop.png`
- `qa/lienzo/inspector-flotante.png`
- `qa/lienzo/diagrama-desktop.png`
- `qa/lienzo/banco-mobile.png`
- `qa/lienzo/diagrama-mobile.png`
- **Vídeo de interacciones reales:** `qa/lienzo/movimiento.webm`
- Comparación anterior: `qa/lienzo/antes-banco.png` y `antes-diagrama.png`.

## Archivos

Nuevo estilo del lienzo: `src/styles/canvas.css`. Navegación compartida: `src/hooks/useSvgNavigation.ts`. Ajustes en `App.tsx`, `Board.tsx`, `CadeDiagram.tsx`, `DiagramReader.tsx`, `DiagramPane.tsx` y la entrada Astro. Prueba nueva: `qa/verify-canvas.cjs`; captura de movimiento: `qa/record-canvas.cjs`. Se adaptaron las regresiones a las transiciones y a las fichas superpuestas.

Comandos: `npm run check`, `npm run build`, `npm run verify:data`, `npm run verify:wiring`, `npm run verify:ui`, `npm run verify:practice`, `npm run verify:reading`, `npm run verify:cade`, `npm run verify:canvas`.

No se añadieron dependencias ni se desplegó. Los datos del banco y el archivo original de CADe se conservan. El cambio corresponde a la interfaz y la navegación; no añade comportamiento eléctrico.
