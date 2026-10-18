# Equipos eléctricos adaptados al laboratorio

Se incorporaron los tres grupos solicitados dentro del laboratorio existente de Paneldecontrol / modo. La investigación de Electrodesk sirvió para identificar funciones y rasgos de diseño; las piezas, el código de interacción y los modelos nuevos son propios. No se incluyeron imágenes, marcas ni código descompilado de Electrodesk en el producto.

> Traspaso posterior: las funciones restantes continúan con Claude según `CONTINUAR_ELECTRODESK_CON_CLAUDE.md`. El avance parcial del PLC se conservó fuera del producto.

## Abrir y practicar

Con el servidor local activo, abre [Equipos eléctricos](http://127.0.0.1:4341/laboratorio?tool=equipment). También aparece en la barra del laboratorio, junto a Esquemas y PLC.

1. Añade equipos desde las tres familias del dock o desde la biblioteca del inspector.
2. Arrastra para colocar. Selecciona un borne y después otro para unirlos; el inspector ofrece un selector de bornes para teclado y móvil. Escape cancela el cable.
3. Selecciona una pieza para editar su designación y parámetros antes de simular.
4. Pulsa **Simular proyecto** y acciona los mandos. La parada permanece enclavada; los pulsadores actúan mientras se mantienen pulsados.
5. En **Montajes y archivos**, añade los ejemplos de mando, variador o solar. Se añaden debajo del montaje actual; no lo sustituyen. Si no caben, la interfaz solicita un proyecto vacío.

El montaje participa en el guardado local, historial, deshacer/rehacer y JSON del proyecto. La exportación de montaje permite reutilizar solo estas piezas. Al importar se renuevan IDs y etiquetas en conflicto, conservando las asociaciones internas entre contactores y auxiliares. La importación es aditiva y se puede deshacer.

## Catálogo implementado: 41 tipos

| Familia | Tipos | Contenido |
|---|---:|---|
| Mando y protecciones | 22 | Fuentes DC/AC, tierra, bornera, barra, interruptores de uno/dos/tres polos, portafusible, diferencial, guardamotor, térmico, auxiliares NA/NC, pulsadores NA/NC, emergencia, selector, piloto, zumbador, riel y rótulo |
| Automatización | 7 | Fuente trifásica, contactor, motores monofásico y trifásico de seis bornes, PLC y variadores con entrada mono/trifásica |
| Medición y energía | 12 | Voltímetro, amperímetro, vatímetro, medidor de energía, panel FV, batería, controlador, inversor, microinversores de 300/600/1200 W y DC/DC |

Cada tipo tiene dibujo SVG propio, miniatura basada en su representación real, representación simplificada, selección, propiedades y bornes explícitos cuando corresponde. Los disyuntores 1P/2P/3P, diferencial, guardamotor y portafusible tienen ahora dibujos específicos; los disyuntores muestran polos y palancas vinculadas. Las pantallas y estados responden al modelo. El riel y el rótulo son elementos visuales sin continuidad eléctrica.

Además, **Esquemas** conserva su funcionamiento e incorpora siete tipos compatibles: interruptor, fusible, emergencia, selector, contacto NC, bornera y zumbador.

## Integración con las herramientas actuales

- El PLC físico del montaje usa el programa PLC del mismo proyecto. I1–I8 alimentan I0.0–I0.7 con un scan de retardo; Q1–Q4 siguen Q0.0–Q0.3 y tienen comunes C1–C4 independientes. La alimentación del equipo debe estar presente.
- Los contactores vinculan bobina, polos y auxiliares por designación. No se conectan circuitos por coincidir un número de borne.
- El variador permite consigna, rampa, marcha, paro y cambio de sentido pasando por cero. También reconoce DI1/DI2 cableadas.
- El motor trifásico exige los puentes de sus seis bornes; el ejemplo usa estrella.
- Los medidores usan bornes de tensión y corriente independientes. La energía se integra con el tiempo simulado; el costo usa la tarifa introducida por el alumno.
- El montaje eléctrico es una herramienta del mismo laboratorio. Sus cables no se unen automáticamente al banco físico, a Esquemas ni al protoboard. La conexión compartida implementada con otras herramientas es la memoria PLC.

## Límites del modelo

Estos son modelos didácticos, no una reproducción completa del motor de Electrodesk ni una validación de una instalación real.

- Red equivalente resistiva con fasores RMS para AC; no resuelve transitorios, inductancias, armónicos ni par mecánico. Las rpm son estimadas.
- Interruptores, fusible, diferencial, guardamotor y térmico tienen maniobra o disparo de práctica. No implementan curvas de protección ni cálculo de corriente residual.
- Panel FV lineal, batería con resistencia interna y SOC por corriente; convertidores con eficiencia fija del 90 % y límites simplificados de potencia. No se modelan MPPT, PWM ni química de batería.
- El microinversor requiere red AC y panel DC; su inyección es idealizada y limitada por potencia. No valida sincronización ni antiisla de un equipo real.
- N y PE permanecen separados salvo un cable explícito. El zumbador tiene indicación visual, sin audio automático.
- Capacidad: 80 piezas y 400 cables; el cálculo nodal tiene un límite de tamaño declarado. Los errores se muestran sin alterar el montaje guardado.
- No se modificó el inventario físico del banco ni se confirmaron correspondencias desconocidas de sus bornes.

## Archivos e implementación

Nuevos: `src/lab/EquipmentView.tsx`, `src/lab/equipment/model.ts`, `src/lab/equipment/engine.ts`, `src/lab/equipment/Art.tsx`, `src/styles/equipment.css`, `qa/verify-equipment.mjs` y `qa/verify-equipment-ui.mjs`.

Integración: `src/lab/LaboratoryApp.tsx`, `model.ts`, `engine.ts`, `validation.ts`, `useLaboratory.ts`, `SchematicView.tsx`, `DeviceIcons.tsx`, `qa/verify-laboratory.mjs` y scripts de `package.json`. Se corrigió también el paso de IDs de terminal en `src/lab/detectors/BenchScene.tsx`, que impedía la comprobación TypeScript.

## Verificación local

- `npm install`, `npm run check` y `npm run build`: correctos.
- `npm run verify:equipment`: 17/17, incluyendo importación sin asociaciones cruzadas, retención, parada, cortocircuito, variador, medidas, batería, solar, PLC y límites de conversión.
- `npm run verify:equipment-ui`: 15 comprobaciones de navegador, sobre el build servido en `http://127.0.0.1:4342/`. Incluye ratón, teclado, importación, recarga, historial y viewport móvil 390 × 844; sin errores de navegador.
- `npm run verify:lab`: 38/38; `npm run verify:detectors`: 44/44; `npm run verify:simulation`: correcto, seis comprobaciones.
- Banco original: captura completa idéntica en escritorio; contenido del banco idéntico en móvil, con diferencias limitadas a la barra superior. Esquemas y banco respondieron HTTP 200, sin errores de JavaScript ni desbordamiento horizontal en esos tamaños.

No se probaron equipos físicos. La comprobación móvil es una emulación de navegador. La publicación autorizada después de esta entrega se registra en `PUBLICACION_EQUIPOS_ELECTRICOS.md`.

Evidencia: [modelo](qa/equipment/model-report.json), [navegador](qa/equipment/browser-report.json), [mando](qa/equipment/desktop-mando.png), [variador](qa/equipment/desktop-variador.png), [solar móvil](qa/equipment/mobile-solar.png), [familia de mando](qa/equipment/familia-mando.png), [automatización](qa/equipment/familia-automatizacion.png), [energía](qa/equipment/familia-energia.png).

La investigación completa y los respaldos previos están en `C:/Users/HUMANO LAB/Documents/ChatGPT/extraer electrodesk/`. Las 35 oportunidades del informe inicial no se consideran automáticamente implementadas por esta ampliación; el alcance entregado es el descrito aquí.
