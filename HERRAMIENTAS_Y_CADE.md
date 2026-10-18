# Barra de herramientas y lectura de PERFECTO

Entrega local del 14 de octubre de 2026. Continúa la limpieza de interfaz y usa el archivo CADe SIMU que aportaste.

## Abrir

http://127.0.0.1:4322/?revision=cade-perfecto

Entra o continúa la práctica, pulsa **Leer diagrama → PERFECTO · CADe**. Para practicar el montaje, vuelve a **Banco**; **Comparar** mantiene la referencia al lado en escritorio.

## Barra del banco

La barra toma la composición de tu referencia: oscura, flotante, iconos y herramienta activa azul.

| Herramienta | Acción |
|---|---|
| Seleccionar · V | Elegir un borne o cable sin crear conexiones |
| Mano · H | Desplazar el banco, incluso arrastrando sobre sus componentes |
| Cable · C | Elegir origen y destino; la curva provisional sigue el cursor |
| Borrador · E | Pulsar la curva o el conector de un cable para retirarlo |
| Deshacer / rehacer | Recuperar o repetir cambios |
| Papelera contextual | Aparece al seleccionar un cable; también admite Supr |

También hay una acción **Retirar cable** directamente sobre el banco al seleccionarlo. La inspección de bornes en los retos no queda bloqueada por los conectores. Se conserva el acceso a color, recorrido y capas desde el inspector.

## Tu archivo de CADe SIMU

Se copió `C:\Users\HUMANO LAB\Downloads\PERFECTO` a `public/diagrams/PERFECTO.cad`, conservando sus **6111 bytes sin modificación**. SHA-256:

`c4dcaa7aebe40e500fb94529fc4dd9d47a279ef32689d73a2bb604a5c8b0a138`

La importación retiene **79 registros: 47 conductores, 12 puntos de unión, 19 símbolos y un registro auxiliar**. Se leen los IDs, las referencias, los bornes y las coordenadas del texto original. Los símbolos se reconstruyen en SVG para hacerlos interactivos: no es una captura ni una exportación nativa del programa.

- Vistas **Todo / Potencia / Mando**, zoom, ajuste y desplazamiento.
- Seleccionar cada una de las 47 líneas y resaltar los segmentos de su misma red.
- Ver las referencias y bornes que toca la red, sin atravesar contactos, bobinas ni cargas.
- Seleccionar los componentes por separado y relacionar sus referencias.
- Resolver **12 preguntas sobre PERFECTO**, con pistas y comprobación de la red elegida.
- Localizar etiquetas 95/96/97/98 o U1/V1/W1/U2/V2/W2 en el banco. Esto identifica números; no asigna automáticamente -KM1, -SB1 o -SB2 a dispositivos físicos.

Se conservaron los registros -F **100 y 101**, superpuestos en el archivo, y los pares de puntos coincidentes **58/95** y **60/97**. No se borraron ni corrigieron silenciosamente. La red del motor conserva el puente de sus tres bornes inferiores dibujado en el archivo.

El lector importa este archivo concreto. No es un conversor universal de todos los tipos/versiones de CADe ni ejecuta su motor de simulación. No se ha contrastado el dibujo SVG con una exportación gráfica nativa; la verificación de fidelidad cubre los registros, la numeración y las coordenadas originales.

## Aprender y trabajar sobre imágenes

**Guía interactiva** ofrece un ejemplo didáctico distinto, con diez retos sobre líneas, contactos, ramas y bobina. Su referencia conceptual es el material de controles magnéticos de [BC Trades](https://bctradesmodules.gov.bc.ca/sites/bctradesmodules.gov.bc.ca/files/module_pdf/L1I2_2016_0.pdf); no representa el esquema de tu clase.

En **Mi diagrama** puedes cargar una imagen, activar **Trazar línea**, seguir su recorrido y asociarlo a dos bornes con explicación y revisión personal. La polilínea se guarda con la práctica, se recupera al recargar y viaja en el JSON. También se conserva el marcado de zonas anterior. El trazado es manual; no hay reconocimiento automático de líneas en las fotos.

## Verificación

Pasaron TypeScript, build e inventario de **7 módulos y 108 bornes**. Se comprobaron las redes de cables, el flujo completo de práctica, los nueve retos fotográficos y la interfaz responsive. Las nuevas pruebas cubren retirada por conector/papelera/Supr, vista previa, los diez retos básicos, trazado y persistencia de la imagen, las 47 líneas originales por clic y las doce preguntas de PERFECTO.

Se probaron 1920, 1440, 768, 390 y 360 px. También se usaron eventos táctiles de Chromium emulado para conectar 95→96, retirar por conector, deshacer, seleccionar una línea de CADe y desplazar el banco. No se ensayó en un teléfono físico.

| Evidencia | Archivo |
|---|---|
| Fidelidad al texto original y duplicados | `qa/cade/import-verification.json` |
| Diagrama, preguntas, integridad y tacto | `qa/cade/verification.json` |
| Herramientas, diez retos y trazado | `qa/herramientas/verification.json` |
| Regresión de bornes | `qa/verification.json` |
| Práctica completa | `qa/fase2/ui-verification.json` |
| Interfaz simplificada | `qa/limpieza/verification.json` |

Capturas actuales: `qa/cade/perfecto-mando-desktop.png`, `perfecto-potencia-desktop.png`, `perfecto-mobile.png`; barra y trazado en `qa/herramientas/`.

Comandos: `npm run check`, `npm run build`, `npm run verify:data`, `npm run verify:wiring`, `npm run verify:ui`, `npm run verify:practice`, `npm run verify:interface`, `npm run verify:reading`, `npm run verify:cade`.

## Archivos principales

Nuevos: `ToolDock.tsx`, `DiagramReader.tsx`, `CadeDiagram.tsx`, `diagramReading.ts`, `cade.ts`, `cadePerfecto.json`, `scripts/import-cade.py`, copia del original y pruebas específicas. Modificados: `App.tsx`, `Board.tsx`, `WireLayer.tsx`, `DiagramPane.tsx`, `practice.ts`, `wiring.ts`, estilos, scripts y documentación. El modelo físico de los módulos y las fotos originales no cambiaron.

Todo sigue local. Las correspondencias físicas pendientes y el comportamiento eléctrico permanecen fuera de esta entrega.
