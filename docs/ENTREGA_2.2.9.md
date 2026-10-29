# Soldadura en toda la pizarra blanca — 2.2.9

Se retira la comprobación que aceptaba herramientas solo entre x20–640 / y65–665 y el fondo azul. Las herramientas se pueden soltar sobre toda la superficie visible. El SVG y su contenedor permiten dibujo e interacción fuera de su tamaño nominal; PanStage habilita desplazamiento sin límite solo en soldadura. Los demás módulos conservan sus límites.

Tocar una herramienta la coloca alrededor del centro actual de la vista. Ajustar incluye las herramientas y extremos apartados. El guardado conserva extremos alejados con validación de coordenadas finitas.

Verificación: npm install sin vulnerabilidades, check y build. verify-solder-whiteboard-2.2.9.cjs prueba seis combinaciones (Chromium/WebKit, 393/820/1440 px): desplazar hasta fuera del SVG original, arrastrar desde selector a la pizarra, confirmar el hit real de la herramienta y volver a moverla. Gestos CDP táctiles en Chromium, mouse en WebKit. No son dispositivos físicos.

verify-solder-touch-2.2.5.cjs comprueba el flujo térmico; la prueba ahora busca la posición actual del limpiador en vez de asumir una coordenada fija, porque las herramientas aparecen donde está la vista.

Capturas: qa/solder-2.2.9/.
