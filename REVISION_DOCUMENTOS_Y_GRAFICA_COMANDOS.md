# Revisión de documentos y corrección de Gráfica y comandos

19 de octubre de 2026.

Publicado en https://modo-lab.vercel.app, despliegue `dpl_2iaaL9GHXvwFWNfx65eaFY3rPtSU`, estado READY. Los archivos principales públicos coinciden por SHA-256 con el build local; ocho rutas devuelven HTTP 200 sin exigir autenticación.

## Comportamiento corregido

La vista de inicio es `G` (Gráfica y comandos). Se eliminó el cambio automático a `AG` al pulsar el teclado. El teclado pertenece al campo Comando de la interfaz: letras, operadores y plantillas de funciones se escriben allí y se envían al motor real de GeoGebra. Las vistas A, AG y CAS siguen disponibles por elección explícita del usuario.

Se comprueban la vista seleccionada y el XML del motor para descartar una vista Álgebra abierta aunque la etiqueta del selector no hubiera cambiado. Un archivo anterior guardado con Álgebra recupera la construcción en la vista inicial G. El gráfico no cambia de tamaño al desplegar/replegar teclas.

## Documentos revisados

Se comprobaron los hashes de los 47 originales registrados: ninguno fue modificado. Los 17 recursos del ramo de Matemáticas están presentes y coinciden con sus hashes. Para Unidad 2 se extrajo texto y se inspeccionaron páginas renderizadas de:

- F37, Funciones exponenciales: modelo 2^x, imagen, preimagen, intersecciones y ajustes equivalentes.
- F38, Crecimiento de bacterias: 100 al inicio, factor 1,2 y condiciones independientes de la actividad 4.
- F39, Eliminación de fármacos: 1000 mg, eliminación del 10 % horario y tiempo hasta la mitad.
- F20, Funciones logarítmicas: bases, imágenes, preimágenes, dominio e intersecciones.
- F30, Seguidores en Instagram: cinco pares originales, modelo de Richard, dominio y tasas medias.

No se alteraron los originales. F38, página 3, contiene una fórmula con +1 que no devuelve P0 al evaluar en cero; la advertencia ya existente en «Material y herramientas de apoyo» se conserva. En F30 los incrementos de la tabla no son constantes; la explicación ya distingue aumento sostenido de incremento constante.

Los cuatro problemas de las capturas conservan sus modelos: población 9,5·exp(0,06t)+3; estroncio 237·0,4^(t/24)+3; bancos con bases 1,9 y 1,6 y capitales en miles; planta 1+4·log10(t+1). Se conserva la distinción entre tiempo transcurrido/año calendario, meses/años y pesos/miles.

## Evidencias y límites

- `qa/verify-document-commands.cjs`: 49 pasos de las diez lecciones y comandos adicionales de F37 ejecutados contra GeoGebra; imágenes, puntos y ajustes comprobados.
- `qa/document-review/verified-commands.json`: detalle por lección y fuentes verificadas.
- `npm run verify:geogebra`: 17 preguntas, 28 actividades reales, avance, guardados y controles correctos.
- `qa/verify-lesson-focus.cjs`: cinco temas, lectura paso a paso, orientación y conservación del applet correctos.
- `qa/verify-geogebra-keyboard.cjs`: seis tamaños, escritura ABC/numérica/exponencial, vista G y conservación de la construcción.
- `qa/verify-release-responsive.cjs`: inicio, ramos, aula, repaso, simulador, laboratorio y cuaderno/teclado.
- `npm run check` y `npm run build`: correctos.
- `npm run verify:academic`: pasaron 12 comprobaciones de fuentes, cálculos, modelos y persistencia; la última comparación histórica de hashes no pasa porque App.tsx ya cambió respecto al respaldo antiguo. No se modificó ese respaldo para simular un resultado correcto. Este cambio no edita App.tsx.

Pruebas responsive mediante Chromium emulado, sin afirmar pruebas en dispositivos físicos. Las capturas de comparación están en `qa/graph-command-keyboard/` y el resultado público en `qa/graph-command-keyboard-production/`.
