# Fase 2: construir y enfrentar robots en sumo

Implementación local del 30/10/2026. El usuario eligió ambas modalidades, empezando por sumo; el combate con daño corresponde a la fase siguiente. El brazo y su programación conservan su práctica independiente.

## Flujo disponible

1. Abrir Robótica. Entrar por **Arena de sumo** en la bienvenida o por **Opciones del proyecto → Arena de sumo**. En escritorio también hay un botón en la barra superior.
2. Elegir los robots Azul y Naranja. La lista incluye proyectos guardados y ejemplos: minisumo, rover 4WD y robot de dos ruedas. Se permiten dos copias independientes de la misma construcción.
3. **Construir mi versión** crea un proyecto normal desde el ejemplo y abre el taller existente. **Editar construcción** abre el proyecto guardado. Las piezas se cambian con las herramientas habituales; el minisumo también aparece en las plantillas y en la guía opcional de armado, con 23 piezas.
4. Volver a la arena y elegir la construcción guardada. Para un compañero, exportar/importar el archivo `.modo.json` mediante las opciones de proyecto y seleccionar el proyecto importado. Esta fase funciona en un mismo navegador; no incorpora partidas en red.
5. Seleccionar 30, 60 o 90 segundos e iniciar. Hay tres segundos de cuenta regresiva, pausa/continuación, cancelación y revancha. El marcador dura mientras permanezca abierta la arena; cambiar participantes lo reinicia.

## Funcionamiento comprobado

Cada robot ejecuta su propio HEX en un ATmega328P emulado y resuelve su propio circuito. Los dos controladores avanzan 2 ms; luego avanza una sola vez el mundo compartido de Rapier. Ningún robot recibe velocidad o fuerza de una animación ni de una estrategia añadida por la arena. El código, cableado, alimentación y orientación de los motores conservan sus efectos.

Se reutilizan piezas, masas de catálogo, ruedas con articulación, modelo aproximado de motor TT, fricción y gravedad existentes. Se agregan capas de contacto para permitir choques entre robots, conservando la exclusión entre las ruedas y el chasis del mismo robot. El HC-SR04 puede detectar al rival sin detectar su propio robot. Los TCRT5000 leen el borde desde su posición física y alimentan el circuito y programa existentes.

Las construcciones se copian en memoria con IDs separados, se centran a cada lado de la arena y se orientan una hacia otra. No se guardan las poses del combate en el proyecto original. Las reglas y el escenario de la arena sustituyen temporalmente los escenarios individuales. La física se carga en un worker y se termina al cancelar o cerrar. La pestaña oculta pausa la ronda; si el dispositivo no alcanza la velocidad solicitada se informa y se mantiene el reloj virtual.

## Reglas didácticas

- Plataforma circular de 1,50 m de diámetro, superficie clara, franja negra de 6 cm y altura de 5 cm. El suelo inferior está 30 cm por debajo de la plataforma.
- Pierde quien mantiene el centro de su chasis fuera del radio de 0,75 m, o por debajo de y = −0,06 m, durante 0,15 s.
- Dos salidas en el mismo paso producen empate. También hay empate al agotarse el tiempo; el resultado se evalúa en el mismo reloj para ambos robots.
- La entrada requiere chasis, una sola placa UNO, al menos dos ruedas articuladas, todas las piezas conectadas al conjunto, hasta 100 piezas por robot y firmware vigente o HEX importado. No se admite el brazo en esta arena.
- El programa no arranca sin alimentación; los motores desconectados no reciben fuerza. Un fallo de emulación se informa como error de ronda y no concede una victoria ficticia.

Estas medidas, criterio de salida y configuración son reglas de esta práctica, no una reproducción de un reglamento oficial de minisumo. Los ejemplos utilizan el kit didáctico existente, no representan un Pololu Zumo comercial ni equipos certificados. Las masas y el comportamiento no sustituyen mediciones de robots físicos.

## Verificación

Historia verificada: biblioteca local → selección de dos robots → copias aisladas → worker con dos programas/circuitos → física común → árbitro → resultado, marcador y retorno al taller. No interviene un backend ni un servicio de compilación durante la ronda.

- `npm install`: sin dependencias nuevas. El auditor conserva cuatro vulnerabilidades altas previas; no se aplicaron actualizaciones forzadas.
- `npm run check` y `npm run build`: correctos. Persiste la advertencia de paquetes de más de 500 kB.
- `npm run verify:robotics-arena`: siete grupos. Incluye contacto frontal sin atravesamiento, reloj sin duplicación, ultrasonido al rival, cuenta regresiva, corte de potencia, reglas de salida/caída/empate y victoria producida por un empuje físico contra un robot con motores desconectados. Comprueba que las fuentes permanecen intactas.
- `npm run verify:robotics-arena-ui`: Chromium a 1440 × 900 y 390 × 844 con toque emulado, contra la compilación de producción local. Comprueba selección de proyectos, rechazo de vacío, pausa, victoria real del modelo, marcador, revancha, cancelación, copia editable, retorno al taller, ausencia de desborde y errores de página.
- Regresión: proyecto (9 bloques), montaje (17 bloques), armados de rover/torre/minisumo, guía de construcción de las cinco plataformas móviles y seis grupos del brazo E6.
- Evidencias: [`model-results.json`](../../qa/robotics-arena/model-results.json) y [`ui-results.json`](../../qa/robotics-arena/ui-results.json).

No se probó en teléfono/tablet físicos ni con hardware. No se publicó ni desplegó.

### Comparación visual

Taller conservado en escritorio:

![Antes: taller](../../qa/robotics-arena/desktop-before.png)

Arena añadida:

![Después: arena](../../qa/robotics-arena/desktop-arena.png)

Victoria por empuje:

![Salida física y resultado](../../qa/robotics-arena/desktop-victory.png)

Versión móvil:

![Arena móvil](../../qa/robotics-arena/mobile-arena.png)

## Archivos de esta fase

- `src/robotics/arena/model.ts`: preparación aislada, requisitos, dos controladores, árbitro y reloj compartido.
- `src/robotics/arena/arena.worker.ts`, `protocol.ts`: ejecución, pausa y mensajes tipados.
- `src/robotics/arena/ArenaPanel.tsx`, `src/styles/robotics-arena.css`: arena dentro del módulo, selección y controles accesibles.
- `src/robotics/sim/physics.ts`: opciones de arena, plataforma y contactos por equipo; uso normal conserva la configuración previa.
- `src/robotics/RoboticsApp.tsx`, `windows/RoboticsWindows.tsx`, `src/styles/robotics.css`: entradas, retorno al editor y carga diferida; el lienzo del taller se desmonta mientras está abierta la arena para evitar dos contextos 3D activos.
- `src/robotics/project/templates.ts`: minisumo disponible como construcción editable y guía.
- `qa/verify-robotics-arena.mjs`, `qa/verify-robotics-arena-ui.cjs`, `qa/robotics-arena/`: pruebas y evidencia. Se actualizan expectativas de seis plantillas en las pruebas de menú de proyectos.
- `package.json`: comandos de verificación de arena, incluidos en la verificación conjunta de robótica.

## Siguiente fase aceptada: combate con daño

Pendiente de implementación: modalidad separada con daño por impactos y desprendimiento de piezas, coherente con masa, uniones y energía del contacto. Requiere sustituir el agrupamiento rígido de cada montaje por cuerpos/uniones que puedan romperse y propagar desconexiones al circuito, definir derrota y límites de cada pieza, y verificar estabilidad. No se añadieron barras de vida ni desprendimientos visuales que no correspondan al estado físico.

Después se pueden ampliar piezas/chasis, carreras y rescate, aprovechando los proyectos existentes. La grabación visual de movimientos del brazo y sus sensores siguen reservados para otra fase, según la instrucción del usuario.
