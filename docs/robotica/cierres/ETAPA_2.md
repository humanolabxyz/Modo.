# Cierre de Etapa 2 — Constructor 3D y ensamblaje

**Estado:** IMPLEMENTADA (sin la tarea opcional 2.5). Probada en escritorio, tablet y teléfono **emulados**; el gizmo y el arrastre desde el catálogo **no** se probaron con dedos reales.
**Fecha:** 29/10/2026 · **Rama:** `robotica/etapa-1` (la etapa 2 continúa sobre ella, no se creó otra rama) · **Commits:** ver al final.
**Aprobación:** el usuario pidió «sigue con la siguiente etapa» el 29/10/2026, tras ver la pizarra de la etapa 1 en el navegador. Quedaron **sin resolver** D-04/D-06 (recomendados en el informe de la etapa 1), D-09, D-10 y D-11; no bloquean esta etapa (el portapilas es solo una pieza mecánica). Sigue sin publicarse la 2.6.0 y sin push ni despliegue.

## Evidencia

### Archivos creados / modificados
| Ruta | Qué hace |
| --- | --- |
| `src/robotics/catalog/types.ts` · `index.ts` | Contrato del catálogo + **10 piezas** (chasis 2WD, motor DC TT, rueda 65 mm, rueda loca, Arduino UNO R3, driver L298N, HC-SR04, portapilas 4×AA, soporte del sensor, soporte genérico) con pines reales, anclajes, masa y `dimensionsSource` honesto; `searchCatalog` (sin tildes, por categoría) y `catalogShape` para el validador. |
| `src/robotics/project/math.ts` | Cuaterniones y transformaciones rígidas puras (sin three). |
| `src/robotics/project/commands.ts` | Operaciones **puras e inmutables**: `addPart`, `removeParts`, `moveParts`/`setPartTransform` (arrastran a los hijos), `attach`/`detach`, `duplicateParts`, `setGroup`/`expandGroups`, `setLocked`, `renamePart`, `setPartProp`, `anchorWorld`, `closure`, `centroid`. |
| `src/robotics/build/interference.ts` | Interferencia por **OBB (SAT, 15 ejes)**, candidatos de unión a ≤ 15 mm y `placementCheck` (por qué no se puede soltar una pieza). |
| `src/robotics/project/validate.ts` · `library.ts` | El validador ahora comprueba que cada `pinId`/`anchorId` exista **en la definición de esa instancia**, que una pieza tenga un solo padre y que no haya ciclos; la biblioteca valida contra el catálogo al leer e importar. |
| `src/robotics/build/PartMesh.tsx` | Geometría procedural de las 10 piezas, pines visibles como marcas, contorno de selección (verde) e interferencia (rojo) que no tapa los pines, fantasma de inserción. |
| `src/robotics/build/BuildCanvas.tsx` | Piezas reales, **gizmo mover/rotar** (`TransformControls`) con pivote visible, vista previa durante el arrastre y **un paso de historial al soltar**, imán (1/5/10 mm y 15°), puntos verdes de unión, suelo para el fantasma. Encuadrar ya no cambia el ángulo de vista. |
| `src/robotics/RoboticsApp.tsx` | Estado del constructor: herramientas Mover/Rotar/Mano, imán, arrastrar desde Piezas, deshacer/rehacer, avisos, menú contextual de pieza (Mover, Rotar, Unir, Separar de su padre, Agrupar, Duplicar, Bloquear, Encuadrar, Borrar). |
| `src/robotics/windows/BuildWindows.tsx` · `RoboticsWindows.tsx` | Ventanas **Piezas** (búsqueda, categorías, «Agregar» y arrastre), **Estructura** (árbol padre/hijo con renombrar, bloquear, separar, aviso de interferencia) y **Propiedades** (etiqueta, posición en mm, rotación en grados, bloqueo, puentes del L298N, unión, imán). |
| `src/robotics/interaction/*` | `ToolId` suma `move`/`rotate`; atajos `G`, `R`, `U`, `Ctrl+G`, `Ctrl+Mayús+G`; la barra contextual suma **Mover / Rotar / Unir**. |
| `qa/verify-robotics-assembly.mjs` · `verify-robotics-build-ui.cjs` · `qa/robotics/robot2wd.mjs` | Pruebas nuevas y un robot completo armado solo con los comandos (dato de prueba, **no** una plantilla del producto). |

### Cómo funciona lo que importa
- **Una sola fuente de verdad:** todo se guarda en `RobotProject` (`parts`, `attachments`); el lienzo solo lo dibuja. El arrastre del gizmo se calcula como un movimiento rígido sobre una copia («vista previa») y se escribe en el proyecto **una vez, al soltar**.
- **Uniones:** `attach` exige que el anclaje del padre **acepte** la etiqueta del hijo (`accepts` / `tag`), que el hijo no tenga padre, que el anclaje no esté ocupado y que no haya ciclos; luego **mueve al hijo (y a lo que cuelga de él) para que los dos anclajes coincidan**. Una rueda sobre un eje de motor es `wheel-hinge` con su eje; todo lo demás es `rigid`.
- **Mover el padre arrastra a los hijos** conservando la transformación relativa (error < 1e-6). **Mover un hijo por su cuenta lo separa** de su padre con aviso (decisión mía: una unión no admite que el hijo se salga de su anclaje; ver Desviaciones).
- **Interferencia:** solo **advierte** (contorno rojo, aviso en Propiedades, ícono en el árbol); jamás bloquea ni mueve. Dos piezas que apenas se tocan (< 1 mm) no cuentan.
- **Borrar** una pieza rompe sus uniones, cables y programa y lo dice en un aviso; las piezas bloqueadas no se borran ni se mueven.
- **Lo que ya existía no se tocó:** gestos, ventanas `passive`, proyecto, guardado, importación/exportación, CSP y caché son los de la etapa 1.

## Pruebas
| Comando | Resultado |
| --- | --- |
| `npm run check` | ✅ |
| `npm run build` | ✅ (8 páginas; el chunk de Robótica pasó de 1,03 a 1,10 MB y de 271 a **291 KB gzip**, aún fuera del precache) |
| `node qa/verify-robotics-assembly.mjs` | ✅ **17 bloques**: catálogo (pines reales, GND con `internalNet`, portapilas sin pines), añadir/borrar/límite, uniones (ocupado, incompatible, ya unida, consigo misma), mover el chasis → motores y ruedas conservan su transformación relativa (**1e-6**), hijo suelto se separa, bloqueo, coordenadas absolutas, borrar el motor → sin uniones, serializar→parsear→**deep equal**, dos UNO con pines independientes, duplicar, grupos, OBB, candidatos a 15 mm, colocación y un **robot completo de 11 piezas / 10 uniones** sin interferencias con las ruedas en el suelo |
| `node qa/verify-robotics-project.mjs` · `verify-robotics-interaction.mjs` | ✅ (la de interacción suma G/R/U/Ctrl+G y que Mover/Rotar se comportan como Seleccionar en el lienzo) |
| `node qa/verify-robotics-build-ui.cjs` (build, 3 viewports + robot completo) | ✅ **36 comprobaciones**, 3 ejecuciones seguidas sin fallos, 0 errores de consola: ver «Criterios» |
| `node qa/verify-robotics-ui.cjs` (**regresión etapa 1**, ahora con piezas reales) | ✅ 61 comprobaciones, 0 errores |
| `qa/verify-approved-home.cjs` (con `SKIP_PROTECTED_HASHES=1`) · `verify-home-card-gestures.cjs` | ✅ (5 tarjetas; Chromium y WebKit) |
| `verify:float` · `verify:pwa` | ✅ |
| `qa/spikes/robotica/run-e4-offline.cjs` · `run-browser.cjs` | ✅ (Robótica abre sin conexión tras una visita; Rapier sigue corriendo con la CSP de `/robotica/` y bloqueado en `/laboratorio/`) |
| `npm run verify:lab-ui` | ❌ **falla igual antes de mis cambios** (lo comprobé construyendo el commit de respaldo `c744273` en un worktree aparte: mismo `Timeout` en `getByLabel('Poner las puntas en')`). Corrijo el informe de la etapa 1, que lo daba por pasado por haber leído mal su código de salida. |
| `npm run verify:modo` | ❌ pre-existente (selector `.modo-home`, ver etapa 1) |

## Criterios de aceptación
| Criterio | ✅ / ❌ | Evidencia |
| --- | --- | --- |
| Construir y reabrir un robot de dos ruedas | ✅ | `robot2wd.mjs` lo arma solo con `addPart`+`attach` (11 piezas, 10 uniones); se guarda, se reabre desde `localStorage`, se dibuja (screenshot `qa/robotics/e2-robot-armado.png`) y tras mover el chasis y recargar es **idéntico** (deep equal). **Armarlo a mano en la interfaz de principio a fin no está probado automáticamente**: se probó cada operación (insertar, mover, unir, borrar) por separado. |
| Mover/rotar piezas libremente; fijar motores al chasis y ruedas a sus ejes | ✅ | gizmo mover (solo en X al arrastrar el asa X) y rotar (alrededor de Y); «Unir» deja los anclajes coincidentes (1e-6); rueda→eje = `wheel-hinge` |
| Navegar sin perder selección; deshacer/rehacer | ✅* | la selección sobrevive a cámara, ventanas y deshacer (solo se descartan ids que dejaron de existir). Cada edición de Propiedades y cada arrastre del gizmo es **un** paso. *La cámara persistida no entra al historial. |
| Interferencia detectada sin forzar slots | ✅ | contorno rojo + aviso, sin bloquear ni mover; tocar no cuenta |
| Mover el chasis preserva las uniones | ✅ | 10 uniones antes y después; relativas < 1e-6 |
| **Bloquea si:** piezas se desplazan al guardar | no ocurre | deep equal tras recargar en los 3 viewports |
| **Bloquea si:** se pierden vínculos | no ocurre | idem (`attachments`) |
| **Bloquea si:** cámara y herramientas entran en conflicto | no ocurre | con el gizmo activo el gesto del lienzo no pasa a `orbiting`/`marquee` y la cámara no se mueve (comparada antes/después); el asa del gizmo se detecta con su propio rayo antes de repartir el gesto |

## Desviaciones del plan
- **Un hijo movido por su cuenta se separa de su padre** (con aviso). El plan no lo definía; dejarlo unido pero desplazado rompería la regla «los anclajes coinciden». Alternativa que queda abierta si prefieres otra: que el hijo no se pueda mover mientras esté unido.
- **`tag` añadido a `AnchorDefinition`** (el contrato solo tenía `accepts`): sin saber qué *es* un anclaje no se puede decidir quién es padre. Cambio aditivo.
- **Catálogo en un solo archivo** (`catalog/index.ts`) en vez de uno por pieza, y mallas en `build/PartMesh.tsx` en vez de `catalog/meshes/`: son 10 piezas pequeñas; separarlas habría dispersado datos sin ganancia.
- **«Unir» se ofrece al seleccionar** (no solo al soltar): los candidatos a ≤ 15 mm se calculan sobre la selección y se marcan con puntos verdes y un botón **Unir** en la barra contextual (o `U`).
- **Arrastrar desde Piezas solo con ratón/lápiz.** Con dedo el arrastre choca con el desplazamiento de la ventana; en táctil se usa **Agregar**, que coloca la pieza en el primer hueco libre del suelo.
- **El imán es absoluto** (múltiplos del paso en el mundo), no relativo al punto de partida. El paso se elige en Propiedades; el interruptor está en el dock.
- **`makeDefault` quitado de `TransformControls`:** hacía que el gizmo sustituyera a la cámara como «controles por defecto» y se perdía el arrastre; sin él drei apaga y enciende la cámara correctamente.
- **Encuadrar reescrito** (`setLookAt` conservando el ángulo): `fitToBox` de camera-controls dejaba la cámara en una vista lateral rasante con piezas planas. Arregla también «Encuadrar» de la etapa 1.
- **Quitado el modo `?debug=1` de los cubos de prueba.** `?debug=1` ahora solo expone `window.__modoRobotics` (cámara, posiciones en pantalla, asas del gizmo) para las pruebas; la prueba de la etapa 1 se migró a piezas reales. `data-inline-action` en los botones de las ventanas: sin él, una regla global de `FloatingWindow` les da ancho completo.
- **Tarea 2.5 «Proyecto de referencia» no implementada.** Es opcional y condicionada a «D aprobada»; no existe tal decisión en `03_DECISIONES_ABIERTAS.md`. El robot de `qa/robotics/robot2wd.mjs` es solo un dato de prueba.
- La etapa 2 se hizo en la **misma rama** `robotica/etapa-1` (el plan pide una rama por etapa; no creé `robotica/etapa-2` para no separar commits que dependen unos de otros). Se puede partir después.

## Riesgos abiertos · límites de fidelidad · cuestiones de UX
1. **Medidas**: solo el UNO (68,6 × 53,4 mm) y el HC-SR04 (45 × 20 × 15 mm) vienen de ficha. Chasis, motor TT, rueda, rueda loca, L298N, portapilas y soportes son **aproximados** y los marca la ventana. D-08 sigue pendiente del kit físico; **no** alimentar la física de la etapa 5 con ellas sin medir el kit.
2. **Pines**: las posiciones de los pines sobre cada pieza son aproximadas (sirven para dibujar y, en la etapa 3, para elegir pin); los **nombres** sí son los reales.
3. **Gizmo y arrastre con dedos reales: sin probar.** El teléfono se probó sin gizmo (la lámina cubre el dock). En teléfono no se puede rehacer (el botón se oculta en pantallas de ≤ 480 px; atajo `Ctrl+Mayús+Z` solo con teclado).
4. **Rotación en grados Euler XYZ**: puede mostrar valores equivalentes pero distintos (p. ej. 90° ↔ −270°) y tiene bloqueo de cardán cerca de ±90° en Y; el modelo guarda cuaterniones, así que no hay pérdida, solo la lectura.
5. **Sin escala** (por contrato, ninguna pieza escala) y **sin ajuste de orientación al unir**: solo se alinea la posición del anclaje; el usuario rota la pieza si hace falta.
6. **Rendimiento**: la interferencia es O(n²) con descarte por esferas; con el tope de 200 piezas es aceptable pero **no se midió** con 200. El lienzo sigue en bucle continuo (`frameloop="always"`).
7. **Estructura en teléfono**: abrir una ventana cierra la vista de las demás (láminas); agrupar no se probó en teléfono.
8. Las pruebas de la etapa 1 y 2 dependen de SwiftShader (software); los tiempos reales en una GPU de tablet son desconocidos (ver etapa 1).

## Próxima etapa sugerida (sin iniciarla) y decisiones que necesitan aprobación
- **Etapa 3 — Cableado** (`etapas/ETAPA_3_CABLEADO.md`): requiere **D-11 (alimentación)** resuelta con el kit físico; sin ella no se inicia. Reutiliza los pines por nombre y `findInterferences`/`anchorWorld`.
- Antes: decidir **D-04 y D-06** (recomendaciones en `cierres/ETAPA_1.md`), medir en tablet real con el banco LAN, validar etapas 1 y 2 y decidir si se publica la **2.6.0 Beta** (D-10, solo con tu aprobación explícita).
- Confirmar qué hacer con el hijo movido por su cuenta (separar vs. impedir) y si quieres la plantilla opcional «Robot 2 ruedas» (2.5).
