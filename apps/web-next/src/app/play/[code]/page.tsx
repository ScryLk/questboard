"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { onBroadcastMessage } from "@/lib/broadcast-sync";
import { PlayerViewLayout } from "@/components/player-view/PlayerViewLayout";
import { BroadcastSync } from "@/components/player-view/connection/BroadcastSync";
import { DuplicateTabGuard } from "./_components/DuplicateTabGuard";
import { JoinScreen } from "./_components/JoinScreen";
import { LobbyScreen } from "./_components/LobbyScreen";
import { EndScreen } from "./_components/EndScreen";
import { SessionPausedScreen } from "./_components/SessionPausedScreen";

export default function PlayerSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string)?.toUpperCase() ?? "";
  const nameParam = searchParams.get("name") ?? "";

  const joinStep = usePlayerViewStore((s) => s.joinStep);
  const sessionPaused = usePlayerViewStore((s) => s.sessionPaused);
  const setSessionCode = usePlayerViewStore((s) => s.setSessionCode);
  const setPlayerName = usePlayerViewStore((s) => s.setPlayerName);

  useEffect(() => {
    setSessionCode(code);
    if (nameParam) {
      setPlayerName(nameParam);
    }
  }, [code, nameParam, setSessionCode, setPlayerName]);

  // Session lifecycle from the GM tab (start while in lobby, end at any point)
  useEffect(() => {
    const cleanup = onBroadcastMessage("player-join-flow", (msg) => {
      if (msg.senderId.startsWith("player")) return;
      const store = usePlayerViewStore.getState();
      switch (msg.type) {
        case "lobby:session-start":
          if (store.joinStep === "waiting-gm") store.setJoinStep("playing");
          break;
        case "gm:session-end":
          store.setSessionEnded(true);
          store.setJoinStep("ended");
          break;
        case "gm:session-pause":
          store.setSessionPaused(true);
          break;
        case "gm:session-resume":
          store.setSessionPaused(false);
          break;
      }
    });
    return cleanup;
  }, []);

  // F-04: If session is paused during lobby, show paused screen
  const showPaused = sessionPaused && joinStep === "waiting-gm";

  return (
    <>
      {/* F-37: Detect duplicate tabs for same session */}
      <DuplicateTabGuard sessionCode={code} />

      {/* BroadcastChannel sync — mounted only during gameplay */}
      {joinStep === "playing" && <BroadcastSync />}

      {/* Join flow screens */}
      {joinStep === "enter-code" && <JoinScreen sessionCode={code} />}
      {joinStep === "waiting-gm" && !showPaused && <LobbyScreen />}
      {showPaused && <SessionPausedScreen />}
      {joinStep === "playing" && <PlayerViewLayout />}
      {joinStep === "ended" && <EndScreen />}
    </>
  );
}
