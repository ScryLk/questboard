"use client";

import { useState } from "react";
import { Heart, Minus, Plus, Shield } from "lucide-react";
import { getAlignmentColor, getHpPercent, getHpColor } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { playSFX } from "@/lib/audio/sfx-triggers";
import { ModalShell } from "./modal-shell";

interface HpAdjustModalProps {
  onClose: () => void;
}

export function HpAdjustModal({ onClose }: HpAdjustModalProps) {
  const targetId = useGameplayStore((s) => s.hpAdjustTargetId);
  const tokens = useGameplayStore((s) => s.tokens);
  const updateTokenHp = useGameplayStore((s) => s.updateTokenHp);
  const addDamageFloat = useGameplayStore((s) => s.addDamageFloat);

  const token = tokens.find((t) => t.id === targetId);
  const [amount, setAmount] = useState("0");
  const [mode, setMode] = useState<"damage" | "heal">("damage");

  if (!token) return null;

  const color = getAlignmentColor(token.alignment);
  const hpPct = getHpPercent(token.hp, token.maxHp);
  const hpColor = getHpColor(hpPct);
  const num = parseInt(amount) || 0;
  const previewHp =
    mode === "damage"
      ? Math.max(0, token.hp - num)
      : Math.min(token.maxHp, token.hp + num);

  function apply() {
    if (num <= 0) { onClose(); return; }
    updateTokenHp(token!.id, previewHp);
    addDamageFloat(token!.id, num, mode === "heal", false);
    if (mode === "heal") {
      playSFX("combat:heal");
    } else {
      playSFX("combat:take_damage");
      if (previewHp <= 0) playSFX("combat:creature_death");
    }
    onClose();
  }

  return (
    <ModalShell title={`Ajustar HP — ${token.name}`} maxWidth={360} onClose={onClose}>
      {/* Token header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: color + "25", color, border: `2px solid ${color}` }}
        >
          {token.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-text">{token.name}</p>
          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" style={{ color: hpColor }} />
              {token.hp}/{token.maxHp}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-brand-info" />
              CA {token.ac}
            </span>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-4 flex rounded-lg bg-brand-primary p-1">
        <button
          onClick={() => setMode("damage")}
          className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
            mode === "damage"
              ? "bg-brand-danger/20 text-brand-danger"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          <Minus className="mx-auto mb-0.5 h-3.5 w-3.5" />
          Dano
        </button>
        <button
          onClick={() => setMode("heal")}
          className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
            mode === "heal"
              ? "bg-green-500/20 text-green-400"
              : "text-brand-muted hover:text-brand-text"
          }`}
        >
          <Plus className="mx-auto mb-0.5 h-3.5 w-3.5" />
          Cura
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Quantidade
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAmount(String(Math.max(0, num - 1)))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-muted hover:bg-white/5"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-brand-border bg-brand-primary text-center text-lg font-bold tabular-nums text-brand-text focus:border-brand-accent focus:outline-none"
            min={0}
          />
          <button
            onClick={() => setAmount(String(num + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-muted hover:bg-white/5"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {/* Quick amounts */}
        <div className="mt-2 flex gap-1.5">
          {[1, 5, 10, 20].map((n) => (
            <button
              key={n}
              onClick={() => setAmount(String(n))}
              className="flex-1 rounded-md border border-brand-border py-1 text-[11px] font-medium text-brand-muted hover:bg-white/5 hover:text-brand-text"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4 rounded-lg bg-[#0A0A0F] p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-muted">HP Atual:</span>
          <span className="tabular-nums text-brand-text">{token.hp}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-brand-muted">
            {mode === "damage" ? "Dano:" : "Cura:"}
          </span>
          <span
            className="tabular-nums font-medium"
            style={{ color: mode === "damage" ? "#FF6B6B" : "#00B894" }}
          >
            {mode === "damage" ? "-" : "+"}
            {num}
          </span>
        </div>
        <div className="mx-0 my-1.5 h-px bg-brand-border" />
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-brand-text">HP Resultado:</span>
          <span className="text-sm font-bold tabular-nums text-brand-text">
            {previewHp}
            <span className="text-brand-muted">/{token.maxHp}</span>
          </span>
        </div>
        {/* HP bar preview */}
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(previewHp / token.maxHp) * 100}%`,
              backgroundColor: getHpColor((previewHp / token.maxHp) * 100),
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 rounded-lg border border-brand-border px-4 text-xs font-medium text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
        >
          Cancelar
        </button>
        <button
          onClick={apply}
          className={`h-9 rounded-lg px-4 text-xs font-medium text-white transition-colors ${
            mode === "damage"
              ? "bg-brand-danger hover:bg-brand-danger/90"
              : "bg-green-600 hover:bg-green-600/90"
          }`}
        >
          Aplicar {mode === "damage" ? "Dano" : "Cura"}
        </button>
      </div>
    </ModalShell>
  );
}
