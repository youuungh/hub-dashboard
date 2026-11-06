import { parseServerDate } from "@/lib/format";
import type { LogLevel } from "@/types/logs";

export const LEVELS: LogLevel[] = ["ERROR", "WARN", "INFO"];

// 표 배지, 수준 버튼은 색 점만 씀
export const LEVEL_BADGES: Record<string, string> = {
  ERROR:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400",
  WARN: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400",
  INFO: "border-transparent bg-muted text-muted-foreground",
};

export const LEVEL_DOTS: Record<LogLevel, string> = {
  ERROR: "bg-red-600",
  WARN: "bg-amber-500",
  INFO: "bg-neutral-400",
};

export const statusDot = (status: number) =>
  status >= 500
    ? LEVEL_DOTS.ERROR
    : status >= 400
      ? LEVEL_DOTS.WARN
      : LEVEL_DOTS.INFO;

export const RANGES = [
  { minutes: 15, label: "최근 15분" },
  { minutes: 60, label: "최근 1시간" },
  { minutes: 360, label: "최근 6시간" },
  { minutes: 1440, label: "최근 24시간" },
];

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/** 11/06 01:14:28.943 */
export function formatLogTime(value: string): string {
  const date = parseServerDate(value);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

/** 01:14 */
export function formatClock(value: string): string {
  const date = parseServerDate(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
