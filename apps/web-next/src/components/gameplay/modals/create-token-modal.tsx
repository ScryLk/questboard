"use client";

import { useState } from "react";
import type { TokenAlignment } from "@/lib/gameplay-mock-data";
import { getAlignmentColor } from "@/lib/gameplay-mock-data";
import { useGameplayStore } from "@/lib/gameplay-store";
import { ModalShell } from "./modal-shell";

interface CreateTokenModalProps {
  onClose: () => void;
}

const ALIGNMENTS: { key: TokenAlignment; label: string }[] = [
  { key: "hostile", label: "Hostil" },
  { key: "neutral", label: "Neutro" },
  { key: "ally", label: "Aliado" },
  { key: "player", label: "Jogador" },
];

const SIZES = [
  { value: 1, label: "Pequeno/Medio (1x1)" },
  { value: 2, label: "Grande (2x2)" },
  { value: 3, label: "Enorme (3x3)" },
  { value: 4, label: "Colossal (4x4)" },
];

export function CreateTokenModal({ onClose }: CreateTokenModalProps) {
  const [name, setName] = useState("");
  const [hp, setHp] = useState("10");
  const [ac, setAc] = useState("12");
  const [alignment, setAlignment] = useState<TokenAlignment>("hostile");
  const [size, setSize] = useState(1);
  const [qty, setQty] = useState("1");

  const addToken = useGameplayStore((s) => s.addToken);
  const addToast = useGameplayStore((s) => s.addToast);
  const getViewportCenter = useGameplayStore((s) => s.getViewportCenter);

  const color = getAlignmentColor(alignment);

  return (
    <ModalShell title="Criar Token" maxWidth={400} onClose={onClose}>
      {/* Preview */}
      <div className="mb-4 flex justify-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold"
          style={{
            backgroundColor: color + "25",
            border: `2px solid ${color}`,
            color,
          }}
        >
          {name ? name.slice(0, 2).toUpperCase() : "??"}
        </div>
      </div>

      {/* Name */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Goblin Arqueiro"
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text placeholder:text-brand-muted/60 focus:border-brand-accent focus:outline-none"
        />
      </div>

      {/* HP + AC */}
      <div className="mb-3 flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            HP
          </label>
          <input
            type="number"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
            CA
          </label>
          <input
            type="number"
            value={ac}
            onChange={(e) => setAc(e.target.value)}
            className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Disposicao
        </label>
        <div className="flex gap-2">
          {ALIGNMENTS.map(({ key, label }) => {
            const c = getAlignmentColor(key);
            const active = alignment === key;
            return (
              <button
                key={key}
                onClick={() => setAlignment(key)}
                className={`flex-1 rounded-lg border py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "border-transparent text-white"
                    : "border-brand-border text-brand-muted hover:text-brand-text"
                }`}
                style={
                  active
                    ? { backgroundColor: c + "30", color: c, borderColor: c }
                    : undefined
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Tamanho
        </label>
        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="h-9 w-full rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
        >
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="mb-5">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-brand-muted">
          Quantidade
        </label>
        <input
          type="number"
          min={1}
          max={20}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="h-9 w-20 rounded-lg border border-brand-border bg-brand-primary px-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none"
        />
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
          onClick={() => {
            if (!name.trim()) return;
            const center = getViewportCenter();
            const count = Math.max(1, Math.min(20, parseInt(qty) || 1));
            for (let i = 0; i < count; i++) {
              const gridSize = size;
              const offsetX = count > 1 ? (i % Math.ceil(Math.sqrt(count))) * gridSize : 0;
              const offsetY = count > 1 ? Math.floor(i / Math.ceil(Math.sqrt(count))) * gridSize : 0;
              addToken({
                name: count > 1 ? `${name} ${i + 1}` : name,
                x: center.x + offsetX,
                y: center.y + offsetY,
                alignment,
                hp: parseInt(hp) || 10,
                maxHp: parseInt(hp) || 10,
                ac: parseInt(ac) || 10,
                size,
              });
            }
            addToast(`${name} criado${count > 1 ? ` (x${count})` : ""}`);
            onClose();
          }}
          disabled={!name.trim()}
          className="h-9 rounded-lg bg-brand-accent px-4 text-xs font-medium text-white transition-colors hover:bg-brand-accent/90 disabled:opacity-50"
        >
          Criar Token
        </button>
      </div>
    </ModalShell>
  );
}
