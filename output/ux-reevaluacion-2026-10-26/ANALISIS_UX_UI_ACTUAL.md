# Revisión UX/UI de la versión actual

Estado posterior: se aplicaron las correcciones y se amplió la evaluación. La entrega y las pruebas están en `ENTREGA_UX_PIZARRA_Y_REVISION_AMPLIADA_2026-10-26.md`, en la raíz del proyecto. Este documento conserva el diagnóstico anterior a esas correcciones.

26 de octubre de 2026. Evaluación del proyecto local en Chromium a 1440×960, 390×844, 320×740 y 844×390. Se revisaron entrada, elección de práctica, primera actividad, montaje, selección, propiedades, cableado y editor PLC. Se utilizaron contextos de navegador aislados; no se alteró el trabajo guardado del usuario.

## Diagnóstico

El patrón de pizarra con ventanas movibles y ajustables ya es coherente. Los problemas actuales están en la distribución del contenido dentro de esas ventanas, la orientación al trabajar y la respuesta visible de los objetos. La experiencia aún requiere correcciones antes de considerarla resuelta.

Mantener la pizarra en escritorio y móvil, con ventanas superpuestas. La evaluación no propone paneles laterales fijos ni convertir el móvil en una pantalla distinta.

## Lo que mejoró

- El acceso a la práctica y la elección del tipo de control están más cerca del comienzo.
- Actividad y propiedades usan el mismo mecanismo de ventana, con controles de cierre, tamaño y movimiento.
- Las etapas se reúnen en un selector y la simulación tiene un control principal.
- Los nombres del PLC son más coherentes con el encargo y el programa vacío se identifica expresamente.
- El alumno puede despejar el lienzo cerrando las ventanas y recuperar la actividad desde el botón inferior.

## Hallazgos prioritarios

### 1. La lista de montaje se rompe dentro de ventanas estrechas — P1

En una pantalla de 390 px, la fila de G1 mide 290 px de ancho. El botón «Colocado» ocupa aproximadamente 271 px; el nombre del equipo recibe solo 11 px y termina dividido letra por letra. Esa fila alcanza 379 px de alto. Se reproduce también a 320 px y en horizontal, porque la ventana sigue siendo estrecha.

La causa visible en código es la regla general de `src/styles/floating-window.css:56`, que asigna `width:100%` a todos los botones dentro de una ventana cuyo contenedor mide menos de 300 px. Esa regla entra en conflicto con la fila de texto y botón del taller.

**Corrección propuesta:** definir la fila como dos zonas con espacio garantizado para el nombre y un botón de ancho limitado. Al reducir mucho la ventana, pasar a nombre arriba y acción debajo. La adaptación debe depender del ancho de la ventana, también cuando el usuario la redimensiona en escritorio.

Evidencia: [390 px](390-seleccion.png), [320 px](320-seleccion.png), [horizontal](844-seleccion.png). Medidas: `comprobaciones.json`.

### 2. «Identificar» no produce una identificación visible — P1

En un tablero completo, al pulsar «Identificar W01», el número de cables seleccionados permanece en cero y no aparece un aviso. El usuario recibe el nombre de una acción que la pizarra no confirma visualmente.

`connectPlanned()` actualiza identificación y ruta de un cable existente, pero no lo selecciona ni centra su recorrido. Para un hilo ya conectado, el botón cambia a «Identificar» sin implementar esa respuesta de selección.

**Corrección propuesta:** seleccionar y resaltar el cable y sus dos bornes, con una opción clara de encuadrarlo. El estado seleccionado debe persistir mientras se consulta su identificación. No modificar el circuito para localizar un objeto.

Evidencia: [Identificar W01](390-identificar.png), `comprobaciones.json`. Referencias: `src/lab/equipment/CabinetWorkshop.tsx`, `src/lab/EquipmentView.tsx:44`.

### 3. Las acciones importantes siguen quedando bajo demasiado texto — P1

La primera ventana muestra título, etapa, objetivo, instrucción, otra introducción, lista de potencia/control/campo y contexto antes de la pregunta. En móvil no se ve la pregunta ni la respuesta en la vista inicial. En Cablear, la cabecera y las instrucciones dejan el origen/destino y la acción bajo el área visible.

El movimiento y el ajuste de ventanas funcionan; el contenido debería ser útil desde el tamaño inicial. Ajustar una ventana no debería convertirse en el primer paso obligatorio de cada tarea.

**Corrección propuesta:** un objetivo breve, la acción concreta y su resultado visible al inicio. El encargo completo, el contexto y la explicación técnica pueden quedar en secciones desplegables. Mantener las ventanas ajustables.

Evidencia: [Primera actividad](390-primera-actividad.png), [Cablear](390-cablear.png).

### 4. Propiedades invade el control de zoom a 320 px — P1

Con G1 seleccionado, el grupo inferior se limita a 130 px, pero sus botones conservan un ancho mayor. «Propiedades · G1» termina aproximadamente en x=187; el zoom empieza en x=143. Se superponen unos 44 px durante parte de su altura.

El documento no tiene desbordamiento horizontal. La superposición entre controles sigue existiendo y requiere una comprobación específica.

**Corrección propuesta:** un solo dock que gestione el espacio disponible. En anchos pequeños, usar iconos consistentes con nombres accesibles, una acción para recuperar ventanas y el zoom en una zona reservada. Verificar que las áreas táctiles no se superpongan al seleccionar objetos.

Evidencia: [Selección a 320 px](320-seleccion.png), posiciones guardadas en `observaciones.json`.

### 5. Se comparten las ventanas, pero falta una gramática común de herramientas — P2

El simulador tiene herramientas visibles para seleccionar, desplazar y cablear. El taller presenta Actividad, Propiedades, zona y zoom. Dentro del gabinete, arrastrar un equipo y arrastrar el fondo hacen cosas distintas sin un modo de trabajo visible equivalente al del simulador.

**Corrección propuesta:** compartir el mismo dock básico y el mismo estado activo: Seleccionar, Mano, Conectar, Deshacer y Ajustar. Cada módulo puede añadir sus herramientas específicas manteniendo esa base. Destacar el objeto seleccionado y la acción disponible con el mismo lenguaje visual.

### 6. Gestionar varias ventanas exige demasiada organización manual — P2

En móvil, Actividad y Propiedades se abren sobre áreas similares y cubren gran parte del montaje. La segunda ventana conserva la primera detrás, con sus controles parcialmente ocultos. La operación es posible; falta una forma sencilla de reconocer qué ventanas están abiertas y volver a una en concreto.

**Corrección propuesta:** añadir minimizar y traer al frente desde un dock común. Abrir las ventanas con posiciones previsibles, sin tapar el objeto que se acaba de seleccionar cuando haya espacio. Mantener la capacidad de moverlas libremente; no sustituirlas por paneles fijos.

Evidencia: [Dos ventanas en móvil](390-dos-ventanas.png), [dos ventanas en escritorio](1440-dos-ventanas.png).

### 7. El Ladder pierde continuidad visual en móvil — P2

En el segmento revisado, parte de los contactos queda fuera del área visible y la bobina aparece en una fila inferior. No se aprecia inmediatamente cómo recorrer toda la rama. Esta observación es sobre la lectura del programa; no afirma un fallo de su ejecución.

**Corrección propuesta:** conservar el esquema como una superficie continua con navegación y encuadre claros, y mostrar una señal de contenido fuera de vista. Evitar que una adaptación de formulario parezca alterar la estructura del circuito.

Evidencia: [PLC móvil](390-plc.png).

### 8. El encuadre y algunos estados todavía desorientan — P2

El encuadre general de un tablero completo incluye una bandeja de equipos vacía de gran tamaño. Los bornes y las etiquetas reciben menos espacio útil. En el inspector PLC detenido, algunos valores muestran «—» mientras su LED conserva un verde inicial, lo que puede interpretarse como una entrada activa.

**Corrección propuesta:** ofrecer Ajustar selección y encuadrar la zona relevante; reducir el peso de la bandeja vacía al ajustar. Separar visualmente los valores iniciales de los estados leídos durante la simulación.

Evidencia: [Tablero completo](1440-tablero-completo.png), [Memoria del PLC](390-plc-memoria.png).

## Orden recomendado

1. Reparar la distribución de filas al redimensionar y la superposición del dock móvil.
2. Implementar la respuesta visible de Identificar: cable, bornes y encuadre.
3. Simplificar el contenido de las ventanas para mostrar primero la tarea y su acción.
4. Unificar herramientas de la pizarra y gestión de ventanas entre módulos.
5. Afinar continuidad del Ladder, encuadre y distinción de estados.

## Comprobación de la siguiente iteración

Probar una ventana a distintos anchos, no solo distintos tamaños de pantalla. Comprobar que un usuario puede identificar G1, colocarlo, localizar W01, leer sus extremos y volver al montaje sin perder la selección. Repetir con dos ventanas abiertas y comprobar que ninguna acción tapa el zoom o el cierre de otra ventana. En PLC, pedir que siga una rama completa y distinga un valor inicial de una entrada en ejecución.

## Alcance de esta revisión

Se guardaron 36 capturas de estados y medidas de los contenedores, más la comprobación específica de Identificar. No hubo errores JavaScript de página en el recorrido. Las conclusiones combinan fallos reproducidos con evaluación experta de usabilidad; falta contrastarlas con estudiantes. Se utilizó emulación de navegador, sin prueba en teléfono físico.

No se modificaron archivos de implementación ni se desplegó. Los únicos archivos nuevos o actualizados pertenecen a esta documentación y a scripts de captura en `output/`.
