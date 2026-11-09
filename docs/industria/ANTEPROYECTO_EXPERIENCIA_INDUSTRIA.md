# Anteproyecto de Industria · PanelLab

## Objetivo

Recorrer una instalación didáctica desde la nave hasta un borne concreto. La persona debe poder ubicar el tablero, inspeccionarlo, entender cómo está cableado, seguir el programa y comprobar el resultado en la planta. El ejemplo «Línea de producción» será el caso de referencia para probar todo el recorrido.

## Diagnóstico del ejemplo actual

- **Planta 3D.** Al abrir el ejemplo en Chromium, la sala eléctrica se reconoce por su puerta verde, pero sus paredes ocultan el gabinete desde la cámara inicial. La nave exterior ya tiene ocultación de paredes según la cámara. La sala eléctrica es otra entidad y sus muros se dibujan como geometría fija. El gabinete ya admite puerta cerrada, abierta o transparente desde Propiedades, pero esa opción no resuelve la visibilidad de la sala. «Encuadrar» usa una cámara fija y tampoco lleva al gabinete elegido.
- **Modelo físico.** En el ejemplo, el gabinete está montado sobre el plinto y los pulsadores S1, S2 y el piloto H1 están montados en la puerta. La placa queda dentro por coordenadas, sin un vínculo explícito con el gabinete. La sala y el gabinete tampoco tienen una relación explícita de ubicación. Para navegar entre ellos y mover el conjunto correctamente conviene distinguir **ubicación** de **montaje físico**.
- **Tablero.** La vista muestra un alzado de la placa con rectángulos y puntos para bornes. En la mini fábrica, S1, S2 y H1 aparecen en «Fuera del tablero» aunque pertenecen a la puerta. La pantalla tampoco muestra con claridad dónde termina cada cable.
- **Diagrama.** Ya hay hojas de fuerza y mando, referencias entre hojas, selección compartida y exportación SVG. Es una base útil. Falta que un usuario pueda seguir un circuito y saltar del símbolo o del cable a su ubicación física.
- **PLC y HMI.** El PLC genérico tiene variables, ramas y bobinas editables, con escaneo simulado. La pantalla parece un formulario y hasta anuncia que no admite temporizadores ni contadores, aunque el editor y el escaneo ya incluyen TON y CTU. La HMI enlaza controles con variables en una sola superficie y carece de una separación clara entre diseño y operación.
- **Documentación.** El contenido se genera a partir del proyecto, pero abre con el listado de materiales de 67 componentes del ejemplo. El propósito del montaje y la secuencia de operación quedan sin una entrada clara entre las tablas de cables, E/S, programa, redes y avisos.

## Propuesta por vista

| Vista | Cambio propuesto | Criterio de aceptación |
|---|---|---|
| **Planta 3D** | Añadir destinos «Nave», «Sala eléctrica» y «Tablero» que encuadren según la ubicación y orientación del objeto. Conservar una vista completa y ofrecer **Corte automático**, estilo juego de construcción, que baje u oculte solo los lados que se interponen. Mantener piso, muros de fondo y marcos como referencia. Añadir «Ver interior» para acercar y mostrar la placa. | Desde la nave se llega al gabinete en dos acciones visibles. Se ven sus componentes al orbitar alrededor de una sala incluso si está girada. Al volver a Nave se recupera el contexto. Abrir la inspección, aplicar el corte y mover la cámara no cambian la instalación guardada. |
| **Tablero** | Vista frontal del gabinete con capas **Puerta / Placa / Cableado**. Puerta muestra mandos y piloto. Placa muestra rieles, canaletas, protecciones, fuente y PLC con sus etiquetas. Cableado permite seguir una conexión y leer origen y destino. Incorporar zoom y una ficha lateral de componente o borne. | S1, S2 y H1 aparecen en Puerta. PLC y KM1 aparecen en Placa. Seleccionar KM1 permite localizarlo en 3D y abrir su símbolo en Diagramas. Equipos de campo como M1 se identifican aparte. |
| **Diagramas** | Conservar hojas y trazado editable. Añadir un recorrido resaltado por circuito, rótulos de terminales, referencias navegables entre hojas y accesos «Ver en tablero» y «Ver en planta». | Desde el símbolo de KM1 se puede seguir mando o fuerza sin perder la selección al cambiar de hoja o vista. |
| **PLC** | Usar ISPSoft como referencia de flujo. Árbol del proyecto con PLC, E/S y programa. Editor Ladder gráfico con carriles, contactos NA/NC, ramas, bobinas y comentarios. Acciones **Editar → Validar → Simular → Monitorizar** con tabla de variables, estados de redes y avance de temporizadores y contadores. Aprovechar el motor que ya existe. | Se puede editar y validar una red de marcha/paro. En monitor se observa el paso de una entrada física a su variable, la condición de la red y el cambio de la salida simulada. |
| **HMI** | Separar **Diseño** de **Operación**. Diseñar pantallas con objetos editables, posición y propiedades, y una tabla de enlaces a variables del PLC. Primer alcance con Marcha, Paro, indicador de motor y estado de la cinta. | El mando en la HMI produce el mismo efecto en el PLC y en la planta que el mando equivalente del tablero dentro de la simulación. |
| **Documentación** | Abrir con una ficha que explique propósito, alcance y secuencia de operación. Dar acceso por secciones a plano, materiales, cables, E/S y pruebas. Generar las fichas, tablas y exportaciones desde el mismo proyecto. | Se entiende qué hace la línea antes de abrir las tablas. Una persona puede buscar KM1 y encontrar su ubicación, sus conexiones y la prueba donde interviene. Los CSV conservan los datos tabulares. |

## Decisiones técnicas para la primera entrega

- Registrar la ubicación de gabinete y sala con identificadores estables, separados de los anclajes. Incorporar la unión física de placa y gabinete mediante un anclaje adecuado tras verificar el encaje. Mantener la placa independiente como caso válido en proyectos anteriores.
- Clasificar muros, marcos y obstáculos visuales por lado de cada recinto. Evaluar la vista en coordenadas locales para que el corte funcione con recintos rotados. Guardar cámara y corte como estado de interfaz. La apertura física sigue siendo una acción aparte que mueve los mandos montados y actualiza la ruta visible de sus cables.
- Compartir selección entre vistas por identificador de componente, borne y conexión. Los nombres editables sirven como etiquetas. Conservar formato de proyectos, montaje, cableado y exportaciones al introducir la navegación.
- Mantener inicialmente el PLC genérico de PanelLab como simulador educativo. En una fase posterior, elegir el modelo Delta del laboratorio para contrastar bornes, direccionamiento e instrucciones con su manual. La transferencia a hardware y la compatibilidad de archivos propietarios se tratarían como integraciones aparte.

## Orden de implementación

1. **Inspección 3D.** Reproducir la vista inicial de la mini fábrica y cerrar el recorrido Nave → Sala eléctrica → Gabinete → Interior. Probar con mouse, toque, dos gabinetes y un recinto rotado.
2. **Tablero y diagrama.** Representar puerta y placa del mismo gabinete. Enlazar terminales y circuitos entre planta, alzado y esquema. Verificar que un proyecto anterior con placa suelta se sigue abriendo.
3. **PLC y HMI.** Redibujar Ladder y separar editar de monitorizar. Incorporar diseño y operación HMI sobre las mismas variables. Validar con el ejemplo antes de definir un perfil Delta.
4. **Documentación.** Generar la ficha de operación y navegación por secciones a partir del proyecto. Comprobar que coinciden el plano, los nombres de bornes, las referencias de cables y las E/S.

La prueba integradora será seguir **S1 → DI0 / START → red de marcha → DO0 / MOTOR → KM1 → M1** en el ejemplo. La persona debe poder recorrerlo en planta, tablero, esquema y monitor PLC, comprobar el resultado simulado y encontrar la misma secuencia en la ficha del proyecto.

## Referencias Delta

- **ISPSoft** es la referencia de programación PLC. Delta documenta configuración, edición y monitorización de programas y variables. La compatibilidad se comprueba con el manual del modelo de CPU elegido. [ISPSoft](https://www.deltaww.com/en-US/products/plc-programmable-logic-controllers/3598) · [Manual DVP-ES3 de hardware y operación](https://filecenter.deltaww.com/Products/download/06/060301/Manual/DELTA_IA-PLC_DVP-ES3_HOM_EN_20220311.pdf)
- **DOPSoft** es la referencia para editar pantallas HMI. Delta también ofrece **DIAScreen** para familias de pantallas como DOP-100. Para PanelLab interesa la secuencia de diseñar una pantalla, enlazar sus objetos a variables y probarla en operación. [DOPSoft](https://www.deltaww.com/en-US/service-support/faq/1812) · [DIAScreen](https://diastudio.deltaww.com/home/Specification?Type=4)
