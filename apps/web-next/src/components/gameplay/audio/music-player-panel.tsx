"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Plus,
  Trash2,
  Music,
} from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { musicPlayer } from "@/lib/audio/music-player";
import type { MusicTrack } from "@/lib/audio/music-player";
import { VolumeSlider } from "./volume-slider";

export function MusicPlayerPanel() {
  const musicEnabled = useAudioStore((s) => s.musicEnabled);
  const musicVolume = useAudioStore((s) => s.musicVolume);
  const musicQueue = useAudioStore((s) => s.musicQueue);
  const musicPlaying = useAudioStore((s) => s.musicPlaying);
  const musicCurrentIndex = useAudioStore((s) => s.musicCurrentIndex);
  const musicLoop = useAudioStore((s) => s.musicLoop);
  const musicCurrentTime = useAudioStore((s) => s.musicCurrentTime);
  const musicDuration = useAudioStore((s) => s.musicDuration);

  const setMusicEnabled = useAudioStore((s) => s.setMusicEnabled);
  const setMusicVolume = useAudioStore((s) => s.setMusicVolume);
  const addMusicTrack = useAudioStore((s) => s.addMusicTrack);
  const removeMusicTrack = useAudioStore((s) => s.removeMusicTrack);
  const setMusicPlaying = useAudioStore((s) => s.setMusicPlaying);
  const setMusicCurrentIndex = useAudioStore((s) => s.setMusicCurrentIndex);
  const setMusicLoop = useAudioStore((s) => s.setMusicLoop);
  const setMusicTime = useAudioStore((s) => s.setMusicTime);

  // Set up time update callback
  musicPlayer.onTimeUpdate = (current, duration) => {
    setMusicTime(current, duration);
  };

  const currentTrack = musicCurrentIndex >= 0 ? musicQueue[musicCurrentIndex] : null;

  function handlePlayPause() {
    if (musicPlaying) {
      musicPlayer.pause();
      setMusicPlaying(false);
    } else if (currentTrack) {
      musicPlayer.play(musicCurrentIndex);
      setMusicPlaying(true);
    }
  }

  function handleNext() {
    musicPlayer.next();
    setMusicCurrentIndex(musicPlayer.currentIndex);
    setMusicPlaying(true);
  }

  function handlePrev() {
    musicPlayer.prev();
    setMusicCurrentIndex(musicPlayer.currentIndex);
    setMusicPlaying(true);
  }

  function handleAddMusic() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        const track: MusicTrack = {
          id: `music_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          url,
        };
        addMusicTrack(track);
      });
    };
    input.click();
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-2">
      <VolumeSlider
        label="Música"
        value={musicVolume}
        onChange={setMusicVolume}
        muted={!musicEnabled}
        onToggleMute={() => setMusicEnabled(!musicEnabled)}
      />

      {musicEnabled && (
        <>
          {/* Now playing */}
          {currentTrack ? (
            <div className="rounded-md bg-white/[0.03] p-1.5">
              <div className="flex items-center gap-1.5">
                <Music className="h-3 w-3 text-brand-accent" />
                <span className="flex-1 truncate text-[10px] text-brand-text">
                  {currentTrack.name}
                </span>
                <span className="text-[8px] tabular-nums text-brand-muted">
                  {formatTime(musicCurrentTime)}/{formatTime(musicDuration)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="mt-1 h-1 cursor-pointer rounded-full bg-white/10"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  musicPlayer.seek(pct * musicDuration);
                }}
              >
                <div
                  className="h-full rounded-full bg-brand-accent transition-all"
                  style={{ width: `${musicDuration > 0 ? (musicCurrentTime / musicDuration) * 100 : 0}%` }}
                />
              </div>

              {/* Controls */}
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <button
                  onClick={handlePrev}
                  className="text-brand-muted hover:text-brand-text"
                >
                  <SkipBack className="h-3 w-3" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30"
                >
                  {musicPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
                <button
                  onClick={handleNext}
                  className="text-brand-muted hover:text-brand-text"
                >
                  <SkipForward className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setMusicLoop(!musicLoop)}
                  className={`${musicLoop ? "text-brand-accent" : "text-brand-muted/40"} hover:text-brand-text`}
                >
                  <Repeat className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-[9px] text-brand-muted">Nenhuma música na fila.</p>
          )}

          {/* Queue */}
          {musicQueue.length > 0 && (
            <div className="max-h-[80px] space-y-0.5 overflow-y-auto">
              {musicQueue.map((track, i) => (
                <div
                  key={track.id}
                  className={`group flex items-center gap-1 rounded px-1 py-0.5 text-[9px] ${
                    i === musicCurrentIndex
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-brand-text hover:bg-white/[0.03]"
                  }`}
                >
                  <button
                    onClick={() => {
                      musicPlayer.play(i);
                      setMusicCurrentIndex(i);
                      setMusicPlaying(true);
                    }}
                    className="flex-1 truncate text-left"
                  >
                    {i + 1}. {track.name}
                  </button>
                  <button
                    onClick={() => removeMusicTrack(i)}
                    className="text-brand-muted/30 opacity-0 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add music */}
          <button
            onClick={handleAddMusic}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-brand-border py-1 text-[9px] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
          >
            <Plus className="h-3 w-3" />
            Adicionar música
          </button>
        </>
      )}
    </div>
  );
}
