let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/**
 * Play a short metallic "sword clash" alert sound for Opportunity Attacks.
 * Uses Web Audio API — no audio files needed.
 * @param volume 0–1 (already combined master * effects / 10000)
 */
export function playOAAlertSound(volume: number): void {
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    gain.connect(ctx.destination);

    // Highpass filter for metallic timbre
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 600;
    filter.connect(gain);

    // Primary oscillator: square wave A5 → A4
    const osc1 = ctx.createOscillator();
    osc1.type = "square";
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc1.connect(filter);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Secondary harmonic: triangle wave for brightness
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(volume * 0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    gain2.connect(ctx.destination);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = "highpass";
    filter2.frequency.value = 800;
    filter2.connect(gain2);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1320, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 0.08);
    osc2.connect(filter2);
    osc2.start(now);
    osc2.stop(now + 0.1);
  } catch {
    // Web Audio API not available — silently ignore
  }
}
