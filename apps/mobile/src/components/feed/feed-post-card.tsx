import { useCallback, useState } from "react";
import { YStack } from "tamagui";
import type { FeedPost, ReactionType } from "@questboard/types";
import { PostType } from "@questboard/types";
import { PostHeader } from "./post-header";
import { EngagementBar } from "./engagement-bar";
import { TextPostCard } from "./text-post-card";
import { DiceRollPostCard } from "./dice-roll-post-card";
import { CharacterCardPostCard } from "./character-card-post-card";
import { SessionHighlightPostCard } from "./session-highlight-post-card";
import { ArtworkPostCard } from "./artwork-post-card";
import { CampaignRecruitPostCard } from "./campaign-recruit-post-card";
import { QuotePostCard } from "./quote-post-card";
import { ReactionPicker } from "./reaction-picker";
import { CommentSection } from "./comment-section";
import { ShareSheet } from "./share-sheet";
import { PostContextMenu } from "./post-context-menu";
import { useFeedStore } from "../../lib/feed-store";

interface FeedPostCardProps {
  post: FeedPost;
}

function PostBody({ post }: { post: FeedPost }) {
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
      return <QuotePostCard data={post.data} />;
    default:
      return null;
  }
}

// Hardcoded current user id for mock data
const CURRENT_USER_ID = "user-1";

export function FeedPostCard({ post }: FeedPostCardProps) {
  const reactToPost = useFeedStore((s) => s.reactToPost);
  const bookmarkPost = useFeedStore((s) => s.bookmarkPost);
  const repostPost = useFeedStore((s) => s.repostPost);
  const quotePost = useFeedStore((s) => s.quotePost);
  const deletePost = useFeedStore((s) => s.deletePost);

  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleReact = useCallback(() => {
    // Quick tap: toggle HEART
    const type = post.engagement.myReaction === "HEART" ? null : ("HEART" as ReactionType);
    reactToPost(post.id, type);
  }, [reactToPost, post.id, post.engagement.myReaction]);

  const handleReactLongPress = useCallback(() => {
    setShowReactionPicker(true);
  }, []);

  const handleSelectReaction = useCallback(
    (type: ReactionType | null) => {
      reactToPost(post.id, type);
    },
    [reactToPost, post.id],
  );

  const handleComment = useCallback(() => {
    setShowComments((prev) => !prev);
  }, []);

  const handleShare = useCallback(() => {
    setShowShareSheet(true);
  }, []);

  const handleBookmark = useCallback(() => {
    bookmarkPost(post.id);
  }, [bookmarkPost, post.id]);

  const handleRepost = useCallback(() => {
    repostPost(post.id);
  }, [repostPost, post.id]);

  const handleQuote = useCallback(() => {
    quotePost(post.id, "");
  }, [quotePost, post.id]);

  const handleDelete = useCallback(
    (postId: string) => {
      deletePost(postId);
    },
    [deletePost],
  );

  const { engagement } = post;
  const isAuthor = post.author.id === CURRENT_USER_ID;

  return (
    <YStack
      marginHorizontal={16}
      marginBottom={12}
      padding={16}
      borderRadius={16}
      backgroundColor="#1C1C24"
      borderWidth={1}
      borderColor="$border"
    >
      <PostHeader
        author={post.author}
        postType={post.type}
        createdAt={post.createdAt}
        onMorePress={() => setShowContextMenu(true)}
      />
      <PostBody post={post} />
      <EngagementBar
        engagement={engagement}
        onReact={handleReact}
        onReactLongPress={handleReactLongPress}
        onComment={handleComment}
        onShare={handleShare}
        onBookmark={handleBookmark}
      />

      {showComments && (
        <CommentSection
          postId={post.id}
          postAuthorId={post.author.id}
          totalComments={engagement.comments}
          onClose={() => setShowComments(false)}
        />
      )}

      <ReactionPicker
        visible={showReactionPicker}
        currentReaction={engagement.myReaction}
        onSelect={handleSelectReaction}
        onClose={() => setShowReactionPicker(false)}
      />

      <ShareSheet
        visible={showShareSheet}
        postId={post.id}
        onClose={() => setShowShareSheet(false)}
        onRepost={handleRepost}
        onQuote={handleQuote}
      />

      <PostContextMenu
        visible={showContextMenu}
        postId={post.id}
        isAuthor={isAuthor}
        onClose={() => setShowContextMenu(false)}
        onDelete={handleDelete}
      />
    </YStack>
  );
}
