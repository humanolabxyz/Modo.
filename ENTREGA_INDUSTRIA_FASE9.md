# ENTREGA — modo. Industria · Fase 9 (v2.16.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `ENTREGA_INDUSTRIA_FASE2.md` a `FASE8.md` y `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

### Los tres modos dejan de ser una etiqueta
Libre, Aprendizaje y Prueba son una **política pedagógica del proyecto** (distinta de Construir/Simular, que es estado de interfaz). La tabla vive en `model/modes.ts` y la UI la consulta:

| | Libre | Aprendizaje | Prueba |
|---|---|---|---|
| Pasos de la actividad | a mano («Comprobar ahora») | ✓/✗ en vivo | ocultos hasta entregar |
| Pistas | no | sí | no |
| Cable que rompe una regla | se crea y se marca | **se rechaza con el motivo** | se crea (el alumno decide) |
| Avisos de topología, programa y simulación | sí | sí | **no** |
| Diagnóstico automático | sí | sí | **no** |
| Fallas ocultas | se listan | se listan | **no se listan** (solo «+ n oculta(s)») |
| Entregar | no | no | **sí; bloquea el proyecto** |

Salir de Prueba pide confirmación.

### Actividades (panel Actividad)
Cuatro, cada una con un proyecto de partida preparado y comprobaciones que miran el **resultado** (montaje, redes y comportamiento simulado), no una solución única:
1. **Montar un tablero**: riel sobre la placa, QF1 y KM1 sobre el riel, sin atravesarse, montajes coherentes.
2. **Cablear un arranque directo**: el motor gira al pulsar S1 y no sin pulsar, el piloto enciende, tierra conectada y sin errores de topología.
3. **Localizar una falla**: falla oculta de cable; se responde el elemento y el tipo con listas de opciones.
4. **Programar marcha/paro con PLC**: el tablero ya está cableado; hay que asociar variables y programar arranque, sello y paro.

Se inician en Aprendizaje o como Prueba (crean un proyecto nuevo y abren el panel). En Prueba, **Entregar** calcula «n de m», congela el resultado, bloquea la edición y permite descargar un **informe** (.md); **Reabrir** libera el proyecto sin perder nada.

### Modelo (versión 4)
`lesson` (actividad, respuestas, entrega) con migración 3→4 (v1–v3 suben solas, también desde la biblioteca guardada). Una entrega o respuesta corrupta se rechaza al cargar.

### Arreglo de interfaz
Las ventanas flotantes tenían altura libre y el panel Piezas llegaba al borde inferior tapando los botones de la izquierda del dock (que creció con «Actividad»). Ahora su altura máxima deja libre el dock (verificado a 1440×900, 1280×720 y 1024×768). Lo detectó la prueba del constructor.

## Alcance honesto

- Las comprobaciones evalúan piezas **genéricas** y comportamiento **simulado**: no certifican competencias ni equipos reales.
- **No hay cuentas ni servidor**: la entrega queda en el proyecto (almacenamiento local o archivo exportado). Quien abre el proyecto puede reabrirla; «Prueba» es una disciplina de uso, no una protección contra trampas.
- Las fallas ocultas se ocultan en la interfaz, pero están en el archivo del proyecto (quien lo abra con un editor de texto las ve).

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/model/modes.ts` | `MODE_POLICY` / `policyOf`. Puro. |
| `src/industria/activities/activities.ts` | Actividades, comprobaciones, `runSeq` (secuencias con estado), iniciar, responder, entregar, reabrir, informe. Puro. |
| `src/industria/model/{types,validate,defaults}.ts` | `lesson`, validación y migración 3→4. |
| `src/industria/IndustriaApp.tsx`, `views/{PlcView,DocsView}.tsx`, `styles/industria.css` | Panel Actividad, cableado estricto en Aprendizaje, avisos condicionados por modo, bloqueo por entrega, altura de ventanas. |

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-activities.mjs` (Node) | 11 bloques: las 4 actividades parten sin resolver; la **solución correcta pasa**, las parciales y las incorrectas fallan (tablero con choque, solo fuerza, cortocircuito, sin tierra, sello sin /STOP, variable sin definir); otro cableado y otro programa correctos también pasan; entrega, informe, reapertura, validación al cargar; política de modos |
| `qa/verify-industria-modes-ui.cjs` (ratón real, build de producción con su CSP) | 10 comprobaciones: panel por modo, Aprendizaje en vivo con pistas, rechazo de cable erróneo con motivo, solución importada 5 de 5, Prueba sin ayudas con falla oculta, entrega 2 de 2 con informe, bloqueo y reapertura, confirmación al salir de Prueba, Libre manual, recarga, tablet, cero errores de consola/JS/CSP/HTTP |
| Regresión: modelo (39, v4), anclajes (18), catálogo (9), cableado (17), simulación (15), PLC (13), diagrama (8), fallas (15), documentación (11), carcasa (12), constructor (12), biblioteca (8), cableado UI (10), simulación UI (9), vistas UI (9), documentación UI (8) | OK |

Los fallos antiguos de otras pruebas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet reales.
- Las ventanas del lado derecho (Actividad, Estructura, Instrumentos…) siguen apilándose entre sí; se mueven con el ratón.
- Solo hay cuatro actividades; no hay editor de actividades ni importación de actividades propias.
- No hay accesibilidad auditada con lector de pantalla (solo roles y etiquetas reales comprobados por la prueba).
- Faltan la **fase 10**: pruebas finales, optimización (rendimiento, tamaño del paquete, uso sin conexión) y cierre de la versión.
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → Actividad → «Aprender» en «Cablear un arranque directo» → Conexiones: probar tierra con un terminal de fuerza (se rechaza) → luego «Prueba» en «Localizar una falla» → medir con Instrumentos → responder → Entregar → Informe.
