import type { PostMedia } from "@/types/post";

export type ReportTargetType = "POST" | "COMMENT" | "USER";

export interface ReportedTarget {
  targetType: ReportTargetType;
  targetId: number;
  reportCount: number;
  isBlinded: boolean;
  moderationLocked: boolean;
}

export const AUTO_BLIND_THRESHOLD = 50;

export interface ReportedTargetDetail {
  targetType: ReportTargetType;
  targetId: number;
  reportCount: number;
  isBlinded: boolean;
  moderationLocked: boolean;
  author?: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
  } | null;
  content?: string | null;
  mediaItems?: PostMedia[];
  likeCount?: number | null;
  commentCount?: number | null;
  createdAt?: string | null;
}
