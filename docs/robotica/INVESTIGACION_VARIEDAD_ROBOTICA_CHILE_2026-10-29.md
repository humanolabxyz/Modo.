# Ampliación de robótica: productos vigentes y aplicación en Chile

Fecha de consulta: **29 de octubre de 2026**, America/Santiago.

Alcance: investigación para implementar las cinco familias solicitadas: brazos, rescate, minisumo, estacionamiento y clasificación. Se revisaron fuentes públicas de fabricantes, proveedores chilenos e instituciones, además del código local. Este informe no incorpora todavía robots ejecutables al simulador.

## 1. Criterio de selección y vigencia

- **Uso documentado en Chile:** una institución o participante describe la utilización efectiva. No equivale a conocer el inventario actual de todas las sedes.
- **Comercialización local:** un proveedor chileno publica el modelo. No demuestra instalación, stock inmediato ni adopción nacional.
- **Vigente en catálogo:** fabricante mantiene oferta o documentación del producto. No equivale a una garantía de producción futura.
- **Activo explícito:** fabricante identifica el estado comercial del producto como activo o en producción.
- **Pendiente:** no se obtuvo evidencia suficiente; no rellenar especificaciones por semejanza con otro modelo.

La condición pedida por el usuario es actualidad de uso y componentes, no exclusivamente fecha reciente de lanzamiento. Un equipo de una generación anterior puede seguir vigente; uno anunciado recientemente puede carecer de oferta o adopción local. No se estableció un ranking de cuota de mercado.

## 2. Evidencia chilena que orienta la ampliación

INACAP publicó en marzo de 2025 la adquisición de **21 robots colaborativos**, distribuidos en las sedes que imparten la carrera, y formación de **42 docentes** con Universal Robots. La noticia no precisa el modelo de cada equipo; no permite afirmar que todos sean UR3e. [Noticia institucional](https://portal.inacap.cl/w/inacap-incorpora-21-robots-colaborativos-y-capacita-a-docentes-en-rob%C3%B3tica-avanzada).

IEEE RAS Universidad de Chile documentó una visita al laboratorio de la UNAB el **29 de abril de 2026**, con trabajo sobre un **Dobot Magician**, incluyendo manipulación de bloques. Es evidencia de uso de Magician, no de Magician E6. [Registro de la actividad](https://events.vtools.ieee.org/m/589121).

INACAP Antofagasta documenta la Liga Robótica Precisión 2026 con **rescate junior, rescate avanzado y sumo robótico**. Justifica incluir estas actividades; la noticia no identifica placas, modelos ni reglamentos técnicos de los robots. [Competencia 2026](https://portal.inacap.cl/w/primera-fecha-liga-rob%C3%B3tica-precisi%C3%B3n-2026-equipos-escolares-se-dieron-cita-en-inacap-antofagasta-1).

## 3. Selección propuesta

| Familia | Referencia principal | Evidencia de actualidad y Chile | Aplicación propuesta |
|---|---|---|---|
| Brazo educativo | Dobot Magician E6 | Catálogo del fabricante y oferta chilena por importación | Movimiento articular, pinza/ventosa, recoger y colocar |
| Brazo industrial educativo | Universal Robots UR3e | Catálogo y documentación 2026; uso de la marca en INACAP, modelo de sede por confirmar | Coordenadas, herramientas, trayectorias y paletizado |
| Rescate | Makeblock mBot2 como plataforma educativa de referencia | Oferta oficial actual y catálogo Makeblock Chile; actividad de rescate documentada en INACAP sin modelo confirmado | Línea, obstáculos, zonas y misión de recuperación |
| Minisumo | Pololu Zumo 2040 | Estado activo explícito en Pololu; familia publicada en tienda chilena | Borde, detección de adversario, empuje y salida de arena |
| Estacionamiento | Base diferencial educativa con sensores, referenciada en mBot2 | Plataforma vigente y comercializada localmente; la misión de estacionamiento es propuesta de PanelLab | Medir espacio, maniobrar, retroceder y detenerse |
| Clasificadora | Dobot Magician + Conveyor Belt Kit | Productos en catálogo y combo publicado en Chile | Detectar, detener cinta, identificar y depositar piezas |

La clasificadora usa la compatibilidad publicada para Magician. No se presume que el mismo accesorio se conecte directamente al E6. Un brazo E6 con cinta requiere comprobar accesorios y controlador exactos.

## 4. Fichas técnicas de referencia

### 4.1 Dobot Magician E6: primera referencia de brazo actual

| Parámetro | Dato publicado |
|---|---|
| Articulaciones | 6 |
| Alcance | 450 mm |
| Carga útil | 750 g |
| Repetibilidad | ±0,1 mm |
| Velocidad máxima del TCP | 0,5 m/s |
| Velocidad articular máxima | 120°/s |
| Límites J1 a J6 | ±360°, ±135°, ±154°, ±160°, ±173°, ±360° |
| Alimentación nominal | 48 V CC, 5 A; entrada de fuente 100–240 V CA |
| Potencia publicada | 130 W |
| Comunicación | Ethernet, TCP/IP y Modbus TCP |
| E/S de base / herramienta | 16 DI y 16 DO / 2 DI y 2 DO; señales de 24 V |
| Masa / base / protección | ≤7,2 kg / 162 × 120 × 103 mm / IP20 |

Fuente de datos: [fabricante E6](https://www.dobot-robots.com/products/education/magician-e6.html). En Chile, [Tecnologías Educativas](https://tecnologiaseducativas.cl/producto/robot-magician-e6-dobot/) publica el modelo RME6-D por **$7.021.000 IVA incluido**, indicando importación, sin entrega inmediata y precio actualizado mediante cotización. No se confirmó instalación de E6 en una sede específica.

**Simulación propuesta:** mover cada articulación; ver posición de herramienta; guardar puntos; reproducir una secuencia; recoger bloques; indicar fuera de alcance y colisiones. La repetibilidad es un dato del equipo físico, no una precisión que PanelLab pueda atribuirse por copiar el número.

**Pendiente para una réplica geométrica:** obtener modelo CAD o URDF con licencia, posición de los seis ejes, longitudes entre articulaciones y curvas de carga con herramienta. Alcance total y caja exterior no bastan para construir cinemática fiel. Pinza y ventosa deben ser perfiles de accesorios distintos.

### 4.2 Universal Robots UR3e: vínculo con formación industrial

Datos base: **6 articulaciones, carga de 3 kg, alcance de 500 mm, repetibilidad ±0,03 mm, masa de 11,2 kg y base de diámetro 128 mm**. El fabricante mantiene una [página del modelo](https://www.universal-robots.com/products/ur3e/) y una [comparación e-Series de enero de 2026](https://www.universal-robots.com/manuals/EN/TechSheets/comparison_e-series_pdf_online/comparison_e-Series_en.pdf).

**Aplicación propuesta:** control J1–J6; marcos base/herramienta; puntos articulares y cartesianos; paletizado por filas y columnas; espera por señal; parada y reanudación de la práctica.

**Versiones:** el [manual actual](https://www.universal-robots.com/manuals/EN/HTML/SW10_14/Content/prod-usr-man/complianceUR3e/H_g5_sections/appendix_g5/tech_spec_UR3e.htm) y [ficha PDF anterior](https://www.universal-robots.com/media/1807464/ur3e_e-series_datasheets_web.pdf) difieren en algunos límites y funciones. Debe fijarse revisión de hardware/controlador antes de cargar rangos articulares. No mezclar parámetros de UR3, UR3e y otras generaciones.

La evidencia institucional confirma Universal Robots en INACAP, no el modelo exacto ni su configuración. PanelLab puede enseñar conceptos de programación industrial; un intérprete didáctico propio no debe anunciarse como PolyScope, URScript completo ni controlador conectado.

### 4.3 Makeblock mBot2: rescate y movilidad educativa

La [guía de montaje del fabricante](https://support.makeblock.com/hc/en-us/articles/1500006253942-Assemble-mBot-Neo-mBot2) identifica CyberPi, mBot2 Shield, dos motores con encoder, Ultrasonic Sensor 2 y Quad RGB Sensor. Sigue apareciendo en el [catálogo oficial](https://www.makeblock.com/collections/all).

[Makeblock Chile](https://www.makeblock.cl/producto/mbot2.html) publica: controlador de doble núcleo a **240 MHz**, **520 KB SRAM**, **8 MB flash**, Wi-Fi/Bluetooth, batería **2500 mAh**, dos puertos de encoder, dos de motor CC y cuatro de servo. El Quad RGB utiliza cuatro sensores de color para seguimiento de línea. Son datos de esta plataforma; no aplican automáticamente al UNO actual de PanelLab.

**Lista funcional para rescate:** chasis, dos motores con encoder, ruedas, apoyo, controlador, batería, sensor frontal de distancia, lectura inferior de pista y un accesorio de recuperación. El mecanismo de agarre es una ampliación por definir; no viene implícito en el kit básico.

**Misiones propuestas:** completar ruta; rodear obstáculo; localizar una pieza representativa de víctima; transportarla a una zona; regresar. Progresión: ruta plana, cruces, recuperación y pendientes. Para llamarlo competición reglamentaria se necesita el reglamento del organizador y año, no solo el nombre «rescate».

**Estacionamiento:** puede utilizar la misma base diferencial, con sensores laterales/traseros añadidos. Eso enseña maniobra de un robot móvil, no reproduce la dirección de un automóvil. Para un vehículo con volante habrá que modelar dirección Ackermann, distancia entre ejes y radio de giro; no se verificó aún un kit exacto de esa clase con oferta local suficiente para seleccionarlo.

### 4.4 Pololu Zumo 2040: minisumo con referencia identificable

[Pololu #5011](https://www.pololu.com/product/5011) figura como **Active and Preferred**: robot de orugas, huella inferior a **10 × 10 cm**, masa aproximada de **275 g con baterías**, alimentación con **4 AA**, RP2040, **16 MB flash**, dos motores con reductora y encoder, cinco sensores inferiores de reflectancia, proximidad frontal/lateral e IMU. La variante #5011 utiliza **50:1 HP**; hay otras relaciones y no se deben intercambiar sus prestaciones.

La página publica 125 MHz; las [notas oficiales de firmware de febrero de 2026](https://github.com/pololu/micropython-build/releases) indican 200 MHz para su distribución MicroPython actualizada. Registrar frecuencia y entorno por versión, no asumir un único valor para cualquier firmware.

[MechatronicStore Chile](https://www.mechatronicstore.cl/marca/pololu/) lista Zumo RP2040 por **$238.900 IVA incluido**. La familia local no identifica por sí sola la relación de reducción: antes de fijar velocidad o torque hay que cotejar SKU.

**Simulación propuesta:** primero robot individual que evita borde; después dos robots con contacto, adversario detectable y condición de salida. La arena se configura según el reglamento elegido. No se verificaron aquí dimensiones reglamentarias de una competición concreta.

**Diferencia con el borrador local:** hoy existe una arena de borde negro y robot de práctica con ruedas. Eso no constituye una réplica de Zumo ni un minisumo competitivo terminado. El contraste del borde debe ser configurable; no convertir el borrador en «reglamento oficial».

### 4.5 Clasificadora Dobot: referencia física completa

El [Conveyor Belt Kit del fabricante](https://www.dobot-robots.com/products/conveyor-belt/conveyor-belt-kit.html) publica carga de **500 g**, recorrido útil **600 mm**, velocidad máxima **120 mm/s**, aceleración máxima **1100 mm/s²**, dimensiones **700 × 215 × 60 mm** y masa **4,2 kg**. Incluye detección fotoeléctrica y de color. El sensor de distancia del kit publica rango **20–150 mm**, salida analógica y alimentación **4,5–5,5 V**; el de color, **3–5 V**.

El [Magician de cuatro ejes](https://es.dobot-robots.com/products/education/magician.html) publica carga **500 g**, alcance **320 mm**, repetibilidad **±0,2 mm**, base **158 × 158 mm** y alimentación **12 V, 6,5 A**. No confundir sus especificaciones con el E6.

[PLCCHILE](https://www.plcchile.com/dobot/) ofrece el combo Magician Basic + Conveyor Belt por **$1.904.000 netos** y la cinta por **$559.300 netos**. Son precios publicados, no cotización ni comprobación de entrega. El fabricante mantiene ambos productos en catálogo; no se estableció fecha de fin de vida.

**Simulación propuesta:** cinta que mueve objetos físicos; sensor de presencia; lectura de color con tolerancia; detener y tomar; depositar en contenedor; contabilizar aciertos. Modelar atasco, pieza fuera de posición, ausencia de pieza y errores de clasificación. El color debe proceder de un modelo de sensor aplicado a la pieza presente, no de elegir directamente el contenedor por su ID.

## 5. Componentes adicionales y control de obsolescencia

| Componente | Decisión para la ampliación | Evidencia y límite |
|---|---|---|
| Distancia ToF ST VL53L1X | Candidato actual para distancia lateral/trasera | ST lo declara activo y en producción; hasta 4 m, hasta 50 Hz, I²C. Los máximos dependen de condiciones y configuración |
| Módulo de distancia concreto | Elegir fabricante/SKU de placa antes de definir pines | Un chip y un breakout no comparten necesariamente tensión de entrada ni adaptación de nivel |
| Encoder | Necesario para maniobras repetibles y control por distancia | Referencias verificadas en mBot2 y Zumo 2040; resolución exacta depende del motor y variante |
| Servo y pinza | Necesarios para brazos y recuperación | Seleccionar un actuador documentado por cada robot; no atribuir torque genérico por apariencia |
| Sensor de color | Empezar por el del kit documentado | No se identificó el chip interno del kit Dobot; no renombrarlo TCS34725 sin evidencia |
| TCS34725 de Adafruit | No usar como primera elección de diseño nuevo | Adafruit marca sus módulos como retirados. Esto no prueba que todos los módulos de terceros ni el IC tengan el mismo estado |
| Arduino Braccio++ | Alternativa moderna, pendiente de confirmar oferta/uso en Chile | Fabricante ofrece Nano RP2040 Connect, carrier y seis servos inteligentes RS485; no es el Braccio clásico con UNO y servos de pulsos |
| Braccio clásico | Referencia de compatibilidad, prioridad secundaria | Sigue publicado en Chile y en Arduino, pero existen diferencias de documentación sobre fuente de 4 A/5 A; no elegirlo por defecto solo por el soporte UNO existente |

Fuentes: [estado y características ST](https://www.st.com/en/imaging-and-photonics-solutions/vl53l1x.html), [oferta VL53L1X en MaxElectrónica Chile](https://maxelectronica.cl/movimiento-distancia/1037-sensor-de-distancia-laser-hasta-4000mm-con-filtro-modelo-vl53l1x.html), [retirada de módulos Adafruit](https://learn.adafruit.com/adafruit-color-sensors/featured_products), [Braccio++ oficial](https://www.arduino.cc/education/braccio), [Braccio clásico Chile](https://arduino.cl/products/braccio-brazo-robotico-controlable-con-arduino), [Braccio clásico fabricante](https://store-usa.arduino.cc/products/tinkerkit-braccio-robot).

Si se conserva una actividad de Braccio clásico, la [biblioteca oficial](https://raw.githubusercontent.com/arduino-libraries/Braccio/master/src/Braccio.cpp) asigna base/hombro/codo/rotación muñeca/flexión muñeca/pinza a D11/D10/D9/D6/D5/D3. Limita hombro a 15–165° y pinza a 10–73°; los demás comandos a 0–180°. Son seis actuadores contando la pinza, no seis articulaciones de orientación equivalentes a un cobot industrial. Estos parámetros no pertenecen al Braccio++.

## 6. Qué permite el código actual y qué hay que agregar

Auditoría estática del checkout local; no se ejecutaron pruebas físicas ni del simulador para esta investigación.

| Área inspeccionada | Situación actual | Ampliación necesaria |
|---|---|---|
| `project/templates.ts` | Cuatro plantillas visibles; torre y minisumo filtrados por estar sin aprobar | Plantillas propias por familia y estado de madurez |
| `project/types.ts` | Solo uniones `rigid` y `wheel-hinge` | Articulaciones revolutas, límites, origen y calibración; pinzas con apertura |
| `project/types.ts` | Firmware tipado exclusivamente como `arduino-uno-r3` | Separar emulación AVR de control didáctico por secuencias y otros controladores |
| `sim/physics.ts` | Grupos rígidos, ruedas motorizadas, obstáculos y rayos de ultrasonido | Cadenas articuladas, agarre/liberación, piezas transportables y cinta |
| `sim/coordinator.ts` | Relación programa → pines → circuito → motores/sensores | Decodificador de pulsos de servo, encoders y dispositivos adicionales |
| `mcu/types.ts` | Servo e I²C se declaran sin soporte verificado/conectado | Verificar temporización de Servo y conectar bus I²C a modelos de dispositivos |
| `scripts/robotica-compile-service.mjs` | Permite `Servo.h` y `Wire.h`, no `Braccio.h` | Compilar una librería y simularla son tareas diferentes; verificar ambas |
| `sim/lineTrack.ts` | Pistas planas y arena circular con trazo negro de 4 cm | Escenarios de misión, zonas, objetivos y reglas configurables |
| `project/validate.ts` | Valida formato actual | Migración e importación/exportación de los nuevos tipos sin perder proyectos |

**Decisión de arquitectura propuesta:** mantener un solo módulo y su lenguaje visual. Añadir dispositivos y capacidades compartidas. Para un E6 o UR3e virtual se necesita un motor de movimientos y señales; no cargar un `.hex` de UNO y presentarlo como su controlador propietario. Para un mBot2/Zumo de referencia, una versión simplificada debe identificarse como adaptación educativa hasta tener soporte del controlador correspondiente.

## 7. Plan de implementación de las cinco familias

El orden siguiente es una propuesta técnica por dependencias, no un plazo comprometido.

1. **Base compartida:** contrato de articulaciones, agarre, objetos, encoders, misiones y perfiles técnicos con fuentes y revisión. Lectura de proyectos existentes y controles táctiles siguen siendo requisitos.
2. **Brazo educativo E6:** brazo fijo, control de seis articulaciones, herramienta, puntos y recoger/colocar; primera práctica completa. Aceptación: límites respetados, rechazo de punto inalcanzable, objeto que solo sigue a una pinza con agarre válido.
3. **Rescate:** reutilizar vehículo base; sensores de pista y distancia, objetivos y entrega de objetos. Aceptación: se evalúan llegada y recuperación por el estado real de la escena, con reinicio reproducible.
4. **Minisumo:** terminar práctica de borde y después oponente; distinguir robot genérico de perfil Zumo. Aceptación: detectar borde, detectar al rival, colisionar y resolver salida de arena sin puntuación inventada por temporizador.
5. **Estacionamiento:** escenario y sensores laterales/traseros; medición de hueco, secuencia de maniobra, colisión y posición final. Aceptación: el programa responde a medidas; un hueco pequeño falla y uno suficiente puede completarse. Dirección Ackermann requiere una etapa mecánica adicional.
6. **Clasificadora:** cinta, presencia, color, manipulación, contenedores y conteo. Aceptación: transportar, detener, agarrar y clasificar al menos tres colores; contemplar pieza ausente y atasco.
7. **Brazo industrial UR3e:** ampliar el motor del brazo con perfiles y trayectorias, marcos de coordenadas y paletizado. Validar modelo/revisión de referencia antes de atribuir correspondencia a un laboratorio INACAP.

Cada entrega debe incluir modelo 3D reconocible, ficha de producto con enlace, piezas y alimentación, control manual, programa de ejemplo, práctica guiada, fallas observables, guardado/importación/exportación y comprobación escritorio/móvil. Una plantilla no estará «lista» solo por abrir una escena o reproducir una animación fija.

## 8. Datos aún necesarios para fidelidad de producto

- CAD/URDF y licencia de los brazos; ejes, offsets, masas y centros de masa si se promete dinámica. Usar dimensiones aproximadas explícitas mientras no exista fuente.
- SKU exacto y reductora del Zumo vendido localmente; motor, encoder y geometría de cada vehículo antes de fijar trayectoria o velocidad.
- Modelo de pinza/ventosa y curva de carga; la carga útil del brazo incluye herramienta y depende de condiciones de montaje.
- Accesorio/controlador de cinta para E6 si se quiere esa combinación. Magician y E6 no son intercambiables.
- Reglamento y edición de la competencia chilena antes de llamar oficial a una pista, arena o puntuación.
- Confirmación de equipamiento por sede si el módulo debe coincidir con una sala específica.
- Vigencia comercial mediante fabricante y disponibilidad local al momento de compra. Los precios guardados son referencias consultadas, no presupuestos.

**Resultado de esta etapa:** cinco familias cubiertas con referencias reales, fichas y fuentes actuales; selección principal E6, UR3e, mBot2, Zumo 2040 y célula Magician+cinta. Braccio++ queda como alternativa pendiente de evidencia local. No se declara terminada una réplica física ni implementadas estas ampliaciones.
