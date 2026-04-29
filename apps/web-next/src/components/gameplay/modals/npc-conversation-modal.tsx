"use client";

// Modal de conversa scripted com NPC. GM clica "Conversar" no menu
// radial → este modal abre no centro com saudação, opções clicáveis e
// histórico. Quando uma branch tem `isFinal`, conversa encerra após a
// resposta. Botão "Despedir" mostra farewell e fecha.

import { useEffect, useMemo, useRef } from "react";
import { MessageCircle, MessageSquareDashed, X } from "lucide-react";
import { useCharacterStore } from "@/stores/characterStore";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";
import type { DialogueBranch } from "@/types/character";

export function NpcConversationModal() {
  const activeNpcId = useNpcConversationStore((s) => s.activeNpcId);
  const log = useNpcConversationStore((s) => s.log);
  const finished = useNpcConversationStore((s) => s.finished);
  const selectBranch = useNpcConversationStore((s) => s.selectBranch);
  const finish = useNpcConversationStore((s) => s.finish);
  const close = useNpcConversationStore((s) => s.close);

  const npc = useCharacterStore((s) =>
    activeNpcId ? s.characters.find((c) => c.id === activeNpcId) ?? null : null,
  );

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll quando log cresce.
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log.length]);

  // ESC fecha
  useEffect(() => {
    if (!activeNpcId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeNpcId, close]);

  const branches = useMemo(
    () => (npc?.dialogueBranches ?? []) as DialogueBranch[],
    [npc],
  );

  if (!activeNpcId || !npc) return null;

  const dialogueDisabled = !npc.dialogueEnabled;
  const showOptions = !finished && !dialogueDisabled;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={close}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-brand-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
            style={{
              backgroundColor: npc.portraitColor + "30",
              color: npc.portraitColor,
              border: `2px solid ${npc.portraitColor}`,
            }}
          >
            {npc.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-cinzel text-base font-semibold text-white">
              {npc.name}
            </h2>
            {npc.title && (
              <p className="truncate text-[11px] text-brand-muted">
                {npc.title}
              </p>
            )}
            <div className="mt-0.5 flex items-center gap-1">
              <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-purple-300">
                Scripted
              </span>
              {finished && (
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-300">
                  Encerrada
                </span>
              )}
            </div>
          </div>
          <button
            onClick={close}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Notas do GM (se existirem) */}
        {npc.dialogueNotes && (
          <div className="border-b border-white/10 bg-amber-500/[0.04] px-5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Notas do Mestre
            </p>
            <p className="mt-0.5 whitespace-pre-wrap text-xs italic text-amber-200/80">
              {npc.dialogueNotes}
            </p>
          </div>
        )}

        {/* Log */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {dialogueDisabled ? (
            <div className="flex h-32 items-center justify-center text-center text-xs text-brand-muted">
              <div>
                <MessageSquareDashed className="mx-auto mb-2 h-5 w-5" />
                Diálogo desabilitado para esse personagem. Habilite em
                Editar Personagem → Diálogo.
              </div>
            </div>
          ) : log.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-xs text-brand-muted">
              <div>
                <MessageCircle className="mx-auto mb-2 h-5 w-5" />
                Sem saudação inicial cadastrada — escolha uma opção abaixo.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {log.map((line, i) => (
                <LogBubble
                  key={i}
                  line={line}
                  npcName={npc.name}
                  npcColor={npc.portraitColor}
                />
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Footer / Opções */}
        <footer className="border-t border-white/10 bg-white/[0.02] p-4">
          {showOptions && branches.length > 0 ? (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                Suas opções
              </p>
              <div className="space-y-1.5">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() =>
                      selectBranch(b.id, b.trigger, b.response, b.isFinal)
                    }
                    disabled={!b.trigger.trim() || !b.response.trim()}
                    className="flex w-full items-start gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-white transition-colors hover:border-brand-accent/40 hover:bg-brand-accent/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-brand-accent">›</span>
                    <span className="flex-1">
                      {b.trigger || (
                        <span className="italic text-brand-muted">
                          (opção sem texto)
                        </span>
                      )}
                    </span>
                    {b.isFinal && (
                      <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-rose-300">
                        encerra
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => finish(npc.dialogueFarewell)}
                className="mt-2 w-full rounded-lg border border-white/5 px-3 py-1.5 text-[11px] text-brand-muted transition-colors hover:border-white/15 hover:text-brand-text"
              >
                Despedir-se
              </button>
            </>
          ) : showOptions ? (
            <button
              onClick={() => finish(npc.dialogueFarewell)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-brand-muted transition-colors hover:border-white/20 hover:text-white"
            >
              Despedir-se (sem opções de conversa cadastradas)
            </button>
          ) : (
            <button
              onClick={close}
              className="w-full rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-white hover:bg-brand-accent/85"
            >
              Encerrar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function LogBubble({
  line,
  npcName,
  npcColor,
}: {
  line: { speaker: "npc" | "player"; text: string; at: string };
  npcName: string;
  npcColor: string;
}) {
  if (line.speaker === "npc") {
    return (
      <div className="flex gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
          style={{
            backgroundColor: npcColor + "30",
            color: npcColor,
            border: `1px solid ${npcColor}60`,
          }}
        >
          {npcName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            {npcName}
          </p>
          <div className="mt-0.5 rounded-lg rounded-tl-none border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white">
            <p className="whitespace-pre-wrap">{line.text}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ml-9 flex justify-end">
      <div className="max-w-[80%] rounded-lg rounded-tr-none border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-sm text-brand-text">
        <p className="whitespace-pre-wrap text-xs italic text-brand-accent/90">
          “{line.text}”
        </p>
      </div>
    </div>
  );
}
