"use client";

import { useMemo, useState } from "react";
import { Loader2, PawPrint, Sparkles, UserRound, X } from "lucide-react";
import type {
  AICharacterGenerationResult,
  AICharacterCategory,
} from "@questboard/validators";
import {
  createDefaultCharacter,
  useCharacterStore,
} from "@/stores/characterStore";
import { useNarrativeStore } from "@/stores/narrativeStore";
import type { CampaignCharacter } from "@/types/character";

interface Props {
  onClose: () => void;
  /** Chamado com o id do personagem criado — use pra abrir o editor. */
  onCreated: (characterId: string) => void;
}

export function GenerateCharacterAIDialog({ onClose, onCreated }: Props) {
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const nodes = useNarrativeStore((s) => s.nodes);

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<AICharacterCategory>("npc");
  const [linkEventEnabled, setLinkEventEnabled] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [loading, setLoading] = useState<false | "text" | "sprite">(false);
  const [error, setError] = useState<string | null>(null);

  const eventNodes = useMemo(
    () =>
      nodes
        .filter((n) => n.type === "event" || n.type === "choice" || n.type === "chapter")
        .sort((a, b) => {
          const ta = String((a.data as { title?: string }).title ?? "");
          const tb = String((b.data as { title?: string }).title ?? "");
          return ta.localeCompare(tb);
        }),
    [nodes],
  );

  const isLoading = loading !== false;
  const canSubmit = prompt.trim().length >= 10 && !isLoading;

  async function handleGenerate() {
    if (!canSubmit) return;
    setLoading("text");
    setError(null);

    let narrativeContext:
      | { nodeTitle: string; nodeDescription?: string; nodeGmNotes?: string }
      | undefined;
    if (linkEventEnabled && selectedNodeId) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        const d = node.data as {
          title?: string;
          description?: string;
          gmNotes?: string;
        };
        if (d.title) {
          narrativeContext = {
            nodeTitle: d.title,
            nodeDescription: d.description || undefined,
            nodeGmNotes: d.gmNotes || undefined,
          };
        }
      }
    }

    try {
      // 1) Gera a ficha textual
      const res = await fetch("/api/ai/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          category,
          ...(narrativeContext ? { narrativeContext } : {}),
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Falha ao gerar personagem");
      }

      const payload = (await res.json()) as {
        character: AICharacterGenerationResult;
        category: AICharacterCategory;
      };

      // 2) Gera o sprite a partir da descrição recém-criada. Se falhar,
      // segue sem sprite — o personagem ainda é criado e o user pode re-gerar
      // manualmente na aba Visual do editor.
      setLoading("sprite");
      let spriteDataUrl: string | null = null;
      let spriteGeneratedByAI = false;
      try {
        const spritePrompt = [
          payload.character.description,
          payload.character.creatureType
            ? `Criatura do tipo: ${payload.character.creatureType}.`
            : "",
        ]
          .filter(Boolean)
          .join(" ");
        const spriteRes = await fetch("/api/ai/generate-sprite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: spritePrompt,
            objectName: payload.character.name,
            category: payload.category,
          }),
        });
        if (spriteRes.ok) {
          const spriteData = (await spriteRes.json()) as {
            imageBase64: string;
            mimeType: string;
          };
          spriteDataUrl = `data:${spriteData.mimeType};base64,${spriteData.imageBase64}`;
          spriteGeneratedByAI = true;
        } else {
          console.warn("[GenerateCharacterAIDialog] sprite gen failed — continuando sem");
        }
      } catch (spriteErr) {
        console.warn("[GenerateCharacterAIDialog] sprite gen exception:", spriteErr);
      }

      const defaults = createDefaultCharacter();
      const ai = payload.character;
      const newCharacter: CampaignCharacter = {
        ...defaults,
        name: ai.name,
        title: ai.title,
        description: ai.description,
        category: payload.category,
        role: ai.role,
        creatureType: payload.category === "creature" ? ai.creatureType : undefined,
        disposition: ai.disposition,
        stats: {
          ...defaults.stats,
          ...ai.stats,
        },
        dialogueEnabled: payload.category === "npc" && !!ai.dialogueGreeting,
        dialogueGreeting: ai.dialogueGreeting,
        dialogueNotes: ai.dialogueNotes,
        spriteUrl: spriteDataUrl,
        spriteGeneratedByAI,
        spritePrompt: spriteGeneratedByAI ? ai.description : undefined,
      };

      createCharacter(newCharacter);
      onCreated(newCharacter.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha desconhecida");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-y-auto rounded-xl border border-brand-border bg-[#111116] shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-brand-text">
              Gerar personagem com IA
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Categoria
            </label>
            <div className="flex gap-2">
              {(
                [
                  { key: "npc" as const, label: "NPC", Icon: UserRound },
                  { key: "creature" as const, label: "Criatura", Icon: PawPrint },
                ] as const
              ).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  disabled={isLoading}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    category === key
                      ? "border-brand-accent/30 bg-brand-accent/10 text-brand-accent"
                      : "border-brand-border text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Descrição
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
              placeholder={
                category === "creature"
                  ? "Ex: Um lobo atroz com pelagem cinza-prata, olhos vermelhos, lidera uma alcateia de mortos-vivos"
                  : "Ex: Um mercador cego que vende poções alquímicas e esconde que é um antigo sacerdote renegado"
              }
              rows={4}
              disabled={isLoading}
              className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] p-3 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-brand-accent disabled:opacity-50"
              autoFocus
            />
            <div className="mt-1 text-right text-[9px] text-brand-muted">
              {prompt.length}/500
            </div>
          </div>

          {/* Narrative link */}
          <div>
            <label className="mb-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-brand-border bg-[#0A0A0F] px-3 py-2.5">
              <span className="text-xs text-brand-text">
                Vincular a evento da história
              </span>
              <input
                type="checkbox"
                checked={linkEventEnabled}
                disabled={isLoading || eventNodes.length === 0}
                onChange={(e) => setLinkEventEnabled(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer accent-brand-accent"
              />
            </label>

            {linkEventEnabled && (
              <>
                {eventNodes.length === 0 ? (
                  <p className="mt-2 text-[10px] text-brand-muted">
                    Nenhum evento disponível na história.
                  </p>
                ) : (
                  <select
                    value={selectedNodeId}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    disabled={isLoading}
                    className="mt-2 h-9 w-full cursor-pointer rounded-md border border-brand-border bg-[#0A0A0F] px-2 text-xs text-brand-text outline-none focus:border-brand-accent"
                  >
                    <option value="">Selecione um evento...</option>
                    {eventNodes.map((n) => {
                      const d = n.data as { title?: string };
                      return (
                        <option key={n.id} value={n.id}>
                          {d.title ?? `(sem título · ${n.id.slice(0, 6)})`}
                        </option>
                      );
                    })}
                  </select>
                )}
                <p className="mt-1 text-[9px] text-brand-muted">
                  A IA usa o evento como contexto pra dar motivação e tom coerentes ao personagem.
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {loading === "text" ? "Gerando ficha..." : "Gerando sprite..."}
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Gerar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
