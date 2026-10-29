# Armado de tableros para modo.: minería y Tarapacá

Fecha de revisión: 25 de octubre de 2026. Alcance: investigación y propuesta de producto; no se implementaron pantallas ni se cambió la aplicación.

## 1. Decisión propuesta

Desarrollar dentro del laboratorio existente un taller de **armado, comprobación y diagnóstico de tableros industriales de baja tensión**, empezando por bombeo auxiliar y servicios de agua. Combinar montaje físico virtual, esquema eléctrico, lógica de control y documentación de entrega.

La prioridad propuesta es pedagógica y técnica. No se encontró un catastro público que permita afirmar qué porcentaje de los profesionales de Tarapacá arma tableros, ni ordenar por cantidad los tableros instalados en cada faena. Tampoco se verificó un inventario de marcas/modelos por planta.

La actividad tiene una referencia laboral reconocible: ChileValora incluye una unidad sobre instalación de tableros de distribución, cuyo desempeño contempla armado/montaje a partir de proyecto. Esa unidad no equivale a una certificación de armador de tableros de control minero ni valida automáticamente un curso de modo. [ChileValora, U-4322-7411-003-V02](https://certificacion.chilevalora.cl/ChileValora-publica/uclEdit.html?paramRequest=1674%2C709).

## 2. Evidencia regional

| Referente | Lo documentado públicamente | Uso propuesto en modo. | Límite de la evidencia |
|---|---|---|---|
| Quebrada Blanca, Teck | Rajo abierto, concentradora, relaves, instalaciones portuarias, transporte de concentrado y suministro de agua desalinizada. También informa operación integrada remota. | Servicios de agua, motores, señales de campo y relación entre control local y supervisión. | La descripción de procesos no identifica por sí sola el fabricante, gabinete o circuito de cada tablero. |
| Collahuasi | Un inventario técnico de procesos describe chancado, transporte en correas, molienda/clasificación, flotación, relaves, suministro de agua y filtrado en Puerto Patache. | Correas con enclavamientos, motores y servicios auxiliares; ejemplos de bombeo y filtrado. | El inventario describe 2019; se utiliza como evidencia de procesos, no como inventario actualizado de equipos. |
| Collahuasi, proyecto C20+ | La compañía documenta desalación y un sistema de impulsión asociado. | Contexto de formación sobre agua, bombeo, válvulas y señales de proceso. | No se confirma aquí su estado actual de puesta en servicio. Las fechas proyectadas no se presentan como operación efectiva. |
| SQM, Nueva Victoria | La compañía sitúa Nueva Victoria en Tarapacá y describe producción de yodo/nitratos a partir de caliche y soluciones. | Bombas de transferencia, control de nivel/caudal, instrumentación y condiciones ambientales de proceso. | Los ejercicios serían modelos propios; no copias de planos de SQM. |
| Cerro Colorado | BHP reporta su paso a cuidado y mantenimiento desde diciembre de 2023, también en su revisión operacional de marzo de 2026. | Referencia regional para conservación y mantenimiento, si se desarrolla ese contenido. | No utilizarla en la presentación como ejemplo confirmado de producción activa. |

Fuentes de esta tabla: [Teck, Quebrada Blanca](https://www.teck.com/operations/chile/operations/quebrada-blanca/quebrada-blanca); [Collahuasi, inventario de procesos 2019, tabla 4](https://www.collahuasi.cl/wp-content/uploads/2020/10/collahuasi-inventario-de-gei-2019.pdf); [Collahuasi, proyecto dentro de su modelo de negocios](https://www.collahuasi.cl/que-hacemos/modelo-de-negocios-sostenible/); [SQM, faenas](https://www.sqm-ynv.com/acerca-de-sqm/informacion-corporativa/nuestras-faenas/); [SQM, localización y proceso de Nueva Victoria](https://sqm-ynv.com/sqmeninfografias/presencia.html); [BHP, revisión operacional marzo de 2026](https://www.bhp.com/-/media/documents/media/reports-and-presentations/2026/260422_bhpoperationalreviewfortheninemonthsended31march2026.pdf).

**Interpretación:** los procesos regionales documentados justifican seleccionar familias de control de motores, bombeo, instrumentación y automatización. No demuestran que todas las instalaciones usen el mismo tipo de tablero ni que todos los bombeos sean de baja tensión.

## 3. Familias de tableros relevantes

Son familias por función, no categorías mutuamente excluyentes: un gabinete puede reunir fuerza, PLC, variadores e instrumentación; un CCM agrupa varias unidades de control de motor.

| Familia | Función y elementos de aprendizaje | Ejercicio propuesto | Prioridad |
|---|---|---|---|
| Fuerza y mando de motor | Alimentación, maniobra, protección, contactor, señalización y retorno de estado. | Arranque y paro de una bomba auxiliar; pérdida de mando y disparo simulado. | Primera base |
| Bombeo y servicios de agua | Modos manual/automático, nivel, disponibilidad y alarmas. Puede reunir varias familias de equipos. | Dos bombas alternadas: principal/reserva, nivel alto/bajo y falla de una unidad. | Primer caso completo |
| Variadores y arrancadores suaves | Diferenciar regulación de velocidad de arranque/parada controlados. | Consigna y rampa de un motor; estado de falla e inhibición de arranque. | Segunda etapa |
| PLC/HMI y control de proceso | Entradas/salidas, alimentación de control, relés de interfaz y relación con la pantalla del operador. | Tanque con sensores, bomba y válvula; modo local/remoto y alarmas. | Primera etapa, progresiva |
| Instrumentación y E/S remotas | Bornes, alimentación de transmisores, lazos analógicos y señales digitales. | Medir nivel o presión y detectar cable abierto/señal fuera del rango definido para el ejercicio. | Segunda etapa |
| CCM: centro de control de motores | Varias salidas o unidades para motores, estados y enclavamientos. | Dos correas y una bomba; representar cada unidad y comprobar dependencias. | Después del tablero individual |
| Mando local y cajas de campo | Pulsadores, selectores, terminales y comunicación con el gabinete principal. | Estación junto a un equipo y reconocimiento de quién tiene autoridad de mando. | Complemento temprano |
| Distribución y servicios auxiliares | Alimentación de otros circuitos, identificación de salidas y servicios. | Tablero de servicios de un taller o sala técnica. | Extensión posterior |
| Seguridad de máquinas | Funciones de parada, rearme y estado seguro, con arquitectura específica. | Distinguir orden normal de paro y función de seguridad; fallos simulados y evidencia. | Línea especializada, con revisión competente |

El manual minero de Rockwell documenta funciones repetidas como correas con interruptores de cable/desalineación y bombas con indicación de presión/caudal. Su solución para minería también presenta CCM, controladores y variadores como familias relacionadas. Se utilizan para sostener la taxonomía general, no para atribuir esos productos a una faena de Tarapacá. [Manual MMCL](https://literature.rockwellautomation.com/idc/groups/literature/documents/rm/ra-rm002_-en-p.pdf), [arquitecturas mineras de Rockwell](https://interact.rockwellautomation.com/mining-automation/).

## 4. Qué necesita enseñar el armado

Propuesta de recorrido para una persona que comienza:

1. **Entender el encargo:** qué equipo se controla, qué debe hacer, estados, condiciones de arranque y respuesta ante fallas.
2. **Leer la documentación:** unilineal, potencia/mando, disposición y lista de entradas/salidas, según el nivel.
3. **Preparar el gabinete:** seleccionar envolvente del ejercicio, placa, rieles, canaletas, entradas de cables y elementos de puerta.
4. **Montar componentes:** ubicación, dimensiones y espacio de mantenimiento; comprobar compatibilidad y requisitos de la ficha empleada.
5. **Cablear e identificar:** unir bornes, asignar identificadores de conductor, destino y terminación; diferenciar potencia, control, señal y protección.
6. **Comprobar el montaje:** confrontarlo con el esquema y registrar las comprobaciones simuladas.
7. **Poner a prueba la función:** operar desde campo/HMI, cambiar modos, introducir una falla y explicar la respuesta.
8. **Entregar el proyecto:** materiales, lista de cables y bornes, esquema, mapa de E/S y registro de pruebas.

Este recorrido es una propuesta educativa. Las referencias regulatorias y de fabricante respaldan la importancia de construir y verificar un conjunto, pero no convierten la puntuación del juego en una aprobación de ingeniería.

## 5. Contexto técnico de Tarapacá

El escenario debe declarar si el tablero está en costa, interior industrial o cordillera, junto con las condiciones de proyecto. Polvo, humedad, agentes corrosivos y requisitos de resguardo deben formar parte de la selección; el Reglamento de Seguridad Minera contempla protección de las instalaciones frente al ambiente y riesgos de operación. [DS 132, texto consolidado](https://www.bcn.cl/leychile/navegar?idNorma=221064).

La altitud no debe ser solo un fondo visual. Schneider documenta que, para la familia de interruptores tratada en su ficha, por encima de 2.000 m se deben considerar efectos sobre aislamiento y refrigeración. Es un ejemplo de por qué cada dispositivo necesita datos de fabricante; no un coeficiente universal aplicable a todo el catálogo. [Schneider, corrección por altitud](https://www.se.com/ca/en/faqs/FA212547/).

Recomendaciones para los ejercicios:

- Definir condiciones ambientales y ubicación como datos del encargo.
- Dar visibilidad a ventilación, pérdidas térmicas y disposición cuando exista un modelo respaldado.
- Mantener los límites de uso y las separaciones que indique cada ficha; no inventar un único valor para todos los equipos.
- Introducir protección de masas, identificación y separación de circuitos desde el primer proyecto.
- Evitar asumir que una misma tensión, sección de conductor o grado IP sirve para todas las instalaciones.

## 6. Referencias chilenas y técnicas

Base para preparar contenido; la aplicabilidad concreta debe revisarse según instalación, equipo y especificaciones del mandante.

- **SEC, RIC N.º 02 — Tableros eléctricos:** su anexo 2.3 contempla verificación de diseño y pruebas de rutina, documentación, inspección del conjunto y aspectos eléctricos/mecánicos. El protocolo educativo debe distinguir comprobaciones simuladas de ensayos físicos. [Documento oficial](https://www.sec.cl/sitio-web/wp-content/uploads/2021/06/RIC-N02-Tableros-Electricos-170621-2.pdf).
- **RIC N.º 04, 06, 17 y 19:** consultar conductores/canalizaciones, puesta a tierra, operación/mantenimiento y puesta en servicio para los temas correspondientes. [Índice oficial SEC](https://www.sec.cl/normas-tecnicas-electricas/).
- **Reglamento de Seguridad Minera, DS 132:** los artículos 396–400 tratan registros, planos, procedimientos y condiciones de utilización; el 431 aborda protecciones. Sirve para incluir documentación, procedimientos y respuesta ante fallas. [BCN](https://www.bcn.cl/leychile/navegar?idNorma=221064).
- **IEC 61439:** reglas y verificación de conjuntos de baja tensión; la parte general se utiliza junto con la parte aplicable al conjunto. Se revisó la ficha pública de IEC 61439-1:2020, no el texto completo de pago. [IEC](https://webstore.iec.ch/en/publication/32338).
- **IEC 60204-1:** referencia para equipo eléctrico de máquinas; distinguir su alcance del de un conjunto de distribución/control. [Enmienda oficial](https://webstore.iec.ch/en/publication/66124), [orientación técnica Siemens](https://www.siemens.com/en-us/industries/industrial-machinery/control-panels/iec-standards/).

Para la propuesta de modo.: documentación trazable, montaje coherente y ensayos virtuales con alcance declarado. No ofrecer certificación SEC, conformidad IEC, validación de seguridad funcional ni habilitación para intervenir un tablero energizado por completar una actividad.

## 7. Qué hay actualmente en modo. y qué falta

Revisión directa del código en esta sesión:

- `src/lab/equipment/model.ts`: catálogo de **41 componentes**, con contactores, protecciones, PLC, variadores, bornes y riel. Incluye ejemplos de mando, variador y energía solar.
- `src/lab/EquipmentView.tsx`: colocar/mover componentes, seleccionar bornes, tender conexiones, guardar/importar y simular mediante el proyecto del laboratorio.
- El tipo `Part` tiene posición gráfica; `Wire` guarda origen/destino. El documento de montaje todavía no describe un gabinete de fabricación con puertas, placa, canaletas, recorrido físico, identificación/sección/terminación del conductor o requisitos de ficha por referencia.
- El catálogo declara límites de modelos equivalentes: por ejemplo, el disyuntor no simula una curva real de disparo y el diferencial es didáctico. No utilizarlos como comprobador de coordinación/selectividad.

Brecha principal: convertir el montaje libre en un **trabajo guiado dentro de un gabinete**, con datos físicos, relación con los planos y evaluación de lo realizado.

Evolución propuesta sobre el producto existente:

| Área | Evolución sugerida |
|---|---|
| Escena | Vistas de placa, puerta y equipo de campo, manteniendo navegación, zoom y controles actuales. |
| Montaje | Dimensiones en unidades físicas; acople a riel; zonas de canaleta y detección de ocupación. |
| Conexionado | IDs de hilo, bornes y terminaciones; recorrido visual separado de la conectividad eléctrica. |
| Catálogo | Datos de referencia y documento de fabricante por equipo; genéricos claramente identificados cuando falte la ficha. |
| Simulación | Reutilizar motores existentes para funciones soportadas; ampliar solamente lo necesario para cada caso. |
| Evaluación | Reglas de montaje, conexión y comportamiento, con evidencia visible; diferenciar lo no modelado. |
| Entrega | Exportar expediente del ejercicio y conservar importación de proyectos anteriores. |

## 8. Primer proyecto para presentar

**Nombre de trabajo:** «Taller de tableros · Bombeo y servicios de agua».

**Encargo didáctico:** dos bombas auxiliares alimentan un estanque. La persona monta un tablero de baja tensión con control virtual de 24 V DC, selecciona manual/automático, conecta señales, configura alternancia y comprueba fallas. No representa el dimensionamiento de las grandes estaciones principales de impulsión de una faena.

Progresión:

1. Una bomba, mando cableado y explicación guiada.
2. Dos bombas, alternancia y reserva, agregando PLC/HMI cuando el estudiante haya comprendido el mando.
3. Variante con variador y medición de proceso.
4. Diagnóstico: sensor abierto, motor no disponible, pérdida de comunicación o condición de arranque incumplida.

El resultado a mostrar: la persona interpreta el encargo, arma el gabinete, lo conecta, detecta un error y entrega evidencia. Esa secuencia demuestra más aprendizaje que una escena ya terminada con un botón de encendido.

## 9. Alcance inicial y fases

**Primera entrega:** un gabinete, un caso completo, catálogo acotado a piezas necesarias, modo guiado y libre, montaje/cableado verificable, prueba funcional, exportación y trabajo sin conexión.

**Segunda entrega:** correas con dependencias de marcha, más variantes de arranque, instrumentación y perturbaciones de proceso.

**Tercera entrega:** agrupación de unidades CCM, supervisión más compleja y escenarios especializados. Los equipos de media tensión y la verificación física de seguridad son un alcance distinto; no deben suponerse resueltos por ampliar la escena.

## 10. Rendimiento y conservación

- Conservar la composición y módulos actuales; integrar el taller en el laboratorio.
- Usar representación 2D/SVG con volumen visual, antes de exigir una escena 3D completa.
- Separar posición física, dibujo del conductor y red eléctrica.
- Recalcular reglas y circuitos cuando cambien datos pertinentes, no en cada cuadro de paneo.
- Cargar el caso y sus fichas bajo demanda; incluirlos en la preparación de viaje.
- Comparar fluidez y legibilidad con montajes representativos en escritorio y móvil antes de afirmar mejora de rendimiento.

## 11. Datos por validar antes del diseño detallado

Para convertir esta propuesta en un taller cercano al oficio regional conviene revisar con un tablerista, un mantenedor/instrumentista y un docente:

- Tres encargos representativos y su frecuencia real: fabricación nueva, modificación o diagnóstico.
- Planos y fotografías autorizados de un tablero didáctico o montaje no confidencial.
- Marcas/modelos de referencia, condiciones ambientales y prácticas del taller.
- Qué tareas hace un principiante y cuáles requieren un profesional responsable.
- Un criterio observable de evaluación del montaje y la documentación.

No se contactó a empresas ni personas en esta investigación. La propuesta utiliza fuentes públicas y la revisión del proyecto; los circuitos concretos de las faenas y su demanda comercial quedan por validar.
