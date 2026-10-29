# Inicio con Soft UI — 18 de octubre de 2026

Se retiró del inicio el aviso de la prueba del lunes 19. El aviso y el repaso de la Unidad 2 permanecen dentro de Estudio.

La portada usa Soft UI/neumorfismo: un fondo gris continuo, secciones abiertas sin tarjetas blancas, sombras claras y oscuras en los controles, campos hundidos y botones con relieve. La tipografía mantiene contraste para leer la materia y reconocer las acciones.

Se conservan los tres espacios y sus funciones. La cabecera incorpora accesos a Estudio, Panel de control y Laboratorio. Los acentos usan verde petróleo en el panel y sus acciones, azul en Estudio y ámbar en Laboratorio. Las fotografías recuperan color de forma contenida y difuminada en escritorio; en móvil se priorizan los textos y controles. Los ocho accesos al laboratorio usan iconos circulares, sin cajas individuales.

La práctica aparece antes de Comunidad. Si no hay trabajo guardado, se presenta «Empieza a practicar», sin inventar una última sesión. Si existe una práctica, se presenta «Tu práctica actual» y se conserva al continuar.

## Archivos

- `src/components/Home.tsx`: retirada del aviso, accesos y estados de la práctica, orden de secciones.
- `src/styles/modo-home-refinement.css`: ajustes limitados al inicio.
- `src/lab/HomeTools.tsx`: texto y rótulo de la tarjeta de laboratorio; mismos ocho destinos.
- `qa/verify-home-refinement.cjs`: seis grupos de verificación, capturas y preservación de documentos.
- `qa/verify-unit2.cjs`: comprueba que el aviso no esté en Inicio y siga accesible desde Estudio.

## Verificación

- `npm run check` y `npm run build` correctos.
- `node qa/verify-home-refinement.cjs`: capturas a 360, 390, 768, 1024, 1440 y 1920 px; sin desbordamientos ni errores de consola. Controles de al menos 44 px, cuatro modos del panel, ocho herramientas, navegación y regreso al inicio.
- Práctica guardada con cable: al continuar no se reemplaza el documento.
- `npm run verify:unit2`: originales, diez preguntas, persistencia, versión incompatible y consulta sin conexión correctos; aviso solo dentro de Estudio.
- Hashes de `App.tsx`, `Board.tsx`, panel, prácticas, cableado y contenidos de estudio intactos respecto al comienzo de esta mejora.

Comparación local: `qa/inicio-mejora/antes-1440.png`, `antes-390.png` y `despues-*.png`. Pruebas y capturas del sitio publicado: `qa/inicio-mejora/produccion/`.

Sitio: https://modo-lab.vercel.app/
Despliegue de producción READY: dpl_GRKPCD5syxWZwPbjRPX6q3HLt8tn

