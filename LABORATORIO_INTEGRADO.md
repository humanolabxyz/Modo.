# Laboratorio integrado en PanelLab

Estado: primera versión funcional local, 15 de octubre de 2026. Conserva Astro y React, sin dependencias nuevas. No constituye una réplica completa de UNIFCAD.

## Entrada y primeros pasos

El inicio mantiene las tarjetas Panel de práctica y Estudiar protecciones, los modos de aprendizaje, la última práctica y la importación. Debajo añade una tarjeta de laboratorio con cinco accesos directos. La ruta nueva es `/laboratorio`; acepta `?tool=schematic`, `plc`, `hmi`, `process` y `breadboard`.

1. Abre el laboratorio y pulsa **Simular proyecto** en el ejemplo Marcha y retención. Mantén S1 un instante y suéltalo: K1 y H1 permanecen activos. S0 detiene la maniobra.
2. Cambia a PLC para observar Q0.0 o a HMI para operar Marcha y Paro. El PLC, HMI y proceso comparten variables dentro del proyecto.
3. Desde Proyecto abre **Ejemplo · llenado automático**. La bomba arranca en el nivel bajo y se detiene en el alto. Abre la descarga para repetir el ciclo.
4. En Protoboard simula el ejemplo de fuente, resistencia y LED. Mide entre `top+:1` y `top-:1` para ver 5 V. Selecciona la resistencia para leer aproximadamente 3,069 mA.
5. Detén la simulación para editar. Deshacer y Rehacer actúan sobre el diseño. Exportar proyecto genera una copia JSON; Importar proyecto añade una copia nueva.

## Funciones disponibles

| Herramienta | Alcance inicial |
| --- | --- |
| Esquemas | Fuente ideal de mando 24 V DC, pulsadores NA/NC, bobina, contacto auxiliar, piloto, motor didáctico y contacto de salida PLC; colocar, mover, cablear, editar y retirar elementos/cables. |
| PLC | Ladder con ramas en paralelo, contactos, bobinas, SET/RESET, TON, TOF y CTU; variables, memoria y diagnósticos. ST limitado a asignaciones, expresiones y IF/ELSE. |
| HMI | Interruptores para entradas/marcas editables, pilotos, valores y barras de nivel; posición, etiquetas y vínculos configurables. |
| Procesos | Tanque 2D, bomba, sensores de nivel bajo/alto, nivel analógico y descarga manual; capacidad, caudales y umbrales editables. |
| Protoboard | 420 orificios, grupos internos y rieles partidos, puentes, resistencias, LED e interruptores; fuente DC de 0,1 a 24 V y medición de tensión, corriente y potencia resistiva. |
| Proyectos | Ejemplos, proyecto vacío, duplicación, biblioteca local, deshacer/rehacer y formato propio de importación/exportación. |

## Modelos y límites

La protoboard resuelve una red resistiva DC por nodos. El LED usa caída directa aproximada y resistencia interna de 10 ohmios. Se identifican cortocircuitos de fuente, nodos sin referencia y corriente LED superior a 20 mA. La geometría no reemplaza un modelo físico completo.

El esquema usa un modelo separado de relés y cargas resistivas; sus actuadores de mando alimentan las entradas del ejemplo PLC. El tanque calcula entrada menos salida y limita el volumen entre vacío y lleno. La protoboard se guarda en el mismo proyecto y tiene su propio circuito eléctrico.

ST se interpreta con un analizador propio, sin ejecutar JavaScript del usuario. No implementa toda IEC 61131-3, bucles, funciones o bloques ST de fabricante. Los cálculos son didácticos y no validan equipos físicos.

Pendientes para ampliar la cobertura investigada de UNIFCAD: catálogo eléctrico y de procesos completo, más bancos, cintas y entornos 3D, modelos AC/trifásicos, variadores, otras instrucciones y perfiles PLC, importación nativa `.unif`, PDF e impresión técnica, hardware, colaboración y almacenamiento remoto. La investigación pública identificó flujos y capacidades; no verifica equivalencia de todos los casos internos o PRO.

## Conservación e implementación

La única edición realizada por esta integración en archivos de producto que ya existían fue `src/components/Home.tsx`: importación de la tarjeta nueva, un párrafo introductorio y su inserción. Las herramientas están en `src/lab`, con página y estilos propios. No se incorporó código de UNIFCAD al producto.

La biblioteca usa exclusivamente `panellab-laboratory-v1`; no lee ni reescribe las prácticas existentes. El guardado se realiza al editar y al salir/recargar. Un guardado incompatible se conserva y bloquea la sobrescritura; la interfaz indica exportar el trabajo. El formato propio es `panellab-laboratory`, versión 1; no es compatible con `.unif`.

Se admiten 30 proyectos, 50 pasos de historial, 128 elementos por catálogo del proyecto, 512 cables y archivos de importación de hasta 2 MB. Los módulos visuales se cargan cuando se abren. En móvil los lienzos permiten desplazamiento interno y la protoboard también acepta orificios por nombre.

La comparación SHA-256 de los 94 archivos fuente iniciales está en `qa/laboratory-results/preservation.json`. Hubo cambios concurrentes ajenos a esta integración en otros archivos, incluidos archivos del panel; se conservaron sin restaurarlos ni sobrescribirlos. Por eso la auditoría no afirma que todo el checkout mantenga su hash inicial.

## Validación

- `npm run check`: TypeScript sin errores.
- `npm run build`: compilación estática correcta, incluida `/laboratorio`.
- `node qa/verify-laboratory.mjs`: 23/23 pruebas de modelos, casos eléctricos, PLC, ST, tanque y archivos inválidos. Resultados en `qa/laboratory-results/models.json`.
- `npm run verify:data`, `npm run verify:simulation` y `npm run verify:wiring`: comprobaciones del panel existente.
- Navegador local: inicio → laboratorio, marcha/retención/paro, salida PLC y HMI, tanque detenido en aproximadamente 80 %, descarga, protoboard a 5 V y 3,069 mA, edición/deshacer/rehacer, recarga, exportación e importación como copia.
- Vista adaptable comprobada con ancho solicitado de 390 px y escritorio de 1440 px; capturas en `qa/laboratory-results`. No se verificó un dispositivo móvil físico. La consola capturada no registró errores ni advertencias de la aplicación.

Para ejecutar localmente desde esta carpeta: `npm run dev -- --port 4336`, después abrir `http://localhost:4336/`. No se realizó despliegue.
