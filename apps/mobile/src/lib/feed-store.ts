import { create } from "zustand";
import type { FeedPost, FeedComment, QuoteFeedPost } from "@questboard/types";
import { PostType, PostVisibility, ReactionType, CommentBadge } from "@questboard/types";
import { MOCK_FEED_POSTS, MOCK_COMMENTS } from "./feed-mock-data";

interface FeedState {
  posts: FeedPost[];
  comments: Record<string, FeedComment[]>;
  loading: boolean;

  loadFeed: () => void;
  refreshFeed: () => void;
  addPost: (post: FeedPost) => void;
  deletePost: (postId: string) => void;

  reactToPost: (postId: string, type: ReactionType | null) => void;
  bookmarkPost: (postId: string) => void;
  repostPost: (postId: string) => void;
  quotePost: (postId: string, body: string) => void;

  loadComments: (postId: string) => void;
  addComment: (postId: string, content: string, parentId?: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  pinComment: (postId: string, commentId: string) => void;
  reactToComment: (
    commentId: string,
    postId: string,
    type: ReactionType | null,
  ) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: MOCK_FEED_POSTS,
  comments: { ...MOCK_COMMENTS },
  loading: false,

  loadFeed: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ posts: MOCK_FEED_POSTS, loading: false });
    }, 500);
  },

  refreshFeed: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ posts: MOCK_FEED_POSTS, loading: false });
    }, 800);
  },

  addPost: (post) => {
    set((s) => ({ posts: [post, ...s.posts] }));
  },

  deletePost: (postId) => {
    set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
  },

  reactToPost: (postId, type) => {
    set((s) => ({
      posts: s.posts.map((post) => {
        if (post.id !== postId) return post;
        const prev = post.engagement.myReaction;
        const reactions = post.engagement.reactions.map((r) => ({ ...r }));

        // Remove previous
        if (prev) {
          const idx = reactions.findIndex((r) => r.type === prev);
          if (idx !== -1) {
            reactions[idx] = {
              ...reactions[idx],
              count: reactions[idx].count - 1,
            };
            if (reactions[idx].count <= 0) reactions.splice(idx, 1);
          }
        }

        // Add new (if different from previous)
        const myReaction = type === prev ? null : type;
        if (myReaction) {
          const idx = reactions.findIndex((r) => r.type === myReaction);
          if (idx !== -1) {
            reactions[idx] = {
              ...reactions[idx],
              count: reactions[idx].count + 1,
            };
          } else {
            reactions.push({ type: myReaction, count: 1 });
          }
        }

        const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
        return {
          ...post,
          engagement: {
            ...post.engagement,
            reactions,
            totalReactions,
            myReaction,
          },
        };
      }),
    }));
  },

  bookmarkPost: (postId) => {
    set((s) => ({
      posts: s.posts.map((post) => {
        if (post.id !== postId) return post;
        const isBookmarked = !post.engagement.isBookmarked;
        return {
          ...post,
          engagement: {
            ...post.engagement,
            isBookmarked,
            bookmarks:
              post.engagement.bookmarks + (isBookmarked ? 1 : -1),
          },
        };
      }),
    }));
  },

  repostPost: (postId) => {
    set((s) => ({
      posts: s.posts.map((post) => {
        if (post.id !== postId) return post;
        const isReposted = !post.engagement.isReposted;
        return {
          ...post,
          engagement: {
            ...post.engagement,
            isReposted,
            reposts: post.engagement.reposts + (isReposted ? 1 : -1),
          },
        };
      }),
    }));
  },

  quotePost: (postId, body) => {
    const original = get().posts.find((p) => p.id === postId);
    if (!original) return;

    const quotePost: QuoteFeedPost = {
      id: `post-quote-${Date.now()}`,
      type: PostType.QUOTE,
      visibility: PostVisibility.PUBLIC,
      author: {
        id: "me",
        displayName: "Voce",
        username: "voce",
        avatarUrl: null,
      },
      data: { body, quotedPost: original },
      engagement: {
        reactions: [],
        totalReactions: 0,
        comments: 0,
        reposts: 0,
        bookmarks: 0,
        myReaction: null,
        isBookmarked: false,
        isReposted: false,
      },
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ posts: [quotePost, ...s.posts] }));
  },

  // ── Comments ───────────────────────────────────────────

  loadComments: (postId) => {
    const existing = get().comments[postId];
    if (existing) return;
    const mock = MOCK_COMMENTS[postId] ?? [];
    set((s) => ({ comments: { ...s.comments, [postId]: mock } }));
  },

  addComment: (postId, content, parentId) => {
    const newComment: FeedComment = {
      id: `c-${Date.now()}`,
      postId,
      author: {
        id: "me",
        displayName: "Voce",
        username: "voce",
        avatarUrl: null,
      },
      content,
      badge: null,
      isPinned: false,
      createdAt: new Date().toISOString(),
      reactions: [],
      totalReactions: 0,
      myReaction: null,
      replies: [],
      replyCount: 0,
    };

    set((s) => {
      const existing = s.comments[postId] ?? [];

      if (parentId) {
        // Add as reply
        const updated = existing.map((c) => {
          if (c.id !== parentId) return c;
          return {
            ...c,
            replies: [...c.replies, newComment],
            replyCount: c.replyCount + 1,
          };
        });
        return {
          comments: { ...s.comments, [postId]: updated },
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  engagement: {
                    ...p.engagement,
                    comments: p.engagement.comments + 1,
                  },
                }
              : p,
          ),
        };
      }

      return {
        comments: { ...s.comments, [postId]: [newComment, ...existing] },
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                engagement: {
                  ...p.engagement,
                  comments: p.engagement.comments + 1,
                },
              }
            : p,
        ),
      };
    });
  },

  deleteComment: (postId, commentId) => {
    set((s) => {
      const existing = s.comments[postId] ?? [];
      const updated = existing.filter((c) => c.id !== commentId).map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== commentId),
        replyCount:
          c.replies.filter((r) => r.id !== commentId).length,
      }));
      return {
        comments: { ...s.comments, [postId]: updated },
        posts: s.posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                engagement: {
                  ...p.engagement,
                  comments: Math.max(0, p.engagement.comments - 1),
                },
              }
            : p,
        ),
      };
    });
  },

  pinComment: (postId, commentId) => {
    set((s) => {
      const existing = s.comments[postId] ?? [];
      const updated = existing.map((c) => ({
        ...c,
        isPinned: c.id === commentId ? !c.isPinned : c.isPinned,
      }));
      return { comments: { ...s.comments, [postId]: updated } };
    });
  },

  reactToComment: (commentId, postId, type) => {
    set((s) => {
      const existing = s.comments[postId] ?? [];

      function updateComment(c: FeedComment): FeedComment {
        if (c.id !== commentId) {
          return {
            ...c,
            replies: c.replies.map(updateComment),
          };
        }
        const prev = c.myReaction;
        const reactions = c.reactions.map((r) => ({ ...r }));

        if (prev) {
          const idx = reactions.findIndex((r) => r.type === prev);
          if (idx !== -1) {
            reactions[idx] = {
              ...reactions[idx],
              count: reactions[idx].count - 1,
            };
            if (reactions[idx].count <= 0) reactions.splice(idx, 1);
          }
        }

        const myReaction = type === prev ? null : type;
        if (myReaction) {
          const idx = reactions.findIndex((r) => r.type === myReaction);
          if (idx !== -1) {
            reactions[idx] = {
              ...reactions[idx],
              count: reactions[idx].count + 1,
            };
          } else {
            reactions.push({ type: myReaction, count: 1 });
          }
        }

        return {
          ...c,
          reactions,
          totalReactions: reactions.reduce((sum, r) => sum + r.count, 0),
          myReaction,
        };
      }

      return {
        comments: {
          ...s.comments,
          [postId]: existing.map(updateComment),
        },
      };
    });
  },
}));
