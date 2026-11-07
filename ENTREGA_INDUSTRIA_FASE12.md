# ENTREGA — modo. Industria · Fase 12: cables flexibles y piezas con más detalle (v2.19.0)

Fecha: 2026-11-07 · Rama: `industria-fase2`.

## Cables
- **Flexibles**: esquinas redondeadas (radio mínimo 35 mm), caída por gravedad en tramos largos y horizontales (hasta 3 cm; no cuelgan si tocarían una pieza) y casquillo metálico en cada punta. `src/industria/wiring/curve.ts` (puro, con prueba).
- **Organizables**: al elegir un cable en Conexiones aparecen sus puntos de paso. Arrastrar uno azul lo mueve en 3D; arrastrar uno claro añade otro; doble clic lo quita. «Ruta automática» devuelve ese cable al enrutado automático; «Ordenar todos» borra las rutas manuales. Cada cambio es un paso de deshacer/rehacer y se guarda con el proyecto.
- **Límite**: solo es apariencia; no hay rigidez, peso, radio de curvatura real ni longitud de cable.

## Piezas
Bordes redondeados, sombras suaves (hasta 80 piezas), luz de cielo y relleno, jaula y abrazadera en cada borne, nervaduras en los aparatos de riel, tapa de ventilador y placa en el motor, marco claro en la placa. Siguen siendo formas por tipo de aparato, no réplicas de un fabricante.

## Pruebas
`npm run verify:industria`: nuevo grupo `flex` (6 comprobaciones); 33 grupos. La prueba de interfaz de cables ahora espera tubo + 2 casquillos.

## Pendiente (pedido por el usuario, aún no hecho)
Escenario de **mini fábrica** con más piezas (neumática, hidráulica, sensores, transportador, robot, tanques…), formas basadas en equipos reales y su forma de montaje. Es un trabajo aparte y grande: ver el plan en la conversación.
