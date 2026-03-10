import { Text, XStack, YStack } from "tamagui";
import type { QuotePostData, FeedPost } from "@questboard/types";
import { PostType } from "@questboard/types";
import { TextPostCard } from "./text-post-card";
import { DiceRollPostCard } from "./dice-roll-post-card";
import { CharacterCardPostCard } from "./character-card-post-card";
import { SessionHighlightPostCard } from "./session-highlight-post-card";
import { ArtworkPostCard } from "./artwork-post-card";
import { CampaignRecruitPostCard } from "./campaign-recruit-post-card";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600_000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function QuotedPostBody({ post }: { post: FeedPost }) {
  switch (post.type) {
    case PostType.TEXT:
      return <TextPostCard data={post.data} />;
    case PostType.DICE_ROLL:
      return <DiceRollPostCard data={post.data} />;
    case PostType.CHARACTER_CARD:
      return <CharacterCardPostCard data={post.data} />;
    case PostType.SESSION_HIGHLIGHT:
      return <SessionHighlightPostCard data={post.data} />;
    case PostType.ARTWORK:
      return <ArtworkPostCard data={post.data} />;
    case PostType.CAMPAIGN_RECRUIT:
      return <CampaignRecruitPostCard data={post.data} />;
    case PostType.QUOTE:
      // Don't nest quotes infinitely
      return (
        <Text fontSize={13} color="$textMuted">
          Post citado
        </Text>
      );
    default:
      return null;
  }
}

interface QuotePostCardProps {
  data: QuotePostData;
}

export function QuotePostCard({ data }: QuotePostCardProps) {
  const q = data.quotedPost;

  return (
    <YStack gap={10}>
      {/* Quote body */}
      <Text fontSize={15} color="$textPrimary" lineHeight={22}>
        {data.body}
      </Text>

      {/* Embedded original post */}
      <YStack
        borderRadius={12}
        backgroundColor="rgba(255,255,255,0.04)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.08)"
        padding={12}
        gap={8}
      >
        {/* Mini header */}
        <XStack alignItems="center" gap={8}>
          <YStack
            height={24}
            width={24}
            borderRadius={12}
            backgroundColor="#2A2A35"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={9} fontWeight="700" color="$accent">
              {getInitials(q.author.displayName)}
            </Text>
          </YStack>
          <Text fontSize={12} color="$textMuted">
            @{q.author.username}
          </Text>
          <Text fontSize={12} color="$textMuted">
            · {formatTimeAgo(q.createdAt)}
          </Text>
        </XStack>

        {/* Original post body */}
        <QuotedPostBody post={q} />
      </YStack>
    </YStack>
  );
}
