"use client";

// Card resumo de um ataque postado no chat. Renderizado pelo
// MessageBubble quando type="attack". Visual minimalista: header com
// atacante + nome do ataque, lista de alvos com d20/dano/hit-miss.

import { Sword, Target, X, Check, Skull, Zap } from "lucide-react";
import type { AttackChatPayload } from "@/lib/gameplay-mock-data";
import { DAMAGE_TYPE_LABELS } from "@questboard/constants";
import type { DamageModifier } from "@questboard/types";

const MODIFIER_LABEL: Record<Exclude<DamageModifier, "normal">, string> = {
  resist: "metade",
  immune: "imune",
  vuln: "x2",
};

const MODIFIER_CLASS: Record<Exclude<DamageModifier, "normal">, string> = {
  resist: "bg-blue-500/15 text-blue-300",
  immune: "bg-slate-500/15 text-slate-300",
  vuln: "bg-orange-500/15 text-orange-300",
};

interface Props {
  payload: AttackChatPayload;
}

export function AttackResultCard({ payload }: Props) {
  const totalDamage = payload.results.reduce(
    (sum, r) =>
      sum +
      (r.hit ? (r.appliedDamage ?? r.damageTotal ?? 0) : 0),
    0,
  );
  const hits = payload.results.filter((r) => r.hit).length;
  const total = payload.results.length;
  const anyCrit = payload.results.some((r) => r.isCrit);

  return (
    <div className="mt-1 overflow-hidden rounded-md border border-brand-accent/20 bg-brand-accent/[0.04]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-accent/15 bg-brand-accent/[0.06] px-3 py-1.5">
        <Sword className="h-3 w-3 text-brand-accent" />
        <span className="text-[11px] font-semibold text-brand-text">
          {payload.attackName}
        </span>
        <span className="text-[10px] text-brand-muted">·</span>
        <span className="text-[10px] text-brand-muted">
          {DAMAGE_TYPE_LABELS[payload.damageType]}
        </span>
        {anyCrit && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-yellow-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-yellow-300">
            <Zap className="h-2.5 w-2.5" />
            Crit
          </span>
        )}
      </div>

      {/* Lista de alvos */}
      <ul className="divide-y divide-brand-border/40">
        {payload.results.map((r, i) => {
          const targetName = payload.targetNames[i] ?? "Alvo";
          return (
            <li
              key={r.id}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px]"
            >
              <Target className="h-2.5 w-2.5 shrink-0 text-brand-muted" />
              <span className="min-w-0 flex-1 truncate text-brand-text/90">
                {targetName}
              </span>
              {r.isFumble ? (
                <span className="flex items-center gap-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-300">
                  <Skull className="h-2.5 w-2.5" />
                  Fumble
                </span>
              ) : r.hit ? (
                <>
                  <span className="tabular-nums text-brand-muted">
                    d20: {r.d20Final}
                    {r.totalAttack !== r.d20Final && ` (${r.totalAttack})`}
                  </span>
                  {r.damageModifier && r.damageModifier !== "normal" && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${MODIFIER_CLASS[r.damageModifier]}`}
                      title={`Dano ${r.damageTotal} → ${r.appliedDamage} (${MODIFIER_LABEL[r.damageModifier]})`}
                    >
                      {MODIFIER_LABEL[r.damageModifier]}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-300">
                    <Check className="h-2.5 w-2.5" />
                    {r.appliedDamage ?? r.damageTotal} {r.isCrit && "✦"}
                  </span>
                </>
              ) : (
                <>
                  <span className="tabular-nums text-brand-muted">
                    d20: {r.d20Final}
                    {r.totalAttack !== r.d20Final && ` (${r.totalAttack})`}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-brand-muted">
                    <X className="h-2.5 w-2.5" />
                    Errou
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer total */}
      {total > 1 && (
        <div className="flex items-center justify-between border-t border-brand-border/40 bg-black/20 px-3 py-1.5 text-[10px]">
          <span className="text-brand-muted">
            {hits}/{total} acertos
          </span>
          {totalDamage > 0 && (
            <span className="font-semibold tabular-nums text-brand-text">
              Dano total: {totalDamage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
