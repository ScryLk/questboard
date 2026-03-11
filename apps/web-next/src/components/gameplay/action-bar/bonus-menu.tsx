"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Crosshair,
  Lock,
  Sparkles,
  Sword,
  Wand2,
  Zap,
} from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { getAvailableBonusActions } from "@/lib/bonus-actions";
import type { BonusActionDef } from "@/lib/bonus-actions";
import { rollD20, parseDiceFormula } from "@/lib/dice";
import type { FullCharacter, CharacterSpell } from "@/lib/character-types";
import type { GameToken } from "@/lib/gameplay-mock-data";

interface BonusMenuProps {
  character: FullCharacter;
  attackerToken: GameToken;
  onClose: () => void;
}

const ICON_MAP: Record<string, typeof Sword> = {
  Sword,
  Wand2,
  Zap,
  Sparkles,
};

type Step = "list" | "select-target" | "select-quickened-spell" | "result";

export function BonusMenu({ character, attackerToken, onClose }: BonusMenuProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const useBonusAction = useGameplayStore((s) => s.useBonusAction);
  const setCastBonusSpell = useGameplayStore((s) => s.setCastBonusSpell);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const setAttackLine = useGameplayStore((s) => s.setAttackLine);
  const addDamageFloat = useGameplayStore((s) => s.addDamageFloat);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const addCombatLogMessage = useGameplayStore((s) => s.addCombatLogMessage);

  const [step, setStep] = useState<Step>("list");
  const [selectedAction, setSelectedAction] = useState<BonusActionDef | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [resultText, setResultText] = useState("");

  const allActions = getAvailableBonusActions(character, turnActions);
  const available = allActions.filter((a) => a.available);
  const unavailable = allActions.filter((a) => !a.available);

  // Get hostile targets
  const hostileTargets = tokens.filter(
    (t) => t.onMap && t.id !== attackerToken.id && t.hp > 0 &&
      (t.alignment === "hostile" || t.alignment === "neutral"),
  );

  // Get action spells for quickened (castingTime "1 ação" and not cantrip-level)
  const quickenableSpells = character.spells.filter(
    (s) => s.prepared && s.castingTime.toLowerCase().includes("1 ação") && !s.castingTime.toLowerCase().includes("bônus"),
  );

  function handleActionClick(action: BonusActionDef) {
    if (!action.available) return;
    setSelectedAction(action);

    if (action.id === "offhand-attack") {
      // Go to target selection
      setStep("select-target");
    } else if (action.spell) {
      // Bonus spell
      const isSelf = action.spell.range === "Pessoal" || action.spell.range.startsWith("Pessoal");
      if (isSelf) {
        executeBonusSpell(action.spell, null);
      } else {
        setSelectedSpell(action.spell);
        setStep("select-target");
      }
    } else if (action.isQuickenedSpell) {
      setStep("select-quickened-spell");
    }
  }

  function executeOffhandAttack(target: GameToken) {
    const weapon = selectedAction?.weapon;
    if (!weapon) return;

    // Offhand: d20 + proficiency + DEX mod, damage = dice only (no mod)
    const dexMod = character.abilities.dex.modifier;
    const attackBonus = character.proficiencyBonus + dexMod;
    const attackResult = rollD20(attackBonus);
    const isCrit = attackResult.isNat20 ?? false;
    const isFumble = attackResult.isNat1 ?? false;
    const isHit = isCrit || (!isFumble && attackResult.total >= target.ac);

    let damageTotal = 0;
    let damageDetails = "";

    if (isHit && weapon.damage) {
      const damageFormula = weapon.damage.split(" ")[0];
      // Extract just the dice part (no modifier) for offhand
      const diceOnly = damageFormula.replace(/[+-]\d+$/, "");
      const dmg = parseDiceFormula(diceOnly);
      damageTotal = dmg.total;
      damageDetails = dmg.details;

      if (isCrit) {
        const dmgCrit = parseDiceFormula(diceOnly);
        damageTotal += dmgCrit.total;
        damageDetails += `+${dmgCrit.details}`;
      }
    }

    if (isHit && damageTotal > 0) {
      updateTokenHp(target.id, target.hp - damageTotal);
      addDamageFloat(target.id, damageTotal, false, isCrit);
    }

    setAttackLine({
      attackerId: attackerToken.id,
      targetId: target.id,
      roll: attackResult.total,
      damage: isHit ? damageTotal : null,
    });

    const damageType = weapon.damage?.split(" ").slice(1).join(" ") ?? "";
    const hitLabel = isCrit ? "CRITICO!" : isFumble ? "FALHA CRITICA!" : isHit ? "ACERTOU!" : "ERROU!";
    const attackDetails = `d20[${attackResult.rolls[0]}]+${attackBonus}`;

    let chatContent = `${attackerToken.name} ataca ${target.name} com ${weapon.name} (mao inabil)\n`;
    chatContent += `Ataque: ${attackResult.total} (${attackDetails}) vs CA ${target.ac} — ${hitLabel}`;
    if (isHit && damageTotal > 0) {
      chatContent += `\nDano: ${damageTotal} (${damageDetails}) ${damageType} [sem mod]`;
    }

    addMessage({
      id: `msg_${Date.now()}`,
      channel: "geral",
      type: "roll",
      sender: attackerToken.name,
      senderInitials: attackerToken.name.slice(0, 2).toUpperCase(),
      isGM: false,
      content: chatContent,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      rollFormula: `d20+${attackBonus}`,
      rollResult: attackResult.total,
      rollDetails: attackDetails,
      isNat20: isCrit,
      isNat1: isFumble,
    });

    useBonusAction();
    setResultText(chatContent);
    setStep("result");
  }

  function executeBonusSpell(spell: CharacterSpell, target: GameToken | null) {
    const targetName = target?.name ?? "area";
    let chatContent = `${attackerToken.name} conjura ${spell.name}`;
    if (target) chatContent += ` em ${target.name}`;
    chatContent += `! (acao bonus)`;

    const damageMatch = spell.description.match(/(\d+d\d+)/);
    let damageTotal = 0;

    if (damageMatch && target) {
      const isSpellAttack = spell.description.includes("Ataque") || spell.description.includes("ataque");

      if (isSpellAttack && character.spellcasting) {
        const attackResult = rollD20(character.spellcasting.attackBonus);
        const isHit = (attackResult.isNat20 ?? false) || attackResult.total >= target.ac;

        chatContent += `\nAtaque: ${attackResult.total} vs CA ${target.ac}`;

        if (isHit) {
          const dmg = parseDiceFormula(damageMatch[1]);
          damageTotal = dmg.total;
          chatContent += ` — ACERTOU!\nDano: ${dmg.total} (${dmg.details})`;
          updateTokenHp(target.id, target.hp - dmg.total);
          addDamageFloat(target.id, dmg.total, false, attackResult.isNat20 ?? false);
          setAttackLine({ attackerId: attackerToken.id, targetId: target.id, roll: attackResult.total, damage: dmg.total });
        } else {
          chatContent += ` — ERROU!`;
        }
      } else if (character.spellcasting) {
        const dmg = parseDiceFormula(damageMatch[1]);
        damageTotal = dmg.total;
        chatContent += `\nDano: ${dmg.total} (${dmg.details}) — CD ${character.spellcasting.saveDC}`;
        if (target) {
          updateTokenHp(target.id, target.hp - dmg.total);
          addDamageFloat(target.id, dmg.total, false, false);
        }
      }
    }

    if (spell.level > 0) {
      const slot = character.spellSlots.find((s) => s.level === spell.level);
      if (slot) {
        chatContent += `\n[Slot nivel ${spell.level}: ${slot.total - slot.used - 1}/${slot.total} restantes]`;
      }
    }

    addMessage({
      id: `msg_${Date.now()}`,
      channel: "geral",
      type: "roll",
      sender: attackerToken.name,
      senderInitials: attackerToken.name.slice(0, 2).toUpperCase(),
      isGM: false,
      content: chatContent,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      rollFormula: damageMatch?.[1],
      rollResult: damageTotal || undefined,
    });

    useBonusAction();
    setCastBonusSpell(true);
    setResultText(chatContent);
    setStep("result");
  }

  function executeQuickenedSpell(spell: CharacterSpell) {
    // For simplicity, treat like a bonus spell cast
    addCombatLogMessage(
      `${attackerToken.name} usa Magia Acelerada — conjura ${spell.name} como acao bonus! (2 pontos de feiticaria)`,
    );

    // Cast the spell
    const isSelf = spell.range === "Pessoal" || spell.range.startsWith("Pessoal");
    if (isSelf) {
      executeBonusSpell(spell, null);
    } else {
      setSelectedSpell(spell);
      setStep("select-target");
    }
  }

  return (
    <div className="mb-2 w-72 max-h-96 overflow-y-auto rounded-xl border border-brand-border bg-[#16161D] shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-brand-border bg-[#16161D] px-3 py-2">
        {step !== "list" && step !== "result" && (
          <button onClick={() => setStep("list")} className="text-brand-muted hover:text-brand-text">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <Zap className="h-3.5 w-3.5 text-yellow-400" />
        <span className="text-xs font-medium text-brand-text">
          {step === "list" && "Acao Bonus"}
          {step === "select-target" && `${selectedAction?.name ?? selectedSpell?.name} — Alvo`}
          {step === "select-quickened-spell" && "Magia Acelerada — Escolha"}
          {step === "result" && "Resultado"}
        </span>
      </div>

      <div className="py-1">
        {/* Main list */}
        {step === "list" && (
          <>
            {allActions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-brand-muted">
                Nenhuma acao bonus disponivel para este personagem.
              </div>
            ) : (
              <>
                {available.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                      Disponiveis
                    </div>
                    {available.map((action) => (
                      <BonusActionCard
                        key={action.id}
                        action={action}
                        onClick={() => handleActionClick(action)}
                      />
                    ))}
                  </>
                )}

                {unavailable.length > 0 && (
                  <>
                    {available.length > 0 && <div className="mx-2 my-1 h-px bg-brand-border" />}
                    <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted/60">
                      Indisponiveis
                    </div>
                    {unavailable.map((action) => (
                      <BonusActionCard
                        key={action.id}
                        action={action}
                        onClick={() => {}}
                        disabled
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Target selection */}
        {step === "select-target" && (
          <>
            {hostileTargets.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-brand-muted">
                Nenhum alvo disponivel.
              </div>
            ) : (
              hostileTargets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (selectedAction?.id === "offhand-attack") {
                      executeOffhandAttack(t);
                    } else if (selectedSpell) {
                      executeBonusSpell(selectedSpell, t);
                    }
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Crosshair className="h-3.5 w-3.5 shrink-0 text-red-400" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-brand-text">{t.name}</div>
                    <div className="text-[10px] text-brand-muted">
                      HP {t.hp}/{t.maxHp} | CA {t.ac}
                    </div>
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {/* Quickened spell selection */}
        {step === "select-quickened-spell" && (
          <>
            {quickenableSpells.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-brand-muted">
                Nenhuma magia de acao disponivel.
              </div>
            ) : (
              quickenableSpells.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => executeQuickenedSpell(spell)}
                  className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent/70" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-brand-text">{spell.name}</div>
                    <div className="mt-0.5 truncate text-[10px] text-brand-muted/70">
                      Nv.{spell.level} · {spell.range}
                    </div>
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {/* Result */}
        {step === "result" && (
          <div className="px-3 py-3">
            <div className="whitespace-pre-line text-xs text-brand-text">{resultText}</div>
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-lg bg-white/[0.05] py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/[0.08]"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BonusActionCard({
  action,
  onClick,
  disabled,
}: {
  action: BonusActionDef;
  onClick: () => void;
  disabled?: boolean;
}) {
  const IconComponent = ICON_MAP[action.icon] ?? Zap;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-white/[0.05]"
      }`}
    >
      {disabled ? (
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-muted/50" />
      ) : (
        <IconComponent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400/80" />
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${disabled ? "text-brand-muted/60" : "text-brand-text"}`}>
          {action.name}
        </div>
        <div className="mt-0.5 text-[10px] text-brand-muted/70">
          {disabled && action.unavailableReason
            ? action.unavailableReason
            : action.description}
        </div>
        {action.resourceLabel && (
          <div className="mt-0.5 text-[10px] text-brand-muted/50">
            {action.resourceLabel}
          </div>
        )}
      </div>
    </button>
  );
}
