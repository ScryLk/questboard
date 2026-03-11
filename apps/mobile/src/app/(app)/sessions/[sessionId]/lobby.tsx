import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Copy,
  Edit3,
  Heart,
  MessageSquare,
  Play,
  QrCode,
  RefreshCw,
  Send,
  Share2,
  Shield,
  Type,
  Users,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack, Separator } from "tamagui";
import { QRCodeDisplay } from "../../../../components/qr/qr-code-display";
import { useApi } from "../../../../lib/api-context";
import type { LobbyPlayer } from "../../../../lib/campaign-mock-data";

// ── Mock character for lobby ──

interface MyCharacterInfo {
  name: string;
  race: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  initials: string;
}

const MOCK_MY_CHARACTER: MyCharacterInfo = {
  name: "Eldrin Ventoalto",
  race: "Elfo",
  class: "Mago",
  level: 5,
  hp: 32,
  maxHp: 32,
  ac: 15,
  initials: "EL",
};

// ── Mock lobby chat ──

interface LobbyMessage {
  id: string;
  sender: string;
  isSystem: boolean;
  content: string;
  timestamp: string;
}

const MOCK_LOBBY_MESSAGES: LobbyMessage[] = [
  { id: "lm1", sender: "Sistema", isSystem: true, content: "Maria entrou na sala", timestamp: "20:45" },
  { id: "lm2", sender: "Maria", isSystem: false, content: "bora jogar!", timestamp: "20:46" },
  { id: "lm3", sender: "Sistema", isSystem: true, content: "João entrou na sala", timestamp: "20:47" },
  { id: "lm4", sender: "GM", isSystem: false, content: "Começamos em 5 min!", timestamp: "20:48" },
];

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
  const api = useApi();

  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeView, setCodeView] = useState<"text" | "qr">("text");
  const [chatMessages, setChatMessages] = useState<LobbyMessage[]>(MOCK_LOBBY_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sessionCode, setSessionCode] = useState("------");
  const [sessionName, setSessionName] = useState("Sessão");
  const [campaignName, setCampaignName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!sessionId) return;
    async function loadSession() {
      try {
        const res = await api.getSession(sessionId!);
        if (res.success) {
          const s = res.data as unknown as Record<string, unknown>;
          setSessionCode((s.inviteCode as string) ?? "------");
          setSessionName((s.name as string) ?? "Sessão");
          setCurrentUserId((s.ownerId as string) ?? null);

          // Map players from API response
          const players = (s.players as Array<Record<string, unknown>>) ?? [];
          setLobbyPlayers(
            players.map((p) => {
              const user = (p.user as Record<string, unknown>) ?? {};
              const char = p.character as Record<string, unknown> | null;
              return {
                userId: (p.userId as string) ?? "",
                displayName: (user.displayName as string) ?? "Player",
                avatarUrl: (user.avatarUrl as string | null) ?? null,
                role: (p.role as string) === "GM" ? "GM" as const : "PLAYER" as const,
                characterName: char ? (char.name as string) : null,
                characterClass: null,
                characterLevel: null,
                status: "ready" as const,
              };
            }),
          );
        }
      } catch {
        // fallback to empty
      }
    }
    loadSession();
  }, [sessionId, api]);

  const isGM = useMemo(
    () => currentUserId !== null && lobbyPlayers.some((p) => p.userId === currentUserId && p.role === "GM"),
    [lobbyPlayers, currentUserId],
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsReady((prev) => !prev);
    setLobbyPlayers((prev) =>
      prev.map((p) =>
        p.userId === currentUserId
          ? { ...p, status: p.status === "ready" ? "joining" : "ready" }
          : p,
      ),
    );
  }, []);

  const handleSendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    const msg: LobbyMessage = {
      id: `lm_${Date.now()}`,
      sender: "Você",
      isSystem: false,
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput("");
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [chatInput]);

  const handleStartSession = useCallback(() => {
    if (!sessionId) return;
    // Start countdown
    setCountdown(3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        clearInterval(interval);
        setCountdown(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/(app)/sessions/${sessionId}/gameplay`);
      }
    }, 1000);
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

        {/* My Character Card (Player only) */}
        {!isGM && (
          <>
            <Separator marginVertical={16} marginHorizontal={16} borderColor="$border" />
            <YStack paddingHorizontal={16} gap={8}>
              <Text fontSize={13} fontWeight="600" color="$textMuted" textTransform="uppercase" letterSpacing={0.5}>
                Meu Personagem
              </Text>
              <YStack
                borderRadius={14}
                borderWidth={1}
                borderColor="rgba(108, 92, 231, 0.15)"
                backgroundColor="$bgCard"
                padding={16}
                gap={12}
              >
                <XStack alignItems="center" gap={12}>
                  {/* Avatar */}
                  <Stack
                    width={52}
                    height={52}
                    borderRadius={14}
                    backgroundColor="rgba(108, 92, 231, 0.15)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={18} fontWeight="800" color="$accent">
                      {MOCK_MY_CHARACTER.initials}
                    </Text>
                  </Stack>
                  {/* Info */}
                  <YStack flex={1} gap={2}>
                    <Text fontSize={16} fontWeight="700" color="$textPrimary">
                      {MOCK_MY_CHARACTER.name}
                    </Text>
                    <Text fontSize={12} color="$textMuted">
                      {MOCK_MY_CHARACTER.race} · {MOCK_MY_CHARACTER.class} · Nv.{MOCK_MY_CHARACTER.level}
                    </Text>
                  </YStack>
                </XStack>

                {/* Stats row */}
                <XStack gap={12}>
                  <XStack flex={1} alignItems="center" gap={6} backgroundColor="rgba(255,255,255,0.04)" padding={8} borderRadius={8}>
                    <Heart size={14} color="#FF6B6B" />
                    <Text fontSize={13} fontWeight="600" color="$textPrimary">
                      {MOCK_MY_CHARACTER.hp}/{MOCK_MY_CHARACTER.maxHp}
                    </Text>
                  </XStack>
                  <XStack flex={1} alignItems="center" gap={6} backgroundColor="rgba(255,255,255,0.04)" padding={8} borderRadius={8}>
                    <Shield size={14} color="#4FC3F7" />
                    <Text fontSize={13} fontWeight="600" color="$textPrimary">
                      CA {MOCK_MY_CHARACTER.ac}
                    </Text>
                  </XStack>
                </XStack>

                {/* Action buttons */}
                <XStack gap={8}>
                  <Stack
                    flex={1}
                    height={36}
                    borderRadius={8}
                    backgroundColor="rgba(108, 92, 231, 0.1)"
                    borderWidth={1}
                    borderColor="rgba(108, 92, 231, 0.2)"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <XStack alignItems="center" gap={4}>
                      <Edit3 size={13} color="#6C5CE7" />
                      <Text fontSize={12} fontWeight="600" color="$accent">
                        Editar
                      </Text>
                    </XStack>
                  </Stack>
                  <Stack
                    flex={1}
                    height={36}
                    borderRadius={8}
                    backgroundColor="rgba(255,255,255,0.04)"
                    borderWidth={1}
                    borderColor="$border"
                    alignItems="center"
                    justifyContent="center"
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <XStack alignItems="center" gap={4}>
                      <RefreshCw size={13} color="#9090A0" />
                      <Text fontSize={12} fontWeight="600" color="$textSecondary">
                        Trocar
                      </Text>
                    </XStack>
                  </Stack>
                </XStack>
              </YStack>
            </YStack>
          </>
        )}

        {/* Lobby Chat */}
        <Separator marginVertical={16} marginHorizontal={16} borderColor="$border" />
        <YStack paddingHorizontal={16} gap={8} paddingBottom={16}>
          <XStack alignItems="center" gap={6}>
            <MessageSquare size={14} color="#5A5A6E" />
            <Text fontSize={13} fontWeight="600" color="$textMuted" textTransform="uppercase" letterSpacing={0.5}>
              Chat da Sala
            </Text>
          </XStack>

          <YStack
            borderRadius={14}
            borderWidth={1}
            borderColor="$border"
            backgroundColor="$bgCard"
            height={160}
          >
            <ScrollView
              ref={chatScrollRef}
              style={{ flex: 1, padding: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg) => (
                <XStack key={msg.id} marginBottom={6}>
                  {msg.isSystem ? (
                    <Text fontSize={12} color="$textMuted" fontStyle="italic">
                      {msg.content}
                    </Text>
                  ) : (
                    <Text fontSize={13} color="$textPrimary">
                      <Text fontWeight="600" color={msg.sender === "GM" ? "$accent" : "$textSecondary"}>
                        {msg.sender}:
                      </Text>{" "}
                      {msg.content}
                    </Text>
                  )}
                </XStack>
              ))}
            </ScrollView>

            {/* Chat input */}
            <XStack
              borderTopWidth={1}
              borderTopColor="$border"
              paddingHorizontal={12}
              paddingVertical={8}
              alignItems="center"
              gap={8}
            >
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Mensagem..."
                placeholderTextColor="#5A5A6E"
                style={styles.chatInput}
                onSubmitEditing={handleSendChat}
                returnKeyType="send"
              />
              <Stack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={chatInput.trim() ? "$accent" : "rgba(255,255,255,0.06)"}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                onPress={handleSendChat}
              >
                <Send size={16} color={chatInput.trim() ? "white" : "#5A5A6E"} />
              </Stack>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Countdown Overlay */}
      {countdown !== null && <CountdownOverlay count={countdown} />}

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

// ── Countdown Overlay ──

function CountdownOverlay({ count }: { count: number }) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(0.3);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 8, stiffness: 200 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    ]).start();
  }, [count, scale, opacity]);

  return (
    <Animated.View style={styles.countdownOverlay}>
      <Text fontSize={16} fontWeight="600" color="rgba(255,255,255,0.6)" marginBottom={16}>
        A sessão vai começar em...
      </Text>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Stack
          width={100}
          height={100}
          borderRadius={50}
          backgroundColor="rgba(108, 92, 231, 0.2)"
          borderWidth={3}
          borderColor="$accent"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={48} fontWeight="900" color="$accent">
            {count}
          </Text>
        </Stack>
      </Animated.View>
    </Animated.View>
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
  chatInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: "#E8E8ED",
    paddingHorizontal: 0,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 15, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
