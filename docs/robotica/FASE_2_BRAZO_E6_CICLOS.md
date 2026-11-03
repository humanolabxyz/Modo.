# E6 · ciclos de recogida y transferencia

Implementación local del 30 de octubre de 2026 sobre la [operación E6](FASE_1_BRAZO_E6_OPERACION.md). Se conserva la geometría, cadena y límites documentados en esa fase.

## Usar las prácticas

En **Robótica → Más robots y proyectos**, elegir **Brazo educativo · referencia E6** (una pieza) o **E6 · transferencia de tres piezas**. Esta segunda plantilla es otra aplicación del mismo brazo, no un nuevo modelo de fabricante.

1. Abrir **Programa → Preparar ciclo completo**. No requiere encender servos ni modifica la postura. Reemplaza el programa con 9 puntos para una pieza o 25 para tres; el historial permite deshacer.
2. Revisar los puntos. El desplegable de cada punto permite cambiar su nombre y modo MovJ/MovL, subirlo, bajarlo o actualizarlo con la postura y pinza actuales. La reproducción vuelve a comprobar cada recorrido editado.
3. Habilitar servos y reproducir. El ciclo aproxima, desciende en línea, sujeta, levanta en línea, traslada, desciende, libera, espera la caída física y retira la herramienta. Termina regresando a inicio.
4. Pausar/reanudar o detener toda la secuencia. La emergencia cancela la secuencia y deshabilita servos; restablecerla requiere habilitarlos de nuevo. La pausa de motores no suspende la gravedad de una pieza ya liberada.
5. La práctica de tres piezas solo termina cuando las tres fueron liberadas por el brazo y quedaron en sus destinos individuales. El contador usa la posición física, no el tiempo transcurrido ni el índice del programa.
6. **Reiniciar práctica** restaura todas las piezas en sus posiciones iniciales y el brazo en home; es un reinicio explícito del ejercicio. Para control manual de varias piezas, elegir **Práctica → Pieza de trabajo**.

La preparación calcula desde las posiciones actuales de la escena. Rechaza piezas fuera de alcance, masas excesivas, destinos ausentes y recorridos obstruidos. La pinza comprueba el ID de la pieza prevista durante el ciclo automático y cancela la secuencia si no logró sujetarla. Los puntos y esta comprobación sobreviven a guardado, exportación e importación. Borrar una pieza requerida elimina el programa con aviso para evitar referencias inválidas.

## Archivos y alcance

- `src/robotics/arm/program.ts`: genera programas con trayectorias comprobadas, sin modificar la escena activa.
- `model.ts`: plantilla de tres piezas, destinos individuales, contador y reinicio de todas las piezas.
- `useArmController.ts`: secuencia bloqueada durante movimientos y liberaciones, paso actual, cancelación y edición.
- `ArmControls.tsx`, `src/styles/robotics.css`: controles de programa y práctica, conservando el panel actual.
- `drop.ts`: incluye los otros cubos como obstáculos físicos durante la liberación.
- Contrato, importador, comandos y plantillas actualizados conservando proyectos anteriores.

Es una simulación educativa. Mantiene las limitaciones de pinza, masas CAD, colisiones aproximadas y dinámica de la fase 1; no opera firmware ni hardware Dobot. La práctica de transferencia no incorpora cinta, sensor de color ni un controlador industrial nuevo. No se despliega ni publica.

## Verificación reproducible

`npm run verify:robotics-arm-task` verifica ciclos completos de una y tres piezas recorriendo las muestras de trayectoria, con liberación Rapier, destinos, importación, borrado de dependencias, reinicio y rechazos de fallos.

`npm run verify:robotics-arm-task-ui` recorre preparación, edición, persistencia, pausa, parada, emergencia y tres entregas completas en escritorio 1440×900 y móvil emulado 390×844. Evidencia en `qa/robotics-arm-task/`; estos archivos registran el resultado efectivo, no una validación en teléfono físico.

## Resultado de esta entrega

| Comprobación | Resultado |
|---|---|
| `npm install` | Correcto; informa cuatro vulnerabilidades altas. No se ejecutó una actualización forzada. |
| `npm run check` / `npm run build` | Correctos; build conserva aviso de chunks mayores de 500 kB. |
| `verify:robotics-arm` / `verify:robotics-arm-task` | Correctos: cinemática, trayectorias, agarre, carga, física, programas y resultado. |
| `verify:robotics-project` | Nueve bloques correctos. |
| `verify:robotics-assemblies`, `verify:robotics-kit`, `verify:robotics-learning` | Correctos: se conservan los armados, circuitos, programas y prácticas móviles existentes. |
| Nuevo ciclo en escritorio | Correcto; `qa/robotics-arm-task/ui-results.json`. |
| Nuevo ciclo en móvil emulado | Correcto; ejecución aislada con `PANELLAB_QA_VIEW=mobile`, en `ui-mobile-results.json`. |
| Build final en navegador | `node qa/capture-robotics-arm-final.cjs` correcto en ambos tamaños; resultado guardado, servos apagados, sin errores JS ni desbordamiento. |

La prueba anterior `verify:robotics-arm-ui` no quedó íntegramente aprobada en esta sesión: completó el recorrido de escritorio y el de móvil llegó al cierre, pero la captura móvil agotó 30 s. El nuevo recorrido integral pasó después en ambos tamaños; se conserva el fallo anterior sin presentarlo como éxito. El primer intento visual también encontró dependencias Vite obsoletas (504); se reinició el servidor local existente en el mismo puerto 4326 y las comprobaciones finales se hicieron contra el build en el puerto 4330.

Durante las comprobaciones se corrigieron las expectativas de número de plantillas y los filtros de pruebas AVR para que las prácticas E6 se prueben con su controlador de movimientos. Las zonas pintadas se excluyen de los avisos de interferencia mecánica y el botón de emergencia permanece visible al desplazar el panel. Los mensajes de error se conservan aunque la escena ya registre una práctica completada.

### Capturas comparativas

| Vista | Inicio de la práctica | Resultado en build final |
|---|---|---|
| Escritorio | [Tres piezas en origen](../../qa/robotics-arm-task/desktop-initial.png) | [Tres entregas verificadas](../../qa/robotics-arm-task/desktop-final.png) · [Escena despejada](../../qa/robotics-arm-task/desktop-scene-final.png) |
| Móvil emulado | [Tres piezas en origen](../../qa/robotics-arm-task/mobile-initial.png) | [Resultado y emergencia accesible](../../qa/robotics-arm-task/mobile-final.png) · [Escena despejada](../../qa/robotics-arm-task/mobile-scene-final.png) |

Las capturas `*-final.png` recargan el proyecto completado por la prueba del modelo; no sustituyen la ejecución integral del navegador registrada en los dos informes UI. Los archivos `single-completed.modo.json` y `transfer-completed.modo.json` permiten reproducir ese estado.

Pendiente fuera de esta entrega: validación en teléfono y robot físicos, controlador Dobot, cinta/sensores de clasificación y otros perfiles de brazo como UR3e. No se publicaron cambios ni se tocaron repositorios remotos.
