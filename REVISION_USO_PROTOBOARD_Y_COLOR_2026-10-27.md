# Revisión del protoboard como usuario

Recorrido manual en la aplicación local: abrir modo prueba sin puente H, buscar referencia, cargar el ejemplo de transistores, generar avería, conectar fuente, iniciar/detener simulación, consultar diagnósticos, pedir dos pistas, reparar un extremo mediante Mover sin arrastrar y comprobar reparación.

## Resultado comprobado

La prueba introdujo el cambio g16 → a27 a g17 → a27. Una comprobación previa rechazó la reparación pendiente. Recolocar manualmente el extremo en g16 produjo «Reparación comprobada». Las pistas permanecieron ocultas hasta solicitarlas. Los diagnósticos identifican grupos, componentes, patas, causa y localización.

## Problemas de uso encontrados

1. El modo prueba manda buscar la referencia en las lecciones, pero su catálogo ofrece el puente H con L293D. El ejemplo adecuado está en Opciones del proyecto → Puente H con transistores. Pendiente corregir esa indicación o añadir acceso directo.
2. La indicación inicial sobre conectar la fuente queda al final del cuerpo desplazable. El botón Nueva prueba ocupa el lugar más visible aunque el siguiente paso es investigar el fallo. Pendiente mejorar la jerarquía de ese estado.
3. El arrastre de alimentación exige acertar con la punta, no con el mango. En el recorrido se necesitaron ajustes antes de que desapareciera Sin salida DC. Pendiente mejorar la señal de conexión y la ayuda durante el arrastre; no se cambió la conexión eléctrica para ocultar este problema.
4. El selector de color presentaba barras sin nombres ni una selección evidente, y había que entrar en el editor. Corregido en esta revisión a petición del usuario.

## Corrección de color

- Botón Color en la barra habitual; con puente seleccionado abre su editor. Sin puente seleccionado indica que debe seleccionarse uno. Se bloquea durante la simulación.
- Paleta de dos columnas, colores con nombres, muestra del color actual, botones de al menos 44 px y marca de selección. La paleta tiene estilos propios que también se aplican a la ventana flotante fuera del contenedor del lienzo.
- Cambio manual a Rojo verificado sobre el cable; cerrar y volver desde Color conserva Rojo y su marca.
- Archivos: src/lab/ValueEditor.tsx, src/lab/BreadboardView.tsx, src/styles/laboratory-canvas.css.
- npm run check y npm run build completados. No se añadieron dependencias.
- Evidencia: qa/colores-puentes/color-visible.png.

Esta revisión manual se realizó en la ventana de navegador de 1100 × 874. La paleta nueva no se presenta como comprobada en una tablet física ni en un viewport móvil durante esta revisión. Las pruebas previas del modo de fallos en Chromium/WebKit a 390/820 siguen documentadas en la entrega anterior. No se desplegó. La fuente virtual quedó apagada y la simulación detenida; se utilizó un proyecto de ejemplo para el recorrido.
