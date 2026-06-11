"use client";

// Modal de atribuir personagem a um jogador (vista do GM). Resolve o
// caso "Sem personagem atribuído" no player view — o jogador entrou
// sem `characterId` setado e fica travado no overlay.
//
// Fluxo: lista os personagens do JOGADOR-ALVO (próprios dele, não do
// GM), GM escolhe um → PATCH atribui ao SessionPlayer, cria token na
// mapa ativa, backend emite `player:force-resync` → cliente do alvo
// recarrega sozinho via usePlayerResyncListener.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, UserCheck, X } from "lucide-react";
import {
  assignPlayerCharacter,
  listPlayerAvailableCharacters,
  type AvailableCharactersResult,
} from "@/lib/session-players-api";
import { useGameplayStore } from "@/lib/gameplay-store";

interface Props {
  sessionId: string;
  targetUserId: string;
  targetPlayerName: string;
  onClose: () => void;
}

export function AssignCharacterModal({
  sessionId,
  targetUserId,
  targetPlayerName,
  onClose,
}: Props) {
  const [data, setData] = useState<AvailableCharactersResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const addToast = useGameplayStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await listPlayerAvailableCharacters(
          sessionId,
          targetUserId,
        );
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            (err as { message?: string }).message ??
              "Falha ao carregar personagens.",
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, targetUserId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !assigningId) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, assigningId]);

  async function handleAssign(characterId: string, characterName: string) {
    setAssigningId(characterId);
    setError(null);
    try {
      await assignPlayerCharacter(sessionId, targetUserId, characterId);
      addToast(
        `${characterName} atribuído a ${targetPlayerName}. O jogador será recarregado.`,
      );
      onClose();
    } catch (err) {
      setError(
        (err as { message?: string }).message ??
          "Falha ao atribuir personagem.",
      );
      setAssigningId(null);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Atribuir personagem para ${targetPlayerName}`}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !assigningId) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-brand-border bg-brand-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-brand-text">
              Atribuir personagem
            </h2>
            <p className="truncate text-[11px] text-brand-muted">
              Jogador: {targetPlayerName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={!!assigningId}
            className="rounded p-1 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:opacity-50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-brand-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando personagens...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-center text-xs text-rose-300">
              {error}
            </div>
          ) : !data || data.characters.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-brand-muted">
                Este jogador ainda não criou nenhum personagem.
              </p>
              <p className="mt-2 text-[10px] text-brand-muted/70">
                Peça pra ele criar um na aba Personagens antes de atribuir.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {data.characters.map((char) => {
                const isCurrent = char.id === data.currentCharacterId;
                const isAssigning = assigningId === char.id;
                const disabled = !!assigningId || isCurrent;
                return (
                  <li key={char.id}>
                    <button
                      onClick={() => handleAssign(char.id, char.name)}
                      disabled={disabled}
                      className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors ${
                        isCurrent
                          ? "bg-brand-accent/10 text-brand-accent"
                          : disabled
                            ? "cursor-not-allowed text-brand-muted opacity-60"
                            : "text-brand-text hover:bg-white/5"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[10px] font-bold text-brand-text">
                        {char.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={char.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          char.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {char.name}
                        </p>
                        <p className="truncate text-[10px] text-brand-muted">
                          {char.system} · Nv {char.level}
                        </p>
                      </div>
                      {isAssigning ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-accent" />
                      ) : isCurrent ? (
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                          <UserCheck className="h-3 w-3" />
                          Atual
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
