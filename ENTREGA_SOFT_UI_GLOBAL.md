# Interfaz compartida · 18 de octubre de 2026

Estilo aplicado localmente a las cinco rutas: Inicio/panel, Estudio, Laboratorio, Comunidad y Políticas. El laboratorio incluye Esquemas, Equipos eléctricos, PLC, HMI, Procesos, Protoboard, Temperatura, Detectores y GeoGebra (marco exterior; el applet mantiene su interfaz propia).

## Dirección visual

Las referencias se usan como criterio de agrupación y jerarquía: barras blancas con controles e iconos planos dentro de un contenedor común, selección negra, bordes suaves y una sola sombra exterior. Fondo gris claro. Se conserva el neomorfismo de los campos y detalles del inicio, reduciendo las sombras repetidas de los botones. En escritorio se integra visualmente la cabecera del laboratorio en una sola barra. Los menús usan una superficie blanca con filas de iconos.

El negro representa selección o una acción disponible; el verde representa simulación activada, alimentación virtual y señales activas. El punto de alimentación depende de la energía real del modelo virtual, no solo de pulsar Simular. Se conservan colores de cables, bornes, indicadores, instrumentos, gráficas, avisos y errores.

## Archivos

- src/styles/modo-soft-ui.css: tokens compartidos, superficies, barras, controles, ventanas y prioridades de color funcional.
- src/pages/{index,estudio,laboratorio,comunidad,legal}.astro: carga de la capa visual y clase de ámbito en body; color de navegador ajustado donde ya existía.
- qa/verify-soft-ui.cjs y qa/verify-soft-ui-states.cjs: revisión visual, preservación e interacciones.

No se cambian los componentes React, modelos, materias ni datos. qa/soft-ui-global/logic-hashes.json conserva los hashes de todos los archivos TS, TSX y JSON de src al inicio del trabajo.

## Verificación

- npm install --ignore-scripts --no-audit --no-fund; npm run check; npm run build.
- 34 capturas de las rutas y herramientas a 1440 y 390 px, sin errores JavaScript ni desbordamiento horizontal; menús del esquema, colocar componente, eliminar y deshacer.
- Estados: Simular pasa a verde y vuelve a neutral; enchufe y controles activos verdes; indicador energizado solo con alimentación; RUN verde y STOP negro; una variable del PLC cambia de estado y color.
- verify-study-unified.cjs: recorridos, etapas, navegación, progreso, Protecciones y controles táctiles a 390/768 px.
- verify-home-refinement.cjs: seis anchos, destinos y práctica guardada conservados.

Las pruebas antiguas adicionales no se reportan como aprobadas: verify-laboratory-ui.cjs se detuvo al esperar ocho elementos de un menú que actualmente ofrece quince; antes pasó dieciséis comprobaciones de protoboard. verify-cable-color.cjs pasó los cambios de color y deshacer/rehacer, pero se detuvo porque una ventana de inspector interceptó el clic en el menú de cables. No se modificaron estas pruebas para ocultar esos límites.

Capturas comparativas y reportes: qa/soft-ui-global/. Estados activos: qa/soft-ui-global/estados/. Pruebas de Estudio: qa/soft-ui-global/estudio/. Inicio: qa/soft-ui-global/inicio/.

Vista local: http://127.0.0.1:4344/. Sin publicación.


## Corrección de contraste de textos

Se corrigió la etiqueta Color sobre la barra blanca, sus estados hover/abierto y los textos secundarios heredados de fondos oscuros. También se ajustaron ayudas del laboratorio, etiquetas HMI, notas y pasos de Estudio, cabecera oscura del catálogo, ayudas de PLC, Comunidad y GeoGebra. Se mantienen los colores del cable, instrumentos y estados de simulación/energía.

qa/audit-text-contrast.cjs revisó texto HTML en dieciséis rutas a 1440 y 390 px, incluyendo los menús de colores y componentes. Ningún texto de los estados auditados quedó por debajo del umbral calculado (4,5:1 para texto normal, 3:1 para texto grande). Es una revisión automatizada de los estados visitados y fondos CSS; no una certificación integral, ni una medición de SVG, applets o todos los estados posibles. Informes y capturas en qa/contraste/. Compilación correcta y prueba de colores funcionales correcta en ambas dimensiones.


## Mensajes de ayuda alineados

Las ayudas del panel usan una tarjeta blanca opaca y texto alineado a la izquierda, con tamaño mínimo de 12 px e interlineado 1,5. En escritorio se alinean al margen inferior izquierdo, separadas del estado de guardado y del banco. En móvil quedan debajo de las barras superiores. Las ayudas de protoboard, temperatura y detectores se sitúan fuera de los instrumentos y tarjetas de lectura. Los tooltips conservan un ancho propio para no partir las etiquetas en columnas estrechas.

qa/verify-messages.cjs: 360×800, 390×844, 768×1024, 1062×834 y 1440×960. Se verifican los modos conectar/retirar/mover, origen pendiente y cancelar, mensajes de tres herramientas, tamaño, alineación, ausencia de recortes y separación respecto del dock y tarjetas de lectura. Capturas y reporte en qa/mensajes/. Build correcto; cambios limitados a CSS y QA.
