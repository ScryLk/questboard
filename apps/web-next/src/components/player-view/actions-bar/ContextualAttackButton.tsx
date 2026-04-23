"use client";

import { useRef } from "react";
import { Swords } from "lucide-react";

interface Props {
  onClick: () => void;
}

/**
 * 6º botão que aparece só quando combate ativo + turno do jogador.
 * Pulse sutil via animação CSS. Debounce 500ms (regra 13.2).
 */
export function ContextualAttackButton({ onClick }: Props) {
  const lastClickRef = useRef(0);

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 500) return;
    lastClickRef.current = now;
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Ataque rápido"
      aria-label="Ataque rápido"
      className="attack-pulse relative flex h-10 min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl bg-brand-accent/15 px-2.5 text-[10px] font-bold leading-none text-brand-accent transition-colors hover:bg-brand-accent/25"
    >
      <span className="flex h-4 items-center justify-center">
        <Swords className="h-4 w-4 shrink-0" strokeWidth={2} />
      </span>
      <span className="leading-none">Ataq.</span>
      <style jsx>{`
        @keyframes qb-attack-pulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(108, 92, 231, 0));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 6px rgba(108, 92, 231, 0.6));
          }
        }
        .attack-pulse {
          animation: qb-attack-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
}
