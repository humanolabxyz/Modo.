# Ajuste visual y bienvenida de Robótica · 29 de octubre de 2026

Actualización local sobre el módulo existente.

- Inicio: tarjeta con dos opciones principales alineadas, Crear libremente y Armar con guía visual; accesos secundarios a robot de ejemplo y proyectos.
- Acento azul propio de Robótica en controles, ventanas, selecciones, progreso y figuras de referencia. Mayor opacidad en los fantasmas para reconocer sus formas.
- Chasis y placa Arduino con tonos azules más visibles; regulador con placa azul. Se mantienen geometría y comportamiento de los componentes.
- Editor Arduino negro, números de línea y línea activa oscuros, selección azul y sintaxis C++ preparada para fondo oscuro. Se declaran directamente las dos bibliotecas de resaltado ya instaladas.
- Crear libremente descarta la bienvenida por proyecto, incluso con cero piezas. Se conserva al recargar, cerrar Piezas o regresar desde la guía. Abrir el catálogo o empezar a colocar piezas también descarta la bienvenida. Un proyecto nuevo conserva su bienvenida inicial.

## Archivos

`src/robotics/RoboticsApp.tsx`, `src/styles/robotics.css`, `src/robotics/windows/CodeEditor.tsx`, `src/robotics/build/PartMesh.tsx`, `src/robotics/build/BuildCanvas.tsx`, `src/robotics/project/types.ts`, `src/robotics/project/validate.ts`, `package.json` y `package-lock.json`. Se ajustó también la descripción de colores en el documento anterior de armado.

## Verificación

- Instalación, TypeScript y compilación Astro completados.
- Pruebas existentes de proyecto y ayuda de armado completadas.
- Revisión Playwright de inicio y editor en 1440 × 900 y 390 × 844; inicio en horizontal a 844 × 390. Se comprobó la separación de botones, colores calculados del editor, edición y guardado del programa, sin errores de página.
- Prueba de bienvenida con cero piezas en escritorio y móvil: elegir libre, cerrar catálogo, recargar y pasar de guía a libre sin que vuelva la tarjeta.
- Capturas después: `qa/robotics-blue/desktop-start.png`, `mobile-start.png`, `desktop-code.png`, `mobile-code.png`, `desktop-guide.png`, `mobile-guide.png` y `landscape-start.png`.
- Antes: capturas entregadas por el usuario y `qa/robotics/ux-before-desktop.png` / `ux-before-mobile.png` de la intervención anterior.

La revisión móvil es emulada; no hubo prueba en dispositivos físicos ni despliegue. Se mantienen los avisos de dependencias y tamaño de paquetes registrados anteriormente.
