import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";
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

export default function DiscoveryScreen() {
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
