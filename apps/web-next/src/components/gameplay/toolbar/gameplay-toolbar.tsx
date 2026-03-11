"use client";

import { useCallback, useEffect } from "react";
import {
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
  BookOpen,
} from "lucide-react";
import type { MapTool, SessionInfo } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { ModalName } from "@/lib/gameplay-store";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { SessionNameWithProgress } from "./session-name-with-progress";

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
  const activeTool = useGameplayStore((s) => s.activeTool);
  const setActiveTool = useGameplayStore((s) => s.setActiveTool);
  const toggleGrid = useGameplayStore((s) => s.toggleGrid);
  const openModal = useGameplayStore((s) => s.openModal);

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
    <div className="relative flex h-14 shrink-0 items-center border-b border-brand-border bg-[#0D0D12] px-3">
      {/* Left — Session info + progress */}
      <SessionNameWithProgress session={session} />

      {/* Center — Map tools (absolute center) */}
      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-lg bg-white/[0.04] p-1">
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
      <div className="ml-auto flex shrink-0 items-center gap-1">
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
