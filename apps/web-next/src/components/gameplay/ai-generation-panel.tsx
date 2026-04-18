"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import type { AIGeneratedLayer } from "@/lib/gameplay-store";
import { buildMapGenerationPrompt, calculatePromptDimensions } from "@/lib/ai-map-prompt";
import { CELL_SIZE } from "@/lib/gameplay/constants";

const QUICK_REFS: { emoji: string; label: string; text: string }[] = [
  { emoji: "🏰", label: "Masmorra", text: "masmorra subterrânea, pedras úmidas, tochas, grades de ferro, névoa baixa" },
  { emoji: "🌲", label: "Floresta", text: "floresta densa, árvores antigas, raízes expostas, luz filtrada, cogumelos" },
  { emoji: "🏙️", label: "Cidade", text: "rua de cidade medieval, paralelepípedos, casas de madeira, lampiões, mercado" },
  { emoji: "⛪", label: "Templo", text: "templo sagrado, colunas de pedra, altar central, velas, vitrais quebrados" },
  { emoji: "🌊", label: "Submerso", text: "ambiente submerso, pedras com algas, coral, luz azulada, bolhas de ar" },
  { emoji: "🔥", label: "Vulcão", text: "caverna vulcânica, rochas de lava, poças de magma, fumaça, plataformas de pedra" },
];

export function AIGenerationPanel() {
  const aiPanelOpen = useGameplayStore((s) => s.aiPanelOpen);
  const aiSelection = useGameplayStore((s) => s.aiSelection);
  const aiGenerationStatus = useGameplayStore((s) => s.aiGenerationStatus);
  const clearAISelection = useGameplayStore((s) => s.clearAISelection);
  const setAIGenerationStatus = useGameplayStore((s) => s.setAIGenerationStatus);
  const addAILayer = useGameplayStore((s) => s.addAILayer);
  const removeAILayer = useGameplayStore((s) => s.removeAILayer);
  const addToast = useGameplayStore((s) => s.addToast);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!aiPanelOpen || !aiSelection) return null;

  const x1 = Math.min(aiSelection.x1, aiSelection.x2);
  const y1 = Math.min(aiSelection.y1, aiSelection.y2);
  const x2 = Math.max(aiSelection.x1, aiSelection.x2);
  const y2 = Math.max(aiSelection.y1, aiSelection.y2);
  const cols = x2 - x1 + 1;
  const rows = y2 - y1 + 1;
  const { widthPx, heightPx } = calculatePromptDimensions(cols, rows);

  const isGenerating = aiGenerationStatus === "generating";
  const canGenerate = description.trim().length >= 10 && !isGenerating;

  function handleQuickRef(text: string) {
    setDescription(text);
  }

  function handleClose() {
    if (!isGenerating) {
      clearAISelection();
      setName("");
      setDescription("");
    }
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setAIGenerationStatus("generating");

    const prompt = buildMapGenerationPrompt({
      description: description.trim(),
      widthCells: cols,
      heightCells: rows,
      widthPx,
      heightPx,
      references: [],
      name: name.trim() || undefined,
    });

    try {
      const res = await fetch("/api/ai/generate-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, widthPx, heightPx }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Falha ao gerar");
      }

      const { imageBase64, mimeType } = (await res.json()) as {
        imageBase64: string;
        mimeType: string;
      };
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const layerId = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newLayer: AIGeneratedLayer = {
        id: layerId,
        imageDataUrl: dataUrl,
        x1,
        y1,
        x2,
        y2,
        name: name.trim() || "Textura IA",
        timestamp: Date.now(),
      };

      addAILayer(newLayer);
      setAIGenerationStatus("idle");
      clearAISelection();
      setName("");
      setDescription("");

      addToast(`Textura gerada: "${newLayer.name}"`, {
        label: "Desfazer",
        onClick: () => removeAILayer(layerId),
      });
    } catch (err) {
      setAIGenerationStatus("error");
      addToast(`Erro: ${err instanceof Error ? err.message : "Falha desconhecida"}`);
      setTimeout(() => setAIGenerationStatus("idle"), 3000);
    }
  }

  return (
    <div className="fixed right-0 top-12 z-30 flex h-[calc(100vh-48px)] w-[360px] flex-col border-l border-brand-border bg-[#111116] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-brand-text">Gerar com IA</span>
        </div>
        <button
          onClick={handleClose}
          disabled={isGenerating}
          className="cursor-pointer rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Selection info */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/70">
            Área Selecionada
          </div>
          <div className="mt-1 text-sm text-brand-text">
            {cols}×{rows} células · {cols * CELL_SIZE}×{rows * CELL_SIZE}px
          </div>
          <div className="text-[11px] text-brand-muted">
            Prompt: {widthPx}×{heightPx}px
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Nome da Área
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sala do Trono"
            disabled={isGenerating}
            className="w-full rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-amber-500/50 disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Descreva o Ambiente
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            rows={4}
            placeholder="Sala de trono medieval, pedra escura, tapete vermelho central, tochas nas paredes, trono imponente ao fundo..."
            disabled={isGenerating}
            className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted/50 outline-none focus:border-amber-500/50 disabled:opacity-50"
          />
          <div className="mt-1 text-right text-[10px] text-brand-muted">
            {description.length}/300
          </div>
        </div>

        {/* Style badge */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Estilo
          </label>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-sm text-brand-muted">
            🎮 Pixel Art — Top Down
          </div>
        </div>

        {/* Quick references */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Referências Rápidas
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REFS.map((ref) => (
              <button
                key={ref.label}
                onClick={() => handleQuickRef(ref.text)}
                disabled={isGenerating}
                className="cursor-pointer rounded-lg border border-brand-border bg-brand-primary px-2.5 py-1.5 text-[11px] text-brand-muted transition-colors hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-brand-text disabled:opacity-50"
              >
                {ref.emoji} {ref.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-border px-4 py-3">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Gerar Mapa
            </>
          )}
        </button>
      </div>
    </div>
  );
}
