# PanelLab 2.2.5 — Soldadura y protoboard práctica

21 de octubre de 2026. Trabajo sobre la app existente, conservando panel, fuentes docentes, formato de proyectos y barra de herramientas.

## Soldadura
- Tres conductores visibles desde una cubierta común UTP, entrando desde abajo, con copas y números del DB9 legibles. Café, blanco y verde según la guía F34 página 4; se conservan las elecciones anteriores y la selección manual de colores.
- Cada hilo conserva posición, pelado, tubo y estado térmico/calidad al seleccionar otro. Las uniones se guardan sin persistir calor ni contacto del cautín.
- Una unión soldada queda bloqueada inmediatamente, incluso antes de aislarla. No se borra al cambiar de copa, repetir conductor, cambiar de hilo o recargar. Se debe retirar el tubo y recalentar con cautín hasta la fusión antes de extraer o usar la malla. El desoldado invalida comprobaciones del cable.
- Hilo de estaño presentado en la unión + punta del cautín + temperatura de la aleación producen aporte y mojado, con animación de fundido acotada a 1,2 s y respeto por movimiento reducido. Se puede estañar la punta arrastrando el hilo sobre ella.
- Encendido HTML de 44 px independiente del zoom; controles SVG táctiles directos y zona de agarre del conductor alejada del cautín.

## Protoboard
- Pulsadores con captura del puntero, activación mantenida y liberación al soltar/cancelar/perder foco; el gesto no mueve el banco ni abre edición. Zona táctil de 44 px durante simulación.
- Fuente con enchufe virtual, OUTPUT y dos cables que se arrastran a orificios libres. Todos los estados son necesarios para aplicar la tensión durante Simular. Alternativa accesible por nombre/orificio y conexión a rieles libres. Datos opcionales validados en el mismo formato de proyecto.
- Puente H de cuatro NPN según la clase: se completan los dos brazos, resistencias de base y conexiones de mando. Cada transistor tiene E/B/C en columnas separadas. Los pulsadores cruzan el canal con cuatro patas; sus pares internos forman parte del solver y la continuidad. Se añaden puentes macho–macho y uniones de rieles partidos. No hay patas compartiendo orificios en ambos ejemplos.
- L293D de práctica alimentado a 5 V para lógica y motor, EN activo, dos entradas con pull-down de 10 kΩ, cuatro GND y cableado de ambos pulsadores. La lámina original de motor a 12 V se conserva con explicación de fuente lógica independiente. El modelo de salida continúa siendo didáctico DC, no un SPICE calibrado.
- Transistor colocado con un toque en E, B/C automáticos y orientación reversible. Huella previa y rechazo de orificios ocupados. Pulsador de cuatro patas también se coloca con un toque.
- Menús del dock portados a document.body: independientes del zoom, contenidos en la pantalla, desplazables y con selección táctil directa. Se elimina la barra duplicada Práctica libre/Lecciones; catálogo y práctica libre desde Aprender y referencias. No se pierde progreso.
- Diagramas vectoriales claros, recorridos explicativos, componentes seleccionables, patillaje DIP16, zoom/ajuste y comparación con láminas originales en la ventana compartida.

## Verificación
- npm install: cero vulnerabilidades. npm run check y npm run build correctos.
- verify-laboratory: 38/38. Se actualizan expectativas del ejemplo L293D de 12 V/EN incompleto a 5 V/ambos sentidos, conservando la prueba de aviso a 12 V. La prueba genérica de reubicación usa una fixture independiente del nuevo montaje.
- verify-breadboard-lessons: 15 grupos correctos; progreso y mediciones conservados.
- verify-solder-2.2.5: 9 grupos sobre estados independientes, fusión, tubo, reposo y recarga.
- verify-proto-model-2.2.5: 8 grupos de geometría, pares internos, inversión del motor, alimentación y validación.
- verify-solder-touch-2.2.5: arrastre táctil de herramientas, preparación, fundido automático, bloqueo en frío/cambio de copa/repetición/recarga y extracción después de recalentar.
- verify-proto-2.2.5: Chromium/WebKit a 393 y 820 px; alimentación necesaria, corriente del motor al mantener S1/S2, liberación, no apertura de edición, catálogo opcional y diagramas.
- verify-proto-placement-2.2.5: Chromium/WebKit a 393×852, 820×1180 y 852×393. Menú dentro de pantalla, puentes con dos extremos, transistor con un toque y orientación inversa, rechazo de doble pata, pulsador de un toque.
- verify-proto-source-2.2.5: cables positivo y negativo arrastrados de la fuente a la placa con eventos táctiles, L293D gira en ambos sentidos y se detiene sin OUTPUT, móvil/tablet.
- verify-solder-panel-ui: tres conductores soldados/aislados, seis medidas y orden RTU; panel 95–96, 24 V virtuales y rechazo de Ω energizado.
- verify-mobile-lab-2.2.2: selector/arrastre y navegación de soldadura, capa del cable, puntas de temperatura/panel y libreta delante, sin errores de página.

Capturas: qa/solder-2.2.5/tres-conductores.png, fundido-real.png y desoldado.png; qa/proto-2.2.5/menu-*.png, diagrama-1-completo.png y montaje-desktop.png. Navegadores emulados, pendiente aceptación en dispositivo físico del usuario.

## Fuentes revisadas
- Guía F34, páginas 2, 4 y 5, imágenes y texto locales: café pin 1, blanco pin 6 y verde pin 5. Se conserva la discrepancia del rótulo +24 V, no se usa como alimentación del puerto de datos.
- SparkFun, conexiones de protoboard y cuatro patas del pulsador: https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all y https://sik.sparkfun.com/projects/circuit-2b .
- onsemi PN2222A, cara y patillaje: https://www.onsemi.com/pdf/datasheet/pn2222a-d.pdf .
- Texas Instruments L293D, fuente lógica independiente y pines: https://www.ti.com/lit/gpn/L293D .
- Kester, fusión Sn63Pb37 183 °C y SAC305 217–220 °C: https://www.kester.com/knowledge-base/alloy-temperature-chart .
- HAKKO, punta, recubrimiento y mojado: https://www.hakko.com/english/support/maintenance/detail.php?seq=163 .

## Archivos principales
src/lab/CableBench.tsx y soldering/workbench.ts; BreadboardView.tsx, BreadboardSupply.tsx, BreadboardParts.tsx, BreadboardPractice.tsx, CanvasControls.tsx, DiagramViewer.tsx, ClassCircuit.tsx, model.ts, dc.ts, useLaboratory.ts y validation.ts; estilos solder-workshop.css y laboratory-canvas.css; releases.ts y versiones de paquete. Se conserva el resto del árbol de trabajo preexistente.

No se ha afirmado aprobación visual del usuario ni validación de equipos físicos. El hash académico histórico de App.tsx sigue fuera del alcance de estos cambios; no se actualizó para ocultar modificaciones previas.

## Publicación y comprobación pública
Alias público https://modo-lab.vercel.app/ en READY, despliegue final dpl_3rCAhiXMHvrFUz4UFFakUhDZ2Jj1. En el alias se comprobaron versión/rutas, selector y colocación de componentes en seis combinaciones de navegador/tamaño, arrastre de ambos cables de la fuente y L293D en móvil/tablet, soldadura/desoldado táctil completo y arrastre del multímetro del panel. Se verificaron además diagramas vectoriales y conservación del original en Chromium y WebKit. Sin errores de página en esos recorridos.

Los montajes guardados del usuario se conservan. Para usar el ejemplo revisado: Aprender y referencias → Diagramas de la clase → Cargar la Práctica 1 armada (o 2). Crea un proyecto nuevo, evitando sobrescribir el montaje personal.
