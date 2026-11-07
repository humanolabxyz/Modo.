// Sintetizador de sonidos de Industria con WebAudio (sin archivos de audio). Solo reproduce lo que decide plan.ts. Apagado por defecto; se crea al activarlo con un clic.
import type {SoundEvent} from './plan.ts';

type Ctx = AudioContext;
export class IndustriaSound {
  private ctx: Ctx | null = null;
  private hum: {gain: GainNode; oscs: OscillatorNode[]} | null = null;
  /** Eventos pedidos (cuenten o no con audio disponible): sirve para comprobar el comportamiento sin oír. */
  played = 0;
  get active(): boolean { return this.ctx !== null && this.ctx.state !== 'closed'; }

  async enable(): Promise<boolean> {
    try {
      const Audio = window.AudioContext ?? (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
      if (!Audio) return false;
      this.ctx ??= new Audio();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return true;
    } catch { return false; }
  }
  disable() { this.setMotors(0); this.hum = null; void this.ctx?.close().catch(() => {}); this.ctx = null; }

  private burst(freq: number, ms: number, gain: number, type: OscillatorType = 'square', noise = 0.6) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime, len = Math.max(1, Math.floor(ctx.sampleRate * ms / 1000)), buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    const src = ctx.createBufferSource(); src.buffer = buf; const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = freq * 3; const g = ctx.createGain(); g.gain.setValueAtTime(gain * noise, t); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    src.connect(filter).connect(g).connect(ctx.destination); src.start(t);
    const osc = ctx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq / 2, t + ms / 1000); const og = ctx.createGain(); og.gain.setValueAtTime(gain * (1 - noise), t); og.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(og).connect(ctx.destination); osc.start(t); osc.stop(t + ms / 1000 + 0.02);
  }

  play(ev: SoundEvent) {
    this.played++;
    if (ev.kind === 'contactor') { this.burst(ev.on ? 180 : 140, ev.on ? 90 : 60, ev.on ? 0.22 : 0.14); }
    else if (ev.kind === 'switch') this.burst(520, 40, 0.16);
    else if (ev.kind === 'button') this.burst(ev.on ? 700 : 520, 25, 0.1);
    else this.burst(900, 140, 0.2, 'triangle', 0.3);
  }

  /** Zumbido de motores (50 Hz y su armónico, filtrado); más motores, algo más fuerte. */
  setMotors(count: number) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running') return;
    if (count <= 0) { if (this.hum) { const {gain, oscs} = this.hum; gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15); const t = ctx.currentTime + 0.8; oscs.forEach(o => { try { o.stop(t); } catch { /* ya detenido */ } }); this.hum = null; } return; }
    if (!this.hum) {
      const gain = ctx.createGain(); gain.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.connect(gain).connect(ctx.destination);
      const oscs = [50, 100].map((f, i) => { const o = ctx.createOscillator(); o.type = i ? 'sine' : 'sawtooth'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = i ? 0.5 : 1; o.connect(g).connect(lp); o.start(); return o; });
      this.hum = {gain, oscs};
    }
    this.hum.gain.gain.setTargetAtTime(0.035 * Math.min(3, count), ctx.currentTime, 0.2);
  }
}
