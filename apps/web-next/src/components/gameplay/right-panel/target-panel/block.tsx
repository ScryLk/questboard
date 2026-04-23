"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useBlockCollapse } from "./use-block-collapse";

interface BlockProps {
  /** id estável pra persistir estado aberto/fechado em localStorage. */
  id: string;
  icon: LucideIcon;
  title: string;
  /** subtítulo/contador à direita do título (ex: "(3)" em Condições). */
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Wrapper colapsível usado pelos blocos do painel Alvo.
 * Guarda estado por `id` no localStorage (via useBlockCollapse).
 */
export function Block({
  id,
  icon: Icon,
  title,
  badge,
  defaultOpen = true,
  children,
}: BlockProps) {
  const [open, toggle] = useBlockCollapse(id, defaultOpen);

  return (
    <div className="border-b border-brand-border">
      <button
        onClick={toggle}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/[0.02]"
      >
        <Icon className="h-3.5 w-3.5 text-brand-accent" />
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-brand-text">
          {title}
        </span>
        {badge}
        {open ? (
          <ChevronDown className="h-3 w-3 text-brand-muted" />
        ) : (
          <ChevronRight className="h-3 w-3 text-brand-muted" />
        )}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}
