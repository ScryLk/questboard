"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { PlayerViewLayout } from "@/components/player-view/PlayerViewLayout";
import { WaitingForGM } from "@/components/player-view/connection/WaitingForGM";
import { BroadcastSync } from "@/components/player-view/connection/BroadcastSync";

export default function PlayerSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string)?.toUpperCase() ?? "";
  const nameParam = searchParams.get("name") ?? "";

  const joinStep = usePlayerViewStore((s) => s.joinStep);
  const setSessionCode = usePlayerViewStore((s) => s.setSessionCode);
  const setPlayerName = usePlayerViewStore((s) => s.setPlayerName);
  const setJoinStep = usePlayerViewStore((s) => s.setJoinStep);
  const setConnected = usePlayerViewStore((s) => s.setConnected);

  useEffect(() => {
    setSessionCode(code);
    if (nameParam) {
      setPlayerName(nameParam);
    }
    // Auto-connect for demo — skip waiting step
    setJoinStep("playing");
    setConnected(true);
  }, [code, nameParam, setSessionCode, setPlayerName, setJoinStep, setConnected]);

  return (
    <>
      {/* BroadcastChannel sync — always mounted */}
      <BroadcastSync />

      {joinStep === "waiting-gm" && <WaitingForGM />}
      {joinStep === "playing" && <PlayerViewLayout />}
    </>
  );
}
