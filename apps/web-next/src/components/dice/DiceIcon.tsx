"use client";

/**
 * Ícones SVG por tipo de dado. Shape segue convenção física:
 * d4 triângulo, d6 quadrado, d8 diamante, d10 pentágono, d12 hexágono,
 * d20 hexágono-icosaedro estilizado, d100 círculo duplo.
 *
 * Cor vem de `currentColor` — quem usa controla via Tailwind/text-*.
 */

type DiceKind = 4 | 6 | 8 | 10 | 12 | 20 | 100;

interface Props {
  sides: number;
  className?: string;
}

export function DiceIcon({ sides, className }: Props) {
  const kind: DiceKind = [4, 6, 8, 10, 12, 20, 100].includes(sides)
    ? (sides as DiceKind)
    : 20;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {renderShape(kind)}
    </svg>
  );
}

function renderShape(kind: DiceKind) {
  switch (kind) {
    case 4:
      return <polygon points="12,3 21,20 3,20" />;
    case 6:
      return <rect x="4" y="4" width="16" height="16" rx="2.5" />;
    case 8:
      return <polygon points="12,2 22,12 12,22 2,12" />;
    case 10:
      return <polygon points="12,3 21,9.5 17.5,20.5 6.5,20.5 3,9.5" />;
    case 12:
      return <polygon points="12,2.5 20,6.5 20,17.5 12,21.5 4,17.5 4,6.5" />;
    case 20:
      return (
        <>
          <polygon points="12,2.5 20,6.5 20,17.5 12,21.5 4,17.5 4,6.5" />
          <path d="M4 6.5 L20 17.5 M20 6.5 L4 17.5" strokeWidth={1} opacity={0.5} />
        </>
      );
    case 100:
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </>
      );
  }
}
