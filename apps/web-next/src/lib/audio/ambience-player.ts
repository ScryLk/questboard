// ── Ambience Player ──
// Plays ambient sounds in a loop with crossfade transitions.

import { audioEngine } from "./audio-engine";

class AmbiencePlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentId: string | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  get activeId() {
    return this.currentId;
  }

  get isPlaying() {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  async play(id: string, url: string, loop = true) {
    // If same track, just resume
    if (this.currentId === id && this.currentAudio) {
      if (this.currentAudio.paused) {
        await this.currentAudio.play();
      }
      return;
    }

    // Crossfade: fade out old, start new
    await this.stop(true);

    await audioEngine.init();

    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = 0;
    audio.crossOrigin = "anonymous";

    try {
      await audio.play();
    } catch {
      // Audio blocked by browser policy
      return;
    }

    this.currentAudio = audio;
    this.currentId = id;

    // Fade in
    this.fadeVolume(audio, 0, audioEngine.getAmbientVolume(), 1500);
  }

  async stop(fadeOut = true) {
    if (!this.currentAudio) return;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    if (fadeOut && !this.currentAudio.paused) {
      await this.fadeVolume(this.currentAudio, this.currentAudio.volume, 0, 800);
    }

    this.currentAudio.pause();
    this.currentAudio.src = "";
    this.currentAudio = null;
    this.currentId = null;
  }

  pause() {
    this.currentAudio?.pause();
  }

  resume() {
    this.currentAudio?.play();
  }

  setVolume(vol: number) {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  private fadeVolume(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.fadeInterval) clearInterval(this.fadeInterval);

      const steps = 30;
      const stepMs = durationMs / steps;
      const delta = (to - from) / steps;
      let current = from;
      let step = 0;

      this.fadeInterval = setInterval(() => {
        step++;
        current += delta;
        audio.volume = Math.max(0, Math.min(1, current));

        if (step >= steps) {
          if (this.fadeInterval) clearInterval(this.fadeInterval);
          this.fadeInterval = null;
          audio.volume = Math.max(0, Math.min(1, to));
          resolve();
        }
      }, stepMs);
    });
  }
}

export const ambiencePlayer = new AmbiencePlayer();
