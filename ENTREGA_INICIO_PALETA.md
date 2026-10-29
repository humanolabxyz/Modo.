# Inicio: paleta mineral y petróleo · 18 de octubre de 2026

Cambio local y limitado a `src/styles/modo-home-refinement.css`. Se conserva la composición abierta Soft UI, los destinos, contenidos, prácticas y el simulador.

Paleta: superficie mineral #e4e8e5, grafito #263b3c, texto secundario #526562, petróleo #285650, líneas #c7d0ca. Se sustituye la división verde/azul/ámbar por una familia cromática común. El botón principal tiene un degradado contenido de #365f59 a #264a46; el resto de controles mantiene relieve mineral. Las fotografías tienen saturación reducida para acompañar el contenido.

Verificación: npm install --ignore-scripts --no-audit --no-fund, npm run check, npm run build y la prueba existente qa/verify-home-refinement.cjs. Se verifican seis anchos (360–1920 px), ausencia de desbordamientos y errores de consola, navegación, controles táctiles y continuidad de una práctica guardada. Los hashes protegidos de simulador, datos y materia siguen intactos.

Capturas y reporte: qa/inicio-paleta/antes-1440.png, despues-1440.png, despues-390.png y verification.json. Revisar las capturas completas de escritorio y móvil. Sin publicación. Vista local en http://127.0.0.1:4344/.
