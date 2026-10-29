# modo. — Robótica | Especificación funcional v1

## Objetivo y alcance
Robótica será la quinta tarjeta del inicio de modo., junto a Laboratorio, Estudio, Panel de control y Comunidad. No reemplaza ni reorganiza los módulos existentes. Su objetivo es permitir que estudiantes armen robots **desde cero**, posicionando componentes libremente en 3D, cableándolos pin a pin, programándolos y probando **el mismo montaje** en un escenario 3D blanco y minimalista.

Referente inicial: robot móvil de dos ruedas con Arduino UNO R3, controlador L298N, sensor HC-SR04, alimentación, chasis, ruedas y motores DC. El foco de la primera entrega completa es un proyecto funcional, no una biblioteca extensa de robots decorativos.

## Hechos verificados por la auditoría local de Codex
- Versión declarada en el código: **2.5.4** (la interfaz puede expresarla 2.54). La auditoría fue solo lectura y superó una comprobación de TypeScript.
- Existen proyectos con guardado local, duplicación, deshacer/rehacer e importación/exportación `.modo.json`.
- La protoboard ya tiene continuidad, componentes, cálculo DC, diagnóstico y medición.
- El taller industrial ya maneja rieles, canaletas, montaje, recorridos de cable y comprobación de fallas.
- Los motores eléctricos/de señales están separados según la herramienta; compartir proyecto no equivale a compartir una red de conexiones.
- El ciclo general del laboratorio opera cada 100 ms; no alcanza para emular directamente temporización fina de Arduino, PWM o pulsos ultrasónicos.
- Referencias del código según informe: `src/lab/model.ts`, `src/lab/useLaboratory.ts`, `src/lab/dc.ts`, `src/lab/engine.ts`, `src/lab/equipment/cabinet.ts`.

**Hallazgo de producto aportado por el usuario, pendiente de verificar en código:** Panel de control dispone de ventanas flotantes que pueden arrastrarse, redimensionarse y cerrarse. Reutilizar su implementación real; no diseñar un gestor de ventanas paralelo.

## Experiencia principal
### Inicio de Robótica
- Una tarjeta nueva en el inicio existente; conservar estilo, animaciones, responsive y cuatro tarjetas actuales.
- Acciones claras: nuevo proyecto, abrir/continuar proyecto y, después, proyectos de referencia.
- Un proyecto vacío debe ser utilizable; un kit de ejemplo será opcional y no limitará el montaje libre.

### Entorno Construir
- Canvas 3D protagonista con navegación fluida tipo pizarra de Figma, adaptada a tres dimensiones.
- Insertar, seleccionar, selección múltiple, mover en ejes XYZ, rotar y, solo cuando sea técnicamente válido, escalar; duplicar, borrar, bloquear, agrupar, deshacer/rehacer.
- Cámara: orbitar, pan, zoom, encuadrar selección y encuadrar proyecto; accesos a vistas frontal/lateral/superior/isométrica.
- Snapping opcional, guías, puntos de anclaje y uniones rígidas/articuladas; el usuario conserva colocación libre. Detectar interferencias mecánicas significativas.
- Piezas representadas por modelos 3D con escala y geometría orientativa correctas, terminales etiquetados y propiedades; verificar dimensiones cuando afecten montaje.
- Cableado 3D entre pines, con previsualización, identificación de conexiones, puntos de control/rutas, colores y diagnóstico. La curva visible **no** define por sí sola el circuito lógico.
- Acceso al editor de código y al catálogo desde ventanas existentes flotantes, redimensionables y cerrables. No dejar paneles abiertos por defecto innecesariamente.

### Entorno Simular
- Mismo robot/proyecto generado desde Construir, mostrado en un espacio blanco tipo cubo con suelo, paredes, iluminación y sombras suaves.
- Iniciar/pausar/reiniciar; cámara libre y seguimiento; añadir y mover obstáculos; observación contextual de motores, sensor, señales y errores.
- El movimiento depende de montaje, conectividad, alimentación y programa. No simular respuesta automática sin causalidad.
- Gravedad, colisiones, contacto, articulaciones y movimiento diferencial según el nivel de fidelidad validado; documentar aproximaciones.
- Volver a Construir sin perder el proyecto. La geometría, código y cableado son una sola fuente de verdad.

## Biblioteca inicial
- Chasis 2 ruedas, rueda loca, dos ruedas y dos motores DC con uniones físicas.
- Arduino UNO R3 (ATmega328P) con pines identificados.
- Placa comercial L298N, conexiones lógicas/energía, entradas de control, salidas y jumpers según modelo específico.
- HC-SR04 con TRIG/ECHO y orientación física del sensor.
- Batería/portapilas y cableado; protoboard reutilizada si es compatible.
- Elementos básicos de sujeción para montar piezas (soportes), sin crear CAD manufacturero completo.

## Requisitos de verdad funcional
1. Añadir un componente cambia el modelo de montaje y se refleja en 3D y persistencia.
2. Conectar un cable crea una relación entre **pines de instancias** concretas; no se debe confundir dos protoboards ni dos placas iguales.
3. La alimentación y masa común afectan estados eléctricos; separar alimentación lógica y de motores cuando corresponda.
4. Programa ejecutado -> estados de pines -> driver -> motores -> dinámica del robot -> distancia al obstáculo -> señal de sensor -> programa.
5. Quitar alimentación, desconectar un motor, orientar mal el sensor o cambiar el sketch produce diferencias observables y coherentes.
6. Guardar/reabrir preserva piezas, transformaciones, ensamblajes, conexiones, código y escenario.
7. Uso táctil y adaptación móvil: probar y documentar límites; no prometer que una UI CAD compleja será idéntica en móvil.

## No objetivos iniciales
- Editor CAD paramétrico industrial, fabricación automática o modelado 3D arbitrario de mallas.
- Compatibilidad con todas las librerías Arduino o con cualquier placa de la familia UNO sin validación.
- Modelos físicos de grado metrológico ni exactitud de batería, fricción o motores no medida.
- Decenas de kits, brazos robóticos o competencias multiplayer.
- Modificar la navegación de las cuatro secciones actuales o rehacer la identidad visual.

## Principios de UX
One Click: una acción clara y el siguiente paso contextual. El canvas es protagonista. Mostrar controles útiles al seleccionar un objeto, cable o estado. Evitar menús duplicados y un gestor de ventanas nuevo. Mantener estados vacíos, carga, error y recuperación comprensibles.
