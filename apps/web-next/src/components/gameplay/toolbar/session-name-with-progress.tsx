"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SessionInfo } from "@/lib/gameplay-mock-data";
import { useNarrativeStore } from "@/stores/narrativeStore";
import { GameTooltip } from "@/components/ui/game-tooltip";
import { StoryQuickModal } from "./story-quick/story-quick-modal";

interface SessionNameWithProgressProps {
  session: SessionInfo;
}

export function SessionNameWithProgress({
  session,
}: SessionNameWithProgressProps) {
  const router = useRouter();
  const toggleStoryPanel = useNarrativeStore((s) => s.toggleStoryPanel);
  const getProgress = useNarrativeStore((s) => s.getProgress);

  const { percent } = getProgress();

  return (
    <div className="relative flex min-w-0 shrink items-center gap-3">
      <GameTooltip label="Voltar ao Dashboard" side="bottom">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-1.5 text-brand-muted transition-colors hover:text-brand-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </GameTooltip>

      <button
        onClick={toggleStoryPanel}
        className="group flex min-w-0 flex-col gap-0.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/[0.04]"
      >
        {/* Row 1: Session name + campaign + chevron */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-brand-text">
            Sessao #{session.number} — {session.name}
          </span>
          <span className="shrink-0 text-xs text-brand-muted">
            {session.campaign}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-brand-muted transition-transform group-hover:text-brand-text" />
        </div>

        {/* Row 2: Progress bar + percentage */}
        <div className="flex items-center gap-2">
          <div className="h-1 w-20 shrink-0 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-brand-accent transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-brand-muted">
            {percent}%
          </span>
        </div>
      </button>

      {/* Story dropdown — positioned next to session info */}
      <StoryQuickModal />
    </div>
  );
}
