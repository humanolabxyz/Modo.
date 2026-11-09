# Bosque de exploración para el robot de orugas

En Robótica, abre **Escenario → Cargar bosque** con la simulación detenida. La plantilla **Robot de orugas con radar y cara** ya trae este escenario. Cargar el bosque reemplaza la pista y los obstáculos de la escena. Deshacer permite recuperar el montaje anterior. Si el proyecto guardado trae el programa de fábrica anterior del radar, el mismo paso lo actualiza. Los programas editados conservan su código.

El bosque parte de 8 × 8 m. En **Escenario → Tamaño del área** se puede elegir 4, 8, 12 o 16 m por lado. **Ver área completa** encuadra los límites. Los obstáculos tienen colisión y reflejan el sensor ultrasónico cuando el rayo los alcanza. El tronco suelto es un cuerpo móvil. Los elementos se pueden editar desde Escenario. El pasto decorativo se dibuja en un solo lote.

El bosque también incluye balizas visibles al radar y ramas bajas que las orugas pueden empujar. Cuando una pieza de madera se desplaza al menos 4 cm cerca del robot, aparece «Madera desplazada» y suena un golpe breve. Cada pieza emite ese aviso una vez por ejecución. En Escenario puedes agregar ramas y balizas con la simulación detenida.

**Añadir copia del robot** copia el montaje, sus cables internos y el programa de la placa seleccionada. Se pueden ejecutar hasta tres robots móviles independientes en una escena. Cada placa ejecuta su programa en el worker y los robots comparten el suelo, los obstáculos, las colisiones y las lecturas del radar. La consola serie corresponde a la placa seleccionada al iniciar.

**Nueva fábrica** crea otro proyecto con una nave industrial de 8 × 8 m. En la ventana del brazo, abre **Cinta**, pulsa **Habilitar servos** y luego **Clasificar lote**. La cinta transporta las piezas, el sensor detecta su llegada, el lector RGB determina el destino y el E6 deposita cada pieza. Desde la misma ventana se pueden ensayar un atasco y una falla de detección.

Ante un obstáculo, el programa frena, abre los ojos, levanta los brazos y emite un sonido. Retrocede, mira a ambos lados y señala el giro elegido con la cara y un tono diferente según el lado. Si la lectura frontal deja de variar mientras ordena avanzar o vuelve a encontrar un bloqueo tras girar, prueba una marcha atrás y un giro más amplios. La recuperación se basa en la lectura ultrasónica y en el tiempo de la maniobra.

El sketch Arduino y su HEX están en los archivos de prueba y en la plantilla. La prueba con Rapier cubre una barrera baja, confirma que el robot retrocede y verifica que sale por el costado. Chromium verificó el bosque, las caras, los avisos y el contexto de audio. En vista móvil se comprobó la carga y recarga del bosque desde un proyecto anterior, tanto con código de fábrica como con código editado.

[Vista inicial](../../qa/robotics/tracked-ui-start.png) · [Robot en marcha](../../qa/robotics/tracked-ui-corriendo.png) · [Escenario en móvil](../../qa/robotics/forest-mobile.png)
