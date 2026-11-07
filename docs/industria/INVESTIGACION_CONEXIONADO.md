# Investigación: cómo se conectan y se instalan los equipos en una planta real

Fecha: 2026-11-07. Hecha con búsquedas web. **Ninguna de las fuentes es el texto de una norma**: son catálogos de fabricantes, material de capacitación y blogs técnicos. Lo que viene de conocimiento general, o donde las fuentes se contradicen, está marcado. Antes de tomar cualquier valor como especificación hay que contrastarlo con la norma vigente o la hoja de datos del equipo (esa es también la regla del catálogo «Genérico · no verificado»).

## 1. Flujo típico de un tablero de motor
Red trifásica → interruptor automático (protección) → contactor → relé térmico → motor. El mando se alimenta aparte: interruptor monopolar → fuente de 24 V CC → pulsadores / PLC → bobina del contactor. Es el mismo orden que usa el ejemplo del módulo.

## 2. Marcado de terminales de aparatos
- Polos de fuerza del contactor: **1/3/5 (entrada) y 2/4/6 (salida)**; bobina **A1/A2**; auxiliares **13-14** (NA) y **21-22** o **11-12** (NC). Fuentes: [NHP Motor Control Pocket Book](https://nhp.com.au/public/assets/pim/Original/10027/NHP-Motor-Control-Pocket-Book.pdf), [catálogo ABB](https://www.rgbautomatyka.pl/it/p/file/dd0f3848e1f746a66561b2e101db0924/ABB_CA5.01_14_3_4.pdf) (cita IEC 60445, IEC 60947-1 y EN 50005).
- Relé térmico: bloque **95-98** reservado al contacto de disparo. **Fuentes contradictorias** sobre cuál par es NC (95-96 o 97-98): verificar en la hoja de datos de cada equipo. El módulo usa 95-96 como NC.
- Fuente: [explicación de numeración IEC](https://industrialmonitordirect.com/blogs/knowledgebase/iec-contactor-terminal-numbering-convention-explained) (blog; algunas afirmaciones no son consistentes).

## 3. Borneras (bornes de paso sobre riel DIN)
- Tipos: **paso** (un cable entra y sale), **doble nivel**, **tierra** (PE) y **portafusible** con indicador de fusible quemado. Fuente: [Molex](https://www.molex.com/en-us/products/connectors/terminal-blocks-and-barrier-strips/din-rail-terminal-blocks).
- Secciones de ejemplo, **solo de catálogos concretos**: Molex ≈ 0,34–2,5 mm²; Omron XW5T-S 0,14–6 mm² (flexible con puntera hasta 4 mm²); Phoenix Contact, bloque de paso de 6 mm² nominal (0,2–10 mm²) y portafusible de 4 mm² nominal (0,5–6 mm²). Fuentes: [Omron](https://www.ia.omron.com/products/family/3481/specification.html), [Phoenix Contact](https://www.phoenixcontact.com/en-us/cat/terminal-blocks-2273?p=32). **No se confirmó** un estándar de ancho (5,2 mm, 6 mm…) ligado a una sección.
- Disposición: tensiones altas abajo y bancos separados para analógico, CA y CC; se puede mezclar CA y CC en una regleta solo con separación física (divisores). Tierra en regletas/barras sin numerar, marcadas con el símbolo de tierra. Fuentes: [colocación](https://industrialmonitordirect.com/blogs/knowledgebase/how-should-you-place-control-panel-terminal-blocks), [fuentes múltiples](https://industrialmonitordirect.com/ko/blogs/knowledgebase/multiple-power-sources-in-one-panel-nfpa-79-and-iec-60204-1-guide), [numeración](https://industrialmonitordirect.com/blogs/knowledgebase/control-panel-terminal-block-numbering-best-practices) (blogs).
- **No se encontró** información sobre tapas finales, topes y puentes entre bornes; hay que mirar catálogos de Phoenix Contact o Weidmüller.

## 4. Cables
- **Colores en Chile (NCh Elec 4/2003)**, según material educativo y comercial (no el texto oficial): fase 1 azul, fase 2 negro, fase 3 rojo, neutro blanco, protección verde o verde/amarillo. Fuentes: [Currículum Nacional](https://www.curriculumnacional.cl/614/articles-90145_recurso_pdf.pdf), [Sodimac](https://www.sodimac.cl/sodimac-cl/content/como-elegir-conductores-electricos). El texto completo está en la [copia de la SEC](https://rise.esmap.org/data/files/library/chile/Energy%20Efficiency/Chile%20norma4_elec%20completa%202003.pdf) (sin revisar aquí).
- **Colores de tableros de máquina (IEC 60204-1)**: PE verde/amarillo (consistente); negro para fuerza y rojo para mando en CA según una fuente, azul para neutro y CC negativo según otras, con «puede usarse» en muchos casos. **Fuentes en conflicto.** Fuente: [colores IEC 60204-1](https://industrialmonitordirect.com/blogs/knowledgebase/european-control-panel-wire-colour-codes-per-iec-60204-1).
- **Punteras (terminales de punta)**: se usan en cable flexible para que no se abran los hilos; el color depende de la sección y **del fabricante** (el código DIN 46228-4 difiere del de Weidmüller y del francés NF C 63-023). Ejemplo: 0,75 mm² gris y 2,5 mm² azul en DIN; Weidmüller usa rojo para 1,5 mm² y azul para 2,5 mm². Fuentes: [Phoenix Contact](https://www.phoenixcontact.com/en-de/products/ferrules?p=3), [Weidmüller](https://houseofelectrical.com/media/catalog/document/69660/Weidmuller_0186100000_Catalog.pdf).

## 5. Canaletas, bandejas y tubos
- **Llenado de canaleta**: se cita 40 % (NEC art. 376 / NFPA 79) y 40 % para control y 60 % para fuerza según otra fuente. **No se confirmó la cláusula**; las fuentes difieren. Fuente: [diseño de tableros](https://industrialmonitordirect.com/blogs/knowledgebase/control-panel-design-ul-508a-nfpa-79-iec-61439-reference).
- Separar fuerza y control en canaletas distintas (por ejemplo 480 V CA y 24 V CC). Misma fuente.
- **Bandeja vs canaleta cerrada vs tubo**: la bandeja es la más usada en plantas industriales y permite cambios; la canaleta cerrada protege mecánicamente y sirve donde hay pocos cables y recorrido fijo; el tubo (conduit) se prefiere con exposición a golpes o intemperie. Fuente: [comparación](https://directchannel.uk.com/cable-tray-vs-trunking-key-differences-when-to-use-each/), [bandeja vs conduit](https://industrialelectricalwarehouse.com/blogs/news/cable-tray-vs-conduit) (vendedores).

## 6. Sensores
- Sensor inductivo de tres hilos: PNP o NPN. Por **conocimiento general, no verificado en esta búsqueda**: marrón +V, azul 0 V, negro salida. Confirmar en cada hoja de datos.
- Tamaños M12, M18 y M30 con distancias de detección típicas ≈ 2–8, 5–14 y 10–20 mm (Datalogic); Wenglor lista máximos de 10, 20 y 30 mm: **varía mucho por fabricante**. Según la norma, la distancia nominal se mide contra una placa de acero de 1 mm. Los sensores no enrasables necesitan libre el metal alrededor. Fuente: [Datalogic](https://www.datalogic.com/upload/Flipbook/RG_inductive_sensor_en/files/assets/common/downloads/RG-InductiveSensors2013-EN.pdf).

## 7. Neumática
Compresor → unidad de mantenimiento (filtro, regulador, a veces lubricador; regulada en torno a 6 bar en un manual de capacitación) → válvula. En una 5/2 el puerto 1 (P) recibe la presión, 2 y 4 van a las dos cámaras del cilindro y hay dos escapes. Fuentes: [manual](https://nimi.co.in/cits_ebooks/Electronics_Mechanic/Electronic_Mechanic_TP_Volume_2/files/basic-html/page285.html), [AutomationDirect](https://cdn.automationdirect.com/static/press/Basic-Pneumatic-Circuits-white-paper.pdf). **No se confirmaron** diámetros de manguera ni roscas de puerto.

## 8. Seguridad de máquinas
La distancia de seguridad la fija ISO 13857; un resguardo menor de 1 400 mm no debe usarse sin otras medidas (resumen de un fabricante). Los diseños de resguardo siguen ISO 14120 y las funciones de seguridad (paro de emergencia) ISO 13849-1 / ISO 13850. **No se encontró** información de los paros por cable de cintas transportadoras. Fuentes: [ISO 13857](https://www.iso.org/standard/69569.html), [Troax](https://www.troax.com/app/uploads/Brochure-Safety-Guide_EN.pdf).

## 9. Qué falta hoy en el módulo y se puede construir sin inventar datos
1. **Bornera real**: bornes de paso, de tierra y portafusible, con puentes y tapa final, y filas separadas por tensión.
2. **Barras de tierra y neutro** en el tablero, con conexión PE obligatoria.
3. **Color del cable por función**, con una tabla configurable (Chile / IEC) marcada como «no verificada», en vez del color fijo por tipo.
4. **Punteras** (con color por sección) y **etiquetas de cable** numeradas en ambos extremos.
5. **Relleno de canaleta**: aviso al pasar de un porcentaje configurable y separación fuerza/mando.
6. **Unidad de mantenimiento (FRL)** y mangueras neumáticas dibujadas como tubos (no como cables eléctricos).
7. **Conector M12** en sensores y resguardos con altura según ISO 13857.

Todas las medidas, secciones y distancias que se usen deben llevar la marca de «ejemplo» o de «verificado» con su fuente.
