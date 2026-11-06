"use client";

import { Fragment, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getLogs } from "@/lib/api/logs";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { LogEntry, LogLevel } from "@/types/logs";
import {
  LEVEL_BADGES,
  LEVEL_DOTS,
  LEVELS,
  RANGES,
  formatLogTime,
  statusDot,
} from "../options";
import { LogDetail } from "./log-detail";
import { LogHistogram } from "./log-histogram";

// 1시간 이하는 3초, 긴 기간은 파일을 많이 읽어 15초마다
const LIVE_MS = 3000;
const SLOW_MS = 15000;
const ALL_SOURCES = "__all__";

const ROW_GRID =
  "grid grid-cols-[96px_64px_minmax(0,1fr)] md:grid-cols-[150px_76px_120px_minmax(0,1fr)] items-center gap-x-3 px-4 md:px-6";

export default function LogView() {
  const [minutes, setMinutes] = useState(60);
  const [level, setLevel] = useState<LogLevel | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [live, setLive] = useState(true);
  // 목록 위에 마우스가 있으면 새 줄이 밀고 들어와 엉뚱한 줄을 누르지 않게 멈춤
  const [hovering, setHovering] = useState(false);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const streaming = live && !hovering;

  // 입력이 멈춘 뒤에 조회
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const params = { minutes, level, source, keyword };
  // 실패해도 계속 불러 서버가 다시 뜨면 이어짐
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.logs(params),
    queryFn: () => getLogs(params),
    placeholderData: keepPreviousData,
    refetchInterval: streaming ? (minutes <= 60 ? LIVE_MS : SLOW_MS) : false,
    meta: { errorMessage: "로그를 불러오는데 실패했습니다" },
  });

  const counts = data?.counts;
  const levelButtons: {
    key: LogLevel | null;
    label: string;
    count?: number;
  }[] = [
    {
      key: null,
      label: "전체",
      count: counts && counts.error + counts.warn + counts.info,
    },
    ...LEVELS.map((key) => ({
      key,
      label: key,
      count: counts?.[key.toLowerCase() as "error" | "warn" | "info"],
    })),
  ];
  const matched = levelButtons.find((item) => item.key === level)?.count ?? 0;
  const pickSource = (value: string | null) => {
    setSource(value);
    setSelected(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="toolbar"
        aria-orientation="horizontal"
        className="mt-4 flex w-full shrink-0 flex-wrap items-center gap-2 border-y px-4 py-2 md:px-6"
      >
        <div className="relative w-full sm:w-[260px]">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
          <Input
            type="search"
            aria-label="로그 검색"
            placeholder="메시지·주소 검색"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="h-[26px] pl-7 text-xs md:text-xs"
          />
        </div>

        <div
          role="group"
          aria-label="수준"
          className="bg-card flex h-[26px] overflow-hidden rounded-md border"
        >
          {levelButtons.map((item, index) => {
            const active = level === item.key;
            return (
              <button
                key={item.label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setLevel(item.key);
                  setSelected(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 text-xs transition-colors",
                  index > 0 && "border-l",
                  active
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium",
                )}
              >
                {item.key && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      LEVEL_DOTS[item.key],
                    )}
                  />
                )}
                {item.label}
                {item.count !== undefined && (
                  <span className="text-muted-foreground font-normal tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Select
          value={String(minutes)}
          onValueChange={(value) => {
            setMinutes(Number(value));
            setSelected(null);
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="기간"
            className="bg-card h-[26px] w-[120px] text-xs data-[size=sm]:h-[26px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((range) => (
              <SelectItem key={range.minutes} value={String(range.minutes)}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={source ?? ALL_SOURCES}
          onValueChange={(value) =>
            pickSource(value === ALL_SOURCES ? null : value)
          }
        >
          <SelectTrigger
            size="sm"
            aria-label="출처"
            className="bg-card h-[26px] w-[150px] text-xs data-[size=sm]:h-[26px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SOURCES}>출처 전체</SelectItem>
            {/* 고른 출처가 기간 밖으로 사라져도 선택이 풀리지 않게 */}
            {source && !data?.sources.some((item) => item.name === source) && (
              <SelectItem value={source}>{source}</SelectItem>
            )}
            {data?.sources.map((item) => (
              <SelectItem key={item.name} value={item.name}>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {item.count.toLocaleString()}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          {data?.truncated && (
            <span className="text-muted-foreground text-xs">
              파일에 남은 기록은 여기까지
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            aria-pressed={live}
            onClick={() => setLive((value) => !value)}
            className="bg-card h-[26px] gap-2 px-2.5 text-xs"
          >
            <span className="relative flex size-2">
              {streaming && !isError && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-600/60 motion-reduce:hidden" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  streaming
                    ? isError
                      ? "bg-destructive"
                      : "bg-green-600"
                    : live
                      ? "bg-amber-500"
                      : "bg-muted-foreground/50",
                )}
              />
            </span>
            {!live
              ? "멈춤"
              : hovering
                ? "멈춤 · 목록 위"
                : isError
                  ? "연결 끊김 · 다시 시도 중"
                  : minutes <= 60
                    ? "실시간 · 3초마다"
                    : "실시간 · 15초마다"}
          </Button>
        </div>
      </div>

      {data ? (
        <LogHistogram buckets={data.histogram} />
      ) : (
        <div className="shrink-0 border-b px-4 py-3 md:px-6">
          <Skeleton className="h-[90px] w-full" />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* 표와 같은 기본 스크롤, 막대는 머리줄 아래부터 */}
        {/* 터치는 떼도 멈춤이 안 풀려 마우스만 */}
        <div
          onPointerEnter={(event) =>
            event.pointerType === "mouse" && setHovering(true)
          }
          onPointerLeave={(event) =>
            event.pointerType === "mouse" && setHovering(false)
          }
          className="bg-thead-gutter scroll-below-thead min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]"
        >
          <div
            className={cn(
              ROW_GRID,
              "bg-thead text-muted-foreground sticky top-0 z-10 h-[33px] border-b text-xs font-medium",
            )}
          >
            <span>시각</span>
            <span>수준</span>
            <span className="max-md:hidden">출처</span>
            <span>메시지</span>
          </div>

          {isPending &&
            Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className={cn(ROW_GRID, "h-[34px] border-b")}>
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3.5 w-16 max-md:hidden" />
                <Skeleton className="h-3.5 w-full max-w-80" />
              </div>
            ))}

          {data && data.entries.length === 0 && (
            <p className="text-muted-foreground py-16 text-center">
              이 조건의 로그가 없습니다
            </p>
          )}

          {data?.entries.map((entry) => {
            const active = selected?.id === entry.id;
            return (
              <Fragment key={entry.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(active ? null : entry)}
                  className={cn(
                    ROW_GRID,
                    "hover:bg-muted/40 min-h-[34px] w-full border-b text-left transition-colors",
                    active
                      ? "bg-accent hover:bg-accent"
                      : entry.level === "ERROR" &&
                          "bg-red-50/40 dark:bg-red-950/20",
                  )}
                >
                  <span className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                    <span className="max-md:hidden">
                      {formatLogTime(entry.time)}
                    </span>
                    <span className="md:hidden">
                      {formatLogTime(entry.time).slice(6, 14)}
                    </span>
                  </span>
                  <span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[11px] font-semibold",
                        LEVEL_BADGES[entry.level],
                      )}
                    >
                      {entry.level}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground truncate max-md:hidden">
                    {entry.source}
                  </span>
                  {entry.request ? (
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs tabular-nums">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            statusDot(entry.request.status),
                          )}
                        />
                        {entry.request.status}
                      </span>
                      <span className="border-foreground/15 flex h-[18px] min-w-11 shrink-0 items-center justify-center rounded-[5px] border px-1 font-mono text-[10.5px] font-semibold">
                        {entry.request.method}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {entry.request.path}
                      </span>
                      <span className="text-muted-foreground min-w-[52px] shrink-0 text-right font-mono text-xs tabular-nums max-md:hidden">
                        {entry.request.durationMs.toLocaleString()}ms
                      </span>
                    </span>
                  ) : (
                    <span className="truncate">{entry.message}</span>
                  )}
                </button>
                {/* 좁은 화면은 옆 패널 대신 줄 아래에 펼침 */}
                {active && (
                  <div className="border-b lg:hidden">
                    <LogDetail
                      entry={entry}
                      onClose={() => setSelected(null)}
                      onSource={pickSource}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}

          {data && data.entries.length > 0 && data.entries.length < matched && (
            <p className="text-muted-foreground py-3 text-center text-xs">
              최근 {data.entries.length.toLocaleString()}건까지만 표시합니다
            </p>
          )}
        </div>

        {selected && (
          <aside
            aria-label="로그 상세"
            className="bg-card hidden w-[380px] shrink-0 border-l lg:flex lg:flex-col"
          >
            <LogDetail
              entry={selected}
              onClose={() => setSelected(null)}
              onSource={pickSource}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
