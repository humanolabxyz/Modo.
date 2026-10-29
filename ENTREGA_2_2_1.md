# Entrega 2.2.1 · Cables y manipulación

Continuación sobre la misma aplicación, publicada en https://modo-lab.vercel.app/laboratorio?tool=soldering.
Despliegue: dpl_J5nnY41aP5KutAtZR9kSeBZJamgj.

## Resultado

- Paleta compartida de doce colores (petróleo, rojo, azul, amarillo, negro, blanco, verde, naranja, violeta, gris, marrón y rosa). Color personalizado en panel y taller de cable. Protoboard usa también la paleta ampliada.
- Cada conductor del cable HMI conserva su elección en el banco, el conector, la bornera, el instrumento y la recarga. Colores anteriores siguen siendo válidos. Cambiar el aislamiento visual no modifica los nodos ni invalida las lecturas; cambiar una conexión sí.
- Pelacables, termorretráctil y pistola de aire como objetos de la misma mesa. La mordaza actúa sobre el extremo, el tubo se coloca antes de unir y el cobre se lleva a una copa concreta del DB9. Un extremo aislado no se acepta como unión.
- El mango del cautín y el carrete conservan su punto de agarre. Solo la punta del cautín y el extremo del hilo de estaño tienen contacto de trabajo; no saltan al cursor al empezar a arrastrar.
- Hilos terminados visibles y recuperados al seleccionarlos. Una unión terminada no se desconecta al arrastrar. Desoldar o repetir invalida sus comprobaciones anteriores.
- Conservación del lienzo, navegación, ventanas, mediciones y prácticas anteriores; mouse, teclado y acceso a colores desde las ventanas en móvil.

## Validación

- npm install: sin vulnerabilidades reportadas; TypeScript y compilación local/Vercel correctos.
- 17 comprobaciones del modelo de color, firma eléctrica, contactos, agarre y transferencia térmica residual; cuatro grupos del modelo de soldadura/panel.
- Recorrido completo local de tres conductores, seis mediciones y orden RTU, más mediciones del panel, sin errores.
- Recorridos anteriores de temperatura, protoboard y redes conservados: seis comprobaciones del navegador, sin errores.
- Sitio publicado: versión, lienzo, ventana móvil, lección y multímetro del panel comprobados. Paleta, elección antes/durante cableado, edición individual, Deshacer/Rehacer, persistencia y toque real emulado comprobados en siete tamaños, incluyendo ambas orientaciones.
- Evidencia: qa/soldadura-manual-colores/, qa/soldadura-manual-colores-public/, qa/release-2.2.1-public/, qa/color-cables/.

Los colores son identificadores elegidos por el estudiante: no determinan D+, D−, GND ni la función de ningún borne. El modelo térmico sigue acelerado y educativo. No se cambiaron fuentes de clase ni se ocultó el fallo histórico de hashes de la suite académica descrito en ENTREGA_REALISMO_PRACTICAS.md.

## Archivos

src/data/wireColors.ts; src/components/CableColorPicker.tsx; src/lab/ValueEditor.tsx; src/lab/CableBench.tsx; src/lab/soldering/manual.ts, Tools.tsx y model.ts; src/study/academicModels.ts, CableWorkshop.tsx y CableMeter.tsx; src/styles/bench-practice.css; src/data/releases.ts; package.json y package-lock.json.

Referencias técnicas conservadas: [HAKKO · mantenimiento de puntas](https://www.hakko.com/english/support/maintenance/detail.php?seq=163) y [Kester · aleaciones](https://www.kester.com/knowledge-base/alloy-temperature-chart).
