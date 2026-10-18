# Rendimiento de apertura · modo.

Publicado en https://panellab-inacap.vercel.app/ — producción READY. Despliegue: dpl_98D9fPMXUU43BwDBqQtNfKto2fdF.

## Causa y alcance

La foto mostraba ERR_CONNECTION_TIMED_OUT: una conexión que agotó su espera. No se reprodujo ese fallo en la conexión de verificación y no se atribuye definitivamente a una red concreta. Reducir recursos ayuda a una conexión lenta; no garantiza resolver un corte o bloqueo anterior a la primera visita.

Se encontraron cargas evitables: fuentes grandes, fotografías a tamaño completo en móvil, diagrama/inspector en el código inicial y toda la biblioteca descargada por la PWA al instalarse. Se optimizaron conservando el diseño, los 94 bornes actuales, la simulación y las claves de prácticas/progreso.

## Comparación pública

Misma URL de Vercel, Chromium 390×844, DPR 1, CPU ×4, descarga limitada a 1,6 Mbps, latencia añadida de 150 ms y caché desactivada. Dos muestras por entrada: la tabla muestra promedios, no una medición física del notebook ni una puntuación Lighthouse. Service worker bloqueado para aislar la carga inicial; descarga offline medida por separado con instalación nueva.

| Medida | Antes | Después |
| --- | --- | --- |
| Inicio utilizable | 6.14 s | 4.05 s |
| Descarga inicial · Inicio | 1.14 MB | 0.44 MB |
| LCP · Inicio | 5.50 s | 3.34 s |
| Simulador utilizable | 5.64 s | 3.44 s |
| Descarga inicial · Simulador | 1.25 MB | 0.48 MB |
| LCP · Simulador | 2.59 s | 2.23 s |
| Descarga offline automática, contenido descomprimido | 12.52 MB | 2.74 MB |

La primera muestra de Inicio tardó más que la segunda tanto antes como después. Se conservan todas las muestras y la variación de red en [before.json](qa/performance-opening/before.json) y [after.json](qa/performance-opening/after.json); no se seleccionó solo el mejor resultado.

## Cambios

- Fuentes WOFF2 limitadas a los caracteres de la aplicación y latín, conservando español, pesos, licencia y todos los glifos originales correspondientes. Inter: 352.240 → 105.968 bytes; Source Sans: aproximadamente 109 KB → 31 KB por peso.
- Imágenes de inicio con variantes WebP de 640 y 1024 px y srcset/sizes. Se conservan los originales para pantallas grandes.
- Sin precargas de tipografías innecesarias: CSS solicita las que utiliza la vista.
- Diagrama e inspector cargados al abrirlos; el diagrama conserva el estado al ocultarse. App principal: 258,4 → 175,8 KB sin comprimir. La foto de clase oculta tampoco se solicita al entrar al banco.
- Precache esencial con un máximo de tres descargas simultáneas. PDF e imágenes grandes de estudio se guardan cuando se usan con conexión; toda la biblioteca ya no está disponible offline desde la primera visita.
- Navegación intenta actualizar por red y, si ya hay copia y la red se cuelga, usa esa copia a los 2 segundos. Inicio, Estudio, Laboratorio y documentos tienen claves independientes.
- Promesas de View Transitions canceladas manejadas también en movimiento reducido.

## Verificación

PASS: TypeScript; build local/remoto; inicio en ocho tamaños; cuatro modos del banco; importación y continuación; PWA offline; recorridos; color de cables; laboratorio; gestos móviles; guardado, exportación/importación y cuota agotada del estudio. Inicio y PWA se repitieron en producción. Diez fuentes/variantes comprobadas coinciden byte a byte con las publicadas. No se presentan en bloque como resueltos los fallos de la auditoría histórica: aquí se enumeran las suites ejecutadas.

Servidor real que demora 8 segundos: HTML del banco recuperado en 2041 ms; Estudio 2026 ms; Laboratorio 2025 ms. Luego se comprobaron las tres aplicaciones offline y que un PDF no sustituyera el inicio. [reliability.json](qa/performance-opening/reliability.json).

Con CPU ×4, arrastre: intervalo de fotogramas p95 17 ms; zoom: 33 ms. Hubo tareas largas: no se afirma ausencia total de bloqueos. El contador de renders de desarrollo no está activo en producción y no se usa como métrica comparativa.

## Evidencias y archivos

[Resumen](qa/performance-opening/summary.json), [verificación pública](qa/performance-opening/public-verification.json), [escritorio](qa/performance-opening/public-desktop.png), [móvil](qa/performance-opening/public-mobile.png).

Producción: astro.config.mjs, public/sw.js, cuatro fuentes, seis WebP, Home.tsx, HomeTools.tsx, App.tsx, DiagramPane.tsx, MotionHead.astro, transition.ts e index.astro. Copias anteriores y herramientas bajo qa/performance-opening, excluidas de Vercel. verify-modo.cjs mantiene las aserciones y espera a que termine la transición antes de capturar/medir.

Referencia: [mediciones en Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/reference/).
