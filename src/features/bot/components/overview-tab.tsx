"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { KpiItem, KpiStrip } from "@/components/kpi-strip";
import { PanelHeader } from "@/components/panel-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleBot } from "@/lib/api/bot";
import { parseServerDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import type { BotDailyCount, BotSummary } from "@/types/bot";
import {
  SCHEDULE_WARN_DAYS,
  BOT_STATE_DOTS,
  BOT_STATE_LABELS,
  botState,
  minutesSince,
} from "../status";
import {
  formatJobTime,
  formatShortTime,
  GROUP_LABELS,
  KIND_LABELS,
} from "./job-tables/options";

// 무료 한도를 아는 모델만 막대로 표시
const DAILY_LIMITS: Record<string, number> = {
  "openai/gpt-oss-120b": 1000,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function relative(minutes: number | null): string {
  if (minutes === null) return "기록 없음";
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 60 / 24)}일 전`;
}

// 일정표 시각은 한국 시간 문자열
function scheduleDate(value: string): string {
  const [, month, day] = value.slice(0, 10).split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-36 flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground px-4 py-8 text-center">{children}</p>
  );
}

function StatusBar({ summary }: { summary?: BotSummary }) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: toggleBot,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bot, data);
      toast.success(data.isEnabled ? "자동화를 켰습니다" : "자동화를 껐습니다");
    },
    onError: () => toast.error("자동화 상태를 바꾸지 못했습니다"),
  });

  const minutes = minutesSince(summary?.lastRunAt ?? null);
  const state = botState(summary);
  const daysLeft = summary?.scheduleDaysLeft ?? null;
  const runningOut = daysLeft !== null && daysLeft <= SCHEDULE_WARN_DAYS;

  return (
    <Card className="flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            {state === "running" && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-600/60 motion-reduce:hidden" />
            )}
            <span
              className={cn(
                "relative inline-flex size-2.5 rounded-full",
                BOT_STATE_DOTS[state],
              )}
            />
          </span>
          <span className="text-sm font-semibold">
            {BOT_STATE_LABELS[state]}
          </span>
        </div>
      </div>
      {/* 좁은 화면은 상태·스위치를 한 줄에, 실행·일정표는 아랫줄로 */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 max-sm:order-last max-sm:w-full">
        <Meta label="마지막 실행">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "cursor-help",
                  state === "stale" && "text-destructive",
                )}
              >
                {relative(minutes)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {summary?.lastRunAt
                ? formatJobTime(parseServerDate(summary.lastRunAt))
                : "아직 한 번도 돌지 않았습니다"}
            </TooltipContent>
          </Tooltip>
        </Meta>
        <Meta label="일정표">
          {summary?.scheduleVersion ? (
            <span className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="font-mono text-xs font-normal"
              >
                {summary.scheduleVersion}
              </Badge>
              {summary.scheduleEndsAt &&
                `${scheduleDate(summary.scheduleEndsAt)}까지`}
              {runningOut && (
                <Badge
                  variant="outline"
                  className="border-destructive/30 bg-destructive/10 text-destructive font-normal"
                >
                  {daysLeft}일 남음 · 다음 일정표 필요
                </Badge>
              )}
            </span>
          ) : (
            <span className="text-destructive">
              없음 · 일정표를 올려 주세요
            </span>
          )}
        </Meta>
      </div>
      <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-medium">
        {summary?.isEnabled ? "켜짐" : "꺼짐"}
        <Switch
          aria-label="자동화 켜기"
          checked={summary?.isEnabled ?? false}
          disabled={!summary || toggle.isPending}
          onCheckedChange={(checked) => toggle.mutate(checked)}
        />
      </label>
    </Card>
  );
}

function DailyChart({ days }: { days: BotDailyCount[] }) {
  const max = Math.max(
    1,
    ...days.map((d) => d.doneCount + d.failedCount + d.skippedCount),
  );
  return (
    <Card className="h-full gap-0 py-0">
      <PanelHeader
        title="최근 7일"
        aside={
          <div className="text-muted-foreground flex flex-wrap gap-3.5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-chart-1 size-2 rounded-full" />
              완료
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-chart-4 size-2 rounded-full" />
              건너뜀
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-destructive size-2 rounded-full" />
              실패
            </span>
          </div>
        }
      />
      <div className="px-4 py-3.5">
        <div className="flex h-52 items-end gap-3.5 border-b">
          {days.map((d, index) => {
            const total = d.doneCount + d.failedCount + d.skippedCount;
            const today = index === days.length - 1;
            return (
              <Tooltip key={d.date}>
                <TooltipTrigger asChild>
                  <div className="flex h-full min-w-0 flex-1 cursor-help flex-col items-center justify-end gap-1.5">
                    <span className="text-xs font-semibold tabular-nums">
                      {total > 0 ? d.doneCount.toLocaleString() : ""}
                    </span>
                    <div
                      className="flex w-full max-w-11 flex-col-reverse gap-0.5 overflow-hidden rounded-t-md"
                      style={{ height: `${(total / max) * 85}%` }}
                    >
                      <div
                        className={today ? "bg-chart-2" : "bg-chart-1"}
                        style={{
                          height: `${(d.doneCount / Math.max(1, total)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-chart-4"
                        style={{
                          height: `${(d.skippedCount / Math.max(1, total)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-destructive"
                        style={{
                          height: `${(d.failedCount / Math.max(1, total)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  완료 {d.doneCount} · 건너뜀 {d.skippedCount} · 실패{" "}
                  {d.failedCount}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="mt-2 flex gap-3.5">
          {days.map((d, index) => {
            const [y, m, day] = d.date.split("-").map(Number);
            const weekday =
              WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
            const today = index === days.length - 1;
            return (
              <span
                key={d.date}
                className={cn(
                  "min-w-0 flex-1 text-center text-xs whitespace-nowrap",
                  today ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {today ? (
                  "오늘"
                ) : (
                  <>
                    {m}/{day}
                    {/* 좁으면 일곱 칸에 요일까지는 안 들어감 */}
                    <span className="max-sm:hidden"> {weekday}</span>
                  </>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function UsageCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.usageToday ?? [];
  return (
    <Card className="h-full gap-0 py-0">
      <PanelHeader
        title="AI 사용량"
        aside={
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            오늘 0시부터
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="text-muted-foreground/70 size-3.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>실패하면 다음 모델로 넘어갑니다.</TooltipContent>
            </Tooltip>
          </span>
        }
      />
      {rows.length === 0 && <Empty>오늘은 아직 호출하지 않았습니다</Empty>}
      <div className="divide-y">
        {rows.map((row) => {
          const used = row.successCount + row.failureCount;
          const limit = DAILY_LIMITS[row.model];
          return (
            <div key={row.model} className="space-y-1.5 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{row.model}</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {used.toLocaleString()}
                  {limit && (
                    <span className="text-muted-foreground text-xs font-normal">
                      {" "}
                      / {limit.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
              {limit && (
                <Progress
                  value={Math.min(100, (used / limit) * 100)}
                  className="h-2"
                />
              )}
              <p className="text-muted-foreground text-xs">
                성공 {row.successCount.toLocaleString()}
                {row.failureCount > 0 && (
                  <span className="text-destructive">
                    {" "}
                    · 실패 {row.failureCount}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TodayCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.todayByGroup ?? [];
  return (
    <Card className="h-full gap-0 py-0">
      <PanelHeader title="오늘 한 일" />
      {rows.length === 0 && <Empty>아직 오늘 끝난 작업이 없습니다</Empty>}
      <div className="divide-y">
        {rows.map((row) => (
          <div key={row.group} className="flex items-center gap-2.5 px-4 py-2">
            <span className="min-w-0 flex-1 font-medium">
              {GROUP_LABELS[row.group]}
            </span>
            {row.skippedCount > 0 && (
              <span className="text-muted-foreground text-xs">
                건너뜀 {row.skippedCount}
              </span>
            )}
            {row.failedCount > 0 && (
              <span className="text-destructive text-xs">
                실패 {row.failedCount}
              </span>
            )}
            <span className="w-12 text-right font-semibold tabular-nums">
              {row.doneCount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UpcomingCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.upcomingJobs ?? [];
  return (
    <Card className="h-full gap-0 py-0">
      <PanelHeader
        title="다음 예정"
        aside={
          <Link
            href="/dashboard/bot?tab=schedule"
            className="text-xs font-medium hover:underline"
          >
            일정표 보기
          </Link>
        }
      />
      {rows.length === 0 && <Empty>예정된 작업이 없습니다</Empty>}
      {/* 옆 차트 높이까지 줄이 남는 높이를 나눠 가짐 */}
      <div className="flex flex-1 flex-col divide-y">
        {rows.map((row, index) => (
          <div
            key={`${row.runAt}-${index}`}
            className="flex flex-1 items-center gap-2.5 px-4 py-2"
          >
            <span className="w-20 shrink-0 font-semibold whitespace-nowrap tabular-nums">
              {formatShortTime(parseServerDate(row.runAt))}
            </span>
            <Badge
              variant="outline"
              className="bg-muted text-muted-foreground shrink-0 border-transparent font-normal"
            >
              {KIND_LABELS[row.kind]}
            </Badge>
            <span
              className="text-foreground/80 min-w-0 flex-1 truncate"
              title={row.target}
            >
              {row.target}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewTab({ summary }: { summary?: BotSummary }) {
  const skippedToday =
    summary?.todayByGroup.reduce((sum, row) => sum + row.skippedCount, 0) ?? 0;
  const next = summary?.upcomingJobs[0];
  const daysLeft = summary?.scheduleDaysLeft ?? null;

  return (
    <div className="space-y-4">
      <StatusBar summary={summary} />

      <KpiStrip>
        <KpiItem
          title="오늘 완료"
          tooltip="오늘 0시 이후 끝난 작업 수입니다."
          value={summary?.doneToday ?? 0}
          footer={`건너뜀 ${skippedToday}건`}
        />
        <KpiItem
          title="오늘 실패"
          tooltip="세 번까지 다시 해도 안 된 작업입니다. 작업 기록 탭에서 다시 할 수 있습니다."
          value={summary?.failedToday ?? 0}
          footer={summary?.failedToday ? "작업 기록에서 확인" : "문제 없음"}
        />
        <KpiItem
          title="대기 중"
          tooltip="예정 시각을 기다리는 작업 수입니다."
          value={summary?.pendingCount ?? 0}
          footer={
            next
              ? `다음 ${formatShortTime(parseServerDate(next.runAt))}`
              : "예정 없음"
          }
        />
        <KpiItem
          title="일정 남은 일수"
          tooltip={`일정표의 마지막 예약까지 남은 날입니다. ${SCHEDULE_WARN_DAYS}일 이하로 남으면 다음 일정표를 올려야 합니다.`}
          value={daysLeft ?? 0}
          suffix="일"
          footer={
            daysLeft !== null && daysLeft <= SCHEDULE_WARN_DAYS
              ? "다음 일정표를 올려 주세요"
              : `그림·영상 포스트 ${summary?.mediaItemsLeft ?? 0}건 남음`
          }
        />
      </KpiStrip>

      {/* 키 큰 둘을 위에, 짧은 둘을 아래에 짝지어 같은 줄 카드의 높이가 비슷하게 */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <DailyChart days={summary?.dailyCounts ?? []} />
        <UpcomingCard summary={summary} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <TodayCard summary={summary} />
        <UsageCard summary={summary} />
      </div>
    </div>
  );
}
