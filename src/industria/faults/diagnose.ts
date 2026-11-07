// Diagnóstico de fallas (fase 8). Puro. Compara la simulación con las fallas aplicadas contra la misma simulación sin fallas (el diseño «sano»)
// y localiza dónde se pierde la tensión o dónde un equipo no responde. Es la misma lógica de un técnico: «¿hay tensión antes y no después?».
//
// Límite honesto: solo localiza lo que el modelo simula (cables abiertos, contactos, bobina, piloto, bobinado). No diagnostica fallas de
// aislamiento, sobrecarga ni nada que requiera valores eléctricos; y si el diseño sano tampoco funciona, no hay nada que comparar.
import type {IndustryProject} from '../model/types.ts';
import {CLOSED_PAIRS, simulate, type SimInputs, type SimResult} from '../sim/engine.ts';
import {withoutFaults} from './faults.ts';

export type Symptom = {entityId: string; label: string; text: string};
export type Candidate = {kind: 'connection' | 'device'; id: string; label: string; reason: string; /** ¿coincide con una falla inyectada? (para evaluar; no mostrar al alumno en modo Prueba) */ injected: boolean};
export type Diagnosis = {
  /** Lo que el diseño sano hace y con las fallas no ocurre. */
  symptoms: Symptom[];
  candidates: Candidate[];
  /** Cuántas fallas hay aplicadas (informativo). */
  faultCount: number;
  summary: string;
};

type Previous = {energized: Record<string, boolean>; plc: SimResult['plc']};
const SYMPTOM: Record<string, [string, string]> = {
  'contactor-3p': ['se excita', 'no se excita'], piloto: ['enciende', 'no enciende'], 'motor-3p': ['recibe alimentación', 'no recibe alimentación'],
  'fuente-cc': ['entrega salida', 'no entrega salida'], 'plc-generico': ['se alimenta', 'no se alimenta'],
};

export function diagnose(p: IndustryProject, inputs: SimInputs, previous: Previous = {energized: {}, plc: {}}): Diagnosis {
  const healthy = simulate(withoutFaults(p), inputs, previous.energized, previous.plc), faulty = simulate(p, inputs, previous.energized, previous.plc);
  const label = (id: string) => p.entities.find(e => e.id === id)?.label ?? id;
  const symptoms: Symptom[] = [];
  for (const e of p.entities) {
    const text = SYMPTOM[e.definitionId];
    if (text && healthy.energized[e.id] && !faulty.energized[e.id]) symptoms.push({entityId: e.id, label: e.label, text: `${e.label}: el diseño sano ${text[0]} y con las fallas ${text[1]}.`});
  }

  const candidates: Candidate[] = [], seen = new Set<string>();
  const add = (c: Omit<Candidate, 'injected'>) => { if (seen.has(c.kind + c.id)) return; seen.add(c.kind + c.id); candidates.push({...c, injected: injectedFor(p, c)}); };
  const key = (e: string, t: string) => `${e}:${t}`;

  // Cables con tensión en un extremo y sin tensión en el otro (en el sano conducen)
  for (const c of p.connections) {
    const a = key(c.a.entityId, c.a.terminalId), b = key(c.b.entityId, c.b.terminalId);
    const wasOk = healthy.live.has(a) && healthy.live.has(b);
    if (wasOk && faulty.live.has(a) !== faulty.live.has(b)) add({kind: 'connection', id: c.id, label: `${label(c.a.entityId)}.${c.a.terminalId} → ${label(c.b.entityId)}.${c.b.terminalId}`, reason: 'Hay tensión en un extremo del cable y no en el otro: revisa el cable y sus bornes.'});
  }
  // Contactos que en el sano conducen y con las fallas cortan la tensión
  for (const e of p.entities) {
    const pairs = CLOSED_PAIRS[e.definitionId]; if (!pairs || !healthy.closed[e.id]) continue;
    // Un contactor que no cerró porque su bobina no se excitó no es sospechoso por sus contactos: la causa está en la bobina o aguas arriba.
    if (e.definitionId === 'contactor-3p' && !faulty.energized[e.id]) continue;
    for (const [x, y] of pairs) {
      const kx = key(e.id, x), ky = key(e.id, y);
      if (healthy.live.has(kx) && healthy.live.has(ky) && faulty.live.has(kx) !== faulty.live.has(ky)) add({kind: 'device', id: e.id, label: e.label, reason: `Los contactos ${x}–${y} de «${e.label}» no conducen: hay tensión en un lado y no en el otro.`});
    }
  }
  // Equipos que reciben tensión y no responden
  const T = (entityId: string, terminalId: string) => ({entityId, terminalId});
  for (const e of p.entities) {
    if (!healthy.energized[e.id] || faulty.energized[e.id]) continue;
    if (e.definitionId === 'contactor-3p' && faulty.hasPotential(T(e.id, 'A1'), T(e.id, 'A2'))) add({kind: 'device', id: e.id, label: e.label, reason: `La bobina de «${e.label}» recibe tensión entre A1 y A2 y no se excita: ¿bobina abierta?`});
    if (e.definitionId === 'piloto' && faulty.hasPotential(T(e.id, 'X1'), T(e.id, 'X2'))) add({kind: 'device', id: e.id, label: e.label, reason: `«${e.label}» recibe tensión entre X1 y X2 y no enciende: ¿lámpara fundida?`});
    if (e.definitionId === 'motor-3p' && ['U1', 'V1', 'W1'].every(t => faulty.live.has(key(e.id, t)))) add({kind: 'device', id: e.id, label: e.label, reason: `«${e.label}» recibe tensión en U1, V1 y W1 y no recibe alimentación completa: ¿bobinado abierto?`});
  }

  const summary = symptoms.length === 0 ? 'Con estas fallas el circuito se comporta igual que el diseño sano en esta operación: no hay síntomas que localizar.'
    : candidates.length === 0 ? 'Hay síntomas pero no se pudo acotar el lugar con la información del modelo.'
      : `${symptoms.length} síntoma(s) y ${candidates.length} punto(s) sospechoso(s): mide aguas arriba y aguas abajo de cada uno.`;
  return {symptoms, candidates, faultCount: p.faults.length, summary};
}

function injectedFor(p: IndustryProject, c: Omit<Candidate, 'injected'>): boolean {
  return p.faults.some(f => (c.kind === 'connection' ? f.connectionId === c.id : f.entityId === c.id));
}
