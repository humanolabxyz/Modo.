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
