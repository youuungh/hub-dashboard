// 서버 MediaItemResponse
export interface PostMedia {
  id: number;
  type: "IMAGE" | "VIDEO";
  url: string;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  thumbnailUrl?: string | null;
  previewUrl?: string | null;
  sortOrder: number;
}

export interface AdminPost {
  id: number;
  author: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
  };
  content: string;
  postType: string;
  contextType: string;
  status: string;
  mediaItems: PostMedia[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  shareCount: number;
  requiredTier: string;
  isActive: boolean;
  isSecret: boolean;
  isPinnedInFeed: boolean;
  isPinnedInCommunity: boolean;
  createdAt: string;
  updatedAt: string;
}
