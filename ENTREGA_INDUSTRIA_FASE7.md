# ENTREGA — modo. Industria · Fase 7 (v2.14.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `ENTREGA_INDUSTRIA_FASE2.md` a `FASE6.md` y `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

Las vistas **Diagramas**, **PLC** y **HMI** dejan de ser esqueletos y leen/escriben el **mismo proyecto** (mismos ids que en 3D).

### Diagramas
- Esquema funcional generado del modelo: un **símbolo por componente con terminales** (la placa y los rieles no aparecen) y **un cable por conexión**, en ángulo recto, con la misma lógica de colores del 3D (rojo = inválido, punteado = sin verificar, naranja = con tensión en simulación).
- Cada terminal es una patilla con su nombre; el lado depende del grupo (superior, inferior, bobina a la derecha, auxiliar y alimentación a la izquierda).
- Arrastrar un símbolo guarda su posición en `symbols` (independiente de la pose 3D, con Deshacer/Rehacer); «Ordenar» recoloca todo por filas (red → protección → mando → maniobra → motor) en un solo paso; zoom 50–200 %; pulsar un cable lo resalta; pulsar un símbolo lo selecciona en todo el proyecto. En simulación se operan interruptores y pulsadores desde el propio diagrama.
- **Símbolos genéricos de bloque; la simbología normalizada (IEC 60617) no está incluida** (se dice en pantalla).

### PLC en escalera
- Variables de E/S asociadas a terminales DI/DO mediante asociaciones `plc-tag` del modelo, y variables internas. Renombrar una variable arrastra el programa y los widgets que la usan.
- Líneas con contactos NA/NC en serie (rama) y en paralelo (ramas), bobinas de salida, activar (S) y desactivar (R). Edición completa con límites y validación; avisos de variables sin definir, bobina que escribe una entrada y líneas sin contactos.
- Ciclo de escaneo en la simulación: el PLC solo funciona **alimentado** (L+ y M); lee sus entradas desde los cables, evalúa las líneas en orden y activa sus salidas (una salida activa se modela como DO unida a su L+). Si pierde la alimentación pierde sus variables. Los contactos y líneas que conducen se iluminan.

### HMI
- Pantalla de operador con pilotos, botones (mientras se mantienen), interruptores y textos. Los botones e interruptores solo escriben **variables internas** del PLC; los pilotos leen cualquier variable.

### Modelo (versión 2) y ejemplo
- El proyecto pasa a la **versión 2** con `plc` y `hmi`. Hay migración 1→2 y los proyectos y bibliotecas guardados antes se actualizan solos (probado, también desde la biblioteca de `localStorage`). Un archivo de versión mayor se sigue rechazando.
- Eliminar un PLC con programa o widgets pide confirmación y la lista de dependencias incluye «línea(s) de programa o widget(s) de HMI».
- Ejemplo **«marcha/paro con PLC»** (menú del proyecto): fuente, PLC, bornes, pulsadores y contactor sobre dos rieles, motor y red, con programa de sello y pantalla de HMI.

## Alcance honesto

- La escalera es **booleana**: sin temporizadores, contadores, números ni otros lenguajes (IEC 61131-3).
- «Salida tipo fuente conectada a L+» y «entrada activa si hay potencial respecto a M» son **asunciones didácticas** del PLC genérico; el catálogo sigue siendo «Genérico · no verificado» y no representa ningún controlador real.
- Los pulsadores de ejemplo son NA (en un paro real se usaría NC por seguridad); el ejemplo usa el contacto NC en el programa, no en el cableado.
- El diagrama es un esquema funcional, no un plano de ingeniería.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/model/{types,validate,defaults,commands}.ts` | `plc`, `hmi`, límites, validación, migración 1→2, dependencias. |
| `src/industria/plc/program.ts` | Variables, escaneo, comprobación y edición de programa; HMI. Puro. |
| `src/industria/sim/engine.ts` | El escaneo del PLC entra en el punto fijo de la simulación; estado previo de PLC. |
| `src/industria/diagram/{layout,commands}.ts` | Símbolos, patillas, disposición automática y rutas; mover y ordenar. Puro. |
| `src/industria/views/{DiagramView,PlcView,HmiView}.tsx` | Las tres vistas. |
| `src/industria/sim/examples.ts` | Ejemplo marcha/paro con PLC. |

Se reutilizó el motor de redes y la simulación de las fases 5 y 6. No se reutilizó el PLC del Laboratorio (8 entradas y 4 salidas fijas, acoplado a su equipo; decisión de la auditoría).

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-plc.mjs` (Node) | 13 bloques: escaneo, edición, renombrado, comprobación, HMI, eliminar PLC, **migración v1→v2**, ejemplo, marcha/paro con sello, HMI, pérdida de alimentación |
| `qa/verify-industria-diagram.mjs` (Node) | 8 bloques: patillas por terminal, solo lo eléctrico, disposición sin solapes, cables en ángulo recto, posiciones independientes del 3D, «Ordenar» |
| `qa/verify-industria-views-ui.cjs` (ratón real, build de producción con su CSP) | 9 comprobaciones: ejemplo, diagrama con ids compartidos, mover símbolos con Deshacer, edición de PLC y variables, HMI, simulación con S1 físico + sello + HMI, protección en Simulación, recarga, tablet, cero errores de consola/JS/CSP/HTTP |
| Regresión: modelo (39, actualizado a v2), anclajes (18), catálogo (9), cableado (17), simulación (15), carcasa (12, actualizada: Diagramas/PLC/HMI son reales), constructor (12), biblioteca (8), cableado UI (10), simulación UI (9) | OK |

Los fallos antiguos de otras pruebas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet reales; los botones de HMI mantenidos con dedo no se probaron en un dispositivo táctil.
- Las vistas **Tablero** y **Documentación** siguen siendo esqueletos (fase 8). Falta diagnóstico de fallas (fase 8) y los modos Libre/Aprendizaje/Prueba aplicados (fase 9).
- Los cables del diagrama se cruzan sobre símbolos en esquemas densos; no hay enrutado que los evite.
- Sin impresión/exportación del diagrama ni páginas múltiples (el modelo ya admite `page`, la interfaz usa la página 1).
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → menú del proyecto → «Ejemplo: marcha/paro con PLC» → Diagramas → Ejecutar → pulsar QF1 y QF2 en el diagrama → mantener S1 → PLC (la línea se ilumina) → HMI (PARO y MARCHA).
