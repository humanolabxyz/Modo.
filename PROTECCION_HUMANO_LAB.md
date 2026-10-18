# Protección de modo. / PanelLab — Humano Lab

Preparación local del 15 de octubre de 2026. Responsable del proyecto: Félix Levancini, jefe del laboratorio de Humano Lab. El usuario decidió mantener el enlace abierto con créditos y políticas.

## Lo preparado

- Crédito en el inicio: iniciativa de Humano Lab; creación y dirección de Félix Levancini.
- Enlace «Créditos y políticas» en inicio, panel, estudio y laboratorio. En el panel compacto está en «Opciones de práctica». Abre otra pestaña para conservar la práctica.
- Página `/legal/` con autoría, permiso educativo gratuito, condiciones de redistribución, privacidad, seguridad educativa, derechos de terceros y canal de consulta.
- `LICENSE.md` para los aportes propios. No se aplica a conocimientos, marcas, fotografías, documentos ni bibliotecas de terceros.
- Avisos completos de las bibliotecas principales, generados a partir de las licencias instaladas, en `/THIRD_PARTY_NOTICES.txt`. Se conservan las licencias de las tipografías.
- Metadatos de autor y exclusión de indexación. `noindex` es una instrucción a buscadores, no una barrera ni una garantía de retirada inmediata. Se permite el rastreo para que puedan leerla.
- Cabeceras preparadas en `vercel.json`: prevención de incrustación en otros sitios, `nosniff`, política de referencia y permisos de dispositivos desactivados.
- Política CSP en cada HTML compilado: scripts propios y hashes de los bloques inline generados por Astro; no admite `unsafe-inline` ni `unsafe-eval` en scripts. Los estilos inline se conservan para posicionamiento y componentes existentes. La CSP HTTP complementaria limita incrustación, objetos, formularios y URL base.
- Páginas legales y licencias incluidas en el guardado sin conexión. No se añade bloqueo de copia, selección ni herramientas de desarrollador.
- Astro actualizado de 5.18.2 a 7.4.0 y su integración React de 4.4.2 a 7.1.0 para corregir los avisos detectados. Node 24.x fijado para futuras compilaciones en Vercel. `npm audit` informa cero vulnerabilidades conocidas en el momento de la comprobación; esto no equivale a una auditoría integral.

## Estado de publicación

Esta preparación no se ha desplegado. La web pública sigue en su versión anterior hasta publicar estos archivos. La prueba local sirve `dist/` reproduciendo las cabeceras de `vercel.json`; no demuestra que esas cabeceras estén activas en Vercel.

Proyecto ya vinculado: `panellab-inacap`; ID `prj_jFwuKEluKsxNM8isdUnCjNMh7xtZ`; equipo `team_iNJdFEbhcCf5nImzqTiX9CYD`. Dominio documentado: https://panellab-inacap.vercel.app/. Antes de publicar, comprobar que siguen siendo el destino previsto.

Al publicar, utilizar la configuración existente y Node 24.x, sin cambiar el proyecto ni activar contraseñas o planes de pago. Después verificar `/legal/`, créditos en el inicio, cabeceras HTTP reales, imports/exports y actualización de la PWA. Las cabeceras nuevas se aplican a respuestas nuevas; una copia ya descargada puede mantener su versión anterior hasta conectarse y actualizarse.

## Privacidad y límites

Los proyectos y progresos se guardan en el navegador. No se añadió recogida de datos, consentimiento ficticio ni cuentas. Vercel puede procesar datos técnicos del alojamiento: https://vercel.com/legal/privacy-policy.

El sitio sigue abierto. El código y los recursos enviados al navegador son inspeccionables. Las copias offline no pueden revocarse de forma fiable. El simulador sigue siendo educativo y no certifica ni autoriza instalaciones reales.

## Evidencia y respaldo

`qa/proteccion/verification.json` registra las pruebas específicas. `manifest-build-sha256.json` registra las huellas del build público. El respaldo ZIP de fuente y recursos públicos está excluido del despliegue por `.vercelignore`; no contiene `.env`, credenciales, `node_modules` ni configuración privada de Vercel. Conservar una segunda copia en un lugar privado distinto de este equipo.

Una huella SHA-256 sirve para comparar integridad, pero no acredita por sí sola fecha, autoría o titularidad. El ZIP y los registros locales no sustituyen un registro formal.

## Gestiones que no se presentan como realizadas

1. Confirmar la razón social y titular que corresponden a «Humano Lab» y la documentación de los aportes realizados por empleados, colaboradores o por encargo. El cargo de jefe de laboratorio no acredita por sí solo poder de representación o cesión de derechos. No se inventaron RUT, domicilio ni inscripción de marca.
2. Revisar permisos de las fotografías, diagramas, PDF del profesor y demás material de clase antes de ampliar su distribución. El aviso de terceros no concede esos permisos.
3. Para el registro de software en Chile, consultar el trámite oficial del DDI: https://www.propiedadintelectual.gob.cl/servicios/1-inscribe-obras. Preparar una versión identificada, antecedentes de titularidad y aportes humanos. El DDI indica que los casos con IA se evalúan individualmente: https://www.propiedadintelectual.gob.cl/node/1274. No se realizó ni pagó ninguna inscripción.
4. Incorporar un correo institucional de consultas cuando Humano Lab indique uno. Mientras tanto, el canal publicado es Félix Levancini por el mismo medio en que el estudiante recibió el enlace.

## Validación

- `npm install`, `npm run check`, `npm run build`: correctos.
- Auditoría npm: 0 vulnerabilidades conocidas; resultado conservado en `qa/proteccion/npm-audit.json`.
- `node qa/verify-security.cjs`: cinco vistas a 360, 390 y 1920 px; CSP, cabeceras locales, enlaces, recursos, preservación de almacenamiento y disponibilidad offline. Incluye ensayo negativo de inyección inline bloqueada por Chromium.
- `qa/verify-modo.cjs`: ocho tamaños, cuatro modos, importación/continuación, ayuda y cinco herramientas del laboratorio; correcto.
- `qa/verify-pwa.cjs`, `verify:simulation` y `verify:panel-history`: correctos.
- `verify:modo-preservation` corresponde a una tarea anterior de cambio de marca y exige hashes anteriores de archivos que ahora recibieron enlaces legales. Falla por ese motivo; no se alteró su referencia para forzar un PASS. La compatibilidad actual se verifica con las pruebas funcionales anteriores.

Las capturas de la preparación están en `qa/proteccion/`. La configuración de publicación sigue excluyendo `.env*`, `.vercel`, respaldos y QA. Los archivos públicos compilados se comprobaron sin `.env`, carpetas privadas ni source maps.

Para repetir las pruebas, ejecutar `npm run build` y `node qa/serve-security.cjs`. Con ese servidor activo, ejecutar `npm run verify:security` en otra terminal. El servidor de prueba escucha solo en `127.0.0.1:4338`.

## Archivos de esta preparación

Créditos y enlaces: `src/components/Home.tsx`, `src/components/App.tsx`, `src/components/LegalLink.tsx`, `src/study/StudyApp.tsx`, `src/lab/LaboratoryApp.tsx`, `src/styles/legal-links.css`.

Políticas y metadatos: `src/pages/legal.astro`, `src/styles/legal.css`, las tres páginas existentes de `src/pages/`, `LICENSE.md`.

Seguridad y compilación: `vercel.json`, `astro.config.mjs`, `public/sw.js`, `public/robots.txt`, `package.json`, `package-lock.json`.

Verificación y documentación: este documento, `qa/serve-security.cjs`, `qa/verify-security.cjs` y evidencias bajo `qa/proteccion/`.

## Capturas comparativas

Las imágenes «antes» proceden del sitio público consultado durante esta preparación; las imágenes «después» corresponden exclusivamente al build local.

| Tamaño | Antes, sitio público | Después, preparación local |
| --- | --- | --- |
| 390 px | [Inicio anterior](qa/proteccion/antes-publico-390x844.png) | [Inicio con créditos](qa/proteccion/inicio-390x844.png) |
| 1920 px | [Inicio anterior](qa/proteccion/antes-publico-1920x1080.png) | [Inicio con créditos](qa/proteccion/inicio-1920x1080.png) |

[Portada móvil de las políticas](qa/proteccion/legal-portada-390x844.png).
