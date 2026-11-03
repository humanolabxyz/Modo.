# Servo SG90, potenciómetro y pulsador · rendimiento de la simulación

30/10/2026 · implementación local, **sin publicar**.

## Qué se añadió

| Pieza | Id | Pines | Cómo se simula |
| --- | --- | --- | --- |
| Servo SG90 | `servo-sg90` | `SIG`, `VCC`, `GND` | El coordinador mide el ancho de cada pulso de `SIG` (flanco de subida → bajada) que genera la biblioteca `Servo` dentro del emulador AVR. 544 µs = 0°, 2400 µs = 180°; los pulsos fuera de 400–2700 µs se ignoran. El eje se acerca al ángulo pedido a 600°/s (≈ 0,1 s por 60°). Sin 4–6,5 V entre `VCC` y `GND`, o sin GND común con la placa, no se mueve. Antes del primer pulso descansa en 90°. |
| Potenciómetro 10 kΩ | `potentiometer-10k` | `VCC`, `OUT`, `GND` | El cursor reparte 10 kΩ en dos resistencias dentro del solver dinámico (0 = cursor en GND, 1 = en VCC). `analogRead` sale de la tensión real de la red. |
| Pulsador | `push-button-6mm` | `P1`, `P2` | Pulsado, une `P1` y `P2` con 0,1 Ω en el solver. Con `INPUT_PULLUP` contra GND: suelto = HIGH, pulsado = LOW. |

El potenciómetro y el pulsador se manejan **en vivo** durante la simulación desde Consola → Serie y estado → «Controles del banco» (deslizador; botón que se mantiene con el puntero o con Espacio/Enter). El valor viaja al worker con el mensaje `control` y la propiedad inicial (`position`, `pressed`) solo fija el valor de arranque.

Los tres se montan con la etiqueta `sensor-mount` (soporte genérico, soporte del sensor). Diagnósticos nuevos: servo sin alimentación, `SIG` sin conectar y GND no común.

No simulado todavía: el eje del servo es solo visual (no empuja piezas ni mueve otras piezas encajadas), y el servo no consume corriente en el circuito.

## Comprobación

| Prueba | Qué cubre |
| --- | --- |
| `npm run verify:robotics-servo` | 0° / 90° / 180° con anchos 544 / 1472 / 2400 µs reales, el eje no salta (≈ 600°/s), sin alimentación, sin señal y sin GND común, con diagnósticos. |
| `npm run verify:robotics-controls` | Pulsador → LED por el circuito; `analogRead` 0 / 255 / 511 / 767 / 1023 con el potenciómetro; sin VCC/GND da ≈ 0; potenciómetro → `map()` → `Servo.write` → eje. |
| `npm run verify:robotics-controls-ui` | Navegador real: deslizador y pulsador (puntero y teclado), eje y perilla 3D dibujados siguen al modelo, catálogo de Piezas, sin errores de consola. |
| `npm run perf:robotics-sim` | Rendimiento del paso de simulación (ver abajo). |

Fixtures compiladas con `arduino-cli` y la biblioteca oficial `Servo` 1.3.0 (instalada solo en `.cache/arduino-cli`): `servo_angles`, `servo_pot`, `button_led`. Los `.ino` están en `qa/fixtures/robotica/sketches/`.

El compilador sigue existiendo solo en el servidor de desarrollo. En el sitio publicado un sketch con `Servo.h` hay que compilarlo fuera e importar el `.hex`.

## Rendimiento de la simulación (medido el 30/10/2026, PC de desarrollo)

- Un paso de 2 ms virtuales cuesta 0,59 ms (motores rectos) y 0,94 ms (evitar obstáculo): **3,4× y 2,1× el tiempo real**.
- El emulador AVR consume el **77–87 %** del paso (≈ 50 millones de instrucciones por segundo, cerca del límite de avr8js en V8). Rapier ≈ 0,06 ms y el circuito ≈ 0,06 ms por paso.
- Con una CPU 4× más lenta se sostendría solo el 40–64 % del tiempo real. El worker no se congela: avisa «va lenta (×0,58 del tiempo real)». **No se midió en una tablet real.**
- La guardia `perf:robotics-sim` falla si algún cambio baja de 1,5× el tiempo real.
- No se saltan los `delay()` (acelerar la espera ocupada) porque falsearía el reloj del programa.
