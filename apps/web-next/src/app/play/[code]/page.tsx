"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { usePlayerViewStore } from "@/lib/player-view-store";
import { PlayerViewLayout } from "@/components/player-view/PlayerViewLayout";
import { BroadcastSync } from "@/components/player-view/connection/BroadcastSync";
import { JoinScreen } from "./_components/JoinScreen";
import { LobbyScreen } from "./_components/LobbyScreen";
import { EndScreen } from "./_components/EndScreen";

export default function PlayerSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = (params.code as string)?.toUpperCase() ?? "";
  const nameParam = searchParams.get("name") ?? "";

  const joinStep = usePlayerViewStore((s) => s.joinStep);
  const setSessionCode = usePlayerViewStore((s) => s.setSessionCode);
  const setPlayerName = usePlayerViewStore((s) => s.setPlayerName);

  useEffect(() => {
    setSessionCode(code);
    if (nameParam) {
      setPlayerName(nameParam);
    }
  }, [code, nameParam, setSessionCode, setPlayerName]);

  return (
    <>
      {/* BroadcastChannel sync — mounted only during gameplay */}
      {joinStep === "playing" && <BroadcastSync />}

      {/* Join flow screens */}
      {joinStep === "enter-code" && <JoinScreen sessionCode={code} />}
      {joinStep === "waiting-gm" && <LobbyScreen />}
      {joinStep === "playing" && <PlayerViewLayout />}
      {joinStep === "ended" && <EndScreen />}
    </>
  );
}
