"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Film, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { BotScheduleRow } from "@/types/bot";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const STATE: Record<string, { label: string; className: string }> = {
  WAITING: { label: "예정", className: "text-muted-foreground font-normal" },
  PENDING: {
    label: "올리는 중",
    className: "border-primary/30 bg-primary/5 text-primary",
  },
  DONE: {
    label: "올라감",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  SKIPPED: {
    label: "건너뜀",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
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

  const mine = rows.filter((row) => row.creator === creator);
  const nextOne = mine.find((row) => row.scheduledAt >= now);
  const posted = mine.filter((row) => row.status === "DONE").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="이전 달"
            disabled={month <= firstMonth}
            onClick={() => moveMonth(-1)}
          >
            <ChevronLeft />
          </Button>
          <span className="w-24 text-center text-sm font-semibold tabular-nums">
            {Number(month.slice(0, 4))}년 {Number(month.slice(5, 7))}월
          </span>
          <Button
            size="icon"
            variant="outline"
            className="size-8"
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
          <SelectTrigger size="sm" className="w-40">
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
        {creator !== "ALL" && (
          <span className="text-muted-foreground text-sm">
            전체 {mine.length}건 · 올라감 {posted}건
            {nextOne &&
              ` · 다음 ${Number(nextOne.scheduledAt.slice(5, 7))}/${Number(nextOne.scheduledAt.slice(8, 10))} ${nextOne.scheduledAt.slice(11, 16)}`}
          </span>
        )}
      </div>

      {isPending && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}
      {!isPending && rows.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            올린 일정표가 없습니다
          </CardContent>
        </Card>
      )}

      {!isPending && rows.length > 0 && (
        <>
          <Card className="shrink-0 py-0">
            <CardContent className="grid grid-cols-8 gap-1.5 p-3 md:grid-cols-16">
              {daysOf(month).map((key) => {
                const count = byDay.get(key)?.length ?? 0;
                const failed = byDay
                  .get(key)
                  ?.some((row) => row.status === "FAILED");
                const selected = key === day;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`${dayTitle(key)} ${count}건`}
                    aria-pressed={selected}
                    onClick={() => setDay(key)}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 rounded-lg border py-1.5 transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      !selected && key === today && "border-primary/50",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px]",
                        !selected && "text-muted-foreground",
                      )}
                    >
                      {WEEKDAYS[weekdayOf(key)]}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {Number(key.slice(8))}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
                        !selected && "text-muted-foreground",
                      )}
                    >
                      {count}건
                    </span>
                    {failed && (
                      <span className="bg-destructive absolute top-1 right-1 size-1.5 rounded-full" />
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* 날짜 줄은 고정, 그날 목록만 카드 안에서 스크롤 */}
          <Card className="min-h-0 flex-1 gap-0 py-0">
            <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
              <h3 className="flex items-baseline gap-2 text-sm font-semibold">
                {dayTitle(day)}
                <span className="text-muted-foreground font-normal">
                  {items.length}건
                </span>
              </h3>
              {mix && (
                <span className="text-muted-foreground text-xs">{mix}</span>
              )}
            </div>
            <CardContent className="min-h-0 flex-1 divide-y overflow-y-auto p-0">
              {items.length === 0 && (
                <p className="text-muted-foreground py-10 text-center text-sm">
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
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:flex-nowrap"
                  >
                    <span className="text-muted-foreground w-12 shrink-0 tabular-nums">
                      {row.scheduledAt.slice(11, 16)}
                    </span>
                    <span className="w-20 shrink-0 truncate font-medium">
                      {row.creatorName}
                    </span>
                    <span className="flex w-28 shrink-0 items-center gap-1.5">
                      <Badge variant="secondary" className="font-normal">
                        {kindLabel(row)}
                      </Badge>
                      {row.tier && row.tier !== "FREE" && (
                        <Badge variant="outline" className="font-normal">
                          {row.tier === "TIER1" ? "1단계" : "2단계"}
                        </Badge>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate" title={row.text}>
                      {row.text}
                    </span>
                    <span className="text-muted-foreground flex shrink-0 items-center gap-2">
                      {row.imageCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs">
                          <ImageIcon className="size-3.5" />
                          {row.imageCount}
                        </span>
                      )}
                      {row.hasVideo && <Film className="size-3.5" />}
                    </span>
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
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
