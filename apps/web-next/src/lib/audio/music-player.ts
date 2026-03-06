// ── Music Player ──
// Plays background music tracks with queue, skip, and loop support.

import { audioEngine } from "./audio-engine";

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private _queue: MusicTrack[] = [];
  private _currentIndex = -1;
  private _loop = false;
  private _onTimeUpdate: ((current: number, duration: number) => void) | null = null;
  private _onTrackEnd: (() => void) | null = null;

  get queue() {
    return this._queue;
  }

  get currentTrack(): MusicTrack | null {
    return this._currentIndex >= 0 ? this._queue[this._currentIndex] ?? null : null;
  }

  get currentIndex() {
    return this._currentIndex;
  }

  get isPlaying() {
    return this.audio !== null && !this.audio.paused;
  }

  get loop() {
    return this._loop;
  }

  get currentTime() {
    return this.audio?.currentTime ?? 0;
  }

  get duration() {
    return this.audio?.duration ?? 0;
  }

  set onTimeUpdate(cb: ((current: number, duration: number) => void) | null) {
    this._onTimeUpdate = cb;
  }

  set onTrackEnd(cb: (() => void) | null) {
    this._onTrackEnd = cb;
  }

  setQueue(tracks: MusicTrack[]) {
    this._queue = tracks;
    this._currentIndex = tracks.length > 0 ? 0 : -1;
  }

  addToQueue(track: MusicTrack) {
    this._queue.push(track);
    if (this._currentIndex < 0) this._currentIndex = 0;
  }

  removeFromQueue(index: number) {
    if (index === this._currentIndex && this.isPlaying) {
      this.stop();
    }
    this._queue.splice(index, 1);
    if (this._currentIndex >= this._queue.length) {
      this._currentIndex = this._queue.length - 1;
    }
  }

  setLoop(loop: boolean) {
    this._loop = loop;
  }

  async play(index?: number) {
    if (index !== undefined) {
      this._currentIndex = index;
    }

    const track = this.currentTrack;
    if (!track) return;

    await audioEngine.init();

    // Stop current
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener("timeupdate", this.handleTimeUpdate);
      this.audio.removeEventListener("ended", this.handleEnded);
    }

    this.audio = new Audio(track.url);
    this.audio.volume = audioEngine.getMusicVolume();
    this.audio.addEventListener("timeupdate", this.handleTimeUpdate);
    this.audio.addEventListener("ended", this.handleEnded);

    try {
      await this.audio.play();
    } catch {
      // Blocked by browser
    }
  }

  pause() {
    this.audio?.pause();
  }

  resume() {
    this.audio?.play();
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.removeEventListener("timeupdate", this.handleTimeUpdate);
      this.audio.removeEventListener("ended", this.handleEnded);
      this.audio = null;
    }
  }

  next() {
    if (this._queue.length === 0) return;
    this._currentIndex = (this._currentIndex + 1) % this._queue.length;
    this.play();
  }

  prev() {
    if (this._queue.length === 0) return;
    this._currentIndex = this._currentIndex <= 0 ? this._queue.length - 1 : this._currentIndex - 1;
    this.play();
  }

  seek(time: number) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }

  private handleTimeUpdate = () => {
    if (this.audio && this._onTimeUpdate) {
      this._onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
    }
  };

  private handleEnded = () => {
    if (this._loop) {
      this.play();
    } else if (this._currentIndex < this._queue.length - 1) {
      this.next();
    }
    this._onTrackEnd?.();
  };
}

export const musicPlayer = new MusicPlayer();
