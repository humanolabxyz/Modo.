# Célula E6 · cinta transportadora y clasificación

Implementación local del 30 de octubre de 2026. Se amplía el taller existente, con el mismo brazo E6 y sus movimientos progresivos, una cinta genérica y sensores educativos de presencia y RGB. No se atribuye esta cinta a un accesorio comercial Dobot ni se implementa su controlador físico.

## Abrir y operar

En **Robótica → Más robots y proyectos → Célula E6 · cinta y clasificación**. Se crean el brazo, la cinta y tres piezas con destinos rojo, verde y azul. Los proyectos anteriores se conservan.

1. En el panel del brazo abrir **Cinta** y habilitar servos. La célula siempre abre con motores deshabilitados.
2. **Avanzar hasta sensor** transporta las piezas apoyadas sobre la banda hasta activar la presencia. La banda se detiene y el panel muestra pieza, RGB y color reconocido.
3. **Clasificar lote** coordina transporte → presencia → lectura RGB → destino → aproximación y descenso → agarre → levantamiento → traslado → liberación física → retirada. Repite con las piezas restantes. El botón general **Ejecutar** también inicia la clasificación.
4. Ajustar la cinta entre 20 y 120 mm/s, y la velocidad del brazo con su control habitual. Los cambios de velocidad y fallas se hacen con la célula detenida.
5. Pausar/reanudar, detener o usar la emergencia desde el panel o la barra. Ocultar la pestaña pausa los motores. Una pieza ya liberada continúa cayendo por gravedad. Restablecer emergencia no habilita servos.
6. **Reiniciar práctica** devuelve las piezas a sus orígenes sobre la banda y el brazo a home. Conserva las fallas elegidas, para repetir un diagnóstico. Es un reinicio explícito, no parte de la trayectoria de producción.

El brazo debe estar retirado de la zona de transporte y sin carga antes de avanzar. La banda no se ejecuta a la vez que un movimiento del brazo o una liberación física. Detener conserva la posición actual; si se interrumpe con una pieza sujeta, hay que depositarla manualmente o reiniciar antes de transportar.

## Qué determina el resultado

- La presencia depende de que un cubo esté apoyado en la banda y cruce la estación de detección. Un cubo fuera de la banda, en altura o sujeto por el brazo no activa ese transporte.
- La lectura utiliza los canales `surfaceR`, `surfaceG`, `surfaceB` de la superficie del cubo. El sensor aproxima al patrón rojo, verde o azul dentro de una tolerancia RGB de 65 unidades; un color no reconocido detiene el ciclo. No se escoge por nombre o ID de la pieza.
- El destino se busca por el color aceptado de la zona. Si se cambia la superficie del cubo conservando su ID, cambia la ruta elegida. La comprobación final también exige coincidencia de color, liberación por el brazo y posición física en la zona.
- Los puntos de cada recogida se generan desde la posición detectada. Pasan las mismas comprobaciones de alcance, carga y colisión del E6. El programa de la última recogida queda disponible en **Programa** para inspección y edición. Preparar manualmente requiere una pieza presente en la estación y prepara solo esa recogida; el lote se ejecuta desde **Cinta**.
- La pinza debe sujetar la pieza prevista. La liberación usa Rapier y considera suelo, obstáculos, otros cubos y cuerpo de la cinta. Tres entregas verificadas completan el lote; el contador no avanza por temporizador.

## Fallas y diagnóstico

| Falla | Cómo practicar | Respuesta |
|---|---|---|
| Atasco | Activar **Cinta atascada** | No hay avance y se informa el atasco. |
| Obstáculo real en banda | Agregar una caja de escenario que intercepte una pieza | El transporte se detiene al contacto aproximado; subpasos evitan atravesar obstáculos delgados. |
| Sensor sin detección | Activar su casilla | No hay señal de presencia ni clasificación. Al llegar una pieza al extremo de salida se aplica parada de protección. |
| Cinta vacía | Quitar las piezas o completar las entregas | Se indica ausencia de piezas; no se inventa una recogida. |
| Color desconocido | Editar canales de superficie en Propiedades, por ejemplo 0/0/0 | Se detiene en estación con lectura no reconocida. |
| Destino ausente | Desbloquear y quitar una zona | Se informa qué destino falta antes de mover el brazo. |
| Brazo invadiendo banda o con carga | Acercarlo manualmente y solicitar transporte | Enclavamiento: exige retirar el brazo o liberar la carga. |
| Cinta inclinada | Desbloquear y girar sobre X/Z | La práctica rechaza el transporte: admite banda horizontal, con desplazamiento y orientación en planta. |

## Modelo y límites

La banda mide 720 mm en esta práctica; su velocidad, sensores, geometría y motor son aproximaciones didácticas. Los rodillos y marcas avanzan con la distancia recorrida. El transporte de cubos se modela por contacto sin deslizamiento sobre una banda horizontal, con comprobación de obstáculos; no calcula una transmisión, torque de motor, fricción de arranque ni toda la dinámica de una banda flexible. Las piezas se colocan inicialmente en reposo sobre ella.

El sensor RGB no reproduce óptica, iluminación, calibración ni un chip concreto. Los cuerpos de los sensores se muestran en la estación; las colisiones usan volúmenes aproximados del conjunto. La parada de salida protege la práctica: no se simula una pieza escapando al extremo durante alimentación. Se mantienen los límites del [brazo E6](FASE_1_BRAZO_E6_OPERACION.md).

El control de esta célula es por secuencias educativas. La cinta no declara pines eléctricos ni firmware Arduino/Dobot/PLC. No hay conexión con equipos reales ni certificación de seguridad industrial. No se publica ni despliega.

## Archivos y comprobación

- `src/robotics/conveyor/`: constantes, catálogo, transporte, sensor, clasificación, malla y controles.
- `src/robotics/arm/`: coordinación, preparación de una pieza detectada, colisiones, reinicio sobre banda, liberación y evaluación por color.
- `src/robotics/catalog/index.ts`, `project/templates.ts`, `project/validate.ts`, `build/PartMesh.tsx`, `RoboticsApp.tsx`, `src/styles/robotics.css`: integración en catálogo, plantillas, importación, escena y barra de ejecución.
- `public/robotics/components/educational-conveyor.webp`: miniatura renderizada desde la malla real; el catálogo pasa a 24 piezas y las plantillas a 11.
- `qa/verify-robotics-conveyor.mjs`: ciclo íntegro con los tres colores, trayectorias y Rapier; lectura por superficie cambiando color con el mismo ID; transporte, reinicio y fallas.
- `qa/verify-robotics-conveyor-ui.cjs`: flujo en escritorio y móvil emulado con fallas, pausa, emergencia, clasificación, persistencia y recarga.

Ejecutar `npm run verify:robotics-conveyor` y `npm run verify:robotics-conveyor-ui`. Resultados y capturas en `qa/robotics-conveyor/`. Las ejecuciones de navegador usan el build local, no una web remota. No equivalen a prueba en teléfono físico.

## Resultado de la entrega

| Comprobación | Resultado |
|---|---|
| `npm install` | Correcto. Permanecen cuatro vulnerabilidades altas; no se forzaron cambios de dependencias. |
| `npm run check` y `npm run build` | Correctos. Permanece el aviso de chunks mayores de 500 kB. |
| `verify:robotics-conveyor` | Tres bloques correctos: transporte y lectura, lote completo con Rapier, fallas y validación. |
| `verify:robotics-conveyor-ui` | Correcto en escritorio 1440×900 y móvil emulado 390×844; sin errores JS. Informe `qa/robotics-conveyor/ui-results.json`. |
| `verify:robotics-arm`, `verify:robotics-arm-task` | Correctos: se conservan las prácticas anteriores del E6. |
| `verify:robotics-project`, `verify:robotics-assembly` | Correctos: 9 y 17 bloques respectivamente. |
| `verify:robotics-kit` | Correcto: armados, circuitos, alimentación, sensores, MCU y física de los robots existentes. |
| `node qa/capture-robotics-conveyor-final.cjs` | Correcto en ambos tamaños sobre el build final: miniatura, botón general de ejecutar, transporte, pausa/reanudación, emergencia y recarga del estado completado. |

La comprobación de ensamblaje inicialmente tenía un límite de 500 mm para toda pieza del catálogo; se ajustó de forma específica para admitir la nueva banda de 720 mm, manteniendo el límite anterior para las otras piezas. No se rebajaron las pruebas de circuitos ni de movimiento.

### Comparación visual

| Vista | Piezas en origen | Clasificación terminada |
|---|---|---|
| Escritorio | [Escena inicial](../../qa/robotics-conveyor/desktop-initial-final.png) | [Tres colores entregados](../../qa/robotics-conveyor/desktop-complete-final.png) · [Controles](../../qa/robotics-conveyor/desktop-final-controls.png) |
| Móvil emulado | [Escena inicial](../../qa/robotics-conveyor/mobile-initial-final.png) | [Tres colores entregados](../../qa/robotics-conveyor/mobile-complete-final.png) · [Controles](../../qa/robotics-conveyor/mobile-final-controls.png) |

Las capturas finales recargan el proyecto completado por la prueba integral, conservado en `desktop-completed.modo.json` y `mobile-completed.modo.json`. No sustituyen la ejecución completa registrada por esa prueba.

Pendientes: comprobación en teléfono físico, conexión eléctrica/PLC/controladores reales, calibración de sensores, dinámica completa de fricción, colas de producción continua y cinta de salida. La entrega actual es una célula de lote de tres piezas, una por color, dentro del simulador educativo local. No hubo despliegue ni cambios remotos.
