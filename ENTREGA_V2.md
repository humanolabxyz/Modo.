# PanelLab INACAP v2 — práctica y estudio

> Interfaz vigente: [lienzo a pantalla completa y movimiento](LIENZO_Y_MOVIMIENTO.md). Herramientas y fichas flotantes, rueda, zoom al cursor, Espacio + arrastrar y pinza táctil.

> Actualización vigente: [barra de herramientas y lector de PERFECTO / CADe SIMU](HERRAMIENTAS_Y_CADE.md). Para abrir tu esquema: **Leer diagrama → PERFECTO · CADe**.

> Interfaz simplificada: consulta [LIMPIEZA_INTERFAZ.md](LIMPIEZA_INTERFAZ.md). El diagrama y el inspector ahora se abren a demanda; las opciones secundarias están agrupadas.

Esta entrega implementa la continuación que solicitaste: **flujo de estudio y cables conectables**. Mantiene Astro, React, TypeScript, la composición del banco y los 108 bornes originales. Funciona exclusivamente en local.

## Entrar a la versión actual

Abrir **http://127.0.0.1:4322/?revision=practica-v2** mientras el servidor de esta sesión siga activo.

Para volver a iniciarlo, haz doble clic en **ABRIR_PANELLAB_ACTUAL.cmd**. El acceso comprueba que el puerto corresponda a PanelLab v2, inicia el proyecto si hace falta y abre el navegador. Requiere Node y las dependencias instaladas.

Los archivos `PANEL_LAB_INACAP.html` y `ABRIR_SIMULADOR.html` siguen siendo las referencias antiguas conservadas. No son la aplicación actual.

Desde PowerShell:

```powershell
cd 'C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP'
npm install
npm run dev
```

Abrir la URL que anuncie Astro. Para usar el build guardado: `npm run preview -- --port 4322`.

## Qué puedes hacer ahora

| Función | Uso real |
|---|---|
| Inicio | Elegir modo y fotografía de referencia, comenzar o continuar una práctica guardada, importar una copia |
| Cableado libre | Activar **Conectar cables**, elegir un borne de origen y otro de destino; admite clic, teclado, búsqueda o selectores |
| Bornes compartidos | Agregar varios cables al mismo terminal; cada cable conserva sus extremos e ID, con cabezas separadas visualmente |
| Inspector de cable | Seleccionar la curva o elegir el cable en la lista, seguir sus extremos, cambiar color, caída y desvío lateral, traer delante/enviar detrás, retirar individualmente |
| Historial | Deshacer y rehacer cambios de la sesión; Ctrl+Z y Ctrl+Shift+Z fuera de campos de texto |
| Guardado | Recuperar cables, imagen, pasos y modo al recargar; el guardado es local al navegador |
| Copia portátil | Exportar/importar JSON con la práctica completa; un archivo inválido no reemplaza el trabajo actual |
| Diagrama junto al panel | Ver las tres fotos de clase originales, cargar una imagen propia y ampliar/desplazar la referencia independientemente del banco |
| Reconocimiento guiado | Nueve retos basados en fotografías: 95, 96, 97, A1 del contactor trifásico, S3:3, 55 del temporizador 1, 68 del temporizador 2, U2 y TP de la fuente |
| Guía manual | Marcar una zona de la imagen, elegir dos terminales, explicar el paso y confirmar que revisaste esa asociación |
| Tres ayudas | Zona marcada; componentes relacionados; bornes específicos. En reconocimiento: consigna, componente y borne |
| Comprobación de un paso | Comparar la red de cables con el par que revisaste; mostrar respuesta incorrecta/correcta y avanzar. Al cambiar la conexión se invalida un resultado anterior |
| Móvil | Pestañas **Panel y conexiones** / **Diagrama y pasos**, selección nativa de bornes y conexión por toques |

No existe un límite arbitrario de tres cables por borne. La capacidad y compatibilidad del conector físico siguen sin confirmar.

## Recorrido recomendado

1. En Inicio elige **Práctica libre · conectar cables** y pulsa **Empezar práctica**.
2. Selecciona un módulo para verlo de cerca. En **Conectar cables**, toca el origen y el destino. El inspector permite usar IDs completos cuando los números se repiten.
3. Selecciona una curva o usa **Cables de la práctica**. Prueba cambiar su recorrido, seguir ambos extremos, retirarlo y deshacer el retiro.
4. Para estudiar con una imagen propia, usa **Cargar imagen**. Se admiten PNG, JPG y WebP de hasta 2 MB, para poder incluirlas en el guardado local.
5. Pulsa **Marcar tramo y crear paso**, arrastra una zona, elige origen/destino, escribe la explicación y confirma tu revisión. El paso aparecerá en **Guía de mi diagrama**.
6. Usa las ayudas y **Comprobar conexión del paso**. La respuesta verifica la red de cables frente a tu asociación, no la validez eléctrica del montaje.
7. Para empezar a estudiar sin crear un ejercicio, elige **Reconocimiento guiado**. Sus nueve respuestas se basan en etiquetas identificadas en tus fotos, no en conexiones inventadas.

Cambiar la imagen reinicia las asociaciones de esa imagen; se puede deshacer durante la sesión. El historial de deshacer no se conserva después de cerrar o recargar; sí se conserva el estado actual de la práctica. Si el navegador no permite guardar, aparece un aviso y puedes exportar una copia.

## Alcance técnico y límites

- Los nodos se calculan exclusivamente a partir de cables explícitos. Nunca se unen automáticamente A1/A2, contactos, N/TP ni polos de un componente.
- Los cruces visuales no generan una conexión. Compartir un ID de terminal sí genera un nodo común.
- Los pasos son de **revisión personal**. La aplicación no los presenta como un circuito certificado ni como una revisión del docente.
- Las fotos de proyección están disponibles como referencias; no se extrajeron automáticamente sus conexiones.
- La anotación actual marca zonas rectangulares, no reconoce ni vectoriza automáticamente una línea del diagrama.
- Quedan pendientes el comportamiento eléctrico de contactos/bobinas/pilotos/motor, temporización, relé térmico, circuitos docentes precargados y validados, examen con evaluación, importación de PDF y compatibilidad física de conectores.

## Pruebas ejecutadas

| Comando / recorrido | Resultado |
|---|---|
| `npm run check` | Sin errores TypeScript |
| `npm run build` | Build estático correcto en `dist/` |
| `npm run verify:data` | Siete módulos, 108 IDs originales, colores y rotulación contrastados con el inventario fotográfico independiente |
| `npm run verify:wiring` | Extremos, IDs únicos, redes transitivas, separación al retirar, ausencia de uniones internas, más de tres cables compartidos, rechazo de importaciones inválidas y revisión manual de pasos |
| `npm run verify:ui` | Regresión de los 108 bornes, números, búsqueda, inspector, alias, zoom/pan, fotografías y tacto |
| `npm run verify:practice` | Inicio → cableado → curva/capas → retirar/deshacer/rehacer → recargar/continuar → marcar paso → ayudas → comprobar → exportar/importar → nueve retos → cargar imagen → recargar → móvil |
| Navegador | Sin excepciones, solicitudes fallidas ni errores de consola durante la prueba final |
| Tamaños | 1920, 1440, 768, 390 y 360 px; sin desbordamiento horizontal de página. Tacto comprobado con Chromium emulado |
| Acceso actual | El lanzador reconoce el servidor PanelLab v2 en localhost y devuelve la URL correcta |

Evidencia: `qa/fase2/ui-verification.json`, `qa/fase2/wiring-verification.json` y `qa/verification.json`. Las capturas con conexiones son ejemplos de prueba de las herramientas, no soluciones de un circuito del laboratorio.

## Capturas

- [Inicio](qa/fase2/inicio-desktop.png).
- [Diagrama junto al banco](qa/fase2/simulador-vacio-desktop.png).
- [Cableado compartido](qa/fase2/cableado-desktop.png).
- [Guía de un paso marcado manualmente](qa/fase2/guia-manual-desktop.png).
- [Reconocimiento guiado](qa/fase2/reconocimiento-desktop.png).
- [Cableado móvil](qa/fase2/cableado-mobile.png) y [guía móvil](qa/fase2/guia-mobile.png).

## Archivos principales

`App.tsx`, `Home.tsx`, `DiagramPane.tsx`, `StudyGuide.tsx`, `SimulatorInspector.tsx`, `WireInspector.tsx`, `WireLayer.tsx`, `BananaCable.tsx`, `Board.tsx`; `src/data/practice.ts`, `src/data/wiring.ts`, `src/hooks/usePractice.ts`; estilos, metadatos, referencias originales copiadas a `public/diagrams/`, lanzador, pruebas y documentación.

No se añadieron dependencias de la aplicación ni se desplegó. Las alertas heredadas de dependencias documentadas en la entrega v1.1 continúan pendientes de una actualización separada.
