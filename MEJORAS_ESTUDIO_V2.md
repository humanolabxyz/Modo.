# Refinamiento visual y de interacción del estudio

Se mejoraron las pantallas del módulo existente: las ocho lecciones, prácticas, introducción al simulacro, preguntas, revisión previa, resultados, progreso y la tarjeta de acceso desde el inicio. Se mantiene la UI clara aprobada y la fuente técnica del profesor. Trabajo exclusivamente local, sin publicación.

## Qué cambió

- **Navegación:** entradas separadas para Aprender, Practicar, Evaluarme y Progreso; índice con iconos, nombres breves, búsqueda sin depender de tildes y selección visible. En móvil hay acceso rápido y menú modal buscable. Los menús permanecen accesibles al desplazarse por una lección larga.
- **Recursos visuales:** cuatro imágenes ilustrativas preparadas a partir de las fotos de la PPT: termomagnético, fusibles, SPD/diferencial y motor. Tienen puntos explorables y acceso a la fotografía original. Coordinación, conductores y guardamotor utilizan esquemas SVG específicos: corrientes editables, capas del conductor y dial térmico ficticio sincronizado con el ejercicio. Se puede consultar la lámina original del profesor.
- **Lecciones:** jerarquía y contraste reforzados, recursos completos sin recortar el componente, explicaciones asociadas a cada punto, datos/fórmulas distinguibles y acciones claras.
- **Prácticas:** dos fases, ejercicio interactivo y preguntas del tema. La fase elegida se conserva al recargar. Alternativas con letras, estados de selección, pistas escalonadas y correcciones visibles, manteniendo los cálculos y bancos originales.
- **Simulacro:** introducción visual con el formato 8 + 3, navegación por preguntas con estado respondido/pendiente, revisión previa y resultados con porcentaje real. Las pautas continúan ocultas durante el intento y los desarrollos se revisan manualmente por rúbrica.
- **Progreso:** recorrido y alternativas comprobadas por tema. El repaso pendiente considera el último intento de cada actividad/pregunta; un error resuelto deja de aparecer como pendiente. El historial completo se conserva.
- **Microinteracciones:** respuesta de botones, campos, selección, apertura de detalles, bandas y mensajes de corrección. Los puntos sobre las imágenes conservan su posición al pulsarlos. Los diálogos contienen el foco con Tab/Shift+Tab, se cierran con Escape y utilizan el comportamiento modal del navegador. Las animaciones y transiciones se desactivan con movimiento reducido.

## Fidelidad con la PPT

El PDF y las fotos originales no se alteraron. Las imágenes nuevas se identifican como derivadas e ilustrativas y no aportan valores técnicos oficiales. La coordinación utiliza los bloques de corrientes de la lámina 6; conductores sigue las comprobaciones de la 12; el guardamotor representa placa/rango/ajuste como en la explicación de la 13. Las bandas B/C/D mantienen los rangos del material, sin inventar tiempos. Los ejemplos de motor siguen marcados como supuestos porque la lámina 15 está incompleta.

La [documentación de assets y prompts](ASSETS_ESTUDIO_V2.md) contiene las cuatro rutas finales, las referencias y los prompts usados con `imagegen`. Los WebP consumidos por la web suman aproximadamente 785 kB; cada uno pesa menos de 400 kB y conserva alfa. Los maestros están guardados dentro del proyecto.

## Archivos de esta iteración

Nuevos:

- `src/study/StudyNavigation.tsx` — índice, búsqueda, menú móvil y navegación de secciones.
- `src/study/LessonMedia.tsx` — recursos, puntos explorables, esquemas y consulta de originales.
- `src/study/dialog.ts` — navegación de teclado dentro de diálogos.
- `src/styles/study-polish.css` — refinamiento delimitado al módulo de estudio.
- `public/estudio/assets/*.webp` y `lamina-XX.png`.
- `qa/verify-study-polish.cjs`, `qa/estudio-v2/`, esta entrega y `ASSETS_ESTUDIO_V2.md`.

Modificados:

- `src/study/StudyApp.tsx`, `Practice.tsx`, `ExamView.tsx`.
- `src/pages/estudio.astro` para cargar los estilos del módulo.
- `src/components/Home.tsx` y `src/styles/study-home.css` solo para los recursos y respuesta visual de la tarjeta de estudio.
- `qa/verify-study.cjs` para seguir la navegación en dos fases y distinguir la imagen principal de la referencia ampliada.

No se modificaron los modelos de cálculo, las preguntas, las respuestas, las rúbricas, el esquema de guardado ni las claves del módulo. Tampoco se modificó el service worker en esta iteración.

## Comprobaciones finales

Todas finalizaron correctamente contra el build estático local:

- `npm run check` y `npm run build`.
- `PANELLAB_URL=http://127.0.0.1:4331/ node qa/verify-study.cjs`: ocho actividades, siete cálculos, 32 alternativas, doce desarrollos, rotación de simulacros, correcciones, respuestas y progreso persistentes, archivo corrupto y conservación del guardado del Banco.
- `node qa/verify-study-storage.cjs`: teclado, tacto, exportación/importación, reinicio selectivo, cuota agotada y caché separada de Inicio/Estudio/PDF.
- `node qa/verify-study-polish.cjs`: todos los temas y secciones a 375, 390, 768, 1280 y 1920 px; buscadores, puntos explorables, originales, fases de práctica, menú móvil, foco, Escape, movimiento reducido y contraste de textos principales en siete vistas. Sin errores de navegador detectados.
- `npm run verify:simulation-ui`: regresión del Banco aprobada en siete tamaños, con cableado, arranque/parada, retención, térmico, cortocircuito, persistencia y tacto.

Los hashes de `qa/estudio-v2/baseline-hashes.json` confirman que el código, los diagramas, el cableado, las validaciones, Comparar y los estilos internos del Banco siguen intactos. También confirman que el material original y los datos del estudio no cambiaron.

Evidencia: `qa/estudio-v2/verification.json`, `qa/estudio/verification.json`, `qa/estudio/storage-verification.json`, `qa/simulacion/ui-verification.json`.

## Capturas reales

Las 27 capturas se realizaron en sesiones de QA aisladas; no representan el progreso del usuario. La [galería completa](qa/estudio-v2/GALERIA.md) incluye las ocho lecciones y las demás pantallas.

- [Lección en escritorio](qa/estudio-v2/leccion-desktop.png)
- [Lección en móvil](qa/estudio-v2/leccion-mobile.png)
- [Menú móvil con búsqueda](qa/estudio-v2/menu-mobile.png)
- [Práctica y corrección](qa/estudio-v2/practica-correccion-desktop.png)
- [Introducción al simulacro](qa/estudio-v2/evaluarme-desktop.png)
- [Resultados en escritorio](qa/estudio-v2/resultados-desktop.png)
- [Resultados en móvil](qa/estudio-v2/resultados-mobile.png)
- [Progreso](qa/estudio-v2/progreso-desktop.png)

Se comprobaron navegadores automatizados y emulación táctil, no teléfonos físicos. No se detectaron defectos funcionales pendientes en los flujos comprobados. El progreso previo se conserva en el mismo origen local y puede exportarse/importarse como antes.
