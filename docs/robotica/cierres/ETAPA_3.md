# Cierre de Etapa 3 — Cableado, electrónica y diagnóstico

**Estado:** IMPLEMENTADA, con una limitación declarada: los puntos de control de los cables se editan con números, **no** arrastrándolos en 3D. Probada en escritorio, tablet y teléfono **emulados**; el cableado con dedos reales no se probó.
**Fecha:** 29/10/2026 · **Rama:** `robotica/etapa-1` (sigue la misma rama) · **Commits:** ver al final.
**Aprobación:** el usuario pidió «sigue con la etapa 3» el 29/10/2026. La etapa exigía D-11 resuelta «tras verificar el kit físico»; como el kit no se conoce, el usuario eligió la opción **«Batería configurable»** (pregunta del 29/10): el portapilas tiene terminales + y − y un **voltaje editable (por defecto 6 V, 4×AA)** marcado como *supuesto a verificar con el kit*. **D-11 sigue abierta en lo que importa**: cambia un número, no código, cuando se conozca el kit. Sin push, sin despliegue, 2.6.0 sin publicar.

## Evidencia

### Archivos creados / modificados
| Ruta | Qué hace |
| --- | --- |
| `src/robotics/catalog/index.ts` | Portapilas con pines **B+ / B−** y propiedad `voltage` (1,5–24 V, 6 por defecto); el UNO suma la propiedad `usb` («alimentada por USB virtual», apagada por defecto). |
| `src/robotics/circuit/graph.ts` | **Union-find** de `instanceId:pinId` con los cables, los `internalNet` de cada definición (los tres GND del UNO) y los **puentes ENA/ENB del L298N** (propiedades → unión interna ENA/ENB↔+5V). Ids de red estables (la clave menor). |
| `src/robotics/circuit/solve.ts` | Tensiones **estáticas** por red con fuentes ideales: batería → estado de UNO / L298N / HC-SR04 → fuentes derivadas (5 V del UNO si arranca por VIN o USB; 5 V del regulador del L298N) hasta que no cambie nada; detecta fuentes en conflicto. `measure(a,b)`: tensión con signo, continuidad o «sin referencia común». |
| `src/robotics/circuit/diagnostics.ts` | 11 códigos de diagnóstico con los pines implicados (`refs`), `connectionLabel` y `connectionWarning` (aviso al crear un cable dudoso, sin bloquear). |
| `src/robotics/project/commands.ts` | `connect` (solo rechaza lo imposible: pin inexistente, consigo mismo, duplicado, tope), `disconnect`, `setConnectionColor`, `setConnectionRoute`, `pinWorld`. |
| `src/robotics/build/BuildCanvas.tsx` | **Pines** como puntos de tamaño constante en pantalla (11–14 px) con blanco de toque de **15 px de radio** (≥ 30 px); herramientas **Cable** y **Medir**; **cables** como tubos que pasan por las posiciones mundiales de sus pines (curva suave hacia arriba si no hay puntos); previsualización del cable a medio hacer; resaltado de pines de un diagnóstico; selección de cables. |
| `src/robotics/RoboticsApp.tsx` · `windows/BuildWindows.tsx` · `RoboticsWindows.tsx` | Dock con **Cable (W)** y **Medir (M)** y una insignia roja en Consola con el número de problemas; barra de herramienta con colores del cable / lectura del multímetro; etiqueta al pasar sobre un pin; ventana **Consola** con pestañas *Diagnóstico* (lista, resaltado, lectura, cables) y *Serie* (marcador, etapa 4); **Propiedades** muestra el panel del cable (etiqueta, color, puntos de control, borrar) y el voltaje de la batería. |
| `src/robotics/interaction/*` | `ToolId` suma `wire` y `measure`; Esc cancela primero el cable a medias (`cancel-pending`) y luego la herramienta; atajos `W`, `M`. |
| `qa/verify-robotics-circuit.mjs` · `verify-robotics-wiring-ui.cjs` · `qa/robotics/robot2wd.mjs` | Pruebas nuevas; `wireRobot2wd` cablea el robot de prueba (18 cables) como lo haría un estudiante. |

### Lo que se puede hacer ahora
- Activar **Cable** (dock o `W`): aparecen todos los pines (color por función; los ya cableados, más grandes), una etiqueta «Arduino UNO R3 1 · D5» al pasar el puntero, clic en el pin de origen → línea de previsualización → clic en el destino. **Esc** cancela el cable a medias y un segundo Esc suelta la herramienta.
- **Errores didácticos permitidos:** unir GND con +12 V, dos salidas de alimentación, un motor a un pin de señal… muestra un aviso y **crea el cable igualmente**; el diagnóstico lo explica después.
- **Mover una pieza o el chasis** arrastra los extremos de sus cables (el cable es una conexión lógica entre pines; solo su dibujo se recalcula).
- **Borrar una pieza** elimina sus cables con aviso y **deshacer** los devuelve.
- **Medir** (`M`): punta roja en un pin, negra en otro → tensión con signo, continuidad (misma red) o «sin referencia común».
- **Consola → Diagnóstico**: al pulsar un aviso se resaltan y encuadran sus pines.

### Hallazgo que afecta a D-11
Con el supuesto de **4×AA = 6 V**, el robot bien cableado **no arranca**: el Arduino UNO por VIN necesita **≥ 7 V** y el regulador del L298N también. El diagnóstico lo dice así («VIN recibe solo 6,0 V y necesita al menos 7 V»). Con 9 V todo arranca y el diagnóstico queda limpio. Esto es coherente con el hardware real (los kits de aula suelen llevar 6×AA, 2×18650 o 9 V), pero **confirma que el voltaje del kit importa**: hay que verificarlo antes de la etapa 5.

## Pruebas
| Comando | Resultado |
| --- | --- |
| `npm run check` · `npm run build` | ✅ (chunk de Robótica 1,10 MB, **300 KB gzip**; sigue fuera del precache) |
| `node qa/verify-robotics-circuit.mjs` | ✅ **10 bloques**: pin suelto no propaga; GND del UNO unidos; puentes ENA/ENB; **dos UNO no mezclan redes**; quitar un componente elimina sus cables; **batería invertida**, **GND no común**, cortos, sin alimentación (con y sin USB), motor/sensor sueltos, salida↔salida, fuentes unidas, sobretensión, puente ENA, UNO alimentado por el +5V del L298N; tensiones con 6 V y 9 V; medición; los cables siguen a los pines; serializar → parsear → idéntico (mismo diagnóstico); **el color nunca cambia el resultado** |
| `qa/verify-robotics-{project,interaction,assembly}.mjs` | ✅ (9 / — / 17 bloques) |
| `node qa/verify-robotics-wiring-ui.cjs` (build, 3 viewports + robot cableado) | ✅ **24 comprobaciones**, 0 errores: UNO D5→ENA, etiqueta exacta, previsualización, Esc, hover, mover el UNO 50 mm y el extremo del cable en D5 se mueve exactamente 50 mm, color/puntos/borrar/deshacer, borrar pieza con aviso, aviso GND↔+12 V, recargar idéntico, diagnóstico del robot (3 avisos con 6 V), resaltado, voltaje editable, multímetro |
| `qa/verify-robotics-build-ui.cjs` (**etapa 2**) · `verify-robotics-ui.cjs` (**etapa 1**) | ✅ 36 / 61 comprobaciones, 0 errores |
| `qa/verify-approved-home.cjs` (`SKIP_PROTECTED_HASHES=1`) | ⚠ **intermitente**: 1 de 7 ejecuciones se detuvo en el paso del gesto táctil («'lab' !== 'community'»); las otras 6 pasaron. No lo causa Robótica de forma evidente (el paso se repite sin cambios en el inicio desde la etapa 1), pero **no lo pude descartar** con una línea base. |
| `verify-home-card-gestures` · `verify:float` · `verify:pwa` | ✅ |
| `run-e4-offline.cjs` · `run-browser.cjs` | ✅ (sin conexión, CSP/Rapier) |
| `verify:lab-ui` · `verify:modo` | ❌ pre-existentes (ver etapas 1 y 2) |

## Criterios de aceptación
| Criterio | ✅ / ❌ | Evidencia |
| --- | --- | --- |
| Conexiones eléctricas identificables | ✅ | etiqueta «A · pin → B · pin», lista de cables en Consola, cada cable seleccionable |
| Continuidad y tensiones consultables | ✅ | multímetro: 9,00 V en la batería; B+↔+12 V = continuidad (0,00 V ✔); +12 V↔GND = 9,00 V sin continuidad; «sin referencia común» entre pines flotantes |
| Detecta alimentación ausente, polaridad y masa no compartida | ✅ | `unpowered-device`, `battery-reversed`, `ground-not-common` (+ cortos, salida↔salida, sobretensión, motor/sensor sueltos) |
| Desmontar pieza invalida sus conexiones | ✅ | borrar el UNO quita sus 12 cables; borrar el driver quita los suyos, con aviso y deshacer |
| Serialización perfecta; dos Arduino iguales no comparten pines | ✅ | deep equal; los dos UNO tienen redes y GND independientes |
| **Bloquea si:** el cable visual no coincide con la conexión lógica | no ocurre | el dibujo sale de `connections` + `pinWorld`; la prueba mide que el extremo del tubo se mueve exactamente lo que se movió el pin |
| **Bloquea si:** se mezclan instancias | no ocurre | prueba de dos UNO |

## Desviaciones del plan
- **D-11 resuelta con un supuesto** (voltaje editable, 6 V por defecto) en vez de «tras verificar el kit físico»: decisión del usuario del 29/10. No es una verificación del kit.
- **No hay `PinMarkers.tsx` ni `WireMesh.tsx`:** viven en `BuildCanvas.tsx` (`PinPoints`, `WireTube`) por compartir cámara y puntero con el resto del lienzo.
- **Puntos de control editables por número, no arrastrando.** El plan decía «editables»; implementé Agregar/Quitar punto y X/Y/Z en mm en Propiedades, sin arrastre 3D.
- **«Pin ocupado o incompatible: aviso»:** el aviso lo da `connectionWarning` al crear el cable; las incoherencias de fondo las da el diagnóstico.
- **El panel del cable no se abre solo** al crearlo (se abre con Propiedades o al elegirlo en Consola); la selección queda en el cable y su etiqueta se ve ahí.
- **Mini-ventana de diagnóstico = la ventana Consola** con pestañas (la etapa 4 usará «Serie»).
- **Zoom automático al pin: no implementado** (estaba en el análisis de UX, no en las tareas). En teléfono, con todo el robot a la vista, las cabeceras quedan a pocos píxeles: se debe acercar la cámara antes de cablear (la prueba apunta al centro del pin).
- La etapa 3 sigue en la misma rama; no hay `robotica/etapa-3`.

## Riesgos abiertos · límites de fidelidad · cuestiones de UX
1. **Solver estático, ideal:** sin corrientes, caídas ni resistencias. El L298N pierde ≈ 2 V en el puente H (documentado, no modelado); el umbral del regulador (7 V) y el del UNO (7–12 V) son los habituales, **aproximados**. Un cable «largo» no tiene resistencia. El multímetro mide tensión de fuentes ideales, no «lo que mediría un instrumento real con carga».
2. **Los motores no se modelan eléctricamente aún:** se diagnostica que estén conectados, no la polaridad ni el sentido de giro (eso depende del firmware: etapas 4–5).
3. **Reglas de diagnóstico heurísticas:** `ground-not-common` se evalúa solo entre UNO, L298N y HC-SR04 con cables de señal entre ellos; `pins-tied` considera D0–D13/A0–A5 del UNO; no hay un diagnóstico de «LED sin resistencia» ni similares porque no existen esas piezas.
4. **Pines densos:** el blanco de toque tiene 15 px de radio, pero en cabeceras de 2,54 mm a poco zoom gana **el pin más cercano** al puntero; con dedo y todo a la vista conviene acercar la cámara. Los pines ocluidos por una placa también se pueden elegir (se dibujan sin prueba de profundidad).
5. **Cableado con dedos reales: sin probar** (se probó con eventos de ratón/táctil emulados). La etiqueta al pasar no existe en táctil (el aviso del cable creado la sustituye).
6. **Rendimiento:** `pinList` recorre todas las piezas al cambiar de herramienta/proyecto y `solve`+`diagnose` se recalculan en cada cambio de cables o piezas; con ≤ 200 piezas es aceptable pero **no se midió** con 200.
7. La prueba del inicio aprobado es **intermitente** (1/7), sin causa identificada.
8. Los cables solo cambian de ruta con números; un cable cruza piezas sin esquivarlas.

## Próxima etapa sugerida (sin iniciarla) y decisiones que necesitan aprobación
- **Etapa 4 — Programación** (`etapas/ETAPA_4_PROGRAMACION.md`): CodeMirror, avr8js en el worker y `RemoteCompiler`/`HexImport`. **Antes:** decidir **D-04** (recomendada: avr8js + compilador remoto en contenedor propio + HexImport) y **D-06**, medir en tablet real, y aprobar la etapa.
- **D-11** sigue abierta: verifica el voltaje real de la batería del kit (si es 4×AA/6 V, el aula necesita 7–12 V para alimentar el UNO por VIN, o el robot se alimenta por USB/5 V).
- Pendientes heredados: D-09 (arte de la tarjeta), D-10 (publicar la 2.6.0 Beta, solo con tu aprobación), validar las etapas 1–3.
