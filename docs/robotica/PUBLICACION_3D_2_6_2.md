# Publicación 2.6.2 · Robótica 3D y menú visual

29 de octubre de 2026. El usuario pidió expresamente publicar esta mejora, autorizando el despliegue sobre el proyecto vinculado `modo-lab` pese a la instrucción local original de AGENTS.md.

## Incluido

- Modelos de componentes detallados, conectores coincidentes con los pines del circuito, serigrafía, bornes, tornillos y materiales.
- Protoboard de 400 puntos con grupos, rieles y canal separados eléctricamente; interruptor, regulador de 5 V, IR y soporte. Las cuatro plantillas usan conexiones y firmware real del simulador AVR.
- Rover 4WD aprobado: 18 piezas, 41 cables, 4 motores, 4 ruedas y 2 drivers. Incluye alimentación por protoboard y programa para evitar obstáculos.
- Menú de 17 piezas con imágenes WebP de 320×240, renderizadas de los propios modelos; reemplaza los cuadros de color. Una imagen estática por pieza, carga diferida y sin un contexto WebGL adicional por tarjeta. Búsqueda, categorías, arrastre y agregar se conservan.
- Tarjetas con miniatura, texto legible, botón + accesible por su nombre y descripciones compactas, tanto en escritorio como en móvil.
- Selector con cuatro plantillas: dos ruedas, seguidor de línea, explorador con luces y rover 4WD. Los borradores de dos pisos y minisumo no se ofrecen en la publicación. Los proyectos guardados siguen siendo compatibles.

## Pendientes elegidos por el usuario

Robots de reparto y estacionamiento, además de brazos robóticos. No se presentan como implementados. Los montajes de varios pisos fueron rechazados por su estética.

## Archivos

Modelos y pines: `src/robotics/build/PartMesh.tsx`, `catalog/index.ts`. Circuito, sensores y plantillas: `circuit/`, `sim/`, `project/templates.ts`. Menú: `windows/BuildWindows.tsx`, `src/styles/robotics.css`. Miniaturas: `public/robotics/components/`, `build/renderThumbnail.ts` (exportación de depuración), `qa/render-robotics-thumbnails.cjs`. Pruebas y capturas: `qa/robotics-menu/`, `qa/robotics-assemblies/`, `qa/robotics-kit/`. Versión y novedades: `src/data/releases.ts`, `package.json`, `package-lock.json`.

## Validación y límites

TypeScript y build Astro; circuito, montaje, MCU y física; pruebas de selección, ejecución, consola, guardado/recarga y encuadre del rover y los tres ejemplos existentes. El menú comprueba las 17 imágenes, hashes, búsqueda, categorías y agregar en 1440×900 y 390×844 con tacto emulado. Se conserva el comportamiento offline comprobado en el simulador.

Las capturas son de la aplicación real. La emulación móvil no sustituye la comprobación en teléfonos físicos. La física y los modelos son didácticos y no constituyen una validación del robot físico.

La dirección pública, estado final del despliegue y verificación remota se añaden al finalizar la publicación.

## Estado final del despliegue

Publicada el 29 de octubre de 2026 por CLI (`vercel deploy --prod`) en producción: https://modo-lab.vercel.app (proyecto `modo-lab`). Despliegue `modo-o99yibebg-humanolabxyz-9765s-projects.vercel.app`, estado Ready. Se publicó la carpeta de trabajo de la rama `robotica/etapa-1`, sin commit ni push.

Antes de publicar: `npm run check`, `npm run build` (8 páginas) y siete pruebas de robótica (assemblies, kit, breadboard, project, circuit, physics, template) correctas.

Verificado en público: inicio 200, `/robotica/` sin clave 401, `/versiones/` 200 y lista 2.6.2, `sw.js` 200, miniaturas WebP 200.

No verificado: `/robotica/` con clave (contraseña no leída), pruebas de interfaz con navegador contra producción, teléfonos reales.
