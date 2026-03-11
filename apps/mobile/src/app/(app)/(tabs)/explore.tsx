import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Compass, Gamepad2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, Text, YStack } from "tamagui";
import type { FeedPost } from "@questboard/types";
import { FeedHeader } from "../../../components/feed-header";
import { TabBar, type TabId } from "../../../components/tab-bar";
import { FeedPostCard } from "../../../components/feed";
import { SessionListItem } from "../../../components/session-list-item";
import { ForumView } from "../../../components/forum-view";
import { useFeedStore } from "../../../lib/feed-store";
import { FEED_SESSIONS, type FeedSession } from "../../../lib/mock-data";

function EmptyExplore({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding={32} gap={12}>
      <Stack
        height={64}
        width={64}
        borderRadius={9999}
        backgroundColor="$accentMuted"
        alignItems="center"
        justifyContent="center"
        marginBottom={4}
      >
        <Icon size={28} color="#6C5CE7" />
      </Stack>
      <Text fontSize={18} fontWeight="600" color="$textPrimary" textAlign="center">
        {title}
      </Text>
      <Text
        fontSize={14}
        color="$textMuted"
        textAlign="center"
        lineHeight={20}
        maxWidth={280}
      >
        {message}
      </Text>
    </YStack>
  );
}

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");
  const posts = useFeedStore((s) => s.posts);
  const loading = useFeedStore((s) => s.loading);
  const refreshFeed = useFeedStore((s) => s.refreshFeed);

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedPost }) => <FeedPostCard post={item} />,
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

      {activeTab === "feed" && (
        <FlatList
          data={posts}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refreshFeed}
          ListEmptyComponent={
            <EmptyExplore
              icon={Compass}
              title="Nada por aqui, aventureiro!"
              message="Siga outros jogadores e mestres para ver suas publicacoes no feed."
            />
          }
        />
      )}

      {activeTab === "sessoes" && (
        <FlatList
          data={FEED_SESSIONS}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyExplore
              icon={Gamepad2}
              title="Nenhuma sessao publica"
              message="Quando mestres criarem sessoes abertas, elas aparecerão aqui para voce entrar."
            />
          }
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
