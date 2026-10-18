# Tablero acoplable y motor de fuerza

Actualización local del 15 de octubre de 2026.

## Tablero
- Disposición base compacta en dos columnas alineadas y tres rieles: Alimentación | Botoneras, Contactor + térmico | Contactor trifásico, Temporizador | Motor. Sin huecos; el marco y los rieles se ajustan a los módulos.
- Cada módulo se mueve desde el **asa de puntos** (arriba a la izquierda) o con las flechas del teclado cuando el asa tiene el foco. Se acopla a los bordes de los demás, a los rieles y al margen (imán de 56 unidades); no permite superponerse. Una guía punteada muestra el acople.
- Los cables siguen a los módulos. La disposición se guarda en el navegador (`panellab.layout.v1`). El botón **Acomodar módulos** (barra de zoom) vuelve a la base.
- Código: `src/data/layout.ts` (posiciones, acople, marco), `src/components/Board.tsx` (asa, rieles, motor).

## Motor y simulación de fuerza
- El módulo `BORNERA_MOTOR` conserva sus siete bornes y ahora muestra el motor trifásico con rotor animado. El estado se escribe bajo el motor.
- Con **Simular**, enchufe y **FUERZA** cerrado, R, S y T llevan tensión. El motor gira si U1, V1 y W1 reciben las tres fases distintas y las bobinas forman estrella (W2-U2-V2) o triángulo (U1-W2, V1-U2, W1-V2). Cruzar dos fases invierte el sentido; falta de fase, bobinas abiertas, fases repetidas y cortocircuito entre fases se señalan sin girar.
- Los contactos de potencia de KM1/KM2 cierran solo con su bobina activa; el térmico disparado corta la fuerza de KM1.
- Ejemplo «Cargar arranque del motor con KM1» en el menú de simulación.
- No calcula corrientes, tensiones ni dimensionamiento. La velocidad en estrella es solo ilustrativa.

## Pruebas
`node qa/verify-motor.mjs` (6 comprobaciones del motor y del acople), `verify-model`, `verify-simulation`, `verify-simulation-ui`, `verify-cade`, `verify-routes`, `verify-practice`, `verify-learning-ui`.
Pendientes ajenos a este cambio: `verify-ui` (línea 137, botón «Mi diagrama») y `verify-canvas` (línea 15, «Cerrar detalles del diagrama») esperan textos anteriores de la interfaz; `verify-clean-interface` tiene el puerto 4322 fijo.
