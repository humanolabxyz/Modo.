// Espacio libre frente al tablero (fase 19). Puro: se prueba en Node. En una instalación real el tablero necesita un pasillo libre delante para operarlo y mantenerlo.
// Los valores son de EJEMPLO, tomados como referencia de guías de otros países (en EE. UU. el espacio de trabajo es de al menos 30 pulgadas de ancho y 2,0 m de altura y la profundidad
// va de 36 a 42 pulgadas según la tensión; en Chile la NCh Elec 4/2003 trae una sección propia que no se revisó aquí). Deben contrastarse con la norma vigente antes de usarlos.
import {add, qRotate, scale} from '../../robotics/project/math.ts';
import {shapeOf} from './shapes.ts';
import {descendantsOf, obbIntersect, obbOfEntity, toTransform} from './snap.ts';
import type {IndustryProject, Vec3} from '../model/types.ts';

export const CLEAR_DEPTH = 1.0; // m
export const CLEAR_MIN_WIDTH = 0.76; // m
export const CLEAR_HEIGHT = 2.0; // m
/** Piezas que forman parte del recinto o del piso y no cuentan como obstáculo. */
const IGNORED = new Set(['piso-planta', 'piso-nave', 'canal-piso', 'sala-electrica', 'plinto-tablero', 'gabinete']);

type Obb = NonNullable<ReturnType<typeof obbOfEntity>>;
export type Clearance = {zone: Obb; depth: number; width: number; height: number; blockers: string[]};

/** Zona libre frente a un gabinete (la cara de la puerta mira a +z de la pieza) y las piezas que la ocupan. */
export function frontClearance(p: IndustryProject, id: string): Clearance | null {
  const e = p.entities.find(x => x.id === id), pose = p.poses[id];
  if (!e || !pose || e.definitionId !== 'gabinete') return null;
  const shape = shapeOf('gabinete'), rot = toTransform(pose).rotation, width = Math.max(shape.size[0], CLEAR_MIN_WIDTH);
  const local: Vec3 = [shape.center[0], CLEAR_HEIGHT / 2, shape.center[2] + shape.size[2] / 2 + CLEAR_DEPTH / 2];
  const center = add(pose.position, qRotate(rot, local));
  const axes = [qRotate(rot, [1, 0, 0]), qRotate(rot, [0, 1, 0]), qRotate(rot, [0, 0, 1])] as Obb['axes'];
  const zone = {center, axes, half: [width / 2 - 0.01, CLEAR_HEIGHT / 2 - 0.01, CLEAR_DEPTH / 2 - 0.01]} as Obb;
  void scale;
  const mine = new Set([id, ...descendantsOf(p, id)]);
  const blockers = p.entities.filter(o => !mine.has(o.id) && !IGNORED.has(o.definitionId)).filter(o => { const b = obbOfEntity(p, o.id); return !!b && obbIntersect(zone, b); }).map(o => o.id);
  return {zone, depth: CLEAR_DEPTH, width, height: CLEAR_HEIGHT, blockers};
}

/** Barrido de la puerta del gabinete al abrir: el cuadrado que recorre la hoja de ancho de la puerta (bisagra a la izquierda). Devuelve las piezas que estorbarían. */
export function doorSwing(p: IndustryProject, id: string): {zone: Obb; blockers: string[]} | null {
  const e = p.entities.find(x => x.id === id), pose = p.poses[id];
  if (!e || !pose || e.definitionId !== 'gabinete') return null;
  const shape = shapeOf('gabinete'), rot = toTransform(pose).rotation, leaf = shape.size[0] - 0.02;
  const center = add(pose.position, qRotate(rot, [-shape.size[0] / 2 + leaf / 2, shape.size[1] / 2, shape.size[2] / 2 + leaf / 2]));
  const axes = [qRotate(rot, [1, 0, 0]), qRotate(rot, [0, 1, 0]), qRotate(rot, [0, 0, 1])] as Obb['axes'];
  const zone = {center, axes, half: [leaf / 2 - 0.01, shape.size[1] / 2 - 0.01, leaf / 2 - 0.01]} as Obb;
  const mine = new Set([id, ...descendantsOf(p, id)]);
  const blockers = p.entities.filter(o => !mine.has(o.id) && !IGNORED.has(o.definitionId)).filter(o => { const b = obbOfEntity(p, o.id); return !!b && obbIntersect(zone, b); }).map(o => o.id);
  return {zone, blockers};
}
