"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CampaignCharacter, CharacterAction } from "@/types/character";

interface TabCombateProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

export function TabCombate({ form, onUpdate }: TabCombateProps) {
  function addAction() {
    const action: CharacterAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      description: "",
    };
    onUpdate({ actions: [...form.actions, action] });
  }

  function updateAction(
    actionId: string,
    updates: Partial<CharacterAction>,
  ) {
    onUpdate({
      actions: form.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a,
      ),
    });
  }

  function removeAction(actionId: string) {
    onUpdate({
      actions: form.actions.filter((a) => a.id !== actionId),
    });
  }

  return (
    <div className="space-y-5">
      {/* Actions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Acoes ({form.actions.length})
          </h3>
          <button
            onClick={addAction}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/10"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </button>
        </div>

        {form.actions.length === 0 ? (
          <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-brand-border">
            <span className="text-[10px] text-brand-muted">
              Nenhuma acao configurada
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {form.actions.map((action, idx) => (
              <ActionRow
                key={action.id}
                index={idx}
                action={action}
                onUpdate={(updates) => updateAction(action.id, updates)}
                onRemove={() => removeAction(action.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Traits */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Tracos e Habilidades Especiais
        </h3>
        <textarea
          value={form.traits ?? ""}
          onChange={(e) => onUpdate({ traits: e.target.value || undefined })}
          placeholder="Resistencias, habilidades passivas, acoes lendarias em texto livre..."
          rows={4}
          className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
      </section>
    </div>
  );
}

function ActionRow({
  index,
  action,
  onUpdate,
  onRemove,
}: {
  index: number;
  action: CharacterAction;
  onUpdate: (updates: Partial<CharacterAction>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-primary p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium text-brand-muted">
            Acao {index + 1}
          </span>
          {action.isLegendary && (
            <span className="rounded bg-[#F59E0B]/20 px-1 py-0.5 text-[8px] font-medium text-[#F59E0B]">
              LENDARIA
            </span>
          )}
          {action.isReaction && (
            <span className="rounded bg-[#74B9FF]/20 px-1 py-0.5 text-[8px] font-medium text-[#74B9FF]">
              REACAO
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex h-5 w-5 items-center justify-center rounded text-brand-muted transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Name */}
        <div>
          <label className="mb-1 block text-[10px] text-brand-muted">
            Nome
          </label>
          <input
            type="text"
            value={action.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Ex: Espada Longa, Sopro de Fogo"
            className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-[10px] text-brand-muted">
            Descricao
          </label>
          <textarea
            value={action.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Detalhes do ataque ou habilidade..."
            rows={2}
            className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
          />
        </div>

        {/* Attack stats row */}
        <div className="flex gap-2">
          <div className="w-16">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Ataque
            </label>
            <input
              type="number"
              value={action.attackBonus ?? ""}
              onChange={(e) =>
                onUpdate({
                  attackBonus: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="+5"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-center text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Dano
            </label>
            <input
              type="text"
              value={action.damage ?? ""}
              onChange={(e) =>
                onUpdate({ damage: e.target.value || undefined })
              }
              placeholder="2d6+3"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Tipo Dano
            </label>
            <input
              type="text"
              value={action.damageType ?? ""}
              onChange={(e) =>
                onUpdate({ damageType: e.target.value || undefined })
              }
              placeholder="cortante"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div className="w-14">
            <label className="mb-1 block text-[10px] text-brand-muted">
              Alcance
            </label>
            <input
              type="number"
              value={action.reach ?? ""}
              onChange={(e) =>
                onUpdate({
                  reach: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="5ft"
              className="h-7 w-full rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-center text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-3">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={action.isLegendary ?? false}
              onChange={(e) => onUpdate({ isLegendary: e.target.checked })}
              className="h-3 w-3 rounded border-brand-border accent-brand-accent"
            />
            <span className="text-[10px] text-brand-muted">Lendaria</span>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={action.isReaction ?? false}
              onChange={(e) => onUpdate({ isReaction: e.target.checked })}
              className="h-3 w-3 rounded border-brand-border accent-brand-accent"
            />
            <span className="text-[10px] text-brand-muted">Reacao</span>
          </label>
        </div>
      </div>
    </div>
  );
}
