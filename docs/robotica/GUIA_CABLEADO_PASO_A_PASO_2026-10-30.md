# Cableado paso a paso dentro de la app

30/10/2026 · etapa 1a · implementación local, **sin publicar**.

## Qué hace
En el modo **Construir**, el botón **Cableado** abre el panel «Cableado paso a paso». Eliges una guía y la app muestra siempre **el siguiente paso**: qué conectar, de qué color y **por qué**. Al cambiar de paso resalta los dos pines en el 3D y encuadra la cámara. Un paso se marca solo cuando los dos pines quedan en la **misma red eléctrica**, sin importar si el cable fue directo o por la protoboard ni qué GND se usó (lo que mediría un multímetro).

- **Cable equivocado:** si un cable sale de un pin del paso hacia *otro* pin de la misma pieza (por ejemplo D5 a ENB en vez de ENA), aparece «Cable por revisar» con la explicación exacta, aunque haya pasos anteriores pendientes.
- **Pieza que falta:** el paso queda «bloqueado» y dice qué pieza armar primero.
- **«Poner el cable por mí» / «Hacerlo por mí»:** aplica el paso (cable o ajuste, con deshacer del historial).
- El avance sale del proyecto, no de un contador aparte: sobrevive a recargar y a deshacer.
- Lista «Ver todos los pasos» con ✓ en los hechos.

## Cable espectro en el 3D
El cable del paso actual se dibuja **translúcido, del color que hay que usar, con un halo azul que pulsa y un punto en cada pin**, igual que las piezas fantasma del armado. Sigue a las piezas si las mueves, usa la misma ruta que los cables reales y salta solo al cable siguiente cuando pones el actual. Al completar la guía o cerrar el panel desaparece.

## Para todos los robots
Cada plantilla con cables tiene su guía, **generada automáticamente** desde su cableado (`guide/fromTemplate.ts`): un cable = un paso, agrupados en Ajustes → Alimentación → Motores → Control del puente H → Sensores y accesorios, con el porqué de cada pin. Los ajustes (voltaje de la batería, puentes del L298N) salen de lo que la plantilla cambió respecto de fábrica. Las piezas del usuario se emparejan con las de la plantilla por su posición (el mismo emparejamiento del modo fantasma de armado) y, si no coinciden, por tipo y orden. Un robot nuevo con plantilla tiene guía sin escribir nada. Los brazos, sin cables, no tienen.

Guías hoy (9): la escrita a mano (con explicaciones más cuidadas) y 8 generadas: Robot 2 ruedas listo para usar (32 pasos), seguidor de línea (40), explorador con luces (38), Rover 4WD (48), Minisumo (40), Sumo cuña (40), Sumo pala 4WD (56) y Sumo defensa (40).

## Guía incluida a mano
**Robot 2 ruedas · evita obstáculos** (21 pasos: batería a 9 V, quitar puentes ENA/ENB, y 18 cables de alimentación, motores, control del puente H y sensor HC-SR04). Sigue `GUIA_PRIMERA_PRACTICA.md`.

## Cómo agregar una guía
Una guía es un dato en `src/robotics/guide/guides.ts`: lista de pasos `wire` (dos pines, color, porqué) y `prop` (ajuste de una propiedad). Las piezas se nombran por definición y orden (`{def: 'dc-motor-tt', n: 1}` = el segundo motor). Se agrega a `WIRING_GUIDES`.

## Pruebas
| Prueba | Qué cubre |
| --- | --- |
| `npm run verify:robotics-wire-guide` | Estados de cada paso, aplicar los 21 en orden, cable equivocado, equivalencia eléctrica de GND, pieza faltante, resaltado. **Seguir la guía completa deja un robot que avanza 1,05 m** en la física. |
| `npm run verify:robotics-wire-guide-all` | Las 8 plantillas con cables: se quitan todos los cables, se aplica la guía y el robot resultante **se mueve igual que la original** (0,0 mm de diferencia con el mismo programa); sin cables se mueve distinto en las 8. |
| `npm run verify:robotics-wire-guide-ui` | Navegador real: elegir guía, aplicar paso a paso hasta «¡Cableado completo!» (18 cables en 3D), cable espectro que salta al paso siguiente, aviso de cable por revisar, recarga, guía generada del Rover 4WD y panel dentro de 390 px de ancho. |

## Pendiente de la etapa 1
- **1b · programación paso a paso:** código en trozos explicados, cada uno comprobado en el simulador.
- **1c · armar por pasos** ordenados con el modo fantasma existente, y el cable fantasma entre pines.
- El robot de orugas traerá su plantilla y, con ella, su guía de cableado.
