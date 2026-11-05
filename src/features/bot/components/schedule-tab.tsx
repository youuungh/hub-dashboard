"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Film, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBotSchedule } from "@/lib/api/bot";
import { tierLabel } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { BotScheduleRow } from "@/types/bot";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STATE: Record<string, { label: string; className: string }> = {
  WAITING: { label: "예정", className: "text-muted-foreground font-normal" },
  PENDING: {
    label: "올리는 중",
    className: "font-normal",
  },
  DONE: {
    label: "올라감",
    className: "font-normal",
  },
  SKIPPED: {
    label: "건너뜀",
    className: "bg-muted text-muted-foreground border-transparent font-normal",
  },
  FAILED: {
    label: "실패",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

function kindLabel(row: BotScheduleRow): string {
  if (row.kind === "POST") {
    if (row.type === "VIDEO") return "영상";
    if (row.type === "IMAGE") return "그림";
    if (row.type === "PRODUCT") return "상품 소개";
    return "글";
  }
  return {
    COMMUNITY: "커뮤니티",
    PRODUCT: "새 상품",
    DEAL: "타임딜",
    COUPON: "쿠폰",
  }[row.kind];
}

// 일정표 시각은 한국 시간 문자열이라 문자열로 비교
function nowKst(): string {
  const kst = new Date(Date.now() + 9 * 3600_000);
  return kst.toISOString().slice(0, 16);
}

function weekdayOf(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function dayTitle(day: string): string {
  const [, m, d] = day.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAYS[weekdayOf(day)]})`;
}

// "2026-12" → 그 달의 "2026-12-01" … "2026-12-31"
function daysOf(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from(
    { length: count },
    (_, index) => `${month}-${String(index + 1).padStart(2, "0")}`,
  );
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

export function ScheduleTab() {
  const today = nowKst().slice(0, 10);
  const [day, setDay] = useState(today);
  const [creator, setCreator] = useState("ALL");

  const { data, isPending } = useQuery({
    queryKey: [...queryKeys.bot, "schedule"],
    queryFn: getBotSchedule,
    refetchInterval: 60_000,
    meta: { errorMessage: "일정표를 불러오는데 실패했습니다" },
  });

  const rows = useMemo(() => data ?? [], [data]);
  const now = nowKst();
  const creators = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((row) => map.set(row.creator, row.creatorName));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "ko"));
  }, [rows]);

  const filtered = rows.filter(
    (row) => creator === "ALL" || row.creator === creator,
  );
  const byDay = new Map<string, BotScheduleRow[]>();
  filtered.forEach((row) => {
    const key = row.scheduledAt.slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), row]);
  });

  // 일정이 있는 달까지만 넘김
  const month = day.slice(0, 7);
  const firstMonth = rows[0]?.scheduledAt.slice(0, 7) ?? month;
  const lastMonth = rows[rows.length - 1]?.scheduledAt.slice(0, 7) ?? month;
  const moveMonth = (delta: number) => {
    const next = shiftMonth(month, delta);
    setDay(next === today.slice(0, 7) ? today : `${next}-01`);
  };

  const items = byDay.get(day) ?? [];
  const mix = Object.entries(
    items.reduce<Record<string, number>>((acc, row) => {
      const label = kindLabel(row);
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, count]) => `${label} ${count}`)
    .join(" · ");

  const nextOne = filtered.find((row) => row.scheduledAt >= now);
  const posted = filtered.filter((row) => row.status === "DONE").length;

  // 달력 첫 줄은 1일의 요일만큼 비움
  const monthDays = daysOf(month);
  const leading = weekdayOf(monthDays[0]);
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...monthDays,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-y px-4 py-2 md:px-6">
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="이전 달"
            disabled={month <= firstMonth}
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <span className="w-24 text-center font-semibold tabular-nums">
            {Number(month.slice(0, 4))}년 {Number(month.slice(5, 7))}월
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="다음 달"
            disabled={month >= lastMonth}
            onClick={() => moveMonth(1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={() => setDay(today)}>
          오늘
        </Button>
        <Select value={creator} onValueChange={setCreator}>
          <SelectTrigger
            size="sm"
            className="bg-card h-[26px] w-40 text-xs data-[size=sm]:h-[26px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">크리에이터 전체</SelectItem>
            {creators.map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {rows.length > 0 && (
          <span className="text-muted-foreground ml-auto text-xs">
            전체 {filtered.length}건 · 올라감 {posted}건
            {nextOne &&
              ` · 다음 ${Number(nextOne.scheduledAt.slice(5, 7))}/${Number(nextOne.scheduledAt.slice(8, 10))} ${nextOne.scheduledAt.slice(11, 16)}`}
          </span>
        )}
      </div>

      {isPending && (
        <div className="space-y-3 p-4 md:p-6">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}
      {!isPending && rows.length === 0 && (
        <p className="text-muted-foreground py-16 text-center">
          올린 일정표가 없습니다
        </p>
      )}

      {!isPending && rows.length > 0 && (
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:overflow-hidden">
          <div className="bg-card lg:min-h-0 lg:overflow-auto lg:border-r">
            <div className="bg-thead grid grid-cols-7 border-b">
              {WEEKDAYS.map((label) => (
                <span
                  key={label}
                  className="text-muted-foreground px-2.5 py-1.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((key, index) => {
                if (!key) {
                  return (
                    <span
                      key={`blank-${index}`}
                      className="min-h-[84px] border-r border-b last:border-r-0 [&:nth-child(7n)]:border-r-0"
                    />
                  );
                }
                const count = byDay.get(key)?.length ?? 0;
                const failed = byDay
                  .get(key)
                  ?.some((row) => row.status === "FAILED");
                const selected = key === day;
                const isToday = key === today;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`${dayTitle(key)} ${count}건`}
                    aria-pressed={selected}
                    onClick={() => setDay(key)}
                    className={cn(
                      "hover:bg-muted/50 relative flex min-h-[84px] flex-col items-start gap-1.5 border-r border-b p-2 text-left transition-colors [&:nth-child(7n)]:border-r-0",
                      selected && "bg-muted/70",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-[22px] items-center justify-center rounded-full text-xs font-medium tabular-nums",
                        isToday && "bg-primary text-primary-foreground",
                      )}
                    >
                      {Number(key.slice(8))}
                    </span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "bg-muted rounded-[5px] px-1.5 text-[11.5px] font-medium tabular-nums",
                          key < today
                            ? "text-muted-foreground"
                            : "text-foreground",
                          selected && "bg-background",
                        )}
                      >
                        {count}건
                      </span>
                    )}
                    {failed && (
                      <span className="bg-destructive absolute top-2 right-2 size-1.5 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 머리줄은 스크롤 밖에 두고 그날 목록만 스크롤 */}
          <section className="bg-card flex flex-col max-lg:border-t lg:min-h-0">
            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
              <h3 className="flex-1 font-semibold">{dayTitle(day)}</h3>
              <Badge variant="outline" className="font-normal">
                {items.length}건
              </Badge>
              {mix && (
                <span className="text-muted-foreground w-full text-xs">
                  {mix}
                </span>
              )}
            </div>
            <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              <div className="divide-y">
                {items.length === 0 && (
                  <p className="text-muted-foreground py-10 text-center">
                    이 날은 일정이 없습니다
                  </p>
                )}
                {items.map((row) => {
                  const state =
                    STATE[
                      row.status ??
                        (row.scheduledAt < now ? "PENDING" : "WAITING")
                    ];
                  return (
                    <div key={row.id} className="flex gap-2.5 px-4 py-2.5">
                      <span className="w-10 shrink-0 font-medium tabular-nums">
                        {row.scheduledAt.slice(11, 16)}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium">{row.creatorName}</span>
                          <Badge
                            variant="outline"
                            className="bg-muted text-muted-foreground border-transparent font-normal"
                          >
                            {kindLabel(row)}
                          </Badge>
                          {row.tier && row.tier !== "FREE" && (
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground border-transparent font-normal"
                            >
                              {tierLabel(row.tier)}
                            </Badge>
                          )}
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            {row.imageCount > 0 && (
                              <span className="flex items-center gap-0.5 text-xs">
                                <ImageIcon className="size-3.5" />
                                {row.imageCount}
                              </span>
                            )}
                            {row.hasVideo && <Film className="size-3.5" />}
                          </span>
                        </div>
                        <span
                          className="text-foreground/70 truncate"
                          title={row.text}
                        >
                          {row.text}
                        </span>
                      </div>
                      <span className="shrink-0 self-start">
                        {row.error ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className={cn("cursor-help", state.className)}
                              >
                                {state.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{row.error}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className={state.className}>
                            {state.label}
                          </Badge>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
