import {useCallback, useEffect, useRef, useState} from 'react';
import type {SimModel, Snapshot} from './coordinator.ts';
import type {FromWorker, ToWorker} from './protocol.ts';

export type SimStatus = 'stopped' | 'running' | 'paused';
const SERIAL_LIMIT = 20000;

/** Ciclo de vida de la simulación: un worker por ejecución. Detener = `terminate()` (siempre funciona, aunque el worker esté colgado). */
export function useRobotSim() {
  const [status, setStatus] = useState<SimStatus>('stopped');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [serial, setSerial] = useState('');
  const [ratio, setRatio] = useState(1);
  const [lag, setLag] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [message, setMessage] = useState('');
  const worker = useRef<Worker | null>(null), beat = useRef(0), speedRef = useRef(1), statusRef = useRef<SimStatus>('stopped');
  statusRef.current = status;

  const send = (m: ToWorker) => worker.current?.postMessage(m);
  const kill = useCallback((why?: string) => {
    worker.current?.terminate(); worker.current = null;
    setStatus('stopped'); setSnapshot(null); setRatio(1); setLag(false);
    if (why) setMessage(why);
  }, []);

  const start = useCallback((model: SimModel) => {
    worker.current?.terminate();
    setSerial(''); setMessage(''); setSnapshot(null);
    const w = new Worker(new URL('./sim.worker.ts', import.meta.url), {type: 'module'});
    worker.current = w; beat.current = Date.now();
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      beat.current = Date.now();
      const m = e.data;
      if (m.t === 'snapshot') {
        setSnapshot(m.snapshot); setRatio(m.ratio); setLag(m.lag);
        if (m.snapshot.serial) setSerial(s => (s + m.snapshot.serial).slice(-SERIAL_LIMIT));
        if (m.snapshot.status === 'error' && m.snapshot.message) setMessage(m.snapshot.message);
      } else if (m.t === 'loaded') { if (m.status === 'error') { setMessage(m.message ?? 'No se pudo cargar el programa.'); kill(m.message ?? 'No se pudo cargar el programa.'); } else if (m.message) setMessage(m.message); }
      else if (m.t === 'error') kill(`La simulación falló: ${m.message}`);
    };
    w.onerror = e => kill(`La simulación falló: ${e.message || 'error del worker'}`);
    w.postMessage({t: 'load', model} satisfies ToWorker); w.postMessage({t: 'speed', factor: speedRef.current} satisfies ToWorker); w.postMessage({t: 'start'} satisfies ToWorker);
    setStatus('running');
  }, [kill]);

  // Latido: si el worker no responde en 4 s se descarta y se avisa (el lienzo nunca se bloquea porque la emulación vive en otro hilo).
  useEffect(() => {
    if (status !== 'running') return;
    let n = 0;
    const timer = setInterval(() => { send({t: 'ping', n: ++n}); if (Date.now() - beat.current > 4000) kill('El programa no responde: se detuvo la simulación.'); }, 1000);
    return () => clearInterval(timer);
  }, [status, kill]);
  useEffect(() => () => { worker.current?.terminate(); }, []);

  return {
    status, snapshot, serial, ratio, lag, speed, message,
    start,
    pause: () => { send({t: 'pause'}); setStatus('paused'); },
    resume: () => { beat.current = Date.now(); send({t: 'start'}); setStatus('running'); },
    stop: (why?: string) => kill(why),
    setSpeed: (factor: number) => { speedRef.current = factor; setSpeedState(factor); send({t: 'speed', factor}); },
    clearSerial: () => setSerial(''),
    setMessage,
  };
}
export type RobotSim = ReturnType<typeof useRobotSim>;
