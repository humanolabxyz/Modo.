# Videos tutoriales en modo. — 16 de octubre de 2026

Se integraron los cuatro MP4 más recientes de `video-tutorial/out`: Práctica 1 y 2, Laboratorio 1 y 2 (v3, voz D2). Las copias públicas son idénticas a los originales, comprobadas con SHA-256. No se incorporó el tutorial antiguo de Estudio: el README del material indica que su contenido sigue en revisión.

## Recorrido

- Primera visita: sugerencia «¿Primera vez en modo.?», con «Ver tutoriales», «Ahora no» y cierre. No bloquea el trabajo ni reproduce audio automáticamente.
- La sugerencia se recuerda por navegador/origen con `modo-tutoriales-bienvenida-v1`. Al incorporar esta función también la verán una vez quienes ya usaban la app pero aún no tienen esa marca. Sin almacenamiento disponible se recuerda durante la página actual.
- Acceso permanente «Videos tutoriales» en Inicio, Práctica de escritorio, Laboratorio y Estudio. En Práctica móvil: Opciones de práctica (⋯) → Tutoriales.
- En Laboratorio se selecciona primero Laboratorio · Parte 1. Los cuatro videos siguen disponibles desde cualquier sección.
- Reproductor nativo con pausa, búsqueda temporal, volumen y pantalla completa; lista de videos y siguiente tutorial. Al cambiar o cerrar se pausa el video anterior. Escape cierra la ayuda y el foco vuelve al botón que la abre.
- Los videos conservan su voz y subtítulos incrustados. No se descargan al cargar Inicio ni se incluyen en la precarga offline. El service worker deja pasar los MP4 directamente para respetar las solicitudes HTTP Range. La reproducción offline no se garantiza.

## Archivos

- `src/components/TutorialHelp.tsx`: sugerencia, diálogo y reproductor compartido.
- `src/data/tutorials.ts`: catálogo y rutas de archivos.
- `src/styles/tutorials.css`: estilos de escritorio y móvil.
- `src/components/App.tsx`, `src/lab/LaboratoryApp.tsx`, `src/study/StudyApp.tsx`: accesos a la ayuda; sin cambios en lógica de circuitos o aprendizaje.
- `public/tutoriales/`: cuatro MP4 y cuatro miniaturas WebP extraídas de los mismos videos.
- `public/sw.js`: entrega directa de videos por rangos.
- `qa/tutoriales/respaldo/`: copias previas de los tres componentes existentes modificados.

## Validación

- `npm install --no-audit --no-fund`: correcto.
- `npm run check`: correcto.
- `npm run build`: correcto; cuatro rutas generadas.
- `npm run verify:data` y `npm run verify:wiring`: correctos, modelo y cableado existentes conservados.
- Build local servido en `http://127.0.0.1:4326/`. Sin despliegue ni cambios remotos.
- Navegador: primera sugerencia, omisión, persistencia después de recargar, reapertura manual, cuatro selecciones, siguiente video y reproducción manual de los cuatro MP4. Evidencia de playback en `reproduccion.json`.
- Cada video cargó H.264/AAC a 1920×1080; duraciones reales 84.30, 95.48, 111.20 y 87.08 segundos. Respuestas 206 y rangos válidos en `media-checks.json`.
- Cierre mediante botón y Escape, devolución de foco, eliminación del reproductor y bloqueo de atajos del banco mientras el diálogo está abierto. Tab desde el último video vuelve al cierre; Shift+Tab desde el cierre vuelve al último video.
- Acceso en Práctica móvil, Laboratorio y Estudio; apertura contextual de Laboratorio correcta. Sin errores o advertencias en una pestaña limpia del build final.
- El servidor de desarrollo tuvo un error temporal de importación durante la recompilación; no se reprodujo en la sesión limpia del build final.
- Comprobación responsive en 1440×1000, 390×844, 360×780, 768×1024 y 844×390. Inicio, Laboratorio y Estudio caben sin desborde en las nueve combinaciones de los tres últimos tamaños (`responsive.json`). Se ajustaron las cabeceras pequeñas y en Inicio el acceso a videos sustituye al icono de ayuda textual; la guía textual permanece en Práctica. No se probó en teléfonos físicos ni se visualizaron los cuatro videos completos de principio a fin.

## Capturas comparativas

Antes, escritorio:

![Antes escritorio](antes-escritorio.png)

Después, escritorio:

![Tutoriales escritorio](tutoriales-escritorio.png)

Antes, móvil:

![Antes móvil](antes-movil.png)

Bienvenida, móvil:

![Bienvenida móvil](bienvenida-movil.png)

Reproductor, móvil:

![Tutoriales móvil](tutoriales-movil.png)
