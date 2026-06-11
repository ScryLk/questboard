// ── Logo da marca QuestBoard ──
//
// Wrapper sobre `next/image` que serve o PNG da marca em /brand/logo.png.
// `next/image` cuida do resize/WebP/lazy-load — o arquivo fonte é
// 2048×2048; nunca renderize em tamanho próximo do original em UI.
//
// Variantes:
//   - `mark`  → só o símbolo (mago). Use em sidebar colapsada, favicon,
//               avatares fallback, toasts pequenos.
//   - `full`  → símbolo + texto "QuestBoard". Use em sidebar expandida,
//               splash, header público, JoinScreen.
//
// Cor do texto segue `text-brand-accent`. Pra contextos onde o roxo
// não combina (PDF dark/light), passe `textClassName` pra sobrescrever.

import Image from "next/image";

type LogoVariant = "mark" | "full";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<LogoSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 80,
};

const TEXT_CLASS: Record<LogoSize, string> = {
  xs: "text-[10px] font-bold tracking-wider",
  sm: "text-sm font-bold tracking-wide",
  md: "text-lg font-bold tracking-wide",
  lg: "text-2xl font-bold tracking-wide",
  xl: "font-cinzel text-3xl font-bold tracking-wider",
};

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  textClassName?: string;
  /** `true` → marca + texto vão como `priority` no `next/image`. Use no
   *  topo da sidebar e tela de login pra evitar flash inicial. */
  priority?: boolean;
}

export function Logo({
  variant = "full",
  size = "md",
  className = "",
  textClassName,
  priority = false,
}: LogoProps) {
  const px = SIZE_PX[size];
  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="QuestBoard"
    >
      <Image
        src="/brand/logo.png"
        alt=""
        width={px}
        height={px}
        priority={priority}
        className="select-none"
        draggable={false}
      />
      {variant === "full" && (
        <span
          className={`${textClassName ?? "text-brand-accent"} ${TEXT_CLASS[size]}`}
        >
          QuestBoard
        </span>
      )}
    </span>
  );
}
