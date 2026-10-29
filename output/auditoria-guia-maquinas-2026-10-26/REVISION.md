# Revisión contra la guía de Máquinas Rotativas — 26 de octubre de 2026

Revisión del código y del modelo local, sin modificar la aplicación ni publicar una nueva versión. Se leyó el PDF completo y se inspeccionaron visualmente la placa, los dos esquemas y las tablas de las páginas 3, 5, 6, 9 y 10.

Fuente: `C:/Users/HUMANO LAB/Downloads/Actividad 2 Unidad 2 (1).pdf`. La copia integrada `public/activities/actividad-2-unidad-2.pdf` es idéntica: SHA-256 `49775a14bcb23af18ac3fb07cfcafa1cf5041cd032e5fe363b0682d2265dc0da`.

## Pendientes prioritarios

### 1. Corriente que recibe el térmico — corrección eléctrica

Figura 2, página 6; criterio 2.1.1, página 4. La rama de KM2 se deriva antes de KM1/FR1. En triángulo, FR1 queda en serie con un extremo de cada devanado, mientras la pinza de las tablas 4/6 abraza la línea de alimentación antes de la bifurcación.

`src/hooks/useSimulation.ts:45-46` alimenta el cálculo térmico con el máximo de `net.lineAmps`. No calcula la corriente de cada polo de FR1. Así puede anticipar el disparo en triángulo y enseñar un ajuste inadecuado para esta ubicación.

Comprobación con el modelo didáctico a 1450 rpm: 7,676 A de línea y 4,427 A en la rama KM1–U1, medida intercalando el multímetro virtual con su resistencia interna. Relación 1,734, cercana a raíz de 3. No son medidas del banco físico.

Corrección necesaria: obtener del circuito las tres corrientes que atraviesan FR1 y usarlas para su memoria térmica. El ajuste debe justificarse con la corriente nominal, la ubicación del relé y su documentación; no basta multiplicar siempre la corriente instantánea por una constante si hay desequilibrio.

Referencia primaria: https://www.se.com/nl/nl/faqs/FA173001/ distingue montaje dentro de triángulo y montaje antes de la bifurcación.

### 2. El disparo debe actuar mediante el circuito de mando — corrección eléctrica

Figura 1, página 5; puntos 9 y 21. El NC 95–96 abre el circuito que alimenta las bobinas. La desconexión de potencia depende de que caiga el contactor.

`src/data/simulation.ts:32` impide cerrar los polos de CONTACTOR_TERMICO si `thermalTripped`, aunque su bobina continúe alimentada. Esto oculta una conexión de protección incorrecta.

Comprobación exclusivamente virtual: introduciendo un puente de prueba sobre 95–96, al activar TEST la bobina KM1 permanece activa, pero el modelo abre su polo L1–T1 y declara el motor apagado. Debe diagnosticarse la protección de mando anulada; no simular una desconexión que el cableado no produce. No trasladar este ensayo a equipos físicos.

Referencia primaria sobre NC 95–96 en el mando: https://www.se.com/be/en/faqs/FA107663/

### 3. Lectura de placa y compatibilidad estrella–triángulo — actividad ausente

Páginas 2–3. Hay parámetros de ejemplo y un campo libre para referencias, pero no una actividad que pida interpretar las tensiones nominales Y/Δ, compararlas con la red y resolver si el motor admite la maniobra.

El perfil carece de campos estructurados para tensiones nominales por conexión y corriente nominal. Por eso el cambio a triángulo no evalúa esa compatibilidad. Se puede enseñar con placas ficticias identificadas como ejemplos aunque todavía no se disponga de los datos del equipo real.

Precisión a conservar: las tensiones Y/Δ de placa son tensiones de línea para cada conexión. El texto de la página 3 confunde el valor de conexión estrella con tensión de cada bobina. La explicación del simulador debe aclararlo; no copiar ese razonamiento literalmente.

Referencia primaria: tabla Motor Terminal Box Connections, página impresa 29 del manual ABB https://library.e.abb.com/public/85bb7f53868f4d549e537374c191838b/EN_ACS260-04_B_A4.pdf

### 4. Montaje y comprobación por etapas — validación incompleta

Puntos 4–10: montar y probar mando. Punto 11: montar fuerza después. La aplicación ofrece un montaje guiado desde vacío y luego carga completa de mediciones, pero `checkActivity` exige la firma del circuito completo antes de cualquier etapa.

Comprobación: un circuito de solo mando activa KM1 y KM3, enciende únicamente el piloto verde de estrella y mantiene fuerza sin alimentación. El paso control-star lo rechaza por no tener todos los cables de la práctica.

Corrección necesaria: validar el subconjunto de mando durante su prueba y añadir la etapa de fuerza después, manteniendo la acción explícita del estudiante para preparar el circuito. Las revisiones presenciales del docente deben seguir identificadas como presenciales.

### 5. Cableados equivalentes — validación demasiado rígida

Criterios 2.1.3–2.1.5 y montaje. `matchesActivity` compara pares de extremos exactos, no conectividad equivalente. Se cambió una derivación de KM1:L1 a FUENTE:R, que ya pertenece al mismo nodo. El motor sigue funcionando en estrella y el comprobador lo rechaza.

Se necesita comparar conectividad y función de contactos/dispositivos, conservando la detección de puentes indebidos y conexiones ausentes. Que el motor gire no alcanza por sí solo para aprobar un montaje.

### 6. Ajuste de protecciones y esquema propio — actividades parcialmente cubiertas

Criterios 2.1.1 y 2.1.3. El cuaderno incluye campos para ajuste calculado y explicación, y existe un esquema de referencia con explicación de cables. Aún falta un ejercicio comprobable que relacione placa, corriente nominal, ubicación/rango del térmico y ajuste. También falta integrar una entrega de esquema propio del estudiante con revisión frente al mando/fuerza requerido; la explicación del cableado no acredita por sí sola el criterio de diagramación.

### 7. Uso de la pinza — mejora de entrenamiento

Puntos 16 y 19. Las lecturas de las fases ya existen. La interacción consiste en seleccionar botones R/S/T; falta practicar la colocación de la mordaza sobre un conductor concreto y reconocer una posición incorrecta que abraza varios conductores. Es una mejora para trasladar la práctica al instrumento físico, no una tabla adicional pendiente.

### 8. Exportación completa de la comparación — mejora de entrega

Puntos 20 y 23. Las tablas y las dos relaciones numéricas existen en la actividad. El CSV contiene lecturas y condiciones, pero omite la comparación; el informe HTML de Estudio añade las lecturas y el texto de reflexión, sin incluir los valores guardados en `analysis` ni rpm/carga por fila.

Conviene unificar tablas originales, cálculo numérico, explicación y condiciones de medición en la entrega. No se afirma que el profesor exija un formato de informe concreto.

## Cobertura que ya existe

| Guía | Estado observado |
| --- | --- |
| Preparación, inventario y EPP, puntos 1–3 | Referencias y declaraciones en cuaderno; comprobación física con docente pendiente |
| Mando, puntos 4–10 | Montaje, continuidad, tensión, pilotos, marcha, cambio manual y TEST/RESET disponibles; falta validación por etapas y corregir el efecto del térmico |
| Fuerza y alimentación, puntos 11–14 | Montaje y tres voltajes de tabla 1 disponibles |
| Estrella, puntos 15–16 | Tres voltajes de tabla 3 y tres corrientes de tabla 4 disponibles |
| Cambio manual, punto 17 | Disponible; el temporizador es una variante adicional y no reemplaza SB3 |
| Triángulo, puntos 18–19 | Tres voltajes de tabla 5 y tres corrientes de tabla 6 disponibles |
| Comparación, punto 20 | Dos relaciones verificadas con los registros y reflexión; entrega integrada mejorable |
| TEST/RESET, puntos 21–22 | Disponibles; revisar modelo de desconexión y corriente térmica |
| Revisión docente, punto 23 | Registro declarado; no existe ni corresponde inventar aprobación docente automática |
| Desenergización y desmontaje, puntos 24–25 | Pasos explícitos disponibles |

La guía numera sus tablas 1, 3, 4, 5 y 6. No falta una tabla 2 dentro de este PDF. Los 34 pasos internos incluyen actividades adicionales; no equivalen a una auditoría de toda la física y de todos los criterios de evaluación.

## Evidencias y siguiente implementación

`comprobaciones.json` conserva las reproducciones de corrientes, disparo con mando mal protegido, cableado equivalente y rechazo del mando aislado. Las PNG conservan las páginas inspeccionadas.

Orden recomendado: corregir corriente y acción del térmico; agregar lectura de placa y ajuste explicado; separar validación de mando/fuerza y aceptar equivalencias; después mejorar pinza, esquema del alumno y entrega. Los datos reales de motor/relé y la verificación física siguen pendientes, sin impedir desarrollar ejercicios didácticos.
