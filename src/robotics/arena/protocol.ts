import type {RobotProject} from '../project/types.ts';
import type {ArenaFrame} from './model.ts';
export type ArenaInput = {t: 'load'; a: RobotProject; b: RobotProject; duration: number} | {t: 'pause'} | {t: 'resume'};
export type ArenaOutput = {t: 'frame'; frame: ArenaFrame; ratio: number} | {t: 'error'; message: string};
