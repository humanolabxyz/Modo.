# Armazón, armado compacto, PLC/relé y pantalla de programar

Fecha: 26 de octubre de 2026. Cambios locales; no se publicó un despliegue.

## Qué se hizo

**Armado real (equipos menos dispersos).** Los tableros nuevos usan una distribución compacta (`layout: 'compact'` en el modelo, `cabinet.ts`):

- Fila 1: fuente G1, portafusible FU1, guardamotor QM1 y contactor K1, sobre un riel.
- Fila 2: PLC o relé programable (si el perfil lo tiene) y relé térmico F1 justo bajo K1.
- Fila 3: bornes U, V, W y PE contiguos, como una regleta.
- Canaletas entre filas y a los lados (seis en total); los cables bajan a la canaleta más cercana.
- El área útil pasa de 900 × 780 a 720 × 780 y el resto de la placa se dibuja como **espacio de reserva** rayado.
- Los proyectos ya guardados no cambian: sin `layout` conservan la distribución anterior.

**Armazón (envolvente).** Junta de puerta, cáncamos superiores, zócalo ventilado, luz LED interior, seccionador de puerta QS1 con maneta que gira, cerradura, filtro-ventilador (el rodete gira al simular) y placa de datos «IP66 · NEMA 4X equivalente · modelo didáctico».

**PLC y relé programable.** El PLC muestra 8 LED de entrada (I0.0–I0.7), 4 de salida (Q0.0–Q0.3) y un visor de la salida Q1 hacia K1. El relé muestra I1–I4, Q1 y RUN/STOP. Todo sigue el estado real de la simulación.

**Pantalla de programar.** Escalera con energía visible (rama encendida, contacto activo, bobina energizada), editor de texto estructurado con números de línea y color por tipo de símbolo (el `<textarea>` sigue siendo el control real), variables con LED y, en la ventana del taller, una escalera dibujada que se enciende al simular.

## Qué se encontró en la red

Las búsquedas dieron fuentes comerciales y foros; **ninguna confirma qué controlador usa una faena concreta**.

- Las listas generales de PLC citan Siemens (S7-1200/1500, LOGO!), Rockwell/Allen-Bradley (MicroLogix, CompactLogix, ControlLogix), Schneider, Omron, Mitsubishi, ABB y Delta, sin dato para Chile.
- Dato documentado en Chile: ABB entregó en 2006 el sistema de control 800xA de la planta de molibdeno de Collahuasi, y Codelco eligió 800xA para integrar su mina Andina. Son notas de 2006, no un inventario actual.
- Dos integradores chilenos declaran trabajar con Siemens S7-300/400/1500, ControlLogix, Schneider M340/M580 y 800xA. Prueba capacidades comerciales, no instalaciones.
- Rockwell indica que su arrancador suave de media tensión CENTERLINE 1500 se usa en minería.
- No se encontró inventario público de marcas por planta ni normativa chilena específica de tableros mineros en esos resultados.
- Envolvente: IP66 no garantiza resistencia a la corrosión; NEMA 4X sí la incluye. Los catálogos de Rittal listan filtro-ventilador, termostato, luz con interruptor de puerta y bastidor abatible.
- Distribución: potencia arriba, control en medio y bornes abajo; piezas que calientan arriba y electrónica sensible abajo; potencia y control separados (una guía propone 150 mm); canaleta con 30–40 % de llenado. Son guías de blogs y fabricantes, a contrastar con IEC 61439 / NFPA 79 / UL 508A y los manuales de cada equipo.
- No se encontraron fuentes sobre carga solar ni reducción de potencia por temperatura en desierto.

## Qué falta y cómo aplicarlo

Orden propuesto, de menor a mayor esfuerzo:

1. **Termostato y resistencia calefactora** junto al filtro-ventilador, con temperatura interna simulada (requiere dato térmico propio; no hay fuente confiable aún).
2. **Bastidor abatible y estado de puerta** (abierta/cerrada) que encienda la luz LED y bloquee el seccionador.
3. **Arrancador suave** como equipo nuevo con rampa, reutilizando el modelo del variador.
4. **E/S remotas y HMI** como perfiles genéricos (sin firmware de marca): módulo de entradas/salidas por red y pantalla del operador.
5. **Relé de protección de motor** con curva simplificada y disparo registrado.
6. **Perfil de controlador de proceso** estilo DCS con varias tarjetas, solo para lectura/diagnóstico.

Antes de cualquiera conviene validar con un docente de Tarapacá qué controladores ven realmente en terreno, para no fijar marcas por intuición.

## Fuentes

- [Revista ElectroIndustria · ABB en Collahuasi](https://www.emb.cl/electroindustria/noticia.mvc?nid=20060103x8&ni=abb-suministra-solucion-de-automatizacion-para-planta-de-molibdeno-de-collahuasi)
- [ABB integra los sistemas de automatización de una mina de cobre](https://www.automation.com/article/abb-integrates-copper-mine-automation-systems)
- [Rockwell Automation · arrancadores suaves NEMA CENTERLINE 1500](https://www.rockwellautomation.com/es-es/products/hardware/motor-control/nema-centerline-1500-soft-starters.html)
- [IP66 frente a NEMA 4X](https://industrialmonitordirect.com/blogs/knowledgebase/ip66-vs-nema-4x-enclosure-protection-ratings-compared)
- [Distribución de tableros de control · buenas prácticas](https://industrialmonitordirect.com/blogs/knowledgebase/control-panel-wiring-best-practices-and-concepts)
- [Ubicación de equipos por calor · foro control.com](https://control.com/thread/1527271644)

## Pruebas

`npm run check` y `npm run build` correctos. Pasan `verify:cabinet` (24), `verify:cabinet-cables` (7), `verify:cabinet-controls` (14), `verify:cabinet-plc` (14), `verify:cabinet-usability` (9), `verify:cabinet-ui` (16), `verify:float` y `verify-laboratory-ui`.

Se ajustaron dos pruebas a la distribución nueva: `verify-cabinet.mjs` (posiciona con `slotsFor`) y `verify-cabinet-controls.cjs` (seis canaletas). Copia de los originales en `qa/cabinet-fx/before-plc/`.

`verify-tablet-laboratory.cjs` falla en Protoboard a 320 px (un botón del dock queda a 334 px de ancho); es una pantalla que no se tocó.

Medición local (Chromium sin GPU, CPU 4× más lenta, simulación en marcha): el tiempo de tarea varía entre 23 % y 37 % según la carga del equipo en el momento; los filtros SVG pasaron de 14 a 0. La referencia original (17 %) se midió en una sesión más tranquila, así que no es comparable punto a punto.

## Arrancador suave (26 de octubre)

- Equipo nuevo `softstart` (catálogo: 42 piezas), con bornes L1–L3/PE arriba, T1–T3/PEo abajo y 24, DI1, COM a la derecha. Reutiliza el modelo del variador: mismas validaciones de red (fase ausente, desbalance, salidas en cortocircuito) y la misma rampa.
- Diferencias con el variador: la **frecuencia no cambia**; sube la tensión desde el valor inicial (parámetro «Tensión inicial», 30 % por defecto) hasta el 100 % en el tiempo de rampa (3 s por defecto). Al llegar al 100 % se muestra «puenteado». El paro corta la salida de inmediato (sin paro suave). La velocidad del motor se aproxima a la rampa de tensión; no modela par, carga ni corriente de arranque.
- Marcha/Paro desde la ventana del equipo, desde los botones I/O del dibujo o cableando DI1 a 24. Ejemplo nuevo en «Montajes y archivos → Añadir ejemplo de arrancador suave».
- Pruebas nuevas en `qa/verify-equipment.mjs`: rampa monótona de 30 % a 100 %, motor activo y detenido al parar, y no arranque con una fase ausente. El conteo del catálogo pasó de 41 a 42.

## Controladores visibles en el taller

La pantalla de inicio ahora presenta primero **PLC industrial** («lo habitual en planta»), después el mando cableado como base de potencia y por último el relé programable. Los nombres de los botones no cambiaron.

## Navegación del laboratorio y menús en celular y tableta (26 de octubre)

**Agrupación mínima.** Tableros de control, PLC, HMI y Procesos forman el grupo «Automatización» (`TOOL_GROUPS` en `model.ts`). Dentro del grupo se ven sus cuatro herramientas; desde otra herramienta el grupo es una sola píldora «Automatización ›» que abre la última herramienta usada. En el selector compacto se usa `<optgroup>`. Esquemas, Protoboard, Soldadura, Temperatura, Detectores y GeoGebra no cambian. Las direcciones `?tool=` siguen valiendo.

**Qué fallaba en pantallas pequeñas** (barrido con `qa/cabinet-fx/devices.cjs` y `menus.cjs`, a 390×844, 844×390, 768×1024 y 1024×768):
- Las ventanas flotantes están hechas para ratón (arrastrar, cambiar tamaño, pie con instrucciones). En teléfono horizontal quedaban de unos 225 px de alto, con el contenido cortado.
- La barra inferior del tablero ocupaba todo el ancho y, junto con las dos barras superiores, dejaba menos de la mitad de la pantalla para el lienzo.
- La fila de vistas (Guía, Conjunto, Placa, Puerta, Campo) se cortaba en «Ca…» sin aviso de que se desplaza.
- Los botones de la fila medían 30 px, bajo el mínimo táctil.

**Corrección** (`floating-window-touch.css` y bloque táctil de `cabinet-fx.css`):
- Con puntero táctil se ocultan los bordes de redimensión y las instrucciones del pie.
- En teléfono horizontal la ventana pasa a panel lateral de alto casi completo, bajo la barra superior para no tapar Simular, y la barra inferior se vuelve de iconos (el nombre accesible se conserva).
- En teléfono vertical la ventana usa el ancho completo.
- La fila de vistas se desplaza con ajuste al paso y borde difuminado.
- Botones táctiles de 42–48 px.

**Hecho después:** en teléfono vertical (hasta 520 px) el tablero abre en la vista «Placa» (33 % en lugar de 25 %); en escritorio y tableta sigue abriendo en «Conjunto».

**Panel lateral también en tableta.** Con puntero táctil y entre 701 y 1366 px de ancho (tableta vertical y horizontal), las ventanas del laboratorio usan el mismo panel lateral del teléfono horizontal: a la derecha, bajo la barra superior (Simular queda libre) y sobre la barra de acciones y el zoom. Con ratón las ventanas siguen siendo movibles y redimensionables. Regla en `floating-window-touch.css`, limitada con `body:has(.lab-page)` para no afectar otras páginas.

## Formulario «Mi proyecto» para quien llega por primera vez (26 de octubre)

La ventana de opciones del proyecto (barra compacta: teléfono y tableta) era una lista de campos y botones sin jerarquía. Ahora:
- **Tu proyecto:** solo el nombre y el estado de guardado.
- **Ejemplos para practicar:** tarjetas con icono y una línea que dice qué hace cada uno, con «Para empezar» en Marcha y retención, más «Nuevo proyecto vacío».
- **Guardar y compartir:** Duplicar, Exportar e Importar, cada uno con una frase de ayuda.
- **Más opciones** (plegado): Proyecto activo, Velocidad de simulación y los enlaces.

Los nombres accesibles de campos y botones no cambiaron (`Nombre del proyecto`, `Exportar proyecto`, `Importar proyecto`, los nombres de los ejemplos…). Archivos: `LaboratoryBar.tsx` y `project-form.css`. El menú «Proyecto» de la versión de escritorio ancha es otra copia y no se tocó.

## Formulario de parámetros del equipo (26 de octubre)

El inspector de equipos (modo libre) usa el mismo estilo que «Mi proyecto»:
- **Cabecera** con la designación (p. ej. SS1), el nombre del equipo y su descripción.
- **Parámetros del equipo:** cada campo muestra su rango debajo («Entre 1 y 690») y una frase de ayuda; durante la simulación avisa que hay que detenerla para cambiar valores.
- **Conectar un cable:** explica los dos pasos (empezar en un borne, tocar el de destino) con un botón principal verde.
- **Operar** (variador y arrancador suave) y **Lecturas** como tarjetas; **Retirar equipo** al final, con aviso de que se pueden deshacer los cambios.
- La tarjeta de bienvenida del taller ya no aparece encima del formulario cuando hay un equipo seleccionado.
- En pantallas de 1799 px o menos se oculta el rótulo «Automatización» de la barra de herramientas para no tapar el título del inspector; el grupo mantiene su borde y un `title`.

Los nombres accesibles de campos y botones no cambiaron. Archivos: `EquipmentView.tsx`, `equipment-form.css`. Pasan `verify-equipment` (19), `verify-equipment-ui` (15) y las pruebas del taller.

## Recorte de información (26 de octubre)

Los dos formularios nuevos quedaron con demasiado texto. Se quitó: la descripción larga y el párrafo de ayuda del encabezado del equipo, los textos «Entre X y Y» bajo cada campo (el rango queda como tooltip y en los límites del campo), los títulos y párrafos de «Conectar un cable» y «Operar», el aviso bajo «Retirar equipo» y las frases de ayuda de Duplicar, Exportar e Importar. Se conservan las frases de los ejemplos y los avisos que cambian con el estado (simulación activa, cable empezado).

## Revisión de lo hecho (26 de octubre): dejar, simplificar, quitar

**Dejar** (aporta y está verificado con pruebas):
- Rendimiento del tablero: carcasas que solo se redibujan si cambian, cables que solo se recalculan al mover un equipo, capa de efectos aparte (`CabinetFx.tsx`), sin filtros SVG.
- Armado compacto (`layout: 'compact'`) con reserva de placa; los proyectos antiguos no cambian.
- LED vivos del PLC y del relé; escalera con energía visible; editor ST con color.
- Arrancador suave (reutiliza el motor del variador) y sus pruebas.
- Inicio del taller con el PLC primero.
- Menús táctiles: panel lateral en tableta y teléfono horizontal, fila de vistas desplazable, tablero que abre en Placa en teléfono vertical.

**Simplificar** (hecho o por hacer):
- Hecho: se recortó el texto de «Mi proyecto» y de los parámetros del equipo.
- Por hacer: la barra de acciones del tablero lleva demasiada luz y movimiento en reposo; los halos y el resplandor de cables podrían activarse solo al simular.
- Por hacer: «Automatización» como grupo solo ahorra pestañas cuando se está fuera del grupo; si se prefiere, quitar la píldora y dejar solo el orden actual.
- Por hacer: aplicar el mismo recorte al menú «Proyecto» de escritorio, que sigue con el aspecto anterior, o dejarlo igual para no tener dos estilos.

**Quitar** (código sobrante, sin riesgo):
- Estilos sin uso: `.fx-coast`, `.cab-ico-defs`, `.lab-pf-help`, `.eq-description` (en los CSS nuevos) y la clase `fx-breathe` que quedó en `IndustrialArt.tsx` sin animación.
- `qa/cabinet-fx/` pesa unos 86 MB por capturas: conservar los scripts (`measure`, `crops`, `devices`, `menus`) y borrar las imágenes.
- Copias de respaldo repetidas en `qa/lab-nav-before/` y `qa/cabinet-fx/before*/` cuando se confirme que todo queda aprobado.

**Sin verificar o con riesgo**
- Todo lo táctil se probó con emulación, no en dispositivos reales.
- Cuatro scripts de prueba (`verify-laboratory-ui`, `verify-modo`, `verify-tablet-laboratory`, `verify-security` con servidor estático) fallan por causas ajenas o previas; conviene arreglarlos para poder confiar en ellos.
- El árbol de trabajo tiene unos 88 archivos modificados sin confirmar en git, la mayoría de antes de esta sesión: conviene confirmarlos por partes.

**Limpieza segura aplicada.** Se quitaron `.fx-coast`, `.cab-ico-defs`, `.lab-pf-help` y `.eq-description` de los CSS nuevos y la clase `fx-breathe` de `IndustrialArt.tsx`; se borraron las 129 capturas de `qa/cabinet-fx/` (unos 85 MB) y se conservaron los scripts (`measure`, `crops`, `devices`, `menus`, `params`, `compact`, `plc-shots`, `soft`) y los informes JSON. Siguen las copias de respaldo en `qa/lab-nav-before/` y `qa/cabinet-fx/before*/`.
