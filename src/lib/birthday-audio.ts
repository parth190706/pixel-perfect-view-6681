/**
 * Fully synthesised soundtrack + sfx (WebAudio, no external files).
 * Soft piano-ish tones, warm pad, tiny bells. Silently no-ops if unsupported.
 */

type Ctx = AudioContext & { _bd?: boolean };

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let delay: DelayNode | null = null;
let loopTimer: number | null = null;
let muted = false;
let started = false;

const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19]; // pentatonic
const ROOT = 220; // A3

const midiToFreq = (semi: number) => ROOT * Math.pow(2, semi / 12);

function ensure(): boolean {
  if (typeof window === "undefined") return false;
  if (ctx) return true;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC() as Ctx;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.34;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(lp);
    lp.connect(wet);
    wet.connect(master);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(master);
    musicGain.connect(delay);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(master);
    sfxGain.connect(delay);
    return true;
  } catch {
    ctx = null;
    return false;
  }
}

function tone(
  freq: number,
  time: number,
  dur: number,
  peak: number,
  type: OscillatorType,
  dest: GainNode,
) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function pad(time: number, dur: number) {
  if (!ctx || !musicGain) return;
  [0, 7, 12].forEach((s, i) => {
    tone(midiToFreq(s - 12), time, dur, 0.05 - i * 0.01, "sine", musicGain!);
  });
}

let step = 0;
function scheduleLoop() {
  if (!ctx || !musicGain) return;
  const now = ctx.currentTime;
  const bar = 2.6;
  if (step % 4 === 0) pad(now, bar * 4.4);
  const notes = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < notes; i++) {
    const semi = pick() + (Math.random() < 0.3 ? 12 : 0);
    tone(midiToFreq(semi), now + i * 0.7 + Math.random() * 0.3, 2.6, 0.075, "triangle", musicGain);
  }
  if (Math.random() < 0.4) {
    const semi = pick() + 24;
    tone(midiToFreq(semi), now + 1.4, 1.8, 0.028, "sine", musicGain);
  }
  step++;
  loopTimer = window.setTimeout(scheduleLoop, bar * 1000);
}

export function startAudio() {
  if (!ensure() || !ctx || !musicGain) return;
  void ctx.resume?.();
  if (started) return;
  started = true;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(muted ? 0 : 0.85, ctx.currentTime + 4);
  scheduleLoop();
}

export function setMuted(next: boolean) {
  muted = next;
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(next ? 0 : 0.9, ctx.currentTime + 0.4);
}

export function isMuted() {
  return muted;
}

export function stopAudio() {
  if (loopTimer) window.clearTimeout(loopTimer);
  loopTimer = null;
  started = false;
}

type Sfx = "tap" | "sparkle" | "chime" | "paper" | "page" | "complete" | "hush" | "bloom";

export function sfx(kind: Sfx) {
  if (!ensure() || !ctx || !sfxGain) return;
  const t = ctx.currentTime;
  const g = sfxGain;
  switch (kind) {
    case "tap":
      tone(midiToFreq(24), t, 0.28, 0.09, "sine", g);
      break;
    case "bloom":
      [12, 16, 19].forEach((s, i) => tone(midiToFreq(s), t + i * 0.06, 0.9, 0.07, "sine", g));
      break;
    case "sparkle":
      [24, 28, 31, 36].forEach((s, i) =>
        tone(midiToFreq(s), t + i * 0.045, 0.5, 0.045, "sine", g),
      );
      break;
    case "chime":
      [19, 26].forEach((s, i) => tone(midiToFreq(s), t + i * 0.09, 1.6, 0.06, "sine", g));
      break;
    case "paper": {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3) * 0.35;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3200;
      src.connect(bp);
      bp.connect(g);
      src.start(t);
      break;
    }
    case "page":
      tone(midiToFreq(14), t, 0.5, 0.05, "sine", g);
      tone(midiToFreq(21), t + 0.08, 0.7, 0.04, "sine", g);
      break;
    case "hush":
      tone(midiToFreq(-5), t, 1.8, 0.05, "sine", g);
      break;
    case "complete":
      [12, 16, 19, 24].forEach((s, i) =>
        tone(midiToFreq(s), t + i * 0.12, 2.2, 0.07, "triangle", g),
      );
      break;
  }
}
