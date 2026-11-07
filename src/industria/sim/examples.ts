// Proyecto de ejemplo: arranque directo de un motor trifásico con mando por pulsador. Se construye con las mismas operaciones del modelo
// (colocar, montar, cablear), así que sirve también de prueba de que el motor de anclajes y el de cableado trabajan juntos.
// Las tensiones (230 y 24) son valores de ejemplo configurables en las fuentes; no representan un equipo real.
import {newIndustryProject} from '../model/defaults.ts';
import {addEntity, setEntityProp} from '../model/commands.ts';
import {snapMount} from '../build/commands.ts';
import {findSnapCandidates} from '../build/snap.ts';
import {shapeOf} from '../build/shapes.ts';
import {unwire, wire} from '../wiring/commands.ts';
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

/** Mini fábrica: el marcha/paro con PLC del tablero más una planta de dos estaciones que de verdad opera.
 *  Estación 1: el motor mueve la cinta con tres cajas; el sensor fotoeléctrico detecta cada caja y el PLC acciona la electroválvula (el cilindro sale con aire del compresor)
 *  mientras el sensor inductivo vigila el vástago; el brazo trabaja y la torre se enciende mientras la línea corre.
 *  Estación 2: segunda cinta con su motor (en paralelo con el primero, desde el mismo contactor) y otro brazo, tras sus vallas.
 *  Tierra y neutro pasan por sus bornes; los cables viajan por canaletas en el tablero y por canales de piso hasta las máquinas, con el color de cada función.
 *  Velocidades, carreras y medidas son de ejemplo. */
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
  const cut = (a: [string, string], b: [string, string]): boolean => { const c = p.connections.find(x => (x.a.entityId === a[0] && x.a.terminalId === a[1] && x.b.entityId === b[0] && x.b.terminalId === b[1]) || (x.b.entityId === a[0] && x.b.terminalId === a[1] && x.a.entityId === b[0] && x.a.terminalId === b[1])); return !!c && step(unwire(p, c.id)); };
  if (!add('piso', 'piso-planta', 'Piso de planta 1', pose(0.6, -0.05, 0.8)) || !add('piso2', 'piso-planta', 'Piso de planta 2', pose(4.6, -0.05, 0.8))) return {ok: false, error: fail};
  if (!add('cinta', 'cinta-transportadora', 'Cinta 1', pose(1.75, 0, 0.75)) || !add('mesa', 'mesa-trabajo', 'Mesa de estación', pose(0.45, 0, 1.45)) || !add('robot', 'brazo-robot', 'Brazo robótico 1', pose(1.75, 0, 1.5))
    || !add('comp', 'compresor', 'Compresor', pose(-0.75, 0, 1.35)) || !add('tanque', 'tanque', 'Tanque', pose(-1.1, 0, 0.6)) || !add('torre', 'torre-luminosa', 'Torre', pose(-0.55, 0, 0.45))) return {ok: false, error: fail};
  if (!add('cinta2', 'cinta-transportadora', 'Cinta 2', pose(5.4, 0, 0.75)) || !add('motor2', 'motor-3p', 'M2', pose(4.45, 0, -0.1)) || !add('robot2', 'brazo-robot', 'Brazo robótico 2', pose(5.4, 0, 1.5))) return {ok: false, error: fail};
  for (const [i, x] of [1.15, 1.55, 1.95].entries()) if (!put(`prod${i + 1}`, 'caja-producto', `Producto ${i + 1}`, pose(x, 0.8, 0.75), 'cinta')) return {ok: false, error: fail};
  for (const [i, x] of [4.85, 5.25, 5.65].entries()) if (!put(`prod${i + 4}`, 'caja-producto', `Producto ${i + 4}`, pose(x, 0.8, 0.75), 'cinta2')) return {ok: false, error: fail};
  if (!put('foto', 'sensor-fotoelectrico', 'Sensor de cinta', pose(2.2, 0.8, 0.9), 'cinta') || !put('ind', 'sensor-inductivo', 'Sensor de cilindro', pose(0.88, 0.8, 1.6), 'mesa') || !put('valvula', 'valvula-5-2', 'Electroválvula', pose(0.45, 0.8, 1.45), 'mesa')
    || !put('cil', 'cilindro-neumatico', 'Cilindro', pose(0.65, 0.8, 1.6), 'mesa') || !put('paro', 'paro-emergencia', 'Paro de emergencia', pose(0.8, 0.8, 1.3), 'mesa')) return {ok: false, error: fail};
  for (const [id, x, z, ry] of [['valla1', 1.25, 2.1, 0], ['valla2', 2.25, 2.1, 0], ['valla3', 2.55, 1.55, Math.PI / 2], ['valla4', 4.75, 2.1, 0], ['valla5', 5.75, 2.1, 0], ['valla6', 6.25, 1.55, Math.PI / 2]] as const) if (!add(id, 'valla-seguridad', 'Valla', {position: [x, 0, z], rotation: [0, ry, 0]})) return {ok: false, error: fail};
  // Segunda fila de la nave: área de proceso (tanques), mesas de empaque con cajas y un robot de reserva. Son equipos de escenario sin alimentación.
  if (!add('piso3', 'piso-planta', 'Piso de planta 3', pose(0.6, -0.05, 3.8)) || !add('piso4', 'piso-planta', 'Piso de planta 4', pose(4.6, -0.05, 3.8))) return {ok: false, error: fail};
  if (!add('tanque2', 'tanque', 'Tanque 2', pose(-0.5, 0, 4.5)) || !add('tanque3', 'tanque', 'Tanque 3', pose(0.5, 0, 4.5)) || !add('mesa2', 'mesa-trabajo', 'Mesa de empaque 1', pose(1.8, 0, 4.4)) || !add('mesa3', 'mesa-trabajo', 'Mesa de empaque 2', pose(3.7, 0, 4.4))
    || !add('robot3', 'brazo-robot', 'Brazo robótico 3', pose(5.4, 0, 4.4)) || !add('comp2', 'compresor', 'Compresor 2', pose(6.2, 0, 3.4))) return {ok: false, error: fail};
  for (const [id, x, z, parent] of [['pk1', 1.6, 4.4, 'mesa2'], ['pk2', 2.0, 4.4, 'mesa2'], ['pk3', 3.5, 4.4, 'mesa3'], ['pk4', 3.9, 4.4, 'mesa3']] as const) if (!put(id, 'caja-producto', 'Caja de empaque', pose(x, 0.8, z), parent)) return {ok: false, error: fail};
  for (const [id, x, z, ry] of [['valla7', 4.75, 5.2, 0], ['valla8', 5.75, 5.2, 0], ['valla9', 6.25, 4.7, Math.PI / 2], ['valla10', 4.9, 3.6, 0]] as const) if (!add(id, 'valla-seguridad', 'Valla', {position: [x, 0, z], rotation: [0, ry, 0]})) return {ok: false, error: fail};
  // Bornes de tierra y de neutro en el riel del PLC
  const railZ = p.poses.s2.position[2];
  if (!put('pe1', 'borne-tierra', 'PE', pose(0.09, 0.45, railZ), 'riel2') || !put('ne1', 'borne-neutro', 'N', pose(0.125, 0.45, railZ), 'riel2')) return {ok: false, error: fail};
  // Canaletas del tablero (sobre la placa, junto a cada riel) y canales de piso hacia las máquinas de las dos estaciones
  for (const [id, def, x, y] of [['cn1', 'canaleta', -0.08, 0.86], ['cn2', 'canaleta', -0.08, 0.635], ['cn3', 'canaleta', -0.08, 0.56], ['cn4', 'canaleta', -0.08, 0.335], ['cv1', 'canaleta-vertical', -0.34, 0.6]] as const)
    if (!put(id, def, 'Canaleta', pose(x, y, 0.055), 'placa')) return {ok: false, error: fail};
  for (const [id, x, z, ry, slab] of [['pz1', 0.4, 0.3, 0, 'piso'], ['pz2', 1.6, 0.3, 0, 'piso'], ['pz3', -0.25, 1.05, Math.PI / 2, 'piso'], ['pz4', 0.35, 1.95, 0, 'piso'], ['pz5', 1.55, 1.95, 0, 'piso'],
    ['pz6', 3.2, 0.3, 0, 'piso2'], ['pz7', 4.4, 0.3, 0, 'piso2'], ['pz8', 5.6, 0.3, 0, 'piso2'], ['pz9', 3.0, 1.95, 0, 'piso2'], ['pz10', 4.2, 1.95, 0, 'piso2'], ['pz11', 5.4, 1.95, 0, 'piso2']] as const)
    if (!put(id, 'canal-piso', 'Canal de piso', {position: [x, 0, z], rotation: [0, ry, 0]}, slab)) return {ok: false, error: fail};
  // Tierra y neutro pasan por sus bornes (se quitan los cables directos del ejemplo base)
  if (!cut(['red', 'PE'], ['motor', 'PE']) || !cut(['red', 'N'], ['fuente', 'N'])) return {ok: false, error: fail || 'No se encontraron los cables base de tierra y neutro.'};
  const T = (entityId: string, terminalId: string) => ({entityId, terminalId});
  const cables: [[string, string], [string, string]][] = [
    [['red', 'PE'], ['pe1', '1']], [['pe1', '2'], ['motor', 'PE']], [['pe1', '2'], ['motor2', 'PE']], [['red', 'N'], ['ne1', '1']], [['ne1', '2'], ['fuente', 'N']],
    // segundo motor en paralelo con el primero (mismo contactor)
    [['km1', '2'], ['motor2', 'U1']], [['km1', '4'], ['motor2', 'V1']], [['km1', '6'], ['motor2', 'W1']],
    // sensores de tres hilos: cada terminal admite 2 cables, así que la alimentación se encadena entre sensores
    [['plc', 'L+'], ['foto', 'BN']], [['plc', 'M'], ['foto', 'BU']], [['foto', 'BK'], ['plc', 'DI2']],
    [['foto', 'BN'], ['ind', 'BN']], [['foto', 'BU'], ['ind', 'BU']], [['ind', 'BK'], ['plc', 'DI3']],
    // electroválvula: bobina desde una salida del PLC; aire del compresor al cilindro
    [['plc', 'DO1'], ['valvula', 'A1']], [['valvula', 'A2'], ['km1', 'A2']],
    [['comp', 'P'], ['valvula', 'P']], [['valvula', 'A'], ['cil', 'A']], [['valvula', 'B'], ['cil', 'B']],
    // torre (luz verde) y robots, también desde el PLC; el común de ambos comparte la bobina de la válvula
    [['plc', 'DO2'], ['torre', 'G']], [['torre', 'COM'], ['valvula', 'A2']], [['plc', 'DO3'], ['robot', 'A1']], [['robot', 'A2'], ['torre', 'COM']],
    [['plc', 'DO3'], ['robot2', 'A1']], [['robot2', 'A2'], ['robot', 'A2']],
  ];
  for (const [a, b] of cables) if (!step(wire(p, T(...a), T(...b)))) return {ok: false, error: fail};
  for (const [terminal, name] of [['DI2', 'SENSOR_CINTA'], ['DI3', 'SENSOR_CILINDRO'], ['DO1', 'VALVULA'], ['DO2', 'LUZ_VERDE'], ['DO3', 'ROBOT']] as const) if (!step(setTerminalTag(p, 'plc', terminal, name))) return {ok: false, error: fail};
  // Programa de la planta: la válvula sigue al sensor de la cinta; la luz y los robots trabajan mientras la línea corre
  for (const [coil, contact, note] of [['VALVULA', 'SENSOR_CINTA', 'El cilindro sale mientras hay una caja frente al sensor'], ['LUZ_VERDE', 'MOTOR', 'Luz verde con la línea en marcha'], ['ROBOT', 'MOTOR', 'Los brazos trabajan con la línea en marcha']] as const)
    if (!step(addRung(p, 'plc', {tag: coil}, [{tag: contact}], note))) return {ok: false, error: fail};
  for (const w of [{kind: 'lamp', label: 'CAJA EN SENSOR', plcId: 'plc', tag: 'SENSOR_CINTA'}, {kind: 'lamp', label: 'CILINDRO ATRÁS', plcId: 'plc', tag: 'SENSOR_CILINDRO'}, {kind: 'lamp', label: 'VÁLVULA', plcId: 'plc', tag: 'VALVULA'}] as const) if (!step(addWidget(p, w))) return {ok: false, error: fail};
  return {ok: true, value: p};
}
