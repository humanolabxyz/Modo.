# Ventanas y selectores — 16 de octubre de 2026

Cambios locales. La publicación sigue detenida.

## Resultado

- Una sola fila para elegir esquema y vista, con accesos a Símbolos y Cómo funciona. Se eliminan las filas de selectores y el botón para ocultarlas.
- Fichas de componentes, diccionario, recorrido, simulación, ejemplos, cables, colores, opciones, filtros, procedimientos y ayuda abren ventanas independientes del diagrama. El contenido sale mediante portal al cuerpo de la página, evitando el recorte del contenedor y la superposición de las herramientas sobre la ficha.
- Cabecera para mover, X de 44 px, desplazamiento interno del contenido, Escape para cerrar solo la ventana superior y recuperación de foco al cerrar.
- Esquina inferior derecha para cambiar tamaño conservando la proporción de la ventana. El contenido mantiene su composición y escala mediante zoom CSS; cabecera y cierre conservan su tamaño. El pie indica el porcentaje y permite volver al 100 %.
- Ajuste a los límites de la pantalla y áreas seguras al girar o abrir el teclado. Si el cambio de orientación deja el contenido demasiado pequeño, se recupera el tamaño legible de esa orientación.
- Cerrar el diagrama también cierra sus fichas y ayudas. Los desplegables anidados se cierran de forma independiente.

## Archivos

Componentes compartidos nuevos: `src/components/FloatingWindow.tsx`, `FloatingDisclosure.tsx`; estilos en `src/styles/floating-window.css`; geometría en `src/layout/scaledWindow.ts`.

Integraciones: `App.tsx`, `DiagramPane.tsx`, `CadeDiagram.tsx`, `CadeNames.tsx`, `CadeHelp.tsx`, `SimulationControls.tsx`, `CablesMenu.tsx`, `CableColorPicker.tsx`, `ProcedureTools.tsx` y `src/styles/diagram-layout.css`.

## Verificación

`npm run check` y `npm run build`. Geometría: `node qa/verify-scaled-window.mjs` y `npm run verify:float`. Modelo conservado: `npm run verify:estrella` y `npm run verify:simulation`.

Revisión en navegador de PC (1441 × 900 CSS), móvil vertical (360 × 800 CSS) y horizontal (845 × 390 CSS): arrastre con ratón, escala por esquina y teclado, límites, giro, restauración al 100 %, cierre, menús anidados y paleta de colores. PERFECTO conserva 47 conductores; Estrella-triángulo conserva 82; las 16 miniaturas del diccionario tienen encuadre válido.

Al reducir la ficha, el símbolo y la foto pasaron juntos de 150 a 116 px de alto; al ampliarla, ambos llegaron a 206 px. La X permaneció en 44 px. Sin desborde horizontal. Medidas y capturas en `ventanas/`.

La revisión móvil utiliza tamaños de navegador; no equivale a prueba en un teléfono físico. El navegador integrado no admite la inyección de eventos táctiles mediante CDP, por lo que no se presenta como verificado un arrastre táctil real.
