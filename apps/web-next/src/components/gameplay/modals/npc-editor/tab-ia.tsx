"use client";

import type { NPCData } from "@/lib/npc-types";

interface TabIAProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
}

export function TabIA({ form, onUpdate }: TabIAProps) {
  return (
    <div className="space-y-5">
      {/* AI Toggle */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Inteligencia Artificial
        </h3>

        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => onUpdate({ aiEnabled: !form.aiEnabled })}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              form.aiEnabled ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                form.aiEnabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[11px] text-brand-text">
            Ativar IA para dialogos com este NPC
          </span>
        </label>

        <p className="mt-2 text-[10px] leading-relaxed text-brand-muted">
          Quando ativado, a IA gera respostas baseadas na personalidade,
          conhecimento e contexto configurados. O GM pode editar respostas antes
          de enviar.
        </p>
      </section>

      {form.aiEnabled && (
        <>
          {/* AI Context */}
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Contexto Adicional
            </h3>
            <p className="mb-1.5 text-[10px] text-brand-muted">
              Informacoes extras que ajudam a IA a responder melhor.
            </p>
            <textarea
              value={form.aiContext}
              onChange={(e) => onUpdate({ aiContext: e.target.value })}
              placeholder="Este NPC esta nervoso porque a guilda o ameacou hoje. Ele desconfia de elfos..."
              rows={3}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          {/* Creativity slider */}
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Criatividade
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-brand-muted">Segura</span>
              <input
                type="range"
                min={0}
                max={100}
                value={form.aiCreativity}
                onChange={(e) =>
                  onUpdate({ aiCreativity: parseInt(e.target.value) })
                }
                className="flex-1 accent-brand-accent"
              />
              <span className="text-[10px] text-brand-muted">Criativa</span>
              <span className="w-8 text-right text-[10px] tabular-nums text-brand-accent">
                {form.aiCreativity}%
              </span>
            </div>
          </section>

          {/* Memory */}
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Memoria do NPC
            </h3>
            {form.interactions.length === 0 ? (
              <p className="text-[10px] text-brand-muted">
                Nenhuma interacao registrada ainda.
              </p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {form.interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="rounded-md border border-brand-border bg-white/[0.02] px-2.5 py-1.5"
                  >
                    <div className="text-[9px] text-brand-muted">
                      {new Date(interaction.timestamp).toLocaleDateString(
                        "pt-BR",
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-brand-text/80">
                      {interaction.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
