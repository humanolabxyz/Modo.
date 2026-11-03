import {useCallback, useState} from 'react';
import {forgetWindowLayout} from '../../components/FloatingWindow';

/** Ventanas de herramientas de Robótica. Cada una es un `FloatingWindow` (el gestor existente); este hook solo recuerda cuáles están abiertas o minimizadas. */
export const WINDOW_IDS = ['arm', 'parts', 'structure', 'properties', 'scene', 'code', 'console'] as const;
export type RoboticsWindowId = (typeof WINDOW_IDS)[number];
export const storageIdOf = (id: RoboticsWindowId | 'projects' | 'options' | 'wiring' | 'program') => `robotica:${id}`;

type WindowState = {open: boolean; visible: boolean; activation: number};
const closedAll = (): Record<RoboticsWindowId, WindowState> => ({
  arm: {open: false, visible: true, activation: 0},
  parts: {open: false, visible: true, activation: 0},
  structure: {open: false, visible: true, activation: 0},
  properties: {open: false, visible: true, activation: 0},
  scene: {open: false, visible: true, activation: 0},
  code: {open: false, visible: true, activation: 0},
  console: {open: false, visible: true, activation: 0},
});

export function useRoboticsWindows() {
  const [state, setState] = useState(closedAll);
  /** Cambia al restablecer la disposición para remontar las ventanas y que vuelvan a su lugar inicial. */
  const [epoch, setEpoch] = useState(0);
  const patch = (id: RoboticsWindowId, change: (s: WindowState) => WindowState) => setState(s => ({...s, [id]: change(s[id])}));
  const open = useCallback((id: RoboticsWindowId) => patch(id, s => ({open: true, visible: true, activation: s.activation + 1})), []);
  const close = useCallback((id: RoboticsWindowId) => patch(id, s => ({...s, open: false, visible: true})), []);
  const minimize = useCallback((id: RoboticsWindowId) => patch(id, s => ({...s, visible: false})), []);
  /** Un clic en el botón del dock: abre, restaura si estaba minimizada, o cierra si ya estaba a la vista. */
  const toggle = useCallback((id: RoboticsWindowId) => setState(s => {
    const w = s[id];
    return {...s, [id]: !w.open ? {open: true, visible: true, activation: w.activation + 1} : !w.visible ? {...w, visible: true, activation: w.activation + 1} : {...w, open: false}};
  }), []);
  const resetLayout = useCallback(() => {
    for (const id of WINDOW_IDS) forgetWindowLayout(storageIdOf(id));
    forgetWindowLayout(storageIdOf('projects'));forgetWindowLayout(storageIdOf('wiring'));forgetWindowLayout(storageIdOf('program'));
    forgetWindowLayout(storageIdOf('options'));
    setState(closedAll());
    setEpoch(e => e + 1);
  }, []);
  return {state, epoch, open, close, minimize, toggle, resetLayout};
}
export type RoboticsWindows = ReturnType<typeof useRoboticsWindows>;
