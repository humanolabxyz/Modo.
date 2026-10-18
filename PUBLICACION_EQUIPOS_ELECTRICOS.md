# Publicación de Equipos eléctricos

Fecha: 18 de octubre de 2026. Estado: **READY**, enlace público comprobado.

- Producción: https://modo-lab.vercel.app/laboratorio?tool=equipment
- Repositorio privado correcto: `humanolabxyz/panellab-inacap`.
- Commit publicado: `b71be29bd8d355b94d856c4ef1451147bcf0c05a`.
- Autor y committer reconocidos por GitHub: `humanolabxyz`.
- Despliegue: `dpl_EsobYegD3duwH61RV2emn1ygE3kx`.
- Inspección: https://vercel.com/humanolabxyz-9765s-projects/modo-lab/EsobYegD3duwH61RV2emn1ygE3kx

El repositorio y la sesión GitHub ya pertenecían a Humano; la configuración local de autor usaba codeluxurya. Se corrigió **solo en este proyecto** a humanolabxyz y a su correo noreply de GitHub. Se creó y subió un commit nuevo; los commits anteriores se conservaron. El primer intento bloqueado por autor (`dpl_TFVLxtrYHxDmVLAxEWbbPRTJwF2n`) quedó reemplazado por el despliegue READY del autor correcto.

## Cambios publicados

Catálogo de 41 tipos integrado en el laboratorio; miniaturas propias basadas en los dibujos de los equipos. Disyuntores de uno, dos y tres polos, diferencial, guardamotor y portafusible con diseño específico. Los disyuntores muestran polos, palancas vinculadas y estados abiertos/cerrados; su actuación eléctrica sigue siendo de maniobra didáctica.

El resto de ampliaciones funcionales sigue con Claude. Ver `CONTINUAR_ELECTRODESK_CON_CLAUDE.md`; el avance PLC no validado está conservado fuera del producto y no se publicó.

## Comprobaciones

- `npm install`, TypeScript y build: correctos; npm informó cero vulnerabilidades conocidas.
- Modelo de equipos: 17/17. Laboratorio anterior: 38/38.
- Sobre el dominio público: 15 comprobaciones de `verify:equipment-ui` correctas; prueba adicional de las 41 miniaturas y disyuntor abierto/cerrado a 1440 y 390 px. Sin errores de navegador ni overflow en esas comprobaciones.
- Inicio, laboratorio, estudio, legal y comunidad devolvieron HTTP 200 con `X-Content-Type-Options: nosniff`.
- El chunk público `EquipmentView.BKNEstVJ.js` coincide por SHA-256 con el build local probado.
- Banco anterior: captura completa idéntica en escritorio. En móvil, el contenido bajo los primeros 100 px es idéntico; la diferencia quedó limitada a la barra superior (x 62–270, y 3–42), sin edición del código del banco.
- `verify:security` general no terminó: conserva un selector antiguo `.study-course-title` que no apareció en Estudio. Su intento inicial también apuntó a un puerto local sin servidor. No se afirma que ese script haya pasado. Las rutas públicas y las pruebas específicas de esta entrega sí se comprobaron.

Evidencia: `qa/equipment/production-report.json`, `browser-report.json`, `icons-report.json`, `model-report.json` y capturas en esa carpeta. La comparación histórica está en `extraer electrodesk/qa-adaptacion/`.

Las pruebas móviles son emulación de navegador. Quedan variantes visuales y funciones pendientes detalladas para Claude; no se declara completada toda la matriz de 35 oportunidades.
