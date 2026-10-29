# Historial de versiones · modo. / PanelLab

Versión actual: 2.6.1 Beta. Registro público: /versiones/.

Las versiones antiguas se resumen a partir de sus entregas documentadas; no se inventan versiones intermedias ni fechas de publicación. La publicación de esta entrega se registra por separado en qa/release-2.1.0/.

## 2.6.1 · Robótica (Beta): física y robot de ejemplo

29 de octubre de 2026.

- El robot se mueve por física real (Rapier): motores con par, ruedas, suelo, obstáculos y HC-SR04 con rayos.
- Ventana Escenario (cajas, cilindros, fricción), cámara de seguimiento y estado de ruedas y distancia en la Consola.
- Plantilla «Robot 2 ruedas · listo para usar»: armado, cableado y programado, con caja de ejemplo.
- Rueda loca más alta y al frente del chasis para que el robot quede equilibrado.

## 2.4.1 · Más fluido en todo el sitio

24 de octubre de 2026.

- Herramientas del Laboratorio más rápidas al abrir (ventanas ocultas fuera del cálculo de pantalla; Soldadura ~40 % más rápida con CPU limitada).
- Arrastre de ventanas por capa, sin repintar el fondo; ventanas ocultas sin trabajo de medición.
- Estudio sin consumo en reposo: animaciones de portadas solo al apuntar la tarjeta.
- Caché de fuentes e imágenes en el navegador para visitas repetidas.
- Sin cambios funcionales. Límites conocidos: pan/zoom del tablero y texto SVG de Temperatura/Detectores.

## 2.4.0 · Una sola identidad, ventanas ajustables y estados con color

24 de octubre de 2026.

- Identidad del Home aplicada a Comunidad, Legal, Versiones, Estudio, Laboratorio y Panel (capa `src/styles/modo-identity.css`), con contraste AA revisado.
- Todas las ventanas se mueven, se ajustan por cualquier borde o esquina, se maximizan, recuerdan posición y tamaño, y reacomodan su contenido. Proyecto, selector de componentes, editores de valores y videos tutoriales pasan a ser ventanas.
- Diagrama del Panel como ventana flotante en escritorio, sin textos de relleno.
- Estados con color: rayo, candados, interruptores virtuales, estado de energía y Simular/Detener en verde, azul o rojo; hover, foco y objetivos táctiles revisados.
- Protoboard: fuente DC, componentes, multímetro y zoom móvil mejorados.

## 2.3.1 · Centrado de las tarjetas en escritorio

23 de octubre de 2026.

- Márgenes exteriores equilibrados al centrar las cuatro tarjetas como un conjunto.
- Panel y Comunidad con el mismo tamaño lateral y perspectiva simétrica.
- Sin cambios en el carrusel móvil ni en las mediciones de la versión 2.3.0.

## 2.3.0 · Nuevo Home y mediciones del panel

23 de octubre de 2026. Historial completo intermedio en `src/data/releases.ts` y `/versiones/`.

- Home aprobado de modo. con ilustraciones 3D, reloj de láminas, preferencia de movimiento y carrusel responsive.
- Móvil: arrastre táctil o con mouse, selección de tarjetas laterales antes de entrar; sin estadísticas. Escritorio sin flechas de navegación.
- Footer con Félix Levancini Toledo e historial real de versiones.
- Incluye las correcciones locales de medición V~/A~ del panel, tomas A/COM, inserción en serie y ejemplo contactor-temporizador. Son modelos didácticos, con parámetros declarados.
- Los nuevos assets se incluyen en el precache de la PWA.
- Evidencia de publicación y comprobaciones en `qa/release-2.3.0/`.

## 2.1.0 · Interfaz soft UI, estudio unificado y matrices

18 de octubre de 2026.

### Inicio y navegación

- Portada centrada en Panel de control, Estudio y Laboratorio, con el título Laboratorio eléctrico.
- Fotografías integradas a los botones y vistas previas de las interfaces reales.
- Despliegue al pasar el cursor en PC y al tocar en móvil y tablet, con botón Entrar en cada sección.
- Transiciones suaves al abrir, cerrar y cambiar de sección; adaptación a movimiento reducido.
- En pantallas táctiles, la vista ampliada reemplaza la tarjeta original sin duplicarla ni dejar un espacio vacío.
- Entrada directa al Panel en modo libre desde Entrar, Continuar práctica y Simulador, sin selector inicial. Se conserva el circuito guardado.

### Estilo compartido y estados

- Paleta blanca y gris con acento negro, relieve soft UI y fotografías de detalle.
- Barras contenedoras comunes, iconos, menús y ventanas coherentes en Inicio, Panel, Estudio, Laboratorio, Comunidad y Políticas.
- Verde funcional para simulación, alimentación virtual y señales activas; conservación de los colores técnicos de cables, bornes e instrumentos.
- Correcciones de contraste en textos y etiquetas; ayudas alineadas, legibles y adaptadas al espacio disponible.
- Adaptación de controles y composición para PC, móvil y tablet en ambas orientaciones.

### Estudio y material de clase

- Catálogo organizado por ramo, unidad y clase, con acceso a los documentos originales.
- 27 recorridos académicos con 90 pasos en Instrumentación, Electrónica, Máquinas, Redes y Matemáticas, además de las prácticas con herramientas ya existentes.
- Explicación antes de la acción, ejemplos, ejercicios, comprobación, corrección y reintento; abrir una actividad no equivale a aprobarla.
- Navegación común Entender → Ver un ejemplo → Practicar → Comprobar cuando corresponde; contexto de clase y acceso anterior/siguiente.
- Cuaderno, progreso, respaldo y recuperación del trabajo en el navegador.
- 47 fuentes originales disponibles bajo demanda, con conservación de sus formatos y referencias.

### Matemáticas · Unidad 2

- Repaso de funciones exponenciales y logarítmicas, con práctica por tema o de toda la unidad.
- Modelación de crecimiento de bacterias y eliminación de fármacos, vinculadas a sus fuentes.
- Diez preguntas de repaso, respuestas con explicación y recuperación del avance.
- Conservación de las notas sobre el alcance de los modelos y las discrepancias presentes en las fuentes.

### GeoGebra y matrices

- Mesa de trabajo adaptada al alto de la pantalla, barra común del laboratorio y controles agrupados.
- Botón Lecciones con catálogo de funciones y matrices en una ventana flotante.
- Tres prácticas complementarias de matrices: datos y operaciones; producto y orden; determinante, inversa y sistemas.
- 11 actividades de matrices con explicación, comandos de ayuda, comprobación de resultados reales y revisión conceptual desde Estudio, unidad 4.
- Se conservan las lecciones de funciones lineales, cuadráticas y logarítmicas.
- Archivos independientes para el espacio libre y cada lección, guardado local e importación/exportación .ggb. La herramienta interna conserva la interfaz propia de GeoGebra.

### Continuidad del laboratorio

- Acceso a Esquemas, Equipos eléctricos, PLC, HMI, Procesos, Protoboard, Temperatura, Detectores y GeoGebra desde la misma aplicación.
- Se conservan el cableado, diagramas, historial, instrumentos, simulaciones y experiencias guiadas existentes.
- Créditos de Humano Lab, políticas y uso educativo visibles.
- Número de versión y registro de cambios accesibles desde el inicio.

## 2.0.0 · Práctica, cableado y evolución del laboratorio

Versión anterior documentada.

### Base existente

- Cableado con terminales identificados, edición de curvas y colores, conexiones compartidas e inspector.
- Deshacer/rehacer, guardado en el navegador e importación/exportación de prácticas JSON.
- Diagramas de referencia, pasos y ayudas para reconocimiento y práctica.
- La aplicación se amplió posteriormente con simulación, herramientas de laboratorio, estudio, tutoriales y ventanas adaptables. Estas incorporaciones no tenían números de versión intermedios registrados.

## 1.1 · Fidelidad visual del banco

Referencia histórica documentada.

### Banco y referencias

- Revisión visual de módulos, bornes, etiquetas y fotografías del prototipo.
- Identificadores compuestos por módulo y borne; distinción entre colores de conectores y cables.
- Navegación del banco mediante zoom, desplazamiento, selección e inspector.
