"use client";

import { useCallback, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Clapperboard,
  CloudRain,
  Film,
  Map,
  MapPin,
  Play,
  Search,
  X,
} from "lucide-react";
import { ModalShell } from "./modal-shell";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MOCK_SESSION_MAPS } from "@/lib/gameplay-mock-data";
import type { SceneCardStyle, SceneCard } from "@/lib/player-view-store";

interface SceneCardBuilderModalProps {
  onClose: () => void;
}

const SCENE_TYPES: {
  type: SceneCardStyle;
  label: string;
  icon: typeof Clapperboard;
  color: string;
}[] = [
  { type: "cinematic", label: "Cinematica", icon: Clapperboard, color: "#FFD700" },
  { type: "chapter", label: "Capitulo", icon: BookOpen, color: "#6C5CE7" },
  { type: "location", label: "Local", icon: MapPin, color: "#00B894" },
  { type: "mystery", label: "Misterio", icon: Search, color: "#6C5CE7" },
  { type: "danger", label: "Perigo", icon: AlertTriangle, color: "#FF4757" },
  { type: "flashback", label: "Flashback", icon: Film, color: "#C9A84C" },
  { type: "weather", label: "Clima", icon: CloudRain, color: "#74B9FF" },
];

const DURATION_OPTIONS = [3, 5, 7, 10, 15];

const ATMOSPHERE_TAGS = [
  "Sombrio", "Misterioso", "Tenso", "Epico", "Melancolico",
  "Pacifico", "Caótico", "Sagrado", "Profano", "Selvagem",
  "Frio", "Quente", "Úmido", "Ventoso", "Tempestuoso", "Noturno",
];

export function SceneCardBuilderModal({ onClose }: SceneCardBuilderModalProps) {
  const fireSceneCard = useGameplayStore((s) => s.fireSceneCard);

  const [sceneType, setSceneType] = useState<SceneCardStyle>("cinematic");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [linkedMapId, setLinkedMapId] = useState<string | null>(null);
  const [autoSwitchMap, setAutoSwitchMap] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const linkedMap = linkedMapId
    ? MOCK_SESSION_MAPS.find((m) => m.id === linkedMapId) ?? null
    : null;

  const activeConfig = SCENE_TYPES.find((t) => t.type === sceneType)!;

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const buildCard = useCallback((): SceneCard => {
    return {
      style: sceneType,
      title: title.trim() || "Sem titulo",
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      duration: duration * 1000,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      chapter: chapter.trim() || undefined,
      linkedMapId: linkedMapId ?? undefined,
      linkedMapName: linkedMap?.name,
      autoSwitchMap,
    };
  }, [sceneType, title, subtitle, description, duration, selectedTags, chapter, linkedMapId, linkedMap, autoSwitchMap]);

  const handleFire = () => {
    const card = buildCard();
    fireSceneCard(card);
    onClose();
  };

  const handleTest = () => {
    const card = buildCard();
    fireSceneCard(card);
  };

  const titlePlaceholder = (() => {
    switch (sceneType) {
      case "cinematic": return "Uma escuridao antiga desperta...";
      case "chapter": return "A Queda de Valdris";
      case "location": return "Taverna do Javali Dourado";
      case "mystery": return "Quem envenenou o rei?";
      case "danger": return "EMBOSCADA!";
      case "flashback": return "Há muitos anos atras...";
      case "weather": return "Tempestade se Aproxima";
      default: return "Titulo da cena";
    }
  })();

  return (
    <ModalShell title="Cartao de Cena" maxWidth={520} onClose={onClose}>
      {/* Type selector */}
      <div className="mb-4">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Tipo de Cena
        </label>
        <div className="flex flex-wrap gap-2">
          {SCENE_TYPES.map(({ type, label, icon: Icon, color }) => {
            const isActive = sceneType === type;
            return (
              <button
                key={type}
                onClick={() => setSceneType(type)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: isActive ? color : "rgba(255,255,255,0.08)",
                  backgroundColor: isActive ? `${color}15` : "transparent",
                  color: isActive ? color : "#8A8A9A",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter field (only for chapter type) */}
      {sceneType === "chapter" && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            Capitulo
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Capitulo III"
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          />
        </div>
      )}

      {/* Title */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Titulo
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={titlePlaceholder}
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Subtitle */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Subtitulo
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Texto complementar (opcional)"
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* Description (location, mystery, flashback) */}
      {(sceneType === "location" || sceneType === "mystery" || sceneType === "flashback") && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            Descricao
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descricao da cena..."
            rows={2}
            className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
          />
        </div>
      )}

      {/* Duration */}
      <div className="mb-4">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Duracao
        </label>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className="flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all"
              style={{
                borderColor: duration === d ? activeConfig.color : "rgba(255,255,255,0.08)",
                backgroundColor: duration === d ? `${activeConfig.color}15` : "transparent",
                color: duration === d ? activeConfig.color : "#8A8A9A",
              }}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Atmosphere tags (location, weather) */}
      {(sceneType === "location" || sceneType === "weather") && (
        <div className="mb-4">
          <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            Atmosfera
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ATMOSPHERE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="rounded-md border px-2 py-1 text-[10px] font-medium transition-all"
                  style={{
                    borderColor: isSelected ? activeConfig.color : "rgba(255,255,255,0.08)",
                    backgroundColor: isSelected ? `${activeConfig.color}15` : "transparent",
                    color: isSelected ? activeConfig.color : "#6A6A7A",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            Preview
          </label>
          <button
            onClick={handleTest}
            disabled={!title.trim()}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/10 disabled:opacity-40"
          >
            <Play className="h-3 w-3" />
            Testar Agora
          </button>
        </div>
        <ScenePreview type={sceneType} title={title} subtitle={subtitle} chapter={chapter} color={activeConfig.color} />
      </div>

      {/* Mapa Vinculado */}
      <div className="mb-5">
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Mapa Vinculado (opcional)
        </label>

        {linkedMap ? (
          <div className="flex items-center gap-3 rounded-lg border border-brand-accent/30 bg-brand-accent/5 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
              <Map className="h-4 w-4 text-brand-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-brand-text">
                {linkedMap.name}
              </p>
              <p className="text-[10px] text-brand-muted">
                {linkedMap.gridCols}x{linkedMap.gridRows} · {linkedMap.category}
              </p>
            </div>
            <button
              onClick={() => setLinkedMapId(null)}
              className="shrink-0 rounded-md p-1 text-brand-muted transition-colors hover:bg-white/10 hover:text-brand-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowMapPicker((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-brand-border px-3 py-2.5 text-xs text-brand-muted transition-colors hover:border-brand-accent/50 hover:text-brand-text"
          >
            <Map className="h-4 w-4" />
            Selecionar mapa da sessao
          </button>
        )}

        {/* Auto-switch toggle */}
        {linkedMap && (
          <label className="mt-2 flex cursor-pointer items-center gap-2">
            <button
              onClick={() => setAutoSwitchMap((v) => !v)}
              className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
              style={{
                backgroundColor: autoSwitchMap ? activeConfig.color : "rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{ left: autoSwitchMap ? 18 : 2 }}
              />
            </button>
            <span className="text-[11px] text-brand-muted">
              Trocar mapa dos jogadores ao disparar
            </span>
          </label>
        )}

        {/* Map picker dropdown */}
        {showMapPicker && !linkedMap && (
          <div className="mt-2 max-h-[160px] space-y-1 overflow-y-auto rounded-lg border border-brand-border bg-brand-primary p-1.5">
            {MOCK_SESSION_MAPS.map((map) => (
              <button
                key={map.id}
                onClick={() => {
                  setLinkedMapId(map.id);
                  setShowMapPicker(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
              >
                <Map className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-brand-text">{map.name}</p>
                  <p className="text-[10px] text-brand-muted">
                    {map.gridCols}x{map.gridRows} · {map.category}
                  </p>
                </div>
                {map.isActive && (
                  <span className="shrink-0 rounded-full bg-brand-success/15 px-1.5 py-0.5 text-[9px] font-medium text-brand-success">
                    Ativo
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={handleFire}
          disabled={!title.trim()}
          className="h-9 rounded-lg px-4 text-xs font-medium text-white transition-colors disabled:opacity-40"
          style={{ backgroundColor: activeConfig.color }}
        >
          Disparar para Jogadores
        </button>
      </div>
    </ModalShell>
  );
}

// ── Inline Preview ───────────────────────────────────────────

function ScenePreview({
  type,
  title,
  subtitle,
  chapter,
  color,
}: {
  type: SceneCardStyle;
  title: string;
  subtitle: string;
  chapter: string;
  color: string;
}) {
  const hasContent = !!title.trim();

  if (!hasContent) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-brand-border bg-[#0F0F12]">
        <span className="text-xs text-brand-muted">Preencha os campos para ver o preview</span>
      </div>
    );
  }

  const bgMap: Record<SceneCardStyle, string> = {
    cinematic: "rgba(0,0,0,0.9)",
    chapter: "#0A0A0F",
    location: "rgba(0,20,15,0.85)",
    mystery: "rgba(10,10,30,0.9)",
    danger: "rgba(30,0,0,0.9)",
    flashback: "rgba(20,20,18,0.9)",
    weather: "rgba(10,15,30,0.9)",
  };

  return (
    <div
      className="relative flex h-36 flex-col items-center justify-center overflow-hidden rounded-xl px-6 text-center"
      style={{ backgroundColor: bgMap[type] }}
    >
      {/* Cinematic letterbox */}
      {type === "cinematic" && (
        <>
          <div className="absolute inset-x-0 top-0 h-5 bg-black" />
          <div className="absolute inset-x-0 bottom-0 h-5 bg-black" />
        </>
      )}

      {/* Chapter gold lines */}
      {type === "chapter" && (
        <div className="mx-auto mb-2 h-px w-12 bg-[#C9A84C] opacity-60" />
      )}
      {type === "chapter" && chapter && (
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[2px] text-brand-muted">
          {chapter}
        </p>
      )}

      {/* Danger border */}
      {type === "danger" && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-500/50" />
      )}

      {/* Flashback grain */}
      {type === "flashback" && (
        <div className="absolute inset-0 bg-[rgba(139,105,20,0.06)]" />
      )}

      {/* Title */}
      <h3
        className="text-lg font-bold"
        style={{
          color: type === "danger" ? color : type === "flashback" ? "#C8C0A8" : "#E8E8ED",
          textTransform: type === "danger" || type === "weather" ? "uppercase" : undefined,
          fontStyle: type === "flashback" ? "italic" : undefined,
          opacity: type === "mystery" ? 0.6 : 1,
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="mt-1 text-xs"
          style={{
            color: type === "flashback" ? "#8A8A7A" : "#9090A0",
            fontStyle: type === "cinematic" || type === "flashback" ? "italic" : undefined,
            opacity: type === "mystery" ? 0.4 : 1,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Chapter bottom gold line */}
      {type === "chapter" && (
        <div className="mx-auto mt-2 h-px w-12 bg-[#C9A84C] opacity-60" />
      )}
    </div>
  );
}
