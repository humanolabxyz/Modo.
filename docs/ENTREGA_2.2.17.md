# Puente H y fallas visibles — 2.2.17

## Referencia aceptada

El usuario confirmó la captura del simulador con cuatro transistores a la izquierda/centro y motor a la derecha como referencia del montaje. La fotografía de la placa física solo orienta el aspecto de los materiales. La nueva Práctica 1 adopta esa composición, manteniendo la red de la lámina de Clase 4 (public/diagrams/clase-4-practica-1-transistores.webp): cuatro NPN, cuatro resistencias de 1 kΩ, 12 V y control de diagonales. No se copian conexiones ambiguas o incorrectas de la captura. Los proyectos guardados no se migran: Aprender y referencias → Diagramas de la clase → Cargar la Práctica 1 · montaje de referencia crea uno nuevo.

Los pulsadores de cuatro patas pueden representarse sobre el canal e–f o con tres filas de separación dentro de una misma mitad, conservando las dos parejas internas en columnas separadas. Se valida esa huella al moverlos y se mantienen montajes antiguos. Fuente sobre la pizarra: la conexión negativa a un riel inferior se enruta por el borde cuando la fuente está arriba, sin cambiar destino, agarres ni modelo eléctrico.

## Fallas

El daño lo calcula el solver existente, sin introducir fallas aleatorias. Se corrige el humo anterior: se dibujaba detrás de la carcasa y su escala usaba coordenadas absolutas. Ahora cada grupo tiene coordenadas locales ancladas al cuerpo, se dibuja sobre las piezas y las partículas tienen tres ciclos finitos; no hay bucle de React ni animación infinita. Movimiento reducido muestra una marca estática. La carbonización se dibuja sobre el encapsulado.

Revisar abre una ventana movible y desplazable con causa, coordenadas, comprobaciones y Ver pieza y conexiones, que centra y selecciona la pieza. El aviso resumido sustituye las listas largas. Las ayudas generales se ocultan mientras haya avisos para no tapar Revisar. Detener conserva la reposición virtual existente.

## Evidencia técnica

La conducción simultánea de una rama de puente H puede crear sobrecorriente: https://www.ti.com/document-viewer/lit/html/SBOA174 . Para límites y patillaje se conserva la advertencia de fabricante/modelo: https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf . Los pulsadores tienen pares de patas ya unidos; una orientación incorrecta puede puentear su acción: https://learn.adafruit.com/make-it-switch/what-about-breadboard-switches . El tiempo del humo es una indicación visual, no un cálculo térmico real.

## Verificación

- TypeScript, build y npm install.
- qa/verify-failures-2.2.17.cjs: huella de cuatro patas, rechazo de filas incompatibles, sin cuerpos ni patas superpuestas, corriente ±0,213442337 A sin daño para cada mando individual, daño en cuatro transistores con ambos mandos. Chromium/WebKit a 393, 1180 y 1440: humo visible, animación finita, movimiento reducido, errores, apertura/cierre, localización y reposición. Chromium activa ambos mandos con dos contactos táctiles; WebKit ejercita las acciones de teclado.
- qa/verify-proto-model-2.2.5.mjs: ocho grupos de comprobaciones.
- qa/verify-laboratory.mjs: 38 comprobaciones.
- qa/verify-proto-2.2.7.cjs: motor, pulsadores, puntas, multímetro y lectura de 1 kΩ en móvil/tablet Chromium/WebKit. El test usa ahora los extremos de bj-r1, en lugar de las coordenadas de una distribución anterior.
- qa/verify-physical-source-2.2.12.cjs: seis combinaciones de navegador/tamaño, cables, tensión, corriente, perilla, corte y movimiento.

Las capturas están en qa/failures-2.2.17. Navegadores emulados; no se afirma validación sobre una tablet física.
