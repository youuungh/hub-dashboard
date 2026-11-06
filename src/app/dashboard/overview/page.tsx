"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { KpiItem, KpiStrip } from "@/components/kpi-strip";
import PageContainer from "@/components/layout/page-container";
import { PanelHeader } from "@/components/panel-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BotSummaryCard } from "@/features/bot/components/bot-summary-card";
import { SCHEDULE_WARN_DAYS, botState } from "@/features/bot/status";
import { useMonitoring } from "@/features/monitoring/use-monitoring";
import {
  calculateWeeklyChangeRate,
  errorRateOf,
  formatUptime,
} from "@/features/monitoring/utils";
import { getBotSummary } from "@/lib/api/bot";
import { getCreatorStatistics } from "@/lib/api/creators";
import { getOrderStatistics } from "@/lib/api/orders";
import { getUserStatistics } from "@/lib/api/users";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const SUMMARY_INTERVAL_MS = 30_000;

const won = (value: string | undefined) => Math.floor(parseFloat(value || "0"));

const percent = (part: number, total: number) =>
  total > 0 ? (part / total) * 100 : 0;

function Row({
  label,
  value,
  dot,
}: {
  label: string;
  value: React.ReactNode;
  dot?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t py-2 first:border-t-0">
      <span className="text-muted-foreground flex items-center gap-2">
        {dot && <span className={cn("size-[7px] rounded-full", dot)} />}
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Task({
  title,
  detail,
  href,
  action,
  muted,
}: {
  title: string;
  detail: string;
  href?: string;
  action?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-t px-4 py-2.5 first:border-t-0">
      <div className="min-w-0 flex-1">
        <div className={cn("font-medium", muted && "text-muted-foreground")}>
          {title}
        </div>
        <div className="text-muted-foreground text-xs">{detail}</div>
      </div>
      {href && action && (
        <Button variant="outline" size="sm" asChild>
          <Link href={href}>{action}</Link>
        </Button>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const statistics = useQuery({
    queryKey: queryKeys.statistics,
    queryFn: async () => {
      const [users, orders, creators] = await Promise.all([
        getUserStatistics(),
        getOrderStatistics(),
        getCreatorStatistics(),
      ]);
      return { users, orders, creators };
    },
    meta: { errorMessage: "대시보드 데이터를 불러오는데 실패했습니다" },
  });
  const monitoring = useMonitoring(SUMMARY_INTERVAL_MS);
  const bot = useQuery({
    queryKey: queryKeys.bot,
    queryFn: getBotSummary,
    refetchInterval: SUMMARY_INTERVAL_MS,
  });

  const users = statistics.data?.users;
  const orders = statistics.data?.orders;
  const creators = statistics.data?.creators;

  if (statistics.isPending) {
    return (
      <PageContainer className="gap-6 md:px-8 md:pt-8">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[92px] rounded-lg" />
          ))}
        </div>
        {/* 본 화면 카드 높이, 자동화 칸이 늘어나 끝을 맞춤 */}
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Skeleton className="h-[233px] rounded-lg" />
            <Skeleton className="h-[273px] rounded-lg lg:flex-1" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[91px] rounded-lg" />
            <Skeleton className="h-[185px] rounded-lg" />
            <Skeleton className="h-[226px] rounded-lg" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const totalOrders = orders?.totalOrders ?? 0;
  const segments = [
    { label: "완료", value: orders?.completedOrders ?? 0, color: "bg-chart-1" },
    {
      label: "결제 대기",
      value: orders?.pendingOrders ?? 0,
      color: "bg-chart-2",
    },
    { label: "취소", value: orders?.cancelledOrders ?? 0, color: "bg-chart-4" },
  ];
  // 배송 중 같은 나머지 상태
  const others = Math.max(
    0,
    totalOrders - segments.reduce((sum, s) => sum + s.value, 0),
  );
  if (others > 0) {
    segments.push({ label: "그 외", value: others, color: "bg-chart-3" });
  }

  const totalUsers = users?.totalUsers ?? 0;
  const activeRate = percent(users?.activeUsers ?? 0, totalUsers);
  const ring = 2 * Math.PI * 38;

  const metrics = monitoring.data?.metrics;
  const health = monitoring.data?.health;
  const heapRate = metrics
    ? percent(metrics.jvm.heapUsed, metrics.jvm.heapMax)
    : 0;
  const healthy = health?.status === "UP";
  const errors = metrics
    ? errorRateOf(metrics.http)
    : { title: "", rate: 0, warn: false };

  const summary = bot.data;
  const pending = creators?.pendingApplications ?? 0;
  const daysLeft = summary?.scheduleDaysLeft ?? null;

  // 손봐야 할 것만, 급한 순서대로
  const tasks: {
    title: string;
    detail: string;
    href?: string;
    action?: string;
  }[] = [];
  if (health && !healthy) {
    tasks.push({
      title: "서버 상태 확인 필요",
      detail: `헬스 체크 ${health.status}`,
      href: "/dashboard/monitoring",
      action: "상세 보기",
    });
  }
  if (summary) {
    const state = botState(summary);
    if (state === "off" || state === "stale") {
      tasks.push({
        title:
          state === "off" ? "자동화가 꺼져 있음" : "자동화가 응답하지 않음",
        detail: `대기 ${summary.pendingCount.toLocaleString()}건`,
        href: "/dashboard/bot",
        action: "현황 보기",
      });
    }
    if (summary.failedToday > 0) {
      tasks.push({
        title: `자동화 오늘 실패 ${summary.failedToday}건`,
        detail: `오늘 완료 ${summary.doneToday.toLocaleString()}건`,
        href: "/dashboard/bot?tab=jobs&status=FAILED",
        action: "작업 기록",
      });
    }
  }
  if (pending > 0) {
    tasks.push({
      title: `크리에이터 신청 ${pending}건 대기`,
      detail: `오늘 ${creators?.applicationsToday ?? 0}건 · 이번 주 ${creators?.applicationsThisWeek ?? 0}건 신청`,
      href: "/dashboard/creators?status=PENDING",
      action: "검토하기",
    });
  }
  if (
    summary &&
    summary.isEnabled &&
    daysLeft !== null &&
    daysLeft <= SCHEDULE_WARN_DAYS
  ) {
    tasks.push({
      title: `자동화 일정표 ${daysLeft}일 남음`,
      detail: "다음 일정표를 올려 주세요",
      href: "/dashboard/bot?tab=schedule",
      action: "일정표 보기",
    });
  }

  return (
    <PageContainer className="gap-6 md:px-8 md:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">대시보드</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => statistics.refetch()}
          disabled={statistics.isFetching}
        >
          <RefreshCw className={statistics.isFetching ? "animate-spin" : ""} />
          새로고침
        </Button>
      </div>

      <KpiStrip>
        <KpiItem
          title="전체 사용자"
          tooltip="서비스에 등록된 전체 사용자 수입니다."
          value={totalUsers}
          delta={calculateWeeklyChangeRate(
            users?.newUsersToday ?? 0,
            users?.newUsersThisWeek ?? 0,
          )}
          footer={`오늘 +${users?.newUsersToday ?? 0}명`}
        />
        <KpiItem
          title="전체 주문"
          tooltip="누적 주문 건수입니다."
          value={totalOrders}
          delta={calculateWeeklyChangeRate(
            orders?.ordersToday ?? 0,
            orders?.ordersThisWeek ?? 0,
          )}
          footer={`오늘 +${orders?.ordersToday ?? 0}건`}
        />
        <KpiItem
          title="활동 크리에이터"
          tooltip="현재 활동 중인 크리에이터 수입니다."
          value={creators?.totalActiveCreators ?? 0}
          footer={
            pending > 0 ? (
              <>
                신청 대기 {pending}건 ·
                <Link
                  href="/dashboard/creators?status=PENDING"
                  className="text-foreground font-medium hover:underline"
                >
                  검토하기
                </Link>
              </>
            ) : (
              "대기 중인 신청 없음"
            )
          }
        />
        <KpiItem
          title="총 매출"
          tooltip="취소를 제외한 누적 매출입니다."
          prefix="₩"
          value={won(orders?.totalRevenue)}
          delta={calculateWeeklyChangeRate(
            parseFloat(orders?.revenueToday || "0"),
            parseFloat(orders?.revenueThisWeek || "0"),
          )}
          footer={`오늘 ₩${won(orders?.revenueToday).toLocaleString()}`}
        />
      </KpiStrip>

      {/* 넓은 왼쪽은 주문·자동화, 좁은 오른쪽은 요약. 두 열 아래 끝을 맞춤 */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-3 lg:col-span-2">
          <Card className="gap-0 py-0">
            <PanelHeader
              title="주문 현황"
              aside={
                <span className="text-muted-foreground text-xs">
                  누적 {totalOrders.toLocaleString()}건 · 평균 ₩
                  {won(orders?.avgOrderValue).toLocaleString()}
                </span>
              }
            />
            <div className="flex flex-col gap-3 px-4 py-3.5">
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>
                  이번 주 주문{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    {(orders?.ordersThisWeek ?? 0).toLocaleString()}건
                  </span>
                </span>
                <span>
                  이번 달 매출{" "}
                  <span className="text-foreground font-medium tabular-nums">
                    ₩{won(orders?.revenueThisMonth).toLocaleString()}
                  </span>
                </span>
              </div>
              <div
                className="bg-muted flex h-2 gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={segments
                  .map(
                    (s) =>
                      `${s.label} ${percent(s.value, totalOrders).toFixed(1)}%`,
                  )
                  .join(", ")}
              >
                {segments.map((s) => (
                  <span
                    key={s.label}
                    className={s.color}
                    style={{ width: `${percent(s.value, totalOrders)}%` }}
                  />
                ))}
              </div>
              <div>
                {segments.map((s) => (
                  <Row
                    key={s.label}
                    label={s.label}
                    dot={s.color}
                    value={
                      <>
                        {s.value.toLocaleString()}
                        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                          {percent(s.value, totalOrders).toFixed(1)}%
                        </span>
                      </>
                    }
                  />
                ))}
              </div>
            </div>
          </Card>
          <BotSummaryCard
            summary={summary}
            loading={bot.isPending}
            className="lg:flex-1"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <Card className="gap-0 py-0">
            <PanelHeader
              title="처리할 일"
              aside={
                tasks.length > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {tasks.length}건
                  </span>
                )
              }
            />
            <div>
              {tasks.length > 0 ? (
                tasks.map((task) => <Task key={task.title} {...task} />)
              ) : (
                <p className="text-muted-foreground px-4 py-3">
                  처리할 일이 없습니다
                </p>
              )}
            </div>
          </Card>
          <Card className="gap-0 py-0">
            <PanelHeader
              title="사용자 활동"
              aside={
                <span className="text-muted-foreground text-xs">최근 30일</span>
              }
            />
            <div className="flex flex-wrap items-center gap-5 px-4 py-3.5">
              <div className="relative size-24 shrink-0">
                <svg
                  viewBox="0 0 96 96"
                  className="size-full"
                  role="img"
                  aria-label={`활성 사용자 ${activeRate.toFixed(1)}%`}
                >
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    strokeWidth="10"
                    className="stroke-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    fill="none"
                    strokeWidth="10"
                    // 아주 작은 값은 둥근 끝이 점으로 보여 각지게
                    strokeLinecap={activeRate >= 3 ? "round" : "butt"}
                    className="stroke-chart-1"
                    strokeDasharray={`${(activeRate / 100) * ring} ${ring}`}
                    transform="rotate(-90 48 48)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-semibold tabular-nums">
                    {activeRate.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground text-xs">활성</span>
                </div>
              </div>
              <div className="min-w-40 flex-1">
                <Row
                  label="활성 사용자"
                  value={(users?.activeUsers ?? 0).toLocaleString()}
                />
                <Row
                  label="이번 주 신규"
                  value={`+${(users?.newUsersThisWeek ?? 0).toLocaleString()}`}
                />
                <Row
                  label="크리에이터"
                  value={(users?.totalCreators ?? 0).toLocaleString()}
                />
              </div>
            </div>
          </Card>
          <Card className="gap-0 py-0">
            <PanelHeader
              title="서버 상태"
              aside={
                health && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5",
                      !healthy && "border-destructive/30 text-destructive",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        healthy ? "bg-green-600" : "bg-destructive",
                      )}
                    />
                    {healthy ? "정상" : "확인 필요"}
                  </Badge>
                )
              }
            />
            {metrics && health ? (
              <div className="grid grid-cols-2">
                {[
                  ["가동 시간", formatUptime(health.uptime)],
                  [
                    "평균 지연",
                    `${Math.round(metrics.http.avgResponseTime)}ms`,
                  ],
                  [errors.title, `${(errors.rate * 100).toFixed(2)}%`],
                  ["힙 사용", `${Math.round(heapRate)}%`],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={cn(
                      "px-4 py-3",
                      index % 2 === 0 && "border-r",
                      index >= 2 && "border-t",
                    )}
                  >
                    <div className="text-muted-foreground text-xs">{label}</div>
                    <div
                      className={cn(
                        "mt-0.5 text-lg font-semibold tabular-nums",
                        label === errors.title &&
                          errors.warn &&
                          "text-destructive",
                      )}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground px-4 py-8 text-center">
                {monitoring.isPending
                  ? "불러오는 중"
                  : "데이터를 불러올 수 없습니다"}
              </div>
            )}
            <div className="border-t px-4 py-2.5">
              <Link
                href="/dashboard/monitoring"
                className="text-xs font-medium hover:underline"
              >
                상세 지표 보기
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
