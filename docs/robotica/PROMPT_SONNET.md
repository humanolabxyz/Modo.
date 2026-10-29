# Prompt para Sonnet (pegar al iniciar cada etapa)

Cambia `N` y el nombre del archivo de la etapa. Pega también las decisiones aprobadas.

---

Vas a implementar **la Etapa N de modo. Robótica** en `C:\Users\HUMANO LAB\Desktop\proyectos2026\paneldecontrol\PanelLab-INACAP`.

**Lee primero, en este orden, sin saltarte ninguno:**
1. `AGENTS.md`
2. `docs/robotica/README.md`
3. `docs/robotica/01_INFORME_INVESTIGACION.md`
4. `docs/robotica/02_ARQUITECTURA_Y_CONTRATOS.md`
5. `docs/robotica/03_DECISIONES_ABIERTAS.md`
6. `docs/robotica/etapas/ETAPA_N_<NOMBRE>.md` ← tu alcance exacto
7. Si la etapa lo menciona, `docs/robotica/fuentes/*.md` (especificación original)

**Decisiones:** el estado vigente está en `docs/robotica/03_DECISIONES_ABIERTAS.md`. No cambies ninguna. Lo marcado 🔬 se verifica con spikes y lo marcado ⏸ no se implementa.
**Aprobación de esta etapa:** <pegar aquí el mensaje del usuario que aprueba la etapa N y cualquier ajuste>
**Criterios fijos:** en línea primero, preparado para funcionar sin conexión (sin CDN, dependencias remotas detrás de interfaces); ventanas = `FloatingWindow` existente; construcción 3D con interacción tipo pizarra de Figma.

**Reglas:**
- Implementa **solo** las tareas de la Etapa N. No adelantes trabajo de etapas siguientes.
- Usa `src/components/FloatingWindow.tsx` para todas las ventanas. Prohibido crear otro gestor de ventanas o instalar una librería de ventanas.
- No cambies la navegación ni el comportamiento de Panel de control, Estudio, Laboratorio ni Comunidad, salvo la quinta tarjeta del inicio.
- Instala solo los paquetes de la tabla de `02_ARQUITECTURA_Y_CONTRATOS.md` §2, con `--save-exact`, y añádelos a `THIRD_PARTY_NOTICES` en `astro.config.mjs`.
- Respeta los tipos del §4 y §5. Si necesitas cambiarlos, explica por qué en el informe.
- Nada de animaciones que imiten la simulación: todo efecto visible debe salir del modelo.
- Sigue el estilo del código vecino (TypeScript estricto, comentarios en español, pruebas en `qa/` con `node:assert` y Playwright como las existentes).
- Trabaja en la rama `robotica/etapa-N`. Commits pequeños y descriptivos. No hagas push ni despliegues.
- Si algo del plan no coincide con el código real, **para y explícalo** antes de improvisar.

**Antes de terminar:** `npm run check`, `npm run build`, las pruebas de la etapa y las regresiones listadas. Verifica en el navegador (escritorio, tablet y teléfono). Entrega el informe con `docs/robotica/PLANTILLA_CIERRE_ETAPA.md`, guardado como `docs/robotica/cierres/ETAPA_N.md`. No empieces la etapa siguiente: espera aprobación.

---
