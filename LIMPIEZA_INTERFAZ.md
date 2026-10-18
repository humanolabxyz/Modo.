# Interfaz simplificada — 14 de octubre de 2026

El banco es la vista principal. Las herramientas aparecen según la acción elegida, conservando el cableado, los 108 bornes y la práctica guardada.

| Antes | Ahora |
|---|---|
| Diagrama, panel e inspector abiertos al entrar | Solo el banco. Diagrama opcional e inspector al seleccionar |
| Modo, color, exportación, filtros y visibilidad en varias filas | «Opciones de práctica» agrupa ajustes secundarios |
| Inspector con foto, datos, redes y selectores simultáneos | Número, componente, descripción breve y dos acciones; información y red plegables |
| Color, curva y capas del cable siempre a la vista | Extremos y retiro visibles; «Color y recorrido» desplegable |
| Tres ayudas y explicaciones siempre visibles | Una consigna y «Comprobar»; «Necesito una ayuda» al solicitarla |
| Muestra de cable y avisos repetidos | Se retira la muestra visual del flujo y se reduce el texto repetido |
| Dos selectores y explicación extensa al comenzar | Modo y empezar; diagrama opcional desplegable |

## Acceso

http://127.0.0.1:4322/?revision=interfaz-simple

Al recargar, pulsa «Continuar práctica» para recuperar tus conexiones. No se borró ni migró el guardado local.

- Cablear: «Conectar cables» → origen → destino.
- Inspeccionar: «Inspeccionar» → borne.
- Modificar o retirar un cable: pulsa su curva o abre «Cables» y elígelo.
- Diagrama: «Mostrar diagrama» en escritorio; «Diagrama y pasos» en móvil.
- Modo, exportación, color de nuevos cables y filtros: «Opciones de práctica».

## Archivos

Componentes modificados: `App.tsx`, `Home.tsx`, `SimulatorInspector.tsx`, `WireInspector.tsx`, `StudyGuide.tsx`, `DiagramPane.tsx`; estilos en `src/styles/global.css`. Se adaptaron las pruebas y la captura a la navegación plegable. No se modificó la geometría ni el inventario fotográfico del banco.

## Verificación

- TypeScript y build correctos.
- Inventario: siete módulos, 108 IDs, etiquetas y colores originales.
- Modelo de cables: redes, separación al retirar, extremos independientes y validación de importaciones.
- Práctica: conexión, edición, capas, retiro, deshacer/rehacer, persistencia, importación/exportación, guía manual, nueve retos, imagen propia y toque móvil.
- Interfaz: banco sin columnas iniciales, detalles plegados, fotografía accesible, conexión 95 → 96 y sin desbordamiento en 1920/1440/768/390/360 px.
- Capturas y evidencia: `qa/limpieza/`; comparación anterior en `antes-cableado.png` y `antes-inicio.png`.

Comandos: `npm run check`, `npm run build`, `npm run verify:data`, `npm run verify:wiring`, `npm run verify:practice`, `npm run verify:ui`, `npm run verify:interface`.

El móvil se verificó con Chromium y eventos táctiles emulados. Sigue siendo una práctica virtual sin energía y sin comportamiento eléctrico de componentes. Trabajo local, sin despliegue.
