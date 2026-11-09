// Compatibilidad de puertos de Agro. Puro. Devuelve SIEMPRE un motivo legible cuando la unión no es posible
// (requisito de la escena piloto: «señalar por qué una conexión es inválida»).
import type {Port, Result} from './types.ts';

const ok = (): Result<true> => ({ok: true, value: true});
const no = (error: string): Result<true> => ({ok: false, error});

/** Dos puertos con la misma dirección fija no pueden unirse (entrada con entrada, salida con salida). */
function directionsFit(a: Port, b: Port): boolean {
  if (a.direction === 'bidirectional' || b.direction === 'bidirectional') return true;
  return a.direction !== b.direction;
}

const DIRECTION_ES = {in: 'entrada', out: 'salida', bidirectional: 'bidireccional'} as const;
const KIND_ES = {hydraulic: 'hidráulico', power: 'de potencia', signal: 'de señal', mechanical: 'mecánico'} as const;

export function checkPorts(a: Port, b: Port): Result<true> {
  if (a.kind !== b.kind) return no(`No se pueden unir un puerto ${KIND_ES[a.kind]} con uno ${KIND_ES[b.kind]}.`);
  if (!directionsFit(a, b)) return no(`Dos puertos de ${DIRECTION_ES[a.direction]} no se pueden unir entre sí.`);
  if (a.kind === 'hydraulic' && b.kind === 'hydraulic') {
    if (Math.abs(a.spec.diameterMm - b.spec.diameterMm) > 0.01) return no(`Los diámetros no coinciden (${a.spec.diameterMm} mm y ${b.spec.diameterMm} mm): falta un adaptador.`);
    return ok();
  }
  if (a.kind === 'power' && b.kind === 'power') {
    if (a.spec.current !== b.spec.current) return no('No se puede unir corriente alterna con corriente continua.');
    if (a.spec.phases !== b.spec.phases) return no(`Las fases no coinciden (${a.spec.phases} y ${b.spec.phases}).`);
    if (Math.abs(a.spec.voltage - b.spec.voltage) > Math.max(a.spec.voltage, b.spec.voltage) * 0.01) return no(`Las tensiones no coinciden (${a.spec.voltage} V y ${b.spec.voltage} V).`);
    return ok();
  }
  if (a.kind === 'signal' && b.kind === 'signal') {
    if (a.spec.signal !== b.spec.signal) return no(`Las señales no coinciden (${a.spec.signal} y ${b.spec.signal}).`);
    if (a.spec.level && b.spec.level && a.spec.level !== b.spec.level) return no(`Los niveles de señal no coinciden (${a.spec.level} y ${b.spec.level}).`);
    return ok();
  }
  if (a.kind === 'mechanical' && b.kind === 'mechanical') {
    if (a.spec.mount !== b.spec.mount) return no(`Los montajes no son compatibles («${a.spec.mount}» y «${b.spec.mount}»).`);
    return ok();
  }
  return no('Puertos no compatibles.');
}
