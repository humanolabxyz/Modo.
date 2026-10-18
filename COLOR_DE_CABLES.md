# Selector de color visible

El selector salió de Opciones de práctica y ahora aparece siempre en la barra inferior, con la etiqueta Color y una muestra del color activo. Ofrece Petróleo, Rojo, Azul, Amarillo, Negro, Blanco y un selector personalizado.

Sin cable seleccionado cambia el color de los siguientes cables. Con un cable seleccionado muestra Este cable y modifica únicamente su color; conserva los bornes, recorrido y el color elegido para los siguientes cables. Deshacer/Rehacer recuperan los cambios, y los colores instalados permanecen en la práctica guardada y exportada. La paleta se cierra al elegir, pulsar Escape o tocar fuera. Elegir color durante una conexión pendiente conserva su origen.

Archivos: CableColorPicker.tsx, ToolDock.tsx, App.tsx, WireInspector.tsx, cable-color.css e index.astro. El color del cable no modifica sus conexiones eléctricas ni los colores de los bornes.

Evidencias: qa/color-cables/antes.png, visible-desktop.png, paleta-mobile.png y verification.json. verify:cable-color comprueba selección rápida/personalizada, conexión pendiente, cambio individual, historial, guardado, siete tamaños con/sin cable seleccionado y tacto real. verify:interface y verify:diagram-layout comprueban el banco y la convivencia con el diagrama. La captura inicial del test de interfaz ahora espera al botón habilitado tras hidratar, evitando que ocultar el caret durante la captura intervenga antes de hidratar el formulario.
