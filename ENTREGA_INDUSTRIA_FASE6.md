# ENTREGA — modo. Industria · Fase 6 (v2.13.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Anteriores: `ENTREGA_INDUSTRIA_FASE2.md` a `FASE5.md` y `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

- **Ejecutar / Pausar / Detener** (barra superior, antes deshabilitados). El indicador pasa a DETENIDO / EJECUTANDO / PAUSADO. Ejecutar entra en Simulación (estructura protegida); Construir detiene la simulación; Detener apaga todo y suelta los mandos.
- **Simulación lógica**: la red trifásica emite potencial; se propaga por cables, puentes y contactos cerrados; de ahí se deducen estados: fuente CC con salida, contactor excitado, piloto encendido, motor alimentado.
- **Mandos**: interruptores (se cierran/abren) y pulsadores (mientras se mantienen). Se operan en el panel **Instrumentos** o pulsando la pieza en el escenario 3D.
- **Sello / realimentación**: la evaluación parte del estado anterior, así un contacto de sello mantiene la bobina al soltar el pulsador; si el circuito oscila se avisa.
- **Visualización**: cables con tensión en naranja más gruesos (los demás en gris); piezas excitadas brillan en naranja (piloto en amarillo); contactos cerrados en verde.
- **Multímetro** (panel Instrumentos): *tensión* y *continuidad* entre dos terminales cualesquiera. Dice «sin lectura» si no hay referencia común o el circuito está abierto, y «entre fases (valor no calculado)» cuando no hay dato.
- **Avisos**: cortocircuito en la simulación (se avisa, no se dispara nada).
- **Piezas nuevas** del catálogo: pulsador NA, piloto luminoso y red trifásica (L1, L2, L3, N, PE).
- **Ejemplo de arranque directo** (menú del proyecto): 10 piezas, 7 montajes y 19 cables, construido con las mismas operaciones de montaje y cableado, sin errores de topología ni interferencias.
- **Tensión configurable** en red y fuente (inspector, solo en Construir): es un dato del proyecto que pones tú.

## Alcance honesto (léelo antes de usarlo en clase)

- **No es un cálculo eléctrico**: no hay corrientes, caídas de tensión, potencias, arranque ni protecciones. Un cortocircuito se avisa y no dispara ningún interruptor.
- **Supuestos explícitos** (también en el panel, «Qué simula y qué no», y en `SIM_ASSUMPTIONS`): el contactor se excita con cualquier tensión entre A1 y A2 (pieza genérica sin tensión de bobina); la fuente CC genera salida si recibe tensión entre L y N; el motor «alimentado» exige tres fases distintas de la misma red; no se modelan sentido de giro ni arranque.
- Los valores del multímetro son **los que configuraste** y se rotulan «valor configurado en …, no medido en un equipo real». Sin dato de tensión no se inventa ninguno.
- El catálogo sigue siendo genérico y «no verificado»: la simulación no convierte ninguna pieza en verificada.

## Arquitectura

| Archivo | Contenido |
|---|---|
| `src/industria/sim/engine.ts` | `simulate(proyecto, mandos, estadoPrevio)` → potencial por terminal, cables con tensión, estados, avisos y `measure()` del multímetro. Puro; no modifica el proyecto. |
| `src/industria/sim/examples.ts` | Ejemplo de arranque directo (colocar + montar + cablear con las operaciones del modelo). |
| `src/industria/catalog/items.ts` | `pulsador-na`, `piloto`, `red-3f`. |
| `src/industria/scene/IndustriaCanvas.tsx` | Cables y piezas con estado; operar mandos con el puntero. No decide nada. |
| `src/industria/IndustriaApp.tsx`, `model/ui.ts`, `styles/industria.css` | Controles de simulación, panel Instrumentos, inspector con tensión, ejemplo. |

El estado de la simulación (mandos, ejecución) vive en la interfaz, **no** en el proyecto: operar mandos no modifica el archivo guardado (comprobado). Se reutilizó el motor de redes y la validación de la fase 5. No se reutilizaron `solveDC` ni el multímetro del Laboratorio: resuelven circuitos con valores de componentes que el catálogo genérico no tiene, y su interfaz está atada a sus propios equipos (decisión de la auditoría de la fase 1).

## Pruebas

| Prueba | Resultado |
|---|---|
| `npm run check` y `npm run build` | OK |
| `qa/verify-industria-sim.mjs` (Node) | 15 bloques OK: ejemplo sin errores ni interferencias, apagado, QF1/QF2, pulsador → bobina → motor → piloto, sin sello, sin fuerza, cable cortado, sello con estado previo, continuidad, tensión (configurada, signo, sin referencia, sin configurar, terminal inexistente), cortocircuito, motor sin una fase, supuestos, sin efectos sobre el modelo |
| `qa/verify-industria-sim-ui.cjs` (ratón real, build de producción con su CSP) | 9 comprobaciones OK: ejemplo, Ejecutar, mandos, pulsador mantenido, estados, multímetro, clic en el 3D, Pausar/Reanudar/Detener, el proyecto guardado no cambia, Simulación no cablea, tensión configurable, tablet, cero errores de consola/JS/CSP/HTTP |
| Regresión: modelo (39), anclajes (18), catálogo (9), cableado (17), carcasa (12), constructor (12), biblioteca (8), cableado UI (10) | OK |

En `verify-industria-shell.cjs` se actualizó la aserción de la fase 2 («Ejecutar deshabilitado»), que dejó de ser cierta a propósito. Los fallos antiguos de otras pruebas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`, `verify:security`, entre otras) siguen igual y no se relanzaron.

## No verificado / pendiente

- Teléfono y tablet reales; el pulsador mantenido con dedo (pointer events) no se probó en un dispositivo táctil.
- Sin PLC programable ni HMI (fase 7), sin diagnóstico de fallas (fase 8) ni modos Libre/Aprendizaje/Prueba aplicados (fase 9).
- Sin animación del motor (solo color) ni sonido.
- No hay contactos NC, relés temporizados ni térmicos; el contactor solo tiene 3 principales y 1 auxiliar NA.
- Sigue pendiente decidir si `/industria/` va detrás de la contraseña de la Beta. Esta entrega no despliega nada.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` → menú del proyecto → «Ejemplo: arranque directo» → Instrumentos → Ejecutar → cerrar QF1 y QF2 → mantener S1 → medir `Red 3F · L1` contra `Red 3F · N` con el multímetro.
