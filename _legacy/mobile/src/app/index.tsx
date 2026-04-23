// ─────────────────────────────────────────────────────────────────────
// Home route — switch em build time entre:
//   - DevHome: tela de entrada sem Clerk, oferece links pras rotas
//     `/dev/*` (acesso direto à gameplay mock).
//   - RealHome: feed de descoberta com Clerk (comportamento original).
//
// A decisão é feita em module scope (`HAS_BACKEND`), então a função não
// escolhida nunca é chamada — preserva rules-of-hooks.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useState } from "react";
import { FlatList, Linking } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack, Text, Button } from "tamagui";
import { FeedHeader } from "../components/feed-header";
import { TabBar, type TabId } from "../components/tab-bar";
import { ContentCard } from "../components/content-card";
import { SessionListItem } from "../components/session-list-item";
import { ForumView } from "../components/forum-view";
import { FloatingBar } from "../components/floating-bar";
import { LoadingSpinner } from "../components";
import { useAuthSheet } from "../lib/auth-sheet-context";
import {
  NEWS_ITEMS,
  FEED_SESSIONS,
  type NewsItem,
  type FeedSession,
} from "../lib/mock-data";

const HAS_BACKEND = !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// ── Dev home (sem Clerk) ─────────────────────────────────────────────

function DevHome() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0A0A0F" }}
      edges={["top", "bottom"]}
    >
      <YStack flex={1} padding="$6" gap="$5" justifyContent="center">
        <YStack gap="$2">
          <Text fontSize="$2" color="$colorPress" textTransform="uppercase" letterSpacing={2}>
            Dev mode
          </Text>
          <Text fontSize="$9" fontWeight="800" color="$color">
            QuestBoard
          </Text>
          <Text fontSize="$4" color="$colorHover">
            Backend desligado — acesso direto a rotas de teste.
          </Text>
        </YStack>

        <YStack gap="$3" marginTop="$4">
          <Text
            fontSize="$2"
            color="$colorPress"
            textTransform="uppercase"
            letterSpacing={2}
          >
            Atalhos de teste
          </Text>
          <Link href="/dev/gameplay/demo" asChild>
            <Button size="$5" backgroundColor="$blue9" color="white">
              Abrir gameplay mock →
            </Button>
          </Link>
          <Button
            size="$5"
            variant="outlined"
            onPress={() =>
              Linking.openURL("http://localhost:3000/gameplay/demo?as=gm")
            }
          >
            Abrir web-next (GM) ↗
          </Button>
          <Button
            size="$5"
            variant="outlined"
            onPress={() =>
              Linking.openURL("http://localhost:3000/play/demo?as=player1")
            }
          >
            Abrir web-next (Player 1) ↗
          </Button>
        </YStack>

        <YStack gap="$1" marginTop="auto" paddingBottom="$4">
          <Text fontSize="$1" color="$colorPress">
            Pra reativar o fluxo completo (feed, login, navegação por tabs),
            configure EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY em apps/mobile/.env.
          </Text>
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}

// ── Real home (Clerk) — código original ──────────────────────────────

function RealHome() {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn, openSignUp } = useAuthSheet();
  const [activeTab, setActiveTab] = useState<TabId>("feed");

  const renderNewsItem = useCallback(
    ({ item }: { item: NewsItem }) => <ContentCard item={item} />,
    [],
  );

  const renderSessionItem = useCallback(
    ({ item }: { item: FeedSession }) => <SessionListItem session={item} />,
    [],
  );

  if (!isLoaded) return <LoadingSpinner />;
  if (isSignedIn) return <Redirect href="/(app)/(tabs)/explore" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <FeedHeader />
      <TabBar active={activeTab} onSelect={setActiveTab} />

      {activeTab === "feed" && (
        <FlatList
          data={NEWS_ITEMS}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "sessoes" && (
        <FlatList
          data={FEED_SESSIONS}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "forum" && (
        <YStack flex={1}>
          <ForumView />
        </YStack>
      )}

      <FloatingBar onSignIn={openSignIn} onSignUp={openSignUp} />
    </SafeAreaView>
  );
}

// ── Export ──────────────────────────────────────────────────────────

export default HAS_BACKEND ? RealHome : DevHome;
