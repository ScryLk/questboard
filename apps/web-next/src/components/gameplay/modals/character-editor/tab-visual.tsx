"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Sparkles, Check, RotateCcw, Upload, X } from "lucide-react";
import type { CampaignCharacter } from "@/types/character";

const PORTRAIT_COLORS = [
  "#6C5CE7",
  "#FF4444",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
  "#A0522D",
  "#6B7280",
  "#FFD700",
  "#FF4757",
  "#8B5CF6",
  "#F59E0B",
];

interface TabVisualProps {
  form: CampaignCharacter;
  onUpdate: (updates: Partial<CampaignCharacter>) => void;
}

export function TabVisual({ form, onUpdate }: TabVisualProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const initials = form.name.slice(0, 2).toUpperCase() || "??";

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        onUpdate({
          spriteUrl: reader.result as string,
          spriteGeneratedByAI: false,
        });
      };
      reader.readAsDataURL(file);
    },
    [onUpdate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <div className="space-y-5">
      {/* Sprite Preview */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Preview
        </h3>
        <div className="flex items-center gap-4">
          {/* Large preview */}
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-brand-border"
            style={{ backgroundColor: form.portraitColor + "15" }}
          >
            {form.spriteUrl ? (
              <img
                src={form.spriteUrl}
                alt="Sprite"
                className="h-16 w-16 rounded-full object-contain"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: form.portraitColor + "40" }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Small previews */}
          <div className="flex gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border"
              style={{ backgroundColor: form.portraitColor + "15" }}
            >
              {form.spriteUrl ? (
                <img
                  src={form.spriteUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-contain"
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ backgroundColor: form.portraitColor + "40" }}
                >
                  {initials}
                </div>
              )}
            </div>
            <div
              className="flex h-6 w-6 items-center justify-center rounded border border-brand-border"
              style={{ backgroundColor: form.portraitColor + "15" }}
            >
              {form.spriteUrl ? (
                <img
                  src={form.spriteUrl}
                  alt=""
                  className="h-5 w-5 rounded-full object-contain"
                />
              ) : (
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[6px] font-bold text-white"
                  style={{ backgroundColor: form.portraitColor + "40" }}
                >
                  {initials.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Clear sprite */}
          {form.spriteUrl && (
            <button
              onClick={() =>
                onUpdate({ spriteUrl: null, spriteGeneratedByAI: false })
              }
              className="flex h-7 items-center gap-1 rounded-md border border-brand-border px-2 text-[10px] text-brand-muted transition-colors hover:text-brand-text"
            >
              <X className="h-3 w-3" />
              Remover
            </button>
          )}
        </div>
      </section>

      {/* Portrait color */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Cor do Retrato
        </h3>
        <div className="flex gap-1.5">
          {PORTRAIT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ portraitColor: c })}
              className={`h-5 w-5 rounded-full border-2 transition-colors ${
                form.portraitColor === c
                  ? "border-white"
                  : "border-transparent hover:border-white/30"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </section>

      {/* Upload */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Upload de Sprite
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragging
              ? "border-brand-accent bg-brand-accent/10"
              : "border-brand-border bg-brand-primary hover:border-brand-accent/50"
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-brand-muted">
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">
              Arraste ou clique para enviar imagem
            </span>
          </div>
        </div>
      </section>

      {/* AI Generation */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Geracao por IA
        </h3>
        <CharacterSpriteGenerator
          form={form}
          onApply={(dataUrl) =>
            onUpdate({
              spriteUrl: dataUrl,
              spriteGeneratedByAI: true,
            })
          }
        />
      </section>
    </div>
  );
}

// ── Character-specific sprite generator ──────────────────────

function CharacterSpriteGenerator({
  form,
  onApply,
}: {
  form: CampaignCharacter;
  onApply: (dataUrl: string) => void;
}) {
  const [prompt, setPrompt] = useState(form.description.slice(0, 200));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  async function handleGenerate() {
    if (!prompt.trim() || prompt.trim().length < 5) {
      setError("Descreva o personagem (minimo 5 caracteres)");
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
          objectName: form.name || "Personagem",
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
      setError("Erro de conexao. Tente novamente.");
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
      <div>
        <label className="mb-1 block text-[10px] text-brand-muted">
          Descreva o sprite que deseja gerar
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 200))}
          placeholder="Ex: Um guerreiro anao com armadura pesada e barba ruiva..."
          rows={2}
          disabled={loading}
          className="w-full resize-none rounded-md border border-brand-border bg-[#0A0A0F] px-2 py-1.5 text-[11px] text-brand-text outline-none placeholder:text-brand-muted/40 focus:border-brand-accent/40 disabled:opacity-50"
        />
        <div className="mt-0.5 text-right text-[9px] text-brand-muted">
          {prompt.length}/200
        </div>
      </div>

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

      {error && <p className="text-[10px] text-red-400">{error}</p>}

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
