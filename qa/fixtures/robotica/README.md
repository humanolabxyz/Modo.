# Fixtures de Robótica (etapa 4)

`.hex` compilados de `sketches/*.ino` con `arduino-cli` 1.5.1 y el núcleo `arduino:avr` 1.8.8 (placa `arduino:avr:uno`), a través de
`scripts/robotica-compile-service.mjs`. Se versionan para que las pruebas (`qa/verify-robotics-mcu.mjs`) **no dependan del compilador**.

- Regenerar: `node qa/fixtures/robotica/build-fixtures.mjs` (necesita `.cache/arduino-cli`).
- Procedencia: los sketches son propios de este proyecto; cada `.hex` incluye código del núcleo de Arduino (LGPL-2.1) y de avr-libc.
  Son **solo datos de prueba**: no se sirven en el sitio ni forman parte del producto.
- `bad_syntax.errors.json` es la salida real de avr-gcc para `sketches/bad_syntax.ino` (errores en las líneas 3 y 5).
- Pines usados: TRIG = D9, ECHO = D10 (HC-SR04); IN1 = D4, IN2 = D7, IN3 = D8, IN4 = D12, ENA = D5, ENB = D6 (L298N); LED en D13.
