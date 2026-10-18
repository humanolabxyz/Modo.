# PanelLab — Especificación técnica y plan de trabajo (v1)

Fecha de elaboración: octubre de 2026.

**Objetivo:** Practicar, sin necesidad del laboratorio, la lectura del diagrama y el montaje virtual cable a cable de un banco didáctico de control eléctrico como el fotografiado en INACAP. El diseño y la validación deben ser fieles a los módulos y bornes reales. No es una guía para energizar equipos físicos.

## Alcance de la primera entrega

- **Dos pantallas:** (1) Inicio: elegir o importar circuito y modo; (2) Simulador: diagrama y banco, juntos.
- **Tres modos dentro del mismo simulador:** Guiado, Práctica y Examen.
- Panel inspirado en la geometría *real* de las fotos; cada terminal visible debe tener etiqueta, color y coordenadas SVG propias; zoom y desplazamiento independientes.
- Cables banana flexibles sobrepuestos, extremos de conexión independientes, deshacer/rehacer, retirar, colores y puentes con varios cables compartiendo un borne/nodo.
- Visualizar conexiones a ambos lados y en el diagrama; no limitar arbitrariamente a 3 cables virtuales. La capacidad física depende del conector verdadero, aún no confirmado.
- Diagrama con segmentos resaltados y guía contextual por paso; cada tramo se enlaza con uno o varios pasos de cableado, no necesariamente un tramo = un cable.
- Ayudas de tres niveles: (1) línea resaltada, (2) componentes, (3) bornes.
- Persistencia local del avance; uso offline cuando los recursos estén cargados.
- Nombres de componentes de esquema (p. ej., KM1, S1) **no deben inventarse**; cada uno se mapea al módulo físico confirmado.

## Tabla técnica resumida (véase datos/panel_inacap_v1.json)

| Módulo | Terminales principales visibles | Colores / comentarios |
|---|---|---|
| Alimentación y transformador | R S T N F TP | R azul, S negro, T rojo, N crema, F rojo, TP verde; 220/24 V 3 A visible |
| Luces piloto 24 V AC | cuatro bornes bajo pilotos; N visible cercano | verde, rojo, ámbar, verde; los cuatro jacks rojos |
| Pulsadores verde-rojo-verde | por pulsador: 1-2, 3-4 | 1-2 rojos, 3-4 crema; NC y NA respectivamente según convención, por confirmar en equipo |
| Contactor + relé térmico | A1/A2, L1/L2/L3, T1/T2/T3, 13/14, 63/64, 71/72, 81/82, 93/94, 95/96, 97/98 | NC 71/72, 81/82, 95/96; NA 13/14, 63/64, 93/94, 97/98 — pendiente prueba |
| Contactor trifásico | A1/A2, L1/L2/L3, T1/T2/T3, 13/14, 63/64, 71/72, 81/82, 93/94 | Contactos NC/NA provisionales según numeración |
| Temporizador neumático 1 y 2 | A1/A2, L1/L2/L3, T1/T2/T3, 13/14, 55/56, 67/68, TP | La función y tipo de retardo deben validarse con su modelo |
| Bornera motor | U1 V1 W1 W2 U2 V2 TP | azul, negro, rojo, rojo, azul, negro, verde |
| Siemens LOGO! | pendiente | visible solo en foto de proyección; no se distinguen los bornes ni modelo exacto |

**Verificación:** los nombres y colores de los bornes citados proceden de fotografías; los estados NC/NA son inferencias según estándares, NO pruebas del banco. El color de un conector no determina por sí solo su comportamiento eléctrico.

## Fases y criterios de aceptación

### Fase 0 — Cerrar inventario y calibración de referencias
- Revisar cada módulo con las fotografías originales, etiquetas KM, numeración, posición, color y tipo de contacto.
- Marcar cada dato **confirmado / inferido / pendiente**.
- Pedir copia legible del diagrama original (PDF o captura directa del programa de clase) y confirmar si el LOGO! está disponible físicamente.
- **Listo cuando:** la tabla y la geometría del panel estén aprobadas; nunca poner un estado eléctrico supuesto como hecho.

### Fase 1 — Representación del tablero (sin cables)
- Implementar una pantalla combinada con panel SVG y área de diagrama.
- Dibujar módulos en la misma disposición observada, usando los números/colores de este inventario.
- Cada borne debe ser seleccionable y mostrar `Módulo / Nombre / Borne / Función / Estado de verificación`.
- Zoom y pan independientes del diagrama y panel.
- **Listo cuando:** cada borne de la tabla se identifica correctamente al seleccionarlo y está en su posición relativa.

### Fase 2 — Motor de cables banana y puentes
- Crear/conectar/retirar cables entre bornes, con geometría flexible y colores.
- Almacenar cada extremo, módulo y borne, y calcular los nodos compartidos.
- Permitir varios cables por un mismo borne, resaltar red conectada, deshacer/rehacer y persistir.
- **Listo cuando:** un cable entre dos bornes se ve, permanece al recargar y permite añadir/retirar derivaciones sin alterar otras conexiones.

### Fase 3 — Importador de ejercicios y diagrama interactivo
- Aceptar imagen o PDF como referencia visual.
- Definir manualmente zonas/segmentos resaltables sobre el documento y asignar pasos de ejercicio.
- Mapear símbolos de diagrama con módulos físicos; relacionar cada paso con bornes de origen/destino y explicación.
- **Listo cuando:** al seleccionar un paso se destaca solo el tramo validado y los componentes del panel correspondientes.

### Fase 4 — Tres modos de estudio y evaluación
- **Guiado:** 3 niveles de ayuda, comprobación de cada paso, indicación de error sin revelar la solución inicialmente.
- **Práctica:** diagramas y panel visibles sin ayudas; corrección solicitada.
- **Examen:** sin ayudas, registro de tiempo, puntuación y explicación oral propuesta al final.
- **Listo cuando:** el mismo ejercicio puede completarse en los tres modos sin navegar fuera de la pantalla principal.

### Fase 5 — Simulación de comportamiento (posterior a validación)
- Modelar contactos NC/NA, pulsadores, bobinas, sobrecarga, pilotos, temporizadores y lógica de alimentación.
- Evaluar conectividad del circuito completo y permitir soluciones eléctricamente equivalentes, no solo comparar cables en orden fijo.
- Si corresponde, incorporar un LOGO! simulado una vez conocido modelo y conexiones.
- **Listo cuando:** casos verificados de arranque, paro, enclavamiento, señalización y fallos producen comportamiento virtual esperado.

## Stack técnico recomendado

- Astro + React + TypeScript en modo estricto. Desarrollo y pruebas **locales**.
- Componentes y terminales con SVG (fidelidad, zoom y marcadores exactos).
- Cables con overlay SVG de curvas ajustables; manejar selección con clic o toque, sin exigir drag-and-drop fino en móvil.
- Estado simple centralizado en React para la primera versión; ejercicios configurados en JSON.
- `localStorage` para primer prototipo; IndexedDB para múltiples ejercicios grandes e importaciones persistentes.
- PWA offline opcional después de validar las funciones esenciales.

## Modelo mínimo de datos

- `Component`: identificador interno, etiqueta física, referencia en esquema (validada), posición, tipo.
- `Terminal`: id estable `COMPONENTE:TERMINAL`, posición SVG, color físico, tipo/estado verificado.
- `Wire`: `id`, `{from, to}`, color, recorrido visual, orden de apilamiento representado.
- `Node`: terminales unidos por cables (red lógica). No equivale a conectar una bobina ni a cerrar un contacto: componentes son elementos con estado propio.
- `DiagramSegment`: ruta o región del diagrama, elementos asociados, nota.
- `ExerciseStep`: origen/destino válidos, segmentos resaltados, explicación, pistas y estado de completitud.

**Muy importante:** múltiples cables en el mismo punto comparten nodo; los terminales **a través de contactos abiertos o bobinas no se fusionan automáticamente**. La simulación debe distinguir cable ideal, contacto con estado y carga.

## Pruebas mínimas para aceptar la v1

1. Todas las etiquetas visibles en fotografías reproducidas sin confundir pares o módulos.
2. Conexión cable banana de ida y vuelta, visualización y eliminación independiente.
3. Tres o más cables sobre un mismo borne funcionando como nodo lógico; sin tope artificial.
4. Segmento del diagrama resaltado al avanzar y correspondencia con terminales.
5. Respuestas erróneas dan feedback y no cuentan como correctas.
6. Guardado y recuperación de avance, deshacer y rehacer.
7. Interacción usable con mouse y toques en tablet.
8. Datos sin verificar aparecen marcados y no se usan para validar seguridad ni para instruir cableado real.

## Fuentes de contexto

- Fotografías originales aportadas por el usuario en `referencias/panel/`.
- Fotografías de proyección en `referencias/diagrama_proyectado/` (no permiten leer fielmente todos los terminales).
- Schneider Electric FAQ FA125708: 1–2 NC, 3–4 NA en un bloque industrial específico.
- Mitsubishi catálogo técnico de contactos de temporizador: 55–56 NC con retardo, 67–68 NA con retardo (el módulo del usuario debe verificarse).
