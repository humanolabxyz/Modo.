# modo. Agro · Fase 5c — Arte 3D del paisaje y las piezas

Estado: implementada y verificada con las pruebas existentes (`verify:agro` y `verify:agro-ui`, 48 bloques). Es una mejora visual: no cambia el formato del mundo, la simulación ni los resultados guardados.

## Qué cambió
- **Terreno estilizado:** pradera verde con parches de pasto seco, claros de tierra en los llanos, bosque bajo en las laderas, roca en las pendientes y nieve en las cumbres. Es solo el color por vértice (`terrainColor`); la altura y el relieve son los mismos (la suma de comprobación del terreno no cambia).
- **Vegetación** (`scene/Vegetación`): unos 3 000 árboles repartidos con un generador determinista (semilla del terreno): latifoliadas, pinos en altura y algunos con flor. Se apartan de las piezas y de las parcelas, y no se plantan en pendientes fuertes. Son instancias (3 mallas por especie), decorativas y sin clics.
- **Cultivo en hileras** (`scene/Crops`): cada planta es una instancia; el tamaño sigue el avance del ciclo, el color la salud (verde sano → amarillo estresado → marrón muerto) y el tomate muestra fruto verde y luego rojo al madurar. Reemplaza la capa traslúcida anterior.
- **Piezas más detalladas:** estanque con patas, techo cónico, escalera y bandas; bomba con voluta, aletas y bridas; tablero con visera, pantalla, rótulo y pilotos; panel solar con marco y celdas; acometida con travesaño y aisladores; válvula con volante y bridas; sonda con punta.
- **Sombras de contacto** bajo cada pieza (manchas suaves, no sombras proyectadas).
- **Cielo y luz:** cielo más azul, niebla clara, luz de cielo y de suelo verdosa, sol cálido y nubes (sprites con textura dibujada, sin recursos externos).
- Las etiquetas de los equipos se ocultan en la vista estratégica.

## Qué NO es
- No son modelos ni texturas de un artista: todo se arma con primitivas y colores. Sigue sin haber agua (ríos o estanques naturales), caminos, invernaderos ni animales.
- No hay sombras proyectadas ni oclusión ambiental.
- La vegetación no se simula (no crece ni se corta) y no entra en el archivo del mundo.

## Costos medidos (solo con renderizado por software)
Entre 135 000 y 180 000 triángulos y 130–210 llamadas de dibujo en una escena con la finca (antes, ≈ 80 000 triángulos y ≈ 35 dibujos). **No se midieron los FPS en una GPU real ni en una tablet**: sigue pendiente, y es lo que decidirá si hace falta bajar la densidad de árboles o activar niveles de detalle.

---

# Fase 5d — Más arte 3D: río, camino, construcciones construibles y detalles

Estado: implementada y verificada (`verify:agro` con 40 comprobaciones de terreno y `verify:agro-ui` con 48 bloques). Sigue siendo solo imagen: no cambia el relieve, la simulación ni el archivo del mundo.

## Qué se agregó
- **Río** que serpentea al este de la finca (fuera de la zona de trabajo): pintado en el terreno con orilla de arena y una cinta de agua brillante encima. **Camino de tierra** que llega a la finca desde el borde oeste sin cruzar el río. Ambos son deterministas por semilla (`terrain/landmarks.ts`) y aparecen también en el **minimapa**, que ahora es verde.
- **Construcciones del catálogo** (familia nueva «Infraestructura», en el dock de Construir y en «Objetos»): **granero** (con puerta y desván), **invernadero** (ancho 4–16 m y largo 6–60 m editables, estructura de arcos y cubierta traslúcida), **molino de viento** y **cerca** (largo 2–50 m). Son piezas sólidas del jugador: se colocan con el fantasma y sus reglas de pendiente y choque, se mueven, giran, renombran, eliminan y deshacen como las demás, y se guardan en el mundo. No tienen puertos ni función de simulación todavía (el inventario y las obras llegan en la Fase 6; el molino no bombea ni genera).
- **Rocas** (más en las pendientes) y **flores** sueltas en la pradera; los árboles se apartan del río, del camino y de las construcciones.

## Límites
- El río **no excava** el terreno ni lleva agua simulada: es una cinta a la altura más baja de cada sección, y en pendientes fuertes se nota que flota. No hay lagos, caminos que el jugador pueda trazar, animales, puentes ni sombras proyectadas.
- El río, el camino, las rocas y las flores son decorativos: no se pueden seleccionar ni mover. Las construcciones sí son piezas reales.
- Costo con renderizado por software: ≈ 187 000 triángulos y 228 dibujos en una escena con finca. **Los FPS en una GPU real y en una tablet siguen sin medirse.**
