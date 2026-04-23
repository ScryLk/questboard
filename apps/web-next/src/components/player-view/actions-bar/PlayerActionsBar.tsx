"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  Crosshair,
  Dice5,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { usePlayerViewStore, type PlayerTab } from "@/lib/player-view-store";
import { useGameplayStore } from "@/lib/gameplay-store";
import { PlayerActionButton } from "./PlayerActionButton";
import { ContextualAttackButton } from "./ContextualAttackButton";
import { DicePopover } from "./DicePopover";
import { MoreMenuPopover } from "./MoreMenuPopover";

type OpenPopover = null | "dice" | "more";

/**
 * Bottom action bar do jogador (desktop ≥md). Os botões Chat/Ficha
 * alternam a aba ativa + visibilidade do painel direito existente —
 * não duplicam conteúdo. Foco centraliza câmera via `requestFocusSelf`.
 *
 * Ataque rápido (6º botão) só aparece em combate + seu turno. Como
 * não há sistema de ataques conectado, o botão abre o popover de
 * dados com um aviso (regra #13.1: nunca fingir funcionalidade).
 */
export function PlayerActionsBar() {
  const myToken = usePlayerViewStore((s) => s.myToken);
  const activeMapId = usePlayerViewStore((s) => s.activeMapId);
  const activeTab = usePlayerViewStore((s) => s.activeTab);
  const panelVisible = usePlayerViewStore((s) => s.panelVisible);
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);
  const setPanelVisible = usePlayerViewStore((s) => s.setPanelVisible);
  const combat = usePlayerViewStore((s) => s.combat);
  const isMyTurn = usePlayerViewStore((s) => s.isMyTurn);
  const requestFocusSelf = usePlayerViewStore((s) => s.requestFocusSelf);
  const messages = usePlayerViewStore((s) => s.messages);

  const [open, setOpen] = useState<OpenPopover>(null);
  // Badge de chat: mensagens desde a última vez que o painel chat foi aberto.
  const [lastSeenCount, setLastSeenCount] = useState(() => messages.length);

  // Zera badge quando o jogador abre o chat (painel + aba chat).
  useEffect(() => {
    if (panelVisible && activeTab === "chat") {
      setLastSeenCount(messages.length);
    }
  }, [panelVisible, activeTab, messages.length]);

  const unreadChat = Math.max(0, messages.length - lastSeenCount);
  const chatPanelOpen = panelVisible && activeTab === "chat";
  const sheetPanelOpen = panelVisible && activeTab === "ficha";

  const togglePanel = useCallback(
    (tab: PlayerTab) => {
      const isOpen = panelVisible && activeTab === tab;
      if (isOpen) {
        setPanelVisible(false);
      } else {
        setActiveTab(tab);
        setPanelVisible(true);
      }
    },
    [panelVisible, activeTab, setActiveTab, setPanelVisible],
  );

  const handleFocus = useCallback(() => {
    if (!myToken) return;
    requestFocusSelf();
  }, [myToken, requestFocusSelf]);

  const focusDisabledReason = !activeMapId
    ? "Nenhum mapa ativo"
    : !myToken
      ? "Sem personagem atribuído"
      : undefined;

  // Atalhos — só disparam se não estiver em input/textarea.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Esc fecha o que estiver aberto.
      if (e.key === "Escape") {
        if (open) setOpen(null);
        return;
      }

      // Só role PLAYER: se estiver como GM na gameplay (mesma aba dev),
      // não mexer nos atalhos da toolbar do mestre.
      const isGM = useGameplayStore.getState().currentUserIsGM;
      if (isGM) return;

      const k = e.key.toLowerCase();
      if (k === "r") {
        e.preventDefault();
        setOpen((o) => (o === "dice" ? null : "dice"));
      } else if (k === "c") {
        e.preventDefault();
        togglePanel("chat");
      } else if (k === "m") {
        e.preventDefault();
        setOpen((o) => (o === "more" ? null : "more"));
      } else if (e.key === "Tab") {
        e.preventDefault();
        togglePanel("ficha");
      }
      // `F` já é tratado pelo PlayerCanvas; não duplicar aqui.
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, togglePanel]);

  const showAttack = !!combat?.active && isMyTurn;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2"
      aria-label="Ações do jogador"
    >
      <div className="pointer-events-auto flex h-[52px] items-center gap-0.5 rounded-2xl border border-brand-border bg-[#0D0D12]/95 px-1.5 shadow-2xl shadow-black/60 backdrop-blur-md">
        <PlayerActionButton
          icon={Crosshair}
          label="Foco"
          shortcut="F"
          disabled={!!focusDisabledReason}
          disabledReason={focusDisabledReason}
          onClick={handleFocus}
        />

        {showAttack && (
          <ContextualAttackButton onClick={() => setOpen("dice")} />
        )}

        <div className="relative flex h-full items-center">
          <PlayerActionButton
            icon={Dice5}
            label="Dados"
            shortcut="R"
            active={open === "dice"}
            onClick={() =>
              setOpen((o) => (o === "dice" ? null : "dice"))
            }
          />
          {open === "dice" && (
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2">
              <DicePopover onClose={() => setOpen(null)} />
            </div>
          )}
        </div>

        <PlayerActionButton
          icon={MessageCircle}
          label="Chat"
          shortcut="C"
          active={chatPanelOpen}
          badge={chatPanelOpen ? 0 : unreadChat}
          onClick={() => togglePanel("chat")}
        />

        <PlayerActionButton
          icon={ClipboardList}
          label="Ficha"
          shortcut="Tab"
          disabled={!myToken}
          disabledReason="Sem personagem atribuído"
          active={sheetPanelOpen}
          onClick={() => togglePanel("ficha")}
        />

        <div className="mx-0.5 h-6 w-px bg-brand-border" aria-hidden />

        <div className="relative flex h-full items-center">
          <PlayerActionButton
            icon={MoreHorizontal}
            label="Mais"
            shortcut="M"
            active={open === "more"}
            onClick={() =>
              setOpen((o) => (o === "more" ? null : "more"))
            }
          />
          {open === "more" && (
            <div className="absolute bottom-full right-0 mb-2">
              <MoreMenuPopover onClose={() => setOpen(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
