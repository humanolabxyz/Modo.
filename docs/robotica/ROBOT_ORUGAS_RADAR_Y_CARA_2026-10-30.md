# Robot de orugas con cabeza de radar y cara · brazos con pinza · sonidos

30/10/2026 (etapa 2) · actualizado el 31/10/2026 (etapa 3: brazos que recogen y sonidos) · implementación local, **sin publicar** desde la 2.7.0. Se construye, se cablea y se programa con las guías de la etapa 1.

## El robot
Plantilla **«Robot de orugas con radar y cara»** (`robot-oruga-radar`): un robot **de pie**, inspirado en la referencia que compartiste (torso, cabeza con pantalla de ojos y boca, brazos con manos negras y ruedas grandes abajo), con paleta blanca, negra y azul claro. **28 piezas, 27 uniones, 44 cables y 7 servos.** Se ve y se arma por niveles:

- **Base de oruga** (acabado `oruga` del chasis): placa blanca con franjas azules, parachoques con faros y luces traseras.
- **Orugas:** dos motores TT con rueda motriz dentada y banda con dientes. Se comportan como un robot de dos ruedas con patines largos: la banda desliza sobre el suelo y el robot avanza por la rueda motriz (aproximación honesta, no el deslizamiento real de una oruga). Los patines van 2,5 mm más arriba que la rueda: el robot descansa sobre las ruedas y los patines solo tocan si se inclina.
- **Cuerpo (carcasa):** compacta, de 136 × 112 × 150 mm: marco blanco con borde azul y **paredes de vidrio ahumado** que dejan ver la electrónica. Lleva arriba el cuello y a cada lado un hombro.
- **Cuello y cabeza:** servo SG90 en D3 que **gira la cabeza entera**. La cabeza (104 × 78 × 78 mm) lleva al frente la **pantalla OLED de 2,42"** (la cara) y arriba el **HC-SR04** (el radar): el sensor mide **hacia donde mira**.
- **Brazos largos (2) con hombro, codo y pinza.** Cada brazo tiene **tres servos**:
  - **Hombro** (izquierdo D11, derecho D2): sube y baja todo el brazo. En reposo (90°) el brazo apunta **hacia adelante, a la altura de las orugas**; con menos de 90° se levanta.
  - **Codo** (D13 y A0): estira o recoge el antebrazo. Con más de 90° el antebrazo se estira hacia adelante.
  - **Pinza** (A1 y A2): dos dedos que corren sobre un riel; 0° = muy abierta (64 mm), 90° = casi cerrada (19 mm).
  - Los servos del lado derecho van **en espejo** (180 − ángulo) para moverse igual que los del izquierdo.
- **Programa del robot (`robot-oruga-radar`):** avanza; si ve algo a menos de 25 cm **frena** (motor en corto), pone cara de **sorpresa**, **levanta los brazos**, mira a 70° a cada lado midiendo, elige el lado más libre y gira ~100° en el sitio hacia él; luego baja los brazos y vuelve a la cara normal. Con la pared a la izquierda y una caja al frente, gira a la derecha y esquiva la caja.
- **Variante «Robot de orugas recoge cubos»** (`robot-oruga-recoger`): el mismo robot parado frente a **dos cubos de 30 mm** (40 g) sobre el suelo. Su programa estira los dos antebrazos (codo 100°), cierra las pinzas, pone cara de contento, **levanta los cubos** (hombro 60°), los baja, los **suelta** y recoge los brazos.
- Orientación: el frente es +z y la **izquierda es +x**. El motor 1 (IN1/IN2, ENA) es el izquierdo; con el cuello a más de 90° la cabeza mira a la izquierda.
- El escenario de la plantilla principal trae cajas de **40 cm** de alto: el radar va en la cabeza, a ~25 cm del suelo, y pasaría por encima de una caja de 20 cm.

## Cómo agarra la pinza
Cada pinza es un cuerpo cinemático con dos dedos (cajas de 6 × 34 × 30 mm) que se separan según el ángulo de su servo. Un objeto movible (los cubos son cuerpos dinámicos con su masa) se **agarra** cuando los dedos están cerrados sobre él (separación ≤ tamaño + 4 mm) y queda dentro de la zona entre los dedos; entonces sigue a la pinza y no empuja al robot. Se **suelta** cuando la separación pasa de tamaño + 8 mm y cae por gravedad. Con el codo a 100° la pinza queda a ras del suelo, justo donde están los cubos de la plantilla.

Es una aproximación didáctica: no hay fricción de dedos ni deslizamiento del objeto dentro de la pinza. Lo que sí es físico: la masa, la caída, los empujones cuando no está agarrado y que las pinzas no agarren si no llegan o están abiertas.

## Lo que se añadió al simulador
| Pieza o función | Detalle |
| --- | --- |
| **I²C en el emulador** | El controlador TWI de avr8js ya existía; se añadió el bus (`mcu/i2c/bus.ts`) con dispositivos esclavos. Sin dispositivo en la dirección, el bus da NACK y las bibliotecas lo detectan. |
| **Pantalla SSD1306 128×64** (`mcu/i2c/ssd1306.ts`) | Emula lo que usan Adafruit_SSD1306 y los programas con Wire. Lo que se ve sale de lo que el programa escribió. |
| **Pieza «Pantalla OLED 2,42" I²C»** | 4 pines (GND, VCC, SCL, SDA). Solo responde si está alimentada, con GND común, SDA en **A4** y SCL en **A5**; si no, la Consola explica por qué. |
| **Cuello y servos en cadena** (`sim/physics.ts`) | Un servo con una pieza en su cuerno (`horn`) gira esa pieza y todo lo que cuelga de ella, también encadenado (hombro → brazo → codo → antebrazo → pinza) y con los rayos del radar. 90° = reposo. |
| **Piezas nuevas (catálogo de 35)** | Cabeza, rueda motriz de oruga, banda de oruga, cuerpo (carcasa), **brazo largo, antebrazo y pinza**, con modelos 3D y miniaturas. El chasis gana el acabado `oruga`. |
| **Objetos movibles** | Los obstáculos pueden ser `movable` (con `massKg`): cuerpos dinámicos que se empujan, se agarran con la pinza y se dibujan donde los deja la física. |
| **Freno del L298N** | Con IN1 = IN2 y enable puesto el puente H cortocircuita el motor (freno rápido): el motor frenado se opone al giro. Afecta a todos los robots. |
| **Sonidos** | Ver abajo. |

## Sonidos
Todo se **sintetiza con Web Audio** (sin archivos) y sale de lo que pasa en la simulación, no de una grabación:

| Qué | Cómo suena |
| --- | --- |
| **Motores** | Zumbido grave de motor con caja reductora y un chillido de engranajes; el tono y el brillo suben con la velocidad real (la tensión que entrega el puente H). Cada motor suena por su lado (estéreo). Con el motor frenado en corto no zumba. |
| **Orugas** | Golpeteo de los eslabones sobre el suelo, más rápido cuanto más avanza el robot. Por debajo de 3 cm/s no suena (es solo el temblor de los brazos). |
| **Servos** | Zumbido agudo con arenilla de engranes de plástico mientras giran, según los °/s reales; cada servo suena un poco distinto. Un clic al arrancar y otro al parar. |
| **Freno** | Golpe seco grave al pasar de avanzar a frenar. |
| **Pinzas** | Chasquido metálico al agarrar un cubo y un golpecito al soltarlo. |
| **Encendido** | Dos pitidos cortos cuando la placa recibe energía. |

Un botón de altavoz en la barra de simulación silencia o activa los sonidos y **recuerda la elección** en el navegador (`panellab.robotica.sonido`). El audio solo arranca tras un clic del usuario (▶ o el propio botón), como exigen los navegadores. Sin energía, detenido o en pausa no suena nada. No se midió el volumen en altavoces reales: el nivel es moderado y pasa por un compresor para evitar saturar.

## Guías para este robot
- **Armar:** 28 pasos (Base · Tracción · Control · Potencia · Cuerpo · Cuello y cabeza · Sensores · Brazos y pinzas), con «Encajarla por mí». Cada servo lleva su función (hombro, codo o pinza).
- **Cablear:** 47 pasos generados de la plantilla (3 ajustes y 44 cables), con un grupo propio «Brazos y pinzas»; cada servo se nombra por su función (por ejemplo «servo codo izquierdo»). Cable espectro en el 3D.
- **Programar:** 6 pasos para el robot principal (orugas y freno → cuello → radar → cara → brazos y pinzas → decidir). El último es exactamente el programa de la plantilla. La variante que recoge cubos tiene su propia guía de **3 pasos** (abrir y cerrar pinzas → estirar el antebrazo → agarrar, levantar y soltar).
- Seguir las tres guías desde un proyecto vacío deja un robot que termina a **0,0 cm** de la plantilla en la física, tanto el principal como el que recoge cubos.

## Pruebas
| Prueba | Qué cubre |
| --- | --- |
| `npm run verify:robotics-i2c` | Wire directo y **Adafruit real**: la memoria de la pantalla coincide byte a byte; NACK sin pantalla; dirección 0x3D; reinicio del chip. |
| `npm run verify:robotics-display` | Pantalla como pieza del robot: bien cableada muestra la cara; SDA/SCL cruzados, sin alimentación o en otra dirección no responde y se explica. |
| `npm run verify:robotics-tracked` | Armado (28 piezas, 27 uniones, 44 cables), programa, orugas y freno, cuello y rayo del radar, brazos simétricos en espejo, elección del lado libre, cara, sin energía en el cuello, y la variante **recoge cubos**: los dos cubos se agarran, se levantan hasta 8 cm y se sueltan sobre el suelo. |
| `npm run verify:robotics-tracked-ui` | Navegador real: se abre armado (28 piezas), ▶ avanza, la cabeza gira de −70° a +70° y la pantalla cambia de cara. |
| `npm run verify:robotics-sound` | Qué debe sonar en cada instante: motores y orugas al avanzar, silencio con el motor frenado, golpe de freno, servos que zumban y hacen clic, chasquidos de las pinzas, un solo pitido de encendido, nada sin energía. |
| `npm run verify:robotics-sound-ui` | Navegador real: el audio arranca con ▶, el botón silencia y recuerda la elección tras recargar; se guardan capturas del robot agarrando los cubos. |
| `npm run verify:robotics-program-guide` · `…-guides-e2e` · `…-wire-guide-all` | Incluyen los dos robots de orugas (10 robots con guía, 5 guías y 21 programas). |

Bibliotecas de compilación usadas (solo en `.cache/arduino-cli`, no se publican): Servo 1.3.0, Adafruit SSD1306 2.5.17, Adafruit GFX 1.13.0 y Adafruit BusIO 1.17.4. El compilador sigue existiendo solo en el servidor de desarrollo: en el sitio publicado, un programa con estas bibliotecas se compila fuera y se importa el `.hex`; los programas de las plantillas y los de las guías ya vienen compilados.

## Rendimiento
El robot de orugas completo (física, siete servos, radar, I²C y pantalla) corre a **~1,5–1,6× el tiempo real** en el PC de desarrollo (antes de los brazos con codo y pinza eran ~1,8×): paso de 2 ms virtuales ≈ 1,3 ms. Un perfil muestra que ~70 % del tiempo es el emulador AVR (cada servo de la biblioteca Servo añade interrupciones del temporizador) y la física es ~3 %. Con una CPU 4× más lenta se sostendría ~30 % del tiempo real: el worker no se congela, avisa «va lenta». **No se midió en una tablet real.** La guardia `npm run perf:robotics-sim` exige al menos 1,4× (bajó de 1,5× por los servos añadidos; el valor se mueve ±0,1 según la carga del PC).

## Proporciones
La primera versión salió desproporcionada y se rehízo (31/10/2026): cuerpo corto y redondeado, cabeza casi tan ancha como el cuerpo con una pantalla grande, orugas anchas abajo y paleta blanca, negra y azul claro. Luego los brazos pasaron a ser **largos y con estructura de robot** (brazo, antebrazo con ejes, pinza con riel y servo propio), en reposo apuntando hacia adelante para poder recoger cosas del suelo; se parecen menos a los de la foto de referencia a cambio de poder agarrar.

## Límites conocidos
- Las orugas son una aproximación (rueda motriz + patines de bajo rozamiento).
- Los colisionadores de la cabeza y de los brazos no giran con sus servos: se dibujan girados, pero su cuerpo físico sigue en reposo. El radar sí mide girado y los dedos de la pinza sí se mueven y agarran.
- El agarre es didáctico (el objeto sigue a la pinza sin deslizarse). La pinza solo alcanza a ras del suelo en el rango del codo cercano a 100°; con otras posturas queda inclinada y puede no agarrar. Los cubos de la plantilla están puestos para ese alcance.
- El robot mide ~27 cm de alto: con el torso y la cabeza el centro de masa sube; se verificó que no vuelca al frenar.
- El I²C solo soporta escritura hacia la pantalla; no hay otros dispositivos I²C ni lectura de la pantalla.
- Los sonidos son sintéticos y aproximados: no imitan una grabación de los motores reales.
