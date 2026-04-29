"use client";

// Dashboard de áudio — gerenciamento de trilha sonora, ambiência e
// soundboard fora de sessão. Reusa os componentes que já vivem no
// painel de gameplay (gameplay/audio/*) — são puros sobre `useAudioStore`,
// não têm acoplamento com a session em si.

import {
  Disc3,
  Headphones,
  Music,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { MusicPlayerPanel } from "@/components/gameplay/audio/music-player-panel";
import { AmbienceSelector } from "@/components/gameplay/audio/ambience-selector";
import { SoundboardGrid } from "@/components/gameplay/audio/soundboard-grid";
import { SFXSettingsPanel } from "@/components/gameplay/audio/sfx-settings-panel";

export default function AudioDashboardPage() {
  const muteAll = useAudioStore((s) => s.muteAll);
  const masterVolume = useAudioStore((s) => s.masterVolume);
  const setMuteAll = useAudioStore((s) => s.setMuteAll);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-accent">
            <Headphones className="h-3.5 w-3.5" />
            Áudio
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-white">
            Trilha Sonora & Ambiência
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-brand-muted">
            Prepare playlists, ambiências e soundboard antes da sessão. Tudo
            persiste local — durante o gameplay, controles aparecem direto no
            painel lateral.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setMuteAll(!muteAll)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              muteAll
                ? "border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                : "border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            {muteAll ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            {muteAll ? "Mudo" : "Áudio ativo"}
          </button>
        </div>
      </header>

      {/* Master volume */}
      <section className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-brand-muted">
          <Volume2 className="h-3.5 w-3.5 text-brand-accent" />
          Volume Master
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="flex-1 accent-brand-accent"
            disabled={muteAll}
          />
          <span className="w-12 text-right font-syne text-lg font-bold text-brand-text tabular-nums">
            {Math.round(masterVolume * 100)}
          </span>
        </div>
        <p className="mt-2 text-[10px] text-brand-muted/70">
          Afeta todas as fontes (trilha + ambiência + efeitos). Sliders por
          fonte aparecem nos cards abaixo.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Trilha (Música) */}
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-purple-300" />
              <h2 className="font-cinzel text-base font-semibold text-brand-text">
                Trilha Sonora
              </h2>
            </div>
            <span className="text-[10px] text-brand-muted/70">
              Importe MP3/OGG locais (URL.createObjectURL — não persiste após
              reload)
            </span>
          </div>
          <MusicPlayerPanel />
        </section>

        {/* Ambiência */}
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-300" />
            <h2 className="font-cinzel text-base font-semibold text-brand-text">
              Ambiência
            </h2>
          </div>
          <AmbienceSelector />
          <p className="mt-3 text-[10px] text-brand-muted/70">
            Catálogo bundled com 16 presets (locais, clima, situações). Files
            em <code className="rounded bg-white/[0.04] px-1">/audio/ambience/</code>
            — adicione MP3s no <code className="rounded bg-white/[0.04] px-1">public/</code>{" "}
            pra cada slug.
          </p>
        </section>

        {/* Soundboard */}
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-amber-300" />
            <h2 className="font-cinzel text-base font-semibold text-brand-text">
              Soundboard (efeitos rápidos)
            </h2>
          </div>
          <SoundboardGrid />
        </section>

        {/* Configurações de SFX do sistema */}
        <section className="rounded-xl border border-brand-border bg-white/[0.02] p-4 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-300" />
            <h2 className="font-cinzel text-base font-semibold text-brand-text">
              Sons do Sistema
            </h2>
          </div>
          <SFXSettingsPanel />
        </section>
      </div>

      <p className="text-[10px] text-brand-muted/70">
        Sincronização com jogadores (broadcast da trilha) será ligada quando o
        backend Socket.IO subir. Por ora, GM e jogadores ouvem
        independentemente.
      </p>
    </div>
  );
}
