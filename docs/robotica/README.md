# modo. Robótica — Hoja de ruta de implementación

**Robot de orugas con radar, cara, brazos que recogen y sonidos (31/10/2026):** [Etapas 2 y 3](ROBOT_ORUGAS_RADAR_Y_CARA_2026-10-30.md): robot de pie con orugas, cuerpo con vidrio, cuello con servo que gira la cabeza y el radar, pantalla OLED real por I²C con la biblioteca Adafruit, freno del L298N, **dos brazos largos con hombro, codo y pinza que agarran, levantan y sueltan cubos** (variante «recoge cubos»), **sonidos sintetizados de motores, orugas, servos y pinzas** con botón para silenciar, y guías de armado, cableado y programación. El catálogo llega a 35 piezas. Implementación local, sin publicar desde la 2.7.0.

**Cableado paso a paso (30/10/2026):** [Guía dentro de la app](GUIA_CABLEADO_PASO_A_PASO_2026-10-30.md): botón «Cableado» en Construir, pasos con su porqué, pines resaltados en 3D, aviso de cable equivocado y «Poner el cable por mí». Cable espectro en el 3D y guías para **todos** los robots con plantilla (generadas desde su cableado). **Etapa 1 completa:** además [Programar paso a paso y Armar por pasos](GUIAS_PROGRAMAR_Y_ARMAR_2026-10-30.md): de un proyecto vacío a un robot que funciona usando solo las tres guías.

**Servo y sensores (30/10/2026):** [Servo SG90, potenciómetro y pulsador](SERVO_Y_SENSORES_2026-10-30.md), con controles en vivo en la Consola y medición de rendimiento de la simulación. Implementación local, sin publicar.

**Ventana del brazo (30/10/2026):** [Entrada guiada y ventana movible/ajustable](VENTANAS_BRAZO_UX_2026-10-30.md), con el gestor existente, inicio directo, control manual preparado y emergencia accesible con la ventana minimizada.

**Cinta y clasificación (30/10/2026):** [Célula E6 con transporte, presencia y RGB](CELULA_CINTA_CLASIFICADORA_2026-10-30.md). Recogida coordinada, destinos por color y fallas de atasco/sensor, dentro del taller actual. Implementación local.

**Ciclos E6 (30/10/2026):** [Recoger, depositar y transferir tres piezas](FASE_2_BRAZO_E6_CICLOS.md), preparación desde la escena, puntos editables, comprobación de agarre y entregas por posición física. Implementación local.

**Modo combate independiente (30/10/2026):** [Arena 2.6.4](MODO_COMBATE_2_6_4.md), pantalla propia `/arena/`, cámara y cuenta regresiva animadas, efectos de contactos reales, sonido opcional y carga separada del taller.

**Robots de empuje (30/10/2026):** [Cuña, pala 4WD y defensa frontal](AMPLIACION_SUMO_PALAS_CUNAS_2026-10-30.md), tres construcciones editables y tres accesorios sueltos con geometría de contacto, disponibles en el taller y la arena.

**Arena de sumo (30/10/2026):** [Fase 2 · construir y enfrentar dos robots](FASE_2_ARENA_SUMO.md), con programas independientes, física compartida, resultado, pausa y revancha. Implementación local; combate con daño pendiente para la siguiente fase.

**Ampliación de brazos (29/10/2026):** [Fase 1 · operación del Dobot E6](FASE_1_BRAZO_E6_OPERACION.md), con modelo oficial, Jog, MovJ/MovL, puntos enseñados, colisiones y liberación física. Implementación local; ver en ese informe las pruebas y los límites de fidelidad.

Preparado el 28 de octubre de 2026 con Claude Opus, a partir de los cinco documentos de `fuentes/` (paquete `MODO_ROBOTICA_DOCUMENTACION_COMPLETA.zip`) y de la lectura del código real de este repositorio (versión 2.5.4).

**Estado (29/10/2026): las etapas 1 a 5 están implementadas** en la rama `robotica/etapa-1` (informes en `cierres/ETAPA_1.md` … `ETAPA_5.md`). Las etapas 1–4 están aprobadas; la 5 (física con Rapier, escenario y sensor con rayos) espera tu validación. Publicado: 2.6.0 Beta con contraseña (`PUBLICACION_2.6.0_BETA.md`); la 2.6.1 con la física está preparada y **sin publicar**. Falta medir el rendimiento en tablet y teléfono reales.

**Revisión 2 (28/10/2026):** decisiones revisadas por el usuario (ver `03`). La etapa 1 está ajustada y **aprobada (28/10/2026)**. Las etapas 2–5 siguen sin aprobar. Los cambios principales:
- emulación real del ATmega328P con avr8js, en lugar de un intérprete propio;
- funcionamiento en línea primero, preparado para trabajar sin conexión;
- pizarra 3D tipo Figma;
- spikes de verificación de avr8js, del compilador y de Rapier.

## Cómo usar esta carpeta

1. Lee `01_INFORME_INVESTIGACION.md`: qué existe en el código y qué se reutiliza (con rutas y líneas).
2. Lee `02_ARQUITECTURA_Y_CONTRATOS.md`: stack, carpetas, tipos TypeScript y contratos entre motores.
3. Resuelve las decisiones de `03_DECISIONES_ABIERTAS.md` (cada una trae una recomendación).
4. Abre una sesión con Sonnet y pega `PROMPT_SONNET.md`, indicando la etapa aprobada.
5. Sonnet trabaja **una sola etapa** (`etapas/ETAPA_N_*.md`) y entrega el informe con `PLANTILLA_CIERRE_ETAPA.md`.
6. Revisas la evidencia y apruebas (o no) la siguiente etapa.

## Índice

| Archivo | Contenido |
| --- | --- |
| `fuentes/00…04_*.md` | Documentos originales del encargo (no editar: son la especificación). |
| `01_INFORME_INVESTIGACION.md` | Mapa del código existente, gestor de ventanas, proyectos, CSP, service worker, riesgos verificados. |
| `02_ARQUITECTURA_Y_CONTRATOS.md` | Stack con versiones, estructura de carpetas, modelo `RobotProject`, contratos de motores. |
| `03_DECISIONES_ABIERTAS.md` | Decisiones que necesitan tu aprobación antes de cada etapa. |
| `etapas/ETAPA_1_INTEGRACION.md` | Quinta tarjeta, página `/robotica/`, ventanas, canvas 3D vacío, guardado. |
| `etapas/ETAPA_2_CONSTRUCTOR.md` | Catálogo, transformaciones, ensamblaje y uniones. |
| `etapas/ETAPA_3_CABLEADO.md` | Pines, cables 3D, grafo eléctrico, diagnóstico. |
| `etapas/ETAPA_4_PROGRAMACION.md` | Editor, ejecución del sketch en worker, reloj fino, HC-SR04. |
| `etapas/ETAPA_5_SIMULACION.md` | Cubo blanco, Rapier, locomoción diferencial, prueba integral. |
| `PROMPT_SONNET.md` | Instrucción lista para pegar en cada sesión de implementación. |
| `PLANTILLA_CIERRE_ETAPA.md` | Formato obligatorio del informe de cierre. |

## Reglas que no cambian

- **Una etapa a la vez**, con aprobación explícita del usuario entre etapas.
- **No crear un gestor de ventanas nuevo**: se usa `src/components/FloatingWindow.tsx` tal cual, con los cambios mínimos y retrocompatibles que lista el informe.
- **No tocar** la navegación ni el comportamiento de Panel de control, Estudio, Laboratorio y Comunidad. Solo se añade la quinta tarjeta.
- **No falsear la simulación**: ningún movimiento, LED o lectura que no provenga de la cadena programa → pines → driver → motores → física → sensor → programa.
- Antes de cerrar cada etapa: `npm run check`, `npm run build`, las pruebas propias de la etapa y las regresiones listadas. Lo que no pueda probarse se declara como bloqueado, nunca como aprobado.
