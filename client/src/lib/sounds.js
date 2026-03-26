/**
 * sounds.js — Web Audio API synthesiser, no external files needed.
 * All sounds are generated programmatically.
 * AudioContext is created lazily on first user gesture.
 */

let _ctx = null;
let _noiseBuf = null;

function ac() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _ctx = new AC();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

/** 2-second white noise buffer, reused across sounds */
function noiseBuf() {
  const c = ac();
  if (!c) return null;
  if (_noiseBuf) return _noiseBuf;
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  _noiseBuf = buf;
  return buf;
}

// ─── UI sounds ────────────────────────────────────────────────────────────────

/** Soft button click */
export function playClick() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(700, t);
  osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);
  g.gain.setValueAtTime(0.07, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + 0.07);
}

/** Step / form submission success — ascending 5-note chime */
export function playStepComplete() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  [392, 523, 659, 784, 1047].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + i * 0.07);
    g.gain.linearRampToValueAtTime(0.16, t + i * 0.07 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.28);
    osc.connect(g); g.connect(c.destination);
    osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.3);
  });
}

/** Completion fanfare — full ascending run + held chord */
export function playFanfare() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  // run
  [262, 330, 392, 523, 659, 784, 1047].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + i * 0.06);
    g.gain.linearRampToValueAtTime(0.14, t + i * 0.06 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.25);
    osc.connect(g); g.connect(c.destination);
    osc.start(t + i * 0.06); osc.stop(t + i * 0.06 + 0.3);
  });
  // held chord after run
  [523, 659, 784].forEach(freq => {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + 0.5);
    g.gain.linearRampToValueAtTime(0.12, t + 0.52);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    osc.connect(g); g.connect(c.destination);
    osc.start(t + 0.5); osc.stop(t + 1.5);
  });
}

// ─── Game sounds ──────────────────────────────────────────────────────────────

/** Camera shutter click — short transient */
export function playShutter() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(2800, t);
  osc.frequency.exponentialRampToValueAtTime(280, t + 0.04);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + 0.055);
}

/** Capture success — shutter + ascending gold chime */
export function playCapture() {
  playShutter();
  const c = ac(); if (!c) return;
  const t = c.currentTime + 0.03;
  [523, 784, 1047, 1568].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t + i * 0.055);
    g.gain.linearRampToValueAtTime(0.15, t + i * 0.055 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.22);
    osc.connect(g); g.connect(c.destination);
    osc.start(t + i * 0.055); osc.stop(t + i * 0.055 + 0.25);
  });
}

/** Miss — low buzz */
export function playMiss() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + 0.15);
}

/** Car whoosh — noise band swept from high to low */
export function playCarWhoosh(speedFactor = 1) {
  const c = ac(); if (!c) return;
  const buf = noiseBuf(); if (!buf) return;
  const t   = c.currentTime;
  const dur = 0.28 / speedFactor;

  const src    = c.createBufferSource();
  src.buffer   = buf;
  const filter = c.createBiquadFilter();
  filter.type  = 'bandpass';
  filter.frequency.setValueAtTime(1800, t);
  filter.frequency.exponentialRampToValueAtTime(140, t + dur);
  filter.Q.value = 3;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.3, t + 0.02);
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.connect(filter); filter.connect(g); g.connect(c.destination);
  src.start(t); src.stop(t + dur + 0.05);
}

/** Countdown tick — alternates pitch, final is higher */
export function playTick(isFinal = false) {
  const c = ac(); if (!c) return;
  const t   = c.currentTime;
  const osc = c.createOscillator();
  const g   = c.createGain();
  osc.type  = 'sine';
  osc.frequency.value = isFinal ? 1200 : 660;
  g.gain.setValueAtTime(0.13, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.45 : 0.1));
  osc.connect(g); g.connect(c.destination);
  osc.start(t); osc.stop(t + 0.5);
}

/** Game-over horn — descending finish */
export function playGameOver() {
  const c = ac(); if (!c) return;
  const t = c.currentTime;
  [880, 784, 698, 523].forEach((freq, i) => {
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.16, t + i * 0.13);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.13 + 0.32);
    osc.connect(g); g.connect(c.destination);
    osc.start(t + i * 0.13); osc.stop(t + i * 0.13 + 0.38);
  });
}

/**
 * Racetrack engine ambience loop.
 * Returns { stop(), setSpeed(0-1) }
 */
export function startEngine() {
  const c = ac();
  if (!c) return { stop: () => {}, setSpeed: () => {} };

  const buf = noiseBuf();

  // Engine oscillators
  const osc1 = c.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 58;
  const osc2 = c.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = 116;
  const osc3 = c.createOscillator(); osc3.type = 'square';   osc3.frequency.value = 174;

  const engineGain = c.createGain();
  engineGain.gain.value = 0.045;

  // White noise for crowd rumble
  const noiseSrc = c.createBufferSource();
  noiseSrc.buffer = buf;
  noiseSrc.loop   = true;
  const nf = c.createBiquadFilter();
  nf.type = 'lowpass'; nf.frequency.value = 600;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.035;

  const master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.gain.linearRampToValueAtTime(1, c.currentTime + 0.8); // fade in

  osc1.connect(engineGain); osc2.connect(engineGain); osc3.connect(engineGain);
  noiseSrc.connect(nf); nf.connect(noiseGain);
  engineGain.connect(master); noiseGain.connect(master);
  master.connect(c.destination);

  osc1.start(); osc2.start(); osc3.start(); noiseSrc.start();

  return {
    stop() {
      const t = c.currentTime;
      master.gain.linearRampToValueAtTime(0, t + 0.6);
      setTimeout(() => {
        try { osc1.stop(); osc2.stop(); osc3.stop(); noiseSrc.stop(); } catch {}
      }, 700);
    },
    /** speed: 0 (slow) → 1 (max) — ramps engine pitch */
    setSpeed(speed) {
      const t = c.currentTime;
      const ramp = 0.8;
      osc1.frequency.linearRampToValueAtTime(58  + speed * 55,  t + ramp);
      osc2.frequency.linearRampToValueAtTime(116 + speed * 110, t + ramp);
      osc3.frequency.linearRampToValueAtTime(174 + speed * 165, t + ramp);
      engineGain.gain.linearRampToValueAtTime(0.045 + speed * 0.03, t + ramp);
    },
  };
}
