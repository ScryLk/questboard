import { getHpColor, getHpPercent } from "@/lib/gameplay-mock-data";

interface HPBarProps {
  hp: number;
  maxHp: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

export function HPBar({
  hp,
  maxHp,
  height = 4,
  showText = false,
  className = "",
}: HPBarProps) {
  const percent = getHpPercent(hp, maxHp);
  const color = getHpColor(percent);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 overflow-hidden rounded-full bg-white/10"
        style={{ height }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      {showText && (
        <span className="shrink-0 text-[11px] tabular-nums text-brand-muted">
          {hp}/{maxHp}
        </span>
      )}
    </div>
  );
}
