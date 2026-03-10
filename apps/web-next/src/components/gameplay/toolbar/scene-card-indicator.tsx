"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Clapperboard,
  CloudRain,
  Film,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { SceneCardStyle } from "@/lib/player-view-store";

const SCENE_ICONS: Record<SceneCardStyle, typeof Clapperboard> = {
  cinematic: Clapperboard,
  chapter: BookOpen,
  location: MapPin,
  mystery: Search,
  danger: AlertTriangle,
  flashback: Film,
  weather: CloudRain,
};

const SCENE_COLORS: Record<SceneCardStyle, string> = {
  cinematic: "#FFD700",
  chapter: "#6C5CE7",
  location: "#00B894",
  mystery: "#6C5CE7",
  danger: "#FF4757",
  flashback: "#C9A84C",
  weather: "#74B9FF",
};

const SCENE_LABELS: Record<SceneCardStyle, string> = {
  cinematic: "Cinematica",
  chapter: "Capitulo",
  location: "Local",
  mystery: "Misterio",
  danger: "Perigo",
  flashback: "Flashback",
  weather: "Clima",
};

export function SceneCardIndicator() {
  const activeSceneCard = useGameplayStore((s) => s.activeSceneCard);
  const sceneCardFiredAt = useGameplayStore((s) => s.sceneCardFiredAt);
  const dismissSceneCard = useGameplayStore((s) => s.dismissSceneCard);

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeSceneCard || !sceneCardFiredAt) {
      setRemaining(0);
      return;
    }

    const duration = activeSceneCard.duration || 6000;

    const tick = () => {
      const elapsed = Date.now() - sceneCardFiredAt;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left <= 0) return;
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [activeSceneCard, sceneCardFiredAt]);

  if (!activeSceneCard || remaining <= 0) return null;

  const color = SCENE_COLORS[activeSceneCard.style];
  const Icon = SCENE_ICONS[activeSceneCard.style];
  const label = SCENE_LABELS[activeSceneCard.style];
  const duration = activeSceneCard.duration || 6000;
  const progress = remaining / duration;

  return (
    <div
      className="absolute left-1/2 top-[52px] z-40 flex -translate-x-1/2 items-center gap-3 rounded-b-lg border border-t-0 border-brand-border bg-[#111116]/95 px-4 py-2 shadow-lg backdrop-blur-sm"
      style={{ animation: "slideDown 0.3s ease-out forwards" }}
    >
      {/* Type pill */}
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>

      {/* Title */}
      <span className="max-w-[200px] truncate text-xs font-medium text-brand-text">
        {activeSceneCard.title}
      </span>

      {/* Countdown */}
      <div className="flex items-center gap-2">
        <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span className="min-w-[28px] text-right text-[11px] font-mono text-brand-muted">
          {Math.ceil(remaining / 1000)}s
        </span>
      </div>

      {/* Dismiss button */}
      <button
        onClick={dismissSceneCard}
        className="flex h-6 w-6 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
        title="Encerrar cena"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
