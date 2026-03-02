import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";
import { FeedHeader } from "../../../components/feed-header";
import { TabBar, type TabId } from "../../../components/tab-bar";
import { ContentCard } from "../../../components/content-card";
import { SessionListItem } from "../../../components/session-list-item";
import { ForumView } from "../../../components/forum-view";
import {
  NEWS_ITEMS,
  FEED_SESSIONS,
  type NewsItem,
  type FeedSession,
} from "../../../lib/mock-data";

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("novidades");

  const renderNewsItem = useCallback(
    ({ item }: { item: NewsItem }) => <ContentCard item={item} />,
    [],
  );

  const renderSessionItem = useCallback(
    ({ item }: { item: FeedSession }) => <SessionListItem session={item} />,
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0F0F12" }} edges={["top"]}>
      <FeedHeader />
      <TabBar active={activeTab} onSelect={setActiveTab} />

      {activeTab === "novidades" && (
        <FlatList
          data={NEWS_ITEMS}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "sessoes" && (
        <FlatList
          data={FEED_SESSIONS}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "forum" && (
        <YStack flex={1}>
          <ForumView />
        </YStack>
      )}
    </SafeAreaView>
  );
}
