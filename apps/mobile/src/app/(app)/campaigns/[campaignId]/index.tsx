import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView as RNScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Crown,
  LogOut,
  Play,
  Plus,
  QrCode,
  Shield,
  Swords,
  Users,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { CampaignPlayer, CampaignSession } from "@questboard/types";
import { PlayerRow } from "../../../../components/campaign/player-row";
import { StatsGrid } from "../../../../components/campaign/stats-grid";
import { QRCodeDisplay } from "../../../../components/qr/qr-code-display";
import { SegmentedControl } from "../../../../components/segmented-control";
import { useCampaignStore } from "../../../../lib/campaign-store";
import { SYSTEM_LABELS } from "../../../../lib/mock-data";
import { SYSTEM_ACCENT_COLORS } from "../../../../lib/campaign-mock-data";

const TABS = [
  { key: "sessions", label: "Sessoes" },
  { key: "players", label: "Jogadores" },
  { key: "hero", label: "Meu Heroi" },
  { key: "info", label: "Info" },
];

function formatSessionDate(date: Date | null): string {
  if (!date) return "A definir";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

export default function CampaignDetailScreen() {
  const { campaignId } = useLocalSearchParams<{ campaignId: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sessions");
  const [codeCopied, setCodeCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const {
    selectedCampaign: campaign,
    selectedCampaignSessions: sessions,
    selectedCampaignPlayers: players,
    selectCampaign,
    clearSelection,
  } = useCampaignStore();

  useEffect(() => {
    if (campaignId) selectCampaign(campaignId);
    return () => clearSelection();
  }, [campaignId, selectCampaign, clearSelection]);

  const isGM = campaign?.ownerId === "user_me";
  const accentColor = SYSTEM_ACCENT_COLORS[campaign?.system ?? ""] ?? "#6C5CE7";
  const systemLabel = SYSTEM_LABELS[campaign?.system ?? ""] ?? campaign?.system;

  const myPlayer = useMemo(
    () => players.find((p) => p.userId === "user_me"),
    [players],
  );

  const handleCopyCode = useCallback(async () => {
    if (!campaign) return;
    // TODO: Add expo-clipboard for real copy
    // For now, just show visual feedback
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, [campaign]);

  // Separate sessions by status
  const liveSessions = useMemo(
    () => sessions.filter((s) => s.status === "LIVE"),
    [sessions],
  );
  const scheduledSessions = useMemo(
    () => sessions.filter((s) => s.status === "SCHEDULED" || s.status === "LOBBY"),
    [sessions],
  );
  const pastSessions = useMemo(
    () => sessions.filter((s) => s.status === "COMPLETED").reverse(),
    [sessions],
  );

  if (!campaign) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text color="$textMuted" fontSize={14}>
            Campanha nao encontrada
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <YStack>
        <XStack paddingHorizontal={16} paddingVertical={10} alignItems="center" gap={12}>
          <Stack
            width={36}
            height={36}
            borderRadius={10}
            backgroundColor="#1C1C24"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#9090A0" />
          </Stack>
          <YStack flex={1}>
            <Text fontSize={18} fontWeight="700" color="$textPrimary" numberOfLines={1}>
              {campaign.name}
            </Text>
            <XStack alignItems="center" gap={6} marginTop={2}>
              <Stack height={4} width={14} borderRadius={2} backgroundColor={accentColor} />
              <Text fontSize={12} color={accentColor}>
                {systemLabel}
              </Text>
            </XStack>
          </YStack>
        </XStack>

        {/* Campaign code */}
        <YStack
          marginHorizontal={16}
          marginBottom={12}
          borderRadius={10}
          backgroundColor="$bgCard"
          borderWidth={1}
          borderColor="$border"
        >
          <XStack
            paddingHorizontal={14}
            paddingVertical={10}
            alignItems="center"
            justifyContent="space-between"
          >
            <YStack>
              <Text fontSize={11} color="$textMuted">
                Codigo da Campanha
              </Text>
              <Text fontSize={18} fontWeight="700" color="$textPrimary" letterSpacing={2}>
                {campaign.code}
              </Text>
            </YStack>
            <XStack gap={8}>
              <Stack
                height={36}
                width={36}
                borderRadius={8}
                backgroundColor={showQR ? "rgba(108, 92, 231, 0.2)" : "rgba(108, 92, 231, 0.12)"}
                alignItems="center"
                justifyContent="center"
                onPress={() => setShowQR((v) => !v)}
                pressStyle={{ opacity: 0.7 }}
              >
                {showQR ? (
                  <ChevronUp size={16} color="#6C5CE7" />
                ) : (
                  <QrCode size={16} color="#6C5CE7" />
                )}
              </Stack>
              <Stack
                height={36}
                width={36}
                borderRadius={8}
                backgroundColor={codeCopied ? "$successMuted" : "rgba(108, 92, 231, 0.12)"}
                alignItems="center"
                justifyContent="center"
                onPress={handleCopyCode}
                pressStyle={{ opacity: 0.7 }}
              >
                <Copy size={16} color={codeCopied ? "#00B894" : "#6C5CE7"} />
              </Stack>
            </XStack>
          </XStack>

          {/* Expandable QR Code */}
          {showQR && (
            <YStack
              paddingHorizontal={14}
              paddingBottom={14}
              alignItems="center"
              borderTopWidth={1}
              borderTopColor="$border"
              paddingTop={14}
            >
              <QRCodeDisplay
                value={`https://questboard.app/join/${campaign.code}`}
                size={160}
                label="Escaneie para entrar na campanha"
              />
            </YStack>
          )}
        </YStack>

        {/* Tab selector */}
        <SegmentedControl
          segments={TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </YStack>

      {/* Tab content */}
      <RNScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "sessions" && (
          <SessionsTab
            live={liveSessions}
            scheduled={scheduledSessions}
            past={pastSessions}
            onSessionPress={(sessionId) =>
              router.push(`/(app)/sessions/${sessionId}/lobby`)
            }
          />
        )}

        {activeTab === "players" && (
          <PlayersTab players={players} />
        )}

        {activeTab === "hero" && (
          <MyHeroTab player={myPlayer ?? null} isGM={isGM} />
        )}

        {activeTab === "info" && (
          <InfoTab
            campaign={campaign}
            systemLabel={systemLabel ?? ""}
            players={players}
            sessions={sessions}
            onLeave={() => router.back()}
          />
        )}
      </RNScrollView>

      {/* Footer (GM only) */}
      {isGM && (
        <YStack
          paddingHorizontal={16}
          paddingVertical={12}
          paddingBottom={36}
          borderTopWidth={1}
          borderTopColor="$border"
          backgroundColor="rgba(15,15,18,0.95)"
        >
          <Stack
            height={48}
            borderRadius={12}
            backgroundColor="$accent"
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
          >
            <XStack alignItems="center" gap={8}>
              <Plus size={18} color="white" />
              <Text fontSize={15} fontWeight="700" color="white">
                Nova Sessao
              </Text>
            </XStack>
          </Stack>
        </YStack>
      )}
    </SafeAreaView>
  );
}

// ── Sessions Tab ───────────────────────────────────────

function SessionsTab({
  live,
  scheduled,
  past,
  onSessionPress,
}: {
  live: CampaignSession[];
  scheduled: CampaignSession[];
  past: CampaignSession[];
  onSessionPress: (sessionId: string) => void;
}) {
  return (
    <YStack gap={16}>
      {/* Live sessions */}
      {live.map((s) => (
        <SessionCard key={s.id} session={s} variant="live" onPress={() => onSessionPress(s.id)} />
      ))}

      {/* Scheduled */}
      {scheduled.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color="$textMuted" paddingHorizontal={16}>
            Proximas
          </Text>
          {scheduled.map((s) => (
            <SessionCard key={s.id} session={s} variant="scheduled" onPress={() => onSessionPress(s.id)} />
          ))}
        </YStack>
      )}

      {/* Past */}
      {past.length > 0 && (
        <YStack gap={8}>
          <Text fontSize={13} fontWeight="600" color="$textMuted" paddingHorizontal={16}>
            Anteriores
          </Text>
          {past.map((s) => (
            <SessionCard key={s.id} session={s} variant="past" />
          ))}
        </YStack>
      )}

      {live.length === 0 && scheduled.length === 0 && past.length === 0 && (
        <YStack alignItems="center" padding={32}>
          <Text color="$textMuted" fontSize={14}>
            Nenhuma sessao registrada
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

function SessionCard({
  session,
  variant,
  onPress,
}: {
  session: CampaignSession;
  variant: "live" | "scheduled" | "past";
  onPress?: () => void;
}) {
  const isLive = variant === "live";
  const isPast = variant === "past";

  return (
    <Stack
      marginHorizontal={16}
      onPress={onPress}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <XStack
        borderRadius={12}
        borderWidth={1}
        borderColor={isLive ? "rgba(0, 184, 148, 0.3)" : "$border"}
        backgroundColor="$bgCard"
        padding={14}
        gap={12}
        alignItems="center"
      >
        {/* Session number */}
        <Stack
          height={40}
          width={40}
          borderRadius={10}
          backgroundColor={
            isLive
              ? "rgba(0, 184, 148, 0.15)"
              : isPast
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(108, 92, 231, 0.12)"
          }
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize={16}
            fontWeight="700"
            color={isLive ? "$success" : isPast ? "$textMuted" : "$accent"}
          >
            #{session.order}
          </Text>
        </Stack>

        {/* Info */}
        <YStack flex={1} gap={3}>
          <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
            {session.name}
          </Text>
          <XStack alignItems="center" gap={8}>
            {isLive && (
              <XStack alignItems="center" gap={4}>
                <Stack height={6} width={6} borderRadius={3} backgroundColor="$success" />
                <Text fontSize={11} fontWeight="600" color="$success">
                  AO VIVO
                </Text>
              </XStack>
            )}
            {!isLive && (
              <XStack alignItems="center" gap={4}>
                <Calendar size={11} color="#5A5A6E" />
                <Text fontSize={11} color="$textMuted">
                  {formatSessionDate(session.scheduledAt ?? session.startedAt)}
                </Text>
              </XStack>
            )}
            {isPast && session.durationMinutes && (
              <XStack alignItems="center" gap={4}>
                <Clock size={11} color="#5A5A6E" />
                <Text fontSize={11} color="$textMuted">
                  {formatDuration(session.durationMinutes)}
                </Text>
              </XStack>
            )}
            <XStack alignItems="center" gap={4}>
              <Users size={11} color="#5A5A6E" />
              <Text fontSize={11} color="$textMuted">
                {session.playerCount}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Live action */}
        {isLive && (
          <Stack
            borderRadius={8}
            backgroundColor="$success"
            paddingHorizontal={12}
            paddingVertical={6}
          >
            <XStack alignItems="center" gap={4}>
              <Play size={12} color="white" fill="white" />
              <Text fontSize={12} fontWeight="600" color="white">
                Entrar
              </Text>
            </XStack>
          </Stack>
        )}
      </XStack>
    </Stack>
  );
}

// ── Players Tab ────────────────────────────────────────

function PlayersTab({ players }: { players: CampaignPlayer[] }) {
  // GM first, then players sorted by name
  const sorted = useMemo(() => {
    const gms = players.filter((p) => p.role === "GM" || p.role === "CO_GM");
    const pls = players
      .filter((p) => p.role === "PLAYER")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    return [...gms, ...pls];
  }, [players]);

  return (
    <YStack gap={4}>
      <Text
        fontSize={13}
        fontWeight="600"
        color="$textMuted"
        paddingHorizontal={16}
        paddingBottom={4}
      >
        {players.length} jogador{players.length !== 1 ? "es" : ""}
      </Text>
      {sorted.map((p) => (
        <PlayerRow
          key={p.userId}
          displayName={p.displayName}
          avatarUrl={p.avatarUrl}
          role={p.role}
          characterName={p.characterName}
          isOnline={p.isOnline}
        />
      ))}
    </YStack>
  );
}

// ── My Hero Tab ────────────────────────────────────────

function MyHeroTab({
  player,
  isGM,
}: {
  player: CampaignPlayer | null;
  isGM: boolean;
}) {
  if (isGM) {
    return (
      <YStack alignItems="center" padding={32} gap={12}>
        <Crown size={28} color="#6C5CE7" />
        <Text fontSize={16} fontWeight="600" color="$textPrimary">
          Voce e o Mestre
        </Text>
        <Text fontSize={14} color="$textMuted" textAlign="center">
          Como mestre, voce nao possui um personagem nesta campanha.
        </Text>
      </YStack>
    );
  }

  if (!player || !player.characterName) {
    return (
      <YStack alignItems="center" padding={32} gap={12}>
        <Shield size={28} color="#5A5A6E" />
        <Text fontSize={16} fontWeight="600" color="$textPrimary">
          Nenhum personagem vinculado
        </Text>
        <Text fontSize={14} color="$textMuted" textAlign="center">
          Vincule um personagem a esta campanha para ver a mini ficha.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap={16} paddingHorizontal={16}>
      {/* Character card */}
      <YStack
        borderRadius={12}
        borderWidth={1}
        borderColor="$border"
        backgroundColor="$bgCard"
        padding={16}
        gap={12}
      >
        <XStack alignItems="center" gap={12}>
          <Stack
            height={48}
            width={48}
            borderRadius={9999}
            backgroundColor="rgba(108, 92, 231, 0.15)"
            alignItems="center"
            justifyContent="center"
          >
            <Swords size={22} color="#6C5CE7" />
          </Stack>
          <YStack>
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              {player.characterName}
            </Text>
            <Text fontSize={13} color="$textMuted">
              {player.sessionsAttended} sessoes participadas
            </Text>
          </YStack>
        </XStack>
      </YStack>

      <Text fontSize={12} color="$textMuted" textAlign="center">
        Ficha completa disponivel na aba Herois
      </Text>
    </YStack>
  );
}

// ── Info Tab ───────────────────────────────────────────

function InfoTab({
  campaign,
  systemLabel,
  players,
  sessions,
  onLeave,
}: {
  campaign: NonNullable<ReturnType<typeof useCampaignStore.getState>["selectedCampaign"]>;
  systemLabel: string;
  players: CampaignPlayer[];
  sessions: CampaignSession[];
  onLeave: () => void;
}) {
  const gm = players.find((p) => p.role === "GM");
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const totalDuration = sessions.reduce(
    (acc, s) => acc + (s.durationMinutes ?? 0),
    0,
  );
  const isGM = campaign.ownerId === "user_me";

  return (
    <YStack gap={16}>
      {/* Stats */}
      <YStack paddingHorizontal={16}>
        <StatsGrid
          items={[
            { value: players.length, label: "Jogadores" },
            { value: completedCount, label: "Sessoes" },
            {
              value: totalDuration > 0 ? formatDuration(totalDuration) : "--",
              label: "Tempo Total",
            },
            { value: campaign.tags.length > 0 ? campaign.tags[0] : "--", label: "Tag" },
          ]}
        />
      </YStack>

      {/* Description */}
      <YStack gap={8} paddingHorizontal={16}>
        <Text fontSize={13} fontWeight="600" color="$textSecondary">
          Descricao
        </Text>
        <Text fontSize={14} color="$textMuted" lineHeight={20}>
          {campaign.description}
        </Text>
      </YStack>

      {/* Details */}
      <YStack gap={8} paddingHorizontal={16}>
        <InfoRow label="Mestre" value={gm?.displayName ?? "Desconhecido"} />
        <InfoRow label="Sistema" value={systemLabel} />
        <InfoRow label="Max Jogadores" value={String(campaign.maxPlayers)} />
        <InfoRow
          label="Criada em"
          value={campaign.createdAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        />
        {campaign.tags.length > 0 && (
          <InfoRow label="Tags" value={campaign.tags.join(", ")} />
        )}
      </YStack>

      {/* Leave button (only for players) */}
      {!isGM && (
        <Stack marginHorizontal={16} marginTop={8}>
          <Stack
            height={44}
            borderRadius={10}
            borderWidth={1}
            borderColor="rgba(255, 107, 107, 0.3)"
            backgroundColor="rgba(255, 107, 107, 0.08)"
            alignItems="center"
            justifyContent="center"
            onPress={onLeave}
            pressStyle={{ opacity: 0.7 }}
          >
            <XStack alignItems="center" gap={6}>
              <LogOut size={16} color="#FF6B6B" />
              <Text fontSize={14} fontWeight="600" color="#FF6B6B">
                Sair da Campanha
              </Text>
            </XStack>
          </Stack>
        </Stack>
      )}
    </YStack>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={6}>
      <Text fontSize={13} color="$textMuted">
        {label}
      </Text>
      <Text fontSize={13} fontWeight="600" color="$textPrimary">
        {value}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F12",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});
