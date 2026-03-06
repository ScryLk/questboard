// ── Audio Engine ──
// Central AudioContext + mixer with 3 output channels: SFX, Ambient, Music
// Initialized lazily on first user interaction (browser autoplay policy)

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private _initialized = false;

  async init() {
    if (this._initialized && this.ctx?.state === "running") return;

    if (!this.ctx) {
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
    }

    // Resume if suspended (browser policy)
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this._initialized = true;
  }

  get initialized() {
    return this._initialized;
  }

  get context(): AudioContext {
    if (!this.ctx) throw new Error("AudioEngine not initialized. Call init() first.");
    return this.ctx;
  }

  get sfxOutput(): GainNode {
    if (!this.sfxGain) throw new Error("AudioEngine not initialized.");
    return this.sfxGain;
  }

  get ambientOutput(): GainNode {
    if (!this.ambientGain) throw new Error("AudioEngine not initialized.");
    return this.ambientGain;
  }

  get musicOutput(): GainNode {
    if (!this.musicGain) throw new Error("AudioEngine not initialized.");
    return this.musicGain;
  }

  setMasterVolume(vol: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  setSFXVolume(vol: number) {
    if (this.sfxGain) this.sfxGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain) this.ambientGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  setMusicVolume(vol: number) {
    if (this.musicGain) this.musicGain.gain.value = Math.max(0, Math.min(1, vol));
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 1;
  }

  getSFXVolume(): number {
    return this.sfxGain?.gain.value ?? 1;
  }

  getAmbientVolume(): number {
    return this.ambientGain?.gain.value ?? 0.5;
  }

  getMusicVolume(): number {
    return this.musicGain?.gain.value ?? 0.7;
  }
}

export const audioEngine = new AudioEngine();

// ── White noise utility ──

export function createWhiteNoise(ctx: AudioContext, duration: number): AudioBufferSourceNode {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.start();
  return source;
}
