"use client";

import { X, Zap } from "lucide-react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { ALL_CONDITIONS } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { Block } from "../block";

interface ConditionsBlockProps {
  token: GameToken;
  canEdit: boolean;
}

function getConditionLabel(key: string): string {
  return ALL_CONDITIONS.find((c) => c.key === key)?.label ?? key;
}

export function ConditionsBlock({ token, canEdit }: ConditionsBlockProps) {
  const toggleTokenCondition = useGameplayStore((s) => s.toggleTokenCondition);
  const count = token.conditions.length;

  return (
    <Block
      id="conditions"
      icon={Zap}
      title="Condições"
      badge={
        count > 0 ? (
          <span className="rounded-full bg-brand-warning/15 px-1.5 py-0.5 text-[9px] tabular-nums text-brand-warning">
            {count}
          </span>
        ) : null
      }
    >
      {count === 0 ? (
        <p className="text-[11px] text-brand-muted">Nenhuma condição ativa.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {token.conditions.map((cond) => (
            <span
              key={cond}
              className="flex items-center gap-1 rounded-md bg-brand-warning/15 px-2 py-0.5 text-[11px] font-medium text-brand-warning"
            >
              {getConditionLabel(cond)}
              {canEdit && (
                <button
                  onClick={() => toggleTokenCondition(token.id, cond)}
                  className="ml-0.5 flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full hover:bg-brand-warning/25"
                  title="Remover"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {canEdit && (
        <p className="mt-2 text-[9px] text-brand-muted/70">
          Para adicionar, use o menu contextual do token (tecla C).
        </p>
      )}
    </Block>
  );
}
