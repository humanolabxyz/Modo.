# Etapa 2 — Constructor 3D y ensamblaje

**Requiere:** etapa 1 aprobada; D-07, D-08 aprobadas.
**Objetivo:** armar libremente el robot de dos ruedas con piezas del catálogo y uniones mecánicas persistentes.

## Tareas

### 2.1 Catálogo (`src/robotics/catalog/`)
- [ ] `ComponentDefinition` para: chasis 2WD, motor DC TT ×2, rueda 65 mm ×2, rueda loca, Arduino UNO R3, módulo L298N, HC-SR04, portapilas, soporte del sensor, soporte genérico.
- [ ] Pines completos y con nombre real (UNO: D0–D13, A0–A5, 5V, 3V3, VIN, GND×3 con `internalNet`; L298N: IN1–IN4, ENA, ENB, OUT1–OUT4, +12V, GND, +5V, jumpers como `props`; HC-SR04: VCC, TRIG, ECHO, GND; motor: M+, M−).
- [ ] Anclajes: chasis (motor izq/der, rueda loca, placa, driver, portapilas, soporte frontal), motor (eje), rueda (cubo).
- [ ] Geometría procedural con medidas en metros; `dimensionsSource` honesto.

### 2.2 Inserción y selección
- [ ] Ventana Piezas: búsqueda, categorías, arrastrar al canvas con previsualización fantasma sobre el plano; si no se puede colocar, explicar por qué.
- [ ] Selección por clic, Shift para múltiple, contorno de selección sin ocultar pines.
- [ ] Teclado: Supr borrar, Ctrl+D duplicar, Ctrl+Z / Ctrl+Shift+Z, Esc deseleccionar, F encuadrar selección. Desactivados si el foco está en un campo.

### 2.3 Transformaciones (dentro de la pizarra tipo Figma de la etapa 1)
- [ ] La barra contextual de la selección suma Mover / Rotar / Unir; atajos `G` mover, `R` rotar; el menú contextual suma acciones de pieza.
- [ ] El portapilas se modela solo como pieza mecánica (volumen, masa, anclaje). Sus pines eléctricos esperan D-11.
- [ ] Gizmo de mover (XYZ + plano) y rotar con pivote visible (`PivotControls` o `TransformControls`).
- [ ] Ventana Propiedades: posición (mm en UI, metros en el modelo), rotación en grados, bloqueo, etiqueta.
- [ ] Snapping opcional (paso 1/5/10 mm, 15°) con interruptor en el dock.
- [ ] Un arrastre del gizmo = un paso de historial (al soltar). Mientras se arrastra el gizmo, la cámara no orbita.

### 2.4 Ensamblaje (`commands.ts`, `interference.ts`)
- [ ] Al acercar un ancla compatible (≤ 15 mm) se resalta y se ofrece «Unir»; el usuario puede soltar sin unir.
- [ ] Unión `rigid` y `wheel-hinge`; mover el padre mueve a los hijos; quitar una pieza rompe sus uniones (con aviso).
- [ ] Detección de interferencia por cajas orientadas (OBB) entre piezas no unidas: advertencia visual, no bloqueo.
- [ ] Ventana Estructura: árbol padre/hijo, renombrar, bloquear, seleccionar desde el árbol.
- [ ] Agrupar/desagrupar (`groupId`).

### 2.5 Proyecto de referencia (opcional, D aprobada)
- [ ] «Robot 2 ruedas (ejemplo)» como plantilla: crea las piezas **sueltas** junto al chasis, no ensambladas, para que el estudiante monte. Un segundo botón «ver montado» solo si el usuario lo aprueba.

## Pruebas

- `qa/verify-robotics-assembly.mjs`: añadir/borrar pieza; unir motor a chasis; mover chasis → motor y rueda conservan transformación relativa (tolerancia 1e-6); borrar motor elimina sus uniones; serializar → parsear → igual (deep equal); dos UNO tienen pines independientes.
- `qa/verify-robotics-build-ui.cjs`: insertar desde catálogo, mover con gizmo, editar coordenada numérica, deshacer/rehacer, guardar, recargar y comparar posiciones.
- Regresión de la etapa 1.

## Aceptación

- [ ] Construir y reabrir un robot de dos ruedas.
- [ ] Mover/rotar piezas libremente; fijar motores al chasis y ruedas a sus ejes.
- [ ] Navegar sin perder selección; deshacer/rehacer.
- [ ] Interferencia detectada sin forzar slots.
- [ ] Mover el chasis preserva las uniones.

**Bloquea si:** piezas se desplazan al guardar, se pierden vínculos o cámara y herramientas entran en conflicto.
