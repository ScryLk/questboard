"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff, Pencil, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { DEFAULT_VISION, VISION_PRESETS } from "@/lib/gameplay-mock-data";
import type { VisionConfig, LightType } from "@/lib/gameplay-mock-data";

export function VisionPanel() {
  const activeTool = useGameplayStore((s) => s.activeTool);
  const tokens = useGameplayStore((s) => s.tokens);
  const tokenVision = useGameplayStore((s) => s.tokenVision);
  const setTokenVision = useGameplayStore((s) => s.setTokenVision);
  const toggleTokenVision = useGameplayStore((s) => s.toggleTokenVision);

  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);

  if (activeTool !== "vision") return null;

  const playerTokens = tokens.filter((t) => t.onMap && t.alignment === "player");

  return (
    <div
      className="absolute left-1/2 z-40 w-72 -translate-x-1/2 rounded-lg border border-brand-border bg-[#16161D] p-3 shadow-2xl"
      style={{ top: 56 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-text">Controle de Visao</span>
        <button
          onClick={() => useGameplayStore.getState().setActiveTool("pointer")}
          className="rounded p-0.5 text-brand-muted hover:text-brand-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info */}
      <p className="mb-3 text-[10px] leading-relaxed text-brand-muted">
        Selecione um token no mapa para ver seu circulo de visao. Aqui voce configura os raios de cada token.
      </p>

      {/* Divider */}
      <div className="mb-3 h-px bg-brand-border" />

      {/* Token Vision List */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-brand-muted">
          Tokens com Visao
        </label>
        <div className="flex flex-col gap-1">
          {playerTokens.map((token) => {
            const config: VisionConfig = tokenVision[token.id] ?? DEFAULT_VISION;
            const isEditing = editingTokenId === token.id;

            return (
              <div key={token.id}>
                <div className="flex items-center gap-2 rounded bg-white/[0.03] px-2 py-1.5">
                  <button
                    onClick={() => toggleTokenVision(token.id)}
                    className="text-brand-muted hover:text-brand-text"
                  >
                    {config.enabled ? (
                      <Eye className="h-3.5 w-3.5 text-brand-accent" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <span className="flex-1 truncate text-[11px] font-medium text-brand-text">
                    {token.name}
                  </span>
                  <span className="text-[10px] tabular-nums text-brand-muted">
                    {config.normal}c
                    {config.darkvision > 0 ? ` +${config.darkvision}dv` : ""}
                  </span>
                  <button
                    onClick={() => setEditingTokenId(isEditing ? null : token.id)}
                    className="text-brand-muted hover:text-brand-text"
                  >
                    {isEditing ? (
                      <ChevronDown className="h-3 w-3 rotate-180" />
                    ) : (
                      <Pencil className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Edit sub-view */}
                {isEditing && (
                  <TokenVisionEditor tokenId={token.id} config={config} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TokenVisionEditor({ tokenId, config }: { tokenId: string; config: VisionConfig }) {
  const setTokenVision = useGameplayStore((s) => s.setTokenVision);

  return (
    <div className="mt-1 rounded border border-brand-border bg-white/[0.02] p-2">
      {/* Presets */}
      <div className="mb-2">
        <label className="mb-1 block text-[10px] text-brand-muted">Preset</label>
        <div className="flex flex-wrap gap-1">
          {Object.entries(VISION_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => setTokenVision(tokenId, preset)}
              className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-brand-muted hover:bg-white/[0.08] hover:text-brand-text"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Vision ranges */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <VisionField label="Normal" value={config.normal} onChange={(v) => setTokenVision(tokenId, { normal: v })} />
        <VisionField label="Darkvision" value={config.darkvision} onChange={(v) => setTokenVision(tokenId, { darkvision: v })} />
        <VisionField label="Blindsight" value={config.blindsight} onChange={(v) => setTokenVision(tokenId, { blindsight: v })} />
        <VisionField label="Truesight" value={config.truesight} onChange={(v) => setTokenVision(tokenId, { truesight: v })} />
        <VisionField label="Tremorsense" value={config.tremorsense} onChange={(v) => setTokenVision(tokenId, { tremorsense: v })} />
      </div>

      {/* Light */}
      <div className="mt-2 border-t border-brand-border pt-2">
        <label className="mb-1 block text-[10px] text-brand-muted">Fonte de Luz</label>
        <select
          value={config.lightType}
          onChange={(e) => {
            const type = e.target.value as LightType;
            const preset = type === "torch" ? { lightBright: 8, lightDim: 8 }
              : type === "lamp" ? { lightBright: 6, lightDim: 6 }
              : type === "light_cantrip" ? { lightBright: 8, lightDim: 8 }
              : { lightBright: 0, lightDim: 0 };
            setTokenVision(tokenId, { lightType: type, ...preset });
          }}
          className="mb-1.5 w-full rounded bg-white/[0.06] px-2 py-1 text-[11px] text-brand-text"
        >
          <option value="none">Nenhuma</option>
          <option value="torch">Tocha</option>
          <option value="lamp">Lampiao</option>
          <option value="light_cantrip">Truque Luz</option>
          <option value="custom">Customizado</option>
        </select>
        {config.lightType !== "none" && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <VisionField label="Luz Clara" value={config.lightBright} onChange={(v) => setTokenVision(tokenId, { lightBright: v })} />
            <VisionField label="Luz Fraca" value={config.lightDim} onChange={(v) => setTokenVision(tokenId, { lightDim: v })} />
          </div>
        )}
      </div>
    </div>
  );
}

function VisionField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[9px] text-brand-muted">{label}</label>
      <input
        type="number"
        min={0}
        max={60}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] tabular-nums text-brand-text"
      />
    </div>
  );
}
