# Análisis UX/UI del módulo de Automatización

Fecha: 26 de octubre de 2026.

Nota posterior: el criterio final solicitado por el usuario es una pizarra común en escritorio y móvil, con ventanas superpuestas, movibles y ajustables. La entrega final está documentada en `ENTREGA_UX_AUTOMATIZACION_2026-10-26.md`, en la raíz del proyecto. Las propuestas de paneles integrados de este análisis quedan como antecedente y no describen la implementación final.

## Diagnóstico

La interfaz exige aprender su organización antes de poder concentrarse en una tarea. El montaje, la guía, las propiedades, las etapas y los controles de ejecución compiten por la atención. La representación del gabinete tiene trabajo visual aprovechable; la prioridad es reorganizar la experiencia alrededor de una actividad concreta y mejorar la legibilidad.

Este análisis corresponde al proyecto local actual. Se recorrieron Tableros de control, el inicio del taller con PLC, Comprender, Montar, el editor PLC, HMI y Procesos. Se capturaron 12 estados en Chromium, a 1440 × 960 y 390 × 844 con emulación táctil en móvil. No se modificó `src/`, no se desplegó y no se completó el montaje eléctrico. Las conclusiones sobre facilidad de uso son una evaluación experta, pendiente de contraste con usuarios.

## Hallazgos y prioridad

### 1. La acción de comenzar aparece demasiado tarde — alta

En la entrada de escritorio, la introducción ocupa un inspector de aproximadamente 254 px de ancho y 1563 px de alto. El primer botón «Comenzar con PLC» empieza en y=1080, fuera de la pantalla de 960 px. El recorrido de tres tarjetas también desborda horizontalmente su contenedor: 273 px de contenido para 252 px interiores.

En el selector móvil, «Comenzar con PLC» empieza en y=935 para una pantalla de 844 px. Se puede llegar desplazando el contenido; el problema es que la acción principal no se descubre en la primera vista.

Propuesta: presentar objetivo, elección de práctica y botón de inicio juntos. Mostrar las explicaciones adicionales bajo demanda. Usar el inspector para el objeto seleccionado.

Evidencia: `01-entrada-desktop.png`, `08-mobile-selector.png`, `evidencia.json`.

### 2. Leer la guía interrumpe el trabajo — alta

La guía del taller mide 420 × 757 px en escritorio y se superpone al campo y a parte del montaje. En móvil ocupa 374 × 625 px: aproximadamente el 71 % del área total de la pantalla. La cabecera, las siete etapas y el progreso aparecen antes de la actividad; el usuario debe desplazarse para llegar a las acciones.

Cerrar la guía recupera el lienzo, pero también oculta las instrucciones. Mover o redimensionar la ventana permite resolver la superposición manualmente y añade una tarea de gestión de interfaz.

Propuesta: una instrucción breve y una acción contextual visibles junto al montaje. En escritorio, panel lateral integrado que reserve su espacio. En móvil, instrucción compacta y detalle ampliable, manteniendo visible el objeto sobre el que se actúa.

Evidencia: `03-inicio-plc-taller.png`, `04-montar.png`, `09-mobile-guia.png`.

### 3. Se acumulan controles que representan lo mismo — alta

«Montar», «Cablear», «Programar» y «Verificar» están en la guía y en la barra inferior. «Conjunto», «Placa», «Puerta» y «Campo» también están en dos lugares. La ejecución aparece arriba como «Simular proyecto» y abajo como «Accionar»: ambos llaman a `lab.start()` / `lab.stop()`.

El usuario debe deducir cuáles acciones cambian de etapa, cuáles cambian de vista y cuáles ponen en marcha el sistema. La presentación de «Accionar» con fondo verde destacado, incluso antes de terminar el montaje, puede parecer la siguiente acción recomendada.

Propuesta: una navegación de etapas, un selector de zona y un control de simulación con nombre consistente. Diferenciar claramente el avance didáctico de la ejecución del modelo.

Referencias: `src/lab/EquipmentView.tsx:126`, `src/lab/LaboratoryApp.tsx`, `src/lab/equipment/CabinetWorkshop.tsx`.

### 4. El contexto del PLC no coincide con el encargo del tablero — alta

Después de iniciar «PLC industrial» y abrir PLC, el editor muestra «0 segmentos · 9 variables», «Programa listo» y variables como «Nivel bajo», «Nivel alto» y «Nivel del tanque». La explicación dice que las entradas se actualizan desde el tanque.

La tabla de programación del taller asigna esas direcciones a otras funciones: I0.2 es disparo térmico e I0.3 es permiso de proceso. `controllerProgram()` conserva las etiquetas originales al generar la lógica. Esto hace difícil aprender qué representa cada señal. «Programa listo» informa ausencia de diagnósticos, pero puede interpretarse como actividad terminada aunque el programa esté vacío.

Propuesta: adaptar nombres y ayudas al escenario activo y mostrar «Programa vacío» antes de añadir lógica. Separar «sin errores de compilación» de «práctica comprobada». Revisar la coherencia de etiquetas también en HMI y Procesos.

Referencias: `src/lab/model.ts:82`, `src/lab/equipment/cabinet.ts:132`, `src/lab/equipment/CabinetWorkshop.tsx`, `src/lab/PLCView.tsx`.

Evidencia: `06-plc.png`, `06-plc.txt`.

### 5. La agrupación de herramientas no construye un recorrido — media/alta

Tableros, PLC, HMI y Procesos comparten proyecto, pero se muestran como pestañas sin una indicación visible de dependencia o avance. A 1440 px se oculta el nombre «Automatización» por la regla de CSS para anchos inferiores a 1800 px. El grupo se distingue principalmente por su fondo.

Abrir HMI después de crear el tablero presenta una pantalla vacía; Procesos presenta un tanque. La interfaz necesita explicar cómo participan esas vistas en el encargo actual y cuáles son opcionales.

Propuesta: mantener las herramientas y mostrar contexto persistente del proyecto: objetivo, etapa actual y próximo paso. Evitar que cambiar de herramienta parezca iniciar otra actividad independiente.

Referencias: `src/lab/model.ts:17`, `src/styles/laboratory.css:24`, `src/lab/HMIView.tsx`, `src/lab/ProcessView.tsx`.

### 6. La escala del montaje reduce la legibilidad — media/alta

La vista general del taller inicia al 44 % en el recorrido de escritorio. Gabinete, puerta, campo y bandeja comparten lienzo; etiquetas y bornes quedan pequeños. En móvil el gabinete aparece acompañado de bastante espacio vacío superior, mientras otras zonas y equipos quedan fuera de la vista inicial. Para trabajar hay que aprender también el paneo, zoom y cambio de zona.

Propuesta: encuadrar según la etapa y el objeto activo. Al montar, priorizar la placa y la pieza elegida; al cablear, resaltar origen, destino y etiquetas; al probar, dar protagonismo a los mandos y al resultado. Mantener la vista general como opción.

Evidencia: `05-lienzo.png`, `10-mobile-lienzo.png`.

### 7. La información secundaria compite con las acciones — media

Conviven barras redondeadas, controles flotantes, tarjetas, indicadores, sombras y etiquetas pequeñas. Hay texto técnico de poco tamaño sobre fondos claros y un tratamiento visual de baja separación en varias zonas del gabinete. Las instrucciones de la barra superior se truncan en escritorio. Los iconos del editor PLC requieren descubrir su significado mediante ayuda o exploración.

Propuesta: reducir contenedores visibles, reforzar contraste y tamaño de texto importante y mantener etiquetas en las acciones principales. Verificar contraste numéricamente durante la implementación; esta auditoría no constituye una certificación de accesibilidad.

## Estructura recomendada

Conservar el laboratorio actual y sus herramientas. Organizar cada práctica alrededor de:

1. **Objetivo visible:** «Controlar una bomba con marcha, paro y protección».
2. **Etapa actual:** Montar → Cablear → Programar → Comprobar. Comprender puede introducir la actividad; Diagnosticar puede abrirse después como reto.
3. **Tarea concreta:** por ejemplo, «Coloca la fuente G1 sobre el riel superior».
4. **Acción sobre el objeto:** destacar la pieza y su destino en el montaje.
5. **Respuesta inmediata:** qué se logró, qué falta y por qué.
6. **Continuidad:** ofrecer el siguiente paso sin exigir buscarlo en otra ventana.

La distribución libre, el programa manual, el inspector técnico y los retos deben seguir disponibles. La guía puede ser opcional y reabrible para conservar el uso exploratorio y docente.

## Orden de intervención

1. Corregir contexto de señales y mensajes de estado del PLC.
2. Hacer visible el inicio y eliminar las duplicaciones de navegación y ejecución.
3. Integrar guía y área de trabajo; ajustar encuadre por etapa en escritorio y móvil.
4. Afinar tipografía, contraste, iconos y densidad visual sobre la estructura resultante.

## Validación de una mejora futura

Comprobar que una persona nueva encuentra cómo empezar, coloca un equipo, identifica los dos bornes de una conexión y entiende qué falta antes de simular. Observar dudas y errores con usuarios; medir acciones y desplazamientos necesarios, además del éxito final. Verificar conservación del proyecto al cambiar de herramienta y de las interacciones manuales y táctiles existentes.

## Evidencia y límites

- Capturas y textos: esta carpeta.
- Medidas de contenedores y posiciones: `evidencia.json`.
- Recorrido reproducible: `recorrido.cjs`, ejecutado desde la raíz de PanelLab-INACAP con servidor local en el puerto 4327.
- Sin errores JavaScript de página registrados durante este recorrido.
- Sin desbordamiento horizontal del documento en las capturas; existen desplazamiento interno y elementos fuera de la vista inicial. El paneo interno del lienzo es esperado y no se contabiliza como fallo por sí mismo.
- No se ejecutaron build ni pruebas eléctricas: se analizó la interfaz existente sin cambios de implementación.
- No se verificó producción, dispositivos físicos ni aceptación de estudiantes o docentes.
