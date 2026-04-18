"use client";

import { useState } from "react";
import { Swords, Loader2 } from "lucide-react";
import { usePlayerViewStore, type LobbyCharacter } from "@/lib/player-view-store";

// Mock characters for demo
const MOCK_CHARACTERS: LobbyCharacter[] = [
  { id: "c1", name: "Thorin", class: "Guerreiro", level: 5, emoji: "⚔️", taken: false },
  { id: "c2", name: "Elara", class: "Maga", level: 5, emoji: "🧙", taken: false },
  { id: "c3", name: "Zara", class: "Ladina", level: 5, emoji: "🗡️", taken: false },
  { id: "c4", name: "Kael", class: "Clérigo", level: 5, emoji: "✨", taken: false },
  { id: "c5", name: "Lyra", class: "Barda", level: 5, emoji: "🎵", taken: false },
  { id: "c6", name: "Draven", class: "Paladino", level: 5, emoji: "🛡️", taken: false },
];

interface JoinScreenProps {
  sessionCode: string;
}

export function JoinScreen({ sessionCode }: JoinScreenProps) {
  const [name, setName] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const setPlayerName = usePlayerViewStore((s) => s.setPlayerName);
  const setCharacterId = usePlayerViewStore((s) => s.setCharacterId);
  const setJoinStep = usePlayerViewStore((s) => s.setJoinStep);
  const setConnected = usePlayerViewStore((s) => s.setConnected);
  const setCampaignInfo = usePlayerViewStore((s) => s.setCampaignInfo);
  const setAvailableCharacters = usePlayerViewStore((s) => s.setAvailableCharacters);
  const setLobbyPlayers = usePlayerViewStore((s) => s.setLobbyPlayers);

  const campaignName = usePlayerViewStore((s) => s.campaignName) || "A Maldição de Strahd";
  const gmName = usePlayerViewStore((s) => s.gmName) || "Lucas";
  const playerCount = usePlayerViewStore((s) => s.playerCount) || 4;

  const characters = usePlayerViewStore((s) => s.availableCharacters).length > 0
    ? usePlayerViewStore.getState().availableCharacters
    : MOCK_CHARACTERS;

  const nameError = name.trim().length > 0 && name.trim().length < 2 ? "Nome muito curto" : "";

  const handleJoin = async () => {
    if (!name.trim() || name.trim().length < 2 || !selectedCharacterId) return;
    setJoining(true);

    setPlayerName(name.trim());
    setCharacterId(selectedCharacterId);
    setCampaignInfo({
      campaignName,
      gmName,
      playerCount,
      sessionNumber: 13,
    });
    setAvailableCharacters(characters);

    const selectedChar = characters.find((c) => c.id === selectedCharacterId);
    setLobbyPlayers([
      {
        id: "p1",
        name: name.trim(),
        characterId: selectedCharacterId,
        characterName: selectedChar?.name ?? null,
        ready: true,
        isMe: true,
      },
    ]);

    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 600));
    setConnected(true);
    setJoinStep("waiting-gm");
    setJoining(false);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      {/* Header */}
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Swords className="h-5 w-5 text-brand-accent" />
          <span className="text-sm font-medium uppercase tracking-widest text-brand-accent">
            QuestBoard
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{campaignName}</h1>
        <p className="mt-1 text-sm text-white/40">
          Mestre: {gmName} · {playerCount} jogadores
        </p>
      </div>

      {/* Divider */}
      <div className="my-8 h-px w-full max-w-sm bg-white/10" />

      {/* Name input */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-white/50">
          Seu nome
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          placeholder="Como quer ser chamado?"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/20 outline-none transition-colors focus:border-brand-accent"
          autoFocus
          maxLength={30}
        />
        {nameError && (
          <p className="mt-1 text-xs text-[#FF4444]">{nameError}</p>
        )}
      </div>

      {/* Character selection */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <label className="text-xs font-medium uppercase tracking-wider text-white/50">
          Escolha seu personagem
        </label>
        <div className="grid grid-cols-3 gap-3">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              disabled={char.taken}
              onClick={() => setSelectedCharacterId(char.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-95 ${
                char.taken
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                  : selectedCharacterId === char.id
                    ? "border-brand-accent bg-brand-accent/15"
                    : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 overflow-hidden">
                {char.portraitUrl ? (
                  <img src={char.portraitUrl} className="h-full w-full object-cover" alt="" />
                ) : (
                  <span className="text-2xl">{char.emoji ?? "🧙"}</span>
                )}
              </div>
              <span className="text-center text-xs leading-tight text-white/70">
                {char.name}
              </span>
              <span className="text-[10px] text-white/30">{char.class}</span>
              {char.taken && (
                <span className="text-[9px] text-brand-danger">Em uso</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Join button */}
      <button
        type="button"
        onClick={handleJoin}
        disabled={!name.trim() || name.trim().length < 2 || !selectedCharacterId || joining}
        className="mt-8 w-full max-w-sm rounded-xl bg-brand-accent py-4 text-base font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {joining ? (
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        ) : (
          "Entrar na Mesa"
        )}
      </button>

      <p className="mt-6 text-xs text-white/20">Código: {sessionCode}</p>
    </div>
  );
}
