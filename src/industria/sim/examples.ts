// Proyecto de ejemplo: arranque directo de un motor trifásico con mando por pulsador. Se construye con las mismas operaciones del modelo
// (colocar, montar, cablear), así que sirve también de prueba de que el motor de anclajes y el de cableado trabajan juntos.
// Las tensiones (230 y 24) son valores de ejemplo configurables en las fuentes; no representan un equipo real.
import {newIndustryProject} from '../model/defaults.ts';
import {addEntity, setEntityProp} from '../model/commands.ts';
import {snapMount} from '../build/commands.ts';
import {findSnapCandidates} from '../build/snap.ts';
import {shapeOf} from '../build/shapes.ts';
import {wire} from '../wiring/commands.ts';
import {addBranch, addContact, addMemory, addRung, addWidget, setTerminalTag} from '../plc/program.ts';
import type {IndustryProject, Pose, Result} from '../model/types.ts';

const pose = (x: number, y: number, z: number): Pose => ({position: [x, y, z], rotation: [0, 0, 0]});

export function exampleDirectStart(): Result<IndustryProject> {
  let p = newIndustryProject('Ejemplo · arranque directo');
  const step = (r: Result<IndustryProject>): boolean => { if (!r.ok) { fail = r.error; return false; } p = r.value; return true; };
  let fail = '';
  const add = (id: string, definitionId: string, label: string, at: Pose) => step(addEntity(p, {id, definitionId, label, pose: at}));

  if (!add('placa', 'placa', 'Placa', pose(0, 0, 0)) || !add('riel', 'riel', 'Riel', pose(0, 0.5, 0.06))) return {ok: false, error: fail};
  const c0 = findSnapCandidates(p, 'riel')[0];
  if (!c0 || !step(snapMount(p, c0))) return {ok: false, error: fail || 'No se pudo montar el riel.'};
  const railZ = p.poses.riel.position[2];
  let x = -0.15;
  for (const [id, def, label] of [['qf1', 'breaker-3p', 'QF1'], ['qf2', 'breaker-1p', 'QF2'], ['fuente', 'fuente-cc', 'Fuente'], ['km1', 'contactor-3p', 'KM1'], ['s1', 'pulsador-na', 'S1'], ['h1', 'piloto', 'H1']] as const) {
    const w = shapeOf(def).size[0], d = shapeOf(def).size[2];
    x += w / 2;
    if (!add(id, def, label, pose(x, 0.5, railZ + 0.005 + d / 2 + 0.02))) return {ok: false, error: fail};
    const c = findSnapCandidates(p, id, undefined, {range: 0.2})[0];
    if (!c || !step(snapMount(p, c))) return {ok: false, error: fail || `No se pudo montar ${label}.`};
    x += w / 2 + 0.02;
  }
  if (!add('red', 'red-3f', 'Red 3F', pose(-0.9, 0, 0)) || !add('motor', 'motor-3p', 'M1', pose(0.9, 0, 0))) return {ok: false, error: fail};
  if (!step(setEntityProp(p, 'red', 'voltage', 230)) || !step(setEntityProp(p, 'fuente', 'voltage', 24))) return {ok: false, error: fail};

  const T = (entityId: string, terminalId: string) => ({entityId, terminalId});
  const cables: [[string, string], [string, string]][] = [
    // fuerza: red → QF1 → KM1 → motor, con tierra
    [['red', 'L1'], ['qf1', '1']], [['red', 'L2'], ['qf1', '3']], [['red', 'L3'], ['qf1', '5']],
    [['qf1', '2'], ['km1', '1']], [['qf1', '4'], ['km1', '3']], [['qf1', '6'], ['km1', '5']],
    [['km1', '2'], ['motor', 'U1']], [['km1', '4'], ['motor', 'V1']], [['km1', '6'], ['motor', 'W1']], [['red', 'PE'], ['motor', 'PE']],
    // mando: red → QF2 → fuente CC → pulsador → bobina; piloto por el auxiliar
    [['red', 'L1'], ['qf2', '1']], [['qf2', '2'], ['fuente', 'L']], [['red', 'N'], ['fuente', 'N']],
    [['fuente', 'L+'], ['s1', '3']], [['s1', '4'], ['km1', 'A1']], [['km1', 'A2'], ['fuente', 'M']],
    [['fuente', 'L+'], ['km1', '13']], [['km1', '14'], ['h1', 'X1']], [['h1', 'X2'], ['fuente', 'M']],
  ];
  for (const [a, b] of cables) if (!step(wire(p, T(...a), T(...b)))) return {ok: false, error: fail};
  return {ok: true, value: p};
}

/** Marcha/paro con PLC: pulsadores en las entradas, el contactor en la salida, sello en el programa y una pantalla de HMI. */
export function examplePlcStartStop(): Result<IndustryProject> {
  let p = newIndustryProject('Ejemplo · marcha/paro con PLC');
  let fail = '';
  const step = (r: Result<IndustryProject>): boolean => { if (!r.ok) { fail = r.error; return false; } p = r.value; return true; };
  const add = (id: string, definitionId: string, label: string, at: Pose) => step(addEntity(p, {id, definitionId, label, pose: at}));
  const onRail = (railId: string, y: number, items: readonly (readonly [string, string, string])[], x0: number): boolean => {
    if (!add(railId, 'riel', 'Riel', pose(0, y, 0.06))) return false;
    const rc = findSnapCandidates(p, railId).find(c => c.parent.entityId === 'placa');
    if (!rc || !step(snapMount(p, rc))) { fail = fail || 'No se pudo montar el riel.'; return false; }
    const railZ = p.poses[railId].position[2];
    let x = x0;
    for (const [id, def, label] of items) {
      const w = shapeOf(def).size[0], d = shapeOf(def).size[2];
      x += w / 2;
      if (!add(id, def, label, pose(x, y, railZ + 0.005 + d / 2 + 0.02))) return false;
      const c = findSnapCandidates(p, id, undefined, {range: 0.2}).find(k => k.parent.entityId === railId);
      if (!c || !step(snapMount(p, c))) { fail = fail || `No se pudo montar ${label}.`; return false; }
      x += w / 2 + 0.02;
    }
    return true;
  };
  if (!add('placa', 'placa', 'Placa', pose(0, 0, 0))) return {ok: false, error: fail};
  if (!onRail('riel1', 0.75, [['qf1', 'breaker-3p', 'QF1'], ['qf2', 'breaker-1p', 'QF2'], ['fuente', 'fuente-cc', 'Fuente'], ['km1', 'contactor-3p', 'KM1']], -0.2)) return {ok: false, error: fail};
  if (!onRail('riel2', 0.45, [['plc', 'plc-generico', 'PLC'], ['b1', 'borne-paso', 'B1'], ['s1', 'pulsador-na', 'S1'], ['s2', 'pulsador-na', 'S2']], -0.25)) return {ok: false, error: fail};
  if (!add('red', 'red-3f', 'Red 3F', pose(-0.9, 0, 0)) || !add('motor', 'motor-3p', 'M1', pose(0.9, 0, 0))) return {ok: false, error: fail};
  if (!step(setEntityProp(p, 'red', 'voltage', 230)) || !step(setEntityProp(p, 'fuente', 'voltage', 24))) return {ok: false, error: fail};
  const T = (entityId: string, terminalId: string) => ({entityId, terminalId});
  const cables: [[string, string], [string, string]][] = [
    [['red', 'L1'], ['qf1', '1']], [['red', 'L2'], ['qf1', '3']], [['red', 'L3'], ['qf1', '5']],
    [['qf1', '2'], ['km1', '1']], [['qf1', '4'], ['km1', '3']], [['qf1', '6'], ['km1', '5']],
    [['km1', '2'], ['motor', 'U1']], [['km1', '4'], ['motor', 'V1']], [['km1', '6'], ['motor', 'W1']], [['red', 'PE'], ['motor', 'PE']],
    [['red', 'L1'], ['qf2', '1']], [['qf2', '2'], ['fuente', 'L']], [['red', 'N'], ['fuente', 'N']],
    [['fuente', 'L+'], ['b1', '1']], [['b1', '1'], ['plc', 'L+']], [['b1', '2'], ['s1', '3']], [['b1', '2'], ['s2', '3']],
    [['fuente', 'M'], ['plc', 'M']], [['fuente', 'M'], ['km1', 'A2']],
    [['s1', '4'], ['plc', 'DI0']], [['s2', '4'], ['plc', 'DI1']], [['plc', 'DO0'], ['km1', 'A1']],
  ];
  for (const [a, b] of cables) if (!step(wire(p, T(...a), T(...b)))) return {ok: false, error: fail};
  // Variables y programa
  for (const [terminal, name] of [['DI0', 'START'], ['DI1', 'STOP'], ['DO0', 'MOTOR']] as const) if (!step(setTerminalTag(p, 'plc', terminal, name))) return {ok: false, error: fail};
  for (const name of ['HMI_START', 'HMI_STOP']) if (!step(addMemory(p, 'plc', name))) return {ok: false, error: fail};
  const stops = [{tag: 'STOP', nc: true}, {tag: 'HMI_STOP', nc: true}];
  if (!step(addRung(p, 'plc', {tag: 'MOTOR'}, [{tag: 'START'}, ...stops], 'Marcha con sello; el paro corta siempre'))) return {ok: false, error: fail};
  const rungId = p.plc.plc.rungs[0].id;
  if (!step(addBranch(p, 'plc', rungId)) || !step(addBranch(p, 'plc', rungId))) return {ok: false, error: fail};
  for (const [i, first] of [[1, 'HMI_START'], [2, 'MOTOR']] as const) for (const c of [{tag: first}, ...stops]) if (!step(addContact(p, 'plc', rungId, i, c))) return {ok: false, error: fail};
  for (const w of [{kind: 'label', label: 'Marcha / paro del motor'}, {kind: 'button', label: 'MARCHA', plcId: 'plc', tag: 'HMI_START'}, {kind: 'button', label: 'PARO', plcId: 'plc', tag: 'HMI_STOP'}, {kind: 'lamp', label: 'MOTOR', plcId: 'plc', tag: 'MOTOR'}] as const) if (!step(addWidget(p, w))) return {ok: false, error: fail};
  return {ok: true, value: p};
}

/** Mini fábrica: el marcha/paro con PLC del tablero más una planta alrededor: piso con franjas, cinta con su motor, cajas, sensores, brazo robótico, vallas,
 *  compresor con electroválvula y cilindro, tanque, mesa de estación, torre luminosa y paro de emergencia. Solo el motor y los pilotos se simulan; el resto es
 *  escenario (forma, montaje y cableado de topología). Las medidas son de ejemplo. */
export function exampleMiniFactory(): Result<IndustryProject> {
  const base = examplePlcStartStop(); if (!base.ok) return base;
  let p = base.value, fail = '';
  p = {...p, name: 'Ejemplo · mini fábrica'};
  const step = (r: Result<IndustryProject>): boolean => { if (!r.ok) { fail = r.error; return false; } p = r.value; return true; };
  const add = (id: string, definitionId: string, label: string, at: Pose) => step(addEntity(p, {id, definitionId, label, pose: at}));
  /** Coloca la pieza cerca de su soporte y la monta con el imán del modelo; si no hay montaje posible se deja en su sitio. */
  const put = (id: string, definitionId: string, label: string, at: Pose, parent: string): boolean => {
    if (!add(id, definitionId, label, at)) return false;
    const c = findSnapCandidates(p, id, undefined, {range: 0.4}).find(k => k.parent.entityId === parent);
    if (c) { const r = snapMount(p, c); if (r.ok) p = r.value; }
    return true;
  };
  if (!add('piso', 'piso-planta', 'Piso de planta', pose(0.6, -0.05, 0.8))) return {ok: false, error: fail};
  if (!add('cinta', 'cinta-transportadora', 'Cinta', pose(1.75, 0, 0.75)) || !add('mesa', 'mesa-trabajo', 'Mesa de estación', pose(0.45, 0, 1.45)) || !add('robot', 'brazo-robot', 'Brazo robótico', pose(1.75, 0, 1.5))
    || !add('comp', 'compresor', 'Compresor', pose(-0.5, 0, 1.35)) || !add('tanque', 'tanque', 'Tanque', pose(-1.1, 0, 0.6)) || !add('torre', 'torre-luminosa', 'Torre', pose(-0.55, 0, 0.45))) return {ok: false, error: fail};
  for (const [i, x] of [1.4, 1.75, 2.1].entries()) if (!put(`prod${i + 1}`, 'caja-producto', `Producto ${i + 1}`, pose(x, 0.8, 0.75), 'cinta')) return {ok: false, error: fail};
  if (!put('foto', 'sensor-fotoelectrico', 'Sensor de cinta', pose(2.3, 0.8, 0.9), 'cinta') || !put('ind', 'sensor-inductivo', 'Sensor de mesa', pose(0.15, 0.8, 1.45), 'mesa') || !put('valvula', 'valvula-5-2', 'Electroválvula', pose(0.45, 0.8, 1.45), 'mesa')
    || !put('cil', 'cilindro-neumatico', 'Cilindro', pose(0.65, 0.8, 1.6), 'mesa') || !put('paro', 'paro-emergencia', 'Paro de emergencia', pose(0.8, 0.8, 1.3), 'mesa')) return {ok: false, error: fail};
  for (const [id, x, z, ry] of [['valla1', 1.25, 2.1, 0], ['valla2', 2.25, 2.1, 0], ['valla3', 2.55, 1.55, Math.PI / 2]] as const) if (!add(id, 'valla-seguridad', 'Valla', {position: [x, 0, z], rotation: [0, ry, 0]})) return {ok: false, error: fail};
  const T = (entityId: string, terminalId: string) => ({entityId, terminalId});
  const cables: [[string, string], [string, string]][] = [
    // sensores de tres hilos: cada terminal admite 2 cables, así que la alimentación se encadena entre sensores
    [['plc', 'L+'], ['foto', 'BN']], [['plc', 'M'], ['foto', 'BU']], [['foto', 'BK'], ['plc', 'DI2']],
    [['foto', 'BN'], ['ind', 'BN']], [['foto', 'BU'], ['ind', 'BU']], [['ind', 'BK'], ['plc', 'DI3']],
    // electroválvula: bobina desde una salida del PLC; aire del compresor al cilindro
    [['plc', 'DO1'], ['valvula', 'A1']], [['valvula', 'A2'], ['km1', 'A2']],
    [['comp', 'P'], ['valvula', 'P']], [['valvula', 'A'], ['cil', 'A']], [['valvula', 'B'], ['cil', 'B']],
    // torre: luz verde desde el PLC y común con la bobina de la válvula
    [['plc', 'DO2'], ['torre', 'G']], [['torre', 'COM'], ['valvula', 'A2']],
  ];
  for (const [a, b] of cables) if (!step(wire(p, T(...a), T(...b)))) return {ok: false, error: fail};
  for (const [terminal, name] of [['DI2', 'SENSOR_CINTA'], ['DI3', 'SENSOR_MESA'], ['DO1', 'VALVULA'], ['DO2', 'LUZ_VERDE']] as const) if (!step(setTerminalTag(p, 'plc', terminal, name))) return {ok: false, error: fail};
  return {ok: true, value: p};
}
