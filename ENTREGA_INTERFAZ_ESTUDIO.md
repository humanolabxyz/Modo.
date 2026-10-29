# Acabado de la interfaz de Estudio

Revisión local sobre el recorrido de aprendizaje aprobado. Entrada: http://127.0.0.1:4342/estudio .

## Cambios visibles

- Portada compuesta en grafito y fondo neutro, con acceso directo al catálogo, ilustración y recorrido de tres momentos. Se retiraron degradados, fondos pastel y la asignación de un color por ramo por indicación del usuario.
- Tarjetas de ramos con portada más compacta, jerarquía tipográfica, categorías, disponibilidad y estados de interacción consistentes. Blanco y gris para las superficies; verde modo. reservado a acciones, foco y selección.
- Cabecera de clase más compacta. Se corrigió el margen heredado del botón de regreso que añadía espacio al breadcrumb.
- Índice lateral en una superficie propia, paso activo con borde y fondo; índice desplegable en pantallas pequeñas. Pestañas de modo con iconos y secuencia de aprendizaje con estados visibles.
- Lectura en una superficie unificada: introducción, esquema, explicación, tarjetas de conceptos, recordatorio y enlaces al original. Bordes y radios más contenidos; ilustraciones decorativas en escala de grises.
- Preguntas, selección de respuesta, campos, tablas, cuaderno y desafíos con bordes, tamaños y estados coherentes.
- Foco de teclado visible, controles táctiles, adaptación responsive y respeto por la preferencia de movimiento reducido.
- Precarga de Inter Variable en lugar de las dos fuentes anteriores que ya no corresponden a la interfaz de Estudio.

## Archivos de esta revisión

- `src/styles/study-interface.css`: acabado visual acotado a `.study-shell.study-campus-shell`; no aplica al panel ni al laboratorio.
- `src/pages/estudio.astro`: importa el acabado de la interfaz y precarga la tipografía utilizada.
- `src/study/StudyHub.tsx`: acceso «Explorar mis ramos» al catálogo existente.
- `src/study/AcademicLessonView.tsx`: iconos de los cuatro modos. Se conserva el comportamiento de estudio.
- `qa/verify-study-interface.cjs`: comparación, dimensiones, navegación, controles y preservación.

No hay cambios de dependencias. Materia, ejemplos, modelos, formato de progreso y archivos principales del panel/laboratorio se comparan mediante `qa/estudio-diseno/before-hashes.json`.

## Validación

```powershell
npm install --ignore-scripts
npm run check
npm run build
node qa/verify-study-interface.cjs
npm run verify:academic
npm run verify:study-teaching
node qa/verify-academic-integration.cjs
```

Las suites de navegador se ejecutan en secuencia contra el build de `http://127.0.0.1:4342`. Los resultados están en `qa/estudio-diseno/verification.json`, `qa/estudio-visual/teaching.json`, `qa/estudio-ampliacion/models.json` e `integration.json`.

Resultado: TypeScript y build correctos; 6 comprobaciones de interfaz, 13 grupos de modelos/preservación, 10 comprobaciones docentes y 4 de integración aprobados. Las tres suites de navegador registran cero errores. Se comprobaron selección por teclado, controles táctiles emulados, cuaderno y tabla en móvil, desafío, taller, accesos anteriores, Protecciones y uso sin conexión de una clase y su PDF consultado.

Comparativas de esta revisión:

- `qa/estudio-diseno/antes-inicio.png` / `despues-inicio.png`.
- `qa/estudio-diseno/antes-clase.png` / `despues-clase.png`.
- `qa/estudio-diseno/antes-clase-390.png` / `despues-clase-390.png`.

La misma carpeta contiene capturas de ramo, ejemplo, práctica, electrónica, temperatura, códigos, cuaderno, desafío y taller. Se verifican escritorio a 1440 px y anchos de 390, 768 y 1280 px; tacto emulado en Chromium. La revisión en un teléfono físico y la aprobación visual del usuario siguen fuera de estas pruebas técnicas.

Los pendientes docentes y de material conservan su alcance en `ENTREGA_ESTUDIO_VISUAL.md` y `ENTREGA_ESTUDIO_AMPLIACION.md`.
