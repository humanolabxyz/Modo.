# Ventilador del motor en móvil/tablet y ventanas del simulador

Cambio local sobre PanelLab INACAP, 17 de octubre de 2026. No se ha desplegado.

## Qué pasaba

1. **Ventilador roto en móvil y tablet.** El rotor del motor era HTML (`<div>`) dentro de un `<foreignObject>` del SVG, con una animación CSS y `will-change: transform`. En navegadores móviles ese contenido no sigue las transformaciones del tablero: al mover o ampliar el panel el ventilador se descolocaba y se agrandaba.
2. **Ventanitas fijas.** El **Estado de energía** (FUERZA / CONTROL / MOTOR / cables con corriente) eran píldoras fijas encima del tablero, sin poder moverlas ni ajustarlas, y tapaban módulos y pulsadores. El **inspector de bornes y cables** era un panel fijo a la derecha.

## Qué cambió

- `src/components/Board.tsx` y `src/styles/board-layout.css`: el rotor ahora es SVG puro (un grupo dentro de `translate(eje)` que gira sobre su origen). Sin `foreignObject` ni `will-change`, así sigue el zoom y el arrastre en cualquier navegador.
- `src/components/PowerStatus.tsx`: es una ventana (`FloatingWindow`). Se mueve por la cabecera, se ajusta de tamaño y se oculta. Al ocultarla queda un botón **Estado** abajo a la izquierda para reabrirla. En pantallas estrechas se abre acoplada abajo, para no tapar los módulos.
- `src/components/SimulatorInspector.tsx`: el inspector también es una ventana. Conserva su contenido, `aria-label="Inspector de bornes"` y el botón «Cerrar inspector».
- `src/components/FloatingWindow.tsx`: nueva propiedad `passive` para ventanas de estado. No toman el foco al abrirse, no responden a Escape y no cuentan para decidir qué ventana cierra Escape.

## Comprobación

- `npm run check` y `npm run build`: correctos.
- Prueba propia (4 tamaños: tablet vertical 820×1180, tablet horizontal 1180×820, móvil 390×844 y escritorio 1440×900): la ventana de estado y el inspector se mueven, se ajustan, se cierran y se reabren; el rotor es SVG, gira, su eje no se desplaza y no hay errores de consola. Resultado: **todas pasaron**.
- `qa/verify-runtime-animation.cjs` comprobaba que el rotor fuera HTML (`xhtml`). Lo actualicé para exigir que sea un grupo SVG y que no esté dentro de un `foreignObject`; con eso pasa, incluido el giro continuo y la pausa al desplazar el panel.
- Pruebas existentes que pasan con el cambio: `verify-mobile`, `verify-assessment-windows` (390×844, 844×390 y 1440×900), `verify-assessment-window-inputs`, `verify-float` y `verify-scaled-window`.
- Pruebas existentes que **ya fallaban antes** del cambio, en el mismo punto exacto con la versión anterior de la app: `verify-canvas`, `verify-clean-interface`, `verify-practice`, `verify-simulation-ui` y `verify-modulos-extra-ui`. Quedaron desactualizadas respecto a la interfaz actual (esperan controles que ahora están en otro lugar) y no llegan a ejercitar estas ventanas. Conviene actualizarlas aparte.

## Pendiente

- No se pudo reproducir el fallo original en el Chromium del escritorio emulado: ocurre en navegadores móviles reales. La causa está identificada y el rotor ya no usa la técnica que lo provoca, pero falta confirmarlo **en el teléfono y la tablet físicos**.
- La ventana de estado no recuerda su posición al detener y reanudar la simulación (se vuelve a colocar). El diagrama sí guarda la suya.
- Otras superficies del simulador siguen siendo barras o avisos fijos, por diseño: barra de herramientas, zoom, avisos temporales y chip de «Cable seleccionado». Si alguna de esas también debe ser ventana, indícalo.
