"use client";

import { useEffect } from "react";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerCanvas } from "./PlayerCanvas";
import { PlayerPanel } from "./PlayerPanel";
import { TurnBanner } from "./overlays/TurnBanner";
import { SceneCardOverlay } from "./overlays/SceneCardOverlay";
import { SessionPausedOverlay } from "./overlays/SessionPausedOverlay";
import { DamageVignette } from "./effects/DamageVignette";
import { HealGlow } from "./effects/HealGlow";
import { ScreenShake } from "./effects/ScreenShake";
import { NatCelebration } from "./effects/NatCelebration";
import { QuickBar } from "@/app/play/[code]/_components/QuickBar";
import { WhisperOverlay } from "@/app/play/[code]/_components/WhisperOverlay";
import { NpcDialogueScreen } from "@/components/npc-conversation/NpcDialogueScreen";
import { NpcConversationSync } from "@/components/npc-conversation/NpcConversationSync";
import { useNpcConversationStore } from "@/lib/npc-conversation-store";

export function PlayerViewLayout() {
  const panelVisible = usePlayerViewStore((s) => s.panelVisible);
  const sessionPaused = usePlayerViewStore((s) => s.sessionPaused);
  const sessionEnded = usePlayerViewStore((s) => s.sessionEnded);
  const activeScene = usePlayerViewStore((s) => s.activeScene);
  const combat = usePlayerViewStore((s) => s.combat);
  const screenShake = usePlayerViewStore((s) => s.screenShake);
  const pendingWhisper = usePlayerViewStore((s) => s.pendingWhisper);
  const activePlayerConversationId = useNpcConversationStore((s) => s.activePlayerConversationId);

  // Transition to end screen when session ends
  useEffect(() => {
    if (sessionEnded) {
      usePlayerViewStore.getState().setJoinStep("ended");
    }
  }, [sessionEnded]);

  return (
    <div
      className="bg-[#0A0A0F]"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <PlayerHeader />
      </div>

      {/* Turn banner */}
      {combat?.active && <TurnBanner />}

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Canvas area with screen shake */}
        <ScreenShake active={screenShake}>
          <PlayerCanvas />
        </ScreenShake>

        {/* Right panel — desktop only */}
        {panelVisible && (
          <aside
            className="hidden border-l border-brand-border md:block"
            style={{
              width: 280,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <PlayerPanel />
          </aside>
        )}
      </div>

      {/* Quick bar — mobile only, above bottom tabs */}
      <div className="md:hidden" style={{ flexShrink: 0 }}>
        <QuickBar />
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden" style={{ flexShrink: 0 }}>
        <MobileBottomTabs />
      </div>

      {/* Effects overlay layer */}
      <DamageVignette />
      <HealGlow />
      <NatCelebration />

      {/* Whisper overlay */}
      {pendingWhisper && <WhisperOverlay />}

      {/* Modal overlays */}
      {activeScene && <SceneCardOverlay scene={activeScene} />}
      {sessionPaused && <SessionPausedOverlay />}

      {/* NPC dialogue fullscreen */}
      {activePlayerConversationId && <NpcDialogueScreen />}

      {/* NPC conversation sync */}
      <NpcConversationSync role="player" />
    </div>
  );
}

// ── Mobile bottom tabs ────────────────────────────────────────

import { Map, MessageCircle, User, Dices, Swords } from "lucide-react";
import type { PlayerTab } from "@/lib/player-view-store";

const MOBILE_TABS: { key: PlayerTab | "mapa"; label: string; icon: typeof Map }[] = [
  { key: "mapa", label: "Mapa", icon: Map },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "ficha", label: "Ficha", icon: User },
  { key: "dados", label: "Dados", icon: Dices },
  { key: "combate", label: "Combate", icon: Swords },
];

function MobileBottomTabs() {
  const activeTab = usePlayerViewStore((s) => s.activeTab);
  const setActiveTab = usePlayerViewStore((s) => s.setActiveTab);
  const panelVisible = usePlayerViewStore((s) => s.panelVisible);
  const setPanelVisible = usePlayerViewStore((s) => s.setPanelVisible);

  const handleTabClick = (key: string) => {
    if (key === "mapa") {
      setPanelVisible(false);
    } else {
      setActiveTab(key as PlayerTab);
      setPanelVisible(true);
    }
  };

  const currentKey = panelVisible ? activeTab : "mapa";

  return (
    <div className="flex border-t border-brand-border bg-[#0D0D12]" style={{ height: 56 }}>
      {MOBILE_TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleTabClick(key)}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
            currentKey === key
              ? "text-brand-accent"
              : "text-brand-muted"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
