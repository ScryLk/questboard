"use client";

import { useEffect, useState } from "react";
import { BookOpen, Brain, Shuffle, Plus } from "lucide-react";
import type { NPCData } from "@/lib/npc-types";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import type {
  NpcMode,
  NpcMood,
  NpcConversationProfile,
  DialogueNode,
} from "@/lib/npc-conversation-types";
import { MOOD_LABELS, MOOD_COLORS } from "@/lib/npc-conversation-types";

const MODE_OPTIONS: { value: NpcMode; label: string; icon: typeof BookOpen; description: string }[] = [
  { value: "SCRIPTED", label: "Roteiro", icon: BookOpen, description: "Árvore de diálogos com condições e ramificações" },
  { value: "AI", label: "IA", icon: Brain, description: "IA responde em tempo real, no personagem" },
  { value: "HYBRID", label: "Híbrido", icon: Shuffle, description: "Começa com roteiro, cai pra IA se nenhum nó bater" },
];

const MOOD_OPTIONS = Object.entries(MOOD_LABELS) as [NpcMood, string][];

interface TabConversaProps {
  form: NPCData;
  onUpdate: (updates: Partial<NPCData>) => void;
}

export function TabConversa({ form, onUpdate }: TabConversaProps) {
  const setProfile = useNpcConversationStore((s) => s.setProfile);
  const getProfile = useNpcConversationStore((s) => s.getProfile);
  const openModal = useGameplayStore((s) => s.openModal);

  const existingProfile = getProfile(form.id);

  const [mode, setMode] = useState<NpcMode>(existingProfile?.mode ?? "AI");
  const [aiPersonality, setAiPersonality] = useState(existingProfile?.aiPersonality ?? form.personality.personalityTrait);
  const [aiGoals, setAiGoals] = useState(existingProfile?.aiGoals ?? "");
  const [aiSecrets, setAiSecrets] = useState(existingProfile?.aiSecrets ?? "");
  const [aiMood, setAiMood] = useState<NpcMood>(existingProfile?.aiMood ?? "NEUTRAL");
  const [aiFactionName, setAiFactionName] = useState(existingProfile?.aiFactionName ?? "");
  const [aiKnowledge, setAiKnowledge] = useState(existingProfile?.aiKnowledge ?? "");
  const [voiceStyle, setVoiceStyle] = useState(existingProfile?.voiceStyle ?? form.personality.voiceStyle);
  const [reputationEnabled, setReputationEnabled] = useState(existingProfile?.reputationEnabled ?? false);

  useEffect(() => {
    const profile: NpcConversationProfile = {
      npcId: form.id,
      mode,
      aiPersonality,
      aiGoals,
      aiSecrets,
      aiMood,
      aiFactionName,
      aiKnowledge,
      voiceStyle,
      reputationEnabled,
      dialogueTree: existingProfile?.dialogueTree ?? [],
    };
    setProfile(form.id, profile);
  }, [mode, aiPersonality, aiGoals, aiSecrets, aiMood, aiFactionName, aiKnowledge, voiceStyle, reputationEnabled, form.id, setProfile, existingProfile?.dialogueTree]);

  return (
    <div className="space-y-5">
      {/* Mode selection */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Modo de Conversa
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                  isActive
                    ? "border-brand-accent bg-brand-accent/10"
                    : "border-brand-border bg-white/[0.02] hover:border-brand-border/60"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-brand-accent" : "text-brand-muted"}`} />
                <span className={`text-[11px] font-medium ${isActive ? "text-brand-accent" : "text-brand-text"}`}>
                  {opt.label}
                </span>
                <span className="text-[9px] text-brand-muted text-center leading-tight">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Personality (for AI/Hybrid) */}
      {(mode === "AI" || mode === "HYBRID") && (
        <>
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Personalidade
            </h3>
            <textarea
              value={aiPersonality}
              onChange={(e) => setAiPersonality(e.target.value)}
              placeholder="Desconfiado de aventureiros. Fala curto e direto. Gosta de ouro acima de tudo..."
              rows={3}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Objetivos
            </h3>
            <textarea
              value={aiGoals}
              onChange={(e) => setAiGoals(e.target.value)}
              placeholder="Quer descobrir quem roubou o estoque de aço da Guilda..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Segredos (NPC nunca revela)
            </h3>
            <textarea
              value={aiSecrets}
              onChange={(e) => setAiSecrets(e.target.value)}
              placeholder="É o assassino do Capítulo 2. Tem a chave do cofre..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Conhecimento do Mundo
            </h3>
            <textarea
              value={aiKnowledge}
              onChange={(e) => setAiKnowledge(e.target.value)}
              placeholder="Sabe sobre o dragão nas montanhas. Conhece a entrada secreta da masmorra..."
              rows={2}
              className="w-full resize-none rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>

          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
              Estilo de Voz
            </h3>
            <input
              type="text"
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
              placeholder="Gravelly, fala pausada, sotaque de fazendeiro..."
              className="w-full rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
            />
          </section>
        </>
      )}

      {/* Mood */}
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Estado Emocional
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {MOOD_OPTIONS.map(([moodKey, moodLabel]) => (
            <button
              key={moodKey}
              onClick={() => setAiMood(moodKey)}
              className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition-all ${
                aiMood === moodKey
                  ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                  : "border-brand-border bg-white/[0.02] text-brand-muted hover:border-brand-border/60"
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: MOOD_COLORS[moodKey] }} />
              {moodLabel}
            </button>
          ))}
        </div>
      </section>

      {/* Faction */}
      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Facção
        </h3>
        <input
          type="text"
          value={aiFactionName}
          onChange={(e) => setAiFactionName(e.target.value)}
          placeholder="Guilda dos Mercadores"
          className="w-full rounded-md border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40"
        />
      </section>

      {/* Reputation toggle */}
      <section>
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setReputationEnabled(!reputationEnabled)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              reputationEnabled ? "bg-brand-accent" : "bg-white/10"
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                reputationEnabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[11px] text-brand-text">
            Habilitar sistema de reputação
          </span>
        </label>
        <p className="mt-1 text-[9px] text-brand-muted">
          Reputação muda baseada no estilo de fala do jogador e afeta opções de diálogo.
        </p>
      </section>

      {/* Dialogue tree link (for Scripted/Hybrid) */}
      {(mode === "SCRIPTED" || mode === "HYBRID") && (
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
            Árvore de Diálogos
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-brand-muted">
              {existingProfile?.dialogueTree.length ?? 0} nós configurados
            </span>
            <button
              onClick={() => openModal("dialogueTreeEditor" as any)}
              className="flex items-center gap-1 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-[11px] font-medium text-brand-accent transition-colors hover:bg-brand-accent/20"
            >
              <Plus className="h-3 w-3" />
              Editar Árvore
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
