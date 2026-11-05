"use client";

import Link from "next/link";
import { PanelHeader } from "@/components/panel-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { parseServerDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BotSummary } from "@/types/bot";
import {
  BOT_STATE_DOTS,
  BOT_STATE_LABELS,
  SCHEDULE_WARN_DAYS,
  botState,
} from "../status";
import { KIND_LABELS, formatShortTime } from "./job-tables/options";

// 대시보드용 자동화 요약, 자세한 건 자동화 현황에서
export function BotSummaryCard({
  summary,
  loading,
  className,
}: {
  summary?: BotSummary;
  loading: boolean;
  className?: string;
}) {
  const state = botState(summary);
  const daysLeft = summary?.scheduleDaysLeft ?? null;
  const stats = summary
    ? [
        {
          label: "오늘 완료",
          value: `${summary.doneToday.toLocaleString()}건`,
        },
        {
          label: "오늘 실패",
          value: `${summary.failedToday.toLocaleString()}건`,
          danger: summary.failedToday > 0,
        },
        { label: "대기", value: `${summary.pendingCount.toLocaleString()}건` },
        {
          label: "일정표 남은 일수",
          value: daysLeft === null ? "없음" : `${daysLeft}일`,
          danger: daysLeft === null || daysLeft <= SCHEDULE_WARN_DAYS,
        },
      ]
    : [];
  // 오른쪽 열 높이까지 늘어난 자리를 채울 만큼
  const upcoming = summary?.upcomingJobs.slice(0, 5) ?? [];

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <PanelHeader
        title="자동화"
        aside={
          <div className="flex items-center gap-3">
            {summary && (
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span
                  className={cn("size-1.5 rounded-full", BOT_STATE_DOTS[state])}
                />
                {BOT_STATE_LABELS[state]}
              </span>
            )}
            <Link
              href="/dashboard/bot"
              className="text-xs font-medium hover:underline"
            >
              현황 보기
            </Link>
          </div>
        }
      />
      {!summary ? (
        <p className="text-muted-foreground px-4 py-8 text-center">
          {loading ? "불러오는 중" : "자동화 상태를 불러올 수 없습니다"}
        </p>
      ) : (
        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* 카드가 늘어나도 네 칸이 높이를 반씩, 글자는 서버 상태 카드처럼 왼쪽 위 */}
          <div className="grid grid-cols-2 grid-rows-2 max-lg:border-b lg:border-r">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "px-4 py-3",
                  index % 2 === 0 && "border-r",
                  index >= 2 && "border-t",
                )}
              >
                <div className="text-muted-foreground text-xs">
                  {stat.label}
                </div>
                <div
                  className={cn(
                    "mt-0.5 text-lg font-semibold tabular-nums",
                    stat.danger && "text-destructive",
                  )}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          {/* 왼쪽 네 칸처럼 높이를 꽉 채우게 줄이 남는 높이를 나눠 가짐 */}
          <div className="flex min-w-0 flex-col">
            {/* 위 여백을 네 칸과 같게 해서 칸 이름과 한 줄로 */}
            <div className="text-muted-foreground border-b px-4 pt-3 pb-2 text-xs">
              다음 예정
            </div>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground flex flex-1 items-center justify-center px-4 py-3">
                예정된 작업이 없습니다
              </p>
            ) : (
              <div className="flex flex-1 flex-col divide-y">
                {upcoming.map((job, index) => (
                  <div
                    key={`${job.runAt}-${index}`}
                    className="flex flex-1 items-center gap-2.5 px-4 py-2"
                  >
                    <span className="w-20 shrink-0 font-medium whitespace-nowrap tabular-nums">
                      {formatShortTime(parseServerDate(job.runAt))}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground shrink-0 border-transparent font-normal"
                    >
                      {KIND_LABELS[job.kind]}
                    </Badge>
                    <span
                      className="text-foreground/80 min-w-0 flex-1 truncate"
                      title={job.target}
                    >
                      {job.target}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
