# PanelLab INACAP v1.1 — entrega para revisión visual

> Revisión posterior solicitada por el usuario: [números y contraste fotográfico](REVISION_ROTULOS.md). Se mejoró la lectura de los 108 rótulos, especialmente 95–96 y 97–98, y se actualizaron las capturas y pruebas.

Trabajo realizado exclusivamente en el proyecto local, sobre la base Astro + React + TypeScript suministrada. No se desplegó ni se avanzó a la fase 2. La aceptación visual del usuario sigue pendiente.

## Abrir y ejecutar

La versión compilada está disponible durante esta sesión en **http://127.0.0.1:4322/**. El build está en `dist/`; necesita servidor HTTP para cargar los módulos de JavaScript.

Para desarrollar desde PowerShell:

```powershell
cd 'C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP'
npm install
npm run dev
```

Abrir la URL local anunciada por Astro. Si un puerto está ocupado, Astro elige otro. Requisitos: Node 20.19+ o 22+, npm. Se verificó con Node 24.14.0 y npm 11.9.0.

```powershell
npm run check
npm run verify:data
npm run build
npm run preview
```

`PANEL_LAB_INACAP.html` y `ABRIR_SIMULADOR.html` se conservan como prototipo anterior: **no contienen la v1.1**. La fuente actual está en `src/`.

## Comparación visual

- [Escritorio: anterior y v1.1](qa/comparacion-desktop.jpg).
- [Móvil: anterior y v1.1](qa/comparacion-mobile.jpg).
- [Los siete módulos: foto real, anterior y v1.1](qa/comparacion-modulos.jpg).
- [Interfaz de escritorio](qa/despues-desktop.png), [interfaz móvil](qa/despues-mobile.png), [botonera ampliada en móvil](qa/mobile-botoneras.png), [Inicio móvil](qa/inicio-mobile.png).
- [Muestra visual de los cables](qa/cables-demo.png).

Se revisaron las 20 fotografías de `00_FOTOS_DEL_LABORATORIO`, las capturas aprobadas, el HTML autónomo, las especificaciones y el inventario. Las fotografías de distintas sesiones muestran un banco reconfigurable: la composición general sigue la preview aprobada; las correcciones locales siguen las piezas fotografiadas. No se pretende una reconstrucción medida en milímetros.

| Módulo | Cambio sobre el prototipo | Evidencia principal |
|---|---|---|
| Alimentación | Protecciones de fuerza/control visibles en la caja; pilotos y bornes a su derecha; tres pilotos rojos, fusible independiente y ámbar; dos tomas de tres orificios; transformador 220/24 V, 3 A | IMG_4735, IMG_4738, IMG_4534 |
| Pilotos/botoneras | Pilotos separados de sus cuatro jacks; pulsadores verde–rojo–verde; **pulsador derecho con 3–4 crema a la izquierda y 1–2 rojo a la derecha**; N elevado; TP en ambos extremos; separación de filas y etiquetas corregida | IMG_4737, IMG_4535, IMG_4536 |
| Contactor + térmico | Frente de contactor, accesorio térmico separado y grupos de protección 95–96 / 97–98 diferenciados; numeración legible | IMG_4532, IMG_4534, IMG_4739 |
| Contactor trifásico | Frente de dispositivo detallado; conserva los auxiliares propios y los dos TP; referencia KM editable, pendiente de confirmar | IMG_4535, IMG_4536 |
| Temporizador 1 | Dial beige con borde estriado y cuerpo propio; sin tiempo, aguja de actuación ni estado eléctrico inventado | IMG_4533, IMG_4537 |
| Temporizador 2 | Mecanismo horizontal oscuro y cubierta circular gris sobre una brida frontal; se diferencia del primero por forma y acabado | IMG_4533, IMG_4535 |
| Motor | Caja rectangular independiente, banda amarilla lateral y disposición U1/V1/W1 sobre W2/U2/V2; TP lateral | IMG_4538 |

## Funcionalidades implementadas

- Siete módulos y los **108 IDs originales**, sin duplicidades ni eliminación de terminales.
- Selección física por clic/toque y activación por teclado; número, módulo, ID completo, color, referencia personal y función/interpretación en el inspector.
- Selector de módulo para acercarse y selector de borne accesible en el inspector, útiles en móvil.
- Búsqueda por número, nombre, alias y **ID completo**. Los resultados y el resaltado del panel comparten la misma función. Ya no se limita la búsqueda a nueve resultados.
- Zoom, ajuste al tablero, desplazamiento con mouse/tacto y flechas; tecla Inicio para recuperar la vista completa. El paneo usa la escala SVG real.
- Etiquetas personales guardadas localmente y recuperación del último borne. Los alias siguen marcados como no verificados.
- Inicio sencillo para explorar o continuar reconocimiento. Los circuitos y modos que dependen de validación docente se muestran como pendientes; no se inventaron ejercicios.
- Fotografía contextual ampliable, cierre con Escape y foco de teclado contenido en el diálogo.
- Espacio desplegable preparado para el diagrama.
- Componente reutilizable de cable banana verde petróleo, cabezas visibles, puntas redondeadas, curvas y cruces. Solo aparece tras activar **Muestra de cable**; extremos libres, sin continuidad ni circuito asociado.
- Contratos TypeScript separados para cables, extremos, desplazamientos, orden visual, capacidad física desconocida, diagramas revisados, pasos y tres niveles de asistencia. No hay un límite artificial de cables por borne.

## Etiquetas y datos eléctricos pendientes de confirmar

| Elemento | Qué falta confirmar |
|---|---|
| S1, S2, S3 | Equivalencia física 1–2 NC y 3–4 NA; actualmente se muestra como convención provisional. S1/S2/S3 identifican grupos internos de estudio, no referencias docentes verificadas |
| Ambos contactores | Función de los pares 13–14, 63–64, 71–72, 81–82 y 93–94 en los dispositivos concretos |
| Relé térmico | Estado normal y actuación real de 95–96 y 97–98; modelo, ajuste y condiciones de disparo |
| Temporizadores | Modelo, tipo de retardo, rango y actuación de 55–56 / 67–68; confirmación de 13–14. No se programó temporización |
| Referencias KM | Lectura de etiquetas manuscritas y correspondencia entre dispositivo y símbolo del circuito; los alias guardados son personales |
| Fuente N/F | Conexiones internas, función concreta de F y referencia de N |
| Pilotos | Retornos internos y correspondencia con el circuito; PILOTO_1…4/P1…4 son identificadores del inventario, no rótulos H confirmados |
| Cable banana | Referencia, compatibilidad, posibilidad y capacidad física de apilado. No se dedujo de la cantidad de cables fotografiados |
| Diagrama / LOGO! | Original legible, identificación de componentes y revisión docente; el equipo de la proyección no se incorporó al banco físico |

N y TP siguen separados. La identificación visual de un borne no confirma su comportamiento eléctrico.

## Funcionalidades pendientes

Conectar/desconectar cables entre bornes, puentes y nodos compartidos, selección y reorganización individual de cables, seguimiento interactivo de extremos, deshacer/rehacer, validación de continuidad, comportamiento de bobinas/contactos/pilotos/motor/térmico, temporización, importación y anotación de diagramas, ejercicios revisados, modo guiado con tres ayudas, práctica y examen. Todo ello pertenece a fases posteriores a la aprobación visual.

## Verificación realizada

| Prueba | Resultado |
|---|---|
| `npm install` | Correcto |
| `npm run check` | Sin errores TypeScript |
| `npm run verify:data` | 7 módulos, 108 IDs originales; colores, posiciones, estados de confianza, columnas de botonera, búsquedas y exportación JSON consistentes |
| `npm run build` | Compilación estática correcta, una ruta |
| `npm run verify:ui` sobre build local | Correcto; evidencia en `qa/verification.json` |
| Selección real | 108/108 bornes pulsados físicamente en el navegador; inspector y selector muestran el ID esperado |
| Búsqueda | 95, A1, 13, S2:3, BOTONERAS:S2:3 y alias personal comprobados |
| Navegación | Zoom, ajustar, paneo con mouse/tacto, flechas e Inicio comprobados |
| Estado | Selección y alias conservados al recargar; Inicio/continuar comprobado |
| Accesibilidad básica | Enter en bornes, selectores nativos, foco en modal y Escape comprobados; no constituye auditoría WCAG completa |
| Visualización | Escritorio 1440/1920, tablet 768 y móvil 390/360; sin desbordamiento horizontal; ningún texto de borne se superpone a la cara de otro conector según geometría SVG |
| Navegador | Sin excepciones, errores de consola ni solicitudes fallidas durante la prueba final |

Las capturas finales se revisaron frente al prototipo y los recortes fotográficos. Las pruebas táctiles se ejecutaron con emulación Chromium; no reemplazan una revisión en el teléfono físico del usuario. No se hizo validación eléctrica del banco real.

La instalación conserva Astro 5 de la base. `npm audit` reportó tres dependencias con alertas (Astro, sharp y esbuild: una crítica, una alta y una baja). Resolverlas propone un salto mayor de Astro y requiere una actualización separada; no se ejecutó `npm audit fix --force`. El servidor de esta entrega escucha únicamente en localhost.

## Archivos actualizados

- `src/components/Board.tsx`: caras de los módulos, dispositivos, terminales, etiquetas y navegación SVG.
- `src/components/App.tsx`: búsqueda consistente, inspector, Inicio, selectores, persistencia, demo y diagrama preparado.
- `src/components/BananaCable.tsx`: dibujo reutilizable y muestra explícita de cables.
- `src/data/panel.ts`: geometría corregida, IDs preservados y buscador compartido.
- `src/data/practice.ts`: contratos futuros sin motor eléctrico.
- `src/styles/global.css`: ajustes puntuales de legibilidad, controles táctiles y superficies de estudio.
- `src/pages/index.astro`, `astro.config.mjs`: título/versionado y barra de desarrollo oculta.
- `public/panel-model.json`, `TABLA_DE_BORNES.csv`: sincronizados con la fuente; originales conservados en `qa/`.
- `package.json`, `package-lock.json`, `.gitignore`, `MANIFIESTO_PAQUETE.json`: versión y comandos de validación.
- `qa/`: scripts, capturas, comparaciones y evidencia.

No se sobrescribieron el HTML aprobado, el inventario original ni las fotografías. **Revisar y aprobar visualmente esta v1.1 antes de iniciar fase 2.**
