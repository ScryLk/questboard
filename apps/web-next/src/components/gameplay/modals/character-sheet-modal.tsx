"use client";

import { useEffect, useState } from "react";
import { X, Wand, Sword, Crosshair } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import {
  MOCK_FULL_CHARACTERS,
  TOKEN_TO_CHARACTER_MAP,
} from "@/lib/character-mock-data";
import { TabAtributos } from "./character-sheet/tab-atributos";
import { TabCombate } from "./character-sheet/tab-combate";
import { TabMagias } from "./character-sheet/tab-magias";
import { TabInventario } from "./character-sheet/tab-inventario";
import { TabNotas } from "./character-sheet/tab-notas";
import { TabHistorico } from "./character-sheet/tab-historico";

const TABS = [
  { key: "atributos", label: "Atributos" },
  { key: "combate", label: "Combate" },
  { key: "magias", label: "Magias" },
  { key: "inventario", label: "Inventario" },
  { key: "notas", label: "Notas" },
  { key: "historico", label: "Historico" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const AVATAR_ICONS: Record<string, typeof Wand> = {
  wand: Wand,
  sword: Sword,
  crosshair: Crosshair,
};

interface CharacterSheetModalProps {
  onClose: () => void;
}

export function CharacterSheetModal({ onClose }: CharacterSheetModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("atributos");
  const targetId = useGameplayStore((s) => s.characterSheetTargetId);
  const tokens = useGameplayStore((s) => s.tokens);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Resolve token → character
  const token = tokens.find((t) => t.id === targetId);
  const charId = targetId ? TOKEN_TO_CHARACTER_MAP[targetId] : null;
  const character = charId ? MOCK_FULL_CHARACTERS[charId] : null;

  if (!character || !token) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onClose}
      >
        <div className="rounded-xl border border-brand-border bg-[#111116] p-8 text-center">
          <p className="text-sm text-brand-muted">
            Personagem nao encontrado.
          </p>
        </div>
      </div>
    );
  }

  const AvatarIcon = AVATAR_ICONS[character.avatarIcon] ?? Wand;
  const xpForNext = character.level < 20 ? [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000][character.level] : character.xp;
  const xpPct = xpForNext > 0 ? Math.min(100, (character.xp / xpForNext) * 100) : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-brand-border bg-[#0A0A0F] shadow-2xl"
        style={{ width: "min(900px, calc(100vw - 32px))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-brand-border px-6 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent">
            <AvatarIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-brand-text">
              {character.name}
            </h2>
            <p className="text-xs text-brand-muted">
              {character.raceName} · {character.className} · Nivel{" "}
              {character.level}
            </p>
            {/* XP bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-brand-accent transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] tabular-nums text-brand-muted">
                {character.xp.toLocaleString()}/{xpForNext.toLocaleString()} XP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-brand-border px-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-brand-accent text-brand-accent"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "atributos" && (
            <TabAtributos character={character} />
          )}
          {activeTab === "combate" && <TabCombate character={character} />}
          {activeTab === "magias" && <TabMagias character={character} />}
          {activeTab === "inventario" && (
            <TabInventario character={character} />
          )}
          {activeTab === "notas" && <TabNotas character={character} />}
          {activeTab === "historico" && (
            <TabHistorico character={character} />
          )}
        </div>
      </div>
    </div>
  );
}
