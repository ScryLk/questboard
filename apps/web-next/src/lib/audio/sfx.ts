// ── SFX Library ──
// All sound effects generated programmatically via Web Audio API
// Zero downloads, zero latency, works offline

import { audioEngine, createWhiteNoise } from "./audio-engine";

export const SFX = {
  // ════════════════════════════════════
  // DADOS (rolagem)
  // ════════════════════════════════════

  diceRoll() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const output = audioEngine.sfxOutput;

    for (let i = 0; i < 8; i++) {
      const delay = i * 0.04 + Math.random() * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 800 + Math.random() * 1200;
      gain.gain.setValueAtTime(0.06 - i * 0.006, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
      osc.connect(gain);
      gain.connect(output);
      osc.start(now + delay);
      osc.stop(now + delay + 0.04);
    }
    // Final click
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "triangle";
    click.frequency.value = 600;
    clickGain.gain.setValueAtTime(0.08, now + 0.35);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    click.connect(clickGain);
    clickGain.connect(output);
    click.start(now + 0.35);
    click.stop(now + 0.5);
  },

  diceResult() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.25);
  },

  nat20() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i < 3 ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.08);
      osc.stop(now + 1.0);
    });

    // Shimmer
    const noise = createWhiteNoise(ctx, 0.6);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 4000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioEngine.sfxOutput);
  },

  nat1() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const notes = [293.66, 277.18, 261.63];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5;
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      gain.gain.setValueAtTime(0, now + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.04, now + i * 0.35 + 0.05);
      gain.gain.setValueAtTime(0.04, now + i * 0.35 + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.35 + 0.35);

      const lpf = ctx.createBiquadFilter();
      lpf.type = "lowpass";
      lpf.frequency.value = 800;

      osc.connect(lpf);
      lpf.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.35);
      osc.stop(now + i * 0.35 + 0.4);
      lfo.stop(now + i * 0.35 + 0.4);
    });
  },

  // ════════════════════════════════════
  // COMBATE
  // ════════════════════════════════════

  swordHit() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 400;
    osc.connect(hpf);
    hpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.2);

    // Impact noise
    const noise = createWhiteNoise(ctx, 0.08);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    const noiseBpf = ctx.createBiquadFilter();
    noiseBpf.type = "bandpass";
    noiseBpf.frequency.value = 2000;
    noise.connect(noiseBpf);
    noiseBpf.connect(noiseGain);
    noiseGain.connect(audioEngine.sfxOutput);
  },

  swordMiss() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const noise = createWhiteNoise(ctx, 0.15);
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.setValueAtTime(3000, now);
    bpf.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    bpf.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(bpf);
    bpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
  },

  arrowShot() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.25);
    // Swoosh after twang
    setTimeout(() => {
      if (audioEngine.initialized) SFX.swordMiss();
    }, 80);
  },

  arrowHit() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.1);
  },

  magicCast() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400 + i * 200, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(800 + i * 300, now + i * 0.06 + 0.1);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    }
  },

  magicHit() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(2000, now);
    lpf.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.35);
  },

  healSpell() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.1 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.1);
      osc.stop(now + 0.7);
    });
  },

  takeDamage() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.2);

    const noise = createWhiteNoise(ctx, 0.08);
    const noiseGain = ctx.createGain();
    const noiseLpf = ctx.createBiquadFilter();
    noiseLpf.type = "lowpass";
    noiseLpf.frequency.value = 500;
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.connect(noiseLpf);
    noiseLpf.connect(noiseGain);
    noiseGain.connect(audioEngine.sfxOutput);
  },

  creatureDeath() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 400;
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.7);
  },

  shieldBlock() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = 1500;
    bpf.Q.value = 3;
    osc.connect(bpf);
    bpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  explosion() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.6);

    const noise = createWhiteNoise(ctx, 0.4);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    const noiseBpf = ctx.createBiquadFilter();
    noiseBpf.type = "bandpass";
    noiseBpf.frequency.setValueAtTime(1000, now);
    noiseBpf.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    noise.connect(noiseBpf);
    noiseBpf.connect(noiseGain);
    noiseGain.connect(audioEngine.sfxOutput);
  },

  // ════════════════════════════════════
  // INTERFACE E SESSÃO
  // ════════════════════════════════════

  turnChange() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    [880, 1108].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  },

  myTurn() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  },

  chatMessage() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.1);
  },

  playerJoin() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    [660, 880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  },

  playerLeave() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    [1100, 880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  },

  notification() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 1047;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.5);
  },

  success() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.35);
  },

  error() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.setValueAtTime(0.04, now + 0.1);
    gain.gain.setValueAtTime(0, now + 0.12);
    gain.gain.setValueAtTime(0.04, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 600;
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.35);
  },

  doorOpen() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(250, now + 0.3);
    osc.frequency.linearRampToValueAtTime(80, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.setValueAtTime(0.03, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 500;
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.55);
  },

  coinDrop() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 2000 + Math.random() * 2000;
      const gain = ctx.createGain();
      const delay = i * 0.06 + Math.random() * 0.04;
      gain.gain.setValueAtTime(0.03, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    }
  },

  levelUp() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    scale.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
      osc.connect(gain);
      gain.connect(audioEngine.sfxOutput);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.2);
    });
  },

  opportunityAttack() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 600;
    osc.connect(hpf);
    hpf.connect(gain);
    gain.connect(audioEngine.sfxOutput);
    osc.start(now);
    osc.stop(now + 0.25);
  },

  // ════════════════════════════════════
  // SOUNDBOARD — efeitos dedicados
  // Cada efeito usa síntese por formantes,
  // harmônicos e texturas para soar reconhecível.
  // ════════════════════════════════════

  /** ⚡ Trovão — raio + trovão rolando 2.5s */
  sbThunder() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // 1) Raio — estalo elétrico curto e agudo
    const crack = createWhiteNoise(ctx, 0.08);
    const crackHpf = ctx.createBiquadFilter();
    crackHpf.type = "highpass";
    crackHpf.frequency.value = 4000;
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.25, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    crack.connect(crackHpf);
    crackHpf.connect(crackGain);
    crackGain.connect(out);

    // 2) Trovão — ruído grave longo com ondulação de amplitude
    const rumble = createWhiteNoise(ctx, 2.5);
    const rumbleLpf = ctx.createBiquadFilter();
    rumbleLpf.type = "lowpass";
    rumbleLpf.frequency.value = 120;
    rumbleLpf.Q.value = 1;
    // Sub-bass oscilante
    const subOsc = ctx.createOscillator();
    subOsc.type = "sine";
    subOsc.frequency.value = 35;
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0, now + 0.05);
    subGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    subGain.gain.setValueAtTime(0.18, now + 0.5);
    subGain.gain.linearRampToValueAtTime(0.08, now + 1.0);
    subGain.gain.linearRampToValueAtTime(0.12, now + 1.3);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
    subOsc.connect(subGain);
    subGain.connect(out);
    subOsc.start(now + 0.05);
    subOsc.stop(now + 2.5);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now + 0.04);
    rumbleGain.gain.linearRampToValueAtTime(0.15, now + 0.12);
    rumbleGain.gain.setValueAtTime(0.15, now + 0.4);
    rumbleGain.gain.linearRampToValueAtTime(0.06, now + 0.9);
    rumbleGain.gain.linearRampToValueAtTime(0.10, now + 1.2);
    rumbleGain.gain.linearRampToValueAtTime(0.04, now + 1.8);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    rumble.connect(rumbleLpf);
    rumbleLpf.connect(rumbleGain);
    rumbleGain.connect(out);
  },

  /** 🐺 Lobo — uivo com formantes vocais ~2.5s */
  sbWolf() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Fundamental — glissando de uivo
    const fund = ctx.createOscillator();
    fund.type = "sawtooth"; // rico em harmônicos
    fund.frequency.setValueAtTime(180, now);
    fund.frequency.linearRampToValueAtTime(350, now + 0.5);
    fund.frequency.linearRampToValueAtTime(420, now + 1.0);
    fund.frequency.setValueAtTime(420, now + 1.4);
    fund.frequency.linearRampToValueAtTime(380, now + 1.8);
    fund.frequency.linearRampToValueAtTime(250, now + 2.3);

    // Vibrato natural (pulmões do animal)
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.5;
    const vibGain = ctx.createGain();
    vibGain.gain.setValueAtTime(0, now);
    vibGain.gain.linearRampToValueAtTime(12, now + 0.8);
    vibGain.gain.setValueAtTime(12, now + 1.8);
    vibGain.gain.linearRampToValueAtTime(6, now + 2.3);
    vib.connect(vibGain);
    vibGain.connect(fund.frequency);
    vib.start(now);
    vib.stop(now + 2.5);

    // Formante 1 (garganta) — bandpass ~500Hz
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.setValueAtTime(400, now);
    f1.frequency.linearRampToValueAtTime(600, now + 0.8);
    f1.frequency.linearRampToValueAtTime(500, now + 2.0);
    f1.Q.value = 4;

    // Formante 2 (boca aberta) — bandpass ~1200Hz
    const f2 = ctx.createBiquadFilter();
    f2.type = "peaking";
    f2.frequency.setValueAtTime(1000, now);
    f2.frequency.linearRampToValueAtTime(1400, now + 1.0);
    f2.frequency.linearRampToValueAtTime(1000, now + 2.0);
    f2.gain.value = 8;
    f2.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.10, now + 0.3);
    gain.gain.setValueAtTime(0.10, now + 0.8);
    gain.gain.setValueAtTime(0.12, now + 1.0);
    gain.gain.setValueAtTime(0.12, now + 1.6);
    gain.gain.linearRampToValueAtTime(0.06, now + 2.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    fund.connect(f1);
    f1.connect(f2);
    f2.connect(gain);
    gain.connect(out);
    fund.start(now);
    fund.stop(now + 2.5);

    // Breath — sopro nasal leve
    const breath = createWhiteNoise(ctx, 2.0);
    const breathBpf = ctx.createBiquadFilter();
    breathBpf.type = "bandpass";
    breathBpf.frequency.setValueAtTime(800, now);
    breathBpf.frequency.linearRampToValueAtTime(1200, now + 1.0);
    breathBpf.frequency.linearRampToValueAtTime(600, now + 2.0);
    breathBpf.Q.value = 3;
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0, now);
    breathGain.gain.linearRampToValueAtTime(0.03, now + 0.4);
    breathGain.gain.setValueAtTime(0.03, now + 1.5);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    breath.connect(breathBpf);
    breathBpf.connect(breathGain);
    breathGain.connect(out);
  },

  /** 💀 Grito — voz aterrorizante com formantes vocais "AAH" */
  sbScream() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Fonte glótica — sawtooth (rica em harmônicos como voz)
    const glottal = ctx.createOscillator();
    glottal.type = "sawtooth";
    glottal.frequency.setValueAtTime(220, now);
    glottal.frequency.linearRampToValueAtTime(380, now + 0.15);
    glottal.frequency.setValueAtTime(380, now + 0.6);
    glottal.frequency.linearRampToValueAtTime(300, now + 1.0);
    glottal.frequency.linearRampToValueAtTime(180, now + 1.3);

    // Formante F1 (vogal "a" aberta ~800Hz)
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.value = 800;
    f1.Q.value = 5;

    // Formante F2 (vogal "a" ~1200Hz)
    const f2 = ctx.createBiquadFilter();
    f2.type = "peaking";
    f2.frequency.value = 1200;
    f2.gain.value = 10;
    f2.Q.value = 4;

    // Formante F3 (presença ~2500Hz)
    const f3 = ctx.createBiquadFilter();
    f3.type = "peaking";
    f3.frequency.value = 2500;
    f3.gain.value = 5;
    f3.Q.value = 3;

    // Jitter de pitch (instabilidade vocal)
    const jitter = ctx.createOscillator();
    jitter.frequency.value = 25;
    const jitterGain = ctx.createGain();
    jitterGain.gain.value = 5;
    jitter.connect(jitterGain);
    jitterGain.connect(glottal.frequency);
    jitter.start(now);
    jitter.stop(now + 1.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.setValueAtTime(0.12, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    glottal.connect(f1);
    f1.connect(f2);
    f2.connect(f3);
    f3.connect(gain);
    gain.connect(out);
    glottal.start(now);
    glottal.stop(now + 1.5);

    // Breath — ar aspirado
    const breath = createWhiteNoise(ctx, 1.0);
    const breathBpf = ctx.createBiquadFilter();
    breathBpf.type = "bandpass";
    breathBpf.frequency.value = 2000;
    breathBpf.Q.value = 1;
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.05, now + 0.05);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    breath.connect(breathBpf);
    breathBpf.connect(breathGain);
    breathGain.connect(out);
  },

  /** 🔔 Sino de igreja — fundamental grave + partiais inarmônicos */
  sbBell() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Sino real: parciais inarmônicos (ratios típicos de sino)
    const fundamental = 440;
    const partials = [
      { ratio: 1.0, amp: 0.12, decay: 3.0 },   // fundamental
      { ratio: 2.0, amp: 0.06, decay: 2.0 },    // oitava
      { ratio: 2.4, amp: 0.04, decay: 1.5 },    // terça menor (inarmônico)
      { ratio: 3.0, amp: 0.03, decay: 1.2 },    // quinta
      { ratio: 4.2, amp: 0.02, decay: 0.8 },    // parcial de sino
      { ratio: 5.4, amp: 0.015, decay: 0.6 },   // timbre metálico
    ];

    partials.forEach(({ ratio, amp, decay }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = fundamental * ratio;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });

    // Transiente de ataque (martelo no metal)
    const attack = createWhiteNoise(ctx, 0.015);
    const attackHpf = ctx.createBiquadFilter();
    attackHpf.type = "highpass";
    attackHpf.frequency.value = 6000;
    const attackGain = ctx.createGain();
    attackGain.gain.setValueAtTime(0.12, now);
    attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    attack.connect(attackHpf);
    attackHpf.connect(attackGain);
    attackGain.connect(out);
  },

  /** 🔥 Fogo — crepitar irregular com estalos e woosh */
  sbFire() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Base: ruído filtrado (ar quente)
    const noise = createWhiteNoise(ctx, 2.0);
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 2000;
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = 600;
    bpf.Q.value = 0.7;

    // AM tremolo irregular (chamas)
    const tremolo = ctx.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.value = 8;
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.03;
    tremolo.connect(tremoloGain);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    noiseGain.gain.setValueAtTime(0.08, now + 1.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    tremoloGain.connect(noiseGain.gain);

    noise.connect(lpf);
    lpf.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(out);
    tremolo.start(now);
    tremolo.stop(now + 2.0);

    // Estalos aleatórios (lenha quebrando) — mais intensos
    for (let i = 0; i < 12; i++) {
      const t = now + 0.1 + Math.random() * 1.6;
      const pop = createWhiteNoise(ctx, 0.015);
      const popBpf = ctx.createBiquadFilter();
      popBpf.type = "bandpass";
      popBpf.frequency.value = 1500 + Math.random() * 3000;
      popBpf.Q.value = 8;
      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.06 + Math.random() * 0.06, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
      pop.connect(popBpf);
      popBpf.connect(popGain);
      popGain.connect(out);
    }

    // Woosh baixo (labaredas)
    const woosh = createWhiteNoise(ctx, 0.5);
    const wooshLpf = ctx.createBiquadFilter();
    wooshLpf.type = "lowpass";
    wooshLpf.frequency.setValueAtTime(200, now + 0.5);
    wooshLpf.frequency.linearRampToValueAtTime(600, now + 0.8);
    wooshLpf.frequency.linearRampToValueAtTime(200, now + 1.0);
    const wooshGain = ctx.createGain();
    wooshGain.gain.setValueAtTime(0, now + 0.5);
    wooshGain.gain.linearRampToValueAtTime(0.06, now + 0.7);
    wooshGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    woosh.connect(wooshLpf);
    wooshLpf.connect(wooshGain);
    wooshGain.connect(out);
  },

  /** 💧 Água — splash + ondas suaves com gotas */
  sbWater() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Splash inicial
    const splash = createWhiteNoise(ctx, 0.3);
    const splashBpf = ctx.createBiquadFilter();
    splashBpf.type = "bandpass";
    splashBpf.frequency.setValueAtTime(3000, now);
    splashBpf.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    splashBpf.Q.value = 1;
    const splashGain = ctx.createGain();
    splashGain.gain.setValueAtTime(0.10, now);
    splashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    splash.connect(splashBpf);
    splashBpf.connect(splashGain);
    splashGain.connect(out);

    // Ondas contínuas
    const waves = createWhiteNoise(ctx, 2.0);
    const wavesLpf = ctx.createBiquadFilter();
    wavesLpf.type = "lowpass";
    wavesLpf.frequency.value = 500;
    // Ondulação do filtro (ondas)
    const waveLfo = ctx.createOscillator();
    waveLfo.frequency.value = 0.8;
    const waveLfoGain = ctx.createGain();
    waveLfoGain.gain.value = 250;
    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(wavesLpf.frequency);
    waveLfo.start(now);
    waveLfo.stop(now + 2.0);

    const wavesGain = ctx.createGain();
    wavesGain.gain.setValueAtTime(0, now + 0.1);
    wavesGain.gain.linearRampToValueAtTime(0.06, now + 0.4);
    wavesGain.gain.setValueAtTime(0.06, now + 1.2);
    wavesGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    waves.connect(wavesLpf);
    wavesLpf.connect(wavesGain);
    wavesGain.connect(out);

    // Gotas individuais (ping agudo)
    const dropTimes = [0.6, 0.9, 1.15, 1.5, 1.7];
    dropTimes.forEach((dt) => {
      const t = now + dt;
      const freq = 1800 + Math.random() * 1500;
      const drip = ctx.createOscillator();
      drip.type = "sine";
      drip.frequency.setValueAtTime(freq, t);
      drip.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.06);
      const dripGain = ctx.createGain();
      dripGain.gain.setValueAtTime(0.04, t);
      dripGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      drip.connect(dripGain);
      dripGain.connect(out);
      drip.start(t);
      drip.stop(t + 0.1);
    });
  },

  /** 👻 Fantasma — gemido etéreo com eco e dissonância */
  sbGhost() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Tom 1 — gemido principal ascendente
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.linearRampToValueAtTime(350, now + 0.6);
    osc1.frequency.linearRampToValueAtTime(280, now + 1.5);
    osc1.frequency.linearRampToValueAtTime(220, now + 2.0);

    // Tom 2 — dissonante (um semitom acima, cria unease)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(212, now); // ~semitom
    osc2.frequency.linearRampToValueAtTime(370, now + 0.6);
    osc2.frequency.linearRampToValueAtTime(297, now + 1.5);
    osc2.frequency.linearRampToValueAtTime(233, now + 2.0);

    // Vibrato largo e lento (espectral)
    const vib = ctx.createOscillator();
    vib.frequency.value = 2;
    const vibGain = ctx.createGain();
    vibGain.gain.value = 20;
    vib.connect(vibGain);
    vibGain.connect(osc1.frequency);
    vibGain.connect(osc2.frequency);
    vib.start(now);
    vib.stop(now + 2.2);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.06, now + 0.4);
    gain1.gain.setValueAtTime(0.06, now + 1.2);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.04, now + 0.5);
    gain2.gain.setValueAtTime(0.04, now + 1.0);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc1.connect(gain1);
    gain1.connect(out);
    osc2.connect(gain2);
    gain2.connect(out);
    osc1.start(now);
    osc1.stop(now + 2.2);
    osc2.start(now + 0.1);
    osc2.stop(now + 2.0);

    // Sopro fantasmagórico (vento gelado)
    const wind = createWhiteNoise(ctx, 2.0);
    const windBpf = ctx.createBiquadFilter();
    windBpf.type = "bandpass";
    windBpf.frequency.setValueAtTime(500, now);
    windBpf.frequency.linearRampToValueAtTime(1200, now + 0.8);
    windBpf.frequency.linearRampToValueAtTime(400, now + 1.8);
    windBpf.Q.value = 8;
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0, now);
    windGain.gain.linearRampToValueAtTime(0.035, now + 0.5);
    windGain.gain.setValueAtTime(0.035, now + 1.2);
    windGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    wind.connect(windBpf);
    windBpf.connect(windGain);
    windGain.connect(out);
  },

  /** 😈 Risada maligna — sílabas "ha" com formante vocal */
  sbLaugh() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Sílabas "HA HA HA HA HA" descendentes
    const syllables = [
      { freq: 180, t: 0, dur: 0.14 },
      { freq: 170, t: 0.20, dur: 0.12 },
      { freq: 155, t: 0.38, dur: 0.12 },
      { freq: 140, t: 0.54, dur: 0.14 },
      { freq: 125, t: 0.72, dur: 0.16 },
      { freq: 110, t: 0.92, dur: 0.18 },
    ];

    syllables.forEach(({ freq, t, dur }) => {
      // Glote — sawtooth (voz)
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + t);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, now + t + dur);

      // Formante "A" — boca aberta
      const f1 = ctx.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.value = 700;
      f1.Q.value = 4;

      const f2 = ctx.createBiquadFilter();
      f2.type = "peaking";
      f2.frequency.value = 1100;
      f2.gain.value = 6;
      f2.Q.value = 3;

      // Envelope — cada sílaba sobe e desce
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.07, now + t + 0.02);
      gain.gain.setValueAtTime(0.07, now + t + dur * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      osc.connect(f1);
      f1.connect(f2);
      f2.connect(gain);
      gain.connect(out);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.02);
    });
  },

  /** 📯 Trombeta/Corneta medieval — fanfarra 3 notas */
  sbHorn() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // 3 notas: D4 → G4 → D5 (fanfarra)
    const notes = [
      { freq: 294, start: 0, dur: 0.35 },      // D4
      { freq: 392, start: 0.35, dur: 0.35 },    // G4
      { freq: 587, start: 0.70, dur: 0.55 },    // D5 (sustentada)
    ];

    notes.forEach(({ freq, start, dur }) => {
      // Sawtooth + 2 harmônicos = timbre brass
      [1, 2, 3].forEach((harm, hi) => {
        const osc = ctx.createOscillator();
        osc.type = hi === 0 ? "sawtooth" : "sine";
        osc.frequency.value = freq * harm;

        // Formantes brass (~1500Hz e ~3000Hz)
        const brass1 = ctx.createBiquadFilter();
        brass1.type = "peaking";
        brass1.frequency.value = 1500;
        brass1.gain.value = hi === 0 ? 4 : -2;
        brass1.Q.value = 2;

        const brass2 = ctx.createBiquadFilter();
        brass2.type = "peaking";
        brass2.frequency.value = 3000;
        brass2.gain.value = hi === 0 ? 2 : -4;
        brass2.Q.value = 2;

        const amp = [0.08, 0.03, 0.015][hi];
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(amp, now + start + 0.04);
        gain.gain.setValueAtTime(amp, now + start + dur - 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc.connect(brass1);
        brass1.connect(brass2);
        brass2.connect(gain);
        gain.connect(out);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    });
  },

  /** ⚔ Espadas colidindo — 3 impactos metálicos rápidos */
  sbSwords() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // 3 golpes rápidos com pitch diferente
    const strikes = [
      { t: 0, freq: 2200, res: 3500 },
      { t: 0.12, freq: 1800, res: 3000 },
      { t: 0.28, freq: 2500, res: 4000 },
    ];

    strikes.forEach(({ t, freq, res }) => {
      const offset = now + t;

      // Clang metálico — frequência alta descendo
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, offset);
      osc.frequency.exponentialRampToValueAtTime(400, offset + 0.12);

      // Ressonância metálica
      const ring = ctx.createBiquadFilter();
      ring.type = "bandpass";
      ring.frequency.value = res;
      ring.Q.value = 15; // Q alto = mais metálico

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.10, offset);
      gain.gain.exponentialRampToValueAtTime(0.001, offset + 0.2);

      osc.connect(ring);
      ring.connect(gain);
      gain.connect(out);
      osc.start(offset);
      osc.stop(offset + 0.25);

      // Faísca — ruído curto agudo
      const spark = createWhiteNoise(ctx, 0.02);
      const sparkHpf = ctx.createBiquadFilter();
      sparkHpf.type = "highpass";
      sparkHpf.frequency.value = 5000;
      const sparkGain = ctx.createGain();
      sparkGain.gain.setValueAtTime(0.10, offset);
      sparkGain.gain.exponentialRampToValueAtTime(0.001, offset + 0.02);
      spark.connect(sparkHpf);
      sparkHpf.connect(sparkGain);
      sparkGain.connect(out);
    });
  },

  /** 🗡 Impacto — pancada grave + crunch */
  sbHit() {
    const ctx = audioEngine.context;
    const now = ctx.currentTime;
    const out = audioEngine.sfxOutput;

    // Sub-bass impact
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(100, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.20, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    sub.connect(subGain);
    subGain.connect(out);
    sub.start(now);
    sub.stop(now + 0.25);

    // Mid punch
    const mid = ctx.createOscillator();
    mid.type = "triangle";
    mid.frequency.setValueAtTime(250, now);
    mid.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.12, now);
    midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    mid.connect(midGain);
    midGain.connect(out);
    mid.start(now);
    mid.stop(now + 0.12);

    // Crunch (ruído filtrado)
    const crunch = createWhiteNoise(ctx, 0.08);
    const crunchBpf = ctx.createBiquadFilter();
    crunchBpf.type = "bandpass";
    crunchBpf.frequency.value = 1500;
    crunchBpf.Q.value = 2;
    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(0.12, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    crunch.connect(crunchBpf);
    crunchBpf.connect(crunchGain);
    crunchGain.connect(out);
  },
};

export type SFXName = keyof typeof SFX;
