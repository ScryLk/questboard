"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  FileText,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { OnlinePlayersSection } from "./OnlinePlayersSection";
import { SettingsDialog } from "./SettingsDialog";
import { LeaveSessionDialog } from "./LeaveSessionDialog";

interface Props {
  onClose: () => void;
}

type Section = "menu" | "players";

/**
 * Popover "Mais" com sub-itens. Handouts omitidos (backend ausente).
 * Settings e Sair abrem modais fullscreen próprios.
 */
export function MoreMenuPopover({ onClose }: Props) {
  const [section, setSection] = useState<Section>("menu");
  const [showSettings, setShowSettings] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (showSettings || showLeave) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (showSettings || showLeave) return;
      if (section !== "menu") {
        setSection("menu");
        return;
      }
      onClose();
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, section, showSettings, showLeave]);

  return (
    <>
      <div
        ref={ref}
        className="flex max-h-[480px] w-[260px] flex-col overflow-hidden rounded-lg border border-brand-border bg-[#0D0D12] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-brand-border px-3 py-2">
          {section !== "menu" ? (
            <button
              type="button"
              onClick={() => setSection("menu")}
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-brand-text">
            {section === "menu" ? "Mais" : "Na sessão agora"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {section === "menu" && (
            <div className="flex flex-col py-1">
              <MenuItem
                icon={FileText}
                label="Handouts recebidos"
                hint="Em breve"
                disabled
              />
              <MenuItem
                icon={Users}
                label="Jogadores online"
                onClick={() => setSection("players")}
              />
              <MenuItem
                icon={Settings}
                label="Configurações"
                onClick={() => setShowSettings(true)}
              />
              <div className="my-1 mx-2 border-t border-brand-border" />
              <MenuItem
                icon={LogOut}
                label="Sair da sessão"
                danger
                onClick={() => setShowLeave(true)}
              />
            </div>
          )}

          {section === "players" && <OnlinePlayersSection />}
        </div>
      </div>

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
      {showLeave && <LeaveSessionDialog onClose={() => setShowLeave(false)} />}
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  onClick,
  disabled,
  danger,
}: {
  icon: typeof Settings;
  label: string;
  hint?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? hint : undefined}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed text-brand-muted/50"
          : danger
            ? "cursor-pointer text-brand-danger hover:bg-brand-danger/10"
            : "cursor-pointer text-brand-text hover:bg-white/[0.04]"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">{label}</span>
      {hint && !disabled && (
        <span className="text-[9px] text-brand-muted/60">{hint}</span>
      )}
      {disabled && hint && (
        <span className="text-[9px] italic text-brand-muted/50">{hint}</span>
      )}
    </button>
  );
}
