"use client";

import {
  Plus, X, Edit2,
  Zap, DoorOpen, Skull, Dog, Bell, Swords, Flame, Droplets,
  Ghost, Laugh, Megaphone, Coins, Wand2, Target, Bomb, Sword, Music,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { useAudioStore } from "@/lib/audio-store";
import type { SoundboardEffect } from "@/lib/audio-store";
import { freesoundEngine } from "@/lib/audio/freesound-engine";
import { audioEngine } from "@/lib/audio/audio-engine";

// Map soundboard effect IDs → Freesound SFX definition IDs
const SOUNDBOARD_TO_SFX: Record<string, string> = {
  "sb-thunder": "ambient-thunder",
  "sb-door": "door-open",
  "sb-scream": "ambient-scream",
  "sb-wolf": "ambient-wolf-howl",
  "sb-bell": "turn-change",
  "sb-swords": "sword-hit",
  "sb-fire": "fire-spell",
  "sb-water": "potion-drink",
  "sb-ghost": "creature-death",
  "sb-laugh": "ambient-evil-laugh",
  "sb-horn": "my-turn",
  "sb-coin": "coin-drop",
  "sb-magic": "magic-cast",
  "sb-arrow": "arrow-shot",
  "sb-explosion": "explosion",
  "sb-hit": "take-damage",
};

// Fallback to local files if Freesound hasn't loaded yet
const SOUNDBOARD_FILES: Record<string, string> = {
  "sb-thunder": "/sfx/thunder.ogg",
  "sb-door": "/sfx/door.ogg",
  "sb-scream": "/sfx/scream.ogg",
  "sb-wolf": "/sfx/wolf.ogg",
  "sb-bell": "/sfx/bell.ogg",
  "sb-swords": "/sfx/swords.wav",
  "sb-fire": "/sfx/fire-crackling.ogg",
  "sb-water": "/sfx/water.ogg",
  "sb-ghost": "/sfx/ghost.wav",
  "sb-laugh": "/sfx/evil-laugh.ogg",
  "sb-horn": "/sfx/trumpet.ogg",
  "sb-coin": "/sfx/coin.ogg",
  "sb-magic": "/sfx/magic.wav",
  "sb-arrow": "/sfx/arrow.ogg",
  "sb-explosion": "/sfx/explosion.ogg",
  "sb-hit": "/sfx/hit.ogg",
};

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Zap, DoorOpen, Skull, Dog, Bell, Swords, Flame, Droplets,
  Ghost, Laugh, Megaphone, Coins, Wand2, Target, Bomb, Sword, Music,
};

function EffectIcon({ icon }: { icon: string }) {
  const Icon = ICON_MAP[icon];
  if (Icon) {
    return <Icon className="h-3.5 w-3.5 text-brand-muted" />;
  }
  // Fallback: render as text (e.g. emoji for custom effects)
  return <span className="text-sm leading-none">{icon}</span>;
}

export function SoundboardGrid() {
  const soundboardEffects = useAudioStore((s) => s.soundboardEffects);
  const removeSoundboardEffect = useAudioStore((s) => s.removeSoundboardEffect);
  const addSoundboardEffect = useAudioStore((s) => s.addSoundboardEffect);
  const sfxEnabled = useAudioStore((s) => s.sfxEnabled);
  const muteAll = useAudioStore((s) => s.muteAll);

  const [editMode, setEditMode] = useState(false);
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  async function handlePlay(effect: SoundboardEffect) {
    if (muteAll || !sfxEnabled) return;

    const volume = useAudioStore.getState().sfxVolume;

    // Try Freesound engine first (higher quality)
    const sfxId = SOUNDBOARD_TO_SFX[effect.id];
    if (sfxId && freesoundEngine.isLoaded(sfxId)) {
      await audioEngine.init();
      freesoundEngine.play(sfxId, { volume });
      return;
    }

    // Fallback to local files or custom URL
    const filePath = SOUNDBOARD_FILES[effect.id] || effect.url;
    if (!filePath) return;

    let audio = audioCache.current.get(effect.id);
    if (!audio) {
      audio = new Audio(filePath);
      audioCache.current.set(effect.id, audio);
    }

    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function handleAddCustom() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const effect: SoundboardEffect = {
        id: `sb-custom-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 12),
        icon: "Music",
        url,
        category: "custom",
      };
      addSoundboardEffect(effect);
    };
    input.click();
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
          Soundboard
        </span>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`rounded p-0.5 text-[9px] ${
            editMode ? "bg-brand-accent/20 text-brand-accent" : "text-brand-muted hover:text-brand-text"
          }`}
          title={editMode ? "Sair edição" : "Editar"}
        >
          <Edit2 className="h-2.5 w-2.5" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-0.5">
        {soundboardEffects.map((effect) => (
          <div key={effect.id} className="relative">
            <button
              onClick={() => handlePlay(effect)}
              className="flex w-full flex-col items-center gap-0.5 rounded-md bg-white/[0.04] px-1 py-1.5 transition-colors hover:bg-white/[0.08] active:bg-brand-accent/20"
              title={effect.name}
            >
              <EffectIcon icon={effect.icon} />
              <span className="w-full truncate text-center text-[7px] text-brand-muted">
                {effect.name}
              </span>
            </button>
            {editMode && (
              <button
                onClick={() => removeSoundboardEffect(effect.id)}
                className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="h-2 w-2" />
              </button>
            )}
          </div>
        ))}

        {/* Add custom button */}
        <button
          onClick={handleAddCustom}
          className="flex flex-col items-center gap-0.5 rounded-md border border-dashed border-brand-border px-1 py-1.5 text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
          title="Adicionar efeito"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-[7px]">Novo</span>
        </button>
      </div>
    </div>
  );
}
