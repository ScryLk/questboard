import { useState } from "react";
import { ScrollView } from "react-native";
import { FileText } from "lucide-react-native";
import { Stack, Text, XStack, YStack } from "tamagui";
import type { FeedPost } from "@questboard/types";
import { PostType } from "@questboard/types";
import { FeedPostCard } from "../feed/feed-post-card";
import { EmptyState } from "../empty-state";

type FilterId = "all" | "highlights" | "characters" | "artwork";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "highlights", label: "Highlights" },
  { id: "characters", label: "Fichas" },
  { id: "artwork", label: "Artes" },
];

const FILTER_TYPES: Record<FilterId, PostType[] | null> = {
  all: null,
  highlights: [PostType.SESSION_HIGHLIGHT],
  characters: [PostType.CHARACTER_CARD],
  artwork: [PostType.ARTWORK],
};

interface PostsTabProps {
  posts: FeedPost[];
  isOwnProfile: boolean;
}

export function PostsTab({ posts, isOwnProfile }: PostsTabProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const allowedTypes = FILTER_TYPES[activeFilter];
  const filtered = allowedTypes
    ? posts.filter((p) => allowedTypes.includes(p.type))
    : posts;

  return (
    <YStack gap={16}>
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {FILTERS.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <Stack
              key={filter.id}
              paddingHorizontal={14}
              paddingVertical={8}
              borderRadius={9999}
              backgroundColor={isActive ? "$accent" : "#1C1C24"}
              onPress={() => setActiveFilter(filter.id)}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={isActive ? "white" : "$textMuted"}
              >
                {filter.label}
              </Text>
            </Stack>
          );
        })}
      </ScrollView>

      {/* Posts list */}
      {filtered.length > 0 ? (
        <YStack>
          {filtered.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </YStack>
      ) : (
        <EmptyState
          icon={<FileText size={28} color="#6C5CE7" />}
          title={
            isOwnProfile
              ? "Nenhuma publicacao ainda"
              : "Nenhum post publico ainda"
          }
          message={
            isOwnProfile
              ? "Compartilhe momentos epicos das suas sessoes"
              : "Este usuario ainda nao publicou nada"
          }
          actionLabel={isOwnProfile ? "+ Nova Publicacao" : undefined}
        />
      )}
    </YStack>
  );
}
