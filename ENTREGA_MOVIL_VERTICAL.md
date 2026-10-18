# Ventanas y móvil vertical — 16 de octubre de 2026

Cambios locales sobre la interfaz existente:

- El sombrero abre «Lecciones y práctica» como ventana independiente: se arrastra por su cabecera, se redimensiona, se cierra y permite desplazar todo el contenido. El selector ya no queda cortado por arriba en horizontal.
- La lección mantiene sus ayudas, niveles, esquema, comprobación automática y acceso a «Abrir en grande». Su contenido se desplaza dentro de la ventana. En vertical abre abajo para dejar parte del banco visible.
- Los módulos empiezan **fijos**. Junto a «Añadir panel», **Mover** habilita el arrastre y **Fijar** vuelve a bloquearlo. En móvil están dentro de **⋯ → Opciones de práctica**. Recargar vuelve a fijarlos; conserva los módulos y posiciones guardados. El bloqueo afecta al movimiento de módulos; el banco sigue respondiendo al paneo y al zoom.
- Inicio, Práctica, Estudio y Laboratorio usan controles más compactos en teléfono. En Estudio, las pestañas quedan dentro del flujo y dejan de invadir la lección. Laboratorio encuadra los esquemas y la protoboard completos en vertical; se puede acercar para trabajar.
- Las ventanas se mantienen dentro del espacio disponible sobre las herramientas. Se corrigió un desborde al crecer la lección mientras se la arrastraba durante su carga.

## Archivos

- `src/components/{App,Board,ToolDock,AddPanelMenu,FloatingWindow}.tsx`: ventanas y bloqueo de movimiento.
- `src/lab/{PanStage,BreadboardView}.tsx`: encuadre vertical.
- `src/styles/{touch-portrait,board-layout,mobile}.css`: adaptación y controles.
- `src/pages/{index,laboratorio,estudio}.astro`: aplicación de la hoja responsive.
- `qa/verify-touch-portrait.cjs`, `qa/touch-portrait/verify-rotation.cjs`, `qa/touch-portrait/verify-proto-frame.cjs`: pruebas de los cambios.
- `qa/verify-mobile.cjs`, `qa/verify-modulos-extra-ui.cjs`: actualización de pruebas para esperar la carga/animación y usar las ventanas y controles actuales.

## Verificación

- `npm install --ignore-scripts`: dependencias al día, auditoría sin vulnerabilidades.
- `npm run check` y `npm run build`.
- `npm run verify:data`, `npm run verify:wiring`, `npm run verify:simulation`, `npm run verify:float`, `node qa/verify-scaled-window.mjs`.
- `node qa/verify-touch-portrait.cjs`: ventanas, desplazamiento con eventos táctiles, ayudas, paneo con módulos fijos, movimiento habilitado y añadir módulos en 320×740, 360×780, 390×844, 430×932, 844×390 y 1440×900. Revisión adicional de las cuatro áreas en 320, 390, 430 y 1440 px y de los cinco modos de Laboratorio. Sin errores de navegador ni desbordamiento de página.
- `node qa/touch-portrait/verify-rotation.cjs`: redimensionar/restablecer, teclado, Escape y giro vertical-horizontal-vertical.
- `node qa/touch-portrait/verify-proto-frame.cjs`: ambos extremos de la protoboard visibles al abrir en 320 y 390 px.
- Pruebas existentes de móvil: barra, diagrama en vertical/horizontal y persistencia por orientación.
- `npm run verify:modulos-extra-ui`: pasó la prueba completa de añadir/reubicar módulos, persistencia y cables, lecciones y avance automático, ayudas, esquema grande, ejemplos de marcha/paro e inversión de giro y tamaño del multímetro. Informe: `qa/modulos-extra/ui-verification.json`.

Para las pruebas de navegador existentes: `$env:PANELLAB_URL='http://127.0.0.1:4325/'`.

Pruebas táctiles emuladas en Chromium. Pendiente la comprobación en un teléfono físico. No se publicó el cambio.

## Capturas

Comparación del selector en horizontal:

Antes: [menú recortado](qa/touch-portrait/before-844.png).

Después: [ventana desplazable](qa/touch-portrait/picker-844.png).

Otros resultados: [lección vertical](qa/touch-portrait/lesson-390.png), [Estudio vertical](qa/touch-portrait/current-study.png), [Laboratorio vertical](qa/touch-portrait/current-lab.png), [protoboard encuadrada](qa/touch-portrait/lab-Protoboard-390.png), [controles en escritorio](qa/touch-portrait/panel-1440.png).

Resultados detallados: `qa/touch-portrait/results.json`. Copias previas de las fuentes principales: `qa/touch-portrait/before-source/`.
