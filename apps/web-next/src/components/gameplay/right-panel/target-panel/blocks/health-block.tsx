"use client";

import { useState } from "react";
import { Heart, Plus, Pencil } from "lucide-react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { HPBar } from "../../../shared/hp-bar";
import { Block } from "../block";

interface HealthBlockProps {
  token: GameToken;
  /** PLAYER não-dono só vê HP; dano/cura exigem permissão. */
  canEditHp: boolean;
}

export function HealthBlock({ token, canEditHp }: HealthBlockProps) {
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const setHpAdjustTarget = useGameplayStore((s) => s.setHpAdjustTarget);
  const openModal = useGameplayStore((s) => s.openModal);
  const [healPopover, setHealPopover] = useState(false);
  const [healAmount, setHealAmount] = useState(1);

  function applyDamage(amount: number) {
    const next = Math.max(0, token.hp - amount);
    updateTokenHp(token.id, next);
  }

  function applyHeal() {
    const next = Math.min(token.maxHp, token.hp + healAmount);
    updateTokenHp(token.id, next);
    setHealPopover(false);
    setHealAmount(1);
  }

  function openAbsoluteAdjust() {
    setHpAdjustTarget(token.id);
    openModal("hpAdjust");
  }

  return (
    <Block id="health" icon={Heart} title="Vida">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-brand-text">
          {token.hp}
        </span>
        <span className="text-sm text-brand-muted">/ {token.maxHp}</span>
      </div>
      <HPBar
        hp={token.hp}
        maxHp={token.maxHp}
        height={6}
        className="mt-1.5"
      />

      {canEditHp && (
        <>
          {/* Dano rápido */}
          <div className="mt-3 flex items-center gap-1">
            {[1, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => applyDamage(n)}
                className="flex-1 cursor-pointer rounded-md border border-brand-border bg-brand-primary py-1 text-[11px] font-semibold text-brand-danger transition-colors hover:border-brand-danger/40 hover:bg-brand-danger/10"
                title={`Aplicar ${n} de dano`}
              >
                −{n}
              </button>
            ))}
            <button
              onClick={() => setHealPopover((v) => !v)}
              className="flex-1 cursor-pointer rounded-md border border-brand-border bg-brand-primary py-1 text-[11px] font-semibold text-brand-success transition-colors hover:border-brand-success/40 hover:bg-brand-success/10"
              title="Aplicar cura"
            >
              +cura
            </button>
          </div>

          {/* Popover simples de cura */}
          {healPopover && (
            <div className="mt-2 flex items-center gap-1 rounded-md border border-brand-border bg-[#0A0A0F] p-1.5">
              <input
                type="number"
                min={1}
                max={9999}
                value={healAmount}
                onChange={(e) => setHealAmount(Math.max(1, Number(e.target.value) || 1))}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyHeal();
                  if (e.key === "Escape") setHealPopover(false);
                }}
                className="w-full rounded-sm bg-transparent px-1.5 py-0.5 text-xs text-brand-text outline-none"
              />
              <button
                onClick={applyHeal}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm bg-brand-success/20 text-brand-success transition-colors hover:bg-brand-success/30"
                title="Confirmar cura"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            onClick={openAbsoluteAdjust}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-brand-border py-1 text-[11px] text-brand-muted transition-colors hover:bg-white/[0.03] hover:text-brand-text"
          >
            <Pencil className="h-3 w-3" />
            Ajustar HP
          </button>
        </>
      )}
    </Block>
  );
}
