# Investigación: dónde y cómo se ubica un tablero eléctrico de control

Fecha: 2026-11-07. Hecha con búsquedas web. **Ninguna fuente es el texto de una norma chilena ni de IEC**: son artículos técnicos, guías de fabricantes y material de capacitación. Lo que viene de conocimiento general o de otro país está marcado. Los valores no deben usarse como especificación sin revisar la norma vigente (en Chile, la SEC).

## 1. Dónde va el tablero
- **Cerca de los motores que controla o en una sala aparte.** Un centro de control de motores (MCC) se coloca en el piso de la planta junto al grupo de motores, o en una sala eléctrica separada y climatizada. Fuente: [Control Engineering – MCC](https://www.csemag.com/motor-control-centers-a-must-2/), [Rockwell](https://www.rockwellautomation.com/en-id/company/news/blogs/when-did-you-last-think-about-your-motor-control-centres-.html).
- **Lugar ventilado, sin humedad, polvo ni suciedad; no junto a bombas.** Hay que pensar en acceso, altura libre y ampliaciones futuras. Fuente: [Schneider – ubicación del MCC](https://www.productinfo.schneider-electric.com/mcc_literature/80459-641-01-model-6-mcc-user-guide/English/80459-641-01%20(bookmap)_0000695773.xml/$/LocatingtheMCCCPT_0000696542).
- **Gabinete de máquina vs MCC:** el MCC conviene con muchos motores repartidos; el gabinete de control propio, con máquinas muy integradas o ambientes duros. Fuente: [comparación MCC vs gabinete](https://industrialmonitordirect.com/blogs/knowledgebase/mcc-vs-control-enclosure-industrial-motor-control-selection-guide) (blog).
- **Variadores:** si el cable al motor es largo hay que filtrar o montar el variador cerca del motor. Fuente: [ubicación de VFD](https://industrialmonitordirect.com/blogs/knowledgebase/vfd-mounting-location-mcc-vs-field-installation-guide) (blog).

## 2. Espacio libre delante del tablero
Referencia de **EE. UU. (NEC 110.26)**, que **no aplica en Chile** pero sirve de comparación: ancho libre de al menos 30 pulgadas (≈ 0,76 m) o el del equipo, el que sea mayor, y altura libre de 2,0 m (6½ pies). **La profundidad se contradice entre fuentes**: 36 pulgadas (≈ 0,9 m) hasta 150 V, y 42 pulgadas (≈ 1,07 m) entre 151 y 600 V según otras. Hay que mirar la tabla 110.26(A)(1) vigente. Fuentes: [ECM – espacios de trabajo](https://www.ecmweb.com/code-basics/how-much-working-space-enough), [guía de clearance](https://nassaunationalcable.com/blogs/blog/your-guide-to-nec-electrical-panel-clearance-requirements), [control panel clearance](https://industrialmonitordirect.com/blogs/knowledgebase/nec-control-panel-clearance-requirements-for-industrial-enclosures).
- **Chile:** la NCh Elec. 4/2003 tiene una sección de «Espacios de trabajo y distancias mínimas de seguridad» (5.4.4), pero **no pude leer los valores** y un artículo indica que un reglamento nuevo la reemplaza. Fuente: [NCh Elec 4/2003 (SEC)](https://rise.esmap.org/data/files/library/chile/Energy%20Efficiency/Chile%20norma4_elec%20completa%202003.pdf), [ACHS](https://achs.cl/centro-de-noticias/noticia/2021/informate-sobre-la-normativa-de-seguridad-electrica-que-establece-el-ministerio-de-energia).
- **Argentina (referencia, no Chile):** acceso posterior de 0,7 m, y 0,5 m con la puerta trasera abierta. Fuente: [guía de tableros](https://www.editores-srl.com.ar/sites/default/files/ie343_farina_tableros_electricos_parte_2.pdf).
- **No encontré:** la distancia de 600 mm de IEC 60204-1, el sentido de apertura de la puerta ni las vías de escape. Están en la norma de máquinas y no salieron en la búsqueda.

## 3. Cómo se monta
- **Sobre plinto elevado y entrada de cables por abajo**, con placa de prensaestopas y canal de cables debajo: **conocimiento general, no confirmado por las fuentes** (la búsqueda no lo cubrió). Verificar con IEC 61439, NFPA 70 y el manual del fabricante.
- **Calor y ventilación:** la capacidad de disipar calor depende del tipo de montaje (empotrado, sobrepuesto o autoportante) y de la temperatura interna permitida; más grado de protección IP reduce la ventilación. Fuentes: [ETI – envolventes](https://eplan.etigroup.eu/media-center/eti-blog/selected-requirements-for-the-design-and-development-of-enclosures-for-low-voltage-switchgear-by-eti), [Fuji](https://smbe.fujielectric.com/technical-information/).
- **Normas de referencia:** IEC 61439 (tableros de baja tensión) e IEC 60204-1 (equipo eléctrico de máquinas). Fuente: [Siemens](https://www.siemens.com/en-gb/industries/industrial-machinery/control-panels/iec-standards/).

## 4. Qué hace hoy el módulo y qué falta
Ya está: gabinete con puerta, mandos en la puerta, plinto, zona eléctrica cercada, entrada de cables por abajo hacia el canal de piso.
Falta, sin inventar medidas:
1. **Espacio libre frente al tablero** como aviso configurable («zona de trabajo del tablero» dibujada en el piso, marcada como de ejemplo) y comprobación de que no hay piezas dentro.
2. **Puerta que abre** con su barrido y alerta si choca.
3. **Sala eléctrica con paredes y puerta**, con ventilación, como alternativa a la zona cercada.
4. **Gabinete en pared o autoportante** (dos montajes) y su distancia a la máquina.
5. **Placa de prensaestopas** con entradas de cable numeradas.
6. **Etiqueta de grado IP y aviso de ventilación** (informativos).

## 5. Ampliación: la sala eléctrica (segunda búsqueda)
- **Puertas:** abren hacia fuera, hacia la salida, con barra antipánico; no deben trabarse desde el lado del equipo. Las salas con equipo de gran corriente piden una salida en cada extremo (NEC art. 110, referencia de EE. UU.). Fuentes: [ETEM – CEC/NEC](https://etemengineering.ca/articles/electrical-room-design), [guía NEC](https://amporalabs.com/blog/electrical-room-design-requirements), [mipss.cl](https://mipss.cl/guia-completa-para-la-construccion-segura-de-salas-electricas-industriales/).
- **Pasillos:** 4 pies (≈ 1,2 m) entre equipos con partes vivas a ambos lados (EE. UU.); en una guía argentina, 1 m si las puertas de los tableros cierran hacia la ruta de escape y 0,5 m con otra puerta frontal. Fuentes: [CCPIA](https://ccpia.org/safe-clearances-for-electrical-equipment-working-space-and-dedicated-space/), [Farina, tableros eléctricos](https://www.editores-srl.com.ar/sites/default/files/ie343_farina_tableros_electricos_parte_2.pdf).
- **Altura:** 2,0 m libres en el espacio de trabajo; una norma universitaria pide cielos de al menos 3,6 m. Fuente: [MIT](https://web.mit.edu/Facilities/maps/DesignStandards/T13%20-%20Mechanical%20and%20Electrical%20Rooms%202022.pdf).
- **Iluminación:** unos 200 lux a 0,5 m del suelo frente al tablero y luz de emergencia (en un diseño, 50 lux a 1 m de la puerta). Fuente: [mipss.cl](https://mipss.cl/guia-completa-para-la-construccion-segura-de-salas-electricas-industriales/), [diseño de salas](https://www.slideshare.net/slideshow/pae-diseo-de-salas-electricaspptx/261663048).
- **Climatización:** la pérdida de calor de los equipos define el tipo de aire acondicionado. Fuente: [salas tipo contenedor](https://cesarmontorosifuentes.blogspot.com/2017/08/diseno-de-salas-electricas-tipo.html).
- **Bandejas dentro de la sala** para las interconexiones, y señalética de alto voltaje y de evacuación. Fuentes: misma y [guía de seguridad](https://leafelectricalsafety.com/blog/industrial-electrical-room-safety-requirements-guide).
- **No encontré:** extintores (tipo y ubicación) ni piso elevado.

Lo que el módulo toma de esto (valores de ejemplo, no verificados): puerta de salida con barra antipánico, señal de peligro, luz de emergencia, climatizador, bandeja de cables, extintor, pasillo libre marcado de 1 m y comprobación del espacio libre frente al tablero.
