# 2.2.19 · Maqueta y borneras manuales

Continúa la escena existente de Soldadura, conservando la guía y la prueba de comunicación 2.2.18.

- HMI con frente/reverso: COM2 únicamente por detrás, retorno al frente para operar. Se oculta el conector tras la carcasa al ver el frente, manteniendo la conexión.
- PLC de carcasa marfil, bloques verdes, placa metálica y riel, inspirados en la fotografía del aula. No se deduce el modelo exacto de una fotografía general.
- Borneras de paso grises sobre riel, según la segunda referencia. Son la bornera didáctica del banco, distinta de las borneras verdes propias del PLC. T1/T2/T3 son correspondencias del ensayo, no un pinout físico certificado de la maqueta.
- Se retiran los cuadros de cable y el botón de conexión completa. DB9 y los tres conductores son objetos en SVG: seleccionar o arrastrar, abrir cada tornillo, insertar por la entrada superior y apretar. No se puede insertar en una entrada cerrada, ocupar una entrada ya ocupada, retirar un hilo sujeto ni manipular con equipos encendidos.
- El modelo comprueba los tres hilos en sus posiciones y sujetos. Cable incorrecto, intercambiado o suelto no obtiene respuesta; no basta encender la pantalla ni marcar un estado visual.
- Ver borneras encuadra el área para manipular en móvil/tablet. Destornillador visible al trabajar cada cabeza de tornillo, con giro del tornillo y alternativa sin movimiento.
- Editores didácticos ISPSoft/DOPSoft con elementos por arrastre o toque, direcciones editables y errores de compilación en el ejemplo M0/Y0. Ayuda de transcripción, monitor virtual de M0/Y0, y archivo público /estudio/practica-ispsoft-dopsoft.md.
- La guía de ayuda toma de los manuales oficiales la creación de botones Set to On/Set to Off dirigidos al mismo M0. No reproduce los archivos originales .isp/.dpa, ni genera binarios Delta. El transporte simplificado sigue siendo RTU 8E1: se conserva explícita la diferencia con la captura 7E1 del PDF.

Archivos principales: src/lab/soldering/DeltaHardware.tsx, DeltaProjectEditor.tsx, TerminalWiring.tsx, CommissionBench.tsx y commissioning.ts; src/styles/commission-bench.css; public/estudio/practica-ispsoft-dopsoft.md; versión y registro de cambios.

Comprobaciones: npm install (0 vulnerabilidades), check, build, modelo commissioning (incluye rechazo de inserción antes de aflojar y extracción antes de soltar), laboratorio 38/38. UI: qa/verify-commission-ui-2.2.18.cjs actualizado para giro del HMI, DB9, tres entradas/tornillos, edición/compilación de direcciones erróneas, carga, marcha/paro, 115200, recuperación y explicación. Chromium usa gestos táctiles CDP, WebKit mouse y teclado; 393/1180/1440 px. Las pruebas usan un cable fabricado y medido como fixture; no equivalen a hardware físico.

La parte de puesta en marcha es temporal; el cable mantiene el guardado existente. Referencias de ayuda enlazadas a manuales oficiales ISPSoft (2021-03-29), DOPSoft (2021-12-30, sección 2-164), y DOP-107EG (2019-10-16). No se inventa configuración de D1120 ni alimentación real.

Publicación: https://modo-lab.vercel.app, dpl_BDjmDJdtFteJH4ydm7kqqYcZsDfJ READY. Prueba pública con flujo completo; verificación adicional de arrastre táctil de conductor con Chromium/CDP confirma inserción en T1 y requerimiento de apriete. Un intento de integrar ese gesto dentro del recorrido de seis tamaños tuvo una aserción de sujeción fallida; se comprobó el gesto por separado y se conserva el recorrido por toque para validación consistente de la secuencia completa.
