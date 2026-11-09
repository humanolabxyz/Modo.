# modo. Agro · Fase 1 — Terreno 3D navegable y selección

Estado: implementada y verificada (ver «Pruebas»). Sin guardado local todavía (Fase 2): el mundo se conserva exportándolo.

## Qué se puede hacer
- Recorrer un terreno de **100 ha** (1000 × 1000 m, celdas de 2 m) con tres cámaras: **Órbita**, **Estratégica** y **Caminar** (WASD, Shift corre, arrastrar para mirar). Cada cámara recuerda su posición.
- **Seleccionar** un punto (clic) y consultar **cota, pendiente y coordenadas** del puntero y de la selección. Los valores salen de la malla de alturas, no de un dibujo.
- **Editar el relieve** con tres pinceles (Subir, Bajar, Nivelar), radio 2–120 m e intensidad configurable. Un trazo arrastrado se deshace de una vez; **Deshacer/Rehacer** (botones, Ctrl+Z, Ctrl+Y) devuelven el terreno exacto.
- **Minimapa** con relieve sombreado y la posición y dirección de la cámara; pulsar mueve la cámara. Se puede ocultar.
- **Archivo:** exportar el mundo (`.modoagro.json`, con las ediciones de terreno), abrirlo de nuevo, o generar un terreno nuevo. Un archivo de otro módulo se rechaza sin tocar el terreno actual.

## Arquitectura (render y datos separados)
| Capa | Ruta | Notas |
|---|---|---|
| Ruido determinista | `src/agro/terrain/noise.ts` | Solo `+ − ×`, `Math.floor`, `Math.imul`: misma semilla → mismo relieve |
| Malla de alturas | `src/agro/terrain/heightfield.ts` | Base procedural + `applyEdit`; cota bilineal, pendiente, normales, suma de verificación |
| Modelo editable | `src/agro/terrain/model.ts` | Ediciones como deltas, trazos, deshacer/rehacer, versión por chunk |
| Picking | `src/agro/terrain/raycast.ts` | Marcha analítica contra la malla (≈0,03 ms por rayo); no usa raycast de mallas |
| Chunks y LOD | `src/agro/terrain/chunks.ts` | 10 × 10 chunks de 100 m; 3 LOD (51², 26², 11² vértices) con faldas contra grietas |
| Minimapa | `src/agro/terrain/minimap.ts` | Relieve sombreado en píxeles |
| Escena | `src/agro/scene/AgroCanvas.tsx`, `TerrainMesh.tsx` | React Three Fiber, `frameloop="demand"` (continuo solo al caminar), carga diferida |
| Interfaz | `src/agro/AgroApp.tsx`, `ui/Minimap.tsx`, `src/styles/agro.css` | Workspace con barra, herramientas flotantes, lectura y minimapa |

El mapa **no se guarda entero**: `Terrain` conserva semilla, tamaño y `edits[]`; al abrir se regenera la base y se reaplican las ediciones en orden. Semántica de las ediciones: `raise/lower` → `amount` = metros en el centro; `level` → `amount` = cota objetivo (m). Atenuación suave `(1 − t²)²`.

## Reutilizado
Contratos de la Fase 0 (`WorldProject`, validación, `exportWorld`/`parseWorldText`), patrón de carga diferida y de página de Industria, tokens visuales de `modo-soft-ui`. **No se duplicó ningún motor**: la Fase 1 no necesita PLC, cableado ni simulación. No se tocó `src/industria/` ni `src/robotics/`.

## Decisiones
- **Sin Rapier ni WebAssembly:** el picking y la caminata usan la malla de alturas; la CSP de `/agro/` sigue estricta.
- **Sin sombras proyectadas sobre el terreno** en esta fase (coste en 100 ha); iluminación hemisférica + sol direccional + cielo.
- **Colores por vértice** (arena, tierra, roca por pendiente y altura, matorral tenue) en vez de texturas: sin descargas y sin repetición visible. El estilo definitivo del terreno llega con el kit artístico.
- `astro.config.mjs`: `/agro/` añadido a `heavyPages` para que sus fragmentos de three no entren al precaché de las demás páginas.
- Determinismo: igual que se acordó, **mismo navegador y misma versión**. El ruido evita `sin/cos/exp` justamente para que el terreno sea idéntico en la práctica en cualquier navegador; las pendientes en pantalla usan `Math.atan` (solo se muestran).

## Pendientes conocidos
- Caminar es solo en escritorio (teclado); en táctil se mira arrastrando pero no hay joystick.
- La colisión de la cámara con el suelo es un mínimo de 2 m en órbita; no hay colisión con objetos (aún no existen).
- Presupuesto medido en el navegador sin GPU (SwiftShader): ≈ 77 000 triángulos en órbita y ≈ 36 000 en estratégica. Los FPS reales hay que medirlos en el equipo de referencia y en una tablet.
- El minimapa se redibuja con un retardo de 180 ms tras editar.

## Pruebas
`npm run verify:agro` (modelo de la Fase 0 + terreno: 67 + 39 comprobaciones) y `npm run verify:agro-ui` (14 bloques de interfaz con ratón y teclado reales, móvil y Home).
