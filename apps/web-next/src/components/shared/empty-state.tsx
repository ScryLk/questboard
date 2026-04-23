"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** 1–3 linhas explicando a situação. Pode ser JSX pra ênfase. */
  description?: React.ReactNode;
  /** Ação opcional — tipicamente botão. */
  action?: React.ReactNode;
  /** "sm" reduz padding pra caber em sidebars estreitas. Default "md". */
  size?: "sm" | "md";
  /** Cor do icon. Default "muted". "accent" pra destaque positivo. */
  tone?: "muted" | "accent" | "warning";
  className?: string;
}

/**
 * Empty state consistente em pt-BR. Usar sempre que um container tem
 * conteúdo vazio por legítima ausência de dados (não por loading).
 *
 * Tom honesto (prompt do player view seção 2): se a feature está
 * genuinamente "em breve" ou "aguardando ação do GM", dizer isso
 * em vez de fingir que funciona.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  tone = "muted",
  className,
}: EmptyStateProps) {
  const iconColor =
    tone === "accent"
      ? "text-brand-accent/70"
      : tone === "warning"
        ? "text-brand-warning/70"
        : "text-brand-muted/50";

  const padding = size === "sm" ? "p-4 gap-2" : "p-6 gap-3";
  const iconSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const titleSize = size === "sm" ? "text-xs" : "text-sm";
  const descSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <div
      className={`flex h-full flex-col items-center justify-center text-center ${padding} ${className ?? ""}`}
    >
      <Icon className={`${iconSize} ${iconColor}`} />
      <div className="space-y-1">
        <p className={`${titleSize} font-semibold text-brand-text`}>{title}</p>
        {description && (
          <p className={`${descSize} max-w-xs text-brand-muted/80`}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
