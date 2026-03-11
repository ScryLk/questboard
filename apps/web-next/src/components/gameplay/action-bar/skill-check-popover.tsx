"use client";

import { useState } from "react";
import { Dices } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { rollD20 } from "@/lib/dice";
import { playSFX } from "@/lib/audio/sfx-triggers";
import type { FullCharacter } from "@/lib/character-types";

interface SkillCheckPopoverProps {
  character: FullCharacter;
  tokenName: string;
  onClose: () => void;
}

type RollMode = "normal" | "advantage" | "disadvantage";

export function SkillCheckPopover({ character, tokenName, onClose }: SkillCheckPopoverProps) {
  const addMessage = useGameplayStore((s) => s.addMessage);
  const [mode, setMode] = useState<RollMode>("normal");

  function rollSkill(skillName: string, modifier: number) {
    const result = rollD20(
      modifier,
      mode === "advantage",
      mode === "disadvantage",
    );

    // SFX
    if (result.isNat20) playSFX("dice:nat20");
    else if (result.isNat1) playSFX("dice:nat1");
    else playSFX("dice:roll");

    addMessage({
      id: `msg_${Date.now()}`,
      channel: "geral",
      type: "roll",
      sender: tokenName,
      senderInitials: tokenName.slice(0, 2).toUpperCase(),
      isGM: false,
      content: `${tokenName} rola ${skillName}${mode !== "normal" ? ` (${mode === "advantage" ? "vantagem" : "desvantagem"})` : ""}.`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      rollFormula: result.formula,
      rollResult: result.total,
      rollDetails: result.details,
      isNat20: result.isNat20,
      isNat1: result.isNat1,
    });

    onClose();
  }

  return (
    <div className="mb-2 w-64 max-h-[400px] overflow-y-auto rounded-xl border border-brand-border bg-[#16161D] shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-brand-border bg-[#16161D] px-3 py-2">
        <div className="flex items-center gap-2">
          <Dices className="h-3.5 w-3.5 text-brand-accent" />
          <span className="text-xs font-medium text-brand-text">Teste de Habilidade</span>
        </div>

        {/* Roll mode selector */}
        <div className="mt-2 flex gap-1">
          {(["normal", "advantage", "disadvantage"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded px-2 py-1 text-[10px] transition-colors ${
                mode === m
                  ? "bg-brand-accent/20 text-brand-accent"
                  : "text-brand-muted hover:bg-white/[0.05]"
              }`}
            >
              {m === "normal" ? "Normal" : m === "advantage" ? "Vantagem" : "Desvantagem"}
            </button>
          ))}
        </div>
      </div>

      {/* Skills list */}
      <div className="py-1">
        {character.skills.map((skill) => (
          <button
            key={skill.name}
            onClick={() => rollSkill(skill.name, skill.modifier)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  skill.proficiency === "expertise"
                    ? "bg-yellow-400"
                    : skill.proficiency === "proficient"
                      ? "bg-brand-accent"
                      : "bg-brand-border"
                }`}
              />
              <span className="text-xs text-brand-text">{skill.name}</span>
            </div>
            <span
              className={`text-xs font-mono ${
                skill.modifier >= 0 ? "text-green-400/80" : "text-red-400/80"
              }`}
            >
              {skill.modifier >= 0 ? "+" : ""}
              {skill.modifier}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
