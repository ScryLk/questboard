"use client";

import type { NPCData, AttitudeLevel, NPCPersonality, NPCAttitude } from "@/lib/npc-types";
import { ATTITUDE_LABELS } from "@/lib/npc-types";

interface TabPersonalidadeProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
}

export function TabPersonalidade({ form, onUpdate }: TabPersonalidadeProps) {
  function updatePersonality(updates: Partial<NPCPersonality>) {
    onUpdate({ personality: { ...form.personality, ...updates } });
  }

  function updateAttitude(updates: Partial<NPCAttitude>) {
    onUpdate({ attitude: { ...form.attitude, ...updates } });
  }

  return (
    <div className="space-y-5">
      {/* Personality traits */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Personalidade e Comportamento
        </h3>

        <div className="space-y-2">
          <TextInput
            label="Traco principal"
            value={form.personality.personalityTrait}
            onChange={(v) => updatePersonality({ personalityTrait: v })}
            placeholder="Hospitaleiro mas desconfiado com estranhos"
          />
          <TextInput
            label="Ideal (o que motiva)"
            value={form.personality.ideal}
            onChange={(v) => updatePersonality({ ideal: v })}
            placeholder="Proteger sua comunidade acima de tudo"
          />
          <TextInput
            label="Vinculo (ligacao emocional)"
            value={form.personality.bond}
            onChange={(v) => updatePersonality({ bond: v })}
            placeholder="Sua taverna foi construida pelo avo, e sagrada"
          />
          <TextInput
            label="Defeito (fraqueza)"
            value={form.personality.flaw}
            onChange={(v) => updatePersonality({ flaw: v })}
            placeholder="Tem problema com bebida, sabe segredos demais"
          />
          <TextInput
            label="Maneirismo / Quirk"
            value={form.personality.quirk}
            onChange={(v) => updatePersonality({ quirk: v })}
            placeholder="Coca a barba quando mente, ri alto quando nervoso"
          />
        </div>
      </section>

      {/* Voice */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Voz e Tom
        </h3>

        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Como o NPC fala
            </label>
            <textarea
              value={form.personality.voiceStyle}
              onChange={(e) =>
                updatePersonality({ voiceStyle: e.target.value })
              }
              placeholder="Fala alto, ri muito, usa girias de anao, chama todos de 'amigo'..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-brand-muted">
              Frase de abertura (greeting)
            </label>
            <textarea
              value={form.personality.greeting}
              onChange={(e) => updatePersonality({ greeting: e.target.value })}
              placeholder="Aaah, mais aventureiros! Sentem-se, rapaz..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </div>
        </div>
      </section>

      {/* Attitude */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Atitude com o Grupo
        </h3>

        <div className="mb-3">
          <label className="mb-1 block text-[10px] text-brand-muted">
            Atitude inicial
          </label>
          <div className="flex gap-1">
            {(Object.entries(ATTITUDE_LABELS) as [AttitudeLevel, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    updateAttitude({
                      initialAttitude: key,
                      currentAttitude: key,
                    })
                  }
                  className={`flex-1 rounded-md py-1 text-[10px] font-medium transition-colors ${
                    form.attitude.initialAttitude === key
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "border border-brand-border text-brand-muted hover:text-brand-text"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <label className="text-[10px] text-brand-muted">
            Atitude pode mudar?
          </label>
          <button
            onClick={() =>
              updateAttitude({
                attitudeCanChange: !form.attitude.attitudeCanChange,
              })
            }
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              form.attitude.attitudeCanChange
                ? "bg-brand-accent/20 text-brand-accent"
                : "bg-white/5 text-brand-muted"
            }`}
          >
            {form.attitude.attitudeCanChange ? "Sim" : "Nao"}
          </button>
        </div>

        {form.attitude.attitudeCanChange && (
          <div className="grid grid-cols-3 gap-2">
            <NumberInput
              label="Persuasao CD"
              value={form.attitude.persuasionDC}
              onChange={(v) => updateAttitude({ persuasionDC: v })}
            />
            <NumberInput
              label="Intimidacao CD"
              value={form.attitude.intimidationDC}
              onChange={(v) => updateAttitude({ intimidationDC: v })}
            />
            <NumberInput
              label="Enganacao CD"
              value={form.attitude.deceptionDC}
              onChange={(v) => updateAttitude({ deceptionDC: v })}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-brand-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-brand-muted">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="h-7 w-full rounded-md border border-brand-border bg-brand-primary px-2 text-[11px] text-brand-text outline-none focus:border-brand-accent/40"
      />
    </div>
  );
}
