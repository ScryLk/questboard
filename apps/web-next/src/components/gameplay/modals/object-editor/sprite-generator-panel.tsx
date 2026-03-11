"use client";

import { useState } from "react";
import { Loader2, Sparkles, Check, RotateCcw } from "lucide-react";
import type { CampaignObject } from "@/types/object";

interface SpriteGeneratorPanelProps {
  form: CampaignObject;
  onApply: (dataUrl: string) => void;
}

export function SpriteGeneratorPanel({
  form,
  onApply,
}: SpriteGeneratorPanelProps) {
  const [prompt, setPrompt] = useState(form.description.slice(0, 200));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || prompt.trim().length < 5) {
      setError("Descreva o objeto (mínimo 5 caracteres)");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const res = await fetch("/api/ai/generate-sprite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          objectName: form.name || "Objeto",
          category: form.category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar sprite");
        return;
      }

      const dataUrl = `data:${data.mimeType};base64,${data.imageBase64}`;
      setGeneratedUrl(dataUrl);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (generatedUrl) {
      onApply(generatedUrl);
      setGeneratedUrl(null);
      setPrompt("");
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-3">
      {/* Prompt input */}
      <div>
        <label className="mb-1 block text-[10px] text-brand-muted">
          Descreva o sprite que deseja gerar
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 200))}
          placeholder="Ex: Um baú de madeira antigo com detalhes em ouro..."
          rows={2}
          disabled={loading}
          className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40 disabled:opacity-50"
        />
        <div className="mt-0.5 text-right text-[9px] text-brand-muted">
          {prompt.length}/200
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-accent px-3 py-2 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Gerar Sprite
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}

      {/* Generated preview */}
      {generatedUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-center rounded-lg border border-brand-border bg-[#0A0A0F] p-4">
            <img
              src={generatedUrl}
              alt="Sprite gerado"
              className="h-24 w-24 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-brand-success/20 px-3 py-1.5 text-[10px] font-medium text-brand-success transition-colors hover:bg-brand-success/30"
            >
              <Check className="h-3 w-3" />
              Usar Sprite
            </button>
            <button
              onClick={handleGenerate}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-[10px] font-medium text-brand-muted transition-colors hover:text-brand-text"
            >
              <RotateCcw className="h-3 w-3" />
              Gerar Outro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
