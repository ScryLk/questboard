"use client";

import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  disabledReason?: string;
  active?: boolean;
  badge?: number;
  /** Correção óptica — alguns ícones Lucide (Dice5, MoreHorizontal)
   *  têm massa visual distribuída de forma que parecem deslocados
   *  mesmo centrados matematicamente. Positivo = desce, negativo = sobe. */
  iconOffsetY?: number;
  onClick?: () => void;
}

/**
 * Botão base da bottom bar do jogador. Formato desktop: coluna icon + label.
 * `shortcut` vira tooltip nativo junto com label.
 */
export function PlayerActionButton({
  icon: Icon,
  label,
  shortcut,
  disabled,
  disabledReason,
  active,
  badge,
  iconOffsetY = 0,
  onClick,
}: Props) {
  const tooltip = disabled
    ? disabledReason ?? label
    : shortcut
      ? `${label} (${shortcut})`
      : label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={label}
      className={`relative flex h-10 min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2.5 text-[10px] font-medium leading-none transition-colors ${
        disabled
          ? "cursor-not-allowed text-brand-muted/40"
          : active
            ? "cursor-pointer bg-brand-accent/15 text-brand-accent"
            : "cursor-pointer text-brand-muted hover:bg-white/[0.06] hover:text-brand-text"
      }`}
    >
      <span
        className="flex h-4 items-center justify-center"
        style={iconOffsetY ? { transform: `translateY(${iconOffsetY}px)` } : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      </span>
      <span className="leading-none">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
