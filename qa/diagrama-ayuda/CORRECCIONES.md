# Correcciones antes de publicar — 16 de octubre de 2026

La publicación continúa detenida por pedido del usuario. No se ejecutó ningún despliegue.

## Diccionario

Las miniaturas medían su geometría antes de abrir el diálogo nativo. Ahora vuelven a medirla en el siguiente fotograma, cuando el dibujo está visible. Se comprobaron las 16 miniaturas del esquema Estrella-triángulo: todas tienen un encuadre válido.

La regla que asignaba 80 px a cualquier SVG de una tarjeta también agrandaba la mira. Ahora solo dimensiona la miniatura; la mira de «Ver en el esquema» mide 16 × 16 px. La vista móvil usa miniaturas de 64 px, sin desborde. El botón selecciona el componente correspondiente y cierra el diccionario.

Archivos: `src/components/CadeHelp.tsx`, `src/styles/cade-help.css`.

## Intro y movimiento

- La intro utiliza únicamente las dos piezas originales del rayo. Entran desde lados opuestos, encajan con un pequeño impacto y se retira el fondo. Se eliminaron letras, revelado de tarjetas y vuelo hacia la cabecera.
- Se reproduce en una nueva apertura directa y al recargar. Navegar entre módulos, volver por el historial o reactivar una página ya abierta no la reinicia.
- Una apertura en segundo plano espera a que la página se vea por primera vez. Si se oculta durante la intro, se da por terminada y no vuelve al regresar.
- Los módulos de Laboratorio y las secciones de Estudio usan una entrada de opacidad de 340 ms. El módulo solicitado se carga antes del cambio, para que la animación corresponda al contenido. Los clics rápidos conservan la última solicitud y no modifican proyectos ni circuitos.
- Se añadió alternativa para páginas y paneles cuando View Transitions no está disponible. El movimiento reducido sigue funcionando; `?movimiento=completo`, `?movimiento=reducido` y `?movimiento=sistema` permiten elegir y recordar la preferencia en ese navegador.

Archivos: `src/components/motion/MotionHead.astro`, `src/components/motion/ModoSplash.astro`, `src/styles/modo-motion.css`, `src/motion/surface.ts`, `src/motion/transition.ts`, `src/lab/LaboratoryApp.tsx`.

## Evidencia

- `npm run check` y `npm run build`: correctos.
- `npm run verify:lab`: 38/38 pruebas correctas.
- `npm run verify:estrella`: 29 redes, 26 símbolos y 82 conductores correctos; PERFECTO conserva sus 47 conductores.
- `node qa/verify-motion-lifecycle.mjs`: 8 grupos de comprobaciones correctos. Incluyen nueva apertura, recarga, navegación interna, historial, inicio oculto, tres ciclos de reposo, preferencias y almacenamiento bloqueado. Son pruebas del ciclo de vida simulado; no se suspendió físicamente el equipo.
- Navegador local con build servido en el puerto 4326: miniaturas y mira corregidas en escritorio y móvil, selección del símbolo y ausencia de errores/advertencias de la app.
- Captura de la intro real: dos rutas SVG, desplazamientos opuestos que llegan a cero; datos en `intro-frames.json` y fotogramas en `intro-frames/`.
- Captura del cambio real HMI → Procesos: opacidad 0,12 → 0,45 → 0,69 → 0,82 → 0,90 → 0,95 → 0,98 → 1; la animación termina y limpia su estado. Datos en `module-frames.json` y fotogramas en `module-frames/`.
- La revisión de los ocho pasos del recorrido Estrella-triángulo de la ronda anterior aún no se ha cerrado; esta entrega resuelve los detalles de símbolos e intro/transiciones solicitados después.

Respaldos anteriores a esta corrección en `respaldo-animaciones/`.

![Diccionario corregido](diccionario-corregido.png)

![Diccionario móvil](diccionario-movil-corregido.png)
