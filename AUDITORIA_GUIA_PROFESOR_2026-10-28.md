# Auditoría de la guía del profesor — 28 de octubre de 2026

Fuente: Actividad 2 UA2 ARCM02, Juan Carlos Toro Cornejo, Otoño 2025, 13 páginas.

SHA-256 del PDF: `49775a14bcb23af18ac3fb07cfcafa1cf5041cd032e5fe363b0682d2265dc0da`.

Se contrastaron las 13 páginas y se revisaron visualmente las tablas en páginas 8–10, los procedimientos y el cierre. La guía tiene 25 puntos y las tablas 1, 3, 4, 5 y 6; no contiene tabla 2. Las cinco tablas suman 15 lecturas.

## Correspondencia

La aplicación conserva el montaje aprobado de dos contactores y KT1 temporizado. El original docente es manual con tres contactores: no se presenta la adaptación como réplica literal. El piloto P2 de reposo no está cableado en el montaje recibido. El mando virtual es de 24 V; los montajes y revisiones presenciales se registran en el cuaderno. El armado automático no acredita ejecución física.

| Punto | Actividad | Cobertura |
| --- | --- | --- |
| 1 | Seguridad y puesto sin energía | Cuaderno: EPP y seguridad presencial; inicio virtual desenergizado. |
| 2 | Interpretar mando y fuerza | Motor y esquema, referencia PDF y explicación del cuaderno. |
| 3 | Revisar los elementos del puesto | Inventario del cuaderno; la disponibilidad física se revisa con el docente. |
| 4 | Montar y comprobar el mando | Montaje y continuidad virtual; revisión física con el docente. |
| 5 | Medir alimentación del mando | Voltaje F–N; equivalente virtual de 24 V~. |
| 6 | Comprobar reposo y señalización | En dos contactores las bobinas y pilotos están apagados; P2 no está cableado. |
| 7 | Dar marcha en estrella, solo mando | S1 activa KT1 y KM2; P1 indica estrella. |
| 8 | Cambiar el mando a triángulo | Cambio temporizado a KM1 y piloto P4, en vez de SB3 manual. |
| 9 | TEST del térmico en el mando | Corte de bobinas y P3 de disparo; P2 no está cableado. |
| 10 | RESET del mando | Rearme sin marcha automática; pilotos apagados en este montaje. |
| 11 | Comprobar el circuito de fuerza | Motor conectado desde el inicio; comprobación de continuidad sin alimentación antes de habilitar fuerza. |
| 12 | Tabla 1 · tensión entre fases | R–S, R–T y S–T. |
| 13 | Reposo con mando y fuerza | Motor y bobinas en reposo; sin piloto P2 en el montaje de dos contactores. |
| 14 | Arrancar el motor en estrella | S1 activa KT1 y KM2, con el circuito de fuerza habilitado. |
| 15 | Tabla 3 · voltajes en estrella | U1–U2, V1–V2 y W1–W2. |
| 16 | Tabla 4 · corrientes en estrella | Pinza en R, S y T antes de sus derivaciones. |
| 17 | Cambiar el motor a triángulo | Cambio automático temporizado en el montaje actual. |
| 18 | Tabla 5 · voltajes en triángulo | U1–U2, V1–V2 y W1–W2. |
| 19 | Tabla 6 · corrientes en triángulo | Pinza en R, S y T antes de sus derivaciones. |
| 20 | Comparar voltajes y corrientes | Relaciones VΔ/VY e IΔ/IY y explicación de resultados. |
| 21 | Prueba de sobrecarga con el motor | TEST desde triángulo, parada y piloto P3. |
| 22 | Rearmar la protección | RESET sin nueva orden de marcha. |
| 23 | Solicitar revisión al docente | Cuaderno: resultados, observaciones y solicitud de revisión; no se concede aprobación automática. |
| 24 | Desenergizar el sistema | Abrir CONTROL y FUERZA y desconectar el enchufe virtual. |
| 25 | Desmontar y ordenar | Desmontaje virtual y declaración del orden físico en el cuaderno. |

## Tablas

| Tabla | Registros |
| --- | --- |
| Tabla 1 | line-RS, line-RT, line-ST |
| Tabla 3 | star-U, star-V, star-W |
| Tabla 4 | star-current-R, star-current-S, star-current-T |
| Tabla 5 | delta-U, delta-V, delta-W |
| Tabla 6 | delta-current-R, delta-current-S, delta-current-T |

## Ajustes de esta revisión

- Se muestran los números originales de tabla en Resultados.
- Referencia incluye correspondencia de los 25 puntos y acceso al cuaderno de entrega.
- El informe HTML exportado conserva las cinco tablas e incluye la correspondencia de los 25 puntos.
- Se explicitan el cambio automático, el montaje completo desde el inicio y las diferencias de señalización.

## Verificación

Prueba de hash, 13 páginas, 25 puntos, 34 pasos y 15 lecturas: PASS. Modelo de dos contactores: PASS. Nueve grupos de comprobación del circuito manual original y esquemas: PASS. Menú de siete vistas en escritorio y móvil emulado: PASS. TypeScript y build: PASS. Las pruebas móviles son emuladas, sin validación de dispositivos físicos.

El estado del despliegue y de las pruebas públicas se añadirá al finalizar.

## Publicación y prueba pública completadas

- Producción: https://modo-lab.vercel.app/
- Despliegue: dpl_4gr2RoqtZqJ5HALbZaB5PRuXYu9z, READY, proyecto modo-lab del equipo humanolabxyz-9765s-projects.
- URL de despliegue: https://modo-b5p0gva0x-humanolabxyz-9765s-projects.vercel.app.
- Despliegue anterior observado antes de publicar: dpl_FvvXcvagZGuCXUFLoaYei9ouQnhR.
- Publicado desde el árbol local de trabajo; referencia Git a66b0389fa77d92a95fe6fa36e4e67207e64786b, con cambios sin commit. Manifiesto SHA-256 en qa/guide-audit-2026-10-28/release-manifest.json.
- Página, PDF original, service worker y manifest: HTTP 200 sin sesión de Vercel. PDF público idéntico al revisado. SW y manifest sin caché.
- 14 recursos iniciales publicados, incluido App, idénticos al build local.
- Navegadores nuevos contra producción: 34/34 pasos en escritorio y móvil emulado, sin errores de página. Se comprobaron preparación, bornes, mediciones, comparación, protecciones, desmontaje y descargas.
- Exportaciones públicas de escritorio y móvil: JSON 34 pasos, CSV 15 lecturas en cinco tablas y HTML cinco tablas más la correspondencia de los 25 puntos.
- Siete vistas del menú público comprobadas en escritorio/móvil sin desbordes ni errores.

Evidencias públicas: qa/guide-audit-2026-10-28/public-desktop, public-mobile, public-assets.json y public-resources.json. La prueba móvil es emulada; no certifica el equipo físico ni sustituye aprobación docente.
