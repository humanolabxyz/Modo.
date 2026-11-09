# modo. Agro · Fase 3 — Conexiones e hidráulica mínima (demo 1)

Estado: implementada y verificada (ver «Pruebas»). Con esta fase se cierra la **primera demo jugable**: terreno 3D navegable, colocar objetos, conectarlos, una simulación técnica con números y guardado.

## Qué se puede hacer
- **Conectar** de tres maneras: herramienta **Conectar** (pulsar un puerto y luego otro), **«Conectar con…»** en cada puerto del inspector (lista solo los puertos libres y compatibles) o por importación. Un puerto no compatible se rechaza con su motivo (diámetros distintos → «falta un adaptador», dos salidas, tipos distintos, puerto ocupado…).
- **Acople (snap) hidráulico:** al conectar, la pieza que puede moverse se desplaza y gira hasta que los dos puertos coinciden y se miran de frente. Si ninguna puede moverse (ya están enlazadas a otras) se explica por qué. Potencia y señal son **cables**: no se acoplan, se dibujan entre los puertos.
- **Piezas nuevas:** Derivación en T (3 puertos), Aspersor (final de la red: descarga a la atmósfera) y Acometida eléctrica (fuente de 400 V trifásica). Catálogo: 11 piezas.
- **Mandos:** válvula abierta/cerrada, interruptor general del tablero, nivel de agua del estanque. Todo se deshace.
- **Medidas calculadas** en el inspector, con unidades: caudal (L/min), presión (bar) en cada puerto, velocidad, pérdida de altura, altura y potencias de la bomba. Cuando algo no funciona, **dice por qué** (falta el cable, interruptor apagado, válvula cerrada, bomba que no alcanza, aspersor sin presión…).
- **Panel «Red hidráulica»:** caudal total en los aspersores, balance fuentes − aspersores y avisos.
- **Overlay 3D:** tuberías con agua en azul y sin agua en gris; agua en movimiento (trazos animados en el sentido del flujo); cables de potencia (amarillo, brillante si hay tensión) y de señal (verde); uniones separadas en rojo discontinuo; luces de marcha en bomba y tablero; rocío en el aspersor que riega; puertos resaltados al conectar (origen, destinos válidos, ocupados).
- **Lista de piezas** (botón arriba a la derecha): selecciona cualquier pieza y lleva la cámara a ella.

## Modelo de simulación (didáctico, estacionario)
| Parte | Modelo | Ruta |
|---|---|---|
| Tuberías | Hazen-Williams, C = 140; ΔH = 10,67·L·Q^1,852 / (C^1,852·D^4,871) | `src/agro/sim/hydraulics.ts` |
| Bomba | Curva H = 30 − 320 000·Q² (Q en m³/s): cierre a 30 m, ≈ 1,1 kW hidráulicos a 300 L/min, rendimiento 60 % → ≈ 1,8 kW en el eje (nominal 2,2 kW). Con válvula de retención: no hay flujo inverso | `hydraulics.ts`, `network.ts` |
| Aspersor | Orificio: Q = Ke·√(altura de presión); Ke se da por el caudal a 10 m (por defecto 40 L/min; editable) | `network.ts` |
| Estanque | Cota del agua fija = suelo + nivel/área. **No se vacía** (el tiempo llega en la Fase 4) | `network.ts` |
| Elevaciones | Las tuberías siguen el suelo (cota del terreno + 0,1 m); las demás piezas, su altura | `network.ts` |
| Solver | Método nodal: conservación de caudal en cada nodo, Newton con búsqueda lineal; redes en árbol **y con mallas**; rampas suaves en el cierre de la bomba y tramo lineal cerca de cero (como EPANET) | `hydraulics.ts` |
| Energía | Booleana: unión de redes + propagación desde la acometida; el interruptor abre o cierra el paso en el tablero | `src/agro/sim/power.ts` |

**Reutilizado de Industria:** el algoritmo de `src/industria/sim/engine.ts` (redes por unión, propagación desde fuentes, contactos que abren y cierran) para la energía; no se importó el módulo porque está atado a `IndustryProject`. El PLC, el cableado y la escalera de Industria se incrustarán en la Fase 5.

**No es:** un modelo transitorio (sin golpe de ariete ni vaciado), ni calcula cavitación, ni pérdidas singulares, ni corrientes eléctricas o protecciones. La interfaz lo dice en las medidas.

## Reglas físicas que se verifican
- Conservación del caudal en cada nodo (≈ 10⁻¹¹ m³/s en 40 redes aleatorias) y balance fuentes − aspersores ≈ 0.
- Más tubería → menos caudal y presión; más desnivel → menos caudal; un aspersor por encima del nivel del agua no recibe nada.
- Una tubería sin conexión a un estanque no mueve agua ni tiene presión.
- Cerrar una válvula corta su rama y sube la presión aguas arriba (la bomba trabaja a cierre).
- **Mover una pieza conectada no duplica ni pierde conexiones:** si sus puertos se separan más de 25 cm la unión queda registrada pero **no conduce** (se avisa y se dibuja en rojo); al devolverla a su sitio vuelve a conducir con el mismo caudal.
- Alargar una tubería conectada la extiende desde su unión (el puerto conectado no se mueve); si choca con otra pieza se rechaza con el motivo.
- Un mundo de la Fase 2 se actualiza al abrir: los puertos de cada pieza adoptan la definición vigente del catálogo siempre que no se pierda ninguna conexión.

## Decisiones
- El **aspersor** es el final obligatorio de la red: un extremo libre de tubería queda tapado (no descarga). Así «agua que sale» siempre significa riego medido.
- El estado `connected` solo existe si los puertos son compatibles (lo exige el validador de archivos).
- La bomba **no tiene interruptor propio**: arranca si le llega tensión por el tablero.
- Los números de la bomba son de una curva didáctica coherente (altura × caudal × ρ·g ≤ potencia nominal), no de un fabricante.

## Pendientes conocidos
- Cada puerto admite una sola conexión (las derivaciones se hacen con la T).
- No hay adaptadores entre diámetros ni curvas/codos: las tuberías son rectas.
- Las uniones por cable no tienen límite de corriente ni protecciones (Fase 5).
- El estanque no se vacía y el suelo no recibe el agua todavía (Fase 4).
- La herramienta Conectar requiere ratón o toque preciso sobre el puerto; «Conectar con…» es la alternativa accesible.

## Pruebas
`npm run verify:agro` → modelo (67), terreno (39), mundo y persistencia (56) e **hidráulica y conexiones (44)**. Estas últimas incluyen casos con solución independiente (gravedad pura y punto de operación bomba–red, resueltos por bisección), Hazen-Williams contra valor de tabla (2 L/s en 100 m de Ø50 ≈ 2,5 m), mallas, redes aleatorias, acople geométrico, rechazos con motivo y el recorrido completo estanque → tubería → bomba → válvula → tubería → aspersor con energía.
`npm run verify:agro-ui` → 30 bloques con ratón y teclado reales, incluido el recorrido de la demo y la herramienta Conectar.
