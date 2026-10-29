# modo. Robótica — Hoja de ruta de implementación

Preparado el 28 de octubre de 2026 con Claude Opus, a partir de los cinco documentos de `fuentes/` (paquete `MODO_ROBOTICA_DOCUMENTACION_COMPLETA.zip`) y de la lectura del código real de este repositorio (versión 2.5.4).

**Estado (29/10/2026): la etapa 1 está implementada** en la rama `robotica/etapa-1` (informe en `cierres/ETAPA_1.md`, pendiente de validación del usuario). Las etapas 2–5 no están implementadas ni aprobadas.

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
