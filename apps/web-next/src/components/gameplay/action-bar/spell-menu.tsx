"use client";

import { useState } from "react";
import { ArrowLeft, Crosshair, Sparkles, Wand2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { rollD20, parseDiceFormula } from "@/lib/dice";
import type { FullCharacter, CharacterSpell } from "@/lib/character-types";
import type { GameToken } from "@/lib/gameplay-mock-data";

interface SpellMenuProps {
  character: FullCharacter;
  attackerToken: GameToken;
  onClose: () => void;
}

type Step = "select-spell" | "select-target" | "result";

export function SpellMenu({ character, attackerToken, onClose }: SpellMenuProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const turnActions = useGameplayStore((s) => s.turnActions);
  const useAction = useGameplayStore((s) => s.useAction);
  const useBonusAction = useGameplayStore((s) => s.useBonusAction);
  const addMessage = useGameplayStore((s) => s.addMessage);
  const addDamageFloat = useGameplayStore((s) => s.addDamageFloat);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const setAttackLine = useGameplayStore((s) => s.setAttackLine);

  const [step, setStep] = useState<Step>("select-spell");
  const [selectedSpell, setSelectedSpell] = useState<CharacterSpell | null>(null);
  const [resultText, setResultText] = useState("");

  // If a bonus action spell was cast this turn, only cantrips are allowed
  const cantripOnly = turnActions.castBonusSpell;

  // Group spells by level
  const spellsByLevel = new Map<number, CharacterSpell[]>();
  for (const spell of character.spells) {
    if (!spell.prepared) continue;
    if (cantripOnly && spell.level > 0) continue;
    const existing = spellsByLevel.get(spell.level) ?? [];
    existing.push(spell);
    spellsByLevel.set(spell.level, existing);
  }
  const sortedLevels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b);

  // Get slot info
  function getSlotInfo(level: number): { total: number; used: number } | null {
    if (level === 0) return null; // cantrips
    const slot = character.spellSlots.find((s) => s.level === level);
    return slot ?? null;
  }

  // Check if we can cast a given spell level
  function canCast(level: number): boolean {
    if (level === 0) return true;
    const slot = getSlotInfo(level);
    if (!slot) return false;
    return slot.used < slot.total;
  }

  // Potential targets
  const hostileTargets = tokens.filter(
    (t) => t.onMap && t.id !== attackerToken.id && t.hp > 0 && t.alignment === "hostile",
  );

  function handleSelectSpell(spell: CharacterSpell) {
    if (!canCast(spell.level)) return;
    setSelectedSpell(spell);

    // Check if spell needs a target or is self/area
    const isSelf = spell.range === "Pessoal" || spell.range.startsWith("Pessoal");
    const isBonusAction = spell.castingTime.toLowerCase().includes("bônus") || spell.castingTime.toLowerCase().includes("bonus");

    if (isSelf) {
      // Cast immediately
      castSpell(spell, null, isBonusAction);
    } else {
      setStep("select-target");
    }
  }

  function castSpell(spell: CharacterSpell, target: GameToken | null, isBonusAction: boolean) {
    // Consume slot
    // (In a real app we'd update spellSlots; for mock data we just log it)

    // Use action or bonus action
    if (isBonusAction) {
      useBonusAction();
    } else {
      useAction();
    }

    const targetName = target?.name ?? "area";
    let chatContent = `${attackerToken.name} conjura ${spell.name}`;
    if (target) chatContent += ` em ${target.name}`;
    chatContent += `!`;

    // Check if spell has damage in description
    const damageMatch = spell.description.match(/(\d+d\d+)/);
    let damageTotal = 0;

    if (damageMatch && target) {
      // Spell attack or save-based damage
      const isSpellAttack = spell.description.includes("Ataque") || spell.description.includes("ataque");

      if (isSpellAttack && character.spellcasting) {
        // Roll spell attack
        const attackResult = rollD20(character.spellcasting.attackBonus);
        const isHit = (attackResult.isNat20 ?? false) || attackResult.total >= target.ac;
        const attackDetails = `d20[${attackResult.rolls[0]}]+${character.spellcasting.attackBonus}`;

        chatContent += `\nAtaque: ${attackResult.total} (${attackDetails}) vs CA ${target.ac}`;

        if (isHit) {
          const dmg = parseDiceFormula(damageMatch[1]);
          damageTotal = dmg.total;
          chatContent += ` — ACERTOU!\nDano: ${dmg.total} (${dmg.details})`;

          updateTokenHp(target.id, target.hp - dmg.total);
          addDamageFloat(target.id, dmg.total, false, attackResult.isNat20 ?? false);
          setAttackLine({
            attackerId: attackerToken.id,
            targetId: target.id,
            roll: attackResult.total,
            damage: dmg.total,
          });
        } else {
          chatContent += ` — ERROU!`;
          setAttackLine({
            attackerId: attackerToken.id,
            targetId: target.id,
            roll: attackResult.total,
            damage: null,
          });
        }
      } else if (character.spellcasting) {
        // Save-based: auto-hit, target saves for half
        const dmg = parseDiceFormula(damageMatch[1]);
        damageTotal = dmg.total;
        chatContent += `\nDano: ${dmg.total} (${dmg.details}) — CD ${character.spellcasting.saveDC}`;

        updateTokenHp(target.id, target.hp - dmg.total);
        addDamageFloat(target.id, dmg.total, false, false);
        setAttackLine({
          attackerId: attackerToken.id,
          targetId: target.id,
          roll: null,
          damage: dmg.total,
        });
      }
    }

    // Slot info
    if (spell.level > 0) {
      const slot = getSlotInfo(spell.level);
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

    setResultText(chatContent);
    setStep("result");
  }

  return (
    <div className="mb-2 w-72 max-h-96 overflow-y-auto rounded-xl border border-brand-border bg-[#16161D] shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-brand-border bg-[#16161D] px-3 py-2">
        {step !== "select-spell" && step !== "result" && (
          <button onClick={() => setStep("select-spell")} className="text-brand-muted hover:text-brand-text">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <Wand2 className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-xs font-medium text-brand-text">
          {step === "select-spell" && (cantripOnly ? "Apenas cantrips (bonus spell usado)" : "Escolha uma magia")}
          {step === "select-target" && `${selectedSpell?.name} — Alvo`}
          {step === "result" && "Resultado"}
        </span>
      </div>

      <div className="py-1">
        {step === "select-spell" && (
          <>
            {sortedLevels.map((level) => {
              const spells = spellsByLevel.get(level) ?? [];
              const slotInfo = getSlotInfo(level);
              const available = canCast(level);

              return (
                <div key={level}>
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                      {level === 0 ? "Cantrips" : `Nivel ${level}`}
                    </span>
                    {slotInfo && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: slotInfo.total }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${
                              i < slotInfo.total - slotInfo.used
                                ? "bg-brand-accent"
                                : "bg-brand-border"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {spells.map((spell) => (
                    <button
                      key={spell.id}
                      onClick={() => handleSelectSpell(spell)}
                      disabled={!available}
                      className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
                        available
                          ? "hover:bg-white/[0.05]"
                          : "cursor-not-allowed opacity-40"
                      }`}
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent/70" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-brand-text">{spell.name}</div>
                        <div className="mt-0.5 truncate text-[10px] text-brand-muted/70">
                          {spell.castingTime} | {spell.range}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </>
        )}

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
                    if (selectedSpell) {
                      const isBonusAction = selectedSpell.castingTime.toLowerCase().includes("bônus") || selectedSpell.castingTime.toLowerCase().includes("bonus");
                      castSpell(selectedSpell, t, isBonusAction);
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
