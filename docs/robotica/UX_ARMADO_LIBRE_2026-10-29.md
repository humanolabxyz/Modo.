# Robótica: construcción libre y ayuda visual de armado

Implementación local del 29 de octubre de 2026. Se conserva la identidad visual, el catálogo, las figuras 3D, los proyectos y el modelo existente de anclajes, circuitos y simulación.

## Uso

1. En Robótica, pulsa **Armar con guía visual** en el proyecto vacío, o **Guía** junto a los modos de cámara.
2. Elige una de las cuatro referencias disponibles. **Construcción libre** quita la referencia sin borrar piezas ni uniones.
3. La referencia muestra las mismas geometrías de los componentes: azul intenso para la siguiente pieza y azul tenue para las pendientes. Los fantasmas no interceptan la selección de piezas reales.
4. **Colocar base** inicia el armado. **Tomar pieza** agrega el siguiente componente cerca de su destino, con su orientación de referencia; si existe una pieza suelta del mismo tipo, la selecciona para reutilizarla. Mueve las flechas del gizmo hasta acercarla a su figura y suelta.
5. El encaje de referencia admite una distancia menor de 25 mm al centro previsto y aplica orientación y anclajes del modelo. El encaje libre usa los anclajes compatibles existentes a 15 mm. Si dos candidatos tienen distancias que difieren en menos de 3 mm, exige elegir el destino. La opción **Encajar al soltar** permite desactivarlo. Las coordenadas numéricas no disparan el encaje entre campos.
6. Seleccionar una pieza unida muestra su nombre, el de su padre y **Mantén para soltar**. Mantener 700 ms separa esa unión; un toque corto, salir del botón o Escape cancela. También funciona manteniendo Espacio o Enter. Deshacer restaura la unión. La separación conserva las posiciones y los cables; las piezas hijas acompañan a su padre cuando lo mueves después.
7. Mantener sobre figuras superpuestas abre una lista de nombres. Selecciona un nombre para resaltar la pieza exacta antes de soltarla. Estructura conserva su acceso alternativo a las piezas y sus acciones explícitas.
8. La píldora superior **Órbita / 1.ª persona** reemplaza el botón de cámara del dock. Conserva C, WASD, Q/E, Mayús y los controles de mirada existentes.

## Aprendizaje y persistencia

- La guía cuenta el montaje mecánico, no valida el cableado ni la programación. Al terminar lo explica expresamente. No agrega cables ni firmware.
- La referencia elegida se guarda por proyecto y se conserva al exportar/importar. Las coincidencias se calculan por componente, posición, orientación y unión al padre correcto; no dependen del nombre editable de la pieza.
- La referencia sigue al primer chasis al mover o girar el conjunto. Es una ayuda opcional para estas referencias de armado, no un sistema que infiera cualquier diseño personalizado.
- Las piezas unidas se protegen frente a movimientos independientes desde el gizmo y las coordenadas. El chasis puede mover su conjunto. Esta protección pertenece a la interfaz; los comandos puros mantienen su compatibilidad anterior.
- En móvil la tarjeta de ayuda ocupa la parte inferior y admite desplazamiento para leer más. Se puede cerrar para ampliar el espacio de trabajo. Durante la simulación o en primera persona se ocultan los fantasmas de armado.

## Archivos de esta actualización

- `src/robotics/RoboticsApp.tsx`: controles de cámara, guía, selección de anclajes y separación por nombre.
- `src/robotics/build/assemblyGuide.ts`: coincidencias y encaje, sin dependencias de interfaz.
- `src/robotics/build/HoldToRelease.tsx`: pulsación mantenida cancelable.
- `src/robotics/build/BuildCanvas.tsx`: figuras de referencia y detección de piezas superpuestas.
- `src/robotics/build/PartMesh.tsx`: material fantasma sobre los modelos existentes.
- `src/robotics/project/types.ts` y `validate.ts`: referencia opcional por proyecto.
- `src/styles/robotics.css`: píldora y tarjetas adaptadas a escritorio y móvil.
- `qa/verify-robotics-learning.mjs`, `qa/verify-robotics-learning-ui.cjs` y selector actualizado en `qa/verify-robotics-fly-ui.cjs`.
- `package.json`: comandos de las dos pruebas nuevas.

## Validación

Instalación de dependencias, TypeScript y compilación Astro. Pruebas de ensamblaje, proyecto, interacción, plantilla con física, cuatro recorridos completos de referencia, piezas lejanas, bloqueo, separación y anclajes ambiguos.

Pruebas Playwright a 1440 × 900, 1024 × 768 y 390 × 844: inserción guiada, arrastre real del gizmo con encaje, separación cancelable, eventos táctiles emulados, teclado, Deshacer, selección de referencia, recarga y cámara. La regresión de primera persona comprueba movimiento, altura, mirada, campos de texto, atajos y salida.

Capturas nuevas e informe: `qa/robotics-learning/`. Comparativas anteriores: `qa/robotics/ux-before-desktop.png` y `qa/robotics/ux-before-mobile.png`.

No se ha probado en teléfono ni tablet físicos. No se ha desplegado. La instalación informa cuatro vulnerabilidades de severidad alta y Vite advierte de paquetes mayores de 500 kB; esta actualización no cambia versiones de dependencias ni corrige esos avisos.
