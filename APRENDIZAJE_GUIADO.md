# PanelLab — diagrama y práctica de montaje

Implementado el 14 de octubre de 2026 sobre el proyecto Astro/React existente. Todo funciona localmente. No se desplegó ni se modificaron los HTML autónomos aprobados. Respaldo de las fuentes anteriores: `qa/aprendizaje/antes-actualizacion.zip`.

## Cómo usarlo

1. Abre `ABRIR_PANELLAB_ACTUAL.cmd` o entra en http://127.0.0.1:4322/ con el servidor local activo.
2. En Banco pulsa **Abrir diagrama → PERFECTO · CADe → Aprender a conectar**. Sin selección previa, comienza con los puentes identificados del motor (línea original 77). Si seleccionaste otra línea, conserva esa selección.
3. Cambia entre **Interpretar**, **Identificar** y **Conectar**. El último nivel muestra una banana translúcida entre los bornes conocidos. La silueta no se instala ni une nodos.
4. Conecta por tu cuenta. Puedes construir una red con otro orden o con otro borne compartido. Una conexión reconocida colorea el recorrido del esquema; la siguiente silueta aparece cuando corresponde otro puente.
5. **Anterior** y **Siguiente / Revisar siguiente** permiten recorrer las 47 líneas. No borran cables. Retira una conexión para repetirla; Deshacer la recupera.
6. **Ampliar diagrama / Volver al banco** conserva el ejercicio y el cableado. Cerrar el diagrama recupera el banco completo. En móvil se distribuyen diagrama y banco verticalmente; la guía se puede plegar para leer y conectar.

Siguen disponibles **Guía interactiva**, **Mi diagrama**, trazado de líneas y zonas, pasos personales revisados, los nueve retos de reconocimiento, búsqueda, inspector, colores y curvas de los cables, filtros, herramientas, zoom/pan, bornes compartidos, historial y copias JSON.

Al cambiar de material se suspende la ayuda visual de PERFECTO. Volver a PERFECTO recupera su línea, nivel y progreso; la ayuda no se superpone a una imagen de otro circuito.

## Comprobación y ayudas

- La guía comprueba cada cable agregado. Si une redes distintas, lo destaca en rojo durante 3,5 segundos y lo conserva para corregirlo. No eleva la ayuda automáticamente ni entrega la respuesta del error.
- Los niveles se pueden cambiar sin reiniciar. La pista progresiva pasa de componente a bornes y silueta. Los enlaces a bornes físicos no revelan la respuesta en los niveles iniciales de la guía.
- La práctica libre comprueba a demanda y ofrece recorrido de la línea seleccionada. Seleccionar un borne identificado también resalta sus líneas del esquema.
- El examen oculta siluetas, ayudas, correspondencias y resultados mientras se trabaja. Al finalizar presenta cables correctos, ajenos al ejercicio, desconocidos, posibles cortocircuitos y conexiones faltantes comprobables. Incluye cuatro preguntas abiertas con respuestas guardadas para autoestudio; no se califican automáticamente.
- Las conexiones transitivas y otras distribuciones equivalentes se aceptan. Una rama desconocida impide certificar una red completa. Una rama incorrecta invalida su avance hasta corregirla.
- La advertencia de posible cortocircuito solo aparece cuando cables explícitos unen potenciales diferentes del esquema cuyas correspondencias se registraron. No se deduce tensión de los colores o del nombre F del panel.
- Los contactos, bobinas, pilotos y motores no se unen internamente ni se simula energización.

## Correspondencias disponibles y pendiente real

Las **47 líneas** se reutilizan íntegramente y forman **20 redes de conductores**, considerando las referencias/bornes repetidos entre mando y potencia. Los cruces sin unión no conectan nodos.

PERFECTO contiene **51 referencias de borne únicas**. Se reutilizan **18 correspondencias**: seis bornes del motor, 95/96/97/98 del térmico, A1/A2 y 13/14 de KM1, y la traducción 11→71 / 12→72 confirmada por el usuario, más SB2:13/14→S3:3/4 del verde derecho confirmado. KM1 es el contactor con térmico y KM2 el contactor solo. Esto permite practicar inmediatamente los dos puentes del punto común del motor. Estas correspondencias son de etiqueta, no una certificación docente del montaje.

Las otras **33 correspondencias siguen pendientes**: traducción de numeraciones de los pulsadores y polos de fuerza, Q, alimentación, PE y conexiones de los pilotos, entre otras. Hay elementos o extremos que no están expuestos/modelados como bornes independientes en el banco. No se fuerza una asociación para completar el ejercicio.

En **Correspondencias del esquema con el banco** aparecen las referencias extraídas del archivo original. Solo se elige el borne físico que se haya revisado; no hay que volver a dibujar ni registrar las 47 líneas. La revisión personal se guarda y se incluye en la exportación. Sin información suficiente, se muestra pendiente o sin información y no se califica arbitrariamente.

Por tanto, el flujo de montaje está implementado, pero **la evaluación física completa de PERFECTO requiere confirmar las correspondencias restantes con el banco y la documentación docente; además, la captura de la prueba difiere de PERFECTO en las redes de F:97 y KM1:11 y en los nombres de los pilotos**. Tampoco se incorpora simulación de contactos, temporización, potencia o dimensionamiento.

## Verificación

`npm install`, `npm run check`, `npm run build`, `verify:data`, `verify:wiring`, `verify:ui`, `verify:practice`, `verify:reading`, `verify:cade`, `verify:canvas`, `verify:learning` y `verify:learning-ui` pasaron. Las regresiones de interfaz se ejecutaron contra el servidor de desarrollo local; el recorrido nuevo también pasó sobre el build servido en 4322.

Se comprobaron los 108 bornes por clic, los siete módulos, las 47 líneas por clic, los ejercicios de lectura, imágenes propias, persistencia, importaciones inválidas, curvas, historial, tres ayudas, equivalencias, errores corregibles, examen y tacto real emulado. La silueta permanece alineada después de zoom/pan y no intercepta bornes. Tamaños: 1920, 1440, 768, 390 y 360 px, sin desbordamiento horizontal. Sin excepciones ni errores de consola en los recorridos registrados.

Evidencia nueva: `qa/aprendizaje/model-verification.json`, `qa/aprendizaje/ui-verification.json`, `silueta-desktop.png`, `silueta-mobile.png`, `puentes-desktop.png` y `puentes-mobile.png`. Comparación del banco: `qa/aprendizaje/antes-banco-desktop.png` frente a `qa/lienzo/banco-desktop.png`; ambas capturas son de 1440 × 1000.

`npm install` terminó correctamente y reportó tres avisos de dependencias (bajo, alto y crítico). No se aplicó una actualización forzada del stack; esa actualización queda separada de esta mejora.

## Archivos

Nuevos: `src/data/learning.ts`, `src/components/ConnectionLesson.tsx`, `src/styles/learning.css`, las dos pruebas `qa/verify-learning*` y este documento. Integración: `App.tsx`, `DiagramPane.tsx`, `CadeDiagram.tsx`, `Board.tsx`, `WireLayer.tsx`, los tipos/importación de prácticas, `index.astro`, scripts de `package.json` y pruebas anteriores adaptadas a la navegación integrada. No se añadieron dependencias de aplicación.

## Actualización de recorridos

Ver `RECORRIDOS_CADE.md`: selección automática con todos los ramales identificados, acción fija, correspondencias visibles por red y dos bornes adicionales 95/96 en KM2. Inventario actual: 110 (108 originales más dos correcciones del usuario).
