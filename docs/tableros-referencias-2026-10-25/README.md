# Investigación visual y técnica de tableros para modo.

**Fecha:** 25 de octubre de 2026. **Estado:** investigación completada y primera implementación local disponible. Ver [taller implementado](../../IMPLEMENTACION_TALLER_TABLEROS.md): mando cableado, PLC y relé programable, con espacio asignado editable. El atlas conserva el alcance de la investigación original.

El propósito es enseñar el oficio mediante un encargo completo: comprender, montar, conectar, comprobar, diagnosticar y entregar evidencia. La propuesta amplía el laboratorio existente y conserva sus modos y proyectos.

## Entregables y consulta sin internet

- [Atlas visual y técnico, 18 páginas](../../output/pdf/Investigacion_tableros_modo_2026-10-25.pdf): imágenes, funcionamiento, montaje, instalación, diagnóstico y propuesta de implementación. Se puede leer sin conexión.
- [investigacion.json](investigacion.json): 12 referencias visuales, 8 etapas y 16 casos de fallas con comprobación y criterio de aceptación.
- [matriz-fallas.csv](matriz-fallas.csv): los 16 casos para revisar en una hoja de cálculo; separador `;`, UTF-8 con BOM.
- [fuentes.json](fuentes.json): 13 archivos de origen descargados, con URL, ruta, tamaño, SHA-256 y, cuando corresponde, edición, idioma y páginas.
- `imagenes/`: seis imágenes de origen. Cuatro fotografías y dos visuales comerciales de fabricante; el atlas selecciona cinco y añade siete fragmentos de documentos.
- `fuentes/`: siete documentos técnicos descargados. Se revisaron las secciones pertinentes; no se afirma una auditoría completa de cada manual.
- `paginas/`: fragmentos visuales seleccionados con identificación de documento y página en el JSON.
- `qa/`: renderizado y comprobaciones del dossier. No pertenece a los recursos de la aplicación.

Los archivos locales se pueden consultar durante el viaje. Los enlaces a sitios externos requieren conexión. El paquete de investigación no se añadió a la descarga de la aplicación ni al service worker.

## Qué muestran las imágenes y qué hay que enseñar

| Familia | Funcionamiento que debe entenderse | Montaje que debe poder realizarse | Diagnóstico propuesto |
|---|---|---|---|
| Mando de motor | Una orden gobierna una maniobra bajo condiciones y protecciones definidas. | Pulsadores, equipo de maniobra, auxiliares, protección y bornes del caso. | Falta de mando, retención incorrecta, órdenes incompatibles. |
| CCM, centro de control de motores | Varias unidades de motor integradas en un conjunto. | Entender columna, unidad, compartimentos y conexiones. | Localizar la unidad afectada y seguir su documentación. |
| Variador | Recibe una orden y una referencia; controla el accionamiento y publica estados. | Equipo de talla definida, espacio de ventilación y conexiones según su manual. | Canal de mando, consigna y códigos del perfil específico. |
| PLC/HMI | Las señales se interpretan en un programa y se muestran o gobiernan mediante una interfaz. | CPU, E/S, alimentación, bornes y conexión de datos del ejercicio. | STOP/diagnóstico, asignación de E/S y enlace lógico. |
| Instrumentación | Una variable de proceso se convierte en señal y se interpreta con una escala. | Relación instrumento-campo, bornes y entrada del tablero. | Lazo abierto, polaridad, alimentación o escala incompatible. |
| Distribución y servicios | El conjunto recibe y organiza alimentación, protección y circuitos. | Envolvente, placa, zonas de cableado e identificación. | Conexiones incompletas y verificación de protección de masas. |

Esta clasificación es didáctica: las funciones pueden compartir un gabinete. No es un inventario de modelos usados en Tarapacá.

### Lectura funcional del tablero

1. **Potencia:** identificar de dónde llega la energía, los dispositivos del circuito y la carga. La protección y el accionamiento tienen funciones distintas que dependen del diseño.
2. **Mando:** reconocer el origen de una orden, sus condiciones de aceptación y el dispositivo que actúa. Un pulsador no explica por sí solo toda la secuencia.
3. **Señal y realimentación:** seguir el sensor o estado desde campo hasta su interpretación. Separar «orden enviada», «salida activa» y «resultado observado».
4. **Supervisión:** mostrar estado, modo, magnitud y diagnóstico de forma coherente. Una animación de motor girando no demuestra una conexión correcta.

El esquema de funcionamiento del atlas es original y conceptual. No contiene una asignación de bornes ni un circuito industrial listo para fabricar.

## Montaje en taller e instalación en campo

**Montaje** es construir el conjunto: preparar envolvente y placa, disponer soportes y equipos, cablear, identificar y verificar. **Instalación** es integrar ese conjunto con su ubicación, alimentación, tierra de protección, equipos externos y comunicaciones. La puesta en servicio comprueba el comportamiento bajo condiciones documentadas.

Recorrido recomendado para los ejercicios:

1. **Encargo:** especificar equipo controlado, modos, secuencia, fallas, señales y condiciones ambientales.
2. **Documentos:** proporcionar disposición, circuito de potencia/mando, lista de señales y fichas necesarias para ese caso.
3. **Gabinete:** seleccionar una envolvente del ejercicio y organizar placa, puerta, entradas y zonas de cableado. No deducir IP, capacidad térmica o resistencia ambiental solo de una fotografía.
4. **Montaje mecánico:** colocar rieles, canaletas, equipos, bornes y elementos de puerta. Usar dimensiones, fijaciones y reservas de la referencia elegida; no aplicar una distancia universal.
5. **Conexionado:** registrar origen, destino e identificación de cada conductor. La ruta dibujada y la conectividad eléctrica deben ser datos diferentes.
6. **Comprobación:** contrastar montaje y conexiones con el encargo y registrar resultados. La inspección y los ensayos del conjunto tienen su referencia chilena en [SEC RIC N.º 02, anexo 2.3](https://www.sec.cl/sitio-web/wp-content/uploads/2021/06/RIC-N02-Tableros-Electricos-170621-2.pdf).
7. **Campo:** relacionar cada llegada con equipo, señal o alimentación; representar fijación y protección de masas previstas por el proyecto.
8. **Función y entrega:** probar modos y respuesta a fallas, exportar el expediente y conservar el resultado.

Las cotas, pares de apriete, secciones, tensiones y ajustes requieren ficha y proyecto. Cuando el simulador use equivalentes genéricos, deben identificarse como datos didácticos. La puntuación virtual no es una medición física ni una certificación del conjunto.

## Cómo enseñar errores y reparación

La matriz distingue **síntoma, hipótesis, comprobación virtual, corrección simulada y aceptación**. No interpreta un síntoma como causa única. El estudiante debe elegir una prueba y explicar el dato obtenido antes de cambiar algo.

Ejemplo de ejercicio D03: en un circuito de retención definido por el docente, la carga actúa mientras se pulsa marcha y se detiene al soltar. Se compara la ruta de mando y el auxiliar esperado con el esquema del caso. El alumno corrige la conexión o asociación que falla y repite marcha/parada. La actividad se supera cuando el comportamiento previsto se reproduce y queda explicado; no por copiar un cable en la pantalla.

Otros grupos preparados:

- Mando y protección: D01-D05.
- Variador: D06-D10; OHF, USF y OCF se vinculan al perfil ATV600 y a la revisión concreta del manual.
- PLC/HMI: D11-D13; diagnóstico, recorrido de señales y datos de supervisión.
- Instrumentación: D14-D15; coherencia de escala y continuidad funcional del lazo.
- Montaje: D16; evidencia de la conexión de protección prevista.

**Alcance de las fuentes:** los códigos del fabricante y sus significados tienen respaldo específico. Las hipótesis de cada escenario, los pasos virtuales y la evaluación son propuestas pedagógicas. Por ejemplo, RIC N.º 02 no demuestra por sí mismo una falla de retención o un error de HMI; se cita como referencia del conjunto/verificación, no como manual de esos síntomas.

En mantenimiento, registrar condición, prueba, intervención y resultado. La frecuencia real depende del uso, ambiente y manual. La intervención física corresponde a personal competente y al procedimiento de aislamiento aplicable. No enseñar a puentear protecciones, rearmar repetidamente ni modificar umbrales para ocultar una causa.

## Tarapacá: contexto documentado y límites

- [Quebrada Blanca, Teck](https://www.teck.com/operations/chile/operations/quebrada-blanca/quebrada-blanca): procesos mineros y servicios de agua como contexto para bombeo e instrumentación.
- [Collahuasi, inventario GEI 2019](https://www.collahuasi.cl/wp-content/uploads/2020/10/collahuasi-inventario-de-gei-2019.pdf): referencia histórica de procesos y transporte; no se presenta como inventario actualizado de equipos.
- [SQM Yodo Nutrición Vegetal, presencia](https://sqm-ynv.com/sqmeninfografias/presencia.html): Nueva Victoria y actividades de yodo/nitratos como contexto regional.

La correspondencia entre esos procesos y los ejercicios es una inferencia de diseño educativo. No se encontraron en esta selección planos y fotografías autorizados que permitan reconstruir un tablero específico de una faena regional. Tampoco se estableció un ranking de demanda de tableros. La fotografía del CCM Boral corresponde a Australia.

Para ambientar un encargo en costa o cordillera, definir condiciones del proyecto y usar los límites de los equipos. No extrapolar ajustes por altitud, protección ambiental o refrigeración de un producto a todo el catálogo.

## Primera implementación recomendada

**Taller de tableros: bombeo auxiliar.** Empezar con una bomba y mando comprensible; avanzar a dos bombas con alternancia/reserva, PLC/HMI e instrumentación; añadir después una variante con variador. No representa una estación principal de impulsión minera.

Debe reutilizar catálogo, navegación, zoom, conexiones, guardado/importación y motores del laboratorio actual. Añadir:

- Vistas coordinadas de placa, puerta, esquema y campo.
- Datos físicos de montaje y fuente por perfil de componente.
- Etiquetas, bornes, terminaciones y recorrido físico del conductor.
- Reglas de montaje, conexión y función con evidencia consultable.
- Exportación del expediente y progreso del estudiante.

**Rendimiento:** comenzar con 2D/SVG, cargar recursos por caso, separar navegación y cálculo eléctrico, y evitar recalcular al panear. Incluir ilustraciones propias locales y comprobar preparación, cierre/reapertura y exportación sin internet. Medir un caso representativo en móvil y escritorio antes de afirmar una mejora; esta investigación no es una medición de rendimiento del taller futuro.

## Referencias de imágenes y manuales

| ID | Documento o colección | Edición/uso revisado |
|---|---|---|
| F01/F02/F06 | [Eiffage, cableado en terreno](https://eiffageenergiesystemes.be/fr/cablage-sur-site/) | Fotografías de interior e instalación industrial. |
| F03 | [Rockwell, caso Boral](https://www.rockwellautomation.com/en-us/company/news/case-studies/boral-quarry-invests-in-intelligent-motor-control-solution.html) | CCM en Charlton, Australia. |
| F04/F05 | [Rittal, Ri4Power](https://webinfo.rittal.com/com-en/ri4power) | Visuales comerciales; diferenciados de una foto de faena. |
| M01 | [CENTERLINE 2500](https://literature.rockwellautomation.com/idc/groups/literature/documents/in/2500-in001_-en-p.pdf) | 2500-IN001H-EN-P, 07/2022, EN. Figuras/unidades y mantenimiento. |
| M02 | [ATV630/650 instalación](https://www.se.com/ph/en/download/document/EAV64301/) | EAV64301.13, 06/2025, EN. Montaje, esquema y comprobaciones. |
| M03 | [ATV600 programación](https://www.se.com/hk/en/download/document/EAV64318/) | EAV64318.14, 05/2026, EN. Mando/referencia y diagnóstico. |
| M04 | [S7-1200 G2](https://support.industry.siemens.com/cs/attachments/109988293/S71200_G2_system_manual_en-US_en-US.pdf) | A5E52923928-AB, V1.0.1, 04/2025, EN. CPU, montaje, conexiones y LEDs. |
| M05 | [SEC RIC N.º 02](https://www.sec.cl/sitio-web/wp-content/uploads/2021/06/RIC-N02-Tableros-Electricos-170621-2.pdf) | Archivo oficial 17/06/2021, ES. Anexo 2.3. |
| M06 | [Rittal VX SE](https://www.rittal.com/imf/none/3_8456/5856600______EN) | Catálogo de 28 páginas, EN; no se afirma fecha de publicación. |
| M07 | [Rosemount 3051 HART](https://www.emerson.com/documents/automation/manual-rosemount-3051-pressure-transmitter-en-89452.pdf) | **DE**, 00809-0105-4007 Rev BF, 02/2024. El URL dice “en”, pero el PDF recibido está en alemán. |
| Q01 | [Schneider, OHF](https://www.se.com/sg/en/faqs/FA311478/) | Diagnóstico específico de familia. |
| Q02 | [Schneider, USF](https://www.se.com/us/en/faqs/FA317653/) | Subtensión en ATV630. |
| Q03 | [Schneider, vibración de contactores](https://www.se.com/us/en/faqs/FA120094/) | Causas posibles de mando inestable. |

Las imágenes son material de referencia atribuido; no se comprobó una licencia de redistribución comercial. Antes de incorporarlas a la aplicación pública, usar ilustraciones propias o gestionar autorización. No se contactó a las empresas ni a personal de las faenas.

## Reproducción y comprobaciones

`recopilar.py` descarga y valida los archivos; conserva los metadatos revisados si el hash no cambia. `preparar_datos.py` genera fragmentos, JSON y CSV con PyMuPDF. `crear_dossier.py` usa ReportLab y las fuentes Segoe UI de Windows para producir el atlas.

La evidencia de entrega se registra en `qa/verificacion.json`. El PDF fue renderizado con Poppler y revisado visualmente; se comprobaron la integridad de las fuentes, las referencias y la correspondencia de los 16 casos. No se hicieron cambios funcionales en `src/`, ni una nueva publicación de la aplicación para esta investigación.
