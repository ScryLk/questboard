"use client";

// Modal "Contexto da Missão". Mostra um bloco de texto editável (GM)
// ou somente leitura (player) com o briefing da missão atual: objetivo,
// NPCs envolvidos, dicas, próximos passos.
//
// Aberto pelo botão Scroll no rail do gameplay (GM) e via PlayerHeader
// (player). Conteúdo vive no `useMissionContextStore` por enquanto —
// não sincroniza entre usuários (ver TODO no store).

import { useEffect, useRef } from "react";
import { ScrollText, X } from "lucide-react";
import { useMissionContextStore } from "@/lib/mission-context-store";

interface Props {
  /** Quando `true`, esconde o textarea e o conteúdo aparece como bloco
   *  formatado. GM passa false, player passa true. */
  readOnly?: boolean;
}

export function MissionContextModal({ readOnly = false }: Props) {
  const isOpen = useMissionContextStore((s) => s.isOpen);
  const close = useMissionContextStore((s) => s.close);
  const content = useMissionContextStore((s) => s.content);
  const edit = useMissionContextStore((s) => s.edit);
  const loading = useMissionContextStore((s) => s.loading);
  const saving = useMissionContextStore((s) => s.saving);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Foca o textarea ao abrir (modo GM). Tem o efeito colateral de scroll
  // pro topo quando o conteúdo é maior que o viewport — aceitável aqui.
  useEffect(() => {
    if (isOpen && !readOnly) {
      textareaRef.current?.focus();
    }
  }, [isOpen, readOnly]);

  // Esc fecha.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-border bg-[#0D0D12] shadow-2xl"
        style={{ maxHeight: "min(80vh, 720px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-brand-border px-4 py-3">
          <ScrollText className="h-4 w-4 text-brand-accent" />
          <h2 className="flex-1 text-sm font-semibold text-brand-text">
            Contexto da Missão
          </h2>
          <button
            onClick={close}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-xs italic text-brand-muted/70">
              Carregando contexto…
            </p>
          ) : readOnly ? (
            content.trim().length === 0 ? (
              <p className="text-center text-xs italic text-brand-muted/70">
                O mestre ainda não definiu um contexto pra missão.
              </p>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-brand-text">
                {content}
              </pre>
            )
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => edit(e.target.value)}
              placeholder={
                "Briefing da missão atual:\n" +
                "• Objetivo principal\n" +
                "• NPCs envolvidos\n" +
                "• Pistas coletadas\n" +
                "• Próximos passos"
              }
              spellCheck={false}
              maxLength={8000}
              className="h-[420px] w-full resize-none rounded-lg border border-brand-border bg-[#0A0A0F] px-3 py-2 text-sm leading-relaxed text-brand-text outline-none placeholder:text-brand-muted/60 focus:border-brand-accent/60"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-brand-border px-4 py-2">
          <span className="text-[10px] text-brand-muted/70">
            {readOnly
              ? "Atualizado pelo mestre em tempo real."
              : saving
                ? "Salvando…"
                : "Auto-save 750ms após pausar de digitar."}
          </span>
          <button
            onClick={close}
            className="rounded-md bg-brand-accent px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-brand-accent-hover"
          >
            {readOnly ? "Fechar" : "Pronto"}
          </button>
        </div>
      </div>
    </div>
  );
}
