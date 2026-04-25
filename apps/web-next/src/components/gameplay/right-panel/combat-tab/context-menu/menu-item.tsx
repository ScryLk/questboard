"use client";

// Item visual do menu — separado pra ser reusado no menu principal e no
// submenu de condições. Mesmo padrão do token-context-menu/MenuItem.

import { ChevronRight } from "lucide-react";
import type { ComponentType } from "react";

interface Props {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  onHover?: () => void;
  hasSubmenu?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  active?: boolean;
}

export function MenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  onHover,
  hasSubmenu,
  destructive,
  disabled,
  active,
}: Props) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed text-brand-muted/50"
          : destructive
            ? "text-brand-danger hover:bg-brand-danger/10"
            : active
              ? "bg-brand-accent/10 text-brand-accent"
              : "text-brand-text hover:bg-white/5"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="text-[9px] tabular-nums text-brand-muted">
          {shortcut}
        </span>
      )}
      {hasSubmenu && (
        <ChevronRight className="h-3 w-3 shrink-0 text-brand-muted" />
      )}
    </button>
  );
}

export function MenuGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 px-2 pb-0.5 pt-1 text-[9px] font-bold uppercase tracking-wider text-brand-muted">
      {children}
    </div>
  );
}

export function MenuDivider() {
  return <div className="my-1 border-t border-brand-border/50" />;
}
