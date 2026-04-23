"use client";

import { Shield } from "lucide-react";
import type { GameToken } from "@/lib/gameplay-mock-data";
import { Block } from "../block";

interface DefenseBlockProps {
  token: GameToken;
}

const SIZE_LABEL: Record<number, string> = {
  0.5: "Minúsculo",
  1: "Médio",
  2: "Grande",
  3: "Enorme",
  4: "Colossal",
};

export function DefenseBlock({ token }: DefenseBlockProps) {
  const sizeLabel = SIZE_LABEL[token.size] ?? `${token.size}x${token.size}`;
  const initSign = token.initiative >= 0 ? "+" : "";
  const isFlying = token.elevation !== undefined && token.elevation !== null;

  return (
    <Block id="defense" icon={Shield} title="Defesa">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="CA" value={token.ac} />
        <Stat label="Velocidade" value={`${token.speed}ft`} />
        <Stat label="Iniciativa" value={`${initSign}${token.initiative}`} />
        <Stat
          label="Tamanho"
          value={sizeLabel}
          hint={isFlying ? `Voando${token.elevation ? ` (${token.elevation}ft)` : ""}` : undefined}
        />
      </div>
    </Block>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-brand-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-brand-text">
        {value}
      </div>
      {hint && (
        <div className="text-[9px] text-brand-accent/80">{hint}</div>
      )}
    </div>
  );
}
