# Guías para practicar sobre el simulador

26 de octubre de 2026. Publicación: https://modo-lab.vercel.app.

Despliegue final: `dpl_2nVGLGhUgSeMXLN7HCHzU4bVn12X`, estado READY, alias de producción asignado. Portada, Estudio, banco de temperatura y PDF docente respondieron HTTP 200 sin credenciales. El recorrido de las nuevas actividades se comprobó también contra el dominio público a 1440 y 390 px; comprobación final móvil en `qa/guides-class/publicado-final.json`.

El objetivo es realizar las guías dentro de los bancos existentes antes de la clase presencial. Se conserva el inicio explícito de las mediciones: abrir la guía no arma el circuito; «Comenzar guía del profesor» sí prepara el banco.

## Recorridos implementados

- Temperatura, experiencia 2: 9 pasos. Insertar sondas, conectar puntas, medir TC y Pt100 en cuatro temperaturas, calcular sensibilidad, revisar ambas curvas, explicar y descargar Excel con gráficos.
- Temperatura, experiencia 3: 8 pasos. Conectar y alimentar transmisor, configurar tipo y rango, medir TC y salida, registrar cuatro puntos, calcular la salida a 75 °C, revisar curvas, explicar y generar la planilla.
- Máquinas, Actividad 2 U2: entrada propia en Estudio, fuente de 13 páginas, acceso al montaje guiado de 46 conexiones y al recorrido de mediciones del panel.
- Mediciones del panel: 34 pasos, 15 medidas de las cinco tablas originales, mando y pilotos, estrella, cambio manual a triángulo, comparación con relaciones numéricas comprobadas contra los registros, TEST/RESET, desenergización y desmontaje explícito.
- Diagnóstico sobre el circuito del simulador: tres fallas por cable retirado —mando abierto, retención interrumpida y piloto rojo sin alimentación—. No son respuestas prefijadas sobre una imagen: alteran el circuito que resuelve la simulación. El alumno observa, aísla, mide continuidad, repone el cable y comprueba la reparación.
- Cuaderno opcional en Estudio para investigación, presentación, resultados, cálculos, informe, bibliografía y seguimiento de entregas/revisión presencial. Exportación HTML imprimible y JSON recuperable. No se presenta una declaración del estudiante como aprobación docente.

## Corrección de datos de temperatura

Cada medición del transmisor conserva tipo y rango. La finalización, libreta y gráfica comparan tipo TC, ambiente, rango/tipo TX y resistencia de hilos del Pt100. Los ensayos de otras configuraciones y los registros antiguos se conservan; un rango desconocido no acredita una nueva serie. Cambiar condiciones o borrar puntos retira las comprobaciones de datos que ya no se cumplen. Las hojas Excel separan sensor, origen y configuración.

## Verificación

- `npm install --no-audit --no-fund`: sin cambios de dependencias.
- `npm run check`: aprobado.
- `npm run build`: aprobado; Vercel vuelve a construir el paquete publicado.
- `qa/verify-temperature.mjs`: 39/39; incluye regresión de cambios K/J, ambiente y rango TX.
- `qa/verify-meter-activity.mjs`: 34 pasos en perfiles manual y Matías.
- Recorrido del panel en navegador: 34 pasos manuales, 15 mediciones, relaciones numéricas, descarga CSV/JSON, desconexión y desmontaje; acceso móvil.
- `qa/verify-guides-class.mjs`: tres fallas comprobadas con el motor de simulación; navegador a 1440 y 390 px, apertura sin autoarmar, carga de falla, nuevos pasos de experiencias 2/3, descargas y persistencia del cuaderno. Los pasos iniciales de medición de temperatura se verifican con pruebas del modelo; este recorrido de interfaz usa series preparadas para probar sus nuevos pasos finales.
- Los cinco XLSX de prueba se abrieron con openpyxl: ZIP/XML válidos, datos y un gráfico por hoja/serie.
- Capturas de escritorio y móvil y resultados: `qa/guides-class/`. Recorrido completo del panel: `output/revision-guias-2026-10-26/recorrido-resultados.json`.

## Límites que se conservan

No hay aprobación docente ni validación de equipos físicos. El mando sigue siendo un modelo didáctico de 24 V y las corrientes son equivalentes resistivos. El circuito físico remitido por el DOCX a la guía práctica 1 requiere esa referencia y revisión docente; no se inventó un cableado de fabricante. Presentación y debate se preparan y registran, y se realizan con el grupo.

## Archivos principales

- Temperatura: `src/learning/temperatureLessons.ts`, `src/lab/TemperatureView.tsx`, `src/lab/temperature/state.ts`, `TemperatureNotebook.tsx` y `TemperatureChart.tsx`.
- Panel: `src/components/App.tsx`, `PanelMeterLesson.tsx`, nuevo `PanelGuideFaults.tsx` y `src/data/meterActivity.ts`.
- Estudio: nuevo `MachineActivityStudy.tsx`, catálogo, contexto, índice, contador del ramo, fuente académica y `TemperatureLessonStudy.tsx`.
- Cuaderno: nuevos `GuideWorkbook.tsx`, `guideWorkbookData.ts`, `guideSpreadsheet.ts` y `src/styles/guide-workbook.css`.
- `.vercelignore`: excluye la carpeta de resultados local `output`.

La revisión anterior describe los faltantes antes de esta implementación; este documento registra los cambios posteriores.
