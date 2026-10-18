# Diagrama estrella-triángulo (cambio delta-estrella)

Transcripción fiel, a partir de una fotografía de la pantalla, del archivo `CAMBIO DELTA, ESTRELLA.cad` de CADe_SIMU. Se abre desde el panel Diagrama de dos maneras: con el selector **PERFECTO · Estrella-triángulo** de la parte superior, o con la entrada **Estrella-triángulo · CADe** de «Material y otras opciones».

## Qué contiene

- **Potencia:** bornes `-X` (L1, L2, L3, PE), guardamotor `Q1` (caja con cruz, polos y bloque térmico `I>`), contactor `KM1`, relé térmico `F1` (tres elementos), motor `M1` (U1 V1 W1 / W2 U2 V2 y PE), contactores `KM2` (triángulo) y `KM3` (estrella, con el puente superior) y los tres buses que llevan KM2 y KM3 a W2, U2 y V2.
- **Mando:** bornes `L` y `N`, guardamotor `-Q` de un polo, `F1` 95-96 y 97-98 con su actuador, `SB1` (NC), `SB2` (NO) con la retención `KM1` 13-14, el pulsador doble `-S` (11-12 y 13-14), contactos `KM2` y `KM3` (enclavamiento), bobinas `KM1`, `KM3` y `KM2`, y las lámparas `H1` a `H4`.
- **Marco** de la hoja con columnas A–H y filas numeradas.
- 26 símbolos, 82 conductores y 18 puntos de unión. Las fases del mando van en rojo y el retorno en azul, como en la foto; la potencia, en gris oscuro; el PE, discontinuo.

## Cómo se hizo

1. Se corrigió la inclinación de la foto: afín para la potencia y proyectiva para el mando (su perspectiva es mayor).
2. Se superpuso una cuadrícula en unidades CADe y se leyeron las coordenadas de cada símbolo y de cada vértice de conductor.
3. Los símbolos se dibujaron con las proporciones medidas (`src/components/CadeSheet.tsx`).
4. Se comprobó superponiendo el dibujo a la foto rectificada (cian: solo en la foto; rojo: solo en el dibujo): las líneas coinciden salvo diferencias de un par de píxeles. Las imágenes están en `qa/estrella-triangulo/` (`rect-*.png`, `ov-*.png`).

Los datos se generan con `node scripts/build-estrella-triangulo.mjs` → `src/data/cadeEstrellaTriangulo.json`.

## Verificación de fidelidad (1:1)

- **Símbolo por símbolo:** cada símbolo se comparó ampliado con la foto rectificada (`qa/estrella-triangulo/cmp-*.png`: foto | dibujo | superposición) y se corrigió hasta que forma, proporciones, marcas y rótulos coinciden: polos con su marca de accionamiento, caja con cruz y bloque `I>` del guardamotor, tres «⊐» del relé térmico, actuador «E» de los pulsadores, contacto doble `-S`, bobinas, lámparas y motor con PE.
- **Conjunto:** la superposición del mando completo (`ov-final-mando.png`) es prácticamente idéntica a la foto; solo se ven diferencias en los bordes borrosos del texto.
- **Cableado:** `npm run verify:estrella` comprueba 29 redes de conductores, 26 símbolos con sus rótulos y que todo borne cae sobre un conductor.
- **Límite de la medida:** una foto inclinada no permite fidelidad de píxel. En la potencia, las líneas de KM2 y KM3 se inclinan en la foto por la perspectiva y se dibujaron verticales. Las herramientas para repetir la comparación son `render-compare.cjs`, `compare.py` y `crops.json` (en `qa/estrella-triangulo/`).

## Por confirmar contra el archivo original

- El rótulo inferior del contacto `KM2` de la barra de mando se lee **«12»** en la foto, donde un contacto NO llevaría «14». Se dibujó como se lee.
- El orden con que `KM2` se une a los bornes del motor: tal como está dibujado, L1 → V2, L2 → U2 y L3 → W2. En un triángulo habitual serían L1 → W2, L2 → U2 y L3 → V2. Puede ser un error de lectura o del dibujo original.
- La parte inferior del marco (más allá de la barra de neutro) no se ve en la foto; se completó con 4 filas.
- Las coordenadas son medidas sobre una foto inclinada: pueden diferir en 1–2 unidades de las del archivo original.
- La lámpara del lado derecho de la bobina `KM2` se lee `H3`.

## Qué no tiene (todavía)

No hay práctica guiada, recorridos ni correspondencia con los bornes del banco: falta confirmar qué módulo del laboratorio hace de `KM3` (el banco tiene `KM1` con térmico, `KM2` y el temporizador). Con el `.cad` original se podría importar como PERFECTO y añadir todo eso.

## Pruebas

- `npm run verify:estrella`: 29 redes de conductores deben unir exactamente los bornes transcritos, todos los bornes quedan sobre un conductor, 26 símbolos con sus rótulos y PERFECTO intacto (47 conductores).
- `node qa/verify-estrella-ui.cjs`: el selector, los 26 componentes y 82 conductores, el marco, la selección de líneas, que la práctica guiada siga solo en PERFECTO y que se vea dentro de la ventana en el móvil.
