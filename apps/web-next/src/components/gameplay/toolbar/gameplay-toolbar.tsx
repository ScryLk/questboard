"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  BoxSelect,
  Circle,
  Clapperboard,
  CloudFog,
  Eye,
  Fence,
  Grid3x3,
  Hand,
  Mountain,
  MousePointer2,
  Package,
  Pause,
  Pencil,
  Ruler,
  Save,
  Share2,
  Volume2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { MapTool, SessionInfo } from "@/lib/gameplay-mock-data";
import { getElapsedTime } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { ModalName } from "@/lib/gameplay-store";
import { PhaseBadge } from "../PhaseBadge";
import { GameTooltip } from "@/components/ui/game-tooltip";

interface GameplayToolbarProps {
  session: SessionInfo;
}

const MAP_TOOLS: {
  tool: MapTool;
  icon: typeof MousePointer2;
  label: string;
  shortcut: string;
}[] = [
  { tool: "pointer", icon: MousePointer2, label: "Selecionar", shortcut: "V" },
  { tool: "pan", icon: Hand, label: "Mover", shortcut: "H" },
  { tool: "ruler", icon: Ruler, label: "Medir", shortcut: "R" },
  { tool: "fog", icon: CloudFog, label: "Nevoa", shortcut: "F" },
  { tool: "grid", icon: Grid3x3, label: "Grid", shortcut: "G" },
  { tool: "aoe", icon: Circle, label: "Area de Efeito", shortcut: "A" },
  { tool: "draw", icon: Pencil, label: "Desenhar", shortcut: "D" },
  { tool: "region", icon: BoxSelect, label: "Selecionar Regiao", shortcut: "S" },
  { tool: "wall", icon: Fence, label: "Paredes", shortcut: "B" },
  { tool: "vision", icon: Eye, label: "Visao", shortcut: "W" },
  { tool: "terrain", icon: Mountain, label: "Terreno", shortcut: "T" },
  { tool: "objects", icon: Package, label: "Objetos", shortcut: "O" },
  { tool: "ai", icon: Sparkles, label: "Gerar com IA", shortcut: "I" },
];

const SESSION_ACTIONS: {
  icon: typeof Clapperboard;
  label: string;
  modal: ModalName;
}[] = [
  { icon: BookOpen, label: "Compendio (K)", modal: "creatureCompendium" },
  { icon: Clapperboard, label: "Cena", modal: "sceneCard" },
  { icon: Volume2, label: "Som", modal: "soundtrack" },
  { icon: Pause, label: "Pausar", modal: null },
  { icon: Save, label: "Salvar", modal: null },
  { icon: Share2, label: "Compartilhar", modal: "shareSession" },
];

export function GameplayToolbar({ session }: GameplayToolbarProps) {
  const router = useRouter();
  const activeTool = useGameplayStore((s) => s.activeTool);
  const setActiveTool = useGameplayStore((s) => s.setActiveTool);
  const toggleGrid = useGameplayStore((s) => s.toggleGrid);
  const openModal = useGameplayStore((s) => s.openModal);

  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    setElapsed(getElapsedTime(session.startedAt));
    const id = setInterval(() => setElapsed(getElapsedTime(session.startedAt)), 60_000);
    return () => clearInterval(id);
  }, [session.startedAt]);

  const handleToolClick = useCallback(
    (tool: MapTool) => {
      if (tool === "grid") {
        toggleGrid();
      } else {
        setActiveTool(tool);
      }
    },
    [setActiveTool, toggleGrid],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      // Guard: don't switch tools when region is finalized (F/T conflict)
      const regionState = useGameplayStore.getState().regionSelection;
      if (regionState?.finalized) return;

      const key = e.key.toUpperCase();
      const toolMap: Record<string, MapTool> = {
        V: "pointer",
        H: "pan",
        R: "ruler",
        F: "fog",
        G: "grid",
        A: "aoe",
        D: "draw",
        S: "region",
        B: "wall",
        W: "vision",
        T: "terrain",
        O: "objects",
        I: "ai",
      };
      if (toolMap[key]) {
        e.preventDefault();
        handleToolClick(toolMap[key]);
        return;
      }
      if (key === "K") {
        e.preventDefault();
        useGameplayStore.getState().openModal("creatureCompendium");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleToolClick]);

  return (
    <div className="flex h-12 shrink-0 items-center overflow-hidden border-b border-brand-border bg-[#0D0D12] px-3">
      {/* Left — Session info */}
      <div className="flex min-w-0 shrink items-center gap-3">
        <GameTooltip label="Voltar ao Dashboard" side="bottom">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-1.5 text-brand-muted transition-colors hover:text-brand-text"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </GameTooltip>
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-brand-text">
            Sessao #{session.number} — {session.name}
          </span>
          <span className="shrink-0 text-xs text-brand-muted">{session.campaign}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-brand-success/15 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
          <span className="text-[11px] font-medium text-brand-success">
            AO VIVO {elapsed}
          </span>
        </div>
      </div>

      {/* Center — Map tools */}
      <div className="mx-auto flex shrink-0 items-center gap-1 rounded-lg bg-white/[0.04] p-1">
        {MAP_TOOLS.map(({ tool, icon: Icon, label, shortcut }) => {
          const isActive = tool !== "grid" && activeTool === tool;
          return (
            <GameTooltip key={tool} label={label} shortcut={shortcut} side="bottom">
              <button
                onClick={() => handleToolClick(tool)}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  isActive
                    ? "bg-brand-accent text-white"
                    : "text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            </GameTooltip>
          );
        })}
      </div>

      {/* Right — Session actions */}
      <div className="flex shrink-0 items-center gap-1">
        <PhaseBadge />
        <div className="mx-1 h-5 w-px bg-brand-border" />
        {SESSION_ACTIONS.map(({ icon: Icon, label, modal }) => (
          <GameTooltip key={label} label={label} side="bottom">
            <button
              onClick={() => modal && openModal(modal)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-text"
            >
              <Icon className="h-4 w-4" />
            </button>
          </GameTooltip>
        ))}
        <div className="mx-1 h-5 w-px bg-brand-border" />
        <GameTooltip label="Encerrar Sessao" side="bottom">
          <button
            onClick={() => openModal("endSession")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-danger transition-colors hover:bg-brand-danger/10"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </GameTooltip>
      </div>
    </div>
  );
}
