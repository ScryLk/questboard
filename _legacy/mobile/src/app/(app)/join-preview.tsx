import { useState, useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, XStack, YStack } from "tamagui";
import { Button } from "../../components/button";
import { StatsGrid } from "../../components/campaign/stats-grid";
import { PlayerRow } from "../../components/campaign/player-row";
import { CharacterSelector } from "../../components/campaign/character-selector";
import { useCampaignStore } from "../../lib/campaign-store";
import {
  getMockCampaign,
  getMockCampaignPlayers,
  getMockCampaignSessions,
  getNextSession,
  SYSTEM_ACCENT_COLORS,
} from "../../lib/campaign-mock-data";
import { useCharacterStore } from "../../lib/character-store";
import { useToast } from "../../lib/toast-context";
import { SYSTEM_LABELS } from "../../lib/mock-data";

export default function JoinPreviewScreen() {
  const router = useRouter();
  const { campaignId } = useLocalSearchParams<{ campaignId: string }>();
  const { showToast } = useToast();
  const joinCampaign = useCampaignStore((s) => s.joinCampaign);
  const joinLoading = useCampaignStore((s) => s.joinLoading);
  const characters = useCharacterStore((s) => s.characters);

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<"joined" | "pending" | null>(null);

  const campaign = campaignId ? getMockCampaign(campaignId) : null;
  const players = campaignId ? getMockCampaignPlayers(campaignId) : [];
  const sessions = campaignId ? getMockCampaignSessions(campaignId) : [];
  const nextSession = campaignId ? getNextSession(campaignId) : null;

  // Load characters on mount
  const loadCharacters = useCharacterStore((s) => s.loadCharacters);
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // Filter characters by system
  const characterList = Object.values(characters);
  const eligibleCharacters = characterList
    .filter((c) => c.system === campaign?.system)
    .map((c) => ({
      id: c.id,
      name: c.name,
      className: c.className ?? "Classe",
      level: c.level,
      system: c.system,
    }));

  const accentColor = campaign
    ? SYSTEM_ACCENT_COLORS[campaign.system] ?? "#6C5CE7"
    : "#6C5CE7";

  const systemLabel = campaign
    ? SYSTEM_LABELS[campaign.system] ?? campaign.system
    : "";

  const totalHours = sessions
    .filter((s) => s.durationMinutes)
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
  const totalHoursStr = `${Math.round(totalHours / 60)}h`;

  const gmPlayer = players.find((p) => p.role === "GM");
  const otherPlayers = players.filter((p) => p.role !== "GM");

  const handleJoin = useCallback(async () => {
    if (!campaignId || !selectedCharacterId) return;
    const result = await joinCampaign(campaignId, selectedCharacterId);
    setJoinResult(result);
    if (result === "joined") {
      showToast("success", "Bem-vindo à campanha!");
      router.back();
      router.back();
    }
  }, [campaignId, selectedCharacterId, joinCampaign, showToast, router]);

  if (!campaign) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
        <XStack alignItems="center" paddingHorizontal={16} height={56}>
          <Stack onPress={() => router.back()} padding={8}>
            <ArrowLeft size={22} color="#E8E8ED" />
          </Stack>
        </XStack>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text color="$textMuted">Campanha não encontrada</Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      {/* Header */}
      <XStack alignItems="center" paddingHorizontal={16} height={56}>
        <Stack
          onPress={() => router.back()}
          hitSlop={12}
          padding={8}
          borderRadius={12}
          pressStyle={{ backgroundColor: "$border" }}
        >
          <ArrowLeft size={22} color="#E8E8ED" />
        </Stack>
        <Text flex={1} textAlign="center" fontSize={18} fontWeight="600" color="$textPrimary">
          Entrar na Campanha
        </Text>
        <Stack width={38} />
      </XStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <YStack
          height={140}
          backgroundColor={accentColor}
          justifyContent="flex-end"
          padding={20}
        >
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.4)"
          />
          <YStack zIndex={1}>
            <Text fontSize={12} fontWeight="600" color="rgba(255,255,255,0.7)">
              {systemLabel}
            </Text>
            <Text fontSize={22} fontWeight="700" color="white" marginTop={4}>
              {campaign.name}
            </Text>
          </YStack>
        </YStack>

        <YStack paddingHorizontal={20} paddingTop={20} gap={24}>
          {/* GM Info */}
          {gmPlayer && (
            <XStack alignItems="center" gap={12}>
              <Stack
                height={40}
                width={40}
                borderRadius={9999}
                backgroundColor="rgba(108, 92, 231, 0.2)"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={14} fontWeight="700" color="$accent">
                  {gmPlayer.displayName[0]}
                </Text>
              </Stack>
              <YStack>
                <Text fontSize={14} fontWeight="600" color="$textPrimary">
                  {gmPlayer.displayName}
                </Text>
                <Text fontSize={12} color="$textMuted">
                  Mestre
                </Text>
              </YStack>
            </XStack>
          )}

          {/* Stats */}
          <StatsGrid
            items={[
              { value: sessions.length, label: "sessões" },
              { value: `${otherPlayers.length}/${campaign.maxPlayers}`, label: "jogadores" },
              { value: `~${Math.round(sessions.length > 0 ? otherPlayers.reduce((s, p) => s + (p.sessionsAttended ?? 0), 0) / Math.max(otherPlayers.length, 1) : 0)}`, label: "nível médio" },
              { value: totalHoursStr, label: "jogadas" },
            ]}
          />

          {/* Description */}
          <YStack gap={8}>
            <Text fontSize={14} fontWeight="600" color="$textSecondary">
              Sobre
            </Text>
            <Text fontSize={14} color="$textPrimary" lineHeight={22}>
              {campaign.description}
            </Text>
          </YStack>

          {/* Players */}
          <YStack gap={8}>
            <Text fontSize={14} fontWeight="600" color="$textSecondary">
              Jogadores ({otherPlayers.length}/{campaign.maxPlayers})
            </Text>
            <YStack
              borderRadius={12}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              overflow="hidden"
            >
              {otherPlayers.map((p) => (
                <PlayerRow
                  key={p.userId}
                  displayName={p.displayName}
                  avatarUrl={p.avatarUrl}
                  role={p.role}
                  characterName={p.characterName}
                  isOnline={p.isOnline}
                />
              ))}
              {otherPlayers.length < campaign.maxPlayers && (
                <XStack height={44} alignItems="center" paddingHorizontal={16}>
                  <Text fontSize={12} color="$success">
                    {campaign.maxPlayers - otherPlayers.length} vaga{campaign.maxPlayers - otherPlayers.length > 1 ? "s" : ""} disponível{campaign.maxPlayers - otherPlayers.length > 1 ? "is" : ""}
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>

          {/* Next Session */}
          {nextSession && nextSession.scheduledAt && (
            <XStack
              borderRadius={12}
              backgroundColor="$bgCard"
              borderWidth={1}
              borderColor="$border"
              padding={14}
              alignItems="center"
              gap={12}
            >
              <Calendar size={18} color="#6C5CE7" />
              <YStack flex={1}>
                <Text fontSize={13} fontWeight="600" color="$textPrimary">
                  Próxima sessão
                </Text>
                <Text fontSize={12} color="$textMuted" marginTop={2}>
                  {new Date(nextSession.scheduledAt).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </YStack>
            </XStack>
          )}

          {/* Character Selector */}
          {joinResult !== "pending" && (
            <CharacterSelector
              characters={eligibleCharacters}
              selectedId={selectedCharacterId}
              onSelect={setSelectedCharacterId}
              onCreateNew={() => router.push("/(app)/characters/create")}
              systemLabel={systemLabel}
            />
          )}

          {/* Pending result */}
          {joinResult === "pending" && (
            <YStack
              borderRadius={12}
              backgroundColor="rgba(253, 203, 110, 0.08)"
              borderWidth={1}
              borderColor="rgba(253, 203, 110, 0.2)"
              padding={20}
              alignItems="center"
              gap={8}
            >
              <Text fontSize={16} fontWeight="600" color="#FDCB6E">
                Solicitação enviada!
              </Text>
              <Text fontSize={13} color="$textSecondary" textAlign="center" lineHeight={20}>
                O mestre precisa aprovar sua entrada.{"\n"}Você receberá uma notificação quando for aceito.
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Footer */}
      {joinResult !== "pending" && (
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingHorizontal={20}
          paddingTop={12}
          paddingBottom={36}
          backgroundColor="$bg"
          borderTopWidth={1}
          borderTopColor="$border"
        >
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedCharacterId || joinLoading}
            loading={joinLoading}
            onPress={handleJoin}
          >
            Entrar na Campanha
          </Button>
          <Text fontSize={11} color="$textMuted" textAlign="center" marginTop={8}>
            Ao entrar, o mestre verá seu personagem e poderá aprovar sua entrada.
          </Text>
        </YStack>
      )}
    </SafeAreaView>
  );
}
