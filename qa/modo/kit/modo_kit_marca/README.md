# modo. — Kit de identidad y aplicación (v1.0)

**Concepto aprobado:** logotipo «modo.» en minúsculas + punto verde y rayo dividido en dos piezas, sobre una interfaz blanca/negra con acento verde discreto.

## Carpetas
- `01_svg_vector/` SVG transparentes, escalables. Incluye logo horizontal, vertical, tipográfico e isotipo en negro, blanco y un color.
- `02_png_transparente/` PNG con canal alfa; el nombre indica el ancho de exportación.
- `03_iconos_app/` iconos para favicon, PWA, móvil y versión maskable. Las esquinas de iconos regulares son transparentes.
- `04_implementacion/` CSS variables, JSON tokens, ejemplo Astro/React, manifest y enlaces para `<head>`.
- `05_guia/` PDF de normas básicas y lámina visual.
- `06_referencias/` capturas aprobadas para facilitar la comparación de diseño.
- `07_public_brand_copiar/` todos los assets necesarios para copiar directamente a `public/brand/`.

## Cuál usar
1. Header blanco: `modo-logo-horizontal-color.svg` (altura sugerida 28–36px en escritorio; 26–32px móvil).
2. Header oscuro: `modo-logo-horizontal-blanco.svg`. El punto se conserva verde.
3. Botones y badges: isotipo negro o blanco, según el contraste.
4. Avatar/icono de aplicación: `modo-app-oscuro.svg` o PNG, con el icono blanco sobre base negra.
5. Favicon clásico: `favicon.ico` y `modo-app-oscuro.svg`.
6. App instalada / PWA: `icono-app-192.png`, `icono-app-512.png`, y los correspondientes `icono-maskable-*`.
7. Publicaciones y papelería monocromática: variantes terminadas en `negro` o `blanco-mono` (sin acento verde).

## Normas básicas
- No estirar, inclinar, rotar ni añadir sombras o biseles al logo.
- No colocar el logo negro directamente encima de fotografías oscuras. Usar el blanco o una superficie de apoyo.
- Mantener como margen de protección al menos la mitad de la altura del rayo a cada lado.
- No utilizar el punto verde como un elemento UI omnipresente. Es un acento distintivo.
- Utilizar fondo blanco o gris claro y controles con contraste alto; el color de fotos y diagramas aporta riqueza sin competir con la identidad.
- Los SVG son trazados independientes del sistema tipográfico del computador: no requieren instalar una fuente para verse correctos.

## Integración sugerida en Astro
1. Copiar `01_svg_vector/*.svg` y `03_iconos_app/*` a `public/brand/`.
2. Copiar `manifest.webmanifest` a `public/`.
3. Importar `modo-tokens.css` a la hoja global.
4. Usar el componente `LogoModo.astro` en header / login / shell.
5. Insertar en `<head>` los enlaces de `integracion-head.html` (adaptar las rutas si hace falta).

## Aclaración técnica
Es una **reconstrucción vectorial limpia a partir de la referencia visual aprobada en el chat**; no una extracción de capas originales editables del generador de imágenes. Permite aplicaciones reales y escalables, pero se debe revisar el ajuste fino contra la marca aprobada antes de una liberación pública.

**Uso comercial**: no se ha verificado el registro o disponibilidad del nombre «modo.» en Chile ni en otros mercados.

## Traspaso a Codex
Seguir `04_implementacion/INSTRUCCIONES_CODEX.md` para reemplazar la identidad sin alterar las pantallas ni el simulador.
