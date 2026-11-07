// Fallas inyectables (fase 8). Puro. Una falla no modifica el diseño (cables, piezas, programa): la simulación la aplica y el diagnóstico la localiza.
import {newId} from '../model/defaults.ts';
import {FAULT_KINDS, LIMITS, type Fault, type FaultKind, type IndustryProject, type Result} from '../model/types.ts';

/** Definiciones del catálogo a las que se puede aplicar cada falla (`null` = una conexión). */
export const FAULT_TARGETS: Record<FaultKind, readonly string[] | null> = {
  'wire-open': null,
  'contact-open': ['breaker-1p', 'breaker-3p', 'contactor-3p', 'pulsador-na', 'pulsador-nc', 'rele-termico'],
  'coil-open': ['contactor-3p'],
  'lamp-open': ['piloto'],
  'winding-open': ['motor-3p'],
};
export const FAULT_LABEL: Record<FaultKind, string> = {
  'wire-open': 'Cable abierto', 'contact-open': 'Contactos que no conducen', 'coil-open': 'Bobina abierta', 'lamp-open': 'Piloto fundido', 'winding-open': 'Bobinado abierto',
};
export const FAULT_HELP: Record<FaultKind, string> = {
  'wire-open': 'El cable no conduce (terminal flojo o cable cortado).',
  'contact-open': 'Los contactos de la pieza nunca cierran aunque se opere.',
  'coil-open': 'La bobina no se excita aunque reciba tensión.',
  'lamp-open': 'El piloto no enciende aunque reciba tensión.',
  'winding-open': 'El motor no gira aunque reciba las tres fases.',
};

const labelOf = (p: IndustryProject, id: string | undefined) => p.entities.find(e => e.id === id)?.label ?? id ?? '?';
export function describeFault(p: IndustryProject, f: Fault): string {
  if (f.kind === 'wire-open') {
    const c = p.connections.find(x => x.id === f.connectionId);
    return c ? `${FAULT_LABEL[f.kind]}: ${labelOf(p, c.a.entityId)}.${c.a.terminalId} → ${labelOf(p, c.b.entityId)}.${c.b.terminalId}` : FAULT_LABEL[f.kind];
  }
  return `${FAULT_LABEL[f.kind]}: ${labelOf(p, f.entityId)}`;
}

export function addFault(p: IndustryProject, input: {kind: FaultKind; entityId?: string; connectionId?: string; hidden?: boolean}): Result<IndustryProject> {
  if (!FAULT_KINDS.includes(input.kind)) return {ok: false, error: 'El tipo de falla no es válido.'};
  if (p.faults.length >= LIMITS.faults) return {ok: false, error: `El proyecto admite hasta ${LIMITS.faults} fallas.`};
  const targets = FAULT_TARGETS[input.kind];
  if (targets === null) {
    if (!input.connectionId || !p.connections.some(c => c.id === input.connectionId)) return {ok: false, error: 'Elige el cable de la falla.'};
    if (p.faults.some(f => f.kind === input.kind && f.connectionId === input.connectionId)) return {ok: false, error: 'Ese cable ya tiene una falla.'};
  } else {
    const e = p.entities.find(x => x.id === input.entityId);
    if (!e) return {ok: false, error: 'Elige el componente de la falla.'};
    if (!targets.includes(e.definitionId)) return {ok: false, error: `«${FAULT_LABEL[input.kind]}» no se aplica a «${e.label}».`};
    if (p.faults.some(f => f.kind === input.kind && f.entityId === input.entityId)) return {ok: false, error: 'Ese componente ya tiene esa falla.'};
  }
  const fault: Fault = {id: newId('f'), kind: input.kind, ...(targets === null ? {connectionId: input.connectionId} : {entityId: input.entityId}), ...(input.hidden ? {hidden: true} : {})};
  return {ok: true, value: {...p, faults: [...p.faults, fault]}};
}
export function removeFault(p: IndustryProject, id: string): Result<IndustryProject> {
  return p.faults.some(f => f.id === id) ? {ok: true, value: {...p, faults: p.faults.filter(f => f.id !== id)}} : {ok: false, error: 'La falla no existe.'};
}
export const clearFaults = (p: IndustryProject): Result<IndustryProject> => ({ok: true, value: p.faults.length ? {...p, faults: []} : p});
export const withoutFaults = (p: IndustryProject): IndustryProject => (p.faults.length ? {...p, faults: []} : p);
