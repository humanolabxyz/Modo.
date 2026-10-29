import {ROBOTICS_FORMAT, ROBOTICS_VERSION} from './types.ts';

export type MigrationResult = {ok: true; value: Record<string, unknown>} | {ok: false; error: string};

const FOREIGN: Record<string, string> = {
  'panellab-laboratory': 'Laboratorio',
  'modo-equipment': 'Equipos',
  'modo-cabinet-report': 'Tableros',
};

/** Lleva cualquier archivo conocido a la versión vigente. Solo existe la versión 1: aquí se añadirán las migraciones futuras. */
export function migrateRobotProject(raw: unknown): MigrationResult {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {ok: false, error: 'El archivo no es un proyecto de Robótica.'};
  const data = raw as Record<string, unknown>;
  const format = data.format;
  if (format !== ROBOTICS_FORMAT) {
    const owner = typeof format === 'string' ? FOREIGN[format] : undefined;
    if (owner) return {ok: false, error: `Este archivo es de ${owner}; ábrelo en ${owner}.`};
    return {ok: false, error: 'El archivo no es un proyecto de Robótica (falta el formato «modo-robotica»).'};
  }
  const version = data.version;
  if (typeof version !== 'number' || !Number.isInteger(version)) return {ok: false, error: 'El proyecto no indica su versión.'};
  if (version > ROBOTICS_VERSION) return {ok: false, error: `El proyecto es de una versión más nueva (${version}). Actualiza modo. para abrirlo.`};
  if (version < 1) return {ok: false, error: `Versión de proyecto desconocida (${version}).`};
  return {ok: true, value: data};
}
