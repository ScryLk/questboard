"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CampaignObject, InteractionEffect, InteractionEffectType } from "@/types/object";
import { EFFECT_TYPE_CONFIG, ALL_EFFECT_TYPES } from "@/types/object";

interface TabInteracaoProps {
  form: CampaignObject;
  onUpdate: (updates: Partial<CampaignObject>) => void;
}

export function TabInteracao({ form, onUpdate }: TabInteracaoProps) {
  function addEffect() {
    const effect: InteractionEffect = {
      id: `eff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "custom_note",
      label: "",
      data: {},
    };
    onUpdate({
      interactionEffects: [...form.interactionEffects, effect],
    });
  }

  function updateEffect(
    effectId: string,
    updates: Partial<InteractionEffect>,
  ) {
    onUpdate({
      interactionEffects: form.interactionEffects.map((e) =>
        e.id === effectId ? { ...e, ...updates } : e,
      ),
    });
  }

  function removeEffect(effectId: string) {
    onUpdate({
      interactionEffects: form.interactionEffects.filter(
        (e) => e.id !== effectId,
      ),
    });
  }

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Interacao
        </h3>

        <label className="flex cursor-pointer items-center gap-2">
          <ToggleSwitch
            checked={form.interactionEnabled}
            onChange={(v) => onUpdate({ interactionEnabled: v })}
          />
          <span className="text-[11px] text-brand-text">
            Jogadores podem interagir
          </span>
        </label>
        <p className="ml-11 mt-0.5 text-[9px] text-brand-muted">
          Ao se aproximar, um botao de interacao aparece para o jogador
        </p>
      </section>

      {form.interactionEnabled && (
        <>
          {/* Interaction label */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Label do Botao
            </h3>
            <input
              type="text"
              value={form.interactionLabel ?? ""}
              onChange={(e) =>
                onUpdate({ interactionLabel: e.target.value })
              }
              placeholder="Ex: Examinar, Pegar, Ativar, Abrir"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          {/* Effects list */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                Efeitos ({form.interactionEffects.length})
              </h3>
              <button
                onClick={addEffect}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/10"
              >
                <Plus className="h-3 w-3" />
                Adicionar
              </button>
            </div>

            {form.interactionEffects.length === 0 ? (
              <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-brand-border">
                <span className="text-[10px] text-brand-muted">
                  Nenhum efeito configurado
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {form.interactionEffects.map((effect, idx) => (
                  <EffectRow
                    key={effect.id}
                    index={idx}
                    effect={effect}
                    onUpdate={(updates) => updateEffect(effect.id, updates)}
                    onRemove={() => removeEffect(effect.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Narrative link */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Vinculo Narrativo
            </h3>
            <input
              type="text"
              value={form.linkedNarrativeNodeId ?? ""}
              onChange={(e) =>
                onUpdate({
                  linkedNarrativeNodeId: e.target.value || undefined,
                })
              }
              placeholder="ID do evento narrativo (opcional)"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
            <p className="mt-1 text-[9px] text-brand-muted">
              Vincular a um evento da historia para marcar como concluido ao
              interagir
            </p>
          </section>
        </>
      )}
    </div>
  );
}

function EffectRow({
  index,
  effect,
  onUpdate,
  onRemove,
}: {
  index: number;
  effect: InteractionEffect;
  onUpdate: (updates: Partial<InteractionEffect>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-primary p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-medium text-brand-muted">
          Efeito {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Type selector */}
        <div>
          <label className="mb-1 block text-[10px] text-brand-muted">
            Tipo
          </label>
          <select
            value={effect.type}
            onChange={(e) =>
              onUpdate({ type: e.target.value as InteractionEffectType })
            }
            className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
          >
            {ALL_EFFECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EFFECT_TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div>
          <label className="mb-1 block text-[10px] text-brand-muted">
            Label
          </label>
          <input
            type="text"
            value={effect.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Ex: Abrir bau, Examinar runas..."
            className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>

        {/* Type-specific fields */}
        {effect.type === "reveal_fog" && (
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Raio (celulas)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={(effect.data.radius as number) ?? 3}
              onChange={(e) =>
                onUpdate({
                  data: { ...effect.data, radius: Number(e.target.value) },
                })
              }
              className="h-7 w-20 rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-center text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
            />
          </div>
        )}

        {effect.type === "deal_damage" && (
          <div className="flex gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Quantidade
              </label>
              <input
                type="text"
                value={(effect.data.amount as string) ?? ""}
                onChange={(e) =>
                  onUpdate({
                    data: { ...effect.data, amount: e.target.value },
                  })
                }
                placeholder="2d6"
                className="h-7 w-20 rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-brand-muted">
                Tipo
              </label>
              <input
                type="text"
                value={(effect.data.damageType as string) ?? ""}
                onChange={(e) =>
                  onUpdate({
                    data: { ...effect.data, damageType: e.target.value },
                  })
                }
                placeholder="fogo"
                className="h-7 w-20 rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
              />
            </div>
          </div>
        )}

        {effect.type === "custom_note" && (
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Texto
            </label>
            <textarea
              value={(effect.data.text as string) ?? ""}
              onChange={(e) =>
                onUpdate({ data: { ...effect.data, text: e.target.value } })
              }
              placeholder="Descricao do que acontece..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        )}

        {effect.type === "play_sound" && (
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Chave do som
            </label>
            <input
              type="text"
              value={(effect.data.soundKey as string) ?? ""}
              onChange={(e) =>
                onUpdate({
                  data: { ...effect.data, soundKey: e.target.value },
                })
              }
              placeholder="chest_open, explosion, etc"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
      style={{
        backgroundColor: checked
          ? "var(--brand-accent, #6C5CE7)"
          : "rgba(255,255,255,0.1)",
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  );
}
