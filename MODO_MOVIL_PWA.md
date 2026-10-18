# Modo móvil, rendimiento y PWA

Fecha: 14 de octubre de 2026. Spec: `docs/superpowers/specs/2026-10-14-modo-movil-pwa-design.md`. Plan: `docs/superpowers/plans/2026-10-14-modo-movil-pwa.md`.

## Qué cambió

**Header mínimo.** En pantallas compactas (ancho ≤ 900 px, o alto ≤ 600 px en horizontal) los controles flotantes dispersos se sustituyen por una sola fila de 48 px: Inicio · Banco / Diagrama · Simular 24 V · Cables · `⋯`. El menú `⋯` contiene el buscador de bornes, «Ver módulo de cerca», el modo de práctica, mostrar/ocultar cables, ayuda, exportar y filtros.

**Diagrama como ventana flotante, en vertical y en horizontal.** El diagrama es una ventana sobre el banco, que ahora usa toda la pantalla bajo la barra. Se mueve arrastrando su cabecera («Diagrama») y se redimensiona desde las esquinas inferiores (con marcas visibles) y los bordes izquierdo, derecho e inferior; para cambiar el borde superior se mueve la ventana y se estira desde abajo. Siempre queda dentro de la pantalla, bajo la barra y fuera de la muesca. Cada orientación recuerda su propia posición y tamaño entre sesiones; un doble toque en la cabecera la devuelve a su sitio original. «Ampliar diagrama» la maximiza y «Volver al banco» recupera tu ventana. Por defecto nace en la mitad inferior en vertical y a la izquierda en horizontal. La barra de herramientas del banco (cable, borrar, deshacer) siempre queda por encima de ella; el zoom queda por debajo para no tapar sus botones.

**El banco se encuadra en lo que la ventana no tapa.** Al abrir o cerrar el diagrama, girar el teléfono, pulsar «Ajustar al tablero» o «Ver módulo de cerca», el banco se centra y se escala en la franja libre (arriba de la ventana en vertical, a su derecha en horizontal). Si mueves o amplías el banco a mano, no se vuelve a encuadrar solo.

**Rendimiento.** Arrastrar, hacer zoom con la rueda y el pellizco ya no re-renderizan `App` por cada evento: el `viewBox` se escribe directo y el estado de React se sincroniza una vez al terminar el gesto. Durante el gesto se apagan los filtros SVG (sombras y brillos), que eran lo más caro de repintar. Además: fuentes precargadas, imágenes con carga diferida, sin transiciones de sombra en móvil y sin el brillo de los pilotos apagados.

**PWA.** `manifest.webmanifest` (pantalla completa, orientación libre, iconos 192/512/maskable), meta tags de iOS, `viewport-fit=cover` con márgenes seguros y un service worker que guarda la app, el modelo, las fotos y los diagramas para usarla sin conexión. La versión de la caché se renueva sola en cada build.

## Cómo instalarla

- iPhone: Safari → Compartir → «Añadir a pantalla de inicio».
- Android: menú ⋮ de Chrome → «Instalar app».

## Medición (CPU 4× más lenta, 390×844)

| | Renders de `App` | p95 de fotograma | Tareas largas |
|---|---|---|---|
| Pan de 60 movimientos, antes | 60 | 150 ms | 60 (8 276 ms) |
| Pan de 60 movimientos, después | 1 | 17 ms | 1 (155 ms) |
| Zoom con rueda ×30, antes | 30 | 217 ms | 68 (6 614 ms) |
| Zoom con rueda ×30, después | 2 | 33 ms | 2 (181 ms) |

Datos en `qa/perf-baseline.txt` y `qa/perf-after.txt`. Se miden con `npm run perf:mobile` (el contador de renders solo existe en modo desarrollo).

## Pruebas

- Nuevas: `verify:float` (geometría de la ventana flotante), `verify:focus` (encuadre en la zona libre), `verify:mobile` (barra, ventana en ambas orientaciones, giro, toques reales, encuadre del banco, escritorio sin cambios), `verify:pwa` (manifest, iconos, service worker y arranque sin conexión; requiere `npm run build` y `npm run preview -- --port 4324`), `perf:mobile`.
- Barrido existente: 13 de 16 scripts `verify:*` pasan, igual que antes de empezar. Los 3 que fallan (`verify-ui`, `verify-clean-interface`, `verify-canvas`) **ya fallaban antes de este trabajo** porque buscan botones que la interfaz actual ya no tiene; el estado antes/después está en `qa/baseline-status.txt` y `qa/current-status.txt`.

## Pruebas existentes que se adaptaron (misma intención)

- `verify-practice`, `verify-cade`, `verify-learning-ui`, `verify-simulation-ui`, `verify-cable-color`, `verify-diagram-simple`: en el flujo táctil de 390×844, «Enfocar un módulo» ahora está dentro del menú `⋯`, así que primero se abre el menú.
- `verify-diagram-layout`, `verify-diagram-simple`, `verify-routes`: con la ventana flotante, «el panel cabe en pantalla» pasa a significar «cabecera y barra de ruta visibles» (la parte inferior del panel está bajo el borde por diseño y es alcanzable con scroll). Además esperan a que terminen las transiciones de la hoja y a que React aplique el cambio de tamaño; los elementos dentro de un `<details>` cerrado no cuentan como solapados.
- `verify-cade`: espera 500 ms tras «Ampliar diagrama» antes de calcular las coordenadas del toque.

## Notas de diseño

- La ventana flotante no tiene movimiento por teclado: se maneja con el dedo o el ratón.

- El buscador vive dentro del menú `⋯` (el spec lo describía como una lupa expandible).
- En una primera versión el diagrama en vertical era una hoja inferior con tres posiciones; se sustituyó por la ventana libre a petición del usuario.
- En móvil se oculta el mensaje de atajos de teclado («C para conectar…»); los mensajes de una acción en curso se siguen mostrando.
- «Guardado local» se oculta en pantallas compactas.
- Al cruzar el umbral escritorio ↔ móvil el diagrama conserva su estado (pestaña, regiones marcadas): el árbol de React es el mismo en ambos modos.
- Tablets de 1024 px o más siguen con el diseño de escritorio.

## Pendiente

- Probar la instalación como PWA y el rendimiento en un iPhone real; aquí solo se midió con emulación.
- El despliegue lo decide el usuario (`AGENTS.md`). Tras desplegar, `qa/verify-vercel.mjs` volverá a coincidir con los archivos de `public/` (hoy fallaría porque hay archivos nuevos: manifest, `sw.js` e iconos).
- Respaldo previo a los cambios: `../_backup-pre-movil`.
