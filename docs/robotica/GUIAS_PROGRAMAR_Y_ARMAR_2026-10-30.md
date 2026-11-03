# Programar paso a paso y Armar por pasos

30/10/2026 · etapa 1b y 1c · implementación local, **sin publicar**. Junto con [Cableado paso a paso](GUIA_CABLEADO_PASO_A_PASO_2026-10-30.md) forma la guía completa: **armar → cablear → programar**.

## Programar paso a paso (botón «Programar» en Construir)
Tres guías de 4 pasos; cada paso trae **el programa completo hasta ese punto**, por qué se escribe así, las ideas nuevas, qué debes ver y una **comprobación que se ejecuta en el simulador** con el circuito, los pines y los sensores reales del robot del estudiante.

| Guía | Sirve para |
| --- | --- |
| Evitar obstáculos (pines → motores → medir con el HC-SR04 → decidir) | Robot 2 ruedas, explorador con luces, Rover 4WD |
| Seguidor de línea (pines → motores con fuerza propia → leer sensores → corregir) | Robot seguidor de línea |
| Minisumo (pines → motores → detectar el borde → retroceder y girar) | Minisumo, sumo cuña, pala 4WD y defensa |

- **Poner este código en mi programa:** escribe el código y su `.hex` precompilado como programa de la placa (queda «compilado y al día», así funciona **sin servicio de compilación**). Las líneas nuevas de cada paso se resaltan en verde.
- **Probar este paso:** ejecuta el programa en el simulador en varios escenarios («con un obstáculo a 10 cm», «con el sensor izquierdo sobre negro») y muestra cada resultado con ✓/✗ en lenguaje claro. Si falla, dice qué pasó («D4 está en ALTO: está en BAJO», «Motor 1 recibe más de 1,5 V: recibe 0,0 V», «el HC-SR04 respondió 0 veces: revisa los cables TRIG y ECHO»).
- Si falta alimentación avisa que se termine el cableado; si no hay programa o el código cambió sin compilar, dice qué hacer. El panel se queda en el paso hasta que pulsas «Siguiente paso».
- Si el estudiante escribe su propio código y lo compila (servicio de desarrollo) o importa un `.hex`, «Probar este paso» usa ese programa.
- La guía se sugiere sola según la plantilla del robot («· para tu robot»).

Los programas se compilan con `npm run build:guide-programs` (arduino-cli local) y quedan en `src/robotics/guide/programHex.generated.ts`. Si cambias el código de un paso hay que regenerarlos; la prueba falla si no coinciden.

## Armar por pasos (botón «Guía» en Construir)
La guía fantasma de armado ahora es un paso a paso: «**Tracción · paso 2 de 14**», qué pieza es, **dónde encaja** («Encaja en Chasis 2WD 1 · Motor izquierdo»), **por qué** y una lista con todos los pasos (✓ los hechos). Además de «Tomar pieza» (arrastrar hasta la figura azul) hay **«Encajarla por mí»**, que coloca la pieza ya unida donde dice la referencia.

## Pruebas
| Prueba | Qué cubre |
| --- | --- |
| `npm run verify:robotics-program-guide` | 12 programas con su `.hex`; los 32 casos robot × paso pasan sus comprobaciones; con el código del paso anterior **fallan** las del siguiente (9 casos); mensajes sin cableado, sin programa o sin compilar; sensor con el cable TRIG quitado. |
| `npm run verify:robotics-guides-e2e` | Los 8 robots **de cero** (proyecto vacío): armar con «Encajarla por mí» + cablear con la guía + programar con los 4 pasos (cada uno pasa sus comprobaciones). Resultado: terminan a 0,0–0,5 cm de la plantilla en la física. |
| `npm run verify:robotics-guides-ui` | Navegador real: sugerencia de guía, paso superado, fallo explicado, 4 pasos hasta «Programa completo», el programa corre en Simular, armar 14 pasos con «Encajarla por mí», y el panel cabe en 390 px. |

## Alcance y límites
- La comprobación usa el banco de pruebas del simulador (distancia de obstáculo y suelo negro configurables), sin la física de Rapier: es rápida y determinista, pero no reemplaza probar el robot en Simular.
- Las guías de programación cubren tres comportamientos; otros robots (por ejemplo seguidor de objetos o los de orugas) tendrán la suya cuando existan sus plantillas.
- Los brazos no entran en estas guías (no tienen cableado ni sketch de Arduino).
