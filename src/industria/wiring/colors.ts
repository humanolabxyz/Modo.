// Color de cada cable según su función y puntera según su sección (fase 16). Puro: se prueba en Node.
//
// IMPORTANTE: es una convención de EJEMPLO para enseñar, tomada de material educativo y comercial chileno (NCh Elec 4/2003: fase 1 azul, fase 2 negro, fase 3 rojo,
// neutro blanco, protección verde o verde/amarillo) y de prácticas habituales de tableros (24 V CC, sensores). No se contrastó con el texto oficial de la norma y las
// fuentes de tableros de máquina (IEC 60204-1) se contradicen entre sí. Las secciones y los colores de puntera son los de una familia DIN de ejemplo; cambian según el fabricante.
import type {Connection, IndustryProject} from '../model/types.ts';
import {terminalDef} from './engine.ts';

export type WireRole = 'L1' | 'L2' | 'L3' | 'N' | 'PE' | 'DCP' | 'DCN' | 'CTRL' | 'SIG' | 'PIPE';
export const WIRE_COLORS: Record<WireRole, {color: string; name: string}> = {
  L1: {color: '#2b59c3', name: 'Fase 1 · azul'}, L2: {color: '#2a2f36', name: 'Fase 2 · negro'}, L3: {color: '#d62b2b', name: 'Fase 3 · rojo'},
  N: {color: '#e9edf2', name: 'Neutro · blanco'}, PE: {color: '#6fae3a', name: 'Tierra · verde/amarillo'},
  DCP: {color: '#8a5a2b', name: '24 V CC (+) · marrón'}, DCN: {color: '#4aa3df', name: '0 V CC (−) · azul claro'},
  CTRL: {color: '#e8741e', name: 'Mando · naranja'}, SIG: {color: '#5a6270', name: 'Señal de sensor · gris oscuro'}, PIPE: {color: '#7da3c9', name: 'Aire comprimido · tubo azul'},
};
export const WIRE_COLOR_NOTE = 'Convención de ejemplo (Chile, NCh Elec 4/2003 según material educativo); no verificada contra el texto de la norma. Cambia según el país, la norma de la máquina y el cliente.';

/** Fase que sigue cada terminal de fuerza (1/2 → L1, 3/4 → L2, 5/6 → L3; U1/V1/W1 → L1/L2/L3). */
const PHASE_OF: Record<string, 'L1' | 'L2' | 'L3'> = {'1': 'L1', '2': 'L1', '3': 'L2', '4': 'L2', '5': 'L3', '6': 'L3', L1: 'L1', L2: 'L2', L3: 'L3', U1: 'L1', V1: 'L2', W1: 'L3', L: 'L1'};

/** Función eléctrica de un cable, mirando los dos extremos (tierra y neutro mandan sobre la fase). */
export function wireRole(p: IndustryProject, c: Connection): WireRole {
  const ends = [c.a, c.b].map(r => ({r, def: terminalDef(p, r)}));
  const has = (f: (e: (typeof ends)[number]) => boolean) => ends.some(f);
  if (has(e => e.def?.role === 'ground' || e.def?.kind === 'earth')) return 'PE';
  if (c.kind === 'pipe' || has(e => e.def?.kind === 'pipe')) return 'PIPE';
  if (has(e => e.def?.role === 'neutral')) return 'N';
  if (has(e => e.def?.role === 'positive')) return 'DCP';
  if (has(e => e.def?.role === 'negative')) return 'DCN';
  if (c.kind === 'power') { for (const e of ends) { const ph = PHASE_OF[e.r.terminalId]; if (ph) return ph; } return 'L1'; }
  if (c.kind === 'signal') return has(e => e.def?.kind === 'control') ? 'CTRL' : 'SIG'; // una salida del PLC que va a una bobina o lámpara es de mando
  return 'CTRL';
}

/** Puntera de ejemplo según la función: sección (mm²) y color DIN de una familia concreta. */
export type Ferrule = {section: number; color: string; name: string};
export function ferruleFor(role: WireRole): Ferrule {
  if (role === 'L1' || role === 'L2' || role === 'L3' || role === 'N' || role === 'PE') return {section: 2.5, color: '#2f6fd1', name: '2,5 mm² · azul'};
  if (role === 'DCP' || role === 'DCN' || role === 'CTRL') return {section: 0.75, color: '#b7bec8', name: '0,75 mm² · gris'};
  return {section: 0.5, color: '#f1f3f6', name: '0,5 mm² · blanco'};
}

/** Apariencia completa de un cable. */
export const wireLook = (p: IndustryProject, c: Connection) => { const role = wireRole(p, c); return {role, ...WIRE_COLORS[role], ferrule: ferruleFor(role)}; };

/** Nombre corto del cable para su etiqueta (el que puso el usuario o W + número). */
export const wireName = (p: IndustryProject, c: Connection): string => c.label?.trim() || `W${p.connections.indexOf(c) + 1}`;
