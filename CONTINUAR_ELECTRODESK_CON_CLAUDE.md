# Continuar con Claude: adaptación de Electrodesk a Paneldecontrol

## Última decisión del usuario

El usuario pidió detener las ampliaciones funcionales nuevas, dejarlas para Claude y publicar lo terminado. Indicó que faltaban iconos/diseños, especialmente disyuntores. Se completaron las miniaturas de los 41 tipos actuales y el dibujo propio de disyuntores 1P/2P/3P, diferencial, guardamotor y portafusible. No interpretar este documento como aprobación para cambiar el diseño general o publicar futuras funciones sin petición del usuario.

## Publicación verificada

Producción: https://modo-lab.vercel.app/laboratorio?tool=equipment. Git correcto: `humanolabxyz/panellab-inacap`; configuración local de autor corregida a `humanolabxyz`. Código publicado en commit `b71be29`, despliegue `dpl_EsobYegD3duwH61RV2emn1ygE3kx` READY. Ver `PUBLICACION_EQUIPOS_ELECTRICOS.md` para pruebas y límites.

## Proyecto y estado entregado

Proyecto existente: `C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP`.

- 41 tipos en Equipos eléctricos, tres ejemplos, bornes, propiedades, guardado/JSON, historial y PLC compartido.
- Siete tipos adicionales compatibles en Esquemas.
- Miniaturas de todos los tipos basadas en su dibujo real; disyuntores con polos y palancas visibles, estados de maniobra y símbolos diferenciados.
- Banco físico, composición, rutas y herramientas actuales conservados. No reinterpretar sus bornes desconocidos.
- PLC publicado conserva el funcionamiento anterior: TON, TOF, CTU y compilación actual. No incluye todavía TP/CTD/CTUD/flancos ni aplicación separada de borrador.
- Las protecciones siguen siendo manuales/didácticas. Mejorar su apariencia no implementa disparo automático ni curvas.

## Investigación y referencias

Carpeta: `C:/Users/HUMANO LAB/Documents/ChatGPT/extraer electrodesk/`.

Leer `reports/MATRIZ_DE_FUNCIONES.md` (35 oportunidades), `reports/PLAN_DE_INTEGRACION.md`, `reports/DISENO_DE_COMPONENTES_PARA_PANELLAB.md` y `reports/CATALOGO_VISUAL_EXTRAIDO.md`. La matriz es una fotografía histórica, no el estado implementado actual. Ver `reports/ADAPTACION_IMPLEMENTADA.md` y `EQUIPOS_ELECTRICOS_ADAPTADOS.md` para la entrega.

La investigación de Electrodesk fue estática: REA + CFR; no se pudo verificar su lienzo en ejecución. Los 57 archivos visuales y 71 definiciones de dibujo son referencias locales, no 71 componentes terminados. No copiar marcas ni código descompilado al producto.

## Avance funcional interrumpido: no está aplicado al producto

Se conservó fuera del proyecto en:

`C:/Users/HUMANO LAB/Documents/ChatGPT/extraer electrodesk/handoff-claude/plc-incompleto/`

Contiene `avance-no-validado.patch`, `manifest.json` con hashes de la base y copias `.pending` de cinco archivos PLC/modelo y los dos manifiestos npm. El código activo se restauró a la base funcional de antes de ese avance. TypeScript del avance había pasado; **no pasó una validación funcional nueva** y no se publica.

No aplicar el parche completo automáticamente. Comparar primero los hashes y cualquier trabajo posterior. La dependencia jsPDF incluida en los archivos pendientes se había instalado, pero no se implementó un exportador; fue retirada de la versión publicada.

Borrador de implementación preservado:

- TP no redisparable durante su pulso.
- CTD inicia en PV; CTUD con entradas separadas de subida/bajada; reset domina carga y cuenta; dos flancos simultáneos se anulan.
- R_TRIG/F_TRIG por bloque y estado independiente por ID.
- Snapshot del programa aplicado, separado del borrador.
- Pausa que conserva estado y detener que reinicia.
- Ordenación de segmentos y controles de entradas de bloque.

Revisar especialmente la validación del snapshot PLC: el primer borrador la hacía recursivamente contra HMI/proceso actuales, lo que podría rechazar una configuración válida si sus tags cambian. Resolver con validación independiente del programa, sin mezclar snapshots. Añadir pruebas de prioridades, flancos mantenidos, dt, pausa, contador vacío, exportación antigua y borrador inválido que conserva el activo. No anunciar ST completo: conservar su subconjunto actual o ampliar y probar explícitamente.

## Pendientes por oportunidad

| IDs | Estado y trabajo siguiente |
|---|---|
| F01 | Catálogo de 41 tipos integrado; ampliar solo con contrato de bornes/modelo y representación interactiva. |
| F02 | AC/DC equivalente presente; faltan modelos reactivos si se requieren y más casos analíticos. |
| F03 | Mensajes existentes; falta diagnóstico compartido con código, causa, bornes/ruta, evidencia y acción didáctica. |
| F04–F05 | Aspecto y maniobra implementados. Falta sobrecarga temporal, fusible/guardamotor y diferencial con corriente residual y rearme definidos. No inferir curvas reales. |
| F06–F09 | Variador con rampa/sentido, alimentación y conflictos implementados. Completar estados/falla enclavada/rearme y pruebas de DI cortada/órdenes contradictorias. |
| F10 | rpm estimada presente; separar rpm síncrona y estimada, y exponer deslizamiento educativo. |
| F11–F12 | Continuar el avance PLC de arriba, con pruebas y migración; no está activo. |
| F13 | Ramas/comentarios existentes; el borrador de reordenación está en el parche pendiente. |
| F14–F18 | Medición, kWh/tarifa, batería/FV y convertidores equivalentes implementados; documentar límites y probar balance y flujos negativos. |
| F19 | Falta calculadora solar con datos del alumno: Wh/día, demanda simultánea, autonomía, HSP y pérdidas; no inventar HSP ni tarifas. |
| F20–F21 | Cableado ortogonal y varios cables por borne presentes; faltan rutas editables que eviten obstáculos y mejor selección de extremos apilados. |
| F22 | Falta selección múltiple/copiar/duplicar conservando conexiones internas, etiquetas vinculadas e IDs nuevos. |
| F23 | Vista detallada y simplificada presentes; disyuntores ya tienen símbolo; completar símbolos específicos donde aún son un bloque rotulado. |
| F24 | Rótulos presentes; faltan anotaciones/trazos no eléctricos y su exportación. |
| F25 | JSON de proyecto y montaje validado/aditivo existente. Falta vista previa del contenido antes de incorporar. |
| F26 | Biblioteca local existente; faltan miniaturas y metadatos por proyecto, sin sobrescribir guardados bloqueados. |
| F27 | Historial/deshacer/rehacer conservado. Probar cada nuevo gesto como una operación. |
| F28–F30 | Faltan PDF con cajetín, lista técnica/netlist y exportación de imagen desde el mismo estado, sin modificar el circuito. |
| F31 | Conservar lecciones actuales; añadir prácticas originales verificadas para los nuevos equipos. |
| F32 | Velocidad/dt presentes; falta pausa explícita en interfaz y pruebas de equivalencia temporal entre velocidades. |
| F33 | Falta sonido opcional por cambio de estado, sin repetición por render y desactivado por defecto. |
| F34 | Nube/cuentas/IA siguen pospuestas; no son requisito para terminar la ampliación local. |
| F35 | Conservar conexiones explícitas. La proximidad no debe unir ni energizar nodos. |

## Cobertura visual todavía pendiente

La publicación corrige los iconos de los tipos existentes. No afirmar que se reprodujeron todas las variantes de las 57 referencias. Revisar y adaptar después, al lenguaje de Paneldecontrol:

- Disyuntores DC 1P/2P como variantes visuales explícitas y coherentes con su modelo.
- Pilotos verde/rojo/ámbar, pulsadores amarillo/verde/rojo y sus estados.
- Interruptor de pared, bombillo, barra de neutro y rieles de 8/12 posiciones.
- Variantes simbólicas de contactor y térmico; símbolos específicos de los demás equipos.
- Rotulación y terminales legibles en todos los zooms, sin pegar imágenes de referencia encima de la interfaz.

Los estados ON/OFF de una misma imagen no representan dos componentes nuevos. Los iconos de compartir/basura son controles de interfaz.

## Validación y preservación

Leer primero `AGENTS.md` y los documentos v1.1, distinguiendo su fase histórica del código actual. Preservar los equipos existentes, datos del banco, detección, temperatura, protoboard, simulación y las fuentes técnicas confirmadas. No desplegar automáticamente futuras ampliaciones.

Comandos: `npm install`, `npm run check`, `npm run build`, `npm run verify:lab`, `npm run verify:equipment`, `npm run verify:equipment-ui`, `node qa/verify-equipment-icons.cjs`, `npm run verify:detectors` y `npm run verify:simulation`. Usar `PANELLAB_URL` para el servidor que esté activo. No detener servidores de otros trabajos.

Comparar escritorio y móvil, errores de navegador, overflow, recarga y export/import; conservar las capturas base en `extraer electrodesk/qa-adaptacion/before/`. Las pruebas móviles son emulación, no validación en equipo físico.
