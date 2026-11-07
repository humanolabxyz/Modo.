// Qué cambia en cada modo educativo (fase 9). Puro. Libre ≠ Construir/Simular: el modo es una política pedagógica del proyecto; Construir/Simular es solo estado de interfaz.
import type {EducationMode} from './types.ts';

export type ModePolicy = {
  label: string;
  description: string;
  /** Las comprobaciones de la actividad se ven en vivo (✓/✗) con su pista. */
  liveChecks: boolean;
  hints: boolean;
  /** «Comprobar ahora» manual (sin pistas). */
  manualCheck: boolean;
  /** Un cable que rompe una regla (tierra, cortocircuito…) se rechaza al crearlo, con el motivo. */
  blockInvalidWiring: boolean;
  /** Avisos de topología, de programa y de la simulación. */
  showIssues: boolean;
  autoDiagnosis: boolean;
  /** La actividad se entrega y el proyecto queda bloqueado. */
  allowSubmit: boolean;
  /** Las fallas marcadas como ocultas no se listan. */
  hideHiddenFaults: boolean;
};

export const MODE_POLICY: Record<EducationMode, ModePolicy> = {
  free: {label: 'Libre', description: 'Sin guía: todo está permitido y los errores se marcan pero no se impiden. Las comprobaciones de una actividad se piden a mano.',
    liveChecks: false, hints: false, manualCheck: true, blockInvalidWiring: false, showIssues: true, autoDiagnosis: true, allowSubmit: false, hideHiddenFaults: false},
  learning: {label: 'Aprendizaje', description: 'Guiado: la actividad muestra sus pasos con ✓/✗ en vivo y pistas, y los cables que rompen una regla se rechazan explicando por qué.',
    liveChecks: true, hints: true, manualCheck: false, blockInvalidWiring: true, showIssues: true, autoDiagnosis: true, allowSubmit: false, hideHiddenFaults: false},
  test: {label: 'Prueba', description: 'Evaluación: sin pistas, sin avisos de validación ni diagnóstico automático, con fallas ocultas. El resultado se ve al entregar y la entrega bloquea el proyecto.',
    liveChecks: false, hints: false, manualCheck: false, blockInvalidWiring: false, showIssues: false, autoDiagnosis: false, allowSubmit: true, hideHiddenFaults: true},
};
export const policyOf = (mode: EducationMode): ModePolicy => MODE_POLICY[mode];
