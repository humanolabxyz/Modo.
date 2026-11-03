# Fase 1 · Brazo E6: modelo y operación

Implementación local del 29 de octubre de 2026. Reemplaza el primer borrador de tubos y cambios instantáneos de postura por la cadena y las superficies publicadas por Dobot.

## Abrir la práctica

En Robótica, abrir el menú del proyecto → Ver proyectos → **Brazo educativo · referencia E6**. La plantilla crea un proyecto independiente con brazo, pieza de 50 g y zona azul. Los proyectos anteriores se conservan.

1. Revisar el área y pulsar **Habilitar servos**. Cada apertura/recarga empieza con servos apagados.
2. Operar con Jog articular de 5° o Jog cartesiano de 10 mm. La vista cartesiana muestra coordenadas de base con Z arriba, aunque el lienzo utiliza Y arriba internamente.
3. Seleccionar velocidad de 10 a 100 %. Los cambios articulares y acercamientos recorren una trayectoria; no cambian instantáneamente la postura.
4. En Práctica, acercarse a la pieza, cerrar la pinza, levantar, acercarse a la zona y abrir. La liberación inicia una caída física, no un traslado directo al suelo.
5. En Programa, enseñar puntos con posición articular, modo MovJ/MovL y estado de pinza. Reproducirlos como secuencia. Se admiten hasta 40 puntos.
6. Pausar/reanudar, detener en la postura actual o usar la emergencia enclavada. Restablecer emergencia no habilita los servos automáticamente. Cambiar a Construir detiene un movimiento activo.

## Fuente técnica identificable

- Repositorio del fabricante: [Dobot-Arm/DOBOT_6Axis_ROS2_V4](https://github.com/Dobot-Arm/DOBOT_6Axis_ROS2_V4).
- Revisión fijada: `ec201c40d5db63185a3593ec9c39f80fe25aa527`.
- Cadena de articulaciones: `dobot_rviz/urdf/me6_robot.urdf`.
- Posición home y exclusiones de colisión entre eslabones: `me6_moveit/config/me6_robot.srdf`.
- Mallas originales: `dobot_rviz/meshes/me6/base_link.STL` y `Link1.STL` a `Link6.STL`.
- Licencia MIT del repositorio, copyright 2026 Dobot, conservada en `docs/robotica/fuentes/dobot-e6/LICENSE` y `public/robotics/e6/LICENSE.txt`.
- Los SHA-256 de las mallas originales, sus URLs inmutables y los recuentos de triángulos están en `docs/robotica/fuentes/dobot-e6/manifest.json`.

`python scripts/prepare-e6-model.py` reproduce la descarga y preparación usando únicamente la biblioteca estándar de Python. Las superficies visuales se reducen con agrupación de vértices en una cuadrícula de 0,6 mm. Las dimensiones entre ejes, orientaciones, masas e inercias del URDF no se redondean. Los recursos preparados se sirven localmente; no hay descarga desde GitHub al utilizar la práctica.

Se adopta el menor límite de velocidad entre el URDF y los **120°/s** de la [ficha E6 del fabricante](https://www.dobot-robots.com/products/education/magician-e6.html). Los límites articulares proceden del URDF fijado y pueden ser ligeramente menores que los valores redondeados del catálogo. No se mezclan con los límites de Magician de cuatro ejes.

## Qué se simula

| Aspecto | Implementación |
|---|---|
| Geometría | Siete superficies derivadas del modelo oficial, con licencia y procedencia |
| Cinemática directa | Composición de cada origen, RPY y eje del URDF; conversión ROS Z arriba → lienzo Y arriba |
| Cinemática inversa | Solución numérica amortiguada para posición y orientación; rechazo de objetivos no alcanzables |
| MovJ | Interpolación articular quíntica, inicio/final con velocidad y aceleración nulas |
| MovL | Interpolación recta de posición TCP con orientación interpolada e IK en cada muestra; rechazo de saltos/singularidades |
| Velocidad y aceleración | Velocidad escalada por operador; aceleración máxima de simulación de 180°/s² al 100 %, no presentada como ajuste medido del fabricante |
| Colisiones de movimiento | Verificación de posturas intermedias con cajas orientadas de las mallas, exclusiones SRDF, suelo, pinza, piezas y obstáculos de escena; se rechaza un recorrido bloqueado |
| Pinza | Accesorio didáctico añadido al flange con TCP a 70 mm; agarre por proximidad, sin sustituirlo por una pieza pegada permanentemente |
| Carga | Masa editable de la pieza; límite de referencia de 750 g incluyendo herramienta simulada de 80 g |
| Liberación | Rapier: gravedad, cubo dinámico con CCD, suelo, obstáculos y volúmenes del brazo; fricción y restitución de práctica |
| Par del modelo | Gravedad e inercia efectiva por eje con masas, centros de masa e inercias CAD, herramienta y carga |
| Operador | Servos habilitados/deshabilitados, Jog, velocidad, enseñanza, reproducción, pausa, parada y emergencia enclavada |
| Persistencia | Postura, pieza, puntos y estado de pinza en la biblioteca actual; importación/exportación y deshacer reutilizan la infraestructura existente |

La temporización del controlador es independiente del refresco gráfico. Se comprueba el recorrido completo antes de comenzar, aunque un dispositivo dibuje menos cuadros. Ocultar la pestaña pausa el movimiento de motores; la liberación física se procesa de forma separada.

## Límites de fidelidad que no deben ocultarse

- Es una simulación de operación con geometría y cadena del fabricante; no ejecuta su firmware, DobotStudio ni un controlador industrial certificado. No está conectada a un brazo físico.
- La pinza es un accesorio de práctica, no una réplica identificada de un SKU de pinza Dobot. La masa de 80 g y el TCP de 70 mm pertenecen a ese accesorio simulado.
- El URDF consultado suma aproximadamente **0,945 kg** de masas CAD, mientras el catálogo del equipo publica hasta 7,2 kg. Por eso el torque calculado se identifica como **par del modelo**, no como medición, corriente de motor o capacidad nominal de cada servo. El campo `effort=100` del URDF no se convierte en un supuesto torque real de los motores.
- El cálculo dinámico incluye gravedad e inercia efectiva por eje; no implementa todas las fuerzas de Coriolis, acoplamientos, elasticidad, holguras, fricción ni lazo propietario del servo.
- Las colisiones de recorrido utilizan volúmenes OBB, no intersección exacta de todas las caras STL. Los cilindros de escena se aproximan por su caja durante la planificación; la caída utiliza primitivas de Rapier.
- Comprobar y rechazar una trayectoria no equivale a encontrar automáticamente otra ruta libre. No se incorporó OMPL ni se anuncia planificación industrial certificada.
- La repetibilidad de ±0,1 mm de la ficha física no se atribuye al simulador. La tolerancia de IK es del modelo y está definida en el código.
- La validación móvil es emulada. No hay prueba de teléfono físico, medición de hardware ni aprobación docente.

## Archivos principales

- `src/robotics/arm/e6Data.ts`: datos generados del fabricante.
- `src/robotics/arm/kinematics.ts`: FK/IK, límites, colisiones y par estimado.
- `src/robotics/arm/motion.ts`: MovJ/MovL y comprobación de recorridos.
- `src/robotics/arm/useArmController.ts`: operación, reloj, puntos, pausa/emergencia y liberación.
- `src/robotics/arm/drop.ts`: física de piezas liberadas.
- `src/robotics/arm/model.ts`: plantilla, agarre y condición de entrega.
- `src/robotics/arm/ArmMesh.tsx` y `ArmControls.tsx`: representación y controles.
- Integración en `RoboticsApp.tsx`, `PartMesh.tsx`, catálogo, plantillas, tipos/validador del proyecto y estilos de robótica.

No se añadieron paquetes ni se reemplazó el módulo existente. Se ampliaron las comprobaciones de catálogo de 17 a 20 piezas y de cuatro a cinco plantillas. Las pruebas eléctricas y de armado guiado mantienen su alcance sobre los vehículos; el brazo tiene pruebas propias.

## Evidencia de verificación

- `npm install`, `npm run check` y `npm run build`.
- `npm run verify:robotics-arm`: tres referencias FK independientes obtenidas del URDF; validación, límites, IK, agarre, caída, guardado, trayectorias, obstáculos, velocidad y par dependiente de carga.
- `npm run verify:robotics-arm-ui`: escritorio 1440×900 y móvil emulado 390×844; servos, Jog, movimiento progresivo, pausa, emergencia, práctica completa, cuatro puntos reproducidos y recarga sin habilitación automática.
- Regresión de proyecto, ensamblaje, kits y aprendizaje del módulo anterior. Los resultados ejecutados quedan en sus carpetas QA.
- `qa/robotics-arm/model-results.json`, `ui-results.json` y `urdf-fixtures.json`.

El build informa chunks superiores a 500 kB. `npm install` informa cuatro vulnerabilidades altas de dependencias; no se aplicó una actualización forzada de versiones durante esta fase.

## Capturas para comparar

- Referencia anterior del módulo: `qa/robotics-models/despues-escritorio.png` (captura existente, no recapturada como si fuera una sesión nueva).
- Entrada al catálogo de proyectos: `qa/robotics-arm/desktop-before-menu.png`.
- Brazo oficial inicial: `qa/robotics-arm/desktop-arm-initial.png`.
- Pieza sujeta: `qa/robotics-arm/desktop-holding.png`.
- Entrega y puntos enseñados: `qa/robotics-arm/desktop-complete.png`.
- Versión móvil: `qa/robotics-arm/mobile-arm-initial.png`, `mobile-holding.png`, `mobile-complete.png` y `mobile-arm-collapsed.png`.

## Siguientes ampliaciones del brazo

Identificar un accesorio físico concreto y sus parámetros; completar dinámica acoplada con datos de masa verificados; añadir edición de herramienta/marcos de usuario y programación más amplia. Estas ampliaciones no son necesarias para representar como ya implementados los controles de operación descritos arriba, pero sí para aumentar la fidelidad física del equipo y sus accesorios.

Sin despliegue ni cambios remotos en esta fase.
