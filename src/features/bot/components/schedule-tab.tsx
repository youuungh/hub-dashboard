"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Film, ImageIcon } from "lucide-react";
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

type Range = "upcoming" | "past" | "all";

const RANGES: { value: Range; label: string }[] = [
  { value: "upcoming", label: "앞으로" },
  { value: "past", label: "지난 일정" },
  { value: "all", label: "전체" },
];

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

function dayTitle(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 (${weekday})`;
}

export function ScheduleTab() {
  const [range, setRange] = useState<Range>("upcoming");
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
    (row) =>
      (creator === "ALL" || row.creator === creator) &&
      (range === "all" ||
        (range === "upcoming"
          ? row.scheduledAt >= now
          : row.scheduledAt < now)),
  );
  const ordered = range === "past" ? [...filtered].reverse() : filtered;
  const days = new Map<string, BotScheduleRow[]>();
  ordered.forEach((row) => {
    const day = row.scheduledAt.slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), row]);
  });

  const mine = rows.filter((row) => row.creator === creator);
  const nextOne = mine.find((row) => row.scheduledAt >= now);
  const posted = mine.filter((row) => row.status === "DONE").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((item) => (
          <Button
            key={item.value}
            size="sm"
            variant={range === item.value ? "default" : "outline"}
            onClick={() => setRange(item.value)}
          >
            {item.label}
          </Button>
        ))}
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
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}
      {!isPending && days.size === 0 && (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            {rows.length === 0
              ? "올린 일정표가 없습니다"
              : "조건에 맞는 일정이 없습니다"}
          </CardContent>
        </Card>
      )}

      {[...days.entries()].map(([day, items]) => (
        <section key={day} className="space-y-2">
          <h3 className="text-muted-foreground flex items-baseline gap-2 text-sm font-semibold">
            {dayTitle(day)}
            <span className="font-normal">{items.length}건</span>
          </h3>
          <Card className="py-0">
            <CardContent className="divide-y p-0">
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
        </section>
      ))}
    </div>
  );
}
