# Comunidad · reconocimiento a Matías

Actualización local del 16 de octubre de 2026.

## Alcance confirmado

Página independiente `/comunidad/`, accesible mediante la nueva tarjeta **Comunidad** del inicio. El reconocimiento es para **Matías**, por armar el panel con sus cables y compartir ese montaje, que sirvió de base para mejorar el modo de lección y guiar las conexiones paso a paso. Este es el aporte aclarado por el usuario; no se le atribuye la implementación técnica del sistema.

El usuario aplazó las encuestas y los comentarios de mejora. No se conectó Supabase, no se añadieron cuentas, formularios ni funciones de votación. No hubo despliegue.

## Implementación

- `src/data/community.ts`: nombres y aportes confirmados; actualmente solo Matías. Para añadir reconocimientos se extiende esta lista, sin inventar fotografías, apellidos ni funciones.
- `src/pages/comunidad.astro` y `src/styles/community.css`: página estática con el estilo y los recursos de marca existentes, reconocimiento y enlaces al inicio/panel/créditos.
- `src/components/CommunityCard.tsx` y `src/styles/community-card.css`: acceso desde el inicio, debajo de los módulos principales y antes de la práctica reciente.
- `src/components/Home.tsx`: inserción de la tarjeta sin cambiar formularios ni comportamiento de los módulos existentes.
- `src/components/motion/MotionHead.astro`, `public/sw.js` y `astro.config.mjs`: navegación y registro de la nueva ruta en el precache de la PWA.

La inicial M es un monograma, no una fotografía de Matías. Las encuestas y otras ampliaciones no aparecen como funciones disponibles.

## Validación

- `npm run check`: correcto.
- `npm run build`: correcto, cinco rutas estáticas incluida `/comunidad/`.
- Comprobación del build: enlace desde Inicio, contenido de Matías, CSP en la página y ruta `/comunidad/` en el precache; service worker sin marcadores pendientes.
- Navegador: Inicio → Comunidad → Inicio → Comunidad; accesos existentes al panel, estudio y laboratorio conservados. Vista de escritorio y móvil emulado de aproximadamente 390 px, sin desbordamiento horizontal al terminar la animación de entrada.
- Capturas: `qa/community/`. No se probó un teléfono físico ni la navegación offline real de la nueva página.
