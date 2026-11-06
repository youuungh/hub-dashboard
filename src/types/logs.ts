export type LogLevel = "ERROR" | "WARN" | "INFO";

export interface LogEntry {
  id: string;
  /** 존 없는 UTC */
  time: string;
  level: string;
  /** 로거 이름 */
  source: string;
  message: string;
  stack: string | null;
  /** HTTP 요청 줄만 */
  request: LogRequest | null;
}

export interface LogRequest {
  status: number;
  method: string;
  path: string;
  durationMs: number;
}

export interface LogBucket {
  start: string;
  error: number;
  warn: number;
  info: number;
}

export interface LogQueryResult {
  entries: LogEntry[];
  /** 수준 필터는 빼고 셈 */
  counts: { error: number; warn: number; info: number };
  histogram: LogBucket[];
  sources: { name: string; count: number }[];
  /** 파일이 기간보다 짧아 앞부분이 없음 */
  truncated: boolean;
}

export interface LogQueryParams {
  minutes: number;
  level: LogLevel | null;
  source: string | null;
  keyword: string;
}
