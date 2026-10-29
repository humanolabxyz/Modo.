# modo. Robótica — UX/UI y ventanas flotantes

## Decisión cerrada
La principal referencia **de interacción** es Figma (pizarra), no su apariencia. Robótica debe usar **el gestor de ventanas flotantes que ya existe en Panel de control de modo.**, según lo descrito por el usuario. Antes de implementar, Codex debe localizarlo en el código, documentar API, estado, persistencia, z-index, foco, límites, drag/resize y adaptación responsive. Si no es reutilizable directamente, proponer extracción mínima con compatibilidad; no introducir librería paralela sin autorización.

## Investigación competitiva (sin copiar interfaces)
- Figma: lienzo infinito, selección, zoom, pan, shortcuts, capas, inspector contextual, menús de precisión.
- Autodesk Fusion: gizmos XYZ, orbitación, ensamblajes, joints, snapping/constraints y jerarquía.
- Tinkercad: accesibilidad de modelos, colocación y controles comprensibles para principiante.
- Wokwi: cableado pin a pin, estado visual de conexiones y editor asociado a simulación.
- Panel de control actual: **referencia interna prioritaria** para ventanas flotantes y diseño visual.

Entregar matriz patrón / aplicación / adaptación propuesta / riesgo / decisión. No copiar UI protegida; investigar capacidades y documentación real.

## Layout preferente de escritorio
- Área central: canvas 3D casi completo.
- Barra mínima de proyecto: nombre, guardar/estado, deshacer/rehacer, alternador **Construir / Simular**.
- Barra de herramientas compacta: seleccionar, mover, rotar, orbitar/pan, cable, medir, encuadrar.
- Ventanas flotantes reutilizadas: **Piezas**, **Estructura**, **Propiedades**, **Programación**, **Consola/Diagnóstico**. Abribles/cerrables/reordenables, redimensionables, arrastrables, foco en primer plano. Se puede tener más de una abierta.
- Ninguna ventana debe bloquear permanentemente el espacio central. Ofrecer **Restablecer disposición** y recordar disposición si el sistema actual lo soporta.
- Submenús por acción contextual: clic secundario en pieza, doble clic o selección; evitar barra de menús kilométrica.

## Interacciones y criterio de comportamiento
1. **Insertar**: buscar/escoger pieza en ventana de catálogo y arrastrarla al canvas; previsualizar antes de soltar. Si hay imposibilidad de colocar, explicar razón.
2. **Seleccionar**: clic pieza; Shift para selección múltiple; teclado para borrar/duplicar/deshacer; destacar sin esconder terminales.
3. **Mover**: gizmo XYZ y opción movimiento sobre plano; coordenadas numéricas en Propiedades cuando se requiere precisión.
4. **Rotar**: ejes + entrada de ángulo; pivote claro. Snapping activar/desactivar.
5. **Ensamblar**: proximidad a anclajes muestra encaje; aceptar unión o dejar libre; distinguir unión rígida de articulación de rueda.
6. **Cablear**: origen en pin visible, previsualización de trayectoria y pin destino, edición de ruta; avisos eléctricos y opción de prácticas con errores intencionales. El color NO implica validez eléctrica.
7. **Programar**: abrir ventana existente tipo Windows para editor Arduino, cambiar tamaño, minimizar/cerrar, revisar errores; monitor serial/diagnóstico en ventana separada o vista contextual si conviene.
8. **Simular**: mismo objeto pasa al entorno blanco; si montaje no cumple, informar lo que bloquea el funcionamiento, pero permitir observar fallas didácticas cuando es seguro en simulación.
9. **Recuperar**: guardar proyecto, restablecer cámara y disposición, resolver ventana fuera de pantalla, recuperar trabajo con el mecanismo de proyectos actual.

## Gestos conflictivos a resolver
- Orbitación vs arrastre de pieza vs arrastre de cable.
- Selección de pieza vs pin pequeño; pin picking con área interactiva ampliada, etiquetas y zoom.
- Eventos sobre ventana flotante vs eventos sobre canvas (no rotar cámara al arrastrar ventana).
- Scroll dentro del editor vs zoom del canvas.
- Atajos de código vs atajos generales del canvas cuando el editor tiene foco.
- En móvil/tablet: ventanas tipo desktop podrían volverse láminas/paneles contextualizados, preservando lógica y no necesariamente idéntica presentación.

## Entregables específicos UX antes de implementar
Mapa de flujo, wireframes escritorio y móvil, estados de ventana y foco, catálogo de interacciones, gestos/atajos, pruebas de usabilidad, referencia a componentes del código que se reutilizarán. Inspección de accesibilidad: teclado, foco, etiquetas, contraste, tamaños de puntero y recuperación de posición.
