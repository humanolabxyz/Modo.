# Etapa 3 · Revisión de consola y capturas para compartir

10 de noviembre de 2026. La aprobación visual sigue pendiente del usuario. No se inició la Etapa 4, no se modificó el render y no se hicieron commits, push ni despliegues.

## Resultado de `Transition was skipped`

**Se reprodujo el mismo mensaje en una compilación anterior a la Etapa 3. No es un problema exclusivo ni una regresión demostrada de esta etapa.**

La reproducción se consiguió al cambiar el viewport de escritorio a móvil durante la navegación Inicio → Agro. El navegador emitió un `AbortError: Transition was skipped` en el documento entrante. La secuencia registrada fue:

1. `pageswap` en Inicio, con transición activa.
2. Cambio del viewport de 1.440 × 900 a 390 × 844 durante la navegación.
3. `pagereveal` en `/agro/`, ya sin transición activa.
4. `unhandledrejection` con el mensaje exacto, sin traza JavaScript.
5. Agro llegó correctamente al lobby.

El texto corresponde a una cancelación nativa de View Transitions en Chromium; no es una excepción del generador del terreno, del cinturón ni de las cámaras. El código de Chromium contiene ese texto en los rechazos de objetos de transición omitida; la especificación también contempla omitir una transición y rechazar su promesa de preparación. Fuentes primarias: [implementación de Chromium](https://chromium.googlesource.com/chromium/src/+/b002f54adddc2f6b2c763c72c9292ee9512e4e8b%5E%21/), [algoritmo de omisión de View Transitions](https://www.w3.org/TR/css-view-transitions-1/#skip-the-view-transition).

La traza no permitió identificar la promesa concreta que Chromium rechazó. En el evento entrante no había `viewTransition` que la aplicación pudiera manejar. Por ello no se atribuye el incidente a una línea concreta del código de la app ni se afirma que el cambio de tamaño fuese necesariamente el disparador de la ejecución original: aquel registro solo conservó el texto del error. Sí se demuestra que el mismo aviso puede aparecer antes de la Etapa 3 bajo esta condición de navegación.

## Comparación anterior / actual

Se reconstruyó localmente el commit `397848e5fde29b82c3c71fd393e5bfe48068b25b`, correspondiente a la Etapa 1 y anterior a las etapas 2 y 3, desde un archivo de Git en una carpeta temporal. No se cambiaron de rama ni se sustituyeron archivos del checkout actual. Se utilizaron las mismas dependencias locales y Chromium 148.0.7778.96 con SwiftShader para mantener comparable el entorno de las pruebas UI.

Se comprobaron también los blobs Git y el texto normalizado: `src/motion/transition.ts`, `src/components/motion/MotionHead.astro` y `src/styles/modo-motion.css` son idénticos en esa revisión y en el checkout actual. Las diferencias de CRLF/LF no se interpretaron como cambios de código.

| Caso | Antes de Etapa 3 | Estado actual |
|---|---:|---:|
| Navegaciones normales, cierre inmediato o tras asentarse | 16, sin errores | 16, sin errores |
| Navegaciones con cambio de tamaño durante la entrada | 8, con 3 avisos | 8, sin errores |
| Total de navegaciones comparativas | 24 | 24 |

Los tres avisos se conservaron en el informe de reproducción. La ausencia de avisos en las ocho repeticiones actuales con cambio de tamaño no significa que el navegador nunca pueda volver a emitirlo: es una condición intermitente de cancelación, no una corrección aplicada al producto.

Una serie adicional de ocho entradas con cambio de tamaño en el build anterior permitió abrir el creador de mundos y volver al lobby en las ocho. Esa serie no emitió el aviso; por tanto, no se presenta como prueba de interacción posterior a un rechazo concreto. Su registro está en `reproduccion-interaccion/diagnostico.json`.

## Efecto para el usuario

En los casos reproducidos, se omite la animación de entrada y Agro abre su lobby. No se observó bloqueo ni una pantalla que quedase inutilizable. La prueba completa del estado actual terminó con **54 bloques aprobados**, incluidos guardar/reabrir, importación/exportación, terreno, conexiones, cultivo, PLC, economía y escritorio/móvil, **sin errores de consola ni respuestas 4xx/5xx**.

La incidencia queda clasificada como una omisión visual preexistente de navegación, sin pérdida de datos observada. La prueba comparativa de navegación por sí sola no comprueba persistencia; esa conclusión funcional se apoya en la suite completa. No se extiende el resultado a Safari ni a teléfonos físicos, que no se probaron en esta revisión.

## Qué cambió y qué no

No se modificaron los archivos del sistema de transiciones ni los del producto Agro. Se conservaron las mejoras de terreno, horizonte, cámaras, V1 y migraciones.

Solo se amplió la observabilidad de las pruebas:

- `qa/verify-agro-ui.cjs` guarda URL, último bloque aprobado, nombre, mensaje, stack y ubicación de los errores de consola. Escribe el informe JSON incluso si una comprobación falla.
- La aserción final de consola permanece intacta. No se añadió ninguna excepción para `Transition was skipped`, no se deshabilitaron las animaciones ni se activó movimiento reducido para hacer pasar la prueba.
- `qa/diagnose-agro-transitions.cjs` registra los eventos de navegación, el estado de la transición y los rechazos sin cancelarlos ni atraparlos. Los errores hacen fallar su comprobación; los datos se escriben antes para facilitar su investigación.

No se añadió un listener global para silenciar `unhandledrejection` ni una reestructuración de las transiciones. Al estar demostrado el caso previo, no procede introducir una corrección de producto como si fuese una regresión del render de la Etapa 3.

## Capturas finales para compartir

Paquete independiente: `modo-agro-etapa3-capturas-finales.zip`, aproximadamente **4,54 MB**.

Contiene doce JPG de 1.440 × 900, dos resúmenes con los seis territorios, `GALERIA.html` para abrir sin conexión, instrucciones breves y un manifiesto de procedencia. Los nombres numerados indican territorio y vista. No incluye código, registros de diagnóstico ni datos de los mundos del usuario.

Las doce imágenes proceden de los PNG finales ya revisados, sin regenerar el paisaje ni cambiar el encuadre. Se verificó el SHA-256 de cada PNG original. Solo se aplicó compresión JPG para facilitar el envío. La galería se abrió en navegador y se comprobó que carga sus doce imágenes con sus dimensiones originales.

Carpeta de entrega:

`C:/Users/HUMANO LAB/.codex/visualizations/2026/11/10/01a1c66a-f292-72a0-a7db-720b23b3c7b2/agro-etapa3-para-compartir/`

ZIP:

`C:/Users/HUMANO LAB/.codex/visualizations/2026/11/10/01a1c66a-f292-72a0-a7db-720b23b3c7b2/modo-agro-etapa3-capturas-finales.zip`

## Referencia que se conserva para la Etapa 6

El análisis de las **1.118 llamadas de dibujo** sigue íntegro en [la revisión visual y de rendimiento](CONSOLIDACION_ETAPA_3_REVISION_VISUAL.md#de-dónde-salen-las-1118-llamadas): 1.061 proceden de las entidades; el cinturón exterior requiere una sola llamada. Incluye desglose por equipos, ablaciones de etiquetas/sombras y prioridades para agrupar geometría, usar instancias entre equipos y simplificar detalles lejanos. Es la referencia que debe utilizarse durante el piloto de modelos de la Etapa 6. No se implementaron nuevas optimizaciones en esta revisión.

## Evidencia y validación

Directorio de diagnóstico:

`C:/Users/HUMANO LAB/.codex/visualizations/2026/11/10/01a1c66a-f292-72a0-a7db-720b23b3c7b2/agro-etapa3-transiciones/`

- `comparacion-transiciones.json`: igualdad de fuentes y blobs anteriores/actuales.
- `actual/diagnostico.json`, `base-etapa1/diagnostico.json`, `confirmacion/diagnostico.json`: navegaciones normales.
- `resize/diagnostico.json`: conserva los tres `AbortError` reproducidos en la compilación anterior.
- `ui-diagnostico/verification.json` y `ui-diagnostico.log`: 54 bloques aprobados y lista de errores vacía en el estado actual.
- `instalacion.log`, `typecheck.log`, `build.log`: instalación, comprobación TypeScript y compilación completadas.
- `git-final.txt`: estado completo al terminar. Rama `agro-consolidacion`, HEAD `397848e`, índice sin archivos preparados. No hubo commit ni push.
