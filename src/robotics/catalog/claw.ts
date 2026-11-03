// Pinza de dos dedos paralelos. Un servo la abre y la cierra: la separación entre los dedos depende de su ángulo. Mismo cálculo en la física, el 3D y las guías.
const mm = (v: number) => v / 1000;
export const CLAW_ID = 'robot-claw';
/** Separación libre entre los dedos (m) según el ángulo del servo de la pinza: 0° = muy abierta (64 mm), 90° = casi cerrada (19 mm). */
export const clawGap = (angleDeg: number): number => Math.max(mm(4), mm(64 - 0.5 * Math.min(180, Math.max(0, angleDeg))));
/** Ángulo (°) del servo para una separación dada (m). */
export const clawAngleFor = (gapM: number): number => Math.round((64 - gapM * 1000) / 0.5);
export const FINGER = {thickness: mm(6), length: mm(34), width: mm(30), centerY: -mm(17)} as const;
/** Zona (en el marco de la pinza) donde un objeto queda entre los dedos y se puede agarrar. */
export const GRASP_ZONE = {halfX: mm(8), y: [-mm(34), -mm(6)] as const, halfZ: mm(14)} as const;
