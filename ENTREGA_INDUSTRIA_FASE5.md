# ENTREGA — modo. Industria · Fase 5 (v2.12.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `ENTREGA_INDUSTRIA_FASE2.md`, `FASE3.md`, `FASE4.md` y `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

El modelo ya tenía `connections`; esta fase le da **motor, validación y herramientas**.

- **Modo Cablear** (dock): toca un terminal de origen y otro de destino en el escenario. Los terminales se ven y se pueden pulsar «a través» de las cajas; el nombre aparece al pasar el puntero. Esc cancela el origen y luego sale del modo. Las piezas no se arrastran mientras se cablea.
- **Panel Conexiones**: formulario Desde/Hasta (alternativa accesible al ratón), lista de cables con estado y motivo, botón Desconectar por cable, resaltado de un cable en el 3D, lista de avisos y lista de redes.
- **Cables 3D**: salen hacia arriba de cada terminal y cruzan en alto; siguen a sus piezas. Color por tipo (fuerza, mando, señal, tierra); **rojo** si es inválido, **punteado** si está sin verificar; más grueso si pertenece a la pieza seleccionada.
- **Redes**: terminales unidos por cables o por puentes internos (el borne de paso une sus dos lados; los contactos que conmutan no son puentes).
- **Validación topológica**: terminal inexistente; tierra unida con algo que no es tierra (por cable o por red); conexión de proceso con un terminal eléctrico; cortocircuito línea–neutro y positivo–negativo dentro de una misma red; más de 2 cables por terminal (límite didáctico; al cablear se rechaza).
- **Estado de cada conexión** (derivado siempre del proyecto): `invalid` con motivo; `unverified` si no hay errores pero las piezas son genéricas; `valid` **solo** si las dos piezas están verificadas con fuente (hoy ninguna lo está).
- Cablear, desconectar y borrar una pieza con cables son pasos de historial; borrar una pieza sigue pidiendo confirmación y se lleva solo sus cables.
- **Cableado y montaje son independientes**: cablear no monta; soltar no desconecta.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/wiring/engine.ts` | `terminalWorld`, `buildNets`, `evaluate` (redes, avisos, estado y motivos), `withStatuses`, `cableRoute`, `connectionKindFor`. Puro. |
| `src/industria/wiring/commands.ts` | `wire` y `unwire` sobre `connect`/`disconnect` del modelo, con estados al día. |
| `src/industria/build/shapes.ts`, `catalog/items.ts` | Terminales con `role` (línea, neutro, positivo, negativo, tierra) y `bridges`; terminales movidos a la cara frontal y separados ≥ 8 mm (los de bobina del contactor se solapaban con el 5). |
| `src/industria/scene/IndustriaCanvas.tsx` | Terminales pulsables, cables y etiquetas; no decide nada. |
| `src/industria/IndustriaApp.tsx`, `model/ui.ts`, `styles/industria.css` | Modo Cablear, panel Conexiones. |

**Reutilización:** se usó el modelo `Connection` de la fase 2 y la matemática de transformaciones de Robótica. No se reutilizó el motor `solveDC` del Laboratorio (no hay datos eléctricos que resolver todavía) ni el cableado de Robótica (es de pines de microcontrolador): se evaluó y no encaja con terminales industriales genéricos; el cálculo eléctrico llega con la simulación (fase 6).

## Alcance honesto

- **No hay cálculo eléctrico**: ni tensiones, corrientes, calibres ni protecciones. Una conexión entre piezas genéricas se dice «Sin verificar» aunque sea correcta.
- Los roles de terminal (línea, neutro…) y el límite de 2 cables por terminal son **convenciones didácticas**, no datos de bornes reales.
- El tipo de cable (fuerza, mando, señal) se deduce de los terminales con una regla didáctica.

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-wiring.mjs` (Node) | 17 bloques OK: terminales en el mundo, tipos, estado sin verificar, redes con puente, cortocircuitos, tierra, límite, rechazos, terminal desconocido, desconectar y borrar, historial, serialización, «valid» solo con piezas verificadas |
| `qa/verify-industria-wiring-ui.cjs` (ratón real, build de producción con su CSP) | 10 comprobaciones OK: cablear en el 3D, Esc, cortocircuito con motivo, desconectar, tierra, límite, deshacer/rehacer/recarga, Simular protege, cableado sin montajes, cero errores de consola/JS/CSP/HTTP |
| Regresión: modelo (39), anclajes (18), catálogo (9, ahora con separación de terminales), carcasa (12), constructor (12), biblioteca (8) | OK |

Los fallos antiguos de otras pruebas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet reales: no se probó pulsar terminales con el dedo (los puntos son pequeños; con la cámara lejana hay que acercarse o usar el panel).
- Los cables son líneas de presentación: sin grosor, sin colisión ni enrutado automático por canaletas.
- El estado guardado en el archivo puede quedar desactualizado si se edita el JSON a mano; la interfaz siempre lo recalcula.
- No hay vista «Tablero» ni diagrama que dibuje estas conexiones (fase 7).
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → Piezas → colocar «Fuente de alimentación CC» y «Contactor 3P» → acercar la cámara → Cablear → tocar `L+` y luego `A1` → abrir Conexiones → unir `L` y `N` de la fuente por el contactor para ver el cortocircuito → Desconectar.
