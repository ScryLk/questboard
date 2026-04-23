"use client";

import { useEffect, useRef, useState } from "react";
import { EyeOff, ImagePlus, Send, X } from "lucide-react";
import { useGameplayStore } from "@/lib/gameplay-store";
import { broadcastSend } from "@/lib/broadcast-sync";
import type { ChatMessage, GameToken } from "@/lib/gameplay-mock-data";
import { MOCK_PLAYERS } from "@/lib/gameplay-mock-data";

interface Props {
  token: GameToken;
  onClose: () => void;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB guardrail pra não inchar store

/**
 * Dialog do GM pra sussurrar pro dono de um token. Texto + imagem
 * opcional (data URL — frontend-only por ora). Mensagem vai como
 * `channel: "sussurro"` + `whisperTo: playerId` — o `BroadcastSync`
 * filtra pra só o destinatário receber.
 */
export function WhisperDialog({ token, onClose }: Props) {
  const addMessage = useGameplayStore((s) => s.addMessage);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const player = MOCK_PLAYERS.find((p) => p.id === token.playerId);
  const displayName = player?.name ?? token.playerId ?? "Jogador";

  useEffect(() => {
    textRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePickImage = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Arquivo precisa ser uma imagem.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Imagem muito grande (máx 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSend = !!token.playerId && (text.trim().length > 0 || !!imageUrl);

  const handleSend = () => {
    if (!canSend || !token.playerId) return;

    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      channel: "sussurro",
      type: "whisper",
      sender: "GM",
      senderInitials: "GM",
      isGM: true,
      content: text.trim() || (imageUrl ? "[imagem]" : ""),
      timestamp,
      whisperTo: token.playerId,
      imageUrl: imageUrl ?? undefined,
    };

    addMessage(msg);
    broadcastSend("gm:chat-message", msg, "gm");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-brand-border bg-[#0D0D12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-brand-accent" />
            <h2 className="text-sm font-semibold text-brand-text">
              Sussurrar para {displayName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-3">
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem privada pra este jogador..."
            rows={4}
            className="w-full resize-none rounded-lg border border-brand-border bg-brand-primary px-3 py-2 text-xs text-brand-text outline-none placeholder:text-brand-muted/50 focus:border-brand-accent/40"
          />

          {imageUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-brand-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Anexo"
                className="max-h-48 w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="Remover imagem"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePickImage}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand-border py-3 text-[11px] text-brand-muted transition-colors hover:border-brand-accent/40 hover:text-brand-text"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Anexar imagem (opcional)
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />

          {error && (
            <p className="text-[10px] text-brand-danger">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-brand-border px-4 py-2">
          <span className="text-[9px] text-brand-muted/60">
            Ctrl+Enter envia
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-text transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              Sussurrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
