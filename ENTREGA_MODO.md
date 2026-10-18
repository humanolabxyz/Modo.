# modo. · Actualización local de identidad e inicio

15 de octubre de 2026. Proyecto existente: Astro + React + TypeScript.

## Abrir y utilizar

Doble clic en `../ABRIR_MODO.cmd` o en `ABRIR_MODO.cmd` dentro del proyecto. También sigue disponible el acceso anterior. El servidor utiliza localhost; la dirección comprobada es http://127.0.0.1:4322/.

- **Abrir panel de control:** conserva los cuatro modos de aprendizaje y el diagrama opcional.
- **Estudiar protecciones:** abre el estudio existente, con su progreso y sus ejercicios.
- **Tu laboratorio:** abre el laboratorio existente. Esquemas, PLC, HMI, Procesos y Protoboard mantienen sus rutas directas.
- **Continuar / Abrir práctica guardada:** recupera el trabajo del navegador o importa los JSON anteriores.

No se publicó ni desplegó la aplicación.

## Diseño e identidad

Se revisó el ZIP suministrado y se utilizaron sus referencias de escritorio y móvil como guía de composición. Las instrucciones incluidas en el kit se trataron como documentación de integración; el alcance aplicado es el solicitado por el usuario, incluida la generación de imágenes faltantes.

El inicio conserva el panel como tarjeta principal, Protecciones y Laboratorio en la columna lateral y la práctica reciente en la fila inferior. En móvil se apilan las tarjetas con separación de 16 px, bordes visibles, título en dos líneas y controles de al menos 44 px. El botón principal ocupa todo el ancho disponible. La importación permanece accesible también en móvil.

La cabecera conserva los controles reales de Simulador y ayuda. No se agregó el perfil personal ilustrativo de la referencia porque la aplicación no tiene cuentas ni autenticación.

Se integraron los SVG originales del kit, favicon, iconos Apple/PWA y variantes maskable. La marca anterior se reemplazó en las superficies visibles, títulos, ayudas, instrumentos y nombres de exportación. Se conservaron las claves internas y formatos antiguos por compatibilidad. El inicio usa Inter local con su licencia; el resto de la aplicación conserva su tipografía y estilos operativos.

## Assets generados

Herramienta: **image_gen integrada**, sin CLI ni API externa adicional. Se generaron tres fotografías ilustrativas con luz suave, reflejos cálidos, sombras frías y acentos rojos, azules y verde petróleo. No representan fotografías verificadas del equipo físico ni sustituyen el material técnico.

| Archivo de producción | Contenido | Tamaño aproximado |
| --- | --- | --- |
| `public/images/modo/bornes.webp` | Acercamiento a bornes banana y conexiones; sin panel completo | 97 KB |
| `public/images/modo/protecciones.webp` | Protecciones DIN con palancas rojas y negras | 131 KB |
| `public/images/modo/laboratorio.webp` | PLC, conexiones y pantalla de proceso | 130 KB |

Los originales se guardaron en `qa/modo/*-original.png`; los prompts completos y el modo de generación están en [image-generation.json](qa/modo/image-generation.json). Los WebP y la fuente se sirven localmente y forman parte del precache de producción.

## Archivos

- Inicio: `src/components/Home.tsx`, `src/lab/HomeTools.tsx`, `src/styles/modo-home.css`.
- Marca compartida: `src/components/LogoModo.tsx`, `src/styles/modo-brand.css`, `src/styles/modo-tokens.css`, `public/brand/`, `public/icons/`, `public/fonts/InterVariable.woff2`, `public/fonts/INTER-LICENSE.txt`.
- Integración: cabeceras de `App.tsx`, `StudyApp.tsx`, `LaboratoryApp.tsx`; metadatos de las tres páginas Astro; `public/manifest.webmanifest`.
- Textos de marca: `TeacherMaterial.tsx`, `MeterInstrument.tsx`, `HMIView.tsx`, `SchematicView.tsx`, mensajes de `validation.ts`, nombres de exportación en `useLaboratory.ts`, `scripts/open-local.mjs`.
- Accesos: `ABRIR_MODO.cmd` en el proyecto y en la carpeta superior.
- Verificación: `qa/verify-modo.cjs`, `qa/verify-modo-preservation.mjs`, scripts npm correspondientes y adaptación de selectores de pruebas a las etiquetas actuales.

## Preservación y cambios simultáneos

El inventario actual se verificó: seis módulos activos y 94 bornes, con los terminales retirados archivados por el proyecto previo. No se restauró ni cambió el inventario basándose en documentación antigua.

Los datos del panel, cableado, modelos eléctricos, hooks de prácticas, esquemas de proyecto, contenido docente y corrección conservan sus hashes originales. Las modificaciones propias en archivos operativos son de presentación y textos de marca. Las claves de localStorage, los formatos JSON y la compatibilidad de importación no cambiaron.

Durante el trabajo se detectaron ediciones simultáneas ajenas a esta actualización en los controles/menús del panel y laboratorio, calculadora y sus estilos. Se conservaron. Los archivos compartidos `App.tsx` y `LaboratoryApp.tsx` incluyen tanto nuestra integración de marca como esas ediciones. [preservation.json](qa/modo/preservation.json) y [concurrent-changes.json](qa/modo/concurrent-changes.json) distinguen ambos alcances; no afirman que esos archivos compartidos completos permanezcan intactos. Se verificó el estado integrado mediante las pruebas de navegador.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- Integridad de datos, cableado, aprendizaje, simulación y laboratorio. Laboratorio: 38 comprobaciones del modelo.
- Prácticas: cableado compartido, edición, deshacer/rehacer, reconocimiento, imágenes, persistencia, exportación/importación y rechazo de archivos inválidos.
- Estudio: teclado/tacto, progreso, exportación/importación, reinicio, aislamiento del guardado del panel, aviso por cuota de almacenamiento y separación de páginas offline.
- Interfaz del laboratorio: herramientas, componentes, valores, multímetro, arrastre, zoom, PLC, HMI, Procesos y móvil.
- PWA: manifest, iconos, service worker y arranque sin conexión.
- Inicio: cuatro modos del panel, cinco accesos del laboratorio, ayuda, continuación e importación antigua, marcas, imágenes y recursos sin errores de consola.
- Responsive: 360×780, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1672×941 y 1920×1080; sin desbordamiento horizontal.

Evidencia del inicio: [verification.json](qa/modo/verification.json). Verificación local final: servidor original en el puerto 4322 con hidratación y apertura del panel funcionando.

Las pruebas móviles utilizan Chromium con tamaños y entrada táctil emulados; no equivalen a una prueba física en un teléfono ni a comprobar el icono instalado en iOS/Android. La aprobación visual final del usuario queda abierta. `npm install` también informó tres vulnerabilidades en dependencias existentes; no se realizaron actualizaciones mayores ajenas al cambio de identidad.

## Capturas para comparar

| Versión | Antes | Resultado |
| --- | --- | --- |
| Escritorio | [Inicio anterior](qa/modo/before/desktop.png) | [Inicio modo. 1672×941](qa/modo/inicio-1672x941.png) |
| Móvil | [Inicio anterior](qa/modo/before/mobile.png) | [Inicio modo. 390×844](qa/modo/inicio-390x844.png) |

Referencias aprobadas originales: `qa/modo/kit/modo_kit_marca/06_referencias/`. También se conservaron las capturas de los otros seis tamaños, el diagrama opcional abierto y las pantallas de los módulos.

Las capturas finales esperan la carga de la fuente y la decodificación de todas las imágenes, evitando comparaciones con fotografías aún pendientes de pintar.

Para repetir las comprobaciones del inicio con un preview local:

```powershell
npm run build
npm run preview -- --port 4325
# En otra terminal de la misma carpeta:
$env:PANELLAB_URL = 'http://127.0.0.1:4325/'
npm run verify:modo
npm run verify:modo-preservation
```

La verificación de preservación utiliza la instantánea de cambios simultáneos observada durante esta entrega; si esos archivos vuelven a cambiar, lo informa explícitamente.
