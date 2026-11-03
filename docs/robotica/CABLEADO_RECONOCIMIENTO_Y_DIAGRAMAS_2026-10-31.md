# Cableado: reconocer el armado y señalar cada conexión

La guía anterior podía permanecer en el robot básico de dos ruedas aunque el proyecto ya tuviera protoboard, regulador, interruptor y LED. Los ajustes previos no mostraban cable fantasma y la lista de pasos era solo texto.

Ahora el modo automático usa la referencia de armado seleccionada, incluso en un armado parcial, o compara el inventario de las plantillas cuando hay una coincidencia suficientemente clara. Conserva la guía básica para el montaje sin protoboard y permite elegir manualmente otra referencia. Cuando no hay una identificación segura, lo indica. Las piezas repetidas se asignan una sola vez y conservan identidades y nombres al ser reubicadas; no se reutiliza un motor o un driver ya emparejado para suplir otro faltante.

El paso de cable dibuja una referencia de color con dos pines señalados y etiquetas 1/2. Durante los ajustes se previsualiza el siguiente cable con una explicación que distingue la referencia de una conexión ya creada. Anterior, Siguiente y la lista permiten consultar un paso sin alterar su estado eléctrico. El avance se calcula por continuidad del proyecto; consultar una línea no la conecta.

El esquema pin a pin deriva de la misma guía y resuelve los nombres de las piezas reales. Las líneas pendientes se dibujan discontinuas; las comprobadas, continuas y con una marca. El esquema se puede consultar dentro del panel o abrir en una ventana ajustable. Elegir una conexión en él selecciona ese paso, dibuja su referencia y encuadra sus dos pines en 3D. Los diagramas son de conexión educativa; no son esquemas de fabricación ni validación de hardware.

Fuentes: src/robotics/guide/{guides.ts,wireGuide.ts,WiringGuide.tsx,WiringDiagram.tsx}, src/robotics/RoboticsApp.tsx, src/robotics/build/BuildCanvas.tsx y src/styles/robotics.css.

Validación: npm run check y npm run build; qa/verify-robotics-wire-recognition.mjs; qa/verify-robotics-wire-guide.mjs; qa/verify-robotics-wire-guide-all.mjs (10 plantillas completan su guía y conservan la trayectoria simulada de referencia); qa/verify-robotics-wire-recognition-ui.cjs y qa/verify-robotics-wire-guide-ui.cjs. Ver los resultados finales en qa/robotics-wire-recognition/browser-results.json y qa/robotics/wire-guide-ui-verification.json. Capturas en qa/robotics-wire-recognition/.

Cambios locales. Sin despliegue ni prueba en dispositivo físico. El build mantiene el aviso de paquetes mayores de 500 kB.
