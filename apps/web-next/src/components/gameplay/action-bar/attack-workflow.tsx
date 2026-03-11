"use client";

import { useState } from "react";
import { ArrowLeft, Crosshair, Swords } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { rollD20, parseDiceFormula } from "@/lib/dice";
import type { FullCharacter, InventoryItem } from "@/lib/character-types";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { playSFX } from "@/lib/audio/sfx-triggers";

interface AttackWorkflowProps {
  character: FullCharacter;
  attackerToken: GameToken;
  onClose: () => void;
}

type Step = "select-weapon" | "select-target" | "result";

interface AttackResult {
  weapon: InventoryItem;
  targetName: string;
  attackRoll: number;
  attackDetails: string;
  isHit: boolean;
  isCrit: boolean;
  isFumble: boolean;
  damageTotal: number;
  damageDetails: string;
  targetAC: number;
}

export function AttackWorkflow({ character, attackerToken, onClose }: AttackWorkflowProps) {
  const tokens = useGameplayStore((s) => s.tokens);
  const useAction = useGameplayStore((s) => s.useAction);
  const setAttackedThisTurn = useGameplayStore((s) => s.setAttackedThisTurn);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const setAttackLine = useGameplayStore((s) => s.setAttackLine);
  const addDamageFloat = useGameplayStore((s) => s.addDamageFloat);
  const addMessage = useGameplayStore((s) => s.addMessage);

  const [step, setStep] = useState<Step>("select-weapon");
  const [selectedWeapon, setSelectedWeapon] = useState<InventoryItem | null>(null);
  const [result, setResult] = useState<AttackResult | null>(null);

  // Get equipped weapons
  const weapons = character.inventory.filter(
    (item) => item.category === "weapon" && item.equipped,
  );

  // Also include spellcasting attacks (cantrip-based) via the weapon list
  // For now, just show equipped weapons

  // Get hostile tokens on map as potential targets
  const targets = tokens.filter(
    (t) =>
      t.onMap &&
      t.id !== attackerToken.id &&
      t.hp > 0 &&
      (t.alignment === "hostile" || t.alignment === "neutral"),
  );

  function selectWeapon(weapon: InventoryItem) {
    setSelectedWeapon(weapon);
    setStep("select-target");
  }

  function selectTarget(target: GameToken) {
    if (!selectedWeapon) return;

    const attackBonus = selectedWeapon.attackBonus ?? 0;
    const attackResult = rollD20(attackBonus);
    const isCrit = attackResult.isNat20 ?? false;
    const isFumble = attackResult.isNat1 ?? false;
    const isHit = isCrit || (!isFumble && attackResult.total >= target.ac);

    let damageTotal = 0;
    let damageDetails = "";

    if (isHit && selectedWeapon.damage) {
      // Parse damage string like "1d8+3 cortante"
      const damageFormula = selectedWeapon.damage.split(" ")[0]; // "1d8+3"
      const dmg = parseDiceFormula(damageFormula);

      if (isCrit) {
        // Crit: roll damage dice twice (not modifier)
        const match = damageFormula.match(/^(\d+)d(\d+)([+-]\d+)?$/);
        if (match) {
          const count = parseInt(match[1], 10);
          const sides = parseInt(match[2], 10);
          const mod = match[3] ? parseInt(match[3], 10) : 0;
          const critDmg = parseDiceFormula(`${count * 2}d${sides}+${mod}`);
          damageTotal = critDmg.total;
          damageDetails = critDmg.details;
        } else {
          damageTotal = dmg.total;
          damageDetails = dmg.details;
        }
      } else {
        damageTotal = dmg.total;
        damageDetails = dmg.details;
      }
    }

    // SFX
    playSFX("dice:roll");
    if (isCrit) playSFX("dice:nat20");
    else if (isFumble) playSFX("dice:nat1");

    if (isHit) {
      playSFX("combat:attack_hit_melee");
      if (damageTotal > 0) playSFX("combat:take_damage");
    } else {
      playSFX("combat:attack_miss_melee");
    }

    // Apply damage
    if (isHit && damageTotal > 0) {
      const newHp = target.hp - damageTotal;
      updateTokenHp(target.id, newHp);
      addDamageFloat(target.id, damageTotal, false, isCrit);
      if (newHp <= 0) playSFX("combat:creature_death");
    }

    // Set attack line
    setAttackLine({
      attackerId: attackerToken.id,
      targetId: target.id,
      roll: attackResult.total,
      damage: isHit ? damageTotal : null,
    });

    // Log to chat
    const damageType = selectedWeapon.damage?.split(" ").slice(1).join(" ") ?? "";
    const hitLabel = isCrit
      ? "CRITICO!"
      : isFumble
        ? "FALHA CRITICA!"
        : isHit
          ? "ACERTOU!"
          : "ERROU!";
    const attackDetails = `d20[${attackResult.rolls[0]}]${attackBonus >= 0 ? "+" : ""}${attackBonus}`;

    let chatContent = `${attackerToken.name} ataca ${target.name} com ${selectedWeapon.name}\n`;
    chatContent += `Ataque: ${attackResult.total} (${attackDetails}) vs CA ${target.ac} — ${hitLabel}`;
    if (isHit && damageTotal > 0) {
      chatContent += `\nDano: ${damageTotal} (${damageDetails}) ${damageType}`;
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

    useAction();
    setAttackedThisTurn(true);

    setResult({
      weapon: selectedWeapon,
      targetName: target.name,
      attackRoll: attackResult.total,
      attackDetails,
      isHit,
      isCrit,
      isFumble,
      damageTotal,
      damageDetails,
      targetAC: target.ac,
    });
    setStep("result");
  }

  return (
    <div className="mb-2 w-72 rounded-xl border border-brand-border bg-[#16161D] shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-border px-3 py-2">
        {step !== "select-weapon" && (
          <button
            onClick={() => {
              if (step === "result") {
                onClose();
              } else {
                setStep("select-weapon");
              }
            }}
            className="text-brand-muted hover:text-brand-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <Swords className="h-3.5 w-3.5 text-brand-accent" />
        <span className="text-xs font-medium text-brand-text">
          {step === "select-weapon" && "Escolha uma arma"}
          {step === "select-target" && "Selecione o alvo"}
          {step === "result" && "Resultado"}
        </span>
      </div>

      {/* Content */}
      <div className="py-1">
        {step === "select-weapon" && (
          <>
            {weapons.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-brand-muted">
                Nenhuma arma equipada.
              </div>
            ) : (
              weapons.map((w) => (
                <button
                  key={w.id}
                  onClick={() => selectWeapon(w)}
                  className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Swords className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-muted" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-brand-text">{w.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-brand-muted">
                      <span>{w.damage}</span>
                      {w.attackBonus !== undefined && (
                        <span>+{w.attackBonus} ataque</span>
                      )}
                    </div>
                    {w.properties && w.properties.length > 0 && (
                      <div className="mt-0.5 text-[10px] text-brand-muted/60">
                        {w.properties.join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {step === "select-target" && (
          <>
            {targets.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-brand-muted">
                Nenhum alvo disponivel no mapa.
              </div>
            ) : (
              targets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTarget(t)}
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

        {step === "result" && result && (
          <div className="px-3 py-3">
            <div className="mb-2 text-center">
              <div
                className={`text-sm font-bold ${
                  result.isCrit
                    ? "text-yellow-400"
                    : result.isFumble
                      ? "text-red-400"
                      : result.isHit
                        ? "text-green-400"
                        : "text-brand-muted"
                }`}
              >
                {result.isCrit
                  ? "CRITICO!"
                  : result.isFumble
                    ? "FALHA CRITICA!"
                    : result.isHit
                      ? "ACERTOU!"
                      : "ERROU!"}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-muted">Arma</span>
                <span className="text-brand-text">{result.weapon.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Alvo</span>
                <span className="text-brand-text">{result.targetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">Ataque</span>
                <span className="text-brand-text">
                  {result.attackRoll} ({result.attackDetails}) vs CA {result.targetAC}
                </span>
              </div>
              {result.isHit && (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Dano</span>
                  <span className="font-medium text-red-400">
                    {result.damageTotal} ({result.damageDetails})
                  </span>
                </div>
              )}
            </div>

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
