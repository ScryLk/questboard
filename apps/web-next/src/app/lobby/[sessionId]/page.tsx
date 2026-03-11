"use client";

import { useParams } from "next/navigation";
import { LobbyLayout } from "@/components/lobby/lobby-layout";

export default function LobbyPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <LobbyLayout sessionId={sessionId} />;
}
