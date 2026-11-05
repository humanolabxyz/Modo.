// Sonido sintetizado del robot con Web Audio (sin archivos): motores, orugas, servos, freno, pinzas y encendido.
// Todo parte de `soundTargets` y `soundEvents`: si la simulación no mueve algo, no suena.
import type {SoundEvent, SoundTargets} from './soundModel.ts';

type Voice = {gain: GainNode; set: (level: number, rate?: number) => void};

export class RobotSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private motors = new Map<string, Voice>();
  private servos = new Map<string, Voice>();
  private tracks: Voice | null = null;
  private servoCount = 0;

  /** Crea el contexto de audio (hay que llamarlo desde un clic) y lo activa. */
  async enable(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const ctx = new AudioContext(), compressor = ctx.createDynamicsCompressor(), master = ctx.createGain();
        master.gain.value = 0.9; master.connect(compressor); compressor.connect(ctx.destination);
        const length = ctx.sampleRate, buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        this.ctx = ctx; this.master = master; this.noise = buffer;
      }
      await this.ctx.resume();
      return this.ctx.state === 'running';
    } catch { return false; }
  }

  get running() { return this.ctx?.state === 'running'; }

  /** Calla todo sin destruir las voces (pausa, detención o silencio). */
  silence() {
    const ctx = this.ctx; if (!ctx) return;
    for (const v of [...this.motors.values(), ...this.servos.values(), ...(this.tracks ? [this.tracks] : [])]) v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
  }

  async close() { this.silence(); const ctx = this.ctx; this.ctx = null; this.master = null; this.motors.clear(); this.servos.clear(); this.tracks = null; try { await ctx?.close(); } catch { /* ya cerrado */ } }

  apply(next: SoundTargets, events: SoundEvent[]) {
    const ctx = this.ctx; if (!ctx || ctx.state !== 'running' || !this.master) return;
    const seen = new Set<string>();
    for (const m of next.motors) { seen.add(m.id); this.motorVoice(m.id, m.pan).set(m.level); }
    for (const [id, v] of this.motors) if (!seen.has(id)) v.set(0);
    const moving = new Set<string>();
    for (const s of next.servos) { moving.add(s.id); this.servoVoice(s.id, s.pan).set(0, s.rate); }
    for (const [id, v] of this.servos) if (!moving.has(id)) v.set(0, 0);
    if (next.tracks > 0 || this.tracks) this.tracksVoice().set(next.tracks);
    for (const e of events) this.play(e);
  }

  private ramp(param: AudioParam, value: number, tau = 0.06) { param.setTargetAtTime(value, this.ctx!.currentTime, tau); }

  /** Motor de corriente continua con caja reductora: zumbido grave que sube con la velocidad y un chillido de engranajes. */
  private motorVoice(id: string, pan: number): Voice {
    const found = this.motors.get(id); if (found) return found;
    const ctx = this.ctx!, out = ctx.createGain(), panner = ctx.createStereoPanner(), lp = ctx.createBiquadFilter(), body = ctx.createOscillator(), gears = ctx.createOscillator(), gearsGain = ctx.createGain();
    body.type = 'sawtooth'; gears.type = 'triangle'; lp.type = 'lowpass'; lp.Q.value = 0.9; panner.pan.value = pan; out.gain.value = 0; gearsGain.gain.value = 0.35;
    body.connect(lp); gears.connect(gearsGain); gearsGain.connect(lp); lp.connect(out); out.connect(panner); panner.connect(this.master!);
    body.start(); gears.start();
    const voice: Voice = {gain: out, set: level => {
      const l = Math.max(0, Math.min(1, level)), now = ctx.currentTime;
      body.frequency.setTargetAtTime(52 + l * 150, now, 0.08); gears.frequency.setTargetAtTime(310 + l * 780, now, 0.08);
      lp.frequency.setTargetAtTime(420 + l * 1500, now, 0.08); out.gain.setTargetAtTime(l > 0.02 ? 0.03 + 0.05 * l : 0, now, 0.06);
    }};
    this.motors.set(id, voice); return voice;
  }

  /** Servo SG90: zumbido agudo de motorcito y engranes de plástico mientras gira. */
  private servoVoice(id: string, pan: number): Voice {
    const found = this.servos.get(id); if (found) return found;
    const ctx = this.ctx!, index = this.servoCount++, out = ctx.createGain(), panner = ctx.createStereoPanner(), bp = ctx.createBiquadFilter(), buzz = ctx.createOscillator(), grit = ctx.createBufferSource(), gritGain = ctx.createGain();
    buzz.type = 'sawtooth'; bp.type = 'bandpass'; bp.Q.value = 1.6; panner.pan.value = pan; out.gain.value = 0;
    grit.buffer = this.noise; grit.loop = true; gritGain.gain.value = 0.5;
    buzz.connect(bp); grit.connect(gritGain); gritGain.connect(bp); bp.connect(out); out.connect(panner); panner.connect(this.master!);
    buzz.start(); grit.start(0, Math.random());
    const detune = 1 + (index % 7) * 0.035; // cada servo suena un poquito distinto
    const voice: Voice = {gain: out, set: (_level, rate = 0) => {
      const r = Math.max(0, rate), now = ctx.currentTime, on = r >= 8;
      buzz.frequency.setTargetAtTime((120 + Math.min(r, 600) * 0.28) * detune, now, 0.05); bp.frequency.setTargetAtTime((1500 + Math.min(r, 600) * 2) * detune, now, 0.05);
      out.gain.setTargetAtTime(on ? 0.012 + 0.03 * Math.min(1, r / 400) : 0, now, 0.03);
    }};
    this.servos.set(id, voice); return voice;
  }

  /** Orugas: golpeteo de los eslabones sobre el suelo, más rápido cuanto más avanza el robot. */
  private tracksVoice(): Voice {
    if (this.tracks) return this.tracks;
    const ctx = this.ctx!, src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), tremolo = ctx.createGain(), lfo = ctx.createOscillator(), lfoGain = ctx.createGain(), out = ctx.createGain();
    src.buffer = this.noise; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.7; tremolo.gain.value = 0.5; lfo.type = 'square'; lfoGain.gain.value = 0.5; out.gain.value = 0;
    src.connect(bp); bp.connect(tremolo); lfo.connect(lfoGain); lfoGain.connect(tremolo.gain); tremolo.connect(out); out.connect(this.master!);
    src.start(); lfo.start();
    const voice: Voice = {gain: out, set: level => { const l = Math.max(0, Math.min(1, level)), now = ctx.currentTime; lfo.frequency.setTargetAtTime(5 + l * 26, now, 0.1); bp.frequency.setTargetAtTime(220 + l * 260, now, 0.1); out.gain.setTargetAtTime(l > 0.02 ? 0.02 + 0.09 * l : 0, now, 0.08); }};
    this.tracks = voice; return voice;
  }

  private tone(freq: number, length: number, {type = 'triangle' as OscillatorType, volume = 0.05, to = freq, delay = 0} = {}) {
    const ctx = this.ctx!, t = ctx.currentTime + delay, osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + length);
    g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(0.0001, t + length); osc.connect(g); g.connect(this.master!); osc.start(t); osc.stop(t + length + 0.02);
  }

  private burst(length: number, {filter = 'highpass' as BiquadFilterType, freq = 2000, volume = 0.08} = {}) {
    const ctx = this.ctx!, t = ctx.currentTime, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = this.noise; f.type = filter; f.frequency.value = freq; g.gain.setValueAtTime(volume, t); g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(f); f.connect(g); g.connect(this.master!); src.start(t, Math.random() * 0.5); src.stop(t + length + 0.02);
  }

  play(e: SoundEvent) {
    if (!this.running || !this.master) return;
    switch (e.kind) {
      case 'ui-run': this.tone(620, .065, {to: 820, volume: .045}); break;
      case 'ui-pause': this.tone(600, .06, {to: 480, volume: .04}); break;
      case 'ui-stop': this.tone(360, .10, {to: 180, volume: .05}); break;
      case 'speed-up': this.tone(510, .09, {to: 830, volume: .045}); break;
      case 'speed-down': this.tone(700, .09, {to: 420, volume: .045}); break;
      case 'push-wood': this.burst(.035, {filter: 'lowpass', freq: 1350, volume: .065}); this.tone(260, .072, {to: 130, volume: .04}); break;
      case 'power-on': this.tone(660, 0.09, {volume: 0.04}); this.tone(990, 0.14, {volume: 0.04, delay: 0.1}); break;
      case 'surprise': this.tone(470, .13, {to: 840, volume: .07}); this.tone(980, .12, {delay: .11, to: 690, volume: .055}); break;
      case 'recover': this.tone(380, .14, {to: 220, volume: .065}); this.tone(340, .18, {delay: .15, to: 560, volume: .055}); break;
      case 'turn-left': this.tone(590, .10, {to: 430, volume: .045}); break;
      case 'turn-right': this.tone(590, .10, {to: 790, volume: .045}); break;
      case 'brake': this.tone(120, 0.18, {type: 'sine', volume: 0.16, to: 42}); this.burst(0.05, {filter: 'lowpass', freq: 500, volume: 0.1}); break;
      case 'grasp': this.burst(0.035, {freq: 2200, volume: 0.1}); this.tone(880, 0.05, {type: 'square', volume: 0.025}); this.tone(180, 0.07, {type: 'sine', volume: 0.07, to: 110, delay: 0.02}); break;
      case 'release': this.burst(0.03, {freq: 1500, volume: 0.07}); this.tone(520, 0.05, {type: 'square', volume: 0.02}); break;
      case 'servo-start': this.burst(0.012, {freq: 3000, volume: 0.025}); break;
      case 'servo-stop': this.burst(0.018, {freq: 2200, volume: 0.03}); this.tone(1400, 0.02, {type: 'square', volume: 0.008}); break;
    }
  }
}
