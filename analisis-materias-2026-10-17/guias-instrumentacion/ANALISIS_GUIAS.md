# Guías prácticas de Instrumentación Industrial

Revisión del 17 de octubre de 2026 de los cinco DOCX entregados en este intercambio. Se leyó el texto completo del cuerpo, tablas, encabezados y pies; también se inspeccionaron las imágenes de circuitos y medición extraídas de los documentos. Las copias y extracciones están en G01–G05 y sus hashes en `inventario.json`. No se modificaron las fuentes ni el código del simulador.

## Archivos y duplicados

| ID | Archivo | Contenido |
|---|---|---|
| G01 | Guía práctica laboratorio N°1 (2).docx | Detectores de presencia; dos experiencias |
| G02 | Guía práctica laboratorio N°2 - 2026 (4).docx | Sensores de proximidad y conexión al PLC; una experiencia con varias actividades |
| G03 | Guía práctica laboratorio N°2.docx | Sensores continuos de temperatura; tres experiencias |
| G04 | Guía práctica laboratorio N°2 (1).docx | Copia idéntica byte por byte de G03 |
| G05 | Guía práctica laboratorio N°2 - 2026 (5).docx | Copia idéntica byte por byte de G02 |

Son cinco archivos y tres documentos distintos. Dos documentos diferentes llevan el número 2: el catálogo debe distinguirlos por tema, sin deduplicarlos por título o número. G01 y G03 indican MOII03; G02 indica ARII02. Todos indican Primavera 2026. Esos códigos se conservan como metadatos de la fuente; no se deduce una equivalencia administrativa.

## G01 Detectores de presencia

La experiencia 1 pide investigar señales discretas y continuas, naturaleza de los detectores, características, clasificación por hilos, principio y salida, impacto industrial y exposición grupal con debate.

La experiencia 2 pide montar los circuitos representados con detector inductivo de tres hilos, verificar la salida con y sin objeto, graficarla, probar objetos metálicos y no metálicos, repetir con detectores capacitivos y fotoeléctricos y discutir resultados. Se utilizan fuente y multímetro. La imagen contiene dos esquemas, rotulados PNP y NPN, con fuente de 24 V y voltímetro.

Adaptación propuesta: escoger el sensor, consultar su ficha, conectar fuente y puntas del multímetro, acercar y retirar objetos, tomar lecturas y construir la gráfica. Debe conservarse la investigación y exposición como actividad propia. Antes de convertir los dibujos genéricos en un montaje validado, confirmar ficha, carga, referencia de medida y conexiones del equipo concreto; la imagen por sí sola no define todas esas condiciones.

## G02 Proximidad y PLC

La guía especifica CR30-15DN, CR30-15DP, XS118BLPAL2 y BR100-DDT-P, además de maqueta PLC Delta, fuente y multímetro. Pide:

1. Consultar manuales y registrar marca, número de hilos, tipo de salida, alimentación y distancia de detección.
2. Explicar el principio y qué objetos puede y no puede detectar cada dispositivo.
3. Comprobar funcionamiento mediante multímetro con la conexión del fabricante y completar estados de salida alto (24 V) o bajo (0 V), con y sin objeto.
4. Graficar la salida de cada dispositivo.
5. Conectar el dispositivo asignado al PLC para que, en presencia de un objeto, su entrada digital lea 24 V; demostrarlo al docente y presentar el diagrama.
6. Redactar una conclusión individual por integrante y entregar el documento respondido.

Adaptación propuesta: un banco compartido con G01, ampliado con los modelos concretos y el PLC. El estudiante debe comprobar mediciones y estado de entrada, además de dibujar o montar la conexión. No basta con que una animación encienda el sensor. Los manuales de esos cuatro modelos y la identificación exacta de la maqueta deben verificarse antes de fijar bornes, colores, distancias y conexiones en el simulador. Esta revisión no incluye aún esa consulta externa.

## G03 Temperatura y Pt100

Esta es la guía que faltaba para precisar la práctica actual del usuario. Enumera baño u horno de pozo seco, termocupla K o J, RTD PT-100, transmisor, fuente y multímetro. Contiene tres experiencias distintas:

1. **Investigar y explicar.** Comparar señales discretas/continuas, clasificar termocuplas y RTD, explicar sus principios y tipos de salida, preparar una presentación y debatir.
2. **Medir y comparar sensores.** Obtener curvas de termocupla y RTD a temperatura ambiente, 50, 75 y 100 °C. Contrastar con tablas o una aplicación de sensores, registrar los datos y presentar las curvas en Excel u otra planilla. La imagen muestra termocupla conectada a medición en mV y PT-100 a medición en OHM. El rótulo 50 °C del dibujo es un ejemplo visual; no reemplaza los cuatro puntos pedidos.
3. **Medir mediante transmisor.** Conectar específicamente la termocupla anterior al transmisor, configurarlo con salida en tensión —la guía propone como ejemplo 0–10 V— y construir otra curva con temperatura, salida de la termocupla y salida del transmisor en los mismos cuatro puntos.

La experiencia 3 no pide expresamente conectar el Pt100 al transmisor. Si se ofrece esa variante, debe identificarse como ampliación y depender de la ficha del transmisor. Tampoco se fija el rango de entrada correspondiente al ejemplo 0–10 V: no asumir que 0–100 °C sea el ajuste exigido.

Adaptación propuesta: una práctica guiada independiente de temperatura con mesa de instrumentos, selección K/J o Pt100, ajuste del baño/horno, colocación de sonda, elección de función del multímetro y puntas, lectura, tabla y gráfica. Después, un paso separado para configurar y medir el transmisor con termocupla. El alumno debe poder equivocarse en la selección de magnitud o conexión y recibir una explicación visual que permita corregirlo. Las lecturas simuladas deben diferenciarse de los datos medidos en el laboratorio real.

Quedan por confirmar modelo y cableado del Pt100, tipo de termocupla utilizado en clase, modelo y configuración del transmisor, rango configurado y condiciones de referencia necesarias para comparar lecturas. El documento permite elegir K o J; no autoriza fijar uno sin indicarlo. Las tablas o ecuaciones de referencia deberán verificarse antes de programar valores numéricos.

## Observaciones y efecto en el plan

G03 remite dos veces al circuito de la guía de laboratorio 1, pero G01 trata detectores discretos. Esa remisión es ambigua: no usar el circuito de proximidad como conexión para el Pt100. La propia imagen de G03 aclara las magnitudes, pero no proporciona un bornero completo de los equipos físicos.

G01 y G03 solicitan informe con objetivo, instrumentos, circuitos, tablas, gráficos, cálculos cuando procedan, discusión, conclusiones y percepción del alumno. G02 solicita completar el propio documento y conclusiones individuales. La plataforma debe conservar esas diferencias y permitir registrar observaciones y datos reales.

Estos archivos corrigen la anterior declaración de que faltaban las guías prácticas: ahora están disponibles tres guías distintas. P&ID y los otros vacíos docentes continúan pendientes. La matriz anterior de 32 PDF sigue siendo un inventario de PDF; estas tres guías se incorporan como complemento, sin alterar aquel recuento.

Se recomienda priorizar la práctica de temperatura/Pt100 por su uso actual en clases y mantener como siguiente banco el de detectores y PLC. Redes conserva su práctica independiente de fabricación de cable. Control de Máquinas conserva el panel ya existente.

No se han implementado estos bancos: la lectura documental permite definir su alcance; no demuestra que el simulador actual los resuelva.
