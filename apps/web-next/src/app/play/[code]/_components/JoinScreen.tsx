"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Loader2, Plus, Swords, Wand2 } from "lucide-react";
import {
  usePlayerViewStore,
  type LobbyCharacter,
  type PlayerCampaignSystem,
} from "@/lib/player-view-store";
import { useCharacterStore } from "@/stores/characterStore";
import type { CampaignCharacter } from "@/types/character";

// Mock pre-made (mantidos como atalho rápido — desaparecem se o
// jogador criou personagens próprios).
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

function characterToLobbyEntry(c: CampaignCharacter): LobbyCharacter {
  if (c.cosmicHorrorData) {
    return {
      id: c.id,
      name: c.name,
      class: "Investigador",
      level: 0,
      emoji: "🔍",
      taken: false,
    };
  }
  if (c.dnd5eData) {
    return {
      id: c.id,
      name: c.name,
      class: c.dnd5eData.classSlug,
      level: c.dnd5eData.level,
      emoji: "🎲",
      taken: false,
    };
  }
  return {
    id: c.id,
    name: c.name,
    class: "Aventureiro",
    level: 1,
    emoji: "🧝",
    taken: false,
  };
}

export function JoinScreen({ sessionCode }: JoinScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createdId = searchParams.get("createdId");

  const [name, setName] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null,
  );
  const [joining, setJoining] = useState(false);

  const setPlayerName = usePlayerViewStore((s) => s.setPlayerName);
  const setCharacterId = usePlayerViewStore((s) => s.setCharacterId);
  const setJoinStep = usePlayerViewStore((s) => s.setJoinStep);
  const setConnected = usePlayerViewStore((s) => s.setConnected);
  const setCampaignInfo = usePlayerViewStore((s) => s.setCampaignInfo);
  const setAvailableCharacters = usePlayerViewStore(
    (s) => s.setAvailableCharacters,
  );
  const setLobbyPlayers = usePlayerViewStore((s) => s.setLobbyPlayers);
  const campaignSystem = usePlayerViewStore((s) => s.campaignSystem);
  const setCampaignSystem = usePlayerViewStore((s) => s.setCampaignSystem);

  const campaignName =
    usePlayerViewStore((s) => s.campaignName) || "A Maldição de Strahd";
  const gmName = usePlayerViewStore((s) => s.gmName) || "Lucas";
  const playerCount = usePlayerViewStore((s) => s.playerCount) || 4;

  const playCampaignId = `play:${sessionCode}`;
  const allCharacters = useCharacterStore((s) => s.characters);

  // Personagens criados pelo jogador para esta sessão (escopados pelo
  // campaignId `play:CODE`). Adicionalmente filtrados por sistema da
  // campanha (se selecionado) — evita misturar fichas de sistemas
  // diferentes na mesma sessão.
  const myCharacters = useMemo(() => {
    return allCharacters.filter((c) => {
      if (c.createdByCampaignId !== playCampaignId) return false;
      if (campaignSystem === "cosmic-horror") return Boolean(c.cosmicHorrorData);
      if (campaignSystem === "dnd5e") return Boolean(c.dnd5eData);
      return true;
    });
  }, [allCharacters, playCampaignId, campaignSystem]);

  const myLobbyEntries = useMemo(
    () => myCharacters.map(characterToLobbyEntry),
    [myCharacters],
  );

  // Auto-seleciona o personagem que acabou de ser criado pelo wizard.
  useEffect(() => {
    if (createdId && myCharacters.some((c) => c.id === createdId)) {
      setSelectedCharacterId(createdId);
    }
  }, [createdId, myCharacters]);

  const showMock = myLobbyEntries.length === 0;
  const characterList = showMock ? MOCK_CHARACTERS : myLobbyEntries;

  const handleJoin = async () => {
    if (!name.trim() || !selectedCharacterId || !campaignSystem) return;
    setJoining(true);

    setPlayerName(name.trim());
    setCharacterId(selectedCharacterId);
    setCampaignInfo({
      campaignName,
      gmName,
      playerCount,
      sessionNumber: 13,
    });
    setAvailableCharacters(characterList);

    const selectedChar = characterList.find(
      (c) => c.id === selectedCharacterId,
    );
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

    await new Promise((r) => setTimeout(r, 600));
    setConnected(true);
    setJoinStep("waiting-gm");
    setJoining(false);
  };

  const handleCreate = () => {
    if (!campaignSystem) return;
    router.push(`/play/${sessionCode}/new-character/${campaignSystem}`);
  };

  const canJoin = Boolean(
    name.trim() && selectedCharacterId && campaignSystem && !joining,
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
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

      <div className="my-8 h-px w-full max-w-sm bg-white/10" />

      {/* Sistema da campanha */}
      <div className="flex w-full max-w-sm flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-white/50">
          Sistema da campanha
        </label>
        <div className="grid grid-cols-2 gap-2">
          <SystemPill
            active={campaignSystem === "dnd5e"}
            label="D&D 5e"
            sublabel="Aventura clássica"
            icon={Wand2}
            onClick={() => setCampaignSystem("dnd5e")}
            accent="amber"
          />
          <SystemPill
            active={campaignSystem === "cosmic-horror"}
            label="Horror d100"
            sublabel="Investigação cósmica"
            icon={Brain}
            onClick={() => setCampaignSystem("cosmic-horror")}
            accent="purple"
          />
        </div>
        <p className="text-[10px] text-white/30">
          O mestre vai sincronizar isso quando o backend existir; por ora
          confira com a mesa antes de entrar.
        </p>
      </div>

      {/* Nome */}
      <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-white/50">
          Seu nome
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canJoin && handleJoin()}
          placeholder="Como quer ser chamado?"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/20 outline-none transition-colors focus:border-brand-accent"
          autoFocus
        />
      </div>

      {/* Personagens */}
      <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-white/50">
            {showMock ? "Personagens da mesa" : "Seus personagens"}
          </label>
          {!showMock && (
            <span className="text-[10px] text-white/30">
              {myLobbyEntries.length} salvo
              {myLobbyEntries.length === 1 ? "" : "s"} aqui
            </span>
          )}
        </div>

        {!campaignSystem ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-xs text-white/40">
            Escolha o sistema acima primeiro.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {characterList.map((char) => (
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
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {char.portraitUrl ? (
                      <img
                        src={char.portraitUrl}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-2xl">{char.emoji ?? "🧙"}</span>
                    )}
                  </div>
                  <span className="text-center text-xs leading-tight text-white/70">
                    {char.name}
                  </span>
                  <span className="text-[10px] text-white/30">{char.class}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs font-medium text-white/70 transition-colors hover:border-brand-accent/50 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Criar{" "}
              {campaignSystem === "cosmic-horror"
                ? "investigador"
                : "aventureiro"}{" "}
              novo
            </button>
          </>
        )}
      </div>

      {/* Join button */}
      <button
        type="button"
        onClick={handleJoin}
        disabled={!canJoin}
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

function SystemPill({
  active,
  label,
  sublabel,
  icon: Icon,
  onClick,
  accent,
}: {
  active: boolean;
  label: string;
  sublabel: string;
  icon: typeof Brain;
  onClick: () => void;
  accent: "amber" | "purple";
}) {
  const accentColors = {
    amber: {
      border: "border-amber-400",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      icon: "text-amber-300",
    },
    purple: {
      border: "border-purple-400",
      bg: "bg-purple-500/10",
      text: "text-purple-300",
      icon: "text-purple-300",
    },
  }[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
        active
          ? `${accentColors.border} ${accentColors.bg}`
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? accentColors.icon : "text-white/50"}`}
      />
      <span
        className={`text-sm font-semibold ${active ? accentColors.text : "text-white/80"}`}
      >
        {label}
      </span>
      <span className="text-[10px] text-white/40">{sublabel}</span>
    </button>
  );
}
