// Templates are built with the same commands as manual assemblies. Existing saved projects are not migrated or overwritten.
import {addPart, attach, connect, detach, removeParts, ensureFirmware, setFirmwareArtifact, setPartProp} from './commands.ts';
import {newRobotProject} from './defaults.ts';
import {hashSource} from '../mcu/compiler/state.ts';
import {AVOID_HEX, AVOID_SKETCH} from './avoidSketch.ts';
import {LINE_HEX, LINE_SKETCH, EXPLORER_HEX, EXPLORER_SKETCH} from './kitSketches.ts';
import {FOLLOW_HEX, FOLLOW_SKETCH, SUMO_HEX, SUMO_SKETCH} from './assemblySketches.ts';
import {makeLineTrack} from '../sim/lineTrack.ts';
import {PICK_TEMPLATE_INFO, TEMPLATE_PICK, TEMPLATE_TRACKED, TRACKED_TEMPLATE_INFO, buildTrackedRobot} from './trackedRobot.ts';
import {ARM_TEMPLATE, ARM_TRANSFER_TEMPLATE, buildArmPractice, buildArmTransfer} from '../arm/model.ts';
import {CONVEYOR_TEMPLATE} from '../conveyor/constants.ts';
import {buildConveyorCell} from '../conveyor/model.ts';
import type {RobotProject, Vec3, Quat} from './types.ts';

export const TEMPLATE_READY_ROBOT = 'robot-2-ruedas-listo';
export const TEMPLATE_LINE_ROBOT = 'robot-seguidor-linea';
export const TEMPLATE_EXPLORER = 'robot-explorador-luces';
export const TEMPLATE_ROVER_4WD = 'robot-rover-4wd';
export const TEMPLATE_TOWER = 'robot-torre-seguidor';
export const TEMPLATE_SUMO = 'robot-minisumo-practica';
export const TEMPLATE_WEDGE = 'robot-sumo-cuna';
export const TEMPLATE_SCOOP = 'robot-sumo-pala-4wd';
export const TEMPLATE_PUSHER = 'robot-sumo-defensa';
export const COMBAT_TEMPLATES = [
  {id:TEMPLATE_WEDGE,name:'Sumo cuña · perfil bajo',layout:'2 motores · cuña inclinada · sensores de borde',summary:'Cuña de 180 mm para entrar bajo el rival. Construcción editable con contacto físico de la rampa.'},
  {id:TEMPLATE_SCOOP,name:'Sumo pala · 4WD',layout:'4 motores · pala con laterales · sensores de borde',summary:'Pala empujadora fija de 200 mm y cuatro ruedas motrices. Base inclinada, respaldo y laterales con contacto físico independiente.'},
  {id:TEMPLATE_PUSHER,name:'Sumo defensa · empujador',layout:'2 motores · escudo frontal ancho · sensores de borde',summary:'Defensa vertical de 200 mm para empujar de frente. Compara su comportamiento con la cuña y la pala.'},
] as const;
const KIT_TEMPLATES = [
  {id: TEMPLATE_READY_ROBOT, layout: '2 motores · 2 ruedas · 1 plataforma', name: 'Robot 2 ruedas · listo para usar', summary: 'Evita obstáculos con ultrasonido. Protoboard cableada, interruptor y regulador de 5 V; portapilas de 6 V.'},
  {id: TEMPLATE_LINE_ROBOT, layout: '2 motores · sensores inferiores · 1 plataforma', name: 'Robot seguidor de línea', summary: 'Dos sensores infrarrojos bajo el chasis y pista ovalada. Lee el suelo y corrige cada motor a través de su programa.'},
  {id: TEMPLATE_EXPLORER, layout: '2 motores · indicador en protoboard · 1 plataforma', name: 'Robot explorador con luces', summary: 'Evita obstáculos y enciende un LED de aviso a través de una resistencia insertada en la protoboard.'},
  {id: TEMPLATE_ROVER_4WD, layout: '4 motores · 4 ruedas · 2 drivers', name: 'Rover 4WD', summary: 'Armado con cuatro motores, cuatro ruedas y dos drivers. Sin rueda loca; evita obstáculos con tracción en ambos ejes.'},
  {id: TEMPLATE_TOWER, layout: '2 plataformas · columnas de soportes', name: 'Robot de dos pisos · seguidor de objetos', summary: 'Dos chasis separados por columnas: potencia y protoboard abajo; Arduino y sensor arriba. Se acerca, espera o retrocede según la distancia.'},
  {id: TEMPLATE_SUMO, layout: 'Tracción delantera · apoyo trasero · defensa baja', name: 'Minisumo · práctica de borde', summary: 'Detecta el borde negro y retrocede. Modifica su construcción y programa; llévalo a la Arena para enfrentar otro robot.'},
] as const;
// The stacked draft remains import-compatible; minisumo now also participates in the arena.
export const TEMPLATES = [...KIT_TEMPLATES.filter(t => t.id !== TEMPLATE_TOWER),
  TRACKED_TEMPLATE_INFO,
  PICK_TEMPLATE_INFO,
  ...COMBAT_TEMPLATES,
  {id: ARM_TEMPLATE, layout: 'Modelo oficial E6 · 6 ejes · enseñanza de puntos', name: 'Brazo educativo · referencia E6', summary: 'Operación con servos, Jog, MovJ/MovL, pausa, emergencia y pinza de práctica. Trayectorias comprobadas y caída de piezas con física.'},
  {id: ARM_TRANSFER_TEMPLATE, layout: 'E6 · 3 piezas · 3 destinos · ciclo editable', name: 'E6 · transferencia de tres piezas', summary: 'Prepara y ejecuta un ciclo de recogida y entrega por pieza. Agarre comprobado, descenso lineal y resultado por posición física.'},
  {id: CONVEYOR_TEMPLATE, layout: 'Cinta · presencia · lectura RGB · brazo E6', name: 'Fábrica E6 · cinta y clasificación', summary: 'Transporta tres piezas, detiene la banda por presencia, lee su color y coordina la recogida y entrega con el brazo. Incluye fallas de sensor y atasco.'},
];
const fail = (msg: string): never => {throw new Error(`Plantilla inválida: ${msg}`);};

type KitKind = 'avoid' | 'line' | 'explorer' | 'rover' | 'tower' | 'sumo' | 'sumo4';
function buildKit(kind: KitKind, now: string): RobotProject {
  const templateIndex: Record<KitKind, number> = {avoid: 0, line: 1, explorer: 2, rover: 3, tower: 4, sumo: 5, sumo4: 3};
  const template = KIT_TEMPLATES[templateIndex[kind]];
  const rover = kind === 'rover' || kind === 'sumo4', tower = kind === 'tower', sumo = kind === 'sumo', border = sumo || kind === 'sumo4';
  const transverse: Quat = [0, Math.SQRT1_2, 0, Math.SQRT1_2];
  let p = newRobotProject(template.name, now);
  const put = (def: string, pos: Vec3 = [0, 0.5, 0], rot?: Quat) => {const r = addPart(p, def, pos, rot); if ('error' in r) fail(r.error); else p = r.project; return p.parts.at(-1)!.instanceId;};
  const join = (parent: string, anchor: string, child: string, childAnchor = 'base') => {const r = attach(p, {instanceId: parent, anchorId: anchor}, {instanceId: child, anchorId: childAnchor}); if ('error' in r) fail(r.error); else p = r.project;};
  const chassis = put('chassis-2wd', [0, 0.0455, 0]);
  const motorL = put('dc-motor-tt'), motorR = put('dc-motor-tt'); join(chassis, rover ? '4wd-motor-rl' : sumo ? 'sumo-motor-l' : 'motor-l', motorL); join(chassis, rover ? '4wd-motor-rr' : sumo ? 'sumo-motor-r' : 'motor-r', motorR);
  const wheelL = put('wheel-65'), wheelR = put('wheel-65');
  for (const [parent, anchorId, child] of [[motorL, 'axle-l', wheelL], [motorR, 'axle-r', wheelR]]) {
    const r = attach(p, {instanceId: parent, anchorId}, {instanceId: child, anchorId: 'hub'}); if ('error' in r) fail(r.error); else p = r.project;
  }
  if (!rover) {const caster = put('caster-ball'); join(chassis, sumo ? 'sumo-caster' : 'caster', caster);}
  let controlDeck = chassis;
  if (tower) {
    // Two standard U supports form each 40 mm column; all parts belong to one rigid assembly.
    const upperPosts: string[] = [];
    for (const slot of ['tower-post-rl', 'tower-post-rr', 'tower-post-fl', 'tower-post-fr']) {
      const lower = put('bracket-generic'); join(chassis, slot, lower);
      const upper = put('bracket-generic'); join(lower, 'top', upper); upperPosts.push(upper);
    }
    controlDeck = put('chassis-2wd'); join(upperPosts[0], 'top', controlDeck, 'stack-corner');
  }
  const uno = put('arduino-uno-r3', [0, 0.5, 0], sumo ? transverse : undefined); join(controlDeck, tower ? 'board' : sumo ? 'sumo-uno' : 'board-left', uno);
  const board = put('breadboard-400', [0, 0.5, 0], tower || sumo ? transverse : undefined); join(chassis, tower ? 'tower-board' : sumo ? 'sumo-board' : 'breadboard', board);
  const driver = put('l298n-module'); join(chassis, rover ? '4wd-driver-a' : tower ? 'tower-driver' : sumo ? 'sumo-driver' : 'driver-rear', driver);
  const battery = put('battery-holder-4aa'); join(chassis, rover ? '4wd-battery' : sumo ? 'sumo-battery' : 'battery', battery);
  const regulator = put('regulator-5v'); join(chassis, rover ? '4wd-regulator' : tower ? 'tower-regulator' : sumo ? 'sumo-regulator' : 'regulator', regulator);
  const power = put('power-switch'); join(chassis, rover ? '4wd-switch' : tower ? 'tower-switch' : sumo ? 'sumo-switch' : 'switch', power);
  const bracket = put('sensor-bracket'); join(controlDeck, 'front', bracket);
  const sensor = put('hc-sr04'); join(bracket, 'sensor', sensor);
  p = setPartProp(p, battery, 'voltage', 6);
  p = setPartProp(setPartProp(setPartProp(p, driver, 'jumperENA', false), driver, 'jumperENB', false), driver, 'jumper5V', false);
  const pin = (instanceId: string, pinId: string) => ({instanceId, pinId});
  const wire = (a: ReturnType<typeof pin>, b: ReturnType<typeof pin>, color: string) => {const r = connect(p, a, b, color); if ('error' in r) fail(r.error); else p = r.project;};
  const RED = '#d64545', BLACK = '#222222', BLUE = '#2a67a3', YELLOW = '#e0a52a', GREEN = '#2a8f4f', METAL = '#aab3b9';
  // Motor supply stays off the breadboard. The switch also disconnects the low-current regulator input.
  wire(pin(battery, 'B+'), pin(power, 'IN'), RED); wire(pin(power, 'OUT'), pin(driver, '+12V'), RED); wire(pin(power, 'OUT'), pin(regulator, 'VIN'), RED);
  wire(pin(battery, 'B-'), pin(driver, 'GND'), BLACK); wire(pin(battery, 'B-'), pin(regulator, 'GND'), BLACK);
  wire(pin(regulator, '5V'), pin(board, 'L+1'), RED); wire(pin(regulator, 'GND.OUT'), pin(board, 'L-1'), BLACK);
  wire(pin(board, 'L+25'), pin(board, 'R+1'), RED); wire(pin(board, 'L-25'), pin(board, 'R-1'), BLACK);
  wire(pin(board, 'R+10'), pin(uno, '5V'), RED); wire(pin(board, 'R-10'), pin(uno, 'GND.1'), BLACK);
  wire(pin(board, 'R+5'), pin(driver, '+5V'), RED);
  for (const [d, i] of [['D4', 'IN1'], ['D7', 'IN2'], ['D8', 'IN3'], ['D12', 'IN4']]) wire(pin(uno, d), pin(driver, i), BLUE);
  wire(pin(uno, 'D5'), pin(driver, 'ENA'), YELLOW); wire(pin(uno, 'D6'), pin(driver, 'ENB'), YELLOW);
  wire(pin(driver, 'OUT1'), pin(motorL, 'M+'), RED); wire(pin(driver, 'OUT2'), pin(motorL, 'M-'), BLACK);
  wire(pin(driver, 'OUT3'), pin(motorR, 'M+'), RED); wire(pin(driver, 'OUT4'), pin(motorR, 'M-'), BLACK);
  wire(pin(sensor, 'VCC'), pin(board, 'L+5'), RED); wire(pin(sensor, 'GND'), pin(board, 'L-5'), BLACK);
  wire(pin(uno, 'D9'), pin(board, 'A5'), GREEN); wire(pin(board, 'E5'), pin(sensor, 'TRIG'), GREEN);
  wire(pin(uno, 'D10'), pin(board, 'A7'), GREEN); wire(pin(board, 'E7'), pin(sensor, 'ECHO'), GREEN);
  if (rover) {
    const frontL = put('dc-motor-tt'), frontR = put('dc-motor-tt'); join(chassis, '4wd-motor-fl', frontL); join(chassis, '4wd-motor-fr', frontR);
    for (const [motor, axle] of [[frontL, 'axle-l'], [frontR, 'axle-r']]) {
      const wheel = put('wheel-65'), r = attach(p, {instanceId: motor, anchorId: axle}, {instanceId: wheel, anchorId: 'hub'}); if ('error' in r) fail(r.error); else p = r.project;
    }
    const frontDriver = put('l298n-module'); join(chassis, '4wd-driver-b', frontDriver);
    p = setPartProp(setPartProp(setPartProp(p, frontDriver, 'jumperENA', false), frontDriver, 'jumperENB', false), frontDriver, 'jumper5V', false);
    wire(pin(power, 'OUT'), pin(frontDriver, '+12V'), RED); wire(pin(battery, 'B-'), pin(frontDriver, 'GND'), BLACK); wire(pin(board, 'R+20'), pin(frontDriver, '+5V'), RED);
    for (const [d, i] of [['D4', 'IN1'], ['D7', 'IN2'], ['D8', 'IN3'], ['D12', 'IN4'], ['D5', 'ENA'], ['D6', 'ENB']]) wire(pin(uno, d), pin(frontDriver, i), BLUE);
    wire(pin(frontDriver, 'OUT1'), pin(frontL, 'M+'), RED); wire(pin(frontDriver, 'OUT2'), pin(frontL, 'M-'), BLACK);
    wire(pin(frontDriver, 'OUT3'), pin(frontR, 'M+'), RED); wire(pin(frontDriver, 'OUT4'), pin(frontR, 'M-'), BLACK);
  }
  if (kind === 'line' || border) {
    const support = put('ir-double-bracket'); join(chassis, sumo ? 'sumo-ir' : 'line-sensors', support);
    const left = put('tcrt5000-module'), right = put('tcrt5000-module'); join(support, 'left', left); join(support, 'right', right);
    for (const [id, tap, row, d] of [[left, 15, 10, 'D2'], [right, 20, 12, 'D3']] as const) {
      wire(pin(id, 'VCC'), pin(board, `R+${tap}`), RED); wire(pin(id, 'GND'), pin(board, `R-${tap}`), BLACK);
      wire(pin(id, 'DO'), pin(board, `J${row}`), GREEN); wire(pin(board, `F${row}`), pin(uno, d), GREEN);
    }
  }
  if (sumo) {
    const upsideDown: Quat = [1, 0, 0, 0];
    for (const slot of ['sumo-post-l', 'sumo-post-c', 'sumo-post-r']) {
      const hanger = put('bracket-generic', [0, 0.5, 0], upsideDown); join(chassis, slot, hanger);
      const bumper = put('bracket-generic', [0, 0.5, 0], upsideDown); join(hanger, 'front-low', bumper);
    }
  }
  if (kind === 'explorer') {
    const q: Quat = [0, Math.SQRT1_2, 0, Math.SQRT1_2];
    const led = put('led-5mm', [0, 0.5, 0], q), resistor = put('resistor', [0, 0.5, 0], q);
    join(board, 'indicator', led); join(board, 'resistor', resistor);
    p = setPartProp(setPartProp(p, led, 'color', 'rojo'), resistor, 'ohms', 220);
    wire(pin(uno, 'D11'), pin(board, 'E25'), YELLOW);
    wire(pin(board, 'C25'), pin(resistor, 'P1'), METAL); wire(pin(resistor, 'P2'), pin(board, 'C21'), METAL);
    wire(pin(led, 'A'), pin(board, 'A21'), METAL); wire(pin(led, 'K'), pin(board, 'A20'), METAL);
    wire(pin(board, 'E20'), pin(board, 'L-20'), BLACK);
  }
  const source = tower ? FOLLOW_SKETCH : border ? SUMO_SKETCH : kind === 'line' ? LINE_SKETCH : kind === 'explorer' ? EXPLORER_SKETCH : AVOID_SKETCH;
  const hex = tower ? FOLLOW_HEX : border ? SUMO_HEX : kind === 'line' ? LINE_HEX : kind === 'explorer' ? EXPLORER_HEX : AVOID_HEX;
  p = ensureFirmware(p, uno); p = {...p, firmware: p.firmware.map(f => f.targetInstanceId === uno ? {...f, source, updatedAt: now} : f)};
  p = setFirmwareArtifact(p, uno, {hex, origin: 'remote-compiler', sourceHash: hashSource(source), compiledAt: now});
  p = {...p, scene: {...p.scene, obstacles: kind === 'line' ? [] : [{id: 'caja-ejemplo', shape: 'box', transform: {position: [0, 0.1, 0.75], rotation: [0, 0, 0, 1]}, size: [0.4, 0.2, 0.1]}], ...(kind === 'line' ? {lineTrack: makeLineTrack('oval')} : {})}, workspace: {mode: 'build'}};
  if (tower) p = {...p, scene: {...p.scene, obstacles: [{id: 'objeto-seguimiento', shape: 'cylinder', transform: {position: [0, 0.1, 0.65], rotation: [0, 0, 0, 1]}, size: [0.16, 0.2, 0.16]}]}};
  if (border) p = {...p, scene: {...p.scene, obstacles: [], lineTrack: makeLineTrack('arena')}};
  return p;
}
export const buildReadyRobot = (now = new Date().toISOString()): RobotProject => buildKit('avoid', now);
export const buildLineRobot = (now = new Date().toISOString()): RobotProject => buildKit('line', now);
export const buildExplorer = (now = new Date().toISOString()): RobotProject => buildKit('explorer', now);
export const buildRover4wd = (now = new Date().toISOString()): RobotProject => buildKit('rover', now);
export const buildTowerRobot = (now = new Date().toISOString()): RobotProject => buildKit('tower', now);
export const buildSumoRobot = (now = new Date().toISOString()): RobotProject => buildKit('sumo', now);
export function buildCombatRobot(kind: 'wedge' | 'scoop' | 'bumper', now = new Date().toISOString()): RobotProject {
  let p = buildKit(kind === 'scoop' ? 'sumo4' : 'sumo', now);
  if (kind !== 'scoop') p = removeParts(p, p.parts.filter(x => x.definitionId === 'bracket-generic').map(x => x.instanceId)).project;
  const chassis = p.parts.find(x => x.definitionId === 'chassis-2wd')!;
  if (kind === 'scoop') {
    const support = p.parts.find(x => x.definitionId === 'ir-double-bracket')!;
    p = detach(p,p.attachments.find(x => x.child.instanceId === support.instanceId)!.id);
    const joinedSupport = attach(p,{instanceId:chassis.instanceId,anchorId:'combat-ir'},{instanceId:support.instanceId,anchorId:'base'});
    if ('error' in joinedSupport) return fail(joinedSupport.error); p = joinedSupport.project;
  }
  const sensorBracket = p.parts.find(x => x.definitionId === 'sensor-bracket')!;
  const old = p.attachments.find(x => x.child.instanceId === sensorBracket.instanceId)!;
  p = detach(p,old.id);
  const elevated = attach(p,{instanceId:chassis.instanceId,anchorId:'combat-sensor'},{instanceId:sensorBracket.instanceId,anchorId:'base'});
  if ('error' in elevated) return fail(elevated.error); p = elevated.project;
  const added = addPart(p,`sumo-${kind}`);
  if ('error' in added) return fail(added.error); p = added.project;
  const joined = attach(p,{instanceId:chassis.instanceId,anchorId:'combat-front'},{instanceId:p.parts.at(-1)!.instanceId,anchorId:'back'});
  if ('error' in joined) return fail(joined.error); p = joined.project;
  const id = kind === 'wedge' ? TEMPLATE_WEDGE : kind === 'scoop' ? TEMPLATE_SCOOP : TEMPLATE_PUSHER;
  return {...p,name:COMBAT_TEMPLATES.find(x=>x.id===id)!.name,workspace:{mode:'build',camera:{position:[.65,.48,.75],target:[0,.04,.03]}}};
}
export function buildTemplate(id: string, now?: string): RobotProject | null {
  if (id === TEMPLATE_TRACKED) return buildTrackedRobot(now);
  if (id === TEMPLATE_PICK) return buildTrackedRobot(now, true);
  if (id === TEMPLATE_WEDGE || id === TEMPLATE_SCOOP || id === TEMPLATE_PUSHER) return buildCombatRobot(id === TEMPLATE_WEDGE ? 'wedge' : id === TEMPLATE_SCOOP ? 'scoop' : 'bumper',now);
  if (id === ARM_TEMPLATE) return buildArmPractice(now);
  if (id === ARM_TRANSFER_TEMPLATE) return buildArmTransfer(now);
  if (id === CONVEYOR_TEMPLATE) return buildConveyorCell(now);
  return id === TEMPLATE_READY_ROBOT ? buildReadyRobot(now) : id === TEMPLATE_LINE_ROBOT ? buildLineRobot(now) : id === TEMPLATE_EXPLORER ? buildExplorer(now) : id === TEMPLATE_ROVER_4WD ? buildRover4wd(now) : id === TEMPLATE_TOWER ? buildTowerRobot(now) : id === TEMPLATE_SUMO ? buildSumoRobot(now) : null;
}
