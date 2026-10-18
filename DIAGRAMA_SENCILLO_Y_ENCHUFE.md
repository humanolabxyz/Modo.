# Diagrama sencillo y alimentación virtual

Actualización solicitada el 14 de octubre de 2026.

Al abrir Diagrama se muestra primero PERFECTO, con Mando/Potencia/Todo. Seleccionar una línea o un componente sigue mostrando todos los ramales conocidos en el banco y ofrece Mostrar recorrido en el tablero / Ver bornes. La selección ya no abre automáticamente explicaciones ni la práctica. Las explicaciones y herramientas de lectura están cerradas; Material y otras opciones conserva la materia docente, imagen propia y Todas las rutas, con descripciones de su finalidad.

Practicar paso a paso abre la guía y la desplaza a la vista. Modo, nivel de ayuda y examen se conservan dentro de Ajustes de práctica. Los cables, avances, respuestas y correspondencias siguen guardados en la práctica.

La simulación requiere tres condiciones: Simular 24 V, enchufe conectado y ambos polos CONTROL cerrados. El enchufe de la primera toma de Alimentación se conecta con clic, teclado o tacto; también se puede accionar desde Opciones de simulación. Desenchufar elimina la alimentación y libera contactores/pilotos, conservando cableado y posición de interruptores. No se guarda una sesión energizada al recargar. Reconectar no mantiene una bobina que dependía de su auxiliar de enclavamiento.

FUERZA mueve sus tres palancas juntas y CONTROL mantiene sus dos polos independientes. Las transiciones muestran ON/OFF y respetan movimiento reducido. FUERZA anima sus indicadores; no calcula un circuito trifásico ni giro de motor.

Por aclaración expresa del usuario, los contactos numerados 71/72, 81/82 y 95/96 de los dos contactores son grises NC. Los auxiliares azules son NA; 97/98 del térmico siguen su accionamiento por disparo. Esta regla no afecta los colores de potencia, bobina, pulsadores o motor. La nota del inspector distingue lo indicado por el usuario. KM2 95/96 es NC indicado por el usuario, pero su accionamiento interno sigue pendiente y no se crea un puente simulado para ese par. El inventario original y la auditoría fotográfica se conservan; qa/user-terminal-corrections.json registra las excepciones de color.

Archivos principales: DiagramPane, CadeDiagram, CadeRoute, ConnectionLesson, App, Board, SimulationControls, SimulatorInspector, useSimulation, panel.ts, simulation.ts, diagram-layout.css y simulation.css. panel-model.json y TABLA_DE_BORNES.csv se sincronizan con los 94 bornes activos. El prototipo HTML aprobado se conserva.

Comparación: qa/diagrama-simple/antes.png (publicación anterior), despues.png, recorrido.png, mobile-ampliado.png y enchufe-on.png. Respaldo del panel anterior: qa/diagrama-simple/antes.zip.

Validación: TypeScript/build; datos y colores con excepciones explícitas; recorridos; guía; CADe (47 conductores, 19 símbolos, 12 preguntas); layout en siete tamaños; modelo y UI de simulación; revisión específica de diagrama/enchufe/Fuerza/Control con teclado y tacto móvil. Los scripts anteriores se adaptaron a abrir las secciones que ahora son opcionales, manteniendo sus comprobaciones funcionales.
