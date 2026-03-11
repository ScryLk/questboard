"use client";

import { useState } from "react";
import { Loader2, MapPin, Save, Sparkles } from "lucide-react";
import { useGenerateNPC } from "@/hooks/use-generate-npc";
import { useCustomCreaturesStore } from "@/lib/custom-creatures-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { sizeToGrid } from "@/lib/creature-data";
import { CreatureStatBlock } from "./creature-stat-block";
import type { CreaturePersonality } from "@/lib/ai-types";

export function AIGeneratePanel() {
  const [prompt, setPrompt] = useState("");
  const { generate, isLoading, streamedText, generatedNPC, error } = useGenerateNPC();
  const addCreature = useCustomCreaturesStore((s) => s.addCreature);
  const addToken = useGameplayStore((s) => s.addToken);
  const linkTokenToCreature = useGameplayStore((s) => s.linkTokenToCreature);
  const getViewportCenter = useGameplayStore((s) => s.getViewportCenter);
  const addToast = useGameplayStore((s) => s.addToast);
  const [saved, setSaved] = useState(false);

  function handleGenerate() {
    if (!prompt.trim() || isLoading) return;
    setSaved(false);
    generate(prompt.trim());
  }

  function handleAddToMap() {
    if (!generatedNPC) return;
    const c = generatedNPC.creature;
    const center = getViewportCenter();
    const tokenId = `tok_${Date.now()}`;
    addToken({
      id: tokenId,
      name: c.name,
      x: center?.x ?? 5,
      y: center?.y ?? 5,
      alignment: "hostile",
      hp: c.hp,
      maxHp: c.hp,
      ac: c.ac,
      size: sizeToGrid(c.size),
      speed: parseInt(c.speed) * 3 || 30,
      icon: c.icon,
    });
    linkTokenToCreature(tokenId, c.id);
    addToast(`${c.name} adicionado ao mapa`);
  }

  function handleSave() {
    if (!generatedNPC || saved) return;
    addCreature({
      ...generatedNPC.creature,
      sourcePrompt: prompt,
    });
    setSaved(true);
    addToast(`${generatedNPC.creature.name} salvo no compêndio`);
  }

  return (
    <div className="border-b border-brand-border px-5 py-4">
      {/* Input + Generate */}
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleGenerate();
          }}
          placeholder="Descreva o NPC... ex: taverneiro anão guerreiro aposentado, CR 2"
          className="flex-1 rounded-lg border border-brand-border bg-white/[0.03] px-3 py-2 text-xs text-brand-text placeholder:text-brand-muted/50 focus:border-brand-accent/50 focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand-accent/20 px-4 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Gerar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Streaming progress */}
      {isLoading && streamedText && (
        <div className="mt-3 max-h-32 overflow-hidden rounded-lg bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] text-brand-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            Gerando NPC...
          </div>
          <div className="animate-ai-shimmer mt-1 h-2 w-full rounded" />
        </div>
      )}

      {/* Generated result */}
      {generatedNPC && !isLoading && (
        <div className="mt-4">
          {/* Stat block */}
          <CreatureStatBlock creature={generatedNPC.creature} />

          {/* Personality section */}
          <PersonalityCard personality={generatedNPC.personality} />

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddToMap}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-accent/20 py-2 text-xs font-medium text-brand-accent transition-colors hover:bg-brand-accent/30"
            >
              <MapPin className="h-3.5 w-3.5" />
              Adicionar ao Mapa
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                saved
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/[0.05] text-brand-muted hover:bg-white/[0.08]"
              }`}
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? "Salvo!" : "Salvar no Compêndio"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalityCard({ personality }: { personality: CreaturePersonality }) {
  return (
    <div className="mt-3 rounded-xl border border-brand-border bg-white/[0.02] px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
        Personalidade
      </div>

      <div className="mt-2 space-y-2 text-xs">
        {personality.personalityTraits.length > 0 && (
          <div>
            <span className="font-medium text-brand-text">Traços: </span>
            <span className="text-brand-muted">{personality.personalityTraits.join("; ")}</span>
          </div>
        )}
        <div>
          <span className="font-medium text-brand-text">Ideal: </span>
          <span className="text-brand-muted">{personality.ideal}</span>
        </div>
        <div>
          <span className="font-medium text-brand-text">Vínculo: </span>
          <span className="text-brand-muted">{personality.bond}</span>
        </div>
        <div>
          <span className="font-medium text-brand-text">Fraqueza: </span>
          <span className="text-brand-muted">{personality.flaw}</span>
        </div>
        {personality.voiceNotes && (
          <div>
            <span className="font-medium text-brand-text">Voz: </span>
            <span className="text-brand-muted">{personality.voiceNotes}</span>
          </div>
        )}
        {personality.mannerisms && (
          <div>
            <span className="font-medium text-brand-text">Maneirismos: </span>
            <span className="text-brand-muted">{personality.mannerisms}</span>
          </div>
        )}
        <div>
          <span className="font-medium text-brand-text">Motivação: </span>
          <span className="text-brand-muted">{personality.motivation}</span>
        </div>
        {personality.backstory && (
          <div className="mt-2 border-t border-brand-border pt-2">
            <div className="font-medium text-brand-text">Backstory</div>
            <p className="mt-1 whitespace-pre-line text-brand-muted leading-relaxed">
              {personality.backstory}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
