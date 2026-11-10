// Reglas del autoguardado de Agro (Etapa 1). Puras: se prueban en Node; el Workspace solo las aplica.
// Protegen la integridad del documento: un trazo de terreno a medias (aún sin cerrar ni entrar al historial) no se guarda en un autoguardado normal.
export type AutosaveSubject = {version: number; terrain: {painting: boolean}};
export type AutosaveDecision = {save: true} | {save: false; reason: 'sin-cambios' | 'trazo-en-curso'};

/** Intervalo (ms) para reintentar mientras hay un trazo abierto. */
export const STROKE_RETRY_MS = 300;

/**
 * ¿Debe guardarse ahora? `force` lo usan la salida de la página y el cierre del mundo: guardan aunque haya un trazo abierto, pero el documento NUNCA incluye las marcas de ese trazo
 * (`TerrainModel.toTerrain` solo serializa las ediciones confirmadas), así que se conserva el último terreno confirmado y no un trazo a medias.
 */
export function autosaveDecision(subject: AutosaveSubject, savedVersion: number, force = false): AutosaveDecision {
  if (subject.version === savedVersion) return {save: false, reason: 'sin-cambios'};
  if (subject.terrain.painting && !force) return {save: false, reason: 'trazo-en-curso'};
  return {save: true};
}
