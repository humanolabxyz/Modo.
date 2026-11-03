# Robots con protoboard funcional — 29 de octubre de 2026

El ejemplo de robótica ahora usa la protoboard de 400 puntos como parte del circuito. Se incorporan un interruptor, un regulador de 5 V, dos sensores infrarrojos con soporte y dos programas adicionales compilados para el ATmega328P emulado. Todo se integra en el proyecto local existente.

> Actualización: se publican cuatro plantillas (tres iniciales y rover 4WD). La revisión de los armados explorados y sus cantidades se explica en [Armados diferentes](ARMADOS_DIFERENTES.md). Las secciones siguientes describen las tres variantes iniciales.

## Cómo abrirlos

1. En una pizarra vacía, elegir **Más robots y proyectos**. Si ya hay un proyecto abierto, usar el menú del proyecto o **Mis proyectos**.
2. Elegir una de las cuatro plantillas. Se crea un proyecto nuevo; no se reemplaza el montaje guardado.
3. Pulsar **▶**. El código se puede revisar en **Programación**. La consola tiene las pestañas **Diagnóstico** y **Serie y estado**.
4. En el seguidor, **Escenario → Pista de línea** permite elegir circuito ovalado, curvas suaves o quitar la pista. El escenario se edita con la simulación detenida.
5. Para apagar el montaje: detener, seleccionar **Interruptor general** en Estructura y desmarcar **Encendido** en Propiedades. Al ejecutar otra vez se comprueba que la placa no tiene alimentación.

## Robots disponibles

| Plantilla | Piezas / cables | Comportamiento |
|---|---:|---|
| Robot 2 ruedas · listo para usar | 14 / 28 | El HC-SR04 mide el obstáculo; el programa gira los motores para esquivarlo. |
| Robot seguidor de línea | 17 / 36 | Dos TCRT5000 leen el suelo desde su pose real. El programa corrige cada motor sobre una pista negra. Se conserva el ultrasonido cableado como parte del kit, aunque este sketch no lo consulta. |
| Robot explorador con luces | 16 / 34 | Evita obstáculos y enciende un LED rojo cuando detecta uno cercano; LED y resistencia están montados y cableados sobre la protoboard. |

Los tres tienen su sketch y HEX guardados, vigentes y editables. Ejecutarlos no requiere pedir una compilación. Modificar el programa sí requiere recompilar o importar un HEX correspondiente.

## Circuito y piezas

La batería del ejemplo se ajusta a **6 V** (supuesto de cuatro AA) y pasa por el interruptor. La alimentación de los motores llega directamente al driver L298N, sin pasar por la protoboard. Un regulador buck-boost alimenta los rieles de la protoboard con 5 V. Esos rieles alimentan el Arduino, la lógica del driver y los sensores.

- Los puentes ENA/ENB y el regulador de 5 V del L298N se retiran en estas plantillas: la velocidad se controla por PWM y la lógica recibe 5 V externos.
- Los cuatro rieles de la protoboard conservan su independencia. Los dos cables puente que los unen están presentes en el proyecto y se pueden retirar.
- Los grupos A–E y F–J de cada fila conducen a través de `internalNet`; el canal central no conduce.
- El interruptor une IN/OUT solo cuando está cerrado. Abrirlo corta tanto la lógica como la alimentación de los motores.
- Un sensor IR sin alimentación no inyecta ninguna salida. Su DO llega al Arduino por las redes del circuito y los pines de entrada del emulador; no se controla el motor mediante una animación ni se salta el programa.
- Negro = HIGH por defecto. La polaridad de cada IR se puede invertir en Propiedades porque varía entre módulos comerciales. El valor de banco de pruebas no reemplaza la lectura física cuando hay física activa.
- El soporte en U deja espacio para la rueda loca y separa los IR 36 mm. En la física se comprueban posición, orientación hacia el suelo y altura de lectura; un módulo suelto o elevado no recibe una lectura de pista inventada.

### Distribución del ejemplo

| Uso | Arduino | Protoboard / dispositivo |
|---|---|---|
| Lógica 5 V | 5V, GND.1 | R+10, R−10 |
| Driver | D4/D7/D8/D12, D5/D6 | IN1/IN2/IN3/IN4, ENA/ENB |
| Ultrasonido TRIG | D9 | A5↔E5↔TRIG |
| Ultrasonido ECHO | D10 | A7↔E7↔ECHO |
| IR izquierdo | D2 | F10↔J10↔DO |
| IR derecho | D3 | F12↔J12↔DO |
| Aviso luminoso | D11 | Fila 25 → 220 Ω → fila 21 → LED → fila 20 → riel negativo |

## Qué más podemos crear

Estas son propuestas para siguientes ampliaciones; no aparecen como robots ya implementados:

| Robot | Qué reutiliza | Qué falta |
|---|---|---|
| Seguidor de objetos | Chasis, driver, protoboard y HC-SR04 actuales | Programa que mantenga una distancia objetivo y pruebas de marcha atrás. Es la ampliación más pequeña. |
| Minisumo didáctico | Motores, ultrasonido e IR actuales | Arena con borde, estrategia de búsqueda y reglas de detección/salida. Un oponente y puntuación requieren una fase adicional. |
| Robot con pinza | Chasis, controlador, protoboard y alimentación | Servos y pinza 3D, consumo/alimentación, articulaciones físicas y señales de control del servo. |
| Brazo de clasificación | Arduino y fundamentos del circuito | Base fija, varios servos, eslabones y límites de articulación, pinza y tarea de recogida. |

## Archivos principales

- `src/robotics/project/templates.ts`: tres montajes creados con los comandos normales de agregar/unir/cablear.
- `src/robotics/project/kitSketches.ts`, `qa/fixtures/robotica/sketches/line.ino`, `explorer.ino` y sus HEX: programas compilados localmente con arduino-cli para UNO.
- `src/robotics/catalog/index.ts`: catálogo de 17 definiciones, nuevos anclajes y componentes; se conservan los anclajes anteriores.
- `src/robotics/build/PartMesh.tsx`: nuevos modelos y montaje de LED/resistencia; piezas estáticas memorizadas para no reconstruir el detalle al mover el robot.
- `src/robotics/build/BuildCanvas.tsx`, `RoboticsApp.tsx`: conectores derivados de los pines de origen/destino sin recorrer 400 orificios por cada cable en cada cuadro; acceso a plantillas y pistas.
- `src/robotics/build/LineTrackMesh.tsx`, `sim/lineTrack.ts`: geometría de la pista y medida de distancia sobre la misma polilínea.
- `src/robotics/circuit/graph.ts`, `solve.ts`, `dynamic.ts`, `diagnostics.ts`: interruptor, regulación y salidas IR, con alimentación y cableado comprobables.
- `src/robotics/sim/physics.ts`, `coordinator.ts`: lectura desde la pose física y cierre del lazo programa→circuito→motores→suelo→sensores→programa.
- `src/robotics/project/types.ts`, `validate.ts`: pista opcional, persistencia y validación compatibles con proyectos sin pista.
- `src/robotics/windows/BuildWindows.tsx`, `RoboticsWindows.tsx`, `src/styles/robotics.css`: selección de pista, estado de IR y plantillas, conservando las ventanas existentes.
- `package.json`, `qa/verify-robotics-kit.mjs`, `qa/verify-robotics-kit-ui.cjs`: nuevas verificaciones, integradas al comando conjunto de robótica. Contadores de las pruebas de catálogo/plantillas actualizados.

## Evidencia y validación

`qa/robotics-kit/verification.json`, `physics-line.json`, `physics-avoid.json` y `ui-verification.json` conservan resultados. Las capturas del kit anterior, de los tres montajes, de la simulación y del interruptor apagado están en la misma carpeta. `comparacion.html` reúne los resultados visuales.

- El kit completo prueba alimentación a través de la protoboard, desconexión de un riel, interruptor apagado, serialización y movimiento solidario del montaje.
- Los IR se prueban sobre negro/blanco, con polaridad invertida y con DO desconectado. Se verifica que el programa AVR cambie la tensión de cada motor.
- El explorador se prueba con un obstáculo cercano y lejano: el LED responde y la resistencia evita sobrecorriente en el modelo.
- El seguidor recorrió **5,174 m en 40 s virtuales**, completó una vuelta y volvió cerca del inicio. La desviación máxima del centro del chasis a la línea fue **8,78 mm**. Es evidencia de esta pista, programa y modelo; no una garantía para cualquier circuito o geometría.
- El robot de ultrasonido avanzó y giró sin tocar la caja del ejemplo.
- En móvil, el encuadre de simulación se amplía según la proporción de la pantalla y el indicador de velocidad queda sobre el dock, sin superponerse.
- Interfaz: crear desde las tres plantillas, ejecutar con física, consultar consola, apagar, guardar/recargar y verificar ausencia de desbordamiento en 1440×900 y 390×844 con tacto emulado.
- Compatibilidad: `verify:robotics-project`, `interaction`, `assembly`, `circuit`, `mcu`, `physics`, `template`, `breadboard`; además `npm run check` y `npm run build`.

## Referencias y límites

- [SunFounder, sensor de seguimiento](https://docs.sunfounder.com/projects/sensorkit-v2-arduino/en/latest/lesson_30.html): comportamiento digital de la variante negro=HIGH. La inversión es explícita; las fotografías no identifican el modelo exacto del módulo físico.
- [Vishay, TCRT5000](https://www.vishay.com/docs/83760/tcrt5000.pdf): principio reflectivo y referencia de distancia. El simulador usa un corte geométrico ideal hasta 15 mm; no reproduce la curva analógica, luz ambiental ni ajuste óptico del comparador.
- [Pololu, buck-boost de 5 V](https://www.pololu.com/product/2123): referencia comercial de regulación desde cuatro celdas. El componente del catálogo es un equivalente didáctico con dimensiones aproximadas, cuatro bornes de alimentación y salida nominal de 5 V; no es una réplica de esa placa, no simula SHDN, eficiencia, temperatura ni su límite de corriente real.

Los móviles se comprueban en Chromium/Playwright con SwiftShader y tacto emulado; queda pendiente la aceptación y el rendimiento en teléfonos físicos. Los modelos y el circuito siguen siendo didácticos. No se ha publicado ni alterado otro módulo de la aplicación.

## Robots de orugas con protoboard y dos reguladores — 1 de noviembre de 2026

«Robot de orugas con radar y cara» y «Robot de orugas recoge cubos» llevaban sus 44 cables directos al Arduino: el pin 5V recibía 9 cables y los siete servos, la pantalla y el radar sacaban su energía de ahí. Ahora siguen el patrón de los demás robots (31 piezas, 30 uniones y 65 cables):

- **Distribución:** Arduino, protoboard y driver sobre el chasis (`board-left`, `breadboard`, `driver-rear`); dos reguladores de 5 V (`regulator` y `4wd-regulator`). Los motores siguen directo al driver, sin pasar por la protoboard; el driver se alimenta con +5V externo (puente retirado).
- **Lógica:** regulador 1 → rieles izquierdos (L). El Arduino toma 5V y GND de L+10/L−10; el driver +5V de L+3; el radar de L+5/L−5 y sus señales por las filas 5 y 7; la pantalla de L+8/L−8 y SDA/SCL por las filas 24 y 26.
- **Servos:** regulador 2 → rieles derechos (R), aparte de la lógica, porque un regulador entrega 0,5 A y siete servos piden más al moverse. Cada servo toma alimentación de R+3…R+9 / R−3…R−9 y su señal pasa por una fila (J = servo, F = Arduino).
- **Masa común:** R−25 ↔ L−25 une las masas de los dos rieles; también la unen los dos reguladores y la batería.
- **Sin cambios:** los pines del Arduino y los programas compilados.
- **Corregido de paso:** el sonido de los servos ignora saltos de menos de 0,6° (el pulso medido por el emulador oscila 1471–1476 µs y se oía como movimiento).
- **Pruebas:** `verify-robotics-tracked` (conteos 31/30/65, sin diagnósticos ni interferencias, orugas, cuello, brazos, cara y recogida de cubos), `sound`, `kit`, `assemblies`, `wire-guide(-all)`, `program-guide`, `guides-e2e`, y las de interfaz `tracked-ui`, `wire-guide-ui`, `guides-ui`, `template-ui`, `assemblies-ui`.
- **Límite:** el simulador no limita la corriente del regulador (`iMax` es solo informativo), así que la separación de servos es didáctica y no un cálculo de caída de tensión. No se publicó.

## Cuerpo humanoide del robot de orugas — 1 de noviembre de 2026

El torso era una caja baja sobre un chasis largo: el robot parecía un tanque. Ahora tiene un cuerpo de 162 mm (antes 112 mm) con proporciones humanas:

- **Torso (`robot-torso`):** vientre de vidrio ahumado abajo (la electrónica sigue visible), caderas con protecciones laterales sobre las orugas, cintura marcada con cinturón azul, pecho alto que se ensancha hacia unos hombros anchos con pectorales y un corazón luminoso, cuello con collar y espalda con rejilla. Los anclajes suben 25 mm respecto del centro: cuello a +81 mm y hombros a +59 mm (antes +56 y +34).
- **Antebrazo (`robot-forearm`):** de 72 a 122 mm. Los hombros suben 50 mm y el antebrazo se alarga lo mismo, así la pinza sigue llegando al suelo con los mismos ángulos del programa de recoger cubos (sin recompilar). El brazo superior no cambia de largo para que la pinza no se adelante.
- **Colisionadores del torso:** placa de hombros, pecho macizo, cuatro columnas del vientre y los rieles inferiores (`TORSO_BOXES`).
- **Pruebas:** `verify-robotics-tracked` (orugas, cuello, brazos, cara y recogida de cubos: los cubos suben 9 cm), `assemblies`, `kit`, `template`, `wire-guide(-all)`, `program-guide`, `guides-e2e`, `sound`, `arm`, `circuit`, `project`, `physics`, `arena`, `combat-parts` y las de interfaz `tracked-ui`, `wire-guide-ui`, `guides-ui`, `template-ui`, `assemblies-ui`, `sound-ui`.
- **Límites:** la forma es una aproximación visual; el robot sigue siendo de orugas (no tiene piernas) y la cabeza, la pantalla y los brazos no cambiaron. Mover los hombros cambia el centro de masa: no se midió en un teléfono o tablet reales. No se publicó.

## Postura de los brazos: cuelgan a los lados (2.8.2)

El robot de orugas ya no tiene los brazos en «L». Ahora cuelgan a los lados del cuerpo, por fuera de las orugas.

- **Hombros anchos:** el torso lleva una barra de hombros de 224 mm; los servos de los hombros quedan en x = ±118 mm y los brazos en x = ±146 mm, fuera de las bandas (que llegan a ±117 mm). Sin esto el brazo colgado atravesaba la oruga.
- **Nuevos ángulos:** hombro 90° = brazo colgando, 0° = horizontal hacia adelante; codo 90° = antebrazo recto, más de 90° = doblado hacia adelante. El antebrazo mide 86 mm (antes 122).
- **Posiciones del programa «recoge cubos»:** reposo (90, 140), cubo (28, 28), levantado (0, 50). Con hombro = codo el antebrazo queda vertical. Los cubos pasaron a x = ±146 mm, z = 78 mm y se levantan unos 10 cm.
- **Radar:** reposo igual (90, codos 140); al sorprenderse levanta el hombro a 40°.
- **Reposo doblado:** con el brazo totalmente recto la pinza atravesaría el suelo unos 4 cm (los hombros están a 18 cm), por eso en reposo el antebrazo queda doblado 50° hacia adelante.
- **Armado:** en la vista de construcción los brazos aparecen rectos (hombro y codo a 90°) y la pinza queda unos centímetros bajo la cuadrícula. Al pulsar ▶ el programa los lleva a la postura de reposo.
- **Programas recompilados** con el servicio local de arduino-cli: `oruga_radar`, `oruga_recoger` y los 21 programas de las guías.
- **Pruebas:** `verify-robotics-tracked` (cuelgan a −90°, suben a −41° al sorprenderse, los cubos se levantan 10 cm), program-guide, guides-e2e, template, assemblies, kit, wire-guide(-all), sound, arm, circuit, project, physics, arena, combat-parts y las de interfaz tracked, wire-guide, guides, template, assemblies y sound.
- **Límite:** el robot queda de unos 300 mm de ancho con los brazos. No se probó en teléfono ni tablet reales.
