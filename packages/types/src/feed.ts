// ─── Feed / Social ──────────────────────────────────────

export enum PostType {
  TEXT = "TEXT",
  CHARACTER_CARD = "CHARACTER_CARD",
  SESSION_HIGHLIGHT = "SESSION_HIGHLIGHT",
  ARTWORK = "ARTWORK",
  CAMPAIGN_RECRUIT = "CAMPAIGN_RECRUIT",
  DICE_ROLL = "DICE_ROLL",
  QUOTE = "QUOTE",
}

export enum PostVisibility {
  PUBLIC = "PUBLIC",
  FOLLOWERS = "FOLLOWERS",
  CAMPAIGN_ONLY = "CAMPAIGN_ONLY",
}

export enum ReactionType {
  EPIC = "EPIC",
  LORE = "LORE",
  LAUGH = "LAUGH",
  RIP = "RIP",
  HYPE = "HYPE",
  HEART = "HEART",
}

export enum CommentBadge {
  AUTHOR = "AUTHOR",
  GM = "GM",
}

// ─── Shared interfaces ──────────────────────────────────

export interface PostAuthor {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export interface ReactionSummary {
  type: ReactionType;
  count: number;
}

export interface PostEngagement {
  reactions: ReactionSummary[];
  totalReactions: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  myReaction: ReactionType | null;
  isBookmarked: boolean;
  isReposted: boolean;
}

export interface FeedComment {
  id: string;
  postId: string;
  author: PostAuthor;
  content: string;
  badge: CommentBadge | null;
  isPinned: boolean;
  createdAt: string;
  reactions: ReactionSummary[];
  totalReactions: number;
  myReaction: ReactionType | null;
  replies: FeedComment[];
  replyCount: number;
}

// ─── Post type payloads ──────────────────────────────────

export interface TextPostData {
  body: string;
  tags?: string[];
}

export interface CharacterCardPostData {
  characterId: string;
  characterName: string;
  characterClass: string | null;
  characterRace: string | null;
  characterLevel: number;
  system: string;
  avatarUrl: string | null;
  caption?: string;
}

export interface SessionHighlightPostData {
  sessionId: string;
  sessionName: string;
  campaignName?: string;
  system: string;
  momentTitle: string;
  momentDescription: string;
}

export interface ArtworkPostData {
  imageUrl: string | null;
  caption?: string;
  tags?: string[];
  width?: number;
  height?: number;
}

export interface CampaignRecruitPostData {
  campaignId: string;
  campaignName: string;
  system: string;
  description: string;
  currentPlayers: number;
  maxPlayers: number;
  tags?: string[];
}

export interface DiceRollPostData {
  formula: string;
  results: number[];
  total: number;
  label?: string;
  context?: string;
  isNat20?: boolean;
  isNat1?: boolean;
}

export interface QuotePostData {
  body: string;
  quotedPost: FeedPost;
}

// ─── Union type ──────────────────────────────────────────

export interface FeedPostBase {
  id: string;
  author: PostAuthor;
  visibility: PostVisibility;
  engagement: PostEngagement;
  createdAt: string;
}

export interface TextFeedPost extends FeedPostBase {
  type: PostType.TEXT;
  data: TextPostData;
}

export interface CharacterCardFeedPost extends FeedPostBase {
  type: PostType.CHARACTER_CARD;
  data: CharacterCardPostData;
}

export interface SessionHighlightFeedPost extends FeedPostBase {
  type: PostType.SESSION_HIGHLIGHT;
  data: SessionHighlightPostData;
}

export interface ArtworkFeedPost extends FeedPostBase {
  type: PostType.ARTWORK;
  data: ArtworkPostData;
}

export interface CampaignRecruitFeedPost extends FeedPostBase {
  type: PostType.CAMPAIGN_RECRUIT;
  data: CampaignRecruitPostData;
}

export interface DiceRollFeedPost extends FeedPostBase {
  type: PostType.DICE_ROLL;
  data: DiceRollPostData;
}

export interface QuoteFeedPost extends FeedPostBase {
  type: PostType.QUOTE;
  data: QuotePostData;
}

export type FeedPost =
  | TextFeedPost
  | CharacterCardFeedPost
  | SessionHighlightFeedPost
  | ArtworkFeedPost
  | CampaignRecruitFeedPost
  | DiceRollFeedPost
  | QuoteFeedPost;
