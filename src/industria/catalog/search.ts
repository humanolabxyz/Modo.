// Búsqueda y agrupación del catálogo. Puro.
import type {ShapeDef} from '../build/shapes.ts';
import {ITEMS} from './items.ts';

export const FAMILIES = ['Electricidad industrial', 'Automatización y control', 'Mecánica y movimiento', 'Neumática', 'Hidráulica', 'Procesos industriales', 'Instrumentación y sensores', 'Robótica industrial', 'Infraestructura', 'Medición y diagnóstico'] as const;

/** Minúsculas y sin tildes: «automatizacion» encuentra «Automatización». */
export const fold = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const haystack = (item: ShapeDef): string => fold([item.name, item.family, item.subfamily ?? '', item.description ?? '', item.id, ...(item.terminals ?? []).map(t => t.label)].join(' '));

/** Ítems que cumplen la búsqueda (todas las palabras) y la familia elegida; conserva el orden del catálogo. */
export function searchItems(query: string, family: string | null = null, items: readonly ShapeDef[] = ITEMS): ShapeDef[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  return items.filter(item => (!family || item.family === family) && words.every(w => haystack(item).includes(w)));
}

export const countByFamily = (items: readonly ShapeDef[] = ITEMS): Record<string, number> => {
  const out: Record<string, number> = Object.fromEntries(FAMILIES.map(f => [f, 0]));
  for (const item of items) out[item.family] = (out[item.family] ?? 0) + 1;
  return out;
};
