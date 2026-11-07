# ENTREGA — modo. Industria · Fase 8 (v2.15.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `ENTREGA_INDUSTRIA_FASE2.md` a `FASE7.md` y `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

### Documentación técnica (vista Documentación)
Se **genera sola** desde el proyecto (cambia el proyecto, cambia el documento; mismos ids):
1. Lista de materiales (cantidad, pieza, familia, estado, referencias).
2. Lista de cables numerada `W001…` con desde/hasta, tipo, estado, red y notas del error si lo hay.
3. Entradas y salidas del PLC con su variable y a qué están conectadas.
4. Programa del PLC en texto.
5. Redes.
6. Avisos de topología y de programa.

Descargas: **Markdown** completo, **CSV** de materiales y de cables (UTF-8 con BOM, comillas bien escapadas) e **Imprimir** (solo el documento). Siempre lleva la advertencia: piezas genéricas sin verificar, sin referencias de fabricante, no sustituye documentación de ingeniería.

### Tablero (vista Tablero)
Alzado a escala de cada placa con su riel y sus aparatos (en el sistema de la propia placa, así que **girar la placa en 3D no cambia el alzado**). Terminal relleno = con cable, vacío = libre. Selección compartida con 3D, diagrama y demás; en simulación se iluminan los equipos activos. Los equipos con terminales que no están sobre ninguna placa se listan aparte. Las medidas son las de ejemplo del catálogo genérico (se dice en pantalla).

### Fallas y diagnóstico (panel Fallas)
- **Cinco tipos**: cable abierto, contactos que no conducen (disyuntor, contactor, pulsador), bobina abierta, piloto fundido, bobinado abierto. Solo se ofrecen a piezas compatibles. Se pueden inyectar también con la simulación en marcha, quitar de a una o todas, y marcar **ocultas**.
- **La simulación las aplica** (no modifican el diseño): por ejemplo, un cable abierto deja de conducir en la propagación y no ilumina.
- **Diagnóstico**: compara la simulación con fallas contra la misma simulación del diseño sano con los mismos mandos y señala (a) los **síntomas** (qué equipo debía responder y no lo hace) y (b) los **puntos sospechosos**: cable con tensión en un extremo y no en el otro, contactos con tensión de un lado solamente, bobina que recibe tensión y no se excita, piloto que recibe tensión y no enciende, motor con las tres fases y sin alimentación. Un contactor que no cerró porque su bobina no recibe tensión no se acusa por sus contactos (evita pistas falsas).
- **Modo Prueba**: el diagnóstico automático se desactiva y las fallas ocultas no se listan (solo se cuenta «+ n oculta(s)»). La interfaz no revela cuáles coinciden con una falla inyectada.
- Quitar un cable o un componente se lleva sus fallas; borrar un componente con fallas pide confirmación y las cuenta entre sus dependencias.

### Modelo (versión 3)
`faults` en el proyecto con migración 2→3 (las versiones 1 y 2 suben solas, también desde la biblioteca guardada). Los archivos de versión mayor se siguen rechazando.

## Alcance honesto

- El diagnóstico **solo localiza lo que el modelo simula**: no diagnostica aislamiento, sobrecarga, caídas de tensión ni nada que requiera valores eléctricos. Si el diseño sano tampoco funciona, no hay nada que comparar (lo dice).
- La documentación sale de un catálogo genérico: no hay referencias de fabricante ni datos verificados.
- Los modos Libre/Aprendizaje/Prueba aún **solo** afectan al diagnóstico automático y a la visibilidad de fallas ocultas; el resto se aplica en la fase 9.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/faults/faults.ts` | Alta/baja y validación de fallas, aplicabilidad por tipo, descripción. Puro. |
| `src/industria/faults/diagnose.ts` | `diagnose()`: síntomas y puntos sospechosos. Puro. |
| `src/industria/sim/engine.ts` | La simulación aplica las fallas; `hasPotential()`; `CLOSED_PAIRS` exportado. |
| `src/industria/docs/generate.ts` | `buildDocumentation`, `toMarkdown`, `bomCsv`, `wiresCsv`. Puro y determinista. |
| `src/industria/board/layout.ts` | `buildBoards`: alzado en milímetros. Puro. |
| `src/industria/views/{BoardView,DocsView}.tsx`, `IndustriaApp.tsx`, `model/*` | Vistas, panel Fallas, modelo v3. |

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-faults.mjs` (Node) | 15 bloques: cada tipo de falla se localiza en el lugar correcto (cable, contactor, bobina con tres síntomas y una causa, piloto, bobinado, pulsador, disyuntor), varias fallas, falla que no se manifiesta, con PLC (salida y entrada), validación, limpieza al editar, serialización y migración |
| `qa/verify-industria-docs.mjs` (Node) | 11 bloques: materiales, cables, E/S, programa, redes, avisos, Markdown y CSV, determinismo, alzado a escala sin solapes y estable al girar la placa |
| `qa/verify-industria-docs-ui.cjs` (ratón real, build de producción con su CSP) | 8 comprobaciones: tablero, documentación con descargas reales, inyectar falla, diagnóstico con el PLC, modo Prueba, quitar/deshacer/recargar, tablet, cero errores de consola/JS/CSP/HTTP |
| Regresión: modelo (39, ahora v3), anclajes (18), catálogo (9), cableado (17), simulación (15), PLC (13), diagrama (8), carcasa (12, actualizada: Tablero y Documentación son reales), constructor (12), biblioteca (8), cableado UI (10), simulación UI (9), vistas UI (9) | OK |

Los fallos antiguos de otras pruebas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet reales; la impresión se probó solo como acción del navegador (no se revisó el resultado en papel ni en PDF).
- En el Tablero, los rótulos de los aparatos más angostos (17,5 mm) quedan recortados y la placa completa necesita desplazamiento vertical.
- El alzado no dibuja cables ni canaletas, solo terminales con o sin cable.
- Falta aplicar los modos Libre/Aprendizaje/Prueba al resto de la interfaz (fase 9), las pruebas finales de rendimiento y el cierre (fase 10).
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → menú del proyecto → «Ejemplo: marcha/paro con PLC» → Tablero y Documentación → Fallas: «Cable abierto» en `PLC · DO0 → KM1 · A1` → Ejecutar → QF1, QF2 y S1 en Instrumentos → Diagnosticar.
