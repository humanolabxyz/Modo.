# Inicio replanteado · 18 de octubre de 2026

Inicio centrado en elegir un espacio: Panel de control, Estudio o Laboratorio. Se conserva el estilo blanco, gris y negro y se eliminan los accesos principales duplicados y el catálogo de herramientas de la portada. Las herramientas siguen en Laboratorio. Comunidad, importación, instalación y créditos se conservan como utilidades secundarias.

El Panel de control revela su configuración al elegirlo: cuatro modos y diagrama opcional, con foco en el encabezado y botón para cerrar que devuelve el foco al acceso. Los callbacks de abrir, continuar e importar son los existentes. El acceso del panel espera a que la práctica esté cargada, igual que el botón de apertura, para evitar actuar durante la hidratación.

Si el documento tiene cables, pasos, aprendizaje o evaluación, se muestra «Tu práctica actual» antes de los tres espacios. Sin trabajo guardado no se inventa una última sesión. Al continuar se conserva el documento.

## Responsive

PC y tablet horizontal: tres columnas a partir del ancho disponible. Tablet vertical hasta 1100 px: filas amplias con icono, descripción y acción. Móvil: una columna; selects de 16 px para evitar zoom al editar y controles cómodos para tocar. No hay funciones exclusivas de hover.

## Archivos de esta mejora

- src/components/Home.tsx: estructura y estado local de la configuración.
- src/styles/modo-launchpad.css: estilos del nuevo inicio, aislados de las demás interfaces.
- qa/verify-launchpad.cjs: navegación, teclados, importación, persistencia y capturas.
- qa/audit-text-contrast.cjs: selector de disponibilidad compatible con el nuevo inicio.

El resto de TS/TSX/JSON en src mantiene su hash respecto del comienzo de este cambio, incluidos App, Board, modelos, contenido de estudio y laboratorio. Baseline: qa/inicio-replanteado/protected-hashes.json. Respaldo de Home: qa/inicio-replanteado/Home.before.tsx.

## Validación

npm install --ignore-scripts --no-audit --no-fund; npm run check; npm run build. qa/verify-launchpad.cjs verifica 360×800, 390×844, 768×1024, 820×1180, 1024×1366, 1024×768, 1180×820, 1440×960 y 1920×1080. Comprueba ausencia de overflow, configuración oculta al entrar, cuatro modos, foco al abrir/cerrar, destinos, importación con cables y continuación sin reemplazar el documento.

La auditoría de contraste conserva cero textos marcados en las dieciséis rutas visitadas a 1440 px; es una revisión de los estados muestreados, no una certificación completa. Las pruebas históricas verify-home-refinement y los checks de inicio de verify-soft-ui describen la portada anterior y no se presentan como validación de esta estructura. La nueva prueba usa el diseño expresamente aprobado en esta conversación.

Capturas: qa/inicio-replanteado/inicio-*.png y configuracion-*.png; práctica guardada: practica-guardada-390.png. Reporte: verification.json. Vista local: http://127.0.0.1:4344/. No se ha desplegado.


## Ajuste técnico y recuperación del neomorfismo

Se sustituye la cabecera informal por «Laboratorio de control eléctrico». Se incorporan las tres fotografías de detalle ya disponibles en public/images/modo: bornes, protecciones y laboratorio, con variantes WebP responsivas. No se presentan como fotografías verificadas del equipo del usuario. Los accesos conservan sus funciones y ahora usan descripciones técnicas.

Se recuperan superficies en relieve con sombras claras y oscuras, controles elevados y selectores hundidos. Se mantienen el negro como acento, un fondo mineral común, imágenes visibles y radios más contenidos. PC usa fotografías horizontales; tablet vertical y móvil las muestran junto al texto.

La prueba de los nueve formatos vuelve a pasar, incluyendo cuatro modos, destinos, importación y continuación intacta. Cambios limitados a Home.tsx y modo-launchpad.css.


## Fotografías integradas al botón

Se elimina el recuadro independiente de las fotografías. Las imágenes ahora forman parte del fondo de cada acceso, con una máscara gradual y color contenido; los iconos y controles mantienen el relieve neomórfico. Se conservan los textos técnicos, los tres destinos, la configuración progresiva y las variantes de PC, móvil y tablet. Cambio limitado a modo-launchpad.css. verify-launchpad.cjs vuelve a pasar en nueve formatos, con importación y continuación intactas.


## Rollover de cada acceso

Al mantener el cursor sobre un acceso, la misma caja crece con el borde redondeado y relieve del botón original. La ampliación muestra una captura de la interfaz real de Panel, Estudio o Laboratorio, una descripción breve, tres funciones y un acceso para entrar. No se transforma en una barra de pestañas. Las vistas previas son imágenes locales de las interfaces, no simuladores activos embebidos ni datos en directo.

En móvil y tablet táctil se abre mediante el icono de información y sustituye el acceso en su lugar. El botón de acceso normal sigue abriendo la sección directamente. El cierre y Escape restauran las cajas; las preferencias de movimiento reducido desactivan la animación. Una espera de 140 ms evita que el rollover intercepte los clics rápidos.

Archivos: Home.tsx, modo-launchpad.css y public/images/preview-home/{panel,study,lab}.jpg. qa/capture-home-previews.cjs permite regenerar las capturas del sitio local. qa/verify-home-previews.cjs comprueba la ampliación, forma, imágenes y cierre en tres tamaños de PC, apertura táctil en móvil/tablet vertical/horizontal y animación normal. Reporte y capturas en qa/inicio-rollover/. verify-launchpad.cjs mantiene sus nueve formatos y verificaciones de navegación, modos, importación y práctica guardada. check y build correctos. Sin despliegue.


## Transiciones de apertura, regreso y cambio

Se conserva el despliegue aprobado. La entrada dura 360 ms con fundido y escala leve; el regreso dura 260 ms. La caja saliente permanece montada hasta completar la animación y se marca inert/aria-hidden para impedir interacción duplicada. Al pasar a otra sección se cruzan ambas transiciones. Cada salida tiene un temporizador cancelable; reabrir la misma sección cancela su eliminación pendiente, y desmontar el inicio limpia los temporizadores. Movimiento reducido mantiene los cambios inmediatos.

qa/verify-home-preview-motion.cjs comprueba el estado saliente, la opacidad intermedia del cierre, el cambio entre secciones, la eliminación completa de las cajas, movimiento reducido y cierre táctil. Reporte: qa/inicio-rollover/motion-verification.json. check y build correctos; la prueba de previews mantiene los casos de PC, móvil y tablet.


## Entrada directa y botones táctiles

En móvil y tablet táctil, tocar cualquiera de los tres accesos despliega su vista previa. La vista tiene un botón o enlace real y visible: Entrar al panel, Entrar a Estudio y Entrar al laboratorio. La imagen y la descripción ya no actúan como enlaces. Se elimina la configuración del Panel en el inicio y sus selectores de modo/diagrama.

La entrada al Panel, Continuar práctica y el acceso rápido Simulador usan enterFreePanel: detienen la simulación y entran en modo libre. Se conservan cables, diagrama, pasos, título y módulos. Si había un modo guiado o una evaluación activa, el cambio a libre se registra mediante commit; Deshacer recupera el estado anterior. Las opciones internas del simulador y los formatos de importación no cambian.

Archivos: Home.tsx, App.tsx y modo-launchpad.css. qa/verify-direct-entry.cjs verifica los tres destinos a 390×844, 820×1180, 1180×820 y 1440×960; exige botones de al menos 44 px, ausencia del selector y desbordamientos, modo libre, conservación del circuito y recuperación del modo anterior con Deshacer. También comprueba Continuar y Simulador. Modelos, banco, herramientas y contenidos conservan los hashes tomados al comienzo de este ajuste. Respaldos y reporte en qa/entrada-directa/.

qa/verify-home-preview-motion.cjs mantiene aprobadas las aperturas, regresos y cambios, tanto normales como con movimiento reducido. check y build correctos. Las pruebas históricas que esperan cuatro modos en la portada describen el flujo anterior y se sustituyen para este cambio por verify-direct-entry.cjs.

### Tarjeta original oculta durante la vista ampliada
- La tarjeta original se oculta al abrir su vista ampliada, tanto con mouse como con tacto; reaparece al cerrar. Se conserva su espacio para evitar saltos de las otras secciones.
- En pantallas táctiles la vista ampliada se superpone con el mismo relieve soft UI, ancho adaptado y desplazamiento interno si la altura es limitada. Incluye Entrar y cierre de 44 px.
- Cambios: src/styles/modo-launchpad.css. Respaldo: qa/entrada-directa/modo-launchpad.before-touch.css.
- Verificación: qa/verify-touch-card-overlay.cjs en 390x844, 820x1180, 1180x820 y 844x390; qa/verify-home-preview-motion.cjs, npm run check y npm run build correctos. Captura: qa/entrada-directa/touch-overlay-390.png. Trabajo local, sin despliegue.
