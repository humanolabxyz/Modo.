# Publicación 2.6.1 Beta — Robot de ejemplo y física

**Fecha:** 29/10/2026 · **Autorizada por el usuario** («Si confirmo», tras pedir «despliega la nueva actualización»).
**Sitio:** https://modo-lab.vercel.app (proyecto Vercel `modo-lab`) · **Despliegue:** `modo-ggab13ddu-humanolabxyz-9765s-projects.vercel.app`, producción, Ready. Desplegado por CLI (`vercel deploy --prod`) desde la rama `robotica/etapa-1` en el commit `5fede45`. Sin push y sin fusión en `main`.

## Qué incluye
- Etapa 5: modo Simular con cuarto blanco, física Rapier, motores con par y HC-SR04 con rayos.
- Plantilla «Robot 2 ruedas · listo para usar» (armada, cableada y programada).
- Contraseña de `/robotica/` sin cambios (`ROBOTICA_BETA_PASSWORD` no se tocó).

## Antes de publicar
`npm run check` OK · `npm run build` OK (8 páginas) · `verify:float` OK · `verify:pwa` OK (con preview local en el puerto 4324) · inicio aprobado OK (con `SKIP_PROTECTED_HASHES=1`, como en la etapa 1) · contraseña de la Beta OK · `verify-robotics-project` (9 bloques) OK · `verify-robotics-physics` OK.

## Verificado en público
Inicio 200 · `/robotica/` sin clave 401 · `/versiones/` lista 2.6.1.

## No verificado
- `/robotica/` con clave en el sitio público: la contraseña es sensible y no se leyó, así que no se probó el robot de ejemplo ejecutándose en producción.
- Tablet o teléfono reales: sin medir.
- Si Vercel también despliega desde Git al hacer push: no se comprobó. Un push o fusión a `main` podría reemplazar esta versión.
