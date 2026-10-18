# Estudiar protecciones eléctricas — entrega local

Refinamiento visual posterior: [Mejoras de estudio V2](MEJORAS_ESTUDIO_V2.md), con navegación, recursos derivados de la PPT, microinteracciones y pruebas actualizadas.

Implementado dentro de PanelLab, en Astro + React. Sin publicación ni cambios de repositorios remotos.

## Acceso y alcance

- Inicio existente `/`: dos tarjetas, Panel de práctica y Estudiar protecciones. Conserva los modos, diagramas opcionales, importación y continuación de la práctica.
- Ruta nueva `/estudio` (también `/estudio/`): ocho lecciones, prácticas por tema, evaluación, resultados e historial. La navegación interna sigue el modelo React del proyecto y se recupera desde el guardado.
- Material docente disponible localmente en `/estudio/profesor.pdf`; fuentes por lámina junto a lecciones y correcciones.
- ZIP original descomprimido en `../referencias-estudio-protecciones/PanelLab_MODULO_ESTUDIO_Codex_FINAL/`. Se leyeron primero `00_LEEME_PRIMERO.md` e `INSTRUCCION_LISTA_PARA_CODEX.md`, las ocho guías y especificaciones. Las referencias son insumos; no sustituyen código del Banco.

## Funciones entregadas

| Tema | Interacción comprobada |
|---|---|
| Reconocer fallas | Normal/sobrecarga/cortocircuito, circuito cualitativo, consecuencias seleccionables y clasificación con corrección. |
| Coordinación | In, Ip e Iz editables, barras proporcionales, tres casos y explicación de la condición que falla. |
| Termomagnético | Exploración de palanca/bornes/datos, mecanismos térmico y magnético, B/C/D con nominal editable y bandas a escala. Sin tiempos de disparo inventados. |
| Fusibles | Lectura de placa didáctica separada de la fotografía, clase por aplicación y comparación de tensión, ruptura y compatibilidad CA/CC. |
| Conductores | Iz en tiempo real, dos casos, coordinación básica y comprobaciones de caída de tensión/cortocircuito explícitamente incompletas. |
| Guardamotor | Placa ficticia editable, dos rangos térmicos, dial y validación del ajuste respecto de la corriente de placa. |
| SPD/diferencial | Escenarios distintos, circuito conceptual, cálculo del desequilibrio ida/vuelta y selección corregible. |
| Motor trifásico | Cuatro entradas, conversión kW/W, fórmula sustituida, dos casos y validación de η, cosφ y tensión. |

Las prácticas utilizan las 32 alternativas, distribuidas en cuatro por tema, con corrección determinista y pistas progresivas. Los siete casos numéricos incluidos están disponibles y sus resultados se verificaron; las respuestas cambian con las entradas.

El simulacro selecciona ocho alternativas distintas, una por tema, y tres desarrollos distintos entre los doce disponibles. Evita repetir los IDs del intento inmediatamente anterior. Guarda respuestas, orden, posición, revisión previa, envío, resultado y autoevaluación de rúbricas. Exige confirmación antes de enviar, incluidas respuestas pendientes. No ofrece pistas ni pautas durante el intento. Las alternativas reciben un resultado sobre ocho; los desarrollos se revisan después mediante criterios marcados por el estudiante y pauta orientativa. No hay calificación automática por coincidencia de texto ni nota global fingida.

Guardado exclusivo en `panellab:estudio:v1`: tema y pantalla actuales, simulacro seleccionado, actividades editadas, intentos, errores e historial. Incluye validación de esquema, exportación/importación y reinicio confirmado exclusivo del estudio. Un guardado corrupto se conserva sin sobrescribir; los errores de cuota ofrecen exportación. Un tema se considera dominado al marcarlo revisado, resolver correctamente una actividad y comprobar sus cuatro alternativas.

## Archivos

Archivos anteriores modificados:

- `src/components/Home.tsx`: acceso al estudio y composición de inicio; las funciones y argumentos del panel se conservan.
- `public/sw.js`: rama exclusiva de navegación/caché para estudio y su material. Impide que el estudio o su PDF sobrescriban la página offline del Banco; el flujo anterior del Banco no cambia.
- `package-lock.json`: procesado por el `npm install` exigido por el proyecto; no se cambiaron dependencias en `package.json` ni se aplicaron actualizaciones forzadas.

Archivos nuevos:

- `src/pages/estudio.astro`.
- `src/study/StudyApp.tsx`, `Activity.tsx`, `TermExplorer.tsx`, `Practice.tsx`, `ExamView.tsx`.
- `src/study/model.ts`, `grading.ts`, `lessonContent.ts`, `content/*.json`.
- `src/styles/study.css`, `src/styles/study-home.css` (reglas del inicio delimitadas por sus clases).
- `public/estudio/fotos/*.jpg`, `public/estudio/profesor.pdf`.
- `qa/verify-study.cjs`, `qa/verify-study-storage.cjs`, evidencia en `qa/estudio/`.

## Panel práctico preservado

Se guardó una línea base SHA-256 de todos los archivos originales de `src` y `public` en `qa/estudio/baseline-hashes.json`. De esos archivos, solo difieren Home y la integración de caché descrita arriba. Permanecen idénticos App, Board, diagramas, conexiones, Comparar/ampliación de referencia, validaciones, hooks, modelos y estilos internos del simulador.

La línea base real tiene seis módulos y 94 bornes independientes; se conservan. Las regresiones confirman cableado, arranque/parada, retención, térmico, fallas, deshacer, recuperación de prácticas antiguas, correspondencias CADe, rutas y diagramas flotantes. La prueba del estudio comprueba que sus operaciones no cambian ningún valor guardado previamente por el panel.

Capturas equivalentes del Banco: `qa/estudio/baseline/panel-desktop.png` y `qa/estudio/panel-desktop-comparacion.png` son idénticas píxel a píxel. La comparación móvil conserva la geometría; no se usa como prueba de igualdad exacta por fotograma.

## Validaciones ejecutadas

Todas estas comprobaciones finalizaron correctamente:

- `npm install`, `npm run check`, `npm run build`.
- Validador del paquete `07_QA/validar_contenidos.py`: ocho lecciones, 32 alternativas, doce desarrollos, siete casos y dos referencias.
- `node qa/verify-study.cjs`, contra el build estático en localhost: datos, siete cálculos, corrección de todas las opciones, cien selecciones de simulacro, ocho interacciones, errores/datos incompletos, persistencia, simulacros de 7/8 y 0/8, rúbrica, rotación, archivo corrupto y responsive.
- `node qa/verify-study-storage.cjs`: teclado, tacto, descarga/exportación real, importación, rechazo de archivo inválido, cancelación/confirmación de reinicio, cuota agotada y navegación offline independiente de Inicio/Estudio/PDF.
- `npm run verify:simulation`, `npm run verify:learning`, `npm run verify:wiring`: línea base de lógica aprobada.
- `npm run verify:simulation-ui`, `npm run verify:routes`: regresión final del Banco en el build estático, siete tamaños y controles táctiles.

Evidencia estructurada: `qa/estudio/verification.json`, `qa/estudio/storage-verification.json`, `qa/simulacion/ui-verification.json` y `qa/recorridos/verification.json` (según los nombres de salida de los scripts originales).

Anchos del estudio comprobados: 375, 390, 768, 1280 y 1920 px. Lección, práctica, evaluación/resultados y progreso no presentan desbordamiento horizontal. Se revisaron capturas reales, fuentes locales, carga de imágenes y ausencia de errores de navegador en el flujo principal.

## Capturas

- [Inicio escritorio](qa/estudio/inicio-desktop.png)
- [Lección escritorio](qa/estudio/leccion-desktop.png)
- [Inicio móvil](qa/estudio/inicio-mobile.png)
- [Lección móvil](qa/estudio/leccion-mobile.png)
- [Resultados](qa/estudio/resultados-desktop.png)
- [Banco antes — escritorio](qa/estudio/baseline/panel-desktop.png)
- [Banco después — escritorio](qa/estudio/panel-desktop-comparacion.png)
- [Banco antes — móvil](qa/estudio/baseline/panel-mobile.png)
- [Banco después — móvil](qa/estudio/panel-mobile-comparacion.png)

## Límites reales

- El progreso pertenece al navegador/origen local; para trasladarlo a otro puerto o equipo se usa exportación/importación. No se incorporó un servidor ni sincronización entre dispositivos.
- Es un simulacro educativo local. La UI y el estado del intento no contienen claves de corrección; las pautas se cargan al corregir. Los archivos estáticos no constituyen un examen con secreto garantizado frente a inspección técnica.
- Escritorio, tablet y móvil se comprobaron con navegador automatizado y emulación táctil; no se afirma una prueba en teléfonos físicos.
- `npm install` reportó tres avisos de auditoría de dependencias (uno bajo, uno alto y uno crítico). No se aplicó `audit fix --force`, porque podría cambiar el simulador fuera del alcance solicitado.
- Los valores numéricos de motores están identificados como supuestos: la lámina 15 del docente no aporta una placa completa. Ningún resultado aprueba una instalación real por cumplir únicamente In ≤ Ip ≤ Iz.

No quedan defectos funcionales detectados en los flujos comprobados. La aceptación visual final corresponde al usuario.

## Ejecutar localmente

```powershell
cd 'C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP'
npm run dev
```

Abrir la dirección local indicada por Astro y seleccionar **Entrar a estudiar**. Para probar las comprobaciones contra otro puerto, establecer `PANELLAB_URL` con barra final antes de ejecutar los scripts de QA. El script de caché requiere `npm run build` y `npm run preview`.
