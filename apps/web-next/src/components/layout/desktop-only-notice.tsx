"use client";

import { Monitor } from "lucide-react";

interface DesktopOnlyNoticeProps {
  /** Nome curto do feature pra personalizar mensagem. Ex: "A gameplay". */
  featureName?: string;
  /** Conteúdo real do feature — renderizado só em `>=lg`. */
  children: React.ReactNode;
}

/**
 * Gate: renderiza o children em tela grande (`>=lg` = 1024px+) e troca
 * por um aviso amigável em telas menores.
 *
 * Usado em features desktop-first (gameplay, maps editor) enquanto não
 * existe versão mobile dessas telas. Veja a auditoria (AUDIT_REPORT.md,
 * Seção 2) pra contexto da decisão.
 *
 * Estratégia: **ambos** (children e aviso) existem na árvore; Tailwind
 * esconde um ou outro com `hidden lg:block` / `lg:hidden`. Assim o
 * estado interno dos componentes persiste quando o usuário redimensiona
 * o browser (sem remount), e o SSR gera markup consistente.
 */
export function DesktopOnlyNotice({
  featureName = "Essa tela",
  children,
}: DesktopOnlyNoticeProps) {
  return (
    <>
      {/* Mobile (<lg) — aviso */}
      <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-6 py-12 text-center lg:hidden">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/10">
          <Monitor className="h-7 w-7 text-brand-accent" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-brand-text">
            Requer desktop
          </h2>
          <p className="max-w-xs text-sm text-brand-muted">
            {featureName} usa controles que só funcionam bem em telas maiores.
            Abra em um notebook ou monitor.
          </p>
        </div>
        <p className="max-w-xs text-[11px] text-brand-muted/60">
          No celular, acesse a{" "}
          <span className="text-brand-accent">/play/[código]</span> como
          jogador — é otimizada pra touch.
        </p>
      </div>

      {/* Desktop (>=lg) — feature completa */}
      <div className="hidden h-full lg:block">{children}</div>
    </>
  );
}
