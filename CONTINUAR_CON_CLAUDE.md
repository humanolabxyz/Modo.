# Continuación con Claude: laboratorio con el estilo de pizarrón del panel

> Traspaso posterior de Electrodesk: ver [CONTINUAR_ELECTRODESK_CON_CLAUDE.md](CONTINUAR_ELECTRODESK_CON_CLAUDE.md). Incluye la matriz pendiente, variantes visuales y el avance PLC separado del producto.

Preparado el 15 de octubre de 2026. Este documento especifica la próxima mejora; no afirma que ya esté implementada.

## Pedido del usuario

«Necesito que me dejes todo preparado para mejorar lo que hiciste. Me gustaría que toda la protoboard sea como el panel, que tenga ese mismo estilo y utilidad, que no pierda el tipo pizarrón para todo lo práctico. Para darles valores a las cosas me gusta que sean más visuales; por ejemplo, que una resistencia muestre el número al lado con los ohmios, algo intuitivo». La implementación la hará Claude.

La prioridad es convertir la protoboard en un banco de trabajo con el mismo lenguaje visual e interacción del panel aprobado. Después extender ese criterio a esquemas, HMI y procesos. El usuario quiere conservar el panel existente y sus funciones.

## Proyecto y punto de entrada

- Carpeta: `C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP`.
- Tecnología actual: Astro 5, React 19, TypeScript, SVG y lucide-react. Mantener este proyecto.
- Inicio: `/`. Panel de referencia: `/?view=simulator`.
- Protoboard actual: `/laboratorio?tool=breadboard`.
- Servidor local usado en esta sesión: `http://localhost:4336/`. Su disponibilidad depende de que siga activo.
- Si hace falta iniciarlo: `npm run dev -- --port 4336`, ejecutado desde la carpeta indicada.
- Leer `AGENTS.md` y los cuatro documentos v1.1 que referencia. El inventario actual incorpora correcciones posteriores verificadas: las pruebas actuales describen 6 módulos y 94 bornes activos, con 16 IDs retirados; no volver al inventario antiguo de 7/108.
- `LABORATORIO_INTEGRADO.md` explica el alcance funcional y los límites actuales.

## Regla principal de composición

La superficie práctica es un **pizarrón que ocupa el espacio de trabajo**, con elementos y controles flotantes. La referencia es el panel real de esta misma aplicación. Su fondo claro gris azulado, trama discreta, herramientas, zoom e inspectores forman parte de la dirección aprobada. «Pizarrón» no pide un fondo negro ni una estética de tiza.

La protoboard física debe estar sobre ese lienzo, con volumen y terminales reconocibles. Los controles acompañan el trabajo sin encogerlo entre columnas permanentes. El usuario debe poder acercarse, desplazarse, seleccionar, montar, configurar y medir dentro del banco.

### Composición propuesta

- Encabezado flotante compacto: volver al inicio, nombre del proyecto y guardado.
- Selector compacto de herramienta/módulo, conservando todos los accesos actuales.
- Lienzo principal hasta los bordes del área práctica, sin desplazamiento de toda la página para encontrar la placa.
- Biblioteca plegable de componentes, con miniaturas reconocibles.
- Dock de herramientas: seleccionar, desplazar, puente, resistencia, LED, interruptor, medir, retirar, deshacer y rehacer. Los controles pueden agruparse para evitar una fila excesiva.
- Zoom visible con acercar, alejar y ajustar a la placa.
- Fuente y multímetro como controles flotantes compactos.
- Edición contextual al seleccionar un componente, junto a él; cerrar o plegar fácilmente. En móvil usar una hoja inferior compacta.

## Comportamiento visual de componentes y valores

### Resistencia: primer caso que debe quedar resuelto

1. Seleccionar Resistencia en la biblioteca y colocar sus dos extremos en orificios válidos.
2. Mostrar el cuerpo de la resistencia y su valor **siempre junto al componente**, sin tener que abrir un inspector. Ejemplos: `220 Ω`, `1 kΩ`, `4,7 kΩ`, `1 MΩ`.
3. Al colocarla, abrir una edición contextual pequeña con valor, unidad y opciones frecuentes: 220 Ω, 330 Ω, 470 Ω, 1 kΩ, 4,7 kΩ y 10 kΩ.
4. Permitir un valor exacto personalizado. Guardar siempre el número en ohmios: `4,7 kΩ` corresponde a `4700`. No confundir coma decimal, escala y separadores de miles.
5. Confirmar con Enter o una acción visible; Escape cancela el borrador. Un valor vacío, no finito o fuera de rango muestra el motivo junto al campo y no sustituye el valor válido.
6. Al confirmar, actualizar etiqueta y modelo de simulación juntos; una edición confirmada debe ser un paso de deshacer. Al cancelar no crear historial ni guardado.
7. Mantener la etiqueta horizontal, legible a distintas escalas y separada de patas, cables y otros valores. No girar el texto junto con una resistencia vertical.
8. La etiqueta se mantiene tanto en diseño como en simulación. La corriente medida se muestra aparte y con su unidad, sin confundirse con la resistencia configurada.

La representación actual dibuja bandas fijas que no corresponden a cada valor. Sustituirlas por bandas calculadas cuando el valor pueda representarse exactamente, o usar un cuerpo neutro y el valor numérico exacto. No dibujar una tolerancia como si estuviera modelada: actualmente no hay propiedad de tolerancia. El número es la referencia inequívoca.

### Aplicar la misma claridad a otros elementos

| Elemento | Mostrar directamente | Edición/operación |
| --- | --- | --- |
| Fuente DC | `5 V DC`, polos +/− y conexiones | Tensión contextual; respetar el rango actual de 0,1 a 24 V. |
| LED | Ánodo/cátodo y polaridad; caída directa aproximada cuando se seleccione | Editar caída y color si se incorpora ese control; distinguir caída configurada de tensión medida. |
| Interruptor | Posición abierto/cerrado reconocible | Click/tacto opera durante RUN; el estado temporal no cambia el diseño guardado. |
| Puente | Color, extremos y selección claros | Conectar orificios; editar o retirar sin confundirlo con un componente. |
| Multímetro | Puntas A/B, magnitud y unidad | Tensión A−B en puntos elegidos; corriente del componente seleccionado, sin inventar corriente de una sonda. |
| Esquemas | Designaciones, señales y estado eléctrico | Controles junto al elemento seleccionado; ampliar después de cerrar protoboard. |
| Proceso | Nivel en %/L, caudales y estado bomba/válvula | Parámetros cerca de tanque/bomba; mantener valores de configuración separados del estado en ejecución. |
| HMI | Controles e indicadores dentro de la pantalla diseñada | Diseño sobre lienzo y edición contextual; mantener señales compartidas con PLC. |

No añadir capacitores, transistores, Arduino u otros dispositivos como si ya tuvieran simulación. Ampliar el catálogo y el modelo eléctrico es trabajo posterior independiente. ST debe conservar un editor de texto utilizable; no convertir el código en un dibujo por uniformidad visual.

## Interacciones del pizarrón

- Reutilizar el comportamiento comprobado del panel: desplazamiento, Ctrl/Cmd + rueda para zoom alrededor del cursor, mano, Space + arrastre y ajuste de encuadre.
- Mantener mouse, teclado y tacto. En teclado conservar foco visible, nombres accesibles, Escape para cancelar y controles equivalentes sin arrastrar.
- Resolver prioridades entre gesto de navegación, selección, colocación y operación del interruptor. Un desplazamiento/pellizco no debe añadir un componente o activar un interruptor al soltar.
- Calcular coordenadas desde la transformación real del SVG (`getScreenCTM().inverse()`), también después de pan y zoom.
- Primera mejora: seleccionar y montar con dos orificios, pan y zoom. El movimiento de componentes conectados necesita previsualizar ambos extremos y confirmar orificios válidos; no simular que una pata se mueve cuando su conexión sigue en el orificio anterior.
- Conservar la entrada por nombre de orificio como alternativa accesible, dentro de ayuda o controles avanzados plegables.
- Durante RUN se pueden operar interruptores y medir; la edición del circuito y valores sigue bloqueada como hoy. Detener permite editar y reinicia el estado simulado según el comportamiento existente.
- El zoom/selección/popover son estado de interfaz: no deben contaminar el historial eléctrico ni alterar conexiones.

## Archivos actuales y responsabilidad

| Archivo | Responsabilidad y uso para la mejora |
| --- | --- |
| `src/components/App.tsx` | Referencia de composición del panel, controles, ajuste y zoom. Leer; no rediseñar. |
| `src/components/Board.tsx` | Referencia de interacción SVG y navegación. Leer; conservar lógica y datos. |
| `src/components/ToolDock.tsx` | Referencia visual y de interacción del dock. Sus contratos pertenecen al panel; no pasarles tipos de protoboard a la fuerza. |
| `src/styles/canvas.css` | Referencia del pizarrón, controles flotantes y adaptación móvil. Evitar importar sus reglas globales indiscriminadamente. |
| `src/hooks/useSvgNavigation.ts` | Navegación SVG existente. Reutilizar sin cambiar sus valores por defecto ni romper sus consumidores. El hook no implementa por sí solo todas las acciones de la herramienta Mano o ajuste. |
| `src/lab/LaboratoryApp.tsx` | Contenedor actual del laboratorio, navegación y acciones del proyecto. Aquí se prepara el modo de lienzo práctico. |
| `src/lab/BreadboardView.tsx` | Placa, componentes SVG, montaje, inspector y multímetro actuales. Prioridad de implementación. |
| `src/styles/laboratory.css` | Estilos exclusivos del laboratorio. Introducir reglas acotadas al nuevo modo, por ejemplo `.lab-canvas-workspace`. |
| `src/lab/model.ts` | IDs, tipos, orificios, grupos y plantillas. `ProtoComponent.value` almacena Ω para resistencia y V para LED. |
| `src/lab/dc.ts` | Solver DC y medidas. Mantener separada la presentación visual. |
| `src/lab/validation.ts` | Contrato de importación y rangos. Conservar compatibilidad con proyectos versión 1. |
| `src/lab/useLaboratory.ts` | Proyectos, guardado, historial, RUN y estados temporales. Enviar aquí cambios confirmados; mantener borradores de edición en UI. |
| `src/lab/SchematicView.tsx`, `HMIView.tsx`, `ProcessView.tsx`, `PLCView.tsx` | Otras herramientas; adaptar progresivamente al mismo lenguaje después de protoboard. |
| `qa/verify-laboratory.mjs` | Pruebas de modelos existentes. Conservarlas; añadir comprobaciones donde cambie el comportamiento. |

Extraer piezas pequeñas solo cuando haya reutilización real: superficie de trabajo, controles de navegación y editor contextual. Un helper de formato de magnitudes puede ser dueño de Ω/kΩ/MΩ, parseo y validación; solver y guardado reciben números, nunca etiquetas formateadas. No duplicar la interpretación de unidades en varios formularios.

El formato actual contiene `id`, `kind`, `from`, `to`, `value`, `closed` y `color`. Las etiquetas de valores se pueden derivar sin migración. Si se añaden identificadores como R1/R2, posiciones manuales de etiqueta o tolerancia, definir persistencia y compatibilidad explícitamente; no derivar una identidad estable de un índice que cambia al borrar.

## Lo que se debe conservar

- Panel de práctica, inicio, estudio, diagramas, cableado, bornes, simulación y datos existentes.
- Los proyectos locales actuales, su exportación/importación y las cinco herramientas.
- Grupos internos a–e y f–j por columna, canal central y rieles interrumpidos entre 15 y 16.
- Detección de cortocircuitos, nodos flotantes y sobrecorriente LED. Un valor sin referencia debe seguir mostrándose como desconocido, no como 0 V.
- Los motores de esquema, PLC, proceso y protoboard y sus limitaciones didácticas. Esta tarea mejora interacción y legibilidad, no completa la equivalencia con UNIFCAD.
- El estilo aprobado del panel es la referencia; adaptar las nuevas herramientas a él.

Hubo cambios concurrentes de otro trabajo durante la integración anterior. Antes de editar, revisar el estado presente y los cambios locales. No restaurar archivos desde capturas ni desde hashes viejos. `qa/claude-handoff/fuentes-entrega.json` es un inventario de referencia de esta entrega, no una autorización para sobrescribir cambios posteriores.

## Orden recomendado de ejecución

1. Abrir el panel de referencia y protoboard actual. Guardar capturas equivalentes antes de editar; revisar instrucciones y el estado de archivos.
2. Migrar solo la protoboard al lienzo amplio con controles flotantes, zoom, ajuste y navegación. Mantener montaje y solver funcionando.
3. Añadir valores visibles y edición contextual de resistencia; confirmar/cancelar, unidades, valores frecuentes e historial. Corregir las bandas fijas.
4. Aplicar edición contextual a fuente y LED, y hacer el multímetro más visual. Verificar RUN, datos guardados y uso en móvil.
5. Tras completar ese recorrido, extender la composición de pizarrón a esquemas, HMI y procesos sin rehacer la lógica.
6. Ejecutar validación y documentar lo implementado y lo pendiente con capturas reales. Trabajar solo localmente, sin despliegue.

## Criterios de aceptación

- En escritorio la placa está en el pizarrón y los controles flotan; no queda limitada a una tarjeta con una columna permanente de formularios.
- Puedo colocar una resistencia y leer `1 kΩ` al lado inmediatamente.
- Puedo cambiarla a `4,7 kΩ`; el proyecto guarda 4700 Ω, la etiqueta coincide y la simulación usa 4700 Ω.
- Cancelar una edición conserva el valor; Deshacer/Rehacer restaura valor, etiqueta y cálculo juntos.
- Un error de entrada permanece visible y no destruye el valor anterior.
- Las etiquetas no tapan orificios, patas o controles; se leen con resistencia vertical, zoom y varios componentes cercanos.
- Puedo colocar y medir después de desplazar/acercar; navegar no modifica la red.
- El circuito de referencia de 5 V, resistencia de 1000 Ω y LED de caída 1,9 V conserva aproximadamente 3,069 mA en el modelo actual, que incluye 10 Ω internos del LED.
- Cortocircuito y nodo sin referencia conservan diagnósticos honestos.
- Exportar, recargar e importar mantienen conexiones, valores y colores; proyectos antiguos siguen abriendo.
- En móvil los controles son accesibles sin perder el banco; el panel contextual puede cerrarse y no bloquea todas las conexiones.
- Panel y estudio conservan sus recorridos; consola sin errores de aplicación. Reportar por separado cualquier limitación o prueba no ejecutada.

### Validación de la implementación futura

Desde la carpeta del proyecto: `npm run check`, `npm run build`, `node qa/verify-laboratory.mjs`, `npm run verify:data`, `npm run verify:simulation` y `npm run verify:wiring`. Validar en navegador los criterios anteriores con escritorio de 1440/1920 px y móvil de 390 px. Si se toca navegación compartida, incluir la regresión de canvas del panel y comprobar los scripts vigentes antes de ejecutarlos.

Las capturas existentes en `qa/laboratory-results` muestran el inicio y laboratorio previos; no son una maqueta aprobada del rediseño solicitado. Las pruebas registradas allí corresponden a la versión inicial. Volver a comprobar después de implementar.

## Prompt para entregar a Claude

> Trabaja en `C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP`. Lee `AGENTS.md`, los documentos que referencia, `CONTINUAR_CON_CLAUDE.md` y `LABORATORIO_INTEGRADO.md`. Implementa la mejora descrita: empieza por la protoboard con el mismo pizarrón, controles flotantes, pan/zoom y utilidad del panel de práctica aprobado. Quiero valores visibles junto a los componentes y edición contextual intuitiva: una resistencia debe mostrar sus ohmios al colocarla y permitir cambiar valor/unidad con previsualización y confirmación. Conserva los proyectos, el solver, historial, importación/exportación y todo el panel/estudio existente; adapta las herramientas nuevas al panel. No sobrescribas cambios locales de otros trabajos. Completa primero protoboard, luego extiende el criterio a las demás superficies prácticas. Trabaja solo localmente, verifica los recorridos y pruebas indicados, y entrega capturas reales con pendientes explícitos.

---

> **Estado (15 de octubre de 2026):** la protoboard y la composición flotante de Esquemas, PLC, HMI y Procesos están implementadas; ver `PIZARRON_PRACTICO.md` para lo hecho, las capturas, las pruebas y los pendientes (mover componentes colocados, zoom propio en las demás herramientas, regresión de canvas del panel no ejecutada).
