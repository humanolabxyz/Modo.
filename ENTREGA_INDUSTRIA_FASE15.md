# ENTREGA — modo. Industria · Fase 15: planta que opera y cables por canaleta (v2.22.0)

Fecha: 2026-11-07 · Rama: `industria-fase2`.

## Cables por canaleta
- Piezas nuevas: `canaleta` (horizontal) y `canaleta-vertical` para la placa, y `canal-piso` (rejilla) para el suelo. Tapa translúcida: se ven los cables por dentro.
- `src/industria/wiring/ducts.ts` (puro, con prueba): cada pieza aporta un eje; los ejes que se tocan (hasta 45 cm) forman una red; el cable entra por el punto más cercano, viaja por dentro por el camino más corto y sale junto al destino, cada uno en su carril. `route.ts` lo usa primero; si no hay canaleta alcanzable el cable va libre como antes (y flexible, de la fase 12).
- En la mini fábrica: 5 canaletas en el tablero, 5 canales de piso; 33 de 37 cables van por dentro (los demás son puentes muy cortos o no tienen canaleta alcanzable).

## La planta opera (`src/industria/sim/process.ts`, puro)
- Motor trifásico junto a la cinta → la banda corre y arrastra las cajas (vuelven al principio al llegar al final).
- Sensor fotoeléctrico detecta cajas; sensor inductivo detecta el vástago atrás. Cierran BN–BK en la simulación lógica y llegan al PLC por el cableado (lazo cerrado).
- PLC: VALVULA ← SENSOR_CINTA; LUZ_VERDE y ROBOT ← MOTOR. Electroválvula con bobina y aire del compresor → el cilindro sale; sin bobina vuelve.
- Brazo: con A1/A2 alimentados gira el hombro y mueve la pinza. Torre: lámparas R/Y/G independientes.
- Reloj de 100 ms compartido con los temporizadores del PLC; reiniciar/detener vuelve todo al inicio.

## Límites
Velocidades, carreras y distancias de detección son de ejemplo. El robot no tiene cinemática real. La neumática solo distingue aire / sin aire. Las cajas no chocan entre sí. No es una simulación física.

## Pruebas
`npm run verify:industria`: 36 grupos, 336 comprobaciones (nuevo `process`: 9 comprobaciones de canaletas y de la planta operando).
