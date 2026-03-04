import type { CampaignPlayer } from "@questboard/types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_COLORS: Record<string, string> = {
  GM: "bg-brand-accent/20 text-brand-accent",
  CO_GM: "bg-purple-500/20 text-purple-400",
  PLAYER: "bg-blue-500/20 text-blue-400",
};

const ROLE_LABELS: Record<string, string> = {
  GM: "Mestre",
  CO_GM: "Co-GM",
  PLAYER: "Jogador",
};

const AVATAR_COLORS = [
  "bg-brand-accent",
  "bg-brand-muted",
  "bg-brand-secondary",
  "bg-emerald-600",
  "bg-amber-600",
];

function PlayerRow({
  player,
  index,
}: {
  player: CampaignPlayer;
  index: number;
}) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}
      >
        {getInitials(player.displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {player.displayName}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${ROLE_COLORS[player.role] ?? ""}`}
          >
            {ROLE_LABELS[player.role] ?? player.role}
          </span>
        </div>
        {player.characterName && (
          <p className="truncate text-xs text-gray-400">
            {player.characterName}
          </p>
        )}
      </div>
      <span className="text-xs text-gray-500">
        {player.sessionsAttended}s
      </span>
    </div>
  );
}

export function PlayerStatsPanel({
  players,
}: {
  players: CampaignPlayer[];
}) {
  const sorted = [...players].sort((a, b) => {
    if (a.role === "GM") return -1;
    if (b.role === "GM") return 1;
    return b.sessionsAttended - a.sessionsAttended;
  });

  return (
    <div className="rounded-xl border border-white/5 bg-surface-light">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Jogadores</h3>
      </div>
      <div className="divide-y divide-white/5">
        {sorted.map((player, i) => (
          <PlayerRow key={player.userId} player={player} index={i} />
        ))}
      </div>
    </div>
  );
}
