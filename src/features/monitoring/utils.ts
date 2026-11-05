import type { HttpMetrics } from "@/types/monitoring";

// 이보다 높으면 빨갛게, 5xx만은 엄하게·옛 Hub의 4xx 포함 값은 느슨하게
const SERVER_ERROR_RATE_WARN = 0.01;
const ERROR_RATE_WARN = 0.05;

/** 서버 이상은 5xx로 판단, 옛 Hub면 4xx 포함 값으로 */
export function errorRateOf(http: HttpMetrics) {
  const server = http.serverErrorRate !== undefined;
  const rate = http.serverErrorRate ?? http.errorRate;
  return {
    rate,
    title: server ? "서버 오류율" : "오류율",
    warn: rate > (server ? SERVER_ERROR_RATE_WARN : ERROR_RATE_WARN),
  };
}

/** 밀리초 가동 시간을 "6일 4시간"처럼 */
export function formatUptime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}일 ${hours % 24}시간`;
  if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
  return `${minutes}분`;
}

/** 바이트를 MB·GB로 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0 || !isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

/** 주간 평균 대비 오늘 값 증감률 */
export function calculateWeeklyChangeRate(
  today: number,
  weekly: number,
): number | null {
  if (!weekly || weekly === 0) return null;
  const weeklyAverage = weekly / 7;
  if (weeklyAverage === 0) return null;
  return ((today - weeklyAverage) / weeklyAverage) * 100;
}
