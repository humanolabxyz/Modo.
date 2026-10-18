# Modo móvil y PWA de PanelLab — diseño

Fecha: 2026-10-14 · Proyecto: `PanelLab-INACAP` (Astro + React)

## Problema

Con el diagrama abierto en móvil, el header apila topbar, título, barra de trabajo, buscador y controles de simulación. El diagrama ocupa un bloque fijo (`position:fixed`, ~38 dvh) y el banco queda en una franja pequeña. En horizontal, buscador y selectores flotan sobre los módulos. El layout actual son varias capas de `@media` con alturas calculadas a mano en `src/styles/diagram-layout.css` y `src/styles/canvas.css`.

## Objetivos

1. Con el diagrama abierto en móvil, liberar espacio del header y adaptar todo a formato móvil.
2. Mejorar el modo vertical (el que mejor funciona para trabajar).
3. Mejorar el modo horizontal sin solapamientos.
4. Instalable como PWA (pantalla completa, sin barra del navegador, offline).
5. Rendimiento fluido en móvil: pan, zoom y pinch sin tirones; arrastrar la hoja sin tirones.

## No objetivos

- No cambiar lógica de práctica, cables, simulación ni modelo de datos.
- No cambiar el layout de escritorio (> 900 px de ancho y alto > 600 px).
- No desplegar (regla de `AGENTS.md`).

## Enfoque elegido

Capa móvil propia: un hook de detección, una hoja arrastrable que envuelve el `DiagramPane` existente y un `mobile.css` cargado al final. Se descartó seguir parchando los `@media` actuales (frágil) y duplicar el árbol de componentes (duplica la lógica de `App.tsx`).

## Diseño

### 1. Detección — `src/hooks/useCompactLayout.ts`

Devuelve `{compact, portrait}` con `matchMedia`:
- `compact`: `(max-width:900px)` o `(max-height:600px) and (max-width:1000px)`.
- `portrait`: `(orientation:portrait)`.

`App.tsx` añade al contenedor `.app-shell` las clases `is-compact`, `is-portrait` o `is-landscape`, y `diagram-open` cuando `showDiagram` es verdadero. En escritorio no se añade ninguna.

### 2. Header mínimo (compacto)

Una fila de ~48 px (más `env(safe-area-inset-top)`) con: `⌂` Inicio · `Banco` / `Cerrar diagrama` · `Simular 24 V` (con su indicador) · `Cables N` · `⋯`.

El menú `⋯` (hoja/popover) contiene: buscador de bornes, «Ver módulo de cerca», opciones de práctica (modo, mostrar/ocultar cables, exportar, filtros), ayuda. El buscador se muestra como icono de lupa que se expande al tocarlo. Se reutilizan los mismos elementos del DOM y los mismos estados (`query`, `matches`, `focus`, `pick`); solo cambia su contenedor y posicionamiento por CSS/JSX condicional.

El mismo header mínimo se usa con el diagrama cerrado en modo compacto.

### 3. Vertical con diagrama abierto — hoja inferior

- El banco (`.stage-wrap`) ocupa de la parte inferior del header hasta la parte superior de la hoja.
- El diagrama es una hoja anclada abajo con tres posiciones: **cerrada** (solo el asa/cabecera visible), **mitad** (~48 dvh) y **casi completa** (calc(100dvh − header − 8px)).
- Se arrastra por el asa y la cabecera con Pointer Events. Al soltar, se ajusta a la posición más cercana, teniendo en cuenta la velocidad. Un toque en el asa alterna entre cerrada y mitad.
- Los tabs Todo/Potencia/Mando y la barra de ruta quedan fijos dentro de la hoja; el cuerpo hace scroll vertical (`touch-action:pan-y`) sin arrastrar la hoja.
- `Ampliar diagrama` abre la hoja en «casi completa» (en lugar del modo `editor-reading`, que en compacto se desactiva).
- `ToolDock`, el zoom y el mensaje de conexión se posicionan relativos a la altura visible del banco mediante una variable CSS `--sheet-h`, actualizada durante el arrastre, para no quedar tapados.
- Con la hoja en «casi completa», el banco se atenúa y no recibe toques.

### 4. Horizontal con diagrama abierto

- Diagrama como columna izquierda de `min(38vw, 360px)` y altura completa. Banco a la derecha.
- Sin barra superior. Controles flotantes compactos (`⌂`, `⋯`, `24 V`, `Cables`) en la esquina superior derecha del banco.
- Respeta `safe-area-inset-left/right` (notch).
- Herramientas y zoom dentro del área del banco.

### 5. Reglas CSS

`src/styles/mobile.css`, importado el último en `index.astro`. Todos los selectores empiezan por `.app-shell.is-compact` para ganar especificidad sobre las reglas existentes sin `!important` salvo donde ya lo haya. Sin tocar los `@media` heredados salvo que choquen. Si chocan, se limitan a `:not(.is-compact)`.

### 6. PWA

- `public/manifest.webmanifest`: `name` «PanelLab INACAP», `short_name` «PanelLab», `display: standalone`, `orientation: any`, `start_url: /?view=simulator`, `theme_color` y `background_color` `#f6f7f7`, iconos 192/512 y maskable 512.
- Iconos generados con `sharp` (ya en `node_modules`) por `scripts/make-icons.mjs` a partir del rayo de la marca (SVG). Salida en `public/icons/`. Incluye `apple-touch-icon` 180.
- `src/pages/index.astro`: `<link rel="manifest">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, `viewport-fit=cover`, registro del service worker.
- `public/sw.js`: service worker a mano, sin dependencias. Precachea shell, fuentes, `panel-model.json`, `references/`, `diagrams/`, `materiales/`. Estrategia: navegación network-first con caída a caché; estáticos cache-first. El nombre de caché lleva una versión que `scripts/stamp-sw.mjs` sustituye en cada build (paso posterior a `astro build`).
- `vercel.json`: `Cache-Control: no-cache` para `/sw.js` y `/manifest.webmanifest`; `immutable` para `/icons/*`.
- Safe areas: `padding` con `env(safe-area-inset-*)` en header, hoja y herramientas.

### 7. Rendimiento en móvil

Causas medidas en el código actual:

1. **Filtros SVG en cada fotograma.** `Board.tsx` aplica `feDropShadow` (`softDrop`, `moduleShadow`) y `feGaussianBlur` (`pilotGlow`) a las caras de módulo, dispositivos y pilotos. Con cada cambio de `viewBox` (pan, pinch, animación de 210 ms) el navegador vuelve a rasterizar esos filtros. Los pilotos con `opacity=0` siguen pagando el filtro.
2. **Re-render de toda `App` en cada `pointermove`.** `useSvgNavigation` y `Board.onMove` llaman a `setView` en cada evento; `view` vive en `App`, que re-renderiza `DiagramPane`, inspector, header, etc. (solo `Face`, `Ports`, `Labels` y `WireLayer` están en `React.memo`). El porcentaje del zoom también depende de `view.w`.
3. **`setPointer` por `pointermove`** en `Board` mientras hay un cable pendiente (un re-render del tablero por evento).
4. **Capas flotantes con `box-shadow` (74 reglas) y transiciones** sobre un lienzo que se mueve, más animaciones `infinite` (`preview-flow`, `reading-flow`) que no se pausan.
5. **Peso inicial**: ~410 KB de JS (React 215 KB + App 193 KB) y 120 KB de CSS en hidratación `client:load`; los JPG de diagramas (~350 KB c/u) se cargan sin caché offline. Es secundario frente a 1–4.

Cambios:

- **Filtros solo en reposo.** CSS: `.board-svg[data-dragging=true] [filter], .board-svg[data-animating=true] [filter]{filter:none}` (los atributos ya los pone `useSvgNavigation`). En `is-compact`, las sombras se sustituyen por un `rect` desplazado con opacidad fija (sin filtro) y `pilotGlow` solo se renderiza cuando el piloto está encendido.
- **Gestos fuera de React.** Durante arrastre y pinch, `useSvgNavigation` y `Board.onMove` escriben el `viewBox` directamente en el SVG dentro de `requestAnimationFrame` (un solo cálculo por fotograma) y llaman a `setView` una vez al soltar (y como máximo cada ~100 ms para el porcentaje de zoom). El estado `view` sigue siendo la fuente de verdad al terminar el gesto.
- **`setPointer` con rAF** (máx. uno por fotograma), y el trazo del cable pendiente se actualiza igual.
- **Aislar el árbol caro.** `DiagramPane`, `SimulatorInspector` y `ToolDock` pasan a `React.memo` con props estables (`useCallback` donde haga falta) para que no se re-rendericen con cambios de `view`. En `is-compact`, las capas flotantes usan `contain: layout paint`, sombras simples y sin transiciones de `box-shadow`.
- **Animaciones.** Pausar `preview-flow` y `reading-flow` cuando el gesto está activo o la pestaña está oculta; respetar `prefers-reduced-motion`.
- **Carga.** `<link rel="preload">` de las fuentes usadas, `loading="lazy"` y `decoding="async"` en imágenes de referencia/diagramas, y precaché del service worker para que la segunda carga sea instantánea. Si tras las mejoras el JS inicial sigue pesando, evaluar `client:visible` para `DiagramPane` en una segunda iteración (fuera de este alcance).
- **Medición antes/después.** `qa/perf-mobile.cjs`: en emulación móvil (4× CPU throttle, 390×844) ejecuta 60 movimientos de pan y un pinch sintético, y registra duración media de fotograma, long tasks (>50 ms) y número de renders de `App` (contador `data-render-count` solo en modo QA). Criterio de éxito: renders de `App` durante un pan ≤ 2 (hoy ≈ uno por evento), y sin long tasks > 100 ms durante el gesto.

### 8. Verificación

- `npm run check`, `npm run build`, `qa/perf-mobile.cjs` (antes y después).
- Los `verify:*` existentes que sigan aplicando (en particular `verify:ui`, `verify:diagram-layout`, `verify:canvas`). Si alguno asume el layout viejo en móvil, se actualiza con el cambio.
- Nuevo `qa/verify-mobile.cjs`: viewports 390×844 y 844×390 con el diagrama abierto; comprueba que el header mide ≤ 56 px, que la hoja tiene 3 posiciones, que ningún control flotante se solapa con otro, y que no hay scroll horizontal.
- Navegador integrado: capturas en ambos viewports; manifest válido y service worker registrado.
- Limitación: la instalación real como PWA solo se prueba en el iPhone del usuario.

## Riesgos

- Escribir el `viewBox` directamente durante el gesto puede desincronizar `view` y el DOM si el gesto se cancela. Mitigación: confirmar siempre con `setView` en `pointerup`/`pointercancel`.
- Quitar filtros durante el gesto produce un salto visual leve (sombras que desaparecen y vuelven). Aceptable; se comprueba en el dispositivo.
- `Board.tsx` usa un viewBox propio y `useSvgNavigation`; al cambiar la altura del banco al arrastrar la hoja, hay que comprobar que el zoom/pan no se resetea. Mitigación: la hoja cambia solo `--sheet-h` y el SVG se ajusta con `preserveAspectRatio`.
- Los gestos del banco (pan/pinch) y los de la hoja deben no competir. La hoja solo captura Pointer Events desde su asa/cabecera.
- Cachés del service worker obsoletas. Mitigación: versión por build y `skipWaiting` + `clients.claim`.
