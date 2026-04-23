"use client";

import {
  ChevronDown,
  ChevronRight,
  Headphones,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { useAudioStore } from "@/lib/audio-store";
import { VolumeSlider } from "./volume-slider";
import { AmbienceSelector } from "./ambience-selector";
import { MusicPlayerPanel } from "./music-player-panel";
import { SFXSettingsPanel } from "./sfx-settings-panel";

export function AudioPanel() {
  const collapsed = useGameplayStore((s) => s.collapsedSections["audio"]);
  const toggleSection = useGameplayStore((s) => s.toggleSection);

  const muteAll = useAudioStore((s) => s.muteAll);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const setMuteAll = useAudioStore((s) => s.setMuteAll);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);

  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const sfxVolume = useAudioStore((s) => s.sfxVolume);
  const setSfxEnabled = useAudioStore((s) => s.setSfxEnabled);
  const setSfxVolume = useAudioStore((s) => s.setSfxVolume);

  return (
    <div className="border-b border-brand-border">
      {/* Header */}
      <div className="flex items-center transition-colors hover:bg-white/[0.02]">
        <button
          onClick={() => toggleSection("audio")}
          className="flex flex-1 items-center gap-2 px-3 py-2 text-left"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-brand-muted" />
          )}
          <Headphones className="h-3.5 w-3.5 text-brand-accent" />
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            Áudio
          </span>
        </button>
        <GameTooltip label={muteAll ? "Ativar Som" : "Silenciar Tudo"} side="bottom">
          <button
            onClick={() => setMuteAll(!muteAll)}
            className={`mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-colors ${
              muteAll
                ? "text-red-400 hover:bg-red-400/10 hover:text-red-300"
                : "text-brand-muted hover:bg-white/10 hover:text-brand-text"
            }`}
          >
            {muteAll ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>
        </GameTooltip>
      </div>

      {!collapsed && (
        <div className="space-y-3 px-3 pb-3">
          {/* Master volume */}
          <VolumeSlider
            label="Master"
            value={masterVolume}
            onChange={setMasterVolume}
            muted={muteAll}
            onToggleMute={() => setMuteAll(!muteAll)}
          />

          {/* SFX volume */}
          <VolumeSlider
            label="Efeitos"
            value={sfxVolume}
            onChange={setSfxVolume}
            muted={!sfxEnabled}
            onToggleMute={() => setSfxEnabled(!sfxEnabled)}
          />

          {/* SFX Settings — test, credits, cache */}
          <SFXSettingsPanel />

          {/* Divider */}
          <div className="border-t border-brand-border" />

          {/* Ambience */}
          <AmbienceSelector />

          {/* Divider */}
          <div className="border-t border-brand-border" />

          {/* Music */}
          <MusicPlayerPanel />
        </div>
      )}
    </div>
  );
}
