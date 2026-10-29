# PanelLab 2.2.4

Publicación: https://modo-lab.vercel.app/ . Incluye todos los cambios y verificaciones de ENTREGA_2.2.3.md.

## Corrección adicional solicitada
El multímetro del panel se podía mover solamente desde una franja superior de unos 18 px en móvil. Ahora se arrastra también desde la carcasa o pantalla, igual que el instrumento de protoboard. Sus funciones, botones y puntas mantienen sus gestos independientes. Las puntas conectadas permanecen en coordenadas de los bornes durante el arrastre.

El arrastre conserva el punto de agarre, captura el puntero, agrupa actualizaciones por requestAnimationFrame y limpia el fotograma al desmontar. La lectura eléctrica se memoriza con las entradas del circuito e instrumento para no recalcularla por cada posición. También se mueve con flechas desde el asa accesible.

## Archivos
src/components/PanelMultimeter.tsx; src/styles/manual-bench.css; src/data/releases.ts; package.json y package-lock.json. Se preservan los cambios anteriores del proyecto.

## Verificación
- npm run check y npm run build correctos.
- qa/verify-panel-drag-2.2.4.cjs: Chromium y WebKit a 393 y 820 px. Arrastre de -60/+45 px desde pantalla, puntas sobre bornes a menos de 1 px, lectura 0,4 Ω conservada, selector ampliado tras arrastrar, flechas de 20 px y cero cables añadidos. Chromium usa secuencias táctiles reales del protocolo de emulación; WebKit usa mouse para el arrastre y toque para controles.
- qa/verify-mobile-lab-2.2.2.cjs: herramientas por toque/arrastre, desplazamiento de soldadura sobre mesa libre y desde objetos con Mover, puntas manuales de ambos bancos, alineación de cables y libretas en primer plano.
- qa/verify-webkit-mobile-fix.cjs: instrumentación SVG, bornes y libreta sin foreignObject.
- Capturas comparables bajo qa/panel-drag-2.2.4/ y qa/mobile-lab-2.2.2/ .

Pruebas de navegador emulado; no equivalen a validación en un iPhone o tablet físicos. El simulador conserva sus límites educativos.

## Publicación confirmada
Deployment dpl_AHFoF2EwFnSUvEm5ZAEDpp4375Ra en estado READY; alias público modo-lab.vercel.app. Se ejecutaron sobre el alias las pruebas de arrastre en cuatro combinaciones de navegador/tamaño, selección ampliada, smoke de versión y flujo táctil de herramientas/puntas/libretas, sin errores de página.
