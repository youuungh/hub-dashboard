export type BotJobStatus = "PENDING" | "DONE" | "SKIPPED" | "FAILED";

export type BotJobKind =
  | "ITEM"
  | "GENERATE"
  | "COMMENT"
  | "COMMENT_LIKES"
  | "POST_LIKES"
  | "CLAIMS"
  | "WISHES"
  | "FOLLOW"
  | "VISITOR";

/** 화면에서 보는 묶음 */
export type BotJobGroup = "POST" | "COMMENT" | "REACTION" | "REPLY";

export interface BotUsage {
  model: string;
  successCount: number;
  failureCount: number;
}

export interface BotGroupCount {
  group: BotJobGroup;
  doneCount: number;
  failedCount: number;
  skippedCount: number;
}

export interface BotDailyCount {
  /** 한국 날짜 YYYY-MM-DD */
  date: string;
  doneCount: number;
  failedCount: number;
  skippedCount: number;
}

export interface BotUpcoming {
  kind: BotJobKind;
  runAt: string;
  target: string;
}

export interface BotSummary {
  isEnabled: boolean;
  lastRunAt: string | null;
  pendingCount: number;
  doneToday: number;
  failedToday: number;
  scheduleVersion: string | null;
  /** 한국 시각, 존 없음 */
  scheduleEndsAt: string | null;
  scheduleDaysLeft: number | null;
  mediaItemsLeft: number;
  usageToday: BotUsage[];
  todayByGroup: BotGroupCount[];
  dailyCounts: BotDailyCount[];
  upcomingJobs: BotUpcoming[];
}

export interface BotJob {
  id: number;
  kind: BotJobKind;
  key: string;
  target: string;
  runAt: string;
  status: BotJobStatus;
  attempts: number;
  error: string | null;
  resultId: number | null;
  finishedAt: string | null;
}

export type BotScheduleKind =
  "POST" | "COMMUNITY" | "PRODUCT" | "DEAL" | "COUPON";

export interface BotScheduleRow {
  id: string;
  kind: BotScheduleKind;
  /** 한국 시각, 존 없음 */
  scheduledAt: string;
  creator: string;
  creatorName: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "PRODUCT" | null;
  text: string;
  imageCount: number;
  hasVideo: boolean;
  tier: string | null;
  /** null = 아직 예약 전 */
  status: BotJobStatus | null;
  resultId: number | null;
  error: string | null;
}

export interface BotAiComment {
  commentId: number;
  kind: BotJobKind;
  authorName: string;
  isCreator: boolean;
  postId: number;
  postSummary: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
}
