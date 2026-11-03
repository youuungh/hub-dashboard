"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  HelpCircle,
  ListTodo,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  formatJobTime,
  formatShortTime,
  GROUP_LABELS,
  KIND_LABELS,
} from "./job-tables/options";

// 무료 한도를 아는 모델만 막대로 표시
const DAILY_LIMITS: Record<string, number> = {
  "openai/gpt-oss-120b": 1000,
};

// 1분마다 도는데 이보다 오래 소식이 없으면 멈춘 것으로 봄
const STALE_MINUTES = 5;
// 이보다 적게 남으면 다음 일정표를 올리라고 알림
const SCHEDULE_WARN_DAYS = 7;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function minutesSince(value: string | null): number | null {
  if (!value) return null;
  return Math.floor((Date.now() - parseServerDate(value).getTime()) / 60000);
}

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
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground py-6 text-center text-sm">{children}</p>
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
  const stale =
    !!summary?.isEnabled && (minutes === null || minutes > STALE_MINUTES);
  const state = !summary
    ? { label: "불러오는 중", dot: "bg-muted-foreground/40" }
    : !summary.isEnabled
      ? { label: "꺼짐", dot: "bg-muted-foreground/60" }
      : stale
        ? { label: "응답 없음", dot: "bg-amber-500" }
        : { label: "작동 중", dot: "bg-emerald-500" };
  const daysLeft = summary?.scheduleDaysLeft ?? null;
  const runningOut = daysLeft !== null && daysLeft <= SCHEDULE_WARN_DAYS;

  return (
    <Card className="py-0">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              {summary?.isEnabled && !stale && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:hidden" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  state.dot,
                )}
              />
            </span>
            <span className="font-semibold">{state.label}</span>
          </div>
          <Meta label="마지막 실행">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("cursor-help", stale && "text-amber-600")}>
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
              <span className="flex items-center gap-1.5">
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
                    className="border-amber-500/30 bg-amber-500/10 font-normal text-amber-600"
                  >
                    {daysLeft}일 남음 · 다음 일정표 필요
                  </Badge>
                )}
              </span>
            ) : (
              <span className="text-amber-600">
                없음 · 일정표를 올려 주세요
              </span>
            )}
          </Meta>
        </div>
        <Switch
          aria-label="자동화 켜기"
          checked={summary?.isEnabled ?? false}
          disabled={!summary || toggle.isPending}
          onCheckedChange={(checked) => toggle.mutate(checked)}
        />
      </CardContent>
    </Card>
  );
}

function DailyChart({ days }: { days: BotDailyCount[] }) {
  const max = Math.max(
    1,
    ...days.map((d) => d.doneCount + d.failedCount + d.skippedCount),
  );
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>최근 7일</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-44 items-end gap-3">
          {days.map((d, index) => {
            const total = d.doneCount + d.failedCount + d.skippedCount;
            const [, m, day] = d.date.split("-").map(Number);
            const [y] = d.date.split("-").map(Number);
            const weekday =
              WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
            const today = index === days.length - 1;
            return (
              <Tooltip key={d.date}>
                <TooltipTrigger asChild>
                  <div className="flex h-full min-w-0 flex-1 cursor-help flex-col items-center justify-end gap-1.5">
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {total > 0 ? total.toLocaleString() : ""}
                    </span>
                    <div
                      className="bg-muted flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-md"
                      style={{ height: `${(total / max) * 100}%` }}
                    >
                      <div
                        className={cn(today ? "bg-primary" : "bg-primary/60")}
                        style={{
                          height: `${(d.doneCount / Math.max(1, total)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-amber-500/70"
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
                    <span
                      className={cn(
                        "text-xs whitespace-nowrap",
                        today ? "font-semibold" : "text-muted-foreground",
                      )}
                    >
                      {today ? "오늘" : `${m}/${day} ${weekday}`}
                    </span>
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
        <div className="text-muted-foreground mt-4 flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="bg-primary/60 size-2 rounded-sm" />
            완료
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-amber-500/70" />
            건너뜀
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-destructive size-2 rounded-sm" />
            실패
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TodayCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.todayByGroup ?? [];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>오늘 한 일</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 && <Empty>아직 오늘 끝난 작업이 없습니다</Empty>}
        {rows.map((row) => (
          <div
            key={row.group}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-muted-foreground">
              {GROUP_LABELS[row.group]}
            </span>
            <span className="flex items-center gap-3 tabular-nums">
              {row.skippedCount > 0 && (
                <span className="text-amber-600">
                  건너뜀 {row.skippedCount}
                </span>
              )}
              {row.failedCount > 0 && (
                <span className="text-destructive">실패 {row.failedCount}</span>
              )}
              <span className="font-medium">
                {row.doneCount.toLocaleString()}
              </span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UpcomingCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.upcomingJobs ?? [];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>다음 예정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 && <Empty>예정된 작업이 없습니다</Empty>}
        {rows.map((row, index) => (
          <div
            key={`${row.runAt}-${index}`}
            className="flex items-baseline gap-3 text-sm"
          >
            <span className="text-muted-foreground shrink-0 whitespace-nowrap tabular-nums">
              {formatShortTime(parseServerDate(row.runAt))}
            </span>
            <span className="shrink-0 font-medium whitespace-nowrap">
              {KIND_LABELS[row.kind]}
            </span>
            <span
              className="text-muted-foreground min-w-0 flex-1 truncate"
              title={row.target}
            >
              {row.target}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function UsageCard({ summary }: { summary?: BotSummary }) {
  const rows = summary?.usageToday ?? [];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          AI 사용량
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="text-muted-foreground/70 h-3.5 w-3.5 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              오늘 0시부터의 호출 수입니다. 실패하면 다음 모델로 넘어갑니다.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 && <Empty>오늘은 아직 호출하지 않았습니다</Empty>}
        {rows.map((row) => {
          const used = row.successCount + row.failureCount;
          const limit = DAILY_LIMITS[row.model];
          return (
            <div key={row.model} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-mono text-xs">{row.model}</span>
                <span className="shrink-0 tabular-nums">
                  {used.toLocaleString()}
                  {limit && (
                    <span className="text-muted-foreground">
                      {" "}
                      / {limit.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
              {limit && (
                <Progress
                  value={Math.min(100, (used / limit) * 100)}
                  className="h-1.5"
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
      </CardContent>
    </Card>
  );
}

export function OverviewTab({ summary }: { summary?: BotSummary }) {
  const skippedToday =
    summary?.todayByGroup.reduce((sum, row) => sum + row.skippedCount, 0) ?? 0;
  const next = summary?.upcomingJobs[0];
  const daysLeft = summary?.scheduleDaysLeft ?? null;

  return (
    <div className="space-y-6">
      <StatusBar summary={summary} />

      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="오늘 완료"
            tooltip="오늘 0시 이후 끝난 작업 수입니다."
            icon={CheckCircle2}
            value={summary?.doneToday ?? 0}
            caption={`건너뜀 ${skippedToday}건`}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="오늘 실패"
            tooltip="세 번까지 다시 해도 안 된 작업입니다. 작업 기록 탭에서 다시 할 수 있습니다."
            icon={XCircle}
            value={summary?.failedToday ?? 0}
            caption={summary?.failedToday ? "작업 기록에서 확인" : "문제 없음"}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="대기 중"
            tooltip="예정 시각을 기다리는 작업 수입니다."
            icon={ListTodo}
            value={summary?.pendingCount ?? 0}
            caption={
              next
                ? `다음 ${formatShortTime(parseServerDate(next.runAt))}`
                : "예정 없음"
            }
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="일정 남은 일수"
            tooltip={`일정표의 마지막 예약까지 남은 날입니다. ${SCHEDULE_WARN_DAYS}일 이하로 남으면 다음 일정표를 올려야 합니다.`}
            icon={CalendarClock}
            value={daysLeft ?? 0}
            caption={
              daysLeft !== null && daysLeft <= SCHEDULE_WARN_DAYS
                ? "다음 일정표를 올려 주세요"
                : `그림·영상 포스트 ${summary?.mediaItemsLeft ?? 0}건 남음`
            }
          />
        </StaggerItem>
      </StaggerGroup>

      <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2">
          <DailyChart days={summary?.dailyCounts ?? []} />
        </StaggerItem>
        <StaggerItem>
          <TodayCard summary={summary} />
        </StaggerItem>
      </StaggerGroup>

      <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StaggerItem className="lg:col-span-2">
          <UpcomingCard summary={summary} />
        </StaggerItem>
        <StaggerItem>
          <UsageCard summary={summary} />
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
