"use client";

import type { CampaignCharacter } from "@/types/character";

interface TabDialogoProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

export function TabDialogo({ form, onUpdate }: TabDialogoProps) {
  return (
    <div className="space-y-5">
      {/* Toggle */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Dialogo
        </h3>

        <label className="flex cursor-pointer items-center gap-2">
          <ToggleSwitch
            checked={form.dialogueEnabled}
            onChange={(v) => onUpdate({ dialogueEnabled: v })}
          />
          <span className="text-[11px] text-brand-text">
            Habilitar dialogo
          </span>
        </label>
        <p className="ml-11 mt-0.5 text-[9px] text-brand-muted">
          Personagens com dialogo podem interagir com jogadores via chat
        </p>
      </section>

      {form.dialogueEnabled && (
        <>
          {/* Greeting */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Saudacao Inicial
            </h3>
            <textarea
              value={form.dialogueGreeting ?? ""}
              onChange={(e) =>
                onUpdate({
                  dialogueGreeting: e.target.value || undefined,
                })
              }
              placeholder="O que o personagem diz quando um jogador inicia conversa..."
              rows={3}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          {/* GM notes */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Notas do Mestre
            </h3>
            <textarea
              value={form.dialogueNotes ?? ""}
              onChange={(e) =>
                onUpdate({
                  dialogueNotes: e.target.value || undefined,
                })
              }
              placeholder="Como interpretar esse personagem, informacoes que pode revelar, tom de voz..."
              rows={4}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
            <p className="mt-1 text-[9px] text-brand-muted">
              Essas notas sao visiveis apenas para o Mestre
            </p>
          </section>

          {/* Narrative links */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Vinculos Narrativos
            </h3>
            <input
              type="text"
              value={form.linkedNarrativeNodeIds.join(", ")}
              onChange={(e) =>
                onUpdate({
                  linkedNarrativeNodeIds: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="IDs de eventos narrativos (separados por virgula)"
              className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
            <p className="mt-1 text-[9px] text-brand-muted">
              Vincular a eventos da historia para acompanhar progresso
            </p>
          </section>
        </>
      )}
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
