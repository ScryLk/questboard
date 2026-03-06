"use client";

import { Play, Square } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { BUNDLED_AMBIENCES, AMBIENCE_CATEGORIES } from "@/lib/audio/ambience-data";
import { ambiencePlayer } from "@/lib/audio/ambience-player";
import { VolumeSlider } from "./volume-slider";

export function AmbienceSelector() {
  const ambientEnabled = useAudioStore((s) => s.ambientEnabled);
  const ambientVolume = useAudioStore((s) => s.ambientVolume);
  const activeAmbienceId = useAudioStore((s) => s.activeAmbienceId);
  const setAmbientEnabled = useAudioStore((s) => s.setAmbientEnabled);
  const setAmbientVolume = useAudioStore((s) => s.setAmbientVolume);
  const setActiveAmbience = useAudioStore((s) => s.setActiveAmbience);

  function handlePlay(id: string, file: string) {
    if (activeAmbienceId === id && ambiencePlayer.isPlaying) {
      ambiencePlayer.stop();
      setActiveAmbience(null);
    } else {
      ambiencePlayer.play(id, file);
      setActiveAmbience(id);
    }
  }

  return (
    <div className="space-y-2">
      <VolumeSlider
        label="Ambiente"
        value={ambientVolume}
        onChange={setAmbientVolume}
        muted={!ambientEnabled}
        onToggleMute={() => setAmbientEnabled(!ambientEnabled)}
      />

      {ambientEnabled && (
        <div className="space-y-1.5">
          {AMBIENCE_CATEGORIES.map((cat) => {
            const tracks = BUNDLED_AMBIENCES.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id}>
                <span className="text-[8px] font-semibold uppercase tracking-wider text-brand-muted">
                  {cat.icon} {cat.label}
                </span>
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {tracks.map((track) => {
                    const isActive = activeAmbienceId === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handlePlay(track.id, track.file)}
                        className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] transition-colors ${
                          isActive
                            ? "bg-brand-accent/20 text-brand-accent"
                            : "bg-white/[0.04] text-brand-muted hover:bg-white/[0.08] hover:text-brand-text"
                        }`}
                        title={track.name}
                      >
                        <span className="text-[10px]">{track.icon}</span>
                        <span>{track.name}</span>
                        {isActive && (
                          <span className="ml-0.5 animate-pulse text-[7px]">●</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
