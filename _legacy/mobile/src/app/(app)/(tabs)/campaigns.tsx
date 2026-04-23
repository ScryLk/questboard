import { useCallback, useEffect } from "react";
import { SectionList } from "react-native";
import { useRouter } from "expo-router";
import { Castle, Crown, Gamepad2, ScrollText } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import type { Campaign } from "@questboard/types";
import { CampaignListItem } from "../../../components/campaign/campaign-list-item";
import { PendingInviteCard } from "../../../components/campaign/pending-invite-card";
import { Button } from "../../../components/button";
import { useCampaignStore } from "../../../lib/campaign-store";

interface CampaignSection {
  title: string;
  icon: "crown" | "gamepad";
  data: Campaign[];
  role: "gm" | "player";
}

function formatNextSessionLabel(date: Date | null): string | null {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanha";
  if (days <= 7) return `Em ${days} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function CampaignsScreen() {
  const router = useRouter();
  const {
    campaignsAsGM,
    campaignsAsPlayer,
    pendingInvites,
    loadCampaigns,
    acceptInvite,
    declineInvite,
    getNextSessionForCampaign,
    getLiveSessionForCampaign,
    getGMNameForCampaign,
    getMyCharacterNameForCampaign,
  } = useCampaignStore();

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const sections: CampaignSection[] = [];

  if (campaignsAsGM.length > 0) {
    sections.push({
      title: "Mestrando",
      icon: "crown",
      data: campaignsAsGM,
      role: "gm",
    });
  }

  if (campaignsAsPlayer.length > 0) {
    sections.push({
      title: "Jogando",
      icon: "gamepad",
      data: campaignsAsPlayer,
      role: "player",
    });
  }

  const renderSectionHeader = useCallback(
    ({ section }: { section: CampaignSection }) => (
      <XStack
        alignItems="center"
        gap={8}
        paddingHorizontal={20}
        paddingTop={20}
        paddingBottom={10}
      >
        {section.icon === "crown" ? (
          <Crown size={16} color="#6C5CE7" />
        ) : (
          <Gamepad2 size={16} color="#6C5CE7" />
        )}
        <Text
          fontSize={14}
          fontWeight="700"
          color="$textSecondary"
          textTransform="uppercase"
          letterSpacing={1}
        >
          {section.title}
        </Text>
      </XStack>
    ),
    [],
  );

  const renderCampaignItem = useCallback(
    ({ item, section }: { item: Campaign; section: CampaignSection }) => {
      const nextSession = getNextSessionForCampaign(item.id);
      const liveSession = getLiveSessionForCampaign(item.id);
      const isLive = !!liveSession;
      const characterName =
        section.role === "player"
          ? getMyCharacterNameForCampaign(item.id)
          : null;

      let nextLabel: string | null = null;
      if (nextSession?.scheduledAt) {
        nextLabel = `Proxima: ${formatNextSessionLabel(nextSession.scheduledAt)}`;
      }

      return (
        <CampaignListItem
          campaign={item}
          role={section.role}
          nextSessionLabel={nextLabel}
          isLive={isLive}
          characterName={characterName}
          onPress={() => router.push(`/(app)/campaigns/${item.id}`)}
          onLivePress={
            isLive
              ? () =>
                  router.push(
                    `/(app)/sessions/${liveSession!.id}/lobby`,
                  )
              : undefined
          }
        />
      );
    },
    [
      getNextSessionForCampaign,
      getLiveSessionForCampaign,
      getMyCharacterNameForCampaign,
      router,
    ],
  );

  const isEmpty =
    campaignsAsGM.length === 0 &&
    campaignsAsPlayer.length === 0 &&
    pendingInvites.length === 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0F0F12" }}
      edges={["top"]}
    >
      <YStack paddingHorizontal={20} paddingTop={16} paddingBottom={12}>
        <Text fontSize={24} fontWeight="700" color="$textPrimary">
          Campanhas
        </Text>
      </YStack>

      {isEmpty ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12} padding={32}>
          <YStack
            height={64}
            width={64}
            borderRadius={9999}
            backgroundColor="$accentMuted"
            alignItems="center"
            justifyContent="center"
            marginBottom={4}
          >
            <Castle size={28} color="#6C5CE7" />
          </YStack>
          <Text fontSize={18} fontWeight="600" color="$textPrimary" textAlign="center">
            Nenhuma campanha ainda
          </Text>
          <Text
            fontSize={14}
            color="$textMuted"
            textAlign="center"
            lineHeight={20}
            maxWidth={280}
          >
            Crie uma campanha ou entre com um codigo de convite para comecar.
          </Text>
          <YStack gap={10} width="100%" maxWidth={280} marginTop={8}>
            <Button variant="primary" size="lg" onPress={() => router.push("/(app)/sessions/create")}>
              Criar Campanha
            </Button>
            <Button variant="outline" size="lg" onPress={() => router.push("/(app)/join")}>
              Entrar com Codigo
            </Button>
          </YStack>
        </YStack>
      ) : (
        <SectionList<Campaign, CampaignSection>
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderCampaignItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            pendingInvites.length > 0 ? (
              <YStack gap={10} marginBottom={4}>
                <XStack
                  alignItems="center"
                  gap={8}
                  paddingHorizontal={20}
                  paddingTop={4}
                >
                  <ScrollText size={16} color="#FDCB6E" />
                  <Text
                    fontSize={14}
                    fontWeight="700"
                    color="$textSecondary"
                    textTransform="uppercase"
                    letterSpacing={1}
                  >
                    Convites Pendentes
                  </Text>
                </XStack>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 12,
                  }}
                >
                  {pendingInvites.map((invite) => (
                    <PendingInviteCard
                      key={invite.id}
                      campaign={invite}
                      gmName={getGMNameForCampaign(invite.id)}
                      onAccept={() => acceptInvite(invite.id)}
                      onDecline={() => declineInvite(invite.id)}
                    />
                  ))}
                </ScrollView>
              </YStack>
            ) : null
          }
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
