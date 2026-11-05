import type { BotJobGroup, BotJobKind, BotJobStatus } from "@/types/bot";

export const KIND_LABELS: Record<BotJobKind, string> = {
  ITEM: "예약 게시",
  GENERATE: "댓글 준비",
  COMMENT: "댓글",
  COMMENT_LIKES: "댓글 좋아요",
  POST_LIKES: "좋아요·조회",
  CLAIMS: "쿠폰 받기",
  WISHES: "찜",
  FOLLOW: "팔로우",
  VISITOR: "커뮤니티 답글",
};

export const GROUP_LABELS: Record<BotJobGroup, string> = {
  POST: "게시",
  COMMENT: "댓글",
  REACTION: "반응",
  REPLY: "커뮤니티 답글",
};

// 서버 BotJobGroup과 같은 묶음
export const KIND_GROUPS: Record<BotJobKind, BotJobGroup> = {
  ITEM: "POST",
  GENERATE: "COMMENT",
  COMMENT: "COMMENT",
  COMMENT_LIKES: "REACTION",
  POST_LIKES: "REACTION",
  CLAIMS: "REACTION",
  WISHES: "REACTION",
  FOLLOW: "REACTION",
  VISITOR: "REPLY",
};

export const STATUS_LABELS: Record<BotJobStatus, string> = {
  PENDING: "대기",
  DONE: "완료",
  SKIPPED: "건너뜀",
  FAILED: "실패",
};

export const GROUP_OPTIONS = Object.entries(GROUP_LABELS).map(
  ([value, label]) => ({ label, value }),
);

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(
  ([value, label]) => ({ label, value }),
);

const TIME = new Intl.DateTimeFormat("ko-KR", {
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatJobTime(date: Date): string {
  return TIME.format(date);
}

// 좁은 칸용: 11/3 22:00
export function formatShortTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}/${date.getDate()} ${hh}:${mm}`;
}
