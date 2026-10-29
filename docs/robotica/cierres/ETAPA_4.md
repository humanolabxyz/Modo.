# Cierre de Etapa 4 — Programación Arduino y coordinación temporal

**Estado:** IMPLEMENTADA, con **tres límites declarados**: (1) el servicio de compilación solo existe en el servidor de **desarrollo** local (no se desplegó nada); (2) el HC-SR04 funciona solo en banco de prueba (distancia fija configurable), como pedía la etapa; (3) el reloj virtual a ×4 no se alcanza en este equipo con el lienzo dibujando (la interfaz lo dice con «LENTA»). Probada en Chromium con la GPU simulada; **no** en una tablet real.
**Etapa aprobada por el usuario el 29/10/2026; D-06 (Rapier) confirmada.**
**Fecha:** 29/10/2026 · **Rama:** `robotica/etapa-1` (sigue la misma) · **Commits:** ver al final.
**Aprobación y suposiciones:** el usuario escribió «ya ahora sigue con la etapa 4» (29/10/2026), después de que le dejé la recomendación de D-04 (avr8js + compilador remoto + importar .hex) y D-06 (Rapier). Tomé esa frase como aprobación de la etapa y de esa recomendación. **El despliegue del compilador NO está autorizado y no se hizo** (la etapa lo exigía; `AGENTS.md` lo prohíbe sin permiso): dónde alojarlo sigue siendo una decisión pendiente. Sin push, sin despliegue, 2.6.0 sin publicar.

## Evidencia

### Archivos creados / modificados
| Ruta | Qué hace |
| --- | --- |
| `src/robotics/mcu/avr/{runtime,pins,hex}.ts` | **Emulación real del ATmega328P** con `avr8js` 0.21.1: carga Intel HEX (validando sumas de control y los 32 KB de flash), mapa D0–D13/A0–A5 ↔ puertos B/C/D, Timer0/1/2, USART y ADC. Entrega flancos de pines con su instante virtual exacto (µs), el modo de cada pin y los bytes del puerto serie. |
| `src/robotics/mcu/compiler/{remote,hexImport,state,translate}.ts` | `RemoteCompiler` (`POST /api/compile`, mismo origen), **importar .hex** (sin conexión), estado del artefacto (**sin compilar / compilado / hay que recompilar / importado**) por `sourceHash` SHA-256 y **traducción de los errores de avr-gcc a español** conservando la línea. |
| `src/robotics/mcu/sha256.ts` | SHA-256 síncrono en TypeScript (`crypto.subtle` no existe en `http` de la red local). |
| `src/robotics/circuit/dynamic.ts` | **Circuito con tiempo**: análisis nodal por pasos con la tensión PROMEDIO de cada pin del UNO, batería/reguladores con resistencia interna, resistencias, motores (8 Ω) y LED lineales por tramos (Vf + 5 Ω); el **L298N** reproduce su tabla de verdad con ENA/ENB como ciclo útil. |
| `src/robotics/sim/{coordinator,protocol,sim.worker,useRobotSim}.ts` | **Coordinador** (clase síncrona y pura, probada en Node) + **worker** con presupuesto de CPU por cuadro + hook con **ejecutar / pausar / detener**, velocidad ×0,25–×4, latido y `terminate()`. |
| `src/robotics/windows/{CodeEditor,CodePanel}.tsx` | Ventana **Programación**: CodeMirror 6 (C++, números de línea, marcas de error), placa de destino, Compilar, Importar .hex, errores con línea clicable y la tabla «qué soporta el emulador». |
| `src/robotics/windows/BuildWindows.tsx` | Consola → **Serie y estado**: monitor serie y estado real (placa alimentada, pines, LED con mA, motores con tensión, sensor con ecos). |
| `src/robotics/catalog/index.ts` | **LED 5 mm** (color) y **Resistencia** (Ω) —categoría nueva «Pasivos»— y la propiedad `testDistance` del HC-SR04. |
| `src/robotics/build/PartMesh.tsx` · `BuildCanvas.tsx` | El LED del lienzo 3D **brilla según el modelo** (emisión del material = brillo calculado por el circuito); sin programa no hay brillo. |
| `src/robotics/project/commands.ts` | `ensureFirmware`, `setFirmwareSource`, `setFirmwareArtifact` y la plantilla `setup()/loop()`. |
| `scripts/robotica-compile-service.mjs` · `astro.config.mjs` | Servicio de compilación **solo para `astro dev`** (127.0.0.1): comprueba origen y cabecera propia, lista cerrada de `#include`, sin ensamblador, 64 KB, 30 s, 2 en paralelo, 30/min, una caché de núcleo por petición. Avisos de licencia de CodeMirror y avr8js; los chunks nuevos quedan **fuera del precache**. |
| `qa/fixtures/robotica/` | **11 `.hex` versionados** + sus `.ino` + `bad_syntax.errors.json` (salida real de avr-gcc) + README de procedencia y licencia. |
| `qa/verify-robotics-mcu.mjs` · `verify-robotics-code-ui.cjs` · `verify-robotics-offline-run.cjs` | Pruebas nuevas. |

### Cómo funciona la cadena (sin trucos)
`sketch (.ino)` → compilar (`avr-gcc`) o importar `.hex` → **avr8js** ejecuta el programa a 16 MHz virtuales → flancos de pines → el coordinador mide el **ciclo útil real** de cada pin en ventanas de 2 ms → **solver nodal** del circuito del proyecto (cables reales, batería, puentes del L298N) → LED / motores / sensor → tensiones de los pines de entrada y del ADC → vuelven al programa. El LED solo enciende si hay un camino eléctrico completo; el HC-SR04 solo responde si tiene 5 V, masa común con la placa y TRIG/ECHO cableados, y su ECHO dura `2·d/343 s` medido por `pulseIn` con el reloj virtual.

### Números
| Medida | Resultado |
| --- | --- |
| Velocidad del coordinador completo (Node, sin dibujar) | **2,3×** (Blink con LED) · 2,4× (HC-SR04) · 3,4× (puente H) · 3,8× (`while(1)`) el tiempo real (Ryzen 5 3600; `results/e4-velocidad-coordinador.json`) |
| Velocidad dentro de la página (Chromium, lienzo 3D dibujando con GPU simulada) | **≈ 1,2×**: a ×1 el reloj avanza 2,0 s por 2 s reales; a ×4 solo 2,4 s → la interfaz marca **«LENTA»** (honesto: no finge ×4) |
| HC-SR04 en banco (0,30 m / 0,10 m / 1,00 m) | **≈ 1 749 µs / 583 µs / 5 831 µs** (tolerancia de la prueba ±40 µs) |
| PWM | `analogWrite(9,128)` → ciclo útil **0,50 ±0,01** |
| Brillo del LED con 5 V, pin 25 Ω, 220 Ω y LED 5 Ω | ≈ 12,4 mA → brillo 0,83 |
| Compilación (servicio local, caché aislada por petición) | ≈ 3,4–3,7 s por sketch (hasta 6,8 s la primera) |
| Peso (gzip) | `RoboticsApp` 312 KB (con avr8js; era 300 KB) · **editor 165 KB (carga diferida)** · **worker 18,7 KB** |

## Pruebas
| Comando | Resultado |
| --- | --- |
| `npm run check` · `npm run build` | ✅ |
| `node qa/verify-robotics-mcu.mjs` | ✅ **13 bloques**: Blink ±1 ms y `delay(200)`; el LED sigue a D13 (brillo ≈ 0,83), **sin cable del cátodo no enciende**, sin resistencia → sobrecorriente; sin batería / con 6 V el UNO no corre (con USB virtual sí); PWM 0,5; **puente H**: dirección, PWM, ENA=0 y cable del motor retirado; **HC-SR04** (distancias, > 4 m, sin VCC / TRIG / GND); `while(1)` no cuelga (10 s virtuales); serie y `analogRead`; SHA-256; estado del artefacto y modo sin conexión; HexImport; errores reales traducidos; `RemoteCompiler` con `fetch` simulado |
| `node qa/verify-robotics-code-ui.cjs` (**dev**, con compilador local) | ✅ **12 comprobaciones**, 0 errores: plantilla y placa de destino, **Ctrl+Z del editor no deshace el proyecto** y la rueda no toca la cámara, ▶ sin compilar explica qué falta, error de sintaxis en español con **línea 3 y 5 marcadas**, compilar, **LED parpadeando en el 3D** y «hola desde el programa» en el monitor, **`delay(1000)`→`delay(200)`: 4 → 17–18 cambios en 3,6 s**, «hay que recompilar», pausa/velocidad/detener, sin cable → no enciende, sin alimentación → sin salida y «SIN alimentación», recargar conserva sketch y artefacto, importar .hex bueno y dañado |
| `node qa/verify-robotics-offline-run.cjs` (**build** con service worker) | ✅ **4**: tras una visita el worker y el editor quedan en caché; **sin conexión el proyecto se abre, el programa importado corre y el LED parpadea (11 cambios en 3 s)**, el editor abre y «Compilar» queda desactivado con aviso |
| Regresión etapas 1–3 (`verify-robotics-{project,interaction,assembly,circuit}` y `-ui` 61 · `-build-ui` 36 · `-wiring-ui` 24 · `-fly-ui` 9) | ✅ en dev y en build |
| `verify-approved-home` (`SKIP_PROTECTED_HASHES=1`) · `verify-home-card-gestures` · `verify:float` · `verify:pwa` · `run-e4-offline` · `run-browser` (CSP/Rapier) | ✅ (la del inicio **falló al principio por mi culpa**: el sitio construido pedía `/api/compile` y daba un 404 en cada visita; ya no se consulta fuera del desarrollo) |
| `verify:lab-ui` · `verify:modo` | ❌ pre-existentes (etapas 1 y 2) |

## Criterios de aceptación
| Criterio | ✅ / ❌ | Evidencia |
| --- | --- | --- |
| Sketch enciende LED externo conectado | ✅ | `code-ui` (3D) y `mcu` (D13 → 220 Ω → LED → GND) |
| Cambio de programa cambia la señal | ✅ | 4 → 17–18 cambios en 3,6 s; periodos 1 000 ms / 200 ms (±1 ms) |
| Sin alimentación o con cable retirado, falla observable | ✅ | UNO «SIN alimentación» y sin serie; LED apagado sin cátodo; motor 0 V sin cable |
| PWM altera la salida | ✅ | 0,5 ±0,01; tensión del motor baja con 64/255 |
| TRIG/ECHO con distancias coherentes en prueba controlada | ✅ | 1 749 / 583 / 5 831 µs; 0 fuera de alcance o sin alimentación |
| Timeout o sketch bloqueante no congela el canvas | ✅ | `while(1)`: 10 s virtuales en 2,6 s; el emulador vive en un worker; Detener = `terminate()`; latido de 4 s |
| Guardar/abrir recupera el sketch | ✅ | `code-ui`: sketch, artefacto y hash idénticos tras recargar |
| **Bloquea si:** se anima un LED sin programa | no ocurre | sin programa compilado ▶ no ejecuta; el brillo sale del solver |
| **Bloquea si:** la UI se congela | no ocurre | ver arriba |
| **Bloquea si:** el tiempo del sensor es ficticio | no ocurre | el ancho de ECHO depende del reloj virtual y de la distancia configurada |
| Requisito de la etapa: **despliegue del compilador autorizado** | ❌ no autorizado | solo servicio local de desarrollo; ver desviaciones |

## Desviaciones del plan
- **No se desplegó el compilador** (no autorizado). En el sitio publicado `/api/compile` no existe: `RemoteCompiler.available()` da `false` y la interfaz ofrece **importar .hex** o usar el programa ya compilado. No se consulta el servicio fuera del desarrollo (bandera `PUBLIC_ROBOTICA_COMPILER=1` para el día que se apruebe alojarlo).
- **Contrato `McuRuntime`/`PinBus` ajustado** al funcionamiento real de avr8js: las entradas se **entregan** (`setInput`, `setAnalog`, `schedule`) en lugar de consultarse; `PinBus` solo recibe flancos, modo y serie; el ciclo útil lo mide el coordinador a partir de los flancos (`writePwm` no existe).
- **Dependencias fuera de la tabla del plan** (declaradas con versión exacta): `@codemirror/state`, `@codemirror/view` y `@codemirror/lint` (la propia familia de `codemirror`, que se importan directamente); `avr8js` pasó de `devDependencies` a `dependencies`.
- **Categoría nueva «Pasivos»** y dos piezas (LED, resistencia) sin anclajes: se cablean, no se unen mecánicamente.
- **El programa no genera pasos de historial por tecla** (el editor tiene el suyo) y compilar/importar tampoco: son artefactos regenerables.
- **Cambiar el proyecto mientras corre detiene la simulación** con aviso (en lugar de intentar recalcular en caliente).
- Los `.hex` se **versionan** como pedía la etapa, aunque contienen el núcleo de Arduino (LGPL-2.1); el README de `qa/fixtures/robotica/` lo declara y no se sirven en el sitio.
- Node ejecuta los `.ts` quitando tipos: las clases del coordinador y del compilador no pueden usar *parameter properties* (`constructor(private x)`). Anotado para quien continúe.

## Riesgos abiertos · límites de fidelidad · cuestiones de UX
1. **Velocidad:** a ×1 va bien y a ×4 el equipo de prueba no alcanza dibujando el 3D (≈ 1,2× en la página; 2,3–3,8× sin dibujar). En una tablet será peor: **sin medir**. El worker tiene un presupuesto de 12 ms por cuadro y arrastra una deuda de máximo 0,1 s; si no alcanza, avisa («LENTA»), no se congela.
2. **El circuito se resuelve cada 2 ms virtuales**: las señales de entrada que vienen de otros pines (no del sensor) llegan al programa con hasta 2 ms de retraso; ECHO es exacto (se programa en el ciclo de reloj). Un botón pulsado muy rápido podría perderse (no hay botones todavía).
3. **PWM promediado**: el LED y el motor ven la tensión promedio, no los pulsos (el parpadeo rápido de un LED con PWM se ve como brillo). Es lo previsto («ciclo útil promediado por paso»).
4. **Motores sin fuerza contraelectromotriz** (8 Ω fijos) y **las ruedas no giran**: el movimiento del robot es la etapa 5. Aquí solo se calcula la tensión y la velocidad relativa (−1…1) del motor.
5. **HC-SR04 solo en banco** (distancia fija en Propiedades). No detecta obstáculos ni orientación.
6. **No soportado y declarado en la interfaz:** `Serial.read`/entrada serie, `attachInterrupt`, `Servo`, `tone`, I²C, SPI, EEPROM. avr8js los trae pero no están verificados ni conectados a dispositivos.
7. **Servicio de compilación local:** depende de `.cache/arduino-cli` (ignorada por git; se instala con `arduino-cli`, 279 MB). Cada compilación tarda ≈ 3,5 s (caché aislada para poder compilar en paralelo con seguridad). No tiene el límite de tasa compartido que necesitaría un servicio real.
8. **Un programa compilado sin conexión solo se ejecuta tras una visita previa** con conexión (el worker y el editor se cachean al visitar; igual que el resto de Robótica, no entran al paquete de viaje).
9. **Editor:** sin autocompletado de funciones de Arduino, sin formateo; los errores se marcan por línea completa.
10. **Teléfono:** la ventana Programación funciona como lámina; escribir código con el teclado en pantalla no se probó.
11. La prueba del inicio aprobado sigue siendo **intermitente** (1 de ~9 ejecuciones, ver etapa 3).

## Próxima etapa sugerida (sin iniciarla) y decisiones que necesitan aprobación
- **Etapa 5 — Simulación física** (`etapas/ETAPA_5_SIMULACION.md`): Rapier en el worker, locomoción diferencial, obstáculos y el HC-SR04 con rayos reales. Antes: **D-06** (confirmada solo por mi recomendación), **medir en la tablet real** (también esta etapa), **medidas del kit** (D-08) y **voltaje de la batería** (D-11).
- **Dónde alojar el compilador** y autorizar su despliegue (sigue pendiente; hoy solo existe en desarrollo).
- Pendientes heredados: D-09 (arte de la tarjeta), D-10 (publicar la 2.6.0 Beta, solo con tu aprobación explícita) y validar las etapas 1–4.
