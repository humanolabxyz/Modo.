# Plan de pruebas y aprobación — v1.1

## A. Integridad del modelo

- [ ] Mantener **7 módulos** y los **108 bornes modelados** del prototipo original salvo que haya una corrección demostrable.
- [ ] Ningún ID compuesto `módulo:borne` duplicado o vacío.
- [ ] Todos los terminales interactivos son alcanzables con mouse y teclado; en móvil por toque.
- [ ] Los bornes mantienen color, etiqueta y comportamiento de selección originales.

## B. Fidelidad visual

- [ ] Los **cuatro pilotos** aparecen en orden verde, rojo, ámbar, verde; sus cuatro bornes rojos están justo debajo.
- [ ] Los **tres pulsadores** aparecen verde, rojo, verde; pares rojos 1–2 y crema 3–4 bajo cada botón con orden exacto.
- [ ] N crema y los TP verdes se encuentran en sus posiciones correctas.
- [ ] Contactores diferentes con sus accesorios propios: relé térmico solo donde corresponde.
- [ ] Temporizadores reconocibles y dos módulos físicamente diferenciados.
- [ ] Bornera motor U1,V1,W1 / W2,U2,V2, TP conserva disposición.
- [ ] Etiquetas grandes legibles a zoom 100% y bornes legibles al acercarse.
- [ ] Se conserva la apariencia premium, blanca/negra, sobria del prototipo aprobado.

## C. Usabilidad

- [ ] Seleccionar A1 en dos módulos distintos muestra IDs completos diferentes.
- [ ] Buscar `95`, `A1`, `13` y `S2:3` arroja los bornes adecuados.
- [ ] Zoom +/−/ajustar y arrastrar el fondo no borran selecciones ni desalinean etiquetas.
- [ ] Inspector muestra nota 'por confirmar' donde aplique, sin afirmar NA/NC como hecho comprobado.
- [ ] Pantalla móvil usable sin controles tapados; scroll/paneo distinguibles.

## D. Cable banana visual

- [ ] Componente visual de cable verde petróleo, grosor perceptible, cabeza cilíndrica/banana redondeada, curva de caída.
- [ ] No se muestran cables en el panel vacío, salvo que el usuario active una demo visual separada.
- [ ] Una demo de cables no pretende que el montaje sea eléctricamente válido.
- [ ] Preparación explícita para puentes y múltiples extremos compartiendo un nodo, sin límite arbitrario.

## E. Verificación técnica

- [ ] `npm install` finaliza sin error.
- [ ] `npm run check` finaliza sin errores.
- [ ] `npm run build` finaliza sin errores.
- [ ] Capturas de escritorio y móvil guardadas y comparadas con prototipo y fotos.
- [ ] Codex documenta cambios exactos, pruebas y pendientes.

## Estado antes de que Codex trabaje

La primera fase y el HTML autónomo existen, pero **la v1.1 aún no está implementada**. En este entorno no fue posible instalar `@astrojs/react` vía npm offline por no estar el paquete en caché; la compilación Astro deberá probarse en el equipo donde se ejecute Codex.
