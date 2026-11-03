// Mensajes entre la interfaz y el worker de la simulación (docs/robotica/02 §5).
import type {SimModel, Snapshot} from './coordinator.ts';

export type ToWorker =
  | {t: 'load'; model: SimModel}
  | {t: 'start'}
  | {t: 'pause'}
  | {t: 'speed'; factor: number}
  | {t: 'ping'; n: number}
  /** Valor vivo de un control del banco: potenciómetro (0–1) o pulsador (0/1). */
  | {t: 'control'; id: string; value: number}
  /** Descarga (sin iniciar) el motor de física, para que quede en la caché y funcione sin conexión. */
  | {t: 'warm'};

export type FromWorker =
  | {t: 'ready'}
  | {t: 'loaded'; status: Snapshot['status']; message?: string}
  /** `ratio`: tiempo virtual / tiempo real logrado; `lag`: no alcanza la velocidad pedida. */
  | {t: 'snapshot'; snapshot: Snapshot; ratio: number; lag: boolean}
  | {t: 'pong'; n: number}
  | {t: 'warmed'}
  | {t: 'error'; message: string};

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
