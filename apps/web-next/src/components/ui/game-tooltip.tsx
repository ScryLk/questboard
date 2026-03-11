"use client";

interface GameTooltipProps {
  label: string;
  description?: string;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const SIDE_CLASSES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
} as const;

export function GameTooltip({
  label,
  description,
  shortcut,
  side = "bottom",
  children,
}: GameTooltipProps) {
  return (
    <div className="group/tip relative inline-flex">
      {children}
      <div
        className={`pointer-events-none absolute z-[999] whitespace-nowrap rounded-lg border border-[#2A2A3A] bg-[#1C1C28] px-3 py-2 opacity-0 shadow-xl transition-opacity duration-150 delay-0 group-hover/tip:opacity-100 group-hover/tip:delay-400 ${SIDE_CLASSES[side]}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-white">{label}</span>
          {shortcut && (
            <span className="rounded bg-[#2A2A3A] px-1.5 py-0.5 font-mono text-[11px] text-[#9B9BAF]">
              {shortcut}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 max-w-[200px] whitespace-normal text-[12px] text-[#6B6B7E]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
