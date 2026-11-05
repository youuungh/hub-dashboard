import { parseServerDate } from "@/lib/format";
import type { BotSummary } from "@/types/bot";

// 1분마다 도는데 이보다 오래 소식이 없으면 멈춘 것으로 봄
export const STALE_MINUTES = 5;

// 이보다 적게 남으면 다음 일정표를 올리라고 알림
export const SCHEDULE_WARN_DAYS = 7;

export type BotState = "loading" | "off" | "stale" | "running";

export const BOT_STATE_LABELS: Record<BotState, string> = {
  loading: "불러오는 중",
  off: "꺼짐",
  stale: "응답 없음",
  running: "작동 중",
};

export const BOT_STATE_DOTS: Record<BotState, string> = {
  loading: "bg-muted-foreground/40",
  off: "bg-muted-foreground/60",
  stale: "bg-destructive",
  running: "bg-green-600",
};

export function minutesSince(value: string | null): number | null {
  if (!value) return null;
  return Math.floor((Date.now() - parseServerDate(value).getTime()) / 60000);
}

export function botState(summary?: BotSummary): BotState {
  if (!summary) return "loading";
  if (!summary.isEnabled) return "off";
  const minutes = minutesSince(summary.lastRunAt);
  return minutes === null || minutes > STALE_MINUTES ? "stale" : "running";
}
