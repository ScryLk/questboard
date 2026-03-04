import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Share, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Copy,
  Play,
  QrCode,
  Share2,
  Type,
  Users,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { QRCodeDisplay } from "../../../../components/qr/qr-code-display";
import { getMockCampaign, getMockLobby } from "../../../../lib/campaign-mock-data";
import type { LobbyPlayer } from "../../../../lib/campaign-mock-data";

const CURRENT_USER_ID = "user_me";

function getStatusColor(status: LobbyPlayer["status"]): string {
  switch (status) {
    case "ready":
      return "#00B894";
    case "joining":
      return "#FDCB6E";
    case "offline":
      return "#5A5A6E";
  }
}

function getStatusLabel(status: LobbyPlayer["status"]): string {
  switch (status) {
    case "ready":
      return "Pronto";
    case "joining":
      return "Entrando";
    case "offline":
      return "Offline";
  }
}

export default function SessionLobbyScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeView, setCodeView] = useState<"text" | "qr">("text");

  // Determine session info from mock data
  // In real app, this would come from API/socket
  const sessionCode = useMemo(() => {
    // Extract from lobby mock
    if (sessionId === "sess_s04") return "B7M2X4";
    return sessionId?.replace("sess_", "").toUpperCase().padEnd(6, "X") ?? "------";
  }, [sessionId]);

  const sessionName = useMemo(() => {
    if (sessionId === "sess_s04") return "A Torre de Ravenloft";
    return "Sessao";
  }, [sessionId]);

  const campaignName = useMemo(() => {
    if (sessionId?.startsWith("sess_s")) {
      return getMockCampaign("camp_strahd")?.name ?? "";
    }
    if (sessionId?.startsWith("sess_p")) {
      return getMockCampaign("camp_phandelver")?.name ?? "";
    }
    return "";
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      setLobbyPlayers(getMockLobby(sessionId));
    }
  }, [sessionId]);

  const isGM = useMemo(
    () => lobbyPlayers.some((p) => p.userId === CURRENT_USER_ID && p.role === "GM"),
    [lobbyPlayers],
  );

  const readyCount = useMemo(
    () => lobbyPlayers.filter((p) => p.status === "ready").length,
    [lobbyPlayers],
  );

  const totalPlayers = lobbyPlayers.length;

  const handleCopyCode = useCallback(() => {
    // TODO: Add expo-clipboard for real copy
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }, []);

  const handleShareCode = useCallback(async () => {
    await Share.share({
      message: `Entre na sessao pelo QuestBoard! Codigo: ${sessionCode}`,
    });
  }, [sessionCode]);

  const handleToggleReady = useCallback(() => {
    setIsReady((prev) => !prev);
    setLobbyPlayers((prev) =>
      prev.map((p) =>
        p.userId === CURRENT_USER_ID
          ? { ...p, status: p.status === "ready" ? "joining" : "ready" }
          : p,
      ),
    );
  }, []);

  const handleStartSession = useCallback(() => {
    if (sessionId) {
      router.replace(`/(app)/sessions/${sessionId}/gameplay`);
    }
  }, [sessionId, router]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
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
            {sessionName}
          </Text>
          {campaignName ? (
            <Text fontSize={12} color="$textMuted" marginTop={1}>
              {campaignName}
            </Text>
          ) : null}
        </YStack>
      </XStack>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Session Code Card (GM only) */}
        {isGM && (
          <YStack
            marginHorizontal={16}
            marginBottom={16}
            borderRadius={14}
            borderWidth={1}
            borderColor="rgba(108, 92, 231, 0.2)"
            backgroundColor="$bgCard"
            padding={20}
            alignItems="center"
            gap={12}
          >
            {/* Texto / QR toggle */}
            <XStack
              borderRadius={10}
              backgroundColor="rgba(255,255,255,0.06)"
              padding={3}
              alignSelf="center"
            >
              <Stack
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius={8}
                backgroundColor={codeView === "text" ? "rgba(108, 92, 231, 0.2)" : "transparent"}
                onPress={() => setCodeView("text")}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack alignItems="center" gap={6}>
                  <Type size={14} color={codeView === "text" ? "#6C5CE7" : "#5A5A6E"} />
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={codeView === "text" ? "$accent" : "$textMuted"}
                  >
                    Texto
                  </Text>
                </XStack>
              </Stack>
              <Stack
                paddingHorizontal={16}
                paddingVertical={8}
                borderRadius={8}
                backgroundColor={codeView === "qr" ? "rgba(108, 92, 231, 0.2)" : "transparent"}
                onPress={() => setCodeView("qr")}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack alignItems="center" gap={6}>
                  <QrCode size={14} color={codeView === "qr" ? "#6C5CE7" : "#5A5A6E"} />
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={codeView === "qr" ? "$accent" : "$textMuted"}
                  >
                    QR Code
                  </Text>
                </XStack>
              </Stack>
            </XStack>

            {codeView === "text" ? (
              <>
                <Text fontSize={12} color="$textMuted" textTransform="uppercase" letterSpacing={1}>
                  Codigo da Sessao
                </Text>
                <Text
                  fontSize={36}
                  fontWeight="800"
                  color="$textPrimary"
                  letterSpacing={6}
                >
                  {sessionCode}
                </Text>
              </>
            ) : (
              <QRCodeDisplay
                value={`https://questboard.app/join/${sessionCode}`}
                size={180}
                label="Escaneie para entrar na sessao"
              />
            )}

            {/* Copy / Share buttons */}
            <XStack gap={12} marginTop={4}>
              <Stack
                flex={1}
                height={40}
                borderRadius={10}
                backgroundColor={codeCopied ? "$successMuted" : "rgba(108, 92, 231, 0.12)"}
                borderWidth={1}
                borderColor={codeCopied ? "rgba(0, 184, 148, 0.3)" : "rgba(108, 92, 231, 0.2)"}
                alignItems="center"
                justifyContent="center"
                onPress={handleCopyCode}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack alignItems="center" gap={6}>
                  <Copy size={14} color={codeCopied ? "#00B894" : "#6C5CE7"} />
                  <Text
                    fontSize={13}
                    fontWeight="600"
                    color={codeCopied ? "$success" : "$accent"}
                  >
                    {codeCopied ? "Copiado!" : "Copiar"}
                  </Text>
                </XStack>
              </Stack>

              <Stack
                flex={1}
                height={40}
                borderRadius={10}
                backgroundColor="rgba(108, 92, 231, 0.12)"
                borderWidth={1}
                borderColor="rgba(108, 92, 231, 0.2)"
                alignItems="center"
                justifyContent="center"
                onPress={handleShareCode}
                pressStyle={{ opacity: 0.7 }}
              >
                <XStack alignItems="center" gap={6}>
                  <Share2 size={14} color="#6C5CE7" />
                  <Text fontSize={13} fontWeight="600" color="$accent">
                    Compartilhar
                  </Text>
                </XStack>
              </Stack>
            </XStack>
          </YStack>
        )}

        {/* Players list */}
        <YStack gap={4}>
          <XStack
            alignItems="center"
            gap={6}
            paddingHorizontal={20}
            paddingBottom={8}
          >
            <Users size={14} color="#5A5A6E" />
            <Text fontSize={13} fontWeight="600" color="$textMuted">
              Jogadores ({totalPlayers})
            </Text>
          </XStack>

          {lobbyPlayers.map((player) => (
            <LobbyPlayerRow key={player.userId} player={player} />
          ))}
        </YStack>
      </ScrollView>

      {/* Footer */}
      <YStack
        paddingHorizontal={16}
        paddingVertical={12}
        paddingBottom={36}
        borderTopWidth={1}
        borderTopColor="$border"
        backgroundColor="rgba(15,15,18,0.95)"
        gap={8}
      >
        {isGM ? (
          <>
            <XStack alignItems="center" justifyContent="center" gap={4}>
              <Text fontSize={13} color="$textMuted">
                {readyCount}/{totalPlayers} prontos
              </Text>
            </XStack>
            <Stack
              height={50}
              borderRadius={12}
              backgroundColor="$accent"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={handleStartSession}
              opacity={readyCount < 2 ? 0.5 : 1}
            >
              <XStack alignItems="center" gap={8}>
                <Play size={18} color="white" fill="white" />
                <Text fontSize={16} fontWeight="700" color="white">
                  Iniciar Sessao
                </Text>
              </XStack>
            </Stack>
          </>
        ) : (
          <>
            <Text fontSize={13} color="$textMuted" textAlign="center">
              {isReady ? "Aguardando mestre iniciar..." : "Marque-se como pronto"}
            </Text>
            <Stack
              height={50}
              borderRadius={12}
              backgroundColor={isReady ? "$success" : "$accent"}
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={handleToggleReady}
            >
              <XStack alignItems="center" gap={8}>
                <CheckCircle size={18} color="white" />
                <Text fontSize={16} fontWeight="700" color="white">
                  {isReady ? "Pronto!" : "Marcar como Pronto"}
                </Text>
              </XStack>
            </Stack>
          </>
        )}
      </YStack>
    </SafeAreaView>
  );
}

// ── Lobby Player Row ───────────────────────────────────

function LobbyPlayerRow({ player }: { player: LobbyPlayer }) {
  const statusColor = getStatusColor(player.status);
  const statusLabel = getStatusLabel(player.status);
  const isReady = player.status === "ready";

  const initials = player.displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <XStack
      height={64}
      alignItems="center"
      paddingHorizontal={16}
      gap={12}
    >
      {/* Avatar */}
      <Stack
        height={44}
        width={44}
        borderRadius={9999}
        backgroundColor={
          player.role === "GM"
            ? "rgba(108, 92, 231, 0.2)"
            : "rgba(255, 255, 255, 0.08)"
        }
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize={15}
          fontWeight="700"
          color={player.role === "GM" ? "$accent" : "$textSecondary"}
        >
          {initials}
        </Text>
      </Stack>

      {/* Info */}
      <YStack flex={1}>
        <Text fontSize={14} fontWeight="600" color="$textPrimary" numberOfLines={1}>
          {player.displayName}
        </Text>
        {player.characterName && (
          <Text fontSize={12} color="$textMuted" marginTop={1}>
            {player.characterName}
            {player.characterClass ? ` (${player.characterClass} Nv.${player.characterLevel})` : ""}
          </Text>
        )}
      </YStack>

      {/* Status */}
      <XStack alignItems="center" gap={6}>
        {isReady ? (
          <CheckCircle size={14} color={statusColor} fill={statusColor} />
        ) : (
          <Circle size={14} color={statusColor} />
        )}
        <Text fontSize={12} fontWeight="600" color={statusColor}>
          {statusLabel}
        </Text>
      </XStack>
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
