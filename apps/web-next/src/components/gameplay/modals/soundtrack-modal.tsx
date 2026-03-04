"use client";

import { useState } from "react";
import { Pause, Play, Search, Volume2, VolumeX } from "lucide-react";
import { ModalShell } from "./modal-shell";

interface SoundtrackModalProps {
  onClose: () => void;
}

type Mood = "all" | "combat" | "exploration" | "tavern" | "mystery" | "epic";

const MOODS: { key: Mood; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "combat", label: "Combate" },
  { key: "exploration", label: "Exploracao" },
  { key: "tavern", label: "Taverna" },
  { key: "mystery", label: "Misterio" },
  { key: "epic", label: "Epico" },
];

const MOCK_TRACKS = [
  {
    id: "t1",
    name: "Batalha Sombria",
    mood: "combat",
    duration: "3:42",
    playing: true,
  },
  {
    id: "t2",
    name: "Taverna Animada",
    mood: "tavern",
    duration: "4:15",
    playing: false,
  },
  {
    id: "t3",
    name: "Floresta Misteriosa",
    mood: "exploration",
    duration: "5:01",
    playing: false,
  },
  {
    id: "t4",
    name: "Sussurros no Escuro",
    mood: "mystery",
    duration: "3:28",
    playing: false,
  },
  {
    id: "t5",
    name: "Marcha dos Herois",
    mood: "epic",
    duration: "4:55",
    playing: false,
  },
  {
    id: "t6",
    name: "Emboscada na Estrada",
    mood: "combat",
    duration: "2:58",
    playing: false,
  },
];

export function SoundtrackModal({ onClose }: SoundtrackModalProps) {
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState<Mood>("all");
  const [playingId, setPlayingId] = useState<string | null>("t1");
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);

  const filtered = MOCK_TRACKS.filter((t) => {
    if (mood !== "all" && t.mood !== mood) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <ModalShell title="Trilha Sonora" maxWidth={560} onClose={onClose}>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar trilha..."
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary pl-9 pr-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Mood filters */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MOODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMood(key)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              mood === key
                ? "bg-brand-accent text-white"
                : "border border-brand-border text-brand-muted hover:text-brand-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div className="mb-4 max-h-[240px] space-y-1 overflow-y-auto">
        {filtered.map((track) => {
          const isPlaying = playingId === track.id;
          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isPlaying
                  ? "bg-brand-accent/10 text-brand-accent"
                  : "text-brand-text hover:bg-white/[0.03]"
              }`}
            >
              <button
                onClick={() => setPlayingId(isPlaying ? null : track.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{track.name}</p>
                <p className="text-[10px] capitalize text-brand-muted">
                  {track.mood}
                </p>
              </div>
              <span className="text-[11px] tabular-nums text-brand-muted">
                {track.duration}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-xs text-brand-muted">
            Nenhuma trilha encontrada
          </p>
        )}
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-primary p-3">
        <button onClick={() => setMuted(!muted)} className="text-brand-muted">
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            setMuted(false);
          }}
          className="flex-1 accent-brand-accent"
        />
        <span className="w-8 text-right text-[11px] tabular-nums text-brand-muted">
          {muted ? 0 : volume}%
        </span>
      </div>
    </ModalShell>
  );
}
