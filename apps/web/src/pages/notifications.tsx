import { useState } from "react";
import { Button, Card, Badge, Divider } from "@questboard/ui";
import { NotificationType } from "@questboard/shared";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: NotificationType.SESSION_INVITE,
    title: "Convite para sessão",
    body: "Carlos DM convidou você para 'A Maldição de Strahd'",
    isRead: false,
    actionUrl: "/sessions/1",
    createdAt: "2026-02-25T14:30:00",
  },
  {
    id: "2",
    type: NotificationType.ACHIEVEMENT_UNLOCKED,
    title: "Conquista desbloqueada!",
    body: "Você desbloqueou 'Dado Sortudo' — Role 20 natural 20s",
    isRead: false,
    actionUrl: "/profile?tab=achievements",
    createdAt: "2026-02-25T10:00:00",
  },
  {
    id: "3",
    type: NotificationType.FRIEND_REQUEST,
    title: "Pedido de amizade",
    body: "Pedro Bardo quer ser seu amigo",
    isRead: true,
    actionUrl: "/friends?tab=requests",
    createdAt: "2026-02-24T18:00:00",
  },
  {
    id: "4",
    type: NotificationType.SESSION_LIVE,
    title: "Sessão ao vivo!",
    body: "'O Despertar dos Deuses' começou — entre agora!",
    isRead: true,
    actionUrl: "/sessions/2",
    createdAt: "2026-02-23T20:00:00",
  },
  {
    id: "5",
    type: NotificationType.PAYMENT_SUCCESS,
    title: "Pagamento confirmado",
    body: "Sua assinatura Aventureiro foi renovada com sucesso",
    isRead: true,
    actionUrl: "/billing",
    createdAt: "2026-02-20T08:00:00",
  },
];

const NOTIFICATION_ICONS: Record<string, string> = {
  [NotificationType.SESSION_INVITE]: "📩",
  [NotificationType.SESSION_STARTING]: "🔔",
  [NotificationType.SESSION_LIVE]: "🟢",
  [NotificationType.SESSION_ENDED]: "🏁",
  [NotificationType.FRIEND_REQUEST]: "👥",
  [NotificationType.FRIEND_ACCEPTED]: "🤝",
  [NotificationType.ACHIEVEMENT_UNLOCKED]: "🏆",
  [NotificationType.PAYMENT_SUCCESS]: "💳",
  [NotificationType.PAYMENT_FAILED]: "⚠️",
  [NotificationType.PLAN_CHANGED]: "⭐",
  [NotificationType.SYSTEM_ANNOUNCEMENT]: "📢",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p className="text-text-secondary mt-1">
              {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onPress={markAllAsRead}>
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => markAsRead(notification.id)}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-all duration-fast ${
              notification.isRead
                ? "bg-surface border-border-default"
                : "bg-accent-muted border-accent/20"
            } hover:bg-hover`}
          >
            <span className="text-xl mt-0.5">
              {NOTIFICATION_ICONS[notification.type] ?? "🔔"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {notification.title}
                </span>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-accent rounded-full shrink-0" />
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {notification.body}
              </p>
              <span className="text-xs text-text-muted mt-1 block">
                {timeAgo(notification.createdAt)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg">Nenhuma notificação</p>
        </div>
      )}
    </div>
  );
}
