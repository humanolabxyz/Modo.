# Estudio · ajustes finales de lectura y progreso (V7)

- **Progreso:** resumen con temas dominados/revisados, intentos y simulacros; barra de avance; botón «Continuar» hacia el primer tema no dominado; cuatro marcas por tema (alternativas comprobadas).
- **Lectura:** textos auxiliares de 9–11 px subidos a 12–13 px con mayor contraste (etiquetas de lámina, pie de imagen, eyebrow, metadatos de progreso, notas del simulacro).
- **Archivos:** `src/styles/study-final.css` (nuevo, importado solo en `estudio.astro`) y `src/study/StudyApp.tsx` (vista Progreso). El panel práctico, Inicio, modelos y contenido no cambian.
- **Pruebas:** `npm run check`, `npm run build`, `qa/verify-study-focus.cjs` (incluye hashes del panel) y `qa/verify-study-storage.cjs` pasan. `verify-study-professor.cjs` solo falla por su lista blanca histórica de archivos (no incluye `StudyApp.tsx`); `verify-study.cjs` usa una navegación anterior a V4 y no se actualizó.

## Banco de alternativas (revisión de contenido)

- **Distractores:** 31 de las 32 alternativas reescritas con errores plausibles (los de «Errores comunes»: sumar factores, omitir √3, confundir nominal con ruptura, unidad A/mA). Se igualó el largo de las opciones: la correcta ya no es la más larga en 22/32 sino en 7/32. Se eliminaron los distractores absurdos y los absolutos («solo», «siempre», «nunca») como pista.
- **Aplicación:** 8 preguntas de recuerdo pasan a casos de aplicación, una por tema: ALT-01 (clasificar una falla), 05 (elegir Ip), 11 (banda de curva C de 16 A), 13 (placa de fusible vs. circuito), 17 (diagnosticar una suma de factores), 21 (rango de guardamotor), 26 (30 mA y función diferencial) y 30 (corriente de 5,5 kW = 10,87 A). Cálculos verificados por script antes de escribirse.
- **Se conservaron** IDs, temas y la posición de la respuesta correcta (8 por letra), por lo que el progreso guardado y los simulacros anteriores siguen siendo válidos.
- **Pequeños:** ALT-06 con distractores plausibles; recorrido de Guardamotor con tercera opción (10–16 A).
- **Archivos:** `content/preguntas_alternativas_32.json` y `content/preguntas-publicas.json` (deben mantenerse sincronizados), `journeyContent.ts`, y la lista de archivos permitidos de `qa/verify-study-focus.cjs`.

## Pautas y «Para recordar»

- **Pautas de los 12 desarrollos:** cada criterio es ahora una oración completa en primera persona («Explico que…», «Calculo Iz = …»), verificable al marcarlo en la autoevaluación. Se conservaron el número y el orden de criterios (3 por pregunta), por lo que las marcas ya guardadas siguen coincidiendo. `model_answer` no cambió.
- **Tarjeta «Para recordar»:** regla o fórmula clave y 3 ideas por tema (`rememberContent.ts`, `RememberCard.tsx`). Aparece al acertar el reto de «Resuelve» y al inicio de la consulta del tema. Solo repite cifras ya presentes en las lecciones; el paso «Mira» no cambia.
- **Archivos:** `content/preguntas_desarrollo_12.json`, `rememberContent.ts`, `RememberCard.tsx`, `LessonJourney.tsx`, `LessonGuide.tsx`, `study-final.css` y la lista de archivos permitidos de `qa/verify-study-focus.cjs`.

## Color negro y claridad de «Temas»

- **Color:** todos los verdes y verde-azulados de los estilos del estudio (453 valores) pasaron a negro/gris neutro: botones, pasos, barras, selección, tarjetas y fondos. Los colores del gráfico de la lámina 3 (celeste, ámbar, rosa) y los rojos de error no cambian. Respaldo de los archivos anteriores en la carpeta temporal del sistema (`bk-color`).
- **Botón de temas:** en Aprender y Practicar dice «Tema 1 · de 8 · cambiar»; en Evaluarme y Progreso dice «Los 8 temas» (ya no sugiere que se evalúa un solo tema).
- **Evaluarme:** nuevo bloque «Esta evaluación cubre los 8 temas» con los ocho temas numerados y una nota: las 8 alternativas recorren los 8 temas (una por tema) y los 3 desarrollos se sortean entre ellos.

## V8 · Módulos, práctica por tema, cierre de tema, color y movimiento

- **Dos módulos:** «Estudiar» (Aprender · Practicar · Progreso, con selector de tema) y «Evaluarme» (módulo aparte, sin selector de tema ni pestañas de estudio). Se cambia con dos botones grandes bajo el título. El progreso y los simulacros siguen en el mismo guardado.
- **Practicar un tema a la vez:** bloque «Practica un tema a la vez» con los 8 temas (color, avance n/4 y marca al completar), «Paso 1 · Ejercicio» y «Paso 2 · Preguntas». Al acertar las 4 preguntas aparece el panel de cierre con «Practicar el siguiente tema».
- **Cierre de tema:** panel «¡Tema N completado!» con un botón negro grande que nombra el destino («Siguiente tema · Tema 2 · …», o «Ir a la evaluación» en el último) y una alternativa «Practicar este tema». En móvil queda fijo al borde inferior.
- **Color y jerarquía:** cada tema tiene su color de acento (rojo, azul, ámbar, rosa, violeta, naranja, celeste, índigo; sin verdes); la evaluación usa ámbar. Títulos más grandes con subrayado marcador animado, etiquetas en píldora y términos clave resaltados (`Rich.tsx`, primera aparición de cada término).
- **Animaciones y microinteracciones:** entrada escalonada de listas, botones que se elevan/se hunden y flechas que avanzan, opciones que se deslizan y se marcan con «pop», sacudida en respuesta incorrecta, check dibujado con estallido de puntos al completar, barra de progreso animada, pulso en las etiquetas. Se desactivan con «reducir movimiento».
- **Archivos:** `study-v8.css` (nuevo), `Rich.tsx`, `TopicDone.tsx`, y cambios en `StudyApp.tsx`, `StudyNavigation.tsx`, `Practice.tsx`, `LessonJourney.tsx`, `LessonGuide.tsx`, `RememberCard.tsx`, `ExamView.tsx`. `qa/verify-study-focus.cjs` se adaptó a los dos módulos y a los nuevos nombres de botón.

## V9 · Módulo Cálculos y calculadora de la evaluación

- **Tercer módulo «Cálculos»** junto a «Estudiar» y «Evaluarme»: calculadora (teclas en pantalla y teclado, paréntesis, √, x², ANS, coma decimal, historial) y cinco fórmulas guiadas con procedimiento: capacidad corregida Iz, banda B/C/D, fuga en mA, corriente del motor trifásico y coordinación In ≤ Ip ≤ Iz. «Pasar a la calculadora» lleva el resultado a la calculadora.
- **Evaluación:** botón flotante «Calculadora» siempre disponible durante el simulacro; conserva la operación al cerrar y abrir (Esc cierra). No muestra pistas.
- **Motor seguro:** `calcEngine.ts` (analizador propio, sin `eval`), con errores controlados (división por 0, paréntesis, raíz de negativo).
- **Archivos:** `calcEngine.ts`, `Calculator.tsx`, `CalcModule.tsx`, `CalculatorDock.tsx`, `study-calc.css`; cambios en `StudyApp.tsx`, `model.ts` (nueva pantalla «calc»; los guardados anteriores siguen siendo válidos) y `ExamView.tsx`. Prueba: `qa/verify-study-calc.cjs`.

## V10 · Lección guiada por tarjetas (paso «Aprende»)

- El primer paso («Mira») pasa a ser **«Aprende»**: una lección de 6 partes por tema (idea inicial + 5 tarjetas) que explica y hace practicar de inmediato. Antes la explicación quedaba escondida en «Entenderlo con más detalle».
- **Tipos de tarjeta:** explicar con analogía y conceptos que se descubren al tocar; elegir; clasificar; unir; ordenar pasos; calcular. Todas dan respuesta inmediata con explicación; «Siguiente» se desbloquea al resolver (o tras dos intentos fallidos, mostrando la respuesta). «Ya lo sé · ir a probar» permite saltar.
- **Contenido:** 40 tarjetas (5 × 8 temas) en `lessonCards.ts`, con cifras de las láminas o ejemplos marcados como supuestos. Las analogías son didácticas, sin valores técnicos.
- El avance (parte actual y partes completadas) se guarda con el progreso y sobrevive a la recarga.
- **Archivos:** `lessonCards.ts`, `GuidedLesson.tsx`, `study-lesson.css`; `LessonJourney.tsx` (usa la lección guiada). Prueba: `qa/verify-study-lessons.cjs` (recorre las 40 tarjetas con respuestas correctas y erróneas); `verify-study-focus.cjs` adaptado.

## V11 · Fórmulas 1:1 con la presentación

- Las fórmulas se contrastaron con el PPTX original del profesor (texto y ecuaciones-imagen de las láminas 5, 6, 8, 11–16). El módulo «Cálculos» tiene ahora 8 fórmulas (Coordinación, Banda B/C/D, Capacidad del cable, Caída de tensión, Cortocircuito I²t, Guardamotor, Fuga, Motor), cada una con: la fórmula escrita como en la lámina (con subíndices), significado y unidad de cada símbolo, ejemplo, enlace a la lámina, rótulo «Fórmula del profesor» o «Cálculo didáctico añadido», la expresión que se teclea en la calculadora (con botón para probarla) y el procedimiento.
- **Corrección de notación:** la lámina 15 escribe **In = Psalida / (√3 VLL η cos φ)** (no «I»); se corrigió en el módulo, en las lecciones, el banco de preguntas, las pautas y las tarjetas. La lámina 6 indica que la notación IEC suele ser **Ib ≤ In ≤ Iz**; se añadió a Coordinación y a la tarjeta «Une cada símbolo».
- **Nuevas (de la lámina 12/13):** caída de tensión (comparar el % calculado con el límite adoptado: la lámina no da la fórmula para calcularla), I²t ≤ k²S² (valores de ejemplo marcados como supuestos; k depende del conductor y la aislación) y rango del guardamotor.
- La fuga en mA queda rotulada como cálculo didáctico: la lámina 14 solo da la sensibilidad habitual (≤ 30 mA).

## V12 · Fórmulas agrupadas y explicadas

- Las 8 fórmulas se agrupan por tarea: **Elegir la protección** (Coordinación, Banda B/C/D), **Verificar el cable** (Capacidad del cable, Caída de tensión, Cortocircuito I²t), **Motor trifásico** (Corriente del motor, Guardamotor) y **Fuga y personas** (Fuga en mA).
- Cada ficha se divide en secciones numeradas: 1 ¿Para qué sirve? (sirve para / cuándo se usa / qué te dice), 2 La fórmula, 3 Qué significa cada símbolo, 4 Ejemplo, 5 Pruébala con tus datos, 6 Así se teclea en la calculadora, 7 Paso a paso, y un recuadro «Ojo» con los límites.
- Los textos de finalidad son explicaciones didácticas; las fórmulas, símbolos y ejemplos de lámina siguen marcados «Fórmula del profesor» frente a «Cálculo didáctico añadido».
