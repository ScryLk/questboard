import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioEngine } from "./audio/audio-engine";
import { ambiencePlayer } from "./audio/ambience-player";
import { musicPlayer } from "./audio/music-player";
import type { MusicTrack } from "./audio/music-player";

// ── Soundboard effect ──

export interface SoundboardEffect {
  id: string;
  name: string;
  icon: string;
  url: string; // audio file URL or data URI
  category: string;
}

export const DEFAULT_SOUNDBOARD: SoundboardEffect[] = [
  { id: "sb-thunder", name: "Trovão", icon: "Zap", url: "", category: "weather" },
  { id: "sb-door", name: "Porta", icon: "DoorOpen", url: "", category: "map" },
  { id: "sb-scream", name: "Grito", icon: "Skull", url: "", category: "creature" },
  { id: "sb-wolf", name: "Lobo", icon: "Dog", url: "", category: "creature" },
  { id: "sb-bell", name: "Sino", icon: "Bell", url: "", category: "map" },
  { id: "sb-swords", name: "Espadas", icon: "Swords", url: "", category: "combat" },
  { id: "sb-fire", name: "Fogo", icon: "Flame", url: "", category: "weather" },
  { id: "sb-water", name: "Água", icon: "Droplets", url: "", category: "weather" },
  { id: "sb-ghost", name: "Fantasma", icon: "Ghost", url: "", category: "creature" },
  { id: "sb-laugh", name: "Risada", icon: "Laugh", url: "", category: "creature" },
  { id: "sb-horn", name: "Trombeta", icon: "Megaphone", url: "", category: "map" },
  { id: "sb-coin", name: "Moeda", icon: "Coins", url: "", category: "map" },
  { id: "sb-magic", name: "Magia", icon: "Wand2", url: "", category: "combat" },
  { id: "sb-arrow", name: "Flecha", icon: "Target", url: "", category: "combat" },
  { id: "sb-explosion", name: "Explosão", icon: "Bomb", url: "", category: "combat" },
  { id: "sb-hit", name: "Impacto", icon: "Sword", url: "", category: "combat" },
];

// ── Store ──

interface AudioState {
  // Global
  muteAll: boolean;
  masterVolume: number;
  setMuteAll: (mute: boolean) => void;
  setMasterVolume: (vol: number) => void;

  // SFX
  sfxEnabled: boolean;
  sfxVolume: number;
  setSfxEnabled: (enabled: boolean) => void;
  setSfxVolume: (vol: number) => void;

  // Ambience
  ambientEnabled: boolean;
  ambientVolume: number;
  activeAmbienceId: string | null;
  setAmbientEnabled: (enabled: boolean) => void;
  setAmbientVolume: (vol: number) => void;
  setActiveAmbience: (id: string | null) => void;

  // Music
  musicEnabled: boolean;
  musicVolume: number;
  musicQueue: MusicTrack[];
  musicPlaying: boolean;
  musicCurrentIndex: number;
  musicLoop: boolean;
  musicCurrentTime: number;
  musicDuration: number;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (vol: number) => void;
  setMusicQueue: (tracks: MusicTrack[]) => void;
  addMusicTrack: (track: MusicTrack) => void;
  removeMusicTrack: (index: number) => void;
  setMusicPlaying: (playing: boolean) => void;
  setMusicCurrentIndex: (index: number) => void;
  setMusicLoop: (loop: boolean) => void;
  setMusicTime: (current: number, duration: number) => void;

  // Soundboard
  soundboardEffects: SoundboardEffect[];
  addSoundboardEffect: (effect: SoundboardEffect) => void;
  removeSoundboardEffect: (id: string) => void;
  updateSoundboardEffect: (id: string, updates: Partial<SoundboardEffect>) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Global
      muteAll: false,
      masterVolume: 1,
      setMuteAll: (mute) => {
        set({ muteAll: mute });
        audioEngine.setMasterVolume(mute ? 0 : get().masterVolume);
      },
      setMasterVolume: (vol) => {
        set({ masterVolume: vol });
        if (!get().muteAll) audioEngine.setMasterVolume(vol);
      },

      // SFX
      sfxEnabled: true,
      sfxVolume: 0.7,
      setSfxEnabled: (enabled) => set({ sfxEnabled: enabled }),
      setSfxVolume: (vol) => {
        set({ sfxVolume: vol });
        audioEngine.setSFXVolume(vol);
      },

      // Ambience
      ambientEnabled: true,
      ambientVolume: 0.4,
      activeAmbienceId: null,
      setAmbientEnabled: (enabled) => {
        set({ ambientEnabled: enabled });
        if (!enabled) ambiencePlayer.stop();
      },
      setAmbientVolume: (vol) => {
        set({ ambientVolume: vol });
        audioEngine.setAmbientVolume(vol);
        ambiencePlayer.setVolume(vol);
      },
      setActiveAmbience: (id) => {
        set({ activeAmbienceId: id });
        if (!id) ambiencePlayer.stop();
      },

      // Music
      musicEnabled: true,
      musicVolume: 0.5,
      musicQueue: [],
      musicPlaying: false,
      musicCurrentIndex: -1,
      musicLoop: false,
      musicCurrentTime: 0,
      musicDuration: 0,
      setMusicEnabled: (enabled) => {
        set({ musicEnabled: enabled });
        if (!enabled) musicPlayer.stop();
      },
      setMusicVolume: (vol) => {
        set({ musicVolume: vol });
        audioEngine.setMusicVolume(vol);
        musicPlayer.setVolume(vol);
      },
      setMusicQueue: (tracks) => {
        set({ musicQueue: tracks, musicCurrentIndex: tracks.length > 0 ? 0 : -1 });
        musicPlayer.setQueue(tracks);
      },
      addMusicTrack: (track) => {
        set((s) => ({ musicQueue: [...s.musicQueue, track] }));
        musicPlayer.addToQueue(track);
      },
      removeMusicTrack: (index) => {
        set((s) => {
          const q = [...s.musicQueue];
          q.splice(index, 1);
          return { musicQueue: q };
        });
        musicPlayer.removeFromQueue(index);
      },
      setMusicPlaying: (playing) => set({ musicPlaying: playing }),
      setMusicCurrentIndex: (index) => set({ musicCurrentIndex: index }),
      setMusicLoop: (loop) => {
        set({ musicLoop: loop });
        musicPlayer.setLoop(loop);
      },
      setMusicTime: (current, duration) => set({ musicCurrentTime: current, musicDuration: duration }),

      // Soundboard
      soundboardEffects: DEFAULT_SOUNDBOARD,
      addSoundboardEffect: (effect) => {
        set((s) => ({ soundboardEffects: [...s.soundboardEffects, effect] }));
      },
      removeSoundboardEffect: (id) => {
        set((s) => ({ soundboardEffects: s.soundboardEffects.filter((e) => e.id !== id) }));
      },
      updateSoundboardEffect: (id, updates) => {
        set((s) => ({
          soundboardEffects: s.soundboardEffects.map((e) =>
            e.id === id ? { ...e, ...updates } : e,
          ),
        }));
      },
    }),
    {
      name: "questboard-audio",
      version: 1,
      partialize: (state) => ({
        muteAll: state.muteAll,
        masterVolume: state.masterVolume,
        sfxEnabled: state.sfxEnabled,
        sfxVolume: state.sfxVolume,
        ambientEnabled: state.ambientEnabled,
        ambientVolume: state.ambientVolume,
        musicEnabled: state.musicEnabled,
        musicVolume: state.musicVolume,
        musicLoop: state.musicLoop,
        soundboardEffects: state.soundboardEffects,
      }),
    },
  ),
);
