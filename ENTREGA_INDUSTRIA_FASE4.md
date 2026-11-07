# ENTREGA — modo. Industria · Fase 4 (v2.11.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `docs/industria/FASE1_AUDITORIA.md`, `ENTREGA_INDUSTRIA_FASE2.md`, `ENTREGA_INDUSTRIA_FASE3.md`.

## Qué incluye

La biblioteca deja de ser una lista de prueba y pasa a ser un **catálogo trazable**, con piezas que ya tienen terminales para el cableado de la fase 5.

- **Biblioteca**: búsqueda (sin tildes, por palabras, también por terminal), filtro por las diez familias del brief (las vacías, deshabilitadas con conteo), estado visible en cada pieza y botón «Datos» (descripción, medidas de ejemplo, terminales y procedencia).
- **Catálogo genérico (11 piezas)**: bloque, placa de montaje, riel DIN, aparato modular, interruptor automático 1P y 3P, contactor 3P, borne de paso, fuente CC, PLC compacto y motor trifásico.
- **Terminales** con el marcado habitual (1/2, 3/4, 5/6, A1/A2, 13/14, L/N, L+/M, DI/DO, U1/V1/W1, PE), con tipo de conexión (potencia, control, señal, tierra).
- **Inspector**: nombre del tipo, estado y lista de terminales del componente.
- Las piezas de riel nacen a la altura del riel; todas se montan con el mismo motor de la fase 3.

## Trazabilidad (regla central)

- **Ningún ítem es de un fabricante**: no hay marcas, referencias ni valores eléctricos o mecánicos de productos reales. Las medidas son de ejemplo y se muestran así.
- Estados: `generic` («Genérico · no verificado»), `unverified`, `verified`. Un ítem solo puede ser `verified` con `source` (datasheet, norma, catálogo, medición o proyecto) **y** fecha de contraste; `verify-industria-catalog.mjs` lo exige y también que hoy no haya ninguno `verified`.
- Las descripciones no pueden contener magnitudes como «24 V» o «10 A» (la prueba lo comprueba).
- El marcado de terminales sigue la convención habitual de la aparamenta de baja tensión (IEC 60947 / EN 50005). **No se contrastó con el texto de la norma**; por eso los ítems siguen como genéricos y el texto lo dice.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/catalog/items.ts` | Los 11 ítems (geometría, anclajes, terminales, estado, procedencia). Es el único lugar donde se añaden piezas. |
| `src/industria/catalog/search.ts` | Familias, `fold` (sin tildes), `searchItems`, `countByFamily`. |
| `src/industria/build/shapes.ts` | Tipos (`ShapeDef` con terminales, estado y fuente) y acceso (`shapeOf`, `listShapes`); lee del catálogo. Una definición desconocida se dibuja como bloque `unverified` sin fallar. |
| `src/industria/IndustriaApp.tsx`, `src/styles/industria.css` | Panel Piezas con búsqueda, familias, estado y datos; inspector con terminales. |

El modelo del proyecto no cambió: guarda solo el `definitionId`; los datos del catálogo no se copian dentro del proyecto. Los ids de la fase 3 (`generico`, `placa`, `riel`, `aparato-din`) se conservan.

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-catalog.mjs` (Node) | 9 bloques OK: ids únicos, familias válidas, trazabilidad, sin magnitudes comerciales, anclajes, terminales dentro de la pieza, los 7 aparatos de riel se montan sobre el riel, motor sobre su base, búsqueda, conteos, compatibilidad |
| `qa/verify-industria-catalog-ui.cjs` (navegador, build de producción con su CSP) | 8 comprobaciones OK: estado en todas, búsqueda con tildes y por terminal, aviso sin resultados, familias, «Datos», colocar con inspector, recarga, tablet sin desbordes, cero errores de consola/JS/CSP/HTTP |
| Regresión: `verify-industria-build.mjs` (18), `verify-industria-model.mjs` (39), `verify-industria-builder.cjs` (12), `verify-industria-shell.cjs` (12) | OK |

Los fallos antiguos de otras pruebas (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual que en la fase 2 y no se relanzaron.

## No verificado / pendiente

- Ningún ítem está verificado: la fase 4 da la **infraestructura** (estado, fuente, fecha) pero el contenido verificado exige documentos de fabricante o normas que no están en el repositorio. Cuando existan, se añaden con su `source` y pasan a `verified`.
- Faltan piezas en las familias Neumática, Hidráulica, Procesos industriales, Instrumentación y sensores, Robótica industrial y Medición y diagnóstico: se muestran vacías a propósito.
- Los terminales todavía no se pueden cablear (fase 5); no hay vista «Tablero» con sus terminales dibujados.
- Teléfono y tablet reales no probados; en el panel Piezas estrecho (≈210 px) los nombres largos se parten en dos líneas.
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → Piezas → buscar «contactor» → «Datos» → Colocar → Propiedades (estado y terminales). Para armar un tablero: Placa, Riel y varios aparatos de riel, arrastrando cada uno hasta su anclaje.
