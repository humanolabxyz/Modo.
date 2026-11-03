// Cuerpo humanoide del robot de pie: vientre abierto (cuatro columnas y rieles) que deja ver la electrónica del chasis, y un pecho más alto con la placa de hombros.
// Es un conjunto de cajas para que la electrónica de abajo no cuente como interferencia. Las mismas cajas se usan para la interferencia y para los colisionadores de la física.
import type {Vec3} from '../project/types.ts';

const mm = (v: number) => v / 1000;
export const TORSO_ID = 'robot-torso';
/** Cajas del torso respecto de su centro (162 mm de alto: el vientre de vidrio abajo y un pecho macizo arriba): centro y semiejes en metros. */
export const TORSO_BOXES: readonly {center: Vec3; half: Vec3}[] = [
  {center: [0, mm(78), 0], half: [mm(68), mm(3), mm(48)]},                                      // placa del cuello
  {center: [0, mm(60), 0], half: [mm(112), mm(19), mm(38)]},                                    // barra de hombros (los brazos cuelgan por fuera de las orugas)
  {center: [0, mm(30), 0], half: [mm(54), mm(44), mm(46)]},                                      // pecho
  ...[-1, 1].flatMap(sx => [-1, 1].map(sz => ({center: [sx * mm(64), -mm(50), sz * mm(69)] as Vec3, half: [mm(4), mm(31), mm(4)] as Vec3}))), // cuatro columnas del vientre
  ...[-1, 1].map(sx => ({center: [sx * mm(64), -mm(75), 0] as Vec3, half: [mm(4), mm(3), mm(56)] as Vec3})),                                // rieles inferiores (más cortos que el cuerpo para dejar libre el interruptor del chasis)
];
