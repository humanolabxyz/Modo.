import {ArenaMatch} from './model.ts';
import type {ArenaInput, ArenaOutput} from './protocol.ts';
const ctx = self as unknown as {postMessage(m: ArenaOutput): void; onmessage: ((e: {data: ArenaInput}) => void) | null};
let match: ArenaMatch | undefined, running = false, last = performance.now(), posted = 0, debt = 0, ratio = 1;
function fail(e: unknown) { running = false; ctx.postMessage({t: 'error', message: e instanceof Error ? e.message : String(e)}); match?.dispose(); match = undefined; }
ctx.onmessage = ({data}) => {
  if (data.t === 'load') void (async () => {
    const R = (await import('@dimforge/rapier3d-compat')).default; await R.init();
    match?.dispose(); match = new ArenaMatch(R, data.a, data.b, data.duration);
    running = true; last = performance.now(); debt = 0;
    ctx.postMessage({t: 'frame', frame: match.frame(), ratio});
  })().catch(fail);
  if (data.t === 'pause') running = false;
  if (data.t === 'resume') { running = true; last = performance.now(); debt = 0; }
};
setInterval(() => {
  if (!running || !match) return;
  const now = performance.now(), elapsed = Math.min(now - last, 100); last = now;
  debt = Math.min(debt + elapsed / 1000, 0.1);
  const began = performance.now(); let done = 0;
  try {
    while (debt >= 0.002 && performance.now() - began < 10) {
      match.step(); debt -= 0.002; done += 0.002;
      if (match.frame().result) {running = false; break;}
    }
    ratio = ratio * 0.8 + (done / Math.max(0.001, elapsed / 1000)) * 0.2;
    if (now - posted >= 50 || !running) { posted = now; ctx.postMessage({t: 'frame', frame: match.frame(), ratio}); }
  } catch (e) {fail(e);}
}, 16);
