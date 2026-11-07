# ENTREGA — modo. Industria · Fase 3 (v2.10.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `docs/industria/FASE1_AUDITORIA.md`, `ENTREGA_INDUSTRIA_FASE2.md`.

## Qué incluye

El escenario 3D deja de ser una maqueta y pasa a ser un **constructor**: se arrastran piezas, se acercan a anclajes, se ve una vista previa alineada y se montan sobre el modelo compartido de la fase 2.

- **Arrastre** con ratón o dedo (eventos de puntero) sobre el plano de la pieza; la cámara no se mueve mientras se arrastra. Mayús sube o baja la pieza. Esc cancela sin cambiar nada.
- **Anclajes** visibles (verde = recibe, azul = se monta) en la pieza seleccionada y en todas mientras se arrastra.
- **Vista previa translúcida** de la pose final con un tirador punteado y el punto de acople, antes de soltar. El anclaje candidato también se publica en `data-snap` del canvas (sirve a las pruebas y a la accesibilidad).
- **Alineación**: la normal del hijo queda opuesta a la del anfitrión (giro mínimo), el giro alrededor de la normal se ajusta al múltiplo de 90° más cercano y la pieza **desliza** sobre el riel o la cara dentro de sus límites (pasos de 5 mm).
- **Montar = un paso de historial**: pose + montaje se aplican juntos; Deshacer/Rehacer los revierten juntos.
- **Soltar** solo quita el montaje (pose, id y conexiones se conservan). Una pieza montada no se arrastra; mover o girar su soporte arrastra todo lo montado encima, de forma rígida.
- **Girar 90°** (botón, inspector y tecla R) e **Imán** (rejilla de 5 cm al soltar piezas sueltas; los anclajes funcionan siempre; la preferencia se guarda en el estado de UI, no en el proyecto).
- **Interferencias**: se permiten, pero la pieza se pinta de rojo mientras se arrastra y, al soltar, un aviso nombra con qué se superpone. Lo unido por un montaje directo no cuenta.
- **Consistencia**: `mountProblems()` detecta un montaje cuya geometría ya no coincide (p. ej. al editar poses a mano).
- **Simular** protege la estructura: no se arrastra, gira ni suelta nada.
- Panel Piezas con 4 familias **genéricas de prueba**; el inspector indica a qué está montada cada pieza.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/build/shapes.ts` | Formas y anclajes de prueba (`generico`, `placa`, `riel`, `aparato-din`). Normales, giro de referencia, `multi` y `slide`. Reemplazable en la fase 4 sin tocar el motor. |
| `src/industria/build/snap.ts` | Puro: `findSnapCandidates` (alineación, giro a 90°, deslizamiento y recorte, sin ciclos), `movedPoses` (grupo rígido), `overlapsOf` (OBB), `mountProblems`, `snapToGrid`. |
| `src/industria/build/commands.ts` | `moveEntity`, `rotateEntity`, `snapMount` sobre el modelo compartido (usa `mount` de la fase 2). |
| `src/industria/scene/IndustriaCanvas.tsx` | Arrastre, vista previa, puntos de anclaje. No decide nada: llama a funciones puras y entrega el resultado con `onDrop`. |
| `src/industria/model/ui.ts` | `magnet` en el estado de UI (guardado aparte del proyecto). |

El modelo sigue separando **montaje** (físico) de **conexión** (eléctrica) y **asociación** (lógica): esta fase solo toca montajes y poses.

**Reutilizado de Robótica:** la matemática de cuaterniones (`robotics/project/math.ts`) y el patrón de candidatos de unión por anclajes compatibles. **Duplicado a propósito:** el teorema del eje separador (OBB), ~10 líneas, porque importar `interference.ts` arrastraría el catálogo de piezas de Robótica al paquete de Industria (anotado en el código). Lo que Robótica no tenía y aquí se añade: vista previa translúcida, alineación de giro y deslizamiento sobre anfitriones lineales.

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-build.mjs` (Node) | 18 bloques OK: normales, snap, giro arbitrario, alcance, deslizamiento y recorte, anclajes `multi`, rejilla, grupos rígidos, soltar, desalineación, ciclos, bloque sobre bloque, interferencias, eliminar soporte, serialización |
| `qa/verify-industria-builder.cjs` (ratón real, build de producción con su CSP) | 12 comprobaciones OK: vista previa y Esc, montar sobre el riel, deshacer/rehacer en un paso, la pieza montada no se arrastra, mover la placa arrastra el grupo, Soltar, giro (botón y R), imán, aviso de superposición, Simular protege, recarga conserva, tablet sin desbordes, cero errores de consola/JS/CSP/HTTP |
| `qa/verify-industria-model.mjs` y `qa/verify-industria-shell.cjs` (regresión fase 2) | 39 bloques y 12 comprobaciones OK |
| Robótica: `verify:robotics-project`, `-assembly`, `-interaction`, `-circuit` | OK (no se tocó `src/robotics`) |

Los fallos antiguos de otras pruebas (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:cabinet-*`, `verify:meter-parity`, `verify:robotics-ui`, `verify:security`) siguen igual que en la fase 2 y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet **reales**: el arrastre con dedo se probó con eventos de puntero del navegador, no con un dedo; solo hay emulación de tablet sin desbordes. En teléfono el panel Piezas sigue cerrado por defecto.
- Arrastrar fuera de una pieza movible (o sobre una montada) orbita la cámara; no hay aún un aviso que explique por qué una pieza montada no se mueve.
- Con Estructura e Inspector abiertos a la vez en pantallas bajas, el inspector tapa parte de la lista (las ventanas se mueven y recuerdan su lugar).
- El Inspector edita posición pero no ángulos; el giro se hace en pasos de 90° (R). Rotación libre y gizmo, con la fase siguiente.
- Las formas y medidas son genéricas de prueba, **no** especificaciones de productos. Sin catálogo ni valores eléctricos hasta la fase 4. Esta entrega no despliega nada.
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → Piezas → colocar «Placa de montaje», «Riel DIN» y «Aparato para riel» → arrastrar el riel hasta la cara de la placa y el aparato hasta el riel (aparece la vista previa) → Propiedades → Soltar → Deshacer.
