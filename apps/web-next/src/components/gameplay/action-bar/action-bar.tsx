"use client";

import { useState } from "react";
import {
  Swords,
  Zap,
  Shield,
  MessageCircle,
  Flag,
  Check,
  Footprints,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { TOKEN_TO_CHARACTER_MAP, MOCK_FULL_CHARACTERS } from "@/lib/character-mock-data";
import type { FullCharacter } from "@/lib/character-types";
import { ActionMenu } from "./action-menu";
import { AttackWorkflow } from "./attack-workflow";
import { SpellMenu } from "./spell-menu";
import { SkillCheckPopover } from "./skill-check-popover";
import { BonusMenu } from "./bonus-menu";
import { NPCTurnBar } from "./npc-turn-bar";

type ActionBarView = "idle" | "action-menu" | "attack" | "spell" | "skill-check" | "bonus-menu";

export function ActionBar() {
  const combat = useGameplayStore((s) => s.combat);
  const tokens = useGameplayStore((s) => s.tokens);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const reactionUsedMap = useGameplayStore((s) => s.reactionUsedMap);
  const movementUsedFt = useGameplayStore((s) => s.movementUsedFt);
  const nextTurn = useGameplayStore((s) => s.nextTurn);

  const [view, setView] = useState<ActionBarView>("idle");

  // Only show if combat active
  if (!combat.active) return null;

  // Get current combatant
  const currentCombatant = combat.order[combat.turnIndex];
  if (!currentCombatant) return null;

  const currentToken = tokens.find((t) => t.id === currentCombatant.tokenId);
  if (!currentToken) return null;

  // For hostile NPCs, show the NPC turn bar with tactical AI
  if (currentToken.alignment !== "player") {
    if (currentToken.alignment === "hostile") {
      return <NPCTurnBar token={currentToken} combat={combat} />;
    }
    return null;
  }

  // Get character data
  const characterId = TOKEN_TO_CHARACTER_MAP[currentToken.id];
  const character: FullCharacter | undefined = characterId
    ? MOCK_FULL_CHARACTERS[characterId]
    : undefined;

  const speed = currentToken.speed;
  const movementLeft = turnActions.isDashing ? speed * 2 - movementUsedFt : speed - movementUsedFt;

  function handleEndTurn() {
    setView("idle");
    nextTurn();
  }

  function handleCloseView() {
    setView("idle");
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
      {/* Popover views */}
      {view === "action-menu" && (
        <ActionMenu
          character={character}
          onClose={handleCloseView}
          onAttack={() => setView("attack")}
          onSpell={() => setView("spell")}
          onSkillCheck={() => setView("skill-check")}
        />
      )}
      {view === "attack" && character && (
        <AttackWorkflow
          character={character}
          attackerToken={currentToken}
          onClose={handleCloseView}
        />
      )}
      {view === "spell" && character && (
        <SpellMenu
          character={character}
          attackerToken={currentToken}
          onClose={handleCloseView}
        />
      )}
      {view === "skill-check" && character && (
        <SkillCheckPopover
          character={character}
          tokenName={currentToken.name}
          onClose={handleCloseView}
        />
      )}
      {view === "bonus-menu" && character && (
        <BonusMenu
          character={character}
          attackerToken={currentToken}
          onClose={handleCloseView}
        />
      )}

      {/* Main bar */}
      <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-[#111116]/95 px-4 py-2.5 shadow-2xl backdrop-blur-sm">
        {/* Turn info */}
        <div className="flex items-center gap-2 border-r border-brand-border pr-3">
          <span className="text-xs font-bold text-brand-accent">
            {currentToken.name}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-brand-muted">
            <Footprints className="h-3 w-3" />
            <span className={movementLeft <= 0 ? "text-brand-danger" : ""}>
              {Math.max(0, movementLeft)}/{turnActions.isDashing ? speed * 2 : speed}ft
            </span>
          </div>
          <span className="text-[10px] text-brand-muted">
            R{combat.round}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Action */}
          <ActionButton
            icon={Swords}
            label="Acao"
            used={turnActions.actionUsed}
            active={view === "action-menu" || view === "attack" || view === "spell" || view === "skill-check"}
            onClick={() => {
              if (turnActions.actionUsed) return;
              setView(view === "action-menu" ? "idle" : "action-menu");
            }}
          />

          {/* Bonus Action */}
          <ActionButton
            icon={Zap}
            label="Bonus"
            used={turnActions.bonusActionUsed}
            active={view === "bonus-menu"}
            onClick={() => {
              if (turnActions.bonusActionUsed) return;
              setView(view === "bonus-menu" ? "idle" : "bonus-menu");
            }}
          />

          {/* Reaction */}
          <ActionButton
            icon={Shield}
            label="Reacao"
            used={reactionUsedMap[currentCombatant.tokenId] ?? false}
            onClick={() => {
              // Reactions happen off-turn, this is just a tracker
            }}
          />

          {/* Free Action */}
          <ActionButton
            icon={MessageCircle}
            label="Livre"
            used={false}
            onClick={() => {
              // Free interaction — nothing to track
            }}
          />

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-brand-border" />

          {/* End Turn */}
          <button
            onClick={handleEndTurn}
            className="flex items-center gap-1.5 rounded-lg bg-brand-accent/20 px-3 py-1.5 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30"
          >
            <Flag className="h-3 w-3" />
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  used,
  active,
  onClick,
}: {
  icon: typeof Swords;
  label: string;
  used: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={used}
      className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
        used
          ? "cursor-default bg-white/[0.02] text-brand-muted/50"
          : active
            ? "bg-brand-accent/20 text-brand-accent"
            : "text-brand-text hover:bg-white/[0.06]"
      }`}
    >
      {used ? <Check className="h-3 w-3 text-green-500/70" /> : <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
