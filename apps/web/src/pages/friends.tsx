import { useState } from "react";
import { Button, Card, TextInput, Avatar, Badge, Divider } from "@questboard/ui";

type FriendsTab = "all" | "online" | "requests";

const MOCK_FRIENDS = [
  {
    id: "1",
    displayName: "Carlos DM",
    username: "carlosdm",
    avatarUrl: null,
    isOnline: true,
    friendsSince: "2025-08-01",
  },
  {
    id: "2",
    displayName: "Ana Mestre",
    username: "anamestre",
    avatarUrl: null,
    isOnline: true,
    friendsSince: "2025-09-15",
  },
  {
    id: "3",
    displayName: "João Keeper",
    username: "joaokeeper",
    avatarUrl: null,
    isOnline: false,
    friendsSince: "2025-10-20",
  },
  {
    id: "4",
    displayName: "Maria Paladina",
    username: "mariapaladin",
    avatarUrl: null,
    isOnline: false,
    friendsSince: "2025-12-01",
  },
];

const MOCK_REQUESTS = [
  {
    id: "r1",
    senderId: "u5",
    senderDisplayName: "Pedro Bardo",
    senderUsername: "pedrobardo",
    senderAvatarUrl: null,
    createdAt: "2026-02-24",
  },
];

function FriendRow({
  friend,
}: {
  friend: (typeof MOCK_FRIENDS)[number];
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-hover transition-all duration-fast">
      <Avatar
        size="md"
        fallback={friend.displayName[0]}
        online={friend.isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {friend.displayName}
        </div>
        <div className="text-xs text-text-muted">@{friend.username}</div>
      </div>
      {friend.isOnline && (
        <Badge variant="success" size="sm">
          Online
        </Badge>
      )}
      <Button variant="ghost" size="sm">
        Mensagem
      </Button>
    </div>
  );
}

function RequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: (typeof MOCK_REQUESTS)[number];
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border-default">
      <Avatar size="md" fallback={request.senderDisplayName[0]} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {request.senderDisplayName}
        </div>
        <div className="text-xs text-text-muted">@{request.senderUsername}</div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" onPress={onAccept}>
          Aceitar
        </Button>
        <Button variant="ghost" size="sm" onPress={onDecline}>
          Recusar
        </Button>
      </div>
    </div>
  );
}

export function FriendsPage() {
  const [tab, setTab] = useState<FriendsTab>("all");
  const [search, setSearch] = useState("");

  const onlineFriends = MOCK_FRIENDS.filter((f) => f.isOnline);
  const filteredFriends = (tab === "online" ? onlineFriends : MOCK_FRIENDS).filter(
    (f) =>
      f.displayName.toLowerCase().includes(search.toLowerCase()) ||
      f.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Amigos
          </h1>
          <p className="text-text-secondary mt-1">
            {MOCK_FRIENDS.length} amigos • {onlineFriends.length} online
          </p>
        </div>
        <Button variant="primary" size="sm">
          + Adicionar
        </Button>
      </div>

      {/* Search */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar amigos..."
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border-default">
        {(
          [
            { key: "all", label: `Todos (${MOCK_FRIENDS.length})` },
            { key: "online", label: `Online (${onlineFriends.length})` },
            { key: "requests", label: `Pedidos (${MOCK_REQUESTS.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-fast ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "requests" ? (
        <div className="space-y-3 animate-fade-in">
          {MOCK_REQUESTS.length === 0 ? (
            <p className="text-center text-text-muted py-8">
              Nenhum pedido pendente
            </p>
          ) : (
            MOCK_REQUESTS.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                onAccept={() => {}}
                onDecline={() => {}}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-1 animate-fade-in">
          {filteredFriends.length === 0 ? (
            <p className="text-center text-text-muted py-8">
              Nenhum amigo encontrado
            </p>
          ) : (
            filteredFriends.map((friend) => (
              <FriendRow key={friend.id} friend={friend} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
