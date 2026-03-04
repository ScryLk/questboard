"use client";

import { Heart, Shield, User, AlertCircle } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { MOCK_PLAYERS, getAlignmentColor, ALL_CONDITIONS } from "@/lib/gameplay-mock-data";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { HPBar } from "../shared/hp-bar";

const ATTRIBUTES = [
  { name: "FOR", value: 10, mod: 0 },
  { name: "DES", value: 16, mod: 3 },
  { name: "CON", value: 14, mod: 2 },
  { name: "INT", value: 20, mod: 5 },
  { name: "SAB", value: 12, mod: 1 },
  { name: "CAR", value: 8, mod: -1 },
];

const SKILLS = [
  "Arcana +8",
  "Investigacao +8",
  "Percepcao +4",
  "Historia +8",
  "Perspicacia +4",
];

function getConditionLabel(key: string): string {
  const found = ALL_CONDITIONS.find((c) => c.key === key);
  return found ? found.label : key;
}

export function CharacterSheetTab() {
  const selectedTokenIds = useGameplayStore((s) => s.selectedTokenIds);
  const tokens = useGameplayStore((s) => s.tokens);

  // Get the first selected token
  const selectedToken: GameToken | undefined =
    selectedTokenIds.length > 0
      ? tokens.find((t) => t.id === selectedTokenIds[0])
      : undefined;

  // Find the matching player for the selected token
  const player = selectedToken?.playerId
    ? MOCK_PLAYERS.find((p) => p.id === selectedToken.playerId)
    : undefined;

  // If no token is selected, show placeholder
  if (!selectedToken) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <User className="mb-3 h-10 w-10 text-brand-border" />
        <p className="text-sm font-medium text-brand-muted">
          Nenhum token selecionado
        </p>
        <p className="mt-1 text-[11px] text-brand-muted/60">
          Clique em um token no mapa para ver sua ficha
        </p>
      </div>
    );
  }

  const borderColor = getAlignmentColor(selectedToken.alignment);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Character header */}
      <div className="flex items-center gap-3 border-b border-brand-border p-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            backgroundColor: borderColor + "20",
            color: borderColor,
          }}
        >
          {player?.avatarInitials ?? selectedToken.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-text">
            {selectedToken.name}
          </p>
          <p className="text-[11px] text-brand-muted">
            {player
              ? `${player.class} Nv. ${player.level} — ${player.name}`
              : selectedToken.alignment === "hostile"
                ? "Hostil"
                : selectedToken.alignment === "ally"
                  ? "Aliado"
                  : "Neutro"}
          </p>
        </div>
      </div>

      {/* HP + AC */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
          <div className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-brand-danger" />
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              HP
            </span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
            {selectedToken.hp}
            <span className="text-sm text-brand-muted">/{selectedToken.maxHp}</span>
          </p>
          <HPBar hp={selectedToken.hp} maxHp={selectedToken.maxHp} height={4} className="mt-1.5" />
        </div>
        <div className="rounded-lg border border-brand-border bg-brand-primary p-3">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-brand-info" />
            <span className="text-[10px] uppercase tracking-wider text-brand-muted">
              CA
            </span>
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
            {selectedToken.ac}
          </p>
        </div>
      </div>

      {/* Speed + Position */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-3">
        <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-brand-muted">
            Velocidade
          </span>
          <p className="text-sm font-semibold tabular-nums text-brand-text">
            {selectedToken.speed}ft
          </p>
        </div>
        <div className="rounded-lg border border-brand-border bg-brand-primary px-3 py-2">
          <span className="text-[10px] uppercase tracking-wider text-brand-muted">
            Posicao
          </span>
          <p className="text-sm font-semibold tabular-nums text-brand-text">
            ({selectedToken.x}, {selectedToken.y})
          </p>
        </div>
      </div>

      {/* Conditions */}
      {selectedToken.conditions.length > 0 && (
        <div className="border-t border-brand-border px-4 py-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
            Condicoes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedToken.conditions.map((cond) => (
              <span
                key={cond}
                className="flex items-center gap-1 rounded-md bg-brand-warning/15 px-2 py-0.5 text-[11px] font-medium text-brand-warning"
              >
                <AlertCircle className="h-3 w-3" />
                {getConditionLabel(cond)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attributes — only for player tokens */}
      {player && (
        <div className="border-t border-brand-border px-4 py-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
            Atributos
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ATTRIBUTES.map((attr) => (
              <div
                key={attr.name}
                className="flex flex-col items-center rounded-lg border border-brand-border bg-brand-primary p-2"
              >
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">
                  {attr.name}
                </span>
                <span className="mt-0.5 text-base font-bold tabular-nums text-brand-text">
                  {attr.mod >= 0 ? `+${attr.mod}` : attr.mod}
                </span>
                <span className="text-[10px] tabular-nums text-brand-muted">
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills — only for player tokens */}
      {player && (
        <div className="border-t border-brand-border px-4 py-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
            Pericias
          </p>
          <div className="space-y-1">
            {SKILLS.map((skill) => (
              <div
                key={skill}
                className="flex items-center rounded px-2 py-1 text-xs text-brand-text transition-colors hover:bg-white/[0.03]"
              >
                <User className="mr-2 h-3 w-3 text-brand-muted" />
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open full sheet — only for player tokens */}
      {selectedToken.alignment === "player" && (
        <div className="mt-auto border-t border-brand-border p-3">
          <button
            onClick={() => {
              useGameplayStore.getState().setCharacterSheetTarget(selectedToken.id);
              useGameplayStore.getState().openModal("characterSheet");
            }}
            className="w-full rounded-lg border border-brand-border py-2 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            Abrir Ficha Completa
          </button>
        </div>
      )}
    </div>
  );
}
