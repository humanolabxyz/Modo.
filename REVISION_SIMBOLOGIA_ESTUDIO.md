# Estudio · simbología y recorrido de fallas

> Revisión histórica V5, sustituida por `REVISION_MATERIA_PROFESOR_V6.md`. El circuito externo descrito aquí fue retirado del código activo tras la aclaración del usuario sobre el motor dibujado.

Se sustituyeron los bloques genéricos «Protección» y «Motor» del tema de fallas por un esquema de potencia multifilar propio del estudio. Se reutiliza en el recorrido breve y en el ejercicio libre.

El esquema muestra L1/L2/L3, los tres polos de un interruptor automático Q1, numeración 1–2/3–4/5–6 del ejemplo, funciones térmica y de sobrecorriente, motor M1 con M y 3~, terminales U1/V1/W1 y conductor PE a carcasa.

En sobrecarga no se añade ningún puente: se destaca el recorrido por el motor. En cortocircuito se añade una unión entre L1 y L2 aguas abajo de Q1 y se marcan sus dos nodos. El enlace mecánico de los polos es discontinuo para distinguirlo del conductor eléctrico.

«Ver la apertura de Q1» abre los tres contactos y retira el destacado de corriente. PE conserva su continuidad. La unión de falla permanece dibujada: abrir la protección no corrige su causa. Es una representación de estados elegidos por el estudiante, sin simular tiempo de disparo ni especificar equipos reales.

Los botones L1/L2/L3, Q1, M1, PE y recorrido/falla explican cada elemento y resaltan las referencias correspondientes. La misma representación admite un estado normal en práctica.

## Fuentes

Conceptos de falla: láminas 2–4 del PDF del profesor entregado con el proyecto, que sigue siendo la fuente principal del módulo.

Convenciones gráficas contrastadas con:

- [ABB, MNS, Symbols used in diagrams, página 32](https://library.e.abb.com/public/3824ffa857ca19c1c1256b1900336151/1TSC902009D0201.pdf#page=32): contacto de interruptor automático, símbolos de protección y motor, y enlace de polos.
- [Schneider Electric, hoja 1549892_01A55, página 4](https://download.se.com/files?p_Doc_Ref=1549892_01A55&p_File_Name=1549892_01A55.pdf&p_enDocType=Instruction+sheet#page=4): ejemplo de circuito trifásico con protección térmica/sobrecorriente y motor M1 marcado 3~.

Son referencias gráficas complementarias, no criterios de dimensionamiento extraídos de documentos antiguos. Q1/M1 y sus bornes son referencias de este ejemplo y no se asignan al banco práctico. No se reproduce toda la instalación de ninguno de esos documentos ni se define estrella/triángulo dentro del motor.

## Archivos y comprobaciones

Nuevo componente `src/study/FaultSchematic.tsx` y estilo `src/styles/study-schematic.css`; integración en `QuickExperiment.tsx`, `Activity.tsx` y la ruta de estudio. No cambian archivos del panel práctico.

`npm install`, `npm run check`, `npm run build`, `node qa/verify-study-schematic.cjs` y regresión `node qa/verify-study-focus.cjs`.

Prueba específica: tres fases, tres contactos, terminales, motor y PE; puente presente solo en corto, con dos nodos; apertura de tres polos sin cambiar PE ni retirar la falla; selección y teclado; mismo esquema en práctica; sin desbordes a 360/390/768/1280 px. Evidencia: `qa/estudio-v5/verification.json` y sus siete capturas. Hashes de referencia: `qa/estudio-v5/baseline-hashes.json`.

Comparación: imagen anterior adjunta por el usuario frente a `qa/estudio-v5/sobrecarga-desktop.png` y `qa/estudio-v5/corto-desktop.png`.

Todo permanece local, sin publicar.
