# Instrucción para Codex — aplicar identidad «modo.»

Actualizar la identidad visual de la plataforma actual **PanelLab** a **modo.** usando exclusivamente los assets del kit.

## Alcance
- Mantener íntegra la funcionalidad ya existente del Panel de control, modos de aprendizaje, diagramas, protecciones, laboratorio y prácticas guardadas.
- Reemplazar las apariciones de logo/marca anterior por `modo.` donde corresponda (header, título del documento, iconos, manifest/PWA y superficies de autenticación si existen).
- Mantener la composición de inicio aprobada tanto para escritorio como para móvil. No construir una landing page, dashboard nuevo ni navegación adicional.
- Preservar el isotipo de dos piezas, el logotipo minúsculo y el punto verde. No recrear el logo con tipografías CSS ni con iconos genéricos de librerías.
- Usar `07_public_brand_copiar` como origen de los archivos listos para `public/brand/`; no comprimirlos ni convertirlos a JPEG.
- Para headers claros usar `modo-logo-horizontal-color.svg`; para superficies oscuras `modo-logo-horizontal-blanco.svg`.
- Para icono PWA usar los PNG 192, 512 y maskable. Actualizar favicon y apple touch icon.
- Integrar los colores de `modo-tokens.css` progresivamente y solo donde corresponda, manteniendo contraste y accesibilidad de la interfaz existente.
- Si hay diferencias entre los nombres de carpetas/rutas del proyecto y los ejemplos del kit, adaptar los ejemplos sin romper rutas actuales.

## Validar antes de cerrar
1. Inicio escritorio y móvil: la marca no está recortada, deformada ni borrosa.
2. Favicon y aplicación instalada se ven nítidos y tienen fondo/contraste correctos.
3. Logo en modo claro y oscuro con buen contraste.
4. Clics del Panel de control, Protecciones, Laboratorio y prácticas guardadas funcionan igual que antes.
5. No hay cambios de contenido o módulos que no fueron solicitados.
6. No se mezclaron recursos de la referencia visual con assets de producción.

## Nota
Los SVG vectoriales de este kit son una reconstrucción limpia de la referencia aprobada; se pueden editar si más adelante se ajusta la identidad.
