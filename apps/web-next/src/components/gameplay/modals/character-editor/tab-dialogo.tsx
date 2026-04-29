"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  CampaignCharacter,
  DialogueBranch,
} from "@/types/character";

interface TabDialogoProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

function generateBranchId(): string {
  return `br_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function TabDialogo({ form, onUpdate }: TabDialogoProps) {
  const branches = form.dialogueBranches ?? [];

  function addBranch() {
    const newBranch: DialogueBranch = {
      id: generateBranchId(),
      trigger: "",
      response: "",
      isFinal: false,
    };
    onUpdate({ dialogueBranches: [...branches, newBranch] });
  }

  function updateBranch(id: string, updates: Partial<DialogueBranch>) {
    onUpdate({
      dialogueBranches: branches.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    });
  }

  function removeBranch(id: string) {
    onUpdate({
      dialogueBranches: branches.filter((b) => b.id !== id),
    });
  }

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
            Habilitar diálogo
          </span>
        </label>
        <p className="ml-11 mt-0.5 text-[9px] text-brand-muted">
          Modo scripted: jogadores veem opções pré-escritas. Modos AI/Hybrid
          virão quando o backend Gemini subir.
        </p>
      </section>

      {form.dialogueEnabled && (
        <>
          {/* Greeting */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Saudação Inicial
            </h3>
            <textarea
              value={form.dialogueGreeting ?? ""}
              onChange={(e) =>
                onUpdate({
                  dialogueGreeting: e.target.value || undefined,
                })
              }
              placeholder="O que o personagem diz quando o jogador inicia conversa..."
              rows={3}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          {/* Branches */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                Opções de Conversa ({branches.length})
              </h3>
              <button
                type="button"
                onClick={addBranch}
                className="flex items-center gap-1 rounded-md border border-brand-border bg-white/[0.03] px-2 py-0.5 text-[10px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
              >
                <Plus className="h-2.5 w-2.5" />
                Nova
              </button>
            </div>

            {branches.length === 0 ? (
              <p className="rounded-md border border-dashed border-brand-border bg-white/[0.02] px-3 py-4 text-center text-[10px] text-brand-muted/70">
                Sem opções — adicione ramos pra dar ao jogador caminhos de
                conversa. Sem ramos, o NPC só repete a saudação.
              </p>
            ) : (
              <div className="space-y-2">
                {branches.map((b, i) => (
                  <div
                    key={b.id}
                    className="rounded-md border border-brand-border bg-white/[0.02] p-2"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-semibold uppercase text-brand-muted/70">
                        Opção {i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-1">
                          <input
                            type="checkbox"
                            checked={Boolean(b.isFinal)}
                            onChange={(e) =>
                              updateBranch(b.id, { isFinal: e.target.checked })
                            }
                            className="h-3 w-3 rounded border-brand-border accent-brand-accent"
                          />
                          <span className="text-[9px] text-brand-muted">
                            encerra conversa
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeBranch(b.id)}
                          className="text-brand-muted/70 hover:text-rose-400"
                          title="Remover opção"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={b.trigger}
                      onChange={(e) =>
                        updateBranch(b.id, { trigger: e.target.value })
                      }
                      placeholder="O que o jogador diz (botão de opção)"
                      className="mb-1 w-full rounded border border-brand-border bg-brand-primary px-2 py-1 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                    />
                    <textarea
                      value={b.response}
                      onChange={(e) =>
                        updateBranch(b.id, { response: e.target.value })
                      }
                      placeholder="Resposta do NPC quando o jogador escolhe essa opção"
                      rows={2}
                      className="w-full resize-none rounded border border-brand-border bg-brand-primary px-2 py-1 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Farewell */}
          <section>
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Despedida
            </h3>
            <textarea
              value={form.dialogueFarewell ?? ""}
              onChange={(e) =>
                onUpdate({
                  dialogueFarewell: e.target.value || undefined,
                })
              }
              placeholder="Mensagem de despedida quando o jogador encerra a conversa..."
              rows={2}
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
              placeholder="Como interpretar esse personagem, segredos, motivações..."
              rows={4}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
            <p className="mt-1 text-[9px] text-brand-muted">
              Visível apenas para o Mestre.
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
