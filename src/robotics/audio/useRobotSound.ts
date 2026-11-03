import {useCallback, useEffect, useRef, useState} from 'react';
import type {RobotProject} from '../project/types.ts';
import type {Snapshot} from '../sim/coordinator.ts';
import {RobotSound} from './robotSound.ts';
import {soundEvents, soundTargets, type SoundTargets} from './soundModel.ts';

const KEY = 'panellab.robotica.sonido';
const readPreference = () => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } };

/** Sonido del robot según la simulación. Se puede silenciar; la preferencia se recuerda en este navegador. El audio solo arranca tras un clic del usuario (▶ o el botón de sonido). */
export function useRobotSound(project: RobotProject, snapshot: Snapshot | null, status: 'stopped' | 'running' | 'paused' | string) {
  const [enabled, setEnabled] = useState(readPreference);
  const engine = useRef<RobotSound | null>(null), button = useRef<HTMLButtonElement | null>(null);
  const prev = useRef<{snap: Snapshot | null; targets: SoundTargets | null; events: number}>({snap: null, targets: null, events: 0});
  const sound = () => (engine.current ??= new RobotSound());

  const show = (t: SoundTargets | null, ctxState: string) => {
    const el = button.current; if (!el) return;
    el.dataset.sound = enabled ? 'on' : 'off'; el.dataset.soundCtx = ctxState; el.dataset.soundEvents = String(prev.current.events);
    el.dataset.soundMotors = (t ? Math.max(0, ...t.motors.map(m => m.level)) : 0).toFixed(2); el.dataset.soundTracks = (t?.tracks ?? 0).toFixed(2);
    el.dataset.soundServo = String(Math.round(t ? Math.max(0, ...t.servos.map(s => s.rate)) : 0)); el.dataset.soundHeld = String(t?.held.length ?? 0);
  };

  const toggle = useCallback(() => {
    const next = !enabled; setEnabled(next);
    try { localStorage.setItem(KEY, next ? '1' : '0'); } catch { /* sin almacenamiento: no se recuerda */ }
    if (next) void sound().enable(); else sound().silence();
  }, [enabled]);

  useEffect(() => {
    const s = sound(), p = prev.current;
    if (status === 'stopped') { p.snap = null; p.targets = null; s.silence(); show(null, s.running ? 'running' : 'idle'); return; }
    if (!enabled || status !== 'running') { s.silence(); show(p.targets, s.running ? 'running' : 'idle'); return; }
    if (!s.running) void s.enable();
    const t = soundTargets(project, snapshot, p.snap), events = soundEvents(p.targets, t);
    s.apply(t, events); p.events += events.length; p.snap = snapshot; p.targets = t; show(t, s.running ? 'running' : 'suspended');
  }, [snapshot, status, enabled, project]);

  useEffect(() => () => { void engine.current?.close(); engine.current = null; }, []);
  return {enabled, toggle, button};
}
