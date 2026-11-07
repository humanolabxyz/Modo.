// Catálogo de Industria (fase 4). Puro: se prueba en Node (qa/verify-industria-catalog.mjs).
//
// REGLA: ningún ítem es de un fabricante concreto ni lleva valores eléctricos o mecánicos de un producto real. Son piezas didácticas
// («genérico»): sirven para construir, montar y, más adelante, cablear y simular, pero sus medidas son de ejemplo.
// Un ítem solo puede pasar a `verified` con una `source` (datasheet, norma, medición…) y su fecha de contraste; lo exige la prueba.
// El marcado de terminales (1/2, 3/4, 5/6, A1/A2, 13/14…) es la convención habitual de la aparamenta de baja tensión (IEC 60947 / EN 50005);
// no se contrastó con el documento de la norma, por eso los ítems siguen como «genérico · no verificado».
import type {AnchorDef, ShapeDef, TerminalDef} from '../build/shapes.ts';
import type {Vec3} from '../model/types.ts';

const TERMINAL_SOURCE = 'Marcado de terminales según la convención habitual de la aparamenta de baja tensión (IEC 60947 / EN 50005). No contrastado con el documento de la norma.';

/** Posiciones x de `n` polos de ancho `w`, centradas. */
const poles = (n: number, w: number): number[] => Array.from({length: n}, (_, i) => (i - (n - 1) / 2) * w);

/** Anclaje de riel DIN en el dorso de un aparato (el aparato se orienta con su dorso hacia el riel). */
const clip = (depth: number): AnchorDef => ({id: 'clip', label: 'Clip de riel', role: 'child', kind: 'din-rail', position: [0, 0, -depth / 2], normal: [0, 0, -1], up: [0, 1, 0]});

/** Aparato modular de riel: dorso con clip; terminales arriba (impares) y abajo (pares). */
function dinDevice(spec: {id: string; name: string; subfamily: string; description: string; size: Vec3; color: string; top: string[]; bottom: string[]; kind?: TerminalDef['kind']; extra?: TerminalDef[]; family?: string; roles?: Record<string, TerminalDef['role']>}): ShapeDef {
  const [w, h, d] = spec.size;
  const row = (labels: string[], y: number, group: string): TerminalDef[] => {
    const xs = poles(labels.length, labels.length > 1 ? Math.min(0.0175, (w - 0.006) / (labels.length - 1)) : 0);
    return labels.map((label, i) => ({id: label, label, position: [xs[i], y + (y > 0 ? -0.008 : 0.008), d / 2] as Vec3, kind: spec.kind ?? 'power', group, ...(spec.roles?.[label] ? {role: spec.roles[label]} : {})}));
  };
  return {
    id: spec.id, name: spec.name, family: spec.family ?? 'Electricidad industrial', subfamily: spec.subfamily, description: spec.description, size: spec.size, center: [0, 0, 0], color: spec.color,
    anchors: [clip(d)], terminals: [...row(spec.top, h / 2, 'superior'), ...row(spec.bottom, -h / 2, 'inferior'), ...(spec.extra ?? [])], terminalSource: TERMINAL_SOURCE, status: 'generic',
  };
}

export const ITEMS: readonly ShapeDef[] = [
  // — Infraestructura: estructura y tablero —
  {
    id: 'generico', name: 'Bloque genérico', family: 'Infraestructura', subfamily: 'Estructura', description: 'Bloque de prueba para apilar y comprobar anclajes de superficie.', size: [0.4, 0.4, 0.4], center: [0, 0.2, 0], color: '#9aa7b8', status: 'generic',
    anchors: [
      {id: 'base', label: 'Base', role: 'child', kind: 'surface', position: [0, 0, 0], normal: [0, -1, 0]},
      {id: 'top', label: 'Cara superior', role: 'host', kind: 'surface', position: [0, 0.4, 0], normal: [0, 1, 0], multi: true,
        slide: {axes: [[1, 0, 0], [0, 0, 1]], limits: [[-0.15, 0.15], [-0.15, 0.15]]}},
    ],
  },
  {
    id: 'placa', name: 'Placa de montaje', family: 'Infraestructura', subfamily: 'Tablero', description: 'Placa vertical sobre la que se montan rieles y aparatos.', size: [0.8, 1, 0.02], center: [0, 0.5, 0], color: '#d9a066', status: 'generic',
    anchors: [
      {id: 'base', label: 'Base', role: 'child', kind: 'surface', position: [0, 0, 0], normal: [0, -1, 0]},
      {id: 'cara', label: 'Cara frontal', role: 'host', kind: 'surface', position: [0, 0.5, 0.01], normal: [0, 0, 1], up: [0, 1, 0], multi: true,
        slide: {axes: [[1, 0, 0], [0, 1, 0]], limits: [[-0.35, 0.35], [-0.45, 0.45]]}},
    ],
  },
  {
    id: 'riel', name: 'Riel DIN', family: 'Infraestructura', subfamily: 'Tablero', description: 'Riel simétrico para aparatos modulares.', size: [0.6, 0.035, 0.01], center: [0, 0, 0], color: '#b9c0ca', status: 'generic',
    anchors: [
      {id: 'dorso', label: 'Dorso', role: 'child', kind: 'surface', position: [0, 0, -0.005], normal: [0, 0, -1], up: [0, 1, 0]},
      {id: 'riel', label: 'Riel', role: 'host', kind: 'din-rail', position: [0, 0, 0.005], normal: [0, 0, 1], up: [0, 1, 0], multi: true,
        slide: {axes: [[1, 0, 0]], limits: [[-0.28, 0.28]]}},
    ],
  },
  // — Electricidad industrial: aparamenta modular —
  {
    id: 'aparato-din', name: 'Aparato para riel', family: 'Electricidad industrial', subfamily: 'Aparamenta', description: 'Aparato modular sin función: sirve para probar el montaje sobre riel.', size: [0.09, 0.09, 0.06], center: [0, 0, 0], color: '#5b7fb5', anchors: [clip(0.06)], status: 'generic',
  },
  dinDevice({id: 'breaker-1p', name: 'Interruptor automático 1P', subfamily: 'Protección', description: 'Interruptor magnetotérmico unipolar genérico (sin curva ni corriente nominal definidas).', size: [0.0175, 0.09, 0.06], color: '#7a8798', top: ['1'], bottom: ['2']}),
  dinDevice({id: 'breaker-3p', name: 'Interruptor automático 3P', subfamily: 'Protección', description: 'Interruptor magnetotérmico tripolar genérico (sin curva ni corriente nominal definidas).', size: [0.0525, 0.09, 0.06], color: '#7a8798', top: ['1', '3', '5'], bottom: ['2', '4', '6']}),
  dinDevice({id: 'contactor-3p', name: 'Contactor 3P', subfamily: 'Maniobra', description: 'Contactor tripolar genérico con bobina y un contacto auxiliar (sin tensión de bobina ni categoría de empleo definidas).', size: [0.045, 0.085, 0.085], color: '#3d5a80', top: ['1', '3', '5'], bottom: ['2', '4', '6'],
    extra: [
      {id: 'A1', label: 'A1', position: [0.0115, 0.0225, 0.0425], kind: 'control', group: 'bobina'}, {id: 'A2', label: 'A2', position: [0.0115, -0.0225, 0.0425], kind: 'control', group: 'bobina'},
      {id: '13', label: '13', position: [-0.0115, 0.0225, 0.0425], kind: 'control', group: 'auxiliar'}, {id: '14', label: '14', position: [-0.0115, -0.0225, 0.0425], kind: 'control', group: 'auxiliar'},
    ]}),
  {
    id: 'borne-paso', name: 'Borne de paso', family: 'Electricidad industrial', subfamily: 'Conexión', description: 'Borne de paso genérico: dos terminales unidos entre sí.', size: [0.006, 0.05, 0.04], center: [0, 0, 0], color: '#a67c52', status: 'generic',
    anchors: [clip(0.04)], terminals: [{id: '1', label: '1', position: [0, 0.017, 0.02], kind: 'power', group: 'superior'}, {id: '2', label: '2', position: [0, -0.017, 0.02], kind: 'power', group: 'inferior'}], terminalSource: TERMINAL_SOURCE, bridges: [['1', '2']],
  },
  dinDevice({id: 'rele-termico', name: 'Relé térmico', subfamily: 'Protección', description: 'Relé de protección de motor genérico, sin curva de disparo ni ajuste: se dispara a mano para practicar (no se modela la sobrecarga). Tres polos de fuerza y un contacto auxiliar NC (95–96).', size: [0.045, 0.085, 0.07], color: '#5a6b7d', top: ['1', '3', '5'], bottom: ['2', '4', '6'],
    extra: [{id: '95', label: '95', position: [-0.0115, 0.0225, 0.035], kind: 'control', group: 'auxiliar'}, {id: '96', label: '96', position: [-0.0115, -0.0225, 0.035], kind: 'control', group: 'auxiliar'}]}),
  dinDevice({id: 'fuente-cc', name: 'Fuente de alimentación CC', subfamily: 'Alimentación', description: 'Fuente conmutada genérica (sin tensión ni corriente de salida definidas).', size: [0.054, 0.09, 0.06], color: '#4a6a4a', top: ['L', 'N'], bottom: ['L+', 'M'], roles: {L: 'line', N: 'neutral', 'L+': 'positive', M: 'negative'}}),
  // — Mando y señalización —
  dinDevice({id: 'pulsador-na', name: 'Pulsador NA', subfamily: 'Mando', description: 'Pulsador de contacto normalmente abierto, genérico: cierra mientras se mantiene pulsado.', size: [0.0225, 0.06, 0.05], color: '#2f7d4f', kind: 'control', top: ['3'], bottom: ['4']}),
  dinDevice({id: 'pulsador-nc', name: 'Pulsador NC', subfamily: 'Mando', description: 'Pulsador de contacto normalmente cerrado, genérico: conduce en reposo y abre mientras se mantiene pulsado.', size: [0.0225, 0.06, 0.05], color: '#b5473a', kind: 'control', top: ['1'], bottom: ['2']}),
  dinDevice({id: 'piloto', name: 'Piloto luminoso', subfamily: 'Señalización', description: 'Indicador luminoso genérico: se enciende cuando hay tensión entre X1 y X2.', size: [0.0225, 0.06, 0.05], color: '#c9a400', kind: 'control', top: ['X1'], bottom: ['X2']}),
  // — Alimentación —
  {
    id: 'red-3f', name: 'Red trifásica', family: 'Electricidad industrial', subfamily: 'Alimentación', description: 'Fuente de red genérica con tres fases, neutro y tierra. Su tensión es un dato que configura quien simula; no es de una red real.', size: [0.3, 0.3, 0.12], center: [0, 0.15, 0], color: '#6b4f8a', status: 'generic',
    anchors: [{id: 'base', label: 'Base', role: 'child', kind: 'surface', position: [0, 0, 0], normal: [0, -1, 0]}],
    terminals: [
      {id: 'L1', label: 'L1', position: [-0.08, 0.3, 0], kind: 'power', group: 'salida', role: 'line'}, {id: 'L2', label: 'L2', position: [-0.04, 0.3, 0], kind: 'power', group: 'salida', role: 'line'},
      {id: 'L3', label: 'L3', position: [0, 0.3, 0], kind: 'power', group: 'salida', role: 'line'}, {id: 'N', label: 'N', position: [0.04, 0.3, 0], kind: 'power', group: 'salida', role: 'neutral'},
      {id: 'PE', label: 'PE', position: [0.08, 0.3, 0], kind: 'earth', group: 'salida', role: 'ground'},
    ],
    terminalSource: 'Marcado L1/L2/L3, N y PE según la convención habitual de redes trifásicas. No contrastado con el documento de la norma.',
  },
  // — Automatización y control —
  dinDevice({id: 'plc-generico', name: 'PLC compacto', family: 'Automatización y control', subfamily: 'Controladores', description: 'Controlador genérico con entradas y salidas digitales (sin lenguaje, memoria ni tensión de E/S definidos).', size: [0.12, 0.1, 0.06], color: '#2f3b4c', kind: 'signal', top: ['DI0', 'DI1', 'DI2', 'DI3'], bottom: ['DO0', 'DO1', 'DO2', 'DO3'],
    extra: [{id: 'L+', label: 'L+', position: [-0.05, 0.034, 0.03], kind: 'power', group: 'alimentación', role: 'positive'}, {id: 'M', label: 'M', position: [0.05, 0.034, 0.03], kind: 'power', group: 'alimentación', role: 'negative'}]}),
  // — Mecánica y movimiento —
  {
    id: 'motor-3p', name: 'Motor trifásico', family: 'Mecánica y movimiento', subfamily: 'Motores', description: 'Motor de inducción genérico sobre base (sin potencia, velocidad ni tensión definidas).', size: [0.2, 0.18, 0.2], center: [0, 0.09, 0], color: '#b0b8c4', status: 'generic',
    anchors: [{id: 'base', label: 'Base', role: 'child', kind: 'surface', position: [0, 0, 0], normal: [0, -1, 0]}],
    terminals: [{id: 'U1', label: 'U1', position: [-0.04, 0.18, 0], kind: 'power', group: 'bornera'}, {id: 'V1', label: 'V1', position: [0, 0.18, 0], kind: 'power', group: 'bornera'}, {id: 'W1', label: 'W1', position: [0.04, 0.18, 0], kind: 'power', group: 'bornera'}, {id: 'PE', label: 'PE', position: [0.08, 0.18, 0], kind: 'earth', group: 'bornera', role: 'ground'}],
    terminalSource: 'Marcado U1/V1/W1 y PE según la convención habitual de motores trifásicos. No contrastado con el documento de la norma.',
  },
];
