# Taller de tableros de control

Implementación local del 25 de octubre de 2026, sobre el laboratorio existente. Las referencias visuales y técnicas están en `docs/tableros-referencias-2026-10-25/`. No se publicaron fotografías de terceros.

## Cómo entrar

Abrir [Tableros de control](http://127.0.0.1:4325/laboratorio?tool=equipment) en la copia local. También hay un acceso directo en Inicio, conservando las cuatro tarjetas, sus ilustraciones y el carrusel.

Para iniciar la copia compilada sin internet, usar `ABRIR_MODO_SIN_CONEXION.cmd`. El lanzador utiliza `dist/` y conserva la dirección local. Para una nueva preparación del navegador, usar `/sin-conexion/` y esperar «Listo para el viaje».

El botón **Taller de tableros** permite elegir un encargo. Cada elección crea un proyecto nuevo; los proyectos anteriores se conservan.

## Tres perfiles funcionales

| Perfil | Montaje | Función |
|---|---|---|
| Mando cableado | 14 equipos, 29 hilos | Marcha, retención por auxiliar, paro y permisos cableados. |
| PLC industrial genérico | 16 equipos, 36 hilos | Entradas físicas, programa Ladder/ST y salida del controlador hacia el contactor. |
| Relé programable genérico | 16 equipos, 36 hilos | La misma maniobra mediante un perfil de controlador lógico compacto. |

La variante programable no carga un programa automáticamente. El alumno puede cargar explícitamente una guía Ladder/ST o editarlo. El editor completo de PLC utiliza el mismo proyecto y las mismas variables. El botón **PROGRAMAR** está también en el frontal del controlador.

Variables del encargo: I0.0 marcha, I0.1 paro disponible, I0.2 disparo térmico, I0.3 permiso de proceso, Q0.0 orden a contactor. La salida utiliza C1/Q1; el común pasa por paro y el contacto térmico cableado interrumpe la bobina. Esto es una arquitectura de ejercicio, no una validación de seguridad funcional.

## Un gabinete con espacio delimitado

El área útil del modelo es editable. El estudiante decide dónde distribuir rieles, canaletas y componentes dentro de ese límite. Las posiciones sugeridas facilitan empezar y no son posiciones obligatorias.

En **Montar → Definir espacio, rieles y canaletas** se puede:

- Cambiar ancho y alto útiles del modelo.
- Añadir, retirar y modificar posición/longitud de los rieles.
- Añadir, retirar y modificar posición, ancho y alto de canaletas.
- Comprobar equipos fuera del área, cuerpos superpuestos, falta de apoyo sobre rieles e invasión de canaletas.

Cambiar el espacio asignado conserva las posiciones del trabajo; el alumno debe adaptar su distribución. La puerta y el campo son vistas vinculadas al mismo tablero, con sus mandos, alimentación y motor. El PLC se monta dentro de la placa compartida.

Las medidas y huellas son geometría didáctica. Para fabricar un conjunto se necesitan las cotas, fichas, condiciones de proyecto y verificaciones del equipo concreto. No se asignaron medidas de fabricante a estos perfiles genéricos.

## Representación y uso directo

Ilustraciones SVG originales de envolvente con profundidad, placa, bisagras, junta, tornillos, rieles con perfil y perforaciones, canaletas ranuradas, prensaestopas y unión virtual de masas. Carcasas y bornes diferenciados para fuentes, protección, contactor, térmico, PLC/relé, motor, pulsadores, selector y pilotos.

La barra inferior deja visibles **Montar, Cablear, Programar** cuando corresponde, **Verificar, Accionar y Guardar copia**. Al accionar el tablero se opera sobre los objetos:

- Marcha y paro sobre sus pulsadores.
- TEST/RESET del térmico.
- Apertura/cierre del guardamotor.
- Inserción/extracción del portafusible.
- Cambio del permiso B1.

Los toques breves se conservan hasta el siguiente ciclo de simulación, para que una pulsación entre dos ciclos no se pierda. Los mandos del objeto no abren automáticamente el inspector al operarlos.

## Cableado y diagnóstico

Cada hilo conserva extremos, identificación y canalización. Se puede conectar directamente en los bornes o completar un hilo desde la lista. Al seleccionar un cable aparece un punto de guía: arrastrarlo o moverlo con flechas modifica su recorrido y conserva sus conexiones eléctricas. El recorrido se guarda/importa con el proyecto.

Las comprobaciones distinguen montaje, soporte, acceso, conexiones, identificación, protección de masas y coherencia del modelo. La variante programable añade el programa. Las pruebas funcionales ejecutan el mismo cálculo que utiliza el laboratorio: siete condiciones en mando cableado y ocho en los perfiles con controlador.

Los casos incluyen retorno abierto, pérdida de retención, fase abierta y protección PE incompleta. En las variantes programables, el reto de retención se plantea mediante un programa incorrecto. La reparación exige comprobación, hipótesis, corrección y una prueba posterior; la marcha por sí sola no supera la verificación de PE.

Cambiar montaje, conexiones, recorridos, espacio, soportes o programa invalida la prueba guardada. Se puede exportar el proyecto para continuar y un expediente con materiales, conexiones, verificaciones, resultados, notas y reparaciones.

## Integración y conservación

- Se reutilizan catálogo, cálculo eléctrico, PLC Ladder/ST, navegación, almacenamiento, importación y exportación existentes.
- Los formatos anteriores sin datos de gabinete siguen siendo válidos. Los talleres importados se abren en un proyecto propio.
- Las entradas físicas del PLC conservan su imagen de proceso después del programa; el modelo de planta no sobrescribe después esas entradas.
- No se añadieron dependencias ni recursos gráficos de red. La escena de soporte está memorizada y las comprobaciones no se recalculan al panear.
- Se compararon hashes con el estado al iniciar: **351 archivos fuente conservados**, siete existentes modificados de forma prevista y cinco nuevos. Sin cambios fuente inesperados. El inventario del panel anterior pasó su verificación.

Fuentes nuevas: `src/lab/equipment/{cabinet.ts,CabinetScene.tsx,CabinetWorkshop.tsx,IndustrialArt.tsx}` y `src/styles/cabinet.css`. Integración en `EquipmentView.tsx`, modelo/validación de equipos, ciclo del laboratorio y acceso de Inicio.

## Verificación realizada

| Comprobación | Resultado |
|---|---|
| `npm install --no-audit --no-fund` | Correcto, sin nuevas dependencias. |
| `npm run check` y `npm run build` | Correctos. |
| `npm run verify:cabinet` | 24 casos: geometría, persistencia, fallas, Ladder/ST y perfiles de controlador. |
| `npm run verify:cabinet-ui` | 16 comprobaciones del recorrido de mando cableado, exportación y móvil offline. |
| `npm run verify:cabinet-controls` | 14 comprobaciones de mandos en objetos, cable editable, tacto y acciones visibles. |
| `npm run verify:cabinet-plc` | 14 comprobaciones del flujo PLC, programación, reparación, espacio asignado y relé móvil offline. |
| `npm run verify:equipment` | 17 pruebas de los modelos existentes. |
| `npm run verify:equipment-ui` | Catálogo, importación, guardado, variador, solar y móvil, sin errores. |
| `npm run verify:data` | Integridad del inventario actual correcta. |
| `npm run verify:offline` | 22 comprobaciones de la integración: diez herramientas, caché, persistencia, GeoGebra/CAS/3D, PDF/video y reapertura sin red. |

En Chromium local a 1440×960, el tablero con PLC, 16 equipos, 36 hilos y motor activo registró mediana de **16,7 ms** y percentil 95 de **16,8 ms** por cuadro en una muestra de 99 intervalos. Es una medición de escritorio en este equipo; no una garantía de rendimiento en un teléfono físico.

Evidencias en `qa/cabinet/`: informes JSON, comparación de hashes, capturas de escritorio/móvil y expedientes de prueba. Imagen principal: `tablero-plc-final.png`. La publicación pública anterior no forma parte de esta entrega local.
