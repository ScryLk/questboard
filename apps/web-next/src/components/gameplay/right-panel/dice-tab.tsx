"use client";

import { useCallback, useState } from "react";
import { Dices, Eye, EyeOff } from "lucide-react";
import type { DieType } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";

const DICE: { type: DieType; sides: number; label: string }[] = [
  { type: "d4", sides: 4, label: "D4" },
  { type: "d6", sides: 6, label: "D6" },
  { type: "d8", sides: 8, label: "D8" },
  { type: "d10", sides: 10, label: "D10" },
  { type: "d12", sides: 12, label: "D12" },
  { type: "d20", sides: 20, label: "D20" },
  { type: "d100", sides: 100, label: "D100" },
];

interface RollHistoryItem {
  id: string;
  formula: string;
  result: number;
  details: string;
  secret: boolean;
  timestamp: string;
}

export function DiceTab() {
  const addMessage = useGameplayStore((s) => s.addMessage);
  const [history, setHistory] = useState<RollHistoryItem[]>([]);
  const [secret, setSecret] = useState(false);

  // Custom roll
  const [customQty, setCustomQty] = useState("1");
  const [customDie, setCustomDie] = useState("20");
  const [customMod, setCustomMod] = useState("");

  const rollDie = useCallback(
    (sides: number, qty = 1, mod = 0) => {
      const rolls: number[] = [];
      for (let i = 0; i < qty; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
      const sum = rolls.reduce((a, b) => a + b, 0) + mod;
      const formula = `${qty}d${sides}${mod > 0 ? `+${mod}` : mod < 0 ? mod : ""}`;
      const details = rolls.join("+") + (mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : "");

      const entry: RollHistoryItem = {
        id: `roll_${Date.now()}`,
        formula,
        result: sum,
        details,
        secret,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 20));

      if (!secret) {
        addMessage({
          id: `msg_${Date.now()}`,
          channel: "geral",
          type: "roll",
          sender: "GM",
          senderInitials: "GM",
          isGM: true,
          content: `Rolou ${formula}`,
          timestamp: entry.timestamp,
          rollFormula: formula,
          rollResult: sum,
          rollDetails: details,
          isNat20: qty === 1 && sides === 20 && rolls[0] === 20,
          isNat1: qty === 1 && sides === 20 && rolls[0] === 1,
        });
      }
    },
    [secret, addMessage],
  );

  const handleCustomRoll = useCallback(() => {
    const qty = parseInt(customQty) || 1;
    const die = parseInt(customDie) || 20;
    const mod = parseInt(customMod) || 0;
    rollDie(die, qty, mod);
  }, [customQty, customDie, customMod, rollDie]);

  return (
    <div className="flex h-full flex-col">
      {/* Dice grid */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {DICE.map(({ type, sides, label }) => (
          <button
            key={type}
            onClick={() => rollDie(sides)}
            className="flex h-12 flex-col items-center justify-center rounded-lg border border-brand-border bg-brand-primary text-brand-text transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/10 active:scale-95"
          >
            <Dices className="mb-0.5 h-4 w-4 text-brand-accent" />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        ))}

        {/* Secret toggle */}
        <button
          onClick={() => setSecret((s) => !s)}
          className={`flex h-12 flex-col items-center justify-center rounded-lg border transition-colors ${
            secret
              ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
              : "border-brand-border bg-brand-primary text-brand-muted hover:text-brand-text"
          }`}
        >
          {secret ? (
            <EyeOff className="mb-0.5 h-4 w-4" />
          ) : (
            <Eye className="mb-0.5 h-4 w-4" />
          )}
          <span className="text-[10px] font-bold">
            {secret ? "Oculto" : "Visivel"}
          </span>
        </button>
      </div>

      {/* Custom roll */}
      <div className="border-t border-brand-border px-3 py-2">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Personalizado
        </p>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={customQty}
            onChange={(e) => setCustomQty(e.target.value)}
            min={1}
            max={20}
            className="w-10 rounded border border-brand-border bg-brand-primary px-1.5 py-1 text-center text-xs text-brand-text outline-none focus:border-brand-accent/40"
          />
          <span className="text-xs text-brand-muted">d</span>
          <input
            type="number"
            value={customDie}
            onChange={(e) => setCustomDie(e.target.value)}
            min={2}
            className="w-12 rounded border border-brand-border bg-brand-primary px-1.5 py-1 text-center text-xs text-brand-text outline-none focus:border-brand-accent/40"
          />
          <span className="text-xs text-brand-muted">+</span>
          <input
            type="text"
            value={customMod}
            onChange={(e) => setCustomMod(e.target.value)}
            placeholder="0"
            className="w-10 rounded border border-brand-border bg-brand-primary px-1.5 py-1 text-center text-xs text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
          <button
            onClick={handleCustomRoll}
            className="rounded bg-brand-accent px-3 py-1 text-xs font-medium text-white hover:bg-brand-accent-hover"
          >
            Rolar
          </button>
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto border-t border-brand-border px-3 py-2">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Historico
        </p>
        {history.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-brand-muted">
            Nenhuma rolagem ainda
          </p>
        ) : (
          history.map((roll) => (
            <div
              key={roll.id}
              className="mb-1.5 flex items-center gap-2 rounded-md bg-white/[0.03] px-2.5 py-1.5"
            >
              <span className="text-lg font-bold tabular-nums text-brand-text">
                {roll.result}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium text-brand-muted">
                  {roll.formula}
                </span>
                <span className="ml-1.5 text-[10px] text-brand-muted/60">
                  ({roll.details})
                </span>
              </div>
              {roll.secret && (
                <EyeOff className="h-3 w-3 shrink-0 text-brand-accent" />
              )}
              <span className="shrink-0 text-[10px] text-brand-muted/50">
                {roll.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
