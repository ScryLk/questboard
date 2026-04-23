import { Alert, FlatList } from "react-native";
import { MessageCircle, Sparkles } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import { FORUM_THREADS, type ForumThread } from "../lib/mock-data";

export function ForumView() {
  return (
    <FlatList
      data={FORUM_THREADS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 120 }}
      ListHeaderComponent={<ForumHeader />}
      renderItem={({ item }) => <ThreadItem thread={item} />}
    />
  );
}

function ForumHeader() {
  function handleAskAI() {
    Alert.alert(
      "Em breve",
      "O assistente IA do QuestBoard estará disponível em breve!",
    );
  }

  return (
    <YStack paddingHorizontal={16} paddingBottom={16}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize={18} fontWeight="600" color="$textPrimary">
          Comunidade
        </Text>
        <XStack
          onPress={handleAskAI}
          alignItems="center"
          gap={6}
          borderRadius={9999}
          backgroundColor="$accent"
          paddingHorizontal={16}
          paddingVertical={8}
          pressStyle={{ opacity: 0.8 }}
        >
          <Sparkles size={16} color="white" />
          <Text fontSize={14} fontWeight="500" color="$white">
            Perguntar à IA
          </Text>
        </XStack>
      </XStack>
      <Text marginTop={4} fontSize={12} color="$textMuted">
        Tire dúvidas, compartilhe ideias e converse com a comunidade.
      </Text>
    </YStack>
  );
}

function ThreadItem({ thread }: { thread: ForumThread }) {
  return (
    <YStack
      marginHorizontal={16}
      marginBottom={8}
      borderRadius={12}
      borderWidth={1}
      borderColor="$border"
      backgroundColor="$bgCard"
      padding={16}
      pressStyle={{ opacity: 0.8 }}
    >
      <Text
        fontSize={14}
        fontWeight="600"
        color="$textPrimary"
        numberOfLines={2}
      >
        {thread.title}
      </Text>

      <XStack marginTop={8} alignItems="center" gap={12}>
        <Text fontSize={12} color="$textSecondary">
          por {thread.author}
        </Text>
        <XStack alignItems="center" gap={3}>
          <MessageCircle size={11} color="#5A5A6E" />
          <Text fontSize={12} color="$textMuted">
            {thread.replies}
          </Text>
        </XStack>
        <Text fontSize={12} color="$textMuted">
          {thread.lastActivity}
        </Text>
      </XStack>

      {thread.tags.length > 0 && (
        <XStack marginTop={8} gap={4} flexWrap="wrap">
          {thread.tags.map((tag) => (
            <Stack
              key={tag}
              borderRadius={6}
              borderWidth={1}
              borderColor="$border"
              paddingHorizontal={6}
              paddingVertical={2}
            >
              <Text fontSize={10} color="$textMuted">
                {tag}
              </Text>
            </Stack>
          ))}
        </XStack>
      )}
    </YStack>
  );
}
