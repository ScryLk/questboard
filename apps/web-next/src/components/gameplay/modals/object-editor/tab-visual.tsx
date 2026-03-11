"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { CampaignObject } from "@/types/object";
import { SpriteGeneratorPanel } from "./sprite-generator-panel";

const SPRITE_COLORS = [
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
  form: CampaignObject;
  onUpdate: (updates: Partial<CampaignObject>) => void;
}

export function TabVisual({ form, onUpdate }: TabVisualProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

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
            style={{ backgroundColor: form.spriteColor + "15" }}
          >
            {form.spriteUrl ? (
              <img
                src={form.spriteUrl}
                alt="Sprite"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <span className="text-4xl">{form.spriteEmoji}</span>
            )}
          </div>

          {/* Small previews */}
          <div className="flex gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border"
              style={{ backgroundColor: form.spriteColor + "15" }}
            >
              {form.spriteUrl ? (
                <img
                  src={form.spriteUrl}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-lg">{form.spriteEmoji}</span>
              )}
            </div>
            <div
              className="flex h-6 w-6 items-center justify-center rounded border border-brand-border"
              style={{ backgroundColor: form.spriteColor + "15" }}
            >
              {form.spriteUrl ? (
                <img
                  src={form.spriteUrl}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <span className="text-[10px]">{form.spriteEmoji}</span>
              )}
            </div>
          </div>

          {/* Clear sprite button */}
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

      {/* Emoji fallback */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Emoji (fallback)
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={form.spriteEmoji}
            onChange={(e) => onUpdate({ spriteEmoji: e.target.value })}
            className="h-8 w-16 rounded-md border border-brand-border bg-brand-primary text-center text-lg text-brand-text outline-none focus:border-brand-accent/40"
          />
          <span className="text-[10px] text-brand-muted">
            Usado quando nao ha sprite
          </span>
        </div>
      </section>

      {/* Accent color */}
      <section>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
          Cor de destaque
        </h3>
        <div className="flex gap-1.5">
          {SPRITE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdate({ spriteColor: c })}
              className={`h-5 w-5 rounded-full border-2 transition-colors ${
                form.spriteColor === c
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
        <SpriteGeneratorPanel
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
