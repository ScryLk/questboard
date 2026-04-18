"use client";

interface NpcThinkingIndicatorProps {
  npcName: string;
}

export function NpcThinkingIndicator({ npcName }: NpcThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-[#7c5cfc]" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-[#7c5cfc]" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-[#7c5cfc]" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs italic text-[#555]">
        {npcName} está pensando…
      </span>
    </div>
  );
}
