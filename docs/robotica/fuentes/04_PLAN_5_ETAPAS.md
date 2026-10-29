# modo. Robótica — Plan de construcción y puertas de aprobación

## Regla de trabajo
**Una etapa a la vez.** Antes de tocar código: Codex entrega investigación, propuesta, riesgos, dependencias y plan de archivos. Implementar solo la etapa aprobada expresamente por el usuario. Cada entrega incluye demo navegable local, rutas tocadas, pruebas y evidencia, limitaciones conocidas, regresión sobre módulos existentes y criterios de aceptación. No avanzar por iniciativa propia.

## Etapa 1 — Integración, diseño y base de Robótica
**Objetivo:** crear la quinta tarjeta y un workspace funcional sin afectar las cuatro existentes.

**Trabajo:** auditar gestor de ventanas actual de Panel de control, sistema de proyectos, patrones UI y dependencias; decidir stack; integrar entrada Robótica, proyecto nuevo/abrir y canvas 3D inicial. Reusar ventanas flotantes reales para Catálogo/Propiedades/Programación, sin reconstruirlas. Definir esquema `RobotProject` versionado y migraciones. Registrar riesgos de emulación Arduino antes de comprometer stack.

**Aceptación:** abrir/cerrar Robótica; abrir/arrastrar/redimensionar/cerrar/restaurar ventanas; interacción con canvas sin interferencias de puntero; guardar/abrir proyecto vacío; cuatro tarjetas anteriores y proyectos `.modo.json` antiguos conservan su comportamiento. Responsive sin ventanas inaccesibles.

**Bloquea la etapa siguiente si:** se duplica el gestor de ventanas, la navegación anterior cambia o el proyecto no se puede recuperar.

## Etapa 2 — Constructor 3D y ensamblaje
**Objetivo:** robot armable libremente a partir de piezas y reglas mecánicas.

**Trabajo:** catálogo de chasis/ruedas/motores/Arduino/driver/sensor/batería, assets 3D con dimensiones verificadas donde importe, selección/multiselección, transformaciones XYZ, rotación, cámara, snapping opcional, colisiones de montaje, uniones rígidas y articuladas; árbol de piezas e inspectores. Modelos y montajes persistentes.

**Aceptación:** construir y reabrir un robot de dos ruedas, mover/rotar piezas de forma libre, fijar motores al chasis y ruedas a sus ejes, navegar sin perder selección, deshacer/rehacer, detectar interferencia sin forzar colocación en slots. Mover chasis preserva uniones correctas.

**Bloquea siguiente si:** piezas se desplazan al guardar, vínculos mecánicos se pierden o cámara/herramientas resultan conflictivas.

## Etapa 3 — Cableado, electrónica y diagnóstico
**Objetivo:** convertir las piezas visuales en un circuito conectable y comprobable.

**Trabajo:** modelo `instanceId/pinId`, terminales clicables, cables 3D con rutas editables, integración controlada con motor de conexiones/mediciones actual; alimentación diferenciada, GND, modelo de L298N/motores/sensor UNO como dispositivos electrónicos con estados; multímetro/diagnóstico reutilizados si aplica. No falsear funcionamiento todavía del firmware.

**Aceptación:** crear conexiones eléctricas identificables; consultar continuidad y tensiones soportadas; detectar alimentación ausente, error de polaridad y masa no compartida; desmontar pieza elimina o invalida sus conexiones; serialización/restauración perfectas; dos Arduino del mismo tipo no comparten pines accidentalmente.

**Bloquea siguiente si:** cable visual no coincide con conexión lógica o conexiones entre instancias se mezclan.

## Etapa 4 — Programación Arduino y coordinación temporal
**Objetivo:** ejecutar código que interactúe con el montaje sin bloquear UI.

**Trabajo:** investigar y seleccionar emulación/compilación, comenzar con UNO R3, editor en ventana existente, errores de compilación, monitor serie mínimo, estado RUN/STOP, worker o aislamiento equivalente; señales digitales, PWM, timers y protocolo HC-SR04 según capacidad demostrada; coordinador temporal desacoplado del tick didáctico 100 ms. Documentar bibliotecas compatibles/limitaciones.

**Aceptación:** sketch enciende LED externo conectado; cambio de programa cambia señal; circuito sin alimentación o con cable retirado falla de forma observable; PWM altera la señal de salida; una rutina que lee TRIG/ECHO recibe distancias simuladas coherentes en prueba controlada; timeout o sketch bloqueante no congela canvas. Guardar/abrir recupera sketch.

**Bloquea siguiente si:** solo se anima LED sin programa, la UI se congela o timing del sensor es ficticio.

## Etapa 5 — Cubo blanco, física y prueba integral
**Objetivo:** ejecutar el robot armado y programado en el escenario tridimensional.

**Trabajo:** escena blanca minimalista con obstáculos editables; rigid bodies, gravedad, contactos, wheels/joints y locomoción diferencial; sincronización completa programa -> driver -> ruedas -> posición -> sensor -> sketch. Controles Iniciar/Pausar/Reiniciar, cámaras orbital/seguimiento, diagnósticos. Optimización y UX responsive; guías de primera práctica.

**Aceptación:** robot de dos ruedas armado en Etapa 2 y cableado en Etapa 3, con sketch en Etapa 4, se desplaza, gira y evita un obstáculo sin animación predefinida; si se retira masa, cable de motor, rueda o se gira sensor, resultado cambia coherentemente. Se puede volver a Construir, corregir, guardar y ejecutar otra vez. Sin regresiones en Laboratorio/Panel de control/Estudio/Comunidad.

**Bloquea cierre si:** no existe causalidad entre montaje, código y física o no se puede reproducir el experimento guardado.

## Plantilla de informe de cierre de cada etapa
- Estado: IMPLEMENTADA / PARCIAL / BLOQUEADA.
- Evidencia: rutas/funciones, capturas o demo local, explicación de qué se probó manualmente.
- Pruebas: comandos y resultados, incluidas regresiones.
- Criterios de aceptación: cada uno con ✅ / ❌ y evidencia.
- Riesgos abiertos / límites de fidelidad / cuestiones de UX.
- Próxima etapa sugerida (sin iniciarla) y decisiones que necesitan aprobación.
