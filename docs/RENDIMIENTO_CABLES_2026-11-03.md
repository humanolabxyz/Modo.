# Rendimiento con cableado en PanelLab

En el panel, los cables energizados conservan el resaltado amarillo y el trazo punteado fijo. A partir de 17 conexiones, los cables muestran menos capas de sombra y brillo. El cable seleccionado recupera el detalle completo y las clavijas conservan su forma. El rotor deja de girar visualmente durante un gesto de cámara y retoma la animación al terminar.

El panel reutiliza el resultado lógico mientras coincidan los cables, los interruptores, los contactos, los relés, los temporizadores y las fallas resueltas. La corriente, el giro y el calentamiento siguen calculándose en cada paso. Los módulos SVG que mantienen el mismo estado evitan redibujarse por los cambios del reloj.

En robótica, las curvas de los cables actualizan los mismos buffers gráficos cuando cambian de forma. El tubo visible usa 24 segmentos longitudinales y 6 radiales. El volumen invisible mantiene la selección del cable. En el robot de orugas se midieron 128.776 triángulos por cuadro en marcha frente a 143.336 antes de este cambio.

| Prueba de Chromium con CPU limitada 4× | Cuadro p95 | Tareas de 50 ms o más |
| --- | ---: | ---: |
| Panel estrella-triángulo en desarrollo, antes | 133 ms | 23 |
| Panel estrella-triángulo en desarrollo, optimizado | 100 ms | 34 |
| Compilación local, 41 cables, escritorio Retina | 33 ms | 0 |
| Compilación local, 123 cables, escritorio Retina | 50 ms | 1 |

La comparación en desarrollo usa la misma escena de 820 px. Las muestras de densidad duran cuatro segundos y usan un escritorio de 1440 × 900 a escala 2. Los 123 cables se obtienen triplicando las conexiones del mismo ejemplo para someter a carga el dibujo y el grafo. La validación en Safari o Chrome del Mac A1707 está pendiente.

Las pruebas verifican 192 combinaciones del circuito con y sin caché, 100 cambios de forma de un cable 3D sobre los mismos buffers y selección de cables en paneles densos. El cableado de robótica se probó en escritorio, tablet y teléfono con edición, movimiento de piezas, deshacer y recarga. Pasaron TypeScript, la compilación estática y las pruebas de fallas y de tierra de protección.

La prueba de animaciones completó el arranque estrella-triángulo, la pausa visual durante el paneo y el giro inverso del panel. La sección posterior del multímetro de protoboard quedó pendiente porque el navegador no encontró el control «Poner las puntas en».

- [Panel antes](../qa/performance-simulation/cables-before/panel-running-820.png) y [panel optimizado](../qa/performance-simulation/cables-production/panel-running-820.png)
- [Panel con 123 cables](../qa/cable-performance-2026-11-03/panel-123-cables.png) y [muestras de densidad](../qa/cable-performance-2026-11-03/density.json)
- [Robótica en escritorio](../qa/robotics-performance/cables-desktop-framed.png) y [robótica en móvil](../qa/robotics-performance/cables-mobile.png)
