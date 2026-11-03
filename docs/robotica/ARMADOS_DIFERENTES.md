# Revisión de armados: rover aprobado y propuestas pendientes

Actualizado el 29 de octubre de 2026. Trabajo local en la aplicación existente.

> Estado de publicación 2.6.2: el usuario aprobó el rover 4WD y rechazó la propuesta de varios pisos. El selector ofrece cuatro plantillas: las tres iniciales y el rover. Dos pisos y minisumo se conservan como experimentos compatibles con proyectos guardados, pero no se ofrecen como robots terminados. Reparto, estacionamiento y brazos robóticos son las próximas ampliaciones solicitadas. La tabla y las mediciones siguientes documentan la exploración anterior, no una lista de seis robots publicados.

## Abrir y ejecutar

En Robótica, elegir **Más robots y proyectos** (o abrir las plantillas desde Mis proyectos), seleccionar el armado y pulsar **▶**. Cada plantilla crea un proyecto nuevo con conexiones, sketch y HEX guardados. No requiere compilar para ejecutarse; un programa editado sí necesita su HEX correspondiente.

## Qué podemos construir ahora

| Plantilla | Montaje y función | Piezas / cables |
|---|---|---:|
| Robot 2 ruedas · listo para usar | Plataforma de dos ruedas y rueda loca; evita obstáculos con ultrasonido. | 14 / 28 |
| Robot seguidor de línea | Plataforma de dos ruedas con dos sensores IR; sigue una pista negra. | 17 / 36 |
| Robot explorador con luces | Plataforma de dos ruedas; evita obstáculos y señala proximidad con LED. | 16 / 34 |
| Rover 4×4 | Cuatro motores, cuatro ruedas, dos controladores L298N y una base; evita obstáculos. Sin rueda loca. | 18 / 41 |
| Robot de dos pisos | Dos bases separadas 44 mm mediante cuatro columnas de dos soportes U. Alimentación y protoboard abajo; UNO y ultrasonido arriba. Se acerca a un objeto, espera y retrocede si está demasiado cerca. | 23 / 28 |
| Minisumo de práctica | Tracción delantera, rueda loca trasera, defensa baja hecha con seis soportes U y dos sensores IR para detectar el borde negro de una arena. | 23 / 36 |

Los nombres exactos se muestran en las tarjetas del selector, junto con una descripción del montaje. Las tres primeras son variantes de una misma plataforma; las tres nuevas cambian la distribución mecánica.

Se reutilizan los **17 tipos de componentes** del catálogo. Las cantidades cambian: un kit físico de dos motores no alcanza para el rover de cuatro motores; el montaje de dos pisos necesita una segunda base y ocho soportes U. La defensa de minisumo usa seis soportes del catálogo y no representa una cuchilla o pieza nueva comercial.

## Conexión y funcionamiento

Todos usan la protoboard como parte del circuito: alimentación regulada, rieles de 5 V y GND y señales que llegan a pines concretos. Desconectar la alimentación del riel corta la alimentación del UNO. Apagar el interruptor general corta los consumidores.

El rover comparte señales de dirección y PWM entre sus dos L298N, con salidas independientes para los cuatro motores. El robot de dos pisos lleva los cables entre niveles por fuera de la placa superior; las curvas se recalculan desde la posición actual de las piezas y acompañan al robot al moverse. Las rutas manuales guardadas tienen prioridad.

El seguidor de objetos avanza cuando mide entre 32 y 150 cm, espera entre 20 y 32 cm y retrocede por debajo de 20 cm. Sin objeto cercano espera. El ejemplo trae un cilindro delante; se puede cambiar su posición con la simulación detenida.

El minisumo avanza hasta detectar negro con uno de los IR; entonces retrocede y gira. En **Escenario → Pista de línea**, elegir **Arena minisumo · borde negro**. Es una práctica individual de detección de borde: no incluye oponente, puntuación ni validación de reglamento de competición.

## Comprobación

- `npm run verify:robotics-assemblies`: cantidades, uniones, ausencia de interferencias OBB, circuito, corte de alimentación, movimiento conjunto, exportación/importación, código compilado y simulación completa.
- Rover: 0,674 m en 10 s virtuales, los cuatro motores activos y giro ante el obstáculo.
- Dos pisos: avance de 0,144 m en 9 s virtuales y detención con lectura final de 31,1 cm. También se prueba espera a 25 cm, retroceso a 12 cm y espera sin objeto cercano.
- Minisumo: 2,925 m en 24 s virtuales, detección de negro y retroceso, con radio máximo del centro de 0,609 m dentro de la pista de radio 0,65 m. Esto describe ese ejemplo, no garantiza cualquier montaje o programa.
- Las curvas de los cables del doble piso se muestrean para comprobar que cruzan la altura de la placa fuera de su contorno y que siguen al montaje al trasladarlo.
- `npm run verify:robotics-assemblies-ui`: crear, ejecutar, consultar consola, guardar/recargar, elegir arena y encuadrar los tres nuevos robots en 1440×900 y 390×844. No se envía una solicitud de compilación al ejecutar sus HEX guardados.
- Evidencia: `qa/robotics-assemblies/verification.json`, `ui-verification.json`, `physics-*.json`, capturas y proyectos `.modo.json`. `comparacion.html` permite revisar los montajes.

Se comprueba en Chromium con tacto móvil emulado y SwiftShader. Quedan pendientes la aceptación en teléfonos físicos y la validación con hardware real. El circuito, los modelos y la física son didácticos.

## Qué falta para otros robots

Un brazo, una pinza o una plataforma con dirección por servo requieren añadir servomotores, articulaciones y su control a la simulación. No figuran como robots implementados. Los cuatro montajes publicados ya se pueden crear y editar dentro de la aplicación; se conservan los proyectos guardados existentes y su formato.
