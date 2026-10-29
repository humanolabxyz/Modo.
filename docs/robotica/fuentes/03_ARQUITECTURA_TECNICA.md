# modo. Robótica — Arquitectura técnica propuesta para investigar

## Premisa
Este documento fija **contratos y preguntas**, no obliga a adoptar bibliotecas sin comparar con el repositorio. La auditoría de Codex informa que las herramientas actuales tienen motores especializados separados, que el ciclo principal es de 100 ms y que la protoboard tiene componentes descritos principalmente con `from/to`. Por tanto, la nueva robótica debe modelar instancias, pines, tiempo y conexiones independientes del renderizado.

## Modelo canónico sugerido
`RobotProject` versionado:
- `parts[]`: `instanceId`, `componentDefinitionId`, `transform` (posición/rotación/escala válida), propiedades físicas, propiedades visuales.
- `attachments[]`: uniones rígidas y articuladas, referencias a instancias, límites/ejes, anclajes si corresponden.
- `connections[]`: par de extremos (`instanceId`, `pinId`), propiedades eléctricas, color/ruta 3D solo como presentación; identificador persistente.
- `firmware[]`: placa destino, sketch, estado de compilación, configuración y artefactos derivados regenerables.
- `scene`: obstáculos, iluminación fija, suelo, ajustes de física/cámara de simulación.
- `workspace`: cámara de construcción, ventanas/disposición si procede y selección transitoria (no todo necesita persistir).
- esquema versionado y migraciones, sin romper `.modo.json` anteriores.

## Separación de responsabilidades
- **Catálogo**: metadata de piezas, modelos GLB/GLTF/licencias, geometría de colisión, ubicaciones físicas de terminales, magnitudes eléctricas, límites y anclajes.
- **Editor 3D**: escena, picking, gizmos, orbitación, transformaciones, snapping, cables visibles.
- **Ensamblaje**: restricciones, relaciones parentales, uniones/rigidez/articulaciones, detección de intersecciones de montaje.
- **Grafo eléctrico**: conectividad pin a pin, alimentación, niveles, mediciones y fallos; adaptar desde motores existentes donde sea seguro.
- **MCU runtime**: compilación/ejecución o emulación AVR con reloj y periféricos necesarios; aislar del hilo UI. Evaluar si ejecución offline es posible y qué funciones están soportadas.
- **Motor físico**: cuerpos rígidos, joints de ruedas, contacto, gravedad, velocidades, colisiones y sensores vinculados a escena.
- **Coordinador de simulación**: sincroniza señales y avance del tiempo entre MCU, electrónica y física, sin forzar todas las operaciones a los ticks de 100 ms.
- **UI**: reutilizar gestor de ventanas de Panel de control, el sistema de proyectos y estilos actuales.

## Tecnologías candidatas a verificar (no decisiones cerradas)
- Three.js + React Three Fiber para escena y controles 3D.
- Rapier para física rígida y articulaciones; analizar coste de render/simulación.
- AVR8js u otro runtime para UNO R3; verificar estado, soporte periférico/timers, compilación, bibliotecas, sandbox y funcionamiento offline.
- GLTF/GLB para assets; verificar pipeline, formatos, licencia y peso.

Codex debe comprobar versiones exactas, compatibilidad con React/Astro existentes, distribución, licencias, riesgos y alternativas. Mostrar pruebas pequeñas antes de comprometer la elección.

## Precisión y calidad
- Definir qué se simula físicamente y qué es aproximación. Una colisión física no convierte automáticamente todos los motores en modelos eléctricos precisos.
- Motor DC con torque/velocidad/carga de forma progresiva; puente L298N con entradas, enable, límites, alimentación y dirección. Distinguir chip y placa comercial.
- HC-SR04: distancia desde pose del sensor en el escenario, respuesta TRIG/ECHO representada con tiempo coherente. Definir alcance, cono y superficies compatibles.
- PWM y temporización deben tener un clock fino/controlado por el coordinador; los ticks didácticos existentes no deben limitar el runtime nuevo.
- Pruebas de invariantes: un pin desconectado no propaga señal, dos instancias idénticas no mezclan conexiones, quitar un componente rompe su unión, invertir motor cambia comportamiento, programa modificado cambia control, guardar/abrir conserva proyecto.

## Rendimiento y seguridad
- Separar render de simulación; evitar bloquear la UI por programas del usuario; limitar ejecución/tiempo/memoria.
- Manejar contexto WebGL perdido, escenas pesadas y dispositivos sin GPU suficiente.
- Guardar sin introducir incompatibilidad en proyectos existentes. Validar entradas importadas y fallos de carga.
- Versionar assets y registrar procedencia/licencias de modelos 3D; no tomar geometría o marcas sin permiso.

## Tareas de investigación prioritarias
1. Encontrar gestor de ventanas de Panel de control y rutas de integración mínimas.
2. Encontrar sistema de proyectos y migraciones `.modo.json`.
3. Verificar motor de protoboard, grafo eléctrico, mediciones y reutilización.
4. Probar prototipo aislado de escena 3D + picking + gizmo + ventana flotante.
5. Probar latencia/temporización y factibilidad real de compilar/emular UNO.
6. Probar motor físico de rueda/colisión y vínculo sensor a escena.
7. Definir contratos entre motores y pruebas automáticas para cada uno.
